/**
 * V2 视觉：实操笔记。浅色纸面 + 黑色文字 + 唯一一支荧光笔（黄）。
 * 真实素材（录屏、后台截图）是画面主体，标注直接画在素材上。
 */
import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {EASE_IN_OUT, EASE_OUT, clamp01, lerp, newFromSrc, sp, useT} from '../anim';
import {FONT, FPS, MONO} from '../theme';

type Style = React.CSSProperties;

/** 配色与 v3 一致：暖米白纸 + 暖黑字 + 陶土橙（唯一强调色） */
export const P = {
  paper: '#F3EEE3',
  ink: '#1F1C17',
  ink2: '#6E675C',
  ink3: '#A59E91',
  line: 'rgba(31,28,23,0.10)',
  white: '#FFFDF8',
  accent: '#D9622B',
  soft: 'rgba(217,98,43,0.15)',
  onAccent: '#FFFDF8',
  chrome: '#F7F2E8',
  grid: 'rgba(110,90,50,0.10)',
  shadow: '0 14px 34px rgba(90,65,25,0.13), 0 2px 6px rgba(90,65,25,0.08)',
  shadowBig: '0 24px 60px rgba(90,65,25,0.16)',
};
/** 标题用衬线（字体由 theme.ts 加载） */
export const SERIF = `'Noto Serif SC', 'Songti SC', serif`;
export {FONT, MONO};

/* ---------------- 时间与入场 ---------------- */

/** 一个镜头：[from, to] 内显示。硬切为主，只有很短的上移淡入 */
export const Shot: React.FC<{from: number; to: number; children: React.ReactNode; drift?: boolean}> = ({from, to, children, drift = true}) => {
  const t = useT();
  if (t < from - 0.01 || t > to + 0.01) return null;
  const i = EASE_OUT(clamp01((t - from) / 0.28));
  const o = Math.min(clamp01((t - from) / 0.12), clamp01((to - t) / 0.1));
  const k = drift ? 1 + 0.012 * clamp01((t - from) / Math.max(1, to - from)) : 1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o, transform: `translateY(${(1 - i) * 22}px) scale(${k})`}}>{children}</div>
  );
};

/** 元素入场：弹簧位移 + 淡入（不缩放、不虚化） */
export const In: React.FC<{at: number; children: React.ReactNode; dir?: 'up' | 'left' | 'right' | 'down' | 'none'; dist?: number; out?: number; style?: Style}> = ({
  at,
  children,
  dir = 'up',
  dist = 26,
  out,
  style,
}) => {
  const t = useT();
  const p = sp(t, at, {damping: 18, stiffness: 160});
  const o = clamp01((t - at) / 0.18) * (out !== undefined ? clamp01((out - t) / 0.2) : 1);
  const d = (1 - p) * dist;
  const tr = dir === 'up' ? `translateY(${d}px)` : dir === 'down' ? `translateY(${-d}px)` : dir === 'left' ? `translateX(${d}px)` : dir === 'right' ? `translateX(${-d}px)` : '';
  return <div style={{opacity: o, transform: tr, ...style}}>{children}</div>;
};

/** 绝对定位（左上角对齐） */
export const At: React.FC<{x: number; y: number; w?: number; children: React.ReactNode; center?: boolean; style?: Style}> = ({x, y, w, children, center, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, transform: center ? 'translate(-50%, -50%)' : undefined, ...style}}>{children}</div>
);

/* ---------------- 文字 ---------------- */

