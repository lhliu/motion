// 物件特效：隕石、魔術方塊、星空宇宙。跟水滴一樣是參數化的一系列，全部硬邊、不用模糊與陰影，可透明疊進影片。
// objRenderer 內部必須自給自足，匯出 HTML 時以 toString() 內嵌。
import type { PField } from './photokit';

export type OModule = 'meteor' | 'cube' | 'cosmos' | 'aerial' | 'vehicle';

export interface OText {
  lines: string[];
  /** 文字在物件上、下方、上方，或不顯示 */
  layout: 'over' | 'below' | 'above' | 'none';
  color: string;
  size: number;
  stroke: string;
  strokeW: number;
  delay: number;
}

export interface OScene {
  ratio: '9:16' | '16:9' | '1:1';
  loop: number;
  module: OModule;
  /** transparent｜#hex｜#hex,#hex */
  bg: string;
  params: Record<string, number | string>;
  text: OText;
  font?: string;
}

export const OBJ_INFO: Record<OModule, { zh: string; en: string; desc: string }> = {
  meteor: { zh: '隕石', en: 'Meteor', desc: '漂浮或墜落的隕石，形狀可隨機、對稱、圓潤或碎片，材質有岩石、冰晶、熔岩、金屬' },
  cube: { zh: '魔術方塊', en: 'Rubik Cube', desc: '立體魔術方塊緩慢旋轉並轉動層，材質有塑膠、金屬、花色、單色' },
  cosmos: { zh: '星空宇宙', en: 'Cosmos', desc: '閃爍星空、光速穿越、旋轉星系、行星光環，可加流星' },
  aerial: { zh: '俯瞰', en: 'Aerial View', desc: '從正上方往下看的城市、河流、山川、草原牛馬、農田、海岸、森林、交流道，鏡頭緩慢平移推近' },
  vehicle: { zh: '交通工具', en: 'Vehicles', desc: '飛機、太空船、汽車、馬車、火車、輪船、熱氣球，側面行進、背景捲動' },
};
export const OBJ_MODULES = Object.keys(OBJ_INFO) as OModule[];

export const OBJ_DEFAULTS: Record<OModule, Record<string, number | string>> = {
  meteor: { shape: 'random', material: 'rock', sym: 6, seed: 7, size: 0.42, x: 0.5, y: 0.42, rough: 0.45, craters: 6, color: '#8a7f72', color2: '#4a423a', spin: 10, float: 1, debris: 4, trail: 0, angle: -35, rimW: 0, rim: '#ffffff' },
  cube: { n: 3, material: 'plastic', pattern: 'stripe', scheme: 'classic', mono: '#ff5a36', body: '#151515', size: 0.36, x: 0.5, y: 0.42, tilt: -28, turn: 35, spin: 14, twist: 1, speed: 1 },
  cosmos: { mode: 'stars', density: 1, speed: 1, color: '#ffffff', color2: '#8ab4ff', planet: '#e8a35c', ring: 1, shoot: 1, x: 0.5, y: 0.42, size: 0.32 },
  aerial: { mode: 'city', seed: 3, pan: 1, dir: -30, zoom: 1.25, rot: 0, traffic: 1, herd: 18, x: 0.5, y: 0.45 },
  vehicle: { mode: 'car', color: '#ff5a36', color2: '#ffffff', size: 0.5, speed: 1, scene: 1, x: 0.5, y: 0.45 },
};
/** 隕石材質的預設配色（換材質時一起換） */
export const METEOR_COLORS: Record<string, [string, string]> = { rock: ['#8a7f72', '#4a423a'], ice: ['#cfeaf7', '#6aa5c8'], lava: ['#3a2a26', '#1a1210'], metal: ['#c9a65a', '#6e5525'] };
const BG: Record<OModule, string> = { meteor: '#0b0d14', cube: '#151515', cosmos: '#05070d', aerial: '#cfc9bd', vehicle: '#bfe3f7' };

const pos = (k: string, label: string): PField => ({ k, label, type: 'range', min: 0, max: 1, step: 0.01 });
export const OBJ_PARAMS: Record<OModule, PField[]> = {
  meteor: [
    { k: 'shape', label: '形狀', type: 'seg', opts: [['random', '隨機'], ['sym', '對稱'], ['round', '圓潤'], ['shard', '碎片']] },
    { k: 'material', label: '材質', type: 'seg', opts: [['rock', '岩石'], ['ice', '冰晶'], ['lava', '熔岩'], ['metal', '金屬']] },
    { k: 'sym', label: '對稱瓣數', type: 'range', min: 3, max: 12, step: 1 },
    { k: 'seed', label: '形狀變化', type: 'range', min: 1, max: 99, step: 1 },
    { k: 'rough', label: '凹凸程度', type: 'range', min: 0, max: 1, step: 0.01 },
    { k: 'craters', label: '坑洞數', type: 'range', min: 0, max: 14, step: 1 },
    { k: 'size', label: '大小', type: 'range', min: 0.1, max: 0.9, step: 0.01 },
    { k: 'color', label: '亮面顏色', type: 'color' },
    { k: 'color2', label: '暗面顏色', type: 'color' },
    { k: 'spin', label: '自轉（度/秒）', type: 'range', min: -60, max: 60, step: 1 },
    { k: 'float', label: '漂浮', type: 'seg', opts: [['1', '開'], ['0', '關']] },
    { k: 'debris', label: '周圍碎石', type: 'range', min: 0, max: 12, step: 1 },
    { k: 'trail', label: '墜落尾跡', type: 'seg', opts: [['0', '無'], ['1', '有']] },
    { k: 'angle', label: '墜落方向', type: 'range', min: -180, max: 180, step: 1 },
    { k: 'rimW', label: '外框粗細', type: 'range', min: 0, max: 14, step: 1 },
    { k: 'rim', label: '外框顏色', type: 'color' },
  ],
  cube: [
    { k: 'n', label: '階數', type: 'seg', opts: [['2', '2×2'], ['3', '3×3'], ['4', '4×4']] },
    { k: 'material', label: '材質', type: 'seg', opts: [['plastic', '塑膠'], ['metal', '金屬'], ['pattern', '花色'], ['mono', '單色']] },
    { k: 'pattern', label: '花色樣式', type: 'seg', opts: [['stripe', '條紋'], ['dot', '圓點'], ['check', '格紋']] },
    { k: 'scheme', label: '配色', type: 'seg', opts: [['classic', '經典六色'], ['pastel', '粉彩'], ['brand', '主色系']] },
    { k: 'mono', label: '主色／單色', type: 'color' },
    { k: 'body', label: '方塊本體', type: 'color' },
    { k: 'size', label: '大小', type: 'range', min: 0.15, max: 0.6, step: 0.01 },
    { k: 'tilt', label: '俯仰角', type: 'range', min: -60, max: 60, step: 1 },
    { k: 'turn', label: '水平角', type: 'range', min: -180, max: 180, step: 1 },
    { k: 'spin', label: '自轉（度/秒）', type: 'range', min: -60, max: 60, step: 1 },
    { k: 'twist', label: '轉動層', type: 'seg', opts: [['1', '開'], ['0', '關']] },
    { k: 'speed', label: '轉動速度', type: 'range', min: 0.3, max: 3, step: 0.1 },
  ],
  cosmos: [
    { k: 'mode', label: '畫面', type: 'seg', opts: [['stars', '閃爍星空'], ['warp', '光速穿越'], ['galaxy', '旋轉星系'], ['planet', '行星光環']] },
    { k: 'density', label: '星星數量', type: 'range', min: 0.2, max: 3, step: 0.1 },
    { k: 'speed', label: '速度', type: 'range', min: 0, max: 3, step: 0.05 },
    { k: 'color', label: '主色', type: 'color' },
    { k: 'color2', label: '輔色', type: 'color' },
    { k: 'planet', label: '行星顏色', type: 'color' },
    { k: 'ring', label: '行星光環', type: 'seg', opts: [['1', '有'], ['0', '無']] },
    { k: 'shoot', label: '流星', type: 'seg', opts: [['1', '有'], ['0', '無']] },
    { k: 'size', label: '星系／行星大小', type: 'range', min: 0.1, max: 0.6, step: 0.01 },
  ],
  aerial: [
    { k: 'mode', label: '地景', type: 'seg', opts: [['city', '城市'], ['river', '河流'], ['mountain', '山川'], ['grass', '草原牛馬'], ['farm', '農田'], ['coast', '海岸'], ['forest', '森林'], ['highway', '交流道']] },
    { k: 'seed', label: '地形變化', type: 'range', min: 1, max: 99, step: 1 },
    { k: 'pan', label: '平移量', type: 'range', min: 0, max: 3, step: 0.05 },
    { k: 'dir', label: '平移方向', type: 'range', min: -180, max: 180, step: 1 },
    { k: 'zoom', label: '推近倍數', type: 'range', min: 0.8, max: 2.5, step: 0.01 },
    { k: 'rot', label: '畫面旋轉', type: 'range', min: -45, max: 45, step: 1 },
    { k: 'traffic', label: '車流量', type: 'range', min: 0, max: 1, step: 0.05 },
    { k: 'herd', label: '牛馬數量', type: 'range', min: 0, max: 26, step: 1 },
    { k: 'color', label: '地面色（留白＝預設）', type: 'color' },
  ],
  vehicle: [
    { k: 'mode', label: '交通工具', type: 'seg', opts: [['car', '汽車'], ['carriage', '馬車'], ['plane', '飛機'], ['rocket', '太空船'], ['train', '火車'], ['ship', '輪船'], ['balloon', '熱氣球']] },
    { k: 'color', label: '主色', type: 'color' },
    { k: 'color2', label: '輔色', type: 'color' },
    { k: 'size', label: '大小', type: 'range', min: 0.2, max: 0.95, step: 0.01 },
    { k: 'speed', label: '速度', type: 'range', min: 0, max: 3, step: 0.05 },
    { k: 'scene', label: '背景（路面、雲、海、星）', type: 'seg', opts: [['1', '有'], ['0', '只有交通工具']] },
  ],
};

export const objFxPrefix = 'obj-';
/** 放進 Combo 時用的特效代碼（場景 JSON 會覆蓋卡片預設，所以每個模組用第一張卡即可） */
export const objFxId = (m: OModule) => ({ meteor: 'obj-meteor-rock', cube: 'obj-cube-plastic', cosmos: 'obj-cosmos-stars', aerial: 'obj-aerial-city', vehicle: 'obj-vehicle-car' })[m];
export const isObjFx = (id: string) => id.startsWith(objFxPrefix);
export const objFxModule = (id: string): OModule => (OBJ_MODULES.find((m) => id.startsWith(`${objFxPrefix}${m}`)) ?? 'meteor');

