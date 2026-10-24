import { isCosmicFx, cosmicFromWords } from './cosmos';
import { isNatureFx, natureMode, natureFromWords } from './nature';
import { isTransportFx, transportMode, transportFromWords } from './transport';
import { isIllustrationFx, illustrationMode, illustrationFromWords } from './illustration';
import './styles.css';
import { CATEGORIES, EFFECTS, NUM, PALETTES, SECTIONS, secOf } from './data';
import { mount, setSpeed, toneVars, type Mounted } from './engine';
import { buildPrompt, exportHtml, PROMPT_MODES, type PromptMode, type Ratio } from './prompts';
import type { Fx, Palette, SecId, Tone } from './types';
import { KITS, MOOD_PREVIEW, PICKS, TEXT_TAGS, USES } from './uses';
import { FACE_IDS, FACES, FONT_IDS, FONT_PACKS, NUM_FONT_CSS, preloadFace, preloadFonts, WEIGHT_IDS, WEIGHTS } from './fonts';

// 數字字型（Anton）在任何特效掛載前就先註冊，工作室的畫布才用得到
document.head.insertAdjacentHTML('beforeend', `<style id="ma-num-font">${NUM_FONT_CSS}</style>`);
preloadFonts();
import { esc } from './util';
import { initCombos } from './combo-ui';
import { isPhotoFx, photoSceneFromWords, type PModule } from './photokit';
import { isPlanFx, planFxMode, planSceneFromWords } from './plankit';
import { isObjFx, objFxModule, objSceneFromWords, OBJ_MODULES, type OModule, type OScene } from './objkit';
import { comboHtml, findEffect } from './combo';
import { sceneFromWords } from './effects/map';
import { decodeJson, unpackJson, type Preset, type PresetData } from './presets';

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
const SEC_IDS = SECTIONS.map((x) => x.id);
const urlSec = new URLSearchParams(location.search).get('ws') as SecId | null;
const state = {
  sec: (urlSec && SEC_IDS.includes(urlSec) ? urlSec : store.get<SecId>('sec', 'text')) as SecId,
  q: '',
  /** 第一層分組：文字區為用途，其他區為分類 */
  cat: 'all' as string,
  /** 文字區的第二層「風格」（原技法分類） */
  style: '',
  moodOpen: false,
  tag: '' as string,
  favOnly: false,
  sort: 'num' as 'num' | 'no' | 'name' | 'shuffle',
  text: store.get('text', ''),
  pal: store.get('pal', 'leicht'),
  font: (() => {
    const f = store.get('font', 'sharp');
    return FONT_IDS.includes(f as never) ? f : 'sharp';
  })(),
  /** 字體選擇器：'' ＝跟字型組合 */
  face: (() => {
    const f = store.get('face', '');
    return FACE_IDS.includes(f as never) ? f : '';
  })(),
  /** 字重：'' ＝跟特效原設計 */
  weight: (() => {
    const w = store.get('weight', '');
    return WEIGHT_IDS.includes(w as never) ? w : '';
  })(),
  custom: store.get<string | null>('custom', null),
  // 記憶體 4 GB 以下的裝置預設「滑過才播」，少同時跑一堆動畫
  play: store.get<PlayMode>('play', reduced || ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4 ? 'hover' : 'auto'),
  favs: new Set<string>(store.get<string[]>('favs', [])),
};
let shuffleSeed = Math.random();

const faceOpts = () => ({ face: state.face || undefined, weight: state.weight || undefined });
const palette = (): Palette => {
  const base = PALETTES.find((p) => p.id === state.pal) ?? PALETTES[0];
  return state.custom ? { ...base, accent: state.custom } : base;
};
const wordsFor = (fx: Fx): string[] => {
  const t = state.text.trim();
  if (!t) return fx.sample;
  // 圖表與路網的內容是數據：預覽文字只換標題
  if (fx.id.startsWith('chart-')) {
    const i = fx.sample.findIndex((x) => !/^[@~]/.test(x));
    return fx.sample.map((x, k) => (k === i ? t : x));
  }
  if (fx.id.startsWith('transit-')) return [`@title ${t}`, ...fx.sample.filter((x) => !x.startsWith('@title'))];
  // 數據地圖只換標題，其他地圖招式的格式各自不同，預覽時維持範例
  if (['mx-choro', 'mx-bubble', 'mx-bars'].includes(fx.id)) return [`@title ${t}`, ...fx.sample.filter((x) => !x.startsWith('@title'))];
  if (fx.id.startsWith('mx-')) return fx.sample;
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
    const u = USES.find((x) => x.id === f.use);
    return [f.id, norm([f.zh, f.en, f.id, f.desc, f.tags.join(' '), (f.kw ?? []).join(' '), c.zh, c.code, u?.zh ?? '', f.motion, f.sample.join(' ')].join(' '))];
  }),
);

/** 關鍵字是否命中（不看工作區與分類），用來提示其他工作區的結果 */
const matchQ = (f: Fx, terms: string[]) => {
  const h = haystack.get(f.id)!;
  const n = NUM.get(f.id)!;
  return terms.every((t) => h.includes(t) || t.replace('#', '') === String(n) || t.replace('#', '') === pad(n));
};
const filtered = (): Fx[] => {
  const terms = norm(state.q).split(' ').filter(Boolean);
  let list = EFFECTS.filter((f) => {
    if (secOf(f) !== state.sec) return false;
    if (state.cat !== 'all' && !groups().find((g) => g.id === state.cat)?.has(f)) return false;
    if (state.style && f.cat !== state.style) return false;
    if (state.tag && !f.tags.includes(state.tag)) return false;
    if (state.favOnly && !state.favs.has(f.id)) return false;
    if (!terms.length) return true;
    return matchQ(f, terms);
  });
  if (state.sort === 'name') list = [...list].sort((a, b) => a.zh.localeCompare(b.zh, 'zh-Hant'));
  if (state.sort === 'no') list = [...list].sort((a, b) => a.no - b.no);
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

// 有對話框（特效詳情、工作室、Combo）打開時，背後的卡片全部卸載，關掉再重新掛上
let gridPaused = false;
const renderSlot = (s: Slot) => {
  s.m?.stop();
  s.m = undefined;
  if (!s.visible || gridPaused) return;
  const vars = toneVars(palette(), s.fx.tone, state.font, faceOpts());
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
new MutationObserver(() => {
  const open = !!document.querySelector('dialog[open]');
  if (open === gridPaused) return;
  gridPaused = open;
  if (open) {
    slots.forEach((s) => { s.m?.stop(); s.m = undefined; });
    heroPause();
  } else {
    refreshAll();
    heroWake();
  }
}).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });

