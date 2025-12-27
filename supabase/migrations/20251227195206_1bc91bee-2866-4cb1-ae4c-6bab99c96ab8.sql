-- User levels enum
CREATE TYPE public.user_level AS ENUM ('beginner', 'reviewer', 'expert');

-- Difficulty enum
CREATE TYPE public.difficulty AS ENUM ('easy', 'medium', 'hard');

-- Programming language enum
CREATE TYPE public.programming_language AS ENUM ('javascript', 'typescript', 'python', 'html', 'css', 'java', 'cpp');

-- Solution status enum
CREATE TYPE public.solution_status AS ENUM ('pending', 'accepted', 'rejected');

-- Review verdict enum
CREATE TYPE public.review_verdict AS ENUM ('accepted', 'rejected');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  trust_rating INTEGER DEFAULT 50 CHECK (trust_rating >= 0 AND trust_rating <= 100),
  review_balance INTEGER DEFAULT 1 CHECK (review_balance >= 0),
  reviews_completed INTEGER DEFAULT 0 CHECK (reviews_completed >= 0),
  level user_level DEFAULT 'beginner',
  streak INTEGER DEFAULT 0 CHECK (streak >= 0),
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty difficulty NOT NULL,
  language programming_language NOT NULL,
  completions INTEGER DEFAULT 0 CHECK (completions >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Solutions table
CREATE TABLE public.solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  status solution_status DEFAULT 'pending',
  reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
  accepted_votes INTEGER DEFAULT 0,
  rejected_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verdict review_verdict NOT NULL,
  comment TEXT NOT NULL CHECK (char_length(comment) >= 10),
  weight NUMERIC(3, 2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(solution_id, reviewer_id) -- Prevent reviewing same solution twice
);

-- Badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL
);

-- User badges (many-to-many)
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Appeals table
CREATE TABLE public.appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks policies (public read, admin insert/update)
CREATE POLICY "Tasks are viewable by everyone" 
ON public.tasks FOR SELECT USING (true);

-- Solutions policies
CREATE POLICY "Solutions are viewable by everyone" 
ON public.solutions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create solutions" 
ON public.solutions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own solutions" 
ON public.solutions FOR UPDATE 
USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" 
ON public.reviews FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = reviewer_id);

-- Badges policies
CREATE POLICY "Badges are viewable by everyone" 
ON public.badges FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "User badges are viewable by everyone" 
ON public.user_badges FOR SELECT USING (true);

CREATE POLICY "System can insert user badges" 
ON public.user_badges FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Appeals policies
CREATE POLICY "Users can view own appeals" 
ON public.appeals FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = resolved_by);

CREATE POLICY "Users can create appeals for own solutions" 
ON public.appeals FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'nickname', 'User_' || LEFT(NEW.id::text, 8)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id::text
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user level based on reviews
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET level = CASE
    WHEN reviews_completed >= 100 THEN 'expert'::user_level
    WHEN reviews_completed >= 25 THEN 'reviewer'::user_level
    ELSE 'beginner'::user_level
  END,
  updated_at = NOW()
  WHERE id = NEW.reviewer_id;
  RETURN NEW;
END;
$$;

-- Trigger to update level after review
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_user_level();

-- Function to update solution status based on votes
CREATE OR REPLACE FUNCTION public.update_solution_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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
      WHEN total_reviews >= 2 AND accepted_count > rejected_count THEN 'accepted'::solution_status
      WHEN total_reviews >= 2 AND rejected_count > accepted_count THEN 'rejected'::solution_status
      ELSE 'pending'::solution_status
    END,
    updated_at = NOW()
  WHERE id = NEW.solution_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update solution status after review
CREATE TRIGGER on_review_for_solution
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_solution_status();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value) VALUES
('Первые шаги', 'Выполните первое задание', '🎯', 'solutions', 1),
('Активный ревьюер', 'Проверьте 10 заданий', '⭐', 'reviews', 10),
('Серия 7', 'Проверяйте задания 7 дней подряд', '🔥', 'streak', 7),
('Эксперт Python', 'Проверьте 50 Python заданий', '🐍', 'python_reviews', 50),
('Честный судья', 'Рейтинг доверия выше 95%', '⚖️', 'trust_rating', 95),
('Ревьюер недели', 'Проверьте 20 заданий за неделю', '🏆', 'weekly_reviews', 20),
('Марафонец', 'Серия 30 дней подряд', '🏃', 'streak', 30),
('Мастер JavaScript', 'Проверьте 100 JavaScript заданий', '💛', 'js_reviews', 100);

-- Insert sample tasks
INSERT INTO public.tasks (title, description, difficulty, language, completions) VALUES
('Палиндром', 'Напишите функцию, которая проверяет, является ли строка палиндромом. Палиндром — это слово или фраза, которые читаются одинаково слева направо и справа налево.', 'easy', 'javascript', 234),
('Сортировка массива', 'Реализуйте алгоритм быстрой сортировки (Quick Sort) для массива чисел. Функция должна сортировать массив по возрастанию.', 'medium', 'python', 156),
('Бинарное дерево поиска', 'Создайте класс бинарного дерева поиска с методами вставки, удаления и поиска элементов.', 'hard', 'typescript', 89),
('CSS Flexbox Layout', 'Создайте адаптивную галерею изображений с использованием CSS Flexbox. Галерея должна корректно отображаться на всех устройствах.', 'easy', 'css', 312),
('Форма регистрации', 'Создайте HTML-форму регистрации с валидацией полей: email, пароль, подтверждение пароля. Используйте семантическую разметку.', 'easy', 'html', 445),
('Асинхронный обработчик', 'Реализуйте функцию, которая параллельно выполняет несколько API-запросов и возвращает результаты в определенном порядке.', 'medium', 'javascript', 178),
('Графы и обходы', 'Реализуйте алгоритмы обхода графа в глубину (DFS) и в ширину (BFS). Граф представлен списком смежности.', 'hard', 'python', 67),
('Генератор паролей', 'Создайте генератор надежных паролей с настраиваемой длиной и набором символов (буквы, цифры, спецсимволы).', 'medium', 'typescript', 203);

-- Enable realtime for solutions and reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.solutions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;