-- ============================================
-- CREATE SEPARATE DATABASE USERS FOR SECURITY
-- ============================================

-- ============================================
-- AUTH_DB USERS
-- ============================================

-- Drop existing users if they exist
DROP USER IF EXISTS auth_service;
DROP USER IF EXISTS event_relay_auth;

-- Create auth_service user (только для auth-service)
CREATE USER auth_service WITH PASSWORD 'AuthServiceSecurePass2026!';
GRANT CONNECT ON DATABASE auth_db TO auth_service;

-- Grant privileges on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO auth_service;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO auth_service;

-- Grant specific table privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE 
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

-- Grant usage on functions
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO auth_service;
GRANT EXECUTE ON FUNCTION log_auth_event(
  UUID, VARCHAR, BOOLEAN, INET, TEXT, TEXT
) TO auth_service;
GRANT EXECUTE ON FUNCTION assign_default_user_role() TO auth_service;

-- ============================================
-- USER_DB USERS
-- ============================================

-- Drop existing users if they exist
DROP USER IF EXISTS user_service;
DROP USER IF EXISTS event_relay_user;

-- Create user_service user (только для user-service)
CREATE USER user_service WITH PASSWORD 'UserServiceSecurePass2026!';
GRANT CONNECT ON DATABASE user_db TO user_service;

-- Grant privileges on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO user_service;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO user_service;

-- Grant specific table privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE 
  user_profiles,
  user_preferences,
  companies,
  company_members,
  projects,
  project_members,
  notifications,
  user_audit_logs,
  outbox_events
TO user_service;

-- ============================================
-- EVENT_RELAY USERS (только чтение для репликации)
-- ============================================

-- Create event_relay_auth user (только чтение)
CREATE USER event_relay_auth WITH PASSWORD 'EventRelayAuthSecurePass2026!';
GRANT CONNECT ON DATABASE auth_db TO event_relay_auth;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO event_relay_auth;

-- Create event_relay_user user (только чтение)
CREATE USER event_relay_user WITH PASSWORD 'EventRelayUserSecurePass2026!';
GRANT CONNECT ON DATABASE user_db TO event_relay_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO event_relay_user;

-- ============================================
-- MONITORING USER
-- ============================================

DROP USER IF EXISTS monitoring_user;

CREATE USER monitoring_user WITH PASSWORD 'MonitoringSecurePass2026!';
GRANT CONNECT ON DATABASE auth_db TO monitoring_user;
GRANT CONNECT ON DATABASE user_db TO monitoring_user;

-- Grant read-only access for monitoring
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring_user;
GRANT EXECUTE ON FUNCTION pg_stat_activity() TO monitoring_user;

-- ============================================
-- FINAL SETUP
-- ============================================

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO auth_service;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO user_service;

-- ============================================
-- SECURITY POLICIES (Row Level Security)
-- ============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Database users created successfully';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Users created:';
  RAISE NOTICE '  - auth_service (auth_db, full access)';
  RAISE NOTICE '  - user_service (user_db, full access)';
  RAISE NOTICE '  - event_relay_auth (auth_db, read-only)';
  RAISE NOTICE '  - event_relay_user (user_db, read-only)';
  RAISE NOTICE '  - monitoring_user (both DBs, read-only)';
  RAISE NOTICE '============================================';
END $$;