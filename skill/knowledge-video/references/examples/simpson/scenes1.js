// Scenes ① hook, ② title, ③ kidney stones, ④ Berkeley + Simpson.

// ---------- ① hook: two surgery cards ----------
function drawSurgeryCard(ctx, cx, cy, label, pct, fill, color, o = {}) {
  const w = 340, h = 400;
  ctx.save();
  ctx.translate(cx, cy + (o.lift || 0));
  const sc = o.scale || 1; ctx.scale(sc, sc);
  ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
  if (o.glow) {
    const g = ctx.createRadialGradient(0, 0, 40, 0, 0, 330);
    g.addColorStop(0, `rgba(240,200,120,${0.22 * o.glow})`); g.addColorStop(1, 'rgba(240,200,120,0)');
    ctx.fillStyle = g; ctx.fillRect(-360, -360, 720, 720);
  }
  roundRect(ctx, -w / 2, -h / 2, w, h, 16);
  ctx.fillStyle = 'rgba(255,236,200,0.035)'; ctx.fill();
  ctx.strokeStyle = color; ctx.globalAlpha *= 0.75; ctx.lineWidth = 1.6; ctx.stroke(); ctx.globalAlpha /= 0.75;
  // corner ticks
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath(); ctx.moveTo(sx * (w / 2 - 2), sy * (h / 2 - 26)); ctx.lineTo(sx * (w / 2 - 2), sy * (h / 2 - 2)); ctx.lineTo(sx * (w / 2 - 26), sy * (h / 2 - 2)); ctx.stroke();
  }
  text(ctx, label, 0, -128, { size: 44, weight: 900, color: C.cream, ls: 4 });
  // ring gauge
  const R = 92;
  ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(236,227,207,0.10)';
  ctx.beginPath(); ctx.arc(0, 30, R, 0, Math.PI * 2); ctx.stroke();
  if (fill > 0) {
    ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(0, 30, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct / 100 * fill); ctx.stroke();
    ctx.shadowBlur = 0;
  }
  const shown = Math.round(pct * fill);
  text(ctx, shown + '%', 0, 54, { size: 70, fam: F.didot, color: fill > 0 ? C.cream : 'rgba(236,227,207,0.25)' });
  text(ctx, '成功率', 0, 166, { size: 22, color: C.cream, alpha: 0.55, ls: 4 });
  ctx.restore();
}

