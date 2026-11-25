// beatpi.app · the KnifePi page: three languages, a room of the game in the
// hero (knives that spin, a pistol that aims itself) and the game's own
// weapons, zones, bosses and characters from data.js (tools/make_web.py).
(() => {
const KP = window.KP;
const S = KP.sprites;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sheet = new Image();
sheet.src = 'img/sprites.png';

// ------------------------------------------------------------------ words
const T = {
  nav_story: ['HISTORIA', 'STORY', 'GESCHICHTE'], nav_zones: ['ZONAS', 'ZONES', 'ZONEN'], nav_bosses: ['JEFES', 'BOSSES', 'BOSSE'],
  nav_weapons: ['ARMAS', 'WEAPONS', 'WAFFEN'], nav_heroes: ['PERSONAJES', 'CHARACTERS', 'FIGUREN'],
  hint: ['TOCA O MUEVE EL RATÓN', 'TAP OR MOVE YOUR MOUSE', 'TIPPEN ODER MAUS BEWEGEN'],
  tagline: ['Cuchillos que giran, armas que se desmontan y una horda que no se acaba.',
    'Spinning knives, guns you take apart and a horde that never ends.',
    'Kreisende Messer, Waffen zum Zerlegen und eine Horde ohne Ende.'],
  play: ['▶ GOOGLE PLAY', '▶ GOOGLE PLAY', '▶ GOOGLE PLAY'],
  see_story: ['VER LA HISTORIA', 'SEE THE STORY', 'ZUR GESCHICHTE'],
  act: ['ACTO I · LA RADIO', 'ACT I · THE RADIO', 'AKT I · DAS FUNKGERÄT'],
  zones_title: ['10 ZONAS HASTA<br>LA BASE MILITAR', '10 ZONES TO<br>THE MILITARY BASE', '10 ZONEN BIS<br>ZUR MILITÄRBASIS'],
  bosses_eyebrow: ['LOS QUE TE ESPERAN', 'WAITING FOR YOU', 'SIE WARTEN AUF DICH'],
  bosses_title: ['%d JEFES', '%d BOSSES', '%d BOSSE'],
  weapons_eyebrow: ['CUERPO A CUERPO Y A DISTANCIA', 'CLOSE UP AND FROM AFAR', 'NAHKAMPF UND FERNKAMPF'],
  weapons_title: ['%d ARMAS', '%d WEAPONS', '%d WAFFEN'],
  melee: ['ARMAS BLANCAS: GIRAN A TU ALREDEDOR', 'BLADES: THEY SPIN AROUND YOU', 'KLINGEN: SIE KREISEN UM DICH'],
  guns: ['ARMAS DE FUEGO: APUNTAN SOLAS', 'GUNS: THEY AIM BY THEMSELVES', 'SCHUSSWAFFEN: SIE ZIELEN SELBST'],
  heroes_eyebrow: ['CADA UNO CON SU TALLER', 'EACH WITH THEIR OWN WORKSHOP', 'JEDE FIGUR MIT EIGENER WERKSTATT'],
  heroes_title: ['%d PERSONAJES', '%d CHARACTERS', '%d FIGUREN'],
  final: ['¿AGUANTARÁS HASTA LA BASE?', 'WILL YOU MAKE IT TO THE BASE?', 'SCHAFFST DU ES BIS ZUR BASIS?'],
  studio: ['Un juego de BeatPi, estudio de juegos para móvil. Ver el estudio →', 'A game by BeatPi, a mobile games studio. See the studio →',
    'Ein Spiel von BeatPi, einem Studio für Handyspiele. Zum Studio →'],
  privacy: ['Política de privacidad', 'Privacy policy', 'Datenschutzerklärung'],
  contact: ['Contacto', 'Contact', 'Kontakt'],
  stat_weapons: ['ARMAS', 'WEAPONS', 'WAFFEN'], stat_zones: ['ZONAS', 'ZONES', 'ZONEN'], stat_bosses: ['JEFES', 'BOSSES', 'BOSSE'], stat_heroes: ['PERSONAJES', 'CHARACTERS', 'FIGUREN'],
};
const LANGS = ['es', 'en', 'de'];
let lang = 'es';
try { lang = localStorage.getItem('lang') || ''; } catch (e) { lang = ''; }
if (!LANGS.includes(lang)) { const n = (navigator.language || 'es').slice(0, 2); lang = LANGS.includes(n) ? n : 'en'; }
const t = (k) => T[k][LANGS.indexOf(lang)];
const n3 = (o) => o[lang] || o.es;

function applyLang() {
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-i]')) {
    const v = t(el.dataset.i);
    if (v.includes('<br>')) el.innerHTML = v; else el.textContent = v;
  }
  document.querySelector('[data-i="bosses_title"]').textContent = t('bosses_title').replace('%d', KP.bosses.length);
  document.querySelector('[data-i="heroes_title"]').textContent = t('heroes_title').replace('%d', KP.heroes.length);
  document.getElementById('weapons_title').textContent = t('weapons_title').replace('%d', KP.weapons.length + KP.guns.length);
  for (const b of document.querySelectorAll('[data-lang]')) b.setAttribute('aria-pressed', b.dataset.lang === lang);
  stats(); zones(); captions(); heroes(); radio();
}
for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => {
  lang = b.dataset.lang; try { localStorage.setItem('lang', lang); } catch (e) { /* (private window) */ }
  applyLang();
});

