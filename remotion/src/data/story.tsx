/**
 * 每条视频唯一需要“填内容”的配置文件（场景本身写在 src/scenes/ 下）。
 * 所有时间都用原始逐字稿时间（秒），直接从 SRT 里抄。
 */
import {C} from '../theme';
import {Grad} from '../components/ui';
import type {Chapter, ColdOpenCfg, Slam, Term} from '../types';

export const BRAND = {name: 'BRAND', series: '系列名 / 本期主题'};

/** 最后一句口播结束的时间（片尾卡从这里开始） */
export const END = 60;

export const CHAPTERS: Chapter[] = [
  // {n: '01', title: '第一个机制', en: 'FIRST THING', start: 9.47, end: 58.6, card: 12.2, color: C.accent},
];

/** 字幕里要用强调色标出的关键词（精确匹配，越少越好） */
export const KEYWORDS: string[] = [];

export const SLAMS: Slam[] = [
  // {from: 28.8, to: 30.58, text: '很多人不知道', sub: '这里有个细节', accent: true},
];

export const TERMS: Term[] = [
  // {from: 132.63, to: 138.47, title: 'zsh — ~/xxx', label: '我电脑上真实的 xxx', lines: [{at: 132.7, cmd: 'ls -lh ~/xxx'}, {at: 133.4, text: '...'}]},
];

/** 镜头冲击点：关键元素出现的瞬间（轻推近 + 震动 + pop 音效） */
export const PUNCHES: number[] = [];

/** 镜头切换点：配快切音效（一般就是每个 Beat 的 from） */
export const CUTS: number[] = [];

/** 额外音效（原始时间）：{at, src: 'riser.wav' | 'impact.wav' | 'pop.wav' | 'pop_hi.wav' | 'whoosh.wav' | 'slam.wav', vol} */
export const EXTRA_SFX: {at: number; src: string; vol: number}[] = [];

export const COLD_OPEN: ColdOpenCfg | null = null;
/* 示例：
export const COLD_OPEN: ColdOpenCfg = {
  lines: [{text: '用最少的上下文', at: 0}, {text: <>换<Grad>最准确的判断</Grad></>, at: 1.6}],
  stat: {
    from: {text: '20.7 GB', countTo: 20.7, decimals: 1, unit: ' GB', label: '全部对话记录'},
    to: {text: '12 KB', label: '每次真正带上的记忆', at: 1.55},
  },
  tag: '4 个机制 · 同一个底层逻辑',
  title: {kicker: '一次讲透', main: <>Codex 最被忽略的 <Grad>4 个机制</Grad></>, at: 3.9},
};
*/
