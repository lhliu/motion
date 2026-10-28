// /api/admin/* 一律先驗 Cloudflare Access（只允許 KC）
import { checkAdmin } from '../../_lib/access';
import { json, type Env } from '../../_lib/env';

export const onRequest = async (ctx: { request: Request; env: Env; next: () => Promise<Response>; data: Record<string, unknown> }) => {
  const c = await checkAdmin(ctx.request, ctx.env);
  if (!c.ok) return json({ error: c.reason }, c.status);
  ctx.data.email = c.email;
  const res = await ctx.next();
  const h = new Headers(res.headers);
  h.set('cache-control', 'no-store');
  h.delete('access-control-allow-origin');
  return new Response(res.body, { status: res.status, headers: h });
};
