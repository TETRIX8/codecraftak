CREATE TABLE IF NOT EXISTS public.auth_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('signup', 'password_reset')),
  otp_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  reset_token_hash TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_otp_codes_lookup_idx
  ON public.auth_otp_codes (email, purpose, created_at DESC);

ALTER TABLE public.auth_otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "OTP records are not client-readable"
  ON public.auth_otp_codes FOR SELECT USING (false);

CREATE POLICY "OTP records are not client-writable"
  ON public.auth_otp_codes FOR ALL USING (false) WITH CHECK (false);

REVOKE ALL ON public.auth_otp_codes FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.find_auth_user_by_email(input_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth
AS $$
  SELECT id FROM auth.users
  WHERE lower(email) = lower(input_email)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.find_auth_user_by_email(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_auth_user_by_email(TEXT) TO service_role;
