CREATE TABLE IF NOT EXISTS public.anticheat_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  compared_solution_id uuid REFERENCES public.solutions(id) ON DELETE SET NULL,
  subject_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  risk_score integer NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'confirmed', 'dismissed')),
  moderator_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE (solution_id, compared_solution_id, reason)
);

ALTER TABLE public.anticheat_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage anticheat cases" ON public.anticheat_cases;
CREATE POLICY "Admins can manage anticheat cases"
  ON public.anticheat_cases FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS anticheat_cases_status_idx ON public.anticheat_cases(status);
CREATE INDEX IF NOT EXISTS anticheat_cases_user_idx ON public.anticheat_cases(subject_user_id);
CREATE INDEX IF NOT EXISTS anticheat_cases_risk_idx ON public.anticheat_cases(risk_score DESC);
