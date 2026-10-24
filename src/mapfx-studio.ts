// 地圖招式（mx-*）編輯器：拖曳點位、換自己的底圖，結果寫成 words 最後一行「@set {json}」，
// 卡片、Combo、匯出 HTML 都讀同一行，所以加入 Combo 後畫面一致。
import { canvasOf, saveBlob, stamp } from './export-kit';
import { ALL_EFFECTS } from './data';
import { MAPFX_HELP, MAPFX_LOOP } from './mapfx';
import { esc } from './util';
import { MAPX } from './render/mapfx';
import type { Tone } from './types';

type Ratio = '9:16' | '16:9' | '1:1';
type Opt = { fg: string; bg: string; ac: string; ac2: string; font: string };
type Handle = { id: string; name: string; kind: 'w' | 's'; X: number; Y: number; W: number; H: number; k: number; cx: number; cy: number };
interface MxState {
  mode: string;
  ratio: Ratio;
  words: string[];
  pos: Record<string, number[]>;
  bg: string;
}

export interface MapfxStudioDeps {
  toast: (msg: string) => void;
  copy: (text: string, msg: string) => Promise<void>;
  addScene: (s: { effect: string; words: string[]; seconds?: number; ratio?: Ratio }) => void;
  store: { get<T>(k: string, d: T): T; set(k: string, v: unknown): void };
  /** 依色調取得目前配色與字型 */
  opt: (tone: Tone) => Opt;
}

