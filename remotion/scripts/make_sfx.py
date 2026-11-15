"""程序合成的背景音乐与音效（无版权问题）。

用法：make_sfx.py --duration <口播秒数>
输出到 public/：bgm.wav（氛围 pad）、bgm_beat.wav（96BPM lo-fi 鼓点）、whoosh / impact / pop / pop_hi / riser /
typing / swish / slam .wav
"""
import numpy as np, wave, os, sys
SR = 48000
OUT = os.path.join(os.getcwd(), 'public')
rng = np.random.default_rng(7)
VOICE = float(sys.argv[sys.argv.index('--duration') + 1]) if '--duration' in sys.argv else 280.0
TOTAL = VOICE + 12  # 覆盖冷开场 + 片尾

def write(name, x):
    x = np.clip(x, -1, 1)
    if x.ndim == 1: x = np.stack([x, x], 1)
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())

def onepole_lp(x, fc):
    # 频域低通（平滑滚降），避免逐样本循环
    n = len(x); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, n)

def reverb(x, secs=3.2, mix=0.45):
    n_ir = int(secs * SR); t = np.arange(n_ir) / SR
    out = []
    for ch in range(2):
        ir = rng.standard_normal(n_ir) * np.exp(-t * 6.5 / secs)
        ir = onepole_lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
        n = len(x) + n_ir; N = 1 << (n - 1).bit_length()
        y = np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(ir, N), N)[:len(x)]
        out.append((1 - mix) * x + mix * y)
    return np.stack(out, 1)

def midi(m): return 440 * 2 ** ((m - 69) / 12)

# ---------- BGM ----------
DUR = TOTAL
n = int(DUR * SR); t = np.arange(n) / SR
# Am9 - Fmaj7 - Cmaj7 - G6sus，每和弦 8 秒，长交叉淡化
chords = [[45, 57, 60, 64, 67, 71], [41, 57, 60, 64, 65, 69], [48, 55, 59, 64, 67, 71], [43, 55, 59, 62, 64, 69]]
CH = 8.0
pad = np.zeros(n)
for k in range(int(DUR / CH) + 1):
    notes = chords[k % 4]
    s0 = k * CH - 2.0; s1 = (k + 1) * CH + 2.0
    i0, i1 = max(0, int(s0 * SR)), min(n, int(s1 * SR))
    if i0 >= i1: continue
    tt = t[i0:i1]; ph = (tt - s0) / (s1 - s0)
    env = np.sin(np.pi * np.clip(ph, 0, 1)) ** 1.5
    seg = np.zeros(i1 - i0)
    for j, m in enumerate(notes):
        f = midi(m); amp = 0.5 if j == 0 else 0.22
        for det in (-0.0025, 0.0, 0.0028):
            for h in range(1, 5):
                seg += amp / (h ** 2.2) * np.sin(2 * np.pi * f * h * (1 + det) * tt + rng.uniform(0, 6.28))
    pad[i0:i1] += seg * env
pad *= 1 + 0.15 * np.sin(2 * np.pi * 0.07 * t)          # 缓慢呼吸
pad = onepole_lp(pad, 1400)
# 高频闪烁颗粒
sparkle = np.zeros(n)
for k in range(int(DUR / 1.0)):
    if rng.random() < 0.35:
        notes = chords[int(k / CH) % 4]; f = midi(rng.choice(notes[2:]) + 24)
        i0 = int((k + rng.random()) * SR); L = int(1.8 * SR)
        if i0 + L < n:
            tt = np.arange(L) / SR
            sparkle[i0:i0 + L] += 0.05 * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 3) * (1 - np.exp(-tt * 200))
