import type { Fx } from '../types';
import { blobPath, esc, lobes, pick, rand, range, rep } from '../util';
import { buildMapScene, type MScene } from '../mapkit';

/** words 裡第一個以 { 開頭的字串視為場景 JSON；沒有就用鳥瞰範本 */
export const sceneFromWords = (w: string[]): MScene => {
  const j = w.find((x) => String(x).trim().startsWith('{'));
  if (j) {
    try {
      return JSON.parse(j) as MScene;
    } catch {
      /* 格式錯誤時退回範本 */
    }
  }
  return buildMapScene({ tag: w[0] && !w[0].startsWith('{') ? w[0] : undefined });
};

/* ───────── 共用：風格化底圖（1600×900） ───────── */
const W = 1600;
const H = 900;

/** 地圖配色全部由特效色票推導，換配色時底圖一起變 */
const MAP_CSS = `
.S{--land:color-mix(in srgb,var(--bg) 93%,var(--fg));--rd:color-mix(in srgb,var(--bg) 84%,var(--fg));--rd2:color-mix(in srgb,var(--bg) 72%,var(--fg));--water:color-mix(in srgb,#4f9fe0 38%,var(--bg));--park:color-mix(in srgb,#5fbf6a 24%,var(--bg));--chip:var(--fg);--chipT:var(--bg)}
.S svg.map{position:absolute;inset:0;width:100%;height:100%;font-family:var(--sans);font-weight:900}
.S .land{fill:var(--land)}.S .pk{fill:var(--park)}.S .rv{fill:none;stroke:var(--water);stroke-width:64;stroke-linecap:round}
.S .rd{stroke:var(--rd);stroke-width:5}.S .rd2{fill:none;stroke:var(--rd2);stroke-width:16;stroke-linecap:round}
.S .chip rect{fill:var(--chip)}.S .chip text{fill:var(--chipT);dominant-baseline:central;text-anchor:middle}
.S .chip.ac rect{fill:var(--ac)}.S .chip.ac text{fill:#111}
.S .pin path{fill:var(--ac)}.S .pin circle{fill:#fff}
.S .fb{transform-box:fill-box;transform-origin:center}`;

const base = (dim = false) => {
  const grid = [
    ...range(26).map((i) => `<line class="rd" x1="${-500 + i * 100}" y1="-500" x2="${-500 + i * 100}" y2="1400"/>`),
    ...range(20).map((i) => `<line class="rd" x1="-500" y1="${-500 + i * 100}" x2="2100" y2="${-500 + i * 100}"/>`),
  ].join('');
  const parks = [
    [180, 140, 220, 150],
    [1120, 600, 260, 170],
    [620, 90, 150, 120],
    [1380, 90, 170, 200],
  ]
    .map(([x, y, w, h]) => `<rect class="pk" x="${x}" y="${y}" width="${w}" height="${h}" rx="26"/>`)
    .join('');
  return `<g${dim ? ' opacity=".55"' : ''}><rect class="land" width="${W}" height="${H}"/>${parks}<g transform="rotate(-12 800 450)">${grid}</g>
<path class="rv" d="M-60 660 C 300 560, 520 790, 840 720 S 1320 520, 1700 610"/>
<path class="rd2" d="M-40 420 L1640 300"/><path class="rd2" d="M520 -40 L640 940"/><path class="rd2" d="M1080 -40 C 1020 300, 1180 600, 1130 940"/><path class="rd2" d="M-40 860 L760 120"/></g>`;
};

/** 估算文字寬度：全形字一個字寬，其他約 0.6 */
const textW = (s: string, fs: number) => Array.from(s).reduce((a, ch) => a + (/[⺀-￿]/.test(ch) ? fs : fs * 0.6), 0);

/** 圓角標籤；anchor：中心點 */
const chip = (x: number, y: number, text: string, size = 34, cls = '', extra = '') => {
  const fs = Math.round(size * 1.3);
  const w = textW(text, fs) + fs * 1.1;
  const h = fs * 1.7;
  return `<g transform="translate(${x} ${y})"><g class="chip fb ${cls}"${extra}><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}"/><text font-size="${fs}">${esc(text)}</text></g></g>`;
};

/** 定位針，尖端在 (0,0) */
const PIN = `<g transform="scale(1.6)"><path d="M0 0 C-12-20-36-36-36-62 A36 36 0 1 1 36-62 C36-36 12-20 0 0Z"/><circle cy="-62" r="14"/></g>`;

