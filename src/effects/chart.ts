import type { CatId, Fx } from '../types';
import { esc } from '../util';
import { CHART_HELP } from '../chart';

const CSS = `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;

const run: Fx['run'] = (root) => {
  const R = (globalThis as unknown as { MA_CHART: { parse: (w: string[]) => unknown; draw: (...a: unknown[]) => number } }).MA_CHART;
  const cv = root.querySelector('canvas')!;
  const ctx = cv.getContext('2d')!;
  let w: string[] = [];
  try {
    w = JSON.parse(cv.dataset.w || '[]');
  } catch {
    return;
  }
  const kind = cv.dataset.kind || 'column';
  const data = R.parse(w);
  const dpr = Math.min(2, devicePixelRatio || 1);
  const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
  const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
  const cs = getComputedStyle(root);
  const v = (k: string) => cs.getPropertyValue(k).trim();
  const opt = { fg: v('--fg'), bg: v('--bg'), ac: v('--ac'), ac2: v('--ac2'), font: v('--sans') };
  const loop = Math.max(8, R.draw(ctx, W, H, kind, data, 0, opt));
  const t0 = performance.now();
  let raf = 0;
  const f = (now: number) => {
    raf = requestAnimationFrame(f);
    R.draw(ctx, W, H, kind, data, ((globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE ? Math.min((now - t0) / 1000, loop - 0.001) : (now - t0) / 1000 % loop), opt);
  };
  raf = requestAnimationFrame(f);
  return () => cancelAnimationFrame(raf);
};

const make = (kind: string, cat: CatId, sample: string[], o: Pick<Fx, 'no' | 'zh' | 'en' | 'desc' | 'tags' | 'motion' | 'motionEn'>): Fx => ({
  id: `chart-${kind}`,
  cat,
  tone: 'ink',
  hint: CHART_HELP,
  css: CSS,
  html: (w) => `<canvas data-kind="${kind}" data-w="${esc(JSON.stringify(w))}"></canvas>`,
  engine: 'chart',
  run,
  sample,
  duration: 8,
  added: '2026-10-23',
  ...o,
});

const HARD = '全部硬邊實色，不用陰影或模糊。';
const HARD_EN = 'All flat and hard-edged, no shadows or blur.';

export const charts: Fx[] = [
  make('column', 'cbar', ['各區成交量', '~單位：件（示意數據）', '@series 今年,去年', 'A 區 120,98', 'B 區 86,90', 'C 區 64,52', 'D 區 42,47'], {
    no: 204, zh: '直條圖', en: 'Column Chart', desc: '分組直條由下往上長出，數字跟著跳動', tags: ['數據', '比較', '簡報'],
    motion: `標題與圖例淡入、格線出現；每組直條依序從基線往上長出並略為回彈，頂端數字由 0 跳到實際值，分類名稱在下方。${HARD}`,
    motionEn: `Title, legend and gridlines fade in; grouped columns grow up from the baseline one after another with a slight overshoot while the value on top counts up from zero; category labels sit below. ${HARD_EN}`,
  }),
  make('stack', 'cbar', ['產品組合', '~單位：戶（示意數據）', '@series 兩房,三房,四房', '一期 40,60,20', '二期 55,48,22', '三期 30,70,35'], {
    no: 205, zh: '堆疊直條', en: 'Stacked Column', desc: '每段依序疊上去，頂端顯示合計', tags: ['數據', '組成', '簡報'],
    motion: `格線出現後，每根直條由下往上一段一段疊起（每段一個系列顏色），段內顯示數字，疊完後頂端跳出合計。${HARD}`,
    motionEn: `After the gridlines appear each column stacks up segment by segment, one series color per segment with its value inside, and the total pops up on top once complete. ${HARD_EN}`,
  }),
  make('bar', 'cbar', ['生活機能步行時間', '~單位：分鐘（示意數據）', '捷運站 8', '公園 3', '國小 6', '超市 4', '醫院 12'], {
    no: 206, zh: '橫條圖', en: 'Bar Chart', desc: '橫條由左往右伸出，適合項目名稱較長', tags: ['數據', '比較', '生活機能'],
    motion: `左側項目名稱淡入，橫條依序由左往右伸出並略為回彈，條尾數字跟著跳動。${HARD}`,
    motionEn: `Item labels fade in on the left and bars extend left to right one by one with a slight overshoot, the number at each bar end counting up. ${HARD_EN}`,
  }),
  make('rank', 'cbar', ['重劃區關注度排行', '~（示意數據）', 'A 重劃區 92', 'B 重劃區 85', 'C 重劃區 77', 'D 重劃區 64', 'E 重劃區 58', 'F 重劃區 41'], {
    no: 207, zh: '排名橫條', en: 'Ranking Bars', desc: '自動由大到小排序，前三名上色並帶名次徽章', tags: ['排行', 'TOP 3', '數據'],
    motion: `資料自動由大到小排序；名次圓徽章與項目名稱由上往下依序出現，橫條伸出，第一名用主色、二三名用輔色、其餘為灰色。${HARD}`,
    motionEn: `Rows are sorted from largest to smallest; rank badges and labels appear top to bottom as bars extend, first place in the main color, second and third in the accent and the rest in grey. ${HARD_EN}`,
  }),
  make('waterfall', 'cbar', ['總價怎麼組成', '~單位：萬元（示意數據）', '房屋 +1200', '車位 +250', '裝修 +80', '折扣 -120', '總價 ='], {
    no: 208, zh: '瀑布圖', en: 'Waterfall Chart', desc: '一筆一筆加減，最後落到合計', tags: ['數據', '組成', '解說'],
    motion: `每一筆依序從前一筆的高度開始往上（增加，主色）或往下（減少，紅色）長出，柱與柱之間有水平連接線，合計柱用灰色由底部長到總額。${HARD}`,
    motionEn: `Each step grows from the previous level, up for increases in the main color or down for decreases in red, with level connectors between bars; total bars in grey rise from the baseline to the running sum. ${HARD_EN}`,
  }),
  make('line', 'cline', ['房價走勢', '~單位：萬/坪（示意數據）', '2019 32', '2020 34', '2021 38', '2022 43', '2023 45', '2024 48', '2025 51'], {
    no: 209, zh: '折線圖', en: 'Line Chart', desc: '折線由左往右畫出，最後一點放大標出數字', tags: ['數據', '趨勢', '房價'],
    motion: `格線出現後折線由左往右畫出，經過的資料點彈出空心圓與數字，最後一點是實心大圓並放大標出最新數值；可多條系列。加一行「@badge +38%」會在終點上方彈出副色膠囊徽章。${HARD}`,
    motionEn: `After the gridlines appear the line draws from left to right, popping hollow dots and values as it passes; the last point is a large solid dot with an enlarged latest value; supports several series. Add “@badge +38%” to pop an accent-2 pill badge above the end point. ${HARD_EN}`,
  }),
  make('area', 'cline', ['兩區人口變化', '~單位：萬人（示意數據）', '@series 甲區,乙區', '2019 12,8', '2020 12.5,8.8', '2021 13,9.9', '2022 13.2,11', '2023 13.6,12.4', '2024 14,13.5'], {
    no: 210, zh: '區域圖', en: 'Area Chart', desc: '折線下方填色，看出量體與成長', tags: ['數據', '趨勢', '比較'],
    motion: `與折線圖相同由左往右畫出，線下方以半透明實色填滿到基線，多個系列依序稍微錯開出現。${HARD}`,
    motionEn: `Draws left to right like the line chart with a translucent flat fill down to the baseline; multiple series follow with a slight delay. ${HARD_EN}`,
  }),
  make('combo', 'cline', ['成交量與均價', '~（示意數據）', '@series 成交量（件）,均價（萬/坪）', 'Q1 120,42', 'Q2 150,44', 'Q3 98,45', 'Q4 170,47'], {
    no: 211, zh: '組合圖', en: 'Combo Chart', desc: '直條配折線，左右兩個刻度一張講完', tags: ['數據', '比較', '簡報'],
    motion: `第一個系列為直條由下長出（左側刻度），第二個系列為折線隨後由左往右畫出（右側刻度、折線色數字），資料點彈出並標上數值。${HARD}`,
    motionEn: `The first series grows as columns on the left axis, then the second series draws as a line left to right on a right-hand axis in its own color, with dots and values popping in. ${HARD_EN}`,
  }),
  make('pie', 'cpie', ['坪數分布', '~（示意數據）', '20 坪以下 18', '20–30 坪 42', '30–40 坪 28', '40 坪以上 12'], {
    no: 212, zh: '圓餅圖', en: 'Pie Chart', desc: '扇形順時針掃出，最大的一塊微微突出', tags: ['數據', '組成', '比例'],
    motion: `圓餅從 12 點鐘方向順時針掃出各扇形，扇形內顯示百分比、外側標名稱，掃完後最大的一塊往外推出一點，下方列出圖例與數值。${HARD}`,
    motionEn: `Slices sweep clockwise from twelve o'clock with percentages inside and names outside; once complete the largest slice nudges outward and a legend with values appears below. ${HARD_EN}`,
  }),
  make('donut', 'cpie', ['預算怎麼分配', '~單位：萬元（示意數據）', '@series 總預算', '頭期款 300', '裝潢 80', '家電 30', '稅費 20'], {
    no: 213, zh: '環圈圖', en: 'Donut Chart', desc: '環狀掃出，中間跳出合計', tags: ['數據', '組成', '比例'],
    motion: `環圈順時針掃出各段，中央合計數字由 0 跳到總數，下方是系列名稱；各段百分比與外側名稱依序出現。${HARD}`,
    motionEn: `Ring segments sweep clockwise while the total in the center counts up from zero with the series name beneath; segment percentages and outside labels appear in turn. ${HARD_EN}`,
  }),
  make('gauge', 'cpie', ['貸款成數', '~（示意）', '@unit %', '@max 100', '可貸成數 80'], {
    no: 214, zh: '儀表板', en: 'Gauge', desc: '半圓儀表，指針甩到目標值', tags: ['數據', 'KPI', '重點'],
    motion: `半圓刻度盤出現，外圈有三段淡色區間；彩色弧與指針一起從 0 甩到目標值並略為回彈，中央大數字跟著跳動。加一行「@board」並寫 2–4 行指標，會改成 2×2 迷你卡看板，每張卡有小半圓弧與跳動數字（KPI 看板）。${HARD}`,
    motionEn: `A half-circle dial appears with three faint zones; the colored arc and needle swing from zero to the target with a slight overshoot while the big number below counts up. Add “@board” with 2–4 metric rows to get a 2×2 board of mini cards, each with a small arc and counting number. ${HARD_EN}`,
  }),
  make('rings', 'cpie', ['公設比與綠覆率', '~（示意數據）', '@unit %', '公設比 33', '綠覆率 45', '建蔽率 28'], {
    no: 215, zh: '進度環', en: 'Progress Rings', desc: '同心圓環各自填到百分比', tags: ['數據', '比例', 'KPI'],
    motion: `數個同心圓環的灰色底軌出現，彩色圓角弧依序從 12 點鐘方向順時針填到各自百分比，下方列出名稱與數值。${HARD}`,
    motionEn: `Concentric grey tracks appear and rounded colored arcs fill clockwise from twelve o'clock to each percentage in turn, with names and values listed below. ${HARD_EN}`,
  }),
  make('picto', 'cpie', ['每 10 戶有幾戶是首購', '~（示意數據）', '首購族 7/10', '換屋族 3/10'], {
    no: 216, zh: '象形圖', en: 'Pictogram', desc: '用小房子圖示表達比例，一格一格點亮', tags: ['比例', '可愛', '解說'],
    motion: `每列先出現一排灰色小房子，再由左往右逐一以彈跳方式點亮成主色，右側跳出「7/10」大字。${HARD}`,
    motionEn: `Each row shows a line of grey house icons that light up one by one from the left with a bounce, and a large "7/10" pops in at the right. ${HARD_EN}`,
  }),
  make('treemap', 'chier', ['銷售戶數組成', '~單位：戶（示意數據）', '住宅/兩房 120', '住宅/三房 160', '住宅/四房 40', '店面/一樓 12', '店面/二樓 8', '車位/平面 180', '車位/機械 60'], {
    no: 217, zh: '樹狀圖', en: 'Treemap', desc: '面積代表數量，大類同色、小類深淺', tags: ['組成', '階層', '數據'],
    motion: `畫面依數量切成大小不同的矩形，同一大類同色系、小類深淺不同；矩形由大到小依序從中心彈出，夠大的格子顯示名稱與數值。${HARD}`,
    motionEn: `The area is split into rectangles sized by value, one color family per group with shades for sub-items; rectangles pop out from their centers from largest to smallest, larger ones labeled with name and value. ${HARD_EN}`,
  }),
  make('sunburst', 'chier', ['家庭支出', '~單位：%（示意數據）', '居住/房貸 28', '居住/管理費 4', '生活/餐飲 18', '生活/交通 8', '教育/學費 12', '其他/保險 6', '其他/娛樂 7'], {
    no: 218, zh: '旭日圖', en: 'Sunburst', desc: '內圈大類、外圈細項，一圈掃出', tags: ['組成', '階層', '比例'],
    motion: `中央合計數字跳動，內圈大類與外圈細項同時順時針掃出，外圈為同色系不同深淺；掃完後內圈標上大類名稱。${HARD}`,
    motionEn: `The total in the center counts up while the inner ring of groups and outer ring of items sweep clockwise together, the outer ring in shades of each group color; group names appear on the inner ring once complete. ${HARD_EN}`,
  }),
  make('funnel', 'chier', ['看屋到成交', '~單位：組（示意數據）', '來電詢問 600', '預約看屋 320', '到場參觀 210', '二次回訪 90', '簽約成交 36'], {
    no: 219, zh: '漏斗圖', en: 'Funnel Chart', desc: '一層層變窄，右側標轉換率', tags: ['數據', '流程', '轉換'],
    motion: `漏斗各層由上往下依序從左右交錯滑入定位，寬度依數值遞減，層內顯示數字，右側標出階段名稱與相對上一層的轉換率。${HARD}`,
    motionEn: `Funnel layers slide in alternately from left and right, top to bottom, narrowing by value with the number inside; stage names and conversion rates versus the previous stage appear at the right. ${HARD_EN}`,
  }),
  make('box', 'cstat', ['各區單價分布', '~單位：萬/坪（示意數據）', 'A 區 38,42,45,49,58', 'B 區 30,34,37,40,46', 'C 區 45,50,54,60,70'], {
    no: 220, zh: '盒鬚圖', en: 'Box Plot', desc: '最小、四分位、中位數、最大一次呈現', tags: ['統計', '分布', '數據'],
    motion: `每組先出現中位數橫線，盒子（Q1–Q3）與上下鬚由中位數往兩端展開，旁邊標出中位數數字。${HARD}`,
    motionEn: `For each group the median line appears first, then the box (Q1–Q3) and whiskers expand outward from it, with the median value labeled beside. ${HARD_EN}`,
  }),
  make('scatter', 'cstat', ['屋齡與單價', '~（示意數據）', '@series 屋齡（年）,單價（萬/坪）', 'a 2,62', 'b 5,58', 'c 8,55', 'd 12,50', 'e 15,47', 'f 20,44', 'g 25,40', 'h 30,36', 'i 35,35', 'j 40,31'], {
    no: 221, zh: 'XY 散佈圖', en: 'XY Scatter', desc: '點依序彈出，最後畫出趨勢線', tags: ['統計', '相關', '數據'],
    motion: `兩軸刻度出現，資料點依序彈出，全部出現後一條虛線趨勢線（最小平方法）由左往右畫出。${HARD}`,
    motionEn: `Both axes appear and points pop in one by one; then a dashed least-squares trend line draws from left to right. ${HARD_EN}`,
  }),
  make('bubble', 'cstat', ['各案比較', '~x：距捷運（分鐘）　y：單價　大小：戶數（示意數據）', '@series 距捷運（分鐘）,單價（萬/坪）', 'A 案 5,62,320', 'B 案 12,48,180', 'C 案 8,55,450', 'D 案 18,40,120', 'E 案 3,70,90'], {
    no: 222, zh: '泡泡圖', en: 'Bubble Chart', desc: 'X、Y 再加上大小，一張比三件事', tags: ['統計', '比較', '數據'],
    motion: `兩軸刻度出現，大小不同的半透明實色圓依序以回彈方式彈出，夠大的圓內寫名稱，小圓名稱標在旁邊。加一行「@quad x,y,右上,左上,左下,右下」會先畫出四象限十字軸與淡色象限底與角落名稱（定位象限）。${HARD}`,
    motionEn: `Axes appear and translucent flat circles of different sizes bounce in one by one; large bubbles carry their names inside, small ones beside. Add “@quad x,y,TR,TL,BL,BR” to draw a quadrant cross with tinted quadrants and corner labels first. ${HARD_EN}`,
  }),
  make('radar', 'cstat', ['生活圈評分', '~滿分 10（示意數據）', '@series A 案,B 案', '@max 10', '交通 8,6', '學區 7,9', '公園 9,6', '商圈 6,8', '醫療 7,7', '價格 5,8'], {
    no: 223, zh: '雷達圖', en: 'Radar Chart', desc: '多項指標一圈比較，兩案疊在一起看', tags: ['比較', '評分', '數據'],
    motion: `多邊形格線與各軸名稱出現，各系列的半透明多邊形從中心往外撐開並回彈，頂點有實心圓點；第二個系列稍晚出現。${HARD}`,
    motionEn: `Polygon gridlines and axis labels appear; each series' translucent polygon expands from the center with a slight overshoot, vertices marked with dots, the second series a moment later. ${HARD_EN}`,
  }),
];
