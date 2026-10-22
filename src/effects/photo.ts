import type { Fx } from '../types';
import { esc } from '../util';
import { fnSource } from '../engine';
import { photoRenderer, photoSceneFromWords, type PModule } from '../photokit';

export const PHOTO_GLOBALS = `window.MA_PHOTO=${fnSource(photoRenderer)}();`;

const CSS = `.S{background:#151515}
.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;

/** 五個模組共用同一段播放程式；圖片載入失敗時保留佔位圖 */
const run: Fx['run'] = (root) => {
  const R = (globalThis as unknown as { MA_PHOTO: { drawPhoto: (...a: unknown[]) => unknown } }).MA_PHOTO;
  const cv = root.querySelector('canvas')!;
  const ctx = cv.getContext('2d')!;
  let sc: { loop: number; images?: string[] };
  try {
    sc = JSON.parse(cv.dataset.scene || '{}');
  } catch {
    return;
  }
  const imgs: (HTMLImageElement | undefined)[] = [];
  (sc.images || []).forEach((src, i) => {
    if (!src) return;
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => (imgs[i] = im);
    im.src = src;
  });
  const dpr = Math.min(2, devicePixelRatio || 1);
  const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
  const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
  const t0 = performance.now();
  const loop = Math.max(1.5, sc.loop || 6) + 1;
  let raf = 0;
  const f = (now: number) => {
    raf = requestAnimationFrame(f);
    R.drawPhoto(ctx, W, H, sc, ((now - t0) / 1000) % loop, imgs);
  };
  raf = requestAnimationFrame(f);
  return () => cancelAnimationFrame(raf);
};

const make = (module: PModule, o: Pick<Fx, 'zh' | 'en' | 'desc' | 'tags' | 'sample' | 'motion' | 'motionEn'>): Fx => ({
  id: `photo-${module}`,
  cat: 'photo',
  tone: 'ink',
  hint: '在圖片工作室放入照片、調整後加入 Combo；或由 AI 透過 MCP 的 build_photo_scene 產生。文字會當成字幕',
  css: CSS,
  html: (w) => `<canvas data-scene="${esc(JSON.stringify(photoSceneFromWords(w, module)))}"></canvas>`,
  globals: PHOTO_GLOBALS,
  run,
  ...o,
});

export const photo: Fx[] = [
  make('kenburns', {
    zh: '推拉運鏡',
    en: 'Ken Burns',
    desc: '照片從起始取景慢慢推近、平移到結束取景，讓靜態照片變成運鏡',
    tags: ['建案', '外觀', '可疊影片'],
    sample: ['外觀慢推'],
    motion: '一張照片填滿畫面，鏡頭從起始取景（縮放與中心點）以慢-快-慢的速度平滑推近並平移到結束取景；下方深色膠囊字幕延遲淡入上移。全程硬邊，無模糊。',
    motionEn: 'A full-frame photo where the virtual camera glides from a start framing (zoom and center) to an end framing with an ease-in-out push and pan; a dark pill caption fades up after a short delay. Hard edges throughout, no blur.',
  }),
  make('swing', {
    zh: '旋轉甩入',
    en: 'Swing In',
    desc: '照片帶白框從側邊旋轉甩進畫面，回彈後停在微斜角度並輕輕漂浮',
    tags: ['開箱', '社群', 'Shorts'],
    sample: ['這間採光超好'],
    motion: '一張帶白色邊框與圓角的照片從畫面外側以大角度、放大狀態甩入，帶回彈減速停在畫面中央、略微傾斜的角度，之後上下輕微漂浮；字幕在照片下方淡入。無陰影、無模糊。',
    motionEn: 'A photo with a white border and rounded corners swings in from off-screen at a steep angle and oversized scale, decelerating with an overshoot to rest at a slight tilt in the center, then floats gently; a caption fades in below. No shadows or blur.',
  }),
  make('tilt', {
    zh: '3D 傾斜卡片',
    en: '3D Tilt Card',
    desc: '照片變成有厚度的卡片，以透視角度轉入後輕微擺動',
    tags: ['建案', '2D 轉 3D', '質感'],
    sample: ['樣品屋客廳'],
    motion: '照片成為有厚度的實體卡片，在透視空間中從大角度側轉進來，停在略斜的角度後左右緩慢擺動，側邊以單一實色呈現厚度；字幕淡入。以 3D 透視繪製，無陰影與模糊。',
    motionEn: 'The photo becomes a thick physical card that rotates in from a steep side angle in perspective, settles at a slight angle and then sways slowly; its edges show thickness in a flat solid color; a caption fades in. Rendered in 3D perspective with no shadows or blur.',
  }),
  make('compare', {
    zh: '前後滑桿對比',
    en: 'Before / After',
    desc: '分隔線帶著圓形把手掃過畫面，前後兩張照片對照',
    tags: ['重劃區', '施工前後', '對比'],
    sample: ['三年前 vs 現在'],
    motion: '兩張照片疊在一起，白色分隔線與圓形把手（含左右箭頭）從一側停留後平滑掃到另一側，揭露第二張照片；左上與右上各有深色膠囊標籤（BEFORE / AFTER），字幕淡入。硬邊、無模糊。',
    motionEn: 'Two photos stacked; after a short hold, a white divider with a round arrow knob sweeps smoothly across to reveal the second photo; dark pill labels (BEFORE / AFTER) sit in the top corners and a caption fades in. Hard edges, no blur.',
  }),
  make('magnify', {
    zh: '局部放大鏡',
    en: 'Magnifier',
    desc: '圈出照片中的細節，連線放大到旁邊的圓形鏡頭',
    tags: ['細節', '建材', '標註'],
    sample: ['這裡是防水層'],
    motion: '照片緩慢推近，黃色圓圈畫出要強調的細節，接著一條黃線延伸到旁邊，圓形放大鏡頭帶回彈展開，鏡頭內是該細節的放大畫面，外圈黃色實線；字幕淡入。無陰影、無模糊。',
    motionEn: 'The photo pushes in slowly; a yellow circle draws around a detail, a yellow line extends to the side, and a round magnifier lens springs open showing the detail enlarged inside a solid yellow ring; a caption fades in. No shadows or blur.',
  }),
];
