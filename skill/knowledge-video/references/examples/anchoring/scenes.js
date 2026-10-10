// Scenes for 锚定效应. Bars: ① 1–9 hook, ② 9–11 title, ③ 11–23 wheel experiment, ④ 23–37 judges,
// ⑤ 37–45 mechanism, ⑥ 45–53 everyday life, ⑦ 53–61 AI, ⑧ 61–68 ending.

// ---------- components ----------
function drawAnchor(ctx, x, y, s, color = C.gold, alpha = 1, rot = 0, glow = 0) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = Math.max(1.5, s * 0.075); ctx.lineCap = 'round';
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
  ctx.beginPath(); ctx.arc(0, -s * 0.42, s * 0.09, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -s * 0.33); ctx.lineTo(0, s * 0.44); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.2); ctx.lineTo(s * 0.2, -s * 0.2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, s * 0.04, s * 0.4, Math.PI * 0.12, Math.PI * 0.88); ctx.stroke();
  for (const sx of [-1, 1]) {
    const ax = Math.cos(Math.PI * (sx > 0 ? 0.12 : 0.88)) * s * 0.4, ay = s * 0.04 + Math.sin(Math.PI * 0.12) * s * 0.4;
    ctx.beginPath(); ctx.moveTo(ax + sx * s * 0.09, ay + s * 0.02); ctx.lineTo(ax - sx * s * 0.02, ay - s * 0.13); ctx.lineTo(ax - sx * s * 0.06, ay + s * 0.06); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// Wheel of fortune 0–99. rot: rotation; the value under the top pointer is valueAt(rot).
const wheelRotFor = (v) => -(v / 100) * Math.PI * 2;
const valueAt = (rot) => { let v = Math.round((-rot / (Math.PI * 2)) * 100) % 100; if (v < 0) v += 100; return v; };
function wheelRot(t, t0, dur, target, turns) {
  const p = E.outQuint(prog(t, t0, t0 + dur));
  return wheelRotFor(target) - (1 - p) * turns * Math.PI * 2;
}
function drawWheel(ctx, cx, cy, R, rot, o = {}) {
  const a = o.alpha == null ? 1 : o.alpha;
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, cy);
  const base = ctx.globalAlpha;
  const g = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.6);
  g.addColorStop(0, 'rgba(240,200,120,0.10)'); g.addColorStop(1, 'rgba(240,200,120,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.rotate(rot);
  for (let s = 0; s < 10; s++) {
    const a0 = -Math.PI / 2 + ((s * 10 - 0.5) / 100) * Math.PI * 2, a1 = -Math.PI / 2 + ((s * 10 + 9.5) / 100) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a0, a1); ctx.closePath();
    ctx.fillStyle = s % 2 ? 'rgba(217,180,108,0.10)' : 'rgba(255,240,210,0.035)'; ctx.fill();
  }
  if (o.hl != null && o.hlA > 0) {
    const a0 = -Math.PI / 2 + ((o.hl - 0.5) / 100) * Math.PI * 2, a1 = -Math.PI / 2 + ((o.hl + 0.5) / 100) * Math.PI * 2;
    ctx.save(); ctx.globalAlpha *= o.hlA; ctx.shadowColor = o.hlColor || C.redHi; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a0, a1); ctx.closePath(); ctx.fillStyle = o.hlColor || C.redHi; ctx.fill(); ctx.restore();
  }
  ctx.strokeStyle = C.gold; ctx.lineCap = 'round';
  for (let v = 0; v < 100; v++) {
    const ang = -Math.PI / 2 + (v / 100) * Math.PI * 2;
    const len = v % 10 === 0 ? R * 0.12 : v % 5 === 0 ? R * 0.07 : R * 0.04;
    ctx.globalAlpha = base * (v % 10 === 0 ? 0.9 : 0.45); ctx.lineWidth = v % 10 === 0 ? 2.2 : 1;
    ctx.beginPath(); ctx.moveTo(Math.cos(ang) * (R - len), Math.sin(ang) * (R - len)); ctx.lineTo(Math.cos(ang) * R, Math.sin(ang) * R); ctx.stroke();
  }
  ctx.globalAlpha = base;
  for (let v = 0; v < 100; v += 10) {
    const ang = -Math.PI / 2 + (v / 100) * Math.PI * 2;
    ctx.save(); ctx.translate(Math.cos(ang) * R * 0.76, Math.sin(ang) * R * 0.76); ctx.rotate(ang + Math.PI / 2);
    setFont(ctx, Math.max(12, R * 0.11), 400, F.didot); ctx.fillStyle = C.cream; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(v), 0, 0); ctx.restore();
  }
  ctx.restore();
  ctx.lineWidth = 2.5; ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1; ctx.globalAlpha = base * 0.5; ctx.beginPath(); ctx.arc(0, 0, R + 10, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = base;
  // hub showing the live value
  ctx.fillStyle = '#16120d'; ctx.beginPath(); ctx.arc(0, 0, R * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
  const val = valueAt(rot);
  text(ctx, String(val), 0, R * 0.105, { size: R * 0.3, fam: F.didot, color: o.landed ? (o.hlColor || C.redHi) : C.cream, glow: o.landed ? 16 : 0, glowColor: 'rgba(230,120,90,0.6)' });
  // pointer
  ctx.fillStyle = C.goldHi; ctx.shadowColor = C.gold; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.moveTo(0, -R + 8); ctx.lineTo(-R * 0.07, -R - R * 0.1); ctx.lineTo(R * 0.07, -R - R * 0.1); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function pips(face) {
  const m = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  return m[face];
}
function drawDie(ctx, x, y, s, face, rot, color, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= alpha;
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  roundRect(ctx, -s / 2, -s / 2, s, s, s * 0.18); ctx.fillStyle = '#efe6d2'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = face === 1 ? C.red : '#2a2219';
  for (const [px, py] of pips(face)) { ctx.beginPath(); ctx.arc(px * s * 0.26, py * s * 0.26, s * 0.085, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
// A rolling pair that lands on [f1,f2] at tLand.
function dicePair(ctx, cx, cy, t, t0, tLand, faces, color, alpha) {
  const rolling = t < tLand;
  const p = prog(t, t0, tLand);
  for (let k = 0; k < 2; k++) {
    const seed = k * 7 + Math.round(cx);
    const step = Math.floor(t * 14);
    const face = rolling ? 1 + Math.floor(hash(step + seed, 41) * 6) : faces[k];
    const bounce = rolling ? Math.abs(Math.sin(t * 9 + k)) * 46 * (1 - p) : 0;
    const rot = rolling ? (t * (5 + k) + k) * (1 - p) : (k ? 0.12 : -0.08);
    const dx = (k ? 54 : -54) + (rolling ? Math.sin(t * 4 + k * 2) * 20 * (1 - p) : 0);
    drawDie(ctx, cx + dx, cy - bounce, 86, face, rot, color, alpha);
  }
}

function drawPriceTag(ctx, cx, cy, sc, rot, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= alpha;
  const w = 620, h = 300;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 80, -h / 2); ctx.lineTo(w / 2 - 18, -h / 2); ctx.arcTo(w / 2, -h / 2, w / 2, -h / 2 + 18, 18);
  ctx.lineTo(w / 2, h / 2 - 18); ctx.arcTo(w / 2, h / 2, w / 2 - 18, h / 2, 18); ctx.lineTo(-w / 2 + 80, h / 2); ctx.lineTo(-w / 2, 0); ctx.closePath();
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#1c1712'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(-w / 2 + 60, 0, 13, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function person(ctx, x, y, color, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y - 46, 22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 44, y + 30); ctx.quadraticCurveTo(x - 44, y - 18, x, y - 18); ctx.quadraticCurveTo(x + 44, y - 18, x + 44, y + 30); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function bubble(ctx, x, y, w, h, tail, alpha, o = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2 > 24 ? 22 : h / 2);
  ctx.fillStyle = o.fill || 'rgba(30,25,18,0.95)'; ctx.fill();
  ctx.strokeStyle = o.color || C.gold; ctx.lineWidth = 1.6; ctx.stroke();
  if (tail) {
    ctx.beginPath(); ctx.moveTo(x + tail * 20, y + h / 2 - 1); ctx.lineTo(x + tail * 36, y + h / 2 + 18); ctx.lineTo(x + tail * 44, y + h / 2 - 1);
    ctx.fillStyle = o.fill || 'rgba(30,25,18,0.95)'; ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// generic number axis 0..100 (o.pct adds a % sign to labels)
function drawAxis(ctx, x0, x1, y, p, alpha = 1, o = {}) {
  if (alpha <= 0 || p <= 0) return;
  drawLine(ctx, x0, y, lerp(x0, x1, p), y, 1, o.color || C.goldDim, 2, alpha);
  const step = o.step || 10;
  for (let v = 0; v <= 100; v += step) {
    const k = v / 100; if (k > p + 1e-6) break;
    const x = lerp(x0, x1, k);
    drawLine(ctx, x, y - 6, x, y + 6, 1, C.goldDim, 1.5, alpha);
    if (!o.noLabels) text(ctx, v + (o.pct ? '%' : ''), x, y + (o.labelBelow || 34), { size: o.labelSize || 20, fam: F.didot, color: C.cream, alpha: 0.5 * alpha });
  }
}

// A rope from (x1,y1) to (x2,y2); sag pulls the middle down, 0 = taut.
function drawRope(ctx, x1, y1, x2, y2, sag, alpha, color = C.gold, width = 2, p = 1) {
  if (alpha <= 0 || p <= 0) return;
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 + sag;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 30; i++) {
    const u = (i / 30) * p;
    const x = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * cx + u * u * x2, y = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * cy + u * u * y2;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke(); ctx.restore();
}

// Expanding rings for an impact or a landing.
function ripples(ctx, x, y, r0, r1, t, t0, color, n = 2, alpha = 1) {
  for (let k = 0; k < n; k++) {
    const p = prog(t, t0 + k * 0.3, t0 + k * 0.3 + 1.2);
    if (p <= 0 || p >= 1) continue;
    ctx.save(); ctx.globalAlpha *= alpha * (1 - p) * 0.7; ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, lerp(r0, r1, E.out(p)), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
}

// ---------- ① hook ----------
const HOOK_SPIN = [bt(1) + 0.8, bt(3) + 0.6];
const GUESS = 47;
function hookGuess(t) {
  // slides down from the anchor, overshoots a little, then settles on GUESS
  const a = ep(t, bt(6) + 0.2, bt(6) + 2.4);
  const b = ep(t, bt(7) + 0.3, bt(8) - 0.2);
  return lerp(lerp(65, 43, a), GUESS, b);
}
function sceneHook(ctx, t) {
  if (t > bt(9) + 0.7) return;
  const a = env(t, 0.5, bt(9) + 0.1, 1.2, 0.3);
  ctx.save(); ctx.globalAlpha = a;
  const mv = ep(t, bt(4), bt(4) + 1.2);
  const cx = lerp(W / 2, 560, mv), cy = 500, R = 250 * lerp(1, 0.8, mv);
  const appear = ep(t, 0.5, 2.0, E.outQuint);
  const tl = HOOK_SPIN[1];
  let rot = wheelRot(t, HOOK_SPIN[0], tl - HOOK_SPIN[0], 65, 5);
  if (t > tl) rot += 0.02 * Math.exp(-5 * (t - tl)) * Math.sin(22 * (t - tl)); // pointer settles
  const landed = t >= tl - 0.05;
  ripples(ctx, cx, cy, R, R * 1.45, t, tl, C.redHi, 3);
  drawWheel(ctx, cx, cy + (1 - appear) * 40, R, rot, { alpha: appear, hl: 65, hlA: landed ? ep(t, tl - 0.05, tl + 0.4) : 0, landed });
  // question + axis
  const qa = ep(t, bt(4) + 0.4, bt(4) + 1.3);
  if (qa > 0) {
    const rise = (1 - E.out(qa)) * 20;
    text(ctx, '联合国成员国中，', 1340, 300 + rise, { size: 44, weight: 700, alpha: qa, ls: 3 });
    text(ctx, '非洲国家占多少？', 1340, 364 + rise, { size: 44, weight: 700, alpha: qa, ls: 3 });
    const x0 = 1000, x1 = 1680, y = 600, X = (v) => lerp(x0, x1, v / 100);
    drawAxis(ctx, x0, x1, y, ep(t, bt(4) + 0.6, bt(4) + 1.6), qa, { step: 20, pct: true });
    // the wheel's number, marked on the axis
    const ma = ep(t, bt(4) + 1.2, bt(4) + 1.8);
    drawLine(ctx, X(65), y, X(65), y - 64 * E.outBack(ma), 1, C.redHi, 2.5, ma);
    ctx.save(); ctx.globalAlpha *= ma; ctx.fillStyle = C.redHi; ctx.beginPath(); ctx.arc(X(65), y - 64 * E.outBack(ma), 7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    text(ctx, '65', X(65) + 16, y - 54, { size: 30, fam: F.didot, color: C.redHi, alpha: ma, align: 'left' });
    // more or less?
    const ml = env(t, bt(5), bt(6) + 0.2, 0.3, 0.4);
    if (ml > 0) {
      const wob = Math.sin(t * 6) * 8;
      arrow(ctx, X(65) - 30, y - 30, X(65) - 110 - wob, y - 30, 1, { color: C.cream, width: 2, alpha: ml * 0.8, head: 12 });
      arrow(ctx, X(65) + 30, y - 30, X(65) + 110 + wob, y - 30, 1, { color: C.cream, width: 2, alpha: ml * 0.8, head: 12 });
      text(ctx, '少？', X(65) - 150 - wob, y - 22, { size: 26, alpha: ml, color: C.cream });
      text(ctx, '多？', X(65) + 150 + wob, y - 22, { size: 26, alpha: ml, color: C.cream });
    }
    // your guess, with a live readout
    const ga = ep(t, bt(6), bt(6) + 0.4);
    if (ga > 0) {
      const gv = hookGuess(t), gx = X(gv);
      ctx.save(); ctx.globalAlpha *= ga; ctx.fillStyle = C.goldHi; ctx.shadowColor = C.gold; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.moveTo(gx, y - 16); ctx.lineTo(gx + 12, y); ctx.lineTo(gx, y + 16); ctx.lineTo(gx - 12, y); ctx.closePath(); ctx.fill(); ctx.restore();
      text(ctx, Math.round(gv) + '%', gx, y - 30, { size: 30, fam: F.didot, color: C.goldHi, alpha: ga });
      text(ctx, '你的估计', gx, y + 64, { size: 22, color: C.goldHi, alpha: ga, ls: 2 });
    }
    // the anchor drops onto 65 and ropes the guess
    const dp = prog(t, bt(8) - 0.05, bt(8) + 0.5);
    if (dp > 0) {
      const ay = lerp(y - 330, y - 140, E.outBack(dp));
      drawAnchor(ctx, X(65), ay, 70, C.goldHi, qa * clamp(dp * 3), 0, 14);
      const rp = ep(t, bt(8) + 0.4, bt(8) + 1.1);
      if (rp > 0) {
        const gx = X(GUESS);
        ctx.save(); ctx.globalAlpha *= qa * rp; ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(X(65), ay + 30); ctx.quadraticCurveTo((X(65) + gx) / 2, y - 20, gx, y - 18); ctx.stroke(); ctx.restore();
      }
    }
  }
  ctx.restore();
  const fl = Math.pow(prog(t, bt(9) - 0.55, bt(9)), 2.2) * (t < bt(9) ? 1 : 0);
  if (fl > 0) { ctx.fillStyle = `rgba(255,236,200,${0.85 * fl})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- ② title ----------
const TITLE_Y = 540;
function drawTitleText(c, alpha = 1, size = 160) {
  c.save();
  setFont(c, size, 900, F.song); c.letterSpacing = '30px'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const g = c.createLinearGradient(0, TITLE_Y - size * 0.85, 0, TITLE_Y + 10);
  g.addColorStop(0, '#fbe9b8'); g.addColorStop(0.55, '#e0b56a'); g.addColorStop(1, '#a87b3b');
  c.fillStyle = g; c.globalAlpha *= alpha; c.shadowColor = 'rgba(240,190,100,0.45)'; c.shadowBlur = 36;
  c.fillText('锚定效应', W / 2 + 15, TITLE_Y);
  c.restore();
}
const NP = 600; // title particles; the first 100 become participants
function titlePoints() { return sampleText('title', (c) => drawTitleText(c, 1), NP, 3, 9); }

function sceneTitle(ctx, t) {
  const t0 = bt(9), t1 = bt(11);
  if (t < t0 || t > t1 + 0.6) return;
  const ra = env(t, t0, t1 + 0.2, 0.3, 0.8);
  ctx.save(); ctx.translate(W / 2, TITLE_Y - 50); ctx.rotate(t * 0.04);
  for (let i = 0; i < 64; i++) {
    const ang = (i / 64) * Math.PI * 2, len = 380 + hash(i, 33) * 520;
    const g = ctx.createLinearGradient(0, 0, Math.cos(ang) * len, Math.sin(ang) * len);
    g.addColorStop(0, `rgba(240,200,130,${0.10 * ra})`); g.addColorStop(1, 'rgba(240,200,130,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 1 + hash(i, 34) * 2.2;
    ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 60, Math.sin(ang) * 60); ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len); ctx.stroke();
  }
  ctx.restore();
  const ta = ep(t, t0 + 0.75, t0 + 1.4) * (1 - ep(t, t1 - 0.45, t1 + 0.05));
  const s = 1 + 0.03 * prog(t, t0, t1);
  ctx.save(); ctx.translate(W / 2, TITLE_Y); ctx.scale(s, s); ctx.translate(-W / 2, -TITLE_Y); drawTitleText(ctx, ta); ctx.restore();
  const sa = ep(t, t0 + 0.9, t0 + 1.7) * env(t, t0, t1, 0.01, 0.5);
  text(ctx, 'ANCHORING EFFECT', W / 2, TITLE_Y - 200, { size: 28, fam: F.serif, ls: 14, color: C.gold, alpha: sa });
  const lp = ep(t, t0 + 1.4, t0 + 2.2, E.outQuint);
  drawLine(ctx, W / 2, TITLE_Y + 70, W / 2 - 200 * lp, TITLE_Y + 70, 1, C.goldDim, 1.2, sa);
  drawLine(ctx, W / 2, TITLE_Y + 70, W / 2 + 200 * lp, TITLE_Y + 70, 1, C.goldDim, 1.2, sa);
  const ua = ep(t, t0 + 1.8, t0 + 2.6) * env(t, t0, t1, 0.01, 0.5);
  text(ctx, '一个无关的数字，悄悄拴住了你的判断', W / 2, TITLE_Y + 132, { size: 32, color: C.cream, alpha: 0.85 * ua, ls: 8 });
  drawAnchor(ctx, W / 2, TITLE_Y + 230, 54, C.gold, ua * 0.8);
  const fl = 1 - prog(t, t0, t0 + 0.7);
  if (fl > 0) { ctx.fillStyle = `rgba(255,236,200,${0.85 * fl * fl})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- ③ wheel experiment: 100 participant dots ----------
const WX = { lo: 560, hi: 1360 }, WY = 330, WR = 112;
const AXY = 700, AX0 = 360, AX1 = 1560;
const axX = (v) => lerp(AX0, AX1, v / 100);
const PART = (() => {
  const dots = [];
  for (let i = 0; i < 100; i++) dots.push({ i, g: i < 50 ? 'lo' : 'hi', v: i < 50 ? EST_LO[i] : EST_HI[i - 50], seed: hash(i, 5) });
  // cluster under each wheel
  for (const g of ['lo', 'hi']) {
    dots.filter((d) => d.g === g).forEach((d, k) => { d.cluster = [WX[g] + ((k % 10) - 4.5) * 20, 520 + Math.floor(k / 10) * 20]; });
  }
  // beeswarm: lo stacks up from the axis, hi stacks down
  const S = 14, BIN = 4, bins = {};
  for (const d of dots) {
    const b = Math.floor(d.v / BIN), key = d.g + b; bins[key] = (bins[key] || 0) + 1;
    const k = bins[key] - 1, col = k % 3, row = Math.floor(k / 3);
    const x = axX(b * BIN + BIN / 2) + (col - 1) * S;
    d.swarm = [x, d.g === 'lo' ? AXY - 16 - row * S : AXY + 16 + row * S];
  }
  return dots;
})();

function sceneParticles(ctx, t) {
  const t0 = bt(9) + 0.05;
  if (t < t0 || t > bt(23) + 1.0) return;
  const pts = titlePoints();
  const conv = ep(t, t0, t0 + 1.1, E.outQuint);
  const hideTitle = 1 - ep(t, bt(9) + 0.9, bt(9) + 1.4);
  const reveal = ep(t, bt(11) - 0.45, bt(11) - 0.1);
  const out = 1 - ep(t, bt(23) - 0.2, bt(23) + 0.8);
  ctx.save();
  for (let i = 0; i < NP; i++) {
    const tp = pts[i];
    let x, y;
    const ang = hash(i, 31) * Math.PI * 2, rad = 650 + hash(i, 32) * 600;
    if (t < bt(9) + 1.2) {
      const k = E.outQuint(clamp(conv * 1.15 - hash(i, 5) * 0.15));
      x = lerp(W / 2 + Math.cos(ang) * rad, tp[0], k); y = lerp(TITLE_Y + Math.sin(ang) * rad * 0.6, tp[1], k);
    } else { x = tp[0]; y = tp[1]; }
    let alpha = t < bt(11) - 0.4 ? hideTitle : reveal;
    let r = 2.1, col = C.goldHi;
    if (i >= 100) {
      // decorative particles drift away and fade after the title
      const p = ep(t, bt(11) - 0.2, bt(11) + 1.6, E.out);
      x += Math.cos(ang) * 300 * p; y += Math.sin(ang) * 200 * p; alpha *= 1 - p;
    } else {
      const d = PART[i];
      const del = d.seed * 0.8;
      const p1 = E.inOut(prog(t, bt(11) - 0.15 + del, bt(11) + 1.3 + del));
      x = lerp(x, d.cluster[0], p1); y = lerp(y, d.cluster[1], p1);
      if (p1 > 0 && p1 < 1) y -= Math.sin(p1 * Math.PI) * 120 * hash(i, 23);
      const ts = d.g === 'lo' ? bt(15) + 0.1 : bt(17) + 0.1;
      const p2 = E.inOut(prog(t, ts + del * 0.9, ts + 1.2 + del * 0.9));
      x = lerp(x, d.swarm[0], p2); y = lerp(y, d.swarm[1], p2);
      if (p2 > 0 && p2 < 1) y -= Math.sin(p2 * Math.PI) * 60;
      r = lerp(2.1, 5.2, ep(t, bt(11) + 0.2, bt(11) + 1.4));
      const ck = ep(t, bt(11) + 0.4, bt(11) + 1.4);
      col = ck > 0.5 ? (d.g === 'lo' ? C.blue : C.gold) : C.goldHi;
      alpha = Math.max(alpha, t > bt(11) ? 1 : 0) * out;
      // waiting group dims until it lands
      if (d.g === 'hi' && t > bt(15) && t < bt(17) + 0.2) alpha *= 0.55;
    }
    if (alpha <= 0.002) continue;
    ctx.globalAlpha = alpha; ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function sceneWheelExperiment(ctx, t) {
  if (t < bt(11) || t > bt(23) + 1.0) return;
  const out = 1 - ep(t, bt(23) - 0.2, bt(23) + 0.8);
  const wa = ep(t, bt(11) + 0.3, bt(11) + 1.3) * out * lerp(1, 0.55, ep(t, bt(15), bt(15) + 1));
  const s0 = bt(11) + 1.0, land = bt(13) + 1.3;
  for (const [g, v] of [['lo', 10], ['hi', 65]]) {
    const rot = wheelRot(t, s0, land - s0 + (g === 'hi' ? 0.25 : 0), v, 4 + (g === 'hi' ? 1 : 0));
    const landed = t > land + (g === 'hi' ? 0.25 : 0) - 0.05;
    const col = g === 'lo' ? C.blueHi : C.goldHi;
    drawWheel(ctx, WX[g], WY, WR, rot, { alpha: wa, hl: v, hlA: landed ? 1 : 0, hlColor: col, landed });
  }
  const ga = ep(t, bt(11) + 1.2, bt(11) + 2.0) * out * (1 - ep(t, bt(15), bt(15) + 0.6));
  text(ctx, '第一组', WX.lo, 600, { size: 24, alpha: 0.6 * ga, ls: 4, color: C.blueHi });
  text(ctx, '第二组', WX.hi, 600, { size: 24, alpha: 0.6 * ga, ls: 4, color: C.goldHi });
  // rigged label
  const rg = env(t, bt(13) + 0.2, bt(15) + 0.4, 0.5, 0.5);
  if (rg > 0) {
    ctx.save(); ctx.globalAlpha = rg; seal(ctx, W / 2, WY, 96, '做局', prog(t, bt(13) + 1.6, bt(13) + 2.0)); ctx.restore();
    text(ctx, '只停 10 或 65', W / 2, WY + 92, { size: 22, color: C.redHi, alpha: rg * ep(t, bt(13) + 1.9, bt(13) + 2.4), ls: 2 });
  }
  // axis + anchors + medians
  const aa = ep(t, bt(15), bt(15) + 1.0) * out;
  if (aa > 0) {
    drawAxis(ctx, AX0, AX1, AXY, ep(t, bt(15), bt(15) + 1.1), aa, { step: 10, labelBelow: 0, noLabels: true });
    for (let v = 0; v <= 100; v += 10) text(ctx, v + '%', axX(v) + 20, AXY + 6, { size: 15, fam: F.didot, color: C.cream, alpha: 0.35 * aa, align: 'left' });
    // anchor pins
    const pl = ep(t, bt(15) + 0.2, bt(15) + 0.9);
    drawAnchor(ctx, axX(10), AXY - 150, 46, C.blueHi, aa * pl);
    drawLine(ctx, axX(10), AXY - 124, axX(10), AXY - 6, 1, C.blueHi, 1.5, 0.6 * aa * pl);
    text(ctx, '转到 10', axX(10), AXY - 186, { size: 22, color: C.blueHi, alpha: aa * pl, ls: 2 });
    const ph = ep(t, bt(17) + 0.2, bt(17) + 0.9) * out;
    drawAnchor(ctx, axX(65), AXY + 150, 46, C.goldHi, ph, Math.PI);
    drawLine(ctx, axX(65), AXY + 124, axX(65), AXY + 6, 1, C.goldHi, 1.5, 0.6 * ph);
    text(ctx, '转到 65', axX(65), AXY + 206, { size: 22, color: C.goldHi, alpha: ph, ls: 2 });
    // medians
    const m1 = ep(t, bt(16) + 0.3, bt(16) + 1.0) * out, m2 = ep(t, bt(18) + 0.3, bt(18) + 1.0) * out;
    ctx.save(); ctx.setLineDash([5, 6]);
    drawLine(ctx, axX(25), AXY - 120, axX(25), AXY + 4, 1, C.blueHi, 1.5, m1 * 0.8);
    drawLine(ctx, axX(45), AXY - 4, axX(45), AXY + 120, 1, C.goldHi, 1.5, m2 * 0.8);
    ctx.restore();
    text(ctx, '25%', axX(25), AXY - 132, { size: 48, fam: F.didot, color: C.blueHi, alpha: m1 });
    text(ctx, '猜测中位数', axX(25) + 70, AXY - 136, { size: 18, color: C.cream, alpha: 0.5 * m1, align: 'left' });
    text(ctx, '45%', axX(45), AXY + 168, { size: 48, fam: F.didot, color: C.goldHi, alpha: m2 });
    text(ctx, '猜测中位数', axX(45) + 70, AXY + 164, { size: 18, color: C.cream, alpha: 0.5 * m2, align: 'left' });
    // gap bracket
    const gb = ep(t, bt(19) + 0.1, bt(19) + 0.9) * out;
    if (gb > 0) {
      const xa = axX(25), xb = lerp(axX(25), axX(45), E.out(gb));
      drawLine(ctx, xa, AXY - 205, xb, AXY - 205, 1, C.redHi, 3, gb);
      drawLine(ctx, xa, AXY - 215, xa, AXY - 195, 1, C.redHi, 3, gb);
      drawLine(ctx, axX(45), AXY - 215, axX(45), AXY - 195, 1, C.redHi, 3, gb * (gb > 0.95 ? 1 : 0));
      text(ctx, '相差 20 个百分点', (axX(25) + axX(45)) / 2, AXY - 224, { size: 26, weight: 700, color: C.redHi, alpha: gb, ls: 2 });
    }
    // true answer
    const ta = ep(t, bt(20), bt(20) + 0.8) * out;
    if (ta > 0) {
      drawLine(ctx, axX(28), AXY + 4, axX(28), AXY + 214, 1, 'rgba(236,227,207,0.5)', 1.2, ta);
      text(ctx, '今天的真实答案：28%', axX(28) - 14, AXY + 190, { size: 20, color: C.cream, alpha: 0.75 * ta, align: 'right', ls: 1 });
      text(ctx, '54 / 193', axX(28) - 14, AXY + 214, { size: 17, fam: F.didot, color: C.cream, alpha: 0.45 * ta, align: 'right' });
    }
  }
  // bonus badge
  const bb = env(t, bt(21) + 0.1, bt(23) + 0.2, 0.5, 0.6);
  if (bb > 0) {
    const cx = W / 2, cy = WY;
    const g = ctx.createRadialGradient(cx - 10, cy - 14, 4, cx, cy, 50);
    g.addColorStop(0, '#fbe7b0'); g.addColorStop(0.7, '#c9973f'); g.addColorStop(1, '#7a5520');
    ctx.save(); ctx.globalAlpha = bb; ctx.fillStyle = g; ctx.shadowColor = 'rgba(240,190,100,0.6)'; ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.arc(cx, cy - 6, 46, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    text(ctx, '奖', cx, cy + 8, { size: 42, weight: 900, color: '#3a2a10', alpha: bb });
    text(ctx, '答对有奖金', cx, cy + 82, { size: 22, color: C.goldHi, alpha: bb, ls: 3 });
    ctx.save(); ctx.globalAlpha = bb; seal(ctx, cx + 64, cy - 52, 50, '无效', prog(t, bt(22), bt(22) + 0.4), 0.15); ctx.restore();
  }
}

// ---------- ④ experts: judges and dice ----------
// Gavel seen from the side, rotating about the end of its handle; ang 0 = head resting on the block, positive = lifted.
function drawGavel(ctx, x, y, s, ang, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= alpha;
  ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  roundRect(ctx, -s * 0.62, s * 0.16, s * 0.64, s * 0.12, 6); ctx.stroke(); // sound block
  const px = s * 0.45, py = -s * 0.05;
  ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s * 0.63, 0); ctx.stroke(); // handle
  ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill;
  roundRect(ctx, -s * 0.87, -s * 0.21, s * 0.24, s * 0.42, 10); ctx.stroke(); // head
  for (const k of [-0.13, 0.13]) { ctx.beginPath(); ctx.moveTo(-s * 0.87, s * k); ctx.lineTo(-s * 0.63, s * k); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
}
function gavelAngle(t, strikes) {
  let ang = 0.55;
  for (const s of strikes) {
    if (t >= s - 0.2 && t < s) ang = lerp(0.55, 0, E.in(prog(t, s - 0.2, s)));
    else if (t >= s && t < s + 0.6) ang = lerp(0, 0.55, E.out(prog(t, s + 0.05, s + 0.6)));
  }
  return ang;
}
// short lines bursting sideways from an impact point
function impact(ctx, x, y, t, t0, alpha) {
  const p = prog(t, t0, t0 + 0.5);
  if (p <= 0 || p >= 1) return;
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) {
    const ang = (-0.5 + k * 0.35) * sx, r0 = 30 + 60 * E.out(p), r1 = r0 + 26 * (1 - p);
    const dx = Math.cos(ang) * sx, dy = Math.sin(ang) * sx * 0 - Math.abs(Math.sin(ang)) * 0.9;
    drawLine(ctx, x + dx * r0, y + dy * r0, x + dx * r1, y + dy * r1, 1, C.goldHi, 3, alpha * (1 - p));
  }
}

function sceneExperts(ctx, t) {
  if (t < bt(23) || t > bt(37) + 0.8) return;
  // gavel strikes on the beat
  const gvA = env(t, bt(23) + 0.4, bt(25) + 0.15, 0.5, 0.45);
  if (gvA > 0) {
    const strikes = [bt(24), bt(24) + BEAT * 2];
    drawGavel(ctx, W / 2 + 60, 470, 300, gavelAngle(t, strikes), gvA);
    for (const s of strikes) impact(ctx, W / 2 + 60 - 300 * 0.3, 470 + 300 * 0.16, t, s, gvA);
  }
  // case file
  const cf = env(t, bt(25) + 0.3, bt(29) + 0.3, 0.6, 0.6);
  if (cf > 0) {
    const mv = ep(t, bt(27), bt(27) + 1.0);
    const cy = lerp(500, 300, mv), sc = lerp(1, 0.62, mv);
    const rise = (1 - E.out(prog(t, bt(25) + 0.3, bt(25) + 1.3))) * 40;
    ctx.save(); ctx.globalAlpha = cf; ctx.translate(W / 2, cy + rise); ctx.scale(sc, sc); ctx.rotate(-0.03);
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
    ctx.fillStyle = C.paper; ctx.fillRect(-250, -170, 500, 340); ctx.shadowColor = 'transparent';
    ctx.fillStyle = C.ink; setFont(ctx, 40, 900, F.song); ctx.textAlign = 'center'; ctx.letterSpacing = '12px';
    ctx.fillText('刑事案卷', 6, -98);
    ctx.fillRect(-200, -76, 400, 2);
    setFont(ctx, 24, 700, F.song); ctx.letterSpacing = '2px'; ctx.textAlign = 'left';
    ctx.fillText('案由：入店行窃', -200, -28);
    ctx.globalAlpha *= 0.3;
    for (let i = 0; i < 5; i++) ctx.fillRect(-200, 4 + i * 28, 400 - (i === 4 ? 160 : hash(i, 3) * 40), 6);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = cf * (1 - mv); seal(ctx, W / 2 + 190, 640, 70, '同案', prog(t, bt(26), bt(26) + 0.4), 0.12); ctx.restore();
  }
  // dice
  const da = env(t, bt(27) + 0.3, bt(37) + 0.2, 0.5, 0.6);
  if (da <= 0) return;
  const L = [560, 470], R = [1360, 470];
  const tl = bt(29) + 1.5;
  dicePair(ctx, L[0], L[1], t, bt(27) + 0.3, tl, [1, 2], C.blue, da);
  dicePair(ctx, R[0], R[1], t, bt(27) + 0.3, tl + 0.2, [4, 5], C.gold, da);
  ripples(ctx, L[0], L[1], 60, 150, t, tl, C.blueHi, 1, da);
  ripples(ctx, R[0], R[1], 60, 150, t, tl + 0.2, C.goldHi, 1, da);
  const na = ep(t, tl + 0.2, tl + 0.8) * da;
  text(ctx, '= 3', L[0] + 160, L[1] + 22, { size: 64, fam: F.didot, color: C.blueHi, alpha: na, align: 'left' });
  text(ctx, '= 9', R[0] + 160, R[1] + 22, { size: 64, fam: F.didot, color: C.goldHi, alpha: na, align: 'left' });
  // sentence months
  const sz = 42, gap = 10, total = 8 * (sz + gap) - gap, y = 640;
  const slotX = (cx, i) => cx - total / 2 + i * (sz + gap);
  const ma = ep(t, bt(30) + 0.3, bt(30) + 1.0) * da;
  const row = (cx, fillN, col, t0, step, label) => {
    for (let i = 0; i < 8; i++) {
      const x = slotX(cx, i);
      ctx.save(); ctx.globalAlpha *= ma * 0.5; roundRect(ctx, x, y, sz, sz, 6); ctx.strokeStyle = C.goldDim; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
      let f = ep(t, t0 + i * step, t0 + i * step + 0.3, E.outBack);
      if (cx === R[0] && i >= 5) f *= 1 + 0.1 * ep(t, bt(35) + 0.4, bt(35) + 0.9) * Math.max(0, Math.sin(t * 7 - i * 0.9));
      if (i < fillN && f > 0) {
        ctx.save(); ctx.globalAlpha *= da; ctx.translate(x + sz / 2, y + sz / 2); ctx.scale(f, f);
        roundRect(ctx, -sz / 2, -sz / 2, sz, sz, 6); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.fill(); ctx.restore();
      }
    }
    // running count while filling, then the label
    const filled = Math.max(0, Math.min(fillN, Math.floor((t - t0) / step) + 1));
    const done = ep(t, t0 + fillN * step, t0 + fillN * step + 0.5);
    if (t < t0) text(ctx, '刑期？', cx, 742, { size: 30, weight: 700, color: C.cream, alpha: ma * (0.45 + 0.25 * Math.sin(t * 5)), ls: 4 });
    else {
      text(ctx, (done > 0 ? label : filled + ' 个月'), cx, 742, { size: 40, weight: 900, color: col, alpha: da, ls: 4 });
      text(ctx, '平均刑期', cx, 782, { size: 20, color: C.cream, alpha: 0.5 * da * done, ls: 4 });
    }
  };
  row(L[0], 5, C.blueHi, bt(31) + 0.2, 0.5, '5 个月');
  row(R[0], 8, C.goldHi, bt(33) + 0.1, 0.42, '8 个月');
  // the three extra months
  const ex = ep(t, bt(35) + 0.1, bt(35) + 0.8) * da;
  if (ex > 0) {
    const x0 = slotX(R[0], 5) - 8, x1 = slotX(R[0], 7) + sz + 8;
    ctx.save(); ctx.globalAlpha *= ex; ctx.strokeStyle = C.redHi; ctx.lineWidth = 3; ctx.shadowColor = C.redHi; ctx.shadowBlur = 14 * (0.6 + 0.4 * Math.sin(t * 4));
    roundRect(ctx, x0, y - 8, (x1 - x0) * E.out(ex), sz + 16, 10); ctx.stroke(); ctx.restore();
    text(ctx, '+3 个月', (x0 + x1) / 2, y - 26, { size: 32, weight: 900, color: C.redHi, alpha: ex, ls: 2 });
    // the same slots on the left stay empty
    const x2 = slotX(L[0], 5) - 8, x3 = slotX(L[0], 7) + sz + 8;
    ctx.save(); ctx.globalAlpha *= ex * 0.6; ctx.strokeStyle = C.redHi; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
    roundRect(ctx, x2, y - 8, x3 - x2, sz + 16, 10); ctx.stroke(); ctx.restore();
  }
}

// ---------- ⑤ mechanism: anchoring and insufficient adjustment ----------
const MX0 = 260, MX1 = 1660, MY = 560;
const mX = (v) => lerp(MX0, MX1, v / 100);
const HOPS = [65, 60, 56, 52.5, 50, 48.2, 46.8, 45.8, 45.2, 45];
const HOP_T = [bt(41) - 0.1, bt(43) - 0.2];
function hopPos(t, t0, t1, hops) {
  const n = hops.length - 1, u = prog(t, t0, t1) * n;
  if (u >= n) return [hops[n], 0];
  const i = Math.floor(u), f = E.inOut(clamp(u - i));
  return [lerp(hops[i], hops[i + 1], f), Math.sin(f * Math.PI) * (26 - i * 2.2)];
}
function sceneMechanism(ctx, t) {
  if (t < bt(37) - 0.2 || t > bt(45) + 0.8) return;
  const a = ep(t, bt(37), bt(37) + 0.8) * (1 - ep(t, bt(45), bt(45) + 0.7));
  drawAxis(ctx, MX0, MX1, MY, ep(t, bt(37) + 0.1, bt(37) + 1.3), a, { step: 10, pct: true });
  // truth
  const tr = ep(t, bt(37) + 1.0, bt(37) + 1.8) * a;
  ctx.save(); ctx.setLineDash([6, 8]); drawLine(ctx, mX(28), MY - 170, mX(28), MY + 120, 1, C.cream, 1.5, 0.55 * tr); ctx.restore();
  text(ctx, '真实答案 28%', mX(28), MY - 186, { size: 24, color: C.cream, alpha: 0.8 * tr, ls: 2 });
  // anchor drop
  const dp = prog(t, bt(38), bt(38) + 0.5);
  const ay = lerp(220, MY - 130, E.outBack(dp));
  if (dp > 0) {
    drawLine(ctx, mX(65), 150, mX(65), ay - 30, 1, 'rgba(217,180,108,0.5)', 1.5, a);
    drawAnchor(ctx, mX(65), ay, 74, C.goldHi, a, 0, 14);
    text(ctx, '锚：65', mX(65) + 60, ay + 10, { size: 26, weight: 700, color: C.goldHi, alpha: a * clamp(dp * 2), align: 'left', ls: 2 });
  }
  // the estimate starts at the anchor, tied to it by a rope
  const st = bt(39) + 0.3;
  const sa = ep(t, st, st + 0.6) * a;
  if (sa <= 0) return;
  let [v, hop] = hopPos(t, HOP_T[0], HOP_T[1], HOPS);
  // after stopping, it keeps tugging toward the truth and gets pulled back
  const tugT = bt(43) + 1.1;
  let tug = 0;
  if (t > tugT) { tug = Math.pow(Math.max(0, Math.sin(((t - tugT) / (BEAT * 2)) * Math.PI)), 3); v -= 1.8 * tug; }
  const x = mX(v), y = MY - 14 - hop * 2;
  const sag = 26 * (1 - tug) + (hop > 0 ? 8 : 0);
  drawRope(ctx, mX(65), ay + 32, x, y - 10, sag, sa * 0.8, C.gold, 2, ep(t, bt(40) + 0.1, bt(40) + 1.4));
  // trail, hop arcs
  drawLine(ctx, mX(65), MY, mX(Math.min(65, v + 1.8 * tug)), MY, 1, C.redHi, 4, 0.7 * sa);
  for (let k = 0; k < HOPS.length - 1; k++) {
    const tk = HOP_T[0] + (k + 1) * ((HOP_T[1] - HOP_T[0]) / (HOPS.length - 1));
    if (t < tk) break;
    const x1 = mX(HOPS[k]), x2 = mX(HOPS[k + 1]);
    ctx.save(); ctx.globalAlpha *= sa * 0.35; ctx.strokeStyle = C.goldHi; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x1, MY - 14); ctx.quadraticCurveTo((x1 + x2) / 2, MY - 14 - 2 * (26 - k * 2.2), x2, MY - 14); ctx.stroke(); ctx.restore();
  }
  ripples(ctx, mX(65), MY - 14, 16, 70, t, st, C.goldHi, 2, a);
  const march = env(t, st + 0.5, HOP_T[0] + 0.2, 0.4, 0.3) * a;
  if (march > 0) {
    ctx.save(); ctx.globalAlpha *= march; ctx.strokeStyle = C.goldHi; ctx.lineWidth = 2.5; ctx.setLineDash([8, 10]); ctx.lineDashOffset = -t * 40;
    ctx.beginPath(); ctx.moveTo(mX(65) - 36, ay - 10); ctx.quadraticCurveTo(mX(65) - 90, MY - 70, mX(65) - 22, MY - 22); ctx.stroke(); ctx.restore();
  }
  const breathe = 1 + 0.18 * march * Math.sin(t * 5);
  ctx.save(); ctx.globalAlpha *= sa; ctx.fillStyle = C.goldHi; ctx.shadowColor = C.gold; ctx.shadowBlur = 20 * breathe;
  ctx.beginPath(); ctx.arc(x, y, 14 * breathe, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  text(ctx, Math.round(v + 1.8 * tug) + '%', x, y - 30, { size: 30, fam: F.didot, color: C.goldHi, alpha: sa });
  const startLab = env(t, st + 0.3, HOP_T[0] + 0.3, 0.4, 0.4);
  text(ctx, '起点 = 锚', mX(65), MY + 70, { size: 24, color: C.goldHi, alpha: sa * startLab, ls: 2 });
  text(ctx, '你的估计', x, MY + 70, { size: 24, color: C.goldHi, alpha: sa * ep(t, HOP_T[0] + 0.3, HOP_T[0] + 0.8) * (1 - ep(t, bt(43), bt(43) + 0.5)), ls: 2 });
  // the gap
  const gp = ep(t, bt(43) + 0.2, bt(43) + 1.0) * a;
  if (gp > 0) {
    const gy = MY + 70;
    drawLine(ctx, mX(45), gy, lerp(mX(45), mX(28), E.out(gp)), gy, 1, C.redHi, 3, gp);
    drawLine(ctx, mX(45), gy - 10, mX(45), gy + 10, 1, C.redHi, 3, gp);
    drawLine(ctx, mX(28), gy - 10, mX(28), gy + 10, 1, C.redHi, 3, gp > 0.95 ? gp : 0);
    text(ctx, '调整不足', (mX(45) + mX(28)) / 2, gy + 52, { size: 34, weight: 900, color: C.redHi, alpha: gp, ls: 6 });
  }
}

// ---------- ⑥ everyday life ----------
function sceneEveryday(ctx, t) {
  if (t < bt(45) - 0.2 || t > bt(53) + 0.8) return;
  // price tag
  const pa = env(t, bt(45) + 0.1, bt(47) + 0.2, 0.6, 0.5);
  if (pa > 0) {
    const rise = (1 - E.out(prog(t, bt(45) + 0.1, bt(45) + 1.0))) * 50;
    const sway = Math.sin((t - bt(45)) * 1.6) * 0.015;
    drawPriceTag(ctx, W / 2, 500 + rise, 1, -0.04 + sway, pa);
    ctx.save(); ctx.translate(W / 2, 500 + rise); ctx.rotate(-0.04 + sway);
    text(ctx, '原价', -110, -56, { size: 26, color: C.cream, alpha: 0.55 * pa, align: 'right', ls: 2 });
    text(ctx, '¥1999', -90, -46, { size: 54, fam: F.didot, color: C.cream, alpha: 0.6 * pa, align: 'left' });
    const sk = ep(t, bt(45) + 0.8, bt(45) + 1.2, E.out);
    drawLine(ctx, -100, -62, -100 + 200 * sk, -62, 1, C.redHi, 4, pa);
    const nv = ep(t, bt(45) + 1.3, bt(45) + 2.0);
    text(ctx, '到手价', -110, 64, { size: 26, color: C.goldHi, alpha: nv * pa, align: 'right', ls: 2 });
    text(ctx, '¥999', -90, 82, { size: 104, fam: F.didot, color: C.goldHi, alpha: nv * pa, align: 'left', glow: 22 });
    // an anchor hangs from the struck price
    const ha = ep(t, bt(46) + 0.3, bt(46) + 1.0, E.outBack);
    if (ha > 0) {
      ctx.save(); ctx.globalAlpha *= pa; ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(120, -66); ctx.lineTo(120 + 180 * ha, -66 - 120 * ha); ctx.stroke(); ctx.restore();
      drawAnchor(ctx, 120 + 180 * ha, -66 - 120 * ha - 30, 56, C.goldHi, pa * ha, 0.2 + Math.sin(t * 2) * 0.08, 12);
    }
    ctx.restore();
  }
  // negotiation
  const na = env(t, bt(47) + 0.1, bt(53) + 0.4, 0.6, 0.6);
  if (na <= 0) return;
  const x0 = 420, x1 = 1500, y = 640, X = (v) => lerp(x0, x1, v);
  person(ctx, 240, 520, C.blue, na); person(ctx, 1680, 520, C.gold, na);
  text(ctx, '买方', 240, 600, { size: 24, color: C.blueHi, alpha: na, ls: 4 });
  text(ctx, '卖方', 1680, 600, { size: 24, color: C.goldHi, alpha: na, ls: 4 });
  drawLine(ctx, x0, y, X(ep(t, bt(47) + 0.2, bt(47) + 1.0)), y, 1, C.goldDim, 2, na);
  text(ctx, '低', x0 - 30, y + 8, { size: 22, alpha: 0.5 * na });
  text(ctx, '高', x1 + 30, y + 8, { size: 22, alpha: 0.5 * na });
  text(ctx, '成交价', x0, y + 40, { size: 22, alpha: 0.5 * na, ls: 6, align: 'left' });
  const fix = ep(t, bt(51) + 0.2, bt(51) + 1.0); // the remedy kicks in
  // first offer (seller) drops an anchor
  const fo = ep(t, bt(47) + 0.8, bt(47) + 1.3, E.outBack);
  if (fo > 0) {
    bubble(ctx, 1560, 360, 220, 60, -1, na * clamp(fo) * (1 - fix * 0.6), { color: C.gold });
    text(ctx, '我先开个价', 1560, 371, { size: 26, weight: 700, color: C.goldHi, alpha: na * clamp(fo) * (1 - fix * 0.6), ls: 2 });
    drawAnchor(ctx, X(0.82), lerp(380, y - 46, clamp(fo)), 54, C.goldHi, na * lerp(1, 0.35, fix), 0, 12 * (1 - fix));
    text(ctx, '第一口价', X(0.82), y + 34, { size: 20, color: C.goldHi, alpha: na * clamp(fo) * lerp(1, 0.5, fix), ls: 2 });
  }
  // counter offer, then the deal settles near the anchor
  const co = ep(t, bt(48), bt(48) + 0.6);
  if (co > 0) {
    ctx.save(); ctx.globalAlpha *= na * co * (1 - fix); ctx.fillStyle = C.blueHi;
    ctx.beginPath(); ctx.arc(X(0.45), y, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    text(ctx, '还价', X(0.45), y + 34, { size: 20, color: C.blueHi, alpha: na * co * (1 - fix), ls: 2 });
  }
  const dl = ep(t, bt(48) + 0.8, bt(49) + 0.6);
  if (dl > 0) {
    let v = lerp(0.45, 0.7, E.outQuint(dl));
    v = lerp(v, 0.56, ep(t, bt(51) + 0.9, bt(51) + 2.4));
    ctx.save(); ctx.globalAlpha *= na; ctx.fillStyle = C.cream; ctx.shadowColor = C.cream; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(X(v), y, 11, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    text(ctx, '成交', X(v), y - 26, { size: 24, weight: 700, color: C.cream, alpha: na * ep(t, bt(49) + 0.2, bt(49) + 0.7), ls: 2 });
  }
  // the anchored range
  const rg = ep(t, bt(49) + 0.3, bt(49) + 1.3) * (1 - fix);
  if (rg > 0) {
    const xa = X(0.82), xb = lerp(xa, X(0.45), E.out(ep(t, bt(49) + 0.3, bt(49) + 1.3)));
    ctx.save(); ctx.globalAlpha *= na * 0.16 * rg; ctx.fillStyle = C.gold; ctx.fillRect(xb, y - 70, xa - xb, 140); ctx.restore();
    drawLine(ctx, xb, y + 92, xa, y + 92, 1, C.gold, 2, na * rg);
    text(ctx, '讨价还价，都围着第一口价', (X(0.45) + X(0.82)) / 2, y + 132, { size: 26, weight: 700, color: C.goldHi, alpha: na * rg * ep(t, bt(50), bt(50) + 0.6), ls: 2 });
  }
  // remedy: the buyer focuses on their own target price
  if (fix > 0) {
    const fx = X(0.5);
    const fy = lerp(y, y - 120, E.outBack(fix));
    drawLine(ctx, fx, y, fx, fy, 1, C.blueHi, 3, na);
    ctx.save(); ctx.globalAlpha *= na * fix; ctx.fillStyle = C.blueHi;
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 70, fy + 18 + Math.sin(t * 5) * 4); ctx.lineTo(fx, fy + 38); ctx.closePath(); ctx.fill(); ctx.restore();
    text(ctx, '我的目标价', fx - 14, fy + 26, { size: 24, weight: 700, color: C.blueHi, alpha: na * fix, align: 'right', ls: 2 });
    const msg = ep(t, bt(51) + 1.8, bt(51) + 2.5);
    text(ctx, '先开价的优势，消失了', W / 2, y + 132, { size: 28, weight: 700, color: C.blueHi, alpha: na * msg, ls: 4 });
  }
}

// ---------- ⑦ AI ----------
function sceneAI(ctx, t) {
  if (t < bt(53) - 0.2 || t > bt(61) + 0.8) return;
  const a = ep(t, bt(53) + 0.1, bt(53) + 1.0) * (1 - ep(t, bt(61) - 0.2, bt(61) + 0.6));
  const px = W / 2, py = 470, pw = 1180, ph = 470;
  ctx.save(); ctx.globalAlpha = a;
  roundRect(ctx, px - pw / 2, py - ph / 2, pw, ph, 22); ctx.fillStyle = 'rgba(22,18,13,0.85)'; ctx.fill();
  ctx.strokeStyle = 'rgba(217,180,108,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#c4513f', '#d9b46c', '#86a4bc'][i]; ctx.globalAlpha = a * 0.7; ctx.beginPath(); ctx.arc(px - pw / 2 + 32 + i * 22, py - ph / 2 + 28, 6, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  text(ctx, 'AI', px, py - ph / 2 + 36, { size: 22, fam: F.serif, ls: 6, color: C.cream, alpha: 0.5 * a });
  // a question being typed, then "thinking"
  const tq = a * env(t, bt(53) + 0.5, bt(55) + 0.3, 0.3, 0.4);
  if (tq > 0) {
    const q = 'AI 也会被锚住吗？';
    const n = Math.floor(prog(t, bt(53) + 0.8, bt(53) + 2.4) * q.length);
    ctx.save(); ctx.globalAlpha = tq; roundRect(ctx, px - 420, py - 40, 840, 72, 36); ctx.strokeStyle = C.goldDim; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    const w = richText(ctx, q.slice(0, n), px - 380, py + 8, { size: 30, weight: 700, align: 'left', alpha: tq, ls: 2 });
    if (Math.sin(t * 9) > 0 || n < q.length) drawLine(ctx, px - 376 + w, py - 16, px - 376 + w, py + 16, 1, C.goldHi, 2, tq);
    const think = ep(t, bt(53) + 2.6, bt(53) + 3.0);
    for (let k = 0; k < 3; k++) {
      ctx.save(); ctx.globalAlpha = tq * think * (0.4 + 0.6 * Math.max(0, Math.sin(t * 7 - k * 0.8)));
      ctx.fillStyle = C.goldHi; ctx.beginPath(); ctx.arc(px - 30 + k * 30, py + 110 - 8 * Math.max(0, Math.sin(t * 7 - k * 0.8)), 7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  // two prompts, two answers
  const attempts = [0, 1, 2].map((i) => bt(59) + 0.6 + i * 1.1); // each mitigation fails at this moment
  const row = (y, prompt, anchored, d) => {
    const ra = ep(t, bt(55) + 0.2 + d, bt(55) + 0.9 + d) * a;
    if (ra <= 0) return;
    bubble(ctx, px - 250, y, 560, 70, 0, ra, { color: anchored ? C.gold : C.goldDim });
    richText(ctx, prompt, px - 250, y + 11, { size: 26, weight: 700, alpha: ra, ls: 1 });
    const x0 = px + 110, x1 = px + 520, X = (v) => lerp(x0, x1, v / 100);
    drawLine(ctx, x0, y, x1, y, 1, C.goldDim, 2, ra);
    for (const v of [0, 50, 100]) text(ctx, v + '%', X(v), y + 34, { size: 16, fam: F.didot, alpha: 0.4 * ra });
    const ansT = anchored ? bt(56) + 0.3 : bt(55) + 0.9;
    const show = ep(t, ansT, ansT + 0.3);
    if (show <= 0) return;
    let v = lerp(0, 30, ep(t, ansT, ansT + 1.1, E.outQuint));
    if (anchored) {
      drawAnchor(ctx, X(65), y - 40, 34, C.goldHi, ra);
      v = lerp(v, 52, ep(t, bt(57) + 0.2, bt(57) + 1.6, E.outQuint));
      // each mitigation tries to pull it back toward 30, then it snaps back
      for (const tc of attempts) v -= 9 * Math.sin(Math.PI * prog(t, tc - 0.55, tc + 0.25));
      const rp = ep(t, bt(57) + 1.2, bt(58) + 0.4);
      if (rp > 0) drawRope(ctx, X(65), y - 24, X(v), y - 10, lerp(30, 6, ep(t, bt(57) + 1.2, bt(58) + 0.8)) * rp, ra * rp, C.gold, 2);
      text(ctx, '被拽向 65', X(v), y + 62, { size: 18, color: C.goldHi, alpha: ra * ep(t, bt(58), bt(58) + 0.6), ls: 2 });
    }
    ctx.save(); ctx.globalAlpha = ra * show; ctx.fillStyle = anchored ? C.goldHi : C.cream; ctx.shadowColor = C.gold; ctx.shadowBlur = anchored ? 16 : 0;
    ctx.beginPath(); ctx.arc(X(v), y, 11, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    text(ctx, '回答', X(v), y - 22, { size: 18, color: C.cream, alpha: 0.6 * ra * show });
  };
  row(py - 70, '估计一下：X 是多少？', false, 0);
  row(py + 90, '有人说是【65】。估计一下：X 是多少？', true, 0.4);
  // failed mitigations
  ['一步步思考', '忽略这个数', '自我反思'].forEach((s, i) => {
    const tc = attempts[i];
    const ca = ep(t, tc - 0.7, tc - 0.3) * a;
    if (ca <= 0) return;
    const cx = W / 2 + (i - 1) * 300, cy = 800;
    const active = env(t, tc - 0.55, tc + 0.1, 0.15, 0.15);
    ctx.save(); ctx.globalAlpha = ca; roundRect(ctx, cx - 120, cy - 30, 240, 60, 30);
    ctx.strokeStyle = active > 0 ? C.goldHi : C.goldDim; ctx.lineWidth = 1.5 + active; ctx.stroke(); ctx.restore();
    text(ctx, s, cx, cy + 9, { size: 26, weight: 700, alpha: ca * 0.85, ls: 2 });
    const x = prog(t, tc, tc + 0.3);
    if (x > 0) drawLine(ctx, cx - 100, cy - 16, lerp(cx - 100, cx + 100, E.out(x)), lerp(cy - 16, cy + 16, E.out(x)), 1, C.redHi, 4, ca);
  });
}

// ---------- ⑧ ending ----------
function sceneEnding(ctx, t) {
  if (t < bt(61) - 0.4) return;
  // particle sea with tiny anchors
  const sea = ep(t, bt(61) - 0.3, bt(61) + 1.2) * (1 - ep(t, bt(63) - 0.3, bt(63) + 0.6));
  if (sea > 0) {
    const tt = t - bt(61);
    ctx.save();
    for (let i = 0; i < 1300; i++) {
      let z = (hash(i, 61) - tt * 0.18) % 1; if (z < 0) z += 1; z = 0.05 + z * 0.95;
      const ang = hash(i, 62) * Math.PI * 2, rr = 0.15 + hash(i, 63) * 1.4;
      const x = W / 2 + Math.cos(ang) * rr * 520 / z, y = H / 2 - 30 + Math.sin(ang) * rr * 330 / z;
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      const fade = clamp((1 - z) * 2.2) * clamp(z * 8);
      if (i % 47 === 0) { drawAnchor(ctx, x, y, clamp(14 / z, 8, 60), C.goldHi, sea * fade * 0.8); continue; }
      ctx.globalAlpha = sea * fade * (0.35 + 0.65 * hash(i, 64));
      ctx.fillStyle = hash(i, 65) < 0.62 ? C.gold : C.blue;
      ctx.beginPath(); ctx.arc(x, y, clamp(1.6 / z, 0.6, 7), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    const cg = ctx.createRadialGradient(W / 2, H / 2 - 30, 0, W / 2, H / 2 - 30, 360);
    cg.addColorStop(0, `rgba(250,220,160,${0.16 * sea})`); cg.addColorStop(1, 'rgba(250,220,160,0)');
    ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
  }
  // how to ask an AI: don't hand it your number first
  const tip = env(t, bt(63), bt(65) + 0.2, 0.5, 0.5);
  if (tip > 0) {
    const b1 = ep(t, bt(63) + 0.2, bt(63) + 0.8) * tip, b2 = ep(t, bt(63) + 1.9, bt(63) + 2.5) * tip;
    const r1 = (1 - E.out(b1)) * 30, r2 = (1 - E.out(b2)) * 30;
    bubble(ctx, W / 2, 400 + r1, 640, 84, 0, b1, { color: C.goldDim });
    richText(ctx, '我猜是【65】，你觉得呢？', W / 2, 414 + r1, { size: 34, weight: 700, alpha: b1 * lerp(1, 0.45, ep(t, bt(63) + 1.2, bt(63) + 1.6)), ls: 2 });
    drawAnchor(ctx, W / 2 + 360, 400 + r1, 44, C.goldHi, b1 * (1 - ep(t, bt(63) + 1.2, bt(63) + 1.6)));
    const sk = ep(t, bt(63) + 1.1, bt(63) + 1.5, E.out);
    drawLine(ctx, W / 2 - 290, 400, lerp(W / 2 - 290, W / 2 + 290, sk), 400, 1, C.redHi, 4, tip);
    bubble(ctx, W / 2, 580 + r2, 480, 84, 0, b2, { color: C.gold });
    text(ctx, '你觉得是多少？', W / 2, 594 + r2, { size: 34, weight: 700, color: C.cream, alpha: b2, ls: 2 });
    checkMark(ctx, W / 2 + 300, 580, 46, ep(t, bt(64) + 0.5, bt(64) + 1.0, E.out), C.goldHi, 6);
    text(ctx, '不给锚，答案才是它自己的', W / 2, 720, { size: 26, color: C.goldHi, alpha: tip * ep(t, bt(64) + 1.0, bt(64) + 1.6), ls: 3 });
  }
  // callback wheel + anchor
  const cb = env(t, bt(65) + 0.1, bt(67) + 0.3, 0.6, 0.5);
  if (cb > 0) {
    const tl = bt(65) + 2.0;
    let rot = wheelRot(t, bt(65) + 0.1, 1.9, 65, 3);
    if (t > tl) rot += 0.02 * Math.exp(-5 * (t - tl)) * Math.sin(22 * (t - tl));
    const landed = t > tl - 0.05;
    ripples(ctx, W / 2, 520, 220, 320, t, tl, C.redHi, 2, cb);
    drawWheel(ctx, W / 2, 520, 220, rot, { alpha: cb, hl: 65, hlA: landed ? 1 : 0, landed });
    const dp = prog(t, bt(66), bt(66) + 0.6);
    if (dp > 0) {
      const ay = lerp(80, 520 - 220 - 96, E.outBack(dp));
      drawLine(ctx, W / 2, 0, W / 2, ay - 40, 1, 'rgba(217,180,108,0.6)', 2, cb);
      drawAnchor(ctx, W / 2, ay, 90, C.goldHi, cb, Math.sin((t - bt(66)) * 3) * 0.05 * (1 - dp * 0.5), 18);
    }
  }
  // end card
  const t0 = bt(67);
  if (t >= t0 - 0.2) {
    const a = ep(t, t0, t0 + 1.0);
    text(ctx, 'ANCHORING EFFECT', W / 2, 236, { size: 22, fam: F.serif, ls: 12, color: C.gold, alpha: a });
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, -160);
    ctx.translate(W / 2, TITLE_Y); ctx.scale(0.75, 0.75); ctx.translate(-W / 2, -TITLE_Y);
    drawTitleText(ctx, 1); ctx.restore();
    const lp = ep(t, t0 + 0.3, t0 + 1.2, E.outQuint);
    drawLine(ctx, W / 2, 432, W / 2 - 220 * lp, 432, 1, C.goldDim, 1.2, a);
    drawLine(ctx, W / 2, 432, W / 2 + 220 * lp, 432, 1, C.goldDim, 1.2, a);
    const qa = ep(t, t0 + 0.6, t0 + 1.6);
    text(ctx, '你以为自己在判断，', W / 2, 510, { size: 40, weight: 700, alpha: qa, ls: 4 });
    richText(ctx, '其实只是从第一个数字出发，【挪了几步】。', W / 2, 566, { size: 40, weight: 700, alpha: qa, ls: 4 });
    const ra = ep(t, t0 + 1.2, t0 + 2.2) * 0.45;
    const refs = [
      '参考资料',
      'Tversky A. & Kahneman D. (1974) Science 185: 1124–1131    ·    Kahneman D. (2011) Thinking, Fast and Slow',
      'Englich B., Mussweiler T. & Strack F. (2006) PSPB 32: 188–200    ·    Galinsky A.D. & Mussweiler T. (2001) JPSP 81: 657–669',
      'Lou J. & Sun Y. (2024) Anchoring Bias in Large Language Models: An Experimental Study. arXiv:2412.06593',
    ];
    refs.forEach((s, i) => text(ctx, s, W / 2, 690 + i * 30, { size: i === 0 ? 18 : 17, fam: i === 0 ? F.song : F.serif, color: C.cream, alpha: ra * (i === 0 ? 1.3 : 1), ls: i === 0 ? 6 : 0.5 }));
    const la = ep(t, t0 + 1.6, t0 + 2.6);
    text(ctx, 'LIGHT聊AI', W / 2, 920, { size: 34, weight: 900, color: C.goldHi, alpha: la, ls: 4 });
    text(ctx, '出品', W / 2, 958, { size: 18, color: C.cream, alpha: 0.5 * la, ls: 8 });
  }
}
