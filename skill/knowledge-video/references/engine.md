# 动画引擎

## 目录
1. 工程结构
2. 时间与缓动
3. 文字与图形
4. 字幕、角标、水印
5. 通用组件（components.js）
6. 编排模式
7. 技术坑
8. 渲染命令

---

## 1. 工程结构

`scripts/new_episode.mjs` 从 `assets/template/` 生成：

```
<episode>/
├── index.html          预览工作台（Chrome 打开，边听 BGM 边拖时间轴）
├── render.mjs          无头渲染：截图 / 总览图 / 成片
├── cover.html, cover.mjs   封面（4:3 和 3:4）
├── 分镜脚本.md, README.md
└── src/
    ├── music.js        MUSIC = { bpm, offset, duration }（自动生成）
    ├── engine.js       时间、缓动、配色、字体、文字和图形、背景
    ├── data.js         CONFIG、SUBS、CORNERS、本期数据
    ├── components.js   通用组件（标题卡、片尾卡、数轴、卡片、气泡……）
    ├── overlay.js      字幕、角标、水印
    ├── scenes.js       本期画面，导出 SCENES 列表
    ├── cover.js        封面（替换 coverHero 为本期的核心视觉）
    └── main.js         合成一帧：背景 → 镜头呼吸 → SCENES → 叠层 → 颗粒
```

脚本按 `index.html` 里的顺序以普通 `<script>` 加载（不用 ES module，`file://` 下 module 会被 CORS 拦掉），所以函数和常量都是全局的。

**每一帧只由 t 决定。** 不要在帧之间保存状态，不要用 `Math.random()` 或 `Date`。随机用 `hash(i, seed)`（返回 0～1），这样任意顺序、多进程并行渲染结果都一样。

## 2. 时间与缓动

- `bt(n)`：第 n 小节开始的秒数（1 起）。`BEAT`、`BAR`、`OFF`、`DUR` 来自 music.js。
- `prog(t, a, b)`：t 在 a～b 之间的进度，夹在 0～1。
- `ep(t, a, b, ease = E.inOut)`：带缓动的进度。
- `env(t, a, b, fi, fo)`：透明度包络，a 之后 fi 秒淡入，b 之前 fo 秒淡出。
- `E.inOut / out / in / outExpo / outQuint / outBack / inOutSine`。落地、弹出用 `outBack`，飞行用 `inOut`，减速停止用 `outQuint`。
- `lerp`、`clamp`、`hash`、`rng(seed)`。

## 3. 文字与图形

- `text(ctx, s, x, y, { size, weight, fam, color, alpha, align, base, ls, glow, glowColor, italic })`
- `richText(ctx, s, x, y, opts)`：支持 `【金色】`、`〔红色〕`，返回总宽度（打字机效果的光标位置就靠它）。
- 字体常量：`F.song`（Songti SC）、`F.serif`（Baskerville）、`F.didot`（Didot）、`F.mono`。
- 配色：`C.gold / goldHi / goldDim / goldDeep / cream / blue / blueHi / blueDim / red / redHi / paper / ink / bg`。
- 图形：`roundRect`、`drawLine(ctx, x1, y1, x2, y2, p, color, width, alpha)`（p 是画出来的进度）、`arrow(ctx, x1, y1, x2, y2, p, { color, width, bend, dash, glow, head, noHead })`（返回曲线取点函数）、`checkMark(ctx, x, y, s, p, color, width)`、`seal(ctx, x, y, s, label, p, rot, color)`（红印章，砸下来的动画；label 1～4 个字）。
- `sampleText(key, drawFn, n, step, seed)`：把一段画出来的文字采样成 n 个点（标题粒子用），结果会缓存。
- `drawBackground(ctx, t)`、`drawFinish(ctx, t, frame)`（暗角 + 胶片颗粒）。

## 4. 字幕、角标、水印

