// 小地圖輸出：/m/svg?z=…（可編輯向量，&dl=1 下載）、/m/view?z=…（載入字型的透明頁面，給截圖用；&check=1 檢查版）、
// /m/png?z=…&w=寬（透明 PNG，用 Browser Run 截 /m/view）
import { miniLayout, miniSvg, normalizeMini, MINI_PLACES, type MiniMap } from '../../src/minimap';
import { normalizeParcel, parcelLayout, parcelSvg, type ParcelMap } from '../../src/parcelmap';
import { unpackJson } from '../../src/presets';
import type { Ctx } from '../_lib/env';
import { screenshotPng } from '../_lib/shot';

const fail = (msg: string, status = 400) => new Response(msg, { status, headers: { 'content-type': 'text/plain; charset=utf-8', 'access-control-allow-origin': '*' } });

export const onRequestGet = async ({ params, request, env }: Ctx) => {
  const u = new URL(request.url), q = u.searchParams, kind = String(params.kind);
  // t=parcel 是地籍棟距圖，其他是小地圖
  const isParcel = q.get('t') === 'parcel';
  let map: MiniMap | undefined, pmap: ParcelMap | undefined;
  try {
    const raw = await unpackJson(String(q.get('z') ?? ''));
    if (isParcel) {
      const r = normalizeParcel(raw);
      if (r.errors.length) return fail(r.errors.join('\n'));
      pmap = r.map;
    } else {
      const r = normalizeMini(raw);
      if (r.errors.length && !r.map.roads.length) return fail(r.errors.join('\n'));
      map = r.map;
    }
  } catch {
    return fail('z 參數無法讀取');
  }
  const W = (pmap ?? map)!.w ?? 1410, H = (pmap ?? map)!.h ?? 1128;
  const svgOf = (o: { id?: string } = {}) => (pmap ? parcelSvg(pmap, o) : miniSvg(map!, o));
  const name = ((pmap ?? map)!.title || (pmap ? 'parcel-map' : 'minimap')).replace(/[\\/:*?"<>|\s]+/g, '-');
  if (kind === 'svg')
    return new Response(svgOf(), {
      headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=3600', 'access-control-allow-origin': '*', ...(q.get('dl') ? { 'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(name)}.svg` } : {}) },
    });
  if (kind === 'view') {
    // 檢查版：左邊原尺寸、右邊縮到影片實際套用尺寸並疊在灰色條紋（模擬街景）上，方便看小尺寸時字是否清楚
    const check = q.get('check') === '1' && !pmap;
    const p = !map ? MINI_PLACES.tr : map.place === 'duo' ? MINI_PLACES.duo : map.place && typeof map.place === 'object' ? map.place : MINI_PLACES.tr;
    const svg = svgOf();
    const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chiron+Hei+HK:wght@700;900&display=block">`;
    const body = check
      ? `<div style="display:flex;gap:24px;align-items:flex-start;padding:20px;background:repeating-conic-gradient(#ddd 0 25%,#f4f4f4 0 50%) 0 0/24px 24px"><div style="width:${Math.round(W / 2)}px">${svg}</div><div><div style="font:700 14px system-ui;margin-bottom:6px">影片實際尺寸（寬 ${p.w}px）疊在模擬街景上</div><div style="width:${p.w + 80}px;padding:40px;background:repeating-linear-gradient(90deg,#6f6f6c 0 60px,#9a9a96 60px 95px,#4f4f4d 95px 150px,#b8b8b4 150px 180px)"><div style="width:${p.w}px">${svgOf({ id: 'mm2' })}</div></div></div></div>`
      : svg;
    const warn = pmap ? parcelLayout(pmap).warnings : miniLayout(map!).warnings;
    return new Response(
      `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>html,body{margin:0;background:transparent}svg{display:block;width:100%;height:auto;overflow:visible}</style></head><body>${body}<pre id="warn" hidden>${warn.join('\n').replace(/</g, '&lt;')}</pre><script>document.fonts.ready.then(()=>setTimeout(()=>{const r=document.createElement('i');r.id='ready';document.body.appendChild(r)},150))</script></body></html>`,
      { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' } },
    );
  }
  if (kind === 'png') {
    const w = Math.min(4000, Math.max(200, Number(q.get('w')) || W));
    const h = Math.round((w * H) / W);
    try {
      const png = await screenshotPng(env, `${u.origin}/m/view?z=${q.get('z')}${pmap ? '&t=parcel' : ''}`, { width: w, height: h });
      return new Response(png, { headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400', 'content-disposition': `${q.get('dl') ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(name)}.png` } });
    } catch (e) {
      return fail(e instanceof Error ? e.message : '截圖失敗', 503);
    }
  }
  return fail('未知的輸出格式（svg、view、png）', 404);
};
