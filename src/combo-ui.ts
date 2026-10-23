import { isTransportFx } from './transport';
import { isIllustrationFx } from './illustration';
import { comboHtml, comboOutline, comboPrompt, sceneSummary, decodeCombo, encodeCombo, findEffect, normalizeCombo, sceneSeconds, totalSeconds, type Combo, type ComboScene, type Transition } from './combo';
import { NUM } from './data';
import type { Ratio } from './prompts';
import type { Tone } from './types';
import { esc } from './util';
import { isPhotoFx } from './photokit';
import { isObjFx } from './objkit';
import { FONT_PACKS } from './fonts';

export interface ComboDeps {
  toast: (msg: string) => void;
  copy: (text: string, msg: string) => Promise<void>;
  openDetail: (id: string) => void;
  openStudio?: (effect: string, words: string[], note?: string) => void;
  palette: () => { id: string; accent?: string };
  store: { get<T>(k: string, d: T): T; set(k: string, v: unknown): void };
}

type Tab = 'library' | 'draft' | 'mcp';
const $ = <T extends HTMLElement = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
const pad = (n: number) => String(n).padStart(2, '0');

export const initCombos = (deps: ComboDeps) => {
  const dlg = $<HTMLDialogElement>('#combos');
  const grid = $('#cbGrid');
  const msg = $('#cbMsg');
  let tab: Tab = 'library';
  let library: Combo[] = [];
  let loaded = false;

  /* ───────── 草稿 ───────── */
  const blank = (): Combo => ({ title: '', scenes: [], ratio: '16:9', transition: 'fade' });
  let draft: Combo = { ...blank(), ...deps.store.get<Partial<Combo>>('draft', {}) };
  let editingId: string | undefined = deps.store.get<string | undefined>('draftId', undefined);
  const saveDraft = () => {
    deps.store.set('draft', draft);
    deps.store.set('draftId', editingId ?? null);
    const n = draft.scenes.length;
    const badge = $('#draftN');
    badge.hidden = n === 0;
    badge.textContent = String(n);
    $('#draftTabN').textContent = n ? String(n) : '';
  };
  const withPalette = (c: Combo): Combo => {
    const p = deps.palette();
    return { ...c, palette: c.palette ?? p.id, ...(c.accent ?? p.accent ? { accent: c.accent ?? p.accent } : {}) };
  };

  const addScene = (s: ComboScene & { ratio?: Ratio }) => {
    const { ratio, ...scene } = s;
    if (ratio && !draft.scenes.length) draft.ratio = ratio;
    else if (ratio && ratio !== (draft.ratio ?? '16:9')) setTimeout(() => deps.toast(`注意：這段是 ${ratio}，草稿是 ${draft.ratio ?? '16:9'}，元件位置可能跑掉`), 1900);
    draft.scenes.push(scene);
    if (!draft.title) draft.title = '未命名 Combo';
    saveDraft();
    if (dlg.open && tab === 'draft') renderDraft();
    deps.toast(`已加入 Combo 草稿（第 ${draft.scenes.length} 段）`);
  };

  const sceneRow = (s: ComboScene, i: number) => {
    const fx = findEffect(s.effect);
    const words = (s.words ?? fx?.sample ?? []).join(' / ');
    const diagram = fx?.cat === 'diagram';
    const long = isTransportFx(s.effect) || isIllustrationFx(s.effect) || s.effect === 'map-overlay' || s.effect === 'crisp-drop' || isPhotoFx(s.effect) || (isObjFx(s.effect) && !!s.words?.[0]?.trim().startsWith('{'));
    return `<li class="dr-scene" data-i="${i}">
      <div class="dr-s-head"><span class="ma-num">${pad(i + 1)}</span><button class="dr-fx" data-act="open" title="打開特效">${fx ? `${esc(fx.zh)} <small>#${pad(NUM.get(fx.id)!)} ${esc(fx.en)}</small>` : esc(s.effect)}</button>
        <span class="dr-s-tools"><button class="ic" data-act="up" aria-label="上移"${i === 0 ? ' disabled' : ''}><svg viewBox="0 0 24 24"><path d="m18 15-6-6-6 6"/></svg></button><button class="ic" data-act="down" aria-label="下移"${i === draft.scenes.length - 1 ? ' disabled' : ''}><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>${long ? '<button class="ic" data-act="studio" aria-label="在工作室開啟" title="在工作室開啟">✎</button>' : ''}<button class="ic" data-act="dup" aria-label="複製這段"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button><button class="ic" data-act="del" aria-label="刪除這段"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button></span></div>
      <div class="dr-s-body">
        ${long ? `<label><span>內容</span><input value="${esc(sceneSummary(s.effect, s.words ?? fx?.sample ?? []))}" readonly title="這段的內容請在工作室編輯後重新加入"></label>` : diagram ? `<label><span>部位文字（每行一項，保留空行）</span><textarea data-k="words" rows="4" aria-label="圖解部位文字" placeholder="${esc(fx?.hint ?? '')}">${esc((s.words ?? fx?.sample ?? []).join('\n'))}</textarea></label>` : `<label><span>文字（/ 分隔）</span><input data-k="words" value="${esc(words)}" placeholder="${esc(fx?.hint ?? '')}"></label>`}
        <label class="sm"><span>秒數</span><input data-k="seconds" type="number" min="0.8" max="20" step="0.1" value="${sceneSeconds(s)}"></label>
        <label class="sm"><span>字型</span><select data-k="font"><option value="">跟整支</option>${FONT_PACKS.map((f) => `<option value="${f.id}"${s.font === f.id ? ' selected' : ''}>${f.zh}</option>`).join('')}</select></label>
        <label class="sm"><span>底色</span><select data-k="tone"><option value="">預設</option>${(['ink', 'paper', 'accent'] as Tone[]).map((t) => `<option value="${t}"${s.tone === t ? ' selected' : ''}>${{ ink: '深', paper: '淺', accent: '主色' }[t]}</option>`).join('')}</select></label>
      </div>
    </li>`;
  };

  let previewTimer = 0;
  const renderPreview = () => {
    clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => {
      const frame = $<HTMLIFrameElement>('#drPreview');
      const ok = draft.scenes.length > 0;
      $('#drPreviewWrap').dataset.ratio = draft.ratio ?? '16:9';
      frame.srcdoc = ok ? comboHtml(withPalette({ ...draft, title: draft.title || '未命名 Combo' })) : '';
      $('#drMeta').textContent = ok ? `${draft.scenes.length} 段 · 約 ${totalSeconds(draft)} 秒 · ${draft.ratio} · ${editingId ? `編輯中：${editingId}` : '尚未儲存'}` : '';
    }, 250);
  };

  const renderDraft = () => {
    $<HTMLInputElement>('#drTitle').value = draft.title;
    $<HTMLTextAreaElement>('#drBrief').value = draft.brief ?? '';
    $<HTMLInputElement>('#drTags').value = (draft.tags ?? []).join(' ');
    $('#drRatio').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === (draft.ratio ?? '16:9'))));
    $('#drTrans').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === (draft.transition ?? 'fade'))));
    $<HTMLSelectElement>('#drFont').value = draft.font ?? 'sharp';
    $('#drScenes').innerHTML = draft.scenes.map(sceneRow).join('');
    $('#drEmpty').hidden = draft.scenes.length > 0;
    $('#drKeyState').textContent = deps.store.get('key', '') ? '已設定' : '未設定';
    renderPreview();
  };

  const drFont = $<HTMLSelectElement>('#drFont');
  drFont.innerHTML = FONT_PACKS.map((f) => `<option value="${f.id}">整支字型：${f.zh}</option>`).join('');
  drFont.addEventListener('change', () => {
    if (drFont.value === 'sharp') delete draft.font;
    else draft.font = drFont.value;
    saveDraft();
    renderPreview();
  });
  $('#drTitle').addEventListener('input', (e) => {
    draft.title = (e.target as HTMLInputElement).value;
    saveDraft();
  });
  $('#drBrief').addEventListener('input', (e) => {
    draft.brief = (e.target as HTMLTextAreaElement).value;
    saveDraft();
  });
  $('#drTags').addEventListener('input', (e) => {
    draft.tags = (e.target as HTMLInputElement).value.split(/\s+/).map((t) => t.replace(/^#/, '')).filter(Boolean);
    saveDraft();
  });
  const seg = (id: string, set: (v: string) => void) =>
    $(id).addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!b) return;
      set(b.dataset.v!);
      saveDraft();
      renderDraft();
    });
  seg('#drRatio', (v) => (draft.ratio = v as Ratio));
  seg('#drTrans', (v) => (draft.transition = v as Transition));

  const scenesEl = $('#drScenes');
  scenesEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    const li = (e.target as HTMLElement).closest<HTMLElement>('.dr-scene');
    if (!b || !li) return;
    const i = Number(li.dataset.i);
    const s = draft.scenes;
    const act = b.dataset.act;
    if (act === 'open') return deps.openDetail(s[i].effect);
    if (act === 'studio') return deps.openStudio?.(s[i].effect, s[i].words ?? [], s[i].note);
    if (act === 'up' && i > 0) [s[i - 1], s[i]] = [s[i], s[i - 1]];
    if (act === 'down' && i < s.length - 1) [s[i + 1], s[i]] = [s[i], s[i + 1]];
    if (act === 'dup') s.splice(i + 1, 0, structuredClone(s[i]));
    if (act === 'del') s.splice(i, 1);
    saveDraft();
    renderDraft();
  });
  scenesEl.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const li = el.closest<HTMLElement>('.dr-scene');
    if (!li || !el.dataset.k) return;
    const s = draft.scenes[Number(li.dataset.i)];
    if (el.dataset.k === 'words') {
      const diagram = findEffect(s.effect)?.cat === 'diagram';
      const w = el.value.split(diagram ? '\n' : /\s*\/\s*/).map((x) => x.trim());
      if (diagram) s.words = w;
      else if (w.some(Boolean)) s.words = w.filter(Boolean);
      else delete s.words;
    } else if (el.dataset.k === 'seconds') {
      const v = parseFloat(el.value);
      if (v > 0) s.seconds = v;
    } else if (el.dataset.k === 'tone') {
      if (el.value) s.tone = el.value as Tone;
      else delete s.tone;
    } else if (el.dataset.k === 'font') {
      if (el.value) s.font = el.value;
      else delete s.font;
    }
    saveDraft();
    renderPreview();
    $('#drMeta').textContent = `${draft.scenes.length} 段 · 約 ${totalSeconds(draft)} 秒`;
  });

  const draftCombo = () => normalizeCombo(withPalette({ ...draft, title: draft.title || '未命名 Combo' }));
  $('#drPlay').addEventListener('click', () => {
    $<HTMLIFrameElement>('#drPreview').srcdoc = '';
    renderPreview();
  });
  $('#drCopyPrompt').addEventListener('click', () => draft.scenes.length && deps.copy(comboPrompt(draftCombo().combo), '已複製 Combo 提示詞'));
  $('#drCopyHtml').addEventListener('click', () => draft.scenes.length && deps.copy(comboHtml(draftCombo().combo, { hud: false }), '已複製 Combo HTML'));
  $('#drCopyJson').addEventListener('click', () => draft.scenes.length && deps.copy(JSON.stringify(draftCombo().combo, null, 2), '已複製 JSON，可以直接貼給 AI'));
  $('#drClear').addEventListener('click', () => {
    const b = $('#drClear');
    if (b.dataset.confirm !== '1') {
      b.dataset.confirm = '1';
      b.textContent = '再按一次確認清空';
      setTimeout(() => {
        b.dataset.confirm = '';
        b.textContent = '清空草稿';
      }, 2500);
      return;
    }
    draft = blank();
    editingId = undefined;
    b.dataset.confirm = '';
    b.textContent = '清空草稿';
    saveDraft();
    renderDraft();
  });
  const keyInput = $<HTMLInputElement>('#drKey');
  keyInput.value = deps.store.get('key', '');
  keyInput.addEventListener('change', () => {
    deps.store.set('key', keyInput.value.trim());
    $('#drKeyState').textContent = keyInput.value.trim() ? '已設定' : '未設定';
  });

  const api = async (path: string, init: RequestInit = {}) => {
    const key = deps.store.get('key', '');
    const res = await fetch(path, {
      ...init,
      headers: { 'content-type': 'application/json', ...(key ? { authorization: `Bearer ${key}` } : {}), ...(init.headers ?? {}) },
    });
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('json')) throw new Error('目前的網址沒有 Combo 後端（測試預覽版沒有資料庫），請到 motion.leichthub.com 使用。');
    const data = (await res.json()) as { ok: boolean; error?: string; errors?: string[] } & Record<string, unknown>;
    if (!res.ok || !data.ok) throw new Error(data.errors?.join('；') ?? data.error ?? `HTTP ${res.status}`);
    return data;
  };

  $('#drSave').addEventListener('click', async () => {
    if (!draft.scenes.length) return deps.toast('草稿還是空的');
    if (!deps.store.get('key', '')) {
      ($('#drKeyBox') as HTMLDetailsElement).open = true;
      keyInput.focus();
      return deps.toast('請先填寫寫入金鑰');
    }
    const { combo, errors } = draftCombo();
    if (errors.length) return deps.toast(errors[0]);
    const btn = $('#drSave');
    btn.setAttribute('aria-busy', 'true');
    try {
      const data = await api(editingId ? `/api/combos/${editingId}` : '/api/combos', { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(combo) });
      const saved = data.combo as Combo;
      editingId = saved.id;
      saveDraft();
      renderDraft();
      loaded = false;
      deps.toast(`已存到 Combo 庫（${saved.id}）`);
    } catch (e) {
      deps.toast(e instanceof Error ? e.message : '儲存失敗');
    } finally {
      btn.removeAttribute('aria-busy');
    }
  });

  /* ───────── Combo 庫 ───────── */
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        const f = e.target as HTMLIFrameElement;
        if (e.isIntersecting && !f.srcdoc) {
          const c = library.find((x) => x.id === f.dataset.id) ?? shared;
          if (c) f.srcdoc = comboHtml(c, { hud: true });
        } else if (!e.isIntersecting && f.srcdoc) f.removeAttribute('srcdoc');
      }),
    { rootMargin: '80px' },
  );

  const comboCard = (c: Combo, isShared = false) => `<article class="cb-card" data-id="${esc(c.id ?? '')}">
    <div class="cb-frame" data-ratio="${c.ratio ?? '16:9'}"><iframe title="${esc(c.title)}" sandbox="allow-scripts" data-id="${esc(c.id ?? '')}" loading="lazy"></iframe></div>
    <div class="cb-info">
      <h3>${esc(c.title)}</h3>
      ${c.brief ? `<p>${esc(c.brief)}</p>` : ''}
      <div class="cb-meta"><span>${c.scenes.length} 段</span><span>${totalSeconds(c)} 秒</span><span>${c.ratio ?? '16:9'}</span>${(c.tags ?? []).map((t) => `<span class="t">#${esc(t)}</span>`).join('')}${isShared ? '<span class="t warn">尚未儲存</span>' : ''}</div>
      <details class="cb-outline"><summary>分鏡</summary><pre>${esc(comboOutline(c))}</pre></details>
      <div class="cb-actions">
        ${c.id ? `<a class="btn-ghost" href="/c/${esc(c.id)}" target="_blank" rel="noopener">全螢幕播放</a>` : ''}
        <button class="btn-ghost" data-act="edit">${isShared ? '放進草稿' : '載入草稿編輯'}</button>
        <button class="btn-ghost" data-act="prompt">複製提示詞</button>
        <button class="btn-ghost" data-act="html">複製 HTML</button>
        ${c.id ? '<button class="btn-ghost danger" data-act="del">刪除</button>' : ''}
      </div>
    </div>
  </article>`;

  let shared: Combo | null = null;
  const renderShared = () => {
    const box = $('#cbShared');
    box.hidden = !shared;
    if (!shared) return;
    box.innerHTML = `<p class="cb-shared-h">AI 傳來的 Combo 預覽</p>${comboCard(shared, true)}`;
    box.querySelectorAll('iframe').forEach((f) => io.observe(f));
  };

  const renderLibrary = () => {
    const q = $<HTMLInputElement>('#cbQ').value.trim().toLowerCase();
    const list = q ? library.filter((c) => JSON.stringify([c.title, c.brief, c.tags, c.scenes]).toLowerCase().includes(q)) : library;
    grid.querySelectorAll('iframe').forEach((f) => io.unobserve(f));
    grid.innerHTML = list.map((c) => comboCard(c)).join('');
    grid.querySelectorAll('iframe').forEach((f) => io.observe(f));
    if (loaded && !library.length) showMsg('Combo 庫還是空的。到「我的草稿」組一個，或請 AI 透過 MCP 幫你組。');
    else if (loaded && !list.length) showMsg(`沒有符合「${q}」的 Combo`);
    else msg.hidden = true;
  };
  const showMsg = (t: string) => {
    msg.hidden = false;
    msg.textContent = t;
  };

  const loadLibrary = async (force = false) => {
    if (loaded && !force) return renderLibrary();
    showMsg('讀取中⋯');
    try {
      const data = await api('/api/combos?limit=200');
      library = data.combos as Combo[];
      loaded = true;
      renderLibrary();
    } catch (e) {
      grid.innerHTML = '';
      showMsg(e instanceof Error ? e.message : '讀取失敗');
    }
  };
  $('#cbReload').addEventListener('click', () => loadLibrary(true));
  $('#cbQ').addEventListener('input', renderLibrary);

  $('.cb-body').addEventListener('click', async (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    const card = (e.target as HTMLElement).closest<HTMLElement>('.cb-card');
    if (!b || !card) return;
    const id = card.dataset.id;
    const c = id ? library.find((x) => x.id === id) : shared;
    if (!c) return;
    if (b.dataset.act === 'prompt') return deps.copy(comboPrompt(c), '已複製 Combo 提示詞');
    if (b.dataset.act === 'html') return deps.copy(comboHtml(c, { hud: false }), '已複製 Combo HTML');
    if (b.dataset.act === 'edit') {
      draft = structuredClone({ ...c, id: undefined, created_at: undefined, updated_at: undefined });
      editingId = c.id;
      saveDraft();
      return show('draft');
    }
    if (b.dataset.act === 'del') {
      if (b.dataset.confirm !== '1') {
        b.dataset.confirm = '1';
        b.textContent = '確定刪除？';
        setTimeout(() => {
          b.dataset.confirm = '';
          b.textContent = '刪除';
        }, 2500);
        return;
      }
      try {
        await api(`/api/combos/${id}`, { method: 'DELETE' });
        library = library.filter((x) => x.id !== id);
        if (editingId === id) editingId = undefined;
        renderLibrary();
        deps.toast('已刪除');
      } catch (err) {
        deps.toast(err instanceof Error ? err.message : '刪除失敗');
      }
    }
  });

  /* ───────── MCP ───────── */
  const mcpUrl = `${location.origin}/mcp`;
  $('#mcpUrl').textContent = mcpUrl;
  $('#mcpCC').textContent = `claude mcp add --transport http motion-atlas ${mcpUrl} \\\n  --header "Authorization: Bearer 你的金鑰"`;
  $('#mcpCopy').addEventListener('click', () => deps.copy(mcpUrl, '已複製 MCP 網址'));

  /* ───────── 視窗與分頁 ───────── */
  const show = (t: Tab) => {
    tab = t;
    $('#cbTabs').querySelectorAll<HTMLElement>('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
    dlg.querySelectorAll<HTMLElement>('[data-pane]').forEach((p) => (p.hidden = p.dataset.pane !== t));
    if (!dlg.open) {
      dlg.showModal();
      document.body.style.overflow = 'hidden';
    }
    if (t === 'library') {
      renderShared();
      loadLibrary();
    }
    if (t === 'draft') renderDraft();
  };
  $('#cbTabs').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-tab]');
    if (b) show(b.dataset.tab as Tab);
  });
  $('#comboBtn').addEventListener('click', () => show(draft.scenes.length && !loaded ? 'draft' : 'library'));
  $('#cbClose').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());
  dlg.addEventListener('close', () => {
    document.body.style.overflow = '';
    $<HTMLIFrameElement>('#drPreview').srcdoc = '';
    dlg.querySelectorAll<HTMLIFrameElement>('.cb-card iframe').forEach((f) => f.removeAttribute('srcdoc'));
    const u = new URL(location.href);
    if (u.searchParams.has('view') || u.searchParams.has('combo')) {
      u.searchParams.delete('view');
      u.searchParams.delete('combo');
      history.replaceState({}, '', u.pathname + u.search);
    }
  });

  // 網址參數：?view=combos｜draft｜mcp、?combo=<編碼後的 Combo>
  const params = new URLSearchParams(location.search);
  const enc = params.get('combo');
  if (enc) {
    try {
      const { combo, errors } = normalizeCombo(decodeCombo(enc));
      if (!errors.length) shared = combo;
    } catch {
      deps.toast('預覽連結的 Combo 資料無法讀取');
    }
  }
  const view = params.get('view');
  saveDraft();
  if (shared) show('library');
  else if (view === 'combos') show('library');
  else if (view === 'draft') show('draft');
  else if (view === 'mcp') show('mcp');

  /** 套組：換掉目前草稿（草稿有內容時先確認）並打開草稿頁 */
  const loadDraft = (c: Combo) => {
    if (draft.scenes.length && !confirm(`目前草稿有 ${draft.scenes.length} 段，要換成「${c.title}」嗎？`)) return;
    draft = c;
    editingId = undefined;
    saveDraft();
    show('draft');
    deps.toast(`已帶入套組「${c.title}」，把文字換成自己的內容`);
  };
  return { addScene, loadDraft, isOpen: () => dlg.open, encode: encodeCombo };
};
