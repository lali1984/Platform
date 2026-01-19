-- ============================================
-- INITIALIZATION SCRIPT FOR USER_DB
-- Database: user_db
-- Purpose: User profiles, business data, preferences
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables
DROP TABLE IF EXISTS user_audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS company_members CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================
-- CORE USER TABLES
-- ============================================

-- User profiles (extended information)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Link to auth_db.users
    user_id UUID UNIQUE NOT NULL,
    
    -- Personal information
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Location
    country VARCHAR(2), -- ISO 3166-1 alpha-2
    region VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    locale VARCHAR(10) DEFAULT 'en-US',
    
    -- Professional information
    job_title VARCHAR(100),
    company VARCHAR(100),
    department VARCHAR(100),
    website TEXT,
    social_links JSONB DEFAULT '{}', -- {linkedin: '', github: '', twitter: ''}
    
    -- Metadata
    profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
    last_active_at TIMESTAMP WITH TIME ZONE,
    profile_views INTEGER DEFAULT 0,
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT valid_country_code CHECK (country IS NULL OR (LENGTH(country) = 2 AND country ~ '^[A-Z]{2}$'))
);

-- User preferences (settings)
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    newsletter_subscribed BOOLEAN DEFAULT FALSE,
    
    -- Privacy settings
    profile_visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'private', 'contacts_only', 'hidden'
    show_online_status BOOLEAN DEFAULT TRUE,
    show_last_seen BOOLEAN DEFAULT TRUE,
    allow_messages_from VARCHAR(20) DEFAULT 'everyone', -- 'everyone', 'contacts', 'none'
    
    -- UI/UX preferences
    theme VARCHAR(20) DEFAULT 'system', -- 'light', 'dark', 'system'
    language VARCHAR(10) DEFAULT 'en',
    time_format VARCHAR(10) DEFAULT '24h', -- '12h', '24h'
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    week_starts_on VARCHAR(10) DEFAULT 'monday', -- 'monday', 'sunday'
    
    -- Security preferences
    login_notifications BOOLEAN DEFAULT TRUE,
    new_device_notifications BOOLEAN DEFAULT TRUE,
    
    -- Accessibility
    reduced_motion BOOLEAN DEFAULT FALSE,
    high_contrast BOOLEAN DEFAULT FALSE,
    font_size VARCHAR(20) DEFAULT 'normal', -- 'small', 'normal', 'large', 'xlarge'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Validation
    CONSTRAINT valid_visibility CHECK (profile_visibility IN ('public', 'private', 'contacts_only', 'hidden')),
    CONSTRAINT valid_theme CHECK (theme IN ('light', 'dark', 'system')),
    CONSTRAINT valid_time_format CHECK (time_format IN ('12h', '24h')),
    CONSTRAINT valid_week_start CHECK (week_starts_on IN ('monday', 'sunday'))
);

-- ============================================
-- BUSINESS TABLES
-- ============================================

-- Companies/organizations
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    industry VARCHAR(100),
    size VARCHAR(50), -- '1-10', '11-50', '51-200', '201-500', '500+'
    founded_year INTEGER,
    
    -- Legal information
    legal_name VARCHAR(255),
    tax_id VARCHAR(50), -- VAT/TAX ID
    registration_number VARCHAR(100),
    legal_address TEXT,
    billing_address TEXT,
    
    -- Contact information
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- Social media
    social_links JSONB DEFAULT '{}',
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'suspended'
    verification_data JSONB, -- Documents and verification info
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Search optimization
    search_vector TSVECTOR,
    
    -- Constraints
    FOREIGN KEY (owner_id) REFERENCES user_profiles(id) ON DELETE RESTRICT,
    
    -- Validation
    CONSTRAINT valid_size CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
    CONSTRAINT valid_verification_status CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended'))
);

-- Company members (many-to-many)
CREATE TABLE company_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Role and permissions
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'manager', 'member', 'guest'
    permissions JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    invited_by UUID,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(company_id, user_id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Validation
    CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'manager', 'member', 'guest'))
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Status and timeline
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'planning', 'active', 'paused', 'completed', 'cancelled', 'archived'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    start_date DATE,
    end_date DATE,
    deadline DATE,
    
    -- Financials
    budget DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    actual_cost DECIMAL(15,2),
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    categories JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    FOREIGN KEY (owner_id) REFERENCES user_profiles(id) ON DELETE RESTRICT,
    
    -- Validation
    CONSTRAINT valid_status CHECK (status IN ('draft', 'planning', 'active', 'paused', 'completed', 'cancelled', 'archived')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Project members
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Role
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'owner', 'manager', 'member', 'viewer'
    permissions JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(project_id, user_id),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Validation
    CONSTRAINT valid_role CHECK (role IN ('owner', 'manager', 'member', 'viewer'))
);