/* ───────── 工作區 ───────── */
const CHART_PROMPT = `請用 Motion Atlas 的圖表特效（圖表工作區，特效代碼 chart-*）幫我做一段數據動畫。

想表達的重點：（例如「這區房價五年漲了多少」）
圖表類型：（直條、折線、圓餅、排名、瀑布……不確定就請你挑）
數據：（貼上表格或數字，並附上資料來源與時間）
比例：9:16 或 16:9

做法：用 search_effects 找 chart- 開頭的特效、get_effect 看 word_hint 的資料格式，把數據寫成「標籤 數值」一行一筆，用 compose_combo 預覽給我看。數字只能用我提供、可查證的資料，副標註明來源與時間。`;
const EXPLAIN_PROMPT = `請幫我做一支新的「圖解動畫」，收進 Motion Atlas（repo：lhliu/motion）的圖解動畫工作區。

內容：（描述要講的工法／剖面／流程，並附上草圖或參考截圖）
要換的文字：（標題、副標、各部位名稱）

做法：
1. 參考 src/effects/diagram.ts 現有的「樓板剖面層疊」「同層排水剖面」，用同樣的寫法新增一筆 Fx（cat: 'diagram'）：canvas 繪製、9:16 版面、文字從 words 讀取、run 必須自給自足。
2. 編號 no 用目前最大編號 +1（不可重用）。
3. 全部硬邊，不用陰影、模糊、光暈；數字與規格只用我提供、可查證的資料。
4. 在本機預覽確認動畫後再 commit、push。`;
const secFx = (id: SecId = state.sec) => EFFECTS.filter((f) => secOf(f) === id);
const SEC_ICON: Record<SecId, string> = {
  text: '<svg viewBox="0 0 24 24"><path d="M4 6V4h16v2M12 4v16M9 20h6"/></svg>',
  cut: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 5 7 19M17 5l-3 14"/></svg>',
  ui: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M7 9h6M7 12h9"/></svg>',
  photo: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-8 8"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
  object: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M5.5 9.5c3 2 10 2 13 0M8 4.5l1.5 2M16 19.5l-1.5-2"/></svg>',
  illus: '<svg viewBox="0 0 24 24"><path d="M4 20c2-1 3-3 3-5 0-2 2-3 3.5-2S12 16 10 18c-1.5 1.5-4 2-6 2z"/><path d="M10.5 13 19 4.5a1.8 1.8 0 0 1 2.5 2.5L13 15.5"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  plan: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h9V3M12 12v9M16 12h5"/></svg>',
  explain: '<svg viewBox="0 0 24 24"><path d="M3 8l9-4 9 4-9 4z"/><path d="M3 12l9 4 9-4M3 16l9 4 9-4"/></svg>',
};
const KITS_ICON = '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/></svg>';
const SEC_HERO: Record<SecId, { small: string; big: string; lede: string; wb: string; ph: string; hero: string[] }> = {
  text: {
    small: '影片用得到的',
    big: '文字動態',
    lede: '字卡、標題、字幕條、轉場文字，一次收齊。每一招都是<strong>即時渲染</strong>的真實動畫——輸入你的文字、換上你的配色，再把對應的<strong>提示詞</strong>或<strong>原始碼</strong>帶走，套用在自己的字卡上。',
    wb: '預覽文字',
    ph: '輸入你的文字，全部卡片即時套用；多個詞用 / 分隔',
    hero: ['punch-zoom', 'text-tunnel', 'split-flap', 'neon-flicker', 'particle-form', 'glitch-slices', 'text-cube', 'diagonal-bands', 'synthwave', 'long-shadow'],
  },
  cut: {
    small: '段落之間換個場',
    big: '轉場',
    lede: '色塊推擠、形狀擦除、開門、翻頁、閃白、甩鏡、故障……每一招都是<strong>完整一次換場</strong>：蓋過畫面、再露出下一段標題。可直接放進 <strong>Combo</strong> 當段落之間的過場，也能輸出素材疊在剪接點上。',
    wb: '下一段標題',
    ph: '輸入下一段標題，全部卡片即時套用；前一個詞 / 下一個詞用 / 分隔',
    hero: ['cut-color-push', 'cut-door-open', 'cut-shape-wipe', 'cut-whip', 'cut-page-flip', 'cut-glitch', 'cut-flash'],
  },
  ui: {
    small: '短影音常用的疊加介面',
    big: '元件',
    lede: '留言回覆、通知橫幅、搜尋框、片尾推薦卡、通勤碼錶、優缺點、日照方位……介面都是<strong>中性示意</strong>，不放任何平台標誌。數字、評分、進度請用<strong>自己查證或實測的資料</strong>，資料來源條可以一起疊上。',
    wb: '預覽文字',
    ph: '輸入文字，全部卡片即時套用；多個欄位用 / 分隔，格式見各招的建議',
    hero: ['ui-comment-reply', 'estate-commute', 'ui-search', 'estate-proscons', 'hook-endscreen', 'estate-sun', 'ui-notify', 'estate-rating', 'hook-teaser', 'estate-elevator'],
  },
  photo: {
    small: '照片放進來就會動',
    big: '圖片運鏡',
    lede: '推拉、甩入、3D 卡片、前後對比、宮格、手機框、定格標註……每一招都是<strong>固定模組</strong>：在圖片工作室放入照片、拖曳微調，存成<strong>預設</strong>，AI 在你電腦上渲染時直接套用同一套運鏡。',
    wb: '預覽字幕',
    ph: '輸入字幕，全部卡片即時套用',
    hero: [],
  },
  map: {
    small: '把位置講清楚',
    big: '地圖區位',
    lede: '基地框、路名、資訊卡、通勤路線、生活圈……在<strong>地圖工作室</strong>上傳自己的底圖、拖曳擺放，輸出<strong>透明素材</strong>疊進影片，或存成預設讓 AI 沿用。',
    wb: '預覽文字',
    ph: '輸入地點或標題，全部卡片即時套用；多個詞用 / 分隔',
    hero: [],
  },
  object: {
    small: '一系列可調的主角物件',
    big: '物件特效',
    lede: '水滴、魔術方塊、星空宇宙……形狀、材質、顏色都能調，邊緣全部<strong>硬邊零模糊</strong>，背景可透明直接<strong>疊進影片</strong>，文字可放在物件上或下方。',
    wb: '預覽文字',
    ph: '輸入標題，全部卡片即時套用；一行一句用 / 分隔',
    hero: ['obj-cube-plastic', 'obj-cosmos-galaxy', 'crisp-drop', 'obj-cube-metal', 'obj-cosmos-stars', 'obj-cosmos-warp'],
  },
  illus: {
    small: '精修插畫主角',
    big: '插畫',
    lede: '星空物件、俯瞰、天空物件、海洋世界……每一招都是<strong>精修插畫</strong>，主角、背景、配色都有<strong>專屬編輯</strong>，背景可透明直接疊進影片。',
    wb: '預覽文字',
    ph: '輸入標題，全部卡片即時套用',
    hero: ['cosmos-illustrated-orbit','cosmos-illustrated-flyover','cosmos-illustrated-earthzoom','meteor-illustrated','aerial-illustrated-city','aerial-illustrated-grass','whale-illustrated', 'vehicle-illustrated-plane', 'ocean-illustrated-shark', 'vehicle-illustrated-ship', 'ocean-illustrated-fish'],
  },
  chart: {
    small: '一行一筆數據就會動',
    big: '圖表特效',
    lede: '直條、折線、圓餅、排名、瀑布、雷達……20 種圖表都是<strong>即時渲染</strong>的動畫：在卡片上直接改「標籤 數值」，或把數據交給 AI 用 <strong>MCP</strong> 組進 Combo。數字請用<strong>可查證的資料</strong>，副標註明來源與時間。',
    wb: '預覽標題',
    ph: '輸入標題，全部圖表即時套用；數據請在各卡片編輯',
    hero: ['chart-column', 'chart-line', 'chart-donut', 'chart-rank', 'chart-waterfall', 'chart-radar', 'chart-treemap', 'chart-gauge', 'chart-bubble', 'chart-funnel'],
  },
  plan: {
    small: '放建商平面圖就能動',
    big: '格局',
    lede: '戶別定位、逐間高亮、看屋動線、單房聚焦、戶型比較、立體傾斜……在<strong>格局工作室</strong>放入建商平面圖、拉框標出房間，就能做成動態；平面圖只在你的瀏覽器處理。卡片示範為<strong>虛構戶型</strong>，坪數請以建商資料或權狀為準。',
    wb: '預覽標題',
    ph: '輸入標題，全部卡片即時套用；第二行副標用 / 分隔',
    hero: ['plan-locate', 'plan-tour', 'plan-tilt', 'plan-rooms', 'plan-focus', 'plan-compare', 'plan-amenity'],
  },
  explain: {
    small: '一張剖面講清楚',
    big: '圖解動畫',
    lede: '樓板層疊、同層排水、結構工法……這區是<strong>一支一支客製</strong>的示意動畫：文字可以直接換，構圖要改就把原始碼交給 <strong>AI 改寫</strong>，改好的新圖解再收進來。',
    wb: '預覽文字',
    ph: '一行一個項目，用 / 分隔；格式見各招的建議',
    hero: [],
  },
};
const wsEl = $('#ws');
const renderWs = () => {
  wsEl.innerHTML = SECTIONS.map(
    (x) =>
      `<button type="button" data-sec="${x.id}" aria-pressed="${!kitsOn && state.sec === x.id}" title="${esc(x.desc)}">${SEC_ICON[x.id]}<span>${x.zh}</span><small>${secFx(x.id).length}</small></button>`,
  ).join('') + `<button type="button" data-kits aria-pressed="${kitsOn}" title="常見段落順序的現成 Combo，一鍵帶進草稿">${KITS_ICON}<span>套組</span><small>${KITS.length}</small></button>`;
  // 手機上分頁列可左右滑：把目前的工作區捲到看得到的位置
  const on = wsEl.querySelector<HTMLElement>('[aria-pressed="true"]');
  if (on && wsEl.scrollWidth > wsEl.clientWidth) wsEl.scrollLeft = on.offsetLeft - (wsEl.clientWidth - on.offsetWidth) / 2;
};
const renderHeroCopy = () => {
  const x = SECTIONS.find((y) => y.id === state.sec)!;
  const h = SEC_HERO[state.sec];
  $('#heroCode').textContent = x.en.toUpperCase();
  $('#heroSmall').textContent = h.small;
  $('#heroBig').textContent = h.big;
  $('#heroLede').innerHTML = h.lede;
  $('#wbLabel').textContent = h.wb;
  $<HTMLInputElement>('#userText').placeholder = h.ph;
  $('#heroStudio').textContent = { text: '看套組', cut: '看套組', ui: '看套組', photo: '打開圖片工作室', map: '打開地圖工作室', object: '打開物件編輯器', illus: '打開插畫編輯', chart: '複製「請 AI 用我的數據做圖表」的指令', plan: '打開格局工作室', explain: '複製「請 AI 做新圖解」的指令' }[state.sec];
  $('#heroCtaNote').textContent = { text: '常見段落順序的現成 Combo，換字就能用', cut: '轉場可直接放進套組的段落之間', ui: '把元件和字卡組成一支短影音', photo: '放自己的照片，拖曳微調', map: '上傳底圖，拖曳擺放', object: '魔術方塊、星空宇宙、水滴各有編輯器', illus: '先選分類：星空物件、俯瞰、天空物件或海洋世界', chart: '貼給 Claude，附上數據與來源', plan: '放入平面圖，拉框標房間', explain: '貼給 Claude Code，附上你的草圖或參考截圖' }[state.sec];
  const n = secFx().length;
  $('#statFx').textContent = String(n);
  $('#statCat').textContent = String(CATEGORIES.filter((c) => c.sec === state.sec).length);
  $('#statAll').textContent = String(EFFECTS.length);
  countUp($('#countUp'), n);
  document.title = `${x.zh}｜Motion Atlas 短影音動態素材庫`;
};
const setSec = (id: SecId, push = true) => {
  if (!SEC_IDS.includes(id)) return;
  const wasKits = kitsOn;
  if (kitsOn) showKits(false, push);
  const changed = id !== state.sec || wasKits;
  state.sec = id;
  store.set('sec', id);
  if (push) {
    const u = new URL(location.href);
    if (id === 'text') u.searchParams.delete('ws');
    else u.searchParams.set('ws', id);
    history.replaceState(history.state, '', u.pathname + u.search);
  }
  if (!changed) return;
  state.cat = 'all';
  state.tag = '';
  state.style = '';
  renderWs();
  renderHeroCopy();
  renderCats();
  renderTags();
  renderGrid();
  heroShow(0);
};
wsEl.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('[data-kits]')) {
    showKits(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-sec]');
  if (!b) return;
  setSec(b.dataset.sec as SecId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ───────── 套組（獨立分頁） ───────── */
let kitsOn = new URLSearchParams(location.search).get('ws') === 'kits';
const kitsView = $('#kitsView');
const renderKits = () => {
  kitsView.innerHTML = `<header class="kits-head"><p class="eyebrow">KITS <span>／</span> 現成 Combo</p><h1>套組</h1><p class="lede">常見影片的段落順序已經排好：預覽後一鍵帶進 Combo 草稿，把文字換成自己的內容（地名、數字請用查證過的資料），也可以逐段換特效、換字型。</p></header>
<div class="kit-grid">${KITS.map(
    (k) => `<article class="kit-card" data-kit="${k.id}">
  <div class="kit-prev" data-r="${k.combo.ratio ?? '16:9'}"><iframe loading="lazy" title="${esc(k.zh)} 預覽" sandbox="allow-scripts"></iframe></div>
  <div class="kit-body"><h3>${esc(k.zh)}</h3><p>${esc(k.desc)}</p>
  <ol>${k.combo.scenes.map((s) => `<li>${esc(findEffect(s.effect)?.zh ?? s.effect)}<small>${s.seconds ?? ''}${s.seconds ? ' 秒' : ''}</small></li>`).join('')}</ol>
  <div class="kit-ops"><span class="ma-chip">${k.combo.ratio ?? '16:9'}</span><button type="button" class="ma-btn" data-use>帶進 Combo 草稿</button></div></div>
</article>`,
  ).join('')}</div>`;
  // 每張套組預覽都是一整個 Combo 頁面：只在看得到時載入，捲走就清掉
  kitIo.disconnect();
  kitsView.querySelectorAll<HTMLElement>('.kit-card').forEach((card) => kitIo.observe(card));
};
const kitIo = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const card = e.target as HTMLElement;
      const frame = card.querySelector('iframe')!;
      const k = KITS.find((x) => x.id === card.dataset.kit);
      if (!k) continue;
      if (e.isIntersecting && !gridPaused) frame.srcdoc = comboHtml({ ...k.combo, palette: state.pal, ...(state.custom ? { accent: state.custom } : {}) }, { hud: true });
      else if (!e.isIntersecting) frame.removeAttribute('srcdoc');
    }
  },
  { rootMargin: '200px 0px' },
);
kitsView.addEventListener('click', (e) => {
  const use = (e.target as HTMLElement).closest('[data-use]');
  const card = (e.target as HTMLElement).closest<HTMLElement>('.kit-card');
  if (!use || !card) return;
  const k = KITS.find((x) => x.id === card.dataset.kit);
  if (k) combos.loadDraft(structuredClone(k.combo));
});
const showKits = (on: boolean, push = true) => {
  kitsOn = on;
  document.body.classList.toggle('kits-on', on);
  kitsView.hidden = !on;
  if (on) renderKits();
  else {
    kitIo.disconnect();
    kitsView.replaceChildren();
  }
  if (push) {
    const u = new URL(location.href);
    if (on) u.searchParams.set('ws', 'kits');
    else if (state.sec === 'text') u.searchParams.delete('ws');
    else u.searchParams.set('ws', state.sec);
    history.replaceState(history.state, '', u.pathname + u.search);
  }
  if (on) document.title = '套組｜Motion Atlas 短影音動態素材庫';
  renderWs();
};

