// Still Here — story interactions. SI disclosure: written with SI assistance (Claude, Anthropic); reviewed and tested by Team PARALLAX.
import { C_KM_PER_S, oneWayDistanceKm, formatKm, cornerPath, flatPath, returnErrorDeg } from './physics.js';
import { sprite } from './sprites.js';
import { runIntro, addWalkways, initStars, discover, resetStars } from './intro.js';

document.documentElement.classList.add('js');

/* ---------------- Pixel theme: sprites, window title bars, guide ---------------- */
document.querySelectorAll('.cast-slot').forEach((s) => {
  s.outerHTML = sprite(s.dataset.sprite, { px: 6, label: s.dataset.label || '' });
});
document.querySelectorAll('[data-chapter]').forEach((ch, i, all) => {
  const tb = document.createElement('div');
  tb.className = 'titlebar';
  tb.setAttribute('aria-hidden', 'true');
  tb.innerHTML = `<span class="tb-icon"></span><span class="tb-name">still_here.exe — ${ch.dataset.title}</span><span class="tb-level">${i === 0 ? 'Start' : i === all.length - 1 ? 'The end' : `Level ${i} of ${all.length - 2}`}</span>`;
  ch.prepend(tb);
});
const guideLines = {
  1: 'Two of us were set down here. Only one of us still works. Can you work out why?',
  2: 'Nobody comes up here to point me at Earth. So how do I aim?',
  3: 'Here comes a pulse! I just send it back. The station on Earth does all the timing.',
  4: 'Getting a few photons home is hard. Turning them into knowledge takes years.',
  5: 'Your turn. Show the mission team what you’ve figured out.',
};
for (const [i, line] of Object.entries(guideLines)) {
  const head = document.querySelector(`[data-chapter="${i}"] .chapter-head`);
  if (!head) continue;
  const g = document.createElement('div');
  g.className = 'guide';
  g.dataset.guide = i;
  g.innerHTML = `<span class="guide-sprite">${sprite('retro', { px: 4 })}</span><p class="bubble"><span class="tag tag-fiction">Imagined voice</span>${line}</p>`;
  head.after(g);
}
addWalkways();
initStars();
// Visible watermark required by the 2026 Space Apps rules for SI-generated images:
// shown in each window's character strip, beside the illustrations.
document.querySelectorAll('.walkway').forEach((w) => {
  const mark = document.createElement('span');
  mark.className = 'si-mark';
  mark.textContent = 'Illustrations: SI-generated';
  w.appendChild(mark);
});
function setMood(ch, mood) {
  const g = document.querySelector(`[data-guide="${ch}"]`);
  if (!g) return;
  g.dataset.mood = mood;
  g.querySelector('.guide-sprite').innerHTML = sprite(mood === 'happy' ? 'retro-happy' : mood === 'hmm' ? 'retro-hmm' : 'retro', { px: 4 });
}
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------- Chapter navigation ---------------- */
const chapters = $$('[data-chapter]');
const progress = $('#progress-list');
let current = 0;

chapters.forEach((ch, i) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.goto = String(i);
  b.innerHTML = `<span class="dot" aria-hidden="true"></span><span class="sr-only">Chapter ${i}: </span><span class="ptitle">${ch.dataset.title}</span>`;
  li.appendChild(b);
  progress.appendChild(li);
});

function show(i, { focus = true, push = true } = {}) {
  i = Math.max(0, Math.min(chapters.length - 1, i));
  current = i;
  chapters.forEach((ch, k) => { ch.hidden = k !== i; });
  $$('button', progress).forEach((b, k) => {
    if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    b.classList.toggle('done', k < i);
  });
  if (push) history.replaceState(null, '', i === 0 ? '#start' : `#ch${i}`);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  if (focus) { const h = $('h1, h2', chapters[i]); h && h.focus({ preventScroll: true }); }
  document.title = i === 0 ? 'Still Here — the Apollo 11 laser reflector' : `${chapters[i].dataset.title} · Still Here`;
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-next],[data-prev],[data-goto]');
  if (!t) return;
  if (t.matches('a')) e.preventDefault();
  if (t.hasAttribute('data-next')) show(current + 1);
  else if (t.hasAttribute('data-prev')) show(current - 1);
  else show(Number(t.dataset.goto));
});

