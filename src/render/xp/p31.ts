// 第 31 包：房產動態圖示（20）。圓形色塊底＋平塗圖示＋小循環動作，適合放在字卡或清單旁。
import type { XFx, XK, XC } from './kit';

export const xp31 = (K: XK) => {
  const { back, seg, box, circle, ring, line, T, pop, fade, alpha, WHITE, INK, PAL, TAU, house, coin, pin, person, check, key, train, car, tree, cloud, heart, phone, star, tower, poly, shade, cross } = K;
  type X = CanvasRenderingContext2D;
  type Ic = (x: X, cx: number, cy: number, s: number, t: number) => void;
  const B = Math.sin;
  const icon = (bg: string, label: string, draw: Ic): XFx => ({ bg: '#f6f1e7', d: (x, c) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => {
    const cx = w / 2, cy = h * (c.land ? 0.44 : 0.42), R = c.land ? 260 : 300, p = back(seg(c.t, 0, 0.55)), k = Math.max(0, c.t - 0.4);
    pop(x, cx, cy, p, () => { circle(x, cx, cy + 16, R, shade(bg, 0.25)); circle(x, cx, cy, R, bg); draw(x, cx, cy, R * 0.62, k); });
    fade(x, seg(c.t, 0.5, 0.9), () => T(x, label, cx, cy + R + (c.land ? 110 : 150), c.land ? 72 : 80, INK)); }); } });
  const fx: Record<string, XFx> = {
    'ic-home': icon(PAL.sky, '找房子', (x, cx, cy, s, t) => house(x, cx, cy + s * 0.55 - Math.abs(B(t * 4)) * 20, s * 1.3, '#fff7e6', PAL.red)),
    'ic-key': icon(PAL.yel, '交屋鑰匙', (x, cx, cy, s, t) => { x.save(); x.translate(cx, cy); x.rotate(B(t * 3) * 0.3 - 0.6); key(x, 0, 0, s * 2.4, INK); x.restore(); }),
    'ic-coin': icon(PAL.grn, '自備款', (x, cx, cy, s, t) => { const sc = Math.cos(t * 4); pop(x, cx, cy, 1, () => coin(x, cx, cy, s * 0.95), 1); x.save(); x.translate(cx, cy); x.scale(Math.abs(sc) * 0 + 1, 1); x.restore(); for (let i = 0; i < 3; i++) { const q = (t * 0.8 + i / 3) % 1; fade(x, 1 - q, () => star(x, cx + (i - 1) * s * 0.6, cy - s * 0.6 - q * s * 0.5, 18, WHITE)); } }),
    'ic-pin': icon(PAL.blue, '地點', (x, cx, cy, s, t) => { const b = Math.abs(B(t * 4)) * 30; circle(x, cx, cy + s * 0.75, s * 0.3 * (1 - b / 90), alpha(INK, 0.25)); pin(x, cx, cy + s * 0.6 - b, s * 1.1, PAL.red); }),
    'ic-loan': icon(PAL.teal, '房貸試算', (x, cx, cy, s, t) => { box(x, cx - s * 0.6, cy - s * 0.85, s * 1.2, s * 1.7, 24, WHITE); box(x, cx - s * 0.45, cy - s * 0.7, s * 0.9, s * 0.4, 10, INK); T(x, String(Math.floor(t * 7) % 9 + 1) + '%', cx + s * 0.35, cy - s * 0.43, s * 0.3, '#7cf5c4', 'right'); for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { const on = Math.floor(t * 4) % 9 === r * 3 + k; box(x, cx - s * 0.45 + k * s * 0.32, cy - s * 0.15 + r * s * 0.3, s * 0.25, s * 0.22, 8, on ? PAL.red : '#dfe4ea'); } }),
    'ic-contract': icon(PAL.purple, '簽約', (x, cx, cy, s, t) => { box(x, cx - s * 0.7, cy - s * 0.95, s * 1.4, s * 1.8, 16, WHITE); for (let i = 0; i < 4; i++) box(x, cx - s * 0.4, cy - s * 0.55 + i * s * 0.25, s * 0.8, 12, 6, '#d5d9e0'); const q = (t * 0.6) % 1; line(x, cx - s * 0.35, cy + s * 0.5, cx - s * 0.35 + s * 0.7 * q, cy + s * 0.5 + B(q * 20) * 10, 8, PAL.blue); x.save(); x.translate(cx - s * 0.35 + s * 0.7 * q, cy + s * 0.5); x.rotate(-0.8); box(x, -10, -s * 0.7, 20, s * 0.7, 6, PAL.yel); x.restore(); }),
    'ic-check': icon(PAL.grn, '檢查通過', (x, cx, cy, s, t) => { ring(x, cx, cy, s * 0.8, 20, WHITE, -Math.PI / 2, Math.min(1, t * 1.5)); check(x, cx, cy, s * 0.9, WHITE, Math.min(1, Math.max(0, t * 1.5 - 0.6))); }),
    'ic-warn': icon(PAL.red, '注意', (x, cx, cy, s, t) => { x.save(); x.translate(cx, cy); x.rotate(B(t * 18) * 0.08 * (B(t * 2) > 0 ? 1 : 0)); poly(x, [[0, -s * 0.85], [s * 0.9, s * 0.7], [-s * 0.9, s * 0.7]], PAL.yel); T(x, '!', 0, s * 0.45, s * 1.1, INK); x.restore(); }),
    'ic-mrt': icon(PAL.blue, '近捷運', (x, cx, cy, s, t) => { x.save(); x.beginPath(); x.arc(cx, cy, s * 1.55, 0, TAU); x.clip(); const off = ((t * 400) % (s * 5)) - s * 2.5; line(x, cx - s * 2, cy + s * 0.5, cx + s * 2, cy + s * 0.5, 10, WHITE); train(x, cx + off, cy + s * 0.3, s * 0.9, PAL.yel); x.restore(); }),
    'ic-car': icon(PAL.brick, '車位', (x, cx, cy, s, t) => { box(x, cx - s, cy - s * 0.9, s * 0.5, s * 0.5, 10, PAL.blue); T(x, 'P', cx - s * 0.75, cy - s * 0.52, s * 0.4, WHITE); car(x, cx + B(t * 2) * s * 0.15, cy + s * 0.4, s * 1.1, PAL.yel); }),
    'ic-park': icon(PAL.sky, '近公園', (x, cx, cy, s, t) => { x.save(); x.translate(cx, cy + s * 0.8); x.rotate(B(t * 2.5) * 0.06); tree(x, -s * 0.35, 0, s * 1.8); x.restore(); tree(x, cx + s * 0.5, cy + s * 0.8, s * 1.2, '#2f8a3e'); }),
    'ic-school': icon(PAL.gold, '學區', (x, cx, cy, s, t) => { box(x, cx - s * 0.8, cy - s * 0.2, s * 1.6, s * 0.9, 10, '#fff7e6'); poly(x, [[cx - s * 0.95, cy - s * 0.2], [cx, cy - s * 0.75], [cx + s * 0.95, cy - s * 0.2]], PAL.red); box(x, cx - s * 0.15, cy + s * 0.25, s * 0.3, s * 0.45, 6, INK); line(x, cx, cy - s * 0.75, cx, cy - s * 1.1, 6, INK); poly(x, [[cx, cy - s * 1.1], [cx + s * 0.35 + B(t * 6) * 8, cy - s * 1.0], [cx, cy - s * 0.9]], PAL.blue); }),
    'ic-quake': icon(PAL.brick, '耐震', (x, cx, cy, s, t) => { const sh = B(t * 25) * 10 * (B(t * 1.5) > 0 ? 1 : 0); tower(x, cx - s * 0.5 + sh, cy + s * 0.8, s * 1.0, s * 1.8, WHITE, PAL.sky); line(x, cx - s, cy + s * 0.8, cx + s, cy + s * 0.8, 10, INK); }),
    'ic-heart': icon(PAL.pink, '喜歡收藏', (x, cx, cy, s, t) => { const b = 1 + Math.max(0, B(t * 6)) * 0.12; pop(x, cx, cy, b, () => heart(x, cx, cy, s * 1.3, PAL.red)); }),
    'ic-chat': icon(PAL.sky, '問仲介', (x, cx, cy, s, t) => { box(x, cx - s * 0.9, cy - s * 0.6, s * 1.8, s * 1.1, 40, WHITE); poly(x, [[cx - s * 0.4, cy + s * 0.45], [cx - s * 0.7, cy + s * 0.85], [cx - s * 0.05, cy + s * 0.45]], WHITE); for (let i = 0; i < 3; i++) circle(x, cx + (i - 1) * s * 0.45, cy - s * 0.05 - Math.max(0, B(t * 6 - i)) * 16, s * 0.13, INK); }),
    'ic-phone': icon(PAL.purple, '線上看屋', (x, cx, cy, s, t) => { x.save(); x.translate(cx, cy); x.rotate(B(t * 12) * 0.05 * (B(t * 2) > 0.3 ? 1 : 0)); phone(x, 0, 0, s * 1.1, s * 2, INK, '#f3efe6'); house(x, 0, s * 0.3, s * 0.6); x.restore(); }),
    'ic-person': icon(PAL.yel, '屋主', (x, cx, cy, s, t) => { person(x, cx, cy + s * 0.9 - Math.abs(B(t * 3)) * 10, s * 2, PAL.blue); fade(x, Math.max(0, B(t * 3)), () => heart(x, cx + s * 0.7, cy - s * 0.6, s * 0.35, PAL.red)); }),
    'ic-rain': icon(PAL.blue, '防漏水', (x, cx, cy, s, t) => { cloud(x, cx, cy - s * 0.4, s * 1.2); for (let i = 0; i < 5; i++) { const q = (t * 1.5 + i * 0.37) % 1; line(x, cx + (i - 2) * s * 0.3, cy + s * 0.1 + q * s * 0.7, cx + (i - 2) * s * 0.3 - 8, cy + s * 0.25 + q * s * 0.7, 10, alpha(WHITE, 1 - q)); } }),
    'ic-sun': icon(PAL.gold, '採光好', (x, cx, cy, s, t) => { x.save(); x.translate(cx, cy); x.rotate(t * 0.8); for (let i = 0; i < 10; i++) { x.rotate(TAU / 10); box(x, -10, -s * 1.05, 20, s * 0.3, 10, PAL.yel); } x.restore(); circle(x, cx, cy, s * 0.6, '#ffe066'); }),
    'ic-no': icon(PAL.red, '不要買', (x, cx, cy, s, t) => { house(x, cx, cy + s * 0.5, s * 1.1, '#fff7e6', PAL.brick); const p = Math.min(1, t * 1.2); ring(x, cx, cy, s * 0.95, 24, WHITE, -Math.PI / 2, p); if (p >= 1) line(x, cx - s * 0.67, cy - s * 0.67, cx + s * 0.67, cy + s * 0.67, 24, WHITE); void cross; }),
  };
  return fx;
};
