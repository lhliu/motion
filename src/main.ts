import './styles.css';
import { ALL_TAGS, CATEGORIES, EFFECTS, NUM, PALETTES } from './data';
import { mount, setSpeed, toneVars, type Mounted } from './engine';
import { buildPrompt, exportHtml, PROMPT_MODES, type PromptMode, type Ratio } from './prompts';
import type { CatId, Fx, Palette, Tone } from './types';
import { esc } from './util';

/* ───────── 小工具 ───────── */
const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem('ma-' + k);
      return v == null ? d : (JSON.parse(v) as T);
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem('ma-' + k, JSON.stringify(v));
    } catch {
      /* 私密模式 */
    }
  },
};
const pad = (n: number) => String(n).padStart(2, '0');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── 狀態 ───────── */
type PlayMode = 'auto' | 'hover';
const state = {
  q: '',
  cat: 'all' as CatId | 'all',
  tag: '' as string,
  favOnly: false,
  sort: 'num' as 'num' | 'name' | 'shuffle',
  text: store.get('text', ''),
  pal: store.get('pal', 'leicht'),
  custom: store.get<string | null>('custom', null),
  play: store.get<PlayMode>('play', reduced ? 'hover' : 'auto'),
  favs: new Set<string>(store.get<string[]>('favs', [])),
};
let shuffleSeed = Math.random();

const palette = (): Palette => {
  const base = PALETTES.find((p) => p.id === state.pal) ?? PALETTES[0];
  return state.custom ? { ...base, accent: state.custom } : base;
};
const wordsFor = (fx: Fx): string[] => {
  const t = state.text.trim();
  if (!t) return fx.sample;
  return t
    .split(/\s*\/\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
};
const luminance = (hex: string) => {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return 0.5;
  const [r, g, b] = m.map((x) => parseInt(x, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const applyBrand = () => {
  const p = palette();
  const r = document.documentElement.style;
  r.setProperty('--brand', p.accent);
  r.setProperty('--brand-ink', luminance(p.accent) > 0.35 ? '#151515' : '#ffffff');
};

/* ───────── 搜尋與篩選 ───────── */
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const catOf = new Map(CATEGORIES.map((c) => [c.id, c]));
const haystack = new Map(
  EFFECTS.map((f) => {
    const c = catOf.get(f.cat)!;
    return [f.id, norm([f.zh, f.en, f.id, f.desc, f.tags.join(' '), c.zh, c.code, f.motion, f.sample.join(' ')].join(' '))];
  }),
);

const filtered = (): Fx[] => {
  const terms = norm(state.q).split(' ').filter(Boolean);
  let list = EFFECTS.filter((f) => {
    if (state.cat !== 'all' && f.cat !== state.cat) return false;
    if (state.tag && !f.tags.includes(state.tag)) return false;
    if (state.favOnly && !state.favs.has(f.id)) return false;
    if (!terms.length) return true;
    const h = haystack.get(f.id)!;
    const n = NUM.get(f.id)!;
    return terms.every((t) => h.includes(t) || t.replace('#', '') === String(n) || t.replace('#', '') === pad(n));
  });
  if (state.sort === 'name') list = [...list].sort((a, b) => a.zh.localeCompare(b.zh, 'zh-Hant'));
  if (state.sort === 'shuffle') {
    const r = (s: string) => {
      let h = shuffleSeed * 1e9;
      for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 1e9;
      return h;
    };
    list = [...list].sort((a, b) => r(a.id) - r(b.id));
  }
  return list;
};

const highlight = (text: string): string => {
  const terms = norm(state.q).split(' ').filter((t) => t.length > 0);
  let out = esc(text);
  for (const t of terms) {
    const safe = esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`(${safe})`, 'gi'), '<mark class="mark">$1</mark>');
  }
  return out;
};

/* ───────── 預覽管理 ───────── */
interface Slot {
  fx: Fx;
  host: HTMLElement;
  m?: Mounted;
  visible: boolean;
  hovered: boolean;
}
const slots = new Map<HTMLElement, Slot>();

const freeze = (root: HTMLElement) => {
  root.getAnimations({ subtree: true }).forEach((a) => {
    const t = a.effect?.getComputedTiming();
    const d = typeof t?.duration === 'number' ? t.duration : 0;
    a.pause();
    a.currentTime = (Number(t?.delay) || 0) + d * 0.42;
  });
  root.querySelectorAll('svg').forEach((s) => {
    try {
      s.pauseAnimations();
      s.setCurrentTime(1.6);
    } catch {
      /* ignore */
    }
  });
};

const renderSlot = (s: Slot) => {
  s.m?.stop();
  s.m = undefined;
  if (!s.visible) return;
  const vars = toneVars(palette(), s.fx.tone);
  s.m = mount(s.host, s.fx, wordsFor(s.fx), vars);
  if (state.play === 'hover' && !s.hovered) {
    const m = s.m;
    // 讓 JS 特效先畫幾格，再凍結成海報
    setTimeout(() => {
      if (s.m !== m) return;
      freeze(m.root);
      if (s.fx.run) {
        const keep = m.root;
        setTimeout(() => {
          if (s.m === m && !s.hovered) {
            m.stop();
            s.host.appendChild(keep);
            s.m = { root: keep, stop: () => keep.remove() };
          }
        }, 900);
      }
    }, 60);
  }
};

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const s = slots.get(e.target as HTMLElement);
      if (!s) continue;
      if (e.isIntersecting && !s.visible) {
        s.visible = true;
        renderSlot(s);
      } else if (!e.isIntersecting && s.visible) {
        s.visible = false;
        s.m?.stop();
        s.m = undefined;
      }
    }
  },
  { rootMargin: '120px 0px' },
);

