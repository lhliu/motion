// 捷運／鐵路路網：用文字行描述路線與車站，畫成路網圖或路線條。網站卡片、匯出 HTML、本機渲染共用。
// 整個工廠必須自給自足（匯出時用 toString），不可引用外部變數。

export const TRANSIT_HELP = `一行一個設定，順序：
@title 標題　@sub 副標　@layout net（路網，預設）或 strip（路線條）　@bg transparent 或 #色碼
=線名 #色碼 [dash 規劃中虛線｜rail 鐵路黑白線] [tag=x,y 線名標籤位置]
站碼 站名 x,y [L/R/T/B 標籤在左右上下]　* 開頭＝焦點站；站名相同或站碼含 / 自動畫成轉乘站
○ 區名 x,y,半徑 [#色碼]　淡色區域圈
座標 x,y 為 0–100（左上 0,0）；路線條（strip）不需要座標。`;

export const transitRenderer = () => {
  type St = { code: string; name: string; x: number; y: number; side: string; focus: boolean; has: boolean };
  type Line = { name: string; color: string; style: string; tag: number[] | null; st: St[] };
  type Zone = { name: string; x: number; y: number; r: number; color: string };
  type Net = { title: string; sub: string; layout: string; bg: string; lines: Line[]; zones: Zone[] };
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
  const back = (p: number) => {
    const q = clamp(p) - 1;
    return 1 + 2.4 * q * q * q + 1.4 * q * q;
  };
  const FONT = '"MA Num", "Chiron Hei HK", "Noto Sans TC", "PingFang TC", sans-serif';

  const parse = (w: string[]): Net => {
    const net: Net = { title: '', sub: '', layout: 'net', bg: '', lines: [], zones: [] };
    let cur: Line | null = null;
    for (const raw of w) {
      const s = String(raw || '').trim();
      if (!s) continue;
      if (s.startsWith('@')) {
        const [k, ...v] = s.slice(1).split(/\s+/);
        const val = v.join(' ');
        if (k === 'title') net.title = val;
        else if (k === 'sub') net.sub = val;
        else if (k === 'layout') net.layout = val === 'strip' ? 'strip' : 'net';
        else if (k === 'bg') net.bg = val;
        continue;
      }
      if (s.startsWith('=')) {
        const tk = s.slice(1).trim().split(/\s+/);
        const color = tk.find((x) => /^#[0-9a-f]{3,8}$/i.test(x)) || '#2f6db5';
        const style = tk.includes('dash') ? 'dash' : tk.includes('rail') ? 'rail' : 'solid';
        const tg = tk.find((x) => x.startsWith('tag='));
        const tag = tg ? tg.slice(4).split(',').map(Number) : null;
        const name = tk.filter((x) => x !== color && x !== 'dash' && x !== 'rail' && x !== tg).join(' ');
        cur = { name, color, style, tag: tag && tag.length === 2 && tag.every(Number.isFinite) ? tag : null, st: [] };
        net.lines.push(cur);
        continue;
      }
      if (s.startsWith('○') || s.startsWith('◯')) {
        const tk = s.slice(1).trim().split(/\s+/);
        const xy = tk.find((x) => /^-?[\d.]+,-?[\d.]+,[\d.]+$/.test(x));
        const color = tk.find((x) => /^#[0-9a-f]{3,8}$/i.test(x)) || '#e9b6c8';
        if (!xy) continue;
        const [x, y, r] = xy.split(',').map(Number);
        net.zones.push({ name: tk.filter((x) => x !== xy && x !== color).join(' '), x, y, r, color });
        continue;
      }
      if (!cur) {
        cur = { name: '', color: '#2f6db5', style: 'solid', tag: null, st: [] };
        net.lines.push(cur);
      }
      const focus = s.startsWith('*');
      const tk = (focus ? s.slice(1) : s).trim().split(/\s+/);
      const xy = tk.find((x) => /^-?[\d.]+,-?[\d.]+$/.test(x));
      const side = tk.find((x) => /^[LRTB]$/.test(x)) || '';
      const rest = tk.filter((x) => x !== xy && x !== side);
      const codeLike = rest.length > 1 && /^[A-Za-z]{0,4}\d+[A-Za-z]?(\/[A-Za-z]{0,4}\d+[A-Za-z]?)*$/.test(rest[0]);
      const code = codeLike ? rest[0] : '';
      const name = (codeLike ? rest.slice(1) : rest).join(' ');
      const [x, y] = xy ? xy.split(',').map(Number) : [NaN, NaN];
      cur.st.push({ code, name, x, y, side, focus, has: !!xy });
    }
    net.lines = net.lines.filter((l) => l.st.length);
    return net;
  };

  const lineLen = (pts: number[][]) => {
    const acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return acc;
  };
  const at = (pts: number[][], acc: number[], d: number) => {
    const L = acc[acc.length - 1];
    const dd = Math.max(0, Math.min(L, d));
    let i = 1;
    while (i < acc.length - 1 && acc[i] < dd) i++;
    const seg = acc[i] - acc[i - 1] || 1;
    const f = (dd - acc[i - 1]) / seg;
    const a = pts[i - 1];
    const b = pts[i] || a;
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, Math.atan2(b[1] - a[1], b[0] - a[0])];
  };
  const partial = (pts: number[][], acc: number[], d: number) => {
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (acc[i] <= d) out.push(pts[i]);
      else {
        const p = at(pts, acc, d);
        out.push([p[0], p[1]]);
        break;
      }
    }
    return out;
  };
  const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(r, h / 2, w / 2));
  };
  const lum = (c: string) => {
    const h = c.replace('#', '');
    const f = h.length === 3 ? h.split('').map((x) => x + x).join('') : h.slice(0, 6);
    const n = parseInt(f, 16);
    return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114;
  };
  const textOn = (c: string) => (lum(c) > 160 ? '#1d2433' : '#ffffff');

  /** 畫一格；t 為秒數。回傳整體動畫長度（秒），讓呼叫端決定循環 */
  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number, net: Net, t: number, opt: { fg?: string; bg?: string; font?: string } = {}) => {
    const F = opt.font || FONT;
    const S = Math.min(W, H);
    const fg = opt.fg || '#1d2433';
    const bg = net.bg || opt.bg || '';
    ctx.clearRect(0, 0, W, H);
    if (bg && bg !== 'transparent') {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
    }
    const tIn = ease(t / 0.6);
    // 標題
    let top = H * 0.06;
    if (net.title) {
      ctx.globalAlpha = tIn;
      ctx.fillStyle = fg;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      const fs = S * 0.065;
      ctx.font = `900 ${fs}px ${F}`;
      ctx.fillText(net.title, W * 0.07, top + (1 - tIn) * fs * 0.4);
      top += fs * 1.25;
      if (net.sub) {
        const fs2 = S * 0.032;
        ctx.font = `700 ${fs2}px ${F}`;
        ctx.globalAlpha = tIn * 0.7;
        ctx.fillText(net.sub, W * 0.07, top);
        top += fs2 * 1.6;
      }
      ctx.globalAlpha = 1;
    }
    const lw = S * 0.016;
    // 轉乘站：同站名或站碼互相包含
    const keyOf = (s: St) => s.name || s.code;
    const count = new Map<string, number>();
    net.lines.forEach((l) => new Set(l.st.map(keyOf)).forEach((k) => count.set(k, (count.get(k) ?? 0) + 1)));
    const isX = (s: St) => (count.get(keyOf(s)) ?? 0) > 1 || s.code.includes('/');

    if (net.layout === 'strip') {
      // 路線條：橫式畫面橫排、直式畫面直排，每條線一列
      const horiz = W >= H;
      const rows = net.lines.length;
      net.lines.forEach((l, li) => {
        const n = l.st.length;
        const t0 = 0.4 + li * 0.5;
        const dur = 0.9 + n * 0.08;
        const p = ease((t - t0) / dur);
        const a0 = horiz ? W * 0.06 : top + H * 0.04;
        const a1 = horiz ? W * 0.94 : H * 0.95;
        const band = horiz ? (H - top - H * 0.05) / rows : (W * 0.9) / rows;
        const c0 = horiz ? top + band * li + band * (rows === 1 ? 0.28 : 0.18) : W * 0.12 + band * li + band * 0.08;
        const pos = (i: number) => a0 + ((a1 - a0) * (n === 1 ? 0.5 : i / (n - 1)));
        const pill = Math.min(S * (horiz ? 0.08 : 0.1), (Math.abs(a1 - a0) / Math.max(1, n - 1)) * (horiz ? 0.86 : 1.3));
        const ph = pill * 0.62;
        ctx.lineCap = 'round';
        ctx.strokeStyle = l.color;
        ctx.lineWidth = ph * 0.55;
        if (l.style === 'dash') ctx.setLineDash([ph * 0.8, ph * 0.6]);
        ctx.beginPath();
        const e = a0 + (a1 - a0) * p;
        if (horiz) {
          ctx.moveTo(a0, c0);
          ctx.lineTo(e, c0);
        } else {
          ctx.moveTo(c0, a0);
          ctx.lineTo(c0, e);
        }
        if (p > 0) ctx.stroke();
        ctx.setLineDash([]);
        // 列車
        if (p >= 1 && l.style !== 'dash') {
          const q = ((t - t0 - dur) * 0.12) % 2;
          const f = q < 1 ? q : 2 - q;
          const v = a0 + (a1 - a0) * f;
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = l.color;
          ctx.lineWidth = ph * 0.14;
          const tl = pill * 1.3;
          if (horiz) rr(ctx, v - tl / 2, c0 - ph * 0.38, tl, ph * 0.76, ph * 0.38);
          else rr(ctx, c0 - ph * 0.38, v - tl / 2, ph * 0.76, tl, ph * 0.38);
          ctx.fill();
          ctx.stroke();
        }
        l.st.forEach((s, i) => {
          const fi = n === 1 ? 0 : i / (n - 1);
          const k = back((t - t0 - dur * fi) / 0.35);
          if (k <= 0) return;
          const v = pos(i);
          const big = s.focus ? 1.25 : 1;
          const pw = pill * big;
          const phh = ph * big;
          const [x, y] = horiz ? [v, c0] : [c0, v];
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(k, k);
          ctx.fillStyle = s.focus ? l.color : '#ffffff';
          ctx.strokeStyle = isX(s) ? fg : l.color;
          ctx.lineWidth = phh * 0.16;
          if (horiz) rr(ctx, -pw / 2, -phh / 2, pw, phh, phh / 2);
          else rr(ctx, -phh * 0.85, -phh / 2, phh * 1.7, phh, phh / 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = s.focus ? textOn(l.color) : fg;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `900 ${phh * 0.46}px ${F}`;
          ctx.fillText(s.code || String(i + 1), 0, phh * 0.03, horiz ? pw * 0.86 : phh * 1.5);
          ctx.restore();
          // 站名：橫排時直書在下方，直排時橫書在右邊
          const la = ease((t - t0 - dur * fi - 0.15) / 0.4);
          if (la <= 0 || !s.name) return;
          ctx.globalAlpha = la;
          ctx.fillStyle = fg;
          if (horiz) {
            const chars = [...s.name];
            const room = Math.min(H * 0.98 - (c0 + ph * 0.9), band * 0.75);
            const fs = Math.min(pill * 0.55, room / Math.max(4, chars.length));
            ctx.font = `${s.focus ? 900 : 700} ${fs}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            chars.forEach((ch, j) => {
              const isParen = '()（）'.includes(ch);
              const yy = c0 + ph * 0.9 + j * fs * 1.04 + (1 - la) * fs;
              if (isParen) {
                ctx.save();
                ctx.translate(x, yy + fs / 2);
                ctx.rotate(Math.PI / 2);
                ctx.textBaseline = 'middle';
                ctx.fillText(ch, 0, 0);
                ctx.restore();
              } else ctx.fillText(ch, x, yy);
            });
          } else {
            const fs = Math.min(ph * 0.95, S * 0.045, (band * 0.75) / Math.max(4, [...s.name].length));
            ctx.font = `${s.focus ? 900 : 700} ${fs}px ${F}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(s.name, c0 + ph * 1.2 + (1 - la) * fs, y, band * 0.8);
          }
          ctx.globalAlpha = 1;
        });
        // 線名
        if (l.name) {
          const la = ease((t - t0) / 0.5);
          ctx.globalAlpha = la;
          const fs = S * 0.03;
          ctx.font = `900 ${fs}px ${F}`;
          const tw = ctx.measureText(l.name).width + fs * 1.2;
          const [x, y] = horiz ? [a0 - ph * 0.2, c0 - ph * 1.6] : [c0 - ph * 0.85, a0 - fs * 2.3];
          ctx.fillStyle = l.color;
          rr(ctx, x, y, tw, fs * 1.6, fs * 0.3);
          ctx.fill();
          ctx.fillStyle = textOn(l.color);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(l.name, x + fs * 0.6, y + fs * 0.82);
          ctx.globalAlpha = 1;
        }
      });
      return 0.4 + net.lines.length * 0.5 + 2.5;
    }

    // 路網圖：座標 0–100 對應到內容框
    const bx0 = W * 0.07;
    const by0 = top + H * 0.03;
    const bw = W * 0.86;
    const bh = H * 0.95 - by0;
    const P = (x: number, y: number) => [bx0 + (x / 100) * bw, by0 + (y / 100) * bh];
    // 區域圈
    net.zones.forEach((z, i) => {
      const k = ease((t - 0.2 - i * 0.12) / 0.6);
      if (k <= 0) return;
      const [x, y] = P(z.x, z.y);
      const r = (z.r / 100) * Math.min(bw, bh) * k;
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = z.color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = k * 0.85;
      if (z.name) {
        ctx.fillStyle = fg;
        ctx.font = `900 ${S * 0.034}px ${F}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(z.name, x, y - r * 0.8);
      }
      ctx.globalAlpha = 1;
    });
    const L = net.lines.map((l, li) => {
      const pts = l.st.map((s, i) => (s.has ? P(s.x, s.y) : P(10 + (80 * i) / Math.max(1, l.st.length - 1), 50)));
      const acc = lineLen(pts);
      const t0 = 0.5 + li * 0.55;
      const dur = 0.8 + acc[acc.length - 1] / (S * 0.9);
      return { l, pts, acc, t0, dur };
    });
    // 線
    L.forEach(({ l, pts, acc, t0, dur }) => {
      const p = ease((t - t0) / dur);
      if (p <= 0) return;
      const d = acc[acc.length - 1] * p;
      const seg = partial(pts, acc, d);
      const path = () => {
        ctx.beginPath();
        seg.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      };
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (l.style === 'rail') {
        ctx.strokeStyle = '#1d2433';
        ctx.lineWidth = lw * 0.9;
        path();
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = lw * 0.42;
        ctx.lineCap = 'butt';
        ctx.setLineDash([lw * 1.1, lw * 1.1]);
        path();
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = l.color;
        ctx.lineWidth = lw;
        if (l.style === 'dash') {
          ctx.lineCap = 'butt';
          ctx.setLineDash([lw * 1.4, lw * 0.9]);
        }
        path();
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    // 列車：線畫完後沿線來回
    L.forEach(({ l, pts, acc, t0, dur }) => {
      if (l.style === 'dash' || t < t0 + dur) return;
      const tot = acc[acc.length - 1];
      const q = (((t - t0 - dur) * S * 0.12) / tot) % 2;
      const f = q < 1 ? q : 2 - q;
      const [x, y, a] = at(pts, acc, tot * f);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = l.style === 'rail' ? '#1d2433' : l.color;
      ctx.lineWidth = lw * 0.28;
      rr(ctx, -lw * 1.5, -lw * 0.48, lw * 3, lw * 0.96, lw * 0.48);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    // 車站與標籤
    const label = (x: number, y: number, side: string, text: string, sub: string, k: number, focus: boolean, color: string, r: number) => {
      const fs = S * (focus ? 0.05 : 0.03);
      const fs2 = fs * 0.62;
      ctx.font = `900 ${fs}px ${F}`;
      const w1 = ctx.measureText(text).width;
      ctx.font = `700 ${fs2}px ${F}`;
      const w2 = sub ? ctx.measureText(sub).width : 0;
      const pad = fs * 0.45;
      const bwid = Math.max(w1, w2) + pad * 2;
      const bht = fs * 1.3 + (sub ? fs2 * 1.25 : 0);
      const gap = r + lw * 0.6;
      let lx = x + gap;
      let ly = y - bht / 2;
      if (side === 'L') lx = x - gap - bwid;
      if (side === 'T') {
        lx = x - bwid / 2;
        ly = y - gap - bht;
      }
      if (side === 'B') {
        lx = x - bwid / 2;
        ly = y + gap;
      }
      lx = Math.max(W * 0.01, Math.min(W * 0.99 - bwid, lx));
      ctx.globalAlpha = k;
      ctx.fillStyle = focus ? '#f4c20d' : '#16326b';
      rr(ctx, lx, ly, bwid, bht, fs * 0.28);
      ctx.fill();
      if (focus) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lw * 0.25;
        ctx.stroke();
      }
      ctx.fillStyle = focus ? '#1d2433' : '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = `900 ${fs}px ${F}`;
      ctx.fillText(text, lx + pad, ly + fs * 0.68);
      if (sub) {
        ctx.font = `700 ${fs2}px ${F}`;
        ctx.globalAlpha = k * 0.85;
        ctx.fillText(sub, lx + pad, ly + fs * 1.3 + fs2 * 0.55);
      }
      ctx.globalAlpha = 1;
    };
    const done = new Set<string>();
    const labels: (() => void)[] = [];
    L.forEach(({ l, pts, acc, t0, dur }) => {
      const tot = acc[acc.length - 1] || 1;
      l.st.forEach((s, i) => {
        const tr = t0 + dur * (acc[i] / tot);
        const k = back((t - tr) / 0.35);
        if (k <= 0) return;
        const [x, y] = pts[i];
        const xk = isX(s);
        const key = `${Math.round(x)}|${Math.round(y)}`;
        if (done.has(key)) return;
        done.add(key);
        const r = (s.focus ? lw * 2.6 : xk ? lw * 1.2 : lw * 0.85) * k;
        if (s.focus) {
          // 焦點站：脈衝外圈
          const pq = ((t - tr) % 1.4) / 1.4;
          ctx.globalAlpha = (1 - pq) * 0.7;
          ctx.strokeStyle = '#f4c20d';
          ctx.lineWidth = lw * 0.35;
          ctx.beginPath();
          ctx.arc(x, y, r * (1 + pq * 0.9), 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = s.focus ? '#f4c20d' : xk ? '#1d2433' : l.style === 'rail' ? '#c0392b' : l.color;
        ctx.lineWidth = s.focus ? lw * 0.7 : lw * 0.42;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (s.focus && s.code) {
          ctx.fillStyle = '#16326b';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `900 ${r * 0.62}px ${F}`;
          ctx.fillText(s.code, x, y + r * 0.04, r * 1.6);
        }
        const side = s.side || ((s.has ? s.x : 50) > 62 ? 'L' : 'R');
        const kk = ease((t - tr - 0.15) / 0.4);
        if (kk > 0)
          labels.push(() => {
            if (s.name) label(x, y, side, s.name, s.focus ? '' : s.code, kk, s.focus, l.color, r);
            else if (s.code) {
              ctx.globalAlpha = kk;
              ctx.fillStyle = l.style === 'rail' ? '#c0392b' : l.color;
              ctx.font = `900 ${S * 0.028}px ${F}`;
              ctx.textBaseline = 'middle';
              ctx.textAlign = side === 'L' ? 'right' : 'left';
              ctx.fillText(s.code, x + (side === 'L' ? -1 : 1) * (r + lw * 0.6), y);
              ctx.globalAlpha = 1;
            }
          });
      });
      // 線名標籤
      if (l.name) {
        const k = ease((t - t0 - 0.2) / 0.5);
        if (k > 0) {
          const [x, y] = l.tag ? P(l.tag[0], l.tag[1]) : [pts[0][0], pts[0][1] - lw * 4];
          labels.push(() => {
            const fs = S * 0.034;
            ctx.font = `900 ${fs}px ${F}`;
            const tw = ctx.measureText(l.name).width + fs * 1.2;
            const lx = Math.max(W * 0.01, Math.min(W * 0.99 - tw, x - tw / 2));
            ctx.globalAlpha = k;
            ctx.fillStyle = l.style === 'rail' ? '#c0392b' : l.color;
            rr(ctx, lx, y - fs * 0.8, tw, fs * 1.6, fs * 0.3);
            ctx.fill();
            ctx.fillStyle = textOn(l.style === 'rail' ? '#c0392b' : l.color);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(l.name, lx + fs * 0.6, y + fs * 0.03);
            ctx.globalAlpha = 1;
          });
        }
      }
    });
    labels.forEach((f) => f());
    const last = L.length ? Math.max(...L.map((x) => x.t0 + x.dur)) : 1;
    return last + 2.5;
  };
  return { parse, draw };
};

// 網站本身也用同一套引擎
(globalThis as unknown as { MA_TRANSIT: unknown }).MA_TRANSIT = transitRenderer();
