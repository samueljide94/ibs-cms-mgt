-- ============================================
-- CLEANUP USERS WHILE PRESERVING CREDENTIALS
-- ============================================
-- Description: Remove all existing users but keep credential data
-- Platform: Supabase/PostgreSQL
-- ============================================

-- ============================================
-- STEP 1: DELETE ALL EXISTING USERS
-- ============================================

-- Delete from web_users (this will cascade to related tables)
DELETE FROM public.web_users;

-- Delete from user_roles
DELETE FROM public.user_roles;

-- Delete from profiles (if exists from old schema)
DELETE FROM public.profiles;

-- Delete from auth.users (this will cascade to all auth-related data)
-- Note: This requires admin privileges and should be done carefully
-- In production, you might want to disable users instead of deleting them

-- ============================================
-- STEP 2: RESET SEQUENCES
-- ============================================

-- Reset the user_id sequence to start from 1
ALTER SEQUENCE public.web_users_user_id_seq RESTART WITH 1;

-- ============================================
-- STEP 3: VERIFY CREDENTIALS ARE PRESERVED
-- ============================================

-- Check that credentials still exist
SELECT COUNT(*) as credential_count FROM public.credential_vault;
SELECT COUNT(*) as client_count FROM public.clients;
SELECT COUNT(*) as system_count FROM public.client_systems;

-- ============================================
-- STEP 4: ENSURE APP IS READY FOR REGISTRATION
-- ============================================

-- Verify RLS policies are still in place
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('web_users', 'user_roles', 'clients', 'credential_vault')
ORDER BY tablename;

-- ============================================
-- STEP 5: CREATE TEST ADMIN USER (OPTIONAL)
-- ============================================
-- You can manually create a test admin user through the app registration
-- or use the createTestUsersFixed.ts script after running this migration

-- ============================================
-- END OF CLEANUP
-- ============================================