/* ---------------- Sources dialog ---------------- */
const dlg = $('#sources');
let lastFocus = null;
function openSources(id) {
  lastFocus = document.activeElement;
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  $$('.srclist li', dlg).forEach((li) => li.classList.remove('hl'));
  if (id) {
    const li = $(`#src-${id}`, dlg);
    if (li) { li.classList.add('hl'); li.scrollIntoView({ block: 'center' }); }
  }
  $('#close-sources').focus();
}
function closeSources() { dlg.close ? dlg.close() : dlg.removeAttribute('open'); }
dlg.addEventListener('close', () => { lastFocus && lastFocus.focus && lastFocus.focus(); });
dlg.addEventListener('click', (e) => { if (e.target === dlg) closeSources(); });
$('#open-sources').addEventListener('click', () => openSources());
$('#close-sources').addEventListener('click', closeSources);
document.addEventListener('click', (e) => {
  const c = e.target.closest('.cite');
  if (c) openSources(c.dataset.src);
  if (e.target.closest('[data-open-sources]')) openSources();
});
$$('.cite').forEach((c) => c.setAttribute('aria-label', `Source ${c.dataset.src}`));

/* ---------------- Chapter 1: hotspots ---------------- */
// Panels are visible in the HTML (for no-JS readers); JS hides all but the prompt.
$$('.inspect').forEach((p) => { p.hidden = p.dataset.panel !== 'none'; });
$$('[data-hotspot]').forEach((h) => h.addEventListener('click', () => {
  const which = h.dataset.hotspot;
  $$('[data-hotspot]').forEach((o) => o.setAttribute('aria-pressed', String(o === h)));
  $$('.inspect').forEach((p) => { p.hidden = p.dataset.panel !== which; });
}));

/* ---------------- Chapter 1: sorter ---------------- */
const parts = [
  { id: 'cubes', name: '100 glass corner cubes', where: 'moon', why: 'Yes — on the Moon. They are the whole reflector: shaped glass that needs no power.' },
  { id: 'laser', name: 'Pulsed laser', where: 'earth', why: 'On Earth. The laser supplies all the light — and all the energy — for the measurement.' },
  { id: 'scope', name: 'Large telescope (3.5 m at Apache Point)', where: 'earth', why: 'On Earth. It aims the pulse and collects the faint returning light.' },
  { id: 'detector', name: 'Light detector', where: 'earth', why: 'On Earth. Sensitive detectors catch the few photons that make it back.' },
  { id: 'clock', name: 'Precise clock', where: 'earth', why: 'On Earth. Both “sent” and “received” times are recorded at the station.' },
];
const answers = {};
const sortList = $('#sort-list');
parts.forEach((p) => {
  const li = document.createElement('li');
  li.className = 'sort-item';
  li.innerHTML = `
    <span class="sort-name" id="sn-${p.id}">${p.name}</span>
    <span class="sort-btns" role="group" aria-labelledby="sn-${p.id}">
      <button type="button" data-part="${p.id}" data-where="moon" aria-pressed="false">On the Moon</button>
      <button type="button" data-part="${p.id}" data-where="earth" aria-pressed="false">On Earth</button>
    </span>
    <span class="sort-fb" id="fb-${p.id}" aria-live="polite"></span>`;
  sortList.appendChild(li);
});
sortList.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-part]');
  if (!b) return;
  const p = parts.find((x) => x.id === b.dataset.part);
  answers[p.id] = b.dataset.where;
  $$(`button[data-part="${p.id}"]`, sortList).forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
  const ok = b.dataset.where === p.where;
  const fb = $(`#fb-${p.id}`);
  fb.textContent = ok ? `✓ ${p.why}` : `Not quite — try again. ${p.where === 'earth' ? 'Nothing on the Moon could power this.' : 'Think: what did Aldrin actually carry?'}`;
  fb.className = `sort-fb ${ok ? 'ok' : 'no'}`;
  b.closest('.sort-item').dataset.state = ok ? 'ok' : 'no';
  const allOk = parts.every((x) => answers[x.id] === x.where);
  setMood(1, allOk ? 'happy' : ok ? 'calm' : 'hmm');
  if (allOk) discover('power');
  $('#sort-result').innerHTML = allOk
    ? '<strong>Every powered part is on Earth.</strong> The reflector just has to sit still and send light back. That is why it still works decades later.'
    : '';
});

