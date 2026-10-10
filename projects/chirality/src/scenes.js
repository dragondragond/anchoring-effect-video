// Scenes for 镜像之谜. Bars: ① 1–9 hands · ② 9–11 title · ③ 11–23 Pasteur → chirality → life · ④ 23–37 lab, Frank, Kagan
// · ⑤ 37–45 origin, Soai · ⑥ 45–53 amplification · ⑦ 53–65 chance, search, AI, prize · ⑧ 65–68 back to your hands.

// Fade windows: the previous scene leaves in [b - 0.5, b + 0.05], the next arrives in [b, b + 0.8].
const inAt = (t, b) => ep(t, bt(b), bt(b) + 0.8);
const outAt = (t, b) => 1 - ep(t, bt(b) - 0.5, bt(b) + 0.05);

function mirrorLine(ctx, x, y0, y1, p, alpha) {
  if (alpha <= 0 || p <= 0) return;
  const ym = (y0 + y1) / 2, h = (y1 - y0) / 2 * p;
  const g = ctx.createLinearGradient(0, ym - h, 0, ym + h);
  g.addColorStop(0, 'rgba(201,210,227,0)'); g.addColorStop(0.5, `rgba(220,226,240,${0.8 * alpha})`); g.addColorStop(1, 'rgba(201,210,227,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 1.5, ym - h, 3, h * 2);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g2 = ctx.createLinearGradient(x - 40, 0, x + 40, 0);
  g2.addColorStop(0, 'rgba(201,210,227,0)'); g2.addColorStop(0.5, `rgba(201,210,227,${0.06 * alpha})`); g2.addColorStop(1, 'rgba(201,210,227,0)');
  ctx.fillStyle = g2; ctx.fillRect(x - 40, ym - h, 80, h * 2); ctx.restore();
}
function halo(ctx, x, y, r, rgb, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, r, rgb, a); ctx.restore(); }

