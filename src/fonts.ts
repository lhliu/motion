// 字型組合：標題用昭源黑體（Chiron Hei HK），數字用 Anton。
// Anton 只取數字與 % + , - . : 這幾個字元（約 6KB），以 data URL 內嵌，匯出的 HTML 與本機渲染也能直接用。
// Anton © The Anton Project Authors，SIL Open Font License 1.1。
export const NUM_FONT_CSS = `@font-face{font-family:"MA Num";src:url(data:font/woff2;base64,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) format("woff2");font-weight:100 900;font-style:normal;unicode-range:U+25,U+2B-2E,U+30-3A;font-display:block}`;

/** 字型組合：AI 與使用者依段落情緒挑選；一支影片建議 2–3 組以內 */
export type FontPackId = 'sharp' | 'round' | 'serif' | 'hand' | 'cute' | 'classic';

export interface FontPack {
  id: FontPackId;
  zh: string;
  /** 什麼時候用 */
  use: string;
  /** CSS font-family 順序 */
  stack: string;
  /** 需要預先載入的字型名稱 */
  families: string[];
  /** 給 AI 提示詞的字型描述 */
  promptZh: string;
  promptEn: string;
}

const TAIL = '"Noto Sans TC","PingFang TC",system-ui,sans-serif';
export const FONT_PACKS: FontPack[] = [
  {
    id: 'sharp',
    zh: '俐落黑體',
    use: '預設；資訊、數據、標題、字幕',
    stack: `"MA Num","Chiron Hei HK",${TAIL}`,
    families: ['MA Num', 'Chiron Hei HK'],
    promptZh: '中文用昭源黑體 Chiron Hei HK 粗體 900，數字（0–9 與 % , . : + -）用 Anton（皆為 Google Fonts）',
    promptEn: 'Chiron Hei HK weight 900 for Chinese and Latin text, with digits (0–9 and % , . : + -) in Anton (both Google Fonts)',
  },
  {
    id: 'round',
    zh: '親切圓體',
    use: '開箱、生活感、租屋帶路、通勤日常',
    stack: `"Chiron GoRound TC",${TAIL}`,
    families: ['Chiron GoRound TC'],
    promptZh: '昭源圓體 Chiron GoRound TC 粗體 900（Google Fonts）',
    promptEn: 'Chiron GoRound TC (rounded) weight 900 (Google Fonts)',
  },
  {
    id: 'serif',
    zh: '質感宋體',
    use: '質感建案、片頭大標、金句、品牌感',
    stack: `"Noto Serif TC",${TAIL}`,
    families: ['Noto Serif TC'],
    promptZh: '思源宋體 Noto Serif TC 粗體 900（Google Fonts）',
    promptEn: 'Noto Serif TC weight 900 (Google Fonts)',
  },
  {
    id: 'hand',
    zh: '手寫楷書',
    use: '旁白金句、心得、溫度、回憶',
    stack: `"LXGW WenKai TC",${TAIL}`,
    families: ['LXGW WenKai TC'],
    promptZh: '霞鶩文楷 LXGW WenKai TC 粗體 700（Google Fonts）',
    promptEn: 'LXGW WenKai TC (handwritten kai) weight 700 (Google Fonts)',
  },
  {
    id: 'cute',
    zh: '可愛粉圓',
    use: '俏皮、搞笑、吐槽、輕鬆段落',
    stack: `"Huninn",${TAIL}`,
    families: ['Huninn'],
    promptZh: 'jf 粉圓 Huninn（Google Fonts）',
    promptEn: 'Huninn (cute rounded) from Google Fonts',
  },
  {
    id: 'classic',
    zh: '標準思源',
    use: '大量小字、說明文字、需要最穩定好讀時',
    stack: TAIL,
    families: ['Noto Sans TC'],
    promptZh: '思源黑體 Noto Sans TC 粗體 900（Google Fonts）',
    promptEn: 'Noto Sans TC weight 900 (Google Fonts)',
  },
];
export const FONT_IDS = FONT_PACKS.map((f) => f.id);
export const fontPack = (id?: string): FontPack => FONT_PACKS.find((f) => f.id === id) ?? FONT_PACKS[0];
export const fontStack = (id?: string) => fontPack(id).stack;

/** 預設的字型順序：數字 → 昭源黑體 → 思源黑體 */
export const FONT_STACK = fontStack('sharp');

