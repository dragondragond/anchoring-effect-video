# 主题 · 知识短片工程

整片用代码绘制（Canvas 2D），每一帧只由时间 t 决定；无头 Chrome 逐帧渲染，ffmpeg 合上 BGM。

## 预览

用 Chrome 打开 `index.html`，可以边放 BGM 边看：空格播放 / 暂停，← → 逐帧，Shift + ← → 跳一小节，地址栏加 `?t=60` 从第 60 秒开始。

## 渲染

```bash
node render.mjs --workers=6     # 成片 → out/
node render.mjs --stills=12.5,40   # 几张截图 → out/stills
node render.mjs --sheet=0:145:4    # 每 4 秒一帧的总览图 → out/sheet.jpg
node cover.mjs                  # 封面 → covers/
```

已渲染的帧会跳过；改了画面后删掉 `out/frames` 里对应的帧再渲染。

## 改内容

| 想改什么 | 改哪里 |
|---|---|
| 标题、署名、金句、参考资料、封面文案 | `src/data.js` 的 `CONFIG` |
| 字幕和时间（按小节） | `src/data.js` 的 `SUBS` |
| 左上角年份、右上角出处 | `src/data.js` 的 `CORNERS` |
| 画面 | `src/scenes.js`（`SCENES` 列表依次绘制） |
| 通用组件 | `src/components.js` |
| 节拍和时长 | `src/music.js`（新建工程时由 BGM 分析自动生成） |

字幕里 `【】` 标金色，`〔〕` 标红色。分镜和出处见 [分镜脚本.md](分镜脚本.md)。
