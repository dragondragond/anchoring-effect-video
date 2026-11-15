"""按原始逐字稿时间渲染静帧：python3 scripts/still_src.py outdir 48.2 50 ..."""
import re, sys, subprocess, json
ts = open('src/data/timemap.ts').read()
segs = json.loads(re.search(r'SEGS[^=]*= (\[.*\]);', ts).group(1))
def new(s):
    for g in segs:
        if s < g['s']: return g['n']
        if s < g['s'] + g['d']: return g['n'] + s - g['s']
    g = segs[-1]; return g['n'] + s - g['s']
out = sys.argv[1]
for a in sys.argv[2:]:
    f = round(new(float(a)) * 30)
    subprocess.run(['npx', 'remotion', 'still', 'src/index.ts', 'Main', f'{out}/s{a}.jpg', f'--frame={f}', '--log=error'])
