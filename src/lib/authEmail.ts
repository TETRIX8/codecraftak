import { supabase } from '@/integrations/supabase/client';

export type AuthEmailAction = 'send_signup_code' | 'verify_signup_code' | 'send_reset_code' | 'verify_reset_code' | 'reset_password';

export async function authEmail(action: AuthEmailAction, payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('auth-email', { body: { action, ...payload } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { ok?: boolean; resetToken?: string };
}
