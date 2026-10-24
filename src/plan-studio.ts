import { pngSequence, recordWebm, saveBlob, stamp, canvasOf } from './export-kit';
import { drawPlan, planAutoCrop, planSample } from './render/plan';
import { defaultPlanScene, normalizePlanScene, PLAN_INFO, PLAN_MODES, PLAN_RATIO_PX, planFxId, planLength, type PlanMode, type PlanScene, type PRoom } from './plankit';
import { esc } from './util';
import { FONT_PACKS, preloadFonts } from './fonts';
import { presetBar } from './preset-bar';
import type { Preset } from './presets';

export interface PlanStudioDeps {
  toast: (msg: string) => void;
  copy: (text: string, msg: string) => Promise<void>;
  addScene: (s: { effect: string; words: string[]; seconds?: number; font?: string; ratio?: PlanScene['ratio'] }) => void;
  store: { get<T>(k: string, d: T): T; set(k: string, v: unknown): void };
}

type Img = HTMLImageElement & { width: number; height: number };
type Tool = 'select' | 'rect' | 'poly' | 'path' | 'crop';

export const initPlanStudio = (deps: PlanStudioDeps) => {
  const dlg = document.querySelector<HTMLDialogElement>('#planstudio')!;
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => dlg.querySelector<T>(s)!;
  const cv = $<HTMLCanvasElement>('#plCanvas');
  const stage = $('#plStage');
  const ctx = cv.getContext('2d')!;
  let sc: PlanScene = normalizePlanScene(deps.store.get<Partial<PlanScene>>('planscene', defaultPlanScene('rooms')));
  /** 使用者放的圖：data URL 與已載入的圖（sample: 開頭的是內建示意圖） */
  const imgs: (Img | undefined)[] = [];
  let view: 'edit' | 'preview' = 'edit';
  let tool: Tool = 'rect';
  let which = 0;
  let sel = -1;
  let playing = false;
  let t0 = 0;
  let raf = 0;
  let tView = 0;

  const persist = () => deps.store.set('planscene', { ...sc, images: sc.images.map((s) => (s.startsWith('data:') ? '' : s)) });
  const persistImgs = () => {
    try {
      localStorage.setItem('ma-planimg', JSON.stringify(sc.images.map((s) => (s.startsWith('data:') ? s : ''))));
    } catch {
      deps.toast('圖片太大，重新整理後需要再放一次');
    }
  };
  const loadImg = (i: number, src: string) => {
    sc.images[i] = src;
    imgs[i] = undefined;
    if (!src || src.startsWith('sample:')) {
      renderSlots();
      redraw();
      return;
    }
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => {
      imgs[i] = im as Img;
      renderSlots();
      redraw();
    };
    im.onerror = () => deps.toast(`圖片 ${i + 1} 無法載入`);
    im.src = src;
  };
  try {
    (JSON.parse(localStorage.getItem('ma-planimg') || '[]') as string[]).forEach((s, i) => s && loadImg(i, s));
  } catch {
    /* ignore */
  }
  const imgAt = (i: number): HTMLCanvasElement | Img | null => imgs[i] ?? (sc.images[i]?.startsWith('sample:') ? planSample(sc.images[i].slice(7)) : null);
  const roomsOf = () => (which === 1 ? sc.rooms2 : sc.rooms);
  const cropNow = () => {
    const m = sc.crops?.[which];
    if (m) return m;
    const im = imgs[which];
    return im ? planAutoCrop(im) : [0, 0, 1, 1];
  };
  const length = () => planLength(sc);

  /* ───────── 繪製 ───────── */
  const size = () => {
    stage.dataset.ratio = sc.ratio;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
    cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
  };
  const k = () => cv.width / Math.max(1, cv.clientWidth);
  /** 編輯視圖：整張圖放進畫面，房間、動線都畫出來 */
  const fit = () => {
    const im = imgAt(which);
    if (!im) return null;
    // 放大到平面圖範圍（外圍多留一點，方便調整範圍）
    const cr = cropNow();
    const cw = Math.min(1, (cr[2] - cr[0]) * 1.2);
    const ch = Math.min(1, (cr[3] - cr[1]) * 1.2);
    const s = Math.min((cv.width * 0.96) / (im.width * cw), (cv.height * 0.96) / (im.height * ch));
    const mx = (cr[0] + cr[2]) / 2;
    const my = (cr[1] + cr[3]) / 2;
    return { im, s, ox: cv.width / 2 - mx * im.width * s, oy: cv.height / 2 - my * im.height * s };
  };
  let draft: number[][] = [];
  let dragRect: number[] | null = null;
  const toScreen = (f: NonNullable<ReturnType<typeof fit>>, u: number, v: number) => [f.ox + u * f.im.width * f.s, f.oy + v * f.im.height * f.s];
  const drawEdit = () => {
    const W = cv.width;
    const H = cv.height;
    const u = k();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#e9e5dc';
    ctx.fillRect(0, 0, W, H);
    const f = fit();
    if (!f) {
      ctx.fillStyle = '#6b665c';
      ctx.font = `700 ${16 * u}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`把${PLAN_INFO[sc.mode].slots[which] ?? '平面圖'}拖進來，或在右邊「圖片」放入`, W / 2, H / 2);
      return;
    }
    ctx.drawImage(f.im, f.ox, f.oy, f.im.width * f.s, f.im.height * f.s);
    // 顯示範圍（影片裡只會看到框內）：框外蓋淡
    const cr = cropNow();
    const [c0x, c0y] = toScreen(f, cr[0], cr[1]);
    const [c1x, c1y] = toScreen(f, cr[2], cr[3]);
    ctx.fillStyle = 'rgba(233,229,220,0.72)';
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.rect(c0x, c0y, c1x - c0x, c1y - c0y);
    ctx.fill('evenodd');
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2 * u;
    ctx.setLineDash([10 * u, 6 * u]);
    ctx.strokeRect(c0x, c0y, c1x - c0x, c1y - c0y);
    ctx.setLineDash([]);
    ctx.fillStyle = '#16a34a';
    ctx.font = `700 ${12 * u}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(sc.crops?.[which] ? '顯示範圍（手動）' : '顯示範圍（自動）', c0x + 4 * u, c0y - 4 * u);
    const AC = sc.params.color;
    const poly = (pts: number[][]) => {
      ctx.beginPath();
      pts.forEach(([a, b], i) => {
        const [x, y] = toScreen(f, a, b);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.closePath();
    };
    roomsOf().forEach((r, i) => {
      const isSel = i === sel;
      const isTarget = which === 0 && (sc.mode === 'locate' || sc.mode === 'focus') && i === sc.target;
      poly(r.pts);
      ctx.fillStyle = isSel ? 'rgba(59,130,246,0.28)' : isTarget ? 'rgba(255,90,54,0.28)' : 'rgba(255,90,54,0.12)';
      ctx.fill();
      ctx.strokeStyle = isSel ? '#3b82f6' : AC;
      ctx.lineWidth = (isSel ? 3 : 2) * u;
      ctx.stroke();
      const xs = r.pts.map((p) => p[0]);
      const ys = r.pts.map((p) => p[1]);
      const [cx, cy] = toScreen(f, (Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2);
      ctx.font = `700 ${13 * u}px sans-serif`;
      const label = `${i + 1}. ${r.name || '未命名'}${isTarget ? ' ★' : ''}`;
      const tw = ctx.measureText(label).width + 10 * u;
      ctx.fillStyle = isSel ? '#3b82f6' : '#1d2433';
      ctx.fillRect(cx - tw / 2, cy - 11 * u, tw, 22 * u);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy);
      if (isSel)
        r.pts.forEach(([a, b]) => {
          const [x, y] = toScreen(f, a, b);
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2 * u;
          ctx.beginPath();
          ctx.arc(x, y, 6 * u, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
    });
    // 動線
    if (which === 0 && sc.path.length) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3 * u;
      ctx.setLineDash([8 * u, 6 * u]);
      ctx.beginPath();
      sc.path.forEach(([a, b], i) => {
        const [x, y] = toScreen(f, a, b);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      sc.path.forEach(([a, b], i) => {
        const [x, y] = toScreen(f, a, b);
        ctx.fillStyle = i ? '#3b82f6' : '#16a34a';
        ctx.beginPath();
        ctx.arc(x, y, 9 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${11 * u}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i ? String(i) : '入', x, y);
      });
    }
    // 正在畫的框或多邊形
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2 * u;
    if (dragRect) {
      const [a, b] = toScreen(f, dragRect[0], dragRect[1]);
      const [c, d] = toScreen(f, dragRect[2], dragRect[3]);
      ctx.strokeRect(Math.min(a, c), Math.min(b, d), Math.abs(c - a), Math.abs(d - b));
    }
    if (draft.length) {
      ctx.beginPath();
      draft.forEach(([a, b], i) => {
        const [x, y] = toScreen(f, a, b);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.stroke();
      draft.forEach(([a, b]) => {
        const [x, y] = toScreen(f, a, b);
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, 5 * u, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };
  const redraw = (t?: number) => {
    if (t === undefined && view === 'edit' && !playing) return drawEdit();
    drawPlan(ctx, cv.width, cv.height, sc, t ?? tView, imgs);
  };
  const loop = (now: number) => {
    if (!playing) return;
    const t = (now - t0) / 1000;
    redraw(t);
    timeEl.value = String(Math.min(length(), t));
    if (t > length() + 0.5) {
      playing = false;
      playBtn.textContent = '▶ 播放';
      redraw();
      return;
    }
    raf = requestAnimationFrame(loop);
  };
  const playBtn = $('#plPlay');
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
  const timeEl = $<HTMLInputElement>('#plTime');
  timeEl.addEventListener('input', () => {
    tView = parseFloat(timeEl.value);
    setView('preview');
  });
  const setView = (v: 'edit' | 'preview') => {
    view = v;
    $('#plView').querySelectorAll<HTMLElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === view)));
    redraw();
  };
  $('#plView').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (b) setView(b.dataset.v as 'edit' | 'preview');
  });

  /* ───────── 在圖上標記：拉框、多邊形、動線、選取拖曳 ───────── */
  const toImg = (e: PointerEvent | MouseEvent) => {
    const f = fit();
    if (!f) return null;
    const r = cv.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * cv.width;
    const py = ((e.clientY - r.top) / r.height) * cv.height;
    return [Math.round(((px - f.ox) / (f.im.width * f.s)) * 1000) / 1000, Math.round(((py - f.oy) / (f.im.height * f.s)) * 1000) / 1000];
  };
  const hitRoom = (p: number[]) => {
    const list = roomsOf();
    for (let i = list.length - 1; i >= 0; i--) {
      const pts = list[i].pts;
      let c = false;
      for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) {
        const [xi, yi] = pts[a];
        const [xj, yj] = pts[b];
        if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi || 1e-9) + xi) c = !c;
      }
      if (c) return i;
    }
    return -1;
  };
  let drag: { kind: 'move' | 'vertex' | 'rect'; start: number[]; idx: number; vi: number; orig: number[][] } | null = null;
  const addRoom = (pts: number[][]) => {
    const list = roomsOf();
    list.push({ name: `房間 ${list.length + 1}`, pts });
    sel = list.length - 1;
    persist();
    renderRooms();
    redraw();
    requestAnimationFrame(() => $<HTMLInputElement>(`#plRooms [data-i="${sel}"][data-f="name"]`)?.select());
  };
  cv.addEventListener('pointerdown', (e) => {
    if (playing) return;
    if (view !== 'edit') setView('edit');
    const p = toImg(e);
    if (!p) return;
    const f = fit()!;
    const u = k();
    if (tool === 'path') {
      if (which !== 0) return deps.toast('動線畫在第一張圖上');
      sc.path.push(p);
      persist();
      redraw();
      return;
    }
    if (tool === 'poly') {
      if (draft.length >= 3) {
        const [x0, y0] = toScreen(f, draft[0][0], draft[0][1]);
        const [x1, y1] = toScreen(f, p[0], p[1]);
        if (Math.hypot(x1 - x0, y1 - y0) < 14 * u) {
          addRoom(draft);
          draft = [];
          return;
        }
      }
      draft.push(p);
      redraw();
      return;
    }
    if (tool === 'rect' || tool === 'crop') {
      drag = { kind: 'rect', start: p, idx: -1, vi: -1, orig: [] };
      dragRect = [p[0], p[1], p[0], p[1]];
      cv.setPointerCapture(e.pointerId);
      return;
    }
    // 選取：先看是否點到選取房間的頂點
    const list = roomsOf();
    if (sel >= 0 && list[sel]) {
      const vi = list[sel].pts.findIndex(([a, b]) => {
        const [x, y] = toScreen(f, a, b);
        const [px, py] = toScreen(f, p[0], p[1]);
        return Math.hypot(x - px, y - py) < 12 * u;
      });
      if (vi >= 0) {
        drag = { kind: 'vertex', start: p, idx: sel, vi, orig: structuredClone(list[sel].pts) };
        cv.setPointerCapture(e.pointerId);
        return;
      }
    }
    sel = hitRoom(p);
    renderRooms();
    redraw();
    if (sel >= 0) {
      drag = { kind: 'move', start: p, idx: sel, vi: -1, orig: structuredClone(list[sel].pts) };
      cv.setPointerCapture(e.pointerId);
    }
  });
  cv.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = toImg(e);
    if (!p) return;
    const r = roomsOf()[drag.idx];
    if (drag.kind === 'rect') dragRect = [drag.start[0], drag.start[1], p[0], p[1]];
    else if (drag.kind === 'vertex' && r) r.pts[drag.vi] = p;
    else if (drag.kind === 'move' && r) {
      const dx = p[0] - drag.start[0];
      const dy = p[1] - drag.start[1];
      r.pts = drag.orig.map(([a, b]) => [Math.round((a + dx) * 1000) / 1000, Math.round((b + dy) * 1000) / 1000]);
    }
    redraw();
  });
  const endDrag = () => {
    if (!drag) return;
    if (drag.kind === 'rect' && dragRect) {
      const [a, b, c, d] = dragRect;
      dragRect = null;
      if (Math.abs(c - a) > 0.015 && Math.abs(d - b) > 0.015) {
        const [x0, x1] = [Math.max(0, Math.min(a, c)), Math.min(1, Math.max(a, c))];
        const [y0, y1] = [Math.max(0, Math.min(b, d)), Math.min(1, Math.max(b, d))];
        if (tool === 'crop') {
          sc.crops = [...(sc.crops ?? [null, null])];
          sc.crops[which] = [x0, y0, x1, y1].map((v) => Math.round(v * 1000) / 1000);
          persist();
          redraw();
        } else addRoom([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
      } else redraw();
    } else persist();
    drag = null;
  };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('dblclick', () => {
    if (tool === 'poly' && draft.length >= 3) {
      addRoom(draft);
      draft = [];
    }
  });
  dlg.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).closest('input,textarea,select')) return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel >= 0) {
      roomsOf().splice(sel, 1);
      sel = -1;
      persist();
      renderRooms();
      redraw();
      e.preventDefault();
    }
    if (e.key === 'Escape' && draft.length) {
      draft = [];
      redraw();
      e.preventDefault();
    }
  });

  const toolsEl = $('#plTools');
  const syncTools = () => {
    toolsEl.querySelectorAll<HTMLElement>('[data-tool]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === tool)));
    const two = sc.mode === 'compare' || sc.mode === 'locate';
    $('#plWhich').hidden = sc.mode !== 'compare';
    $('#plWhich').querySelectorAll<HTMLElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.v) === which)));
    toolsEl.querySelector<HTMLElement>('[data-tool="path"]')!.hidden = sc.mode !== 'tour';
    $('#plClearPath').hidden = sc.mode !== 'tour';
    $('#plToolHint').textContent =
      tool === 'rect'
        ? '在圖上拖曳拉出房間範圍。'
        : tool === 'poly'
          ? '逐點點出房間外框，點回第一點或雙擊收合；Esc 取消。'
          : tool === 'path'
            ? '從入口開始依序點出動線，第一點是入口。'
            : tool === 'crop'
              ? '拉框設定影片裡要顯示的平面圖範圍（避開 Logo、圖例與留白）；按「自動範圍」恢復自動。'
            : `點選房間後可拖曳移動、拖頂點調整形狀；Delete 刪除。${two && which === 0 && sc.mode === 'locate' ? '整層圖上標的是各戶範圍。' : ''}`;
  };
  toolsEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tool]');
    if (!b) return;
    tool = b.dataset.tool as Tool;
    draft = [];
    syncTools();
    setView('edit');
  });
  $('#plWhich').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b) return;
    which = Number(b.dataset.v);
    sel = -1;
    syncTools();
    renderRooms();
    setView('edit');
  });
  $('#plAutoCrop').addEventListener('click', () => {
    if (sc.crops) sc.crops[which] = null;
    persist();
    redraw();
    deps.toast('已恢復自動抓平面圖範圍');
  });
  $('#plClearPath').addEventListener('click', () => {
    sc.path = [];
    persist();
    redraw();
  });

  /* ───────── 房間清單 ───────── */
  const roomsEl = $('#plRooms');
  const renderRooms = () => {
    const list = roomsOf();
    const tgt = which === 0 && (sc.mode === 'locate' || sc.mode === 'focus');
    roomsEl.innerHTML = list.length
      ? list
          .map(
            (r: PRoom, i) =>
              `<div class="pl-room${i === sel ? ' on' : ''}" data-row="${i}"><b>${i + 1}</b><input data-i="${i}" data-f="name" value="${esc(r.name)}" placeholder="名稱"><input data-i="${i}" data-f="sub" value="${esc(r.sub ?? '')}" placeholder="副標（選填）">${tgt ? `<button type="button" data-target="${i}" aria-pressed="${sc.target === i}" title="設為目標">★</button>` : ''}<button type="button" data-del="${i}" title="刪除">✕</button></div>`,
          )
          .join('')
      : '<p class="ms-hint">還沒有標房間。選「拉框」在圖上拖曳一個範圍。</p>';
  };
  roomsEl.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    const i = Number(t.dataset.i);
    const r = roomsOf()[i];
    if (!r) return;
    if (t.dataset.f === 'name') r.name = t.value;
    else if (t.value) r.sub = t.value;
    else delete r.sub;
    persist();
    redraw();
  });
  roomsEl.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    const del = el.closest<HTMLElement>('[data-del]');
    const tg = el.closest<HTMLElement>('[data-target]');
    if (del) {
      roomsOf().splice(Number(del.dataset.del), 1);
      sel = -1;
      if (sc.target >= sc.rooms.length) sc.target = Math.max(0, sc.rooms.length - 1);
    } else if (tg) sc.target = Number(tg.dataset.target);
    else {
      const row = el.closest<HTMLElement>('[data-row]');
      if (!row || el.tagName === 'INPUT') return;
      sel = Number(row.dataset.row);
    }
    persist();
    renderRooms();
    redraw();
  });
  $('#plClearRooms').addEventListener('click', () => {
    if (!roomsOf().length || !confirm('清除這張圖上所有標記的房間？')) return;
    roomsOf().length = 0;
    sel = -1;
    persist();
    renderRooms();
    redraw();
  });

  /* ───────── 模式與圖片 ───────── */
  const modeEl = $('#plMode');
  modeEl.innerHTML = PLAN_MODES.map((m) => `<button type="button" data-m="${m}" title="${esc(PLAN_INFO[m].desc)}"><b>${PLAN_INFO[m].zh}</b></button>`).join('') + '<p class="ps-mod-desc" id="plModeDesc"></p>';
  const syncMode = () => {
    modeEl.querySelectorAll<HTMLElement>('[data-m]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === sc.mode)));
    $('#plModeDesc').textContent = PLAN_INFO[sc.mode].desc;
  };
  modeEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-m]');
    if (!b || b.dataset.m === sc.mode) return;
    const m = b.dataset.m as PlanMode;
    const mine = sc.images.some((s) => s.startsWith('data:'));
    // 換模式：已放自己的圖時保留圖和標記，只換動畫；還在用示意圖時整組換成該模式的示範
    sc = mine ? normalizePlanScene({ ...sc, mode: m }, m) : { ...defaultPlanScene(m), ratio: sc.ratio, params: sc.params, ...(sc.font ? { font: sc.font } : {}) };
    which = 0;
    sel = -1;
    tool = m === 'tour' ? 'path' : 'rect';
    persist();
    renderAll();
  });
  const slotsEl = $('#plSlots');
  const fileEl = $<HTMLInputElement>('#plFile');
  let slotPick = 0;
  const renderSlots = () => {
    const names = PLAN_INFO[sc.mode].slots;
    slotsEl.innerHTML = names
      .map((n, i) => {
        const src = sc.images[i] || '';
        const kind = src.startsWith('data:') || /^https?:/.test(src) ? '已放入' : src.startsWith('sample:') ? '示意圖' : '空';
        return `<div class="ps-slot"><span>${esc(n)}</span><em>${kind}</em><button type="button" class="btn-ghost" data-pick="${i}">放入圖片</button>${src ? `<button type="button" class="btn-ghost" data-clear="${i}">移除</button>` : ''}</div>`;
      })
      .join('');
  };
  slotsEl.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    const pick = el.closest<HTMLElement>('[data-pick]');
    const clear = el.closest<HTMLElement>('[data-clear]');
    if (pick) {
      slotPick = Number(pick.dataset.pick);
      fileEl.click();
    }
    if (clear) {
      loadImg(Number(clear.dataset.clear), '');
      persist();
      persistImgs();
    }
  });
  /** 讀入本機圖片：長邊縮到 2200（平面圖字小，保留細節） */
  const readFile = (file: File, slot: number) =>
    new Promise<void>((res) => {
      const url = URL.createObjectURL(file);
      const im = new Image();
      im.onload = () => {
        const s = Math.min(1, 2200 / Math.max(im.naturalWidth, im.naturalHeight));
        const c = canvasOf(Math.round(im.naturalWidth * s), Math.round(im.naturalHeight * s));
        c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        loadImg(slot, c.toDataURL('image/webp', 0.9));
        if (sc.crops) sc.crops[slot] = null;
        // 換成自己的圖時，示範用的房間標記就不適用了
        if (slot === 0 && sc.rooms.length && !sc.images.some((x, i) => i !== slot && x.startsWith('data:'))) {
          sc.rooms = [];
          sc.path = [];
          sc.target = 0;
        }
        if (slot === 1 && sc.mode === 'compare') sc.rooms2 = [];
        if (sc.title === defaultPlanScene(sc.mode).title) {
          sc.title = '';
          sc.sub = '';
        }
        persist();
        persistImgs();
        renderAll();
        res();
      };
      im.onerror = () => {
        deps.toast('這個檔案無法讀取');
        res();
      };
      im.src = url;
    });
  fileEl.addEventListener('change', async () => {
    const files = [...(fileEl.files ?? [])];
    for (let i = 0; i < files.length; i++) await readFile(files[i], Math.min(slotPick + i, PLAN_INFO[sc.mode].slots.length - 1));
    fileEl.value = '';
    if (files.length) deps.toast('已放入平面圖，接著在圖上拉框標出房間');
  });
  stage.addEventListener('dragover', (e) => e.preventDefault());
  stage.addEventListener('drop', async (e) => {
    e.preventDefault();
    const files = [...(e.dataTransfer?.files ?? [])].filter((f) => f.type.startsWith('image/'));
    for (let i = 0; i < files.length; i++) await readFile(files[i], Math.min(which + i, PLAN_INFO[sc.mode].slots.length - 1));
  });

  /* ───────── 文字與樣式 ───────── */
  const textEl = $('#plText');
  const renderText = () => {
    const f = (k: keyof PlanScene, label: string, ph = '') => `<label class="st-row"><span>${label}</span><input type="text" data-t="${k}" value="${esc(String(sc[k] ?? ''))}" placeholder="${esc(ph)}"></label>`;
    textEl.innerHTML =
      f('title', '標題', '例如：A3 戶') +
      f('sub', '副標', '例如：27.82 坪（建商 DM）') +
      (sc.mode === 'compare' ? f('labelA', 'A 標籤', 'A 戶｜三房') + f('labelB', 'B 標籤', 'B 戶｜兩房') : '') +
      (sc.mode === 'focus' ? f('dimW', '寬度文字', '約 3.5 m（留空不畫）') + f('dimH', '深度文字', '約 3.2 m（留空不畫）') : '') +
      '<p class="ms-hint">坪數、尺寸請用建商資料或權狀，並在副標註明來源。</p>';
  };
  textEl.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    const key = t.dataset.t as keyof PlanScene;
    if (!key) return;
    (sc as unknown as Record<string, string>)[key] = t.value;
    persist();
    if (view === 'edit') setView('preview');
    else redraw();
  });
  const styleEl = $('#plStyle');
  const renderStyle = () => {
    const P = sc.params;
    styleEl.innerHTML = `<label class="st-row"><span>重點色</span><input type="color" data-p="color" value="${P.color}"></label>
<label class="st-row"><span>壓暗程度</span><input type="range" data-p="dim" min="0" max="0.9" step="0.05" value="${P.dim}"><output>${P.dim}</output></label>
<label class="st-row"><span>速度</span><input type="range" data-p="speed" min="0.4" max="2.5" step="0.1" value="${P.speed}"><output>${P.speed}</output></label>
${sc.mode === 'tilt' ? `<label class="st-row"><span>牆高</span><input type="range" data-p="walls" min="0" max="2" step="0.1" value="${P.walls}"><output>${P.walls}</output></label>` : ''}
<label class="st-row"><span>免責小字</span><input type="checkbox" data-p="note" ${P.note ? 'checked' : ''}></label>`;
  };
  styleEl.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    const key = t.dataset.p as keyof PlanScene['params'];
    if (!key) return;
    (sc.params as Record<string, number | string>)[key] = t.type === 'checkbox' ? (t.checked ? 1 : 0) : t.type === 'range' ? parseFloat(t.value) : t.value;
    const out = t.parentElement?.querySelector('output');
    if (out) out.textContent = t.value;
    persist();
    syncLen();
    if (view === 'edit' && key !== 'color') setView('preview');
    else redraw();
  });
  const bgC = $<HTMLInputElement>('#plBgC');
  const trans = $<HTMLInputElement>('#plTrans');
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
  const fontSel = $<HTMLSelectElement>('#plFont');
  fontSel.innerHTML = FONT_PACKS.map((f) => `<option value="${f.id}">${f.zh}　${esc(f.use)}</option>`).join('');
  fontSel.addEventListener('change', async () => {
    if (fontSel.value === 'sharp') delete sc.font;
    else sc.font = fontSel.value;
    persist();
    await fonts();
    redraw();
  });
  $('#plRatio').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b) return;
    sc.ratio = b.dataset.v as PlanScene['ratio'];
    persist();
    syncRatio();
    requestAnimationFrame(() => {
      size();
      redraw();
    });
  });
  const syncRatio = () => $('#plRatio').querySelectorAll<HTMLElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === sc.ratio)));
  const syncLen = () => {
    const L = length();
    $('#plLen').textContent = `${L}s`;
    timeEl.max = String(L);
  };

  /* ───────── 輸出 ───────── */
  const status = $('#plStatus');
  const busy = (m: string) => {
    status.hidden = !m;
    status.textContent = m;
  };
  const allText = () => [sc.title, sc.sub, sc.labelA, sc.labelB, sc.dimW, sc.dimH, ...sc.rooms.map((r) => r.name + (r.sub ?? '')), ...sc.rooms2.map((r) => r.name), '本圖面僅供參考實際依買賣合約書附圖為準入VS'].join('');
  const fonts = () => preloadFonts(allText(), sc.font);
  const drawAt = (c: CanvasRenderingContext2D, W: number, H: number, t: number) => drawPlan(c, W, H, sc, t, imgs);
  $('#plPng').addEventListener('click', async () => {
    await fonts();
    const [W, H] = PLAN_RATIO_PX[sc.ratio];
    const c = canvasOf(W, H);
    drawAt(c.getContext('2d')!, W, H, view === 'edit' ? length() : tView);
    c.toBlob((b) => b && saveBlob(b, `plan-${sc.mode}-${stamp()}.png`), 'image/png');
    deps.toast('已輸出 PNG');
  });
  $('#plSeq').addEventListener('click', async () => {
    await fonts();
    const [W, H] = PLAN_RATIO_PX[sc.ratio];
    const blob = await pngSequence(W, H, length() + 0.5, (c, t) => drawAt(c, W, H, t), (i, n) => busy(`輸出 PNG 序列⋯ ${i}/${n}`));
    saveBlob(blob, `plan-${sc.mode}-${stamp()}-30fps.zip`);
    busy('');
    deps.toast('已輸出 PNG 序列');
  });
  $('#plWebm').addEventListener('click', async () => {
    await fonts();
    const [W, H] = PLAN_RATIO_PX[sc.ratio];
    const p = recordWebm(W, H, length() + 0.5, (c, t) => drawAt(c, W, H, t), (x) => busy(`錄製中⋯ ${Math.round(x * 100)}%`));
    if (!p) return deps.toast('這個瀏覽器不支援錄製 WebM，請改用 Chrome 或輸出 PNG 序列');
    saveBlob(await p, `plan-${sc.mode}-${stamp()}.webm`);
    busy('');
    deps.toast('已輸出 WebM');
  });
  /** 帶圖片的場景：自己的圖縮到長邊 1600 */
  const withImages = () => ({
    ...sc,
    images: sc.images.map((s, i) => {
      const im = imgs[i];
      if (!s.startsWith('data:') || !im) return s;
      const k2 = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight));
      const c = canvasOf(Math.round(im.naturalWidth * k2), Math.round(im.naturalHeight * k2));
      c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.85);
    }),
  });
  $('#plCombo').addEventListener('click', () => {
    deps.addScene({ effect: planFxId(sc.mode), words: [JSON.stringify(withImages())], seconds: length() + 0.5, ratio: sc.ratio, ...(sc.font ? { font: sc.font } : {}) });
  });
  $('#plJson').addEventListener('click', () => deps.copy(JSON.stringify({ ...sc, images: sc.images.map((s) => (s.startsWith('data:') ? '' : s)) }), '已複製設定 JSON（不含圖片），可貼給 AI 修改'));

  /* ───────── 預設 ───────── */
  const keepImg = $<HTMLInputElement>('#plKeepImg');
  const applyScene = (scene: Partial<PlanScene>) => {
    sc = normalizePlanScene(scene, scene.mode);
    sc.images.forEach((s, i) => loadImg(i, s));
    which = 0;
    sel = -1;
    persist();
    open();
  };
  const bar = presetBar($('#plPreset'), {
    kind: 'plan',
    getData: () => (keepImg.checked ? withImages() : { ...sc, images: sc.images.map((s) => (s.startsWith('data:') ? '' : s)) }),
    onLoad: (p) => applyScene(p.data as PlanScene),
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
    syncMode();
    syncRatio();
    syncTools();
    syncLen();
    trans.checked = sc.bg === 'transparent';
    if (sc.bg !== 'transparent') bgC.value = sc.bg.slice(0, 7);
    fontSel.value = sc.font ?? 'sharp';
    renderSlots();
    renderRooms();
    renderText();
    renderStyle();
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
    if (u.searchParams.get('view') === 'plan' || u.searchParams.has('edit')) {
      u.searchParams.delete('view');
      u.searchParams.delete('edit');
      u.searchParams.delete('d');
      history.replaceState({}, '', u.pathname + u.search);
    }
  });
  $('#plClose').addEventListener('click', () => dlg.close());
  if (new URLSearchParams(location.search).get('view') === 'plan') open();
  return {
    open: (mode?: PlanMode) => {
      if (mode && mode !== sc.mode) {
        const mine = sc.images.some((s) => s.startsWith('data:'));
        sc = mine ? normalizePlanScene({ ...sc, mode }, mode) : { ...defaultPlanScene(mode), ratio: sc.ratio, params: sc.params };
        tool = mode === 'tour' ? 'path' : 'rect';
      }
      persist();
      open();
    },
    load: (scene: Partial<PlanScene>) => {
      bar.set();
      applyScene(scene);
    },
    loadPreset: (p: Pick<Preset, 'id' | 'name' | 'data'>) => {
      bar.set(p);
      applyScene(p.data as PlanScene);
    },
  };
};
