import { normalizeCombo } from '../../../src/combo';
import { canWrite, json, preflight, type Ctx } from '../../_lib/env';
import { deleteCombo, getCombo, saveCombo, StoreError } from '../../_lib/store';

const err = (e: unknown) => json({ ok: false, error: e instanceof Error ? e.message : String(e) }, e instanceof StoreError ? 503 : 500);
const idOf = (p: Ctx['params']) => String(Array.isArray(p.id) ? p.id[0] : p.id);

export const onRequestGet = async ({ env, params }: Ctx) => {
  try {
    const c = await getCombo(env, idOf(params));
    return c ? json({ ok: true, combo: c }) : json({ ok: false, error: '找不到這個 Combo' }, 404);
  } catch (e) {
    return err(e);
  }
};

export const onRequestPut = async ({ request, env, params }: Ctx) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    const { combo, errors } = normalizeCombo(await request.json());
    if (errors.length) return json({ ok: false, errors }, 400);
    return json({ ok: true, combo: await saveCombo(env, combo, idOf(params)) });
  } catch (e) {
    return err(e);
  }
};

export const onRequestDelete = async ({ request, env, params }: Ctx) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    return (await deleteCombo(env, idOf(params))) ? json({ ok: true }) : json({ ok: false, error: '找不到這個 Combo' }, 404);
  } catch (e) {
    return err(e);
  }
};
export const onRequestOptions = preflight;
