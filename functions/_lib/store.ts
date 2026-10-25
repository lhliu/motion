import type { Combo } from '../../src/combo';
import type { Preset, PresetKind } from '../../src/presets';
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

const SCHEMA_PRESETS = `CREATE TABLE IF NOT EXISTS presets (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  note TEXT,
  data TEXT NOT NULL,
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

// 底圖上傳（地籍套繪等需要截圖當底圖）：base64 存在 D1，單張上限約 1.4 MB（D1 單列上限 2 MB）
const SCHEMA_UPLOADS = `CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  mime TEXT NOT NULL,
  w INTEGER,
  h INTEGER,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL
)`;

let ready: Promise<unknown> | null = null;

export class StoreError extends Error {}

export const db = async (env: Env): Promise<D1Database> => {
  if (!env.DB)
    throw new StoreError('Combo 資料庫尚未綁定：請在 Cloudflare Pages 專案 → 設定 → 繫結，新增 D1 資料庫，變數名稱填 DB。');
  const d1 = env.DB;
  ready ??= d1
    .prepare(SCHEMA)
    .run()
    .then(() => d1.prepare(SCHEMA_PRESETS).run())
    .then(() => d1.prepare(SCHEMA_UPLOADS).run())
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

/* ───────── 預設 ───────── */
const newPresetId = () => {
  const a = crypto.getRandomValues(new Uint8Array(5));
  return 'p' + Array.from(a, (b) => (b % 36).toString(36)).join('');
};

interface PresetRow {
  id: string;
  kind: string;
  name: string;
  note: string | null;
  data: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}
const toPreset = (r: PresetRow, withData = true): Preset => ({
  id: r.id,
  kind: r.kind as PresetKind,
  name: r.name,
  note: r.note ?? undefined,
  data: withData ? JSON.parse(r.data) : ({} as Preset['data']),
  source: r.source ?? undefined,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

export const listPresets = async (env: Env, kind = '', q = '', limit = 100): Promise<Preset[]> => {
  const d = await db(env);
  const where: string[] = [];
  const args: unknown[] = [];
  if (kind) {
    args.push(kind);
    where.push(`kind = ?${args.length}`);
  }
  if (q) {
    args.push(`%${q}%`);
    where.push(`(name LIKE ?${args.length} OR note LIKE ?${args.length} OR id = ?${args.length + 1})`);
    args.push(q);
  }
  const sql = `SELECT id,kind,name,note,data,source,created_at,updated_at FROM presets ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY updated_at DESC LIMIT ${Math.min(200, Math.max(1, limit))}`;
  const res = await d.prepare(sql).bind(...args).all<PresetRow>();
  return res.results.map((r) => toPreset(r));
};

export const getPreset = async (env: Env, id: string): Promise<Preset | null> => {
  const d = await db(env);
  const r = await d.prepare('SELECT id,kind,name,note,data,source,created_at,updated_at FROM presets WHERE id = ?1').bind(id).first<PresetRow>();
  return r ? toPreset(r) : null;
};

export const savePreset = async (env: Env, p: Preset, id?: string): Promise<Preset> => {
  const d = await db(env);
  const now = new Date().toISOString();
  const data = JSON.stringify(p.data);
  if (id) {
    const ex = await getPreset(env, id);
    if (!ex) throw new StoreError(`找不到預設 ${id}`);
    await d
      .prepare('UPDATE presets SET kind=?2, name=?3, note=?4, data=?5, source=?6, updated_at=?7 WHERE id=?1')
      .bind(id, p.kind, p.name, p.note ?? null, data, p.source ?? null, now)
      .run();
    return { ...p, id, created_at: ex.created_at, updated_at: now };
  }
  const nid = newPresetId();
  await d
    .prepare('INSERT INTO presets (id,kind,name,note,data,source,created_at,updated_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?7)')
    .bind(nid, p.kind, p.name, p.note ?? null, data, p.source ?? null, now)
    .run();
  return { ...p, id: nid, created_at: now, updated_at: now };
};

export const deletePreset = async (env: Env, id: string): Promise<boolean> => {
  const d = await db(env);
  const r = await d.prepare('DELETE FROM presets WHERE id = ?1').bind(id).run();
  return (r.meta?.changes ?? 0) > 0;
};

/* ───────── 底圖上傳 ───────── */
export const UPLOAD_MAX = 1_400_000;

/** 讀 PNG／JPEG／WebP 的寬高（不解碼） */
export const imageSize = (b: Uint8Array): { mime: string; w: number; h: number } | null => {
  const u32 = (i: number) => (b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3];
  if (b[0] === 0x89 && b[1] === 0x50) return { mime: 'image/png', w: u32(16), h: u32(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length - 9; ) {
      if (b[i] !== 0xff) return null;
      const m = b[i + 1], L = (b[i + 2] << 8) | b[i + 3];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { mime: 'image/jpeg', h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8] };
      i += 2 + L;
    }
    return null;
  }
  if (String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP') {
    const k = String.fromCharCode(...b.slice(12, 16));
    if (k === 'VP8X') return { mime: 'image/webp', w: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), h: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
    if (k === 'VP8 ') return { mime: 'image/webp', w: ((b[26] | (b[27] << 8)) & 0x3fff), h: ((b[28] | (b[29] << 8)) & 0x3fff) };
    if (k === 'VP8L') return { mime: 'image/webp', w: 1 + (((b[22] & 0x3f) << 8) | b[21]), h: 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)) };
  }
  return null;
};

const b64 = (b: Uint8Array) => {
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
};

export const saveUpload = async (env: Env, bytes: Uint8Array) => {
  if (bytes.length > UPLOAD_MAX) throw new StoreError(`圖片太大（${Math.round(bytes.length / 1024)} KB），上限 ${Math.round(UPLOAD_MAX / 1024)} KB；請縮小或存成 JPEG`);
  const info = imageSize(bytes);
  if (!info) throw new StoreError('只接受 PNG、JPEG、WebP 圖片');
  const d = await db(env);
  const a = crypto.getRandomValues(new Uint8Array(8));
  const id = 'u' + Array.from(a, (x) => (x % 36).toString(36)).join('');
  await d.prepare('INSERT INTO uploads (id, mime, w, h, data, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, info.mime, info.w, info.h, b64(bytes), new Date().toISOString()).run();
  return { id, ...info };
};

export const getUpload = async (env: Env, id: string) => {
  const d = await db(env);
  const r = await d.prepare('SELECT mime, w, h, data FROM uploads WHERE id = ?').bind(id).first<{ mime: string; w: number; h: number; data: string }>();
  if (!r) return null;
  return { mime: r.mime, w: r.w, h: r.h, bytes: Uint8Array.from(atob(r.data), (c) => c.charCodeAt(0)) };
};
