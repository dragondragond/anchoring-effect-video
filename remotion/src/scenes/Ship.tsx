import React from 'react';
import {At, Box, Crop, In, Shot} from '../v/kit';
import {AppWin, Browser, Game} from '../v/more';

const IW = 1535;
const IH = 784;

/* ---------- 82.54–85.5 再说一句，发布上线：对话里真实的那句（整窗） ---------- */
const Say: React.FC = () => (
  <Shot from={82.54} to={85.5}>
    <At x={210} y={104}>
      <AppWin file="pcs_08_result_publish.jpg">
        {(s) => (
          <>
            <Box x={1047} y={519} w={336} h={46} at={83.1} s={s} label="就说这一句" pos="left" fill={false} size={28} />
            <Box x={426} y={623} w={108} h={26} at={84.5} s={s} fill={false} />
          </>
        )}
      </AppWin>
    </At>
  </Shot>
);

/* ---------- 85.5–88.76 一个互联网链接，不用登录，谁点开都能玩 ----------
 * 地址栏里是发布后的真实链接；右上是豆包发布完成时的原话。 */
const Link: React.FC = () => (
  <Shot from={85.5} to={88.76}>
    <At x={120} y={170}>
      <Browser W={1040} hiAt={85.75}>
        <Game W={1040} clips={[{at: 85.5, to: 88.76, start: 12.0}]} />
      </Browser>
    </At>
    <At x={1210} y={200}>
      <In at={86.85} dir="left">
        <Crop file="pc_09_published.jpg" imgW={IW} imgH={IH} view={{x: 284, y: 482, w: 492, h: 36}} W={610}>
          {(s) => <Box x={688} y={488} w={72} h={24} at={87.05} s={s} fill={false} />}
        </Crop>
      </In>
    </At>
    <At x={1230} y={330}>
      <In at={87.7} dir="left">
        <Browser W={430} small>
          <Game W={430} clips={[{at: 87.5, to: 88.76, start: 20.5}]} />
        </Browser>
      </In>
    </At>
    <At x={1390} y={600}>
      <In at={88.05} dir="left">
        <Browser W={430} small>
          <Game W={430} clips={[{at: 87.9, to: 88.76, start: 27.5}]} />
        </Browser>
      </In>
    </At>
  </Shot>
);

export const Ship: React.FC = () => (
  <>
    <Say />
    <Link />
  </>
);
