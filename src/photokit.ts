// 圖片運鏡模組：照片／圖片的固定動畫，參數化、可存成預設。全部硬邊，不使用模糊與陰影。
// photoRenderer 內部必須自給自足，匯出 HTML 時以 toString() 內嵌。

export type PModule = 'kenburns' | 'swing' | 'tilt' | 'compare' | 'magnify';

export interface PCaption {
  text: string;
  x: number;
  y: number;
  size: number;
  style: 'pill' | 'plain' | 'bar';
  color: string;
  delay: number;
}

export interface PScene {
  ratio: '9:16' | '16:9' | '1:1';
  loop: number;
  module: PModule;
  /** transparent｜#hex｜#hex,#hex */
  bg: string;
  /** 圖片插槽：data URL、網址，或留空（顯示佔位圖） */
  images: string[];
  params: Record<string, number | string>;
  caption?: PCaption;
}

export const MODULE_INFO: Record<PModule, { zh: string; en: string; desc: string; slots: number }> = {
  kenburns: { zh: '推拉運鏡', en: 'Ken Burns', desc: '從起始畫面慢慢推近或拉遠、平移到結束畫面', slots: 1 },
  swing: { zh: '旋轉甩入', en: 'Swing In', desc: '照片帶白框旋轉甩進畫面，停在微斜角度', slots: 1 },
  tilt: { zh: '3D 傾斜卡片', en: '3D Tilt Card', desc: '照片變成有厚度的卡片，以透視角度轉入並輕微擺動', slots: 1 },
  compare: { zh: '前後滑桿對比', en: 'Before / After', desc: '分隔線掃過畫面，前後兩張照片對照', slots: 2 },
  magnify: { zh: '局部放大鏡', en: 'Magnifier', desc: '圈出細節，放大到旁邊的圓形鏡頭並加上標註', slots: 1 },
};

export const MODULE_DEFAULTS: Record<PModule, Record<string, number | string>> = {
  kenburns: { fz: 1, fx: 0.5, fy: 0.5, tz: 1.35, tx: 0.62, ty: 0.42, ease: 'inout' },
  swing: { size: 0.78, px: 0.5, py: 0.46, aspect: 0.75, angle: -28, rest: -4, scale: 1.6, from: 'left', border: 18, radius: 10, frame: '#ffffff', float: 1 },
  tilt: { size: 0.78, px: 0.5, py: 0.47, aspect: 0.75, ry0: -55, ry: -14, rx: 8, sway: 6, period: 4, depth: 18, border: 0, radius: 18, frame: '#ffffff', edge: '#e8e2d6' },
  compare: { dir: 'h', from: 0.85, to: 0.15, hold: 0.8, sweep: 1.6, labelA: 'BEFORE', labelB: 'AFTER', line: '#ffffff', knob: '#ff5a36' },
  magnify: { ax: 0.38, ay: 0.58, ar: 0.07, lx: 0.66, ly: 0.3, lr: 0.2, ring: '#ffd23f', push: 1.06 },
};

/** 參數規格：工作室依此產生控制項，MCP 依此說明參數 */
export type PField =
  | { k: string; label: string; type: 'range'; min: number; max: number; step: number }
  | { k: string; label: string; type: 'color' | 'text' }
  | { k: string; label: string; type: 'seg'; opts: [string, string][] };

