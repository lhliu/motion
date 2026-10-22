import { pngSequence, recordWebm, saveBlob, stamp, canvasOf } from './export-kit';
import { drawScene, makeEl, RATIO_PX, sceneLength, syncRoutes, TEMPLATES, TYPE_NAME, type MEl, type MScene, type MType } from './mapkit';
import { esc } from './util';
import { presetBar } from './preset-bar';
import type { Preset } from './presets';

export interface MapStudioDeps {
  toast: (msg: string) => void;
  copy: (text: string, msg: string) => Promise<void>;
  addScene: (s: { effect: string; words: string[]; seconds?: number; ratio?: MScene['ratio'] }) => void;
  store: { get<T>(k: string, d: T): T; set(k: string, v: unknown): void };
}

export const initMapStudio = (deps: MapStudioDeps) => {
  const dlg = document.querySelector<HTMLDialogElement>('#mapstudio')!;
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => dlg.querySelector<T>(s)!;
  const cv = $<HTMLCanvasElement>('#msCanvas');
  const stage = $('#msStage');
  const ctx = cv.getContext('2d')!;
  let sc: MScene = deps.store.get<MScene | null>('mapscene', null) ?? TEMPLATES[0].scene();
  let bg: (HTMLImageElement & { width: number; height: number }) | undefined;
  let sel: string | null = null;
  let playing = false;
  let t0 = 0;
  let raf = 0;
  let boxes = new Map<string, number[]>();
  let withBg = true;

  const persist = () => deps.store.set('mapscene', sc);
  // 底圖存在瀏覽器（太大就略過）
  const savedBg = deps.store.get<string>('mapbg', '');
  if (savedBg) loadBg(savedBg);
  function loadBg(src: string) {
    const img = new Image();
    img.onload = () => {
      bg = img;
      redraw();
    };
    img.src = src;
  }

  /* ───────── 繪製 ───────── */
  const size = () => {
    stage.dataset.ratio = sc.ratio;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
    cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
  };
  const redraw = (t = 99) => {
    boxes = drawScene(ctx, cv.width, cv.height, sc, t, bg);
    if (!playing && sel) {
      const b = boxes.get(sel);
      const el = sc.els.find((e) => e.id === sel);
      if (b) {
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2 * (cv.width / cv.clientWidth);
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(b[0] - 6, b[1] - 6, b[2] - b[0] + 12, b[3] - b[1] + 12);
        ctx.setLineDash([]);
        if (el?.type === 'site' || el?.type === 'routes')
          [...(el.pts ?? []), ...(el.type === 'routes' ? [[el.x, el.y]] : [])].forEach(([x, y]) => {
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(x * cv.width, y * cv.height, 9 * (cv.width / cv.clientWidth), 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
        ctx.restore();
      }
    }
  };
  const loop = (now: number) => {
    if (!playing) return;
    const t = (now - t0) / 1000;
    redraw(t);
    if (t > sceneLength(sc)) {
      playing = false;
      playBtn.textContent = '▶ 播放進場';
      redraw();
      return;
    }
    raf = requestAnimationFrame(loop);
  };
  const playBtn = $('#msPlay');
  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.textContent = playing ? '■ 停止' : '▶ 播放進場';
    if (playing) {
      t0 = performance.now();
      raf = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(raf);
      redraw();
    }
  });

  /* ───────── 拖曳 ───────── */
  let drag: { id: string; corner: number; sx: number; sy: number; ox: number; oy: number; pts?: number[][] } | null = null;
  const toCanvas = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * cv.width, ((e.clientY - r.top) / r.height) * cv.height];
  };
  cv.addEventListener('pointerdown', (e) => {
    if (playing) return;
    const [px, py] = toCanvas(e);
    const k = cv.width / cv.clientWidth;
    // 先找基地框的角
    const cur = sc.els.find((x) => x.id === sel);
    if ((cur?.type === 'site' || cur?.type === 'routes') && cur.pts) {
      const ci = cur.pts.findIndex(([x, y]) => Math.hypot(x * cv.width - px, y * cv.height - py) < 16 * k);
      if (ci >= 0) {
        drag = { id: cur.id, corner: ci, sx: px, sy: py, ox: 0, oy: 0 };
        cv.setPointerCapture(e.pointerId);
        return;
      }
      // 放射路線：拖起點只移動起點，目的地不動
      if (cur.type === 'routes' && Math.hypot(cur.x * cv.width - px, cur.y * cv.height - py) < 22 * k) {
        drag = { id: cur.id, corner: -2, sx: px, sy: py, ox: cur.x, oy: cur.y };
        cv.setPointerCapture(e.pointerId);
        return;
      }
    }
    const hit = [...sc.els].reverse().find((el) => {
      const b = boxes.get(el.id);
      return b && px >= b[0] - 8 && px <= b[2] + 8 && py >= b[1] - 8 && py <= b[3] + 8;
    });
    sel = hit?.id ?? null;
    if (hit) {
      drag = { id: hit.id, corner: -1, sx: px, sy: py, ox: hit.x, oy: hit.y, pts: hit.pts?.map((p) => [...p]) };
      cv.setPointerCapture(e.pointerId);
    }
    renderList();
    renderProps();
    redraw();
  });
  cv.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const [px, py] = toCanvas(e);
    const el = sc.els.find((x) => x.id === drag!.id);
    if (!el) return;
    const dx = (px - drag.sx) / cv.width;
    const dy = (py - drag.sy) / cv.height;
    if (drag.corner >= 0 && el.pts) el.pts[drag.corner] = [px / cv.width, py / cv.height];
    else if (drag.corner === -2) {
      el.x = drag.ox + dx;
      el.y = drag.oy + dy;
    } else if (el.type === 'site' && drag.pts) el.pts = drag.pts.map(([x, y]) => [x + dx, y + dy]);
    else if (el.type === 'routes' && drag.pts) {
      // 拖整組：起點與目的地一起移動
      el.x = drag.ox + dx;
      el.y = drag.oy + dy;
      el.pts = drag.pts.map(([x, y]) => [x + dx, y + dy]);
    } else {
      el.x = drag.ox + dx;
      el.y = drag.oy + dy;
    }
    redraw();
  });
  const endDrag = () => {
    if (drag) persist();
    drag = null;
  };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);

  /* ───────── 元素清單與屬性 ───────── */
  const list = $('#msList');
  const props = $('#msProps');
  const renderList = () => {
    list.innerHTML = sc.els
      .map(
        (el, i) =>
          `<li class="${el.id === sel ? 'on' : ''}" data-id="${el.id}"><button type="button" class="ms-pick"><b>${TYPE_NAME[el.type]}</b><span>${esc(el.text ?? el.lines?.[0]?.replace(/^\*/, '') ?? '')}</span><small>${el.delay}s</small></button><span class="ms-ops"><button type="button" class="ic" data-op="up" aria-label="往下層"${i === 0 ? ' disabled' : ''}>↑</button><button type="button" class="ic" data-op="down" aria-label="往上層"${i === sc.els.length - 1 ? ' disabled' : ''}>↓</button><button type="button" class="ic" data-op="dup" aria-label="複製">⧉</button><button type="button" class="ic" data-op="del" aria-label="刪除">✕</button></span></li>`,
      )
      .join('');
  };
  list.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('li');
    if (!li) return;
    const i = sc.els.findIndex((x) => x.id === li.dataset.id);
    const op = (e.target as HTMLElement).closest<HTMLElement>('[data-op]')?.dataset.op;
    if (op === 'up' && i > 0) [sc.els[i - 1], sc.els[i]] = [sc.els[i], sc.els[i - 1]];
    else if (op === 'down' && i < sc.els.length - 1) [sc.els[i + 1], sc.els[i]] = [sc.els[i], sc.els[i + 1]];
    else if (op === 'dup') {
      const c = structuredClone(sc.els[i]);
      c.id = makeEl(c.type).id;
      c.x += 0.03;
      c.y += 0.03;
      if (c.pts) c.pts = c.pts.map(([x, y]) => [x + 0.03, y + 0.03]);
      sc.els.splice(i + 1, 0, c);
      sel = c.id;
    } else if (op === 'del') {
      sc.els.splice(i, 1);
      if (sel === li.dataset.id) sel = null;
    } else sel = li.dataset.id!;
    persist();
    renderList();
    renderProps();
    redraw();
  });

  type Field = [keyof MEl, string, 'text' | 'area' | 'lines' | 'color' | 'range' | 'check' | 'seg', ...unknown[]];
  const FIELDS: Record<MType, Field[]> = {
    tag: [['text', '文字', 'text'], ['color', '底色', 'color'], ['fg', '文字色', 'color'], ['alpha', '底色透明度', 'range', 0.2, 1, 0.01]],
    road: [['text', '路名', 'text'], ['vertical', '直排', 'check'], ['variant', '樣式', 'seg', [['dark', '深底白字'], ['light', '白底黑字']]]],
    site: [['color', '框線顏色', 'color'], ['alpha', '填色透明度', 'range', 0, 0.8, 0.01]],
    label: [['text', '文字', 'text'], ['color', '底色', 'color'], ['fg', '文字色', 'color']],
    pin: [['color', '顏色', 'color']],
    badge: [['text', '文字（例如 A棟）', 'text'], ['color', '底色', 'color'], ['fg', '文字色', 'color']],
    bar: [['text', '內容（| 分欄，* 開頭用強調色）', 'text'], ['color', '強調色', 'color'], ['alpha', '底色透明度', 'range', 0.3, 1, 0.01]],
    info: [['lines', '內容（一行一句，* 開頭用強調色）', 'lines'], ['color', '強調色', 'color'], ['alpha', '底色透明度', 'range', 0.3, 1, 0.01]],
    stat: [['text', '標題', 'text'], ['fg', '副標', 'text'], ['lines', '欄位（標籤|數字|單位|附註）', 'lines'], ['color', '數字顏色', 'color'], ['alpha', '底色透明度', 'range', 0.3, 1, 0.01]],
    compass: [],
    text: [['text', '文字（可多行）', 'area'], ['color', '文字色', 'color'], ['vertical', '黑色描邊', 'check'], ['fg', '描邊色', 'color']],
    routes: [
      ['text', '起點名稱（留空＝只有圓點）', 'text'],
      ['lines', '目的地，一行一個：名稱|附註|#色碼（附註與色碼可省略）', 'lines'],
      ['multi', '每條不同顏色', 'check'],
      ['color', '起點與單色路線顏色', 'color'],
      ['curve', '彎曲程度', 'range', -0.5, 0.5, 0.01],
      ['dash', '虛線流動', 'check'],
    ],
  };
  const renderProps = () => {
    const el = sc.els.find((x) => x.id === sel);
    if (!el) {
      props.innerHTML = '<p class="ms-hint">點預覽畫面上的元件或清單來編輯；拖曳可移動，基地框選取後可拖四個角；放射路線選取後可分別拖起點與每個目的地。</p>';
      return;
    }
    const f = (fd: Field) => {
      const [k, label, type, ...rest] = fd;
      const v = el[k] as unknown;
      if (type === 'text') return `<label class="st-row"><span>${label}</span><input type="text" data-k="${k}" value="${esc(String(v ?? ''))}"></label>`;
      if (type === 'area') return `<label class="ms-col"><span>${label}</span><textarea data-k="${k}" rows="2">${esc(String(v ?? ''))}</textarea></label>`;
      if (type === 'lines') return `<label class="ms-col"><span>${label}</span><textarea data-k="${k}" data-lines rows="3">${esc(((v as string[]) ?? []).join('\n'))}</textarea></label>`;
      if (type === 'color') return `<label class="st-row"><span>${label}</span><input type="color" data-k="${k}" value="${String(v ?? '#ffffff').slice(0, 7)}"></label>`;
      if (type === 'check') return `<label class="st-row"><span>${label}</span><input type="checkbox" data-k="${k}"${v ? ' checked' : ''}></label>`;
      if (type === 'seg')
        return `<div class="st-row"><span>${label}</span><div class="seg st-seg" data-k="${k}">${(rest[0] as [string, string][]).map(([val, l]) => `<button type="button" data-v="${val}" aria-pressed="${v === val}">${l}</button>`).join('')}</div></div>`;
      const [mn, mx, st] = rest as number[];
      return `<label class="st-row"><span>${label}</span><input type="range" data-k="${k}" min="${mn}" max="${mx}" step="${st}" value="${v ?? mn}"><output>${v ?? ''}</output></label>`;
    };
    props.innerHTML = `<h4>${TYPE_NAME[el.type]}</h4>${FIELDS[el.type].map(f).join('')}
<label class="st-row"><span>大小</span><input type="range" data-k="size" min="0.3" max="2.5" step="0.05" value="${el.size}"><output>${el.size}</output></label>
<label class="st-row"><span>登場時間（秒）</span><input type="range" data-k="delay" min="0" max="6" step="0.1" value="${el.delay}"><output>${el.delay}</output></label>${
      el.type === 'site' ? `<div class="st-presets"><button type="button" class="btn-ghost" data-pt="add">＋ 加一個角</button><button type="button" class="btn-ghost" data-pt="del"${(el.pts?.length ?? 0) <= 3 ? ' disabled' : ''}>－ 減一個角</button><span class="ms-hint">L 形、梯形基地用；新角點加在最長的邊中間</span></div>` : ''
    }`;
  };
  props.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    const el = sc.els.find((x) => x.id === sel);
    const k = t.dataset.k as keyof MEl | undefined;
    if (!el || !k) return;
    const rec = el as unknown as Record<string, unknown>;
    if (t.type === 'checkbox') rec[k] = t.checked;
    else if (t.type === 'range') rec[k] = parseFloat(t.value);
    else if (t.dataset.lines !== undefined) rec[k] = t.value.split('\n').filter((s) => s.trim());
    else rec[k] = t.value;
    if (el.type === 'routes' && k === 'lines') syncRoutes(el);
    const out = t.parentElement?.querySelector('output');
    if (out) out.textContent = t.value;
    persist();
    if (k === 'delay' || k === 'text') renderList();
    redraw();
  });
  props.addEventListener('click', (e) => {
    const pt = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-pt]');
    const cur = sc.els.find((x) => x.id === sel);
    if (pt && cur?.pts) {
      const pts = cur.pts;
      if (pt.dataset.pt === 'del' && pts.length > 3) pts.pop();
      if (pt.dataset.pt === 'add' && pts.length < 12) {
        // 在最長的邊中間插入新角點
        let best = 0;
        let len = -1;
        pts.forEach((a, i) => {
          const b2 = pts[(i + 1) % pts.length];
          const d = Math.hypot(b2[0] - a[0], b2[1] - a[1]);
          if (d > len) [best, len] = [i, d];
        });
        const a = pts[best];
        const b2 = pts[(best + 1) % pts.length];
        pts.splice(best + 1, 0, [(a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2]);
      }
      persist();
      renderProps();
      redraw();
      return;
    }
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.st-seg button');
    const el = sc.els.find((x) => x.id === sel);
    if (!b || !el) return;
    (el as unknown as Record<string, unknown>)[b.closest<HTMLElement>('.st-seg')!.dataset.k!] = b.dataset.v;
    persist();
    renderProps();
    redraw();
  });

  $('#msAdd').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-add]');
    if (!b) return;
    const el = makeEl(b.dataset.add as MType);
    sc.els.push(el);
    sel = el.id;
    persist();
    renderList();
    renderProps();
    redraw();
  });
  $('#msTpl').innerHTML = TEMPLATES.map((t, i) => `<button type="button" class="btn-ghost" data-tpl="${i}">${t.name}</button>`).join('');
  $('#msTpl').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tpl]');
    if (!b) return;
    const r = sc.ratio;
    sc = { ...TEMPLATES[Number(b.dataset.tpl)].scene(), ratio: r };
    sel = null;
    persist();
    renderAll();
  });

  /* ───────── 底圖 ───────── */
  const file = $<HTMLInputElement>('#msFile');
  $('#msUpload').addEventListener('click', () => file.click());
  file.addEventListener('change', () => {
    const f = file.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      const src = String(rd.result);
      loadBg(src);
      try {
        localStorage.setItem('ma-mapbg', JSON.stringify(src));
      } catch {
        deps.toast('底圖太大，重新整理後需要再上傳一次');
      }
    };
    rd.readAsDataURL(f);
  });
  $('#msClearBg').addEventListener('click', () => {
    bg = undefined;
    try {
      localStorage.removeItem('ma-mapbg');
    } catch {
      /* ignore */
    }
    redraw();
  });
  const bgCtl = $('#msBg');
  const syncBgCtl = () =>
    bgCtl.querySelectorAll<HTMLInputElement>('input[data-bg]').forEach((i) => {
      i.value = String(sc[i.dataset.bg as 'bgZoom'] ?? 0);
    });
  const syncDescend = () => ($('#msDescendV').textContent = `${sc.descend ?? 0}s`);
  bgCtl.addEventListener('input', (e) => {
    const i = e.target as HTMLInputElement;
    if (i.dataset.bg === 'descend') $('#msDescendV').textContent = `${i.value}s`;
    if (i.dataset.bg) (sc as unknown as Record<string, number>)[i.dataset.bg] = parseFloat(i.value);
    if (i.id === 'msWithBg') withBg = i.checked;
    persist();
    redraw();
  });

  /* ───────── 比例與輸出 ───────── */
  $('#msRatio').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b) return;
    sc.ratio = b.dataset.v as MScene['ratio'];
    persist();
    syncRatio();
    requestAnimationFrame(() => {
      size();
      redraw();
    });
  });
  const syncRatio = () => $('#msRatio').querySelectorAll<HTMLElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === sc.ratio)));
  const status = $('#msStatus');
  const busy = (m: string) => {
    status.hidden = !m;
    status.textContent = m;
  };
  const fonts = async () => {
    try {
      await document.fonts.load('900 100px "Noto Sans TC"', sc.els.map((e) => (e.text ?? '') + (e.lines ?? []).join('') + (e.fg ?? '')).join(''));
      await document.fonts.load('700 100px "Noto Sans TC"');
    } catch {
      /* ignore */
    }
  };
  const exportBg = () => (withBg ? bg : undefined);
  $('#msPng').addEventListener('click', async () => {
    await fonts();
    const [W, H] = RATIO_PX[sc.ratio];
    const c = canvasOf(W, H);
    drawScene(c.getContext('2d')!, W, H, sc, 99, exportBg());
    c.toBlob((b) => b && saveBlob(b, `map-${stamp()}.png`), 'image/png');
    deps.toast(withBg ? '已輸出 PNG（含底圖）' : '已輸出透明 PNG');
  });
  $('#msSeq').addEventListener('click', async () => {
    await fonts();
    const [W, H] = RATIO_PX[sc.ratio];
    const blob = await pngSequence(W, H, sceneLength(sc), (c, t) => drawScene(c, W, H, sc, t, exportBg()), (i, n) => busy(`輸出 PNG 序列⋯ ${i}/${n}`));
    saveBlob(blob, `map-${stamp()}-30fps.zip`);
    busy('');
    deps.toast('已輸出 PNG 序列');
  });
  $('#msWebm').addEventListener('click', async () => {
    await fonts();
    const [W, H] = RATIO_PX[sc.ratio];
    const p = recordWebm(W, H, sceneLength(sc), (c, t) => drawScene(c, W, H, sc, t, exportBg()), (x) => busy(`錄製中⋯ ${Math.round(x * 100)}%`));
    if (!p) return deps.toast('這個瀏覽器不支援錄製 WebM，請改用 Chrome 或輸出 PNG 序列');
    saveBlob(await p, `map-${stamp()}.webm`);
    busy('');
    deps.toast('已輸出 WebM');
  });
  /** 底圖壓成 JPEG（長邊 1280），讓 Combo 能帶著底圖存進資料庫 */
  const compressBg = (): string | undefined => {
    if (!bg) return undefined;
    const k = Math.min(1, 1280 / Math.max(bg.width, bg.height));
    const c = canvasOf(Math.round(bg.width * k), Math.round(bg.height * k));
    c.getContext('2d')!.drawImage(bg, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.82);
  };
  const sceneForExport = (): MScene => {
    const out: MScene = structuredClone(sc);
    const url = withBg ? compressBg() : undefined;
    if (url) out.bgUrl = url;
    else delete out.bgUrl;
    return out;
  };
  $('#msCombo').addEventListener('click', () => {
    const out = sceneForExport();
    deps.addScene({ effect: 'map-overlay', words: [JSON.stringify(out)], seconds: sceneLength(out) + 1, ratio: out.ratio });
    if (bg && !withBg) deps.toast('已加入 Combo（未含底圖，勾選「輸出包含底圖」可一起帶入）');
  });
  $('#msJson').addEventListener('click', () => {
    const out: MScene = structuredClone(sc);
    delete out.bgUrl;
    deps.copy(JSON.stringify(out), '已複製場景 JSON（不含底圖），可貼給 AI 修改');
  });

  $('#msLoop').addEventListener('input', (e) => {
    sc.loop = parseFloat((e.target as HTMLInputElement).value);
    $('#msLoopV').textContent = `${sc.loop}s`;
    persist();
  });

  /* ───────── 預設（與 AI 來回修改） ───────── */
  const applyScene = (scene: MScene) => {
    sc = { ...scene, els: scene.els.map((e) => ({ ...e })) };
    if (scene.bgUrl) loadBg(scene.bgUrl);
    sel = null;
    persist();
    open();
  };
  const bar = presetBar($('#msPreset'), {
    kind: 'map',
    getData: () => sceneForExport(),
    onLoad: (p) => applyScene(p.data as MScene),
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
    syncRatio();
    syncBgCtl();
    syncDescend();
    $<HTMLInputElement>('#msLoop').value = String(sc.loop);
    $('#msLoopV').textContent = `${sc.loop}s`;
    renderList();
    renderProps();
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
    document.fonts?.ready.then(() => redraw());
  };
  dlg.addEventListener('close', () => {
    ro.disconnect();
    playing = false;
    cancelAnimationFrame(raf);
    document.body.style.overflow = '';
    const u = new URL(location.href);
    if (u.searchParams.get('view') === 'map' || u.searchParams.has('edit')) {
      u.searchParams.delete('view');
      u.searchParams.delete('edit');
      u.searchParams.delete('d');
      history.replaceState({}, '', u.pathname + u.search);
    }
  });
  $('#msClose').addEventListener('click', () => dlg.close());
  if (new URLSearchParams(location.search).get('view') === 'map') open();
  return {
    open,
    /** 載入外部場景（例如 AI 產生的），底圖網址會一併載入 */
    load: (scene: MScene) => {
      bar.set();
      applyScene(scene);
    },
    /** 載入預設或 AI 產生的場景；有 id 時「存回」會更新同一個代碼 */
    loadPreset: (p: Pick<Preset, 'id' | 'name' | 'data'>) => {
      bar.set(p);
      applyScene(p.data as MScene);
    },
  };
};
