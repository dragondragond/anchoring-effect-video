// Render the covers: node cover.mjs  -> covers/cover_4x3.png, covers/cover_3x4.png
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true, args: ['--allow-file-access-from-files', '--force-device-scale-factor=1'],
});
fs.mkdirSync(path.join(ROOT, 'covers'), { recursive: true });
for (const [ratio, name] of [['43', 'cover_4x3.png'], ['34', 'cover_3x4.png']]) {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  await page.goto('file://' + path.join(ROOT, 'cover.html') + '?ratio=' + ratio);
  await page.waitForFunction('window.ready === true');
  const b64 = await page.evaluate(() => window.coverPNG());
  fs.writeFileSync(path.join(ROOT, 'covers', name), Buffer.from(b64, 'base64'));
  console.log('wrote covers/' + name);
}
await browser.close();
