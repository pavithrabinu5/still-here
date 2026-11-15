// Contrast ratios for the palette + load metrics against the local preview server.
// Usage: npm run preview (other shell), then node tests/e2e/measure.mjs
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:4173';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = (h) => { const [r, g, b] = hex(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const pairs = [
  ['text on bg', '#ece8df', '#0d0e10'], ['muted on bg', '#a8a397', '#0d0e10'], ['muted on surface', '#a8a397', '#16171a'],
  ['muted on surface-2', '#a8a397', '#1e2024'], ['laser on bg', '#3ee38f', '#0d0e10'], ['button text on laser', '#04160c', '#3ee38f'],
  ['disabled btn text', '#e6fff1', '#17583a'], ['warn on bg', '#f1c27d', '#0d0e10'], ['copper on surface', '#d98a55', '#16171a'], ['bad on surface', '#ff8f80', '#16171a'],
];
console.log('Contrast (WCAG AA: 4.5 normal text, 3.0 large):');
for (const [n, f, b] of pairs) { const r = ratio(f, b); console.log(`  ${r >= 4.5 ? 'AA ' : 'LOW'} ${r.toFixed(2)}  ${n}`); }

const browser = await chromium.launch();
for (const [label, vp, throttle] of [['desktop', { width: 1440, height: 900 }, false], ['mobile (4x CPU, ~1.6 Mbps)', { width: 375, height: 812 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  if (throttle) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  }
  await page.addInitScript(() => { window.__lcp = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); });
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const bytes = res.reduce((s, r) => s + (r.transferSize || 0), n.transferSize || 0);
    return { dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, lcp: window.__lcp, requests: res.length + 1, kb: bytes / 1024 };
  });
  console.log(`${label}: DOMContentLoaded ${m.dcl.toFixed(0)} ms · load ${m.load.toFixed(0)} ms · LCP ${m.lcp.toFixed(0)} ms · ${m.requests} requests · ${m.kb.toFixed(0)} KB transferred (initial view)`);
  await ctx.close();
}
await browser.close();
