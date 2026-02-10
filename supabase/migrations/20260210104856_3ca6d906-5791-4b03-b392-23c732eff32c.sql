
-- Soft delete fields on profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by uuid DEFAULT NULL;

-- User bans table
CREATE TABLE public.user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  banned_by uuid NOT NULL REFERENCES public.profiles(id),
  reason text NOT NULL,
  banned_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  unbanned_at timestamptz DEFAULT NULL,
  unbanned_by uuid DEFAULT NULL
);

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anticheat and admins can view bans"
ON public.user_bans FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'anticheat') OR auth.uid() = user_id);

CREATE POLICY "Anticheat and admins can create bans"
ON public.user_bans FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'anticheat'));

CREATE POLICY "Anticheat and admins can update bans"
ON public.user_bans FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'anticheat'));

-- Subjects table
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  teacher text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view subjects"
ON public.subjects FOR SELECT USING (true);

CREATE POLICY "Starosta and admins can insert subjects"
ON public.subjects FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'starosta'));

CREATE POLICY "Starosta and admins can update subjects"
ON public.subjects FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'starosta'));

CREATE POLICY "Starosta and admins can delete subjects"
ON public.subjects FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'starosta'));

-- Schedule table
CREATE TABLE public.schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view schedule"
ON public.schedule FOR SELECT USING (true);

CREATE POLICY "Starosta and admins can insert schedule"
ON public.schedule FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'starosta'));

CREATE POLICY "Starosta and admins can update schedule"
ON public.schedule FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'starosta'));

CREATE POLICY "Starosta and admins can delete schedule"
ON public.schedule FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'starosta'));

-- Attendance table
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.schedule(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  date date NOT NULL,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, student_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view attendance"
ON public.attendance FOR SELECT USING (true);

CREATE POLICY "Starosta and admins can insert attendance"
ON public.attendance FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'starosta'));

CREATE POLICY "Starosta and admins can update attendance"
ON public.attendance FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'starosta'));

CREATE POLICY "Starosta and admins can delete attendance"
ON public.attendance FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'starosta'));

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_bans
    WHERE user_id = _user_id
      AND is_active = true
      AND expires_at > now()
  )
$$;
