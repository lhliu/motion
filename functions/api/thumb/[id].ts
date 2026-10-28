// 公開縮圖（D1 fx_thumbs）：/api/thumb/<id>?f=0..2；沒有就 404，後台顯示佔位
import type { Ctx } from '../../_lib/env';

export const onRequestGet = async ({ env, params, request }: Ctx) => {
  const id = String(params.id);
  const f = Number(new URL(request.url).searchParams.get('f') ?? 0) | 0;
  try {
    const r = await env.DB?.prepare('SELECT mime, data FROM fx_thumbs WHERE id = ? AND frame = ?').bind(id, f).first<{ mime: string; data: string }>();
    if (!r) return new Response('not found', { status: 404 });
    const bin = Uint8Array.from(atob(r.data), (c) => c.charCodeAt(0));
    return new Response(bin, { headers: { 'content-type': r.mime, 'cache-control': 'public, max-age=3600' } });
  } catch {
    return new Response('not found', { status: 404 });
  }
};
