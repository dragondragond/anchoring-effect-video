// Reusable drawing components. Episode-specific ones go in scenes.js.
// Rule: inside a component, multiply ctx.globalAlpha (*=) — never assign it — so the caller's fade still applies.

// ---------- title card + particles ----------
const TITLE_Y = 540;
function drawTitleText(c, alpha = 1, size = 150) {
  c.save();
  setFont(c, size, 900, F.song); c.letterSpacing = '24px'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const g = c.createLinearGradient(0, TITLE_Y - size * 0.85, 0, TITLE_Y + 10);
  g.addColorStop(0, '#fbe9b8'); g.addColorStop(0.55, '#e0b56a'); g.addColorStop(1, '#a87b3b');
  c.fillStyle = g; c.globalAlpha *= alpha; c.shadowColor = 'rgba(240,190,100,0.45)'; c.shadowBlur = 36;
  c.fillText(CONFIG.title, W / 2 + 12, TITLE_Y);
  c.restore();
}
const TITLE_N = 600;
function titlePoints() { return sampleText('title', (c) => drawTitleText(c, 1), TITLE_N, 3, 9); }

// Title card between bars b0 and b1 (put b0 on the bass drop). A white flash enters, particles converge into the
// title, then the title shatters back into particles (titlePoints) that the next scene can fly elsewhere.
function sceneTitleCard(ctx, t, b0, b1) {
  const t0 = bt(b0), t1 = bt(b1);
  if (t < t0 - 0.6 || t > t1 + 0.8) return;
  // flash into the title
  const fin = Math.pow(prog(t, t0 - 0.55, t0), 2.2) * (t < t0 ? 1 : 0);
  if (fin > 0) { ctx.fillStyle = `rgba(255,236,200,${0.85 * fin})`; ctx.fillRect(0, 0, W, H); }
  if (t < t0) return;
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
  // particles converge, the title shows, then it shatters
  const pts = titlePoints();
  const conv = ep(t, t0, t0 + 1.1, E.outQuint);
  const pa = (t < t0 + 1.4 ? 1 - ep(t, t0 + 0.9, t0 + 1.4) : 0) + (t > t1 - 0.45 ? ep(t, t1 - 0.45, t1 - 0.1) * (1 - ep(t, t1 + 0.2, t1 + 0.8)) : 0);
  const burst = ep(t, t1 - 0.1, t1 + 0.8, E.out);
  if (pa > 0) {
    ctx.save();
    for (let i = 0; i < TITLE_N; i++) {
      const ang = hash(i, 31) * Math.PI * 2, rad = 650 + hash(i, 32) * 600;
      const k = E.outQuint(clamp(conv * 1.15 - hash(i, 5) * 0.15));
      const x = lerp(W / 2 + Math.cos(ang) * rad, pts[i][0], k) + Math.cos(ang) * 260 * burst;
      const y = lerp(TITLE_Y + Math.sin(ang) * rad * 0.6, pts[i][1], k) + Math.sin(ang) * 180 * burst;
      ctx.globalAlpha = pa; ctx.fillStyle = C.goldHi; ctx.beginPath(); ctx.arc(x, y, 2.1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  const ta = ep(t, t0 + 0.75, t0 + 1.4) * (1 - ep(t, t1 - 0.45, t1 + 0.05));
  const s = 1 + 0.03 * prog(t, t0, t1);
  ctx.save(); ctx.translate(W / 2, TITLE_Y); ctx.scale(s, s); ctx.translate(-W / 2, -TITLE_Y); drawTitleText(ctx, ta); ctx.restore();
  const sa = ep(t, t0 + 0.9, t0 + 1.7) * env(t, t0, t1, 0.01, 0.5);
  text(ctx, CONFIG.titleEn, W / 2, TITLE_Y - 190, { size: 28, fam: F.serif, ls: 14, color: C.gold, alpha: sa });
  const lp = ep(t, t0 + 1.4, t0 + 2.2, E.outQuint);
  drawLine(ctx, W / 2, TITLE_Y + 70, W / 2 - 200 * lp, TITLE_Y + 70, 1, C.goldDim, 1.2, sa);
  drawLine(ctx, W / 2, TITLE_Y + 70, W / 2 + 200 * lp, TITLE_Y + 70, 1, C.goldDim, 1.2, sa);
  const ua = ep(t, t0 + 1.8, t0 + 2.6) * env(t, t0, t1, 0.01, 0.5);
  text(ctx, CONFIG.tagline, W / 2, TITLE_Y + 132, { size: 34, color: C.cream, alpha: 0.85 * ua, ls: 8 });
  const fl = 1 - prog(t, t0, t0 + 0.7);
  if (fl > 0) { ctx.fillStyle = `rgba(255,236,200,${0.85 * fl * fl})`; ctx.fillRect(0, 0, W, H); }
}

// End card from bar b0 to the end: title, golden line, references, signature.
function sceneEndCard(ctx, t, b0) {
  const t0 = bt(b0);
  if (t < t0 - 0.2) return;
  const a = ep(t, t0, t0 + 1.0);
  text(ctx, CONFIG.titleEn, W / 2, 236, { size: 22, fam: F.serif, ls: 12, color: C.gold, alpha: a });
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, -160);
  ctx.translate(W / 2, TITLE_Y); ctx.scale(0.78, 0.78); ctx.translate(-W / 2, -TITLE_Y); drawTitleText(ctx, 1); ctx.restore();
  const lp = ep(t, t0 + 0.3, t0 + 1.2, E.outQuint);
  drawLine(ctx, W / 2, 432, W / 2 - 220 * lp, 432, 1, C.goldDim, 1.2, a);
  drawLine(ctx, W / 2, 432, W / 2 + 220 * lp, 432, 1, C.goldDim, 1.2, a);
  const qa = ep(t, t0 + 0.6, t0 + 1.6);
  CONFIG.quote.forEach((q, i) => richText(ctx, q, W / 2, 510 + i * 56, { size: 40, weight: 700, alpha: qa, ls: 4 }));
  const ra = ep(t, t0 + 1.2, t0 + 2.2) * 0.45;
  ['参考资料', ...CONFIG.refs].forEach((s, i) => text(ctx, s, W / 2, 690 + i * 30, { size: i === 0 ? 18 : 17, fam: i === 0 ? F.song : F.serif, color: C.cream, alpha: ra * (i === 0 ? 1.3 : 1), ls: i === 0 ? 6 : 0.5 }));
  const la = ep(t, t0 + 1.6, t0 + 2.6);
  text(ctx, CONFIG.signature, W / 2, 920, { size: 34, weight: 900, color: C.goldHi, alpha: la, ls: 4 });
  text(ctx, '出品', W / 2, 958, { size: 18, color: C.cream, alpha: 0.5 * la, ls: 8 });
}

// ---------- data components ----------
// Number axis 0..100 drawn on with progress p. o.pct adds % to labels (do this whenever the values are percentages).
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

// Card with a ring gauge that fills to pct (fill 0..1). Good for "A 78% vs B 83%" hooks.
function gaugeCard(ctx, cx, cy, label, pct, fill, color, o = {}) {
  const w = 340, h = 400;
  ctx.save(); ctx.translate(cx, cy + (o.lift || 0)); const sc = o.scale || 1; ctx.scale(sc, sc);
  ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
  if (o.glow) {
    const g = ctx.createRadialGradient(0, 0, 40, 0, 0, 330);
    g.addColorStop(0, `rgba(240,200,120,${0.22 * o.glow})`); g.addColorStop(1, 'rgba(240,200,120,0)');
    ctx.fillStyle = g; ctx.fillRect(-360, -360, 720, 720);
  }
  roundRect(ctx, -w / 2, -h / 2, w, h, 16); ctx.fillStyle = 'rgba(255,236,200,0.035)'; ctx.fill();
  ctx.strokeStyle = color; ctx.globalAlpha *= 0.75; ctx.lineWidth = 1.6; ctx.stroke(); ctx.globalAlpha /= 0.75;
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath(); ctx.moveTo(sx * (w / 2 - 2), sy * (h / 2 - 26)); ctx.lineTo(sx * (w / 2 - 2), sy * (h / 2 - 2)); ctx.lineTo(sx * (w / 2 - 26), sy * (h / 2 - 2)); ctx.stroke();
  }
  text(ctx, label, 0, -128, { size: 44, weight: 900, color: C.cream, ls: 4 });
  const R = 92;
  ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(236,227,207,0.10)';
  ctx.beginPath(); ctx.arc(0, 30, R, 0, Math.PI * 2); ctx.stroke();
  if (fill > 0) {
    ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(0, 30, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct / 100 * fill); ctx.stroke(); ctx.shadowBlur = 0;
  }
  text(ctx, Math.round(pct * fill) + '%', 0, 54, { size: 70, fam: F.didot, color: fill > 0 ? C.cream : 'rgba(236,227,207,0.25)' });
  text(ctx, o.caption || '成功率', 0, 166, { size: 22, color: C.cream, alpha: 0.55, ls: 4 });
  ctx.restore();
}

// Speech / chat bubble. tail: -1 left, 1 right, 0 none.
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

function person(ctx, x, y, color, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y - 46, 22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 44, y + 30); ctx.quadraticCurveTo(x - 44, y - 18, x, y - 18); ctx.quadraticCurveTo(x + 44, y - 18, x + 44, y + 30); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Paper document card (study, case file, letter). lines: [{text, size, weight, fam, italic}], then grey filler bars.
function paperCard(ctx, cx, cy, w, h, rot, alpha, lines, fillerBars = 5) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
  ctx.fillStyle = C.paper; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  let y = -h / 2 + 60;
  for (const l of lines) {
    setFont(ctx, l.size || 28, l.weight || 400, l.fam || F.serif, l.italic ? 'italic' : '');
    ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.letterSpacing = (l.ls || 0) + 'px';
    ctx.fillText(l.text, 0, y); y += (l.size || 28) * 1.45;
  }
  ctx.globalAlpha *= 0.3;
  for (let i = 0; i < fillerBars; i++) ctx.fillRect(-w / 2 + 50, y + i * 26, w - 100 - (i === fillerBars - 1 ? w * 0.3 : hash(i, 8) * 40), 5);
  ctx.restore();
}