/** 荧光笔：在 at 时刻从左往右划过文字下半部 */
export const Hi: React.FC<{at: number; children: React.ReactNode; dur?: number}> = ({at, children, dur = 0.35}) => {
  const t = useT();
  const p = lerp(t, at, at + dur, 0, 1, EASE_IN_OUT);
  return (
    <span
      style={{
        color: p > 0.15 ? P.accent : undefined,
        backgroundImage: `linear-gradient(${P.soft}, ${P.soft})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 90%',
        backgroundSize: `${p * 100}% 42%`,
        padding: '0 0.08em',
        margin: '0 -0.08em',
        WebkitBoxDecorationBreak: 'clone',
      }}
    >
      {children}
    </span>
  );
};

/** 大标题（左对齐） */
export const Title: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: Style}> = ({children, size = 72, color = P.ink, style}) => (
  <div style={{fontFamily: SERIF, fontSize: size, fontWeight: 900, color, letterSpacing: 1, lineHeight: 1.22, whiteSpace: 'nowrap', ...style}}>{children}</div>
);

/** 小标签（灰色小字） */
export const Kicker: React.FC<{children: React.ReactNode; style?: Style}> = ({children, style}) => (
  <div style={{fontFamily: FONT, fontSize: 28, fontWeight: 700, color: P.ink3, letterSpacing: 3, ...style}}>{children}</div>
);

/** 黑底白字的标注签 */
export const Label: React.FC<{children: React.ReactNode; size?: number; accent?: boolean; style?: Style}> = ({children, size = 26, accent, style}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: accent ? P.accent : P.ink,
      color: accent ? P.onAccent : P.white,
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 800,
      padding: `${size * 0.28}px ${size * 0.6}px`,
      borderRadius: size * 0.3,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);

/** 打勾 / 打叉（会“画”出来） */
export const Tick: React.FC<{at: number; size?: number; no?: boolean; color?: string}> = ({at, size = 40, no, color = P.ink}) => {
  const t = useT();
  const p = lerp(t, at, at + 0.25, 0, 1, EASE_OUT);
  const d = no ? 'M5 5 L19 19 M19 5 L5 19' : 'M4 12.5 L10 18 L20 6';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', flexShrink: 0}}>
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};

/** 空复选框 / 勾选框 */
export const CheckBox: React.FC<{at?: number; size?: number; no?: boolean}> = ({at, size = 40, no}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.18, border: `3px solid ${P.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box'}}>
    {at !== undefined ? <Tick at={at} size={size * 0.8} no={no} /> : null}
  </div>
);

/** 纸片卡（白底 + 细边 + 软阴影） */
export const Paper: React.FC<{children: React.ReactNode; style?: Style; pad?: number}> = ({children, style, pad = 36}) => (
  <div
    style={{
      background: P.white,
      borderRadius: 14,
      border: `1px solid ${P.line}`,
      boxShadow: P.shadow,
      padding: pad,
      fontFamily: FONT,
      color: P.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------------- 素材 ---------------- */

/** 真实录屏：at = 开始播放的逐字稿时间，start = 录屏秒数 */
export const Vid: React.FC<{file: string; at: number; start: number; rate?: number; style?: Style}> = ({file, at, start, rate = 1, style}) => (
  <Sequence from={Math.max(0, Math.round(newFromSrc(at) * FPS))} layout="none">
    <OffthreadVideo src={staticFile(file)} trimBefore={Math.round(start * FPS)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style}} />
  </Sequence>
);

export const Pic: React.FC<{src: string; style?: Style}> = ({src, style}) => (
  <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style}} />
);

export const PH_W = 1080;
export const PH_H = 2404;

/** 手机：w 为屏幕宽度；children(s) 在屏幕坐标（1080 宽）里画标注 */
export const Phone: React.FC<{w: number; screen: React.ReactNode; children?: (s: number) => React.ReactNode; style?: Style}> = ({w, screen, children, style}) => {
  const s = w / PH_W;
  const h = PH_H * s;
  const b = Math.round(w * 0.03);
  return (
    <div style={{position: 'relative', width: w + b * 2, height: h + b * 2, padding: b, borderRadius: w * 0.12, background: '#211E19', boxShadow: '0 28px 64px rgba(90,65,25,0.22)', boxSizing: 'border-box', ...style}}>
      <div style={{position: 'relative', width: w, height: h, borderRadius: w * 0.095, overflow: 'hidden', background: '#F7F8F2'}}>
        {screen}
        <div style={{position: 'absolute', left: 0, top: 0, width: PH_W, height: PH_H, transform: `scale(${s})`, transformOrigin: '0 0'}}>{children ? children(s) : null}</div>
      </div>
    </div>
  );
};
export const phoneOuter = (w: number) => ({w: w + Math.round(w * 0.03) * 2, h: PH_H * (w / PH_W) + Math.round(w * 0.03) * 2});

/** 后台截图窗口：顶部是真实的点击路径（面包屑）；view 为截图坐标里的视窗 */
export type View = {x: number; y: number; w: number};
export const panView = (t: number, a: number, b: number, v0: View, v1: View): View => {
  const p = lerp(t, a, b, 0, 1, EASE_IN_OUT);
  return {x: v0.x + (v1.x - v0.x) * p, y: v0.y + (v1.y - v0.y) * p, w: v0.w + (v1.w - v0.w) * p};
};
export const Sheet: React.FC<{
  file: string;
  w: number;
  h: number;
  view: View;
  path: string[];
  pathAt?: number;
  imgW?: number;
  imgH?: number;
  host?: string;
  dark?: boolean;
  children?: (s: number) => React.ReactNode;
}> = ({file, w, h, view, path, pathAt = -100, imgW = 1568, imgH = 677, host = '', dark, children}) => {
  const t = useT();
  const s = w / view.w;
  return (
    <div style={{width: w, borderRadius: 14, overflow: 'hidden', border: `1px solid ${P.line}`, boxShadow: P.shadowBig, background: P.white}}>
      <div style={{height: 54, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', borderBottom: `1px solid ${P.line}`, background: P.chrome, fontFamily: FONT}}>
        {host ? <span style={{fontFamily: MONO, fontSize: 17, color: P.ink3, marginRight: 8}}>{host}</span> : null}
        {path.map((p, i) => {
          const last = i === path.length - 1;
          const o = last ? clamp01((t - pathAt) / 0.2) : 1;
          return (
            <React.Fragment key={p + i}>
              {i > 0 ? <span style={{color: P.ink3, fontSize: 22, opacity: o}}>›</span> : null}
              <span style={{fontSize: 22, fontWeight: last ? 800 : 500, color: last ? P.ink : P.ink2, opacity: o}}>{last ? <Hi at={pathAt + 0.1}>{p}</Hi> : p}</span>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: dark ? '#000' : '#F6F8F8'}}>
        <div style={{position: 'absolute', left: -view.x * s, top: -view.y * s, width: imgW, height: imgH, transform: `scale(${s})`, transformOrigin: '0 0'}}>
          <Img src={staticFile(file)} style={{width: imgW, height: imgH, display: 'block'}} />
          {children ? children(s) : null}
        </div>
      </div>
    </div>
  );
};

/** 素材上的荧光笔框（素材坐标）：半透明黄 + 正片叠底，字照样看得清；可带黑色标注签 */
export const Box: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  at: number;
  s: number;
  label?: React.ReactNode;
  pos?: 'top' | 'bottom' | 'left' | 'right';
  out?: number;
  size?: number;
  /** false：只描边不涂黄（框住大块录屏时用） */
  fill?: boolean;
}> = ({x, y, w, h, at, s, label, pos = 'top', out, size = 26, fill = true}) => {
  const t = useT();
  if (t < at) return null;
  const p = lerp(t, at, at + 0.3, 0, 1, EASE_OUT);
  const o = out !== undefined ? clamp01((out - t) / 0.2) : 1;
  const lp = sp(t, at + 0.12, {damping: 16});
  const place: Style =
    pos === 'top'
      ? {left: '50%', bottom: '100%', transform: `translate(-50%, ${-12 / s}px) scale(${1 / s})`, transformOrigin: 'bottom center'}
      : pos === 'bottom'
        ? {left: '50%', top: '100%', transform: `translate(-50%, ${12 / s}px) scale(${1 / s})`, transformOrigin: 'top center'}
        : pos === 'left'
          ? {right: '100%', top: '50%', transform: `translate(${-14 / s}px, -50%) scale(${1 / s})`, transformOrigin: 'right center'}
          : {left: '100%', top: '50%', transform: `translate(${14 / s}px, -50%) scale(${1 / s})`, transformOrigin: 'left center'};
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: o}}>
      {fill ? <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: 'rgba(31,28,23,0.05)', borderRadius: 4 / s}} /> : null}
      <div style={{position: 'absolute', inset: -3 / s, border: `${3.5 / s}px solid ${P.ink}`, borderRadius: 6 / s, opacity: p}} />
      {label ? (
        <div style={{position: 'absolute', ...place, opacity: clamp01((t - at - 0.1) / 0.15), whiteSpace: 'nowrap'}}>
          <div style={{transform: `translateY(${(1 - lp) * 8}px)`}}>
            <Label size={size}>{label}</Label>
          </div>
        </div>
      ) : null}
    </div>
  );
};

/** 遮挡（录屏上的头像等） */
export const Cover: React.FC<{x: number; y: number; w: number; h: number; c?: string}> = ({x, y, w, h, c = '#2B2B2E'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: c}} />
);

/** “真实素材”角标 */
export const Real: React.FC<{children: React.ReactNode; at: number}> = ({children, at}) => {
  const t = useT();
  return (
    <div style={{opacity: clamp01((t - at) / 0.2), display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: FONT, fontSize: 21, fontWeight: 700, color: P.ink2, background: 'rgba(255,255,255,0.85)', border: `1px solid ${P.line}`, borderRadius: 999, padding: '6px 16px', whiteSpace: 'nowrap'}}>
      <span style={{width: 9, height: 9, borderRadius: 5, background: P.ink}} />
      {children}
    </div>
  );
};

/* ---------------- 小票 ---------------- */
export const Receipt: React.FC<{w: number; head: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode; style?: Style}> = ({w, head, sub, children, style}) => (
  <div style={{width: w, filter: 'drop-shadow(0 14px 26px rgba(90,65,25,0.14))', ...style}}>
    <div style={{background: P.white, padding: '30px 34px 26px', fontFamily: FONT, color: P.ink}}>
      <div style={{fontSize: 30, fontWeight: 900}}>{head}</div>
      {sub ? <div style={{fontSize: 22, color: P.ink2, marginTop: 6}}>{sub}</div> : null}
      <div style={{borderTop: `2px dashed ${P.line}`, margin: '20px 0 8px'}} />
      {children}
    </div>
    <svg width={w} height={16} viewBox={`0 0 ${w} 16`} style={{display: 'block'}}>
      <path d={`M0 0 ${Array.from({length: Math.ceil(w / 24)}, (_, i) => `L${i * 24 + 12} 14 L${(i + 1) * 24} 0`).join(' ')} Z`} fill={P.white} />
    </svg>
  </div>
);

export const RRow: React.FC<{k: React.ReactNode; v: React.ReactNode; at: number; bold?: boolean}> = ({k, v, at, bold}) => (
  <In at={at} dir="up" dist={14}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0'}}>
      <span style={{fontSize: bold ? 30 : 26, color: bold ? P.ink : P.ink2, fontWeight: bold ? 800 : 500}}>{k}</span>
      <span style={{fontFamily: MONO, fontSize: bold ? 52 : 34, fontWeight: 700}}>{v}</span>
    </div>
  </In>
);

/* ---------------- 墨线箭头 ---------------- */
export const Arrow: React.FC<{d: string; at: number; width?: number}> = ({d, at, width = 3.5}) => {
  const id = 'a' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const t = useT();
  const p = lerp(t, at, at + 0.4, 0, 1, EASE_OUT);
  if (p <= 0) return null;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10" fill="none" stroke={P.ink} strokeWidth={2} />
        </marker>
      </defs>
      <path d={d} fill="none" stroke={P.ink} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} markerEnd={p > 0.95 ? `url(#${id})` : undefined} />
    </svg>
  );
};