const watch = (host: HTMLElement, fx: Fx) => {
  const s: Slot = { fx, host, visible: false, hovered: false };
  slots.set(host, s);
  io.observe(host);
  return s;
};
const unwatchAll = () => {
  slots.forEach((s) => {
    s.m?.stop();
    io.unobserve(s.host);
  });
  slots.clear();
};
const refreshAll = () => slots.forEach((s) => s.visible && renderSlot(s));

/* ───────── 篩選列 ───────── */
const catsEl = $('#cats');
const tagsEl = $('#tags');
const renderCats = () => {
  const counts = new Map<string, number>();
  EFFECTS.forEach((f) => counts.set(f.cat, (counts.get(f.cat) ?? 0) + 1));
  catsEl.innerHTML =
    `<button class="cat" data-cat="all" aria-pressed="${state.cat === 'all'}">全部 <small>${EFFECTS.length}</small></button>` +
    CATEGORIES.map(
      (c) =>
        `<button class="cat" data-cat="${c.id}" aria-pressed="${state.cat === c.id}"><code>${c.code}</code>${c.zh} <small>${counts.get(c.id) ?? 0}</small></button>`,
    ).join('');
};
const renderTags = () => {
  tagsEl.innerHTML = ALL_TAGS.slice(0, 22)
    .map((t) => `<button class="ma-tag" data-tag="${esc(t)}" aria-pressed="${state.tag === t}">#${esc(t)}</button>`)
    .join('');
};
catsEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-cat]');
  if (!b) return;
  state.cat = b.dataset.cat as CatId | 'all';
  renderCats();
  renderGrid();
  b.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
  scrollToGrid();
});
tagsEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tag]');
  if (!b) return;
  state.tag = state.tag === b.dataset.tag ? '' : b.dataset.tag!;
  renderTags();
  renderGrid();
  scrollToGrid();
});
const scrollToGrid = () => {
  const top = $('#grid').getBoundingClientRect().top;
  if (top < 0 || top > innerHeight * 0.6) $('#grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ───────── 卡片格 ───────── */
const gridEl = $('#grid');
const cardHtml = (f: Fx, k: number) => {
  const n = NUM.get(f.id)!;
  const fav = state.favs.has(f.id);
  return `<article class="ma-card" tabindex="0" role="button" data-id="${f.id}" style="--k:${k}" aria-label="${pad(n)} ${esc(f.zh)}：${esc(f.desc)}">
  <div class="card-stage"><div class="stage"></div><span class="card-en">${esc(f.en)}</span><span class="card-tags">${f.tags.map(esc).join(' • ')}</span></div>
  <div class="card-meta"><span class="ma-num">${pad(n)}</span><div class="card-txt"><h3>${highlight(f.zh)}</h3><p>${highlight(f.desc)}</p></div>
  <button class="heart" data-fav="${f.id}" aria-pressed="${fav}" aria-label="收藏 ${esc(f.zh)}"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-9.3-9C1 8.4 3.2 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.8 0 6 3.9 4.3 7.5C19 16.6 12 21 12 21z"/></svg></button></div>
</article>`;
};

let currentList: Fx[] = [];
const renderGrid = () => {
  unwatchAll();
  currentList = filtered();
  $('#result').textContent = `顯示 ${currentList.length} / ${EFFECTS.length}`;
  $('#empty').hidden = currentList.length > 0;
  $('#emptyQ').textContent = state.q || (state.favOnly ? '收藏' : '條件');
  if (state.favOnly && !currentList.length && !state.q) {
    $('#empty').querySelector('.empty-big')!.textContent = '還沒有收藏，點卡片上的愛心就能收進來';
  } else {
    $('#empty').querySelector('.empty-big')!.innerHTML = `找不到「<span id="emptyQ">${esc(state.q || '這個條件')}</span>」`;
  }
  let html = '';
  if (state.sort === 'num') {
    for (const c of CATEGORIES) {
      const items = currentList.filter((f) => f.cat === c.id);
      if (!items.length) continue;
      const first = NUM.get(items[0].id)!;
      const last = NUM.get(items[items.length - 1].id)!;
      html += `<section class="sec" id="cat-${c.id}"><div class="sec-h"><code>${c.code}</code><h2>${c.zh}</h2><p>${c.tagline}</p><span>${pad(first)}–${pad(last)}</span></div><div class="grid">${items.map(cardHtml).join('')}</div></section>`;
    }
  } else {
    html = `<section class="sec"><div class="grid">${currentList.map(cardHtml).join('')}</div></section>`;
  }
  gridEl.innerHTML = html;
  gridEl.querySelectorAll<HTMLElement>('.ma-card').forEach((card) => {
    const fx = EFFECTS.find((f) => f.id === card.dataset.id)!;
    const s = watch(card.querySelector<HTMLElement>('.stage')!, fx);
    card.addEventListener('pointerenter', () => {
      s.hovered = true;
      if (state.play === 'hover') renderSlot(s);
    });
    card.addEventListener('pointerleave', () => {
      s.hovered = false;
      if (state.play === 'hover') renderSlot(s);
    });
  });
};

gridEl.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const fav = t.closest<HTMLButtonElement>('[data-fav]');
  if (fav) {
    e.stopPropagation();
    toggleFav(fav.dataset.fav!, fav);
    return;
  }
  const card = t.closest<HTMLElement>('.ma-card');
  if (card) openDetail(card.dataset.id!);
});
gridEl.addEventListener('keydown', (e) => {
  const card = (e.target as HTMLElement).closest<HTMLElement>('.ma-card');
  if (card && (e.key === 'Enter' || e.key === ' ') && e.target === card) {
    e.preventDefault();
    openDetail(card.dataset.id!);
  }
});

