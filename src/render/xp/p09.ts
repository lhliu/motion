// 第 9 包：片尾與 CTA（8）。站方配色；不放平台 Logo，按鈕為通用造型。
import type { XC, XFx, XK } from './kit';

export const xp09 = (K: XK) => {
  const { ease, inout, back, seg, box, slab, circle, ring, line, T, pop, fade, clip, pill, alpha, INK, WHITE, poly, house, burst, heart, star, rng, lerp, tw, person, phone, check } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const RED = '#e5484d';
  const cursor = (x: X, X0: number, Y: number, s: number) => poly(x, [[X0, Y], [X0, Y + s], [X0 + s * 0.28, Y + s * 0.74], [X0 + s * 0.48, Y + s * 1.1], [X0 + s * 0.62, Y + s * 1.03], [X0 + s * 0.44, Y + s * 0.68], [X0 + s * 0.8, Y + s * 0.66]], WHITE);
  const bell = (x: X, X0: number, Y: number, s: number, col: string) => { x.fillStyle = col; x.beginPath(); x.moveTo(X0 - s * 0.6, Y + s * 0.45); x.quadraticCurveTo(X0 - s * 0.5, Y + s * 0.3, X0 - s * 0.5, Y - s * 0.1); x.quadraticCurveTo(X0 - s * 0.5, Y - s * 0.65, X0, Y - s * 0.68); x.quadraticCurveTo(X0 + s * 0.5, Y - s * 0.65, X0 + s * 0.5, Y - s * 0.1); x.quadraticCurveTo(X0 + s * 0.5, Y + s * 0.3, X0 + s * 0.6, Y + s * 0.45); x.closePath(); x.fill(); circle(x, X0, Y + s * 0.58, s * 0.15, col); circle(x, X0, Y - s * 0.74, s * 0.1, col); };
  const thumb = (x: X, X0: number, Y: number, w: number, h: number, k: number, ac: string) => { const cols = [['#2f6db5', '#ffd23f'], ['#3aa04a', '#ff8c42']][k % 2]; box(x, X0, Y, w, h, 22, cols[0]); house(x, X0 + w * 0.7, Y + h * 0.85, h * 0.6, WHITE, cols[1]); box(x, X0 + 24, Y + 24, w * 0.46, h * 0.2, 10, alpha(INK, 0.8)); circle(x, X0 + w / 2, Y + h / 2, h * 0.14, alpha(INK, 0.55)); poly(x, [[X0 + w / 2 - h * 0.04, Y + h / 2 - h * 0.07], [X0 + w / 2 - h * 0.04, Y + h / 2 + h * 0.07], [X0 + w / 2 + h * 0.07, Y + h / 2]], WHITE); void ac; };
  const R: Record<string, XFx> = {
    'ed-bell': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, cy = c.land ? h * 0.46 : h * 0.42, bw = c.land ? 620 : 600, bh = 150;
      const on = t > 1.25, q = back(seg(t, 0, 0.5));
      pop(x, cx - 80, cy, q * (t > 1.15 && t < 1.35 ? 0.92 : 1), () => { box(x, cx - 80 - bw / 2, cy - bh / 2 + 10, bw, bh, bh / 2, alpha(INK, 0.4)); box(x, cx - 80 - bw / 2, cy - bh / 2, bw, bh, bh / 2, on ? '#3a3f4a' : RED); T(x, on ? '已訂閱' : c.title('訂閱'), cx - 80, cy + 2, 70, WHITE); });
      const bx = cx + bw / 2 + 40, sw = on ? Math.sin(Math.min(1, (t - 1.9) / 1.2) * 18) * (1 - seg(t, 1.9, 3.1)) * 0.4 : 0;
      pop(x, bx, cy, back(seg(t, 0.2, 0.6)), () => { circle(x, bx, cy, 86, on && t > 1.9 ? c.ac2 : '#3a3f4a'); K.rot(x, bx, cy - 50, t > 1.9 ? sw : 0, () => bell(x, bx, cy, 62, on && t > 1.9 ? INK : WHITE)); });
      burst(x, bx, cy, 120, seg(t, 1.9, 2.4), c.ac2, 10, 10);
      // 游標點兩下：訂閱 → 小鈴鐺
      const p1 = ease(seg(t, 0.5, 1.1)), p2 = ease(seg(t, 1.4, 1.8)), mx = lerp(lerp(w + 80, cx - 40, p1), bx + 10, p2), my = lerp(lerp(h, cy + 10, p1), cy + 20, p2);
      cursor(x, mx, my, 90);
      [1.2, 1.85].forEach((tc) => { const r = seg(t, tc, tc + 0.35); if (r > 0 && r < 1) ring(x, mx, my, 30 + r * 50, 6, alpha(WHITE, 1 - r)); });
      fade(x, seg(t, 2.4, 2.8), () => T(x, c.sub('開啟小鈴鐺，新片第一時間通知'), cx, cy + 200, 46, c.fg, 'center', 900, w - 120));
    }) },
    'ed-cards': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, V = !c.land, cw = V ? 840 : 700, ch = V ? 470 : 394, gap = V ? 110 : 80;
      T(x, c.title('下一支你會想看'), w / 2, V ? 170 : 110, 66, c.fg, 'center', 900, w - 100);
      [0, 1].forEach((i) => {
        const X0 = V ? (w - cw) / 2 : w / 2 - cw - gap / 2 + i * (cw + gap), Y0 = V ? 300 + i * (ch + gap + 60) : 260, q = back(seg(t, 0.3 + i * 0.3, 0.8 + i * 0.3));
        const hov = 1 + 0.03 * Math.sin(t * 3 + i * 2) * seg(t, 1.4, 1.8);
        pop(x, X0 + cw / 2, Y0 + ch / 2, q * hov, () => { box(x, X0 + 10, Y0 + 16, cw, ch, 22, alpha(INK, 0.5)); thumb(x, X0, Y0, cw, ch, i, c.ac); ring(x, X0 + cw / 2, Y0 + ch / 2, 0, 0, c.ac); });
        fade(x, seg(t, 0.8 + i * 0.3, 1.1 + i * 0.3), () => T(x, c.s(i, ['預售屋紅單怎麼看', '30 歲買房存多少'][i]), X0 + cw / 2, Y0 + ch + 50, 46, c.fg, 'center', 900, cw));
      });
    }) },
    'ed-ask': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cw = c.land ? 1200 : 880, X0 = (w - cw) / 2, Y0 = c.land ? 180 : 360, ch = c.land ? 560 : 640;
      pop(x, w / 2, Y0 + ch / 2, back(seg(t, 0, 0.5)), () => {
        box(x, X0 + 12, Y0 + 18, cw, ch, 40, alpha(INK, 0.4)); box(x, X0, Y0, cw, ch, 40, WHITE);
        poly(x, [[X0 + 120, Y0 + ch], [X0 + 220, Y0 + ch], [X0 + 110, Y0 + ch + 90]], WHITE);
        T(x, '留言告訴我', X0 + 60, Y0 + 90, 44, c.ac, 'left', 900);
        T(x, c.title('你會選捷運宅，還是大坪數？'), X0 + 60, Y0 + 200, c.land ? 70 : 60, INK, 'left', 900, cw - 120);
        const opts = [c.s(0, 'A 捷運宅'), c.s(1, 'B 大坪數')];
        opts.forEach((o, i) => { const y = Y0 + 330 + i * 120, q = ease(seg(t, 0.7 + i * 0.25, 1.1 + i * 0.25)); fade(x, q, () => { box(x, X0 + 60 + (1 - q) * 40, y - 46, cw - 120, 92, 46, i ? '#eef1f5' : alpha(c.ac, 0.16)); T(x, o, X0 + 110 + (1 - q) * 40, y, 46, INK, 'left', 900); }); });
      });
      // 打字中三點
      const dq = seg(t, 1.6, 2.0); fade(x, dq, () => { const y = Y0 + ch + 140; box(x, X0 + 230, y - 40, 180, 80, 40, alpha(c.fg, 0.15)); for (let i = 0; i < 3; i++) circle(x, X0 + 280 + i * 40, y - Math.max(0, Math.sin(t * 8 - i)) * 10, 12, c.fg); });
    }) },
    'ed-join': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, cy = c.land ? h * 0.48 : h * 0.42;
      const items = [[c.s(0, '加入會員'), '看完整試算表', c.ac], [c.s(1, '加入社群'), '每週房市快訊', '#3aa04a'], [c.s(2, '電子報'), '每月一封整理', '#2f6db5']] as [string, string, string][];
      T(x, c.title('想看更多？'), cx, c.land ? 110 : 200, 70, c.fg, 'center', 900);
      items.forEach(([a, b, col], i) => {
        const V = !c.land, iw = V ? 820 : 460, ih = V ? 230 : 420, X0 = V ? (w - iw) / 2 : cx - (iw * 3 + 80) / 2 + i * (iw + 40), Y0 = V ? 340 + i * (ih + 50) : cy - ih / 2 + 40;
        const q = back(seg(t, 0.3 + i * 0.25, 0.8 + i * 0.25));
        pop(x, X0 + iw / 2, Y0 + ih / 2, q, () => {
          slab(x, X0, Y0, iw, ih, 30, col, 14);
          const ix = V ? X0 + 120 : X0 + iw / 2, iy = V ? Y0 + ih / 2 : Y0 + 130;
          circle(x, ix, iy, 66, alpha(WHITE, 0.25));
          if (i === 0) star(x, ix, iy, 48, WHITE, 5, 0.45); else if (i === 1) { person(x, ix - 22, iy + 44, 60, WHITE, WHITE, WHITE); person(x, ix + 24, iy + 50, 54, alpha(WHITE, 0.8), alpha(WHITE, 0.8), alpha(WHITE, 0.8)); } else { box(x, ix - 44, iy - 30, 88, 60, 8, WHITE); poly(x, [[ix - 44, iy - 30], [ix, iy + 4], [ix + 44, iy - 30]], alpha(col, 0.8)); }
          T(x, a, V ? X0 + 230 : X0 + iw / 2, V ? Y0 + ih / 2 - 30 : Y0 + 270, 56, WHITE, V ? 'left' : 'center', 900, V ? iw - 260 : iw - 40);
          T(x, b, V ? X0 + 230 : X0 + iw / 2, V ? Y0 + ih / 2 + 40 : Y0 + 340, 36, alpha(WHITE, 0.85), V ? 'left' : 'center', 700, V ? iw - 260 : iw - 40);
        });
      });
      fade(x, seg(t, 1.4, 1.8), () => T(x, c.sub('連結在說明欄 ↓'), cx, c.land ? h - 60 : h - 140, 44, c.ac2, 'center', 900));
    }) },
    'ed-qr': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, V = !c.land, S = V ? 520 : 460, qx = V ? w / 2 - S / 2 : 220, qy = V ? 330 : (h - S) / 2;
      pop(x, qx + S / 2, qy + S / 2, back(seg(t, 0, 0.5)), () => {
        box(x, qx - 40, qy - 40 + 14, S + 80, S + 80, 36, alpha(INK, 0.4)); box(x, qx - 40, qy - 40, S + 80, S + 80, 36, WHITE);
        const n = 25, cs = S / n, r = rng(11), p = seg(t, 0.4, 1.6);
        for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) { const fin = (i < 7 && k < 7) || (i > n - 8 && k < 7) || (i < 7 && k > n - 8); if (fin) continue; if (r() > 0.52 && (i + k) / (2 * n) < p) box(x, qx + i * cs, qy + k * cs, cs + 0.5, cs + 0.5, 0, INK); }
        [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([a, b]) => { box(x, qx + a * cs, qy + b * cs, cs * 7, cs * 7, cs, INK); box(x, qx + (a + 1) * cs, qy + (b + 1) * cs, cs * 5, cs * 5, cs * 0.6, WHITE); box(x, qx + (a + 2) * cs, qy + (b + 2) * cs, cs * 3, cs * 3, cs * 0.5, c.ac); });
        const sc = seg(t, 1.8, 3.2); if (sc > 0 && sc < 1) { const ly = qy + S * ((sc * 2) % 1); line(x, qx - 20, ly, qx + S + 20, ly, 8, alpha(c.ac, 0.8)); }
      });
      const tx = V ? w / 2 : qx + S + 140, al: CanvasTextAlign = V ? 'center' : 'left';
      fade(x, seg(t, 0.6, 1.0), () => { T(x, c.title('掃描領取'), tx, V ? qy + S + 150 : h / 2 - 90, 80, c.fg, al, 900, V ? w - 120 : w - tx - 80); T(x, c.sub('買房檢查清單 PDF'), tx, V ? qy + S + 240 : h / 2 + 10, 50, c.ac2, al, 900, V ? w - 120 : w - tx - 80); });
      fade(x, seg(t, 1.2, 1.5), () => T(x, '示意 QR，請換成你的連結', tx, V ? qy + S + 320 : h / 2 + 90, 30, alpha(c.fg, 0.5), al, 700));
    }) },
    'ed-next': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, cw = c.land ? 900 : 880, ch = cw * 0.5625, X0 = cx - cw / 2, Y0 = c.land ? 200 : 420;
      const q = ease(seg(t, 0, 0.5)); fade(x, q, () => { box(x, 0, (c.land ? 90 : 220) - 60, w * q, 120, 0, c.ac); T(x, c.title('下集預告'), 80, c.land ? 90 : 220, 72, WHITE, 'left', 900); });
      const p = ease(seg(t, 0.5, 1.1));
      clip(x, () => { x.roundRect(X0, Y0, cw, ch * p, 26); }, () => { thumb(x, X0, Y0, cw, ch, 1, c.ac); for (let i = 0; i < 40; i++) { const r = rng(i + Math.floor(t * 10))(); box(x, X0, Y0 + r * ch, cw, 2, 0, alpha(WHITE, 0.08)); } });
      fade(x, seg(t, 1.1, 1.5), () => T(x, c.sub('重劃區三年後：誰賺到了？'), cx, Y0 + ch + 90, 60, c.fg, 'center', 900, w - 100));
      fade(x, seg(t, 1.5, 1.9), () => pill(x, c.s(0, '週五晚上 8 點'), cx, Y0 + ch + 190, 44, c.ac2, INK));
      void inout;
    }) },
    'ed-thanks': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, cy = c.land ? h * 0.4 : h * 0.36;
      const s = c.title('謝謝收看'), chars = [...s], fs = c.land ? 150 : 140, tot = tw(x, s, fs), X0 = cx - tot / 2; let acc = X0;
      chars.forEach((ch, i) => { const cw = tw(x, ch, fs), q = back(seg(t, 0.1 + i * 0.1, 0.5 + i * 0.1)); pop(x, acc + cw / 2, cy, q, () => T(x, ch, acc + cw / 2, cy - (1 - q) * 30, fs, i % 2 ? c.ac2 : c.fg)); acc += cw; });
      const crd = [['企劃', c.s(0, 'KC')], ['資料', c.s(1, '實價登錄（示意）')], ['剪輯', c.s(2, 'KC')]];
      crd.forEach(([a, b], i) => fade(x, seg(t, 1.0 + i * 0.2, 1.4 + i * 0.2), () => { const y = cy + 200 + i * 80; T(x, a, cx - 30, y, 40, alpha(c.fg, 0.55), 'right', 700); T(x, b, cx + 30, y, 40, c.fg, 'left', 900); }));
      for (let i = 0; i < 14; i++) { const r = rng(i * 7), a = r() * K.TAU, dd = seg(t, 0.6 + r() * 0.3, 2.2 + r()); if (dd > 0 && dd < 1) star(x, cx + Math.cos(a) * (200 + dd * 400), cy + Math.sin(a) * (120 + dd * 260), 16 * (1 - dd), i % 2 ? c.ac : c.ac2); }
    }) },
    'ed-like': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, cy = c.land ? h * 0.5 : h * 0.45, gap = c.land ? 360 : 290;
      T(x, c.title('覺得有用的話'), cx, c.land ? 170 : 300, 64, c.fg, 'center', 900);
      const btn: [string, string][] = [[c.s(0, '按讚'), RED], [c.s(1, '分享'), '#2f6db5'], [c.s(2, '收藏'), '#f2b705']];
      btn.forEach(([n, col], i) => {
        const bx = cx + (i - 1) * gap, tc = 0.8 + i * 0.55, hit = t > tc, q = back(seg(t, 0.2 + i * 0.1, 0.6 + i * 0.1)), pr = t > tc - 0.08 && t < tc + 0.1 ? 0.86 : 1;
        pop(x, bx, cy, q * pr * (hit ? 1 + 0.12 * Math.sin(Math.PI * seg(t, tc, tc + 0.3)) : 1), () => {
          circle(x, bx, cy + 10, 110, alpha(INK, 0.4)); circle(x, bx, cy, 110, hit ? col : '#3a3f4a');
          if (i === 0) heart(x, bx, cy - 10, 70, WHITE); else if (i === 1) { poly(x, [[bx - 40, cy + 30], [bx - 40, cy - 6], [bx + 10, cy - 6], [bx + 10, cy - 36], [bx + 52, cy + 4], [bx + 10, cy + 44], [bx + 10, cy + 14], [bx - 14, cy + 14]], WHITE); } else { poly(x, [[bx - 34, cy - 50], [bx + 34, cy - 50], [bx + 34, cy + 50], [bx, cy + 20], [bx - 34, cy + 50]], WHITE); }
        });
        burst(x, bx, cy, 150, seg(t, tc, tc + 0.4), col, 10, 9);
        T(x, n, bx, cy + 170, 48, c.fg, 'center', 900);
        if (hit) fade(x, seg(t, tc, tc + 0.2), () => check(x, bx + 80, cy - 80, 40, c.ac2));
      });
      void phone;
    }) },
  };
  return R;
};
