import type React from 'react';
import {Hook} from './Hook';
import {Feel} from './Feel';
import {Make} from './Make';
import {Perf} from './Perf';
import {Ship} from './Ship';
import {PhoneS} from './PhoneS';
import {End} from './End';

/** 本片的所有场景（按顺序），每个场景内部用 <Shot from to> 自己控制出现时间 */
export const SCENES: React.FC[] = [Hook, Feel, Make, Perf, Ship, PhoneS, End];

/** 游戏全屏播放的时段（原始逐字稿时间）：这些时候不显示左上角流程条 */
export const FULLSCREEN: [number, number][] = [
  [0, 10.23],
  [19.34, 41.48],
  [78.2, 82.54],
];

/** 镜头切换点（原始逐字稿时间），配 swish */
export const CUTS = [10.23, 14.91, 19.34, 25.4, 28.45, 32.82, 37.42, 41.48, 46.3, 49.16, 55.94, 59.72, 65.27, 69.96, 72.75, 74.69, 78.2, 82.54, 85.5, 88.76, 92.12, 99.27, 102.55, 106.84, 113.79];
