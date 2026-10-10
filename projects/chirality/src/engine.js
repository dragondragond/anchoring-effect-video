// Shared engine: timing, easing, palette, fonts, and drawing helpers.
// Every frame is a pure function of time t (seconds), so frames can be rendered in any order.

const W = 1920, H = 1080, FPS = 30;
// MUSIC comes from src/music.js (written by scripts/new_episode.mjs from the BGM analysis).
const BPM = MUSIC.bpm, BEAT = 60 / BPM, BAR = BEAT * 4, OFF = MUSIC.offset;
const DUR = MUSIC.duration;
const bt = (n) => OFF + (n - 1) * BAR; // start time of bar n (1-based)

const C = {
  bg: '#0b0a09',
  gold: '#d9b46c', goldHi: '#f4dba0', goldDim: '#8c7448', goldDeep: '#a9813f',
  cream: '#ece3cf', creamDim: 'rgba(236,227,207,0.55)',
  blue: '#86a4bc', blueHi: '#bcd3e6', blueDim: '#45596a',
  red: '#c4513f', redHi: '#e57a62',
  paper: '#e8dec7', ink: '#2b241b',
};

const F = {
  song: '"Songti SC","STSong","Noto Serif SC",serif',
  serif: 'Baskerville,"Times New Roman",serif',
  didot: 'Didot,"Bodoni 72",serif',
  mono: 'Menlo,monospace',
};

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outQuint: (t) => 1 - Math.pow(1 - t, 5),
  outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};
// alpha envelope: fades in over fi after a, fades out over fo before b
const env = (t, a, b, fi = 0.4, fo = 0.4) =>
  Math.min(fi > 0 ? clamp((t - a) / fi) : t >= a ? 1 : 0, fo > 0 ? clamp((b - t) / fo) : t <= b ? 1 : 0);
const ep = (t, a, b, ease = E.inOut) => ease(prog(t, a, b));

function hash(i, s = 0) {
  let x = Math.imul((i + 1) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(s + 7, 0x27d4eb2f);
  x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function setFont(ctx, size, weight = 400, fam = F.song, style = '') {
  ctx.font = `${style} ${weight} ${size}px ${fam}`;
}

// Plain text. opts: size, weight, fam, color, alpha, align, base, ls (letter spacing), glow, italic
function text(ctx, s, x, y, o = {}) {
  ctx.save();
  setFont(ctx, o.size || 32, o.weight || 400, o.fam || F.song, o.italic ? 'italic' : '');
  ctx.letterSpacing = (o.ls || 0) + 'px';
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.base || 'alphabetic';
  ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
  ctx.fillStyle = o.color || C.cream;
  if (o.glow) { ctx.shadowColor = o.glowColor || 'rgba(240,200,120,0.55)'; ctx.shadowBlur = o.glow; }
  // letterSpacing adds trailing space; compensate for centered text
  const dx = o.ls && (o.align || 'center') === 'center' ? o.ls / 2 : 0;
  ctx.fillText(s, x + dx, y);
  ctx.restore();
}

// Rich text: 【gold】 and 〔red〕 spans.
function parseRich(s) {
  const out = []; let mode = 'n', buf = '';
  for (const ch of s) {
    if (ch === '【' || ch === '〔') { if (buf) out.push([buf, mode]); buf = ''; mode = ch === '【' ? 'g' : 'r'; }
    else if (ch === '】' || ch === '〕') { if (buf) out.push([buf, mode]); buf = ''; mode = 'n'; }
    else buf += ch;
  }
  if (buf) out.push([buf, mode]);
  return out;
}
function richText(ctx, s, x, y, o = {}) {
  const segs = parseRich(s);
  ctx.save();
  setFont(ctx, o.size || 40, o.weight || 700, o.fam || F.song);
  ctx.letterSpacing = (o.ls || 0) + 'px';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const widths = segs.map(([str]) => ctx.measureText(str).width);
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = o.align === 'left' ? x : x - total / 2;
  ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
  segs.forEach(([str, m], i) => {
    ctx.fillStyle = m === 'g' ? (o.gold || C.goldHi) : m === 'r' ? (o.red || C.redHi) : (o.color || C.cream);
    if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = o.shadow; }
    ctx.fillText(str, cx, y);
    cx += widths[i];
  });
  ctx.restore();
  return total;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Line that draws on from (x1,y1) to (x2,y2) with progress p.
function drawLine(ctx, x1, y1, x2, y2, p, color, width = 2, alpha = 1) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); ctx.stroke();
  ctx.restore();
}