/** 截图裁切卡：把素材的 view 区域缩放到宽 W；children(s) 在素材坐标里画标注 */
export const Crop: React.FC<{file: string; imgW: number; imgH: number; view: {x: number; y: number; w: number; h: number}; W: number; children?: (s: number) => React.ReactNode; style?: Style; bg?: string}> = ({file, imgW, imgH, view, W, children, style, bg = P.white}) => {
  const s = W / view.w;
  return (
    <div style={{position: 'relative', width: W, height: view.h * s, overflow: 'hidden', borderRadius: 12, border: `1px solid ${P.line}`, boxShadow: P.shadow, background: bg, ...style}}>
      <div style={{position: 'absolute', left: -view.x * s, top: -view.y * s, width: imgW, height: imgH, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <Img src={staticFile(file)} style={{width: imgW, height: imgH, display: 'block'}} />
        {children ? children(s) : null}
      </div>
    </div>
  );
};

/** 打码：素材坐标里的一块马赛克（只用于真正敏感的字段） */
export const Blur: React.FC<{x: number; y: number; w: number; h: number; c?: string}> = ({x, y, w, h, c = 'rgba(120,120,120,0.85)'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 4, background: `repeating-linear-gradient(90deg, ${c} 0 8px, rgba(90,90,90,0.9) 8px 16px)`, backdropFilter: 'blur(8px)'}} />
);
