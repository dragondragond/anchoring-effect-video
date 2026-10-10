// Visual toolkit for the IceCube episode: palette, backgrounds, a small 3D camera, the detector array,
// neutrino events drawn like IceCube's own event displays, Cherenkov cones, and the hero props.

const IC = {
  bg: '#03060b', navy: '#071423', ice0: '#0a2033', ice1: '#15405e',
  cyan: '#5fd4ff', cyanHi: '#c8f3ff', cyanDim: '#2b6f8f', white: '#eef8ff',
  red: '#ff6b5a', violet: '#9d8cff', warm: '#ffcf8a',
};
const rgba = (rgb, a) => `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${a})`;
const CYAN = [95, 212, 255], CYANHI = [200, 243, 255], WHITE = [238, 248, 255], GOLD = [233, 196, 122], REDC = [255, 107, 90];

// IceCube event-display colours: red = earliest light → yellow → green → blue = latest.
const TIME_STOPS = [[0, [255, 64, 56]], [0.22, [255, 150, 40]], [0.42, [250, 228, 70]], [0.62, [90, 225, 120]], [0.8, [60, 175, 255]], [1, [120, 95, 255]]];
function timeRGB(u) {
  u = clamp(u);
  for (let i = 1; i < TIME_STOPS.length; i++) {
    if (u <= TIME_STOPS[i][0]) {
      const [u0, c0] = TIME_STOPS[i - 1], [u1, c1] = TIME_STOPS[i], k = (u - u0) / (u1 - u0);
      return [lerp(c0[0], c1[0], k), lerp(c0[1], c1[1], k), lerp(c0[2], c1[2], k)];
    }
  }
  return TIME_STOPS[TIME_STOPS.length - 1][1];
}

