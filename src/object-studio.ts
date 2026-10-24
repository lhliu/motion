import { pngSequence, recordWebm, saveBlob, stamp, canvasOf } from './export-kit';
import { drawObj } from './render/obj';
import { defaultObjScene, METEOR_COLORS, OCEAN_PRESETS, objSceneFxId, objFields, OBJECT_COSMOS_GROUPS, normalizeObjScene, OBJ_DEFAULTS, OBJ_INFO, OBJ_MODULES, type OModule, type OScene } from './objkit';
import type { PField } from './photokit';
import { esc } from './util';
import { FONT_PACKS, preloadFonts } from './fonts';
import { presetBar } from './preset-bar';
import type { Preset } from './presets';

export interface ObjectStudioDeps {
  toast: (msg: string) => void;
  copy: (text: string, msg: string) => Promise<void>;
  addScene: (s: { effect: string; words: string[]; seconds?: number; font?: string; ratio?: OScene['ratio'] }) => void;
  store: { get<T>(k: string, d: T): T; set(k: string, v: unknown): void };
}

const RATIO_PX: Record<OScene['ratio'], [number, number]> = { '9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080] };

export const initObjectStudio = (deps: ObjectStudioDeps) => {
  const dlg = document.querySelector<HTMLDialogElement>('#objstudio')!;
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => dlg.querySelector<T>(s)!;
  const cv = $<HTMLCanvasElement>('#osCanvas');
  const stage = $('#osStage');
  const ctx = cv.getContext('2d')!;
  let sc: OScene = normalizeObjScene(deps.store.get<Partial<OScene>>('objscene', { ...defaultObjScene('cube'), text: { ...defaultObjScene('cube').text, lines: ['重磅登場'] } }));
  if(['ocean','vehicle','meteor','aerial'].includes(sc.module))sc=defaultObjScene('cube');
  const memo: Partial<Record<OModule, Record<string, number | string>>> = deps.store.get('objmemo', {});
  let playing = false;
  let t0 = 0;
  let raf = 0;
  let tView = 2.5;
  let handles: Record<string, number[]> = {};
  const persist = () => {
    memo[sc.module] = { ...sc.params };
    deps.store.set('objscene', sc);
    deps.store.set('objmemo', memo);
  };

  /* ───────── 繪製 ───────── */
  const size = () => {
    stage.dataset.ratio = sc.ratio;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
    cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
  };
  const k = () => cv.width / Math.max(1, cv.clientWidth);
  const redraw = (t?: number) => {
    handles = drawObj(ctx, cv.width, cv.height, sc, t ?? tView);
    if (t !== undefined || playing) return;
    const u = k();
    for (const [x, y] of Object.values(handles)) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3 * u;
      ctx.beginPath();
      ctx.arc(x, y, 9 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  };
  const loop = (now: number) => {
    if (!playing) return;
    const t = (now - t0) / 1000;
    redraw(t);
    timeEl.value = String(Math.min(sc.loop, t));
    if (t > sc.loop) {
      playing = false;
      playBtn.textContent = '▶ 播放';
      redraw();
      return;
    }
    raf = requestAnimationFrame(loop);
  };
  const playBtn = $('#osPlay');
  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.textContent = playing ? '■ 停止' : '▶ 播放';
    if (playing) {
      t0 = performance.now();
      raf = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(raf);
      redraw();
    }
  });
  const timeEl = $<HTMLInputElement>('#osTime');
  timeEl.addEventListener('input', () => {
    tView = parseFloat(timeEl.value);
    redraw();
  });

  /* ───────── 拖曳：物件位置 ───────── */
  let drag = false;
  const toCanvas = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * cv.width, ((e.clientY - r.top) / r.height) * cv.height];
  };
  cv.addEventListener('pointerdown', (e) => {
    if (playing) return;
    const [px, py] = toCanvas(e);
    const h = handles.card;
    if (h && Math.hypot(h[0] - px, h[1] - py) < 40 * k()) {
      drag = true;
      cv.setPointerCapture(e.pointerId);
    }
  });
  cv.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const [px, py] = toCanvas(e);
    sc.params.x = Math.round(Math.max(0, Math.min(1, px / cv.width)) * 1000) / 1000;
    sc.params.y = Math.round(Math.max(0, Math.min(1, py / cv.height)) * 1000) / 1000;
    redraw();
  });
  const endDrag = () => {
    if (!drag) return;
    drag = false;
    persist();
  };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);

  /* ───────── 模組、參數、文字 ───────── */
  // 每種物件各自一個編輯器：不放模組切換，標題與說明跟著目前物件
  const syncMod = () => {
    const info = sc.module === 'cosmos' && sc.cosmosGroup ? OBJECT_COSMOS_GROUPS[sc.cosmosGroup] : OBJ_INFO[sc.module];
    $('#osTitle').textContent = `${info.zh}・編輯器`;
    $('#osDesc').textContent = info.desc;
  };

  const field = (f: PField, v: unknown) => {
    if (f.type === 'range')
      return `<label class="st-row"><span>${f.label}</span><input type="range" data-k="${f.k}" min="${f.min}" max="${f.max}" step="${f.step}" value="${v ?? f.min}"><output>${v ?? ''}</output></label>`;
    if (f.type === 'text') return `<label class="st-row"><span>${f.label}</span><input type="text" data-k="${f.k}" value="${esc(String(v ?? ''))}"></label>`;
    if (f.type === 'seg')
      return `<div class="st-row"><span>${f.label}</span><div class="seg st-seg" data-k="${f.k}">${f.opts.map(([val, l]) => `<button type="button" data-v="${val}" aria-pressed="${String(v) === val}">${l}</button>`).join('')}</div></div>`;
    return `<label class="st-row"><span>${f.label}</span><input type="color" data-k="${f.k}" value="${String(v ?? '#ffffff').slice(0, 7)}"></label>`;
  };
  const paramsEl = $('#osParams');
  const renderParams = () => {
    const fields = objFields(sc).filter((f) => {
      if (sc.module !== 'ocean') return true;
      const mode = String(sc.params.mode);
      if (f.k === 'scene') return mode !== 'deep';
      if (['strike', 'mouth', 'exit', 'shake'].includes(f.k)) return mode === 'shark';
      if (f.k === 'beam') return mode === 'submarine';
      if (f.k === 'count') return ['fish', 'dolphins', 'coral'].includes(mode);
      if (f.k === 'route') return ['fish', 'dolphins'].includes(mode);
      if (f.k === 'direction') return !['deep', 'coral'].includes(mode);
      if (['size', 'color', 'color2'].includes(f.k)) return mode !== 'deep';
      return true;
    });
    const hint = sc.module === 'ocean' ? '拖藍點移動主角。勾選透明背景、關閉海底場景，可輸出去背素材；深海下潛為全景動畫。' : '拖預覽上的藍色圓點可移動物件。';
    paramsEl.innerHTML = `<p class="ms-hint">${hint}</p>` + fields.map((f) => field(f, sc.params[f.k])).join('');
  };
  const onField = (host: HTMLElement, target: () => Record<string, unknown>, after: (key: string) => void) => {
    host.addEventListener('input', (e) => {
      const t = e.target as HTMLInputElement | HTMLTextAreaElement;
      const key = t.dataset.k;
      if (!key) return;
      if (t.dataset.lines !== undefined) target()[key] = t.value.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 4);
      else target()[key] = t.type === 'range' ? parseFloat(t.value) : t.value;
      const out = t.parentElement?.querySelector('output');
      if (out) out.textContent = t.value;
      persist();
      redraw();
    });
    host.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.st-seg button');
      if (!b) return;
      const key = b.closest<HTMLElement>('.st-seg')!.dataset.k!;
      target()[key] = /^\d+$/.test(b.dataset.v!) ? Number(b.dataset.v) : b.dataset.v;
      after(key);
      persist();
      redraw();
    });
  };
  onField(paramsEl, () => sc.params, (key) => {
    // 換隕石材質時，顏色一起換成該材質的預設
    if (sc.module === 'meteor' && key === 'material') [sc.params.color, sc.params.color2] = METEOR_COLORS[String(sc.params.material)] ?? METEOR_COLORS.rock;
    if (sc.module === 'ocean' && key === 'mode') Object.assign(sc.params, OCEAN_PRESETS[String(sc.params.mode)]);
    renderParams();
  });

  const textEl = $('#osText');
  const TEXT_FIELDS: PField[] = [
    { k: 'layout', label: '位置', type: 'seg', opts: [['below', '物件下方'], ['over', '疊在物件上'], ['above', '物件上方'], ['none', '不顯示']] },
    { k: 'color', label: '文字色', type: 'color' },
    { k: 'size', label: '大小', type: 'range', min: 0.3, max: 3, step: 0.05 },
    { k: 'strokeW', label: '描邊粗細', type: 'range', min: 0, max: 30, step: 1 },
    { k: 'stroke', label: '描邊色', type: 'color' },
    { k: 'delay', label: '出現時間（秒）', type: 'range', min: 0, max: 6, step: 0.1 },
  ];
  const renderText = () => {
    textEl.innerHTML = `<label class="ms-col"><span>文字（一行一句，~ 開頭為英文小字，最多 4 行）</span><textarea data-k="lines" data-lines rows="3">${esc(sc.text.lines.join('\n'))}</textarea></label>${TEXT_FIELDS.map((f) => field(f, sc.text[f.k as keyof OScene['text']])).join('')}`;
  };
  onField(textEl, () => sc.text as unknown as Record<string, unknown>, () => renderText());

  /* ───────── 背景、字型、比例、長度 ───────── */
  const bgC = $<HTMLInputElement>('#osBgC');
  const trans = $<HTMLInputElement>('#osTrans');
  const syncBg = () => {
    trans.checked = sc.bg === 'transparent';
    if (sc.bg !== 'transparent') bgC.value = sc.bg.split(',')[0].slice(0, 7);
  };
  bgC.addEventListener('input', () => {
    sc.bg = bgC.value;
    trans.checked = false;
    persist();
    redraw();
  });
  trans.addEventListener('change', () => {
    sc.bg = trans.checked ? 'transparent' : bgC.value;
    persist();
    redraw();
  });
  const fontSel = $<HTMLSelectElement>('#osFont');
  fontSel.innerHTML = FONT_PACKS.map((f) => `<option value="${f.id}">${f.zh}　${esc(f.use)}</option>`).join('');
  fontSel.addEventListener('change', async () => {
    if (fontSel.value === 'sharp') delete sc.font;
    else sc.font = fontSel.value;
    persist();
    await preloadFonts(sc.text.lines.join(''), fontSel.value);
    redraw();
  });
  $('#osRatio').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b) return;
    sc.ratio = b.dataset.v as OScene['ratio'];
    persist();
    syncRatio();
    requestAnimationFrame(() => {
      size();
      redraw();
    });
  });
  const syncRatio = () => $('#osRatio').querySelectorAll<HTMLElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === sc.ratio)));
  const loopEl = $<HTMLInputElement>('#osLoop');
  loopEl.addEventListener('input', () => {
    sc.loop = parseFloat(loopEl.value);
    $('#osLoopV').textContent = `${sc.loop}s`;
    timeEl.max = String(sc.loop);
    tView = Math.min(tView, sc.loop);
    timeEl.value = String(tView);
    persist();
    redraw();
  });

  /* ───────── 輸出 ───────── */
  const status = $('#osStatus');
  const busy = (m: string) => {
    status.hidden = !m;
    status.textContent = m;
  };
  const fonts = () => sc.text.layout === 'none' || !sc.text.lines.length ? Promise.resolve() : preloadFonts(sc.text.lines.join(''), sc.font);
  const drawAt = (c: CanvasRenderingContext2D, W: number, H: number, t: number) => drawObj(c, W, H, sc, t);
  $('#osPng').addEventListener('click', async () => {
    await fonts();
    const [W, H] = RATIO_PX[sc.ratio];
    const c = canvasOf(W, H);
    drawAt(c.getContext('2d')!, W, H, tView);
    c.toBlob((b) => b && saveBlob(b, `object-${sc.module}-${stamp()}.png`), 'image/png');
    deps.toast('已輸出目前時間點的 PNG');
  });
  $('#osSeq').addEventListener('click', async () => {
    await fonts();
    const [W, H] = RATIO_PX[sc.ratio];
    const blob = await pngSequence(W, H, sc.loop, (c, t) => drawAt(c, W, H, t), (i, n) => busy(`輸出 PNG 序列⋯ ${i}/${n}`));
    saveBlob(blob, `object-${sc.module}-${stamp()}-30fps.zip`);
    busy('');
    deps.toast('已輸出 PNG 序列');
  });
  $('#osWebm').addEventListener('click', async () => {
    await fonts();
    const [W, H] = RATIO_PX[sc.ratio];
    const p = recordWebm(W, H, sc.loop, (c, t) => drawAt(c, W, H, t), (x) => busy(`錄製中⋯ ${Math.round(x * 100)}%`));
    if (!p) return deps.toast('這個瀏覽器不支援錄製 WebM，請改用 Chrome 或輸出 PNG 序列');
    saveBlob(await p, `object-${sc.module}-${stamp()}.webm`);
    busy('');
    deps.toast('已輸出 WebM');
  });
  $('#osCombo').addEventListener('click', () => {
    deps.addScene({ effect: objSceneFxId(sc), words: [JSON.stringify(sc)], seconds: sc.loop, ratio: sc.ratio, ...(sc.font ? { font: sc.font } : {}) });
  });
  $('#osJson').addEventListener('click', () => deps.copy(JSON.stringify(sc), '已複製設定 JSON，可貼給 AI 修改'));

  /* ───────── 預設 ───────── */
  const applyScene = (scene: Partial<OScene>) => {
    sc = normalizeObjScene(scene);
    persist();
    open();
  };
  const bar = presetBar($('#osPreset'), {
    kind: 'object',
    getData: () => sc,
    onLoad: (p) => applyScene(p.data as OScene),
    toast: deps.toast,
    copy: deps.copy,
    store: deps.store,
  });

  /* ───────── 開關 ───────── */
  const ro = new ResizeObserver(() => {
    size();
    redraw();
  });
  const renderAll = () => {
    tView = Math.min(tView, sc.loop);
    syncMod();
    syncRatio();
    syncBg();
    fontSel.value = sc.font ?? 'sharp';
    loopEl.value = String(sc.loop);
    $('#osLoopV').textContent = `${sc.loop}s`;
    timeEl.max = String(sc.loop);
    timeEl.value = String(tView);
    renderParams();
    renderText();
    requestAnimationFrame(() => {
      size();
      redraw();
    });
  };
  const open = () => {
    if (!dlg.open) dlg.showModal();
    document.body.style.overflow = 'hidden';
    ro.observe(stage);
    renderAll();
    fonts().then(() => redraw());
  };
  dlg.addEventListener('close', () => {
    ro.disconnect();
    playing = false;
    cancelAnimationFrame(raf);
    document.body.style.overflow = '';
    const u = new URL(location.href);
    if (u.searchParams.get('view') === 'object' || u.searchParams.has('edit')) {
      u.searchParams.delete('view');
      u.searchParams.delete('edit');
      u.searchParams.delete('d');
      history.replaceState({}, '', u.pathname + u.search);
    }
  });
  $('#osClose').addEventListener('click', () => dlg.close());
  if (new URLSearchParams(location.search).get('view') === 'object') open();
  return {
    open: (module?: OModule, preset?: Partial<OScene>) => {
      if (preset) sc = normalizeObjScene(preset, module);
      else if (module && module !== sc.module) {
        memo[sc.module] = { ...sc.params };
        const base = defaultObjScene(module);
        sc = { ...sc, module, loop: base.loop, bg: base.bg, params: { ...OBJ_DEFAULTS[module], ...(memo[module] ?? {}) }, text: { ...sc.text, layout: base.text.layout } };
      }
      persist();
      open();
    },
    load: (scene: Partial<OScene>) => {
      bar.set();
      applyScene(scene);
    },
    loadPreset: (p: Pick<Preset, 'id' | 'name' | 'data'>) => {
      bar.set(p);
      applyScene(p.data as OScene);
    },
  };
};
