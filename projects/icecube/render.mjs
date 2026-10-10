// Headless render. Usage:
//   node render.mjs --stills=1.5,20,33        -> out/stills/*.png
//   node render.mjs --sheet=0:145.6:5         -> out/sheet.jpg (contact sheet, every 5 s)
//   node render.mjs [--workers=6] [--from=0 --to=145.68]   -> out/simpson.mp4
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FPS = 30;
const DUR = Number(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'src', 'music.js'), 'utf8').match(/duration:\s*([\d.]+)/)[1]);

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ['--allow-file-access-from-files', '--force-device-scale-factor=1', '--disable-background-timer-throttling'],
});
async function openPage() {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1200 });
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto('file://' + path.join(ROOT, 'index.html') + '?render=1');
  await page.waitForFunction('window.ready === true');
  return page;
}

const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });

if (args.stills || args.sheet) {
  const page = await openPage();
  let times;
  if (args.stills) times = String(args.stills).split(',').map(Number);
  else { const [a, b, s] = String(args.sheet).split(':').map(Number); times = []; for (let t = a; t <= b + 1e-6; t += s) times.push(+t.toFixed(3)); }
  const dir = path.join(OUT, args.sheet ? 'sheet' : 'stills');
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  for (const [i, t] of times.entries()) {
    const b64 = await page.evaluate((t) => window.framePNG(t), t);
    fs.writeFileSync(path.join(dir, `${String(i).padStart(3, '0')}_${t.toFixed(2)}.png`), Buffer.from(b64, 'base64'));
  }
  if (args.sheet) {
    const cols = Number(args.cols || 5);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-pattern_type', 'glob', '-i', path.join(dir, '*.png'),
      '-vf', `scale=480:-1,tile=${cols}x${Math.ceil(times.length / cols)}`,
      '-frames:v', '1', path.join(OUT, String(args.name || 'sheet') + '.jpg')]);
  }
  console.log(`wrote ${times.length} frames to ${dir}`);
  await browser.close();
  process.exit(0);
}

// full render
const from = Number(args.from || 0), to = Math.min(DUR, Number(args.to || DUR));
const f0 = Math.round(from * FPS), f1 = Math.floor(to * FPS);
const frames = []; for (let f = f0; f < f1; f++) frames.push(f);
const FR = path.join(OUT, 'frames');
fs.mkdirSync(FR, { recursive: true });
const workers = Number(args.workers || 6);
const todo = frames.filter((f) => !fs.existsSync(path.join(FR, `f_${String(f).padStart(5, '0')}.jpg`)) || args.force);
console.log(`rendering ${todo.length}/${frames.length} frames with ${workers} workers`);
let next = 0, done = 0; const t0 = Date.now();
await Promise.all(Array.from({ length: workers }, async () => {
  const page = await openPage();
  while (next < todo.length) {
    const f = todo[next++];
    const b64 = await page.evaluate((t) => window.frameJPEG(t, 0.95), f / FPS);
    fs.writeFileSync(path.join(FR, `f_${String(f).padStart(5, '0')}.jpg`), Buffer.from(b64, 'base64'));
    if (++done % 150 === 0) { const s = (Date.now() - t0) / 1000; console.log(`${done}/${todo.length}  ${(done / s).toFixed(1)} fps  eta ${((todo.length - done) / (done / s)).toFixed(0)}s`); }
  }
  await page.close();
}));
await browser.close();
const outFile = path.join(OUT, String(args.out || '冰立方.mp4'));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-start_number', String(f0), '-i', path.join(FR, 'f_%05d.jpg'),
  '-ss', String(from), '-i', path.join(ROOT, 'src', 'bgm.mp3'),
  '-frames:v', String(frames.length), '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', outFile], { stdio: 'inherit' });
console.log('wrote', outFile, `in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
