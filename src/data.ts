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
import { kinetic } from './effects/kinetic';
import { texture } from './effects/texture';
import { retro } from './effects/retro';
import { map } from './effects/map';
import { liquid } from './effects/liquid';
import { photo } from './effects/photo';
import { diagram } from './effects/diagram';
import { objects } from './effects/object';
import { canonTags, USE_OF, USES } from './uses';

export const SECTIONS: Section[] = [
  { id: 'text', code: 'TEXT', zh: '文字特效', en: 'Text Motion', desc: '字卡、標題、字幕條、轉場文字' },
  { id: 'photo', code: 'PHOTO', zh: '圖片運鏡', en: 'Photo Motion', desc: '照片、截圖、影片定格變成運鏡片段', studio: 'photo' },
  { id: 'map', code: 'MAP', zh: '地圖區位', en: 'Map Motion', desc: '基地、路名、距離、通勤，把位置講清楚', studio: 'map' },
  { id: 'object', code: 'OBJECT', zh: '物件特效', en: 'Object Motion', desc: '水滴、隕石、魔術方塊、星空宇宙；一系列可調形狀材質的主角物件', studio: 'object' },
  { id: 'explain', code: 'EXPLAIN', zh: '圖解動畫', en: 'Explainer', desc: '工法、剖面、流程示意；一支一支客製，改圖請交給 AI' },
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
  { id: 'photo', sec: 'photo', code: 'MOVE', zh: '單張運鏡', tagline: '一張照片也能有鏡頭感' },
  { id: 'pmulti', sec: 'photo', code: 'MULTI', zh: '多張組合', tagline: '前後對比、宮格、並排' },
  { id: 'pmark', sec: 'photo', code: 'FOCUS', zh: '標註轉場', tagline: '圈重點、定格、穿越' },
  { id: 'pcut', sec: 'photo', code: 'MASK', zh: '裁切與遮罩', tagline: '切片、拼塊、撕紙、剪報與遮擋換景' },
  { id: 'map', sec: 'map', code: 'MAP', zh: '地圖區位', tagline: '把位置、距離、通勤講清楚' },
  { id: 'liquid', sec: 'object', code: 'DROP', zh: '水滴泡泡', tagline: '柔軟、透明、會呼吸' },
  { id: 'meteor', sec: 'object', code: 'METEOR', zh: '隕石', tagline: '隨機、對稱、熔岩、冰晶' },
  { id: 'cube', sec: 'object', code: 'CUBE', zh: '魔術方塊', tagline: '塑膠、金屬、花色、單色' },
  { id: 'cosmos', sec: 'object', code: 'COSMOS', zh: '星空宇宙', tagline: '星空、光速、星系、行星' },
  { id: 'diagram', sec: 'explain', code: 'DIAGRAM', zh: '工法剖面', tagline: '建材、管線、結構，一張剖面講清楚' },
];

const order = CATEGORIES.map((c) => c.id);

export const EFFECTS: Fx[] = [
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
  ...retro,
  ...map,
  ...liquid,
  ...photo,
  ...diagram,
  ...objects,
].sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));

// 文字特效：指定用途、標籤收斂成固定詞彙，並依用途重新排序（編號跟著用途走）
const secIdx = (f: Fx) => ['text', 'photo', 'map', 'object', 'explain'].indexOf(CATEGORIES.find((c) => c.id === f.cat)!.sec);
const useIdx = (f: Fx) => USES.findIndex((u) => u.id === f.use);
// 同一用途內依 uses.ts 列出的順序（常用的在前）
const useRank = new Map(Object.keys(USE_OF).map((id, i) => [id, i]));
EFFECTS.forEach((f) => {
  if (secIdx(f) !== 0) return;
  f.use = USE_OF[f.id] ?? 'mood';
  f.kw = f.tags;
  f.tags = canonTags(f.tags);
});
EFFECTS.sort((a, b) => secIdx(a) - secIdx(b) || (secIdx(a) === 0 ? useIdx(a) - useIdx(b) || useRank.get(a.id)! - useRank.get(b.id)! : 0) || order.indexOf(a.cat) - order.indexOf(b.cat));

export const secOf = (f: Fx): SecId => CATEGORIES.find((c) => c.id === f.cat)!.sec;

/** 編號固定寫在各特效的 no，不隨排序或新增而改變 */
export const NUM = new Map(EFFECTS.map((f) => [f.id, f.no]));
{
  const seen = new Map<number, string>();
  for (const f of EFFECTS) {
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
