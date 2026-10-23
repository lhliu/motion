// 物件特效：隕石、方塊、宇宙、俯瞰、交通工具與海底世界。全部硬邊，可透明疊進影片。
// objRenderer 內部必須自給自足，匯出 HTML 時以 toString() 內嵌。
import type { PField } from './photokit';

export type OModule = 'meteor' | 'cube' | 'cosmos' | 'aerial' | 'vehicle' | 'ocean';

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
  cosmos: { zh: '星空宇宙', en: 'Cosmos', desc: '閃爍星空、光速穿越、旋轉星系、行星光環、太陽、月球、地球、低空飛越星球表面，可推近拉遠、加流星' },
  aerial: { zh: '俯瞰', en: 'Aerial View', desc: '從正上方往下看的城市、河流、山川、草原牛馬、農田、海岸、森林、交流道，鏡頭緩慢平移推近' },
  ocean: { zh: '海底世界', en: 'Underwater', desc: '魚群、海豚、巨鯨、迎面鯊魚、珊瑚、深海下潛、潛水艇，可去背或搭配海底場景' },
  vehicle: { zh: '交通工具', en: 'Vehicles', desc: '飛機、太空船、汽車、馬車、火車、輪船、熱氣球，側面行進、背景捲動' },
};
export const OBJ_MODULES = Object.keys(OBJ_INFO) as OModule[];

export const OBJ_DEFAULTS: Record<OModule, Record<string, number | string>> = {
  meteor: { shape: 'random', material: 'rock', sym: 6, seed: 7, size: 0.42, x: 0.5, y: 0.42, rough: 0.45, craters: 6, color: '#8a7f72', color2: '#4a423a', spin: 10, float: 1, debris: 4, trail: 0, angle: -35, rimW: 0, rim: '#ffffff' },
  cube: { n: 3, material: 'plastic', pattern: 'stripe', scheme: 'classic', mono: '#ff5a36', body: '#151515', size: 0.36, x: 0.5, y: 0.42, tilt: -28, turn: 35, spin: 14, twist: 1, speed: 1 },
  cosmos: { mode: 'stars', cam: 'none', camz: 3, surface: 'earth', alt: 0.45, density: 1, speed: 1, color: '#ffffff', color2: '#8ab4ff', planet: '#e8a35c', ring: 1, shoot: 1, x: 0.5, y: 0.42, size: 0.32 },
  aerial: { mode: 'city', seed: 3, pan: 1, dir: -30, zoom: 1.25, rot: 0, traffic: 1, herd: 18, x: 0.5, y: 0.45 },
  ocean: { mode: 'fish', count: 28, size: 0.7, speed: 1, direction: 'right', route: 'wave', current: 0.6, depth: 0.55, scene: 1, bubbles: 1, seed: 7, color: '#65d9ce', color2: '#ffc86a', x: 0.5, y: 0.46, strike: 0.48, mouth: 1, exit: 'pass', shake: 0.3, beam: 1 },
  vehicle: { mode: 'car', color: '#ff5a36', color2: '#ffffff', size: 0.5, speed: 1, scene: 1, x: 0.5, y: 0.45 },
};
/** 海底卡片、工作室與 MCP 共用的起始配色與隊形。 */
export const OCEAN_PRESETS: Record<string, Record<string, number | string>> = {
  fish: { mode: 'fish', count: 28, color: '#65d9ce', color2: '#ffc86a', size: 0.7, depth: 0.55 },
  dolphins: { mode: 'dolphins', count: 6, color: '#86b9cc', color2: '#d7eee9', size: 0.7, depth: 0.55 },
  whale: { mode: 'whale', color: '#477f98', color2: '#bbd9d7', size: 0.9, depth: 0.75 },
  shark: { mode: 'shark', color: '#799eaf', color2: '#dbe6df', size: 0.8, depth: 0.8 },
  coral: { mode: 'coral', color: '#f68183', color2: '#f4c66b', count: 28, depth: 0.25 },
  deep: { mode: 'deep', color: '#4ca6b5', color2: '#9fe1de', depth: 0.95 },
  submarine: { mode: 'submarine', color: '#f4bd59', color2: '#fff0bb', size: 0.7, depth: 0.8 },
};
/** 隕石材質的預設配色（換材質時一起換） */
export const METEOR_COLORS: Record<string, [string, string]> = { rock: ['#8a7f72', '#4a423a'], ice: ['#cfeaf7', '#6aa5c8'], lava: ['#3a2a26', '#1a1210'], metal: ['#c9a65a', '#6e5525'] };
const BG: Record<OModule, string> = { meteor: '#0b0d14', cube: '#151515', cosmos: '#05070d', aerial: '#cfc9bd', vehicle: '#bfe3f7', ocean: '#07394b' };

