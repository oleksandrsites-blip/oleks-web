// Cloudflare Pages Function: POST /api/lead → повідомлення в Telegram.
// Змінні в Cloudflare Pages (Settings → Variables and secrets → Production):
//   TELEGRAM_BOT_TOKEN — токен бота від @BotFather (Secret)
//   TELEGRAM_CHAT_ID   — chat id, куди слати заявки
// (старі назви BOT_TOKEN / CHAT_ID теж підтримуються)

const clean = (v, max) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return json({ ok: false }, 400); }

  // honeypot: боти заповнюють приховане поле
  if (data.company) return json({ ok: true });

  const name = clean(data.name, 60);
  const phone = clean(data.phone, 20);
  const via = ['Telegram', 'Viber', 'WhatsApp'].includes(data.via) ? data.via : 'Telegram';
  if (!/\p{L}{2}/u.test(name) || phone.replace(/\D/g, '').length < 10) return json({ ok: false }, 422);

  const token = env.TELEGRAM_BOT_TOKEN || env.BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID || env.CHAT_ID;
  if (!token || !chatId) return json({ ok: false, error: 'not configured' }, 500);

  const text = `🔔 Нова заявка з oleks_web\n\nІм'я: ${name}\nТелефон: ${phone}\nЗв'язок: ${via}`;
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return json({ ok: r.ok }, r.ok ? 200 : 502);
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
