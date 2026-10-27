import { illustratedCosmos } from './effects/cosmos';
import { illustratedNature } from './effects/nature';
import { illustratedVehicles } from './effects/transport';
import type { Category, Fx, Palette, Section, SecId } from './types';
import { impact } from './effects/impact';
import { flow } from './effects/flow';
import { depth } from './effects/depth';
import { switching } from './effects/switch';
import { style } from './effects/style';
import { light } from './effects/light';
import { reveal } from './effects/reveal';
import { caption } from './effects/caption';
import { card } from './effects/card';
import { estateExtra } from './effects/estate-extra';
import { flowExplain } from './effects/flow-explain';
import { statExplain } from './effects/stat-explain';
import { cardExplain } from './effects/card-explain';
import { estateExplain } from './effects/estate-explain';
import { kinetic } from './effects/kinetic';
import { texture } from './effects/texture';
import { retro } from './effects/retro';
import { map } from './effects/map';
import { liquid } from './effects/liquid';
import { photo } from './effects/photo';
import { diagram } from './effects/diagram';
import { objects } from './effects/object';
import { illustratedOcean } from './effects/illustrated';
import { transit } from './effects/transit';
import { charts } from './effects/chart';
import { plans } from './effects/plan';
import { cuts } from './effects/cut';
import { mapfx } from './effects/mapfx';
import { ui } from './effects/ui';
import { newsFx } from './effects/news';
import { minimapFx } from './effects/minimap';
import { parcelMapFx } from './effects/parcelmap';
import { canonTags, USE_OF, USES } from './uses';

export const SECTIONS: Section[] = [
  { id: 'text', code: 'TEXT', zh: '文字', en: 'Text Motion', desc: '字卡、標題、字幕條、轉場文字' },
  { id: 'cut', code: 'CUT', zh: '轉場', en: 'Transitions', desc: '段落之間的換場：色塊推擠、形狀擦除、開門、翻頁、閃白、甩鏡、故障' },
  { id: 'ui', code: 'UI', zh: '元件', en: 'Overlay Kit', desc: '社群介面、開場收尾、房產資訊、新聞讀報：留言回覆、通知、搜尋框、片尾卡、通勤碼錶、優缺點、日照方位……' },
  { id: 'photo', code: 'PHOTO', zh: '圖片', en: 'Photo Motion', desc: '照片、截圖、影片定格變成運鏡片段', studio: 'photo' },
  { id: 'map', code: 'MAP', zh: '地圖', en: 'Map Motion', desc: '基地、路名、距離、通勤，把位置講清楚', studio: 'map' },
  { id: 'object', code: 'OBJECT', zh: '物件', en: 'Object Motion', desc: '水滴、魔術方塊、星空宇宙；一系列可調形狀材質的主角物件', studio: 'object' },
  { id: 'illus', code: 'ILLUS', zh: '插畫', en: 'Illustration', desc: '精修插畫主角：星空物件、俯瞰、天空物件、海洋世界；每招有專屬編輯，可透明疊進影片' },
  { id: 'chart', code: 'CHART', zh: '圖表', en: 'Chart Motion', desc: '直條、折線、圓餅、階層、統計、瀑布……一行一筆數據就會動' },
  { id: 'plan', code: 'PLAN', zh: '格局', en: 'Floor Plan', desc: '平面圖、單房、戶別定位、公設、立體傾斜；放建商平面圖就能動', studio: 'plan' },
  { id: 'explain', code: 'EXPLAIN', zh: '圖解', en: 'Explainer', desc: '工法、剖面、流程示意；一支一支客製，改圖請交給 AI' },
];

