// Covers: ?ratio=43 (1440×1080) or ?ratio=34 (1080×1440). Hero: a chiral molecule and its mirror image.

const params = new URLSearchParams(location.search);
const RATIO = params.get('ratio') || '43';
const CW = RATIO === '34' ? 1080 : 1440, CH = RATIO === '34' ? 1440 : 1080;
const cv = document.getElementById('c');
cv.width = CW; cv.height = CH;
const ctx = cv.getContext('2d');

function coverBackground() {
  ctx.fillStyle = MC.bg; ctx.fillRect(0, 0, CW, CH);
  for (const [x, y, r, c, a] of [[CW * 0.25, CH * 0.45, CW * 0.6, [120, 80, 30], 0.28], [CW * 0.78, CH * 0.55, CW * 0.6, [30, 110, 110], 0.26], [CW * 0.5, CH * 0.1, CW * 0.5, [80, 50, 120], 0.25]]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(c, a)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
  }
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = i % 2 ? `rgba(255,217,160,${0.1 + 0.4 * hash(i, 15)})` : `rgba(168,240,232,${0.1 + 0.4 * hash(i, 15)})`;
    ctx.beginPath(); ctx.arc(hash(i, 12) * CW, hash(i, 14) * CH, 0.6 + hash(i, 17) * 1.6, 0, Math.PI * 2); ctx.fill();
  }
}
function coverFinish() {
  const v = ctx.createRadialGradient(CW / 2, CH / 2, Math.min(CW, CH) * 0.35, CW / 2, CH / 2, Math.max(CW, CH) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, CW, CH);
  ctx.save(); ctx.globalAlpha = 0.05; ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainCanvas(), 'repeat'); ctx.fillRect(0, 0, CW, CH); ctx.restore();
}
function titleText(s, x, y, size, ls, alpha = 1) {
  ctx.save();
  setFont(ctx, size, 900, F.song); ctx.letterSpacing = ls + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const g = ctx.createLinearGradient(0, y - size * 0.85, 0, y + 10);
  g.addColorStop(0, '#fff6e2'); g.addColorStop(0.5, '#e9cf9a'); g.addColorStop(1, '#9f7fd0');
  ctx.shadowColor = 'rgba(200,170,255,0.5)'; ctx.shadowBlur = size * 0.22; ctx.globalAlpha = alpha;
  ctx.fillStyle = g; ctx.fillText(s, x + ls / 2, y);
  ctx.restore();
}
// title plus a faint reflection that fades out downward (masked on its own canvas, so nothing else is darkened)
function titleWithReflection(s, x, y, size, ls) {
  const off = document.createElement('canvas'); off.width = CW; off.height = CH;
  const oc = off.getContext('2d');
  oc.save(); oc.translate(0, y * 2 + 30); oc.scale(1, -1);
  setFont(oc, size, 900, F.song); oc.letterSpacing = ls + 'px'; oc.textAlign = 'center'; oc.textBaseline = 'alphabetic';
  const g = oc.createLinearGradient(0, y - size * 0.85, 0, y + 10);
  g.addColorStop(0, '#fff6e2'); g.addColorStop(0.5, '#e9cf9a'); g.addColorStop(1, '#9f7fd0');
  oc.fillStyle = g; oc.fillText(s, x + ls / 2, y); oc.restore();
  oc.globalCompositeOperation = 'destination-in';
  const m = oc.createLinearGradient(0, y + 20, 0, y + size * 0.9);
  m.addColorStop(0, 'rgba(0,0,0,0.3)'); m.addColorStop(1, 'rgba(0,0,0,0)');
  oc.fillStyle = m; oc.fillRect(0, 0, CW, CH);
  ctx.drawImage(off, 0, 0);
  titleText(s, x, y, size, ls);
}
function pill(s, x, y, size) {
  setFont(ctx, size, 900, F.song); ctx.letterSpacing = '4px';
  const w = ctx.measureText(s).width + size * 1.4, h = size * 1.7;
  ctx.save(); roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = 'rgba(233,196,122,0.14)'; ctx.fill(); ctx.strokeStyle = C.goldHi; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  text(ctx, s, x, y + size * 0.36, { size, weight: 900, color: C.goldHi, ls: 4 });
}
function signature(x, y) {
  ctx.save(); ctx.strokeStyle = MC.amber; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x + 12, y - 10, 11, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = MC.amber; ctx.beginPath(); ctx.arc(x + 12, y - 10, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  text(ctx, CONFIG.signature, x + 34, y, { size: 30, weight: 900, color: MC.amberHi, align: 'left', ls: 2 });
}
function coverHero(cx, cy, s, gap) {
  // the mirror
  const g = ctx.createLinearGradient(0, cy - s * 3, 0, cy + s * 3);
  g.addColorStop(0, 'rgba(201,210,227,0)'); g.addColorStop(0.5, 'rgba(225,230,245,0.85)'); g.addColorStop(1, 'rgba(201,210,227,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - 2, cy - s * 3, 4, s * 6);
  const ry = 0.55, rx = 0.38;
  halo(ctx, cx - gap, cy, s * 1.9, AMB, 0.3);
  halo(ctx, cx + gap, cy, s * 1.9, TEA, 0.3);
  drawMolecule(ctx, MOL_L, cx - gap, cy, s, -ry, rx, { tint: AMB, tintK: 0.2 });
  drawMolecule(ctx, MOL_R, cx + gap, cy, s, ry, rx, { tint: TEA, tintK: 0.2 });
}

function drawCover() {
  const cfg = CONFIG.cover;
  coverBackground();
  if (RATIO === '34') {
    signature(60, 88);
    text(ctx, CONFIG.titleEn, CW / 2, 200, { size: 24, fam: F.serif, ls: 10, color: MC.silver });
    titleWithReflection(CONFIG.title, CW / 2, 400, 190, 26);
    text(ctx, cfg.line1, CW / 2, 610, { size: 48, weight: 900, color: C.cream, ls: 2 });
    richText(ctx, cfg.line2, CW / 2, 680, { size: 44, weight: 900, ls: 2 });
    coverHero(CW / 2, 1010, 120, 250);
    pill(cfg.pill, CW / 2, 1340, 42);
  } else {
    signature(56, 84);
    coverHero(390, 560, 108, 205);
    const cx = 1080;
    text(ctx, CONFIG.titleEn, cx, 250, { size: 22, fam: F.serif, ls: 8, color: MC.silver });
    titleWithReflection(CONFIG.title, cx, 440, 150, 20);
    text(ctx, cfg.line1, cx, 640, { size: 44, weight: 900, color: C.cream, ls: 2 });
    richText(ctx, cfg.line2, cx, 708, { size: 40, weight: 900, ls: 2 });
    pill(cfg.pill, cx, 830, 38);
  }
  coverFinish();
}

document.fonts.load('900 40px "Songti SC"').then(() => { drawCover(); window.coverPNG = () => cv.toDataURL('image/png').slice(22); window.ready = true; });
