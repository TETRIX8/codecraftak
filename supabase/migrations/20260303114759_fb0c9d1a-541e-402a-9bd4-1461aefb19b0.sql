
-- CMS site content table for moderator editing
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL UNIQUE,
  content_value text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text',
  page text NOT NULL DEFAULT 'home',
  label text NOT NULL DEFAULT '',
  styles jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read site content
CREATE POLICY "Everyone can read site content"
  ON public.site_content FOR SELECT
  USING (true);

-- Moderators and admins can update
CREATE POLICY "Moderators can manage site content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Insert default content entries
INSERT INTO public.site_content (content_key, content_value, content_type, page, label) VALUES
  ('home_title', 'CodeCraft', 'text', 'home', 'Заголовок главной'),
  ('home_subtitle', 'Платформа для изучения программирования', 'text', 'home', 'Подзаголовок главной'),
  ('home_description', 'Решай задачи, проверяй код других, зарабатывай баллы и поднимайся в рейтинге!', 'text', 'home', 'Описание главной'),
  ('tasks_title', 'Задания', 'text', 'tasks', 'Заголовок страницы заданий'),
  ('tasks_description', 'Выберите задание и отправьте решение на проверку', 'text', 'tasks', 'Описание страницы заданий'),
  ('topics_title', 'Учебные темы', 'text', 'topics', 'Заголовок страницы тем'),
  ('topics_description', 'Изучайте материалы по программированию', 'text', 'topics', 'Описание страницы тем'),
  ('nav_tasks', 'Задания', 'text', 'nav', 'Навигация: Задания'),
  ('nav_topics', 'Темы', 'text', 'nav', 'Навигация: Темы'),
  ('nav_leaderboard', 'Рейтинг', 'text', 'nav', 'Навигация: Рейтинг'),
  ('nav_games', 'Игры', 'text', 'nav', 'Навигация: Игры');