/* ---------------- Chapter 2: corner cube ---------------- */
const svgNS = 'http://www.w3.org/2000/svg';
const cubeSvg = $('#cube-svg');
const angle = $('#angle');
const angleOut = $('#angle-out');
const cubeReadout = $('#cube-readout');
const g = document.createElementNS(svgNS, 'g');
g.setAttribute('transform', 'translate(0,140) scale(1,-1)');
cubeSvg.appendChild(g);
const el = (tag, attrs) => { const e = document.createElementNS(svgNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

const triedModes = new Set();
let angleMoved = false;
function drawCube() {
  const a = Number(angle.value);
  const mode = $('input[name="mode"]:checked').value;
  angleOut.textContent = `${a}°`;
  g.replaceChildren();
  let res;
  if (mode === 'corner') {
    g.append(el('line', { x1: 0, y1: 0, x2: 120, y2: 0, class: 'mirror' }), el('line', { x1: 0, y1: 0, x2: 0, y2: 120, class: 'mirror' }));
    g.append(el('path', { d: 'M0 12 L12 12 L12 0', class: 'rightangle' }));
    res = cornerPath(a, 100, 1.5);
  } else {
    res = flatPath(a, 0, 100, 1.5);
    g.append(el('line', { x1: -5, y1: 15, x2: 125, y2: 15, class: 'mirror' }));
  }
  const pts = res.points;
  // incoming
  g.append(el('polyline', { points: pts.slice(0, 2).map((p) => `${p.x},${p.y}`).join(' '), class: 'ray ray-in' }));
  g.append(el('polyline', { points: pts.slice(1).map((p) => `${p.x},${p.y}`).join(' '), class: 'ray ray-out' }));
  // dashed "way home" guide along the exact reverse of the incoming ray
  const s = pts[0];
  g.append(el('line', { x1: s.x, y1: s.y, x2: s.x - res.dIn.x * 40, y2: s.y - res.dIn.y * 40, class: 'home' }));
  const src = el('circle', { cx: s.x, cy: s.y, r: 5, class: 'src' });
  g.append(src);
  const err = returnErrorDeg(res.dIn, res.dOut);
  triedModes.add(mode);
  if (triedModes.size === 2 && angleMoved) discover('mirror');
  cubeSvg.querySelector('desc').textContent = mode === 'corner'
    ? `Corner reflector: beam arrives at ${a} degrees, bounces off both faces, and leaves parallel to how it arrived, heading back toward the source.`
    : `Flat mirror: beam arrives at ${a} degrees and leaves ${err.toFixed(0)} degrees away from the direction back to the source.`;
  cubeReadout.innerHTML = mode === 'corner'
    ? `<strong>Back toward the source.</strong> Off by ${err < 0.01 ? '0' : err.toFixed(1)}° at ${a}°. Try any angle.`
    : err < 0.5
      ? '<strong>Straight back</strong> — but only because the beam hits the mirror head-on.'
      : `<strong>Misses home by ${err.toFixed(0)}°.</strong> A flat mirror only returns light if it faces the source exactly. Someone would have to keep re-aiming it.`;
}
angle.addEventListener('input', () => { angleMoved = true; drawCube(); });
$$('input[name="mode"]').forEach((r) => r.addEventListener('change', () => {
  // Flat mode allows 90° (head-on) so the "only when facing" case is reachable.
  angle.max = r.value === 'flat' && r.checked ? '90' : '75';
  if (Number(angle.value) > Number(angle.max)) angle.value = angle.max;
  drawCube();
}));
drawCube();

/* ---------------- Chapter 3: light path + calculator ---------------- */
const rt = $('#rt');
const rtOut = $('#rt-out');
const eqNum = $('#eq-num');
const dist = $('#dist');
function updateCalc() {
  const t = Number(rt.value);
  rtOut.textContent = `${t.toFixed(3)} s`;
  const d = oneWayDistanceKm(t);
  eqNum.innerHTML = `${C_KM_PER_S.toLocaleString('en-US')} km/s × ${t.toFixed(3)} s ÷ 2`;
  dist.textContent = formatKm(d);
}
rt.addEventListener('input', updateCalc);
updateCalc();

const X0 = 176, X1 = 852;
const beamOut = $('#beam-out'), beamBack = $('#beam-back'), pulse = $('#pulse'), clock = $('#clock');
const fire = $('#fire');
let raf = 0;
function setPath(frac) {
  // frac 0..1 over the whole round trip
  if (frac <= 0.5) {
    const x = X0 + (X1 - X0) * (frac / 0.5);
    beamOut.setAttribute('x2', x); beamBack.setAttribute('x2', X1);
    pulse.setAttribute('cx', x); pulse.setAttribute('cy', 144);
  } else {
    const x = X1 - (X1 - X0) * ((frac - 0.5) / 0.5);
    beamOut.setAttribute('x2', X1); beamBack.setAttribute('x2', x);
    pulse.setAttribute('cx', x); pulse.setAttribute('cy', 156);
  }
}
function finishPulse(t) {
  clock.textContent = `${t.toFixed(3)} s`;
  fire.disabled = false;
  fire.textContent = 'Fire again';
  $('#path-svg').classList.add('returned');
  $('#calc').classList.add('lit');
  pulse.setAttribute('opacity', '0');
  setMood(3, 'happy');
  discover('pulse');
}
fire.addEventListener('click', () => {
  cancelAnimationFrame(raf);
  const t = Number(rt.value);
  $('#path-svg').classList.remove('returned');
  if (reduceMotion()) { setPath(1); beamOut.setAttribute('x2', X1); finishPulse(t); return; }
  fire.disabled = true;
  pulse.setAttribute('opacity', '1');
  const start = performance.now();
  const step = (now) => {
    const el = (now - start) / 1000;
    const frac = Math.min(1, el / t);
    setPath(frac);
    clock.textContent = `${Math.min(el, t).toFixed(3)} s`;
    if (frac < 1) raf = requestAnimationFrame(step); else finishPulse(t);
  };
  raf = requestAnimationFrame(step);
});

/* ---------------- Chapter 4: tabs ---------------- */
const tabs = $$('#steps [role="tab"]');
function selectTab(i, focus) {
  tabs.forEach((t, k) => {
    const on = k === i;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    if (on) t.classList.add('seen');
  });
  if (tabs.every((t) => t.classList.contains('seen'))) discover('evidence');
  if (focus) tabs[i].focus();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(i));
  t.addEventListener('keydown', (e) => {
    const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in map) { e.preventDefault(); selectTab((i + map[e.key] + tabs.length) % tabs.length, true); }
    if (e.key === 'Home') { e.preventDefault(); selectTab(0, true); }
    if (e.key === 'End') { e.preventDefault(); selectTab(tabs.length - 1, true); }
  });
});
selectTab(0);

