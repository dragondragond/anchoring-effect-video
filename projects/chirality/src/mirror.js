// Visual toolkit for 镜像之谜: palette, background, a small 3D camera, ball-and-stick molecules, hands,
// crystals, tweezers, polarised light, keys and locks, catalyst complexes, the non-linear plot, a DNA helix.

const MC = {
  bg: '#08060d', amber: '#f2b65a', amberHi: '#ffd99a', teal: '#4fd1c5', tealHi: '#a8f0e8',
  silver: '#c9d2e3', rose: '#ff7a8a', violet: '#a48cff', grey: '#7d7a88',
};
const rgba = (rgb, a) => `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${a})`;
const AMB = [242, 182, 90], AMBHI = [255, 217, 154], TEA = [79, 209, 197], TEAHI = [168, 240, 232], SIL = [201, 210, 227], ROSE = [255, 122, 138], GREY = [125, 122, 136];
const frac = (x) => x - Math.floor(x);
const handRGB = (h) => (h === 'L' ? AMB : TEA);
const handCol = (h) => (h === 'L' ? MC.amber : MC.teal);

function glowDot(ctx, x, y, r, rgb, a) {
  if (a <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  g.addColorStop(0, rgba(rgb, a)); g.addColorStop(0.3, rgba(rgb, a * 0.45)); g.addColorStop(1, rgba(rgb, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
}
// a solid ball with a soft highlight (molecules, ligands)
function ball(ctx, x, y, r, rgb, a = 1) {
  if (a <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
  g.addColorStop(0, rgba([lerp(rgb[0], 255, 0.6), lerp(rgb[1], 255, 0.6), lerp(rgb[2], 255, 0.6)], a));
  g.addColorStop(0.55, rgba(rgb, a));
  g.addColorStop(1, rgba([rgb[0] * 0.45, rgb[1] * 0.45, rgb[2] * 0.45], a));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

// ---------- background ----------
function drawSceneBackground(ctx, t) {
  ctx.fillStyle = MC.bg; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, c, a] of [[W * 0.22, H * 0.35, 760, [70, 40, 110], 0.22], [W * 0.82, H * 0.62, 820, [30, 70, 80], 0.16], [W * 0.55, H * 0.15, 520, [90, 60, 30], 0.10]]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(c, a)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  // fine motes, half warm half cool — the two "hands" in the air
  for (let i = 0; i < 120; i++) {
    const x = (hash(i, 1) * W + Math.sin(t * 0.25 + i) * 18 + t * (hash(i, 2) - 0.5) * 8 + W) % W;
    const y = ((hash(i, 3) * H - t * (3 + hash(i, 4) * 8)) % H + H) % H;
    ctx.globalAlpha = (0.10 + 0.30 * hash(i, 5)) * (0.5 + 0.5 * Math.sin(t * (0.7 + hash(i, 6)) + i));
    ctx.fillStyle = i % 2 ? '#ffd9a0' : '#a8f0e8';
    ctx.beginPath(); ctx.arc(x, y, 0.6 + hash(i, 7) * 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---------- 3D camera ----------
function camera(yaw, pitch, dist, o = {}) {
  const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const fov = o.fov || 1100, cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H / 2 : o.cy;
  return {
    project(p) {
      const x = p[0], y = p[1], z = p[2];
      const x1 = x * cyw - z * syw, z1 = x * syw + z * cyw;
      const y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      const d = z2 + dist; if (d < 10) return null;
      const s = fov / d; return [cx + x1 * s, cy - y1 * s, d, s];
    },
  };
}

// ---------- molecules ----------
// A chiral centre: carbon with four different groups at tetrahedral positions. mirror flips x.
const TETRA = [[0, 1, 0], [0.943, -0.333, 0], [-0.471, -0.333, 0.816], [-0.471, -0.333, -0.816]];
const GROUPS = [{ rgb: [240, 240, 245], r: 0.26 }, { rgb: [230, 90, 90], r: 0.42 }, { rgb: [90, 140, 240], r: 0.38 }, { rgb: [110, 210, 120], r: 0.46 }];
function chiralAtoms(mirror) {
  const atoms = [{ p: [0, 0, 0], r: 0.44, rgb: [70, 70, 82] }];
  TETRA.forEach((v, i) => atoms.push({ p: [v[0] * (mirror ? -1 : 1) * 1.35, v[1] * 1.35, v[2] * 1.35], r: GROUPS[i].r, rgb: GROUPS[i].rgb }));
  return { atoms, bonds: [[0, 1], [0, 2], [0, 3], [0, 4]] };
}
// Rotate a point around y then x (molecule's own spin).
function rot3(p, ry, rx) {
  const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
  const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
  return [x1, p[1] * cx - z1 * sx, p[1] * sx + z1 * cx];
}
// Draw ball-and-stick at screen (cx, cy) with scale s (px per unit). tint blends atoms toward a hand colour.
function drawMolecule(ctx, mol, cx, cy, s, ry, rx, o = {}) {
  const a = o.alpha == null ? 1 : o.alpha;
  if (a <= 0) return;
  const P = mol.atoms.map((at) => { const q = rot3(at.p, ry, rx), d = 6 - q[2]; const k = 6 / d; return [cx + q[0] * s * k, cy - q[1] * s * k, q[2], k]; });
  ctx.save(); ctx.globalAlpha *= a;
  ctx.strokeStyle = 'rgba(210,215,230,0.75)'; ctx.lineWidth = Math.max(2, s * 0.09); ctx.lineCap = 'round';
  for (const [i, j] of mol.bonds) { ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke(); }
  const order = P.map((p, i) => [p[2], i]).sort((x, y) => x[0] - y[0]);
  for (const [, i] of order) {
    const at = mol.atoms[i]; let rgb = at.rgb;
    if (o.tint) rgb = [lerp(rgb[0], o.tint[0], o.tintK || 0.5), lerp(rgb[1], o.tint[1], o.tintK || 0.5), lerp(rgb[2], o.tint[2], o.tintK || 0.5)];
    ball(ctx, P[i][0], P[i][1], at.r * s * P[i][3], rgb, 1);
  }
  ctx.restore();
}

// ---------- hands ----------
// Outline of a right hand, palm towards the viewer, thumb on the right. Units ~ px at s = 1.
const HAND_PTS = [[-110, 260], [-124, 60], [-132, -30], [-134, -170], [-118, -222], [-92, -228], [-78, -180], [-76, -80], [-74, -250], [-58, -292], [-30, -298], [-16, -258], [-12, -96], [-10, -282], [6, -326], [36, -330], [52, -288], [54, -96], [58, -250], [72, -288], [100, -290], [116, -250], [118, -70], [150, -20], [204, -110], [232, -126], [254, -106], [246, -62], [178, 86], [128, 200], [112, 260]];
function handPath(ctx) {
  const P = HAND_PTS;
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length - 1; i++) { const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2; ctx.quadraticCurveTo(P[i][0], P[i][1], mx, my); }
  ctx.lineTo(P[P.length - 1][0], P[P.length - 1][1]);
}
// mirror = true draws the left hand. glowThumb 0..1 highlights the thumb (the part that never lines up).
function drawHand(ctx, x, y, s, mirror, alpha, o = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(mirror ? -s : s, s); ctx.globalAlpha *= alpha;
  handPath(ctx);
  const col = o.rgb || [236, 227, 207];
  ctx.fillStyle = rgba(col, 0.06); ctx.fill();
  const fade = ctx.createLinearGradient(0, -330, 0, 270);
  fade.addColorStop(0, rgba(col, 0.95)); fade.addColorStop(0.8, rgba(col, 0.7)); fade.addColorStop(1, rgba(col, 0));
  ctx.strokeStyle = fade; ctx.lineWidth = 3 / s; ctx.lineJoin = 'round'; ctx.stroke();
  // palm creases
  ctx.strokeStyle = rgba(col, 0.25); ctx.lineWidth = 2 / s;
  ctx.beginPath(); ctx.moveTo(-110, 40); ctx.quadraticCurveTo(-10, 0, 100, -40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-100, 100); ctx.quadraticCurveTo(10, 60, 120, 40); ctx.stroke();
  if (o.glowThumb > 0) {
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(205, -60, 10, 205, -60, 120);
    g.addColorStop(0, rgba(ROSE, 0.55 * o.glowThumb)); g.addColorStop(1, rgba(ROSE, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(205, -60, 120, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------- crystals, tweezers, polarised light ----------
// A sodium ammonium tartrate-like crystal: a prism outline with one extra facet on the left or right.
function drawCrystal(ctx, x, y, s, rot, hand, alpha) {
  if (alpha <= 0) return;
  const m = hand === 'L' ? -1 : 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * m, s); ctx.globalAlpha *= alpha;
  const P = [[-0.5, -1], [0.5, -1], [0.85, -0.45], [0.85, 0.7], [0.5, 1], [-0.5, 1], [-0.85, 0.45], [-0.85, -0.55]];
  ctx.beginPath(); P.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath();
  const g = ctx.createLinearGradient(-1, -1, 1, 1);
  const c = handRGB(hand);
  g.addColorStop(0, rgba(c, 0.22)); g.addColorStop(1, rgba(c, 0.06));
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = rgba(c, 0.9); ctx.lineWidth = 2 / s; ctx.stroke();
  // the telltale facet
  ctx.beginPath(); ctx.moveTo(0.5, -1); ctx.lineTo(0.2, -0.55); ctx.lineTo(0.85, -0.45); ctx.closePath();
  ctx.fillStyle = rgba(c, 0.5); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0.2, -0.55); ctx.lineTo(-0.85, -0.55); ctx.moveTo(0.2, -0.55); ctx.lineTo(0.5, 1); ctx.strokeStyle = rgba(c, 0.35); ctx.stroke();
  ctx.restore();
}
function drawTweezers(ctx, x, y, ang, open, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha *= alpha;
  ctx.strokeStyle = 'rgba(220,225,235,0.9)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -220); ctx.quadraticCurveTo(sgn * 14, -110, sgn * (4 + open * 10), 0); ctx.stroke(); }
  ctx.restore();
}
// A beam of polarised light through a vial. Each round window is the beam seen head-on; the double arrow is the
// plane of polarisation. turn (radians, + = clockwise) is how far the solution twists it.
function polWindow(ctx, x, y, ang, rgb, alpha) {
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.arc(x, y, 58, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(220,226,240,0.55)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.translate(x, y); ctx.rotate(ang);
  ctx.strokeStyle = rgba(rgb, 1); ctx.fillStyle = rgba(rgb, 1); ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, 40); ctx.stroke();
  for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, sg * 48); ctx.lineTo(-9, sg * 32); ctx.lineTo(9, sg * 32); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function drawPolarised(ctx, x, y, turn, t, color, alpha, label) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.globalCompositeOperation = 'lighter';
  const bg = ctx.createLinearGradient(x - 380, 0, x + 380, 0);
  bg.addColorStop(0, 'rgba(255,255,255,0)'); bg.addColorStop(0.2, 'rgba(255,255,255,0.35)'); bg.addColorStop(0.8, rgba(color, 0.45)); bg.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = bg; ctx.fillRect(x - 380, y - 5, 760, 10);
  for (let k = 0; k < 4; k++) { const u = frac(t * 0.6 + k / 4); glowDot(ctx, x - 380 + u * 760, y, 6, u < 0.5 ? [255, 255, 255] : color, 0.6 * Math.sin(u * Math.PI)); }
  ctx.restore();
  ctx.save(); ctx.globalAlpha *= alpha;
  roundRect(ctx, x - 55, y - 110, 110, 220, 20); ctx.fillStyle = rgba(color, 0.14); ctx.fill(); ctx.strokeStyle = rgba(color, 0.75); ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  polWindow(ctx, x - 250, y, 0, [255, 255, 255], alpha);
  polWindow(ctx, x + 250, y, turn, color, alpha);
  if (Math.abs(turn) > 0.05) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = rgba(color, 1); ctx.fillStyle = rgba(color, 1); ctx.lineWidth = 3;
    const a0 = -Math.PI / 2, a1 = a0 + turn, R = 78;
    ctx.beginPath(); ctx.arc(x + 250, y, R, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
    const hx = x + 250 + Math.cos(a1) * R, hy = y + Math.sin(a1) * R, tg = a1 + (turn > 0 ? Math.PI / 2 : -Math.PI / 2);
    ctx.beginPath(); ctx.moveTo(hx + Math.cos(tg) * 14, hy + Math.sin(tg) * 14); ctx.lineTo(hx + Math.cos(a1) * 8, hy + Math.sin(a1) * 8); ctx.lineTo(hx - Math.cos(a1) * 8, hy - Math.sin(a1) * 8); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  if (label) text(ctx, label, x + 250, y + 120, { size: 28, weight: 900, color: rgba(color, 1), alpha, ls: 4 });
}

// ---------- keys and a lock (the Nobel committee's locksmith picture) ----------
function drawKey(ctx, x, y, s, mirror, rgb, alpha, rot = 0) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, mirror ? -s : s); ctx.globalAlpha *= alpha;
  ctx.strokeStyle = rgba(rgb, 0.95); ctx.fillStyle = rgba(rgb, 0.15); ctx.lineWidth = 3 / s; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.arc(-70, 0, 34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-70, 0, 12, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-36, -8); ctx.lineTo(90, -8); ctx.lineTo(90, 2); ctx.lineTo(80, 2); ctx.lineTo(80, 22); ctx.lineTo(66, 22); ctx.lineTo(66, 8); ctx.lineTo(52, 8); ctx.lineTo(52, 30); ctx.lineTo(38, 30); ctx.lineTo(38, 8); ctx.lineTo(-36, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function drawLock(ctx, x, y, s, open, alpha, rgb = SIL) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  ctx.strokeStyle = rgba(rgb, 0.95); ctx.lineWidth = 4 / s;
  ctx.beginPath(); ctx.arc(0, -70 - open * 30, 48, Math.PI, 0); ctx.lineTo(48, -40 - open * 30); ctx.moveTo(-48, -70 - open * 30); ctx.lineTo(-48, -40); ctx.stroke();
  roundRect(ctx, -80, -40, 160, 130, 16); ctx.fillStyle = rgba(rgb, 0.10); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 15, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 29); ctx.lineTo(0, 55); ctx.stroke();
  ctx.restore();
}

// ---------- catalyst complexes ----------
// A metal atom holding two chiral ligands (a, b ∈ 'L' | 'R'). spin is the turning angle; dim for the slow L+R pair.
function drawComplex(ctx, x, y, s, a, b, spin, alpha, o = {}) {
  if (alpha <= 0) return;
  const mixed = a !== b;
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= alpha * (mixed && o.dimMixed ? lerp(1, 0.4, o.dimMixed) : 1);
  ctx.rotate(spin);
  for (const [side, h] of [[-1, a], [1, b]]) {
    const lx = side * s * 0.95;
    ctx.strokeStyle = 'rgba(210,215,230,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(lx, 0); ctx.stroke();
    // a little "hand": a ball with a hooked tail that curls one way or the other
    ball(ctx, lx, 0, s * 0.42, handRGB(h), 1);
    ctx.strokeStyle = rgba(handRGB(h), 1); ctx.lineWidth = s * 0.14; ctx.lineCap = 'round';
    const curl = h === 'L' ? -1 : 1;
    ctx.beginPath(); ctx.arc(lx + side * s * 0.38, curl * s * 0.2, s * 0.32, side > 0 ? -Math.PI / 2 : Math.PI / 2, side > 0 ? Math.PI / 2 * curl : -Math.PI / 2 * curl, curl * side < 0); ctx.stroke();
  }
  ball(ctx, 0, 0, s * 0.5, SIL, 1);
  ctx.restore();
}

// ---------- the non-linear plot ----------
// x: catalyst ee (0..100), y: product ee. Kagan-style positive non-linear curve (illustrative shape).
const nlCurve = (u) => 1 - Math.pow(1 - u, 2.4);
function drawNLPlot(ctx, x0, y0, w, h, p, alpha, t) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.strokeStyle = 'rgba(201,210,227,0.6)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, y0 - h); ctx.lineTo(x0, y0); ctx.lineTo(x0 + w, y0); ctx.stroke();
  ctx.restore();
  text(ctx, '催化剂的纯度', x0 + w / 2, y0 + 56, { size: 24, color: C.cream, alpha: 0.75 * alpha, ls: 3 });
  ctx.save(); ctx.translate(x0 - 50, y0 - h / 2); ctx.rotate(-Math.PI / 2); text(ctx, '产物的纯度', 0, 0, { size: 24, color: C.cream, alpha: 0.75 * alpha, ls: 3 }); ctx.restore();
  for (const v of [0, 50, 100]) {
    text(ctx, v + '%', x0 + (v / 100) * w, y0 + 26, { size: 18, fam: F.didot, color: C.cream, alpha: 0.5 * alpha });
    text(ctx, v + '%', x0 - 14, y0 - (v / 100) * h + 6, { size: 18, fam: F.didot, color: C.cream, alpha: 0.5 * alpha, align: 'right' });
  }
  // expected: a straight line
  const pl = ep(p, 0, 0.35);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(201,210,227,0.8)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + w * pl, y0 - h * pl); ctx.stroke(); ctx.restore();
  if (pl > 0.6) text(ctx, '人们以为：直线', x0 + w * 0.72, y0 - h * 0.62, { size: 22, color: C.silver, alpha: alpha * ep(p, 0.3, 0.45), align: 'left', ls: 2 });
  // measured: a curve bulging above
  const pc = ep(p, 0.45, 0.9);
  if (pc > 0) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = MC.amberHi; ctx.lineWidth = 4; ctx.shadowColor = MC.amber; ctx.shadowBlur = 16;
    ctx.beginPath();
    for (let i = 0; i <= 60 * pc; i++) { const u = i / 60, px = x0 + u * w, py = y0 - nlCurve(u) * h; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); ctx.restore();
    text(ctx, '卡冈测到：弯了上去', x0 + w * 0.3, y0 - h * 0.92, { size: 24, weight: 700, color: MC.amberHi, alpha: alpha * ep(p, 0.8, 0.95), align: 'left', ls: 2 });
  }
  // one highlighted pair of points: catalyst 40% → product higher
  const hp = ep(p, 0.92, 1);
  if (hp > 0) {
    const u = 0.4, ex = x0 + u * w, eyLin = y0 - u * h, eyCur = y0 - nlCurve(u) * h;
    ctx.save(); ctx.globalAlpha *= alpha * hp; ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(255,217,154,0.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ex, y0); ctx.lineTo(ex, eyCur); ctx.stroke(); ctx.restore();
    ball(ctx, ex, eyLin, 8, SIL, alpha * hp); ball(ctx, ex, eyCur, 10, AMBHI, alpha * hp);
  }
}

// ---------- DNA helix (right-handed) ----------
function drawHelix(ctx, cx, cy, len, R, t, alpha, o = {}) {
  if (alpha <= 0) return;
  const cam = camera(t * 0.5, -0.12, 1400, { cx, cy });
  const pts = [];
  for (let i = 0; i <= 80; i++) {
    const u = i / 80, y = (u - 0.5) * len, ang = u * Math.PI * 2 * 3;
    for (const ph of [0, Math.PI * 0.8]) pts.push({ p: [Math.cos(ang + ph) * R, y, Math.sin(ang + ph) * R], i, ph });
  }
  ctx.save(); ctx.globalAlpha *= alpha;
  // rungs
  for (let i = 0; i <= 80; i += 4) {
    const a = cam.project(pts[i * 2].p), b = cam.project(pts[i * 2 + 1].p);
    if (a && b) { ctx.strokeStyle = 'rgba(201,210,227,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  }
  const proj = pts.map((q) => [cam.project(q.p), q]).filter((z) => z[0]).sort((a, b) => b[0][2] - a[0][2]);
  for (const [p, q] of proj) ball(ctx, p[0], p[1], 7 * p[3], q.ph === 0 ? (o.rgb || TEA) : (o.rgb2 || TEAHI), 1);
  ctx.restore();
}

// Generic gold medal (not the real Nobel design).
function drawMedal(ctx, x, y, R, alpha, rot = 0) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
  g.addColorStop(0, '#fbe7b0'); g.addColorStop(0.6, '#c9973f'); g.addColorStop(1, '#7a5520');
  ctx.shadowColor = 'rgba(240,190,100,0.5)'; ctx.shadowBlur = 40;
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(60,40,10,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R * 0.84, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#3a2a10'; ctx.textAlign = 'center';
  setFont(ctx, R * 0.15, 700, F.serif); ctx.letterSpacing = '4px'; ctx.fillText('NOBEL PRIZE', 0, -R * 0.2); ctx.fillText('IN CHEMISTRY', 0, R * 0.02);
  setFont(ctx, R * 0.3, 400, F.didot); ctx.letterSpacing = '2px'; ctx.fillText('2026', 0, R * 0.42);
  ctx.restore();
}

// Title lettering: silver-gold, overrides components.js.
function drawTitleText(c, alpha = 1, size = 160) {
  c.save();
  setFont(c, size, 900, F.song); c.letterSpacing = '30px'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const g = c.createLinearGradient(0, TITLE_Y - size * 0.85, 0, TITLE_Y + 10);
  g.addColorStop(0, '#fff6e2'); g.addColorStop(0.5, '#e9cf9a'); g.addColorStop(1, '#9f7fd0');
  c.fillStyle = g; c.globalAlpha *= alpha; c.shadowColor = 'rgba(200,170,255,0.45)'; c.shadowBlur = 36;
  c.fillText(CONFIG.title, W / 2 + 15, TITLE_Y);
  c.restore();
}
