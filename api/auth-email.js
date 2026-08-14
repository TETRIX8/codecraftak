import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes, randomInt } from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'MOKSUHUB <onboarding@resend.dev>';

const headers = {
  'Access-Control-Allow-Origin': process.env.APP_URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function response(res, body, status = 200) {
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  return res.status(status).json(body);
}

function normalizeEmail(email) { return String(email || '').trim().toLowerCase(); }
function hash(value) { return createHash('sha256').update(value).digest('hex'); }
function code() { return String(randomInt(100000, 1000000)); }
function token() { return randomBytes(32).toString('hex'); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char)); }

function emailShell(title, preheader, content) {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#070b16;color:#e8eefc;font-family:Inter,Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(145deg,#070b16,#111b37);padding:42px 16px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#10182b;border:1px solid #263454;border-radius:28px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.35)"><tr><td style="padding:30px 34px;background:linear-gradient(135deg,#1c7dff,#7b5cff);color:white"><div style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;opacity:.85">MOKSUHUB</div><h1 style="font-size:30px;line-height:1.15;margin:18px 0 0">${escapeHtml(title)}</h1></td></tr><tr><td style="padding:34px">${content}<div style="height:1px;background:#263454;margin:30px 0 18px"></div><p style="font-size:12px;line-height:1.6;color:#8492b3;margin:0">Если вы не запрашивали это письмо, просто проигнорируйте его. Мы никогда не просим сообщать код третьим лицам.</p></td></tr></table><p style="max-width:620px;color:#71809e;font-size:12px;line-height:1.5;text-align:center;margin:18px auto">© MOKSUHUB · Обучение, практика и рост</p></td></tr></table></body></html>`;
}
function codeEmail(title, label, value, text) {
  return emailShell(title, text, `<p style="font-size:16px;line-height:1.7;color:#c4cee3;margin:0 0 20px">${escapeHtml(text)}</p><div style="background:#0a1122;border:1px solid #2e4270;border-radius:20px;padding:24px;text-align:center"><div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8ea4d0">${escapeHtml(label)}</div><div style="font-size:42px;letter-spacing:.28em;font-weight:800;color:#ffffff;margin:14px 0 8px">${value}</div><div style="font-size:13px;color:#8492b3">Код действует 15 минут</div></div>`);
}

async function sendEmail(to, subject, html) {
  const result = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: fromEmail, to: [to], subject, html }) });
  if (!result.ok) throw new Error('Email provider error');
}

function client() {
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase server environment is not configured');
  return createClient(supabaseUrl, serviceRoleKey);
}

async function findUserId(supabase, email) {
  const { data, error } = await supabase.rpc('find_auth_user_by_email', { input_email: email });
  if (error) throw error;
  return data || null;
}

async function canSend(supabase, email, purpose) {
  const { data, error } = await supabase.from('auth_otp_codes').select('last_sent_at').eq('email', email).eq('purpose', purpose).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return !data || Date.now() - new Date(data.last_sent_at).getTime() >= 60000;
}

async function createCode(supabase, email, userId, purpose) {
  if (!(await canSend(supabase, email, purpose))) return false;
  const otp = code();
  const { error } = await supabase.from('auth_otp_codes').insert({ email, user_id: userId, purpose, otp_hash: hash(otp), expires_at: new Date(Date.now() + 900000).toISOString() });
  if (error) throw error;
  const subject = purpose === 'signup' ? 'Подтверждение email · MOKSUHUB' : 'Восстановление пароля · MOKSUHUB';
  const html = purpose === 'signup' ? codeEmail('Подтвердите электронную почту', 'Ваш код подтверждения', otp, 'Остался один шаг, чтобы открыть полный доступ к обучению и заданиям.') : codeEmail('Восстановление пароля', 'Код восстановления', otp, 'Мы получили запрос на восстановление доступа к вашему аккаунту MOKSUHUB.');
  await sendEmail(email, subject, html);
  return true;
}

async function verifyCode(supabase, email, inputCode, purpose) {
  const { data: row, error } = await supabase.from('auth_otp_codes').select('*').eq('email', email).eq('purpose', purpose).is('consumed_at', null).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!row || Date.now() > new Date(row.expires_at).getTime() || row.attempts >= 5) return null;
  if (hash(String(inputCode || '').trim()) !== row.otp_hash) {
    await supabase.from('auth_otp_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id);
    return null;
  }
  await supabase.from('auth_otp_codes').update({ consumed_at: new Date().toISOString() }).eq('id', row.id);
  return row;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return response(res, { ok: true });
  if (req.method !== 'POST') return response(res, { error: 'Method not allowed' }, 405);
  if (!resendApiKey) return response(res, { error: 'Email service is not configured on Vercel' }, 500);
  try {
    const body = req.body || {};
    const action = body.action;
    const email = normalizeEmail(body.email);
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return response(res, { error: 'Некорректный email' }, 400);
    const supabase = client();
    if (action === 'send_signup_code') {
      const sent = await createCode(supabase, email, await findUserId(supabase, email), 'signup');
      return response(res, sent ? { ok: true } : { error: 'Повторная отправка доступна через минуту' }, sent ? 200 : 429);
    }
    if (action === 'verify_signup_code') {
      const row = await verifyCode(supabase, email, body.code, 'signup');
      if (!row) return response(res, { error: 'Код неверный, просрочен или уже использован' }, 400);
      if (row.user_id) await supabase.auth.admin.updateUserById(row.user_id, { email_confirm: true });
      return response(res, { ok: true });
    }
    if (action === 'send_reset_code') {
      const userId = await findUserId(supabase, email);
      if (userId) await createCode(supabase, email, userId, 'password_reset');
      return response(res, { ok: true });
    }
    if (action === 'verify_reset_code') {
      const row = await verifyCode(supabase, email, body.code, 'password_reset');
      if (!row) return response(res, { error: 'Код неверный, просрочен или уже использован' }, 400);
      const resetToken = token();
      await supabase.from('auth_otp_codes').update({ reset_token_hash: hash(resetToken), reset_token_expires_at: new Date(Date.now() + 600000).toISOString() }).eq('id', row.id);
      return response(res, { resetToken });
    }
    if (action === 'reset_password') {
      if (String(body.newPassword || '').length < 8) return response(res, { error: 'Пароль должен содержать минимум 8 символов' }, 400);
      const { data: row, error } = await supabase.from('auth_otp_codes').select('id, user_id').eq('email', email).eq('purpose', 'password_reset').eq('reset_token_hash', hash(String(body.resetToken || ''))).gt('reset_token_expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (error || !row?.user_id) return response(res, { error: 'Сессия восстановления недействительна' }, 400);
      const updated = await supabase.auth.admin.updateUserById(row.user_id, { password: body.newPassword });
      if (updated.error) return response(res, { error: 'Не удалось изменить пароль' }, 400);
      await supabase.from('auth_otp_codes').update({ reset_token_hash: null, consumed_at: new Date().toISOString() }).eq('id', row.id);
      return response(res, { ok: true });
    }
    return response(res, { error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('auth-email request failed', error instanceof Error ? error.message : 'unknown');
    return response(res, { error: 'Временная ошибка сервиса' }, 500);
  }
}