/** 各字型在 Google Fonts 的查詢字串；字重只留實際會用到的（缺的字重瀏覽器會就近取用） */
const FAMILY_QS: Record<string, string> = {
  'JetBrains Mono': 'JetBrains+Mono:wght@400;700',
  'Chiron Hei HK': 'Chiron+Hei+HK:wght@300;500;700;900',
  'Chiron GoRound TC': 'Chiron+GoRound+TC:wght@400;500;700;900',
  'Noto Sans TC': 'Noto+Sans+TC:wght@300;500;700;900',
  'Noto Serif TC': 'Noto+Serif+TC:wght@300;500;700;900',
  'LXGW WenKai TC': 'LXGW+WenKai+TC:wght@400;700',
  Huninn: 'Huninn',
};
/** 只載入用得到的字型：中文字型每套的 CSS 就有數百 KB，全部一起載會拖慢頁面又吃記憶體 */
export const fontLink = (families: Iterable<string>) =>
  `https://fonts.googleapis.com/css2?${[...new Set(['JetBrains Mono', 'Chiron Hei HK', ...families])]
    .filter((f) => FAMILY_QS[f])
    .map((f) => 'family=' + FAMILY_QS[f])
    .join('&')}&display=swap`;
/** 一段畫面需要哪些字型：字型組合、字體選擇、特效 CSS 裡直接用到的宋體 */
export const familiesFor = (o: { font?: string; face?: string; css?: string }): string[] => [
  ...fontPack(o.font).families,
  ...(o.face ? [faceOf(o.face)?.family ?? ''] : []),
  ...(o.css && /var\(--serif\)|Noto Serif/.test(o.css) ? ['Noto Serif TC'] : []),
].filter((f) => FAMILY_QS[f]);
const loadedFamilies = new Set(['JetBrains Mono', 'Chiron Hei HK']);
/** 瀏覽器端：第一次需要某套字型時才插入它的樣式表 */
export const ensureFonts = (families: Iterable<string>) => {
  if (typeof document === 'undefined') return;
  for (const f of families) {
    if (loadedFamilies.has(f) || !FAMILY_QS[f]) continue;
    loadedFamilies.add(f);
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${FAMILY_QS[f]}&display=swap`;
    document.head.appendChild(l);
  }
};

/** 畫布在自給自足的 run 裡用字型組合代碼查字型（匯出 HTML 時一起內嵌） */
export const FONTS_GLOBALS = `window.MA_FONTS=${JSON.stringify(Object.fromEntries(FONT_PACKS.map((f) => [f.id, f.stack])))};`;
(globalThis as unknown as { MA_FONTS: unknown }).MA_FONTS = Object.fromEntries(FONT_PACKS.map((f) => [f.id, f.stack]));

/** 讓畫布在第一次繪製前就載好字型（畫布不會自己觸發載入） */
export const preloadFonts = (text = '基地位置0123456789', id?: string) => {
  const fams = id ? fontPack(id).families : ['MA Num', 'Chiron Hei HK'];
  return Promise.all([400, 500, 700, 900].flatMap((w) => fams.map((f) => document.fonts.load(`${w} 40px "${f}"`, f === 'MA Num' ? '0123456789' : text)))).catch(() => undefined);
};

/** 字體選擇器（KC 定案）：黑體／明體 × 粗／中／細，套用到所有文字特效 */
export type FaceId = 'hei' | 'ming';
export type WeightId = 'bold' | 'medium' | 'light';
export const FACES: { id: FaceId; zh: string; family: string; stack: string; promptZh: string; promptEn: string }[] = [
  { id: 'hei', zh: '黑體', family: 'Noto Sans TC', stack: '"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif', promptZh: '思源黑體 Noto Sans TC', promptEn: 'Noto Sans TC' },
  { id: 'ming', zh: '明體', family: 'Noto Serif TC', stack: '"Noto Serif TC","PingFang TC","PMingLiU",serif', promptZh: '思源宋體 Noto Serif TC', promptEn: 'Noto Serif TC' },
];
export const WEIGHTS: { id: WeightId; zh: string; w: number }[] = [
  { id: 'bold', zh: '粗', w: 900 },
  { id: 'medium', zh: '中', w: 500 },
  { id: 'light', zh: '細', w: 300 },
];
export const FACE_IDS = FACES.map((f) => f.id);
export const WEIGHT_IDS = WEIGHTS.map((w) => w.id);
export const faceOf = (id?: string) => FACES.find((f) => f.id === id);
export const weightOf = (id?: string) => WEIGHTS.find((w) => w.id === id);

/** 預載選定的字體與字重（Google Fonts 依 unicode-range 分片，只下載用到的字） */
export const preloadFace = (face?: string, weight?: string, text = '基地位置0123456789') => {
  const f = faceOf(face);
  const w = weightOf(weight);
  const fams = f ? [f.family] : ['Chiron Hei HK'];
  const ws = w ? [w.w] : [300, 500, 900];
  return Promise.all(ws.flatMap((x) => fams.map((fam) => document.fonts.load(`${x} 40px "${fam}"`, text)))).catch(() => undefined);
};