/* ───────── 收藏 ───────── */
const favBtn = $('#favBtn');
const updateFavCount = () => {
  $('#favN').textContent = String(state.favs.size);
  favBtn.setAttribute('aria-pressed', String(state.favOnly));
};
const toggleFav = (id: string, btn?: HTMLElement) => {
  if (state.favs.has(id)) state.favs.delete(id);
  else state.favs.add(id);
  store.set('favs', [...state.favs]);
  const on = state.favs.has(id);
  document.querySelectorAll(`[data-fav="${id}"]`).forEach((b) => b.setAttribute('aria-pressed', String(on)));
  if (btn) {
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
  }
  updateFavCount();
  toast(on ? '已加入收藏' : '已移除收藏');
  if (state.favOnly && !on) renderGrid();
};
favBtn.addEventListener('click', () => {
  state.favOnly = !state.favOnly;
  updateFavCount();
  renderGrid();
  scrollToGrid();
});

/* ───────── 工作台 ───────── */
const userText = $<HTMLInputElement>('#userText');
const clearText = $('#clearText');
userText.value = state.text;
clearText.hidden = !state.text;
let textTimer = 0;
userText.addEventListener('input', () => {
  clearTimeout(textTimer);
  clearText.hidden = !userText.value;
  textTimer = window.setTimeout(() => {
    state.text = userText.value;
    store.set('text', state.text);
    refreshAll();
    heroShow(heroIdx, false);
  }, 220);
});
clearText.addEventListener('click', () => {
  userText.value = '';
  userText.dispatchEvent(new Event('input'));
  userText.focus();
});

