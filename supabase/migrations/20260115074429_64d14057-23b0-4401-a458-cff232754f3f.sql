-- Добавляем колонки для отслеживания точности проверок
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS correct_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Обновляем функцию расчета рейтинга (учитывает процент + бонус лайков)
CREATE OR REPLACE FUNCTION public.calculate_trust_rating(
  _correct_reviews INTEGER,
  _total_reviews INTEGER,
  _likes_received INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  base_rating INTEGER;
  like_bonus INTEGER;
BEGIN
  -- Базовый рейтинг = процент правильных проверок (начинаем с 50 если нет проверок)
  IF _total_reviews > 0 THEN
    base_rating := (_correct_reviews * 100 / _total_reviews);
  ELSE
    base_rating := 50;
  END IF;
  
  -- Бонус от лайков (макс +10)
  like_bonus := LEAST(COALESCE(_likes_received, 0), 10);
  
  -- Итоговый рейтинг (мин 0, макс 100)
  RETURN LEAST(GREATEST(base_rating + like_bonus, 0), 100);
END;
$$;

-- Обновляем триггер handle_profile_like
CREATE OR REPLACE FUNCTION public.handle_profile_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_correct INTEGER;
  current_total INTEGER;
  current_likes INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT correct_reviews, total_reviews, likes_received 
    INTO current_correct, current_total, current_likes
    FROM public.profiles WHERE id = NEW.liked_id;
    
    UPDATE public.profiles
    SET likes_received = COALESCE(likes_received, 0) + 1,
        trust_rating = calculate_trust_rating(
          COALESCE(current_correct, 0),
          COALESCE(current_total, 0),
          COALESCE(current_likes, 0) + 1
        )
    WHERE id = NEW.liked_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT correct_reviews, total_reviews, likes_received 
    INTO current_correct, current_total, current_likes
    FROM public.profiles WHERE id = OLD.liked_id;
    
    UPDATE public.profiles
    SET likes_received = GREATEST(COALESCE(likes_received, 0) - 1, 0),
        trust_rating = calculate_trust_rating(
          COALESCE(current_correct, 0),
          COALESCE(current_total, 0),
          GREATEST(COALESCE(current_likes, 0) - 1, 0)
        )
    WHERE id = OLD.liked_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Обновляем функцию update_solution_status для пересчета рейтинга ревьюеров
CREATE OR REPLACE FUNCTION public.update_solution_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_reviews_count INTEGER;
  accepted_count INTEGER;
  rejected_count INTEGER;
  old_status solution_status;
  new_status solution_status;
  solution_author_id UUID;
  reviewer_record RECORD;
  reviewer_correct INTEGER;
  reviewer_total INTEGER;
  reviewer_likes INTEGER;
BEGIN
  -- Get the current status before update
  SELECT status, user_id INTO old_status, solution_author_id
  FROM public.solutions
  WHERE id = NEW.solution_id;

  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE verdict = 'accepted'),
    COUNT(*) FILTER (WHERE verdict = 'rejected')
  INTO total_reviews_count, accepted_count, rejected_count
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
    reviews_count = total_reviews_count,
    accepted_votes = accepted_count,
    rejected_votes = rejected_count,
    status = new_status,
    updated_at = NOW()
  WHERE id = NEW.solution_id;
  
  -- If solution just got final verdict, update reviewers accuracy
  IF old_status = 'pending' AND new_status IN ('accepted', 'rejected') THEN
    -- Update each reviewer's accuracy stats
    FOR reviewer_record IN 
      SELECT reviewer_id, verdict 
      FROM public.reviews 
      WHERE solution_id = NEW.solution_id
    LOOP
      -- Increment total reviews for this reviewer
      UPDATE public.profiles
      SET total_reviews = COALESCE(total_reviews, 0) + 1
      WHERE id = reviewer_record.reviewer_id;
      
      -- Check if reviewer voted correctly
      IF (new_status = 'accepted' AND reviewer_record.verdict = 'accepted') OR
         (new_status = 'rejected' AND reviewer_record.verdict = 'rejected') THEN
        -- Correct vote - increment correct reviews
        UPDATE public.profiles
        SET correct_reviews = COALESCE(correct_reviews, 0) + 1
        WHERE id = reviewer_record.reviewer_id;
      END IF;
      
      -- Recalculate trust_rating for this reviewer
      SELECT correct_reviews, total_reviews, likes_received
      INTO reviewer_correct, reviewer_total, reviewer_likes
      FROM public.profiles 
      WHERE id = reviewer_record.reviewer_id;
      
      UPDATE public.profiles
      SET trust_rating = calculate_trust_rating(
        COALESCE(reviewer_correct, 0),
        COALESCE(reviewer_total, 0),
        COALESCE(reviewer_likes, 0)
      )
      WHERE id = reviewer_record.reviewer_id;
    END LOOP;
    
    -- If solution accepted, reward the author with +5 balance
    IF old_status != 'accepted' AND new_status = 'accepted' THEN
      UPDATE public.profiles
      SET review_balance = COALESCE(review_balance, 0) + 5
      WHERE id = solution_author_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;