/* ---------------- Chapter 5: quiz ---------------- */
const quiz = [
  {
    q: 'A friend says: “The reflector must have a battery, because it sends a signal back to Earth.” What’s the best reply?',
    opts: [
      { t: 'It doesn’t send its own signal. It only reflects the laser light that Earth sends.', ok: true, fb: 'Right. All the light comes from the laser on Earth. The corner cubes just send it back, so nothing on the Moon needs power.' },
      { t: 'It uses the seismometer’s solar panels.', ok: false, fb: 'No. The seismometer was a separate, powered experiment. It stopped accepting commands in August 1969. The reflector was never connected to it and needed no power.' },
      { t: 'It recharges in sunlight each lunar day.', ok: false, fb: 'No. The reflector has no battery and no solar panel. It is glass corner cubes in a frame.' },
    ],
  },
  {
    q: 'A station measures a round trip of 2.6 seconds (a practice value). Which calculation gives the one-way distance?',
    opts: [
      { t: 'Speed of light × 2.6 s', ok: false, fb: 'That’s the distance for the whole trip, out and back — twice too far.' },
      { t: 'Speed of light × 2.6 s ÷ 2', ok: true, fb: `Right. The time covers out and back, so halve it: about ${formatKm(oneWayDistanceKm(2.6))} km. Real ranging then corrects for the atmosphere, motion and the instrument.` },
      { t: '2.6 s ÷ speed of light', ok: false, fb: 'Check the units: seconds ÷ (km/s) gives seconds², not kilometres. Distance = speed × time.' },
    ],
  },
  {
    q: 'A station detects photons returning from the Apollo 11 reflector tonight. What can scientists conclude from that alone?',
    opts: [
      { t: 'That the Moon is moving away from Earth.', ok: false, fb: 'Not from one night. The 3.8 cm-per-year drift came from decades of calibrated measurements to several reflectors.' },
      { t: 'That the light made the round trip, and roughly how long it took — one data point in a much longer record.', ok: true, fb: 'Right. Detection is step one. Calibration, quality checks, many repeats and careful modelling turn returns into knowledge.' },
      { t: 'That the Moon has a fluid core.', ok: false, fb: 'Not from one detection. Evidence for a fluid core came from long-term measurements of tiny wobbles, across several reflectors.' },
    ],
  },
];
const quizEl = $('#quiz');
const chosen = {};
quiz.forEach((item, qi) => {
  const fs = document.createElement('fieldset');
  fs.className = 'qitem';
  fs.innerHTML = `<legend><span class="qn">${qi + 1}</span> ${item.q}</legend>` +
    item.opts.map((o, oi) => `<label class="opt"><input type="radio" name="q${qi}" value="${oi}" /> <span>${o.t}</span></label>`).join('') +
    `<p class="qfb" id="qfb-${qi}" aria-live="polite"></p>`;
  quizEl.appendChild(fs);
  fs.addEventListener('change', (e) => {
    const oi = Number(e.target.value);
    const o = item.opts[oi];
    chosen[qi] = o.ok;
    const fb = $(`#qfb-${qi}`);
    fb.textContent = `${o.ok ? 'Correct. ' : 'Not quite. '}${o.fb}`;
    fb.className = `qfb ${o.ok ? 'ok' : 'no'}`;
    $$('.opt', fs).forEach((l, k) => { l.dataset.state = k === oi ? (o.ok ? 'ok' : 'no') : ''; });
    const n = Object.values(chosen).filter(Boolean).length;
    const answered = Object.keys(chosen).length;
    setMood(5, answered === quiz.length && n === quiz.length ? 'happy' : o.ok ? 'calm' : 'hmm');
    if (answered === quiz.length && n === quiz.length) discover('quiz');
    $('#quiz-score').textContent = answered === quiz.length ? `${n} of ${quiz.length} correct${n === quiz.length ? ' — you’re ready for the ending.' : '. Read the feedback and try again.'}` : '';
  });
});

