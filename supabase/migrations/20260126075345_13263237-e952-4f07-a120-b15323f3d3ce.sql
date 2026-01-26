-- Add Developer to the position_type enum
ALTER TYPE public.position_type ADD VALUE IF NOT EXISTS 'Developer' AFTER 'DevOps';

-- Add UPDATE policy for file_request_assignees so assignees can update their status
CREATE POLICY "Assignees can update their own status"
ON public.file_request_assignees
FOR UPDATE
USING (assignee_id = get_web_user_id(auth.uid()));

-- Add UPDATE policy for sql_request_assignees so assignees can update their status  
CREATE POLICY "SQL assignees can update their own status"
ON public.sql_request_assignees
FOR UPDATE
USING (assignee_id = get_web_user_id(auth.uid()));