// ---------- particle fields (autocatalysis) ----------
// Colours are assigned so the running excess follows a target curve; the picture is illustrative, the end numbers are real.
function makeField(n, seed) { const r = rng(seed), pts = []; while (pts.length < n) { const x = r() * 2 - 1, y = r() * 2 - 1; if (x * x + y * y <= 1) pts.push([x, y]); } return pts; }
function makeRun(n, seed, target, flip = false, earlyRandom = 0) {
  const r = rng(seed), field = makeField(n, seed + 1);
  const order = field.map((p, i) => [i, Math.hypot(p[0], p[1]) * 0.85 + r() * 0.3]).sort((a, b) => a[1] - b[1]);
  // `win` is the hand that ends up on top; the running excess of `win` follows target(u)
  const win = flip ? 'R' : 'L', lose = flip ? 'L' : 'R';
  const color = new Array(n), when = new Array(n); let nw = 0, nl = 0;
  order.forEach(([i], j) => {
    when[i] = j / n;
    let pickWin;
    if (j < earlyRandom) pickWin = r() < 0.5;
    else { const ee = nw + nl ? (nw - nl) / (nw + nl) : 0; pickWin = ee < target((j + 1) / n); }
    color[i] = pickWin ? win : lose; pickWin ? nw++ : nl++;
  });
  return { field, color, when };
}
const RUN95 = makeRun(520, 11, (u) => 0.02 + 0.85 * Math.pow(u, 0.8));
const RUN03 = makeRun(620, 23, (u) => (u < 0.06 ? 0.03 : 0.9999 * Math.pow((u - 0.06) / 0.94, 0.35)), false, 18);
const RUNA = makeRun(300, 37, (u) => (u < 0.08 ? 0.05 : Math.pow((u - 0.08) / 0.92, 0.4)), false, 10);
const RUNB = makeRun(300, 41, (u) => (u < 0.08 ? 0.05 : Math.pow((u - 0.08) / 0.92, 0.4)), true, 10);
const RUNPURE = makeRun(360, 53, () => 1);
// Draw a field: particles convert in order as u goes 0 → 1. Returns the live excess of L.
function drawField(ctx, run, cx, cy, rx, ry, u, alpha, o = {}) {
  if (alpha <= 0) return 0;
  let A = 0, T = 0;
  ctx.save();
  const n = run.field.length;
  for (let i = 0; i < n; i++) {
    const [fx, fy] = run.field[i], x = cx + fx * rx, y = cy + fy * ry, w = run.when[i];
    if (u < w) {
      if (o.grey !== false) {
        const jx = o.t != null ? Math.sin(o.t * 2.3 + i * 1.7) * 3 : 0, jy = o.t != null ? Math.cos(o.t * 2.1 + i * 2.3) * 3 : 0;
        ctx.globalAlpha = alpha * 0.35; ctx.fillStyle = '#8f8a9e'; ctx.beginPath(); ctx.arc(x + jx, y + jy, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      continue;
    }
    const age = clamp((u - w) * 30), h = run.color[i];
    h === 'L' ? A++ : T++;
    ctx.globalAlpha = alpha;
    const r = (o.r || 5) * (0.6 + 0.4 * E.outBack(age));
    if (age < 1) halo(ctx, x, y, r * 1.4, handRGB(h), 0.5 * alpha * (1 - age));
    ball(ctx, x, y, r, handRGB(h), alpha);
  }
  ctx.restore();
  return A + T ? (A - T) / (A + T) : 0;
}
// A balance bar: amber share on the left, teal on the right.
function eeBar(ctx, cx, y, w, ee, alpha, label) {
  if (alpha <= 0) return;
  const fa = (1 + ee) / 2;
  ctx.save(); ctx.globalAlpha *= alpha;
  roundRect(ctx, cx - w / 2, y - 12, w, 24, 12); ctx.fillStyle = 'rgba(79,209,197,0.85)'; ctx.fill();
  ctx.save(); roundRect(ctx, cx - w / 2, y - 12, w, 24, 12); ctx.clip(); ctx.fillStyle = 'rgba(242,182,90,0.95)'; ctx.fillRect(cx - w / 2, y - 12, w * fa, 24); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5; roundRect(ctx, cx - w / 2, y - 12, w, 24, 12); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(cx - 1, y - 20, 2, 40);
  ctx.restore();
  text(ctx, '左手型', cx - w / 2 - 20, y + 9, { size: 22, color: MC.amberHi, alpha, align: 'right', ls: 2 });
  text(ctx, '右手型', cx + w / 2 + 20, y + 9, { size: 22, color: MC.tealHi, alpha, align: 'left', ls: 2 });
  if (label) text(ctx, label, cx, y - 34, { size: 26, color: C.cream, alpha: 0.85 * alpha, ls: 2 });
}

// ---------- small props ----------
function drawFlask(ctx, x, y, s, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  ctx.beginPath(); ctx.moveTo(-28, -170); ctx.lineTo(-28, -70); ctx.lineTo(-120, 90); ctx.quadraticCurveTo(-130, 120, -95, 120); ctx.lineTo(95, 120); ctx.quadraticCurveTo(130, 120, 120, 90); ctx.lineTo(28, -70); ctx.lineTo(28, -170);
  ctx.strokeStyle = 'rgba(220,226,240,0.85)'; ctx.lineWidth = 3 / s; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-90, 60); ctx.lineTo(-120, 90); ctx.quadraticCurveTo(-130, 120, -95, 120); ctx.lineTo(95, 120); ctx.quadraticCurveTo(130, 120, 120, 90); ctx.lineTo(90, 60); ctx.closePath();
  ctx.fillStyle = 'rgba(164,140,255,0.25)'; ctx.fill();
  ctx.restore();
}
function drawCapsule(ctx, x, y, s, rgb, alpha) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6); ctx.globalAlpha *= alpha;
  roundRect(ctx, -60 * s, -24 * s, 120 * s, 48 * s, 24 * s); ctx.fillStyle = rgba(rgb, 0.18); ctx.fill(); ctx.strokeStyle = rgba(rgb, 0.95); ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -24 * s); ctx.lineTo(0, 24 * s); ctx.stroke(); ctx.restore();
}
function drawLeaf(ctx, x, y, s, rgb, alpha) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5); ctx.globalAlpha *= alpha;
  ctx.beginPath(); ctx.moveTo(0, 50 * s); ctx.quadraticCurveTo(-48 * s, 0, 0, -55 * s); ctx.quadraticCurveTo(48 * s, 0, 0, 50 * s);
  ctx.fillStyle = rgba(rgb, 0.18); ctx.fill(); ctx.strokeStyle = rgba(rgb, 0.95); ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 60 * s); ctx.lineTo(0, -40 * s); ctx.stroke(); ctx.restore();
}
function drawFlower(ctx, x, y, s, rgb, alpha) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= alpha; ctx.strokeStyle = rgba(rgb, 0.95); ctx.fillStyle = rgba(rgb, 0.18); ctx.lineWidth = 3;
  for (let k = 0; k < 5; k++) { ctx.save(); ctx.rotate((k / 5) * Math.PI * 2); ctx.beginPath(); ctx.ellipse(0, -26 * s, 14 * s, 24 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ball(ctx, 0, 0, 10 * s, rgb, 1); ctx.restore();
}
function crossMark(ctx, x, y, s, p, alpha) {
  if (p <= 0) return;
  drawLine(ctx, x - s, y - s, lerp(x - s, x + s, clamp(p * 2)), lerp(y - s, y + s, clamp(p * 2)), 1, MC.rose, 6, alpha);
  if (p > 0.5) drawLine(ctx, x + s, y - s, lerp(x + s, x - s, clamp(p * 2 - 1)), lerp(y - s, y + s, clamp(p * 2 - 1)), 1, MC.rose, 6, alpha);
}

// ---------- ① hands → molecules ----------
const MOL_L = chiralAtoms(true), MOL_R = chiralAtoms(false);
function moleculePair(ctx, t, xl, xr, y, s, a, o = {}) {
  const ry = t * 0.7, rx = 0.35;
  halo(ctx, xl, y, s * 1.6, AMB, 0.18 * a * (o.glowL || 1));
  halo(ctx, xr, y, s * 1.6, TEA, 0.18 * a * (o.glowR || 1));
  drawMolecule(ctx, MOL_L, xl, y, s, -ry, rx, { alpha: a * (o.aL == null ? 1 : o.aL), tint: AMB, tintK: 0.18 });
  drawMolecule(ctx, MOL_R, xr, y, s, ry, rx, { alpha: a * (o.aR == null ? 1 : o.aR), tint: TEA, tintK: 0.18 });
}
function sceneHook(ctx, t) {
  if (t > bt(9) + 0.2) return;
  const out = outAt(t, 9);
  // hands
  const ha = ep(t, 0.6, 2.2) * (1 - ep(t, bt(5) - 0.3, bt(5) + 0.5));
  if (ha > 0) {
    const slide = ep(t, bt(3) + 0.3, bt(4) + 0.6);
    const lx = lerp(760, 1160, slide), rise = (1 - ep(t, 0.6, 2.2, E.out)) * 40;
    const glow = ep(t, bt(4) + 0.5, bt(4) + 1.0) * (0.75 + 0.25 * Math.sin(t * 6));
    const bob = Math.sin(t * 1.7) * 14 * (1 - slide);
    mirrorLine(ctx, W / 2, 240, 860, ep(t, 1.6, 3.2, E.out), ha * (1 - slide));
    drawHand(ctx, 1160, 610 + rise + bob, 0.95, false, ha, { rgb: TEAHI, glowThumb: glow });
    drawHand(ctx, lx, 610 + rise + bob, 0.95, true, ha * lerp(1, 0.85, slide), { rgb: AMBHI, glowThumb: glow });
    text(ctx, '左手', 760, 900, { size: 24, color: MC.amberHi, alpha: ha * (1 - slide), ls: 6 });
    text(ctx, '右手', 1160, 900, { size: 24, color: MC.tealHi, alpha: ha * (1 - slide), ls: 6 });
    text(ctx, '拇指在两边', 1160, 250, { size: 28, weight: 700, color: MC.rose, alpha: ha * ep(t, bt(4) + 0.6, bt(4) + 1.1), ls: 4 });
  }
  // molecules in a mirror
  const ma = ep(t, bt(5) - 0.1, bt(5) + 0.8) * out;
  if (ma > 0) {
    mirrorLine(ctx, W / 2, 230, 820, ep(t, bt(5), bt(5) + 1.0, E.out), ma);
    const pick = ep(t, bt(7), bt(7) + 0.7);
    moleculePair(ctx, t, 700, 1220, 520, 95, ma, { aR: lerp(1, 0.28, pick), glowL: 1 + 1.5 * pick, glowR: 1 - pick });
    text(ctx, '镜子', W / 2, 870, { size: 22, color: MC.silver, alpha: 0.6 * ma * (1 - pick), ls: 8 });
    const q = ep(t, bt(8), bt(8) + 0.5, E.outBack);
    if (q > 0) { ctx.save(); ctx.translate(W / 2, 330); ctx.scale(q, q); text(ctx, '?', 0, 50, { size: 170, fam: F.didot, color: C.goldHi, alpha: out, glow: 30 }); ctx.restore(); }
  }
  const fl = Math.pow(prog(t, bt(9) - 0.55, bt(9)), 2.2) * (t < bt(9) ? 1 : 0);
  if (fl > 0) { ctx.fillStyle = `rgba(255,244,226,${0.85 * fl})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- ② title with its reflection ----------
function sceneTitle(ctx, t) {
  const t0 = bt(9), t1 = bt(11);
  if (t < t0 || t > t1 + 0.8) return;
  const ta = ep(t, t0 + 0.75, t0 + 1.4) * (1 - ep(t, t1 - 0.45, t1 + 0.05));
  const s = 1 + 0.03 * prog(t, t0, t1);
  // reflection, faded out downward on its own canvas (so the background is not darkened)
  if (ta > 0) {
    const off = sceneTitle.off || (sceneTitle.off = document.createElement('canvas'));
    off.width = W; off.height = H;
    const oc = off.getContext('2d');
    oc.save(); oc.translate(0, TITLE_Y * 2 + 36); oc.scale(1, -1); drawTitleText(oc, ta); oc.restore();
    oc.globalCompositeOperation = 'destination-in';
    const m = oc.createLinearGradient(0, TITLE_Y + 24, 0, TITLE_Y + 180);
    m.addColorStop(0, 'rgba(0,0,0,0.26)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    oc.fillStyle = m; oc.fillRect(0, 0, W, H);
    ctx.drawImage(off, 0, 0);
  }
  drawLine(ctx, W / 2 - 360 * ep(t, t0 + 0.6, t0 + 1.6, E.outQuint), TITLE_Y + 22, W / 2 + 360 * ep(t, t0 + 0.6, t0 + 1.6, E.outQuint), TITLE_Y + 22, 1, MC.silver, 1.2, 0.6 * ta);
  // particles from both sides: amber from the left, teal from the right
  const pts = titlePoints(), conv = ep(t, t0, t0 + 1.1, E.outQuint), burst = ep(t, t1 - 0.15, t1 + 0.8, E.out);
  const pa = (t < t0 + 1.4 ? 1 - ep(t, t0 + 0.9, t0 + 1.4) : 0) + (t > t1 - 0.45 ? ep(t, t1 - 0.45, t1 - 0.15) * (1 - ep(t, t1 + 0.2, t1 + 0.8)) : 0);
  if (pa > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < TITLE_N; i++) {
      const left = pts[i][0] < W / 2, sx = left ? -200 - hash(i, 31) * 500 : W + 200 + hash(i, 31) * 500, sy = TITLE_Y + (hash(i, 32) - 0.5) * 900;
      const k = E.outQuint(clamp(conv * 1.15 - hash(i, 5) * 0.15));
      const x = lerp(sx, pts[i][0], k) + (left ? -1 : 1) * 260 * burst, y = lerp(sy, pts[i][1], k) + (hash(i, 33) - 0.5) * 300 * burst;
      ctx.fillStyle = rgba(left ? AMBHI : TEAHI, pa); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  ctx.save(); ctx.translate(W / 2, TITLE_Y); ctx.scale(s, s); ctx.translate(-W / 2, -TITLE_Y); drawTitleText(ctx, ta); ctx.restore();
  const sa = ep(t, t0 + 0.9, t0 + 1.7) * env(t, t0, t1, 0.01, 0.5);
  text(ctx, CONFIG.titleEn, W / 2, TITLE_Y - 200, { size: 26, fam: F.serif, ls: 12, color: MC.silver, alpha: sa });
  const ua = ep(t, t0 + 1.8, t0 + 2.6) * env(t, t0, t1, 0.01, 0.5);
  richText(ctx, '【2026 诺贝尔化学奖】 · 生命为什么只用一只手', W / 2, TITLE_Y + 150, { size: 32, weight: 700, alpha: 0.9 * ua, ls: 4 });
  const fl = 1 - prog(t, t0, t0 + 0.7);
  if (fl > 0) { ctx.fillStyle = `rgba(255,244,226,${0.85 * fl * fl})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- ③ Pasteur ----------
const MIC = { x: 700, y: 500, r: 300 };
const CRYSTALS = Array.from({ length: 14 }, (_, k) => {
  const a = hash(k, 201) * Math.PI * 2, d = Math.sqrt(hash(k, 202)) * (MIC.r - 70);
  const hand = k % 2 ? 'R' : 'L', slot = Math.floor(k / 2);
  return { x: MIC.x + Math.cos(a) * d, y: MIC.y + Math.sin(a) * d, rot: hash(k, 203) * Math.PI * 2, hand,
    px: (hand === 'L' ? 1230 : 1530) + (slot % 4 - 1.5) * 52, py: 560 + Math.floor(slot / 4) * 64, pick: bt(13) + 0.15 + k * 0.25 };
});
function scenePasteur(ctx, t) {
  if (t < bt(11) - 0.2 || t > bt(17) + 0.8) return;
  const a = inAt(t, 11) * outAt(t, 17);
  const ma = a * (1 - ep(t, bt(15) - 0.5, bt(15) + 0.05));
  if (ma > 0) {
    // microscope field
    ctx.save(); ctx.globalAlpha *= ma;
    const g = ctx.createRadialGradient(MIC.x - 60, MIC.y - 80, 20, MIC.x, MIC.y, MIC.r);
    g.addColorStop(0, 'rgba(255,240,215,0.16)'); g.addColorStop(1, 'rgba(255,240,215,0.03)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(MIC.x, MIC.y, MIC.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(201,210,227,0.7)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(201,210,227,0.25)'; ctx.beginPath(); ctx.arc(MIC.x, MIC.y, MIC.r + 14, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    text(ctx, '显微镜下 · 酒石酸钠铵的晶体', MIC.x, MIC.y + MIC.r + 56, { size: 22, color: C.cream, alpha: 0.6 * ma, ls: 2 });
    // crystals, then sorting with tweezers
    let active = null;
    for (const c of CRYSTALS) {
      const p = ep(t, c.pick, c.pick + 0.55, E.inOut);
      const k = CRYSTALS.indexOf(c), drift = 1 - p;
      const ang = (t - bt(11)) * 0.08, dx = c.x - MIC.x, dy = c.y - MIC.y;
      const fx = MIC.x + dx * Math.cos(ang) - dy * Math.sin(ang) + Math.sin(t * 0.9 + k) * 10, fy = MIC.y + dx * Math.sin(ang) + dy * Math.cos(ang) + Math.cos(t * 0.8 + k * 1.3) * 10;
      const x = lerp(fx, c.px, p), y = lerp(fy, c.py, p) - Math.sin(p * Math.PI) * 120;
      drawCrystal(ctx, x, y, 22, lerp(c.rot + Math.sin(t * 0.6 + k) * 0.4 * drift, 0, p), c.hand, ma);
      if (t > c.pick - 0.15 && t < c.pick + 0.6) active = [x, y, p];
    }
    if (active) drawTweezers(ctx, active[0] + 8, active[1] - 14, 0.5, active[2] < 0.05 || active[2] > 0.95 ? 1 : 0, ma);
    const pl = ma * ep(t, bt(13) + 0.3, bt(13) + 0.9);
    text(ctx, '一种', 1230, 500, { size: 26, weight: 700, color: MC.amberHi, alpha: pl, ls: 4 });
    text(ctx, '它的镜像', 1530, 500, { size: 26, weight: 700, color: MC.tealHi, alpha: pl, ls: 4 });
    mirrorLine(ctx, 1380, 470, 800, pl, pl);
  }
  // polarised light through the two solutions
  const pa = a * ep(t, bt(15), bt(15) + 0.8);
  if (pa > 0) {
    const turn = 0.62 * ep(t, bt(15) + 0.6, bt(16) + 0.6);
    drawPolarised(ctx, 760, 380, turn, t, TEA, pa, '右转');
    drawPolarised(ctx, 760, 690, -turn, t, AMB, pa, '左转');
    text(ctx, '偏振光', 400, 300, { size: 22, color: C.cream, alpha: 0.6 * pa, ls: 4 });
    // the tiny crystal icons that went into each vial
    drawCrystal(ctx, 1400, 380, 30, 0.2, 'R', pa); drawCrystal(ctx, 1400, 690, 30, -0.2, 'L', pa);
  }
}

// ---------- ③ chirality, proteins, DNA ----------
function sceneChiral(ctx, t) {
  if (t < bt(17) - 0.2 || t > bt(23) + 0.8) return;
  const a = inAt(t, 17) * outAt(t, 23);
  // [17,19] the mirror pair will not superimpose
  const ma = a * (1 - ep(t, bt(19) - 0.5, bt(19) + 0.05));
  if (ma > 0) {
    const tryP = ep(t, bt(17) + 1.0, bt(18) + 0.4, E.inOut);
    mirrorLine(ctx, W / 2, 230, 820, 1 - tryP, ma);
    const xr = lerp(1220, 700, tryP);
    moleculePair(ctx, t, 700, xr, 520, 100, ma, { aR: lerp(1, 0.8, tryP) });
    const fail = ep(t, bt(18) + 0.4, bt(18) + 0.8);
    if (fail > 0) { crossMark(ctx, 700, 520, 70, fail, ma); text(ctx, '怎么转，都叠不到一起', 700, 280, { size: 28, weight: 700, color: MC.rose, alpha: ma * fail, ls: 3 }); }
    const la = ma * ep(t, bt(17) + 0.4, bt(17) + 1.0);
    text(ctx, '手性分子', 1340, 470, { size: 44, weight: 900, color: C.goldHi, alpha: la, ls: 8 });
    text(ctx, 'CHIRAL · 源自希腊语的「手」', 1340, 520, { size: 22, fam: F.serif, color: C.cream, alpha: 0.6 * la, ls: 2 });
  }
  // [19,21] a protein: every amino acid has the same hand
  const pa = a * env(t, bt(19), bt(21) + 0.05, 0.8, 0.5);
  if (pa > 0) {
    const n = 20, shown = ep(t, bt(19) + 0.2, bt(20) + 0.6) * n;
    const pt = (k, y0, amp) => [300 + k * 70, y0 + Math.sin(k * 0.7 + t * 1.2) * amp];
    ctx.save(); ctx.globalAlpha *= pa; ctx.strokeStyle = 'rgba(255,217,154,0.5)'; ctx.lineWidth = 3; ctx.beginPath();
    for (let k = 0; k < shown; k++) { const [x, y] = pt(k, 430, 50); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    for (let k = 0; k < shown; k++) { const [x, y] = pt(k, 430, 50); ball(ctx, x, y, 14, AMB, pa * clamp(shown - k)); }
    text(ctx, '蛋白质：氨基酸都是同一种手型', 960, 300, { size: 28, weight: 700, color: MC.amberHi, alpha: pa, ls: 3 });
    const ga = pa * ep(t, bt(20), bt(20) + 0.8);
    for (let k = 0; k < n; k++) { const [x, y] = pt(k, 680, 40); ball(ctx, x, y, 12, TEA, ga * 0.25); }
    drawLine(ctx, 280, 680, lerp(280, 1660, ep(t, bt(20) + 0.6, bt(20) + 1.3)), 680, 1, MC.rose, 4, ga);
    text(ctx, '它的镜像：自然界中很少见', 960, 790, { size: 24, color: MC.tealHi, alpha: 0.75 * ga, ls: 2 });
  }
  // [21,23] DNA, and the word for it
  const da = a * ep(t, bt(21), bt(21) + 0.8);
  if (da > 0) {
    drawHelix(ctx, 640, 500, 560, 95, t, da, { rgb: TEA, rgb2: TEAHI });
    text(ctx, 'DNA 里的糖：也只用一种', 640, 860, { size: 24, color: MC.tealHi, alpha: 0.8 * da, ls: 2 });
    const wa = da * ep(t, bt(22) - 0.2, bt(22) + 0.6);
    text(ctx, '单手性', 1320, 520, { size: 110, weight: 900, color: C.goldHi, alpha: wa, ls: 16, glow: 30 });
    text(ctx, 'HOMOCHIRALITY', 1330, 590, { size: 26, fam: F.serif, color: C.cream, alpha: 0.7 * wa, ls: 10 });
    text(ctx, '希腊语：「相同」+「手」', 1330, 636, { size: 22, color: C.cream, alpha: 0.5 * wa, ls: 2 });
  }
}

// ---------- ④ the lab makes both; the lock wants one ----------
function sceneLab(ctx, t) {
  if (t < bt(23) - 0.2 || t > bt(27) + 0.8) return;
  const a = inAt(t, 23) * outAt(t, 27);
  const fa = a * (1 - ep(t, bt(25) - 0.5, bt(25) + 0.05));
  if (fa > 0) {
    drawFlask(ctx, 640, 640, 1.2, fa);
    // molecules bubbling out, alternating hands
    for (let k = 0; k < 60; k++) {
      const born = bt(23) + 0.4 + k * 0.055; if (t < born) continue;
      const age = t - born, u = clamp(age / 1.6);
      const tx = 1000 + (hash(k, 211) - 0.5) * 520, ty = 320 + (hash(k, 212) - 0.5) * 300;
      const x = lerp(640, tx, E.out(u)) + Math.sin(age * 3 + k) * 6, y = lerp(440, ty, E.out(u)) - Math.sin(u * Math.PI) * 60;
      ball(ctx, x, y, 9, k % 2 ? TEA : AMB, fa * clamp(age * 4));
    }
    const n = Math.min(60, Math.max(0, Math.floor((t - bt(23) - 0.4) / 0.055) + 1));
    const L = Math.ceil(n / 2), R = Math.floor(n / 2);
    const ca = fa * ep(t, bt(23) + 0.8, bt(23) + 1.4);
    text(ctx, '左手型', 1500, 560, { size: 26, color: MC.amberHi, alpha: ca, ls: 2, align: 'right' });
    text(ctx, (n ? Math.round((100 * L) / n) : 50) + '%', 1530, 566, { size: 56, fam: F.didot, color: MC.amberHi, alpha: ca, align: 'left' });
    text(ctx, '右手型', 1500, 650, { size: 26, color: MC.tealHi, alpha: ca, ls: 2, align: 'right' });
    text(ctx, (n ? Math.round((100 * R) / n) : 50) + '%', 1530, 656, { size: 56, fam: F.didot, color: MC.tealHi, alpha: ca, align: 'left' });
  }
  // the locksmith's problem
  const ka = a * ep(t, bt(25), bt(25) + 0.8);
  if (ka > 0) {
    const open = ep(t, bt(25) + 1.0, bt(25) + 1.4);
    const k1 = ep(t, bt(25) + 0.3, bt(25) + 1.0, E.inOut) * (1 - ep(t, bt(25) + 1.7, bt(26) + 0.1, E.inOut));
    const k2 = ep(t, bt(26) + 0.2, bt(26) + 0.9, E.inOut);
    const shake = k2 >= 1 ? Math.sin(t * 40) * 6 * (1 - ep(t, bt(26) + 0.9, bt(26) + 1.5)) : 0;
    drawLock(ctx, 1250, 520, 1.25, open * (1 - ep(t, bt(26), bt(26) + 0.3)), ka);
    drawKey(ctx, lerp(560, 1100, k1), lerp(400, 545, k1), 1.1, false, AMB, ka);
    drawKey(ctx, lerp(560, 1100, k2) + shake, lerp(700, 545, k2), 1.1, true, TEA, ka);
    text(ctx, '治病', 560, 330, { size: 28, weight: 700, color: MC.amberHi, alpha: ka * (1 - k1 * 0.6), ls: 4 });
    text(ctx, '镜像：可能有害', 560, 800, { size: 28, weight: 700, color: MC.tealHi, alpha: ka, ls: 4 });
    ctx.save(); ctx.globalAlpha *= ka; checkMark(ctx, 1400, 360, 50, ep(t, bt(25) + 1.1, bt(25) + 1.5, E.out), MC.amberHi, 6); ctx.restore();
    crossMark(ctx, 1400, 700, 34, ep(t, bt(26) + 1.0, bt(26) + 1.4), ka);
    text(ctx, '诺贝尔委员会的比喻：一把锁，两把镜像的钥匙', W / 2, 920, { size: 20, color: C.cream, alpha: 0.5 * ka, ls: 1 });
  }
}

// ---------- ④ Frank's three conditions, Kagan's catalysts ----------
const CONDS = [['①', '手性催化剂'], ['②', '放大一只手的优势'], ['③', '产物能复制自己']];
function condCard(ctx, x, y, k, a, hl, done) {
  if (a <= 0) return;
  bubble(ctx, x, y, 560, 104, 0, a, { color: hl > 0 ? MC.amberHi : 'rgba(201,210,227,0.5)', fill: 'rgba(16,12,24,0.92)' });
  if (hl > 0) halo(ctx, x, y, 140, AMB, 0.12 * hl * a);
  text(ctx, CONDS[k][0], x - 220, y + 16, { size: 44, color: C.goldHi, alpha: a });
  text(ctx, CONDS[k][1], x + 20, y + 13, { size: 36, weight: 900, color: C.cream, alpha: a, ls: 4 });
  if (done > 0) { ctx.save(); ctx.globalAlpha *= a; checkMark(ctx, x + 236, y, 40, done, MC.amberHi, 6); ctx.restore(); }
}
function sceneFrank(ctx, t) {
  if (t < bt(27) - 0.2 || t > bt(33) + 0.8) return;
  const a = inAt(t, 27) * outAt(t, 33);
  const pc = a * (1 - ep(t, bt(31) - 0.5, bt(31) + 0.05));
  paperCard(ctx, 560, 500, 540, 360, -0.03, pc, [
    { text: 'ON SPONTANEOUS', size: 26, ls: 3 }, { text: 'ASYMMETRIC SYNTHESIS', size: 26, ls: 3 }, { text: 'F. C. Frank  ·  1953', size: 20, italic: true },
  ], 4);
  for (let k = 0; k < 3; k++) {
    const sl = a * ep(t, bt(27) + 0.6 + k * 0.4, bt(27) + 1.2 + k * 0.4) * (1 - ep(t, bt(29) + 0.15 + k * 1.1, bt(29) + 0.6 + k * 1.1));
    if (sl > 0) {
      ctx.save(); ctx.globalAlpha *= sl * (0.55 + 0.25 * Math.sin(t * 3 + k)); ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 30;
      roundRect(ctx, 1040, 330 + k * 170 - 52, 560, 104, 22); ctx.strokeStyle = 'rgba(201,210,227,0.7)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      text(ctx, '?', 1320, 330 + k * 170 + 22, { size: 56, fam: F.didot, color: C.cream, alpha: sl * 0.8 });
    }
    const ca = a * ep(t, bt(29) + 0.15 + k * 1.1, bt(29) + 0.75 + k * 1.1);
    const hl = k === 1 ? ep(t, bt(32), bt(32) + 0.5) : 0;
    const done = k === 0 ? ep(t, bt(31) + 0.3, bt(31) + 0.8, E.out) : 0;
    condCard(ctx, 1320, 330 + k * 170, k, ca, hl, done);
  }
  text(ctx, '早已实现 · 2001、2021 年诺奖', 1320, 410, { size: 20, color: MC.amberHi, alpha: a * ep(t, bt(31) + 0.6, bt(31) + 1.2), ls: 2 });
  // three catalyst types: L+L, L+R, R+R
  const ta = a * ep(t, bt(31) + 0.6, bt(31) + 1.4);
  if (ta > 0) {
    const slowK = ep(t, bt(32) + 0.4, bt(32) + 1.2);
    [['L', 'L', '左 + 左', 300], ['L', 'R', '左 + 右', 560], ['R', 'R', '右 + 右', 820]].forEach(([p, q, lab, x]) => {
      const mixed = p !== q, spin = t * (mixed ? lerp(2.2, 0.25, slowK) : 2.2);
      drawComplex(ctx, x, 520, 60, p, q, spin, ta, { dimMixed: slowK });
      text(ctx, lab, x, 650, { size: 26, weight: 700, color: mixed ? MC.silver : (p === 'L' ? MC.amberHi : MC.tealHi), alpha: ta * (mixed ? lerp(1, 0.55, slowK) : 1), ls: 3 });
      if (mixed) text(ctx, '慢', x, 380, { size: 34, weight: 900, color: MC.rose, alpha: ta * slowK, ls: 4 });
    });
    text(ctx, '金属会同时抓住两个手性分子', 560, 760, { size: 24, color: C.cream, alpha: 0.7 * ta, ls: 2 });
  }
}
// a batch: 14 left-handed and 6 right-handed ligands → 6 mixed (slow) + 4 left-left (fast)
const BATCH = (() => { const out = []; for (let k = 0; k < 10; k++) out.push(k < 6 ? ['L', 'R'] : ['L', 'L']); const r = rng(9); for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; } return out; })();
function sceneKagan(ctx, t) {
  if (t < bt(33) - 0.2 || t > bt(39) + 0.8) return;
  const a = inAt(t, 33);
  const ba = a * (1 - ep(t, bt(35) - 0.5, bt(35) + 0.05));
  if (ba > 0) {
    BATCH.forEach(([p, q], k) => {
      const x = 330 + (k % 5) * 190, y = 400 + Math.floor(k / 5) * 230, mixed = p !== q;
      const settle = ep(t, bt(33) + 0.1 + k * 0.06, bt(33) + 0.7 + k * 0.06, E.outBack);
      drawComplex(ctx, x, y + (1 - settle) * 40, 48, p, q, t * (mixed ? 0.25 : 2.4) + k, ba * settle, { dimMixed: 1 });
      if (!mixed) {
        for (let m = 0; m < 6; m++) {
          const u = frac((t - bt(33)) * 0.7 + m / 6 + k * 0.13);
          const px = lerp(x, 1420 + hash(k * 9 + m, 221) * 280, E.out(u)), py = lerp(y, 300 + hash(k * 9 + m, 222) * 420, E.out(u));
          ball(ctx, px, py, 7, AMB, ba * settle * Math.sin(u * Math.PI) * ep(t, bt(33) + 1.0, bt(33) + 1.6));
        }
      }
    });
    text(ctx, '催化剂：左 70% · 右 30%', 710, 270, { size: 28, weight: 700, color: C.cream, alpha: ba, ls: 2 });
    text(ctx, '一左一右的组合被「锁」住，转得很慢', 710, 860, { size: 22, color: C.cream, alpha: 0.6 * ba * ep(t, bt(33) + 1.0, bt(33) + 1.6), ls: 2 });
    text(ctx, '产物：几乎全是左手型', 1560, 270, { size: 28, weight: 700, color: MC.amberHi, alpha: ba * ep(t, bt(34), bt(34) + 0.6), ls: 2 });
    text(ctx, '（示意）', 1560, 860, { size: 20, color: C.cream, alpha: 0.45 * ba });
  }
  // the curve
  const pa = a * ep(t, bt(35), bt(35) + 0.6) * (1 - ep(t, bt(39) - 0.5, bt(39) + 0.05));
  if (pa > 0) {
    drawNLPlot(ctx, 640, 820, 640, 540, prog(t, bt(35) + 0.2, bt(37) - 0.3), pa, t);
    text(ctx, '曲线为示意 · 原始数据见 JACS 1986', 1500, 860, { size: 20, color: C.cream, alpha: 0.45 * pa });
    // [37,39] it can only amplify: start at zero, end at zero
    const oz = pa * ep(t, bt(37) + 0.2, bt(37) + 0.8);
    if (oz > 0) {
      const pr = 1 + 0.25 * Math.sin(t * 6);
      ctx.save(); ctx.globalAlpha *= oz; ctx.strokeStyle = MC.rose; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(640, 820, 26 * pr, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      text(ctx, '从 0 出发，结果还是 0', 900, 760, { size: 30, weight: 900, color: MC.rose, alpha: oz, ls: 3 });
      text(ctx, '它只能放大，不能无中生有', 900, 806, { size: 24, color: C.cream, alpha: 0.7 * oz, ls: 2 });
    }
  }
}

// ---------- ⑤ the third condition: Soai's molecule copies itself ----------
function sceneSoai(ctx, t) {
  if (t < bt(39) - 0.2 || t > bt(45) + 0.8) return;
  const a = inAt(t, 39) * outAt(t, 45);
  const ca = a * (1 - ep(t, bt(41) - 0.5, bt(41) + 0.05));
  if (ca > 0) {
    condCard(ctx, W / 2, 470, 2, ca, ep(t, bt(39) + 0.4, bt(39) + 1.0), 0);
    text(ctx, '弗兰克的第三个条件：自催化', W / 2, 600, { size: 24, color: C.cream, alpha: 0.65 * ca, ls: 3 });
    const cyc = frac((t - bt(39)) / 1.2), sp = E.inOut(clamp(cyc * 1.6));
    for (const sg of [-1, 1]) ball(ctx, W / 2 + sg * 70 * sp, 720, 18, AMB, ca * (sg < 0 || sp > 0.05 ? 1 : 0) * (1 - clamp((cyc - 0.85) * 6)));
    halo(ctx, W / 2, 720, 40, AMBHI, 0.4 * ca * (1 - sp));
  }
  const ma = a * ep(t, bt(41), bt(41) + 0.8);
  if (ma > 0) {
    const shrink = ep(t, bt(43) - 0.2, bt(43) + 0.8, E.inOut);
    const mx = lerp(W / 2, W / 2, shrink), my = lerp(480, 470, shrink), s = lerp(110, 26, shrink);
    halo(ctx, mx, my, s * 1.8, AMB, 0.25 * ma);
    drawMolecule(ctx, MOL_L, mx, my, s, t * 0.8, 0.35, { alpha: ma, tint: AMB, tintK: 0.35 });
    const la = ma * (1 - shrink);
    text(ctx, '5-嘧啶基烷醇', W / 2, 720, { size: 36, weight: 900, color: MC.amberHi, alpha: la, ls: 4 });
    text(ctx, '5-pyrimidyl alkanol', W / 2, 764, { size: 22, fam: F.serif, italic: true, color: C.cream, alpha: 0.6 * la });
    // autocatalysis: each copy makes more copies
    const u = ep(t, bt(43) + 0.4, bt(45) - 0.2, E.in);
    if (u > 0) {
      drawField(ctx, RUNPURE, W / 2, 470, 520, 300, u, ma, { r: 6 });
      const n = Math.max(1, Math.round(Math.pow(2, u * 8.5)));
      text(ctx, n.toLocaleString('en-US'), 1600, 470, { size: 80, fam: F.didot, color: MC.amberHi, alpha: ma, glow: 20 });
      text(ctx, '个同一只手的分子', 1600, 520, { size: 24, color: C.cream, alpha: 0.7 * ma, ls: 2 });
      text(ctx, '1 → 2 → 4 → 8 …', 1600, 570, { size: 24, fam: F.didot, color: C.cream, alpha: 0.5 * ma });
    }
  }
}

// ---------- ⑥ amplification: 1995 and 2003 ----------
function sceneAmplify(ctx, t) {
  if (t < bt(45) - 0.2 || t > bt(53) + 0.8) return;
  const a = inAt(t, 45) * outAt(t, 53);
  // 1995: 2% → 87%
  const a1 = a * (1 - ep(t, bt(47) - 0.5, bt(47) + 0.05));
  if (a1 > 0) {
    const u = ep(t, bt(45) + 0.5, bt(47) - 0.6, E.inOut);
    drawField(ctx, RUN95, W / 2, 470, 600, 290, Math.max(0.03, u), a1);
    const ee = lerp(0.02, 0.87, u);
    eeBar(ctx, W / 2, 830, 900, ee, a1, '多出的那一只手：' + Math.round(ee * 100) + '%');
  }
  // 2003: from nothing
  const a2 = a * ep(t, bt(47), bt(47) + 0.8);
  if (a2 > 0) {
    const u = ep(t, bt(49), bt(52) + 0.6, E.inOut);
    drawField(ctx, RUN03, W / 2, 470, 600, 290, u, a2, { t });
    // before the reaction: left and right blips appear and vanish in equal numbers
    const bl = a2 * (1 - ep(t, bt(49) - 0.2, bt(49) + 0.3));
    if (bl > 0) for (let k = 0; k < 6; k++) {
      const st = Math.floor(t * 5) - k, age = t * 5 - st; if (age > 3) continue;
      const i = Math.floor(hash(st * 7 + k, 251) * RUN03.field.length), [fx, fy] = RUN03.field[i];
      ball(ctx, W / 2 + fx * 600, 470 + fy * 290, 5, (st + k) % 2 ? AMB : TEA, bl * (1 - age / 3));
    }
    const ee = u < 0.08 ? 0.0 : Math.min(0.9999, 0.9999 * Math.pow((u - 0.08) / 0.92, 0.35));
    const label = u <= 0 ? '原料：不带手性' : '多出的那一只手：' + (ee > 0.995 ? (ee * 100).toFixed(2) : (ee * 100).toFixed(1)) + '%';
    eeBar(ctx, W / 2, 830, 900, ee, a2, label);
    const big = a2 * ep(t, bt(51) + 0.3, bt(51) + 1.0);
    if (big > 0) {
      text(ctx, '99.99%', W / 2, 480, { size: 150, fam: F.didot, color: MC.amberHi, alpha: big, glow: 40 });
      text(ctx, '同一只手', W / 2, 550, { size: 32, weight: 900, color: C.cream, alpha: big, ls: 10 });
    }
    text(ctx, '（粒子为示意，数字来自诺奖科普资料）', W / 2, 910, { size: 18, color: C.cream, alpha: 0.4 * a2 });
  }
}

// ---------- ⑦ chance decides; the search goes on ----------
function sceneChance(ctx, t) {
  if (t < bt(53) - 0.2 || t > bt(59) + 0.8) return;
  const a = inAt(t, 53) * outAt(t, 59);
  const ra = a * (1 - ep(t, bt(55) - 0.5, bt(55) + 0.05));
  if (ra > 0) {
    const u = ep(t, bt(53) + 0.3, bt(55) - 0.6, E.inOut);
    drawField(ctx, RUNA, 560, 470, 300, 260, u, ra, { r: 6 });
    drawField(ctx, RUNB, 1360, 470, 300, 260, u, ra, { r: 6 });
    text(ctx, '第一次', 560, 790, { size: 28, weight: 700, color: C.cream, alpha: ra, ls: 6 });
    text(ctx, '第二次', 1360, 790, { size: 28, weight: 700, color: C.cream, alpha: ra, ls: 6 });
    const res = ra * ep(t, bt(54) + 0.8, bt(54) + 1.4);
    text(ctx, '左手赢了', 560, 838, { size: 26, color: MC.amberHi, alpha: res, ls: 3 });
    text(ctx, '右手赢了', 1360, 838, { size: 26, color: MC.tealHi, alpha: res, ls: 3 });
    mirrorLine(ctx, W / 2, 230, 820, 1, ra * 0.6);
  }
  // one spark grows into a whole
  const sa = a * env(t, bt(55), bt(57) + 0.05, 0.6, 0.5);
  if (sa > 0) {
    const g = ep(t, bt(55) + 0.2, bt(57) - 0.6, E.inOut);
    for (let k = 0; k < 140; k++) {
      const ang = hash(k, 231) * Math.PI * 2, rr = Math.sqrt(hash(k, 232)) * 330 * g;
      ball(ctx, W / 2 + Math.cos(ang) * rr, 470 + Math.sin(ang) * rr * 0.75, 6, AMB, sa * clamp(g * 3 - hash(k, 233)));
    }
    halo(ctx, W / 2, 470, 30 + 140 * g, AMBHI, 0.35 * sa);
    text(ctx, '一点偶然', W / 2 - 420, 480, { size: 34, weight: 900, color: C.cream, alpha: sa * ep(t, bt(55) + 0.3, bt(55) + 0.9), ls: 6 });
    text(ctx, '→  单手性', W / 2 + 430, 480, { size: 34, weight: 900, color: C.goldHi, alpha: sa * ep(t, bt(56) + 0.3, bt(56) + 0.9), ls: 6 });
  }
  // the primordial soup: amino acids and sugars
  const pa = a * ep(t, bt(57), bt(57) + 0.8);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha *= pa;
    for (let k = 0; k < 5; k++) {
      ctx.strokeStyle = `rgba(120,150,220,${0.25 - k * 0.04})`; ctx.lineWidth = 2; ctx.beginPath();
      for (let x = 0; x <= W; x += 20) { const y = 720 + k * 34 + Math.sin(x * 0.006 + t * 0.8 + k) * 12; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.restore();
    for (let k = 0; k < 10; k++) {
      const x = 260 + k * 150, y = 470 + Math.sin(t * 1.1 + k * 1.7) * 30;
      if (k % 2) {
        ctx.save(); ctx.globalAlpha *= pa; ctx.translate(x, y); ctx.rotate(t * 0.3 + k); ctx.strokeStyle = k % 4 === 1 ? MC.amberHi : MC.tealHi; ctx.lineWidth = 3;
        ctx.beginPath(); for (let v = 0; v < 5; v++) { const an = (v / 5) * Math.PI * 2 - Math.PI / 2; v ? ctx.lineTo(Math.cos(an) * 28, Math.sin(an) * 28) : ctx.moveTo(Math.cos(an) * 28, Math.sin(an) * 28); } ctx.closePath(); ctx.stroke(); ctx.restore();
      } else drawMolecule(ctx, k % 4 === 0 ? MOL_L : MOL_R, x, y, 26, t * 0.6 + k, 0.3, { alpha: pa, tint: k % 4 === 0 ? AMB : TEA, tintK: 0.35 });
      text(ctx, '?', x + 34, y - 30, { size: 30, fam: F.didot, color: C.cream, alpha: 0.6 * pa });
    }
    text(ctx, '氨基酸 · 糖：能不能也这样「选」出一只手？', W / 2, 320, { size: 30, weight: 700, color: C.cream, alpha: pa, ls: 2 });
  }
}

// ---------- ⑦ AI picks catalysts ----------
function sceneAI(ctx, t) {
  if (t < bt(59) - 0.2 || t > bt(61) + 0.8) return;
  const a = inAt(t, 59) * outAt(t, 61);
  const cols = 32, rows = 25, sz = 21, gap = 4, x0 = 250, y0 = 230;
  const scan = ep(t, bt(59) + 0.3, bt(60) + 1.0);
  const score = (i, j) => 0.5 + 0.5 * Math.sin(i * 0.37 + j * 0.21) * Math.cos(i * 0.11 - j * 0.29) + 0.25 * (hash(i * 31 + j, 241) - 0.5);
  let best = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const s = clamp(score(i, j)), x = x0 + i * (sz + gap), y = y0 + j * (sz + gap);
    const lit = (i + j * 0.3) / (cols + rows * 0.3) < scan;
    const rgb = lit ? [lerp(60, 242, s), lerp(70, 182, s), lerp(110, 90, s)] : [60, 56, 76];
    ctx.save(); ctx.globalAlpha *= a * (lit ? 0.9 : 0.4); ctx.fillStyle = rgba(rgb, 1); ctx.fillRect(x, y, sz, sz); ctx.restore();
    if (lit && s > 0.93) best.push([x + sz / 2, y + sz / 2]);
  }
  const bl = a * ep(t, bt(60) + 0.8, bt(60) + 1.4);
  for (const [x, y] of best.slice(0, 6)) { ctx.save(); ctx.globalAlpha *= bl; ctx.strokeStyle = C.goldHi; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  const sx = x0 + scan * (cols * (sz + gap));
  if (scan > 0 && scan < 1) drawLine(ctx, sx, y0 - 10, sx, y0 + rows * (sz + gap), 1, MC.tealHi, 3, a);
  text(ctx, '800 多个候选催化剂', 1420, 420, { size: 34, weight: 900, color: C.cream, alpha: a, ls: 3, align: 'left' });
  text(ctx, '机器学习预测：', 1420, 480, { size: 26, color: C.cream, alpha: 0.7 * a, ls: 2, align: 'left' });
  text(ctx, '哪个造出的一只手更纯', 1420, 520, { size: 26, color: MC.amberHi, alpha: 0.9 * a, ls: 2, align: 'left' });
}

// ---------- ⑦ the prize ----------
const MILES = [['1848', '巴斯德'], ['1953', '弗兰克'], ['1986', '卡冈'], ['1995', '硖合宪三'], ['2003', '无中生有'], ['2026', '诺贝尔奖']];
function sceneNobel(ctx, t) {
  if (t < bt(61) - 0.2 || t > bt(65) + 0.8) return;
  const a = inAt(t, 61) * outAt(t, 65);
  const na = a * (1 - ep(t, bt(63) - 0.5, bt(63) + 0.05));
  if (na > 0) {
    drawMedal(ctx, 520, 470, 150, na, (1 - E.out(prog(t, bt(61) + 0.2, bt(61) + 1.8))) * 0.8);
    text(ctx, 'Henri B. Kagan', 1000, 380, { size: 50, fam: F.serif, italic: true, color: MC.amberHi, alpha: na, align: 'left' });
    text(ctx, '亨利 · 卡冈 · 1930 年生 · 法国', 1000, 424, { size: 24, color: C.cream, alpha: 0.75 * na, align: 'left', ls: 2 });
    text(ctx, 'Kenso Soai', 1000, 510, { size: 50, fam: F.serif, italic: true, color: MC.tealHi, alpha: na, align: 'left' });
    text(ctx, '硖合宪三 · 1950 年生 · 日本', 1000, 554, { size: 24, color: C.cream, alpha: 0.75 * na, align: 'left', ls: 2 });
    text(ctx, '“for the discovery of non-linear effects and autocatalysis in asymmetric organic synthesis”', 1000, 620, { size: 19, fam: F.serif, italic: true, color: C.cream, alpha: 0.55 * na, align: 'left' });
    const x0 = 300, x1 = 1620, y = 790, lp = ep(t, bt(61) + 0.6, bt(62) + 1.4);
    drawLine(ctx, x0, y, lerp(x0, x1, lp), y, 1, 'rgba(233,196,122,0.6)', 2, na);
    MILES.forEach(([yr, lab], i) => {
      const x = lerp(x0, x1, i / (MILES.length - 1)), on = ep(t, bt(61) + 0.6 + i * 0.3, bt(61) + 0.9 + i * 0.3);
      if (on <= 0) return;
      ball(ctx, x, y, i === MILES.length - 1 ? 11 : 7, i === MILES.length - 1 ? [233, 196, 122] : (i % 2 ? TEA : AMB), na * on);
      text(ctx, yr, x, y - 24, { size: 24, fam: F.didot, color: C.cream, alpha: na * on });
      text(ctx, lab, x, y + 40, { size: 20, color: C.cream, alpha: 0.65 * na * on, ls: 1 });
    });
  }
  // what it is for
  const ua = a * ep(t, bt(63), bt(63) + 0.8);
  if (ua > 0) {
    [['药物', 560, drawCapsule], ['香料', 960, drawFlower], ['农药', 1360, drawLeaf]].forEach(([lab, x, fn], i) => {
      const on = ep(t, bt(63) + 0.2 + i * 0.35, bt(63) + 0.8 + i * 0.35) * ua;
      fn(ctx, x - 70, 480, 1.1, AMB, on);
      fn(ctx, x + 70, 480, 1.1, TEA, on * 0.35);
      mirrorLine(ctx, x, 380, 580, on, on * 0.7);
      ctx.save(); ctx.globalAlpha *= on; checkMark(ctx, x - 70, 600, 32, ep(t, bt(64) + i * 0.25, bt(64) + 0.5 + i * 0.25, E.out), MC.amberHi, 5); ctx.restore();
      text(ctx, lab, x, 700, { size: 34, weight: 900, color: C.cream, alpha: on, ls: 8 });
    });
    text(ctx, '只要和生命打交道，就得分清左右手', W / 2, 820, { size: 26, color: MC.amberHi, alpha: ua * ep(t, bt(64), bt(64) + 0.7), ls: 3 });
  }
}

// ---------- ⑧ back to your hands ----------
function sceneOutro(ctx, t) {
  if (t < bt(65) - 0.2 || t > bt(67) + 0.8) return;
  const a = inAt(t, 65) * (1 - ep(t, bt(67) - 0.3, bt(67) + 0.4));
  const pick = ep(t, bt(66), bt(66) + 0.8);
  drawHand(ctx, 1160, 600, 0.9, false, a * lerp(1, 0.3, pick), { rgb: TEAHI });
  drawHand(ctx, 760, 600, 0.9, true, a, { rgb: AMBHI });
  halo(ctx, 760, 520, 260, AMB, 0.22 * a * pick);
  mirrorLine(ctx, W / 2, 230, 860, 1, a * 0.7);
}

const END_BAR = 67;
function sceneEnd(ctx, t) { sceneEndCard(ctx, t, END_BAR); }
const SCENES = [sceneHook, sceneTitle, scenePasteur, sceneChiral, sceneLab, sceneFrank, sceneKagan, sceneSoai, sceneAmplify, sceneChance, sceneAI, sceneNobel, sceneOutro, sceneEnd];
