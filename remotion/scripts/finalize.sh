#!/usr/bin/env bash
# 用法：scripts/finalize.sh <输出成片路径.mp4>
# 渲染（bt709 / yuv420p，兼容各平台）→ 响度与真峰值处理 → faststart → 报告
set -euo pipefail
OUT="$1"
npx remotion render src/index.ts Main out/raw.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --color-space=bt709 --audio-bitrate=320k --concurrency=10 --log=error
npx remotion ffmpeg -hide_banner -loglevel error -y -i out/raw.mp4 -c:v copy -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 256k -movflags +faststart "$OUT"
npx remotion ffprobe -hide_banner "$OUT" 2>&1 | grep -E "Duration|Stream"
npx remotion ffmpeg -hide_banner -i "$OUT" -vn -af loudnorm=print_format=json -f null - 2>&1 | grep -E '"input_i"|"input_tp"'
