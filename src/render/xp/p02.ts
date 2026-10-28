// 第 2 包：章節卡與開場（10）。網站色調（深底＋主色＋輔色），播一次後輕微待機。
import type { XC, XFx, XK } from './kit';

export const xp02 = (K: XK) => {
  const { clamp, ease, inout, back, seg, box, poly, circle, ring, line, T, pop, fade, clip, house, tower, star, pill, tw, shade, alpha, INK, WHITE, TAU, check, burst } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const idle = (c: XC, a = 1) => Math.sin(c.t * 2.2) * a;
  const R: Record<string, XFx> = {
    'ch-number': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, n = c.v(0, '02'), tot = c.v(1, '05');
      const bx = c.land ? 120 : 80, by = c.land ? 200 : 360;
      const e1 = back(seg(t, 0.1, 0.7));
      // 大數字從下推上，被遮罩切掉
      clip(x, () => x.rect(bx - 20, by - 40, w, 420), () => T(x, n, bx, by + 170 + (1 - e1) * 380, 400, c.ac, 'left', 900));
      const nw = tw(x, n, 400);
      fade(x, seg(t, 0.5, 0.9), () => T(x, `/ ${tot}`, bx + nw + 30, by + 260, 110, alpha(c.fg, 0.45), 'left', 900));
      const lw = ease(seg(t, 0.7, 1.3)) * (w - bx * 2);
      box(x, bx, by + 400, lw, 14, 7, c.ac2);
      fade(x, seg(t, 1.0, 1.5), () => { T(x, c.title('看屋前要準備什麼'), bx, by + 500 + (1 - ease(seg(t, 1, 1.5))) * 30, c.land ? 96 : 88, c.fg, 'left', 900, w - bx * 2); });
      fade(x, seg(t, 1.3, 1.8), () => T(x, c.sub('CHAPTER TWO · 預算與貸款'), bx, by + 610, 44, alpha(c.fg, 0.6), 'left', 700, w - bx * 2));
      // 進度點
      const N = Math.max(2, Math.min(9, parseInt(tot) || 5)), cur = parseInt(n) || 2;
      for (let i = 0; i < N; i++) { const q = back(seg(t, 1.4 + i * 0.08, 1.8 + i * 0.08)); circle(x, bx + 18 + i * 56, by + 720, (i + 1 === cur ? 18 : 11) * q, i + 1 <= cur ? c.ac : alpha(c.fg, 0.25)); }
    }) },
    'ch-toc': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, items = ['預算怎麼抓', '地段與通勤', '屋況檢查', '議價技巧', '簽約交屋'].map((d, i) => c.s(i, d)), cur = 2;
      const L = c.land ? 140 : 90, top = c.land ? 150 : 230, gap = c.land ? 140 : 210;
      T(x, c.title('本集目錄'), L, top - 40, 72, c.fg, 'left');
      box(x, L, top + 10, 120 * ease(seg(t, 0, 0.5)), 10, 5, c.ac);
      // 左側進度條
      const bar = L + 20, y0 = top + 120, y1 = y0 + gap * 4;
      box(x, bar - 6, y0, 12, (y1 - y0) * ease(seg(t, 0.2, 1)), 6, alpha(c.fg, 0.18));
      box(x, bar - 6, y0, 12, (y0 + gap * cur - y0) * ease(seg(t, 1.6, 2.4)), 6, c.ac);
      items.forEach((s, i) => {
        const y = y0 + gap * i, q = ease(seg(t, 0.3 + i * 0.15, 0.8 + i * 0.15)), on = i === cur && t > 2.2, done = i < cur;
        circle(x, bar, y, 28 * back(seg(t, 0.3 + i * 0.15, 0.7 + i * 0.15)), on ? c.ac : done ? c.ac2 : '#2b3240');
        if (done) check(x, bar, y, 26, INK, seg(t, 1.6 + i * 0.25, 1.9 + i * 0.25)); else T(x, String(i + 1), bar, y + 2, 28, on ? WHITE : alpha(c.fg, 0.6));
        fade(x, q, () => {
          if (on) { const ww = w - bar - 90 - L; box(x, bar + 56, y - 52, ww * ease(seg(t, 2.2, 2.6)), 104, 52, alpha(c.ac, 0.2)); }
          T(x, s, bar + 90 + (1 - q) * 40, y, on ? 66 : 54, on ? c.fg : done ? alpha(c.fg, 0.5) : alpha(c.fg, 0.8), 'left', on ? 900 : 700, w - bar - 160);
          if (on) pill(x, 'NOW', w - L, y, 30, c.ac, WHITE, 'right');
        });
      });
    }) },
    'ch-three': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, items = [['房價', '三年漲了多少'], ['房貸', '月付金怎麼算'], ['地段', '捷運站差在哪']].map(([a, b], i) => [c.s(i * 2, a), c.s(i * 2 + 1, b)]);
      const cols = [c.ac, c.ac2, '#5bc0eb'];
      T(x, c.title('本集重點'), w / 2, c.land ? 110 : 160, 84, c.fg, 'center', 900, w - 100);
      fade(x, seg(t, 0.2, 0.6), () => T(x, c.sub('3 分鐘看懂'), w / 2, c.land ? 200 : 260, 44, alpha(c.fg, 0.6), 'center', 700));
      items.forEach(([a, b], i) => {
        const q = back(seg(t, 0.5 + i * 0.3, 1.0 + i * 0.3));
        const cw = c.land ? 460 : 820, ch = c.land ? 560 : 330;
        const X0 = c.land ? 120 + i * (cw + 50) : 90, Y0 = c.land ? 280 : 360 + i * (ch + 40);
        pop(x, X0 + cw / 2, Y0 + ch / 2, q, () => {
          box(x, X0, Y0 + 14, cw, ch, 36, shade(cols[i], -0.45));
          box(x, X0, Y0, cw, ch, 36, '#232936');
          box(x, X0, Y0, c.land ? cw : 180, c.land ? 200 : ch, 36, cols[i]);
          const nx = c.land ? X0 + cw / 2 : X0 + 90, ny = c.land ? Y0 + 100 : Y0 + ch / 2;
          T(x, String(i + 1), nx, ny + 4, 120, K.on(cols[i]), 'center', 900);
          const tx = c.land ? X0 + cw / 2 : X0 + 230, al = c.land ? 'center' : 'left';
          T(x, a, tx, c.land ? Y0 + 300 : Y0 + ch / 2 - 45, 76, c.fg, al as CanvasTextAlign, 900, c.land ? cw - 40 : cw - 260);
          T(x, b, tx, c.land ? Y0 + 400 : Y0 + ch / 2 + 50, 44, alpha(c.fg, 0.65), al as CanvasTextAlign, 700, c.land ? cw - 40 : cw - 260);
        });
      });
    }) },
    'ch-count': { d: (x, c) => {
      const t = c.t, cx = c.W / 2, cy = c.H / 2, n = Math.floor(t / 0.9), lab = ['3', '2', '1'];
      const ph = (t % 0.9) / 0.9;
      // 放射底紋
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + t * 0.2; poly(x, [[cx, cy], [cx + Math.cos(a) * 2000, cy + Math.sin(a) * 2000], [cx + Math.cos(a + 0.18) * 2000, cy + Math.sin(a + 0.18) * 2000]], 'rgba(255,255,255,.035)'); }
      if (n < 3) {
        const col = [c.ac, c.ac2, '#5bc0eb'][n];
        circle(x, cx, cy, 330, '#232936');
        ring(x, cx, cy, 330, 34, col, -Math.PI / 2, ph);
        pop(x, cx, cy, back(seg(ph, 0, 0.35)) * (1 + 0.04 * (1 - ph)), () => T(x, lab[n], cx, cy + 20, 420, WHITE, 'center', 900));
      } else {
        const q = back(seg(t, 2.7, 3.2));
        pop(x, cx, cy, q, () => { box(x, cx - 470, cy - 150, 940, 300, 150, c.ac); T(x, c.title('開始！'), cx, cy + 10, 170, WHITE, 'center', 900, 860); });
        burst(x, cx, cy, 560, seg(t, 2.8, 3.6), c.ac2, 14, 14);
        fade(x, seg(t, 3.1, 3.5), () => T(x, c.sub('今天看三間預售屋'), cx, cy + 260, 54, alpha(c.fg, 0.8), 'center', 700, c.W - 100));
      }
    } },
    'ch-cover': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t;
      // 斜條紋底＋天際線
      x.fillStyle = c.ac; x.fillRect(-2000, -2000, 6000, 6000);
      for (let i = -10; i < 30; i++) poly(x, [[i * 120, h + 400], [i * 120 + 60, h + 400], [i * 120 + 60 + 800, -400], [i * 120 + 800, -400]], shade(c.ac, -0.07));
      const g = ease(seg(t, 0.2, 1.2)), base = h - 40;
      const bs = c.land ? [[80, 140, 380], [240, 120, 520], [380, 160, 300], [1180, 150, 440], [1350, 130, 600], [1500, 140, 340]] : [[40, 140, 300], [200, 120, 420], [640, 150, 360], [810, 140, 480]];
      bs.forEach(([bx, bw, bh], i) => tower(x, bx, base, bw, bh * ease(seg(t, 0.2 + i * 0.08, 1 + i * 0.08)), shade(INK, 0.1 + (i % 3) * 0.06), '#3d4a5c', 1));
      box(x, -100, base, w + 200, 300, 0, INK);
      void g;
      const q = back(seg(t, 0.6, 1.2));
      pop(x, w / 2, h * 0.36, q, () => {
        box(x, w / 2 - 420, h * 0.36 - 230 + 16, 840, 460, 40, shade(INK, -0.3));
        box(x, w / 2 - 420, h * 0.36 - 230, 840, 460, 40, INK);
        pill(x, c.v(0, 'EP.12'), w / 2, h * 0.36 - 150, 40, c.ac2, INK);
        T(x, c.title('買房不踩雷'), w / 2, h * 0.36 - 20, 120, WHITE, 'center', 900, 760);
        T(x, c.sub('預售屋看屋全攻略'), w / 2, h * 0.36 + 110, 50, alpha(WHITE, 0.75), 'center', 700, 760);
      });
      const hb = Math.abs(Math.sin(c.t * 3)) * 14 * seg(t, 1.4, 1.6);
      pop(x, w / 2, base, back(seg(t, 1.0, 1.5)), () => house(x, w / 2, base - hb, 220, '#f3efe6', c.ac2));
    }) },
    'ch-hook': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, q = c.title('月薪 5 萬，真的買得起台北嗎？');
      const n = Math.floor(clamp((t - 0.7) / 1.6) * q.length), cx = w / 2;
      const qm = back(seg(t, 0, 0.6));
      const qy = c.land ? 300 : 420;
      pop(x, cx, qy, qm, () => { circle(x, cx, qy, 190, c.ac); T(x, '？', cx + 6, qy + 10, 260, WHITE, 'center', 900); });
      x.save(); x.translate(cx, qy); x.rotate(idle(c, 0.05)); x.translate(-cx, -qy); x.restore();
      [[-260, -120, 70], [250, -60, 50], [-200, 140, 40]].forEach(([dx, dy, s], i) => pop(x, cx + dx, qy + dy, back(seg(t, 0.4 + i * 0.1, 0.8 + i * 0.1)), () => T(x, '?', cx + dx, qy + dy + idle(c, 10), s, i % 2 ? c.ac2 : alpha(c.fg, 0.5), 'center', 900)));
      // 打字＋游標，兩行換行
      const s = q.slice(0, n), lines: string[] = []; let cur = '';
      for (const ch of s) { if (tw(x, cur + ch, 84) > w - 160) { lines.push(cur); cur = ch; } else cur += ch; }
      lines.push(cur);
      const ty = c.land ? 620 : 800;
      lines.forEach((l, i) => T(x, l, 80, ty + i * 110, 84, c.fg, 'left', 900));
      const last = lines[lines.length - 1];
      if (Math.floor(t * 2.5) % 2 === 0 || n < q.length) box(x, 86 + tw(x, last, 84), ty + (lines.length - 1) * 110 - 46, 10, 92, 3, c.ac2);
      fade(x, seg(t, 2.6, 3.0), () => pill(x, c.sub('看完你就知道'), 80, ty + lines.length * 110 + 60, 40, c.ac2, INK, 'left'));
    }) },
    'ch-tldr': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, L = 90, top = c.land ? 200 : 380;
      const st = seg(t, 0, 0.35), sq = st < 1 ? 1.8 - 0.8 * ease(st) : 1;
      pop(x, L + 170, top, sq, () => { K.rot(x, L + 170, top, -0.08, () => { box(x, L, top - 70, 340, 140, 20, c.ac); x.lineWidth = 8; x.strokeStyle = WHITE; rr2(x, L + 14, top - 56, 312, 112); T(x, '結論先講', L + 170, top + 4, 70, WHITE); }); });
      const lines = [c.title('現在不是不能買'), c.sub('是要挑對區、算好月付')];
      lines.forEach((s, i) => {
        const y = top + 200 + i * 140, q = ease(seg(t, 0.6 + i * 0.4, 1.1 + i * 0.4));
        const ww = tw(x, s, i ? 70 : 92);
        if (i === 1) box(x, L - 10, y + 6, (Math.min(ww, w - 2 * L) + 20) * ease(seg(t, 1.6, 2.2)), 44, 6, alpha(c.ac2, 0.85));
        fade(x, q, () => T(x, s, L + (1 - q) * 30, y, i ? 70 : 92, i ? c.fg : c.fg, 'left', 900, w - 2 * L));
      });
      const pts = [c.s(0, '首購先看月付比'), c.s(1, '捷運 10 分鐘內'), c.s(2, '屋齡 15 年內')];
      pts.forEach((s, i) => { const y = top + 520 + i * 90, q = back(seg(t, 2.0 + i * 0.2, 2.4 + i * 0.2)); pop(x, L + 30, y, q, () => { circle(x, L + 30, y, 30, c.ac2); check(x, L + 30, y, 32, INK, 1); }); fade(x, q, () => T(x, s, L + 90, y, 52, alpha(c.fg, 0.85), 'left', 700, w - L * 2 - 100)); });
    }) },
    'ch-marks': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, segs = [['00:00', '開場'], ['01:20', '預算'], ['03:45', '地段'], ['06:10', '屋況'], ['08:30', '結論']].map(([a, b], i) => [c.v(i, a), c.s(i, b)]);
      const xs = [0, 0.18, 0.42, 0.66, 0.9], p = ease(seg(t, 0.2, 2.4)), V = !c.land;
      const A = V ? 260 : 80, B = V ? h - 120 : w - 80, y = V ? 200 : h * 0.5;
      T(x, c.title('章節時間碼'), 80, V ? 130 : y - 300, 72, c.fg, 'left');
      const at = (k: number) => A + (B - A) * k;
      if (V) { box(x, y - 12, A, 24, B - A, 12, alpha(c.fg, 0.15)); box(x, y - 12, A, 24, (B - A) * p, 12, c.ac); }
      else { box(x, A, y - 12, B - A, 24, 12, alpha(c.fg, 0.15)); box(x, A, y - 12, (B - A) * p, 24, 12, c.ac); }
      segs.forEach(([tc, nm], i) => {
        const P0 = at(xs[i]), on = p >= xs[i], q = back(seg(t, 0.2 + xs[i] * 2.2, 0.5 + xs[i] * 2.2));
        if (V) {
          pop(x, y, P0, q, () => { circle(x, y, P0, 22, on ? c.ac2 : '#2b3240'); T(x, tc, y + 60, P0 - 28, 36, on ? c.ac2 : alpha(c.fg, 0.5), 'left', 700); T(x, nm, y + 60, P0 + 28, 58, on ? c.fg : alpha(c.fg, 0.5), 'left', 900, w - y - 120); });
        } else {
          const up = i % 2 === 0 ? -1 : 1, ly = y + up * 120;
          pop(x, P0, y, q, () => { line(x, P0, y + up * 20, P0, ly - up * 34, 4, alpha(c.fg, 0.3)); T(x, tc, P0, ly, 34, on ? c.ac2 : alpha(c.fg, 0.5), 'center', 700); T(x, nm, P0, ly + (up < 0 ? -50 : 50), 46, on ? c.fg : alpha(c.fg, 0.5), 'center', 900); });
        }
      });
      const hp = at(p); if (V) { circle(x, y, hp, 30, WHITE); circle(x, y, hp, 14, c.ac); } else { circle(x, hp, y, 30, WHITE); circle(x, hp, y, 14, c.ac); }
    }) },
    'ch-split': { bg: 'none', d: (x, c) => {
      const t = c.t, W = c.W, H = c.H, e = inout(seg(t, 0, 0.8));
      x.fillStyle = INK; x.fillRect(0, 0, W, H);
      if (c.land) {
        const pw = W * 0.42 * e; x.fillStyle = c.ac; x.fillRect(0, 0, pw, H);
        clip(x, () => x.rect(0, 0, pw, H), () => { T(x, c.v(0, '03'), W * 0.21, H * 0.46, 380, WHITE, 'center', 900); T(x, 'CHAPTER', W * 0.21, H * 0.74, 56, alpha(WHITE, 0.7), 'center', 900); });
        const q = ease(seg(t, 0.6, 1.2)), tx = W * 0.48;
        fade(x, q, () => { T(x, c.title('地段與通勤'), tx + (1 - q) * 60, H * 0.44, 110, WHITE, 'left', 900, W * 0.48); T(x, c.sub('捷運站 800 公尺內差多少？'), tx + (1 - q) * 90, H * 0.58, 48, c.ac2, 'left', 700, W * 0.48); });
        box(x, tx, H * 0.66, W * 0.3 * ease(seg(t, 1, 1.6)), 10, 5, alpha(WHITE, 0.3));
      } else {
        const ph = H * 0.45 * e; x.fillStyle = c.ac; x.fillRect(0, 0, W, ph);
        clip(x, () => x.rect(0, 0, W, ph), () => { T(x, c.v(0, '03'), W / 2, H * 0.24, 420, WHITE, 'center', 900); T(x, 'CHAPTER', W / 2, H * 0.4, 56, alpha(WHITE, 0.7), 'center', 900); });
        const q = ease(seg(t, 0.6, 1.2));
        fade(x, q, () => { T(x, c.title('地段與通勤'), W / 2, H * 0.56 + (1 - q) * 50, 110, WHITE, 'center', 900, W - 120); T(x, c.sub('捷運站 800 公尺內差多少？'), W / 2, H * 0.64 + (1 - q) * 70, 48, c.ac2, 'center', 700, W - 120); });
      }
      // 斜切角
      poly(x, c.land ? [[W * 0.42 * e - 2, 0], [W * 0.42 * e + 80 * e, 0], [W * 0.42 * e - 2, H]] : [[0, H * 0.45 * e - 2], [W, H * 0.45 * e - 2], [W, H * 0.45 * e + 60 * e]], c.ac);
    } },
    'ch-recap': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, cw = c.land ? 1300 : 880, chh = c.land ? 720 : 1100, X0 = cx - cw / 2, Y0 = h / 2 - chh / 2;
      const q = back(seg(t, 0, 0.6)), a = (1 - ease(seg(t, 0, 0.8))) * -0.2 + 0.02 + idle(c, 0.005);
      pop(x, cx, h / 2, q, () => K.rot(x, cx, h / 2, a, () => {
        box(x, X0 + 16, Y0 + 22, cw, chh, 30, 'rgba(0,0,0,.35)');
        box(x, X0, Y0, cw, chh, 30, '#f3efe6');
        const ih = c.land ? chh - 140 : chh * 0.45, iw = c.land ? cw * 0.45 : cw - 80;
        box(x, X0 + 40, Y0 + 40, iw, ih, 18, '#bfe3f7');
        tower(x, X0 + 80, Y0 + 40 + ih, 110, ih * 0.7, '#2f6db5', '#cfe3ee'); tower(x, X0 + 230, Y0 + 40 + ih, 90, ih * 0.5, '#5bc0eb', '#e8f4fb'); house(x, X0 + 40 + iw * 0.72, Y0 + 40 + ih, Math.min(iw * 0.4, ih * 0.6), WHITE, c.ac);
        const tx = c.land ? X0 + iw + 90 : X0 + 40, ty = c.land ? Y0 + 90 : Y0 + ih + 110;
        pill(x, '上集回顧', tx, ty, 34, c.ac, WHITE, 'left');
        T(x, c.title('新青安到底划不划算'), tx, ty + 100, 62, INK, 'left', 900, c.land ? cw - iw - 140 : cw - 80);
        [c.s(0, '寬限期 5 年'), c.s(1, '利率 1.775%'), c.s(2, '貸款上限 1000 萬')].forEach((s, i) => { const qq = ease(seg(t, 0.8 + i * 0.25, 1.2 + i * 0.25)); fade(x, qq, () => { circle(x, tx + 16, ty + 200 + i * 80, 12, c.ac2); T(x, s, tx + 46 + (1 - qq) * 20, ty + 200 + i * 80, 46, '#3d4a5c', 'left', 700, c.land ? cw - iw - 180 : cw - 120); }); });
      }));
      // 膠帶
      pop(x, cx, Y0, back(seg(t, 0.5, 0.8)), () => K.rot(x, cx, Y0, -0.05, () => box(x, cx - 130, Y0 - 30, 260, 64, 4, alpha(c.ac2, 0.85))));
      K.demo(x, w + 20, h + 20);
    }) },
  };
  const rr2 = (x: X, a: number, b: number, w: number, h: number) => { K.rr(x, a, b, w, h, 12); x.stroke(); };
  void inout; void star; void TAU;
  return R;
};
