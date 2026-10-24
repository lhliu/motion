// 分格預覽頁：/c/sheet?z=<壓縮 Combo>&at=0.45,0.9&from=1&to=12
// 每段在指定時間點各一格，給 preview_combo 截圖（也可以直接用瀏覽器打開檢查）
import '../../src/engines-all';
import { normalizeCombo } from '../../src/combo';
import { sheetCells, sheetHtml } from '../../src/combo-sheet';
import { packJson, unpackJson } from '../../src/presets';
import type { Ctx } from '../_lib/env';

export const parseAt = (v: string | null): number[] => {
  const a = (v ?? '').split(',').map(Number).filter((x) => x > 0 && x <= 1);
  return (a.length ? a : [0.45, 0.9]).slice(0, 3);
};

export const onRequestGet = async ({ request }: Ctx) => {
  const u = new URL(request.url), q = u.searchParams;
  try {
    const r = normalizeCombo(await unpackJson(String(q.get('z') ?? '')));
    if (r.errors.length) return new Response(r.errors.join('\n'), { status: 400 });
    const cells = sheetCells(r.combo, parseAt(q.get('at')), { from: Number(q.get('from')) || undefined, to: Number(q.get('to')) || undefined });
    // 同一段的幾格共用同一個播放網址
    const zs = new Map<unknown, string>();
    for (const c of cells) if (!zs.has(c.combo)) zs.set(c.combo, await packJson(c.combo));
    const srcs = cells.map((c) => `${u.origin}/c/_?z=${zs.get(c.combo)}&hud=0&loop=0&hold=1`);
    return new Response(sheetHtml(r.combo, cells, srcs), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } });
  } catch (e) {
    return new Response(e instanceof Error ? e.message : '讀取失敗', { status: 400 });
  }
};
