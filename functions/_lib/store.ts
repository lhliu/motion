import type { Combo } from '../../src/combo';
import type { D1Database, Env } from './env';

const SCHEMA = `CREATE TABLE IF NOT EXISTS combos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  brief TEXT,
  tags TEXT,
  data TEXT NOT NULL,
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

let ready: Promise<unknown> | null = null;

export class StoreError extends Error {}

export const db = async (env: Env): Promise<D1Database> => {
  if (!env.DB)
    throw new StoreError('Combo 資料庫尚未綁定：請在 Cloudflare Pages 專案 → 設定 → 繫結，新增 D1 資料庫，變數名稱填 DB。');
  ready ??= env.DB.prepare(SCHEMA)
    .run()
    .catch((e) => {
      ready = null;
      throw e;
    });
  await ready;
  return env.DB;
};

const newId = () => {
  const a = crypto.getRandomValues(new Uint8Array(6));
  return 'c' + Array.from(a, (b) => (b % 36).toString(36)).join('');
};

interface Row {
  id: string;
  data: string;
  created_at: string;
  updated_at: string;
}

const hydrate = (r: Row): Combo => ({ ...(JSON.parse(r.data) as Combo), id: r.id, created_at: r.created_at, updated_at: r.updated_at });

export const listCombos = async (env: Env, q = '', tag = '', limit = 50): Promise<Combo[]> => {
  const d = await db(env);
  const where: string[] = [];
  const args: unknown[] = [];
  if (q) {
    where.push('(title LIKE ?1 OR brief LIKE ?1 OR tags LIKE ?1 OR data LIKE ?1)');
    args.push(`%${q}%`);
  }
  if (tag) {
    where.push(`tags LIKE ?${args.length + 1}`);
    args.push(`%"${tag}"%`);
  }
  const sql = `SELECT id,data,created_at,updated_at FROM combos ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY updated_at DESC LIMIT ${Math.min(200, Math.max(1, limit))}`;
  const res = await d.prepare(sql).bind(...args).all<Row>();
  return res.results.map(hydrate);
};

export const getCombo = async (env: Env, id: string): Promise<Combo | null> => {
  const d = await db(env);
  const r = await d.prepare('SELECT id,data,created_at,updated_at FROM combos WHERE id = ?1').bind(id).first<Row>();
  return r ? hydrate(r) : null;
};

export const saveCombo = async (env: Env, c: Combo, id?: string): Promise<Combo> => {
  const d = await db(env);
  const now = new Date().toISOString();
  const body = { ...c, id: undefined, created_at: undefined, updated_at: undefined };
  const data = JSON.stringify(body);
  if (id) {
    const existing = await getCombo(env, id);
    if (!existing) throw new StoreError(`找不到 Combo ${id}`);
    await d
      .prepare('UPDATE combos SET title=?2, brief=?3, tags=?4, data=?5, source=?6, updated_at=?7 WHERE id=?1')
      .bind(id, c.title, c.brief ?? null, JSON.stringify(c.tags ?? []), data, c.source ?? null, now)
      .run();
    return { ...c, id, created_at: existing.created_at, updated_at: now };
  }
  const nid = newId();
  await d
    .prepare('INSERT INTO combos (id,title,brief,tags,data,source,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?7)')
    .bind(nid, c.title, c.brief ?? null, JSON.stringify(c.tags ?? []), data, c.source ?? null, now)
    .run();
  return { ...c, id: nid, created_at: now, updated_at: now };
};

export const deleteCombo = async (env: Env, id: string): Promise<boolean> => {
  const d = await db(env);
  const r = await d.prepare('DELETE FROM combos WHERE id = ?1').bind(id).run();
  return (r.meta?.changes ?? 0) > 0;
};
