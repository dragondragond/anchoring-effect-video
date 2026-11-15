import React from 'react';
import {EASE_IN_OUT, EASE_OUT, clamp01, lerp, useT} from '../anim';
import {At, Box, CheckBox, Hi, In, Kicker, P, Sheet, Shot, FONT, MONO} from '../v/kit';
import {FULL, Game, LBox, Monitor, PromptDoc, panDV} from '../v/more';
import {GAME_AUDIO} from './cfg';

const IW = 1535;
const IH = 784;
const NEON = '#00f3ff';

/* ---------- 65.27–69.96 发光：不用画布阴影，改三层加算混合（线宽、透明度是指令里的原数） ---------- */
const LAYERS = [
  {name: '外发光', k: 2.8, a: 0.22, c: NEON, at: 68.0},
  {name: '中层光晕', k: 1.4, a: 0.55, c: NEON, at: 68.45},
  {name: '白色内芯', k: 0.5, a: 0.95, c: '#ffffff', at: 68.9},
];
const Glow: React.FC = () => {
  const t = useT();
  const strike = lerp(t, 66.55, 66.9, 0, 1, EASE_OUT);
  const W0 = 16;
  return (
    <div style={{width: 800, height: 600, borderRadius: 16, background: '#04040A', boxShadow: P.shadowBig, position: 'relative', fontFamily: FONT, color: '#E6DFD0'}}>
      {/* 画布阴影：划掉 */}
      <div style={{position: 'absolute', left: 48, top: 54, display: 'flex', alignItems: 'center', gap: 34}}>
        <span style={{fontFamily: MONO, fontSize: 38, fontWeight: 700}}>ctx.shadowBlur</span>
        <div style={{width: 230, height: 8, borderRadius: 4, background: '#fff', boxShadow: `0 0 12px 4px ${NEON}, 0 0 34px 12px ${NEON}`, opacity: 1 - strike * 0.65}} />
      </div>
      <div style={{position: 'absolute', left: 40, top: 76, width: 640 * strike, height: 6, borderRadius: 3, background: P.accent}} />
      <div style={{position: 'absolute', left: 48, top: 118, fontSize: 24, color: '#A59E91', opacity: clamp01((t - 66.9) / 0.2)}}>画布阴影，每一帧都要算模糊，最吃性能</div>

      {/* 三层 */}
      <div style={{position: 'absolute', left: 48, top: 214, fontSize: 26, fontWeight: 800, opacity: clamp01((t - 67.8) / 0.2)}}>
        改成三层线，<span style={{fontFamily: MONO}}>&apos;lighter&apos;</span> 加算混合
      </div>
      {LAYERS.map((l, i) => {
        const o = clamp01((t - l.at) / 0.2);
        return (
          <div key={l.name} style={{position: 'absolute', left: 48, top: 292 + i * 92, display: 'flex', alignItems: 'center', gap: 26, opacity: o}}>
            <div style={{width: 210, height: 60, display: 'flex', alignItems: 'center'}}>
              <div style={{width: 210 * lerp(t, l.at, l.at + 0.3, 0, 1, EASE_OUT), height: W0 * l.k, borderRadius: W0 * l.k, background: l.c, opacity: l.a}} />
            </div>
            <div>
              <div style={{fontSize: 26, fontWeight: 800}}>{l.name}</div>
              <div style={{fontFamily: MONO, fontSize: 20, color: '#A59E91', marginTop: 2}}>
                线宽 ×{l.k} · 透明度 {l.a}
              </div>
            </div>
          </div>
        );
      })}
      {/* 叠在一起 */}
      <div style={{position: 'absolute', left: 520, top: 300, width: 230, height: 250}}>
        {LAYERS.map((l) => (
          <div
            key={l.name}
            style={{
              position: 'absolute',
              left: 115 - (W0 * l.k) / 2,
              top: 10,
              width: W0 * l.k,
              height: 230,
              borderRadius: W0 * l.k,
              background: l.c,
              opacity: l.a * clamp01((t - l.at - 0.15) / 0.2),
              mixBlendMode: 'plus-lighter',
              transform: 'rotate(32deg)',
              transformOrigin: '50% 50%',
            }}
          />
        ))}
      </div>
      <div style={{position: 'absolute', left: 520, top: 560, width: 230, textAlign: 'center', fontSize: 22, color: '#A59E91', opacity: clamp01((t - 69.1) / 0.2)}}>叠起来的效果</div>
    </div>
  );
};

