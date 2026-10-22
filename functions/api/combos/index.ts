import { normalizeCombo } from '../../../src/combo';
import { canWrite, json, preflight, type Ctx } from '../../_lib/env';
import { listCombos, saveCombo, StoreError } from '../../_lib/store';

const err = (e: unknown) => json({ ok: false, error: e instanceof Error ? e.message : String(e) }, e instanceof StoreError ? 503 : 500);

export const onRequestGet = async ({ request, env }: Ctx) => {
  const u = new URL(request.url);
  try {
    const combos = await listCombos(env, u.searchParams.get('q') ?? '', u.searchParams.get('tag') ?? '', Number(u.searchParams.get('limit')) || 60);
    return json({ ok: true, count: combos.length, combos });
  } catch (e) {
    return err(e);
  }
};

export const onRequestPost = async ({ request, env }: Ctx) => {
  const w = canWrite(request, env);
  if (!w.ok) return json({ ok: false, error: w.reason }, 401);
  try {
    const { combo, errors } = normalizeCombo({ source: 'web', ...((await request.json()) as object) });
    if (errors.length) return json({ ok: false, errors }, 400);
    return json({ ok: true, combo: await saveCombo(env, combo) }, 201);
  } catch (e) {
    return err(e);
  }
};
export const onRequestOptions = preflight;
