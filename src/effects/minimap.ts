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
  desc: '透明背景的簡化地圖：土地使用分區（住宅、文教、公園、機關等用途配色＋圖例）、道路分級與方點巷道、指北針，預設疊在影片右上角',
  tags: ['地圖', '疊加', '區位', '步行'],
  tone: 'ink',
  sample: [JSON.stringify(MINI_SAMPLE)],
  hint: 'words 第一行放小地圖 JSON（roads 道路中心線、areas 區塊、places 地標、place 位置、kind 用途、palette 配色表、legend 圖例、style flat 平面風格、north 指北針）；建議用 MCP 的 build_minimap 產生與檢查',
  preferredRatio: '16:9',
  added: '2026-10-25',
  motion:
    '透明背景的平面土地使用分區示意圖，放在 16:9 畫面右上角（1920×1080 的 x1400、y55、寬 470）：轉正後的棋盤街廓，灰色主要道路、次要道路由起點畫到終點、路口平頭相接，方點虛線巷道淡入；住宅區淺青、文教區紫、公園用地綠、機關用地橘等色塊淡入；左上角藍色圓形指北針（淺色導航箭頭、灰色 N 字）與左下角白底圖例最後彈出；街廓上不放文字。同一個公版也能改雙人鏡頭避臉版（x600、y40、寬 460）或滿版，或改成白色外緣陰影、深灰道路帶白色路名與地標膠囊的區位小地圖。',
  motionEn:
    'A transparent flat land-use zoning map in the top-right of a 16:9 frame (x1400, y55, 470 wide on 1920×1080): a straightened grid of blocks, grey main and minor roads draw in end to end with square-cut junctions, dotted lanes fade in; color blocks fade in — light-cyan residential, purple education, green park, orange government land; a blue round compass (pale navigation arrow, grey N) top left and a white legend bottom left pop in last; no text on the blocks. The same template also works between two faces (x600, y40, 460 wide) or full screen, or as an outlined location map with dark roads, white road names and landmark pills.',
  css: `
.S{background:transparent}
.S .mm{position:absolute;left:var(--x);top:var(--y);width:var(--w)}
.S .mm svg{display:block;width:100%;height:auto;overflow:visible}
@container (max-aspect-ratio:1/1){.S .mm{left:4cqw;top:7cqh;width:92cqw}}`,
  html: (w) => {
    const m = miniFromWords(w);
    const p = m.place === 'tr' || m.place === 'duo' ? MINI_PLACES[m.place] : m.place && typeof m.place === 'object' ? m.place : null;
    // full：整張畫布等比例塞進 16:9 畫面置中（1920×1080 畫布剛好滿版）
    const r = (m.w ?? 1410) / (m.h ?? 1128) / (16 / 9), fw = Math.min(100, r * 100), fh = fw / r;
    const pos = p ? `--x:${((p.x / 1920) * 100).toFixed(2)}%;--y:${((p.y / 1080) * 100).toFixed(2)}%;--w:${((p.w / 1920) * 100).toFixed(2)}%` : `--x:${((100 - fw) / 2).toFixed(2)}%;--y:${((100 - fh) / 2).toFixed(2)}%;--w:${fw.toFixed(2)}%`;
    return `<div class="mm" style="${pos}">${miniSvg(m, { anim: true, id: uid(w.join('')) })}</div>`;
  },
};