function sceneHook(ctx, t) {
  if (t > bt(9) + 0.7) return;
  const a = env(t, 0.6, bt(9) + 0.6, 1.4, 0.5);
  ctx.save(); ctx.globalAlpha = a;
  // base line
  const lp = ep(t, 0.6, 2.4, E.outQuint);
  drawLine(ctx, W / 2, 770, W / 2 - 560 * lp, 770, 1, C.goldDim, 1.2, 0.7);
  drawLine(ctx, W / 2, 770, W / 2 + 560 * lp, 770, 1, C.goldDim, 1.2, 0.7);
  const ax = W / 2 - 250, bx = W / 2 + 250, cy = 480;
  const ra = ep(t, 1.0, 2.6, E.outQuint), rb = ep(t, 1.3, 2.9, E.outQuint);
  const fa = ep(t, bt(3) + 0.1, bt(3) + 2.0), fb = ep(t, bt(5) + 0.05, bt(5) + 1.5);
  // choosing sweep and verdict
  const choose = prog(t, bt(6), bt(7) - 0.3);
  const sweepX = lerp(ax, bx, 0.5 + 0.5 * Math.sin(E.inOut(choose) * Math.PI * 2.5 - Math.PI / 2));
  const flip = ep(t, bt(8) + 0.1, bt(8) + 0.9);
  const liftB = -14 * ep(t, bt(7) - 0.6, bt(7)) * (1 - flip);
  if (choose > 0 && flip < 1) {
    const g = ctx.createRadialGradient(sweepX, cy, 20, sweepX, cy, 300);
    g.addColorStop(0, `rgba(240,210,150,${0.12 * Math.min(1, choose * 4) * (1 - flip)})`); g.addColorStop(1, 'rgba(240,210,150,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  drawSurgeryCard(ctx, ax, cy + (1 - ra) * 50, '手术 A', 78, fa, C.gold, {
    alpha: ra * lerp(1, 1, flip), glow: flip, scale: 1 + 0.04 * flip, lift: -10 * flip,
  });
  drawSurgeryCard(ctx, bx, cy + (1 - rb) * 50, '手术 B', 83, fb, C.blue, {
    alpha: rb * lerp(1, 0.38, flip), lift: liftB,
  });
  // check on B, then struck through
  const ck = ep(t, bt(7) + 0.1, bt(7) + 0.7, E.out);
  ctx.save(); ctx.globalAlpha *= lerp(1, 0.5, flip);
  checkMark(ctx, bx + 128, cy - 170 + liftB, 56, ck, C.goldHi, 7);
  ctx.restore();
  const st = ep(t, bt(8), bt(8) + 0.35, E.out);
  if (st > 0) drawLine(ctx, bx + 80, cy - 205 + liftB, bx + 80 + 100 * st, cy - 135 + liftB - 0 * st, 1, C.redHi, 6);
  ctx.restore();
  // flash into title
  const fl = Math.pow(prog(t, bt(9) - 0.55, bt(9)), 2.2) * (t < bt(9) ? 1 : 0);
  if (fl > 0) { ctx.fillStyle = `rgba(255,236,200,${0.85 * fl})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- ② title ----------
const TITLE_Y = 540;
function drawTitleText(c, alpha = 1, size = 150) {
  c.save();
  setFont(c, size, 900, F.song);
  c.letterSpacing = '22px';
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const g = c.createLinearGradient(0, TITLE_Y - size * 0.85, 0, TITLE_Y + 10);
  g.addColorStop(0, '#fbe9b8'); g.addColorStop(0.55, '#e0b56a'); g.addColorStop(1, '#a87b3b');
  c.fillStyle = g; c.globalAlpha *= alpha;
  c.shadowColor = 'rgba(240,190,100,0.45)'; c.shadowBlur = 36;
  c.fillText('辛普森悖论', W / 2 + 11, TITLE_Y);
  c.restore();
}
function titlePoints() {
  return sampleText('title', (c) => { c.fillStyle = '#fff'; drawTitleText(c, 1); }, 700, 3, 7);
}

function sceneTitle(ctx, t) {
  const t0 = bt(9), t1 = bt(11);
  if (t < t0 || t > t1 + 0.6) return;
  // light rays
  const ra = env(t, t0, t1 + 0.2, 0.3, 0.8);
  ctx.save();
  ctx.translate(W / 2, TITLE_Y - 50);
  ctx.rotate(t * 0.04);
  for (let i = 0; i < 64; i++) {
    const ang = (i / 64) * Math.PI * 2;
    const len = 380 + hash(i, 33) * 520;
    const g = ctx.createLinearGradient(0, 0, Math.cos(ang) * len, Math.sin(ang) * len);
    g.addColorStop(0, `rgba(240,200,130,${0.10 * ra})`); g.addColorStop(1, 'rgba(240,200,130,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 1 + hash(i, 34) * 2.2;
    ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 60, Math.sin(ang) * 60); ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len); ctx.stroke();
  }
  ctx.restore();
  // flash decay
  const fl = 1 - prog(t, t0, t0 + 0.7);
  // title text appears as dots converge (dots are drawn by the kidney scene)
  const ta = ep(t, t0 + 0.75, t0 + 1.4) * (1 - ep(t, t1 - 0.45, t1 + 0.05));
  const s = 1 + 0.03 * prog(t, t0, t1);
  ctx.save(); ctx.translate(W / 2, TITLE_Y); ctx.scale(s, s); ctx.translate(-W / 2, -TITLE_Y);
  drawTitleText(ctx, ta);
  ctx.restore();
  const sa = ep(t, t0 + 0.9, t0 + 1.7) * env(t, t0, t1, 0.01, 0.5);
  text(ctx, "SIMPSON’S PARADOX", W / 2, TITLE_Y - 190, { size: 28, fam: F.serif, ls: 14, color: C.gold, alpha: sa });
  const lp = ep(t, t0 + 1.4, t0 + 2.2, E.outQuint);
  drawLine(ctx, W / 2, TITLE_Y + 70, W / 2 - 200 * lp, TITLE_Y + 70, 1, C.goldDim, 1.2, sa);
  drawLine(ctx, W / 2, TITLE_Y + 70, W / 2 + 200 * lp, TITLE_Y + 70, 1, C.goldDim, 1.2, sa);
  const ua = ep(t, t0 + 1.8, t0 + 2.6) * env(t, t0, t1, 0.01, 0.5);
  text(ctx, '每一组都赢，加在一起却输', W / 2, TITLE_Y + 132, { size: 34, weight: 400, color: C.cream, alpha: 0.85 * ua, ls: 10 });
  if (fl > 0) { ctx.fillStyle = `rgba(255,236,200,${0.85 * fl * fl})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- ③ kidney stones: the 700 dots ----------
const KD = (() => {
  const dots = [];
  for (const g of ['A', 'B']) for (const sz of ['small', 'large']) {
    const [ok, n] = KIDNEY[g][sz];
    for (let i = 0; i < n; i++) dots.push({ g, sz, ok: i < ok });
  }
  const S = 17, COLS = 25;
  const cxs = { A: 620, B: 1300 };
  const place = (list, cx, baseY, key) => {
    list.forEach((d, k) => {
      const col = k % COLS, row = Math.floor(k / COLS);
      d[key] = [cx + (col - (COLS - 1) / 2) * S, baseY - row * S];
    });
  };
  const r = rng(11);
  const shuffled = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  for (const g of ['A', 'B']) {
    const grp = dots.filter((d) => d.g === g);
    const ord = [...shuffled(grp.filter((d) => d.ok)), ...shuffled(grp.filter((d) => !d.ok))];
    place(ord, cxs[g], 640, 'merged');
    for (const [sz, base] of [['small', 452], ['large', 742]]) {
      const sub = grp.filter((d) => d.sz === sz);
      place([...sub.filter((d) => d.ok), ...sub.filter((d) => !d.ok)], cxs[g], base, 'split');
    }
  }
  dots.forEach((d, i) => { d.i = i; d.seed = hash(i, 5); });
  return { dots, cxs };
})();

// Berkeley layout for the first 454 dots
const BK = (() => {
  const people = [];
  BERKELEY.forEach(([dept, ma, mr, wa, wr], di) => {
    const m = Math.round(ma / 10), w = Math.round(wa / 10);
    const mAdm = Math.round(m * mr), wAdm = Math.round(w * wr);
    for (let i = 0; i < m; i++) people.push({ sex: 'm', di, adm: i < mAdm, k: i });
    for (let i = 0; i < w; i++) people.push({ sex: 'w', di, adm: i < wAdm, k: i });
  });
  const S = 16;
  const crowd = (list, cx, cols, baseY) => list.forEach((p, k) => {
    const col = k % cols, row = Math.floor(k / cols);
    p.crowd = [cx + (col - (cols - 1) / 2) * S + (hash(k, p.sex === 'm' ? 3 : 4) - 0.5) * 5, baseY - row * S + (hash(k, 9) - 0.5) * 5];
  });
  const r = rng(5);
  const men = people.filter((p) => p.sex === 'm').sort(() => r() - 0.5);
  const women = people.filter((p) => p.sex === 'w').sort(() => r() - 0.5);
  crowd(men, 620, 20, 650); crowd(women, 1300, 20, 650);
  const gx = (di) => 285 + di * 270;
  people.forEach((p) => {
    const cx = gx(p.di) + (p.sex === 'm' ? -30 : 30);
    const col = p.k % 4, row = Math.floor(p.k / 4);
    p.dept = [cx + (col - 1.5) * 12, 676 - row * 12];
  });
  // match kidney dots to people by x order so the morph flows sideways rather than criss-crossing
  const kOrder = KD.dots.slice().sort((a, b) => a.merged[0] - b.merged[0] || a.merged[1] - b.merged[1]);
  const pOrder = people.slice().sort((a, b) => a.crowd[0] - b.crowd[0] || a.crowd[1] - b.crowd[1]);
  const stride = kOrder.length / pOrder.length;
  const used = new Set();
  pOrder.forEach((p, i) => { const d = kOrder[Math.floor(i * stride)]; d.bk = p; used.add(d); });
  return { people, gx, used };
})();

function kidneyPos(d, t) {
  const tp = titlePoints()[d.i];
  let x = tp[0], y = tp[1];
  const step = (t0, dur, spread, target, ease = E.inOut) => {
    const del = d.seed * spread;
    const p = ease(prog(t, t0 + del, t0 + del + dur));
    if (p > 0) { x = lerp(x, target[0], p); y = lerp(y, target[1], p); }
    return p;
  };
  const p1 = step(bt(11) - 0.15, 1.5, 0.9, d.merged);
  // curved flight during first move
  if (p1 > 0 && p1 < 1) { const s = Math.sin(p1 * Math.PI); x += (hash(d.i, 21) - 0.5) * 260 * s; y += (hash(d.i, 22) - 0.5) * 200 * s; }
  step(bt(13) + 0.1, 1.2, 0.8, d.split);
  step(bt(17) + 0.05, 1.1, 0.6, d.merged);
  if (d.bk) {
    const p = step(bt(25) - 0.35, 1.6, 0.9, d.bk.crowd);
    if (p > 0 && p < 1) { const s = Math.sin(p * Math.PI); y -= 120 * s * hash(d.i, 23); }
    step(bt(31) + 0.1, 1.2, 0.7, d.bk.dept);
  }
  return [x, y];
}

function dotRadius(d, t) {
  const grow = ep(t, bt(11) + 0.4, bt(11) + 1.8);
  const base = d.sz === 'small' ? 3.3 : 6.3;
  let r = lerp(2.1, base, grow);
  if (d.bk) r = lerp(r, 4.0, ep(t, bt(25) - 0.2, bt(25) + 1.2));
  return r;
}

function sceneDots(ctx, t) {
  const t0 = bt(9) + 0.05, tEnd = bt(37) + 0.8;
  if (t < t0 || t > tEnd) return;
  const conv = ep(t, t0, t0 + 1.1, E.outQuint); // particles converging into title
  const visTitle = 1 - ep(t, bt(9) + 0.9, bt(9) + 1.4); // dots hide while title text shows
  const show = t < bt(11) - 0.4 ? visTitle : ep(t, bt(11) - 0.45, bt(11) - 0.1);
  const kidneyPhase = t < bt(25);
  const color = ep(t, bt(11) + 0.3, bt(11) + 1.6);
  const okShow = ep(t, bt(11) + 1.2, bt(11) + 2.2);
  const focusUpper = env(t, bt(15), bt(16) + 0.05, 0.3, 0.3);
  const focusLower = env(t, bt(16) - 0.05, bt(17) + 0.3, 0.3, 0.4);
  const bigFocus = env(t, bt(19), bt(21) + 0.3, 0.5, 0.5);
  const pulseA = env(t, bt(19) + 1.2, bt(21) + 0.3, 0.6, 0.5);
  // dots fade into the background behind the definition and the Simpson paper
  const defDim = 1 - 0.93 * ep(t, bt(21) - 0.1, bt(21) + 0.7) * (1 - ep(t, bt(25) - 0.6, bt(25) + 0.4));
  // Berkeley
  const bkCol = ep(t, bt(25) - 0.3, bt(25) + 1.0);
  const admShow = ep(t, bt(32) - 0.1, bt(32) + 0.9);
  const hardFocus = env(t, bt(33), bt(35) + 0.2, 0.5, 0.6);
  const recapDim = 1 - 0.95 * ep(t, bt(35), bt(35) + 0.8);
  const fadeOut = 1 - ep(t, bt(37) - 0.2, bt(37) + 0.7);

  ctx.save();
  for (const d of KD.dots) {
    let x, y;
    if (t < bt(9) + 1.2) {
      // converge from scattered start into title glyphs
      const tp = titlePoints()[d.i];
      const ang = hash(d.i, 31) * Math.PI * 2, rad = 650 + hash(d.i, 32) * 600;
      const sx = W / 2 + Math.cos(ang) * rad, sy = TITLE_Y + Math.sin(ang) * rad * 0.6;
      const k = E.outQuint(clamp(conv * 1.15 - d.seed * 0.15));
      x = lerp(sx, tp[0], k); y = lerp(sy, tp[1], k);
    } else [x, y] = kidneyPos(d, t);
    let alpha = show * fadeOut * defDim;
    if (!kidneyPhase && !d.bk) alpha *= 1 - ep(t, bt(25) - 0.4, bt(25) + 0.6);
    if (alpha <= 0.002) continue;
    let r = dotRadius(d, t);
    let col, ok = true, glow = 0;
    if (t < bt(25) + 0.6 || !d.bk) {
      const base = d.g === 'A' ? C.gold : C.blue;
      col = color > 0.5 ? base : C.goldHi;
      ok = okShow < 0.5 || d.ok;
      if (focusUpper > 0) alpha *= d.sz === 'small' ? 1 : lerp(1, 0.28, focusUpper);
      if (focusLower > 0) alpha *= d.sz === 'large' ? 1 : lerp(1, 0.28, focusLower);
      if (bigFocus > 0) {
        if (d.sz === 'small') alpha *= lerp(1, 0.16, bigFocus);
        else glow = bigFocus * (d.g === 'A' ? 1 : 0.5);
      }
      if (pulseA > 0 && d.g === 'A' && d.sz === 'large') { r *= 1 + 0.18 * pulseA * (0.5 + 0.5 * Math.sin(t * 6 + d.seed * 6)); glow = Math.max(glow, pulseA * 1.4); }
    }
    if (d.bk && t >= bt(25) - 0.6) {
      const p = d.bk, kc = bkCol;
      const base = p.sex === 'm' ? C.blue : C.gold;
      const prevBase = d.g === 'A' ? C.gold : C.blue;
      col = kc > 0.5 ? base : prevBase;
      ok = kc > 0.5 ? (admShow > 0 ? (p.adm ? true : admShow < 0.3) : true) : (okShow < 0.5 || d.ok);
      if (kc > 0.5 && admShow <= 0) alpha *= 0.82;
      if (kc > 0.5 && admShow > 0 && !p.adm) alpha *= lerp(0.82, 0.55, admShow);
      glow = 0;
      if (hardFocus > 0) {
        if (p.sex === 'w' && p.di >= 2) glow = hardFocus;
        else alpha *= lerp(1, 0.35, hardFocus);
      }
      alpha *= recapDim;
    }
    ctx.globalAlpha = alpha;
    if (glow > 0) { ctx.shadowColor = col; ctx.shadowBlur = 10 * glow; } else ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (ok) { ctx.fillStyle = col; ctx.fill(); }
    else { ctx.strokeStyle = col; ctx.lineWidth = 1.3; ctx.globalAlpha = alpha * 0.55; ctx.stroke(); }
  }
  ctx.restore();
}

function sceneKidneyLabels(ctx, t) {
  if (t < bt(11) || t > bt(21) + 0.8) return;
  const cx = KD.cxs;
  const out = 1 - ep(t, bt(21) - 0.2, bt(21) + 0.5);
  // block headers
  const ha = ep(t, bt(11) + 1.0, bt(11) + 1.9) * out;
  const headY = lerp(372, 238, ep(t, bt(13) + 0.1, bt(13) + 1.2)) ;
  const headY2 = lerp(headY, 372, ep(t, bt(17) + 0.05, bt(17) + 1.1));
  text(ctx, '手术 A', cx.A, headY2, { size: 36, weight: 900, color: C.gold, alpha: ha, ls: 4 });
  text(ctx, '手术 B', cx.B, headY2, { size: 36, weight: 900, color: C.blue, alpha: ha, ls: 4 });
  // merged-state counts
  const ma = env(t, bt(11) + 1.6, bt(13) + 0.3, 0.6, 0.4);
  text(ctx, '成功 273 / 350', cx.A, 700, { size: 24, color: C.cream, alpha: 0.7 * ma, fam: F.song, ls: 2 });
  text(ctx, '成功 289 / 350', cx.B, 700, { size: 24, color: C.cream, alpha: 0.7 * ma, fam: F.song, ls: 2 });
  // split-state row labels
  const sa = env(t, bt(13) + 0.8, bt(17) + 0.4, 0.6, 0.4);
  text(ctx, '小结石', W / 2, 382, { size: 34, weight: 700, alpha: sa, ls: 6 });
  text(ctx, '< 2 cm', W / 2, 420, { size: 22, fam: F.serif, italic: true, alpha: 0.55 * sa });
  text(ctx, '大结石', W / 2, 672, { size: 34, weight: 700, alpha: sa, ls: 6 });
  text(ctx, '≥ 2 cm', W / 2, 710, { size: 22, fam: F.serif, italic: true, alpha: 0.55 * sa });
  drawLine(ctx, 330, 520, 1590, 520, sa, 'rgba(217,180,108,0.25)', 1);
  // row percentages
  const row = (y, pa, pb, na, nb, t0) => {
    const p = ep(t, t0, t0 + 0.7, E.out) * sa;
    if (p <= 0) return;
    const k = ep(t, t0, t0 + 0.9);
    text(ctx, Math.round(pa * k) + '%', 380, y + 16, { size: 64, fam: F.didot, color: C.goldHi, align: 'right', alpha: p, glow: 18 });
    text(ctx, na, 380, y + 50, { size: 20, fam: F.serif, color: C.cream, align: 'right', alpha: 0.5 * p });
    text(ctx, Math.round(pb * k) + '%', 1540, y + 16, { size: 64, fam: F.didot, color: C.blueHi, align: 'left', alpha: p });
    text(ctx, nb, 1540, y + 50, { size: 20, fam: F.serif, color: C.cream, align: 'left', alpha: 0.5 * p });
    ctx.save(); ctx.globalAlpha = sa; seal(ctx, 214, y - 2, 58, '胜', prog(t, t0 + 0.75, t0 + 1.15)); ctx.restore();
  };
  row(380, 93, 87, '81 / 87', '234 / 270', bt(15));
  row(670, 73, 69, '192 / 263', '55 / 80', bt(16));
  // merged totals after the split
  const tt = env(t, bt(17) + 0.7, bt(21) + 0.6, 0.6, 0.5) * out;
  if (tt > 0) {
    const k = ep(t, bt(17) + 0.7, bt(17) + 1.6);
    text(ctx, '合计', cx.A - 150, 718, { size: 24, alpha: 0.6 * tt, ls: 4 });
    text(ctx, Math.round(78 * k) + '%', cx.A, 730, { size: 72, fam: F.didot, color: C.gold, alpha: tt });
    text(ctx, '合计', cx.B - 150, 718, { size: 24, alpha: 0.6 * tt, ls: 4 });
    text(ctx, Math.round(83 * k) + '%', cx.B, 730, { size: 72, fam: F.didot, color: C.blueHi, alpha: tt, glow: 16, glowColor: 'rgba(160,200,230,0.5)' });
    text(ctx, '小结石 93%  ·  大结石 73%', cx.A, 780, { size: 22, color: C.goldHi, alpha: 0.8 * tt, ls: 1 });
    text(ctx, '小结石 87%  ·  大结石 69%', cx.B, 780, { size: 22, color: C.cream, alpha: 0.45 * tt, ls: 1 });
    ctx.save(); ctx.globalAlpha = tt; seal(ctx, cx.B + 150, 704, 58, '胜', prog(t, bt(18), bt(18) + 0.4)); ctx.restore();
  }
  // large-stone counts
  const lc = env(t, bt(19) + 0.3, bt(21) + 0.6, 0.5, 0.5) * out;
  if (lc > 0) {
    text(ctx, '大结石  263 / 350', cx.A, 318, { size: 26, weight: 700, color: C.goldHi, alpha: lc, ls: 2 });
    text(ctx, '大结石  80 / 350', cx.B, 318, { size: 26, weight: 700, color: C.blueHi, alpha: lc * 0.85, ls: 2 });
  }
  const hard = env(t, bt(19) + 1.0, bt(21) + 0.6, 0.6, 0.5) * out;
  if (hard > 0) {
    ctx.save(); ctx.globalAlpha = hard;
    roundRect(ctx, cx.A - 120, 236, 240, 44, 22); ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
    text(ctx, '更难的病人', cx.A, 267, { size: 26, weight: 700, color: C.goldHi, alpha: hard, ls: 6 });
  }
}

// ---------- ④ Berkeley ----------
function sceneBerkeley(ctx, t) {
  if (t < bt(25) - 0.2 || t > bt(37) + 0.6) return;
  const out = 1 - ep(t, bt(37) - 0.3, bt(37) + 0.5);
  const recapDim = 1 - 0.95 * ep(t, bt(35), bt(35) + 0.8);
  // crowd labels
  const ca = env(t, bt(25) + 1.0, bt(31) + 0.6, 0.6, 0.5);
  text(ctx, '男', 620, 360, { size: 36, weight: 900, color: C.blue, alpha: ca, ls: 4 });
  text(ctx, '女', 1300, 360, { size: 36, weight: 900, color: C.gold, alpha: ca, ls: 4 });
  const na = env(t, bt(27), bt(31) + 0.6, 0.5, 0.5);
  if (na > 0) {
    const k = ep(t, bt(27), bt(27) + 1.2);
    text(ctx, Math.round(44 * k) + '%', 620, 760, { size: 92, fam: F.didot, color: C.blueHi, alpha: na });
    text(ctx, Math.round(35 * k) + '%', 1300, 760, { size: 92, fam: F.didot, color: C.goldHi, alpha: na });
    text(ctx, '8442 人申请 · 录取率', 620, 806, { size: 22, alpha: 0.55 * na, ls: 2 });
    text(ctx, '4321 人申请 · 录取率', 1300, 806, { size: 22, alpha: 0.55 * na, ls: 2 });
  }
  // stamp
  const sp = prog(t, bt(29) + 0.15, bt(29) + 0.55);
  const sOut = 1 - ep(t, bt(31), bt(31) + 0.5);
  if (sp > 0 && sOut > 0) {
    const shake = (1 - clamp(sp * 2.5 - 1)) * (sp > 0.4 ? 1 : 0);
    ctx.save(); ctx.globalAlpha = sOut; ctx.translate(Math.sin(t * 90) * 6 * shake, 0);
    seal(ctx, W / 2 - 20, 500, 200, '性别歧视', sp, -0.1);
    text(ctx, '?', W / 2 + 96, 592, { size: 170, fam: F.didot, align: 'left', color: C.red, alpha: clamp(sp * 3) * 0.95 });
    ctx.restore();
  }
  // gates
  const ga = ep(t, bt(31) + 0.1, bt(31) + 1.2) * out;
  if (ga > 0) {
    BERKELEY.forEach(([dept, ma, mr, wa, wr], di) => {
      const gx = BK.gx(di);
      const rate = (ma * mr + wa * wr) / (ma + wa);
      const open = 24 + 150 * rate;
      const gp = ep(t, bt(31) + 0.1 + di * 0.1, bt(31) + 0.9 + di * 0.1, E.out);
      const dim = recapDim;
      ctx.save(); ctx.globalAlpha = gp * dim;
      ctx.strokeStyle = C.goldDim; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(gx - 110, 696); ctx.lineTo(gx - open / 2, 696); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx + open / 2, 696); ctx.lineTo(gx + 110, 696); ctx.stroke();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 4;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(gx + s * open / 2, 686); ctx.lineTo(gx + s * open / 2, 716); ctx.stroke(); }
      ctx.restore();
      text(ctx, dept, gx, 768, { size: 40, fam: F.didot, color: C.cream, alpha: gp * dim });
      // rates
      const ra = ep(t, bt(32) - 0.1 + di * 0.08, bt(32) + 0.6 + di * 0.08) * dim;
      text(ctx, '男 ' + Math.round(mr * 100) + '%', gx - 6, 808, { size: 22, color: C.blueHi, alpha: ra, align: 'right' });
      text(ctx, '女 ' + Math.round(wr * 100) + '%', gx + 6, 808, { size: 22, color: wr > mr ? C.goldHi : C.cream, alpha: ra * (wr > mr ? 1 : 0.6), align: 'left', weight: wr > mr ? 700 : 400 });
      if (wr > mr) {
        const top = 676 - Math.ceil(Math.max(Math.round(ma / 10), Math.round(wa / 10)) / 4) * 12 - 34;
        ctx.save(); ctx.globalAlpha = dim;
        checkMark(ctx, gx + 30, top, 34, ep(t, bt(32) + 0.5 + di * 0.12, bt(32) + 1.0 + di * 0.12, E.out), C.goldHi, 5);
        ctx.restore();
      }
    });
    // easy vs hard brackets
    const hb = env(t, bt(33) + 0.2, bt(35) + 0.2, 0.6, 0.6);
    if (hb > 0) {
      const bracket = (x1, x2, label, sub, col) => {
        ctx.save(); ctx.globalAlpha = hb; ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1, 834); ctx.lineTo(x1, 846); ctx.lineTo(x2, 846); ctx.lineTo(x2, 834); ctx.stroke(); ctx.restore();
        text(ctx, label, (x1 + x2) / 2, 884, { size: 26, weight: 700, color: col, alpha: hb, ls: 4 });
        text(ctx, sub, (x1 + x2) / 2, 916, { size: 20, color: C.cream, alpha: 0.55 * hb });
      };
      bracket(BK.gx(0) - 110, BK.gx(1) + 110, '好进', '录取率 63%–64%', C.blueHi);
      bracket(BK.gx(2) - 110, BK.gx(5) + 110, '难进', '录取率 6% – 35%', C.redHi);
      text(ctx, '女生申请者 93% 报了这四个', (BK.gx(2) + BK.gx(5)) / 2, 452, { size: 24, color: C.goldHi, alpha: hb, ls: 2 });
    }
  }
}

