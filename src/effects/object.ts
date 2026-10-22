import type { Fx } from '../types';
import { esc } from '../util';
import { fnSource } from '../engine';
import { FONTS_GLOBALS } from '../fonts';
import { objRenderer, objSceneFromWords, type OModule } from '../objkit';

export const OBJ_GLOBALS = `${FONTS_GLOBALS}window.MA_OBJ=${fnSource(objRenderer)}();`;

const CSS = `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;

const run: Fx['run'] = (root) => {
  const R = (globalThis as unknown as { MA_OBJ: { drawObj: (...a: unknown[]) => unknown } }).MA_OBJ;
  const cv = root.querySelector('canvas')!;
  const ctx = cv.getContext('2d')!;
  let sc: { loop: number };
  try {
    sc = JSON.parse(cv.dataset.scene || '{}');
  } catch {
    return;
  }
  const dpr = Math.min(2, devicePixelRatio || 1);
  const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
  const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
  const FS = getComputedStyle(root).getPropertyValue('--sans').trim();
  const t0 = performance.now();
  const loop = Math.max(2, sc.loop || 6);
  let raf = 0;
  const f = (now: number) => {
    raf = requestAnimationFrame(f);
    R.drawObj(ctx, W, H, sc, ((now - t0) / 1000) % loop, FS);
  };
  raf = requestAnimationFrame(f);
  return () => cancelAnimationFrame(raf);
};

const make = (
  module: OModule,
  variant: string,
  preset: Record<string, number | string>,
  o: Pick<Fx, 'no' | 'zh' | 'en' | 'desc' | 'tags' | 'sample' | 'motion' | 'motionEn'>,
): Fx => ({
  id: `obj-${module}-${variant}`,
  cat: module,
  tone: 'ink',
  hint: '一行一句，~ 開頭為英文小字（最多 4 行）。形狀、材質、顏色請在物件工作室調整，或由 AI 透過 MCP 的 build_object_scene 產生',
  css: CSS,
  html: (w) => `<canvas data-scene="${esc(JSON.stringify(objSceneFromWords(w, module, preset)))}"></canvas>`,
  globals: OBJ_GLOBALS,
  run,
  ...o,
});

const M_MOTION = '一顆隕石以回彈放大登場後緩慢自轉並上下漂浮，暗面是整體形狀、亮面往左上方位移，加上月牙高光、坑洞（暗色橢圓加受光邊緣）等硬邊細節；周圍小碎石繞著漂浮；文字在下方淡入上移。全部硬邊，不用陰影或模糊。';
const M_MOTION_EN = 'A meteor springs in, then slowly spins and floats, with a dark base shape, a light side offset toward the top left, a crescent highlight and craters (dark ellipses with lit rims) — all hard-edged; small rock fragments drift around it and text fades up below. No shadows or blur.';
const C_MOTION = '立體魔術方塊以回彈放大登場後緩慢水平自轉，接著依序轉動幾層（每次 90 度）再依相反順序轉回原狀；每個小方塊有本體色與內縮貼紙，受光面略亮、背光面略暗；文字在下方淡入。透視 3D、硬邊。';
const C_MOTION_EN = 'A 3D Rubik’s cube springs in and spins slowly, twisting several layers 90 degrees one after another and then undoing them in reverse; each cubie has a body color and inset stickers, lit faces slightly brighter and shaded faces darker; text fades in below. Perspective 3D, hard edges.';

export const objects: Fx[] = [
  make('meteor', 'rock', {}, { no: 158, zh: '漂浮隕石', en: 'Floating Meteor', desc: '隨機形狀的岩石隕石，自轉漂浮、周圍有碎石', tags: ['片頭', '科幻', '可疊影片'], sample: ['重磅登場'], motion: M_MOTION, motionEn: M_MOTION_EN }),
  make('meteor', 'ice', { shape: 'sym', sym: 6, material: 'ice', color: '#cfeaf7', color2: '#6aa5c8', craters: 0, debris: 6, bg: '#0b1626' }, { no: 159, zh: '對稱冰晶隕石', en: 'Symmetric Ice Meteor', desc: '六瓣對稱的冰晶隕石，有切面與高光', tags: ['片頭', '清爽', '可疊影片'], sample: ['冷靜分析'], motion: M_MOTION.replace('坑洞（暗色橢圓加受光邊緣）', '冰晶切面三角'), motionEn: M_MOTION_EN }),
  make('meteor', 'lava', { material: 'lava', color: '#3a2a26', color2: '#1a1210', trail: 1, angle: -35, debris: 2, craters: 0, bg: '#120c10' }, { no: 160, zh: '熔岩墜落', en: 'Lava Meteor Fall', desc: '帶熔岩裂縫的隕石拖著火焰尾跡墜落', tags: ['衝擊', '片頭', '可疊影片'], sample: ['爆炸性消息'], motion: '隕石帶著三層實色（黃、橘、紅）的尖形火焰尾跡登場，表面有發亮的熔岩裂縫折線並脈動；周圍少量碎石；文字在下方淡入。全部硬邊。', motionEn: 'A meteor enters trailing a pointed three-layer flat flame (yellow, orange, red), its surface cracked with glowing lava lines that pulse; a few fragments drift nearby and text fades in below. All hard-edged.' }),
  make('meteor', 'gold', { shape: 'round', material: 'metal', color: '#c9a65a', color2: '#6e5525', craters: 4, debris: 5, rimW: 0, bg: '#14110b' }, { no: 161, zh: '金屬隕石', en: 'Metal Meteor', desc: '圓潤的金色金屬隕石，有斜向反光帶', tags: ['質感', '品牌', '可疊影片'], sample: ['年度精選'], motion: M_MOTION.replace('坑洞', '斜向硬邊反光帶、坑洞'), motionEn: M_MOTION_EN }),
  make('cube', 'plastic', {}, { no: 162, zh: '經典魔術方塊', en: 'Classic Rubik Cube', desc: '經典六色塑膠魔術方塊，自轉並轉動層', tags: ['思考', '解謎', '片頭'], sample: ['解開買房難題'], motion: C_MOTION, motionEn: C_MOTION_EN }),
  make('cube', 'metal', { material: 'metal', bg: '#121418' }, { no: 163, zh: '金屬魔術方塊', en: 'Metal Rubik Cube', desc: '銀色金屬本體、漸層貼紙與反光帶', tags: ['質感', '科技', '片頭'], sample: ['精算每一步'], motion: C_MOTION.replace('本體色', '銀色金屬本體').replace('內縮貼紙', '帶漸層與斜向反光的金屬貼紙'), motionEn: C_MOTION_EN }),
  make('cube', 'pattern', { material: 'pattern', scheme: 'pastel', pattern: 'dot', body: '#2b2b2b', bg: '#f3efe6' }, { no: 164, zh: '花色魔術方塊', en: 'Patterned Rubik Cube', desc: '粉彩貼紙加上圓點、條紋或格紋花色', tags: ['可愛', '活潑', '片頭'], sample: ['生活的各種可能'], motion: C_MOTION.replace('內縮貼紙', '帶圓點、條紋或格紋花色的內縮貼紙'), motionEn: C_MOTION_EN }),
  make('cube', 'mono', { material: 'mono', n: 2, mono: '#ff5a36', bg: '#151515' }, { no: 165, zh: '單色魔術方塊', en: 'Mono Rubik Cube', desc: '單一主色的 2×2 方塊，只靠明暗區分面', tags: ['品牌', '極簡', '片頭'], sample: ['一個方向'], motion: C_MOTION.replace('每個小方塊有本體色與內縮貼紙', '所有貼紙同一個主色'), motionEn: C_MOTION_EN }),
  make('cosmos', 'stars', {}, { no: 166, zh: '閃爍星空', en: 'Twinkling Stars', desc: '星星閃爍、緩慢漂移，偶爾有流星劃過', tags: ['夜景', '療癒', '背景'], sample: ['夜晚的城市'], motion: '深色背景上大小不一的方形星點各自閃爍並緩慢向右漂移，少數大星是四角星芒；流星以實色細長三角形從右上斜劃過；文字置中淡入。全部硬邊，不用光暈。', motionEn: 'Square star dots of various sizes twinkle and drift slowly right on a dark background, a few large ones drawn as four-point sparkles; shooting stars streak diagonally as thin flat triangles; centered text fades in. All hard-edged, no glow.' }),
  make('cosmos', 'warp', { mode: 'warp', speed: 1.2 }, { no: 167, zh: '光速穿越', en: 'Hyperspace Warp', desc: '星星從中心向外拉成光束，像穿越星際', tags: ['轉場', '科幻', '速度感'], sample: ['未來已來'], motion: '星點從畫面中心向外放射並拉長成越來越粗的光束線條，速度持續向前，像穿越超空間；文字置中淡入。實色線條、無模糊。', motionEn: 'Stars radiate from the center and stretch into ever thicker streaks, constantly rushing forward like a jump to hyperspace; centered text fades in. Solid lines, no blur.' }),
  make('cosmos', 'galaxy', { mode: 'galaxy', color2: '#c58bff', size: 0.62, density: 1.6 }, { no: 168, zh: '旋轉星系', en: 'Spiral Galaxy', desc: '三條旋臂的星系緩慢旋轉，核心分層發亮', tags: ['科幻', '氛圍', '片頭'], sample: ['宇宙級規模'], motion: '背景星空閃爍，中央三條旋臂的星系由大量小星點組成並緩慢旋轉，核心是幾層同心實色橢圓，越外圈越暗；文字在星系上淡入。硬邊。', motionEn: 'Against twinkling stars, a three-armed spiral galaxy made of many small points rotates slowly around a core of stacked solid ellipses that darken outward; text fades in over it. Hard-edged.' }),
  make('cosmos', 'planet', { mode: 'planet', planet: '#e8a35c', color2: '#f2d6a2', y: 0.36, size: 0.34, layout: 'below' }, { no: 169, zh: '行星光環', en: 'Ringed Planet', desc: '有條紋與光環的行星彈出並緩慢轉動', tags: ['科幻', '片頭', '背景'], sample: ['探索新區域'], motion: '星空中一顆帶橫向條紋的行星以回彈放大登場，條紋緩慢流動，右下為實色背光面；三層實色光環繞過行星（後半在行星後、前半在前）；流星偶爾劃過；文字在下方淡入。全部硬邊。', motionEn: 'A banded planet springs in against the stars, its stripes drifting slowly with a flat shaded night side at lower right; three solid rings wrap around it (back half behind, front half in front); occasional shooting stars; text fades in below. All hard-edged.' }),
];