// Rope / tether from (x1,y1) to (x2,y2); sag pulls the middle down (0 = taut); p draws it on.
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

// Expanding rings for a landing / arrival.
function ripples(ctx, x, y, r0, r1, t, t0, color, n = 2, alpha = 1) {
  for (let k = 0; k < n; k++) {
    const p = prog(t, t0 + k * 0.3, t0 + k * 0.3 + 1.2);
    if (p <= 0 || p >= 1) continue;
    ctx.save(); ctx.globalAlpha *= alpha * (1 - p) * 0.7; ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, lerp(r0, r1, E.out(p)), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
}

// Short lines bursting sideways from an impact point (gavel, stamp, drop).
function impact(ctx, x, y, t, t0, alpha) {
  const p = prog(t, t0, t0 + 0.5);
  if (p <= 0 || p >= 1) return;
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) {
    const ang = -0.5 + k * 0.35, r0 = 30 + 60 * E.out(p), r1 = r0 + 26 * (1 - p);
    const dx = Math.cos(ang) * sx, dy = -Math.abs(Math.sin(ang)) * 0.9;
    drawLine(ctx, x + dx * r0, y + dy * r0, x + dx * r1, y + dy * r1, 1, C.goldHi, 3, alpha * (1 - p));
  }
}

// Text that flips like a split-flap from s0 to s1 (p 0..1). Great for "same numbers, new labels".
function flipText(ctx, s0, s1, p, x, y, o) {
  if (p <= 0) return text(ctx, s0, x, y, o);
  if (p >= 1) return text(ctx, s1, x, y, o);
  const k = p < 0.5 ? 1 - p * 2 : p * 2 - 1;
  ctx.save(); ctx.translate(x, y - (o.size || 32) * 0.35); ctx.scale(1, Math.max(0.02, k));
  text(ctx, p < 0.5 ? s0 : s1, 0, (o.size || 32) * 0.35, { ...o, alpha: (o.alpha == null ? 1 : o.alpha) * (0.4 + 0.6 * k) });
  ctx.restore();
}

