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
  desc: '類似地籍套繪圖：地籍線與地號、主要建物主色突顯，標出到周邊建物的距離',
  tags: ['地籍', '棟距', '基地', '鄰棟'],
  tone: 'paper',
  sample: [JSON.stringify(PARCEL_SAMPLE)],
  hint: 'words 第一行放地籍棟距 JSON（parcels 地籍、roads 道路、buildings 建物且一棟 main、distances 距離）；建議用 MCP 的 build_parcel_map 產生與檢查',
  preferredRatio: '16:9',
  added: '2026-10-25',
  motion:
    '米白底的地籍套繪圖：道路以淺灰帶狀淡入並標路名，地籍分割細線一筆畫出、各地塊角落標地號，基地外框加粗；周邊建物以灰色斜線填充淡入並標名稱；主要建物以主色塊彈出，中央白底名稱標籤與樓層註記；最後從主要建物最近的一邊，逐條拉出到各鄰棟的距離標註線（兩端垂直短線、白底數字順著線方向），換算的距離用虛線並標「約」；右上指北針、右下比例尺、左下註明示意與資料來源。',
  motionEn:
    'A cadastral overlay on off-white: roads fade in as light-grey bands with names, parcel lines draw in stroke by stroke with lot numbers in each corner, the site outline in bold; neighboring buildings fade in with grey hatching and names; the main building pops in as an accent block with a white name tag and floor note; finally dimension lines extend one by one from the main building’s nearest side to each neighbor (end ticks, white-backed numbers along the line), estimated distances dashed and marked “approx.”; north arrow top right, scale bar bottom right, a note on accuracy and source bottom left.',
  css: `
.S{background:var(--bg)}
.S .pc{position:absolute;inset:3%;display:grid;place-items:center}
.S .pc svg{display:block;max-width:100%;max-height:100%;width:auto;height:100%}
@container (max-aspect-ratio:1/1){.S .pc svg{width:100%;height:auto}}`,
  html: (w) => `<div class="pc">${parcelSvg(parcelFromWords(w), { anim: true, id: uid(w.join('')) })}</div>`,
};
