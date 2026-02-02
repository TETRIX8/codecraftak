-- Add RLS policies for admin to manage appeals

-- Allow admins to view all appeals
CREATE POLICY "Admins can view all appeals"
ON public.appeals
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update appeals (resolve them)
CREATE POLICY "Admins can update appeals"
ON public.appeals
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));