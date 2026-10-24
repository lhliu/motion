// 伺服器端一次載入全部繪製引擎，comboHtml／匯出可同步產生
import '../../src/engines-all';
// 分享頁：/c/<id> 直接全螢幕播放 Combo
import { comboHtml, decodeCombo, normalizeCombo, type Combo } from '../../src/combo';
import type { Ctx } from '../_lib/env';
import { unpackJson } from '../../src/presets';
import { getCombo } from '../_lib/store';

const page = (msg: string, status: number) =>
  new Response(`<!doctype html><meta charset="utf-8"><title>Motion Atlas</title><body style="font-family:system-ui;background:#151515;color:#f5f1e8;display:grid;place-items:center;height:100vh;margin:0"><p>${msg}　<a style="color:#ff5a36" href="/?view=combos">回 Combo 庫</a></p>`, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });

export const onRequestGet = async ({ env, params, request }: Ctx) => {
  try {
    const q = new URL(request.url).searchParams;
    // /c/_?z=<壓縮編碼>（或舊的 ?d=）播放還沒存檔的 Combo（給本機錄製用）
    let c: Combo | null = null;
    if (params.id === '_' && (q.get('d') || q.get('z'))) {
      const r = normalizeCombo(q.get('z') ? await unpackJson(String(q.get('z'))) : decodeCombo(String(q.get('d'))));
      if (r.errors.length) return page(r.errors[0], 400);
      c = r.combo;
    } else c = await getCombo(env, String(params.id));
    if (!c) return page('找不到這個 Combo', 404);
    const hud = q.get('hud') !== '0';
    return new Response(comboHtml(c, { hud, loop: q.get('loop') !== '0' }), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' } });
  } catch (e) {
    return page(e instanceof Error ? e.message : '讀取失敗', 503);
  }
};
