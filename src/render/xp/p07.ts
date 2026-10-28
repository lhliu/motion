// 第 7 包：看屋動線與格局（8）。彩色 v1 圖卡風：米色底、平塗房間色塊、深色牆線。格局與坪數皆示意。
import type { XC, XFx, XK } from './kit';

export const xp07 = (K: XK) => {
  const { ease, inout, back, seg, box, circle, ring, line, T, pop, fade, clip, pill, alpha, INK, WHITE, cnt, check, cross, poly, stroke, partial, arrowHead, lerp, shade, TAU, person } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const ROOMS: [string, number, number, number, number, string][] = [
    ['客廳', 0, 0, 5, 4, '#ffd9a8'], ['廚房', 5, 0, 2, 2, '#bfe3c0'], ['衛浴', 5, 2, 2, 2, '#bde0f5'], ['主臥', 7, 0, 3, 4, '#f6c6d4'],
    ['次臥', 0, 4, 4, 3, '#d9cdf2'], ['書房', 4, 4, 3, 3, '#f9e79f'], ['陽台', 7, 4, 3, 3, '#cfe8d8'],
  ];
  // 平面圖放置：回傳每格大小與原點
  const lay = (c: XC, w: number, h: number) => { const aw = c.land ? 1000 : 880, ah = c.land ? 680 : 620, u = Math.min(aw / 10, ah / 7), ox = c.land ? 90 : (w - u * 10) / 2, oy = c.land ? 210 : 330; return { u, ox, oy }; };
  const plan = (x: X, c: XC, w: number, h: number, fill: (i: number) => number, labels = true) => {
    const { u, ox, oy } = lay(c, w, h);
    box(x, ox - 18, oy - 18 + 14, u * 10 + 36, u * 7 + 36, 20, shade('#8a7a66', -0.2)); box(x, ox - 18, oy - 18, u * 10 + 36, u * 7 + 36, 20, '#8a7a66');
    box(x, ox, oy, u * 10, u * 7, 6, '#fbf7ef');
    ROOMS.forEach(([n, a, b, rw, rh, col], i) => {
      const f = fill(i); if (f > 0) { const X0 = ox + a * u, Y0 = oy + b * u; box(x, X0 + 6, Y0 + 6 + (rh * u - 12) * (1 - f), rw * u - 12, (rh * u - 12) * f, 8, col); }
      if (labels) T(x, c.s(i, n), ox + (a + rw / 2) * u, oy + (b + rh / 2) * u, Math.min(54, u * 0.55), INK, 'center', 900);
    });
    // 牆
    x.strokeStyle = INK; x.lineWidth = 10; x.lineCap = 'square';
    ROOMS.forEach(([, a, b, rw, rh]) => { x.strokeRect(ox + a * u, oy + b * u, rw * u, rh * u); });
    // 門缺口
    [[5, 1.2, 'v'], [4, 4.6, 'v'], [1.5, 4, 'h'], [5.6, 4, 'h'], [7, 1.6, 'v'], [7, 5, 'v']].forEach(([a, b, d]) => { if (d === 'v') box(x, ox + (a as number) * u - 8, oy + (b as number) * u, 16, u * 0.7, 0, '#fbf7ef'); else box(x, ox + (a as number) * u, oy + (b as number) * u - 8, u * 0.7, 16, 0, '#fbf7ef'); });
    box(x, ox + 1.5 * u, oy + 7 * u - 8, u * 0.9, 16, 0, '#e85d3a');
    return { u, ox, oy };
  };
  const side = (c: XC, w: number, h: number) => (c.land ? { x: 1180, y: 200 } : { x: 80, y: 1050 });
  const head = (x: X, c: XC, w: number, s: string, s2: string) => { T(x, c.title(s), c.land ? 90 : 80, c.land ? 70 : 130, c.land ? 56 : 64, INK, 'left', 900, w - 160); fade(x, seg(c.t, 0.2, 0.6), () => T(x, c.sub(s2), c.land ? 90 : 80, c.land ? 125 : 200, 34, alpha(INK, 0.6), 'left', 700, w - 160)); };
  const R: Record<string, XFx> = {
    'fp-rooms': { bg: 'cream', d: (x, c) => stage(c, (w, h) => {
      const t = c.t; head(x, c, w, '格局逐間看', '3 房 2 廳（示意）');
      const { u, ox, oy } = plan(x, c, w, h, (i) => ease(seg(t, 0.3 + i * 0.3, 0.7 + i * 0.3)));
      // 尺寸標註
      const q = ease(seg(t, 2.6, 3.2));
      fade(x, q, () => {
        const yy = oy - 40; line(x, ox, yy, ox + u * 5 * q, yy, 4, '#e85d3a'); line(x, ox, yy - 14, ox, yy + 14, 4, '#e85d3a'); line(x, ox + u * 5 * q, yy - 14, ox + u * 5 * q, yy + 14, 4, '#e85d3a');
        pill(x, c.v(0, '5.0 m'), ox + u * 2.5, yy, 30, '#e85d3a', WHITE);
      });
      const sd = side(c, w, h), rows = [['室內', c.v(1, '32.5 坪')], ['主建物', c.v(2, '24.8 坪')], ['房數', '3 房 2 廳 2 衛']];
      rows.forEach(([a, b], i) => fade(x, seg(t, 2.8 + i * 0.2, 3.1 + i * 0.2), () => { const y = sd.y + i * (c.land ? 130 : 110) + (c.land ? 120 : 0); T(x, a, sd.x, y, 40, alpha(INK, 0.6), 'left', 700); T(x, b, c.land ? w - 80 : w - 80, y, 52, INK, 'right', 900); }));
    }) },
    'fp-sun': { bg: 'cream', d: (x, c) => stage(c, (w, h) => {
      const t = c.t; head(x, c, w, '採光：一天的日照', '南向客廳（示意）');
      const { u, ox, oy } = plan(x, c, w, h, () => 1);
      const p = inout(seg(t, 0.4, 3.6)), ang = lerp(-0.9, 0.9, p), sx = ox + u * 5 + Math.sin(ang) * u * 7, sy = oy + u * 7 + u * 2.4 - Math.cos(ang) * u * 1.2;
      // 光束：從太陽射向南窗
      clip(x, () => x.rect(ox, oy, u * 10, u * 7), () => {
        const g = x.createRadialGradient(sx, sy, 10, sx, sy, u * 8); g.addColorStop(0, 'rgba(255,210,63,.55)'); g.addColorStop(1, 'rgba(255,210,63,0)');
        x.fillStyle = g; x.beginPath(); x.moveTo(sx, sy); x.lineTo(ox, oy + u * 4 - (1 - p) * u * 2); x.lineTo(ox + u * 5 + p * u * 2, oy); x.closePath(); x.fill();
      });
      for (let i = 0; i < 10; i++) { const a = t * 0.8 + i * TAU / 10; line(x, sx + Math.cos(a) * 64, sy + Math.sin(a) * 64, sx + Math.cos(a) * 86, sy + Math.sin(a) * 86, 9, '#f2b705'); }
      circle(x, sx, sy, 52, '#ffd23f');
      box(x, ox + u * 0.6, oy + u * 7 - 8, u * 3, 16, 4, '#5bc0eb');
      const hr = Math.round(lerp(8, 17, p)); pill(x, `${hr}:00`, sx, sy - 110, 36, INK, WHITE);
    }) },
    'fp-wind': { bg: 'cream', d: (x, c) => stage(c, (w, h) => {
      const t = c.t; head(x, c, w, '通風：前後對流', '窗戶對開＝空氣跑得動（示意）');
      const { u, ox, oy } = plan(x, c, w, h, () => 1, false);
      const paths: [number, number][][] = [[[-1.2, 2], [2.5, 2], [5.5, 1.2], [8.5, 2], [11.2, 2]], [[-1.2, 5.5], [2, 5.5], [5.5, 5.4], [8.5, 5.6], [11.2, 5.5]]];
      paths.forEach((pp, k) => {
        const pts = pp.map(([a, b]) => [ox + a * u, oy + b * u] as [number, number]);
        stroke(x, pts, 8, alpha('#2f6db5', 0.18), [6, 18]);
        for (let j = 0; j < 4; j++) {
          const ph = ((t * 0.35 + j / 4 + k * 0.12) % 1), seg0 = partial(pts, ph), seg1 = partial(pts, Math.max(0, ph - 0.12));
          const tail = seg0.slice(seg1.length - 1); if (tail.length > 1) { stroke(x, tail, 14, '#2f6db5'); const [ax, ay] = tail[tail.length - 1], [bx, by] = tail[tail.length - 2]; arrowHead(x, ax, ay, Math.atan2(ay - by, ax - bx), 26, '#2f6db5'); }
        }
      });
      [[0, 1.4], [0, 4.9], [10, 1.4], [10, 4.9]].forEach(([a, b]) => box(x, ox + a * u - 10, oy + b * u, 20, u * 1.2, 4, '#5bc0eb'));
      fade(x, seg(t, 1, 1.4), () => pill(x, c.s(0, '進風'), ox - 10, oy - 40, 34, '#2f6db5', WHITE, 'left'));
      fade(x, seg(t, 1.2, 1.6), () => pill(x, c.s(1, '出風'), ox + u * 10 + 10, oy - 40, 34, '#e85d3a', WHITE, 'right'));
    }) },
    'fp-ping': { bg: 'cream', d: (x, c) => stage(c, (w, h) => {
      const t = c.t, m2 = +c.v(0, '107.4'), ping = m2 * 0.3025; head(x, c, w, '平方公尺換成坪', '1 坪 ≈ 3.3058 m²');
      const cols = c.land ? 12 : 8, n = Math.round(ping), sz = c.land ? 62 : 84, gx = c.land ? 120 : (w - cols * (sz + 12)) / 2, gy = c.land ? 240 : 320;
      for (let i = 0; i < n; i++) { const q = back(seg(t, 0.4 + i * 0.05, 0.6 + i * 0.05)), cx = gx + (i % cols) * (sz + 12) + sz / 2, cy = gy + Math.floor(i / cols) * (sz + 12) + sz / 2; pop(x, cx, cy, q, () => { box(x, cx - sz / 2, cy - sz / 2 + 5, sz, sz, 10, shade('#ff8c42', -0.3)); box(x, cx - sz / 2, cy - sz / 2, sz, sz, 10, '#ff8c42'); }); }
      const by = c.land ? 520 : 1060, bx = c.land ? 1380 : w / 2, p = ease(seg(t, 0.4, 0.4 + n * 0.05));
      T(x, cnt(`${m2.toFixed(1)} m²`, p), bx, by, c.land ? 80 : 90, '#5d6772', 'center', 900);
      arrowHead(x, bx, by + 90, Math.PI / 2, 34, INK);
      T(x, cnt(`${ping.toFixed(1)} 坪`, p), bx, by + 200, c.land ? 120 : 130, '#e85d3a', 'center', 900);
      fade(x, seg(t, 3, 3.4), () => pill(x, '每格＝1 坪', bx, by + 320, 36, INK, WHITE));
    }) },
    'fp-furn': { bg: 'cream', d: (x, c) => stage(c, (w, h) => {
      const t = c.t; head(x, c, w, '沙發擺得下嗎？', '客廳 5.0 × 4.0 m（示意）');
      const { u, ox, oy } = plan(x, c, w, h, (i) => (i === 0 ? 1 : 0.35), false);
      const p1 = ease(seg(t, 0.4, 1.4)), sx = lerp(ox - u * 4, ox + u * 0.4, p1), sy = oy + u * 0.4;
      const fit = seg(t, 1.4, 1.7) > 0, sw = u * 3, sh = u * 1;
      box(x, sx, sy + 8, sw, sh, 18, shade('#5c6bc0', -0.3)); box(x, sx, sy, sw, sh, 18, '#5c6bc0'); box(x, sx + 14, sy + 14, sw - 28, sh * 0.35, 10, '#7986cb');
      const p2 = ease(seg(t, 1.8, 2.6)), tx = lerp(ox + u * 12, ox + u * 1.2, p2), ty = oy + u * 2;
      box(x, tx, ty + 6, u * 1.8, u * 1, 14, shade('#a0673d', -0.3)); box(x, tx, ty, u * 1.8, u * 1, 14, '#a0673d');
      if (fit) { const q = back(seg(t, 1.4, 1.7)); pop(x, sx + sw + 50, sy + sh / 2, q, () => { circle(x, sx + sw + 50, sy + sh / 2, 40, '#3aa04a'); check(x, sx + sw + 50, sy + sh / 2, 46, WHITE); }); }
      // 第三件放不下：書櫃擋到門
      const p3 = ease(seg(t, 2.8, 3.4)), bx = lerp(ox + u * 12, ox + u * 4.2, p3);
      box(x, bx, oy + u * 1, u * 1.4, u * 0.7, 10, '#e85d3a');
      if (t > 3.4) pop(x, bx + u * 0.7, oy + u * 0.4, back(seg(t, 3.4, 3.7)), () => { circle(x, bx + u * 0.7, oy + u * 0.4, 36, '#e5484d'); cross(x, bx + u * 0.7, oy + u * 0.4, 46, WHITE); });
      const sd = side(c, w, h); fade(x, seg(t, 3.5, 3.9), () => T(x, c.s(0, '書櫃會擋到門'), c.land ? sd.x : w / 2, c.land ? sd.y + 200 : sd.y + 100, 52, '#e5484d', c.land ? 'left' : 'center', 900));
    }) },
    'fp-share': { bg: 'cream', d: (x, c) => stage(c, (w, h) => {
      const t = c.t, sh = +c.v(0, '33'); head(x, c, w, '公設比有多少？', `權狀 48 坪 · 公設比 ${sh}%（示意）`);
      const { u, ox, oy } = plan(x, c, w, h, () => 1);
      const q = ease(seg(t, 0.8, 2.2)), cx = c.land ? 1380 : w / 2, cy = c.land ? 520 : 1200, R0 = c.land ? 220 : 190;
      fade(x, seg(t, 0.4, 0.8), () => { circle(x, cx, cy + 10, R0 + 10, alpha(INK, 0.15)); circle(x, cx, cy, R0, '#bfe3c0'); });
      if (q > 0) { x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R0, -Math.PI / 2, -Math.PI / 2 + TAU * sh / 100 * q); x.closePath(); x.fillStyle = '#e85d3a'; x.fill(); }
      circle(x, cx, cy, R0 * 0.5, '#fff3e2'); T(x, cnt(`${sh}%`, q), cx, cy + 4, 70, INK);
      fade(x, seg(t, 2.2, 2.6), () => { pill(x, '■ 公設', cx - R0, cy + R0 + 60, 32, '#e85d3a', WHITE, 'left'); pill(x, '■ 室內', cx + R0, cy + R0 + 60, 32, '#3aa04a', WHITE, 'right'); });
      // 平面圖上斜線區塊示意公設被「切掉」
      const k = ease(seg(t, 2.4, 3.2)); clip(x, () => x.rect(ox, oy, u * 10 * sh / 100 * k, u * 7), () => { x.fillStyle = alpha('#e85d3a', 0.35); x.fillRect(ox, oy, u * 10, u * 7); for (let i = -8; i < 20; i++) line(x, ox + i * u * 0.6, oy, ox + i * u * 0.6 + u * 7, oy + u * 7, 4, alpha('#e85d3a', 0.6)); });
    }) },
    'fp-compass': { bg: 'cream', d: (x, c) => stage(c, (w, h) => {
      const t = c.t, face = c.v(0, '南'); head(x, c, w, '這戶朝哪邊？', '以客廳落地窗為準（示意）');
      const { u, ox, oy } = plan(x, c, w, h, () => 1);
      const cx = c.land ? 1380 : w / 2, cy = c.land ? 540 : 1210, R0 = c.land ? 220 : 180;
      const deg = ({ 北: 0, 東北: 45, 東: 90, 東南: 135, 南: 180, 西南: 225, 西: 270, 西北: 315 } as Record<string, number>)[face] ?? 180;
      circle(x, cx, cy + 12, R0, alpha(INK, 0.2)); circle(x, cx, cy, R0, WHITE); ring(x, cx, cy, R0, 12, INK);
      ['北', '東', '南', '西'].forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; T(x, s, cx + Math.cos(a) * (R0 - 50), cy + Math.sin(a) * (R0 - 50), 44, s === '北' ? '#e5484d' : INK); });
      const wob = (1 - ease(seg(t, 0.4, 2.2))) * Math.sin(t * 10) * 0.6, a = (deg / 180) * Math.PI + wob - Math.PI / 2;
      x.save(); x.translate(cx, cy); x.rotate(a); poly(x, [[R0 * 0.72, 0], [0, -22], [-30, 0], [0, 22]], '#e85d3a'); x.restore(); circle(x, cx, cy, 16, INK);
      fade(x, seg(t, 2.2, 2.6), () => pill(x, `坐北朝${face}`.replace('朝北', '朝北'), cx, cy + R0 + 70, 44, '#e85d3a', WHITE));
      const q = ease(seg(t, 2.4, 3.0)); fade(x, q, () => { box(x, ox + u * 0.6, oy + u * 7 - 10, u * 3.6, 20, 4, '#5bc0eb'); arrowHead(x, ox + u * 2.4, oy + u * 7 + 40 + (1 - q) * 30, Math.PI / 2, 26, '#e85d3a'); });
    }) },
    'fp-walk': { bg: 'cream', d: (x, c) => stage(c, (w, h) => {
      const t = c.t; head(x, c, w, '看屋動線', '從玄關一路走到主臥（示意）');
      const { u, ox, oy } = plan(x, c, w, h, (i) => (i === 0 || i === 3 || i === 1 ? 1 : 0.4));
      const pts = ([[1.9, 7.6], [1.9, 5.5], [2.5, 2.3], [4.6, 1.5], [6, 1], [6.1, 1.6], [7.8, 1.9], [8.6, 2]] as [number, number][]).map(([a, b]) => [ox + a * u, oy + b * u] as [number, number]);
      const p = inout(seg(t, 0.4, 3.4)), pp = partial(pts, p);
      stroke(x, pts, 8, alpha('#e85d3a', 0.25), [4, 18]); stroke(x, pp, 12, '#e85d3a', [4, 18]);
      const [hx, hy] = pp[pp.length - 1]; person(x, hx, hy + 30, 90, '#2f6db5');
      [[2.5, 2.3, '1'], [6, 1, '2'], [8.6, 2, '3']].forEach(([a, b, n], i) => { const q = back(seg(t, 0.9 + i * 1.1, 1.2 + i * 1.1)); pop(x, ox + (a as number) * u, oy + (b as number) * u - 70, q, () => { circle(x, ox + (a as number) * u, oy + (b as number) * u - 70, 34, INK); T(x, n as string, ox + (a as number) * u, oy + (b as number) * u - 68, 40, WHITE); }); });
    }) },
  };
  void line; void cnt;
  return R;
};
