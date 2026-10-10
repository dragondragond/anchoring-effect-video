#!/usr/bin/env node
// Analyze a BGM track: tempo, first-beat offset, duration, energy per 2-bar block, and a rough section map.
// Usage: node analyze_bgm.mjs <bgm.mp3> [--json out.json]
// Needs ffmpeg/ffprobe on PATH. Pure Node (no numpy).
import { execFileSync } from 'child_process';
import fs from 'fs';

export function analyzeBgm(file) {
  const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', '22050', '-f', 's16le', '-'], { maxBuffer: 1 << 30 });
  const x = new Int16Array(raw.buffer, raw.byteOffset, raw.length / 2);
  const sr = 22050, hop = 256, win = 1024, N = Math.floor((x.length - win) / hop), fps = sr / hop;
  // onset strength: positive log-energy flux in 4 bands
  const bands = [[0, 150], [150, 600], [600, 2500], [2500, 8000]];
  const bp = (lo, hi) => {
    const y = new Float32Array(x.length); let l1 = 0, l2 = 0;
    const a1 = 1 - Math.exp(-2 * Math.PI * hi / sr), a2 = lo > 0 ? 1 - Math.exp(-2 * Math.PI * lo / sr) : 0;
    for (let i = 0; i < x.length; i++) { l1 += a1 * (x[i] - l1); l2 += a2 * (x[i] - l2); y[i] = l1 - l2; }
    return y;
  };
  const E = bands.map(([l, h]) => { const y = bp(l, h), e = new Float32Array(N); for (let i = 0; i < N; i++) { let s = 0; for (let j = 0; j < win; j++) { const v = y[i * hop + j]; s += v * v; } e[i] = Math.log(1e-6 + s); } return e; });
  const flux = new Float32Array(N);
  for (let i = 1; i < N; i++) { let f = 0; for (const e of E) { const d = e[i] - e[i - 1]; if (d > 0) f += d; } flux[i] = f; }
  const on = new Float32Array(N);
  for (let i = 0; i < N; i++) { let s = 0, c = 0; for (let k = Math.max(0, i - 20); k < Math.min(N, i + 20); k++) { s += flux[k]; c++; } on[i] = Math.max(0, flux[i] - s / c); }
  // tempo by autocorrelation, 70–180 BPM
  let best = [0, -1];
  for (let bpm = 70; bpm <= 180; bpm += 0.25) {
    const lag = fps * 60 / bpm, l = Math.floor(lag), fr = lag - l; let s = 0;
    for (let i = 0; i < N - l - 1; i++) s += on[i] * (on[i + l] * (1 - fr) + on[i + l + 1] * fr);
    if (s > best[1]) best = [bpm, s];
  }
  const bpm = best[0], period = fps * 60 / bpm;
  let ph = [0, -1];
  for (let p = 0; p < period; p += 0.5) { let s = 0; for (let t = p; t < N; t += period) s += on[Math.round(t)] || 0; if (s > ph[1]) ph = [p, s]; }
  const offset = +(ph[0] / fps).toFixed(3), beat = 60 / bpm, bar = beat * 4;
  // energy + bass per 2-bar block
  const blocks = []; let mx = 0, mb = 0;
  for (let t = offset, n = 1; t < duration; t += bar * 2, n += 2) {
    const i0 = Math.floor(t * sr), i1 = Math.min(x.length, Math.floor((t + bar * 2) * sr)); let s = 0, lo = 0, lp = 0;
    for (let i = i0; i < i1; i++) { const v = x[i]; s += v * v; lp += 0.03 * (v - lp); lo += lp * lp; }
    const r = Math.sqrt(s / Math.max(1, i1 - i0)), b = Math.sqrt(lo / Math.max(1, i1 - i0));
    blocks.push({ bar: n, t: +t.toFixed(2), rms: r, bass: b }); mx = Math.max(mx, r); mb = Math.max(mb, b);
  }
  blocks.forEach((b) => { b.energy = +(b.rms / mx).toFixed(2); b.bassN = +(b.bass / mb).toFixed(2); });
  // sections: merge blocks with similar level (quiet < 0.65 ≤ mid < 0.82 ≤ high), ignore a trailing near-silent block
  const level = (b) => (b.energy < 0.65 && b.bassN < 0.6 ? 'quiet' : b.energy < 0.82 ? 'mid' : 'high');
  const sections = [];
  for (const b of blocks) {
    if (b.energy < 0.2) continue;
    const lv = level(b), last = sections[sections.length - 1];
    if (last && last.level === lv) { last.endBar = b.bar + 2; last.end = +(offset + (b.bar + 1) * bar).toFixed(2); }
    else sections.push({ level: lv, startBar: b.bar, endBar: b.bar + 2, start: b.t, end: +(b.t + bar * 2).toFixed(2) });
  }
  // smooth: a 2-bar blip between two sections of the same level joins them
  for (let changed = true; changed;) {
    changed = false;
    for (let i = 1; i < sections.length - 1; i++) {
      const a = sections[i - 1], b = sections[i], c = sections[i + 1];
      if (b.endBar - b.startBar <= 2 && a.level === c.level) { a.endBar = c.endBar; a.end = c.end; sections.splice(i, 2); changed = true; break; }
    }
  }
  return { file, duration: +duration.toFixed(2), bpm, beat: +beat.toFixed(4), bar: +bar.toFixed(4), offset, blocks, sections };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node analyze_bgm.mjs <bgm.mp3> [--json out.json]'); process.exit(1); }
  const r = analyzeBgm(file);
  console.log(`duration ${r.duration}s · ${r.bpm} BPM · beat ${r.beat}s · bar ${r.bar}s · first beat ${r.offset}s`);
  console.log(`bar n starts at ${r.offset} + (n-1) × ${r.bar}\n`);
  console.log('2-bar blocks (energy / bass, relative to max):');
  for (const b of r.blocks) console.log(`bar ${String(b.bar).padStart(3)}  ${b.t.toFixed(2).padStart(7)}s  ${'█'.repeat(Math.round(b.energy * 30)).padEnd(30)}  bass ${'▒'.repeat(Math.round(b.bassN * 15))}`);
  console.log('\nrough sections (check against the bars above):');
  for (const s of r.sections) console.log(`  bars ${String(s.startBar).padStart(2)}–${String(s.endBar).padEnd(3)} ${s.start.toFixed(1).padStart(6)}–${s.end.toFixed(1).padEnd(6)}s  ${s.level}`);
  const j = process.argv.indexOf('--json');
  if (j > 0) fs.writeFileSync(process.argv[j + 1], JSON.stringify(r, null, 1));
}