const svg = (inner: string) => `<svg class="map" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

const EMOJI: [RegExp, string][] = [
  [/學|校|幼/, '🏫'],
  [/公園|綠|河濱/, '🌳'],
  [/超市|量販|賣場|市場/, '🛒'],
  [/捷運|車站|火車|高鐵|機場捷運/, '🚇'],
  [/醫|診/, '🏥'],
  [/餐|食|美食/, '🍜'],
  [/銀行|郵局/, '🏦'],
  [/公車|轉運/, '🚌'],
  [/商場|百貨|商圈/, '🛍️'],
  [/運動|球場|健身/, '🏀'],
];
const emojiFor = (s: string) => EMOJI.find(([r]) => r.test(s))?.[1] ?? '📍';
const split = (s: string) => (s.includes('｜') ? s.split('｜') : s.includes('|') ? s.split('|') : [s, '']);

export const map: Fx[] = [
  {
    id: 'map-overlay',
    no: 136,
    cat: 'map',
    zh: '地圖疊加場景',
    en: 'Map Overlay Scene',
    desc: '基地框、路名、資訊卡依序進場，可換成自己的底圖',
    tags: ['建案', '區位', 'Shorts'],
    tone: 'paper',
    sample: [],
    hint: '在地圖工作室編輯後加入 Combo；或由 AI 透過 MCP 的 build_map_scene 產生',
    motion: '在地圖底圖上依序進場：左上深色膠囊標題籤（含黃點）滑入、指北針旋轉出現、黃色粗框沿基地邊界描繪後填入半透明黃色、黃底黑字基地標籤彈出、深色膠囊道路名依序彈出（南北向道路直排）、下方深色半透明資訊卡帶左側黃條由下滑入、文字黃白交錯逐行出現；全部硬邊，不使用陰影或模糊。',
    motionEn: 'Elements enter over a map base in sequence: a dark pill title tag with a yellow dot slides in at top left, a compass spins in, a thick yellow outline traces the site boundary then fills with translucent yellow, a yellow site label pops, dark pill street names pop one by one (north–south streets set vertically), and a translucent dark info card with a yellow side bar slides up as alternating yellow and white lines appear; all hard-edged, with no shadows or blur.',
    css: `${MAP_CSS}
