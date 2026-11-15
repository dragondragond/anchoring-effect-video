import type React from 'react';

/** 所有 at/from/to 都是「原始逐字稿时间」（秒），渲染时自动映射到剪过气口的新时间线 */

export type Chapter = {
  n: string; // '01'
  title: string; // 章节标题
  en: string; // 英文副标题（等宽字体小字）
  start: number; // 章节开始（通常是“第一个/第二个…”那句的开始）
  end: number; // 章节结束
  card: number; // 章节卡在此刻退场，正文场景从这里开始
  color: string; // 一般统一 C.accent
};

/** 全屏大字砸屏：给全片最重要的 4–6 句话 */
export type Slam = {
  from: number;
  to: number;
  text: string;
  accent?: boolean; // true 时主文字用强调色（全片最多 1–2 次）
  sub?: string; // 副标题（强调色小字）
  pre?: string; // 砸屏前的铺垫文字（“一个高阶玩法…”）
  textAt?: number; // 主文字砸下的时刻（有 pre 时必填）
};

/** 终端“录屏”：用真实命令的真实输出做证据 */
export type TermLine = {
  at: number;
  cmd?: string; // 命令行（会逐字打出）
  text?: React.ReactNode; // 输出行
  color?: string;
  hl?: {at: number; color: string; tag?: string}; // 高亮 + 右侧标签
};
export type Term = {
  from: number;
  to: number;
  title: string; // 窗口标题，如 'zsh — ~/.codex'
  label: string; // 左上角说明，如 '我电脑上真实的记忆目录'
  lines: TermLine[];
  focus?: {at: number; line: number; scale: number; x?: number}; // 推近到某一行
  width?: number;
  fontSize?: number;
};

/** 冷开场：把全片金句 + 一组有冲击力的数据放在最前面 */
export type ColdOpenCfg = {
  lines: {text: React.ReactNode; at: number}[]; // at：相对冷开场人声开始的秒数
  stat?: {
    from: {text: string; label: string; countTo?: number; decimals?: number; unit?: string};
    to: {text: string; label: string; at: number};
  };
  tag?: string; // 底部小标签
  title: {kicker: string; main: React.ReactNode; at: number}; // at：新时间线秒数，一般 = COLD - 1.5
};
