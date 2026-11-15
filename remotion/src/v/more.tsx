/**
 * 11.11 本期专用积木：游戏取景框（逐帧实录的 game.mp4）、显示器 / 笔记本 / 浏览器外框、
 * 指令原文纸、深色素材上用的浅色标注、按键与鼠标示意。
 * game.mp4：豆包生成的《赛博刀锋：超载觉醒》晶石版，在无头浏览器里用虚拟时钟逐帧录下（1920×1080，60fps，带游戏自己合成的原声）。
 */
import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {EASE_IN_OUT, EASE_OUT, clamp01, lerp, newFromSrc, sp, useT} from '../anim';
import {FPS} from '../theme';
import {PROMPT} from '../data/prompt';
import {Hi, Label, P, FONT, MONO, SERIF} from './kit';

type Style = React.CSSProperties;

/* ---------------- 录屏片段 ---------------- */

/** 一段素材：at~to 为逐字稿时间，start 为素材秒数；vol>0 时带素材原声 */
export const Clip: React.FC<{file: string; at: number; to: number; start: number; rate?: number; vol?: number; style?: Style}> = ({file, at, to, start, rate = 1, vol = 0, style}) => {
  const from = Math.max(0, Math.round(newFromSrc(at) * FPS));
  const dur = Math.max(1, Math.round(newFromSrc(to) * FPS) - from + 2);
  return (
    <Sequence from={from} durationInFrames={dur} layout="none">
      <OffthreadVideo
        src={staticFile(file)}
        trimBefore={Math.round(start * FPS)}
        playbackRate={rate}
        muted={vol <= 0}
        volume={vol}
        style={{width: '100%', height: '100%', objectFit: 'fill', display: 'block', ...style}}
      />
    </Sequence>
  );
};

/* ---------------- 游戏取景框 ---------------- */

export type DV = {x: number; y: number; w: number};
export const FULL: DV = {x: 0, y: 0, w: 1920};
export const panDV = (t: number, a: number, b: number, v0: DV, v1: DV, ease = EASE_IN_OUT): DV => {
  const p = lerp(t, a, b, 0, 1, ease);
  return {x: v0.x + (v1.x - v0.x) * p, y: v0.y + (v1.y - v0.y) * p, w: v0.w + (v1.w - v0.w) * p};
};

export type GClip = {at: number; to: number; start: number; rate?: number; vol?: number; file?: string};

/**
 * 游戏取景框：W×H 的窗口里显示游戏画面坐标（1920×1080）的 view 区域。
 * clips 可以给多段；children(s) 在游戏画面坐标里画标注。
 */
