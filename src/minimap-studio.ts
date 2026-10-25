// 小地圖（#339）編輯器：點區塊改用途、點道路改等級，右邊配色表一次改同一種用途的顏色；
// 形狀由 AI 照截圖描（build_minimap），這裡只調用途、顏色與版面。結果可存成預設代碼給 AI 讀。
import { saveBlob, stamp, canvasOf } from './export-kit';
import { miniFromWords, miniPos } from './effects/minimap';
import { KIND_NAME, MINI_KINDS, MINI_PALETTES, MINI_SAMPLE, ROAD_NAME, miniLayout, miniSvg, normalizeMini, paletteOf, path, roadCls, type MiniKind, type MiniMap, type RoadCls } from './minimap';
import { presetBar } from './preset-bar';
import type { Preset } from './presets';
import { esc } from './util';

export interface MinimapStudioDeps {
  toast: (msg: string) => void;
  copy: (text: string, msg: string) => Promise<void>;
  addScene: (s: { effect: string; words: string[]; seconds?: number; ratio?: '9:16' | '16:9' | '1:1' }) => void;
  store: { get<T>(k: string, d: T): T; set(k: string, v: unknown): void };
}

type Sel = { t: 'a' | 'r'; i: number } | null;
const ROAD_CLS: RoadCls[] = ['main', 'minor', 'lane'];
const clone = (m: MiniMap): MiniMap => JSON.parse(JSON.stringify(m));