// Arrow along a quadratic curve (bend = perpendicular offset), drawn on with progress p.
function arrow(ctx, x1, y1, x2, y2, p, o = {}) {
  if (p <= 0) return;
  const color = o.color || C.gold, width = o.width || 3, bend = o.bend || 0;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;
  const pt = (u) => [
    (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * cx + u * u * x2,
    (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * cy + u * u * y2,
  ];
  ctx.save();
  ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = o.glow; }
  if (o.dash) ctx.setLineDash(o.dash);
  const u0 = o.from || 0;
  ctx.beginPath();
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const u = lerp(u0, p, i / N);
    const [x, y] = pt(u);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  if (p > 0.92 && !o.noHead) {
    const [hx, hy] = pt(p), [bx, by] = pt(p - 0.04);
    const a = Math.atan2(hy - by, hx - bx), hs = o.head || 16;
    const k = clamp((p - 0.92) / 0.08);
    ctx.globalAlpha *= k;
    ctx.beginPath();
    ctx.moveTo(hx + Math.cos(a) * 4, hy + Math.sin(a) * 4);
    ctx.lineTo(hx - Math.cos(a - 0.42) * hs, hy - Math.sin(a - 0.42) * hs);
    ctx.lineTo(hx - Math.cos(a + 0.42) * hs, hy - Math.sin(a + 0.42) * hs);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  return pt;
}

// Hand-drawn style check mark, progress p.
function checkMark(ctx, x, y, s, p, color = C.goldHi, width = 6) {
  if (p <= 0) return;
  const pts = [[x - s * 0.5, y], [x - s * 0.12, y + s * 0.38], [x + s * 0.55, y - s * 0.45]];
  const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
  const l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
  const d = p * (l1 + l2);
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = color; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  if (d <= l1) ctx.lineTo(lerp(pts[0][0], pts[1][0], d / l1), lerp(pts[0][1], pts[1][1], d / l1));
  else { ctx.lineTo(...pts[1]); const k = (d - l1) / l2; ctx.lineTo(lerp(pts[1][0], pts[2][0], k), lerp(pts[1][1], pts[2][1], k)); }
  ctx.stroke(); ctx.restore();
}

// Red seal stamp with one or more characters; p = 0..1 slam-in progress.
function seal(ctx, x, y, s, label, p, rot = -0.12, color = C.red) {
  if (p <= 0) return;
  const k = E.outBack(clamp(p));
  const sc = lerp(1.9, 1, E.outQuint(clamp(p * 1.4)));
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.globalAlpha *= clamp(p * 3) * 0.95;
  roundRect(ctx, -s / 2, -s / 2, s, s, s * 0.12);
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, s * 0.06); ctx.stroke();
  ctx.fillStyle = color; ctx.globalAlpha *= 0.16; ctx.fill(); ctx.globalAlpha /= 0.16;
  setFont(ctx, s * (label.length > 2 ? 0.36 : label.length > 1 ? 0.42 : 0.62), 900, F.song);
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (label.length > 2) {
    ctx.fillText(label.slice(0, 2), 0, -s * 0.2);
    ctx.fillText(label.slice(2), 0, s * 0.24);
  } else ctx.fillText(label, 0, s * 0.03);
  void k;
  ctx.restore();
}

// ---------- background ----------
let _grain = null, _bokeh = null;
function grainCanvas() {
  if (_grain) return _grain;
  const g = document.createElement('canvas'); g.width = g.height = 256;
  const c = g.getContext('2d'); const img = c.createImageData(256, 256); const r = rng(42);
  for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (r() - 0.5) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  c.putImageData(img, 0, 0); _grain = g; return g;
}

function drawBackground(ctx, t, o = {}) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const warm = o.warm == null ? 1 : o.warm;
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 50, W / 2, H * 0.5, W * 0.62);
  g.addColorStop(0, `rgba(48,38,26,${0.55 * warm})`);
  g.addColorStop(0.55, `rgba(22,18,14,${0.5 * warm})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // soft bokeh blobs
  for (let i = 0; i < 16; i++) {
    const sx = hash(i, 1) * W, sy = hash(i, 2) * H, r = 30 + hash(i, 3) * 70;
    const sp = 4 + hash(i, 4) * 8;
    const x = (sx + Math.sin(t * 0.05 + i) * 40 + t * sp * (hash(i, 5) - 0.5)) % (W + 200);
    const y = (sy - t * sp * 0.6 + H * 10) % (H + 200) - 100;
    const a = (0.025 + 0.035 * hash(i, 6)) * (0.6 + 0.4 * Math.sin(t * 0.4 + i * 1.7)) * (o.bokeh == null ? 1 : o.bokeh);
    const bg = ctx.createRadialGradient(x, y, 0, x, y, r);
    bg.addColorStop(0, `rgba(230,180,110,${a})`); bg.addColorStop(0.7, `rgba(230,180,110,${a * 0.6})`); bg.addColorStop(1, 'rgba(230,180,110,0)');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  // fine dust
  ctx.save();
  for (let i = 0; i < 90; i++) {
    const sp = 6 + hash(i, 11) * 14;
    const x = (hash(i, 12) * W + Math.sin(t * 0.3 + i) * 12 + t * (hash(i, 13) - 0.5) * 10 + W) % W;
    const y = ((hash(i, 14) * H - t * sp) % H + H) % H;
    const a = (0.12 + 0.35 * hash(i, 15)) * (0.5 + 0.5 * Math.sin(t * (0.8 + hash(i, 16)) + i)) * (o.dust == null ? 1 : o.dust);
    ctx.fillStyle = `rgba(240,210,150,${a})`;
    ctx.beginPath(); ctx.arc(x, y, 0.7 + hash(i, 17) * 1.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawFinish(ctx, t, frame) {
  // vignette
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.72);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.72)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // film grain
  const g = grainCanvas();
  ctx.save();
  ctx.globalAlpha = 0.055; ctx.globalCompositeOperation = 'overlay';
  const ox = Math.floor(hash(frame, 91) * 256), oy = Math.floor(hash(frame, 92) * 256);
  const pat = ctx.createPattern(g, 'repeat');
  ctx.translate(-ox, -oy); ctx.fillStyle = pat; ctx.fillRect(ox, oy, W, H);
  ctx.restore();
}

// Sample points from rendered text (for particle effects). Cached by key.
const _samples = {};
function sampleText(key, draw, n, step = 3, seed = 1) {
  if (_samples[key]) return _samples[key];
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'); draw(c);
  const d = c.getImageData(0, 0, W, H).data; const pts = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 140) pts.push([x, y]);
  const r = rng(seed);
  for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
  const out = [];
  for (let i = 0; i < n; i++) out.push(pts[i % pts.length]);
  _samples[key] = out; return out;
}