// ---------- definition: name the paradox right after the kidney example ----------
function darkPlate(ctx, cy, a, r = 760) {
  const g = ctx.createRadialGradient(W / 2, cy, 40, W / 2, cy, r);
  g.addColorStop(0, `rgba(8,7,6,${0.78 * a})`); g.addColorStop(1, 'rgba(8,7,6,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function chip(ctx, x, y, label, col, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  roundRect(ctx, x - 125, y - 30, 250, 56, 28);
  ctx.fillStyle = 'rgba(20,16,12,0.85)'; ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.restore();
  text(ctx, label, x, y + 9, { size: 26, weight: 700, color: col, alpha: a, ls: 2 });
}

function sceneDefinition(ctx, t) {
  const t0 = bt(21), t1 = bt(23), t2 = bt(25);
  if (t < t0 - 0.2 || t > t2 + 0.4) return;
  const a = env(t, t0, t2 + 0.1, 0.5, 0.6);
  darkPlate(ctx, 520, a * (1 - 0.5 * ep(t, t1, t1 + 1.0)));
  // light pulse on the name reveal
  const pulse = Math.exp(-Math.max(0, t - t0 - 0.2) * 2.2) * (t > t0 ? 1 : 0);
  if (pulse > 0.01) {
    const g = ctx.createRadialGradient(W / 2, 430, 0, W / 2, 430, 620);
    g.addColorStop(0, `rgba(250,215,150,${0.22 * pulse})`); g.addColorStop(1, 'rgba(250,215,150,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  // at bar 23 the name shrinks to a heading above the Simpson paper
  const up = ep(t, t1, t1 + 1.0);
  const k1 = ep(t, t0 + 0.1, t0 + 1.0, E.outQuint);
  const ty = lerp(450, 205, up), ts = lerp(0.72 * (0.95 + 0.05 * k1), 0.4, up);
  text(ctx, "SIMPSON’S PARADOX", W / 2, ty - lerp(128, 0, up) , { size: 22, fam: F.serif, ls: 12, color: C.gold, alpha: a * k1 * (1 - up) });
  ctx.save(); ctx.globalAlpha = a * k1;
  ctx.translate(W / 2, ty); ctx.scale(ts, ts); ctx.translate(-W / 2, -TITLE_Y);
  drawTitleText(ctx, 1);
  ctx.restore();
  const fadeBody = 1 - ep(t, t1 - 0.1, t1 + 0.5);
  const lp = ep(t, t0 + 0.5, t0 + 1.3, E.outQuint);
  drawLine(ctx, W / 2, 498, W / 2 - 230 * lp, 498, 1, C.goldDim, 1.2, a * fadeBody);
  drawLine(ctx, W / 2, 498, W / 2 + 230 * lp, 498, 1, C.goldDim, 1.2, a * fadeBody);
  const da = ep(t, t0 + 0.7, t0 + 1.5) * a * fadeBody;
  text(ctx, '分组数据中，每一组都成立的趋势，', W / 2, 570, { size: 36, weight: 700, alpha: da, ls: 3 });
  richText(ctx, '合并之后却【消失】，甚至【反转】。', W / 2, 626, { size: 36, weight: 700, alpha: da, ls: 3 });
  const ea = (d) => ep(t, t0 + 1.5 + d, t0 + 2.1 + d) * a * fadeBody;
  chip(ctx, W / 2 - 300, 726, '小结石  A 胜', C.goldHi, ea(0));
  chip(ctx, W / 2, 726, '大结石  A 胜', C.goldHi, ea(0.2));
  chip(ctx, W / 2 + 300, 726, '合计  B 胜', C.blueHi, ea(0.5));
}

// ---------- Simpson's 1951 paper ----------
function sceneSimpson(ctx, t) {
  const t0 = bt(23), t1 = bt(25);
  if (t < t0 || t > t1 + 0.6) return;
  const pa = env(t, t0 + 0.3, t1 + 0.2, 0.7, 0.6);
  if (pa <= 0) return;
  // cipher groups backdrop (he broke naval codes at Bletchley Park)
  ctx.save(); ctx.globalAlpha = 0.085 * pa; setFont(ctx, 22, 400, F.mono); ctx.fillStyle = C.gold; ctx.textAlign = 'left';
  for (let row = 3; row < 18; row++) for (let col = 0; col < 14; col++) {
    let s = ''; for (let k = 0; k < 5; k++) s += Math.floor(hash(row * 97 + col * 13 + k, 77) * 10);
    ctx.fillText(s, 40 + col * 136, 160 + row * 46 - ((t * 14) % 46));
  }
  ctx.restore();
  const rise = (1 - E.out(prog(t, t0 + 0.3, t0 + 1.3))) * 40;
  ctx.save(); ctx.globalAlpha = pa; ctx.translate(W / 2, 600 + rise); ctx.rotate(-0.025);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
  ctx.fillStyle = C.paper; ctx.fillRect(-330, -230, 660, 420);
  ctx.shadowColor = 'transparent';
  const pg = ctx.createLinearGradient(-330, -230, 330, 190);
  pg.addColorStop(0, 'rgba(255,250,235,0.3)'); pg.addColorStop(1, 'rgba(120,90,50,0.18)');
  ctx.fillStyle = pg; ctx.fillRect(-330, -230, 660, 420);
  ctx.fillStyle = C.ink;
  setFont(ctx, 13, 400, F.serif); ctx.textAlign = 'center'; ctx.letterSpacing = '2px';
  ctx.fillText('JOURNAL OF THE ROYAL STATISTICAL SOCIETY  ·  SERIES B  ·  1951', 0, -184);
  ctx.letterSpacing = '0px';
  ctx.fillRect(-280, -168, 560, 1);
  setFont(ctx, 34, 400, F.serif);
  ctx.fillText('The Interpretation of Interaction', 0, -112);
  ctx.fillText('in Contingency Tables', 0, -70);
  setFont(ctx, 18, 400, F.serif, 'italic');
  ctx.fillText('By E. H. SIMPSON', 0, -30);
  ctx.globalAlpha *= 0.32;
  for (let i = 0; i < 6; i++) { const w = 520 - (i === 5 ? 200 : hash(i, 8) * 40); ctx.fillRect(-260, 6 + i * 26, w, 5); }
  ctx.restore();
}

// ---------- recap after Berkeley: the hidden factor ----------
function sceneRecap(ctx, t) {
  const t0 = bt(35), t1 = bt(37);
  if (t < t0 || t > t1 + 0.6) return;
  const a = env(t, t0 + 0.2, t1 + 0.2, 0.6, 0.6);
  darkPlate(ctx, 520, a, 820);
  text(ctx, '两个案例  ·  同一个陷阱', W / 2, 318, { size: 24, color: C.cream, alpha: 0.6 * a, ls: 8 });
  text(ctx, '藏在背后的因素', W / 2, 412, { size: 64, weight: 900, color: C.goldHi, alpha: a, ls: 10, glow: 26 });
  const lp = ep(t, t0 + 0.5, t0 + 1.2, E.outQuint);
  drawLine(ctx, W / 2, 452, W / 2 - 300 * lp, 452, 1, C.goldDim, 1.2, a);
  drawLine(ctx, W / 2, 452, W / 2 + 300 * lp, 452, 1, C.goldDim, 1.2, a);
  const rows = [
    ['肾结石', '结石大小', '难治的，多分给了 A'],
    ['伯克利', '院系难度', '女生，多报了难进的'],
  ];
  rows.forEach(([c, f, e], i) => {
    const y = 548 + i * 82;
    const ra = ep(t, t0 + 0.8 + i * 0.5, t0 + 1.5 + i * 0.5) * a;
    text(ctx, c, W / 2 - 330, y, { size: 32, weight: 700, color: C.cream, alpha: ra, ls: 4 });
    arrow(ctx, W / 2 - 240, y - 11, W / 2 - 120, y - 11, ra > 0 ? 1 : 0, { color: C.goldDim, width: 2, head: 10, alpha: ra });
    text(ctx, f, W / 2, y, { size: 36, weight: 900, color: C.goldHi, alpha: ra, ls: 4 });
    arrow(ctx, W / 2 + 120, y - 11, W / 2 + 200, y - 11, ra > 0 ? 1 : 0, { color: C.goldDim, width: 2, head: 10, alpha: ra });
    text(ctx, e, W / 2 + 225, y, { size: 28, color: C.cream, alpha: 0.75 * ra, align: 'left', ls: 2 });
  });
  const ta = ep(t, t0 + 2.0, t0 + 2.8) * a;
  text(ctx, '统计学里，它叫「混杂因素」', W / 2, 760, { size: 26, color: C.cream, alpha: 0.6 * ta, ls: 4 });
}
