
CREATE OR REPLACE FUNCTION public.check_and_award_badges(_user_id uuid)
RETURNS TABLE(badge_name text, badge_icon text, newly_awarded boolean)
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
      WHEN 'registration' THEN
        _should_award := true;
      WHEN 'reviews' THEN
        _should_award := COALESCE(_profile.reviews_completed, 0) >= _badge.requirement_value;
      WHEN 'solutions' THEN
        _should_award := _accepted_solution_count >= _badge.requirement_value;
      WHEN 'streak' THEN
        _should_award := COALESCE(_profile.streak, 0) >= _badge.requirement_value;
      WHEN 'trust_rating' THEN
        _should_award := COALESCE(_profile.trust_rating, 50) >= _badge.requirement_value;
      WHEN 'likes_received' THEN
        _should_award := COALESCE(_profile.likes_received, 0) >= _badge.requirement_value;
      WHEN 'leader_days' THEN
        _should_award := false;
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
      ELSE
        _should_award := false;
    END CASE;

    IF _should_award AND NOT _already_has THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (_user_id, _badge.id);
      badge_name := _badge.name;
      badge_icon := _badge.icon;
      newly_awarded := true;
      RETURN NEXT;
    ELSIF _already_has THEN
      badge_name := _badge.name;
      badge_icon := _badge.icon;
      newly_awarded := false;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;
