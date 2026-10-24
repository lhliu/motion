// 圖片運鏡模組：照片／圖片的固定動畫，參數化、可存成預設。全部硬邊，不使用模糊與陰影。
// photoRenderer 內部必須自給自足，匯出 HTML 時以 toString() 內嵌。

export type PModule =
  | 'kenburns'
  | 'swing'
  | 'tilt'
  | 'window'
  | 'parallax'
  | 'phone'
  | 'compare'
  | 'flip'
  | 'stack'
  | 'grid'
  | 'split'
  | 'magnify'
  | 'freeze'
  | 'mask'
  | 'zoomthru'
  | 'slices'
  | 'tiles'
  | 'tear'
  | 'collage'
  | 'morph'
  | 'occlude';

/** 模組分組：單張運鏡、多張組合、標註轉場、裁切與遮罩（對應圖鑑分類） */
export type PGroup = 'photo' | 'pmulti' | 'pmark' | 'pcut';
export const PHOTO_GROUPS: Record<PGroup, string> = { photo: '單張運鏡', pmulti: '多張組合', pmark: '標註轉場', pcut: '裁切與遮罩' };

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
  /** 字型組合代碼，省略＝跟著 Combo 或預設 */
  font?: string;
}

export interface ModuleInfo {
  zh: string;
  en: string;
  desc: string;
  group: PGroup;
  /** 圖片插槽名稱；names.length 即插槽數 */
  names: string[];
  /** 可留空的插槽（不畫示意圖） */
  optional?: number[];
}
const N = (n: number) => Array.from({ length: n }, (_, i) => `圖片 ${i + 1}`);
export const MODULE_INFO: Record<PModule, ModuleInfo> = {
  kenburns: { zh: '推拉運鏡', en: 'Ken Burns', desc: '從起始畫面慢慢推近或拉遠、平移到結束畫面', group: 'photo', names: ['照片'] },
  swing: { zh: '旋轉甩入', en: 'Swing In', desc: '照片帶白框旋轉甩進畫面，停在微斜角度', group: 'photo', names: ['照片'] },
  tilt: { zh: '3D 傾斜卡片', en: '3D Tilt Card', desc: '照片變成有厚度的卡片，以透視角度轉入並輕微擺動', group: 'photo', names: ['照片'] },
  window: { zh: '圓角視窗彈出', en: 'Window Pop', desc: '照片裝進圓角視窗，從一個點彈出放大', group: 'photo', names: ['照片'] },
  parallax: { zh: '分層視差', en: 'Parallax', desc: '背景與前景去背圖以不同速度移動，標題可夾在中間', group: 'photo', names: ['背景', '前景（去背 PNG，可留空）'], optional: [1] },
  phone: { zh: '手機框展示', en: 'Phone Mockup', desc: '截圖放進手機框滑入，長截圖會自動捲動', group: 'photo', names: ['手機截圖'] },
  compare: { zh: '前後滑桿對比', en: 'Before / After', desc: '分隔線掃過畫面，前後兩張照片對照', group: 'pmulti', names: ['前', '後'] },
  flip: { zh: '翻卡對比', en: 'Flip Card', desc: '卡片 3D 翻面，正面是前、背面是後', group: 'pmulti', names: ['正面（前）', '背面（後）'] },
  stack: { zh: '拍立得堆疊', en: 'Polaroid Stack', desc: '拍立得照片一張張落下疊成一疊，可加手寫標籤', group: 'pmulti', names: N(4) },
  grid: { zh: '宮格依序', en: 'Grid Sequence', desc: '2×2、3×3 等宮格依序彈出，適合格局、空間總覽', group: 'pmulti', names: N(9) },
  split: { zh: '分割畫面', en: 'Split Screen', desc: '畫面切成 2–3 格，照片依序滑入並排比較', group: 'pmulti', names: N(3) },
  magnify: { zh: '局部放大鏡', en: 'Magnifier', desc: '圈出細節，放大到旁邊的圓形鏡頭並加上標註', group: 'pmark', names: ['照片'] },
  freeze: { zh: '影片定格標註', en: 'Freeze Frame', desc: '畫面定格閃白、縮成相片，再圈出重點加上標籤', group: 'pmark', names: ['定格畫面'] },
  mask: { zh: '遮罩揭露', en: 'Mask Reveal', desc: '以圓形、斜切、百葉窗等硬邊遮罩揭露照片', group: 'pcut', names: ['揭露的照片', '底下的照片（可留空）'], optional: [1] },
  zoomthru: { zh: '縮放穿越', en: 'Zoom Through', desc: '鏡頭衝進照片的一點，穿越到下一張照片', group: 'pmark', names: ['第一張', '第二張'] },
  slices: { zh: '切片錯位', en: 'Slice Assembly', desc: '同一張照片切成條帶，交錯滑入後拼回完整畫面', group: 'pcut', names: ['照片'] },
  tiles: { zh: '拼塊組圖', en: 'Mosaic Assembly', desc: '照片裁成大小不同的矩形，依序展開並拼成完整構圖', group: 'pcut', names: ['照片'] },
  tear: { zh: '撕紙揭露', en: 'Paper Tear', desc: '不規則紙邊掃過畫面，撕開第一張照片、露出第二張', group: 'pcut', names: ['撕開前', '撕開後'] },
  collage: { zh: '剪報拼貼', en: 'Cutout Collage', desc: '透明底物件加上剪紙描邊，依序移動、旋轉並堆疊；請先準備去背 PNG／WebP', group: 'pcut', names: ['背景（可留空）', '剪報 1（去背 PNG／WebP）', '剪報 2（去背 PNG／WebP）', '剪報 3（去背 PNG／WebP）'], optional: [0, 2, 3] },
  morph: { zh: '形狀變換', en: 'Morphing Mask', desc: '圖片框從圓形拉成膠囊，再展開成全螢幕', group: 'pcut', names: ['照片', '底圖（可留空）'], optional: [1] },
  occlude: { zh: '前景遮擋換景', en: 'Foreground Wipe', desc: '門片或斜切前景掃過鏡頭，在完全遮住畫面時換景，可加透明前景圖', group: 'pcut', names: ['第一個場景', '第二個場景', '前景（去背 PNG／WebP，可留空）'], optional: [2] },
};
export const slotsOf = (m: PModule) => MODULE_INFO[m].names.length;

