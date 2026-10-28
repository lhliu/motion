// 第 5 包：房貸與數字講解（8）。所有金額、利率皆為示意。
import type { XC, XFx, XK } from './kit';

export const xp05 = (K: XK) => {
  const { clamp, ease, inout, back, seg, box, circle, ring, line, T, pop, fade, house, pill, alpha, INK, WHITE, cnt, coin, check, lerp, poly, shade, TAU } = K;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const pmt = (P: number, rate: number, yrs: number) => { const r = rate / 100 / 12, n = yrs * 12; return r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n; };
  const fmt = (v: number) => Math.round(v).toLocaleString('en-US');
  const head = (x: CanvasRenderingContext2D, c: XC, w: number, tt: string, st: string) => { T(x, c.title(tt), 80, 110, 64, c.fg, 'left', 900, w - 160); fade(x, seg(c.t, 0.2, 0.6), () => T(x, c.sub(st), 80, 185, 36, alpha(c.fg, 0.55), 'left', 700, w - 160)); };
  const GRN = '#3aa04a', SKY = '#5bc0eb';
  const R: Record<string, XFx> = {
    'ln-monthly': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, P = +c.v(0, '1000') * 1e4, rt = +c.v(1, '2.2'), y = +c.v(2, '30'), m = pmt(P, rt, y);
      head(x, c, w, '每月要繳多少？', `貸 ${fmt(P / 1e4)} 萬 · ${rt}% · ${y} 年（示意）`);
      const cx = w / 2, cy = c.land ? h * 0.55 : h * 0.47, R0 = c.land ? 300 : 340, p = ease(seg(t, 0.5, 2.4));
      ring(x, cx, cy, R0, 46, alpha(c.fg, 0.12));
      ring(x, cx, cy, R0, 46, c.ac, -Math.PI / 2, p);
      for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + i / 12 * TAU; circle(x, cx + Math.cos(a) * (R0 + 60), cy + Math.sin(a) * (R0 + 60), 8, i / 12 <= p ? c.ac2 : alpha(c.fg, 0.2)); }
      T(x, '月付金', cx, cy - 110, 50, alpha(c.fg, 0.7), 'center', 700);
      T(x, fmt(m * p), cx, cy + 10, c.land ? 150 : 140, c.fg, 'center', 900, R0 * 1.7);
      T(x, '元 / 月', cx, cy + 115, 46, c.ac2, 'center', 900);
      const bq = back(seg(t, 2.5, 2.9));
      pop(x, cx, cy + R0 + (c.land ? 70 : 150), bq, () => pill(x, `總繳 ${fmt(m * y * 12 / 1e4)} 萬`, cx, cy + R0 + (c.land ? 70 : 150), 44, c.ac2, INK));
    }) },
    'ln-rate': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, P = +c.v(0, '1000') * 1e4, a = +c.v(1, '1.8'), b = +c.v(2, '3.0'), y = 30;
      head(x, c, w, '利率升一點，差多少？', `貸 ${fmt(P / 1e4)} 萬 · ${y} 年（示意）`);
      const k = inout(seg(t, 0.6, 2.8)), r = lerp(a, b, k), m = pmt(P, r, y), m0 = pmt(P, a, y);
      const L = 120, Rr = w - 120, sy = c.land ? 420 : 520;
      box(x, L, sy - 12, Rr - L, 24, 12, alpha(c.fg, 0.15)); box(x, L, sy - 12, (Rr - L) * k, 24, 12, c.ac);
      for (let i = 0; i <= 4; i++) { const xx = L + (Rr - L) * i / 4; line(x, xx, sy + 30, xx, sy + 50, 4, alpha(c.fg, 0.4)); T(x, (a + (b - a) * i / 4).toFixed(1) + '%', xx, sy + 90, 34, alpha(c.fg, 0.6), 'center', 700); }
      const hx = L + (Rr - L) * k; circle(x, hx, sy, 46, WHITE); circle(x, hx, sy, 30, c.ac);
      pill(x, r.toFixed(2) + '%', hx, sy - 100, 46, c.ac2, INK);
      const cy = c.land ? 720 : 960;
      T(x, '月付金', w / 2, cy - 130, 46, alpha(c.fg, 0.7), 'center', 700);
      T(x, fmt(m) + ' 元', w / 2, cy, c.land ? 140 : 120, c.fg, 'center', 900, w - 160);
      const d = m - m0; fade(x, seg(t, 0.8, 1.1), () => pill(x, `+${fmt(d)} 元 / 月`, w / 2, cy + 130, 44, '#e5484d', WHITE));
      fade(x, seg(t, 2.9, 3.3), () => T(x, `30 年多繳 ${fmt(d * 360 / 1e4)} 萬`, w / 2, cy + (c.land ? 220 : 260), 52, c.ac2, 'center', 900));
    }) },
    'ln-grace': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, P = 1000e4, rt = +c.v(0, '2.2'), g = +c.v(1, '5'), y = 30;
      const io = P * rt / 1200, after = pmt(P, rt, y - g), normal = pmt(P, rt, y);
      head(x, c, w, '寬限期過後', `前 ${g} 年只繳利息（示意）`);
      const L = 140, Rr = w - 80, B = c.land ? 800 : 1240, top = c.land ? 300 : 420, mx = after * 1.15, sc = (v: number) => (B - top) * v / mx;
      line(x, L, B, Rr, B, 6, alpha(c.fg, 0.4)); line(x, L, top - 20, L, B, 6, alpha(c.fg, 0.4));
      const n = 15, bw = (Rr - L) / n;
      for (let i = 0; i < n; i++) {
        const yr = i * 2, v = yr < g ? io : after, q = ease(seg(t, 0.4 + i * 0.12, 0.8 + i * 0.12)), hh = sc(v) * q;
        box(x, L + i * bw + bw * 0.15, B - hh, bw * 0.7, hh, 8, yr < g ? SKY : c.ac);
      }
      const ny = B - sc(normal); fade(x, seg(t, 2.4, 2.8), () => { line(x, L, ny, Rr, ny, 4, alpha(c.ac2, 0.9)); T(x, `無寬限 ${fmt(normal)}`, Rr, ny - 30, 34, c.ac2, 'right', 900); });
      const gx = L + bw * Math.ceil(g / 2);
      fade(x, seg(t, 1.2, 1.5), () => { pill(x, `只繳利息 ${fmt(io)}`, L + 20, B - sc(io) - 60, 34, SKY, INK, 'left'); });
      fade(x, seg(t, 2.0, 2.4), () => { pill(x, `暴增到 ${fmt(after)}`, gx + 10, B - sc(after) - 50, 38, '#e5484d', WHITE, 'left'); });
      T(x, `第 ${g} 年`, gx, B + 50, 34, alpha(c.fg, 0.7), 'center', 700);
    }) },
    'ln-stack': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, P = 1000e4, rt = +c.v(0, '2.2'), y = 30, m = pmt(P, rt, y), r = rt / 1200;
      head(x, c, w, '每月繳的錢去哪了？', '本金 vs 利息（示意）');
      const L = 120, Rr = w - 80, B = c.land ? 820 : 1260, top = c.land ? 300 : 420, n = 10, bw = (Rr - L) / n;
      for (let i = 0; i < n; i++) {
        const k = i * 36, bal = P * Math.pow(1 + r, k) - m * (Math.pow(1 + r, k) - 1) / r, it = bal * r, q = ease(seg(t, 0.4 + i * 0.12, 0.9 + i * 0.12));
        const H0 = (B - top) * q, hi = H0 * it / m, X0 = L + i * bw + bw * 0.12;
        box(x, X0, B - H0, bw * 0.76, H0 - hi, 6, c.ac2); box(x, X0, B - hi, bw * 0.76, hi, 6, c.ac);
        T(x, `${k / 12 + 1}`, X0 + bw * 0.38, B + 44, 32, alpha(c.fg, 0.6), 'center', 700);
      }
      T(x, '第幾年', Rr, B + 90, 30, alpha(c.fg, 0.5), 'right', 700);
      fade(x, seg(t, 1.8, 2.2), () => { pill(x, '■ 利息', L, top - 60, 36, c.ac, WHITE, 'left'); pill(x, '■ 本金', L + 220, top - 60, 36, c.ac2, INK, 'left'); });
    }) },
    'ln-gauge': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, v = +c.v(0, '42'), cx = w / 2, cy = c.land ? h * 0.66 : h * 0.55, R0 = c.land ? 420 : 400;
      head(x, c, w, '房貸負擔比', '月付金 ÷ 月收入（示意）');
      const zs: [number, number, string][] = [[0, 30, GRN], [30, 40, '#ffd23f'], [40, 60, '#e5484d']];
      zs.forEach(([a, b, col]) => { x.beginPath(); x.arc(cx, cy, R0, Math.PI + a / 60 * Math.PI, Math.PI + b / 60 * Math.PI); x.lineWidth = 70; x.strokeStyle = col; x.stroke(); });
      for (let i = 0; i <= 6; i++) { const a = Math.PI + i / 6 * Math.PI; T(x, `${i * 10}%`, cx + Math.cos(a) * (R0 - 100), cy + Math.sin(a) * (R0 - 100), 32, alpha(c.fg, 0.6), 'center', 700); }
      const p = back(seg(t, 0.4, 2.0)) * Math.min(v, 60) / 60 + Math.sin(t * 9) * 0.004 * seg(t, 2, 2.2), a = Math.PI + p * Math.PI;
      x.save(); x.translate(cx, cy); x.rotate(a); poly(x, [[0, -18], [R0 - 40, 0], [0, 18], [-40, 0]], c.fg); x.restore();
      circle(x, cx, cy, 40, c.fg); circle(x, cx, cy, 18, c.bg);
      T(x, `${Math.round(p * 60)}%`, cx, cy + 120, 110, c.fg, 'center', 900);
      fade(x, seg(t, 2.0, 2.4), () => pill(x, v > 40 ? '偏高 要小心' : v > 30 ? '可以 但吃緊' : '輕鬆', cx, cy + 230, 44, v > 40 ? '#e5484d' : v > 30 ? '#ffd23f' : GRN, v > 30 && v <= 40 ? INK : WHITE));
    }) },
    'ln-income': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, inc = +c.v(0, '80000'), parts = [[c.s(0, '房貸'), +c.v(1, '35'), c.ac], [c.s(1, '生活'), +c.v(2, '40'), SKY], [c.s(2, '儲蓄'), +c.v(3, '25'), GRN]] as [string, number, string][];
      head(x, c, w, '月收入怎麼切？', `月收 ${fmt(inc)} 元（示意）`);
      const cx = c.land ? w * 0.33 : w / 2, cy = c.land ? h * 0.58 : h * 0.43, R0 = c.land ? 300 : 320; let a0 = -Math.PI / 2;
      parts.forEach(([n, pc, col], i) => {
        const q = ease(seg(t, 0.4 + i * 0.4, 1.0 + i * 0.4)), sw = pc / 100 * TAU, mid = a0 + sw / 2, ex = 16 * back(seg(t, 1.0 + i * 0.4, 1.3 + i * 0.4));
        const ox = Math.cos(mid) * ex, oy = Math.sin(mid) * ex;
        if (q > 0) { x.beginPath(); x.moveTo(cx + ox, cy + oy); x.arc(cx + ox, cy + oy, R0, a0, a0 + sw * q); x.closePath(); x.fillStyle = col; x.fill(); }
        fade(x, seg(t, 1.0 + i * 0.4, 1.3 + i * 0.4), () => T(x, `${pc}%`, cx + Math.cos(mid) * R0 * 0.62, cy + Math.sin(mid) * R0 * 0.62, 56, col === SKY ? INK : WHITE));
        const lx = c.land ? w * 0.62 : 140, ly = c.land ? 360 + i * 150 : cy + R0 + 120 + i * 110;
        fade(x, seg(t, 1.0 + i * 0.4, 1.3 + i * 0.4), () => { box(x, lx, ly - 30, 60, 60, 14, col); T(x, n, lx + 90, ly, 54, c.fg, 'left', 900); T(x, fmt(inc * pc / 100) + ' 元', c.land ? w - 100 : w - 140, ly, 54, c.fg, 'right', 900); });
        a0 += sw;
      });
      circle(x, cx, cy, R0 * 0.36, c.bg);
    }) },
    'ln-youth': { bg: 'cream', d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cw = c.land ? 1300 : 880, X0 = (w - cw) / 2, top = c.land ? 90 : 170, ch = c.land ? 770 : 1160, q = back(seg(t, 0, 0.5));
      pop(x, w / 2, top + ch / 2, q, () => {
        box(x, X0, top + 16, cw, ch, 40, shade('#2f6db5', -0.35)); box(x, X0, top, cw, ch, 40, WHITE);
        box(x, X0, top, cw, 170, 40, '#2f6db5'); box(x, X0, top + 130, cw, 40, 0, '#2f6db5');
        house(x, X0 + 110, top + 130, 120, WHITE, '#ffd23f');
        T(x, c.title('新青安 條件卡'), X0 + 210, top + 88, 70, WHITE, 'left', 900, cw - 260);
        const rows = [c.s(0, '本人與配偶、子女名下無自有住宅'), c.s(1, '貸款額度最高 1,000 萬'), c.s(2, '貸款年限最長 40 年'), c.s(3, '寬限期最長 5 年'), c.s(4, '以政府公告為準（示意）')];
        rows.forEach((s, i) => {
          const y = top + 250 + i * ((ch - 300) / rows.length), p = seg(t, 0.6 + i * 0.35, 0.95 + i * 0.35);
          fade(x, seg(t, 0.5 + i * 0.35, 0.8 + i * 0.35), () => {
            circle(x, X0 + 90, y, 38, p > 0 ? GRN : '#d7dce2'); check(x, X0 + 90, y, 46, WHITE, p);
            T(x, s, X0 + 160, y, c.land ? 52 : 44, INK, 'left', 900, cw - 200);
          });
        });
      });
    }) },
    'ln-total': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, P = +c.v(0, '1000'), rt = +c.v(1, '2.2'), y = +c.v(2, '30'), it = pmt(P, rt, y) * y * 12 - P;
      head(x, c, w, '30 年下來多付多少利息？', `貸 ${P} 萬 · ${rt}%（示意）`);
      const cols: [string, number, string][] = [['本金', P, c.ac2], ['利息', it, c.ac]], B = c.land ? 760 : 1180, mx = P;
      cols.forEach(([n, v, col], i) => {
        const cx = w / 2 + (i ? 1 : -1) * (c.land ? 300 : 220), k = Math.round((c.land ? 10 : 14) * v / mx), q = seg(t, 0.4 + i * 0.6, 2.2 + i * 0.6);
        const nk = Math.floor(k * q + 0.001);
        for (let j = 0; j < nk; j++) coin(x, cx + (j % 2 ? 6 : -6), B - j * (c.land ? 36 : 44), c.land ? 90 : 110, col, '$');
        fade(x, seg(t, 0.4 + i * 0.6, 0.7 + i * 0.6), () => { T(x, n, cx, B + 130, 54, c.fg, 'center', 900); T(x, cnt(`${fmt(v)} 萬`, ease(q)), cx, B - nk * (c.land ? 36 : 44) - 110, 60, col, 'center', 900); });
      });
      fade(x, seg(t, 3.0, 3.4), () => pill(x, `利息 ≈ 本金的 ${Math.round(it / P * 100)}%`, w / 2, B + 240, 44, WHITE, INK));
      void clamp; void inout;
    }) },
  };
  return R;
};
