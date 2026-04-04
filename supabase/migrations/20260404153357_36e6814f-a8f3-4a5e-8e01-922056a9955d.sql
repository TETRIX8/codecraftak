
-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete solutions
CREATE POLICY "Admins can delete solutions"
ON public.solutions
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete messages
CREATE POLICY "Admins can delete messages"
ON public.messages
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete chat participants
CREATE POLICY "Admins can delete chat_participants"
ON public.chat_participants
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete games
CREATE POLICY "Admins can delete games"
ON public.games
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete topics
CREATE POLICY "Admins can delete topics"
ON public.topics
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete notifications
CREATE POLICY "Admins can delete notifications"
ON public.notifications
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete reviews
CREATE POLICY "Admins can delete reviews"
ON public.reviews
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete appeals
CREATE POLICY "Admins can delete appeals"
ON public.appeals
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete point_transactions
CREATE POLICY "Admins can delete point_transactions"
ON public.point_transactions
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete user_badges
CREATE POLICY "Admins can delete user_badges"
ON public.user_badges
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete user_bans
CREATE POLICY "Admins can delete user_bans"
ON public.user_bans
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete attendance
CREATE POLICY "Admins can delete attendance"
ON public.attendance
FOR DELETE
TO public
USING (has_role(auth.uid(), 'admin'::app_role));
