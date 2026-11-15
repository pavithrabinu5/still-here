// Prototype: one playable mission scene. Facts mirror the main story's sourced claims (S1, S3, S4, challenge resources).
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const items = {
  lm: {
    title: 'Lunar Module descent stage',
    needed: 'Batteries and rocket fuel while it flew.',
    now: 'Left behind as the launch pad for the ascent stage. It is a historic monument, not an active experiment.',
    src: 'Challenge resources; NSSDCA 1969-059C',
  },
  pse: {
    title: 'Passive Seismic Experiment',
    needed: 'Solar panels for power and a radio to send data — so it worked only in lunar daytime.',
    now: 'Stopped accepting commands on 27 August 1969. It is silent.',
    src: 'NSSDCA 1969-059C (S1)',
  },
  lrrr: {
    title: 'Laser Ranging Retro-Reflector',
    needed: 'Nothing on the Moon. It “required no power” — it is 100 glass corner cubes.',
    now: 'Laser stations on Earth still bounce light off it several times a month.',
    src: 'NSSDCA (S1), NASA 2020 (S4), NASA Goddard Apache Point (S3)',
  },
};
const found = new Set();
const body = $('#m-body');

function render(id) {
  const it = items[id];
  found.add(id);
  $$('.m-hot').forEach((h) => { h.setAttribute('aria-pressed', String(h.dataset.item === id)); h.classList.toggle('found', found.has(h.dataset.item)); });
  $('#m-count').textContent = `Found ${found.size} of 3`;
  let html = `<h2>${it.title}</h2>
    <p><strong>What it needed:</strong> ${it.needed}</p>
    <p><strong>Today:</strong> ${it.now}</p>
    <p class="muted small">Source: ${it.src}</p>`;
  if (id === 'lrrr') {
    html += `<p class="m-verdict"><strong>Discovery:</strong> this is the one still contributing to science. But how, with no power? Test it.</p>
      <button type="button" class="btn" id="m-fire">Fire a pulse from Earth</button>
      <p id="m-result" aria-live="polite"></p>`;
  } else if (found.size === 3) {
    html += '<p class="m-verdict">You have inspected everything. Which one is still in use? Check the reflector again.</p>';
  }
  body.innerHTML = html;
  const fire = $('#m-fire');
  if (fire) fire.addEventListener('click', firePulse);
}

$$('.m-hot').forEach((h) => h.addEventListener('click', () => render(h.dataset.item)));

const E = { x: 640, y: 92 }, R = { x: 205, y: 326 };
function firePulse() {
  const up = $('#m-beam-up'), down = $('#m-beam-down'), fire = $('#m-fire');
  $('#m-beam-label').setAttribute('opacity', '1');
  const done = () => {
    fire.disabled = false; fire.textContent = 'Fire again';
    $('#m-result').innerHTML = '<strong>The light came back — to the station on Earth.</strong> The laser supplied the energy; the station’s clock timed the round trip. The reflector only sent the light back. Real stations then calibrate, combine many returns and model the results over years.';
  };
  if (reduce()) { up.setAttribute('x2', R.x); up.setAttribute('y2', R.y); down.setAttribute('x2', E.x); down.setAttribute('y2', E.y); done(); return; }
  fire.disabled = true;
  up.setAttribute('x2', E.x); up.setAttribute('y2', E.y); down.setAttribute('x2', R.x); down.setAttribute('y2', R.y);
  const T = 2500, t0 = performance.now();
  const step = (now) => {
    const f = Math.min(1, (now - t0) / T);
    if (f <= 0.5) { const k = f / 0.5; up.setAttribute('x2', E.x + (R.x - E.x) * k); up.setAttribute('y2', E.y + (R.y - E.y) * k); }
    else { const k = (f - 0.5) / 0.5; up.setAttribute('x2', R.x); up.setAttribute('y2', R.y); down.setAttribute('x2', R.x + (E.x - R.x) * k); down.setAttribute('y2', R.y + (E.y - R.y) * k); }
    if (f < 1) requestAnimationFrame(step); else done();
  };
  requestAnimationFrame(step);
}
