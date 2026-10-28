// 第 28 包：氣候與災害風險（6）。台灣輪廓、潛勢分區皆為粗略示意，非官方圖資。
import type { XC, XFx, XK } from './kit';

export const xp28 = (K: XK) => {
  const { ease, inout, back, seg, box, circle, ring, line, T, pop, fade, pill, alpha, WHITE, INK, PAL, poly, house, cloud, rng, lerp, clamp, TAU, demo, shade } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const TWP = [[0.62, 0], [0.74, 0.05], [0.72, 0.16], [0.78, 0.3], [0.74, 0.5], [0.64, 0.7], [0.53, 0.88], [0.45, 1], [0.39, 0.9], [0.28, 0.75], [0.16, 0.56], [0.13, 0.4], [0.24, 0.22], [0.42, 0.08]];
  const island = (x: X, cx: number, cy: number, H: number, col: string) => { const W = H * 0.5; const pts = TWP.map(([a, b]) => [cx + (a - 0.45) * W * 2, cy + (b - 0.5) * H]); poly(x, pts, col); return pts; };
  const title = (x: X, w: number, s: string, a: number) => fade(x, a, () => T(x, s, w / 2, 90, 64, WHITE));
  const fx: Record<string, XFx> = {
    'wr-flood': { bg: '#9fd3f0', d: (x, c) => stage(c, (w, h) => { const gy = h * 0.72, n = c.land ? 4 : 3, gap = w / n;
      box(x, -4000, gy, 9000, 4000, 0, '#8a8f99');
      for (let i = 0; i < n; i++) pop(x, gap * (i + 0.5), gy, back(seg(c.t, i * 0.12, i * 0.12 + 0.5)), () => house(x, gap * (i + 0.5), gy, c.land ? gap * 0.6 : 300, ['#f3efe6', '#ffe2b8', '#d8ecff', '#ffd6de'][i], [PAL.red, PAL.blue, PAL.brick, PAL.teal][i]));
      const lv = inout(seg(c.t, 0.8, 2.6)) * h * (c.land ? 0.07 : 0.05), wy = gy - lv;
      x.beginPath(); x.moveTo(-4000, h + 4000); for (let X0 = -400; X0 <= w + 400; X0 += 20) x.lineTo(X0, wy + Math.sin(X0 / 60 + c.t * 4) * 8); x.lineTo(w + 4000, h + 4000); x.closePath(); x.fillStyle = alpha('#3a7bd5', 0.72); x.fill();
      const p = seg(c.t, 1.2, 2.6); fade(x, p, () => { line(x, w * 0.9, gy, w * 0.9, wy, 8, WHITE); T(x, `${Math.round(50 * ease(p))} cm`, w * 0.9, wy - 50, 52, INK); });
      title(x, w, '淹水潛勢：低窪區先看', seg(c.t, 0.2, 0.7)); fade(x, seg(c.t, 2.6, 3), () => pill(x, '買房前查淹水紀錄', w / 2, h * 0.88, 46, PAL.yel, INK)); demo(x, w, h, 'rgba(0,0,0,.5)'); }) },
    'wr-liq': { bg: '#18324a', d: (x, c) => stage(c, (w, h) => { const H = h * (c.land ? 0.72 : 0.62), cx = c.land ? w * 0.38 : w / 2, cy = h * 0.55;
      pop(x, cx, cy, back(seg(c.t, 0, 0.5)), () => island(x, cx, cy, H, '#e9e4d8'));
      const r = rng(28), cols = [PAL.red, PAL.yel, PAL.grn];
      for (let i = 0; i < 26; i++) { const a = TWP[Math.floor(r() * TWP.length)], b = [0.45, 0.5]; const k = 0.25 + r() * 0.6; const px = cx + (lerp(b[0], a[0], k) - 0.45) * H, py = cy + (lerp(b[1], a[1], k) - 0.5) * H; const lv = r() < 0.3 ? 0 : r() < 0.6 ? 1 : 2; pop(x, px, py, back(seg(c.t, 0.6 + i * 0.05, 1.0 + i * 0.05)), () => circle(x, px, py, H * 0.035, alpha(cols[lv], 0.9))); }
      const lx = c.land ? w * 0.68 : w * 0.2, ly = c.land ? h * 0.4 : h * 0.88;
      ['高潛勢', '中潛勢', '低潛勢'].forEach((s, i) => fade(x, seg(c.t, 2 + i * 0.2, 2.4 + i * 0.2), () => { const X0 = c.land ? lx : lx + i * 300, Y = c.land ? ly + i * 100 : ly; circle(x, X0, Y, 26, cols[i]); T(x, s, X0 + 46, Y + 2, 44, WHITE, 'left'); }));
      title(x, w, '土壤液化潛勢（示意）', seg(c.t, 0.2, 0.7)); }) },
    'wr-quake': { bg: '#2b2236', d: (x, c) => stage(c, (w, h) => { const gy = h * 0.78, s = seg(c.t, 0.8, 3.2), sh = Math.sin(c.t * 40) * 14 * (s > 0 && s < 1 ? 1 - s : 0);
      for (let i = 0; i < 4; i++) { const p = ((c.t - 0.6 - i * 0.4) % 1.6) / 1.6; if (c.t > 0.6 + i * 0.4) ring(x, w / 2, gy, p * w * 0.6, 10, alpha(PAL.yel, 1 - p)); }
      box(x, -4000, gy, 9000, 4000, 0, '#4a3b2a');
      x.save(); x.translate(sh, 0); const bw = c.land ? 300 : 360, bh = c.land ? 480 : 700; pop(x, w / 2, gy, back(seg(c.t, 0, 0.5)), () => { box(x, w / 2 - bw / 2, gy - bh, bw, bh, 18, PAL.sky); for (let r2 = 0; r2 < 6; r2++) for (let k = 0; k < 3; k++) box(x, w / 2 - bw / 2 + 30 + k * (bw - 60) / 3, gy - bh + 30 + r2 * (bh - 40) / 6, (bw - 60) / 3 - 20, (bh - 40) / 6 - 24, 6, '#fff7d6'); }); x.restore();
      pop(x, w / 2, h * 0.24, back(seg(c.t, 1.2, 1.7)), () => pill(x, '震度 5 弱（示意）', w / 2, h * 0.24, 60, PAL.red, WHITE));
      title(x, w, '選耐震結構', seg(c.t, 0.2, 0.7)); }) },
    'wr-typhoon': { bg: '#1d5f8a', d: (x, c) => stage(c, (w, h) => { const H = h * 0.5, cx = w * 0.42, cy = h * 0.55;
      island(x, cx, cy, H, '#7bc47f');
      const P0 = [w * 1.0, h * 0.9], P1 = [cx + H * 0.2, cy - H * 0.05], P2 = [w * 0.1, h * 0.22], p = 0.72 * inout(seg(c.t, 0.4, 3.6));
      const at = (q: number) => q < 0.5 ? [lerp(P0[0], P1[0], q * 2), lerp(P0[1], P1[1], q * 2)] : [lerp(P1[0], P2[0], q * 2 - 1), lerp(P1[1], P2[1], q * 2 - 1)];
      for (let i = 0; i <= 20; i++) { const q = i / 20; if (q <= p) { const [a, b] = at(q); circle(x, a, b, 8, alpha(WHITE, 0.7)); } }
      const [tx, ty] = at(p), R = H * 0.28; x.save(); x.translate(tx, ty); x.rotate(-c.t * 3);
      for (let k = 0; k < 3; k++) { x.beginPath(); for (let a = 0; a < 5; a += 0.1) { const r2 = R * (1 - a / 5); x.lineTo(Math.cos(a + k * TAU / 3) * r2, Math.sin(a + k * TAU / 3) * r2); } x.lineWidth = R * 0.22; x.strokeStyle = alpha(WHITE, 0.85); x.lineCap = 'round'; x.stroke(); }
      circle(x, 0, 0, R * 0.12, '#1d5f8a'); x.restore();
      title(x, w, '颱風路徑會經過嗎？', seg(c.t, 0.2, 0.7)); fade(x, seg(c.t, 3.4, 3.8), () => pill(x, '迎風面注意防水', w / 2, h * 0.9, 46, PAL.yel, INK)); }) },
    'wr-slide': { bg: '#bfe3f5', d: (x, c) => stage(c, (w, h) => { const gy = h * 0.85;
      poly(x, [[-4000, gy], [w * 0.1, h * 0.3], [w * 0.75, gy], [w + 4000, gy], [w + 4000, h + 4000], [-4000, h + 4000]], '#6ab04c'); box(x, -4000, gy, 9000, 4000, 0, '#7a5a3a');
      house(x, w * 0.58, lerp(h * 0.3, gy, 0.72) + 20, c.land ? 140 : 170, '#f3efe6', PAL.red);
      const r = rng(5); for (let i = 0; i < 9; i++) { const d = r() * 0.4, p = ease(seg(c.t, 0.8 + d, 2.2 + d)), sx = w * (0.14 + r() * 0.08), sy = h * 0.36 + r() * 40; const k = p * 0.5; const px = lerp(sx, w * 0.75, k), py = lerp(sy, gy, k) - 20; circle(x, px, py, 18 + r() * 22, shade('#8a6a4a', r() * 0.3)); }
      pop(x, w * 0.82, h * 0.42, back(seg(c.t, 2.2, 2.7)), () => { poly(x, [[w * 0.82, h * 0.42 - 90], [w * 0.82 + 95, h * 0.42 + 70], [w * 0.82 - 95, h * 0.42 + 70]], PAL.yel); T(x, '!', w * 0.82, h * 0.42 + 20, 100, INK); });
      title(x, w, '山坡地：查順向坡', seg(c.t, 0.2, 0.7)); }) },
    'wr-heat': { bg: '#ffb36b', d: (x, c) => stage(c, (w, h) => { const sx = w * 0.28, sy = h * 0.35, s = 1 + Math.sin(c.t * 4) * 0.05;
      pop(x, sx, sy, back(seg(c.t, 0, 0.5)) * s, () => { for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + c.t * 0.5; line(x, sx + Math.cos(a) * 150, sy + Math.sin(a) * 150, sx + Math.cos(a) * 200, sy + Math.sin(a) * 200, 18, PAL.yel); } circle(x, sx, sy, 120, '#ffd23f'); });
      const tx = w * 0.72, top = h * 0.2, bot = h * 0.72, p = ease(seg(c.t, 0.6, 2.4));
      box(x, tx - 40, top, 80, bot - top, 40, WHITE); circle(x, tx, bot, 70, WHITE); circle(x, tx, bot, 52, PAL.red); box(x, tx - 22, lerp(bot, top + 30, p), 44, bot - lerp(bot, top + 30, p), 22, PAL.red);
      T(x, `${Math.round(lerp(25, 38, p))}°C`, tx, bot + 140, 90, INK);
      for (let i = 0; i < 5; i++) { const X0 = w * (0.1 + i * 0.12), yy = h * 0.88; x.beginPath(); for (let k = 0; k < 8; k++) x.lineTo(X0 + Math.sin(k + c.t * 5) * 14, yy - k * 18); x.lineWidth = 6; x.strokeStyle = alpha(PAL.red, 0.5); x.stroke(); }
      title(x, w, '西曬屋：夏天熱到爆', seg(c.t, 0.2, 0.7)); demo(x, w, h, 'rgba(0,0,0,.5)'); }) },
  };
  void clamp; void cloud;
  return fx;
};