// Rounded node for causal / flow diagrams.
function node(ctx, x, y, label, a, o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  setFont(ctx, o.size || 30, 700, F.song); ctx.letterSpacing = '3px';
  const w = Math.max(150, ctx.measureText(label).width + 56), h = 66;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 33); ctx.fillStyle = o.fill || 'rgba(20,16,12,0.92)'; ctx.fill();
  ctx.strokeStyle = o.color || C.gold; ctx.lineWidth = o.hl ? 2.6 : 1.6;
  if (o.hl) { ctx.shadowColor = o.color || C.gold; ctx.shadowBlur = 18 * o.hl; }
  ctx.stroke(); ctx.restore();
  text(ctx, label, x, y + 11, { size: o.size || 30, weight: 700, color: o.textColor || C.cream, alpha: a, ls: 3 });
}
// Arrow between node centers; light pulses travel along it while flow > 0.
function edge(ctx, a, b, p, o = {}) {
  const [x1, y1] = a, [x2, y2] = b, len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len, ta = o.trimA || 70, tb = o.trimB || 70;
  const pt = arrow(ctx, x1 + ux * ta, y1 + uy * ta, x2 - ux * tb, y2 - uy * tb, p, { color: o.color || C.gold, width: o.width || 3, bend: o.bend || 0, alpha: o.alpha, glow: o.glow });
  if (o.flow > 0 && p >= 1 && pt) {
    ctx.save();
    for (let k = 0; k < 3; k++) {
      const [px, py] = pt((o.time * 0.7 + k / 3) % 1);
      const g = ctx.createRadialGradient(px, py, 0, px, py, 16);
      g.addColorStop(0, `rgba(255,236,190,${0.95 * o.flow})`); g.addColorStop(1, 'rgba(255,236,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 16, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// Star-field of data points rushing toward the camera ("all the data in the world" / AI).
function dataSea(ctx, t, t0, alpha, o = {}) {
  if (alpha <= 0) return;
  const tt = t - t0;
  ctx.save();
  for (let i = 0; i < (o.n || 1300); i++) {
    let z = (hash(i, 61) - tt * (o.speed || 0.18)) % 1; if (z < 0) z += 1; z = 0.05 + z * 0.95;
    const ang = hash(i, 62) * Math.PI * 2, rr = 0.15 + hash(i, 63) * 1.4;
    const x = W / 2 + Math.cos(ang) * rr * 520 / z, y = H / 2 - 30 + Math.sin(ang) * rr * 330 / z;
    if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
    const fade = clamp((1 - z) * 2.2) * clamp(z * 8);
    ctx.globalAlpha = alpha * fade * (0.35 + 0.65 * hash(i, 64));
    ctx.fillStyle = hash(i, 65) < 0.62 ? C.gold : C.blue;
    ctx.beginPath(); ctx.arc(x, y, clamp(1.6 / z, 0.6, 7), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  const cg = ctx.createRadialGradient(W / 2, H / 2 - 30, 0, W / 2, H / 2 - 30, 360);
  cg.addColorStop(0, `rgba(250,220,160,${0.16 * alpha})`); cg.addColorStop(1, 'rgba(250,220,160,0)');
  ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
}
