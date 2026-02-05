-- ============================================
-- CREATE DATABASE USERS FOR PRODUCTION
-- Principle of Least Privilege (PoLP)
-- ============================================

-- ============================================
-- AUTH_DB USERS
-- ============================================

-- Create auth_service user with minimal required privileges
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'auth_service') THEN
        CREATE USER auth_service WITH PASSWORD '${AUTH_SERVICE_PASSWORD}';
        RAISE NOTICE 'Created auth_service user';
    ELSE
        -- Update password without dropping user (preserves existing privileges)
        EXECUTE format('ALTER USER auth_service WITH PASSWORD %L', '${AUTH_SERVICE_PASSWORD}');
        RAISE NOTICE 'Updated password for existing auth_service user';
    END IF;
END $$;

-- Grant minimal required privileges
GRANT CONNECT ON DATABASE auth_db TO auth_service;
GRANT USAGE ON SCHEMA public TO auth_service;

-- Grant specific privileges on tables (not ALL TABLES)
GRANT SELECT, INSERT, UPDATE, DELETE ON 
  users,
  sessions,
  refresh_tokens,
  password_reset_tokens,
  email_verification_tokens,
  auth_events,
  outbox_events,
  roles,
  permissions,
  user_roles,
  role_permissions
TO auth_service;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO auth_service;

-- Grant execute on specific functions only
GRANT EXECUTE ON FUNCTION 
  update_updated_at_column(),
  log_auth_event(UUID, VARCHAR, BOOLEAN, INET, TEXT, TEXT),
  assign_default_user_role()
TO auth_service;

-- ============================================
-- USER_DB USERS  
-- ============================================

-- Create user_service user
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'user_service') THEN
        CREATE USER user_service WITH PASSWORD '${USER_SERVICE_PASSWORD}';
        RAISE NOTICE 'Created user_service user';
    ELSE
        EXECUTE format('ALTER USER user_service WITH PASSWORD %L', '${USER_SERVICE_PASSWORD}');
        RAISE NOTICE 'Updated password for existing user_service user';
    END IF;
END $$;

-- Grant minimal required privileges
GRANT CONNECT ON DATABASE user_db TO user_service;
GRANT USAGE ON SCHEMA public TO user_service;

-- Specific table privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON 
  user_profiles,
  user_preferences,
  outbox_events
  -- Add other tables as needed
TO user_service;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO user_service;

-- ============================================
-- EVENT_RELAY USERS (read-only for polling)
-- ============================================

-- Create event_relay_auth user (read-only access to auth_db)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'event_relay_auth') THEN
        CREATE USER event_relay_auth WITH PASSWORD '${EVENT_RELAY_AUTH_PASSWORD}';
        RAISE NOTICE 'Created event_relay_auth user';
    ELSE
        EXECUTE format('ALTER USER event_relay_auth WITH PASSWORD %L', '${EVENT_RELAY_AUTH_PASSWORD}');
        RAISE NOTICE 'Updated password for existing event_relay_auth user';
    END IF;
END $$;

GRANT CONNECT ON DATABASE auth_db TO event_relay_auth;
GRANT SELECT ON 
  outbox_events,
  users  -- For user_id validation if needed
TO event_relay_auth;

-- Create event_relay_user user (read-only access to user_db)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'event_relay_user') THEN
        CREATE USER event_relay_user WITH PASSWORD '${EVENT_RELAY_USER_PASSWORD}';
        RAISE NOTICE 'Created event_relay_user user';
    ELSE
        EXECUTE format('ALTER USER event_relay_user WITH PASSWORD %L', '${EVENT_RELAY_USER_PASSWORD}');
        RAISE NOTICE 'Updated password for existing event_relay_user user';
    END IF;
END $$;

GRANT CONNECT ON DATABASE user_db TO event_relay_user;
GRANT SELECT ON 
  outbox_events,
  user_profiles  -- For validation if needed
TO event_relay_user;

-- ============================================
-- MONITORING USER (for postgres-exporter)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'monitoring_user') THEN
        CREATE USER monitoring_user WITH PASSWORD '${MONITORING_USER_PASSWORD}';
        RAISE NOTICE 'Created monitoring_user';
    ELSE
        EXECUTE format('ALTER USER monitoring_user WITH PASSWORD %L', '${MONITORING_USER_PASSWORD}');
        RAISE NOTICE 'Updated password for existing monitoring_user';
    END IF;
END $$;

-- Grant monitoring role (available in PostgreSQL 10+)
GRANT pg_monitor TO monitoring_user;

-- Alternative for older PostgreSQL or more granular permissions:
GRANT CONNECT ON DATABASE auth_db TO monitoring_user;
GRANT CONNECT ON DATABASE user_db TO monitoring_user;
GRANT SELECT ON pg_stat_database TO monitoring_user;
GRANT SELECT ON pg_stat_user_tables TO monitoring_user;

-- ============================================
-- DEFAULT PRIVILEGES FOR FUTURE TABLES
-- ============================================

-- For auth_db
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO auth_service;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO event_relay_auth;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO monitoring_user;

-- For user_db
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO user_service;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO event_relay_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO monitoring_user;

-- ============================================
-- SECURITY ENHANCEMENTS
-- ============================================

-- Set statement timeout for service users (prevent long-running queries)
ALTER USER auth_service SET statement_timeout = '30s';
ALTER USER user_service SET statement_timeout = '30s';
ALTER USER event_relay_auth SET statement_timeout = '30s';
ALTER USER event_relay_user SET statement_timeout = '30s';

-- Set idle session timeout
ALTER USER auth_service SET idle_in_transaction_session_timeout = '60s';
ALTER USER user_service SET idle_in_transaction_session_timeout = '60s';

-- Disable password expiration for service accounts (optional, depends on security policy)
-- ALTER USER auth_service VALID UNTIL 'infinity';
-- ALTER USER user_service VALID UNTIL 'infinity';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count 
    FROM pg_catalog.pg_roles 
    WHERE rolname IN ('auth_service', 'user_service', 'event_relay_auth', 'event_relay_user', 'monitoring_user');
    
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ Database users configured successfully';
    RAISE NOTICE '   Total service users: %', user_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Applied security measures:';
    RAISE NOTICE '   • Minimal required privileges';
    RAISE NOTICE '   • Principle of Least Privilege (PoLP)';
    RAISE NOTICE '   • Statement timeout: 30s';
    RAISE NOTICE '   • Idle session timeout: 60s';
    RAISE NOTICE '   • Password placeholders for production';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT:';
    RAISE NOTICE '   Replace password placeholders ${..._PASSWORD}';
    RAISE NOTICE '   with secure values from environment variables';
    RAISE NOTICE '============================================';
END $$;