-- Move all solution and review state changes into authenticated, atomic database
-- functions. Direct client mutations of balances, review counters and solution
-- workflow state are no longer permitted.

BEGIN;

CREATE OR REPLACE FUNCTION public.guard_profile_user_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- SECURITY DEFINER functions and server-side trigger functions run as their
  -- owner. They are the only paths allowed to change managed profile fields.
  IF current_user IN ('postgres', 'service_role', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

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

DROP POLICY IF EXISTS "Authenticated users can create solutions" ON public.solutions;
DROP POLICY IF EXISTS "Authenticated users can create independent reviews" ON public.reviews;

CREATE OR REPLACE FUNCTION public.submit_solution(
  _task_id uuid,
  _code text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _solution_id uuid;
  _balance integer;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _task_id IS NULL OR _code IS NULL OR char_length(btrim(_code)) = 0 OR char_length(_code) > 100000 THEN
    RAISE EXCEPTION 'Invalid solution payload';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tasks WHERE id = _task_id) THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  SELECT COALESCE(review_balance, 0)
  INTO _balance
  FROM public.profiles
  WHERE id = _user_id
  FOR UPDATE;

  IF _balance < 1 THEN
    RAISE EXCEPTION 'Insufficient review balance';
  END IF;

  INSERT INTO public.solutions (task_id, user_id, code, status, reviews_count, accepted_votes, rejected_votes)
  VALUES (_task_id, _user_id, _code, 'pending'::solution_status, 0, 0, 0)
  RETURNING id INTO _solution_id;

  UPDATE public.profiles
  SET review_balance = _balance - 1
  WHERE id = _user_id;

  RETURN _solution_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.resubmit_solution(
  _solution_id uuid,
  _code text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _balance integer;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _solution_id IS NULL OR _code IS NULL OR char_length(btrim(_code)) = 0 OR char_length(_code) > 100000 THEN
    RAISE EXCEPTION 'Invalid solution payload';
  END IF;

  SELECT COALESCE(review_balance, 0)
  INTO _balance
  FROM public.profiles
  WHERE id = _user_id
  FOR UPDATE;

  IF _balance < 1 THEN
    RAISE EXCEPTION 'Insufficient review balance';
  END IF;

  PERFORM 1
  FROM public.solutions
  WHERE id = _solution_id
    AND user_id = _user_id
    AND status = 'rejected'::solution_status
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only a rejected own solution can be resubmitted';
  END IF;

  DELETE FROM public.reviews WHERE solution_id = _solution_id;

  UPDATE public.solutions
  SET code = _code,
      status = 'pending'::solution_status,
      reviews_count = 0,
      accepted_votes = 0,
      rejected_votes = 0,
      updated_at = now()
  WHERE id = _solution_id;

  UPDATE public.profiles
  SET review_balance = _balance - 1
  WHERE id = _user_id;

  RETURN _solution_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_review(
  _solution_id uuid,
  _verdict review_verdict,
  _comment text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _review_id uuid;
  _daily_count integer;
  _last_review_date date;
  _trust_rating integer;
  _solution_author uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _solution_id IS NULL OR _verdict IS NULL OR _comment IS NULL OR char_length(_comment) > 5000 THEN
    RAISE EXCEPTION 'Invalid review payload';
  END IF;

  SELECT COALESCE(daily_reviews_count, 0), last_review_date, COALESCE(trust_rating, 50)
  INTO _daily_count, _last_review_date, _trust_rating
  FROM public.profiles
  WHERE id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF _last_review_date IS DISTINCT FROM current_date THEN
    _daily_count := 0;
  END IF;
  IF _daily_count >= 3 THEN
    RAISE EXCEPTION 'Daily review limit reached';
  END IF;

  SELECT user_id
  INTO _solution_author
  FROM public.solutions
  WHERE id = _solution_id
    AND status = 'pending'::solution_status
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solution is unavailable for review';
  END IF;
  IF _solution_author = _user_id THEN
    RAISE EXCEPTION 'A solution author cannot review their own solution';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.reviews
    WHERE solution_id = _solution_id AND reviewer_id = _user_id
  ) THEN
    RAISE EXCEPTION 'Review already submitted';
  END IF;

  INSERT INTO public.reviews (solution_id, reviewer_id, verdict, comment, weight)
  VALUES (_solution_id, _user_id, _verdict, _comment, _trust_rating::numeric / 100)
  RETURNING id INTO _review_id;

  UPDATE public.profiles
  SET review_balance = COALESCE(review_balance, 0) + 1,
      reviews_completed = COALESCE(reviews_completed, 0) + 1,
      daily_reviews_count = _daily_count + 1,
      last_review_date = current_date,
      last_activity_date = current_date
  WHERE id = _user_id;

  RETURN _review_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_solution(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.resubmit_solution(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_review(uuid, review_verdict, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_solution(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resubmit_solution(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_review(uuid, review_verdict, text) TO authenticated;

COMMIT;
