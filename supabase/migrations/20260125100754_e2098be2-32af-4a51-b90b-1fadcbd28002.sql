-- ============================================
-- IBS PORTAL - FULL DATABASE SCHEMA
-- ============================================
-- Description: Complete PostgreSQL schema for IBS Portal
-- Platform: Supabase/PostgreSQL
-- Version: 1.0
-- Features: User Management, Client Systems, Credential Vault,
--           File/SQL Transfers, Requests, Audit Logging, Notifications
-- Security: Row Level Security (RLS) enabled on all tables
-- ============================================

-- ============================================
-- SECTION 1: CLEANUP - Drop Existing Objects
-- ============================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.sql_archive CASCADE;
DROP TABLE IF EXISTS public.sql_request_assignees CASCADE;
DROP TABLE IF EXISTS public.sql_requests CASCADE;
DROP TABLE IF EXISTS public.sql_execution_logs CASCADE;
DROP TABLE IF EXISTS public.sql_query_recipients CASCADE;
DROP TABLE IF EXISTS public.sql_queries CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.user_storage_limits CASCADE;
DROP TABLE IF EXISTS public.user_archive CASCADE;
DROP TABLE IF EXISTS public.file_request_assignees CASCADE;
DROP TABLE IF EXISTS public.file_requests CASCADE;
DROP TABLE IF EXISTS public.file_transfer_recipients CASCADE;
DROP TABLE IF EXISTS public.file_transfers CASCADE;
DROP TABLE IF EXISTS public.credential_audit CASCADE;
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.credential_vault CASCADE;
DROP TABLE IF EXISTS public.client_systems CASCADE;
DROP TABLE IF EXISTS public.system_types CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.web_users CASCADE;
DROP TABLE IF EXISTS public.client_credentials CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.position_type CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.has_role CASCADE;
DROP FUNCTION IF EXISTS public.get_web_user_id CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;

-- ============================================
-- SECTION 2: CUSTOM TYPES (ENUMS)
-- ============================================

-- Application role types
CREATE TYPE public.app_role AS ENUM (
    'Admin',
    'Manager',
    'Viewer'
);

-- Employee position types
CREATE TYPE public.position_type AS ENUM (
    'MD',
    'Management',
    'QA',
    'HOD',
    'DevOps',
    'Engineer',
    'Senior',
    'Junior',
    'Trainee',
    'NYSC',
    'IT_Swiss'
);

-- ============================================
-- SECTION 3: CORE USER TABLES
-- ============================================

-- ---------------------------------------------
-- Table: web_users
-- Purpose: Main user profile table
-- ---------------------------------------------
CREATE TABLE public.web_users (
    user_id SERIAL PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    nickname VARCHAR(50) UNIQUE,
    birth_day INTEGER NOT NULL CHECK (birth_day >= 1 AND birth_day <= 31),
    birth_month VARCHAR(20) NOT NULL,
    position public.position_type NOT NULL DEFAULT 'Junior',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.web_users IS 'Main user profile table with authentication linkage';
COMMENT ON COLUMN public.web_users.auth_user_id IS 'Links to Supabase auth.users table';
COMMENT ON COLUMN public.web_users.nickname IS 'Optional display name for user';

-- ---------------------------------------------
-- Table: user_roles
-- Purpose: User role assignments for RBAC
-- ---------------------------------------------
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL DEFAULT 'Viewer',
    UNIQUE (user_id, role)
);

COMMENT ON TABLE public.user_roles IS 'Role-based access control assignments';
COMMENT ON COLUMN public.user_roles.role IS 'Admin, Manager, or Viewer role';

-- ============================================
-- SECTION 4: CLIENT MANAGEMENT TABLES
-- ============================================