export const Game: React.FC<{
  W: number;
  H?: number;
  view?: DV;
  clips: GClip[];
  radius?: number;
  children?: (s: number) => React.ReactNode;
  style?: Style;
}> = ({W, H, view = FULL, clips, radius = 0, children, style}) => {
  const t = useT();
  const h = H ?? (W * 9) / 16;
  const s = W / view.w;
  return (
    <div style={{position: 'relative', width: W, height: h, overflow: 'hidden', background: '#04040A', borderRadius: radius, ...style}}>
      <div style={{position: 'absolute', left: -view.x * s, top: -view.y * s, width: 1920 * s, height: 1080 * s}}>
        {clips.map((c, i) =>
          t >= c.at - 0.6 && t <= c.to + 0.3 ? (
            <div key={i} style={{position: 'absolute', inset: 0, opacity: t >= c.at - 0.02 && t < c.to + 0.02 ? 1 : 0}}>
              <Clip file={c.file ?? 'game.mp4'} at={c.at} to={c.to} start={c.start} rate={c.rate} vol={c.vol} />
            </div>
          ) : null,
        )}
      </div>
      {children ? (
        <div style={{position: 'absolute', left: -view.x * s, top: -view.y * s, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0'}}>{children(s)}</div>
      ) : null}
    </div>
  );
};

/** 某段游戏片段在逐字稿时间 t 时，对应 game.mp4 的第几帧（60fps） */
export const gameFrame = (t: number, c: GClip) => Math.max(0, Math.round((c.start + (newFromSrc(t) - newFromSrc(c.at)) * (c.rate ?? 1)) * 60));

/** 显示器外框（深色细边 + 暖色投影） */
export const Monitor: React.FC<{W: number; children: React.ReactNode; style?: Style}> = ({W, children, style}) => (
  <div style={{width: W + 24, padding: 12, borderRadius: 22, background: '#1B1915', boxShadow: '0 30px 70px rgba(90,65,25,0.24)', boxSizing: 'border-box', ...style}}>
    <div style={{borderRadius: 12, overflow: 'hidden'}}>{children}</div>
  </div>
);

/** 浏览器窗口：地址栏里是发布后的真实链接 */
export const LINK = '4khet20v17vnb.doubao.link/app/app_17hspeky4zv';
export const Browser: React.FC<{W: number; children: React.ReactNode; hiAt?: number; spinAt?: number; small?: boolean; style?: Style}> = ({W, children, hiAt, spinAt, small, style}) => {
  const t = useT();
  const bar = small ? 40 : 58;
  const spin = spinAt !== undefined ? lerp(t, spinAt, spinAt + 0.5, 0, 360, EASE_IN_OUT) : 0;
  return (
    <div style={{width: W, borderRadius: small ? 12 : 16, overflow: 'hidden', border: `1px solid ${P.line}`, boxShadow: P.shadowBig, background: P.white, ...style}}>
      <div style={{height: bar, display: 'flex', alignItems: 'center', gap: small ? 8 : 14, padding: small ? '0 12px' : '0 20px', background: P.chrome, borderBottom: `1px solid ${P.line}`}}>
        {small ? null : (
          <svg width={26} height={26} viewBox="0 0 24 24" style={{transform: `rotate(${spin}deg)`, flexShrink: 0}}>
            <path d="M19 12a7 7 0 1 1-2.1-5" fill="none" stroke={P.ink2} strokeWidth={2.4} strokeLinecap="round" />
            <path d="M17.5 3.5v4h-4" fill="none" stroke={P.ink2} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <div style={{flex: 1, height: small ? 24 : 36, borderRadius: 18, background: P.white, border: `1px solid ${P.line}`, display: 'flex', alignItems: 'center', padding: small ? '0 10px' : '0 16px', fontFamily: MONO, fontSize: small ? 13 : 22, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden'}}>
          {hiAt !== undefined ? <Hi at={hiAt}>{LINK}</Hi> : LINK}
        </div>
      </div>
      <div style={{background: '#04040A'}}>{children}</div>
    </div>
  );
};

/** 线稿笔记本：屏幕里放内容 */
export const Laptop: React.FC<{x: number; y: number; w: number; children?: React.ReactNode; dark?: boolean}> = ({x, y, w, children, dark}) => {
  const h = w * 0.62;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w}}>
      <div style={{width: w, height: h, border: `5px solid ${P.ink}`, borderRadius: 14, background: dark ? '#04040A' : P.white, overflow: 'hidden', boxSizing: 'border-box', padding: dark ? 0 : 10}}>{children}</div>
      <div style={{width: w * 1.16, height: 22, marginLeft: -w * 0.08, background: P.ink, borderRadius: '0 0 14px 14px'}} />
    </div>
  );
};

/* ---------------- 深色素材上的标注（浅色） ---------------- */

/** 纸色底、黑字的标注签：放在深色游戏画面上 */
export const LightLabel: React.FC<{children: React.ReactNode; size?: number; style?: Style}> = ({children, size = 28, style}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      background: 'rgba(243,238,227,0.96)',
      color: P.ink,
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 800,
      padding: `${size * 0.26}px ${size * 0.6}px`,
      borderRadius: size * 0.3,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);

/** 深色素材上的浅色描边框（游戏画面坐标） */
export const LBox: React.FC<{x: number; y: number; w: number; h: number; at: number; s: number; out?: number; label?: React.ReactNode; pos?: 'top' | 'bottom' | 'left' | 'right'; size?: number}> = ({x, y, w, h, at, s, out, label, pos = 'top', size = 26}) => {
  const t = useT();
  if (t < at) return null;
  const p = lerp(t, at, at + 0.25, 0, 1, EASE_OUT);
  const o = out !== undefined ? clamp01((out - t) / 0.2) : 1;
  const place: Style =
    pos === 'top'
      ? {left: '50%', bottom: '100%', transform: `translate(-50%, ${-12 / s}px) scale(${1 / s})`, transformOrigin: 'bottom center'}
      : pos === 'bottom'
        ? {left: '50%', top: '100%', transform: `translate(-50%, ${12 / s}px) scale(${1 / s})`, transformOrigin: 'top center'}
        : pos === 'left'
          ? {right: '100%', top: '50%', transform: `translate(${-14 / s}px, -50%) scale(${1 / s})`, transformOrigin: 'right center'}
          : {left: '100%', top: '50%', transform: `translate(${14 / s}px, -50%) scale(${1 / s})`, transformOrigin: 'left center'};
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: o * p}}>
      <div style={{position: 'absolute', inset: -4 / s, border: `${3.5 / s}px solid rgba(243,238,227,0.96)`, borderRadius: 10 / s}} />
      {label ? (
        <div style={{position: 'absolute', ...place, whiteSpace: 'nowrap'}}>
          <LightLabel size={size}>{label}</LightLabel>
        </div>
      ) : null}
    </div>
  );
};

