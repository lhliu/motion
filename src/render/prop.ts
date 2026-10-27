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

  const MODS: Record<string, typeof site> = { site, keys, furniture, house, contract, skyline, weather, signal, plant, clock, party, coins, gacha, drink };
  const has = (m: string) => Object.prototype.hasOwnProperty.call(MODS, m);
  const draw = (m: string, ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number, loop: number) => {
    ctx.save();
    // 「蓋起來」類的動作：速度越快越早完成、之後停住；持續循環的畫面（天氣、號誌、時鐘、四季）各自用 speed
    const BUILD = ['site', 'furniture', 'house.build', 'contract.sign', 'skyline.grow', 'plant.grow', 'coins.stack', 'gacha', 'drink', 'keys.door'];
    const tt = BUILD.includes(m) || BUILD.includes(`${m}.${String(P.mode)}`) ? Math.min(loop, t * num(P.speed, 1)) : t;
    const o = MODS[m](ctx, W, H, P, tt, loop);
    ctx.restore();
    return o;
  };
  return { draw, has };
};

(globalThis as unknown as { MA_PROP: unknown }).MA_PROP = propRenderer();