// ------------------------------------------------------------------ helpers
// one sprite into its own small canvas, scaled by whole pixels, feet at the bottom
function spriteCanvas(name, w, h, frame2) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; c.className = 'pix';
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const draw = (n) => {
    const r = S[n]; if (!r) return;
    const k = Math.max(1, Math.floor(Math.min(w / r[2], h / r[3])));
    g.clearRect(0, 0, w, h);
    g.drawImage(sheet, r[0], r[1], r[2], r[3], Math.round((w - r[2] * k) / 2), h - r[3] * k, r[2] * k, r[3] * k);
  };
  draw(name);
  if (frame2 && S[frame2] && !reduce) { let f = 0; setInterval(() => { f ^= 1; draw(f ? frame2 : name); }, 420 + Math.random() * 120); }
  return c;
}

// ------------------------------------------------------------------ sections
function stats() {
  const el = document.getElementById('stats');
  el.innerHTML = '';
  for (const [n, k] of [[KP.weapons.length + KP.guns.length, 'stat_weapons'], [KP.zones.length, 'stat_zones'], [KP.bosses.length, 'stat_bosses'], [KP.heroes.length, 'stat_heroes']]) {
    const d = document.createElement('div'); const b = document.createElement('b'); b.textContent = n;
    const s = document.createElement('span'); s.textContent = t(k); d.append(b, s); el.append(d);
  }
}
function rail() {
  const el = document.getElementById('rail');
  ['01_horda', '04_jefe', '03_laser', '02_cartas', '05_shin', '07_cofre', '06_campamento', '08_personajes'].forEach((p, i) => {
    const f = document.createElement('figure'); f.className = 'phone'; f.style.setProperty('--r', ((i % 2 ? 3 : -3) + (i % 3) - 1) + 'deg');
    const im = document.createElement('img'); im.src = `img/${p}.jpg`; im.alt = ''; im.loading = 'lazy'; im.width = 540; im.height = 1170;
    f.append(im); el.append(f);
  });
}
const tiles = {};
function tile(z) {
  if (tiles[z]) return tiles[z];
  const r = S[`floor_${z}_0`]; if (!r) return '';
  const c = document.createElement('canvas'); c.width = 16; c.height = 16;
  c.getContext('2d').drawImage(sheet, r[0], r[1], 16, 16, 0, 0, 16, 16);
  return (tiles[z] = c.toDataURL());
}
function zones() {
  const box = document.getElementById('zones'); box.innerHTML = '';
  KP.zones.forEach((z, i) => {
    const d = document.createElement('div'); d.className = 'zone pix' + (i === KP.zones.length - 1 ? ' end' : '');
    d.style.backgroundImage = `url(${tile(z.floor)})`;
    const n = document.createElement('span'); n.className = 'n'; n.textContent = String(i + 1).padStart(2, '0');
    const w = document.createElement('div'); const h = document.createElement('h3'); h.textContent = n3(z.name);
    const p = document.createElement('p'); p.textContent = n3(z.desc); w.append(h, p); d.append(n, w); box.append(d);
  });
}
function bosses() {
  const box = document.getElementById('bosses');
  KP.bosses.forEach((b, i) => {
    const f = document.createElement('figure'); f.className = 'boss'; f.style.setProperty('--d', (-i * .37) + 's');
    const cap = document.createElement('figcaption'); cap.dataset.n = i;
    f.append(spriteCanvas(b.sprite, 128, 160), cap); box.append(f);
  });
}
function arms() {
  for (const [id, list] of [['melee', KP.weapons], ['guns', KP.guns]]) {
    const box = document.getElementById(id);
    list.forEach((w, i) => {
      const d = document.createElement('div'); d.className = 'arm';
      const p = document.createElement('p'); p.dataset.list = id; p.dataset.n = i;
      d.append(spriteCanvas(w.icon, 60, 60), p); box.append(d);
    });
  }
}
function captions() {
  for (const p of document.querySelectorAll('.boss figcaption')) p.textContent = n3(KP.bosses[p.dataset.n].name);
  for (const p of document.querySelectorAll('.arm p')) p.textContent = n3((p.dataset.list === 'melee' ? KP.weapons : KP.guns)[p.dataset.n].name);
}
function heroes() {
  const box = document.getElementById('heroes'); box.innerHTML = '';
  for (const h of KP.heroes) {
    const d = document.createElement('div'); d.className = 'hero-c';
    const w = document.createElement('div'); const n = document.createElement('h3'); n.textContent = n3(h.name).toUpperCase();
    const p = document.createElement('p'); p.textContent = n3(h.desc); w.append(n, p);
    d.append(spriteCanvas(`${h.sprite}_idle_r_0`, 64, 78, `${h.sprite}_idle_r_1`), w); box.append(d);
  }
}