const swEl = $('#swatches');
const renderSwatches = () => {
  swEl.innerHTML = PALETTES.map(
    (p) =>
      `<button class="sw" role="radio" data-pal="${p.id}" aria-checked="${!state.custom && state.pal === p.id}" title="${p.name}" aria-label="${p.name}" style="--a:${p.accent};--k:${p.ink}"></button>`,
  ).join('');
};
swEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-pal]');
  if (!b) return;
  state.pal = b.dataset.pal!;
  state.custom = null;
  store.set('pal', state.pal);
  store.set('custom', null);
  onPaletteChange();
});
const customColor = $<HTMLInputElement>('#customColor');
customColor.value = state.custom ?? palette().accent;
customColor.addEventListener('input', () => {
  state.custom = customColor.value;
  store.set('custom', state.custom);
  onPaletteChange();
});
const onPaletteChange = () => {
  renderSwatches();
  applyBrand();
  refreshAll();
  heroShow(heroIdx, false);
  if (detail.open) renderDetail();
};

const playEl = $('#playMode');
const renderPlay = () => playEl.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state.play)));
playEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!b) return;
  state.play = b.dataset.v as PlayMode;
  store.set('play', state.play);
  renderPlay();
  refreshAll();
});

/* ───────── 搜尋、排序 ───────── */
const qEl = $<HTMLInputElement>('#q');
let qTimer = 0;
qEl.addEventListener('input', () => {
  clearTimeout(qTimer);
  qTimer = window.setTimeout(() => {
    state.q = qEl.value;
    renderGrid();
    if (state.q) scrollToGrid();
  }, 160);
});
$('#empty').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-q]');
  if (!b) return;
  state.cat = 'all';
  state.tag = '';
  state.favOnly = false;
  qEl.value = b.dataset.q!;
  state.q = qEl.value;
  renderCats();
  renderTags();
  updateFavCount();
  renderGrid();
});
const sortEl = $<HTMLSelectElement>('#sort');
sortEl.addEventListener('change', () => {
  state.sort = sortEl.value as typeof state.sort;
  shuffleSeed = Math.random();
  renderGrid();
});
$('#randomBtn').addEventListener('click', () => {
  const pool = currentList.length ? currentList : EFFECTS;
  openDetail(pool[Math.floor(Math.random() * pool.length)].id);
});

/* ───────── 主題 ───────── */
$('#themeBtn').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  store.set('theme', next);
  try {
    localStorage.setItem('ma-theme', next);
  } catch {
    /* ignore */
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#111110' : '#f3efe6');
});

