// Episode content: config, subtitles, corner annotations, data.
// Subtitles: [startBar, endBar, text]. 【】 = gold, 〔〕 = red. 1 bar = 4 beats (see bt() in engine.js).

const CONFIG = {
  title: '主题名',               // 2–5 characters reads best as the gold title
  titleEn: 'TOPIC NAME',
  tagline: '一句话说清这个现象',  // under the title card
  signature: 'LIGHT聊AI',
  quote: ['金句的前半句，', '后半句里的【关键词】标金色。'], // end card
  refs: [                        // end card, one string per line (2 short refs may share a line with "    ·    ")
    'Author A. & Author B. (Year) Journal Vol: pages',
  ],
  cover: { line1: '一句话卖点，', line2: '【关键词】标金色', pill: '反差标签' },
};

const SUBS = [
  [1, 3, '开头的钩子：让观众自己先体验一次这个现象。'],
  [3, 5, '给出第一个具体数字：【78%】。'],
  [5, 7, '抛出问题：你会选哪个？'],
  [7, 9, '反转：答案和直觉相反。'],
  [11, 13, '1986 年，第一个真实案例。'],
  [13, 15, '把数据拆开看——'],
  [15, 17, '在高能段最高点点题：这就是【主题名】。'],
];

// Each entry applies from bar `at` until the next one. year: null hides the corner.
const CORNERS = [
  { at: 1, year: null },
  { at: 11, year: '1986', sub: '地点 · 事件', cite: 'Author et al.  ·  Journal  ·  1986', cite2: '' },
  { at: 17, year: null },
];