const pos = (k: string, label: string): PField => ({ k, label, type: 'range', min: 0, max: 1, step: 0.01 });
export const OBJ_PARAMS: Record<OModule, PField[]> = {
  ocean: [
    { k: 'mode', label: '海底主角', type: 'seg', opts: [['fish', '魚群'], ['dolphins', '海豚群'], ['whale', '巨鯨'], ['shark', '迎面鯊魚'], ['coral', '珊瑚花園'], ['deep', '深海下潛'], ['submarine', '潛水艇']] },
    { k: 'scene', label: '海底場景', type: 'seg', opts: [['1', '珊瑚與水流'], ['0', '只有主角']] },
    { k: 'color', label: '主色', type: 'color' },
    { k: 'color2', label: '輔色', type: 'color' },
    { k: 'count', label: '魚群／珊瑚數量', type: 'range', min: 1, max: 60, step: 1 },
    { k: 'size', label: '主角大小', type: 'range', min: 0.3, max: 1.5, step: 0.01 },
    { k: 'speed', label: '動作速度', type: 'range', min: 0, max: 2, step: 0.05 },
    { k: 'direction', label: '游動方向', type: 'seg', opts: [['right', '向右'], ['left', '向左']] },
    { k: 'route', label: '游動路線', type: 'seg', opts: [['wave', '弧線'], ['straight', '直行'], ['orbit', '環繞']] },
    { k: 'current', label: '水流強度', type: 'range', min: 0, max: 1.5, step: 0.05 },
    { k: 'depth', label: '深海明暗', type: 'range', min: 0, max: 1, step: 0.05 },
    { k: 'bubbles', label: '氣泡與懸浮顆粒', type: 'seg', opts: [['1', '有'], ['0', '無']] },
    { k: 'seed', label: '群體與地形變化', type: 'range', min: 1, max: 99, step: 1 },
    { k: 'strike', label: '衝刺起點（片長比例）', type: 'range', min: 0.2, max: 0.7, step: 0.01 },
    { k: 'mouth', label: '衝刺張嘴', type: 'seg', opts: [['1', '張嘴'], ['0', '閉嘴']] },
    { k: 'exit', label: '衝刺結尾', type: 'seg', opts: [['pass', '擦身而過'], ['cover', '佔滿畫面']] },
    { k: 'shake', label: '衝刺震動', type: 'range', min: 0, max: 1, step: 0.05 },
    { k: 'beam', label: '探照燈', type: 'seg', opts: [['1', '掃描'], ['0', '關閉']] },
  ],
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
    { k: 'mode', label: '畫面', type: 'seg', opts: [['stars', '閃爍星空'], ['warp', '光速穿越'], ['galaxy', '旋轉星系'], ['planet', '行星光環'], ['sun', '太陽'], ['moon', '月球'], ['earth', '地球'], ['flyby', '低空飛越']] },
    { k: 'cam', label: '鏡頭', type: 'seg', opts: [['none', '固定'], ['in', '推近 Zoom In'], ['out', '拉遠 Zoom Out']] },
    { k: 'camz', label: '縮放倍數', type: 'range', min: 1.2, max: 6, step: 0.1 },
    { k: 'surface', label: '飛越地表', type: 'seg', opts: [['earth', '地球'], ['moon', '月球'], ['mars', '火星'], ['sun', '太陽']] },
    { k: 'alt', label: '飛行高度', type: 'range', min: 0, max: 1, step: 0.01 },
    { k: 'density', label: '星星數量', type: 'range', min: 0.2, max: 3, step: 0.1 },
    { k: 'speed', label: '速度', type: 'range', min: 0, max: 3, step: 0.05 },
    { k: 'color', label: '主色', type: 'color' },
    { k: 'color2', label: '輔色', type: 'color' },
    { k: 'planet', label: '行星顏色', type: 'color' },
    { k: 'ring', label: '行星光環', type: 'seg', opts: [['1', '有'], ['0', '無']] },
    { k: 'shoot', label: '流星', type: 'seg', opts: [['1', '有'], ['0', '無']] },
    { k: 'size', label: '星系／星球大小', type: 'range', min: 0.1, max: 0.6, step: 0.01 },
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
export const objFxId = (m: OModule) => ({ meteor: 'obj-meteor-rock', cube: 'obj-cube-plastic', cosmos: 'obj-cosmos-stars', aerial: 'obj-aerial-city', vehicle: 'obj-vehicle-car', ocean: 'obj-ocean-fish' })[m];
export const isObjFx = (id: string) => id.startsWith(objFxPrefix);
export const objFxModule = (id: string): OModule => (OBJ_MODULES.find((m) => id.startsWith(`${objFxPrefix}${m}`)) ?? 'meteor');

export const defaultObjScene = (module: OModule = 'meteor'): OScene => ({
  ratio: '9:16',
  loop: module === 'ocean' ? 8 : 6,
  module,
  bg: BG[module],
  params: { ...OBJ_DEFAULTS[module] },
  text: { lines: [], layout: module === 'ocean' ? 'none' : module === 'cosmos' || module === 'aerial' ? 'over' : 'below', color: module === 'vehicle' ? '#1d2433' : '#ffffff', size: 1, stroke: module === 'vehicle' ? '#ffffff' : '#111111', strokeW: module === 'aerial' ? 14 : module === 'vehicle' ? 10 : 0, delay: 0.6 },
});

/** 補齊缺漏欄位並夾住範圍，AI 給的資料也能安全使用 */
export const normalizeObjScene = (raw: Partial<OScene>, fallback: OModule = 'meteor'): OScene => {
  const module = OBJ_MODULES.includes(raw.module as OModule) ? (raw.module as OModule) : fallback;
  const base = defaultObjScene(module);
  if (module === 'ocean') Object.assign(base.params, OCEAN_PRESETS[String(raw.params?.mode)] ?? {});
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
  if (module === 'cosmos' && ['sun', 'moon', 'earth'].includes(String(params.mode))) {
    if (raw.params?.size === undefined) params.size = params.mode === 'sun' ? 0.34 : 0.46;
    if (raw.params?.y === undefined) params.y = 0.36;
  }
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
  sc.params = { ...sc.params, ...(module === 'ocean' ? OCEAN_PRESETS[String(preset.mode)] : {}), ...preset };
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
    if (h.startsWith('rgb(')) return h.slice(4, -1).split(',').map(Number);
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


  /** 低空飛越星球表面：地平線帶弧度，地表特徵依透視從遠方迎面而來 */
  const drawFlyby = (ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, number | string>, t: number, u: number, zf: number, fade: number) => {
    const g = (k: string, d: number) => num(P[k], d);
    const surf = String(P.surface ?? 'earth');
    const sp = g('speed', 1);
    const alt = g('alt', 0.45);
    const y0 = H * (0.3 + 0.12 * alt);
    const curve = (0.12 + alt * 0.5) / zf;
    const yh = (x: number) => y0 + curve * H * ((x - W / 2) / W) ** 2;
    // 高度：推近＝往下降、拉遠＝往上升
    const fy = (H - y0) * (0.55 + alt) * 1.25 / zf;
    const fx = fy;
    const pal = {
      earth: { sky: ['#9ad4ff', '#62aef0', '#3477cf', '#1d4592', '#0f2350'], g: ['#2f7fd8', '#2a74c9', '#246ab9'] },
      moon: { sky: ['#1a1c22'], g: ['#b3b2ab', '#a2a19a', '#8f8e88'] },
      mars: { sky: ['#e2a77f', '#b46a52', '#6b3a3e', '#2a1a2a'], g: ['#d98a5a', '#c9744a', '#b4633c'] },
      sun: { sky: ['#ffd84a', '#ff9a1f', '#a83a10'], g: ['#ffb02e', '#ff9a1f', '#f08414'] },
    }[surf] ?? { sky: ['#9ad4ff'], g: ['#2f7fd8', '#2a74c9', '#246ab9'] };
    const arc = (dy: number) => {
      ctx.moveTo(0, yh(0) - dy);
      for (let x = 0; x <= W; x += W / 24) ctx.lineTo(x, yh(x) - dy);
    };
    // 星空（只在地平線上方）
    stars(140, 13).forEach(([x, y, s, ph, m]) => {
      const px = ((x + t * 0.003 * sp) % 1) * W;
      const py = y * H * 0.6;
      if (py > yh(px) - H * 0.06) return;
      ctx.globalAlpha = fade * (0.4 + 0.6 * Math.abs(Math.sin(t * (0.8 + m) + ph)));
      ctx.fillStyle = '#ffffff';
      const r = (0.8 + s * 2) * u;
      ctx.fillRect(px - r / 2, py - r / 2, r, r);
    });
    ctx.globalAlpha = fade;
    // 大氣層：沿地平線的實色弧帶
    const bandH = H * 0.022;
    for (let i = pal.sky.length - 1; i >= 0; i--) {
      ctx.fillStyle = pal.sky[i];
      ctx.beginPath();
      arc(bandH * (i + 1) * (surf === 'moon' ? 0 : 1));
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
    }
    if (surf === 'moon') {
      // 月球上看見的地球
      const ex = W * 0.8;
      const ey = H * 0.075;
      const er = Math.min(W, H) * 0.06;
      blob(ctx, ex, ey, er, '#2f7fd8');
      ctx.save();
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.clip();
      lump(ctx, ex - er * 0.2 + Math.sin(t * 0.2) * er * 0.3, ey - er * 0.1, er * 0.45, er * 0.35, 2, '#5fb35a', 0.4);
      lump(ctx, ex + er * 0.4, ey + er * 0.4, er * 0.3, er * 0.2, 4, '#5fb35a', 0.4);
      blob(ctx, ex - er * 0.3, ey + er * 0.25, er * 0.2, '#ffffff');
      ctx.fillStyle = 'rgba(0,0,12,0.45)';
      ctx.beginPath();
      ctx.arc(ex + er * 0.45, ey + er * 0.3, er * 1.1, 0, Math.PI * 2);
      ctx.arc(ex - er * 0.1, ey - er * 0.1, er * 0.95, 0, Math.PI * 2, true);
      ctx.fill('evenodd');
      ctx.restore();
    }
    if (surf === 'sun') {
      // 日珥：從地平線拱起的實色弧
      for (let k = 0; k < 3; k++) {
        const px = W * (0.2 + k * 0.32) + Math.sin(t * 0.3 + k) * W * 0.03;
        const base = yh(px) - bandH * 3;
        const rr = H * (0.06 + 0.03 * Math.sin(t * 1.2 + k * 2));
        ctx.strokeStyle = k % 2 ? '#ff7a1a' : '#ffb02e';
        ctx.lineWidth = H * 0.012;
        ctx.beginPath();
        ctx.ellipse(px, base, rr * 1.3, rr, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
      }
    }
    // 地表：由遠到近三層色帶（遠方較亮，像空氣透視）
    const depthY = (z: number) => fy / z;
    [[60, pal.g[0]], [8, pal.g[1]], [3, pal.g[2]]].forEach(([z, c]) => {
      ctx.fillStyle = mix(c as string, '#ffffff', surf === 'sun' ? 0 : 0.08);
      ctx.beginPath();
      arc(-depthY(z as number));
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
    });
    // 地表特徵：[橫向位置, 初始深度, 大小, 種類, 亂數]
    const r = rng(surf.length * 97 + 5);
    const D = 40;
    const near = 1.3;
    const feats = Array.from({ length: surf === 'sun' ? 170 : 120 }, () => [(r() - 0.5) * 30, r(), r(), r(), r()]);
    const speed = 3.2 * sp;
    const list = feats
      .map(([gx, z0, sz, ty, sd]) => [gx, near + ((((z0 * D - t * speed) % D) + D) % D), sz, ty, sd])
      .filter(([gx, gz]) => Math.abs((gx * fx) / gz) < W * 0.9)
      .sort((a, b) => b[1] - a[1]);
    const proj = (gx: number, gz: number, h = 1) => {
      const sx = W / 2 + (gx * fx) / gz;
      return [sx, yh(sx) + (fy * h) / gz];
    };
    // 地面上半徑 rad 的圓：前後緣分別投影，近大遠小、不會超出地平線
    const ell = (gx: number, gz: number, rad: number, h = 1) => {
      const sx = W / 2 + (gx * fx) / gz;
      const top = yh(sx) + (fy * h) / (gz + rad);
      const bot = yh(sx) + (fy * h) / Math.max(0.35, gz - rad);
      return [sx, (top + bot) / 2, (rad * fx) / gz, (bot - top) / 2];
    };
    for (const [gx, gz, sz, ty, sd] of list) {
      const [sx, sy0] = proj(gx, gz);
      if (sy0 - (sz * 1.5 * fx) / gz > H) continue;
      // 已經大到超出畫面寬度的就不畫，避免整片色塊蓋住
      if (((0.5 + sz * 1.2) * fx) / gz > W * 1.1) continue;
      let sy = sy0;
      const fadeIn = Math.min(1, (D + near - gz) / 6);
      ctx.globalAlpha = fade * fadeIn;
      if (surf === 'earth') {
        const rad = 0.5 + sz * 1.2;
        const [, cy, rx, ry] = ell(gx, gz, rad);
        sy = cy;
        if (ty < 0.45) {
          // 島嶼：沙灘→草地→山林
          lump(ctx, sx, sy, rx * 1.08, ry * 1.08, sd * 9, '#e9d9a6', 0.3);
          lump(ctx, sx, sy, rx, ry, sd * 9, '#5fb35a', 0.3);
          lump(ctx, sx - rx * 0.1, sy - ry * 0.05, rx * 0.55, ry * 0.5, sd * 7, '#3f8f45', 0.35);
          if (sd < 0.4) lump(ctx, sx - rx * 0.12, sy - ry * 0.12, rx * 0.2, ry * 0.18, sd * 5, '#8a7a5a', 0.3);
        } else {
          // 浪花
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          ctx.fillRect(sx - rx * 0.25, sy, rx * 0.5, Math.max(1, ry * 0.08));
        }
      } else if (surf === 'sun') {
        const rad = 0.3 + sz * 0.7;
        const [, cy, rx, ry] = ell(gx, gz, rad);
        sy = cy;
        lump(ctx, sx, sy, rx, ry, sd * 9, ty < 0.5 ? '#ffc94a' : '#e8760f', 0.35);
        if (ty < 0.15) lump(ctx, sx, sy, rx * 0.4, ry * 0.4, sd * 3, '#c4520a', 0.3);
      } else {
        // 月球、火星：隕石坑與岩塊
        const rad = ty < 0.6 ? 0.3 + sz * 1.2 : 0.06 + sz * 0.12;
        const [, cy, rx, ry] = ell(gx, gz, rad);
        sy = cy;
        const base = surf === 'mars' ? '#c9744a' : '#a2a19a';
        if (ty < 0.6) {
          lump(ctx, sx, sy, rx * 1.12, ry * 1.12, sd * 9, mix(base, '#ffffff', 0.25), 0.12);
          lump(ctx, sx, sy + ry * 0.05, rx, ry, sd * 9, mix(base, '#000000', 0.28), 0.12);
          lump(ctx, sx, sy + ry * 0.2, rx * 0.8, ry * 0.7, sd * 9, mix(base, '#000000', 0.12), 0.12);
        } else {
          const hgt = rx * 0.9;
          lump(ctx, sx + rx * 0.4, sy + ry * 0.3, rx * 1.2, ry, sd * 5, 'rgba(0,0,0,0.25)', 0.2);
          lump(ctx, sx, sy - hgt * 0.4, rx, hgt * 0.6, sd * 5, mix(base, '#000000', 0.3), 0.25);
          lump(ctx, sx - rx * 0.2, sy - hgt * 0.55, rx * 0.6, hgt * 0.35, sd * 5, mix(base, '#ffffff', 0.15), 0.25);
        }
      }
    }
    // 地球：雲層在較低的高度，比地表更快掠過
    if (surf === 'earth') {
      const cl = Array.from({ length: 26 }, () => [(r() - 0.5) * 24, r(), r(), r()]);
      cl.map(([gx, z0, sz, sd]) => [gx, near + ((((z0 * D - t * speed * 1.4) % D) + D) % D), sz, sd])
        .sort((a, b) => b[1] - a[1])
        .forEach(([gx, gz, sz, sd]) => {
          const [sx] = proj(gx, gz, 0.45);
          if (gz < 2.5) return;
          const rad = 0.5 + sz * 0.9;
          const [, sy2, rx, ry] = ell(gx, gz, rad, 0.45);
          const sy = sy2;
          ctx.globalAlpha = fade * Math.min(1, (D + near - gz) / 6);
          lump(ctx, sx + rx * 0.04, sy + ry * 0.12, rx, ry, sd * 9, '#dfe7ef', 0.35);
          lump(ctx, sx, sy, rx * 0.96, ry * 0.92, sd * 9, '#ffffff', 0.35);
        });
    }
    if (surf === 'mars') {
      // 飛沙：細短線往後掠
      ctx.globalAlpha = fade * 0.5;
      ctx.fillStyle = '#f2c9a0';
      for (let k = 0; k < 40; k++) {
        const q = ((k * 0.137 + t * 0.5 * sp) % 1);
        const x = ((k * 0.618) % 1) * W;
        const y = yh(x) + (H - yh(x)) * q;
        ctx.fillRect(x, y, W * 0.02 * (0.3 + q), 1.5 * u);
      }
    }
    ctx.globalAlpha = fade;
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
  const drawCosmos = (ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, number | string>, t: number, u: number, L = 6) => {
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
    const R0 = (g('size', 0.32) * S) / 2;
    // 鏡頭推近／拉遠：星球放大縮小，背景星星微微跟著（遠景視差較小）
    const cam = String(P.cam ?? 'none');
    const cz = Math.max(1, g('camz', 3));
    const cp = inout(t / Math.max(1, L));
    const zf = cam === 'in' ? 1 + (cz - 1) * cp : cam === 'out' ? cz - (cz - 1) * cp : 1;
    const zs = Math.pow(zf, 0.3);
    const R = R0 * zf;
    ctx.save();
    ctx.globalAlpha *= fade;
    if (mode === 'flyby') {
      drawFlyby(ctx, W, H, P, t, u, zf, fade);
      ctx.restore();
      return { cx: W / 2, cy: H * 0.2, r: S * 0.08 };
    }
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
        const px = W / 2 + (((x + t * 0.004 * sp * (0.3 + s)) % 1) * W - W / 2) * zs;
        const py = H / 2 + (y * H - H / 2) * zs;
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
      if (mode === 'sun' || mode === 'moon' || mode === 'earth') {
        const pe = back(t / 0.8);
        ctx.save();
        ctx.translate(X, Y);
        ctx.scale(pe, pe);
        // 正射投影：經緯度 → 球面上的點（z<0 在背面，壓到邊緣）
        const proj = (lon: number, lat: number, rot: number) => {
          const cl = Math.cos(lat);
          let x = R * cl * Math.sin(lon + rot);
          const y = -R * Math.sin(lat);
          const z = cl * Math.cos(lon + rot);
          if (z < 0) x = Math.sign(x || 1) * Math.sqrt(Math.max(0, R * R - y * y));
          return [x, y, z];
        };
        // 球面上的不規則色塊（陸地、坑洞、雲），整塊轉到背面就不畫
        const patch = (list: number[][], rot: number, col: string, seed: number, wob: number) => {
          list.forEach(([lo, la, rr], i) => {
            const r = rng(seed + i * 7);
            const pts: number[][] = [];
            let vis = false;
            for (let k = 0; k < 18; k++) {
              const a = (k / 18) * Math.PI * 2;
              const kk = rr * (1 - wob / 2 + r() * wob);
              const p = proj(lo + (Math.cos(a) * kk) / Math.max(0.3, Math.cos(la)), la + Math.sin(a) * kk * 0.8, rot);
              if (p[2] > 0) vis = true;
              pts.push(p);
            }
            if (!vis) return;
            ctx.fillStyle = col;
            ctx.beginPath();
            pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            ctx.closePath();
            ctx.fill();
          });
        };
        const shade = (a: number) => {
          ctx.fillStyle = `rgba(0,0,12,${a})`;
          ctx.beginPath();
          ctx.arc(R * 0.42, R * 0.32, R * 1.08, 0, Math.PI * 2);
          ctx.arc(-R * 0.12, -R * 0.1, R * 0.96, 0, Math.PI * 2, true);
          ctx.fill('evenodd');
        };
        if (mode === 'sun') {
          // 光芒：長短交錯的實色三角形，兩層反向慢轉
          const rot = t * 0.15 * sp;
          ([[16, 1.75, '#ff8a1f', 1], [16, 1.45, '#ffb52e', -1]] as [number, number, string, number][]).forEach(([n, L, c, d], j) => {
            ctx.fillStyle = c;
            for (let k = 0; k < n; k++) {
              const a = ((k + j * 0.5) / n) * Math.PI * 2 + rot * d;
              const len = R * (L + (k % 2 ? -0.18 : 0) + 0.06 * Math.sin(t * 3 + k));
              ctx.beginPath();
              ctx.moveTo(Math.cos(a - 0.11) * R * 0.9, Math.sin(a - 0.11) * R * 0.9);
              ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
              ctx.lineTo(Math.cos(a + 0.11) * R * 0.9, Math.sin(a + 0.11) * R * 0.9);
              ctx.closePath();
              ctx.fill();
            }
          });
          // 日冕：跳動的鋸齒圈
          ctx.fillStyle = '#ffc93c';
          ctx.beginPath();
          for (let k = 0; k <= 48; k++) {
            const a = (k / 48) * Math.PI * 2 - rot * 0.6;
            const rr = R * (1.12 + (k % 2 ? 0.07 : 0) + 0.03 * Math.sin(t * 4 + k * 1.7));
            if (k) ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
            else ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, R, 0, Math.PI * 2);
          ctx.fillStyle = '#ffd84a';
          ctx.fill();
          ctx.save();
          ctx.clip();
          ctx.fillStyle = '#ffe98a';
          ctx.beginPath();
          ctx.arc(-R * 0.18, -R * 0.2, R * 0.68, 0, Math.PI * 2);
          ctx.fill();
          patch([[0.3, 0.2, 0.16], [2.1, -0.35, 0.12], [3.6, 0.45, 0.1], [4.8, -0.1, 0.18], [5.7, 0.6, 0.08], [1.3, -0.7, 0.1]], t * 0.25 * sp, '#ffb52e', 31, 0.5);
          ctx.restore();
        }
        if (mode === 'moon') {
          const rot = t * 0.12 * sp;
          ctx.beginPath();
          ctx.arc(0, 0, R, 0, Math.PI * 2);
          ctx.fillStyle = '#d9d8d2';
          ctx.fill();
          ctx.save();
          ctx.clip();
          // 月海
          patch([[0.4, 0.35, 0.42], [-0.5, 0.1, 0.32], [1.6, -0.25, 0.36], [3.2, 0.3, 0.4], [4.6, -0.4, 0.3]], rot, '#b9b8b0', 41, 0.5);
          // 坑洞：亮邊＋深色底
          const cr = [[0.1, -0.5, 0.12], [0.9, 0.6, 0.1], [-0.8, -0.3, 0.14], [2.3, 0.1, 0.12], [2.9, -0.6, 0.09], [3.9, 0.5, 0.13], [5.1, 0, 0.11], [5.6, -0.5, 0.08], [1.2, 0.05, 0.07], [-0.2, 0.75, 0.07]];
          patch(cr.map(([a, b, c]) => [a + 0.02, b + 0.02, c]), rot, '#efeee9', 51, 0.1);
          patch(cr, rot, '#a3a29a', 51, 0.1);
          shade(0.42);
          ctx.restore();
        }
        if (mode === 'earth') {
          const rot = t * 0.18 * sp;
          // 繞行的小月亮（後半圈在地球後面）
          const ma = t * 0.5 * sp + 1;
          const moon = (front: boolean) => {
            if (front !== Math.sin(ma) > 0) return;
            const mx = Math.cos(ma) * R * 1.75;
            const my = Math.sin(ma) * R * 0.35 - Math.cos(ma) * R * 0.25;
            ctx.fillStyle = '#d9d8d2';
            ctx.beginPath();
            ctx.arc(mx, my, R * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#a3a29a';
            ctx.beginPath();
            ctx.arc(mx - R * 0.05, my - R * 0.04, R * 0.05, 0, Math.PI * 2);
            ctx.arc(mx + R * 0.07, my + R * 0.06, R * 0.035, 0, Math.PI * 2);
            ctx.fill();
          };
          moon(false);
          // 大氣層：一圈實色細邊
          ctx.beginPath();
          ctx.arc(0, 0, R * 1.07, 0, Math.PI * 2);
          ctx.fillStyle = '#8fd0ff';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, R, 0, Math.PI * 2);
          ctx.fillStyle = '#2f7fd8';
          ctx.fill();
          ctx.save();
          ctx.clip();
          ctx.fillStyle = '#3b92e6';
          ctx.beginPath();
          ctx.arc(-R * 0.2, -R * 0.2, R * 0.7, 0, Math.PI * 2);
          ctx.fill();
          // 陸地、冰帽、雲（雲轉得比較快）
          const land = [[0.2, 0.75, 0.42], [0.55, 0.3, 0.38], [0.35, -0.25, 0.42], [2.0, 0.55, 0.5], [2.4, 0.15, 0.32], [2.9, -0.45, 0.34], [4.4, 0.6, 0.38], [4.6, 0.1, 0.25], [4.9, -0.4, 0.42], [5.8, 0.35, 0.2]];
          patch(land, rot, '#5fb35a', 61, 0.55);
          patch(land.filter((_, i) => i % 3 === 0).map(([a, b, c]) => [a + 0.06, b - 0.05, c * 0.5]), rot, '#8fc85e', 71, 0.5);
          patch([[0, 1.45, 0.3], [3, 1.45, 0.3], [0, -1.45, 0.3], [3, -1.45, 0.3]], rot, '#f2f6fa', 81, 0.3);
          patch([[0.9, 0.45, 0.22], [1.7, -0.1, 0.18], [3.4, 0.35, 0.2], [4.2, -0.55, 0.16], [5.4, 0.1, 0.22], [0.1, -0.6, 0.15]], t * 0.3 * sp, '#ffffff', 91, 0.7);
          shade(0.4);
          ctx.restore();
          moon(true);
        }
        ctx.restore();
      }
    }
    // 流星：固定節奏從右上斜劃過
    if (g('shoot', 1) && mode !== 'warp' && mode !== 'flyby') {
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
    return { cx: X, cy: Y, r: mode === 'stars' || mode === 'warp' ? S * 0.1 : mode === 'sun' ? R0 * 1.7 : mode === 'earth' ? R0 * 1.15 : R0 };
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
  const fillPl = (ctx: CanvasRenderingContext2D, pl: Pt[], c: string) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    pl.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
  };
  /** 折線往法線方向平移 d */
  const offPl = (pl: Pt[], d: number): Pt[] =>
    pl.map(([x, y], i) => {
      const a = pl[Math.max(0, i - 1)];
      const b = pl[Math.min(pl.length - 1, i + 1)];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [x - ((b[1] - a[1]) / L) * d, y + ((b[0] - a[0]) / L) * d];
    });
  const blob = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  /** 不規則色塊（湖、草地斑塊、雲） */
  const lump = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, seed: number, c: string, wob = 0.25) => {
    const ph = [seed * 1.7, seed * 2.9, seed * 4.3];
    ctx.fillStyle = c;
    ctx.beginPath();
    for (let j = 0; j <= 36; j++) {
      const a = (j / 36) * Math.PI * 2;
      const k = 1 + wob * (0.6 * Math.sin(2 * a + ph[0]) + 0.3 * Math.sin(3 * a + ph[1]) + 0.2 * Math.sin(5 * a + ph[2]));
      const px = x + Math.cos(a) * rx * k;
      const py = y + Math.sin(a) * ry * k;
      if (j) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  };
  const hash = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  /** 闊葉樹冠：落影＋幾團葉叢＋亮面 */
  const tree = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) => {
    const h = hash(x, y);
    const lobes = (dx: number, dy: number, k: number, col: string) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = h * 6 + (i / 5) * Math.PI * 2;
        const cx = x + dx + Math.cos(a) * r * 0.42 * k;
        const cy = y + dy + Math.sin(a) * r * 0.42 * k;
        ctx.moveTo(cx + r * 0.6 * k, cy);
        ctx.arc(cx, cy, r * 0.6 * k, 0, Math.PI * 2);
      }
      ctx.fill();
    };
    lobes(r * 0.4, r * 0.45, 1, 'rgba(0,0,0,0.22)');
    lobes(0, 0, 1, mix(c, '#000000', 0.25));
    lobes(-r * 0.12, -r * 0.14, 0.78, c);
    blob(ctx, x - r * 0.32, y - r * 0.34, r * 0.3, mix(c, '#ffffff', 0.2));
  };
  /** 針葉樹：星形 */
  const pine = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) => {
    const h = hash(x, y) * 6;
    const star = (dx: number, dy: number, k: number, col: string) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      for (let i = 0; i < 18; i++) {
        const a = h + (i / 18) * Math.PI * 2;
        const rr = r * k * (i % 2 ? 0.55 : 1);
        if (i) ctx.lineTo(x + dx + Math.cos(a) * rr, y + dy + Math.sin(a) * rr);
        else ctx.moveTo(x + dx + Math.cos(a) * rr, y + dy + Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    };
    star(r * 0.45, r * 0.5, 1, 'rgba(0,0,0,0.24)');
    star(0, 0, 1, mix(c, '#000000', 0.25));
    star(-r * 0.08, -r * 0.08, 0.68, c);
    blob(ctx, x - r * 0.12, y - r * 0.12, r * 0.16, mix(c, '#ffffff', 0.25));
  };
  /** 俯視的車：落影、車身、車頂、前後擋風玻璃；kind 1＝公車／貨車 */
  const carTop = (ctx: CanvasRenderingContext2D, x: number, y: number, a: number, L: number, c: string, kind = 0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    const Wd = kind ? L * 0.3 : L * 0.46;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(-L / 2 + L * 0.06, -Wd / 2 + L * 0.08, L, Wd);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.roundRect(-L / 2, -Wd / 2, L, Wd, Wd * 0.3);
    ctx.fill();
    if (kind) {
      ctx.fillStyle = mix(c, '#000000', 0.12);
      ctx.fillRect(-L * 0.4, -Wd * 0.28, L * 0.8, Wd * 0.56);
      ctx.fillStyle = 'rgba(20,30,45,0.8)';
      ctx.fillRect(L * 0.42, -Wd * 0.38, L * 0.05, Wd * 0.76);
    } else {
      ctx.fillStyle = 'rgba(20,30,45,0.82)';
      ctx.fillRect(L * 0.08, -Wd * 0.4, L * 0.17, Wd * 0.8);
      ctx.fillRect(-L * 0.36, -Wd * 0.36, L * 0.1, Wd * 0.72);
      ctx.fillStyle = mix(c, '#ffffff', 0.18);
      ctx.fillRect(-L * 0.26, -Wd * 0.36, L * 0.34, Wd * 0.72);
    }
    ctx.restore();
  };
  /** 機車：細長車身＋騎士安全帽 */
  const scooter = (ctx: CanvasRenderingContext2D, x: number, y: number, a: number, L: number, c: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(-L * 0.4, -L * 0.1, L, L * 0.3);
    ctx.fillStyle = '#2a2d33';
    ctx.fillRect(-L / 2, -L * 0.1, L, L * 0.2);
    blob(ctx, -L * 0.05, 0, L * 0.2, c);
    ctx.restore();
  };
  /** 俯視的牛、馬、羊：落影、身體、頭、耳朵或鬃毛、尾巴；吃草時頭會點 */
  const animal = (ctx: CanvasRenderingContext2D, x: number, y: number, a: number, L: number, kind: number, t: number, ph: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    const nod = Math.sin(t * 2.4 + ph) * 0.06 * L;
    if (kind === 3) {
      // 羊：一團白毛＋黑臉
      blob(ctx, L * 0.1, L * 0.12, L * 0.34, 'rgba(0,0,0,0.2)');
      ctx.fillStyle = '#f3f0e8';
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const q = (i / 7) * Math.PI * 2;
        ctx.moveTo(Math.cos(q) * L * 0.18 + L * 0.14, Math.sin(q) * L * 0.12);
        ctx.arc(Math.cos(q) * L * 0.18, Math.sin(q) * L * 0.12, L * 0.14, 0, Math.PI * 2);
      }
      ctx.fill();
      blob(ctx, -L * 0.04, -L * 0.04, L * 0.12, '#ffffff');
      ctx.fillStyle = '#2b2522';
      ctx.beginPath();
      ctx.ellipse(L * 0.36 + nod, 0, L * 0.09, L * 0.065, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    const horse = kind === 1 || kind === 4;
    const body = kind === 0 ? '#f6f3ec' : kind === 1 ? '#8a5532' : kind === 2 ? '#7a4a2c' : '#2e2622';
    const bl = horse ? 0.5 : 0.46;
    const bw = horse ? 0.19 : 0.22;
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(L * 0.08, L * 0.1, L * bl, L * bw, 0, 0, Math.PI * 2);
    ctx.fill();
    // 尾巴
    ctx.strokeStyle = horse ? '#2a1d16' : mix(body, '#000000', 0.4);
    ctx.lineCap = 'round';
    ctx.lineWidth = L * (horse ? 0.07 : 0.035);
    ctx.beginPath();
    ctx.moveTo(-L * bl * 0.9, 0);
    ctx.quadraticCurveTo(-L * (bl + 0.08), Math.sin(t * 3 + ph) * L * 0.05, -L * (bl + 0.14), Math.sin(t * 3 + ph + 1) * L * 0.07);
    ctx.stroke();
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, L * bl, L * bw, 0, 0, Math.PI * 2);
    ctx.fill();
    // 背脊亮面
    ctx.fillStyle = mix(body, '#ffffff', 0.15);
    ctx.beginPath();
    ctx.ellipse(-L * 0.04, -L * bw * 0.25, L * bl * 0.7, L * bw * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (kind === 0) {
      ctx.fillStyle = '#26221f';
      [[-0.22, -0.06, 0.12, 0.4], [0.1, 0.09, 0.1, -0.3], [0.3, -0.1, 0.07, 0.8], [-0.05, -0.14, 0.06, 0]].forEach(([sx, sy, sr, ro]) => {
        ctx.beginPath();
        ctx.ellipse(sx * L, sy * L, sr * L, sr * L * 0.75, ro, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    // 頸與頭
    const hx = L * (bl + (horse ? 0.14 : 0.1)) + nod;
    ctx.fillStyle = kind === 0 ? '#ece6da' : body;
    ctx.beginPath();
    ctx.ellipse(hx, 0, L * (horse ? 0.17 : 0.14), L * (horse ? 0.09 : 0.1), 0, 0, Math.PI * 2);
    ctx.fill();
    if (horse) {
      ctx.strokeStyle = '#2a1d16';
      ctx.lineWidth = L * 0.05;
      ctx.beginPath();
      ctx.lineWidth = L * 0.035;
      ctx.moveTo(L * 0.36, 0);
      ctx.lineTo(hx - L * 0.06, 0);
      ctx.stroke();
    } else {
      // 牛耳與角
      ctx.fillStyle = kind === 0 ? '#26221f' : mix(body, '#000000', 0.2);
      ctx.beginPath();
      ctx.ellipse(hx - L * 0.06, -L * 0.13, L * 0.05, L * 0.03, 0.4, 0, Math.PI * 2);
      ctx.ellipse(hx - L * 0.06, L * 0.13, L * 0.05, L * 0.03, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#efe6cf';
      ctx.fillRect(hx - L * 0.02, -L * 0.11, L * 0.025, L * 0.22);
    }
    ctx.restore();
  };
  /** 俯視的雲：地面落影＋兩層實色 */
  const cloudTop = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, seed: number) => {
    const r = rng(seed);
    const lobes = Array.from({ length: 7 }, () => [(r() - 0.5) * s * 1.6, (r() - 0.5) * s * 0.7, s * (0.32 + r() * 0.3)]);
    const draw = (dx: number, dy: number, k: number, c: string) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      lobes.forEach(([lx, ly, lr]) => {
        ctx.moveTo(x + dx + lx + lr * k, y + dy + ly);
        ctx.arc(x + dx + lx, y + dy + ly, lr * k, 0, Math.PI * 2);
      });
      ctx.fill();
    };
    draw(s * 0.5, s * 0.75, 1, 'rgba(15,25,35,0.16)');
    draw(s * 0.06, s * 0.06, 1, '#dfe6ee');
    draw(0, 0, 0.9, '#ffffff');
  };

  /* 城市：道路分主次、人行道、斑馬線、街廓切成多棟建築（含頂樓水塔、樓梯間、冷氣、太陽能板、鐵皮加蓋） */
  const SW = 0.007;
  const ROOFS = ['#dcd8cf', '#c9c3b7', '#e9e4da', '#b8bec4', '#a9c4ae', '#6f8fb0', '#d3bca3'];
  const CAR_COLS = ['#ffffff', '#f0f0f0', '#1f2329', '#8d949c', '#c0392b', '#2f6db5', '#e8c547', '#5b6f63'];
  const cityGen = (r: () => number, E: number, skip?: (x: number, y: number) => boolean) => {
    const B = 0.3;
    const n = Math.ceil(E / B) + 1;
    const roads: number[][] = [];
    for (let k = -n; k <= n; k++) roads.push([k * B, k % 3 === 0 ? 0.06 : 0.036]);
    const lots: number[][] = [];
    const parks: number[][] = [];
    const parking: number[][] = [];
    const schools: number[][] = [];
    const split = (x: number, y: number, w: number, h: number, d: number) => {
      if (d > 2 || (w < 0.07 && h < 0.07) || (d > 0 && r() < 0.2)) {
        lots.push([x, y, w, h, 0.12 + r() * r() * 0.9, r() < 0.12 ? 5 : Math.floor(r() * ROOFS.length), r()]);
        return;
      }
      const G = 0.005;
      const f = 0.35 + r() * 0.3;
      if (w > h) {
        split(x, y, w * f - G / 2, h, d + 1);
        split(x + w * f + G / 2, y, w * (1 - f) - G / 2, h, d + 1);
      } else {
        split(x, y, w, h * f - G / 2, d + 1);
        split(x, y + h * f + G / 2, w, h * (1 - f) - G / 2, d + 1);
      }
    };
    for (let i = 0; i < roads.length - 1; i++)
      for (let j = 0; j < roads.length - 1; j++) {
        const x0 = roads[i][0] + roads[i][1] / 2 + SW;
        const x1 = roads[i + 1][0] - roads[i + 1][1] / 2 - SW;
        const y0 = roads[j][0] + roads[j][1] / 2 + SW;
        const y1 = roads[j + 1][0] - roads[j + 1][1] / 2 - SW;
        if (skip && skip((x0 + x1) / 2, (y0 + y1) / 2)) continue;
        const u = r();
        const blk = [x0, y0, x1 - x0, y1 - y0, r()];
        if (u < 0.09) parks.push(blk);
        else if (u < 0.15) parking.push(blk);
        else if (u < 0.19) schools.push(blk);
        else split(x0 + 0.004, y0 + 0.004, x1 - x0 - 0.008, y1 - y0 - 0.008, 0);
      }
    const veh: number[][] = [];
    roads.forEach(([v, rw]) => {
      const major = rw > 0.05;
      const lanes = major ? [-0.375, -0.125, 0.125, 0.375] : [-0.25, 0.25];
      for (const axis of [0, 1])
        lanes.forEach((lo) => {
          const dir = axis === 0 ? (lo < 0 ? 1 : -1) : lo > 0 ? 1 : -1;
          const cnt = 3 + Math.floor(r() * 4);
          const spd = (0.04 + r() * 0.03) * (major ? 1.2 : 1);
          for (let k = 0; k < cnt; k++) {
            const ty = r();
            veh.push([axis, v, lo * rw, dir, (k + r() * 0.5) / cnt, spd, major && ty < 0.1 ? 1 : ty < 0.3 ? 2 : 0, Math.floor(r() * CAR_COLS.length)]);
          }
        });
    });
    lots.sort((a, b) => a[4] - b[4]);
    return { roads, lots, parks, parking, schools, veh };
  };
  const building = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, hh: number, roof: number, s: number) => {
    const d = 0.004 + hh * 0.028;
    fillPl(ctx, [[x + w, y], [x + w + d, y + d], [x + w + d, y + h + d], [x + d, y + h + d], [x, y + h]], 'rgba(20,24,30,0.28)');
    const c = ROOFS[roof];
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = mix(c, '#ffffff', 0.35);
    ctx.fillRect(x, y, w, 0.0018);
    ctx.fillRect(x, y, 0.0018, h);
    ctx.fillStyle = mix(c, '#000000', 0.22);
    ctx.fillRect(x, y + h - 0.0018, w, 0.0018);
    ctx.fillRect(x + w - 0.0018, y, 0.0018, h);
    const r = rng(Math.floor(s * 99991));
    if (roof === 5) {
      // 鐵皮屋頂：浪板條紋
      ctx.fillStyle = mix(c, '#ffffff', 0.18);
      if (w > h) for (let k = x + 0.003; k < x + w - 0.002; k += 0.004) ctx.fillRect(k, y + 0.002, 0.0015, h - 0.004);
      else for (let k = y + 0.003; k < y + h - 0.002; k += 0.004) ctx.fillRect(x + 0.002, k, w - 0.004, 0.0015);
      return;
    }
    ctx.strokeStyle = mix(c, '#000000', 0.12);
    ctx.lineWidth = 0.0012;
    ctx.strokeRect(x + 0.004, y + 0.004, w - 0.008, h - 0.008);
    if (w < 0.03 || h < 0.03) return;
    if (r() < 0.14) {
      // 太陽能板
      const pw = w * 0.5;
      const ph = h * 0.4;
      const px = x + w * 0.1 + r() * (w * 0.3);
      const py = y + h * 0.1 + r() * (h * 0.4);
      ctx.fillStyle = '#2c4f7c';
      ctx.fillRect(px, py, pw, ph);
      ctx.fillStyle = '#5d82b0';
      for (let k = px + 0.006; k < px + pw; k += 0.006) ctx.fillRect(k, py, 0.0008, ph);
      for (let k = py + 0.004; k < py + ph; k += 0.004) ctx.fillRect(px, k, pw, 0.0008);
    } else if (roof === 4) {
      // 屋頂花園
      for (let k = 0; k < 4; k++) tree(ctx, x + w * (0.2 + r() * 0.6), y + h * (0.2 + r() * 0.6), 0.006 + r() * 0.004, '#6aa04a');
    }
    // 樓梯間
    const sx = x + w * (0.15 + r() * 0.55);
    const sy = y + h * (0.15 + r() * 0.55);
    ctx.fillStyle = 'rgba(20,24,30,0.25)';
    ctx.fillRect(sx + 0.003, sy + 0.003, 0.012, 0.016);
    ctx.fillStyle = mix(c, '#ffffff', 0.25);
    ctx.fillRect(sx, sy, 0.012, 0.016);
    // 水塔
    const tn = 1 + Math.floor(r() * 2);
    for (let k = 0; k < tn; k++) {
      const tx = sx + 0.003 + k * 0.007;
      const ty = sy + 0.004;
      blob(ctx, tx + 0.0015, ty + 0.0015, 0.0032, 'rgba(0,0,0,0.25)');
      blob(ctx, tx, ty, 0.0032, '#e9edf1');
      blob(ctx, tx - 0.0008, ty - 0.0008, 0.0014, '#ffffff');
    }
    // 冷氣主機
    const an = Math.floor(r() * 4);
    for (let k = 0; k < an; k++) {
      const ax = x + w * (0.1 + r() * 0.75);
      const ay = y + h * (0.1 + r() * 0.75);
      ctx.fillStyle = '#c9ccd1';
      ctx.fillRect(ax, ay, 0.006, 0.005);
      blob(ctx, ax + 0.003, ay + 0.0025, 0.0016, '#7c828a');
    }
  };
  const drawCity = (ctx: CanvasRenderingContext2D, c: Record<string, number[][]>, E: number, tint: string) => {
    const roads = c.roads;
    ctx.fillStyle = tint || '#cbc4b6';
    ctx.fillRect(-E, -E, E * 2, E * 2);
    ctx.fillStyle = '#e3ded3';
    for (const [v, rw] of roads) {
      ctx.fillRect(v - rw / 2 - SW, -E, rw + SW * 2, E * 2);
      ctx.fillRect(-E, v - rw / 2 - SW, E * 2, rw + SW * 2);
    }
    for (const [v, rw] of roads) {
      ctx.fillStyle = rw > 0.05 ? '#50555d' : '#5a5f67';
      ctx.fillRect(v - rw / 2, -E, rw, E * 2);
      ctx.fillRect(-E, v - rw / 2, E * 2, rw);
    }
    // 標線：只畫在路口之間
    ctx.lineWidth = 0.0022;
    ctx.lineCap = 'butt';
    for (const [v, rw] of roads) {
      const major = rw > 0.05;
      for (let j = 0; j < roads.length - 1; j++) {
        const a = roads[j][0] + roads[j][1] / 2 + 0.018;
        const b = roads[j + 1][0] - roads[j + 1][1] / 2 - 0.018;
        const line = (off: number, col: string, dash: boolean) => {
          ctx.strokeStyle = col;
          ctx.setLineDash(dash ? [0.01, 0.01] : []);
          ctx.beginPath();
          ctx.moveTo(v + off, a);
          ctx.lineTo(v + off, b);
          ctx.moveTo(a, v + off);
          ctx.lineTo(b, v + off);
          ctx.stroke();
        };
        if (major) {
          line(-0.0022, '#f2c94c', false);
          line(0.0022, '#f2c94c', false);
          line(-rw / 4, '#f4f1ea', true);
          line(rw / 4, '#f4f1ea', true);
        } else line(0, '#f4f1ea', true);
      }
    }
    ctx.setLineDash([]);
    // 斑馬線
    ctx.fillStyle = 'rgba(246,243,236,0.95)';
    for (const [v, rw] of roads)
      for (const [u, uw] of roads)
        for (const side of [-1, 1]) {
          const y = side > 0 ? u + uw / 2 + 0.003 : u - uw / 2 - 0.015;
          for (let x = v - rw / 2 + 0.002; x < v + rw / 2 - 0.002; x += 0.0065) ctx.fillRect(x, y, 0.0035, 0.012);
          const x2 = side > 0 ? v + rw / 2 + 0.003 : v - rw / 2 - 0.015;
          for (let y2 = u - uw / 2 + 0.002; y2 < u + uw / 2 - 0.002; y2 += 0.0065) ctx.fillRect(x2, y2, 0.012, 0.0035);
        }
    // 公園
    for (const [x, y, w, h, s] of c.parks) {
      const r = rng(Math.floor(s * 7919));
      ctx.fillStyle = '#9cc77a';
      ctx.fillRect(x, y, w, h);
      lump(ctx, x + w * 0.4, y + h * 0.55, w * 0.3, h * 0.25, s * 9, '#a9d086', 0.3);
      strokePl(ctx, [[x, y], [x + w, y + h]], 0.008, '#ece3cc');
      strokePl(ctx, [[x + w, y], [x, y + h]], 0.008, '#ece3cc');
      blob(ctx, x + w / 2, y + h / 2, Math.min(w, h) * 0.16, '#ece3cc');
      if (s < 0.5) {
        lump(ctx, x + w * 0.72, y + h * 0.3, w * 0.12, h * 0.09, s * 5, '#cfe3ef', 0.3);
        lump(ctx, x + w * 0.72, y + h * 0.3, w * 0.1, h * 0.07, s * 5, '#5aa5d6', 0.3);
      }
      blob(ctx, x + w / 2, y + h / 2, Math.min(w, h) * 0.06, '#7fb3d9');
      for (let k = 0; k < 16; k++) {
        const e = r();
        const tx = e < 0.5 ? x + 0.012 + r() * (w - 0.024) : r() < 0.5 ? x + 0.012 : x + w - 0.012;
        const ty = e < 0.5 ? (r() < 0.5 ? y + 0.012 : y + h - 0.012) : y + 0.012 + r() * (h - 0.024);
        tree(ctx, tx, ty, 0.01 + r() * 0.006, ['#5f9c4b', '#4f8f3f', '#6aa04a'][k % 3]);
      }
    }
    // 停車場
    for (const [x, y, w, h, s] of c.parking) {
      const r = rng(Math.floor(s * 6151));
      ctx.fillStyle = '#7d828a';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#f2efe6';
      for (const row of [0.08, 0.5]) {
        const ry = y + h * row;
        const rh = h * 0.38;
        ctx.fillRect(x + 0.01, ry + rh / 2 - 0.0008, w - 0.02, 0.0016);
        for (let k = x + 0.01; k <= x + w - 0.01; k += 0.012) ctx.fillRect(k, ry, 0.0012, rh);
        for (let k = x + 0.016; k < x + w - 0.012; k += 0.012)
          for (const half of [0, 1]) if (r() < 0.65) carTop(ctx, k, ry + rh * (half ? 0.75 : 0.25), Math.PI / 2, 0.016, CAR_COLS[Math.floor(r() * CAR_COLS.length)]);
      }
    }
    // 學校：操場跑道＋校舍
    for (const [x, y, w, h] of c.schools) {
      ctx.fillStyle = '#c9c2b2';
      ctx.fillRect(x, y, w, h);
      const tx = x + w * 0.04;
      const ty = y + h * 0.3;
      const tw = w * 0.92;
      const th = h * 0.66;
      ctx.fillStyle = '#c65b41';
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, th / 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 0.001;
      for (const k of [0.006, 0.012]) {
        ctx.beginPath();
        ctx.roundRect(tx + k, ty + k, tw - k * 2, th - k * 2, th / 2 - k);
        ctx.stroke();
      }
      ctx.fillStyle = '#7fb35a';
      ctx.beginPath();
      ctx.roundRect(tx + 0.018, ty + 0.018, tw - 0.036, th - 0.036, th / 2 - 0.018);
      ctx.fill();
      ctx.strokeStyle = '#f4f1ea';
      ctx.strokeRect(x + w * 0.3, ty + 0.03, w * 0.4, th - 0.06);
      building(ctx, x + w * 0.04, y + h * 0.03, w * 0.92, h * 0.2, 0.4, 2, 0.31);
    }
    for (const [x, y, w, h, hh, roof, s] of c.lots) building(ctx, x, y, w, h, hh, roof, s);
    // 主要道路的行道樹
    for (const [v, rw] of roads) {
      if (rw < 0.05) continue;
      for (let s = -E; s < E; s += 0.032) {
        if (roads.some(([u, uw]) => Math.abs(s - u) < uw / 2 + 0.02)) continue;
        for (const side of [-1, 1]) {
          tree(ctx, v + side * (rw / 2 + 0.004), s, 0.007, '#5f9c4b');
          tree(ctx, s, v + side * (rw / 2 + 0.004), 0.007, '#5f9c4b');
        }
      }
    }
  };
  const drawTraffic = (ctx: CanvasRenderingContext2D, veh: number[][], t: number, E: number, traffic: number, hide?: (x: number, y: number) => boolean) => {
    veh.forEach(([axis, v, off, dir, s0, spd, type, col], i) => {
      if ((i * 0.618) % 1 > traffic) return;
      const s = (((s0 + (t * spd * dir) / (2 * E)) % 1) + 1) % 1;
      const pos = -E + s * 2 * E;
      const x = axis === 0 ? v + off : pos;
      const y = axis === 0 ? pos : v + off;
      if (hide && hide(x, y)) return;
      const a = axis === 0 ? (dir > 0 ? Math.PI / 2 : -Math.PI / 2) : dir > 0 ? 0 : Math.PI;
      if (type === 2) scooter(ctx, x, y, a, 0.009, ['#e74c3c', '#f1c40f', '#3498db', '#ecf0f1'][col % 4]);
      else carTop(ctx, x, y, a, type === 1 ? 0.036 : 0.017, type === 1 ? '#2e8b57' : CAR_COLS[col], type);
    });
  };

  const buildWorld = (mode: string, seed: number) => {
    const key = `${mode}|${seed}`;
    const hit = worldCache.get(key);
    if (hit) return hit;
    const r = rng(seed * 101 + mode.length);
    const E = 1.1;
    const w: Record<string, unknown> = {};
    if (mode === 'city') w.city = cityGen(r, E);
    if (mode === 'highway') {
      w.city = cityGen(r, E, (x, y) => Math.abs(x) < 0.62 && Math.abs(y) < 0.62);
      const ramps: Pt[][] = [];
      for (const sx of [-1, 1])
        for (const sy of [-1, 1]) {
          const p0 = [sx * 0.7, sy * 0.05];
          const c = [sx * 0.42, sy * 0.42];
          const p2 = [sx * 0.018, sy * 0.7];
          ramps.push(Array.from({ length: 41 }, (_, i) => {
            const q = i / 40;
            return [(1 - q) * (1 - q) * p0[0] + 2 * q * (1 - q) * c[0] + q * q * p2[0], (1 - q) * (1 - q) * p0[1] + 2 * q * (1 - q) * c[1] + q * q * p2[1]];
          }));
        }
      w.ramps = ramps;
      w.trees = Array.from({ length: 90 }, () => [(r() - 0.5) * 1.2, (r() - 0.5) * 1.2, 0.008 + r() * 0.008, r()]);
      w.fv = Array.from({ length: 48 }, (_, i) => [i % 6, r(), 0.08 + r() * 0.05, r() < 0.2 ? 1 : 0, Math.floor(r() * CAR_COLS.length)]);
    }
    if (mode === 'river') {
      const ph = r() * 6;
      const rx = (y: number) => 0.03 + 0.1 * Math.sin(1.5 * y + ph) + 0.03 * Math.sin(4.1 * y + ph * 2);
      w.rx = rx;
      w.river = Array.from({ length: 121 }, (_, i) => {
        const y = -E + (i / 120) * 2 * E;
        return [rx(y), y];
      });
      w.city = cityGen(r, E, (x, y) => [-0.13, 0, 0.13].some((d) => Math.abs(x - rx(y + d)) < 0.42));
      w.ripples = Array.from({ length: 170 }, () => [r(), (r() - 0.5) * 0.2, 0.01 + r() * 0.02]);
      w.bars = Array.from({ length: 4 }, (_, i) => [(i + 0.3 + r() * 0.4) / 4, i % 2 ? 0.065 : -0.065, r()]);
      w.boats = Array.from({ length: 3 }, () => [r(), r() < 0.5 ? 1 : -1]);
      w.parkTrees = Array.from({ length: 140 }, () => [r(), r() < 0.5 ? -1 : 1, 0.15 + r() * 0.06, r()]);
      w.bikes = Array.from({ length: 10 }, () => [r(), r() < 0.5 ? -1 : 1, r() < 0.5 ? 1 : -1]);
    }
    if (mode === 'forest') {
      const ph = r() * 6;
      w.stream = Array.from({ length: 101 }, (_, i) => {
        const y = -E + (i / 100) * 2 * E;
        return [0.16 + 0.08 * Math.sin(2.2 * y + ph) + 0.03 * Math.sin(6 * y), y];
      });
      w.trail = Array.from({ length: 101 }, (_, i) => {
        const x = -E + (i / 100) * 2 * E;
        return [x, -0.12 + 0.12 * Math.sin(1.8 * x + ph * 1.3) + 0.03 * Math.sin(5 * x)];
      });
      w.clear = [-0.12, 0.26, 0.11, 0.08];
      const trees: number[][] = [];
      const G = 0.042;
      for (let x = -0.85; x < 0.85; x += G)
        for (let y = -0.95; y < 0.95; y += G) trees.push([x + (r() - 0.5) * G, y + (r() - 0.5) * G, 0.022 + r() * 0.016, r(), r()]);
      w.trees = trees.sort((a, b) => a[1] - b[1]);
      w.rocks = Array.from({ length: 40 }, () => [r(), r() < 0.5 ? -1 : 1, r()]);
      w.hikers = Array.from({ length: 4 }, () => [r(), Math.floor(r() * 4)]);
    }
    if (mode === 'mountain') {
      w.peaks = Array.from({ length: 6 }, () => [(r() - 0.5) * 1.6, (r() - 0.5) * 1.8, 0.3 + r() * 0.28, Math.floor(r() * 1000)]);
      const peaks = w.peaks as number[][];
      const elev = (x: number, y: number) => Math.max(0, ...peaks.map(([px, py, pr]) => 1 - Math.hypot(x - px, y - py) / pr));
      w.pines = Array.from({ length: 900 }, () => [(r() - 0.5) * 2, (r() - 0.5) * 2.1, r()])
        .filter(([x, y]) => {
          const e = elev(x, y);
          return e > 0.04 && e < 0.42;
        })
        .sort((a, b) => a[1] - b[1]);
      let best = [0, 0];
      let bd = 9;
      for (let k = 0; k < 300; k++) {
        const x = (r() - 0.5) * 1.2;
        const y = (r() - 0.5) * 1.4;
        if (elev(x, y) === 0 && peaks.every(([px, py, pr]) => Math.hypot(x - px, y - py) > pr + 0.08) && Math.hypot(x, y) < bd) {
          bd = Math.hypot(x, y);
          best = [x, y];
        }
      }
      w.lake = best;
      const ph = r() * 6;
      w.road = Array.from({ length: 121 }, (_, i) => {
        const y = -1.1 + (i / 120) * 2.2;
        return [best[0] - 0.2 + 0.18 * Math.sin(3.1 * y + ph) + 0.07 * Math.sin(9 * y), y];
      });
      w.clouds = Array.from({ length: 4 }, (_, i) => [(r() - 0.5) * 1.4, -0.7 + i * 0.45 + r() * 0.1, 0.035 + r() * 0.025, Math.floor(r() * 1000)]);
    }
    if (mode === 'grass') {
      w.patches = Array.from({ length: 40 }, () => [(r() - 0.5) * 2, (r() - 0.5) * 2, 0.06 + r() * 0.12, r(), r()]);
      w.flowers = Array.from({ length: 360 }, () => [(r() - 0.5) * 2, (r() - 0.5) * 2, r()]);
      w.trees = Array.from({ length: 18 }, () => [(r() - 0.5) * 1.8, (r() - 0.5) * 1.8, 0.022 + r() * 0.02, r()]).filter(([x, y]) => Math.hypot(x, y) > 0.3);
      w.animals = Array.from({ length: 26 }, () => [(r() - 0.5) * 0.5, (r() - 0.5) * 0.75 + 0.05, r() * Math.PI * 2, Math.floor(r() * 5), r() < 0.45 ? 1 : 0, r() * 6]);
      const ph = r() * 6;
      w.path = Array.from({ length: 61 }, (_, i) => {
        const x = -1.1 + (i / 60) * 2.2;
        return [x, 0.38 * Math.sin(1.4 * x + ph) + 0.28];
      });
      w.barn = [-0.22 + r() * 0.1, -0.42];
      w.pond = [0.2, -0.28];
    }
    if (mode === 'farm') {
      const xs: number[] = [];
      const ys: number[] = [];
      for (let x = -1.1; x < 1.1; x += 0.3 + r() * 0.12) xs.push(x);
      for (let y = -1.1; y < 1.1; y += 0.26 + r() * 0.1) ys.push(y);
      w.xs = xs;
      w.ys = ys;
      const fields: number[][] = [];
      const houses: number[][] = [];
      for (let i = 0; i < xs.length - 1; i++)
        for (let j = 0; j < ys.length - 1; j++) {
          const x0 = xs[i] + 0.012;
          const x1 = xs[i + 1] - 0.012;
          const y0 = ys[j] + 0.012;
          const y1 = ys[j + 1] - 0.012;
          if (r() < 0.13) {
            houses.push([x0, y0, x1 - x0, y1 - y0, r()]);
            continue;
          }
          const n = 2 + Math.floor(r() * 3);
          const vert = r() < 0.5;
          for (let k = 0; k < n; k++) {
            const a = k / n;
            const type = Math.floor(r() * 7);
            if (vert) fields.push([x0 + (x1 - x0) * a, y0, (x1 - x0) / n, y1 - y0, type, 1, r()]);
            else fields.push([x0, y0 + (y1 - y0) * a, x1 - x0, (y1 - y0) / n, type, 0, r()]);
          }
        }
      w.fields = fields;
      w.houses = houses;
      w.canalX = xs[Math.floor(xs.length / 2)];
    }
    if (mode === 'coast') {
      const ph = r() * 6;
      const sx = (y: number) => 0.06 + 0.05 * Math.sin(2.2 * y + ph) + 0.015 * Math.sin(6.5 * y);
      w.sx = sx;
      w.shore = Array.from({ length: 121 }, (_, i) => {
        const y = -E + (i / 120) * 2 * E;
        return [sx(y), y];
      });
      w.city = cityGen(r, E, (x) => x > -0.5);
      w.pines = Array.from({ length: 260 }, () => [-0.275 + r() * 0.11, (r() - 0.5) * 2.2, 0.01 + r() * 0.008, r()]).sort((a, b) => a[1] - b[1]);
      w.umbrellas = Array.from({ length: 30 }, () => [r(), (r() - 0.5) * 2.2, Math.floor(r() * 4), r()]);
      w.boats = Array.from({ length: 5 }, () => [0.3 + r() * 0.6, (r() - 0.5) * 2, r(), r() < 0.3 ? 1 : 0]);
      w.crests = Array.from({ length: 60 }, () => [0.18 + r() * 0.8, (r() - 0.5) * 2.2, r()]);
      w.tetra = Array.from({ length: 70 }, () => [r(), (r() - 0.5) * 0.04, r() * 6]);
      w.vcar = Array.from({ length: 10 }, (_, i) => [i / 10 + r() * 0.05, i % 2 ? 1 : -1, Math.floor(r() * CAR_COLS.length)]);
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
    const E = 1.2;
    const ground = (c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(-E, -E, E * 2, E * 2);
    };
    const traffic = g('traffic', 1);
    type City = { roads: number[][]; veh: number[][] } & Record<string, number[][]>;
    const city = w.city as City | undefined;
    if (mode === 'city' && city) {
      drawCity(ctx, city, E, tint);
      drawTraffic(ctx, city.veh, t, E, traffic);
    }
    if (mode === 'highway' && city) {
      drawCity(ctx, city, E, tint);
      const Z = 0.6;
      ctx.fillStyle = '#a3c47f';
      ctx.fillRect(-Z, -Z, Z * 2, Z * 2);
      for (let k = 0; k < 14; k++) lump(ctx, Math.sin(k * 2.3) * 0.45, Math.cos(k * 1.7) * 0.45, 0.08, 0.05, k, k % 2 ? '#98bb74' : '#adcc8a', 0.35);
      for (const [x, y, rr, k] of w.trees as number[][]) if (Math.abs(x) > 0.08 && Math.abs(y) > 0.1 && Math.hypot(Math.abs(x) - 0.175, Math.abs(y) - 0.205) > 0.15) tree(ctx, x, y, rr, k < 0.5 ? '#5f9c4b' : '#4f8f3f');
      const RW = 0.024;
      const R0 = 0.13;
      const loops = [-1, 1].flatMap((sx) => [-1, 1].map((sy) => [sx * (0.032 + RW / 2 + R0), sy * (0.066 + RW / 2 + R0)]));
      const ramps = w.ramps as Pt[][];
      const rampRoad = (draw: (lw: number, c: string) => void) => {
        draw(RW + 0.006, '#d6d2c8');
        draw(RW, '#575c64');
      };
      for (const rp of ramps) rampRoad((lw, c) => strokePl(ctx, rp, lw, c));
      for (const [cx, cy] of loops)
        rampRoad((lw, c) => {
          ctx.strokeStyle = c;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx, cy, R0, 0, Math.PI * 2);
          ctx.stroke();
        });
      // 高速公路主線：雙向各三線、中央護欄
      const FW = 0.066;
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(-E, -FW + 0.006, E * 2, FW * 2);
      ctx.fillStyle = '#e1ddd3';
      ctx.fillRect(-E, -FW - 0.004, E * 2, FW * 2 + 0.008);
      ctx.fillStyle = '#4c5159';
      ctx.fillRect(-E, -FW, E * 2, FW * 2);
      ctx.fillStyle = '#c9c9c9';
      ctx.fillRect(-E, -0.006, E * 2, 0.012);
      ctx.fillStyle = '#f2c94c';
      ctx.fillRect(-E, -0.0008, E * 2, 0.0016);
      ctx.lineWidth = 0.0022;
      for (const sgn of [-1, 1]) {
        strokePl(ctx, [[-E, sgn * 0.01], [E, sgn * 0.01]], 0.0022, '#f4f1ea');
        strokePl(ctx, [[-E, sgn * (FW - 0.004)], [E, sgn * (FW - 0.004)]], 0.0022, '#f4f1ea');
        ctx.setLineDash([0.016, 0.016]);
        strokePl(ctx, [[-E, sgn * 0.028], [E, sgn * 0.028]], 0.0022, '#f4f1ea');
        strokePl(ctx, [[-E, sgn * 0.046], [E, sgn * 0.046]], 0.0022, '#f4f1ea');
        ctx.setLineDash([]);
      }
      // 門架與綠色指標
      for (const gx of [-0.42, 0.46]) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(gx + 0.004, -FW - 0.01 + 0.006, 0.005, FW * 2 + 0.02);
        ctx.fillStyle = '#7a8088';
        ctx.fillRect(gx, -FW - 0.01, 0.005, FW * 2 + 0.02);
        ctx.fillStyle = '#1f7a4d';
        ctx.fillRect(gx - 0.002, gx < 0 ? -FW + 0.006 : 0.014, 0.009, 0.044);
      }
      // 主線車流
      for (const [lane, s0, spd, kind, col] of w.fv as number[][]) {
        const dir = lane < 3 ? -1 : 1;
        const y = dir < 0 ? -(0.019 + (lane % 3) * 0.018) : 0.019 + (lane % 3) * 0.018;
        const s = (((s0 + (t * spd * dir) / (2 * E)) % 1) + 1) % 1;
        if (s0 * 10 % 1 > traffic) continue;
        carTop(ctx, -E + s * 2 * E, y, dir > 0 ? 0 : Math.PI, kind ? 0.04 : 0.019, kind ? '#f2f2f2' : CAR_COLS[col], kind);
      }
      // 匝道車流
      ramps.forEach((rp, i) => {
        for (let k = 0; k < Math.round(3 * traffic); k++) {
          const q = along(rp, (k / 3 + t * 0.03 + i * 0.2) % 1);
          carTop(ctx, q.x, q.y, q.a, 0.017, CAR_COLS[(k + i) % CAR_COLS.length]);
        }
      });
      loops.forEach(([cx, cy], i) => {
        for (let k = 0; k < Math.round(3 * traffic); k++) {
          const a = (k / 3) * Math.PI * 2 + t * 0.25 * (i % 2 ? 1 : -1);
          carTop(ctx, cx + Math.cos(a) * R0, cy + Math.sin(a) * R0, a + (i % 2 ? Math.PI / 2 : -Math.PI / 2), 0.017, CAR_COLS[(k * 3 + i) % CAR_COLS.length]);
        }
      });
      // 跨越主線的高架聯絡道
      const AW = 0.032;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(-AW + 0.01, -FW - 0.02 + 0.01, AW * 2, FW * 2 + 0.04);
      ctx.fillStyle = '#f0ede6';
      ctx.fillRect(-AW - 0.003, -E, AW * 2 + 0.006, E * 2);
      ctx.fillStyle = '#5b6068';
      ctx.fillRect(-AW, -E, AW * 2, E * 2);
      strokePl(ctx, [[-0.0022, -E], [-0.0022, E]], 0.0022, '#f2c94c');
      strokePl(ctx, [[0.0022, -E], [0.0022, E]], 0.0022, '#f2c94c');
      ctx.setLineDash([0.01, 0.01]);
      strokePl(ctx, [[-AW / 2, -E], [-AW / 2, E]], 0.0022, '#f4f1ea');
      strokePl(ctx, [[AW / 2, -E], [AW / 2, E]], 0.0022, '#f4f1ea');
      ctx.setLineDash([]);
      for (let k = 0; k < Math.round(10 * traffic); k++) {
        const s = ((k / 10 + t * 0.03) % 1) * 2 * E - E;
        carTop(ctx, -AW * 0.75 + (k % 2) * 0.016, -s, -Math.PI / 2, 0.017, CAR_COLS[k % CAR_COLS.length]);
        carTop(ctx, AW * 0.25 + (k % 2) * 0.016, s, Math.PI / 2, 0.017, CAR_COLS[(k + 3) % CAR_COLS.length]);
      }
      drawTraffic(ctx, city.veh, t, E, traffic, (x, y) => Math.abs(x) < Z + 0.02 && Math.abs(y) < Z + 0.02);
    }
    if (mode === 'river' && city) {
      drawCity(ctx, city, E, tint);
      const rv = w.river as Pt[];
      const rx = w.rx as (y: number) => number;
      // 堤外道路 → 堤防 → 河濱公園 → 礫石灘 → 河水（深淺三層）
      strokePl(ctx, rv, 0.52, '#5a5f67');
      ctx.setLineDash([0.01, 0.01]);
      for (const sgn of [-1, 1]) strokePl(ctx, offPl(rv, sgn * 0.245), 0.0022, '#f4f1ea');
      ctx.setLineDash([]);
      strokePl(ctx, rv, 0.46, '#d4cfc4');
      strokePl(ctx, rv, 0.44, '#9dc879');
      for (let k = 0; k < 12; k++) {
        const q = along(rv, (k + 0.5) / 12);
        lump(ctx, q.x + (k % 2 ? 0.17 : -0.17), q.y, 0.035, 0.06, k, '#aed38c', 0.3);
      }
      // 自行車道
      for (const sgn of [-1, 1]) {
        const bp = offPl(rv, sgn * 0.175);
        strokePl(ctx, bp, 0.012, '#c96e5a');
        ctx.setLineDash([0.008, 0.008]);
        strokePl(ctx, bp, 0.0012, '#f4f1ea');
        ctx.setLineDash([]);
      }
      // 球場
      for (const by of [-0.55, 0.62]) {
        const q = along(rv, (by + E) / (2 * E));
        const bx = q.x + (by < 0 ? 0.205 : -0.205);
        ctx.fillStyle = '#4f8fbf';
        ctx.fillRect(bx - 0.016, by - 0.03, 0.032, 0.06);
        ctx.strokeStyle = '#f4f1ea';
        ctx.lineWidth = 0.0012;
        ctx.strokeRect(bx - 0.013, by - 0.027, 0.026, 0.054);
        strokePl(ctx, [[bx - 0.013, by], [bx + 0.013, by]], 0.0012, '#f4f1ea');
      }
      for (const [s, sgn, off, k] of w.parkTrees as number[][]) {
        const q = along(rv, s);
        const d = sgn * (off > 0.19 ? 0.205 : off);
        if (Math.abs(d) > 0.165 && Math.abs(d) < 0.19) continue;
        tree(ctx, q.x + d / Math.max(0.6, Math.cos(q.a - Math.PI / 2) || 1), q.y, 0.009 + k * 0.006, k < 0.5 ? '#5f9c4b' : '#4f8f3f');
      }
      strokePl(ctx, rv, 0.27, '#cfc4a3');
      strokePl(ctx, rv, 0.25, '#3a84c2');
      strokePl(ctx, rv, 0.18, '#4090cf');
      strokePl(ctx, rv, 0.08, '#4b9edb');
      for (const [s, side, k] of w.bars as number[][]) {
        const q = along(rv, s);
        ctx.save();
        ctx.translate(q.x + side, q.y);
        ctx.rotate(q.a);
        lump(ctx, 0, 0, 0.07, 0.018, k * 7, '#d9cda6', 0.2);
        lump(ctx, 0.005, 0, 0.04, 0.009, k * 9, '#9cbf7a', 0.3);
        ctx.restore();
      }
      // 漣漪：短白線順流而下
      ctx.lineCap = 'round';
      for (const [s0, lat, len] of w.ripples as number[][]) {
        const q = along(rv, (s0 + t * 0.006) % 1);
        const x = q.x + lat;
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 0.0018;
        ctx.beginPath();
        ctx.moveTo(x, q.y);
        ctx.lineTo(x + Math.cos(q.a) * len, q.y + Math.sin(q.a) * len);
        ctx.stroke();
      }
      (w.boats as number[][]).forEach(([s0, d], i) => {
        const q = along(rv, (((s0 + t * 0.008 * d) % 1) + 1) % 1);
        ctx.save();
        ctx.translate(q.x + (i % 2 ? 0.035 : -0.035), q.y);
        ctx.rotate(q.a + (d < 0 ? Math.PI : 0));
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 0.0025;
        ctx.beginPath();
        ctx.moveTo(-0.02, 0);
        ctx.lineTo(-0.08, -0.018);
        ctx.moveTo(-0.02, 0);
        ctx.lineTo(-0.08, 0.018);
        ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(-0.02, -0.006, 0.05, 0.016);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0.03, 0);
        ctx.lineTo(0.014, -0.009);
        ctx.lineTo(-0.022, -0.009);
        ctx.lineTo(-0.022, 0.009);
        ctx.lineTo(0.014, 0.009);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#e04f3a';
        ctx.fillRect(-0.012, -0.005, 0.016, 0.01);
        ctx.restore();
      });
      // 自行車
      for (const [s0, sgn, d] of w.bikes as number[][]) {
        const q = along(rv, (((s0 + t * 0.004 * d) % 1) + 1) % 1);
        scooter(ctx, q.x + sgn * 0.175 + d * 0.003, q.y, q.a + (d < 0 ? Math.PI : 0), 0.008, ['#f1c40f', '#3498db', '#e74c3c'][Math.floor(s0 * 3)]);
      }
      // 橋：沿城市道路跨河
      const bridges = city.roads.filter(([v]) => Math.abs(v) < 0.95 && Math.round(v / 0.3) % 2 === 0);
      for (const [by, bw] of bridges) {
        const cx = rx(by);
        const x0 = cx - 0.27;
        const x1 = cx + 0.27;
        ctx.fillStyle = 'rgba(10,30,50,0.3)';
        ctx.fillRect(x0, by - bw / 2 + 0.014, x1 - x0, bw);
        ctx.fillStyle = '#ece8df';
        ctx.fillRect(x0, by - bw / 2 - 0.004, x1 - x0, bw + 0.008);
        ctx.fillStyle = bw > 0.05 ? '#50555d' : '#5a5f67';
        ctx.fillRect(x0, by - bw / 2, x1 - x0, bw);
        if (bw > 0.05) {
          strokePl(ctx, [[x0, by - 0.0022], [x1, by - 0.0022]], 0.0022, '#f2c94c');
          strokePl(ctx, [[x0, by + 0.0022], [x1, by + 0.0022]], 0.0022, '#f2c94c');
        }
        ctx.setLineDash([0.01, 0.01]);
        strokePl(ctx, [[x0, by - bw / 4], [x1, by - bw / 4]], 0.0022, '#f4f1ea');
        strokePl(ctx, [[x0, by + bw / 4], [x1, by + bw / 4]], 0.0022, '#f4f1ea');
        ctx.setLineDash([]);
        ctx.fillStyle = '#9aa0a8';
        for (let x = x0; x < x1; x += 0.012) {
          ctx.fillRect(x, by - bw / 2 - 0.004, 0.003, 0.004);
          ctx.fillRect(x, by + bw / 2, 0.003, 0.004);
        }
      }
      // 高架捷運
      const my = 0.33;
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(-E, my + 0.012, E * 2, 0.022);
      ctx.fillStyle = '#d9d6cf';
      ctx.fillRect(-E, my - 0.011, E * 2, 0.022);
      ctx.fillStyle = '#b9b5ad';
      ctx.fillRect(-E, my - 0.0015, E * 2, 0.003);
      const mx = ((t * 0.12) % 3.2) - 1.6;
      for (let k = 0; k < 4; k++) {
        const x = mx - k * 0.052;
        ctx.fillStyle = '#f4f4f2';
        ctx.beginPath();
        ctx.roundRect(x - 0.025, my - 0.008, 0.05, 0.016, k ? 0.002 : 0.006);
        ctx.fill();
        ctx.fillStyle = '#2f6db5';
        ctx.fillRect(x - 0.022, my - 0.0015, 0.044, 0.003);
      }
      const onBridge = (y: number) => bridges.some(([by, bw]) => Math.abs(y - by) < bw / 2);
      drawTraffic(ctx, city.veh, t, E, traffic, (x, y) => Math.abs(x - rx(y)) < 0.265 && !onBridge(y));
    }
    if (mode === 'forest') {
      ground(tint || '#2b552c');
      const st = w.stream as Pt[];
      const tr = w.trail as Pt[];
      const [ccx, ccy, crx, cry] = w.clear as number[];
      lump(ctx, ccx, ccy, crx, cry, 3, '#86b85a', 0.18);
      lump(ctx, ccx - 0.02, ccy - 0.01, crx * 0.7, cry * 0.6, 4, '#97c46a', 0.25);
      strokePl(ctx, st, 0.05, '#5d6b4f');
      strokePl(ctx, st, 0.036, '#3c86b8');
      strokePl(ctx, st, 0.016, '#58a2d4');
      for (const [s, side, k] of w.rocks as number[][]) {
        const q = along(st, s);
        lump(ctx, q.x + side * 0.02, q.y, 0.006 + k * 0.006, 0.005 + k * 0.004, k * 9, '#9a9a92', 0.25);
      }
      ctx.setLineDash([0.006, 0.014]);
      ctx.lineDashOffset = -t * 0.02;
      strokePl(ctx, offPl(st, 0.006), 0.0018, 'rgba(255,255,255,0.7)');
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
      strokePl(ctx, tr, 0.018, '#a78a5e');
      strokePl(ctx, tr, 0.012, '#c9ab7c');
      // 木棧橋
      let bi = 0;
      let bd = 9;
      tr.forEach(([x, y], i) => {
        const q = along(st, (y + 1.1) / 2.2);
        if (Math.abs(x - q.x) < bd) {
          bd = Math.abs(x - q.x);
          bi = i;
        }
      });
      const bq = along(tr, bi / (tr.length - 1));
      ctx.save();
      ctx.translate(bq.x, bq.y);
      ctx.rotate(bq.a);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(-0.035, -0.006, 0.07, 0.018);
      ctx.fillStyle = '#9b6b3f';
      ctx.fillRect(-0.035, -0.01, 0.07, 0.02);
      ctx.fillStyle = '#7a5230';
      for (let x = -0.033; x < 0.035; x += 0.006) ctx.fillRect(x, -0.01, 0.0012, 0.02);
      ctx.restore();
      // 林間小屋
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(ccx + 0.03, ccy - 0.012, 0.05, 0.034);
      ctx.fillStyle = '#a0522d';
      ctx.fillRect(ccx + 0.024, ccy - 0.02, 0.05, 0.034);
      ctx.fillStyle = '#c0663a';
      ctx.fillRect(ccx + 0.024, ccy - 0.02, 0.05, 0.017);
      const dist = (pl: Pt[], x: number, y: number) => Math.min(...pl.filter((_, i) => i % 2 === 0).map(([a, b]) => Math.hypot(a - x, b - y)));
      const greens = ['#24572a', '#2f6b34', '#3d7f3a', '#4f8f3f', '#5e9c45', '#3a6e3e'];
      for (const [x, y, rr, k, ty] of w.trees as number[][]) {
        if (Math.abs(x) > 0.75 || Math.abs(y) > 0.85) continue;
        if (((x - ccx) / (crx + 0.01)) ** 2 + ((y - ccy) / (cry + 0.01)) ** 2 < 1) continue;
        if (dist(st, x, y) < 0.035 + rr * 0.5 || dist(tr, x, y) < 0.012 + rr * 0.6) continue;
        const sway = Math.sin(t * 1.3 + k * 9) * 0.0015;
        const c = k > 0.97 ? '#b7a33f' : greens[Math.floor(k * greens.length)];
        if (ty < 0.3) pine(ctx, x + sway, y, rr * 0.9, c);
        else tree(ctx, x + sway, y, rr, c);
      }
      // 登山客
      for (const [s0, c] of w.hikers as number[][]) {
        const q = along(tr, (s0 + t * 0.006) % 1);
        blob(ctx, q.x + 0.002, q.y + 0.002, 0.004, 'rgba(0,0,0,0.3)');
        blob(ctx, q.x, q.y, 0.004, ['#e74c3c', '#f1c40f', '#3498db', '#ff7a45'][c]);
      }
      cloudTop(ctx, -0.3 + ((t * 0.02) % 1.2), -0.55, 0.09, 7);
    }
    if (mode === 'mountain') {
      ground(tint || '#a5b98a');
      const peaks = w.peaks as number[][];
      for (let k = 0; k < 18; k++) lump(ctx, Math.sin(k * 3.1) * 0.9, Math.cos(k * 2.3) * 0.9, 0.12, 0.08, k, k % 2 ? '#9db283' : '#afc292', 0.3);
      const [lx, ly] = w.lake as number[];
      lump(ctx, lx, ly, 0.13, 0.08, 5, '#c9c09a', 0.25);
      lump(ctx, lx, ly, 0.12, 0.07, 5, '#4a95c8', 0.25);
      lump(ctx, lx - 0.01, ly - 0.008, 0.08, 0.045, 6, '#5aa5d6', 0.25);
      ctx.setLineDash([0.01, 0.02]);
      ctx.lineDashOffset = -t * 0.01;
      for (const d of [-0.03, 0, 0.03]) strokePl(ctx, [[lx - 0.06, ly + d], [lx + 0.06, ly + d]], 0.0016, 'rgba(255,255,255,0.6)');
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
      const bands = ['#93a874', '#839a66', '#9a8a68', '#88785c', '#a8977a', '#c7bca8', '#f4f4f0'];
      const ring = (px: number, py: number, rad0: number, ph: number[], dx: number, dy: number, c: string) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        for (let j = 0; j <= 64; j++) {
          const a = (j / 64) * Math.PI * 2;
          const rad = rad0 * (1 + 0.2 * Math.sin(3 * a + ph[0]) + 0.1 * Math.sin(5 * a + ph[1]) + 0.05 * Math.sin(11 * a + ph[2]));
          const x = px + Math.cos(a) * rad + dx;
          const y = py + Math.sin(a) * rad + dy;
          if (j) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      };
      for (const [px, py, pr, sd] of peaks) {
        const rr = rng(sd);
        const ph = [rr() * 6, rr() * 6, rr() * 6];
        bands.forEach((c, i) => {
          const k = 1 - i / bands.length;
          const lift = (1 - k) * 0.05;
          // 東南側陰影面，西北側亮面
          ring(px, py, pr * k, ph, lift + 0.008, -lift + 0.012, mix(c, '#2a2a2a', 0.28));
          ring(px, py, pr * k, ph, lift, -lift, c);
          ring(px, py, pr * k * 0.82, ph, lift - 0.006, -lift - 0.008, mix(c, '#ffffff', 0.1));
        });
      }
      for (const [x, y, k] of w.pines as number[][]) pine(ctx, x, y, 0.01 + k * 0.006, k < 0.5 ? '#3f6f3a' : '#4f7f3f');
      const road = w.road as Pt[];
      strokePl(ctx, road, 0.02, '#e4dfd2');
      strokePl(ctx, road, 0.016, '#6a6f76');
      ctx.setLineDash([0.008, 0.008]);
      strokePl(ctx, road, 0.0015, '#f4f1ea');
      ctx.setLineDash([]);
      for (let k = 0; k < Math.round(4 * traffic); k++) {
        const q = along(road, (k / 4 + t * 0.012) % 1);
        carTop(ctx, q.x + 0.003, q.y, q.a, 0.015, CAR_COLS[k + 3]);
      }
      for (const [cx, cy, cs, sd] of w.clouds as number[][]) cloudTop(ctx, ((cx + t * 0.02 + 0.8) % 1.6) - 0.8, cy, cs, sd);
    }
    if (mode === 'grass') {
      ground(tint || '#a6ca70');
      for (const [x, y, rr, k, s] of w.patches as number[][]) lump(ctx, x, y, rr, rr * 0.7, s * 9, k < 0.5 ? '#98bf62' : '#b3d47f', 0.3);
      for (const [x, y, k] of w.flowers as number[][]) {
        ctx.fillStyle = k < 0.5 ? '#ffffff' : k < 0.8 ? '#ffe066' : '#c084fc';
        ctx.fillRect(x, y, 0.0035, 0.0035);
      }
      const path = w.path as Pt[];
      strokePl(ctx, path, 0.034, '#b39b6c');
      strokePl(ctx, path, 0.026, '#d3bd8c');
      strokePl(ctx, offPl(path, 0.006), 0.003, '#c2aa7a');
      // 池塘
      const [qx, qy] = w.pond as number[];
      lump(ctx, qx, qy, 0.1, 0.065, 2, '#7da35a', 0.2);
      lump(ctx, qx, qy, 0.09, 0.055, 2, '#4a95c8', 0.2);
      lump(ctx, qx - 0.012, qy - 0.008, 0.055, 0.03, 3, '#62a8d8', 0.2);
      ctx.strokeStyle = '#557a35';
      ctx.lineWidth = 0.002;
      for (let k = 0; k < 14; k++) {
        const a = k * 0.45 + 2.2;
        const x = qx + Math.cos(a) * 0.092;
        const y = qy + Math.sin(a) * 0.058;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 0.006, y - 0.01);
        ctx.stroke();
      }
      // 圍欄
      const fence = (x: number, y: number, fw: number, fh: number) => {
        ctx.strokeStyle = '#8a6a44';
        ctx.lineWidth = 0.0025;
        ctx.strokeRect(x, y, fw, fh);
        ctx.fillStyle = '#5e4630';
        for (let k = 0; k <= fw + 0.001; k += 0.025) {
          ctx.fillRect(x + k - 0.002, y - 0.002, 0.004, 0.004);
          ctx.fillRect(x + k - 0.002, y + fh - 0.002, 0.004, 0.004);
        }
        for (let k = 0; k <= fh + 0.001; k += 0.025) {
          ctx.fillRect(x - 0.002, y + k - 0.002, 0.004, 0.004);
          ctx.fillRect(x + fw - 0.002, y + k - 0.002, 0.004, 0.004);
        }
      };
      fence(-0.27, -0.3, 0.54, 0.72);
      // 穀倉、筒倉
      const [bx, by] = w.barn as number[];
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(bx + 0.012, by + 0.012, 0.11, 0.06);
      ctx.fillStyle = '#b8402e';
      ctx.fillRect(bx, by, 0.11, 0.03);
      ctx.fillStyle = '#8f3123';
      ctx.fillRect(bx, by + 0.03, 0.11, 0.03);
      ctx.fillStyle = '#e9e1d0';
      ctx.fillRect(bx, by + 0.029, 0.11, 0.002);
      blob(ctx, bx + 0.14 + 0.008, by + 0.03 + 0.008, 0.024, 'rgba(0,0,0,0.25)');
      blob(ctx, bx + 0.14, by + 0.03, 0.024, '#c7ccd2');
      blob(ctx, bx + 0.14, by + 0.03, 0.016, '#dfe3e8');
      blob(ctx, bx + 0.14, by + 0.03, 0.005, '#9aa1a9');
      for (const [x, y, rr, k] of w.trees as number[][]) tree(ctx, x, y, rr, k < 0.5 ? '#5f9c4b' : '#4c8a3e');
      const n = Math.round(g('herd', 18));
      (w.animals as number[][]).slice(0, n).forEach(([x, y, a, kind, walk, ph]) => {
        const d = walk ? Math.sin(t * 0.3 + ph) * 0.02 : 0;
        animal(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, a, 0.08, kind, walk ? t * 0.4 : t, ph);
      });
    }
    if (mode === 'farm') {
      ground(tint || '#8fb46a');
      const xs = w.xs as number[];
      const ys = w.ys as number[];
      // 田：秧苗水田、綠稻、金黃稻、菜園、翻土、溫室、果園
      for (const [x, y, fw, fh, type, vert, s] of w.fields as number[][]) {
        const x0 = x + 0.003;
        const y0 = y + 0.003;
        const fw2 = fw - 0.006;
        const fh2 = fh - 0.006;
        const base = ['#6fa5a0', '#7fb04f', '#d9bf55', '#7a5c3f', '#9c7a55', '#e8ecef', '#8fbf5f'][type];
        ctx.fillStyle = '#b9c79a';
        ctx.fillRect(x, y, fw, fh);
        ctx.fillStyle = base;
        ctx.fillRect(x0, y0, fw2, fh2);
        const rows = (gap: number, col: string, wid: number) => {
          ctx.fillStyle = col;
          if (vert) for (let k = x0 + gap / 2; k < x0 + fw2; k += gap) ctx.fillRect(k, y0, wid, fh2);
          else for (let k = y0 + gap / 2; k < y0 + fh2; k += gap) ctx.fillRect(x0, k, fw2, wid);
        };
        if (type === 0) {
          // 水田倒映天光，秧苗一點一點
          ctx.fillStyle = 'rgba(255,255,255,0.22)';
          ctx.beginPath();
          ctx.moveTo(x0 + fw2 * 0.2, y0);
          ctx.lineTo(x0 + fw2 * 0.45, y0);
          ctx.lineTo(x0 + fw2 * 0.15, y0 + fh2);
          ctx.lineTo(x0, y0 + fh2);
          ctx.lineTo(x0, y0 + fh2 * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#5e9a4f';
          for (let a = x0 + 0.004; a < x0 + fw2; a += 0.007) for (let b = y0 + 0.004; b < y0 + fh2; b += 0.007) ctx.fillRect(a, b, 0.0022, 0.0022);
        } else if (type === 1 || type === 2) rows(0.007, mix(base, '#000000', 0.14), 0.0028);
        else if (type === 3) {
          rows(0.012, '#6a4e35', 0.004);
          ctx.fillStyle = '#5fae4f';
          if (vert) for (let a = x0 + 0.009; a < x0 + fw2; a += 0.012) for (let b = y0 + 0.004; b < y0 + fh2; b += 0.008) ctx.fillRect(a - 0.0025, b, 0.005, 0.005);
          else for (let b = y0 + 0.009; b < y0 + fh2; b += 0.012) for (let a = x0 + 0.004; a < x0 + fw2; a += 0.008) ctx.fillRect(a, b - 0.0025, 0.005, 0.005);
        } else if (type === 4) rows(0.006, '#86663f', 0.003);
        else if (type === 5) {
          // 溫室：白色棚架與骨架
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.fillRect(x0 + 0.004, y0 + 0.004, fw2, fh2);
          ctx.fillStyle = '#eef2f4';
          ctx.fillRect(x0, y0, fw2, fh2);
          rows(0.016, '#c3cdd3', 0.0018);
          ctx.fillStyle = '#d7dee2';
          if (vert) for (let k = x0; k < x0 + fw2; k += 0.016) ctx.fillRect(k + 0.008, y0, 0.006, fh2);
          else for (let k = y0; k < y0 + fh2; k += 0.016) ctx.fillRect(x0, k + 0.008, fw2, 0.006);
        } else {
          for (let a = x0 + 0.012; a < x0 + fw2 - 0.006; a += 0.022) for (let b = y0 + 0.012; b < y0 + fh2 - 0.006; b += 0.022) tree(ctx, a, b, 0.008, s < 0.5 ? '#4f8f3f' : '#6aa04a');
        }
      }
      // 農路與水圳
      for (const v of xs) {
        ctx.fillStyle = '#ddd7c6';
        ctx.fillRect(v - 0.009, -E, 0.018, E * 2);
      }
      for (const v of ys) {
        ctx.fillStyle = '#ddd7c6';
        ctx.fillRect(-E, v - 0.009, E * 2, 0.018);
      }
      const cx0 = (w.canalX as number) + 0.016;
      ctx.fillStyle = '#c8c3b6';
      ctx.fillRect(cx0 - 0.008, -E, 0.016, E * 2);
      ctx.fillStyle = '#4a95c8';
      ctx.fillRect(cx0 - 0.005, -E, 0.01, E * 2);
      ctx.setLineDash([0.006, 0.016]);
      ctx.lineDashOffset = -t * 0.03;
      strokePl(ctx, [[cx0, -E], [cx0, E]], 0.0015, 'rgba(255,255,255,0.7)');
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
      // 三合院：紅瓦屋頂圍著曬穀場
      for (const [x, y, hw, hh, s] of w.houses as number[][]) {
        const r = rng(Math.floor(s * 4409));
        ctx.fillStyle = '#9cc27a';
        ctx.fillRect(x, y, hw, hh);
        const cx = x + hw / 2;
        const cy = y + hh / 2;
        const U = Math.min(hw, hh, 0.2) * 0.5;
        ctx.fillStyle = '#e6decb';
        ctx.fillRect(cx - U / 2, cy - U / 2, U, U);
        const roofTile = (rx: number, ry: number, rw: number, rh: number) => {
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.fillRect(rx + 0.006, ry + 0.006, rw, rh);
          const horiz = rw > rh;
          ctx.fillStyle = '#c4553a';
          ctx.fillRect(rx, ry, rw, rh);
          ctx.fillStyle = '#9e3f2a';
          if (horiz) ctx.fillRect(rx, ry + rh / 2, rw, rh / 2);
          else ctx.fillRect(rx + rw / 2, ry, rw / 2, rh);
          ctx.fillStyle = '#e8dcc8';
          if (horiz) ctx.fillRect(rx, ry + rh / 2 - 0.001, rw, 0.002);
          else ctx.fillRect(rx + rw / 2 - 0.001, ry, 0.002, rh);
        };
        const D = U * 0.26;
        roofTile(cx - U / 2, cy - U / 2, U, D);
        roofTile(cx - U / 2, cy - U / 2 + D, D, U - D);
        roofTile(cx + U / 2 - D, cy - U / 2 + D, D, U - D);
        // 竹林與樹
        for (let k = 0; k < 9; k++) {
          const a = r() * Math.PI * 2;
          tree(ctx, cx + Math.cos(a) * U * 0.78, cy + Math.sin(a) * U * 0.78, 0.01 + r() * 0.006, r() < 0.5 ? '#5f9c4b' : '#7aa84a');
        }
        // 曬穀場上的穀子
        ctx.fillStyle = '#e1b84a';
        ctx.fillRect(cx - U * 0.15, cy + U * 0.02, U * 0.3, U * 0.28);
      }
      // 耕耘機沿田畦前進，留下深色犁痕
      const plots = (w.fields as number[][]).filter(([x, y, fw, fh, type]) => type === 4 && Math.abs(x + fw / 2) < 0.3 && Math.abs(y + fh / 2) < 0.4);
      const pf = plots[0];
      if (pf) {
        const [x, y, fw, fh, , vert] = pf;
        const q = (t * 0.06) % 1;
        ctx.fillStyle = '#6e5235';
        if (vert) ctx.fillRect(x + 0.003, y + 0.003, fw - 0.006, (fh - 0.006) * q);
        else ctx.fillRect(x + 0.003, y + 0.003, (fw - 0.006) * q, fh - 0.006);
        const tx = vert ? x + fw / 2 : x + 0.003 + (fw - 0.006) * q;
        const ty = vert ? y + 0.003 + (fh - 0.006) * q : y + fh / 2;
        carTop(ctx, tx, ty, vert ? Math.PI / 2 : 0, 0.02, '#e2b33a');
      }
    }
    if (mode === 'coast' && city) {
      const sh = w.shore as Pt[];
      const sx = w.sx as (y: number) => number;
      ctx.save();
      ctx.beginPath();
      ctx.rect(-E, -E, E - 0.32, E * 2);
      ctx.clip();
      drawCity(ctx, city, E, tint);
      drawTraffic(ctx, city.veh, t, E, traffic);
      ctx.restore();
      // 濱海公路
      ctx.fillStyle = '#e3ded3';
      ctx.fillRect(-0.33, -E, 0.054, E * 2);
      ctx.fillStyle = '#5a5f67';
      ctx.fillRect(-0.326, -E, 0.046, E * 2);
      strokePl(ctx, [[-0.3052, -E], [-0.3052, E]], 0.0018, '#f2c94c');
      strokePl(ctx, [[-0.3008, -E], [-0.3008, E]], 0.0018, '#f2c94c');
      for (const [s0, d, col] of w.vcar as number[][]) {
        const s = (((s0 + t * 0.03 * d) % 1) + 1) % 1;
        carTop(ctx, d > 0 ? -0.314 : -0.292, -E + s * 2 * E, d > 0 ? Math.PI / 2 : -Math.PI / 2, 0.017, CAR_COLS[col]);
      }
      // 防風林 → 沙丘草 → 乾沙 → 濕沙 → 海
      ctx.fillStyle = '#7c9a55';
      ctx.fillRect(-0.276, -E, 0.13, E * 2);
      ctx.fillStyle = '#e9d9ae';
      ctx.fillRect(-0.15, -E, 0.6, E * 2);
      for (let k = 0; k < 30; k++) lump(ctx, -0.145 + (k % 3) * 0.01, -1 + k * 0.07, 0.016, 0.03, k, '#a8b86a', 0.4);
      const sea = (off: (y: number) => number, c: string) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        sh.forEach(([x, y], i) => (i ? ctx.lineTo(x + off(y), y) : ctx.moveTo(x + off(y), y)));
        ctx.lineTo(E, E);
        ctx.lineTo(E, -E);
        ctx.closePath();
        ctx.fill();
      };
      sea(() => -0.03, '#cdb98b');
      sea(() => 0, '#8fdbe3');
      sea((y) => 0.05 + 0.01 * Math.sin(5 * y), '#5fc3d9');
      sea((y) => 0.14 + 0.025 * Math.sin(3 * y + 1), '#3aa0cc');
      sea((y) => 0.3 + 0.04 * Math.sin(2 * y + 2), '#2a7fb8');
      for (const [px, py, pr, k] of w.pines as number[][]) pine(ctx, px, py, pr, k < 0.5 ? '#3f6b3a' : '#4d7a40');
      // 往海裡延伸的消波塊堤
      const ty0 = -0.38;
      const tx0 = sx(ty0) - 0.04;
      for (const [s, dy, rot] of w.tetra as number[][]) {
        const x = tx0 + s * 0.26;
        const y = ty0 + dy;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        for (const [dx2, dy2, c] of [[0.002, 0.002, 'rgba(0,0,0,0.3)'], [0, 0, '#c9c8c1']] as [number, number, string][]) {
          ctx.fillStyle = c;
          for (let a = 0; a < 3; a++) {
            const q = (a / 3) * Math.PI * 2;
            ctx.beginPath();
            ctx.ellipse(dx2 + Math.cos(q) * 0.005, dy2 + Math.sin(q) * 0.005, 0.006, 0.0035, q, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }
      // 浪花：三道斷續白線往岸上推
      for (let k = 0; k < 3; k++) {
        const q = (t * 0.12 + k / 3) % 1;
        const off = 0.08 * (1 - q);
        ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.6 * Math.sin(q * Math.PI)})`;
        ctx.lineWidth = 0.004 + q * 0.004;
        ctx.lineCap = 'round';
        ctx.beginPath();
        let on = false;
        sh.forEach(([x, y], i) => {
          const vis = hash(i, k) > 0.22;
          if (vis && on) ctx.lineTo(x + off, y);
          else if (vis) ctx.moveTo(x + off, y);
          on = vis;
        });
        ctx.stroke();
      }
      strokePl(ctx, sh.map(([x, y]) => [x + 0.004 * Math.sin(t * 1.5), y]), 0.003, 'rgba(255,255,255,0.85)');
      // 外海浪峰
      ctx.lineCap = 'round';
      for (const [x0, y, k] of w.crests as number[][]) {
        const x = sx(y) + x0 - ((t * 0.01 + k) % 0.1);
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 0.002;
        ctx.beginPath();
        ctx.moveTo(x, y - 0.018);
        ctx.quadraticCurveTo(x - 0.006, y, x, y + 0.018);
        ctx.stroke();
      }
      // 沙灘：陽傘、毛巾、遊客
      const um = ['#ff5a36', '#3b82f6', '#ffd23f', '#34c38f'];
      for (const [s, y, k, q] of w.umbrellas as number[][]) {
        const x = -0.12 + s * (sx(y) - 0.04 + 0.12);
        ctx.fillStyle = ['#f472b6', '#60a5fa', '#fbbf24', '#ffffff'][(k + 1) % 4];
        ctx.fillRect(x + 0.012, y - 0.004, 0.012, 0.022);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.arc(x + 0.006, y + 0.008, 0.02, 0, Math.PI * 2);
        ctx.fill();
        for (let j = 0; j < 8; j++) {
          ctx.fillStyle = j % 2 ? '#ffffff' : um[k];
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.arc(x, y, 0.02, (j / 8) * Math.PI * 2, ((j + 1) / 8) * Math.PI * 2);
          ctx.fill();
        }
        blob(ctx, x, y, 0.003, '#ffffff');
        if (q < 0.6) blob(ctx, x - 0.022, y + 0.012, 0.0035, ['#8d5524', '#f1c27d', '#c68642'][Math.floor(q * 5) % 3]);
      }
      for (const [x0, y0, ph, sail] of w.boats as number[][]) {
        const x = sx(y0) + x0;
        const y = y0 - ((t * 0.01 + ph) % 0.2);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 0.0025;
        ctx.beginPath();
        ctx.moveTo(-0.02, 0);
        ctx.lineTo(-0.075, -0.02);
        ctx.moveTo(-0.02, 0);
        ctx.lineTo(-0.075, 0.02);
        ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(-0.018, -0.005, 0.045, 0.016);
        ctx.fillStyle = sail ? '#ffffff' : '#f2f2f2';
        ctx.beginPath();
        ctx.moveTo(0.03, 0);
        ctx.lineTo(0.012, -0.009);
        ctx.lineTo(-0.022, -0.009);
        ctx.lineTo(-0.022, 0.009);
        ctx.lineTo(0.012, 0.009);
        ctx.closePath();
        ctx.fill();
        if (sail) {
          ctx.fillStyle = '#f4f4f2';
          ctx.beginPath();
          ctx.moveTo(0.004, 0);
          ctx.lineTo(-0.02, 0.026);
          ctx.lineTo(-0.02, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = '#2f6db5';
          ctx.fillRect(-0.012, -0.006, 0.014, 0.012);
        }
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

  /* ───────── 海底世界 ───────── */
  const seaPaths = new Map<string, Path2D>();
  const seaPath = (ctx: CanvasRenderingContext2D, d: string, color: string) => {
    let path = seaPaths.get(d);
    if (!path) { path = new Path2D(d); seaPaths.set(d, path); }
    ctx.fillStyle = color; ctx.fill(path);
  };
  const seaOval = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string) => {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  };
  /** 比例座標的側面動物，尾部獨立擺動；不依賴外部圖片。 */
  const seaAnimal = (ctx: CanvasRenderingContext2D, kind: string, phase: number, c: string, light: string, variant = 0) => {
    const whale = kind === 'whale', dolphin = kind === 'dolphins';
    const tail = Math.sin(phase) * (whale ? 0.1 : 0.2);
    ctx.save(); ctx.translate(-0.76, 0); ctx.rotate(tail);
    seaPath(ctx, whale || dolphin
      ? 'M .12 0 Q -.12 -.04 -.4 -.35 Q -.42 -.08 -.2 .02 Q -.42 .12 -.4 .3 Q -.1 .11 .12 .05 Z'
      : 'M .16 0 L -.42 -.32 Q -.3 0 -.42 .32 Z', mix(c, '#061d2d', 0.25));
    ctx.restore();
    if (whale) {
      seaPath(ctx, 'M -.9 .01 Q -.45 -.35 .43 -.32 Q 1.02 -.3 1.06 -.04 Q 1.08 .23 .5 .31 Q -.16 .4 -.9 .01 Z', c);
      seaPath(ctx, 'M -.75 .07 Q .05 .3 .97 .06 Q .89 .25 .5 .31 Q -.16 .4 -.75 .07 Z', light);
      seaPath(ctx, 'M -.5 -.19 Q -.37 -.37 -.23 -.44 L -.12 -.27 Z', mix(c, '#061d2d', 0.2));
      ctx.save(); ctx.translate(0.32, 0.14); ctx.rotate(Math.sin(phase * 0.7) * 0.13);
      seaPath(ctx, 'M -.08 -.04 Q -.3 .28 -.53 .47 Q -.15 .51 .22 .05 Z', mix(c, '#061d2d', 0.32)); ctx.restore();
      ctx.strokeStyle = mix(c, light, 0.4); ctx.lineWidth = 0.009;
      for (let j = 0; j < 5; j++) {
        ctx.beginPath(); ctx.moveTo(0.25 + j * 0.11, 0.16); ctx.quadraticCurveTo(0.3 + j * 0.1, 0.26, 0.11 + j * 0.1, 0.3); ctx.stroke();
      }
      seaOval(ctx, 0.8, -0.015, 0.024, 0.023, '#092532');
      seaOval(ctx, 0.805, -0.02, 0.007, 0.007, '#f0f3df');
      ctx.strokeStyle = mix(c, '#061d2d', 0.5); ctx.lineWidth = 0.012;
      ctx.beginPath(); ctx.moveTo(0.86, 0.12); ctx.quadraticCurveTo(1, 0.1, 1.03, 0.06); ctx.stroke();
      seaOval(ctx, 0.58, -0.26, 0.04, 0.012, mix(c, '#061d2d', 0.4));
    } else if (dolphin) {
      seaPath(ctx, 'M -.86 0 Q -.2 -.42 .48 -.21 Q .7 -.15 .74 -.04 L 1 -.015 L .97 .055 L .67 .09 Q .3 .4 -.28 .12 Z', c);
      seaPath(ctx, 'M -.7 .03 Q .02 .18 .74 .045 L .67 .09 Q .3 .4 -.28 .12 Z', light);
      seaPath(ctx, 'M -.18 -.23 Q -.12 -.54 .13 -.53 Q .04 -.3 .25 -.25 Z', mix(c, '#061d2d', 0.2));
      ctx.save(); ctx.rotate(Math.sin(phase) * 0.1);
      seaPath(ctx, 'M .24 .12 Q .12 .4 -.12 .43 L .02 .12 Z', mix(c, '#061d2d', 0.25)); ctx.restore();
      seaOval(ctx, 0.61, -0.06, 0.02, 0.021, '#092532');
      seaOval(ctx, 0.614, -0.066, 0.006, 0.006, '#ffffff');
    } else {
      const body = 'M -.86 0 Q -.32 -.48 .45 -.28 Q .75 -.21 .92 0 Q .75 .21 .45 .28 Q -.32 .48 -.86 0 Z';
      seaPath(ctx, body, c);
      seaPath(ctx, 'M -.35 -.28 L -.08 -.55 L .2 -.31 Z', light);
      seaPath(ctx, 'M -.1 .28 L .22 .43 L .35 .28 Z', mix(c, '#061d2d', 0.2));
      ctx.save(); ctx.clip(seaPaths.get(body)!);
      if (variant % 3 === 0) {
        ctx.fillStyle = light;
        for (let j = 0; j < 3; j++) { ctx.save(); ctx.translate(-0.4 + j * 0.35, 0); ctx.rotate(-0.25); ctx.fillRect(-0.045, -0.5, 0.09, 1); ctx.restore(); }
      } else seaPath(ctx, 'M -.8 .04 Q .1 .25 .9 .02 L .6 .4 L -.3 .45 Z', light);
      ctx.restore();
      ctx.save(); ctx.translate(0.12, 0.06); ctx.rotate(tail);
      seaPath(ctx, 'M 0 0 Q -.2 -.05 -.26 .15 L .13 .08 Z', mix(c, '#061d2d', 0.18)); ctx.restore();
      seaOval(ctx, 0.59, -0.055, 0.07, 0.075, '#f4f2d9');
      seaOval(ctx, 0.61, -0.05, 0.036, 0.045, '#082b37');
    }
  };
  const seaCoral = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, variant: number, t: number, current: number) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(size, size);
    ctx.rotate(Math.sin(t * 0.8 + variant) * 0.035 * current);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (variant % 3 === 0) {
      ctx.strokeStyle = color; ctx.lineWidth = 0.045;
      for (let j = -4; j <= 4; j++) {
        const ex = j * 0.16, ey = -0.9 + Math.abs(j) * 0.065;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(ex * 0.2, -0.4, ex, ey); ctx.stroke();
        for (let k = 1; k <= 3; k++) {
          ctx.beginPath(); ctx.moveTo(ex * k / 4, ey * k / 4); ctx.lineTo(ex * k / 4 + 0.16, ey * k / 4 - 0.18); ctx.stroke();
        }
        seaOval(ctx, ex, ey, 0.035, 0.035, mix(color, '#fff1ca', 0.5));
      }
    } else if (variant % 3 === 1) {
      const branch = (x0: number, y0: number, len: number, angle: number, level: number) => {
        const x1 = x0 + Math.sin(angle) * len, y1 = y0 - Math.cos(angle) * len;
        ctx.strokeStyle = color; ctx.lineWidth = 0.025 + level * 0.025;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0, y1, x1, y1); ctx.stroke();
        if (level > 0) { branch(x1, y1, len * 0.66, angle - 0.57, level - 1); branch(x1, y1, len * 0.68, angle + 0.61, level - 1); }
        else seaOval(ctx, x1, y1, 0.05, 0.05, mix(color, '#fff1ca', 0.45));
      };
      branch(0, 0, 0.4, 0, 3);
    } else for (let j = -2; j <= 2; j++) {
      ctx.save(); ctx.translate(j * 0.12, 0); ctx.rotate(j * 0.2 + Math.sin(t + j) * 0.08 * current);
      seaPath(ctx, 'M -.06 0 Q -.25 -.42 0 -.95 Q .18 -.55 .06 0 Z', j % 2 ? color : mix(color, '#b9ead7', 0.25)); ctx.restore();
    }
    ctx.restore();
  };
  const drawOcean = (ctx: CanvasRenderingContext2D, W: number, H: number, P: Record<string, number | string>, time: number, duration: number, background: string) => {
    const g = (k: string, d: number) => num(P[k], d);
    const mode = String(P.mode ?? 'fish'), S = Math.min(W, H);
    const t = Math.max(0, time) * g('speed', 1), progress = (t / duration) % 1;
    const depth = g('depth', 0.55), current = g('current', 0.6), scene = g('scene', 1) > 0;
    const c = String(P.color ?? '#65d9ce'), c2 = String(P.color2 ?? '#ffc86a');
    const X = W * g('x', 0.5), Y = H * g('y', 0.46), scale = g('size', 0.7);
    const dir = P.direction === 'left' ? -1 : 1, seed = g('seed', 7);
    const list = stars(100, seed + 80);
    // 透明輸出不繪製整片水色，場景與單獨主角皆保留 alpha。
    if ((scene || mode === 'deep') && background === '#07394b') {
      ctx.fillStyle = mix('#0c7181', '#020e24', depth + (mode === 'deep' ? progress * 0.04 : 0)); ctx.fillRect(0, 0, W, H);
      for (let j = 0; j < 5; j++) {
        ctx.fillStyle = `rgba(127,228,216,${(1 - depth) * 0.055})`;
        const xx = (j * 0.33 - 0.3 + Math.sin(t * 0.12 + j) * 0.025) * W;
        ctx.beginPath(); ctx.moveTo(xx, 0); ctx.lineTo(xx + W * 0.11, 0); ctx.lineTo(xx + W * 0.7, H); ctx.lineTo(xx + W * 0.28, H); ctx.fill();
      }
      ctx.strokeStyle = `rgba(164,240,221,${(1 - depth) * 0.14})`; ctx.lineWidth = S * 0.002;
      for (let j = 0; j < 10; j++) {
        const xx = ((j * 0.197 + t * 0.012) % 1.3 - 0.15) * W;
        ctx.beginPath(); ctx.ellipse(xx, H * (0.06 + j % 3 * 0.045), S * 0.13, S * 0.025, -0.2, 0.1, 2.5); ctx.stroke();
      }
    }
    if (mode === 'deep') {
      for (let layer = 0; layer < 3; layer++) {
        const tile = H * 0.18, scroll = t * S * (0.018 + layer * 0.014), start = Math.floor(scroll / tile);
        ctx.fillStyle = mix('#123e50', '#020e24', layer * 0.23);
        for (let side = 0; side < 2; side++) {
          ctx.beginPath(); ctx.moveTo(side ? W : 0, -H);
          for (let j = start - 2; j <= start + 12; j++) {
            const r = rng(seed + layer * 21 + j * 89 + side * 131);
            const yy = j * tile - scroll;
            const inset = S * (0.07 + layer * 0.035 + r() * 0.1);
            ctx.lineTo(side ? W - inset : inset, yy);
          }
          ctx.lineTo(side ? W : 0, H * 2); ctx.closePath(); ctx.fill();
        }
      }
      ctx.save(); ctx.translate(W * (0.5 + Math.sin(t * 0.1) * 0.18), H * 0.38 - t * S * 0.008);
      ctx.scale(S * 0.22, S * 0.22); ctx.globalAlpha = 0.23;
      seaAnimal(ctx, 'whale', t, '#6896a5', '#6896a5'); ctx.restore();
    }
    const reef = (front: boolean) => {
      if ((!scene && mode !== 'coral') || mode === 'deep') return;
      const count = mode === 'coral' ? Math.round(g('count', 28)) : 13;
      const colors = mode === 'coral' ? [c, c2, '#69b7a5'] : ['#e48282', '#dbb878', '#419d91'];
      if (!front && scene) {
        ctx.fillStyle = mix('#336e75', '#081d30', depth * 0.8);
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let j = 0; j <= 20; j++) ctx.lineTo(W * j / 20, H * 0.91 + Math.sin(j * 0.8) * S * 0.025);
        ctx.lineTo(W, H); ctx.fill();
      }
      for (let j = 0; j < count; j++) {
        const [a, b, z, ph] = list[j];
        if ((j % 3 === 0) !== front) continue;
        const sz = S * (mode === 'coral' ? (front ? 0.32 + z * 0.23 : 0.18 + z * 0.18) * scale / 0.7 : front ? 0.17 + z * 0.13 : 0.07 + z * 0.09);
        const xx = a * W + (mode === 'coral' ? X - W * 0.5 : 0);
        const yy = H * (front ? 1.025 : mode === 'coral' ? 0.9 : 0.95) + b * S * 0.025 + (mode === 'coral' ? Y - H * 0.46 : 0);
        seaCoral(ctx, xx, yy, sz, front ? colors[j % 3] : mix(colors[j % 3], '#123d49', 0.42 + depth * 0.15), j, t + ph, current);
      }
    };
    reef(false);
    if (g('bubbles', 1)) for (let j = 0; j < 48; j++) {
      const [a, b, z, ph] = list[j];
      const xx = ((a + Math.sin(t * 0.3 + ph) * 0.018 * current + 1) % 1) * W;
      const yy = ((b - t * (mode === 'deep' ? 0.035 : 0.012) * (0.4 + z) % 1 + 1) % 1) * H;
      ctx.strokeStyle = `rgba(179,235,226,${0.16 + z * 0.22})`; ctx.lineWidth = S * 0.0012;
      ctx.beginPath(); ctx.arc(xx, yy, S * (0.001 + z * (j % 5 ? 0.001 : 0.006)), 0, Math.PI * 2); ctx.stroke();
    }
    if (mode === 'fish' || mode === 'dolphins') {
      const dolphin = mode === 'dolphins', n = Math.round(g('count', dolphin ? 6 : 28));
      const order = Array.from({ length: n }, (_, j) => j).sort((a, b) => list[a][2] - list[b][2]);
      order.forEach((j) => {
        const [a, b, z, ph] = list[j];
        const travel = ((a * 1.3 + t * (0.035 + z * 0.022)) % 1.3) - 0.15;
        let px = X + dir * (travel - 0.5) * W;
        let py = Y + (b - 0.5) * H * (dolphin ? 0.39 : 0.48);
        let angle = Math.cos(t + ph) * 0.035;
        if (P.route === 'orbit') {
          const theta = a * Math.PI * 2 + t * 0.3 * dir;
          px = X + Math.cos(theta) * W * (0.12 + b * 0.25);
          py = Y + Math.sin(theta) * H * 0.18;
          angle = Math.atan2(dir * Math.cos(theta) * H * 0.18, -dir * Math.sin(theta) * W * (0.12 + b * 0.25));
        } else if (P.route !== 'straight') {
          py += Math.sin(travel * Math.PI * 2 + ph * 0.3) * S * 0.07;
          angle += Math.cos(travel * Math.PI * 2 + ph * 0.3) * 0.12;
        }
        const radius = S * scale * (dolphin ? 0.12 + z * 0.07 : 0.032 + z * 0.035);
        ctx.save(); ctx.translate(px, py); ctx.rotate(angle); ctx.scale(P.route === 'orbit' ? radius : radius * dir, radius);
        if (dolphin) ctx.scale(1, 0.84 + Math.sin(t * 0.75 + ph) * 0.16);
        seaAnimal(ctx, mode, t * (dolphin ? 4 : 7) + ph, mix(j % 4 === 0 && !dolphin ? c2 : c, '#123949', (1 - z) * 0.38), dolphin ? c2 : mix(c2, '#f4e7b4', z * 0.2), j);
        ctx.restore();
      });
    }
    if (mode === 'whale') {
      const distance = 0.36 + Math.sin(Math.PI * clamp(progress * 1.06)) * 1.08;
      const radius = S * scale * distance * 0.68;
      const px = X + dir * (progress - 0.5) * (W + radius * 1.6);
      ctx.save(); ctx.translate(px, Y + Math.sin(t * 0.6) * S * 0.025); ctx.rotate(Math.sin(t * 0.4) * 0.035); ctx.scale(radius * dir, radius);
      seaAnimal(ctx, 'whale', t * 1.8, c, c2); ctx.restore();
    }
    if (mode === 'shark') {
      const q = clamp((progress - g('strike', 0.48)) / (1 - g('strike', 0.48))), approach = q * q * q;
      const cover = P.exit === 'cover', radius = S * scale * (0.09 + (cover ? 5 : 2.5) * approach);
      const drift = Math.sin(t * 1.3) * S * 0.11 * (1 - approach);
      const px = X + drift + (cover ? 0 : dir * W * 2.6 * Math.pow(clamp((q - 0.68) / 0.32), 2));
      const shake = g('shake', 0.3) * approach * S * 0.007;
      ctx.save(); ctx.translate(px + Math.sin(t * 73) * shake, Y + Math.cos(t * 61) * shake);
      ctx.rotate(Math.sin(t * 1.3) * 0.08 * (1 - approach)); ctx.scale(radius, radius);
      seaPath(ctx, 'M -.15 -.5 L 0 -1.1 L .2 -.48 Z', mix(c, '#082635', 0.3));
      seaPath(ctx, 'M -.34 -.03 Q -.85 .1 -1.25 .62 L -.37 .34 Z M .34 -.03 Q .85 .1 1.25 .62 L .37 .34 Z', mix(c, '#082635', 0.2));
      seaPath(ctx, 'M 0 -.65 Q -.58 -.47 -.53 .2 Q -.4 .74 0 .8 Q .4 .74 .53 .2 Q .58 -.47 0 -.65 Z', c);
      seaPath(ctx, 'M 0 -.19 Q -.37 .03 -.4 .4 Q -.26 .79 0 .8 Q .26 .79 .4 .4 Q .37 .03 0 -.19 Z', c2);
      seaPath(ctx, 'M -.43 -.04 L -.19 .04 L -.29 .1 L -.44 .04 Z M .43 -.04 L .19 .04 L .29 .1 L .44 .04 Z', '#092331');
      seaOval(ctx, -0.31, 0.04, 0.025, 0.022, '#f6dfa4'); seaOval(ctx, 0.31, 0.04, 0.025, 0.022, '#f6dfa4');
      seaOval(ctx, -0.3, 0.04, 0.012, 0.018, '#071b26'); seaOval(ctx, 0.3, 0.04, 0.012, 0.018, '#071b26');
      const open = g('mouth', 1) ? 0.08 + ease(q * 2) * 0.24 : 0.012;
      ctx.save(); ctx.translate(0, 0.4); ctx.scale(1, open);
      ctx.beginPath(); ctx.ellipse(0, 0, 0.3, 1, 0, 0, Math.PI * 2); ctx.fillStyle = '#122230'; ctx.fill(); ctx.clip();
      seaOval(ctx, 0, 0.75, 0.19, 0.28, '#b56c70');
      for (let j = -4; j <= 4; j++) {
        const xx = j * 0.062, yy = Math.sqrt(Math.max(0, 1 - (xx / 0.3) ** 2));
        ctx.fillStyle = '#fff5db'; ctx.beginPath(); ctx.moveTo(xx - 0.029, -yy); ctx.lineTo(xx + 0.029, -yy); ctx.lineTo(xx, -yy + 0.52); ctx.fill();
        ctx.beginPath(); ctx.moveTo(xx - 0.026, yy); ctx.lineTo(xx + 0.026, yy); ctx.lineTo(xx, yy - 0.42); ctx.fill();
      }
      ctx.restore(); ctx.strokeStyle = mix(c, '#092331', 0.5); ctx.lineWidth = 0.016;
      for (let j = 0; j < 3; j++) for (const side of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(side * (0.43 - j * 0.025), 0.15 + j * 0.06); ctx.lineTo(side * (0.47 - j * 0.015), 0.22 + j * 0.06); ctx.stroke();
      }
      ctx.restore();
    }
    if (mode === 'submarine') {
      const radius = S * scale * 0.52, px = X + Math.sin(t * 0.45) * W * 0.1, py = Y + Math.sin(t * 0.9) * S * 0.025;
      ctx.save(); ctx.translate(px, py); ctx.scale(radius * dir, radius);
      if (g('beam', 1)) {
        ctx.save(); ctx.translate(0.76, 0.12); ctx.rotate(Math.sin(t * 0.65) * 0.2);
        seaPath(ctx, 'M 0 -.04 L 3.6 -1.1 L 3.6 1.1 L 0 .04 Z', 'rgba(246,235,173,0.09)');
        seaPath(ctx, 'M 0 -.025 L 3.3 -.54 L 3.3 .54 L 0 .025 Z', 'rgba(246,235,173,0.1)'); ctx.restore();
      }
      ctx.strokeStyle = mix(c, '#253949', 0.5); ctx.lineWidth = 0.055; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-0.06, -0.3); ctx.lineTo(-0.06, -0.63); ctx.lineTo(0.15, -0.63); ctx.stroke();
      seaPath(ctx, 'M -.93 -.08 L -1.12 -.32 L -1.16 .32 L -.93 .1 Z', mix(c, '#132d3d', 0.28));
      ctx.save(); ctx.translate(-1.11, 0); ctx.scale(1, 0.25 + Math.abs(Math.sin(t * 19)) * 0.75);
      seaOval(ctx, 0, 0, 0.035, 0.38, c2); ctx.restore();
      seaPath(ctx, 'M -.36 -.23 L -.36 -.45 Q -.08 -.59 .18 -.4 L .21 -.23 Z', c);
      seaPath(ctx, 'M -.64 -.28 L .51 -.28 Q 1.03 -.28 1.03 0 Q 1.03 .32 .51 .32 L -.64 .32 Q -1 .32 -1 0 Q -1 -.28 -.64 -.28 Z', c);
      seaPath(ctx, 'M -1 .04 Q -.5 .26 1 .04 Q 1 .32 .51 .32 L -.64 .32 Q -.99 .3 -1 .04 Z', mix(c, '#7b562b', 0.3));
      ctx.strokeStyle = c2; ctx.lineWidth = 0.014; ctx.beginPath(); ctx.moveTo(-0.66, -0.2); ctx.lineTo(0.53, -0.2); ctx.stroke();
      for (let j = 0; j < 3; j++) {
        const xx = -0.48 + j * 0.45;
        seaOval(ctx, xx, 0, 0.15, 0.15, mix(c, '#263e46', 0.6)); seaOval(ctx, xx, 0, 0.115, 0.115, '#155969');
        ctx.save(); ctx.translate(xx, 0); seaPath(ctx, 'M -.08 -.035 L .035 -.09 L .08 -.045 L -.065 .025 Z', '#6fd3d4'); ctx.restore();
        for (let k = 0; k < 4; k++) seaOval(ctx, xx + Math.cos(k * Math.PI / 2) * 0.134, Math.sin(k * Math.PI / 2) * 0.134, 0.009, 0.009, c2);
      }
      seaOval(ctx, 0.89, 0.13, 0.07, 0.047, c2);
      if (g('bubbles', 1)) for (let j = 0; j < 8; j++) {
        const q = (t * 0.6 + j / 8) % 1;
        ctx.strokeStyle = `rgba(188,235,226,${0.65 * (1 - q)})`; ctx.lineWidth = 0.009;
        ctx.beginPath(); ctx.arc(-1.2 - q * 1.2, -q * 0.3 + Math.sin(j + t) * 0.04, 0.02 + q * 0.045, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
    reef(true);
    return { cx: X, cy: Y, r: S * scale * (mode === 'whale' ? 0.4 : 0.23) };
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
      sc.module === 'ocean'
        ? drawOcean(ctx, W, H, P, t, Math.max(2, sc.loop || 8), sc.bg)
        : sc.module === 'cube'
        ? drawCube(ctx, W, H, P, t, u)
        : sc.module === 'cosmos'
          ? drawCosmos(ctx, W, H, P, t, u, sc.loop)
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
