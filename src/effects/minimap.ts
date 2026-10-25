// 小地圖公版（#339）：words[0] 是小地圖 JSON 規格（見 src/minimap.ts），透明背景，可當段落或疊加圖層。
// 16:9 依 place 放到右上角版（1400,55,寬 470）、雙人避臉版（600,40,寬 460）或自訂位置；直式畫面改成上方滿寬。
import type { Fx } from '../types';
import { MINI_PLACES, MINI_SAMPLE, miniSvg, normalizeMini, type MiniMap } from '../minimap';

export const miniFromWords = (w: string[]): MiniMap => {
  const j = w.find((x) => String(x).trim().startsWith('{'));
  if (j) {
    try {
      const r = normalizeMini(JSON.parse(j));
      if (r.map.roads.length) return r.map;
    } catch {
      /* JSON 壞掉就用範例 */
    }
  }
  return MINI_SAMPLE;
};

/** 同一頁可能有很多張小地圖（卡片牆），濾鏡與動畫名稱要各自獨立 */
const uid = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 'mm' + (h >>> 0).toString(36);
};

export const minimapFx: Fx = {
  id: 'minimap',
  no: 339,
  cat: 'mkit',
  zh: '小地圖',
  en: 'Mini Map Overlay',
  desc: '透明背景的簡化區位小地圖：主要道路帶路名、公園社宅等色塊、地標名稱，疊在影片角落',
  tags: ['地圖', '疊加', '區位', '步行'],
  tone: 'ink',
  sample: [JSON.stringify(MINI_SAMPLE)],
  hint: 'words 第一行放小地圖 JSON（roads 道路中心線、areas 區塊、places 地標、place 位置）；建議用 MCP 的 build_minimap 產生與檢查',
  preferredRatio: '16:9',
  added: '2026-10-25',
  motion:
    '透明背景的平面小地圖：深灰粗線條道路由起點畫到終點，路名白字順著路段方向排列；公園綠色、社宅金黃色（只標 A、B、C、D 圓形代號）、一般住宅淺藍、公共設施深藍等色塊淡入；地標名稱膠囊與短引線最後彈出；整張圖外緣有細白色描邊與淡陰影，沒有底板。16:9 預設放右上角（1920×1080 畫面的 x1400、y55、寬 470），也有雙人鏡頭避臉版（x600、y40、寬 460）。依真實道路與街廓簡化，不加路線、目前位置、指北針或圖例。',
  motionEn:
    'A transparent simplified area map: thick dark-grey roads draw in from end to end with white road names running along each segment; color blocks fade in — green parks, golden social-housing sites tagged only A/B/C/D, light-blue housing, deep-blue civic buildings; landmark name pills with short leaders pop in last; the whole map has a thin white outline and soft shadow with no backing plate. On 16:9 it sits top right by default (x1400, y55, 470 wide on a 1920×1080 frame) or in a between-two-faces spot (x600, y40, 460 wide). Simplified from real streets; no route, current position, compass or legend.',
  css: `
.S{background:transparent}
.S .mm{position:absolute;left:var(--x);top:var(--y);width:var(--w)}
.S .mm svg{display:block;width:100%;height:auto;overflow:visible}
@container (max-aspect-ratio:1/1){.S .mm{left:4cqw;top:7cqh;width:92cqw}}`,
  html: (w) => {
    const m = miniFromWords(w);
    const p = m.place === 'tr' || m.place === 'duo' ? MINI_PLACES[m.place] : m.place && typeof m.place === 'object' ? m.place : null;
    const pos = p ? `--x:${((p.x / 1920) * 100).toFixed(2)}%;--y:${((p.y / 1080) * 100).toFixed(2)}%;--w:${((p.w / 1920) * 100).toFixed(2)}%` : '--x:6%;--y:4%;--w:88%';
    return `<div class="mm" style="${pos}">${miniSvg(m, { anim: true, id: uid(w.join('')) })}</div>`;
  },
};
