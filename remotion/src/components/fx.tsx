import React from 'react';
import {TerminalSquare} from 'lucide-react';
import {EASE_IN_OUT, EASE_OUT, clamp01, lerp, sp, useNewT, useT, win} from '../anim';
import {COLD_OPEN, PUNCHES, SLAMS, TERMS} from '../data/story';
import {COLD, COLD_VOICE} from '../data/timemap';
import {C, FONT, MONO} from '../theme';
import type {Slam, Term} from '../types';
import {Tag, hexA} from './ui';

/* =============== 大字砸屏 =============== */
const SlamView: React.FC<{s: Slam}> = ({s}) => {
  const t = useT();
  if (t < s.from - 0.05 || t > s.to + 0.25) return null;
  const at = s.textAt ?? s.from;
  const o = win(t, s.from, s.to + 0.2, 0.12, 0.2);
  const p = clamp01((t - at) / 0.16);
  const hit = Math.exp(-Math.max(0, t - at) * 9);
  const shake = t >= at ? Math.sin(t * 95) * 14 * hit : 0;
  const flash = t >= at ? Math.exp(-(t - at) * 14) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(10,10,11,0.96)'}} />
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.12}} />
      {/* 速度线 */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.25 * (t >= at ? 1 : 0)}}>
        {new Array(28).fill(0).map((_, i) => {
          const a = (i / 28) * Math.PI * 2;
          const r0 = 380 + 60 * Math.sin(i * 7.1) + (t - at) * 900;
          return <line key={i} x1={960 + Math.cos(a) * r0} y1={540 + Math.sin(a) * r0} x2={960 + Math.cos(a) * (r0 + 260)} y2={540 + Math.sin(a) * (r0 + 260)} stroke="#fff" strokeWidth={2} strokeLinecap="round" />;
        })}
      </svg>
      {s.pre && t < at ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: FONT, fontSize: 80, fontWeight: 800, color: C.dim, transform: `scale(${0.9 + 0.1 * sp(t, s.from)})`}}>
          {s.pre}…
        </div>
      ) : null}
      {t >= at ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 540, transform: `translate(${shake}px, -50%)`, textAlign: 'center', fontFamily: FONT}}>
          <div
            style={{
              fontSize: 230,
              fontWeight: 900,
              letterSpacing: 10,
              lineHeight: 1.05,
              transform: `scale(${1.7 - 0.7 * EASE_OUT(p)})`,
              filter: `blur(${(1 - p) * 18}px)`,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{color: s.accent ? C.accent : C.text}}>{s.text}</span>
          </div>
          {s.sub ? <div style={{fontSize: 48, fontWeight: 700, color: C.accent, marginTop: 26, opacity: clamp01((t - at - 0.2) / 0.2), letterSpacing: 6}}>{s.sub}</div> : null}
        </div>
      ) : null}
    </div>
  );
};

export const Slams: React.FC = () => (
  <>
    {SLAMS.map((s, i) => (
      <SlamView key={i} s={s} />
    ))}
  </>
);

/* =============== 真实终端“录屏” =============== */
export const Redact: React.FC<{w: number; c?: string}> = ({w, c = '#9AA3B8'}) => (
  <span
    style={{
      display: 'inline-block',
      width: w,
      height: '0.9em',
      verticalAlign: 'middle',
      borderRadius: 6,
      background: `repeating-linear-gradient(90deg, ${hexA(c, 0.55)} 0 14px, ${hexA(c, 0.3)} 14px 22px, ${hexA(c, 0.45)} 22px 34px)`,
      filter: 'blur(3px)',
    }}
  />
);

const PROMPT = (
  <span>
    <span style={{color: C.accent}}>➜ </span>
    <span style={{color: C.dim}}>~ </span>
  </span>
);

