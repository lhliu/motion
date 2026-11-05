// propkit.ts 的繪製引擎（自給自足，會被序列化進匯出的 HTML）。第一次用到才載入，主程式不打包。


/** 繪製引擎工廠：draw(module, ctx, W, H, params, t, loop) → 物件中心與半高（給文字層排版） */
export const propRenderer = () => {
  const TAU = Math.PI * 2;
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
  const inout = (p: number) => {
    const q = clamp(p);
    return q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
  };
  const back = (p: number) => {
    const q = clamp(p) - 1;
    return 1 + 2.6 * q * q * q + 1.6 * q * q;
  };
  /** 落下回彈：0→1，最後幾下小彈跳 */
  const bounce = (p: number) => {
    const x = clamp(p);
    const n = 7.5625, d = 2.75;
    if (x < 1 / d) return n * x * x;
    if (x < 2 / d) return n * (x - 1.5 / d) ** 2 + 0.75;
    if (x < 2.5 / d) return n * (x - 2.25 / d) ** 2 + 0.9375;
    return n * (x - 2.625 / d) ** 2 + 0.984375;
  };
  const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
  const num = (v: unknown, d: number) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const rng = (seed: number) => {
    let a = (seed * 2654435761) >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let r = Math.imul(a ^ (a >>> 15), 1 | a);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };
  const hex = (c: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(c.trim());
    const n = m ? parseInt(m[1], 16) : 0x888888;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  /** 調亮（k>0）或調暗（k<0） */
  const shade = (c: string, k: number) => {
    const [r, g, b] = hex(c);
    const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  };
  const rr = (x: CanvasRenderingContext2D, X: number, Y: number, w: number, h: number, r: number) => {
    x.beginPath();
    x.roundRect(X, Y, w, h, Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2)));
  };
  const fillRR = (x: CanvasRenderingContext2D, X: number, Y: number, w: number, h: number, r: number, c: string) => {
    rr(x, X, Y, w, h, r);
    x.fillStyle = c;
    x.fill();
  };
  const poly = (x: CanvasRenderingContext2D, pts: number[][], c: string) => {
    x.beginPath();
    pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
    x.closePath();
    x.fillStyle = c;
    x.fill();
  };
  const circle = (x: CanvasRenderingContext2D, X: number, Y: number, r: number, c: string) => {
    x.beginPath();
    x.arc(X, Y, Math.max(0, r), 0, TAU);
    x.fillStyle = c;
    x.fill();
  };
  const line = (x: CanvasRenderingContext2D, a: number, b: number, c2: number, d: number, w: number, c: string, cap: CanvasLineCap = 'round') => {
    x.beginPath();
    x.moveTo(a, b);
    x.lineTo(c2, d);
    x.lineWidth = w;
    x.strokeStyle = c;
    x.lineCap = cap;
    x.stroke();
  };
  const INK = '#1d2433';
  const star = (x: CanvasRenderingContext2D, X: number, Y: number, r: number, c: string, n = 4) => {
    const pts: number[][] = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * TAU - Math.PI / 2, q = i % 2 ? r * 0.36 : r;
      pts.push([X + Math.cos(a) * q, Y + Math.sin(a) * q]);
    }
    poly(x, pts, c);
  };
  /** 雲：幾個圓疊起來的扁平剪影 */
  const cloud = (x: CanvasRenderingContext2D, X: number, Y: number, s: number, c: string) => {
    x.fillStyle = c;
    x.beginPath();
    for (const [dx, dy, r] of [[-0.55, 0.08, 0.32], [-0.2, -0.15, 0.42], [0.25, -0.05, 0.36], [0.6, 0.1, 0.26]]) {
      x.moveTo(X + dx * s + r * s, Y + dy * s);
      x.arc(X + dx * s, Y + dy * s, r * s, 0, TAU);
    }
    x.rect(X - 0.8 * s, Y + 0.05 * s, 1.55 * s, 0.31 * s);
    x.fill();
  };

  /* ───────── 建案工地 ───────── */
  const site = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    const floors = Math.round(num(P.floors, 12)), wall = String(P.color ?? '#d9d2c3'), acc = String(P.color2 ?? '#f2b705');
    const g = cy + S * 0.55, bw = S * 0.46, bx = cx - S * 0.36, fh = (S * 0.95) / floors;
    const p = inout(seg(t, loop * 0.05, loop * 0.82)), built = floors * p, full = Math.floor(built);
    // 樓層
    for (let i = 0; i < Math.min(floors, full + 1); i++) {
      const h = i < full ? fh : fh * (built - full);
      if (h <= 0) continue;
      const y = g - fh * i - h;
      x.fillStyle = i < full ? wall : shade(wall, -0.25);
      x.fillRect(bx, y, bw, h);
      if (i < full) {
        x.fillStyle = shade(wall, -0.18);
        x.fillRect(bx, g - fh * (i + 1), bw, Math.max(1, fh * 0.12));
        for (let k = 0; k < 4; k++) x.fillRect(bx + bw * (0.1 + k * 0.215), y + fh * 0.32, bw * 0.13, fh * 0.46);
        x.fillStyle = '#2a3240';
        for (let k = 0; k < 4; k++) x.fillRect(bx + bw * (0.115 + k * 0.215), y + fh * 0.36, bw * 0.1, fh * 0.38);
      }
    }
    // 頂層施工中的柱子
    const top = g - fh * full;
    if (full < floors) for (let k = 0; k <= 4; k++) x.fillRect(bx + (bw - S * 0.012) * (k / 4), top - fh, S * 0.012, fh);
    if (P.mode === 'rise') {
      // 防塵網從頂部往下收，露出完工的大樓
      const net = full < floors ? 1 : 1 - ease(seg(t, loop * 0.82, loop * 0.95));
      const nh = (g - top + fh) * net;
      if (nh > 0) {
        x.fillStyle = acc;
        x.fillRect(bx - S * 0.02, top - fh, bw + S * 0.04, nh);
        x.fillStyle = shade(acc, -0.22);
        for (let yy = top - fh; yy < top - fh + nh; yy += S * 0.035) x.fillRect(bx - S * 0.02, yy, bw + S * 0.04, S * 0.006);
        for (let k = 0; k < 6; k++) x.fillRect(bx - S * 0.02 + (bw + S * 0.04) * (k / 5) - S * 0.004, top - fh, S * 0.008, nh);
      }
    } else {
      // 起重機：塔身、吊臂、配重、吊鉤載鋼樑上下
      const tx = cx + S * 0.2, th = S * 1.1, ty = g - th, jw = S * 0.62;
      x.fillStyle = acc;
      x.fillRect(tx - S * 0.025, ty, S * 0.05, th);
      x.strokeStyle = shade(acc, -0.35);
      x.lineWidth = S * 0.006;
      x.beginPath();
      for (let yy = ty; yy < g; yy += S * 0.05) {
        x.moveTo(tx - S * 0.025, yy);
        x.lineTo(tx + S * 0.025, yy + S * 0.05);
      }
      x.stroke();
      x.fillRect(tx - jw, ty - S * 0.03, jw + S * 0.2, S * 0.03);
      x.fillStyle = INK;
      x.fillRect(tx + S * 0.1, ty - S * 0.02, S * 0.09, S * 0.07);
      x.fillRect(tx - S * 0.04, ty - S * 0.09, S * 0.08, S * 0.06);
      const cyc = ((t / loop) * Math.max(3, floors / 3)) % 1;
      const lift = cyc < 0.6 ? ease(cyc / 0.6) : 1;
      const trolley = tx - S * 0.12 - (jw - S * 0.2) * (cyc < 0.6 ? 0.25 : 0.25 + 0.6 * inout((cyc - 0.6) / 0.4));
      const hookY = g - S * 0.05 - (g - S * 0.05 - (top - fh * 1.6)) * lift;
      line(x, trolley, ty, trolley, hookY, S * 0.005, INK, 'butt');
      x.fillStyle = INK;
      x.fillRect(trolley - S * 0.02, ty - S * 0.005, S * 0.04, S * 0.02);
      x.fillStyle = shade(acc, -0.45);
      x.fillRect(trolley - S * 0.11, hookY, S * 0.22, S * 0.03);
    }
    // 地面與施工圍籬
    x.fillStyle = '#6b6257';
    x.fillRect(cx - S * 0.7, g, S * 1.4, S * 0.04);
    const fy = g - S * 0.09;
    for (let k = 0; k < 14; k++) {
      x.fillStyle = k % 2 ? INK : acc;
      x.fillRect(cx - S * 0.7 + (S * 1.4 * k) / 14, fy, (S * 1.4) / 14 + 1, S * 0.09);
    }
    return { cx, cy, r: S * 0.62 };
  };

  /* ───────── 交屋鑰匙 ───────── */
  const key = (x: CanvasRenderingContext2D, len: number, c: string, teeth: number) => {
    const w = len * 0.13;
    circle(x, 0, len * 0.16, len * 0.16, c);
    circle(x, 0, len * 0.11, len * 0.06, shade(c, -0.55));
    x.fillStyle = c;
    x.fillRect(-w / 2, len * 0.28, w, len * 0.72);
    for (let i = 0; i < teeth; i++) x.fillRect(w / 2 - 1, len * (0.62 + i * 0.11), len * (0.08 + ((i * 37) % 3) * 0.03), len * 0.07);
    x.fillStyle = shade(c, 0.35);
    x.fillRect(-w / 2, len * 0.3, w * 0.28, len * 0.68);
  };
  const keys = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    const c = String(P.color ?? '#d9b45a'), c2 = String(P.color2 ?? '#ff5a36'), sp = num(P.speed, 1);
    if (P.mode === 'door') {
      const dw = S * 0.5, dh = S * 0.85, dx = cx - dw / 2, dy = cy - dh * 0.4;
      x.fillStyle = shade(c2, -0.5);
      x.fillRect(dx - S * 0.05, dy - S * 0.05, dw + S * 0.1, dh + S * 0.05);
      // 門後的光
      const open = inout(seg(t, loop * 0.42, loop * 0.66));
      x.fillStyle = '#fff4d6';
      x.fillRect(dx, dy, dw, dh);
      if (open > 0) poly(x, [[dx, dy + dh], [dx + dw, dy + dh], [dx + dw + S * 0.5 * open, dy + dh + S * 0.28 * open], [dx - S * 0.5 * open, dy + dh + S * 0.28 * open]], 'rgba(255,244,214,.55)');
      // 門板（以左側為軸變窄）
      const pw = dw * (1 - open * 0.86);
      x.fillStyle = c2;
      x.fillRect(dx, dy, pw, dh);
      x.fillStyle = shade(c2, -0.2);
      x.fillRect(dx + pw * 0.12, dy + dh * 0.08, pw * 0.76, dh * 0.36);
      x.fillRect(dx + pw * 0.12, dy + dh * 0.52, pw * 0.76, dh * 0.4);
      circle(x, dx + pw * 0.86, dy + dh * 0.52, S * 0.022 * (1 - open * 0.6), c);
      // 門牌翻出
      const f = back(seg(t, loop * 0.08, loop * 0.3));
      const ph = S * 0.13 * Math.max(0.02, Math.abs(Math.cos((1 - f) * Math.PI)));
      fillRR(x, cx - S * 0.16, dy - S * 0.2 - ph / 2, S * 0.32, ph, S * 0.02, c);
      if (f > 0.6) {
        x.fillStyle = INK;
        x.font = `900 ${S * 0.07}px system-ui,sans-serif`;
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.save();
        x.translate(cx, dy - S * 0.2);
        x.scale(1, ph / (S * 0.13));
        x.fillText('HOME', 0, S * 0.005);
        x.restore();
      }
      return { cx, cy, r: dh * 0.6 + S * 0.3 };
    }
    // 鑰匙串：掉下來後像鐘擺一樣晃動、漸漸停下
    const drop = bounce(seg(t, 0, loop * 0.22));
    const ry = cy - S * 0.38 - (1 - drop) * H * 0.6;
    const tt = Math.max(0, t - loop * 0.18) * sp;
    const swing = (0.5 * Math.exp(-tt * 0.35) + 0.06) * Math.sin(tt * 3.2);
    x.lineWidth = S * 0.03;
    x.strokeStyle = c;
    x.beginPath();
    x.arc(cx, ry, S * 0.11, 0, TAU);
    x.stroke();
    const n = Math.round(num(P.count, 3));
    for (let i = 0; i < n; i++) {
      const base = (i - (n - 1) / 2) * 0.32;
      x.save();
      x.translate(cx + Math.sin(base) * S * 0.11, ry + Math.cos(base) * S * 0.11);
      x.rotate(base * 0.9 + swing * (1 + i * 0.12));
      key(x, S * (0.46 - Math.abs(i - (n - 1) / 2) * 0.05), i % 2 ? shade(c, -0.12) : c, 2 + (i % 3));
      x.restore();
    }
    // 吊牌
    x.save();
    x.translate(cx - S * 0.1, ry + S * 0.06);
    x.rotate(0.5 + swing * 1.3);
    fillRR(x, -S * 0.06, S * 0.04, S * 0.12, S * 0.2, S * 0.02, c2);
    circle(x, 0, S * 0.07, S * 0.018, shade(c2, -0.5));
    x.restore();
    return { cx, cy: cy - S * 0.05, r: S * 0.5 };
  };

  /* ───────── 家具進場 ───────── */
  const furniture = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    const c = String(P.color ?? '#ff5a36'), c2 = String(P.color2 ?? '#2f6db5'), fy = cy + S * 0.36;
    if (String(P.room ?? '1') !== '0') {
      x.fillStyle = '#e4d7c3';
      x.fillRect(cx - S * 0.75, cy - S * 0.55, S * 1.5, fy - (cy - S * 0.55));
      x.fillStyle = '#b8936a';
      x.fillRect(cx - S * 0.75, fy, S * 1.5, S * 0.16);
      x.fillStyle = '#fff';
      x.fillRect(cx - S * 0.75, fy - S * 0.03, S * 1.5, S * 0.03);
      // 窗
      x.fillStyle = '#9fd3f2';
      x.fillRect(cx + S * 0.25, cy - S * 0.42, S * 0.36, S * 0.36);
      x.fillStyle = '#fff';
      x.fillRect(cx + S * 0.425, cy - S * 0.42, S * 0.012, S * 0.36);
      x.fillRect(cx + S * 0.25, cy - S * 0.245, S * 0.36, S * 0.012);
    }
    const slide = P.mode === 'slide';
    // 每件：x 位置、從哪邊進、繪製
    const items: [number, number, (o: number) => void][] = [
      [-0.12, -1, (o) => {
        // 沙發
        const sx = cx - S * 0.12 + o, w = S * 0.62;
        fillRR(x, sx - w / 2, fy - S * 0.3, w, S * 0.18, S * 0.04, shade(c, -0.15));
        fillRR(x, sx - w / 2 + S * 0.05, fy - S * 0.16, w - S * 0.1, S * 0.12, S * 0.03, c);
        fillRR(x, sx - w / 2 - S * 0.02, fy - S * 0.22, S * 0.09, S * 0.2, S * 0.03, shade(c, -0.25));
        fillRR(x, sx + w / 2 - S * 0.07, fy - S * 0.22, S * 0.09, S * 0.2, S * 0.03, shade(c, -0.25));
        x.fillStyle = INK;
        x.fillRect(sx - w / 2 + S * 0.03, fy - S * 0.03, S * 0.03, S * 0.03);
        x.fillRect(sx + w / 2 - S * 0.06, fy - S * 0.03, S * 0.03, S * 0.03);
      }],
      [0.36, 1, (o) => {
        // 立燈
        const lx = cx + S * 0.36 + o;
        x.fillStyle = INK;
        x.fillRect(lx - S * 0.008, fy - S * 0.5, S * 0.016, S * 0.5);
        x.fillRect(lx - S * 0.06, fy - S * 0.015, S * 0.12, S * 0.015);
        poly(x, [[lx - S * 0.05, fy - S * 0.62], [lx + S * 0.05, fy - S * 0.62], [lx + S * 0.09, fy - S * 0.5], [lx - S * 0.09, fy - S * 0.5]], c2);
      }],
      [0.55, 1, (o) => {
        // 邊桌與盆栽
        const tx = cx + S * 0.56 + o;
        x.fillStyle = shade(c2, -0.3);
        x.fillRect(tx - S * 0.09, fy - S * 0.16, S * 0.18, S * 0.025);
        x.fillRect(tx - S * 0.075, fy - S * 0.14, S * 0.015, S * 0.14);
        x.fillRect(tx + S * 0.06, fy - S * 0.14, S * 0.015, S * 0.14);
        poly(x, [[tx - S * 0.04, fy - S * 0.24], [tx + S * 0.04, fy - S * 0.24], [tx + S * 0.03, fy - S * 0.16], [tx - S * 0.03, fy - S * 0.16]], '#c46a3a');
        for (const [a, r] of [[-0.6, 0.07], [0, 0.09], [0.6, 0.07]]) {
          x.save();
          x.translate(tx, fy - S * 0.24);
          x.rotate(a);
          x.beginPath();
          x.ellipse(0, -r * S * 0.7, S * 0.025, r * S * 0.7, 0, 0, TAU);
          x.fillStyle = '#3aa04a';
          x.fill();
          x.restore();
        }
      }],
      [-0.5, -1, (o) => {
        // 掛畫
        const px = cx - S * 0.42 + o, py = cy - S * 0.38;
        x.fillStyle = INK;
        x.fillRect(px - S * 0.13, py, S * 0.26, S * 0.19);
        x.fillStyle = '#fff3e2';
        x.fillRect(px - S * 0.11, py + S * 0.02, S * 0.22, S * 0.15);
        poly(x, [[px - S * 0.11, py + S * 0.17], [px - S * 0.03, py + S * 0.07], [px + S * 0.03, py + S * 0.13], [px + S * 0.06, py + S * 0.1], [px + S * 0.11, py + S * 0.17]], c);
        circle(x, px + S * 0.06, py + S * 0.06, S * 0.018, c2);
      }],
    ];
    items.forEach(([, side, draw], i) => {
      const p = seg(t, loop * (0.06 + i * 0.12), loop * (0.24 + i * 0.12));
      if (p <= 0) return;
      x.save();
      if (slide) {
        draw(side * W * (1 - back(p)));
      } else {
        const b = bounce(p);
        x.translate(0, -(1 - b) * H * 0.8);
        draw(0);
      }
      x.restore();
    });
    return { cx, cy, r: S * 0.6 };
  };

  /* ───────── 等角小屋 ───────── */
  const house = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    const wall = String(P.color ?? '#f3efe6'), roof = String(P.color2 ?? '#d64541'), fl = Math.round(num(P.floors, 2));
    const k = S * 0.42, cos = Math.cos(Math.PI / 6), sin = 0.5, base = cy + S * 0.32;
    const pt = (a: number, b: number, z: number) => [cx + (a - b) * cos * k, base + (a + b) * sin * k - z * k - k * 0.4];
    const night = P.mode === 'night';
    const pf = night ? 1 : ease(seg(t, 0, loop * 0.1));
    const pw = night ? 1 : ease(seg(t, loop * 0.1, loop * 0.38));
    const pr = night ? 1 : bounce(seg(t, loop * 0.4, loop * 0.56));
    const pwin = night ? 1 : seg(t, loop * 0.56, loop * 0.72);
    const A = 1.1, B = 0.85, Hh = 0.55 * fl;
    // 地基
    if (pf > 0) {
      const e = 0.12 * pf;
      poly(x, [pt(-e, -e, 0), pt(A + e, -e, 0), pt(A + e, B + e, 0), pt(-e, B + e, 0)], '#8b9198');
    }
    const h = Hh * pw;
    if (h > 0) {
      // 右面（a 方向）與左面（b 方向）
      poly(x, [pt(0, B, 0), pt(A, B, 0), pt(A, B, h), pt(0, B, h)], wall);
      poly(x, [pt(A, 0, 0), pt(A, B, 0), pt(A, B, h), pt(A, 0, h)], shade(wall, -0.18));
      // 窗戶與門
      const lit = (i: number) => (night ? Math.floor((t / loop) * 6 + i * 1.7) % 3 !== 0 : false);
      for (let f = 0; f < fl; f++) {
        const z0 = 0.55 * f;
        if (z0 + 0.4 > h) break;
        for (let j = 0; j < 2; j++) {
          if (f === 0 && j === 0) continue;
          const a0 = 0.18 + j * 0.5, show = night || pwin * 4 > f * 2 + j;
          if (!show) continue;
          const col = lit(f * 2 + j) ? '#ffd23f' : '#2a3240';
          poly(x, [pt(a0, B, z0 + 0.14), pt(a0 + 0.26, B, z0 + 0.14), pt(a0 + 0.26, B, z0 + 0.4), pt(a0, B, z0 + 0.4)], col);
        }
        const show = night || pwin * 4 > f * 2 + 1;
        if (show) {
          const col = lit(f * 2 + 5) ? '#ffd23f' : '#2a3240';
          poly(x, [pt(A, 0.25, z0 + 0.14), pt(A, 0.55, z0 + 0.14), pt(A, 0.55, z0 + 0.4), pt(A, 0.25, z0 + 0.4)], col);
        }
      }
      if (pwin > 0 || night) poly(x, [pt(0.2, B, 0), pt(0.45, B, 0), pt(0.45, B, 0.42), pt(0.2, B, 0.42)], shade(roof, -0.25));
    }
    // 屋頂（沿 a 方向的山形）從上方掉下
    if (pr > 0) {
      const dz = (1 - pr) * 2.2, z = Hh + dz, rh = 0.55, o = 0.1;
      poly(x, [pt(-o, B + o, z), pt(A + o, B + o, z), pt(A + o, B / 2, z + rh), pt(-o, B / 2, z + rh)], roof);
      poly(x, [pt(A + o, -o, z), pt(A + o, B + o, z), pt(A + o, B / 2, z + rh)], shade(roof, -0.28));
      poly(x, [pt(A + o, B / 2, z + rh), pt(-o, B / 2, z + rh), pt(-o, B / 2 - 0.02, z + rh + 0.03), pt(A + o, B / 2 - 0.02, z + rh + 0.03)], shade(roof, -0.45));
      // 煙囪與煙
      poly(x, [pt(0.2, B * 0.3, z + 0.2), pt(0.38, B * 0.3, z + 0.2), pt(0.38, B * 0.3, z + 0.75), pt(0.2, B * 0.3, z + 0.75)], shade(wall, -0.3));
      if (night || pr >= 1)
        for (let i = 0; i < 3; i++) {
          const q = ((t / loop) * 2 + i / 3) % 1, [sx, sy] = pt(0.29, B * 0.3, z + 0.8 + q * 0.9);
          circle(x, sx + Math.sin(q * 6) * k * 0.05, sy, k * (0.06 + q * 0.07), `rgba(240,240,240,${(1 - q) * 0.85})`);
        }
    }
    return { cx, cy, r: S * 0.55 };
  };

  /* ───────── 合約文件 ───────── */
  const contract = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    const paper = String(P.color ?? '#ffffff'), red = String(P.color2 ?? '#d64541'), pw = S * 0.62, ph = S * 0.82;
    const lines = (ox: number, oy: number, a: number) => {
      x.fillStyle = INK;
      x.fillRect(ox + pw * 0.12, oy + ph * 0.08, pw * 0.5, ph * 0.045);
      x.fillStyle = `rgba(29,36,51,${0.25 * a})`;
      for (let i = 0; i < 8; i++) x.fillRect(ox + pw * 0.12, oy + ph * (0.2 + i * 0.065), pw * (i % 3 === 2 ? 0.5 : 0.76), ph * 0.022);
    };
    if (P.mode === 'flip') {
      const n = 4, ph2 = (t / loop) * n, i = Math.floor(ph2), q = inout(ph2 - i);
      for (let k = 3; k >= 1; k--) {
        x.fillStyle = shade(paper, -0.06 * k);
        x.fillRect(cx - pw / 2 + k * S * 0.012, cy - ph / 2 + k * S * 0.012, pw, ph);
      }
      x.fillStyle = paper;
      x.fillRect(cx - pw / 2, cy - ph / 2, pw, ph);
      lines(cx - pw / 2, cy - ph / 2, 1);
      // 翻起的那頁：以左邊為軸，寬度依 cos 縮放，翻過一半看到背面
      const sw = Math.cos(q * Math.PI);
      x.fillStyle = sw >= 0 ? paper : shade(paper, -0.12);
      x.fillRect(cx - pw / 2, cy - ph / 2, pw * sw, ph);
      if (sw > 0.05) {
        x.save();
        x.translate(cx - pw / 2, 0);
        x.scale(sw, 1);
        lines(0, cy - ph / 2, 1);
        x.restore();
      }
      x.fillStyle = INK;
      x.font = `700 ${S * 0.045}px system-ui,sans-serif`;
      x.textAlign = 'right';
      x.textBaseline = 'alphabetic';
      x.fillText(`${(i % n) + 1} / ${n}`, cx + pw / 2 - S * 0.03, cy + ph / 2 - S * 0.03);
      return { cx, cy, r: ph * 0.55 };
    }
    // 簽名蓋章：紙滑入 → 簽名寫出 → 印章蓋下
    const pin = back(seg(t, 0, loop * 0.16));
    const ox = cx - pw / 2 + (1 - pin) * W * 0.6, oy = cy - ph / 2;
    x.save();
    x.translate(ox + pw / 2, oy + ph / 2);
    x.rotate(-0.04);
    x.translate(-(ox + pw / 2), -(oy + ph / 2));
    x.fillStyle = paper;
    x.fillRect(ox, oy, pw, ph);
    lines(ox, oy, 1);
    x.fillStyle = INK;
    x.fillRect(ox + pw * 0.12, oy + ph * 0.86, pw * 0.42, ph * 0.006);
    // 簽名：一條連續的波浪線逐段畫出
    const sp = seg(t, loop * 0.2, loop * 0.5), N = 60;
    x.beginPath();
    for (let i = 0; i <= N * sp; i++) {
      const u = i / N, X = ox + pw * (0.14 + u * 0.38), Y = oy + ph * (0.82 - Math.sin(u * 19) * 0.035 * (1 - u * 0.4) - Math.sin(u * 7) * 0.012);
      i ? x.lineTo(X, Y) : x.moveTo(X, Y);
    }
    x.lineWidth = S * 0.012;
    x.lineJoin = x.lineCap = 'round';
    x.strokeStyle = '#1f3a8a';
    x.stroke();
    // 印章
    const st = seg(t, loop * 0.56, loop * 0.64);
    if (st > 0) {
      const sc2 = 1 + (1 - ease(st)) * 0.8, X = ox + pw * 0.74, Y = oy + ph * 0.8, r = S * 0.09 * sc2;
      x.globalAlpha = st;
      x.lineWidth = S * 0.012;
      x.strokeStyle = red;
      x.beginPath();
      x.arc(X, Y, r, 0, TAU);
      x.stroke();
      x.beginPath();
      x.arc(X, Y, r * 0.8, 0, TAU);
      x.stroke();
      x.fillStyle = red;
      x.font = `900 ${r * 0.62}px "Noto Serif TC",serif`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('核准', X, Y + r * 0.04);
      x.globalAlpha = 1;
    }
    x.restore();
    return { cx, cy, r: ph * 0.55 };
  };

  /* ───────── 城市天際線 ───────── */
  const skyline = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.8), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.45) * H;
    const n = Math.round(num(P.count, 12)), col = String(P.color ?? '#2b3a55'), light = String(P.color2 ?? '#ffd23f');
    const r = rng(Math.round(num(P.seed, 5))), width = Math.max(W * 0.95, S * 1.3), g = cy + S * 0.4, x0 = cx - width / 2;
    const night = P.mode === 'daynight' ? (Math.sin((t / loop) * TAU - Math.PI / 2) + 1) / 2 : 0.15;
    if (P.mode === 'daynight') {
      // 天色帶：日↔夜，太陽月亮沿弧線交替
      const sky = (a: string, b: string, k: number) => {
        const A = hex(a), B = hex(b);
        return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
      };
      x.fillStyle = sky('#9fd3f2', '#162238', night);
      x.fillRect(0, 0, W, g);
      const a = Math.PI * (1 - ((t / loop) % 1)) * 2;
      const ox = cx + Math.cos(a) * S * 0.6, oy = g - Math.abs(Math.sin(a)) * S * 0.75;
      circle(x, ox, oy, S * 0.07, night < 0.5 ? '#ffd23f' : '#f3efe6');
      if (night > 0.6) for (let i = 0; i < 24; i++) circle(x, x0 + r() * width, r() * (g - S * 0.5), S * 0.004 * (1 + (i % 3)), `rgba(255,255,255,${(night - 0.6) * 2.5})`);
    }
    const bw = width / n;
    for (let i = 0; i < n; i++) {
      const hgt = S * (0.25 + r() * 0.6) * (i % 4 === 1 ? 1.2 : 1), kind = Math.floor(r() * 3);
      const grow = P.mode === 'grow' ? back(seg(t, loop * (0.04 + (i / n) * 0.5), loop * (0.2 + (i / n) * 0.5))) : 1;
      const h = hgt * grow, bx = x0 + i * bw + bw * 0.06, w = bw * 0.88;
      if (h <= 0) continue;
      const c = i % 2 ? col : shade(col, 0.12);
      x.fillStyle = c;
      x.fillRect(bx, g - h, w, h);
      if (kind === 1) x.fillRect(bx + w * 0.2, g - h - S * 0.05 * grow, w * 0.6, S * 0.05 * grow);
      if (kind === 2) {
        x.fillRect(bx + w * 0.47, g - h - S * 0.12 * grow, w * 0.06, S * 0.12 * grow);
        circle(x, bx + w * 0.5, g - h - S * 0.12 * grow, S * 0.008, '#ff5a36');
      }
      // 窗戶
      const rows = Math.floor(h / (S * 0.045)), cols = Math.max(1, Math.floor(w / (S * 0.04)));
      for (let a = 0; a < rows; a++)
        for (let b = 0; b < cols; b++) {
          const on = (Math.sin(i * 12.9 + a * 7.3 + b * 3.1) + 1) / 2 < 0.25 + night * 0.65;
          x.fillStyle = on ? light : shade(c, -0.25);
          x.fillRect(bx + w * 0.12 + b * ((w * 0.76) / cols), g - h + S * 0.02 + a * S * 0.045, (w * 0.76) / cols - S * 0.012, S * 0.022);
        }
    }
    x.fillStyle = shade(col, -0.35);
    x.fillRect(x0, g, width, S * 0.05);
    return { cx, cy, r: S * 0.45 };
  };

  /* ───────── 颱風路徑預報（示意圖） ───────── */
  // 台灣本島海岸線概略座標（經度, 緯度），只求輪廓可辨識
  const TAIWAN = [[121.53, 25.3], [121.75, 25.15], [122.0, 25.01], [121.83, 24.75], [121.86, 24.6], [121.62, 23.98], [121.4, 23.1], [121.15, 22.75], [120.9, 22.35], [120.85, 21.9], [120.74, 21.93], [120.58, 22.35], [120.27, 22.6], [120.12, 23.0], [120.15, 23.45], [120.4, 24.05], [120.53, 24.3], [120.75, 24.62], [120.92, 24.85], [121.1, 25.05], [121.4, 25.18]];
  // 示意路徑：兩個過去位置、現在位置、24／48／72 小時預報點
  const TRACKS: Record<string, number[][]> = {
    cross: [[127.5, 18.6], [126.2, 19.6], [124.8, 20.7], [122.9, 22.3], [121.0, 23.8], [119.0, 25.4]],
    north: [[127.6, 18.8], [126.6, 20.0], [125.6, 21.3], [124.4, 23.0], [123.6, 25.0], [123.6, 27.0]],
    south: [[127.4, 18.4], [125.9, 19.1], [124.4, 19.8], [122.4, 20.7], [120.4, 21.4], [118.2, 22.1]],
    east: [[127.5, 18.5], [126.3, 19.7], [125.2, 21.0], [124.3, 22.8], [124.1, 24.8], [125.0, 26.8]],
  };
  const typhoonMark = (x: CanvasRenderingContext2D, X: number, Y: number, r: number, rot: number, c: string) => {
    x.save();
    x.translate(X, Y);
    x.rotate(rot);
    x.lineWidth = r * 0.42;
    x.strokeStyle = c;
    x.lineCap = 'round';
    for (const s of [1, -1]) {
      x.beginPath();
      x.arc(0, 0, r, s > 0 ? -Math.PI / 2 : Math.PI / 2, s > 0 ? 0.35 : Math.PI + 0.35);
      x.stroke();
    }
    x.restore();
    circle(x, X, Y, r * 0.55, c);
  };
  const forecast = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.95), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    const side = S * 1.0, x0 = cx - side / 2, y0 = cy - side / 2, q = t / loop;
    const c2 = String(P.color2 ?? '#ff5a36'), mark = String(P.color ?? '#ffffff');
    // 經度方向乘上 cos(23.5°) 修正，畫面 side 對應緯度 18–28°
    const L0 = 116.5, L1 = 116.5 + 10 / 0.917;
    const pr = (lon: number, lat: number) => [x0 + ((lon - L0) / (L1 - L0)) * side, y0 + ((28 - lat) / 10) * side];
    const deg = side / 10;
    x.save();
    x.beginPath();
    x.rect(x0, y0, side, side);
    x.clip();
    x.fillStyle = '#163a5c';
    x.fillRect(x0, y0, side, side);
    x.strokeStyle = 'rgba(255,255,255,.14)';
    x.lineWidth = Math.max(1, side * 0.002);
    x.beginPath();
    for (let lon = 118; lon <= 127; lon += 2) {
      const [X] = pr(lon, 0);
      x.moveTo(X, y0);
      x.lineTo(X, y0 + side);
    }
    for (let lat = 18; lat <= 28; lat += 2) {
      const [, Y] = pr(120, lat);
      x.moveTo(x0, Y);
      x.lineTo(x0 + side, Y);
    }
    x.stroke();
    // 台灣
    const track = TRACKS[String(P.track)] ?? TRACKS.cross;
    const near = track.slice(2).some(([lo, la]) => Math.hypot((lo - 121) * 0.917, la - 23.7) < 2.2);
    const warn = near && q > 0.45 && Math.floor(t * 2) % 2 === 0;
    poly(x, TAIWAN.map(([lo, la]) => pr(lo, la)), warn ? '#ff8a65' : '#d9cfb8');
    // 70% 機率範圍：各時間點的圓與相鄰圓之間的切線帶，合成一個路徑一次填色
    const radii = [0, 0, 0.55, 1.05, 1.6, 2.3];
    const show = (k: number) => back(seg(q, 0.28 + (k - 3) * 0.1, 0.38 + (k - 3) * 0.1));
    x.beginPath();
    for (let k = 2; k < track.length; k++) {
      const s = k === 2 ? 1 : show(k);
      if (s <= 0) continue;
      const [X, Y] = pr(track[k][0], track[k][1]), rr2 = radii[k] * deg * s;
      x.moveTo(X + rr2, Y);
      x.arc(X, Y, rr2, 0, TAU);
      if (k > 2) {
        const [X0, Y0] = pr(track[k - 1][0], track[k - 1][1]), r0 = radii[k - 1] * deg * (k - 1 === 2 ? 1 : show(k - 1));
        const a = Math.atan2(Y - Y0, X - X0) + Math.PI / 2, nx = Math.cos(a), ny = Math.sin(a);
        x.moveTo(X0 + nx * r0, Y0 + ny * r0);
        x.lineTo(X0 - nx * r0, Y0 - ny * r0);
        x.lineTo(X - nx * rr2, Y - ny * rr2);
        x.lineTo(X + nx * rr2, Y + ny * rr2);
        x.closePath();
      }
    }
    x.fillStyle = `rgba(${hex(c2).join(',')},.28)`;
    x.fill('nonzero');
    // 過去路徑（實線）→ 現在 → 預報（虛線依序畫出）
    const P0 = track.map(([lo, la]) => pr(lo, la));
    x.lineCap = 'round';
    x.lineWidth = side * 0.008;
    x.strokeStyle = '#ffffff';
    x.beginPath();
    x.moveTo(P0[0][0], P0[0][1]);
    for (let k = 1; k <= 2; k++) x.lineTo(P0[k][0], P0[k][1]);
    x.stroke();
    x.setLineDash([side * 0.02, side * 0.016]);
    x.strokeStyle = c2;
    x.beginPath();
    x.moveTo(P0[2][0], P0[2][1]);
    const drawn = clamp((q - 0.25) / 0.35) * 3;
    for (let k = 3; k < 6; k++) {
      const f = clamp(drawn - (k - 3));
      if (f <= 0) break;
      x.lineTo(P0[k - 1][0] + (P0[k][0] - P0[k - 1][0]) * f, P0[k - 1][1] + (P0[k][1] - P0[k - 1][1]) * f);
    }
    x.stroke();
    x.setLineDash([]);
    for (let k = 0; k < 2; k++) circle(x, P0[k][0], P0[k][1], side * 0.01, '#ffffff');
    x.font = `700 ${side * 0.032}px "JetBrains Mono",monospace`;
    x.textAlign = 'left';
    x.textBaseline = 'middle';
    for (let k = 3; k < 6; k++) {
      const s = show(k);
      if (s <= 0.3) continue;
      circle(x, P0[k][0], P0[k][1], side * 0.012, c2);
      x.fillStyle = '#ffffff';
      x.fillText(`${(k - 2) * 24}h`, P0[k][0] + side * 0.025, P0[k][1] - side * 0.025);
    }
    // 颱風符號：現在位置持續旋轉；後段沿預報線再走一次
    typhoonMark(x, P0[2][0], P0[2][1], side * 0.035 * (1 + 0.06 * Math.sin(q * TAU * 6)), -q * TAU * 3, mark);
    const g = seg(q, 0.62, 0.95);
    if (g > 0 && g < 1) {
      const u = g * 3, k = Math.min(2, Math.floor(u)), f = u - k, a = P0[2 + k], b = P0[3 + k];
      x.globalAlpha = 0.6;
      typhoonMark(x, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, side * 0.028, -q * TAU * 3, mark);
      x.globalAlpha = 1;
    }
    // 圖例與註記
    x.fillStyle = 'rgba(10,20,35,.75)';
    x.fillRect(x0, y0, side, side * 0.075);
    x.fillStyle = '#ffffff';
    x.font = `700 ${side * 0.034}px system-ui,sans-serif`;
    x.textBaseline = 'middle';
    x.textAlign = 'left';
    typhoonMark(x, x0 + side * 0.045, y0 + side * 0.0375, side * 0.014, 0, mark);
    x.fillText('颱風中心', x0 + side * 0.075, y0 + side * 0.0375);
    x.fillStyle = `rgba(${hex(c2).join(',')},.55)`;
    x.fillRect(x0 + side * 0.33, y0 + side * 0.022, side * 0.04, side * 0.03);
    x.fillStyle = '#ffffff';
    x.fillText('70% 機率範圍', x0 + side * 0.385, y0 + side * 0.0375);
    x.strokeStyle = c2;
    x.lineWidth = side * 0.006;
    x.setLineDash([side * 0.012, side * 0.01]);
    x.beginPath();
    x.moveTo(x0 + side * 0.66, y0 + side * 0.0375);
    x.lineTo(x0 + side * 0.72, y0 + side * 0.0375);
    x.stroke();
    x.setLineDash([]);
    x.fillText('預報路徑', x0 + side * 0.735, y0 + side * 0.0375);
    x.font = `500 ${side * 0.026}px system-ui,sans-serif`;
    x.textAlign = 'right';
    x.textBaseline = 'alphabetic';
    x.fillStyle = 'rgba(255,255,255,.7)';
    x.fillText('示意圖，實際路徑以中央氣象署預報為準', x0 + side * 0.97, y0 + side * 0.97);
    x.restore();
    x.strokeStyle = '#ffffff';
    x.lineWidth = side * 0.006;
    x.strokeRect(x0, y0, side, side);
    return { cx, cy, r: side * 0.55 };
  };

  /* ───────── 天氣 ───────── */
  const weather = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.38) * H;
    const c = String(P.color ?? '#e9eef3'), c2 = String(P.color2 ?? '#5b9bd5'), amt = num(P.amount, 1), sp = num(P.speed, 1);
    const mode = String(P.mode ?? 'rain'), q = t / loop;
    if (mode === 'forecast') return forecast(x, W, H, P, t, loop);
    if (mode === 'sun') {
      const R = S * 0.24, rot = q * TAU * 0.25 * sp;
      x.save();
      x.translate(cx, cy);
      x.rotate(rot);
      for (let i = 0; i < 12; i++) {
        x.rotate(TAU / 12);
        const L = R * (1.45 + 0.12 * Math.sin(q * TAU * 3 + i) * amt);
        poly(x, [[-R * 0.12, -R * 1.12], [R * 0.12, -R * 1.12], [0, -L]], c2);
      }
      x.restore();
      circle(x, cx, cy, R * (1 + 0.03 * Math.sin(q * TAU * 4)), c2);
      circle(x, cx - R * 0.25, cy - R * 0.25, R * 0.35, shade(c2, 0.35));
      const dx = ((q * sp * 1.2) % 1.4) - 0.7;
      cloud(x, cx + dx * W, cy + S * 0.3, S * 0.28, c);
      return { cx, cy, r: S * 0.42 };
    }
    if (mode === 'typhoon') {
      const rot = -q * TAU * 1.5 * sp;
      for (let arm = 0; arm < 3; arm++) {
        x.beginPath();
        for (let i = 0; i <= 60; i++) {
          const u = i / 60, a = rot + arm * (TAU / 3) + u * 4.2, r = S * (0.06 + u * 0.5);
          const X = cx + Math.cos(a) * r, Y = cy + Math.sin(a) * r * 0.82;
          i ? x.lineTo(X, Y) : x.moveTo(X, Y);
        }
        x.lineWidth = S * 0.07;
        x.lineCap = 'round';
        x.strokeStyle = arm % 2 ? c : shade(c, -0.12);
        x.stroke();
      }
      circle(x, cx, cy, S * 0.06, shade(c2, -0.3));
      // 風線與飛走的葉子
      for (let i = 0; i < Math.round(8 * amt); i++) {
        const p = (q * 2 * sp + i / 8) % 1, y = cy - S * 0.5 + ((i * 37) % 100) / 100 * S;
        line(x, cx - S + p * S * 2.4, y, cx - S + p * S * 2.4 + S * 0.25, y, S * 0.012, c);
        circle(x, cx - S + p * S * 2.4 + S * 0.3, y + Math.sin(p * 12) * S * 0.03, S * 0.018, '#3aa04a');
      }
      return { cx, cy, r: S * 0.55 };
    }
    if (mode === 'fog') {
      // 遠景剪影 + 幾層霧帶左右飄移
      const g = cy + S * 0.42, r = rng(11);
      for (let i = 0; i < 9; i++) {
        const h = S * (0.25 + r() * 0.45), bx = cx - S * 0.9 + i * S * 0.2;
        x.fillStyle = shade(c2, -0.35);
        x.fillRect(bx, g - h, S * 0.17, h);
      }
      for (let k = 0; k < 5; k++) {
        const dir = k % 2 ? 1 : -1, off = Math.sin(q * TAU * sp + k) * S * 0.25 * dir, y = cy - S * 0.35 + k * S * 0.17;
        x.fillStyle = `rgba(${hex(c).join(',')},${0.45 + 0.1 * amt})`;
        rr(x, cx - S * 1.2 + off, y, S * 2.4, S * 0.1, S * 0.05);
        x.fill();
      }
      return { cx, cy, r: S * 0.5 };
    }
    // 下雨：雲上下浮動，雨絲斜斜落下，地面濺起小水花
    const by = Math.sin(q * TAU) * S * 0.02;
    const drops = Math.round(40 * amt), gy = cy + S * 0.62;
    for (let i = 0; i < drops; i++) {
      const p = (q * 3 * sp + ((i * 0.618) % 1)) % 1;
      const X = cx - S * 0.5 + ((i * 53) % 100) / 100 * S, Y = cy + S * 0.08 + p * (gy - cy - S * 0.08);
      line(x, X, Y, X - S * 0.02, Y + S * 0.07, S * 0.012, c2);
      if (p > 0.92) {
        const s2 = (p - 0.92) / 0.08;
        x.beginPath();
        x.ellipse(X - S * 0.02, gy + S * 0.02, S * 0.05 * s2, S * 0.012 * s2, 0, Math.PI, TAU);
        x.lineWidth = S * 0.008;
        x.strokeStyle = c2;
        x.stroke();
      }
    }
    cloud(x, cx, cy + by, S * 0.42, shade(c, -0.08));
    cloud(x, cx + S * 0.12, cy - S * 0.05 + by, S * 0.3, c);
    return { cx, cy: cy + S * 0.15, r: S * 0.55 };
  };

  /* ───────── 交通號誌 ───────── */
  const digits = (x: CanvasRenderingContext2D, s: string, X: number, Y: number, size: number, c: string) => {
    x.fillStyle = c;
    x.font = `700 ${size}px "MA Num","JetBrains Mono",monospace`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(s, X, Y);
  };
  const signal = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    const box = String(P.color ?? '#1d2433'), dc = String(P.color2 ?? '#ffffff'), total = Math.round(num(P.count, 10)), q = t / loop;
    if (P.mode === 'walk') {
      // 斑馬線
      const g = cy + S * 0.38;
      for (let i = 0; i < 6; i++) {
        const y0 = g + i * S * 0.05, y1 = y0 + S * 0.028, w0 = S * (0.6 + i * 0.12);
        poly(x, [[cx - w0 / 2, y0], [cx + w0 / 2, y0], [cx + (w0 + S * 0.06) / 2, y1], [cx - (w0 + S * 0.06) / 2, y1]], '#f3efe6');
      }
      const walk = q < 0.7, bw = S * 0.34, bh = S * 0.62, bx = cx - bw / 2 - S * 0.16, by = cy - bh * 0.62;
      x.fillStyle = INK;
      x.fillRect(bx + bw / 2 - S * 0.015, by + bh, S * 0.03, g - by - bh);
      fillRR(x, bx, by, bw, bh, S * 0.03, box);
      fillRR(x, bx + S * 0.03, by + S * 0.03, bw - S * 0.06, bh / 2 - S * 0.045, S * 0.02, '#0d1118');
      fillRR(x, bx + S * 0.03, by + bh / 2 + S * 0.015, bw - S * 0.06, bh / 2 - S * 0.045, S * 0.02, '#0d1118');
      // 人形：上格紅色站立、下格綠色走路
      const fig = (X: number, Y: number, c: string, step: number, on: boolean) => {
        const k = S * 0.11, a = on ? Math.sin(step) * 0.6 : 0;
        circle(x, X, Y - k * 0.95, k * 0.18, on ? c : '#2a3240');
        x.lineCap = 'round';
        const col = on ? c : '#2a3240';
        line(x, X, Y - k * 0.75, X, Y - k * 0.2, k * 0.2, col);
        line(x, X, Y - k * 0.2, X + Math.sin(a) * k * 0.5, Y + k * 0.42, k * 0.16, col);
        line(x, X, Y - k * 0.2, X - Math.sin(a) * k * 0.5, Y + k * 0.42, k * 0.16, col);
        line(x, X, Y - k * 0.62, X - Math.sin(a) * k * 0.45, Y - k * 0.1, k * 0.13, col);
        line(x, X, Y - k * 0.62, X + Math.sin(a) * k * 0.45, Y - k * 0.1, k * 0.13, col);
      };
      fig(bx + bw / 2, by + bh * 0.27, '#e53935', 0, !walk);
      const blink = walk && q > 0.5 && Math.floor(t * 4) % 2 === 0;
      fig(bx + bw / 2, by + bh * 0.76, '#2ecc71', q * loop * 7, walk && !blink);
      const left = walk ? Math.ceil(total * (1 - q / 0.7)) : Math.ceil(total * 0.6 * (1 - (q - 0.7) / 0.3));
      fillRR(x, bx + bw + S * 0.04, by + bh * 0.4, S * 0.26, S * 0.2, S * 0.025, box);
      digits(x, String(Math.max(0, left)).padStart(2, '0'), bx + bw + S * 0.17, by + bh * 0.5, S * 0.14, walk ? '#2ecc71' : dc);
      return { cx, cy, r: S * 0.74 };
    }
    // 紅綠燈：綠 → 黃 → 紅，旁邊倒數
    const phase = q < 0.5 ? 2 : q < 0.62 ? 1 : 0;
    const bw = S * 0.26, bh = S * 0.72, bx = cx - bw / 2 - S * 0.12, by = cy - bh / 2;
    x.fillStyle = INK;
    x.fillRect(bx + bw / 2 - S * 0.02, by + bh, S * 0.04, S * 0.4);
    fillRR(x, bx, by, bw, bh, S * 0.05, box);
    const cols = ['#e53935', '#ffc107', '#2ecc71'];
    for (let i = 0; i < 3; i++) {
      const Y = by + bh * (0.18 + i * 0.32);
      fillRR(x, bx - S * 0.02, Y - S * 0.1, bw + S * 0.04, S * 0.04, S * 0.01, shade(box, 0.15));
      circle(x, bx + bw / 2, Y + S * 0.01, S * 0.085, i === phase ? cols[i] : shade(cols[i], -0.72));
      if (i === phase) circle(x, bx + bw / 2 - S * 0.03, Y - S * 0.02, S * 0.022, 'rgba(255,255,255,.55)');
    }
    const span = phase === 2 ? [0, 0.5] : phase === 1 ? [0.5, 0.62] : [0.62, 1];
    const left = Math.ceil(total * (1 - (q - span[0]) / (span[1] - span[0])) * (span[1] - span[0]) * 2);
    fillRR(x, bx + bw + S * 0.05, cy - S * 0.1, S * 0.28, S * 0.2, S * 0.025, box);
    digits(x, String(Math.max(0, left)).padStart(2, '0'), bx + bw + S * 0.19, cy, S * 0.14, phase === 2 ? cols[2] : phase === 1 ? cols[1] : dc);
    return { cx, cy, r: S * 0.6 };
  };

  /* ───────── 植物 ───────── */
  const leaf = (x: CanvasRenderingContext2D, X: number, Y: number, len: number, ang: number, c: string) => {
    x.save();
    x.translate(X, Y);
    x.rotate(ang);
    x.beginPath();
    x.moveTo(0, 0);
    x.quadraticCurveTo(len * 0.5, -len * 0.32, len, 0);
    x.quadraticCurveTo(len * 0.5, len * 0.32, 0, 0);
    x.fillStyle = c;
    x.fill();
    x.restore();
  };
  const plant = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    const green = String(P.color ?? '#3aa04a'), brown = String(P.color2 ?? '#c46a3a'), q = t / loop;
    if (P.mode === 'seasons') {
      // 四季：春粉、夏綠、秋橘、冬白；掉落花瓣、葉子或雪
      const k = q * 4, s = Math.floor(k) % 4, mix = clamp((k - Math.floor(k) - 0.8) / 0.2);
      const cols = ['#f6a5c0', green, '#e8833a', '#f3f6f8'];
      const lerp = (a: string, b: string, m: number) => {
        const A = hex(a), B = hex(b);
        return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * m)).join(',')})`;
      };
      const cnow = lerp(cols[s], cols[(s + 1) % 4], mix), g = cy + S * 0.5;
      x.fillStyle = shade(brown, -0.3);
      poly(x, [[cx - S * 0.05, g], [cx + S * 0.05, g], [cx + S * 0.03, cy], [cx - S * 0.03, cy]], shade(brown, -0.3));
      line(x, cx, cy + S * 0.08, cx + S * 0.14, cy - S * 0.06, S * 0.03, shade(brown, -0.3));
      line(x, cx, cy + S * 0.14, cx - S * 0.15, cy, S * 0.03, shade(brown, -0.3));
      const blobs = [[0, -0.12, 0.26], [-0.2, -0.02, 0.18], [0.2, -0.02, 0.19], [-0.1, -0.3, 0.17], [0.12, -0.3, 0.17], [0, 0.05, 0.16]];
      const sway = Math.sin(q * TAU * 2) * S * 0.01;
      for (const [dx, dy, r] of blobs) circle(x, cx + dx * S + sway, cy + dy * S, r * S * (s === 3 && mix === 0 ? 0.92 : 1), cnow);
      if (s === 3) for (const [dx, dy, r] of blobs) circle(x, cx + dx * S + sway, cy + (dy - 0.06) * S, r * S * 0.55, '#ffffff');
      const r = rng(9);
      for (let i = 0; i < 16; i++) {
        const p = (q * 4 * num(P.speed, 1) + r()) % 1, X = cx + (r() - 0.5) * S * 0.9 + Math.sin(p * 9 + i) * S * 0.05, Y = cy - S * 0.1 + p * S * 0.65;
        if (s === 0) circle(x, X, Y, S * 0.012, '#f6a5c0');
        else if (s === 2) leaf(x, X, Y, S * 0.04, p * 6, '#e8833a');
        else if (s === 3) circle(x, X, Y, S * 0.009, '#ffffff');
      }
      x.fillStyle = shade(green, -0.4);
      x.fillRect(cx - S * 0.5, g, S, S * 0.04);
      return { cx, cy, r: S * 0.55 };
    }
    // 盆栽發芽：莖長高、葉子兩側輪流冒出、最後開一朵小花
    const g = cy + S * 0.32, grow = ease(seg(t, loop * 0.08, loop * 0.7)), sway = Math.sin(q * TAU * 2) * 0.05;
    const top = g - S * 0.72 * grow;
    x.beginPath();
    x.moveTo(cx, g);
    x.quadraticCurveTo(cx + S * 0.08 * Math.sin(grow * 3), (g + top) / 2, cx + sway * S * grow, top);
    x.lineWidth = S * 0.025;
    x.strokeStyle = shade(green, -0.25);
    x.lineCap = 'round';
    x.stroke();
    for (let i = 0; i < 6; i++) {
      const at = (i + 1) / 7, p = seg(grow, at * 0.85, at * 0.85 + 0.15);
      if (p <= 0) continue;
      const Y = g - S * 0.72 * at * grow, X = cx + S * 0.04 * Math.sin(at * 3) + sway * S * at;
      leaf(x, X, Y, S * 0.2 * back(p) * (1 - at * 0.35), i % 2 ? -Math.PI + 0.5 + sway : -0.5 + sway, i % 2 ? green : shade(green, 0.12));
    }
    const fl = back(seg(t, loop * 0.66, loop * 0.78));
    if (fl > 0) {
      for (let i = 0; i < 6; i++) circle(x, cx + sway * S + Math.cos((i / 6) * TAU) * S * 0.04 * fl, top + Math.sin((i / 6) * TAU) * S * 0.04 * fl, S * 0.032 * fl, '#f6a5c0');
      circle(x, cx + sway * S, top, S * 0.026 * fl, '#ffd23f');
    }
    poly(x, [[cx - S * 0.2, g - S * 0.04], [cx + S * 0.2, g - S * 0.04], [cx + S * 0.15, g + S * 0.24], [cx - S * 0.15, g + S * 0.24]], brown);
    x.fillStyle = shade(brown, -0.25);
    x.fillRect(cx - S * 0.22, g - S * 0.07, S * 0.44, S * 0.06);
    x.fillStyle = '#5b3a29';
    x.fillRect(cx - S * 0.18, g - S * 0.085, S * 0.36, S * 0.02);
    return { cx, cy, r: S * 0.6 };
  };

  /* ───────── 時間 ───────── */
  const clock = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    const body = String(P.color ?? '#f3efe6'), acc = String(P.color2 ?? '#ff5a36'), q = t / loop, sp = num(P.speed, 1);
    const mode = String(P.mode ?? 'hourglass');
    if (mode === 'clock') {
      const R = S * 0.4;
      circle(x, cx, cy, R * 1.08, acc);
      circle(x, cx, cy, R, body);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        line(x, cx + Math.cos(a) * R * 0.82, cy + Math.sin(a) * R * 0.82, cx + Math.cos(a) * R * (i % 3 ? 0.9 : 0.94), cy + Math.sin(a) * R * (i % 3 ? 0.9 : 0.94), S * (i % 3 ? 0.008 : 0.016), INK, 'butt');
      }
      const m = q * TAU * 4 * sp, h = q * TAU * (4 / 12) * sp;
      line(x, cx, cy, cx + Math.sin(h) * R * 0.5, cy - Math.cos(h) * R * 0.5, S * 0.035, INK);
      line(x, cx, cy, cx + Math.sin(m) * R * 0.78, cy - Math.cos(m) * R * 0.78, S * 0.022, INK);
      circle(x, cx, cy, S * 0.025, acc);
      // 快轉的動態線
      for (let i = 0; i < 3; i++) {
        x.beginPath();
        x.arc(cx, cy, R * (1.2 + i * 0.08), m - Math.PI / 2 - 0.9, m - Math.PI / 2 - 0.2);
        x.lineWidth = S * 0.01;
        x.strokeStyle = acc;
        x.stroke();
      }
      return { cx, cy, r: R * 1.2 };
    }
    if (mode === 'calendar') {
      const w = S * 0.56, h = S * 0.62, X = cx - w / 2, Y = cy - h / 2;
      const per = loop / 4, k = Math.floor(t / per), p = (t % per) / per, day = ((Math.round(num(P.start, 1)) - 1 + k) % 31) + 1;
      const page = (d: number) => {
        x.fillStyle = body;
        x.fillRect(X, Y, w, h);
        x.fillStyle = acc;
        x.fillRect(X, Y, w, h * 0.24);
        digits(x, String(d), cx, Y + h * 0.62, h * 0.44, INK);
      };
      for (let i = 2; i >= 1; i--) {
        x.fillStyle = shade(body, -0.08 * i);
        x.fillRect(X + i * S * 0.01, Y + i * S * 0.01, w, h);
      }
      page(day + 1 > 31 ? 1 : day + 1);
      // 目前這頁在每段最後撕下飛走
      const tear = ease(seg(p, 0.6, 1));
      x.save();
      x.translate(X + w, Y);
      x.rotate(tear * 0.9);
      x.translate(tear * S * 0.6, -tear * S * 0.3);
      x.translate(-(X + w), -Y);
      x.globalAlpha = 1 - tear;
      page(day);
      x.restore();
      x.globalAlpha = 1;
      x.fillStyle = INK;
      for (const dx of [0.25, 0.75]) fillRR(x, X + w * dx - S * 0.015, Y - S * 0.04, S * 0.03, S * 0.08, S * 0.015, INK);
      return { cx, cy, r: h * 0.6 };
    }
    // 沙漏：上半沙子減少、下半堆高，最後翻轉
    const flip = inout(seg(q, 0.88, 1)), sand = clamp(q / 0.86), w = S * 0.36, h = S * 0.36;
    x.save();
    x.translate(cx, cy);
    x.rotate(flip * Math.PI);
    x.fillStyle = acc;
    x.fillRect(-w * 0.72, -h - S * 0.05, w * 1.44, S * 0.05);
    x.fillRect(-w * 0.72, h, w * 1.44, S * 0.05);
    x.fillStyle = shade(acc, -0.3);
    x.fillRect(-w * 0.66, -h, S * 0.025, h * 2);
    x.fillRect(w * 0.66 - S * 0.025, -h, S * 0.025, h * 2);
    poly(x, [[-w / 2, -h], [w / 2, -h], [S * 0.02, -S * 0.02], [S * 0.02, S * 0.02], [w / 2, h], [-w / 2, h], [-S * 0.02, S * 0.02], [-S * 0.02, -S * 0.02]], 'rgba(255,255,255,.22)');
    const top = 1 - sand;
    if (top > 0) poly(x, [[-w / 2 * top, -h * top], [w / 2 * top, -h * top], [0, 0]], body);
    if (sand > 0) {
      const ph = h * Math.sqrt(sand) * 0.9;
      poly(x, [[-w / 2, h], [w / 2, h], [w * 0.1, h - ph], [-w * 0.1, h - ph]], body);
      if (sand < 1) line(x, 0, 0, 0, h - ph, S * 0.01, body, 'butt');
    }
    x.restore();
    return { cx, cy, r: h + S * 0.08 };
  };

  /* ───────── 慶祝 ───────── */
  const party = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.45) * H;
    const c = String(P.color ?? '#ff5a36'), c2 = String(P.color2 ?? '#ffd23f'), amt = num(P.amount, 1), cols = [c, c2, '#ffffff', '#5bc0eb', '#9bc53d'];
    const r = rng(17);
    if (P.mode === 'fireworks') {
      const shots = 4;
      for (let k = 0; k < shots; k++) {
        const t0 = loop * (0.05 + k * 0.2), p = (t - t0) / (loop * 0.42);
        const bx = cx + (r() - 0.5) * S * 1.1, by = cy - S * (0.15 + r() * 0.35), col = cols[k % cols.length];
        if (p < 0 || p > 1) continue;
        const rise = clamp(p / 0.3), gy = cy + S * 0.6;
        if (rise < 1) {
          const Y = gy - (gy - by) * ease(rise);
          line(x, bx, Y, bx, Y + S * 0.14, S * 0.018, col);
          circle(x, bx, Y, S * 0.018, '#ffffff');
          continue;
        }
        const e = (p - 0.3) / 0.7, n = Math.round(26 * amt);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU, d = S * 0.42 * ease(e), fall = e * e * S * 0.12;
          const X = bx + Math.cos(a) * d, Y = by + Math.sin(a) * d + fall;
          line(x, X - Math.cos(a) * S * 0.07 * (1 - e * 0.5), Y - Math.sin(a) * S * 0.07 * (1 - e * 0.5), X, Y, S * 0.022 * (1 - e * 0.6), i % 3 ? col : '#ffffff');
          if (i % 2 === 0) circle(x, X, Y, S * 0.016 * (1 - e * 0.5), i % 4 ? '#ffffff' : col);
        }
      }
      return { cx, cy, r: S * 0.5 };
    }
    // 拉炮：圓錐在左下，紙片朝右上噴出後隨重力飄落
    // 一個循環拉兩次
    const px = cx - S * 0.45, py = cy + S * 0.42, ang = -0.85, pop = t >= loop * 0.56 ? loop * 0.56 : loop * 0.1;
    const kick = t > pop && t < pop + 0.25 ? (1 - (t - pop) / 0.25) * 0.08 : 0;
    x.save();
    x.translate(px, py);
    x.rotate(ang - kick);
    poly(x, [[0, -S * 0.04], [S * 0.32, -S * 0.12], [S * 0.32, S * 0.12], [0, S * 0.04]], c);
    for (let i = 1; i < 4; i++) poly(x, [[S * 0.08 * i, -S * (0.04 + 0.02 * i)], [S * 0.08 * i + S * 0.03, -S * (0.05 + 0.02 * i)], [S * 0.08 * i + S * 0.03, S * (0.05 + 0.02 * i)], [S * 0.08 * i, S * (0.04 + 0.02 * i)]], c2);
    x.restore();
    const n = Math.round(60 * amt), te = t - pop;
    if (te > 0)
      for (let i = 0; i < n; i++) {
        const a = ang + (r() - 0.5) * 1.1, v = S * (1.4 + r() * 1.6), drag = 1.8, gr = S * 0.45;
        const tt = te, d = (v / drag) * (1 - Math.exp(-drag * tt));
        const X = px + Math.cos(a) * d + Math.sin(tt * 3 + i) * S * 0.02 * tt, Y = py + Math.sin(a) * d + gr * tt * tt * 0.5 * (tt > 0.6 ? 1 : tt / 0.6);
        if (Y > H + S * 0.1) continue;
        const col = cols[i % cols.length], kind = i % 3, rot = tt * (4 + r() * 6) + i;
        x.save();
        x.translate(X, Y);
        x.rotate(rot);
        x.scale(1, Math.cos(rot * 1.7));
        x.fillStyle = col;
        if (kind === 0) x.fillRect(-S * 0.03, -S * 0.016, S * 0.06, S * 0.032);
        else if (kind === 1) {
          x.beginPath();
          x.arc(0, 0, S * 0.02, 0, TAU);
          x.fill();
        } else {
          x.beginPath();
          x.moveTo(-S * 0.06, 0);
          x.quadraticCurveTo(0, -S * 0.05, S * 0.06, 0);
          x.lineWidth = S * 0.014;
          x.strokeStyle = col;
          x.stroke();
        }
        x.restore();
      }
    return { cx, cy, r: S * 0.5 };
  };

  /* ───────── 錢幣存錢筒 ───────── */
  const coin = (x: CanvasRenderingContext2D, X: number, Y: number, w: number, c: string) => {
    const h = w * 0.32;
    x.fillStyle = shade(c, -0.3);
    x.fillRect(X - w / 2, Y, w, h * 0.45);
    x.beginPath();
    x.ellipse(X, Y + h * 0.45, w / 2, h / 2, 0, 0, Math.PI);
    x.fill();
    x.beginPath();
    x.ellipse(X, Y, w / 2, h / 2, 0, 0, TAU);
    x.fillStyle = c;
    x.fill();
    x.beginPath();
    x.ellipse(X, Y, w * 0.33, h * 0.33, 0, 0, TAU);
    x.lineWidth = w * 0.04;
    x.strokeStyle = shade(c, -0.18);
    x.stroke();
  };
  const coins = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    const gold = String(P.color ?? '#f2b705'), pig = String(P.color2 ?? '#f6a5c0'), cw = S * 0.2, step = cw * 0.16;
    if (P.mode === 'piggy') {
      // 硬幣一枚枚掉進存錢筒，豬身被壓一下
      const per = loop / 5, p = (t % per) / per;
      const hit = p > 0.5 ? Math.exp(-(p - 0.5) * 18) : 0;
      const bx = cx, by = cy + S * 0.12, rx = S * 0.36 * (1 + hit * 0.05), ry = S * 0.27 * (1 - hit * 0.06);
      for (const dx of [-0.2, -0.06, 0.08, 0.22]) fillRR(x, bx + dx * S - S * 0.04, by + ry * 0.7, S * 0.08, S * 0.16, S * 0.02, shade(pig, -0.15));
      x.beginPath();
      x.ellipse(bx, by, rx, ry, 0, 0, TAU);
      x.fillStyle = pig;
      x.fill();
      poly(x, [[bx - rx * 0.45, by - ry * 0.75], [bx - rx * 0.2, by - ry * 1.25], [bx - rx * 0.05, by - ry * 0.85]], shade(pig, -0.12));
      fillRR(x, bx + rx * 0.82, by - ry * 0.15, S * 0.1, S * 0.13, S * 0.04, shade(pig, -0.1));
      circle(x, bx + rx * 0.88, by - ry * 0.02, S * 0.012, shade(pig, -0.5));
      circle(x, bx + rx * 0.88, by + ry * 0.2, S * 0.012, shade(pig, -0.5));
      circle(x, bx + rx * 0.55, by - ry * 0.3, S * 0.018, INK);
      fillRR(x, bx - S * 0.08, by - ry - S * 0.01, S * 0.16, S * 0.025, S * 0.012, INK);
      x.beginPath();
      x.moveTo(bx - rx, by);
      x.quadraticCurveTo(bx - rx - S * 0.08, by - S * 0.04, bx - rx - S * 0.05, by - S * 0.1);
      x.lineWidth = S * 0.015;
      x.strokeStyle = shade(pig, -0.15);
      x.stroke();
      if (p < 0.5) coin(x, bx, by - ry - S * 0.5 + ease(p / 0.5) * (S * 0.5 - S * 0.03), cw * 0.8, gold);
      if (p > 0.5 && p < 0.8) for (let i = 0; i < 4; i++) star(x, bx + Math.cos(i * 1.6) * S * 0.16 * (p - 0.4) * 3, by - ry - Math.abs(Math.sin(i * 1.6)) * S * 0.12 * (p - 0.4) * 3, S * 0.025, gold);
      return { cx, cy, r: S * 0.45 };
    }
    // 疊高：幾排硬幣由左到右、一枚枚疊成長條
    const n = Math.round(num(P.count, 4)), g = cy + S * 0.42, total = 0.8;
    for (let i = 0; i < n; i++) {
      const X = cx + (i - (n - 1) / 2) * cw * 1.25, max = 3 + Math.round(((i + 1) / n) * 8), p = clamp((t / loop) / total), k = p * max * n - i * max;
      const shown = Math.max(0, Math.min(max, k));
      for (let j = 0; j < Math.floor(shown); j++) coin(x, X, g - j * step, cw, j % 2 ? gold : shade(gold, 0.08));
      const frac = shown - Math.floor(shown);
      if (frac > 0 && Math.floor(shown) < max) coin(x, X, g - Math.floor(shown) * step - (1 - ease(frac)) * S * 0.4, cw, gold);
    }
    x.fillStyle = shade(gold, -0.55);
    x.fillRect(cx - (n * cw * 1.25) / 2 - S * 0.05, g + cw * 0.2, n * cw * 1.25 + S * 0.1, S * 0.015);
    return { cx, cy, r: S * 0.45 };
  };

  /* ───────── 抽籤扭蛋 ───────── */
  const gacha = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    const m = String(P.color ?? '#ff5a36'), c2 = String(P.color2 ?? '#2f6db5'), q = t / loop;
    const caps = ['#ffd23f', c2, '#9bc53d', '#f6a5c0', '#5bc0eb', '#ffffff'];
    if (P.mode === 'lots') {
      // 籤筒左右搖，接著一支籤往上跳出
      const shake = q < 0.42 ? Math.sin(q * 70) * 0.12 * (1 - q / 0.42) : 0;
      const bw = S * 0.34, bh = S * 0.5, by = cy + S * 0.4;
      x.save();
      x.translate(cx, by);
      x.rotate(shake);
      for (let i = 0; i < 9; i++) {
        const X = -bw * 0.38 + (i / 8) * bw * 0.76, up = i === 4 ? back(seg(q, 0.48, 0.62)) * S * 0.32 : 0, h = S * (0.68 + ((i * 37) % 7) * 0.012);
        x.fillStyle = '#e8c48a';
        x.fillRect(X - S * 0.014, -h - up, S * 0.028, h);
        x.fillStyle = i === 4 ? c2 : shade(c2, -0.1);
        x.fillRect(X - S * 0.014, -h - up, S * 0.028, S * 0.05);
      }
      fillRR(x, -bw / 2, -bh, bw, bh, S * 0.03, m);
      x.fillStyle = shade(m, -0.25);
      x.fillRect(-bw / 2, -bh * 0.75, bw, S * 0.03);
      x.fillRect(-bw / 2, -bh * 0.25, bw, S * 0.03);
      x.restore();
      const burst = seg(q, 0.6, 0.75);
      if (burst > 0 && burst < 1)
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU, d0 = S * 0.08 + burst * S * 0.12;
          line(x, cx + Math.cos(a) * d0, by - S * 1.0 + Math.sin(a) * d0, cx + Math.cos(a) * (d0 + S * 0.06), by - S * 1.0 + Math.sin(a) * (d0 + S * 0.06), S * 0.012, '#ffd23f');
        }
      return { cx, cy, r: S * 0.6 };
    }
    // 扭蛋機：轉把手 → 扭蛋掉出滾出 → 打開
    const R = S * 0.26, dy = cy - S * 0.2, bw = S * 0.5, by = dy + R * 0.7, bh = S * 0.42;
    const jig = q < 0.4 ? Math.sin(q * 60) * S * 0.006 : 0;
    circle(x, cx, dy, R, 'rgba(255,255,255,.35)');
    const r = rng(4);
    for (let i = 0; i < 9; i++) {
      const a = r() * TAU, d = R * (0.2 + r() * 0.55);
      const X = cx + Math.cos(a) * d + jig * (i % 2 ? 1 : -1), Y = dy + R * 0.25 + Math.abs(Math.sin(a)) * d * 0.6 - d * 0.2;
      circle(x, X, Y, R * 0.24, caps[i % caps.length]);
      x.fillStyle = 'rgba(255,255,255,.75)';
      x.fillRect(X - R * 0.24, Y - R * 0.02, R * 0.48, R * 0.04);
    }
    x.beginPath();
    x.arc(cx, dy, R, 0, TAU);
    x.lineWidth = S * 0.02;
    x.strokeStyle = shade(m, -0.3);
    x.stroke();
    fillRR(x, cx - bw / 2, by, bw, bh, S * 0.04, m);
    fillRR(x, cx - bw * 0.42, by - S * 0.03, bw * 0.84, S * 0.05, S * 0.02, shade(m, -0.25));
    // 把手
    const turn = inout(seg(q, 0.1, 0.32)) * TAU;
    circle(x, cx, by + bh * 0.35, S * 0.07, shade(m, 0.3));
    x.save();
    x.translate(cx, by + bh * 0.35);
    x.rotate(turn);
    fillRR(x, -S * 0.09, -S * 0.022, S * 0.18, S * 0.044, S * 0.02, INK);
    x.restore();
    fillRR(x, cx - S * 0.08, by + bh * 0.68, S * 0.16, S * 0.12, S * 0.02, INK);
    // 扭蛋掉出、滾到前面、打開
    const out = seg(q, 0.36, 0.5), roll = ease(seg(q, 0.5, 0.62)), open = back(seg(q, 0.64, 0.74));
    if (out > 0) {
      const X = cx + roll * S * 0.38, Y = by + bh * 0.74 + bounce(out) * S * 0.2, rot = roll * TAU;
      const cr = S * 0.075, col = caps[1];
      x.save();
      x.translate(X, Y);
      x.rotate(open > 0 ? 0 : rot);
      x.beginPath();
      x.arc(0, 0, cr, 0, Math.PI);
      x.fillStyle = '#ffffff';
      x.fill();
      x.save();
      x.translate(-cr, 0);
      x.rotate(-open * 1.1);
      x.translate(cr, -open * S * 0.03);
      x.beginPath();
      x.arc(0, 0, cr, Math.PI, TAU);
      x.fillStyle = col;
      x.fill();
      x.restore();
      x.restore();
      if (open > 0.2) for (let i = 0; i < 6; i++) star(x, X + Math.cos(i * 1.05 - 1.6) * S * 0.14 * open, Y - S * 0.05 + Math.sin(i * 1.05 - 1.6) * S * 0.14 * open, S * 0.03 * open, i % 2 ? '#ffd23f' : '#ffffff');
    }
    return { cx, cy, r: S * 0.62 };
  };

  /* ───────── 手搖飲 ───────── */
  const drink = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H;
    if (String(P.mode ?? 'boba') === 'soda') return soda(x, W, H, P, t, loop);
    const tea = String(P.color ?? '#c8925f'), c2 = String(P.color2 ?? '#ff5a36'), q = t / loop, sp = num(P.speed, 1);
    // 杯子：扁平梯形，原點在杯底中央（跟扭蛋機同樣的畫面佔比）
    const h = S * 0.62, a = S * 0.25, b = S * 0.19, base = cy + S * 0.4;
    // 登場：從上方掉下、落地壓扁回彈
    const fall = bounce(seg(q, 0, 0.18));
    const offY = -(1 - fall) * H * 0.75;
    const imp = seg(q, 0.065, 0.17);
    const squash = imp > 0 && imp < 1 ? Math.sin(imp * Math.PI) * (1 - imp) * 0.1 : 0;
    const after = Math.max(0, t - loop * 0.18) * sp;
    const sway = Math.sin(after * 1.8) * 0.02 * Math.min(1, after);
    x.save();
    x.translate(cx, base + offY);
    x.rotate(sway);
    x.scale(1 + squash, 1 - squash);
    const lvl = -h * 0.86;
    const wAt = (y: number) => b + (a - b) * (-y / h);
    // 吸管：扁平長條，刺下後回彈
    const poke = back(seg(q, 0.42, 0.54));
    const sw = S * 0.07, L = h * 0.5 + S * 0.24;
    x.save();
    x.translate(S * 0.04, -h * 0.5);
    x.rotate(0.14);
    x.translate(0, -(1 - poke) * S * 0.5);
    fillRR(x, -sw / 2, -L, sw, L, S * 0.012, shade(c2, -0.1));
    x.fillStyle = shade(c2, -0.3);
    x.fillRect(sw * 0.15, -L, sw * 0.35, L);
    x.restore();
    // 杯身（上方沒裝到的部分是淺色）＋奶茶
    poly(x, [[-a, -h], [a, -h], [b, 0], [-b, 0]], shade(tea, 0.6));
    poly(x, [[-wAt(lvl), lvl], [wAt(lvl), lvl], [b, 0], [-b, 0]], tea);
    // 珍珠：一顆顆從液面落下、彈一下沉底，之後輕輕晃
    const pr = S * 0.042;
    let k = 0;
    for (let row = 0; row < 3; row++) {
      const Y = -pr * 1.1 - row * pr * 1.75, hw = wAt(Y) - pr * 1.25, n = Math.floor((hw * 2) / (pr * 2.15)) + 1 - (row === 2 ? 1 : 0);
      for (let i = 0; i < n; i++, k++) {
        const X = n > 1 ? -hw + (i / (n - 1)) * hw * 2 : 0;
        const st = 0.18 + (k % 7) * 0.025 + row * 0.02;
        const d = bounce(seg(q, st, st + 0.12));
        if (d <= 0) continue;
        const bob = Math.sin(after * 2.4 + k * 1.3) * S * 0.004;
        circle(x, X * (row === 2 ? 0.8 : 1), Y - (1 - d) * (Y - lvl - pr * 1.2) + bob, pr, '#3a2418');
      }
    }
    // 一道受光亮條（同色調亮一階）
    poly(x, [[-a * 0.78, -h * 0.94], [-a * 0.62, -h * 0.94], [-b * 0.6, -S * 0.04], [-b * 0.76, -S * 0.04]], 'rgba(255,255,255,.35)');
    // 杯蓋封膜：杯口一條橫帶
    fillRR(x, -a * 1.08, -h - S * 0.05, a * 2.16, S * 0.06, S * 0.025, c2);
    x.restore();
    // 刺破封膜時的放射短線，之後冒出星星
    const tipX = cx + S * 0.04 + Math.sin(0.14) * L, tipY = base - h * 0.5 - Math.cos(0.14) * L + S * 0.04;
    const burst = seg(q, 0.52, 0.64);
    if (burst > 0 && burst < 1)
      for (let i = 0; i < 8; i++) {
        const an = (i / 8) * TAU, d0 = S * 0.08 + burst * S * 0.1;
        line(x, tipX + Math.cos(an) * d0, tipY + Math.sin(an) * d0, tipX + Math.cos(an) * (d0 + S * 0.05), tipY + Math.sin(an) * (d0 + S * 0.05), S * 0.012, '#ffd23f');
      }
    const pop = back(seg(q, 0.6, 0.72));
    if (pop > 0.05)
      for (let i = 0; i < 6; i++) {
        const an = i * 1.05 - 1.6, rr0 = S * 0.22 * pop;
        star(x, tipX + Math.cos(an) * rr0, tipY + S * 0.05 + Math.sin(an) * rr0, S * 0.03 * Math.min(1, pop), i % 2 ? '#ffd23f' : '#ffffff');
      }
    return { cx, cy, r: S * 0.62 };
  };

  /* ───────── 物件擴充 v2：共用（落下壓扁登場、結尾放射短線＋星星，跟扭蛋機／珍奶同一套） ───────── */
  const dropIn = (q: number, H: number, end = 0.18) => {
    const fall = bounce(seg(q, 0, end)), imp = seg(q, end * 0.36, end * 0.95);
    return { off: -(1 - fall) * H * 0.75, sq: imp > 0 && imp < 1 ? Math.sin(imp * Math.PI) * (1 - imp) * 0.1 : 0 };
  };
  const cheer = (x: CanvasRenderingContext2D, X: number, Y: number, S: number, q: number, at: number) => {
    const burst = seg(q, at, at + 0.12);
    if (burst > 0 && burst < 1)
      for (let i = 0; i < 8; i++) {
        const an = (i / 8) * TAU, d0 = S * 0.08 + burst * S * 0.1;
        line(x, X + Math.cos(an) * d0, Y + Math.sin(an) * d0, X + Math.cos(an) * (d0 + S * 0.05), Y + Math.sin(an) * (d0 + S * 0.05), S * 0.012, '#ffd23f');
      }
    const pop = back(seg(q, at + 0.08, at + 0.2));
    if (pop > 0.05)
      for (let i = 0; i < 6; i++) {
        const an = i * 1.05 - 1.6, d = S * 0.24 * pop;
        star(x, X + Math.cos(an) * d, Y + Math.sin(an) * d, S * 0.03 * Math.min(1, pop), i % 2 ? '#ffd23f' : '#ffffff');
      }
  };
  /** 在單位座標（已 scale(S,S)）裡寫字：先縮回再放大，避免小字號被瀏覽器夾到最小字級 */
  const utxt = (x: CanvasRenderingContext2D, s: string, X: number, Y: number, px: number, c: string, w = 900) => {
    x.save();
    x.translate(X, Y);
    x.scale(0.01, 0.01);
    x.fillStyle = c;
    x.font = `${w} ${px * 100}px system-ui,"Noto Sans TC",sans-serif`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(s, 0, 0);
    x.restore();
  };
  const ell = (x: CanvasRenderingContext2D, X: number, Y: number, rx: number, ry: number, c: string) => {
    x.beginPath();
    x.ellipse(X, Y, Math.max(0, rx), Math.max(0, ry), 0, 0, TAU);
    x.fillStyle = c;
    x.fill();
  };
  const hi = (x: CanvasRenderingContext2D, X: number, Y: number, h: number, w = 0.03) => {
    x.fillStyle = 'rgba(255,255,255,.35)';
    x.fillRect(X, Y, w, h);
  };
  const arcLine = (x: CanvasRenderingContext2D, X: number, Y: number, r: number, a0: number, a1: number, w: number, c: string) => {
    x.beginPath();
    x.arc(X, Y, Math.max(0, r), a0, a1);
    x.lineWidth = w;
    x.strokeStyle = c;
    x.lineCap = 'round';
    x.stroke();
  };
  type Unit = (x: CanvasRenderingContext2D, q: number, after: number, c: string, c2: string) => number[] | void;
  /** 單位座標舞台：原點在物件底部中央、往上為負、1 = S；body 回傳慶祝星星的位置（單位座標） */
  const stage = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number, d1: string, d2: string, body: Unit, o: { at?: number; drop?: boolean; sway?: number } = {}) => {
    const S = Math.min(W, H) * num(P.size, 0.62), cx = num(P.x, 0.5) * W, cy = num(P.y, 0.42) * H, base = cy + S * 0.4;
    const q = t / loop, after = Math.max(0, t - loop * 0.18) * num(P.speed, 1);
    const { off, sq } = o.drop === false ? { off: 0, sq: 0 } : dropIn(q, H);
    x.save();
    x.translate(cx, base + off);
    x.rotate(Math.sin(after * 1.8) * (o.sway ?? 0.02) * Math.min(1, after));
    x.scale(S * (1 + sq), S * (1 - sq));
    const pt = body(x, q, after, String(P.color ?? d1), String(P.color2 ?? d2)) || [0, -0.8];
    x.restore();
    cheer(x, cx + pt[0] * S, base + off + pt[1] * S, S, q, o.at ?? 0.55);
    return { cx, cy, r: S * 0.62 };
  };
  const O = '#ff5a36', YL = '#ffd23f', BL = '#2f6db5', LB = '#5bc0eb', GR = '#9bc53d', PK = '#f6a5c0', RD = '#d64541', WD = '#e8c48a', WH = '#ffffff', SV = '#c9d1d9';

  /* ───────── 有趣道具 ───────── */
  const fun = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const mode = String(P.mode ?? 'microwave');
    if (mode === 'claw')
      // 抓娃娃機：爪子下降 → 夾住扭蛋 → 拉上來
      return stage(x, W, H, P, t, loop, O, LB, (x, q, after, c) => {
        fillRR(x, -0.3, -0.8, 0.6, 0.12, 0.04, c);
        x.fillStyle = 'rgba(255,255,255,.4)';
        x.fillRect(-0.3, -0.7, 0.6, 0.42);
        const down = inout(seg(q, 0.22, 0.32)), grip = seg(q, 0.32, 0.36), up = inout(seg(q, 0.37, 0.5));
        const cy0 = -0.56 + down * 0.12 - up * 0.12;
        const balls: [number, number, string][] = [[-0.17, -0.33, YL], [-0.05, -0.34, PK], [0.08, -0.33, LB], [0.19, -0.34, GR], [-0.12, -0.42, BL]];
        for (const [a, b, col] of balls) {
          const j = after > 0 ? Math.sin(after * 3 + a * 20) * 0.004 : 0;
          circle(x, a, b + j, 0.055, col);
          x.fillStyle = 'rgba(255,255,255,.75)';
          x.fillRect(a - 0.055, b + j - 0.006, 0.11, 0.012);
        }
        // 被夾的那顆
        const gy = grip > 0 ? cy0 + 0.135 : -0.41;
        circle(x, 0.05, gy, 0.055, '#ffffff');
        x.fillStyle = shade(c, -0.1);
        x.fillRect(0.05 - 0.055, gy - 0.006, 0.11, 0.012);
        line(x, 0.05, -0.68, 0.05, cy0, 0.012, INK, 'butt');
        fillRR(x, 0.01, cy0 - 0.01, 0.08, 0.03, 0.01, INK);
        const k = 0.03 - grip * 0.02;
        line(x, 0.03, cy0 + 0.02, 0.03 - k, cy0 + 0.07, 0.014, INK);
        line(x, 0.07, cy0 + 0.02, 0.07 + k, cy0 + 0.07, 0.014, INK);
        x.lineWidth = 0.02;
        x.strokeStyle = shade(c, -0.3);
        x.strokeRect(-0.3, -0.7, 0.6, 0.42);
        fillRR(x, -0.3, -0.28, 0.6, 0.28, 0.04, c);
        fillRR(x, -0.08, -0.13, 0.16, 0.1, 0.02, INK);
        const jx = Math.sin(seg(q, 0.18, 0.3) * TAU * 2) * 0.012;
        fillRR(x, 0.13 + jx, -0.24, 0.03, 0.07, 0.01, INK);
        circle(x, 0.145 + jx, -0.25, 0.03, RD);
        hi(x, -0.26, -0.24, 0.18, 0.025);
        return [0.05, gy];
      }, { at: 0.5 });
    if (mode === 'plane')
      // 紙飛機：從左邊滑翔進來，往上翻一下，之後上下飄
      return stage(x, W, H, P, t, loop, WH, '#e9eef3', (x, q, after, c, c2) => {
        const inX = -(1 - ease(seg(q, 0, 0.26))) * 1.4;
        const loopA = inout(seg(q, 0.3, 0.48));
        const bob = Math.sin(after * 2.2) * 0.025;
        x.translate(inX, -0.42 - Math.sin(loopA * Math.PI) * 0.18 + bob);
        const rot = -0.2 - Math.sin(loopA * Math.PI) * 0.35;
        const fade = Math.max(0.15, 1 - seg(q, 0.3, 0.6));
        for (let i = 0; i < 3; i++) fillRR(x, -0.62 + i * 0.06, 0.08 + i * 0.05, 0.16 - i * 0.03, 0.02, 0.01, `rgba(29,36,51,${0.25 * fade + 0.05})`);
        x.rotate(rot);
        poly(x, [[-0.38, 0.02], [0.4, -0.12], [-0.12, 0.1]], c);
        poly(x, [[-0.12, 0.1], [0.4, -0.12], [-0.06, 0.2]], shade(c2, -0.12));
        poly(x, [[-0.38, 0.02], [0.4, -0.12], [-0.22, -0.08]], shade(c2, 0.2));
        return [0.4 + inX, -0.6];
      }, { drop: false, at: 0.46, sway: 0.01 });
    if (mode === 'popcorn')
      // 爆米花：一顆顆從桶口跳出來堆高
      return stage(x, W, H, P, t, loop, RD, YL, (x, q, after, c, c2) => {
        const pts = [[-0.18, -0.6], [-0.06, -0.66], [0.07, -0.64], [0.18, -0.58], [-0.1, -0.56], [0.04, -0.55], [0.13, -0.72], [-0.02, -0.76]];
        pts.forEach(([a, b], i) => {
          const s0 = 0.22 + i * 0.035, p = seg(q, s0, s0 + 0.1);
          if (p <= 0) return;
          const hop = Math.sin(p * Math.PI) * 0.22, k = back(p);
          const X = a * ease(p), Y = -0.56 + (b + 0.56) * ease(p) - hop;
          circle(x, X, Y, 0.07 * k, '#fff3c4');
          circle(x, X + 0.02 * k, Y - 0.02 * k, 0.03 * k, c2);
        });
        poly(x, [[-0.26, -0.56], [0.26, -0.56], [0.2, 0], [-0.2, 0]], WH);
        for (let i = 0; i < 4; i++) {
          const u = i / 4;
          poly(x, [[-0.26 + u * 0.52, -0.56], [-0.26 + (u + 0.125) * 0.52, -0.56], [-0.2 + (u + 0.125) * 0.4, 0], [-0.2 + u * 0.4, 0]], c);
        }
        const pp = back(seg(q, 0.16, 0.26));
        x.save();
        x.translate(0, -0.29);
        x.scale(pp, pp);
        fillRR(x, -0.16, -0.07, 0.32, 0.14, 0.03, c2);
        utxt(x, 'POP', 0, 0.002, 0.09, c);
        x.restore();
        return [0, -0.8];
      }, { at: 0.56 });
    if (mode === 'magnet')
      // 磁鐵：左右擺，磁力弧線一圈圈發出，迴紋針被吸過來
      return stage(x, W, H, P, t, loop, RD, '#e9eef3', (x, q, after, c, c2) => {
        const pull = ease(seg(q, 0.3, 0.46));
        const clips = [[0.42, -0.08, 0.6], [0.5, -0.3, -0.4], [0.3, 0.02, 1.2]];
        clips.forEach(([X, Y, r], i) => {
          const p = ease(seg(q, 0.3 + i * 0.04, 0.44 + i * 0.04));
          const tx = 0.2 + i * 0.03, ty = -0.2 + i * 0.05;
          x.save();
          x.translate(X + (tx - X) * p, Y + (ty - Y) * p);
          x.rotate(r * (1 - p) + 1.6 * p);
          fillRR(x, -0.05, -0.016, 0.1, 0.032, 0.016, '#9aa3ad');
          x.restore();
        });
        const sw = q < 0.3 ? Math.sin(seg(q, 0.18, 0.3) * TAU) * 0.15 : Math.sin(after * 2) * 0.04;
        x.save();
        x.translate(-0.05, -0.42);
        x.rotate(0.5 + sw);
        x.beginPath();
        x.arc(0, 0, 0.24, Math.PI, TAU);
        x.arc(0, 0, 0.1, TAU, Math.PI, true);
        x.closePath();
        x.fillStyle = c;
        x.fill();
        x.fillStyle = c;
        x.fillRect(-0.24, -0.001, 0.14, 0.22);
        x.fillRect(0.1, -0.001, 0.14, 0.22);
        x.fillStyle = c2;
        x.fillRect(-0.24, 0.22, 0.14, 0.09);
        x.fillRect(0.1, 0.22, 0.14, 0.09);
        hi(x, -0.2, -0.05, 0.25, 0.025);
        x.restore();
        if (pull > 0)
          for (let i = 0; i < 3; i++) {
            const ph = (after * 0.8 + i / 3) % 1;
            x.globalAlpha = 1 - ph;
            arcLine(x, 0.17, -0.18, 0.06 + ph * 0.18, -2.2, -0.6, 0.014, YL);
            x.globalAlpha = 1;
          }
        return [0.25, -0.3];
      }, { at: 0.5 });
    if (mode === 'dice')
      // 骰子：1–6 顆等角立體骰子，落下翻滾、落地停在最終點數，之後輕擺
      return stage(x, W, H, P, t, loop, WH, RD, (x, q, after, c, c2) => {
        const n = Math.max(1, Math.min(6, Math.round(num(P.dice, 2))));
        type V3 = [number, number, number];
        const rx = (v: V3, a: number): V3 => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
        const ry = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
        const rz = (v: V3, a: number): V3 => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
        // 六面：法向、面內 u/v 軸、點數（對面相加 = 7）
        const FACES: [V3, V3, V3, number][] = [
          [[0, 0, 1], [1, 0, 0], [0, 1, 0], 1], [[0, 0, -1], [-1, 0, 0], [0, 1, 0], 6],
          [[1, 0, 0], [0, 0, -1], [0, 1, 0], 2], [[-1, 0, 0], [0, 0, 1], [0, 1, 0], 5],
          [[0, 1, 0], [1, 0, 0], [0, 0, -1], 3], [[0, -1, 0], [1, 0, 0], [0, 0, 1], 4],
        ];
        const PIPS: Record<number, number[][]> = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
        // 每顆最終朝向（四分之一轉），讓不同骰子露出不同點數
        const BASE: [number, number, number][] = [[0, 0, 0], [Math.PI / 2, 0, 0], [0, -Math.PI / 2, Math.PI / 2], [-Math.PI / 2, 0, Math.PI], [Math.PI, Math.PI / 2, 0], [0, Math.PI, Math.PI / 2]];
        // 版面：直式最多兩欄（3 顆排成三角），橫式最多三欄
        const wide = W > H * 1.1;
        const cols = wide ? (n <= 3 ? n : Math.ceil(n / 2)) : n === 1 ? 1 : 2;
        const rows = Math.ceil(n / cols);
        const cell = Math.min((wide ? 1.35 : 0.98) / cols, 0.82 / rows, 0.7), hs = cell * 0.27;
        const spots: [number, number, number][] = [];
        for (let i = 0; i < n; i++) {
          const r = Math.floor(i / cols), inRow = Math.min(cols, n - r * cols), k = i - r * cols;
          spots.push([(k - (inRow - 1) / 2) * cell, -(rows - 1 - r) * cell * 0.9 - hs * 1.25, r]);
        }
        const LT: V3 = [-0.35, 0.8, 0.5];
        const ln = Math.hypot(...LT);
        spots.forEach(([X, Y], i) => {
          const d = i * 0.025, land = seg(q, 0.05 + d, 0.3 + d), e = 1 - Math.pow(1 - land, 3);
          const spin = (1 - e) * TAU * (2 + (i % 2)), wob = Math.sin(after * 1.6 + i * 1.3) * 0.05 * Math.min(1, after);
          const hop = land < 1 ? Math.abs(Math.sin(land * Math.PI * 2.5)) * (1 - land) * 0.22 : 0;
          const B = BASE[(i * 5 + 1) % 6];
          const yaw = 0.62 + (i % 3 - 1) * 0.12 + wob, tilt = 0.5;
          const tf = (v: V3): V3 => {
            let w = rz(ry(rx(v, B[0]), B[1]), B[2]);
            w = rx(ry(w, spin * (i % 2 ? 1 : -0.6)), spin * 0.8);
            return rx(ry(w, yaw), tilt);
          };
          const cx0 = X, cy0 = Y - hop;
          for (const [nrm, U, Vv, val] of FACES) {
            const nn = tf(nrm);
            if (nn[2] <= 0.01) continue;
            const u = tf(U), v = tf(Vv);
            // 螢幕座標：x 往右、y 往下（3D 的 y 往上）
            const ox = cx0 + nn[0] * hs, oy = cy0 - nn[1] * hs;
            const ux = u[0] * hs, uy = -u[1] * hs, vx = v[0] * hs, vy = -v[1] * hs;
            const lit = (nn[0] * LT[0] + nn[1] * LT[1] + nn[2] * LT[2]) / ln;
            const col = shade(c, Math.min(0, (lit - 0.95) * 0.2));
            poly(x, [[ox - ux - vx, oy - uy - vy], [ox + ux - vx, oy + uy - vy], [ox + ux + vx, oy + uy + vy], [ox - ux + vx, oy - uy + vy]], col);
            x.save();
            x.transform(ux, uy, vx, vy, ox, oy);
            for (const [a, b] of PIPS[val]) {
              x.beginPath();
              x.arc(a * 0.52, b * 0.52, val === 1 ? 0.28 : 0.17, 0, TAU);
              x.fillStyle = val === 1 ? c2 : INK;
              x.fill();
            }
            x.restore();
          }
        });
        return [0, -(rows - 1) * cell * 0.9 - hs * 3.0];
      }, { at: 0.34, sway: 0.015 });
    if (mode === 'bulb')
      // 電燈泡：閃兩下亮起，光芒伸縮
      return stage(x, W, H, P, t, loop, YL, O, (x, q, after, c, c2) => {
        const fl = seg(q, 0.24, 0.36);
        const on = q >= 0.36 || (fl > 0 && Math.sin(fl * TAU * 2.5) > 0.2);
        const col = on ? c : '#e9eef3';
        circle(x, 0, -0.56, 0.24, col);
        poly(x, [[-0.13, -0.4], [0.13, -0.4], [0.09, -0.24], [-0.09, -0.24]], col);
        fillRR(x, -0.1, -0.24, 0.2, 0.05, 0.02, '#9aa3ad');
        fillRR(x, -0.09, -0.18, 0.18, 0.05, 0.02, shade('#9aa3ad', -0.2));
        fillRR(x, -0.05, -0.13, 0.1, 0.04, 0.02, INK);
        circle(x, -0.09, -0.64, 0.05, on ? shade(c, 0.55) : WH);
        if (!on) {
          line(x, -0.06, -0.5, 0, -0.56, 0.012, '#9aa3ad');
          line(x, 0, -0.56, 0.06, -0.5, 0.012, '#9aa3ad');
        }
        const ray = back(seg(q, 0.36, 0.48)) * (1 + Math.sin(after * 4) * 0.12 * seg(q, 0.48, 0.6));
        if (ray > 0.02)
          for (let i = 0; i < 7; i++) {
            const a = -Math.PI + (i / 6) * Math.PI, r0 = 0.32, r1 = 0.32 + 0.08 * ray;
            line(x, Math.cos(a) * r0, -0.56 + Math.sin(a) * r0, Math.cos(a) * r1, -0.56 + Math.sin(a) * r1, 0.018, c2);
          }
        return [0, -0.56];
      }, { at: 0.42 });
    // 微波爐：轉盤轉、倒數，「叮」一聲窗戶亮起
    return stage(x, W, H, P, t, loop, '#e9eef3', O, (x, q, after, c, c2) => {
      fillRR(x, -0.4, -0.5, 0.8, 0.5, 0.05, c);
      const run = seg(q, 0.2, 0.5), done = q >= 0.5;
      const ding = seg(q, 0.5, 0.56);
      fillRR(x, -0.34, -0.44, 0.5, 0.38, 0.03, done && ding < 1 && Math.sin(ding * TAU * 2) > 0 ? shade(INK, 0.35) : INK);
      ell(x, -0.09, -0.12, 0.17, 0.035, shade(INK, 0.25));
      const sp = run > 0 && !done ? Math.sin(run * TAU * 2.5) : 0;
      const w = 0.16 * (0.55 + 0.45 * Math.abs(Math.cos(run * TAU * 2.5)));
      fillRR(x, -0.09 + sp * 0.06 - w / 2, -0.25, w, 0.12, 0.02, c2);
      fillRR(x, 0.2, -0.44, 0.15, 0.1, 0.02, INK);
      const secs = done ? 0 : Math.ceil((1 - run) * 5);
      utxt(x, done ? '叮!' : `0:0${secs}`, 0.275, -0.39, 0.055, GR, 700);
      for (let i = 0; i < 3; i++) circle(x, 0.275, -0.25 + i * 0.08, 0.025, shade(c, -0.25));
      hi(x, -0.3, -0.4, 0.28, 0.025);
      x.fillStyle = INK;
      x.fillRect(-0.34, 0, 0.06, 0.025);
      x.fillRect(0.28, 0, 0.06, 0.025);
      return [0, -0.6];
    }, { at: 0.5 });
  };

  /* ───────── 手搖飲：汽水罐 ───────── */
  const soda = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) =>
    stage(x, W, H, P, t, loop, LB, BL, (x, q, after, c, c2) => {
      const shake = seg(q, 0.22, 0.38);
      x.rotate(shake > 0 && shake < 1 ? Math.sin(shake * TAU * 3) * 0.14 : 0);
      const open = q >= 0.4;
      // 氣泡：打開後一路往上冒、到頂破掉
      if (open)
        for (let i = 0; i < 9; i++) {
          const ph = ((t0(after, i)) % 1), burst = seg(q, 0.4, 0.46);
          const X = Math.sin(i * 2.3 + ph * 4) * 0.07, Y = -0.66 - ph * (0.3 + burst * 0.2) - (i % 3) * 0.04;
          circle(x, X, Y, (0.02 + (i % 3) * 0.012) * (1 - ph * 0.5), WH);
        }
      fillRR(x, -0.15, -0.6, 0.3, 0.6, 0.04, c);
      fillRR(x, -0.13, -0.64, 0.26, 0.05, 0.02, SV);
      fillRR(x, -0.13, -0.02, 0.26, 0.03, 0.01, SV);
      // 拉環
      x.save();
      x.translate(0.02, -0.64);
      x.rotate(open ? -back(seg(q, 0.4, 0.46)) * 0.9 : 0);
      fillRR(x, -0.05, -0.02, 0.08, 0.025, 0.012, shade(SV, -0.25));
      x.restore();
      x.fillStyle = WH;
      x.fillRect(-0.15, -0.42, 0.3, 0.16);
      utxt(x, 'SODA', 0, -0.34, 0.08, c2);
      hi(x, -0.11, -0.56, 0.48, 0.025);
      return [0, -0.8];
    }, { at: 0.42 });
  const t0 = (after: number, i: number) => after * 0.7 + i * 0.37;

  /* ───────── 台灣生活 ───────── */
  /* ───────── 掛軸展開直書標題（#685） ───────── */
  const scrollFontAsked: Record<string, 1> = {};
  const scroll = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const texts = String(P.texts ?? '新莊副都心').split('|').map((s) => s.trim()).filter(Boolean).slice(0, 4);
    if (!texts.length) texts.push('新莊副都心');
    const n = Math.max(1, Math.min(4, Math.round(num(P.count, texts.length)), texts.length));
    const COLS = [String(P.color ?? '#5b3f8c'), '#b8323a', '#3f8f5a', '#8a5a2b'];
    const RED = String(P.color2 ?? '#d64541'), PAPER = String(P.paper ?? '#fbf3df'), WOOD = '#6b4423';
    const seal = String(P.seal ?? '持家').trim().slice(0, 4);
    const FONT = String(P.font ?? 'serif') === 'sans' ? '"Noto Sans TC","Noto Sans CJK TC","PingFang TC",sans-serif' : '"Noto Serif TC","Noto Serif CJK TC","PMingLiU","Songti TC",serif';
    // 畫布不會自己觸發字型下載：第一次用到時請瀏覽器載入（沒網路就退回系統明體）
    if (typeof document !== 'undefined' && document.fonts && !scrollFontAsked[FONT]) {
      scrollFontAsked[FONT] = 1;
      document.fonts.load(`900 40px ${FONT}`, texts.join('') + seal).catch(() => undefined);
    }
    const q0 = t / loop, size = num(P.size, 1);
    // 版面：直式 3–4 幅排成 2×2，其餘一排
    const portrait = W < H;
    const grid = portrait && n >= 3;
    const rows = grid ? 2 : 1, perRow = grid ? 2 : n;
    const S = Math.min(W, H);
    const cellW = (W * 0.84) / perRow, cellH = (H * (grid ? 0.86 : 0.9)) / rows;
    const sw = Math.min(cellW * (n > 1 ? 0.72 : 1), S * (n > 1 ? (grid ? 0.3 : 0.26) : portrait ? 0.42 : 0.3)) * size;
    const sealSize = (pw: number) => pw * 0.3;
    for (let row = 0; row < rows; row++) {
      const top0 = H * (grid ? 0.06 : portrait ? 0.2 : 0.1) + row * cellH;
      const sag = S * 0.04;
      const ropeAt = (X: number) => { const u = X / W; return (1 - u) * (1 - u) * top0 + 2 * (1 - u) * u * (top0 + sag) + u * u * top0; };
      // 掛繩
      x.beginPath(); x.moveTo(0, top0); x.quadraticCurveTo(W / 2, top0 + sag, W, top0);
      x.lineWidth = S * 0.006; x.strokeStyle = INK; x.lineCap = 'round'; x.stroke();
      const fullH = Math.min(cellH * (grid ? 0.8 : portrait ? 0.6 : 0.74), sw * 3.3);
      const inRow = grid ? Math.min(2, n - row * 2) : n;
      for (let j = 0; j < inRow; j++) {
        const i = row * perRow + j;
        const tx = texts[i % texts.length], col = COLS[i % COLS.length];
        const cx = W / 2 + (j - (inRow - 1) / 2) * cellW;
        const q = q0 - i * 0.08;
        const drop = back(seg(q, 0, 0.12));
        if (drop <= 0) continue;
        const sway = q > 0.8 ? Math.sin(q * 14 + i) * Math.exp(-6 * (q - 0.8)) * 0.02 : 0;
        x.save();
        x.translate(cx, ropeAt(cx));
        x.rotate(sway);
        const top = S * 0.07 * drop - S * 0.06 + S * 0.06;
        const un = ease(seg(q, 0.1, 0.45));
        const h = sw * 0.15 + (fullH - sw * 0.15) * un;
        // 吊繩與掛鉤
        x.beginPath(); x.moveTo(-sw * 0.4, top); x.lineTo(0, 0); x.lineTo(sw * 0.4, top);
        x.lineWidth = S * 0.004; x.strokeStyle = INK; x.lineJoin = 'round'; x.stroke();
        fillRR(x, -S * 0.012, -S * 0.012, S * 0.024, S * 0.03, S * 0.006, shade(col, -0.4));
        // 裱框（亮左邊、暗右邊）
        fillRR(x, -sw / 2, top, sw, h, 0, col);
        fillRR(x, -sw / 2, top, sw * 0.06, h, 0, shade(col, 0.18));
        fillRR(x, sw / 2 - sw * 0.06, top, sw * 0.06, h, 0, shade(col, -0.2));
        // 畫心
        const px = -sw * 0.36, pw = sw * 0.72, py = top + sw * 0.22, ph = Math.max(0, top + h - sw * 0.22 - py);
        if (ph > 0) {
          fillRR(x, px - sw * 0.025, py - sw * 0.025, pw + sw * 0.05, ph + sw * 0.05, 0, shade(col, -0.3));
          fillRR(x, px, py, pw, ph, 0, PAPER);
          fillRR(x, px + pw * 0.84, py, pw * 0.16, ph, 0, shade(PAPER, -0.05));
          const chars = [...tx].slice(0, 8);
          const latin = /^[\x20-\x7e]+$/.test(tx);
          const ss = sealSize(pw);
          const avail = fullH - sw * 0.44 - (seal ? ss * 1.15 : 0);
          const tq = seg(q, 0.18, 0.62);
          x.save();
          x.beginPath(); x.rect(px, py, pw, ph); x.clip();
          x.fillStyle = INK; x.textAlign = 'center'; x.textBaseline = 'middle';
          if (latin) {
            // 英數字：整行轉 90° 直排，從上往下展開
            const fs = Math.min(pw * 0.5, avail / Math.max(3, tx.length * 0.62));
            x.font = `900 ${fs}px ${FONT}`;
            x.save(); x.translate(0, py + avail / 2); x.rotate(Math.PI / 2);
            const a = back(tq); x.scale(a, a); x.globalAlpha = Math.min(1, tq * 2);
            x.fillText(tx, 0, 0, avail * 0.92); x.restore();
          } else {
            const fs = Math.min(pw * 0.62, (avail / Math.max(chars.length, 2)) * 0.9);
            x.font = `900 ${fs}px ${FONT}`;
            const ty0 = py + (avail - chars.length * fs * 1.08) / 2 + fs * 0.54;
            chars.forEach((c, k) => {
              const a = seg(tq * chars.length, k, k + 0.6);
              if (a <= 0) return;
              x.save(); x.translate(0, ty0 + k * fs * 1.08);
              const s = back(a); x.scale(s, s); x.globalAlpha = Math.min(1, a * 2);
              x.fillText(c, 0, 0); x.restore();
            });
          }
          x.restore();
          // 印章：放大蓋下
          const sq = seg(q, 0.74, 0.84);
          if (seal && sq > 0) {
            const sx = px + pw - ss * 0.8, sy = py + ph - ss * 0.8;
            x.save(); x.translate(sx, sy); x.rotate(-0.05);
            const k = sq < 1 ? 1 + 1.2 * (1 - back(sq)) : 1;
            x.scale(k, k); x.globalAlpha = Math.min(1, sq * 3);
            fillRR(x, -ss / 2, -ss / 2, ss, ss, ss * 0.08, RED);
            x.lineWidth = ss * 0.06; x.strokeStyle = PAPER; x.strokeRect(-ss * 0.38, -ss * 0.38, ss * 0.76, ss * 0.76);
            x.fillStyle = PAPER; x.textAlign = 'center'; x.textBaseline = 'middle';
            const sc = [...seal];
            if (/^[\x20-\x7e]+$/.test(seal)) { x.font = `900 ${ss * (seal.length > 2 ? 0.26 : 0.36)}px ${FONT}`; x.fillText(seal, 0, ss * 0.02, ss * 0.7); }
            else {
              x.font = `900 ${ss * (sc.length > 1 ? 0.3 : 0.5)}px ${FONT}`;
              if (sc.length === 1) x.fillText(sc[0], 0, ss * 0.02);
              else if (sc.length === 2) { x.fillText(sc[0], 0, -ss * 0.15); x.fillText(sc[1], 0, ss * 0.17); }
              else { x.fillText(sc[0], ss * 0.13, -ss * 0.14); x.fillText(sc[1], ss * 0.13, ss * 0.17); x.fillText(sc[2], -ss * 0.15, -ss * 0.14); if (sc[3]) x.fillText(sc[3], -ss * 0.15, ss * 0.17); }
            }
            x.restore();
          }
        }
        // 上軸桿
        const rodW = sw * 1.16;
        fillRR(x, -rodW / 2, top - sw * 0.06, rodW, sw * 0.1, sw * 0.03, WOOD);
        fillRR(x, -rodW / 2 + sw * 0.03, top - sw * 0.05, rodW - sw * 0.06, sw * 0.025, sw * 0.012, shade(WOOD, 0.25));
        // 下軸（捲著時比較粗）
        const rollH = sw * (0.1 + 0.26 * (1 - un)), ry = top + h - rollH * 0.5;
        fillRR(x, -sw * 0.53, ry - rollH / 2, sw * 1.06, rollH, rollH * 0.3, shade(col, -0.15));
        fillRR(x, -sw * 0.53, ry - rollH / 2, sw * 1.06, rollH * 0.28, rollH * 0.14, shade(col, 0.2));
        fillRR(x, -sw * 0.53, ry + rollH * 0.15, sw * 1.06, rollH * 0.12, 0, shade(col, -0.35));
        fillRR(x, -sw * 0.62, ry - sw * 0.045, sw * 0.1, sw * 0.09, sw * 0.03, WOOD);
        fillRR(x, sw * 0.52, ry - sw * 0.045, sw * 0.1, sw * 0.09, sw * 0.03, WOOD);
        x.restore();
      }
    }
    return { cx: W / 2, cy: H * 0.5, r: S * 0.45 };
  };
  const taiwan = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const mode = String(P.mode ?? 'hongbao');
    if (mode === 'scroll') return scroll(x, W, H, P, t, loop);
    if (mode === 'ringtoss')
      // 夜市套圈圈：圈圈從右下拋過來，套進中間那瓶
      return stage(x, W, H, P, t, loop, YL, LB, (x, q, after, c, c2) => {
        fillRR(x, -0.42, -0.06, 0.84, 0.06, 0.01, shade(WD, -0.2));
        const cols = [GR, c2, O];
        [-0.26, 0, 0.26].forEach((X, i) => {
          const p = bounce(seg(q, 0.04 + i * 0.05, 0.2 + i * 0.05));
          const y = -(1 - p) * 1.2;
          fillRR(x, X - 0.06, -0.3 + y, 0.12, 0.24, 0.04, cols[i]);
          fillRR(x, X - 0.025, -0.38 + y, 0.05, 0.09, 0.01, cols[i]);
          hi(x, X - 0.04, -0.27 + y, 0.15, 0.015);
        });
        const f = seg(q, 0.26, 0.42);
        if (f > 0) {
          const land = f >= 1;
          const X = land ? 0 : 0.6 * (1 - f);
          const yy = land ? -0.52 + bounce(seg(q, 0.42, 0.5)) * 0.18 : 0.1 - Math.sin(f * Math.PI) * 0.75 - f * 0.62;
          x.beginPath();
          x.ellipse(X, yy, 0.11, land ? 0.035 : 0.035 + Math.abs(Math.sin(f * 7)) * 0.06, 0, 0, TAU);
          x.lineWidth = 0.025;
          x.strokeStyle = c;
          x.stroke();
        }
        return [0, -0.5];
      }, { at: 0.5 });
    if (mode === 'card')
      // 電子票證感應：卡片靠過去，螢幕變綠「嗶」，感應弧線
      return stage(x, W, H, P, t, loop, LB, GR, (x, q, after, c, c2) => {
        const tap = q >= 0.38;
        fillRR(x, -0.18, -0.6, 0.36, 0.6, 0.05, INK);
        fillRR(x, -0.12, -0.52, 0.24, 0.12, 0.02, tap ? c2 : shade(INK, 0.25));
        if (tap) utxt(x, '嗶', 0, -0.46, 0.07, INK);
        ell(x, 0, -0.22, 0.1, 0.1, shade(INK, 0.3));
        const inn = ease(seg(q, 0.22, 0.36)), bump = tap ? Math.sin(seg(q, 0.36, 0.42) * Math.PI) * 0.02 : 0;
        x.save();
        x.translate(0.06 + (1 - inn) * 0.7 - bump, -0.3 - (1 - inn) * 0.2);
        x.rotate(-0.25 - (1 - inn) * 0.3);
        fillRR(x, -0.17, -0.11, 0.34, 0.22, 0.03, c);
        x.fillStyle = BL;
        x.fillRect(-0.17, -0.06, 0.34, 0.04);
        circle(x, 0.1, 0.05, 0.03, YL);
        x.restore();
        if (tap)
          for (let i = 0; i < 2; i++) {
            const g = back(seg(q, 0.38 + i * 0.04, 0.48 + i * 0.04));
            if (g > 0) arcLine(x, 0.24, -0.42, (0.06 + i * 0.05) * g, -1.2, 0.2, 0.014, YL);
          }
        return [0, -0.5];
      }, { at: 0.45 });
    if (mode === 'scratch')
      // 刮刮樂：硬幣來回刮，銀漆一條條刮掉露出 7
      return stage(x, W, H, P, t, loop, O, YL, (x, q, after, c, c2) => {
        fillRR(x, -0.26, -0.66, 0.52, 0.66, 0.03, c);
        fillRR(x, -0.26, -0.66, 0.52, 0.12, 0.03, c2);
        utxt(x, '刮刮樂', 0, -0.6, 0.065, RD);
        fillRR(x, -0.2, -0.48, 0.4, 0.36, 0.02, WH);
        utxt(x, '7', 0, -0.3, 0.2, RD);
        const s = seg(q, 0.22, 0.5), rows = 5;
        for (let r = 0; r < rows; r++) {
          const done = seg(s, r / rows, (r + 1) / rows);
          const w = 0.4 * (1 - done);
          if (w > 0.001) {
            x.fillStyle = SV;
            x.fillRect(-0.2 + (r % 2 ? 0 : 0.4 - w), -0.48 + r * 0.072, w, 0.072);
          }
        }
        if (s > 0 && s < 1) {
          const r = Math.min(rows - 1, Math.floor(s * rows)), u = s * rows - r, X = r % 2 ? 0.2 - u * 0.4 : -0.2 + u * 0.4;
          x.save();
          x.translate(X, -0.44 + r * 0.072);
          x.rotate(-0.5);
          ell(x, 0, 0, 0.08, 0.08, YL);
          ell(x, 0, 0, 0.055, 0.055, shade(YL, -0.15));
          x.restore();
        } else if (s >= 1) {
          x.save();
          x.translate(0.2, -0.08 - Math.sin(after * 2) * 0.01);
          x.rotate(-0.5);
          ell(x, 0, 0, 0.08, 0.08, YL);
          ell(x, 0, 0, 0.055, 0.055, shade(YL, -0.15));
          x.restore();
        }
        return [0, -0.3];
      }, { at: 0.52 });
    // 紅包：福字蹦出、封口翻開、抽出卡片
    return stage(x, W, H, P, t, loop, RD, YL, (x, q, after, c, c2) => {
      const open = inout(seg(q, 0.3, 0.42)), card = back(seg(q, 0.42, 0.56));
      fillRR(x, -0.18, -0.68 - card * 0.16, 0.36, 0.42, 0.02, WH);
      fillRR(x, -0.12, -0.63 - card * 0.16, 0.24, 0.035, 0.017, c);
      fillRR(x, -0.23, -0.7, 0.46, 0.7, 0.03, c);
      const fh = 0.2 * (1 - 2 * open);
      poly(x, [[-0.23, -0.7], [0.23, -0.7], [0, -0.7 - fh]], open > 0.5 ? shade(c, 0.2) : shade(c, -0.18));
      hi(x, -0.17, -0.43, 0.36, 0.025);
      const pop = back(seg(q, 0.16, 0.28));
      x.save();
      x.translate(0, -0.3);
      x.scale(pop, pop);
      x.rotate(Math.PI / 4);
      fillRR(x, -0.1, -0.1, 0.2, 0.2, 0.02, c2);
      x.restore();
      if (pop > 0.05) {
        x.save();
        x.translate(0, -0.3);
        x.scale(pop, pop);
        utxt(x, '福', 0, 0.005, 0.15, c);
        x.restore();
      }
      return [0, -0.95];
    }, { at: 0.55 });
  };

  /* ───────── 看屋物件 ───────── */
  /* ───────── #689 小物漂浮環繞立體片名（estate.float）─────────
     鏡頭往前飛過鑰匙、捲尺、安全帽、磚塊、水平儀、存錢筒；片名從深處回彈浮出（2D 疊層假厚度），
     最後 6 個小物繞片名漂浮，環繞的小物會避開片名＋副標的文字框。t 以秒計（loop≈8）。 */
  const FLOAT_KINDS = ['key', 'tape', 'hat', 'brick', 'level', 'piggy'];
  const floatProp = (x: CanvasRenderingContext2D, k: string, s: number, c: string, c2: string) => {
    if (k === 'key') {
      const g = '#f2c14e';
      circle(x, -s * 0.45, 0, s * 0.42, shade(g, -0.28));
      circle(x, -s * 0.49, -s * 0.04, s * 0.4, g);
      x.save(); x.globalCompositeOperation = 'destination-out'; circle(x, -s * 0.49, -s * 0.04, s * 0.14, '#000'); x.restore();
      x.beginPath(); x.arc(-s * 0.49, -s * 0.04, s * 0.31, 3.6, 4.9); x.lineWidth = s * 0.06; x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineCap = 'round'; x.stroke();
      fillRR(x, -s * 0.1, -s * 0.06, s * 1.05, s * 0.18, s * 0.04, shade(g, -0.28));
      fillRR(x, -s * 0.1, -s * 0.1, s * 1.05, s * 0.17, s * 0.04, g);
      poly(x, [[0.55, 0.06], [0.95, 0.06], [0.95, 0.3], [0.86, 0.3], [0.84, 0.2], [0.76, 0.2], [0.74, 0.32], [0.64, 0.32], [0.62, 0.18], [0.55, 0.18]].map(([a, b]) => [a * s, b * s]), shade(g, -0.18));
      fillRR(x, -s * 0.05, -s * 0.08, s * 0.9, s * 0.035, s * 0.02, 'rgba(255,255,255,.6)');
      fillRR(x, -s * 0.12, -s * 0.14, s * 0.08, s * 0.28, s * 0.03, shade(g, -0.4));
    } else if (k === 'tape') {
      const g = '#ffd23f';
      fillRR(x, -s * 0.62, -s * 0.55, s * 1.2, s * 1.16, s * 0.28, shade(g, -0.3));
      fillRR(x, -s * 0.68, -s * 0.6, s * 1.2, s * 1.12, s * 0.28, g);
      circle(x, -s * 0.08, -s * 0.04, s * 0.34, shade(g, -0.22));
      circle(x, -s * 0.1, -s * 0.07, s * 0.3, INK);
      circle(x, -s * 0.1, -s * 0.07, s * 0.12, '#e9eef5');
      circle(x, -s * 0.1, -s * 0.07, s * 0.05, shade('#e9eef5', -0.3));
      fillRR(x, -s * 0.6, -s * 0.54, s * 0.5, s * 0.07, s * 0.035, 'rgba(255,255,255,.55)');
      fillRR(x, -s * 0.6, -s * 0.42, s * 0.07, s * 0.25, s * 0.035, 'rgba(255,255,255,.4)');
      fillRR(x, s * 0.48, s * 0.28, s * 0.75, s * 0.2, s * 0.03, shade(g, 0.15));
      fillRR(x, s * 0.48, s * 0.42, s * 0.75, s * 0.06, s * 0.02, shade(g, -0.2));
      for (let i = 0; i < 9; i++) line(x, s * (0.55 + i * 0.075), s * 0.3, s * (0.55 + i * 0.075), s * (0.3 + (i % 2 ? 0.06 : 0.11)), s * 0.022, INK);
      fillRR(x, s * 1.2, s * 0.22, s * 0.07, s * 0.3, s * 0.02, '#9aa3b2');
      fillRR(x, s * 0.3, -s * 0.62, s * 0.22, s * 0.14, s * 0.05, '#e2483d');
    } else if (k === 'hat') {
      x.beginPath(); x.ellipse(0, s * 0.32, s * 0.98, s * 0.22, 0, 0, TAU); x.fillStyle = shade(c, -0.3); x.fill();
      x.beginPath(); x.ellipse(0, s * 0.26, s * 0.96, s * 0.2, 0, 0, TAU); x.fillStyle = shade(c, -0.08); x.fill();
      x.beginPath(); x.moveTo(-s * 0.72, s * 0.28); x.bezierCurveTo(-s * 0.75, -s * 0.62, s * 0.75, -s * 0.62, s * 0.72, s * 0.28); x.closePath(); x.fillStyle = c; x.fill();
      x.beginPath(); x.moveTo(s * 0.2, s * 0.28); x.bezierCurveTo(s * 0.45, -s * 0.15, s * 0.55, -s * 0.25, s * 0.5, -s * 0.32); x.bezierCurveTo(s * 0.72, -s * 0.1, s * 0.75, s * 0.1, s * 0.72, s * 0.28); x.closePath(); x.fillStyle = shade(c, -0.2); x.fill();
      poly(x, [[-s * 0.1, -s * 0.43], [s * 0.1, -s * 0.43], [s * 0.13, s * 0.27], [-s * 0.13, s * 0.27]], shade(c, 0.2));
      line(x, -s * 0.42, -s * 0.22, -s * 0.22, -s * 0.38, s * 0.07, 'rgba(255,255,255,.65)');
      circle(x, -s * 0.5, -s * 0.06, s * 0.035, 'rgba(255,255,255,.5)');
      fillRR(x, -s * 0.3, -s * 0.05, s * 0.18, s * 0.14, s * 0.03, c2);
    } else if (k === 'brick') {
      const g = '#c8553d', a = s * 0.95, b = s * 0.42, h = s * 0.42;
      poly(x, [[-a, -h * 0.2], [0, -h * 0.2 - b], [a, -h * 0.2], [0, -h * 0.2 + b]], shade(g, 0.22));
      poly(x, [[-a, -h * 0.2], [0, -h * 0.2 + b], [0, h + b * 0.5], [-a, h - b * 0.5]], g);
      poly(x, [[a, -h * 0.2], [0, -h * 0.2 + b], [0, h + b * 0.5], [a, h - b * 0.5]], shade(g, -0.28));
      const R = rng(7);
      for (let i = 0; i < 14; i++) { const u = R(), v = R(); circle(x, -a * (0.15 + u * 0.75), -h * 0.2 + b * (1 - u) * 0.85 + v * h * 0.85 + s * 0.04, s * 0.022, shade(g, -0.25)); }
      for (let i = 0; i < 10; i++) circle(x, -a * 0.6 + R() * a * 1.2, -h * 0.2 + (R() - 0.5) * b * 0.9, s * 0.02, shade(g, -0.05));
      circle(x, -a * 0.2, -h * 0.2 - b * 0.05, s * 0.12, shade(g, -0.1));
      circle(x, a * 0.25, -h * 0.2 + b * 0.05, s * 0.12, shade(g, -0.1));
      line(x, -a * 0.75, -h * 0.2 + s * 0.03, -a * 0.3, -h * 0.2 + b * 0.5, s * 0.045, 'rgba(255,255,255,.45)');
    } else if (k === 'level') {
      fillRR(x, -s * 1.05, -s * 0.14, s * 2.1, s * 0.32, s * 0.06, shade(c2, -0.3));
      fillRR(x, -s * 1.1, -s * 0.2, s * 2.1, s * 0.32, s * 0.06, c2);
      fillRR(x, -s * 0.25, -s * 0.13, s * 0.4, s * 0.18, s * 0.08, '#e9eef5');
      fillRR(x, -s * 0.21, -s * 0.1, s * 0.32, s * 0.12, s * 0.06, '#9be564');
      circle(x, -s * 0.02, -s * 0.05, s * 0.04, '#e9fbd8');
      line(x, -s * 0.12, -s * 0.12, -s * 0.12, s * 0.04, s * 0.015, INK);
      line(x, s * 0.08, -s * 0.12, s * 0.08, s * 0.04, s * 0.015, INK);
      fillRR(x, -s * 1.02, -s * 0.17, s * 0.6, s * 0.05, s * 0.025, 'rgba(255,255,255,.5)');
      fillRR(x, s * 0.7, -s * 0.17, s * 0.25, s * 0.32, s * 0.05, INK);
    } else {
      const g = '#f6a5c0';
      x.beginPath(); x.ellipse(s * 0.05, s * 0.08, s * 0.72, s * 0.55, 0, 0, TAU); x.fillStyle = shade(g, -0.25); x.fill();
      x.beginPath(); x.ellipse(0, 0, s * 0.7, s * 0.54, 0, 0, TAU); x.fillStyle = g; x.fill();
      fillRR(x, -s * 0.45, s * 0.4, s * 0.18, s * 0.25, s * 0.06, shade(g, -0.3));
      fillRR(x, s * 0.25, s * 0.4, s * 0.18, s * 0.25, s * 0.06, shade(g, -0.3));
      poly(x, [[-s * 0.35, -s * 0.42], [-s * 0.15, -s * 0.7], [-s * 0.05, -s * 0.4]], shade(g, -0.12));
      fillRR(x, s * 0.6, -s * 0.12, s * 0.22, s * 0.26, s * 0.1, shade(g, -0.12));
      circle(x, s * 0.68, -s * 0.03, s * 0.03, INK); circle(x, s * 0.74, s * 0.06, s * 0.03, INK);
      circle(x, s * 0.35, -s * 0.18, s * 0.05, INK);
      fillRR(x, -s * 0.2, -s * 0.5, s * 0.3, s * 0.06, s * 0.03, INK);
      x.beginPath(); x.ellipse(-s * 0.3, -s * 0.22, s * 0.18, s * 0.08, -0.5, 0, TAU); x.fillStyle = 'rgba(255,255,255,.55)'; x.fill();
      circle(x, -s * 0.6, -s * 0.05, s * 0.05, shade(g, -0.3));
    }
  };
  const floatTitle = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const title = String(P.texts ?? '持家男子KC').split('|')[0].trim() || '持家男子KC';
    const sub = String(P.sub ?? '');
    const hexOk = (v: unknown, d: string) => (/^#[0-9a-f]{6}$/i.test(String(v ?? '')) ? String(v) : d);
    const c = hexOk(P.color, '#ffb703'), c2 = hexOk(P.color2, '#2f6fd6');
    const face = hexOk(P.c1, '#f5f0e6'), side = hexOk(P.c2, '#24408a'), glow = hexOk(P.glow, '#8b5cf6');
    const sky = String(P.sky ?? 'space');
    const depthK = Math.max(0, Math.min(3, num(P.depth, 1)));
    const count = Math.max(0, Math.min(80, Math.round(num(P.count, 40))));
    const kinds = String(P.props ?? FLOAT_KINDS.join(',')).split(',').map((s) => s.trim()).filter((k) => FLOAT_KINDS.includes(k));
    if (!kinds.length) kinds.push(...FLOAT_KINDS);
    const S = Math.min(W, H), port = H > W, size = num(P.size, 1);
    const FONT = '"Noto Sans TC","Noto Sans CJK TC","PingFang TC",sans-serif';
    // 背景：太空（星點＋扁平行星）；solid／none 由場景底色決定
    if (sky === 'space') {
      const R = rng(3);
      for (let i = 0; i < 140; i++) { const r = (R() * 1.8 + 0.4) * S / 720; circle(x, R() * W, R() * H, r, `rgba(255,255,255,${(0.25 + R() * 0.6).toFixed(2)})`); }
      const px = W * 0.12, py = H * (port ? 0.12 : 0.2), pr = S * 0.09;
      circle(x, px, py, pr, '#3b2f6b'); circle(x, px - pr * 0.25, py - pr * 0.25, pr * 0.7, '#4a3d85');
      x.beginPath(); x.ellipse(px, py, pr * 1.6, pr * 0.32, -0.3, 0.15 * Math.PI, 0.85 * Math.PI); x.lineWidth = S * 0.008; x.strokeStyle = '#8b7fd6'; x.stroke();
      circle(x, W * 0.86, H * (port ? 0.86 : 0.78), S * 0.035, '#e9905f'); circle(x, W * 0.86 - S * 0.01, H * (port ? 0.86 : 0.78) - S * 0.01, S * 0.022, '#f4b183');
    }
    const fade = t > loop - 0.35 ? clamp((loop - t) / 0.35) : 1;
    x.globalAlpha = fade;
    // 片名排版（9:16 超過 4 字拆兩行）
    const chars = [...title];
    const cut = chars.length <= 6 ? 2 : Math.ceil(chars.length / 2);
    const lines = port && chars.length > 4 ? [chars.slice(0, cut).join(''), chars.slice(cut).join('')] : [title];
    const longest = Math.max(...lines.map((l) => [...l].length));
    const fs = (port ? Math.min((W * 0.84) / Math.max(2.6, longest * 0.98), S * 0.22) : Math.min((W * 0.78) / Math.max(2, longest * 0.98), S * 0.24)) * size;
    const cxT = W / 2, cyT = H * 0.5;
    const depth = fs * 0.16 * depthK;
    const lh = fs * 1.05;
    const subFs = fs * 0.26;
    // 文字框（避開用）：片名寬 × 行數高＋副標
    x.font = `900 ${fs}px ${FONT}`;
    const tw = Math.max(...lines.map((l) => x.measureText(l).width));
    const boxW = tw / 2 + depth * 0.55 + fs * 0.08;
    const boxTop = cyT - (lines.length * lh) / 2 - fs * 0.05;
    const boxBot = cyT + (lines.length * lh) / 2 + depth + (sub ? fs * 0.25 + subFs * 0.8 : 0);
    // 飛行小物（固定亂數）
    const R = rng(42);
    const objs: { k: string; x: number; y: number; z: number; r0: number; vr: number; ph: number }[] = [];
    for (let i = 0; i < count; i++) {
      const o = { k: kinds[i % kinds.length], x: (R() - 0.5) * 2.2, y: (R() - 0.5) * 1.5, z: 1 + i * (10.8 / Math.max(count, 1)) + R() * 0.3, r0: R() * 6, vr: (R() - 0.5) * 1.2, ph: R() * 6 };
      if (Math.hypot(o.x, o.y) < 0.45) o.x += Math.sign(o.x || 1) * 0.5;
      objs.push(o);
    }
    const cam = inout(seg(t, 0, 3.6)) * 10.2;
    const f = S * 0.9;
    type It = { k?: string; r0?: number; vr?: number; dz: number; ox?: number; oy?: number; orbit?: number; title?: 1 };
    const list: It[] = [];
    for (const o of objs) {
      const dz = o.z - cam;
      if (dz > -0.2) list.push({ k: o.k, r0: o.r0, vr: o.vr, dz: Math.max(dz, 0.15), ox: o.x * (port ? 0.7 : 1), oy: o.y * (port ? 1.4 : 1) + Math.sin(t * 0.8 + o.ph) * 0.05 });
    }
    const titleZ = Math.max(0.9, 11.6 - cam);
    list.push({ title: 1, dz: titleZ });
    const orb = ease(seg(t, 3.4, 4.8));
    if (orb > 0) for (let i = 0; i < Math.min(6, kinds.length * 6); i++) {
      const a = t * 0.35 + (i * Math.PI) / 3;
      list.push({ k: kinds[i % kinds.length], r0: i, vr: 0.6, dz: titleZ + Math.sin(a) * 0.6, ox: Math.cos(a) * (port ? 0.55 : 1.05), oy: Math.sin(a) * 0.08 + (i % 2 ? -0.4 : 0.6) * (port ? 1.6 : 1), orbit: orb });
    }
    list.sort((a, b) => b.dz - a.dz);
    const drawTitle = () => {
      const a = seg(t, 2.6, 4.2);
      if (a <= 0) return;
      const sc = back(a);
      x.save(); x.translate(cxT, cyT);
      // 光帶：3 層半透明硬邊條
      const bw = W * (0.2 + 0.9 * ease(seg(t, 3, 4.4)));
      for (const [al, hh] of [[0.5, 0.06], [0.3, 0.12], [0.15, 0.2]]) { x.globalAlpha = fade * al * Math.min(1, a * 2); fillRR(x, -bw / 2, (-S * hh) / 2, bw, S * hh, (S * hh) / 2, glow); }
      x.globalAlpha = fade * Math.min(1, a * 3);
      x.scale(sc, sc); x.rotate(-0.04 * (1 - ease(seg(t, 3.6, 5))));
      x.font = `900 ${fs}px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle';
      const d0 = depth * ease(seg(t, 3.2, 4.4));
      const step = Math.max(1, fs / 120);
      lines.forEach((L, i) => {
        const yy = (i - (lines.length - 1) / 2) * lh;
        for (let d = d0; d > 0; d -= step) { x.fillStyle = d > d0 * 0.6 ? shade(side, -0.25) : side; x.fillText(L, d * 0.55, yy + d); }
        x.fillStyle = face; x.fillText(L, 0, yy);
        x.save(); x.beginPath(); x.rect(-W, yy - fs * 0.5, W * 2, fs * 0.36); x.clip(); x.fillStyle = shade(face, 0.6); x.fillText(L, 0, yy); x.restore();
        x.save(); x.beginPath(); x.rect(-W, yy + fs * 0.18, W * 2, fs * 0.4); x.clip(); x.fillStyle = shade(face, -0.12); x.fillText(L, 0, yy); x.restore();
      });
      const sa = ease(seg(t, 4.2, 5));
      if (sub && sa > 0) { x.globalAlpha = fade * sa; x.font = `700 ${subFs}px ${FONT}`; x.fillStyle = '#ffd23f'; x.fillText(sub, 0, (lines.length / 2) * lh + fs * 0.25 + d0); }
      x.restore();
      x.globalAlpha = fade;
    };
    for (const it of list) {
      if (it.title) { drawTitle(); continue; }
      const sc = f / it.dz;
      let X = W / 2 + it.ox! * sc * 0.9, Y = H / 2 + it.oy! * sc * 0.9;
      const s = S * 0.132 * (f / it.dz) / S * (it.orbit ?? 1) * size;
      if (X < -s * 3 || X > W + s * 3 || Y < -s * 3 || Y > H + s * 3 || s > S * 0.7) continue;
      // 避開文字框：環繞小物若壓到片名／副標，推到最近的框外
      if (it.orbit) {
        const m = s * 1.15;
        const dx = X - cxT, inX = Math.abs(dx) < boxW + m, inY = Y > boxTop - m && Y < boxBot + m;
        if (inX && inY) {
          const pushX = boxW + m - Math.abs(dx), pushUp = Y - (boxTop - m), pushDn = boxBot + m - Y;
          const best = Math.min(pushX, pushUp, pushDn);
          if (best === pushX) X = cxT + Math.sign(dx || 1) * (boxW + m);
          else if (best === pushUp) Y = boxTop - m;
          else Y = boxBot + m;
        }
        // 環繞小物整個留在畫面內
        X = Math.max(s * 1.1, Math.min(W - s * 1.1, X)); Y = Math.max(s * 0.9, Math.min(H - s * 0.9, Y));
      }
      const fog = clamp((it.dz - 1) / 9);
      x.save(); x.translate(X, Y); x.rotate(it.r0! + it.vr! * t);
      // 鏡頭停下後，貼在鏡頭前的飛行小物淡出，把畫面讓給環繞的 6 個
      const clearNear = it.orbit || it.dz > 3 ? 1 : 1 - seg(t, 3.6, 4.6);
      if (clearNear <= 0) { x.restore(); continue; }
      x.globalAlpha = fade * clearNear * (it.orbit ? it.orbit : 1 - fog * 0.55);
      floatProp(x, it.k!, s, c, c2);
      x.restore();
    }
    x.globalAlpha = 1;
    return { cx: cxT, cy: cyT, r: S * 0.45 };
  };
  // #691 拉鍊拉開轉場：布面＋拉鍊（齒、布帶、拉鍊頭印 KC），拉過的地方裂成 V 字露出下一段（card 字卡｜photo 照片｜none 透明），拉到底兩片布往左右飛走；mode=close 反向。
  // 常數全在函式內（匯出時整個工廠 toString 內嵌）；布面與單顆齒用離屏快取，只畫畫面內看得到的齒。
  const ZIP_CACHE: Record<string, HTMLCanvasElement> = {};
  const ZIP_IMG: Record<string, HTMLImageElement> = {};
  const zipCanvas = (key: string, w: number, h: number, paint: (c: CanvasRenderingContext2D) => void) => {
    const hit = ZIP_CACHE[key];
    if (hit) return hit;
    const keys = Object.keys(ZIP_CACHE);
    if (keys.length > 12) keys.forEach((k) => delete ZIP_CACHE[k]);
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(w));
    cv.height = Math.max(1, Math.ceil(h));
    paint(cv.getContext('2d')!);
    return (ZIP_CACHE[key] = cv);
  };
  const zipper = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const INK = '#1d2433';
    const FONT = '"Noto Sans TC","Noto Sans CJK TC","PingFang TC",sans-serif';
    const FABRIC: Record<string, string[]> = { kc: ['#1F3A5F', '#F28C28'], navy: ['#2f3e6b', '#e9a23b'], denim: ['#3e6a9e', '#f2c14e'], olive: ['#66743a', '#e8dcc0'], red: ['#c8483f', '#f5f0e6'], cream: ['#e7d8bb', '#c8483f'], lilac: ['#8e95d6', '#f6a5c0'] };
    const PULL: Record<string, string> = { silver: '#c9d1dc', gold: '#f2c14e', black: '#3a4152' };
    const isHex = (v: unknown) => /^#[0-9a-f]{6}$/i.test(String(v ?? '').trim());
    const fk = String(P.fabric ?? 'kc').trim();
    const fab = isHex(fk) ? String(fk) : (FABRIC[fk] || FABRIC.kc)[0];
    const acc = isHex(P.acc) ? String(P.acc) : isHex(fk) ? '#F28C28' : (FABRIC[fk] || FABRIC.kc)[1];
    const tape = isHex(P.tape) ? String(P.tape) : shade(fab, 0.18);
    const pk = String(P.pull ?? 'silver').trim();
    const pull = isHex(pk) ? pk : PULL[pk] || PULL.silver;
    const teeth = isHex(P.teeth) ? String(P.teeth) : '#d9dee6';
    const card = isHex(P.card) ? String(P.card) : '#f5f0e6';
    const next = ['card', 'photo', 'none'].includes(String(P.next)) ? String(P.next) : 'card';
    const close = String(P.zmode ?? 'open') === 'close';
    const horiz = String(P.dir ?? 'v') === 'h';
    const angle = Math.max(6, Math.min(30, num(P.angle, 14)));
    const size = Math.max(0.4, Math.min(2.5, num(P.size, 1)));
    const title = String(P.texts ?? '打開這間3房').split('|')[0].trim();
    const sub = String(P.sub ?? '');
    const q = clamp(t / Math.max(0.1, loop));
    const S = Math.min(W, H);
    x.clearRect(0, 0, W, H);

    // ── 開口裡：下一段畫面（字卡／照片／透明），字畫在這裡，所以會從開口露出
    const label = (cy: number, light: boolean) => {
      if (!title) return;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      const fs = S * (W > H ? 0.16 : 0.15);
      x.font = `900 ${fs}px ${FONT}`;
      x.fillStyle = light ? fab : '#ffffff';
      const lines = W < H && title.length > 4 ? [title.slice(0, Math.ceil(title.length / 2)), title.slice(Math.ceil(title.length / 2))] : [title];
      let fit = 1;
      lines.forEach((l) => (fit = Math.min(fit, (W * 0.86) / Math.max(1, x.measureText(l).width))));
      if (fit < 1) x.font = `900 ${fs * fit}px ${FONT}`;
      const lh = fs * fit * 1.18;
      const y0 = cy - ((lines.length - 1) * lh) / 2;
      lines.forEach((l, i) => x.fillText(l, W / 2, y0 + i * lh));
      if (sub) {
        x.font = `800 ${S * 0.05}px ${FONT}`;
        x.fillStyle = light ? shade(acc, -0.25) : acc;
        x.fillText(sub, W / 2, y0 + (lines.length - 1) * lh + fs * fit * 0.62 + S * 0.06);
      }
    };
    if (next === 'card') {
      x.fillStyle = card;
      x.fillRect(0, 0, W, H);
      const [r, g, b] = hex(card);
      const light = r * 0.299 + g * 0.587 + b * 0.114 > 150;
      circle(x, W / 2, H / 2, S * 0.42, light ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.1)');
      fillRR(x, W / 2 - S * 0.09, H / 2 + S * 0.3, S * 0.18, S * 0.025, S * 0.0125, acc);
      label(H * 0.47, light);
    } else if (next === 'photo') {
      const src = String(P.img ?? '');
      let im = src ? ZIP_IMG[src] : undefined;
      if (src && !im) {
        im = ZIP_IMG[src] = new Image();
        im.crossOrigin = 'anonymous';
        im.src = src;
      }
      if (im && im.complete && im.naturalWidth) {
        const k = Math.max(W / im.naturalWidth, H / im.naturalHeight);
        const z = 1.04 + 0.04 * q;
        const dw = im.naturalWidth * k * z, dh = im.naturalHeight * k * z;
        x.drawImage(im, (W - dw) / 2, (H - dh) / 2, dw, dh);
      } else {
        // 沒有照片時的扁平示意建案照
        x.fillStyle = '#8fd3f4';
        x.fillRect(0, 0, W, H);
        circle(x, W * 0.78, H * 0.2, S * 0.08, '#ffd23f');
        x.fillStyle = '#7cc36f';
        x.fillRect(0, H * 0.78, W, H * 0.22);
        const bw = S * 0.5, bx = W / 2 - bw / 2, bt = H * 0.78 - S * 0.62;
        fillRR(x, bx + S * 0.03, bt + S * 0.03, bw, S * 0.62, 0, shade('#f5f0e6', -0.25));
        fillRR(x, bx, bt, bw, S * 0.62, 0, '#f5f0e6');
        for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) fillRR(x, bx + S * 0.06 + c * S * 0.15, bt + S * 0.06 + r * S * 0.13, S * 0.09, S * 0.08, S * 0.01, r === 3 && c === 1 ? '#c8483f' : '#5bc0eb');
      }
      if (title) {
        const by = H * (W > H ? 0.72 : 0.74), bh = S * (W < H && title.length > 4 ? 0.34 : 0.22);
        x.fillStyle = 'rgba(29,36,51,.72)';
        x.fillRect(0, by - bh / 2, W, bh + (sub ? S * 0.1 : 0));
        label(by, false);
      }
    }

    // ── 進度：0–12% 拉鍊頭晃→12–78% 拉下→76–100% 布飛開；close 反向
    const open = inout(seg(q, 0.12, 0.78));
    const prog = close ? 1 - inout(seg(q, 0.22, 0.88)) : open;
    const flyAmt = close ? 1 - ease(seg(q, 0, 0.24)) : ease(seg(q, 0.76, 1));
    x.save();
    let L = H, Wd = W;
    if (horiz) {
      x.translate(0, H);
      x.rotate(-Math.PI / 2);
      L = W;
      Wd = H;
    }
    const s = S * 0.045 * size, cx = Wd / 2;
    const ys = -s * 1.2 + prog * (L + s * 2.4);
    const ang = Math.tan((angle * Math.PI) / 180);
    const push = flyAmt * Wd * 0.75;
    const gap = (y: number) => Math.max(0, ys - y) * ang + push;
    const step = s * 0.5, N = Math.ceil(L / step) + 2;
    // 布面快取（斜紋、配色橫條、虛線縫線、左上硬邊高光）
    const paintCloth = (Wd: number, L: number) => (c: CanvasRenderingContext2D) => {
      c.fillStyle = fab;
      c.fillRect(0, 0, Wd, L);
      c.strokeStyle = 'rgba(255,255,255,.06)';
      c.lineWidth = s * 0.08;
      for (let i = -L; i < Wd + L; i += s * 0.42) {
        c.beginPath();
        c.moveTo(i, 0);
        c.lineTo(i + L * 0.6, L);
        c.stroke();
      }
      const by = L * 0.36, bh = L * 0.12;
      c.fillStyle = acc;
      c.fillRect(0, by, Wd, bh);
      c.fillStyle = shade(acc, -0.22);
      c.fillRect(0, by + bh * 0.78, Wd, bh * 0.22);
      c.setLineDash([s * 0.35, s * 0.25]);
      c.lineWidth = s * 0.06;
      c.strokeStyle = 'rgba(255,255,255,.45)';
      [by - s * 0.3, by + bh + s * 0.3].forEach((y) => {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(Wd, y);
        c.stroke();
      });
      c.setLineDash([]);
      c.fillStyle = 'rgba(255,255,255,.08)';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(Wd * 0.42, 0);
      c.lineTo(Wd * 0.1, L);
      c.lineTo(0, L);
      c.fill();
    };
    const ckey = `${fab}|${acc}|${Math.round(s * 10)}`;
    const cloth = horiz ? undefined! : zipCanvas(`f|${Math.round(Wd)}|${Math.round(L)}|${ckey}`, Wd, L, paintCloth(Wd, L));
    const clothH = horiz ? zipCanvas(`f|${Math.round(W)}|${Math.round(H)}|${ckey}`, W, H, paintCloth(W, H)) : undefined!;
    // 單顆齒快取（左右各一張）
    const tw = s * 0.62, th = s * 0.36, pad = s * 0.06;
    const toothImg = (side: number) => zipCanvas(`t|${side}|${Math.round(s * 10)}|${teeth}`, tw + pad * 2, th + pad * 2, (c) => {
      const ox = pad + (side > 0 ? s * 0.04 : 0);
      fillRR(c, ox + side * s * 0.04 - (side > 0 ? s * 0.04 : 0), pad + s * 0.05, tw - s * 0.02, th - s * 0.02, th * 0.45, shade(teeth, -0.3));
      fillRR(c, pad, pad, tw - s * 0.02, th - s * 0.02, th * 0.45, teeth);
      fillRR(c, pad + (side < 0 ? tw * 0.15 : tw * 0.3), pad + th * 0.12, tw * 0.55, th * 0.22, th * 0.11, 'rgba(255,255,255,.55)');
    });
    const onScreen = (px: number) => px > -s * 2 && px < Wd + s * 2;
    [-1, 1].forEach((side) => {
      if (!onScreen(cx + side * (push + s))) return; // 已飛出畫面
      x.save();
      x.beginPath();
      const ox = side < 0 ? -Wd * 2 : Wd * 3;
      x.moveTo(ox, -s * 4);
      for (let i = -4; i <= N + 4; i++) x.lineTo(cx + side * (gap(i * step) + s * 0.02), i * step);
      x.lineTo(ox, L + s * 4);
      x.closePath();
      x.clip();
      if (horiz) {
        // 橫拉時布面花紋維持正向（橫條仍是水平）
        x.rotate(Math.PI / 2);
        x.translate(0, -H);
        x.drawImage(clothH, 0, -side * push);
      } else x.drawImage(cloth, side * push, 0);
      x.restore();
      // 布帶（淺一階）＋開口處的深色反摺：整條一次畫完
      const edge = (k: number) => Array.from({ length: N + 5 }, (_, j) => [cx + side * (gap((j - 2) * step) + k), (j - 2) * step]);
      const inner = edge(0), outer = edge(s * 0.9), fold = edge(s * 1.25);
      poly(x, [...inner, ...outer.slice().reverse()], tape);
      x.beginPath();
      outer.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
      fold.slice().reverse().forEach(([a, b]) => x.lineTo(a, b));
      x.closePath();
      x.save();
      x.clip();
      x.fillStyle = shade(fab, -0.3);
      x.fillRect(-Wd, Math.min(ys, L + s) - L * 3, Wd * 3, L * 3); // 反摺只出現在已打開的段
      x.restore();
      x.setLineDash([s * 0.3, s * 0.22]);
      x.lineWidth = s * 0.07;
      x.strokeStyle = 'rgba(255,255,255,.55)';
      x.beginPath();
      edge(s * 0.7).forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
      x.stroke();
      x.setLineDash([]);
      // 齒：交錯咬合，只畫看得到的
      const img = toothImg(side);
      for (let i = -1; i <= N + 1; i++) {
        const y = i * step + (side > 0 ? step / 2 : 0);
        if (y < -s || y > L + s) continue;
        const root = cx + side * gap(y) - side * s * 0.3;
        const left = side < 0 ? root - tw : root;
        if (!onScreen(left)) continue;
        x.drawImage(img, left - pad, y - th / 2 - pad);
      }
    });
    // 拉鍊頭（拉片印 KC）
    if (ys > -s * 2 && ys < L + s * 2 && flyAmt < 0.08) {
      const sw = Math.sin(q * TAU * 3) * 0.25 * (1 - seg(q, 0.7, 0.9));
      const k = s * 2.3, col = pull, d = shade(col, -0.3);
      x.save();
      x.translate(cx, ys);
      if (close) x.rotate(Math.PI);
      poly(x, [[-k * 0.42, -k * 0.55], [k * 0.42, -k * 0.55], [k * 0.3, k * 0.5], [-k * 0.3, k * 0.5]], d);
      poly(x, [[-k * 0.46, -k * 0.6], [k * 0.38, -k * 0.6], [k * 0.26, k * 0.44], [-k * 0.34, k * 0.44]], col);
      poly(x, [[-k * 0.38, -k * 0.52], [-k * 0.22, -k * 0.52], [-k * 0.2, k * 0.36], [-k * 0.28, k * 0.36]], 'rgba(255,255,255,.55)');
      fillRR(x, -k * 0.18, -k * 0.2, k * 0.3, k * 0.5, k * 0.08, d);
      circle(x, -k * 0.03, k * 0.2, k * 0.13, shade(col, -0.45));
      x.translate(-k * 0.03, k * 0.2);
      x.rotate(sw);
      fillRR(x, -k * 0.24, k * 0.02, k * 0.52, k * 1.28, k * 0.2, d);
      fillRR(x, -k * 0.28, -k * 0.02, k * 0.52, k * 1.24, k * 0.2, col);
      fillRR(x, -k * 0.12, k * 0.18, k * 0.2, k * 0.36, k * 0.1, shade(col, -0.45));
      fillRR(x, -k * 0.22, k * 0.62, k * 0.06, k * 0.44, k * 0.03, 'rgba(255,255,255,.6)');
      circle(x, 0, 0, k * 0.1, shade(col, 0.25));
      // KC：永遠正著讀
      x.save();
      x.translate(-k * 0.02, k * 0.86);
      x.rotate((horiz ? Math.PI / 2 : 0) + (close ? Math.PI : 0));
      x.font = `900 ${k * 0.24}px ${FONT}`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillStyle = shade(col, -0.55);
      x.fillText('KC', 0, 0);
      x.restore();
      x.restore();
    }
    x.restore();
    void INK;
    return { cx: W / 2, cy: H / 2, r: S * 0.45 };
  };
  const estate = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    const mode = String(P.mode ?? 'calc');
    if (mode === 'float') return floatTitle(x, W, H, P, t, loop);
    if (mode === 'zipper') return zipper(x, W, H, P, t, loop);
    if (mode === 'meter')
      // 電表：轉盤轉、度數往上跳、閃電圖示蹦出
      return stage(x, W, H, P, t, loop, SV, YL, (x, q, after, c, c2) => {
        fillRR(x, -0.26, -0.78, 0.52, 0.72, 0.05, c);
        circle(x, 0, -0.5, 0.2, WH);
        fillRR(x, -0.14, -0.62, 0.28, 0.08, 0.01, INK);
        const v = 1200 + Math.round(ease(seg(q, 0.2, 0.48)) * 84);
        utxt(x, String(v).padStart(5, '0'), 0, -0.58, 0.055, WH, 700);
        fillRR(x, -0.14, -0.45, 0.28, 0.04, 0.02, shade(c, -0.2));
        const spin = q < 0.2 ? 0 : (q < 0.48 ? seg(q, 0.2, 0.48) * 6 : 6 + after * 0.3);
        x.fillStyle = RD;
        x.fillRect(-0.14 + ((spin % 1) * 0.22), -0.45, 0.06, 0.04);
        fillRR(x, -0.18, -0.2, 0.36, 0.06, 0.02, INK);
        x.fillStyle = INK;
        x.fillRect(-0.06, -0.06, 0.12, 0.06);
        hi(x, -0.22, -0.72, 0.5, 0.025);
        const z = back(seg(q, 0.44, 0.54));
        if (z > 0.02) {
          x.save();
          x.translate(0.34, -0.66);
          x.scale(z, z);
          circle(x, 0, 0, 0.06, c2);
          poly(x, [[-0.01, -0.06], [0.03, -0.06], [-0.01, 0], [0.02, 0], [-0.03, 0.08], [-0.01, 0.01], [-0.03, 0.01]], INK);
          x.restore();
        }
        return [0.34, -0.66];
      }, { at: 0.5 });
    if (mode === 'quake')
      // 地震書櫃：左右大幅搖晃、一本書掉下來，之後慢慢停
      return stage(x, W, H, P, t, loop, '#a0673d', O, (x, q, after, c, c2) => {
        const sh = seg(q, 0.22, 0.5), amp = sh > 0 && sh < 1 ? Math.sin(sh * TAU * 5) * 0.1 * (1 - sh * 0.6) : 0;
        const tilt = 0.06 * ease(seg(q, 0.45, 0.55));
        x.save();
        x.rotate(amp + tilt);
        fillRR(x, -0.26, -0.8, 0.52, 0.8, 0.02, c);
        const cs = [RD, BL, YL, GR, O, LB];
        for (let r = 0; r < 3; r++) {
          x.fillStyle = shade(c, -0.3);
          x.fillRect(-0.22, -0.76 + r * 0.25, 0.44, 0.21);
          for (let i = 0; i < 5; i++) {
            if (r === 0 && i === 4 && q > 0.34) continue;
            const j = amp * (i % 2 ? 0.1 : -0.1);
            fillRR(x, -0.2 + i * 0.075 + j, -0.72 + r * 0.25 + (i % 2) * 0.03, 0.06, 0.17 - (i % 2) * 0.03, 0.005, cs[(i + r) % 6]);
          }
        }
        hi(x, -0.24, -0.76, 0.7, 0.02);
        x.restore();
        const fall = seg(q, 0.34, 0.48);
        if (fall > 0) {
          const X = 0.1 + fall * 0.26, Y = -0.64 + bounce(fall) * 0.52;
          x.save();
          x.translate(X, Y);
          x.rotate(fall * 0.9 + (fall >= 1 ? 0.67 : 0));
          fillRR(x, -0.03, -0.09, 0.06, 0.18, 0.005, c2);
          x.restore();
        }
        if (sh > 0 && sh < 1)
          for (const s of [-1, 1]) for (let i = 0; i < 2; i++) line(x, s * (0.34 + i * 0.05), -0.7, s * (0.34 + i * 0.05), -0.55, 0.014, INK);
        return [0, -0.9];
      }, { at: 0.55, sway: 0 });
    if (mode === 'boxes')
      // 搬家紙箱：三箱依序掉下疊好，最上面封箱膠帶拉過去
      return stage(x, W, H, P, t, loop, '#c98d55', RD, (x, q, after, c, c2) => {
        const bx = (X: number, Yy: number, w: number, h: number, at: number, tape = 1) => {
          const p = bounce(seg(q, at, at + 0.16));
          if (seg(q, at, at + 0.16) <= 0) return;
          const y = Yy - (1 - p) * 1.4;
          fillRR(x, X - w / 2, y - h, w, h, 0.015, c);
          x.fillStyle = shade(c, 0.15);
          x.fillRect(X - w / 2, y - h, w, h * 0.16);
          x.fillStyle = WD;
          x.fillRect(X - 0.03, y - h, 0.06, h * 0.5 * tape);
        };
        bx(-0.16, 0, 0.36, 0.3, 0.02);
        bx(0.2, 0, 0.32, 0.26, 0.12);
        bx(0, -0.3, 0.34, 0.28, 0.24, ease(seg(q, 0.42, 0.52)));
        if (q > 0.02) utxt(x, '易碎', -0.16, -0.1 - (1 - bounce(seg(q, 0.02, 0.18))) * 1.4, 0.06, c2);
        return [0, -0.7];
      }, { drop: false, at: 0.52 });
    if (mode === 'board')
      // 社區公告欄：公告一張張釘上去，圖釘彈一下
      return stage(x, W, H, P, t, loop, '#a0673d', '#d9a86c', (x, q, after, c, c2) => {
        fillRR(x, -0.36, -0.82, 0.72, 0.6, 0.03, c);
        x.fillStyle = c2;
        x.fillRect(-0.32, -0.78, 0.64, 0.52);
        x.fillStyle = c;
        x.fillRect(-0.3, -0.22, 0.04, 0.22);
        x.fillRect(0.26, -0.22, 0.04, 0.22);
        const notes: [number, number, number, string][] = [[-0.18, -0.62, -0.08, WH], [0.14, -0.66, 0.06, YL], [-0.02, -0.42, 0.04, PK]];
        notes.forEach(([X, Yy, r, col], i) => {
          const p = back(seg(q, 0.22 + i * 0.08, 0.32 + i * 0.08));
          if (p <= 0.01) return;
          const flap = Math.sin(after * 2.5 + i) * 0.015;
          x.save();
          x.translate(X, Yy);
          x.rotate(r + flap);
          x.scale(p, p);
          fillRR(x, -0.11, -0.1, 0.22, 0.2, 0.01, col);
          x.fillStyle = SV;
          x.fillRect(-0.07, -0.05, 0.14, 0.02);
          x.fillRect(-0.07, 0, 0.1, 0.02);
          circle(x, 0, -0.08, 0.018 * (1 + Math.sin(seg(q, 0.3 + i * 0.08, 0.36 + i * 0.08) * Math.PI) * 0.6), RD);
          x.restore();
        });
        utxt(x, '公告', 0, -0.88, 0.07, INK);
        return [0, -0.55];
      }, { at: 0.56 });
    if (mode === 'aircon')
      // 冷氣機：出風口打開，冷風一波波往下吹
      return stage(x, W, H, P, t, loop, WH, LB, (x, q, after, c, c2) => {
        const open = ease(seg(q, 0.22, 0.32));
        fillRR(x, -0.38, -0.66, 0.76, 0.3, 0.08, c);
        fillRR(x, -0.32, -0.44, 0.64, 0.02 + open * 0.03, 0.015, SV);
        circle(x, 0.26, -0.58, 0.018, q > 0.22 ? GR : SV);
        fillRR(x, -0.3, -0.62, 0.3, 0.025, 0.012, shade(c, -0.06));
        if (open > 0.5)
          for (let i = 0; i < 3; i++) {
            const ph = (after * 0.9 + i * 0.13) % 1, k = seg(q, 0.3, 0.42);
            const X = -0.2 + i * 0.2, y0 = -0.34 + ph * 0.1;
            x.globalAlpha = Math.min(k, 1 - ph * 0.7);
            x.beginPath();
            x.moveTo(X, y0);
            x.quadraticCurveTo(X - 0.04, y0 + 0.1, X, y0 + 0.2);
            x.lineWidth = 0.02;
            x.strokeStyle = c2;
            x.lineCap = 'round';
            x.stroke();
            x.globalAlpha = 1;
          }
        const sp = back(seg(q, 0.36, 0.46));
        if (sp > 0.02) {
          star(x, -0.3, -0.18, 0.03 * sp, c2);
          star(x, 0.3, -0.12, 0.025 * sp, c2);
        }
        return [0, -0.66];
      }, { at: 0.48 });
    // 房貸計算機：按鍵一顆顆按下，螢幕數字往上滾
    return stage(x, W, H, P, t, loop, INK, O, (x, q, after, c, c2) => {
      fillRR(x, -0.24, -0.8, 0.48, 0.8, 0.05, c);
      fillRR(x, -0.19, -0.74, 0.38, 0.16, 0.02, '#c9e3a7');
      const v = Math.round(ease(seg(q, 0.22, 0.5)) * 25800);
      utxt(x, v.toLocaleString('en-US'), 0.02, -0.66, 0.075, INK, 800);
      const presses = [[1, 0], [2, 2], [3, 1], [0, 3], [2, 1], [3, 3]];
      for (let r = 0; r < 4; r++)
        for (let k = 0; k < 4; k++) {
          const idx = presses.findIndex(([a, b]) => a === r && b === k);
          const pr = idx >= 0 ? seg(q, 0.22 + idx * 0.045, 0.25 + idx * 0.045) : 0;
          const down = pr > 0 && pr < 1 ? 0.012 : 0;
          const col = k === 3 ? c2 : r === 0 ? '#9aa3ad' : WH;
          fillRR(x, -0.19 + k * 0.1, -0.52 + r * 0.12 + down, 0.08, 0.1, 0.02, down ? shade(col, -0.2) : col);
        }
      return [0, -0.8];
    }, { at: 0.55 });
  };

  // 圖解字卡：繪製在 dcard.ts（另外序列化成 MA_DCARD）
  const dcard = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => (globalThis as unknown as { MA_DCARD: { draw: (...a: unknown[]) => { cx: number; cy: number; r: number } } }).MA_DCARD.draw(x, W, H, P, t, loop);
  // 擴充包：繪製在 xp/（另外序列化成 MA_XPACK）
  const xpack = (x: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => (globalThis as unknown as { MA_XPACK: { draw: (...a: unknown[]) => { cx: number; cy: number; r: number } } }).MA_XPACK.draw(x, W, H, P, t, loop);
  const MODS: Record<string, typeof site> = { xpack, dcard, site, keys, furniture, house, contract, skyline, weather, signal, plant, clock, party, coins, gacha, drink, fun, taiwan, estate };
  const has = (m: string) => Object.prototype.hasOwnProperty.call(MODS, m);
  const draw = (m: string, ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    ctx.save();
    // 「蓋起來」類的動作：速度越快越早完成、之後停住；持續循環的畫面（天氣、號誌、時鐘、四季）各自用 speed
    const BUILD = ['site', 'furniture', 'house.build', 'contract.sign', 'skyline.grow', 'plant.grow', 'coins.stack', 'gacha', 'drink', 'fun', 'taiwan', 'estate', 'keys.door'];
    const tt = BUILD.includes(m) || BUILD.includes(`${m}.${String(P.mode)}`) ? Math.min(loop, t * num(P.speed, 1)) : t;
    const o = MODS[m](ctx, W, H, P, tt, loop);
    ctx.restore();
    return o;
  };
  return { draw, has };
};

(globalThis as unknown as { MA_PROP: unknown }).MA_PROP = propRenderer();
