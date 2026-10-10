#!/usr/bin/env node
// Find stretches where the picture barely moves (only the subtitle changes). Renders the episode in headless Chrome
// at 4 fps with the camera drift turned off, so it measures the content itself.
// Usage: node motion_check.mjs <episodeDir> [--min 2] [--pixels 25]
// Prints spans like "6.0–8.8 (2.8s)". Anything ≥ 2 s reads as a frozen frame to viewers — give it motion.
import path from 'path';
import { createRequire } from 'module';

const dir = path.resolve(process.argv[2] || '.');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const MIN = arg('--min', 2), PIX = arg('--pixels', 25);
const require = createRequire(path.join(dir, 'package.json'));
const puppeteer = require('puppeteer-core');
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true, args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1200 });
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
await page.goto('file://' + path.join(dir, 'index.html') + '?render=1');
await page.waitForFunction('window.ready === true');
const counts = await page.evaluate(async (PIXDIFF) => {
  window.NO_DRIFT = true;
  const w = 240, h = 135, small = document.createElement('canvas'); small.width = w; small.height = h;
  const sc = small.getContext('2d', { willReadFrequently: true }), src = document.getElementById('c');
  const frames = [], out = [];
  for (let t = 0; t < DUR; t += 0.25) {
    window.renderAt(t); sc.drawImage(src, 0, 0, w, h);
    const d = sc.getImageData(0, 0, w, Math.floor(h * 0.82)).data; // skip the subtitle band
    const g = new Uint8Array(d.length / 4); for (let i = 0; i < g.length; i++) g[i] = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3;
    frames.push(g);
    if (frames.length > 2) { const a = frames[frames.length - 1], b = frames[frames.length - 3]; let s = 0; for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > PIXDIFF) s++; out.push([t, s]); frames.shift(); }
  }
  return out;
}, 10);
await browser.close();
let start = null; const spans = [];
for (const [t, s] of counts) {
  if (s < PIX) { if (start === null) start = t; }
  else { if (start !== null && t - start >= MIN) spans.push([start, t]); start = null; }
}
console.log(spans.length ? 'static spans: ' + spans.map(([a, b]) => `${a.toFixed(1)}–${b.toFixed(1)} (${(b - a).toFixed(1)}s)`).join(', ') : 'no static spans ≥ ' + MIN + 's');
