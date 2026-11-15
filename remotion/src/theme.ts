import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {continueRender, delayRender, staticFile} from 'remotion';

loadInter('normal', {weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin']});
loadMono('normal', {weights: ['400', '500', '700'], subsets: ['latin']});

// 标题衬线：Noto Serif SC（纸面风）
if (typeof document !== 'undefined') {
  const h2 = delayRender('Noto Serif SC');
  new FontFace('Noto Serif SC', `url(${staticFile('NotoSerifSC.ttf')}) format('truetype')`, {weight: '200 900'})
    .load()
    .then((f) => {
      document.fonts.add(f);
      continueRender(h2);
    })
    .catch((e) => {
      console.error(e);
      continueRender(h2);
    });
}

// 中文字体：本地可变字重 Noto Sans SC
if (typeof document !== 'undefined') {
  const handle = delayRender('Noto Sans SC');
  const face = new FontFace('Noto Sans SC', `url(${staticFile('NotoSansSC.ttf')}) format('truetype')`, {weight: '100 900'});
  face
    .load()
    .then((f) => {
      document.fonts.add(f);
      continueRender(handle);
    })
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}

export const FONT = `Inter, 'Noto Sans SC', 'PingFang SC', sans-serif`;
export const MONO = `'JetBrains Mono', 'Noto Sans SC', monospace`;

/** 克制的色板：近黑 + 灰阶 + 唯一强调色（国际橙） */
export const ACCENT = '#FF5B1F';
export const C = {
  bg: '#0A0A0B',
  text: '#F2F2F0',
  dim: 'rgba(242,242,240,0.58)',
  faint: 'rgba(242,242,240,0.30)',
  line: 'rgba(255,255,255,0.09)',
  panel: 'rgba(255,255,255,0.03)',
  accent: ACCENT,
  // 以下为语义别名：强调统一走橙色，其余全部是灰阶
  blue: '#EDEDEB',
  cyan: ACCENT,
  violet: '#8E8E93',
  amber: ACCENT,
  red: ACCENT,
  green: '#EDEDEB',
  pink: '#BDBDC1',
};

export const FPS = 30;
