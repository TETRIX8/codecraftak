import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'MOKSUHUB <onboarding@resend.dev>';
const appUrl = Deno.env.get('APP_URL') || 'https://moksuhub.ru';
const supabase = createClient(supabaseUrl, serviceRoleKey);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function randomDigits() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hash(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] || character));
}

function emailShell(title: string, preheader: string, content: string) {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#070b16;color:#e8eefc;font-family:Inter,Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(145deg,#070b16,#111b37);padding:42px 16px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#10182b;border:1px solid #263454;border-radius:28px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.35)"><tr><td style="padding:30px 34px;background:linear-gradient(135deg,#1c7dff,#7b5cff);color:white"><div style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;opacity:.85">MOKSUHUB</div><h1 style="font-size:30px;line-height:1.15;margin:18px 0 0">${escapeHtml(title)}</h1></td></tr><tr><td style="padding:34px">${content}<div style="height:1px;background:#263454;margin:30px 0 18px"></div><p style="font-size:12px;line-height:1.6;color:#8492b3;margin:0">Если вы не запрашивали это письмо, просто проигнорируйте его. Мы никогда не просим сообщать код третьим лицам.</p></td></tr></table><p style="max-width:620px;color:#71809e;font-size:12px;line-height:1.5;text-align:center;margin:18px auto">© MOKSUHUB · Обучение, практика и рост</p></td></tr></table></body></html>`;
}

function verificationEmail(code: string, name?: string) {
  return emailShell('Подтвердите электронную почту', 'Ваш одноразовый код MOKSUHUB уже готов.', `<p style="font-size:16px;line-height:1.7;color:#c4cee3;margin:0 0 20px">${name ? `Привет, ${escapeHtml(name)}! ` : ''}Остался один шаг, чтобы открыть полный доступ к обучению и заданиям.</p><div style="background:#0a1122;border:1px solid #2e4270;border-radius:20px;padding:24px;text-align:center"><div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8ea4d0">Ваш код подтверждения</div><div style="font-size:42px;letter-spacing:.28em;font-weight:800;color:#ffffff;margin:14px 0 8px">${code}</div><div style="font-size:13px;color:#8492b3">Код действует 15 минут</div></div><p style="font-size:14px;line-height:1.7;color:#9aa9c7;margin:22px 0 0">Введите код на странице подтверждения. После этого ваш аккаунт будет готов к работе.</p>`);
}

function resetEmail(code: string) {
  return emailShell('Восстановление пароля', 'Одноразовый код для безопасной смены пароля.', `<p style="font-size:16px;line-height:1.7;color:#c4cee3;margin:0 0 20px">Мы получили запрос на восстановление доступа к вашему аккаунту MOKSUHUB.</p><div style="background:#0a1122;border:1px solid #2e4270;border-radius:20px;padding:24px;text-align:center"><div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8ea4d0">Код восстановления</div><div style="font-size:42px;letter-spacing:.28em;font-weight:800;color:#ffffff;margin:14px 0 8px">${code}</div><div style="font-size:13px;color:#8492b3">Код действует 15 минут</div></div><p style="font-size:14px;line-height:1.7;color:#9aa9c7;margin:22px 0 0">После подтверждения вы сможете задать новый пароль. Никому не пересылайте этот код.</p>`);
}

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromEmail, to: [to], subject, html }),
  });
  if (!response.ok) throw new Error('Email provider error');
}

async function findUserId(email: string) {
  const { data, error } = await supabase.rpc('find_auth_user_by_email', { input_email: email });
  if (error) throw error;
  return data as string | null;
}

async function canSend(email: string, purpose: string) {
  const { data, error } = await supabase.from('auth_otp_codes').select('last_sent_at').eq('email', email).eq('purpose', purpose).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (data && Date.now() - new Date(data.last_sent_at).getTime() < 60_000) return false;
  return true;
}

async function createCode(email: string, userId: string | null, purpose: 'signup' | 'password_reset') {
  if (!(await canSend(email, purpose))) return false;
  const code = randomDigits();
  const { error } = await supabase.from('auth_otp_codes').insert({ email, user_id: userId, purpose, otp_hash: await hash(code), expires_at: new Date(Date.now() + 15 * 60_000).toISOString() });
  if (error) throw error;
  await sendEmail(email, purpose === 'signup' ? 'Подтверждение email · MOKSUHUB' : 'Восстановление пароля · MOKSUHUB', purpose === 'signup' ? verificationEmail(code) : resetEmail(code));
  return true;
}

async function verifyCode(email: string, code: string, purpose: 'signup' | 'password_reset') {
  const { data: row, error } = await supabase.from('auth_otp_codes').select('*').eq('email', email).eq('purpose', purpose).is('consumed_at', null).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!row || new Date(row.expires_at).getTime() < Date.now() || row.attempts >= 5) return null;
  const valid = (await hash(code.trim())) === row.otp_hash;
  if (!valid) {
    await supabase.from('auth_otp_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id);
    return null;
  }
  await supabase.from('auth_otp_codes').update({ consumed_at: new Date().toISOString() }).eq('id', row.id);
  return row;
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  try {
    if (!resendApiKey) return json({ error: 'Email service is not configured' }, 500);
    const body = await request.json();
    const action = body.action as string;
    const email = normalizeEmail(body.email || '');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Некорректный email' }, 400);

    if (action === 'send_signup_code') {
      const sent = await createCode(email, await findUserId(email), 'signup');
      return sent ? json({ ok: true }) : json({ error: 'Повторная отправка доступна через минуту' }, 429);
    }
    if (action === 'verify_signup_code') {
      const row = await verifyCode(email, String(body.code || ''), 'signup');
      if (!row) return json({ error: 'Код неверный, просрочен или уже использован' }, 400);
      if (row.user_id) await supabase.auth.admin.updateUserById(row.user_id, { email_confirm: true });
      return json({ ok: true });
    }
    if (action === 'send_reset_code') {
      const userId = await findUserId(email);
      if (userId) await createCode(email, userId, 'password_reset');
      return json({ ok: true });
    }
    if (action === 'verify_reset_code') {
      const row = await verifyCode(email, String(body.code || ''), 'password_reset');
      if (!row) return json({ error: 'Код неверный, просрочен или уже использован' }, 400);
      const resetToken = randomToken();
      await supabase.from('auth_otp_codes').update({ reset_token_hash: await hash(resetToken), reset_token_expires_at: new Date(Date.now() + 10 * 60_000).toISOString() }).eq('id', row.id);
      return json({ resetToken });
    }
    if (action === 'reset_password') {
      const token = String(body.resetToken || '');
      const newPassword = String(body.newPassword || '');
      if (newPassword.length < 8) return json({ error: 'Пароль должен содержать минимум 8 символов' }, 400);
      const { data: row, error } = await supabase.from('auth_otp_codes').select('id, user_id').eq('email', email).eq('purpose', 'password_reset').eq('reset_token_hash', await hash(token)).gt('reset_token_expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (error || !row?.user_id) return json({ error: 'Сессия восстановления недействительна' }, 400);
      const updated = await supabase.auth.admin.updateUserById(row.user_id, { password: newPassword });
      if (updated.error) return json({ error: 'Не удалось изменить пароль' }, 400);
      await supabase.from('auth_otp_codes').update({ consumed_at: new Date().toISOString(), reset_token_hash: null }).eq('id', row.id);
      return json({ ok: true });
    }
    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('auth-email request failed', error instanceof Error ? error.message : 'unknown');
    return json({ error: 'Временная ошибка сервиса' }, 500);
  }
});
