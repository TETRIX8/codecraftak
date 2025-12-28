-- Update the solution status function: reject if ANY reviewer rejects
CREATE OR REPLACE FUNCTION public.update_solution_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_reviews INTEGER;
  accepted_count INTEGER;
  rejected_count INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE verdict = 'accepted'),
    COUNT(*) FILTER (WHERE verdict = 'rejected')
  INTO total_reviews, accepted_count, rejected_count
  FROM public.reviews
  WHERE solution_id = NEW.solution_id;
  
  UPDATE public.solutions
  SET 
    reviews_count = total_reviews,
    accepted_votes = accepted_count,
    rejected_votes = rejected_count,
    status = CASE
      -- If ANY rejection, immediately reject
      WHEN rejected_count >= 1 THEN 'rejected'::solution_status
      -- If 2+ acceptances and no rejections, accept
      WHEN accepted_count >= 2 AND rejected_count = 0 THEN 'accepted'::solution_status
      -- Otherwise still pending
      ELSE 'pending'::solution_status
    END,
    updated_at = NOW()
  WHERE id = NEW.solution_id;
  
  RETURN NEW;
END;
$$;