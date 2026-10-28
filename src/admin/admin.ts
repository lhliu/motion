// Motion Atlas 後台：清單／批次／排序／合併／Combo 健檢／紀錄／轉址／固化
// 編號永遠鎖定；「移除」一律是隱藏＋轉址，不刪招。
import './admin.css';

type Fx = { id: string; no: number; zh: string; en: string; desc: string; cat: string; sec: string; baseCat: string; tags: string[]; hidden: boolean; baseHidden: boolean; redirect: string | null; variant: string | null; featured: boolean; note: string; fav: boolean; sort: number | null; order: number; added: string; pack: number | null; overridden: boolean };
type Cat = { id: string; sec: string; zh: string; code: string };
type Sec = { id: string; zh: string };
type Data = { me: string; sections: Sec[]; categories: Cat[]; effects: Fx[]; picks: string[]; report: { orphans: string[]; invalid: string[] } };

const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const app = $('#app');
let D: Data;
const sel = new Set<string>();
let lastClick: string | null = null;
let page = 0;
const PER = 60;
const F = { q: '', sec: '', cat: '', status: '', tag: '', sortBy: 'no' };

async function api<T = unknown>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(`/api/admin/${path}`, body === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
  if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
  return j as T;
}
function toast(msg: string) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout((t as any)._t); (t as any)._t = setTimeout(() => (t.hidden = true), 2600); }
async function load() { D = await api<Data>('catalog'); $('#who').textContent = `登入：${D.me}`; }
async function op(body: Record<string, unknown>, msg?: string) {
  try { const r = await api<{ changed: number }>('ops', body); await load(); toast(msg ?? `已更新 ${r.changed} 招（可在「紀錄」復原）`); render(); }
  catch (e) { toast(`失敗：${(e as Error).message}`); }
}
const catName = (id: string) => D.categories.find((c) => c.id === id)?.zh ?? id;
const secName = (id: string) => D.sections.find((s) => s.id === id)?.zh ?? id;
const byId = () => new Map(D.effects.map((f) => [f.id, f]));
const status = (f: Fx) => (f.redirect ? '轉址' : f.hidden ? '隱藏' : '公開');
const badge = (f: Fx) => f.redirect ? `<span class="b red">轉址 → #${byId().get(f.redirect)?.no ?? '?'}</span>` : f.hidden ? '<span class="b hid">隱藏</span>' : '<span class="b pub">公開</span>';

// ---------- 篩選 ----------
function filtered(): Fx[] {
  const q = F.q.trim().toLowerCase();
  let list = D.effects.filter((f) => {
    if (F.sec && f.sec !== F.sec) return false;
    if (F.cat && f.cat !== F.cat) return false;
    if (F.tag && !f.tags.includes(F.tag)) return false;
    if (F.status === 'public' && f.hidden) return false;
    if (F.status === 'hidden' && (!f.hidden || f.redirect)) return false;
    if (F.status === 'redirect' && !f.redirect) return false;
    if (F.status === 'changed' && !f.overridden) return false;
    if (F.status === 'featured' && !f.featured) return false;
    if (F.status === 'fav' && !f.fav) return false;
    if (F.status === 'note' && !f.note) return false;
    if (q && !`#${f.no} ${f.no} ${f.zh} ${f.en} ${f.id} ${f.tags.join(' ')} ${f.note} ${catName(f.cat)}`.toLowerCase().includes(q)) return false;
    return true;
  });
  if (F.sortBy === 'no') list = [...list].sort((a, b) => a.no - b.no);
  else if (F.sortBy === 'added') list = [...list].sort((a, b) => b.added.localeCompare(a.added) || b.no - a.no);
  else if (F.sortBy === 'zh') list = [...list].sort((a, b) => a.zh.localeCompare(b.zh, 'zh-Hant'));
  return list; // 'site'：網站上的顯示順序（order）
}
function filterLabel() {
  const parts = [F.q && `搜尋「${F.q}」`, F.sec && `大類：${secName(F.sec)}`, F.cat && `子分類：${catName(F.cat)}`, F.status && `狀態：${({ public: '公開', hidden: '隱藏', redirect: '轉址', changed: '有覆寫', featured: '精選', fav: '收藏', note: '有備註' } as Record<string, string>)[F.status]}`, F.tag && `標籤：${F.tag}`].filter(Boolean);
  return parts.length ? parts.join('；') : '無（全部）';
}

