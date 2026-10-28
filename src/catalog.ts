// 後台覆寫層（D1 fx_overrides）：在程式預設之上套用「隱藏、分類、排序、標籤、精選、轉址」。
// 規則：id 與編號永遠不變（覆寫沒有編號欄位）；下架＝隱藏＋轉址，不刪。套用失敗或沒有覆寫時，一律回到程式預設。
// 這個檔不引用 data.ts，方便單元測試；data.ts 建立實例並匯出 CATALOG。
import type { Category, Fx } from './types';

export interface FxOverride {
  id: string;
  hidden?: boolean | null;
  cat?: string | null;
  /** 同一子分類內的順序（0 起）；null＝用程式預設順序 */
  sort?: number | null;
  tags?: string[] | null;
  featured?: boolean | null;
  /** 精選清單內的順序 */
  featuredSort?: number | null;
  redirect?: string | null;
  variant?: string | null;
  note?: string | null;
  fav?: boolean | null;
  updated_at?: string;
}
export interface CatalogDoc {
  version?: string;
  overrides: FxOverride[];
}
export interface ApplyReport {
  applied: number;
  orphans: string[];
  invalid: string[];
}

type Base = { hidden: boolean; cat: Fx['cat']; tags: string[]; redirectTo?: string; variant?: string; idx: number };

