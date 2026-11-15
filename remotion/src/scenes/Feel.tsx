import React from 'react';
import {EASE_OUT, clamp01, lerp, useT} from '../anim';
import {G_COMBO, G_TIER} from '../data/game';
import {At, P, Shot, FONT, MONO} from '../v/kit';
import {FULL, Game, GClip, KeyCap, LightLabel, MouseIcon, gameFrame, panDV, pop} from '../v/more';
import {GAME_AUDIO} from './cfg';

/* ---------- 19.34–41.48 先看手感：游戏全屏 ----------
 * 时间都对着 game.mp4 的录制日志：
 *   6.55s  第一刀 -38° 斜切（切中黄金核，游戏自带慢动作）   → 21.0
 *   9.68s  第二刀 水平切                                     → 24.1
 *   11.3s  LV.2、16.2s LV.3、25.8s LV.4（连击 8 / 18 / 30）
 *   34.32s 按住右键开黑洞，36.07s 松手一刀 11 断
 *   41.13s 空格：十二道激光，连炸弹一起清掉 */
const V = GAME_AUDIO;
const C1: GClip = {at: 19.34, to: 25.4, start: 5.09};
const C2: GClip = {at: 25.4, to: 28.45, start: 11.5, vol: 0.9 * V};
const C3: GClip = {at: 28.45, to: 29.85, start: 10.5, rate: 0.6};
const C4: GClip = {at: 29.85, to: 30.77, start: 15.95};
const C5: GClip = {at: 30.77, to: 32.82, start: 31.5, vol: 0.5 * V};
const C6: GClip = {at: 32.82, to: 36.22, start: 34.03, rate: 0.6};
const C7: GClip = {at: 36.22, to: 37.42, start: 36.07, vol: 0.5 * V};
const C8: GClip = {at: 37.42, to: 41.48, start: 39.8, vol: 0.5 * V};
const CLIPS = [C1, C2, C3, C4, C5, C6, C7, C8];

const PAPER = 'rgba(243,238,227,0.96)';
const TIERS = ['LV.1 等离子青', 'LV.2 超导霓虹', 'LV.3 日冕黄金', 'LV.4 觉醒虹光'];
const Z1 = {x: 317, y: 0, w: 1400};

/** 切线：沿着刀的方向画一条虚线（游戏画面坐标） */
const CutLine: React.FC<{cx: number; cy: number; deg: number; at: number; out: number; len?: number}> = ({cx, cy, deg, at, out, len = 330}) => {
  const t = useT();
  if (t < at || t > out + 0.25) return null;
  const a = (deg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const p = lerp(t, at, at + 0.3, 0, 1, EASE_OUT);
  const o = clamp01((out + 0.2 - t) / 0.2);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o * 0.9}}>
      <line x1={cx - ux * len * p} y1={cy - uy * len * p} x2={cx + ux * len * p} y2={cy + uy * len * p} stroke={PAPER} strokeWidth={3.5} strokeDasharray="14 12" strokeLinecap="round" />
    </svg>
  );
};

