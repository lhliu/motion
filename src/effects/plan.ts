import type { Fx } from '../types';
import { esc } from '../util';
import { PLAN_INFO, planLength, planSceneFromWords, type PlanMode } from '../plankit';

const CSS = `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;

const run: Fx['run'] = (root) => {
  const R = (globalThis as unknown as { MA_PLAN: { drawPlan: (...a: unknown[]) => unknown } }).MA_PLAN;
  const cv = root.querySelector('canvas')!;
  const ctx = cv.getContext('2d')!;
  let sc: { images?: string[]; bg?: string; loop?: number };
  try {
    sc = JSON.parse(cv.dataset.scene || '{}');
  } catch {
    return;
  }
  if (sc.bg === 'transparent') root.style.background = 'transparent';
  const imgs: (HTMLImageElement | undefined)[] = [];
  (sc.images || []).forEach((src, i) => {
    if (!src || src.startsWith('sample:')) return;
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => (imgs[i] = im);
    im.src = src;
  });
  const dpr = Math.min(2, devicePixelRatio || 1);
  const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
  const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
  const FS = getComputedStyle(root).getPropertyValue('--sans').trim();
  const loop = Math.max(3, Number(cv.dataset.loop) || 7) + 0.6;
  const t0 = performance.now();
  let raf = 0;
  const f = (now: number) => {
    raf = requestAnimationFrame(f);
    R.drawPlan(ctx, W, H, sc, ((globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE ? Math.min((now - t0) / 1000, loop - 0.001) : (now - t0) / 1000 % loop), imgs, FS);
  };
  raf = requestAnimationFrame(f);
  return () => cancelAnimationFrame(raf);
};

const make = (mode: PlanMode, o: Pick<Fx, 'no' | 'tags' | 'sample' | 'motion' | 'motionEn'>): Fx => ({
  id: `plan-${mode}`,
  cat: PLAN_INFO[mode].group,
  zh: PLAN_INFO[mode].zh,
  en: PLAN_INFO[mode].en,
  desc: PLAN_INFO[mode].desc,
  tone: 'paper',
  hint: '第 1 行標題、第 2 行副標。放自己的平面圖、標房間與動線請用格局工作室，或由 AI 透過 MCP 的 build_plan_scene 產生。卡片示範為虛構戶型',
  css: CSS,
  html: (w) => {
    const sc = planSceneFromWords(w, mode);
    return `<canvas data-loop="${planLength(sc)}" data-scene="${esc(JSON.stringify(sc))}"></canvas>`;
  },
  engine: 'plan',
  run,
  added: '2026-10-23',
  duration: 8,
  ...o,
});

const HARD = '全部硬邊實色，不用陰影模糊；預設在右下角顯示「本圖面僅供參考，實際依買賣合約書附圖為準」。';
const HARD_EN = 'All flat and hard-edged, no blur; a small disclaimer sits at the bottom right by default.';

export const plans: Fx[] = [
  make('locate', {
    no: 230,
    tags: ['格局', '區位', '建案'],
    sample: ['A3 戶', '三房示意（虛構戶型）'],
    motion: `整層配置圖淡入；其他戶別壓暗、目標戶以主色外框脈衝並跳出戶別標籤；鏡頭平滑推近到該戶，接著以目標戶為圓心的圓形展開，切換成該戶平面圖；標題與副標在上方。${HARD}`,
    motionEn: `A full floor plate fades in; other units dim while the target unit pulses in an accent outline with a unit tag; the camera pushes into it, then a circular wipe from its center reveals that unit's own floor plan; title and subtitle sit on top. ${HARD_EN}`,
  }),
  make('amenity', {
    no: 231,
    tags: ['格局', '公設', '建案'],
    sample: ['公設一次看', '虛構示意'],
    motion: `公設平面圖淡入；鏡頭依序平移推近到每一區，其他區域壓暗、該區主色外框並跳出名稱；最後拉回全圖，所有區域名稱一起出現。${HARD}`,
    motionEn: `An amenity floor plan fades in; the camera glides and zooms to each zone in turn, dimming the rest, outlining the zone and popping its name; finally it pulls back out with every zone labeled. ${HARD_EN}`,
  }),
  make('rooms', {
    no: 232,
    tags: ['格局', '開箱', '解說'],
    sample: ['格局一次看懂', '虛構示意戶型'],
    motion: `戶型平面圖淡入；其他區域壓暗，房間一間一間以主色外框亮起並彈出名稱；全部看完後壓暗退去，所有房間名稱縮小一起標上。${HARD}`,
    motionEn: `A unit plan fades in; with everything else dimmed, rooms light up one at a time with an accent outline and a popping name tag; at the end the dim lifts and every room is labeled together. ${HARD_EN}`,
  }),
  make('tour', {
    no: 233,
    tags: ['格局', '帶看', '動線'],
    sample: ['跟著動線看一圈', '虛構示意戶型'],
    motion: `平面圖上先出現「入」字入口點；主色虛線從入口一路畫出去，前端是一顆白框實心圓在走；走進哪個房間，那間就從壓暗中亮起並跳出名稱，走過的房間保持亮著；走完後所有走過的房間標上名稱。${HARD}`,
    motionEn: `An entry marker appears on the plan; an accent dashed line draws out from it with a ringed dot walking at its head; each room the walker enters lights up from the dimmed plan with its name, visited rooms stay lit, and all of them are labeled at the end. ${HARD_EN}`,
  }),
  make('focus', {
    no: 234,
    tags: ['格局', '尺寸', '解說'],
    sample: ['主臥', '虛構示意戶型'],
    motion: `平面圖淡入，周圍壓暗、目標房間外框亮起；鏡頭推近到這個房間，上方與右側的尺寸線由一端拉到另一端並跳出尺寸文字，房間中央出現名稱標籤。尺寸文字留空就不畫尺寸線。${HARD}`,
    motionEn: `The plan fades in, everything around the target room dims and its outline lights up; the camera pushes in, dimension lines extend along the top and right edges with their measurement labels, and a name tag appears in the room. Empty dimension text skips the lines. ${HARD_EN}`,
  }),
  make('compare', {
    no: 235,
    tags: ['格局', '比較', '建案'],
    sample: ['兩種戶型比一比', '虛構示意'],
    motion: `兩張戶型圖從兩側（直式為上下）滑入並排，中間彈出 VS；下方跳出各自的戶型標籤；接著兩邊同名的空間（客廳、主臥、廚房⋯）同時亮起外框與名稱，一個接一個對照。${HARD}`,
    motionEn: `Two unit plans slide in side by side (stacked in portrait) with a VS badge popping between them and a label under each; rooms with the same name on both sides then light up together, one pair at a time. ${HARD_EN}`,
  }),
  make('tilt', {
    no: 236,
    tags: ['格局', '3D', '質感'],
    sample: ['立體格局', '虛構示意戶型'],
    motion: `平面圖從正上方視角慢慢旋轉、壓扁成斜躺的等角視角，底下出現板厚側面與落地陰影；接著沿房間外框立起實色牆片、由後往前疊，牆頂黑線收邊，房間名稱浮在牆上方；之後模型輕微左右擺動。${HARD}`,
    motionEn: `The plan rotates and flattens from a top-down view into a tilted axonometric slab with visible thickness and a cast shadow; solid wall panels then rise along the room outlines, painted back to front with dark top edges, room names floating above; the model then sways gently. ${HARD_EN}`,
  }),
];
