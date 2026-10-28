// 第 30 包：復古懷舊（5）。VHS、映像管、底片、像素、卡帶。
import type { XFx, XK, XC } from './kit';

export const xp30 = (K: XK) => {
  const { ease, back, seg, box, circle, ring, line, T, pop, fade, pill, alpha, WHITE, INK, PAL, rng, lerp, TAU, shade } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const scan = (x: X, w: number, h: number, a = 0.12) => { x.fillStyle = `rgba(0,0,0,${a})`; for (let y = -2000; y < h + 2000; y += 8) x.fillRect(-4000, y, 9000, 3); };
  const fx: Record<string, XFx> = {
    'rr-vhs': { bg: '#2a3a55', d: (x, c) => stage(c, (w, h) => {
      const j = Math.sin(c.t * 37) > 0.9 ? 8 : 0;
      fade(x, seg(c.t, 0.2, 0.6), () => { x.save(); x.globalCompositeOperation = 'lighter'; T(x, '1998 年的房價', w / 2 + 6 + j, h / 2, c.land ? 120 : 96, alpha('#ff3b3b', 0.8)); T(x, '1998 年的房價', w / 2 - 6 + j, h / 2, c.land ? 120 : 96, alpha('#3bd5ff', 0.8)); x.restore(); T(x, '1998 年的房價', w / 2 + j, h / 2, c.land ? 120 : 96, WHITE); });
      if (Math.floor(c.t * 2) % 2 === 0) circle(x, 90, 100, 22, PAL.red); T(x, 'REC', 130, 112, 52, WHITE, 'left');
      T(x, 'PLAY ▶', w - 70, 112, 52, WHITE, 'right'); T(x, `APR. 12 1998  ${String(Math.floor(c.t) % 60).padStart(2, '0')}:${String(Math.floor(c.t * 30) % 30).padStart(2, '0')}`, 70, h - 80, 46, WHITE, 'left');
      const by = ((c.t * 300) % (h + 200)) - 100; box(x, -4000, by, 9000, 30, 0, alpha(WHITE, 0.12)); scan(x, w, h); }) },
    'rr-crt': { bg: '#111', d: (x, c) => stage(c, (w, h) => {
      const sw = c.land ? 1300 : 860, sh = c.land ? 760 : 700, cx = w / 2, cy = h / 2;
      box(x, cx - sw / 2 - 40, cy - sh / 2 - 40, sw + 80, sh + 80, 60, '#c9a36b'); box(x, cx - sw / 2, cy - sh / 2, sw, sh, 80, '#0e2a22');
      const on = ease(seg(c.t, 0.3, 0.9)); pop(x, cx, cy, Math.max(0.01, on), () => { box(x, cx - sw / 2, cy - sh / 2, sw, sh, 80, '#1f7a5a'); T(x, '老公寓也有春天', cx, cy - 20, c.land ? 100 : 76, '#d9ffe9'); fade(x, seg(c.t, 1.2, 1.6), () => T(x, '屋齡 40 年的翻新故事', cx, cy + 90, 50, alpha('#d9ffe9', 0.8))); }, Math.max(0.01, seg(c.t, 0.3, 0.5)) * on + 0.01);
      x.save(); x.beginPath(); x.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, 80); x.clip(); scan(x, w, h, 0.2); const g = x.createRadialGradient(cx, cy, sh * 0.3, cx, cy, sw * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)'); x.fillStyle = g; x.fillRect(cx - sw, cy - sh, sw * 2, sh * 2); x.restore();
      if (!c.land) { circle(x, cx - 150, cy + sh / 2 + 160, 40, '#8a6a3a'); circle(x, cx + 150, cy + sh / 2 + 160, 40, '#8a6a3a'); } }) },
    'rr-film': { bg: '#1b1410', d: (x, c) => stage(c, (w, h) => {
      const fw = c.land ? w : w, fh = c.land ? 640 : 900, y0 = (h - fh) / 2, off = (c.t * 160) % 90;
      box(x, -4000, y0, 9000, fh, 0, '#2b2018');
      for (let X0 = -200 - off; X0 < fw + 200; X0 += 90) { box(x, X0, y0 + 20, 50, 40, 8, '#e9dcc4'); box(x, X0, y0 + fh - 60, 50, 40, 8, '#e9dcc4'); }
      const fl = 0.85 + Math.sin(c.t * 50) * 0.08; fade(x, fl, () => { box(x, 60, y0 + 100, w - 120, fh - 200, 16, '#e8c58a'); fade(x, seg(c.t, 0.3, 0.8), () => { T(x, '阿公的第一間房', w / 2, y0 + fh / 2 - 20, c.land ? 110 : 84, '#3a2614'); T(x, '民國 68 年・台中（示意）', w / 2, y0 + fh / 2 + 90, 50, alpha('#3a2614', 0.7)); }); });
      const r = rng(Math.floor(c.t * 12)); for (let i = 0; i < 30; i++) circle(x, r() * w, y0 + r() * fh, 1 + r() * 3, alpha(WHITE, 0.4)); line(x, r() * w, y0, r() * w, y0 + fh, 2, alpha(WHITE, 0.2)); }) },
    'rr-pixel': { bg: '#5b6ee1', d: (x, c) => stage(c, (w, h) => {
      const P = c.land ? 30 : 38, map = ['....RR....', '...RRRR...', '..RRRRRR..', '.RRRRRRRR.', '..WWWWWW..', '..WBWWDW..', '..WWWWDW..', '..WWWWDW..'];
      const ox = w / 2 - 5 * P * 1.6, oy = h * 0.22; let n = 0;
      map.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '.') return; const at = 0.1 + n++ * 0.03; if (c.t > at) box(x, ox + i * P * 1.6, oy + j * P * 1.6, P * 1.6, P * 1.6, 0, ch === 'R' ? PAL.red : ch === 'W' ? '#fff3c4' : ch === 'B' ? PAL.sky : '#8a5a2a'); }));
      const s = '購屋任務 START', k = Math.floor(seg(c.t, 1.6, 2.6) * s.length); x.save(); x.imageSmoothingEnabled = false; T(x, s.slice(0, k), w / 2, h * (c.land ? 0.78 : 0.68), c.land ? 96 : 80, WHITE, 'center', 900); x.restore();
      if (c.t > 2.6 && Math.floor(c.t * 2) % 2) T(x, '▶ PRESS A', w / 2, h * (c.land ? 0.9 : 0.8), 50, PAL.yel);
      for (let i = 0; i < 3; i++) box(x, 60 + i * 70, 60, 50, 50, 0, PAL.red); T(x, 'LV.1', w - 60, 100, 50, WHITE, 'right'); }) },
    'rr-cassette': { bg: '#f2c14e', d: (x, c) => stage(c, (w, h) => {
      const cw = c.land ? 1000 : 840, ch = cw * 0.62, cx = w / 2, cy = h / 2;
      pop(x, cx, cy, back(seg(c.t, 0, 0.5)), () => {
        box(x, cx - cw / 2, cy - ch / 2, cw, ch, 40, '#2b2d42'); box(x, cx - cw * 0.42, cy - ch * 0.4, cw * 0.84, ch * 0.32, 16, '#fff5e1');
        T(x, '看屋 mixtape Vol.1', cx, cy - ch * 0.24, cw * 0.06, INK);
        box(x, cx - cw * 0.3, cy - ch * 0.02, cw * 0.6, ch * 0.3, 60, '#1a1b2a');
        [-1, 1].forEach((sd) => { const rx = cx + sd * cw * 0.18, ry = cy + ch * 0.13; circle(x, rx, ry, ch * 0.12, WHITE); x.save(); x.translate(rx, ry); x.rotate(c.t * 4); for (let i = 0; i < 6; i++) { x.rotate(TAU / 6); box(x, -6, -ch * 0.09, 12, ch * 0.05, 4, '#2b2d42'); } x.restore(); });
        box(x, cx - cw * 0.35, cy + ch * 0.36, cw * 0.7, 18, 9, shade('#2b2d42', -0.2));
      });
      fade(x, seg(c.t, 1, 1.5), () => pill(x, 'Side A：信義區　Side B：板橋', cx, cy + ch / 2 + 110, 44, PAL.red, WHITE)); void ring; void lerp; void line; }) },
  };
  return fx;
};