export const initMinimapStudio = (deps: MinimapStudioDeps) => {
  const dlg = document.querySelector<HTMLDialogElement>('#mmstudio')!;
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => dlg.querySelector<T>(s)!;
  const stage = $('#mmStage');
  let m: MiniMap = clone(deps.store.get<MiniMap | null>('mmstudio', null) ?? MINI_SAMPLE);
  let sel: Sel = null;
  let view: 'map' | 'video' = 'map';

  const persist = () => deps.store.set('mmstudio', m);
  const bar = presetBar($('#mmPreset'), { kind: 'minimap', getData: () => m, onLoad: (p) => load(p.data), toast: deps.toast, copy: deps.copy, store: deps.store });

  /* ───────── 畫面 ───────── */
  // 點選用的透明圖層：區塊填色區、道路加寬的筆畫，選到的畫紅色虛線
  const hitSvg = () => {
    const W = m.w ?? 1410, H = m.h ?? 1128, k = m.scale ?? 1;
    const flat = m.style === 'flat';
    const rw = (i: number) => {
      const r = m.roads[i], w = typeof r.w === 'number' ? r.w : ({ main: flat ? 35 : 70, minor: flat ? 18 : 56, lane: flat ? 12 : 14 } as const)[roadCls(r)];
      return w * k;
    };
    const areas = (m.areas ?? []).map((a, i) => `<path data-a="${i}" d="${path(a.pts)}Z" fill="transparent"/>`).join('');
    const roads = m.roads.map((r, i) => `<path data-r="${i}" d="${path(r.pts)}" fill="none" stroke="transparent" stroke-width="${Math.max(rw(i), 34)}" stroke-linecap="round"/>`).join('');
    const hl =
      sel?.t === 'a' && m.areas?.[sel.i]
        ? `<path class="mm-hl" d="${path(m.areas[sel.i].pts)}Z" fill="none" stroke="#ff2d55" stroke-width="${6 * k}" stroke-dasharray="${18 * k} ${10 * k}" pointer-events="none"/>`
        : sel?.t === 'r' && m.roads[sel.i]
          ? `<path class="mm-hl" d="${path(m.roads[sel.i].pts)}" fill="none" stroke="#ff2d55" stroke-width="${Math.max(rw(sel.i) * 0.45, 6)}" stroke-dasharray="${18 * k} ${10 * k}" stroke-linecap="round" pointer-events="none"/>`
          : '';
    return `<svg class="mm-hit" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${areas}${roads}${hl}</svg>`;
  };
  const draw = () => {
    stage.dataset.view = view;
    if (view === 'map') stage.innerHTML = `<div class="mm-map">${miniSvg(m, { id: 'mmst' })}${hitSvg()}</div>`;
    else stage.innerHTML = `<div class="mm-frame"><div class="mm-place" style="${miniPos(m)}">${miniSvg(m, { id: 'mmst' })}</div></div>`;
    const warn = miniLayout(m).warnings;
    $('#mmNote').innerHTML = warn.length ? `⚠ ${warn.map(esc).join('；')}` : view === 'map' ? '點地圖上的區塊或道路來修改；顏色在右邊配色表統一調整。' : '這是放進 16:9 影片時的實際位置與大小（背景為示意）。';
  };

  /* ───────── 選取面板 ───────── */
  const colorRow = (label: string, val: string | undefined, id: string) =>
    val
      ? `<label class="mm-row">${label}<input type="color" id="${id}" value="${val}"><button type="button" class="btn-ghost" data-clear="${id}">跟配色表</button></label>`
      : `<div class="mm-row">${label}<span class="mm-dim">跟配色表</span><button type="button" class="btn-ghost" data-own="${id}">單獨設色</button></div>`;
  const renderSel = () => {
    const box = $('#mmSel');
    if (sel?.t === 'a' && m.areas?.[sel.i]) {
      const a = m.areas[sel.i];
      box.innerHTML = `<p class="mm-what">區塊 ${sel.i + 1}</p>
<label class="mm-row">用途<select id="mmKind" class="st-select">${[...MINI_KINDS, 'custom'].map((x) => `<option value="${x}"${x === a.kind ? ' selected' : ''}>${x === 'custom' ? '自訂（不進圖例）' : KIND_NAME[x as MiniKind]}</option>`).join('')}</select></label>
${colorRow('顏色', a.color, 'mmOwn')}
<button type="button" class="btn-ghost" id="mmDel">刪除這個區塊</button>`;
    } else if (sel?.t === 'r' && m.roads[sel.i]) {
      const r = m.roads[sel.i], c = roadCls(r);
      box.innerHTML = `<p class="mm-what">道路 ${sel.i + 1}</p>
<label class="mm-row">等級<select id="mmCls" class="st-select">${ROAD_CLS.map((x) => `<option value="${x}"${x === c ? ' selected' : ''}>${ROAD_NAME[x]}</option>`).join('')}</select></label>
<label class="mm-row">路名<input type="text" id="mmName" maxlength="16" value="${esc(r.name ?? '')}" ${c === 'lane' ? 'disabled placeholder="巷道不放路名"' : 'placeholder="不填就不顯示"'}></label>
${colorRow('顏色', r.color, 'mmOwn')}
<button type="button" class="btn-ghost" id="mmDel">刪除這條路</button>`;
    } else box.innerHTML = '<p class="mm-dim">點地圖上的區塊或道路。</p>';
  };
  $('#mmSel').addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (!sel) return;
    if (t.id === 'mmKind' && sel.t === 'a') {
      const a = m.areas![sel.i];
      a.kind = t.value as MiniKind | 'custom';
      if (a.kind === 'custom' && !a.color) a.color = paletteOf(m).other;
    }
    if (t.id === 'mmCls' && sel.t === 'r') {
      const r = m.roads[sel.i];
      r.w = t.value as RoadCls;
      delete r.dash;
      if (r.w === 'lane') delete r.name;
    }
    if (t.id === 'mmName' && sel.t === 'r') m.roads[sel.i].name = t.value.trim() || undefined;
    changed(true);
  });
  $('#mmSel').addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.id !== 'mmOwn' || !sel) return;
    (sel.t === 'a' ? m.areas![sel.i] : m.roads[sel.i]).color = t.value;
    changed(false);
  });
  $('#mmSel').addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (!sel) return;
    const it = sel.t === 'a' ? m.areas![sel.i] : m.roads[sel.i];
    if (t.dataset.clear) {
      if (sel.t === 'a' && (it as { kind: string }).kind === 'custom') return deps.toast('自訂區塊一定要有顏色，先把用途改成其他種類');
      delete it.color;
      changed(true);
    } else if (t.dataset.own) {
      it.color = sel.t === 'a' ? paletteOf(m)[(it as { kind: MiniKind }).kind] ?? '#cccccc' : paletteOf(m)[roadCls(it as MiniMap['roads'][number])];
      changed(true);
    } else if (t.id === 'mmDel') {
      if (sel.t === 'a') m.areas!.splice(sel.i, 1);
      else if (m.roads.length > 1) m.roads.splice(sel.i, 1);
      else return deps.toast('至少要留一條路');
      sel = null;
      changed(true);
    }
  });

  /* ───────── 版面與配色表 ───────── */
  const renderLayout = () => {
    $<HTMLSelectElement>('#mmPlace').value = typeof m.place === 'string' ? m.place : 'custom';
    $<HTMLSelectElement>('#mmStyle').value = m.style === 'flat' ? 'flat' : 'outline';
    $<HTMLInputElement>('#mmLegend').checked = !!m.legend;
    $<HTMLInputElement>('#mmLegendRow').checked = !!m.legend_row;
    $<HTMLInputElement>('#mmNorth').checked = m.north !== undefined;
    $<HTMLInputElement>('#mmNorthDeg').value = String(m.north ?? 0);
    $<HTMLInputElement>('#mmNorthDeg').disabled = m.north === undefined;
    $('#mmNorthVal').textContent = m.north === undefined ? '' : `${Math.round(m.north)}°`;
  };
  const renderPal = () => {
    const P = paletteOf(m), used = new Set((m.areas ?? []).map((a) => a.kind));
    const row = (key: MiniKind | RoadCls, name: string, on: boolean) =>
      `<label class="mm-row${on ? '' : ' mm-off'}">${name}<input type="color" data-pal="${key}" value="${P[key]}">${m.palette?.[key] ? `<button type="button" class="btn-ghost" data-reset="${key}">預設</button>` : '<span></span>'}</label>`;
    const kinds = [...MINI_KINDS].sort((a, b) => Number(used.has(b)) - Number(used.has(a)));
    $('#mmPal').innerHTML =
      `<p class="mm-sub">區塊用途（灰字＝圖上目前沒有）</p>${kinds.map((x) => row(x, KIND_NAME[x], used.has(x))).join('')}` +
      `<p class="mm-sub">道路</p>${ROAD_CLS.map((x) => row(x, ROAD_NAME[x], m.roads.some((r) => roadCls(r) === x))).join('')}`;
  };
  $('#mmPal').addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement, key = t.dataset.pal as MiniKind | RoadCls | undefined;
    if (!key) return;
    const def = MINI_PALETTES[m.style === 'flat' ? 'flat' : 'outline'][key];
    m.palette = { ...(m.palette ?? {}), [key]: t.value };
    if (t.value.toLowerCase() === def.toLowerCase()) delete m.palette[key];
    changed(false);
  });
  $('#mmPal').addEventListener('change', () => renderPal());
  $('#mmPal').addEventListener('click', (e) => {
    const key = (e.target as HTMLElement).dataset.reset as MiniKind | RoadCls | undefined;
    if (!key || !m.palette) return;
    delete m.palette[key];
    changed(true);
  });
  $('#mmPalReset').addEventListener('click', () => {
    delete m.palette;
    changed(true);
  });
  dlg.querySelector('#mmLayout')!.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.id === 'mmPlace') {
      if (t.value === 'custom') return;
      m.place = t.value as 'tr' | 'duo' | 'full';
    }
    if (t.id === 'mmStyle') m.style = t.value === 'flat' ? 'flat' : undefined;
    if (t.id === 'mmLegend') m.legend = t.checked || undefined;
    if (t.id === 'mmLegendRow') {
      m.legend_row = t.checked || undefined;
      // 換排法時位置交給預設
      delete m.legend_at;
    }
    if (t.id === 'mmNorth') m.north = t.checked ? 0 : undefined;
    changed(true);
  });
  $('#mmNorthDeg').addEventListener('input', (e) => {
    m.north = Number((e.target as HTMLInputElement).value);
    $('#mmNorthVal').textContent = `${Math.round(m.north)}°`;
    changed(false);
  });

  /* ───────── 進階：JSON ───────── */
  $('#mmJsonApply').addEventListener('click', () => {
    try {
      const r = normalizeMini(JSON.parse($<HTMLTextAreaElement>('#mmJson').value));
      if (r.errors.length) return deps.toast(r.errors[0]);
      load(r.map);
      deps.toast('已套用');
    } catch {
      deps.toast('JSON 格式不對');
    }
  });

  /* ───────── 點選 ───────── */
  stage.addEventListener('click', (e) => {
    if (view !== 'map') return;
    const t = (e.target as Element).closest('[data-a],[data-r]') as SVGElement | null;
    sel = t ? (t.dataset.a !== undefined ? { t: 'a', i: +t.dataset.a } : { t: 'r', i: +t.dataset.r! }) : null;
    renderSel();
    draw();
  });
  $('#mmView').addEventListener('click', (e) => {
    const v = (e.target as HTMLElement).closest<HTMLElement>('[data-v]')?.dataset.v;
    if (v !== 'map' && v !== 'video') return;
    view = v;
    $('#mmView').querySelectorAll<HTMLElement>('[data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === view)));
    draw();
  });

  const changed = (full: boolean) => {
    persist();
    draw();
    if (full) {
      renderSel();
      renderLayout();
      renderPal();
    }
    $<HTMLTextAreaElement>('#mmJson').value = JSON.stringify(m);
  };

  /* ───────── 輸出 ───────── */
  $('#mmCombo').addEventListener('click', () => {
    deps.addScene({ effect: 'minimap', words: [JSON.stringify(m)], seconds: 6, ratio: '16:9' });
    deps.toast('已加入 Combo');
  });
  const fileName = () => (m.title || 'minimap').replace(/[\\/:*?"<>|\s]+/g, '-');
  $('#mmSvg').addEventListener('click', () => saveBlob(new Blob([miniSvg(m)], { type: 'image/svg+xml' }), `${fileName()}-${stamp()}.svg`));
  $('#mmPng').addEventListener('click', async () => {
    const W = m.w ?? 1410, H = m.h ?? 1128, img = new Image();
    img.src = URL.createObjectURL(new Blob([miniSvg(m)], { type: 'image/svg+xml' }));
    await img.decode();
    const c = canvasOf(W, H);
    c.getContext('2d')!.drawImage(img, 0, 0, W, H);
    URL.revokeObjectURL(img.src);
    c.toBlob((b) => b && saveBlob(b, `${fileName()}-${stamp()}.png`), 'image/png');
  });

  /* ───────── 開關 ───────── */
  const load = (data: unknown) => {
    const r = normalizeMini(data);
    m = r.errors.length ? clone(MINI_SAMPLE) : r.map;
    sel = null;
    open();
  };
  const open = () => {
    if (!dlg.open) dlg.showModal();
    document.body.style.overflow = 'hidden';
    changed(true);
  };
  dlg.addEventListener('close', () => {
    document.body.style.overflow = '';
    const u = new URL(location.href);
    if (u.searchParams.get('view') === 'minimap') {
      u.searchParams.delete('view');
      history.replaceState({}, '', u.pathname + u.search);
    }
  });
  $('#mmClose').addEventListener('click', () => dlg.close());
  if (new URLSearchParams(location.search).get('view') === 'minimap') open();
  return {
    /** 從卡片打開：帶入卡片目前的文字 */
    open: (words?: string[]) => {
      bar.set();
      load(words?.length ? miniFromWords(words) : m);
    },
    loadPreset: (p: Pick<Preset, 'id' | 'name' | 'data'>) => {
      bar.set(p);
      load(p.data);
    },
    load: (data: unknown) => {
      bar.set();
      load(data);
    },
  };
};