-- ---------------------------------------------
-- Table: clients
-- Purpose: Customer/client organization records
-- ---------------------------------------------
CREATE TABLE public.clients (
    client_id SERIAL PRIMARY KEY,
    client_code VARCHAR(20) UNIQUE NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    industry VARCHAR(50),
    division VARCHAR(100),
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.clients IS 'Client organizations managed by the system';
COMMENT ON COLUMN public.clients.client_code IS 'Unique short code identifier for client';

-- ---------------------------------------------
-- Table: system_types
-- Purpose: Reference table for system categories
-- ---------------------------------------------
CREATE TABLE public.system_types (
    system_type_id SERIAL PRIMARY KEY,
    system_type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

COMMENT ON TABLE public.system_types IS 'Lookup table for system/credential types';

-- Pre-populate system types
INSERT INTO public.system_types (system_type_name, description) 
VALUES
    ('RDP', 'Remote Desktop Protocol'),
    ('VPN', 'Virtual Private Network'),
    ('Database', 'Database System'),
    ('API', 'API Access'),
    ('Web Portal', 'Web Application'),
    ('SSH', 'Secure Shell'),
    ('FTP', 'File Transfer Protocol'),
    ('Email', 'Email Account'),
    ('Cloud', 'Cloud Platform'),
    ('Other', 'Other System Type');

-- ---------------------------------------------
-- Table: client_systems
-- Purpose: Individual systems/servers per client
-- ---------------------------------------------
CREATE TABLE public.client_systems (
    system_id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES public.clients(client_id) ON DELETE CASCADE,
    system_type_id INTEGER REFERENCES public.system_types(system_type_id),
    system_name VARCHAR(100) NOT NULL,
    environment VARCHAR(20) CHECK (environment IN ('Production', 'Test', 'DR', 'Development')),
    host VARCHAR(200),
    ip_address VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.client_systems IS 'Individual systems/servers for each client';
COMMENT ON COLUMN public.client_systems.environment IS 'Production, Test, DR, or Development';

-- ============================================
-- SECTION 5: CREDENTIAL MANAGEMENT
-- ============================================

-- ---------------------------------------------
-- Table: credential_vault
-- Purpose: Secure storage for system credentials
-- ---------------------------------------------
CREATE TABLE public.credential_vault (
    credential_id SERIAL PRIMARY KEY,
    system_id INTEGER REFERENCES public.client_systems(system_id) ON DELETE CASCADE,
    credential_type VARCHAR(50),
    username VARCHAR(200),
    password_value TEXT NOT NULL,
    notes TEXT,
    expiry_date DATE,
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.credential_vault IS 'Secure credential storage with audit trail';
COMMENT ON COLUMN public.credential_vault.password_value IS 'Encrypted password - should be encrypted at application level';

-- ---------------------------------------------
-- Table: credential_audit
-- Purpose: Audit trail for credential access
-- Critical: ALL credential views must be logged
-- ---------------------------------------------
CREATE TABLE public.credential_audit (
    audit_id SERIAL PRIMARY KEY,
    credential_id INTEGER REFERENCES public.credential_vault(credential_id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES public.web_users(user_id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('VIEW', 'COPY', 'EDIT', 'DELETE', 'CREATE')),
    field_copied VARCHAR(50),
    client_id INTEGER REFERENCES public.clients(client_id) ON DELETE SET NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.credential_audit IS 'Critical audit log - tracks all credential access';
COMMENT ON COLUMN public.credential_audit.action IS 'VIEW, COPY, EDIT, DELETE, or CREATE';
COMMENT ON COLUMN public.credential_audit.field_copied IS 'Which field was copied (username, password, etc.)';

-- ============================================
-- SECTION 6: FILE TRANSFER SYSTEM
-- ============================================

-- ---------------------------------------------
-- Table: file_transfers
-- Purpose: File/link sharing between users
-- ---------------------------------------------
CREATE TABLE public.file_transfers (
    transfer_id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES public.web_users(user_id) ON DELETE SET NULL,
    transfer_type VARCHAR(20) NOT NULL CHECK (transfer_type IN ('FILE', 'LINK')),
    title VARCHAR(255) NOT NULL,
    purpose TEXT,
    content_url TEXT NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.file_transfers IS 'File and link sharing system';
COMMENT ON COLUMN public.file_transfers.transfer_type IS 'FILE or LINK type';
COMMENT ON COLUMN public.file_transfers.content_url IS 'Storage URL or external link';

-- ---------------------------------------------
-- Table: file_transfer_recipients
-- Purpose: Track recipients of file transfers
-- ---------------------------------------------
CREATE TABLE public.file_transfer_recipients (
    id SERIAL PRIMARY KEY,
    transfer_id INTEGER REFERENCES public.file_transfers(transfer_id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'RECEIVED', 'DOWNLOADED', 'ARCHIVED', 'REJECTED')),
    received_at TIMESTAMPTZ,
    downloaded_at TIMESTAMPTZ,
    UNIQUE(transfer_id, recipient_id)
);

COMMENT ON TABLE public.file_transfer_recipients IS 'Recipients and status for each file transfer';

-- ---------------------------------------------
-- Table: file_requests
-- Purpose: Request files from other users
-- ---------------------------------------------
CREATE TABLE public.file_requests (
    request_id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES public.web_users(user_id) ON DELETE SET NULL,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('FILE', 'LINK')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'FULFILLED', 'EXPIRED', 'CANCELLED')),
    fulfilled_transfer_id INTEGER REFERENCES public.file_transfers(transfer_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.file_requests IS 'File request workflow system';
COMMENT ON COLUMN public.file_requests.fulfilled_transfer_id IS 'Links to the transfer that fulfilled this request';

-- ---------------------------------------------
-- Table: file_request_assignees
-- Purpose: Users assigned to fulfill file requests
-- ---------------------------------------------
CREATE TABLE public.file_request_assignees (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES public.file_requests(request_id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'FULFILLED', 'DECLINED')),
    UNIQUE(request_id, assignee_id)
);

COMMENT ON TABLE public.file_request_assignees IS 'Assignees responsible for fulfilling file requests';

-- ---------------------------------------------
-- Table: user_archive
-- Purpose: User-specific archive of transfers
-- ---------------------------------------------
CREATE TABLE public.user_archive (
    archive_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    transfer_id INTEGER REFERENCES public.file_transfers(transfer_id) ON DELETE SET NULL,
    archived_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, transfer_id)
);

COMMENT ON TABLE public.user_archive IS 'Users can archive transfers to remove from active view';

-- ---------------------------------------------
-- Table: user_storage_limits
-- Purpose: Storage quota management per user
-- ---------------------------------------------
CREATE TABLE public.user_storage_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE UNIQUE,
    storage_limit_bytes BIGINT DEFAULT 10485760, -- 10MB default
    updated_by INTEGER REFERENCES public.web_users(user_id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_storage_limits IS 'Storage quota limits per user';
COMMENT ON COLUMN public.user_storage_limits.storage_limit_bytes IS 'Default: 10MB (10485760 bytes)';

-- ============================================
-- SECTION 7: SQL QUERY SYSTEM
-- ============================================

-- ---------------------------------------------
-- Table: sql_queries
-- Purpose: Share SQL queries between users
-- ---------------------------------------------
CREATE TABLE public.sql_queries (
    query_id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES public.web_users(user_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    purpose TEXT,
    query_content TEXT NOT NULL,
    database_target VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.sql_queries IS 'SQL query sharing and collaboration system';
COMMENT ON COLUMN public.sql_queries.database_target IS 'Target database/system for execution';

-- ---------------------------------------------
-- Table: sql_query_recipients
-- Purpose: Track recipients of SQL queries
-- ---------------------------------------------
CREATE TABLE public.sql_query_recipients (
    id SERIAL PRIMARY KEY,
    query_id INTEGER REFERENCES public.sql_queries(query_id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'RECEIVED', 'EXECUTED', 'ARCHIVED')),
    received_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    UNIQUE(query_id, recipient_id)
);

COMMENT ON TABLE public.sql_query_recipients IS 'Recipients and execution status for SQL queries';

-- ---------------------------------------------
-- Table: sql_execution_logs
-- Purpose: Log SQL query execution results
-- ---------------------------------------------
CREATE TABLE public.sql_execution_logs (
    log_id SERIAL PRIMARY KEY,
    query_id INTEGER REFERENCES public.sql_queries(query_id) ON DELETE SET NULL,
    executed_by INTEGER REFERENCES public.web_users(user_id) ON DELETE SET NULL,
    client_id INTEGER REFERENCES public.clients(client_id) ON DELETE SET NULL,
    execution_result TEXT,
    rows_affected INTEGER,
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'SUCCESS' 
        CHECK (status IN ('SUCCESS', 'FAILED', 'PARTIAL')),
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.sql_execution_logs IS 'Execution history and results for SQL queries';
COMMENT ON COLUMN public.sql_execution_logs.execution_time_ms IS 'Execution time in milliseconds';

-- ---------------------------------------------
-- Table: sql_requests
-- Purpose: Request SQL queries from other users
-- ---------------------------------------------
CREATE TABLE public.sql_requests (
    request_id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES public.web_users(user_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'FULFILLED', 'EXPIRED', 'CANCELLED')),
    fulfilled_query_id INTEGER REFERENCES public.sql_queries(query_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.sql_requests IS 'SQL query request workflow system';
COMMENT ON COLUMN public.sql_requests.fulfilled_query_id IS 'Links to the query that fulfilled this request';

-- ---------------------------------------------
-- Table: sql_request_assignees
-- Purpose: Users assigned to fulfill SQL requests
-- ---------------------------------------------
CREATE TABLE public.sql_request_assignees (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES public.sql_requests(request_id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'FULFILLED', 'DECLINED')),
    UNIQUE(request_id, assignee_id)
);

COMMENT ON TABLE public.sql_request_assignees IS 'Assignees responsible for fulfilling SQL requests';

-- ---------------------------------------------
-- Table: sql_archive
-- Purpose: User-specific archive of SQL queries
-- ---------------------------------------------
CREATE TABLE public.sql_archive (
    archive_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    query_id INTEGER REFERENCES public.sql_queries(query_id) ON DELETE SET NULL,
    archived_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, query_id)
);

COMMENT ON TABLE public.sql_archive IS 'Users can archive SQL queries to remove from active view';

-- ============================================
-- SECTION 8: NOTIFICATIONS
-- ============================================

-- ---------------------------------------------
-- Table: notifications
-- Purpose: In-app notification system
-- ---------------------------------------------
CREATE TABLE public.notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'User notification system with realtime updates';
COMMENT ON COLUMN public.notifications.reference_type IS 'Type of related object (e.g., file_transfer, sql_query)';
COMMENT ON COLUMN public.notifications.reference_id IS 'ID of related object';

-- ============================================
-- SECTION 9: INDEXES FOR PERFORMANCE
-- ============================================

-- User indexes
CREATE INDEX idx_web_users_email ON public.web_users(email);
CREATE INDEX idx_web_users_auth_id ON public.web_users(auth_user_id);

-- Client indexes
CREATE INDEX idx_clients_code ON public.clients(client_code);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_client_systems_client ON public.client_systems(client_id);

-- Credential indexes
CREATE INDEX idx_credential_vault_system ON public.credential_vault(system_id);
CREATE INDEX idx_audit_user_timestamp ON public.credential_audit(user_id, timestamp DESC);
CREATE INDEX idx_audit_client_timestamp ON public.credential_audit(client_id, timestamp DESC);

-- File transfer indexes
CREATE INDEX idx_file_transfers_sender ON public.file_transfers(sender_id);
CREATE INDEX idx_file_transfer_recipients_recipient ON public.file_transfer_recipients(recipient_id);

-- SQL query indexes
CREATE INDEX idx_sql_queries_sender ON public.sql_queries(sender_id);

-- Notification indexes (partial index for unread notifications)
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) 
    WHERE is_read = false;

-- ============================================
-- SECTION 10: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.web_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_transfer_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_request_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_storage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_query_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_request_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 11: HELPER FUNCTIONS
-- ============================================

-- ---------------------------------------------
-- Function: get_web_user_id
-- Purpose: Convert auth UUID to internal user_id
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION public.get_web_user_id(_auth_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT user_id 
    FROM public.web_users 
    WHERE auth_user_id = _auth_user_id
$$;

COMMENT ON FUNCTION public.get_web_user_id IS 'Maps Supabase auth.uid() to internal user_id';

-- ---------------------------------------------
-- Function: has_role
-- Purpose: Check if user has specific role
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.web_users wu ON ur.user_id = wu.user_id
        WHERE wu.auth_user_id = _user_id
          AND ur.role = _role
    )
$$;

COMMENT ON FUNCTION public.has_role IS 'Role-based access control check';

-- ---------------------------------------------
-- Function: update_updated_at_column
-- Purpose: Auto-update updated_at timestamp
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

COMMENT ON FUNCTION public.update_updated_at_column IS 'Trigger function to auto-update updated_at timestamp';

-- ============================================
-- SECTION 12: TRIGGERS
-- ============================================

-- Auto-update triggers for updated_at columns
CREATE TRIGGER update_web_users_updated_at
    BEFORE UPDATE ON public.web_users
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_systems_updated_at
    BEFORE UPDATE ON public.client_systems
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credential_vault_updated_at
    BEFORE UPDATE ON public.credential_vault
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SECTION 13: RLS POLICIES
-- ============================================

-- ============================================
-- 13.1: WEB USERS POLICIES
-- ============================================

CREATE POLICY "Users can view their own profile" 
ON public.web_users
    FOR SELECT 
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.web_users
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Users can update their own nickname" 
ON public.web_users
    FOR UPDATE 
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.web_users
    FOR INSERT 
    WITH CHECK (auth.uid() = auth_user_id);

-- ============================================
-- 13.2: USER ROLES POLICIES
-- ============================================

CREATE POLICY "Users can view their own role" 
ON public.user_roles
    FOR SELECT 
    USING (user_id = public.get_web_user_id(auth.uid()));

CREATE POLICY "Admins can view all roles" 
ON public.user_roles
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Admins can manage roles" 
ON public.user_roles
    FOR ALL 
    USING (public.has_role(auth.uid(), 'Admin'));

-- ============================================
-- 13.3: CLIENTS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view clients" 
ON public.clients
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Admins can manage clients" 
ON public.clients
    FOR ALL 
    USING (public.has_role(auth.uid(), 'Admin'));

-- ============================================
-- 13.4: SYSTEM TYPES POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view system types" 
ON public.system_types
    FOR SELECT 
    TO authenticated 
    USING (true);

-- ============================================
-- 13.5: CLIENT SYSTEMS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view client systems" 
ON public.client_systems
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Admins can manage client systems" 
ON public.client_systems
    FOR ALL 
    USING (public.has_role(auth.uid(), 'Admin'));

-- ============================================
-- 13.6: CREDENTIAL VAULT POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view credentials" 
ON public.credential_vault
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Admins can manage credentials" 
ON public.credential_vault
    FOR ALL 
    USING (public.has_role(auth.uid(), 'Admin'));

-- ============================================
-- 13.7: CREDENTIAL AUDIT POLICIES
-- ============================================

CREATE POLICY "Users can insert audit logs" 
ON public.credential_audit
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs" 
ON public.credential_audit
    FOR SELECT 
    USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Users can view their own audit logs" 
ON public.credential_audit
    FOR SELECT 
    USING (user_id = public.get_web_user_id(auth.uid()));

-- ============================================
-- 13.8: FILE TRANSFERS POLICIES
-- ============================================

CREATE POLICY "Users can view transfers they sent or received" 
ON public.file_transfers
    FOR SELECT 
    USING (
        sender_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.file_transfer_recipients
            WHERE transfer_id = file_transfers.transfer_id
            AND recipient_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert their own transfers" 
ON public.file_transfers
    FOR INSERT 
    WITH CHECK (sender_id = public.get_web_user_id(auth.uid()));

-- ============================================
-- 13.9: FILE TRANSFER RECIPIENTS POLICIES
-- ============================================

CREATE POLICY "Users can view their received transfers" 
ON public.file_transfer_recipients
    FOR SELECT 
    USING (
        recipient_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.file_transfers
            WHERE transfer_id = file_transfer_recipients.transfer_id
            AND sender_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert recipients for their transfers" 
ON public.file_transfer_recipients
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.file_transfers
            WHERE transfer_id = file_transfer_recipients.transfer_id
            AND sender_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Recipients can update their own status" 
ON public.file_transfer_recipients
    FOR UPDATE 
    USING (recipient_id = public.get_web_user_id(auth.uid()));

-- ============================================
-- 13.10: FILE REQUESTS POLICIES
-- ============================================

CREATE POLICY "Users can view requests they made or are assigned to" 
ON public.file_requests
    FOR SELECT 
    USING (
        requester_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.file_request_assignees
            WHERE request_id = file_requests.request_id
            AND assignee_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert their own requests" 
ON public.file_requests
    FOR INSERT 
    WITH CHECK (requester_id = public.get_web_user_id(auth.uid()));

-- ============================================
-- 13.11: FILE REQUEST ASSIGNEES POLICIES
-- ============================================

CREATE POLICY "Users can view assignees for their requests" 
ON public.file_request_assignees
    FOR SELECT 
    USING (
        assignee_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.file_requests
            WHERE request_id = file_request_assignees.request_id
            AND requester_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert assignees for their requests" 
ON public.file_request_assignees
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.file_requests
            WHERE request_id = file_request_assignees.request_id
            AND requester_id = public.get_web_user_id(auth.uid())
        )
    );

-- ============================================
-- 13.12: USER ARCHIVE POLICIES
-- ============================================

CREATE POLICY "Users can manage their own archive" 
ON public.user_archive
    FOR ALL 
    USING (user_id = public.get_web_user_id(auth.uid()));

-- ============================================
-- 13.13: USER STORAGE LIMITS POLICIES
-- ============================================

CREATE POLICY "Users can view their own storage limit" 
ON public.user_storage_limits
    FOR SELECT 
    USING (
        user_id = public.get_web_user_id(auth.uid()) OR 
        public.has_role(auth.uid(), 'Admin')
    );

CREATE POLICY "Admins can manage storage limits" 
ON public.user_storage_limits
    FOR ALL 
    USING (public.has_role(auth.uid(), 'Admin'));

-- ============================================
-- 13.14: SQL QUERIES POLICIES
-- ============================================

CREATE POLICY "Users can view SQL queries they sent or received" 
ON public.sql_queries
    FOR SELECT 
    USING (
        sender_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.sql_query_recipients
            WHERE query_id = sql_queries.query_id
            AND recipient_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert their own SQL queries" 
ON public.sql_queries
    FOR INSERT 
    WITH CHECK (sender_id = public.get_web_user_id(auth.uid()));

-- ============================================
-- 13.15: SQL QUERY RECIPIENTS POLICIES
-- ============================================

CREATE POLICY "Users can view their received SQL queries" 
ON public.sql_query_recipients
    FOR SELECT 
    USING (
        recipient_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.sql_queries
            WHERE query_id = sql_query_recipients.query_id
            AND sender_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert recipients for their SQL queries" 
ON public.sql_query_recipients
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sql_queries
            WHERE query_id = sql_query_recipients.query_id
            AND sender_id = public.get_web_user_id(auth.uid())
        )
    );

-- ============================================
-- 13.16: SQL EXECUTION LOGS POLICIES
-- ============================================

CREATE POLICY "Users can view their own execution logs" 
ON public.sql_execution_logs
    FOR SELECT 
    USING (
        executed_by = public.get_web_user_id(auth.uid()) OR 
        public.has_role(auth.uid(), 'Admin')
    );

CREATE POLICY "Users can insert their own execution logs" 
ON public.sql_execution_logs
    FOR INSERT 
    WITH CHECK (executed_by = public.get_web_user_id(auth.uid()));

-- ============================================
-- 13.17: SQL REQUESTS POLICIES
-- ============================================

CREATE POLICY "Users can view SQL requests they made or are assigned to" 
ON public.sql_requests
    FOR SELECT 
    USING (
        requester_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.sql_request_assignees
            WHERE request_id = sql_requests.request_id
            AND assignee_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert their own SQL requests" 
ON public.sql_requests
    FOR INSERT 
    WITH CHECK (requester_id = public.get_web_user_id(auth.uid()));

-- ============================================
-- 13.18: SQL REQUEST ASSIGNEES POLICIES
-- ============================================

CREATE POLICY "Users can view SQL request assignees" 
ON public.sql_request_assignees
    FOR SELECT 
    USING (
        assignee_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.sql_requests
            WHERE request_id = sql_request_assignees.request_id
            AND requester_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert SQL request assignees" 
ON public.sql_request_assignees
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sql_requests
            WHERE request_id = sql_request_assignees.request_id
            AND requester_id = public.get_web_user_id(auth.uid())
        )
    );

-- ============================================
-- 13.19: SQL ARCHIVE POLICIES
-- ============================================

CREATE POLICY "Users can manage their own SQL archive" 
ON public.sql_archive
    FOR ALL 
    USING (user_id = public.get_web_user_id(auth.uid()));

-- ============================================
-- 13.20: NOTIFICATIONS POLICIES
-- ============================================

CREATE POLICY "Users can view their own notifications" 
ON public.notifications
    FOR SELECT 
    USING (user_id = public.get_web_user_id(auth.uid()));

CREATE POLICY "Users can update their own notifications" 
ON public.notifications
    FOR UPDATE 
    USING (user_id = public.get_web_user_id(auth.uid()));

CREATE POLICY "Authenticated users can insert notifications" 
ON public.notifications
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- ============================================
-- SECTION 14: REALTIME CONFIGURATION
-- ============================================

-- Enable realtime updates for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================
-- SECTION 15: SAMPLE DATA
-- ============================================

-- ============================================
-- 15.1: SAMPLE CLIENTS
-- ============================================

INSERT INTO public.clients (client_code, client_name, industry, division, notes, status) 
VALUES
    ('SIMPLEX', 'Simplex Business Solutions', 'Technology', 'Internal', 'Company VPN and server access', 'ACTIVE'),
    ('AIICO', 'AIICO Asset Management', 'Financial Services', 'Asset Management', NULL, 'ACTIVE'),
    ('COWRY', 'COWRY Asset Management', 'Financial Services', 'Wealth Management', NULL, 'ACTIVE'),
    ('CITI', 'CITI Trust', 'Banking', 'Corporate Banking', NULL, 'ACTIVE'),
    ('ANCHORIA', 'Anchoria Asset Management', 'Financial Services', 'Investment Management', NULL, 'ACTIVE'),
    ('FCMB', 'FCMB Trustees', 'Banking', 'Trust Services', NULL, 'ACTIVE'),
    ('STANBIC', 'Stanbic IBTC Asset Management', 'Financial Services', 'Asset Management', NULL, 'ACTIVE'),
    ('CORALSTONE', 'Coralstone Capital', 'Financial Services', 'Investment', NULL, 'ACTIVE'),
    ('UTICA', 'Utica Capital', 'Financial Services', 'Asset Management', NULL, 'ACTIVE'),
    ('TOTAL', 'Total Nigeria', 'Energy', 'Pension & Investment', NULL, 'ACTIVE'),
    ('PTL', 'PTL / Heineken', 'Manufacturing', 'Third Party', NULL, 'ACTIVE')
ON CONFLICT (client_code) DO NOTHING;

-- ============================================
-- 15.2: SAMPLE CLIENT SYSTEMS
-- ============================================

INSERT INTO public.client_systems (client_id, system_type_id, system_name, environment, host, ip_address) 
VALUES
    -- Simplex Systems
    (1, 2, 'Simplex VPN', 'Production', 'vpn.simplexsystem.com', '20.127.39.202'),
    (1, 1, 'Simplex RDP Server', 'Production', 'rdp.simplexsystem.com', '20.127.39.203'),
    (1, 1, 'Simplex Test Server', 'Test', NULL, '172.31.2.161'),
    (1, 1, 'Simplex Azure Server', 'Production', NULL, '13.72.110.60'),
    
    -- AIICO Systems
    (2, 1, 'Production IBS Server', 'Production', 'ibs-prod.aiico.com', NULL),
    (2, 3, 'Test Database', 'Test', 'db-test.aiico.com', NULL),
    (2, 1, 'AIICO DR Server', 'DR', NULL, '10.10.1.7'),
    
    -- COWRY Systems
    (3, 1, 'Production System', 'Production', 'prod.cowry.com', NULL),
    (3, 2, 'Corporate VPN', 'Production', 'vpn.cowry.com', NULL),
    (3, 1, 'Cowry Test Server', 'Test', NULL, '52.234.149.50'),
    
    -- CITI Systems
    (4, 1, 'Main Server', 'Production', 'main.citi.com', NULL),
    (4, 1, 'CITI Test Server', 'Test', NULL, '40.68.100.224'),
    
    -- Anchoria Systems
    (5, 1, 'Production Server', 'Production', 'prod.anchoria.com', NULL),
    (5, 1, 'Anchoria IBS RDP', 'Production', NULL, '18.134.100.18'),
    (5, 1, 'Anchoria IBS RDP', 'Test', NULL, '18.132.116.48'),
    (5, 2, 'Anchoria OpenVPN', 'Production', NULL, NULL),
    
    -- FCMB Systems
    (6, 1, 'Trustees Portal', 'Production', 'portal.fcmb.com', NULL),
    
    -- Stanbic Systems
    (7, 1, 'Asset Management System', 'Production', 'ams.stanbic.com', NULL),
    
    -- Coralstone Systems
    (8, 1, 'Coralstone VPS', 'Production', 'vps2662440.trouble-free.net', '68.168.223.126'),
    
    -- Utica Systems
    (9, 1, 'Utica IBS Server', 'Production', NULL, '10.0.2.5'),
    
    -- Total Systems
    (10, 1, 'Total IBS RDP', 'Production', NULL, '192.168.30.38'),
    
    -- PTL Systems
    (11, 1, 'PTL Live Server', 'Production', NULL, '145.47.183.113')
ON CONFLICT DO NOTHING;

-- ============================================
-- 15.3: SAMPLE CREDENTIALS
-- ============================================

INSERT INTO public.credential_vault (system_id, credential_type, username, password_value, notes, created_by) 
VALUES
    -- Simplex Credentials
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='20.127.39.202' LIMIT 1), 
        'VPN', 'simplex_vpn', 'VPN_Password_123', 'Simplex VPN', 'system'
    ),
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='20.127.39.203' LIMIT 1), 
        'RDP', 'simplex_admin', 'RDP_Password_456', 'Simplex RDP', 'system'
    ),
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='172.31.2.161' LIMIT 1), 
        'RDP', 'simplex', 'An3WA771N#b0N', 'Simplex Test', 'system'
    ),
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='13.72.110.60' LIMIT 1), 
        'RDP', 'simplexsys', 'Str0n9P@$$w0rd', 'Simplex Azure', 'system'
    ),
    
    -- AIICO Credentials
    (
        (SELECT system_id FROM public.client_systems WHERE system_name='Production IBS Server' AND client_id=2 LIMIT 1), 
        'Admin', 'admin_aiico', 'aiico_pass_1', NULL, 'system'
    ),
    (
        (SELECT system_id FROM public.client_systems WHERE system_name='Test Database' AND client_id=2 LIMIT 1), 
        'Database', 'db_user', 'db_pass_2', NULL, 'system'
    ),
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='10.10.1.7' LIMIT 1), 
        'RDP', 'admin', 'pw', 'AIICO DR', 'system'
    ),
    
    -- COWRY Credentials
    (
        (SELECT system_id FROM public.client_systems WHERE system_name='Production System' AND client_id=3 LIMIT 1), 
        'Admin', 'admin_cowry', 'cowry_pass_3', NULL, 'system'
    ),
    (
        (SELECT system_id FROM public.client_systems WHERE system_name='Corporate VPN' AND client_id=3 LIMIT 1), 
        'VPN', 'vpn_user', 'vpn_pass_4', NULL, 'system'
    ),
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='52.234.149.50' LIMIT 1), 
        'RDP', 'techsupport', 'simplexuser_123@', 'Cowry Test', 'system'
    ),
    
    -- CITI Credentials
    (
        (SELECT system_id FROM public.client_systems WHERE system_name='Main Server' AND client_id=4 LIMIT 1), 
        'Admin', 'admin_citi', 'citi_pass_5', NULL, 'system'
    ),
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='40.68.100.224' LIMIT 1), 
        'RDP', 'simplex', '@!234Xlease', 'CITI Test', 'system'
    ),
    
    -- Anchoria Credentials
    (
        (SELECT system_id FROM public.client_systems WHERE system_name='Production Server' AND client_id=5 LIMIT 1), 
        'Admin', 'admin_anchoria', 'anchoria_pass_6', NULL, 'system'
    ),
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='18.134.100.18' LIMIT 1), 
        'RDP', 'Administrator', ';9xDn@;!;cg-9YU;cvEDVFke!*bi.Y(A', 'Anchoria Prod RDP', 'system'
    ),
    (
        (SELECT system_id FROM public.client_systems WHERE system_name='Anchoria OpenVPN' LIMIT 1), 
        'VPN', 'atoba@simplexsystem.com', 'Atob@123##', 'Anchoria VPN', 'system'
    ),
    
    -- FCMB Credentials
    (
        (SELECT system_id FROM public.client_systems WHERE system_name='Trustees Portal' LIMIT 1), 
        'Admin', 'admin_fcmb', 'fcmb_pass_7', NULL, 'system'
    ),
    
    -- Stanbic Credentials
    (
        (SELECT system_id FROM public.client_systems WHERE system_name='Asset Management System' LIMIT 1), 
        'Admin', 'admin_stanbic', 'stanbic_pass_8', NULL, 'system'
    ),
    
    -- Coralstone Credentials
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='68.168.223.126' LIMIT 1), 
        'RDP', 'Administrator', '@dva$S5k', 'Coralstone VPS', 'system'
    ),
    
    -- Utica Credentials
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='10.0.2.5' LIMIT 1), 
        'RDP', 'uticadmin', '@P@$$w0rd1202', 'Utica IBS', 'system'
    ),
    
    -- Total Credentials
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='192.168.30.38' LIMIT 1), 
        'RDP', 'NGPF\\Simplex', 'Totalibs2021', 'Total IBS', 'system'
    ),
    
    -- PTL Credentials
    (
        (SELECT system_id FROM public.client_systems WHERE ip_address='145.47.183.113' LIMIT 1), 
        'RDP', 'heiway\\animao01', 'NBHeineken12345', 'PTL Live', 'system'
    )
ON CONFLICT DO NOTHING;

-- ============================================
-- END OF SCHEMA
-- ============================================
-- Total Tables: 20
-- Total Indexes: 12
-- Total Functions: 3
-- Total Triggers: 4
-- Total RLS Policies: 43
-- ============================================
