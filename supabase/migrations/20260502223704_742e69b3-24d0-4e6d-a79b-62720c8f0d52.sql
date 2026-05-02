CREATE TABLE public.quest_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  island_id INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, island_id)
);

ALTER TABLE public.quest_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quest progress"
ON public.quest_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quest progress"
ON public.quest_progress FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own quest progress"
ON public.quest_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete quest progress"
ON public.quest_progress FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_quest_progress_user ON public.quest_progress(user_id);