// Cloudflare Access 驗證：只有 ADMIN_EMAIL（KC）能進後台。
// 正式環境需要 ACCESS_TEAM_DOMAIN（例：xxx.cloudflareaccess.com）、ACCESS_AUD（Access 應用的 AUD tag）、ADMIN_EMAIL。
// 本機測試可設 ADMIN_DEV=1 略過（只在 wrangler pages dev 使用，正式環境不要設）。
import type { Env } from './env';

type Jwk = JsonWebKey & { kid?: string };
let certs: { at: number; keys: Jwk[] } | null = null;

const b64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

export type AdminCheck = { ok: true; email: string } | { ok: false; status: number; reason: string };

export const checkAdmin = async (req: Request, env: Env): Promise<AdminCheck> => {
  if (env.ADMIN_DEV === '1') {
    const host = new URL(req.url).hostname;
    if (host === '127.0.0.1' || host === 'localhost') return { ok: true, email: 'dev@localhost' };
  }
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.ADMIN_EMAIL) return { ok: false, status: 503, reason: '後台尚未設定 Cloudflare Access（ACCESS_TEAM_DOMAIN、ACCESS_AUD、ADMIN_EMAIL）。' };
  const token = req.headers.get('cf-access-jwt-assertion') ?? '';
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, status: 401, reason: '需要透過 Cloudflare Access 登入。' };
  try {
    const head = JSON.parse(new TextDecoder().decode(b64u(parts[0]))) as { kid?: string; alg?: string };
    const body = JSON.parse(new TextDecoder().decode(b64u(parts[1]))) as { aud?: string | string[]; email?: string; exp?: number; iss?: string };
    if (head.alg !== 'RS256') throw new Error('alg');
    if (!certs || Date.now() - certs.at > 3600_000) {
      const r = await fetch(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`);
      certs = { at: Date.now(), keys: ((await r.json()) as { keys: Jwk[] }).keys };
    }
    const jwk = certs.keys.find((k) => k.kid === head.kid);
    if (!jwk) throw new Error('kid');
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const okSig = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    if (!okSig) throw new Error('sig');
    const aud = Array.isArray(body.aud) ? body.aud : [body.aud];
    if (!aud.includes(env.ACCESS_AUD)) throw new Error('aud');
    if (!body.exp || body.exp * 1000 < Date.now()) throw new Error('exp');
    if (body.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) throw new Error('iss');
    const allowed = env.ADMIN_EMAIL.split(',').map((s) => s.trim().toLowerCase());
    if (!body.email || !allowed.includes(body.email.toLowerCase())) return { ok: false, status: 403, reason: '這個帳號沒有後台權限。' };
    return { ok: true, email: body.email };
  } catch (e) {
    return { ok: false, status: 401, reason: `登入憑證無效（${(e as Error).message}）。` };
  }
};
