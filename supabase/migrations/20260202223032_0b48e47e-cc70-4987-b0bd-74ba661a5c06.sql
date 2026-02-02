-- Fix security issues: Audit log exposure and notification insertion

-- 1. Drop the overly permissive audit log policy that allows all users to view all logs
DROP POLICY IF EXISTS "All users can view audit logs" ON public.credential_audit;

-- 2. Drop the overly permissive notification insert policy
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

-- 3. Create policy allowing only admins to insert notifications
CREATE POLICY "Only admins can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'Admin'));

-- 4. Add length constraints to notifications table for data integrity
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_title_length CHECK (char_length(title) <= 200);

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_message_length CHECK (message IS NULL OR char_length(message) <= 1000);