-- ============================================
-- NOTIFICATION SYSTEM
-- ============================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    
    -- Content
    type VARCHAR(50) NOT NULL, -- 'system', 'project', 'message', 'reminder', 'alert', 'invitation'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Metadata
    data JSONB DEFAULT '{}', -- Additional data for deep linking
    related_entity_type VARCHAR(50), -- 'user', 'project', 'company', 'message'
    related_entity_id UUID,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Delivery
    delivery_method VARCHAR(20) DEFAULT 'in_app', -- 'in_app', 'email', 'push', 'all'
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_via_push BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Validation
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT valid_delivery_method CHECK (delivery_method IN ('in_app', 'email', 'push', 'all'))
);

-- ============================================
-- AUDIT SYSTEM
-- ============================================

-- Audit logs for user service
CREATE TABLE user_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who
    user_id UUID,
    actor_id UUID, -- Who performed the action (if different from user_id)
    
    -- What
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'user_profile', 'company', 'project', 'preference'
    entity_id UUID NOT NULL,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    location_info JSONB,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes will be created separately
    CONSTRAINT valid_action_length CHECK (LENGTH(action) <= 100)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_display_name ON user_profiles(display_name);
CREATE INDEX idx_user_profiles_email_search ON user_profiles((LOWER(email)));
CREATE INDEX idx_user_profiles_country_city ON user_profiles(country, city);
CREATE INDEX idx_user_profiles_last_active_at ON user_profiles(last_active_at);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- User preferences indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_theme ON user_preferences(theme);
CREATE INDEX idx_user_preferences_language ON user_preferences(language);

-- Companies indexes
CREATE INDEX idx_companies_owner_id ON companies(owner_id);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_verification_status ON companies(verification_status);
CREATE INDEX idx_companies_created_at ON companies(created_at);

-- Company members indexes
CREATE INDEX idx_company_members_user_id ON company_members(user_id);
CREATE INDEX idx_company_members_company_id ON company_members(company_id);
CREATE INDEX idx_company_members_role ON company_members(role);
CREATE INDEX idx_company_members_is_active ON company_members(is_active) WHERE is_active = TRUE;

-- Projects indexes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- Project members indexes
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_role ON project_members(role);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- Audit logs indexes
CREATE INDEX idx_user_audit_logs_user_id ON user_audit_logs(user_id);
CREATE INDEX idx_user_audit_logs_actor_id ON user_audit_logs(actor_id);
CREATE INDEX idx_user_audit_logs_entity_type_entity_id ON user_audit_logs(entity_type, entity_id);
CREATE INDEX idx_user_audit_logs_action ON user_audit_logs(action);
CREATE INDEX idx_user_audit_logs_created_at ON user_audit_logs(created_at);

-- ============================================
-- FULL-TEXT SEARCH INDEXES
-- ============================================

-- Update search_vector trigger for companies
CREATE OR REPLACE FUNCTION companies_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_search_vector_trigger
    BEFORE INSERT OR UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION companies_search_vector_update();

-- Create GIN index for fast text search
CREATE INDEX idx_companies_search_vector ON companies USING GIN(search_vector);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables that need updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_updated_at_column();

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completion INTEGER := 0;
    profile_record RECORD;
BEGIN
    SELECT * INTO profile_record FROM user_profiles WHERE id = user_profile_id;
    
    -- Calculate completion based on filled fields
    IF profile_record.first_name IS NOT NULL THEN completion := completion + 15; END IF;
    IF profile_record.last_name IS NOT NULL THEN completion := completion + 15; END IF;
    IF profile_record.display_name IS NOT NULL THEN completion := completion + 10; END IF;
    IF profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) > 10 THEN completion := completion + 10; END IF;
    IF profile_record.avatar_url IS NOT NULL THEN completion := completion + 10; END IF;
    IF profile_record.job_title IS NOT NULL THEN completion := completion + 10; END IF;
    IF profile_record.company IS NOT NULL THEN completion := completion + 10; END IF;
    IF profile_record.country IS NOT NULL THEN completion := completion + 10; END IF;
    IF profile_record.social_links IS NOT NULL AND profile_record.social_links != '{}'::jsonb THEN completion := completion + 10; END IF;
    
    -- Cap at 100
    IF completion > 100 THEN completion := 100; END IF;
    
    RETURN completion;
