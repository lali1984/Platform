
-- ============================================
-- UPDATED INITIALIZATION SCRIPT FOR AUTH_DB
-- Updated to match TypeORM entities
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables
DROP TABLE IF EXISTS auth_events CASCADE;
DROP TABLE IF EXISTS email_verification_tokens CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- MAIN TABLES - UPDATED TO MATCH ENTITY
-- ============================================

-- Users table (updated to match UserEntity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Обновлено для соответствия entity
    is_email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Basic info
    username VARCHAR(30) UNIQUE,
    
    -- Личные данные (добавлено)
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Status flags
    is_active BOOLEAN DEFAULT TRUE,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    
    -- 2FA (обновлено для соответствия entity)
    is_two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    backup_codes TEXT[],
    
    -- Reset password (добавлено)
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    
    -- Link to user_profiles in user_db
    profile_id UUID UNIQUE,
    
    -- Audit fields
    created_by UUID,
    updated_by UUID
);

-- Остальные таблицы остаются без изменений
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(255) NOT NULL,
    access_token_hash VARCHAR(255),
    refresh_token_hash VARCHAR(255),
    
    device_id VARCHAR(255),
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked BOOLEAN DEFAULT FALSE,
    revocation_reason VARCHAR(100),
    
    fingerprint JSONB
);


-- Refresh tokens table (redundancy for Redis)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    
    -- Metadata
    device_id VARCHAR(255),
    family_id UUID, -- For token rotation
    parent_token_hash VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE,
    
    -- Security info
    ip_address INET,
    user_agent TEXT
);

-- ============================================
-- TOKEN TABLES
-- ============================================

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    
    -- Token metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    
    -- Security
    ip_address INET,
    user_agent TEXT
);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    
    -- For email change
    new_email VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- AUDIT AND EVENT TABLES
-- ============================================

-- Authentication events (for security monitoring)
CREATE TABLE auth_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL,
    event_subtype VARCHAR(50),
    success BOOLEAN NOT NULL,
    error_code VARCHAR(50),
    error_message TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_profile_id ON users(profile_id) WHERE profile_id IS NOT NULL;

-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token_hash ON sessions(session_token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_revoked ON sessions(revoked) WHERE revoked = TRUE;

-- Refresh tokens indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_family_id ON refresh_tokens(family_id) WHERE family_id IS NOT NULL;
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Password reset tokens indexes
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Email verification tokens indexes
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_token_hash ON email_verification_tokens(token_hash);

-- Auth events indexes
CREATE INDEX idx_auth_events_user_id ON auth_events(user_id);
CREATE INDEX idx_auth_events_event_type ON auth_events(event_type);
CREATE INDEX idx_auth_events_success ON auth_events(success);
CREATE INDEX idx_auth_events_created_at ON auth_events(created_at);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Active sessions view
CREATE VIEW active_sessions AS
SELECT 
    s.*,
    u.email,
    u.username
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.revoked = FALSE 
    AND s.expires_at > NOW()
    AND u.is_active = TRUE;

-- User sessions summary
CREATE VIEW user_sessions_summary AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(s.id) as total_sessions,
    COUNT(CASE WHEN s.revoked = FALSE AND s.expires_at > NOW() THEN 1 END) as active_sessions,
    MAX(s.last_activity_at) as last_activity
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
GROUP BY u.id, u.email;

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to log authentication events
CREATE OR REPLACE FUNCTION log_auth_event(
    p_user_id UUID,
    p_event_type VARCHAR(50),
    p_success BOOLEAN,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO auth_events (
        user_id,
        event_type,
        success,
        error_message,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_event_type,
        p_success,
        p_error_message,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA (OPTIONAL)
-- ============================================

-- Insert test user (password: Password123!)
INSERT INTO users (email, password_hash, username, email_verified, is_active) 
VALUES (
    'admin@platform.local',
    '$2b$10$YourHashedPasswordHere', -- Replace with actual hash
    'admin',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- FINAL MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Auth database initialized successfully';
    RAISE NOTICE 'Tables created: users, sessions, refresh_tokens, password_reset_tokens, email_verification_tokens, auth_events';
END $$;