bgm = pad / np.abs(pad).max() * 0.5 + sparkle
fade = np.ones(n); fi, fo = int(3 * SR), int(5 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
bgm = reverb(bgm * fade, 4.0, 0.5)
bgm /= np.abs(bgm).max(); bgm *= 0.8
write('bgm.wav', bgm)

# ---------- SFX ----------
def whoosh(L=1.1):
    m = int(L * SR); tt = np.arange(m) / SR
    x = rng.standard_normal(m)
    # 频率扫动的带通：分块处理
    y = np.zeros(m); B = 2048
    for i in range(0, m, B):
        c = x[i:i + B]; p = i / m
        fc = 300 + 5000 * np.sin(np.pi * p) ** 2
        C = np.fft.rfft(c, B); f = np.fft.rfftfreq(B, 1 / SR)
        C *= np.exp(-((np.log2(f + 1) - np.log2(fc)) ** 2) / 0.6)
        y[i:i + B] = np.fft.irfft(C, B)[:len(c)]
    env = np.sin(np.pi * (tt / L)) ** 2.5
    y = y * env; y /= np.abs(y).max()
    return reverb(y * 0.7, 1.2, 0.35)

def impact():
    m = int(2.2 * SR); tt = np.arange(m) / SR
    f = 70 * np.exp(-tt * 3) + 38
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.4)
    click = rng.standard_normal(m) * np.exp(-tt * 60) * 0.3
    y = boom + onepole_lp(click, 3000)
    y /= np.abs(y).max()
    return reverb(y * 0.9, 2.5, 0.3)

def pop(f0=880):
    m = int(0.35 * SR); tt = np.arange(m) / SR
    f = f0 * (1 + 0.6 * np.exp(-tt * 40))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 18) * (1 - np.exp(-tt * 800))
    y += 0.3 * np.sin(2 * np.pi * 2 * np.cumsum(f) / SR) * np.exp(-tt * 30)
    y /= np.abs(y).max()
    return reverb(y * 0.8, 0.8, 0.25)

def riser(L=1.6):
    m = int(L * SR); tt = np.arange(m) / SR
    x = onepole_lp(rng.standard_normal(m), 6000) * (tt / L) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 * 2 ** (2 * tt / L)) / SR) * (tt / L) ** 3 * 0.4
    y = x / np.abs(x).max() * 0.6 + tone
    y *= np.minimum(1, (L - tt) * 30)
    return reverb(y / np.abs(y).max() * 0.8, 1.0, 0.3)

write('whoosh.wav', whoosh())
write('impact.wav', impact())
write('pop.wav', pop())
write('pop_hi.wav', pop(1320))
write('riser.wav', riser())

# ================= 节拍背景乐与更多音效 =================
def lp(x, fc):
    n = len(x); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), n)
def hp(x, fc):
    n = len(x); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (fc / np.maximum(f, 1)) ** 4), n)
def midi(m): return 440 * 2 ** ((m - 69) / 12)

BPM = 96; beat = 60 / BPM; bar = 4 * beat
DUR = TOTAL - 4; n = int(DUR * SR); t = np.arange(n) / SR
mix = np.zeros(n)

def place(sig, at, gain=1.0):
    i = int(at * SR); j = min(n, i + len(sig))
    if i < n: mix[i:j] += sig[:j - i] * gain

# 鼓组
kl = int(0.45 * SR); kt = np.arange(kl) / SR
kick = np.sin(2 * np.pi * np.cumsum(48 + 90 * np.exp(-kt * 28)) / SR) * np.exp(-kt * 7) * (1 - np.exp(-kt * 900))
hl = int(0.06 * SR); hat = hp(rng.standard_normal(hl), 7000) * np.exp(-np.arange(hl) / SR * 70); hat /= np.abs(hat).max()
cl = int(0.25 * SR); ct = np.arange(cl) / SR
clap = lp(hp(rng.standard_normal(cl), 900), 4500) * np.exp(-ct * 22); clap /= np.abs(clap).max()

