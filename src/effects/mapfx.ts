import type { CatId, Fx } from '../types';
import { esc } from '../util';
import { MAPFX_HELP, MAPFX_LOOP } from '../mapfx';

const CSS = `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;

const run: Fx['run'] = (root) => {
  const R = (globalThis as unknown as { MA_MAPX: { draw: (...a: unknown[]) => number } }).MA_MAPX;
  const cv = root.querySelector('canvas')!;
  const ctx = cv.getContext('2d')!;
  let w: string[] = [];
  try {
    w = JSON.parse(cv.dataset.w || '[]');
  } catch {
    return;
  }
  const mode = cv.dataset.mode || 'tour';
  if (mode === 'compass') root.style.background = 'transparent';
  const dpr = Math.min(2, devicePixelRatio || 1);
  const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
  const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
  const cs = getComputedStyle(root);
  const v = (k: string) => cs.getPropertyValue(k).trim();
  const opt = { fg: v('--fg'), bg: v('--bg'), ac: v('--ac'), ac2: v('--ac2'), font: v('--sans') };
  const loop = R.draw(ctx, W, H, mode, w, 0, opt);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const t0 = performance.now();
  let raf = 0;
  const f = (now: number) => {
    raf = requestAnimationFrame(f);
    // 停在接近完成的畫面多留一下，再重播
    const t = reduced.matches ? loop * 0.9 : ((now - t0) / 1000) % (loop + 1.2);
    R.draw(ctx, W, H, mode, w, Math.min(t, loop), opt);
  };
  raf = requestAnimationFrame(f);
  return () => cancelAnimationFrame(raf);
};

const make = (mode: string, no: number, cat: CatId, sample: string[], o: Pick<Fx, 'zh' | 'en' | 'desc' | 'tags' | 'motion' | 'motionEn'>): Fx => ({
  id: `mx-${mode}`,
  no,
  cat,
  tone: mode === 'nav' || mode === 'radar' ? 'ink' : 'paper',
  hint: MAPFX_HELP[mode],
  css: CSS,
  html: (w) => `<canvas data-mode="${mode}" data-w="${esc(JSON.stringify(w.length ? w : sample))}"></canvas>`,
  engine: 'mapfx',
  run,
  sample,
  duration: MAPFX_LOOP[mode] + 1.2,
  preferredRatio: '9:16',
  added: '2026-10-24',
  ...o,
});

const BASE = '底圖是程式產生的簡化城市示意（街廓、道路、河流、公園），不是真實地圖；';
const BASE_EN = 'The base is a generated, simplified city illustration (blocks, roads, river, parks), not a real map; ';

export const mapfx: Fx[] = [
  make('taiwan', 314, 'mcompare', ['新北市', '林口區'], { zh: '台灣定位開場', en: 'Taiwan Locator Intro', desc: '台灣全圖彈出，縣市位置亮起脈衝，一路推近到地點並插上定位針', tags: ['區位', '開場', '定位'], motion: '深藍海面上台灣本島輪廓回彈出現；指定縣市的位置亮起主色圓點與擴散圈，旁邊標上縣市名；鏡頭一路推近到該縣市，接著切換成城市街廓示意底圖，定位針落下並彈出地點名稱，頂端保留縣市標籤。台灣輪廓為概略示意。', motionEn: 'Taiwan’s outline bounces in over a dark-blue sea; the chosen county lights up with an accent dot, pulsing rings and its name; the camera pushes in toward it, then cuts to a stylized street-block base map where a pin drops and the place name pops up, the county tag staying at the top. The outline is approximate.' }),
  make('split', 315, 'mcompare', ['A 區｜通勤快｜房價高', 'B 區｜生活新｜通勤遠'], { zh: '兩區對照', en: 'Two-Area Compare', desc: '畫面切成兩塊地圖，A、B 區各插定位針與重點，中間 VS', tags: ['區位', '比較', '對決'], motion: `直式上下、橫式左右切成兩塊街區地圖，從兩側展開；兩區各染上主色與輔色淡色調，定位針落下並標名稱，下方逐條出現白底重點；中間一條深色分隔線與回彈出現的圓形 VS 徽章。${BASE}`, motionEn: `The frame splits into two street maps (top/bottom in portrait, left/right in landscape) that open from each side, each tinted accent or secondary; a pin drops with the area name and white key-point tags appear below; a dark divider and a bouncing round VS badge sit in the middle. ${BASE_EN}` }),
  make('race', 316, 'mcompare', ['家', '公司', '開車 35', '捷運 28'], { zh: '通勤路線賽跑', en: 'Commute Race', desc: '兩條路線同時從起點出發，分鐘數一路跳，先到的跳出「先到！」', tags: ['通勤', '比較', '交通'], motion: `起點與終點兩支深色定位針；兩條沿街道轉折的路線（主色、輔色）同時由起點往終點畫出，線頭的圓點各帶一張分鐘數標籤持續跳動，速度依分鐘數比例；時間短的先到並跳出黃色字「先到！」。右下註明時間以實測為準。${BASE}`, motionEn: `Dark pins mark the start and destination; two routes that turn along the streets (accent and secondary) draw from start to finish at the same time, each head dot carrying a ticking minutes tag, speeds proportional to the minutes; the faster one arrives first with a yellow “先到！”. A note says times should be measured. ${BASE_EN}` }),
  make('tour', 317, 'mcompare', ['社區大門', '超市', '公園', '捷運站'], { zh: '看屋行程串連', en: 'Itinerary Hop', desc: '編號圓點依序跳出，虛線沿街道把 1→2→3 串起來', tags: ['生活圈', '行程', '路線'], motion: `一連串編號圓點（白底深框、最後一點為主色）依序彈出並標上地點名，相鄰兩點之間的主色虛線沿街道轉折畫出，像一日生活路線或看屋順序。${BASE}`, motionEn: `Numbered dots (white with dark rims, the last in accent) pop in one after another with place names, and an accent dashed line follows the streets between consecutive stops, like a day route or a viewing itinerary. ${BASE_EN}` }),
  make('spot', 318, 'mcompare', ['基地', '國小', '公園', '捷運站'], { zh: '聚光燈導覽', en: 'Spotlight Tour', desc: '地圖整片變暗，一圈聚光依序移到每個重點', tags: ['區位', '導覽', '重點'], motion: `整張街區地圖蓋上深色半透明，只留一個主色框的圓形聚光，聚光平滑移到每個重點，到位時定位針彈出、上方出現「1. 名稱」白色標籤。${BASE}`, motionEn: `The street map is covered in translucent dark except for one accent-rimmed circular spotlight, which glides to each point in turn; on arrival a pin pops and a white “1. name” tag appears above. ${BASE_EN}` }),
  make('phase', 319, 'mplan', ['一期 2016', '二期 2020', '三期 2024（規劃）'], { zh: '重劃區分期', en: 'Development Phases', desc: '區塊依期別依序上色，規劃中的期別加虛線框，附圖例', tags: ['重劃區', '規劃', '時間軸'], motion: `街區地圖上幾塊相鄰的不規則區塊依一期、二期、三期依序填上不同顏色並標上期別，名稱含「規劃」的區塊加深色虛線框；左下圖例跟著逐列出現。範圍為示意，右下註明以公告圖為準。${BASE}`, motionEn: `Adjacent irregular blocks on the street map fill with different colors phase by phase with their labels; phases marked “planned” get a dark dashed outline; the legend at the lower left fills in row by row. Areas are illustrative, with a note to rely on official plans. ${BASE_EN}` }),
  make('future', 320, 'mplan', ['捷運 環狀線北環段 2030', '道路 快速道路延伸 2028', '公園 中央公園 2027'], { zh: '重大建設預告', en: 'Future Projects', desc: '上方從「現況」切到「完工後」，規劃中的捷運、道路、公園以虛線浮現並標年份', tags: ['建設', '規劃', '捷運'], motion: `上方膠囊切換鈕從「現況」滑到「完工後」；接著各項建設依序浮現：捷運是主色粗虛線並依序出現車站點、道路是灰色寬虛線、公園是綠色半透明區塊，每項旁標「名稱 · 年份」。右下註明「規劃中（示意），時程以主管機關公告為準」。${BASE}`, motionEn: `A pill toggle at the top slides from “now” to “after completion”; then each project appears in turn — metro as a thick accent dashed line with stations, roads as wide grey dashes, parks as translucent green blocks — each tagged “name · year”. A note marks them as planned and illustrative. ${BASE_EN}` }),
  make('zoning', 321, 'mplan', ['住宅區', '商業區', '工業區', '公園綠地', '學校用地'], { zh: '土地使用分區', en: 'Land-Use Zoning', desc: '街廓依住宅、商業、工業、綠地等分區依序上色，附圖例', tags: ['規劃', '分區', '都市計畫'], motion: `街區地圖上拼接的不規則區塊依分區種類依序填色（住宅黃、商業紅、工業褐、綠地綠、學校藍，其他用主色系），左下圖例逐列出現。分區為示意，右下註明以都市計畫書圖為準。${BASE}`, motionEn: `Tiled irregular blocks fill by zone type in sequence (residential yellow, commercial red, industrial brown, green space green, schools blue, others from the palette), the legend appearing row by row. Zoning is illustrative, with a note to rely on official plans. ${BASE_EN}` }),
  make('parcel', 322, 'mplan', ['本案基地', '約 1,200 坪（示意）'], { zh: '基地地籍', en: 'Site Parcel', desc: '地籍細線逐條畫出，目標基地填色並有外框擴散，標上名稱與面積', tags: ['基地', '建案', '土地'], motion: `鏡頭緩慢推近街區，地籍細線一條條畫出成格；目標基地多邊形填上半透明主色並加粗外框，外框一圈圈向外擴散；上方標基地名稱，下方白底標面積或說明。地籍線為示意。${BASE}`, motionEn: `The camera eases in on the blocks as thin cadastral lines draw one by one into a grid; the target parcel polygon fills translucent accent with a bold outline that ripples outward; the name sits above and a white area/notes tag below. Parcel lines are illustrative. ${BASE_EN}` }),
  make('choro', 323, 'mdata', ['@title 各區數值（示意）', '@unit 萬/坪', 'A 區 58', 'B 區 72', 'C 區 45', 'D 區 66', 'E 區 39', 'F 區 81'], { zh: '行政區著色圖', en: 'Choropleth Map', desc: '各區依數值深淺上色，標上區名與數字，下方色階圖例', tags: ['數據', '房價', '比較'], motion: `街區地圖上拼接的行政區塊依序填色，數值越高越接近主色、越低越淡；每區中央標區名與數字（數字從 0 跳到目標值），下方白底色階圖例標最小與最大值，左上標題。數字請附來源。${BASE}`, motionEn: `Tiled districts fill one by one, higher values closer to the accent and lower values paler; each shows its name and a number counting up, a white gradient legend below marks min and max, the title sits top left. Numbers need sources. ${BASE_EN}` }),
  make('bubble', 324, 'mdata', ['@title 各區數值（示意）', '@unit 件', 'A 區 120', 'B 區 310', 'C 區 80', 'D 區 220', 'E 區 150', 'F 區 260'], { zh: '數字泡泡地圖', en: 'Bubble Map', desc: '各區中央冒出大小不同的泡泡，面積代表數值', tags: ['數據', '成交量', '比較'], motion: `行政區只描細框線，各區中心依序回彈冒出半透明主色圓泡，面積與數值成正比，白色描邊，泡泡中央標區名與數字。數字請附來源。${BASE}`, motionEn: `Districts are only outlined; translucent accent bubbles pop up at their centres one after another, area proportional to value, with white rims and the name and number centred. Numbers need sources. ${BASE_EN}` }),
  make('bars', 325, 'mdata', ['@title 各區數值（示意）', '@unit 萬/坪', 'A 區 58', 'B 區 72', 'C 區 45', 'D 區 66', 'E 區 39', 'F 區 81'], { zh: '立體長條地圖', en: '3D Bar Map', desc: '地圖傾斜成斜視角，各區長出立體長條，頂端標數字', tags: ['數據', '3D', '比較'], motion: `街區地圖壓扁並旋轉成斜視角；各區中心依序長出主色立體長條（正面、側面較暗、頂面較亮），高度依數值回彈長到位，頂端白字深底標數字，底部標區名。數字請附來源。${BASE}`, motionEn: `The street map is squashed and rotated into an oblique view; accent 3D bars (front, darker side, lighter top) grow from each district centre in turn with a bounce, heights by value, the number in a dark tag on top and the district name at the base. Numbers need sources. ${BASE_EN}` }),
  make('nuisance', 326, 'mrisk', ['變電所', '300', '本案', '450'], { zh: '嫌惡設施影響圈', en: 'Nuisance Radius', desc: '設施周圍畫出紅色影響圈並向外擴散，基地距離連線，判斷在圈內或圈外', tags: ['嫌惡設施', '風險', '距離'], motion: `紅色圓角方塊驚嘆號標出設施位置與名稱，周圍紅色半透明影響圈從中心展開、外框為虛線，另有幾道紅圈持續向外擴散淡出，標「影響範圍約 300 公尺」；接著一條虛線連到基地定位針，標「本案 · 距離約 450 公尺」，最後下方跳出綠色「在影響範圍外」或紅色「在影響範圍內」。範圍為示意。${BASE}`, motionEn: `A red rounded square with “!” marks the facility and its name; a translucent red impact circle with a dashed edge expands from it while extra red rings keep rippling out, labeled with the radius; a dashed line then reaches the site pin labeled with its distance, and finally a green “outside” or red “inside” verdict pops up below. Radius is illustrative. ${BASE_EN}` }),
  make('flood', 327, 'mrisk', ['淹水潛勢（示意）', '24 小時 350mm 情境'], { zh: '淹水潛勢示意', en: 'Flood Potential', desc: '河道兩側的淹水範圍分三種深度逐步擴大，雨絲落下，附圖例', tags: ['防災', '颱風', '風險'], motion: `斜斜的藍色雨絲落下，河道兩側的淹水範圍以淺藍、中藍、深藍三種深度依序向外擴大；左上標題、下方白底降雨情境，左下圖例列出三種淹水深度。右下註明「示意圖，實際以官方淹水潛勢圖為準」。${BASE}`, motionEn: `Slanted blue rain falls while flood areas spread outward from the river in three depth shades (light, mid, dark blue); the title sits top left with the rainfall scenario below and a legend of three depths at the lower left. A note says it is illustrative and official flood maps govern. ${BASE_EN}` }),
  make('school', 328, 'mrisk', ['某某國小', '本案', '學區內'], { zh: '學區範圍', en: 'School District', desc: '以學校為中心畫出學區界線，基地插針，跳出「學區內」', tags: ['學區', '生活圈', '家庭'], motion: `藍色學校圖示（屋頂加校舍）與校名出現，周圍一圈不規則的藍色虛線學區界線一筆畫出並填上淡藍；基地定位針落下標名稱，下方跳出綠底「✓ 學區內」。學區範圍為示意。${BASE}`, motionEn: `A blue school icon and name appear; an irregular blue dashed district boundary draws around it in one stroke and fills pale blue; the site pin drops with its name and a green “✓ in district” tag pops up below. The district shape is illustrative. ${BASE_EN}` }),
  make('radar', 329, 'mrisk', ['超市', '國小', '公園', '醫院', '捷運站'], { zh: '雷達掃描', en: 'Radar Scan', desc: '深色地圖上綠色雷達掃過，周邊設施依序亮起標名稱', tags: ['生活機能', '周邊', '科技'], motion: `深色街區地圖中央是主色定位針與三圈綠色雷達同心圓，綠色扇形掃描線繞圈旋轉；掃過的地方設施點亮起（被掃到時放大發亮）並標白底名稱，持續保留。${BASE}`, motionEn: `A dark street map with an accent pin at the centre and three green radar rings; a green sweep sector rotates around, and each facility it passes lights up (swelling as it is hit) with a white name tag that stays. ${BASE_EN}` }),
  make('nav', 330, 'mrisk', ['捷運站', '12 分', '850 公尺', '直走 300 公尺', '右轉 文化一路'], { zh: '手機導航畫面', en: 'Navigation Screen', desc: '仿手機導航：藍點沿路線前進，上方轉彎指示切換，下方顯示時間距離', tags: ['通勤', '步行', '手機'], motion: `深色背景中一支手機，畫面是跟著位置移動的街區地圖：藍色導航路線、已走過的部分變淺，藍點沿路前進；上方綠色指示列顯示箭頭與指示文字，轉彎前箭頭轉向並換成第二段指示；下方白卡顯示剩餘時間與「距離 · 前往目的地」，終點有紅色定位針。介面為中性示意，不使用任何品牌。${BASE}`, motionEn: `A phone on a dark background shows a street map that follows the user: a blue route, the travelled part lighter, a blue dot moving along; a green banner on top shows an arrow and instruction, rotating to the next instruction before the turn; a white card below shows time remaining and “distance · to destination”, with a red pin at the end. Neutral mock, no brands. ${BASE_EN}` }),
  make('drive', 333, 'mcompare', ['捷運林口站', '直行 文化一路', '右轉 忠孝路', '左轉 站前路', '9 分', '2.4 公里'], { zh: '地圖導航', en: 'Driving Navigation', desc: '行車視角：地圖傾斜並跟著車頭轉向，藍色路線一路轉彎到終點，上方轉彎指示倒數公尺', tags: ['通勤', '交通', '導航'], motion: `全畫面導航：街區地圖壓扁成傾斜視角、以車頭為準旋轉，藍色箭頭固定在畫面下方，地圖沿藍色路線往前捲動，走過的路線變灰；到轉角時地圖平滑轉向；上方綠色指示列顯示轉彎箭頭、剩餘公尺倒數與下一條路名，最後一段換成「抵達 目的地」；下方白卡顯示剩餘分鐘與公里，終點有紅色定位針。介面為中性示意。${BASE}`, motionEn: `Full-screen navigation: the street map is squashed into a tilted view and rotated to the car's heading, a blue arrow stays near the bottom while the map scrolls along the blue route, travelled sections turning grey; at corners the map rotates smoothly; a green banner on top shows the turn arrow, a metres countdown and the next street, switching to “arrive at destination” on the last leg; a white card below shows remaining minutes and kilometres, with a red pin at the destination. Neutral mock. ${BASE_EN}` }),
  make('amenity', 334, 'mrisk', ['超市 某某超市 4', '學校 某某國小 6', '公園 中央公園 3', '醫院 某某醫院 9', '捷運 某某站 8', '餐飲 美食街 5'], { zh: '生活機能地圖', en: 'Amenity Map', desc: '基地為中心畫出步行 5／10 分鐘圈，各類設施依步行時間擺放並標分鐘，最後列出分類摘要', tags: ['生活機能', '生活圈', '區位'], motion: `基地定位針在中央彈出，外面依序展開步行 5 分、10 分兩圈主色虛線範圍並標示；各設施依類別上色（購物橘、學校藍、公園綠、醫療紅、交通紫、餐飲深紅）的圓形圖示依序沿放射線彈出，距離依步行分鐘，旁邊標「名稱 · 分鐘」；最後左下（橫式在右上）圖例列出各類別處數與最近幾分鐘。位置為示意。${BASE}`, motionEn: `The site pin pops up at the centre, then 5- and 10-minute walking rings open with dashed accent edges and labels; category-colored round icons (shopping orange, schools blue, parks green, medical red, transit purple, food dark red) pop out along radial lines at distances set by walking minutes, each tagged “name · minutes”; finally a legend lists each category's count and nearest minutes. Positions are illustrative. ${BASE_EN}` }),
  make('compass', 331, 'mkit', ['500 m'], { zh: '指北針與比例尺', en: 'Compass and Scale', desc: '透明背景：右上指北針轉幾圈定位到北方，右下比例尺分段畫出', tags: ['地圖', '疊加', '元件'], motion: '透明背景的地圖元件：右上白色圓形指北針彈出，紅色北針轉了一圈半後停在正北並微微擺動，上方標 N；右下白底比例尺黑白四段由左到右畫出，標 0 與比例尺文字。適合當疊加圖層常駐在地圖段落。', motionEn: 'Transparent map furniture: a white round compass pops in at the top right, its red needle spinning one and a half turns before settling on north with a slight wobble, N above; at the bottom right a white-backed black-and-white scale bar draws in four segments, labeled 0 and the scale text. Made to sit as an overlay over map segments.' }),
  make('oldnew', 332, 'mkit', ['2010', '2025'], { zh: '新舊地圖對照', en: 'Then and Now Map', desc: '滑桿左右移動，左邊是街廓稀疏的舊地圖、右邊是發展後的新地圖', tags: ['發展', '前後對比', '重劃區'], motion: `同一片街區分成兩種樣貌：左側是泛黃、街廓稀疏的舊地圖，右側是街廓密集的現況；中間白色分隔線與圓形把手來回左右滑動，左上標舊年份、右上主色標新年份。實際航照請用圖片工作區的前後對比。${BASE}`, motionEn: `The same area in two states: on the left a yellowed old map with sparse blocks, on the right the dense present; a white divider with a round handle slides back and forth, the old year tagged top left and the new year in accent top right. For real aerial photos use the photo before/after module. ${BASE_EN}` }),
];