- `SUBS`：`[开始小节, 结束小节, 文本]`，overlay.js 自动淡入淡出，并在进场时上移 10px。
- `CORNERS`：`{ at: 小节, year, sub, cite, cite2 }`，从 at 开始生效直到下一条；`year: null` 隐藏。相邻两条都有年份时，数字会像里程表一样滚动。
- 水印读 `CONFIG.signature`，在片尾卡前自动淡出。
- 字幕在 y≈1000，**画面内容尽量放在 y < 930**，否则会和字幕撞。

## 5. 通用组件（components.js）

| 组件 | 用途 |
|---|---|
| `sceneTitleCard(ctx, t, b0, b1)` | 白闪 → 粒子汇聚成金色标题 → 碎回粒子。b0 放在低音进入那一小节 |
| `titlePoints()` | 标题的 600 个采样点；下一场景可以让点从这里飞出去 |
| `sceneEndCard(ctx, t, b0)` | 片尾卡：标题、`CONFIG.quote`、`CONFIG.refs`、署名 |
| `drawAxis(ctx, x0, x1, y, p, alpha, { step, pct, noLabels })` | 0～100 数轴，值是百分比时传 `pct: true` |
| `gaugeCard(ctx, cx, cy, label, pct, fill, color, { alpha, glow, scale, lift, caption })` | 带圆环进度的选项卡（A 78% vs B 83%） |
| `bubble(ctx, x, y, w, h, tail, alpha, { color, fill })` | 对话气泡 / 聊天输入框 |
| `person(ctx, x, y, color, alpha)` | 极简小人 |
| `paperCard(ctx, cx, cy, w, h, rot, alpha, lines, fillerBars)` | 论文、案卷、书信卡片 |
| `drawRope(ctx, x1, y1, x2, y2, sag, alpha, color, width, p)` | 绳子，sag=0 绷紧，p 控制放绳 |
| `ripples(ctx, x, y, r0, r1, t, t0, color, n, alpha)` | 落地或到达时荡开的圆环 |
| `impact(ctx, x, y, t, t0, alpha)` | 敲击时两侧迸出的短线 |
| `flipText(ctx, s0, s1, p, x, y, opts)` | 翻牌换字（「数字不变，只换标签」） |
| `node(...)`、`edge(...)` | 因果图 / 流程图的节点和带光点流动的箭头 |
| `dataSea(ctx, t, t0, alpha, { n, speed })` | 冲向镜头的数据点海洋（「AI 读过所有数据」） |

两期里写过的专用组件可以直接借：轮盘 `drawWheel`、骰子 `dicePair`、锚 `drawAnchor`、法槌 `drawGavel`、价签 `drawPriceTag`、2×2 表格 `drawTable`、院系闸门、手术卡片等，见 `references/examples/`。

## 6. 编排模式

**场景函数的固定写法：** 先判断时间范围、范围外直接 return；用 `env`/`ep` 算本场景的透明度；所有出场都相对小节线 `bt(n) + 偏移`。

```js
function sceneX(ctx, t) {
  if (t < bt(23) - 0.2 || t > bt(37) + 0.8) return;
  const a = ep(t, bt(23), bt(23) + 0.8) * (1 - ep(t, bt(37) - 0.3, bt(37) + 0.5));
  // ...
}
```

**点阵变形链（一个点代表一个人）：** 每个点有若干布局（标题采样点 → 两组网格 → 按条件拆开 → 下一个案例的位置）。位置从第一个布局开始，按时间顺序依次 `lerp` 到下一个布局，每个点带一个 `hash` 出来的延迟，飞行途中加一点弧线：

```js
let [x, y] = d.layoutA;
const step = (t0, dur, spread, target) => {
  const p = E.inOut(prog(t, t0 + d.seed * spread, t0 + d.seed * spread + dur));
  x = lerp(x, target[0], p); y = lerp(y, target[1], p); return p;
};
const p1 = step(bt(11) - 0.15, 1.5, 0.9, d.grid);
if (p1 > 0 && p1 < 1) y -= Math.sin(p1 * Math.PI) * 120 * hash(d.i, 23);
step(bt(13) + 0.1, 1.2, 0.8, d.split);
```

