import type { Category, Fx, Palette } from './types';
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

export const CATEGORIES: Category[] = [
  { id: 'impact', code: 'IMPACT', zh: '衝擊登場', tagline: '一個字就能改變氣氛' },
  { id: 'reveal', code: 'REVEAL', zh: '揭露浮現', tagline: '讓文字優雅地出場' },
  { id: 'kinetic', code: 'KINETIC', zh: '動態排版', tagline: '讓每個字都有個性' },
  { id: 'switch', code: 'SWITCH', zh: '切換輪播', tagline: '把一個詞換成另一個' },
  { id: 'flow', code: 'FLOW', zh: '流動跑馬', tagline: '文字一直流動不停' },
  { id: 'depth', code: 'DEPTH', zh: '立體空間', tagline: '鑽進文字裡面' },
  { id: 'style', code: 'STYLE', zh: '字體風格', tagline: '換個呈現方式就升級' },
  { id: 'light', code: 'LIGHT', zh: '光影發光', tagline: '用光替文字加戲' },
  { id: 'texture', code: 'TEXTURE', zh: '粒子質感', tagline: '從像素到粒子' },
  { id: 'liquid', code: 'LIQUID', zh: '水滴泡泡', tagline: '柔軟、透明、會呼吸' },
  { id: 'caption', code: 'CAPTION', zh: '字幕資訊條', tagline: '影片最常用的那幾條' },
  { id: 'card', code: 'CARD', zh: '字卡版型', tagline: '直接拿來當段落字卡' },
  { id: 'map', code: 'MAP', zh: '地圖區位', tagline: '把位置、距離、通勤講清楚' },
  { id: 'retro', code: 'RETRO', zh: '復古懷舊', tagline: '一秒回到那個年代' },
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
].sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat));

export const NUM = new Map(EFFECTS.map((f, i) => [f.id, i + 1]));

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
