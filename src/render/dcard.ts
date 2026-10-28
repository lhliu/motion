// 圖解字卡（圖表 → 圖解字卡；繪製仍走物件引擎，id 維持 obj-dcard-*）：14 種資訊圖卡，播一次建構動畫後輕微待機。
// 風格同 prop.ts：硬邊平塗、shade 亮暗一階做厚度、白色半透明硬邊高光，無漸層／模糊／黑描邊。
// 設計座標：直式 1080×1920；橫式時標題放左欄、圖解等比縮放放右欄，不裁切。
// dcardRenderer 內部必須自給自足，匯出 HTML 時以 toString() 內嵌（見 obj.ts 的 OBJ_GLOBALS）。

export const dcardRenderer = () => {
  type X = CanvasRenderingContext2D;
  type Pt = [number, number];
  const TAU = Math.PI * 2;
  const F = '"Noto Sans TC","Noto Sans CJK TC",system-ui,sans-serif';
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
  const inout = (p: number) => { const q = clamp(p); return q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2; };
  const back = (p: number) => { const q = clamp(p) - 1; return 1 + 2.6 * q * q * q + 1.6 * q * q; };
  const bounce = (p: number) => {
    const x = clamp(p), n = 7.5625, d = 2.75;
    if (x < 1 / d) return n * x * x;
    if (x < 2 / d) return n * (x - 1.5 / d) ** 2 + 0.75;
    if (x < 2.5 / d) return n * (x - 2.25 / d) ** 2 + 0.9375;
    return n * (x - 2.625 / d) ** 2 + 0.984375;
  };
  const seg = (t: number, a: number, d: number) => clamp((t - a) / d);
  const num = (v: unknown, d: number) => (v !== '' && v !== null && Number.isFinite(Number(v)) ? Number(v) : d);
  const hex = (c: string) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(c).trim()); const n = m ? parseInt(m[1], 16) : 0x888888; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const shade = (c: string, k: number) => { if (c.startsWith('rgb')) return c; const [r, g, b] = hex(c); const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)); return `rgb(${f(r)},${f(g)},${f(b)})`; };
  const alpha = (c: string, a: number) => { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; };
  const lum = (c: string) => { const [r, g, b] = hex(c); return r * 0.299 + g * 0.587 + b * 0.114; };
  const rr = (x: X, X0: number, Y: number, w: number, h: number, r: number) => { x.beginPath(); x.roundRect(X0, Y, w, h, Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))); };
  const fillRR = (x: X, X0: number, Y: number, w: number, h: number, r: number, c: string) => { if (w <= 0 || h <= 0) return; rr(x, X0, Y, w, h, r); x.fillStyle = c; x.fill(); };
  const poly = (x: X, pts: number[][], c: string) => { x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fillStyle = c; x.fill(); };
  const circle = (x: X, X0: number, Y: number, r: number, c: string) => { if (r <= 0) return; x.beginPath(); x.arc(X0, Y, r, 0, TAU); x.fillStyle = c; x.fill(); };
  const line = (x: X, a: number, b: number, c2: number, d: number, w: number, c: string) => { x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.lineWidth = w; x.strokeStyle = c; x.lineCap = 'round'; x.stroke(); };
  const star = (x: X, X0: number, Y: number, r: number, c: string, n = 4) => { if (r <= 0) return; const p: number[][] = []; for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * TAU - Math.PI / 2, q = i % 2 ? r * 0.36 : r; p.push([X0 + Math.cos(a) * q, Y + Math.sin(a) * q]); } poly(x, p, c); };
  const T = (x: X, s: string, X0: number, Y: number, size: number, c: string, al: CanvasTextAlign = 'center', w = 900) => { x.font = `${w} ${size}px ${F}`; x.fillStyle = c; x.textAlign = al; x.textBaseline = 'middle'; x.fillText(s, X0, Y); };
  const tw = (x: X, s: string, size: number, w = 900) => { x.font = `${w} ${size}px ${F}`; return x.measureText(s).width; };
  /** 文字太寬時縮小字級 */
  const TF = (x: X, s: string, X0: number, Y: number, size: number, c: string, maxW: number, al: CanvasTextAlign = 'center', w = 900) => { const m = tw(x, s, size, w); T(x, s, X0, Y, m > maxW ? size * maxW / m : size, c, al, w); };
  /** 以 (cx,cy) 為中心縮放後畫 */
  const pop = (x: X, cx: number, cy: number, s: number, fn: () => void, sy = s) => { if (s <= 0.002 || sy <= 0.002) return; x.save(); x.translate(cx, cy); x.scale(s, sy); x.translate(-cx, -cy); fn(); x.restore(); };
  const fade = (x: X, a: number, fn: () => void) => { if (a <= 0.002) return; x.save(); x.globalAlpha *= clamp(a); fn(); x.restore(); };
  /** 字串裡的數字依進度 count-up，保留小數位與千分位 */
  const cnt = (s: string, p: number) => (p >= 1 ? s : s.replace(/\d[\d,]*(?:\.\d+)?/g, (m) => {
    const dec = (m.split('.')[1] || '').length, v = parseFloat(m.replace(/,/g, '')) * ease(p);
    return m.includes(',') ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec);
  }));
  const partial = (pts: Pt[], p: number): { out: Pt[]; len: number; cum: number[] } => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const len = cum[cum.length - 1], d = clamp(p) * len, out: Pt[] = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (cum[i] <= d) { out.push(pts[i]); continue; }
      const k = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
      if (k > 0) out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]);
      break;
    }
    return { out, len, cum };
  };
  const strokePts = (x: X, pts: Pt[], w: number, c: string, cap: CanvasLineCap = 'round') => { if (pts.length < 2) return; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.lineWidth = w; x.strokeStyle = c; x.lineCap = cap; x.lineJoin = 'round'; x.stroke(); };

  // 調色盤：每次 draw 依風格設定
  const INK = '#1d2433', WHITE = '#ffffff', CREAM = '#f3efe6';
  let RED = '#ff5a36', BLUE = '#2f6db5', YEL = '#ffd23f', PINK = '#f6a5c0', SKY = '#5bc0eb', GRN = '#3aa04a', BRICK = '#d64541', GOLD = '#f2b705', BAND = '#ffd23f';
  let BG = '#f3efe6', TB = INK, TS = '#3d4a5c', SURF = '#2b3a55', DARK = false;
  const on = (c: string) => (lum(c) > 150 ? INK : WHITE);
  const STYLES: Record<string, { bg: string; acc: string[]; band: string }> = {
    navy: { bg: '#1d2433', acc: ['#ff5a36', '#4f8fe0', '#ffd23f', '#f6a5c0', '#5bc0eb', '#3aa04a', '#d64541', '#f2b705'], band: '#ffd23f' },
    sky: { bg: '#bfe3f7', acc: ['#ff6b4a', '#1f6f9f', '#ffd23f', '#7fd1ae', '#2bb3c0', '#2f9e6f', '#e05a4f', '#f2b705'], band: '#ffd23f' },
    hongbao: { bg: '#c93a37', acc: ['#ffd23f', '#7a1f1f', '#fff3e2', '#f6a5c0', '#ffb36b', '#2f8f5b', '#8c1c1c', '#f2b705'], band: '#ffd23f' },
  };
  const CLASSIC = ['#ff5a36', '#2f6db5', '#ffd23f', '#f6a5c0', '#5bc0eb', '#3aa04a', '#d64541', '#f2b705'];

  // ── 小道具 ──
  const block = (x: X, X0: number, Y: number, w: number, h: number, r: number, c: string, d = 14) => { if (w <= 1) return; fillRR(x, X0, Y + d, w, h, r, shade(c, -0.28)); fillRR(x, X0, Y, w, h, r, c); x.fillStyle = 'rgba(255,255,255,.35)'; rr(x, X0 + r * 0.6, Y + 10, Math.min(w * 0.35, 120), 10, 5); x.fill(); };
  const house = (x: X, X0: number, Y: number, s: number, wall = CREAM, roof = BRICK) => {
    x.fillStyle = shade(wall, -0.2); x.fillRect(X0 - s * 0.42, Y - s * 0.55, s * 0.84, s * 0.61);
    x.fillStyle = wall; x.fillRect(X0 - s * 0.42, Y - s * 0.55, s * 0.84, s * 0.55);
    poly(x, [[X0 - s * 0.56, Y - s * 0.5], [X0, Y - s], [X0 + s * 0.56, Y - s * 0.5]], roof);
    poly(x, [[X0 - s * 0.56, Y - s * 0.5], [X0, Y - s], [X0, Y - s * 0.88], [X0 - s * 0.42, Y - s * 0.5]], shade(roof, 0.18));
    x.fillStyle = shade(roof, -0.25); x.fillRect(X0 - s * 0.1, Y - s * 0.3, s * 0.2, s * 0.3);
    x.fillStyle = '#5bc0eb'; x.fillRect(X0 + s * 0.17, Y - s * 0.4, s * 0.16, s * 0.14); x.fillRect(X0 - s * 0.33, Y - s * 0.4, s * 0.16, s * 0.14);
    x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(X0 + s * 0.19, Y - s * 0.38, s * 0.04, s * 0.1);
  };
  const tower = (x: X, X0: number, Y: number, w: number, h: number, c: string, win = '#2a3240') => {
    if (h <= 2) return;
    x.fillStyle = shade(c, -0.25); x.fillRect(X0 + w, Y - h + Math.min(h, w * 0.12), w * 0.18, Math.max(0, h - w * 0.12));
    x.fillStyle = c; x.fillRect(X0, Y - h, w, h);
    x.fillStyle = win; const n = Math.max(2, Math.floor(h / (w * 0.32)));
    for (let i = 0; i < n - 1; i++) for (let k = 0; k < 3; k++) x.fillRect(X0 + w * (0.12 + k * 0.29), Y - h + w * 0.18 + i * (h - w * 0.2) / n, w * 0.18, w * 0.16);
  };
  const coin = (x: X, X0: number, Y: number, r: number, c = GOLD) => { circle(x, X0, Y + r * 0.18, r, shade(c, -0.3)); circle(x, X0, Y, r, c); circle(x, X0, Y, r * 0.72, shade(c, 0.22)); T(x, '$', X0, Y + r * 0.04, r, shade(c, -0.35)); x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(X0 - r * 0.4, Y - r * 0.42, r * 0.16, r * 0.08, -0.7, 0, TAU); x.fill(); };
  const coinStack = (x: X, X0: number, Y: number, r: number, n: number, c = GOLD) => { if (n < 1) return; for (let i = 0; i < n; i++) { const y = Y - i * r * 0.32; x.fillStyle = shade(c, -0.3); x.beginPath(); x.ellipse(X0, y + r * 0.14, r, r * 0.38, 0, 0, TAU); x.fill(); x.fillStyle = i % 2 ? c : shade(c, 0.12); x.beginPath(); x.ellipse(X0, y, r, r * 0.38, 0, 0, TAU); x.fill(); } x.fillStyle = shade(c, 0.3); x.beginPath(); x.ellipse(X0, Y - (n - 1) * r * 0.32, r * 0.65, r * 0.22, 0, 0, TAU); x.fill(); };
  const check = (x: X, X0: number, Y: number, s: number, c = WHITE, p = 1) => { const pts: Pt[] = [[X0 - s * 0.45, Y], [X0 - s * 0.12, Y + s * 0.32], [X0 + s * 0.5, Y - s * 0.38]]; strokePts(x, partial(pts, p).out, s * 0.2, c); };
  const cross = (x: X, X0: number, Y: number, s: number, c = WHITE) => { line(x, X0 - s * 0.35, Y - s * 0.35, X0 + s * 0.35, Y + s * 0.35, s * 0.2, c); line(x, X0 + s * 0.35, Y - s * 0.35, X0 - s * 0.35, Y + s * 0.35, s * 0.2, c); };
  const doc = (x: X, X0: number, Y: number, s: number, c: string, acc: string) => { fillRR(x, X0 - s * 0.36, Y - s * 0.46 + 8, s * 0.72, s * 0.92, 8, shade(c, -0.22)); fillRR(x, X0 - s * 0.36, Y - s * 0.46, s * 0.72, s * 0.92, 8, c); x.fillStyle = shade(c, -0.25); for (let i = 0; i < 4; i++) x.fillRect(X0 - s * 0.24, Y - s * 0.28 + i * s * 0.14, s * (i === 3 ? 0.28 : 0.48), s * 0.05); circle(x, X0 + s * 0.18, Y + s * 0.3, s * 0.1, acc); };
  const key = (x: X, X0: number, Y: number, s: number, c: string) => { circle(x, X0 - s * 0.25, Y, s * 0.26, c); circle(x, X0 - s * 0.25, Y, s * 0.1, CREAM); x.fillStyle = c; x.fillRect(X0 - s * 0.05, Y - s * 0.06, s * 0.55, s * 0.12); x.fillRect(X0 + s * 0.32, Y, s * 0.08, s * 0.18); x.fillRect(X0 + s * 0.18, Y, s * 0.08, s * 0.13); x.fillStyle = 'rgba(255,255,255,.45)'; x.fillRect(X0 - s * 0.02, Y - s * 0.05, s * 0.4, s * 0.03); };
  const pin = (x: X, X0: number, Y: number, s: number, c: string) => { circle(x, X0, Y - s, s * 0.6, shade(c, -0.25)); poly(x, [[X0 - s * 0.52, Y - s * 0.7], [X0, Y], [X0 + s * 0.52, Y - s * 0.7]], shade(c, -0.25)); circle(x, X0 - s * 0.04, Y - s * 1.04, s * 0.58, c); poly(x, [[X0 - s * 0.5, Y - s * 0.76], [X0 - s * 0.04, Y - s * 0.06], [X0 + s * 0.44, Y - s * 0.76]], c); circle(x, X0 - s * 0.04, Y - s * 1.04, s * 0.24, WHITE); };
  const train = (x: X, X0: number, Y: number, s: number, c: string) => { fillRR(x, X0 - s, Y - s * 0.45 + 6, s * 2, s * 0.9, s * 0.25, shade(c, -0.3)); fillRR(x, X0 - s, Y - s * 0.45, s * 2, s * 0.9, s * 0.25, c); for (let i = 0; i < 3; i++) fillRR(x, X0 - s * 0.8 + i * s * 0.56, Y - s * 0.3, s * 0.42, s * 0.32, 6, '#cfe3ee'); x.fillStyle = YEL; x.fillRect(X0 - s, Y + s * 0.14, s * 2, s * 0.08); circle(x, X0 - s * 0.55, Y + s * 0.5, s * 0.14, INK); circle(x, X0 + s * 0.55, Y + s * 0.5, s * 0.14, INK); };
  const cloud = (x: X, X0: number, Y: number, s: number, c: string) => { x.fillStyle = c; x.beginPath(); for (const [dx, dy, r] of [[-0.55, 0.08, 0.32], [-0.2, -0.15, 0.42], [0.25, -0.05, 0.36], [0.6, 0.1, 0.26]]) { x.moveTo(X0 + dx * s + r * s, Y + dy * s); x.arc(X0 + dx * s, Y + dy * s, r * s, 0, TAU); } x.rect(X0 - 0.8 * s, Y + 0.05 * s, 1.55 * s, 0.31 * s); x.fill(); };
  const drop = (t: number, a: number, d = 0.6, h = 420) => -(1 - bounce(seg(t, a, d))) * h;
  const twinkle = (k: number, ph: number) => 1 + Math.sin(k * 3 + ph) * 0.15;

  type Ctx = { t: number; k: number; it: (i: number, d: string) => string; va: (i: number, d: string) => string };
  type Card = { bg: string; title: string; sub: string; top: number; bot: number; draw: (x: X, c: Ctx) => void };
  const W0 = 1080;
  const C: Record<string, Card> = {};

  // 1 流程：蛇形路徑描出 → 站點放大 → 圖示落入 → 終點房子
  C.process = { bg: '#bfe3f7', title: '買房流程', sub: '從看屋到交屋 6 步', top: 400, bot: 1790, draw: (x, { t, k, it, va }) => {
    const steps: [string, string, string, string][] = [['看屋', '找 30 間比較', 'house', RED], ['斡旋', '出價 + 斡旋金', 'coin', YEL], ['簽約', '付簽約款 10%', 'doc', WHITE], ['貸款', '銀行估價核貸', 'coin', GRN], ['過戶', '代書辦理產權', 'doc', PINK], ['交屋', '拿鑰匙！', 'key', BLUE]];
    const pts: Pt[] = [[260, 540], [820, 540], [820, 930], [260, 930], [260, 1320], [820, 1320], [820, 1600]];
    const p = inout(seg(t, 0.45, 2.3)), pa = partial(pts, p);
    strokePts(x, pa.out, 70, DARK ? shade(BG, 0.14) : shade(BG, -0.18));
    x.setLineDash([30, 26]); x.lineDashOffset = -k * 30; strokePts(x, pa.out, 10, WHITE); x.setLineDash([]); x.lineDashOffset = 0;
    steps.forEach(([n0, s0, ic, c0], i) => {
      const [X0, Y] = pts[i], at = 0.45 + 2.3 * (pa.cum[i] / pa.len) * 0.92, c = c0 === WHITE ? '#e9eef3' : c0;
      pop(x, X0, Y, back(seg(t, at, 0.4)), () => { circle(x, X0, Y + 14, 118, shade(c, -0.3)); circle(x, X0, Y, 118, c); circle(x, X0, Y, 92, shade(c, 0.25)); });
      const dy = drop(t, at + 0.15, 0.55, 260), sh = seg(t, at + 0.15, 0.01) ? 1 : 0;
      if (sh) { x.save(); x.beginPath(); x.arc(X0, Y, 118, 0, TAU); x.rect(X0 - 200, Y - 600, 400, 482); x.clip();
        if (ic === 'house') house(x, X0, Y + 46 + dy, 110); else if (ic === 'coin') coin(x, X0, Y + dy, 52, GOLD); else if (ic === 'doc') doc(x, X0, Y + dy, 120, WHITE, i === 2 ? RED : BLUE); else key(x, X0 + 6, Y + dy + Math.sin(k * 2) * 4, 120, YEL);
        x.restore(); }
      fade(x, seg(t, at + 0.2, 0.3), () => { TF(x, it(i, n0), X0, Y + 168, 58, TB, 420); TF(x, va(i, s0), X0, Y + 222, 34, TS, 420, 'center', 700); });
    });
    const hy = drop(t, 2.6, 0.7, 500);
    if (t > 2.6) house(x, 520, 1740 + hy, 200, CREAM, RED);
    const s = back(seg(t, 3.1, 0.4));
    star(x, 640, 1500, 40 * s * twinkle(k, 0), YEL); star(x, 1000, 1480, 30 * s * twinkle(k, 2), WHITE); star(x, 960, 1590, 22 * s * twinkle(k, 4), YEL);
  } };

  // 2 預售屋時間軸：軸線生長，大樓逐期長高，付款標籤彈出，起重機吊鉤輕擺
  C.timeline = { bg: '#cfe3ee', title: '預售屋時間軸', sub: '付款跟著工程進度走', top: 370, bot: 1700, draw: (x, { t, k, it, va }) => {
    const L = 140, R = 940, ly = 1420;
    const ev: [string, string, string, number][] = [['2026', '簽約', '10%', 0.06], ['2027', '開工', '5%', 0.3], ['2028', '結構', '5%', 0.62], ['2029', '完工', '80% 貸款', 1]];
    const dx = Math.sin(k * 0.4) * 30;
    fade(x, seg(t, 0.3, 0.5), () => { cloud(x, 220 + dx, 520, 90, WHITE); cloud(x, 820 - dx, 470, 70, 'rgba(255,255,255,.8)'); });
    const ax = ease(seg(t, 0.4, 1.0)), aw = (R - L + 80) * ax;
    fillRR(x, L - 40, ly + 14, aw, 30, 15, shade(INK, 0.2)); fillRR(x, L - 40, ly, aw, 30, 15, INK);
    // 起重機（在大樓後面先立起）
    const cx = 610, cy = ly - 560, cr = inout(seg(t, 0.5, 0.8));
    if (cr > 0) { x.save(); x.beginPath(); x.rect(0, ly - 560 * cr - 40, W0, 560 * cr + 40); x.clip();
      x.fillStyle = YEL; x.fillRect(cx - 12, cy, 24, 560); x.fillRect(cx - 220, cy - 14, 420, 26); x.fillStyle = shade(YEL, -0.3); x.fillRect(cx - 220, cy + 12, 420, 8); for (let q = 0; q < 10; q++) x.fillRect(cx - 9, cy + 30 + q * 52, 18, 6);
      fillRR(x, cx + 150, cy + 10, 60, 50, 6, '#5c6f82');
      const sw = Math.sin(k * 1.6) * 0.06, hx = cx - 170 + Math.sin(sw) * 170, hy = cy + 10 + Math.cos(sw) * 170;
      line(x, cx - 170, cy + 10, hx, hy, 4, INK); fillRR(x, hx - 50, hy, 100, 24, 4, RED); x.restore(); }
    ev.forEach(([yr, n0, pay0, p], i) => {
      const X0 = L + (R - L) * i / 3, bw = 120, at = 0.8 + i * 0.45, g = inout(seg(t, at, 0.7)), bh = (120 + 520 * p) * g;
      if (p < 1 && g >= 1) for (let q = 0; q <= 3; q++) { x.fillStyle = YEL; x.fillRect(X0 - bw / 2 + (bw - 10) * q / 3, ly - bh - 60, 10, 60); }
      tower(x, X0 - bw / 2, ly, bw, bh, p < 1 ? '#d9d2c3' : CREAM);
      if (p < 1 && p > 0.1 && g >= 1) { x.fillStyle = YEL; x.fillRect(X0 - bw / 2 - 6, ly - bh - 64, bw + 12, 18); }
      if (i === 3) { const s = back(seg(t, at + 0.7, 0.4)); star(x, X0 + 40, ly - bh - 70, 34 * s * twinkle(k, 1), YEL); star(x, X0 - 60, ly - bh - 30, 22 * s * twinkle(k, 3), RED); }
      pop(x, X0, ly + 15, back(seg(t, at - 0.2, 0.35)), () => { circle(x, X0, ly + 15, 34, shade(RED, -0.25)); circle(x, X0, ly + 12, 30, RED); });
      fade(x, seg(t, at, 0.3), () => { T(x, yr, X0, ly + 90, 46, TB); TF(x, it(i, n0), X0, ly + 150, 52, TB, 230); });
      const pay = va(i, pay0), c = i === 3 ? RED : WHITE, w = tw(x, pay, 36);
      pop(x, X0, ly + 226, back(seg(t, at + 0.5, 0.4)), () => { fillRR(x, X0 - w / 2 - 20, ly + 196, w + 40, 60, 30, c); T(x, pay, X0, ly + 227, 36, on(c)); });
    });
  } };

  // 3 金字塔：由底往上疊、數字 count-up、金幣堆長高
  C.pyramid = { bg: '#fff3e2', title: '房價組成金字塔', sub: '一坪 60 萬，錢花在哪？', top: 470, bot: 1660, draw: (x, { t, k, it, va }) => {
    const lv: [string, string, string][] = [['品牌溢價', '8 萬', PINK], ['公設 / 管理', '10 萬', SKY], ['建材營造', '17 萬', YEL], ['土地成本', '25 萬', RED]];
    const top = 520, bot = 1620, cx = W0 / 2, hw = 430, n = lv.length, gap = 18, lh = (bot - top - gap * (n - 1)) / n;
    const cs = ease(seg(t, 0.5, 2.2));
    coinStack(x, 150, 1580, 60, Math.round(6 * cs)); coinStack(x, 930, 1580, 60, Math.round(4 * cs));
    for (let i = n - 1; i >= 0; i--) {
      const [nm0, v0, c] = lv[i], at = 0.45 + (n - 1 - i) * 0.4, dy = drop(t, at, 0.6, 260);
      if (t < at) continue;
      x.save(); x.translate(0, dy); x.globalAlpha = seg(t, at, 0.15);
      const y0 = top + i * (lh + gap), y1 = y0 + lh, w0 = hw * (i * (lh + gap)) / (bot - top), w1 = hw * (i * (lh + gap) + lh) / (bot - top);
      poly(x, [[cx - w0, y0], [cx + w0, y0], [cx + w1, y1], [cx - w1, y1]], c);
      poly(x, [[cx + w0 * 0.25, y0], [cx + w0, y0], [cx + w1, y1], [cx + w1 * 0.25, y1]], shade(c, -0.2));
      poly(x, [[cx - w1, y1], [cx + w1, y1], [cx + w1, y1 + 14], [cx - w1, y1 + 14]], shade(c, -0.35));
      x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(cx - w1 * 0.8, y1 - 26, w1 * 0.3, 10);
      const yy = (y0 + y1) / 2, v = cnt(va(i, v0), seg(t, at + 0.2, 0.8)), nm = it(i, nm0), tc = on(c);
      if (i) { T(x, v, cx, yy - 28, 64, tc); TF(x, nm, cx, yy + 44, 40, tc, w0 * 2 + 40, 'center', 700); }
      else { T(x, v, cx, yy + 60, 46, tc); T(x, nm, cx + 70, top - 10, 36, TB, 'left', 700); line(x, cx + 10, top + 30, cx + 60, top - 10, 5, TB); }
      x.restore();
    }
    if (t > 2.3) house(x, 930, 1440 + drop(t, 2.3, 0.6, 400) + Math.sin(k * 2) * 0, 120);
  } };

  // 4 象限：十字軸描線 → 四格淡入 → 大頭針逐一落下 → 最佳區塊閃星
  C.quadrant = { bg: '#2b3a55', title: '區域象限', sub: '房價 × 通勤，哪區 CP 值高', top: 400, bot: 1600, draw: (x, { t, k, it }) => {
    const L = 120, R = 960, Tp = 480, B = 1560, mx = (L + R) / 2, my = (Tp + B) / 2;
    const q: [number, number, string, string][] = [[L, Tp, '貴又近', ''], [mx, Tp, '貴又遠', ''], [L, my, '便宜又近', GRN], [mx, my, '便宜但遠', '']];
    q.forEach(([X0, Y, n, best], i) => fade(x, seg(t, 0.9 + i * 0.15, 0.4), () => { const c = best || (i ? SURF : shade(SURF, 0.08)); fillRR(x, X0 + 8, Y + 8, (R - L) / 2 - 16, (B - Tp) / 2 - 16, 24, c); T(x, n, X0 + (R - L) / 4, Y + (B - Tp) / 2 - 62, 42, best ? on(best) : alpha(on(SURF), 0.6), 'center', 900); }));
    const s = back(seg(t, 2.9, 0.4)); star(x, L + 380, my + 60, 30 * s * twinkle(k, 0), YEL);
    const ax = ease(seg(t, 0.4, 0.6)), axW = on(BG);
    fillRR(x, mx - 7, my - (B - Tp + 40) / 2 * ax, 14, (B - Tp + 40) * ax, 7, axW); fillRR(x, mx - (R - L + 40) / 2 * ax, my - 7, (R - L + 40) * ax, 14, 7, axW);
    fade(x, seg(t, 0.9, 0.3), () => { poly(x, [[mx - 26, Tp - 20], [mx, Tp - 60], [mx + 26, Tp - 20]], axW); poly(x, [[R + 20, my - 26], [R + 60, my], [R + 20, my + 26]], axW);
      T(x, '房價高', mx + 30, Tp - 30, 36, TB, 'left', 700); T(x, '通勤久 →', R - 10, my + 50, 34, on(SURF), 'right', 700); });
    const ar: [string, number, number, string][] = [['大安', 0.18, 0.08, RED], ['信義', 0.3, 0.14, PINK], ['板橋', 0.3, 0.5, YEL], ['新莊', 0.4, 0.62, YEL], ['三重', 0.22, 0.58, SKY], ['林口', 0.82, 0.62, '#e9905f'], ['淡水', 0.88, 0.84, SKY], ['竹北', 0.75, 0.3, PINK]];
    ar.forEach(([n, px, py, c], i) => {
      const X0 = L + (R - L) * px, Y = Tp + (B - Tp) * py, at = 1.5 + i * 0.16; if (t < at) return;
      const pp = seg(t, at, 0.55), dy = -(1 - bounce(pp)) * 300, sq = pp > 0.36 && pp < 0.6 ? Math.sin((pp - 0.36) / 0.24 * Math.PI) * 0.12 : 0;
      x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.ellipse(X0, Y + 4, 30 * (0.4 + 0.6 * pp), 10, 0, 0, TAU); x.fill();
      pop(x, X0, Y, 1 + sq, () => pin(x, X0, Y + dy, 46, c), 1 - sq);
      fade(x, seg(t, at + 0.35, 0.25), () => { const nm = it(i, n), w = Math.max(108, tw(x, nm, 34) + 30); fillRR(x, X0 - w / 2, Y + 14, w, 54, 27, WHITE); T(x, nm, X0, Y + 42, 34, INK); });
    });
  } };

  // 5 橫條：條由左生長＋數值 count-up，金幣滾到條尾
  C.bars = { bg: '#f3efe6', title: '房貸月付比較', sub: '貸 1,000 萬、30 年', top: 540, bot: 1700, draw: (x, { t, k, it, va }) => {
    const d: [string, string, number, string][] = [['新青安', '1.775%', 3.57, GRN], ['一般首購', '2.1%', 3.75, BLUE], ['寬限期後', '2.3%', 4.6, YEL], ['二屋', '2.6%', 4.0, RED]];
    const L = 330, R = 940, top = 560, bh = 150, gap = 90, max = 5;
    d.forEach(([n, r, v0, c], i) => {
      const y = top + i * (bh + gap), v = Math.max(0.1, Math.min(max, num(va(i, ''), v0))), at = 0.5 + i * 0.3, g = ease(seg(t, at, 1.0)), w = (R - L) * v / max * g;
      fade(x, seg(t, at - 0.2, 0.3), () => { TF(x, it(i, n), L - 30, y + 52, 50, TB, 300, 'right'); T(x, r, L - 30, y + 110, 36, TS, 'right', 700); fillRR(x, L, y, R - L, bh, 24, alpha(TB, 0.08)); });
      block(x, L, y, w, bh, 24, c, 14);
      x.fillStyle = shade(c, -0.15); for (let q = 1; q < v * g; q++) x.fillRect(L + (R - L) * q / max - 3, y + 20, 6, bh - 40);
      if (w > 200) T(x, `${(v * g).toFixed(1)} 萬`, L + w - 24, y + bh / 2 + 4, 54, on(c), 'right');
      if (g > 0) { x.save(); x.translate(L + w + 54, y + bh / 2); x.rotate(g * TAU * 1.5 + Math.sin(k * 2 + i) * 0.1 * Math.min(1, k)); coin(x, 0, 0, 34); x.restore(); }
    });
    const g = ease(seg(t, 1.4, 1.6));
    if (t > 0.4) house(x, 220, 1640 + drop(t, 0.4, 0.6, 300), 170);
    coinStack(x, 470, 1640, 70, Math.round(5 * g)); coinStack(x, 640, 1640, 70, Math.round(7 * g)); coinStack(x, 810, 1640, 70, Math.round(9 * g));
  } };

  // 6 Venn：三圈放大滑入重疊 → 中心白區閃現 → 房子＋星星
  C.venn = { bg: '#1d2433', title: '理想的房子', sub: '三個條件能同時有嗎？', top: 470, bot: 1500, draw: (x, { t, k, it }) => {
    const cx = W0 / 2, cy = 1060, r = 300, o = 190;
    const base: [number, number, string, string][] = [[0, -o, RED, '預算內'], [-o * 0.95, o * 0.6, SKY, '通勤 30 分'], [o * 0.95, o * 0.6, YEL, '好學區']];
    const cs = base.map(([dx, dy, c, n], i) => { const p = seg(t, 0.4 + i * 0.3, 0.6), m = 1 + (1 - ease(p)) * 0.7, br = 1 + Math.sin(k * 1.4 + i * 2) * 0.012 * Math.min(1, k); return { X: cx + dx * m, Y: cy + dy * m, R: r * back(p) * br, c, n, p }; });
    x.globalAlpha = 0.82; cs.forEach((q) => circle(x, q.X, q.Y, q.R, q.c)); x.globalAlpha = 1;
    const wc = seg(t, 1.6, 0.3);
    if (wc > 0) { x.save(); x.globalAlpha = wc; cs.forEach((q) => { x.beginPath(); x.arc(q.X, q.Y, Math.max(1, q.R), 0, TAU); x.clip(); }); x.fillStyle = WHITE; x.fillRect(0, 0, W0, 1920); x.restore(); }
    cs.forEach((q, i) => fade(x, seg(t, 0.7 + i * 0.3, 0.3), () => { const dx = (base[i][0]) * 0.9, dy = (base[i][1] - 40) * 0.9; T(x, it(i, q.n), cx + dx * 1.6, cy + dy * 1.6 + (i ? 60 : -10), 52, on(q.c)); }));
    pop(x, cx, cy + 90, back(seg(t, 1.9, 0.45)), () => { house(x, cx, cy + 90, 110, CREAM, RED); T(x, it(3, '夢幻物件'), cx, cy + 140, 34, INK, 'center', 900); });
    star(x, cx + 80, cy - 40, 24 * back(seg(t, 2.2, 0.4)) * twinkle(k, 0), YEL);
    fade(x, seg(t, 2.1, 0.4), () => { T(x, it(4, '蛋黃老公寓'), cx - 250, cy - 20, 32, INK, 'center', 700); T(x, it(5, '新市鎮'), cx + 250, cy - 20, 32, INK, 'center', 700); T(x, it(6, '明星學區遠郊'), cx, cy + 360, 32, INK, 'center', 700); });
  } };

  // 7 對比表：表頭落下 → 每列滑入、勾叉彈出
  C.compare = { bg: '#efe6d8', title: '買房 vs 租房', sub: '30 歲的你怎麼選', top: 470, bot: 1710, draw: (x, { t, it, va }) => {
    const L = 80, R = 1000, mid = 400, colW = (R - mid) / 2, top = 480;
    const h1 = drop(t, 0.4, 0.6, 300), h2 = drop(t, 0.55, 0.6, 300);
    if (t > 0.4) { x.save(); x.translate(0, h1); block(x, mid + 10, top, colW - 20, 170, 30, RED); house(x, mid + colW / 2 - 70, top + 140, 90, CREAM, YEL); T(x, va(0, '買'), mid + colW / 2 + 60, top + 86, 72, on(RED)); x.restore(); }
    if (t > 0.55) { x.save(); x.translate(0, h2); block(x, mid + colW + 10, top, colW - 20, 170, 30, BLUE); key(x, mid + colW * 1.5 - 70, top + 86, 110, YEL); T(x, va(1, '租'), mid + colW * 1.5 + 60, top + 86, 72, on(BLUE)); x.restore(); }
    const rows: [string, string | boolean, string | boolean][] = [['每月支出', '房貸 4.2 萬', '房租 2.8 萬'], ['頭期款', '要 300 萬', '押金 2 個月'], ['資產累積', true, false], ['搬家彈性', false, true], ['裝潢自由', true, false], ['房價風險', '自己承擔', '房東承擔']];
    rows.forEach((rw, i) => {
      const y = top + 230 + i * 168, at = 1.0 + i * 0.22, p = ease(seg(t, at, 0.5)); if (p <= 0) return;
      x.save(); x.translate(-(1 - p) * 1100, 0);
      fillRR(x, L, y, R - L, 148, 24, i % 2 ? 'rgba(255,255,255,.6)' : WHITE);
      TF(x, it(i, rw[0] as string), L + 160, y + 74, 44, INK, 290);
      [rw[1], rw[2]].forEach((v, q) => { const X0 = mid + colW * (q + 0.5);
        if (typeof v === 'boolean') pop(x, X0, y + 76, back(seg(t, at + 0.4 + q * 0.1, 0.35)), () => { circle(x, X0, y + 78, 46, shade(v ? GRN : '#c9c2b4', -0.25)); circle(x, X0, y + 74, 46, v ? GRN : '#c9c2b4'); v ? check(x, X0, y + 76, 52) : cross(x, X0, y + 74, 52); });
        else TF(x, v, X0, y + 74, 40, q ? shade(BLUE, lum(BLUE) > 150 ? -0.5 : 0) : (lum(RED) > 150 ? shade(RED, -0.55) : RED), colW - 24); });
      x.restore();
    });
  } };

  // 8 環圖：扇形依序掃角，房貸扇形外推，中心房子彈出
  C.donut = { bg: '#2a3442', title: '月薪 6 萬怎麼分', sub: '房貸佔三分之一以內', top: 520, bot: 1600, draw: (x, { t, k, it, va }) => {
    const cx = W0 / 2, cy = 900, R = 340, r = 190;
    const d0: [string, number, string][] = [['房貸', 0.33, RED], ['生活', 0.27, YEL], ['存錢', 0.2, GRN], ['保險', 0.1, SKY], ['玩樂', 0.1, PINK]];
    const raw = d0.map(([, p], i) => Math.max(0.01, num(va(i, ''), p * 100) / 100)), sum = raw.reduce((a, b) => a + b, 0), d = d0.map(([n, , c], i) => [it(i, n), raw[i] / sum, c] as [string, number, string]);
    fade(x, seg(t, 0.3, 0.3), () => { x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.arc(cx, cy + 22, R, 0, TAU); x.arc(cx, cy + 22, r, 0, TAU, true); x.fill(); });
    let a = -Math.PI / 2;
    d.forEach(([, p, c], i) => {
      const sp = inout(seg(t, 0.5 + i * 0.3, 0.45)), b = a + p * TAU * sp, e = i === 0 ? 26 * back(seg(t, 2.3, 0.4)) : 0, mx = Math.cos(a + p * Math.PI) * e, my = Math.sin(a + p * Math.PI) * e;
      if (sp > 0) {
        x.beginPath(); x.arc(cx + mx, cy + my, R, a + 0.012, Math.max(a + 0.013, b - 0.012)); x.arc(cx + mx, cy + my, r, Math.max(a + 0.021, b - 0.02), a + 0.02, true); x.closePath(); x.fillStyle = c; x.fill();
        x.beginPath(); x.arc(cx + mx, cy + my, R, a + 0.012, Math.max(a + 0.013, b - 0.012)); x.arc(cx + mx, cy + my, R - 34, Math.max(a + 0.015, b - 0.014), a + 0.014, true); x.closePath(); x.fillStyle = shade(c, 0.22); x.fill();
      }
      const m = a + p * Math.PI, tx = cx + mx + Math.cos(m) * (R + r) / 2, ty = cy + my + Math.sin(m) * (R + r) / 2;
      pop(x, tx, ty, back(seg(t, 0.8 + i * 0.3, 0.35)), () => T(x, `${Math.round(p * 100)}%`, tx, ty, 50, on(c)));
      a += p * TAU;
    });
    circle(x, cx, cy, (r - 12) * ease(seg(t, 0.3, 0.4)), shade(BG, DARK ? 0.08 : -0.08));
    pop(x, cx, cy + 50, back(seg(t, 2.4, 0.45)) * (1 + Math.sin(k * 2) * 0.02 * Math.min(1, k)), () => { house(x, cx, cy + 50, 130, CREAM, RED); T(x, `${(d[0][1] * 6).toFixed(0)} 萬`, cx, cy + 105, 40, WHITE); });
    d.forEach(([n, p, c], i) => fade(x, seg(t, 1.0 + i * 0.25, 0.35), () => { const X0 = 130 + (i % 3) * 300, Y = 1400 + Math.floor(i / 3) * 140; fillRR(x, X0, Y - 34, 68, 68, 16, c); TF(x, n, X0 + 92, Y, 46, TB, 190, 'left'); T(x, `${(p * 6).toFixed(1)}萬`, X0 + 92, Y + 50, 32, TS, 'left', 700); }));
  } };

  // 9 清單：夾板落下 → 逐項打勾＋刪除線 → 放大鏡掃過
  C.checklist = { bg: '#fff3e2', title: '看屋必檢查', sub: '帶這張去看房', top: 400, bot: 1790, draw: (x, { t, k, it }) => {
    const dy = drop(t, 0.3, 0.7, 700); if (t < 0.3) return;
    x.save(); x.translate(0, dy);
    fillRR(x, 110, 470, 860, 1230, 40, shade(BLUE, -0.25)); fillRR(x, 110, 450, 860, 1230, 40, BLUE);
    fillRR(x, 150, 500, 780, 1140, 28, WHITE); fillRR(x, 420, 420, 240, 70, 20, '#5c6f82'); circle(x, 540, 430, 22, '#2a3442');
    x.restore();
    const its: [string, number][] = [['壁癌 / 漏水', 1], ['採光方位', 1], ['管線更新', 1], ['電梯保養', 0], ['車位尺寸', 0], ['管委會帳目', 0], ['周邊嫌惡設施', 0]];
    let j = 0;
    its.forEach(([n0, ok], i) => {
      const y = 600 + i * 148, n = it(i, n0), a = seg(t, 0.9 + i * 0.1, 0.3); if (a <= 0) return;
      const ct = ok ? 1.6 + (j++) * 0.45 : 99, cp = seg(t, ct, 0.3), sp = ease(seg(t, ct + 0.25, 0.35));
      fade(x, a, () => {
        fillRR(x, 210, y - 44 + 6, 88, 88, 20, shade(cp > 0 ? GRN : '#d9d2c3', -0.25)); fillRR(x, 210, y - 44, 88, 88, 20, cp > 0 ? GRN : '#e6e0d4'); if (cp > 0) check(x, 254, y, 58, WHITE, cp);
        const fs = Math.min(52, 52 * 520 / Math.max(1, tw(x, n, 52))); T(x, n, 340, y, fs, sp > 0.5 ? '#8b93a1' : INK, 'left');
        if (sp > 0) { const w = tw(x, n, fs); x.fillStyle = RED === '#ffd23f' ? '#d64541' : RED; x.fillRect(340, y - 4, w * sp, 8); }
        if (i < its.length - 1) { x.fillStyle = '#eee8dc'; x.fillRect(210, y + 72, 670, 4); }
      });
    });
    const mp = inout(seg(t, 1.3, 2.0)), mxp = 300 + 560 * mp + Math.sin(k * 1.2) * 12 * Math.min(1, k), myp = 1600 - Math.sin(mp * Math.PI) * 700;
    if (t > 1.3) { circle(x, mxp, myp, 92, '#5c6f82'); x.fillStyle = 'rgba(207,227,238,.55)'; x.beginPath(); x.arc(mxp, myp, 66, 0, TAU); x.fill(); x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(mxp - 38, myp - 40, 18, 40); line(x, mxp + 65, myp + 65, mxp + 140, myp + 140, 36, INK); }
  } };

  // 10 大字卡：數字滾動 count-up＋落地回彈，「萬」彈出，事實條滑入
  C.bignum = { bg: '#1d2433', title: '台北平均總價', sub: '', top: 370, bot: 1760, draw: (x, { t, k, it, va }) => {
    fade(x, seg(t, 0.3, 0.4), () => TF(x, it(0, '雙北中古屋（示意）'), W0 / 2, 400, 44, alpha(TB, 0.7), 900, 'center', 700));
    const v = va(0, '2,380'), dy = drop(t, 0.4, 0.8, 320), s = cnt(v, seg(t, 0.4, 1.6));
    x.font = `900 330px ${F}`; const m = x.measureText(v).width, fs = m > 960 ? 330 * 960 / m : 330;
    if (t > 0.4) { x.font = `900 ${fs}px ${F}`; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = shade(RED, -0.4); x.fillText(s, W0 / 2 + 10, 880 + 16 + dy); x.fillStyle = RED; x.fillText(s, W0 / 2, 880 + dy); x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(150, 700 + dy, 60, 14); }
    pop(x, W0 / 2, 985, back(seg(t, 1.7, 0.4)), () => { fillRR(x, W0 / 2 - 110, 930, 220, 110, 30, YEL); T(x, it(1, '萬'), W0 / 2, 987, 80, on(YEL)); });
    const facts: [string, string][] = [[it(2, '＝ 年薪 100 萬'), it(3, '不吃不喝 23.8 年')], [it(4, '＝ 每坪 65 萬'), it(5, '約 36 坪')]];
    facts.forEach(([a, b], i) => { const p = ease(seg(t, 2.0 + i * 0.2, 0.5)); if (p <= 0) return; const y = 1140 + i * 170; x.save(); x.translate((1 - p) * 1100, 0); const sf = DARK ? shade(BG, 0.12) : SURF; fillRR(x, 130, y + 10, 820, 140, 30, shade(sf, -0.35)); fillRR(x, 130, y, 820, 140, 30, sf); TF(x, a, 180, y + 70, 50, WHITE, 430, 'left'); TF(x, b, 910, y + 70, 36, YEL, 300, 'right', 700); x.restore(); });
    const g = ease(seg(t, 1.0, 1.6)); coinStack(x, 220, 1720, 64, Math.round(5 * g)); coinStack(x, 370, 1720, 64, Math.round(7 * g)); coinStack(x, 520, 1720, 64, Math.round(9 * g));
    if (t > 2.3) house(x, 820, 1690 + drop(t, 2.3, 0.6, 500), 260, CREAM, RED);
    star(x, 960, 1450, 34 * back(seg(t, 2.9, 0.4)) * twinkle(k, 0), YEL);
  } };

  // 11 路線圖：各線描線 → 站點亮起 → 列車開進，分鐘標籤彈出
  C.metro = { bg: '#e9eef3', title: '通勤路線比較', sub: '到台北車站要多久', top: 450, bot: 1720, draw: (x, { t, k, it, va }) => {
    const lines: [string, string, string, string, number][] = [['板橋', '環狀線', '22', BLUE, 3], ['新莊', '橘線', '28', '#f29e38', 5], ['淡水', '紅線', '42', BRICK, 10], ['林口', '機場線', '35', '#8e5bb5', 4]];
    const L = 150, R = 900, top = 560, mid = 1050;
    pop(x, R, 1050, back(seg(t, 0.3, 0.45)), () => { circle(x, R + 6, 1060, 92, shade(INK, 0.2)); circle(x, R, 1050, 92, INK); T(x, '台北', R, 1030, 38, WHITE); T(x, '車站', R, 1076, 38, WHITE); });
    lines.forEach(([n, ln, m0, c, st], i) => {
      const y = top + i * 250, at = 0.5 + i * 0.25;
      const pts: Pt[] = [[L, y], [R - 300, y]]; const ex = R - 80, ey = (y + mid) / 2 + (mid - y) * 0.3;
      for (let q = 1; q <= 16; q++) { const u = q / 16; pts.push([(1 - u) ** 2 * (R - 300) + 2 * (1 - u) * u * (R - 120) + u * u * ex, (1 - u) ** 2 * y + 2 * (1 - u) * u * y + u * u * ey]); }
      pts.push([R - 60, mid + (y - mid) * 0.12]);
      const p = inout(seg(t, at, 1.1)); strokePts(x, partial(pts, p).out, 34, c);
      for (let q = 1; q < Math.min(st, 5); q++) circle(x, L + q * 100, y, 16 * back(seg(t, at + q * 0.12, 0.3)), WHITE);
      pop(x, L, y, back(seg(t, at - 0.15, 0.4)), () => { circle(x, L, y + 6, 54, shade(c, -0.3)); circle(x, L, y, 54, c); circle(x, L, y, 36, WHITE); });
      fade(x, seg(t, at, 0.3), () => { TF(x, it(i, n), L, y - 90, 48, TB, 260); fillRR(x, L + 80, y + 30, 180, 56, 28, alpha(TB, 0.08)); T(x, ln, L + 170, y + 58, 32, TS, 'center', 700); });
      pop(x, R - 335, y + 69, back(seg(t, at + 1.0, 0.35)), () => { fillRR(x, R - 420, y + 34, 170, 70, 35, c); T(x, cnt(`${va(i, m0)} 分`, seg(t, at + 0.9, 0.5)), R - 335, y + 69, 42, on(c)); });
    });
    const tp = ease(seg(t, 2.2, 1.2)), bob = Math.sin(k * 6) * 3 * Math.min(1, k);
    if (t > 2.2) { train(x, -200 + 620 * tp, 1640 + bob, 120, BLUE); train(x, -200 + 900 * tp, 1640 - bob, 120, shade(BLUE, 0.1)); }
  } };

  // 12 循環圖：四段弧依序掃出＋箭頭，完成後高光點繞行
  C.cycle = { bg: '#f3efe6', title: '房市景氣循環', sub: '漲 → 熱 → 跌 → 冷', top: 590, bot: 1500, draw: (x, { t, k, it, va }) => {
    const cx = W0 / 2, cy = 1040, R = 330;
    const st: [string, string, string, number][] = [['復甦', '成交量回升', GRN, -Math.PI / 2], ['繁榮', '價量齊揚', RED, 0], ['衰退', '量縮價跌', BLUE, Math.PI / 2], ['蕭條', '買方市場', '#8b93a1', Math.PI]];
    pop(x, cx, cy, back(seg(t, 0.3, 0.4)), () => circle(x, cx, cy, 190, DARK ? shade(BG, 0.1) : shade(BG, -0.06)));
    st.forEach(([, , c, a], i) => {
      const a0 = a - Math.PI / 4 + 0.12, a1f = a + Math.PI / 4 - 0.12, sp = inout(seg(t, 0.5 + i * 0.4, 0.45)), a1 = a0 + (a1f - a0) * sp;
      if (sp <= 0) return;
      x.beginPath(); x.arc(cx, cy, R, a0, a1); x.lineWidth = 80; x.strokeStyle = c; x.lineCap = 'butt'; x.stroke();
      x.beginPath(); x.arc(cx, cy, R + 26, a0, a1); x.lineWidth = 18; x.strokeStyle = shade(c, 0.25); x.stroke();
      const ex = cx + Math.cos(a1 + 0.02) * R, ey = cy + Math.sin(a1 + 0.02) * R, tg = a1 + Math.PI / 2;
      poly(x, [[ex + Math.cos(a1) * 66, ey + Math.sin(a1) * 66], [ex - Math.cos(a1) * 66, ey - Math.sin(a1) * 66], [ex + Math.cos(tg) * 70, ey + Math.sin(tg) * 70]], c);
    });
    if (t > 2.3) { const a = -Math.PI / 2 + Math.max(0, k - 2.3) * 0.9; circle(x, cx + Math.cos(a) * (R + 26), cy + Math.sin(a) * (R + 26), 12 * ease(seg(t, 2.3, 0.3)), WHITE); }
    st.forEach(([n, s, c, a], i) => {
      const bx = cx + Math.cos(a) * (R + 30), by = cy + Math.sin(a) * (R + 30);
      pop(x, bx, by, back(seg(t, 0.7 + i * 0.4, 0.4)), () => { fillRR(x, bx - 130, by - 60, 260, 140, 30, shade(c, -0.3)); fillRR(x, bx - 130, by - 70, 260, 140, 30, c); TF(x, it(i, n), bx, by - 18, 52, on(c), 230); TF(x, va(i, s), bx, by + 38, 30, alpha(on(c), 0.85), 230, 'center', 700); });
    });
    pop(x, cx, cy + 70, back(seg(t, 2.2, 0.45)), () => { house(x, cx, cy + 70, 170, CREAM, RED); TF(x, it(4, '約 7–10 年一輪'), cx, cy + 115, 32, DARK ? WHITE : INK, 340, 'center', 900); });
  } };

  // 13 漏斗：各層由上往下落入並縮窄，數字 count-up；金幣從兩側掉入，房子最後落地
  C.funnel = { bg: '#bfe3f7', title: '買得起多少的房？', sub: '從年收入一路推', top: 480, bot: 1760, draw: (x, { t, k, it, va }) => {
    const lv: [string, string, string][] = [['家庭年收入', '150 萬', BLUE], ['× 房價所得比 10', '1,500 萬', SKY], ['− 頭期款不足', '1,200 萬', YEL], ['− 裝潢 / 稅費', '1,080 萬', RED]];
    const top = 500, lh = 230, cx = W0 / 2;
    for (let i = 0; i < 6; i++) { const at = 0.4 + i * 0.25; if (t > at) coin(x, 200 + (i % 2) * 60, 560 + i * 120 + drop(t, at, 0.6, 400), 34); }
    for (let i = 0; i < 4; i++) { const at = 0.55 + i * 0.3; if (t > at) coin(x, 880 - (i % 2) * 50, 600 + i * 150 + drop(t, at, 0.6, 400), 30); }
    lv.forEach(([n, v, c], i) => {
      const at = 0.4 + i * 0.45; if (t < at) return;
      const y = top + i * (lh + 20) + drop(t, at, 0.6, 90), w0 = 440 - i * 80, w1 = 440 - (i + 1) * 80 + 20;
      x.save(); x.globalAlpha = seg(t, at, 0.2);
      poly(x, [[cx - w0, y + 18], [cx + w0, y + 18], [cx + w1, y + lh + 18], [cx - w1, y + lh + 18]], shade(c, -0.3));
      poly(x, [[cx - w0, y], [cx + w0, y], [cx + w1, y + lh], [cx - w1, y + lh]], c);
      poly(x, [[cx - w0, y], [cx + w0, y], [cx + w0 - 4, y + 22], [cx - w0 + 4, y + 22]], shade(c, 0.3));
      const tc = on(c); TF(x, it(i, n), cx, y + 80, 40, tc, w1 * 2 - 20, 'center', 700); TF(x, cnt(va(i, v), seg(t, at + 0.2, 0.8)), cx, y + 160, 70, tc, w1 * 2 - 10);
      x.restore();
    });
    const ey = top + 4 * (lh + 20) + 40;
    if (t > 2.3) house(x, cx, ey + 200 + drop(t, 2.3, 0.7, 500), 200, CREAM, RED);
    star(x, cx + 170, ey + 40, 30 * back(seg(t, 2.9, 0.4)) * twinkle(k, 0), YEL);
  } };

  // 14 啞鈴：起點出現 → 連桿伸長 → 終點放大，+% 標籤彈出
  C.dumbbell = { bg: '#2b3a55', title: '十年漲多少？', sub: '每坪單價 2016 → 2026', top: 480, bot: 1780, draw: (x, { t, k, it, va }) => {
    const d0: [string, number, number][] = [['台北', 62, 78], ['新北', 32, 52], ['桃園', 18, 36], ['台中', 20, 44], ['台南', 15, 35], ['高雄', 16, 38]];
    const L = 240, R = 860, top = 600, step = 180, sc = (v: number) => L + (R - L) * Math.min(85, v) / 85;
    fade(x, seg(t, 0.3, 0.4), () => { for (let v = 0; v <= 80; v += 20) { x.fillStyle = alpha(TB, 0.1); x.fillRect(sc(v) - 2, top - 60, 4, step * d0.length); T(x, String(v), sc(v), top - 90, 28, alpha(TB, 0.5), 'center', 700); } });
    d0.forEach(([n, a0, b0], i) => {
      const y = top + i * step, at = 0.6 + i * 0.25, pr = va(i, '').split(/[\/→>]/), a = num(pr[0], a0), b = num(pr[1], b0);
      fade(x, seg(t, at - 0.1, 0.3), () => TF(x, it(i, n), L - 40, y, 52, TB, 190, 'right'));
      const g = ease(seg(t, at + 0.25, 0.5)), xb = sc(a) + (sc(b) - sc(a)) * g;
      fillRR(x, sc(a), y - 14, xb - sc(a), 28, 14, shade(YEL, -0.35)); fillRR(x, sc(a), y - 14, xb - sc(a), 18, 9, YEL);
      pop(x, sc(a), y, back(seg(t, at, 0.35)), () => { circle(x, sc(a), y + 6, 36, shade(SKY, -0.3)); circle(x, sc(a), y, 36, SKY); });
      pop(x, sc(b), y, back(seg(t, at + 0.7, 0.4)) * (1 + Math.sin(k * 2 + i) * 0.03 * Math.min(1, k)), () => { circle(x, sc(b), y + 6, 46, shade(RED, -0.3)); circle(x, sc(b), y, 46, RED); T(x, String(b), sc(b), y + 2, 34, on(RED)); });
      pop(x, sc(b) + 60, y, back(seg(t, at + 0.9, 0.35)), () => T(x, `+${Math.round((b / a - 1) * 100)}%`, sc(b) + 60, y, 34, YEL === '#fff3e2' ? '#fff3e2' : (DARK ? YEL : shade(YEL, -0.55)), 'left', 900));
    });
    const g = ease(seg(t, 0.4, 1.0)), tc = DARK ? shade(BG, 0.12) : SURF;
    tower(x, 40, 1760, 90, 110 * g, tc); tower(x, 780, 1760, 110, 150 * g, tc); tower(x, 910, 1760, 80, 120 * g, tc);
    const ly = top + d0.length * step + 10;
    fade(x, seg(t, 2.4, 0.4), () => { circle(x, 200, ly, 24, SKY); T(x, it(6, '2016'), 240, ly, 34, TB, 'left', 700); circle(x, 440, ly, 30, RED); T(x, it(7, '2026（萬/坪）'), 486, ly, 34, TB, 'left', 700); });
  } };

  const setStyle = (style: string, card: Card) => {
    const s = STYLES[style];
    const acc = s ? s.acc : CLASSIC;
    [RED, BLUE, YEL, PINK, SKY, GRN, BRICK, GOLD] = acc;
    BAND = s ? s.band : '#ffd23f';
    BG = s ? s.bg : card.bg;
    DARK = lum(BG) < 150;
    TB = DARK ? WHITE : INK;
    TS = DARK ? 'rgba(255,255,255,.72)' : '#3d4a5c';
    SURF = DARK ? shade(BG, 0.1) : '#2b3a55';
  };

  /** 標題膠囊（黃色）與副標 */
  const frame = (x: X, cx: number, ty: number, maxW: number, title: string, sub: string, t: number) => {
    let fs = 92; const w0 = tw(x, title, fs); if (w0 + 88 > maxW) fs = fs * (maxW - 88) / w0;
    const w = tw(x, title, fs), ph = fs * 1.52, py = ty - ph / 2;
    pop(x, cx, ty, back(seg(t, 0, 0.45)), () => {
      fillRR(x, cx - w / 2 - 44, py + 14, w + 88, ph, 30, shade(BAND, -0.28)); fillRR(x, cx - w / 2 - 44, py, w + 88, ph, 30, BAND);
      x.fillStyle = 'rgba(255,255,255,.4)'; rr(x, cx - w / 2 - 10, py + 16, 90, 12, 6); x.fill();
      T(x, title, cx, ty + 4, fs, on(BAND));
    });
    if (sub) fade(x, seg(t, 0.2, 0.4), () => TF(x, sub, cx, ty + ph / 2 + 70, 44, TS === '#3d4a5c' ? TB : 'rgba(255,255,255,.85)', maxW, 'center', 700));
  };

  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, unknown>, t: number) => {
    const card = C[String(P.mode)] ?? C.process;
    setStyle(String(P.style ?? 'classic'), card);
    const sp = Math.max(0.2, num(P.speed, 1)), tb = t * sp, k = Math.max(0, tb - 3.4);
    const list = (s: unknown) => String(s ?? '').split(/[,，、|]/).map((v) => v.trim());
    const items = list(P.items), vals = list(P.values);
    const c: Ctx = { t: tb, k, it: (i, d) => items[i] || d, va: (i, d) => vals[i] || d };
    const title = String(P.title || '').trim() || card.title, sub = String(P.sub ?? '').trim() || card.sub;
    if (P.bgfill !== 0 && P.bgfill !== '0') { ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); }
    ctx.save();
    if (W / H > 0.75) {
      // 橫式：左欄標題、右欄圖解
      const u = H / 1080, DW = W / u, LP = Math.min(DW * 0.4, 820);
      ctx.scale(u, u);
      frame(ctx, LP / 2 + 30, 440, LP - 60, title, sub, tb);
      const bh = card.bot - card.top, aw = DW - LP - 40, s = Math.min(aw / W0, 1000 / bh);
      ctx.translate(LP + (aw - W0 * s) / 2, 40 + (1000 - bh * s) / 2);
      ctx.scale(s, s); ctx.translate(0, -card.top);
      card.draw(ctx, c);
    } else {
      const s = Math.min(W / W0, H / 1920);
      ctx.translate((W - W0 * s) / 2, (H - 1920 * s) / 2); ctx.scale(s, s);
      frame(ctx, W0 / 2, 220, W0 - 120, title, sub, tb);
      card.draw(ctx, c);
    }
    ctx.restore();
    return { cx: W / 2, cy: H / 2, r: Math.min(W, H) * 0.45 };
  };
  return { draw };
};

(globalThis as unknown as { MA_DCARD: unknown }).MA_DCARD = dcardRenderer();
