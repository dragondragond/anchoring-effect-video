// Scenes for 冰立方. Bars: ① 1–9 hook · ② 9–11 title · ③ 11–23 ghost particle & messengers · ④ 23–37 idea & build
// · ⑤ 37–45 one detection · ⑥ 45–53 discoveries · ⑦ 53–65 source, AI, prize · ⑧ 65–68 back to the fingernail.

const fmtYi = (n) => Math.floor(n).toLocaleString('en-US');
const frac = (x) => x - Math.floor(x); // fractional part, always in [0, 1)
const SUN_DIR = [0.87, 0.5];

// ---------- ① hook ----------
function nailSparkles(ctx, cx, cy, s, t, alpha) {
  // tiny flashes inside the nail: neutrinos passing straight through
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const step = Math.floor(t * 12);
  for (let k = 0; k < 4; k++) {
    for (const st of [step, step - 1]) {
      const age = t * 12 - st, a = alpha * (1 - age / 2);
      if (a <= 0) continue;
      const x = cx + (hash(st * 7 + k, 61) - 0.5) * 150 * s, y = cy + (-150 + (hash(st * 7 + k, 62) - 0.5) * 220) * s;
      glowDot(ctx, x, y, 3.5, CYANHI, a * 0.8);
    }
  }
  ctx.restore();
}
function counterBlock(ctx, t, t0, x, y, alpha, label) {
  if (alpha <= 0) return;
  text(ctx, label, x, y - 92, { size: 28, color: C.cream, alpha: 0.8 * alpha, ls: 4 });
  const n = Math.max(0, t - t0) * NU_PER_SEC;
  text(ctx, fmtYi(n), x - 30, y + 20, { size: 118, fam: F.didot, color: IC.cyanHi, alpha, glow: 26, glowColor: 'rgba(110,210,255,0.6)' });
  text(ctx, '亿', x + 30 + (String(fmtYi(n)).length) * 31, y + 8, { size: 40, weight: 700, color: IC.cyanHi, alpha, align: 'left' });
  text(ctx, '每平方厘米、每秒约 650 亿个 · 主要来自太阳', x, y + 78, { size: 22, color: C.cream, alpha: 0.55 * alpha, ls: 2 });
}
function sceneHook(ctx, t) {
  if (t > bt(9) + 0.2) return;
  const out = 1 - ep(t, bt(9) - 0.25, bt(9) + 0.05);
  const zoom = ep(t, bt(7) - 0.2, bt(8) + 0.8);
  // sources: sun glow (left) and a distant galaxy (right)
  const sun = ep(t, bt(5), bt(5) + 1.4) * out;
  if (sun > 0) {
    const g = ctx.createRadialGradient(-120, 120, 20, -120, 120, 900);
    g.addColorStop(0, `rgba(255,214,150,${0.55 * sun})`); g.addColorStop(0.3, `rgba(255,170,90,${0.18 * sun})`); g.addColorStop(1, 'rgba(255,150,80,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    text(ctx, '太阳', 150, 250, { size: 26, color: IC.warm, alpha: sun * (1 - zoom), ls: 6 });
  }
  const gal = ep(t, bt(6), bt(6) + 1.2) * out;
  if (gal > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(1660, 200); ctx.rotate(0.4); ctx.scale(1, 0.4);
    glowDot(ctx, 0, 0, 30, [190, 200, 255], 0.7 * gal);
    for (let i = 0; i < 160; i++) { const r = Math.sqrt(hash(i, 91)) * 110, a = hash(i, 92) * Math.PI * 2 + r * 0.04; ctx.fillStyle = `rgba(210,220,255,${0.5 * gal * hash(i, 93)})`; ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, 2, 2); }
    ctx.restore();
    text(ctx, '宇宙深处', 1660, 300, { size: 26, color: '#c9d4ff', alpha: gal * (1 - zoom), ls: 6 });
  }
  // the fingertip
  const fa = ep(t, 0.6, 2.2) * (1 - ep(t, bt(7) + 0.1, bt(7) + 1.3));
  const fs = 0.92 * lerp(1, 0.08, E.inOut(zoom)), fx = lerp(760, W / 2, zoom), fy = lerp(560, 540, zoom);
  drawFinger(ctx, fx, fy, fs, fa * out);
  nailSparkles(ctx, fx, fy, fs, t, fa * out * ep(t, 1.6, 3.0));
  // Earth for the zoom-out
  const er = 230 * ep(t, bt(7) + 0.4, bt(8) + 1.0, E.outQuint);
  if (er > 1) {
    drawEarth(ctx, W / 2, 540, er, t, { alpha: out, south: 0 });
    text(ctx, '地球', W / 2, 540 + er + 56, { size: 26, color: C.cream, alpha: 0.7 * out * ep(t, bt(8), bt(8) + 0.5), ls: 8 });
  }
  // neutrino streaks (drawn over everything: they go straight through)
  streaks(ctx, t, { alpha: ep(t, 0.8, 2.6) * out, n: Math.round(lerp(90, 190, ep(t, bt(5), bt(8)))), dir: SUN_DIR });
  // counter
  const ca = env(t, bt(3) - 0.3, bt(7) + 0.6, 0.6, 0.6) * out;
  counterBlock(ctx, t, 0.8, 1360, 520, ca, '穿过你指甲盖的中微子');
  // flash into the title
  const fl = Math.pow(prog(t, bt(9) - 0.55, bt(9)), 2.2) * (t < bt(9) ? 1 : 0);
  if (fl > 0) { ctx.fillStyle = `rgba(220,245,255,${0.85 * fl})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- ② title ----------
function sceneTitle(ctx, t) {
  const t0 = bt(9), t1 = bt(11);
  if (t < t0 || t > t1 + 0.8) return;
  const ra = env(t, t0, t1 + 0.3, 0.4, 0.8);
  // the detector, slowly turning behind the title
  drawArray(ctx, camera(t * 0.18, -0.22, 3400, { cy: 560 }), { alpha: 0.5 * ra, domAlpha: 0.45, drawStrings: true });
  ctx.save(); ctx.translate(W / 2, TITLE_Y - 50); ctx.rotate(t * 0.03);
  for (let i = 0; i < 60; i++) {
    const ang = (i / 60) * Math.PI * 2, len = 380 + hash(i, 33) * 520;
    const g = ctx.createLinearGradient(0, 0, Math.cos(ang) * len, Math.sin(ang) * len);
    g.addColorStop(0, `rgba(140,215,255,${0.09 * ra})`); g.addColorStop(1, 'rgba(140,215,255,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 1 + hash(i, 34) * 2;
    ctx.beginPath(); ctx.moveTo(Math.cos(ang) * 60, Math.sin(ang) * 60); ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len); ctx.stroke();
  }
  ctx.restore();
  // particles converge into the title, then burst
  const pts = titlePoints(), conv = ep(t, t0, t0 + 1.1, E.outQuint), burst = ep(t, t1 - 0.15, t1 + 0.8, E.out);
  const pa = (t < t0 + 1.4 ? 1 - ep(t, t0 + 0.9, t0 + 1.4) : 0) + (t > t1 - 0.45 ? ep(t, t1 - 0.45, t1 - 0.15) * (1 - ep(t, t1 + 0.2, t1 + 0.8)) : 0);
  if (pa > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < TITLE_N; i++) {
      const ang = hash(i, 31) * Math.PI * 2, rad = 650 + hash(i, 32) * 600, k = E.outQuint(clamp(conv * 1.15 - hash(i, 5) * 0.15));
      const x = lerp(W / 2 + Math.cos(ang) * rad, pts[i][0], k) + Math.cos(ang) * 300 * burst, y = lerp(TITLE_Y + Math.sin(ang) * rad * 0.6, pts[i][1], k) + Math.sin(ang) * 200 * burst;
      ctx.fillStyle = rgba(CYANHI, pa); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  const ta = ep(t, t0 + 0.75, t0 + 1.4) * (1 - ep(t, t1 - 0.45, t1 + 0.05)), s = 1 + 0.03 * prog(t, t0, t1);
  ctx.save(); ctx.translate(W / 2, TITLE_Y); ctx.scale(s, s); ctx.translate(-W / 2, -TITLE_Y); drawTitleText(ctx, ta); ctx.restore();
  const sa = ep(t, t0 + 0.9, t0 + 1.7) * env(t, t0, t1, 0.01, 0.5);
  text(ctx, CONFIG.titleEn, W / 2, TITLE_Y - 200, { size: 26, fam: F.serif, ls: 12, color: IC.cyan, alpha: sa });
  const lp = ep(t, t0 + 1.4, t0 + 2.2, E.outQuint);
  drawLine(ctx, W / 2, TITLE_Y + 70, W / 2 - 240 * lp, TITLE_Y + 70, 1, IC.cyanDim, 1.2, sa);
  drawLine(ctx, W / 2, TITLE_Y + 70, W / 2 + 240 * lp, TITLE_Y + 70, 1, IC.cyanDim, 1.2, sa);
  const ua = ep(t, t0 + 1.8, t0 + 2.6) * env(t, t0, t1, 0.01, 0.5);
  richText(ctx, '【2026 诺贝尔物理学奖】 · 在南极冰下捕捉幽灵粒子', W / 2, TITLE_Y + 132, { size: 32, weight: 700, alpha: 0.9 * ua, ls: 4 });
  const fl = 1 - prog(t, t0, t0 + 0.7);
  if (fl > 0) { ctx.fillStyle = `rgba(220,245,255,${0.85 * fl * fl})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- ③ the ghost particle ----------
function neutrinoDot(ctx, x, y, r, alpha, t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glowDot(ctx, x, y, r * (1 + 0.08 * Math.sin(t * 6)), CYAN, alpha);
  glowDot(ctx, x, y, r * 0.45, WHITE, alpha);
  ctx.restore();
}
function sceneGhost(ctx, t) {
  if (t < bt(11) - 0.3 || t > bt(15) + 0.6) return;
  const a = ep(t, bt(11) - 0.2, bt(11) + 0.8) * (1 - ep(t, bt(15) - 0.5, bt(15) + 0.05));
  // [11,13] the particle and its properties
  const pa = a * (1 - ep(t, bt(13) - 0.1, bt(13) + 0.5));
  if (pa > 0) {
    const x = 700, y = 470;
    neutrinoDot(ctx, x, y, 34, pa, t);
    text(ctx, 'ν', x, y + 140, { size: 84, fam: F.serif, italic: true, color: IC.cyanHi, alpha: pa });
    text(ctx, '中微子', x, y + 190, { size: 28, color: C.cream, alpha: 0.75 * pa, ls: 6 });
    ['不带电', '质量极小', '几乎不与物质作用'].forEach((s, i) => {
      const ca = ep(t, bt(11) + 0.8 + i * 0.5, bt(11) + 1.4 + i * 0.5) * pa;
      const cy = 360 + i * 110, cx = 1220 + (1 - E.out(ca)) * 40;
      bubble(ctx, cx, cy, 380, 76, 0, ca, { color: IC.cyan, fill: 'rgba(10,30,50,0.85)' });
      text(ctx, s, cx, cy + 12, { size: 32, weight: 700, color: IC.cyanHi, alpha: ca, ls: 4 });
      drawLine(ctx, x + 60, y, cx - 190, cy, ca, 'rgba(95,212,255,0.35)', 1.5, 1);
    });
  }
  // [13,15] a lead wall that keeps getting thicker; the neutrino keeps passing
  const wa = a * ep(t, bt(13) + 0.1, bt(13) + 0.8);
  if (wa > 0) {
    const steps = [['1 米', 40], ['1 公里', 130], ['地球直径', 300], ['光年量级', 760]];
    const u = clamp((t - (bt(13) + 0.6)) / ((bt(15) - 0.5) - (bt(13) + 0.6))) * (steps.length - 1);
    const i = Math.min(steps.length - 1, Math.floor(u)), f = E.inOut(clamp(u - i));
    const w = i < steps.length - 1 ? lerp(steps[i][1], steps[i + 1][1], f) : steps[i][1];
    const label = f > 0.5 && i < steps.length - 1 ? steps[i + 1][0] : steps[i][0];
    const cx = W / 2, top = 290, bot = 700;
    ctx.save(); ctx.globalAlpha *= wa;
    const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    g.addColorStop(0, '#3a4048'); g.addColorStop(0.5, '#5a626c'); g.addColorStop(1, '#2e333a');
    ctx.fillStyle = g; ctx.fillRect(cx - w / 2, top, w, bot - top);
    ctx.strokeStyle = 'rgba(200,210,220,0.25)'; ctx.lineWidth = 1;
    for (let k = 0; k < 14; k++) { const yy = top + (k + 0.5) * (bot - top) / 14; ctx.beginPath(); ctx.moveTo(cx - w / 2, yy); ctx.lineTo(cx + w / 2, yy); ctx.stroke(); }
    ctx.restore();
    text(ctx, '铅 Pb', cx, top - 22, { size: 26, color: C.cream, alpha: 0.7 * wa, ls: 4 });
    text(ctx, '墙厚：' + label, cx, bot + 70, { size: 40, weight: 900, color: i === steps.length - 1 && f > 0.5 ? C.goldHi : C.cream, alpha: wa, ls: 4 });
    // neutrinos fly through, one every ~0.8 s
    for (let k = 0; k < 3; k++) {
      const ph = frac((t - bt(13)) / 0.8 + k / 3), x = lerp(120, W - 120, ph), yy = 400 + k * 70;
      const inside = Math.abs(x - cx) < w / 2;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const tg = ctx.createLinearGradient(x - 220, yy, x, yy); tg.addColorStop(0, rgba(CYAN, 0)); tg.addColorStop(1, rgba(CYAN, 0.6 * wa));
      ctx.strokeStyle = tg; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 220, yy); ctx.lineTo(x, yy); ctx.stroke();
      ctx.restore();
      neutrinoDot(ctx, x, yy, 12, wa * (inside ? 0.75 : 1), t);
    }
  }
}

// ---------- ③ three messengers ----------
const SRC = [300, 470], EARTH = [1640, 470];
function crPath(i, u) {
  // a charged cosmic ray: wanders through magnetic fields and arrives from a random direction
  const th = Math.PI * (0.55 + hash(i, 101) * 0.9) + (hash(i, 102) < 0.5 ? Math.PI : 0) * 0.2;
  const end = [EARTH[0] + Math.cos(th) * 92, EARTH[1] + Math.sin(th) * 92];
  const bx = lerp(SRC[0], end[0], u), by = lerp(SRC[1], end[1], u);
  const amp = (150 + hash(i, 103) * 200) * Math.sin(Math.PI * u), fq = 2 + hash(i, 104) * 2.5, ph = hash(i, 105) * 6;
  return [bx + Math.sin(u * Math.PI * fq * 1.3 + ph) * amp * 0.35, by + Math.cos(u * Math.PI * fq + ph) * amp];
}
function sceneMessengers(ctx, t) {
  if (t < bt(15) - 0.3 || t > bt(23) + 0.8) return;
  const a = ep(t, bt(15) + 0.0, bt(15) + 0.9) * (1 - ep(t, bt(23) - 0.5, bt(23) + 0.05));
  drawBlazar(ctx, SRC[0], SRC[1], 56, t, 0.6, a);
  drawEarth(ctx, EARTH[0], EARTH[1], 88, t, { alpha: a, south: 0 });
  text(ctx, '宇宙中的源头', SRC[0], SRC[1] + 150, { size: 24, color: C.cream, alpha: 0.7 * a, ls: 4 });
  text(ctx, '地球', EARTH[0], EARTH[1] + 150, { size: 24, color: C.cream, alpha: 0.7 * a, ls: 4 });
  // magnetic fields
  const mf = a * ep(t, bt(17), bt(17) + 1.0);
  if (mf > 0) {
    ctx.save(); ctx.strokeStyle = `rgba(170,140,255,${0.14 * mf})`; ctx.lineWidth = 1.5;
    for (let k = 0; k < 7; k++) {
      ctx.beginPath();
      for (let s = 0; s <= 80; s++) { const x = 560 + s * 10, y = 470 + Math.sin(s * 0.18 + k * 0.9 + t * 0.4) * (60 + k * 28) + (k - 3) * 30; s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.restore();
  }
  // cosmic rays: red, scrambled
  const cra = a * ep(t, bt(17), bt(17) + 0.4) * lerp(1, 0.35, ep(t, bt(19), bt(19) + 0.8));
  if (cra > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) {
      const t0 = bt(17) + i * 0.32, u = clamp((t - t0) / 2.4);
      if (u <= 0) continue;
      ctx.beginPath();
      for (let k = 0; k <= 50; k++) { const uu = Math.max(0, u - 0.45) + (k / 50) * Math.min(u, 0.45); const [x, y] = crPath(i, uu); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.strokeStyle = rgba(REDC, 0.5 * cra); ctx.lineWidth = 2; ctx.stroke();
      if (u < 1) { const [x, y] = crPath(i, u); glowDot(ctx, x, y, 6, REDC, cra); }
    }
    ctx.restore();
    text(ctx, '宇宙射线：带电，被磁场扭弯，认不出来路', W / 2 - 10, 250, { size: 26, weight: 700, color: IC.red, alpha: cra / Math.max(0.35, lerp(1, 0.35, ep(t, bt(19), bt(19) + 0.8))) * (t < bt(19) + 0.8 ? 1 : 0.5), ls: 2 });
  }
  // gamma rays: gold, absorbed on the way
  const ga = a * ep(t, bt(19), bt(19) + 0.4) * lerp(1, 0.4, ep(t, bt(21), bt(21) + 0.8));
  if (ga > 0) {
    const fog = ctx.createLinearGradient(780, 0, 1150, 0);
    fog.addColorStop(0, 'rgba(233,196,122,0)'); fog.addColorStop(0.5, `rgba(233,196,122,${0.10 * ga})`); fog.addColorStop(1, 'rgba(233,196,122,0)');
    ctx.fillStyle = fog; ctx.fillRect(780, 330, 370, 280);
    text(ctx, '宇宙背景光', 965, 640, { size: 20, color: C.goldHi, alpha: 0.6 * ga, ls: 4 });
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) {
      const t0 = bt(19) + i * 0.27, u = clamp((t - t0) / 1.6), y = SRC[1] + (hash(i, 111) - 0.5) * 90;
      if (u <= 0) continue;
      const stop = 0.4 + hash(i, 112) * 0.22, x = lerp(SRC[0] + 70, EARTH[0], Math.min(u, stop));
      const alive = u < stop ? 1 : 1 - clamp((u - stop) * 8);
      if (alive <= 0) continue;
      ctx.strokeStyle = rgba(GOLD, 0.55 * ga * alive); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(Math.max(SRC[0] + 70, x - 160), y); ctx.lineTo(x, y); ctx.stroke();
      glowDot(ctx, x, y, u < stop ? 5 : 9 * (1 - alive) + 3, GOLD, ga * alive);
    }
    ctx.restore();
    text(ctx, '高能伽马射线：半路被背景光吸收', W / 2 - 10, 720, { size: 26, weight: 700, color: C.goldHi, alpha: ga / Math.max(0.4, lerp(1, 0.4, ep(t, bt(21), bt(21) + 0.8))) * (t < bt(21) + 0.8 ? 1 : 0.5), ls: 2 });
  }
  // neutrinos: straight
  const na = a * ep(t, bt(21), bt(21) + 0.3);
  if (na > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) {
      const t0 = bt(21) + k * 0.7, u = clamp((t - t0) / 1.2), y = SRC[1] + (k - 1) * 14;
      if (u <= 0) continue;
      const x = lerp(SRC[0] + 60, EARTH[0] - 92, E.inOut(u));
      const lg = ctx.createLinearGradient(SRC[0], y, x, y);
      lg.addColorStop(0, rgba(CYAN, 0.15 * na)); lg.addColorStop(1, rgba(CYANHI, 0.9 * na));
      ctx.strokeStyle = lg; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(SRC[0] + 60, y); ctx.lineTo(x, y); ctx.stroke();
      glowDot(ctx, x, y, 10, CYANHI, na);
      if (u >= 1) glowDot(ctx, EARTH[0] - 92, y, 18 * (1 - clamp((t - t0 - 1.2) * 1.5)), CYANHI, na);
    }
    ctx.restore();
    text(ctx, '中微子：不带电、几乎不被吸收，笔直飞来', W / 2 - 10, 420, { size: 28, weight: 900, color: IC.cyanHi, alpha: na, ls: 2, glow: 14, glowColor: 'rgba(110,210,255,0.5)' });
  }
}

// ---------- ④ one cubic kilometre ----------
function sceneCube(ctx, t) {
  if (t < bt(23) - 0.3 || t > bt(25) + 0.7) return;
  const a = ep(t, bt(23) + 0.0, bt(23) + 0.8) * (1 - ep(t, bt(25) - 0.5, bt(25) + 0.05));
  const cam = camera(0.62 + (t - bt(23)) * 0.1, -0.3, 2550, { cx: 760, cy: 520 });
  const V = [];
  for (const x of [-500, 500]) for (const y of [-500, 500]) for (const z of [-500, 500]) V.push([x, y, z]);
  const E3 = [[0, 1], [0, 2], [1, 3], [2, 3], [4, 5], [4, 6], [5, 7], [6, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const dp = ep(t, bt(23) + 0.1, bt(23) + 1.3, E.out);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  E3.forEach(([i, j], k) => {
    const p = cam.project(V[i]), q = cam.project(V[j]);
    if (!p || !q) return;
    const kk = clamp(dp * 1.4 - k * 0.03);
    drawLine(ctx, p[0], p[1], lerp(p[0], q[0], kk), lerp(p[1], q[1], kk), 1, IC.cyan, 2.5, a * 0.9);
  });
  ctx.restore();
  // faint faces + inner ice
  const fy = cam.project([0, 0, 0]);
  if (fy) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, fy[0], fy[1], 120, [80, 180, 255], 0.12 * a * dp); ctx.restore(); }
  // Burj Khalifa for scale: same scale as the cube, standing on the ground just to its right
  const proj = V.map((v) => cam.project(v)).filter(Boolean);
  const right = Math.max(...proj.map((p) => p[0])), sc = cam.project([0, 0, 0])[3];
  const bottomY = Math.max(...proj.map((p) => p[1]));
  {
    const hpx = 828 * sc, wpx = hpx * 0.09, bx = right + 150, by = bottomY - 20;
    const tiers = [[1, 0], [0.82, 0.22], [0.62, 0.45], [0.44, 0.62], [0.28, 0.76], [0.14, 0.86], [0.04, 1]];
    const ba = a * ep(t, bt(23) + 0.9, bt(23) + 1.6);
    ctx.save(); ctx.globalAlpha *= ba; ctx.fillStyle = 'rgba(236,227,207,0.6)';
    ctx.beginPath(); ctx.moveTo(bx - wpx, by);
    tiers.forEach(([w, h]) => { ctx.lineTo(bx - wpx * w, by - hpx * h); });
    tiers.slice().reverse().forEach(([w, h]) => { ctx.lineTo(bx + wpx * w, by - hpx * h); });
    ctx.lineTo(bx + wpx, by); ctx.closePath(); ctx.fill(); ctx.restore();
    drawLine(ctx, bx - 60, by, bx + 60, by, 1, 'rgba(236,227,207,0.4)', 1.5, ba);
    text(ctx, '哈利法塔', bx, by + 38, { size: 22, color: C.cream, alpha: 0.8 * ba, ls: 2 });
    text(ctx, '828 米', bx, by + 66, { size: 20, fam: F.serif, color: C.cream, alpha: 0.6 * ba });
  }
  const la = a * ep(t, bt(24), bt(24) + 0.8);
  const e1 = cam.project([-500, -500, 500]), e2 = cam.project([500, -500, 500]);
  if (e1 && e2) text(ctx, '1 公里', (e1[0] + e2[0]) / 2, (e1[1] + e2[1]) / 2 + 44, { size: 26, color: IC.cyanHi, alpha: la, ls: 4 });
  text(ctx, '一立方公里的冰', 1560, 430, { size: 40, weight: 900, color: IC.cyanHi, alpha: la, ls: 4 });
  text(ctx, '约 9 亿吨', 1560, 490, { size: 28, color: C.cream, alpha: 0.7 * la, ls: 4 });
}

// ---------- ④ Antarctica ----------
function sceneAntarctica(ctx, t) {
  if (t < bt(25) - 0.3 || t > bt(27) + 0.8) return;
  const a = ep(t, bt(25) + 0.0, bt(25) + 0.8) * (1 - ep(t, bt(27) - 0.1, bt(27) + 0.6));
  const turn = ep(t, bt(25), bt(25) + 1.8), zoom = ep(t, bt(26) + 0.4, bt(27) + 0.5, E.in);
  const R = lerp(250, 2200, zoom), cx = lerp(760, 760, zoom), cy = lerp(520, lerp(520, -900, zoom), zoom);
  const e = drawEarth(ctx, cx, cy, R, t * 0.3, { alpha: a, south: turn });
  // pin on the South Pole
  const pa = a * ep(t, bt(25) + 1.5, bt(25) + 2.1) * (1 - zoom);
  if (pa > 0) {
    const [px, py] = e.pole;
    ctx.save(); ctx.globalAlpha *= pa; ctx.fillStyle = C.goldHi; ctx.shadowColor = C.gold; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(px, py - 34, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(px - 7, py - 30); ctx.lineTo(px, py); ctx.lineTo(px + 7, py - 30); ctx.fill(); ctx.restore();
    text(ctx, '南极点', px + 24, py - 26, { size: 28, weight: 700, color: C.goldHi, alpha: pa, align: 'left', ls: 4 });
  }
  // the 1988 paper
  const ca = a * ep(t, bt(25) + 0.5, bt(25) + 1.3) * (1 - ep(t, bt(26), bt(26) + 0.6));
  paperCard(ctx, 1440, 500, 520, 330, 0.03, ca, [
    { text: 'HIGH ENERGY NEUTRINO DETECTION', size: 22, ls: 2 },
    { text: 'IN DEEP POLAR ICE', size: 22, ls: 2 },
    { text: 'F. Halzen  &  J. G. Learned  ·  1988', size: 18, italic: true },
  ], 4);
}

// ---------- ④ the ice, in cross-section ----------
const ICE = { top: 230, bottom: 930, depth: 2800, x0: 300, x1: 1720 };
const dY = (m) => ICE.top + (m / ICE.depth) * (ICE.bottom - ICE.top);
function sceneIceSection(ctx, t) {
  if (t < bt(27) - 0.3 || t > bt(33) + 0.8) return;
  const a = ep(t, bt(27) - 0.2, bt(27) + 0.8) * (1 - ep(t, bt(33) - 0.55, bt(33) + 0.1));
  ctx.save(); ctx.globalAlpha *= a;
  // ice body
  const g = ctx.createLinearGradient(0, ICE.top, 0, ICE.bottom);
  g.addColorStop(0, 'rgba(190,225,245,0.30)'); g.addColorStop(0.15, 'rgba(90,160,210,0.20)'); g.addColorStop(1, 'rgba(20,60,100,0.25)');
  ctx.fillStyle = g; ctx.fillRect(ICE.x0, ICE.top, ICE.x1 - ICE.x0, ICE.bottom - ICE.top);
  ctx.strokeStyle = 'rgba(200,235,255,0.06)'; ctx.lineWidth = 1;
  for (let k = 0; k < 60; k++) { const y = ICE.top + 8 + k * 11.5 + Math.sin(k * 1.7) * 3; ctx.beginPath(); ctx.moveTo(ICE.x0, y); ctx.lineTo(ICE.x1, y + Math.sin(k) * 4); ctx.stroke(); }
  // dust layer near 2000 m
  ctx.fillStyle = 'rgba(120,100,80,0.10)'; ctx.fillRect(ICE.x0, dY(1980), ICE.x1 - ICE.x0, 26);
  // surface
  ctx.fillStyle = 'rgba(240,250,255,0.85)'; ctx.fillRect(ICE.x0, ICE.top - 4, ICE.x1 - ICE.x0, 6);
  ctx.restore();
  text(ctx, '冰面', ICE.x1 - 10, ICE.top - 20, { size: 22, color: C.cream, alpha: 0.7 * a, align: 'right', ls: 4 });
  // depth axis
  for (const m of [0, 500, 1000, 1500, 2000, 2500]) {
    drawLine(ctx, ICE.x0 - 14, dY(m), ICE.x0, dY(m), 1, IC.cyanDim, 1.5, a);
    text(ctx, m + ' 米', ICE.x0 - 24, dY(m) + 8, { size: 20, fam: F.serif, color: C.cream, alpha: 0.6 * a, align: 'right' });
  }
  // bubbles in the upper ice: shrink with depth, gone below ~1400 m
  const bubA = a * (1 - 0.5 * ep(t, bt(31) + 0.5, bt(32)));
  ctx.save();
  for (let i = 0; i < 260; i++) {
    const m = Math.pow(hash(i, 121), 1.6) * 1400, x = ICE.x0 + 20 + hash(i, 122) * (ICE.x1 - ICE.x0 - 40);
    const r = (1 - m / 1500) * (2 + hash(i, 123) * 4);
    ctx.globalAlpha = bubA * (0.25 + 0.35 * hash(i, 124)) * (0.7 + 0.3 * Math.sin(t * 2 + i));
    ctx.strokeStyle = '#e8f6ff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, dY(m) + Math.sin(t + i) * 1.5, r, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  // [27,29] deep ice is clear: a pulse of light travels far
  const ca = a * env(t, bt(27) + 0.6, bt(29) + 0.2, 0.4, 0.5);
  if (ca > 0) {
    const y = dY(2150), x0 = 560, p = ep(t, bt(27) + 0.8, bt(28) + 1.4, E.out);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const lg = ctx.createLinearGradient(x0, y, x0 + 1050 * p, y);
    lg.addColorStop(0, rgba(CYANHI, 0.9 * ca)); lg.addColorStop(1, rgba(CYAN, 0.05 * ca));
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + 1050 * p, y - 40 * p); ctx.lineTo(x0 + 1050 * p, y + 40 * p); ctx.closePath(); ctx.fill();
    glowDot(ctx, x0, y, 14, CYANHI, ca);
    ctx.restore();
    text(ctx, '深处的冰：已知最清澈的冰', 1100, y - 70, { size: 28, weight: 700, color: IC.cyanHi, alpha: ca, ls: 3 });
  }
  // [29,31] AMANDA too shallow: light scatters off bubbles
  const am = a * env(t, bt(29), bt(31) + 0.6, 0.4, 0.6);
  if (am > 0) {
    const sx = [760, 830, 900, 970];
    for (const x of sx) {
      drawLine(ctx, x, ICE.top, x, dY(1000), 1, 'rgba(236,227,207,0.25)', 1, am);
      for (let k = 0; k < 6; k++) { ctx.save(); ctx.globalAlpha *= am; ctx.fillStyle = C.goldHi; ctx.beginPath(); ctx.arc(x, dY(800 + k * 40), 5, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    }
    text(ctx, 'AMANDA · 800–1000 米', 865, dY(800) - 30, { size: 22, color: C.goldHi, alpha: am, ls: 2 });
    // a zig-zag random walk of light
    const p = ep(t, bt(29) + 0.4, bt(30) + 1.0);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(CYANHI, 0.8 * am); ctx.lineWidth = 2.5;
    ctx.beginPath(); let x = 1050, y = dY(900); ctx.moveTo(x, y);
    const N = 26;
    for (let k = 0; k < N * p; k++) { const ang = hash(k, 131) * Math.PI * 2; x += Math.cos(ang) * 34; y += Math.sin(ang) * 26; ctx.lineTo(x, y); }
    ctx.stroke(); glowDot(ctx, 1050, dY(900), 10, CYANHI, am); ctx.restore();
    ctx.save(); ctx.globalAlpha *= am; seal(ctx, 1260, dY(780), 92, '气泡', prog(t, bt(30) + 0.3, bt(30) + 0.7), -0.1); ctx.restore();
  }
  // [31,33] go deeper: 1500–2000 m, bubbles gone, light goes straight
  const dp = a * ep(t, bt(31), bt(31) + 0.4);
  if (dp > 0) {
    const dx = 1300, d = ep(t, bt(31) + 0.1, bt(32) + 0.2, E.inOut);
    drawLine(ctx, dx, ICE.top, dx, dY(2000 * d), 1, 'rgba(236,227,207,0.5)', 2, dp);
    ctx.save(); ctx.globalAlpha *= dp; ctx.fillStyle = C.goldHi; ctx.shadowColor = C.gold; ctx.shadowBlur = 14;
    roundRect(ctx, dx - 9, dY(2000 * d) - 26, 18, 30, 6); ctx.fill(); ctx.restore();
    const ok = ep(t, bt(32) + 0.2, bt(32) + 1.0) * dp;
    if (ok > 0) {
      for (const x of [1220, 1300, 1380, 1460]) {
        drawLine(ctx, x, dY(1500), x, dY(2000), 1, 'rgba(236,227,207,0.3)', 1, ok);
        for (let k = 0; k < 6; k++) { ctx.save(); ctx.globalAlpha *= ok; ctx.fillStyle = C.goldHi; ctx.beginPath(); ctx.arc(x, dY(1520 + k * 90), 5, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const y = dY(1750), p = ep(t, bt(32) + 0.6, bt(32) + 1.6);
      ctx.strokeStyle = rgba(CYANHI, 0.85 * ok); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1180, y); ctx.lineTo(lerp(1180, 1600, p), y); ctx.stroke();
      glowDot(ctx, 1180, y, 10, CYANHI, ok); ctx.restore();
      text(ctx, '1500 米以下：压力让气泡消失', 1400, dY(1440), { size: 26, weight: 700, color: IC.cyanHi, alpha: ok, ls: 2 });
      checkMark(ctx, 1640, dY(1750), 34, ep(t, bt(32) + 1.2, bt(32) + 1.7, E.out), IC.cyanHi, 5);
    }
  }
}

// ---------- ④ building IceCube: top view → 3D ----------
const SEASONS = [[1, '2004–05', 'IC1'], [9, '2005–06', 'IC9'], [22, '2006–07', 'IC22'], [40, '2007–08', 'IC40'], [59, '2008–09', 'IC59'], [79, '2009–10', 'IC79'], [86, '2010–11', 'IC86']];
function sceneBuild(ctx, t) {
  if (t < bt(33) - 0.3 || t > bt(37) + 0.8) return;
  const a = ep(t, bt(33) + 0.05, bt(33) + 0.8) * (1 - ep(t, bt(37) - 0.2, bt(37) + 0.7));
  const tilt = ep(t, bt(35), bt(35) + 1.8, E.inOut);
  const pitch = lerp(-Math.PI / 2 + 0.001, -0.3, tilt), yaw = lerp(0, 0.5, tilt) + (t - bt(33)) * 0.04;
  const cam = camera(yaw, pitch, lerp(2900, 2600, tilt), { cy: lerp(520, 500, tilt), target: [0, lerp(500, 0, tilt), 0] });
  // deployment by season (cumulative string counts are the real detector configurations)
  const sp = clamp((t - (bt(33) + 0.3)) / (bt(35) - 0.3 - (bt(33) + 0.3)));
  const si = Math.min(SEASONS.length - 1, Math.floor(sp * SEASONS.length));
  const prev = si ? SEASONS[si - 1][0] : 0, cur = SEASONS[si][0];
  const within = clamp(sp * SEASONS.length - si);
  const count = t > bt(35) - 0.3 ? 86 : prev + (cur - prev) * E.out(within);
  const depth = ep(t, bt(35) + 0.2, bt(35) + 2.0);
  drawArray(ctx, cam, { alpha: a, strings: count, depth, domAlpha: 0.85, drawStrings: depth > 0, domSize: lerp(2.6, 1, tilt) });
  // new holes: steam puff + ripple
  for (let k = 0; k < Math.ceil(count); k++) {
    const si2 = DET.order[k], born = bt(33) + 0.3 + ((k + 0.5) / 86) * (bt(35) - 0.6 - bt(33));
    const age = t - born; if (age < 0 || age > 1.2) continue;
    const p = cam.project([DET.strings[si2][0], 500, DET.strings[si2][1]]); if (!p) continue;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glowDot(ctx, p[0], p[1], 10 + age * 18, [220, 240, 255], a * 0.5 * (1 - age / 1.2));
    ctx.strokeStyle = rgba(CYAN, a * 0.6 * (1 - age / 1.2)); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p[0], p[1], 6 + age * 40, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  // HUD
  const ha = a * (1 - ep(t, bt(35) + 0.4, bt(35) + 1.0));
  if (ha > 0) {
    text(ctx, SEASONS[si][1] + ' 南极夏季', 1560, 420, { size: 28, color: C.cream, alpha: ha, ls: 2 });
    text(ctx, Math.floor(count) + ' / 86', 1560, 500, { size: 72, fam: F.didot, color: IC.cyanHi, alpha: ha, glow: 18, glowColor: 'rgba(110,210,255,0.5)' });
    text(ctx, '探测器配置 ' + SEASONS[si][2], 1560, 548, { size: 22, fam: F.serif, color: C.cream, alpha: 0.6 * ha });
    text(ctx, '热水钻 · 孔径 60 厘米 · 深 2450 米', 1560, 600, { size: 22, color: C.cream, alpha: 0.6 * ha, ls: 2 });
  }
  const da = a * ep(t, bt(35) + 0.6, bt(35) + 1.4);
  if (da > 0) {
    const n = Math.round(5160 * depth);
    text(ctx, n.toLocaleString('en-US'), 1600, 470, { size: 92, fam: F.didot, color: IC.cyanHi, alpha: da, glow: 22, glowColor: 'rgba(110,210,255,0.5)' });
    text(ctx, '个光传感器', 1600, 520, { size: 28, color: C.cream, alpha: 0.8 * da, ls: 4 });
    text(ctx, '冰下 1450 – 2450 米', 1600, 570, { size: 24, color: C.cream, alpha: 0.6 * da, ls: 2 });
  }
}

// ---------- ⑤ one detection ----------
const DETECT = (() => {
  const dir = [0.33, 1, -0.22], n = Math.hypot(...dir), d = dir.map((v) => v / n);
  const vertex = [-170, -440, 110];
  return { d, vertex, hits: trackHits(vertex, d, 1.0) };
})();
function sceneDetect(ctx, t) {
  if (t < bt(37) - 0.3 || t > bt(45) + 0.8) return;
  const a = ep(t, bt(37) - 0.2, bt(37) + 1.0) * (1 - ep(t, bt(45) - 0.5, bt(45) + 0.05));
  const cam = camera(0.35 + (t - bt(37)) * 0.045, -0.16, 2350, { cy: 500 });
  const { d, vertex, hits } = DETECT;
  const L = 1250, mu = ep(t, bt(41), bt(43) + 0.4, E.inOut);   // muon progress along the track
  const reveal = mu;                                            // hits light up as the muon passes
  // dark array, faint twinkles
  drawArray(ctx, cam, { alpha: a, domAlpha: 0.32, hits: t > bt(41) ? hits : null, reveal, hitScale: 1.1 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 18; k++) {
    const st = Math.floor(t * 3) + k * 13, dm = DET.doms[Math.floor(hash(st, 141) * DET.doms.length)], p = cam.project(dm.p);
    if (p) glowDot(ctx, p[0], p[1], 3, [160, 220, 255], 0.25 * a * Math.sin(((t * 3) % 1) * Math.PI));
  }
  ctx.restore();
  // incoming neutrino from below (through the Earth)
  const inc = ep(t, bt(39) + 0.3, bt(41) - 0.05, E.in);
  if (inc > 0 && t < bt(41) + 0.6) {
    const from = [vertex[0] - d[0] * 1500, vertex[1] - d[1] * 1500, vertex[2] - d[2] * 1500];
    const head = [lerp(from[0], vertex[0], inc), lerp(from[1], vertex[1], inc), lerp(from[2], vertex[2], inc)];
    const p0 = cam.project(from), p1 = cam.project(head);
    if (p0 && p1) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 60;
      ctx.strokeStyle = rgba(CYAN, 0.7 * a * (1 - ep(t, bt(41), bt(41) + 0.6))); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); ctx.setLineDash([]);
      glowDot(ctx, p1[0], p1[1], 9, CYANHI, a * (t < bt(41) ? 1 : 0)); ctx.restore();
      text(ctx, 'ν', p1[0] + 26, p1[1] + 10, { size: 44, fam: F.serif, italic: true, color: IC.cyanHi, alpha: a * (t < bt(41) ? 1 : 0) });
    }
  }
  // inset: the path through the Earth
  const ia = a * env(t, bt(39) + 0.2, bt(41) + 1.0, 0.5, 0.6);
  if (ia > 0) {
    const ix = 270, iy = 760, R = 120;
    ctx.save(); ctx.globalAlpha *= ia;
    ctx.fillStyle = 'rgba(18,58,99,0.9)'; ctx.beginPath(); ctx.arc(ix, iy, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(150,210,255,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = 'rgba(235,246,255,0.9)'; ctx.beginPath(); ctx.ellipse(ix, iy - R + 6, 34, 9, 0, 0, Math.PI * 2); ctx.fill();
    const p = ep(t, bt(39) + 0.3, bt(41) - 0.05, E.in);
    ctx.strokeStyle = rgba(CYANHI, 0.95); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ix + 40, iy + R + 30); ctx.lineTo(lerp(ix + 40, ix, p), lerp(iy + R + 30, iy - R + 4, p)); ctx.stroke();
    ctx.restore();
    text(ctx, '地球', ix, iy + 10, { size: 22, color: C.cream, alpha: 0.7 * ia, ls: 6 });
    text(ctx, '冰立方', ix + 56, iy - R - 6, { size: 20, color: IC.cyanHi, alpha: ia, align: 'left', ls: 2 });
  }
  // interaction flash + muon with its Cherenkov cone
  if (t > bt(41) - 0.05) {
    const fl = 1 - clamp((t - bt(41)) / 0.6);
    const pv = cam.project(vertex);
    if (pv && fl > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, pv[0], pv[1], 40 * (1 - fl) + 12, WHITE, a * fl); ctx.restore(); }
    const head = [vertex[0] + d[0] * L * mu, vertex[1] + d[1] * L * mu, vertex[2] + d[2] * L * mu];
    const p0 = cam.project(vertex), p1 = cam.project(head);
    if (p0 && p1) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = rgba(WHITE, 0.8 * a); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
      ctx.restore();
      const coneA = a * (mu < 1 ? 1 : 1 - clamp((t - (bt(43) + 0.4)) * 1.5));
      if (mu > 0.02) cherenkovCone(ctx, cam, head, d, Math.min(260, L * mu), coneA);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, p1[0], p1[1], 10, WHITE, coneA); ctx.restore();
      const la = a * env(t, bt(41) + 0.6, bt(43) + 0.4, 0.4, 0.5);
      text(ctx, 'μ 子：比冰中的光还快', p1[0] + 34, p1[1] + 8, { size: 24, weight: 700, color: C.cream, alpha: la, align: 'left', ls: 2 });
    }
  }
  // reconstruct the direction: extend the track back out of the detector
  const rc = a * ep(t, bt(43) + 0.6, bt(44) + 0.6);
  if (rc > 0) {
    const back = [vertex[0] - d[0] * 1600 * rc, vertex[1] - d[1] * 1600 * rc, vertex[2] - d[2] * 1600 * rc];
    const fwd = [vertex[0] + d[0] * L, vertex[1] + d[1] * L, vertex[2] + d[2] * L];
    const p0 = cam.project(fwd), p1 = cam.project(back);
    if (p0 && p1) {
      ctx.save(); ctx.setLineDash([14, 10]); ctx.strokeStyle = rgba(GOLD, 0.85 * a); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); ctx.restore();
      const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
      text(ctx, '来向', p1[0] + Math.cos(ang + Math.PI / 2) * 50, p1[1] + Math.sin(ang + Math.PI / 2) * 50, { size: 30, weight: 900, color: C.goldHi, alpha: rc, ls: 6 });
    }
    // time legend
    const lx = 1520, ly = 800;
    for (let k = 0; k < 60; k++) { ctx.save(); ctx.globalAlpha *= rc; ctx.fillStyle = rgba(timeRGB(k / 59), 1); ctx.fillRect(lx + k * 5, ly, 5, 12); ctx.restore(); }
    text(ctx, '早', lx - 16, ly + 12, { size: 20, color: C.cream, alpha: 0.7 * rc, align: 'right' });
    text(ctx, '晚', lx + 316, ly + 12, { size: 20, color: C.cream, alpha: 0.7 * rc, align: 'left' });
    text(ctx, '颜色 = 光到达的先后 · 大小 = 光的多少', lx + 150, ly + 48, { size: 20, color: C.cream, alpha: 0.6 * rc });
  }
}

// ---------- ⑥ Bert and Ernie, and a sky of them ----------
const BE = { bert: cascadeHits([60, -110, 40], 1.0), ernie: cascadeHits([-110, 140, -60], 1.1) };
function sceneBertErnie(ctx, t) {
  if (t < bt(45) - 0.3 || t > bt(51) + 0.8) return;
  const a = ep(t, bt(45) + 0.0, bt(45) + 0.8) * (1 - ep(t, bt(51) - 0.5, bt(51) + 0.05));
  const ea = a * (1 - ep(t, bt(49), bt(49) + 0.7));
  if (ea > 0) {
    [['bert', 540, '伯特 Bert', '1.0 PeV', 0.4], ['ernie', 1380, '厄尼 Ernie', '1.1 PeV', 0.9]].forEach(([k, cx, name, en, d]) => {
      const cam = camera(0.5 + t * 0.06 + (k === 'ernie' ? 1.2 : 0), -0.2, 3000, { cx, cy: 500 });
      const rv = ep(t, bt(45) + d, bt(45) + d + 1.6);
      drawArray(ctx, cam, { alpha: ea, domAlpha: 0.3, hits: BE[k], reveal: rv, hitScale: 1.25, drawStrings: false });
      const la = ea * ep(t, bt(47) + (k === 'ernie' ? 0.5 : 0), bt(47) + 0.8 + (k === 'ernie' ? 0.5 : 0));
      text(ctx, name, cx, 800, { size: 38, weight: 900, color: C.goldHi, alpha: la, ls: 4 });
      text(ctx, en, cx, 850, { size: 30, fam: F.didot, color: C.cream, alpha: 0.8 * la });
    });
    text(ctx, '1 PeV，是一千万亿电子伏特', W / 2, 250, { size: 26, color: C.cream, alpha: 0.7 * ea * ep(t, bt(46), bt(46) + 0.8), ls: 2 });
  }
  // a sky map of high-energy events from all directions
  const sa = a * ep(t, bt(49) + 0.2, bt(49) + 1.0);
  if (sa > 0) {
    const cx = W / 2, cy = 520, rx = 640, ry = 300;
    ctx.save(); ctx.globalAlpha *= sa; ctx.strokeStyle = 'rgba(150,210,255,0.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(150,210,255,0.14)'; ctx.lineWidth = 1;
    for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(rx * (k / 3)), ry, 0, 0, Math.PI * 2); ctx.stroke(); }
    for (let k = -2; k <= 2; k++) { const yy = cy + (k / 3) * ry, hw = rx * Math.sqrt(1 - (k / 3) ** 2); ctx.beginPath(); ctx.moveTo(cx - hw, yy); ctx.lineTo(cx + hw, yy); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 28; i++) {
      const ap = ep(t, bt(49) + 0.6 + i * 0.09, bt(49) + 0.9 + i * 0.09);
      if (ap <= 0) continue;
      const u = hash(i, 151) * 2 - 1, v = hash(i, 152) * 2 - 1, k = Math.sqrt(u * u + v * v); if (k > 1) continue;
      glowDot(ctx, cx + u * rx * 0.95, cy + v * ry * 0.95, 6 + hash(i, 153) * 6, timeRGB(0.55 + hash(i, 154) * 0.4), sa * ap);
    }
    ctx.restore();
    text(ctx, '28 个高能事件 · 来自天空的四面八方', cx, cy + ry + 70, { size: 28, weight: 700, color: IC.cyanHi, alpha: sa, ls: 2 });
    text(ctx, '（方向为示意）', cx, cy + ry + 108, { size: 20, color: C.cream, alpha: 0.5 * sa });
  }
}

// ---------- ⑦ 2017: the alert, the blazar ----------
const ALERT = (() => { const d = [0.94, 0.12, 0.32], n = Math.hypot(...d); const dd = d.map((v) => v / n); const o = [-700 * dd[0], -700 * dd[1] - 60, -700 * dd[2]]; return { d: dd, o, hits: trackHits(o, dd, 1.5) }; })();
function sceneAlert(ctx, t) {
  if (t < bt(51) - 0.3 || t > bt(59) + 0.8) return;
  const a = ep(t, bt(51) + 0.0, bt(51) + 0.8) * (1 - ep(t, bt(59) - 0.5, bt(59) + 0.05));
  // [51,53] the event
  const ev = a * (1 - ep(t, bt(53) - 0.1, bt(53) + 0.6));
  if (ev > 0) {
    const s = '2017-09-22  20:54:30 UTC', n = Math.floor(prog(t, bt(51) + 0.2, bt(51) + 1.6) * s.length);
    text(ctx, s.slice(0, n), W / 2, 250, { size: 46, fam: F.didot, color: C.cream, alpha: ev, ls: 3 });
    const cam = camera(-0.6 + (t - bt(51)) * 0.05, -0.18, 2700, { cy: 560 });
    const rv = ep(t, bt(51) + 1.0, bt(52) + 1.4);
    drawArray(ctx, cam, { alpha: ev, domAlpha: 0.32, hits: ALERT.hits, reveal: rv, hitScale: 1.1 });
    const L = 1400 * rv, p0 = cam.project(ALERT.o), p1 = cam.project([ALERT.o[0] + ALERT.d[0] * L, ALERT.o[1] + ALERT.d[1] * L, ALERT.o[2] + ALERT.d[2] * L]);
    if (p0 && p1 && rv > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(WHITE, 0.7 * ev); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); glowDot(ctx, p1[0], p1[1], 8, WHITE, ev * (rv < 1 ? 1 : 0)); ctx.restore(); }
    text(ctx, 'IceCube-170922A', W / 2, 870, { size: 34, fam: F.serif, italic: true, color: IC.cyanHi, alpha: ev * ep(t, bt(52), bt(52) + 0.6) });
  }
  // [53,55] alerts from the South Pole; telescopes turn
  const ga = a * env(t, bt(53) - 0.1, bt(55) + 0.05, 0.6, 0.5);
  if (ga > 0) {
    const ex = 820, ey = 600, R = 240;
    const e = drawEarth(ctx, ex, ey, R, t * 0.2, { alpha: ga, south: 0.78 });
    const [px, py] = e.pole;
    for (let k = 0; k < 4; k++) {
      const p = frac((t - bt(53)) / 1.4 + k / 4);
      ctx.save(); ctx.globalAlpha *= ga * (1 - p); ctx.strokeStyle = IC.cyanHi; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(px, py, 20 + p * 620, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    glowDot(ctx, px, py, 10, CYANHI, ga);
    text(ctx, '冰立方', px, py + 44, { size: 22, color: IC.cyanHi, alpha: ga, ls: 4 });
    const target = [1700, 140];
    [['费米伽马射线卫星', 520, 260], ['MAGIC 望远镜', 1120, 360], ['全球的天文台', 1260, 640]].forEach(([name, x, y], i) => {
      const on = ep(t, bt(53) + 0.5 + i * 0.35, bt(53) + 0.9 + i * 0.35);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, 8 + 6 * on, on > 0.5 ? GOLD : [160, 190, 210], ga); ctx.restore();
      text(ctx, name, x, y - 22, { size: 22, color: on > 0.5 ? C.goldHi : C.cream, alpha: ga * (0.5 + 0.5 * on), ls: 2 });
      const look = ep(t, bt(54), bt(54) + 0.9);
      if (look > 0) { ctx.save(); ctx.setLineDash([6, 8]); drawLine(ctx, x, y, lerp(x, target[0], look), lerp(y, target[1], look), 1, 'rgba(233,196,122,0.6)', 1.5, ga); ctx.restore(); }
    });
  }
  // [55,59] the blazar, ~4 billion light-years away, and the straight line home
  const ba = a * ep(t, bt(55) + 0.05, bt(55) + 0.9);
  if (ba > 0) {
    const bx = 1240, by = 420;
    // error region from the neutrino direction
    ctx.save(); ctx.globalAlpha *= ba * (1 - ep(t, bt(56), bt(56) + 0.8)); ctx.strokeStyle = IC.cyanHi; ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(bx, by, 150, 110, 0.2, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    const flare = 0.5 + 0.5 * ep(t, bt(55) + 0.4, bt(55) + 1.2);
    drawBlazar(ctx, bx, by, 90, t, flare, ba);
    for (let k = 0; k < 3; k++) {
      const p = frac((t - bt(55)) / 1.1 + k / 3);
      ctx.save(); ctx.globalAlpha *= ba * (1 - p) * 0.6; ctx.strokeStyle = C.goldHi; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 60 + p * 260, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    text(ctx, 'TXS 0506+056', bx, by + 200, { size: 40, fam: F.serif, color: C.cream, alpha: ba, ls: 2 });
    text(ctx, '耀变体 · 约 40 亿光年外 · 正在爆发', bx, by + 246, { size: 26, color: C.goldHi, alpha: ba, ls: 2 });
    // the neutrino's straight path to Earth
    const ex = 330, ey = 800, lp = ep(t, bt(56), bt(57) + 0.4, E.inOut);
    drawEarth(ctx, ex, ey, 70, t, { alpha: ba * ep(t, bt(55) + 0.6, bt(56)), south: 0.7 });
    if (lp > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const x = lerp(bx, ex, lp), y = lerp(by, ey, lp), glowK = 1 + ep(t, bt(57), bt(57) + 0.8);
      ctx.strokeStyle = rgba(CYANHI, 0.75 * ba); ctx.lineWidth = 2.5 * glowK; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(x, y); ctx.stroke();
      glowDot(ctx, x, y, 10, CYANHI, ba); ctx.restore();
    }
    const ev2 = a * ep(t, bt(57) + 0.2, bt(57) + 0.9);
    if (ev2 > 0) {
      text(ctx, '第一次 · 高能中微子源头的证据', 760, 330, { size: 40, weight: 900, color: C.goldHi, alpha: ev2, ls: 4, glow: 20 });
      text(ctx, '多台望远镜同时看到它在爆发 · 同一方向此前还有一批中微子', 760, 380, { size: 22, color: C.cream, alpha: 0.65 * ev2, ls: 1 });
    }
  }
}

// ---------- ⑦ 2023: AI finds the Milky Way in neutrinos ----------
const NN = { xs: [700, 900, 1100, 1300], ns: [6, 9, 9, 2] };
function nnNode(l, k) { const n = NN.ns[l]; return [NN.xs[l], 520 + (k - (n - 1) / 2) * (l === 3 ? 180 : 52)]; }
function sceneAI(ctx, t) {
  if (t < bt(59) - 0.3 || t > bt(63) + 0.8) return;
  const a = ep(t, bt(59) + 0.0, bt(59) + 0.8) * (1 - ep(t, bt(63) - 0.5, bt(63) + 0.05));
  const na = a * (1 - ep(t, bt(61) - 0.45, bt(61) + 0.05));
  if (na > 0) {
    // edges with travelling pulses
    ctx.save();
    for (let l = 0; l < 3; l++) for (let i = 0; i < NN.ns[l]; i++) for (let j = 0; j < NN.ns[l + 1]; j++) {
      const [x1, y1] = nnNode(l, i), [x2, y2] = nnNode(l + 1, j);
      ctx.strokeStyle = `rgba(120,190,230,${0.10 * na})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      const h = hash(l * 100 + i * 10 + j, 161); if (h > 0.25) continue;
      const u = ((t * 1.3 + h * 7) % 1);
      ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, lerp(x1, x2, u), lerp(y1, y2, u), 3, CYANHI, 0.7 * na); ctx.globalCompositeOperation = 'source-over';
    }
    for (let l = 0; l < 4; l++) for (let i = 0; i < NN.ns[l]; i++) {
      const [x, y] = nnNode(l, i);
      ctx.fillStyle = 'rgba(10,30,50,0.95)'; ctx.globalAlpha = na; ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = IC.cyan; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
    text(ctx, '深度神经网络', 1000, 280, { size: 30, weight: 900, color: IC.cyanHi, alpha: na, ls: 6 });
    // events stream in from the left: tiny event displays
    for (let k = 0; k < 9; k++) {
      const u = frac((t - bt(59)) * 0.55 + k / 9);
      const x = lerp(120, 660, u), y = 520 + (hash(k + Math.floor((t - bt(59)) * 0.55 + k / 9) * 9, 171) - 0.5) * 340;
      ctx.save(); ctx.globalAlpha *= na * Math.sin(u * Math.PI);
      ctx.strokeStyle = 'rgba(160,200,230,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(x - 22, y - 22, 44, 44);
      for (let q = 0; q < 6; q++) { ctx.fillStyle = rgba(timeRGB(hash(k * 7 + q, 172)), 0.8); ctx.beginPath(); ctx.arc(x - 16 + hash(k * 7 + q, 173) * 32, y - 16 + hash(k * 7 + q, 174) * 32, 2.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    // outputs
    const n1 = Math.floor((t - bt(59)) * 3800), n2 = Math.floor((t - bt(59)) * 0.9);
    const [ox1, oy1] = nnNode(3, 0), [ox2, oy2] = nnNode(3, 1);
    text(ctx, '背景噪声', ox1 + 50, oy1 - 4, { size: 24, color: C.cream, alpha: 0.6 * na, align: 'left', ls: 2 });
    text(ctx, Math.max(0, n1).toLocaleString('en-US'), ox1 + 50, oy1 + 36, { size: 34, fam: F.didot, color: C.cream, alpha: 0.6 * na, align: 'left' });
    text(ctx, '中微子', ox2 + 50, oy2 - 4, { size: 26, weight: 900, color: IC.cyanHi, alpha: na, align: 'left', ls: 2 });
    text(ctx, String(Math.max(0, n2)), ox2 + 50, oy2 + 40, { size: 40, fam: F.didot, color: IC.cyanHi, alpha: na, align: 'left', glow: 16, glowColor: 'rgba(110,210,255,0.5)' });
    text(ctx, '（数字为示意）', 1000, 800, { size: 20, color: C.cream, alpha: 0.45 * na });
  }
  // the Milky Way, then its neutrino glow
  const ma = a * ep(t, bt(61) + 0.0, bt(61) + 0.9);
  if (ma > 0) {
    ctx.save(); ctx.translate(W / 2, 500); ctx.rotate(-0.1);
    ctx.globalCompositeOperation = 'lighter';
    // diffuse band + bulge
    for (let k = -12; k <= 12; k++) { const x = k * 90, w = Math.exp(-(x * x) / (2 * 380 * 380)); glowDot(ctx, x, 0, 60 + 70 * w, [200, 205, 235], 0.05 * ma * (0.4 + w)); }
    glowDot(ctx, 0, 0, 110, [255, 225, 190], 0.11 * ma);
    // stars concentrated toward the plane and the centre
    for (let i = 0; i < 5000; i++) {
      const x = (hash(i, 181) - 0.5) * 2300, y = (hash(i, 182) + hash(i, 183) + hash(i, 186) - 1.5) * 170;
      const core = Math.exp(-(x * x) / (2 * 450 * 450));
      ctx.fillStyle = `rgba(230,235,255,${ma * (0.18 + 0.5 * hash(i, 185)) * (0.5 + 0.5 * core)})`;
      ctx.fillRect(x, y * (0.6 + 0.6 * core), 1.6, 1.6);
    }
    ctx.globalCompositeOperation = 'source-over';
    // dust lane
    ctx.fillStyle = `rgba(3,6,11,${0.35 * ma})`;
    ctx.beginPath(); ctx.moveTo(-1150, 6); for (let x = -1150; x <= 1150; x += 50) ctx.lineTo(x, 6 + Math.sin(x * 0.01) * 8); for (let x = 1150; x >= -1150; x -= 50) ctx.lineTo(x, 20 + Math.sin(x * 0.012 + 1) * 10); ctx.closePath(); ctx.fill();
    const nu = ma * ep(t, bt(61) + 1.1, bt(62) + 0.6);
    if (nu > 0) {
      ctx.globalCompositeOperation = 'lighter';
      for (let k = -14; k <= 14; k++) { const x = k * 80, w = Math.exp(-(x * x) / (2 * 420 * 420)); glowDot(ctx, x, 0, 40 + 50 * w, CYAN, 0.10 * nu * (0.25 + w)); }
      glowDot(ctx, 0, 0, 110, CYANHI, 0.09 * nu);
    }
    ctx.restore();
    text(ctx, '银河系 · 用中微子看到的样子', W / 2, 820, { size: 30, weight: 700, color: IC.cyanHi, alpha: nu, ls: 4 });
  }
}

// ---------- ⑦ the prize ----------
const MILESTONES = [['1988', '设想'], ['1996', 'AMANDA'], ['2010', '冰立方完工'], ['2013', '伯特和厄尼'], ['2017', 'TXS 0506+056'], ['2023', '银河系'], ['2026', '诺贝尔奖']];
function sceneNobel(ctx, t) {
  if (t < bt(63) - 0.3 || t > bt(65) + 0.8) return;
  const a = ep(t, bt(63) + 0.0, bt(63) + 0.8) * (1 - ep(t, bt(65) - 0.5, bt(65) + 0.05));
  const ma = a * ep(t, bt(63) + 0.2, bt(63) + 1.2);
  drawMedal(ctx, 640, 470, 150, ma, (1 - E.out(prog(t, bt(63) + 0.2, bt(63) + 1.8))) * 0.8);
  text(ctx, 'Francis Halzen', 1240, 420, { size: 64, fam: F.serif, italic: true, color: C.goldHi, alpha: ma });
  text(ctx, '弗朗西斯 · 哈尔岑', 1240, 480, { size: 34, weight: 700, color: C.cream, alpha: ma, ls: 6 });
  text(ctx, '“for decisive contributions to the IceCube Neutrino Observatory', 1240, 548, { size: 20, fam: F.serif, italic: true, color: C.cream, alpha: 0.6 * ma });
  text(ctx, 'and the discovery of high-energy neutrinos of astrophysical origin”', 1240, 576, { size: 20, fam: F.serif, italic: true, color: C.cream, alpha: 0.6 * ma });
  // timeline
  const x0 = 300, x1 = 1620, y = 760, lp = ep(t, bt(63) + 0.6, bt(64) + 1.4);
  drawLine(ctx, x0, y, lerp(x0, x1, lp), y, 1, 'rgba(233,196,122,0.6)', 2, a);
  MILESTONES.forEach(([yr, lab], i) => {
    const x = lerp(x0, x1, i / (MILESTONES.length - 1)), on = ep(t, bt(63) + 0.6 + i * 0.3, bt(63) + 0.9 + i * 0.3);
    if (on <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(ctx, x, y, i === MILESTONES.length - 1 ? 12 : 7, i === MILESTONES.length - 1 ? GOLD : CYANHI, a * on); ctx.restore();
    text(ctx, yr, x, y - 26, { size: 26, fam: F.didot, color: i === MILESTONES.length - 1 ? C.goldHi : C.cream, alpha: a * on });
    text(ctx, lab, x, y + 44, { size: 20, color: C.cream, alpha: 0.7 * a * on, ls: 1 });
  });
}

// ---------- ⑧ back to the fingernail, then into the ice ----------
function sceneOutro(ctx, t) {
  if (t < bt(65) - 0.3 || t > bt(67) + 1.2) return;
  const a = ep(t, bt(65) + 0.0, bt(65) + 0.8);
  const fa = a * (1 - ep(t, bt(66) - 0.2, bt(66) + 0.6));
  drawFinger(ctx, 760, 560, 0.85, fa);
  nailSparkles(ctx, 760, 560, 0.85, t, fa);
  counterBlock(ctx, t, bt(65), 1360, 520, fa * ep(t, bt(65) + 0.2, bt(65) + 0.8), '此刻，穿过你指甲盖的中微子');
  streaks(ctx, t, { alpha: a * (1 - ep(t, bt(67) - 0.4, bt(67) + 0.6)), n: 160, dir: SUN_DIR });
  // dive into the ice: the array glows, waiting
  const ia = ep(t, bt(66) + 0.1, bt(66) + 1.0) * (1 - ep(t, bt(67) - 0.2, bt(67) + 0.4));
  if (ia > 0) {
    const cam = camera(0.2 + t * 0.05, -0.2, lerp(5200, 2600, ep(t, bt(66), bt(67) + 0.5, E.out)), { cy: 520 });
    drawArray(ctx, cam, { alpha: ia, domAlpha: 0.6 });
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 40; k++) {
      const st = Math.floor(t * 4) + k * 17, dm = DET.doms[Math.floor(hash(st, 191) * DET.doms.length)], p = cam.project(dm.p);
      if (p) glowDot(ctx, p[0], p[1], 3.5, CYANHI, 0.5 * ia * Math.sin(((t * 4) % 1) * Math.PI));
    }
    ctx.restore();
  }
}

// ---------- end card: icy title over the stars ----------
function sceneEnd(ctx, t) { sceneEndCard(ctx, t, END_BAR); }

const END_BAR = 67;
const SCENES = [sceneHook, sceneTitle, sceneGhost, sceneMessengers, sceneCube, sceneAntarctica, sceneIceSection, sceneBuild, sceneDetect, sceneBertErnie, sceneAlert, sceneAI, sceneNobel, sceneOutro, sceneEnd];
