// 物件特效：隕石、方塊、宇宙、俯瞰、交通工具與海底世界。全部硬邊，可透明疊進影片。
// objRenderer 內部必須自給自足，匯出 HTML 時以 toString() 內嵌。
import type { PField } from './photokit';
import { PROP_BG, PROP_DEFAULTS, PROP_INFO, PROP_PARAMS, type PropModule } from './propkit';

export type OModule = 'meteor' | 'cube' | 'cosmos' | 'aerial' | 'vehicle' | 'ocean' | PropModule;

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
  /** 非精修宇宙合併卡的獨立編輯範圍；舊場景不帶此欄位仍可用。 */
  cosmosGroup?: 'orbit' | 'flyover' | 'earthzoom';
}

export const OBJECT_COSMOS_GROUPS = {
  orbit: { id: 'obj-cosmos-planet', zh: '天體切換', desc: '行星光環、太陽、月球、地球；非精修版，四種天體共用一個編輯器。', preset: { mode: 'planet', planet: '#e8a35c', color2: '#f2d6a2', y: 0.36, size: 0.34, layout: 'below' } },
  flyover: { id: 'obj-cosmos-flyby-earth', zh: '星球飛越', desc: '地球、月球、火星、太陽；非精修版，四種地表共用一個編輯器。', preset: { mode: 'flyby', surface: 'earth' } },
  earthzoom: { id: 'obj-cosmos-zoom-earth', zh: '推近地球', desc: '非精修版的獨立地球運鏡編輯器，可調推近、拉遠與倍率。', preset: { mode: 'earth', y: 0.42, size: 0.3, cam: 'in', camz: 3, layout: 'over' } },
} as const;

export const OBJ_INFO: Record<OModule, { zh: string; en: string; desc: string }> = {
  meteor: { zh: '隕石', en: 'Meteor', desc: '漂浮或墜落的隕石，形狀可隨機、對稱、圓潤或碎片，材質有岩石、冰晶、熔岩、金屬' },
  cube: { zh: '魔術方塊', en: 'Rubik Cube', desc: '立體魔術方塊緩慢旋轉並轉動層，材質有塑膠、金屬、花色、單色' },
  cosmos: { zh: '星空宇宙', en: 'Cosmos', desc: '閃爍星空、光速穿越、旋轉星系、行星光環、太陽、月球、地球、低空飛越星球表面，可推近拉遠、加流星' },
  aerial: { zh: '俯瞰', en: 'Aerial View', desc: '從正上方往下看的城市、河流、山川、草原牛馬、農田、海岸、森林、交流道，鏡頭緩慢平移推近' },
  ocean: { zh: '海洋世界', en: 'Underwater', desc: '魚群、海豚、巨鯨、迎面鯊魚、珊瑚、深海下潛、潛水艇，可去背或搭配海底場景' },
  vehicle: { zh: '天空物件', en: 'Vehicles', desc: '飛機、太空船、汽車、馬車、火車、輪船、熱氣球，側面行進、背景捲動' },
  ...PROP_INFO,
};
export const OBJ_MODULES = Object.keys(OBJ_INFO) as OModule[];

export const OBJ_DEFAULTS: Record<OModule, Record<string, number | string>> = {
  meteor: { shape: 'random', material: 'rock', sym: 6, seed: 7, size: 0.42, x: 0.5, y: 0.42, rough: 0.45, craters: 6, color: '#8a7f72', color2: '#4a423a', spin: 10, float: 1, debris: 4, trail: 0, angle: -35, rimW: 0, rim: '#ffffff' },
  cube: { n: 3, material: 'plastic', pattern: 'stripe', scheme: 'classic', mono: '#ff5a36', body: '#151515', size: 0.36, x: 0.5, y: 0.42, tilt: -28, turn: 35, spin: 14, twist: 1, speed: 1 },
  cosmos: { mode: 'stars', cam: 'none', camz: 3, surface: 'earth', alt: 0.45, density: 1, speed: 1, color: '#ffffff', color2: '#8ab4ff', planet: '#e8a35c', ring: 1, shoot: 1, x: 0.5, y: 0.42, size: 0.32 },
  aerial: { mode: 'city', seed: 3, pan: 1, dir: -30, zoom: 1.25, rot: 0, traffic: 1, herd: 18, x: 0.5, y: 0.45 },
  ocean: { mode: 'fish', count: 28, size: 0.7, speed: 1, direction: 'right', route: 'wave', current: 0.6, depth: 0.55, scene: 1, bubbles: 1, seed: 7, color: '#65d9ce', color2: '#ffc86a', x: 0.5, y: 0.46, strike: 0.48, mouth: 1, exit: 'pass', shake: 0.3, beam: 1 },
  vehicle: { mode: 'car', color: '#ff5a36', color2: '#ffffff', size: 0.5, speed: 1, scene: 1, x: 0.5, y: 0.45 },
  ...PROP_DEFAULTS,
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
const BG: Record<OModule, string> = { meteor: '#0b0d14', cube: '#151515', cosmos: '#05070d', aerial: '#cfc9bd', vehicle: '#bfe3f7', ocean: '#07394b', ...PROP_BG };
/** 背景第一個顏色是不是淺色（決定預設文字用深色或白色） */
const lightBg = (bg: string) => {
  const m = /#([0-9a-f]{6})/i.exec(bg);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 150;
};
const isProp = (m: OModule) => m in PROP_INFO;

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
  ...PROP_PARAMS,
};