export const CATEGORIES: Category[] = [
  { id: 'impact', sec: 'text', code: 'IMPACT', zh: '衝擊登場', tagline: '一個字就能改變氣氛' },
  { id: 'reveal', sec: 'text', code: 'REVEAL', zh: '揭露浮現', tagline: '讓文字優雅地出場' },
  { id: 'kinetic', sec: 'text', code: 'KINETIC', zh: '動態排版', tagline: '讓每個字都有個性' },
  { id: 'switch', sec: 'text', code: 'SWITCH', zh: '切換輪播', tagline: '把一個詞換成另一個' },
  { id: 'flow', sec: 'text', code: 'FLOW', zh: '流動跑馬', tagline: '文字一直流動不停' },
  { id: 'depth', sec: 'text', code: 'DEPTH', zh: '立體空間', tagline: '鑽進文字裡面' },
  { id: 'style', sec: 'text', code: 'STYLE', zh: '字體風格', tagline: '換個呈現方式就升級' },
  { id: 'light', sec: 'text', code: 'LIGHT', zh: '光影發光', tagline: '用光替文字加戲' },
  { id: 'texture', sec: 'text', code: 'TEXTURE', zh: '粒子質感', tagline: '從像素到粒子' },
  { id: 'caption', sec: 'text', code: 'CAPTION', zh: '字幕資訊條', tagline: '影片最常用的那幾條' },
  { id: 'card', sec: 'text', code: 'CARD', zh: '字卡版型', tagline: '直接拿來當段落字卡' },
  { id: 'retro', sec: 'text', code: 'RETRO', zh: '復古懷舊', tagline: '一秒回到那個年代' },
  { id: 'twipe', sec: 'cut', code: 'WIPE', zh: '擦除推擠', tagline: '色塊、形狀、開門、翻頁，把畫面蓋過去再掀開' },
  { id: 'tflash', sec: 'cut', code: 'FLASH', zh: '節奏閃切', tagline: '閃白閃黑、甩鏡、故障，跟著節拍切' },
  { id: 'social', sec: 'ui', code: 'SOCIAL', zh: '社群介面', tagline: '留言回覆、通知、搜尋、愛心、點擊、瀏覽器、聲波、子母畫面' },
  { id: 'hook', sec: 'ui', code: 'HOOK', zh: '開場收尾', tagline: '系列角標、結果先講、POV、片尾推薦卡' },
  { id: 'estate', sec: 'ui', code: 'ESTATE', zh: '房產資訊', tagline: '通勤碼錶、資料來源、優缺點、日照、樓層、規格、評分、工程進度' },
  { id: 'news', sec: 'ui', code: 'NEWS', zh: '新聞讀報', tagline: '報紙頭版、剪報螢光筆、網路新聞卡、逐句讀報；內容請用真實新聞並保留媒體與日期' },
  { id: 'photo', sec: 'photo', code: 'MOVE', zh: '單張運鏡', tagline: '一張照片也能有鏡頭感' },
  { id: 'pmulti', sec: 'photo', code: 'MULTI', zh: '多張組合', tagline: '前後對比、宮格、並排' },
  { id: 'pmark', sec: 'photo', code: 'FOCUS', zh: '標註轉場', tagline: '圈重點、定格、穿越' },
  { id: 'pcut', sec: 'photo', code: 'MASK', zh: '裁切與遮罩', tagline: '切片、拼塊、撕紙、剪報與遮擋換景' },
  { id: 'map', sec: 'map', code: 'MAP', zh: '地圖區位', tagline: '把位置、距離、通勤講清楚' },
  { id: 'mcompare', sec: 'map', code: 'COMPARE', zh: '區位與路線', tagline: '台灣定位、兩區對照、通勤賽跑、地圖導航、行程串連、聚光燈' },
  { id: 'mplan', sec: 'map', code: 'PLAN', zh: '規劃建設', tagline: '重劃區分期、重大建設、分區、地籍（示意）、地籍棟距圖' },
  { id: 'mdata', sec: 'map', code: 'DATA', zh: '數據地圖', tagline: '著色圖、泡泡、立體長條，數字附來源' },
  { id: 'mrisk', sec: 'map', code: 'LIFE', zh: '生活機能與風險', tagline: '生活機能地圖、學區、雷達、手機導航、嫌惡設施、淹水潛勢' },
  { id: 'mkit', sec: 'map', code: 'KIT', zh: '地圖元件', tagline: '小地圖、指北針比例尺、新舊對照' },
  { id: 'transit', sec: 'map', code: 'METRO', zh: '捷運鐵路路網', tagline: '路網圖、路線條、轉乘與規劃中路線' },
  { id: 'liquid', sec: 'object', code: 'DROP', zh: '水滴泡泡', tagline: '柔軟、透明、會呼吸' },
  { id: 'meteor', sec: 'illus', code: 'SPACE', zh: '星空物件', tagline: '天體、低空飛越、推近地球、隕石與太空船，五招各有獨立編輯器' },
  { id: 'cube', sec: 'object', code: 'CUBE', zh: '魔術方塊', tagline: '塑膠、金屬、花色、單色' },
  { id: 'cosmos', sec: 'object', code: 'COSMOS', zh: '星空宇宙', tagline: '星空背景、四種天體、四種地表飛越與獨立推近地球；非精修版' },
  { id: 'site', sec: 'object', code: 'SITE', zh: '建案工地', tagline: '樓層蓋高、起重機、防塵網' },
  { id: 'keys', sec: 'object', code: 'KEYS', zh: '交屋鑰匙', tagline: '鑰匙串、門牌、開門' },
  { id: 'furniture', sec: 'object', code: 'MOVE-IN', zh: '家具進場', tagline: '沙發、立燈、邊桌、掛畫一件件進場' },
  { id: 'house', sec: 'object', code: 'HOUSE', zh: '等角小屋', tagline: '立體小屋蓋起來、夜晚亮燈' },
  { id: 'contract', sec: 'object', code: 'DOCS', zh: '合約文件', tagline: '簽名、蓋章、翻頁' },
  { id: 'skyline', sec: 'object', code: 'SKYLINE', zh: '城市天際線', tagline: '大樓長高、日夜切換' },
  { id: 'weather', sec: 'object', code: 'WEATHER', zh: '天氣', tagline: '下雨、晴天、颱風、起霧' },
  { id: 'signal', sec: 'object', code: 'SIGNAL', zh: '交通號誌', tagline: '紅綠燈倒數、行人號誌' },
  { id: 'plant', sec: 'object', code: 'PLANT', zh: '植物綠地', tagline: '盆栽發芽、四季行道樹' },
  { id: 'clock', sec: 'object', code: 'TIME', zh: '時間', tagline: '沙漏、時鐘快轉、撕日曆' },
  { id: 'party', sec: 'object', code: 'PARTY', zh: '慶祝', tagline: '拉炮彩帶、煙火' },
  { id: 'coins', sec: 'object', code: 'COINS', zh: '錢幣存錢筒', tagline: '硬幣疊高、存錢筒（示意）' },
  { id: 'gacha', sec: 'object', code: 'GACHA', zh: '抽籤扭蛋', tagline: '扭蛋機、籤筒' },
  { id: 'aerial', sec: 'illus', code: 'AERIAL', zh: '俯瞰', tagline: '八種精修地景，各有專屬動態與運鏡' },
  { id: 'vehicle', sec: 'illus', code: 'VEHICLE', zh: '天空物件', tagline: '飛機、熱氣球，各有專屬編輯' },
  { id: 'ocean', sec: 'illus', code: 'OCEAN', zh: '海洋世界', tagline: '七種精修海底場景與輪船，各有專屬編輯與透明輸出' },
  { id: 'cbar', sec: 'chart', code: 'BAR', zh: '直條橫條', tagline: '直條、堆疊、橫條、排名、瀑布' },
  { id: 'cline', sec: 'chart', code: 'LINE', zh: '折線區域', tagline: '走勢、量體、雙軸組合' },
  { id: 'cpie', sec: 'chart', code: 'PIE', zh: '圓形比例', tagline: '圓餅、環圈、儀表、進度環、象形圖' },
  { id: 'chier', sec: 'chart', code: 'TREE', zh: '階層流程', tagline: '樹狀、旭日、漏斗' },
  { id: 'cstat', sec: 'chart', code: 'STAT', zh: '統計散佈', tagline: '盒鬚、散佈、泡泡、雷達' },
  { id: 'punit', sec: 'plan', code: 'UNIT', zh: '戶型導覽', tagline: '逐間高亮、看屋動線、單房聚焦、比較、立體' },
  { id: 'pfloor', sec: 'plan', code: 'FLOOR', zh: '整層與公設', tagline: '戶別定位、公設導覽' },
  { id: 'diagram', sec: 'explain', code: 'DIAGRAM', zh: '工法剖面', tagline: '建材、管線、結構，一張剖面講清楚' },
];

