-- Connect the code-defined course sections to the existing tasks/review flow.
-- This migration does not duplicate solutions, reviews, or status logic.
CREATE TABLE IF NOT EXISTS public.course_section_task_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug TEXT NOT NULL,
  section_id TEXT NOT NULL,
  section_title TEXT NOT NULL,
  section_position INTEGER NOT NULL CHECK (section_position > 0),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_slug, section_id),
  UNIQUE (course_slug, task_id)
);

CREATE INDEX IF NOT EXISTS course_section_task_links_course_idx
  ON public.course_section_task_links (course_slug, section_position);

ALTER TABLE public.course_section_task_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course task links are viewable by everyone"
  ON public.course_section_task_links FOR SELECT
  USING (true);

CREATE POLICY "Admins can create course task links"
  ON public.course_section_task_links FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update course task links"
  ON public.course_section_task_links FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete course task links"
  ON public.course_section_task_links FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.touch_course_section_task_links_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS course_section_task_links_updated_at ON public.course_section_task_links;
CREATE TRIGGER course_section_task_links_updated_at
  BEFORE UPDATE ON public.course_section_task_links
  FOR EACH ROW EXECUTE FUNCTION public.touch_course_section_task_links_updated_at();
