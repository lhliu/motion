// 第 8 包：前後對比（8）。用平塗插畫示意「之前／之後」場景，可直接換成自己的照片思路。
import type { XC, XFx, XK } from './kit';

export const xp08 = (K: XK) => {
  const { ease, inout, back, seg, box, circle, ring, line, T, pop, fade, clip, pill, alpha, INK, WHITE, cnt, poly, house, tree, tower, lerp, shade, rng, car, stroke } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  // 室內：舊（壁癌、裂縫、舊燈）/新（白牆、木地板、植物）
  const room = (x: X, X0: number, Y0: number, w: number, h: number, nw: boolean) => {
    box(x, X0, Y0, w, h * 0.72, 0, nw ? '#f4efe6' : '#c9bfa8'); box(x, X0, Y0 + h * 0.72, w, h * 0.28, 0, nw ? '#c8935a' : '#8d8577');
    if (nw) { for (let i = 0; i < 8; i++) line(x, X0 + i * w / 8, Y0 + h * 0.72, X0 + i * w / 8 - 30, Y0 + h, 3, shade('#c8935a', -0.15)); }
    else { const r = rng(7); for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(80,90,60,.35)'; x.beginPath(); x.ellipse(X0 + r() * w, Y0 + h * (0.1 + r() * 0.5), 40 + r() * 70, 30 + r() * 40, 0, 0, K.TAU); x.fill(); } stroke(x, [[X0 + w * 0.62, Y0 + h * 0.05], [X0 + w * 0.58, Y0 + h * 0.2], [X0 + w * 0.65, Y0 + h * 0.32], [X0 + w * 0.6, Y0 + h * 0.5]], 6, '#4a4237'); }
    const wx = X0 + w * 0.12, wy = Y0 + h * 0.14, ww = w * 0.34, wh = h * 0.34;
    box(x, wx - 12, wy - 12, ww + 24, wh + 24, 8, nw ? WHITE : '#7a705f'); box(x, wx, wy, ww, wh, 4, nw ? '#9fd3f0' : '#8a9aa3'); line(x, wx + ww / 2, wy, wx + ww / 2, wy + wh, 8, nw ? WHITE : '#7a705f');
    if (nw) { box(x, X0 + w * 0.55, Y0 + h * 0.52, w * 0.36, h * 0.2, 24, '#5c6bc0'); box(x, X0 + w * 0.55, Y0 + h * 0.46, w * 0.36, h * 0.1, 20, '#7986cb'); tree(x, X0 + w * 0.08, Y0 + h * 0.86, h * 0.36, '#3aa04a'); circle(x, X0 + w * 0.72, Y0 + h * 0.08, 26, '#ffd23f'); }
    else { box(x, X0 + w * 0.58, Y0 + h * 0.56, w * 0.3, h * 0.16, 6, '#6b5b45'); line(x, X0 + w * 0.72, Y0, X0 + w * 0.72, Y0 + h * 0.1, 4, INK); circle(x, X0 + w * 0.72, Y0 + h * 0.12, 18, '#d9c98a'); }
  };
  // 地圖：重劃前（農地、小路）/後（棋盤路網、建物）
  const area = (x: X, X0: number, Y0: number, w: number, h: number, nw: boolean) => {
    box(x, X0, Y0, w, h, 0, nw ? '#e9e4da' : '#b9d98f');
    const r = rng(3);
    if (!nw) { for (let i = 0; i < 9; i++) for (let k = 0; k < 7; k++) box(x, X0 + i * w / 9 + 6, Y0 + k * h / 7 + 6, w / 9 - 12, h / 7 - 12, 6, ['#a8cf7a', '#c6e09a', '#9cc46a'][Math.floor(r() * 3)]); stroke(x, [[X0, Y0 + h * 0.6], [X0 + w * 0.3, Y0 + h * 0.5], [X0 + w * 0.6, Y0 + h * 0.65], [X0 + w, Y0 + h * 0.55]], 18, '#d8c7a0'); stroke(x, [[X0 + w * 0.2, Y0 + h * 0.35], [X0 + w * 0.8, Y0 + h * 0.2]], 30, '#5bc0eb'); for (let i = 0; i < 4; i++) house(x, X0 + w * (0.15 + r() * 0.7), Y0 + h * (0.2 + r() * 0.6), 70, '#f3efe6', '#d64541'); }
    else { const gx = 4, gy = 3; for (let i = 0; i < gx; i++) for (let k = 0; k < gy; k++) { const bx = X0 + i * w / gx + 30, by = Y0 + k * h / gy + 30, bw = w / gx - 60, bh = h / gy - 60; box(x, bx, by, bw, bh, 10, (i + k) % 3 === 0 ? '#bfe3c0' : '#fbf7ef'); if ((i + k) % 3) for (let j = 0; j < 3; j++) tower(x, bx + 20 + j * bw / 3, by + bh - 10, bw / 4, bh * (0.5 + r() * 0.4), ['#ff8c42', '#5bc0eb', '#f6a5c0'][j], '#2a3240'); else tree(x, bx + bw / 2, by + bh * 0.8, bh * 0.6); }
      for (let i = 1; i < gx; i++) box(x, X0 + i * w / gx - 14, Y0, 28, h, 0, '#ffd23f'); for (let k = 1; k < gy; k++) box(x, X0, Y0 + k * h / gy - 14, w, 28, 0, '#ffd23f'); }
  };
  const tag = (x: X, s: string, X0: number, Y: number, col: string, al: 'left' | 'right' = 'left') => pill(x, s, X0, Y, 40, col, WHITE, al);
  const frame = (c: XC, w: number, h: number) => (c.land ? { X0: 90, Y0: 120, fw: w - 180, fh: h - 200 } : { X0: 60, Y0: 260, fw: w - 120, fh: 1000 });
  const R: Record<string, XFx> = {
    'ba-slider': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, { X0, Y0, fw, fh } = frame(c, w, h);
      T(x, c.title('翻修前後'), X0, Y0 - 50, 60, c.fg, 'left', 900);
      const k = 0.5 + 0.38 * Math.sin(inout(seg(t, 0.3, 3.6)) * Math.PI * 2), sx = X0 + fw * k;
      clip(x, () => x.rect(X0, Y0, fw, fh), () => { room(x, X0, Y0, fw, fh, true); });
      clip(x, () => x.rect(X0, Y0, sx - X0, fh), () => room(x, X0, Y0, fw, fh, false));
      line(x, sx, Y0, sx, Y0 + fh, 8, WHITE); circle(x, sx, Y0 + fh / 2, 46, WHITE);
      poly(x, [[sx - 34, Y0 + fh / 2], [sx - 12, Y0 + fh / 2 - 16], [sx - 12, Y0 + fh / 2 + 16]], INK); poly(x, [[sx + 34, Y0 + fh / 2], [sx + 12, Y0 + fh / 2 - 16], [sx + 12, Y0 + fh / 2 + 16]], INK);
      tag(x, c.s(0, '之前'), X0 + 24, Y0 + 50, '#5d6772'); tag(x, c.s(1, '之後'), X0 + fw - 24, Y0 + 50, c.ac, 'right');
    }) },
    'ba-replot': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, { X0, Y0, fw, fh } = frame(c, w, h), p = inout(seg(t, 0.8, 2.6));
      T(x, c.title('重劃前 → 重劃後'), X0, Y0 - 50, 60, c.fg, 'left', 900);
      clip(x, () => x.rect(X0, Y0, fw, fh), () => { area(x, X0, Y0, fw, fh, false);
        // 圓形擴散揭露新路網
        clip(x, () => { x.arc(X0 + fw / 2, Y0 + fh / 2, Math.hypot(fw, fh) * 0.6 * p, 0, K.TAU); }, () => area(x, X0, Y0, fw, fh, true)); });
      ring(x, X0 + fw / 2, Y0 + fh / 2, Math.hypot(fw, fh) * 0.6 * p, 10, alpha(WHITE, 0.8 * (1 - p)));
      tag(x, p < 0.5 ? c.s(0, '2015 重劃前') : c.s(1, '2026 重劃後'), X0 + 24, Y0 + 50, p < 0.5 ? '#3aa04a' : c.ac);
    }) },
    'ba-repair': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, V = !c.land, gap = 30, fw = V ? w - 120 : (w - 180 - gap) / 2, fh = V ? 560 : 620, X0 = V ? 60 : 90, Y0 = V ? 230 : 180;
      T(x, c.title('屋況修繕前後'), X0, Y0 - 60, 60, c.fg, 'left', 900);
      const q1 = ease(seg(t, 0.2, 0.7)), q2 = ease(seg(t, 0.9, 1.5));
      const b2x = V ? X0 : X0 + fw + gap, b2y = V ? Y0 + fh + gap : Y0;
      fade(x, q1, () => { clip(x, () => x.rect(X0, Y0 + (1 - q1) * 40, fw, fh), () => room(x, X0, Y0 + (1 - q1) * 40, fw, fh, false)); tag(x, c.s(0, '修繕前：壁癌、裂縫'), X0 + 20, Y0 + 50, '#5d6772'); });
      fade(x, q2, () => { clip(x, () => x.rect(b2x, b2y + (1 - q2) * 40, fw, fh), () => room(x, b2x, b2y + (1 - q2) * 40, fw, fh, true)); tag(x, c.s(1, '修繕後'), b2x + 20, b2y + 50, c.ac); });
      const bq = back(seg(t, 1.8, 2.2)); pop(x, b2x + fw - 120, b2y + fh - 90, bq, () => { circle(x, b2x + fw - 120, b2y + fh - 90, 80, c.ac2); T(x, c.v(0, '28 萬'), b2x + fw - 120, b2y + fh - 100, 44, INK); T(x, '花費', b2x + fw - 120, b2y + fh - 56, 28, INK, 'center', 700); });
    }) },
    'ba-price': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, a = +c.v(0, '52.3'), b = +c.v(1, '78.6'), cx = w / 2, by = c.land ? 780 : 1200, mx = Math.max(a, b), H0 = c.land ? 480 : 700, bw = c.land ? 300 : 260, d = c.land ? 260 : 200;
      T(x, c.title('同一社區 5 年前 vs 現在'), 80, 110, 60, c.fg, 'left', 900, w - 160);
      fade(x, seg(t, 0.2, 0.5), () => T(x, c.sub('單價 萬/坪（示意）'), 80, 180, 36, alpha(c.fg, 0.55), 'left', 700));
      [[a, c.s(0, '2021'), '#5d6772', -1], [b, c.s(1, '2026'), c.ac, 1]].forEach(([v, n, col, sd], i) => {
        const q = ease(seg(t, 0.4 + i * 0.6, 1.4 + i * 0.6)), hh = H0 * (v as number) / mx * q, X1 = cx + (sd as number) * d - bw / 2;
        box(x, X1, by - hh, bw, hh, 20, col as string); T(x, cnt(String(v), q), X1 + bw / 2, by - hh - 50, 70, c.fg); T(x, n as string, X1 + bw / 2, by + 60, 50, alpha(c.fg, 0.7), 'center', 900);
      });
      line(x, 80, by, w - 80, by, 6, alpha(c.fg, 0.3));
      const pc = Math.round((b / a - 1) * 100), q = back(seg(t, 2.2, 2.6));
      pop(x, cx, c.land ? 260 : 320, q, () => pill(x, `+${pc}%`, cx, c.land ? 260 : 320, 64, '#e5484d', WHITE));
      fade(x, seg(t, 2.0, 2.4), () => stroke(x, [[cx - d, by - H0 * a / mx - 110], [cx, by - H0 * b / mx - 150], [cx + d - 40, by - H0 * b / mx - 110]], 6, alpha(c.fg, 0.4), [8, 12]));
    }) },
    'ba-flip': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, { X0, Y0, fw, fh } = frame(c, w, h), cx = X0 + fw / 2, cy = Y0 + fh / 2;
      T(x, c.title('翻牌看結果'), X0, Y0 - 50, 60, c.fg, 'left', 900);
      const p = inout(seg(t, 1.0, 1.8)), sx = Math.abs(Math.cos(p * Math.PI)), nw = p > 0.5;
      x.save(); x.translate(cx, cy); x.scale(Math.max(0.01, sx), 1); x.translate(-cx, -cy);
      box(x, X0 + 10, Y0 + 20, fw, fh, 30, alpha(INK, 0.35));
      clip(x, () => { x.roundRect(X0, Y0, fw, fh, 30); }, () => room(x, X0, Y0, fw, fh, nw));
      tag(x, nw ? c.s(1, '之後') : c.s(0, '之前'), X0 + 24, Y0 + 50, nw ? c.ac : '#5d6772');
      x.restore();
      fade(x, seg(t, 1.9, 2.3), () => pill(x, c.sub('一樣的空間，換個樣子'), cx, Y0 + fh + 60, 40, c.ac2, INK));
    }) },
    'ba-split': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, { X0, Y0, fw, fh } = frame(c, w, h), p = inout(seg(t, 0.5, 1.6));
      T(x, c.title('左右分割對照'), X0, Y0 - 50, 60, c.fg, 'left', 900);
      const half = fw / 2;
      clip(x, () => x.rect(X0, Y0, half * p, fh), () => area(x, X0, Y0, fw, fh, false));
      clip(x, () => x.rect(X0 + fw - half * p, Y0, half * p, fh), () => area(x, X0, Y0, fw, fh, true));
      box(x, X0 + half - 6, Y0 + fh / 2 - fh / 2 * ease(seg(t, 1.5, 2.0)), 12, fh * ease(seg(t, 1.5, 2.0)), 6, WHITE);
      fade(x, seg(t, 1.6, 2.0), () => { tag(x, c.s(0, '十年前'), X0 + 24, Y0 + 50, '#3aa04a'); tag(x, c.s(1, '現在'), X0 + fw - 24, Y0 + 50, c.ac, 'right'); });
      const q = back(seg(t, 2.0, 2.4)); pop(x, X0 + half, Y0 + fh / 2, q, () => { circle(x, X0 + half, Y0 + fh / 2, 60, INK); T(x, 'VS', X0 + half, Y0 + fh / 2 + 4, 50, c.ac2); });
    }) },
    'ba-ghost': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, { X0, Y0, fw, fh } = frame(c, w, h), p = inout(seg(t, 0.8, 2.6));
      T(x, c.title('疊影淡入：同一角度'), X0, Y0 - 50, 60, c.fg, 'left', 900);
      clip(x, () => x.rect(X0, Y0, fw, fh), () => { room(x, X0, Y0, fw, fh, false); fade(x, p, () => room(x, X0, Y0, fw, fh, true)); });
      box(x, X0 + 30, Y0 + fh - 60, fw - 60, 14, 7, alpha(WHITE, 0.4)); box(x, X0 + 30, Y0 + fh - 60, (fw - 60) * p, 14, 7, c.ac2);
      T(x, c.s(0, '2019'), X0 + 30, Y0 + fh - 100, 36, WHITE, 'left'); T(x, c.s(1, '2026'), X0 + fw - 30, Y0 + fh - 100, 36, WHITE, 'right');
    }) },
    'ba-lens': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, { X0, Y0, fw, fh } = frame(c, w, h);
      T(x, c.title('放大鏡看差異'), X0, Y0 - 50, 60, c.fg, 'left', 900);
      clip(x, () => x.rect(X0, Y0, fw, fh), () => area(x, X0, Y0, fw, fh, false));
      const p = inout(seg(t, 0.5, 3.4)), lx = X0 + fw * lerp(0.25, 0.72, p), ly = Y0 + fh * (0.5 + 0.18 * Math.sin(p * Math.PI * 2)), R0 = c.land ? 190 : 210;
      clip(x, () => { x.arc(lx, ly, R0, 0, K.TAU); }, () => { x.save(); x.translate(lx, ly); x.scale(1.25, 1.25); x.translate(-lx, -ly); area(x, X0, Y0, fw, fh, true); x.restore(); });
      ring(x, lx, ly, R0, 20, INK); ring(x, lx, ly, R0 - 12, 6, WHITE);
      line(x, lx + R0 * 0.72, ly + R0 * 0.72, lx + R0 * 1.25, ly + R0 * 1.25, 36, INK);
      pill(x, c.s(0, '現在'), lx, ly - R0 - 40, 36, c.ac, WHITE);
      void car;
    }) },
  };
  return R;
};
