// Records the ≤30 s demo video of the real app with on-screen English captions.
// Usage: npm run preview (other shell), then node tests/e2e/record-demo.mjs  → demo/still-here-demo.webm
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = path.resolve('demo');
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: OUT, size: { width: 1280, height: 720 } } });
const page = await ctx.newPage();
const t0 = Date.now();
const cap = (text) => page.evaluate((t) => {
  let c = document.getElementById('demo-cap');
  if (!c) {
    c = document.createElement('div'); c.id = 'demo-cap';
    c.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:999;max-width:88%;padding:10px 18px;background:rgba(10,10,20,.88);color:#fff;font:600 22px/1.3 system-ui,sans-serif;border:2px solid #3ee38f;text-align:center;pointer-events:none';
    document.body.appendChild(c);
  }
  c.textContent = t;
}, text);
const at = async (sec) => { const w = sec * 1000 - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); };

// 0–3 s: title screen
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await cap('Still Here — Team PARALLAX · NASA Space Apps 2026');
await page.waitForSelector('#press-start:not([hidden])');
await at(3);
await page.click('#press-start');

// 3–7 s: the question
await cap('1969: Aldrin carries two experiments. Only one still works — with no power.');
await at(7.5);

// 7.5–13 s: investigate + sort
await page.click('[data-chapter="0"] [data-next]');
await cap('Kids investigate: every powered part of the measurement is on Earth.');
await page.click('[data-hotspot="lrrr"]');
await page.waitForTimeout(700);
await page.locator('#sorter').scrollIntoViewIfNeeded();
for (const [p, w] of [['cubes', 'moon'], ['laser', 'earth'], ['scope', 'earth'], ['detector', 'earth'], ['clock', 'earth']]) {
  await page.click(`button[data-part="${p}"][data-where="${w}"]`); await page.waitForTimeout(250);
}
await at(13);

// 13–17.5 s: mirror
await page.click('[data-chapter="1"] [data-next]');
await cap('Corner cubes send light straight home: no aiming, no electricity.');
for (const v of [25, 45, 65]) { await page.locator('#angle').fill(String(v)); await page.waitForTimeout(350); }
await page.click('input[name="mode"][value="flat"]');
await page.locator('#angle').fill('50');
await at(17.5);

// 17.5–23.5 s: round trip
await page.click('[data-chapter="2"] [data-next]');
await cap('Time the round trip on Earth: distance = speed of light × time ÷ 2.');
await page.click('#fire');
await page.waitForTimeout(2700);
await page.locator('#calc').scrollIntoViewIfNeeded();
await at(23.5);

// 23.5–29 s: evidence + ending
await page.click('[data-chapter="3"] [data-next]');
await page.click('#tab-1');
await cap('One echo is not a discovery. Decades of calibrated work are. Every claim sourced to NASA.');
await page.waitForTimeout(2200);
await page.goto(BASE + '/#ch6');
await cap('Still here — the hardware, the people, the knowledge.');
await at(27.5); // hard ceiling well under the 30 s Space Apps limit

await ctx.close();
await browser.close();
const vid = fs.readdirSync(OUT).filter((f) => f.endsWith('.webm')).map((f) => path.join(OUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const final = path.join(OUT, 'still-here-demo.webm');
fs.renameSync(vid, final);
console.log('wrote', final, ((Date.now() - t0) / 1000).toFixed(1) + ' s of recording');
