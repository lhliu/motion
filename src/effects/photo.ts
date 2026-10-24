import type { Fx } from '../types';
import { esc } from '../util';
import { MODULE_INFO, photoSceneFromWords, type PModule } from '../photokit';

const CSS = `.S{background:#151515}
.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;

/** 圖片模組共用同一段播放程式；圖片載入失敗時保留佔位圖 */
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
  const FS = getComputedStyle(root).getPropertyValue('--sans').trim();
  const t0 = performance.now();
  const loop = Math.max(1.5, sc.loop || 6) + 1;
  let raf = 0;
  const f = (now: number) => {
    raf = requestAnimationFrame(f);
    R.drawPhoto(ctx, W, H, sc, ((globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE ? Math.min((now - t0) / 1000, loop - 0.001) : (now - t0) / 1000 % loop), imgs, FS);
  };
  raf = requestAnimationFrame(f);
  return () => cancelAnimationFrame(raf);
};

const make = (module: PModule, o: Pick<Fx, 'no' | 'desc' | 'tags' | 'sample' | 'motion' | 'motionEn' | 'added'>): Fx => ({
  id: `photo-${module}`,
  cat: MODULE_INFO[module].group,
  zh: MODULE_INFO[module].zh,
  en: MODULE_INFO[module].en,
  tone: 'ink',
  hint: '在圖片工作室放入照片、調整後加入 Combo；或由 AI 透過 MCP 的 build_photo_scene 產生。文字會當成字幕',
  css: CSS,
  html: (w) => `<canvas data-scene="${esc(JSON.stringify(photoSceneFromWords(w, module)))}"></canvas>`,
  engine: 'photo',
  run,
  ...o,
});

export const photo: Fx[] = [
  make('kenburns', {
    no: 121,
    desc: '照片從起始取景慢慢推近、平移到結束取景，讓靜態照片變成運鏡',
    tags: ['建案', '外觀', '可疊影片'],
    sample: ['外觀慢推'],
    motion: '一張照片填滿畫面，鏡頭從起始取景（縮放與中心點）以慢-快-慢的速度平滑推近並平移到結束取景；下方深色膠囊字幕延遲淡入上移。全程硬邊，無模糊。',
    motionEn: 'A full-frame photo where the virtual camera glides from a start framing (zoom and center) to an end framing with an ease-in-out push and pan; a dark pill caption fades up after a short delay. Hard edges throughout, no blur.',
  }),
  make('swing', {
    no: 122,
    desc: '照片帶白框從側邊旋轉甩進畫面，回彈後停在微斜角度並輕輕漂浮',
    tags: ['開箱', '社群', 'Shorts'],
    sample: ['這間採光超好'],
    motion: '一張帶白色邊框與圓角的照片從畫面外側以大角度、放大狀態甩入，帶回彈減速停在畫面中央、略微傾斜的角度，之後上下輕微漂浮；字幕在照片下方淡入。無陰影、無模糊。',
    motionEn: 'A photo with a white border and rounded corners swings in from off-screen at a steep angle and oversized scale, decelerating with an overshoot to rest at a slight tilt in the center, then floats gently; a caption fades in below. No shadows or blur.',
  }),
  make('tilt', {
    no: 123,
    desc: '照片變成有厚度的卡片，以透視角度轉入後輕微擺動',
    tags: ['建案', '2D 轉 3D', '質感'],
    sample: ['樣品屋客廳'],
    motion: '照片成為有厚度的實體卡片，在透視空間中從大角度側轉進來，停在略斜的角度後左右緩慢擺動，側邊以單一實色呈現厚度；字幕淡入。以 3D 透視繪製，無陰影與模糊。',
    motionEn: 'The photo becomes a thick physical card that rotates in from a steep side angle in perspective, settles at a slight angle and then sways slowly; its edges show thickness in a flat solid color; a caption fades in. Rendered in 3D perspective with no shadows or blur.',
  }),
  make('compare', {
    no: 127,
    desc: '分隔線帶著圓形把手掃過畫面，前後兩張照片對照',
    tags: ['重劃區', '施工前後', '對比'],
    sample: ['三年前 vs 現在'],
    motion: '兩張照片疊在一起，白色分隔線與圓形把手（含左右箭頭）從一側停留後平滑掃到另一側，揭露第二張照片；左上與右上各有深色膠囊標籤（BEFORE / AFTER），字幕淡入。硬邊、無模糊。',
    motionEn: 'Two photos stacked; after a short hold, a white divider with a round arrow knob sweeps smoothly across to reveal the second photo; dark pill labels (BEFORE / AFTER) sit in the top corners and a caption fades in. Hard edges, no blur.',
  }),
  make('magnify', {
    no: 132,
    desc: '圈出照片中的細節，連線放大到旁邊的圓形鏡頭',
    tags: ['細節', '建材', '標註'],
    sample: ['這裡是防水層'],
    motion: '照片緩慢推近，黃色圓圈畫出要強調的細節，接著一條黃線延伸到旁邊，圓形放大鏡頭帶回彈展開，鏡頭內是該細節的放大畫面，外圈黃色實線；字幕淡入。無陰影、無模糊。',
    motionEn: 'The photo pushes in slowly; a yellow circle draws around a detail, a yellow line extends to the side, and a round magnifier lens springs open showing the detail enlarged inside a solid yellow ring; a caption fades in. No shadows or blur.',
  }),
  make('window', {
    no: 124,
    desc: '照片裝進圓角視窗，從下方或指定點彈出放大，可加標題列',
    tags: ['開箱', '空間', '介面感'],
    sample: ['客廳採光'],
    motion: '一個圓角視窗從畫面下方（或指定點）以回彈方式放大彈出到定位，視窗上方是淺色標題列（左側紅黃綠三個圓點、中間標題文字），下方裝著照片並緩慢推近；字幕淡入。硬邊、無陰影。',
    motionEn: 'A rounded window springs up from the bottom (or a chosen point) and scales into place with an overshoot; it has a light title bar with red, yellow and green dots and a centered title, and holds a photo that slowly pushes in; a caption fades in. Hard edges, no shadow.',
  }),
  make('parallax', {
    no: 125,
    desc: '背景與前景以不同速度移動做出景深，標題可以夾在前景後面',
    tags: ['2D 轉 3D', '片頭', '質感'],
    sample: ['新店央北'],
    motion: '背景照片緩慢平移，前景去背圖層以較大的幅度朝同方向移動，產生 2.5D 景深；大標題位於兩層之間，被前景擋住一部分，淡入上移。全部硬邊，無模糊。',
    motionEn: 'The background photo pans slowly while a cut-out foreground layer moves further in the same direction, creating 2.5D depth; a large title sits between the layers, partly hidden by the foreground, fading up. Hard edges, no blur.',
  }),
  make('phone', {
    no: 126,
    desc: '截圖放進手機框滑入畫面，長截圖會在螢幕裡自動往下捲',
    tags: ['App', '截圖', '物件頁'],
    sample: ['實價登錄這樣查'],
    motion: '一支深色機身、圓角螢幕、上方膠囊鏡頭孔的手機，帶著傾斜角度從畫面下方回彈滑入並轉正、輕微漂浮；螢幕內的長截圖停留後平滑往下捲動；字幕淡入。無陰影、無模糊。',
    motionEn: 'A phone with a dark body, rounded screen and pill camera cutout slides up from the bottom at an angle, settles upright with an overshoot and floats gently; a long screenshot inside scrolls smoothly down after a pause; a caption fades in. No shadow, no blur.',
  }),
  make('flip', {
    no: 128,
    desc: '卡片 3D 翻面，正面是施工前、背面是完工後',
    tags: ['施工前後', '對比', '2D 轉 3D'],
    sample: ['兩年後長這樣'],
    motion: '照片成為有厚度的實體卡片，停留後在透視空間中沿垂直軸翻轉 180 度，背面是第二張照片，翻完後輕微擺動；卡片下方膠囊標籤從 BEFORE 換成 AFTER。無陰影。',
    motionEn: 'The photo becomes a thick card that, after a pause, flips 180 degrees around its vertical axis in perspective to reveal a second photo on the back, then sways gently; a pill label below switches from BEFORE to AFTER. No shadow.',
  }),
  make('stack', {
    no: 129,
    desc: '拍立得照片一張張從上方落下疊成一疊，下方留白可寫標籤',
    tags: ['回顧', '生活感', '社群'],
    sample: ['看房這一天'],
    motion: '白色拍立得照片（下方留白較寬、寫著手寫風標籤）依序從畫面上方甩落，帶旋轉與回彈，停在略微散開、各自傾斜的位置疊成一疊，每張以細實線區隔。無陰影、無模糊。',
    motionEn: 'White polaroid prints with wide bottom margins and handwritten-style labels drop in one by one from above with spin and overshoot, landing slightly scattered and individually tilted into a pile, separated by thin solid outlines. No shadow, no blur.',
  }),
  make('grid', {
    no: 130,
    desc: '2×2、3×3 宮格依序彈出，適合格局、空間總覽',
    tags: ['格局', '空間', '總覽'],
    sample: ['四房兩廳一次看'],
    motion: '畫面切成圓角宮格，照片依序（逐列、斜向或隨機）以回彈放大彈出，格內照片緩慢推近，左下角膠囊標籤標示空間名稱；字幕淡入。硬邊。',
    motionEn: 'The frame is divided into a rounded grid; photos pop in one after another (row by row, diagonally or randomly) with an overshoot and slowly push in, with pill labels naming each room at the bottom left; a caption fades in. Hard edges.',
  }),
  make('split', {
    no: 131,
    desc: '畫面切成 2–3 格並排，照片交錯滑入，用白線分隔',
    tags: ['比較', '並排', 'Shorts'],
    sample: ['A 案 vs B 案'],
    motion: '畫面切成 2 到 3 個直欄（或橫列），各欄照片依序從上、下交錯滑入，欄與欄之間的白色分隔線同時延伸；每欄左上角有膠囊標籤；字幕淡入。硬邊。',
    motionEn: 'The frame splits into 2–3 columns (or rows); each photo slides in from alternating top and bottom in turn while white dividers extend between them; each panel has a pill label at the top left; a caption fades in. Hard edges.',
  }),
  make('freeze', {
    no: 133,
    desc: '畫面定格閃白、縮成白框相片，接著圈出重點加上標籤',
    tags: ['影片', '重點', '標註'],
    sample: ['這面牆有裂縫'],
    motion: '全畫面影格在定格瞬間閃白，接著縮小、略微傾斜並長出白色相框，左上角出現紅色 PAUSE 標記；之後在重點處畫出彩色圓圈，拉出一條線到旁邊，標籤膠囊以回彈彈出。硬邊、無模糊。',
    motionEn: 'The full-frame shot freezes with a white flash, then shrinks, tilts slightly and grows a white photo border, with a red PAUSE tag at the top left; a colored circle then draws around the key spot, a line extends to the side and a label pill springs in. Hard edges, no blur.',
  }),
  make('mask', {
    no: 134,
    desc: '用圓形、菱形、斜切、百葉窗等硬邊遮罩揭露照片',
    tags: ['轉場', '揭露', '片頭'],
    sample: ['正式公開'],
    motion: '照片透過硬邊遮罩揭露：圓形從一點擴大、菱形展開、斜切刷過、從中線對開或多條百葉窗依序打開，遮罩邊緣有一條實色線；照片緩慢推近。無模糊、無羽化。',
    motionEn: 'The photo is revealed through a hard-edged mask: a circle expanding from a point, a growing diamond, a diagonal wipe, a center split or staggered blinds, with a solid colored line along the mask edge; the photo slowly pushes in. No blur or feathering.',
  }),
  make('zoomthru', {
    no: 135,
    desc: '鏡頭衝進照片中的一點，穿過圓形開口到下一張照片',
    tags: ['轉場', '節奏', '連接'],
    sample: ['走進社區'],
    motion: '第一張照片朝指定點加速放大，接近時該點出現白框圓形開口並迅速擴大，開口內是第二張照片；穿越後第二張照片由放大狀態拉回正常大小。硬邊、無動態模糊。',
    motionEn: 'The first photo accelerates into a chosen point; near the end a white-rimmed circular opening appears there and expands rapidly to reveal the second photo, which then settles from an enlarged state back to normal. Hard edges, no motion blur.',
  }),
  make('slices', {
    no: 151, added: '2026-10-22',
    desc: '照片裁成橫條或直條，從兩側交錯滑入後對齊成完整畫面',
    tags: ['裁切', '切片', '片頭', '節奏'], sample: [],
    motion: '同一張照片切成 2–16 條，各條保持原始取景，從相反方向錯開滑入並以緩出減速對齊。可切換橫直、依序、反向或中央向外；最後拼回無縫完整照片。全程硬邊，不加文字、模糊或陰影。',
    motionEn: 'Divide one photo into 2–16 horizontal or vertical strips. Alternate strips slide in from opposite sides, staggered forward, backward or outward from the center, easing into their original alignment. End on the seamless full image. Hard edges, no text, blur or shadows.',
  }),
  make('tiles', {
    no: 152, added: '2026-10-22',
    desc: '同一張照片裁成大小不同的矩形，斜向、逐列或隨機展開拼回原圖',
    tags: ['裁切', '拼塊', '揭露', '片頭'], sample: [],
    motion: '將同一張照片裁成不等大的矩形拼塊，各塊從中心縮放展開並稍微上移歸位，可選斜向、逐列或固定種子的隨機順序。取景在所有拼塊間連續，最終組成無縫原圖；同一種子逐格渲染完全一致。無文字、模糊、陰影。',
    motionEn: 'Partition a single photo into unequal rectangular tiles. Tiles scale out from their centers and settle slightly upward in diagonal, row or seeded random order. All crops share one framing and finish as the seamless original. Deterministic per-frame rendering; no text, blur or shadows.',
  }),
  make('tear', {
    no: 153, added: '2026-10-22',
    desc: '不規則撕紙邊從指定方向掃過，揭露第二張照片',
    tags: ['裁切', '撕紙', '轉場', '剪貼'], sample: [],
    motion: '第一張照片全畫面停留，再由指定方向撕開。固定種子的鋸齒紙邊平滑掃過，前沿露出可調色的紙纖維邊帶，後方顯示第二張照片，結束完整停在第二張。四方向可選，紙邊起伏與厚度可調，無文字、模糊、陰影。',
    motionEn: 'Hold the first photo full-frame, then sweep a seeded irregular torn-paper edge in one of four directions. A configurable paper-colored rim leads the reveal of photo two. End completely on the second photo. Adjustable roughness and paper thickness, no text, blur or shadows.',
  }),
  make('collage', {
    no: 154, added: '2026-10-22',
    desc: '去背 PNG／WebP 沿輪廓描邊，交錯旋轉進場並堆疊成剪報',
    tags: ['裁切', '剪貼', '拼貼', '可疊影片'], sample: [],
    motion: '選填背景圖，將 1–3 張預先去背的 PNG／WebP 沿 alpha 輪廓加上實色剪紙描邊，依序從左右交錯滑入、回彈旋轉並堆疊。每張可拖曳定位、調整大小、描邊與時間；保留透明背景，不會自動去背。無文字、模糊、陰影。',
    motionEn: 'Over an optional background, outline the alpha silhouettes of 1–3 already-cut-out PNG/WebP images and stagger them in from alternating sides with rotation and overshoot. Position each independently; preserve transparency. No automatic background removal, text, blur or shadows.',
  }),
  make('morph', {
    no: 155, added: '2026-10-22',
    desc: '照片先藏在圓形框內，拉成膠囊，再連續展開成全螢幕',
    tags: ['裁切', '遮罩', '形變', '揭露'], sample: [],
    motion: '照片先透過可定位的圓形遮罩顯示，停留後平滑拉成橫向膠囊，接著圖片框移到畫面中央、擴展到滿版，圓角與描邊同步收斂消失。可搭配底圖或透明背景，全程共用同一張照片取景，無文字、模糊、陰影。',
    motionEn: 'Show one photo through a positioned circular mask, morph it smoothly into a horizontal capsule, then center and expand the frame to full-screen while its corner radius and outline resolve to zero. Optional background image or transparency. Continuous source framing, no text, blur or shadows.',
  }),
  make('occlude', {
    no: 156, added: '2026-10-22',
    desc: '門片或斜切前景掃過鏡頭，完全遮住畫面時銜接第二個場景',
    tags: ['遮擋', '前景', '轉場', '開箱'], sample: [],
    motion: '第一張照片停留後，一片不透明門片或斜切前景從指定方向掃過；前景覆蓋全畫面時切換到第二張照片，再移出露出新場景。可將預先去背 PNG／WebP 疊在底板上；底板確保透明孔洞不會露出切換接縫。四方向、顏色、斜度與時間可調，無文字、模糊、陰影。',
    motionEn: 'Sweep an opaque door or slanted foreground panel across the first scene. Switch to scene two only while the panel fully covers the frame, then let it exit. An optional pre-cut PNG/WebP rides on the panel; the solid backing prevents transparent holes from exposing the cut. Four directions, adjustable color, angle and timing; no text, blur or shadows.',
  }),
];
