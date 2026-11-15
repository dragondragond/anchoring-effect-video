"""把逐字稿 SRT 整理成适合上屏的字幕：合并碎片、修正专有名词大小写、中英文之间加空格。

用法：
  build_captions.py <in.srt> <out.ts> [--terms terms.json] [--raw]
  --raw    只打印原始逐字稿（带时间戳），用于通读和规划画面
  --terms  JSON：{"错误写法(正则)": "正确写法"}，会追加到内置的术语表
"""
import json, re, sys

args = sys.argv[1:]
raw = '--raw' in args
terms_file = args[args.index('--terms') + 1] if '--terms' in args else None
pos = [a for i, a in enumerate(args) if not a.startswith('--') and (i == 0 or args[i - 1] != '--terms')]
src, dst = pos[0], pos[1]

def ts(s):
    h, m, r = s.replace('.', ',').split(':'); s_, ms = r.split(','); return int(h) * 3600 + int(m) * 60 + int(s_) + int(ms) / 1000

cues = []
for b in re.split(r'\n\s*\n', open(src, encoding='utf-8-sig').read().strip()):
    l = [x for x in b.strip().split('\n') if x.strip()]
    if len(l) < 2 or '-->' not in l[1]: continue
    a, c = [x.strip() for x in l[1].split('-->')]
    cues.append({'s': ts(a), 'e': ts(c), 't': ''.join(l[2:]).strip()})

if raw:
    for i, c in enumerate(cues, 1):
        print(f"{i:3d} {c['s']:7.2f} {c['e']:7.2f} {c['t']}")
    sys.exit(0)

# 1) 被语音识别切开的文件名：“AGENTS” + “md” → “AGENTS.md”
out = []
for c in cues:
    if c['t'].lower() in ('md', 'json', 'py', 'ts', 'js') and out:
        out[-1]['t'] += '.' + c['t']; out[-1]['e'] = c['e']
    else:
        out.append(dict(c))

# 2) 过短碎片并入前一句（不合并“第X个/第X层/第X步”，那是章节起点）
merged = []
for c in out:
    bare = re.sub(r'[、，。？！]', '', c['t'])
    prev = merged[-1]['t'] if merged else ''
    short = len(bare) <= 4 or re.fullmatch(r'[\w-]+\.\w+', bare)
    name_list = re.fullmatch(r'[A-Za-z0-9 .+-]+', bare) and prev.endswith('、')
    if merged and not re.fullmatch(r'第.[个层步点章]', bare) and (short or name_list) and c['s'] - merged[-1]['e'] < 0.25 \
            and len(prev) + len(bare) <= (30 if name_list else 18):
        sep = '' if re.search(r'[、，。？！]$', prev) or re.fullmatch(r'[\w-]+\.\w+', bare) else '，'
        merged[-1]['t'] = prev + sep + c['t']; merged[-1]['e'] = c['e']
    else:
        merged.append(c)

# 3) 专有名词大小写（常见 AI/开发工具，可用 --terms 追加）
FIX = [
    (r'(?i)claude\s*code', 'Claude Code'), (r'(?i)(?<![A-Za-z])claude(?![A-Za-z])', 'Claude'), (r'(?i)codex', 'Codex'),
    (r'(?i)chatgpt', 'ChatGPT'), (r'(?i)openai', 'OpenAI'), (r'(?i)cursor', 'Cursor'), (r'(?i)github', 'GitHub'),
    (r'(?i)workbuddy', 'WorkBuddy'), (r'(?i)hermes', 'Hermes'), (r'(?i)(?<![A-Za-z])mcp(?![A-Za-z])', 'MCP'),
    (r'(?i)(?<![A-Za-z])api(?![A-Za-z])', 'API'), (r'(?i)(?<![A-Za-z])sop(?![A-Za-z])', 'SOP'),
    (r'(?i)agents\.md', 'AGENTS.md'), (r'(?i)memory\.md', 'MEMORY.md'), (r'(?i)claude\.md', 'CLAUDE.md'), (r'(?i)skill\.md', 'SKILL.md'),
    (r'(?i)(?<![A-Za-z])agent(?![A-Za-z])', 'Agent'), (r'(?i)(?<![A-Za-z.])skill(?![A-Za-z.])', 'Skill'),
    (r'(?i)(?<![A-Za-z])token(?![A-Za-z])', 'token'),
]
if terms_file:
    FIX += list(json.load(open(terms_file)).items())

def clean(s):
    for a, b in FIX: s = re.sub(a, b, s)
    s = s.rstrip('、，。')
    s = s.replace('、', ' · ').replace('，', ' ')
    s = re.sub(r'([一-鿿])([A-Za-z0-9])', r'\1 \2', s)
    s = re.sub(r'([A-Za-z0-9.])([一-鿿])', r'\1 \2', s)
    return re.sub(r'\s+', ' ', s).strip()

res = [{'s': round(c['s'], 3), 'e': round(c['e'], 3), 't': clean(c['t'])} for c in merged]
open(dst, 'w').write('// 由 scripts/build_captions.py 生成，勿手改\nexport const CAPTIONS: {s: number; e: number; t: string}[] = '
                     + json.dumps(res, ensure_ascii=False, indent=1) + ';\n')
for r in res: print(f"{r['s']:7.2f} {r['e']:7.2f} {r['t']}")
