"""剪口播气口 + （可选）拼冷开场，输出 public/voice_edit.wav 与 src/data/timemap.ts（新时间 → 原始逐字稿时间）。

用法：
  cut_audio.py                       # 只剪气口
  cut_audio.py --cold 250.80 254.25  # 把原始 250.80–254.25 这段金句剪到最前面当冷开场
  可选：--tail 1.6（冷开场金句后留给标题砸屏的时长） --keep 0.18（普通气口保留） --gap 0.45（长停顿保留）
"""
import json, sys, wave
import numpy as np

def arg(name, default=None, n=1):
    if name in sys.argv:
        i = sys.argv.index(name); v = sys.argv[i + 1:i + 1 + n]
        return [float(x) for x in v] if n > 1 else float(v[0])
    return default

cold = arg('--cold', None, 2)
TAIL = arg('--tail', 1.6); KEEP = arg('--keep', 0.18); GAP = arg('--gap', 0.45)
SR = 48000
w = wave.open('public/voice.wav'); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32).reshape(-1, 2) / 32768
voice_end = len(x) / SR
SRC_END = voice_end + 4.0  # 片尾卡留 4 秒
x = np.concatenate([x, np.zeros((int(SRC_END * SR) - len(x), 2), np.float32)])

mono = x.mean(1); hop = SR // 100; nf = len(mono) // hop
db = 20 * np.log10(np.sqrt((mono[:nf * hop].reshape(nf, hop) ** 2).mean(1)) + 1e-9)
sil = db < -40
runs, i = [], 0
while i < nf:
    if sil[i]:
        j = i
        while j < nf and sil[j]: j += 1
        runs.append((i / 100, j / 100)); i = j
    else: i += 1
import os
PROT = json.load(open('public/protect.json')) if os.path.exists('public/protect.json') else []
removed = []
for a, b in runs:
    d = b - a
    if any(a < pb and b > pa for pa, pb in PROT): continue  # 人为插入的留白（MV / 提示词停留）不剪
    if d < 0.3 or a < 0.5 or a > voice_end - 0.3 or b > voice_end - 0.05: continue  # 结尾静音（片尾卡）不剪
    keep = GAP if d >= 1.2 else KEEP  # 1.2 秒以上的长停顿多半是章节之间，多留一点呼吸
    removed.append((a + keep / 2, b - keep / 2))
keeps, cur = [], 0.0
for a, b in removed:
    keeps.append((cur, a)); cur = b
keeps.append((cur, SRC_END))

FADE = int(0.008 * SR)
def seg(a, b):
    s = x[int(a * SR):int(b * SR)].copy()
    if len(s) > 2 * FADE:
        r = np.linspace(0, 1, FADE)[:, None]; s[:FADE] *= r; s[-FADE:] *= r[::-1]
    return s

parts = []
PAD = 0.35
if cold:
    A, B = cold
    cold_len = PAD + (B - A) + TAIL
    parts += [np.zeros((int(PAD * SR), 2), np.float32), seg(A, B), np.zeros((int(TAIL * SR), 2), np.float32)]
    cold_voice = [PAD, round(PAD + B - A, 4)]
else:
    cold_len, cold_voice = 0.0, [0, 0]
segs, t = [], cold_len
for a, b in keeps:
    parts.append(seg(a, b)); segs.append({'n': round(t, 4), 's': round(a, 4), 'd': round(b - a, 4)}); t += b - a
y = np.concatenate(parts)
with wave.open('public/voice_edit.wav', 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
    o.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes())
total = len(y) / SR
open('src/data/timemap.ts', 'w').write(
    '// 由 scripts/cut_audio.py 生成\n'
    f'export const COLD = {round(cold_len, 4)};\nexport const COLD_VOICE = {json.dumps(cold_voice)};\n'
    f'export const NEW_TOTAL = {round(total, 3)};\n'
    f'export const SEGS: {{n: number; s: number; d: number}}[] = {json.dumps(segs)};\n')
print(f'剪掉 {len(removed)} 处气口，共 {sum(b - a for a, b in removed):.1f}s；冷开场 {cold_len:.2f}s；新总时长 {total:.2f}s（原始口播 {voice_end:.2f}s）')