const R = MAPX as unknown as { draw: (...a: unknown[]) => number; ready: (w: string[]) => Promise<void>; handles: () => Handle[] };
const RATIO_PX: Record<Ratio, [number, number]> = { '9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080] };
// 指南針是透明疊加元件，沒有底圖也沒有點位
const MODES = ALL_EFFECTS.filter((f) => f.id.startsWith('mx-') && f.id !== 'mx-compass').sort((a, b) => a.no - b.no);

/** 從 words 拆出文字與「@set」設定 */
export const splitMxWords = (words: string[]) => {
  let set: { pos?: Record<string, number[]>; bg?: string } = {};
  const text = words.filter((l) => {
    if (!/^@set\s*\{/.test(String(l).trim())) return true;
    try {
      set = JSON.parse(String(l).trim().replace(/^@set\s*/, ''));
    } catch {
      /* 忽略壞掉的設定 */
    }
    return false;
  });
  return { text, pos: set.pos ?? {}, bg: set.bg ?? '' };
};

export const initMapfxStudio = (deps: MapfxStudioDeps) => {
  const dlg = document.querySelector<HTMLDialogElement>('#mxstudio')!;
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => dlg.querySelector<T>(s)!;
  const cv = $<HTMLCanvasElement>('#mxCanvas');
  const stage = $('#mxStage');
  const ctx = cv.getContext('2d')!;
  const fxOf = (mode: string) => MODES.find((f) => f.id === `mx-${mode}`) ?? MODES[0];
  // 每招的文字與位置分開記，切換招式不會互相覆蓋；底圖共用（同一個案場常會換不同招）
  const saved = deps.store.get<{ mode: string; ratio: Ratio; per: Record<string, { words: string[]; pos: Record<string, number[]> }> }>('mxstudio', { mode: 'tour', ratio: '9:16', per: {} });
  let bgSaved = '';
  try {
    bgSaved = localStorage.getItem('ma-mxbg') ?? '';
  } catch {
    /* 無痕模式 */
  }
  const stateFor = (mode: string): MxState => ({ mode, ratio: saved.ratio, words: saved.per[mode]?.words ?? fxOf(mode).sample, pos: saved.per[mode]?.pos ?? {}, bg: bgSaved });
  let sc: MxState = stateFor(MODES.some((f) => f.id === `mx-${saved.mode}`) ? saved.mode : 'tour');
  let playing = false;
  let raf = 0;
  let t0 = 0;
  let frac = 0.9;
  let hs: Handle[] = [];
  let drag: Handle | null = null;

  const persist = () => {
    saved.mode = sc.mode;
    saved.ratio = sc.ratio;
    saved.per[sc.mode] = { words: sc.words, pos: sc.pos };
    deps.store.set('mxstudio', saved);
  };
  const setLine = (withBg: boolean) => {
    const o: { pos?: Record<string, number[]>; bg?: string } = {};
    if (Object.keys(sc.pos).length) o.pos = sc.pos;
    if (withBg && sc.bg) o.bg = sc.bg;
    return Object.keys(o).length ? [`@set ${JSON.stringify(o)}`] : [];
  };
  const wordsOut = (withBg = true) => [...sc.words, ...setLine(withBg)];
  const loopOf = () => MAPFX_LOOP[sc.mode] ?? 6;

  /* ───────── 繪製 ───────── */
  const size = () => {
    stage.dataset.ratio = sc.ratio;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
    cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
  };
  const u = () => cv.width / Math.max(1, cv.clientWidth);
  const draw = (c: CanvasRenderingContext2D, W: number, H: number, t: number) => R.draw(c, W, H, sc.mode, wordsOut(), t, deps.opt(fxOf(sc.mode).tone));
  const redraw = (t?: number) => {
    const L = loopOf();
    draw(ctx, cv.width, cv.height, t ?? L * frac);
    hs = R.handles().slice();
    if (playing) return;
    const k = u();
    ctx.save();
    for (const h of hs) {
      const on = drag?.id === h.id;
      ctx.beginPath();
      ctx.arc(h.X, h.Y, (on ? 13 : 10) * k, 0, Math.PI * 2);
      ctx.fillStyle = on ? '#3b82f6' : 'rgba(255,255,255,.9)';
      ctx.fill();
      ctx.lineWidth = 3 * k;
      ctx.strokeStyle = '#3b82f6';
      ctx.stroke();
    }
    ctx.restore();
  };
  const loop = (now: number) => {
    if (!playing) return;
    const L = loopOf(), t = (now - t0) / 1000;
    redraw(Math.min(t, L));
    timeEl.value = String(Math.min(1, t / L));
    if (t > L + 0.6) {
      playing = false;
      playBtn.textContent = '▶ 播放';
      frac = 0.9;
      timeEl.value = String(frac);
      redraw();
      return;
    }
    raf = requestAnimationFrame(loop);
  };
  const playBtn = $('#mxPlay');
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
  const timeEl = $<HTMLInputElement>('#mxTime');
  timeEl.addEventListener('input', () => {
    frac = parseFloat(timeEl.value);
    if (!playing) redraw();
  });

  /* ───────── 拖曳 ───────── */
  const toCanvas = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * cv.width, ((e.clientY - r.top) / r.height) * cv.height];
  };
  const r4 = (v: number) => Math.round(v * 10000) / 10000;
  cv.addEventListener('pointerdown', (e) => {
    if (playing) return;
    const [px, py] = toCanvas(e);
    let best: Handle | null = null;
    let bd = 28 * u();
    for (const h of hs) {
      const d = Math.hypot(h.X - px, h.Y - py);
      if (d < bd) [bd, best] = [d, h];
    }
    if (!best) return;
    drag = best;
    cv.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  cv.addEventListener('pointermove', (e) => {
    if (!drag) {
      const [px, py] = toCanvas(e);
      cv.style.cursor = hs.some((h) => Math.hypot(h.X - px, h.Y - py) < 28 * u()) ? 'grab' : '';
      return;
    }
    const [px, py] = toCanvas(e);
    const X = Math.max(0, Math.min(drag.W, px)), Y = Math.max(0, Math.min(drag.H, py));
    sc.pos[drag.id] = drag.kind === 'w' ? [r4(drag.cx + (X - drag.W / 2) / drag.k), r4(drag.cy + (Y - drag.H / 2) / drag.k)] : [r4(X / drag.W), r4(Y / drag.H)];
    redraw();
  });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    persist();
    redraw();
    renderPts();
  };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);

  /* ───────── 面板 ───────── */
  const modeSel = $<HTMLSelectElement>('#mxMode');
  modeSel.innerHTML = MODES.map((f) => `<option value="${f.id.slice(3)}">${f.no} ${f.zh}</option>`).join('');
  modeSel.addEventListener('change', () => {
    persist();
    sc = { ...stateFor(modeSel.value), ratio: sc.ratio, bg: sc.bg };
    renderAll();
  });
  const wordsEl = $<HTMLTextAreaElement>('#mxWords');
  wordsEl.addEventListener('input', () => {
    sc.words = wordsEl.value.split('\n').filter((l) => l.trim() && !/^@set\s*\{/.test(l.trim()));
    persist();
    redraw();
    renderPts();
  });
  const renderPts = () => {
    const box = $('#mxPts');
    box.innerHTML = hs.length
      ? hs.map((h) => `<span class="mx-pt${sc.pos[h.id] ? ' moved' : ''}">${esc(h.name)}${sc.pos[h.id] ? '・已移動' : ''}</span>`).join('')
      : '<span class="ms-hint">這一招沒有可拖曳的點，可以換底圖。</span>';
    $<HTMLButtonElement>('#mxReset').disabled = !Object.keys(sc.pos).length;
  };
  $('#mxReset').addEventListener('click', () => {
    sc.pos = {};
    persist();
    redraw();
    renderPts();
  });
  dlg.querySelectorAll<HTMLButtonElement>('#mxRatio button').forEach((b) =>
    b.addEventListener('click', () => {
      sc.ratio = b.dataset.v as Ratio;
      persist();
      syncRatio();
      requestAnimationFrame(() => {
        size();
        redraw();
        renderPts();
      });
    }),
  );
  const syncRatio = () => dlg.querySelectorAll<HTMLButtonElement>('#mxRatio button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === sc.ratio)));

  /* ───────── 底圖 ───────── */
  const setBg = (url: string) => {
    sc.bg = url;
    try {
      if (url) localStorage.setItem('ma-mxbg', url);
      else localStorage.removeItem('ma-mxbg');
    } catch {
      deps.toast('底圖太大，重新整理後不會保留；加入 Combo 仍會帶著');
    }
    $<HTMLButtonElement>('#mxBgDel').disabled = !url;
    void R.ready(wordsOut()).then(() => redraw());
  };
  $<HTMLInputElement>('#mxFile').addEventListener('change', async (e) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    (e.target as HTMLInputElement).value = '';
    if (!f) return;
    try {
      const bmp = await createImageBitmap(f);
      // 長邊 1600、JPEG 0.82：清楚又不會讓 Combo 太大
      const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      const c = canvasOf(Math.round(bmp.width * k), Math.round(bmp.height * k));
      c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
      bmp.close();
      setBg(c.toDataURL('image/jpeg', 0.82));
      deps.toast('已換上底圖，把點拖到正確位置');
    } catch {
      deps.toast('這張圖無法讀取，請換 JPG 或 PNG');
    }
  });
  $('#mxBgDel').addEventListener('click', () => setBg(''));

  /* ───────── 輸出 ───────── */
  $('#mxCombo').addEventListener('click', () => {
    deps.addScene({ effect: `mx-${sc.mode}`, words: wordsOut(), seconds: Math.round((loopOf() + 1.2) * 10) / 10, ratio: sc.ratio });
  });
  $('#mxCopy').addEventListener('click', () => {
    void deps.copy(wordsOut(false).join('\n'), sc.bg ? '已複製文字與位置（不含底圖），可貼給 AI 或卡片文字欄' : '已複製文字與位置設定');
  });
  $('#mxPng').addEventListener('click', async () => {
    const [W, H] = RATIO_PX[sc.ratio];
    const c = canvasOf(W, H);
    await R.ready(wordsOut());
    const L = loopOf();
    draw(c.getContext('2d')!, W, H, L * frac);
    c.toBlob((b) => b && saveBlob(b, `map-${sc.mode}-${stamp()}.png`), 'image/png');
  });

  /* ───────── 開關 ───────── */
  const ro = new ResizeObserver(() => {
    size();
    redraw();
  });
  const renderAll = () => {
    const fx = fxOf(sc.mode);
    modeSel.value = sc.mode;
    $('#mxTitle').textContent = `${fx.zh}・地圖編輯器`;
    $('#mxHint').textContent = `格式：${MAPFX_HELP[sc.mode] ?? ''}`;
    $('#mxNote').textContent = '底圖為示意或你上傳的圖；數字、距離、時間請用實測或官方資料。';
    wordsEl.value = sc.words.join('\n');
    $<HTMLButtonElement>('#mxBgDel').disabled = !sc.bg;
    syncRatio();
    requestAnimationFrame(() => {
      size();
      redraw();
      renderPts();
    });
    void R.ready(wordsOut()).then(() => redraw());
  };
  const open = () => {
    if (!dlg.open) dlg.showModal();
    document.body.style.overflow = 'hidden';
    ro.observe(stage);
    renderAll();
    void document.fonts.ready.then(() => redraw());
  };
  dlg.addEventListener('close', () => {
    ro.disconnect();
    playing = false;
    playBtn.textContent = '▶ 播放';
    cancelAnimationFrame(raf);
    document.body.style.overflow = '';
    const u = new URL(location.href);
    if (u.searchParams.get('view') === 'mapfx') {
      u.searchParams.delete('view');
      history.replaceState({}, '', u.pathname + u.search);
    }
  });
  $('#mxClose').addEventListener('click', () => dlg.close());
  if (new URLSearchParams(location.search).get('view') === 'mapfx') open();
  return {
    /** 從卡片打開：帶入卡片目前的文字與比例 */
    open: (effect: string, words?: string[], ratio?: Ratio) => {
      persist();
      const mode = effect.replace(/^mx-/, '');
      sc = stateFor(MODES.some((f) => f.id === effect) ? mode : 'tour');
      if (ratio) sc.ratio = ratio;
      if (words?.length) {
        const s = splitMxWords(words);
        sc.words = s.text;
        if (Object.keys(s.pos).length) sc.pos = s.pos;
        if (s.bg) sc.bg = s.bg;
      }
      open();
    },
  };
};
