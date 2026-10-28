// 伺服器端套用後台覆寫：/api/effects、MCP、Combo 頁都讀同一份。表不存在或 D1 失敗時用程式預設。
import { CATALOG } from '../../src/data';
import type { CatalogDoc, FxOverride } from '../../src/catalog';
import type { D1Database, Env } from './env';

export type OvRow = { id: string; hidden: number | null; cat: string | null; sort: number | null; tags: string | null; featured: number | null; featured_sort: number | null; redirect: string | null; variant: string | null; note: string | null; fav: number | null; updated_at: string };

const b = (v: number | null) => (v == null ? null : !!v);
export const rowToOv = (r: OvRow): FxOverride => ({
  id: r.id, hidden: b(r.hidden), cat: r.cat, sort: r.sort, tags: r.tags ? (JSON.parse(r.tags) as string[]) : null, featured: b(r.featured), featuredSort: r.featured_sort,
  redirect: r.redirect, variant: r.variant, note: r.note, fav: b(r.fav), updated_at: r.updated_at,
});
/** 公開用：拿掉內部備註與收藏 */
export const publicOv = (o: FxOverride): FxOverride => { const { note: _n, fav: _f, ...rest } = o; return rest; };

export const readOverrides = async (db: D1Database): Promise<FxOverride[]> => {
  const r = await db.prepare('SELECT * FROM fx_overrides').all<OvRow>();
  return r.results.map(rowToOv);
};

let cache: { at: number; doc: CatalogDoc | null } | null = null;
const TTL = 30_000;
export const invalidateCatalog = () => { cache = null; };

/** 每個請求前呼叫；30 秒內重複使用 */
export const useCatalog = async (env: Env): Promise<CatalogDoc | null> => {
  if (cache && Date.now() - cache.at < TTL) return cache.doc;
  let doc: CatalogDoc | null = null;
  try {
    if (env.DB) {
      const overrides = await readOverrides(env.DB);
      const v = overrides.reduce((m, o) => (o.updated_at && o.updated_at > m ? o.updated_at : m), '');
      doc = { version: v || '0', overrides };
    }
  } catch {
    doc = null; // 表還沒建立（尚未 migrate）等情況：程式預設
  }
  CATALOG.apply(doc);
  cache = { at: Date.now(), doc };
  return doc;
};
