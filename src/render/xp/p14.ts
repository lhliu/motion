// 第 14 包：數字統計字卡（10）。X、Threads 資訊圖常見的大數字樣式；數字皆示意。
import type { XC, XFx, XK } from './kit';

export const xp14 = (K: XK) => {
  const { ease, inout, back, seg, box, circle, ring, line, T, pop, fade, pill, alpha, INK, WHITE, cnt, person, star, poly, stroke, partial, arrowHead, lerp, house, demo } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const GRN = '#3aa04a', RED = '#e5484d';
  const cap = (x: X, c: XC, w: number, h: number, y: number, s: string, d = 0.9) => fade(x, seg(c.t, d, d + 0.4), () => T(x, s, w / 2, y, c.land ? 54 : 50, alpha(c.fg, 0.8), 'center', 900, w - 120));
  const R: Record<string, XFx> = {
    'st-big': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, v = c.v(0, '12,480'), cy = h * 0.46, q = ease(seg(t, 0.2, 1.6)), sc = back(seg(t, 0, 0.4));
      fade(x, seg(t, 0, 0.3), () => T(x, c.title('今年雙北成交'), w / 2, cy - (c.land ? 220 : 260), 56, c.ac2, 'center', 900));
      pop(x, w / 2, cy, sc * (1 + 0.04 * Math.sin(Math.PI * seg(t, 1.6, 1.9))), () => T(x, cnt(v, q), w / 2, cy, c.land ? 300 : 230, c.fg, 'center', 900, w - 80));
      box(x, w / 2 - 300 * ease(seg(t, 1.6, 2.0)), cy + (c.land ? 150 : 130), 600 * ease(seg(t, 1.6, 2.0)), 14, 7, c.ac);
      cap(x, c, w, h, cy + (c.land ? 240 : 230), c.sub('筆 · 比去年多 1,820 筆'), 1.8); demo(x, w, h, alpha(c.fg, 0.4));
    }) },
    'st-ring': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, v = +c.v(0, '68'), cx = w / 2, cy = h * 0.44, R0 = c.land ? 280 : 320, q = ease(seg(t, 0.3, 2.0));
      ring(x, cx, cy, R0, 60, alpha(c.fg, 0.12)); ring(x, cx, cy, R0, 60, c.ac, -Math.PI / 2, v / 100 * q);
      const a = -Math.PI / 2 + K.TAU * v / 100 * q; circle(x, cx + Math.cos(a) * R0, cy + Math.sin(a) * R0, 40, c.ac2);
      T(x, `${Math.round(v * q)}%`, cx, cy + 10, c.land ? 170 : 180, c.fg);
      cap(x, c, w, h, cy + R0 + 120, c.title('首購族買在捷運站 1 公里內'), 1.8);
    }) },
    'st-rank': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, n = c.v(0, '1'), cx = w / 2, cy = h * 0.42, q = back(seg(t, 0.2, 0.8)), spin = (1 - ease(seg(t, 0.2, 1.2))) * K.TAU;
      pop(x, cx, cy, q, () => K.rot(x, cx, cy, spin, () => {
        for (let i = 0; i < 16; i++) { const a = i / 16 * K.TAU; poly(x, [[cx + Math.cos(a - 0.12) * 230, cy + Math.sin(a - 0.12) * 230], [cx + Math.cos(a) * 280, cy + Math.sin(a) * 280], [cx + Math.cos(a + 0.12) * 230, cy + Math.sin(a + 0.12) * 230]], c.ac2); }
        circle(x, cx, cy, 240, c.ac2); circle(x, cx, cy, 200, '#f2b705'); ring(x, cx, cy, 180, 8, alpha(WHITE, 0.6));
        T(x, 'NO.', cx, cy - 90, 50, INK); T(x, n, cx, cy + 40, 200, INK);
      }));
      poly(x, [[cx - 140, cy + 200], [cx - 60, cy + 200], [cx - 90, cy + 400], [cx - 130, cy + 360], [cx - 180, cy + 380]], RED);
      poly(x, [[cx + 140, cy + 200], [cx + 60, cy + 200], [cx + 90, cy + 400], [cx + 130, cy + 360], [cx + 180, cy + 380]], RED);
      for (let i = 0; i < 6; i++) { const r = seg(t, 1.0 + i * 0.1, 1.8 + i * 0.1); if (r > 0 && r < 1) star(x, cx + Math.cos(i) * 360 * r, cy + Math.sin(i * 2) * 300 * r, 26 * (1 - r), WHITE); }
      cap(x, c, w, h, cy + (c.land ? 330 : 480), c.title('全台最會漲的行政區'), 1.2);
    }) },
    'st-yoy': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, raw = c.v(0, '+12.4').trim().replace(/[−–]/g, '-'), up = (parseFloat(raw.replace(/[^\d.-]/g, '')) || 0) >= 0, v = (up ? '+' : '-') + raw.replace(/^[+-]\s*/, ''), col = up ? RED : GRN, cy = h * 0.45;
      T(x, c.title('比去年'), w / 2, cy - (c.land ? 230 : 280), 60, alpha(c.fg, 0.7));
      const q = ease(seg(t, 0.3, 1.6)), ay = cy - (c.land ? 60 : 40), ax = w / 2 - (c.land ? 420 : 300);
      pop(x, ax, ay, back(seg(t, 0.2, 0.6)), () => { circle(x, ax, ay, 110, col); K.rot(x, ax, ay, up ? 0 : Math.PI, () => { poly(x, [[ax, ay - 70], [ax + 60, ay], [ax + 22, ay], [ax + 22, ay + 64], [ax - 22, ay + 64], [ax - 22, ay], [ax - 60, ay]], WHITE); }); });
      T(x, cnt(v + '%', q), ax + 160, ay + 10, c.land ? 220 : 170, col, 'left', 900);
      // 迷你走勢
      const pts: [number, number][] = Array.from({ length: 9 }, (_, i) => [w / 2 - 340 + i * 85, cy + (c.land ? 200 : 260) - (up ? i : 8 - i) * 14 - Math.sin(i * 1.7) * 18]);
      stroke(x, partial(pts, ease(seg(t, 1.0, 2.0))), 10, col);
      cap(x, c, w, h, cy + (c.land ? 320 : 400), c.sub('新北市住宅均價（示意）'), 1.6);
    }) },
    'st-unit': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, ping = +c.v(0, '30'), m2 = ping * 3.3058, sw = inout(seg(t, 1.2, 2.0)), cy = h * 0.42;
      const flip = (cy0: number, val: string, unit: string, col: string, k: number) => { const sy = Math.abs(Math.cos(k * Math.PI)); x.save(); x.translate(w / 2, cy0); x.scale(1, Math.max(0.02, sy)); x.translate(-w / 2, -cy0); box(x, w / 2 - (c.land ? 520 : 420), cy0 - 170, c.land ? 1040 : 840, 340, 40, col); T(x, val, w / 2 - 40, cy0 + 10, c.land ? 200 : 160, WHITE, 'right', 900); T(x, unit, w / 2 + 10, cy0 + 30, 90, WHITE, 'left', 900); x.restore(); };
      if (sw < 0.5) flip(cy, String(ping), '坪', c.ac, sw); else flip(cy, m2.toFixed(1), 'm²', '#2f6db5', sw);
      fade(x, seg(t, 0.2, 0.5), () => T(x, c.title('換算一下'), w / 2, cy - (c.land ? 260 : 300), 56, c.ac2));
      cap(x, c, w, h, cy + (c.land ? 260 : 300), '1 坪 ≈ 3.3058 m²', 2.0);
    }) },
    'st-thermo': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, v = +c.v(0, '82'), cx = c.land ? w * 0.36 : w / 2, top = c.land ? 140 : 220, bot = c.land ? 760 : 1060, q = ease(seg(t, 0.3, 2.2)) * v / 100 + Math.sin(t * 6) * 0.004 * seg(t, 2.2, 2.4);
      box(x, cx - 50, top, 100, bot - top, 50, alpha(c.fg, 0.12)); circle(x, cx, bot + 40, 90, alpha(c.fg, 0.12));
      const col = q > 0.7 ? RED : q > 0.4 ? '#f2b705' : GRN; circle(x, cx, bot + 40, 66, col); box(x, cx - 28, lerp(bot, top + 30, q), 56, bot - lerp(bot, top + 30, q) + 40, 28, col);
      for (let i = 0; i <= 10; i++) { const y = lerp(bot, top + 30, i / 10); line(x, cx + 60, y, cx + (i % 5 ? 84 : 104), y, 5, alpha(c.fg, 0.5)); }
      const tx = c.land ? w * 0.56 : w / 2, ty = c.land ? h * 0.42 : bot + 230;
      T(x, `${Math.round(q * 100)}°`, tx, ty, c.land ? 200 : 150, col, c.land ? 'left' : 'center', 900);
      T(x, c.title('購屋熱度指數'), tx, ty + (c.land ? 140 : 120), 56, c.fg, c.land ? 'left' : 'center', 900);
      fade(x, seg(t, 2.2, 2.6), () => pill(x, q > 0.7 ? '過熱' : '溫和', c.land ? tx + 30 : tx, ty + (c.land ? 240 : 210), 44, col, WHITE, c.land ? 'left' : 'center'));
    }) },
    'st-icons': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, k = +c.v(0, '3'), n = 10, cols = c.land ? 10 : 5, sz = c.land ? 130 : 160, gx = (w - cols * sz) / 2 + sz / 2, gy = c.land ? 380 : 480;
      fade(x, seg(t, 0, 0.3), () => T(x, c.title(`每 10 位年輕人，有 ${k} 位買得起`), w / 2, c.land ? 170 : 240, 60, c.fg, 'center', 900, w - 100));
      for (let i = 0; i < n; i++) { const px = gx + (i % cols) * sz, py = gy + Math.floor(i / cols) * (sz * 1.5), q = back(seg(t, 0.3 + i * 0.08, 0.6 + i * 0.08)), on = i < k && t > 1.4 + i * 0.15; pop(x, px, py + sz * 0.6, q, () => person(x, px, py + sz * 0.6, sz * 0.9, on ? c.ac : alpha(c.fg, 0.25), on ? '#f2c9a0' : alpha(c.fg, 0.35), on ? INK : alpha(c.fg, 0.35))); }
      cap(x, c, w, h, c.land ? 830 : 1240, c.sub('房價所得比 15 倍以上（示意）'), 2.2);
    }) },
    'st-vs': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, V = !c.land, a = c.v(0, '58'), b = c.v(1, '105'), na = c.s(0, '萬華'), nb = c.s(1, '大安');
      const P = (i: number) => (V ? [w / 2, i ? h * 0.66 : h * 0.28] : [i ? w * 0.75 : w * 0.25, h * 0.5]) as [number, number];
      [[a, na, '#2f6db5'], [b, nb, c.ac]].forEach(([v, n, col], i) => { const [px, py] = P(i), q = back(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3)); pop(x, px, py, q, () => { box(x, px - (V ? 400 : 360), py - 200, V ? 800 : 720, 400, 40, col); T(x, n, px, py - 110, 60, WHITE); T(x, cnt(v, ease(seg(t, 0.4 + i * 0.3, 1.4 + i * 0.3))), px, py + 40, 180, WHITE); T(x, '萬/坪', px, py + 150, 40, alpha(WHITE, 0.85), 'center', 700); }); });
      const q = back(seg(t, 1.0, 1.4)); pop(x, w / 2, h / 2, q, () => { circle(x, w / 2, h / 2, 90, c.ac2); T(x, 'VS', w / 2, h / 2 + 6, 80, INK); });
      fade(x, seg(t, 1.8, 2.2), () => pill(x, c.title('差了 1.8 倍'), w / 2, h - 110, 46, WHITE, INK));
    }) },
    'st-fraction': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, n = +c.v(0, '8'), cols = 4, sz = c.land ? 150 : 190, X0 = c.land ? 160 : (w - cols * sz) / 2, Y0 = c.land ? 260 : 360;
      fade(x, seg(t, 0, 0.3), () => T(x, c.title(`每 ${n} 戶，就有 1 戶空著`), c.land ? 160 : w / 2, c.land ? 150 : 220, 64, c.fg, c.land ? 'left' : 'center', 900, w - 120));
      for (let i = 0; i < n; i++) { const px = X0 + (i % cols) * sz + sz / 2, py = Y0 + Math.floor(i / cols) * sz + sz / 2, q = back(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1)), empty = i === n - 3 && t > 1.6; pop(x, px, py, q * (empty ? 1 + 0.1 * Math.sin(t * 6) : 1), () => house(x, px, py + sz * 0.35, sz * 0.8, empty ? alpha(c.fg, 0.12) : '#f3efe6', empty ? alpha(c.fg, 0.3) : c.ac)); if (empty) fade(x, seg(t, 1.6, 1.9), () => T(x, '空', px, py + 10, 50, c.ac2)); }
      const tx = c.land ? 1260 : w / 2, ty = c.land ? 480 : 1180;
      fade(x, seg(t, 1.8, 2.2), () => { T(x, cnt(`${(100 / n).toFixed(1)}%`, ease(seg(t, 1.8, 2.6))), tx, ty, 160, c.ac2, 'center', 900); T(x, c.sub('全台低度使用住宅（示意）'), tx, ty + 120, 40, alpha(c.fg, 0.7), 'center', 700, c.land ? 560 : w - 120); });
    }) },
    'st-spark': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cw = c.land ? 1300 : 880, ch = c.land ? 640 : 900, X0 = (w - cw) / 2, Y0 = (h - ch) / 2, q = back(seg(t, 0, 0.5));
      pop(x, w / 2, h / 2, q, () => {
        box(x, X0, Y0, cw, ch, 40, alpha(c.fg, 0.06)); box(x, X0, Y0, 14, ch, 7, c.ac);
        T(x, c.title('台北市住宅均價'), X0 + 60, Y0 + 90, 52, alpha(c.fg, 0.8), 'left', 900);
        T(x, cnt(c.v(0, '78.6'), ease(seg(t, 0.4, 1.6))), X0 + 60, Y0 + 260, 200, c.fg, 'left', 900);
        T(x, '萬/坪', X0 + 60 + K.tw(x, c.v(0, '78.6'), 200) + 20, Y0 + 290, 50, alpha(c.fg, 0.7), 'left', 700);
        const vals = [60, 62, 61, 65, 68, 67, 71, 74, 73, 78.6], L = X0 + 60, R0 = X0 + cw - 60, B = Y0 + ch - 70, Tp = Y0 + (c.land ? 380 : 480);
        const pts = vals.map((v, i) => [lerp(L, R0, i / (vals.length - 1)), lerp(B, Tp, (v - 58) / 22)] as [number, number]), p = ease(seg(t, 0.8, 2.4));
        const pp = partial(pts, p); x.beginPath(); pp.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.lineTo(pp[pp.length - 1][0], B); x.lineTo(L, B); x.closePath(); x.fillStyle = alpha(c.ac, 0.18); x.fill();
        stroke(x, pp, 10, c.ac); const [hx, hy] = pp[pp.length - 1]; circle(x, hx, hy, 16, c.ac2);
        fade(x, seg(t, 2.3, 2.6), () => pill(x, '+31% / 10 年', R0, Tp - 50, 36, RED, WHITE, 'right'));
      });
      void arrowHead;
    }) },
  };
  return R;
};
