// Renders Team PARALLAX banner PNGs from the same emblem code the app uses.
// Usage: python3 -m http.server 8090 (from still-here/), then: node branding/render-banner.mjs <outDir>
// SI disclosure: emblem and banner layout produced with SI assistance (Claude, Anthropic); output carries a visible "SI-generated image" mark.
import { chromium } from 'playwright';
import { parallaxEmblem, sprite } from '../src/sprites.js';

const out = process.argv[2] || 'branding';
const stars = Array.from({ length: 90 }, (_, i) => {
  const x = (i * 197) % 1600, y = (i * 113 + (i % 7) * 41) % 1000, s = i % 5 === 0 ? 4 : 2;
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${i % 9 === 0 ? '#ffe08a' : '#ffffff'}" opacity="${0.35 + (i % 4) * 0.15}"/>`;
}).join('');

const page = (w, h, emblem, titleSize) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Pixelify Sans"; src: url("http://localhost:8090/public/fonts/PixelifySans-latin.woff2") format("woff2"); font-weight: 400 700; }
html, body { margin: 0; }
.b { position: relative; width: ${w}px; height: ${h}px; overflow: hidden;
  background: radial-gradient(ellipse at 50% 42%, #262b66 0%, #12142e 55%, #07080f 100%); color: #f6f3ec; font-family: "Pixelify Sans", monospace; }
.stars { position: absolute; inset: 0; }
.c { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${Math.round(h * 0.02)}px; }
.c .emblem { width: ${emblem}px; height: auto; filter: drop-shadow(0 0 28px rgba(62,227,143,.28)); image-rendering: pixelated; }
.t { font-weight: 700; font-size: ${titleSize}px; letter-spacing: .08em; line-height: 1; text-shadow: ${Math.round(titleSize / 18)}px ${Math.round(titleSize / 18)}px 0 #3ee38f, ${Math.round(titleSize / 9)}px ${Math.round(titleSize / 9)}px 0 #1f7a4c; }
.s { font-size: ${Math.round(titleSize * 0.26)}px; letter-spacing: .5em; color: #b9c0ff; margin-left: .5em; }
.ground { position: absolute; left: 0; right: 0; bottom: 0; height: ${Math.round(h * 0.07)}px; background: repeating-linear-gradient(90deg, #8d887e 0 16px, #a29d93 16px 32px) 0 0 / 100% 10px no-repeat, #6f6b64; border-top: 5px solid #cfcac0; }
.mark { position: absolute; right: 14px; top: 14px; font: 500 18px/1 ui-monospace, Menlo, monospace; color: #e1e4ff; background: rgba(7,8,15,.7); border: 1px solid rgba(225,228,255,.45); padding: 7px 10px; }
.walk { position: absolute; bottom: ${Math.round(h * 0.07) - 2}px; display: flex; gap: 40px; left: 8%; }
.walk .sprite { height: ${Math.round(h * 0.075)}px; width: auto; image-rendering: pixelated; }
</style></head><body><div class="b">
<svg class="stars" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">${stars}</svg>
<div class="c">${parallaxEmblem({ size: emblem, mark: false })}<div class="t">PARALLAX</div><div class="s">TEAM · STILL HERE</div></div>
<div class="ground"></div>
<div class="walk">${sprite('astro', { px: 4 })}${sprite('retro-happy', { px: 4 })}${sprite('sci', { px: 4 })}</div>
<div class="mark">SI-generated image</div>
</div></body></html>`;

const b = await chromium.launch();
for (const [name, w, h, emblem, title] of [
  ['parallax-banner-1600x1000', 1600, 1000, 430, 128],
  ['parallax-banner-wide-2400x900', 2400, 900, 380, 120],
  ['parallax-logo-square-1000', 1000, 1000, 420, 112],
]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:8090/index.html');
  await p.setContent(page(w, h, emblem, title));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/${name}.png` });
  console.log('wrote', `${out}/${name}.png`, await p.evaluate(() => document.fonts.check('700 20px "Pixelify Sans"')) ? '(pixel font ok)' : '(FONT MISSING)');
}
await b.close();
