// 分享頁：/c/<id> 直接全螢幕播放 Combo
import { comboHtml } from '../../src/combo';
import type { Ctx } from '../_lib/env';
import { getCombo } from '../_lib/store';

const page = (msg: string, status: number) =>
  new Response(`<!doctype html><meta charset="utf-8"><title>Motion Atlas</title><body style="font-family:system-ui;background:#151515;color:#f5f1e8;display:grid;place-items:center;height:100vh;margin:0"><p>${msg}　<a style="color:#ff5a36" href="/?view=combos">回 Combo 庫</a></p>`, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });

export const onRequestGet = async ({ env, params, request }: Ctx) => {
  try {
    const c = await getCombo(env, String(params.id));
    if (!c) return page('找不到這個 Combo', 404);
    const hud = new URL(request.url).searchParams.get('hud') !== '0';
    return new Response(comboHtml(c, { hud }), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' } });
  } catch (e) {
    return page(e instanceof Error ? e.message : '讀取失敗', 503);
  }
};
