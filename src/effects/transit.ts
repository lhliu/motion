import type { Fx } from '../types';
import { esc } from '../util';
import { TRANSIT_HELP } from '../transit';

const CSS = `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;

const run: Fx['run'] = (root) => {
  const R = (globalThis as unknown as { MA_TRANSIT: { parse: (w: string[]) => { bg: string }; draw: (...a: unknown[]) => number } }).MA_TRANSIT;
  const cv = root.querySelector('canvas')!;
  const ctx = cv.getContext('2d')!;
  let w: string[] = [];
  try {
    w = JSON.parse(cv.dataset.w || '[]');
  } catch {
    return;
  }
  const net = R.parse(w);
  if (net.bg === 'transparent') root.style.background = 'transparent';
  const dpr = Math.min(2, devicePixelRatio || 1);
  const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
  const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
  const cs = getComputedStyle(root);
  const opt = { fg: cs.getPropertyValue('--fg').trim(), font: cs.getPropertyValue('--sans').trim() };
  const loop = Math.max(6, R.draw(ctx, W, H, net, 0, opt));
  const t0 = performance.now();
  let raf = 0;
  const f = (now: number) => {
    raf = requestAnimationFrame(f);
    R.draw(ctx, W, H, net, ((now - t0) / 1000) % loop, opt);
  };
  raf = requestAnimationFrame(f);
  return () => cancelAnimationFrame(raf);
};

const make = (id: string, sample: string[], duration: number, o: Pick<Fx, 'no' | 'zh' | 'en' | 'desc' | 'tags' | 'motion' | 'motionEn'>): Fx => ({
  id,
  cat: 'transit',
  tone: 'paper',
  hint: TRANSIT_HELP,
  css: CSS,
  html: (w) => `<canvas data-w="${esc(JSON.stringify(w))}"></canvas>`,
  engine: 'transit',
  run,
  sample,
  duration,
  added: '2026-10-23',
  ...o,
});

export const transit: Fx[] = [
  make(
    'transit-line',
    ['@title 捷運萬大線', '@sub 第一期工程路段（示意）', '=萬大線 #8dc63f tag=70,40', 'LG01 中正紀念堂 82,6', 'LG02 植物園 72,14', 'LG03 廈安 60,22', 'LG04 加蚋 48,34', 'LG05 永和永平國小 54,50', '*LG06 中和 46,63', 'LG07 連城錦和 34,74', 'LG08 中和高中 22,84', 'LG08A 莒光 12,68 R'],
    9,
    {
      no: 201,
      zh: '單線路網',
      en: 'Transit Line Map',
      desc: '一條捷運線逐站畫出，焦點站放大脈衝，列車沿線來回',
      tags: ['區位', '交通', '捷運'],
      motion: '淺色底，左上標題與副標淡入；捷運線從第一站沿著折線一路畫到最後一站，線經過時每個車站以白底色框圓點彈出，旁邊跳出深藍底白字站名標籤與站碼；焦點站是更大的黃框圓圈並帶黃色站名卡，外圈持續擴散脈衝；線畫完後一個白色膠囊列車沿線來回行駛。全部硬邊。',
      motionEn: 'On a light background the title and subtitle fade in; the metro line draws itself station by station along its polyline, each station popping in as a white dot with a colored ring and a navy name tag with its code; the focus station is a larger yellow-ringed circle with a yellow name card and pulsing rings; once drawn, a white capsule train shuttles back and forth along the line. All hard-edged.',
    },
  ),
  make(
    'transit-strip',
    ['@layout strip', '@title 機場捷運', '@sub 營運路線圖（示意）', '=機場捷運 #8e44ad', '*A1 臺北車站', 'A2 三重', 'A3 新北產業園區', 'A4 新莊副都心', 'A5 泰山', 'A6 泰山貴和', 'A7 體育大學', 'A8 長庚醫院', 'A9 林口', 'A10 山鼻', 'A11 坑口', 'A12 機場第一航廈', 'A13 機場第二航廈', 'A14a 機場旅館', 'A15 大園', 'A16 橫山', 'A17 領航', 'A18 高鐵桃園', 'A19 桃園體育園區', 'A20 興南', 'A21 環北'],
    8,
    {
      no: 202,
      zh: '路線條',
      en: 'Line Strip Diagram',
      desc: '像月台上的路線圖：一整排站碼與站名依序出現',
      tags: ['交通', '捷運', '資訊'],
      motion: '淺色底，標題淡入；一條粗色帶從起點延伸到終點（橫式畫面橫排、直式畫面直排），色帶經過時每站的膠囊形站碼依序彈出，站名在下方直書（直式畫面在右側橫書）淡入；焦點站的膠囊改成實心線色；最後一個白色膠囊列車沿線來回。全部硬邊。',
      motionEn: 'On a light background the title fades in; a thick colored band extends from the first to the last station (horizontal in landscape, vertical in portrait), and as it passes each station a pill-shaped code badge pops in with its name fading in below in vertical text (to the right in portrait); the focus station gets a solid line-colored pill; finally a white capsule train shuttles along the band. All hard-edged.',
    },
  ),
  make(
    'transit-network',
    [
      '@title 路網示意',
      '@sub 轉乘、鐵路、規劃中路線',
      '○ A 區 46,46,17 #f3c4d4',
      '○ B 區 16,62,12 #cfe0f3',
      '=紅線 #e03a3e tag=16,12',
      'R01 8,20', 'R02 20,28', 'R03 32,36', '*R04/G05 中心站 46,46', 'R05 58,52', 'R06 70,60', 'R07 82,70', 'R08 92,82',
      '=綠線 #3aa04a tag=84,6',
      'G01 40,96', 'G02 42,84', 'G03/T3 44,71', 'G04/B04 45,58', 'R04/G05 中心站 46,46', 'G06 50,34', 'G07 56,22', 'G08 64,13', 'G09/Y01 74,6',
      '=藍線 #2f6db5 tag=10,52',
      'B01 6,64', 'B02 18,62', 'B03 30,60', 'G04/B04 45,58',
      '=鐵路 #c0392b rail tag=12,88',
      'T1 4,80', 'T2 24,75', 'G03/T3 44,71', 'T4 66,66', 'T5 96,60',
      '=延伸線（規劃中） #f2b705 dash tag=88,30',
      'G09/Y01 74,6', 'Y02 86,12', 'Y03 96,24',
    ],
    10,
    {
      no: 203,
      zh: '多線路網',
      en: 'Transit Network Map',
      desc: '多條捷運、鐵路與規劃中虛線，轉乘站、焦點站與區域圈一次講清楚',
      tags: ['區位', '交通', '捷運'],
      motion: '淺色底，左上標題淡入；先浮現兩個淡色區域圈，接著各條路線依序從起點畫到終點：捷運是實色粗線、鐵路是黑底白色斷續線、規劃中路線是虛線；線經過時站點彈出並標上站碼，轉乘站是黑框白圓，焦點站是黃框大圓並持續脈衝；每條線旁出現同色線名標籤；畫完後白色膠囊列車在各線來回。全部硬邊。',
      motionEn: 'On a light background the title fades in; two pale zone circles appear, then each route draws from end to end in turn — solid thick lines for metro, black with white dashes for rail, a dashed line for planned routes; stations pop in with their codes as the line passes, transfers as black-ringed white circles and the focus station as a large yellow-ringed pulsing circle; a matching name tag appears beside each line; then white capsule trains shuttle along the lines. All hard-edged.',
    },
  ),
];