END;
$$ LANGUAGE plpgsql;

-- Function to create default preferences when profile is created
CREATE OR REPLACE FUNCTION create_default_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_preferences_trigger
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_preferences();

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_user_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields TEXT[];
    field_name TEXT;
    old_value JSONB;
    new_value JSONB;
BEGIN
    -- Get changed fields
    changed_fields := ARRAY[]::TEXT[];
    
    -- Compare old and new values for each column
    FOR field_name IN SELECT column_name FROM information_schema.columns WHERE table_name = TG_TABLE_NAME LOOP
        EXECUTE format('SELECT ($1.%I)::text, ($2.%I)::text', field_name, field_name)
        INTO old_value, new_value
        USING OLD, NEW;
        
        IF old_value IS DISTINCT FROM new_value THEN
            changed_fields := array_append(changed_fields, field_name);
        END IF;
    END LOOP;
    
    -- Insert audit record
    INSERT INTO user_audit_logs (
        user_id,
        actor_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        changed_fields
    ) VALUES (
        NEW.user_id,
        NEW.updated_by,
        TG_OP, -- INSERT, UPDATE, DELETE
        TG_TABLE_NAME,
        NEW.id,
        row_to_json(OLD)::jsonb,
        row_to_json(NEW)::jsonb,
        changed_fields
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER user_profiles_audit_trigger
    AFTER INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_user_audit_event();

CREATE TRIGGER companies_audit_trigger
    AFTER INSERT OR UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION log_user_audit_event();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Complete user profile view
CREATE VIEW complete_user_profiles AS
SELECT 
    up.*,
    prefs.theme,
    prefs.language,
    prefs.profile_visibility,
    prefs.email_notifications
FROM user_profiles up
LEFT JOIN user_preferences prefs ON up.id = prefs.user_id;

-- User statistics view
CREATE VIEW user_statistics AS
SELECT 
    up.id as profile_id,
    up.user_id,
    up.display_name,
    COUNT(DISTINCT cm.company_id) as company_count,
    COUNT(DISTINCT pm.project_id) as project_count,
    COUNT(DISTINCT n.id) FILTER (WHERE NOT n.is_read) as unread_notifications,
    up.last_active_at,
    up.profile_completion_percentage
FROM user_profiles up
LEFT JOIN company_members cm ON up.id = cm.user_id AND cm.is_active = TRUE
LEFT JOIN project_members pm ON up.id = pm.user_id
LEFT JOIN notifications n ON up.id = n.user_id AND NOT n.is_read
GROUP BY up.id, up.user_id, up.display_name, up.last_active_at, up.profile_completion_percentage;

-- Recent activity view
CREATE VIEW recent_user_activity AS
SELECT 
    user_id,
    MAX(last_active_at) as last_seen,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as actions_last_7_days,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as actions_last_30_days
FROM (
    SELECT user_id, last_active_at, created_at FROM user_profiles
    UNION ALL
    SELECT user_id, created_at, created_at FROM notifications
    UNION ALL
    SELECT user_id, created_at, created_at FROM user_audit_logs
) AS activity
GROUP BY user_id;

-- ============================================
-- INITIAL TEST DATA (DEVELOPMENT ONLY)
-- ============================================

-- Insert test user profile (linked to auth user)
INSERT INTO user_profiles (
    user_id,
    first_name,
    last_name,
    display_name,
    email,
    bio,
    job_title,
    company,
    country,
    city,
    profile_completion_percentage
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- Should match auth user ID
    'Admin',
    'User',
    'Platform Admin',
    'admin@platform.local',
    'System administrator with full access to the platform',
    'System Administrator',
    'Platform Ecosystem',
    'US',
    'San Francisco',
    100
) ON CONFLICT (user_id) DO NOTHING;

-- Insert test company
INSERT INTO companies (
    owner_id,
    name,
    description,
    industry,
    size,
    website,
    is_verified
) 
SELECT 
    up.id,
    'Platform Ecosystem Inc.',
    'Company developing the platform ecosystem microservices',
    'Technology',
    '1-10',
    'https://platform.local',
    TRUE
FROM user_profiles up 
WHERE up.user_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- ============================================
-- FINAL MESSAGE
-- ============================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    RAISE NOTICE 'User database initialized successfully with % tables', table_count;
    RAISE NOTICE 'Core tables: user_profiles, user_preferences, companies, projects, notifications, audit_logs';
END $$;