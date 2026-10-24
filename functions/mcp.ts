// MCP（Model Context Protocol）伺服器：Streamable HTTP、無狀態、回傳 JSON
import { canWrite, CORS, json, preflight, type Ctx } from './_lib/env';
import { StoreError } from './_lib/store';
import { INSTRUCTIONS, isWriteTool, TOOLS } from './_lib/tools';
import { decodeJson, packJson } from '../src/presets';

// 回傳裡的長網址（?combo=… 預覽、?d=… 編輯連結）換成壓縮版（?cz=、?z=），通常短 3–5 倍，省 AI 的 token
const LONG = /([?&])(combo|d)=([A-Za-z0-9_-]{160,})/g;
const shrinkUrl = async (s: string): Promise<string> => {
  const hits = [...s.matchAll(LONG)];
  if (!hits.length) return s;
  let out = s;
  for (const m of hits) {
    try {
      const z = await packJson(decodeJson(m[3]));
      if (z.length < m[3].length) out = out.replace(m[0], `${m[1]}${m[2] === 'combo' ? 'cz' : 'z'}=${z}`);
    } catch {
      /* 解不開就保留原樣 */
    }
  }
  return out;
};
const shrink = async (v: unknown): Promise<unknown> => {
  if (typeof v === 'string') return v.length > 200 ? shrinkUrl(v) : v;
  if (Array.isArray(v)) return Promise.all(v.map(shrink));
  if (v && typeof v === 'object') return Object.fromEntries(await Promise.all(Object.entries(v).map(async ([k, x]) => [k, await shrink(x)])));
  return v;
};

const VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

interface RpcReq {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

const ok = (id: RpcReq['id'], result: unknown) => ({ jsonrpc: '2.0', id: id ?? null, result });
const fail = (id: RpcReq['id'], code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

const handle = async (m: RpcReq, ctx: Ctx, origin: string) => {
  switch (m.method) {
    case 'initialize': {
      const asked = String(m.params?.protocolVersion ?? '');
      return ok(m.id, {
        protocolVersion: VERSIONS.includes(asked) ? asked : VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'motion-atlas', title: 'Motion Atlas 字卡圖鑑', version: '1.0.0' },
        instructions: INSTRUCTIONS,
      });
    }
    case 'ping':
      return ok(m.id, {});
    case 'tools/list': {
      const writable = canWrite(ctx.request, ctx.env).ok;
      return ok(m.id, {
        tools: TOOLS.map((t) => ({
          name: t.name,
          title: t.title,
          description: t.write && !writable ? `${t.description}（目前連線沒有金鑰，呼叫會被拒絕）` : t.description,
          inputSchema: t.inputSchema,
          ...(t.annotations ? { annotations: t.annotations } : {}),
        })),
      });
    }
    case 'tools/call': {
      const name = String(m.params?.name ?? '');
      const tool = TOOLS.find((t) => t.name === name);
      if (!tool) return fail(m.id, -32602, `未知的工具：${name}`);
      if (isWriteTool(name)) {
        const w = canWrite(ctx.request, ctx.env);
        if (!w.ok) return ok(m.id, { isError: true, content: [{ type: 'text', text: w.reason }] });
      }
      try {
        const raw = (await tool.run((m.params?.arguments as Record<string, unknown>) ?? {}, { env: ctx.env, request: ctx.request, origin })) as Record<string, unknown>;
        // 工具可回傳 __image（例如 preview_combo 的截圖），放成 MCP 的 image 內容讓 AI 直接看
        const img = raw && typeof raw === 'object' ? (raw.__image as { data: string; mimeType: string } | undefined) : undefined;
        const out = await shrink(img ? Object.fromEntries(Object.entries(raw).filter(([k]) => k !== '__image')) : raw);
        // 只回一份精簡 JSON：不縮排、不重複附 structuredContent（工具沒有宣告 outputSchema）
        return ok(m.id, { content: [...(img ? [{ type: 'image', data: img.data, mimeType: img.mimeType }] : []), { type: 'text', text: JSON.stringify(out) }] });
      } catch (e) {
        const msg = e instanceof StoreError || e instanceof Error ? e.message : String(e);
        return ok(m.id, { isError: true, content: [{ type: 'text', text: msg }] });
      }
    }
    case 'resources/list':
      return ok(m.id, { resources: [] });
    case 'prompts/list':
      return ok(m.id, { prompts: [] });
    default:
      return m.method.startsWith('notifications/') ? null : fail(m.id, -32601, `不支援的方法：${m.method}`);
  }
};

export const onRequestPost = async (ctx: Ctx) => {
  const origin = new URL(ctx.request.url).origin;
  let body: unknown;
  try {
    body = await ctx.request.json();
  } catch {
    return json(fail(null, -32700, 'JSON 解析失敗'), 400);
  }
  const batch = Array.isArray(body);
  const msgs = (batch ? body : [body]) as RpcReq[];
  const out = (await Promise.all(msgs.map((m) => handle(m, ctx, origin)))).filter((r) => r !== null);
  if (!out.length) return new Response(null, { status: 202, headers: CORS });
  return json(batch ? out : out[0]);
};

// 無狀態伺服器不提供 SSE 串流；GET 顯示簡短說明，方便人用瀏覽器確認
export const onRequestGet = async (ctx: Ctx) => {
  const accept = ctx.request.headers.get('accept') ?? '';
  if (accept.includes('text/event-stream')) return new Response('Method Not Allowed', { status: 405, headers: { ...CORS, allow: 'POST' } });
  return json({
    name: 'Motion Atlas MCP',
    transport: 'streamable-http',
    endpoint: new URL(ctx.request.url).origin + '/mcp',
    tools: TOOLS.map((t) => t.name),
    write_access: canWrite(ctx.request, ctx.env).ok,
    docs: new URL(ctx.request.url).origin + '/?view=mcp',
  });
};

export const onRequestDelete = async () => new Response(null, { status: 405, headers: CORS });
export const onRequestOptions = preflight;
