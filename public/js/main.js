/* oleks_web — main.js */
const $ = id => document.getElementById(id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMob = () => innerWidth <= 700;
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ================= HERO: курсор-інтро ================= */
const h1 = $('h1'), intro = $('intro'), iInner = $('iInner'), iText = $('iText'), iPre = $('iPre'), ann = $('ann');
const LINES = () => isMob()
  ? [[{t:'Від ідеї'}],[{t:'до сайту,'}],[{t:'який '},{t:'продає',lime:1}]]
  : [[{t:'Від ідеї'}],[{t:'до сайту, який'}],[{t:'продає',lime:1}]];

const cur = document.createElement('span'); cur.className = 'cur';
let segs = [], skipped = false, done = false;
const sleep = ms => skipped ? Promise.resolve() : wait(ms);

function buildH1(full){
  h1.innerHTML = ''; segs = [];
  LINES().forEach(line => {
    const l = document.createElement('span'); l.className = 'line';
    line.forEach(s => {
      const sp = document.createElement('span');
      if(s.lime) sp.className = 'lime';
      sp.dataset.t = s.t; sp.textContent = full ? s.t : '';
      l.appendChild(sp); segs.push(sp);
    });
    h1.appendChild(l);
  });
  if(full) segs[segs.length-1].after(cur);
}

function showRest(){
  $('hdr').classList.add('on');
  document.querySelectorAll('[data-r]').forEach(el => el.classList.add('on'));
}

function finish(){
  if(done) return;
  skipped = true; done = true;
  intro.classList.add('gone');
  buildH1(true); showRest();
  try{ sessionStorage.setItem('introSeen','1'); }catch(e){}
  layoutThread(); onScroll();
}

async function type(el, text, ms){ for(const ch of text){ if(skipped) return; el.textContent += ch; await sleep(ms); } }

async function runIntro(){
  buildH1(false);
  segs[0].textContent = segs[0].dataset.t; segs[0].classList.add('ghost');
  await sleep(350);
  await type(iText, 'ідея', 75);
  await sleep(220); if(skipped) return;

  const target = parseFloat(getComputedStyle(h1).fontSize);
  iInner.style.transition = 'none';
  iInner.classList.replace('mono','big');
  iInner.style.fontSize = target + 'px';
  iInner.style.transform = `scale(${20/target})`;
  iInner.style.filter = 'blur(6px)';
  iInner.getBoundingClientRect();
  iInner.style.transition = 'transform .85s var(--ease), filter .85s var(--ease)';
  iInner.style.transform = 'scale(1)';
  iInner.style.filter = 'blur(0)';
  setTimeout(() => iInner.classList.add('sel-on'), 420);
  ann.querySelectorAll('span').forEach((s,i) => setTimeout(() => s.classList.add('on'), 380 + i*90));
  await sleep(880); if(skipped) return;

  iText.textContent = 'іде'; await sleep(120);
  iText.textContent = 'ідеї'; await sleep(170);
  iPre.classList.add('in'); ann.classList.add('out');
  await sleep(520); if(skipped) return;
  iInner.classList.remove('sel-on');

  const from = iPre.getBoundingClientRect(), to = segs[0].getBoundingClientRect();
  iInner.style.transition = 'transform .75s var(--ease)';
  iInner.style.transform = `translate(${to.left-from.left}px,${to.top-from.top}px)`;
  await sleep(760); if(skipped) return;

  intro.classList.add('gone');
  segs[0].classList.remove('ghost'); segs[0].after(cur);
  for(let i = 1; i < segs.length; i++){
    if(segs[i].parentNode !== segs[i-1].parentNode) await sleep(80);
    segs[i].after(cur);
    await type(segs[i], segs[i].dataset.t, 30);
    if(skipped) return;
  }
  done = true;
  try{ sessionStorage.setItem('introSeen','1'); }catch(e){}
  showRest(); layoutThread(); onScroll();
}

/* пропуск інтро: будь-яка взаємодія */
['wheel','touchmove','keydown','pointerdown'].forEach(e => addEventListener(e, () => { if(!done) finish(); }, {passive:true}));

/* ================= НИТКА ================= */
const svg = $('thread'), path = $('path'), path2 = $('path2');
let len = 0, endScroll = 1, len2 = 0, s2a = 0, s2b = 1;
const abs = el => { const r = el.getBoundingClientRect(); return {l:r.left+scrollX, t:r.top+scrollY, r:r.right+scrollX, b:r.bottom+scrollY, w:r.width, h:r.height}; };

function layoutThread(){
  if(!done) return;
  const doc = document.documentElement;
  svg.setAttribute('width', 1); svg.setAttribute('height', 1);   // не даємо SVG розпирати сторінку
  svg.setAttribute('width', doc.clientWidth);
  svg.setAttribute('height', doc.scrollHeight);

  const c = abs(cur), k1 = abs($('kw1')), f = abs($('featShot')), k2 = abs($('kw2'));
  const pad = parseFloat(getComputedStyle(doc).getPropertyValue('--pad')) || 48;
  const g = Math.max(6, pad/2);                       // «жолоб» біля лівого краю
  const R = isMob() ? 14 : 18;
  const sx = c.l + c.w/2, sy = c.t + c.h/2;
  const u1 = k1.b + Math.max(6, k1.h*.05);
  const u2 = k2.b + Math.max(6, k2.h*.04);
  const drop = u1 - sy;

  const d = [
    `M${sx},${sy}`,
    // курсор → під «конкретний бізнес» (справа наліво)
    `C${sx},${sy+drop*.6} ${k1.r+220},${u1} ${k1.r},${u1}`,
    `L${k1.l},${u1}`,
    // → лівий верхній кут головного кейсу
    `C${Math.max(4,k1.l-30)},${u1} ${f.l},${f.t-(f.t-u1)*.5} ${f.l},${f.t+R}`,
    `Q${f.l},${f.t} ${f.l+R},${f.t}`,
    // обводимо рамку: верх → право → низ
    `L${f.r-R},${f.t} Q${f.r},${f.t} ${f.r},${f.t+R}`,
    `L${f.r},${f.b-R} Q${f.r},${f.b} ${f.r-R},${f.b}`,
    `L${f.l+R},${f.b} Q${f.l},${f.b} ${f.l},${f.b+R}`,
    // уздовж лівого краю вниз → під «заявок із сайту»
    `C${f.l},${f.b+R+80} ${g},${f.b+120} ${g},${f.b+260}`,
    `L${g},${u2-120}`,
    `C${g},${u2} ${k2.l-60},${u2} ${k2.l},${u2}`,
    `L${k2.r},${u2}`
  ].join(' ');
  path.setAttribute('d', d);
  len = path.getTotalLength();
  path.style.strokeDasharray = len;
  endScroll = Math.max(1, u2 - innerHeight*.62);

  // фінал: нитка повертається з лівого краю і «втікає» в курсор після «наступний»
  const fs = abs($('final')), fc = abs($('fCur'));
  const cy = fc.t + fc.h/2;
  path2.setAttribute('d', `M${g},${fs.t} L${g},${cy-90} C${g},${cy} ${g+20},${cy} ${g+60},${cy} L${fc.l},${cy}`);
  len2 = path2.getTotalLength();
  path2.style.strokeDasharray = len2;
  s2a = fs.t - innerHeight*.9;
  s2b = Math.max(s2a + 1, cy - innerHeight*.6);
}

function onScroll(){
  const y = scrollY;
  $('hdr').classList.toggle('solid', y > 40);
  if(!done) return;
  const k = reduce ? 1 : Math.min(1, Math.max(0, y / endScroll));
  path.style.strokeDashoffset = len * (1 - k);
  const k2 = reduce ? 1 : Math.min(1, Math.max(0, (y - s2a) / (s2b - s2a)));
  path2.style.strokeDashoffset = len2 * (1 - k2);
  cur.classList.toggle('still', y > 4);
}
addEventListener('scroll', onScroll, {passive:true});

let lastMob = isMob();
addEventListener('resize', () => {
  if(done && isMob() !== lastMob) buildH1(true);
  lastMob = isMob();
  layoutThread(); onScroll();
});
new ResizeObserver(() => { layoutThread(); onScroll(); }).observe(document.body);


/* ================= Відгук-кружечок ================= */
const vid = $('review'), nv = $('noteVid');
new IntersectionObserver(([e]) => {
  if(e.isIntersecting){ if(vid.paused) vid.play().catch(()=>{}); }
  else if(!vid.muted){ vid.pause(); }
}, {threshold:.4}).observe(nv);
nv.addEventListener('click', () => {
  if(vid.muted){ vid.muted = false; vid.loop = false; vid.currentTime = 0; vid.play(); nv.classList.add('playing'); nv.setAttribute('aria-label','Пауза'); }
  else if(vid.paused){ vid.play(); nv.classList.add('playing'); }
  else { vid.pause(); nv.classList.remove('playing'); }
});
vid.addEventListener('ended', () => { vid.muted = true; vid.loop = true; vid.play(); nv.classList.remove('playing'); nv.setAttribute('aria-label','Увімкнути відгук зі звуком'); });

/* ================= ЧАТ «Як працюю» ================= */
const box = $('msgs'), cStatus = $('cStatus');
const SCRIPT = [
  ['in','Привіт! Потрібен сайт для детейлінгу 🚗'],
  ['out','Привіт! Розкажіть коротко про студію і киньте Instagram — за 1–3 дні покажу прототип першого екрана. Безкоштовно.'],
  ['in','Ось 👇'],
  ['out','Готово, гляньте з телефона:'],
  ['card'],
  ['in','Ого. А що далі?'],
  ['out','Погоджуємо структуру й ціну, передоплата — і за 1–2 тижні сайт онлайн. Два кола правок уже включені.'],
  ['sys','<b>oleks_bot</b> · 🔔 Нова заявка з сайту'],
];
function add(el){ box.appendChild(el); while(box.scrollHeight > box.clientHeight + 2 && box.children.length > 1) box.firstElementChild.remove(); }
function bubble(cls, html){ const d = document.createElement('div'); d.className = 'm ' + cls; d.innerHTML = html; return d; }
function card(){
  const c = document.createElement('div'); c.className = 'mcard';
  c.innerHTML = '<img src="assets/img/cases/detailing.jpg" alt=""><div><small>detailingrv.pages.dev</small>Прототип першого екрана</div>';
  return c;
}
async function runChat(){
  if(reduce){ SCRIPT.forEach(([t,x]) => add(t === 'card' ? card() : bubble(t, x))); return; }
  for(const [t, x] of SCRIPT){
    if(t === 'card'){ add(card()); await wait(1600); continue; }
    if(t !== 'sys'){
      const ty = bubble(t + ' typing', '<i></i><i></i><i></i>');
      if(t === 'out') cStatus.textContent = 'друкує…';
      add(ty); await wait(t === 'out' ? 1000 : 700); ty.remove();
      cStatus.textContent = 'онлайн';
    } else await wait(800);
    add(bubble(t, x)); await wait(t === 'out' ? 1500 : 1000);
  }
}
new IntersectionObserver(([e], o) => { if(e.isIntersecting){ o.disconnect(); runChat(); } }, {threshold:.35}).observe($('chat'));

/* ================= ЦІНИ: калькулятор ================= */
const calc = document.querySelector('.calc'), cPrice = $('cPrice'), cTerm = $('cTerm'), botTog = $('botTog');
const BASE = {landing:8000, multi:16000}, BOT = 4000, TERM = {landing:'1–2 тижні', multi:'2–4 тижні'};
let cType = 'landing', cBot = false, shown = BASE.landing;
const fmt = n => n.toLocaleString('uk-UA').replace(/\s/g, ' ');
function countTo(to){
  const from = shown, t0 = performance.now(), dur = reduce ? 0 : 450;
  shown = to;
  (function step(t){
    const k = dur ? Math.min(1, (t - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
    cPrice.textContent = fmt(Math.round((from + (to - from) * e) / 100) * 100);
    if(k < 1) requestAnimationFrame(step);
  })(t0);
}
function updCalc(){
  countTo(BASE[cType] + (cBot ? BOT : 0));
  cTerm.textContent = TERM[cType];
  calc.classList.toggle('bot', cBot);
}
document.querySelectorAll('.opt').forEach(o => o.addEventListener('click', () => {
  cType = o.dataset.type;
  document.querySelectorAll('.opt').forEach(x => { const on = x === o; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
  updCalc();
}));
botTog.addEventListener('click', () => {
  cBot = !cBot; botTog.classList.toggle('on', cBot); botTog.setAttribute('aria-pressed', cBot); updCalc();
});

/* ================= ПИТАННЯ ================= */
document.querySelectorAll('.q-btn').forEach(b => b.addEventListener('click', () => {
  const q = b.parentElement, open = !q.classList.contains('open');
  document.querySelectorAll('.q.open').forEach(o => { o.classList.remove('open'); o.querySelector('.q-btn').setAttribute('aria-expanded','false'); });
  if(open){ q.classList.add('open'); b.setAttribute('aria-expanded','true'); }
}));

/* ================= РОБОТИ: крапки під каруселлю (мобілка) ================= */
const bento = document.querySelector('.bento'), dots = [...$('dots').children];
bento.addEventListener('scroll', () => {
  const cards = [...bento.children], mid = bento.scrollLeft + bento.clientWidth/2;
  let best = 0, bd = Infinity;
  cards.forEach((c,i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth/2 - mid); if(d < bd){ bd = d; best = i; } });
  dots.forEach((d,i) => d.classList.toggle('on', i === best));
}, {passive:true});

/* ================= ФОРМА → Telegram (Cloudflare Pages Function /api/lead) ================= */
const form = $('lead'), leadMsg = $('leadMsg'), leadBtn = $('leadBtn');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const name = form.name.value.trim(), phone = form.phone.value.trim();
  const digits = phone.replace(/\D/g, '');
  const nameOk = /\p{L}{2}/u.test(name);
  form.name.classList.toggle('err', !nameOk);
  form.phone.classList.toggle('err', digits.length !== 12);
  if(!nameOk || digits.length !== 12){
    leadMsg.className = 'lead-msg bad'; leadMsg.textContent = 'Перевірте ім\'я та номер телефону.'; return;
  }
  leadBtn.disabled = true; leadBtn.textContent = 'Надсилаю…'; leadMsg.textContent = '';
  try{
    const r = await fetch('/api/lead', {method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({name, phone, via: form.via.value, company: form.company.value})});
    if(!r.ok) throw 0;
    form.reset();
    leadMsg.className = 'lead-msg ok'; leadMsg.textContent = 'Дякую! Напишу вам протягом дня.';
  }catch(err){
    leadMsg.className = 'lead-msg bad';
    leadMsg.innerHTML = 'Не вдалося надіслати. Напишіть, будь ласка, у <a href="https://t.me/LysOleksandr" target="_blank" rel="noopener">Telegram</a>.';
  }
  leadBtn.disabled = false; leadBtn.textContent = 'Отримати прототип';
});
['name','phone'].forEach(n => form[n].addEventListener('input', () => form[n].classList.remove('err')));

/* маска телефону: +380 XX XXX XX XX, не більше 12 цифр */
form.phone.addEventListener('input', e => {
  let d = form.phone.value.replace(/\D/g, '');
  if(!d){ form.phone.value = ''; return; }
  if(d.startsWith('380')) {}
  else if(d.startsWith('80')) d = '3' + d;
  else if(d.startsWith('0')) d = '38' + d;
  else d = '380' + d;
  d = d.slice(0, 12);
  const parts = [d.slice(0,3), d.slice(3,5), d.slice(5,8), d.slice(8,10), d.slice(10,12)].filter(Boolean);
  form.phone.value = '+' + parts.join(' ');
});

/* ================= старт ================= */
if('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0,0);
let seen = false; try{ seen = sessionStorage.getItem('introSeen') === '1'; }catch(e){}
document.fonts.ready.then(() => { (reduce || seen) ? finish() : runIntro(); });
