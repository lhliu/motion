import { ALL_TAGS, CATEGORIES, EFFECTS, NUM, PALETTES } from '../../src/data';
import { comboOutline, comboPrompt, comboHtml, encodeCombo, findEffect, normalizeCombo, totalSeconds, type Combo } from '../../src/combo';
import { loopSeconds, toneVars } from '../../src/engine';
import { buildPrompt, type PromptMode, type Ratio } from '../../src/prompts';
import type { Fx } from '../../src/types';
import type { Env } from './env';
import { deleteCombo, getCombo, listCombos, saveCombo } from './store';

export interface ToolCtx {
  env: Env;
  request: Request;
  origin: string;
}

type Args = Record<string, unknown>;
export interface ToolDef {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, boolean>;
  write?: boolean;
  run: (args: Args, ctx: ToolCtx) => Promise<unknown>;
}

const summary = (f: Fx) => ({
  id: f.id,
  number: NUM.get(f.id),
  zh: f.zh,
  en: f.en,
  category: f.cat,
  description: f.desc,
  tags: f.tags,
  sample_words: f.sample,
  word_hint: f.hint ?? null,
  default_tone: f.tone,
  loop_seconds: loopSeconds(f),
  needs_js: !!f.run,
});

const norm = (s: string) => s.toLowerCase().trim();
const score = (f: Fx, terms: string[]) => {
  const cat = CATEGORIES.find((c) => c.id === f.cat)!;
  const fields: [string, number][] = [
    [f.zh, 6],
    [f.en, 5],
    [f.id, 5],
    [f.tags.join(' '), 4],
    [f.desc, 3],
    [`${cat.zh} ${cat.code} ${cat.tagline}`, 2],
    [f.motion, 1],
    [f.motionEn, 1],
  ];
  let s = 0;
  for (const t of terms) {
    let hit = 0;
    for (const [txt, w] of fields) if (norm(txt).includes(t)) hit = Math.max(hit, w);
    // 中文長詞拆兩字再比一次，提高模糊命中
    if (!hit && /[一-鿿]{3,}/.test(t))
      for (let i = 0; i < t.length - 1; i++) for (const [txt, w] of fields) if (norm(txt).includes(t.slice(i, i + 2))) hit = Math.max(hit, w / 3);
    s += hit;
  }
  return s;
};

const linkFor = (origin: string, c: Combo) => (c.id ? `${origin}/c/${c.id}` : `${origin}/?combo=${encodeCombo(c)}`);

const comboView = (c: Combo, origin: string, withHtml = false) => ({
  id: c.id ?? null,
  title: c.title,
  brief: c.brief ?? null,
  tags: c.tags ?? [],
  ratio: c.ratio,
  palette: c.palette,
  accent: c.accent ?? null,
  transition: c.transition,
  total_seconds: totalSeconds(c),
  scenes: c.scenes,
  outline: comboOutline(c),
  notes: c.notes ?? null,
  play_url: linkFor(origin, c),
  created_at: c.created_at ?? null,
  updated_at: c.updated_at ?? null,
  ...(withHtml ? { html: comboHtml(c) } : {}),
});

const comboInput = {
  title: { type: 'string', description: 'Combo 名稱，例如「建案開箱片頭」' },
  brief: { type: 'string', description: '原始需求或用途說明（之後搜尋用）' },
  scenes: {
    type: 'array',
    minItems: 1,
    maxItems: 20,
    description: '依播放順序排列的段落',
    items: {
      type: 'object',
      required: ['effect'],
      properties: {
        effect: { type: 'string', description: '特效 id（用 search_effects 查），也接受編號' },
        words: { type: 'array', items: { type: 'string' }, description: '這段的文字；多個詞代表輪播或分行，格式依特效的 word_hint' },
        seconds: { type: 'number', description: '這段播放秒數，預設依特效循環長度（2.4–6 秒）' },
        tone: { type: 'string', enum: ['ink', 'paper', 'accent'], description: '底色：深、淺、主色；省略用特效預設' },
        note: { type: 'string', description: '這段的用意或剪輯備註' },
      },
    },
  },
  palette: { type: 'string', enum: PALETTES.map((p) => p.id), description: '配色組，預設 leicht（光寓橘）' },
  accent: { type: 'string', description: '自訂主色 #RRGGBB，會覆蓋配色組的主色' },
  ratio: { type: 'string', enum: ['16:9', '9:16', '1:1'], description: '影片比例，Shorts 用 9:16' },
  transition: { type: 'string', enum: ['cut', 'fade', 'slide', 'zoom'], description: '段落轉場，預設 fade' },
  tags: { type: 'array', items: { type: 'string' }, description: '分類標籤，例如 片頭、建案、Shorts' },
  notes: { type: 'string', description: '給未來參考的備註' },
};

