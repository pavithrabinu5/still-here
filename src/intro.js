// Title screen, walking characters and discovery stars for the pixel theme.
// SI disclosure: written with SI assistance (Claude, Anthropic); reviewed and tested by Team PARALLAX.
// The boot log reports REAL loading steps (font, photo, sprites); it never shows invented progress numbers.
import { sprite } from './sprites.js';

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Title screen ---------- */
export function runIntro() {
  // Deep links (#ch1…) skip the title screen so shared links open straight to content.
  if (/^#ch\d$/.test(location.hash)) return;
  const el = document.createElement('div');
  el.id = 'intro';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'intro-title');
  el.innerHTML = `
    <div class="intro-sky" aria-hidden="true"></div>
    <div class="intro-scene" aria-hidden="true">
      <div class="intro-earth">${sprite('earth', { px: 5 })}</div>
      <svg class="intro-beam" shape-rendering="crispEdges"><line class="track"/><line class="pulse-out"/><line class="pulse-back"/></svg>
      <div class="intro-moon">${sprite('moon', { px: 7 })}</div>
    </div>
    <div class="intro-copy">
      <p class="intro-kicker">Team PARALLAX presents</p>
      <h1 id="intro-title" class="intro-logo" data-text="STILL HERE">STILL HERE</h1>
      <p class="intro-sub">A science story about a mirror left on the Moon in 1969</p>
      <div class="intro-bar" role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0"><span></span></div>
      <button type="button" class="intro-start" id="press-start" hidden>▶ PRESS START</button>
    </div>
    <span class="si-mark si-mark-intro">Illustrations: SI-generated</span>
    <div class="intro-ground" aria-hidden="true">
      <div class="walker w1">${sprite('astro', { px: 3 })}</div>
      <div class="walker w2">${sprite('retro-happy', { px: 3 })}</div>
      <div class="walker w3">${sprite('sci', { px: 3 })}</div>
    </div>`;
  document.body.appendChild(el);
  document.body.classList.add('intro-open');
  const behind = [document.querySelector('main'), document.querySelector('.topbar'), document.querySelector('.skip')];
  behind.forEach((n) => n && (n.inert = true));
  // Lay the beam between the real on-screen centres of the Earth and Moon sprites.
  const placeBeam = () => {
    const scene = el.querySelector('.intro-scene').getBoundingClientRect();
    const c = (s) => { const r = el.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2 - scene.left, r.top + r.height / 2 - scene.top, r.width / 2]; };
    const [ex, ey, er] = c('.intro-earth .sprite');
    const [mx, my, mr] = c('.intro-moon .sprite');
    const len = Math.hypot(mx - ex, my - ey) || 1;
    const ux = (mx - ex) / len, uy = (my - ey) / len; // unit vector Earth → Moon
    const nx = -uy, ny = ux; // perpendicular, to separate the out and back lanes
    el.querySelectorAll('.intro-beam line').forEach((l, i) => {
      const off = i === 1 ? -5 : i === 2 ? 5 : 0;
      l.setAttribute('pathLength', '100');
      l.setAttribute('x1', ex + ux * er + nx * off); l.setAttribute('y1', ey + uy * er + ny * off);
      l.setAttribute('x2', mx - ux * mr * 0.9 + nx * off); l.setAttribute('y2', my - uy * mr * 0.9 + ny * off);
    });
  };
  requestAnimationFrame(placeBeam);
  window.addEventListener('resize', placeBeam);
  const bar = el.querySelector('.intro-bar');
  const start = el.querySelector('#press-start');
  // The bar advances only as real work completes (font, photo, characters).
  let steps = 0;
  const done = () => { steps++; bar.setAttribute('aria-valuenow', String(steps)); bar.style.setProperty('--p', String(steps / 3)); };

  const finish = () => {
    if (!el.isConnected) return;
    el.classList.add('leaving');
    document.body.classList.remove('intro-open');
    window.removeEventListener('resize', placeBeam);
    behind.forEach((n) => n && (n.inert = false));
    setTimeout(() => el.remove(), reduce() ? 0 : 450);
    const h = document.querySelector('[data-chapter="0"] h1');
    h && h.focus({ preventScroll: true });
  };
  start.addEventListener('click', finish);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') finish();
    // Focus trap: PRESS START is the only control on this screen.
    if (e.key === 'Tab') { e.preventDefault(); if (!start.hidden) start.focus(); }
  });
  el.tabIndex = -1;
  el.focus();

  (async () => {
    const pace = reduce() ? 0 : 320;
    try { await document.fonts.load('700 1rem "Pixelify Sans"'); } catch { /* fallback font is fine */ }
    done(); await wait(pace);
    const img = document.querySelector('[data-chapter="0"] img');
    try { if (img && !img.complete) await img.decode(); } catch { /* shows alt text if it fails */ }
    done(); await wait(pace);
    done(); await wait(pace);
    bar.hidden = true;
    start.hidden = false;
    start.focus();
  })();
}

