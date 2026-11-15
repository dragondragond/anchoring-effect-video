/**
 * 11.11《豆包做赛博朋克切水果》：实操笔记风（纸面），延续豆包系列。
 * 主角是豆包真实生成的游戏（逐帧实录）+ 豆包电脑版真实对话截图 + 手机真实录屏。
 */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {EASE_OUT, clamp01, newFromSrc, useT} from './anim';
import {CAPTIONS} from './data/captions';
import {FONT, FPS, MONO} from './theme';
import {Hi, P} from './v/kit';
import {CUTS, FULLSCREEN, SCENES} from './scenes';

/** 片长：最后一句口播结束后只留 0.3 秒 */
export const TOTAL_SECONDS = newFromSrc(CAPTIONS[CAPTIONS.length - 1].e) + 0.3;

/** 左上角流程条 */
export const STEPS = [
  {n: '01', t: '发指令', start: 41.48, end: 59.72},
  {n: '02', t: '定性能', start: 59.72, end: 82.54},
  {n: '03', t: '发布上线', start: 82.54, end: 88.76},
  {n: '04', t: '手机接着改', start: 88.76, end: 102.55},
];

/** 背景：方格纸 */
const GRID = 48;
const PaperBg: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: P.paper, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: -80,
          backgroundImage: `linear-gradient(${P.grid} 1px, transparent 1px), linear-gradient(90deg, ${P.grid} 1px, transparent 1px)`,
          backgroundSize: `${GRID}px ${GRID}px`,
          transform: `translate(${(t * 4) % GRID}px, 0px)`,
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, black 30%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, black 30%, transparent 95%)',
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,255,255,0.35), transparent 70%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 85% at 50% 50%, transparent 60%, rgba(120,95,50,0.10) 100%)'}} />
    </AbsoluteFill>
  );
};

const Rail: React.FC = () => {
  const t = useT();
  let o = Math.min(clamp01((t - 41.45) / 0.3), clamp01((102.5 - t) / 0.3));
  for (const [a, b] of FULLSCREEN) if (t > a - 0.05 && t < b) o = 0;
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 96, top: 30, display: 'flex', gap: 34, opacity: o, fontFamily: FONT, alignItems: 'baseline'}}>
      {STEPS.map((s) => {
        const cur = t >= s.start && t < s.end;
        const done = t >= s.end;
        return (
          <div key={s.n} style={{display: 'flex', gap: 10, alignItems: 'baseline', color: cur ? P.ink : done ? P.ink2 : P.ink3}}>
            <span style={{fontFamily: MONO, fontSize: 20, fontWeight: 700}}>{s.n}</span>
            <span style={{fontSize: 26, fontWeight: cur ? 900 : 600}}>{cur ? <Hi at={s.start}>{s.t}</Hi> : s.t}</span>
            {done ? <span style={{fontSize: 22}}>✓</span> : null}
          </div>
        );
      })}
    </div>
  );
};

/** 字幕：暖黑字 + 纸色底，关键词陶土橙 */
const KW = ['一行代码都没写', '半小时', '60', '三十天'];
const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const KWRE = new RegExp(KW.map(esc).join('|'), 'g');
const mark = (text: string) => {
  const out: React.ReactNode[] = [];
  let i = 0;
  let m: RegExpExecArray | null;
  KWRE.lastIndex = 0;
  while ((m = KWRE.exec(text))) {
    if (m.index > i) out.push(text.slice(i, m.index));
    out.push(
      <span key={m.index} style={{color: P.accent}}>
        {m[0]}
      </span>,
    );
    i = m.index + m[0].length;
  }
  if (i < text.length) out.push(text.slice(i));
  return out;
};
const Captions: React.FC = () => {
  const t = useT();
  const cur = CAPTIONS.find((c) => t >= c.s - 0.05 && t < c.e + 0.1);
  if (!cur) return null;
  const inP = EASE_OUT(clamp01((t - cur.s + 0.05) / 0.12));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 46, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 48,
          fontWeight: 800,
          color: P.ink,
          background: 'rgba(243,238,227,0.94)',
          borderRadius: 12,
          padding: '6px 24px 8px',
          letterSpacing: 1.5,
          whiteSpace: 'nowrap',
          opacity: inP,
          transform: `translateY(${(1 - inP) * 10}px)`,
        }}
      >
        {mark(cur.t)}
      </div>
    </div>
  );
};

/** 音效：镜头切换 swish、每步开场 whoosh；不放 pop、不放合成背景音。游戏原声跟着游戏画面走（见 scenes 里的 vol）。 */
const SFX: {at: number; src: string; vol: number}[] = [
  ...CUTS.filter((at) => !STEPS.some((s) => Math.abs(s.start - at) < 0.05)).map((at) => ({at: at - 0.06, src: 'swish.wav', vol: 0.13})),
  ...STEPS.map((s) => ({at: s.start - 0.15, src: 'whoosh.wav', vol: 0.22})),
];

export const Main: React.FC<{captions: boolean; music: boolean}> = ({captions}) => {
  return (
    <AbsoluteFill style={{backgroundColor: P.paper, color: P.ink, fontFamily: FONT}}>
      <PaperBg />
      {SCENES.map((S, i) => (
        <S key={i} />
      ))}
      <Rail />
      {captions ? <Captions /> : null}
      <Audio src={staticFile('voice_edit.wav')} volume={0.9} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(newFromSrc(s.at) * FPS))} durationInFrames={3 * FPS} layout="none">
          <Audio src={staticFile(s.src)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
