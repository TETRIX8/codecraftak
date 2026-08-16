-- Course management for students, topics and tasks
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS course smallint NOT NULL DEFAULT 2;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_course_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_course_check CHECK (course IN (2, 3));

ALTER TABLE public.topics
  ADD COLUMN IF NOT EXISTS course smallint NOT NULL DEFAULT 2;
ALTER TABLE public.topics
  DROP CONSTRAINT IF EXISTS topics_course_check;
ALTER TABLE public.topics
  ADD CONSTRAINT topics_course_check CHECK (course IN (2, 3));

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS course smallint NOT NULL DEFAULT 2;
ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_course_check;
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_course_check CHECK (course IN (2, 3));

CREATE TABLE IF NOT EXISTS public.task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, user_id)
);

ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own task assignments" ON public.task_assignments;
CREATE POLICY "Students can view own task assignments"
  ON public.task_assignments FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage task assignments" ON public.task_assignments;
CREATE POLICY "Admins can manage task assignments"
  ON public.task_assignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update student courses" ON public.profiles;
CREATE POLICY "Admins can update student courses"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS topics_course_idx ON public.topics(course);
CREATE INDEX IF NOT EXISTS tasks_course_idx ON public.tasks(course);
CREATE INDEX IF NOT EXISTS task_assignments_user_idx ON public.task_assignments(user_id);
CREATE INDEX IF NOT EXISTS task_assignments_task_idx ON public.task_assignments(task_id);

-- Preserve the course selected during signup in the student's profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url, course)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nickname', 'User_' || LEFT(NEW.id::text, 8)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id::text,
    CASE
      WHEN (NEW.raw_user_meta_data ->> 'course')::smallint IN (2, 3)
        THEN (NEW.raw_user_meta_data ->> 'course')::smallint
      ELSE 2
    END
  );
  RETURN NEW;
END;
$$;