/* ───────── Hero 輪播 ───────── */
const HERO = ['punch-zoom', 'text-tunnel', 'split-flap', 'neon-flicker', 'particle-form', 'glitch-slices', 'text-cube', 'diagonal-bands', 'synthwave', 'long-shadow'];
const heroStage = $('#heroStage');
const heroLabel = $('#heroLabel');
const heroBar = $('#heroBar');
let heroIdx = 0;
let heroM: Mounted | undefined;
let heroTimer = 0;
const HERO_MS = 5200;
const heroShow = (i: number, advance = true) => {
  heroIdx = (i + HERO.length) % HERO.length;
  const fx = EFFECTS.find((f) => f.id === HERO[heroIdx])!;
  heroM?.stop();
  heroM = mount(heroStage, fx, wordsFor(fx), toneVars(palette(), fx.tone));
  heroLabel.textContent = `${pad(NUM.get(fx.id)!)} ${fx.zh} ${fx.en}`;
  heroLabel.dataset.id = fx.id;
  if (!advance) return;
  heroBar.getAnimations().forEach((a) => a.cancel());
  heroBar.animate([{ width: '0%' }, { width: '100%' }], { duration: HERO_MS, easing: 'linear' });
  clearTimeout(heroTimer);
  heroTimer = window.setTimeout(() => heroShow(heroIdx + 1), HERO_MS);
};
heroLabel.addEventListener('click', () => openDetail(heroLabel.dataset.id!));
$('.hs-frame').addEventListener('click', () => openDetail(heroLabel.dataset.id!));
$('.hs-frame').style.cursor = 'pointer';

