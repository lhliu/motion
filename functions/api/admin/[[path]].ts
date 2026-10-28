// 後台 API（已由 _middleware.ts 驗證 Cloudflare Access）。
// 規則：編號永遠鎖定（沒有任何改編號的操作）；下架＝隱藏＋轉址，不刪。每次變更寫 fx_audit，可復原。
import { ALL_EFFECTS, CATALOG, CATEGORIES, NUM, SECTIONS } from '../../../src/data';
import { PICKS } from '../../../src/uses';
import { XPACKS } from '../../../src/effects/xpack';
import type { FxOverride } from '../../../src/catalog';
import { invalidateCatalog, readOverrides, rowToOv, useCatalog, type OvRow } from '../../_lib/catalog';
import { json, type D1Database, type Env } from '../../_lib/env';

type C = { request: Request; env: Env; params: { path?: string[] }; data: { email?: string } };
const now = () => new Date().toISOString();
const need = (env: Env): D1Database => { if (!env.DB) throw new Error('D1 未綁定'); return env.DB; };
const FIELDS = ['hidden', 'cat', 'sort', 'tags', 'featured', 'featured_sort', 'redirect', 'variant', 'note', 'fav'] as const;
const packOf = new Map<string, number>();
for (const p of XPACKS) for (const r of p.rows) packOf.set(`obj-xpack-${r[0]}`, p.pack);
const byId = () => new Map(ALL_EFFECTS.map((f) => [f.id, f]));

const getRows = async (db: D1Database, ids: string[]) => {
  const out = new Map<string, OvRow>();
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const r = await db.prepare(`SELECT * FROM fx_overrides WHERE id IN (${chunk.map(() => '?').join(',')})`).bind(...chunk).all<OvRow>();
    r.results.forEach((x) => out.set(x.id, x));
  }
  return out;
};
const putRow = async (db: D1Database, id: string, row: Partial<OvRow> | null) => {
  if (!row) return db.prepare('DELETE FROM fx_overrides WHERE id = ?').bind(id).run();
  const vals = FIELDS.map((k) => (row as Record<string, unknown>)[k] ?? null);
  if (vals.every((v) => v === null)) return db.prepare('DELETE FROM fx_overrides WHERE id = ?').bind(id).run();
  return db.prepare(`INSERT INTO fx_overrides (id, ${FIELDS.join(', ')}, updated_at) VALUES (?, ${FIELDS.map(() => '?').join(', ')}, ?)
    ON CONFLICT(id) DO UPDATE SET ${FIELDS.map((k) => `${k} = excluded.${k}`).join(', ')}, updated_at = excluded.updated_at`).bind(id, ...vals, now()).run();
};
const audit = async (db: D1Database, actor: string, action: string, summary: string, before: Record<string, OvRow | null>, after: Record<string, Partial<OvRow> | null>) =>
  db.prepare('INSERT INTO fx_audit (at, actor, action, summary, before, after) VALUES (?, ?, ?, ?, ?, ?)').bind(now(), actor, action, summary, JSON.stringify(before), JSON.stringify(after)).run();

/** 對多個 id 套用 patch（含 addTags／removeTags），寫入並記錄 */
const change = async (db: D1Database, actor: string, action: string, summary: string, ids: string[], patch: (id: string, cur: Partial<OvRow>) => Partial<OvRow>) => {
  const fx = byId();
  const valid = [...new Set(ids)].filter((id) => fx.has(id)).slice(0, 700);
  if (!valid.length) throw new Error('沒有有效的招式 id');
  const rows = await getRows(db, valid);
  const before: Record<string, OvRow | null> = {}, after: Record<string, Partial<OvRow> | null> = {};
  for (const id of valid) {
    const cur = rows.get(id) ?? null;
    before[id] = cur;
    const next = { ...(cur ?? {}), ...patch(id, { ...(cur ?? {}) }) };
    after[id] = next;
    await putRow(db, id, next);
  }
  await audit(db, actor, action, summary, before, after);
  invalidateCatalog();
  return valid.length;
};

const effectsView = (ovs: FxOverride[]) => {
  const ov = new Map(ovs.map((o) => [o.id, o]));
  const picks = new Set(PICKS);
  const catSec = new Map(CATEGORIES.map((c) => [c.id, c.sec]));
  return ALL_EFFECTS.map((f, order) => {
    const b = CATALOG.base(f.id)!;
    const o = ov.get(f.id);
    return {
      id: f.id, no: NUM.get(f.id), zh: f.zh, en: f.en, desc: f.desc, cat: f.cat, sec: catSec.get(f.cat), baseCat: b.cat, tags: f.tags, hidden: !!f.hidden, baseHidden: b.hidden,
      redirect: f.redirectTo ?? null, variant: f.variant ?? null, featured: picks.has(f.id), note: o?.note ?? '', fav: !!o?.fav, sort: o?.sort ?? null, order,
      added: f.added ?? '', pack: packOf.get(f.id) ?? null, overridden: !!o,
    };
  });
};

