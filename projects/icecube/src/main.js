// Compose a frame at time t; studio playback when not in render mode.

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

function renderFrame(t) {
  const frame = Math.round(t * FPS);
  ctx.save();
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
  drawSceneBackground(ctx, t);
  // gentle camera drift on the content layer so no shot is ever fully still (scripts/motion_check.mjs turns it off)
  ctx.save();
  const dr = window.NO_DRIFT ? 0 : 1;
  const cs = 1 + dr * (0.012 + 0.012 * Math.sin((t / 17) * Math.PI * 2));
  ctx.translate(W / 2 + dr * 9 * Math.sin((t / 23) * Math.PI * 2), H / 2 + dr * 5 * Math.sin((t / 29) * Math.PI * 2));
  ctx.scale(cs, cs); ctx.translate(-W / 2, -H / 2);
  for (const scene of SCENES) scene(ctx, t);
  ctx.restore();
  drawCorners(ctx, t);
  drawSubtitles(ctx, t);
  drawWatermark(ctx, t);
  drawFinish(ctx, t, frame);
  const k = Math.max(1 - prog(t, 0, 1.2), prog(t, DUR - 1.0, DUR)); // fade from / to black
  if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

window.renderAt = (t) => renderFrame(t);
window.frameJPEG = (t, q) => { renderFrame(t); return cv.toDataURL('image/jpeg', q).slice(23); };
window.framePNG = (t) => { renderFrame(t); return cv.toDataURL('image/png').slice(22); };

const params = new URLSearchParams(location.search);
document.fonts.load('900 40px "Songti SC"').then(() => document.fonts.load('700 40px "Songti SC"')).then(() => {
  window.ready = true;
  if (params.has('render')) return;
  const audio = new Audio('src/bgm.mp3');
  const bar = document.getElementById('seek'), lab = document.getElementById('time');
  bar.max = DUR;
  let t = parseFloat(params.get('t') || '0');
  audio.currentTime = t;
  const loop = () => {
    if (!audio.paused) t = audio.currentTime;
    renderFrame(t);
    bar.value = t;
    lab.textContent = `${t.toFixed(2)}s  bar ${((t - OFF) / BAR + 1).toFixed(2)}`;
    requestAnimationFrame(loop);
  };
  loop();
  const toggle = () => (audio.paused ? audio.play() : audio.pause());
  document.getElementById('play').onclick = toggle;
  bar.oninput = () => { t = parseFloat(bar.value); audio.currentTime = t; };
  addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    if (e.code === 'ArrowRight') { t = Math.min(DUR, t + (e.shiftKey ? BAR : 1 / FPS)); audio.currentTime = t; }
    if (e.code === 'ArrowLeft') { t = Math.max(0, t - (e.shiftKey ? BAR : 1 / FPS)); audio.currentTime = t; }
  });
});
