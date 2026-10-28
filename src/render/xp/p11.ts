// 第 11 包：地圖路線與導航（8）。底圖為平塗示意街區，非真實地圖資料。
import type { XC, XFx, XK } from './kit';

export const xp11 = (K: XK) => {
  const { ease, inout, back, seg, box, circle, ring, line, T, pop, fade, clip, pill, alpha, INK, WHITE, pin, house, car, person, stroke, partial, arrowHead, lerp, mapBase, tower, cnt } = K;
  type X = CanvasRenderingContext2D; type Pt = [number, number];
  const stage = (c: XC, fn: (w: number, h: number) => void, x?: X, seed = 2) => { if (x) mapBase(x, 0, 0, c.W, c.H, seed); const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const route = (c: XC, w: number, h: number): Pt[] => (c.land ? [[180, 760], [180, 590], [460, 590], [460, 290], [900, 290], [900, 440], [1300, 440], [1300, 200], [1520, 200]] : [[160, 1320], [160, 1060], [460, 1060], [460, 760], [300, 760], [300, 460], [760, 460], [760, 220]]);
  const frame = (x: X, c: XC, w: number, h: number, seed = 2) => { mapBase(x, -w, -h, w * 3, h * 3, seed); };
  const ends = (x: X, c: XC, pts: Pt[], t: number, a = '家', b = '公司') => {
    const [sx, sy] = pts[0], [ex, ey] = pts[pts.length - 1];
    pop(x, sx, sy, back(seg(t, 0, 0.4)), () => { circle(x, sx, sy, 50, INK); house(x, sx, sy + 22, 54, WHITE, c.ac); });
    pop(x, ex, ey, back(seg(t, 0.2, 0.6)), () => { pin(x, ex, ey + 10, 56, '#e5484d'); });
    fade(x, seg(t, 0.3, 0.7), () => { pill(x, c.s(8, a), sx + 70, sy, 34, INK, WHITE, 'left'); pill(x, c.s(9, b), ex - 60, ey - 100, 34, '#e5484d', WHITE, 'right'); });
  };
  const R: Record<string, XFx> = {
    'rt-draw': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, pts = route(c, w, h), p = inout(seg(t, 0.4, 2.6));
      stroke(x, partial(pts, p), 34, WHITE); stroke(x, partial(pts, p), 20, c.ac);
      const o = partial(pts, p), [hx, hy] = o[o.length - 1]; if (p > 0 && p < 1) circle(x, hx, hy, 22, WHITE);
      ends(x, c, pts, t);
      fade(x, seg(t, 2.6, 3.0), () => pill(x, c.title('全程 6.8 公里'), w / 2, c.land ? 90 : 130, 48, INK, WHITE));
    }, x, 2) },
    'rt-car': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, pts = route(c, w, h), p = inout(seg(t, 0.5, 3.4));
      stroke(x, pts, 30, alpha(c.ac, 0.35)); stroke(x, partial(pts, p), 30, c.ac);
      const o = partial(pts, p), [hx, hy] = o[o.length - 1], [px, py] = o.length > 1 ? o[o.length - 2] : pts[0], a = Math.atan2(hy - py, hx - px);
      ends(x, c, pts, t);
      K.rot(x, hx, hy, a, () => { box(x, hx - 52, hy - 30, 104, 60, 16, '#2f6db5'); box(x, hx + 8, hy - 22, 30, 44, 8, '#bfe3f5'); circle(x, hx - 30, hy - 32, 9, INK); circle(x, hx + 30, hy - 32, 9, INK); circle(x, hx - 30, hy + 32, 9, INK); circle(x, hx + 30, hy + 32, 9, INK); });
      const mins = Math.round(+c.v(0, '18') * p); pill(x, `${mins} 分`, hx, hy - 80, 36, INK, WHITE);
    }, x, 5) },
    'rt-iso': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, cy = h * 0.52;
      const rings: [string, number, string][] = [[c.s(0, '步行 10 分'), 0.18, '#3aa04a'], [c.s(1, '騎車 10 分'), 0.32, '#f2b705'], [c.s(2, '開車 10 分'), 0.5, '#e85d3a']];
      [...rings].reverse().forEach(([n, k, col], j) => {
        const i = rings.length - 1 - j, q = ease(seg(t, 0.4 + i * 0.6, 1.4 + i * 0.6)), R0 = Math.min(w, h) * k * q * (c.land ? 1.0 : 1.4);
        if (R0 <= 0) return;
        x.beginPath(); for (let a = 0; a <= 48; a++) { const ang = a / 48 * K.TAU, wob = 1 + 0.12 * Math.sin(ang * 3 + i) + 0.06 * Math.sin(ang * 5 + 2 * i); const X1 = cx + Math.cos(ang) * R0 * wob, Y1 = cy + Math.sin(ang) * R0 * wob; a ? x.lineTo(X1, Y1) : x.moveTo(X1, Y1); } x.closePath();
        x.fillStyle = alpha(col, 0.22); x.fill(); x.lineWidth = 8; x.strokeStyle = col; x.setLineDash([18, 12]); x.stroke(); x.setLineDash([]);
        fade(x, seg(t, 1.0 + i * 0.6, 1.3 + i * 0.6), () => pill(x, n, cx, cy - R0 * 1.05 - 10, 34, col, WHITE));
      });
      pop(x, cx, cy, back(seg(t, 0, 0.4)), () => { circle(x, cx, cy, 56, INK); house(x, cx, cy + 24, 60, WHITE, c.ac); });
      ring(x, cx, cy, 56 + (t * 60) % 80, 6, alpha(INK, 1 - ((t * 60) % 80) / 80));
    }, x, 7) },
    'rt-three': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, base = route(c, w, h);
      const modes: [string, string, number, number][] = [[c.s(0, '步行'), '#3aa04a', +c.v(0, '42'), -40], [c.s(1, '騎車'), '#f2b705', +c.v(1, '16'), 0], [c.s(2, '開車'), '#e85d3a', +c.v(2, '12'), 40]];
      const mx = Math.max(...modes.map((m) => m[2])), tt = seg(t, 0.4, 3.4) * mx;
      modes.forEach(([n, col, m, off], i) => {
        const pts = base.map(([a, b], k) => [a + (k > 0 && k < base.length - 1 ? off : 0), b + (k > 0 && k < base.length - 1 ? off * 0.6 : 0)] as Pt), p = Math.min(1, tt / m);
        stroke(x, pts, 14, alpha(col, 0.3)); stroke(x, partial(pts, ease(p)), 14, col);
        const o = partial(pts, ease(p)), [hx, hy] = o[o.length - 1]; circle(x, hx, hy, 22, col); circle(x, hx, hy, 10, WHITE);
        const lx = c.land ? 1240 : 600, ly = (c.land ? 640 : 1180) + i * 80;
        box(x, lx, ly - 34, c.land ? 400 : 340, 68, 34, alpha(INK, 0.85)); circle(x, lx + 34, ly, 16, col);
        T(x, n, lx + 66, ly + 2, 36, WHITE, 'left', 900); T(x, p >= 1 ? `${m} 分` : `${Math.round(tt)} 分`, lx + (c.land ? 380 : 320), ly + 2, 36, p >= 1 ? c.ac2 : WHITE, 'right', 900);
      });
      ends(x, c, base, t);
    }, x, 9) },
    'rt-fly': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, pts = route(c, w, h), p = inout(seg(t, 0.4, 3.4)), o = partial(pts, p), [hx, hy] = o[o.length - 1];
      const z = lerp(1, 2.2, Math.sin(Math.PI * Math.min(1, p * 1.0)) * 0.5 + p * 0.5), cx = lerp(w / 2, hx, Math.min(1, p * 3)), cy = lerp(h / 2, hy, Math.min(1, p * 3));
      x.save(); x.translate(w / 2, h / 2); x.scale(z, z); x.translate(-cx, -cy);
      frame(x, c, w, h, 4); for (let i = 0; i < 6; i++) tower(x, 200 + i * 260, 300 + (i % 3) * 300, 70, 140 + (i % 2) * 80, ['#ff8c42', '#5bc0eb', '#f6a5c0'][i % 3], '#2a3240');
      stroke(x, pts, 22, alpha(c.ac, 0.3)); stroke(x, o, 22, c.ac); circle(x, hx, hy, 26, WHITE); circle(x, hx, hy, 14, c.ac);
      ends(x, c, pts, t);
      x.restore();
      for (let i = 0; i < 8; i++) { const a = i / 8 * K.TAU + t, rr = Math.max(w, h) * 0.55; line(x, w / 2 + Math.cos(a) * rr, h / 2 + Math.sin(a) * rr, w / 2 + Math.cos(a) * rr * 0.86, h / 2 + Math.sin(a) * rr * 0.86, 6, alpha(WHITE, 0.25 * Math.sin(Math.PI * p))); }
      pill(x, c.title('飛到目的地'), w / 2, c.land ? 80 : 120, 44, INK, WHITE);
    }) },
    'rt-eta': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, pts = route(c, w, h), p = ease(seg(t, 0.3, 1.8));
      stroke(x, partial(pts, p), 26, '#2f6db5');
      const marks = [0.25, 0.5, 0.75], km = +c.v(0, '6.8');
      marks.forEach((k, i) => { const o = partial(pts, k), [mx, my] = o[o.length - 1], q = back(seg(t, 1.0 + i * 0.3, 1.3 + i * 0.3)); pop(x, mx, my, q, () => { circle(x, mx, my, 20, WHITE); ring(x, mx, my, 20, 6, '#2f6db5'); pill(x, `${(km * k).toFixed(1)} km`, mx + 34, my - 40, 30, WHITE, INK, 'left'); }); });
      ends(x, c, pts, t);
      const q = back(seg(t, 2.2, 2.6)), bx = c.land ? 1380 : w / 2, by = c.land ? 760 : 1400;
      pop(x, bx, by, q, () => { box(x, bx - 230, by - 70, 460, 140, 30, INK); T(x, '預計抵達', bx - 200, by - 22, 32, alpha(WHITE, 0.6), 'left', 700); T(x, c.title('08:42'), bx - 200, by + 30, 60, WHITE, 'left', 900); T(x, cnt(`${km} km`, ease(seg(t, 2.2, 2.8))), bx + 200, by + 4, 44, c.ac2, 'right', 900); });
    }, x, 6) },
    'rt-detour': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, pts = route(c, w, h), n = pts.length;
      const jam = pts.slice(2, 5), alt: Pt[] = c.land ? [[460, 590], [700, 590], [700, 440], [900, 440]] : [[460, 1060], [700, 1060], [700, 760], [700, 460], [760, 460]];
      stroke(x, partial(pts, ease(seg(t, 0.2, 1.2))), 24, '#3aa04a');
      const jq = seg(t, 1.3, 1.6); if (jq > 0) { const blink = Math.floor(t * 4) % 2 ? 1 : 0.6; fade(x, blink, () => stroke(x, jam, 24, '#e5484d')); }
      fade(x, jq, () => { const [jx, jy] = jam[1]; pop(x, jx, jy - 60, back(jq), () => pill(x, c.s(0, '塞車 +15 分'), jx, jy - 60, 34, '#e5484d', WHITE)); });
      const aq = ease(seg(t, 2.0, 3.0)); stroke(x, partial(alt, aq), 24, '#2f6db5', [30, 16]);
      if (aq >= 1) { const [ax, ay] = alt[Math.floor(alt.length / 2)]; pop(x, ax + 60, ay, back(seg(t, 3.0, 3.3)), () => pill(x, c.s(1, '改道 省 9 分'), ax + 40, ay, 34, '#2f6db5', WHITE, 'left')); }
      ends(x, c, pts, t); void n; void arrowHead;
    }, x, 8) },
    'rt-commute': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, pts = route(c, w, h), p = inout(seg(t, 0.4, 2.4));
      stroke(x, pts, 40, alpha(INK, 0.15)); stroke(x, partial(pts, p), 18, c.ac, [2, 22]);
      const o = partial(pts, p), [hx, hy] = o[o.length - 1]; person(x, hx, hy + 20, 80, '#2f6db5');
      ends(x, c, pts, t, '住家', '公司');
      const q = back(seg(t, 2.4, 2.8)), bx = w / 2, by = c.land ? 110 : 150;
      pop(x, bx, by, q, () => { box(x, bx - 330, by - 66, 660, 132, 66, WHITE); T(x, c.title('通勤單程'), bx - 290, by + 2, 46, INK, 'left', 900); T(x, cnt(`${c.v(0, '35')} 分`, ease(seg(t, 2.4, 3.0))), bx + 290, by + 2, 64, c.ac, 'right', 900); });
      void car; void clip; void line;
    }, x, 10) },
  };
  return R;
};
