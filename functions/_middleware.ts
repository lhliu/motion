// 會讀特效目錄的路由先套用後台覆寫（失敗就是程式預設）。靜態檔不經過這裡的邏輯。
import { useCatalog } from './_lib/catalog';
import type { Env } from './_lib/env';

const NEEDS = /^\/(api|mcp|c|m|r|u)(\/|$)/;
export const onRequest = async (ctx: { request: Request; env: Env; next: () => Promise<Response> }) => {
  if (NEEDS.test(new URL(ctx.request.url).pathname)) await useCatalog(ctx.env);
  return ctx.next();
};
