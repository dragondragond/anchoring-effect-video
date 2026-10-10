// Scenes ⑤ the turn, ⑥ blood pressure, ⑦ causality + Pearl, ⑧ AI + ending.

const NUMS = [[93, 87], [73, 69], [78, 83]];
const LAB_K = { group: '结石大小', a: '手术 A', b: '手术 B', r1: '小结石', r2: '大结石', tot: '合计', metric: '成功率' };
const LAB_B = { group: '服药后血压', a: '不吃药', b: '吃药', r1: '血压低', r2: '血压高', tot: '合计', metric: '康复率' };

// Text that flips like a split-flap from s0 to s1 with progress p.
function flipText(ctx, s0, s1, p, x, y, o) {
  if (p <= 0) return text(ctx, s0, x, y, o);
  if (p >= 1) return text(ctx, s1, x, y, o);
  const k = p < 0.5 ? 1 - p * 2 : p * 2 - 1;
  ctx.save();
  ctx.translate(x, y - (o.size || 32) * 0.35);
  ctx.scale(1, Math.max(0.02, k));
  text(ctx, p < 0.5 ? s0 : s1, 0, (o.size || 32) * 0.35, { ...o, alpha: (o.alpha == null ? 1 : o.alpha) * (0.4 + 0.6 * k) });
  ctx.restore();
}

