// 地圖招式（區位比較、規劃建設、數據地圖、生活風險、地圖元件）：程式產生的簡化城市底圖＋各招動態。
// 底圖是示意，不是真實地圖；數字、官方圖資類（淹水、分區、學區、地籍）一律標註示意。
// mapfxRenderer 內部必須自給自足，匯出 HTML 時以 toString() 內嵌。

export const MAPFX_HELP: Record<string, string> = {
  taiwan: '縣市 / 地點標籤（縣市用全名，例如「新北市」）',
  split: '每一側一行：「名稱｜重點｜重點」，共兩行',
  race: '起點 / 終點 / 「路線一 分鐘」 / 「路線二 分鐘」（分鐘請用實測）',
  tour: '一行一個地點，依序串連（2–6 個）',
  spot: '一行一個重點，聚光燈依序移過去（2–6 個）',
  phase: '一行一期：「一期 2016」，可加（規劃）',
  future: '一行一項：「捷運｜道路｜公園 名稱 年份」，例如「捷運 環狀線北環段 2030」',
  zoning: '一行一種分區名稱（2–6 種）',
  parcel: '基地名稱 / 面積或說明',
  choro: '「區名 數值」一行一筆；可加 @title 標題、@unit 單位；數字請附來源',
  bubble: '「區名 數值」一行一筆；可加 @title 標題、@unit 單位；數字請附來源',
  bars: '「區名 數值」一行一筆；可加 @title 標題、@unit 單位；數字請附來源',
  nuisance: '設施名稱 / 影響半徑（公尺） / 基地名稱 / 基地距離（公尺）',
  flood: '標題 / 降雨情境說明',
  school: '學校名稱 / 基地名稱 / 結論（例如「學區內」）',
  radar: '一行一個周邊設施（2–7 個）',
  nav: '目的地 / 剩餘時間 / 剩餘距離 / 指示一 / 指示二',
  compass: '比例尺文字（例如 500 m）',
  oldnew: '舊年份 / 新年份',
  drive: '目的地 / 一行一個轉彎指示（2–3 個，例如「右轉 忠孝路」） / 剩餘時間（例如 9 分） / 總距離（例如 2.4 公里）',
  amenity: '一行一個設施：「類別 名稱 步行分鐘」，例如「超市 某某超市 4」；類別用超市、學校、公園、醫院、捷運、餐飲、銀行等，分鐘請用實測',
};

export const MAPFX_LOOP: Record<string, number> = { drive: 9, amenity: 7, taiwan: 6, split: 6, race: 7, tour: 7, spot: 8, phase: 6, future: 7, zoning: 6, parcel: 5, choro: 6, bubble: 6, bars: 6, nuisance: 6, flood: 7, school: 6, radar: 6, nav: 8, compass: 4, oldnew: 6 };

