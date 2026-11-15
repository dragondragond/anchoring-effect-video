import React from 'react';
import {useT} from '../anim';
import {At, Box, Hi, In, Kicker, Shot, Title} from '../v/kit';
import {AppWin, Game, Monitor, Ripple} from '../v/more';

/* 豆包电脑版的截图都是整窗原样露出（1535×784，带左侧边栏），不裁切、不推近 */
const WX = 210;
const WY = 104;

/* ---------- 41.48–46.3 打开豆包电脑版 → 点这里 → 切到「工作」 ----------
 * 本机豆包电脑版的真实界面（只截图，没有发送任何消息）。 */
const Open: React.FC = () => {
  const t = useT();
  const work = t >= 44.45;
  return (
    <Shot from={41.48} to={46.3}>
      <At x={WX} y={WY}>
        <AppWin file={work ? 'pcs_02_home_work.jpg' : 'pcs_01_home_chat.jpg'}>
          {(s) => (
            <>
              <Box x={908} y={318} w={160} h={48} at={43.3} out={45.3} s={s} label="点这里" pos="right" fill={false} size={28} />
              <Ripple x={988} y={342} at={44.3} s={s} />
            </>
          )}
        </AppWin>
      </At>
    </Shot>
  );
};

/* ---------- 46.3–49.16 选「游戏策划」→ 把想法发给它 ----------
 * 同一条对话的整窗截图：先框出指令开头的「游戏策划」标签，再框出整条指令。 */
const Send: React.FC = () => (
  <Shot from={46.3} to={49.16}>
    <At x={WX} y={WY}>
      <AppWin file="pcs_04_prompt_top.jpg">
        {(s) => (
          <>
            <Box x={800} y={90} w={92} h={27} at={46.55} out={47.75} s={s} fill={false} />
            <Box x={784} y={80} w={600} h={190} at={47.9} s={s} label="想法写在这，发出去" pos="left" fill={false} size={28} />
          </>
        )}
      </AppWin>
    </At>
  </Shot>
);

/* ---------- 49.16–55.94 接下来不用管：它自己拆步骤、写代码、开浏览器试玩、发现问题自己修 ----------
 * 截图是这次任务「共用时 27 分 49 秒」展开后的真实执行记录（整窗）。 */
const Steps: React.FC = () => {
  const t = useT();
  const second = t >= 53.7;
  return (
    <Shot from={49.16} to={55.94}>
      <At x={WX} y={WY}>
        <AppWin file={second ? 'pcs_07_steps_c.jpg' : 'pcs_06_steps_b.jpg'}>
          {(s) =>
            second ? (
              <>
                <Box x={426} y={155} w={214} h={26} at={53.85} out={54.75} s={s} label="上手玩一遍" pos="right" fill={false} size={28} />
                <Box x={426} y={195} w={958} h={56} at={54.85} s={s} label="发现两个问题，自己改掉" pos="bottom" fill={false} size={28} />
              </>
            ) : (
              <>
                <Box x={424} y={228} w={610} h={276} at={50.5} out={51.25} s={s} label="拆成几步" pos="right" fill={false} size={28} />
                <Box x={424} y={352} w={312} h={26} at={51.35} out={52.1} s={s} label="写代码" pos="right" fill={false} size={28} />
                <Box x={424} y={433} w={312} h={26} at={51.5} out={52.1} s={s} fill={false} />
                <Box x={424} y={553} w={536} h={28} at={52.2} s={s} label="自己开浏览器" pos="right" fill={false} size={28} />
              </>
            )
          }
        </AppWin>
      </At>
    </Shot>
  );
};

/* ---------- 55.94–59.72 不到半小时、两千多行代码、一个完整的游戏 ----------
 * 两个数字都是对话里的原数（共用时 27 分 49 秒；交付说明里的“单文件 2132 行”）。
 * 显示器里先停在游戏的开始菜单，说到“游戏就出来了”时开局。 */
const Done: React.FC = () => (
  <Shot from={55.94} to={59.72}>
    <At x={250} y={140}>
      <In at={56.0}>
        <Kicker>共用时</Kicker>
        <Title size={104}>
          <Hi at={56.3}>27 分 49 秒</Hi>
        </Title>
      </In>
    </At>
    <At x={1130} y={140}>
      <In at={57.05}>
        <Kicker>单文件</Kicker>
        <Title size={104}>
          <Hi at={57.3}>2132 行</Hi>
        </Title>
      </In>
    </At>
    <At x={568} y={390}>
      <In at={56.0}>
        <Monitor W={760}>
          <Game
            W={760}
            clips={[
              {at: 55.94, to: 57.9, start: 0, rate: 0.1},
              {at: 57.9, to: 59.72, start: 0.25},
            ]}
          />
        </Monitor>
      </In>
    </At>
  </Shot>
);

export const Make: React.FC = () => (
  <>
    <Open />
    <Send />
    <Steps />
    <Done />
  </>
);
