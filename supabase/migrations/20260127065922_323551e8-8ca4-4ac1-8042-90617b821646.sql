-- Add policy to allow all authenticated users to view all audit logs (audit trail visibility requirement)
CREATE POLICY "All users can view audit logs" 
ON public.credential_audit 
FOR SELECT 
USING (true);