export const mapfxRenderer = () => {
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
  const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
  const rng = (seed: number) => {
    let a = (seed * 2654435761) >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let r = Math.imul(a ^ (a >>> 15), 1 | a);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };
  const hash = (s: string) => {
    let h = 7;
    for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h % 997;
  };
  const hex = (c: string) => {
    const m = /#([0-9a-f]{6})/i.exec(c);
    const n = m ? parseInt(m[1], 16) : 0xff5a36;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgba = (c: string, a: number) => `rgba(${hex(c).join(',')},${a})`;
  const mix = (a: string, b: string, k: number) => {
    const A = hex(a), B = hex(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
  };
  const INK = '#1d2433';

  /* ───────── 程式產生的城市底圖（世界座標 0–1，向外延伸到 -0.6–1.6） ───────── */
  type World = { blocks: number[][]; major: number[][]; minor: number[][]; river: number[][]; parks: number[][] };
  const worlds = new Map<number, World>();
  const world = (seed: number): World => {
    const hit = worlds.get(seed);
    if (hit) return hit;
    const r = rng(seed + 11), step = 0.075, blocks: number[][] = [], parks: number[][] = [];
    const river: number[][] = [];
    const ry = 0.18 + r() * 0.15, amp = 0.06 + r() * 0.05, ph = r() * 6;
    for (let i = 0; i <= 60; i++) {
      const x = -0.6 + (i / 60) * 2.2;
      river.push([x, ry + Math.sin(x * 4 + ph) * amp + x * 0.08]);
    }
    const riverY = (x: number) => ry + Math.sin(x * 4 + ph) * amp + x * 0.08;
    for (let gx = -0.6; gx < 1.6; gx += step)
      for (let gy = -0.6; gy < 1.6; gy += step) {
        const cx = gx + step / 2;
        if (Math.abs(gy + step / 2 - riverY(cx)) < 0.06) continue;
        const k = r();
        if (k < 0.08) parks.push([gx + 0.006, gy + 0.006, step - 0.012, step - 0.012]);
        else blocks.push([gx + 0.008, gy + 0.008, step - 0.016, step - 0.016, k]);
      }
    const major: number[][] = [];
    for (const off of [0.07 + r() * 0.1, 0.5 + r() * 0.12, 0.92]) major.push([-0.6, off, 1.6, off + (r() - 0.5) * 0.1]);
    for (const off of [0.12 + r() * 0.1, 0.55 + r() * 0.1]) major.push([off, -0.6, off + (r() - 0.5) * 0.12, 1.6]);
    const minor: number[][] = [];
    for (let g = -0.6; g < 1.6; g += step) {
      minor.push([g, -0.6, g, 1.6]);
      minor.push([-0.6, g, 1.6, g]);
    }
    const w = { blocks, major, minor, river, parks };
    worlds.set(seed, w);
    return w;
  };
  type Cam = { x: number; y: number; z: number };
  type Opt = { fg: string; bg: string; ac: string; ac2: string; font: string };
  /** 世界座標 → 螢幕座標 */
  const projector = (W: number, H: number, cam: Cam) => {
    const k = Math.max(W, H) * cam.z;
    return { k, P: (x: number, y: number) => [W / 2 + (x - cam.x) * k, H / 2 + (y - cam.y) * k] };
  };
  const STYLES: Record<string, { land: string; block: string; block2: string; road: string; casing: string; water: string; park: string }> = {
    normal: { land: '#efe9dd', block: '#e3dccb', block2: '#d9d1bd', road: '#ffffff', casing: '#cbc2ad', water: '#9fd3f2', park: '#cfe6b8' },
    old: { land: '#e8dcc0', block: '#dccca6', block2: '#d6c49c', road: '#f3ead6', casing: '#b9a682', water: '#b7cfc4', park: '#c9d3a5' },
    dark: { land: '#1c2533', block: '#253042', block2: '#2b3850', road: '#3a4860', casing: '#151c27', water: '#16324a', park: '#1f3a33' },
  };
  /** 在目前的變換下用世界座標畫底圖（不鋪底色） */
  const drawWorld = (x: CanvasRenderingContext2D, seed: number, style = 'normal', density = 1) => {
    const S = STYLES[style] ?? STYLES.normal, w = world(seed);
    x.fillStyle = S.park;
    for (const p of w.parks) x.fillRect(p[0], p[1], p[2], p[3]);
    for (const b of w.blocks) {
      if (b[4] > density) continue;
      x.fillStyle = b[4] < 0.4 ? S.block : S.block2;
      x.fillRect(b[0], b[1], b[2], b[3]);
    }
    x.strokeStyle = S.road;
    x.lineWidth = 0.008;
    x.beginPath();
    for (const l of w.minor) {
      x.moveTo(l[0], l[1]);
      x.lineTo(l[2], l[3]);
    }
    x.stroke();
    x.lineCap = 'round';
    x.lineJoin = 'round';
    x.beginPath();
    w.river.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
    x.strokeStyle = S.water;
    x.lineWidth = 0.075;
    x.stroke();
    for (const [lw, col] of [[0.026, S.casing], [0.018, S.road]] as [number, string][]) {
      x.beginPath();
      for (const l of w.major) {
        x.moveTo(l[0], l[1]);
        x.lineTo(l[2], l[3]);
      }
      x.strokeStyle = col;
      x.lineWidth = lw;
      x.stroke();
    }
  };
  const drawBase = (x: CanvasRenderingContext2D, W: number, H: number, cam: Cam, seed: number, style = 'normal', density = 1) => {
    const { k } = projector(W, H, cam);
    x.save();
    x.fillStyle = (STYLES[style] ?? STYLES.normal).land;
    x.fillRect(0, 0, W, H);
    x.translate(W / 2 - cam.x * k, H / 2 - cam.y * k);
    x.scale(k, k);
    drawWorld(x, seed, style, density);
    x.restore();
  };

  /* ───────── 共用小元件 ───────── */
  const fontOf = (o: Opt, px: number, wt = 900) => `${wt} ${Math.round(px)}px ${o.font || '"Chiron Hei HK","Noto Sans TC",sans-serif'}`;
  const label = (x: CanvasRenderingContext2D, X: number, Y: number, text: string, px: number, o: Opt, bg = INK, fg = '#ffffff', a = 1, anchor: 'up' | 'center' | 'left' = 'up') => {
    if (!text || a <= 0) return;
    px *= 1.3;
    x.save();
    x.globalAlpha = clamp(a);
    x.font = fontOf(o, px);
    const w = x.measureText(text).width + px * 1.1, h = px * 1.7;
    const lx = anchor === 'left' ? X : X - w / 2, ly = anchor === 'up' ? Y - h - px * 0.6 : Y - h / 2;
    x.beginPath();
    x.roundRect(lx, ly, w, h, h * 0.3);
    x.fillStyle = bg;
    x.fill();
    if (anchor === 'up') {
      x.beginPath();
      x.moveTo(X - px * 0.4, ly + h);
      x.lineTo(X + px * 0.4, ly + h);
      x.lineTo(X, ly + h + px * 0.5);
      x.fill();
    }
    x.fillStyle = fg;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(text, lx + w / 2, ly + h / 2 + px * 0.05);
    x.restore();
  };
  const pin = (x: CanvasRenderingContext2D, X: number, Y: number, r: number, c: string, s = 1, inner = '#ffffff') => {
    if (s <= 0) return;
    x.save();
    x.translate(X, Y);
    x.scale(s, s);
    x.beginPath();
    x.moveTo(0, 0);
    x.bezierCurveTo(-r * 0.2, -r * 0.7, -r, -r * 1.2, -r, -r * 1.9);
    x.arc(0, -r * 1.9, r, Math.PI, 0);
    x.bezierCurveTo(r, -r * 1.2, r * 0.2, -r * 0.7, 0, 0);
    x.fillStyle = c;
    x.fill();
    x.beginPath();
    x.arc(0, -r * 1.9, r * 0.42, 0, TAU);
    x.fillStyle = inner;
    x.fill();
    x.restore();
  };
  const dot = (x: CanvasRenderingContext2D, X: number, Y: number, r: number, c: string) => {
    x.beginPath();
    x.arc(X, Y, Math.max(0, r), 0, TAU);
    x.fillStyle = c;
    x.fill();
  };
  const polyPath = (x: CanvasRenderingContext2D, pts: number[][]) => {
    x.beginPath();
    pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
    x.closePath();
  };
  const title = (x: CanvasRenderingContext2D, W: number, H: number, text: string, o: Opt, a = 1) => {
    if (!text) return;
    const u = Math.min(W, H);
    x.save();
    x.globalAlpha = clamp(a);
    x.font = fontOf(o, u * 0.068);
    const w = x.measureText(text).width + u * 0.06;
    x.fillStyle = INK;
    x.beginPath();
    x.roundRect(u * 0.05, u * 0.05, w, u * 0.11, u * 0.02);
    x.fill();
    x.fillStyle = '#ffffff';
    x.textAlign = 'left';
    x.textBaseline = 'middle';
    x.fillText(text, u * 0.08, u * 0.105);
    x.restore();
  };
  const note = (x: CanvasRenderingContext2D, W: number, H: number, text: string, o: Opt, fg = INK) => {
    const u = Math.min(W, H);
    x.save();
    x.font = fontOf(o, u * 0.03, 500);
    x.textAlign = 'right';
    x.textBaseline = 'alphabetic';
    x.fillStyle = rgba(fg, 0.72);
    x.fillText(text, W - u * 0.04, H - u * 0.035);
    x.restore();
  };
  /** 在可視範圍中央附近挑 n 個不重疊的點（世界座標） */
  const spots = (n: number, seed: number, spread = 0.17) => {
    const r = rng(seed), out: number[][] = [];
    let guard = 0;
    while (out.length < n && guard++ < 400) {
      const a = r() * TAU, d = spread * (0.35 + r() * 0.65), p = [0.5 + Math.cos(a) * d, 0.5 + Math.sin(a) * d];
      if (out.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > spread * 0.55)) out.push(p);
    }
    return out;
  };
  /** 拼接的不規則行政區：網格頂點抖動，共用頂點所以剛好拼滿 */
  const regions = (n: number, seed: number, W = 1, H = 1, cam: Cam = { x: 0.5, y: 0.5, z: 1 }) => {
    // 拼塊放在畫面可視範圍內：直式窄而高、橫式寬而矮
    const k = Math.max(W, H) * cam.z, hx = W / (2 * k), hy = H / (2 * k), port = H > W;
    const cols = port ? (n <= 4 ? 2 : n <= 9 ? 3 : 3) : n <= 4 ? 2 : n <= 6 ? 3 : n <= 9 ? 3 : 4, rows = Math.ceil(n / cols), r = rng(seed + 3);
    const w = hx * 1.7, h = Math.min(hy * 1.5, port ? hy * 1.3 : hy * 1.6), x0 = cam.x - w / 2, y0 = cam.y - h / 2 + (port ? hy * 0.05 : 0.02), V: number[][][] = [];
    for (let i = 0; i <= cols; i++) {
      V[i] = [];
      for (let j = 0; j <= rows; j++) {
        const edge = i === 0 || j === 0 || i === cols || j === rows;
        V[i][j] = [x0 + (w * i) / cols + (r() - 0.5) * (edge ? 0.02 : 0.06), y0 + (h * j) / rows + (r() - 0.5) * (edge ? 0.02 : 0.06)];
      }
    }
    const out: { pts: number[][]; c: number[] }[] = [];
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        if (out.length >= n) break;
        const pts = [V[i][j], V[i + 1][j], V[i + 1][j + 1], V[i][j + 1]];
        out.push({ pts, c: [pts.reduce((a, p) => a + p[0], 0) / 4, pts.reduce((a, p) => a + p[1], 0) / 4] });
      }
    return out;
  };
  /** 「區名 數值」資料列，支援 @title、@unit */
  const parseData = (w: string[]) => {
    let head = '', unit = '';
    const rows: { n: string; v: number; raw: string }[] = [];
    for (const l of w) {
      const s = l.trim();
      if (/^@title\s+/i.test(s)) head = s.replace(/^@title\s+/i, '');
      else if (/^@unit\s+/i.test(s)) unit = s.replace(/^@unit\s+/i, '');
      else {
        const m = /^(.*?)\s*(-?\d[\d,]*(?:\.\d+)?)\s*$/.exec(s);
        if (m) rows.push({ n: m[1], v: Number(m[2].replace(/,/g, '')), raw: m[2] });
      }
    }
    return { head, unit, rows: rows.slice(0, 12) };
  };

  /* ───────── 1 台灣定位開場 ───────── */
  const TW = [[121.53, 25.3], [121.75, 25.15], [122.0, 25.01], [121.83, 24.75], [121.86, 24.6], [121.62, 23.98], [121.4, 23.1], [121.15, 22.75], [120.9, 22.35], [120.85, 21.9], [120.74, 21.93], [120.58, 22.35], [120.27, 22.6], [120.12, 23.0], [120.15, 23.45], [120.4, 24.05], [120.53, 24.3], [120.75, 24.62], [120.92, 24.85], [121.1, 25.05], [121.4, 25.18]];
  // 縣市大略中心（經緯度），只用來決定推近的位置
  const COUNTY: Record<string, number[]> = { 台北市: [121.56, 25.05], 臺北市: [121.56, 25.05], 新北市: [121.55, 24.98], 基隆市: [121.73, 25.12], 桃園市: [121.25, 24.93], 新竹市: [120.97, 24.8], 新竹縣: [121.12, 24.72], 苗栗縣: [120.88, 24.5], 台中市: [120.72, 24.17], 臺中市: [120.72, 24.17], 彰化縣: [120.5, 23.99], 南投縣: [120.95, 23.85], 雲林縣: [120.42, 23.7], 嘉義市: [120.45, 23.48], 嘉義縣: [120.55, 23.43], 台南市: [120.3, 23.1], 臺南市: [120.3, 23.1], 高雄市: [120.45, 22.85], 屏東縣: [120.6, 22.55], 宜蘭縣: [121.7, 24.65], 花蓮縣: [121.45, 23.85], 台東縣: [121.08, 22.9], 臺東縣: [121.08, 22.9] };
  const taiwan = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const [county = '新北市', place = '林口區'] = w;
    const target = COUNTY[county.trim()] ?? COUNTY[Object.keys(COUNTY).find((k) => county.includes(k.slice(0, 2))) ?? ''] ?? [121.0, 23.7];
    const u = Math.min(W, H);
    const zIn = inout(seg(t, L * 0.45, L * 0.75));
    if (zIn >= 1) {
      // 推近到底：換成城市底圖＋定位針
      drawBase(x, W, H, { x: 0.5, y: 0.5, z: 1 + (t - L * 0.75) * 0.03 }, hash(place));
      const p = [W / 2, H / 2 + u * 0.08];
      pin(x, p[0], p[1], u * 0.035, o.ac, back(seg(t, L * 0.76, L * 0.84)));
      label(x, p[0], p[1] - u * 0.11, place, u * 0.05, o, INK, '#ffffff', seg(t, L * 0.8, L * 0.88));
      label(x, W / 2, u * 0.12, county, u * 0.036, o, o.ac, '#ffffff', 1, 'center');
      return;
    }
    x.fillStyle = '#163a5c';
    x.fillRect(0, 0, W, H);
    // 台灣全圖 → 縣市位置推近
    const span0 = 4.2, span1 = 1.3, span = span0 * Math.pow(span1 / span0, zIn);
    const cxl = 121 + (target[0] - 121) * zIn, cyl = 23.65 + (target[1] - 23.65) * zIn;
    const k = u / span;
    const P = (lon: number, lat: number) => [W / 2 + (lon - cxl) * 0.917 * k, H / 2 - (lat - cyl) * k];
    const pop = back(seg(t, 0, L * 0.15));
    x.save();
    x.translate(W / 2, H / 2);
    x.scale(pop, pop);
    x.translate(-W / 2, -H / 2);
    polyPath(x, TW.map(([a, b]) => P(a, b)));
    x.fillStyle = '#e9e1cc';
    x.fill();
    x.lineWidth = u * 0.006;
    x.strokeStyle = '#ffffff';
    x.stroke();
    x.restore();
    const hl = seg(t, L * 0.18, L * 0.3);
    if (hl > 0) {
      const [X, Y] = P(target[0], target[1]);
      const pulse = (t * 1.6) % 1;
      x.beginPath();
      x.arc(X, Y, u * (0.03 + pulse * 0.08), 0, TAU);
      x.strokeStyle = rgba(o.ac, 1 - pulse);
      x.lineWidth = u * 0.008;
      x.stroke();
      dot(x, X, Y, u * 0.022 * back(hl), o.ac);
      label(x, X, Y - u * 0.02, county, u * 0.045, o, INK, '#ffffff', hl);
    }
  };

  /* ───────── 2 兩區對照 ───────── */
  const split = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const sides = [w[0] ?? 'A 區｜通勤快｜房價高', w[1] ?? 'B 區｜生活新｜通勤遠'].map((s) => s.split(/[｜|]/).map((v) => v.trim()).filter(Boolean));
    const u = Math.min(W, H), port = H > W;
    for (let i = 0; i < 2; i++) {
      const open = inout(seg(t, i * 0.1, L * 0.2 + i * 0.1));
      x.save();
      const rx = port ? 0 : (W / 2) * i, ry = port ? (H / 2) * i : 0, rw = port ? W : W / 2, rh = port ? H / 2 : H;
      x.beginPath();
      if (port) x.rect(rx, ry + (i ? (1 - open) * rh : 0), rw, rh * open);
      else x.rect(rx + (i ? (1 - open) * rw : 0), ry, rw * open, rh);
      x.clip();
      x.translate(rx, ry);
      drawBase(x, rw, rh, { x: 0.5, y: 0.5, z: 1.2 + t * 0.02 }, hash(sides[i][0] ?? String(i)) + i * 13);
      x.fillStyle = rgba(i ? o.ac2 : o.ac, 0.14);
      x.fillRect(0, 0, rw, rh);
      const px = rw / 2, py = rh * 0.56;
      pin(x, px, py, u * 0.03, i ? o.ac2 : o.ac, back(seg(t, L * 0.25 + i * 0.1, L * 0.35 + i * 0.1)));
      label(x, px, py - u * 0.09, sides[i][0] ?? '', u * 0.05, o, INK, '#ffffff', seg(t, L * 0.3 + i * 0.1, L * 0.38 + i * 0.1));
      (sides[i].slice(1, 3)).forEach((s, k) => label(x, px, py + u * (0.07 + k * 0.075), `${i ? '・' : '・'}${s}`, u * 0.036, o, '#ffffff', INK, seg(t, L * (0.42 + k * 0.08 + i * 0.04), L * (0.5 + k * 0.08 + i * 0.04)), 'center'));
      x.restore();
    }
    x.fillStyle = INK;
    if (port) x.fillRect(0, H / 2 - u * 0.006, W, u * 0.012);
    else x.fillRect(W / 2 - u * 0.006, 0, u * 0.012, H);
    const vs = back(seg(t, L * 0.3, L * 0.4));
    if (vs > 0) {
      dot(x, W / 2, H / 2, u * 0.075 * vs, INK);
      dot(x, W / 2, H / 2, u * 0.062 * vs, o.ac);
      x.fillStyle = '#ffffff';
      x.font = fontOf(o, u * 0.055 * vs);
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('VS', W / 2, H / 2 + u * 0.004);
    }
  };

  /* ───────── 路線沿道路走：從 a 到 b 走 L 形或 Z 形 ───────── */
  const routeOf = (a: number[], b: number[], kind: number) => {
    if (kind === 0) return [a, [b[0], a[1]], b];
    if (kind === 1) return [a, [a[0], b[1]], b];
    const mx = (a[0] + b[0]) / 2;
    return [a, [mx, a[1]], [mx, b[1]], b];
  };
  const along = (pts: number[][], f: number) => {
    const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    const total = lens.reduce((s, v) => s + v, 0);
    let d = clamp(f) * total;
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i] || i === lens.length - 1) {
        const k = lens[i] ? d / lens[i] : 0;
        return { p: [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k], i };
      }
      d -= lens[i];
    }
    return { p: pts[pts.length - 1], i: lens.length - 1 };
  };
  const strokePart = (x: CanvasRenderingContext2D, pts: number[][], f: number, P: (a: number, b: number) => number[], lw: number, c: string, dash: number[] = []) => {
    if (f <= 0) return;
    const end = along(pts, f);
    x.beginPath();
    const s = P(pts[0][0], pts[0][1]);
    x.moveTo(s[0], s[1]);
    for (let i = 1; i <= end.i; i++) {
      const q = P(pts[i][0], pts[i][1]);
      x.lineTo(q[0], q[1]);
    }
    const e = P(end.p[0], end.p[1]);
    x.lineTo(e[0], e[1]);
    x.setLineDash(dash);
    x.lineWidth = lw;
    x.lineCap = 'round';
    x.lineJoin = 'round';
    x.strokeStyle = c;
    x.stroke();
    x.setLineDash([]);
  };

  /* ───────── 3 通勤路線賽跑 ───────── */
  const race = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const [from = '家', to = '公司', r1 = '開車 35', r2 = '捷運 28'] = w;
    const parse = (s: string) => {
      const m = /^(.*?)\s*(\d+(?:\.\d+)?)\s*(分鐘|分)?\s*$/.exec(s.trim());
      return { n: m ? m[1] : s, m: m ? Number(m[2]) : 30 };
    };
    const R = [parse(r1), parse(r2)], cam = { x: 0.5, y: 0.5, z: 1.05 }, { P } = projector(W, H, cam), u = Math.min(W, H);
    drawBase(x, W, H, cam, 5);
    const a = [0.36, 0.66], b = [0.64, 0.34];
    const paths = [routeOf(a, b, 0), routeOf(a, b, 2)], cols = [o.ac, o.ac2 === o.ac ? '#2f6db5' : o.ac2];
    const slow = Math.max(R[0].m, R[1].m), run = L * 0.62, t0 = L * 0.12;
    paths.forEach((pts, i) => {
      strokePart(x, pts, 1, P, u * 0.026, '#ffffff');
      const f = clamp((t - t0) / (run * (R[i].m / slow)));
      strokePart(x, pts, f, P, u * 0.016, cols[i]);
      const head = along(pts, f).p, [X, Y] = P(head[0], head[1]);
      dot(x, X, Y, u * 0.022, '#ffffff');
      dot(x, X, Y, u * 0.016, cols[i]);
      const mins = Math.round(R[i].m * f);
      label(x, X, Y - u * 0.02, `${R[i].n} ${mins} 分`, u * 0.036, o, cols[i], '#ffffff', seg(t, t0, t0 + 0.3));
      if (f >= 1 && R[i].m <= Math.min(R[0].m, R[1].m)) label(x, X + u * 0.12, Y + u * 0.06, '先到！', u * 0.04, o, INK, '#ffd23f', seg(t, t0 + run * (R[i].m / slow), t0 + run * (R[i].m / slow) + 0.25), 'center');
    });
    const A = P(a[0], a[1]), B = P(b[0], b[1]);
    pin(x, A[0], A[1], u * 0.026, INK, back(seg(t, 0, L * 0.08)));
    pin(x, B[0], B[1], u * 0.026, INK, back(seg(t, L * 0.04, L * 0.12)));
    label(x, A[0], A[1] + u * 0.07, from, u * 0.04, o, '#ffffff', INK, seg(t, 0.1, 0.4), 'center');
    label(x, B[0], B[1] - u * 0.06, to, u * 0.04, o, '#ffffff', INK, seg(t, 0.2, 0.5));
    note(x, W, H, '時間請以實測為準', o);
  };

  /* ───────── 4 看屋行程串連 ───────── */
  const tour = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const names = (w.length ? w : ['社區大門', '超市', '公園', '捷運站']).slice(0, 6), n = names.length;
    const pts = spots(n, hash(names.join('')) + 4, 0.2).sort((p, q) => p[0] - q[0]);
    const cam = { x: 0.5, y: 0.5, z: 1.05 }, { P } = projector(W, H, cam), u = Math.min(W, H);
    drawBase(x, W, H, cam, 9);
    const per = (L * 0.8) / n;
    for (let i = 0; i < n; i++) {
      const tt = L * 0.05 + per * i;
      if (i) strokePart(x, routeOf(pts[i - 1], pts[i], i % 2), seg(t, tt - per * 0.6, tt), P, u * 0.012, o.ac, [u * 0.025, u * 0.018]);
    }
    for (let i = 0; i < n; i++) {
      const tt = L * 0.05 + per * i, s = back(seg(t, tt, tt + 0.35)), [X, Y] = P(pts[i][0], pts[i][1]);
      if (s <= 0) continue;
      dot(x, X, Y, u * 0.04 * s, INK);
      dot(x, X, Y, u * 0.032 * s, i === n - 1 ? o.ac : '#ffffff');
      x.fillStyle = i === n - 1 ? '#ffffff' : INK;
      x.font = fontOf(o, u * 0.04 * s);
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(String(i + 1), X, Y + u * 0.002);
      label(x, X, Y - u * 0.04, names[i], u * 0.038, o, INK, '#ffffff', seg(t, tt + 0.1, tt + 0.4));
    }
  };

  /* ───────── 5 聚光燈導覽 ───────── */
  const spot = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const names = (w.length ? w : ['基地', '國小', '公園', '捷運站']).slice(0, 6), n = names.length;
    const pts = spots(n, hash(names.join('')) + 8, 0.2);
    const cam = { x: 0.5, y: 0.5, z: 1.05 }, { P } = projector(W, H, cam), u = Math.min(W, H);
    drawBase(x, W, H, cam, 21);
    const per = L / n, k = Math.min(n - 1, Math.floor(t / per)), f = inout(seg(t - k * per, 0, per * 0.35));
    const a = P(pts[Math.max(0, k - 1)][0], pts[Math.max(0, k - 1)][1]), b = P(pts[k][0], pts[k][1]);
    const X = k ? a[0] + (b[0] - a[0]) * f : b[0], Y = k ? a[1] + (b[1] - a[1]) * f : b[1], R = u * (0.2 + 0.02 * Math.sin(t * 3));
    x.save();
    x.beginPath();
    x.rect(0, 0, W, H);
    x.arc(X, Y, R, 0, TAU, true);
    x.fillStyle = 'rgba(12,16,24,.72)';
    x.fill();
    x.beginPath();
    x.arc(X, Y, R, 0, TAU);
    x.lineWidth = u * 0.008;
    x.strokeStyle = o.ac;
    x.stroke();
    x.restore();
    pin(x, b[0], b[1] + u * 0.03, u * 0.024, o.ac, back(seg(t - k * per, per * 0.3, per * 0.45)));
    label(x, b[0], b[1] - R - u * 0.01, `${k + 1}. ${names[k]}`, u * 0.045, o, '#ffffff', INK, seg(t - k * per, per * 0.35, per * 0.5));
  };

  /* ───────── 6 重劃區分期 ───────── */
  const PAL = (o: Opt) => [o.ac, o.ac2, '#2f9e6f', '#2f6db5', '#8e44ad', '#e67e22', '#16a085', '#c0392b'];
  const legend = (x: CanvasRenderingContext2D, W: number, H: number, items: { c: string; n: string; a: number }[], o: Opt) => {
    const u = Math.min(W, H), px = u * 0.046, rowH = px * 1.6, h = items.length * rowH + px, y0 = H - h - u * 0.07;
    x.save();
    x.font = fontOf(o, px, 700);
    const w = Math.max(...items.map((i) => x.measureText(i.n).width)) + px * 2.6;
    // 橫式畫面圖例放右上，避開左下的區塊
    const lx = W > H ? W - w - u * 0.05 : u * 0.05, ly = W > H ? u * 0.05 : y0;
    x.translate(lx - u * 0.05, ly - y0);
    x.globalAlpha = clamp(Math.max(...items.map((i) => i.a)) * 1.5);
    x.fillStyle = 'rgba(255,255,255,.92)';
    x.beginPath();
    x.roundRect(u * 0.05, y0, w, h, px * 0.4);
    x.fill();
    items.forEach((it, i) => {
      x.globalAlpha = clamp(it.a);
      x.fillStyle = it.c;
      x.fillRect(u * 0.05 + px * 0.5, y0 + px * 0.5 + i * rowH + px * 0.15, px, px);
      x.fillStyle = INK;
      x.textAlign = 'left';
      x.textBaseline = 'middle';
      x.fillText(it.n, u * 0.05 + px * 1.9, y0 + px * 0.5 + i * rowH + px * 0.65);
    });
    x.restore();
  };
  const fillRegion = (x: CanvasRenderingContext2D, pts: number[][], P: (a: number, b: number) => number[], c: string, a: number, line = '#ffffff', lw = 2) => {
    polyPath(x, pts.map(([p, q]) => P(p, q)));
    x.fillStyle = rgba(c, a);
    x.fill();
    x.strokeStyle = line;
    x.lineWidth = lw;
    x.stroke();
  };
  const phase = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const items = (w.length ? w : ['一期 2016', '二期 2020', '三期 2024（規劃）']).slice(0, 6), n = items.length;
    const cam = { x: 0.5, y: 0.52, z: 1.15 }, regs = regions(n, 7, W, H, cam), { P } = projector(W, H, cam), u = Math.min(W, H), cols = PAL(o);
    drawBase(x, W, H, cam, 31);
    regs.forEach((r, i) => {
      const a = seg(t, L * (0.08 + i * 0.14), L * (0.2 + i * 0.14)), planned = /規劃|預計|未來/.test(items[i]);
      if (a <= 0) return;
      fillRegion(x, r.pts, P, cols[i % cols.length], 0.55 * a, '#ffffff', u * 0.006);
      if (planned) {
        polyPath(x, r.pts.map(([p, q]) => P(p, q)));
        x.setLineDash([u * 0.02, u * 0.014]);
        x.strokeStyle = INK;
        x.lineWidth = u * 0.006;
        x.stroke();
        x.setLineDash([]);
      }
      const [X, Y] = P(r.c[0], r.c[1]);
      label(x, X, Y, items[i].split(/\s+/)[0], u * 0.042, o, INK, '#ffffff', a, 'center');
    });
    legend(x, W, H, items.map((s, i) => ({ c: cols[i % cols.length], n: s, a: seg(t, L * (0.1 + i * 0.14), L * (0.22 + i * 0.14)) })), o);
    note(x, W, H, '範圍為示意，以公告圖為準', o);
  };

  /* ───────── 7 重大建設預告 ───────── */
  const future = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const items = (w.length ? w : ['捷運 環狀線北環段 2030', '道路 快速道路延伸 2028', '公園 中央公園 2027']).slice(0, 5);
    const cam = { x: 0.5, y: 0.5, z: 1.05 }, { P } = projector(W, H, cam), u = Math.min(W, H);
    drawBase(x, W, H, cam, 41);
    const on = seg(t, L * 0.15, L * 0.25);
    // 上方切換：現況 → 完工後
    const tw = u * 0.42, tx = W / 2 - tw / 2, ty = u * 0.05;
    x.fillStyle = INK;
    x.beginPath();
    x.roundRect(tx, ty, tw, u * 0.08, u * 0.04);
    x.fill();
    x.fillStyle = o.ac;
    x.beginPath();
    x.roundRect(tx + u * 0.006 + (tw / 2) * ease(on), ty + u * 0.006, tw / 2 - u * 0.012, u * 0.068, u * 0.034);
    x.fill();
    x.font = fontOf(o, u * 0.034);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillStyle = '#ffffff';
    x.fillText('現況', tx + tw * 0.25, ty + u * 0.04);
    x.fillText('完工後', tx + tw * 0.75, ty + u * 0.04);
    const r = rng(hash(items.join('')));
    items.forEach((it, i) => {
      const [kind, ...rest] = it.trim().split(/\s+/), year = /\d{4}/.test(rest[rest.length - 1] ?? '') ? rest.pop()! : '', name = rest.join(' ') || kind;
      const a = seg(t, L * (0.28 + i * 0.13), L * (0.42 + i * 0.13));
      if (a <= 0) return;
      const yy = 0.36 + i * 0.12 + (r() - 0.5) * 0.04;
      let anchor: number[];
      if (/公園|綠地|廣場/.test(kind)) {
        const c = [0.42 + r() * 0.16, yy], s = 0.07;
        const pts = [[c[0] - s, c[1] - s * 0.7], [c[0] + s, c[1] - s * 0.7], [c[0] + s, c[1] + s * 0.7], [c[0] - s, c[1] + s * 0.7]];
        fillRegion(x, pts, P, '#2f9e6f', 0.5 * a, '#2f9e6f', u * 0.006);
        anchor = P(c[0], c[1] - s * 0.7);
      } else {
        const rail = /捷運|輕軌|鐵路|高鐵/.test(kind), pts = [[0.2, yy + 0.05], [0.4, yy - 0.02], [0.6, yy + 0.03], [0.82, yy - 0.04]];
        strokePart(x, pts, a, P, u * (rail ? 0.016 : 0.022), rail ? o.ac : '#7f8c8d', [u * 0.03, u * 0.018]);
        if (rail)
          for (let k = 1; k < 3; k++) {
            const st = along(pts, k / 3);
            if (k / 3 <= a) {
              const [X, Y] = P(st.p[0], st.p[1]);
              dot(x, X, Y, u * 0.016, '#ffffff');
              dot(x, X, Y, u * 0.009, o.ac);
            }
          }
        anchor = P(...(along(pts, Math.min(a, 0.7)).p as [number, number]));
      }
      label(x, anchor[0], anchor[1], `${name}${year ? ` · ${year}` : ''}`, u * 0.036, o, INK, '#ffffff', seg(t, L * (0.32 + i * 0.13), L * (0.44 + i * 0.13)));
    });
    note(x, W, H, '規劃中（示意），時程以主管機關公告為準', o);
  };

  /* ───────── 8 土地使用分區 ───────── */
  const zoning = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const names = (w.length ? w : ['住宅區', '商業區', '工業區', '公園綠地', '學校用地']).slice(0, 6);
    const zc = (n: string, i: number) => (/住宅/.test(n) ? '#f6c85f' : /商業/.test(n) ? '#e15759' : /工業/.test(n) ? '#9c755f' : /公園|綠|保護/.test(n) ? '#59a14f' : /學校|文教/.test(n) ? '#4e79a7' : /河|水/.test(n) ? '#76b7b2' : PAL(o)[i % 8]);
    const cam = { x: 0.5, y: 0.52, z: 1.15 }, regs = regions(9, 17, W, H, cam), { P } = projector(W, H, cam), u = Math.min(W, H);
    drawBase(x, W, H, cam, 51);
    regs.forEach((r, i) => {
      const k = (i * 7 + 3) % names.length, a = seg(t, L * (0.1 + k * 0.12), L * (0.22 + k * 0.12));
      if (a > 0) fillRegion(x, r.pts, P, zc(names[k], k), 0.62 * a, '#ffffff', u * 0.005);
    });
    legend(x, W, H, names.map((n, i) => ({ c: zc(n, i), n, a: seg(t, L * (0.1 + i * 0.12), L * (0.2 + i * 0.12)) })), o);
    note(x, W, H, '分區為示意，以都市計畫書圖為準', o);
  };

  /* ───────── 9 基地地籍 ───────── */
  const parcel = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const [name = '本案基地', info = '約 1,200 坪（示意）'] = w;
    const cam = { x: 0.5, y: 0.5, z: 1.5 + t * 0.03 }, { P } = projector(W, H, cam), u = Math.min(W, H);
    drawBase(x, W, H, cam, 61);
    // 地籍線：細格線逐條畫出
    const r = rng(5), lines: number[][][] = [];
    for (let i = 0; i < 9; i++) lines.push([[0.3 + i * 0.05 + (r() - 0.5) * 0.01, 0.3], [0.3 + i * 0.05 + (r() - 0.5) * 0.01, 0.7]]);
    for (let j = 0; j < 9; j++) lines.push([[0.3, 0.3 + j * 0.05 + (r() - 0.5) * 0.01], [0.7, 0.3 + j * 0.05 + (r() - 0.5) * 0.01]]);
    lines.forEach((l, i) => strokePart(x, l, seg(t, i * 0.05, 0.6 + i * 0.05), P, Math.max(1, u * 0.003), 'rgba(29,36,51,.55)'));
    const site = [[0.4, 0.4], [0.55, 0.39], [0.56, 0.52], [0.45, 0.56], [0.39, 0.5]];
    const a = seg(t, L * 0.4, L * 0.55);
    if (a > 0) {
      fillRegion(x, site, P, o.ac, 0.45 * a, o.ac, u * 0.008);
      const pulse = (t * 1.2) % 1;
      polyPath(x, site.map(([p, q]) => P(p + (p - 0.48) * pulse * 0.4, q + (q - 0.47) * pulse * 0.4)));
      x.strokeStyle = rgba(o.ac, (1 - pulse) * a);
      x.lineWidth = u * 0.005;
      x.stroke();
      const [X, Y] = P(0.48, 0.39);
      label(x, X, Y, name, u * 0.048, o, INK, '#ffffff', a);
      const [X2, Y2] = P(0.48, 0.58);
      label(x, X2, Y2 + u * 0.04, info, u * 0.036, o, '#ffffff', INK, seg(t, L * 0.55, L * 0.65), 'center');
    }
    note(x, W, H, '地籍線為示意，以地政機關資料為準', o);
  };

  /* ───────── 10–12 數據地圖 ───────── */
  const dataMap = (kind: 'choro' | 'bubble' | 'bars') => (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const d = parseData(w.length ? w : ['@title 各區數值（示意）', '@unit 萬/坪', 'A 區 58', 'B 區 72', 'C 區 45', 'D 區 66', 'E 區 39', 'F 區 81']);
    const n = Math.max(1, d.rows.length), regs = regions(n, 23, W, H, kind === 'bars' ? { x: 0.5, y: 0.52, z: 1.3 } : { x: 0.5, y: 0.52, z: 1.15 }), u = Math.min(W, H);
    const vmax = Math.max(...d.rows.map((r) => r.v), 1), vmin = Math.min(...d.rows.map((r) => r.v), 0);
    const fmt = (v: number, raw: string) => (raw.includes('.') ? v.toFixed(raw.split('.')[1].length) : Math.round(v).toLocaleString('en-US'));
    if (kind === 'bars') {
      // 斜視角：底圖壓扁旋轉，長條從各區中心長出
      x.fillStyle = '#efe9dd';
      x.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H * 0.6, sc = Math.max(W, H) * 1.05, rot = -0.55, fl = 0.55;
      const T = (wx: number, wy: number) => {
        const dx = (wx - 0.5) * sc, dy = (wy - 0.52) * sc;
        return [cx + dx * Math.cos(rot) - dy * Math.sin(rot), cy + (dx * Math.sin(rot) + dy * Math.cos(rot)) * fl];
      };
      x.save();
      x.setTransform(Math.cos(rot), Math.sin(rot) * fl, -Math.sin(rot), Math.cos(rot) * fl, cx, cy);
      x.translate(-0.5 * sc, -0.52 * sc);
      x.scale(sc / Math.max(W, H), sc / Math.max(W, H));
      drawBase(x, Math.max(W, H), Math.max(W, H), { x: 0.5, y: 0.5, z: 1 }, 71);
      x.restore();
      const cols = PAL(o);
      const order = d.rows.map((r, i) => ({ r, i, c: regs[i] })).sort((a, b) => T(a.c.c[0], a.c.c[1])[1] - T(b.c.c[0], b.c.c[1])[1]);
      for (const it of order) {
        const [X, Y] = T(it.c.c[0], it.c.c[1]), g = back(seg(t, L * (0.1 + it.i * 0.08), L * (0.3 + it.i * 0.08)));
        const h = Math.min(u * 0.5, H * 0.34) * (it.r.v / vmax) * g, bw = u * 0.055, c = cols[0];
        x.fillStyle = mix(c, '#000000', 0.25);
        x.fillRect(X, Y - h, bw * 0.6, h);
        x.fillStyle = c;
        x.fillRect(X - bw * 0.6, Y - h, bw * 0.6, h);
        x.fillStyle = mix(c, '#ffffff', 0.35);
        polyPath(x, [[X - bw * 0.6, Y - h], [X, Y - h - bw * 0.25], [X + bw * 0.6, Y - h], [X, Y - h + bw * 0.25]]);
        x.fill();
        if (g > 0.5) {
          label(x, X, Y - h - bw * 0.3, `${fmt(it.r.v * Math.min(1, g), it.r.raw)}`, u * 0.034, o, INK, '#ffffff', g);
          x.font = fontOf(o, u * 0.038, 700);
          x.fillStyle = INK;
          x.textAlign = 'center';
          x.textBaseline = 'top';
          x.fillText(it.r.n, X, Y + u * 0.012);
        }
      }
    } else {
      const cam = { x: 0.5, y: 0.52, z: 1.15 }, { P } = projector(W, H, cam);
      drawBase(x, W, H, cam, 71);
      d.rows.forEach((r, i) => {
        const g = regs[i], a = seg(t, L * (0.08 + i * 0.07), L * (0.22 + i * 0.07)), k = (r.v - vmin) / Math.max(1e-6, vmax - vmin);
        if (kind === 'choro') {
          if (a > 0) fillRegion(x, g.pts, P, mix('#fde7d9', o.ac, 0.15 + k * 0.85), 0.92 * a, '#ffffff', u * 0.005);
        } else {
          polyPath(x, g.pts.map(([p, q]) => P(p, q)));
          x.strokeStyle = 'rgba(29,36,51,.35)';
          x.lineWidth = u * 0.003;
          x.stroke();
        }
        const [X, Y] = P(g.c[0], g.c[1]);
        if (kind === 'bubble' && a > 0) {
          const rad = u * 0.1 * Math.sqrt(Math.max(0, r.v) / vmax) * back(a);
          dot(x, X, Y, rad, rgba(o.ac, 0.78));
          x.beginPath();
          x.arc(X, Y, rad, 0, TAU);
          x.strokeStyle = '#ffffff';
          x.lineWidth = u * 0.005;
          x.stroke();
        }
        if (a > 0) {
          x.save();
          x.globalAlpha = a;
          x.textAlign = 'center';
          x.textBaseline = 'middle';
          x.fillStyle = kind === 'choro' && k > 0.55 ? '#ffffff' : INK;
          x.font = fontOf(o, u * 0.04, 700);
          x.fillText(r.n, X, Y - u * 0.03);
          x.font = fontOf(o, u * 0.058);
          x.fillText(fmt(r.v * Math.min(1, a * 1.2), r.raw), X, Y + u * 0.025);
          x.restore();
        }
      });
      if (kind === 'choro') {
        // 色階圖例
        const lw = u * 0.42, lx = W / 2 - lw / 2, ly = H - u * 0.13;
        const gr = x.createLinearGradient(lx, 0, lx + lw, 0);
        gr.addColorStop(0, mix('#fde7d9', o.ac, 0.15));
        gr.addColorStop(1, o.ac);
        x.fillStyle = 'rgba(255,255,255,.92)';
        x.beginPath();
        x.roundRect(lx - u * 0.03, ly - u * 0.025, lw + u * 0.06, u * 0.085, u * 0.015);
        x.fill();
        x.fillStyle = gr;
        x.fillRect(lx, ly, lw, u * 0.022);
        x.font = fontOf(o, u * 0.026, 700);
        x.fillStyle = INK;
        x.textBaseline = 'top';
        x.textAlign = 'left';
        x.fillText(String(vmin), lx, ly + u * 0.028);
        x.textAlign = 'right';
        x.fillText(`${vmax}${d.unit ? ' ' + d.unit : ''}`, lx + lw, ly + u * 0.028);
      }
    }
    title(x, W, H, d.head + (d.head && d.unit && kind !== 'choro' ? `（${d.unit}）` : ''), o, seg(t, 0, 0.4));
    note(x, W, H, '數字請附資料來源與時間', o);
  };

  /* ───────── 13 嫌惡設施影響圈 ───────── */
  const nuisance = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const [fac = '變電所', rad = '300', site = '本案', dist = '450'] = w;
    const R = Number(String(rad).replace(/[^\d.]/g, '')) || 300, D = Number(String(dist).replace(/[^\d.]/g, '')) || R * 1.5;
    const cam = { x: 0.5, y: 0.5, z: 1.05 }, { P, k } = projector(W, H, cam), u = Math.min(W, H);
    drawBase(x, W, H, cam, 81);
    const c = [0.44, 0.48], rr = 0.14, m = rr / R, sp = [c[0] + D * m * 0.8, c[1] - D * m * 0.6];
    const [X, Y] = P(c[0], c[1]), rp = rr * k, g = ease(seg(t, L * 0.12, L * 0.4));
    x.beginPath();
    x.arc(X, Y, rp * g, 0, TAU);
    x.fillStyle = 'rgba(229,57,53,.18)';
    x.fill();
    x.setLineDash([u * 0.02, u * 0.014]);
    x.strokeStyle = '#e53935';
    x.lineWidth = u * 0.006;
    x.stroke();
    x.setLineDash([]);
    for (let i = 0; i < 3; i++) {
      const q = (t * 0.6 + i / 3) % 1;
      x.beginPath();
      x.arc(X, Y, rp * q * g, 0, TAU);
      x.strokeStyle = `rgba(229,57,53,${(1 - q) * 0.7})`;
      x.lineWidth = u * 0.005;
      x.stroke();
    }
    x.fillStyle = '#e53935';
    x.beginPath();
    x.roundRect(X - u * 0.035, Y - u * 0.035, u * 0.07, u * 0.07, u * 0.012);
    x.fill();
    x.fillStyle = '#ffffff';
    x.font = fontOf(o, u * 0.05);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText('!', X, Y + u * 0.003);
    label(x, X, Y - u * 0.04, fac, u * 0.04, o, '#e53935', '#ffffff', seg(t, 0.2, 0.5));
    label(x, X, Y + rp * g + u * 0.035, `影響範圍約 ${R} 公尺`, u * 0.032, o, '#ffffff', '#e53935', seg(t, L * 0.35, L * 0.45), 'center');
    const [SX, SY] = P(sp[0], sp[1]), sa = seg(t, L * 0.45, L * 0.6);
    if (sa > 0) {
      x.setLineDash([u * 0.012, u * 0.01]);
      x.beginPath();
      x.moveTo(X, Y);
      x.lineTo(X + (SX - X) * sa, Y + (SY - Y) * sa);
      x.strokeStyle = INK;
      x.lineWidth = u * 0.004;
      x.stroke();
      x.setLineDash([]);
      pin(x, SX, SY, u * 0.028, o.ac, back(seg(t, L * 0.55, L * 0.65)));
      label(x, SX, SY - u * 0.07, `${site} · 距離約 ${D} 公尺`, u * 0.036, o, INK, '#ffffff', seg(t, L * 0.6, L * 0.7));
      const inside = D <= R;
      label(x, W / 2, H - u * 0.16, inside ? '在影響範圍內' : '在影響範圍外', u * 0.05, o, inside ? '#e53935' : '#2f9e6f', '#ffffff', seg(t, L * 0.7, L * 0.8), 'center');
    }
    note(x, W, H, '影響範圍為示意，請依實際量測與法規判斷', o);
  };

  /* ───────── 14 淹水潛勢示意 ───────── */
  const flood = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const [head = '淹水潛勢（示意）', sc = '24 小時 350mm 情境'] = w;
    const wd = world(91), mid = wd.river.reduce((b, p) => (Math.abs(p[0] - 0.5) < Math.abs(b[0] - 0.5) ? p : b));
    const cam = { x: 0.5, y: mid[1] + 0.04, z: 1.05 }, { P } = projector(W, H, cam), u = Math.min(W, H);
    drawBase(x, W, H, cam, 91);
    // 沿河道兩側往外擴的淹水區：三個深度等級
    const lv = [{ c: '#9ecae1', d: 0.16, n: '0.3–0.5 公尺' }, { c: '#4292c6', d: 0.1, n: '0.5–1 公尺' }, { c: '#08519c', d: 0.05, n: '1 公尺以上' }];
    const grow = ease(seg(t, L * 0.15, L * 0.75));
    lv.forEach((l, i) => {
      const g = clamp(grow * 1.4 - i * 0.2);
      if (g <= 0) return;
      const top = wd.river.map(([a, b]) => P(a, b - l.d * g * (0.8 + 0.4 * Math.sin(a * 9 + i)))), bot = wd.river.map(([a, b]) => P(a, b + l.d * g * 0.7 * (0.8 + 0.4 * Math.cos(a * 7 + i)))).reverse();
      polyPath(x, [...top, ...bot]);
      x.fillStyle = rgba(l.c, 0.72);
      x.fill();
    });
    for (let i = 0; i < 40; i++) {
      const q = (t * 1.5 + i * 0.137) % 1, X = ((i * 53) % 100) / 100 * W, Y = q * H;
      x.beginPath();
      x.moveTo(X, Y);
      x.lineTo(X - u * 0.01, Y + u * 0.035);
      x.strokeStyle = 'rgba(66,146,198,.45)';
      x.lineWidth = u * 0.004;
      x.stroke();
    }
    title(x, W, H, head, o, seg(t, 0, 0.4));
    label(x, W / 2, u * 0.21, sc, u * 0.034, o, '#ffffff', INK, seg(t, 0.3, 0.7), 'center');
    legend(x, W, H, lv.map((l, i) => ({ c: l.c, n: l.n, a: seg(t, L * (0.3 + i * 0.12), L * (0.4 + i * 0.12)) })), o);
    note(x, W, H, '示意圖，實際以官方淹水潛勢圖為準', o);
  };

  /* ───────── 15 學區範圍 ───────── */
  const school = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const [sch = '某某國小', site = '本案', verdict = '學區內'] = w;
    const cam = { x: 0.5, y: 0.5, z: 1.05 }, { P } = projector(W, H, cam), u = Math.min(W, H);
    drawBase(x, W, H, cam, 101);
    const r = rng(hash(sch)), c = [0.47, 0.5], border: number[][] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU, d = 0.16 + r() * 0.06;
      border.push([c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d * 0.9]);
    }
    border.push(border[0]);
    const g = seg(t, L * 0.15, L * 0.5);
    if (g >= 1) fillRegion(x, border.slice(0, -1), P, '#4e79a7', 0.18 * seg(t, L * 0.5, L * 0.6), '#4e79a7', 0);
    strokePart(x, border, g, P, u * 0.008, '#4e79a7', [u * 0.022, u * 0.014]);
    const [X, Y] = P(c[0], c[1]);
    x.fillStyle = '#4e79a7';
    x.beginPath();
    x.roundRect(X - u * 0.04, Y - u * 0.03, u * 0.08, u * 0.06, u * 0.01);
    x.fill();
    x.beginPath();
    x.moveTo(X - u * 0.05, Y - u * 0.03);
    x.lineTo(X, Y - u * 0.07);
    x.lineTo(X + u * 0.05, Y - u * 0.03);
    x.fill();
    label(x, X, Y - u * 0.075, sch, u * 0.04, o, '#4e79a7', '#ffffff', seg(t, 0.1, 0.5));
    const sp = P(c[0] + 0.09, c[1] + 0.08);
    pin(x, sp[0], sp[1], u * 0.026, o.ac, back(seg(t, L * 0.55, L * 0.65)));
    label(x, sp[0], sp[1] - u * 0.065, site, u * 0.038, o, INK, '#ffffff', seg(t, L * 0.6, L * 0.7));
    label(x, W / 2, H - u * 0.16, `✓ ${verdict}`, u * 0.05, o, '#2f9e6f', '#ffffff', seg(t, L * 0.72, L * 0.82), 'center');
    note(x, W, H, '學區範圍為示意，以教育局公告為準', o);
  };

  /* ───────── 16 雷達掃描 ───────── */
  const radar = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const names = (w.length ? w : ['超市', '國小', '公園', '醫院', '捷運站']).slice(0, 7);
    const cam = { x: 0.5, y: 0.5, z: 1.05 }, { P, k } = projector(W, H, cam), u = Math.min(W, H);
    drawBase(x, W, H, cam, 111, 'dark');
    const [X, Y] = P(0.5, 0.5), R = 0.24 * k;
    for (let i = 1; i <= 3; i++) {
      x.beginPath();
      x.arc(X, Y, (R * i) / 3, 0, TAU);
      x.strokeStyle = 'rgba(46,204,113,.35)';
      x.lineWidth = u * 0.003;
      x.stroke();
    }
    const ang = (t / L) * TAU * 2 - Math.PI / 2;
    x.beginPath();
    x.moveTo(X, Y);
    x.arc(X, Y, R, ang - 0.7, ang);
    x.closePath();
    x.fillStyle = 'rgba(46,204,113,.25)';
    x.fill();
    x.beginPath();
    x.moveTo(X, Y);
    x.lineTo(X + Math.cos(ang) * R, Y + Math.sin(ang) * R);
    x.strokeStyle = '#2ecc71';
    x.lineWidth = u * 0.006;
    x.stroke();
    pin(x, X, Y + u * 0.02, u * 0.024, o.ac, 1);
    names.forEach((n, i) => {
      const a = (i / names.length) * TAU - Math.PI / 2 + 0.4, d = R * (0.45 + ((i * 37) % 5) * 0.1), px = X + Math.cos(a) * d, py = Y + Math.sin(a) * d;
      const sweep = ((t / L) * TAU * 2 - Math.PI / 2 - a + TAU * 4) % TAU, first = (t / L) * TAU * 2 >= ((a + Math.PI / 2 + TAU) % TAU);
      if (!first) return;
      const glow = sweep < 1.2 ? 1 - sweep / 1.2 : 0;
      dot(x, px, py, u * (0.016 + glow * 0.012), '#2ecc71');
      label(x, px, py - u * 0.015, n, u * 0.034, o, '#ffffff', INK, 1);
    });
  };

  /* ───────── 17 手機導航畫面 ───────── */
  const nav = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const [dest = '捷運站', eta = '12 分', dist = '850 公尺', i1 = '直走 300 公尺', i2 = '右轉 文化一路'] = w;
    const u = Math.min(W, H), pw = Math.min(W * 0.86, H * 0.5), ph = pw * 1.9, px = W / 2 - pw / 2, py = H / 2 - ph / 2;
    x.fillStyle = '#1d2433';
    x.fillRect(0, 0, W, H);
    x.fillStyle = '#0b0f16';
    x.beginPath();
    x.roundRect(px - pw * 0.04, py - pw * 0.04, pw * 1.08, ph + pw * 0.08, pw * 0.12);
    x.fill();
    x.save();
    x.beginPath();
    x.roundRect(px, py, pw, ph, pw * 0.09);
    x.clip();
    // 地圖：路線往上走，鏡頭跟著藍點
    const prog = clamp(t / (L * 0.9)), turn = 0.55;
    const route = [[0.5, 0.95], [0.5, 0.55], [0.75, 0.55], [0.75, 0.15]];
    const me = along(route, prog * 0.85).p;
    x.translate(px, py);
    const cam = { x: me[0], y: me[1] - 0.08, z: 1.6 }, pr = projector(pw, ph, cam);
    drawBase(x, pw, ph, cam, 121);
    strokePart(x, route, 1, pr.P, pw * 0.05, '#ffffff');
    strokePart(x, route, 1, pr.P, pw * 0.032, '#4285f4');
    strokePart(x, route, prog * 0.85, pr.P, pw * 0.032, '#a8c7fa');
    const end = pr.P(0.75, 0.15);
    pin(x, end[0], end[1], pw * 0.04, '#e53935', 1);
    const [MX, MY] = pr.P(me[0], me[1]);
    dot(x, MX, MY, pw * 0.05, 'rgba(66,133,244,.25)');
    dot(x, MX, MY, pw * 0.03, '#ffffff');
    dot(x, MX, MY, pw * 0.022, '#4285f4');
    // 上方指示列
    const second = prog * 0.85 > turn * 0.62;
    x.fillStyle = '#1e6e45';
    x.beginPath();
    x.roundRect(pw * 0.04, pw * 0.06, pw * 0.92, pw * 0.26, pw * 0.05);
    x.fill();
    x.fillStyle = '#ffffff';
    x.save();
    x.translate(pw * 0.15, pw * 0.19);
    if (second) x.rotate(Math.PI / 2);
    x.beginPath();
    x.moveTo(0, -pw * 0.07);
    x.lineTo(pw * 0.055, -pw * 0.01);
    x.lineTo(pw * 0.02, -pw * 0.01);
    x.lineTo(pw * 0.02, pw * 0.07);
    x.lineTo(-pw * 0.02, pw * 0.07);
    x.lineTo(-pw * 0.02, -pw * 0.01);
    x.lineTo(-pw * 0.055, -pw * 0.01);
    x.closePath();
    x.fill();
    x.restore();
    x.font = fontOf(o, pw * 0.065);
    x.textAlign = 'left';
    x.textBaseline = 'middle';
    x.fillText(second ? i2 : i1, pw * 0.27, pw * 0.19);
    // 下方預估卡
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.roundRect(pw * 0.04, ph - pw * 0.3, pw * 0.92, pw * 0.26, pw * 0.05);
    x.fill();
    x.fillStyle = '#1e6e45';
    x.font = fontOf(o, pw * 0.075);
    x.fillText(eta, pw * 0.1, ph - pw * 0.2);
    x.fillStyle = '#555555';
    x.font = fontOf(o, pw * 0.045, 500);
    x.fillText(`${dist} · 前往 ${dest}`, pw * 0.1, ph - pw * 0.11);
    x.restore();
    note(x, W, H, '導航畫面為示意', o, '#ffffff');
    void u;
  };

  /* ───────── 18 指北針與比例尺 ───────── */
  const compass = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const [scale = '500 m'] = w, u = Math.min(W, H);
    x.clearRect(0, 0, W, H);
    const X = W - u * 0.16, Y = u * 0.2, R = u * 0.09, s = back(seg(t, 0, L * 0.2));
    const spin = (1 - inout(seg(t, L * 0.05, L * 0.45))) * Math.PI * 1.5 + Math.sin(t * 2) * 0.03;
    x.save();
    x.translate(X, Y);
    x.scale(s, s);
    dot(x, 0, 0, R * 1.15, 'rgba(255,255,255,.92)');
    x.beginPath();
    x.arc(0, 0, R * 1.15, 0, TAU);
    x.strokeStyle = INK;
    x.lineWidth = u * 0.006;
    x.stroke();
    x.rotate(spin);
    polyPath(x, [[0, -R * 0.95], [R * 0.22, 0], [-R * 0.22, 0]]);
    x.fillStyle = '#e53935';
    x.fill();
    polyPath(x, [[0, R * 0.95], [R * 0.22, 0], [-R * 0.22, 0]]);
    x.fillStyle = INK;
    x.fill();
    x.fillStyle = INK;
    x.font = fontOf(o, R * 0.42);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText('N', 0, -R * 1.45);
    x.restore();
    // 比例尺
    const bw = u * 0.32, bx = W - u * 0.06 - bw, by = H - u * 0.1, d = ease(seg(t, L * 0.3, L * 0.6));
    if (d > 0) {
      x.fillStyle = 'rgba(255,255,255,.92)';
      x.beginPath();
      x.roundRect(bx - u * 0.025, by - u * 0.06, bw + u * 0.05, u * 0.09, u * 0.012);
      x.fill();
      for (let i = 0; i < 4; i++) {
        x.fillStyle = i % 2 ? '#ffffff' : INK;
        x.fillRect(bx + (bw / 4) * i, by, (bw / 4) * Math.min(1, Math.max(0, d * 4 - i)), u * 0.016);
      }
      x.strokeStyle = INK;
      x.lineWidth = u * 0.003;
      x.strokeRect(bx, by, bw * d, u * 0.016);
      x.fillStyle = INK;
      x.font = fontOf(o, u * 0.03, 700);
      x.textBaseline = 'bottom';
      x.textAlign = 'left';
      x.fillText('0', bx, by - u * 0.008);
      x.textAlign = 'right';
      x.fillText(scale, bx + bw, by - u * 0.008);
    }
  };

  /* ───────── 19 新舊地圖對照 ───────── */
  const oldnew = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const [y0 = '2010', y1 = '2025'] = w, u = Math.min(W, H), cam = { x: 0.5, y: 0.5, z: 1.1 };
    drawBase(x, W, H, cam, 131, 'normal', 1);
    const s = 0.5 + 0.38 * Math.sin((t / L) * TAU - Math.PI / 2) * -1, sx = W * clamp(s);
    x.save();
    x.beginPath();
    x.rect(0, 0, sx, H);
    x.clip();
    drawBase(x, W, H, cam, 131, 'old', 0.35);
    x.restore();
    x.fillStyle = '#ffffff';
    x.fillRect(sx - u * 0.005, 0, u * 0.01, H);
    dot(x, sx, H / 2, u * 0.04, '#ffffff');
    x.fillStyle = INK;
    x.font = fontOf(o, u * 0.035);
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText('‹ ›', sx, H / 2 + u * 0.002);
    label(x, u * 0.05, u * 0.09, y0, u * 0.045, o, '#8a6d3b', '#ffffff', 1, 'left');
    x.font = fontOf(o, u * 0.045);
    const w1 = x.measureText(y1).width + u * 0.05;
    label(x, W - u * 0.05 - w1, u * 0.09, y1, u * 0.045, o, o.ac, '#ffffff', 1, 'left');
    note(x, W, H, '新舊對照為示意；實際航照請用圖片的前後對比', o);
  };

  /* ───────── 20 地圖導航（行車視角） ───────── */
  const drive = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const [dest = '捷運站', ...rest] = w.length ? w : ['捷運林口站', '直行 文化一路', '右轉 忠孝路', '左轉 站前路', '9 分', '2.4 公里'];
    const steps = rest.filter((s) => !/^\d/.test(s.trim())).slice(0, 3), nums = rest.filter((s) => /^\d/.test(s.trim()));
    const eta = nums[0] ?? '9 分', distTxt = nums[1] ?? '2.4 公里', totalKm = Number(/[\d.]+/.exec(distTxt)?.[0] ?? 2.4) * (/公尺|m\b/.test(distTxt) ? 0.001 : 1);
    const u = Math.min(W, H);
    // 路線沿著底圖的街道格線（格線間距 0.075）
    const route = [[0.3, 0.9], [0.3, 0.525], [0.6, 0.525], [0.6, 0.225], [0.825, 0.225]].slice(0, Math.max(2, steps.length) + 1);
    const lens = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1])), total = lens.reduce((a, b) => a + b, 0);
    const prog = inout(seg(t, L * 0.04, L * 0.94)), at = along(route, prog), me = at.p;
    // 車頭方向：轉角前後平滑轉向
    const dirOf = (i: number) => Math.atan2(route[i + 1][1] - route[i][1], route[i + 1][0] - route[i][0]);
    let done = 0;
    for (let i = 0; i < at.i; i++) done += lens[i];
    const inSeg = prog * total - done, left = lens[at.i] - inSeg, turnZone = 0.05;
    let heading = dirOf(at.i);
    if (left < turnZone && at.i + 1 < lens.length) {
      let d = dirOf(at.i + 1) - heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      heading += d * inout(1 - left / turnZone) * 0.5;
    }
    if (inSeg < turnZone && at.i > 0) {
      let d = heading - dirOf(at.i - 1);
      d = Math.atan2(Math.sin(d), Math.cos(d));
      heading -= d * (1 - inout(inSeg / turnZone)) * 0.5;
    }
    x.fillStyle = STYLES.normal.land;
    x.fillRect(0, 0, W, H);
    const k = Math.max(W, H) * 2.2, carX = W / 2, carY = H * 0.7;
    x.save();
    x.translate(carX, carY);
    x.scale(1, 0.6);
    x.rotate(-heading - Math.PI / 2);
    x.scale(k, k);
    x.translate(-me[0], -me[1]);
    drawWorld(x, 141);
    // 路線：未走的亮藍、走過的灰
    const line = (pts: number[][], c: string, lw: number) => {
      x.beginPath();
      pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
      x.strokeStyle = c;
      x.lineWidth = lw;
      x.lineCap = 'round';
      x.lineJoin = 'round';
      x.stroke();
    };
    line(route, '#ffffff', 0.03);
    line(route, '#4285f4', 0.02);
    line([...route.slice(0, at.i + 1), me], '#9aa6b2', 0.02);
    const end = route[route.length - 1];
    x.restore();
    // 終點定位針（投影到畫面）
    const proj = (px: number, py: number) => {
      const dx = (px - me[0]) * k, dy = (py - me[1]) * k, a = -heading - Math.PI / 2;
      return [carX + dx * Math.cos(a) - dy * Math.sin(a), carY + (dx * Math.sin(a) + dy * Math.cos(a)) * 0.6];
    };
    const [EX, EY] = proj(end[0], end[1]);
    if (EY > -u * 0.2 && EY < H) pin(x, EX, EY, u * 0.04, '#e53935', 1);
    // 車：藍色箭頭
    x.save();
    x.translate(carX, carY);
    dot(x, 0, 0, u * 0.065, 'rgba(66,133,244,.22)');
    x.beginPath();
    x.moveTo(0, -u * 0.05);
    x.lineTo(u * 0.035, u * 0.035);
    x.lineTo(0, u * 0.018);
    x.lineTo(-u * 0.035, u * 0.035);
    x.closePath();
    x.fillStyle = '#ffffff';
    x.fill();
    x.lineWidth = u * 0.012;
    x.strokeStyle = '#ffffff';
    x.stroke();
    x.fillStyle = '#4285f4';
    x.fill();
    x.restore();
    // 上方指示：下一個轉彎與剩餘公尺
    const step = steps[Math.min(steps.length - 1, at.i)] ?? '直行', next = steps[Math.min(steps.length - 1, at.i + 1)];
    const m = Math.max(0, Math.round((left / total) * totalKm * 1000 / 10) * 10);
    const turn = at.i >= lens.length - 1 ? 0 : /右/.test(next ?? '') ? 1 : /左/.test(next ?? '') ? -1 : 0;
    const bh = u * 0.2;
    x.fillStyle = '#1e6e45';
    x.beginPath();
    x.roundRect(u * 0.04, u * 0.04, W - u * 0.08, bh, u * 0.04);
    x.fill();
    x.save();
    x.translate(u * 0.14, u * 0.04 + bh / 2);
    x.rotate((turn * Math.PI) / 2);
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.moveTo(0, -u * 0.06);
    x.lineTo(u * 0.045, -u * 0.01);
    x.lineTo(u * 0.016, -u * 0.01);
    x.lineTo(u * 0.016, u * 0.06);
    x.lineTo(-u * 0.016, u * 0.06);
    x.lineTo(-u * 0.016, -u * 0.01);
    x.lineTo(-u * 0.045, -u * 0.01);
    x.closePath();
    x.fill();
    x.restore();
    x.fillStyle = '#ffffff';
    x.textAlign = 'left';
    x.textBaseline = 'middle';
    const last = at.i >= lens.length - 1;
    x.font = fontOf(o, u * 0.075);
    x.fillText(last ? `${m} 公尺` : `${m} 公尺後`, u * 0.24, u * 0.04 + bh * 0.33);
    x.font = fontOf(o, u * 0.05, 700);
    x.fillText(last ? `抵達 ${dest}` : next ?? step, u * 0.24, u * 0.04 + bh * 0.7);
    // 下方預估列
    const fh = u * 0.15, fy = H - fh - u * 0.04;
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.roundRect(u * 0.04, fy, W - u * 0.08, fh, u * 0.035);
    x.fill();
    const remainMin = Math.max(0, Math.round(Number(/[\d.]+/.exec(eta)?.[0] ?? 9) * (1 - prog)));
    x.fillStyle = '#1e6e45';
    x.font = fontOf(o, u * 0.07);
    x.fillText(`${remainMin} 分`, u * 0.09, fy + fh * 0.42);
    x.fillStyle = '#555555';
    x.font = fontOf(o, u * 0.04, 500);
    x.fillText(`${(totalKm * (1 - prog)).toFixed(1)} 公里 · 前往 ${dest}`, u * 0.09, fy + fh * 0.76);
    note(x, W, H - fh - u * 0.05, '導航畫面為示意', o);
  };

  /* ───────── 21 生活機能地圖 ───────── */
  const AMENITY: [RegExp, string, string][] = [
    [/超市|量販|賣場|便利/, '#e67e22', '購'],
    [/學|校|幼兒|托/, '#4e79a7', '學'],
    [/公園|綠地|運動|河濱/, '#2f9e6f', '園'],
    [/醫院|診所|藥/, '#e53935', '醫'],
    [/捷運|車站|公車|轉運|交通/, '#8e44ad', '交'],
    [/餐|美食|商圈|市場|百貨/, '#c0392b', '食'],
    [/銀行|郵局|公所|圖書/, '#16a085', '公'],
  ];
  const amenity = (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => {
    const lines = (w.length ? w : ['超市 某某超市 4', '學校 某某國小 6', '公園 中央公園 3', '醫院 某某醫院 9', '捷運 某某站 8', '餐飲 美食街 5']).slice(0, 10);
    const items = lines.map((l, i) => {
      const parts = l.trim().split(/\s+/), mins = /^\d+(\.\d+)?$/.test(parts[parts.length - 1] ?? '') ? Number(parts.pop()) : 5;
      const cat = parts[0] ?? '', name = parts.slice(1).join(' ') || cat;
      const def = AMENITY.find(([re]) => re.test(cat)) ?? [/./, PAL(o)[i % 8], [...cat][0] ?? '・'];
      return { cat, name, mins, c: def[1], g: def[2] };
    });
    const cam = { x: W > H ? 0.62 : 0.5, y: H > W ? 0.6 : 0.5, z: 1.05 }, { P, k } = projector(W, H, cam), u = Math.min(W, H);
    drawBase(x, W, H, cam, 151);
    const [CX, CY] = P(0.5, 0.5), per = (Math.min(W, H) / 2 / k) * (W > H ? 0.5 : 0.42);
    // 步行 5／10 分鐘圈
    [5, 10].forEach((mm, i) => {
      const g = ease(seg(t, L * (0.06 + i * 0.08), L * (0.2 + i * 0.08))), R = (mm / 10) * per * 2 * k * g;
      x.beginPath();
      x.arc(CX, CY, R, 0, TAU);
      x.fillStyle = rgba(o.ac, i ? 0.06 : 0.1);
      x.fill();
      x.setLineDash([u * 0.018, u * 0.012]);
      x.strokeStyle = rgba(o.ac, 0.8);
      x.lineWidth = u * 0.005;
      x.stroke();
      x.setLineDash([]);
      if (g > 0.9) label(x, CX, CY - R, `步行 ${mm} 分`, u * 0.03, o, '#ffffff', o.ac, g, 'center');
    });
    pin(x, CX, CY, u * 0.03, o.ac, back(seg(t, 0, L * 0.1)));
    // 設施：方向平均分布，距離依分鐘
    items.forEach((it, i) => {
      const a = (i / items.length) * TAU - Math.PI / 2 + 0.3, d = Math.max(0.42, Math.min(1.15, it.mins / 10)) * per * 2 * k;
      const X = CX + Math.cos(a) * d, Y = CY + Math.sin(a) * d * (H > W ? 1.2 : 0.85), s = back(seg(t, L * (0.25 + i * 0.06), L * (0.33 + i * 0.06)));
      if (s <= 0) return;
      x.beginPath();
      x.moveTo(CX, CY);
      x.lineTo(CX + (X - CX) * Math.min(1, s), CY + (Y - CY) * Math.min(1, s));
      x.strokeStyle = rgba(it.c, 0.45);
      x.lineWidth = u * 0.004;
      x.stroke();
      dot(x, X, Y, u * 0.04 * s, '#ffffff');
      dot(x, X, Y, u * 0.033 * s, it.c);
      x.fillStyle = '#ffffff';
      x.font = fontOf(o, u * 0.034 * s);
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(it.g, X, Y + u * 0.002);
      label(x, X, Y - u * 0.04, `${it.name} · ${it.mins} 分`, u * 0.03, o, INK, '#ffffff', seg(t, L * (0.3 + i * 0.06), L * (0.38 + i * 0.06)));
    });
    // 分類摘要
    const cats = [...new Map(items.map((it) => [it.g, it])).values()];
    legend(x, W, H, cats.map((c, i) => ({ c: c.c, n: `${c.cat} ${items.filter((v) => v.g === c.g).length} 處 · 最近 ${Math.min(...items.filter((v) => v.g === c.g).map((v) => v.mins))} 分`, a: seg(t, L * (0.72 + i * 0.03), L * (0.8 + i * 0.03)) })), o);
    note(x, W, H, '位置為示意，步行時間請以實測為準', o);
  };

  const MODES: Record<string, (x: CanvasRenderingContext2D, W: number, H: number, w: string[], t: number, L: number, o: Opt) => void> = {
    taiwan, split, race, tour, spot, phase, future, zoning, parcel, choro: dataMap('choro'), bubble: dataMap('bubble'), bars: dataMap('bars'), nuisance, flood, school, radar, nav, compass, oldnew, drive, amenity,
  };
  const LOOPS: Record<string, number> = { drive: 9, amenity: 7, taiwan: 6, split: 6, race: 7, tour: 7, spot: 8, phase: 6, future: 7, zoning: 6, parcel: 5, choro: 6, bubble: 6, bars: 6, nuisance: 6, flood: 7, school: 6, radar: 6, nav: 8, compass: 4, oldnew: 6 };
  /** 畫一格；回傳循環秒數 */
  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number, mode: string, words: string[], t: number, o: Opt): number => {
    const L = LOOPS[mode] ?? 6, f = MODES[mode];
    if (!f) return L;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (mode !== 'compass') ctx.clearRect(0, 0, W, H);
    f(ctx, W, H, words, Math.min(t, L), L, o);
    ctx.restore();
    return L;
  };
  return { draw };
};

(globalThis as unknown as { MA_MAPX: unknown }).MA_MAPX = mapfxRenderer();