const pos = (k: string, label: string): PField => ({ k, label, type: 'range', min: 0, max: 1, step: 0.01 });
export const PARAMS: Record<PModule, PField[]> = {
  kenburns: [
    { k: 'fz', label: '起始縮放', type: 'range', min: 1, max: 3, step: 0.01 },
    pos('fx', '起始中心 X'),
    pos('fy', '起始中心 Y'),
    { k: 'tz', label: '結束縮放', type: 'range', min: 1, max: 3, step: 0.01 },
    pos('tx', '結束中心 X'),
    pos('ty', '結束中心 Y'),
    { k: 'ease', label: '速度曲線', type: 'seg', opts: [['inout', '慢-快-慢'], ['linear', '等速']] },
  ],
  swing: [
    { k: 'from', label: '甩入方向', type: 'seg', opts: [['left', '左'], ['right', '右'], ['top', '上'], ['bottom', '下'], ['none', '原地']] },
    { k: 'size', label: '照片寬度', type: 'range', min: 0.3, max: 1, step: 0.01 },
    { k: 'aspect', label: '寬高比（0＝原圖）', type: 'range', min: 0, max: 2, step: 0.01 },
    { k: 'angle', label: '起始角度', type: 'range', min: -90, max: 90, step: 1 },
    { k: 'rest', label: '停留角度', type: 'range', min: -20, max: 20, step: 0.5 },
    { k: 'scale', label: '起始放大', type: 'range', min: 1, max: 3, step: 0.05 },
    { k: 'border', label: '白框粗細', type: 'range', min: 0, max: 60, step: 1 },
    { k: 'radius', label: '圓角', type: 'range', min: 0, max: 60, step: 1 },
    { k: 'frame', label: '框色', type: 'color' },
    { k: 'float', label: '停留時漂浮', type: 'seg', opts: [['1', '開'], ['0', '關']] },
  ],
  tilt: [
    { k: 'size', label: '卡片寬度', type: 'range', min: 0.3, max: 1, step: 0.01 },
    { k: 'aspect', label: '寬高比（0＝原圖）', type: 'range', min: 0, max: 2, step: 0.01 },
    { k: 'ry0', label: '起始轉角', type: 'range', min: -89, max: 89, step: 1 },
    { k: 'ry', label: '停留轉角（左右）', type: 'range', min: -60, max: 60, step: 1 },
    { k: 'rx', label: '俯仰角', type: 'range', min: -40, max: 40, step: 1 },
    { k: 'sway', label: '擺動幅度', type: 'range', min: 0, max: 20, step: 0.5 },
    { k: 'period', label: '擺動週期（秒）', type: 'range', min: 1, max: 10, step: 0.5 },
    { k: 'depth', label: '卡片厚度', type: 'range', min: 0, max: 80, step: 1 },
    { k: 'border', label: '白框粗細', type: 'range', min: 0, max: 60, step: 1 },
    { k: 'radius', label: '圓角', type: 'range', min: 0, max: 60, step: 1 },
    { k: 'frame', label: '框色', type: 'color' },
    { k: 'edge', label: '側邊顏色', type: 'color' },
  ],
  compare: [
    { k: 'dir', label: '分隔方向', type: 'seg', opts: [['h', '左右'], ['v', '上下']] },
    pos('from', '分隔線起點'),
    pos('to', '分隔線終點'),
    { k: 'hold', label: '開始前停留（秒）', type: 'range', min: 0, max: 4, step: 0.1 },
    { k: 'sweep', label: '掃過時間（秒）', type: 'range', min: 0.3, max: 6, step: 0.1 },
    { k: 'labelA', label: '圖片 1 標籤', type: 'text' },
    { k: 'labelB', label: '圖片 2 標籤', type: 'text' },
    { k: 'line', label: '分隔線色', type: 'color' },
    { k: 'knob', label: '把手顏色', type: 'color' },
  ],
  magnify: [
    pos('ax', '細節位置 X'),
    pos('ay', '細節位置 Y'),
    { k: 'ar', label: '圈選半徑', type: 'range', min: 0.02, max: 0.3, step: 0.005 },
    pos('lx', '鏡頭位置 X'),
    pos('ly', '鏡頭位置 Y'),
    { k: 'lr', label: '鏡頭半徑', type: 'range', min: 0.08, max: 0.45, step: 0.005 },
    { k: 'ring', label: '圈線顏色', type: 'color' },
    { k: 'push', label: '背景慢推', type: 'range', min: 1, max: 1.4, step: 0.01 },
  ],
};

export const PHOTO_MODULES = Object.keys(MODULE_INFO) as PModule[];
export const photoFxId = (m: PModule) => `photo-${m}`;
export const isPhotoFx = (id: string) => id.startsWith('photo-');

