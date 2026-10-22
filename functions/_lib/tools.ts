import { ALL_TAGS, CATEGORIES, EFFECTS, NUM, PALETTES, SECTIONS, secOf } from '../../src/data';
import { comboOutline, comboPrompt, comboHtml, encodeCombo, findEffect, normalizeCombo, totalSeconds, type Combo } from '../../src/combo';
import { loopSeconds, toneVars } from '../../src/engine';
import { buildPrompt, type PromptMode, type Ratio } from '../../src/prompts';
import type { Fx } from '../../src/types';
import { buildMapScene, type MapSceneInput } from '../../src/mapkit';
import { dropToWords, parseDrop, type DropOpts } from '../../src/drop';
import { KITS, USES } from '../../src/uses';
import { MODULE_INFO, normalizePhotoScene, PARAMS, photoFxId, PHOTO_MODULES, type PModule, type PScene } from '../../src/photokit';
import type { Env } from './env';
import { deleteCombo, getCombo, getPreset, listCombos, listPresets, saveCombo, savePreset } from './store';
import { checkPresetData, editUrl, KIND_NAME, presetToScene, sceneToPresetData, type PresetKind } from '../../src/presets';

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
  section: secOf(f),
  use: f.use ?? null,
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
    [(f.kw ?? []).join(' '), 3],
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
  scene_edit_urls: c.scenes.map((sc, i) => {
    const pd = sceneToPresetData(sc.effect, sc.words ?? []);
    const pid = sc.note?.match(/預設 (p[0-9a-z]+)/)?.[1];
    return pd ? { scene: i + 1, effect: sc.effect, preset: pid ?? null, edit_url: pid ? `${origin}/?edit=${pid}` : editUrl(origin, pd) } : null;
  }).filter(Boolean),
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
      properties: {
        preset: { type: 'string', description: '預設代碼（例如 p7k2x）；給了就不必再給 effect 與 words，會使用使用者在網站上調好的版本' },
        images: { type: 'array', items: { type: 'string' }, description: '搭配圖片運鏡預設：換成這次要用的圖片網址' },
        effect: { type: 'string', description: '特效 id（用 search_effects 查），也接受編號；與 preset 二選一' },
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


/** 把 scenes 裡的 { preset } 換成實際段落；回傳錯誤清單 */
const resolvePresets = async (a: Args, env: Env): Promise<string[]> => {
  if (!Array.isArray(a.scenes)) return [];
  const errors: string[] = [];
  a.scenes = await Promise.all(
    (a.scenes as Record<string, unknown>[]).map(async (sc, i) => {
      if (!sc || typeof sc !== 'object' || !sc.preset) return sc;
      const p = await getPreset(env, String(sc.preset));
      if (!p) {
        errors.push(`scenes[${i}].preset「${String(sc.preset)}」不存在，請用 list_presets 查`);
        return sc;
      }
      const base = presetToScene(p, Array.isArray(sc.images) ? { images: (sc.images as unknown[]).map(String) } : {});
      return { ...base, ...(sc.seconds ? { seconds: sc.seconds } : {}), ...(sc.note ? { note: sc.note } : { note: base.note }) };
    }),
  );
  return errors;
};

export const TOOLS: ToolDef[] = [
  {
    name: 'list_categories',
    title: '列出分類與配色',
    description: `列出 Motion Atlas 的三個工作區（文字特效、圖片運鏡、地圖區位）、${CATEGORIES.length} 個分類（共 ${EFFECTS.length} 招）、常用情境標籤與可用配色。第一次使用時先呼叫，了解有哪些選擇。`,
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    run: async () => ({
      total_effects: EFFECTS.length,
      sections: SECTIONS.map((x) => ({ ...x, count: EFFECTS.filter((f) => secOf(f) === x.id).length, categories: CATEGORIES.filter((c) => c.sec === x.id).map((c) => c.id) })),
      text_uses: USES.map((u) => ({ ...u, count: EFFECTS.filter((f) => f.use === u.id).length })),
      categories: CATEGORIES.map((c) => ({ ...c, count: EFFECTS.filter((f) => f.cat === c.id).length })),
      kits: KITS.map((k) => ({ id: k.id, name: k.zh, flow: k.desc, ratio: k.combo.ratio, scenes: k.combo.scenes })),
      tags: ALL_TAGS,
      palettes: PALETTES,
      tones: { ink: '深色底', paper: '淺色底', accent: '主色底' },
    }),
  },
  {
    name: 'search_effects',
    title: '搜尋特效',
    description:
      '依關鍵字、工作區、分類或情境標籤搜尋特效（文字、圖片運鏡、地圖），回傳 id、說明、建議字數與預設文字。關鍵字可用中文或英文，例如「轉場」「數字」「霓虹」「Shorts 字幕」。組 Combo 前用它挑選每一段的特效。',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '關鍵字，空白分隔多個詞' },
        section: { type: 'string', enum: SECTIONS.map((x) => x.id), description: 'text＝文字特效、photo＝圖片運鏡、map＝地圖區位' },
        use: { type: 'string', enum: USES.map((u) => u.id), description: `文字特效的用途：${USES.map((u) => `${u.id}＝${u.zh}`).join('、')}` },
        category: { type: 'string', enum: CATEGORIES.map((c) => c.id), description: '技法分類（文字區的「風格」）' },
        tag: { type: 'string', description: '情境標籤，例如 轉場、片頭、數據' },
        limit: { type: 'number', description: '最多回傳幾筆，預設 20' },
      },
    },
    annotations: { readOnlyHint: true },
    run: async (a) => {
      const terms = norm(String(a.query ?? ''))
        .split(/\s+/)
        .filter(Boolean);
      let list = EFFECTS.filter((f) => (!a.section || secOf(f) === a.section) && (!a.use || f.use === a.use) && (!a.category || f.cat === a.category) && (!a.tag || f.tags.includes(String(a.tag).replace(/^#/, ''))));
      if (terms.length)
        list = list
          .map((f) => ({ f, s: score(f, terms) }))
          .filter((x) => x.s > 0)
          .sort((x, y) => y.s - x.s)
          .map((x) => x.f);
      const limit = Math.min(200, Math.max(1, Number(a.limit) || 20));
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
    name: 'build_map_scene',
    title: '組地圖場景',
    description:
      '依頻道既有的地圖片段樣式組出「地圖疊加場景」（標題籤、基地框、基地標籤、道路名、資訊卡或數據卡、字幕、底圖出處），回傳可放進 Combo 的 combo_scene 與預覽連結。aerial 範本＝鳥瞰正射影像風（黃色基地框＋資訊卡）；street 範本＝街道圖風（橘色基地範圍＋定位針＋三欄數據卡）。座標皆為 0–1 的畫面比例。數字與面積請用使用者提供、可查證的資料。',
    inputSchema: {
      type: 'object',
      properties: {
        template: { type: 'string', enum: ['aerial', 'street', 'blank'], description: '預設 aerial' },
        ratio: { type: 'string', enum: ['9:16', '16:9', '1:1'], description: '預設 9:16' },
        duration: { type: 'number', description: '整段秒數，預設 6' },
        tag: { type: 'string', description: '左上標題籤，例如「區域｜案名」；空字串＝移除' },
        legend: { type: 'string', description: '圖例文字（aerial），例如「紅線：公有土地地籍界線」' },
        site_label: { type: 'string', description: '基地標籤文字' },
        site_color: { type: 'string', description: '基地框與標籤顏色 #RRGGBB' },
        roads: {
          type: 'array',
          description: '道路名；沒給 x/y 時依序放在基地的上、下、左、右（左右會直排）',
          items: { type: 'object', required: ['text'], properties: { text: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' }, vertical: { type: 'boolean' }, light: { type: 'boolean', description: 'true＝白底黑字' } } },
        },
        info_lines: { type: 'array', items: { type: 'string' }, description: '資訊卡每行一句，* 開頭用強調色（黃）' },
        stat: {
          type: 'object',
          description: '數據卡（street 範本預設有）',
          properties: { title: { type: 'string' }, subtitle: { type: 'string' }, items: { type: 'array', items: { type: 'string' }, description: '「標籤|數字|單位|附註」，最多 4 欄' } },
        },
        subtitle: { type: 'string', description: '字幕；空字串＝移除' },
        credit: { type: 'string', description: '底圖出處' },
        handle: { type: 'string', description: '頻道署名；空字串＝移除' },
        bg_url: { type: 'string', description: '底圖圖片網址（選填）；沒有時預覽會用風格化底圖，正式使用建議在網站地圖工作室上傳自己的底圖' },
        bg_dim: { type: 'number', description: '底圖調暗 0–0.7' },
        elements: { type: 'array', items: { type: 'object' }, description: '進階：額外元件 {type: tag|road|site|label|pin|info|stat|compass|text, x, y, text, lines, color, fg, size, delay, pts}' },
        title: { type: 'string', description: '預覽用名稱' },
      },
    },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const sc = buildMapScene(a as MapSceneInput);
      const scene = { effect: 'map-overlay', words: [JSON.stringify(sc)], seconds: sc.loop + 1 };
      const { combo } = normalizeCombo({ title: String(a.title ?? '地圖場景預覽'), ratio: sc.ratio, transition: 'cut', scenes: [scene] });
      return {
        combo_scene: scene,
        elements: sc.els.map((e) => ({ type: e.type, role: e.role ?? null, text: e.text ?? null, lines: e.lines ?? null, x: +e.x.toFixed(3), y: +e.y.toFixed(3), delay: e.delay })),
        preview_url: `${ctx.origin}/?combo=${encodeCombo(combo)}`,
        edit_url: editUrl(ctx.origin, { kind: 'map', data: sc }),
        ratio: sc.ratio,
        next: `把 combo_scene 原封不動放進 compose_combo 或 save_combo 的 scenes，並把 ratio 設為 ${sc.ratio}，否則元件位置會跑掉；要微調位置可請使用者到網站的地圖工作室（/?view=map）調整後再加入 Combo。`,
      };
    },
  },
  {
    name: 'build_drop_scene',
    title: '組水滴場景',
    description:
      '產生「銳利水滴」段落（邊緣零模糊，適合疊進影片）：可指定形狀、顏色、光澤、外框、文字版型與位置、點綴小水滴。回傳可放進 Combo 的 combo_scene 與預覽連結。',
    inputSchema: {
      type: 'object',
      required: ['lines'],
      properties: {
        lines: { type: 'array', items: { type: 'string' }, description: '文字，一行一句；~ 開頭為字距寬的英文小字' },
        layout: { type: 'string', enum: ['inside', 'beside', 'above', 'below'], description: '字在水滴裡｜字旁點綴小水滴｜水滴在上｜水滴在下' },
        shape: { type: 'string', enum: ['circle', 'cloud', 'flower', 'pebble', 'random'] },
        seed: { type: 'number', description: '隨機形狀的種子，同一個數字形狀相同' },
        size: { type: 'number', description: '主水滴大小 0–0.95（佔短邊比例），0＝不畫主水滴' },
        color: { type: 'string', description: '水滴上方顏色 #RRGGBB' },
        color2: { type: 'string', description: '水滴下方顏色 #RRGGBB' },
        alpha: { type: 'number', description: '透明度 0.1–1' },
        gloss: { type: 'number', description: '光澤 0–1' },
        gloss_style: { type: 'string', enum: ['both', 'crescent', 'dot', 'none'] },
        rim: { type: 'string', description: '外框顏色' },
        rim_width: { type: 'number', description: '外框粗細 0–16' },
        text_color: { type: 'string' },
        text_size: { type: 'number', description: '字級（以短邊 1080 為基準），預設 150' },
        stroke: { type: 'string', description: '文字描邊顏色' },
        stroke_width: { type: 'number' },
        x: { type: 'number' },
        y: { type: 'number' },
        tx: { type: 'number', description: '文字中心 0–1' },
        ty: { type: 'number' },
        sats: { type: 'number', description: '點綴小水滴數量 0–16' },
        sat_size: { type: 'number' },
        sat_spread: { type: 'number' },
        bg: { type: 'string', description: 'transparent（預設）、#hex，或 #hex,#hex 漸層' },
        duration: { type: 'number', description: '秒數，預設 6' },
        title: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const lines = Array.isArray(a.lines) ? a.lines.map(String).filter(Boolean).slice(0, 6) : ['水滴'];
      const { o } = parseDrop(a.layout ? [`@pos=${String(a.layout)}`] : []);
      const map: Record<string, keyof DropOpts> = { shape: 'shape', seed: 'seed', size: 'size', color: 'color', color2: 'color2', alpha: 'alpha', gloss: 'gloss', gloss_style: 'glossStyle', rim: 'rim', rim_width: 'rimWidth', text_color: 'textColor', text_size: 'textSize', stroke: 'stroke', stroke_width: 'strokeWidth', x: 'x', y: 'y', tx: 'tx', ty: 'ty', sats: 'sats', sat_size: 'satSize', sat_spread: 'satSpread', bg: 'bg', duration: 'loop' };
      const rec = o as unknown as Record<string, unknown>;
      for (const [k, key] of Object.entries(map)) if (a[k] !== undefined && a[k] !== null) rec[key] = typeof rec[key] === 'number' ? Number(a[k]) : String(a[k]);
      const words = dropToWords(o, lines);
      const scene = { effect: 'crisp-drop', words, seconds: o.loop };
      const { combo } = normalizeCombo({ title: String(a.title ?? '水滴預覽'), ratio: '9:16', transition: 'cut', scenes: [scene] });
      return { combo_scene: scene, ratio: '9:16', preview_url: `${ctx.origin}/?combo=${encodeCombo(combo)}`, edit_url: editUrl(ctx.origin, { kind: 'drop', data: { words } }), next: '把 combo_scene 放進 compose_combo 或 save_combo 的 scenes；水滴以短邊為基準，9:16、16:9 都能用。' };
    },
  },
  {
    name: 'build_photo_scene',
    title: '組圖片運鏡',
    description: `把照片做成固定的運鏡模組（參數化，可存成預設重複使用）。模組：${PHOTO_MODULES.map((m) => `${m}＝${MODULE_INFO[m].zh}（${MODULE_INFO[m].desc}；圖片：${MODULE_INFO[m].names.join('、')}）`).join('；')}。回傳 combo_scene、預覽與編輯連結、各參數說明，以及在本機逐格渲染的方法。圖片通常在使用者電腦上：預覽時可留空（顯示示意圖），本機渲染時再放入。`,
    inputSchema: {
      type: 'object',
      required: ['module'],
      properties: {
        module: { type: 'string', enum: PHOTO_MODULES },
        ratio: { type: 'string', enum: ['9:16', '16:9', '1:1'], description: '預設 9:16' },
        duration: { type: 'number', description: '動畫秒數，預設 6' },
        images: { type: 'array', items: { type: 'string' }, description: '圖片網址或本機相對路徑，依模組的插槽順序（見說明）；留空＝示意圖' },
        params: { type: 'object', description: '模組參數，見回傳的 params_doc；位置類參數皆為 0–1 的畫面比例' },
        caption: {
          type: 'object',
          properties: {
            text: { type: 'string', description: '字幕，可用 \\n 換行；空字串＝不顯示' },
            x: { type: 'number' },
            y: { type: 'number', description: '0–1，預設 0.86' },
            size: { type: 'number', description: '0.4–3，預設 1' },
            style: { type: 'string', enum: ['pill', 'bar', 'plain'], description: '深色膠囊｜左側色條｜黑色描邊字' },
            color: { type: 'string', description: '文字色 #RRGGBB，預設黃 #ffd23f' },
            delay: { type: 'number', description: '出現時間（秒）' },
          },
        },
        bg: { type: 'string', description: 'transparent、#hex 或 #hex,#hex 漸層；預設 #151515' },
        title: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const module = String(a.module) as PModule;
      if (!PHOTO_MODULES.includes(module)) return { ok: false, error: `module 必須是 ${PHOTO_MODULES.join('｜')}` };
      const sc = normalizePhotoScene({
        module,
        ratio: a.ratio as PScene['ratio'],
        loop: a.duration as number,
        images: Array.isArray(a.images) ? a.images.map(String) : [],
        params: (a.params ?? {}) as PScene['params'],
        caption: a.caption as PScene['caption'],
        bg: a.bg as string,
      });
      const scene = { effect: photoFxId(module), words: [JSON.stringify(sc)], seconds: sc.loop + 1 };
      const { combo } = normalizeCombo({ title: String(a.title ?? `${MODULE_INFO[module].zh}預覽`), ratio: sc.ratio, transition: 'cut', scenes: [scene] });
      return {
        combo_scene: scene,
        scene: sc,
        params_doc: PARAMS[module].map((f) => ({ key: f.k, label: f.label, ...(f.type === 'range' ? { min: f.min, max: f.max } : f.type === 'seg' ? { options: f.opts.map(([v, l]) => `${v}＝${l}`) } : { type: f.type }), value: sc.params[f.k] })),
        preview_url: `${ctx.origin}/?combo=${encodeCombo(combo)}`,
        edit_url: editUrl(ctx.origin, { kind: 'photo', data: sc }),
        local_render: `本機逐格渲染（畫面與網站一致）：在 HTML 載入 ${ctx.origin}/r/photo.js，用 <img> 載入本機照片，建立 ${sc.ratio === '16:9' ? '1920×1080' : sc.ratio === '1:1' ? '1080×1080' : '1080×1920'} 的 canvas，對每一格呼叫 MA_PHOTO.drawPhoto(ctx, W, H, scene, i / fps, [img1, img2])，再用 Playwright 截圖或 canvas.toBlob 存成 PNG 序列、ffmpeg 合成。scene 用這裡回傳的 scene（或 get_preset 的 data），images 欄位可忽略。`,
        next: `把 combo_scene 放進 compose_combo / save_combo（ratio 設 ${sc.ratio}）。要讓使用者手動調整，給 edit_url；使用者存成預設後，之後在 scenes 寫 { "preset": 代碼, "images": [...] } 即可換圖沿用同一套運鏡。`,
      };
    },
  },
  {
    name: 'list_presets',
    title: '列出預設',
    description: '列出使用者在網站工作室調好並存起來的預設（地圖場景、銳利水滴、圖片運鏡）。使用者說「用 p7k2x」或「用外觀慢推那個」時，用這個查代碼。',
    inputSchema: { type: 'object', properties: { kind: { type: 'string', enum: ['map', 'drop', 'photo'] }, query: { type: 'string', description: '名稱關鍵字或代碼' }, limit: { type: 'number' } } },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const list = await listPresets(ctx.env, String(a.kind ?? ''), String(a.query ?? ''), Number(a.limit) || 50);
      return { count: list.length, presets: list.map((p) => ({ id: p.id, kind: p.kind, kind_name: KIND_NAME[p.kind], name: p.name, note: p.note ?? null, updated_at: p.updated_at, edit_url: `${ctx.origin}/?edit=${p.id}` })) };
    },
  },
  {
    name: 'get_preset',
    title: '取得預設',
    description: '取得一個預設的完整設定與可直接放進 Combo 的 combo_scene。也可以在 compose_combo / save_combo 的 scenes 直接寫 { "preset": "代碼" }。',
    inputSchema: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const p = await getPreset(ctx.env, String(a.id));
      if (!p) throw new Error(`找不到預設 ${String(a.id)}`);
      return { id: p.id, kind: p.kind, name: p.name, note: p.note ?? null, data: p.data, combo_scene: presetToScene(p), edit_url: `${ctx.origin}/?edit=${p.id}`, updated_at: p.updated_at };
    },
  },
  {
    name: 'save_preset',
    title: '儲存預設',
    description: '把一份地圖場景、水滴或圖片運鏡設定存成預設，回傳代碼與編輯連結，讓使用者能在網站上手動微調後存回同一個代碼。可直接給 build_map_scene / build_drop_scene / build_photo_scene 回傳的 combo_scene。帶 id 代表更新。需要寫入金鑰。',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'string', description: '要更新的預設代碼；省略則新增' },
        name: { type: 'string', description: '好記的名稱，例如「外觀慢推_左到右」' },
        note: { type: 'string' },
        combo_scene: { type: 'object', description: 'build_map_scene / build_drop_scene / build_photo_scene 回傳的 combo_scene（擇一）' },
        kind: { type: 'string', enum: ['map', 'drop', 'photo'] },
        data: { type: 'object', description: 'map：場景物件；drop：{ words: [...] }；photo：build_photo_scene 回傳的 scene（擇一）' },
      },
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
    write: true,
    run: async (a, ctx) => {
      let kind = a.kind as PresetKind | undefined;
      let data = a.data as Record<string, unknown> | undefined;
      const cs = a.combo_scene as { effect?: string; words?: string[] } | undefined;
      if (cs?.effect) {
        const pd = sceneToPresetData(cs.effect, cs.words ?? []);
        if (!pd) return { ok: false, error: `combo_scene 的 effect「${cs.effect}」不支援存成預設（目前支援 map-overlay、crisp-drop、photo-*）` };
        kind = pd.kind;
        data = pd.data as unknown as Record<string, unknown>;
      }
      const bad = checkPresetData(kind, data);
      if (bad) return { ok: false, error: bad };
      const saved = await savePreset(ctx.env, { kind: kind!, name: String(a.name).slice(0, 60), note: a.note ? String(a.note).slice(0, 500) : undefined, data: data as never, source: 'mcp' }, typeof a.id === 'string' && a.id ? a.id : undefined);
      return { ok: true, id: saved.id, kind: saved.kind, name: saved.name, edit_url: `${ctx.origin}/?edit=${saved.id}`, next: '把 edit_url 給使用者微調；使用者存回後代碼不變，之後用 get_preset 或在 scenes 寫 { "preset": 代碼 } 取用最新版本。' };
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
      const pe = await resolvePresets(a, ctx.env);
      if (pe.length) return { ok: false, errors: pe };
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
      const pe = await resolvePresets(a, ctx.env);
      if (pe.length) return { ok: false, errors: pe };
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

export const INSTRUCTIONS = `Motion Atlas（motion.leichthub.com）是短影音動態素材庫，共 ${EFFECTS.length} 招，分三個工作區：文字特效、圖片運鏡（${EFFECTS.filter((f) => secOf(f) === 'photo').length} 個照片模組）、地圖區位。所有特效都是原生 HTML/CSS/JS。
你可以：查特效（search_effects / get_effect）、把多個特效組成 Combo 動畫（compose_combo），並存進 Combo 庫（save_combo）當作日後參考（list_combos / get_combo）。

組 Combo 的建議流程：
1. 先釐清用途、比例（YouTube 16:9、Shorts 9:16）、總長度與要出現的文字。
2. 文字段落先決定用途（開場標題 open、字幕標註 caption、資訊字卡 info、轉場切換 trans、強調情緒 emph、風格氛圍 mood），再用 search_effects 的 use 參數挑特效，留意 word_hint 的文字格式。同一個 Combo 盡量不要重複同一招；建案片可先參考 list_categories 回傳的 kits（套組）。
3. 用 compose_combo 預覽，把 play_url 給使用者看。
4. 依回饋調整後，用 save_combo 儲存，並附上 tags 與 brief 方便日後搜尋。
地圖片段請用 build_map_scene、水滴請用 build_drop_scene、照片運鏡（推拉、甩入、3D 卡片、前後對比、放大鏡）請用 build_photo_scene 產生段落，再把回傳的 combo_scene 放進 compose_combo / save_combo。\n圖片在使用者電腦上時，用 build_photo_scene 回傳的 local_render 方法在本機逐格渲染（引擎 /r/photo.js，地圖 /r/map.js、水滴 /r/drop.js 同理），不要自己重寫動畫。\n銳利水滴（crisp-drop）也可直接在 words 加入設定行，例如 "@shape=circle;color=#a6d4f2;color2=#5b9bd5;pos=beside;sats=6"：shape＝circle｜cloud｜flower｜pebble｜random，pos＝inside｜beside｜above｜below，seed 改變隨機形狀，x/y、tx/ty 為 0–1 的水滴與文字位置；~ 開頭的行是英文小字。此特效完全不用模糊，適合疊進影片。
手動微調的來回流程：build_* 或 get_combo 會回傳 edit_url，使用者在網站工作室調整後「存回」得到預設代碼（例如 p7k2x）；之後用 get_preset 讀取，或在 scenes 直接寫 { \"preset\": \"p7k2x\" }。使用者提到代碼時，一律以預設內容為準，不要自行重做。\n寫入工具需要金鑰；文字內容若涉及價格或數據，請使用使用者提供、可查證的資料，不要自行編造。`;

export const isWriteTool = (name: string) => TOOLS.find((t) => t.name === name)?.write === true;
