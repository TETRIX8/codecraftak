export type AuthEmailAction = 'send_signup_code' | 'verify_signup_code' | 'send_reset_code' | 'verify_reset_code' | 'reset_password';

export async function authEmail(action: AuthEmailAction, payload: Record<string, unknown>) {
  const response = await fetch('/api/auth-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error) throw new Error(data?.error || 'Не удалось выполнить операцию с email');
  return data as { ok?: boolean; resetToken?: string };
}