/** 補齊缺漏欄位並夾住範圍，AI 給的資料也能安全使用 */
export const normalizePhotoScene = (raw: Partial<PScene>, fallback: PModule = 'kenburns'): PScene => {
  const module = PHOTO_MODULES.includes(raw.module as PModule) ? (raw.module as PModule) : fallback;
  const base = defaultPhotoScene(module);
  const ratio = (['9:16', '16:9', '1:1'] as const).includes(raw.ratio as PScene['ratio']) ? (raw.ratio as PScene['ratio']) : base.ratio;
  const loop = Math.max(1.5, Math.min(20, Number(raw.loop) || base.loop));
  const params: Record<string, number | string> = { ...base.params };
  for (const f of PARAMS[module]) {
    const v = raw.params?.[f.k];
    if (v === undefined || v === null || v === '') continue;
    if (f.type === 'range') {
      const n = Number(v);
      if (Number.isFinite(n)) params[f.k] = Math.max(f.min, Math.min(f.max, n));
    } else if (f.type === 'seg') {
      if (f.opts.some(([o]) => o === String(v))) params[f.k] = f.k === 'float' ? Number(v) : String(v);
    } else params[f.k] = String(v).slice(0, 40);
  }
  const images = Array.isArray(raw.images) ? raw.images.map((x) => (typeof x === 'string' ? x : '')).slice(0, MODULE_INFO[module].slots) : [];
  const c = raw.caption;
  const caption: PCaption | undefined = c
    ? {
        text: String(c.text ?? '').slice(0, 120),
        x: Math.max(0, Math.min(1, Number(c.x ?? 0.5))),
        y: Math.max(0, Math.min(1, Number(c.y ?? 0.86))),
        size: Math.max(0.4, Math.min(3, Number(c.size ?? 1))),
        style: (['pill', 'plain', 'bar'] as const).includes(c.style as PCaption['style']) ? (c.style as PCaption['style']) : 'pill',
        color: /^#[0-9a-f]{6}$/i.test(String(c.color)) ? String(c.color) : '#ffd23f',
        delay: Math.max(0, Math.min(20, Number(c.delay ?? 1))),
      }
    : base.caption;
  const bg = typeof raw.bg === 'string' && /^(transparent|#[0-9a-f]{3,8}(,\s*#[0-9a-f]{3,8})?)$/i.test(raw.bg.trim()) ? raw.bg.trim() : base.bg;
  return { ratio, loop, module, bg, images, params, caption };
};

/** words 裡以 { 開頭的字串視為場景 JSON；否則第一行當字幕 */
export const photoSceneFromWords = (w: string[], module: PModule): PScene => {
  const j = w.find((x) => String(x).trim().startsWith('{'));
  if (j) {
    try {
      return normalizePhotoScene(JSON.parse(j) as Partial<PScene>, module);
    } catch {
      /* 格式錯誤時退回預設 */
    }
  }
  const sc = defaultPhotoScene(module);
  if (sc.caption) sc.caption.text = w.filter((x) => x && !x.startsWith('{')).join('\n');
  return sc;
};

export const RATIO_PX: Record<PScene['ratio'], [number, number]> = { '9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080] };

export const defaultPhotoScene = (module: PModule = 'kenburns'): PScene => ({
  ratio: '9:16',
  loop: 6,
  module,
  bg: '#151515',
  images: [],
  params: { ...MODULE_DEFAULTS[module] },
  caption: { text: '', x: 0.5, y: 0.86, size: 1, style: 'pill', color: '#ffd23f', delay: 1 },
});

/** 繪製引擎工廠；imgs 為已載入的圖片（缺圖時畫佔位） */
export const photoRenderer = () => {
  type Img = (HTMLImageElement | HTMLCanvasElement | ImageBitmap) & { width: number; height: number };
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
  const inout = (p: number) => {
    const q = clamp(p);
    return q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
  };
  const back = (p: number) => {
    const q = clamp(p) - 1;
    return 1 + 2.4 * q * q * q + 1.4 * q * q;
  };
  const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
  const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : Number.isFinite(parseFloat(String(v))) ? parseFloat(String(v)) : d);
  const FONT = '"Noto Sans TC", "PingFang TC", sans-serif';

  /** 佔位圖：0＝完工街景、1＝施工前空地；角落標示插槽編號，讓沒放圖時也看得出構圖 */
  const holders = new Map<string, HTMLCanvasElement>();
  const placeholder = (i: number, after = i % 2 === 0): Img => {
    const key = `${i}|${after}`;
    let c = holders.get(key);
    if (!c) {
      c = document.createElement('canvas');
      c.width = 1600;
      c.height = 1200;
      const x = c.getContext('2d')!;
      const sky = x.createLinearGradient(0, 0, 0, 760);
      sky.addColorStop(0, after ? '#7fb8e6' : '#b9c3cc');
      sky.addColorStop(1, after ? '#f3d9b0' : '#e2ddd3');
      x.fillStyle = sky;
      x.fillRect(0, 0, 1600, 1200);
      x.fillStyle = after ? '#ffe7a8' : '#f4f1ea';
      x.beginPath();
      x.arc(1250, 230, 90, 0, Math.PI * 2);
      x.fill();
      // 遠山
      x.fillStyle = after ? '#8fb3a0' : '#a9b2ad';
      x.beginPath();
      x.moveTo(0, 700);
      for (let k = 0; k <= 16; k++) x.lineTo(k * 100, 610 + Math.sin(k * 1.3) * 50 + Math.cos(k * 0.7) * 30);
      x.lineTo(1600, 760);
      x.lineTo(0, 760);
      x.fill();
      if (after) {
        const towers = [[120, 300, 190], [360, 200, 230], [640, 120, 260], [950, 230, 210], [1210, 330, 240]];
        towers.forEach(([tx, ty, tw], n) => {
          x.fillStyle = ['#e9e4da', '#d8d2c6', '#f2eee6', '#ded8cc', '#ece7dd'][n];
          x.fillRect(tx, ty, tw, 860 - ty);
          x.fillStyle = '#5d7f9e';
          for (let r = ty + 40; r < 800; r += 56) for (let q = tx + 24; q < tx + tw - 30; q += 46) x.fillRect(q, r, 28, 30);
        });
        x.fillStyle = '#6aa36f';
        for (let k = 0; k < 14; k++) {
          x.beginPath();
          x.arc(60 + k * 115, 860, 46 + (k % 3) * 10, 0, Math.PI * 2);
          x.fill();
        }
      } else {
        // 施工前：圍籬與吊車
        x.strokeStyle = '#6b6258';
        x.lineWidth = 14;
        x.beginPath();
        x.moveTo(980, 840);
        x.lineTo(980, 220);
        x.lineTo(700, 220);
        x.moveTo(980, 220);
        x.lineTo(1380, 220);
        x.moveTo(1240, 220);
        x.lineTo(1240, 420);
        x.stroke();
        x.fillStyle = '#e8c04a';
        x.fillRect(1205, 420, 70, 50);
      }
      x.fillStyle = after ? '#9a9187' : '#b49a78';
      x.fillRect(0, 860, 1600, 340);
      x.fillStyle = after ? '#5b5650' : '#9b7f5c';
      x.fillRect(0, 960, 1600, 120);
      x.fillStyle = after ? '#f4f1ea' : '#c9b48f';
      for (let k = 0; k < 16; k++) x.fillRect(k * 110 + 20, 1012, 60, 14);
      if (!after) {
        x.fillStyle = '#4f7d5a';
        x.fillRect(0, 800, 1600, 70);
        x.fillStyle = '#f4f1ea';
        x.font = `900 44px ${FONT}`;
        x.fillText('施工中 · 圍籬', 640, 845);
      }
      // 插槽標示
      x.fillStyle = '#111111cc';
      x.beginPath();
      x.roundRect(36, 36, 300, 96, 48);
      x.fill();
      x.fillStyle = '#ffffff';
      x.font = `900 52px ${FONT}`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(`圖片 ${i + 1}`, 186, 86);
      holders.set(key, c);
    }
    return c as Img;
  };

  /** 以 cover 方式取景：z 為縮放，cx/cy 為取景中心（0–1，圖片座標） */
  const coverParams = (img: Img, W: number, H: number, z: number, cx: number, cy: number) => {
    const k = Math.max(W / img.width, H / img.height) * Math.max(1, z);
    const vw = W / k;
    const vh = H / k;
    const sx = Math.max(0, Math.min(img.width - vw, cx * img.width - vw / 2));
    const sy = Math.max(0, Math.min(img.height - vh, cy * img.height - vh / 2));
    return { k, sx, sy, vw, vh };
  };
  const drawCover = (ctx: CanvasRenderingContext2D, img: Img, W: number, H: number, z: number, cx: number, cy: number) => {
    const p = coverParams(img, W, H, z, cx, cy);
    ctx.drawImage(img, p.sx, p.sy, p.vw, p.vh, 0, 0, W, H);
    return p;
  };

  /** 帶邊框、圓角的照片貼圖（快取） */
  const framed = new Map<string, HTMLCanvasElement>();
  const frameTex = (img: Img, w: number, h: number, border: number, radius: number, color: string) => {
    const key = `${(img as { src?: string }).src ?? 'c'}|${img.width}x${img.height}|${w}x${h}|${border}|${radius}|${color}`;
    let c = framed.get(key);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = Math.max(2, Math.round(w));
    c.height = Math.max(2, Math.round(h));
    const x = c.getContext('2d')!;
    x.beginPath();
    x.roundRect(0, 0, c.width, c.height, radius);
    x.clip();
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    const iw = c.width - border * 2;
    const ih = c.height - border * 2;
    if (iw > 2 && ih > 2) {
      const k = Math.max(iw / img.width, ih / img.height);
      const vw = iw / k;
      const vh = ih / k;
      x.save();
      x.beginPath();
      x.roundRect(border, border, iw, ih, Math.max(0, radius - border));
      x.clip();
      x.drawImage(img, (img.width - vw) / 2, (img.height - vh) / 2, vw, vh, border, border, iw, ih);
      x.restore();
    }
    if (framed.size > 40) framed.clear();
    framed.set(key, c);
    return c;
  };

  /* ───────── WebGL：3D 傾斜卡片 ───────── */
  let gl: WebGLRenderingContext | null = null;
  let glc: HTMLCanvasElement | null = null;
  let prog: WebGLProgram | null = null;
  let tex: WebGLTexture | null = null;
  let texKey = '';
  const glInit = () => {
    glc = document.createElement('canvas');
    gl = glc.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true }) as WebGLRenderingContext | null;
    if (!gl) return;
    const vs = `attribute vec3 p;attribute vec2 uv;attribute float sh;uniform mat4 m;varying vec2 v;varying float s;void main(){v=uv;s=sh;gl_Position=m*vec4(p,1.0);}`;
    const fs = `precision mediump float;varying vec2 v;varying float s;uniform sampler2D t;uniform vec3 c;void main(){if(s<0.0){vec4 col=texture2D(t,v);gl_FragColor=vec4(col.rgb*col.a,col.a);}else{gl_FragColor=vec4(c*s,1.0);}}`;
    const sh = (type: number, src: string) => {
      const o = gl!.createShader(type)!;
      gl!.shaderSource(o, src);
      gl!.compileShader(o);
      return o;
    };
    prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    tex = gl.createTexture();
  };
  const mul = (a: number[], b: number[]) => {
    const o = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
    return o;
  };
  const drawCard3D = (ctx: CanvasRenderingContext2D, W: number, H: number, img: HTMLCanvasElement, cx: number, cy: number, cw: number, ch: number, depth: number, rx: number, ry: number, edge: string, alpha: number) => {
    if (!gl) glInit();
    if (!gl || !glc || !prog) {
      ctx.drawImage(img, cx - cw / 2, cy - ch / 2, cw, ch);
      return;
    }
    if (glc.width !== W || glc.height !== H) {
      glc.width = W;
      glc.height = H;
    }
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(prog);
    // 以像素為單位的 3D 空間，鏡頭距離約 2.2 倍畫面高
    const f = H * 2.2;
    const a = W / H;
    const near = 10;
    const far = f * 4;
    const fy = 1 / Math.tan(Math.atan(H / 2 / f));
    const P = [fy / a, 0, 0, 0, 0, fy, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0];
    const T = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, cx - W / 2, -(cy - H / 2), -f, 1];
    const sx = Math.sin(rx);
    const cxr = Math.cos(rx);
    const sy = Math.sin(ry);
    const cyr = Math.cos(ry);
    const RX = [1, 0, 0, 0, 0, cxr, sx, 0, 0, -sx, cxr, 0, 0, 0, 0, 1];
    const RY = [cyr, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cyr, 0, 0, 0, 0, 1];
    const M = mul(P, mul(T, mul(RX, RY)));
    const w = cw / 2;
    const h = ch / 2;
    const d = depth / 2;
    // 每個頂點：x y z u v shade（shade<0 代表貼圖）
    const q = (pts: number[][], s: number) => [pts[0], pts[1], pts[2], pts[0], pts[2], pts[3]].flatMap((v) => [...v, s]);
    const data = new Float32Array([
      ...q([[-w, h, d, 0, 0], [w, h, d, 1, 0], [w, -h, d, 1, 1], [-w, -h, d, 0, 1]], -1),
      ...q([[w, h, d, 0, 0], [w, h, -d, 0, 0], [w, -h, -d, 0, 0], [w, -h, d, 0, 0]], 0.82),
      ...q([[-w, h, -d, 0, 0], [-w, h, d, 0, 0], [-w, -h, d, 0, 0], [-w, -h, -d, 0, 0]], 0.82),
      ...q([[-w, h, -d, 0, 0], [w, h, -d, 0, 0], [w, h, d, 0, 0], [-w, h, d, 0, 0]], 0.95),
      ...q([[-w, -h, d, 0, 0], [w, -h, d, 0, 0], [w, -h, -d, 0, 0], [-w, -h, -d, 0, 0]], 0.7),
      ...q([[w, h, -d, 0, 0], [-w, h, -d, 0, 0], [-w, -h, -d, 0, 0], [w, -h, -d, 0, 0]], 0.6),
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
    const loc = (n: string) => gl!.getAttribLocation(prog!, n);
    gl.enableVertexAttribArray(loc('p'));
    gl.vertexAttribPointer(loc('p'), 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(loc('uv'));
    gl.vertexAttribPointer(loc('uv'), 2, gl.FLOAT, false, 24, 12);
    gl.enableVertexAttribArray(loc('sh'));
    gl.vertexAttribPointer(loc('sh'), 1, gl.FLOAT, false, 24, 20);
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'm'), false, new Float32Array(M));
    const e = edge.replace('#', '');
    gl.uniform3f(gl.getUniformLocation(prog, 'c'), parseInt(e.slice(0, 2), 16) / 255, parseInt(e.slice(2, 4), 16) / 255, parseInt(e.slice(4, 6), 16) / 255);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const key = `${img.width}x${img.height}|${frameKey.get(img) ?? ''}`;
    if (key !== texKey) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      texKey = key;
    }
    gl.uniform1i(gl.getUniformLocation(prog, 't'), 0);
    gl.drawArrays(gl.TRIANGLES, 0, data.length / 6);
    gl.deleteBuffer(buf);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.drawImage(glc, 0, 0);
    ctx.restore();
  };
  const frameKey = new WeakMap<object, string>();

  /* ───────── 字幕 ───────── */
  const drawCaption = (ctx: CanvasRenderingContext2D, W: number, H: number, c: PCaption | undefined, t: number, u: number) => {
    if (!c || !c.text) return;
    const p = clamp((t - c.delay) / 0.45);
    if (p <= 0) return;
    const fs = 54 * u * (c.size || 1);
    const x = c.x * W;
    const y = c.y * H + (1 - ease(p)) * 30 * u;
    ctx.save();
    ctx.globalAlpha *= ease(p);
    ctx.font = `900 ${fs}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = c.text.split('\n');
    const tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const lh = fs * 1.25;
    const th = lh * lines.length;
    if (c.style === 'pill' || c.style === 'bar') {
      ctx.fillStyle = '#1c1c1cdd';
      ctx.beginPath();
      const pw = tw + fs * 1.4;
      const ph = th + fs * 0.6;
      ctx.roundRect(x - pw / 2, y - ph / 2, pw, ph, c.style === 'pill' ? Math.min(ph / 2, fs) : 12 * u);
      ctx.fill();
      if (c.style === 'bar') {
        ctx.fillStyle = c.color;
        ctx.fillRect(x - pw / 2 + fs * 0.3, y - ph / 2 + fs * 0.25, 8 * u, ph - fs * 0.5);
      }
      ctx.fillStyle = c.color;
    } else {
      ctx.lineJoin = 'round';
      ctx.lineWidth = fs * 0.22;
      ctx.strokeStyle = '#111111';
      lines.forEach((l, i) => ctx.strokeText(l, x, y - th / 2 + lh * (i + 0.5)));
      ctx.fillStyle = c.color;
    }
    lines.forEach((l, i) => ctx.fillText(l, x, y - th / 2 + lh * (i + 0.5)));
    ctx.restore();
  };

  /** 畫一格；回傳可拖曳的把手位置（畫面像素） */
  const drawPhoto = (ctx: CanvasRenderingContext2D, W: number, H: number, sc: PScene, t: number, imgs: (Img | undefined)[]): Record<string, number[]> => {
    const S = Math.min(W, H);
    const u = S / 1080;
    const P = sc.params || {};
    const g = (k: string, d: number) => num(P[k], d);
    const img = (i: number) => imgs[i] ?? placeholder(i);
    const handles: Record<string, number[]> = {};
    ctx.clearRect(0, 0, W, H);
    if (sc.bg && sc.bg !== 'transparent') {
      const c = sc.bg.split(',');
      if (c.length > 1) {
        const gr = ctx.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, c[0].trim());
        gr.addColorStop(1, c[1].trim());
        ctx.fillStyle = gr;
      } else ctx.fillStyle = c[0];
      ctx.fillRect(0, 0, W, H);
    }
    const L = Math.max(1, sc.loop || 6);

    if (sc.module === 'kenburns') {
      const p = P.ease === 'linear' ? clamp(t / L) : inout(t / L);
      drawCover(ctx, img(0), W, H, lerp(g('fz', 1), g('tz', 1.35), p), lerp(g('fx', 0.5), g('tx', 0.6), p), lerp(g('fy', 0.5), g('ty', 0.45), p));
    }

    if (sc.module === 'swing') {
      const im = img(0);
      const aspect = g('aspect', 0) || im.width / im.height;
      let cw = W * g('size', 0.78);
      let ch = cw / aspect;
      if (ch > H * 0.8) {
        ch = H * 0.8;
        cw = ch * aspect;
      }
      const e = back(t / 0.8);
      const from = String(P.from ?? 'left');
      const dist = Math.max(W, H) * 0.9;
      const ox = from === 'left' ? -dist : from === 'right' ? dist : 0;
      const oy = from === 'top' ? -dist : from === 'bottom' ? dist : 0;
      const float = g('float', 1) ? Math.sin(t * 1.4) * 6 * u : 0;
      const cx = g('px', 0.5) * W + ox * (1 - e);
      const cy = g('py', 0.46) * H + oy * (1 - e) + float;
      const tx = frameTex(im, cw, ch, g('border', 18) * u, g('radius', 10) * u, String(P.frame ?? '#ffffff'));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((lerp(g('angle', -28), g('rest', -4), e) * Math.PI) / 180);
      const s = lerp(g('scale', 1.6), 1, clamp(e));
      ctx.scale(s, s);
      ctx.globalAlpha *= clamp(t / 0.15);
      ctx.drawImage(tx, -cw / 2, -ch / 2, cw, ch);
      ctx.restore();
      handles.card = [g('px', 0.5) * W, g('py', 0.46) * H];
    }

    if (sc.module === 'tilt') {
      const im = img(0);
      const aspect = g('aspect', 0) || im.width / im.height;
      let cw = W * g('size', 0.78);
      let ch = cw / aspect;
      if (ch > H * 0.75) {
        ch = H * 0.75;
        cw = ch * aspect;
      }
      const tx = frameTex(im, cw, ch, g('border', 0) * u, g('radius', 18) * u, String(P.frame ?? '#ffffff'));
      frameKey.set(tx, `${(im as { src?: string }).src ?? ''}|${cw}|${g('border', 0)}|${g('radius', 18)}`);
      const e = ease(t / 1.1);
      const sway = Math.sin((t / Math.max(0.5, g('period', 4))) * Math.PI * 2) * g('sway', 6) * clamp((t - 0.9) / 0.6);
      const ry = ((lerp(g('ry0', -55), g('ry', -14), e) + sway) * Math.PI) / 180;
      const rx = ((g('rx', 8) + sway * 0.3) * Math.PI) / 180;
      drawCard3D(ctx, W, H, tx, g('px', 0.5) * W, g('py', 0.47) * H, cw, ch, g('depth', 18) * u, rx, ry, String(P.edge ?? '#e8e2d6'), clamp(t / 0.2));
      handles.card = [g('px', 0.5) * W, g('py', 0.47) * H];
    }

    if (sc.module === 'compare') {
      // 前後對比的示意圖：圖片 1 為施工前、圖片 2 為完工
      const A = imgs[0] ?? placeholder(0, false);
      const B = imgs[1] ?? placeholder(1, true);
      const vert = P.dir === 'v';
      const hold = g('hold', 0.8);
      const sweep = Math.max(0.3, g('sweep', 1.6));
      const pos = lerp(g('from', 0.85), g('to', 0.15), inout((t - hold) / sweep));
      drawCover(ctx, B, W, H, 1, 0.5, 0.5);
      ctx.save();
      ctx.beginPath();
      if (vert) ctx.rect(0, 0, W, H * pos);
      else ctx.rect(0, 0, W * pos, H);
      ctx.clip();
      drawCover(ctx, A, W, H, 1, 0.5, 0.5);
      ctx.restore();
      const lw = 6 * u;
      ctx.fillStyle = String(P.line ?? '#ffffff');
      if (vert) ctx.fillRect(0, H * pos - lw / 2, W, lw);
      else ctx.fillRect(W * pos - lw / 2, 0, lw, H);
      const kx = vert ? W / 2 : W * pos;
      const ky = vert ? H * pos : H / 2;
      const kr = 44 * u;
      ctx.fillStyle = String(P.knob ?? '#ff5a36');
      ctx.beginPath();
      ctx.arc(kx, ky, kr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        if (vert) {
          ctx.moveTo(kx - kr * 0.32, ky + sgn * kr * 0.2);
          ctx.lineTo(kx + kr * 0.32, ky + sgn * kr * 0.2);
          ctx.lineTo(kx, ky + sgn * kr * 0.55);
        } else {
          ctx.moveTo(kx + sgn * kr * 0.2, ky - kr * 0.32);
          ctx.lineTo(kx + sgn * kr * 0.2, ky + kr * 0.32);
          ctx.lineTo(kx + sgn * kr * 0.55, ky);
        }
        ctx.fill();
      }
      const tag = (text: string, x: number, y: number, align: 'left' | 'right') => {
        if (!text) return;
        const fs = 36 * u;
        ctx.font = `900 ${fs}px ${FONT}`;
        const w = ctx.measureText(text).width + fs * 1.2;
        const h = fs * 1.6;
        const x0 = align === 'left' ? x : x - w;
        ctx.fillStyle = '#1c1c1cdd';
        ctx.beginPath();
        ctx.roundRect(x0, y, w, h, h / 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x0 + w / 2, y + h / 2);
      };
      const m = 36 * u;
      tag(String(P.labelA ?? ''), m, vert ? m : H * 0.08, 'left');
      tag(String(P.labelB ?? ''), vert ? m : W - m, vert ? H - m - 58 * u : H * 0.08, vert ? 'left' : 'right');
      handles.divider = [kx, ky];
    }

    if (sc.module === 'magnify') {
      const im = img(0);
      const z = lerp(1, g('push', 1.06), clamp(t / L));
      const cp = drawCover(ctx, im, W, H, z, 0.5, 0.5);
      const ax = g('ax', 0.38) * W;
      const ay = g('ay', 0.58) * H;
      const ar = g('ar', 0.07) * S;
      const lx = g('lx', 0.66) * W;
      const ly = g('ly', 0.3) * H;
      const lr = g('lr', 0.2) * S;
      const ring = String(P.ring ?? '#ffd23f');
      const lw = 7 * u;
      const p1 = ease((t - 0.3) / 0.5);
      if (p1 > 0) {
        ctx.strokeStyle = ring;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.arc(ax, ay, ar, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p1);
        ctx.stroke();
      }
      const p2 = ease((t - 0.75) / 0.4);
      if (p2 > 0) {
        const ang = Math.atan2(ly - ay, lx - ax);
        const x1 = ax + Math.cos(ang) * ar;
        const y1 = ay + Math.sin(ang) * ar;
        const x2 = lx - Math.cos(ang) * lr;
        const y2 = ly - Math.sin(ang) * lr;
        ctx.strokeStyle = ring;
        ctx.lineWidth = lw * 0.7;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(lerp(x1, x2, p2), lerp(y1, y2, p2));
        ctx.stroke();
      }
      const p3 = back((t - 1.05) / 0.5);
      if (t > 1.05) {
        const r = lr * Math.max(0.01, p3);
        const mag = lr / ar;
        ctx.save();
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#111';
        ctx.fillRect(lx - r, ly - r, r * 2, r * 2);
        // 鏡頭內：把目標點對齊鏡頭中心並放大
        ctx.translate(lx, ly);
        ctx.scale(mag, mag);
        ctx.translate(-ax, -ay);
        ctx.drawImage(im, cp.sx, cp.sy, cp.vw, cp.vh, 0, 0, W, H);
        ctx.restore();
        ctx.strokeStyle = ring;
        ctx.lineWidth = lw * 1.2;
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      handles.target = [ax, ay];
      handles.lens = [lx, ly];
    }

    drawCaption(ctx, W, H, sc.caption, t, u);
    if (sc.caption?.text) handles.caption = [sc.caption.x * W, sc.caption.y * H];
    return handles;
  };

  return { drawPhoto, coverParams, placeholder };
};

export const { drawPhoto, coverParams, placeholder } = photoRenderer();
(globalThis as unknown as { MA_PHOTO: unknown }).MA_PHOTO = { drawPhoto };
