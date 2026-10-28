// 第 13 包：地圖元件（6）。平塗示意街區當底，元件可疊在任何地圖畫面上。
import type { XC, XFx, XK } from './kit';

export const xp13 = (K: XK) => {
  const { ease, inout, back, bounce, seg, box, circle, ring, line, T, pop, fade, pill, alpha, INK, WHITE, pin, poly, house, tree, train, cnt, lerp, mapBase, heart, star } = K;
  type X = CanvasRenderingContext2D;
  const stage = (x: X, c: XC, seed: number, fn: (w: number, h: number) => void) => { mapBase(x, 0, 0, c.W, c.H, seed); const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const R: Record<string, XFx> = {
    'mk-pin': { d: (x, c) => stage(x, c, 3, (w, h) => {
      const t = c.t, P: [number, number, string][] = c.land ? [[420, 520, c.ac], [860, 360, '#2f6db5'], [1260, 600, '#3aa04a']] : [[300, 620, c.ac], [640, 860, '#2f6db5'], [420, 1150, '#3aa04a']];
      P.forEach(([px, py, col], i) => {
        const p = seg(t, 0.3 + i * 0.35, 0.9 + i * 0.35), yy = lerp(py - 700, py, bounce(p)), sq = p >= 1 ? 1 : 1;
        if (p > 0) { x.fillStyle = alpha(INK, 0.25 * p); x.beginPath(); x.ellipse(px, py + 6, 40 * p, 12 * p, 0, 0, K.TAU); x.fill(); }
        if (p > 0) pop(x, px, yy, sq, () => pin(x, px, yy, 110, col));
        const rq = seg(t, 0.9 + i * 0.35, 1.5 + i * 0.35); if (rq > 0 && rq < 1) ring(x, px, py, 20 + rq * 90, 6, alpha(col, 1 - rq));
        fade(x, seg(t, 1.0 + i * 0.35, 1.3 + i * 0.35), () => pill(x, c.s(i, ['建案 A', '建案 B', '建案 C'][i]), px, py - 250, 44, INK, WHITE));
      });
    }) },
    'mk-scale': { d: (x, c) => stage(x, c, 5, (w, h) => {
      const t = c.t, L = c.land ? 1100 : 220, y = c.land ? 840 : 1300, bw = c.land ? 480 : 560, p = ease(seg(t, 0.3, 1.2));
      box(x, L - 30, y - 90, bw + 60, 150, 20, alpha(WHITE, 0.9));
      for (let i = 0; i < 4; i++) box(x, L + i * bw / 4, y - 16, bw / 4 * Math.max(0, Math.min(1, p * 4 - i)), 32, 0, i % 2 ? WHITE : INK);
      x.strokeStyle = INK; x.lineWidth = 4; x.strokeRect(L, y - 16, bw * p, 32);
      for (let i = 0; i <= 4; i++) if (p * 4 >= i) T(x, ['0', '250', '500', '750', '1 km'][i], L + i * bw / 4, y - 50, 28, INK, 'center', 900);
      const zq = inout(seg(t, 1.6, 2.6)); fade(x, zq, () => pill(x, c.title('步行約 12 分'), L + bw / 2, y + 100, 34, c.ac, WHITE));
    }) },
    'mk-north': { d: (x, c) => stage(x, c, 7, (w, h) => {
      const t = c.t, cx = c.land ? 1500 : 820, cy = c.land ? 180 : 220, R0 = 110, q = back(seg(t, 0, 0.5)), a = (1 - ease(seg(t, 0.3, 2.0))) * Math.sin(t * 9) * 0.9;
      pop(x, cx, cy, q, () => {
        circle(x, cx, cy + 8, R0, alpha(INK, 0.25)); circle(x, cx, cy, R0, WHITE); ring(x, cx, cy, R0 - 8, 6, INK);
        for (let i = 0; i < 8; i++) { const b = i * Math.PI / 4; line(x, cx + Math.cos(b) * (R0 - 26), cy + Math.sin(b) * (R0 - 26), cx + Math.cos(b) * (R0 - 14), cy + Math.sin(b) * (R0 - 14), 4, INK); }
        K.rot(x, cx, cy, a, () => { poly(x, [[cx, cy - R0 + 24], [cx + 26, cy], [cx - 26, cy]], '#e5484d'); poly(x, [[cx, cy + R0 - 24], [cx + 26, cy], [cx - 26, cy]], '#5d6772'); circle(x, cx, cy, 10, INK); });
        T(x, 'N', cx, cy - R0 - 34, 44, INK);
      });
    }) },
    'mk-legend': { d: (x, c) => stage(x, c, 9, (w, h) => {
      const t = c.t, X0 = c.land ? 1180 : 80, Y0 = c.land ? 120 : 980, lw = c.land ? 440 : 840, rows: [string, string, number][] = [[c.s(0, '捷運站'), '#2f6db5', 0], [c.s(1, '學校'), '#f2b705', 1], [c.s(2, '公園'), '#3aa04a', 2], [c.s(3, '本案'), '#e5484d', 3]];
      const lh = c.land ? 130 : 100, ch = 110 + rows.length * lh * (c.land ? 1 : 0.5) + (c.land ? 0 : 20), q = ease(seg(t, 0, 0.5));
      fade(x, q, () => { box(x, X0 + 10, Y0 + 14, lw, ch, 24, alpha(INK, 0.3)); box(x, X0, Y0 + (1 - q) * 30, lw, ch * ease(seg(t, 0, 0.6)), 24, WHITE); T(x, c.title('圖例'), X0 + 40, Y0 + 60, 44, INK, 'left', 900); });
      rows.forEach(([n, col, k], i) => {
        const cl = c.land ? 1 : 2, rx = X0 + 40 + (i % cl) * (lw / 2), ry = Y0 + 140 + Math.floor(i / cl) * lh * (c.land ? 1 : 1), qq = back(seg(t, 0.4 + i * 0.2, 0.8 + i * 0.2));
        pop(x, rx + 36, ry, qq, () => { circle(x, rx + 36, ry, 36, col); if (k === 0) train(x, rx + 36, ry, 20, WHITE); else if (k === 1) star(x, rx + 36, ry, 22, WHITE, 5, 0.45); else if (k === 2) tree(x, rx + 36, ry + 22, 40, WHITE); else heart(x, rx + 36, ry - 4, 26, WHITE); });
        fade(x, qq, () => T(x, n, rx + 96, ry + 2, 42, INK, 'left', 900));
      });
    }) },
    'mk-icons': { d: (x, c) => stage(x, c, 11, (w, h) => {
      const t = c.t, P: [number, number, number, string][] = c.land ? [[300, 300, 0, '捷運'], [700, 620, 1, '國小'], [1000, 250, 2, '公園'], [1350, 560, 3, '醫院'], [560, 420, 4, '市場']] : [[240, 380, 0, '捷運'], [700, 520, 1, '國小'], [320, 860, 2, '公園'], [760, 1050, 3, '醫院'], [460, 1250, 4, '市場']];
      const cols = ['#2f6db5', '#f2b705', '#3aa04a', '#e5484d', '#ff8c42'];
      P.forEach(([px, py, k, n], i) => {
        const q = back(seg(t, 0.3 + i * 0.3, 0.7 + i * 0.3)), by = py - 20 * Math.max(0, Math.sin((t - i) * 3)) * seg(t, 1.8, 2.2);
        pop(x, px, by, q, () => {
          box(x, px - 60, by - 70, 120, 120, 30, cols[k]); poly(x, [[px - 20, by + 48], [px + 20, by + 48], [px, by + 76]], cols[k]);
          if (k === 0) train(x, px, by - 10, 34, WHITE); else if (k === 1) house(x, px, by + 20, 70, WHITE, INK); else if (k === 2) tree(x, px, by + 34, 76, WHITE); else if (k === 3) { box(x, px - 12, by - 44, 24, 68, 4, WHITE); box(x, px - 34, by - 22, 68, 24, 4, WHITE); } else { box(x, px - 36, by - 30, 72, 50, 6, WHITE); poly(x, [[px - 44, by - 30], [px + 44, by - 30], [px + 32, by - 50], [px - 32, by - 50]], INK); }
        });
        fade(x, seg(t, 0.6 + i * 0.3, 0.9 + i * 0.3), () => pill(x, c.s(i, n), px, py + 110, 32, INK, WHITE));
      });
    }) },
    'mk-ruler': { d: (x, c) => stage(x, c, 13, (w, h) => {
      const t = c.t, A: [number, number] = c.land ? [300, 700] : [220, 1250], B: [number, number] = c.land ? [1350, 260] : [760, 380];
      pop(x, A[0], A[1], back(seg(t, 0, 0.4)), () => { circle(x, A[0], A[1], 50, INK); house(x, A[0], A[1] + 22, 56, WHITE, c.ac); });
      pop(x, B[0], B[1], back(seg(t, 0.2, 0.6)), () => { circle(x, B[0], B[1], 50, '#2f6db5'); train(x, B[0], B[1], 26, WHITE); });
      const p = ease(seg(t, 0.6, 2.0)), ex = lerp(A[0], B[0], p), ey = lerp(A[1], B[1], p), ang = Math.atan2(B[1] - A[1], B[0] - A[0]), L = Math.hypot(B[0] - A[0], B[1] - A[1]);
      K.rot(x, A[0], A[1], ang, () => {
        box(x, A[0] + 56, A[1] - 26, (L - 112) * p, 52, 8, '#ffd23f'); for (let i = 0; i < 40; i++) { const xx = A[0] + 56 + i * (L - 112) / 40; if (xx > A[0] + 56 + (L - 112) * p) break; line(x, xx, A[1] - 26, xx, A[1] - 26 + (i % 5 ? 14 : 26), 3, INK); }
      });
      const km = +c.v(0, '0.8'), mx = (A[0] + ex) / 2, my = (A[1] + ey) / 2;
      fade(x, seg(t, 0.8, 1.1), () => pill(x, cnt(`直線 ${km} km`, p), mx + 30, my - 80, 40, INK, WHITE));
      fade(x, seg(t, 2.0, 2.4), () => pill(x, c.title('到捷運站 走路 10 分'), w / 2, c.land ? 90 : 130, 44, c.ac, WHITE));
    }) },
  };
  return R;
};