chords = [[45, 57, 60, 64, 67], [41, 57, 60, 64, 65], [48, 55, 59, 64, 67], [43, 55, 59, 62, 67]]
nb = int(DUR / bar)
for b in range(nb):
    t0 = b * bar
    for k in range(4):
        tb = t0 + k * beat
        if k in (0, 2) or (k == 3 and b % 2): place(kick, tb + (beat / 2 if k == 3 else 0), 0.9)
        if k in (1, 3): place(clap, tb, 0.28)
        for h in range(2):
            place(hat, tb + h * beat / 2 + (0.012 if h else 0), 0.22 if h else 0.14)
    # 低音：跟随和弦根音，八分音符切分
    root = midi(chords[(b // 2) % 4][0] - 12)
    for k in range(8):
        if k in (1, 4): continue
        L = int(beat / 2 * 0.9 * SR); bt = np.arange(L) / SR
        note = (np.sin(2 * np.pi * root * bt) + 0.3 * np.sin(4 * np.pi * root * bt)) * np.exp(-bt * 5) * (1 - np.exp(-bt * 300))
        place(note, t0 + k * beat / 2, 0.45)
# 电钢琴式和弦（每 2 小节换一次，切分）
for b in range(0, nb, 1):
    notes = chords[(b // 2) % 4][1:]
    for k in (0, 2.5):
        L = int(1.2 * SR); ct2 = np.arange(L) / SR
        s = sum(np.sin(2 * np.pi * midi(m) * ct2) * (1 + 0.3 * np.sin(2 * np.pi * 5 * ct2)) for m in notes)
        place(s * np.exp(-ct2 * 2.5) * (1 - np.exp(-ct2 * 200)) / len(notes), b * bar + k * beat, 0.35)
mix = lp(mix, 9000)
# 侧链感：每个 kick 处压低和声（简化为整体包络）
duck = 1 - 0.25 * np.exp(-((t % beat) / 0.12))
mix *= duck
mix /= np.abs(mix).max()
fade = np.ones(n); fade[:int(1.5 * SR)] = np.linspace(0, 1, int(1.5 * SR)); fade[-int(4 * SR):] = np.linspace(1, 0, int(4 * SR))
write('bgm_beat.wav', mix * fade * 0.85)

# 打字声：一串随机按键
def typing(L=1.2, rate=16):
    m = int(L * SR); y = np.zeros(m); tt = 0.0
    while tt < L - 0.05:
        cl = int(0.018 * SR); c = hp(rng.standard_normal(cl), 2500) * np.exp(-np.arange(cl) / SR * 350)
        i = int(tt * SR); y[i:i + cl] += c * rng.uniform(0.5, 1.0)
        tt += rng.uniform(0.6, 1.4) / rate
    return y / np.abs(y).max() * 0.8
write('typing.wav', typing())

# 快切 swish：短促高频扫
m = int(0.35 * SR); st = np.arange(m) / SR
sw = rng.standard_normal(m); out = np.zeros(m); B = 1024
for i in range(0, m, B):
    c = sw[i:i + B]; p = i / m; fc = 1500 + 7000 * p
    C = np.fft.rfft(c, B); f = np.fft.rfftfreq(B, 1 / SR); C *= np.exp(-((np.log2(f + 1) - np.log2(fc)) ** 2) / 0.5)
    out[i:i + B] = np.fft.irfft(C, B)[:len(c)]
out *= np.sin(np.pi * st / 0.35) ** 2; out /= np.abs(out).max()
write('swish.wav', out * 0.8)

# 重击：低频 + 噪声（砸屏用）
m = int(1.4 * SR); it = np.arange(m) / SR
boom = np.sin(2 * np.pi * np.cumsum(40 + 120 * np.exp(-it * 18)) / SR) * np.exp(-it * 3.5)
crack = lp(rng.standard_normal(m), 6000) * np.exp(-it * 25) * 0.6
y = boom + crack; y /= np.abs(y).max()
write('slam.wav', y * 0.9)
print('音效与背景乐已生成')
