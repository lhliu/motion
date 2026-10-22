import { checkPresetData, type Preset } from '../../../src/presets';
import { canWrite, json, preflight, type Ctx } from '../../_lib/env';
import { deletePreset, getPreset, savePreset, StoreError } from '../../_lib/store';

const err = (e: unknown) => json({ ok: false, error: e instanceof Error ? e.message : String(e) }, e instanceof StoreError ? 503 : 500);
const idOf = (p: Ctx['params']) => String(Array.isArray(p.id) ? p.id[0] : p.id);

export const onRequestGet = async ({ env, params }: Ctx) => {
  try {
    const p = await getPreset(env, idOf(params));
    return p ? json({ ok: true, preset: p }) : json({ ok: false, error: '找不到這個預設' }, 404);
  } catch (e) {
    return err(e);
  }
};

export const onRequestPut = async ({ request, env, params }: Ctx) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    const b = (await request.json()) as Partial<Preset>;
    const bad = checkPresetData(b.kind, b.data);
    if (bad) return json({ ok: false, error: bad }, 400);
    const name = String(b.name ?? '').trim().slice(0, 60) || '未命名';
    return json({ ok: true, preset: await savePreset(env, { kind: b.kind!, name, note: b.note ? String(b.note).slice(0, 500) : undefined, data: b.data!, source: String(b.source ?? 'web').slice(0, 20) }, idOf(params)) });
  } catch (e) {
    return err(e);
  }
};

export const onRequestDelete = async ({ request, env, params }: Ctx) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    return (await deletePreset(env, idOf(params))) ? json({ ok: true }) : json({ ok: false, error: '找不到這個預設' }, 404);
  } catch (e) {
    return err(e);
  }
};
export const onRequestOptions = preflight;
