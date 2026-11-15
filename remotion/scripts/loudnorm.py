"""两遍 loudnorm：把口播标准化到 -16 LUFS / -1.5 dBTP，输出 48k wav。用 Remotion 自带的 ffmpeg。"""
import json, re, subprocess, sys
src, dst = sys.argv[1], sys.argv[2]
ff = ['npx', 'remotion', 'ffmpeg', '-hide_banner']
r = subprocess.run(ff + ['-i', src, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr).group(0))
af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")
subprocess.run(ff + ['-loglevel', 'error', '-y', '-i', src, '-af', af, '-ac', '2', '-c:a', 'pcm_s16le', dst], check=True)
print(f"输入响度 {m['input_i']} LUFS，真峰值 {m['input_tp']} dBTP → -16 LUFS")
