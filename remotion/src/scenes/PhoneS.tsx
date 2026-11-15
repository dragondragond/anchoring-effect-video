import React from 'react';
import {EASE_IN_OUT, lerp, useT} from '../anim';
import {At, In, Label, P, Phone, Real, Shot} from '../v/kit';
import {Browser, Clip, Game, Laptop} from '../v/more';

const PW = 350;
const PX = 262;
const PY = 108;

const Dash: React.FC<{d: string; at: number; dur?: number}> = ({d, at, dur = 0.6}) => {
  const t = useT();
  const p = lerp(t, at, at + dur, 0, 1, EASE_IN_OUT);
  if (p <= 0) return null;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <path d={d} fill="none" stroke={P.ink} strokeWidth={4} strokeDasharray="12 12" style={{clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}} />
    </svg>
  );
};

/* ---------- 88.76–92.12 手机上打开也一样，手指就是刀 ----------
 * 手机里是同一个晶石版游戏按手机屏幕尺寸逐帧录的画面（不是真机录屏：真机录的时候已经换成水果了）。 */
const OnPhone: React.FC = () => (
  <Shot from={88.76} to={92.12}>
    <At x={PX} y={PY}>
      <Phone w={PW} screen={<Clip file="gphone.mp4" at={88.76} to={92.12} start={3.5} />} />
    </At>
    <Dash d="M 650 480 C 730 440, 800 440, 870 470" at={89.7} />
    <At x={684} y={386}>
      <In at={89.9}>
        <Label size={26}>同一个链接</Label>
      </In>
    </At>
    <At x={880} y={210}>
      <In at={88.85} dir="left">
        <Browser W={860}>
          <Game W={860} clips={[{at: 88.76, to: 92.12, start: 21.6}]} />
        </Browser>
      </In>
    </At>
  </Shot>
);

/* ---------- 92.12–99.27 不用回电脑前：手机豆包上说一句“把晶石换成西瓜和菠萝”，电脑那边自动改完 ----------
 * 手机里是真机录屏（打字那段 2 倍多速）；电脑里从头到尾就是那局一直开着的游戏，不配操作过程，
 * 新版本留到下一个镜头“刷新一下”再出现。 */
const Remote: React.FC = () => (
  <Shot from={92.12} to={99.27}>
    <At x={PX} y={PY}>
      <Phone
        w={PW}
        screen={
          <>
            <Clip file="phone1.mp4" at={92.12} to={93.6} start={0} rate={0.7} />
            <Clip file="phone1.mp4" at={93.6} to={97.6} start={1.0} rate={2.15} />
            <Clip file="phone1.mp4" at={97.6} to={99.27} start={9.6} rate={3} />
          </>
        }
      />
    </At>
    <At x={662} y={868}>
      <Real at={92.3}>手机上真实录屏</Real>
    </At>
    <At x={672} y={330}>
      <In at={93.95}>
        <Label size={26}>手机豆包</Label>
      </In>
    </At>
    <Dash d="M 650 450 C 740 390, 830 390, 925 430" at={94.2} />
    <In at={92.3} dir="left">
      <Laptop x={940} y={200} w={820} dark>
        <Game W={810} H={498} view={{x: 120, y: 0, w: 1680}} clips={[{at: 92.12, to: 99.27, start: 13.6}]} />
      </Laptop>
    </In>
  </Shot>
);

/* ---------- 99.27–102.55 还是同一个链接，刷新一下就是新版本 ----------
 * 手机：真机录屏里重新打开这个链接（已经是西瓜和菠萝）；电脑：同一个地址，刷新后换成水果版（水果版也是逐帧实录）。 */
const Refresh: React.FC = () => (
  <Shot from={99.27} to={102.55}>
    <At x={PX} y={PY}>
      <Phone w={PW} screen={<Clip file="phone2.mp4" at={99.27} to={102.55} start={7.0} rate={2} />} />
    </At>
    <At x={662} y={868}>
      <Real at={99.3}>手机上真实录屏</Real>
    </At>
    <At x={880} y={210}>
      <Browser W={860} hiAt={99.5} spinAt={100.45}>
        <Game
          W={860}
          clips={[
            {at: 99.27, to: 100.8, start: 24.0},
            {at: 100.8, to: 102.55, start: 6.7, file: 'fruit.mp4'},
          ]}
        />
      </Browser>
    </At>
  </Shot>
);

export const PhoneS: React.FC = () => (
  <>
    <OnPhone />
    <Remote />
    <Refresh />
  </>
);