export const objFxPrefix = 'obj-';
/** 放進 Combo 時用的特效代碼（場景 JSON 會覆蓋卡片預設，所以每個模組用第一張卡即可） */
export const objFxId = (m: OModule): string => ({ meteor: 'obj-meteor-rock', cube: 'obj-cube-plastic', cosmos: 'obj-cosmos-stars', aerial: 'obj-aerial-city', vehicle: 'obj-vehicle-car', ocean: 'obj-ocean-fish' } as Record<string, string>)[m] ?? `obj-${m}-${String(OBJ_DEFAULTS[m]?.mode ?? 'main')}`;
export const isObjFx = (id: string) => id.startsWith(objFxPrefix);
export const objFxModule = (id: string): OModule => (OBJ_MODULES.find((m) => id.startsWith(`${objFxPrefix}${m}`)) ?? 'meteor');
export const objSceneFxId = (scene: OScene): string => scene.module === 'cosmos' && scene.cosmosGroup ? OBJECT_COSMOS_GROUPS[scene.cosmosGroup].id : objFxId(scene.module);

/** 合併卡只顯示本招適用的控制，不影響舊版通用宇宙場景。 */
export const objFields = (scene: OScene): PField[] => {
  if (scene.module !== 'cosmos' || !scene.cosmosGroup) return OBJ_PARAMS[scene.module];
  const group = scene.cosmosGroup;
  return OBJ_PARAMS.cosmos.flatMap((field): PField[] => {
    if (field.k === 'mode') return group === 'orbit' && field.type === 'seg' ? [{ ...field, label: '天體', opts: field.opts.filter(([v]) => ['planet', 'sun', 'moon', 'earth'].includes(v)) }] : [];
    if (['surface', 'alt'].includes(field.k) && group !== 'flyover') return [];
    if (['cam', 'camz', 'size'].includes(field.k) && group === 'flyover') return [];
    if (['planet', 'ring'].includes(field.k) && (group !== 'orbit' || scene.params.mode !== 'planet')) return [];
    if (field.k === 'cam' && group === 'earthzoom' && field.type === 'seg') return [{ ...field, opts: field.opts.filter(([v]) => v !== 'none') }];
    return [field];
  });
};

export const defaultObjScene = (module: OModule = 'meteor'): OScene => ({
  ratio: '9:16',
  loop: module === 'ocean' ? 8 : 6,
  module,
  bg: BG[module],
  params: { ...OBJ_DEFAULTS[module] },
  text: isProp(module) ? { lines: [], layout: 'below', color: lightBg(BG[module]) ? '#1d2433' : '#ffffff', size: 1, stroke: '#111111', strokeW: 0, delay: 0.6 } : { lines: [], layout: module === 'ocean' ? 'none' : module === 'cosmos' || module === 'aerial' ? 'over' : 'below', color: module === 'vehicle' ? '#1d2433' : '#ffffff', size: 1, stroke: module === 'vehicle' ? '#ffffff' : '#111111', strokeW: module === 'aerial' ? 14 : module === 'vehicle' ? 10 : 0, delay: 0.6 },
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
  const cosmosGroup = module === 'cosmos' && (['orbit', 'flyover', 'earthzoom'] as const).includes(raw.cosmosGroup!) ? raw.cosmosGroup : undefined;
  if (cosmosGroup === 'orbit' && !['planet', 'sun', 'moon', 'earth'].includes(String(params.mode))) params.mode = 'planet';
  if (cosmosGroup === 'flyover') params.mode = 'flyby';
  if (cosmosGroup === 'earthzoom') { params.mode = 'earth'; if (params.cam === 'none') params.cam = 'in'; }
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
  return { ratio, loop, module, bg, params, text, ...(cosmosGroup ? { cosmosGroup } : {}), ...(typeof raw.font === 'string' && /^[a-z]{2,12}$/.test(raw.font) ? { font: raw.font } : {}) };
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
  if (typeof preset.tcolor === 'string') sc.text.color = preset.tcolor;
  sc.text.lines = w.filter((x) => x && !x.startsWith('{')).slice(0, 4);
  return sc;
};

/** 卡片、Combo 與預設共用合併卡的預設，避免空 words 回到閃爍星空。 */
export const objSceneForEffect = (words: string[], effect: string): OScene => {
  const group = (Object.keys(OBJECT_COSMOS_GROUPS) as (keyof typeof OBJECT_COSMOS_GROUPS)[]).find(k => OBJECT_COSMOS_GROUPS[k].id === effect);
  const scene = objSceneFromWords(words, objFxModule(effect), group ? OBJECT_COSMOS_GROUPS[group].preset : {});
  if (group && scene.module === 'cosmos' && !scene.cosmosGroup) scene.cosmosGroup = group;
  return normalizeObjScene(scene, scene.module);
};