export const createCatalog = (opts: { all: Fx[]; effects: Fx[]; categories: Category[]; picks: string[]; secRank: (cat: string) => number }) => {
  const { all, effects, categories, picks, secRank } = opts;
  const base = new Map<string, Base>(all.map((f, idx) => [f.id, { hidden: !!f.hidden, cat: f.cat, tags: [...f.tags], redirectTo: f.redirectTo, variant: f.variant, idx }]));
  const baseOrder = [...all];
  const basePicks = [...picks];
  const catIds = new Set(categories.map((c) => c.id));
  const catRank = new Map(categories.map((c, i) => [c.id, i]));
  let current: CatalogDoc = { overrides: [] };
  let notes = new Map<string, FxOverride>();

  const reset = () => {
    for (const f of baseOrder) {
      const b = base.get(f.id)!;
      f.hidden = b.hidden || undefined;
      f.cat = b.cat;
      f.tags = [...b.tags];
      f.redirectTo = b.redirectTo;
      f.variant = b.variant;
    }
    all.splice(0, all.length, ...baseOrder);
    effects.splice(0, effects.length, ...all.filter((f) => !f.hidden));
    picks.splice(0, picks.length, ...basePicks);
  };

  const apply = (doc: CatalogDoc | null | undefined): ApplyReport => {
    const rep: ApplyReport = { applied: 0, orphans: [], invalid: [] };
    reset();
    current = { overrides: [] };
    notes = new Map();
    if (!doc || !Array.isArray(doc.overrides)) return rep;
    try {
      const byId = new Map(baseOrder.map((f) => [f.id, f]));
      const sortOf = new Map<string, number>();
      const feat: { id: string; s: number }[] = [];
      const featOff = new Set<string>();
      for (const o of doc.overrides) {
        const f = o && byId.get(o.id);
        if (!f) { if (o?.id) rep.orphans.push(o.id); continue; }
        notes.set(f.id, o);
        if (typeof o.hidden === 'boolean') f.hidden = o.hidden || undefined;
        if (o.cat != null) { if (catIds.has(o.cat as Fx['cat'])) f.cat = o.cat as Fx['cat']; else rep.invalid.push(`${o.id}: 子分類 ${o.cat} 不存在`); }
        if (Array.isArray(o.tags)) f.tags = o.tags.map(String).map((t) => t.trim()).filter(Boolean).slice(0, 20);
        if (o.redirect != null) {
          if (o.redirect !== f.id && byId.has(o.redirect)) { f.redirectTo = o.redirect; f.variant = o.variant ?? undefined; }
          else if (o.redirect === '') { f.redirectTo = undefined; f.variant = undefined; }
          else rep.invalid.push(`${o.id}: 轉址目標 ${o.redirect} 不存在`);
        }
        if (typeof o.sort === 'number' && Number.isFinite(o.sort)) sortOf.set(f.id, o.sort);
        if (o.featured === true) feat.push({ id: f.id, s: o.featuredSort ?? 1e6 });
        if (o.featured === false) featOff.add(f.id);
        rep.applied++;
      }
      // 轉址不能串成環：沿著走最多 5 層，走不完就取消
      for (const f of baseOrder) {
        let t = f.redirectTo, n = 0;
        while (t && n < 6) { t = byId.get(t)?.redirectTo; n++; }
        if (n >= 6) { rep.invalid.push(`${f.id}: 轉址成環`); f.redirectTo = undefined; f.variant = undefined; }
      }
      // 換分類的招式移到新分類那一區（文字區依用途排序不動）；同子分類內依 sort，其餘維持程式順序
      const key = (f: Fx) => secRank(f.cat);
      const ordered = [...baseOrder].map((f, i) => ({ f, i }));
      const moved = ordered.some(({ f }) => f.cat !== base.get(f.id)!.cat);
      if (moved) ordered.sort((a, b) => key(a.f) - key(b.f) || (key(a.f) === 0 ? 0 : catRank.get(a.f.cat)! - catRank.get(b.f.cat)!) || a.i - b.i);
      const list = ordered.map((x) => x.f);
      if (sortOf.size) {
        const groups = new Map<string, number[]>();
        list.forEach((f, i) => { const g = groups.get(f.cat) ?? []; g.push(i); groups.set(f.cat, g); });
        for (const idx of groups.values()) {
          const members = idx.map((i) => list[i]);
          if (!members.some((f) => sortOf.has(f.id))) continue;
          const rank = new Map(members.map((f, r) => [f.id, r]));
          const sorted = [...members].sort((a, b) => (sortOf.get(a.id) ?? rank.get(a.id)!) - (sortOf.get(b.id) ?? rank.get(b.id)!) || rank.get(a.id)! - rank.get(b.id)!);
          idx.forEach((pos, r) => (list[pos] = sorted[r]));
        }
      }
      all.splice(0, all.length, ...list);
      effects.splice(0, effects.length, ...all.filter((f) => !f.hidden));
      const vis = new Set(effects.map((f) => f.id));
      const p = basePicks.filter((id) => !featOff.has(id) && !feat.some((x) => x.id === id));
      feat.sort((a, b) => a.s - b.s);
      const out = [...feat.map((x) => x.id), ...p].filter((id) => vis.has(id));
      picks.splice(0, picks.length, ...out);
      current = { version: doc.version, overrides: doc.overrides.filter((o) => byId.has(o?.id)) };
    } catch (e) {
      // 任何意外都回到程式預設，網站不能因為覆寫壞掉
      reset();
      rep.invalid.push(`套用失敗，已回到預設：${String(e)}`);
      rep.applied = 0;
    }
    return rep;
  };

  /** 依轉址找最終招式（舊連結、MCP 用）；回傳目標與變體 */
  const resolve = (id: string): { fx: Fx; variant?: string; from?: Fx } | undefined => {
    const byId = new Map(baseOrder.map((f) => [f.id, f]));
    const start = byId.get(id);
    if (!start) return undefined;
    let f = start, variant: string | undefined, n = 0;
    while (f.redirectTo && n < 5) { const t = byId.get(f.redirectTo); if (!t) break; variant = f.variant ?? variant; f = t; n++; }
    return f === start ? { fx: f } : { fx: f, variant, from: start };
  };

  return { apply, reset, resolve, current: () => current, meta: (id: string) => notes.get(id), base: (id: string) => base.get(id) };
};
export type Catalog = ReturnType<typeof createCatalog>;

/** 前台載入覆寫：逾時或失敗就用程式預設 */
export const fetchCatalog = async (url = '/api/catalog', ms = 1500): Promise<CatalogDoc | null> => {
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    const r = await fetch(url, { signal: ac.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    const j = (await r.json()) as CatalogDoc;
    return Array.isArray(j?.overrides) ? j : null;
  } catch {
    return null;
  }
};
