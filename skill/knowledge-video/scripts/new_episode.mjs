#!/usr/bin/env node
// Create a new episode project from the template.
// Usage: node new_episode.mjs --dir <path> --bgm <bgm.mp3> [--title 主题] [--en "TOPIC NAME"] [--signature LIGHT聊AI] [--out 主题.mp4]
// - copies assets/template, copies the BGM to src/bgm.mp3, writes src/music.js from the BGM analysis
// - reuses node_modules from a sibling episode when one exists, otherwise runs npm install
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { analyzeBgm } from './analyze_bgm.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = path.join(HERE, '..', 'assets', 'template');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const dir = arg('--dir'), bgm = arg('--bgm');
if (!dir || !bgm) { console.error('usage: node new_episode.mjs --dir <path> --bgm <bgm.mp3> [--title 主题] [--en "TOPIC"] [--signature 署名] [--out 文件名.mp4]'); process.exit(1); }
if (fs.existsSync(dir) && fs.readdirSync(dir).length) { console.error(`${dir} already exists and is not empty`); process.exit(1); }

fs.cpSync(TEMPLATE, dir, { recursive: true });
fs.copyFileSync(bgm, path.join(dir, 'src', 'bgm.mp3'));
const m = analyzeBgm(bgm);
fs.writeFileSync(path.join(dir, 'src', 'music.js'),
  `// Written by new_episode.mjs from the BGM analysis. bpm: tempo, offset: first beat (s), duration: BGM length (s).\nconst MUSIC = { bpm: ${m.bpm}, offset: ${m.offset}, duration: ${m.duration} };\n`);
fs.writeFileSync(path.join(dir, 'music-analysis.json'), JSON.stringify(m, null, 1));

const dataFile = path.join(dir, 'src', 'data.js');
let data = fs.readFileSync(dataFile, 'utf8');
if (arg('--title')) data = data.replace("title: '主题名'", `title: '${arg('--title')}'`);
if (arg('--en')) data = data.replace("titleEn: 'TOPIC NAME'", `titleEn: '${arg('--en')}'`);
if (arg('--signature')) data = data.replace("signature: 'LIGHT聊AI'", `signature: '${arg('--signature')}'`);
fs.writeFileSync(dataFile, data);
if (arg('--out')) {
  const r = path.join(dir, 'render.mjs');
  fs.writeFileSync(r, fs.readFileSync(r, 'utf8').replace("String(args.out || 'video.mp4')", `String(args.out || '${arg('--out')}')`));
}

// node_modules: borrow from a sibling episode if possible (saves ~40 s of npm install)
const parent = path.dirname(path.resolve(dir));
const sibling = fs.readdirSync(parent).map((d) => path.join(parent, d, 'node_modules', 'puppeteer-core')).find((p) => fs.existsSync(p));
if (sibling) fs.cpSync(path.dirname(sibling), path.join(dir, 'node_modules'), { recursive: true });
else execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: dir, stdio: 'inherit' });

console.log(`created ${dir}`);
console.log(`music: ${m.bpm} BPM, first beat ${m.offset}s, ${m.duration}s; sections:`);
for (const s of m.sections) console.log(`  bars ${s.startBar}–${s.endBar}  ${s.start}–${s.end}s  ${s.level}`);
