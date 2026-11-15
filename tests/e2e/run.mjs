// End-to-end journey test. Usage: npm run build && npm run preview  (in another shell)  then  npm run test:e2e
// Env: BASE (default http://localhost:4173), SHOTS (screenshot dir, default ./tests/e2e/shots)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:4173';
const SHOTS = process.env.SHOTS || path.resolve('tests/e2e/shots');
fs.mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); };

const browser = await chromium.launch();

async function journey(label, viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, reducedMotion: opts.reducedMotion ? 'reduce' : 'no-preference', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  const external = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push('requestfailed ' + r.url()));
  page.on('request', (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) external.push(r.url()); });
  if (opts.offline) await ctx.route(/^(?!http:\/\/localhost)/, (r) => r.abort());

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  // Title screen: boot log must finish with real steps, then PRESS START enters the story.
  await page.waitForSelector('#press-start:not([hidden])', { timeout: 8000 });
  check(`${label}: loading bar completed its 3 real steps`, (await page.getAttribute('.intro-bar', 'aria-valuenow')) === '3');
  check(`${label}: SI watermark visible`, await page.isVisible('.si-mark'));
  check(`${label}: PRESS START is focused`, await page.evaluate(() => document.activeElement?.id === 'press-start'));
  await page.screenshot({ path: path.join(SHOTS, `${label}-intro.png`) });
  await page.click('#press-start');
  await page.waitForSelector('#intro', { state: 'detached', timeout: 3000 });
  check(`${label}: title screen closes and story is interactive`, await page.evaluate(() => !document.querySelector('main').inert));
  const shot = async (n) => page.screenshot({ path: path.join(SHOTS, `${label}-${n}.png`), fullPage: true });
  const overflow = async (n) => {
    const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`${label}: no horizontal overflow at ${n}`, o <= 1, `excess ${o}px`);
  };
  // A chapter counts as visible only if it is actually rendered; fail loudly if more than one is.
  const visibleChapter = async () => {
    const shown = await page.evaluate(() => [...document.querySelectorAll('[data-chapter]')].filter((c) => getComputedStyle(c).display !== 'none').map((c) => c.dataset.chapter));
    if (shown.length !== 1) check(`${label}: exactly one chapter rendered`, false, `rendered: ${shown.join(',')}`);
    return shown[0];
  };

  // 0 opening
  check(`${label}: opening visible`, (await visibleChapter()) === '0');
  const imgsOk = await page.evaluate(() => [...document.images].filter((i) => i.closest('[data-chapter="0"]')).every((i) => i.complete && i.naturalWidth > 0));
  check(`${label}: hero image loaded`, imgsOk);
  await shot('0-opening'); await overflow('opening');

  // 1 site
  await page.click('[data-chapter="0"] [data-next]');
  check(`${label}: chapter 1 shown`, (await visibleChapter()) === '1');
  check(`${label}: focus moved to chapter heading`, await page.evaluate(() => document.activeElement?.id === 'h1'));
  await page.waitForFunction(() => { const i = document.querySelector('[data-chapter="1"] img'); return i.complete && i.naturalWidth > 0; });
  await page.click('[data-hotspot="pse"]');
  check(`${label}: seismometer panel opens`, await page.isVisible('[data-panel="pse"]'));
  await page.click('[data-hotspot="lrrr"]');
  check(`${label}: reflector panel opens`, await page.isVisible('[data-panel="lrrr"]') && !(await page.isVisible('[data-panel="pse"]')));
  await shot('1-site');
  // wrong then right
  await page.click('button[data-part="laser"][data-where="moon"]');
  check(`${label}: wrong sort gives corrective feedback`, (await page.textContent('#fb-laser')).startsWith('Not quite'));
  const correct = { cubes: 'moon', laser: 'earth', scope: 'earth', detector: 'earth', clock: 'earth' };
  for (const [p, w] of Object.entries(correct)) await page.click(`button[data-part="${p}"][data-where="${w}"]`);
  check(`${label}: sorter completion message`, (await page.textContent('#sort-result')).includes('Every powered part is on Earth'));
  await page.locator('#sorter').scrollIntoViewIfNeeded();
  await shot('1-sorted'); await overflow('site');

  // 2 cube
  await page.click('[data-chapter="1"] [data-next]');
  check(`${label}: chapter 2 shown`, (await visibleChapter()) === '2');
  for (const v of ['15', '75', '52']) {
    await page.locator('#angle').fill(v);
    const t = await page.textContent('#cube-readout');
    check(`${label}: corner returns light at ${v}°`, t.includes('Off by 0°'), t.trim());
  }
  await page.click('input[name="mode"][value="flat"]');
  await page.locator('#angle').fill('50');
  check(`${label}: flat mirror misses at 50°`, (await page.textContent('#cube-readout')).includes('Misses home by 80°'));
  await page.locator('#angle').fill('90');
  check(`${label}: flat mirror head-on returns`, (await page.textContent('#cube-readout')).includes('Straight back'));
  await page.locator('#angle').fill('50');
  await shot('2-flat');
  await page.click('input[name="mode"][value="corner"]');
  await shot('2-corner'); await overflow('cube');

  // 3 path
  await page.click('[data-chapter="2"] [data-next]');
  check(`${label}: chapter 3 shown`, (await visibleChapter()) === '3');
  const d25 = await page.textContent('#dist');
  check(`${label}: 2.5 s → 374,741 km`, d25 === '374,741', d25);
  await page.locator('#rt').fill('2.6');
  check(`${label}: 2.6 s → 389,730 km`, (await page.textContent('#dist')) === '389,730');
  await page.locator('#rt').fill('2.5');
  const t0 = Date.now();
  await page.click('#fire');
  if (!opts.reducedMotion) {
    check(`${label}: fire disabled while pulse travels`, await page.isDisabled('#fire'));
    await page.waitForTimeout(1250);
    await shot('3-midflight');
  }
  await page.waitForFunction(() => !document.querySelector('#fire').disabled, null, { timeout: 6000 });
  const elapsed = (Date.now() - t0) / 1000;
  check(`${label}: stopwatch ends at 2.500 s`, (await page.textContent('#clock')) === '2.500 s');
  if (opts.reducedMotion) check(`${label}: reduced motion skips animation`, elapsed < 1.0, `${elapsed.toFixed(2)} s`);
  else check(`${label}: animation lasts the chosen round trip`, elapsed >= 2.4 && elapsed < 4, `${elapsed.toFixed(2)} s`);
  await page.click('.why summary');
  await shot('3-returned'); await overflow('path');

  // 4 evidence
  await page.click('[data-chapter="3"] [data-next]');
  check(`${label}: chapter 4 shown`, (await visibleChapter()) === '4');
  await page.focus('#tab-0');
  await page.keyboard.press('ArrowRight');
  check(`${label}: arrow key moves tab`, await page.isVisible('#step-1') && (await page.evaluate(() => document.activeElement.id)) === 'tab-1');
  await page.keyboard.press('End');
  check(`${label}: End key selects last step`, await page.isVisible('#step-4'));
  await page.click('#tab-3');
  await page.click('#tab-2');
  await shot('4-evidence'); await overflow('evidence');

  // 5 quiz
  await page.click('[data-chapter="4"] [data-next]');
  check(`${label}: chapter 5 shown`, (await visibleChapter()) === '5');
  await page.check('input[name="q0"][value="1"]');
  check(`${label}: wrong quiz answer explains`, (await page.textContent('#qfb-0')).startsWith('Not quite'));
  await page.check('input[name="q0"][value="0"]');
  await page.check('input[name="q1"][value="1"]');
  await page.check('input[name="q2"][value="1"]');
  check(`${label}: quiz all correct`, (await page.textContent('#quiz-score')).startsWith('3 of 3'));
  await shot('5-quiz'); await overflow('quiz');

  // 6 end
  await page.click('[data-chapter="5"] [data-next]');
  check(`${label}: ending shown`, (await visibleChapter()) === '6');
  check(`${label}: folder starts closed with files out of tab order`, await page.evaluate(() => document.querySelector('#folder-files').inert === true));
  await page.click('#folder-front');
  check(`${label}: folder opens (aria-expanded)`, (await page.getAttribute('#folder-front', 'aria-expanded')) === 'true');
  await page.waitForTimeout(700);
  await page.locator('#folder').scrollIntoViewIfNeeded();
  await shot('6-folder-open');
  // click the visible name tab, as a person would
  await page.click('[data-file-src="S3"]', { position: { x: 30, y: 14 } });
  check(`${label}: folder file opens its source`, await page.isVisible('#sources[open]') && await page.evaluate(() => document.querySelector('#src-S3').classList.contains('hl')));
  await page.keyboard.press('Escape');
  await page.click('#folder-front');
  check(`${label}: folder closes again`, (await page.getAttribute('#folder-front', 'aria-expanded')) === 'false');
  await shot('6-end'); await overflow('end');

  // sources dialog from a citation, then close with Escape
  await page.click('[data-chapter="6"] .cite[data-src="S3"]');
  check(`${label}: citation opens sources dialog`, await page.isVisible('#sources[open]'));
  check(`${label}: cited source highlighted`, await page.evaluate(() => document.querySelector('#src-S3').classList.contains('hl')));
  await shot('7-sources');
  await page.keyboard.press('Escape');
  check(`${label}: Escape closes dialog`, !(await page.isVisible('#sources[open]')));

  check(`${label}: 5 of 5 discoveries earned by the journey`, (await page.locator('[data-star].on').count()) === 5);

  // back navigation
  await page.click('[data-chapter="6"] [data-prev]');
  check(`${label}: back goes to chapter 5`, (await visibleChapter()) === '5');
  // progress jump + restart
  await page.click('[data-goto="6"]');
  await page.click('#restart');
  check(`${label}: restart returns to opening`, (await visibleChapter()) === '0');
  check(`${label}: restart clears quiz and sorter`, await page.evaluate(() => !document.querySelector('#quiz input:checked') && document.querySelector('#sort-result').textContent === ''));

  // stars: all five real milestones were reached during this journey
  check(`${label}: restart clears discoveries`, (await page.locator('[data-star].on').count()) === 0);

  // deep link skips the title screen
  await page.goto(BASE + '/#ch3', { waitUntil: 'networkidle' });
  check(`${label}: deep link #ch3 opens chapter 3`, (await visibleChapter()) === '3');
  check(`${label}: deep link skips title screen`, (await page.locator('#intro').count()) === 0);

  check(`${label}: no console errors/warnings`, errors.length === 0, errors.join(' | '));
  check(`${label}: no external network requests`, external.length === 0, external.join(' | '));
  await ctx.close();
}

