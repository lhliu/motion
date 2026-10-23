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
  const FS = getComputedStyle(root).getPropertyValue('--sans').trim();
  const loop = Math.max(2, sc.loop || 6);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed = 0, previous = performance.now();
  let raf = 0;
  const draw = () => R.drawObj(ctx, cv.width, cv.height, sc, reduced.matches ? loop * 0.35 : elapsed % loop, FS);
  const ro = new ResizeObserver(() => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
    cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
    draw();
  });
  ro.observe(cv);
  const f = (now: number) => {
    raf = requestAnimationFrame(f);
    const speed = Number(root.dataset.motionSpeed ?? 1);
    if (!reduced.matches) elapsed += Math.max(0, now - previous) / 1000 * (Number.isFinite(speed) ? Math.max(0, speed) : 1);
    previous = now;
    draw();
  };
  raf = requestAnimationFrame(f);
  return () => { cancelAnimationFrame(raf); ro.disconnect(); };
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
  ...((module === 'ocean'||module === 'vehicle') ? { hidden: true } : {}),
  ...(module === 'ocean' ? { duration: 8 } : {}),
  hint: module === 'ocean' ? '預設無文字。可在物件工作室調整主角、動作、配色與透明背景；字幕可在文字面板開啟。' : '一行一句，~ 開頭為英文小字（最多 4 行）。形狀、材質、顏色請在物件工作室調整，或由 AI 透過 MCP 的 build_object_scene 產生',
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
  make('ocean', 'fish', { mode: 'fish' }, { no: 188, zh: "魚群穿梭", en: "School of Fish", desc: "有遠近層次的魚群，擺尾沿弧線、直線或環繞路線穿梭", tags: ['海底', '可疊影片', '療癒'], sample: [], motion: "魚群依遠近分層繪製，個體有條紋與腹部色塊，尾鰭各自擺動；沿弧線穿梭，可切直線或環繞，前景珊瑚輕擺。 全部硬邊，不用陰影、模糊、光暈；預設不顯示文字。", motionEn: "A layered school of striped fish swims along curved, straight or orbiting paths, with independently beating tails and swaying foreground coral. All hard-edged, without shadows, blur or glow. No text by default." }),
  make('ocean', 'dolphins', { mode: 'dolphins' }, { no: 189, zh: "海豚同行", en: "Dolphin Pod", desc: "一群海豚交錯游動，上下擺尾、輕輕翻身", tags: ['海底', '可疊影片', '療癒'], sample: [], motion: "一群有背鰭、長吻與水平尾鰭的海豚交錯前進，上下擺尾，腹背投影隨翻身微變；遠近大小形成景深。 全部硬邊，不用陰影、模糊、光暈；預設不顯示文字。", motionEn: "A pod of dolphins with dorsal fins, beaks and horizontal flukes swims in overlapping layers, undulating and subtly rolling. All hard-edged, without shadows, blur or glow. No text by default." }),
  make('ocean', 'whale', { mode: 'whale' }, { no: 190, zh: "巨鯨經過", en: "Whale Encounter", desc: "一隻巨鯨從遠處游近，龐大身軀掠過鏡頭", tags: ['海底', '可疊影片', '療癒'], sample: [], motion: "單一大鯨魚由遠而近、緩慢放大，腹部褶線與胸鰭清楚可見，巨大的身體超出畫框，再向另一側游離；尾部緩慢上下擺動。 全部硬邊，不用陰影、模糊、光暈；預設不顯示文字。", motionEn: "One massive whale approaches slowly from the distance, its ventral pleats and pectoral fin visible as its body grows beyond the frame and passes the camera. All hard-edged, without shadows, blur or glow. No text by default." }),
  make('ocean', 'shark', { mode: 'shark' }, { no: 191, zh: "鯊魚迎面衝刺", en: "Shark Rush", desc: "遠方巡游後迎面加速，張嘴衝近並擦身而過", tags: ['海底', '可疊影片', '衝擊'], sample: [], motion: "正面鯊魚先在遠方左右巡游，在設定時間後加速衝近、張嘴露出牙齒；結尾可選擦身而過或佔滿畫面，震動可關閉。 全部硬邊，不用陰影、模糊、光暈；預設不顯示文字。", motionEn: "A distant shark patrols, then accelerates toward the camera and opens its toothed mouth; choose a close pass or a frame-filling finish, with optional camera shake. All hard-edged, without shadows, blur or glow. No text by default." }),
  make('ocean', 'coral', { mode: 'coral' }, { no: 192, zh: "珊瑚花園", en: "Coral Garden", desc: "枝狀、扇狀珊瑚與海草形成分層花園", tags: ['海底', '可疊影片', '療癒'], sample: [], motion: "分叉的枝狀珊瑚、放射骨架的扇狀珊瑚與帶狀海草分布在海床前後層，各自隨水流輕擺，懸浮氣泡上升。 全部硬邊，不用陰影、模糊、光暈；預設不顯示文字。", motionEn: "Branching and fan-shaped corals with ribbon seaweed form a layered reef garden, gently swaying in the current beneath rising bubbles. All hard-edged, without shadows, blur or glow. No text by default." }),
  make('ocean', 'deep', { mode: 'deep' }, { no: 193, zh: "深海下潛", en: "Deep Sea Descent", desc: "海溝岩壁向上掠過，鏡頭持續向深海下潛", tags: ['海底', '可疊影片', '探索'], sample: [], motion: "鏡頭向下潛行，三層海溝岩壁以不同速度往上移，懸浮顆粒向上掠過，深藍海水逐漸變暗，遠處有巨鯨剪影。 全部硬邊，不用陰影、模糊、光暈；預設不顯示文字。", motionEn: "The camera descends through three parallax layers of trench walls and rising particles, the dark blue water deepening around a distant whale silhouette. All hard-edged, without shadows, blur or glow. No text by default." }),
  make('ocean', 'submarine', { mode: 'submarine' }, { no: 194, zh: "潛水艇探索", en: "Submarine Explorer", desc: "螺旋槳轉動、氣泡拖尾，探照燈掃描海底", tags: ['海底', '可疊影片', '探索'], sample: [], motion: "黃色潛水艇緩慢巡航與起伏，尾端螺旋槳轉動、氣泡向後上方散開，舷窗有硬邊反光；扇形探照燈緩慢掃過海底。 全部硬邊，不用陰影、模糊、光暈；預設不顯示文字。", motionEn: "A yellow submarine cruises and bobs with a spinning propeller, trailing bubbles, reflective portholes and a slowly sweeping hard-edged searchlight. All hard-edged, without shadows, blur or glow. No text by default." }),

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
  make('cosmos', 'sun', { mode: 'sun', y: 0.36, size: 0.34, layout: 'below', shoot: 0 }, { no: 185, zh: '太陽', en: 'The Sun', desc: '光芒旋轉、日冕跳動的太陽', tags: ['溫暖', '希望', '片頭'], sample: ['採光滿分'], motion: '星空中太陽以回彈放大登場：兩層長短交錯的橘黃三角光芒朝相反方向緩慢旋轉並微微伸縮，外圈是跳動的鋸齒日冕，表面顆粒隨自轉移動；文字在下方淡入。全部硬邊、無光暈。', motionEn: 'The sun springs in against the stars: two layers of alternating orange-yellow triangle rays rotate slowly in opposite directions and pulse, a jagged corona flickers around it and surface granules drift with its spin; text fades in below. All hard-edged, no glow.' }),
  make('cosmos', 'moon', { mode: 'moon', y: 0.36, size: 0.46, layout: 'below' }, { no: 186, zh: '月球', en: 'The Moon', desc: '坑洞與月海緩慢自轉的月球', tags: ['夜景', '療癒', '氛圍'], sample: ['夜晚很安靜'], motion: '星空中灰白色月球以回彈放大登場，表面月海色塊與帶亮邊的坑洞隨自轉從左往右移動，右下為實色背光面；流星偶爾劃過；文字在下方淡入。硬邊。', motionEn: 'A pale grey moon springs in against the stars; its maria and bright-rimmed craters roll left to right as it spins, with a flat shaded side at lower right; occasional shooting stars; text fades in below. Hard-edged.' }),
  make('cosmos', 'earth', { mode: 'earth', y: 0.36, size: 0.46, layout: 'below' }, { no: 187, zh: '地球', en: 'The Earth', desc: '大陸、雲層自轉，小月亮繞著地球跑', tags: ['科幻', '片頭', '格局'], sample: ['站上國際舞台'], motion: '星空中藍色地球以回彈放大登場，綠色大陸、白色冰帽與轉得較快的雲層隨自轉移動，外圈一道淺藍大氣層實色細邊，右下為背光面；一顆小月亮沿橢圓軌道繞行，後半圈被地球擋住；文字在下方淡入。全部硬邊。', motionEn: 'A blue earth springs in against the stars; green continents, white ice caps and faster-moving clouds roll with its spin, a thin solid light-blue atmosphere rims it and the lower right is shaded; a small moon orbits on an ellipse, hidden behind the earth on the far side; text fades in below. All hard-edged.' }),
  make('cosmos', 'flyby-earth', { mode: 'flyby', surface: 'earth' }, { no: 195, zh: '低空飛越地球', en: 'Earth Flyover', desc: '貼著地球表面飛，島嶼與雲層迎面掠過', tags: ['科幻', '片頭', '速度感'], sample: ['飛向新生活'], motion: '帶弧度的藍色地平線上方是幾道實色大氣層弧帶與星空；海面上的島嶼（沙灘、草地、山林）依透視從遠方迎面而來、越近越大，較低的白色雲層掠過得更快；文字在上方星空淡入。全部硬邊。', motionEn: 'Above a curved blue horizon sit solid atmosphere bands and stars; islands of sand, grass and forest rush toward the camera in perspective, growing as they near, while a lower layer of white clouds sweeps past faster; text fades in above in the starfield. All hard-edged.' }),
  make('cosmos', 'flyby-moon', { mode: 'flyby', surface: 'moon' }, { no: 196, zh: '低空飛越月球', en: 'Moon Flyover', desc: '掠過月球表面的隕石坑，天邊掛著地球', tags: ['科幻', '片頭', '氛圍'], sample: ['探索新區域'], motion: '灰色月面的弧形地平線上方是黑色星空與一顆小地球；帶亮邊的隕石坑與岩塊依透視從遠方迎面而來；文字在上方淡入。全部硬邊、無光暈。', motionEn: 'Over the curved grey lunar horizon hang a black starry sky and a small earth; bright-rimmed craters and boulders approach in perspective; text fades in above. All hard-edged, no glow.' }),
  make('cosmos', 'flyby-mars', { mode: 'flyby', surface: 'mars' }, { no: 197, zh: '低空飛越火星', en: 'Mars Flyover', desc: '橘紅色火星地表與飛沙一路後退', tags: ['科幻', '速度感', '冒險'], sample: ['開拓新版圖'], motion: '橘紅色火星地平線上方是粉橘到深紫的實色大氣弧帶；隕石坑與岩塊依透視迎面而來，細短的飛沙線往後掠；文字在上方淡入。硬邊。', motionEn: 'Above the rust-red Martian horizon run solid bands from peach to deep purple; craters and rocks approach in perspective as short streaks of dust whip past; text fades in above. Hard-edged.' }),
  make('cosmos', 'flyby-sun', { mode: 'flyby', surface: 'sun' }, { no: 198, zh: '低空飛越太陽', en: 'Sun Flyover', desc: '貼著太陽表面飛，日珥在地平線拱起', tags: ['科幻', '熱血', '片頭'], sample: ['熱度破表'], motion: '橘黃色太陽表面的弧形地平線上方有幾道會伸縮的實色日珥拱弧；表面的亮暗顆粒依透視迎面而來；文字在上方淡入。全部硬邊、無光暈。', motionEn: 'Solid prominence arches pulse above the curved orange horizon of the sun while bright and dark surface granules rush toward the camera in perspective; text fades in above. All hard-edged, no glow.' }),
  make('cosmos', 'zoom-earth', { mode: 'earth', y: 0.42, size: 0.3, cam: 'in', camz: 3, layout: 'over' }, { no: 199, zh: '推近地球', en: 'Zoom Into Earth', desc: '鏡頭從太空一路推近，地球越變越大', tags: ['片頭', '科幻', '轉場'], sample: ['從世界看見這裡'], motion: '星空中地球自轉並有小月亮繞行，鏡頭緩慢推近約三倍，地球放大到幾乎佔滿畫面，背景星星微微向外擴散；文字疊在地球上淡入。全部硬邊。', motionEn: 'The spinning earth with its orbiting moon sits in a starfield as the camera slowly pushes in about three times until it nearly fills the frame, background stars spreading slightly outward; text fades in over it. All hard-edged.' }),
  make('aerial', 'city', {}, { no: 170, zh: '俯瞰城市', en: 'Aerial City', desc: '空拍視角滑過街廓，車流在路上移動', tags: ['空拍', '區位', '片頭'], sample: ['從空中看這一區'], motion: '正上方俯瞰的城市：灰色道路切出街廓，街廓裡是不同高度的實色屋頂與陰影面，路上小車沿車道移動；鏡頭沿斜角緩慢平移並微微推近；文字疊在畫面中央淡入。全部硬邊。', motionEn: 'A top-down city: grey roads cut blocks filled with flat rooftops of different heights with offset shadow faces, tiny cars travel along lanes; the camera pans diagonally and pushes in slightly; text fades in over the center. All hard-edged.' }),
  make('aerial', 'river', { mode: 'river' }, { no: 171, zh: '俯瞰河流', en: 'Aerial River', desc: '蜿蜒河道穿過綠地，河面有流動波紋', tags: ['空拍', '療癒', '區位'], sample: ['河岸第一排'], motion: '俯瞰蜿蜒的河流，河道兩側是實色河岸與綠地、樹叢，河面短波紋沿水流方向移動，橋樑跨越河面；鏡頭沿河緩慢平移；文字疊在畫面上淡入。硬邊。', motionEn: 'A winding river seen from above, with solid banks, green land and tree clusters; short ripples drift downstream and a bridge spans the water; the camera pans along the river; text fades in over it. Hard-edged.' }),
  make('aerial', 'mountain', { mode: 'mountain' }, { no: 172, zh: '俯瞰山川', en: 'Aerial Mountains', desc: '等高線分層的山頭，山谷間有溪流', tags: ['空拍', '氛圍', '自然'], sample: ['山景第一排'], motion: '俯瞰群山：每座山由多層實色等高線色塊疊成，越高越淺、山頂留白，半透明雲朵飄過山腰；鏡頭緩慢平移推近；文字疊在畫面上淡入。全部硬邊。', motionEn: 'Mountains from above, each built from stacked flat contour bands that lighten toward a pale peak, with translucent clouds drifting over the slopes; the camera pans and pushes in slowly; text fades in. All hard-edged.' }),
  make('aerial', 'grass', { mode: 'grass' }, { no: 173, zh: '草原牛馬', en: 'Grazing Herd', desc: '空拍大草原，牛馬群邊吃草邊走', tags: ['空拍', '療癒', '可愛'], sample: ['慢活生活圈'], motion: '俯瞰草原，草地有深淺色塊與小路，一群俯視角的牛、馬（實色橢圓身體加頭部）緩慢移動並低頭吃草，偶爾有樹叢；鏡頭緩慢平移；文字疊在畫面上淡入。硬邊。', motionEn: 'A meadow from above with patches of light and dark grass and a dirt path; a herd of top-down cows and horses (flat oval bodies with heads) wanders slowly and dips to graze among a few tree clumps; the camera pans slowly; text fades in. Hard-edged.' }),
  make('aerial', 'farm', { mode: 'farm' }, { no: 174, zh: '俯瞰農田', en: 'Aerial Farmland', desc: '拼布般的田地與田埂，農路有車經過', tags: ['空拍', '區位', '自然'], sample: ['重劃前的樣子'], motion: '俯瞰農田：大小不一、略微旋轉的矩形田塊（稻田、黃色作物、休耕地）各有條紋，田埂與農路分隔，農路上偶有小車；鏡頭緩慢平移；文字疊在畫面上淡入。硬邊。', motionEn: 'Farmland from above: slightly rotated rectangular plots of rice, yellow crops and fallow soil, each striped, divided by ridges and farm roads with an occasional small vehicle; the camera pans slowly; text fades in. Hard-edged.' }),
  make('aerial', 'coast', { mode: 'coast' }, { no: 175, zh: '俯瞰海岸', en: 'Aerial Coastline', desc: '沙灘、浪花與海水分層，浪一波波打上岸', tags: ['空拍', '療癒', '夏天'], sample: ['看海的家'], motion: '俯瞰海岸線：沙灘上散落彩色海灘傘，淺海與深海兩層實色帶，白色浪花線一波波向岸推進再退回；鏡頭沿海岸緩慢平移；文字疊在畫面上淡入。硬邊。', motionEn: 'A coastline from above: colorful beach umbrellas dot the sand, shallow and deep water form two flat bands, white surf lines roll in and retreat; the camera pans along the shore; text fades in. Hard-edged.' }),
  make('aerial', 'forest', { mode: 'forest' }, { no: 176, zh: '俯瞰森林', en: 'Aerial Forest', desc: '密密的樹冠由上往下看，一條小路穿過', tags: ['空拍', '療癒', '自然'], sample: ['被綠意包圍'], motion: '俯瞰森林，密集的圓形樹冠由幾層深淺綠色疊成並微微晃動，一條小路穿越林間；鏡頭緩慢平移推近；文字疊在畫面上淡入。硬邊。', motionEn: 'A forest from above: dense round canopies built from layered greens sway slightly, a narrow trail cuts through; the camera pans and pushes in; text fades in. Hard-edged.' }),
  make('aerial', 'highway', { mode: 'highway' }, { no: 177, zh: '俯瞰交流道', en: 'Aerial Interchange', desc: '高速公路與匝道環繞，車流不停', tags: ['空拍', '區位', '交通'], sample: ['5 分鐘上交流道'], motion: '俯瞰高速公路交流道：主線多車道直線穿過，環形匝道繞出接平面道路，車輛沿各車道持續移動；鏡頭緩慢平移；文字疊在畫面上淡入。硬邊。', motionEn: 'A highway interchange from above: a multi-lane mainline runs straight through while loop ramps curl off to surface roads, cars flow continuously on every lane; the camera pans slowly; text fades in. Hard-edged.' }),
  make('vehicle', 'car', {}, { no: 178, zh: '開車上路', en: 'Driving Car', desc: '側面的小車在路上前進，路樹往後退', tags: ['交通', '通勤', '可愛'], sample: ['開車 10 分鐘'], motion: '扁平插畫風的側面小車在道路上行駛，車身微微上下彈跳、輪子轉動，路面虛線與路樹、遠方建築以不同速度往後移動；文字在下方淡入。全部硬邊。', motionEn: 'A flat side-view car drives along a road, bouncing slightly with spinning wheels, while lane dashes, roadside trees and distant buildings scroll back at different speeds; text fades in below. All hard-edged.' }),
  make('vehicle', 'carriage', { mode: 'carriage', color: '#c0392b', color2: '#f4d03f' }, { no: 179, zh: '馬車', en: 'Horse Carriage', desc: '奔跑的馬拉著馬車，童話感十足', tags: ['可愛', '復古', '奇幻'], sample: ['入厝囉'], motion: '側面的馬匹四腿交替奔跑、頭部擺動，拉著有大輪子與車廂頂的馬車前進，背景路樹往後移；文字在下方淡入。扁平硬邊。', motionEn: 'A side-view horse gallops with alternating legs and a bobbing head, pulling a carriage with big wheels and a domed roof while trees scroll back; text fades in below. Flat and hard-edged.' }),
  make('vehicle', 'plane', { mode: 'plane', color: '#ffffff', color2: '#2b6cb0' }, { no: 180, zh: '飛機', en: 'Airplane', desc: '客機穿過雲層，後面拉出凝結尾', tags: ['交通', '旅行', '片頭'], sample: ['機場捷運直達'], motion: '天空中側面客機緩慢上下浮動，身後拉出實色凝結尾，扁平雲朵以不同速度往後飄；文字在下方淡入。全部硬邊。', motionEn: 'A side-view airliner floats gently in the sky trailing a solid contrail as flat clouds drift back at different speeds; text fades in below. All hard-edged.' }),
  make('vehicle', 'rocket', { mode: 'rocket', color: '#eef1f6', color2: '#e74c3c' }, { no: 181, zh: '太空船', en: 'Spaceship', desc: '火箭噴著火焰穿越星空', tags: ['科幻', '速度感', '片頭'], sample: ['起飛'], motion: '深色星空中，太空船斜向前進並微微震動，尾部噴出多層實色火焰忽長忽短，星點往後拉成短線；文字在下方淡入。硬邊、無光暈。', motionEn: 'In a dark starfield a spaceship pushes forward at an angle with a slight shake, its multi-layer solid flame flickering in length, stars streaking back as short lines; text fades in below. Hard-edged, no glow.' }),
  make('vehicle', 'train', { mode: 'train', color: '#2e86de', color2: '#ffffff' }, { no: 182, zh: '火車捷運', en: 'Train', desc: '三節車廂沿軌道駛過，窗戶一格格', tags: ['交通', '通勤', '捷運'], sample: ['捷運站就在旁邊'], motion: '側面三節列車沿軌道行駛，車廂有整排窗戶與腰帶色條，軌道枕木與背景建築往後移動；文字在下方淡入。扁平硬邊。', motionEn: 'A three-car side-view train runs along the track, each car with a row of windows and a stripe, while sleepers and background buildings scroll back; text fades in below. Flat and hard-edged.' }),
  make('vehicle', 'ship', { mode: 'ship', color: '#ffffff', color2: '#e74c3c' }, { no: 183, zh: '輪船', en: 'Ship', desc: '輪船在海浪上起伏，煙囪冒煙', tags: ['交通', '旅行', '療癒'], sample: ['啟航'], motion: '側面輪船隨海浪上下起伏並微微擺動，煙囪冒出一顆顆實色煙團往後飄，前景浪線往後捲動；文字在下方淡入。硬邊。', motionEn: 'A side-view ship rises and rocks on the waves, its funnel puffing solid smoke balls that drift back while foreground wave lines scroll; text fades in below. Hard-edged.' }),
  make('vehicle', 'balloon', { mode: 'balloon', color: '#ff7a45', color2: '#ffd166' }, { no: 184, zh: '熱氣球', en: 'Hot-air Balloon', desc: '條紋熱氣球緩緩升空，雲朵往下飄', tags: ['療癒', '旅行', '夢想'], sample: ['夢想成家'], motion: '條紋熱氣球帶著吊籃緩慢上升並左右輕擺，雲朵往下飄過；文字在下方淡入。扁平硬邊。', motionEn: 'A striped hot-air balloon with its basket rises slowly, swaying side to side as clouds drift down past it; text fades in below. Flat and hard-edged.' }),
];
