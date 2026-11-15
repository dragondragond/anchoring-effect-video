import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_OUT, clamp01, lerp, sp, useT, win} from '../anim';
import {CAPTIONS} from '../data/captions';
import {C, FONT, MONO} from '../theme';
import {hexA} from './ui';
import {useCover} from './fx';
import {BRAND, CHAPTERS, END, KEYWORDS} from '../data/story';

export {CHAPTERS, END};


/** 背景：纯净近黑 + 极淡网格 + 暗角 */
export const Background: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: -80,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          transform: `translate(${(t * 4) % 80}px, 0px)`,
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, black 30%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, black 30%, transparent 95%)',
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,255,255,0.035), transparent 70%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 85% at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};


/** 顶部信息条：品牌 + 章节进度 */
export const HUD: React.FC = () => {
  const t = useT();
  const cover = useCover();
  const o = win(t, (CHAPTERS[0]?.start ?? 0) + 0.1, 100000, 0.8, 0.8) * (1 - clamp01((t - END + 0.5) / 0.8)) * (1 - cover);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 110, opacity: o, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 72, top: 44, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 12, height: 12, borderRadius: 3, background: C.accent, transform: 'rotate(45deg)'}} />
        <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: C.dim, fontWeight: 700}}>{BRAND.name}</div>
        <div style={{fontSize: 20, color: C.faint}}>{BRAND.series}</div>
      </div>
      <div style={{position: 'absolute', right: 72, top: 36, display: 'flex', gap: 12}}>
        {CHAPTERS.map((ch) => {
          const active = t >= ch.start && t < ch.end;
          const done = t >= ch.end;
          const p = clamp01((t - ch.start) / (ch.end - ch.start));
          const ap = sp(t, ch.start, {damping: 20});
          return (
            <div key={ch.n} style={{display: 'flex', flexDirection: 'column', gap: 8, width: active ? 230 : 172}}>
              <div style={{display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden'}}>
                <span style={{fontFamily: MONO, fontWeight: 700, color: active || done ? ch.color : C.faint}}>{ch.n}</span>
                <span style={{color: active ? C.text : done ? C.dim : C.faint, fontWeight: 500}}>{ch.title}</span>
              </div>
              <div style={{height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
                <div style={{width: `${(done ? 1 : active ? p : 0) * 100}%`, height: '100%', background: active ? ch.color : 'rgba(255,255,255,0.45)', opacity: active ? 0.5 + 0.5 * ap : 0.7}} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** 字幕关键词（来自 story.KEYWORDS）统一用强调色 */
const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const KW: [RegExp, string][] = KEYWORDS.length ? [[new RegExp(KEYWORDS.map(esc).join('|'), 'g'), C.accent]] : [];

const highlight = (text: string, pop = 1) => {
  const marks: {s: number; e: number; c: string}[] = [];
  for (const [re, c] of KW) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const s = m.index;
      const e = s + m[0].length;
      if (!marks.some((k) => s < k.e && e > k.s)) marks.push({s, e, c});
    }
  }
  marks.sort((a, b) => a.s - b.s);
  const out: React.ReactNode[] = [];
  let i = 0;
  marks.forEach((m, k) => {
    if (m.s > i) out.push(text.slice(i, m.s));
    out.push(
      <span key={k} style={{color: C.accent, display: 'inline-block', transform: `scale(${pop})`, margin: '0 2px'}}>
        {text.slice(m.s, m.e)}
      </span>,
    );
    i = m.e;
  });
  if (i < text.length) out.push(text.slice(i));
  return out;
};

/** 底部字幕（由逐字稿整理而来，修正了大小写与断句） */
export const Captions: React.FC = () => {
  const t = useT();
  const cur = CAPTIONS.find((c) => t >= c.s - 0.05 && t < c.e + 0.12);
  if (!cur) return null;
  const inP = clamp01((t - cur.s + 0.05) / 0.12);
  const outP = clamp01((cur.e + 0.12 - t) / 0.1);
  const pk = sp(t, cur.s + 0.05, {damping: 9, stiffness: 220});
  const pop = 1 + 0.18 * Math.sin(Math.PI * clamp01(pk)) * (1 - clamp01((t - cur.s) / 0.5));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 64, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 58,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: 2,
          WebkitTextStroke: '10px rgba(0,0,0,0.92)',
          paintOrder: 'stroke fill',
          textShadow: '0 6px 18px rgba(0,0,0,0.6)',
          opacity: Math.min(inP, outP),
          transform: `translateY(${(1 - EASE_OUT(inP)) * 16}px) scale(${0.92 + 0.08 * EASE_OUT(inP)})`,
          whiteSpace: 'nowrap',
        }}
      >
        {highlight(cur.t, pop)}
      </div>
    </div>
  );
};

/** 章节卡 */
export const ChapterCard: React.FC<{idx: number}> = ({idx}) => {
  const t = useT();
  const ch = CHAPTERS[idx];
  const from = ch.start;
  const to = ch.card;
  if (t < from - 0.05 || t > to + 0.05) return null;
  const inP = sp(t, from, {damping: 18, stiffness: 90});
  const outP = lerp(t, to - 0.5, to, 0, 1);
  const o = clamp01((t - from) / 0.3) * (1 - outP);
  const sweep = lerp(t, from + 0.1, from + 1.1, 0, 1, EASE_OUT);
  const chars = Array.from(ch.title);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o, transform: `translateY(${-outP * 40}px)`, filter: outP > 0 ? `blur(${outP * 10}px)` : undefined}}>
            {/* 巨型描边数字 */}
      <div
        style={{
          position: 'absolute',
          right: 1920 - 790,
          top: 540,
          textAlign: 'right',
          transform: `translate(${(1 - inP) * -120}px, -54%)`,
          fontFamily: 'Inter',
          fontWeight: 900,
          fontSize: 420,
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: '2px rgba(255,255,255,0.28)',
          letterSpacing: -10,
        }}
      >
        {ch.n}
      </div>
      <div style={{position: 'absolute', left: 820, top: 540, transform: 'translateY(-50%)', fontFamily: FONT}}>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: ch.color, opacity: clamp01((t - from - 0.2) / 0.4), fontWeight: 700}}>
          PART {ch.n} / {String(CHAPTERS.length).padStart(2, '0')}
        </div>
        <div style={{fontSize: 118, fontWeight: 900, color: C.text, marginTop: 18, display: 'flex', letterSpacing: 4}}>
          {chars.map((c, i) => {
            const p = sp(t, from + 0.25 + i * 0.06, {damping: 14});
            return (
              <span key={i} style={{display: 'inline-block', opacity: clamp01(p * 1.5), transform: `translateY(${(1 - p) * 60}px)`, whiteSpace: 'pre'}}>
                {c}
              </span>
            );
          })}
        </div>
        <div style={{height: 3, width: 760 * sweep, marginTop: 26, background: ch.color}} />
        <div style={{fontFamily: MONO, fontSize: 26, color: C.dim, marginTop: 22, letterSpacing: 4, opacity: clamp01((t - from - 0.6) / 0.5)}}>{ch.en}</div>
      </div>
    </div>
  );
};
