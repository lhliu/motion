import { COSMOS_GLOBALS } from '../../src/effects/cosmos';
import { NATURE_GLOBALS } from '../../src/effects/nature';
import { TRANSPORT_GLOBALS } from '../../src/effects/transport';
import { ILLUSTRATION_GLOBALS } from '../../src/effects/illustrated';
// 繪製引擎：讓本機（例如 Claude Code + Playwright）逐格渲染，跟網站畫出來的一模一樣
import { DROP_GLOBALS } from '../../src/drop';
import { CHART_GLOBALS, MAP_GLOBALS, MAPFX_GLOBALS, OBJ_GLOBALS, PHOTO_GLOBALS, PLAN_GLOBALS, TRANSIT_GLOBALS } from '../../src/engines-all';
import type { Ctx } from '../_lib/env';
import { NUM_FONT_CSS } from '../../src/fonts';

const ENGINES: Record<string, { usage: string; code: string }> = {
  'photo.js': {
    usage: 'MA_PHOTO.drawPhoto(ctx, W, H, scene, tSeconds, images) — scene 為 build_photo_scene / get_preset 的場景；images 為已載入的 <img>，缺圖時畫示意圖',
    code: PHOTO_GLOBALS,
  },
  'map.js': { usage: 'MA_MAP.drawScene(ctx, W, H, scene, tSeconds, bgImage?)', code: MAP_GLOBALS },
  'cosmos.js':{usage:'const renderer=MA_COSMOS.createRenderer(canvas,overlayCanvas,scene,assetOrigin); await renderer.ready; renderer.render(t,W,H); renderer.dispose();',code:COSMOS_GLOBALS},
  'nature.js':{usage:'const renderer=MA_NATURE.createRenderer(canvas,overlayCanvas,scene,assetOrigin); await renderer.ready; renderer.render(t,W,H); renderer.dispose();',code:NATURE_GLOBALS},
  'transport.js': {usage:'const renderer=MA_TRANSPORT.createRenderer(canvas,overlayCanvas,scene,assetOrigin); await renderer.ready; renderer.render(t,W,H); // dispose when done',code:TRANSPORT_GLOBALS},
  'illustration.js': {usage:'const renderer=MA_ILLUSTRATION.createRenderer(glCanvas,particleCanvas,scene,assetOrigin); await renderer.ready; renderer.render(t,W,H); // composite both canvases; dispose when done',code:ILLUSTRATION_GLOBALS},
  'obj.js': { usage: 'MA_OBJ.drawObj(ctx, W, H, scene, tSeconds) — scene 為 build_object_scene 的 scene', code: OBJ_GLOBALS },
  'plan.js': { usage: 'MA_PLAN.drawPlan(ctx, W, H, scene, tSeconds, [img1, img2]) — scene 為 build_plan_scene 的 scene；缺圖且 images 為 sample:* 時畫內建示意圖', code: PLAN_GLOBALS },
  'mapfx.js': { usage: 'MA_MAPX.draw(ctx, W, H, mode, words, tSeconds, { fg, bg, ac, ac2, font }) — mode 為特效代碼去掉 mx- 前綴；words 與卡片相同；回傳循環秒數', code: MAPFX_GLOBALS },
  'chart.js': { usage: 'const d = MA_CHART.parse(words); MA_CHART.draw(ctx, W, H, kind, d, tSeconds, { fg, bg, ac, ac2 }) — kind 為特效代碼去掉 chart- 前綴（column、line、pie…）；words 與卡片相同', code: CHART_GLOBALS },
  'transit.js': { usage: 'const net = MA_TRANSIT.parse(words); MA_TRANSIT.draw(ctx, W, H, net, tSeconds, { fg, bg }) — words 與 transit-* 卡片相同', code: TRANSIT_GLOBALS },
  'drop.js': { usage: 'const { o, lines } = MA_DROP.parse(words); MA_DROP.draw(ctx, W, H, o, lines, tSeconds)', code: DROP_GLOBALS },
};

export const onRequestGet = async ({ params }: Ctx) => {
  // 字型：昭源黑體（Google Fonts）＋只含數字的 Anton；本機渲染頁面用 <link rel="stylesheet" href=".../r/fonts.css"> 載入
  if (String(params.name) === 'fonts.css')
    return new Response(`@import url("https://fonts.googleapis.com/css2?family=Chiron+Hei+HK:wght@300;400;500;700;800;900&family=Noto+Sans+TC:wght@400;500;700;900&display=block");\n${NUM_FONT_CSS}\n`, {
      headers: { 'content-type': 'text/css; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=3600' },
    });
  const e = ENGINES[String(params.name)];
  if (!e) return new Response('// 可用：photo.js、map.js、mapfx.js、illustration.js、obj.js、drop.js、chart.js、transit.js、plan.js、fonts.css', { status: 404, headers: { 'content-type': 'text/javascript; charset=utf-8' } });
  return new Response(`// Motion Atlas 繪製引擎\n// 用法：${e.usage}\n// 逐格渲染：t 從 0 開始，每格加 1/fps；畫布尺寸建議 1080×1920（9:16）\n// 字型：頁面先載入 /r/fonts.css，並在畫第一格前 await document.fonts.load（Chiron Hei HK 與 MA Num 兩種字型）\n${e.code}\n`, {
    headers: { 'content-type': 'text/javascript; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=300' },
  });
};