/** 键帽：down 为 0~1 的按下程度 */
export const KeyCap: React.FC<{w: number; h?: number; label: string; down?: number; size?: number}> = ({w, h = 84, label, down = 0, size = 30}) => (
  <div style={{position: 'relative', width: w, height: h + 12}}>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h, borderRadius: 16, background: 'rgba(31,28,23,0.9)'}} />
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: down * 10,
        height: h,
        borderRadius: 16,
        background: down > 0.5 ? P.accent : 'rgba(243,238,227,0.97)',
        border: `3px solid ${P.ink}`,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: 4,
        color: down > 0.5 ? P.white : P.ink,
      }}
    >
      {label}
    </div>
  </div>
);

/** 鼠标示意：right 为右键按下程度 */
export const MouseIcon: React.FC<{size?: number; right?: number}> = ({size = 120, right = 0}) => (
  <svg width={size} height={size * 1.5} viewBox="0 0 80 120">
    <rect x={6} y={6} width={68} height={108} rx={32} fill="rgba(243,238,227,0.97)" stroke={P.ink} strokeWidth={4} />
    <path d="M40 6 H42 A32 32 0 0 1 74 38 V52 H40 Z" fill={P.accent} opacity={right} />
    <line x1={40} y1={6} x2={40} y2={52} stroke={P.ink} strokeWidth={4} />
    <line x1={6} y1={52} x2={74} y2={52} stroke={P.ink} strokeWidth={4} />
    <rect x={6} y={6} width={68} height={108} rx={32} fill="none" stroke={P.ink} strokeWidth={4} />
  </svg>
);

/* ---------------- 指令原文纸 ---------------- */

