export function renderEmail(opts: {
  title: string;
  intro: string;
  buttonLabel: string;
  link: string;
  note: string;
}) {
  const { title, intro, buttonLabel, link, note } = opts;
  return `<!DOCTYPE html>
<html lang="ru">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:#ffffff;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 12px;">
      <tr><td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0b0b14;border-radius:20px;overflow:hidden;border:1px solid #1e2a44;">
          <tr>
            <td style="padding:36px 32px 12px 32px;text-align:center;background:linear-gradient(135deg,#0b0b14 0%,#121233 100%);">
              <div style="display:inline-block;padding:10px 20px;border:1px solid #22d3ee;border-radius:999px;color:#22d3ee;font-size:14px;letter-spacing:3px;font-weight:700;">
                MOKSUHUB
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px 32px;text-align:center;">
              <p style="margin:0;color:#9fb0cc;font-size:15px;line-height:24px;">${intro}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px 28px 32px;">
              <a href="${link}" style="display:inline-block;padding:15px 34px;border-radius:12px;background:linear-gradient(90deg,#22d3ee,#a855f7);color:#0b0b14;font-weight:800;font-size:15px;text-decoration:none;">
                ${buttonLabel}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px 32px;text-align:center;">
              <p style="margin:0 0 10px 0;color:#64748b;font-size:12px;line-height:20px;">${note}</p>
              <p style="margin:0;color:#3f4b63;font-size:11px;word-break:break-all;">${link}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px;text-align:center;background:#07070f;border-top:1px solid #1e2a44;">
              <p style="margin:0;color:#4b5675;font-size:11px;">MOKSUHUB — ресурс для развития студентов-программистов</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