// The 2×2 table (+ total row). flips: per-label flip progress. hl: highlight options.
function drawTable(ctx, cx, cy, sc, alpha, o = {}) {
  if (alpha <= 0) return;
  const fl = o.flips || {}, A = o.labA || LAB_K, B = o.labB || LAB_B;
  const f = (k) => fl[k] || 0;
  const L = -440, R = 440, xA = 70, xB = 320, xLab = -200;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.globalAlpha *= alpha;
  // grid lines
  ctx.strokeStyle = 'rgba(217,180,108,0.35)'; ctx.lineWidth = 1.2;
  for (const y of [-112, 0, 92]) { ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(217,180,108,0.7)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(L, 102); ctx.lineTo(R, 102); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(L, -205); ctx.lineTo(R, -205); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(L, 205); ctx.lineTo(R, 205); ctx.stroke();
  // highlights
  if (o.hlRows) {
    ctx.save(); ctx.globalAlpha *= o.hlRows; ctx.strokeStyle = o.hlRowsColor || C.redHi; ctx.lineWidth = 3;
    roundRect(ctx, L - 14, -104, R - L + 28, 190, 10); ctx.stroke(); ctx.restore();
  }
  if (o.hlTot) {
    ctx.save(); ctx.globalAlpha *= o.hlTot; ctx.strokeStyle = C.goldHi; ctx.lineWidth = 3;
    ctx.shadowColor = C.gold; ctx.shadowBlur = 16;
    roundRect(ctx, L - 14, 108, R - L + 28, 90, 10); ctx.stroke(); ctx.restore();
  }
  const lab = { size: 30, weight: 700, ls: 3 };
  flipText(ctx, A.group, B.group, f('group'), xLab, -142, { ...lab, size: 26, weight: 400, color: C.cream, alpha: 0.6 });
  flipText(ctx, A.a, B.a, f('a'), xA, -142, { ...lab, color: C.gold });
  flipText(ctx, A.b, B.b, f('b'), xB, -142, { ...lab, color: C.blue });
  flipText(ctx, A.r1, B.r1, f('r1'), xLab, -40, { ...lab });
  flipText(ctx, A.r2, B.r2, f('r2'), xLab, 60, { ...lab });
  text(ctx, A.tot, xLab, 166, { ...lab, color: C.cream, alpha: 0.85 });
  flipText(ctx, A.metric, B.metric, f('metric'), xLab, -178, { size: 18, weight: 400, ls: 6, color: C.cream, alpha: 0.4 });
  // numbers
  const pulse = o.pulse || 0;
  NUMS.forEach(([a, b], i) => {
    const y = [-30, 70, 178][i];
    const big = i === 2 ? 60 : 56;
    const aWin = a > b;
    text(ctx, a + '%', xA, y, { size: big, fam: F.didot, color: aWin && !o.plain ? C.goldHi : C.cream, alpha: aWin || o.plain ? 1 : 0.6, glow: pulse * 20 });
    text(ctx, b + '%', xB, y, { size: big, fam: F.didot, color: !aWin && !o.plain ? C.blueHi : C.cream, alpha: !aWin || o.plain ? 1 : 0.6, glow: pulse * 20 });
  });
  if (o.pill) {
    ctx.save(); ctx.globalAlpha *= o.pill;
    roundRect(ctx, xB - 62, -258, 124, 38, 19); ctx.fillStyle = 'rgba(134,164,188,0.18)'; ctx.fill();
    ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    text(ctx, '降压药', xB, -231, { size: 22, weight: 700, color: C.blueHi, alpha: o.pill, ls: 3 });
  }
  if (o.sealB) seal(ctx, xB + 178, 150, 52, '胜', o.sealB);
  ctx.restore();
}

// ⑤ the turn
function sceneTurn(ctx, t) {
  const t0 = bt(37), t1 = bt(45);
  if (t < t0 - 0.2 || t > bt(53) + 0.6) return;
  // table position/scale across ⑤ and ⑥
  const up = ep(t, bt(45), bt(45) + 1.3);
  const side = ep(t, bt(51), bt(51) + 1.2);
  const cx = lerp(lerp(W / 2, W / 2, up), 1400, side);
  const cy = lerp(lerp(520, 330, up), 520, side);
  const sc = lerp(lerp(1, 0.62, up), 0.56, side);
  let alpha = ep(t, t0 + 0.1, t0 + 1.3) * (1 - ep(t, bt(53), bt(53) + 0.8));
  const dim = 1 - 0.55 * env(t, bt(39), bt(40) + 0.2, 0.3, 0.6);
  const zoom = 1 + 0.04 * ep(t, bt(39), bt(40));
  const ft = (k, d) => ep(t, bt(40) + 0.35 + d, bt(40) + 0.95 + d);
  const flips = { a: ft('a', 0), b: ft('b', 0.4), group: ft('group', 1.0), r1: ft('r1', 1.6), r2: ft('r2', 2.0), metric: ft('m', 2.5) };
  const pulse = env(t, bt(42), bt(43) + 0.3, 0.4, 0.6);
  const cut = env(t, bt(47) + 0.2, bt(49) + 0.1, 0.3, 0.4);
  const tot = env(t, bt(49) + 0.2, bt(53), 0.4, 0.6);
  drawTable(ctx, cx, cy, sc * zoom, alpha * dim, {
    flips, pulse, pill: ep(t, bt(43) + 0.3, bt(43) + 1.0), hlRows: cut, hlTot: tot,
    sealB: prog(t, bt(49) + 0.8, bt(49) + 1.2),
  });
  // "numbers unchanged" note
  const nn = env(t, bt(42), bt(45), 0.5, 0.5);
  if (nn > 0) text(ctx, '—  数字一个没动  —', W / 2, 800, { size: 24, color: C.goldHi, alpha: 0.8 * nn * (1 - up), ls: 6 });
  // ⑥ side-by-side: the kidney twin on the left
  const tw = side * (1 - ep(t, bt(53), bt(53) + 0.8));
  if (tw > 0) {
    drawTable(ctx, lerp(W / 2, 520, side), 520, 0.56, tw, { flips: {}, hlRows: ep(t, bt(51) + 1.0, bt(51) + 1.6) * 0.9, hlRowsColor: C.goldHi });
    const capA = ep(t, bt(51) + 1.0, bt(51) + 1.8) * (1 - ep(t, bt(53), bt(53) + 0.8));
    text(ctx, '肾结石', 520, 340, { size: 30, weight: 900, color: C.cream, alpha: capA, ls: 6 });
    text(ctx, '降压药', 1400, 340, { size: 30, weight: 900, color: C.cream, alpha: capA, ls: 6 });
    text(ctx, '✓ 该拆开看', 520, 700, { size: 32, weight: 700, color: C.goldHi, alpha: capA, ls: 3 });
    text(ctx, '✓ 该合起来看', 1400, 700, { size: 32, weight: 700, color: C.goldHi, alpha: capA, ls: 3 });
    text(ctx, '=', W / 2, 545, { size: 80, fam: F.didot, color: C.cream, alpha: 0.5 * capA });
  }
}

// node box for causal diagrams
function node(ctx, x, y, label, a, o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  setFont(ctx, o.size || 30, 700, F.song); ctx.letterSpacing = '3px';
  const w = Math.max(150, ctx.measureText(label).width + 56), h = 66;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 33);
  ctx.fillStyle = o.fill || 'rgba(20,16,12,0.92)'; ctx.fill();
  ctx.strokeStyle = o.color || C.gold; ctx.lineWidth = o.hl ? 2.6 : 1.6;
  if (o.hl) { ctx.shadowColor = o.color || C.gold; ctx.shadowBlur = 18 * o.hl; }
  ctx.stroke(); ctx.restore();
  text(ctx, label, x, y + 11, { size: o.size || 30, weight: 700, color: o.textColor || C.cream, alpha: a, ls: 3 });
}

