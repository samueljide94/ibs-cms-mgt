-- ============================================
-- IBS Portal - Full Database Schema Rebuild
-- ============================================

-- Drop existing tables if they exist (clean rebuild)
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

-- Drop existing types
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.position_type CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.has_role CASCADE;
DROP FUNCTION IF EXISTS public.get_web_user_id CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;

-- ============================================
-- Create Enums
-- ============================================
CREATE TYPE public.app_role AS ENUM ('Admin', 'Manager', 'Viewer');
CREATE TYPE public.position_type AS ENUM ('MD', 'Management', 'QA', 'HOD', 'DevOps', 'Engineer', 'Senior', 'Junior', 'Trainee', 'NYSC', 'IT_Swiss');

-- ============================================
-- 1. WEB USERS TABLE
-- ============================================
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

-- ============================================
-- 2. USER ROLES TABLE
-- ============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL DEFAULT 'Viewer',
    UNIQUE (user_id, role)
);

-- ============================================
-- 3. CLIENTS TABLE
-- ============================================
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

-- ============================================
-- 4. SYSTEM TYPES TABLE
-- ============================================
CREATE TABLE public.system_types (
    system_type_id SERIAL PRIMARY KEY,
    system_type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Pre-populate system types
INSERT INTO public.system_types (system_type_name, description) VALUES
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

-- ============================================
-- 5. CLIENT SYSTEMS TABLE
-- ============================================
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

-- ============================================
-- 6. CREDENTIAL VAULT TABLE
-- ============================================
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

-- ============================================
-- 7. CREDENTIAL AUDIT TABLE (Critical for audit-only system)
-- ============================================
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

-- ============================================
-- 8. FILE TRANSFERS TABLE
-- ============================================
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

-- ============================================
-- 9. FILE TRANSFER RECIPIENTS TABLE
-- ============================================
CREATE TABLE public.file_transfer_recipients (
    id SERIAL PRIMARY KEY,
    transfer_id INTEGER REFERENCES public.file_transfers(transfer_id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RECEIVED', 'DOWNLOADED', 'ARCHIVED', 'REJECTED')),
    received_at TIMESTAMPTZ,
    downloaded_at TIMESTAMPTZ,
    UNIQUE(transfer_id, recipient_id)
);

-- ============================================
-- 10. FILE REQUESTS TABLE
-- ============================================
CREATE TABLE public.file_requests (
    request_id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES public.web_users(user_id) ON DELETE SET NULL,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('FILE', 'LINK')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FULFILLED', 'EXPIRED', 'CANCELLED')),
    fulfilled_transfer_id INTEGER REFERENCES public.file_transfers(transfer_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. FILE REQUEST ASSIGNEES TABLE
-- ============================================
CREATE TABLE public.file_request_assignees (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES public.file_requests(request_id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FULFILLED', 'DECLINED')),
    UNIQUE(request_id, assignee_id)
);

-- ============================================
-- 12. USER ARCHIVE TABLE
-- ============================================
CREATE TABLE public.user_archive (
    archive_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    transfer_id INTEGER REFERENCES public.file_transfers(transfer_id) ON DELETE SET NULL,
    archived_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, transfer_id)
);

-- ============================================
-- 13. USER STORAGE LIMITS TABLE
-- ============================================
CREATE TABLE public.user_storage_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE UNIQUE,
    storage_limit_bytes BIGINT DEFAULT 10485760,
    updated_by INTEGER REFERENCES public.web_users(user_id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. SQL QUERIES TABLE
-- ============================================
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

-- ============================================
-- 15. SQL QUERY RECIPIENTS TABLE
-- ============================================
CREATE TABLE public.sql_query_recipients (
    id SERIAL PRIMARY KEY,
    query_id INTEGER REFERENCES public.sql_queries(query_id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RECEIVED', 'EXECUTED', 'ARCHIVED')),
    received_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    UNIQUE(query_id, recipient_id)
);

-- ============================================
-- 16. SQL EXECUTION LOGS TABLE
-- ============================================
CREATE TABLE public.sql_execution_logs (
    log_id SERIAL PRIMARY KEY,
    query_id INTEGER REFERENCES public.sql_queries(query_id) ON DELETE SET NULL,
    executed_by INTEGER REFERENCES public.web_users(user_id) ON DELETE SET NULL,
    client_id INTEGER REFERENCES public.clients(client_id) ON DELETE SET NULL,
    execution_result TEXT,
    rows_affected INTEGER,
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED', 'PARTIAL')),
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 17. SQL REQUESTS TABLE
-- ============================================
CREATE TABLE public.sql_requests (
    request_id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES public.web_users(user_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FULFILLED', 'EXPIRED', 'CANCELLED')),
    fulfilled_query_id INTEGER REFERENCES public.sql_queries(query_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 18. SQL REQUEST ASSIGNEES TABLE
-- ============================================
CREATE TABLE public.sql_request_assignees (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES public.sql_requests(request_id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FULFILLED', 'DECLINED')),
    UNIQUE(request_id, assignee_id)
);

-- ============================================
-- 19. SQL ARCHIVE TABLE
-- ============================================
CREATE TABLE public.sql_archive (
    archive_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.web_users(user_id) ON DELETE CASCADE,
    query_id INTEGER REFERENCES public.sql_queries(query_id) ON DELETE SET NULL,
    archived_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, query_id)
);

-- ============================================
-- 20. NOTIFICATIONS TABLE
-- ============================================
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

-- ============================================
-- Create Indexes
-- ============================================
CREATE INDEX idx_web_users_email ON public.web_users(email);
CREATE INDEX idx_web_users_auth_id ON public.web_users(auth_user_id);
CREATE INDEX idx_clients_code ON public.clients(client_code);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_client_systems_client ON public.client_systems(client_id);
CREATE INDEX idx_credential_vault_system ON public.credential_vault(system_id);
CREATE INDEX idx_audit_user_timestamp ON public.credential_audit(user_id, timestamp DESC);
CREATE INDEX idx_audit_client_timestamp ON public.credential_audit(client_id, timestamp DESC);
CREATE INDEX idx_file_transfers_sender ON public.file_transfers(sender_id);
CREATE INDEX idx_file_transfer_recipients_recipient ON public.file_transfer_recipients(recipient_id);
CREATE INDEX idx_sql_queries_sender ON public.sql_queries(sender_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ============================================
-- Enable RLS on all tables
-- ============================================
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
-- Helper Functions
-- ============================================
CREATE OR REPLACE FUNCTION public.get_web_user_id(_auth_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.web_users WHERE auth_user_id = _auth_user_id
$$;

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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE TRIGGER update_web_users_updated_at
    BEFORE UPDATE ON public.web_users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_systems_updated_at
    BEFORE UPDATE ON public.client_systems
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credential_vault_updated_at
    BEFORE UPDATE ON public.credential_vault
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- RLS Policies
-- ============================================

-- Web Users policies
CREATE POLICY "Users can view their own profile" ON public.web_users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all profiles" ON public.web_users
    FOR SELECT USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Users can update their own nickname" ON public.web_users
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile" ON public.web_users
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- User Roles policies
CREATE POLICY "Users can view their own role" ON public.user_roles
    FOR SELECT USING (user_id = public.get_web_user_id(auth.uid()));

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'Admin'));

-- Clients policies (all authenticated users can view)
CREATE POLICY "Authenticated users can view clients" ON public.clients
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage clients" ON public.clients
    FOR ALL USING (public.has_role(auth.uid(), 'Admin'));

-- System Types policies
CREATE POLICY "Authenticated users can view system types" ON public.system_types
    FOR SELECT TO authenticated USING (true);

-- Client Systems policies
CREATE POLICY "Authenticated users can view client systems" ON public.client_systems
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage client systems" ON public.client_systems
    FOR ALL USING (public.has_role(auth.uid(), 'Admin'));

-- Credential Vault policies (audit-only - all views allowed and logged)
CREATE POLICY "Authenticated users can view credentials" ON public.credential_vault
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage credentials" ON public.credential_vault
    FOR ALL USING (public.has_role(auth.uid(), 'Admin'));

-- Credential Audit policies
CREATE POLICY "Users can insert audit logs" ON public.credential_audit
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs" ON public.credential_audit
    FOR SELECT USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Users can view their own audit logs" ON public.credential_audit
    FOR SELECT USING (user_id = public.get_web_user_id(auth.uid()));

-- File Transfers policies
CREATE POLICY "Users can view transfers they sent or received" ON public.file_transfers
    FOR SELECT USING (
        sender_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.file_transfer_recipients
            WHERE transfer_id = file_transfers.transfer_id
            AND recipient_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert their own transfers" ON public.file_transfers
    FOR INSERT WITH CHECK (sender_id = public.get_web_user_id(auth.uid()));

-- File Transfer Recipients policies
CREATE POLICY "Users can view their received transfers" ON public.file_transfer_recipients
    FOR SELECT USING (
        recipient_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.file_transfers
            WHERE transfer_id = file_transfer_recipients.transfer_id
            AND sender_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert recipients for their transfers" ON public.file_transfer_recipients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.file_transfers
            WHERE transfer_id = file_transfer_recipients.transfer_id
            AND sender_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Recipients can update their own status" ON public.file_transfer_recipients
    FOR UPDATE USING (recipient_id = public.get_web_user_id(auth.uid()));

-- File Requests policies
CREATE POLICY "Users can view requests they made or are assigned to" ON public.file_requests
    FOR SELECT USING (
        requester_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.file_request_assignees
            WHERE request_id = file_requests.request_id
            AND assignee_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert their own requests" ON public.file_requests
    FOR INSERT WITH CHECK (requester_id = public.get_web_user_id(auth.uid()));

-- File Request Assignees policies
CREATE POLICY "Users can view assignees for their requests" ON public.file_request_assignees
    FOR SELECT USING (
        assignee_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.file_requests
            WHERE request_id = file_request_assignees.request_id
            AND requester_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert assignees for their requests" ON public.file_request_assignees
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.file_requests
            WHERE request_id = file_request_assignees.request_id
            AND requester_id = public.get_web_user_id(auth.uid())
        )
    );

-- User Archive policies
CREATE POLICY "Users can manage their own archive" ON public.user_archive
    FOR ALL USING (user_id = public.get_web_user_id(auth.uid()));

-- User Storage Limits policies
CREATE POLICY "Users can view their own storage limit" ON public.user_storage_limits
    FOR SELECT USING (user_id = public.get_web_user_id(auth.uid()) OR public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Admins can manage storage limits" ON public.user_storage_limits
    FOR ALL USING (public.has_role(auth.uid(), 'Admin'));

-- SQL Queries policies
CREATE POLICY "Users can view SQL queries they sent or received" ON public.sql_queries
    FOR SELECT USING (
        sender_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.sql_query_recipients
            WHERE query_id = sql_queries.query_id
            AND recipient_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert their own SQL queries" ON public.sql_queries
    FOR INSERT WITH CHECK (sender_id = public.get_web_user_id(auth.uid()));

-- SQL Query Recipients policies
CREATE POLICY "Users can view their received SQL queries" ON public.sql_query_recipients
    FOR SELECT USING (
        recipient_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.sql_queries
            WHERE query_id = sql_query_recipients.query_id
            AND sender_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert recipients for their SQL queries" ON public.sql_query_recipients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sql_queries
            WHERE query_id = sql_query_recipients.query_id
            AND sender_id = public.get_web_user_id(auth.uid())
        )
    );

-- SQL Execution Logs policies
CREATE POLICY "Users can view their own execution logs" ON public.sql_execution_logs
    FOR SELECT USING (executed_by = public.get_web_user_id(auth.uid()) OR public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Users can insert their own execution logs" ON public.sql_execution_logs
    FOR INSERT WITH CHECK (executed_by = public.get_web_user_id(auth.uid()));

-- SQL Requests policies
CREATE POLICY "Users can view SQL requests they made or are assigned to" ON public.sql_requests
    FOR SELECT USING (
        requester_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.sql_request_assignees
            WHERE request_id = sql_requests.request_id
            AND assignee_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert their own SQL requests" ON public.sql_requests
    FOR INSERT WITH CHECK (requester_id = public.get_web_user_id(auth.uid()));

-- SQL Request Assignees policies
CREATE POLICY "Users can view SQL request assignees" ON public.sql_request_assignees
    FOR SELECT USING (
        assignee_id = public.get_web_user_id(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.sql_requests
            WHERE request_id = sql_request_assignees.request_id
            AND requester_id = public.get_web_user_id(auth.uid())
        )
    );

CREATE POLICY "Users can insert SQL request assignees" ON public.sql_request_assignees
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sql_requests
            WHERE request_id = sql_request_assignees.request_id
            AND requester_id = public.get_web_user_id(auth.uid())
        )
    );

-- SQL Archive policies
CREATE POLICY "Users can manage their own SQL archive" ON public.sql_archive
    FOR ALL USING (user_id = public.get_web_user_id(auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = public.get_web_user_id(auth.uid()));

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = public.get_web_user_id(auth.uid()));

CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================
-- Sample Data
-- ============================================
INSERT INTO public.clients (client_code, client_name, industry, division, notes, status) VALUES
('SIMPLEX', 'Simplex Business Solutions', 'Technology', 'Internal', 'Company VPN and server access', 'ACTIVE'),
('AIICO', 'AIICO Asset Management', 'Financial Services', 'Asset Management', NULL, 'ACTIVE'),
('COWRY', 'COWRY Asset Management', 'Financial Services', 'Wealth Management', NULL, 'ACTIVE'),
('CITI', 'CITI Trust', 'Banking', 'Corporate Banking', NULL, 'ACTIVE'),
('ANCHORIA', 'Anchoria Asset Management', 'Financial Services', 'Investment Management', NULL, 'ACTIVE'),
('FCMB', 'FCMB Trustees', 'Banking', 'Trust Services', NULL, 'ACTIVE'),
('STANBIC', 'Stanbic IBTC Asset Management', 'Financial Services', 'Asset Management', NULL, 'ACTIVE');

-- Insert sample systems
INSERT INTO public.client_systems (client_id, system_type_id, system_name, environment, host, ip_address) VALUES
(1, 2, 'Simplex VPN', 'Production', 'vpn.simplexsystem.com', '20.127.39.202'),
(1, 1, 'Simplex RDP Server', 'Production', 'rdp.simplexsystem.com', '20.127.39.203'),
(2, 1, 'Production IBS Server', 'Production', 'ibs-prod.aiico.com', NULL),
(2, 3, 'Test Database', 'Test', 'db-test.aiico.com', NULL),
(3, 1, 'Production System', 'Production', 'prod.cowry.com', NULL),
(3, 2, 'Corporate VPN', 'Production', 'vpn.cowry.com', NULL),
(4, 1, 'Main Server', 'Production', 'main.citi.com', NULL),
(5, 1, 'Production Server', 'Production', 'prod.anchoria.com', NULL),
(6, 1, 'Trustees Portal', 'Production', 'portal.fcmb.com', NULL),
(7, 1, 'Asset Management System', 'Production', 'ams.stanbic.com', NULL);

-- Insert sample credentials
INSERT INTO public.credential_vault (system_id, credential_type, username, password_value, created_by) VALUES
(1, 'VPN', 'simplex_vpn', 'VPN_Password_123', 'system'),
(2, 'RDP', 'simplex_admin', 'RDP_Password_456', 'system'),
(3, 'Admin', 'admin_aiico', 'aiico_pass_1', 'system'),
(4, 'Database', 'db_user', 'db_pass_2', 'system'),
(5, 'Admin', 'admin_cowry', 'cowry_pass_3', 'system'),
(6, 'VPN', 'vpn_user', 'vpn_pass_4', 'system'),
(7, 'Admin', 'admin_citi', 'citi_pass_5', 'system'),
(8, 'Admin', 'admin_anchoria', 'anchoria_pass_6', 'system'),
(9, 'Admin', 'admin_fcmb', 'fcmb_pass_7', 'system'),
(10, 'Admin', 'admin_stanbic', 'stanbic_pass_8', 'system');