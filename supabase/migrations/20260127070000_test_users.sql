-- ============================================
-- TEST USERS FOR DEVELOPMENT
-- ============================================
-- This migration creates test users for development and testing
-- Run this after the main schema migration
-- ============================================

-- Note: Test users must be created through the Supabase Auth signup process first
-- These are the credentials to use when signing up through the app:

-- ADMIN USER:
-- Email: admin@simplexsystem.com
-- Password: Admin123!
-- First Name: Admin
-- Last Name: User
-- Birth Day: 1
-- Birth Month: January
-- Position: Engineer

-- REGULAR USER:
-- Email: user@simplexsystem.com
-- Password: User123!
-- First Name: Regular
-- Last Name: User
-- Birth Day: 15
-- Birth Month: March
-- Position: Junior

-- MANAGER USER:
-- Email: manager@simplexsystem.com
-- Password: Manager123!
-- First Name: Project
-- Last Name: Manager
-- Birth Day: 20
-- Birth Month: May
-- Position: Senior

-- After creating accounts through the app signup, run this SQL to assign roles:
INSERT INTO public.user_roles (user_id, role)
SELECT wu.user_id, 'Admin'
FROM public.web_users wu
WHERE wu.email = 'admin@simplexsystem.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT wu.user_id, 'Manager'
FROM public.web_users wu
WHERE wu.email = 'manager@simplexsystem.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT wu.user_id, 'Viewer'
FROM public.web_users wu
WHERE wu.email = 'user@simplexsystem.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- TEST LOGIN CREDENTIALS SUMMARY
-- ============================================
-- Use these credentials to test the application:
--
-- 1. ADMIN ACCOUNT:
--    Email: admin@simplexsystem.com
--    Password: Admin123!
--    Role: Admin (full access)
--
-- 2. MANAGER ACCOUNT:
--    Email: manager@simplexsystem.com
--    Password: Manager123!
--    Role: Manager (extended access)
--
-- 3. USER ACCOUNT:
--    Email: user@simplexsystem.com
--    Password: User123!
--    Role: Viewer (basic access)
--
-- Note: Create these accounts through the app's signup form first,
-- then run this migration to assign the appropriate roles.
-- ============================================
