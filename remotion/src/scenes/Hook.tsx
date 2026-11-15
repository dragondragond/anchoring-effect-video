import React from 'react';
import {clamp01, useT} from '../anim';
import {CODE, CODE_FIRST_LINE} from '../data/code';
import {Arrow, At, Crop, Hi, In, Kicker, P, Paper, Real, Shot, Title, FONT, MONO} from '../v/kit';
import {Game, LightLabel, Monitor} from '../v/more';
import {GAME_AUDIO} from './cfg';

/* ---------- 0–10.23 钩子：游戏全屏。黑洞把晶石吸成一团 → 一刀 11 断 → 十二道激光 ----------
 * game.mp4 第 36.07 秒是“一刀 11 断”，对到 1.0 秒（“现在没有代码基础的小白”）；第 41.13 秒放大招，落在“赛博朋克版切水果”。 */
const Hero: React.FC = () => (
  <Shot from={-0.3} to={10.23} drift={false}>
    <Game W={1920} clips={[{at: 0, to: 10.23, start: 35.07, vol: 0.4 * GAME_AUDIO}]} />
    <At x={56} y={890}>
      <Real at={0.5}>豆包生成的游戏 · 真实运行画面</Real>
    </At>
    {/* 就这一条指令：对话里的原图 */}
    <At x={1050} y={520}>
      <In at={7.75}>
        <LightLabel size={26}>在豆包工作里发的，就这一条</LightLabel>
      </In>
    </At>
    <At x={1050} y={580}>
      <In at={7.45} dir="left">
        <Crop file="pc_04_prompt_top.jpg" imgW={1535} imgH={784} view={{x: 644, y: 80, w: 600, h: 190}} W={800} style={{boxShadow: '0 24px 60px rgba(0,0,0,0.5)'}} />
      </In>
    </At>
  </Shot>
);

/* ---------- 10.23–14.91 我一行代码都没写，全程只靠打字 ----------
 * 右：豆包写的源码原文在滚；左：我发的那句话（指令原文第一句）一个字一个字打出来。 */
const SAY = '请编写一个完整的、单文件 HTML 的《赛博刀锋：超载觉醒》霓虹切割解压游戏。';
const NoCode: React.FC = () => {
  const t = useT();
  const off = Math.max(0, t - 10.3) * 150;
  const LH = 31;
  const n = Math.floor(clamp01((t - 12.55) / 1.75) * SAY.length);
  const caret = Math.floor(t * 2.5) % 2 === 0;
  return (
    <Shot from={10.23} to={14.91}>
      {/* 右：源码 */}
      <At x={1010} y={128}>
        <In at={10.3} dir="left">
          <Kicker>它写的代码</Kicker>
        </In>
      </At>
      <At x={1010} y={184}>
        <In at={10.3} dir="left">
          <div style={{width: 770, height: 640, borderRadius: 14, overflow: 'hidden', background: '#1B1915', boxShadow: P.shadowBig}}>
            <div style={{height: 50, display: 'flex', alignItems: 'center', padding: '0 22px', fontFamily: MONO, fontSize: 19, color: '#A59E91', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>赛博刀锋-超载觉醒.html</div>
            <div style={{position: 'relative', height: 590, overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 0, top: 14 - off, fontFamily: MONO, fontSize: 18, lineHeight: `${LH}px`, whiteSpace: 'pre'}}>
                {CODE.map((l, i) => {
                  const cm = /^\s*(\/\/|\/\*|\*)/.test(l);
                  return (
                    <div key={i} style={{display: 'flex', height: LH}}>
                      <span style={{width: 74, textAlign: 'right', paddingRight: 18, color: '#6E675C', flexShrink: 0}}>{CODE_FIRST_LINE + i}</span>
                      <span style={{color: cm ? '#8A8376' : '#E6DFD0'}}>{l}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </In>
      </At>
      {/* 左：我发的话 */}
      <At x={140} y={330}>
        <In at={12.45}>
          <Kicker>我只打了字</Kicker>
        </In>
      </At>
      <At x={140} y={386}>
        <In at={10.5}>
          <Paper pad={38} style={{width: 720, minHeight: 236, boxSizing: 'border-box'}}>
            <div style={{fontFamily: FONT, fontSize: 40, fontWeight: 700, lineHeight: 1.55}}>
              {SAY.slice(0, n)}
              <span style={{display: 'inline-block', width: 4, height: 44, background: P.accent, marginLeft: 4, verticalAlign: -8, opacity: n < SAY.length && !caret ? 0.2 : 1}} />
            </div>
          </Paper>
        </In>
      </At>
      {t >= 13.7 ? <Arrow d="M 880 500 C 930 470, 960 468, 1000 480" at={13.75} /> : null}
    </Shot>
  );
};

/* ---------- 14.91–19.34 标题：用豆包工作，做个赛博朋克小游戏 ---------- */
const PLAN = ['发指令', '定性能', '发布上线', '手机接着改'];
const TitleCard: React.FC = () => (
  <Shot from={14.91} to={19.34}>
    <At x={140} y={276}>
      <In at={17.65}>
        <Kicker>保姆级教程</Kicker>
      </In>
    </At>
    <At x={140} y={330}>
      <In at={15.0}>
        <Title size={104}>用豆包工作</Title>
      </In>
      <In at={16.4}>
        <Title size={104}>
          做个<Hi at={16.7}>赛博朋克小游戏</Hi>
        </Title>
      </In>
    </At>
    <At x={144} y={690} style={{display: 'flex', gap: 22, alignItems: 'center'}}>
      {PLAN.map((s, i) => (
        <In key={s} at={17.9 + i * 0.22} dir="left" dist={18}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: FONT, whiteSpace: 'nowrap'}}>
            <span style={{fontFamily: MONO, fontSize: 22, fontWeight: 700, color: P.ink3}}>0{i + 1}</span>
            <span style={{fontSize: 32, fontWeight: 800, color: P.ink}}>{s}</span>
            {i < PLAN.length - 1 ? <span style={{fontSize: 26, color: P.ink3, marginLeft: 12}}>→</span> : null}
          </div>
        </In>
      ))}
    </At>
    <At x={1110} y={280}>
      <In at={15.0} dir="left">
        <Monitor W={700}>
          <Game W={700} clips={[{at: 14.91, to: 19.34, start: 31.4}]} />
        </Monitor>
      </In>
    </At>
  </Shot>
);

export const Hook: React.FC = () => (
  <>
    <Hero />
    <NoCode />
    <TitleCard />
  </>
);
