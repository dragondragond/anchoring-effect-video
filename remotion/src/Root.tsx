import React from 'react';
import {Composition} from 'remotion';
import {Main, TOTAL_SECONDS} from './Main';
import {FPS} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Main"
    component={Main}
    durationInFrames={Math.round(TOTAL_SECONDS * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{captions: true, music: false}} // 用户默认不要程序合成的背景音；要的话改 true
  />
);
