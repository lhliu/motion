// 第 1 包：轉場擴充（12）。A 段（主色）→ B 段（深色章節），轉場在 0.8–2.2 秒之間。
import type { XC, XFx, XK } from './kit';

export const xp01 = (K: XK) => {
  const { clamp, ease, inout, back, seg, rng, shade, box, poly, circle, T, pop, clip, house, INK, WHITE, TAU, lerp, line, stroke, partial, pin } = K;
  type X = CanvasRenderingContext2D;
  const A0 = 0.8, A1 = 2.2;
  const P = (c: XC) => seg(c.t, A0, A1);
  /** A 段：主色底、大字＋小房子 */
  const sceneA = (x: X, c: XC) => {
    x.fillStyle = c.ac; x.fillRect(0, 0, c.W, c.H);
    const cx = c.W / 2, cy = c.H / 2;
    x.fillStyle = shade(c.ac, -0.12);
    for (let i = -4; i < 14; i++) poly(x, [[i * 220, c.H], [i * 220 + 110, c.H], [i * 220 + 110 + c.H * 0.4, 0], [i * 220 + c.H * 0.4, 0]], shade(c.ac, -0.08));
    house(x, cx, cy - 70, 150, WHITE, INK);
    T(x, c.s(0, '上一段'), cx, cy + 40, 120, WHITE, 'center', 900, c.W * 0.86);
    T(x, c.s(3, '信義區兩房實價'), cx, cy + 140, 44, alphaW(0.85), 'center', 700, c.W * 0.8);
  };
  const alphaW = (a: number) => `rgba(255,255,255,${a})`;
  /** B 段：深色底章節卡，字往上浮 */
  const sceneB = (x: X, c: XC, k = 1) => {
    x.fillStyle = INK; x.fillRect(0, 0, c.W, c.H);
    const cx = c.W / 2, cy = c.H / 2, e = ease(k);
    box(x, cx - 70, cy - 150 + (1 - e) * 30, 140, 16, 8, c.ac2);
    T(x, c.s(1, '第二章'), cx, cy - 40 + (1 - e) * 40, 130, WHITE, 'center', 900, c.W * 0.86);
    T(x, c.s(2, '看屋重點整理'), cx, cy + 80 + (1 - e) * 50, 50, c.ac2, 'center', 700, c.W * 0.8);
  };
  const bIn = (c: XC) => seg(c.t, A1 - 0.3, A1 + 0.6);
  const full = (c: XC) => (fn: () => void) => fn();
  void full;
  const R: Record<string, XFx> = {
    'tr-diag': { bg: 'none', d: (x, c) => {
      const p = P(c), cols = [c.ac2, WHITE, '#2f6db5', INK];
      if (p < 0.5) sceneA(x, c); else sceneB(x, c, bIn(c));
      const L = c.W + c.H;
      cols.forEach((col, i) => {
        const q = inout(clamp(p * 1.5 - i * 0.12)), q2 = inout(clamp(p * 1.5 - 0.55 - i * 0.08));
        const a = -L * 0.6 + q * L * 1.6, b = -L * 0.6 + q2 * L * 1.6;
        if (q <= 0 || q2 >= 1) return;
        poly(x, [[Math.max(b, -L) - c.H, c.H], [a - c.H, c.H], [a, 0], [Math.max(b, -L), 0]], col);
      });
    } },
    'tr-circle': { bg: 'none', d: (x, c) => {
      const p = P(c), cx = c.W * 0.5, cy = c.H * 0.5, R0 = Math.hypot(c.W, c.H) * 0.55;
      sceneA(x, c);
      const cols = [c.ac2, WHITE, '#5bc0eb'];
      cols.forEach((col, i) => circle(x, cx, cy, R0 * inout(clamp(p * 1.4 - i * 0.14)), col));
      const rb = R0 * inout(clamp(p * 1.4 - 0.42));
      if (rb > 0) clip(x, () => x.arc(cx, cy, rb, 0, TAU), () => sceneB(x, c, bIn(c)));
    } },
    'tr-blinds': { bg: 'none', d: (x, c) => {
      const p = P(c), n = 9, h = c.H / n;
      if (p < 0.5) sceneA(x, c); else sceneB(x, c, bIn(c));
      for (let i = 0; i < n; i++) {
        const q = p < 0.5 ? ease(clamp(p * 3.2 - i * 0.06)) : 1 - ease(clamp((p - 0.5) * 3.2 - i * 0.06));
        if (q <= 0) continue;
        const y = i * h + h / 2, hh = h * q;
        x.fillStyle = i % 2 ? c.ac2 : shade(c.ac2, -0.12); x.fillRect(0, y - hh / 2, c.W, hh);
        x.fillStyle = shade(c.ac2, -0.3); x.fillRect(0, y + hh / 2 - 6, c.W, 6 * q);
      }
    } },
    'tr-slide': { bg: 'none', d: (x, c) => {
      const p = P(c), close = inout(clamp(p * 2)), open = inout(clamp(p * 2 - 1.1));
      if (p < 0.5) sceneA(x, c); else sceneB(x, c, bIn(c));
      const w = c.W / 2, off = (1 - close) * w + open * w * 1.05;
      [-1, 1].forEach((sd) => {
        const X0 = sd < 0 ? -off : w + off;
        x.fillStyle = '#c98d55'; x.fillRect(X0, 0, w, c.H);
        x.fillStyle = shade('#c98d55', -0.25); for (let k = 1; k < 4; k++) x.fillRect(X0 + (w / 4) * k - 4, 0, 8, c.H);
        for (let r = 0; r < 6; r++) x.fillRect(X0, (c.H / 6) * r - 4, w, 8);
        x.fillStyle = '#fff6e6'; for (let k = 0; k < 4; k++) for (let r = 0; r < 6; r++) x.fillRect(X0 + (w / 4) * k + 10, (c.H / 6) * r + 10, w / 4 - 20, c.H / 6 - 20);
        box(x, sd < 0 ? X0 + w - 40 : X0 + 16, c.H / 2 - 50, 24, 100, 12, INK);
      });
    } },
    'tr-shutter': { bg: 'none', d: (x, c) => {
      const p = P(c), down = inout(clamp(p * 2.1)), up = inout(clamp(p * 2.1 - 1.15));
      const bottom = c.H * (down - up), sh = 46;
      if (p < 0.5) sceneA(x, c); else sceneB(x, c, bIn(c));
      if (bottom <= 0) return;
      x.fillStyle = '#9aa4ae'; x.fillRect(0, 0, c.W, bottom);
      for (let y = bottom - sh; y > -sh; y -= sh) { x.fillStyle = '#b7c0c8'; x.fillRect(0, y + 4, c.W, sh - 14); x.fillStyle = '#7c8792'; x.fillRect(0, y + sh - 10, c.W, 6); }
      x.fillStyle = '#5d6772'; x.fillRect(0, bottom - 22, c.W, 22);
      box(x, c.W / 2 - 60, bottom - 18, 120, 12, 6, '#ffd23f');
      x.fillStyle = INK; x.fillRect(0, 0, c.W, 36);
    } },
    'tr-ink': { bg: 'none', d: (x, c) => {
      const p = P(c);
      sceneA(x, c);
      const r = rng(7), blobs = Array.from({ length: 6 }, () => [r() * c.W, r() * c.H, 0.15 + r() * 0.3, r() * 10]);
      const blob = (bx: number, by: number, R0: number, ph: number) => { x.beginPath(); for (let i = 0; i <= 40; i++) { const a = (i / 40) * TAU, rr = R0 * (1 + 0.16 * Math.sin(a * 5 + ph) + 0.08 * Math.sin(a * 9 + ph * 2)); const px = bx + Math.cos(a) * rr, py = by + Math.sin(a) * rr; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.closePath(); };
      const D = Math.hypot(c.W, c.H);
      blobs.forEach(([bx, by, d, ph]) => { const q = ease(clamp((p - d) * 1.1)); if (q > 0) { blob(bx, by, D * 0.75 * q, ph); x.fillStyle = INK; x.fill(); } });
      blobs.forEach(([bx, by, d, ph]) => { const q = ease(clamp((p - d) * 1.1 - 0.2)); if (q > 0) clip(x, () => blob(bx, by, D * 0.72 * q, ph + 1), () => sceneB(x, c, bIn(c))); });
      // 濺點
      const r2 = rng(3); for (let i = 0; i < 14; i++) { const q = ease(clamp((p - 0.1) * 3 - r2())); circle(x, r2() * c.W, r2() * c.H, 22 * q * (p < 0.7 ? 1 : 0), INK); }
    } },
    'tr-mapzoom': { bg: 'none', d: (x, c) => {
      const p = P(c);
      const z = p < 0.5 ? 1 / lerp(1, 0.18, inout(p * 2)) : lerp(0.18, 1, inout(p * 2 - 1));
      const camX = lerp(0.35, 0.65, inout(p)), cx = c.W / 2, cy = c.H / 2;
      const m = () => {
        x.fillStyle = '#efe6d8'; x.fillRect(-c.W * 3, -c.H * 3, c.W * 7, c.H * 7);
        x.fillStyle = '#bfe3f7'; poly(x, [[-c.W * 3, c.H * 0.85], [c.W * 4, c.H * 0.55], [c.W * 4, c.H * 0.75], [-c.W * 3, c.H * 1.05]], '#9fd3ef');
        for (let i = -12; i < 20; i++) { x.fillStyle = i % 4 ? '#ffffff' : '#ffd23f'; x.fillRect(i * 160, -c.H * 3, i % 4 ? 22 : 30, c.H * 7); x.fillRect(-c.W * 3, i * 160, c.W * 7, i % 4 ? 22 : 30); }
        const bc = ['#cfe7c4', '#f6d7b0', '#e3dccf', '#d8e4f0']; for (let i = -12; i < 20; i++) for (let k = -12; k < 20; k++) box(x, i * 160 + 30, k * 160 + 30, 116, 116, 10, bc[((i * 7 + k * 3) % 4 + 4) % 4]);
      };
      if (p < 0.5) {
        const s = lerp(1, 0.18, inout(p * 2));
        x.save(); x.translate(c.W * 0.35, c.H * 0.5); x.scale(s, s); x.translate(-c.W * 0.35, -c.H * 0.5);
        m();
        x.restore();
        const s2 = s; const w = c.W * s2, h = c.H * s2;
        x.save(); x.translate(c.W * 0.35 - w * 0.35, c.H * 0.5 - h * 0.5); x.scale(s2, s2); clip(x, () => x.rect(0, 0, c.W, c.H), () => sceneA(x, c)); x.restore();
        pin(x, c.W * 0.35, c.H * 0.5 - h * 0.5, 40 * (1 - s) + 10, c.ac);
      } else {
        const s = lerp(0.18, 1, inout(p * 2 - 1));
        x.save(); x.translate(c.W * 0.65, c.H * 0.5); x.scale(s, s); x.translate(-c.W * 0.65, -c.H * 0.5);
        m(); x.restore();
        const w = c.W * s, h = c.H * s;
        x.save(); x.translate(c.W * 0.65 - w * 0.65, c.H * 0.5 - h * 0.5); x.scale(s, s); clip(x, () => x.rect(0, 0, c.W, c.H), () => sceneB(x, c, bIn(c))); x.restore();
        if (s < 0.95) pin(x, c.W * 0.65, c.H * 0.5 - h * 0.5, 40 * (1 - s) + 10, c.ac2);
      }
      void z; void camX; void cx; void cy;
    } },
    'tr-housemask': { bg: 'none', d: (x, c) => {
      const p = P(c), s = Math.pow(inout(p), 2.2) * Math.hypot(c.W, c.H) * 2.4, cx = c.W / 2, cy = c.H / 2;
      sceneA(x, c);
      const shape = (k: number) => { x.moveTo(cx - k * 0.5, cy + k * 0.42); x.lineTo(cx - k * 0.5, cy - k * 0.08); x.lineTo(cx, cy - k * 0.5); x.lineTo(cx + k * 0.5, cy - k * 0.08); x.lineTo(cx + k * 0.5, cy + k * 0.42); x.closePath(); };
      const s0 = back(seg(c.t, A0 - 0.3, A0 + 0.2)) * 160;
      if (s < 160) { x.beginPath(); shape(Math.max(s, s0) + 26); x.fillStyle = c.ac2; x.fill(); }
      const k = Math.max(s, s0 * (1 - seg(c.t, A0 + 0.2, A0 + 0.3)));
      x.beginPath(); shape(k + 26); x.fillStyle = c.ac2; x.fill();
      clip(x, () => shape(k), () => sceneB(x, c, bIn(c)));
    } },
    'tr-pixel': { bg: 'none', d: (x, c) => {
      const p = P(c), n = 12, sz = Math.max(c.W, c.H) / n, r = rng(11);
      sceneA(x, c);
      const cells: number[][] = [];
      for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) cells.push([i, k, r()]);
      x.save(); x.beginPath();
      cells.forEach(([i, k, d]) => { const q = ease(clamp((p - d * 0.7) * 4)); if (q > 0) { const ww = sz * q; x.rect(i * sz + (sz - ww) / 2, k * sz + (sz - ww) / 2, ww + 1, ww + 1); } });
      x.clip(); sceneB(x, c, bIn(c)); x.restore();
      cells.forEach(([i, k, d]) => { const q = clamp((p - d * 0.7) * 4); if (q > 0 && q < 1) box(x, i * sz + sz * 0.15, k * sz + sz * 0.15, sz * 0.7, sz * 0.7, 6, d > 0.5 ? c.ac2 : WHITE); });
    } },
    'tr-curl': { bg: 'none', d: (x, c) => {
      const p = inout(P(c)), L = (c.W + c.H) * 1.05 * p;
      sceneB(x, c, bIn(c));
      if (L >= c.W + c.H) return;
      // 摺線：從右下往左上，A 剩下的部分＋翻起來的背面
      const fold = (k: number) => [[c.W - k, c.H], [c.W, c.H - k]];
      const [a, b] = fold(L);
      clip(x, () => { x.moveTo(0, 0); x.lineTo(c.W, 0); x.lineTo(b[0], b[1] < 0 ? 0 : b[1]); if (b[1] < 0) { x.lineTo(c.W, 0); } x.lineTo(a[0], a[1]); x.lineTo(0, c.H); x.closePath(); }, () => sceneA(x, c));
      // 背面（反射三角形）
      poly(x, [[a[0], a[1]], [b[0], b[1]], [c.W - L, c.H - L]], '#f3efe6');
      poly(x, [[a[0], a[1]], [b[0], b[1]], [lerp(a[0], c.W - L, 0.18), lerp(a[1], c.H - L, 0.18)]], shade('#f3efe6', -0.12));
    } },
    'tr-beat': { bg: 'none', d: (x, c) => {
      const t = c.t, beats = [0.8, 1.3, 1.8];
      let z = 1, flash = 0;
      beats.forEach((b, i) => { const q = t - b; if (q >= 0 && q < 0.5) { z = Math.max(z, 1 + (0.12 + i * 0.06) * (1 - ease(q / 0.5))); if (q < 0.08) flash = 1 - q / 0.08; } });
      const afterB = t >= 2.2;
      const zz = afterB ? 1 + 0.25 * (1 - ease(seg(t, 2.2, 2.8))) : z;
      pop(x, c.W / 2, c.H / 2, zz, () => (afterB ? sceneB(x, c, bIn(c)) : sceneA(x, c)));
      if (!afterB) beats.forEach((b, i) => { const q = seg(t, b, b + 0.4); if (q > 0 && q < 1) { x.save(); x.globalAlpha = 1 - q; x.lineWidth = 18; x.strokeStyle = i % 2 ? c.ac2 : WHITE; x.strokeRect(-q * 60, -q * 60, c.W + q * 120, c.H + q * 120); x.restore(); } });
      if (flash > 0) { x.fillStyle = `rgba(255,255,255,${flash * 0.85})`; x.fillRect(0, 0, c.W, c.H); }
      const f2 = 1 - seg(t, 2.2, 2.32); if (t >= 2.2 && f2 > 0) { x.fillStyle = `rgba(255,255,255,${f2})`; x.fillRect(0, 0, c.W, c.H); }
    } },
    'tr-tape': { bg: 'none', d: (x, c) => {
      const t = c.t, stick = back(seg(t, 0.5, 0.9)), rip = inout(seg(t, 1.1, 2.0));
      const ang = -0.22, cx = c.W / 2, cy = c.H / 2, L = Math.hypot(c.W, c.H) * 1.2, th = 150;
      sceneB(x, c, bIn(c));
      // A 被膠帶往右上扯走：鋸齒撕邊
      const dx = rip * c.W * 1.4, dy = -rip * c.H * 0.6;
      if (rip < 1) {
        x.save(); x.translate(dx, dy); x.rotate(rip * 0.15);
        clip(x, () => { const r = rng(5); x.moveTo(-c.W, -c.H); x.lineTo(c.W * 2, -c.H); x.lineTo(c.W * 2, c.H * 2); for (let i = 0; i <= 30; i++) { const yy = c.H * 2 - (i / 30) * c.H * 3; x.lineTo(rip > 0 ? (r() - 0.5) * 50 : -c.W, yy); } x.closePath(); }, () => sceneA(x, c));
        x.restore();
      }
      // 膠帶
      const tx = cx + dx, ty = cy + dy;
      if (stick > 0) rotTape(x, tx, ty, ang + rip * 0.15, L * clamp(stick), th);
      void partial; void stroke; void line;
    } },
  };
  const rotTape = (x: X, X0: number, Y: number, a: number, w: number, h: number) => {
    x.save(); x.translate(X0, Y); x.rotate(a);
    x.fillStyle = 'rgba(255,210,63,.92)'; x.beginPath(); x.moveTo(-w / 2, -h / 2);
    for (let i = 0; i <= 20; i++) x.lineTo(-w / 2 + (i / 20) * w, -h / 2 + (i % 2 ? 6 : 0));
    x.lineTo(w / 2, h / 2); for (let i = 20; i >= 0; i--) x.lineTo(-w / 2 + (i / 20) * w, h / 2 - (i % 2 ? 6 : 0)); x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(-w / 2, -h / 2 + 18, w, 14);
    T(x, 'SALE  ·  實價揭曉  ·  SALE  ·  實價揭曉', 0, 4, 54, INK, 'center', 900);
    x.restore();
  };
  return R;
};
