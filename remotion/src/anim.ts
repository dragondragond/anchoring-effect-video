import {Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {COLD, SEGS} from './data/timemap';
import {FPS} from './theme';

/** 新时间线（剪过气口、加了冷开场）→ 原始逐字稿时间。冷开场期间返回负数。 */
export const srcFromNew = (n: number) => {
  if (n < COLD) return -100 + n;
  let lo = 0;
  let hi = SEGS.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (SEGS[mid].n <= n) lo = mid;
    else hi = mid - 1;
  }
  const g = SEGS[lo];
  return g.s + (n - g.n);
};

/** 原始逐字稿时间 → 新时间线（落在被剪掉的气口里时，吸附到下一段开头） */
export const newFromSrc = (s: number) => {
  for (const g of SEGS) {
    if (s < g.s) return g.n;
    if (s < g.s + g.d) return g.n + (s - g.s);
  }
  const last = SEGS[SEGS.length - 1];
  return last.n + (s - last.s);
};

/** 新时间线上的当前秒数 */
export const useNewT = () => useCurrentFrame() / FPS;

/** 当前“逐字稿时间”（秒）——所有场景都直接用逐字稿里的时间戳编排 */
export const useT = () => srcFromNew(useCurrentFrame() / FPS);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** 弹簧进度：at 秒开始，0 → 1 */
export const sp = (t: number, at: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  t < at ? 0 : spring({frame: (t - at) * FPS, fps: FPS, config: {damping: 16, stiffness: 140, mass: 0.7, ...cfg}});

/** 线性/缓动插值（自动夹紧） */
export const lerp = (t: number, a: number, b: number, from = 0, to = 1, ease: (x: number) => number = Easing.bezier(0.33, 0, 0.2, 1)) =>
  interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** 在 [from, to] 窗口内淡入淡出 */
export const win = (t: number, from: number, to: number, fin = 0.4, fout = 0.4) =>
  Math.min(clamp01((t - from) / fin), clamp01((to - t) / fout));

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
