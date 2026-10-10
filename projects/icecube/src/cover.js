// Covers: ?ratio=43 (1440×1080) or ?ratio=34 (1080×1440). Hero: the detector with a neutrino track lit up.

const params = new URLSearchParams(location.search);
const RATIO = params.get('ratio') || '43';
const CW = RATIO === '34' ? 1080 : 1440, CH = RATIO === '34' ? 1440 : 1080;
const cv = document.getElementById('c');
cv.width = CW; cv.height = CH;
const ctx = cv.getContext('2d');

function coverBackground(gx, gy) {
  ctx.fillStyle = IC.bg; ctx.fillRect(0, 0, CW, CH);
  const g = ctx.createRadialGradient(gx, gy, 40, gx, gy, Math.max(CW, CH) * 0.75);
  g.addColorStop(0, 'rgba(30,90,140,0.55)'); g.addColorStop(0.5, 'rgba(10,32,56,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(225,240,255,${0.1 + 0.5 * hash(i, 15)})`;
    ctx.beginPath(); ctx.arc(hash(i, 12) * CW, hash(i, 14) * CH, 0.5 + Math.pow(hash(i, 17), 3) * 2, 0, Math.PI * 2); ctx.fill();
  }
  // neutrino streaks
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const x = hash(i, 31) * CW, y = hash(i, 32) * CH, len = 60 + hash(i, 33) * 140;
    const lg = ctx.createLinearGradient(x - len * 0.87, y - len * 0.5, x, y);
    lg.addColorStop(0, 'rgba(200,243,255,0)'); lg.addColorStop(1, `rgba(200,243,255,${0.25 + 0.4 * hash(i, 34)})`);
    ctx.strokeStyle = lg; ctx.lineWidth = 1 + hash(i, 35) * 1.3;
    ctx.beginPath(); ctx.moveTo(x - len * 0.87, y - len * 0.5); ctx.lineTo(x, y); ctx.stroke();
  }
  ctx.restore();
}
function coverFinish() {
  const v = ctx.createRadialGradient(CW / 2, CH / 2, Math.min(CW, CH) * 0.35, CW / 2, CH / 2, Math.max(CW, CH) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, CW, CH);
  ctx.save(); ctx.globalAlpha = 0.05; ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainCanvas(), 'repeat'); ctx.fillRect(0, 0, CW, CH); ctx.restore();
}
function iceText(s, x, y, size, ls) {
  ctx.save();
  setFont(ctx, size, 900, F.song); ctx.letterSpacing = ls + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const g = ctx.createLinearGradient(0, y - size * 0.85, 0, y + 10);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#c4f0ff'); g.addColorStop(1, '#4aa8d8');
  ctx.shadowColor = 'rgba(110,210,255,0.6)'; ctx.shadowBlur = size * 0.25;
  ctx.fillStyle = g; ctx.fillText(s, x + ls / 2, y);
  ctx.restore();
}
function pill(s, x, y, size) {
  setFont(ctx, size, 900, F.song); ctx.letterSpacing = '4px';
  const w = ctx.measureText(s).width + size * 1.4, h = size * 1.7;
  ctx.save(); roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = 'rgba(233,196,122,0.14)'; ctx.fill(); ctx.strokeStyle = C.goldHi; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  text(ctx, s, x, y + size * 0.36, { size, weight: 900, color: C.goldHi, ls: 4 });
}
function signature(x, y) {
  ctx.save(); ctx.strokeStyle = IC.cyan; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x + 12, y - 10, 11, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = IC.cyan; ctx.beginPath(); ctx.arc(x + 12, y - 10, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  text(ctx, CONFIG.signature, x + 34, y, { size: 30, weight: 900, color: IC.cyanHi, align: 'left', ls: 2 });
}
// The detector with the detection-scene track fully lit, sized so the array is about `size` px tall.
function coverHero(x, y, size) {
  const cam = camera(0.45, -0.17, (1100 * 1000) / size, { cx: x, cy: y });
  drawArray(ctx, cam, { domAlpha: 0.5, hits: DETECT.hits, reveal: 1, hitScale: 1.25 });
  const { d, vertex } = DETECT, L = 820;
  const p0 = cam.project([vertex[0] - d[0] * 380, vertex[1] - d[1] * 380, vertex[2] - d[2] * 380]), p1 = cam.project([vertex[0] + d[0] * L, vertex[1] + d[1] * L, vertex[2] + d[2] * L]);
  if (p0 && p1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(238,248,255,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
    glowDot(ctx, p1[0], p1[1], 14, WHITE, 1);
    ctx.restore();
  }
}

function drawCover() {
  const cfg = CONFIG.cover;
  if (RATIO === '34') {
    coverBackground(540, 980);
    signature(60, 88);
    text(ctx, CONFIG.titleEn, CW / 2, 190, { size: 22, fam: F.serif, ls: 8, color: IC.cyan });
    iceText(CONFIG.title, CW / 2, 400, 220, 30);
    text(ctx, cfg.line1, CW / 2, 500, { size: 46, weight: 900, color: C.cream, ls: 2 });
    richText(ctx, cfg.line2, CW / 2, 566, { size: 46, weight: 900, ls: 2 });
    coverHero(540, 1000, 440);
    pill(cfg.pill, CW / 2, 1350, 42);
  } else {
    coverBackground(440, 560);
    signature(56, 84);
    coverHero(400, 590, 470);
    const cx = 1040;
    text(ctx, CONFIG.titleEn, cx, 230, { size: 20, fam: F.serif, ls: 7, color: IC.cyan });
    iceText(CONFIG.title, cx, 450, 210, 26);
    drawLine(ctx, cx - 240, 530, cx + 240, 530, 1, IC.cyanDim, 1.5, 0.9);
    text(ctx, cfg.line1, cx, 620, { size: 44, weight: 900, color: C.cream, ls: 2 });
    richText(ctx, cfg.line2, cx, 690, { size: 44, weight: 900, ls: 2 });
    pill(cfg.pill, cx, 820, 38);
  }
  coverFinish();
}

document.fonts.load('900 40px "Songti SC"').then(() => { drawCover(); window.coverPNG = () => cv.toDataURL('image/png').slice(22); window.ready = true; });