const countUp = (el: HTMLElement, to: number, ms = 1400) => {
  if (reduced) {
    el.textContent = String(to);
    return;
  }
  const t0 = performance.now();
  const f = (now: number) => {
    const p = Math.min(1, (now - t0) / ms);
    el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
};

/* ───────── 詳細頁 ───────── */
const detail = $<HTMLDialogElement>('#detail');
const dStage = $('#dStage');
const dWrap = $('#dStageWrap');
const dWords = $<HTMLTextAreaElement>('#dWords');
const dPrompt = $('#dPrompt');
const d = {
  fx: EFFECTS[0],
  words: [] as string[],
  ratio: '16:9' as Ratio,
  tone: '' as Tone | '',
  speed: 1,
  mode: store.get<PromptMode>('mode', 'web'),
  m: undefined as Mounted | undefined,
  rel: [] as Mounted[],
};

const dVars = () => toneVars(palette(), d.tone || d.fx.tone);

const renderStage = () => {
  d.m?.stop();
  dWrap.dataset.ratio = d.ratio;
  d.m = mount(dStage, d.fx, d.words, dVars(), d.speed);
};

const renderPrompt = () => {
  const text = buildPrompt(d.fx, d.mode, d.words, dVars(), d.ratio);
  dPrompt.textContent = text;
  dPrompt.classList.toggle('code', d.mode === 'code');
  $('#dTabs')
    .querySelectorAll('.ma-tab')
    .forEach((b) => b.setAttribute('aria-selected', String((b as HTMLElement).dataset.mode === d.mode)));
  $('#dTabHint').textContent = PROMPT_MODES.find((m) => m.id === d.mode)!.hint;
  $('#dCopy').querySelector('span')!.textContent = d.mode === 'code' ? '複製原始碼' : '複製提示詞';
};

const renderRelated = () => {
  d.rel.forEach((m) => m.stop());
  d.rel = [];
  const same = EFFECTS.filter((f) => f.cat === d.fx.cat && f.id !== d.fx.id);
  const i = EFFECTS.indexOf(d.fx);
  const pick = same.sort((a, b) => Math.abs(EFFECTS.indexOf(a) - i) - Math.abs(EFFECTS.indexOf(b) - i)).slice(0, 4);
  const rel = $('#dRel');
  rel.innerHTML = pick
    .map((f) => `<button data-id="${f.id}"><span class="rs"><span class="stage"></span></span><span><small>${pad(NUM.get(f.id)!)}</small>${esc(f.zh)}</span></button>`)
    .join('');
  rel.querySelectorAll<HTMLElement>('button').forEach((b, k) => {
    const f = pick[k];
    requestAnimationFrame(() => d.rel.push(mount(b.querySelector<HTMLElement>('.stage')!, f, wordsFor(f), toneVars(palette(), f.tone))));
  });
};

const renderDetail = () => {
  const fx = d.fx;
  const c = catOf.get(fx.cat)!;
  $('#dNum').textContent = pad(NUM.get(fx.id)!);
  $('#dTitle').textContent = fx.zh;
  $('#dEn').textContent = `${fx.en} · ${c.code} ${c.zh}`;
  $('#dDesc').textContent = fx.desc;
  $('#dMotion').textContent = fx.motion;
  $('#dHint').textContent = fx.hint ? `建議：${fx.hint}` : '';
  $('#dTags').innerHTML = `<span class="cat-pill">${c.code}</span>${fx.tags.map((t) => `<span>#${esc(t)}</span>`).join('')}${fx.run ? '<span>JS 驅動</span>' : '<span>純 CSS</span>'}`;
  $('#dFav').setAttribute('aria-pressed', String(state.favs.has(fx.id)));
  if (document.activeElement !== dWords) dWords.value = d.words.join('\n');
  syncSegs();
  renderStage();
  renderPrompt();
};

const syncSegs = () => {
  const set = (id: string, v: string) => $(id).querySelectorAll<HTMLElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  set('#dRatio', d.ratio);
  set('#dTone', d.tone);
  set('#dSpeed', String(d.speed));
};

const openDetail = (id: string, push = true) => {
  const fx = EFFECTS.find((f) => f.id === id);
  if (!fx) return;
  d.fx = fx;
  d.words = wordsFor(fx);
  d.tone = '';
  dWords.value = d.words.join('\n');
  if (!detail.open) {
    detail.showModal();
    document.body.style.overflow = 'hidden';
  }
  renderDetail();
  renderRelated();
  $('.d-right').scrollTop = 0;
  const url = `${location.pathname}?fx=${fx.id}`;
  if (push) history[location.search.includes('fx=') ? 'replaceState' : 'pushState']({ fx: fx.id }, '', url);
  document.title = `${pad(NUM.get(fx.id)!)} ${fx.zh} ${fx.en}｜Motion Atlas`;
};

const closeDetail = () => {
  if (detail.open) detail.close();
};
detail.addEventListener('close', () => {
  d.m?.stop();
  d.rel.forEach((m) => m.stop());
  d.rel = [];
  document.body.style.overflow = '';
  if (location.search.includes('fx=')) history.pushState({}, '', location.pathname);
  document.title = 'Motion Atlas｜字卡與文字特效圖鑑';
  const card = gridEl.querySelector<HTMLElement>(`.ma-card[data-id="${d.fx.id}"]`);
  card?.focus({ preventScroll: true });
});
detail.addEventListener('click', (e) => {
  if (e.target === detail) closeDetail();
});
$('#dClose').addEventListener('click', closeDetail);

const step = (dir: number) => {
  const list = currentList.includes(d.fx) ? currentList : EFFECTS;
  const i = list.indexOf(d.fx);
  openDetail(list[(i + dir + list.length) % list.length].id);
};
$('#dPrev').addEventListener('click', () => step(-1));
$('#dNext').addEventListener('click', () => step(1));
$('#dFav').addEventListener('click', () => toggleFav(d.fx.id, $('#dFav')));
$('#dShare').addEventListener('click', () => copy(`${location.origin}/?fx=${d.fx.id}`, '已複製這一招的連結'));
$('#dReplay').addEventListener('click', renderStage);
$('#dFull').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else dWrap.requestFullscreen?.().then(() => setTimeout(renderStage, 120));
});
document.addEventListener('fullscreenchange', () => detail.open && setTimeout(renderStage, 120));

const segHandler = (id: string, fn: (v: string) => void) =>
  $(id).addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b) return;
    fn(b.dataset.v!);
    syncSegs();
  });
