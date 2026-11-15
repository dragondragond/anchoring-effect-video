import React from 'react';
import {EASE_OUT, clamp01, lerp, sp, useT, win} from '../anim';
import {C, FONT, MONO} from '../theme';

type Style = React.CSSProperties;

/** 一个“镜头”：在 [from, to] 秒内可见，带淡入淡出和轻微的缩放/虚化 */
export const Beat: React.FC<{from: number; to: number; children: React.ReactNode; fin?: number; fout?: number; style?: Style}> = ({
  from,
  to,
  children,
  fin = 0.3,
  fout = 0.25,
  style,
}) => {
  const t = useT();
  if (t < from - 0.01 || t > to + 0.01) return null;
  const o = win(t, from, to, fin, fout);
  const inP = EASE_OUT(clamp01((t - from) / fin));
  const outP = clamp01((to - t) / fout);
  const dx = (1 - inP) * 140 - (1 - outP) * 160;
  const scale = 1.04 - 0.04 * inP + (1 - outP) * 0.05;
  const blur = (1 - inP) * 14 + (1 - outP) * 16;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: o,
        transform: `translateX(${dx}px) scale(${scale})`,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** 元素入场：弹簧驱动的位移 + 缩放 + 去模糊 */
export const Pop: React.FC<{
  at: number;
  children: React.ReactNode;
  dir?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  dist?: number;
  style?: Style;
  out?: number;
  damping?: number;
}> = ({at, children, dir = 'up', dist = 40, style, out, damping}) => {
  const t = useT();
  const p = sp(t, at, damping ? {damping} : {});
  const o = clamp01((t - at) / 0.25) * (out !== undefined ? clamp01((out - t) / 0.35) : 1);
  let tr = '';
  const d = (1 - p) * dist;
  if (dir === 'up') tr = `translateY(${d}px)`;
  if (dir === 'down') tr = `translateY(${-d}px)`;
  if (dir === 'left') tr = `translateX(${d}px)`;
  if (dir === 'right') tr = `translateX(${-d}px)`;
  if (dir === 'scale') tr = `scale(${0.6 + 0.4 * p})`;
  const blur = (1 - clamp01((t - at) / 0.3)) * 6;
  return <div style={{opacity: o, transform: tr, filter: blur > 0.05 ? `blur(${blur}px)` : undefined, ...style}}>{children}</div>;
};

/** 绝对定位辅助 */
export const Abs: React.FC<{x: number; y: number; w?: number; h?: number; center?: boolean; children: React.ReactNode; style?: Style}> = ({
  x,
  y,
  w,
  h,
  center = true,
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      transform: center ? 'translate(-50%, -50%)' : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

/** 玻璃质感卡片 */
export const Card: React.FC<{children: React.ReactNode; accent?: string; glow?: number; style?: Style; pad?: number}> = ({
  children,
  accent = C.blue,
  glow = 0,
  style,
  pad = 28,
}) => (
  <div
    className="card-shadow"
    style={{
      position: 'relative',
      borderRadius: 16,
      padding: pad,
      background: '#131315',
      border: `1px solid ${glow > 0.45 && accent === C.accent ? hexA(C.accent, 0.55) : glow > 0.45 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
      fontFamily: FONT,
      color: C.text,
      ...style,
    }}
  >
    {children}
  </div>
);

export const hexA = (hex: string, a: number) => {
  if (!hex.startsWith('#')) return hex;
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

/** 小标签 */
export const Tag: React.FC<{children: React.ReactNode; color?: string; size?: number; solid?: boolean; style?: Style}> = ({
  children,
  color = C.blue,
  size = 22,
  solid,
  style,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: `${size * 0.3}px ${size * 0.7}px`,
      borderRadius: 999,
      fontSize: size,
      fontWeight: 600,
      fontFamily: FONT,
      color: solid ? '#0A0B10' : color,
      background: solid ? color : 'transparent',
      border: `1px solid ${hexA(color, solid ? 1 : 0.5)}`,
      whiteSpace: 'nowrap',
      letterSpacing: 0.5,
      ...style,
    }}
  >
    {children}
  </span>
);

/** 文件名徽章 */
export const FileChip: React.FC<{name: string; color?: string; size?: number; icon?: React.ReactNode; style?: Style; glow?: number}> = ({
  name,
  color = C.blue,
  size = 26,
  icon,
  style,
  glow = 0,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.45,
      padding: `${size * 0.42}px ${size * 0.7}px`,
      borderRadius: size * 0.5,
      background: hexA(color, 0.1),
      border: `1px solid ${hexA(color, 0.55)}`,
      fontFamily: MONO,
      fontSize: size,
      fontWeight: 600,
      color: C.text,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {icon ?? <DocIcon color={color} size={size * 1.05} />}
    {name}
  </div>
);

export const DocIcon: React.FC<{color: string; size: number}> = ({color, size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 2.5h8.5L19.5 7.5V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V4A1.5 1.5 0 0 1 6 2.5Z" fill={hexA(color, 0.18)} stroke={color} strokeWidth="1.6" />
    <path d="M14 2.5V8h5.5" stroke={color} strokeWidth="1.6" />
    <path d="M8 12.5h8M8 16h5.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/** 渐变文字 */
export const Grad: React.FC<{children: React.ReactNode; from?: string; to?: string; solid?: string; style?: Style}> = ({children, solid, style}) => (
  <span style={{color: solid ?? C.accent, ...style}}>{children}</span>
);

/** 标题：段落大字 */
export const Heading: React.FC<{children: React.ReactNode; size?: number; style?: Style; sub?: React.ReactNode}> = ({children, size = 56, style, sub}) => (
  <div style={{fontFamily: FONT, color: C.text, textAlign: 'center', ...style}}>
    <div style={{fontSize: size, fontWeight: 800, letterSpacing: 1, whiteSpace: 'nowrap'}}>{children}</div>
    {sub ? <div style={{fontSize: size * 0.46, color: C.dim, marginTop: 14, fontWeight: 500}}>{sub}</div> : null}
  </div>
);

/** 逐字打出 */
export const Typewriter: React.FC<{text: string; at: number; cps?: number; cursor?: boolean; style?: Style}> = ({text, at, cps = 22, cursor = true, style}) => {
  const t = useT();
  const n = Math.max(0, Math.floor((t - at) * cps));
  const shown = Array.from(text).slice(0, n).join('');
  const done = n >= Array.from(text).length;
  const blink = Math.floor(t * 2.2) % 2 === 0;
  return (
    <span style={style}>
      {shown}
      {cursor && t >= at && (!done || blink) ? <span style={{opacity: 0.9, color: C.cyan}}>▍</span> : null}
    </span>
  );
};

/** SVG 连线：会“画”出来，并可带一个流动的光点 */
export const Connector: React.FC<{
  d: string;
  at: number;
  dur?: number;
  color?: string;
  width?: number;
  dashed?: boolean;
  flow?: boolean;
  arrow?: boolean;
  opacity?: number;
}> = ({d, at, dur = 0.7, color = C.blue, width = 3, dashed, flow = true, arrow = true, opacity = 1}) => {
  const t = useT();
  const id = 'm' + React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const p = lerp(t, at, at + dur, 0, 1, EASE_OUT);
  if (p <= 0) return null;
  const len = 2000;
  const dotP = ((t - at) * 0.55) % 1;
  return (
    <svg style={{position: 'absolute', inset: 0, overflow: 'visible', opacity}} width={1920} height={1080}>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={color} />
        </marker>
        <filter id={id + 'g'}>
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={Math.min(width, 2.5)}
        strokeLinecap="round"
        pathLength={len}
        strokeDasharray={dashed ? '14 14' : `${len}`}
        strokeDashoffset={dashed ? -(t * 40) : len * (1 - p)}
        style={{opacity: dashed ? p * 0.8 : 0.85}}
        markerEnd={arrow && p > 0.97 ? `url(#${id})` : undefined}
      />
      {flow && p >= 1 ? (
        <>
          <path d={d} fill="none" stroke="#fff" strokeWidth={width} pathLength={len} strokeDasharray={`30 ${len}`} strokeDashoffset={-dotP * len - 15} opacity={0.9} strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
};

/** 发光圆形图标底座 */
export const IconBadge: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: Style}> = ({children, color = C.blue, size = 72, style}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${color === C.accent ? hexA(C.accent, 0.5) : 'rgba(255,255,255,0.12)'}`,
      color,
      flexShrink: 0,
      ...style,
    }}
  >
    {children}
  </div>
);

/** 窗口外框（模拟应用窗口） */
export const Window: React.FC<{title: string; w: number; h: number; accent?: string; children?: React.ReactNode; glow?: number; style?: Style}> = ({
  title,
  w,
  h,
  accent = C.blue,
  children,
  glow = 0,
  style,
}) => (
  <Card accent={accent} glow={glow} pad={0} style={{width: w, height: h, overflow: 'hidden', ...style}}>
    <div style={{height: 46, display: 'flex', alignItems: 'center', gap: 9, padding: '0 18px', borderBottom: `1px solid ${C.line}`, background: 'rgba(255,255,255,0.03)'}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.85}} />
      ))}
      <div style={{marginLeft: 12, fontFamily: MONO, fontSize: 19, color: C.dim}}>{title}</div>
    </div>
    <div style={{padding: 22}}>{children}</div>
  </Card>
);

export const Row: React.FC<{children: React.ReactNode; gap?: number; style?: Style}> = ({children, gap = 16, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap, ...style}}>{children}</div>
);
