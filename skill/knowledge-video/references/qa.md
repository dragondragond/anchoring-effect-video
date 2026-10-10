# 自检清单

每一项都要自己看过再交付。用户能指出的问题，多半是没抽帧或没跑检测就交了。

## 1. 写完场景，先看总览

```bash
node render.mjs --sheet=0.5:145:4 --name=sheet1
```

读 `out/sheet1.jpg`（每 4 秒一帧），确认：

- 每一段都有画面，没有空场景
- 字幕和画面讲的是同一件事
- 角标年份在对的段落出现和消失

## 2. 全尺寸截图看细节

挑每个段落最满的一帧，以及每个新组件第一次出现的那一帧：

```bash
node render.mjs --stills=16.4,35.6,44.5,66.5
```

逐张看：

- 文字有没有溢出（印章、卡片、论文页眉、气泡）
- 有没有互相压住（标签压图形、画面压字幕、拴绳穿过文字）
- 单位是否一致（百分比的轴带 %）
- 数字和分镜脚本里的数据是否一致
- 颜色语义是否前后一致

想细看某个区域时，可以用 ffmpeg 裁一块出来：`-vf crop=w:h:x:y`。

## 3. 转场

把每个段落交界前后 0.5 秒的帧拼成一张图来看：

```bash
node render.mjs --stills=17.3,17.9,21.6,22.3,46.8,47.6
ffmpeg -pattern_type glob -i 'out/stills/*.png' -vf "scale=480:-1,tile=5x6" -frames:v 1 out/trans.jpg
```

重点看叠影：前一个场景是不是还残留在后一个场景上。这通常是透明度被赋值而不是相乘，或者淡出窗口太长。

## 4. 静止画面检测

```bash
node <skill>/scripts/motion_check.mjs <episodeDir>
```

脚本会关掉镜头呼吸，只测画面内容本身。报出的每一段（默认 ≥ 2 秒几乎不动）都要补上和内容相关的动作，然后重跑，直到输出 `no static spans`。

不要用带镜头呼吸的成片来判断：呼吸会让每一帧都在变，检测结果会是假的「没问题」。

## 5. 成片检查

```bash
node render.mjs --workers=6
ffprobe -v error -show_entries format=duration:stream=codec_name,duration -of compact out/<名字>.mp4
```

- 视频和音频时长一致（≈ BGM 时长）
- 从成片里抽几帧（`ffmpeg -ss T -i out/x.mp4 -frames:v 1`）确认改动确实进去了，尤其是局部重渲过的段落

## 6. 交付前

- 成片复制到这一期的上一级目录，命名为 `<主题>_<署名>.mp4`
- 封面：`node cover.mjs` → `covers/cover_4x3.png`、`cover_3x4.png`，两张都看一眼
- `分镜脚本.md` 和代码一致（字幕、时间、画面描述、出处）
- 片尾参考资料和分镜脚本里的出处一致
- 删掉 `out/frames` 等中间文件（约 1GB）
- README 里的内容概要跟着成片更新

## 7. 交付时告诉用户

- 哪些画面是示意（比如点的分布）
- 哪些字幕是转述或推论（不是原话、不是论文结论）
- 哪些数据只来自二手资料、因此只做了定性表述
- 用户提的每个问题分别怎么改的
