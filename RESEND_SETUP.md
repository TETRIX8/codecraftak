# Resend: настройка email-потока

Интеграция использует Supabase Edge Function `auth-email`. Frontend вызывает только функцию, а ключ Resend никогда не попадает в браузер, TypeScript-файлы или GitHub.

## Секреты функции

В секретах Supabase необходимо задать:

```env
RESEND_API_KEY=re_замените_на_новый_ключ
RESEND_FROM_EMAIL=MOKSUHUB <noreply@ваш-домен.ru>
APP_URL=https://ваш-домен.ru
```

`RESEND_FROM_EMAIL` должен использовать подтверждённый домен или разрешённый адрес Resend. Реальный ключ не добавляйте в `.env`, если файл может попасть в репозиторий, и не вставляйте его в frontend-код.

## Деплой

Ошибка `Failed to send a request to the Edge Function` с HTTP 404 означает, что функция ещё не задеплоена в Supabase. Выполните команды из корня проекта после установки Supabase CLI и входа в аккаунт:

```bash
supabase link --project-ref bzorclzvqmoanzdmumiy
supabase db push
supabase secrets set RESEND_API_KEY=\"ВАШ_НОВЫЙ_КЛЮЧ\" RESEND_FROM_EMAIL=\"MOKSUHUB <noreply@ваш-подтверждённый-домен.ru>\" APP_URL=\"https://ваш-домен.ru\"
supabase functions deploy auth-email --project-ref bzorclzvqmoanzdmumiy --no-verify-jwt
```

Для Vercel добавьте в Project Settings → Environment Variables только серверные переменные без префикса `VITE_`:

```env
RESEND_API_KEY=ВАШ_НОВЫЙ_КЛЮЧ
RESEND_FROM_EMAIL=MOKSUHUB <noreply@ваш-подтверждённый-домен.ru>
SUPABASE_URL=https://bzorclzvqmoanzdmumiy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ваш-серверный-service-role-ключ
APP_URL=https://ваш-домен.ru
```

`SUPABASE_SERVICE_ROLE_KEY` также нельзя помещать во frontend. После redeploy Vercel будет обслуживать `/api/auth-email`. Ключ Resend и service-role передавайте только через защищённые настройки Vercel или Supabase, не через GitHub.

Сначала примените миграцию `supabase/migrations/20260815103000_add_secure_email_otp.sql`, затем задеплойте функцию `supabase/functions/auth-email/index.ts` и задайте секреты в окружении Supabase.

Поток регистрации вызывает `send_signup_code`, а страница `/auth/verify-email` вызывает `verify_signup_code`. Поток восстановления использует `send_reset_code`, `verify_reset_code` и `reset_password`.

## Безопасность

Коды живут 15 минут, хранятся только как SHA-256 hash, имеют максимум пять попыток и повторную отправку не чаще одного раза в минуту. После успешной проверки OTP становится недействительным. Reset-token хранится в виде hash и живёт 10 минут. Запрос восстановления отвечает нейтрально и не сообщает, существует ли email.

Ключ, который был опубликован в переписке, рекомендуется немедленно отозвать в панели Resend и создать новый. В проекте сохранён только placeholder, сам ключ в исходники не записывался.