// edge between node centers, trimmed by node radius; pulses travel when `flow` > 0
function edge(ctx, a, b, p, o = {}) {
  const [x1, y1] = a, [x2, y2] = b;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const ta = o.trimA || 70, tb = o.trimB || 70;
  const sx = x1 + ux * ta, sy = y1 + uy * ta, ex = x2 - ux * tb, ey = y2 - uy * tb;
  const pt = arrow(ctx, sx, sy, ex, ey, p, { color: o.color || C.gold, width: o.width || 3, bend: o.bend || 0, alpha: o.alpha, glow: o.glow, dash: o.dash });
  if (o.flow > 0 && p >= 1 && pt) {
    ctx.save();
    for (let k = 0; k < 3; k++) {
      const u = ((o.time * 0.7 + k / 3) % 1);
      const [px, py] = pt(u);
      const g = ctx.createRadialGradient(px, py, 0, px, py, 16);
      g.addColorStop(0, `rgba(255,236,190,${0.95 * o.flow})`); g.addColorStop(1, 'rgba(255,236,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 16, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// ⑥ blood pressure chain (under the table)
function sceneBP(ctx, t) {
  if (t < bt(45) || t > bt(51) + 1.0) return;
  const a = ep(t, bt(45) + 0.6, bt(45) + 1.5) * (1 - ep(t, bt(51), bt(51) + 0.8));
  const P = { d: [560, 720], b: [960, 720], r: [1360, 720] };
  const cut = ep(t, bt(47) + 0.15, bt(47) + 0.45, E.out);
  const heal = ep(t, bt(49) + 0.1, bt(49) + 0.9);
  const broken = cut * (1 - heal);
  node(ctx, ...P.d, '吃药', a, { color: C.blue, textColor: C.blueHi });
  node(ctx, ...P.b, '血压 ↓', a * ep(t, bt(45) + 1.2, bt(45) + 1.8));
  node(ctx, ...P.r, '康复', a * ep(t, bt(45) + 2.2, bt(45) + 2.8));
  const e1 = ep(t, bt(45) + 1.0, bt(45) + 1.8, E.out), e2 = ep(t, bt(45) + 2.0, bt(45) + 2.8, E.out);
  const ec = broken > 0.01 ? C.redHi : C.gold;
  if (broken > 0.01) {
    // two halves pushed apart
    ctx.save(); ctx.globalAlpha = a;
    const off = 10 * broken;
    drawLine(ctx, P.d[0] + 80, P.d[1], 760 - off, P.d[1] - off * 0.5, 1, ec, 3, 1);
    arrow(ctx, 760 + off, P.d[1] + off * 0.5, P.b[0] - 88, P.b[1], 1, { color: ec, width: 3 });
    ctx.restore();
  } else edge(ctx, P.d, P.b, e1 * a > 0 ? e1 : 0, { alpha: a, trimA: 80, trimB: 88, flow: heal * env(t, bt(49), bt(51), 0.4, 0.4), time: t });
  edge(ctx, P.b, P.r, e2, { alpha: a, trimA: 88, trimB: 80, flow: heal * env(t, bt(49), bt(51), 0.4, 0.4), time: t });
  // the slash
  const sl = prog(t, bt(47) + 0.05, bt(47) + 0.3);
  const slOut = 1 - ep(t, bt(47) + 0.35, bt(47) + 0.9);
  if (sl > 0 && slOut > 0) {
    ctx.save(); ctx.globalAlpha = slOut; ctx.shadowColor = '#fff'; ctx.shadowBlur = 30;
    drawLine(ctx, 700, 630, lerp(700, 820, E.out(sl)), lerp(630, 810, E.out(sl)), 1, '#fff6e6', 4);
    ctx.restore();
  }
  const cl = env(t, bt(47) + 0.4, bt(49) + 0.3, 0.4, 0.4);
  text(ctx, '按血压分组', 760, 820, { size: 26, weight: 700, color: C.redHi, alpha: cl * a, ls: 3 });
  const hl = env(t, bt(49) + 0.6, bt(51), 0.4, 0.5);
  text(ctx, '合起来看：药的作用完整保留', W / 2, 820, { size: 26, weight: 700, color: C.goldHi, alpha: hl * a, ls: 3 });
}

// ⑦ causal diagrams
function sceneCausal(ctx, t) {
  if (t < bt(53) - 0.1 || t > bt(59) + 1.0) return;
  const a = ep(t, bt(53) + 0.2, bt(53) + 1.0) * (1 - ep(t, bt(59), bt(59) + 0.8));
  const lf = env(t, bt(55), bt(57) + 0.1, 0.4, 0.4), rf = env(t, bt(57), bt(59) + 0.1, 0.4, 0.4);
  const la = a * (1 - 0.6 * rf), ra = a * (1 - 0.6 * lf);
  const dp = (d) => ep(t, bt(53) + 0.5 + d, bt(53) + 1.3 + d, E.out);
  // left: confounder (fork)
  const K = { s: [540, 400], c: [360, 640], o: [720, 640] };
  node(ctx, ...K.s, '结石大小', la * dp(0), { hl: lf, size: 30 });
  node(ctx, ...K.c, '选哪种手术', la * dp(0.3), { size: 28 });
  node(ctx, ...K.o, '成功率', la * dp(0.4), { size: 28 });
  edge(ctx, K.s, K.c, dp(0.6), { alpha: la, trimA: 50, trimB: 46, flow: lf, time: t, glow: lf * 10 });
  edge(ctx, K.s, K.o, dp(0.7), { alpha: la, trimA: 50, trimB: 46, flow: lf, time: t + 0.3, glow: lf * 10 });
  edge(ctx, K.c, K.o, dp(0.9), { alpha: la * 0.8, trimA: 100, trimB: 80 });
  text(ctx, '结石大小：手术之前就定了', 540, 760, { size: 26, color: C.cream, alpha: 0.8 * la * dp(1.1), ls: 2 });
  text(ctx, '→  该拆开看', 540, 806, { size: 28, weight: 700, color: C.goldHi, alpha: la * dp(1.2), ls: 3 });
  // right: mediator (chain)
  const B = { d: [1200, 640], b: [1380, 400], r: [1560, 640] };
  node(ctx, ...B.d, '吃药', ra * dp(0.2), { color: C.blue, textColor: C.blueHi, size: 28 });
  node(ctx, ...B.b, '血压', ra * dp(0.1), { hl: rf, size: 30 });
  node(ctx, ...B.r, '康复', ra * dp(0.4), { size: 28 });
  edge(ctx, B.d, B.b, dp(0.6), { alpha: ra, trimA: 46, trimB: 50, flow: rf, time: t, glow: rf * 10 });
  edge(ctx, B.b, B.r, dp(0.8), { alpha: ra, trimA: 50, trimB: 46, flow: rf, time: t + 0.4, glow: rf * 10 });
  edge(ctx, B.d, B.r, dp(0.9), { alpha: ra * 0.8, trimA: 70, trimB: 70 });
  text(ctx, '血压：吃药之后的结果', 1380, 760, { size: 26, color: C.cream, alpha: 0.8 * ra * dp(1.1), ls: 2 });
  text(ctx, '→  该合起来看', 1380, 806, { size: 28, weight: 700, color: C.goldHi, alpha: ra * dp(1.2), ls: 3 });
  // divider
  drawLine(ctx, W / 2, 330, W / 2, 830, dp(0.2), 'rgba(217,180,108,0.25)', 1, a);
}

// ⑦ Pearl: book + medal
function scenePearl(ctx, t) {
  if (t < bt(59) || t > bt(61) + 0.8) return;
  const a = ep(t, bt(59) + 0.3, bt(59) + 1.2) * (1 - ep(t, bt(61) - 0.2, bt(61) + 0.6));
  const rise = (1 - E.out(prog(t, bt(59) + 0.3, bt(59) + 1.5))) * 40;
  // book
  ctx.save(); ctx.globalAlpha = a; ctx.translate(760, 520 + rise); ctx.rotate(-0.04);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#1c2633'; ctx.fillRect(-150, -215, 300, 430);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(-150, -215, 14, 430);
  ctx.strokeStyle = 'rgba(217,180,108,0.6)'; ctx.lineWidth = 1.2; ctx.strokeRect(-128, -195, 264, 390);
  ctx.fillStyle = C.goldHi; setFont(ctx, 20, 400, F.serif); ctx.textAlign = 'center'; ctx.letterSpacing = '6px';
  ctx.fillText('THE', 0, -110);
  setFont(ctx, 44, 700, F.serif); ctx.letterSpacing = '4px';
  ctx.fillText('BOOK', 0, -60); ctx.fillText('OF WHY', 0, -12);
  ctx.letterSpacing = '1px'; setFont(ctx, 15, 400, F.serif, 'italic'); ctx.fillStyle = C.cream;
  ctx.fillText('The New Science of', 0, 34); ctx.fillText('Cause and Effect', 0, 56);
  // little causal glyph
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5;
  for (const [x, y] of [[-40, 110], [40, 110], [0, 150]]) { ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-34, 115); ctx.lineTo(-6, 144); ctx.moveTo(34, 115); ctx.lineTo(6, 144); ctx.moveTo(-32, 110); ctx.lineTo(32, 110); ctx.stroke();
  setFont(ctx, 14, 400, F.serif); ctx.fillStyle = C.cream; ctx.letterSpacing = '3px';
  ctx.fillText('JUDEA PEARL', 0, 186);
  ctx.restore();
  // medal
  const ma = a * ep(t, bt(59) + 0.8, bt(59) + 1.6);
  ctx.save(); ctx.globalAlpha = ma; ctx.translate(1160, 500 + rise * 0.6);
  const rot = (1 - E.out(prog(t, bt(59) + 0.8, bt(59) + 2.2))) * 0.6;
  ctx.rotate(rot);
  const g = ctx.createRadialGradient(-30, -40, 10, 0, 0, 130);
  g.addColorStop(0, '#fbe7b0'); g.addColorStop(0.6, '#c9973f'); g.addColorStop(1, '#7a5520');
  ctx.shadowColor = 'rgba(240,190,100,0.5)'; ctx.shadowBlur = 40;
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 120, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(60,40,10,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#3a2a10'; ctx.textAlign = 'center';
  setFont(ctx, 17, 700, F.serif); ctx.letterSpacing = '4px'; ctx.fillText('A.M. TURING', 0, -24); ctx.fillText('AWARD', 0, 2);
  setFont(ctx, 36, 400, F.didot); ctx.letterSpacing = '2px'; ctx.fillText('2011', 0, 52);
  ctx.restore();
  // ribbon tails
  text(ctx, '2011 年图灵奖', 1160, 680, { size: 26, weight: 700, color: C.goldHi, alpha: ma, ls: 4 });
  text(ctx, '概率与因果推理', 1160, 716, { size: 22, color: C.cream, alpha: 0.6 * ma, ls: 4 });
}

// ⑧ AI data sea, broken arrow, callback cards
function sceneAI(ctx, t) {
  if (t < bt(61) - 0.4 || t > bt(67) + 0.6) return;
  const a = ep(t, bt(61) - 0.3, bt(61) + 1.2) * (1 - ep(t, bt(65), bt(65) + 1.0));
  if (a > 0) {
    // speed slows in bar 63+
    const tt = t - bt(61);
    const slow = ep(t, bt(63) - 0.5, bt(63) + 1.0);
    const travel = tt * 0.32 - slow * (t - (bt(63) - 0.5)) * 0.24 * ep(t, bt(63) - 0.5, bt(63) + 1.0);
    const N = 1500;
    ctx.save();
    for (let i = 0; i < N; i++) {
      const z0 = hash(i, 61);
      let z = (z0 - travel) % 1; if (z < 0) z += 1;
      z = 0.04 + z * 0.96;
      const ang = hash(i, 62) * Math.PI * 2, rr = 0.15 + hash(i, 63) * 1.4;
      const x = W / 2 + Math.cos(ang) * rr * 520 / z, y = H / 2 - 30 + Math.sin(ang) * rr * 330 / z;
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      const r = clamp(1.6 / z, 0.6, 7);
      const fade = clamp((1 - z) * 2.2) * clamp(z * 8);
      ctx.globalAlpha = a * fade * (0.35 + 0.65 * hash(i, 64));
      ctx.fillStyle = hash(i, 65) < 0.62 ? C.gold : C.blue;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // core glow
    const cg = ctx.createRadialGradient(W / 2, H / 2 - 30, 0, W / 2, H / 2 - 30, 360);
    cg.addColorStop(0, `rgba(250,220,160,${0.16 * a})`); cg.addColorStop(1, 'rgba(250,220,160,0)');
    ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
    // two chosen points and a failed arrow
    const pa = env(t, bt(63) - 0.2, bt(65) + 0.6, 0.6, 0.8);
    if (pa > 0) {
      const P1 = [720, 520], P2 = [1200, 520];
      for (const [x, y] of [P1, P2]) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 40);
        g.addColorStop(0, `rgba(255,236,190,${0.9 * pa})`); g.addColorStop(0.25, `rgba(240,200,120,${0.5 * pa})`); g.addColorStop(1, 'rgba(240,200,120,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill();
      }
      const ap = ep(t, bt(63) + 0.4, bt(63) + 2.2, E.out) * 0.56;
      const brk = ep(t, bt(64) + 0.5, bt(64) + 1.6);
      if (brk <= 0) arrow(ctx, P1[0] + 40, P1[1], P2[0] - 40, P2[1], ap, { color: C.goldHi, width: 3, dash: [14, 10], alpha: pa, noHead: true, bend: -40 });
      else {
        // fragments drift apart and fade
        const segs = 9;
        for (let k = 0; k < segs; k++) {
          const u0 = (k / segs) * 0.56, u1 = ((k + 0.6) / segs) * 0.56;
          const dx = (hash(k, 71) - 0.5) * 120 * brk, dy = (hash(k, 72) - 0.3) * 140 * brk;
          const x0 = lerp(P1[0] + 40, P2[0] - 40, u0) + dx, x1 = lerp(P1[0] + 40, P2[0] - 40, u1) + dx;
          const yb = (u) => P1[1] - 40 * 4 * u * (1 - u);
          drawLine(ctx, x0, yb(u0) + dy, x1, yb(u1) + dy, 1, C.goldHi, 3, pa * (1 - brk));
        }
      }
      const q = ep(t, bt(64) + 1.0, bt(64) + 1.9);
      text(ctx, '?', W / 2, 470, { size: 90, fam: F.didot, color: C.goldHi, alpha: q * pa * 0.85, glow: 24 });
    }
  }
  // callback cards
  const ca = ep(t, bt(65) + 0.2, bt(65) + 1.2) * (1 - ep(t, bt(67) - 0.1, bt(67) + 0.5));
  if (ca > 0) {
    ctx.save(); ctx.globalAlpha = ca;
    const s = 0.72;
    ctx.translate(W / 2, 470); ctx.scale(s, s); ctx.translate(-W / 2, -470);
    drawSurgeryCard(ctx, W / 2 - 300, 470, '手术 A', 78, 1, C.gold, { alpha: 1 });
    drawSurgeryCard(ctx, W / 2 + 300, 470, '手术 B', 83, 1, C.blue, { alpha: 1 });
    ctx.restore();
    const q = ep(t, bt(66), bt(66) + 0.6, E.outBack);
    if (q > 0) {
      ctx.save(); ctx.translate(W / 2, 470); ctx.scale(q, q);
      text(ctx, '?', 0, 50, { size: 150, fam: F.didot, color: C.goldHi, alpha: ca, glow: 30 });
      ctx.restore();
    }
  }
}

// ⑧ end card
function sceneEnd(ctx, t) {
  const t0 = bt(67);
  if (t < t0 - 0.2) return;
  const a = ep(t, t0, t0 + 1.0);
  text(ctx, "SIMPSON’S PARADOX", W / 2, 236, { size: 22, fam: F.serif, ls: 12, color: C.gold, alpha: a });
  ctx.save(); ctx.globalAlpha = a;
  ctx.translate(0, -160);
  const s = 0.8;
  ctx.translate(W / 2, TITLE_Y); ctx.scale(s, s); ctx.translate(-W / 2, -TITLE_Y);
  drawTitleText(ctx, 1);
  ctx.restore();
  const lp = ep(t, t0 + 0.3, t0 + 1.2, E.outQuint);
  drawLine(ctx, W / 2, 432, W / 2 - 220 * lp, 432, 1, C.goldDim, 1.2, a);
  drawLine(ctx, W / 2, 432, W / 2 + 220 * lp, 432, 1, C.goldDim, 1.2, a);
  const qa = ep(t, t0 + 0.6, t0 + 1.6);
  text(ctx, '数据不会说谎，', W / 2, 510, { size: 40, weight: 700, alpha: qa, ls: 4 });
  richText(ctx, '但它不会告诉你，该怎么【读它】。', W / 2, 566, { size: 40, weight: 700, alpha: qa, ls: 4 });
  const ra = ep(t, t0 + 1.2, t0 + 2.2) * 0.45;
  const refs = [
    '参考资料',
    'Charig C.R. et al. (1986) BMJ 292: 879–882    ·    Julious S.A. & Mullee M.A. (1994) BMJ 309: 1480',
    'Bickel P.J., Hammel E.A. & O’Connell J.W. (1975) Science 187: 398–404',
    'Simpson E.H. (1951) J. R. Statist. Soc. B 13: 238–241    ·    Pearl J. (2014) The American Statistician 68: 8–13',
    'Pearl J. & Mackenzie D. (2018) The Book of Why',
  ];
  refs.forEach((s, i) => text(ctx, s, W / 2, 680 + i * 30, { size: i === 0 ? 18 : 17, fam: i === 0 ? F.song : F.serif, color: C.cream, alpha: ra * (i === 0 ? 1.3 : 1), ls: i === 0 ? 6 : 0.5 }));
  const la = ep(t, t0 + 1.6, t0 + 2.6);
  text(ctx, 'LIGHT聊AI', W / 2, 920, { size: 34, weight: 900, color: C.goldHi, alpha: la, ls: 4 });
  text(ctx, '出品', W / 2, 958, { size: 18, color: C.cream, alpha: 0.5 * la, ls: 8 });
}
