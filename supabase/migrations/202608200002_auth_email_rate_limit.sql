-- Rate limiting for the public signup/password-recovery Edge Function.
-- The Edge Function calls this through the service role; it is never exposed to
-- anon or authenticated clients.

BEGIN;

CREATE TABLE IF NOT EXISTS public.auth_email_rate_limits (
  rate_key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.auth_email_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.auth_email_rate_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_auth_email_quota(
  _rate_key text,
  _limit integer DEFAULT 5,
  _window interval DEFAULT interval '1 hour'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _record public.auth_email_rate_limits%ROWTYPE;
BEGIN
  IF _rate_key IS NULL OR length(_rate_key) <> 64 OR _limit < 1 OR _limit > 100 THEN
    RAISE EXCEPTION 'Invalid rate-limit request';
  END IF;

  INSERT INTO public.auth_email_rate_limits AS limits (rate_key, window_started_at, request_count, updated_at)
  VALUES (_rate_key, now(), 1, now())
  ON CONFLICT (rate_key) DO UPDATE
  SET
    window_started_at = CASE
      WHEN limits.window_started_at <= now() - _window THEN now()
      ELSE limits.window_started_at
    END,
    request_count = CASE
      WHEN limits.window_started_at <= now() - _window THEN 1
      ELSE limits.request_count + 1
    END,
    updated_at = now()
  RETURNING * INTO _record;

  RETURN _record.request_count <= _limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_auth_email_quota(text, integer, interval)
  FROM PUBLIC, anon, authenticated;

COMMIT;
