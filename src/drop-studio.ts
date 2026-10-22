import { drawDrop, dropToWords, parseDrop, type DropOpts } from './drop';
import { preloadFonts } from './fonts';
import { esc } from './util';
import { presetBar } from './preset-bar';
import type { Preset } from './presets';
import { zip } from './export-kit';

export interface StudioDeps {
  toast: (msg: string) => void;
  copy: (text: string, msg: string) => Promise<void>;
  addScene: (s: { effect: string; words: string[]; seconds?: number; ratio?: DropOpts['ratio'] }) => void;
  store: { get<T>(k: string, d: T): T; set(k: string, v: unknown): void };
}

type Ctl =
  | { k: keyof DropOpts; label: string; type: 'range'; min: number; max: number; step: number }
  | { k: keyof DropOpts; label: string; type: 'color' }
  | { k: keyof DropOpts; label: string; type: 'seg'; options: [string, string][] };

const GROUPS: { title: string; ctls: Ctl[] }[] = [
  {
    title: '形狀',
    ctls: [
      { k: 'shape', label: '外形', type: 'seg', options: [['circle', '正圓'], ['cloud', '雲朵'], ['flower', '花瓣'], ['pebble', '卵石'], ['random', '隨機']] },
      { k: 'size', label: '大小', type: 'range', min: 0, max: 0.95, step: 0.01 },
      { k: 'lobes', label: '瓣數', type: 'range', min: 2, max: 8, step: 1 },
      { k: 'amp', label: '起伏', type: 'range', min: 0, max: 0.3, step: 0.01 },
      { k: 'irregular', label: '不規則', type: 'range', min: 0, max: 1, step: 0.05 },
    ],
  },
  {
    title: '顏色與光澤',
    ctls: [
      { k: 'color', label: '上方顏色', type: 'color' },
      { k: 'color2', label: '下方顏色', type: 'color' },
      { k: 'alpha', label: '透明度', type: 'range', min: 0.1, max: 1, step: 0.01 },
      { k: 'depth', label: '立體暗面', type: 'range', min: 0, max: 1, step: 0.05 },
      { k: 'glossStyle', label: '光澤樣式', type: 'seg', options: [['both', '月牙＋點'], ['crescent', '月牙'], ['dot', '光點'], ['none', '無']] },
      { k: 'gloss', label: '光澤強度', type: 'range', min: 0, max: 1, step: 0.05 },
      { k: 'rim', label: '外框顏色', type: 'color' },
      { k: 'rimWidth', label: '外框粗細', type: 'range', min: 0, max: 16, step: 0.5 },
    ],
  },
  {
    title: '文字',
    ctls: [
      { k: 'textColor', label: '文字顏色', type: 'color' },
      { k: 'textSize', label: '字級', type: 'range', min: 40, max: 320, step: 2 },
      { k: 'weight', label: '粗細', type: 'seg', options: [['400', '標準'], ['500', '中'], ['700', '粗'], ['900', '特粗']] },
      { k: 'stroke', label: '描邊顏色', type: 'color' },
      { k: 'strokeWidth', label: '描邊粗細', type: 'range', min: 0, max: 24, step: 1 },
    ],
  },
  {
    title: '位置',
    ctls: [
      { k: 'x', label: '水滴 左右', type: 'range', min: 0, max: 1, step: 0.01 },
      { k: 'y', label: '水滴 上下', type: 'range', min: 0, max: 1, step: 0.01 },
      { k: 'tx', label: '文字 左右', type: 'range', min: 0, max: 1, step: 0.01 },
      { k: 'ty', label: '文字 上下', type: 'range', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    title: '點綴小水滴',
    ctls: [
      { k: 'sats', label: '數量', type: 'range', min: 0, max: 16, step: 1 },
      { k: 'satSize', label: '大小', type: 'range', min: 0.02, max: 0.2, step: 0.005 },
      { k: 'satSpread', label: '分散', type: 'range', min: 0, max: 1.5, step: 0.05 },
    ],
  },
  {
    title: '動態與背景',
    ctls: [
      { k: 'entrance', label: '進場', type: 'seg', options: [['pop', '彈出'], ['fade', '淡入'], ['none', '無']] },
      { k: 'breathe', label: '呼吸幅度', type: 'range', min: 0, max: 1.5, step: 0.05 },
      { k: 'speed', label: '呼吸週期（秒）', type: 'range', min: 1, max: 10, step: 0.5 },
      { k: 'loop', label: '循環長度（秒）', type: 'range', min: 2, max: 15, step: 0.5 },
    ],
  },
];

const PRESETS: { name: string; o: Partial<DropOpts>; lines?: string[] }[] = [
  { name: '藍色果凍', o: { shape: 'cloud', lobes: 4, amp: 0.11, color: '#a6d4f2', color2: '#5b9bd5', alpha: 0.8, rim: '#ffffff', rimWidth: 4, textColor: '#ffffff', layout: 'inside', size: 0.62, x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, sats: 3, satSpread: 0.25, bg: 'transparent' } },
  { name: '純圓水珠', o: { shape: 'circle', color: '#d9f1ff', color2: '#8cc7ee', alpha: 0.8, glossStyle: 'both', gloss: 0.9, rimWidth: 5, size: 0.58, sats: 0, textColor: '#ffffff', layout: 'inside', tx: 0.5, ty: 0.5, x: 0.5, y: 0.5 } },
  { name: '文字旁點綴', o: { layout: 'beside', size: 0, sats: 8, satSize: 0.08, satSpread: 0.5, textColor: '#2f6fae', strokeWidth: 0, tx: 0.5, ty: 0.5, shape: 'circle', color: '#cdebfb', color2: '#86c1ea' } },
  { name: '上方水滴', o: { layout: 'above', size: 0.34, x: 0.5, y: 0.38, tx: 0.5, ty: 0.62, textColor: '#2f6fae', sats: 2, satSpread: 0.3 } },
  { name: '薄荷', o: { color: '#d8fbe9', color2: '#6fd3a5', rim: '#ffffff', textColor: '#ffffff', stroke: '#2e9e6c', strokeWidth: 6 } },
  { name: '珊瑚', o: { color: '#ffe0d6', color2: '#ff8a6b', rim: '#ffffff', textColor: '#ffffff', stroke: '#d6553a', strokeWidth: 6 } },
];

const RATIO_PX: Record<DropOpts['ratio'], [number, number]> = { '9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080] };

export const initStudio = (deps: StudioDeps) => {
  const dlg = document.querySelector<HTMLDialogElement>('#studio')!;
  const cv = dlg.querySelector<HTMLCanvasElement>('#stCanvas')!;
  const wrap = dlg.querySelector<HTMLElement>('#stStage')!;
  const panel = dlg.querySelector<HTMLElement>('#stPanel')!;
  const linesEl = dlg.querySelector<HTMLTextAreaElement>('#stLines')!;
  const ctx = cv.getContext('2d')!;
  const saved = deps.store.get<{ words?: string[] }>('drop', {});
  let { o, lines } = parseDrop(saved.words ?? ['好好', '~just savor', '生活', '@sats=3']);
  let t0 = performance.now();
  let raf = 0;
  let paused = false;
  let pauseAt = 0;

  const persist = () => deps.store.set('drop', { words: dropToWords(o, lines) });

  /* ───────── 控制面板 ───────── */
  const ctlHtml = (c: Ctl) => {
    const v = o[c.k] as unknown as string | number;
    if (c.type === 'range')
      return `<label class="st-row"><span>${c.label}</span><input type="range" data-k="${c.k}" min="${c.min}" max="${c.max}" step="${c.step}" value="${v}"><output>${v}</output></label>`;
    if (c.type === 'color') return `<label class="st-row"><span>${c.label}</span><input type="color" data-k="${c.k}" value="${v}"><output>${v}</output></label>`;
    return `<div class="st-row"><span>${c.label}</span><div class="seg st-seg" data-k="${c.k}">${c.options.map(([val, lab]) => `<button type="button" data-v="${val}" aria-pressed="${String(v) === val}">${lab}</button>`).join('')}</div></div>`;
  };
  const renderPanel = () => {
    panel.innerHTML =
      `<div class="st-presets">${PRESETS.map((p, i) => `<button type="button" class="btn-ghost" data-preset="${i}">${esc(p.name)}</button>`).join('')}<button type="button" class="btn-ghost" data-act="random">🎲 隨機產生</button></div>` +
      `<div class="st-row"><span>版型</span><div class="seg st-seg" data-k="layout">${[
        ['inside', '字在水滴裡'],
        ['beside', '字旁點綴'],
        ['above', '水滴在上'],
        ['below', '水滴在下'],
      ]
        .map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${o.layout === v}">${l}</button>`)
        .join('')}</div></div>` +
      GROUPS.map((g) => `<fieldset><legend>${g.title}</legend>${g.ctls.map(ctlHtml).join('')}</fieldset>`).join('') +
      `<fieldset><legend>背景</legend><div class="st-row"><span>背景</span><div class="seg st-seg" data-bg>${[
        ['transparent', '透明'],
        ['solid', '單色'],
        ['gradient', '漸層'],
      ]
        .map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${bgMode() === v}">${l}</button>`)
        .join('')}</div></div>${bgMode() !== 'transparent' ? `<label class="st-row"><span>顏色一</span><input type="color" data-bgc="0" value="${bgColors()[0]}"></label>` : ''}${bgMode() === 'gradient' ? `<label class="st-row"><span>顏色二</span><input type="color" data-bgc="1" value="${bgColors()[1]}"></label>` : ''}</fieldset>`;
  };
  const bgMode = () => (o.bg === 'transparent' ? 'transparent' : o.bg.includes(',') ? 'gradient' : 'solid');
  const bgColors = () => {
    const c = o.bg === 'transparent' ? [] : o.bg.split(',');
    return [c[0] ?? '#b9ddf1', c[1] ?? '#5f96cc'];
  };

  panel.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.dataset.bgc) {
      const c = bgColors();
      c[Number(el.dataset.bgc)] = el.value;
      o.bg = bgMode() === 'gradient' ? c.join(',') : c[0];
      return changed(false);
    }
    const k = el.dataset.k as keyof DropOpts | undefined;
    if (!k) return;
    const rec = o as unknown as Record<string, unknown>;
    rec[k] = el.type === 'range' ? parseFloat(el.value) : el.value;
    const out = el.parentElement?.querySelector('output');
    if (out) out.textContent = el.value;
    changed(false);
  });
  panel.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b) return;
    const segEl = b.closest<HTMLElement>('.st-seg');
    if (b.dataset.preset) {
      const p = PRESETS[Number(b.dataset.preset)];
      o = { ...o, ...p.o };
      if (p.lines) lines = p.lines;
    } else if (b.dataset.act === 'random') {
      const r = Math.random;
      const hue = Math.floor(r() * 360);
      o = {
        ...o,
        shape: (['cloud', 'flower', 'pebble', 'random', 'circle'] as const)[Math.floor(r() * 5)],
        seed: Math.floor(r() * 9999),
        lobes: 2 + Math.floor(r() * 6),
        amp: +(0.05 + r() * 0.2).toFixed(2),
        irregular: +(r() * 0.8).toFixed(2),
        color: `hsl(${hue} 85% 88%)`,
        color2: `hsl(${(hue + 15) % 360} 60% 62%)`,
        stroke: `hsl(${hue} 55% 40%)`,
      };
      // color input 需要 hex
      o.color = hslHex(o.color);
      o.color2 = hslHex(o.color2);
      o.stroke = hslHex(o.stroke);
    } else if (segEl?.dataset.bg !== undefined) {
      const c = bgColors();
      o.bg = b.dataset.v === 'transparent' ? 'transparent' : b.dataset.v === 'gradient' ? c.join(',') : c[0];
    } else if (segEl?.dataset.k) {
      const k = segEl.dataset.k as keyof DropOpts;
      const rec = o as unknown as Record<string, unknown>;
      const v = b.dataset.v!;
      if (k === 'layout') {
        const { o: preset } = parseDrop([`@pos=${v}`]);
        o = { ...o, layout: preset.layout, size: preset.size, x: preset.x, y: preset.y, tx: preset.tx, ty: preset.ty, sats: preset.sats, satSize: preset.satSize, satSpread: preset.satSpread };
      } else rec[k] = typeof rec[k] === 'number' ? Number(v) : v;
    } else return;
    changed(true);
  });

  const hslHex = (hsl: string) => {
    const c = document.createElement('canvas').getContext('2d')!;
    c.fillStyle = hsl;
    return c.fillStyle as string;
  };

  linesEl.addEventListener('input', () => {
    lines = linesEl.value.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!lines.length) lines = ['水滴'];
    changed(false);
  });

  const changed = (rerenderPanel: boolean) => {
    if (rerenderPanel) renderPanel();
    persist();
    if (paused) draw(pauseAt);
  };

  /* ───────── 預覽 ───────── */
  const size = () => {
    wrap.dataset.ratio = o.ratio;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
    cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
  };
  const draw = (t: number) => drawDrop(ctx, cv.width, cv.height, o, lines, t);
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!paused) draw((now - t0) / 1000);
  };
  const ro = new ResizeObserver(() => {
    size();
    if (paused) draw(pauseAt);
  });

  dlg.querySelector('#stRatio')!.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b) return;
    o.ratio = b.dataset.v as DropOpts['ratio'];
    dlg.querySelectorAll('#stRatio button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    requestAnimationFrame(size);
    persist();
  });
  dlg.querySelector('#stReplay')!.addEventListener('click', () => {
    t0 = performance.now();
    paused = false;
    setPlayLabel();
  });
  const playBtn = dlg.querySelector<HTMLButtonElement>('#stPause')!;
  const setPlayLabel = () => (playBtn.textContent = paused ? '播放' : '暫停');
  playBtn.addEventListener('click', () => {
    paused = !paused;
    if (paused) pauseAt = (performance.now() - t0) / 1000;
    else t0 = performance.now() - pauseAt * 1000;
    setPlayLabel();
  });

  /* ───────── 輸出 ───────── */
  const fontsReady = async () => {
    try {
      await preloadFonts(lines.join(''));
    } catch {
      /* 字體載入失敗時用系統字 */
    }
  };
  const offscreen = () => {
    const [W, H] = RATIO_PX[o.ratio];
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    return c;
  };
  const save = (blob: Blob, name: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const stamp = () => new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  const status = dlg.querySelector<HTMLElement>('#stStatus')!;
  const busy = (msg: string) => {
    status.hidden = !msg;
    status.textContent = msg;
  };

  dlg.querySelector('#stPng')!.addEventListener('click', async () => {
    await fontsReady();
    const c = offscreen();
    drawDrop(c.getContext('2d')!, c.width, c.height, { ...o, entrance: 'none' }, lines, 2);
    c.toBlob((b) => b && save(b, `drop-${stamp()}.png`), 'image/png');
    deps.toast('已輸出透明 PNG');
  });

  dlg.querySelector('#stWebm')!.addEventListener('click', async () => {
    const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
    if (!mime) return deps.toast('這個瀏覽器不支援錄製 WebM，請改用 Chrome 或輸出 PNG 序列');
    await fontsReady();
    const c = offscreen();
    const cx = c.getContext('2d')!;
    const stream = c.captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12_000_000 });
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      save(new Blob(chunks, { type: 'video/webm' }), `drop-${stamp()}.webm`);
      busy('');
      deps.toast('已輸出 WebM（Chrome 錄製時保留透明背景）');
    };
    const dur = o.loop * 1000;
    const start = performance.now();
    rec.start();
    const tick = (now: number) => {
      const e = now - start;
      drawDrop(cx, c.width, c.height, o, lines, e / 1000);
      busy(`錄製中⋯ ${Math.min(100, Math.round((e / dur) * 100))}%`);
      if (e < dur) requestAnimationFrame(tick);
      else rec.stop();
    };
    requestAnimationFrame(tick);
  });

  dlg.querySelector('#stSeq')!.addEventListener('click', async () => {
    await fontsReady();
    const c = offscreen();
    const cx = c.getContext('2d')!;
    const fps = 30;
    const n = Math.round(o.loop * fps);
    const files: { name: string; data: Uint8Array }[] = [];
    for (let i = 0; i < n; i++) {
      drawDrop(cx, c.width, c.height, o, lines, i / fps);
      const b = await new Promise<Blob>((r) => c.toBlob((x) => r(x!), 'image/png'));
      files.push({ name: `drop_${String(i).padStart(4, '0')}.png`, data: new Uint8Array(await b.arrayBuffer()) });
      if (i % 5 === 0) busy(`輸出 PNG 序列⋯ ${i + 1}/${n}`);
    }
    save(zip(files), `drop-${stamp()}-${fps}fps.zip`);
    busy('');
    deps.toast(`已輸出 ${n} 張透明 PNG（${fps}fps）`);
  });

  dlg.querySelector('#stCopyWords')!.addEventListener('click', () => deps.copy(dropToWords(o, lines).join('\n'), '已複製設定，可貼到特效文字或給 AI'));
  dlg.querySelector('#stCombo')!.addEventListener('click', () => deps.addScene({ effect: 'crisp-drop', words: dropToWords(o, lines), seconds: o.loop, ratio: o.ratio }));

  /* ───────── 預設（與 AI 來回修改） ───────── */
  const bar = presetBar(dlg.querySelector<HTMLElement>('#stPreset')!, {
    kind: 'drop',
    getData: () => ({ words: dropToWords(o, lines) }),
    onLoad: (p) => applyWords((p.data as { words: string[] }).words ?? []),
    toast: deps.toast,
    copy: deps.copy,
    store: deps.store,
  });
  const applyWords = (words: string[]) => {
    ({ o, lines } = parseDrop(words));
    persist();
    open();
  };

  /* ───────── 開關 ───────── */
  const open = () => {
    if (!dlg.open) dlg.showModal();
    document.body.style.overflow = 'hidden';
    linesEl.value = lines.join('\n');
    dlg.querySelectorAll('#stRatio button').forEach((x) => x.setAttribute('aria-pressed', String((x as HTMLElement).dataset.v === o.ratio)));
    renderPanel();
    requestAnimationFrame(() => {
      size();
      ro.observe(wrap);
      t0 = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    });
  };
  dlg.addEventListener('close', () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    document.body.style.overflow = '';
    const u = new URL(location.href);
    if (u.searchParams.get('view') === 'drop' || u.searchParams.has('edit')) {
      u.searchParams.delete('view');
      u.searchParams.delete('edit');
      u.searchParams.delete('d');
      history.replaceState({}, '', u.pathname + u.search);
    }
  });
  dlg.querySelector('#stClose')!.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());
  if (new URLSearchParams(location.search).get('view') === 'drop') open();
  return {
    open,
    load: (words: string[]) => {
      bar.set();
      applyWords(words);
    },
    /** 載入預設或 AI 產生的設定；有 id 時「存回」會更新同一個代碼 */
    loadPreset: (p: Pick<Preset, 'id' | 'name' | 'data'>) => {
      bar.set(p);
      applyWords((p.data as { words: string[] }).words ?? []);
    },
  };
};
