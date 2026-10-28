// 第 10 包：新聞讀報（8）。媒體名稱以「A 報」「B 台」代稱，標題內容可自行替換；預設皆示意。
import type { XC, XFx, XK } from './kit';

export const xp10 = (K: XK) => {
  const { ease, inout, back, seg, box, circle, ring, line, T, pop, fade, clip, pill, alpha, INK, WHITE, poly, tw, rng, lerp, shade, star, person } = K;
  type X = CanvasRenderingContext2D;
  const stage = (c: XC, fn: (w: number, h: number) => void) => { const w = c.land ? 1700 : 1000, h = c.land ? 950 : 1500; c.fit(w, h, () => fn(w, h)); };
  const RED = '#e5484d', PAPER = '#f5f1e8';
  const wrap = (x: X, s: string, size: number, maxW: number) => { const out: string[] = []; let cur = ''; for (const ch of s) { if (tw(x, cur + ch, size) > maxW && cur) { out.push(cur); cur = ch; } else cur += ch; } if (cur) out.push(cur); return out; };
  const R: Record<string, XFx> = {
    'nw-carousel': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, hs = [c.s(0, '央行升息半碼 房貸族每月多繳'), c.s(1, '新青安延長 首購族怎麼看'), c.s(2, '北市預售屋量創三年新高')], n = hs.length;
      const per = 1.3, k = Math.min(n - 1, Math.floor(t / per)), ph = t - k * per, cw = w - 160, ch = c.land ? 360 : 520, X0 = 80, Y0 = (h - ch) / 2;
      T(x, c.title('今日房市頭條'), X0, Y0 - 70, 56, c.ac2, 'left', 900);
      clip(x, () => x.rect(X0, Y0, cw, ch), () => {
        for (let j = Math.max(0, k - 1); j <= k; j++) {
          const off = j === k ? (k === 0 ? 0 : (1 - inout(seg(ph, 0, 0.45))) * cw) : -inout(seg(ph, 0, 0.45)) * cw;
          box(x, X0 + off, Y0, cw, ch, 26, j % 2 ? '#242a36' : '#1b2230'); box(x, X0 + off, Y0, 16, ch, 8, RED);
          const ls = wrap(x, hs[j], c.land ? 84 : 72, cw - 120); ls.slice(0, 3).forEach((l, i) => T(x, l, X0 + off + 60, Y0 + ch / 2 - (ls.length - 1) * 50 + i * 100, c.land ? 84 : 72, WHITE, 'left', 900));
          T(x, `${['A 報', 'B 台', 'C 網'][j % 3]} · 10:${30 + j * 7}（示意）`, X0 + off + 60, Y0 + ch - 50, 32, alpha(WHITE, 0.55), 'left', 700);
        }
      });
      for (let i = 0; i < n; i++) circle(x, w / 2 + (i - (n - 1) / 2) * 44, Y0 + ch + 60, i === k ? 14 : 9, i === k ? c.ac : alpha(c.fg, 0.3));
    }) },
    'nw-ticker': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, y = c.land ? h - 220 : h - 420, q = ease(seg(t, 0, 0.5));
      clip(x, () => x.rect(0, y - 150, w * q, 320), () => {
        box(x, 0, y - 130, w, 110, 0, RED); T(x, c.title('快訊'), 50, y - 74, 64, WHITE, 'left', 900);
        const m1 = c.s(0, '內政部：本季實價登錄筆數年減 8%（示意）'), sc1 = (t * 240) % (tw(x, m1, 52) + w);
        clip(x, () => x.rect(220, y - 130, w, 110), () => T(x, m1, w - sc1, y - 74, 52, WHITE, 'left', 900));
        box(x, 0, y - 20, w, 100, 0, alpha(INK, 0.95));
        const m2 = c.sub('台北 22°C · 加權指數 23,180（示意） · 房貸利率 2.2%'), sc2 = (t * 160) % (tw(x, m2, 40, 700) + w);
        T(x, m2, w - sc2, y + 30, 40, alpha(WHITE, 0.85), 'left', 700);
        box(x, 0, y + 80, w, 10, 0, c.ac);
      });
      const fl = Math.floor(t * 2) % 2; fade(x, 0.4 + 0.6 * fl, () => circle(x, 190, y - 74, 12, WHITE));
    }) },
    'nw-collage': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, hs = [c.s(0, '房價還會漲嗎？'), c.s(1, '打炒房 新制上路'), c.s(2, '首購族：買不起'), c.s(3, '建商推案量下修'), c.s(4, '利率連三升')], r = rng(4);
      T(x, c.title('各家媒體怎麼說'), w / 2, c.land ? 90 : 170, 60, c.fg, 'center', 900);
      hs.forEach((s, i) => {
        const V = !c.land, cx = V ? w / 2 + (i % 2 ? 110 : -110) : 260 + i * 300, cy = V ? 380 + i * 210 : h / 2 + (i % 2 ? 110 : -80), a = (r() - 0.5) * 0.22, q = back(seg(t, 0.3 + i * 0.25, 0.7 + i * 0.25));
        pop(x, cx, cy, q * (1 + (1 - ease(seg(t, 0.3 + i * 0.25, 0.6 + i * 0.25))) * 0.6), () => K.rot(x, cx, cy, a, () => {
          const cw = V ? 620 : 420, ch = V ? 170 : 260; box(x, cx - cw / 2 + 8, cy - ch / 2 + 12, cw, ch, 8, alpha(INK, 0.5)); box(x, cx - cw / 2, cy - ch / 2, cw, ch, 8, PAPER);
          box(x, cx - cw / 2, cy - ch / 2, cw, V ? 44 : 54, 8, [RED, '#2f6db5', INK, '#3aa04a', '#f2b705'][i]); T(x, ['A 報', 'B 台', 'C 網', 'D 週刊', 'E 新聞'][i], cx - cw / 2 + 20, cy - ch / 2 + (V ? 22 : 27), 28, WHITE, 'left', 900);
          const ls = wrap(x, s, V ? 52 : 50, cw - 40); ls.slice(0, 2).forEach((l, j) => T(x, l, cx - cw / 2 + 20, cy + (V ? 30 : 0) + j * 60, V ? 52 : 50, INK, 'left', 900));
        }));
      });
    }) },
    'nw-policy': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cw = c.land ? 1200 : 880, ch = c.land ? 760 : 1100, X0 = (w - cw) / 2, Y0 = (h - ch) / 2;
      pop(x, w / 2, Y0 + ch / 2, back(seg(t, 0, 0.5)), () => {
        box(x, X0 + 12, Y0 + 18, cw, ch, 20, alpha(INK, 0.5)); box(x, X0, Y0, cw, ch, 20, PAPER); box(x, X0, Y0, cw, 20, 10, RED);
        T(x, '公告', X0 + 60, Y0 + 100, 44, RED, 'left', 900); T(x, c.title('平均地權條例修正'), X0 + 60, Y0 + 190, c.land ? 76 : 66, INK, 'left', 900, cw - 120);
        line(x, X0 + 60, Y0 + 250, X0 + cw - 60, Y0 + 250, 4, alpha(INK, 0.2));
        const rows = [c.s(0, '一、限制換約轉售'), c.s(1, '二、重罰炒作行為'), c.s(2, '三、私法人購屋許可制')];
        rows.forEach((s, i) => fade(x, seg(t, 0.6 + i * 0.3, 0.9 + i * 0.3), () => T(x, s, X0 + 60, Y0 + 340 + i * (c.land ? 100 : 130), c.land ? 54 : 50, INK, 'left', 900, cw - 120)));
        fade(x, seg(t, 1.6, 1.9), () => T(x, c.sub('2023.07.01 施行（依官方公告為準）'), X0 + 60, Y0 + ch - 70, 34, '#5d6772', 'left', 700, cw - 360));
      });
      const sq = seg(t, 1.9, 2.2), sx = X0 + cw - 180, sy = Y0 + ch - 190, ss = lerp(2.4, 1, ease(sq));
      if (sq > 0) fade(x, sq, () => K.rot(x, sx, sy, -0.2, () => pop(x, sx, sy, ss, () => { ring(x, sx, sy, 110, 12, RED); ring(x, sx, sy, 88, 4, RED); T(x, '已上路', sx, sy + 4, 50, RED); })));
    }) },
    'nw-law': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cw = w - 160, X0 = 80, Y0 = c.land ? 150 : 260;
      T(x, c.title('第 47 條之 3'), X0, Y0, 64, c.ac2, 'left', 900);
      const txt = c.sub('預售屋或新建成屋買賣契約之買受人，除有特殊情形外，不得讓與或轉售他人，違者處新臺幣五十萬元以上三百萬元以下罰鍰。（示意節錄）');
      const fs = c.land ? 54 : 50, ls = wrap(x, txt, fs, cw), lh = fs * 1.7, hl = c.s(0, '不得讓與或轉售');
      const q = ease(seg(t, 0.2, 0.8));
      ls.forEach((l, i) => {
        const y = Y0 + 130 + i * lh; fade(x, q, () => {
          const at = l.indexOf(hl.slice(0, 2)); // 找到高亮詞所在行
          if (at >= 0 && l.includes(hl.slice(0, 4))) { const ax = X0 + tw(x, l.slice(0, at), fs), hw = tw(x, l.slice(at, at + hl.length), fs), p = ease(seg(t, 1.0, 1.6)); box(x, ax - 6, y - fs * 0.6, (hw + 12) * p, fs * 1.2, 8, alpha(c.ac2, 0.9)); }
          T(x, l, X0, y, fs, c.fg, 'left', 700);
        });
      });
      const ry = Y0 + 130 + ls.length * lh + 40; fade(x, seg(t, 1.8, 2.2), () => { stroke2(x, X0, ry, cw * ease(seg(t, 1.8, 2.4)), RED); T(x, c.s(1, '罰 50～300 萬'), X0, ry + 70, 60, RED, 'left', 900); });
    }) },
    'nw-quote': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, V = !c.land, cw = V ? 880 : 1100, X0 = V ? (w - cw) / 2 : 480, Y0 = V ? 640 : 200;
      const mx = V ? w / 2 : 260, my = V ? 380 : h / 2 + 40;
      pop(x, mx, my, back(seg(t, 0, 0.5)), () => { person(x, mx, my + 200, 300, '#2f6db5'); box(x, mx - 120, my + 120, 240, 90, 12, '#5d4632'); for (let i = 0; i < 3; i++) { line(x, mx - 60 + i * 60, my + 120, mx - 20 + i * 20, my + 40, 10, INK); circle(x, mx - 20 + i * 20, my + 34, 18, i === 1 ? RED : INK); } });
      for (let i = 0; i < 4; i++) { const fl = seg(t, 0.8 + i * 0.45, 0.95 + i * 0.45); if (fl > 0 && fl < 1) { circle(x, mx + (i % 2 ? 160 : -160), my - 80 + i * 20, 80 * (1 - fl), alpha(WHITE, 0.8 * (1 - fl))); } }
      const q = ease(seg(t, 0.4, 0.9));
      fade(x, q, () => {
        box(x, X0 + (1 - q) * 60, Y0, cw, V ? 640 : 560, 30, WHITE); T(x, '“', X0 + 50 + (1 - q) * 60, Y0 + 110, 200, c.ac, 'left', 900);
        const ls = wrap(x, c.title('房價不會只漲不跌，購屋要量力而為。'), V ? 64 : 66, cw - 120); ls.slice(0, 4).forEach((l, i) => T(x, l, X0 + 60 + (1 - q) * 60, Y0 + 210 + i * 96, V ? 64 : 66, INK, 'left', 900));
        T(x, c.sub('— 某部會首長 記者會（示意）'), X0 + cw - 50 + (1 - q) * 60, Y0 + (V ? 590 : 510), 36, '#5d6772', 'right', 700, cw - 100);
      });
    }) },
    'nw-paper': { bg: '#2a2622', d: (x, c) => stage(c, (w, h) => {
      const t = c.t, cx = w / 2, cy = h / 2, z = lerp(0.7, 1.15, inout(seg(t, 0.6, 2.6))), rotA = lerp(-0.12, 0, ease(seg(t, 0, 1)));
      x.save(); x.translate(cx, cy); x.rotate(rotA); x.scale(z, z); x.translate(-cx, -cy);
      const pw = c.land ? 1300 : 900, ph = c.land ? 900 : 1300, X0 = cx - pw / 2, Y0 = cy - ph / 2;
      box(x, X0 + 16, Y0 + 20, pw, ph, 6, alpha('#000000', 0.4)); box(x, X0, Y0, pw, ph, 6, PAPER);
      T(x, '房市日報', cx, Y0 + 90, 90, INK, 'center', 900); line(x, X0 + 40, Y0 + 150, X0 + pw - 40, Y0 + 150, 6, INK); line(x, X0 + 40, Y0 + 162, X0 + pw - 40, Y0 + 162, 2, INK);
      const hl = wrap(x, c.title('雙北房價 漲勢趨緩'), c.land ? 110 : 100, pw - 100); hl.forEach((l, i) => T(x, l, X0 + 50, Y0 + 270 + i * 120, c.land ? 110 : 100, INK, 'left', 900));
      const by = Y0 + 300 + hl.length * 120; box(x, X0 + 50, by, pw * 0.45, ph - (by - Y0) - 60, 4, '#c9bfa8'); K.house(x, X0 + 50 + pw * 0.225, by + (ph - (by - Y0) - 60) * 0.8, 200, WHITE, RED);
      for (let i = 0; i < 12; i++) box(x, X0 + pw * 0.55, by + 10 + i * 46, pw * 0.4 - 40, 14, 4, alpha(INK, 0.25));
      x.restore();
      const hq = seg(t, 2.6, 3.0); fade(x, hq, () => { box(x, 0, h - (c.land ? 170 : 300), w * ease(hq), 120, 0, alpha(RED, 0.92)); T(x, c.sub('今天來拆解這則新聞'), 60, h - (c.land ? 110 : 240), 54, WHITE, 'left', 900); });
      void shade; void star;
    }) },
    'nw-timeline': { d: (x, c) => stage(c, (w, h) => {
      const t = c.t, ev = [[c.s(0, '2023.07'), c.s(1, '平均地權條例上路')], [c.s(2, '2024.09'), c.s(3, '第 7 波信用管制')], [c.s(4, '2025.03'), c.s(5, '新青安調整')], [c.s(6, '2026.10'), c.s(7, '本集主題')]];
      T(x, c.title('事件時間軸'), 80, 110, 64, c.fg, 'left', 900);
      const V = !c.land, A = V ? 280 : 160, B = V ? h - 160 : w - 160, L0 = V ? 160 : h / 2, p = ease(seg(t, 0.3, 2.8));
      if (V) { box(x, L0 - 6, A, 12, B - A, 6, alpha(c.fg, 0.15)); box(x, L0 - 6, A, 12, (B - A) * p, 6, c.ac); } else { box(x, A, L0 - 6, B - A, 12, 6, alpha(c.fg, 0.15)); box(x, A, L0 - 6, (B - A) * p, 12, 6, c.ac); }
      ev.forEach(([d, s], i) => {
        const P0 = A + (B - A) * (i + 0.5) / ev.length, on = p >= (i + 0.5) / ev.length, q = back(seg(t, 0.3 + (i + 0.5) / ev.length * 2.5, 0.6 + (i + 0.5) / ev.length * 2.5)), last = i === ev.length - 1;
        const [px, py] = V ? [L0, P0] : [P0, L0];
        pop(x, px, py, Math.max(0.6, q), () => { circle(x, px, py, last ? 34 : 26, on ? (last ? c.ac2 : c.ac) : '#2b3240'); if (on) circle(x, px, py, 10, WHITE); });
        fade(x, q, () => {
          if (V) { T(x, d, L0 + 70, P0 - 34, 40, c.ac2, 'left', 900); T(x, s, L0 + 70, P0 + 30, 52, c.fg, 'left', 900, w - L0 - 120); }
          else { const up = i % 2 === 0, yy = up ? L0 - 120 : L0 + 120; T(x, d, P0, yy - 34, 40, c.ac2, 'center', 900); T(x, s, P0, yy + 30, 46, c.fg, 'center', 900, (B - A) / ev.length - 20); line(x, P0, L0 + (up ? -36 : 36), P0, yy + (up ? 70 : -70), 3, alpha(c.fg, 0.3)); }
        });
      });
    }) },
  };
  const stroke2 = (x: X, X0: number, Y: number, w: number, col: string) => box(x, X0, Y - 4, w, 8, 4, col);
  return R;
};
