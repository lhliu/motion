// 第 3 包：實價登錄與價格 UI（10）。網站色調；數字一律示意。
import type { XC, XFx, XK } from './kit';

export const xp03 = (K: XK) => {
  const { clamp, ease, back, seg, box, poly, circle, line, T, pop, fade, clip, house, pill, tw, shade, alpha, INK, WHITE, cnt, stroke, partial, arrowHead, burst, star, rot, coin, car, tower } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const head = (x: X, c: XC, t: number, title: string, sub: string, L = 80, Y = 110) => {
    const q = ease(seg(t, 0, 0.5));
    fade(x, q, () => { T(x, title, L, Y + (1 - q) * 20, 72, c.fg, 'left', 900, 1500); if (sub) T(x, sub, L, Y + 76, 38, alpha(c.fg, 0.55), 'left', 700, 1500); });
  };
  const GREEN = '#3aa04a', RED = '#e5484d';
  const R: Record<string, XFx> = {
    'pr-list': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t;
      head(x, c, t, c.title('實價登錄 · 近期成交'), c.sub('板橋區 · 電梯大樓（示意資料）'));
      const rows = [['115/09', '文化路一段', '1,688', '58.2', '29.0'], ['115/08', '縣民大道二段', '2,350', '62.5', '37.6'], ['115/08', '中山路一段', '1,420', '55.1', '25.8'], ['115/07', '民生路三段', '1,980', '60.3', '32.8'], ['115/07', '府中路', '3,120', '71.8', '43.5']];
      const cols = c.land ? [['日期', 80, 'left'], ['地址', 300, 'left'], ['總價(萬)', 1000, 'right'], ['單價(萬/坪)', 1310, 'right'], ['坪數', 1620, 'right']] : [['地址', 80, 'left'], ['總價', 640, 'right'], ['單價', 920, 'right']];
      const top = c.land ? 280 : 300, rh = c.land ? 118 : 200;
      box(x, 50, top - 50, w - 100, 80, 16, alpha(c.fg, 0.08));
      cols.forEach(([n, X0, al]) => T(x, String(n), Number(X0), top - 10, 34, alpha(c.fg, 0.6), al as CanvasTextAlign, 700));
      rows.forEach((r, i) => {
        const q = ease(seg(t, 0.4 + i * 0.25, 0.8 + i * 0.25)), y = top + 70 + i * rh + rh / 2, hl = i === 4 && t > 2.4;
        fade(x, q, () => {
          x.save(); x.translate((1 - q) * 80, 0);
          box(x, 50, y - rh / 2 + 8, w - 100, rh - 16, 18, hl ? alpha(c.ac, 0.22) : i % 2 ? alpha(c.fg, 0.04) : 'rgba(0,0,0,0)');
          if (c.land) {
            T(x, r[0], 80, y, 40, alpha(c.fg, 0.7), 'left', 700); T(x, r[1] + ' **號', 300, y, 46, c.fg, 'left', 900);
            T(x, cnt(r[2], seg(t, 0.5 + i * 0.25, 1.1 + i * 0.25)), 1000, y, 52, c.fg, 'right'); T(x, cnt(r[3], seg(t, 0.5 + i * 0.25, 1.1 + i * 0.25)), 1310, y, 52, hl ? c.ac : c.ac2, 'right'); T(x, r[4], 1620, y, 44, alpha(c.fg, 0.7), 'right', 700);
          } else {
            T(x, r[1], 80, y - 28, 46, c.fg, 'left', 900, 420); T(x, r[0] + ' · ' + r[4] + ' 坪', 80, y + 36, 34, alpha(c.fg, 0.55), 'left', 700);
            T(x, cnt(r[2], seg(t, 0.5 + i * 0.25, 1.1 + i * 0.25)) + '萬', 640, y, 50, c.fg, 'right'); T(x, cnt(r[3], seg(t, 0.5 + i * 0.25, 1.1 + i * 0.25)), 920, y, 50, hl ? c.ac : c.ac2, 'right');
          }
          x.restore();
        });
      });
      const hq = back(seg(t, 2.4, 2.8)); if (hq > 0) pop(x, w - 120, top + 70 + 4 * rh, hq, () => pill(x, '最高', w - 70, top + 70 + 4 * rh + 6, 32, c.ac, WHITE, 'right'));
      K.demo(x, w + 20, h + 10);
    }) },
    'pr-unit': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, v = c.v(0, '68.5'), cx = w / 2, cy = h * 0.46;
      head(x, c, t, c.title('信義區平均單價'), c.sub('電梯大樓 · 近 6 個月（示意）'));
      // 滾輪數字：每一位獨立往上滾
      const chars = v.split(''), fs = c.land ? 300 : 260, cw = fs * 0.62;
      const total = chars.reduce((a, ch) => a + (ch === '.' ? cw * 0.4 : cw), 0);
      let X0 = cx - total / 2 - 120;
      chars.forEach((ch, i) => {
        const wv = ch === '.' ? cw * 0.4 : cw;
        if (ch === '.') { T(x, '.', X0 + wv / 2, cy + fs * 0.1, fs, c.fg); X0 += wv; return; }
        const d = parseInt(ch), p = ease(seg(t, 0.3 + i * 0.12, 1.6 + i * 0.12)), roll = (d + 10 * (2 + i)) * p, base = Math.floor(roll), f = roll - base;
        box(x, X0 + 6, cy - fs * 0.62, wv - 12, fs * 1.24, 24, '#232936');
        clip(x, () => x.rect(X0, cy - fs * 0.6, wv, fs * 1.2), () => { [0, 1].forEach((k) => T(x, String((base + k) % 10), X0 + wv / 2, cy - (f - k) * fs * 1.1 * -1 * -1 + 0 - (k === 1 ? -fs * 1.1 : 0) * 0 + (k - f) * fs * 1.1 * 0 + (k ? fs * 1.1 * (1 - f) : -f * fs * 1.1), fs, c.fg)); });
        box(x, X0 + 6, cy - 3, wv - 12, 6, 3, alpha(INK, 0.6));
        X0 += wv;
      });
      fade(x, seg(t, 1.6, 2), () => { T(x, '萬', X0 + 30, cy - 30, 90, c.ac2, 'left'); T(x, '/坪', X0 + 30, cy + 70, 60, alpha(c.fg, 0.6), 'left'); });
      const q = back(seg(t, 2.0, 2.4));
      pop(x, cx, cy + fs * 0.95, q, () => { const pw = pill(x, '▲ 比去年 +6.8%', cx, cy + fs * 0.95, 46, alpha(GREEN, 0.25), '#7fdc8a'); void pw; });
      K.demo(x, w + 20, h + 10);
    }) },
    'pr-split': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, parts = [[c.s(0, '土地'), +c.v(0, '1120'), c.ac], [c.s(1, '建物'), +c.v(1, '560'), c.ac2], [c.s(2, '車位'), +c.v(2, '220'), '#5bc0eb']] as [string, number, string][];
      const sum = parts.reduce((a, p) => a + p[1], 0);
      head(x, c, t, c.title('總價怎麼拆'), c.sub('一戶 1,900 萬拆成三塊（示意）'));
      const L = 80, Wd = w - 160, top = c.land ? 330 : 380, bh = c.land ? 170 : 200;
      T(x, cnt(sum.toLocaleString('en-US'), seg(t, 0.3, 1.2)) + ' 萬', w - 80, top - 60, 64, c.fg, 'right', 900);
      let acc = 0;
      parts.forEach(([n, v, col], i) => {
        const a = acc; acc += v; const q = ease(seg(t, 0.8 + i * 0.45, 1.4 + i * 0.45));
        const X0 = L + Wd * (a / sum), ww = Wd * (v / sum) * q;
        box(x, X0 + 4, top, Math.max(0, ww - 8), bh, 18, col);
        if (q > 0.6) T(x, Math.round(v / sum * 100) + '%', X0 + Wd * (v / sum) / 2, top + bh / 2, c.land ? 64 : 52, K.on(col), 'center', 900);
        // 標註
        const lx = c.land ? X0 + Wd * (v / sum) / 2 : L, ly = c.land ? top + bh + 120 : top + bh + 110 + i * 150;
        fade(x, seg(t, 1.2 + i * 0.45, 1.6 + i * 0.45), () => {
          if (c.land) line(x, lx, top + bh + 10, lx, ly - 60, 4, alpha(c.fg, 0.3));
          box(x, c.land ? lx - 18 : lx, ly - 18, 36, 36, 8, col);
          T(x, n, c.land ? lx : lx + 60, c.land ? ly + 50 : ly, 54, c.fg, c.land ? 'center' : 'left', 900);
          T(x, cnt(v.toLocaleString('en-US'), seg(t, 1.2 + i * 0.45, 1.9 + i * 0.45)) + ' 萬', c.land ? lx : w - 80, c.land ? ly + 120 : ly, 50, alpha(c.fg, 0.75), c.land ? 'center' : 'right', 700);
        });
      });
      const ic = [() => K.tree(x, 0, 0, 90), () => tower(x, -30, 0, 60, 100, '#5bc0eb'), () => car(x, 0, -10, 45, '#5bc0eb')]; void ic;
      K.demo(x, w + 20, h + 10);
    }) },
    'pr-flip': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, from = c.v(0, '1,580'), to = c.v(1, '1,688'), cy = h * 0.47;
      head(x, c, t, c.title('成交價揭曉'), c.sub('開價 1,580 萬 → 成交（示意）'));
      const s = to.padStart(Math.max(to.length, from.length)), f = from.padStart(s.length), fs = c.land ? 260 : 190, cw = fs * 0.78;
      const tot = s.length * (cw + 14), X0 = w / 2 - tot / 2 - (c.land ? 100 : 70);
      s.split('').forEach((ch, i) => {
        const X1 = X0 + i * (cw + 14), p = seg(t, 1.0 + i * 0.18, 1.45 + i * 0.18), a = f[i], b = ch;
        if (ch === ',') { T(x, ',', X1 + cw / 2, cy + fs * 0.3, fs, c.fg); return; }
        const top = cy - fs * 0.6, H2 = fs * 0.6;
        const card = (k: string, half: 0 | 1, sy = 1) => {
          clip(x, () => x.rect(X1, half ? cy : top, cw, H2), () => { pop(x, X1 + cw / 2, cy, 1, () => { box(x, X1, top, cw, H2 * 2, 18, half ? '#2b3240' : '#323a4a'); T(x, k, X1 + cw / 2, cy + fs * 0.04, fs, c.fg); }, sy); });
        };
        card(p < 0.5 ? a : b, 0); card(p < 1 ? a : b, 1);
        if (p > 0 && p < 1) { if (p < 0.5) card(a, 0, 1 - p * 2); else card(b, 1, (p - 0.5) * 2); }
        box(x, X1, cy - 3, cw, 6, 0, INK);
      });
      fade(x, seg(t, 2.4, 2.8), () => T(x, '萬', X0 + tot + 30, cy, 90, c.ac2, 'left'));
      pop(x, w / 2, cy + fs * 0.95, back(seg(t, 2.6, 3)), () => pill(x, '比開價多 108 萬', w / 2, cy + fs * 0.95, 44, c.ac, WHITE));
      K.demo(x, w + 20, h + 10);
    }) },
    'pr-change': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, v = c.v(0, '+8.2'), up = !v.startsWith('-'), col = up ? RED : GREEN;
      head(x, c, t, c.title('新北房價年增率'), c.sub('2025 → 2026（示意；台灣漲為紅）'));
      const cx = c.land ? 520 : w / 2, cy = c.land ? h * 0.55 : h * 0.4;
      const q = back(seg(t, 0.3, 0.9));
      pop(x, cx, cy, q, () => {
        circle(x, cx, cy, 190, alpha(col, 0.18)); circle(x, cx, cy, 140, col);
        const dy = up ? -1 : 1, bob = Math.sin(t * 3) * 8 * seg(t, 1, 1.2);
        poly(x, [[cx, cy + dy * 80 + bob], [cx + 70, cy + bob], [cx + 26, cy + bob], [cx + 26, cy - dy * 80 + bob], [cx - 26, cy - dy * 80 + bob], [cx - 26, cy + bob], [cx - 70, cy + bob]].map(([a, b]) => [a, up ? 2 * cy - b : b]) as number[][], WHITE);
      });
      const nx = c.land ? 820 : w / 2, ny = c.land ? cy - 30 : cy + 330;
      fade(x, seg(t, 0.6, 1), () => T(x, cnt(v, seg(t, 0.6, 1.6)) + '%', nx, ny, c.land ? 260 : 220, col, c.land ? 'left' : 'center', 900));
      // 小走勢
      const pts: [number, number][] = [0.1, 0.18, 0.15, 0.3, 0.42, 0.38, 0.55, 0.62, 0.8, 0.92].map((k, i) => [(c.land ? 820 : 120) + i * (c.land ? 85 : 84), (c.land ? cy + 260 : cy + 620) - k * 160]);
      const p = ease(seg(t, 1.2, 2.4));
      stroke(x, partial(pts, p), 12, col);
      const o = partial(pts, p), e = o[o.length - 1]; if (p > 0.02) circle(x, e[0], e[1], 16, WHITE);
      K.demo(x, w + 20, h + 10);
    }) },
    'pr-bargain': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, ask = +c.v(0, '2380'), deal = +c.v(1, '2150'), low = +c.v(2, '2050');
      head(x, c, t, c.title('議價空間有多少？'), c.sub('同社區近一年行情（示意）'));
      const L = 120, Rr = w - 120, y = h * 0.52, mn = low - 100, mx = ask + 60, X = (v: number) => L + (Rr - L) * (v - mn) / (mx - mn);
      box(x, L, y - 30, (Rr - L) * ease(seg(t, 0.2, 0.9)), 60, 30, alpha(c.fg, 0.12));
      const gq = ease(seg(t, 0.9, 1.7));
      box(x, X(low), y - 30, (X(ask) - X(low)) * gq, 60, 30, `rgba(58,160,74,.85)`);
      box(x, X(deal), y - 30, (X(ask) - X(deal)) * ease(seg(t, 1.5, 2.1)), 60, 0, alpha(c.ac2, 0.9));
      const mark = (v: number, lab: string, col: string, up: boolean, d: number) => pop(x, X(v), y, back(seg(t, d, d + 0.4)), () => {
        const yy = up ? y - 150 : y + 150; line(x, X(v), y + (up ? -34 : 34), X(v), yy + (up ? 40 : -40), 5, col);
        circle(x, X(v), y, 22, col);
        pill(x, lab, X(v), yy, 38, col, K.on(col)); T(x, v.toLocaleString('en-US') + ' 萬', X(v), yy + (up ? -70 : 70), 44, c.fg, 'center', 900);
      });
      mark(ask, '開價', c.ac, true, 0.6); mark(low, '最低成交', GREEN, false, 1.0); mark(deal, '合理出價', c.ac2, true, 1.8);
      fade(x, seg(t, 2.2, 2.6), () => T(x, `議價空間約 ${Math.round((ask - deal) / ask * 100)}%`, w / 2, h - 160, 64, c.fg, 'center', 900, w - 160));
      K.demo(x, w + 20, h + 10);
    }) },
    'pr-askdeal': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, a = +c.v(0, '72.0'), d = +c.v(1, '64.8');
      head(x, c, t, c.title('開價 vs 成交'), c.sub('單價（萬/坪，示意）'));
      const base = h - 160, mxh = h * 0.5, bw = c.land ? 300 : 260, gap = c.land ? 260 : 120, x1 = w / 2 - gap / 2 - bw, x2 = w / 2 + gap / 2;
      line(x, 80, base, w - 80, base, 6, alpha(c.fg, 0.3));
      [[x1, a, c.ac, '開價', 0.3], [x2, d, '#5bc0eb', '成交', 0.7]].forEach(([X0, v, col, lab, dl]) => {
        const hh = mxh * (Number(v) / a) * ease(seg(t, Number(dl), Number(dl) + 0.8));
        box(x, Number(X0), base - hh, bw, hh, 24, String(col)); box(x, Number(X0), base - 24, bw, 24, 0, String(col));
        T(x, cnt(Number(v).toFixed(1), seg(t, Number(dl), Number(dl) + 0.8)), Number(X0) + bw / 2, base - hh - 60, 80, c.fg);
        T(x, String(lab), Number(X0) + bw / 2, base + 60, 50, alpha(c.fg, 0.7), 'center', 900);
      });
      // 差距括號
      const q = ease(seg(t, 1.6, 2.1)), ya = base - mxh, yd = base - mxh * d / a, bxp = x2 + bw + 40;
      if (q > 0) { stroke(x, [[x1 + bw + 10, ya], [bxp, ya], [bxp, ya + (yd - ya) * q], [x2 + bw * 0.5, ya + (yd - ya) * q]].slice(0, q < 1 ? 3 : 4) as [number, number][], 6, c.ac2); }
      pop(x, Math.min(bxp + 60, w - 180), (ya + yd) / 2, back(seg(t, 2.1, 2.5)), () => pill(x, `-${((a - d) / a * 100).toFixed(1)}%`, Math.min(bxp + 30, w - 230), (ya + yd) / 2, 46, c.ac2, INK, 'left'));
      K.demo(x, w + 20, h + 10);
    }) },
    'pr-tag': { bg: 'cream', d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, top = c.land ? 90 : 220;
      const drop = K.bounce(seg(t, 0, 0.9)), sw = Math.sin(t * 2.6) * 0.18 * Math.exp(-Math.max(0, t - 0.9) * 0.9);
      line(x, cx - 360, top, cx + 360, top, 10, '#a0673d');
      const L = c.land ? 520 : 620, ty = top - 600 + 600 * drop;
      rot(x, cx, top, sw, () => {
        line(x, cx, top, cx, ty + L * 0.25, 6, INK);
        const tw2 = c.land ? 520 : 600, th = c.land ? 520 : 640, y0 = ty + L * 0.25;
        poly(x, [[cx, y0 - 30], [cx + tw2 / 2, y0 + 90], [cx + tw2 / 2, y0 + th], [cx - tw2 / 2, y0 + th], [cx - tw2 / 2, y0 + 90]], shade(c.ac, -0.25));
        poly(x, [[cx, y0 - 44], [cx + tw2 / 2 - 6, y0 + 76], [cx + tw2 / 2 - 6, y0 + th - 16], [cx - tw2 / 2 + 6, y0 + th - 16], [cx - tw2 / 2 + 6, y0 + 76]], c.ac);
        circle(x, cx, y0 + 30, 24, '#fff3e2');
        T(x, c.title('特價'), cx, y0 + 160, 84, WHITE);
        house(x, cx, y0 + (c.land ? 300 : 330), c.land ? 100 : 130, WHITE, INK);
        T(x, c.v(0, '1,288') + '萬', cx, y0 + th - 140, c.land ? 110 : 120, WHITE, 'center', 900, tw2 - 60);
        T(x, c.sub('三房車位 · 示意'), cx, y0 + th - 60, 40, alpha(WHITE, 0.85), 'center', 700, tw2 - 60);
      });
      burst(x, cx, top + 560, 380, seg(t, 0.9, 1.6), c.ac2, 10, 12);
      [[-1, 0.3], [1, 0.5]].forEach(([s, d]) => star(x, cx + s * 360, top + 420 + d * 300, 40 * back(seg(t, 1.0 + d, 1.4 + d)), c.ac2));
    }) },
    'pr-formula': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, a = c.v(0, '32'), b = c.v(1, '58.5'), r = c.v(2, '1,872');
      head(x, c, t, c.title('總價這樣算'), c.sub('權狀坪數 × 單價（示意）'));
      const items = [[a, '坪', c.ac2], ['×', '', ''], [b, '萬/坪', '#5bc0eb'], ['=', '', ''], [r, '萬', c.ac]];
      const V = !c.land, cy = V ? 420 : h * 0.52;
      items.forEach(([v, u, col], i) => {
        const q = back(seg(t, 0.3 + i * 0.35, 0.7 + i * 0.35));
        const X0 = V ? w / 2 : [230, 520, 820, 1110, 1410][i], Y0 = V ? cy + i * 190 : cy;
        pop(x, X0, Y0, q, () => {
          if (!col) { T(x, v, X0, Y0, 120, alpha(c.fg, 0.6)); return; }
          const bw = V ? 620 : 300, bh = V ? 160 : 260;
          box(x, X0 - bw / 2, Y0 - bh / 2 + 12, bw, bh, 30, shade(col, -0.5)); box(x, X0 - bw / 2, Y0 - bh / 2, bw, bh, 30, col);
          T(x, i === 4 ? cnt(v, seg(t, 1.8, 2.6)) : v, X0 - (V ? 60 : 0), Y0 - (V ? 0 : 30), V ? 100 : 96, K.on(col), 'center', 900, bw - 60);
          T(x, u, V ? X0 + bw / 2 - 40 : X0, V ? Y0 + 10 : Y0 + 70, 44, alpha(K.on(col), 0.75), V ? 'right' : 'center', 700);
        });
      });
      if (seg(t, 2.6, 3.4) > 0) { const k = V ? [w / 2, cy + 4 * 190] : [1410, cy]; burst(x, k[0], k[1], V ? 380 : 220, seg(t, 2.5, 3.3), c.ac2, 10, 10); }
      K.demo(x, w + 20, h + 10);
    }) },
    'pr-rank': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, rows = [[c.s(0, '大安區'), +c.v(0, '112.4')], [c.s(1, '信義區'), +c.v(1, '98.6')], [c.s(2, '中山區'), +c.v(2, '86.3')], [c.s(3, '內湖區'), +c.v(3, '72.1')], [c.s(4, '北投區'), +c.v(4, '60.8')]] as [string, number][];
      head(x, c, t, c.title('台北單價排行'), c.sub('萬/坪 · 示意'));
      const L = c.land ? 360 : 400, top = c.land ? 280 : 330, rh = c.land ? 120 : 200, mx = rows[0][1], Wd = w - L - 200;
      const med = ['#f2b705', '#c9d1d9', '#c98d55'];
      rows.forEach(([n, v], i) => {
        const y = top + i * rh, q = ease(seg(t, 0.4 + i * 0.18, 1.2 + i * 0.18));
        fade(x, seg(t, 0.3 + i * 0.18, 0.6 + i * 0.18), () => T(x, n, L - 30, y, 56, c.fg, 'right', 900, L - 170));
        box(x, L, y - (c.land ? 38 : 50), Wd * (v / mx) * q, c.land ? 76 : 100, 20, i === 0 ? c.ac : alpha(c.fg, 0.22 + 0.1 * (4 - i) / 4));
        T(x, cnt(v.toFixed(1), q), L + Wd * (v / mx) * q + 24, y, 52, i === 0 ? c.ac : c.fg, 'left', 900);
        if (i < 3) pop(x, 90, y, back(seg(t, 1.4 + i * 0.15, 1.8 + i * 0.15)), () => { circle(x, 90, y, 42, med[i]); circle(x, 90, y, 30, shade(med[i], 0.25)); T(x, String(i + 1), 90, y + 2, 40, INK); });
        else T(x, String(i + 1), 90, y, 44, alpha(c.fg, 0.5));
      });
      K.demo(x, w + 20, h + 10);
    }) },
  };
  void clamp; void arrowHead; void coin; void star;
  return R;
};
