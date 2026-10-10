// Video covers: ?ratio=43 (1440×1080) or ?ratio=34 (1080×1440). Reuses the wheel and anchor from scenes.js.

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
    const x = hash(i, 12) * CW, y = hash(i, 14) * CH;
    ctx.fillStyle = `rgba(240,210,150,${0.1 + 0.35 * hash(i, 15)})`;
    ctx.beginPath(); ctx.arc(x, y, 0.7 + hash(i, 17) * 1.8, 0, Math.PI * 2); ctx.fill();
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
function hangingAnchor(x, yAnchor, size, ropeTop) {
  const g = ctx.createLinearGradient(0, ropeTop, 0, yAnchor);
  g.addColorStop(0, 'rgba(217,180,108,0)'); g.addColorStop(1, 'rgba(217,180,108,0.8)');
  ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, ropeTop); ctx.lineTo(x, yAnchor - size * 0.5); ctx.stroke(); ctx.restore();
  const halo = ctx.createRadialGradient(x, yAnchor, 0, x, yAnchor, size * 1.3);
  halo.addColorStop(0, 'rgba(250,215,140,0.35)'); halo.addColorStop(1, 'rgba(250,215,140,0)');
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, yAnchor, size * 1.3, 0, Math.PI * 2); ctx.fill();
  drawAnchor(ctx, x, yAnchor, size, C.goldHi, 1, 0, 26);
}
function pill(s, x, y, size) {
  setFont(ctx, size, 900, F.song); ctx.letterSpacing = '4px';
  const w = ctx.measureText(s).width + size * 1.4, h = size * 1.7;
  ctx.save();
  roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = 'rgba(196,81,63,0.16)'; ctx.fill();
  ctx.strokeStyle = C.redHi; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  text(ctx, s, x, y + size * 0.36, { size, weight: 900, color: C.redHi, ls: 4 });
}
function signature(x, y) {
  ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x + 12, y - 10, 11, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x + 12, y - 10, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  text(ctx, 'LIGHT聊AI', x + 34, y, { size: 30, weight: 900, color: C.goldHi, align: 'left', ls: 2 });
}

function drawCover() {
  const rot = wheelRotFor(65);
  if (RATIO === '34') {
    const wx = 540, wy = 1000, R = 270;
    coverBackground(wx, wy - 120);
    signature(60, 88);
    text(ctx, 'ANCHORING EFFECT', CW / 2, 200, { size: 28, fam: F.serif, ls: 12, color: C.gold });
    goldText('锚定效应', CW / 2, 400, 210, 22);
    richText(ctx, '一个随机数，就能【左右你的判断】', CW / 2, 500, { size: 54, weight: 900, ls: 2 });
    drawWheel(ctx, wx, wy, R, rot, { hl: 65, hlA: 1, landed: true });
    hangingAnchor(wx, wy - R - 108, 112, 560);
    pill('连 AI 都逃不过', CW / 2, 1346, 44);
  } else {
    const wx = 440, wy = 610, R = 300;
    coverBackground(wx, wy - 100);
    signature(56, 84);
    drawWheel(ctx, wx, wy, R, rot, { hl: 65, hlA: 1, landed: true });
    hangingAnchor(wx, wy - R - 110, 118, 0);
    const cx = 1060;
    text(ctx, 'ANCHORING EFFECT', cx, 196, { size: 26, fam: F.serif, ls: 10, color: C.gold });
    goldText('锚定', cx, 430, 236, 24);
    goldText('效应', cx, 680, 236, 24);
    drawLine(ctx, cx - 250, 742, cx + 250, 742, 1, C.goldDim, 1.5, 0.9);
    text(ctx, '一个随机数，', cx, 822, { size: 54, weight: 900, color: C.cream, ls: 2 });
    richText(ctx, '就能【左右你的判断】', cx, 894, { size: 54, weight: 900, ls: 2 });
  }
  if (RATIO !== '34') pill('连 AI 都逃不过', 1060, 980, 40);
  coverFinish();
}

document.fonts.load('900 40px "Songti SC"').then(() => { drawCover(); window.coverPNG = () => cv.toDataURL('image/png').slice(22); window.ready = true; });
