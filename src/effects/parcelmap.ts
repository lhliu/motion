// 地籍棟距圖（#340）：words[0] 是地籍套繪 JSON 規格（見 src/parcelmap.ts）。整張圖置中、維持比例放進畫面。
import type { Fx } from '../types';
import { normalizeParcel, PARCEL_SAMPLE, parcelSvg, type ParcelMap } from '../parcelmap';

export const parcelFromWords = (w: string[]): ParcelMap => {
  const j = w.find((x) => String(x).trim().startsWith('{'));
  if (j) {
    try {
      const r = normalizeParcel(JSON.parse(j));
      if (!r.errors.length) return r.map;
    } catch {
      /* JSON 壞掉就用範例 */
    }
  }
  return PARCEL_SAMPLE;
};

const uid = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 'pc' + (h >>> 0).toString(36);
};

export const parcelMapFx: Fx = {
  id: 'parcel-dist',
  no: 340,
  cat: 'mplan',
  zh: '地籍棟距圖',
  en: 'Cadastral Building Distances',
  desc: '兩層棟距圖：地圖截圖當底圖，建物用黃色名牌（主角紅字），紅色箭頭標出到周邊建物的距離與退縮',
  tags: ['地籍', '棟距', '基地', '鄰棟'],
  tone: 'paper',
  sample: [JSON.stringify(PARCEL_SAMPLE)],
  hint: 'words 第一行放地籍棟距 JSON（parcels 地籍、roads 道路、buildings 建物且一棟 main、distances 距離）；建議用 MCP 的 build_parcel_map 產生與檢查',
  preferredRatio: '16:9',
  added: '2026-10-25',
  motion:
    '地圖截圖（或米白底）上，各棟建物以黃色色塊加深色框標出名稱與樓層，主角建物紅框紅字並彈出；接著逐條畫出距離：主要距離是紅色粗雙箭頭，旁邊紅底白字「約48／公尺」；次要距離與建物之間是紅色細線兩端短線、白底紅字；退縮標「退縮 4 公尺」；路名用大字黑體加白框，南北向直排；數字框自動避開建物與文字；左下註明示意與資料來源。',
  motionEn:
    'On a map screenshot (or off-white): each building is a yellow block with a dark outline showing its name and floors, the subject buildings in red outline and red text popping in; then distances draw in one by one — main ones as thick red double arrows with a red tag “approx. 48 / m” beside them, secondary ones and gaps between buildings as thin red lines with end ticks and white tags with red text, setbacks tagged “setback 4 m”; road names in large bold type with a white halo, set vertically for north–south roads; tags automatically avoid buildings and text; a note on accuracy and sources at the bottom left.',
  css: `
.S{background:var(--bg)}
.S .pc{position:absolute;inset:3%;display:grid;place-items:center}
.S .pc svg{display:block;max-width:100%;max-height:100%;width:auto;height:100%}
@container (max-aspect-ratio:1/1){.S .pc svg{width:100%;height:auto}}`,
  html: (w) => `<div class="pc">${parcelSvg(parcelFromWords(w), { anim: true, id: uid(w.join('')) })}</div>`,
};
