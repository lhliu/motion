// 上傳底圖：POST 圖片本體（content-type: image/*）或 JSON {"data":"data:image/...;base64,..."}，需要寫入金鑰。
// 回傳 {url, w, h}；url 可直接放進 build_parcel_map 的 base。
import { canWrite, json, preflight, type Ctx } from '../_lib/env';
import { saveUpload, StoreError } from '../_lib/store';

export const onRequestPost = async ({ request, env }: Ctx) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    let bytes: Uint8Array;
    if ((request.headers.get('content-type') ?? '').includes('json')) {
      const b = (await request.json()) as { data?: string };
      const m = /^data:image\/[a-z+]+;base64,(.+)$/i.exec(String(b.data ?? ''));
      if (!m) return json({ ok: false, error: 'data 要是 data:image/...;base64,... 格式' }, 400);
      bytes = Uint8Array.from(atob(m[1]), (c) => c.charCodeAt(0));
    } else bytes = new Uint8Array(await request.arrayBuffer());
    const u = await saveUpload(env, bytes);
    return json({ ok: true, id: u.id, url: `${new URL(request.url).origin}/u/${u.id}`, w: u.w, h: u.h, mime: u.mime }, 201);
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, e instanceof StoreError ? 400 : 500);
  }
};
export const onRequestOptions = preflight;
