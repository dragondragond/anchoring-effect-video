// Overlays: subtitles, corner annotations (year odometer + citation), watermark.

function drawSubtitles(ctx, t) {
  for (const [a, b, s] of SUBS) {
    const t0 = bt(a), t1 = bt(b);
    if (t < t0 - 0.05 || t > t1 + 0.05) continue;
    const fi = 0.22, fo = 0.22;
    const al = env(t, t0, t1, fi, fo);
    if (al <= 0) continue;
    const dy = (1 - E.out(prog(t, t0, t0 + 0.35))) * 10;
    richText(ctx, s, W / 2, 1000 + dy, { size: 42, weight: 700, alpha: al, shadow: 18, ls: 1.5 });
  }
}

function cornerAt(t) {
  let cur = CORNERS[0], prev = null;
  for (const c of CORNERS) if (t >= bt(c.at)) { prev = cur === c ? prev : cur; cur = c; }
  return { cur, prev };
}

// Year digits roll like an odometer from prev to cur.
function drawYear(ctx, y0, y1, p, x, y, alpha) {
  const size = 66;
  ctx.save();
  setFont(ctx, size, 400, F.didot);
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const n = Math.max((y0 || '').length, (y1 || '').length);
  let cx = x;
  ctx.beginPath(); ctx.rect(x - 10, y - size, 400, size * 1.25); ctx.clip();
  for (let i = 0; i < n; i++) {
    const a = y0 ? y0[i] : null, b = y1 ? y1[i] : null;
    const w = ctx.measureText(b || a || '0').width;
    const k = a === b ? 1 : E.inOut(clamp(p * 1.6 - i * 0.18));
    const grad = ctx.createLinearGradient(0, y - size, 0, y);
    grad.addColorStop(0, C.goldHi); grad.addColorStop(1, C.goldDeep);
    ctx.fillStyle = grad;
    if (a === b) { ctx.globalAlpha = alpha; ctx.fillText(b, cx, y); }
    else {
      if (a) { ctx.globalAlpha = alpha * (1 - k); ctx.fillText(a, cx, y - k * size * 0.9); }
      if (b) { ctx.globalAlpha = alpha * k; ctx.fillText(b, cx, y + (1 - k) * size * 0.9); }
    }
    cx += w + 2;
  }
  ctx.restore();
}

function drawCorners(ctx, t) {
  const { cur, prev } = cornerAt(t);
  const tc = bt(cur.at);
  const p = prog(t, tc, tc + 0.9);
  const hasCur = !!cur.year, hasPrev = prev && !!prev.year;
  // year
  if (hasCur || (hasPrev && p < 1)) {
    let alpha = 1;
    if (hasCur && !hasPrev) alpha = E.out(p);
    if (!hasCur && hasPrev) alpha = 1 - E.out(p);
    const y0 = hasPrev ? prev.year : null, y1 = hasCur ? cur.year : null;
    if (hasCur && hasPrev) drawYear(ctx, y0, y1, p, 72, 118, 1);
    else drawYear(ctx, y1 || y0, y1 || y0, 1, 72, 118, alpha);
  }
  // sub + cites crossfade
  const items = [];
  if (prev && prev.year && p < 1) items.push([prev, 1 - E.out(p)]);
  if (cur.year) items.push([cur, prev && prev.year ? E.out(p) : E.out(p)]);
  for (const [c, a] of items) {
    if (a <= 0) continue;
    text(ctx, c.sub || '', 74, 156, { size: 21, weight: 400, align: 'left', color: C.cream, alpha: 0.62 * a, ls: 2 });
    if (c.cite) {
      text(ctx, c.cite, W - 72, 76, { size: 20, fam: F.serif, italic: true, align: 'right', color: C.cream, alpha: 0.55 * a });
      // small red seal icon
      ctx.save(); ctx.globalAlpha = 0.85 * a; ctx.fillStyle = C.red;
      roundRect(ctx, W - 64, 60, 18, 18, 3); ctx.fill();
      setFont(ctx, 12, 900, F.song); ctx.fillStyle = '#f3e3d0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('源', W - 55, 69.5); ctx.restore();
    }
    if (c.cite2) text(ctx, c.cite2, W - 72, 106, { size: 19, align: 'right', color: C.cream, alpha: 0.42 * a, ls: 1 });
  }
}

function drawWatermark(ctx, t) {
  const a = 0.5 * env(t, 0.8, DUR - 5.2, 1.2, 0.8);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(W - 186, 1036, 8, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(W - 186, 1036, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  text(ctx, CONFIG.signature, W - 168, 1043, { size: 20, weight: 700, align: 'left', color: C.cream, alpha: a, ls: 1 });
}