// Soft glowing dot (additive). Call inside ctx.globalCompositeOperation = 'lighter'.
function glowDot(ctx, x, y, r, rgb, a) {
  if (a <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  g.addColorStop(0, rgba(rgb, a)); g.addColorStop(0.3, rgba(rgb, a * 0.45)); g.addColorStop(1, rgba(rgb, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
}

// ---------- backgrounds ----------
// How much of the frame is "inside the ice" (vs open space) at time t.
function iceAmount(t) {
  return Math.max(env(t, bt(27) - 0.6, bt(45) + 0.2, 1.2, 1.0), env(t, bt(66) + 0.2, bt(67) + 0.4, 0.8, 0.6));
}
function drawSceneBackground(ctx, t) {
  ctx.fillStyle = IC.bg; ctx.fillRect(0, 0, W, H);
  const ice = iceAmount(t), sp = 1 - ice;
  if (sp > 0) {
    // faint nebula
    for (const [x, y, r, c, a] of [[W * 0.25, H * 0.3, 700, [40, 70, 140], 0.20], [W * 0.8, H * 0.7, 800, [70, 40, 120], 0.14], [W * 0.6, H * 0.2, 500, [20, 90, 130], 0.12]]) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(c, a * sp)); g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // stars with slow drift and twinkle
    for (let i = 0; i < 420; i++) {
      const x = (hash(i, 1) * W + t * (2 + hash(i, 2) * 6)) % W, y = hash(i, 3) * H;
      const tw = 0.55 + 0.45 * Math.sin(t * (0.6 + hash(i, 4) * 2.2) + i);
      const r = 0.4 + Math.pow(hash(i, 5), 4) * 1.8;
      ctx.globalAlpha = sp * (0.25 + 0.75 * hash(i, 6)) * tw;
      ctx.fillStyle = hash(i, 7) < 0.8 ? '#dfefff' : '#ffe6c4';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (ice > 0) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgba([12, 36, 58], ice)); g.addColorStop(0.5, rgba([6, 20, 36], ice)); g.addColorStop(1, rgba([3, 9, 18], ice));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // drifting ice motes
    for (let i = 0; i < 160; i++) {
      const x = (hash(i, 21) * W + Math.sin(t * 0.3 + i) * 20) % W;
      const y = ((hash(i, 22) * H - t * (4 + hash(i, 23) * 10)) % H + H) % H;
      ctx.globalAlpha = ice * (0.1 + 0.35 * hash(i, 24)) * (0.5 + 0.5 * Math.sin(t * 1.3 + i));
      ctx.fillStyle = '#bfe8ff'; ctx.beginPath(); ctx.arc(x, y, 0.6 + hash(i, 25) * 1.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// ---------- 3D camera ----------
// World: x east, y up, z north (metres). pitch < 0 looks down; -PI/2 is straight down.
function camera(yaw, pitch, dist, o = {}) {
  const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const fov = o.fov || 1100, cx = o.cx == null ? W / 2 : o.cx, cy = o.cy == null ? H / 2 : o.cy;
  const tx = o.target ? o.target[0] : 0, ty = o.target ? o.target[1] : 0, tz = o.target ? o.target[2] : 0;
  return {
    fov, cx, cy,
    project(p) {
      const x = p[0] - tx, y = p[1] - ty, z = p[2] - tz;
      const x1 = x * cyw - z * syw, z1 = x * syw + z * cyw;
      const y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      const d = z2 + dist;
      if (d < 10) return null;
      const s = fov / d;
      return [cx + x1 * s, cy - y1 * s, d, s];
    },
  };
}

// ---------- the detector ----------
// 78 strings on a 125 m triangular grid inside a hexagon-like footprint + 8 DeepCore strings near the centre.
// Each string carries 60 DOMs from 1450 to 2450 m; array coordinates are centred on 1950 m depth (y = 0).
const DET = (() => {
  const cand = [];
  for (let j = -6; j <= 6; j++) for (let i = -7; i <= 7; i++) {
    const x = i * 125 + j * 62.5, z = j * 108.25;
    cand.push([x, z, Math.hypot(x * 0.92, z * 1.08)]);
  }
  cand.sort((a, b) => a[2] - b[2]);
  const strings = cand.slice(0, 78).map(([x, z]) => [x, z]);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.3; strings.push([Math.cos(a) * 55, Math.sin(a) * 55]); }
  // deployment order: inside-out, roughly like the seasons
  const order = strings.map((s, i) => [i, Math.hypot(s[0], s[1]) + hash(i, 9) * 160]).sort((a, b) => a[1] - b[1]).map((a) => a[0]);
  const doms = [];
  strings.forEach(([x, z], si) => { for (let k = 0; k < 60; k++) doms.push({ si, k, p: [x, 500 - k * (1000 / 59), z] }); });
  return { strings, order, doms };
})();

// Light seen by each DOM for a track (muon) or a cascade. Returns [{i, q, u}] with u = normalised arrival time.
function trackHits(origin, dir, energy = 1) {
  const n = Math.hypot(...dir), d = dir.map((v) => v / n), out = [];
  let tmin = Infinity, tmax = -Infinity;
  DET.doms.forEach((dm, i) => {
    const v = [dm.p[0] - origin[0], dm.p[1] - origin[1], dm.p[2] - origin[2]];
    const s = v[0] * d[0] + v[1] * d[1] + v[2] * d[2];
    if (s < -60) return;
    const perp = Math.hypot(v[0] - s * d[0], v[1] - s * d[1], v[2] - s * d[2]);
    const q = energy * 400 * Math.exp(-perp / 45) / (1 + perp / 25) * (0.75 + 0.5 * hash(i, 77));
    if (q < 2.5) return;
    const tt = s + perp * 0.9; // light arrives later the farther it has to travel
    out.push({ i, q, tt }); tmin = Math.min(tmin, tt); tmax = Math.max(tmax, tt);
  });
  out.forEach((h) => { h.u = (h.tt - tmin) / Math.max(1, tmax - tmin); });
  return out;
}
function cascadeHits(center, energy = 1) {
  const out = []; let rmax = 1;
  DET.doms.forEach((dm, i) => {
    const r = Math.hypot(dm.p[0] - center[0], dm.p[1] - center[1], dm.p[2] - center[2]);
    const q = energy * 2200 * Math.exp(-r / 85) / (1 + r / 40) * (0.7 + 0.6 * hash(i, 78));
    if (q < 2.5) return;
    out.push({ i, q, r }); rmax = Math.max(rmax, r);
  });
  out.forEach((h) => { h.u = h.r / rmax; });
  return out;
}

// Draw the array. o: alpha, domAlpha, strings (how many strings are deployed, in DET.order), depth (0 = only the
// top DOM of each string, 1 = all 60), hits (from trackHits/cascadeHits), reveal (0..1 plays the event in time order),
// hitScale, drawStrings (faint cables).
function drawArray(ctx, cam, o = {}) {
  const alpha = o.alpha == null ? 1 : o.alpha;
  if (alpha <= 0) return;
  const deployed = new Set(DET.order.slice(0, o.strings == null ? 86 : Math.floor(o.strings)));
  const depthK = o.depth == null ? 1 : o.depth;
  ctx.save();
  // cables
  if (o.drawStrings !== false) {
    ctx.strokeStyle = rgba([120, 180, 220], 0.16 * alpha); ctx.lineWidth = 1;
    for (const si of deployed) {
      const [x, z] = DET.strings[si];
      const a = cam.project([x, 500, z]), b = cam.project([x, lerp(500, -500, depthK), z]);
      if (a && b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    }
  }
  // DOMs (far to near)
  const pts = [];
  for (let i = 0; i < DET.doms.length; i++) {
    const dm = DET.doms[i];
    if (!deployed.has(dm.si) || dm.k / 59 > depthK + 1e-6) continue;
    const p = cam.project(dm.p); if (p) pts.push([p, i]);
  }
  pts.sort((a, b) => b[0][2] - a[0][2]);
  const da = (o.domAlpha == null ? 0.55 : o.domAlpha) * alpha;
  for (const [p] of pts) {
    ctx.globalAlpha = da * clamp(1.6 - p[2] / 4000, 0.25, 1);
    ctx.fillStyle = '#9fd8f5';
    ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(0.8, 5.5 * p[3] * (o.domSize || 1)), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // hits
  if (o.hits) {
    const reveal = o.reveal == null ? 1 : o.reveal, hs = o.hitScale || 1;
    ctx.globalCompositeOperation = 'lighter';
    const list = [];
    for (const h of o.hits) { if (h.u > reveal) continue; const p = cam.project(DET.doms[h.i].p); if (p) list.push([p, h]); }
    list.sort((a, b) => b[0][2] - a[0][2]);
    for (const [p, h] of list) {
      const age = clamp((reveal - h.u) * 6);
      const r = (2.2 + 5.5 * Math.log10(1 + h.q)) * p[3] * hs * (0.6 + 0.4 * age);
      const rgb = timeRGB(h.u);
      ctx.globalCompositeOperation = 'lighter';
      glowDot(ctx, p[0], p[1], r * 0.9, rgb, 0.16 * alpha);
      // solid, softly shaded sphere like IceCube's own event displays
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createRadialGradient(p[0] - r * 0.35, p[1] - r * 0.35, r * 0.1, p[0], p[1], r);
      g.addColorStop(0, rgba([lerp(rgb[0], 255, 0.55), lerp(rgb[1], 255, 0.55), lerp(rgb[2], 255, 0.55)], alpha));
      g.addColorStop(1, rgba([rgb[0] * 0.72, rgb[1] * 0.72, rgb[2] * 0.72], alpha));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

// Cherenkov cone trailing a particle at `head` moving along `dir` (unit), drawn as rings behind it.
function cherenkovCone(ctx, cam, head, dir, length, alpha) {
  if (alpha <= 0) return;
  const tan = Math.tan((41 * Math.PI) / 180);
  // two vectors perpendicular to dir
  const up = Math.abs(dir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let a = [dir[1] * up[2] - dir[2] * up[1], dir[2] * up[0] - dir[0] * up[2], dir[0] * up[1] - dir[1] * up[0]];
  const an = Math.hypot(...a); a = a.map((v) => v / an);
  const b = [dir[1] * a[2] - dir[2] * a[1], dir[2] * a[0] - dir[0] * a[2], dir[0] * a[1] - dir[1] * a[0]];
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const N = 9;
  for (let k = 1; k <= N; k++) {
    const back = (k / N) * length, r = back * tan;
    const c = [head[0] - dir[0] * back, head[1] - dir[1] * back, head[2] - dir[2] * back];
    ctx.beginPath(); let ok = false;
    for (let s = 0; s <= 40; s++) {
      const th = (s / 40) * Math.PI * 2;
      const p = cam.project([c[0] + (a[0] * Math.cos(th) + b[0] * Math.sin(th)) * r, c[1] + (a[1] * Math.cos(th) + b[1] * Math.sin(th)) * r, c[2] + (a[2] * Math.cos(th) + b[2] * Math.sin(th)) * r]);
      if (!p) continue; s && ok ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); ok = true;
    }
    ctx.strokeStyle = rgba(CYAN, alpha * 0.55 * (1 - k / (N + 1))); ctx.lineWidth = 2; ctx.stroke();
  }
  // the cone's two silhouette lines
  const h = cam.project(head);
  ctx.restore();
  return h;
}

// ---------- props ----------
// Earth as a softly lit globe with a rotating graticule. south: tilt so the South Pole faces the viewer (0..1).
function drawEarth(ctx, x, y, R, t, o = {}) {
  const a = o.alpha == null ? 1 : o.alpha;
  if (a <= 0 || R <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const atm = ctx.createRadialGradient(x, y, R * 0.9, x, y, R * 1.35);
  atm.addColorStop(0, 'rgba(90,180,255,0.35)'); atm.addColorStop(1, 'rgba(90,180,255,0)');
  ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(x, y, R * 1.35, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(x - R * 0.4, y - R * 0.45, R * 0.1, x, y, R);
  g.addColorStop(0, '#2f6fa8'); g.addColorStop(0.55, '#123a63'); g.addColorStop(1, '#06162a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
  // graticule on a sphere: longitudes + latitudes, tilted by `tilt`
  const tilt = lerp(0.35, Math.PI / 2 - 0.05, o.south || 0), spin = t * 0.12 + (o.spin || 0);
  ctx.strokeStyle = 'rgba(160,215,255,0.22)'; ctx.lineWidth = 1;
  const P = (lat, lon) => { const cl = Math.cos(lat); let X = cl * Math.sin(lon + spin), Y = Math.sin(lat), Z = cl * Math.cos(lon + spin); const y2 = Y * Math.cos(tilt) - Z * Math.sin(tilt), z2 = Y * Math.sin(tilt) + Z * Math.cos(tilt); return [x + X * R, y - y2 * R, z2]; };
  for (let lo = 0; lo < 12; lo++) { ctx.beginPath(); let pen = false; for (let s = 0; s <= 48; s++) { const p = P(-Math.PI / 2 + (s / 48) * Math.PI, (lo / 12) * Math.PI * 2); if (p[2] < 0) { pen = false; continue; } pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } ctx.stroke(); }
  for (let la = -5; la <= 5; la++) { ctx.beginPath(); let pen = false; for (let s = 0; s <= 72; s++) { const p = P((la / 6) * (Math.PI / 2), (s / 72) * Math.PI * 2); if (p[2] < 0) { pen = false; continue; } pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } ctx.stroke(); }
  // Antarctica: approximate coastline (lon°, lat°) — Ross and Weddell seas, the Peninsula pointing to South America
  if (o.antarctica !== false) {
    ctx.beginPath();
    ANTARCTICA.forEach(([lon, lat], k) => { const p = P((lat * Math.PI) / 180, (lon * Math.PI) / 180); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
    ctx.closePath(); ctx.fillStyle = 'rgba(235,246,255,0.88)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  }
  // terminator shade
  const sh = ctx.createLinearGradient(x - R, y - R, x + R, y + R);
  sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.6, 'rgba(0,0,0,0.15)'); sh.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = sh; ctx.fillRect(x - R, y - R, R * 2, R * 2);
  ctx.restore();
  ctx.strokeStyle = 'rgba(150,210,255,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  return { pole: (() => { const tilt2 = lerp(0.35, Math.PI / 2 - 0.05, o.south || 0); const y2 = -1 * Math.cos(tilt2); return [x, y - y2 * R]; })() };
}

const ANTARCTICA = [
  [0, -70], [15, -70], [30, -69.5], [45, -68], [60, -67.5], [75, -68.5], [85, -66.5], [100, -66], [115, -66.5], [130, -66.3],
  [145, -67.5], [160, -70.5], [168, -72.5], [172, -76], [178, -78], [-175, -78.3], [-165, -78], [-155, -77], [-145, -75.5],
  [-130, -74.5], [-115, -74], [-100, -73], [-85, -73], [-75, -71], [-69, -68.5], [-65, -66], [-60.5, -63.4], [-57, -63.3],
  [-58, -65], [-61, -67], [-62, -70], [-61, -73.5], [-55, -76.5], [-45, -78], [-35, -77.5], [-28, -75.5], [-20, -73.5], [-10, -71.5],
];

// Blazar: a supermassive black hole with an accretion disk and twin jets; flare 0..1.
function drawBlazar(ctx, x, y, s, t, flare = 0, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.globalCompositeOperation = 'lighter';
  const pulse = 1 + 0.15 * Math.sin(t * 5) * flare;
  // jets (one toward the viewer: brighter, shorter)
  for (const [ang, len, br] of [[-1.05, 3.2, 0.55], [Math.PI - 1.05, 2.6, 0.3]]) {
    const ex = x + Math.cos(ang) * s * len, ey = y + Math.sin(ang) * s * len;
    const g = ctx.createLinearGradient(x, y, ex, ey);
    g.addColorStop(0, `rgba(200,230,255,${br * (0.7 + 0.6 * flare)})`); g.addColorStop(1, 'rgba(120,170,255,0)');
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang + Math.PI / 2) * s * 0.06, y + Math.sin(ang + Math.PI / 2) * s * 0.06);
    ctx.lineTo(ex + Math.cos(ang + Math.PI / 2) * s * 0.45, ey + Math.sin(ang + Math.PI / 2) * s * 0.45);
    ctx.lineTo(ex - Math.cos(ang + Math.PI / 2) * s * 0.45, ey - Math.sin(ang + Math.PI / 2) * s * 0.45);
    ctx.lineTo(x - Math.cos(ang + Math.PI / 2) * s * 0.06, y - Math.sin(ang + Math.PI / 2) * s * 0.06);
    ctx.closePath(); ctx.fill();
  }
  // accretion disk
  ctx.save(); ctx.translate(x, y); ctx.rotate(-1.05 + Math.PI / 2); ctx.scale(1, 0.32);
  const dg = ctx.createRadialGradient(0, 0, s * 0.12, 0, 0, s * 1.1);
  dg.addColorStop(0, 'rgba(255,230,180,0.9)'); dg.addColorStop(0.35, 'rgba(255,170,90,0.55)'); dg.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(0, 0, s * 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  glowDot(ctx, x, y, s * 0.35 * pulse, [255, 250, 235], 0.9);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, s * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// A stylised fingertip pointing up, nail visible. Line art.
function drawFinger(ctx, cx, cy, s, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  const fade = ctx.createLinearGradient(0, -300, 0, 420);
  fade.addColorStop(0, 'rgba(236,227,207,0.9)'); fade.addColorStop(0.7, 'rgba(236,227,207,0.6)'); fade.addColorStop(1, 'rgba(236,227,207,0)');
  const fill = ctx.createLinearGradient(-150, 0, 150, 0);
  fill.addColorStop(0, 'rgba(255,230,200,0.03)'); fill.addColorStop(0.5, 'rgba(255,230,200,0.08)'); fill.addColorStop(1, 'rgba(255,230,200,0.02)');
  ctx.beginPath(); ctx.moveTo(-150, 420); ctx.lineTo(-150, -150); ctx.arc(0, -150, 150, Math.PI, 0); ctx.lineTo(150, 420);
  ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = fade; ctx.lineWidth = 3; ctx.stroke();
  // nail
  ctx.beginPath(); ctx.moveTo(-82, -20); ctx.quadraticCurveTo(0, 18, 82, -20); ctx.lineTo(86, -170);
  ctx.quadraticCurveTo(86, -262, 0, -268); ctx.quadraticCurveTo(-86, -262, -86, -170); ctx.closePath();
  const ng = ctx.createLinearGradient(0, -268, 0, 0);
  ng.addColorStop(0, 'rgba(255,240,225,0.16)'); ng.addColorStop(1, 'rgba(255,240,225,0.05)');
  ctx.fillStyle = ng; ctx.fill(); ctx.strokeStyle = 'rgba(236,227,207,0.85)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-60, -228); ctx.quadraticCurveTo(0, -246, 60, -228); ctx.strokeStyle = 'rgba(236,227,207,0.35)'; ctx.lineWidth = 2; ctx.stroke();
  // knuckle creases
  ctx.strokeStyle = 'rgba(236,227,207,0.25)'; ctx.lineWidth = 2;
  for (const yy of [190, 214]) { ctx.beginPath(); ctx.moveTo(-70, yy); ctx.quadraticCurveTo(0, yy + 14, 70, yy); ctx.stroke(); }
  ctx.restore();
}

// Neutrino streaks crossing the frame along `dir` (screen space). density: how many at once.
function streaks(ctx, t, o = {}) {
  const a = o.alpha == null ? 1 : o.alpha;
  if (a <= 0) return;
  const dir = o.dir || [0.87, 0.5], n = o.n || 140, speed = o.speed || 2600, L = 2600;
  const perp = [-dir[1], dir[0]];
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const off = (hash(i, 51) - 0.5) * 2400, ph = hash(i, 52);
    const sp = speed * (0.7 + 0.6 * hash(i, 53));
    const s = ((t * sp / L + ph) % 1) * L - L / 2;
    const cx = W / 2 + dir[0] * s + perp[0] * off, cy = H / 2 + dir[1] * s + perp[1] * off;
    const len = 50 + hash(i, 54) * 130;
    const g = ctx.createLinearGradient(cx - dir[0] * len, cy - dir[1] * len, cx, cy);
    const rgb = hash(i, 55) < 0.85 ? CYANHI : WHITE;
    g.addColorStop(0, rgba(rgb, 0)); g.addColorStop(1, rgba(rgb, a * (0.35 + 0.45 * hash(i, 56))));
    ctx.strokeStyle = g; ctx.lineWidth = 1 + hash(i, 57) * 1.4;
    ctx.beginPath(); ctx.moveTo(cx - dir[0] * len, cy - dir[1] * len); ctx.lineTo(cx, cy); ctx.stroke();
  }
  ctx.restore();
}

// Generic gold medal with text (not the real Nobel design).
function drawMedal(ctx, x, y, R, alpha, rot = 0) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
  g.addColorStop(0, '#fbe7b0'); g.addColorStop(0.6, '#c9973f'); g.addColorStop(1, '#7a5520');
  ctx.shadowColor = 'rgba(240,190,100,0.5)'; ctx.shadowBlur = 40;
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(60,40,10,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R * 0.84, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#3a2a10'; ctx.textAlign = 'center';
  setFont(ctx, R * 0.15, 700, F.serif); ctx.letterSpacing = '4px'; ctx.fillText('NOBEL PRIZE', 0, -R * 0.2); ctx.fillText('IN PHYSICS', 0, R * 0.02);
  setFont(ctx, R * 0.3, 400, F.didot); ctx.letterSpacing = '2px'; ctx.fillText('2026', 0, R * 0.42);
  ctx.restore();
}

// Icy title lettering (overrides the gold version in components.js).
function drawTitleText(c, alpha = 1, size = 170) {
  c.save();
  setFont(c, size, 900, F.song); c.letterSpacing = '36px'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const g = c.createLinearGradient(0, TITLE_Y - size * 0.85, 0, TITLE_Y + 10);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#bfeeff'); g.addColorStop(1, '#4aa8d8');
  c.fillStyle = g; c.globalAlpha *= alpha; c.shadowColor = 'rgba(110,210,255,0.6)'; c.shadowBlur = 40;
  c.fillText(CONFIG.title, W / 2 + 18, TITLE_Y);
  c.restore();
}
