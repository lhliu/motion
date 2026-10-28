// 第 12 包：數據地圖（6）。用台北 12 區「方塊地圖」（tile map）示意位置，不使用行政區界線資料；數值皆示意。
import type { XC, XFx, XK } from './kit';

export const xp12 = (K: XK) => {
  const { ease, inout, back, seg, box, circle, ring, line, T, pop, fade, pill, alpha, INK, WHITE, cnt, lerp, shade, arrowHead, stroke, curve, partial, clamp } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const D: [string, number, number, number][] = [['北投', 1, 0, 62], ['士林', 2, 0, 75], ['大同', 1, 1, 70], ['中山', 2, 1, 85], ['內湖', 3, 1, 72], ['萬華', 0, 2, 58], ['中正', 1, 2, 92], ['大安', 2, 2, 105], ['松山', 3, 2, 95], ['南港', 4, 2, 80], ['文山', 2, 3, 60], ['信義', 3, 3, 98]];
  const lay = (c: XC, w: number, h: number) => { const s = c.land ? 150 : 170, ox = c.land ? 140 : (w - s * 5) / 2, oy = c.land ? 200 : 330; return { s, ox, oy }; };
  const ramp = (v: number, lo = 55, hi = 108) => { const k = clamp((v - lo) / (hi - lo)); const a = [255, 236, 179], b = [230, 81, 0], m = (i: number) => Math.round(a[i] + (b[i] - a[i]) * k); return '#' + [0, 1, 2].map((i) => m(i).toString(16).padStart(2, '0')).join(''); };
  const tile = (x: X, c: XC, w: number, h: number, i: number, col: string, sc = 1, lab = true, val = '') => {
    const { s, ox, oy } = lay(c, w, h), [n, a, b] = D[i], cx = ox + a * s + s / 2, cy = oy + b * s + s / 2;
    pop(x, cx, cy, sc, () => { box(x, cx - s / 2 + 6, cy - s / 2 + 12, s - 12, s - 12, 22, shade(col, -0.3)); box(x, cx - s / 2 + 6, cy - s / 2 + 6, s - 12, s - 12, 22, col); const fc = K.on(col); if (lab) T(x, c.s(i, n), cx, cy - (val ? 18 : 0), 40, fc, 'center', 900); if (val) T(x, val, cx, cy + 30, 34, fc, 'center', 900); });
    return [cx, cy] as [number, number];
  };
  const head = (x: X, c: XC, w: number, a: string, b: string) => { T(x, c.title(a), 80, 100, 60, c.fg, 'left', 900, w - 160); fade(x, seg(c.t, 0.2, 0.5), () => T(x, c.sub(b), 80, 165, 34, alpha(c.fg, 0.55), 'left', 700, w - 160)); };
  const legend = (x: X, c: XC, w: number, h: number) => { const lx = c.land ? 1060 : 120, ly = c.land ? 820 : 1150, lw = c.land ? 520 : 760; for (let i = 0; i < 20; i++) box(x, lx + i * lw / 20, ly, lw / 20 + 1, 30, 0, ramp(55 + i * 2.7)); T(x, '低', lx, ly + 66, 30, alpha(c.fg, 0.6), 'left', 700); T(x, '高', lx + lw, ly + 66, 30, alpha(c.fg, 0.6), 'right', 700); };
  const R: Record<string, XFx> = {
    'md-choro': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t; head(x, c, w, '台北各區單價', '萬/坪 · 方塊地圖示意');
      const order = D.map((d, i) => [d[2] * 5 + d[1], i]).sort((a, b) => a[0] - b[0]);
      order.forEach(([, i], k) => { const q = seg(t, 0.3 + k * 0.12, 0.7 + k * 0.12); tile(x, c, w, h, i, q > 0.5 ? ramp(D[i][3]) : '#3a4252', Math.max(0.001, back(seg(t, 0.1 + k * 0.05, 0.4 + k * 0.05))), true, q > 0.5 ? String(D[i][3]) : ''); });
      fade(x, seg(t, 2.0, 2.4), () => legend(x, c, w, h));
    }) },
    'md-heat': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t; head(x, c, w, '房價熱力圖', '越紅越貴（示意）');
      D.forEach((d, i) => tile(x, c, w, h, i, '#2b3240', 1, false));
      x.save(); x.globalCompositeOperation = 'lighter';
      D.forEach(([, a, b, v], i) => { const { s, ox, oy } = lay(c, w, h), cx = ox + a * s + s / 2, cy = oy + b * s + s / 2, q = ease(seg(t, 0.3 + i * 0.1, 1.3 + i * 0.1)), R0 = s * (0.6 + (v - 55) / 50) * q * (1 + 0.04 * Math.sin(t * 3 + i)); if (R0 <= 0) return; const g = x.createRadialGradient(cx, cy, 0, cx, cy, R0); g.addColorStop(0, alpha(v > 90 ? '#ff3b30' : v > 75 ? '#ff9500' : '#ffd23f', 0.75)); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R0, 0, K.TAU); x.fill(); });
      x.restore();
      D.forEach(([n, a, b], i) => { const { s, ox, oy } = lay(c, w, h); fade(x, seg(t, 1.6, 2.0), () => T(x, c.s(i, n), ox + a * s + s / 2, oy + b * s + s / 2, 36, WHITE, 'center', 900)); });
    }) },
    'md-flow': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t; head(x, c, w, '人口往哪裡搬', '遷入箭頭（示意）');
      D.forEach((d, i) => tile(x, c, w, h, i, i === 9 || i === 4 ? alpha(c.ac, 0.85) : '#3a4252', 1, true));
      const { s, ox, oy } = lay(c, w, h), P = (i: number) => [ox + D[i][1] * s + s / 2, oy + D[i][2] * s + s / 2] as [number, number];
      const flows: [number, number, number][] = [[5, 9, 3], [6, 4, 2], [0, 4, 1.5], [10, 9, 2], [2, 4, 1]];
      flows.forEach(([a, b, wt], k) => {
        const A = P(a), B = P(b), M: [number, number] = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - s * 0.9], pts = curve(A, M, B), p = ease(seg(t, 0.4 + k * 0.3, 1.4 + k * 0.3));
        stroke(x, partial(pts, p), 6 + wt * 5, alpha(c.ac2, 0.9));
        if (p > 0.05) { const o = partial(pts, p), [hx, hy] = o[o.length - 1], [px, py] = o[o.length - 2]; arrowHead(x, hx, hy, Math.atan2(hy - py, hx - px), 18 + wt * 5, c.ac2); }
      });
      fade(x, seg(t, 2.4, 2.8), () => pill(x, c.s(12, '東區、內湖科技園區淨遷入最多'), w / 2, c.land ? 870 : 1100, 36, c.ac2, INK));
    }) },
    'md-bubble': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t; head(x, c, w, '各區公告地價', '泡泡越大越貴（示意）');
      D.forEach((d, i) => tile(x, c, w, h, i, '#2b3240', 1, false));
      const { s, ox, oy } = lay(c, w, h);
      D.forEach(([n, a, b, v], i) => { const cx = ox + a * s + s / 2, cy = oy + b * s + s / 2, q = back(seg(t, 0.3 + i * 0.12, 0.8 + i * 0.12)), R0 = s * 0.18 + (v - 55) * s * 0.0062; pop(x, cx, cy, q, () => { circle(x, cx, cy, R0, alpha(v > 90 ? c.ac : '#5bc0eb', 0.9)); T(x, c.s(i, n), cx, cy - (R0 > 50 ? 12 : 0), R0 > 50 ? 34 : 26, WHITE, 'center', 900); if (R0 > 50) T(x, String(v), cx, cy + 24, 28, WHITE, 'center', 700); }); });
      fade(x, seg(t, 2.0, 2.4), () => T(x, c.s(12, '大安區最貴'), c.land ? 1500 : w / 2, c.land ? 500 : 1150, 50, c.ac2, 'center', 900));
    }) },
    'md-time': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, y0 = +c.v(0, '2016'), y1 = +c.v(1, '2026'), p = inout(seg(t, 0.4, 3.2)), yr = Math.round(lerp(y0, y1, p)), gr = lerp(0.72, 1, p);
      head(x, c, w, '十年房價變化', '方塊顏色隨年份變化（示意）');
      D.forEach(([, , , v], i) => tile(x, c, w, h, i, ramp(v * gr), 1, true, String(Math.round(v * gr))));
      const bx = c.land ? 1080 : 120, by = c.land ? 700 : 1180, bw = c.land ? 500 : 760;
      box(x, bx, by - 8, bw, 16, 8, alpha(c.fg, 0.2)); box(x, bx, by - 8, bw * p, 16, 8, c.ac);
      circle(x, bx + bw * p, by, 26, WHITE); T(x, String(yr), bx + bw * p, by - 70, 64, c.ac2, 'center', 900);
      T(x, String(y0), bx, by + 60, 30, alpha(c.fg, 0.6), 'left', 700); T(x, String(y1), bx + bw, by + 60, 30, alpha(c.fg, 0.6), 'right', 700);
      fade(x, seg(t, 3.2, 3.6), () => legend(x, c, w, h));
    }) },
    'md-pick': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, pick = 11; head(x, c, w, '聚焦：信義區', '點一區看細節（示意）');
      const q = ease(seg(t, 0.6, 1.0));
      D.forEach((d, i) => fade(x, i === pick ? 1 : 1 - q * 0.6, () => tile(x, c, w, h, i, i === pick ? c.ac : '#3a4252', i === pick ? 1 + 0.15 * back(seg(t, 0.6, 1.0)) : 1, true)));
      const { s, ox, oy } = lay(c, w, h), cx = ox + D[pick][1] * s + s / 2, cy = oy + D[pick][2] * s + s / 2;
      ring(x, cx, cy, s * 0.6 + (t * 40) % 50, 6, alpha(c.ac, 1 - ((t * 40) % 50) / 50));
      const cw = c.land ? 500 : 760, ch = 360, X0 = c.land ? 1100 : (w - cw) / 2, Y0 = c.land ? 300 : 1000;
      const cq = back(seg(t, 1.1, 1.5));
      line(x, cx + s * 0.4, cy, c.land ? X0 : cx, c.land ? Y0 + 60 : Y0, 4 * cq, alpha(c.fg, 0.4));
      pop(x, X0 + cw / 2, Y0 + ch / 2, cq, () => {
        box(x, X0, Y0, cw, ch, 26, WHITE); T(x, c.s(pick, '信義'), X0 + 40, Y0 + 70, 56, INK, 'left', 900);
        [['單價', `${D[pick][3]} 萬/坪`], ['年增', '+6.2%'], ['成交', '1,284 筆']].forEach(([a, b], i) => { T(x, a, X0 + 40, Y0 + 160 + i * 70, 36, '#5d6772', 'left', 700); T(x, cnt(b, ease(seg(t, 1.4, 2.0))), X0 + cw - 40, Y0 + 160 + i * 70, 44, i === 1 ? '#e5484d' : INK, 'right', 900); });
      });
    }) },
  };
  return R;
};
