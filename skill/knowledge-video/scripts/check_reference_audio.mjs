#!/usr/bin/env node
// Do the reference videos use this BGM, and is anything (voice-over, effects) layered on top?
// Usage: node check_reference_audio.mjs <bgm.mp3> <video1.mp4> [video2.mp4 ...]
import { execFileSync } from 'child_process';

const pcm = (f) => { const b = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vn', '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 1 << 30 }); return new Int16Array(b.buffer, b.byteOffset, b.length / 2); };
const env = (x, hop) => { const n = Math.floor(x.length / hop), o = new Float64Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < hop; j++) { const v = x[i * hop + j]; s += v * v; } o[i] = Math.sqrt(s / hop); } return o; };
const corr = (a, b, n) => { let ma = 0, mb = 0; for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; } ma /= n; mb /= n; let ab = 0, aa = 0, bb = 0; for (let i = 0; i < n; i++) { const x = a[i] - ma, y = b[i] - mb; ab += x * y; aa += x * x; bb += y * y; } return ab / Math.sqrt(aa * bb); };

const [bgmFile, ...videos] = process.argv.slice(2);
if (!bgmFile || !videos.length) { console.error('usage: node check_reference_audio.mjs <bgm.mp3> <video.mp4>...'); process.exit(1); }
const bgm = pcm(bgmFile), eb = env(bgm, 800), eb2 = env(bgm, 4000);
for (const v of videos) {
  const x = pcm(v), ev = env(x, 800);
  let best = [-1, 0];
  for (let lag = -300; lag <= 300; lag++) { // ±30 s in 0.1 s steps
    const a = eb.subarray(Math.max(0, lag)), c = ev.subarray(Math.max(0, -lag)), n = Math.min(a.length, c.length);
    if (n < 300) continue; const r = corr(a, c, n); if (r > best[0]) best = [r, lag];
  }
  // extra sound: half-second blocks where the video is much louder than the (aligned) BGM
  const ev2 = env(x, 4000), lag2 = Math.round(best[1] / 5), n = Math.min(eb2.length - Math.max(0, lag2), ev2.length - Math.max(0, -lag2));
  const ratio = []; for (let k = 0; k < n; k++) ratio.push(ev2[k + Math.max(0, -lag2)] / (eb2[k + Math.max(0, lag2)] + 50));
  const med = [...ratio].sort((a, b) => a - b)[Math.floor(n / 2)];
  const loud = ratio.filter((r) => r > med * 1.6).length;
  const uses = best[0] > 0.7;
  console.log(`${v}\n  duration ${(x.length / 8000).toFixed(1)}s · envelope correlation ${best[0].toFixed(2)} at offset ${(best[1] / 10).toFixed(1)}s → ${uses ? 'uses this BGM' : 'probably a different track'}`);
  if (uses) console.log(`  blocks clearly louder than the BGM: ${loud}/${n} → ${loud / n < 0.05 ? 'music only, no voice-over' : 'something else is layered on top (voice-over or effects)'}`);
}