.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    html: (w) => `${svg(base(true))}<canvas data-scene="${esc(JSON.stringify(sceneFromWords(w)))}"></canvas>`,
    engine: 'map',
    run: (root) => {
      const R = (globalThis as unknown as { MA_MAP: { drawScene: (...a: unknown[]) => unknown } }).MA_MAP;
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      let sc: { loop: number; bgUrl?: string };
      try {
        sc = JSON.parse(cv.dataset.scene || '{}');
      } catch {
        return;
      }
      let img: HTMLImageElement | undefined;
      if (sc.bgUrl) {
        const im = new Image();
        im.onload = () => (img = im);
        im.src = sc.bgUrl;
      }
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const FS = getComputedStyle(root).getPropertyValue('--sans').trim();
      const t0 = performance.now();
      const loop = Math.max(2, sc.loop || 6) + ((sc as { descend?: number }).descend || 0) + 1.5;
      let raf = 0;
      const f = (now: number) => {
        raf = requestAnimationFrame(f);
        R.drawScene(ctx, W, H, sc, ((globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE ? Math.min((now - t0) / 1000, loop - 0.001) : (now - t0) / 1000 % loop), img, FS);
      };
      raf = requestAnimationFrame(f);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    id: 'map-routes',
    no: 137,
    cat: 'map',
    zh: '放射路線',
    en: 'Radiating Routes',
    desc: '從一個起點拉出多條帶箭頭的路線，指向不同目的地',
    tags: ['交通', '區位', 'Shorts'],
    tone: 'paper',
    sample: ['某某建案', '南港|開車約 ○ 分鐘', '內湖|開車約 ○ 分鐘', '台北車站|開車約 ○ 分鐘'],
    hint: '第一行是起點，之後每行一個目的地：名稱|附註|#色碼（附註、色碼可省略）。要調位置請用地圖工作室',
    motion: '起點是一個帶白框的實心圓點與深色膠囊名稱，周圍有一圈硬邊圓環向外擴散；接著依序從起點拉出多條略帶弧度的粗線（白色外框＋各自的顏色），線頭是實心三角箭頭，畫到目的地後，箭頭前方彈出同色膠囊目的地名稱，下方附一行深色小字附註。全部硬邊，不使用陰影或模糊。',
    motionEn: 'The origin is a solid dot with a white ring and a dark pill name, with a hard-edged ring pulsing outward; then several gently curved thick lines (white casing plus their own colors) draw out from it one by one, each led by a solid triangular arrowhead; on arrival a pill in the same color pops up ahead of the arrow with the destination name and a small dark note below. All hard-edged, with no shadows or blur.',
    css: `${MAP_CSS}
.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    html: (w) => {
      const j = w.find((x) => String(x).trim().startsWith('{'));
      const sc = j
        ? sceneFromWords(w)
        : buildMapScene({
            template: 'routes',
            ratio: '16:9',
            tag: '',
            subtitle: '',
            credit: '',
            routes: {
              origin: w[0] ?? '某某建案',
              x: 0.45,
              y: 0.68,
              destinations: (w.length > 1 ? w.slice(1) : ['南港', '內湖', '台北車站']).slice(0, 6).map((l, i) => {
                const [name, note, color] = String(l).split('|');
                const spot = [[0.78, 0.3], [0.56, 0.2], [0.2, 0.3], [0.85, 0.62], [0.12, 0.62], [0.36, 0.18]][i];
                return { name, note, color, x: spot[0], y: spot[1] };
              }),
            },
          });
      return `${svg(base(true))}<canvas data-scene="${esc(JSON.stringify(sc))}"></canvas>`;
    },
    engine: 'map',
    run: (root) => {
      const R = (globalThis as unknown as { MA_MAP: { drawScene: (...a: unknown[]) => unknown } }).MA_MAP;
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      let sc: { loop: number; bgUrl?: string };
      try {
        sc = JSON.parse(cv.dataset.scene || '{}');
      } catch {
        return;
      }
      let img: HTMLImageElement | undefined;
      if (sc.bgUrl) {
        const im = new Image();
        im.onload = () => (img = im);
        im.src = sc.bgUrl;
      }
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const FS = getComputedStyle(root).getPropertyValue('--sans').trim();
      const t0 = performance.now();
      const loop = Math.max(2, sc.loop || 6) + ((sc as { descend?: number }).descend || 0) + 1.5;
      let raf = 0;
      const f = (now: number) => {
        raf = requestAnimationFrame(f);
        R.drawScene(ctx, W, H, sc, ((globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE ? Math.min((now - t0) / 1000, loop - 0.001) : (now - t0) / 1000 % loop), img, FS);
      };
      raf = requestAnimationFrame(f);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    id: 'map-pin-drop',
    no: 138,
    cat: 'map',
    zh: '地圖定位',
    en: 'Map Pin Drop',
    desc: '定位針落在地圖上，彈出地點資訊卡',
    tags: ['地點', '建案'],
    tone: 'paper',
    sample: ['建案基地', '捷運站旁 · 步行 3 分鐘'],
    hint: '地點名稱 / 補充說明',
    motion: '風格化平面地圖（道路網、河流、綠地）上，一支主色定位針從上方落下並回彈，落地處擴散兩圈漣漪；接著右側資訊卡由左向右展開，大字地點名稱、下方一行小字說明；停留後依序收回。',
    motionEn: 'On a stylized flat map (road grid, river, parks), an accent location pin drops from above with a bounce, sending two ripples outward on landing; an info card then unfolds to its right with the place name in large type and a small note beneath; after a hold everything retracts in order.',
    css: `${MAP_CSS}
.S .pin{animation:K_drop 5s cubic-bezier(.5,0,.5,1.5) infinite both}
.S .rip{fill:none;stroke:var(--ac);stroke-width:5;animation:K_rip 5s ease-out infinite both}
.S .rip+.rip{animation-delay:.25s}
.S .card{transform-origin:left center;animation:K_card 5s cubic-bezier(.2,.9,.2,1) infinite both}
.S .card rect{fill:var(--fg)}.S .card .t1{fill:var(--bg);font-size:54px}.S .card .t2{fill:color-mix(in srgb,var(--bg) 70%,var(--fg));font-size:28px;font-weight:500}
.S .stem{stroke:var(--fg);stroke-width:4;stroke-dasharray:6 8;animation:K_card 5s cubic-bezier(.2,.9,.2,1) infinite both}
@keyframes K_drop{0%{transform:translateY(-760px);opacity:1}16%,86%{transform:none;opacity:1}96%,100%{transform:translateY(-40px);opacity:0}}
@keyframes K_rip{0%,15%{transform:scale(.1);opacity:0}18%{opacity:1}42%,100%{transform:scale(2.6);opacity:0}}
@keyframes K_card{0%,22%{transform:scaleX(0);opacity:0}32%,82%{transform:none;opacity:1}92%,100%{transform:scaleX(0);opacity:0}}`,
    html: (w) => {
      const [a, b] = pick(w, 2, ['建案基地', '捷運站旁 · 步行 3 分鐘']);
      const cw = Math.max(textW(a, 54), textW(b, 28)) + 80;
      return svg(
        `${base()}<g transform="translate(720 540)"><ellipse class="rip fb" rx="70" ry="22"/><ellipse class="rip fb" rx="70" ry="22"/><g class="pin">${PIN}</g></g>
<line class="stem fb" x1="760" y1="470" x2="820" y2="400"/>
<g transform="translate(820 330)"><g class="card fb"><rect width="${cw}" height="150" rx="22"/><text class="t1" x="40" y="70">${esc(a)}</text><text class="t2" x="40" y="118">${esc(b)}</text></g></g>`,
      );
    },
  },
  {
    id: 'map-route',
    no: 139,
    cat: 'map',
    zh: '路線繪製',
    en: 'Route Draw',
    desc: '路線從起點畫到終點，小圓點沿路前進',
    tags: ['通勤', '路線'],
    tone: 'paper',
    sample: ['家', '公司', '通勤 25 分鐘'],
    hint: '起點 / 終點 / 時間或距離',
    motion: '平面地圖上，主色粗線沿著道路轉折從起點一路畫到終點（帶白色外框），一顆小圓點同步沿路前進；到達後終點定位針彈出、起終點標籤出現，路線中段浮出時間標籤；停留後整條路線淡出重來。',
    motionEn: 'On a flat map, a thick accent line with a white casing draws along the roads from start to destination while a small dot travels with it; on arrival a pin pops at the destination, start and end labels appear, and a travel-time tag floats up mid-route; after a hold the route fades and restarts.',
    css: `${MAP_CSS}
.S .casing{fill:none;stroke:#fff;stroke-width:30;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:K_d 5s linear infinite}
.S .route{fill:none;stroke:var(--ac);stroke-width:16;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:K_d 5s linear infinite}
.S .dot{fill:#fff;stroke:var(--ac);stroke-width:7}
.S .o{fill:var(--fg)}.S .o2{fill:#fff}
.S .endpin{animation:K_pop 5s cubic-bezier(.3,1.7,.5,1) infinite both}
.S .lab{animation:K_pop 5s cubic-bezier(.3,1.7,.5,1) infinite both}
.S .lab.s{animation-name:K_pop0}
@keyframes K_d{0%{stroke-dashoffset:1;opacity:1}55%{stroke-dashoffset:0}88%{stroke-dashoffset:0;opacity:1}98%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes K_pop{0%,54%{transform:scale(0)}62%,88%{transform:none;opacity:1}98%,100%{transform:none;opacity:0}}
@keyframes K_pop0{0%{transform:scale(0)}8%,88%{transform:none;opacity:1}98%,100%{opacity:0}}`,
    html: (w) => {
      const [a, b, t] = pick(w, 3, ['家', '公司', '通勤 25 分鐘']);
      const d = 'M240 720 L240 590 Q240 545 285 545 L640 545 Q690 545 715 505 L905 300 Q935 268 980 268 L1300 268 Q1345 268 1345 223 L1345 190';
      return svg(
        `${base()}<path class="casing" pathLength="1" d="${d}"/><path class="route" pathLength="1" d="${d}"/>
<circle class="dot" r="15"><animateMotion dur="5s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.55;1" calcMode="linear" path="${d}"/></circle>
<circle class="o" cx="240" cy="720" r="20"/><circle class="o2" cx="240" cy="720" r="8"/>
<g transform="translate(1345 200)"><g class="endpin fb">${PIN}</g></g>
${chip(240, 790, a, 34, 'lab s')}${chip(1345, 50, b, 34, 'lab')}${chip(810, 420, t, 40, 'ac lab')}`,
      );
    },
  },
  {
    id: 'map-radius',
    no: 140,
    cat: 'map',
    zh: '生活圈半徑',
    en: 'Radius Rings',
    desc: '以基地為圓心，一圈圈畫出生活圈範圍',
    tags: ['生活圈', '建案'],
    tone: 'ink',
    sample: ['基地', '500m', '1km', '2km'],
    hint: '中心名稱 / 三個半徑標籤',
    motion: '暗色地圖中央是主色定位點，三個同心圓由內而外依序展開（半透明主色填色＋虛線外框），每圈頂端彈出距離標籤；範圍內的生活機能小點隨機亮起；中心點持續脈動，停留後全部收回。',
    motionEn: 'At the center of a dark map sits an accent location dot; three concentric circles expand outward in sequence (translucent accent fill with dashed outline), each popping a distance label at its top; small amenity dots light up within range; the center keeps pulsing, then everything retracts after a hold.',
    css: `${MAP_CSS}
.S .ring{fill:color-mix(in srgb,var(--ac) 9%,transparent);stroke:var(--ac);stroke-width:4;stroke-dasharray:14 12;animation:K_r 6s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(var(--i)*.35s)}
.S .rl{animation:K_l 6s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:calc(var(--i)*.35s + .4s)}
.S .core{fill:var(--ac)}.S .pulse{fill:var(--ac);animation:K_p 1.6s ease-out infinite}
.S .poi{fill:var(--fg);animation:K_l 6s ease infinite both;animation-delay:calc(1.2s + var(--i)*.06s)}
.S .cl{animation:K_l 6s cubic-bezier(.3,1.7,.5,1) infinite both}
@keyframes K_r{0%{transform:scale(0);opacity:0}14%,84%{transform:none;opacity:1}96%,100%{transform:scale(.6);opacity:0}}
@keyframes K_l{0%{transform:scale(0)}10%,84%{transform:none;opacity:1}94%,100%{transform:scale(0);opacity:0}}
@keyframes K_p{0%{transform:scale(1);opacity:.6}100%{transform:scale(4);opacity:0}}`,
    html: (w) => {
      const [c, r1, r2, r3] = pick(w, 4, ['基地', '500m', '1km', '2km']);
      const R = [150, 270, 390];
      const pois = rep(26, (i) => {
        const a = rand(i + 3) * Math.PI * 2;
        const d = 60 + rand(i + 9) * 340;
        return `<circle class="poi fb" style="--i:${i}" cx="${(800 + Math.cos(a) * d).toFixed(0)}" cy="${(450 + Math.sin(a) * d * 0.98).toFixed(0)}" r="7"/>`;
      });
      return svg(
        `${base(true)}${R.map((r, i) => `<circle class="ring fb" style="--i:${i}" cx="800" cy="450" r="${r}"/>`).reverse().join('')}${pois}
<circle class="pulse fb" cx="800" cy="450" r="18"/><circle class="core" cx="800" cy="450" r="18"/>
${[r1, r2, r3].map((t, i) => chip(800, 450 - R[i], t, 30, 'ac rl', ` style="--i:${i}"`)).join('')}${chip(800, 520, c, 34, 'cl')}`,
      );
    },
  },
  {
    id: 'map-zoom',
    no: 141,
    cat: 'map',
    zh: '地圖推進',
    en: 'Map Zoom In',
    desc: '從整個城市一路推近到目標區域',
    tags: ['開場', '區位'],
    tone: 'paper',
    sample: ['新北市', '某某區', '重劃區'],
    hint: '三層地名，由大到小',
    motion: '地圖從城市全景開始，目標位置有主色方框標示；鏡頭分兩段推近（約 2.2 倍、再到 5 倍），每一段左上角的地名標籤跟著切換（城市 → 行政區 → 重劃區），方框與定位點保持固定線寬；最後拉回全景循環。',
    motionEn: 'The map starts at a city-wide view with an accent box marking the target; the camera zooms in two stages (about 2.2x, then 5x), and the place-name tag at top left switches with each stage (city → district → neighborhood) while the box and pin keep a constant stroke width; finally it pulls back to the wide view and loops.',
    css: `${MAP_CSS}
.S .world{animation:K_z 7s cubic-bezier(.65,0,.35,1) infinite}
.S .box{fill:color-mix(in srgb,var(--ac) 14%,transparent);stroke:var(--ac);stroke-width:4;vector-effect:non-scaling-stroke}
.S .tgt{fill:var(--ac);stroke:#fff;stroke-width:3;vector-effect:non-scaling-stroke}
.S .lv{position:absolute;left:5cqw;top:6cqh;display:grid}
.S .lv span{grid-area:1/1;font-size:min(5cqw,8cqh);background:var(--fg);color:var(--bg);padding:.25em .6em;border-radius:.5em;opacity:0;animation:7s infinite both}
.S .lv span:nth-child(1){animation-name:K_t1}.S .lv span:nth-child(2){animation-name:K_t2}.S .lv span:nth-child(3){animation-name:K_t3;background:var(--ac);color:#111}
@keyframes K_z{0%,18%{transform:none}38%,52%{transform:translate(-1400px,-386px) scale(2.2)}72%,88%{transform:translate(-4200px,-1450px) scale(5)}100%{transform:none}}
@keyframes K_t1{0%,24%{opacity:1}30%,96%{opacity:0}100%{opacity:1}}
@keyframes K_t2{0%,28%{opacity:0}34%,56%{opacity:1}62%,100%{opacity:0}}
@keyframes K_t3{0%,62%{opacity:0}68%,90%{opacity:1}96%,100%{opacity:0}}`,
    html: (w) => {
      const [a, b, c] = pick(w, 3, ['新北市', '某某區', '重劃區']);
      return `${svg(`<g class="world">${base()}<rect class="box" x="900" y="320" width="200" height="120" rx="8"/><rect class="box" x="975" y="360" width="50" height="40" rx="4"/><circle class="tgt" cx="1000" cy="380" r="6"/></g>`)}<div class="lv"><span>${esc(a)}</span><span>${esc(b)}</span><span>${esc(c)}</span></div>`;
    },
  },
  {
    id: 'map-district',
    no: 142,
    cat: 'map',
    zh: '區域框選',
    en: 'District Highlight',
    desc: '畫出區域邊界，範圍外變暗、範圍內填上斜線',
    tags: ['重劃區', '範圍'],
    tone: 'paper',
    sample: ['重劃區範圍', '約 100 公頃【範例】'],
    hint: '區域名稱 / 補充說明',
    motion: '地圖上一條主色粗線沿著不規則邊界描繪出區域範圍（約 1.5 秒），接著範圍外的地圖變暗、範圍內填上主色斜線網紋，區域中心彈出名稱標籤與一行補充說明；停留後反向收回。',
    motionEn: 'A thick accent line traces an irregular district boundary on the map (about 1.5s); then everything outside dims, the inside fills with an accent hatch pattern, and a name tag with a one-line note pops at the district center; after a hold it reverses.',
    css: `${MAP_CSS}
.S .edge{fill:none;stroke:var(--ac);stroke-width:9;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:K_e 6s ease-in-out infinite}
.S .fill{fill:url(#mdh);animation:K_f 6s ease infinite}
.S .dim{fill:#000;fill-rule:evenodd;animation:K_dm 6s ease infinite}
.S .hl{stroke:var(--ac);stroke-width:5;opacity:.45}
.S .hb{fill:color-mix(in srgb,var(--ac) 12%,transparent)}
.S .lab{animation:K_l 6s cubic-bezier(.3,1.7,.5,1) infinite both}
@keyframes K_e{0%{stroke-dashoffset:1}28%,86%{stroke-dashoffset:0;opacity:1}98%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes K_f{0%,26%{opacity:0}38%,86%{opacity:1}98%,100%{opacity:0}}
@keyframes K_dm{0%,26%{opacity:0}38%,86%{opacity:.32}98%,100%{opacity:0}}
@keyframes K_l{0%,34%{transform:scale(0)}44%,86%{transform:none;opacity:1}96%,100%{transform:scale(.6);opacity:0}}`,
    html: (w) => {
      const [a, b] = pick(w, 2, ['重劃區範圍', '約 100 公頃【範例】']);
      const poly = 'M560 250 L780 200 L1010 260 L1120 380 L1080 560 L900 640 L700 610 L560 520 L500 380 Z';
      return svg(
        `<defs><pattern id="mdh" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="hb" width="22" height="22"/><line class="hl" x1="0" y1="0" x2="0" y2="22"/></pattern></defs>
${base()}<path class="dim" d="M0 0H${W}V${H}H0Z ${poly}"/><path class="fill" d="${poly}"/><path class="edge" pathLength="1" d="${poly}"/>
<g transform="translate(810 420)"><g class="lab fb">${chip(0, 0, a, 46, 'ac')}${chip(0, 74, b, 26)}</g></g>`,
      );
    },
  },
  {
    id: 'map-metro',
    no: 143,
    cat: 'map',
    zh: '捷運路線',
    en: 'Metro Line',
    desc: '捷運線一站站亮起，最後停在目的站',
    tags: ['捷運', '通勤'],
    tone: 'ink',
    sample: ['起點站', '轉乘站', '市中心站', '目的地站'],
    hint: '2–6 個站名，依序',
    motion: '暗色淡化地圖上，一條主色粗線以捷運路線圖的 45 度轉折由左下畫到右上，沿線的車站白色圓點依序彈出並顯示站名（上下交錯），最後一站放大成主色並帶脈動光圈；停留後整條線淡出。',
    motionEn: 'Over a dimmed dark map, a thick accent line draws from lower left to upper right with 45-degree transit-map bends; white station dots pop in one by one along it with names staggered above and below; the final station grows into an accent dot with a pulsing halo; after a hold the line fades.',
    css: `${MAP_CSS}
.S .ln{fill:none;stroke:var(--ac);stroke-width:22;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:K_d 6s cubic-bezier(.5,0,.5,1) infinite}
.S .st{fill:#fff;stroke:var(--bg);stroke-width:8;animation:K_s 6s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:var(--d)}
.S .st.end{fill:var(--ac);stroke:#fff}
.S .halo{fill:none;stroke:var(--ac);stroke-width:5;animation:K_h 1.4s ease-out infinite}
.S .nm{animation:K_s 6s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:var(--d)}
@keyframes K_d{0%{stroke-dashoffset:1}45%,86%{stroke-dashoffset:0;opacity:1}98%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes K_s{0%{transform:scale(0)}6%,80%{transform:none;opacity:1}92%,100%{transform:none;opacity:0}}
@keyframes K_h{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.6);opacity:0}}`,
    html: (w) => {
      const names = w.slice(0, 6).length >= 2 ? w.slice(0, 6) : ['起點站', '目的地站'];
      const P = [
        [220, 700],
        [520, 700],
        [760, 460],
        [1080, 460],
        [1380, 160],
      ];
      const segs = P.slice(1).map((p, i) => Math.hypot(p[0] - P[i][0], p[1] - P[i][1]));
      const total = segs.reduce((a, b) => a + b, 0);
      const at = (t: number) => {
        let d = t * total;
        for (let i = 0; i < segs.length; i++) {
          if (d <= segs[i] || i === segs.length - 1) {
            const k = Math.min(1, d / segs[i]);
            return [P[i][0] + (P[i + 1][0] - P[i][0]) * k, P[i][1] + (P[i + 1][1] - P[i][1]) * k];
          }
          d -= segs[i];
        }
        return P[P.length - 1];
      };
      const n = names.length;
      const stations = names
        .map((nm, i) => {
          const t = i / (n - 1);
          const [x, y] = at(t);
          const d = `${(t * 2.7).toFixed(2)}s`;
          const end = i === n - 1;
          const ly = i % 2 ? y + 70 : y - 70;
          return `${end ? `<circle class="halo fb" cx="${x}" cy="${y}" r="26"/>` : ''}<circle class="st fb${end ? ' end' : ''}" style="--d:${d}" cx="${x}" cy="${y}" r="${end ? 26 : 18}"/>${chip(x, ly, nm, end ? 38 : 30, `nm${end ? ' ac' : ''}`, ` style="--d:${d}"`)}`;
        })
        .join('');
      return svg(`${base(true)}<path class="ln" pathLength="1" d="M${P.map((p) => p.join(' ')).join(' L')}"/>${stations}`);
    },
  },
  {
    id: 'map-poi',
    no: 144,
    cat: 'map',
    zh: '生活機能',
    en: 'Nearby Amenities',
    desc: '周邊學校、公園、超市一個個彈出來',
    tags: ['生活圈', '機能'],
    tone: 'paper',
    sample: ['學校｜300m', '公園｜150m', '超市｜450m', '捷運｜600m', '醫院｜1.2km'],
    hint: '「名稱｜距離」3–6 個（距離請用實際測量值）',
    motion: '地圖中央是主色定位針，周邊的生活機能以白色圓形圖示依序彈出（學校、公園、超市、捷運…），每個圖示用虛線連回中心，旁邊附上名稱與距離標籤；全部到位後停留，再依序縮回。',
    motionEn: 'An accent pin sits at the map center; nearby amenities pop in one by one as white circular icons (school, park, supermarket, metro…), each linked back to the center by a dashed line and tagged with its name and distance; after all are in place it holds, then they shrink away in order.',
    css: `${MAP_CSS}
.S .lk{stroke:var(--fg);stroke-width:3;stroke-dasharray:8 10;opacity:.5;animation:K_p 6s ease infinite both;animation-delay:var(--d)}
.S .ic circle{fill:#fff;stroke:var(--ac);stroke-width:5}.S .ic text{font-size:44px;text-anchor:middle;dominant-baseline:central}
.S .ic,.S .tg{animation:K_p 6s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:var(--d)}
.S .cp{animation:K_c 6s cubic-bezier(.5,0,.5,1.5) infinite both}
@keyframes K_p{0%{transform:scale(0);opacity:0}7%,84%{transform:none;opacity:1}94%,100%{transform:scale(0);opacity:0}}
@keyframes K_c{0%{transform:translateY(-600px)}10%,90%{transform:none}100%{transform:translateY(-600px)}}`,
    html: (w) => {
      const items = w.slice(0, 6);
      const n = items.length;
      const parts = items
        .map((it, i) => {
          const [name, dist] = split(it);
          const a = -Math.PI / 2 + (i / n) * Math.PI * 2 + 0.3;
          const x = 800 + Math.cos(a) * 470;
          const y = 470 + Math.sin(a) * 300;
          const d = `${(0.5 + i * 0.3).toFixed(1)}s`;
          const label = dist ? `${name} ${dist}` : name;
          return `<line class="lk fb" style="--d:${d}" x1="800" y1="440" x2="${x.toFixed(0)}" y2="${y.toFixed(0)}"/><g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><g class="ic fb" style="--d:${d}"><circle r="48"/><text>${emojiFor(name)}</text></g></g>${chip(x, y + 84, label, 28, 'tg', ` style="--d:${d}"`)}`;
        })
        .join('');
      return svg(`${base()}${parts}<g transform="translate(800 470)"><g class="pin cp">${PIN}</g></g>`);
    },
  },
  {
    id: 'map-flyover',
    no: 145,
    cat: 'map',
    zh: '3D 鳥瞰',
    en: '3D Flyover',
    desc: '地圖傾斜成 3D，建築長出來，主角建案亮起',
    tags: ['建案', '開場'],
    tone: 'ink',
    sample: ['本案位置', '主要幹道旁'],
    hint: '標籤 / 補充說明',
    motion: '平面地圖傾斜成約 55 度的 3D 鳥瞰視角並緩慢旋轉，周圍建築量體依序從地面長高，正中央的主角建築以主色長得最高，上方浮出標籤與一條指示線；停留時鏡頭持續緩慢環繞。',
    motionEn: 'The flat map tilts into a roughly 55-degree 3D bird\'s-eye view and slowly rotates; surrounding building volumes grow up from the ground in sequence while the hero building at the center rises tallest in the accent color, with a floating label and leader line above it; the camera keeps orbiting slowly during the hold.',
    css: `${MAP_CSS}
.S{perspective:90cqw;perspective-origin:50% 30%}
.S .plane{position:absolute;width:110cqw;height:62cqw;left:-5cqw;top:calc(50% - 31cqw);transform-style:preserve-3d;animation:K_cam 9s ease-in-out infinite}
.S .plane svg.map{position:absolute}
.S .bd{position:absolute;transform-style:preserve-3d;left:var(--x);top:var(--y);width:var(--w);height:var(--h)}
.S .bd i{position:absolute;inset:0;background:color-mix(in srgb,var(--bg) calc(80% - var(--k)*4%),var(--fg));border:1px solid color-mix(in srgb,var(--bg) 60%,var(--fg));transform:translateZ(calc(var(--k)*var(--z)*1cqw));animation:K_up 9s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:var(--dl)}
.S .bd.hero i{background:color-mix(in srgb,var(--ac) calc(100% - var(--k)*3%),#000);border-color:color-mix(in srgb,var(--ac) 60%,#fff)}
.S .tag{position:absolute;left:50%;top:9%;translate:-50% 0;display:flex;flex-direction:column;align-items:center;animation:K_tag 9s ease infinite both}
.S .tag b{font-size:min(4.4cqw,7cqh);background:var(--ac);color:#111;padding:.25em .7em;border-radius:99px}
.S .tag small{font-size:min(2.2cqw,3.6cqh);color:var(--fg);font-weight:500;margin-top:.5em}
.S .tag i{width:2px;height:12cqh;background:linear-gradient(var(--ac),transparent);margin-top:.6em}
@keyframes K_cam{0%,100%{transform:rotateX(56deg) rotateZ(-28deg)}50%{transform:rotateX(52deg) rotateZ(-14deg)}}
@keyframes K_up{0%{transform:translateZ(0);opacity:0}4%{opacity:1}22%,90%{transform:translateZ(calc(var(--k)*var(--z)*1cqw));opacity:1}100%{transform:translateZ(0);opacity:0}}
@keyframes K_tag{0%,22%{opacity:0;transform:translateY(20%)}30%,88%{opacity:1;transform:none}98%,100%{opacity:0}}`,
    html: (w) => {
      const [a, b] = pick(w, 2, ['本案位置', '主要幹道旁']);
      const blocks: string[] = [];
      let k = 0;
      for (let r = 0; r < 5; r++)
        for (let c = 0; c < 7; c++) {
          const hero = r === 2 && c === 3;
          if (!hero && rand(r * 7 + c + 2) < 0.28) continue;
          const x = 8 + c * 12.4 + rand(k + 5) * 2;
          const y = 10 + r * 17 + rand(k + 8) * 2;
          const z = hero ? 1.6 : 0.4 + rand(k + 11) * 0.9;
          const dl = `${(hero ? 0.9 : rand(k + 13) * 0.8).toFixed(2)}s`;
          blocks.push(`<div class="bd${hero ? ' hero' : ''}" style="--x:${x}%;--y:${y}%;--w:${hero ? 9 : 6 + rand(k) * 3}%;--h:${hero ? 12 : 8 + rand(k + 1) * 4}%;--z:${z.toFixed(2)}">${rep(8, (i) => `<i style="--k:${i};--dl:${dl}"></i>`)}</div>`);
          k++;
        }
      return `<div class="plane">${svg(base())}${blocks.join('')}</div><div class="tag"><b>${esc(a)}</b><small>${esc(b)}</small><i></i></div>`;
    },
  },
  {
    id: 'map-distance',
    no: 146,
    cat: 'map',
    zh: '距離量測',
    en: 'Distance Measure',
    desc: '兩點之間拉出量尺，距離數字跟著跳',
    tags: ['距離', '數據'],
    tone: 'paper',
    sample: ['本案', '捷運站', '850', 'm'],
    hint: '起點 / 終點 / 數字 / 單位（請用實測距離）',
    motion: '地圖上兩個端點先後出現，一條帶刻度的虛線量尺從起點延伸到終點，量尺中段的標籤數字同步從 0 計數到實際距離（如 850 m）；停留後量尺收回。',
    motionEn: 'Two endpoints appear on the map in turn; a dashed ruler with tick marks extends from start to end while the label at its midpoint counts from 0 up to the real distance (e.g. 850 m) in sync; after a hold the ruler retracts.',
    css: `${MAP_CSS}
.S .ru{stroke:var(--ac);stroke-width:8;stroke-dasharray:1;stroke-dashoffset:1;animation:K_d 5s cubic-bezier(.6,0,.3,1) infinite}
.S .ru2{stroke:#fff;stroke-width:3;stroke-dasharray:14 14;opacity:.9}
.S .pt{fill:var(--fg);stroke:#fff;stroke-width:6;animation:K_p 5s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:var(--d,0s)}
.S .num{animation:K_p 5s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:.3s}
.S .num text{font-size:48px;font-family:var(--mono);fill:#111}.S .nb{fill:var(--ac)}
@keyframes K_d{0%,8%{stroke-dashoffset:1}48%,86%{stroke-dashoffset:0;opacity:1}96%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes K_p{0%{transform:scale(0)}8%,86%{transform:none;opacity:1}96%,100%{opacity:0}}`,
    html: (w) => {
      const [a, b, n, u] = pick(w, 4, ['本案', '捷運站', '850', 'm']);
      const to = Math.max(0, Math.round(parseFloat(n) || 0));
      return svg(
        `${base()}<line class="ru" pathLength="1" x1="380" y1="600" x2="1220" y2="300"/><line class="ru2" x1="380" y1="600" x2="1220" y2="300"/>
<circle class="pt fb" cx="380" cy="600" r="22"/><circle class="pt fb" style="--d:.2s" cx="1220" cy="300" r="22"/>
${chip(380, 680, a, 32)}${chip(1220, 220, b, 32)}
<g transform="translate(800 450) rotate(-19.6)"><g class="num fb"><rect class="nb" x="-150" y="-50" width="300" height="100" rx="50"/><text text-anchor="middle" dominant-baseline="central"><tspan class="cnt">${to}</tspan> ${esc(u)}</text></g></g>`,
      );
    },
    run: (root) => {
      const t = root.querySelector<SVGTSpanElement>('.cnt');
      if (!t) return;
      const to = parseInt(t.textContent || '0', 10) || 0;
      let raf = 0;
      const t0 = performance.now();
      const ease = (p: number) => 1 - Math.pow(1 - p, 3);
      const f = (now: number) => {
        raf = requestAnimationFrame(f);
        const s = ((now - t0) / 1000) % 5;
        const p = s < 0.4 ? 0 : s < 2.4 ? ease((s - 0.4) / 2) : s < 4.5 ? 1 : 0;
        t.textContent = String(Math.round(to * p));
      };
      raf = requestAnimationFrame(f);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    id: 'map-isochrone',
    no: 147,
    cat: 'map',
    zh: '等時圈',
    en: 'Isochrone Zones',
    desc: '依交通時間畫出不規則的可達範圍',
    tags: ['通勤', '生活圈'],
    tone: 'ink',
    sample: ['基地', '5 分鐘', '10 分鐘', '15 分鐘'],
    hint: '中心名稱 / 三個時間標籤',
    motion: '暗色地圖中央的定位點向外長出三層不規則的半透明主色區塊（像交通可達範圍的等時圈），由小到大依序擴張，邊緣持續輕微蠕動；每一層邊緣彈出時間標籤；停留後由外而內收回。',
    motionEn: 'From a central point on a dark map, three layers of irregular translucent accent zones grow outward in sequence like travel-time isochrones, their edges gently undulating; a time tag pops at each layer\'s edge; after a hold they retract from the outside in.',
    css: `${MAP_CSS}
.S .zn{fill:color-mix(in srgb,var(--ac) calc(26% - var(--i)*7%),transparent);stroke:var(--ac);stroke-width:4;stroke-opacity:calc(1 - var(--i)*.25);animation:K_z 6.5s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(var(--i)*.45s)}
.S .zl{animation:K_l 6.5s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:calc(var(--i)*.45s + .5s)}
.S .core{fill:#fff;stroke:var(--ac);stroke-width:8}
.S .cl{animation:K_l 6.5s cubic-bezier(.3,1.7,.5,1) infinite both}
@keyframes K_z{0%{transform:scale(0);opacity:0}16%,84%{transform:none;opacity:1}96%,100%{transform:scale(.4);opacity:0}}
@keyframes K_l{0%{transform:scale(0)}10%,84%{transform:none;opacity:1}94%,100%{transform:scale(0);opacity:0}}`,
    html: (w) => {
      const [c, t1, t2, t3] = pick(w, 4, ['基地', '5 分鐘', '10 分鐘', '15 分鐘']);
      const R = [120, 230, 350];
      const zones = R.map((r, i) => {
        const s1 = blobPath(800, 450, lobes(14, r, 3, 0.16, i, 0.3, i + 1));
        const s2 = blobPath(800, 450, lobes(14, r, 3, 0.2, i + 0.9, 0.3, i + 7));
        return `<path class="zn fb" style="--i:${i}" d="${s1}"><animate attributeName="d" dur="${4 + i}s" repeatCount="indefinite" values="${s1};${s2};${s1}"/></path>`;
      })
        .reverse()
        .join('');
      return svg(
        `${base(true)}${zones}<circle class="core" cx="800" cy="450" r="16"/>${[t1, t2, t3].map((t, i) => chip(800 + R[i] * 0.72, 450 - R[i] * 0.72, t, 28, 'ac zl', ` style="--i:${i}"`)).join('')}${chip(800, 512, c, 32, 'cl')}`,
      );
    },
  },
];
