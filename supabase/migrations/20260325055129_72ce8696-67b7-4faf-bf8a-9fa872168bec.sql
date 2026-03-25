ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS reward_points integer NOT NULL DEFAULT 10;

UPDATE public.badges SET reward_points = 5 WHERE requirement_type = 'registration';
UPDATE public.badges SET reward_points = 10 WHERE requirement_type = 'solutions' AND requirement_value = 1;
UPDATE public.badges SET reward_points = 20 WHERE requirement_type = 'solutions' AND requirement_value = 5;
UPDATE public.badges SET reward_points = 35 WHERE requirement_type = 'solutions' AND requirement_value = 10;
UPDATE public.badges SET reward_points = 50 WHERE requirement_type = 'solutions' AND requirement_value = 25;
UPDATE public.badges SET reward_points = 80 WHERE requirement_type = 'solutions' AND requirement_value = 50;
UPDATE public.badges SET reward_points = 15 WHERE requirement_type = 'reviews' AND requirement_value = 10;
UPDATE public.badges SET reward_points = 30 WHERE requirement_type = 'reviews' AND requirement_value = 25;
UPDATE public.badges SET reward_points = 50 WHERE requirement_type = 'reviews' AND requirement_value = 50;
UPDATE public.badges SET reward_points = 80 WHERE requirement_type = 'reviews' AND requirement_value = 100;
UPDATE public.badges SET reward_points = 150 WHERE requirement_type = 'reviews' AND requirement_value = 200;
UPDATE public.badges SET reward_points = 10 WHERE requirement_type = 'streak' AND requirement_value = 3;
UPDATE public.badges SET reward_points = 25 WHERE requirement_type = 'streak' AND requirement_value = 7;
UPDATE public.badges SET reward_points = 50 WHERE requirement_type = 'streak' AND requirement_value = 14;
UPDATE public.badges SET reward_points = 100 WHERE requirement_type = 'streak' AND requirement_value = 30;
UPDATE public.badges SET reward_points = 30 WHERE requirement_type = 'trust_rating' AND requirement_value = 80;
UPDATE public.badges SET reward_points = 60 WHERE requirement_type = 'trust_rating' AND requirement_value = 90;
UPDATE public.badges SET reward_points = 100 WHERE requirement_type = 'trust_rating' AND requirement_value = 95;
UPDATE public.badges SET reward_points = 15 WHERE requirement_type = 'likes_received' AND requirement_value = 10;
UPDATE public.badges SET reward_points = 35 WHERE requirement_type = 'likes_received' AND requirement_value = 50;
UPDATE public.badges SET reward_points = 60 WHERE requirement_type = 'likes_received' AND requirement_value = 100;
UPDATE public.badges SET reward_points = 40 WHERE requirement_type IN ('python_reviews', 'java_reviews', 'cpp_reviews', 'html_reviews', 'ts_reviews');
UPDATE public.badges SET reward_points = 60 WHERE requirement_type = 'js_reviews';
UPDATE public.badges SET reward_points = 150 WHERE requirement_type = 'leader_days';
UPDATE public.badges SET reward_points = 25 WHERE requirement_type = 'weekly_reviews';

CREATE OR REPLACE FUNCTION public.check_and_award_badges(_user_id uuid)
 RETURNS TABLE(badge_name text, badge_icon text, newly_awarded boolean, points_awarded integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _profile RECORD;
  _badge RECORD;
  _accepted_solution_count integer;
  _already_has boolean;
  _should_award boolean;
BEGIN
  SELECT * INTO _profile FROM profiles WHERE id = _user_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT COUNT(*) INTO _accepted_solution_count FROM solutions WHERE user_id = _user_id AND status = 'accepted';

  FOR _badge IN SELECT * FROM badges LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_badges WHERE user_id = _user_id AND badge_id = _badge.id
    ) INTO _already_has;

    _should_award := false;

    CASE _badge.requirement_type
      WHEN 'registration' THEN _should_award := true;
      WHEN 'reviews' THEN _should_award := COALESCE(_profile.reviews_completed, 0) >= _badge.requirement_value;
      WHEN 'solutions' THEN _should_award := _accepted_solution_count >= _badge.requirement_value;
      WHEN 'streak' THEN _should_award := COALESCE(_profile.streak, 0) >= _badge.requirement_value;
      WHEN 'trust_rating' THEN _should_award := COALESCE(_profile.trust_rating, 50) >= _badge.requirement_value;
      WHEN 'likes_received' THEN _should_award := COALESCE(_profile.likes_received, 0) >= _badge.requirement_value;
      WHEN 'leader_days' THEN _should_award := false;
      WHEN 'weekly_reviews' THEN
        SELECT COUNT(*) >= _badge.requirement_value INTO _should_award
        FROM reviews WHERE reviewer_id = _user_id AND created_at >= (now() - interval '7 days');
      WHEN 'js_reviews' THEN
        SELECT COUNT(*) >= _badge.requirement_value INTO _should_award
        FROM reviews r JOIN solutions s ON s.id = r.solution_id JOIN tasks t ON t.id = s.task_id
        WHERE r.reviewer_id = _user_id AND t.language = 'javascript';
      WHEN 'python_reviews' THEN
        SELECT COUNT(*) >= _badge.requirement_value INTO _should_award
        FROM reviews r JOIN solutions s ON s.id = r.solution_id JOIN tasks t ON t.id = s.task_id
        WHERE r.reviewer_id = _user_id AND t.language = 'python';
      WHEN 'java_reviews' THEN
        SELECT COUNT(*) >= _badge.requirement_value INTO _should_award
        FROM reviews r JOIN solutions s ON s.id = r.solution_id JOIN tasks t ON t.id = s.task_id
        WHERE r.reviewer_id = _user_id AND t.language = 'java';
      WHEN 'cpp_reviews' THEN
        SELECT COUNT(*) >= _badge.requirement_value INTO _should_award
        FROM reviews r JOIN solutions s ON s.id = r.solution_id JOIN tasks t ON t.id = s.task_id
        WHERE r.reviewer_id = _user_id AND t.language = 'cpp';
      WHEN 'html_reviews' THEN
        SELECT COUNT(*) >= _badge.requirement_value INTO _should_award
        FROM reviews r JOIN solutions s ON s.id = r.solution_id JOIN tasks t ON t.id = s.task_id
        WHERE r.reviewer_id = _user_id AND t.language IN ('html', 'css');
      WHEN 'ts_reviews' THEN
        SELECT COUNT(*) >= _badge.requirement_value INTO _should_award
        FROM reviews r JOIN solutions s ON s.id = r.solution_id JOIN tasks t ON t.id = s.task_id
        WHERE r.reviewer_id = _user_id AND t.language = 'typescript';
      ELSE _should_award := false;
    END CASE;

    IF _should_award AND NOT _already_has THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (_user_id, _badge.id);
      PERFORM log_point_transaction(
        _user_id, 
        COALESCE(_badge.reward_points, 10), 
        'badge_reward', 
        _badge.id, 
        'Награда за достижение: ' || _badge.name
      );
      badge_name := _badge.name;
      badge_icon := _badge.icon;
      newly_awarded := true;
      points_awarded := COALESCE(_badge.reward_points, 10);
      RETURN NEXT;
    ELSIF _already_has THEN
      badge_name := _badge.name;
      badge_icon := _badge.icon;
      newly_awarded := false;
      points_awarded := COALESCE(_badge.reward_points, 10);
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;