/* ---------- 69.96–72.75 粒子对象池：650 个开局建好，环形游标循环复用 ---------- */
const COLS = 50;
const ROWS = 13;
const Pool: React.FC = () => {
  const t = useT();
  const cur = Math.floor(540 + Math.max(0, t - 70.6) * 270) % 650;
  const built = Math.floor(lerp(t, 70.0, 70.55, 0, 650, EASE_OUT));
  return (
    <div style={{width: 800, fontFamily: FONT}}>
      <Kicker>粒子对象池</Kicker>
      <div style={{fontSize: 40, fontWeight: 900, color: P.ink, marginTop: 6, whiteSpace: 'nowrap'}}>
        <span style={{fontFamily: MONO}}>650</span> 个，开局一次建好
      </div>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${COLS}, 13px)`, gap: 3, marginTop: 30}}>
        {Array.from({length: COLS * ROWS}, (_, i) => {
          const d = (cur - i + 650) % 650;
          const active = t >= 70.6 && d < 80;
          return <div key={i} style={{width: 13, height: 13, borderRadius: 3, background: i >= built ? 'transparent' : d === 0 && t >= 70.6 ? P.ink : active ? P.accent : 'rgba(31,28,23,0.13)', opacity: active ? 1 - (d / 80) * 0.6 : 1}} />;
        })}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 30, opacity: clamp01((t - 71.6) / 0.2)}}>
        <svg width={44} height={44} viewBox="0 0 24 24">
          <path d="M19 12a7 7 0 1 1-2.1-5" fill="none" stroke={P.ink} strokeWidth={2.2} strokeLinecap="round" />
          <path d="M17.5 3.5v4h-4" fill="none" stroke={P.ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{fontSize: 30, fontWeight: 800, color: P.ink, whiteSpace: 'nowrap'}}>
          用到头，回到第一个，<Hi at={71.8}>接着用</Hi>
        </span>
      </div>
    </div>
  );
};

/* ---------- 72.75–74.69 分辨率上限：dpr 最多 1.25 ---------- */
const Dpr: React.FC = () => {
  const t = useT();
  const screen = lerp(t, 73.0, 74.2, 1, 3, EASE_IN_OUT);
  const canvas = Math.min(screen, 1.25);
  const X = (v: number) => ((v - 1) / 2) * 700;
  return (
    <div style={{width: 800, fontFamily: FONT}}>
      <Kicker>画布分辨率</Kicker>
      <div style={{fontFamily: MONO, fontSize: 31, fontWeight: 700, color: P.ink, marginTop: 14, whiteSpace: 'nowrap'}}>
        dpr = Math.min(devicePixelRatio, <Hi at={73.2}>1.25</Hi>)
      </div>
      <div style={{position: 'relative', height: 220, marginTop: 70, marginLeft: 20}}>
        <div style={{position: 'absolute', left: 0, top: 100, width: 700, height: 4, background: P.ink3, borderRadius: 2}} />
        {[1, 2, 3].map((v) => (
          <div key={v} style={{position: 'absolute', left: X(v) - 20, top: 118, width: 40, textAlign: 'center', fontFamily: MONO, fontSize: 22, color: P.ink2}}>
            {v}x
          </div>
        ))}
        {/* 上限线 */}
        <div style={{position: 'absolute', left: X(1.25) - 2, top: 40, width: 4, height: 124, background: P.ink}} />
        <div style={{position: 'absolute', left: X(1.25) + 14, top: 44, fontSize: 24, fontWeight: 800, color: P.ink, whiteSpace: 'nowrap', opacity: 1 - clamp01((t - 73.7) / 0.15)}}>上限 1.25</div>
        {/* 屏幕 */}
        <div style={{position: 'absolute', left: X(screen) - 15, top: 87, width: 30, height: 30, borderRadius: 15, border: `4px solid ${P.ink}`, background: P.paper, boxSizing: 'border-box'}} />
        <div style={{position: 'absolute', left: X(screen) - 60, top: 176, width: 120, textAlign: 'center', fontSize: 24, fontWeight: 700, color: P.ink2, whiteSpace: 'nowrap'}}>屏幕 {screen.toFixed(1)}x</div>
        {/* 画布 */}
        <div style={{position: 'absolute', left: X(canvas) - 13, top: 89, width: 26, height: 26, borderRadius: 13, background: P.accent}} />
        <div style={{position: 'absolute', left: X(canvas) - 90, top: 30, width: 180, textAlign: 'center', fontSize: 24, fontWeight: 800, color: P.accent, whiteSpace: 'nowrap', opacity: clamp01((t - 73.75) / 0.2)}}>画布停在这</div>
      </div>
    </div>
  );
};

/* ---------- 59.72–74.69 左：指令原文；右：游戏 → 三条性能要求的图解 ---------- */
const Rules: React.FC = () => {
  const t = useT();
  const scroll = lerp(t, 69.7, 70.3, 0, 250, EASE_IN_OUT);
  const stage = t < 65.27 ? 0 : t < 69.96 ? 1 : t < 72.75 ? 2 : 3;
  return (
    <Shot from={59.72} to={74.69}>
      <At x={110} y={104}>
        <PromptDoc
          w={800}
          h={770}
          scroll={scroll}
          marks={[
            {text: '一、 性能铁律（最高优先级，违者视为失败）', at: 62.6},
            {text: '绝对禁止使用 ctx.shadowBlur 和 ctx.shadowColor', at: 65.6},
            {text: '“三层绘制法”', at: 68.0},
            {text: '预分配粒子对象池（Object Pool）', at: 70.2},
            {text: '锁定画布分辨率上限', at: 73.0},
          ]}
        />
      </At>
      {stage === 0 ? (
        <At x={1010} y={250}>
          <In at={59.8} dir="left">
            <Monitor W={770}>
              <Game W={770} clips={[{at: 59.72, to: 65.27, start: 16.6}]}>
                {(s) => <LBox x={1352} y={46} w={134} h={64} at={60.9} s={s} label="帧率" pos="bottom" size={26} />}
              </Game>
            </Monitor>
          </In>
        </At>
      ) : null}
      {stage === 1 ? (
        <At x={1010} y={170}>
          <In at={65.27} dir="left">
            <Glow />
          </In>
        </At>
      ) : null}
      {stage === 2 ? (
        <At x={1010} y={230}>
          <In at={69.96} dir="left">
            <Pool />
          </In>
        </At>
      ) : null}
      {stage === 3 ? (
        <At x={1010} y={250}>
          <In at={72.75} dir="left">
            <Dpr />
          </In>
        </At>
      ) : null}
    </Shot>
  );
};

/* ---------- 74.69–78.20 它逐条照做，交付前自己开浏览器实测：豆包交付时的原话 ---------- */
const DONE = ['没用画布阴影', '650 个粒子对象池', 'dpr 上限 1.25'];
const Deliver: React.FC = () => (
  <Shot from={74.69} to={78.2}>
    <At x={240} y={170}>
      <Sheet file="pc_08b_result.jpg" imgW={IW} imgH={IH} w={1440} h={380} view={{x: 270, y: 356, w: 1000}} path={['豆包工作', '赛博刀锋：超载觉醒', '交付说明']}>
        {(s) => (
          <>
            <Box x={304} y={488} w={514} h={27} at={74.95} s={s} fill={false} />
            <Box x={781} y={419} w={238} h={26} at={76.1} s={s} label="自己开浏览器实测" pos="top" fill={false} size={28} />
            <Box x={577} y={447} w={110} h={26} at={77.5} s={s} fill={false} />
          </>
        )}
      </Sheet>
    </At>
    <At x={240} y={690} style={{display: 'flex', gap: 28}}>
      {DONE.map((x, i) => (
        <In key={x} at={75.0 + i * 0.28} dist={16}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, background: P.white, border: `2.5px solid ${P.ink}`, borderRadius: 12, padding: '16px 26px', boxShadow: P.shadow, fontFamily: FONT, fontSize: 32, fontWeight: 800, color: P.ink, whiteSpace: 'nowrap'}}>
            <CheckBox at={75.15 + i * 0.28} size={36} />
            {x}
          </div>
        </In>
      ))}
    </At>
  </Shot>
);

/* ---------- 78.20–82.54 满屏碎片 + 右上角帧率：游戏全屏（开局那次十二道激光，game.mp4 第 2.08 秒） ---------- */
const Burst: React.FC = () => {
  const t = useT();
  const view = t < 80.3 ? FULL : panDV(t, 80.3, 81.0, FULL, {x: 800, y: 0, w: 1120});
  return (
    <Shot from={78.2} to={82.54} drift={false}>
      <Game W={1920} view={view} clips={[{at: 78.2, to: 82.54, start: 1.68, vol: 0.5 * GAME_AUDIO}]}>
        {(s) => <LBox x={1352} y={46} w={134} h={64} at={80.75} s={s} />}
      </Game>
    </Shot>
  );
};

export const Perf: React.FC = () => (
  <>
    <Rules />
    <Deliver />
    <Burst />
  </>
);