export const defaultObjScene = (module: OModule = 'meteor'): OScene => ({
  ratio: '9:16',
  loop: 6,
  module,
  bg: BG[module],
  params: { ...OBJ_DEFAULTS[module] },
  text: { lines: [], layout: module === 'cosmos' || module === 'aerial' ? 'over' : 'below', color: module === 'vehicle' ? '#1d2433' : '#ffffff', size: 1, stroke: module === 'vehicle' ? '#ffffff' : '#111111', strokeW: module === 'aerial' ? 14 : module === 'vehicle' ? 10 : 0, delay: 0.6 },
});

/** 補齊缺漏欄位並夾住範圍，AI 給的資料也能安全使用 */
export const normalizeObjScene = (raw: Partial<OScene>, fallback: OModule = 'meteor'): OScene => {
  const module = OBJ_MODULES.includes(raw.module as OModule) ? (raw.module as OModule) : fallback;
  const base = defaultObjScene(module);
  const ratio = (['9:16', '16:9', '1:1'] as const).includes(raw.ratio as OScene['ratio']) ? (raw.ratio as OScene['ratio']) : base.ratio;
  const loop = Math.max(2, Math.min(20, Number(raw.loop) || base.loop));
  const params: Record<string, number | string> = { ...base.params };
  for (const f of OBJ_PARAMS[module]) {
    const v = raw.params?.[f.k];
    if (v === undefined || v === null || v === '') continue;
    if (f.type === 'range') {
      const n = Number(v);
      if (Number.isFinite(n)) params[f.k] = Math.max(f.min, Math.min(f.max, n));
    } else if (f.type === 'seg') {
      if (f.opts.some(([o]) => o === String(v))) params[f.k] = /^\d+$/.test(String(v)) ? Number(v) : String(v);
    } else if (/^#[0-9a-f]{6}$/i.test(String(v))) params[f.k] = String(v);
  }
  if (module === 'meteor' && raw.params?.material && raw.params.color === undefined) [params.color, params.color2] = METEOR_COLORS[String(params.material)] ?? METEOR_COLORS.rock;
  if (module === 'cosmos' && params.mode === 'galaxy' && raw.params?.size === undefined) params.size = 0.62;
  for (const k of ['x', 'y']) if (Number.isFinite(Number(raw.params?.[k]))) params[k] = Math.max(0, Math.min(1, Number(raw.params![k])));
  const t = raw.text ?? base.text;
  const text: OText = {
    lines: Array.isArray(t.lines) ? t.lines.map(String).filter(Boolean).slice(0, 4).map((l) => l.slice(0, 40)) : [],
    layout: (['over', 'below', 'above', 'none'] as const).includes(t.layout) ? t.layout : base.text.layout,
    color: /^#[0-9a-f]{6}$/i.test(String(t.color)) ? String(t.color) : '#ffffff',
    size: Math.max(0.3, Math.min(3, Number(t.size) || 1)),
    stroke: /^#[0-9a-f]{6}$/i.test(String(t.stroke)) ? String(t.stroke) : '#111111',
    strokeW: Math.max(0, Math.min(30, Number(t.strokeW) || 0)),
    delay: Math.max(0, Math.min(10, Number(t.delay ?? 0.6))),
  };
  const bg = typeof raw.bg === 'string' && /^(transparent|#[0-9a-f]{3,8}(,\s*#[0-9a-f]{3,8})?)$/i.test(raw.bg.trim()) ? raw.bg.trim() : base.bg;
  return { ratio, loop, module, bg, params, text, ...(typeof raw.font === 'string' && /^[a-z]{2,12}$/.test(raw.font) ? { font: raw.font } : {}) };
};

/** words 裡以 { 開頭的字串視為場景 JSON；否則當成文字行，並套用該卡片的預設參數 */
export const objSceneFromWords = (w: string[], module: OModule, preset: Record<string, number | string> = {}): OScene => {
  const j = w.find((x) => String(x).trim().startsWith('{'));
  if (j) {
    try {
      return normalizeObjScene(JSON.parse(j) as Partial<OScene>, module);
    } catch {
      /* 格式錯誤時退回預設 */
    }
  }
  const sc = defaultObjScene(module);
  sc.params = { ...sc.params, ...preset };
  if (typeof preset.bg === 'string') sc.bg = preset.bg;
  if (typeof preset.layout === 'string') sc.text.layout = preset.layout as OText['layout'];
  sc.text.lines = w.filter((x) => x && !x.startsWith('{')).slice(0, 4);
  return sc;
};

/** 繪製引擎工廠 */
export const objRenderer = () => {
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
  const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : Number.isFinite(parseFloat(String(v))) ? parseFloat(String(v)) : d);
  const FONT = '"MA Num", "Chiron Hei HK", "Noto Sans TC", "PingFang TC", sans-serif';
  let F = FONT;
  /** 可重現的亂數 */
  const rng = (seed: number) => {
    let a = (seed * 2654435761) >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const hex = (h: string) => {
    const s = h.replace('#', '');
    return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) || 0);
  };
  const mix = (a: string, b: string, k: number) => {
    const x = hex(a);
    const y = hex(b);
    return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
  };

  /* ───────── 隕石 ───────── */
  const shapeCache = new Map<string, number[][]>();
  /** 外形：單位圓上的點（半徑約 1） */
  const meteorShape = (shape: string, sym: number, seed: number, rough: number) => {
    const key = `${shape}|${sym}|${seed}|${rough}`;
    let pts = shapeCache.get(key);
    if (pts) return pts;
    const r = rng(seed);
    pts = [];
    if (shape === 'shard') {
      const m = 6 + Math.floor(r() * 4);
      for (let i = 0; i < m; i++) {
        const a = (i / m) * Math.PI * 2 + (r() - 0.5) * 0.5;
        const rr = 1 - rough * 0.35 * r();
        pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
      }
    } else {
      const harm = [2, 3, 4, 5, 7].map((k) => [k, (r() - 0.5) * 2, r() * Math.PI * 2]);
      const N = 72;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        let d = 0;
        if (shape === 'sym') d = 0.5 * Math.cos(sym * a + harm[0][2]) + 0.12 * Math.cos(sym * 2 * a);
        else if (shape === 'round') d = harm.reduce((s, [k, amp, ph]) => s + (amp * 0.25 * Math.cos(k * a + ph)) / k, 0);
        else d = harm.reduce((s, [k, amp, ph]) => s + (amp * Math.cos(k * a + ph)) / Math.sqrt(k), 0) * 0.55;
        const rr = 1 + rough * 0.35 * d;
        pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
      }
    }
    if (shapeCache.size > 60) shapeCache.clear();
    shapeCache.set(key, pts);
    return pts;
  };
  const path = (ctx: CanvasRenderingContext2D, pts: number[][], R: number, ox = 0, oy = 0) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(ox + x * R, oy + y * R) : ctx.moveTo(ox + x * R, oy + y * R)));
    ctx.closePath();
  };
  const drawRock = (ctx: CanvasRenderingContext2D, P: Record<string, number | string>, R: number, rot: number, t: number, u: number, seed: number, detail: boolean) => {
    const g = (k: string, d: number) => num(P[k], d);
    const mat = String(P.material ?? 'rock');
    const pal: Record<string, [string, string]> = { rock: ['#8a7f72', '#4a423a'], ice: ['#cfeaf7', '#6aa5c8'], lava: ['#3a2a26', '#1a1210'], metal: ['#c9a65a', '#6e5525'] };
    const c1 = String(P.color ?? pal[mat]?.[0] ?? '#8a7f72');
    const c2 = String(P.color2 ?? pal[mat]?.[1] ?? '#4a423a');
    const pts = meteorShape(String(P.shape ?? 'random'), Math.round(g('sym', 6)), seed, g('rough', 0.45));
    ctx.save();
    ctx.rotate(rot);
    // 暗面：整個形狀；亮面：往光源（左上）位移的同形狀，裁在本體內
    path(ctx, pts, R);
    ctx.fillStyle = c2;
    ctx.fill();
    ctx.save();
    path(ctx, pts, R);
    ctx.clip();
    ctx.rotate(-rot);
    const lx = -R * 0.2;
    const ly = -R * 0.22;
    ctx.rotate(rot);
    const cr = Math.cos(-rot);
    const sr = Math.sin(-rot);
    const ox = lx * cr - ly * sr;
    const oy = lx * sr + ly * cr;
    path(ctx, pts, R * 0.97, ox, oy);
    ctx.fillStyle = c1;
    ctx.fill();
    // 高光月牙
    path(ctx, pts, R * 0.78, ox * 1.9, oy * 1.9);
    ctx.fillStyle = mix(c1, '#ffffff', mat === 'ice' ? 0.55 : 0.18);
    ctx.globalAlpha *= 0.55;
    ctx.fill();
    ctx.globalAlpha /= 0.55;
    const r = rng(seed * 7 + 3);
    if (detail && (mat === 'rock' || mat === 'metal')) {
      const n = Math.round(g('craters', 6));
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * 0.62;
        const cx = Math.cos(a) * d * R;
        const cy = Math.sin(a) * d * R;
        const cR = (0.07 + r() * 0.12) * R;
        ctx.fillStyle = mix(c2, '#000000', 0.25);
        ctx.beginPath();
        ctx.ellipse(cx, cy, cR, cR * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
        // 坑洞右下緣受光
        ctx.strokeStyle = mix(c1, '#ffffff', 0.15);
        ctx.lineWidth = Math.max(1, cR * 0.22);
        ctx.beginPath();
        ctx.ellipse(cx, cy, cR, cR * 0.85, 0, -rot + 0.1, -rot + Math.PI * 0.9);
        ctx.stroke();
      }
    }
    if (detail && mat === 'metal') {
      ctx.fillStyle = 'rgba(255,240,200,0.35)';
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate(-rot - 0.7);
        ctx.fillRect(-R * 1.2, -R * 0.55 + i * R * 0.42, R * 2.4, R * (0.07 + i * 0.03));
        ctx.restore();
      }
    }
    if (detail && mat === 'ice') {
      // 冰晶切面：幾塊實色三角
      for (let i = 0; i < 6; i++) {
        const a = r() * Math.PI * 2;
        const b = a + 0.6 + r() * 0.8;
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.28)' : 'rgba(40,90,130,0.22)';
        ctx.beginPath();
        ctx.moveTo((r() - 0.5) * R * 0.3, (r() - 0.5) * R * 0.3);
        ctx.lineTo(Math.cos(a) * R * 1.2, Math.sin(a) * R * 1.2);
        ctx.lineTo(Math.cos(b) * R * 1.2, Math.sin(b) * R * 1.2);
        ctx.fill();
      }
    }
    if (detail && mat === 'lava') {
      // 熔岩裂縫：發亮的折線（實色，脈動只改粗細）
      const pulse = 0.8 + 0.2 * Math.sin(t * 3);
      for (let i = 0; i < 7; i++) {
        let x = (r() - 0.5) * R * 0.3;
        let y = (r() - 0.5) * R * 0.3;
        let a = r() * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let k = 0; k < 5; k++) {
          a += (r() - 0.5) * 1.2;
          x += Math.cos(a) * R * 0.2;
          y += Math.sin(a) * R * 0.2;
          ctx.lineTo(x, y);
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#ff6a1f';
        ctx.lineWidth = R * 0.07 * pulse;
        ctx.stroke();
        ctx.strokeStyle = '#ffd34d';
        ctx.lineWidth = R * 0.025 * pulse;
        ctx.stroke();
      }
    }
    ctx.restore();
    const rimW = g('rimW', 0) * u;
    if (rimW > 0) {
      path(ctx, pts, R);
      ctx.strokeStyle = String(P.rim ?? '#ffffff');
      ctx.lineWidth = rimW;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    ctx.restore();
    return pts;
  };
  const drawMeteor = (ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, number | string>, t: number, u: number) => {
    const g = (k: string, d: number) => num(P[k], d);
    const S = Math.min(W, H);
    const R = (g('size', 0.42) * S) / 2;
    const e = back(t / 0.7);
    const fl = g('float', 1) ? Math.sin(t * 1.3) * 0.018 * S : 0;
    const X = g('x', 0.5) * W;
    const Y = g('y', 0.42) * H + fl;
    const seed = Math.round(g('seed', 7));
    const ang = (g('angle', -35) * Math.PI) / 180;
    // 墜落尾跡：往反方向拉出幾條逐漸變窄的實色長條
    if (g('trail', 0)) {
      const len = R * 3.2 * ease(t / 0.8);
      const bx = -Math.cos(ang);
      const by = -Math.sin(ang);
      const nx = -by;
      const ny = bx;
      const cols = ['#ffd34d', '#ff8a3d', '#ff5a36'];
      cols.forEach((c, i) => {
        const w = R * (0.95 - i * 0.28);
        const L = len * (1 - i * 0.18);
        ctx.fillStyle = c;
        ctx.globalAlpha = 0.85 - i * 0.15;
        ctx.beginPath();
        ctx.moveTo(X + nx * w, Y + ny * w);
        ctx.lineTo(X + bx * L, Y + by * L);
        ctx.lineTo(X - nx * w, Y - ny * w);
        ctx.closePath();
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    // 周圍碎石
    const nd = Math.round(g('debris', 4));
    const r = rng(seed * 13 + 5);
    for (let i = 0; i < nd; i++) {
      const a = r() * Math.PI * 2 + t * 0.15 * (r() > 0.5 ? 1 : -1);
      const d = R * (1.35 + r() * 0.8);
      const rr = R * (0.08 + r() * 0.12);
      const de = ease((t - 0.3 - i * 0.08) / 0.5);
      if (de <= 0) continue;
      ctx.save();
      ctx.translate(X + Math.cos(a) * d, Y + Math.sin(a) * d * 0.8 + Math.sin(t * 1.7 + i) * 0.01 * S);
      ctx.globalAlpha = de;
      drawRock(ctx, { ...P, shape: 'shard', rimW: 0 }, rr, t * 0.8 + i, t, u, seed + i * 31, false);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(X, Y);
    ctx.scale(e, e);
    drawRock(ctx, P, R, (g('spin', 10) * Math.PI * t) / 180, t, u, seed, true);
    ctx.restore();
    return { cx: X, cy: Y, r: R };
  };

  /* ───────── 魔術方塊 ───────── */
  const SCHEMES: Record<string, string[]> = {
    // 順序：+x 右、-x 左、+y 上、-y 下、+z 前、-z 後
    classic: ['#d7263d', '#ff8c1a', '#ffffff', '#ffd23f', '#1fa463', '#2f6fde'],
    pastel: ['#f6a6b2', '#f9c89b', '#fdfbf3', '#fbe7a1', '#a8e0c2', '#a9c6f5'],
  };
  type V3 = [number, number, number];
  const rotV = (v: V3, axis: number, a: number): V3 => {
    const c = Math.cos(a);
    const s = Math.sin(a);
    const [x, y, z] = v;
    if (axis === 0) return [x, y * c - z * s, y * s + z * c];
    if (axis === 1) return [x * c + z * s, y, -x * s + z * c];
    return [x * c - y * s, x * s + y * c, z];
  };
  const MOVES: [number, number, number][] = [
    [1, 1, 1],
    [0, 1, -1],
    [2, -1, 1],
    [1, -1, -1],
  ];
  const drawCube = (ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, number | string>, t: number, u: number) => {
    const g = (k: string, d: number) => num(P[k], d);
    const S = Math.min(W, H);
    const n = Math.max(2, Math.min(4, Math.round(g('n', 3))));
    const half = (n - 1) / 2;
    const unit = (g('size', 0.36) * S) / n / 1.35;
    const X = g('x', 0.5) * W;
    const Y = g('y', 0.42) * H + Math.sin(t * 1.2) * 0.012 * S;
    const mat = String(P.material ?? 'plastic');
    const mono = String(P.mono ?? '#ff5a36');
    const scheme = String(P.scheme ?? 'classic');
    const cols =
      mat === 'mono'
        ? [mono, mono, mono, mono, mono, mono]
        : scheme === 'brand'
          ? [mono, mix(mono, '#000000', 0.35), mix(mono, '#ffffff', 0.55), mix(mono, '#ffffff', 0.25), mix(mono, '#000000', 0.15), mix(mono, '#ffffff', 0.8)]
          : SCHEMES[scheme] ?? SCHEMES.classic;
    const body = mat === 'metal' ? '#b8bcc4' : String(P.body ?? '#151515');
    // 轉層：依序轉、再依相反順序轉回，整個循環回到原狀
    const sp = Math.max(0.3, g('speed', 1));
    const dur = 0.55 / sp;
    const gap = 0.35 / sp;
    const seq = g('twist', 1) ? [...MOVES.map((m) => [...m]), ...[...MOVES].reverse().map(([a, l, d]) => [a, l, -d])] : [];
    const layer = (l: number) => (l === 0 ? 0 : l > 0 ? half : -half);
    type Cubie = { p: V3; f: V3[] };
    const cubies: Cubie[] = [];
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        for (let k = 0; k < n; k++) {
          const p: V3 = [i - half, j - half, k - half];
          if (Math.max(Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2])) < half - 0.01) continue;
          cubies.push({ p, f: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] });
        }
    const orig = cubies.map((c) => [...c.p] as V3);
    let partial: { axis: number; l: number; a: number } | null = null;
    seq.forEach(([axis, l, d], i) => {
      const t0 = 0.7 + i * (dur + gap);
      const q = (t - t0) / dur;
      if (q <= 0) return;
      const lv = layer(l);
      const a = (d * Math.PI) / 2;
      if (q >= 1) {
        cubies.forEach((c) => {
          if (Math.abs(c.p[axis] - lv) < 0.01) {
            c.p = rotV(c.p, axis, a).map((v) => Math.round(v * 2) / 2) as V3;
            c.f = c.f.map((v) => rotV(v, axis, a).map((x) => Math.round(x)) as V3);
          }
        });
      } else partial = { axis, l: lv, a: a * inout(q) };
    });
    const rx = (g('tilt', -28) * Math.PI) / 180;
    const ry = ((g('turn', 35) + g('spin', 14) * t) * Math.PI) / 180;
    const view = (v: V3): V3 => rotV(rotV(v, 1, ry), 0, rx);
    const camZ = n * 6;
    const proj = (v: V3) => {
      const k = camZ / (camZ - v[2]);
      return [X + v[0] * unit * k, Y - v[1] * unit * k];
    };
    const light: V3 = [-0.45, 0.65, 0.6];
    const ll = Math.hypot(...light);
    type Face = { z: number; pts: number[][]; col: string | null; shade: number; key: number };
    const faces: Face[] = [];
    const e = back(t / 0.6);
    cubies.forEach((c, ci) => {
      const tw = partial && Math.abs(c.p[(partial as { axis: number }).axis] - (partial as { l: number }).l) < 0.01 ? (partial as { axis: number; a: number }) : null;
      const tr = (v: V3): V3 => view(tw ? rotV(v, tw.axis, tw.a) : v);
      c.f.forEach((nrm, fi) => {
        const N = tr(nrm);
        if (N[2] <= 0.02) return;
        // 這一面在原始狀態朝外才有貼紙
        const o = orig[ci];
        const outward = Math.abs(o[[0, 0, 1, 1, 2, 2][fi]] - [1, -1, 1, -1, 1, -1][fi] * half) < 0.01;
        const ctr: V3 = [c.p[0] + nrm[0] * 0.5, c.p[1] + nrm[1] * 0.5, c.p[2] + nrm[2] * 0.5];
        const axes = [0, 1, 2].filter((a) => nrm[a] === 0);
        const s = 0.5 * e;
        const corners = [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ].map(([a, b]) => {
          const v: V3 = [ctr[0] * e, ctr[1] * e, ctr[2] * e];
          v[axes[0]] += a * s;
          v[axes[1]] += b * s;
          return tr(v);
        });
        const z = corners.reduce((sum, v) => sum + v[2], 0) / 4;
        const shade = Math.max(0, (N[0] * light[0] + N[1] * light[1] + N[2] * light[2]) / ll);
        faces.push({ z, pts: corners.map(proj), col: outward ? cols[fi] : null, shade, key: fi });
      });
    });
    faces.sort((a, b) => a.z - b.z);
    const pattern = String(P.pattern ?? 'stripe');
    faces.forEach((f) => {
      const [a, b, c, d] = f.pts;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.lineTo(d[0], d[1]);
      ctx.closePath();
      ctx.fillStyle = mat === 'metal' ? mix(body, '#ffffff', f.shade * 0.4) : body;
      ctx.fill();
      ctx.strokeStyle = mat === 'metal' ? '#7d828b' : body;
      ctx.lineWidth = Math.max(1, unit * 0.04);
      ctx.stroke();
      if (!f.col) return;
      // 貼紙：往中心內縮
      const cx = (a[0] + b[0] + c[0] + d[0]) / 4;
      const cy = (a[1] + b[1] + c[1] + d[1]) / 4;
      const ins = mat === 'metal' ? 0.8 : 0.82;
      const q = [a, b, c, d].map(([x, y]) => [cx + (x - cx) * ins, cy + (y - cy) * ins]);
      ctx.save();
      ctx.beginPath();
      q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      if (mat === 'metal') {
        const gr = ctx.createLinearGradient(q[0][0], q[0][1], q[2][0], q[2][1]);
        gr.addColorStop(0, mix(f.col, '#ffffff', 0.45));
        gr.addColorStop(0.5, f.col);
        gr.addColorStop(1, mix(f.col, '#000000', 0.35));
        ctx.fillStyle = gr;
      } else ctx.fillStyle = f.col;
      ctx.fill();
      ctx.clip();
      if (mat === 'pattern') {
        // 用仿射變換把單位方格對到貼紙上再畫花紋
        const [p0, p1, , p3] = q;
        ctx.transform(p1[0] - p0[0], p1[1] - p0[1], p3[0] - p0[0], p3[1] - p0[1], p0[0], p0[1]);
        ctx.fillStyle = mix(f.col, f.col === '#ffffff' || f.col === '#fdfbf3' ? '#999999' : '#ffffff', 0.55);
        if (pattern === 'stripe') for (let k = -1; k < 2; k += 0.25) {
          ctx.beginPath();
          ctx.moveTo(k, 0);
          ctx.lineTo(k + 0.1, 0);
          ctx.lineTo(k + 1.1, 1);
          ctx.lineTo(k + 1, 1);
          ctx.fill();
        }
        else if (pattern === 'dot') for (let x = 0.17; x < 1; x += 0.33) for (let y = 0.17; y < 1; y += 0.33) {
          ctx.beginPath();
          ctx.arc(x, y, 0.09, 0, Math.PI * 2);
          ctx.fill();
        }
        else for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) if ((x + y) % 2) ctx.fillRect(x / 4, y / 4, 0.25, 0.25);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      if (mat === 'metal') {
        // 金屬高光：一條硬邊斜帶
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(q[0][0], q[0][1]);
        ctx.lineTo(q[0][0] + (q[1][0] - q[0][0]) * 0.35, q[0][1] + (q[1][1] - q[0][1]) * 0.35);
        ctx.lineTo(q[3][0] + (q[2][0] - q[3][0]) * 0.1, q[3][1] + (q[2][1] - q[3][1]) * 0.1);
        ctx.lineTo(q[3][0], q[3][1]);
        ctx.fill();
      }
      ctx.restore();
      // 受光：亮面略白、背光略暗（實色疊加）
      ctx.beginPath();
      q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = f.shade > 0.6 ? `rgba(255,255,255,${(f.shade - 0.6) * 0.35})` : `rgba(0,0,0,${(0.6 - f.shade) * 0.45})`;
      ctx.fill();
    });
    return { cx: X, cy: Y, r: unit * n * 0.95 };
  };

  /* ───────── 星空宇宙 ───────── */
  const starCache = new Map<string, number[][]>();
  const stars = (count: number, seed: number) => {
    const key = `${count}|${seed}`;
    let s = starCache.get(key);
    if (!s) {
      const r = rng(seed);
      s = Array.from({ length: count }, () => [r(), r(), r(), r() * Math.PI * 2, r()]);
      starCache.set(key, s);
    }
    return s;
  };
  const sparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.18, y - s * 0.18);
    ctx.lineTo(x + s, y);
    ctx.lineTo(x + s * 0.18, y + s * 0.18);
    ctx.lineTo(x, y + s);
    ctx.lineTo(x - s * 0.18, y + s * 0.18);
    ctx.lineTo(x - s, y);
    ctx.lineTo(x - s * 0.18, y - s * 0.18);
    ctx.closePath();
    ctx.fill();
  };
  const drawCosmos = (ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, number | string>, t: number, u: number) => {
    const g = (k: string, d: number) => num(P[k], d);
    const S = Math.min(W, H);
    const mode = String(P.mode ?? 'stars');
    const sp = g('speed', 1);
    const c1 = String(P.color ?? '#ffffff');
    const c2 = String(P.color2 ?? '#8ab4ff');
    const dens = g('density', 1);
    const fade = ease(t / 0.6);
    const X = g('x', 0.5) * W;
    const Y = g('y', 0.42) * H;
    const R = (g('size', 0.32) * S) / 2;
    ctx.save();
    ctx.globalAlpha *= fade;
    if (mode === 'warp') {
      const list = stars(Math.round(260 * dens), 11);
      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.hypot(W, H) / 2;
      ctx.lineCap = 'round';
      list.forEach(([a, , b, ph, m]) => {
        const z = (b + t * 0.35 * Math.max(0.05, sp)) % 1;
        const r1 = Math.pow(z, 2.2) * maxR;
        const r0 = Math.pow(Math.max(0, z - 0.06 - 0.08 * sp), 2.2) * maxR;
        const ang = a * Math.PI * 2 + ph * 0;
        ctx.strokeStyle = m > 0.7 ? c2 : c1;
        ctx.lineWidth = (0.6 + z * 3) * u;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
        ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
        ctx.stroke();
      });
    } else {
      // 背景星星（閃爍＋緩慢漂移）
      const list = stars(Math.round(180 * dens), 5);
      list.forEach(([x, y, s, ph, m]) => {
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(t * (0.8 + m * 2) * Math.max(0.2, sp) + ph));
        const px = ((x + t * 0.004 * sp * (0.3 + s)) % 1) * W;
        const py = y * H;
        ctx.globalAlpha = fade * tw;
        ctx.fillStyle = m > 0.8 ? c2 : c1;
        if (s > 0.93) sparkle(ctx, px, py, (6 + s * 8) * u);
        else {
          const r = (0.8 + s * 2.2) * u;
          ctx.fillRect(px - r / 2, py - r / 2, r, r);
        }
      });
      ctx.globalAlpha = fade;
      if (mode === 'galaxy') {
        const arms = 3;
        const pts = stars(Math.round(900 * Math.min(2, dens)), 21);
        const rot = t * 0.12 * sp;
        // 核心：幾層同心實色圓
        [1, 0.66, 0.4, 0.2].forEach((k, i) => {
          ctx.globalAlpha = fade * (0.3 + i * 0.22);
          ctx.fillStyle = mix(c2, c1, i / 3);
          ctx.beginPath();
          ctx.ellipse(X, Y, R * 0.32 * k, R * 0.32 * k * 0.6, -0.4, 0, Math.PI * 2);
          ctx.fill();
        });
        pts.forEach(([a, b, s, , m]) => {
          const arm = Math.floor(a * arms);
          const d = Math.pow(b, 0.7);
          const th = arm * ((Math.PI * 2) / arms) + d * 4.2 + rot + (s - 0.5) * 0.5;
          const rr = d * R;
          const px = X + Math.cos(th) * rr;
          const py = Y + Math.sin(th) * rr * 0.6;
          ctx.globalAlpha = fade * (0.55 + 0.45 * (1 - d)) * (0.7 + 0.3 * Math.abs(Math.sin(t * 2 + m * 9)));
          ctx.fillStyle = m > 0.5 ? c1 : mix(c2, c1, 1 - d);
          const z = (1.6 + (1 - d) * 3.2) * u;
          ctx.fillRect(px - z / 2, py - z / 2, z, z);
        });
      }
      if (mode === 'planet') {
        const pc = String(P.planet ?? '#e8a35c');
        const ringOn = g('ring', 1);
        const tilt = -0.32;
        const ring = (front: boolean) => {
          if (!ringOn) return;
          ctx.save();
          ctx.translate(X, Y);
          ctx.rotate(tilt);
          ctx.beginPath();
          if (front) ctx.rect(-R * 3, 0, R * 6, R * 3);
          else ctx.rect(-R * 3, -R * 3, R * 6, R * 3);
          ctx.clip();
          [[1.85, c2, 0.16], [1.6, c1, 0.08], [1.42, c2, 0.1]].forEach(([k, c, w]) => {
            ctx.strokeStyle = c as string;
            ctx.lineWidth = R * (w as number);
            ctx.beginPath();
            ctx.ellipse(0, 0, R * (k as number), R * (k as number) * 0.28, 0, 0, Math.PI * 2);
            ctx.stroke();
          });
          ctx.restore();
        };
        const pe = back(t / 0.8);
        ctx.save();
        ctx.translate(X, Y);
        ctx.scale(pe, pe);
        ctx.translate(-X, -Y);
        ring(false);
        ctx.save();
        ctx.beginPath();
        ctx.arc(X, Y, R, 0, Math.PI * 2);
        ctx.fillStyle = pc;
        ctx.fill();
        ctx.clip();
        // 條紋帶慢慢流動
        const off = (t * 0.08 * sp) % 1;
        for (let i = -2; i < 8; i++) {
          ctx.fillStyle = i % 2 ? mix(pc, '#ffffff', 0.18) : mix(pc, '#000000', 0.12);
          const yy = Y - R + ((i + off) / 6) * 2 * R;
          ctx.beginPath();
          ctx.ellipse(X, yy, R * 1.4, R * 0.09 + (i % 3) * R * 0.03, tilt, 0, Math.PI * 2);
          ctx.fill();
        }
        // 背光面
        ctx.fillStyle = 'rgba(0,0,10,0.38)';
        ctx.beginPath();
        ctx.arc(X + R * 0.45, Y + R * 0.35, R * 1.05, 0, Math.PI * 2);
        ctx.arc(X - R * 0.1, Y - R * 0.1, R * 0.95, 0, Math.PI * 2, true);
        ctx.fill('evenodd');
        ctx.restore();
        ring(true);
        ctx.restore();
      }
    }
    // 流星：固定節奏從右上斜劃過
    if (g('shoot', 1) && mode !== 'warp') {
      const period = 2.6;
      for (let k = 0; k < 2; k++) {
        const tt = (t + k * 1.3) % period;
        const p = tt / 0.7;
        if (p > 1) continue;
        const r = rng(Math.floor((t + k * 1.3) / period) * 17 + k);
        const sx = (0.5 + r() * 0.5) * W;
        const sy = r() * 0.4 * H;
        const L = S * 0.35;
        const hx = sx - p * L * 1.4;
        const hy = sy + p * L * 0.8;
        const dx = 1.4 / Math.hypot(1.4, 0.8);
        const dy = -0.8 / Math.hypot(1.4, 0.8);
        const tail = L * 0.5 * (1 - Math.abs(p - 0.5));
        ctx.globalAlpha = fade * (1 - p * 0.6);
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(hx - dy * 2 * u, hy + dx * 2 * u);
        ctx.lineTo(hx + dx * tail, hy + dy * tail);
        ctx.lineTo(hx + dy * 2 * u, hy - dx * 2 * u);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
    return { cx: X, cy: Y, r: mode === 'planet' || mode === 'galaxy' ? R : S * 0.1 };
  };

  /* ───────── 俯瞰（正上方往下看，鏡頭緩慢平移推近） ───────── */
  type Pt = number[];
  const worldCache = new Map<string, Record<string, unknown>>();
  /** 沿折線取點：回傳位置與方向 */
  const along = (pl: Pt[], s: number) => {
    const seg: number[] = [];
    let tot = 0;
    for (let i = 1; i < pl.length; i++) {
      const d = Math.hypot(pl[i][0] - pl[i - 1][0], pl[i][1] - pl[i - 1][1]);
      seg.push(d);
      tot += d;
    }
    let left = (((s % 1) + 1) % 1) * tot;
    for (let i = 0; i < seg.length; i++) {
      if (left <= seg[i] || i === seg.length - 1) {
        const f = seg[i] ? Math.min(1, left / seg[i]) : 0;
        const a = pl[i];
        const b = pl[i + 1];
        return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, a: Math.atan2(b[1] - a[1], b[0] - a[0]) };
      }
      left -= seg[i];
    }
    return { x: pl[0][0], y: pl[0][1], a: 0 };
  };
  const strokePl = (ctx: CanvasRenderingContext2D, pl: Pt[], w: number, c: string) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  };
  const blob = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  /** 樹冠：深色底＋左上亮面 */
  const tree = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) => {
    blob(ctx, x + r * 0.18, y + r * 0.18, r, 'rgba(0,0,0,0.18)');
    blob(ctx, x, y, r, mix(c, '#000000', 0.18));
    blob(ctx, x - r * 0.22, y - r * 0.22, r * 0.62, c);
  };
  /** 俯視的車：長方形車身＋擋風玻璃 */
  const carTop = (ctx: CanvasRenderingContext2D, x: number, y: number, a: number, L: number, c: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.roundRect(-L / 2, -L * 0.24, L, L * 0.48, L * 0.12);
    ctx.fill();
    ctx.fillStyle = 'rgba(20,30,45,0.75)';
    ctx.fillRect(L * 0.08, -L * 0.18, L * 0.16, L * 0.36);
    ctx.restore();
  };
  /** 俯視的牛或馬：身體橢圓、頭、牛有斑點；走路時頭微微晃 */
  const animal = (ctx: CanvasRenderingContext2D, x: number, y: number, a: number, L: number, kind: number, t: number, ph: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(L * 0.06, L * 0.08, L * 0.5, L * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    const body = kind === 0 ? '#f4f1ea' : kind === 1 ? '#8a5a35' : '#3a2e28';
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, L * 0.5, L * 0.21, 0, 0, Math.PI * 2);
    ctx.fill();
    if (kind === 0) {
      ctx.fillStyle = '#222222';
      [[-0.2, -0.06, 0.12], [0.12, 0.08, 0.1], [0.28, -0.1, 0.07]].forEach(([sx, sy, sr]) => {
        ctx.beginPath();
        ctx.ellipse(sx * L, sy * L, sr * L, sr * L * 0.8, 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    // 頭（吃草時上下點）
    const nod = Math.sin(t * 3 + ph) * 0.05 * L;
    ctx.fillStyle = kind === 0 ? '#e7e1d6' : body;
    ctx.beginPath();
    ctx.ellipse(L * 0.6 + nod, 0, L * 0.16, L * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
    if (kind !== 0) {
      ctx.strokeStyle = '#2a1d16';
      ctx.lineWidth = L * 0.06;
      ctx.beginPath();
      ctx.moveTo(L * 0.42, 0);
      ctx.lineTo(L * 0.1, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-L * 0.5, 0);
      ctx.lineTo(-L * 0.68, Math.sin(t * 4 + ph) * L * 0.06);
      ctx.stroke();
    }
    ctx.restore();
  };
  const buildWorld = (mode: string, seed: number) => {
    const key = `${mode}|${seed}`;
    const hit = worldCache.get(key);
    if (hit) return hit;
    const r = rng(seed * 101 + mode.length);
    const E = 1.6;
    const w: Record<string, unknown> = {};
    if (mode === 'city' || mode === 'highway') {
      const B = 0.26;
      const roads: number[] = [];
      for (let v = -E; v <= E; v += B) roads.push(v);
      w.roads = roads;
      const blocks: number[][] = [];
      for (const x of roads)
        for (const y of roads) {
          const kind = r();
          // 每個街廓切成幾棟建築
          const n = 1 + Math.floor(r() * 3);
          for (let k = 0; k < n; k++) {
            const bw = (B - 0.05) / n;
            blocks.push([x + 0.025 + k * bw, y + 0.025 + r() * 0.03, bw - 0.012, B - 0.06 - r() * 0.05, kind < 0.12 ? -1 : Math.floor(r() * 4)]);
          }
        }
      w.blocks = blocks;
      w.cars = Array.from({ length: 70 }, () => [r() < 0.5 ? 0 : 1, roads[Math.floor(r() * roads.length)], r(), r() < 0.5 ? 1 : -1, Math.floor(r() * 5)]);
      if (mode === 'highway') {
        const loops: Pt[][] = [];
        for (let q = 0; q < 4; q++) {
          const cx = q % 2 ? 0.22 : -0.22;
          const cy = q < 2 ? -0.22 : 0.22;
          loops.push(Array.from({ length: 41 }, (_, i) => [cx + Math.cos((i / 40) * Math.PI * 2) * 0.17, cy + Math.sin((i / 40) * Math.PI * 2) * 0.17]));
        }
        w.loops = loops;
      }
    }
    if (mode === 'river' || mode === 'forest') {
      const ph = r() * 6;
      w.river = Array.from({ length: 81 }, (_, i) => {
        const y = -E + (i / 80) * 2 * E;
        return [0.26 * Math.sin(2.1 * y + ph) + 0.08 * Math.sin(5.3 * y + ph * 2), y];
      });
      w.trees = Array.from({ length: mode === 'forest' ? 520 : 160 }, () => [(r() - 0.5) * 2 * E, (r() - 0.5) * 2 * E, 0.025 + r() * 0.035, r()]);
      w.boats = Array.from({ length: 4 }, () => [r(), r() < 0.5 ? 1 : -1]);
    }
    if (mode === 'mountain') {
      w.peaks = Array.from({ length: 7 }, () => [(r() - 0.5) * 2.4, (r() - 0.5) * 2.4, 0.28 + r() * 0.3, Math.floor(r() * 1000)]);
    }
    if (mode === 'grass') {
      w.tufts = Array.from({ length: 420 }, () => [(r() - 0.5) * 2 * E, (r() - 0.5) * 2 * E]);
      w.trees = Array.from({ length: 22 }, () => [(r() - 0.5) * 2 * E, (r() - 0.5) * 2 * E, 0.04 + r() * 0.04, r()]);
      w.animals = Array.from({ length: 26 }, () => [(r() - 0.5) * 0.9, (r() - 0.5) * 0.9, r() * Math.PI * 2, Math.floor(r() * 3), r() < 0.45 ? 1 : 0, r() * 6]);
      const ph = r() * 6;
      w.path = Array.from({ length: 61 }, (_, i) => {
        const x = -E + (i / 60) * 2 * E;
        return [x, 0.3 * Math.sin(1.7 * x + ph) + 0.1];
      });
    }
    if (mode === 'farm') {
      const fields: number[][] = [];
      for (let x = -E; x < E; x += 0.34) for (let y = -E; y < E; y += 0.3) fields.push([x, y, 0.32, 0.28, Math.floor(r() * 5), r() < 0.5 ? 0 : 1]);
      w.fields = fields;
      w.houses = Array.from({ length: 6 }, () => [(r() - 0.5) * 2.4, (r() - 0.5) * 2.4]);
    }
    if (mode === 'coast') {
      const ph = r() * 6;
      w.shore = Array.from({ length: 81 }, (_, i) => {
        const y = -E + (i / 80) * 2 * E;
        return [0.05 + 0.08 * Math.sin(2.4 * y + ph) + 0.03 * Math.sin(7 * y), y];
      });
      w.umbrellas = Array.from({ length: 28 }, () => [-0.08 - r() * 0.5, (r() - 0.5) * 2 * E, Math.floor(r() * 4)]);
      w.boats = Array.from({ length: 6 }, () => [0.35 + r() * 0.9, (r() - 0.5) * 2 * E, r()]);
    }
    if (worldCache.size > 30) worldCache.clear();
    worldCache.set(key, w);
    return w;
  };
  const drawAerial = (ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, number | string>, t: number, L: number) => {
    const g = (k: string, d: number) => num(P[k], d);
    const S = Math.max(W, H);
    const mode = String(P.mode ?? 'city');
    const w = buildWorld(mode, Math.round(g('seed', 3)));
    const sp = g('pan', 1);
    const ang = (g('dir', -30) * Math.PI) / 180;
    const p = t / Math.max(1, L);
    const z = 1 + (g('zoom', 1.25) - 1) * inout(p);
    const camX = Math.cos(ang) * 0.22 * sp * (p - 0.5);
    const camY = Math.sin(ang) * 0.22 * sp * (p - 0.5);
    const tint = String(P.color ?? '');
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(S * z, S * z);
    ctx.rotate((g('rot', 0) * Math.PI) / 180);
    ctx.translate(-camX, -camY);
    const E = 1.7;
    const ground = (c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(-E, -E, E * 2, E * 2);
    };
    const traffic = g('traffic', 1);
    if (mode === 'city' || mode === 'highway') {
      ground(tint || '#cfc9bd');
      const roads = w.roads as number[];
      const RW = 0.034;
      ctx.fillStyle = '#5b6068';
      for (const v of roads) {
        ctx.fillRect(v - RW / 2, -E, RW, E * 2);
        ctx.fillRect(-E, v - RW / 2, E * 2, RW);
      }
      ctx.strokeStyle = '#f2efe6';
      ctx.lineWidth = 0.003;
      ctx.setLineDash([0.012, 0.012]);
      ctx.beginPath();
      for (const v of roads) {
        ctx.moveTo(v, -E);
        ctx.lineTo(v, E);
        ctx.moveTo(-E, v);
        ctx.lineTo(E, v);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      const roofs = ['#e9e4d9', '#b9b3a7', '#d6cfc2', '#9fa6ae'];
      for (const [x, y, bw, bh, k] of w.blocks as number[][]) {
        if (mode === 'highway' && Math.abs(x) < 0.45 && Math.abs(y) < 0.45) continue;
        if (k < 0) {
          ctx.fillStyle = '#8fbf6a';
          ctx.fillRect(x, y, bw, bh);
          tree(ctx, x + bw / 2, y + bh / 2, Math.min(bw, bh) * 0.28, '#5f9c4b');
          continue;
        }
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(x + 0.008, y + 0.008, bw, bh);
        ctx.fillStyle = roofs[k];
        ctx.fillRect(x, y, bw, bh);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(x + bw * 0.15, y + bh * 0.15, bw * 0.3, bh * 0.2);
      }
      if (mode === 'highway') {
        ctx.fillStyle = '#9cbf7a';
        ctx.fillRect(-0.45, -0.45, 0.9, 0.9);
        for (const l of w.loops as Pt[][]) strokePl(ctx, l, 0.04, '#5b6068');
        strokePl(ctx, [[-E, 0], [E, 0]], 0.08, '#4b5058');
        strokePl(ctx, [[0, -E], [0, E]], 0.08, '#4b5058');
        ctx.setLineDash([0.015, 0.015]);
        strokePl(ctx, [[-E, 0], [E, 0]], 0.003, '#f2efe6');
        strokePl(ctx, [[0, -E], [0, E]], 0.003, '#f2efe6');
        ctx.setLineDash([]);
        (w.loops as Pt[][]).forEach((l, i) => {
          for (let k = 0; k < 4 * traffic; k++) {
            const q = along(l, k / (4 * traffic) + t * 0.05 * (i % 2 ? 1 : -1));
            carTop(ctx, q.x, q.y, q.a, 0.022, ['#ff5a36', '#ffffff', '#ffd23f', '#3b82f6'][k % 4]);
          }
        });
        for (let k = 0; k < 14 * traffic; k++) {
          const s = ((k / (14 * traffic) + t * 0.04) % 1) * 2 * E - E;
          carTop(ctx, s, -0.02, 0, 0.026, ['#ffffff', '#ff5a36', '#3b82f6'][k % 3]);
          carTop(ctx, -s, 0.02, Math.PI, 0.026, ['#ffd23f', '#ffffff', '#34c38f'][k % 3]);
          carTop(ctx, 0.02, s, Math.PI / 2, 0.026, ['#ffffff', '#a78bfa'][k % 2]);
        }
      } else {
        const cols = ['#ff5a36', '#ffffff', '#ffd23f', '#3b82f6', '#1c1c1c'];
        (w.cars as number[][]).slice(0, Math.round(70 * traffic)).forEach(([axis, v, s0, d, c]) => {
          const s = ((s0 + t * 0.03 * d) % 1 + 1) % 1;
          const pos = -E + s * 2 * E;
          const off = d * 0.008;
          if (axis) carTop(ctx, pos, v + off, d > 0 ? 0 : Math.PI, 0.02, cols[c]);
          else carTop(ctx, v - off, pos, d > 0 ? Math.PI / 2 : -Math.PI / 2, 0.02, cols[c]);
        });
      }
    }
    if (mode === 'river' || mode === 'forest') {
      ground(tint || (mode === 'forest' ? '#3f6f3a' : '#9cc17a'));
      const rv = w.river as Pt[];
      if (mode === 'river') {
        strokePl(ctx, rv, 0.3, '#d9c896');
        strokePl(ctx, rv, 0.24, '#3f8fcf');
        strokePl(ctx, rv, 0.12, '#4fa3df');
        ctx.setLineDash([0.02, 0.06]);
        ctx.lineDashOffset = -t * 0.06;
        strokePl(ctx, rv.map(([x, y]) => [x - 0.05, y]), 0.004, 'rgba(255,255,255,0.7)');
        strokePl(ctx, rv.map(([x, y]) => [x + 0.05, y]), 0.004, 'rgba(255,255,255,0.7)');
        ctx.setLineDash([]);
        // 橋
        [-0.6, 0.45].forEach((by) => {
          const q = along(rv, (by + 1.6) / 3.2);
          ctx.fillStyle = '#e8e2d6';
          ctx.fillRect(q.x - 0.22, by - 0.02, 0.44, 0.04);
          ctx.fillStyle = '#8b8f96';
          ctx.fillRect(q.x - 0.22, by - 0.006, 0.44, 0.012);
        });
        (w.boats as number[][]).forEach(([s0, d], i) => {
          const q = along(rv, ((s0 + t * 0.012 * d) % 1 + 1) % 1);
          ctx.save();
          ctx.translate(q.x + (i % 2 ? 0.04 : -0.04), q.y);
          ctx.rotate(q.a + (d < 0 ? Math.PI : 0));
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(0.03, 0);
          ctx.lineTo(0.01, -0.01);
          ctx.lineTo(-0.025, -0.01);
          ctx.lineTo(-0.025, 0.01);
          ctx.lineTo(0.01, 0.01);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      } else {
        strokePl(ctx, rv, 0.08, '#c9b98a');
      }
      const greens = mode === 'forest' ? ['#2f6b34', '#3d7f3a', '#4f8f3f', '#6aa04a'] : ['#4f8f3f', '#6aa04a'];
      for (const [x, y, rr, k] of w.trees as number[][]) {
        const near = along(rv, (y + 1.6) / 3.2);
        if (Math.abs(x - near.x) < (mode === 'forest' ? 0.06 : 0.19)) continue;
        tree(ctx, x, y, mode === 'forest' ? rr * 1.6 : rr, greens[Math.floor(k * greens.length)]);
      }
    }
    if (mode === 'mountain') {
      ground(tint || '#a8b98a');
      const bands = ['#93a874', '#7f9563', '#9a8a68', '#86765a', '#b7aa92', '#f4f4f0'];
      for (const [px, py, pr, sd] of w.peaks as number[][]) {
        const rr = rng(sd);
        const ph = [rr() * 6, rr() * 6, rr() * 6];
        bands.forEach((c, i) => {
          const k = 1 - i / bands.length;
          ctx.fillStyle = c;
          ctx.beginPath();
          for (let j = 0; j <= 48; j++) {
            const a = (j / 48) * Math.PI * 2;
            const rad = pr * k * (1 + 0.18 * Math.sin(3 * a + ph[0]) + 0.1 * Math.sin(5 * a + ph[1]) + 0.06 * Math.sin(9 * a + ph[2]));
            const x = px + Math.cos(a) * rad + (1 - k) * 0.03;
            const y = py + Math.sin(a) * rad - (1 - k) * 0.03;
            if (j) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.12)';
          ctx.lineWidth = 0.002;
          ctx.stroke();
        });
      }
      // 雲影：實色半透明塊，慢慢飄
      for (let k = 0; k < 5; k++) {
        const cx = ((k * 0.7 + t * 0.03) % 3.2) - 1.6;
        const cy = -1 + k * 0.5;
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        [0, 0.08, -0.07, 0.15].forEach((dx, i) => blob(ctx, cx + dx, cy + (i % 2) * 0.03, 0.07 + i * 0.01, 'rgba(255,255,255,0.55)'));
      }
    }
    if (mode === 'grass') {
      ground(tint || '#9fc76b');
      ctx.strokeStyle = '#86b35a';
      ctx.lineWidth = 0.003;
      for (const [x, y] of w.tufts as number[][]) {
        ctx.beginPath();
        ctx.moveTo(x - 0.008, y - 0.01);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 0.008, y - 0.01);
        ctx.stroke();
      }
      strokePl(ctx, w.path as Pt[], 0.05, '#cdb98a');
      for (const [x, y, rr] of w.trees as number[][]) tree(ctx, x, y, rr, '#5f9c4b');
      const n = Math.round(g('herd', 18));
      (w.animals as number[][]).slice(0, n).forEach(([x, y, a, kind, walk, ph]) => {
        const d = walk ? t * 0.012 : 0;
        animal(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, a, 0.085, kind, t, ph);
      });
    }
    if (mode === 'farm') {
      ground(tint || '#b9a77a');
      const crops = ['#7fb04f', '#a6c45a', '#d9c25a', '#6e9a45', '#c8a96a'];
      for (const [x, y, fw, fh, k, dir] of w.fields as number[][]) {
        ctx.fillStyle = crops[k];
        ctx.fillRect(x + 0.006, y + 0.006, fw - 0.012, fh - 0.012);
        ctx.strokeStyle = mix(crops[k], '#000000', 0.15);
        ctx.lineWidth = 0.004;
        ctx.beginPath();
        for (let s = 0.02; s < (dir ? fw : fh); s += 0.022) {
          if (dir) {
            ctx.moveTo(x + s, y + 0.01);
            ctx.lineTo(x + s, y + fh - 0.01);
          } else {
            ctx.moveTo(x + 0.01, y + s);
            ctx.lineTo(x + fw - 0.01, y + s);
          }
        }
        ctx.stroke();
      }
      for (const [x, y] of w.houses as number[][]) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x + 0.008, y + 0.008, 0.07, 0.05);
        ctx.fillStyle = '#c4553a';
        ctx.fillRect(x, y, 0.07, 0.05);
        ctx.fillStyle = '#a8432c';
        ctx.fillRect(x, y + 0.025, 0.07, 0.025);
      }
      // 耕耘機沿一排田來回
      const tx = -0.32 + ((t * 0.05) % 0.64);
      ctx.fillStyle = '#5c8a3a';
      ctx.fillRect(-0.32, 0.03, tx + 0.32, 0.03);
      ctx.save();
      ctx.translate(tx, 0.045);
      ctx.fillStyle = '#ffd23f';
      ctx.fillRect(-0.02, -0.014, 0.04, 0.028);
      ctx.fillStyle = '#222';
      ctx.fillRect(-0.02, -0.02, 0.016, 0.008);
      ctx.fillRect(-0.02, 0.012, 0.016, 0.008);
      ctx.restore();
    }
    if (mode === 'coast') {
      ground(tint || '#e8d6a8');
      const sh = w.shore as Pt[];
      const sea = (off: number, c: string) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        sh.forEach(([x, y], i) => (i ? ctx.lineTo(x + off, y) : ctx.moveTo(x + off, y)));
        ctx.lineTo(E, E);
        ctx.lineTo(E, -E);
        ctx.closePath();
        ctx.fill();
      };
      sea(0, '#7fd0e6');
      sea(0.07, '#4fb0d6');
      sea(0.25, '#2f84bf');
      // 浪花：白線往岸邊推
      for (let k = 0; k < 3; k++) {
        const off = 0.06 - (((t * 0.03 + k * 0.033) % 0.1));
        ctx.save();
        ctx.globalAlpha = 0.85 - k * 0.2;
        strokePl(ctx, sh.map(([x, y]) => [x + off + 0.01, y]), 0.006, '#ffffff');
        ctx.restore();
      }
      const um = ['#ff5a36', '#3b82f6', '#ffd23f', '#34c38f'];
      for (const [x, y, k] of w.umbrellas as number[][]) {
        for (let s = 0; s < 6; s++) {
          ctx.fillStyle = s % 2 ? '#ffffff' : um[k];
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.arc(x, y, 0.028, (s / 6) * Math.PI * 2, ((s + 1) / 6) * Math.PI * 2);
          ctx.fill();
        }
      }
      for (const [x, y, ph] of w.boats as number[][]) {
        const yy = y + Math.sin(t * 0.5 + ph * 6) * 0.01;
        ctx.save();
        ctx.translate(x, yy);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 0.004;
        ctx.beginPath();
        ctx.moveTo(-0.03, 0);
        ctx.lineTo(-0.09, -0.012);
        ctx.moveTo(-0.03, 0);
        ctx.lineTo(-0.09, 0.012);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, 0.03, 0.01, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
    return { cx: g('x', 0.5) * W, cy: g('y', 0.45) * H, r: Math.min(W, H) * 0.12 };
  };

  /* ───────── 交通工具（側面，背景捲動） ───────── */
  const wheel = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, rim = '#d9dde3') => {
    blob(ctx, x, y, r, '#1c1c1c');
    blob(ctx, x, y, r * 0.58, rim);
    ctx.strokeStyle = '#1c1c1c';
    ctx.lineWidth = r * 0.12;
    for (let k = 0; k < 5; k++) {
      const a = rot + (k / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55);
      ctx.stroke();
    }
    blob(ctx, x, y, r * 0.16, '#1c1c1c');
  };
  const cloud = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, c: string) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.arc(x + s * 0.9, y + s * 0.15, s * 0.75, 0, Math.PI * 2);
    ctx.arc(x - s * 0.9, y + s * 0.2, s * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - s * 1.5, y + s * 0.2, s * 3.2, s * 0.65);
  };
  const drawVehicle = (ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, number | string>, t: number, u: number) => {
    const g = (k: string, d: number) => num(P[k], d);
    const S = Math.min(W, H);
    const mode = String(P.mode ?? 'car');
    const c1 = String(P.color ?? '#ff5a36');
    const c2 = String(P.color2 ?? '#ffffff');
    const sp = g('speed', 1);
    const R = (g('size', 0.5) * S) / 2;
    const X = g('x', 0.5) * W;
    let Y = g('y', 0.45) * H;
    const scene = g('scene', 1);
    const e = ease(t / 0.8);
    const enter = (1 - e) * -W * 0.8;
    // 背景捲動
    const scroll = t * sp;
    if (scene) {
      if (mode === 'rocket') {
        const r = rng(9);
        for (let k = 0; k < 90; k++) {
          const sx = (((r() * W - scroll * W * (0.3 + r() * 0.6)) % W) + W) % W;
          const sy = r() * H;
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillRect(sx, sy, (6 + r() * 30) * u * sp, 2 * u);
        }
      } else if (mode === 'ship') {
        ctx.fillStyle = '#3d8fc9';
        ctx.fillRect(0, Y + R * 0.18, W, H);
        for (let k = 0; k < 4; k++) {
          const yy = Y + R * (0.3 + k * 0.28);
          ctx.strokeStyle = 'rgba(255,255,255,0.75)';
          ctx.lineWidth = 3 * u;
          ctx.beginPath();
          for (let x = -60; x < W + 60; x += 30 * u) {
            const xx = x - ((scroll * 120 * u * (1 + k * 0.4)) % (60 * u));
            ctx.moveTo(xx, yy);
            ctx.quadraticCurveTo(xx + 15 * u, yy - 8 * u, xx + 30 * u, yy);
          }
          ctx.stroke();
        }
      } else if (mode === 'plane' || mode === 'balloon') {
        for (let k = 0; k < 6; k++) {
          const s = (30 + (k % 3) * 22) * u;
          const sx = (((k * 0.37 * W - scroll * W * (0.15 + (k % 3) * 0.12) * (mode === 'balloon' ? 0.3 : 1)) % (W + 300 * u)) + W + 300 * u) % (W + 300 * u) - 150 * u;
          cloud(ctx, sx, H * (0.12 + ((k * 0.17) % 0.75)), s, k % 2 ? '#ffffff' : '#eef3f8');
        }
      } else {
        // 地面：遠山、路面、虛線
        const gy = Y + R * 0.42;
        ctx.fillStyle = '#9fc76b';
        ctx.fillRect(0, gy - R * 0.25, W, H);
        ctx.fillStyle = mode === 'carriage' ? '#cdb98a' : '#5b6068';
        ctx.fillRect(0, gy, W, R * 0.75);
        ctx.fillStyle = '#8ab95a';
        ctx.fillRect(0, gy + R * 0.75, W, R * 0.06);
        if (mode === 'train') {
          ctx.fillStyle = '#7a5a3a';
          for (let x = -((scroll * 300 * u) % (40 * u)); x < W; x += 40 * u) ctx.fillRect(x, gy + 4 * u, 14 * u, 16 * u);
          ctx.fillStyle = '#b8bcc4';
          ctx.fillRect(0, gy + 2 * u, W, 5 * u);
        } else {
          ctx.fillStyle = mode === 'carriage' ? '#b39f72' : '#f2efe6';
          for (let x = -((scroll * 300 * u) % (90 * u)); x < W; x += 90 * u) ctx.fillRect(x, gy + R * 0.3, 45 * u, 6 * u);
        }
        // 路邊的樹往後跑
        for (let k = 0; k < 6; k++) {
          const tx = ((((k * 0.23 * W - scroll * W * 0.5) % (W + 200 * u)) + W + 200 * u) % (W + 200 * u)) - 100 * u;
          ctx.fillStyle = '#6b4a2b';
          ctx.fillRect(tx - 3 * u, gy - R * 0.25 - 40 * u, 6 * u, 40 * u);
          blob(ctx, tx, gy - R * 0.25 - 50 * u, 24 * u, '#4f8f3f');
        }
      }
    }
    const bob = Math.sin(t * (mode === 'carriage' ? 9 : 5)) * (mode === 'ship' || mode === 'balloon' ? 6 : 2) * u;
    Y += bob;
    ctx.save();
    ctx.translate(X + (mode === 'balloon' ? 0 : enter), mode === 'balloon' ? Y + (1 - e) * H * 0.6 : Y);
    if (mode === 'ship') ctx.rotate(Math.sin(t * 1.5) * 0.04);
    if (mode === 'plane') ctx.rotate(-0.05 + Math.sin(t * 1.2) * 0.02);
    if (mode === 'rocket') ctx.rotate(-0.12);
    const rot = scroll * 12;
    if (mode === 'car') {
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.moveTo(-R, R * 0.12);
      ctx.lineTo(-R, -R * 0.12);
      ctx.quadraticCurveTo(-R * 0.95, -R * 0.2, -R * 0.7, -R * 0.2);
      ctx.lineTo(-R * 0.45, -R * 0.48);
      ctx.lineTo(R * 0.3, -R * 0.48);
      ctx.lineTo(R * 0.6, -R * 0.2);
      ctx.lineTo(R * 0.92, -R * 0.14);
      ctx.quadraticCurveTo(R, -R * 0.1, R, R * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#bfe3f7';
      ctx.beginPath();
      ctx.moveTo(-R * 0.38, -R * 0.42);
      ctx.lineTo(-R * 0.08, -R * 0.42);
      ctx.lineTo(-R * 0.08, -R * 0.22);
      ctx.lineTo(-R * 0.6, -R * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(R * 0.0, -R * 0.42);
      ctx.lineTo(R * 0.27, -R * 0.42);
      ctx.lineTo(R * 0.5, -R * 0.22);
      ctx.lineTo(R * 0.0, -R * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffd23f';
      ctx.fillRect(R * 0.9, -R * 0.08, R * 0.08, R * 0.08);
      ctx.fillStyle = mix(c1, '#000000', 0.25);
      ctx.fillRect(-R, R * 0.02, R * 2, R * 0.06);
      wheel(ctx, -R * 0.55, R * 0.14, R * 0.2, rot);
      wheel(ctx, R * 0.55, R * 0.14, R * 0.2, rot);
      // 排氣：硬邊小圓往後飄
      for (let k = 0; k < 3; k++) {
        const q = ((t * 2 + k / 3) % 1);
        ctx.globalAlpha = 1 - q;
        blob(ctx, -R * 1.05 - q * R * 0.5, R * 0.05 - q * R * 0.1, R * (0.04 + q * 0.06), '#d9dde3');
      }
      ctx.globalAlpha = 1;
    }
    if (mode === 'carriage') {
      // 馬（往右跑）
      const gal = t * 9 * sp;
      const hx = R * 0.45;
      ctx.strokeStyle = '#5a3a22';
      ctx.lineCap = 'round';
      ctx.lineWidth = R * 0.06;
      [[0, 0], [1, Math.PI], [2, Math.PI * 0.5], [3, Math.PI * 1.5]].forEach(([k, ph]) => {
        const lx = hx + (k < 2 ? R * 0.3 : -R * 0.05) + (k % 2) * R * 0.06;
        const sw = Math.sin(gal + ph) * 0.5;
        ctx.beginPath();
        ctx.moveTo(lx, -R * 0.05);
        ctx.lineTo(lx + Math.sin(sw) * R * 0.22, R * 0.32);
        ctx.stroke();
      });
      ctx.fillStyle = '#8a5a35';
      ctx.beginPath();
      ctx.ellipse(hx + R * 0.13, -R * 0.12, R * 0.3, R * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(hx + R * 0.35, -R * 0.2);
      ctx.lineTo(hx + R * 0.5, -R * 0.48);
      ctx.lineTo(hx + R * 0.62, -R * 0.44);
      ctx.lineTo(hx + R * 0.48, -R * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(hx + R * 0.66, -R * 0.4, R * 0.12, R * 0.06, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a2416';
      ctx.fillRect(hx + R * 0.42, -R * 0.5, R * 0.08, R * 0.3);
      ctx.strokeStyle = '#3a2416';
      ctx.lineWidth = R * 0.05;
      ctx.beginPath();
      ctx.moveTo(hx - R * 0.15, -R * 0.14);
      ctx.lineTo(hx - R * 0.32, -R * 0.02 + Math.sin(gal) * R * 0.05);
      ctx.stroke();
      // 車廂
      ctx.strokeStyle = '#3a2416';
      ctx.lineWidth = R * 0.03;
      ctx.beginPath();
      ctx.moveTo(-R * 0.25, -R * 0.1);
      ctx.lineTo(hx, -R * 0.12);
      ctx.stroke();
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.roundRect(-R * 1.0, -R * 0.55, R * 0.8, R * 0.55, R * 0.08);
      ctx.fill();
      ctx.fillStyle = c2;
      ctx.fillRect(-R * 0.9, -R * 0.45, R * 0.25, R * 0.22);
      ctx.fillRect(-R * 0.55, -R * 0.45, R * 0.25, R * 0.22);
      ctx.fillStyle = mix(c1, '#000000', 0.3);
      ctx.fillRect(-R * 1.05, -R * 0.6, R * 0.9, R * 0.08);
      wheel(ctx, -R * 0.82, R * 0.1, R * 0.2, rot, '#c9a65a');
      wheel(ctx, -R * 0.35, R * 0.12, R * 0.17, rot, '#c9a65a');
    }
    if (mode === 'plane') {
      // 凝結尾：幾條白色長帶
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(-R * 3.2, -R * 0.02, R * 2.2, R * 0.05);
      ctx.fillRect(-R * 2.6, R * 0.12, R * 1.8, R * 0.04);
      ctx.fillStyle = mix(c2, '#000000', 0.12);
      ctx.beginPath();
      ctx.moveTo(-R * 0.1, R * 0.02);
      ctx.lineTo(R * 0.25, R * 0.02);
      ctx.lineTo(-R * 0.35, R * 0.42);
      ctx.lineTo(-R * 0.55, R * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.roundRect(-R, -R * 0.14, R * 2, R * 0.28, R * 0.14);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-R * 0.75, -R * 0.1);
      ctx.lineTo(-R * 1.0, -R * 0.55);
      ctx.lineTo(-R * 0.82, -R * 0.55);
      ctx.lineTo(-R * 0.45, -R * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = c1;
      ctx.fillRect(-R * 0.98, -R * 0.52, R * 0.16, R * 0.3);
      ctx.fillRect(-R * 0.9, R * 0.02, R * 1.88, R * 0.05);
      ctx.fillStyle = '#2b3a4f';
      for (let k = 0; k < 11; k++) blob(ctx, -R * 0.55 + k * R * 0.12, -R * 0.03, R * 0.028, '#2b3a4f');
      ctx.fillStyle = '#2b3a4f';
      ctx.beginPath();
      ctx.moveTo(R * 0.86, -R * 0.08);
      ctx.lineTo(R * 0.97, -R * 0.02);
      ctx.lineTo(R * 0.86, -R * 0.02);
      ctx.fill();
      ctx.fillStyle = '#9aa1ab';
      ctx.beginPath();
      ctx.roundRect(-R * 0.05, R * 0.14, R * 0.3, R * 0.11, R * 0.05);
      ctx.fill();
    }
    if (mode === 'rocket') {
      // 火焰：三層三角形閃動
      const fl = 0.75 + 0.25 * Math.abs(Math.sin(t * 22));
      [['#ff5a36', 1], ['#ffb03b', 0.7], ['#fff3c4', 0.4]].forEach(([c, k]) => {
        ctx.fillStyle = c as string;
        ctx.beginPath();
        ctx.moveTo(-R * 0.62, -R * 0.13 * (k as number));
        ctx.lineTo(-R * 0.62 - R * 0.75 * (k as number) * fl, 0);
        ctx.lineTo(-R * 0.62, R * 0.13 * (k as number));
        ctx.closePath();
        ctx.fill();
      });
      ctx.fillStyle = c1;
      [-1, 1].forEach((s) => {
        ctx.beginPath();
        ctx.moveTo(-R * 0.2, s * R * 0.16);
        ctx.lineTo(-R * 0.65, s * R * 0.42);
        ctx.lineTo(-R * 0.62, s * R * 0.12);
        ctx.closePath();
        ctx.fill();
      });
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.moveTo(-R * 0.62, -R * 0.18);
      ctx.lineTo(R * 0.35, -R * 0.18);
      ctx.quadraticCurveTo(R * 0.9, -R * 0.12, R, 0);
      ctx.quadraticCurveTo(R * 0.9, R * 0.12, R * 0.35, R * 0.18);
      ctx.lineTo(-R * 0.62, R * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.moveTo(R * 0.62, -R * 0.14);
      ctx.quadraticCurveTo(R * 0.9, -R * 0.1, R, 0);
      ctx.quadraticCurveTo(R * 0.9, R * 0.1, R * 0.62, R * 0.14);
      ctx.closePath();
      ctx.fill();
      blob(ctx, R * 0.25, 0, R * 0.09, '#2b3a4f');
      blob(ctx, R * 0.23, -R * 0.02, R * 0.04, '#bfe3f7');
      ctx.fillStyle = mix(c2, '#000000', 0.15);
      ctx.fillRect(-R * 0.62, R * 0.08, R * 1.0, R * 0.05);
    }
    if (mode === 'train') {
      ['#ffffff', c1, c1].forEach((c, k) => {
        const x0 = -R * 1.1 + k * R * 0.0 - k * R * 0.0;
        const ox = R * 0.4 - k * R * 0.78;
        ctx.fillStyle = k === 0 ? c2 : c;
        ctx.beginPath();
        if (k === 0) {
          ctx.moveTo(ox - R * 0.35, -R * 0.42);
          ctx.lineTo(ox + R * 0.25, -R * 0.42);
          ctx.quadraticCurveTo(ox + R * 0.55, -R * 0.3, ox + R * 0.6, R * 0.05);
          ctx.lineTo(ox - R * 0.35, R * 0.05);
          ctx.closePath();
        } else ctx.roundRect(ox - R * 0.36, -R * 0.42, R * 0.72, R * 0.47, R * 0.04);
        ctx.fill();
        ctx.fillStyle = k === 0 ? c1 : '#ffffff';
        ctx.fillRect(ox - R * 0.35, -R * 0.12, k === 0 ? R * 0.92 : R * 0.72, R * 0.05);
        ctx.fillStyle = '#2b3a4f';
        for (let j = 0; j < 3; j++) ctx.fillRect(ox - R * 0.3 + j * R * 0.2, -R * 0.33, R * 0.14, R * 0.14);
        if (k === 0) {
          ctx.beginPath();
          ctx.moveTo(ox + R * 0.32, -R * 0.33);
          ctx.lineTo(ox + R * 0.46, -R * 0.2);
          ctx.lineTo(ox + R * 0.32, -R * 0.2);
          ctx.fill();
        }
        wheel(ctx, ox - R * 0.2, R * 0.1, R * 0.08, rot);
        wheel(ctx, ox + R * 0.2, R * 0.1, R * 0.08, rot);
        void x0;
      });
    }
    if (mode === 'ship') {
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.moveTo(-R, -R * 0.05);
      ctx.lineTo(R, -R * 0.05);
      ctx.lineTo(R * 0.78, R * 0.25);
      ctx.lineTo(-R * 0.85, R * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-R * 0.95, -R * 0.05, R * 1.92, R * 0.06);
      ctx.fillStyle = c2;
      ctx.fillRect(-R * 0.6, -R * 0.32, R * 0.95, R * 0.27);
      ctx.fillRect(-R * 0.4, -R * 0.52, R * 0.55, R * 0.2);
      ctx.fillStyle = '#2b3a4f';
      for (let k = 0; k < 6; k++) blob(ctx, -R * 0.5 + k * R * 0.16, -R * 0.19, R * 0.035, '#2b3a4f');
      ctx.fillStyle = c1;
      ctx.fillRect(R * 0.15, -R * 0.75, R * 0.14, R * 0.25);
      for (let k = 0; k < 3; k++) {
        const q = (t * 0.8 + k / 3) % 1;
        ctx.globalAlpha = 1 - q;
        blob(ctx, R * 0.22 - q * R * 0.6, -R * 0.8 - q * R * 0.35, R * (0.06 + q * 0.08), '#e6e8ec');
      }
      ctx.globalAlpha = 1;
    }
    if (mode === 'balloon') {
      ctx.strokeStyle = '#6b4a2b';
      ctx.lineWidth = R * 0.02;
      ctx.beginPath();
      ctx.moveTo(-R * 0.3, R * 0.2);
      ctx.lineTo(-R * 0.12, R * 0.72);
      ctx.moveTo(R * 0.3, R * 0.2);
      ctx.lineTo(R * 0.12, R * 0.72);
      ctx.stroke();
      ctx.fillStyle = '#8a5a35';
      ctx.fillRect(-R * 0.15, R * 0.7, R * 0.3, R * 0.2);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-R * 0.3, R * 0.25);
      ctx.bezierCurveTo(-R * 0.85, -R * 0.1, -R * 0.7, -R * 0.95, 0, -R * 0.95);
      ctx.bezierCurveTo(R * 0.7, -R * 0.95, R * 0.85, -R * 0.1, R * 0.3, R * 0.25);
      ctx.closePath();
      ctx.fillStyle = c1;
      ctx.fill();
      ctx.clip();
      ctx.fillStyle = c2;
      for (let k = -3; k <= 3; k += 2) {
        ctx.beginPath();
        ctx.ellipse(k * R * 0.17, -R * 0.3, R * 0.08, R * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(R * 0.2, -R, R, R * 1.4);
      ctx.restore();
    }
    ctx.restore();
    return { cx: X, cy: Y, r: R * (mode === 'balloon' ? 0.95 : 0.5) };
  };

  /* ───────── 文字 ───────── */
  const drawText = (ctx: CanvasRenderingContext2D, W: number, H: number, sc: OScene, t: number, u: number, obj: { cx: number; cy: number; r: number }) => {
    const tx = sc.text;
    if (!tx || tx.layout === 'none' || !tx.lines?.length) return null;
    const p = ease((t - tx.delay) / 0.5);
    if (p <= 0) return null;
    const big = 120 * u * (tx.size || 1);
    const rows = tx.lines.map((l) => ({ text: l.replace(/^~/, ''), small: l.startsWith('~'), fs: l.startsWith('~') ? big * 0.32 : big }));
    const lh = rows.map((r) => r.fs * (r.small ? 1.6 : 1.15));
    const total = lh.reduce((a, b) => a + b, 0);
    const gap = 40 * u;
    let y0 = obj.cy - total / 2;
    if (tx.layout === 'below') y0 = obj.cy + obj.r + gap;
    if (tx.layout === 'above') y0 = obj.cy - obj.r - gap - total;
    ctx.save();
    ctx.globalAlpha *= p;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let y = y0 + (1 - p) * 20 * u;
    rows.forEach((r, i) => {
      const cy = y + lh[i] / 2;
      ctx.font = `${r.small ? 500 : 900} ${r.fs}px ${F}`;
      if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = r.small ? `${r.fs * 0.35}px` : '0px';
      if (tx.strokeW > 0) {
        ctx.lineJoin = 'round';
        ctx.lineWidth = tx.strokeW * u * (r.small ? 0.5 : 1);
        ctx.strokeStyle = tx.stroke;
        ctx.strokeText(r.text, obj.cx, cy);
      }
      ctx.fillStyle = tx.color;
      ctx.fillText(r.text, obj.cx, cy);
      y += lh[i];
    });
    ctx.restore();
    return [obj.cx, y0 + total / 2];
  };

  /** 畫一格；回傳可拖曳的把手位置 */
  const drawObj = (ctx: CanvasRenderingContext2D, W: number, H: number, sc: OScene, t: number, font?: string): Record<string, number[]> => {
    F = ((globalThis as unknown as { MA_FONTS?: Record<string, string> }).MA_FONTS ?? {})[sc.font ?? ''] || font || FONT;
    const u = Math.min(W, H) / 1080;
    const P = sc.params || {};
    // 太空船沿用預設天空時自動換成夜空、字改白
    if (sc.module === 'vehicle' && P.mode === 'rocket' && sc.bg === '#bfe3f7') sc = { ...sc, bg: '#05070d', text: sc.text.color === '#1d2433' ? { ...sc.text, color: '#ffffff', stroke: sc.text.stroke === '#ffffff' ? '#111111' : sc.text.stroke } : sc.text };
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
    const obj =
      sc.module === 'cube'
        ? drawCube(ctx, W, H, P, t, u)
        : sc.module === 'cosmos'
          ? drawCosmos(ctx, W, H, P, t, u)
          : sc.module === 'aerial'
            ? drawAerial(ctx, W, H, P, t, sc.loop)
            : sc.module === 'vehicle'
              ? drawVehicle(ctx, W, H, P, t, u)
              : drawMeteor(ctx, W, H, P, t, u);
    const handles: Record<string, number[]> = { card: [obj.cx, obj.cy] };
    drawText(ctx, W, H, sc, t, u, obj);
    return handles;
  };

  return { drawObj };
};

export const { drawObj } = objRenderer();
(globalThis as unknown as { MA_OBJ: unknown }).MA_OBJ = { drawObj };
