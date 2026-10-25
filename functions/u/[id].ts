// 讀取上傳的底圖：/u/<id>
import type { Ctx } from '../_lib/env';
import { getUpload } from '../_lib/store';

export const onRequestGet = async ({ env, params }: Ctx) => {
  try {
    const u = await getUpload(env, String(params.id));
    if (!u) return new Response('找不到這張圖', { status: 404 });
    return new Response(u.bytes, { headers: { 'content-type': u.mime, 'cache-control': 'public, max-age=31536000, immutable', 'access-control-allow-origin': '*' } });
  } catch (e) {
    return new Response(e instanceof Error ? e.message : '讀取失敗', { status: 503 });
  }
};
