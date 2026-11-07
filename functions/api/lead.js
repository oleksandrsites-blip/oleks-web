// Cloudflare Pages Function: POST /api/lead → повідомлення в Telegram.
// У налаштуваннях Cloudflare Pages треба додати змінні середовища:
//   BOT_TOKEN — токен бота від @BotFather
//   CHAT_ID   — твій chat id (куди слати заявки)

const clean = (v, max) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return json({ ok: false }, 400); }

  // honeypot: боти заповнюють приховане поле
  if (data.company) return json({ ok: true });

  const name = clean(data.name, 60);
  const phone = clean(data.phone, 20);
  const via = ['Telegram', 'Viber', 'WhatsApp'].includes(data.via) ? data.via : 'Telegram';
  if (name.length < 2 || phone.replace(/\D/g, '').length < 10) return json({ ok: false }, 422);

  if (!env.BOT_TOKEN || !env.CHAT_ID) return json({ ok: false, error: 'not configured' }, 500);

  const text = `🔔 Нова заявка з oleks_web\n\nІм'я: ${name}\nТелефон: ${phone}\nЗв'язок: ${via}`;
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.CHAT_ID, text }),
  });
  return json({ ok: r.ok }, r.ok ? 200 : 502);
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
