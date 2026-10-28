// 第 4 包：捷運站牌與通勤（10）。路線顏色可用，不放任何營運單位 Logo；站名、時間皆示意。
import type { XC, XFx, XK } from './kit';

export const xp04 = (K: XK) => {
  const { clamp, ease, inout, back, seg, box, poly, circle, ring, line, T, pop, fade, clip, house, pill, tw, shade, alpha, INK, WHITE, cnt, stroke, partial, arrow, arrowHead, burst, train, car, person, lerp, tower, tree } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const BL = '#0070bd', RD = '#e3002c', GN = '#008659', OR = '#f8b61c', BR = '#c48c31';
  const badge = (x: X, X0: number, Y: number, s: number, col: string, code: string) => { box(x, X0 - s, Y - s * 0.62, s * 2, s * 1.24, s * 0.3, col); box(x, X0 - s * 0.82, Y - s * 0.46, s * 1.64, s * 0.92, s * 0.2, WHITE); T(x, code, X0, Y + s * 0.03, s * 0.62, col, 'center', 900); };
  const R: Record<string, XFx> = {
    'mt-sign': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cy = h * 0.45, sw = c.land ? 1440 : 900, sh = c.land ? 420 : 560, X0 = (w - sw) / 2, col = c.ac === '#ff6b35' ? BL : c.ac;
      const q = ease(seg(t, 0, 0.7));
      clip(x, () => x.rect(0, cy - sh / 2 - 30, w, sh + 60), () => {
        x.save(); x.translate(0, (1 - q) * -sh * 1.2);
        box(x, X0, cy - sh / 2 + 16, sw, sh, 28, '#0b0f17'); box(x, X0, cy - sh / 2, sw, sh, 28, '#f4f6f8');
        box(x, X0, cy - sh / 2, sw, 46, 0, col); box(x, X0, cy - sh / 2, sw, 46, 0, col);
        x.restore();
      });
      const q2 = ease(seg(t, 0.6, 1.1));
      fade(x, q2, () => {
        const bx = c.land ? X0 + 200 : w / 2, by = c.land ? cy + 10 : cy - 90;
        pop(x, bx, by, back(seg(t, 0.6, 1.0)), () => badge(x, bx, by, c.land ? 110 : 100, col, c.v(0, 'BL12')));
        const tx = c.land ? X0 + 380 : w / 2, al: CanvasTextAlign = c.land ? 'left' : 'center';
        T(x, c.title('台北車站'), tx, c.land ? cy - 40 : cy + 80, c.land ? 150 : 130, INK, al, 900, c.land ? sw - 420 : sw - 80);
        T(x, c.sub('Taipei Main Station'), tx, c.land ? cy + 90 : cy + 190, 54, '#5d6772', al, 700, c.land ? sw - 420 : sw - 80);
      });
      // 下方前後站
      const fq = ease(seg(t, 1.1, 1.6));
      fade(x, fq, () => {
        const y = cy + sh / 2 + 90;
        arrowHead(x, X0 + 20, y, Math.PI, 30, alpha(c.fg, 0.8)); T(x, c.s(0, '善導寺'), X0 + 60, y, 50, c.fg, 'left', 900);
        arrowHead(x, X0 + sw - 20, y, 0, 30, alpha(c.fg, 0.8)); T(x, c.s(1, '西門'), X0 + sw - 60, y, 50, c.fg, 'right', 900);
      });
    }) },
    'mt-door': { bg: '#2a3442', d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, top = c.land ? 120 : 260, dh = c.land ? 700 : 900, dw = c.land ? 520 : 400;
      box(x, -500, top + dh, w + 1000, 500, 0, '#9aa4ae'); box(x, -500, top + dh, w + 1000, 26, 0, OR);
      for (let i = -6; i < 16; i++) box(x, i * 130, top + dh + 60, 60, 16, 4, '#c9d1d9');
      box(x, -500, top - 120, w + 1000, 120, 0, '#3d4a5c');
      const open = inout(seg(t, 1.6, 2.4));
      // 車廂
      box(x, cx - dw - 40, top, dw * 2 + 80, dh, 20, '#dfe5ea');
      box(x, cx - dw, top + 40, dw * 2, dh - 40, 10, INK);
      clip(x, () => x.rect(cx - dw, top + 40, dw * 2, dh - 40), () => { person(x, cx - 100, top + dh, 220, '#5bc0eb'); person(x, cx + 140, top + dh, 200, c.ac); });
      [-1, 1].forEach((sd) => {
        const X0 = sd < 0 ? cx - dw - open * dw * 0.92 : cx + open * dw * 0.92;
        box(x, X0, top + 40, dw, dh - 40, 8, '#c9d1d9');
        box(x, X0 + dw * 0.18, top + 110, dw * 0.64, dh * 0.42, 14, '#8fb6d3');
        box(x, X0 + dw * 0.18, top + 110, dw * 0.2, dh * 0.42, 14, alpha(WHITE, 0.35));
        box(x, sd < 0 ? X0 + dw - 14 : X0, top + 40, 14, dh - 40, 0, '#9aa4ae');
      });
      // 門燈：關門前閃紅、開門時亮綠
      const blink = t < 1.6 ? (Math.floor(t * 4) % 2 ? 1 : 0.25) : 1, lc = t < 1.6 ? RD : '#3aa04a';
      [-1, 1].forEach((sd) => { circle(x, cx + sd * (dw + 80), top + 60, 36, '#1d2433'); circle(x, cx + sd * (dw + 80), top + 60, 24, alpha(lc, blink)); });
      T(x, c.title(t < 1.6 ? '列車進站' : '開門 請小心月台間隙'), cx, top - 60, 56, OR, 'center', 900, w - 80);
      fade(x, seg(t, 2.4, 2.8), () => pill(x, c.sub('第 2 車廂 · 無障礙'), cx, top + dh + 160, 40, WHITE, INK));
    }) },
    'mt-arrive': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, X0 = 70, Wd = w - 140, top = c.land ? 120 : 200, bh = c.land ? 420 : 560;
      box(x, X0, top, Wd, bh, 30, '#0b0f17'); box(x, X0, top, Wd, 90, 30, '#232936'); box(x, X0, top + 60, Wd, 30, 0, '#232936');
      T(x, c.title('往 南港展覽館'), X0 + 40, top + 46, 52, OR, 'left', 900, Wd - 300);
      T(x, 'To Nangang Exhibition Center', X0 + Wd - 40, top + 46, 30, alpha(WHITE, 0.6), 'right', 700, 520);
      const mins = Math.max(0, 3 - Math.floor(seg(t, 0.4, 2.8) * 3));
      const rows = [[c.s(0, '本班車'), mins === 0 ? '進站中' : `${mins} 分`], [c.s(1, '下一班'), `${mins + 6} 分`]];
      rows.forEach(([a, b], i) => {
        const y = top + 170 + i * (bh - 200) / 1.6;
        T(x, a, X0 + 50, y, c.land ? 70 : 60, WHITE, 'left', 900);
        const fl = mins === 0 && i === 0 ? (Math.floor(t * 3) % 2 ? 1 : 0.4) : 1;
        fade(x, fl, () => T(x, b, X0 + Wd - 50, y, c.land ? 96 : 80, i === 0 ? '#7fdc8a' : WHITE, 'right', 900));
      });
      // 月台與進站列車
      const py = top + bh + (c.land ? 250 : 420);
      box(x, -200, py + 60, w + 400, 300, 0, '#3d4a5c'); box(x, -200, py + 60, w + 400, 16, 0, OR);
      const tx = lerp(w + 900, w * 0.42, ease(seg(t, 2.0, 3.4)));
      for (let k = 0; k < 3; k++) { const X1 = tx + k * 640 - 320; box(x, X1, py - 200, 620, 240, 40, '#e9eef3'); box(x, X1, py - 30, 620, 24, 0, c.ac === '#ff6b35' ? BL : c.ac); for (let j = 0; j < 4; j++) box(x, X1 + 40 + j * 145, py - 160, 110, 90, 14, '#8fb6d3'); }
      line(x, -200, py + 52, w + 400, py + 52, 8, '#1d2433');
    }) },
    'mt-line': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, sts = ['頂埔', '永寧', '土城', '海山', '亞東醫院', '府中', '板橋', '新埔'].map((d, i) => c.s(i, d)), n = sts.length, col = c.ac === '#ff6b35' ? BL : c.ac;
      T(x, c.title('板南線 · 往台北'), 80, 110, 66, c.fg, 'left');
      const V = !c.land, A = V ? 260 : 120, B = V ? h - 120 : w - 120, cy = V ? 220 : h * 0.55;
      const pos = (i: number) => A + (B - A) * i / (n - 1);
      if (V) box(x, cy - 18, A, 36, (B - A) * ease(seg(t, 0, 0.8)), 18, alpha(col, 0.3)); else box(x, A, cy - 18, (B - A) * ease(seg(t, 0, 0.8)), 36, 18, alpha(col, 0.3));
      const p = ease(seg(t, 0.8, 3.2)), lit = p * (n - 1);
      if (V) box(x, cy - 18, A, 36, (B - A) * p, 18, col); else box(x, A, cy - 18, (B - A) * p, 36, 18, col);
      sts.forEach((s, i) => {
        const P0 = pos(i), on = lit >= i - 0.01, q = back(seg(t, 0.2 + i * 0.06, 0.5 + i * 0.06));
        const [px, py] = V ? [cy, P0] : [P0, cy];
        pop(x, px, py, q * (on && lit - i < 0.4 && lit - i >= 0 ? 1.25 : 1), () => { circle(x, px, py, 34, on ? WHITE : '#2b3240'); circle(x, px, py, 20, on ? col : alpha(c.fg, 0.3)); });
        if (V) T(x, s, cy + 70, P0, 52, on ? c.fg : alpha(c.fg, 0.45), 'left', 900, w - cy - 120);
        else { K.rot(x, P0, cy + 70, -0.5, () => T(x, s, P0, cy + 90, 44, on ? c.fg : alpha(c.fg, 0.45), 'right', 900)); }
      });
      const hp = A + (B - A) * p, [hx, hy] = V ? [cy, hp] : [hp, cy];
      pop(x, hx, hy, 1, () => { K.rot(x, hx, hy, V ? Math.PI / 2 : 0, () => train(x, hx, hy - 80, 60, OR)); });
    }) },
    'mt-transfer': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, cy = c.land ? h * 0.42 : h * 0.36, L = c.land ? 700 : 440;
      const p1 = ease(seg(t, 0, 0.9)), p2 = ease(seg(t, 0.4, 1.3));
      stroke(x, partial([[cx - L, cy], [cx + L, cy]], p1), 44, BL);
      stroke(x, partial([[cx - L * 0.6, cy - L * 0.6], [cx, cy], [cx, cy + L * 0.75]], p2), 44, RD);
      [[-0.66, 0], [-0.33, 0], [0.33, 0], [0.66, 0]].forEach(([k], i) => circle(x, cx + L * k, cy, 18 * back(seg(t, 0.6 + i * 0.1, 0.9 + i * 0.1)), WHITE));
      const q = back(seg(t, 1.2, 1.6)), pulse = 1 + 0.06 * Math.sin(t * 5) * seg(t, 1.6, 1.8);
      pop(x, cx, cy, q * pulse, () => { circle(x, cx, cy, 70, WHITE); ring(x, cx, cy, 58, 16, INK); ring(x, cx, cy, 36, 10, INK); });
      fade(x, seg(t, 1.3, 1.7), () => T(x, c.title('台北車站'), cx + 90, cy - 80, 56, c.fg, 'left', 900));
      // 指示牌
      const sy = c.land ? h * 0.78 : h * 0.72, sw = c.land ? 1100 : 860;
      pop(x, cx, sy, back(seg(t, 1.8, 2.3)), () => {
        box(x, cx - sw / 2, sy - 110, sw, 220, 26, '#f4f6f8');
        box(x, cx - sw / 2 + 30, sy - 70, 140, 140, 24, RD); T(x, 'R', cx - sw / 2 + 100, sy + 4, 90, WHITE);
        T(x, c.s(0, '轉乘 淡水信義線'), cx - sw / 2 + 200, sy - 22, 62, INK, 'left', 900, sw - 360);
        T(x, c.sub('Transfer to Tamsui–Xinyi Line'), cx - sw / 2 + 200, sy + 50, 32, '#5d6772', 'left', 700, sw - 360);
        const ax = cx + sw / 2 - 90 + Math.sin(t * 4) * 10; arrowHead(x, ax + 20, sy, 0, 50, INK); box(x, ax - 50, sy - 12, 60, 24, 6, INK);
      });
    }) },
    'mt-walk': { bg: '#efe6d8', d: (x, c) => stage(c, (w, h) => {
      const t = c.t;
      for (let i = -2; i < 14; i++) { x.fillStyle = '#ffffff'; x.fillRect(i * 170, -200, 30, h + 400); x.fillRect(-200, i * 170, w + 400, 30); }
      for (let i = -1; i < 12; i++) for (let k = -1; k < 12; k++) box(x, i * 170 + 44, k * 170 + 44, 112, 112, 12, ['#d9eccf', '#f3dcc0', '#e3dccf'][(i * 3 + k * 2 + 9) % 3]);
      const pts: [number, number][] = c.land ? [[200, 760], [200, 520], [710, 520], [710, 350], [1220, 350], [1220, 210]] : [[200, 1250], [200, 880], [540, 880], [540, 540], [800, 540], [800, 300]];
      const p = ease(seg(t, 0.5, 3.0));
      stroke(x, pts, 12, alpha(INK, 0.15), [4, 24]);
      // 腳印
      const cum = partial(pts, p);
      const all: [number, number][] = []; for (let i = 0; i <= 40; i++) { const o = partial(pts, i / 40); all.push(o[o.length - 1]); }
      all.forEach(([px, py], i) => { if (i / 40 > p) return; const a = i > 0 ? Math.atan2(py - all[i - 1][1], px - all[i - 1][0]) : -Math.PI / 2; const off = i % 2 ? 14 : -14; K.rot(x, px - Math.sin(a) * off, py + Math.cos(a) * off, a + Math.PI / 2, () => { x.fillStyle = INK; x.beginPath(); x.ellipse(px - Math.sin(a) * off, py + Math.cos(a) * off, 9, 15, 0, 0, K.TAU); x.fill(); }); });
      void cum;
      const [sx, sy] = pts[0], [ex, ey] = pts[pts.length - 1];
      pop(x, sx, sy, back(seg(t, 0, 0.4)), () => { circle(x, sx, sy, 56, c.ac === '#ff6b35' ? BL : c.ac); T(x, 'M', sx, sy + 3, 56, WHITE); });
      pop(x, ex, ey, back(seg(t, 2.8, 3.2)), () => house(x, ex, ey + 40, 150, WHITE, c.ac));
      const mins = Math.round(+c.v(0, '6') * clamp(p));
      const bx = c.land ? 1500 : w / 2, by = c.land ? 700 : 1360;
      pop(x, bx, by, back(seg(t, 0.3, 0.7)), () => { box(x, bx - 220, by - 70, 440, 140, 70, INK); T(x, `步行 ${mins} 分`, bx, by + 2, 64, WHITE); });
      fade(x, seg(t, 3, 3.4), () => T(x, c.sub('約 450 公尺（示意）'), bx, by + 110, 40, INK, 'center', 700));
    }) },
    'mt-new': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, col = c.ac2;
      T(x, c.title('規劃中 · 新路線'), 80, 110, 66, c.fg, 'left');
      fade(x, seg(t, 0.2, 0.6), () => T(x, c.sub('預計 2031 年通車（示意）'), 80, 190, 38, alpha(c.fg, 0.55), 'left', 700));
      const pts: [number, number][] = c.land ? [[140, 520], [480, 520], [700, 360], [1100, 360], [1300, 640], [1580, 640]] : [[160, 1350], [160, 1000], [420, 820], [420, 560], [760, 400], [760, 300]];
      const old: [number, number][] = c.land ? [[140, 820], [1580, 820]] : [[60, 700], [940, 700]];
      stroke(x, old, 30, alpha(BL, 0.6));
      const p = ease(seg(t, 0.4, 2.2)), solid = ease(seg(t, 2.6, 3.4));
      stroke(x, partial(pts, p), 30, alpha(col, 0.9), [40, 26]);
      if (solid > 0) stroke(x, partial(pts, solid), 30, col);
      pts.forEach(([px, py], i) => { const q = back(seg(t, 0.5 + i * 0.3, 0.8 + i * 0.3)); pop(x, px, py, q, () => { circle(x, px, py, 30, WHITE); circle(x, px, py, 16, col); }); fade(x, q, () => T(x, c.s(i, ['Y01', 'Y02', 'Y03', 'Y04', 'Y05', 'Y06'][i]), px + 44, py - 40, 36, c.fg, 'left', 700)); });
      const ip = (c.land ? [480, 520] : [160, 700]) as [number, number];
      void ip;
      pop(x, c.land ? 1300 : 420, c.land ? 640 : 820, back(seg(t, 3.3, 3.7)), () => pill(x, '轉乘站', c.land ? 1300 : 420, (c.land ? 640 : 820) + 80, 34, BL, WHITE));
    }) },
    'mt-race': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, lanes = [[c.s(0, '捷運'), +c.v(0, '28'), BL], [c.s(1, '公車'), +c.v(1, '46'), '#3aa04a'], [c.s(2, '開車'), +c.v(2, '39'), c.ac]] as [string, number, string][];
      T(x, c.title('板橋 → 信義 通勤賽跑'), 80, 110, 64, c.fg, 'left', 900, w - 160);
      fade(x, seg(t, 0.2, 0.5), () => T(x, c.sub('尖峰時段（示意）'), 80, 185, 38, alpha(c.fg, 0.55), 'left', 700));
      const L = c.land ? 300 : 80, Rr = w - 120, top = c.land ? 340 : 400, gap = c.land ? 190 : 330, mx = Math.max(...lanes.map((l) => l[1]));
      const tt = seg(t, 0.6, 3.6) * mx;
      line(x, Rr, top - 120, Rr, top + gap * 2 + 100, 8, alpha(c.fg, 0.4));
      for (let k = 0; k < 6; k++) { box(x, Rr + 10, top - 120 + k * ((gap * 2 + 220) / 6), 24, (gap * 2 + 220) / 12, 0, k % 2 ? WHITE : INK); }
      lanes.forEach(([n, m, col], i) => {
        const y = top + i * gap, p = clamp(tt / m), X1 = lerp(L, Rr - 80, ease(p));
        T(x, n, c.land ? L - 30 : L, c.land ? y : y - 90, 56, c.fg, c.land ? 'right' : 'left', 900);
        box(x, L, y + 34, Rr - L, 10, 5, alpha(c.fg, 0.15)); box(x, L, y + 34, X1 - L, 10, 5, col);
        const bob = p < 1 ? Math.sin(t * 16 + i) * 4 : 0;
        if (i === 0) train(x, X1, y - 40 + bob, 90, col); else if (i === 1) { box(x, X1 - 70, y - 70 + bob, 140, 90, 18, col); box(x, X1 - 55, y - 55 + bob, 110, 34, 8, '#cfe3ee'); circle(x, X1 - 40, y + 22, 14, INK); circle(x, X1 + 40, y + 22, 14, INK); } else car(x, X1, y + 10 + bob, 90, col);
        if (p >= 1) pop(x, Rr - 80, y - 110, back(seg(tt, m, m + mx * 0.12)), () => pill(x, `${m} 分`, Rr - 40, y - 110, 40, i === 0 ? c.ac2 : '#2b3240', i === 0 ? INK : WHITE, 'right'));
      });
    }) },
    'mt-exit': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, cy = c.land ? h * 0.36 : h * 0.3, sw = c.land ? 1300 : 880;
      const q = back(seg(t, 0, 0.6));
      pop(x, cx, cy, q, () => {
        box(x, cx - sw / 2, cy - 140, sw, 280, 26, OR);
        box(x, cx - sw / 2 + 30, cy - 100, 200, 200, 30, INK); T(x, c.v(0, '3'), cx - sw / 2 + 130, cy + 6, 150, OR);
        T(x, c.title('出口'), cx - sw / 2 + 280, cy - 30, 90, INK, 'left', 900); T(x, 'EXIT', cx - sw / 2 + 280, cy + 60, 46, alpha(INK, 0.7), 'left', 900);
        const ax = cx + sw / 2 - 120 + Math.sin(t * 4) * 12; box(x, ax - 60, cy - 16, 90, 32, 8, INK); arrowHead(x, ax + 40, cy, 0, 64, INK);
      });
      const L = c.land ? cx - sw / 2 + 40 : 120;
      [[c.s(0, '市政府轉運站'), '🚌'], [c.s(1, '信義商圈'), '🛍'], [c.s(2, '新光三越 A8'), '🏬']].forEach(([s], i) => {
        const y = cy + (c.land ? 260 : 300) + i * (c.land ? 120 : 150), qq = ease(seg(t, 0.7 + i * 0.2, 1.1 + i * 0.2));
        fade(x, qq, () => { box(x, L + (1 - qq) * 40, y - 46, 92, 92, 20, i === 0 ? BL : i === 1 ? c.ac : '#3aa04a'); T(x, String(i + 1), L + 46 + (1 - qq) * 40, y + 2, 50, WHITE); T(x, s, L + 130 + (1 - qq) * 40, y, 58, c.fg, 'left', 900, w - L - 200); });
      });
    }) },
    'mt-cabin': { bg: '#0b0f17', d: (x, c) => stage(c, (w, h) => {
      const t = c.t, sts = ['善導寺', '台北車站', '西門', '龍山寺', '江子翠'].map((d, i) => c.s(i, d)), cur = 1, col = c.ac === '#ff6b35' ? BL : c.ac;
      const X0 = 60, Wd = w - 120, top = c.land ? 140 : 260, bh = c.land ? 640 : 900;
      box(x, X0, top, Wd, bh, 30, '#1b2230');
      box(x, X0 + 20, top + 20, Wd - 40, 140, 20, '#0b0f17');
      const msg = c.title('下一站 台北車站 · Next: Taipei Main'), sc = (t * 220) % (tw(x, msg, 64) + Wd);
      clip(x, () => x.rect(X0 + 30, top + 30, Wd - 60, 120), () => T(x, msg, X0 + Wd - sc, top + 92, 64, OR, 'left', 900));
      const A = X0 + 120, B = X0 + Wd - 120, y = top + (c.land ? 420 : 380), n = sts.length;
      box(x, A, y - 14, B - A, 28, 14, alpha(col, 0.35)); box(x, A, y - 14, (B - A) * (cur / (n - 1)), 28, 14, '#556070');
      sts.forEach((s, i) => {
        const X1 = A + (B - A) * i / (n - 1), now = i === cur, past = i < cur, bl = now ? (Math.floor(t * 2.5) % 2 ? 1 : 0.35) : 1;
        fade(x, bl, () => { circle(x, X1, y, now ? 34 : 24, now ? '#e5484d' : past ? '#556070' : col); });
        if (c.land) T(x, s, X1, y + 90, 46, past ? '#556070' : WHITE, 'center', 900, (B - A) / (n - 1) - 20);
        else K.rot(x, X1, y + 60, -0.9, () => T(x, s, X1, y + 60, 44, past ? '#556070' : WHITE, 'right', 900));
      });
      const ax = A + (B - A) * (cur + 0.5) / (n - 1) + Math.sin(t * 4) * 8; arrowHead(x, ax, y - 70, 0, 30, OR);
      fade(x, seg(t, 0.5, 1), () => pill(x, c.sub('右側開門'), X0 + Wd / 2, top + bh - 90, 44, '#3aa04a', WHITE));
    }) },
  };
  void ring; void cnt; void arrow; void burst; void tower; void tree; void poly;
  return R;
};