/* ───────── 篩選列 ───────── */
const catsEl = $('#cats');
const tagsEl = $('#tags');
interface Group {
  id: string;
  code: string;
  zh: string;
  tagline: string;
  has: (f: Fx) => boolean;
}
/** 文字區依用途分組，圖片與地圖依分類 */
const groups = (): Group[] =>
  state.sec === 'text'
    ? USES.map((u) => ({ ...u, has: (f: Fx) => f.use === u.id }))
    : CATEGORIES.filter((c) => c.sec === state.sec).map((c) => ({ ...c, has: (f: Fx) => f.cat === c.id }));
const styleEl = $<HTMLSelectElement>('#styleSel');
const renderCats = () => {
  const all = secFx();
  catsEl.innerHTML =
    `<button class="cat" data-cat="all" aria-pressed="${state.cat === 'all'}">全部 <small>${all.length}</small></button>` +
    groups()
      .map((g) => `<button class="cat" data-cat="${g.id}" aria-pressed="${state.cat === g.id}" title="${esc(g.tagline)}"><code>${g.code}</code>${g.zh} <small>${all.filter(g.has).length}</small></button>`)
      .join('');
  // 第二層風格：只在文字區出現
  styleEl.hidden = state.sec !== 'text';
  if (state.sec === 'text')
    styleEl.innerHTML =
      `<option value="">所有風格</option>` +
      CATEGORIES.filter((c) => c.sec === 'text')
        .map((c) => `<option value="${c.id}"${state.style === c.id ? ' selected' : ''}>${c.zh}（${all.filter((f) => f.cat === c.id).length}）</option>`)
        .join('');
};
styleEl.addEventListener('change', () => {
  state.style = styleEl.value;
  renderGrid();
  scrollToGrid();
});
const renderTags = () => {
  const m = new Map<string, number>();
  secFx().forEach((f) => f.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
  // 文字區用固定詞彙的順序，其他區依出現次數
  const list = state.sec === 'text' ? TEXT_TAGS.filter((t) => m.has(t)) : [...m.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  tagsEl.innerHTML = list
    .slice(0, 22)
    .map((t) => `<button class="ma-tag" data-tag="${esc(t)}" aria-pressed="${state.tag === t}">#${esc(t)}</button>`)
    .join('');
};
catsEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-cat]');
  if (!b) return;
  state.cat = b.dataset.cat!;
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
  <div class="card-stage"><div class="stage"></div>${(isCosmicFx(f.id)||isIllustrationFx(f.id)||isTransportFx(f.id)||isNatureFx(f.id)) ? '<span class="ill-badge">精修插畫</span>' : ''}<span class="card-en">${esc(f.en)}</span><span class="card-tags">${f.tags.map(esc).join(' • ')}</span></div>
  <div class="card-meta"><span class="ma-num">${pad(n)}</span><div class="card-txt"><h3>${highlight(f.zh)}</h3><p>${highlight(f.desc)}</p></div>
  <button class="heart" data-fav="${f.id}" aria-pressed="${fav}" aria-label="收藏 ${esc(f.zh)}"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.4-9.3-9C1 8.4 3.2 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.8 0 6 3.9 4.3 7.5C19 16.6 12 21 12 21z"/></svg></button></div>
</article>`;
};

let currentList: Fx[] = [];
const renderGrid = () => {
  unwatchAll();
  currentList = filtered();
  $('#result').textContent = `顯示 ${currentList.length} / ${secFx().length}`;
  // 搜尋不到時，提示其他工作區的結果
  const terms = norm(state.q).split(' ').filter(Boolean);
  const other = $('#emptyOther');
  const hits = terms.length && !currentList.length ? SECTIONS.filter((x) => x.id !== state.sec).map((x) => ({ x, n: secFx(x.id).filter((f) => matchQ(f, terms)).length })).filter((h) => h.n) : [];
  other.hidden = !hits.length;
  other.innerHTML = hits.map((h) => `<button data-sec="${h.x.id}">在「${h.x.zh}」找到 ${h.n} 個</button>`).join('');
  $('#empty').hidden = currentList.length > 0;
  $('#emptyQ').textContent = state.q || (state.favOnly ? '收藏' : '條件');
  if (state.favOnly && !currentList.length && !state.q) {
    $('#empty').querySelector('.empty-big')!.textContent = '還沒有收藏，點卡片上的愛心就能收進來';
  } else {
    $('#empty').querySelector('.empty-big')!.innerHTML = `找不到「<span id="emptyQ">${esc(state.q || '這個條件')}</span>」`;
  }
  let html = '';
  if (state.sort === 'num') {
    // 文字區首頁（沒有任何篩選）：最上方放建案片常用與套組，風格氛圍先收合
    const browsing = state.sec === 'text' && state.cat === 'all' && !state.q && !state.tag && !state.style && !state.favOnly;
    if (browsing) {
      const picks = PICKS.map((id) => EFFECTS.find((f) => f.id === id)!).filter(Boolean);
      html += `<section class="sec sec-picks" id="cat-picks"><div class="sec-h"><code>PICKS</code><h2>建案片常用</h2><p>每週剪片最常用的 ${picks.length} 招</p></div>
<div class="grid">${picks.map(cardHtml).join('')}</div></section>`;
    }
    for (const g of groups()) {
      const items = currentList.filter(g.has);
      if (!items.length) continue;
      const fold = browsing && g.id === 'mood' && !state.moodOpen && items.length > MOOD_PREVIEW;
      const shown = fold ? items.slice(0, MOOD_PREVIEW) : items;
      html += `<section class="sec" id="cat-${g.id}"><div class="sec-h"><code>${g.code}</code><h2>${g.zh}</h2><p>${g.tagline}</p><span>${items.length} 招</span></div><div class="grid">${shown.map(cardHtml).join('')}</div>${fold ? `<button type="button" class="sec-more" data-more>看更多${g.zh}（還有 ${items.length - shown.length} 招）</button>` : ''}</section>`;
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
  if (t.closest('[data-more]')) {
    state.moodOpen = true;
    renderGrid();
    return;
  }
  const kit = t.closest<HTMLElement>('[data-kit]');
  if (kit) {
    const k = KITS.find((x) => x.id === kit.dataset.kit);
    if (k) combos.loadDraft(structuredClone(k.combo));
    return;
  }
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

/* 字型組合：全部卡片即時套用，加入 Combo 時一起帶入 */
const fontEl = $<HTMLSelectElement>('#fontSel');
fontEl.innerHTML = FONT_PACKS.map((f) => `<option value="${f.id}" title="${esc(f.use)}">${f.zh}</option>`).join('');
fontEl.value = state.font;
fontEl.addEventListener('change', async () => {
  state.font = fontEl.value;
  store.set('font', state.font);
  await preloadFonts(undefined, state.font);
  refreshAll();
  heroShow(heroIdx, false);
  if (detail.open) renderDetail();
});
/* 字體選擇器：黑體／明體 × 粗／中／細，所有文字特效即時套用 */
const faceEl = $<HTMLSelectElement>('#faceSel');
const weightEl = $<HTMLSelectElement>('#weightSel');
faceEl.innerHTML = `<option value="">跟字型組合</option>${FACES.map((f) => `<option value="${f.id}">${f.zh}</option>`).join('')}`;
weightEl.innerHTML = `<option value="">原字重</option>${WEIGHTS.map((w) => `<option value="${w.id}">${w.zh}（${w.w}）</option>`).join('')}`;
faceEl.value = state.face;
weightEl.value = state.weight;
const onFace = async () => {
  state.face = faceEl.value;
  state.weight = weightEl.value;
  store.set('face', state.face);
  store.set('weight', state.weight);
  await preloadFace(state.face, state.weight, state.text.trim() || undefined);
  refreshAll();
  heroShow(heroIdx, false);
  if (detail.open) renderDetail();
};
faceEl.addEventListener('change', onFace);
weightEl.addEventListener('change', onFace);
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
  const sb = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-sec]');
  if (sb) return setSec(sb.dataset.sec as SecId);
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
const heroList = () => (SEC_HERO[state.sec].hero.length ? SEC_HERO[state.sec].hero : secFx().map((f) => f.id));
const heroStage = $('#heroStage');
const heroLabel = $('#heroLabel');
const heroBar = $('#heroBar');
let heroIdx = 0;
let heroM: Mounted | undefined;
let heroTimer = 0;
const HERO_MS = 5200;
// 首屏輪播捲出畫面或有對話框時停下並卸載，回來再接著播
let heroSeen = true;
const heroIdle = () => !heroSeen || gridPaused || document.hidden;
const heroPause = () => {
  clearTimeout(heroTimer);
  heroM?.stop();
  heroM = undefined;
};
const heroWake = () => {
  if (!heroIdle() && !heroM) heroShow(heroIdx);
};
new IntersectionObserver(([e]) => {
  heroSeen = e.isIntersecting;
  if (heroIdle()) heroPause();
  else heroWake();
}).observe(heroStage);
document.addEventListener('visibilitychange', () => (heroIdle() ? heroPause() : heroWake()));
const heroShow = (i: number, advance = true) => {
  const list = heroList();
  heroIdx = (i + list.length) % list.length;
  const fx = EFFECTS.find((f) => f.id === list[heroIdx])!;
  heroM?.stop();
  heroM = undefined;
  if (heroIdle()) return clearTimeout(heroTimer);
  heroM = mount(heroStage, fx, wordsFor(fx), toneVars(palette(), fx.tone, state.font, faceOpts()));
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

const dVars = () => toneVars(palette(), d.tone || d.fx.tone, state.font, faceOpts());

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
    requestAnimationFrame(() => d.rel.push(mount(b.querySelector<HTMLElement>('.stage')!, f, wordsFor(f), toneVars(palette(), f.tone, state.font, faceOpts()))));
  });
};

const renderDetail = () => {
  const fx = d.fx;
  const c = catOf.get(fx.cat)!;
  $('#dNum').textContent = pad(NUM.get(fx.id)!);
  $('#dTitle').textContent = fx.zh;
  const u = USES.find((x) => x.id === fx.use);
  $('#dEn').textContent = u ? `${fx.en} · ${u.zh}／${c.zh}` : `${fx.en} · ${c.code} ${c.zh}`;
  $('#dDesc').textContent = fx.desc;
  $('#dMotion').textContent = fx.motion;
  $('#dHint').textContent = fx.hint ? `建議：${fx.hint}` : '';
  $('#dTags').innerHTML = `<span class="cat-pill">${c.code}</span>${fx.tags.map((t) => `<span>#${esc(t)}</span>`).join('')}${fx.run ? '<span>JS 驅動</span>' : '<span>純 CSS</span>'}`;
  $('#dFav').setAttribute('aria-pressed', String(state.favs.has(fx.id)));
  $('#dStudio').hidden = fx.cat !== 'liquid';
  $('#dMapStudio').hidden = fx.cat !== 'map';
  $('#dPhotoStudio').hidden = !isPhotoFx(fx.id);
  $('#dPlanStudio').hidden = !isPlanFx(fx.id);
  $('#dObjStudio').hidden = !isObjFx(fx.id)||isIllustrationFx(fx.id);
  $('#dIllustrationStudio').hidden = !isCosmicFx(fx.id)&&!isIllustrationFx(fx.id)&&!isTransportFx(fx.id)&&!isNatureFx(fx.id);
  dWords.closest('label')!.hidden = isCosmicFx(fx.id)||isIllustrationFx(fx.id)||isTransportFx(fx.id)||isNatureFx(fx.id);
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
  const fx = findEffect(id);
  if (!fx) return;
  d.fx = fx;
  if (fx.preferredRatio) d.ratio = fx.preferredRatio;
  else if (fx.cat === 'diagram') d.ratio = '9:16';
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
  document.title = `${SECTIONS.find((x) => x.id === state.sec)!.zh}｜Motion Atlas 短影音動態素材庫`;
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
    const lines = dWords.value
      .split('\n')
      .map((s) => s.trim());
    const w = lines.filter(Boolean);
    d.words = d.fx.cat === 'diagram' ? lines : w.length ? w : d.fx.sample;
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
    topLayer().appendChild(ta);
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
  const host = topLayer();
  if (t.parentElement !== host) host.appendChild(t);
};
const topLayer = (): HTMLElement => (detail.open ? detail : document.querySelector<HTMLDialogElement>('#studio[open]') ?? document.querySelector<HTMLDialogElement>('#mapstudio[open]') ?? document.querySelector<HTMLDialogElement>('#combos[open]') ?? document.body);

/* ───────── 鍵盤 ───────── */
document.addEventListener('keydown', (e) => {
  const tgt = e.target as HTMLElement;
  const typing = tgt.matches('input, textarea, select');
  if (e.key === '/' && !typing && !document.querySelector('dialog[open]')) {
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

/* ───────── Combo ───────── */
const combos = initCombos({
  toast,
  copy,
  openDetail,
  openStudio: (effect, words, note) => {
    // 由預設產生的段落：沿用原代碼，存回時更新同一個預設
    const m = note?.match(/預設 (p[0-9a-z]+)(?:「(.*)」)?/);
    const meta = m ? { id: m[1], name: m[2] ?? '' } : null;
    if (effect === 'map-overlay') {
      const data = sceneFromWords(words);
      return meta ? mapStudio.loadPreset({ ...meta, data }) : mapStudio.load(data);
    }
    if (isPlanFx(effect)) {
      const data = planSceneFromWords(words, planFxMode(effect));
      return meta ? planStudio.loadPreset({ ...meta, data }) : planStudio.load(data);
    }
    if (isPhotoFx(effect)) {
      const data = photoSceneFromWords(words, effect.slice(6) as PModule);
      return meta ? photoStudio.loadPreset({ ...meta, data }) : photoStudio.load(data);
    }
    if(isCosmicFx(effect)){const data=cosmicFromWords(words,effect);return meta?cosmicStudio.loadPreset({...meta,data}):cosmicStudio.load(data);}
    if(isNatureFx(effect)){const data=natureFromWords(words,effect);return meta?natureStudio.loadPreset({...meta,data}):natureStudio.load(data);}
    if(isTransportFx(effect)){const data=transportFromWords(words,effect);return meta?transportStudio.loadPreset({...meta,data}):transportStudio.load(data);}
    if (isIllustrationFx(effect)) {
      const data=illustrationFromWords(words,effect);
      return meta ? illustrationStudio.loadPreset({...meta,data}) : illustrationStudio.load(data);
    }
    if (isObjFx(effect)) {
      const data = objSceneFromWords(words, objFxModule(effect));
      return meta ? objStudio.loadPreset({ ...meta, data }) : objStudio.load(data);
    }
    return meta ? studio.loadPreset({ ...meta, data: { words } }) : studio.load(words);
  },
  palette: () => ({ id: state.pal, accent: state.custom ?? undefined }),
  store,
});
$('#dAddCombo').addEventListener('click', () => {
  const same = d.words.join('\n') === d.fx.sample.join('\n');
  combos.addScene({ effect: d.fx.id, ...(d.fx.cat === 'diagram' || d.fx.preferredRatio ? { ratio: d.ratio } : {}), ...(same ? {} : { words: [...d.words] }), ...(d.tone ? { tone: d.tone } : {}), ...(state.font !== 'sharp' ? { font: state.font } : {}), ...(state.face ? { face: state.face } : {}), ...(state.weight ? { weight: state.weight } : {}) });
});

// 工作室（編輯器）按需載入：第一次打開才下載與初始化，首頁不必先解析這些程式
type Lazy<T> = { [K in keyof T]: T[K] extends (...a: infer A) => unknown ? (...a: A) => void : never };
const lazyStudio = <T extends object>(load: () => Promise<T>): Lazy<T> & { warm: () => Promise<T> } => {
  let p: Promise<T> | undefined;
  const warm = () =>
    (p ??= load().catch((e) => {
      p = undefined;
      toast('編輯器載入失敗，請檢查網路後再試一次');
      throw e;
    }));
  return new Proxy({} as Lazy<T> & { warm: () => Promise<T> }, {
    get: (_, k) => (k === 'warm' ? warm : (...a: unknown[]) => void warm().then((m) => (m as Record<string, (...x: unknown[]) => unknown>)[k as string](...a))),
  });
};
const sdeps = { toast, copy, store, addScene: (sc: Parameters<typeof combos.addScene>[0]) => combos.addScene(sc) };
const studio = lazyStudio(() => import('./drop-studio').then((m) => m.initStudio(sdeps)));
const mapStudio = lazyStudio(() => import('./map-studio').then((m) => m.initMapStudio(sdeps)));
$('#dMapStudio').addEventListener('click', () => {
  closeDetail();
  mapStudio.open();
});
const photoStudio = lazyStudio(() => import('./photo-studio').then((m) => m.initPhotoStudio(sdeps)));
$('#dPhotoStudio').addEventListener('click', () => {
  const m = d.fx.id.slice(6) as PModule;
  closeDetail();
  photoStudio.open(m);
});
const planStudio = lazyStudio(() => import('./plan-studio').then((m) => m.initPlanStudio(sdeps)));
$('#dPlanStudio').addEventListener('click', () => {
  const mode = planFxMode(d.fx.id);
  const words = d.words;
  closeDetail();
  if (words.some((w) => w.trim().startsWith('{'))) planStudio.load(planSceneFromWords(words, mode));
  else planStudio.open(mode);
});
const cosmicStudio = lazyStudio(() => import('./cosmos-studio').then((m) => m.initCosmicStudio(sdeps)));
const natureStudio = lazyStudio(() => import('./nature-studio').then((m) => m.initNatureStudio(sdeps)));
const transportStudio = lazyStudio(() => import('./transport-studio').then((m) => m.initTransportStudio(sdeps)));
const illustrationStudio = lazyStudio(() => import('./illustration-studio').then((m) => m.initIllustrationStudio(sdeps)));
$('#dIllustrationStudio').addEventListener('click',()=>{if(isCosmicFx(d.fx.id)){const sc=cosmicFromWords(d.words,d.fx.id);sc.ratio=d.ratio;const hasSettings=d.words.some(w=>w.trim().startsWith('{'));closeDetail();if(hasSettings)cosmicStudio.load(sc);else cosmicStudio.load({...sc,...store.get('cosmic-'+sc.mode,{}),ratio:sc.ratio});return;}if(isNatureFx(d.fx.id)){const mode=natureMode(d.fx.id),words=d.words,ratio=d.ratio;closeDetail();if(words.some(w=>w.trim().startsWith('{'))){const sc=natureFromWords(words,d.fx.id);sc.ratio=ratio;natureStudio.load(sc);}else natureStudio.openMode(mode,ratio);return;}if(isTransportFx(d.fx.id)){const mode=transportMode(d.fx.id),words=d.words,ratio=d.ratio;closeDetail();if(words.some(w=>w.trim().startsWith('{'))){const sc=transportFromWords(words,d.fx.id);sc.ratio=ratio;transportStudio.load(sc);}else transportStudio.openMode(mode,ratio);return;}const mode=illustrationMode(d.fx.id),words=d.words,ratio=d.ratio;closeDetail();if(words.some(w=>w.trim().startsWith('{'))){const sc=illustrationFromWords(words,mode);sc.ratio=ratio;illustrationStudio.load(sc);}else illustrationStudio.openMode(mode,ratio);});
const objStudio = lazyStudio(() => import('./object-studio').then((m) => m.initObjectStudio(sdeps)));
// 網址直接指定工作室（?view=photo 等）時，先把工作室載進來，讓它自己判斷要不要打開
{
  const v = new URLSearchParams(location.search).get('view');
  const byView: Record<string, { warm: () => Promise<unknown> }> = { drop: studio, map: mapStudio, photo: photoStudio, plan: planStudio, object: objStudio, cosmic: cosmicStudio, cosmos: cosmicStudio, nature: natureStudio, meteor: natureStudio, aerial: natureStudio, transport: transportStudio, illustration: illustrationStudio };
  if (v && v !== 'combos') void (byView[v] ? byView[v].warm() : Promise.all(Object.values(byView).map((x) => x.warm())));
}
$('#dObjStudio').addEventListener('click', () => {
  const fx = d.fx;
  const html = fx.html(d.words);
  const m = html.match(/data-scene="([^"]+)"/);
  closeDetail();
  // 帶著這張卡的形狀、材質打開工作室
  const scene = m ? (JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')) as OScene) : undefined;
  objStudio.open(objFxModule(fx.id), scene);
});
$('#dStudio').addEventListener('click', () => {
  const words = d.fx.id === 'crisp-drop' ? d.words : ['好好', '~just savor', '生活'];
  closeDetail();
  studio.load(words);
});

/* ───────── 編輯連結：?edit=p7k2x 或 ?edit=map|drop|photo&d=… ───────── */
const openEdit = async () => {
  const q = new URLSearchParams(location.search);
  const edit = q.get('edit');
  if (!edit) return;
  const route = (p: Pick<Preset, 'id' | 'name' | 'data'> & { kind: string }) =>
    p.kind === 'cosmos' ? cosmicStudio.loadPreset(p) : p.kind === 'nature' ? natureStudio.loadPreset(p) : p.kind === 'transport' ? transportStudio.loadPreset(p) : p.kind === 'illustration' ? illustrationStudio.loadPreset(p) : p.kind === 'map' ? mapStudio.loadPreset(p) : p.kind === 'photo' ? photoStudio.loadPreset(p) : p.kind === 'object' ? objStudio.loadPreset(p) : p.kind === 'plan' ? planStudio.loadPreset(p) : studio.loadPreset(p);
  if (edit === 'map' || edit === 'drop' || edit === 'photo' || edit === 'object' || edit === 'illustration' || edit === 'plan' || edit === 'transport' || edit === 'nature' || edit === 'cosmos') {
    try {
      const z = q.get('z');
      route({ kind: edit, name: '', data: z ? await unpackJson<PresetData>(z) : decodeJson<PresetData>(q.get('d') ?? '') });
      toast('已載入 AI 產生的設定，調好後按「存成預設」');
    } catch {
      toast('編輯連結的內容無法讀取');
    }
    return;
  }
  try {
    const res = await fetch(`/api/presets/${encodeURIComponent(edit)}`);
    const j = (await res.json()) as { ok: boolean; preset?: Preset; error?: string };
    if (!j.ok || !j.preset) throw new Error(j.error ?? '找不到這個預設');
    route(j.preset);
    toast(`已載入預設 ${j.preset.id}`);
  } catch (e) {
    toast(e instanceof Error ? e.message : '讀取預設失敗');
  }
};

/* ───────── 啟動 ───────── */
applyBrand();
renderSwatches();
renderPlay();
// 直接打開某一招時，切到它所在的工作區
const initial = new URLSearchParams(location.search).get('fx');
const initialFx = initial ? findEffect(initial) : undefined;
if (initialFx) state.sec = secOf(initialFx);
renderWs();
renderHeroCopy();
renderCats();
renderTags();
updateFavCount();
renderGrid();
$('#heroStudio').addEventListener('click', () => {
  if (state.sec === 'explain') return copy(EXPLAIN_PROMPT, '已複製，貼給 Claude Code 並附上草圖');
  if (state.sec === 'chart') return copy(CHART_PROMPT, '已複製，貼給 Claude 並附上數據');
  if (state.sec === 'text' || state.sec === 'cut' || state.sec === 'ui') return showKits(true);
  if (state.sec === 'plan') return planStudio.open();
  if(state.sec==='illus'){if(state.cat==='vehicle')return transportStudio.open();if(state.cat==='ocean')return illustrationStudio.open();return natureStudio.openMode(state.cat==='aerial'?'city':'meteor');}
  if (state.sec === 'object') return state.cat === 'liquid' ? studio.open() : objStudio.open((OBJ_MODULES as string[]).includes(state.cat) ? (state.cat as OModule) : undefined);
  return state.sec === 'photo' ? photoStudio.open() : mapStudio.open();
});
// 站頂工作區列的高度會隨螢幕換行，篩選列跟著貼齊
new ResizeObserver(([e]) => document.documentElement.style.setProperty('--top-h', `${Math.round(e.borderBoxSize?.[0]?.blockSize ?? (e.target as HTMLElement).offsetHeight)}px`)).observe($('.ma-top'));
// 手機：往下捲收起站頂、往上捲叫回來
{
  let lastY = scrollY;
  addEventListener(
    'scroll',
    () => {
      const y = scrollY;
      if (Math.abs(y - lastY) < 8) return;
      document.body.classList.toggle('hide-top', y > lastY && y > 240 && matchMedia('(max-width: 720px)').matches);
      lastY = y;
    },
    { passive: true },
  );
}
const wbMore = $('#wbMore');
wbMore.addEventListener('click', () => {
  const open = wbMore.closest('.workbench')!.classList.toggle('open');
  wbMore.setAttribute('aria-expanded', String(open));
});
const startHero = () => heroShow(0);
if (document.fonts?.ready) document.fonts.ready.then(startHero);
else startHero();
openEdit();
if (kitsOn) showKits(true, false);
if (initial) openDetail(initial, false);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearTimeout(heroTimer);
  else heroShow(heroIdx + 1);
});
