-- Update the solution status trigger to also reward the author when accepted
CREATE OR REPLACE FUNCTION public.update_solution_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_reviews INTEGER;
  accepted_count INTEGER;
  rejected_count INTEGER;
  old_status solution_status;
  new_status solution_status;
  solution_author_id UUID;
BEGIN
  -- Get the current status before update
  SELECT status, user_id INTO old_status, solution_author_id
  FROM public.solutions
  WHERE id = NEW.solution_id;

  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE verdict = 'accepted'),
    COUNT(*) FILTER (WHERE verdict = 'rejected')
  INTO total_reviews, accepted_count, rejected_count
  FROM public.reviews
  WHERE solution_id = NEW.solution_id;
  
  -- Determine new status
  new_status := CASE
    WHEN rejected_count >= 1 THEN 'rejected'::solution_status
    WHEN accepted_count >= 2 AND rejected_count = 0 THEN 'accepted'::solution_status
    ELSE 'pending'::solution_status
  END;
  
  UPDATE public.solutions
  SET 
    reviews_count = total_reviews,
    accepted_votes = accepted_count,
    rejected_votes = rejected_count,
    status = new_status,
    updated_at = NOW()
  WHERE id = NEW.solution_id;
  
  -- If solution just became accepted, reward the author with +5 balance
  IF old_status != 'accepted' AND new_status = 'accepted' THEN
    UPDATE public.profiles
    SET review_balance = COALESCE(review_balance, 0) + 5
    WHERE id = solution_author_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add daily_reviews_count column to profiles to track daily reviews
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_reviews_count INTEGER DEFAULT 0;

-- Add last_review_date column to track when the counter was last reset
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_review_date DATE DEFAULT NULL;