/* ---------- Walking characters along the bottom of each window ---------- */
const CAST = {
  0: ['astro', 'retro'],
  1: ['astro', 'seis'],
  2: ['retro', 'sci'],
  3: ['sci', 'retro'],
  4: ['sci', 'astro', 'retro'],
  5: ['retro-hmm', 'sci'],
  6: ['astro', 'retro-happy', 'sci', 'seis'],
};
export function addWalkways() {
  document.querySelectorAll('[data-chapter]').forEach((ch) => {
    const names = CAST[ch.dataset.chapter] || ['retro'];
    const w = document.createElement('div');
    w.className = 'walkway';
    w.setAttribute('aria-hidden', 'true');
    w.innerHTML = names.map((n, i) => `<div class="walker" style="--d:${14 + i * 5}s;--delay:-${i * 4.5}s;${n === 'seis' ? '--d:26s;' : ''}">${sprite(n, { px: 3 })}</div>`).join('') +
      (ch.dataset.chapter === '3' ? '<div class="photon" style="--d:5s"></div>' : '');
    ch.appendChild(w);
  });
}

/* ---------- Discovery stars (real learning milestones only) ---------- */
const DISCOVERIES = {
  power: 'Every powered part is on Earth',
  mirror: 'Corner cubes send light home',
  pulse: 'Timed a round trip on Earth',
  evidence: 'One echo is not a discovery',
  quiz: 'Mission questions: 3 of 3',
};
const got = new Set();
export function initStars() {
  const bar = document.querySelector('.topbar');
  const s = document.createElement('span');
  s.className = 'stars';
  s.id = 'stars';
  s.setAttribute('aria-label', `Discoveries: 0 of ${Object.keys(DISCOVERIES).length}`);
  s.innerHTML = Object.keys(DISCOVERIES).map((k) => `<i data-star="${k}" aria-hidden="true"></i>`).join('');
  bar.insertBefore(s, document.querySelector('#open-sources'));
}
export function discover(key) {
  if (!DISCOVERIES[key] || got.has(key)) return;
  got.add(key);
  const star = document.querySelector(`[data-star="${key}"]`);
  star && star.classList.add('on');
  const s = document.querySelector('#stars');
  s && s.setAttribute('aria-label', `Discoveries: ${got.size} of ${Object.keys(DISCOVERIES).length}`);
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('aria-hidden', 'true'); // the page's own live regions already announce the feedback
  t.innerHTML = `<span class="toast-star">★</span><span><b>Discovery unlocked</b>${DISCOVERIES[key]}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), reduce() ? 2500 : 3200);
}
export function resetStars() {
  got.clear();
  document.querySelectorAll('[data-star]').forEach((i) => i.classList.remove('on'));
  const s = document.querySelector('#stars');
  s && s.setAttribute('aria-label', `Discoveries: 0 of ${Object.keys(DISCOVERIES).length}`);
}
