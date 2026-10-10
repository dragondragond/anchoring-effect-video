// Episode content: config, subtitles, corner annotations.
// Subtitles: [startBar, endBar, text]. 【】 = gold, 〔〕 = red. 1 bar = 4 beats (see bt() in engine.js).

const CONFIG = {
  title: '冰立方',
  titleEn: 'ICECUBE NEUTRINO OBSERVATORY',
  tagline: '2026 诺贝尔物理学奖 · 在南极冰下捕捉幽灵粒子',
  signature: 'LIGHT聊AI',
  quote: ['要看清宇宙最远的地方，', '先得沉进【两公里的黑暗】。'],
  refs: [
    'Halzen F. & Learned J.G. (1988) High energy neutrino detection in deep polar ice    ·    Spiering C. (2012) Eur. Phys. J. H 37: 515',
    'IceCube Collaboration: Science (2013) · Science (2018) · Science (2023)    ·    NobelPrize.org (2026)',
  ],
  cover: { line1: '每秒 650 亿个穿过你的指甲盖', line2: '要抓住它，得用【一立方公里的冰】', pill: '2026 诺贝尔物理学奖' },
};

const SUBS = [
  // ① hook — the viewer feels it first
  [1, 3, '伸出一根手指，看着你的指甲盖。'],
  [3, 5, '这几秒里，已有几千亿个粒子穿过了它。'],
  [5, 7, '它们来自太阳，也来自宇宙深处。'],
  [7, 8, '穿过你，穿过整个地球，'],
  [8, 9, '几乎什么都挡不住它们。'],
  // ③ the ghost particle and why it matters
  [11, 13, '它叫中微子：不带电，几乎不和任何东西作用。'],
  [13, 15, '想挡住它，铅墙得厚到以【光年】计。'],
  [15, 17, '也正因如此，它是宇宙里最诚实的信使。'],
  [17, 19, '宇宙射线带电，一路被磁场〔扭弯〕；'],
  [19, 21, '最高能的光，半路就被〔吸收〕；'],
  [21, 23, '只有中微子，从源头【笔直】飞来。'],
  // ④ the idea and the build
  [23, 25, '可要抓住它，探测器得有【一立方公里】那么大。'],
  [25, 27, '1988 年，哈尔岑和同事想到了南极的冰。'],
  [27, 29, '南极深处的冰，是已知最清澈的冰。'],
  [29, 31, '第一次却失败了：浅处的冰里全是〔气泡〕。'],
  [31, 33, '那就钻得更深——到了 1500 米，气泡消失了。'],
  [33, 35, '七个南极夏天，热水在冰里融出 86 个深孔，'],
  [35, 37, '放进 【5160】 个光传感器，冰立方完工。'],
  // ⑤ one detection, slowly
  [37, 39, '冰下两公里，一片漆黑。'],
  [39, 41, '一个中微子从脚下飞来，它刚穿过了地球。'],
  [41, 43, '它撞上原子核，撞出的粒子拖着一道【蓝色光锥】。'],
  [43, 45, '每束光到达的先后，都指回它来的方向。'],
  // ⑥ discoveries
  [45, 47, '2013 年，团队公布了两个能量巨大的事件。'],
  [47, 49, '他们用《芝麻街》给它们起名：伯特和厄尼。'],
  [49, 51, '它们来自太阳系之外：【中微子天文学】开张了。'],
  [51, 53, '2017 年 9 月 22 日，又一个中微子落进冰立方。'],
  // ⑦ the source, AI, the prize
  [53, 55, '警报发往全球，望远镜一齐转向那片天空——'],
  [55, 57, '约 40 亿光年外，一个耀变体正在爆发。'],
  [57, 59, '人类第一次找到了高能中微子源头的【证据】。'],
  [59, 61, '2023 年，AI 帮他们从海量信号里挑出中微子，'],
  [61, 63, '拼出了第一张银河系的【中微子图像】。'],
  [63, 65, '从 1988 年的一个设想，到 2026 年的诺贝尔奖。'],
  // ⑧ back to the fingernail
  [65, 66, '此刻，又有几千亿个穿过了你的指甲盖。'],
  [66, 67, '而南极冰下，5160 只眼睛正在等。'],
];

const CORNERS = [
  { at: 1, year: null },
  { at: 25, year: '1988', sub: '弗朗西斯 · 哈尔岑 · 极地冰探测设想', cite: 'Halzen & Learned  ·  1988', cite2: '' },
  { at: 29, year: '1993', sub: 'AMANDA · 第一批探测器（800–1000 米）', cite: 'Spiering  ·  Eur. Phys. J. H  ·  2012', cite2: '' },
  { at: 31, year: '1996', sub: 'AMANDA · 改装到 1500–2000 米', cite: 'Spiering  ·  Eur. Phys. J. H  ·  2012', cite2: '' },
  { at: 33, year: '2004', sub: '冰立方开工 · 每年 11 月到次年 2 月施工', cite: 'IceCube Collaboration', cite2: '' },
  { at: 35, year: '2010', sub: '12 月 18 日 · 最后一根缆放入冰中', cite: 'IceCube Collaboration', cite2: '1450–2450 米深 · 86 根缆 × 60 个传感器' },
  { at: 37, year: null },
  { at: 45, year: '2013', sub: '伯特 1.0 PeV · 厄尼 1.1 PeV', cite: 'IceCube Collaboration  ·  Science  ·  2013', cite2: '事件图为示意' },
  { at: 51, year: '2017', sub: 'IceCube-170922A · 约 290 TeV', cite: 'IceCube et al.  ·  Science  ·  2018', cite2: '' },
  { at: 59, year: '2023', sub: '银河系的高能中微子 · 深度神经网络', cite: 'IceCube Collaboration  ·  Science  ·  2023', cite2: '银河图像为示意' },
  { at: 63, year: '2026', sub: '诺贝尔物理学奖 · 弗朗西斯 · 哈尔岑', cite: 'NobelPrize.org  ·  2026', cite2: '' },
  { at: 65, year: null },
];

const NU_PER_SEC = 650; // solar neutrinos through 1 cm² per second, in units of 亿 (≈ 6.5 × 10¹⁰)