const order = CATEGORIES.map((c) => c.id);

export const ALL_EFFECTS: Fx[] = [
  ...impact,
  ...reveal,
  ...kinetic,
  ...switching,
  ...flow,
  ...depth,
  ...style,
  ...light,
  ...texture,
  ...caption,
  ...card,
  ...estateExtra,
  ...estateExplain,
  ...cardExplain,
  ...flowExplain,
  ...statExplain,
  ...retro,
  ...map,
  ...liquid,
  ...photo,
  ...diagram,
  ...objects,
  ...illustratedOcean,
  ...illustratedVehicles,
  ...illustratedNature,
  ...illustratedCosmos,
  ...transit,
  ...mapfx,
  ...charts,
  ...plans,
  ...cuts,
  ...ui,
  ...newsFx,
  minimapFx,
  parcelMapFx,
].sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));

// 從前台隱藏（代碼、編號保留，舊 Combo 與預設仍可用）
const HIDE = new Set(['obj-cosmos-sun','obj-cosmos-moon','obj-cosmos-earth','obj-cosmos-flyby-moon','obj-cosmos-flyby-mars','obj-cosmos-flyby-sun','vehicle-illustrated-car', 'vehicle-illustrated-carriage', 'vehicle-illustrated-train']);
ALL_EFFECTS.forEach((f) => {
  if (HIDE.has(f.id)) f.hidden = true;
});