const isHead = (l: string) => /^(#|[一二三四五]、|\d\. )/.test(l) || (l.endsWith('：') && l.length < 30);

/** 指令纸：marks 里的文字出现时用荧光笔标出；scroll 为向上滚动的像素 */
export const PromptDoc: React.FC<{w: number; h: number; scroll?: number; marks?: {text: string; at: number}[]; size?: number; style?: Style}> = ({w, h, scroll = 0, marks = [], size = 21, style}) => {
  const render = (line: string) => {
    for (const m of marks) {
      const i = line.indexOf(m.text);
      if (i >= 0)
        return (
          <>
            {line.slice(0, i)}
            <Hi at={m.at}>
              <b>{m.text}</b>
            </Hi>
            {line.slice(i + m.text.length)}
          </>
        );
    }
    return line;
  };
  return (
    <div style={{width: w, borderRadius: 14, overflow: 'hidden', border: `1px solid ${P.line}`, boxShadow: P.shadowBig, background: P.white, ...style}}>
      <div style={{height: 54, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', borderBottom: `1px solid ${P.line}`, background: P.chrome, fontFamily: FONT}}>
        <span style={{fontSize: 22, fontWeight: 800, color: P.ink}}>发给豆包的指令</span>
        <span style={{fontSize: 18, color: P.ink3}}>原文</span>
      </div>
      <div style={{position: 'relative', height: h, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: -scroll, padding: '22px 30px', fontFamily: FONT, fontSize: size, lineHeight: 1.7, color: P.ink}}>
          {PROMPT.map((l, i) => (
            <div key={i} style={{marginBottom: isHead(l) ? 4 : 9, marginTop: /^(#|[一二三四五]、)/.test(l) && i > 0 ? 16 : 0, fontWeight: isHead(l) ? 800 : 400, fontSize: /^(#|[一二三四五]、)/.test(l) ? size + 3 : size}}>
              {render(l)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** 点击波纹（素材坐标） */
export const Ripple: React.FC<{x: number; y: number; at: number; s?: number}> = ({x, y, at, s = 1}) => {
  const t = useT();
  if (t < at || t > at + 0.45) return null;
  const p = (t - at) / 0.45;
  const r = (14 + p * 30) / s;
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, border: `${3 / s}px solid ${P.ink}`, opacity: 1 - p}} />;
};

/** 豆包电脑版整窗截图：整个窗口原样露出，不裁切；children 画在截图坐标里（s 是缩放比） */
export const AppWin: React.FC<{file: string; W?: number; imgW?: number; imgH?: number; children?: (s: number) => React.ReactNode}> = ({file, W = 1500, imgW = 1535, imgH = 784, children}) => {
  const s = W / imgW;
  return (
    <div style={{position: 'relative', width: W, height: imgH * s, borderRadius: 14, overflow: 'hidden', border: `1px solid ${P.line}`, boxShadow: P.shadowBig, background: P.white}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: imgW, height: imgH, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <Img src={staticFile(file)} style={{width: imgW, height: imgH, display: 'block'}} />
        {children ? children(s) : null}
      </div>
    </div>
  );
};

/** 豆包电脑版整窗 + 窗口里的网页可滚动：frame 是整窗截图，page 是把几张真实滚动截图拼成的长页面；
 * children 画在页面坐标里，跟着页面一起滚（s 是缩放比） */
export const PageWin: React.FC<{frame: string; page: string; pageH: number; scroll: number; W?: number; children?: (s: number) => React.ReactNode}> = ({frame, page, pageH, scroll, W = 1500, children}) => {
  const imgW = 1535;
  const imgH = 784;
  const PX = 280;
  const PY = 112;
  const PW = 1255;
  const PH = 672;
  const s = W / imgW;
  return (
    <div style={{position: 'relative', width: W, height: imgH * s, borderRadius: 14, overflow: 'hidden', border: `1px solid ${P.line}`, boxShadow: P.shadowBig, background: P.white}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: imgW, height: imgH, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <Img src={staticFile(frame)} style={{width: imgW, height: imgH, display: 'block'}} />
        <div style={{position: 'absolute', left: PX, top: PY, width: PW, height: PH, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: -scroll, width: PW, height: pageH}}>
            <Img src={staticFile(page)} style={{width: PW, height: pageH, display: 'block'}} />
            {children ? children(s) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

/** 弹一下的进度 */
export const pop = (t: number, at: number) => sp(t, at, {damping: 14, stiffness: 200});

export {Label, SERIF};
