import { KIND_NAME, type Preset, type PresetData, type PresetKind } from './presets';
import { esc } from './util';

export interface PresetBarOpts {
  kind: PresetKind;
  filter?: (preset: Omit<Preset,'data'> & { mode?: string }) => boolean;
  getData: () => PresetData;
  onLoad: (p: Preset) => void;
  toast: (msg: string) => void;
  copy: (text: string, msg: string) => Promise<void>;
  store: { get<T>(k: string, d: T): T; set(k: string, v: unknown): void };
}

/** 工作室上方的預設列：存回同一個代碼、另存、複製給 AI、載入既有預設 */
export const presetBar = (host: HTMLElement, o: PresetBarOpts) => {
  let meta: { id?: string; name: string } = { name: '' };
  host.innerHTML = `<div class="pb">
  <div class="pb-row">
    <span class="pb-id" hidden></span>
    <input class="pb-name" type="text" maxlength="60" placeholder="預設名稱，例如：外觀慢推_左到右" aria-label="預設名稱">
    <button type="button" class="ma-btn pb-save">存成預設</button>
    <button type="button" class="btn-ghost pb-new" hidden>另存新代碼</button>
    <button type="button" class="btn-ghost pb-copy" hidden>複製給 AI</button>
  </div>
  <div class="pb-row">
    <select class="pb-load" aria-label="載入預設"><option value="">載入已存的預設⋯</option></select>
    <input class="pb-key" type="password" placeholder="寫入金鑰（只存在這台裝置）" autocomplete="off" hidden>
  </div>
</div>`;
  const $ = <T extends HTMLElement>(s: string) => host.querySelector<T>(s)!;
  const nameEl = $<HTMLInputElement>('.pb-name');
  const idEl = $('.pb-id');
  const saveBtn = $<HTMLButtonElement>('.pb-save');
  const newBtn = $<HTMLButtonElement>('.pb-new');
  const copyBtn = $<HTMLButtonElement>('.pb-copy');
  const sel = $<HTMLSelectElement>('.pb-load');
  const keyEl = $<HTMLInputElement>('.pb-key');

  const render = () => {
    nameEl.value = meta.name;
    idEl.hidden = !meta.id;
    idEl.textContent = meta.id ?? '';
    saveBtn.textContent = meta.id ? `存回 ${meta.id}` : '存成預設';
    newBtn.hidden = !meta.id;
    copyBtn.hidden = !meta.id;
  };
  nameEl.addEventListener('input', () => (meta.name = nameEl.value));
  keyEl.addEventListener('change', () => {
    o.store.set('key', keyEl.value.trim());
    if (keyEl.value.trim()) keyEl.hidden = true;
  });

  const api = async (path: string, init: RequestInit = {}) => {
    const key = o.store.get('key', '');
    const res = await fetch(path, { ...init, headers: { 'content-type': 'application/json', ...(key ? { authorization: `Bearer ${key}` } : {}) } });
    if (!(res.headers.get('content-type') ?? '').includes('json')) throw new Error('這個網址沒有預設庫後端，請到 motion.leichthub.com 使用');
    const j = (await res.json()) as { ok: boolean; error?: string; preset?: Preset; presets?: Preset[] };
    if (!res.ok || !j.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
    return j;
  };

  const save = async (asNew: boolean) => {
    if (!o.store.get('key', '')) {
      keyEl.hidden = false;
      keyEl.focus();
      return o.toast('請先填寫寫入金鑰（跟 Combo 用的是同一把）');
    }
    const name = nameEl.value.trim() || `未命名${KIND_NAME[o.kind]}`;
    const body = JSON.stringify({ kind: o.kind, name, data: o.getData() });
    const updating = !!meta.id && !asNew;
    saveBtn.setAttribute('aria-busy', 'true');
    try {
      const j = await api(updating ? `/api/presets/${meta.id}` : '/api/presets', { method: updating ? 'PUT' : 'POST', body });
      meta = { id: j.preset!.id, name: j.preset!.name };
      render();
      o.toast(updating ? `已存回 ${meta.id}，AI 下次讀到的就是這個版本` : `已存成預設 ${meta.id}`);
      sel.dataset.loaded = '';
    } catch (e) {
      o.toast(e instanceof Error ? e.message : '儲存失敗');
    } finally {
      saveBtn.removeAttribute('aria-busy');
    }
  };
  saveBtn.addEventListener('click', () => save(false));
  newBtn.addEventListener('click', () => save(true));
  copyBtn.addEventListener('click', () => {
    if (!meta.id) return;
    o.copy(`請改用 Motion Atlas 預設 ${meta.id}（${KIND_NAME[o.kind]}「${meta.name}」），在 compose_combo / save_combo 的 scenes 寫 { "preset": "${meta.id}" }，不要重做這一段。`, '已複製，貼給 AI 即可');
  });

  const fill = async () => {
    if (sel.dataset.loaded === '1') return;
    sel.dataset.loaded = '1';
    try {
      const j = await api(`/api/presets?kind=${o.kind}`);
      const presets=o.filter?j.presets!.filter(o.filter):j.presets!;
      sel.innerHTML = `<option value="">載入已存的預設⋯（${presets.length}）</option>${presets.map((p) => `<option value="${esc(p.id!)}">${esc(p.id!)}　${esc(p.name)}</option>`).join('')}`;
    } catch (e) {
      sel.innerHTML = `<option value="">${esc(e instanceof Error ? e.message : '讀取失敗')}</option>`;
    }
  };
  sel.addEventListener('focus', fill);
  sel.addEventListener('pointerdown', fill);
  sel.addEventListener('change', async () => {
    const id = sel.value;
    sel.value = '';
    if (!id) return;
    try {
      const j = await api(`/api/presets/${id}`);
      o.onLoad(j.preset!);
      set(j.preset!);
      o.toast(`已載入 ${id}`);
    } catch (e) {
      o.toast(e instanceof Error ? e.message : '讀取失敗');
    }
  });

  const set = (p?: { id?: string; name?: string }) => {
    meta = { id: p?.id, name: p?.name ?? '' };
    render();
  };
  render();
  return { set, get: () => meta };
};