// ---------- 匯出清單（Markdown／.md／.json） ----------
const taipei = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', dateStyle: 'short', timeStyle: 'short' }).format(new Date()) + '（台北時間）';
function exportItems(ids: string[]) { const m = byId(); return ids.map((id) => m.get(id)!).filter(Boolean).sort((a, b) => a.no - b.no); }
function toMarkdown(list: Fx[], filters: string) {
  const head = `# Motion Atlas 特效清單\n\n- 匯出時間：${taipei()}\n- 數量：${list.length} 招\n- 篩選：${filters}\n\n`;
  return head + list.map((f) => `- #${f.no} ${f.zh}｜\`${f.id}\`｜${secName(f.sec)}／${catName(f.cat)}｜${status(f)}${f.redirect ? ` → #${byId().get(f.redirect)?.no}` : ''}｜${f.tags.length ? f.tags.map((t) => `#${t}`).join(' ') : '（無標籤）'}`).join('\n') + '\n';
}
function toJson(list: Fx[], filters: string) {
  return JSON.stringify({ exported_at: taipei(), count: list.length, filters, effects: list.map((f) => ({ no: f.no, name: f.zh, en: f.en, id: f.id, section: secName(f.sec), category: catName(f.cat), status: status(f), redirect_to: f.redirect, tags: f.tags })) }, null, 2);
}
function download(name: string, text: string, type: string) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); } catch { const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
}
function exportDialog(ids: string[]) {
  const list = exportItems(ids), filters = filterLabel(), md = toMarkdown(list, filters);
  const dlg = $<HTMLDialogElement>('#dlg');
  const stamp = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', dateStyle: 'short' }).format(new Date());
  dlg.innerHTML = `<h2>匯出清單（${list.length} 招）</h2><p class="muted">Markdown 一行一招：編號、名稱、id、大類／子分類、狀態、標籤。</p><textarea readonly>${esc(md)}</textarea>
  <div class="row"><button data-x="json">下載 .json</button><button data-x="md">下載 .md</button><button class="pri" data-x="copy">複製 Markdown</button><button data-x="close">關閉</button></div>`;
  dlg.onclick = async (e) => {
    const x = (e.target as HTMLElement).dataset.x;
    if (x === 'copy') { await copy(md); toast(`已複製 ${list.length} 招到剪貼簿`); }
    if (x === 'md') download(`motion-atlas-${stamp}-${list.length}.md`, md, 'text/markdown');
    if (x === 'json') download(`motion-atlas-${stamp}-${list.length}.json`, toJson(list, filters), 'application/json');
    if (x === 'close') dlg.close();
  };
  dlg.showModal();
}

// ---------- 小對話框 ----------
function ask(title: string, html: string, okText = '確定'): Promise<HTMLFormElement | null> {
  const dlg = $<HTMLDialogElement>('#dlg');
  dlg.innerHTML = `<form method="dialog"><h2>${title}</h2>${html}<div class="row"><button value="no">取消</button><button class="pri" value="ok">${okText}</button></div></form>`;
  dlg.showModal();
  return new Promise((res) => dlg.addEventListener('close', () => res(dlg.returnValue === 'ok' ? $<HTMLFormElement>('form', dlg) : null), { once: true }));
}
const catOptions = (cur = '') => D.sections.map((s) => `<optgroup label="${esc(s.zh)}">${D.categories.filter((c) => c.sec === s.id).map((c) => `<option value="${c.id}" ${c.id === cur ? 'selected' : ''}>${esc(c.zh)}</option>`).join('')}</optgroup>`).join('');

// ---------- 縮圖（hover 輪播 3 格） ----------
const thumbs = new Set<string>();
function thumbHtml(f: Fx) { return thumbs.has(f.id) ? `<span class="th" data-th="${f.id}" style="background-image:url(/api/thumb/${f.id}?f=1)"></span>` : '<span class="th none">無圖</span>'; }
document.addEventListener('mouseover', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-th]');
  if (!el || (el as any)._cy) return;
  let i = 1;
  (el as any)._cy = setInterval(() => { i = (i + 1) % 3; el.style.backgroundImage = `url(/api/thumb/${el.dataset.th}?f=${i})`; }, 450);
  el.addEventListener('mouseleave', () => { clearInterval((el as any)._cy); (el as any)._cy = 0; el.style.backgroundImage = `url(/api/thumb/${el.dataset.th}?f=1)`; }, { once: true });
});

