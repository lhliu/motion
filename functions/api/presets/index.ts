import { normalizeCosmos } from '../../../src/cosmos';
import { normalizeNature } from '../../../src/nature';
import { checkPresetData, type Preset } from '../../../src/presets';
import { canWrite, json, preflight, type Ctx } from '../../_lib/env';
import { listPresets, savePreset, StoreError } from '../../_lib/store';

const err = (e: unknown) => json({ ok: false, error: e instanceof Error ? e.message : String(e) }, e instanceof StoreError ? 503 : 500);

export const onRequestGet = async ({ request, env }: Ctx) => {
  const u = new URL(request.url);
  try {
    const presets = await listPresets(env, u.searchParams.get('kind') ?? '', u.searchParams.get('q') ?? '', Number(u.searchParams.get('limit')) || 100);
    // 清單不回傳完整資料（地圖可能含底圖）；nature／cosmos 附上 mode，讓各編輯器分開列預設。
    return json({ ok: true, count: presets.length, presets: presets.map(({ data, ...p }) => ({...p,...(p.kind==='cosmos'?{mode:normalizeCosmos(data).mode}:p.kind==='nature'?{mode:normalizeNature(data).mode}:{})})) });
  } catch (e) {
    return err(e);
  }
};

export const onRequestPost = async ({ request, env }: Ctx) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    const b = (await request.json()) as Partial<Preset>;
    const bad = checkPresetData(b.kind, b.data);
    if (bad) return json({ ok: false, error: bad }, 400);
    const name = String(b.name ?? '').trim().slice(0, 60) || '未命名';
    return json({ ok: true, preset: await savePreset(env, { kind: b.kind!, name, note: b.note ? String(b.note).slice(0, 500) : undefined, data: b.data!, source: String(b.source ?? 'web').slice(0, 20) }) }, 201);
  } catch (e) {
    return err(e);
  }
};
export const onRequestOptions = preflight;
