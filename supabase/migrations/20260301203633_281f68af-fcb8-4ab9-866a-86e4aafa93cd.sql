
-- Allow moderators to update profiles (for nickname changes, account deletion)
CREATE POLICY "Moderators can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role));

-- Allow moderators to view all solutions
CREATE POLICY "Moderators can view all solutions"
ON public.solutions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role));

-- Allow moderators to update solutions (change status)
CREATE POLICY "Moderators can update solutions"
ON public.solutions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role));

-- Allow moderators to create bans
CREATE POLICY "Moderators can create bans"
ON public.user_bans
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role));

-- Allow moderators to update bans
CREATE POLICY "Moderators can update bans"
ON public.user_bans
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role));

-- Allow moderators to view bans
CREATE POLICY "Moderators can view bans"
ON public.user_bans
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role));

-- Allow moderators to view all reviews
CREATE POLICY "Moderators can view all reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role));