export const TOOLS: ToolDef[] = [
  {
    name: 'list_categories',
    title: '列出分類與配色',
    description: '列出 Motion Atlas 的 12 個特效分類、常用情境標籤與可用配色。第一次使用時先呼叫，了解有哪些選擇。',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    run: async () => ({
      total_effects: EFFECTS.length,
      categories: CATEGORIES.map((c) => ({ ...c, count: EFFECTS.filter((f) => f.cat === c.id).length })),
      tags: ALL_TAGS,
      palettes: PALETTES,
      tones: { ink: '深色底', paper: '淺色底', accent: '主色底' },
    }),
  },
  {
    name: 'search_effects',
    title: '搜尋文字特效',
    description:
      '依關鍵字、分類或情境標籤搜尋文字動態特效，回傳 id、說明、建議字數與預設文字。關鍵字可用中文或英文，例如「轉場」「數字」「霓虹」「Shorts 字幕」。組 Combo 前用它挑選每一段的特效。',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '關鍵字，空白分隔多個詞' },
        category: { type: 'string', enum: CATEGORIES.map((c) => c.id) },
        tag: { type: 'string', description: '情境標籤，例如 轉場、片頭、數據' },
        limit: { type: 'number', description: '最多回傳幾筆，預設 20' },
      },
    },
    annotations: { readOnlyHint: true },
    run: async (a) => {
      const terms = norm(String(a.query ?? ''))
        .split(/\s+/)
        .filter(Boolean);
      let list = EFFECTS.filter((f) => (!a.category || f.cat === a.category) && (!a.tag || f.tags.includes(String(a.tag).replace(/^#/, ''))));
      if (terms.length)
        list = list
          .map((f) => ({ f, s: score(f, terms) }))
          .filter((x) => x.s > 0)
          .sort((x, y) => y.s - x.s)
          .map((x) => x.f);
      const limit = Math.min(113, Math.max(1, Number(a.limit) || 20));
      return { count: list.length, effects: list.slice(0, limit).map(summary) };
    },
  },
  {
    name: 'get_effect',
    title: '取得特效細節與提示詞',
    description:
      '取得單一特效的完整資訊：動態拆解、可直接貼給 AI 的提示詞，或可獨立播放的 HTML 原始碼。可以帶入自訂文字、配色與比例。',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: '特效 id 或編號' },
        words: { type: 'array', items: { type: 'string' } },
        palette: { type: 'string', enum: PALETTES.map((p) => p.id) },
        accent: { type: 'string', description: '#RRGGBB' },
        tone: { type: 'string', enum: ['ink', 'paper', 'accent'] },
        ratio: { type: 'string', enum: ['16:9', '9:16', '1:1'] },
        format: { type: 'string', enum: ['web', 'en', 'video', 'code'], description: 'web 中文網頁提示詞、en 英文、video AI 影片提示詞、code HTML 原始碼；預設 web' },
      },
    },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const fx = findEffect(String(a.id ?? ''));
      if (!fx) throw new Error(`找不到特效「${String(a.id)}」，請用 search_effects 查詢`);
      const base = PALETTES.find((p) => p.id === a.palette) ?? PALETTES[0];
      const pal = typeof a.accent === 'string' && /^#[0-9a-f]{6}$/i.test(a.accent) ? { ...base, accent: a.accent } : base;
      const words = Array.isArray(a.words) && a.words.length ? a.words.map(String) : fx.sample;
      const tone = ['ink', 'paper', 'accent'].includes(String(a.tone)) ? (a.tone as Fx['tone']) : fx.tone;
      const ratio = (['16:9', '9:16', '1:1'].includes(String(a.ratio)) ? a.ratio : '16:9') as Ratio;
      const format = (['web', 'en', 'video', 'code'].includes(String(a.format)) ? a.format : 'web') as PromptMode;
      return {
        ...summary(fx),
        motion_zh: fx.motion,
        motion_en: fx.motionEn,
        page_url: `${ctx.origin}/?fx=${fx.id}`,
        format,
        output: buildPrompt(fx, format, words, toneVars(pal, tone), ratio),
      };
    },
  },
  {
    name: 'compose_combo',
    title: '組合 Combo（預覽，不儲存）',
    description:
      '把多個特效依序組成一段 Combo 動畫並驗證。回傳分鏡摘要、總秒數、可直接在瀏覽器播放的預覽連結。確認使用者滿意後，再用 save_combo 存進 Combo 庫。建議流程：理解需求 → search_effects 挑選 → compose_combo 預覽 → 依回饋調整 → save_combo。',
    inputSchema: {
      type: 'object',
      required: ['title', 'scenes'],
      properties: { ...comboInput, include_html: { type: 'boolean', description: '是否一併回傳完整 HTML，預設 false' }, include_prompt: { type: 'boolean', description: '是否回傳可貼給 AI 重做的提示詞，預設 true' } },
    },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const { combo, errors } = normalizeCombo(a);
      if (errors.length) return { ok: false, errors };
      return {
        ok: true,
        saved: false,
        ...comboView(combo, ctx.origin, a.include_html === true),
        ...(a.include_prompt === false ? {} : { prompt: comboPrompt(combo) }),
        next: '請把 play_url 給使用者預覽；滿意後呼叫 save_combo 儲存。',
      };
    },
  },
  {
    name: 'save_combo',
    title: '儲存 Combo',
    description: '把 Combo 存進 Combo 庫（Cloudflare D1），之後可在網站的 Combo 庫瀏覽、播放與複製。帶 id 代表更新既有的 Combo。需要寫入金鑰。',
    inputSchema: { type: 'object', required: ['title', 'scenes'], properties: { id: { type: 'string', description: '要更新的 Combo id；省略則新增' }, ...comboInput } },
    annotations: { readOnlyHint: false, destructiveHint: false },
    write: true,
    run: async (a, ctx) => {
      const { combo, errors } = normalizeCombo({ ...a, source: a.source ?? 'mcp' });
      if (errors.length) return { ok: false, errors };
      const saved = await saveCombo(ctx.env, combo, typeof a.id === 'string' && a.id ? a.id : undefined);
      return { ok: true, saved: true, ...comboView(saved, ctx.origin), library_url: `${ctx.origin}/?view=combos` };
    },
  },
  {
    name: 'list_combos',
    title: '列出 Combo 庫',
    description: '搜尋已儲存的 Combo，當作新需求的參考。可依關鍵字或標籤篩選。',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' }, tag: { type: 'string' }, limit: { type: 'number', description: '預設 30' } },
    },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const list = await listCombos(ctx.env, String(a.query ?? ''), String(a.tag ?? '').replace(/^#/, ''), Number(a.limit) || 30);
      return {
        count: list.length,
        combos: list.map((c) => ({ id: c.id, title: c.title, brief: c.brief ?? null, tags: c.tags ?? [], scenes: c.scenes.length, total_seconds: totalSeconds(c), play_url: linkFor(ctx.origin, c), updated_at: c.updated_at })),
      };
    },
  },
  {
    name: 'get_combo',
    title: '取得 Combo',
    description: '取得一個已儲存 Combo 的完整分鏡、提示詞，以及（選擇性）可獨立播放的 HTML。',
    inputSchema: { type: 'object', required: ['id'], properties: { id: { type: 'string' }, include_html: { type: 'boolean' } } },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const c = await getCombo(ctx.env, String(a.id));
      if (!c) throw new Error(`找不到 Combo ${String(a.id)}`);
      return { ...comboView(c, ctx.origin, a.include_html === true), prompt: comboPrompt(c) };
    },
  },
  {
    name: 'delete_combo',
    title: '刪除 Combo',
    description: '從 Combo 庫永久刪除一個 Combo。刪除前請先向使用者確認。需要寫入金鑰。',
    inputSchema: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    annotations: { readOnlyHint: false, destructiveHint: true },
    write: true,
    run: async (a, ctx) => {
      const ok = await deleteCombo(ctx.env, String(a.id));
      return ok ? { ok: true, deleted: a.id } : { ok: false, error: `找不到 Combo ${String(a.id)}` };
    },
  },
];