segHandler('#dRatio', (v) => {
  d.ratio = v as Ratio;
  renderStage();
  renderPrompt();
});
segHandler('#dTone', (v) => {
  d.tone = v as Tone | '';
  renderStage();
  renderPrompt();
});
segHandler('#dSpeed', (v) => {
  d.speed = parseFloat(v);
  if (d.m) setSpeed(d.m.root, d.speed);
});

let wTimer = 0;
dWords.addEventListener('input', () => {
  clearTimeout(wTimer);
  wTimer = window.setTimeout(() => {
    const w = dWords.value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    d.words = w.length ? w : d.fx.sample;
    renderStage();
    renderPrompt();
  }, 250);
});

$('#dTabs').innerHTML = PROMPT_MODES.map((m) => `<button class="ma-tab" role="tab" data-mode="${m.id}">${m.label}</button>`).join('');
$('#dTabs').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-mode]');
  if (!b) return;
  d.mode = b.dataset.mode as PromptMode;
  store.set('mode', d.mode);
  renderPrompt();
});
$('#dCopy').addEventListener('click', () => {
  const btn = $('#dCopy');
  copy(dPrompt.textContent ?? '', d.mode === 'code' ? '已複製原始碼' : '已複製提示詞').then(() => {
    btn.classList.add('ok');
    const s = btn.querySelector('span')!;
    const prev = s.textContent;
    s.textContent = '已複製 ✓';
    setTimeout(() => {
      btn.classList.remove('ok');
      s.textContent = prev;
    }, 1400);
  });
});
$('#dDownload').addEventListener('click', () => {
  const html = exportHtml(d.fx, d.words, dVars(), d.ratio);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  a.download = `motion-${pad(NUM.get(d.fx.id)!)}-${d.fx.id}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('已下載 HTML，雙擊即可播放');
});
$('#dRel').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-id]');
  if (b) openDetail(b.dataset.id!);
});

/* ───────── 複製、提示 ───────── */
const copy = async (text: string, msg: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    (detail.open ? detail : document.body).appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast(msg);
};
let toastTimer = 0;
const toast = (msg: string) => {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('on'), 1800);
  if (detail.open && t.parentElement !== detail) detail.appendChild(t);
  if (!detail.open && t.parentElement !== document.body) document.body.appendChild(t);
};

/* ───────── 鍵盤 ───────── */
document.addEventListener('keydown', (e) => {
  const tgt = e.target as HTMLElement;
  const typing = tgt.matches('input, textarea, select');
  if (e.key === '/' && !typing && !detail.open) {
    e.preventDefault();
    qEl.focus();
    qEl.select();
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (detail.open) closeDetail();
    qEl.focus();
    return;
  }
  if (e.key === 'Escape' && typing && tgt === qEl) {
    qEl.value = '';
    qEl.dispatchEvent(new Event('input'));
    qEl.blur();
  }
  if (!detail.open || typing) return;
  if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === 'ArrowRight') step(1);
  else if (e.key.toLowerCase() === 'f') toggleFav(d.fx.id, $('#dFav'));
  else if (e.key.toLowerCase() === 'r') renderStage();
});

window.addEventListener('popstate', () => {
  const id = new URLSearchParams(location.search).get('fx');
  if (id) openDetail(id, false);
  else closeDetail();
});

/* ───────── 啟動 ───────── */
applyBrand();
renderSwatches();
renderPlay();
renderCats();
renderTags();
updateFavCount();
renderGrid();
$('#statFx').textContent = String(EFFECTS.length);
$('#statCat').textContent = String(CATEGORIES.length);
countUp($('#countUp'), EFFECTS.length);
countUp($('#statFx'), EFFECTS.length);
const startHero = () => heroShow(0);
if (document.fonts?.ready) document.fonts.ready.then(startHero);
else startHero();
const initial = new URLSearchParams(location.search).get('fx');
if (initial) openDetail(initial, false);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearTimeout(heroTimer);
  else heroShow(heroIdx + 1);
});
