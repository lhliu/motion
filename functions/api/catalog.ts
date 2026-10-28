// 公開：前台啟動時讀取的覆寫（不含備註、收藏）。沒有 D1 或尚未 migrate 時回空清單＝程式預設。
import { publicOv, useCatalog } from '../_lib/catalog';
import { json, preflight, type Ctx } from '../_lib/env';

export const onRequestGet = async ({ env }: Ctx) => {
  const doc = await useCatalog(env);
  return json({ version: doc?.version ?? '0', overrides: (doc?.overrides ?? []).map(publicOv) }, 200, { 'cache-control': 'public, max-age=30' });
};
export const onRequestOptions = preflight;
