import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { renderEmail } from "../_shared/email-template.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SITE_URL = Deno.env.get("SITE_URL");
const ALLOWED_ORIGINS = new Set(
  (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const FROM = "MOKSUHUB <onboarding@resend.dev>";
const GENERIC_RESPONSE = JSON.stringify({
  success: true,
  message: "Если адрес поддерживается сервисом, письмо будет отправлено.",
});

function response(body: string, status = 200, origin?: string) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new Response(body, { status, headers });
}

function normaliseEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function isAllowedRedirect(value: unknown): value is string {
  if (typeof value !== "string" || !SITE_URL) return false;
  try {
    return new URL(value).origin === new URL(SITE_URL).origin;
  } catch {
    return false;
  }
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "";

  if (req.method === "OPTIONS") {
    if (!origin || !ALLOWED_ORIGINS.has(origin)) return response(JSON.stringify({ error: "Forbidden" }), 403);
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
      },
    });
  }

  if (req.method !== "POST" || !origin || !ALLOWED_ORIGINS.has(origin)) {
    return response(JSON.stringify({ error: "Forbidden" }), 403);
  }

  try {
    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SITE_URL) {
      console.error("send-auth-email is missing required configuration");
      return response(JSON.stringify({ error: "Service unavailable" }), 503, origin);
    }

    const payload = await req.json();
    const { type, password, nickname, course } = payload;
    const email = normaliseEmail(payload.email);

    // The same successful response is returned for invalid and unknown emails to
    // avoid account enumeration. Invalid input never reaches email providers.
    if (!email || (type !== "signup" && type !== "recovery")) {
      return response(GENERIC_RESPONSE, 202, origin);
    }

    if (type === "signup" && (typeof password !== "string" || password.length < 12 || password.length > 128)) {
      return response(GENERIC_RESPONSE, 202, origin);
    }

    const clientIp = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    const rateKey = await sha256(`${clientIp}:${email}`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: allowed, error: quotaError } = await supabase.rpc("consume_auth_email_quota", {
      _rate_key: rateKey,
      _limit: 5,
      _window: "01:00:00",
    });

    if (quotaError || !allowed) {
      if (quotaError) console.error("auth email rate-limit failure", quotaError.message);
      return response(GENERIC_RESPONSE, 202, origin);
    }

    const redirectTo = isAllowedRedirect(payload.redirectTo) ? payload.redirectTo : SITE_URL;
    const linkResult = type === "signup"
      ? await supabase.auth.admin.generateLink({
          type: "signup",
          email,
          password,
          options: {
            data: {
              nickname: typeof nickname === "string" ? nickname.slice(0, 20) : undefined,
              course: course === 2 || course === 3 ? course : 2,
            },
            redirectTo,
          },
        })
      : await supabase.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo },
        });

    // Do not expose whether the account exists or why link generation failed.
    if (linkResult.error || !linkResult.data.properties?.action_link) {
      if (linkResult.error) console.warn("auth link generation rejected", linkResult.error.message);
      return response(GENERIC_RESPONSE, 202, origin);
    }

    const html = type === "signup"
      ? renderEmail({
          title: "Подтверждение регистрации",
          intro: `Привет${typeof nickname === "string" && nickname ? `, ${nickname.slice(0, 20)}` : ""}! Подтверди почту, чтобы активировать аккаунт.`,
          buttonLabel: "Подтвердить почту",
          link: linkResult.data.properties.action_link,
          note: "Если это были не вы — просто проигнорируйте письмо.",
        })
      : renderEmail({
          title: "Сброс пароля",
          intro: "Мы получили запрос на сброс пароля. Нажмите кнопку ниже, чтобы задать новый пароль.",
          buttonLabel: "Задать новый пароль",
          link: linkResult.data.properties.action_link,
          note: "Если это были не вы — ничего делать не нужно.",
        });

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: type === "signup" ? "MOKSUHUB — подтверждение почты" : "MOKSUHUB — сброс пароля",
        html,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Resend delivery failed", resendResponse.status);
    }

    return response(GENERIC_RESPONSE, 202, origin);
  } catch (error) {
    console.error("send-auth-email failed", error instanceof Error ? error.message : "unknown error");
    return response(JSON.stringify({ error: "Service unavailable" }), 503, origin);
  }
});
