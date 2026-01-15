-- Fix search_path for calculate_trust_rating function
CREATE OR REPLACE FUNCTION public.calculate_trust_rating(
  _correct_reviews INTEGER,
  _total_reviews INTEGER,
  _likes_received INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  base_rating INTEGER;
  like_bonus INTEGER;
BEGIN
  -- Base rating = percentage of correct reviews (start at 50 if no reviews)
  IF _total_reviews > 0 THEN
    base_rating := (_correct_reviews * 100 / _total_reviews);
  ELSE
    base_rating := 50;
  END IF;
  
  -- Bonus from likes (max +10)
  like_bonus := LEAST(COALESCE(_likes_received, 0), 10);
  
  -- Final rating (min 0, max 100)
  RETURN LEAST(GREATEST(base_rating + like_bonus, 0), 100);
END;
$$;