const TermView: React.FC<{d: Term}> = ({d}) => {
  const t = useT();
  if (t < d.from - 0.05 || t > d.to + 0.25) return null;
  const o = win(t, d.from, d.to + 0.2, 0.18, 0.2);
  const W = d.width ?? 1500;
  const fs = d.fontSize ?? 26;
  const LH = fs * 1.62;
  const enter = sp(t, d.from, {damping: 18});
  // 聚焦推近
  const fp = d.focus ? lerp(t, d.focus.at, d.focus.at + 0.7, 0, 1, EASE_IN_OUT) : 0;
  const fy = d.focus ? 74 + d.focus.line * LH + LH / 2 : 0;
  const fx = d.focus?.x ?? W / 2;
  const scale = 1 + (d.focus ? (d.focus.scale - 1) * fp : 0);
  const H = 98 + d.lines.length * LH;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(4,5,8,0.9)'}} />
      <div style={{position: 'absolute', left: 60, top: 128, display: 'flex', gap: 14, alignItems: 'center', opacity: clamp01((t - d.from - 0.2) / 0.3)}}>
        <Tag color={C.red} size={22} solid>
          ● REC
        </Tag>
        <Tag color={C.text} size={22}>
          {d.label}
        </Tag>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 560,
          width: W,
          height: H,
          transform: `translate(-50%, -50%) translateY(${(1 - enter) * 60}px) scale(${scale}) translate(${(W / 2 - fx) * fp}px, ${(H / 2 - fy) * fp}px)`,
          transformOrigin: '50% 50%',
          borderRadius: 18,
          overflow: 'hidden',
          background: 'rgba(16,18,26,0.97)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
          fontFamily: MONO,
        }}
      >
        <div style={{height: 50, display: 'flex', alignItems: 'center', gap: 9, padding: '0 20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
          ))}
          <div style={{flex: 1, textAlign: 'center', fontSize: 18, color: C.dim, display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center'}}>
            <TerminalSquare size={18} /> {d.title}
          </div>
        </div>
        <div style={{padding: '24px 30px', fontSize: fs, lineHeight: `${LH}px`}}>
          {d.lines.map((l, i) => {
            if (t < l.at) return <div key={i} style={{height: LH}} />;
            const hl = l.hl && t >= l.hl.at ? clamp01((t - l.hl.at) / 0.2) : 0;
            let content: React.ReactNode = l.text;
            if (l.cmd !== undefined) {
              const n = Math.floor((t - l.at) * 38);
              const shown = l.cmd.slice(0, n);
              const done = n >= l.cmd.length;
              content = (
                <>
                  {PROMPT}
                  <span style={{color: C.text}}>{shown}</span>
                  {!done || Math.floor(t * 2.4) % 2 === 0 ? <span style={{color: C.text, opacity: 0.8}}>▌</span> : null}
                </>
              );
            }
            return (
              <div
                key={i}
                style={{
                  height: LH,
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: l.color ?? C.dim,
                  opacity: l.cmd !== undefined ? 1 : clamp01((t - l.at) / 0.08),
                  margin: '0 -12px',
                  padding: '0 12px',
                  borderRadius: 8,
                  background: hl ? hexA(l.hl!.color, 0.16 * hl) : undefined,
                  boxShadow: hl ? `inset 4px 0 0 ${l.hl!.color}` : undefined,
                }}
              >
                {content}
                {hl && l.hl!.tag ? (
                  <span style={{position: 'absolute', right: 14, top: '50%', transform: `translateY(-50%) scale(${0.7 + 0.3 * hl})`, opacity: hl}}>
                    <Tag color={l.hl!.color} size={fs * 0.72} solid>
                      {l.hl!.tag}
                    </Tag>
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Terms: React.FC = () => (
  <>
    {TERMS.map((d, i) => (
      <TermView key={i} d={d} />
    ))}
  </>
);

/** 被插入画面（砸屏、终端）覆盖的程度，用来把底下的场景压暗 */
export const useCover = () => {
  const t = useT();
  let c = 0;
  for (const s of SLAMS) c = Math.max(c, win(t, s.from, s.to + 0.2, 0.12, 0.2));
  for (const d of TERMS) c = Math.max(c, win(t, d.from, d.to + 0.2, 0.18, 0.2));
  return c;
};

/* =============== 镜头：呼吸推拉 + 重点冲击 =============== */
export const Camera: React.FC<{children: React.ReactNode}> = ({children}) => {
  const t = useT();
  const cover = useCover();
  let punch = 0;
  let shake = 0;
  for (const p of PUNCHES) {
    if (t >= p && t < p + 1) {
      const k = Math.exp(-(t - p) * 6) * clamp01((t - p) / 0.05);
      punch = Math.max(punch, k);
      shake += Math.sin((t - p) * 80) * 5 * Math.exp(-(t - p) * 12);
    }
  }
  const breathe = 1 + 0.018 * Math.sin(t * 0.21);
  const scale = breathe * (1 + 0.045 * punch) * (1 - 0.04 * cover);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${scale}) translate(${shake}px, ${shake * 0.4}px)`,
        opacity: 1 - 0.85 * cover,
        filter: cover > 0.02 ? `blur(${cover * 10}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

/* =============== 冷开场（由 story.COLD_OPEN 配置） =============== */
export const ColdOpen: React.FC = () => {
  const n = useNewT();
  const cfg = COLD_OPEN;
  if (!cfg || COLD <= 0 || n > COLD + 0.3) return null;
  const [v0] = COLD_VOICE;
  const out = lerp(n, COLD - 0.35, COLD, 0, 1);
  const hits = cfg.lines.map((l) => (n >= v0 + l.at ? Math.exp(-(n - v0 - l.at) * 8) : 0));
  const shake = Math.sin(n * 90) * 10 * Math.max(0, ...hits);
  const st = cfg.stat;
  const toAt = st ? v0 + st.to.at : 0;
  const kb = st ? sp(n, toAt, {damping: 11}) : 0;
  const cnt = st?.from.countTo !== undefined ? lerp(n, 0.15, 1.3, 0, st.from.countTo, EASE_OUT) : 0;
  const fromText = st ? (st.from.countTo !== undefined ? `${cnt.toFixed(st.from.decimals ?? 0)}${st.from.unit ?? ''}` : st.from.text) : '';
  const tp = clamp01((n - cfg.title.at) / 0.15);
  return (
    <div style={{position: 'absolute', inset: 0, background: C.bg, opacity: 1 - out, transform: `translateX(${shake}px) scale(${1 + out * 0.15})`, filter: out > 0 ? `blur(${out * 14}px)` : undefined, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: st ? 150 : 420, textAlign: 'center'}}>
        {cfg.lines.map((l, i) => {
          const p = clamp01((n - v0 - l.at) / 0.2);
          return (
            <span key={i} style={{fontSize: 92, fontWeight: 900, marginLeft: i ? 40 : 0, opacity: clamp01((n - v0 - l.at) / 0.12), display: 'inline-block', transform: `scale(${1.25 - 0.25 * p})`}}>
              {l.text}
            </span>
          );
        })}
      </div>
      {st ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 90, transform: `translateX(${(1 - kb) * 420}px)`}}>
          <div style={{textAlign: 'center', opacity: clamp01((n - 0.1) / 0.2), transform: `scale(${1 - 0.15 * kb})`}}>
            <div style={{fontFamily: MONO, fontSize: 150, fontWeight: 800, color: C.dim, minWidth: 640}}>{fromText}</div>
            <div style={{fontSize: 32, color: C.dim, fontWeight: 600, marginTop: 8}}>{st.from.label}</div>
          </div>
          <div style={{fontSize: 110, color: C.faint, opacity: kb, fontWeight: 200}}>→</div>
          <div style={{textAlign: 'center', opacity: clamp01((n - toAt + 0.05) / 0.1), transform: `scale(${1.6 - 0.6 * kb})`}}>
            <div style={{fontFamily: MONO, fontSize: 190, fontWeight: 800, color: C.accent}}>{st.to.text}</div>
            <div style={{fontSize: 32, color: C.text, fontWeight: 700, marginTop: 8}}>{st.to.label}</div>
          </div>
        </div>
      ) : null}
      {cfg.tag ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', justifyContent: 'center', opacity: clamp01((n - (st ? toAt : v0) - 0.5) / 0.3)}}>
          <Tag color={C.accent} size={26}>
            {cfg.tag}
          </Tag>
        </div>
      ) : null}
      {tp > 0 ? (
        <div style={{position: 'absolute', inset: 0, background: 'rgba(10,10,11,0.94)', opacity: tp, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
          <div style={{fontSize: 44, color: C.dim, fontWeight: 700, letterSpacing: 8}}>{cfg.title.kicker}</div>
          <div style={{fontSize: 118, fontWeight: 900, marginTop: 10, transform: `scale(${1.4 - 0.4 * clamp01((n - cfg.title.at) / 0.18)})`, whiteSpace: 'nowrap'}}>{cfg.title.main}</div>
        </div>
      ) : null}
    </div>
  );
};