// ------------------------------------------------------------------ the radio
let radioRun = 0;
function radio() {
  const el = document.getElementById('radio'); const run = ++radioRun;
  const lines = KP.radio.map(n3);
  if (reduce) { el.textContent = lines.join(' '); return; }
  let li = 0, ci = 0;
  const tick = () => {
    if (run !== radioRun) return;
    const done = lines.slice(0, li).join(' ') + (li ? ' ' : '');
    el.textContent = done + lines[li].slice(0, ci);
    const c = document.createElement('span'); c.className = 'cur'; el.append(c);
    if (ci < lines[li].length) { ci++; setTimeout(tick, 40); }
    else if (li < lines.length - 1) setTimeout(() => { li++; ci = 0; tick(); }, 700);
    else setTimeout(() => { li = 0; ci = 0; tick(); }, 6000);
  };
  // it starts typing once the panel comes into view
  const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); tick(); } });
  io.observe(el);
  el.textContent = lines[0];
}

// ------------------------------------------------------------------ the hero: a room of the game
const cv = document.getElementById('horde'), cx = cv.getContext('2d');
let W = 0, H = 0, SC = 3, narrow = false;
function size() {
  const r = cv.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 2);
  SC = r.width < 520 ? 2 : r.width < 1000 ? 3 : 4;
  narrow = r.width < 600;    // a phone: the title fills the middle, he walks about above it
  cv.width = Math.ceil(r.width * d / SC); cv.height = Math.ceil(r.height * d / SC);
  W = cv.width; H = cv.height;
}
new ResizeObserver(size).observe(cv); size();
const P = { x: 0, y: 0, tx: null, ty: null, face: 1, aim: 0, cool: 0, flash: 0, recoil: 0 };
let zs = [], splats = [], pops = [], bullets = [], kills = 0, spin = 0, spawn = 0, clock = 0, idle = 0;
// a mouse leads him; a finger taps where he goes (dragging still scrolls the page)
const goTo = (e) => { const r = cv.getBoundingClientRect(); P.tx = (e.clientX - r.left) / r.width * W; P.ty = (e.clientY - r.top) / r.height * H; idle = e.pointerType === 'mouse' ? 3 : 5; };
cv.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') goTo(e); });
cv.addEventListener('pointerdown', goTo);
const RING = 24, KNIVES = 3, RANGE = 120;
const KINDS = [['walker', 14, 2], ['runner', 26, 1], ['brute', 10, 4]];
function newZombie() {
  const side = Math.floor(Math.random() * 4); let x, y;
  if (side < 2) { x = side ? W + 12 : -12; y = Math.random() * H; } else { x = Math.random() * W; y = side === 2 ? -10 : H + 24; }
  const k = KINDS[Math.random() < .55 ? 0 : Math.random() < .6 ? 1 : 2];
  zs.push({ x, y, kind: k[0], sp: k[1] * (0.8 + Math.random() * .4), hp: k[2], f: Math.random() * 4, hit: 0 });
}
function hurt(z, push) {
  z.hp--; z.hit = .18; z.x += push.x; z.y += push.y;
  if (z.hp > 0) return;
  z.dead = true; kills++;
  splats.push({ x: z.x, y: z.y, n: 'splat_' + (kills % 5), a: 1 });
  pops.push({ x: z.x, y: z.y - 22, v: -30, a: 1, coin: kills % 3 === 0 });
}
function step(dt) {
  clock += dt; spin += dt * 5; idle -= dt;
  if (P.tx === null || idle < 0) {
    P.tx = W / 2 + Math.cos(clock * .5) * W * (narrow ? .3 : .22);
    P.ty = narrow ? H * .24 + Math.sin(clock * .8) * H * .07 : H * .42 + Math.sin(clock * .8) * H * .14;
  }
  const ox = P.x;
  P.x += (P.tx - P.x) * Math.min(1, dt * 4); P.y += (P.ty - P.y) * Math.min(1, dt * 4);
  const moving = Math.abs(P.x - ox) > .05;
  spawn -= dt; if (spawn < 0 && zs.length < 28) { newZombie(); spawn = .32; }
  // the pistol: it turns to the nearest zombie in reach, else where you walk, and fires once it points at it
  let near = null, nd = RANGE;
  for (const z of zs) { const d = Math.hypot(z.x - P.x, z.y - P.y); if (d < nd) { nd = d; near = z; } }
  const want = near ? Math.atan2(near.y - 8 - (P.y - 8), near.x - P.x) : (moving ? Math.atan2(P.ty - P.y, P.tx - P.x) : P.aim);
  let diff = Math.atan2(Math.sin(want - P.aim), Math.cos(want - P.aim));
  P.aim += diff * Math.min(1, dt * 14);
  P.face = Math.cos(P.aim) >= 0 ? 1 : -1;
  P.cool -= dt; P.flash = Math.max(0, P.flash - dt); P.recoil = Math.max(0, P.recoil - dt * 6);
  if (near && P.cool <= 0 && Math.abs(diff) < .2) {
    P.cool = .55; P.flash = .06; P.recoil = 1;
    const dx = Math.cos(P.aim), dy = Math.sin(P.aim);
    bullets.push({ x: P.x + dx * 14, y: P.y - 8 + dy * 14, vx: dx * 300, vy: dy * 300, life: .5 });
  }
  for (const b of bullets) {
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    for (const z of zs) if (!z.dead && Math.hypot(z.x - b.x, z.y - 10 - b.y) < 7) { hurt(z, { x: b.vx * .02, y: b.vy * .02 }); b.life = 0; break; }
  }
  bullets = bullets.filter((b) => b.life > 0);
  for (const z of zs) {
    const dx = P.x - z.x, dy = P.y - z.y, d = Math.hypot(dx, dy) || 1;
    z.x += dx / d * z.sp * dt; z.y += dy / d * z.sp * dt; z.f += dt * 6; z.left = dx < 0; z.hit = Math.max(0, z.hit - dt);
    if (!z.dead && d < RING + 5 && z.hit <= 0) hurt(z, { x: -dx / d * 10, y: -dy / d * 10 });
  }
  zs = zs.filter((z) => !z.dead && z.x > -40 && z.x < W + 40 && z.y > -40 && z.y < H + 60);
  for (const s of splats) s.a -= dt * .12; splats = splats.filter((s) => s.a > 0).slice(-40);
  for (const p of pops) { p.y += p.v * dt; p.a -= dt * 1.2; } pops = pops.filter((p) => p.a > 0);
  document.getElementById('kills').textContent = kills;
}
const blit = (n, x, y) => { const r = S[n]; if (r) cx.drawImage(sheet, r[0], r[1], r[2], r[3], Math.round(x - r[2] / 2), Math.round(y - r[3]), r[2], r[3]); };
function draw() {
  cx.imageSmoothingEnabled = false;
  for (let y = 0; y < H; y += 16) for (let x = 0; x < W; x += 16) {
    const r = S['floor_hosp_' + (((x * 7 + y * 13) / 16) % 4 | 0)] || S.floor_hosp_0;
    if (r) cx.drawImage(sheet, r[0], r[1], 16, 16, x, y, 16, 16);
  }
  cx.fillStyle = 'rgba(14,16,19,.45)'; cx.fillRect(0, 0, W, H);
  for (const s of splats) { cx.globalAlpha = Math.min(1, s.a); const r = S[s.n]; if (r) cx.drawImage(sheet, r[0], r[1], r[2], r[3], s.x - r[2] / 2, s.y - r[3] / 2, r[2], r[3]); }
  cx.globalAlpha = 1;
  const things = zs.map((z) => ({ y: z.y, d: () => { if (z.hit > 0) cx.filter = 'brightness(2.4)'; blit(`${z.kind}_${z.left ? 'l' : 'r'}_${z.f % 4 | 0}`, z.x, z.y); cx.filter = 'none'; } }));
  things.push({ y: P.y, d: drawSurvivor });
  things.sort((a, b) => a.y - b.y).forEach((o) => o.d());
  // bullets: a bright head and a short hot trail
  for (const b of bullets) {
    cx.strokeStyle = 'rgba(242,196,58,.6)'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(b.x - b.vx * .025, b.y - b.vy * .025); cx.lineTo(b.x, b.y); cx.stroke();
    cx.fillStyle = '#fff6c0'; cx.fillRect(Math.round(b.x) - 1, Math.round(b.y) - 1, 2, 2);
  }
  for (const p of pops) {
    cx.globalAlpha = Math.max(0, p.a); cx.font = '8px "Press Start 2P"';
    cx.fillStyle = '#0a0b0d'; cx.fillText('+1', p.x - 7, p.y + 1); cx.fillStyle = '#f2c43a'; cx.fillText('+1', p.x - 8, p.y);
    if (p.coin) { const r = S.ui_coin; cx.drawImage(sheet, r[0], r[1], r[2], r[3], p.x + 8, p.y - 8, r[2], r[3]); }
  }
  cx.globalAlpha = 1;
}
function drawSurvivor() {
  cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(P.x, P.y, 7, 3, 0, 0, 7); cx.fill();
  const walking = Math.hypot(P.tx - P.x, P.ty - P.y) > 1;
  blit(`player_walk_${P.face > 0 ? 'r' : 'l'}_${walking ? (clock * 8 % 4 | 0) : 0}`, P.x, P.y);
  // the pistol in the hand, turned to where it aims (flipped when it points left)
  const r = S.g_pistol;
  if (r) {
    const dx = Math.cos(P.aim), dy = Math.sin(P.aim) * .75;
    cx.save(); cx.translate(Math.round(P.x + dx * (3 - P.recoil * 2)), Math.round(P.y - 8 + dy * (3 - P.recoil * 2)));
    cx.rotate(Math.atan2(dy, dx)); if (dx < 0) cx.scale(1, -1);
    cx.drawImage(sheet, r[0], r[1], r[2], r[3], -1, -r[3] / 2, r[2], r[3]); cx.restore();
    if (P.flash > 0) {
      const mx = P.x + dx * (r[2] + 3), my = P.y - 8 + dy * (r[2] + 3);
      cx.fillStyle = 'rgba(255,217,77,.85)'; cx.beginPath(); cx.arc(mx, my, 3, 0, 7); cx.fill();
      cx.fillStyle = '#fffbe0'; cx.beginPath(); cx.arc(mx, my, 1.5, 0, 7); cx.fill();
    }
  }
  // the ring of knives
  cx.strokeStyle = 'rgba(242,196,58,.18)'; cx.beginPath(); cx.ellipse(P.x, P.y - 9, RING, RING * .55, 0, 0, 7); cx.stroke();
  const k = S.w_knife;
  for (let i = 0; i < KNIVES; i++) {
    const a = spin + i * Math.PI * 2 / KNIVES, kx = P.x + Math.cos(a) * RING * .45, ky = P.y - 9 + Math.sin(a) * RING * .25;
    cx.save(); cx.translate(kx, ky); cx.rotate(Math.atan2(Math.sin(a) * .55, Math.cos(a)));
    cx.drawImage(sheet, k[0], k[1], k[2], k[3], 0, -k[3] / 2, k[2], k[3]); cx.restore();
  }
}
let last = 0, heroOn = true;
new IntersectionObserver((es) => { heroOn = es[0].isIntersecting; }).observe(cv);
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
  if (heroOn) { step(reduce ? dt * .3 : dt); draw(); }
  requestAnimationFrame(loop);
}

sheet.onload = () => {
  P.x = W / 2; P.y = narrow ? H * .24 : H * .45;
  for (let i = 0; i < 12; i++) newZombie();
  rail(); bosses(); arms(); applyLang();
  requestAnimationFrame(loop);
};
})();
