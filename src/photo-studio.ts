import { pngSequence, pngSequenceAsync, recordWebm, saveBlob, stamp, canvasOf } from './export-kit';
import { buildStillPreviewHtml, codecMessage, fontExportGate, htmlExportDecision, matteMediaTime, mimeOf, stillNotice } from './textmatte';
import { seekVideoFrame } from './textmatte-media';
import { coverParams, drawPhoto, placeholder } from './render/photo';
import {
  defaultPhotoScene,
  MODULE_DEFAULTS,
  MODULE_INFO,
  normalizePhotoScene,
  PARAMS,
  photoFxId,
  HANDLE_KEYS,
  PHOTO_MODULES,
  PHOTO_GROUPS,
  slotsOf,
  RATIO_PX,
  type PField,
  type PModule,
  type PScene,
} from './photokit';
import { esc } from './util';
import { FONT_PACKS, preloadFonts } from './fonts';
import { presetBar } from './preset-bar';
import type { Preset } from './presets';

export interface PhotoStudioDeps {
  toast: (msg: string) => void;
  copy: (text: string, msg: string) => Promise<void>;
  addScene: (s: { effect: string; words: string[]; seconds?: number; font?: string; ratio?: PScene['ratio'] }) => void;
  store: { get<T>(k: string, d: T): T; set(k: string, v: unknown): void };
}

type Img = HTMLImageElement & { width: number; height: number };

