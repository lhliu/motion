// 第 6 包：字幕下方條與人名條（10）。放在畫面下三分之一，直式避開右側與底部 UI。
import type { XC, XFx, XK } from './kit';

export const xp06 = (K: XK) => {
  const { ease, back, seg, box, circle, line, T, pop, fade, clip, pill, alpha, INK, WHITE, tw, pin, poly, star } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const out = (_t: number) => 1;
  const base = (c: XC, h: number) => (c.land ? h - 170 : h - 380);
  // 背景示意畫面：淡淡的格子，讓名條看起來疊在影片上
  const bgv = (x: X, c: XC, w: number, h: number) => { for (let i = 0; i < 12; i++) box(x, i * 160 - 40, h * 0.18 + (i % 3) * 60, 120, h * 0.4, 20, alpha(c.fg, 0.04)); };
  const R: Record<string, XFx> = {
    'lt-name': { d: (x, c) => stage(c, (w, h) => {
      bgv(x, c, w, h); const t = c.t, y = base(c, h), L = 80, o = out(t); const n = c.title('王小明'), r = c.sub('信義區 房仲 · 15 年'), nw = Math.max(tw(x, n, 84), tw(x, r, 40, 700)) + 90;
      const a = ease(seg(t, 0, 0.5)) * o, b = ease(seg(t, 0.25, 0.8)) * o;
      box(x, L, y - 80, 22, 190 * a, 4, c.ac);
      clip(x, () => x.rect(L + 22, y - 120, nw * b, 260), () => { box(x, L + 22, y - 80, nw, 120, 0, alpha(INK, 0.92)); T(x, n, L + 60, y - 18, 84, WHITE, 'left', 900); });
      clip(x, () => x.rect(L + 22, y + 40, nw * ease(seg(t, 0.45, 1.0)) * o, 80), () => { box(x, L + 22, y + 40, nw, 70, 0, c.ac); T(x, r, L + 60, y + 76, 40, WHITE, 'left', 700); });
    }) },
    'lt-place': { d: (x, c) => stage(c, (w, h) => {
      bgv(x, c, w, h); const t = c.t, y = base(c, h), L = 80, o = out(t), s = c.title('台北市 信義區'), s2 = c.sub('象山步道入口'), bw = tw(x, s, 70) + 190;
      
      clip(x, () => x.rect(L + 60, y - 70, bw * ease(seg(t, 0.25, 0.8)) * o, 140), () => { box(x, L + 60, y - 56, bw, 112, 56, WHITE); T(x, s, L + 150, y + 2, 70, INK, 'left', 900); });
      pop(x, L + 60, y, back(seg(t, 0, 0.45)) * o, () => { circle(x, L + 60, y, 60, c.ac); pin(x, L + 60, y + 28, 34, WHITE); });
      fade(x, seg(t, 0.7, 1.0) * o, () => T(x, s2, L + 150, y + 100, 40, c.fg, 'left', 700));
    }) },
    'lt-date': { d: (x, c) => stage(c, (w, h) => {
      bgv(x, c, w, h); const t = c.t, y = base(c, h), L = 80, o = out(t), d = c.title('2026.10.28 週三'), tp = c.v(0, '26') + '°C', bw = tw(x, d, 60) + 330;
      clip(x, () => x.rect(L, y - 70, bw * ease(seg(t, 0, 0.6)) * o, 140), () => {
        box(x, L, y - 60, bw, 120, 24, alpha(INK, 0.9)); T(x, d, L + 40, y + 2, 60, WHITE, 'left', 900);
        line(x, L + bw - 280, y - 36, L + bw - 280, y + 36, 4, alpha(WHITE, 0.3));
        const sx = L + bw - 200, sp = t * 0.8; for (let i = 0; i < 8; i++) { const a = sp + i * Math.PI / 4; line(x, sx + Math.cos(a) * 34, y + Math.sin(a) * 34, sx + Math.cos(a) * 46, y + Math.sin(a) * 46, 7, c.ac2); }
        circle(x, sx, y, 24, c.ac2); T(x, tp, L + bw - 40, y + 2, 54, WHITE, 'right', 900);
      });
      fade(x, seg(t, 0.6, 0.9) * o, () => pill(x, c.sub('晴時多雲'), L, y + 110, 34, c.ac, WHITE, 'left'));
    }) },
    'lt-source': { d: (x, c) => stage(c, (w, h) => {
      bgv(x, c, w, h); const t = c.t, o = out(t), s = c.title('資料來源：內政部實價登錄'), s2 = c.sub('2026 Q3 · 本片整理'), Rr = w - 60, y = c.land ? h - 70 : h - 300, bw = Math.max(tw(x, s, 34, 700), tw(x, s2, 28, 700)) + 60;
      const q = ease(seg(t, 0, 0.5)) * o;
      fade(x, q, () => { box(x, Rr - bw + (1 - q) * 40, y - 80, bw, 110, 14, alpha(INK, 0.75)); box(x, Rr - bw + (1 - q) * 40, y - 80, 8, 110, 4, c.ac2); T(x, s, Rr - 26 + (1 - q) * 40, y - 46, 34, WHITE, 'right', 700); T(x, s2, Rr - 26 + (1 - q) * 40, y - 2, 28, alpha(WHITE, 0.65), 'right', 700); });
    }) },
    'lt-warn': { d: (x, c) => stage(c, (w, h) => {
      bgv(x, c, w, h); const t = c.t, y = base(c, h), o = out(t), q = ease(seg(t, 0, 0.5)) * o, bh = 150;
      clip(x, () => x.rect(0, y - bh / 2, w * q, bh), () => {
        box(x, 0, y - bh / 2, w, bh, 0, '#ffd23f');
        const off = (t * 120) % 120; for (let i = -2; i < w / 60 + 2; i++) poly(x, [[i * 120 - off, y - bh / 2], [i * 120 + 60 - off, y - bh / 2], [i * 120 - off, y - bh / 2 + 22], [i * 120 - 60 - off, y - bh / 2 + 22]], INK);
        for (let i = -2; i < w / 60 + 2; i++) poly(x, [[i * 120 + off, y + bh / 2 - 22], [i * 120 + 60 + off, y + bh / 2 - 22], [i * 120 + off, y + bh / 2], [i * 120 - 60 + off, y + bh / 2]], INK);
        const pu = 1 + 0.08 * Math.max(0, Math.sin(t * 8)); pop(x, 100, y + 4, pu, () => { poly(x, [[100, y - 44], [150, y + 44], [50, y + 44]], INK); T(x, '!', 100, y + 18, 56, '#ffd23f'); });
        T(x, c.title('注意：預售屋紅單轉售違法'), 180, y + 4, c.land ? 62 : 50, INK, 'left', 900, w - 220);
      });
    }) },
    'lt-bilingual': { d: (x, c) => stage(c, (w, h) => {
      bgv(x, c, w, h); const t = c.t, y = base(c, h), o = out(t), a = c.title('這一區的房價五年漲了三成'), b = c.sub('Prices here rose 30% in five years'), q = ease(seg(t, 0, 0.4)) * o, q2 = ease(seg(t, 0.3, 0.7)) * o;
      const aw = Math.min(w - 120, tw(x, a, 64) + 60), bw2 = Math.min(w - 160, tw(x, b, 40, 700) + 90);
      fade(x, q, () => { box(x, (w - aw) / 2, y - 70 + (1 - q) * 20, aw, 100, 16, alpha(INK, 0.85)); T(x, a, w / 2, y - 18 + (1 - q) * 20, 64, WHITE, 'center', 900, w - 160); });
      fade(x, q2, () => { box(x, (w - bw2) / 2, y + 44, bw2, 70, 12, alpha(c.ac, 0.95)); T(x, b, w / 2, y + 80, 40, WHITE, 'center', 700, w - 200); });
    }) },
    'lt-key': { d: (x, c) => stage(c, (w, h) => {
      bgv(x, c, w, h); const t = c.t, y = base(c, h), o = out(t), pre = c.s(0, '總價其實'), k = c.s(1, '貴了 200 萬'), post = c.s(2, '你知道嗎');
      const fs = c.land ? 76 : 60, wa = tw(x, pre, fs), wk = tw(x, k, fs), wb = tw(x, post, fs), tot = wa + wk + wb + 40, X0 = (w - tot) / 2;
      fade(x, ease(seg(t, 0, 0.3)) * o, () => {
        box(x, X0 - 40, y - fs * 0.85, tot + 80, fs * 1.7, 20, alpha(INK, 0.85));
        T(x, pre, X0, y, fs, WHITE, 'left'); T(x, post, X0 + wa + wk + 40, y, fs, WHITE, 'left');
        const q = back(seg(t, 0.5, 0.9)), kx = X0 + wa + 20 + wk / 2;
        box(x, kx - wk / 2 - 14, y - fs * 0.62, (wk + 28) * ease(seg(t, 0.45, 0.75)), fs * 1.24, 12, c.ac2);
        pop(x, kx, y, 1 + 0.2 * Math.sin(Math.PI * seg(t, 0.5, 0.9)), () => T(x, k, kx, y, fs, q > 0.1 ? INK : WHITE));
      });
    }) },
    'lt-handle': { d: (x, c) => stage(c, (w, h) => {
      bgv(x, c, w, h); const t = c.t, y = base(c, h), L = 80, o = out(t), hd = c.title('@kc.house'), s2 = c.sub('追蹤看更多房市拆解'), bw = Math.max(tw(x, hd, 60), tw(x, s2, 34, 700)) + 190;
      
      clip(x, () => x.rect(L + 70, y - 80, bw * ease(seg(t, 0.25, 0.8)) * o, 160), () => { box(x, L + 70, y - 70, bw, 140, 70, WHITE); T(x, hd, L + 170, y - 18, 60, INK, 'left', 900); T(x, s2, L + 170, y + 36, 34, '#5d6772', 'left', 700); });
      pop(x, L + 70, y, back(seg(t, 0, 0.45)) * o, () => { circle(x, L + 70, y, 70, c.ac); T(x, 'KC', L + 70, y + 2, 56, WHITE); });
      const hq = back(seg(t, 1.0, 1.3)) * o; pop(x, L + 70 + bw + 60, y, hq, () => { box(x, L + bw + 70, y - 40, 120, 80, 40, '#e5484d'); T(x, '追蹤', L + bw + 130, y + 2, 36, WHITE); });
    }) },
    'lt-chapter': { d: (x, c) => stage(c, (w, h) => {
      bgv(x, c, w, h); const t = c.t, o = out(t), L = 60, y = c.land ? 90 : 180, n = c.v(0, '02'), s = c.title('交通'), q = ease(seg(t, 0, 0.5)) * o;
      fade(x, q, () => { box(x, L - (1 - q) * 40, y - 46, 110, 92, 16, c.ac); T(x, n, L + 55 - (1 - q) * 40, y + 2, 54, WHITE); });
      clip(x, () => x.rect(L + 110, y - 50, (tw(x, s, 54) + 60) * ease(seg(t, 0.3, 0.8)) * o, 100), () => { box(x, L + 110, y - 46, tw(x, s, 54) + 60, 92, 0, alpha(INK, 0.85)); T(x, s, L + 140, y + 2, 54, WHITE, 'left'); });
      const p = ease(seg(t, 0.6, 3.4)); box(x, L, y + 60, 300, 8, 4, alpha(c.fg, 0.2)); box(x, L, y + 60, 300 * p * o, 8, 4, c.ac2);
    }) },
    'lt-breaking': { d: (x, c) => stage(c, (w, h) => {
      bgv(x, c, w, h); const t = c.t, y = base(c, h), o = out(t), bh = 130, q = ease(seg(t, 0, 0.5)) * o, lab = c.title('快訊'), lw = tw(x, lab, 60) + 70;
      clip(x, () => x.rect(0, y - bh / 2 - 60, w * q, bh + 140), () => {
        box(x, 0, y - bh / 2, w, bh, 0, alpha(INK, 0.92)); box(x, 0, y - bh / 2, lw + 40, bh, 0, '#e5484d');
        const fl = 0.6 + 0.4 * Math.abs(Math.sin(t * 5)); fade(x, fl, () => star(x, 34, y, 14, WHITE)); T(x, lab, 60, y + 2, 60, WHITE, 'left');
        const msg = c.sub('央行宣布：第 8 波選擇性信用管制（示意）'), sw = tw(x, msg, 54), sc = (t * 260) % (sw + w);
        clip(x, () => x.rect(lw + 40, y - bh / 2, w, bh), () => T(x, msg, w - sc + lw, y + 2, 54, WHITE, 'left'));
        box(x, 0, y + bh / 2, w, 50, 0, c.ac); T(x, '10:30 · 財經', 40, y + bh / 2 + 26, 30, WHITE, 'left', 700);
      });
    }) },
  };
  return R;
};