export const INSTRUCTIONS = `Motion Atlas（motion.leichthub.com）是 ${EFFECTS.length} 種文字動態特效的圖鑑，所有特效都是原生 HTML/CSS/JS。
你可以：查特效（search_effects / get_effect）、把多個特效組成 Combo 動畫（compose_combo），並存進 Combo 庫（save_combo）當作日後參考（list_combos / get_combo）。

組 Combo 的建議流程：
1. 先釐清用途、比例（YouTube 16:9、Shorts 9:16）、總長度與要出現的文字。
2. 用 search_effects 依每段的目的挑特效，留意 word_hint 的文字格式。
3. 用 compose_combo 預覽，把 play_url 給使用者看。
4. 依回饋調整後，用 save_combo 儲存，並附上 tags 與 brief 方便日後搜尋。
銳利水滴（crisp-drop）可在 words 加入設定行，例如 "@shape=circle;color=#a6d4f2;color2=#5b9bd5;pos=beside;sats=6"：shape＝circle｜cloud｜flower｜pebble｜random，pos＝inside｜beside｜above｜below，seed 改變隨機形狀，x/y、tx/ty 為 0–1 的水滴與文字位置；~ 開頭的行是英文小字。此特效完全不用模糊，適合疊進影片。
寫入工具需要金鑰；文字內容若涉及價格或數據，請使用使用者提供、可查證的資料，不要自行編造。`;

export const isWriteTool = (name: string) => TOOLS.find((t) => t.name === name)?.write === true;
