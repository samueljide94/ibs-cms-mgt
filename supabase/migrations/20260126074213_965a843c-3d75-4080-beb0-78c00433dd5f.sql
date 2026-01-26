-- Drop the problematic trigger that references non-existent profiles table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the associated function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();