成功 / 失败用实心 / 空心表示，同一组里先排成功的（从下往上填），比例一眼能看出来。大小、颜色也可以编码变量（大点 = 大结石）。

**数字滚动：** `Math.round(target * ep(t, t0, t0 + 1.2))`，配合 `glow`。

**一跳一跳地调整 + 被拽回来：** 预设一串越来越小的步长，用 `hopPos`（见 anchoring 范例）；停下后用周期脉冲让它往目标挣一下再被绳子拽回来，绳子在挣的时候绷紧（sag 变小）。

**同样的数字换标签：** 表格不动，用 `flipText` 依次翻表头和行名，数字轻轻发光表示「一个没动」。

**打字 + 思考中：** `q.slice(0, n)` 逐字显示，`richText` 返回宽度定位光标；之后三个点按相位依次跳动。

**一组尝试依次失败：** 给每次尝试一个时刻 tc，在 `[tc - 0.55, tc + 0.25]` 内让结果往回挣，tc 时刻划掉对应按钮。

**镜头呼吸：** main.js 对内容层做很轻的缩放和平移（约 1.5%、周期十几秒），字幕和角标不动。`window.NO_DRIFT = true` 可以关掉，静止检测靠它。

## 7. 技术坑

- **透明度只乘不赋值。** 组件内部写 `ctx.globalAlpha = x` 会覆盖外层场景的淡出，导致场景退场时还剩一半画面（轮盘刻度、估计标记都出过这个问题）。一律 `ctx.save(); ctx.globalAlpha *= x; …; ctx.restore();`，需要分层时先记 `const base = ctx.globalAlpha`。
- **前一个画面先退，后一个再进。** 交叉淡化超过 0.5 秒就会叠影（开头轮盘叠在标题上、法槌叠在案卷上）。白闪转场时，前一场景在闪光最亮之前就要完全退场。好用的默认窗口：前一场景在 `[bt(n) - 0.5, bt(n) + 0.05]` 淡出，后一场景在 `[bt(n), bt(n) + 0.8]` 淡入。
- **周期动画别用 `x % 1`。** 场景提前淡入时时间差是负数，`%` 的结果也是负数，算出负半径会让 `ctx.arc` 抛错，整个渲染中断。用 `frac(x) = x - Math.floor(x)`。
- **叠加混合（`'lighter'`）会过曝。** 很多发光点叠在一起会糊成一片白（冰立方第一版的事件图就是这样）。密集的标记画成实心带明暗的小球，叠加的光晕只留很淡的一层。
- **渲染输出别用 grep 过滤掉错误。** 页面里抛错时 render.mjs 会中断，但管道的退出码可能还是 0。渲染后确认 `out/<名字>.mp4` 确实存在、时长对得上。
- **文字溢出：** 印章最多 4 个字（2×2），超过就把多出来的符号放到印章外；卡片、论文页眉的长英文要量宽度或缩小字号；全角「？」字形偏左，单独放大时用 Didot 的「?」。
- **字体：** 直接用系统字体名 `"Songti SC"`，渲染前 `document.fonts.load('900 40px "Songti SC"')`。粗体 700、特粗 900。
- **ctx.letterSpacing** 会在居中文字末尾多出一个间距，`text()` 已经补偿；自己画时注意。
- **ffmpeg 没有 drawtext 滤镜，Python 没有 numpy。** 数值分析用 Node 写。
- **不要在帧间缓存依赖 t 的结果**；只缓存与 t 无关的东西（采样点、噪声纹理、布局）。
- 局部重渲：删掉 `out/frames/f_XXXXX.jpg` 对应范围再跑 `render.mjs`，只补缺的帧，然后自动重新编码。

## 8. 渲染命令

```bash
node render.mjs --stills=12.5,40          # 全尺寸截图 → out/stills/
node render.mjs --sheet=0.5:145:4 --name=sheet1   # 每 4 秒一帧的总览图 → out/sheet1.jpg
node render.mjs --workers=6               # 成片 → out/<名字>.mp4（4370 帧约 80 秒）
node cover.mjs                            # 封面 → covers/
```
