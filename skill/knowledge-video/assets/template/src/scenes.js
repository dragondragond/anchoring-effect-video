// Episode scenes. Replace these examples with the episode's own choreography.
// Every scene is a function (ctx, t) that returns early outside its bars and fades itself in and out.
// Plan: ① hook bars 1–9 (quiet intro) · ② title on the bass drop · ③… cases · turn in the breakdown · climax · end card.

const END_BAR = Math.max(3, Math.floor((DUR - OFF) / BAR) - 1); // end card starts two bars before the music ends

// ① hook example: two gauge cards, the viewer picks, the answer flips.
function sceneHook(ctx, t) {
  if (t > bt(9) + 0.2) return;
  const a = env(t, 0.5, bt(9) + 0.1, 1.2, 0.3);
  ctx.save(); ctx.globalAlpha *= a;
  const ra = ep(t, 1.0, 2.6, E.outQuint), rb = ep(t, 1.3, 2.9, E.outQuint);
  const fa = ep(t, bt(3) + 0.1, bt(3) + 2.0), fb = ep(t, bt(5) + 0.05, bt(5) + 1.5);
  const flip = ep(t, bt(7) + 0.1, bt(7) + 0.9);
  gaugeCard(ctx, W / 2 - 250, 480 + (1 - ra) * 50, '选项 A', 78, fa, C.gold, { alpha: ra, glow: flip, scale: 1 + 0.04 * flip });
  gaugeCard(ctx, W / 2 + 250, 480 + (1 - rb) * 50, '选项 B', 83, fb, C.blue, { alpha: rb * lerp(1, 0.4, flip) });
  ctx.restore();
}

// ③ case example: 200 dots appear from the shattered title, then split into two groups.
const DOTS = Array.from({ length: 200 }, (_, i) => {
  const g = i < 100 ? 0 : 1, k = i % 100;
  return { i, g, seed: hash(i, 5), grid: [W / 2 + (g ? 260 : -260) + ((k % 10) - 4.5) * 20, 420 + Math.floor(k / 10) * 20],
    split: [W / 2 + (g ? 420 : -420) + ((k % 10) - 4.5) * 20, 420 + Math.floor(k / 10) * 20] };
});
function sceneCase(ctx, t) {
  if (t < bt(11) - 0.5 || t > bt(17) + 0.8) return;
  const out = 1 - ep(t, bt(17), bt(17) + 0.7);
  const pts = titlePoints();
  ctx.save();
  for (const d of DOTS) {
    let [x, y] = pts[d.i];
    const p1 = E.inOut(prog(t, bt(11) - 0.15 + d.seed * 0.8, bt(11) + 1.3 + d.seed * 0.8));
    x = lerp(x, d.grid[0], p1); y = lerp(y, d.grid[1], p1);
    if (p1 > 0 && p1 < 1) y -= Math.sin(p1 * Math.PI) * 120 * hash(d.i, 23); // arc in flight
    const p2 = E.inOut(prog(t, bt(13) + 0.1 + d.seed * 0.6, bt(13) + 1.3 + d.seed * 0.6));
    x = lerp(x, d.split[0], p2); y = lerp(y, d.split[1], p2);
    ctx.globalAlpha = ep(t, bt(11) - 0.45, bt(11) - 0.1) * out;
    ctx.fillStyle = d.g ? C.blue : C.gold;
    ctx.beginPath(); ctx.arc(x, y, lerp(2.1, 5, p1), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  const la = ep(t, bt(15), bt(15) + 0.8) * out;
  text(ctx, '组 A', W / 2 - 420, 380, { size: 34, weight: 900, color: C.gold, alpha: la, ls: 4 });
  text(ctx, '组 B', W / 2 + 420, 380, { size: 34, weight: 900, color: C.blue, alpha: la, ls: 4 });
}

const SCENES = [
  sceneHook,
  (ctx, t) => sceneTitleCard(ctx, t, 9, 11),
  sceneCase,
  (ctx, t) => sceneEndCard(ctx, t, END_BAR),
];