export const initPhotoStudio = (deps: PhotoStudioDeps) => {
  const dlg = document.querySelector<HTMLDialogElement>('#photostudio')!;
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => dlg.querySelector<T>(s)!;
  const cv = $<HTMLCanvasElement>('#psCanvas');
  const stage = $('#psStage');
  const ctx = cv.getContext('2d')!;
  let sc: PScene = normalizePhotoScene(deps.store.get<Partial<PScene>>('photoscene', defaultPhotoScene()));
  /** 圖片插槽：srcs 為工作用 data URL（長邊 2048），imgs 為已載入的圖 */
  let srcs: string[] = [];
  const imgs: (Img | undefined)[] = [];
  /** 字內實拍的影片只活在這個分頁，不寫進場景或瀏覽器儲存。 */
  type Clip = { name: string; url: string; mime: string; video: HTMLVideoElement; error: string; width: number; height: number; duration: number };
  let clip: Clip | null = null;
  /** 切換模組時記住各模組調過的參數 */
  const memo: Partial<Record<PModule, Record<string, number | string>>> = deps.store.get('photomemo', {});
  let playing = false;
  let t0 = 0;
  let raf = 0;
  /** 靜態預覽的時間點；等於長度時為「編輯視圖」 */
  let tView = sc.loop;
  let handles: Record<string, number[]> = {};

  const persist = () => {
    memo[sc.module] = { ...sc.params };
    deps.store.set('photoscene', { ...sc, images: [] });
    deps.store.set('photomemo', memo);
  };
  const persistImgs = () => {
    try {
      localStorage.setItem('ma-photoimg', JSON.stringify(srcs.map((s) => (s.startsWith('blob:') ? '' : s))));
    } catch {
      try {
        localStorage.removeItem('ma-photoimg');
      } catch {
        /* ignore */
      }
      deps.toast('圖片太大，重新整理後需要再放一次');
    }
  };
  const loadImg = (i: number, src: string) => {
    srcs[i] = src;
    if (!src) {
      imgs[i] = undefined;
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
    im.onerror = () => deps.toast(`圖片 ${i + 1} 無法載入（網址可能不允許跨站讀取）`);
    im.src = src;
  };
  const revokeClip = () => {
    if (!clip) return;
    clip.video.pause();
    clip.video.removeAttribute('src');
    clip.video.load();
    if (clip.url.startsWith('blob:')) URL.revokeObjectURL(clip.url);
    clip = null;
  };
  const sources = (): (Img | undefined)[] => (sc.module === 'textmatte' && clip ? [clip.video as unknown as Img] : imgs);
  const matteText = () => `${sc.params.text ?? ''}${sc.params.sub ?? ''}`;
  deps.store.get<string[]>('photoimg', []).forEach((s, i) => s && !s.startsWith('blob:') && loadImg(i, s));

  /* ───────── 繪製 ───────── */
  const size = () => {
    stage.dataset.ratio = sc.ratio;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
    cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
  };
  const k = () => cv.width / Math.max(1, cv.clientWidth);
  const editView = () => !playing && tView >= sc.loop;

  /** 推拉運鏡的編輯視圖：整張圖縮在畫面內，畫出起始（藍）與結束（橘）取景框 */
  const kbLayout = () => {
    const im = (imgs[0] ?? placeholder(0)) as Img;
    const W = cv.width;
    const H = cv.height;
    const c = Math.min((W * 0.92) / im.width, (H * 0.92) / im.height);
    const ox = (W - im.width * c) / 2;
    const oy = (H - im.height * c) / 2;
    const rect = (z: number, x: number, y: number) => {
      const p = coverParams(im, W, H, z, x, y);
      return [ox + p.sx * c, oy + p.sy * c, p.vw * c, p.vh * c];
    };
    const P = sc.params;
    return { im, c, ox, oy, a: rect(Number(P.fz), Number(P.fx), Number(P.fy)), b: rect(Number(P.tz), Number(P.tx), Number(P.ty)) };
  };
  const drawKbEdit = () => {
    const L = kbLayout();
    const W = cv.width;
    const H = cv.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(L.im, L.ox, L.oy, L.im.width * L.c, L.im.height * L.c);
    const u = k();
    const box = (r: number[], col: string, label: string) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 3 * u;
      ctx.strokeRect(r[0], r[1], r[2], r[3]);
      ctx.fillStyle = col;
      for (const [x, y] of [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0], r[1] + r[3]], [r[0] + r[2], r[1] + r[3]]]) ctx.fillRect(x - 6 * u, y - 6 * u, 12 * u, 12 * u);
      ctx.font = `900 ${14 * u}px "MA Num", "Chiron Hei HK", "Noto Sans TC", sans-serif`;
      const w = ctx.measureText(label).width + 14 * u;
      ctx.fillRect(r[0], r[1] - 24 * u, w, 22 * u);
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, r[0] + 7 * u, r[1] - 13 * u);
    };
    box(L.a, '#3b82f6', '起始');
    box(L.b, '#ff5a36', '結束');
  };
  const HANDLE_NAME: Record<string, string> = { card: '照片', divider: '分隔線', target: '重點', lens: '鏡頭', label: '標籤', center: '中心', origin: '起點', title: '標題', caption: '字幕', cut1: '剪報 1', cut2: '剪報 2', cut3: '剪報 3' };
  const redraw = (t?: number) => {
    if (t === undefined && editView() && sc.module === 'kenburns') {
      drawKbEdit();
      handles = {};
      return;
    }
    handles = drawPhoto(ctx, cv.width, cv.height, sc, t ?? tView, sources());
    if (t !== undefined || playing) return;
    const u = k();
    ctx.save();
    ctx.font = `800 ${12 * u}px "MA Num", "Chiron Hei HK", "Noto Sans TC", sans-serif`;
    ctx.textBaseline = 'middle';
    for (const [name, [x, y]] of Object.entries(handles)) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3 * u;
      ctx.beginPath();
      ctx.arc(x, y, 9 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const label = HANDLE_NAME[name] ?? name;
      const w = ctx.measureText(label).width + 10 * u;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + 13 * u, y - 10 * u, w, 20 * u);
      ctx.fillStyle = '#fff';
      ctx.fillText(label, x + 18 * u, y);
    }
    ctx.restore();
  };
  const loop = (now: number) => {
    if (!playing) return;
    const t = (now - t0) / 1000;
    redraw(t);
    timeEl.value = String(Math.min(sc.loop, t));
    if (t > sc.loop + 0.6) {
      playing = false;
      playBtn.textContent = '▶ 播放';
      clip?.video.pause();
      tView = sc.loop;
      timeEl.value = String(tView);
      redraw();
      return;
    }
    raf = requestAnimationFrame(loop);
  };
  const tapBtn = $<HTMLButtonElement>('#psTap');
  const showTap = (on: boolean) => {
    tapBtn.hidden = !on;
  };
  const playBtn = $('#psPlay');
  const setPlaying = (on: boolean) => {
    playing = on;
    playBtn.textContent = playing ? '■ 停止' : '▶ 播放';
    if (playing) {
      t0 = performance.now();
      raf = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(raf);
      clip?.video.pause();
      redraw();
    }
  };
  const startClip = async () => {
    const video = clip?.video;
    if (!video || sc.module !== 'textmatte') return true;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.playsInline = true;
    video.loop = true;
    try {
      video.currentTime = matteMediaTime(Number(sc.params.in) || 0, 0, video.duration);
    } catch { /* 還沒有時長 */ }
    try {
      await video.play();
      showTap(false);
      return true;
    } catch {
      showTap(true);
      deps.toast('點一下播放');
      return false;
    }
  };
  playBtn.addEventListener('click', async () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (sc.module === 'textmatte' && clip && !(await startClip())) return;
    setPlaying(true);
  });
  tapBtn.addEventListener('click', async () => {
    if (await startClip()) setPlaying(true);
  });
  const timeEl = $<HTMLInputElement>('#psTime');
  timeEl.addEventListener('input', () => {
    tView = parseFloat(timeEl.value);
    const video = sc.module === 'textmatte' ? clip?.video : undefined;
    if (video && video.readyState >= 1 && !video.dataset.maFail) {
      const target = matteMediaTime(Number(sc.params.in) || 0, Math.min(tView, sc.loop), video.duration);
      const paint = () => redraw();
      video.addEventListener('seeked', paint, { once: true });
      try { video.currentTime = target; } catch { redraw(); }
    } else redraw();
  });

  /* ───────── 拖曳 ───────── */
  type Drag = { kind: 'handle'; name: string } | { kind: 'kb'; which: 'f' | 't'; mode: 'move' | 'zoom'; gx: number; gy: number };
  let drag: Drag | null = null;
  const toCanvas = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * cv.width, ((e.clientY - r.top) / r.height) * cv.height];
  };
  cv.addEventListener('pointerdown', (e) => {
    if (playing) return;
    const [px, py] = toCanvas(e);
    const u = k();
    if (editView() && sc.module === 'kenburns') {
      const L = kbLayout();
      for (const [which, r] of [['t', L.b], ['f', L.a]] as const) {
        const corner = [[r[0], r[1]], [r[0] + r[2], r[1]], [r[0], r[1] + r[3]], [r[0] + r[2], r[1] + r[3]]].some(([x, y]) => Math.hypot(x - px, y - py) < 16 * u);
        const inside = px >= r[0] && px <= r[0] + r[2] && py >= r[1] && py <= r[1] + r[3];
        if (corner || inside) {
          const cx = r[0] + r[2] / 2;
          const cy = r[1] + r[3] / 2;
          drag = { kind: 'kb', which, mode: corner ? 'zoom' : 'move', gx: px - cx, gy: py - cy };
          cv.setPointerCapture(e.pointerId);
          return;
        }
      }
      return;
    }
    if (!editView()) {
      tView = sc.loop;
      timeEl.value = String(tView);
      redraw();
    }
    const hit = Object.entries(handles).find(([, [x, y]]) => Math.hypot(x - px, y - py) < 30 * u);
    if (hit) {
      drag = { kind: 'handle', name: hit[0] };
      cv.setPointerCapture(e.pointerId);
    }
  });
  cv.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const [px, py] = toCanvas(e);
    const W = cv.width;
    const H = cv.height;
    const c01 = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 1000) / 1000;
    const P = sc.params;
    if (drag.kind === 'kb') {
      const L = kbLayout();
      const z = drag.which === 'f' ? 'fz' : 'tz';
      if (drag.mode === 'move') {
        P[drag.which === 'f' ? 'fx' : 'tx'] = c01((px - drag.gx - L.ox) / L.c / L.im.width);
        P[drag.which === 'f' ? 'fy' : 'ty'] = c01((py - drag.gy - L.oy) / L.c / L.im.height);
      } else {
        // 拖角落：依與框中心的距離換算縮放
        const r = drag.which === 'f' ? L.a : L.b;
        const hw = Math.max(Math.abs(px - (r[0] + r[2] / 2)), (Math.abs(py - (r[1] + r[3] / 2)) * W) / H);
        const k0 = Math.max(W / L.im.width, H / L.im.height);
        P[z] = Math.round(Math.max(1, Math.min(3, W / (k0 * ((2 * hw) / L.c)))) * 100) / 100;
      }
    } else {
      const x = c01(px / W);
      const y = c01(py / H);
      const n = drag.name;
      const keys = HANDLE_KEYS[n];
      if (n === 'divider') P.to = P.dir === 'v' ? y : x;
      else if (n === 'caption' && sc.caption) [sc.caption.x, sc.caption.y] = [x, y];
      else if (keys) [P[keys[0]], P[keys[1]]] = [x, y];
    }
    redraw();
  });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    persist();
    renderParams();
    renderCaption();
  };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);

  /* ───────── 模組、圖片、參數、字幕 ───────── */
  const modEl = $('#psMod');
  const GROUP_NAME = PHOTO_GROUPS;
  modEl.innerHTML = (Object.keys(GROUP_NAME) as (keyof typeof GROUP_NAME)[])
    .map(
      (gk) =>
        `<h5>${GROUP_NAME[gk]}</h5><div class="ps-mod-g">${PHOTO_MODULES.filter((m) => MODULE_INFO[m].group === gk)
          .map((m) => `<button type="button" data-m="${m}" title="${esc(MODULE_INFO[m].desc)}"><b>${MODULE_INFO[m].zh}</b><small>${esc(MODULE_INFO[m].desc)}</small></button>`)
          .join('')}</div>`,
    )
    .join('') + '<p class="ps-mod-desc" id="psModDesc"></p>';
  const syncMod = () => {
    modEl.querySelectorAll<HTMLElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === sc.module)));
    $('#psModDesc').textContent = `${MODULE_INFO[sc.module].zh}：${MODULE_INFO[sc.module].desc}`;
  };
  modEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-m]');
    if (!b || b.dataset.m === sc.module) return;
    memo[sc.module] = { ...sc.params };
    clip?.video.pause();
    showTap(false);
    const m = b.dataset.m as PModule;
    sc = { ...sc, module: m, params: { ...MODULE_DEFAULTS[m], ...(memo[m] ?? {}) } };
    if (m === 'textmatte') sc.bg = String(sc.params.bg) === 'none' ? 'transparent' : String(sc.params.c1 || '#12161E');
    persist();
    renderAll();
  });

  const slotsEl = $('#psSlots');
  const file = $<HTMLInputElement>('#psFile');
  let slotTarget = 0;
  const renderSlots = () => {
    const info = MODULE_INFO[sc.module];
    const names = info.names;
    const n = names.length;
    file.accept = sc.module === 'textmatte' ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,image/*' : 'image/*';
    slotsEl.classList.toggle('many', n > 3);
    if (sc.module === 'textmatte' && clip) {
      const meta = clip.error ? clip.error : `${clip.width || '…'}×${clip.height || '…'}${clip.duration ? `　${clip.duration.toFixed(1)} 秒` : ''}`;
      slotsEl.innerHTML = `<div class="ps-slot" data-i="0"><div class="ps-thumb"><span>影片<br>僅此分頁</span></div><div class="ps-slot-b"><b>${esc(names[0])}</b><small>${esc(clip.name)}　${esc(meta)}</small><div class="st-presets"><button type="button" class="btn-ghost" data-op="up">換檔</button><button type="button" class="btn-ghost" data-op="rm">移除</button></div><p class="ms-hint">影片不寫進場景。重新整理後要重選。HTML 不會把這支影片包進去。</p></div></div>`;
      return;
    }
    slotsEl.innerHTML = Array.from({ length: n }, (_, i) => {
      const has = !!imgs[i];
      const empty = sc.module === 'textmatte' ? '未放檔<br>顯示客廳示意' : info.optional?.includes(i) ? '可留空' : n > 3 ? '未放圖' : '未放圖<br>顯示示意圖';
      const put = sc.module === 'textmatte' ? (has ? '換照片' : '放入影片或照片') : has ? '換圖' : '放入圖片';
      const note = sc.module === 'textmatte' && has ? '<p class="ms-hint">目前是照片靜態版，不是影片。</p>' : '';
      return `<div class="ps-slot" data-i="${i}"><div class="ps-thumb">${has ? `<img src="${esc(srcs[i])}" alt="">` : `<span>${empty}</span>`}</div><div class="ps-slot-b"><b>${names[i]}</b>${has ? `<small>${imgs[i]!.naturalWidth}×${imgs[i]!.naturalHeight}</small>` : ''}<div class="st-presets"><button type="button" class="btn-ghost" data-op="up">${put}</button>${has ? '<button type="button" class="btn-ghost" data-op="rm">移除</button>' : ''}</div>${note}</div></div>`;
    }).join('');
  };
  slotsEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-op]');
    const slot = (e.target as HTMLElement).closest<HTMLElement>('.ps-slot');
    if (!b || !slot) return;
    const i = Number(slot.dataset.i);
    if (b.dataset.op === 'rm') {
      if (sc.module === 'textmatte' && i === 0) revokeClip();
      loadImg(i, '');
      persistImgs();
      if (sc.module === 'textmatte') renderSlots();
    } else {
      slotTarget = i;
      file.click();
    }
  });
  /** 讀入本機圖片並縮到長邊 maxSide，避免瀏覽器儲存爆量 */
  const downscale = (im: Img, maxSide: number, q: number): string => {
    const s = Math.min(1, maxSide / Math.max(im.naturalWidth || im.width, im.naturalHeight || im.height));
    const c = canvasOf(Math.round((im.naturalWidth || im.width) * s), Math.round((im.naturalHeight || im.height) * s));
    c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height);
    // WebP 保留去背圖的 alpha；不支援的瀏覽器會依 Canvas 規範退回 PNG。
    return c.toDataURL('image/webp', q);
  };
  const readFile = (f: File, i: number) => {
    if (sc.module === 'textmatte' && i === 0) {
      const kind = mimeOf(f.name, f.type);
      if (kind.kind === 'video') {
        revokeClip();
        loadImg(0, '');
        const url = URL.createObjectURL(f);
        const video = document.createElement('video');
        video.muted = true;
        video.defaultMuted = true;
        video.volume = 0;
        video.playsInline = true;
        video.preload = 'auto';
        video.loop = true;
        video.src = url;
        clip = { name: f.name, url, mime: kind.mime, video, error: '', width: 0, height: 0, duration: 0 };
        const markFail = () => {
          if (clip?.video !== video) return;
          clip.error = codecMessage(kind.mime, f.name);
          video.dataset.maFail = '1';
          deps.toast(clip.error);
          renderSlots();
          redraw();
        };
        video.onerror = markFail;
        video.onloadeddata = () => {
          if (clip?.video !== video || video.dataset.maFail === '1') return;
          clip.width = video.videoWidth;
          clip.height = video.videoHeight;
          clip.duration = Number.isFinite(video.duration) ? video.duration : 0;
          if (!video.videoWidth) {
            markFail();
            return;
          }
          try { video.currentTime = Number(sc.params.in) || 0; } catch { /* 長度還沒好 */ }
          renderSlots();
          redraw();
        };
        renderSlots();
        return;
      }
      if (kind.kind !== 'image') {
        deps.toast('請放入 mp4、webm、mov 或照片。副檔名不能保證影片解得開。');
        return;
      }
      revokeClip();
      deps.toast('已放入照片，這是靜態版，不是影片');
    }
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => {
      loadImg(i, downscale(im as Img, 2048, 0.9));
      URL.revokeObjectURL(url);
      persistImgs();
    };
    im.onerror = () => deps.toast('這個檔案無法讀取');
    im.src = url;
  };
  file.addEventListener('change', () => {
    const fs = [...(file.files ?? [])];
    fs.slice(0, slotsOf(sc.module) - slotTarget).forEach((f, j) => readFile(f, slotTarget + j));
    file.value = '';
  });
  // 直接把圖片拖進預覽區
  stage.addEventListener('dragover', (e) => e.preventDefault());
  stage.addEventListener('drop', (e) => {
    e.preventDefault();
    const fs = [...(e.dataTransfer?.files ?? [])].filter((f) => (sc.module === 'textmatte' ? mimeOf(f.name, f.type).kind !== 'unknown' : f.type.startsWith('image/')));
    const n = slotsOf(sc.module);
    const empty = Math.max(0, Array.from({ length: n }, (_, i) => imgs[i]).findIndex((x) => !x));
    // 一次拖多張：從第一個空插槽開始依序放
    fs.slice(0, n).forEach((f, j) => readFile(f, Math.min(n - 1, empty + j)));
  });

  const field = (f: PField, v: unknown, attr = 'data-k') => {
    if (f.type === 'range')
      return `<label class="st-row"><span>${f.label}</span><input type="range" ${attr}="${f.k}" min="${f.min}" max="${f.max}" step="${f.step}" value="${v ?? f.min}"><output>${v ?? ''}</output></label>`;
    if (f.type === 'text') return `<label class="st-row"><span>${f.label}</span><input type="text" ${attr}="${f.k}" value="${esc(String(v ?? ''))}"></label>`;
    if (f.type === 'seg')
      return `<div class="st-row"><span>${f.label}</span><div class="seg st-seg" ${attr}="${f.k}">${f.opts.map(([val, l]) => `<button type="button" data-v="${val}" aria-pressed="${String(v) === val}">${l}</button>`).join('')}</div></div>`;
    return `<label class="st-row"><span>${f.label}</span><input type="color" ${attr}="${f.k}" value="${String(v ?? '#ffffff').slice(0, 7)}"></label>`;
  };
  const paramsEl = $('#psParams');
  const renderParams = () => {
    paramsEl.innerHTML =
      (sc.module === 'textmatte' ? '<p class="ms-hint">字內播影片，字外可實色或透明。預覽不保證逐格。PNG 序列會等到每一格；WebM 是即時錄製，可能掉格。HTML 只存靜態預覽，不會把影片包進去。照片是另外選的靜態版。</p>' :
        sc.module === 'kenburns' ? '<p class="ms-hint">時間軸拉到最右是編輯視圖：拖藍框（起始）、橘框（結束）移動取景，拖框角縮放。</p>' :
        sc.module === 'collage' ? '<p class="ms-hint">請放入已去背的 PNG／WebP；這裡不會自動去背。拖藍點調整每張剪報位置。</p>' :
        sc.module === 'occlude' ? '<p class="ms-hint">透明前景會疊在不透明底板上，確保換景接縫被完全遮住。</p>' :
        '<p class="ms-hint">按播放或拖時間軸預覽；有藍色圓點時可拖曳位置。</p>') +
      (MODULE_INFO[sc.module].group === 'pcut' && sc.module !== 'mask' && sc.module !== 'textmatte' ? '<p class="ms-hint">動作總時間超過片段長度時會等比例加速，確保尾格完成。</p>' : '') +
      PARAMS[sc.module].map((f) => field(f, sc.params[f.k])).join('');
  };
  const onField = (host: HTMLElement, target: () => Record<string, unknown>, after: () => void) => {
    host.addEventListener('input', (e) => {
      const t = e.target as HTMLInputElement | HTMLTextAreaElement;
      const key = t.dataset.k;
      if (!key) return;
      target()[key] = t.type === 'range' ? parseFloat(t.value) : t.value;
      if (sc.module === 'textmatte' && key === 'c1' && sc.params.bg !== 'none') {
        sc.bg = String(t.value);
        syncBg();
      }
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
      if (sc.module === 'textmatte' && key === 'bg') {
        sc.bg = String(target()[key]) === 'none' ? 'transparent' : String(sc.params.c1 || '#12161E');
        syncBg();
      }
      persist();
      after();
      redraw();
    });
  };
  onField(paramsEl, () => sc.params, () => renderParams());

  const capEl = $('#psCap');
  const CAP_FIELDS: PField[] = [
    { k: 'style', label: '樣式', type: 'seg', opts: [['pill', '膠囊'], ['bar', '色條'], ['plain', '描邊字']] },
    { k: 'color', label: '文字色', type: 'color' },
    { k: 'size', label: '大小', type: 'range', min: 0.4, max: 3, step: 0.05 },
    { k: 'delay', label: '出現時間（秒）', type: 'range', min: 0, max: 10, step: 0.1 },
    { k: 'x', label: '位置 X', type: 'range', min: 0, max: 1, step: 0.01 },
    { k: 'y', label: '位置 Y', type: 'range', min: 0, max: 1, step: 0.01 },
  ];
  const renderCaption = () => {
    const c = sc.caption!;
    capEl.innerHTML = `<label class="ms-col"><span>字幕（可多行，留空＝不顯示）</span><textarea data-k="text" rows="2">${esc(c.text)}</textarea></label>${CAP_FIELDS.map((f) => field(f, c[f.k as keyof typeof c])).join('')}`;
  };
  onField(capEl, () => sc.caption as unknown as Record<string, unknown>, () => renderCaption());

  /* ───────── 背景、比例、長度 ───────── */
  const fontSel = $<HTMLSelectElement>('#psFont');
  fontSel.innerHTML = FONT_PACKS.map((f) => `<option value="${f.id}">${f.zh}　${esc(f.use)}</option>`).join('');
  fontSel.addEventListener('change', async () => {
    if (fontSel.value === 'sharp') delete sc.font;
    else sc.font = fontSel.value;
    persist();
    await preloadFonts(`${sc.caption?.text ?? ''}${sc.params.title ?? ''}${sc.params.labels ?? ''}`, fontSel.value);
    redraw();
  });
  const bgC = $<HTMLInputElement>('#psBgC');
  const trans = $<HTMLInputElement>('#psTrans');
  const syncBg = () => {
    trans.checked = sc.bg === 'transparent';
    if (sc.bg !== 'transparent') bgC.value = sc.bg.split(',')[0].slice(0, 7);
  };
  bgC.addEventListener('input', () => {
    sc.bg = bgC.value;
    trans.checked = false;
    if (sc.module === 'textmatte') {
      sc.params.c1 = bgC.value;
      sc.params.bg = 'solid';
      renderParams();
    }
    persist();
    redraw();
  });
  trans.addEventListener('change', () => {
    sc.bg = trans.checked ? 'transparent' : bgC.value;
    if (sc.module === 'textmatte') {
      sc.params.bg = trans.checked ? 'none' : 'solid';
      if (!trans.checked) sc.params.c1 = bgC.value;
      renderParams();
    }
    persist();
    redraw();
  });
  $('#psRatio').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b) return;
    sc.ratio = b.dataset.v as PScene['ratio'];
    persist();
    syncRatio();
    requestAnimationFrame(() => {
      size();
      redraw();
    });
  });
  const syncRatio = () => $('#psRatio').querySelectorAll<HTMLElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === sc.ratio)));
  const loopEl = $<HTMLInputElement>('#psLoop');
  loopEl.addEventListener('input', () => {
    sc.loop = parseFloat(loopEl.value);
    $('#psLoopV').textContent = `${sc.loop}s`;
    timeEl.max = String(sc.loop);
    tView = sc.loop;
    timeEl.value = String(tView);
    persist();
    redraw();
  });

  /* ───────── 輸出 ───────── */
  const status = $('#psStatus');
  const busy = (m: string) => {
    status.hidden = !m;
    status.textContent = m;
  };
  const fonts = async () => {
    try {
      const pack = sc.module === 'textmatte' && sc.params.font === 'serif' ? 'serif' : sc.font;
      await preloadFonts(`${sc.caption?.text ?? ''}${sc.params.labelA ?? ''}${sc.params.labelB ?? ''}${sc.params.title ?? ''}${sc.params.labels ?? ''}${sc.params.label ?? ''}${matteText()}圖片`, pack);
      await document.fonts?.ready;
      if (sc.module === 'textmatte' && document.fonts) {
        const fam = sc.params.font === 'serif' ? 'Noto Serif TC' : 'Chiron Hei HK';
        const sample = String(sc.params.text || '這').slice(0, 1);
        if (!document.fonts.check(`900 40px "${fam}"`, sample)) deps.toast('指定字型無法載入，這次改用系統字型。');
      }
    } catch {
      /* ignore */
    }
  };
  const prepareFonts = async () => {
    busy('正在載入字型…');
    await fonts();
    const ready = !document.fonts || document.fonts.status === 'loaded';
    if (fontExportGate(ready) === 'wait') {
      deps.toast('字型還在載入，請稍後再匯出');
      busy('');
      return false;
    }
    return true;
  };
  const drawAt = (c: CanvasRenderingContext2D, W: number, H: number, t: number) => drawPhoto(c, W, H, sc, t, sources());
  const videoGate = () => htmlExportDecision({
    hasVideo: !!clip && sc.module === 'textmatte',
    videoReady: !!clip && !clip.error && clip.video.readyState >= 2 && clip.video.videoWidth > 0 && clip.video.dataset.maFail !== '1',
    videoError: !!clip && (!!clip.error || clip.video.dataset.maFail === '1'),
    hasPhoto: sc.module === 'textmatte' && !!imgs[0] && !clip,
  });
  $('#psPng').addEventListener('click', async () => {
    if (!(await prepareFonts())) return;
    if (clip && sc.module === 'textmatte') {
      const gate = videoGate();
      if (!gate.ok) return deps.toast(gate.reason), busy('');
      try {
        await seekVideoFrame(clip.video, matteMediaTime(Number(sc.params.in) || 0, Math.min(tView, sc.loop), clip.video.duration));
      } catch {
        busy('');
        return deps.toast('影片沒有停在這個時間，已停止輸出，不會改用示意圖。');
      }
    }
    const [W, H] = RATIO_PX[sc.ratio];
    const c = canvasOf(W, H);
    drawAt(c.getContext('2d')!, W, H, Math.min(tView, sc.loop));
    c.toBlob((b) => b && saveBlob(b, `photo-${sc.module}-${stamp()}.png`), 'image/png');
    busy('');
    deps.toast('已輸出目前時間點的 PNG');
  });
  $('#psSeq').addEventListener('click', async () => {
    if (!(await prepareFonts())) return;
    const [W, H] = RATIO_PX[sc.ratio];
    try {
      const blob = clip && sc.module === 'textmatte'
        ? await (async () => {
            const gate = videoGate();
            if (!gate.ok) throw new Error(gate.reason);
            return pngSequenceAsync(W, H, sc.loop, async (c, t) => {
              await seekVideoFrame(clip!.video, matteMediaTime(Number(sc.params.in) || 0, t, clip!.video.duration));
              drawAt(c, W, H, t);
            }, (i, n) => busy(`輸出 PNG 序列⋯ ${i}/${n}（等待畫面）`));
          })()
        : await pngSequence(W, H, sc.loop, (c, t) => drawAt(c, W, H, t), (i, n) => busy(`輸出 PNG 序列⋯ ${i}/${n}`));
      saveBlob(blob, `photo-${sc.module}-${stamp()}-30fps.zip`);
      busy('');
      deps.toast(clip && sc.module === 'textmatte' ? '已輸出 PNG 序列（每一格都等到畫面）' : '已輸出 PNG 序列');
    } catch (err) {
      busy('');
      const msg = err instanceof Error ? err.message : '';
      deps.toast(msg && !['seek', 'decode'].includes(msg) ? msg : '逐格輸出失敗，已停止，不會改用示意圖。');
    }
  });
  $('#psWebm').addEventListener('click', async () => {
    if (!(await prepareFonts())) return;
    const [W, H] = RATIO_PX[sc.ratio];
    if (clip && sc.module === 'textmatte') {
      const gate = videoGate();
      if (!gate.ok) return deps.toast(gate.reason), busy('');
      const started = await startClip();
      if (!started) return deps.toast('請先點一下播放，再錄 WebM'), busy('');
    }
    const p = recordWebm(W, H, sc.loop, (c, t) => drawAt(c, W, H, t), (x) => busy(`錄製中⋯ ${Math.round(x * 100)}%`));
    if (!p) return deps.toast('這個瀏覽器不支援錄製 WebM，請改用 Chrome 或輸出 PNG 序列'), busy('');
    try {
      saveBlob(await p, `photo-${sc.module}-${stamp()}.webm`);
      deps.toast(sc.module === 'textmatte' ? '已輸出 WebM。這是即時錄製，可能掉格；要逐格請用 PNG 序列。' : '已輸出 WebM');
    } finally {
      clip?.video.pause();
      busy('');
    }
  });
  $('#psHtml').addEventListener('click', async () => {
    if (sc.module !== 'textmatte') return;
    if (!(await prepareFonts())) return;
    const gate = videoGate();
    if (!gate.ok || !gate.kind) return deps.toast(gate.reason), busy('');
    if (gate.kind === 'video-frame' && clip) {
      try {
        await seekVideoFrame(clip.video, matteMediaTime(Number(sc.params.in) || 0, Math.min(tView, sc.loop), clip.video.duration));
      } catch {
        busy('');
        return deps.toast('影片沒有停在這個時間，已停止匯出，不會改放示意圖。');
      }
    }
    const [W, H] = RATIO_PX[sc.ratio];
    const c = canvasOf(W, H);
    drawAt(c.getContext('2d')!, W, H, Math.min(tView, sc.loop));
    const png = c.toDataURL('image/png');
    const html = buildStillPreviewHtml({ kind: gate.kind, pngDataUrl: png, width: W, height: H });
    if (/<video|data:video|octet-stream|blob:/i.test(html)) {
      busy('');
      return deps.toast('已中止：這份 HTML 不應該帶有影片。');
    }
    saveBlob(new Blob([html], { type: 'text/html' }), `photo-textmatte-still-${stamp()}.html`);
    busy(stillNotice(gate.kind));
    deps.toast('已匯出靜態預覽，檔案裡沒有影片');
  });
  /** 帶圖輸出時壓成長邊 1280 的 WebP，保留透明剪報並控制大小。 */
  const sceneOut = (withImages: boolean): PScene => {
    const n = slotsOf(sc.module);
    return {
      ...structuredClone({ ...sc, images: [] }),
      images: Array.from({ length: n }, (_, i) => (withImages && imgs[i] ? downscale(imgs[i]!, 1280, 0.82) : '')),
    };
  };
  const keepImg = $<HTMLInputElement>('#psKeepImg');
  $('#psCombo').addEventListener('click', () => {
    if (sc.module === 'textmatte' && clip) deps.toast('影片不會放進 Combo，也不會包進 HTML。要動態請輸出 PNG 序列或 WebM。');
    const out = sceneOut(true);
    deps.addScene({ effect: photoFxId(out.module), words: [JSON.stringify(out)], seconds: out.loop + 1, ratio: out.ratio, ...(out.font ? { font: out.font } : {}) });
  });
  $('#psJson').addEventListener('click', () => {
    deps.copy(JSON.stringify(sceneOut(false)), '已複製設定 JSON（不含圖片），可貼給 AI 修改或套用到自己的照片');
  });

  /* ───────── 預設（與 AI 來回修改） ───────── */
  const applyScene = (scene: Partial<PScene>) => {
    sc = normalizePhotoScene(scene);
    // 預設通常不含圖片：沿用目前放的圖，只換動畫設定
    (scene.images ?? []).forEach((s, i) => s && loadImg(i, s));
    tView = sc.loop;
    persist();
    open();
  };
  const bar = presetBar($('#psPreset'), {
    kind: 'photo',
    getData: () => sceneOut(keepImg.checked),
    onLoad: (p) => applyScene(p.data as PScene),
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
    syncMod();
    syncRatio();
    syncBg();
    $<HTMLButtonElement>('#psHtml').hidden = sc.module !== 'textmatte';
    fontSel.value = sc.font ?? 'sharp';
    loopEl.value = String(sc.loop);
    $('#psLoopV').textContent = `${sc.loop}s`;
    timeEl.max = String(sc.loop);
    tView = Math.min(tView, sc.loop);
    timeEl.value = String(tView);
    renderSlots();
    renderParams();
    renderCaption();
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
    clip?.video.pause();
    showTap(false);
    document.body.style.overflow = '';
    const u = new URL(location.href);
    if (u.searchParams.get('view') === 'photo' || u.searchParams.has('edit')) {
      u.searchParams.delete('view');
      u.searchParams.delete('edit');
      u.searchParams.delete('d');
      history.replaceState({}, '', u.pathname + u.search);
    }
  });
  $('#psClose').addEventListener('click', () => dlg.close());
  if (new URLSearchParams(location.search).get('view') === 'photo') open();
  return {
    /** 打開工作室；可指定模組 */
    open: (module?: PModule) => {
      if (module && module !== sc.module) {
        memo[sc.module] = { ...sc.params };
        sc = { ...sc, module, params: { ...MODULE_DEFAULTS[module], ...(memo[module] ?? {}) } };
        if (module === 'textmatte') sc.bg = String(sc.params.bg) === 'none' ? 'transparent' : String(sc.params.c1 || '#12161E');
        persist();
      }
      open();
    },
    load: (scene: Partial<PScene>) => {
      bar.set();
      applyScene(scene);
    },
    loadPreset: (p: Pick<Preset, 'id' | 'name' | 'data'>) => {
      bar.set(p);
      applyScene(p.data as PScene);
    },
  };
};
