-- Security hardening: revoke unsafe RPC entry points, restrict direct data changes,
-- and constrain public storage uploads. Apply this migration before deploying the
-- matching frontend changes.

BEGIN;

-- The old game-economy functions trust caller supplied IDs and amounts. They must
-- not be exposed through PostgREST until a server-authorized replacement exists.
REVOKE EXECUTE ON FUNCTION public.log_point_transaction(uuid, integer, text, uuid, text)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_game_bet(uuid, integer, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_game_winner(uuid, uuid, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refund_game_bet(uuid, uuid, integer)
  FROM PUBLIC, anon, authenticated;

-- Client accounts may only update display fields on their own profile. A trigger
-- enforces field-level integrity because RLS policies are row-level only.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.guard_profile_user_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Server triggers and staff operations on a different account retain their
  -- controlled paths. A non-admin changing their own row is restricted below.
  IF auth.uid() = OLD.id AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    IF NEW.nickname IS DISTINCT FROM OLD.nickname THEN
      IF OLD.last_nickname_change IS NOT NULL
         AND OLD.last_nickname_change > now() - interval '7 days' THEN
        RAISE EXCEPTION 'Nickname can only be changed once every 7 days';
      END IF;
      NEW.last_nickname_change := now();
    ELSIF NEW.last_nickname_change IS DISTINCT FROM OLD.last_nickname_change THEN
      RAISE EXCEPTION 'Nickname change timestamp is managed by the server';
    END IF;

    IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url
       AND NOT COALESCE(OLD.can_upload_avatar, false)
       AND NEW.avatar_url NOT LIKE 'https://api.dicebear.com/%' THEN
      RAISE EXCEPTION 'Custom avatar upload is not permitted for this account';
    END IF;

    IF NEW.can_upload_avatar IS DISTINCT FROM OLD.can_upload_avatar
       OR NEW.correct_reviews IS DISTINCT FROM OLD.correct_reviews
       OR NEW.course IS DISTINCT FROM OLD.course
       OR NEW.daily_games_count IS DISTINCT FROM OLD.daily_games_count
       OR NEW.daily_reviews_count IS DISTINCT FROM OLD.daily_reviews_count
       OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
       OR NEW.deleted_by IS DISTINCT FROM OLD.deleted_by
       OR NEW.id IS DISTINCT FROM OLD.id
       OR NEW.is_approved IS DISTINCT FROM OLD.is_approved
       OR NEW.is_deleted IS DISTINCT FROM OLD.is_deleted
       OR NEW.last_activity_date IS DISTINCT FROM OLD.last_activity_date
       OR NEW.last_game_date IS DISTINCT FROM OLD.last_game_date
       OR NEW.last_review_date IS DISTINCT FROM OLD.last_review_date
       OR NEW.level IS DISTINCT FROM OLD.level
       OR NEW.likes_received IS DISTINCT FROM OLD.likes_received
       OR NEW.review_balance IS DISTINCT FROM OLD.review_balance
       OR NEW.reviews_completed IS DISTINCT FROM OLD.reviews_completed
       OR NEW.streak IS DISTINCT FROM OLD.streak
       OR NEW.total_reviews IS DISTINCT FROM OLD.total_reviews
       OR NEW.trust_rating IS DISTINCT FROM OLD.trust_rating
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
       OR NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
      RAISE EXCEPTION 'This profile field is managed by the server';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_user_update ON public.profiles;
CREATE TRIGGER guard_profile_user_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_user_update();

-- A solution owner may submit a solution but must never set review counters or a
-- final status. Staff retains controlled review/moderation updates.
DROP POLICY IF EXISTS "Users can update own solutions" ON public.solutions;
DROP POLICY IF EXISTS "Moderators can update solutions" ON public.solutions;
CREATE POLICY "Staff can update solutions"
  ON public.solutions FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'moderator'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'moderator'::app_role)
  );

-- The author of a solution cannot review it. Reviews are only accepted while the
-- solution is pending; the existing uniqueness constraint still prevents repeats.
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create independent reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1
      FROM public.solutions AS s
      WHERE s.id = solution_id
        AND s.user_id <> auth.uid()
        AND s.status = 'pending'::solution_status
    )
  );

-- Users must not forge audit records or grant themselves badges through direct API
-- inserts; approved server-side triggers/functions bypass RLS where intended.
DROP POLICY IF EXISTS "System can insert transactions" ON public.point_transactions;
DROP POLICY IF EXISTS "System can insert user badges" ON public.user_badges;

-- Keep public retrieval for current UI, but constrain uploads to the caller's
-- namespace and a small set of expected extensions/MIME types.
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'video/webm'
    ]::text[]
WHERE id = 'chat-media';

DROP POLICY IF EXISTS "Authenticated users can upload chat media" ON storage.objects;
CREATE POLICY "Users can upload own constrained chat media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'webm')
  );

UPDATE storage.buckets
SET file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
WHERE id = 'avatars';

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Permitted users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1
        FROM public.profiles AS p
        WHERE p.id = auth.uid()
          AND p.can_upload_avatar IS TRUE
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Permitted users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1
        FROM public.profiles AS p
        WHERE p.id = auth.uid()
          AND p.can_upload_avatar IS TRUE
      )
    )
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
  );

COMMIT;