// 有 3D 效果（透視、3D 翻轉、立體厚度、等角視角、球體自轉）的招式統一加上「3D」標籤；新增 3D 招式時加進這裡
const THREE_D = new Set([
  'text-tunnel', 'ring-tunnel', 'text-orbit', 'text-cylinder', 'extrude', 'star-crawl', 'qa-card', 'flip-cards', 'blinds', 'domino', 'flip-chars', 'text-cube', 'text-corridor', 'paper-cut', 'synthwave',
  'photo-tilt', 'photo-parallax', 'photo-flip',
  'map-flyover',
  'obj-cosmos-planet', 'obj-cosmos-flyby-earth', 'obj-cosmos-zoom-earth', 'obj-cube-plastic', 'obj-cube-metal', 'obj-cube-pattern', 'obj-cube-mono', 'obj-cosmos-moon', 'obj-cosmos-earth', 'obj-cosmos-flyby-moon', 'obj-cosmos-flyby-mars', 'obj-cosmos-flyby-sun',
  'plan-tilt',
  'layer-section',
]);
ALL_EFFECTS.forEach((f) => {
  if (THREE_D.has(f.id) && !f.tags.includes('3D')) f.tags = [...f.tags, '3D'];
});

// 文字特效：指定用途、標籤收斂成固定詞彙，並依用途重新排序（編號跟著用途走）
const secIdx = (f: Fx) => ['text', 'cut', 'ui', 'photo', 'map', 'object', 'illus', 'chart', 'plan', 'explain'].indexOf(CATEGORIES.find((c) => c.id === f.cat)!.sec);
const useIdx = (f: Fx) => USES.findIndex((u) => u.id === f.use);
// 同一用途內依 uses.ts 列出的順序（常用的在前）
const useRank = new Map(Object.keys(USE_OF).map((id, i) => [id, i]));
ALL_EFFECTS.forEach((f) => {
  if (secIdx(f) !== 0) return;
  f.use = USE_OF[f.id] ?? 'mood';
  f.kw = f.tags;
  f.tags = canonTags(f.tags);
});
ALL_EFFECTS.sort((a, b) => secIdx(a) - secIdx(b) || (secIdx(a) === 0 ? useIdx(a) - useIdx(b) || useRank.get(a.id)! - useRank.get(b.id)! : 0) || order.indexOf(a.cat) - order.indexOf(b.cat) || (a.cat==='meteor'&&b.cat==='meteor'?(a.catalogNo??a.no)-(b.catalogNo??b.no):0));

/** Public catalog: hidden originals still live in ALL_EFFECTS for saved references. */
export const EFFECTS = ALL_EFFECTS.filter(f=>!f.hidden);

export const secOf = (f: Fx): SecId => CATEGORIES.find((c) => c.id === f.cat)!.sec;

/** 前台編號預設用 no；合併精修可用 catalogNo 沿用原入口，內部 no 永久保留。 */
export const NUM = new Map(ALL_EFFECTS.map((f) => [f.id, f.catalogNo ?? f.no]));
{
  const seen = new Map<number, string>();
  for (const f of ALL_EFFECTS) {
    if (seen.has(f.no)) console.error(`特效編號重複：#${f.no} 同時給了 ${seen.get(f.no)} 與 ${f.id}`);
    seen.set(f.no, f.id);
  }
}

export const PALETTES: Palette[] = [
  { id: 'leicht', name: '光寓橘', ink: '#151515', paper: '#f5f1e8', accent: '#ff5a36', accent2: '#ffd23f' },
  { id: 'sakura', name: '櫻花粉', ink: '#232323', paper: '#faf7f5', accent: '#f472b6', accent2: '#fde047' },
  { id: 'lime', name: '螢光綠', ink: '#171717', paper: '#f7f7f2', accent: '#d4ff3a', accent2: '#ff4d8d' },
  { id: 'terra', name: '赤陶', ink: '#1f1a17', paper: '#f4efe6', accent: '#e2673f', accent2: '#f2c14e' },
  { id: 'electric', name: '電光藍', ink: '#0f1220', paper: '#eef2ff', accent: '#3b82f6', accent2: '#22d3ee' },
  { id: 'forest', name: '薄荷綠', ink: '#10201a', paper: '#f1f5ef', accent: '#34d399', accent2: '#fbbf24' },
  { id: 'violet', name: '夜紫', ink: '#160f24', paper: '#f6f3fb', accent: '#a78bfa', accent2: '#f472b6' },
];

/** 所有出現過的情境標籤，依出現次數排序 */
export const ALL_TAGS: string[] = (() => {
  const m = new Map<string, number>();
  EFFECTS.forEach((f) => f.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
})();
