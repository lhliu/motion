// 擴充包（xpack）共用工具：補間、平面色塊繪圖、圖示、網站色調。必須自給自足（匯出 HTML 時 toString 內嵌）。
export const xkit = () => {
  type X = CanvasRenderingContext2D;
  type Pt = [number, number];
  const TAU = Math.PI * 2;
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
  const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
  const inout = (p: number) => { const q = clamp(p); return q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2; };
  const back = (p: number) => { const q = clamp(p) - 1; return 1 + 2.6 * q * q * q + 1.6 * q * q; };
  const bounce = (p: number) => { const x = clamp(p), n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x - 1.5 / d) ** 2 + 0.75; if (x < 2.5 / d) return n * (x - 2.25 / d) ** 2 + 0.9375; return n * (x - 2.625 / d) ** 2 + 0.984375; };
  const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
  const num = (v: unknown, d: number) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const rng = (seed: number) => { let a = (seed * 2654435761) >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let r = Math.imul(a ^ (a >>> 15), 1 | a); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
  const hex = (c: string) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(c).trim()); const n = m ? parseInt(m[1], 16) : 0x888888; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const shade = (c: string, k: number) => { const [r, g, b] = hex(c); const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)); return `rgb(${f(r)},${f(g)},${f(b)})`; };
  const alpha = (c: string, a: number) => { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; };
  const lum = (c: string) => { const [r, g, b] = hex(c); return 0.299 * r + 0.587 * g + 0.114 * b; };
  const INK = '#1d2433', WHITE = '#ffffff', CREAM = '#fff3e2';
  const PAL = { red: '#ff5a36', blue: '#2f6db5', yel: '#ffd23f', pink: '#f6a5c0', sky: '#5bc0eb', grn: '#3aa04a', brick: '#d64541', gold: '#f2b705', teal: '#2bb3a0', purple: '#7b5cd6', brown: '#a0673d', grey: '#c9d1d9' };
  const on = (c: string) => (lum(c) > 150 ? INK : WHITE);
  const rr = (x: X, X0: number, Y: number, w: number, h: number, r: number) => { x.beginPath(); x.roundRect(X0, Y, w, h, Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))); };
  const box = (x: X, X0: number, Y: number, w: number, h: number, r: number, c: string) => { if (w <= 0.5 || h <= 0.5) return; rr(x, X0, Y, w, h, r); x.fillStyle = c; x.fill(); };
  /** 硬邊厚度色塊（底下暗一階） */
  const slab = (x: X, X0: number, Y: number, w: number, h: number, r: number, c: string, d = 12) => { box(x, X0, Y + d, w, h, r, shade(c, -0.3)); box(x, X0, Y, w, h, r, c); };
  const poly = (x: X, pts: number[][], c: string) => { x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fillStyle = c; x.fill(); };
  const circle = (x: X, X0: number, Y: number, r: number, c: string) => { if (r <= 0) return; x.beginPath(); x.arc(X0, Y, r, 0, TAU); x.fillStyle = c; x.fill(); };
  const ring = (x: X, X0: number, Y: number, r: number, w: number, c: string, a0 = -Math.PI / 2, p = 1) => { if (r <= 0 || p <= 0) return; x.beginPath(); x.arc(X0, Y, r, a0, a0 + TAU * clamp(p)); x.lineWidth = w; x.strokeStyle = c; x.lineCap = 'butt'; x.stroke(); };
  const line = (x: X, a: number, b: number, c2: number, d: number, w: number, c: string, cap: CanvasLineCap = 'round') => { x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.lineWidth = w; x.strokeStyle = c; x.lineCap = cap; x.stroke(); };
  const star = (x: X, X0: number, Y: number, r: number, c: string, n = 4, k = 0.36) => { if (r <= 0) return; const p: number[][] = []; for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * TAU - Math.PI / 2, q = i % 2 ? r * k : r; p.push([X0 + Math.cos(a) * q, Y + Math.sin(a) * q]); } poly(x, p, c); };
  let F = '"Chiron Hei HK","Noto Sans TC","PingFang TC",sans-serif';
  const setFont = (f: string) => { if (f) F = f; };
  const font = (size: number, w = 900) => `${w} ${size}px ${F}`;
  const tw = (x: X, s: string, size: number, w = 900) => { x.font = font(size, w); return x.measureText(s).width; };
  /** 文字（太寬自動縮） */
  const T = (x: X, s: string, X0: number, Y: number, size: number, c: string, al: CanvasTextAlign = 'center', w = 900, maxW = 0) => { if (!s) return; let z = size; if (maxW > 0) { const m = tw(x, s, size, w); if (m > maxW) z = size * maxW / m; } x.font = font(z, w); x.fillStyle = c; x.textAlign = al; x.textBaseline = 'middle'; x.fillText(s, X0, Y); };
  const pop = (x: X, cx: number, cy: number, s: number, fn: () => void, sy = s) => { if (s <= 0.002 || sy <= 0.002) return; x.save(); x.translate(cx, cy); x.scale(s, sy); x.translate(-cx, -cy); fn(); x.restore(); };
  const rot = (x: X, cx: number, cy: number, a: number, fn: () => void) => { x.save(); x.translate(cx, cy); x.rotate(a); x.translate(-cx, -cy); fn(); x.restore(); };
  const fade = (x: X, a: number, fn: () => void) => { if (a <= 0.002) return; x.save(); x.globalAlpha *= clamp(a); fn(); x.restore(); };
  const clip = (x: X, path: () => void, fn: () => void) => { x.save(); x.beginPath(); path(); x.clip(); fn(); x.restore(); };
  /** 字串裡的數字依進度 count-up（保留小數與千分位） */
  const cnt = (s: string, p: number) => (p >= 1 ? s : s.replace(/\d[\d,]*(?:\.\d+)?/g, (m) => { const dec = (m.split('.')[1] || '').length, v = parseFloat(m.replace(/,/g, '')) * ease(p); return m.includes(',') ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec); }));
  const partial = (pts: Pt[], p: number) => { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); const len = cum[cum.length - 1], d = clamp(p) * len, out: Pt[] = [pts[0]]; for (let i = 1; i < pts.length; i++) { if (cum[i] <= d) { out.push(pts[i]); continue; } const k = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); if (k > 0) out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]); break; } return out; };
  const stroke = (x: X, pts: Pt[], w: number, c: string, dash: number[] = []) => { if (pts.length < 2) return; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.lineWidth = w; x.strokeStyle = c; x.lineCap = 'round'; x.lineJoin = 'round'; x.setLineDash(dash); x.stroke(); x.setLineDash([]); };
  /** 二次曲線取樣 */
  const curve = (a: Pt, b: Pt, c: Pt, n = 24): Pt[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]] as Pt; });
  const arrowHead = (x: X, X0: number, Y: number, ang: number, s: number, c: string) => poly(x, [[X0 + Math.cos(ang) * s, Y + Math.sin(ang) * s], [X0 + Math.cos(ang + 2.5) * s * 0.8, Y + Math.sin(ang + 2.5) * s * 0.8], [X0 + Math.cos(ang - 2.5) * s * 0.8, Y + Math.sin(ang - 2.5) * s * 0.8]], c);
  /** 沿路徑畫線並在尾端加箭頭 */
  const arrow = (x: X, pts: Pt[], p: number, w: number, c: string) => { const o = partial(pts, p); stroke(x, o, w, c); if (o.length >= 2 && p > 0.02) { const a = o[o.length - 1], b = o[o.length - 2]; arrowHead(x, a[0], a[1], Math.atan2(a[1] - b[1], a[0] - b[0]), w * 2.2, c); } };
  /** 放射短線（慶祝點綴） */
  const burst = (x: X, X0: number, Y: number, r: number, p: number, c: string, n = 8, w = 8) => { if (p <= 0 || p >= 1) return; for (let i = 0; i < n; i++) { const a = (i / n) * TAU + 0.3, r1 = r * (0.6 + 0.5 * ease(p)), r2 = r1 + r * 0.35 * (1 - p); line(x, X0 + Math.cos(a) * r1, Y + Math.sin(a) * r1, X0 + Math.cos(a) * r2, Y + Math.sin(a) * r2, w, c); } };
  // ── 圖示（平面色塊） ──
  const house = (x: X, X0: number, Y: number, s: number, wall = '#f3efe6', roof = '#d64541') => {
    x.fillStyle = shade(wall, -0.18); x.fillRect(X0 - s * 0.42, Y - s * 0.55, s * 0.84, s * 0.55);
    x.fillStyle = wall; x.fillRect(X0 - s * 0.42, Y - s * 0.55, s * 0.7, s * 0.55);
    poly(x, [[X0 - s * 0.56, Y - s * 0.5], [X0, Y - s], [X0 + s * 0.56, Y - s * 0.5]], roof);
    poly(x, [[X0 - s * 0.56, Y - s * 0.5], [X0, Y - s], [X0, Y - s * 0.86], [X0 - s * 0.4, Y - s * 0.5]], shade(roof, 0.2));
    x.fillStyle = shade(roof, -0.3); x.fillRect(X0 - s * 0.1, Y - s * 0.3, s * 0.2, s * 0.3);
    x.fillStyle = '#5bc0eb'; x.fillRect(X0 + s * 0.17, Y - s * 0.42, s * 0.16, s * 0.14); x.fillRect(X0 - s * 0.33, Y - s * 0.42, s * 0.16, s * 0.14);
  };
  const tower = (x: X, X0: number, Y: number, w: number, h: number, c: string, win = '#2a3240', lit = -1) => {
    if (h <= 2) return;
    x.fillStyle = shade(c, -0.25); x.fillRect(X0 + w, Y - h + w * 0.1, w * 0.16, Math.max(0, h - w * 0.1));
    x.fillStyle = c; x.fillRect(X0, Y - h, w, h);
    const n = Math.max(1, Math.floor((h - w * 0.2) / (w * 0.3)));
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { x.fillStyle = lit >= 0 && (i * 3 + k) % 4 === lit % 4 ? '#ffd23f' : win; x.fillRect(X0 + w * (0.12 + k * 0.29), Y - h + w * 0.16 + i * w * 0.3, w * 0.18, w * 0.15); }
  };
  const coin = (x: X, X0: number, Y: number, r: number, c = '#f2b705', mark = '$') => { circle(x, X0, Y + r * 0.16, r, shade(c, -0.32)); circle(x, X0, Y, r, c); circle(x, X0, Y, r * 0.72, shade(c, 0.22)); T(x, mark, X0, Y + r * 0.04, r, shade(c, -0.38)); };
  const pin = (x: X, X0: number, Y: number, s: number, c: string) => { circle(x, X0, Y - s, s * 0.6, c); poly(x, [[X0 - s * 0.52, Y - s * 0.7], [X0, Y], [X0 + s * 0.52, Y - s * 0.7]], c); circle(x, X0, Y - s, s * 0.25, WHITE); };
  const person = (x: X, X0: number, Y: number, s: number, body: string, skin = '#f2c9a0', hair = INK) => { box(x, X0 - s * 0.32, Y - s * 0.62, s * 0.64, s * 0.62, s * 0.26, body); circle(x, X0, Y - s * 0.86, s * 0.24, skin); x.beginPath(); x.arc(X0, Y - s * 0.9, s * 0.25, Math.PI, TAU); x.fillStyle = hair; x.fill(); };
  const check = (x: X, X0: number, Y: number, s: number, c = WHITE, p = 1) => stroke(x, partial([[X0 - s * 0.45, Y], [X0 - s * 0.12, Y + s * 0.32], [X0 + s * 0.5, Y - s * 0.38]], p), s * 0.2, c);
  const cross = (x: X, X0: number, Y: number, s: number, c = WHITE) => { line(x, X0 - s * 0.35, Y - s * 0.35, X0 + s * 0.35, Y + s * 0.35, s * 0.2, c); line(x, X0 + s * 0.35, Y - s * 0.35, X0 - s * 0.35, Y + s * 0.35, s * 0.2, c); };
  const key = (x: X, X0: number, Y: number, s: number, c: string) => { circle(x, X0 - s * 0.25, Y, s * 0.26, c); circle(x, X0 - s * 0.25, Y, s * 0.1, CREAM); x.fillStyle = c; x.fillRect(X0 - s * 0.05, Y - s * 0.06, s * 0.55, s * 0.12); x.fillRect(X0 + s * 0.32, Y, s * 0.08, s * 0.18); x.fillRect(X0 + s * 0.18, Y, s * 0.08, s * 0.13); };
  const train = (x: X, X0: number, Y: number, s: number, c: string) => { box(x, X0 - s, Y - s * 0.45, s * 2, s * 0.9, s * 0.25, c); for (let i = 0; i < 3; i++) box(x, X0 - s * 0.8 + i * s * 0.56, Y - s * 0.3, s * 0.42, s * 0.32, 6, '#cfe3ee'); x.fillStyle = '#ffd23f'; x.fillRect(X0 - s, Y + s * 0.14, s * 2, s * 0.08); circle(x, X0 - s * 0.55, Y + s * 0.5, s * 0.14, INK); circle(x, X0 + s * 0.55, Y + s * 0.5, s * 0.14, INK); };
  const car = (x: X, X0: number, Y: number, s: number, c: string) => { box(x, X0 - s, Y - s * 0.5, s * 2, s * 0.5, s * 0.18, c); poly(x, [[X0 - s * 0.55, Y - s * 0.5], [X0 - s * 0.3, Y - s * 0.85], [X0 + s * 0.4, Y - s * 0.85], [X0 + s * 0.65, Y - s * 0.5]], shade(c, -0.15)); box(x, X0 - s * 0.25, Y - s * 0.78, s * 0.3, s * 0.24, 4, '#cfe3ee'); box(x, X0 + s * 0.12, Y - s * 0.78, s * 0.3, s * 0.24, 4, '#cfe3ee'); circle(x, X0 - s * 0.55, Y, s * 0.2, INK); circle(x, X0 + s * 0.55, Y, s * 0.2, INK); circle(x, X0 - s * 0.55, Y, s * 0.08, '#c9d1d9'); circle(x, X0 + s * 0.55, Y, s * 0.08, '#c9d1d9'); };
  const tree = (x: X, X0: number, Y: number, s: number, c = '#3aa04a') => { x.fillStyle = '#a0673d'; x.fillRect(X0 - s * 0.06, Y - s * 0.4, s * 0.12, s * 0.4); circle(x, X0, Y - s * 0.62, s * 0.34, c); circle(x, X0 - s * 0.12, Y - s * 0.7, s * 0.16, shade(c, 0.2)); };
  const cloud = (x: X, X0: number, Y: number, s: number, c = WHITE) => { circle(x, X0 - s * 0.35, Y, s * 0.28, c); circle(x, X0, Y - s * 0.15, s * 0.38, c); circle(x, X0 + s * 0.38, Y, s * 0.26, c); box(x, X0 - s * 0.63, Y - s * 0.02, s * 1.26, s * 0.28, s * 0.14, c); };
  const heart = (x: X, X0: number, Y: number, s: number, c: string) => { x.beginPath(); x.moveTo(X0, Y + s * 0.4); x.bezierCurveTo(X0 - s * 0.9, Y - s * 0.2, X0 - s * 0.4, Y - s * 0.8, X0, Y - s * 0.3); x.bezierCurveTo(X0 + s * 0.4, Y - s * 0.8, X0 + s * 0.9, Y - s * 0.2, X0, Y + s * 0.4); x.fillStyle = c; x.fill(); };
  const phone = (x: X, X0: number, Y: number, w: number, h: number, c = INK, scr = '#f3efe6') => { box(x, X0 - w / 2, Y - h / 2, w, h, w * 0.14, c); box(x, X0 - w / 2 + w * 0.06, Y - h / 2 + w * 0.12, w * 0.88, h - w * 0.24, w * 0.08, scr); };
  /** 膠囊標籤：回傳寬度 */
  const pill = (x: X, s: string, X0: number, Y: number, size: number, bg: string, fg: string, al: 'left' | 'center' | 'right' = 'center', w = 900) => { const m = tw(x, s, size, w), pw = m + size * 1.1, ph = size * 1.6; const L = al === 'left' ? X0 : al === 'right' ? X0 - pw : X0 - pw / 2; box(x, L, Y - ph / 2, pw, ph, ph / 2, bg); T(x, s, L + pw / 2, Y + size * 0.04, size, fg, 'center', w); return pw; };
  /** 右下角「示意」小字 */
  const demo = (x: X, W: number, H: number, c = 'rgba(255,255,255,.55)', s = '數字為示意') => T(x, s, W - 40, H - 40, 26, c, 'right', 700);
  // ── 網站色調（同圖表引擎：讀 CSS 變數） ──
  /** 平塗示意街區地圖：街廓色塊、主要道路、河流與公園（seed 決定配置） */
  const mapBase = (x: X, X0: number, Y0: number, w: number, h: number, seed = 1, dark = false) => {
    const r = rng(seed), g = 150; x.save(); x.beginPath(); x.rect(X0, Y0, w, h); x.clip(); box(x, X0, Y0, w, h, 0, dark ? '#1f2530' : '#eee7da');
    for (let i = 0; i * g < w + g; i++) for (let k = 0; k * g < h + g; k++) { const v = r(); box(x, X0 + i * g + 14, Y0 + k * g + 14, g - 28, g - 28, 12, dark ? (v < 0.15 ? '#24402e' : '#2a3140') : (v < 0.15 ? '#c9e4b8' : v < 0.5 ? '#f7f2e8' : '#e3dccd')); }
    x.strokeStyle = dark ? '#33506b' : '#9fd3f0'; x.lineWidth = 46; x.lineCap = 'round'; x.beginPath(); x.moveTo(X0 - 40, Y0 + h * 0.82); x.bezierCurveTo(X0 + w * 0.3, Y0 + h * 0.7, X0 + w * 0.6, Y0 + h * 0.98, X0 + w + 40, Y0 + h * 0.86); x.stroke();
    x.fillStyle = dark ? '#3a4458' : '#ffd23f'; x.fillRect(X0, Y0 + g * 2 - 10, w, 20); x.fillRect(X0 + g * 3 - 10, Y0, 20, h);
    x.restore();
  };
  const site = (cv: unknown) => {
    const d = { fg: '#f4f1ea', bg: '#16181d', ac: '#ff6b35', ac2: '#ffd23f', font: '"MA Num","Chiron Hei HK","Noto Sans TC","PingFang TC",sans-serif' };
    try {
      const c = cv as HTMLCanvasElement;
      if (!c || !('ownerDocument' in c) || typeof getComputedStyle !== 'function') return d;
      const cs = getComputedStyle(c), v = (k: string) => cs.getPropertyValue(k).trim();
      const hx = (s: string, f: string) => (/^#[0-9a-f]{6}$/i.test(s) ? s : f);
      return { fg: hx(v('--fg'), d.fg), bg: hx(v('--bg'), d.bg), ac: hx(v('--ac'), d.ac), ac2: hx(v('--ac2'), d.ac2), font: v('--sans') || d.font };
    } catch { return d; }
  };
  return { TAU, clamp, lerp, ease, inout, back, bounce, seg, num, rng, shade, alpha, lum, on, INK, WHITE, CREAM, PAL, rr, box, slab, poly, circle, ring, line, star, setFont, font, tw, T, pop, rot, fade, clip, cnt, partial, stroke, curve, arrowHead, arrow, burst, house, tower, coin, pin, person, check, cross, key, train, car, tree, cloud, heart, phone, site, pill, demo, mapBase };
};
export type XK = ReturnType<typeof xkit>;
/** 每一招拿到的繪製環境：設計單位（短邊＝1080），W/H 為畫面寬高 */
export type XC = {
  t: number; W: number; H: number; land: boolean; loop: number;
  fg: string; bg: string; ac: string; ac2: string;
  /** 可編輯文字：第 i 個項目（逗號分隔），空白用預設 */
  s: (i: number, d: string) => string;
  /** 可編輯數字：第 i 個 */
  v: (i: number, d: string) => string;
  title: (d: string) => string;
  sub: (d: string) => string;
  /** 把 w×h 的設計框置中縮放進畫面（留邊 m）；回傳後 fn 內用設計框座標 */
  fit: (w: number, h: number, fn: () => void, m?: number) => void;
};
export type XFx = { bg?: string; d: (x: CanvasRenderingContext2D, c: XC) => void };