const scanRefs = (text: string, ids: Set<string>) => { const found = new Set<string>(); for (const m of text.matchAll(/"effect"\s*:\s*"([^"]+)"/g)) found.add(m[1]); return [...found].filter((x) => ids.size === 0 || true); };

export const onRequest = async (ctx: C) => {
  const { request, env } = ctx;
  const path = (ctx.params.path ?? []).join('/');
  const actor = ctx.data.email ?? '?';
  try {
    if (request.method === 'GET' && path === 'catalog') {
      const db = need(env);
      const ovs = await readOverrides(db).catch(() => [] as FxOverride[]);
      await useCatalog(env);
      const rep = CATALOG.apply({ overrides: ovs });
      return json({ me: actor, sections: SECTIONS, categories: CATEGORIES, effects: effectsView(ovs), picks: PICKS, report: rep, packs: XPACKS.map((p) => ({ pack: p.pack, name: p.name, cat: p.cat })) });
    }
    if (request.method === 'GET' && path === 'audit') {
      const r = await need(env).prepare('SELECT seq, at, actor, action, summary, undone, before, after FROM fx_audit ORDER BY seq DESC LIMIT 200').all();
      return json({ items: r.results.map((x) => ({ ...x, count: Object.keys(JSON.parse(String(x.before))).length, before: undefined, after: undefined })) });
    }
    if (request.method === 'POST' && path === 'ops') {
      const db = need(env);
      const a = (await request.json()) as Record<string, unknown>;
      const ids = Array.isArray(a.ids) ? a.ids.map(String) : [];
      const op = String(a.op);
      const fx = byId();
      let n = 0;
      if (op === 'hide' || op === 'show') n = await change(db, actor, op, `${op === 'hide' ? '隱藏' : '顯示'} ${ids.length} 招`, ids, (id) => ({ hidden: (op === 'hide') === CATALOG.base(id)!.hidden ? null : op === 'hide' ? 1 : 0 }));
      else if (op === 'cat') {
        const cat = String(a.cat);
        if (!CATEGORIES.some((c) => c.id === cat)) throw new Error(`子分類 ${cat} 不存在`);
        n = await change(db, actor, op, `改分類 → ${cat}（${ids.length} 招）`, ids, (id) => ({ cat: CATALOG.base(id)!.cat === cat ? null : cat, sort: null }));
      } else if (op === 'tags') {
        const add = (Array.isArray(a.add) ? a.add : []).map(String).filter(Boolean), rm = new Set((Array.isArray(a.remove) ? a.remove : []).map(String));
        n = await change(db, actor, op, `標籤 +${add.join('、') || '－'} −${[...rm].join('、') || '－'}（${ids.length} 招）`, ids, (id) => {
          const cur = fx.get(id)!.tags;
          const next = [...new Set([...cur.filter((t) => !rm.has(t)), ...add])];
          const base = CATALOG.base(id)!.tags;
          return { tags: JSON.stringify(next) === JSON.stringify(base) ? null : JSON.stringify(next) };
        });
      } else if (op === 'featured') {
        const on = !!a.on, basePicks = new Set(PICKS);
        n = await change(db, actor, op, `${on ? '設為' : '取消'}精選（${ids.length} 招）`, ids, (id) => ({ featured: on ? 1 : 0, featured_sort: on ? (basePicks.has(id) ? null : Date.now() % 1e9) : null }));
      } else if (op === 'fav') n = await change(db, actor, op, `${a.on ? '加入' : '移除'}收藏（${ids.length} 招）`, ids, () => ({ fav: a.on ? 1 : null }));
      else if (op === 'note') n = await change(db, actor, op, `備註 ${ids[0]}`, ids.slice(0, 1), () => ({ note: String(a.note ?? '').slice(0, 2000) || null }));
      else if (op === 'order') {
        // 只改顯示順序，不動編號
        const list = ids.filter((id) => fx.has(id));
        n = await change(db, actor, op, `排序 ${String(a.cat ?? '')}（${list.length} 招）`, list, (id) => ({ sort: list.indexOf(id) }));
      } else if (op === 'merge') {
        const main = String(a.main);
        const m = fx.get(main);
        if (!m) throw new Error('主招不存在');
        const others = ids.filter((id) => id !== main);
        const samePack = (id: string) => packOf.get(id) != null && packOf.get(id) === packOf.get(main);
        n = await change(db, actor, op, `合併 ${others.length} 招 → ${main}`, others, (id) => ({ hidden: 1, redirect: main, variant: samePack(id) ? id.replace('obj-xpack-', '') : null }));
      } else if (op === 'unmerge') n = await change(db, actor, op, `取消轉址（${ids.length} 招）`, ids, (id) => (CATALOG.base(id)!.redirectTo ? { redirect: '', variant: null, hidden: 0 } : { redirect: null, variant: null, hidden: null }));
      else if (op === 'reset') n = await change(db, actor, op, `回到程式預設（${ids.length} 招）`, ids, () => Object.fromEntries(FIELDS.map((k) => [k, null])));
      else throw new Error(`不支援的操作 ${op}`);
      return json({ ok: true, changed: n });
    }
    if (request.method === 'POST' && path === 'undo') {
      const db = need(env);
      const { seq } = (await request.json()) as { seq: number };
      const row = await db.prepare('SELECT * FROM fx_audit WHERE seq = ?').bind(seq).first<{ before: string; after: string; undone: number; summary: string }>();
      if (!row) throw new Error('找不到這筆紀錄');
      if (row.undone) throw new Error('已經復原過');
      const before = JSON.parse(row.before) as Record<string, OvRow | null>;
      const cur = await getRows(db, Object.keys(before));
      for (const [id, r] of Object.entries(before)) await putRow(db, id, r);
      await db.prepare('UPDATE fx_audit SET undone = 1 WHERE seq = ?').bind(seq).run();
      await audit(db, actor, 'undo', `復原 #${seq}：${row.summary}`, Object.fromEntries(Object.keys(before).map((id) => [id, cur.get(id) ?? null])), before);
      invalidateCatalog();
      return json({ ok: true });
    }
    if (request.method === 'GET' && path === 'combos') {
      // Combo 健檢：列出用到已隱藏／轉址／不存在招式的 Combo 與預設
      const db = need(env);
      await useCatalog(env);
      const fx = byId();
      const out: { kind: string; id: string; title: string; refs: { effect: string; status: string; target?: string; variant?: string | null }[] }[] = [];
      const check = (kind: string, id: string, title: string, text: string) => {
        const refs = scanRefs(text, new Set()).flatMap((e) => {
          const f = fx.get(e);
          if (!f) return [{ effect: e, status: 'missing' }];
          if (f.redirectTo) return [{ effect: e, status: 'redirect', target: f.redirectTo, variant: f.variant ?? null }];
          if (f.hidden) return [{ effect: e, status: 'hidden' }];
          return [];
        });
        if (refs.length) out.push({ kind, id, title, refs });
      };
      const cs = await db.prepare('SELECT id, title, data FROM combos').all<{ id: string; title: string; data: string }>().catch(() => ({ results: [] as { id: string; title: string; data: string }[] }));
      cs.results.forEach((c) => check('combo', c.id, c.title, c.data));
      const ps = await db.prepare('SELECT id, name, data FROM presets').all<{ id: string; name: string; data: string }>().catch(() => ({ results: [] as { id: string; name: string; data: string }[] }));
      ps.results.forEach((p) => check('preset', p.id, p.name, p.data));
      return json({ items: out, scanned: { combos: cs.results.length, presets: ps.results.length } });
    }
    if (request.method === 'POST' && path === 'combos/fix') {
      // 把 Combo 裡已轉址的招式改寫成主招（有變體的保留原招：隱藏的原招仍可播放）
      const db = need(env);
      await useCatalog(env);
      const { id } = (await request.json()) as { id: string };
      const row = await db.prepare('SELECT data FROM combos WHERE id = ?').bind(id).first<{ data: string }>();
      if (!row) throw new Error('Combo 不存在');
      const fx = byId();
      let changed = 0;
      const data = row.data.replace(/"effect"\s*:\s*"([^"]+)"/g, (m, e: string) => { const f = fx.get(e); if (f?.redirectTo && !f.variant) { changed++; return `"effect":"${f.redirectTo}"`; } return m; });
      if (changed) {
        await db.prepare('UPDATE combos SET data = ?, updated_at = ? WHERE id = ?').bind(data, now(), id).run();
        await audit(db, actor, 'combo-fix', `Combo ${id} 改寫 ${changed} 段`, {}, {});
      }
      return json({ ok: true, changed });
    }
    if (request.method === 'POST' && path === 'thumbs') {
      const db = need(env);
      const { id, frame = 0, data, mime = 'image/webp' } = (await request.json()) as { id: string; frame?: number; data: string; mime?: string };
      if (!byId().has(id) || typeof data !== 'string' || data.length > 400_000) throw new Error('縮圖格式不符（id 不存在或超過 300 KB）');
      await db.prepare('INSERT INTO fx_thumbs (id, frame, mime, data, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id, frame) DO UPDATE SET mime = excluded.mime, data = excluded.data, updated_at = excluded.updated_at').bind(id, Number(frame) | 0, mime, data, now()).run();
      return json({ ok: true });
    }
    if (request.method === 'GET' && path === 'thumbs') {
      const r = await need(env).prepare('SELECT id, COUNT(*) AS frames, MAX(updated_at) AS at FROM fx_thumbs GROUP BY id').all();
      return json({ items: r.results });
    }
    if (request.method === 'GET' && path === 'export') {
      // 固化匯出：給 scripts/bake-catalog.mjs 寫回 src/catalog.baked.json（仍是隱藏＋轉址，不刪招）
      const ovs = await readOverrides(need(env));
      return json({ kind: 'motion-atlas-catalog', exported_at: now(), by: actor, overrides: ovs.map(({ updated_at: _u, ...o }) => o) });
    }
    return json({ error: `找不到 ${request.method} /api/admin/${path}` }, 404);
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
};
