// Episode content: config, subtitles, corner annotations.
// Subtitles: [startBar, endBar, text]. 【】 = gold, 〔〕 = red. 1 bar = 4 beats (see bt() in engine.js).

const CONFIG = {
  title: '镜像之谜',
  titleEn: 'THE ASYMMETRIC MYSTERY',
  tagline: '2026 诺贝尔化学奖 · 生命为什么只用一只手',
  signature: 'LIGHT聊AI',
  quote: ['生命选了一只手——', '也许只因为，开头【多了一点点】。'],
  refs: [
    'Puchot C. … Kagan H.B. (1986) J. Am. Chem. Soc. 108: 2353–2357    ·    Soai K. et al. (1995) Nature 378: 767–768',
    'Frank F.C. (1953) Biochim. Biophys. Acta 11: 459    ·    Zahrt A.F. … Denmark S.E. (2019) Science 363: eaau5631',
    'NobelPrize.org (2026) They solved chemistry’s asymmetric mystery',
  ],
  cover: { line1: '生命为什么只用一只手？', line2: '一点偶然，被放大到【99.99%】', pill: '2026 诺贝尔化学奖' },
};

const SUBS = [
  // ① hook
  [1, 3, '看看你的两只手：一模一样，却互为镜像。'],
  [3, 5, '试着把左手叠到右手上——拇指永远〔对不齐〕。'],
  [5, 7, '分子，也有这样的左右手。'],
  [7, 8, '而生命，只用其中一只。'],
  [8, 9, '为什么？'],
  // ③ Pasteur, chirality, life
  [11, 13, '1848 年，巴斯德在显微镜下看酒石酸盐的晶体：'],
  [13, 15, '它们分两种，互为镜像——他用镊子分成了两堆。'],
  [15, 17, '溶进水里：一堆让偏振光右转，一堆让它左转。'],
  [17, 19, '互为镜像、却叠不到一起的分子，叫【手性分子】。'],
  [19, 21, '你蛋白质里的氨基酸，只用其中一种手型；'],
  [21, 23, 'DNA 里的糖也一样。这叫生命的【单手性】。'],
  // ④ the lab, Frank's three conditions, Kagan
  [23, 25, '可实验室里，化学家造出的总是左右各一半。'],
  [25, 27, '很多药，一只手治病，另一只手却可能〔有害〕。'],
  [27, 29, '1953 年，物理学家弗兰克提出：要让一只手胜出，'],
  [29, 31, '需要三样东西：手性催化剂、放大优势、自我复制。'],
  [31, 33, '第一样早已做到。第二样，1986 年被卡冈找到——'],
  [33, 35, '一左一右配对的催化剂，反应慢得多。'],
  [35, 37, '结果，不纯的催化剂，造出了【更纯的产物】。'],
  // ⑤ the origin question, Soai
  [37, 39, '可它只能放大已有的优势。'],
  [39, 41, '第三样东西：产物得能复制自己。'],
  [41, 43, '1995 年，硖合宪三找到了这样的分子。'],
  [43, 45, '它就是自己的催化剂：造出的越多，造得越快。'],
  // ⑥ amplification
  [45, 47, '一开始只多出 2%，反应之后，多出了 【87%】。'],
  [47, 49, '2003 年，他从完全不带手性的原料出发。'],
  [49, 51, '偶然多出的一点点，接管了整个反应——'],
  [51, 53, '最终，同一只手能占到产物的 【99.99%】。'],
  // ⑦ chance, the search, AI, the prize
  [53, 55, '重做一次，赢的可能是另一只手——全凭开头的偶然。'],
  [55, 57, '原来，「单手性」可以从一点【偶然】里长出来。'],
  [57, 59, '如今，各国化学家正试着用氨基酸和糖重演这一幕。'],
  [59, 61, '2019 年，机器学习也开始帮化学家挑选手性催化剂。'],
  [61, 63, '2026 年，诺贝尔化学奖授予卡冈和硖合宪三。'],
  [63, 65, '药物、香料、农药……都得分清左右手。'],
  // ⑧ back to your hands
  [65, 66, '下次看着自己的双手，'],
  [66, 67, '你的蛋白质，都只用了其中一只。'],
];

const CORNERS = [
  { at: 1, year: null },
  { at: 11, year: '1848', sub: '路易 · 巴斯德 · 酒石酸盐晶体', cite: 'NobelPrize.org 科普资料  ·  2026', cite2: '' },
  { at: 17, year: null },
  { at: 27, year: '1953', sub: '查尔斯 · 弗兰克 · 布里斯托大学', cite: 'Frank  ·  Biochim. Biophys. Acta  ·  1953', cite2: '' },
  { at: 31, year: '1986', sub: '亨利 · 卡冈 · 巴黎南大学', cite: 'Puchot … Kagan  ·  J. Am. Chem. Soc.  ·  1986', cite2: '' },
  { at: 37, year: null },
  { at: 41, year: '1995', sub: '硖合宪三 · 东京理科大学', cite: 'Soai et al.  ·  Nature  ·  1995', cite2: '' },
  { at: 47, year: '2003', sub: '从不带手性的原料出发', cite: 'NobelPrize.org 科普资料  ·  2026', cite2: '' },
  { at: 53, year: null },
  { at: 59, year: '2019', sub: '机器学习预测催化剂的选择性', cite: 'Zahrt … Denmark  ·  Science  ·  2019', cite2: '色块为示意' },
  { at: 61, year: '2026', sub: '诺贝尔化学奖 · 卡冈 & 硖合宪三', cite: 'NobelPrize.org  ·  2026', cite2: '' },
  { at: 65, year: null },
];