export const Feel: React.FC = () => {
  const t = useT();
  let view = FULL;
  if (t >= 20.95 && t < 24.15) view = t < 23.6 ? panDV(t, 20.95, 21.6, FULL, Z1) : panDV(t, 23.6, 24.1, Z1, FULL);
  const combo = G_COMBO[Math.min(G_COMBO.length - 1, gameFrame(t, C2))] ?? 1;
  const cur = t < 29.85 ? C3 : t < 30.77 ? C4 : C5;
  const tier = t >= 28.45 && t < 32.82 ? (G_TIER[Math.min(G_TIER.length - 1, gameFrame(t, cur))] ?? 1) : 0;
  const hold = t >= 33.3 && t < 36.22;
  return (
    <Shot from={19.34} to={41.48} drift={false}>
      <Game W={1920} view={view} clips={CLIPS}>
        {() => (
          <>
            <CutLine cx={1017} cy={275} deg={-38} at={21.05} out={23.5} />
            <CutLine cx={1077} cy={265} deg={0} at={24.18} out={25.2} len={300} />
          </>
        )}
      </Game>

      {/* 21.9 切线 = 裂口 */}
      {t >= 21.95 && t < 23.55 ? (
        <At x={300} y={650} style={{opacity: Math.min(clamp01((t - 21.95) / 0.15), clamp01((23.55 - t) / 0.15))}}>
          <LightLabel>刀怎么划，它就怎么裂</LightLabel>
        </At>
      ) : null}

      {/* 25.4–28.45 连击数 + 五声音阶：数字取自录制日志里每一帧的连击 */}
      {t >= 25.45 && t < 28.45 ? (
        <At x={96} y={330} style={{opacity: Math.min(clamp01((t - 25.45) / 0.2), clamp01((28.45 - t) / 0.15)), color: PAPER, fontFamily: FONT}}>
          <div style={{fontFamily: MONO, fontSize: 26, fontWeight: 700, letterSpacing: 6, opacity: 0.8}}>连击</div>
          <div style={{fontSize: 150, fontWeight: 900, lineHeight: 1.05, fontFamily: MONO}}>×{combo}</div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 9, marginTop: 18, height: 150}}>
            {Array.from({length: 13}, (_, i) => {
              const on = i === Math.min(combo - 1, 12);
              const past = i < Math.min(combo - 1, 12);
              return <div key={i} style={{width: 22, height: 26 + i * 10, borderRadius: 5, background: on ? P.accent : PAPER, opacity: on ? 1 : past ? 0.75 : 0.22}} />;
            })}
          </div>
          <div style={{fontSize: 24, fontWeight: 700, marginTop: 14, opacity: 0.8}}>碎裂声的音高</div>
        </At>
      ) : null}

      {/* 28.45–32.82 刀光四阶：名字是游戏里自己的阶位名 */}
      {tier > 0 ? (
        <At x={96} y={470} style={{display: 'flex', flexDirection: 'column', gap: 14, opacity: Math.min(clamp01((t - 28.45) / 0.2), clamp01((32.82 - t) / 0.15))}}>
          {TIERS.map((n, i) =>
            i + 1 === tier ? (
              <LightLabel key={n} size={30}>
                {n}
              </LightLabel>
            ) : (
              <span key={n} style={{fontFamily: FONT, fontSize: 30, fontWeight: 800, color: PAPER, opacity: i + 1 < tier ? 0.6 : 0.3, padding: '8px 18px', whiteSpace: 'nowrap'}}>
                {n}
              </span>
            ),
          )}
        </At>
      ) : null}

      {/* 33.3–36.2 按住右键 */}
      {t >= 33.0 && t < 36.5 ? (
        <At x={1640} y={520} style={{opacity: Math.min(clamp01((t - 33.0) / 0.2), clamp01((36.5 - t) / 0.2)), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
          <div style={{transform: `scale(${0.9 + 0.1 * pop(t, 33.3)})`}}>
            <MouseIcon size={110} right={hold ? 1 : 0} />
          </div>
          <LightLabel size={24}>{hold ? '右键 · 按住' : t < 33.3 ? '右键' : '松手，一刀'}</LightLabel>
        </At>
      ) : null}

      {/* 37.5–38.7 能量条特写（同一段游戏画面里底部的大招按钮） */}
      {t >= 37.5 && t < 38.85 ? (
        <At x={611} y={650} style={{opacity: Math.min(clamp01((t - 37.5) / 0.2), clamp01((38.85 - t) / 0.15))}}>
          <div style={{border: `4px solid ${PAPER}`, borderRadius: 18, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.6)'}}>
            <Game W={690} H={158} view={{x: 524, y: 964, w: 426}} clips={[C8]} />
          </div>
        </At>
      ) : null}
      {/* 38.75 按空格 */}
      {t >= 38.2 && t < 39.5 ? (
        <At x={780} y={830} style={{opacity: Math.min(clamp01((t - 38.2) / 0.15), clamp01((39.5 - t) / 0.2))}}>
          <KeyCap w={360} label="SPACE" down={t >= 38.7 && t < 39.05 ? 1 : 0} />
        </At>
      ) : null}
    </Shot>
  );
};