export const MODULE_DEFAULTS: Record<PModule, Record<string, number | string>> = {
  kenburns: { fz: 1, fx: 0.5, fy: 0.5, tz: 1.35, tx: 0.62, ty: 0.42, ease: 'inout' },
  swing: { size: 0.78, px: 0.5, py: 0.46, aspect: 0.75, angle: -28, rest: -4, scale: 1.6, from: 'left', border: 18, radius: 10, frame: '#ffffff', float: 1 },
  tilt: { size: 0.78, px: 0.5, py: 0.47, aspect: 0.75, ry0: -55, ry: -14, rx: 8, sway: 6, period: 4, depth: 24, border: 0, radius: 18, frame: '#ffffff', edge: '#e8e2d6' },
  window: { size: 0.84, px: 0.5, py: 0.45, aspect: 0.8, from: 'bottom', ox: 0.5, oy: 0.92, dur: 0.6, radius: 28, bar: 1, title: 'LIVING ROOM', barColor: '#f4f1ea', push: 1.06 },
  parallax: { dir: 'left', amount: 0.05, fgAmount: 0.14, zoom: 1.15, title: '', titleColor: '#ffffff', titleSize: 1, titleX: 0.5, titleY: 0.36 },
  phone: { size: 0.5, px: 0.5, py: 0.5, from: 'bottom', angle: 8, bezel: '#151515', scroll: 0.7, sdelay: 1.1, sdur: 3 },
  compare: { dir: 'h', from: 0.85, to: 0.15, hold: 0.8, sweep: 1.6, labelA: 'BEFORE', labelB: 'AFTER', line: '#ffffff', knob: '#ff5a36' },
  flip: { size: 0.74, px: 0.5, py: 0.46, aspect: 0.75, hold: 1.2, dur: 0.9, axis: 'y', depth: 14, radius: 18, edge: '#e8e2d6', labelA: 'BEFORE', labelB: 'AFTER' },
  stack: { count: 4, size: 0.6, px: 0.5, py: 0.46, spread: 0.5, interval: 0.55, from: 'top', aspect: 1, border: 18, bottom: 80, frame: '#ffffff', labels: '', ink: '#2b2b2b', seed: 3 },
  grid: { cols: 2, rows: 2, gap: 14, pad: 60, radius: 16, interval: 0.3, style: 'pop', order: 'row', labels: '', push: 1.06 },
  split: { count: 2, dir: 'v', gap: 10, line: '#ffffff', stagger: 0.3, from: 'alt', labels: '', push: 1.06 },
  magnify: { ax: 0.38, ay: 0.58, ar: 0.07, lx: 0.66, ly: 0.3, lr: 0.2, ring: '#ffd23f', push: 1.06 },
  freeze: { hold: 1.2, flash: 1, shrink: 0.84, tilt: -3, border: 16, frame: '#ffffff', stamp: 'PAUSE', ax: 0.56, ay: 0.55, ar: 0.09, lx: 0.32, ly: 0.24, label: '注意這裡', ring: '#ff5a36' },
  mask: { shape: 'circle', cx: 0.5, cy: 0.5, angle: 20, delay: 0.3, dur: 1.2, bands: 6, edge: '#ffd23f', edgeW: 10, push: 1.06 },
  zoomthru: { cx: 0.5, cy: 0.42, at: 2.6, dur: 1.1, depth: 5, mode: 'circle', ring: '#ffffff' },
  slices: { axis: 'h', count: 7, order: 'forward', delay: 0.2, dur: 0.9, stagger: 0.09 },
  tiles: { cols: 4, rows: 5, order: 'diagonal', seed: 3, delay: 0.2, dur: 0.8, stagger: 1.1 },
  tear: { dir: 'right', delay: 0.7, dur: 1.8, rough: 35, paper: 22, color: '#f5f1e8', seed: 4 },
  collage: { count: 3, size: 0.6, angle: 12, border: 16, color: '#ffffff', delay: 0.2, dur: 0.7, stagger: 0.35, x1: 0.35, y1: 0.34, x2: 0.65, y2: 0.5, x3: 0.42, y3: 0.7 },
  morph: { cx: 0.5, cy: 0.5, radius: 0.18, delay: 0.5, dur: 2.2, border: 6, color: '#ffffff' },
  occlude: { dir: 'right', shape: 'slant', color: '#ff5a36', delay: 0.8, dur: 1.8, width: 1.3, angle: 12 },
};

