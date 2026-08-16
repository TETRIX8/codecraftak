CREATE TABLE public.course_section_task_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_slug TEXT NOT NULL,
  section_id TEXT NOT NULL,
  section_title TEXT NOT NULL,
  section_position INTEGER NOT NULL DEFAULT 0,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (course_slug, section_id)
);

GRANT SELECT ON public.course_section_task_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_section_task_links TO authenticated;
GRANT ALL ON public.course_section_task_links TO service_role;

ALTER TABLE public.course_section_task_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course task links"
ON public.course_section_task_links FOR SELECT
USING (true);

CREATE POLICY "Admins and moderators manage course task links"
ON public.course_section_task_links FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_course_section_task_links_updated_at
BEFORE UPDATE ON public.course_section_task_links
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();