/* ---------------- Mission files folder (ending) ---------------- */
const folder = $('#folder');
const folderFront = $('#folder-front');
const folderFiles = $('#folder-files');
function setFolder(open) {
  folder.dataset.open = open ? 'true' : 'false';
  folderFront.setAttribute('aria-expanded', String(open));
  folderFiles.inert = !open; // closed files are out of the tab order
  folderFront.querySelector('.folder-meta').textContent = open ? '4 key sources · click a file' : '4 key sources · click to open';
}
setFolder(false);
folderFront.addEventListener('click', () => setFolder(folder.dataset.open !== 'true'));
folder.addEventListener('keydown', (e) => { if (e.key === 'Escape' && folder.dataset.open === 'true') { setFolder(false); folderFront.focus(); } });
folderFiles.addEventListener('click', (e) => { const f = e.target.closest('[data-file-src]'); if (f) openSources(f.dataset.fileSrc); });

/* ---------------- Restart ---------------- */
function resetAll() {
  $$('[data-hotspot]').forEach((o) => o.setAttribute('aria-pressed', 'false'));
  $$('.inspect').forEach((p) => { p.hidden = p.dataset.panel !== 'none'; });
  for (const k in answers) delete answers[k];
  $$('button[data-part]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  $$('.sort-fb').forEach((f) => { f.textContent = ''; f.className = 'sort-fb'; });
  $$('.sort-item').forEach((i) => { delete i.dataset.state; });
  $('#sort-result').textContent = '';
  angle.value = 40; angle.max = 75; $('input[name="mode"][value="corner"]').checked = true; drawCube();
  cancelAnimationFrame(raf); fire.disabled = false; fire.textContent = 'Fire a pulse'; clock.textContent = '0.000 s';
  setPath(0); pulse.setAttribute('opacity', '0'); $('#path-svg').classList.remove('returned'); $('#calc').classList.remove('lit');
  rt.value = 2.5; updateCalc();
  tabs.forEach((t) => t.classList.remove('seen')); selectTab(0);
  for (const k in chosen) delete chosen[k];
  $$('#quiz input').forEach((i) => { i.checked = false; });
  $$('.opt').forEach((l) => { l.dataset.state = ''; });
  $$('.qfb').forEach((f) => { f.textContent = ''; f.className = 'qfb'; });
  $('#quiz-score').textContent = '';
  [1, 3, 5].forEach((c) => setMood(c, 'calm'));
  triedModes.clear(); angleMoved = false; resetStars(); setFolder(false);
}
$('#restart').addEventListener('click', () => { resetAll(); show(0); });

/* ---------------- Boot + deep links ---------------- */
const fromHash = () => { const m = location.hash.match(/^#ch(\d)$/); return m ? Number(m[1]) : 0; };
window.addEventListener('hashchange', () => { if (fromHash() !== current) show(fromHash(), { push: false }); });
show(fromHash(), { focus: false, push: false });
runIntro();
