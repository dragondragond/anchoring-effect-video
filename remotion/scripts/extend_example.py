"""在口播里插入两段“留白”：MV 展示 + 提示词停留。输出 public/voice.wav（覆盖，原件备份为 voice_raw.wav）、扩展后的 SRT、protect.json。"""
import wave, json, re, os, numpy as np
SR = 48000
INS = [(7.45, 17.6), (17.6, 4.0)]  # (原始秒, 插入时长)
if not os.path.exists('public/voice_raw.wav'): os.rename('public/voice.wav', 'public/voice_raw.wav')
w = wave.open('public/voice_raw.wav'); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2)
def ext(t):
    s = t
    for a, d in INS:
        if t >= a: s += d
    return s
parts, cur = [], 0
for a, d in INS:
    i = int(a * SR); parts += [x[cur:i], np.zeros((int(d * SR), 2), '<i2')]; cur = i
parts.append(x[cur:])
with wave.open('public/voice.wav', 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes(np.concatenate(parts).tobytes())
def ts(s): return '%02d:%02d:%02d,%03d' % (s // 3600, s % 3600 // 60, int(s % 60), round(s * 1000) % 1000)
def pt(m): h, mi, s, ms = map(int, re.split('[:,]', m)); return h * 3600 + mi * 60 + s + ms / 1000
src = open('../10月5日 (1).srt', encoding='utf-8').read()
out = re.sub(r'(\d\d:\d\d:\d\d,\d\d\d) --> (\d\d:\d\d:\d\d,\d\d\d)', lambda m: f'{ts(ext(pt(m[1])))} --> {ts(ext(pt(m[2])))}', src)
open('out/voice_ext.srt', 'w', encoding='utf-8').write(out)
json.dump([[ext(a) - d - 0.05, ext(a) + 0.05] for a, d in INS], open('public/protect.json', 'w'))
print('protect', json.load(open('public/protect.json')))
