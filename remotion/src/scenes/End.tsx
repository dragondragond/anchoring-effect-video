import React from 'react';
import {EASE_IN_OUT, clamp01, lerp, sp, useT} from '../anim';
import {At, Box, Crop, Hi, In, Kicker, P, RRow, Receipt, Shot, Tick, SERIF} from '../v/kit';
import {Game, Monitor, PageWin, PromptDoc, Ripple} from '../v/more';

const IW = 1535;
const IH = 784;

/* ---------- 102.55–106.84 整个过程打包成一条指令，复制到豆包里就能用 ----------
 * 左：指令原文一路往下滚；右：这条指令里都写了什么（原文的五个大标题），最后“飞”进豆包工作的输入框（真实截图）。 */
const TOC = ['一、性能铁律', '二、核心数学与视觉算法', '三、物种与两大主动技能', '四、赛博背景与音效合成', '五、界面布局'];
const Pack: React.FC = () => {
  const t = useT();
  const scroll = lerp(t, 102.7, 105.5, 0, 980, (x) => x);
  const fly = lerp(t, 105.5, 106.2, 0, 1, EASE_IN_OUT);
  const fx = 1000 + (1290 - 1000) * fly;
  const fy = 420 + (690 - 420) * fly - Math.sin(fly * Math.PI) * 90;
  return (
    <Shot from={102.55} to={106.84}>
      <At x={140} y={104}>
        <PromptDoc w={820} h={770} scroll={scroll} />
      </At>
      <At x={1060} y={150}>
        <In at={102.9} dir="left">
          <Kicker>这一条指令里</Kicker>
        </In>
      </At>
      <At x={1060} y={210}>
        {TOC.map((x, i) => (
          <In key={x} at={103.1 + i * 0.3} dir="left" dist={18}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, fontSize: 36, fontWeight: 800, color: P.ink, whiteSpace: 'nowrap'}}>
              <Tick at={103.25 + i * 0.3} size={34} />
              {x}
            </div>
          </In>
        ))}
      </At>
      <At x={1060} y={640}>
        <In at={105.3} dir="left">
          <Crop file="pc_02_home_work.jpg" imgW={IW} imgH={IH} view={{x: 262, y: 662, w: 620, h: 116}} W={760}>
            {(s) => <Ripple x={430} y={700} at={106.2} s={s} />}
          </Crop>
        </In>
      </At>
      {/* 飞进输入框的那张指令 */}
      {fly > 0 && fly < 1 ? (
        <div style={{position: 'absolute', left: fx, top: fy, width: 86, height: 108, borderRadius: 10, background: P.white, border: `3px solid ${P.ink}`, boxShadow: P.shadow, transform: `rotate(${-8 + fly * 16}deg) scale(${1 - fly * 0.35})`, boxSizing: 'border-box', padding: '16px 14px'}}>
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} style={{height: 6, borderRadius: 3, background: k === 0 ? P.accent : P.ink3, width: `${[70, 100, 90, 100, 60][k]}%`, marginBottom: 9}} />
          ))}
        </div>
      ) : null}
    </Shot>
  );
};

/* ---------- 106.84–113.79 福利：豆包电脑版里“免费用豆包工作”活动页的真实页面 ----------
 * 整窗（带侧边栏）是真实截图；页面是五张真实滚动截图拼成的长图，在窗口里往下滚。
 * 页面上没有“三十天免费体验套餐”这一项，所以这句仍用一张小票（按口播内容画的）。 */
const Perk: React.FC = () => {
  const t = useT();
  const scroll = lerp(t, 111.0, 111.85, 0, 900, EASE_IN_OUT);
  return (
    <Shot from={106.84} to={113.79}>
      <At x={210} y={96}>
        <PageWin frame="perk_frame.jpg" page="perk_page.jpg" pageH={1868} scroll={scroll}>
          {(s) => (
            <>
              {/* 用豆包工作 额度天天送 */}
              <Box x={76} y={190} w={484} h={62} at={107.75} out={110.9} s={s} fill={false} />
              {/* 每日签到 +200 额度 */}
              <Box x={642} y={1263} w={529} h={102} at={111.9} s={s} fill={false} />
              {/* 做任务 +100 额度 */}
              <Box x={83} y={1001} w={1088} h={233} at={112.35} s={s} fill={false} />
            </>
          )}
        </PageWin>
      </At>
      <At x={1250} y={300}>
        <In at={108.85} out={110.95} dir="left">
          <div style={{transform: 'rotate(2deg)'}}>
            <Receipt w={440} head="新用户" sub="豆包电脑版">
              <RRow k="免费体验套餐" v={<Hi at={109.9}>30 天</Hi>} at={109.3} bold />
            </Receipt>
          </div>
        </In>
      </At>
    </Shot>
  );
};

/* ---------- 113.79–116.08 你最想切什么：晶石、西瓜菠萝，第三块屏留给你 ---------- */
const Ask: React.FC = () => {
  const t = useT();
  const q = sp(t, 114.2, {damping: 11, stiffness: 170});
  const W = 500;
  return (
    <Shot from={113.79} to={118}>
      <At x={120} y={300}>
        <In at={113.85}>
          <Monitor W={W}>
            <Game W={W} clips={[{at: 113.79, to: 117, start: 12.4}]} />
          </Monitor>
        </In>
      </At>
      <At x={698} y={300}>
        <In at={114.0}>
          <Monitor W={W}>
            <Game W={W} clips={[{at: 113.79, to: 117, start: 6.9, file: 'fruit.mp4'}]} />
          </Monitor>
        </In>
      </At>
      <At x={1276} y={300}>
        <In at={114.15}>
          <div style={{width: W + 24, height: (W * 9) / 16 + 24, borderRadius: 22, border: `5px dashed ${P.ink}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,253,248,0.6)'}}>
            <span style={{fontFamily: SERIF, fontSize: 210, fontWeight: 900, color: P.accent, lineHeight: 1, transform: `scale(${0.6 + 0.4 * q})`, opacity: clamp01((t - 114.2) / 0.15)}}>？</span>
          </div>
        </In>
      </At>
    </Shot>
  );
};

export const End: React.FC = () => (
  <>
    <Pack />
    <Perk />
    <Ask />
  </>
);