async function keyboardOnly() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForSelector('#press-start:not([hidden])');
  await page.keyboard.press('Tab');
  check('keyboard: focus stays on title screen while it is open', await page.evaluate(() => !!document.activeElement.closest('#intro')));
  await page.focus('#press-start');
  await page.keyboard.press('Enter');
  await page.waitForSelector('#intro', { state: 'detached' });
  check('keyboard: Enter on PRESS START moves focus to the story heading', await page.evaluate(() => document.activeElement?.id === 'h0'));
  await page.focus('.skip');
  check('keyboard: skip link becomes visible on focus', await page.evaluate(() => document.querySelector('.skip').getBoundingClientRect().top >= 0));
  // Tab until the "Investigate" button is focused, then Enter
  let found = false;
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement.matches('[data-chapter="0"] [data-next]'))) { found = true; break; }
  }
  check('keyboard: can reach primary action', found);
  await page.keyboard.press('Enter');
  check('keyboard: Enter advances chapter', await page.evaluate(() => !document.querySelector('[data-chapter="1"]').hidden));
  // focus ring visible on a focused button
  await page.focus('[data-hotspot="lrrr"]');
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + ' ' + getComputedStyle(document.activeElement).outlineWidth);
  check('keyboard: visible focus outline', /^(solid|dashed)/.test(outline) && !outline.endsWith(' 0px'), outline);
  await page.keyboard.press('Enter');
  check('keyboard: hotspot operable with Enter', await page.isVisible('[data-panel="lrrr"]'));
  await page.screenshot({ path: path.join(SHOTS, 'kbd-focus.png') });
  await ctx.close();
}

async function noJs() {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'load' });
  const txt = await page.evaluate(() => document.body.innerText);
  check('no-JS: core explanation still readable', txt.includes('required no power') && txt.includes('Why divide by two?') && txt.includes('3.8 cm per year'));
  await ctx.close();
}

await journey('desktop', { width: 1440, height: 900 });
await journey('tablet', { width: 820, height: 1180 });
await journey('mobile', { width: 375, height: 812 });
await journey('mobile-reduced', { width: 375, height: 812 }, { reducedMotion: true });
await journey('offline', { width: 1280, height: 800 }, { offline: true });
await keyboardOnly();
await noJs();

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify(results, null, 2));
process.exit(failed.length ? 1 : 0);