/** 拖曳把手對應的參數（x, y） */
export const HANDLE_KEYS: Record<string, [string, string]> = {
  card: ['px', 'py'],
  target: ['ax', 'ay'],
  lens: ['lx', 'ly'],
  label: ['lx', 'ly'],
  center: ['cx', 'cy'],
  origin: ['ox', 'oy'],
  title: ['titleX', 'titleY'],
  cut1: ['x1', 'y1'],
  cut2: ['x2', 'y2'],
  cut3: ['x3', 'y3'],
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
  window: [
    { k: 'from', label: '彈出位置', type: 'seg', opts: [['bottom', '下方'], ['center', '中央'], ['point', '指定點']] },
    { k: 'size', label: '視窗寬度', type: 'range', min: 0.3, max: 1, step: 0.01 },
    { k: 'aspect', label: '寬高比（0＝原圖）', type: 'range', min: 0, max: 2, step: 0.01 },
    { k: 'dur', label: '彈出時間（秒）', type: 'range', min: 0.2, max: 2, step: 0.05 },
    { k: 'radius', label: '圓角', type: 'range', min: 0, max: 80, step: 1 },
    { k: 'bar', label: '標題列', type: 'seg', opts: [['1', '顯示'], ['0', '隱藏']] },
    { k: 'title', label: '標題列文字', type: 'text' },
    { k: 'barColor', label: '標題列顏色', type: 'color' },
    { k: 'push', label: '照片慢推', type: 'range', min: 1, max: 1.4, step: 0.01 },
  ],
  parallax: [
    { k: 'dir', label: '移動方向', type: 'seg', opts: [['left', '左'], ['right', '右'], ['up', '上'], ['down', '下'], ['in', '推近']] },
    { k: 'amount', label: '背景移動量', type: 'range', min: 0, max: 0.2, step: 0.005 },
    { k: 'fgAmount', label: '前景移動量', type: 'range', min: 0, max: 0.4, step: 0.005 },
    { k: 'zoom', label: '基本放大', type: 'range', min: 1, max: 1.6, step: 0.01 },
    { k: 'title', label: '夾層標題（前景擋在字前面）', type: 'text' },
    { k: 'titleColor', label: '標題顏色', type: 'color' },
    { k: 'titleSize', label: '標題大小', type: 'range', min: 0.3, max: 3, step: 0.05 },
  ],
  phone: [
    { k: 'from', label: '進場方向', type: 'seg', opts: [['bottom', '下'], ['left', '左'], ['right', '右'], ['none', '原地']] },
    { k: 'size', label: '手機寬度', type: 'range', min: 0.2, max: 0.9, step: 0.01 },
    { k: 'angle', label: '進場角度', type: 'range', min: -30, max: 30, step: 1 },
    { k: 'bezel', label: '機身顏色', type: 'color' },
    { k: 'scroll', label: '長截圖捲動量', type: 'range', min: 0, max: 1, step: 0.01 },
    { k: 'sdelay', label: '開始捲動（秒）', type: 'range', min: 0, max: 8, step: 0.1 },
    { k: 'sdur', label: '捲動時間（秒）', type: 'range', min: 0.5, max: 10, step: 0.1 },
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
  flip: [
    { k: 'axis', label: '翻轉方向', type: 'seg', opts: [['y', '左右翻'], ['x', '上下翻']] },
    { k: 'size', label: '卡片寬度', type: 'range', min: 0.3, max: 1, step: 0.01 },
    { k: 'aspect', label: '寬高比（0＝原圖）', type: 'range', min: 0, max: 2, step: 0.01 },
    { k: 'hold', label: '翻面前停留（秒）', type: 'range', min: 0, max: 6, step: 0.1 },
    { k: 'dur', label: '翻面時間（秒）', type: 'range', min: 0.3, max: 3, step: 0.05 },
    { k: 'depth', label: '卡片厚度', type: 'range', min: 0, max: 60, step: 1 },
    { k: 'radius', label: '圓角', type: 'range', min: 0, max: 60, step: 1 },
    { k: 'edge', label: '側邊顏色', type: 'color' },
    { k: 'labelA', label: '正面標籤', type: 'text' },
    { k: 'labelB', label: '背面標籤', type: 'text' },
  ],
  stack: [
    { k: 'count', label: '張數', type: 'seg', opts: [['2', '2'], ['3', '3'], ['4', '4']] },
    { k: 'from', label: '落下方向', type: 'seg', opts: [['top', '上'], ['bottom', '下'], ['left', '左'], ['right', '右'], ['mix', '輪流']] },
    { k: 'size', label: '照片寬度', type: 'range', min: 0.3, max: 0.95, step: 0.01 },
    { k: 'spread', label: '散開程度', type: 'range', min: 0, max: 1, step: 0.01 },
    { k: 'interval', label: '間隔（秒）', type: 'range', min: 0.2, max: 2, step: 0.05 },
    { k: 'aspect', label: '照片寬高比', type: 'range', min: 0.6, max: 1.6, step: 0.01 },
    { k: 'border', label: '白框粗細', type: 'range', min: 4, max: 50, step: 1 },
    { k: 'bottom', label: '下方留白', type: 'range', min: 10, max: 200, step: 1 },
    { k: 'labels', label: '標籤（| 分隔）', type: 'text' },
    { k: 'ink', label: '標籤顏色', type: 'color' },
    { k: 'frame', label: '框色', type: 'color' },
    { k: 'seed', label: '擺放變化', type: 'range', min: 1, max: 20, step: 1 },
  ],
  grid: [
    { k: 'cols', label: '欄數', type: 'seg', opts: [['1', '1'], ['2', '2'], ['3', '3']] },
    { k: 'rows', label: '列數', type: 'seg', opts: [['1', '1'], ['2', '2'], ['3', '3']] },
    { k: 'style', label: '出現方式', type: 'seg', opts: [['pop', '彈出'], ['wipe', '刷開'], ['flip', '翻轉'], ['slide', '上滑']] },
    { k: 'order', label: '順序', type: 'seg', opts: [['row', '逐列'], ['diag', '斜向'], ['random', '隨機']] },
    { k: 'interval', label: '間隔（秒）', type: 'range', min: 0.05, max: 1.5, step: 0.05 },
    { k: 'gap', label: '間距', type: 'range', min: 0, max: 60, step: 1 },
    { k: 'pad', label: '外邊距', type: 'range', min: 0, max: 200, step: 2 },
    { k: 'radius', label: '圓角', type: 'range', min: 0, max: 60, step: 1 },
    { k: 'labels', label: '標籤（| 分隔，例如 客廳|主臥）', type: 'text' },
    { k: 'push', label: '照片慢推', type: 'range', min: 1, max: 1.3, step: 0.01 },
  ],
  split: [
    { k: 'count', label: '格數', type: 'seg', opts: [['2', '2'], ['3', '3']] },
    { k: 'dir', label: '排列', type: 'seg', opts: [['v', '左右並排'], ['h', '上下堆疊']] },
    { k: 'from', label: '滑入方式', type: 'seg', opts: [['alt', '交錯'], ['same', '同方向'], ['grow', '展開']] },
    { k: 'stagger', label: '間隔（秒）', type: 'range', min: 0, max: 1.5, step: 0.05 },
    { k: 'gap', label: '分隔線粗細', type: 'range', min: 0, max: 40, step: 1 },
    { k: 'line', label: '分隔線顏色', type: 'color' },
    { k: 'labels', label: '標籤（| 分隔）', type: 'text' },
    { k: 'push', label: '照片慢推', type: 'range', min: 1, max: 1.3, step: 0.01 },
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
  freeze: [
    { k: 'hold', label: '定格時間（秒）', type: 'range', min: 0, max: 6, step: 0.1 },
    { k: 'flash', label: '閃白', type: 'seg', opts: [['1', '開'], ['0', '關']] },
    { k: 'shrink', label: '縮小比例', type: 'range', min: 0.5, max: 1, step: 0.01 },
    { k: 'tilt', label: '傾斜角度', type: 'range', min: -15, max: 15, step: 0.5 },
    { k: 'border', label: '白框粗細', type: 'range', min: 0, max: 50, step: 1 },
    { k: 'frame', label: '框色', type: 'color' },
    { k: 'stamp', label: '左上角標記（留空＝不顯示）', type: 'text' },
    { k: 'ar', label: '圈選半徑', type: 'range', min: 0.02, max: 0.35, step: 0.005 },
    { k: 'label', label: '標註文字', type: 'text' },
    { k: 'ring', label: '標註顏色', type: 'color' },
  ],
  mask: [
    { k: 'shape', label: '遮罩形狀', type: 'seg', opts: [['circle', '圓形'], ['diamond', '菱形'], ['rect', '方框'], ['wipe', '斜切'], ['split', '對開'], ['blinds', '百葉窗']] },
    { k: 'angle', label: '角度（斜切、對開、百葉窗）', type: 'range', min: -90, max: 90, step: 1 },
    { k: 'bands', label: '百葉窗條數', type: 'range', min: 2, max: 16, step: 1 },
    { k: 'delay', label: '開始時間（秒）', type: 'range', min: 0, max: 5, step: 0.1 },
    { k: 'dur', label: '揭露時間（秒）', type: 'range', min: 0.2, max: 5, step: 0.05 },
    { k: 'edgeW', label: '邊緣線粗細', type: 'range', min: 0, max: 40, step: 1 },
    { k: 'edge', label: '邊緣線顏色', type: 'color' },
    { k: 'push', label: '照片慢推', type: 'range', min: 1, max: 1.4, step: 0.01 },
  ],
  zoomthru: [
    { k: 'mode', label: '穿越方式', type: 'seg', opts: [['circle', '圓形開口'], ['cut', '直接切換']] },
    { k: 'at', label: '切換時間（秒）', type: 'range', min: 0.5, max: 10, step: 0.1 },
    { k: 'dur', label: '衝入時間（秒）', type: 'range', min: 0.3, max: 3, step: 0.05 },
    { k: 'depth', label: '放大倍數', type: 'range', min: 2, max: 12, step: 0.5 },
    { k: 'ring', label: '開口外框顏色', type: 'color' },
  ],
  slices: [
    { k: 'axis', label: '切片方向', type: 'seg', opts: [['h', '橫條'], ['v', '直條']] },
    { k: 'count', label: '切片數', type: 'range', min: 2, max: 16, step: 1 },
    { k: 'order', label: '進場順序', type: 'seg', opts: [['forward', '依序'], ['reverse', '反向'], ['center', '中央向外']] },
    { k: 'delay', label: '開始時間（秒）', type: 'range', min: 0, max: 5, step: 0.1 },
    { k: 'dur', label: '每片滑入時間（秒）', type: 'range', min: 0.2, max: 3, step: 0.05 },
    { k: 'stagger', label: '切片間隔（秒）', type: 'range', min: 0, max: 0.3, step: 0.01 },
  ],
  tiles: [
    { k: 'cols', label: '拼塊欄數', type: 'range', min: 2, max: 8, step: 1 },
    { k: 'rows', label: '拼塊列數', type: 'range', min: 2, max: 8, step: 1 },
    { k: 'order', label: '展開順序', type: 'seg', opts: [['diagonal', '斜向'], ['row', '逐列'], ['random', '隨機']] },
    { k: 'seed', label: '拼塊變化', type: 'range', min: 1, max: 30, step: 1 },
    { k: 'delay', label: '開始時間（秒）', type: 'range', min: 0, max: 5, step: 0.1 },
    { k: 'dur', label: '每塊展開時間（秒）', type: 'range', min: 0.2, max: 3, step: 0.05 },
    { k: 'stagger', label: '整組錯開時間（秒）', type: 'range', min: 0, max: 3, step: 0.05 },
  ],
  tear: [
    { k: 'dir', label: '撕開方向', type: 'seg', opts: [['right', '向右'], ['left', '向左'], ['down', '向下'], ['up', '向上']] },
    { k: 'rough', label: '紙邊起伏', type: 'range', min: 8, max: 100, step: 1 },
    { k: 'paper', label: '紙邊厚度', type: 'range', min: 0, max: 60, step: 1 },
    { k: 'color', label: '紙邊顏色', type: 'color' },
    { k: 'seed', label: '撕痕變化', type: 'range', min: 1, max: 30, step: 1 },
    { k: 'delay', label: '開始時間（秒）', type: 'range', min: 0, max: 5, step: 0.1 },
    { k: 'dur', label: '撕開時間（秒）', type: 'range', min: 0.2, max: 5, step: 0.05 },
  ],
  collage: [
    { k: 'count', label: '剪報張數', type: 'seg', opts: [['1', '1'], ['2', '2'], ['3', '3']] },
    { k: 'size', label: '剪報大小', type: 'range', min: 0.15, max: 1, step: 0.01 },
    { k: 'angle', label: '散開角度', type: 'range', min: 0, max: 30, step: 1 },
    { k: 'border', label: '剪紙描邊', type: 'range', min: 0, max: 40, step: 1 },
    { k: 'color', label: '描邊顏色', type: 'color' },
    { k: 'delay', label: '開始時間（秒）', type: 'range', min: 0, max: 5, step: 0.1 },
    { k: 'dur', label: '每張進場時間（秒）', type: 'range', min: 0.2, max: 3, step: 0.05 },
    { k: 'stagger', label: '張與張間隔（秒）', type: 'range', min: 0, max: 1.5, step: 0.05 },
    pos('x1', '剪報 1 位置 X'), pos('y1', '剪報 1 位置 Y'),
    pos('x2', '剪報 2 位置 X'), pos('y2', '剪報 2 位置 Y'),
    pos('x3', '剪報 3 位置 X'), pos('y3', '剪報 3 位置 Y'),
  ],
  morph: [
    pos('cx', '起始圓形中心 X'), pos('cy', '起始圓形中心 Y'),
    { k: 'radius', label: '起始圓形半徑', type: 'range', min: 0.04, max: 0.4, step: 0.01 },
    { k: 'border', label: '圖片框描邊', type: 'range', min: 0, max: 30, step: 1 },
    { k: 'color', label: '描邊顏色', type: 'color' },
    { k: 'delay', label: '圓形停留（秒）', type: 'range', min: 0, max: 5, step: 0.1 },
    { k: 'dur', label: '形狀變換時間（秒）', type: 'range', min: 0.4, max: 5, step: 0.05 },
  ],
  occlude: [
    { k: 'dir', label: '前景移動方向', type: 'seg', opts: [['right', '向右'], ['left', '向左'], ['down', '向下'], ['up', '向上']] },
    { k: 'shape', label: '遮擋底板', type: 'seg', opts: [['door', '門片'], ['slant', '斜切']] },
    { k: 'color', label: '前景底板顏色', type: 'color' },
    { k: 'width', label: '遮擋寬度', type: 'range', min: 1.05, max: 2, step: 0.05 },
    { k: 'angle', label: '斜切角度', type: 'range', min: -25, max: 25, step: 1 },
    { k: 'delay', label: '開始時間（秒）', type: 'range', min: 0, max: 5, step: 0.1 },
    { k: 'dur', label: '掃過時間（秒）', type: 'range', min: 0.4, max: 5, step: 0.05 },
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
      if (f.opts.some(([o]) => o === String(v))) params[f.k] = /^\d+$/.test(String(v)) ? Number(v) : String(v);
    } else params[f.k] = String(v).slice(0, 40);
  }
  const images = Array.isArray(raw.images) ? raw.images.map((x) => (typeof x === 'string' ? x : '')).slice(0, slotsOf(module)) : [];
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
  return { ratio, loop, module, bg, images, params, caption, ...(typeof raw.font === 'string' && /^[a-z]{2,12}$/.test(raw.font) ? { font: raw.font } : {}) };
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
