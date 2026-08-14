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

Ключ передавайте только в команду настройки секретов или в защищённую панель Supabase. Не добавляйте его в `.env`, который собирается frontend, и не коммитьте его в GitHub. После деплоя повторите запрос к `/functions/v1/auth-email`.

Сначала примените миграцию `supabase/migrations/20260815103000_add_secure_email_otp.sql`, затем задеплойте функцию `supabase/functions/auth-email/index.ts` и задайте секреты в окружении Supabase.

Поток регистрации вызывает `send_signup_code`, а страница `/auth/verify-email` вызывает `verify_signup_code`. Поток восстановления использует `send_reset_code`, `verify_reset_code` и `reset_password`.

## Безопасность

Коды живут 15 минут, хранятся только как SHA-256 hash, имеют максимум пять попыток и повторную отправку не чаще одного раза в минуту. После успешной проверки OTP становится недействительным. Reset-token хранится в виде hash и живёт 10 минут. Запрос восстановления отвечает нейтрально и не сообщает, существует ли email.

Ключ, который был опубликован в переписке, рекомендуется немедленно отозвать в панели Resend и создать новый. В проекте сохранён только placeholder, сам ключ в исходники не записывался.