// ---------- 畫面：清單 ----------
function viewList() {
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / PER));
  page = Math.min(page, pages - 1);
  const rows = list.slice(page * PER, page * PER + PER);
  const tags = [...new Set(D.effects.flatMap((f) => f.tags))].sort();
  const allSel = list.length > 0 && list.every((f) => sel.has(f.id));
  app.innerHTML = `<h2>特效清單 <small class="muted">${D.effects.filter((f) => !f.hidden).length} 公開／${D.effects.length} 全部</small></h2>
  ${D.report.orphans.length || D.report.invalid.length ? `<div class="warnbox">覆寫警告：${esc([...D.report.orphans.map((o) => `找不到 ${o}`), ...D.report.invalid].join('；'))}</div>` : ''}
  <div class="bar"><input type="search" id="q" placeholder="搜尋編號、名稱、id、標籤、備註…" value="${esc(F.q)}">
  <select id="sec"><option value="">全部大類</option>${D.sections.map((s) => `<option value="${s.id}" ${F.sec === s.id ? 'selected' : ''}>${esc(s.zh)}</option>`).join('')}</select>
  <select id="cat"><option value="">全部子分類</option>${catOptions(F.cat)}</select>
  <select id="status">${[['', '全部狀態'], ['public', '公開'], ['hidden', '隱藏'], ['redirect', '轉址'], ['changed', '有覆寫'], ['featured', '精選'], ['fav', '收藏'], ['note', '有備註']].map(([v, t]) => `<option value="${v}" ${F.status === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
  <select id="tag"><option value="">全部標籤</option>${tags.map((t) => `<option ${F.tag === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
  <select id="sortBy">${[['no', '依編號'], ['site', '網站順序'], ['added', '新加入'], ['zh', '依名稱']].map(([v, t]) => `<option value="${v}" ${F.sortBy === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
  ${sel.size ? `<div class="bulk"><b>已選 ${sel.size} 招</b><button data-b="export" class="pri">匯出清單</button><button data-b="hide">隱藏</button><button data-b="show">顯示</button><button data-b="cat">改分類</button><button data-b="tags">標籤</button><button data-b="feat">設精選</button><button data-b="unfeat">取消精選</button><button data-b="fav">收藏</button><button data-b="merge">合併…</button><button data-b="reset" class="warn">回到預設</button><button data-b="clear">清除選取</button></div>` : `<div class="bar"><span class="muted">勾選可批次操作；按住 Shift 點選可連選一段。</span><button data-b="exportall">匯出目前篩選（${list.length} 招）</button></div>`}
  <table><thead><tr><th><input type="checkbox" id="all" ${allSel ? 'checked' : ''} title="全選目前篩選的 ${list.length} 招"></th><th></th><th>編號</th><th>名稱</th><th>分類</th><th>標籤</th><th>狀態</th><th>公開</th><th>精選</th><th>收藏</th><th>備註</th></tr></thead>
  <tbody>${rows.map((f) => `<tr data-id="${f.id}" class="${sel.has(f.id) ? 'sel' : ''}"><td><input type="checkbox" data-c ${sel.has(f.id) ? 'checked' : ''}></td><td>${thumbHtml(f)}</td>
  <td class="no">#${f.no}</td><td><b>${esc(f.zh)}</b>${f.variant ? ` <span class="muted">（變體 ${esc(f.variant)}）</span>` : ''}<div class="id">${f.id}</div></td>
  <td>${esc(secName(f.sec))}／${esc(catName(f.cat))}${f.cat !== f.baseCat ? ' <span class="b ovr">已改</span>' : ''}</td><td>${f.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</td>
  <td>${badge(f)}${f.overridden ? ' <span class="b ovr">覆寫</span>' : ''}</td><td><button class="tog ${f.hidden ? '' : 'on'}" data-r="tog" ${f.redirect ? 'disabled title="轉址中的招式請到「轉址」取消"' : ''}></button></td>
  <td><button class="star ${f.featured ? 'on' : ''}" data-r="feat">★</button></td><td><button class="star heart ${f.fav ? 'on' : ''}" data-r="fav">♥</button></td><td class="note" data-r="note" title="點一下編輯備註">${f.note ? esc(f.note) : '<span class="muted">＋</span>'}</td></tr>`).join('')}</tbody></table>
  <div class="pager"><button data-p="-1" ${page ? '' : 'disabled'}>上一頁</button><span>${page + 1} / ${pages}（${list.length} 招）</span><button data-p="1" ${page < pages - 1 ? '' : 'disabled'}>下一頁</button></div>`;

  for (const k of ['q', 'sec', 'cat', 'status', 'tag', 'sortBy'] as const) {
    const el = $<HTMLInputElement>(`#${k}`);
    el.addEventListener(k === 'q' ? 'input' : 'change', () => { (F as any)[k] = el.value; page = 0; if (k === 'q') { clearTimeout((el as any)._t); (el as any)._t = setTimeout(() => { render(); const n = $<HTMLInputElement>('#q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 200); } else render(); });
  }
  $<HTMLInputElement>('#all').onchange = (e) => { const on = (e.target as HTMLInputElement).checked; list.forEach((f) => (on ? sel.add(f.id) : sel.delete(f.id))); render(); };
  app.querySelectorAll<HTMLButtonElement>('[data-p]').forEach((b) => (b.onclick = () => { page += Number(b.dataset.p); render(); }));
  app.querySelector('tbody')!.addEventListener('click', (e) => {
    const t = e.target as HTMLElement, tr = t.closest<HTMLElement>('tr[data-id]'); if (!tr) return;
    const id = tr.dataset.id!, f = byId().get(id)!;
    if (t.matches('[data-c]')) {
      const on = (t as HTMLInputElement).checked;
      if ((e as MouseEvent).shiftKey && lastClick) {
        const ids = list.map((x) => x.id), a = ids.indexOf(lastClick), b = ids.indexOf(id);
        if (a >= 0 && b >= 0) ids.slice(Math.min(a, b), Math.max(a, b) + 1).forEach((x) => (on ? sel.add(x) : sel.delete(x)));
      } else on ? sel.add(id) : sel.delete(id);
      lastClick = id; render(); return;
    }
    const r = t.closest<HTMLElement>('[data-r]')?.dataset.r;
    if (r === 'tog') op({ op: f.hidden ? 'show' : 'hide', ids: [id] }, `${f.hidden ? '已公開' : '已隱藏'} #${f.no} ${f.zh}`);
    if (r === 'feat') op({ op: 'featured', ids: [id], on: !f.featured });
    if (r === 'fav') op({ op: 'fav', ids: [id], on: !f.fav });
    if (r === 'note') ask(`備註 #${f.no} ${esc(f.zh)}`, `<textarea name="note" style="height:120px">${esc(f.note)}</textarea>`, '儲存').then((fm) => fm && op({ op: 'note', ids: [id], note: (fm.elements.namedItem('note') as HTMLTextAreaElement).value }, '備註已儲存'));
  });
  app.querySelectorAll<HTMLButtonElement>('[data-b]').forEach((b) => (b.onclick = () => bulk(b.dataset.b!, list)));
}
async function bulk(b: string, list: Fx[]) {
  const ids = [...sel];
  if (b === 'exportall') return exportDialog(list.map((f) => f.id));
  if (b === 'export') return exportDialog(ids);
  if (b === 'clear') { sel.clear(); return render(); }
  if (b === 'hide' || b === 'show') return op({ op: b, ids });
  if (b === 'feat' || b === 'unfeat') return op({ op: 'featured', ids, on: b === 'feat' });
  if (b === 'fav') return op({ op: 'fav', ids, on: true });
  if (b === 'cat') { const fm = await ask(`把 ${ids.length} 招改到…`, `<p class="muted">只改分類與顯示位置，編號不變。</p><select name="cat">${catOptions()}</select>`); if (fm) op({ op: 'cat', ids, cat: (fm.elements.namedItem('cat') as HTMLSelectElement).value }); return; }
  if (b === 'tags') { const fm = await ask(`標籤（${ids.length} 招）`, `<p>加入（逗號分隔）<br><input name="add" style="width:100%"></p><p>移除（逗號分隔）<br><input name="rm" style="width:100%"></p>`); if (fm) { const v = (n: string) => (fm.elements.namedItem(n) as HTMLInputElement).value.split(/[,，、]/).map((s) => s.trim()).filter(Boolean); op({ op: 'tags', ids, add: v('add'), remove: v('rm') }); } return; }
  if (b === 'reset') { if (await ask('回到程式預設', `<p>清除這 ${ids.length} 招的所有覆寫（隱藏、分類、排序、標籤、精選、轉址、備註）。可在「紀錄」復原。</p>`, '清除')) op({ op: 'reset', ids }); return; }
  if (b === 'merge') { location.hash = '#merge'; }
}

// ---------- 畫面：分類與排序 ----------
function viewOrder() {
  const cat = F.cat || D.categories[0].id;
  const list = D.effects.filter((f) => f.cat === cat && !f.hidden).sort((a, b) => a.order - b.order);
  app.innerHTML = `<h2>分類與排序</h2><p class="muted">拖曳調整子分類內的顯示順序（只改順序，編號永遠不變）。要換子分類請在清單勾選後用「改分類」。</p>
  <div class="bar"><select id="ocat">${catOptions(cat)}</select><button class="pri" id="save">儲存順序</button><button id="rs">恢復預設順序</button></div>
  <ul class="drag" id="dl">${list.map((f) => `<li draggable="true" data-id="${f.id}">${thumbHtml(f).replace('class="th', 'style="width:30px;height:54px" class="th')}<span class="no">#${f.no}</span><b>${esc(f.zh)}</b><span class="id">${f.id}</span>${f.sort != null ? '<span class="b ovr">已排序</span>' : ''}<span style="margin-left:auto"><button data-mv="-1">↑</button> <button data-mv="1">↓</button></span></li>`).join('')}</ul>`;
  $<HTMLSelectElement>('#ocat').onchange = (e) => { F.cat = (e.target as HTMLSelectElement).value; render(); };
  const ul = $('#dl'); let drag: HTMLElement | null = null;
  ul.addEventListener('dragstart', (e) => (drag = (e.target as HTMLElement).closest('li')));
  ul.addEventListener('dragover', (e) => { e.preventDefault(); const li = (e.target as HTMLElement).closest('li'); if (li && drag && li !== drag) { const r = li.getBoundingClientRect(); li.parentNode!.insertBefore(drag, e.clientY > r.top + r.height / 2 ? li.nextSibling : li); } });
  ul.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>('[data-mv]'); if (!b) return; const li = b.closest('li')!; if (b.dataset.mv === '-1' && li.previousElementSibling) ul.insertBefore(li, li.previousElementSibling); else if (b.dataset.mv === '1' && li.nextElementSibling) ul.insertBefore(li.nextElementSibling, li); });
  $('#save').onclick = () => op({ op: 'order', cat, ids: [...ul.querySelectorAll<HTMLElement>('li')].map((li) => li.dataset.id) }, '順序已儲存');
  $('#rs').onclick = () => { const ids = list.filter((f) => f.sort != null).map((f) => f.id); if (ids.length) op({ op: 'reset', ids }, '已恢復預設順序'); else toast('這個子分類沒有自訂順序'); };
}

// ---------- 畫面：合併 ----------
function viewMerge() {
  const m = byId(), ids = [...sel].filter((id) => m.has(id)), list = exportItems(ids);
  app.innerHTML = `<h2>合併成一招</h2><p class="muted">選一招當主招；其他招會<b>隱藏並轉址</b>到主招（不刪除、編號保留，舊 Combo 與舊連結照常播放）。同一包的招式會記為主招的變體。</p>
  ${list.length < 2 ? '<div class="warnbox">請先在「清單」勾選至少 2 招，再回來這裡。</div>' : `<div class="card">${list.map((f, i) => `<label style="display:flex;gap:10px;align-items:center;margin:6px 0"><input type="radio" name="main" value="${f.id}" ${i === 0 ? 'checked' : ''}>${thumbHtml(f)}<span class="no">#${f.no}</span><b>${esc(f.zh)}</b><span class="id">${f.id}</span>${f.pack ? `<span class="tag">第 ${f.pack} 包</span>` : ''}</label>`).join('')}</div>
  <button class="pri" id="go">合併 ${list.length - 1} 招到主招</button>`}`;
  $('#go')?.addEventListener('click', async () => { const main = $<HTMLInputElement>('input[name=main]:checked').value; await op({ op: 'merge', ids, main }, `已合併到 #${m.get(main)!.no}`); sel.clear(); location.hash = '#redirects'; });
}

// ---------- 畫面：轉址／已退場 ----------
function viewRedirects() {
  const m = byId();
  const red = D.effects.filter((f) => f.redirect), hid = D.effects.filter((f) => f.hidden && !f.redirect);
  app.innerHTML = `<h2>轉址與已退場</h2><p class="muted">退場的招式一律保留（隱藏），舊 Combo、舊連結、MCP 都能解析。轉址的招式打開時會帶到主招。</p>
  <div class="grid2"><div class="card"><h3>轉址（${red.length}）</h3><table>${red.map((f) => `<tr><td class="no">#${f.no}</td><td>${esc(f.zh)}<div class="id">${f.id}</div></td><td>→ <b>#${m.get(f.redirect!)?.no} ${esc(m.get(f.redirect!)?.zh)}</b>${f.variant ? `<div class="id">變體 ${esc(f.variant)}</div>` : ''}</td><td><button data-un="${f.id}">取消轉址</button></td></tr>`).join('')}</table></div>
  <div class="card"><h3>隱藏（${hid.length}）</h3><table>${hid.map((f) => `<tr><td class="no">#${f.no}</td><td>${esc(f.zh)}<div class="id">${f.id}</div></td><td>${f.baseHidden ? '<span class="tag">程式預設</span>' : '<span class="b ovr">後台</span>'}</td><td><button data-show="${f.id}">重新公開</button></td></tr>`).join('')}</table></div></div>`;
  app.querySelectorAll<HTMLElement>('[data-un]').forEach((b) => (b.onclick = () => op({ op: 'unmerge', ids: [b.dataset.un] }, '已取消轉址')));
  app.querySelectorAll<HTMLElement>('[data-show]').forEach((b) => (b.onclick = () => op({ op: 'show', ids: [b.dataset.show] }, '已重新公開')));
}

// ---------- 畫面：Combo 健檢 ----------
async function viewCombos() {
  app.innerHTML = '<h2>Combo 健檢</h2><p class="muted">掃描中…</p>';
  const r = await api<{ items: { kind: string; id: string; title: string; refs: { effect: string; status: string; target?: string; variant?: string | null }[] }[]; scanned: { combos: number; presets: number } }>('combos');
  const m = byId();
  const lab = (s: string) => ({ missing: '<span class="b red">不存在</span>', redirect: '<span class="b ovr">已轉址</span>', hidden: '<span class="b hid">已隱藏（仍可播放）</span>' })[s];
  app.innerHTML = `<h2>Combo 健檢</h2><p class="muted">掃描 ${r.scanned.combos} 個 Combo、${r.scanned.presets} 個預設。隱藏的招式仍能播放；「修正」只改寫沒有變體的轉址。</p>
  ${r.items.length ? `<table><tr><th>類型</th><th>名稱</th><th>問題</th><th></th></tr>${r.items.map((c) => `<tr><td>${c.kind === 'combo' ? 'Combo' : '預設'}</td><td><b>${esc(c.title)}</b><div class="id">${c.id}</div></td><td>${c.refs.map((x) => `<div>${lab(x.status)} #${m.get(x.effect)?.no ?? '?'} ${esc(m.get(x.effect)?.zh ?? x.effect)}${x.target ? ` → #${m.get(x.target)?.no}` : ''}</div>`).join('')}</td><td>${c.kind === 'combo' && c.refs.some((x) => x.status === 'redirect' && !x.variant) ? `<button data-fix="${c.id}">修正</button>` : ''}</td></tr>`).join('')}</table>` : '<div class="card">✅ 所有 Combo 和預設都只用到公開的招式。</div>'}`;
  app.querySelectorAll<HTMLElement>('[data-fix]').forEach((b) => (b.onclick = async () => { const x = await api<{ changed: number }>('combos/fix', { id: b.dataset.fix }); toast(`已改寫 ${x.changed} 段`); viewCombos(); }));
}

// ---------- 畫面：紀錄／復原 ----------
async function viewAudit() {
  const r = await api<{ items: { seq: number; at: string; actor: string; action: string; summary: string; undone: number; count: number }[] }>('audit');
  const fmt = (s: string) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', dateStyle: 'short', timeStyle: 'medium' }).format(new Date(s));
  app.innerHTML = `<h2>操作紀錄</h2><p class="muted">每次變更都記錄前後狀態，可逐筆復原（時間為台北時間）。</p><table><tr><th>#</th><th>時間</th><th>操作</th><th>誰</th><th></th></tr>
  ${r.items.map((x) => `<tr><td class="no">${x.seq}</td><td>${fmt(x.at)}</td><td>${esc(x.summary)}</td><td class="id">${esc(x.actor)}</td><td>${x.undone ? '<span class="b hid">已復原</span>' : x.action === 'undo' || x.action === 'combo-fix' ? '' : `<button data-u="${x.seq}">復原</button>`}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">還沒有紀錄</td></tr>'}</table>`;
  app.querySelectorAll<HTMLElement>('[data-u]').forEach((b) => (b.onclick = async () => { try { await api('undo', { seq: Number(b.dataset.u) }); await load(); toast('已復原'); viewAudit(); } catch (e) { toast(`失敗：${(e as Error).message}`); } }));
}

// ---------- 畫面：固化（匯出成 PR） ----------
function viewBake() {
  const n = D.effects.filter((f) => f.overridden).length;
  app.innerHTML = `<h2>固化到程式碼</h2><div class="card"><p>目前有 <b>${n}</b> 招有後台覆寫。覆寫即時生效；固化是把它們寫進 <code>src/catalog.baked.json</code> 開成 PR，讓程式預設跟後台一致（D1 掛掉也一樣）。</p>
  <p>固化仍是<b>隱藏＋轉址</b>：不刪任何招式、不改任何編號。備註與收藏不會寫進 repo。</p>
  <ol><li>按下面按鈕下載匯出檔</li><li>在 repo 執行 <code>node scripts/bake-catalog.mjs 下載的檔案.json --pr</code></li><li>檢查 PR（build、npm test、check:visual）後再合併</li></ol>
  <button class="pri" id="dl">下載固化匯出檔（.json）</button></div>`;
  $('#dl').onclick = async () => { const j = await api('export'); download(`motion-atlas-overrides-${Date.now()}.json`, JSON.stringify(j, null, 2), 'application/json'); };
}

// ---------- 路由 ----------
const VIEWS: [string, string, () => unknown][] = [['list', '特效清單', viewList], ['order', '分類與排序', viewOrder], ['merge', '合併', viewMerge], ['redirects', '轉址／退場', viewRedirects], ['combos', 'Combo 健檢', viewCombos], ['audit', '操作紀錄', viewAudit], ['bake', '固化到程式碼', viewBake]];
function render() {
  const v = location.hash.slice(1) || 'list';
  $('#nav').innerHTML = VIEWS.map(([k, t]) => `<a href="#${k}" class="${k === v ? 'on' : ''}">${t}${k === 'merge' && sel.size ? ` <small>(${sel.size})</small>` : ''}</a>`).join('') + '<hr><small>編號永遠鎖定<br>移除＝隱藏＋轉址</small>';
  (VIEWS.find(([k]) => k === v) ?? VIEWS[0])[2]();
}
addEventListener('hashchange', render);
(async () => {
  try {
    await load();
    const t = await api<{ items: { id: string }[] }>('thumbs').catch(() => ({ items: [] }));
    t.items.forEach((x) => thumbs.add(x.id));
    render();
  } catch (e) { app.innerHTML = `<div class="warnbox">無法載入後台：${esc((e as Error).message)}<br>正式環境需先通過 Cloudflare Access 登入。</div>`; }
})();
