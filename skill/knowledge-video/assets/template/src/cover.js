// Covers: ?ratio=43 (1440×1080) or ?ratio=34 (1080×1440). Text comes from CONFIG.cover.
// Replace coverHero() with the episode's signature visual (reuse a component from scenes.js at a large size).

const params = new URLSearchParams(location.search);
const RATIO = params.get('ratio') || '43';
const CW = RATIO === '34' ? 1080 : 1440, CH = RATIO === '34' ? 1440 : 1080;
const cv = document.getElementById('c');
cv.width = CW; cv.height = CH;
const ctx = cv.getContext('2d');

function coverBackground(gx, gy) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, CW, CH);
  const g = ctx.createRadialGradient(gx, gy, 40, gx, gy, Math.max(CW, CH) * 0.7);
  g.addColorStop(0, 'rgba(70,52,30,0.75)'); g.addColorStop(0.5, 'rgba(28,22,16,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
  for (let i = 0; i < 140; i++) {
    ctx.fillStyle = `rgba(240,210,150,${0.1 + 0.35 * hash(i, 15)})`;
    ctx.beginPath(); ctx.arc(hash(i, 12) * CW, hash(i, 14) * CH, 0.7 + hash(i, 17) * 1.8, 0, Math.PI * 2); ctx.fill();
  }
}
function coverFinish() {
  const v = ctx.createRadialGradient(CW / 2, CH / 2, Math.min(CW, CH) * 0.35, CW / 2, CH / 2, Math.max(CW, CH) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, CW, CH);
  ctx.save(); ctx.globalAlpha = 0.05; ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainCanvas(), 'repeat'); ctx.fillRect(0, 0, CW, CH); ctx.restore();
}
function goldText(s, x, y, size, ls) {
  ctx.save();
  setFont(ctx, size, 900, F.song); ctx.letterSpacing = ls + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const g = ctx.createLinearGradient(0, y - size * 0.85, 0, y + 10);
  g.addColorStop(0, '#fff0c4'); g.addColorStop(0.5, '#e6bb6c'); g.addColorStop(1, '#a87b3b');
  ctx.shadowColor = 'rgba(240,190,100,0.55)'; ctx.shadowBlur = size * 0.25;
  ctx.fillStyle = g; ctx.fillText(s, x + ls / 2, y);
  ctx.restore();
}
function pill(s, x, y, size) {
  if (!s) return;
  setFont(ctx, size, 900, F.song); ctx.letterSpacing = '4px';
  const w = ctx.measureText(s).width + size * 1.4, h = size * 1.7;
  ctx.save(); roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = 'rgba(196,81,63,0.16)'; ctx.fill(); ctx.strokeStyle = C.redHi; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  text(ctx, s, x, y + size * 0.36, { size, weight: 900, color: C.redHi, ls: 4 });
}
function signature(x, y) {
  ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x + 12, y - 10, 11, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x + 12, y - 10, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  text(ctx, CONFIG.signature, x + 34, y, { size: 30, weight: 900, color: C.goldHi, align: 'left', ls: 2 });
}
// Placeholder hero: two gauge cards. Swap in the episode's key visual.
function coverHero(x, y, size) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 400, size / 400); ctx.translate(-x, -y);
  gaugeCard(ctx, x - 190, y, 'A', 78, 1, C.gold, { glow: 1 });
  gaugeCard(ctx, x + 190, y, 'B', 83, 1, C.blue, { alpha: 0.5 });
  ctx.restore();
}

function drawCover() {
  const cfg = CONFIG.cover, title = CONFIG.title, half = Math.ceil(title.length / 2);
  if (RATIO === '34') {
    coverBackground(540, 880);
    signature(60, 88);
    text(ctx, CONFIG.titleEn, CW / 2, 200, { size: 28, fam: F.serif, ls: 12, color: C.gold });
    goldText(title, CW / 2, 400, title.length > 4 ? 170 : 210, 22);
    richText(ctx, cfg.line1 + cfg.line2, CW / 2, 500, { size: 50, weight: 900, ls: 2 });
    coverHero(540, 960, 400);
    pill(cfg.pill, CW / 2, 1346, 44);
  } else {
    coverBackground(440, 510);
    signature(56, 84);
    coverHero(440, 600, 380);
    const cx = 1060;
    text(ctx, CONFIG.titleEn, cx, 196, { size: 26, fam: F.serif, ls: 10, color: C.gold });
    goldText(title.slice(0, half), cx, 430, 220, 24);
    goldText(title.slice(half), cx, 680, 220, 24);
    drawLine(ctx, cx - 250, 742, cx + 250, 742, 1, C.goldDim, 1.5, 0.9);
    richText(ctx, cfg.line1, cx, 822, { size: 52, weight: 900, ls: 2 });
    richText(ctx, cfg.line2, cx, 894, { size: 52, weight: 900, ls: 2 });
    pill(cfg.pill, cx, 980, 40);
  }
  coverFinish();
}

document.fonts.load('900 40px "Songti SC"').then(() => { drawCover(); window.coverPNG = () => cv.toDataURL('image/png').slice(22); window.ready = true; });
