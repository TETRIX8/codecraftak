import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { renderEmail } from "../_shared/email-template.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "MOKSUHUB <onboarding@resend.dev>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const { type, email, password, nickname, course, redirectTo } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Некорректный email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (type !== "signup" && type !== "recovery") {
      return new Response(JSON.stringify({ error: "Некорректный тип письма" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let linkRes;
    if (type === "signup") {
      if (!password || String(password).length < 6) {
        return new Response(JSON.stringify({ error: "Пароль должен быть не менее 6 символов" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      linkRes = await supabase.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: {
          data: { nickname, course },
          redirectTo: redirectTo || undefined,
        },
      });
    } else {
      linkRes = await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: redirectTo || undefined },
      });
    }

    if (linkRes.error) {
      console.error("generateLink failed:", linkRes.error.message);
      const msg = linkRes.error.message.includes("already registered")
        ? "Пользователь с таким email уже зарегистрирован"
        : linkRes.error.message;
      return new Response(JSON.stringify({ error: msg }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const actionLink = linkRes.data.properties?.action_link;
    if (!actionLink) throw new Error("Не удалось сформировать ссылку");

    const html = type === "signup"
      ? renderEmail({
        title: "Подтверждение регистрации",
        intro:
          `Привет${nickname ? `, ${nickname}` : ""}! Ты почти в системе MOKSUHUB. Подтверди почту, чтобы активировать аккаунт и получить доступ к заданиям, квестам и рейтингу.`,
        buttonLabel: "Подтвердить почту",
        link: actionLink,
        note: "Ссылка действует ограниченное время. Если ты не регистрировался — просто проигнорируй это письмо.",
      })
      : renderEmail({
        title: "Сброс пароля",
        intro: "Мы получили запрос на сброс пароля от твоего аккаунта MOKSUHUB. Нажми кнопку ниже, чтобы задать новый пароль.",
        buttonLabel: "Задать новый пароль",
        link: actionLink,
        note: "Если это был не ты — ничего делать не нужно, пароль останется прежним.",
      });

    const resendRes = await fetch("https://api.resend.com/emails", {
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

    if (!resendRes.ok) {
      const details = await resendRes.text();
      console.error(`Resend failed [${resendRes.status}]: ${details}`);
      return new Response(
        JSON.stringify({ error: "Не удалось отправить письмо", status: resendRes.status, details }),
        { status: resendRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-auth-email error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
