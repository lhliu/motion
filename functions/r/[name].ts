// 繪製引擎：讓本機（例如 Claude Code + Playwright）逐格渲染，跟網站畫出來的一模一樣
import { PHOTO_GLOBALS } from '../../src/effects/photo';
import { MAP_GLOBALS } from '../../src/effects/map';
import { DROP_GLOBALS } from '../../src/drop';
import type { Ctx } from '../_lib/env';

const ENGINES: Record<string, { usage: string; code: string }> = {
  'photo.js': {
    usage: 'MA_PHOTO.drawPhoto(ctx, W, H, scene, tSeconds, images) — scene 為 build_photo_scene / get_preset 的場景；images 為已載入的 <img>，缺圖時畫示意圖',
    code: PHOTO_GLOBALS,
  },
  'map.js': { usage: 'MA_MAP.drawScene(ctx, W, H, scene, tSeconds, bgImage?)', code: MAP_GLOBALS },
  'drop.js': { usage: 'const { o, lines } = MA_DROP.parse(words); MA_DROP.draw(ctx, W, H, o, lines, tSeconds)', code: DROP_GLOBALS },
};

export const onRequestGet = async ({ params }: Ctx) => {
  const e = ENGINES[String(params.name)];
  if (!e) return new Response('// 可用：photo.js、map.js、drop.js', { status: 404, headers: { 'content-type': 'text/javascript; charset=utf-8' } });
  return new Response(`// Motion Atlas 繪製引擎\n// 用法：${e.usage}\n// 逐格渲染：t 從 0 開始，每格加 1/fps；畫布尺寸建議 1080×1920（9:16）\n${e.code}\n`, {
    headers: { 'content-type': 'text/javascript; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=300' },
  });
};
