// Cloudflare Pages Functions 用到的最小型別，避免額外安裝 workers-types
export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta?: { changes?: number };
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}
export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  exec(sql: string): Promise<unknown>;
}

export interface Env {
  DB?: D1Database;
  /** 寫入用金鑰（Pages 的加密環境變數） */
  MOTION_KEY?: string;
}

export interface Ctx {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}

export const CORS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type,authorization,x-motion-key,mcp-session-id,mcp-protocol-version',
  'access-control-expose-headers': 'mcp-session-id',
};

export const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...CORS, ...extra },
  });

export const preflight = () => new Response(null, { status: 204, headers: CORS });

/** 從 Authorization: Bearer、x-motion-key 或 ?key= 取得金鑰 */
export const keyOf = (req: Request): string => {
  const auth = req.headers.get('authorization') ?? '';
  if (/^bearer\s+/i.test(auth)) return auth.replace(/^bearer\s+/i, '').trim();
  return req.headers.get('x-motion-key') ?? new URL(req.url).searchParams.get('key') ?? '';
};

/** 固定時間比較，避免時間側通道 */
const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
};

export type WriteCheck = { ok: true } | { ok: false; reason: string };
export const canWrite = (req: Request, env: Env): WriteCheck => {
  if (!env.MOTION_KEY) return { ok: false, reason: '網站尚未設定 MOTION_KEY，寫入功能停用。請在 Cloudflare Pages 專案的環境變數加上 MOTION_KEY（加密）。' };
  const k = keyOf(req);
  if (!k) return { ok: false, reason: '寫入需要金鑰：連線網址加上 ?key=你的金鑰，或使用 Authorization: Bearer 標頭。' };
  if (!safeEqual(k, env.MOTION_KEY)) return { ok: false, reason: '金鑰不正確。' };
  return { ok: true };
};
