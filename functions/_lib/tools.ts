import { normalizeCosmos, cosmicFxId, COSMOS, type CosmicScene } from '../../src/cosmos';
import { normalizeNature, natureFxId, NATURE, type NScene } from '../../src/nature';
import { normalizeTransport, transportFxId, TRANSPORT, type TScene } from '../../src/transport';
import { normalizeIllustration, illustrationFxId, ILLUSTRATION, type IScene } from '../../src/illustration';
import { ALL_TAGS, CATEGORIES, EFFECTS, NUM, PALETTES, SECTIONS, secOf } from '../../src/data';
import { comboOutline, comboPrompt, comboHtml, encodeCombo, findEffect, normalizeCombo, totalSeconds, type Combo } from '../../src/combo';
import { loopSeconds, toneVars } from '../../src/engine';
import { buildPrompt, type PromptMode, type Ratio } from '../../src/prompts';
import type { Fx } from '../../src/types';
import { buildMapScene, sceneLength, type MapSceneInput } from '../../src/mapkit';
import { dropToWords, parseDrop, type DropOpts } from '../../src/drop';
import { KITS, USES } from '../../src/uses';
import { FONT_IDS, FONT_PACKS } from '../../src/fonts';
import { defaultObjScene, normalizeObjScene, objFxId, OBJ_INFO, OBJ_MODULES, OBJ_PARAMS, type OModule, type OScene } from '../../src/objkit';

const illustrationResult = (raw:unknown,ctx:ToolCtx,title='海洋世界・精修插畫') => {
  const sc=normalizeIllustration(raw),combo_scene={effect:illustrationFxId(sc.mode),words:[JSON.stringify(sc)],seconds:sc.loop};
  const {combo}=normalizeCombo({title,ratio:sc.ratio,transition:'cut',scenes:[combo_scene]});
  return {scene:sc,combo_scene,modes:ILLUSTRATION.modes,subjects:sc.mode==='whale'?ILLUSTRATION.animals:undefined,backgrounds:ILLUSTRATION.backgrounds,
    params_doc:ILLUSTRATION.fields[sc.mode],edit_url:editUrl(ctx.origin,{kind:'illustration',data:sc}),preview_url:`${ctx.origin}/?combo=${encodeCombo(combo)}`,
    local_render:`載入 ${ctx.origin}/r/illustration.js；const renderer=MA_ILLUSTRATION.createRenderer(glCanvas,particleCanvas,scene,"${ctx.origin}");await renderer.ready;逐格呼叫 renderer.render(i/fps,W,H)，依序 drawImage 兩張 canvas，最後 renderer.dispose()。`,
    next:`海洋世界的海底場景目前有七種精修插畫；將 combo_scene 放進 compose_combo / save_combo，ratio=${sc.ratio}，用 edit_url 進入本招專屬編輯面板。`};
};
const transportResult = (raw:unknown,ctx:ToolCtx,title='交通工具・精修插畫') => {
  const sc=normalizeTransport(raw),combo_scene={effect:transportFxId(sc.mode),words:[JSON.stringify(sc)],seconds:sc.loop};
  const {combo}=normalizeCombo({title,ratio:sc.ratio,transition:'cut',scenes:[combo_scene]});
  return {scene:sc,combo_scene,modes:TRANSPORT.modes,backgrounds:TRANSPORT.backgrounds,
    params_doc:TRANSPORT.fields[sc.mode],edit_url:editUrl(ctx.origin,{kind:'transport',data:sc}),preview_url:`${ctx.origin}/?combo=${encodeCombo(combo)}`,
    local_render:`載入 ${ctx.origin}/r/transport.js；const renderer=MA_TRANSPORT.createRenderer(canvas,overlayCanvas,scene,"${ctx.origin}");await renderer.ready;逐格呼叫 renderer.render(i/fps,W,H)，依序 drawImage 兩張 canvas，最後 renderer.dispose()。`,
    next:`精修交通插畫目前開放四種：飛機、熱氣球（天空物件）、太空船（星空物件）、輪船（海洋世界）；將 combo_scene 放進 compose_combo / save_combo，ratio=${sc.ratio}，用 edit_url 進入本招專屬編輯面板。`};
};
const natureResult = (raw:unknown,ctx:ToolCtx,title='隕石與俯瞰・精修插畫') => {
  const sc=normalizeNature(raw),combo_scene={effect:natureFxId(sc.mode),words:[JSON.stringify(sc)],seconds:sc.loop};
  const {combo}=normalizeCombo({title,ratio:sc.ratio,transition:'cut',scenes:[combo_scene]});
  return {scene:sc,combo_scene,modes:NATURE.modes,styles:NATURE.styles,backgrounds:NATURE.environments(sc.mode),
    params_doc:NATURE.fields[sc.mode],edit_url:editUrl(ctx.origin,{kind:'nature',data:sc}),preview_url:`${ctx.origin}/?combo=${encodeCombo(combo)}`,
    local_render:`載入 ${ctx.origin}/r/nature.js；const renderer=MA_NATURE.createRenderer(canvas,overlayCanvas,scene,"${ctx.origin}");await renderer.ready;逐格呼叫 renderer.render(i/fps,W,H)，依序 drawImage 兩張 canvas，最後 renderer.dispose()。`,
    next:`隕石與俯瞰一招隕石切換四種樣式，加上八種俯瞰場景；將 combo_scene 放進 compose_combo / save_combo，ratio=${sc.ratio}，用 edit_url 進入本招專屬編輯面板。`};
};

const cosmicResult=(raw:unknown,ctx:ToolCtx,title='星空宇宙・精修插畫')=>{
 const sc=normalizeCosmos(raw),combo_scene={effect:cosmicFxId(sc.mode),words:[JSON.stringify(sc)],seconds:sc.loop};
 const {combo}=normalizeCombo({title,ratio:sc.ratio,transition:'cut',scenes:[combo_scene]});
 return{scene:sc,combo_scene,modes:COSMOS.modes,variants:COSMOS.variants(sc.mode).map(id=>({id,...COSMOS.bodies[id]})),backgrounds:COSMOS.backgrounds,params_doc:COSMOS.fieldsFor(sc),edit_url:editUrl(ctx.origin,{kind:'cosmos',data:sc}),preview_url:`${ctx.origin}/?combo=${encodeCombo(combo)}`,local_render:`Load ${ctx.origin}/r/cosmos.js; const renderer=MA_COSMOS.createRenderer(canvas,overlayCanvas,scene,"${ctx.origin}"); await renderer.ready; renderer.render(t,W,H); renderer.dispose();`,next:'插畫／星空物件系列：#169 天體四樣式一招、#195 低空飛越四地表一招、#199 推近地球獨立一招，另有 #244 精修隕石。舊九招隱藏保留，精修地表為示意插畫；太陽飛越為視覺想像。將 combo_scene 放進 compose_combo / save_combo。'};
};

const FONT_HELP = `字型組合：${FONT_PACKS.map((f) => `${f.id}＝${f.zh}（${f.use}）`).join('；')}。省略＝sharp`;
import { MODULE_INFO, normalizePhotoScene, PARAMS, photoFxId, PHOTO_MODULES, type PModule, type PScene } from '../../src/photokit';
import { normalizePlanScene, PLAN_INFO, PLAN_MODES, planFxId, planLength, type PlanMode, type PlanScene } from '../../src/plankit';
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
  ...(f.preferredRatio ? { preferred_ratio: f.preferredRatio } : {}),
  needs_js: !!f.run,
  ...(f.hidden ? { hidden: true } : {}),
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
        font: { type: 'string', enum: FONT_IDS, description: '這段的字型組合，省略＝跟整支的 font；依段落情緒挑選' },
        note: { type: 'string', description: '這段的用意或剪輯備註' },
      },
    },
  },
  palette: { type: 'string', enum: PALETTES.map((p) => p.id), description: '配色組，預設 leicht（光寓橘）' },
  accent: { type: 'string', description: '自訂主色 #RRGGBB，會覆蓋配色組的主色' },
  ratio: { type: 'string', enum: ['16:9', '9:16', '1:1'], description: '影片比例，Shorts 用 9:16' },
  transition: { type: 'string', enum: ['cut', 'fade', 'slide', 'zoom'], description: '段落轉場，預設 fade' },
  font: { type: 'string', enum: FONT_IDS, description: `整支的字型組合。${FONT_HELP}` },
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
      return { ...base, ...(sc.seconds ? { seconds: sc.seconds } : {}), ...(FONT_IDS.includes(sc.font as never) ? { font: sc.font as string } : {}), ...(sc.note ? { note: sc.note } : { note: base.note }) };
    }),
  );
  return errors;
};

export const TOOLS: ToolDef[] = [
  {
    name: 'list_categories',
    title: '列出分類與配色',
    description: `列出 Motion Atlas 的工作區（文字、圖片、地圖、物件、插畫、圖表、格局、圖解）、${CATEGORIES.length} 個分類（共 ${EFFECTS.length} 招）、常用情境標籤與可用配色。第一次使用時先呼叫，了解有哪些選擇。`,
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    run: async () => ({
      total_effects: EFFECTS.length,
      sections: SECTIONS.map((x) => ({ ...x, count: EFFECTS.filter((f) => secOf(f) === x.id).length, categories: CATEGORIES.filter((c) => c.sec === x.id).map((c) => c.id) })),
      font_packs: FONT_PACKS.map((f) => ({ id: f.id, name: f.zh, use: f.use })),
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
        section: { type: 'string', enum: SECTIONS.map((x) => x.id), description: 'text＝文字特效、cut＝轉場、ui＝元件（社群介面、開場收尾、房產資訊）、photo＝圖片運鏡、map＝地圖區位' },
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
        font: { type: 'string', enum: FONT_IDS, description: FONT_HELP },
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
      const ratio = (['16:9', '9:16', '1:1'].includes(String(a.ratio)) ? a.ratio : (fx.preferredRatio ?? '16:9')) as Ratio;
      const format = (['web', 'en', 'video', 'code'].includes(String(a.format)) ? a.format : 'web') as PromptMode;
      return {
        ...summary(fx),
        motion_zh: fx.motion,
        motion_en: fx.motionEn,
        page_url: `${ctx.origin}/?fx=${fx.id}`,
        format,
        output: buildPrompt(fx, format, words, toneVars(pal, tone, FONT_IDS.includes(a.font as never) ? String(a.font) : undefined), ratio),
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
        template: { type: 'string', enum: ['aerial', 'street', 'site', 'routes', 'blank'], description: '預設 aerial；site＝太空降落後畫出基地（大標題＋多邊形基地＋A棟/B棟圓形標記＋資訊條）；routes＝放射路線（從一個起點拉箭頭到多個目的地）' },
        descend: { type: 'number', description: '太空降落開場秒數（像 Google 地球從太空降到底圖），0＝關閉；site 範本預設 2.6' },
        heading: { type: 'string', description: 'site 範本的大標題，例如「基地位置」' },
        site_points: { type: 'array', items: { type: 'array', items: { type: 'number' } }, description: '基地多邊形角點 [[x,y],…]（0–1），可 3–12 點，L 形基地用 6 點' },
        badges: { type: 'array', items: { type: 'object', required: ['text'], properties: { text: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' }, color: { type: 'string' } } }, description: '圓形標記，例如 A棟、B棟' },
        bars: { type: 'array', items: { type: 'string' }, description: '資訊條，一條一個字串；| 分欄、* 開頭用強調色，例如「*地上 15 樓|地下 3 樓」（樓層數請用建照資料）' },
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
        routes: {
          type: 'object',
          description: '放射路線：從一個起點拉出多條帶箭頭的路線到不同目的地，例如「從這裡開車到南港、內湖、北車都很方便」。可搭配任何範本，routes 範本已排好位置',
          required: ['destinations'],
          properties: {
            origin: { type: 'string', description: '起點名稱，例如案名；空字串＝只有圓點' },
            x: { type: 'number', description: '起點位置 0–1' },
            y: { type: 'number' },
            destinations: {
              type: 'array',
              maxItems: 6,
              items: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, note: { type: 'string', description: '附註，例如「開車約 15 分鐘」；時間請用使用者提供或實測的數字' }, color: { type: 'string', description: '#RRGGBB，省略則自動配色' }, x: { type: 'number' }, y: { type: 'number' } } },
            },
            curve: { type: 'number', description: '彎曲程度 -0.5～0.5，預設 0.15' },
            dash: { type: 'boolean', description: '虛線並往前流動' },
            single_color: { type: 'string', description: '所有路線用同一個顏色 #RRGGBB' },
          },
        },
        elements: { type: 'array', items: { type: 'object' }, description: '進階：額外元件 {type: tag|road|site|label|pin|info|stat|compass|text|routes, x, y, text, lines, color, fg, size, delay, pts}' },
        font: { type: 'string', enum: FONT_IDS, description: FONT_HELP },
        title: { type: 'string', description: '預覽用名稱' },
      },
    },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const sc = buildMapScene(a as MapSceneInput);
      if (FONT_IDS.includes(a.font as never) && a.font !== 'sharp') sc.font = String(a.font);
      const scene = { effect: 'map-overlay', words: [JSON.stringify(sc)], seconds: sceneLength(sc) + 1, ...(sc.font ? { font: sc.font } : {}) };
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
        font: { type: 'string', enum: FONT_IDS, description: FONT_HELP },
        title: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const lines = Array.isArray(a.lines) ? a.lines.map(String).filter(Boolean).slice(0, 6) : ['水滴'];
      const { o } = parseDrop(a.layout ? [`@pos=${String(a.layout)}`] : []);
      const map: Record<string, keyof DropOpts> = { shape: 'shape', seed: 'seed', size: 'size', color: 'color', color2: 'color2', alpha: 'alpha', gloss: 'gloss', gloss_style: 'glossStyle', rim: 'rim', rim_width: 'rimWidth', text_color: 'textColor', text_size: 'textSize', stroke: 'stroke', stroke_width: 'strokeWidth', x: 'x', y: 'y', tx: 'tx', ty: 'ty', sats: 'sats', sat_size: 'satSize', sat_spread: 'satSpread', bg: 'bg', duration: 'loop', font: 'font' };
      const rec = o as unknown as Record<string, unknown>;
      for (const [k, key] of Object.entries(map)) if (a[k] !== undefined && a[k] !== null) rec[key] = typeof rec[key] === 'number' ? Number(a[k]) : String(a[k]);
      const words = dropToWords(o, lines);
      const scene = { effect: 'crisp-drop', words, seconds: o.loop, ...(o.font ? { font: o.font } : {}) };
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
        images: { type: 'array', items: { type: 'string' }, description: '圖片網址或本機相對路徑，依模組的插槽順序（見說明）；留空＝示意圖。collage 的剪報及 occlude 的前景請先準備去背 PNG／WebP，不會自動去背；occlude 的前景會疊在不透明底板上以遮住換景接縫' },
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
        font: { type: 'string', enum: FONT_IDS, description: FONT_HELP },
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
        ...(FONT_IDS.includes(a.font as never) && a.font !== 'sharp' ? { font: String(a.font) } : {}),
      });
      const scene = { effect: photoFxId(module), words: [JSON.stringify(sc)], seconds: sc.loop + 1, ...(sc.font ? { font: sc.font } : {}) };
      const { combo } = normalizeCombo({ title: String(a.title ?? `${MODULE_INFO[module].zh}預覽`), ratio: sc.ratio, transition: 'cut', scenes: [scene] });
      return {
        combo_scene: scene,
        scene: sc,
        params_doc: PARAMS[module].map((f) => ({ key: f.k, label: f.label, ...(f.type === 'range' ? { min: f.min, max: f.max } : f.type === 'seg' ? { options: f.opts.map(([v, l]) => `${v}＝${l}`) } : { type: f.type }), value: sc.params[f.k] })),
        preview_url: `${ctx.origin}/?combo=${encodeCombo(combo)}`,
        edit_url: editUrl(ctx.origin, { kind: 'photo', data: sc }),
        local_render: `本機逐格渲染（畫面與網站一致）：在 HTML 載入 ${ctx.origin}/r/fonts.css（昭源黑體＋Anton 數字）與 ${ctx.origin}/r/photo.js，先等字型載入完成，用 <img> 載入本機照片，建立 ${sc.ratio === '16:9' ? '1920×1080' : sc.ratio === '1:1' ? '1080×1080' : '1080×1920'} 的 canvas，對每一格呼叫 MA_PHOTO.drawPhoto(ctx, W, H, scene, i / fps, [img1, img2])，再用 Playwright 截圖或 canvas.toBlob 存成 PNG 序列、ffmpeg 合成。scene 用這裡回傳的 scene（或 get_preset 的 data），images 欄位可忽略。`,
        next: `把 combo_scene 放進 compose_combo / save_combo（ratio 設 ${sc.ratio}）。要讓使用者手動調整，給 edit_url；使用者存成預設後，之後在 scenes 寫 { "preset": 代碼, "images": [...] } 即可換圖沿用同一套運鏡。`,
      };
    },
  },
  {
    name: 'build_plan_scene',
    title: '組格局動態',
    description: `用平面圖（建商 DM 原圖或內建虛構示意圖）做格局動態。模式：${PLAN_MODES.map((m) => `${m}＝${PLAN_INFO[m].zh}（${PLAN_INFO[m].desc}；圖片：${PLAN_INFO[m].slots.join('、')}）`).join('；')}。房間、動線用 0–1 的圖面座標（左上 0,0、右下 1,1），房間可給 rect [x0,y0,x1,y1] 或多邊形 pts。看得到平面圖時，請依圖估出各房間範圍；之後讓使用者用 edit_url 在格局工作室微調。坪數、尺寸只用建商資料或權狀，不要自己推算。`,
    inputSchema: {
      type: 'object',
      required: ['mode'],
      properties: {
        mode: { type: 'string', enum: PLAN_MODES },
        ratio: { type: 'string', enum: ['9:16', '16:9', '1:1'], description: '預設 9:16' },
        images: { type: 'array', items: { type: 'string' }, description: '平面圖網址或本機相對路徑，依模式的圖片順序；留空＝內建虛構示意圖（連同示範房間）' },
        rooms: { type: 'array', description: '第一張圖上的房間（戶別定位：整層的各戶；公設導覽：各區）', items: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, sub: { type: 'string', description: '副標，例如坪數（需有來源）' }, rect: { type: 'array', items: { type: 'number' }, description: '[x0,y0,x1,y1]，0–1' }, pts: { type: 'array', items: { type: 'array', items: { type: 'number' } }, description: '多邊形頂點 [[x,y],...]，0–1' } } } },
        rooms2: { type: 'array', description: '戶型比較：第二張圖上的房間，格式同 rooms；同名的房間會同時亮起', items: { type: 'object' } },
        path: { type: 'array', items: { type: 'array', items: { type: 'number' } }, description: '看屋動線 [[x,y],...]，第一點是入口，要經過門口、不要穿牆' },
        target: { type: 'integer', description: '戶別定位、單房聚焦的目標房間序號（從 0 起）' },
        title: { type: 'string' },
        sub: { type: 'string', description: '副標，例如「27.82 坪（建商 DM）」' },
        labelA: { type: 'string' },
        labelB: { type: 'string' },
        dimW: { type: 'string', description: '單房聚焦的寬度文字，例如「約 3.5 m」；沒有可查證數字就留空' },
        dimH: { type: 'string' },
        color: { type: 'string', description: '重點色 #RRGGBB' },
        dim: { type: 'number', description: '壓暗程度 0–0.9，預設 0.55' },
        speed: { type: 'number', description: '速度 0.4–2.5' },
        walls: { type: 'number', description: '立體傾斜的牆高 0–2' },
        note: { type: 'boolean', description: '右下角免責小字，預設 true' },
        bg: { type: 'string', description: 'transparent 或 #hex；預設 #f4f1ea' },
        font: { type: 'string', enum: FONT_IDS, description: FONT_HELP },
      },
    },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const mode = String(a.mode) as PlanMode;
      if (!PLAN_MODES.includes(mode)) return { ok: false, error: `mode 必須是 ${PLAN_MODES.join('｜')}` };
      const imgs = Array.isArray(a.images) ? a.images.map(String) : [];
      const raw: Partial<PlanScene> & Record<string, unknown> = { mode, ratio: a.ratio as PlanScene['ratio'], bg: a.bg as string };
      if (imgs.some(Boolean)) raw.images = imgs;
      for (const k of ['rooms', 'rooms2', 'path', 'target', 'title', 'sub', 'labelA', 'labelB', 'dimW', 'dimH'] as const) if (a[k] !== undefined) raw[k] = a[k] as never;
      raw.params = { color: a.color, dim: a.dim, speed: a.speed, walls: a.walls, note: a.note === false ? 0 : 1 } as unknown as PlanScene['params'];
      if (FONT_IDS.includes(a.font as never) && a.font !== 'sharp') raw.font = String(a.font);
      const sc = normalizePlanScene(raw, mode);
      const seconds = planLength(sc) + 0.5;
      const scene = { effect: planFxId(mode), words: [JSON.stringify(sc)], seconds, ...(sc.font ? { font: sc.font } : {}) };
      const { combo } = normalizeCombo({ title: String(a.title ?? `${PLAN_INFO[mode].zh}預覽`), ratio: sc.ratio, transition: 'cut', scenes: [scene] });
      const [W, H] = sc.ratio === '16:9' ? [1920, 1080] : sc.ratio === '1:1' ? [1080, 1080] : [1080, 1920];
      return {
        combo_scene: scene,
        scene: sc,
        seconds,
        preview_url: `${ctx.origin}/?combo=${encodeCombo(combo)}`,
        edit_url: editUrl(ctx.origin, { kind: 'plan', data: sc }),
        local_render: `本機逐格渲染：在 HTML 載入 ${ctx.origin}/r/fonts.css 與 ${ctx.origin}/r/plan.js，等字型載入後用 <img> 載入本機平面圖，建立 ${W}×${H} 的 canvas，對每一格呼叫 MA_PLAN.drawPlan(ctx, W, H, scene, i / fps, [img1, img2])，存成 PNG 序列再用 ffmpeg 合成。動畫長度 ${seconds} 秒。`,
        next: `把 combo_scene 放進 compose_combo / save_combo（ratio 設 ${sc.ratio}）。房間位置請給使用者 edit_url，在格局工作室上傳同一張平面圖後拖曳微調，存成預設再沿用。`,
      };
    },
  },
  {
    name: 'build_object_scene',
    title: '組物件特效',
    description: `物件特效（跟水滴同一系列，硬邊零模糊、可透明疊進影片）：${OBJ_MODULES.filter(m=>!['ocean','vehicle','meteor','aerial'].includes(m)).map((m) => `${m}＝${OBJ_INFO[m].zh}（${OBJ_INFO[m].desc}）`).join('；')}。回傳 combo_scene、各參數說明與編輯連結。水滴請用 build_drop_scene。`,
    inputSchema: {
      type: 'object',
      required: ['module'],
      properties: {
        module: { type: 'string', enum: OBJ_MODULES.filter(m=>!['ocean','vehicle','meteor','aerial'].includes(m)) },
        params: { type: 'object', description: '模組參數，見回傳的 params_doc；x、y 為物件位置 0–1。新海底場景請用 build_illustration_scene；交通工具請用 build_transport_scene；隕石與俯瞰請用 build_nature_scene；舊 ocean／vehicle／meteor／aerial 模組保留相容，已從目錄隱藏' },
        lines: { type: 'array', items: { type: 'string' }, description: '文字，一行一句（最多 4 行），~ 開頭為英文小字' },
        layout: { type: 'string', enum: ['below', 'over', 'above', 'none'], description: '文字在物件下方、疊在物件上、上方或不顯示' },
        text_color: { type: 'string' },
        text_size: { type: 'number', description: '0.3–3，預設 1' },
        bg: { type: 'string', description: 'transparent、#hex 或 #hex,#hex 漸層' },
        ratio: { type: 'string', enum: ['9:16', '16:9', '1:1'] },
        duration: { type: 'number', description: '秒數，海底世界預設 8，其餘預設 6' },
        font: { type: 'string', enum: FONT_IDS, description: FONT_HELP },
        title: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: true },
    run: async (a, ctx) => {
      const module = String(a.module) as OModule;
      if (!OBJ_MODULES.includes(module)) return { ok: false, error: `module 必須是 ${OBJ_MODULES.join('｜')}` };
      const sc = normalizeObjScene(
        {
          module,
          ratio: a.ratio as OScene['ratio'],
          loop: a.duration as number,
          bg: a.bg as string,
          params: (a.params ?? {}) as OScene['params'],
          text: { ...defaultObjScene(module).text, lines: Array.isArray(a.lines) ? a.lines.map(String) : [], layout: (a.layout as OScene['text']['layout']) ?? (module === 'ocean' ? (Array.isArray(a.lines) && a.lines.length ? 'below' : 'none') : ((module === 'cosmos' && (!['planet', 'sun', 'moon', 'earth'].includes(String((a.params as { mode?: string } | undefined)?.mode)) || (a.params as { cam?: string } | undefined)?.cam === 'in')) || module === 'aerial' ? 'over' : 'below')), ...(a.text_color ? { color: String(a.text_color) } : {}), size: Number(a.text_size ?? 1) },
          ...(FONT_IDS.includes(a.font as never) && a.font !== 'sharp' ? { font: String(a.font) } : {}),
        },
        module,
      );
      const scene = { effect: objFxId(module), words: [JSON.stringify(sc)], seconds: sc.loop, ...(sc.font ? { font: sc.font } : {}) };
      const { combo } = normalizeCombo({ title: String(a.title ?? `${OBJ_INFO[module].zh}預覽`), ratio: sc.ratio, transition: 'cut', scenes: [scene] });
      return {
        combo_scene: scene,
        scene: sc,
        params_doc: OBJ_PARAMS[module].map((f) => ({ key: f.k, label: f.label, ...(f.type === 'range' ? { min: f.min, max: f.max } : f.type === 'seg' ? { options: f.opts.map(([v, l]) => `${v}＝${l}`) } : { type: f.type }), value: sc.params[f.k] })),
        preview_url: `${ctx.origin}/?combo=${encodeCombo(combo)}`,
        edit_url: editUrl(ctx.origin, { kind: 'object', data: sc }),
        local_render: `本機渲染：載入 ${ctx.origin}/r/fonts.css 與 ${ctx.origin}/r/obj.js，對每一格呼叫 MA_OBJ.drawObj(ctx, W, H, scene, i / fps)。`,
        next: `把 combo_scene 放進 compose_combo / save_combo（ratio 設 ${sc.ratio}）。`,
      };
    },
  },
  {
    name: 'build_illustration_scene', title: '組精修插畫',
    description: '海底世界七招精修插畫：fish 魚群、dolphins 海豚、whale 巨物、shark 迎面鯊魚、coral 珊瑚、deep 深海下潛、submarine 潛水艇。每招有獨立編輯參數及五種背景，回傳 Combo 段落與本招編輯連結。',
    inputSchema: {type:'object',properties:{
      scene:{type:'object',description:'完整設定；也可直接提供下列欄位。speed 優先於 duration，片長為 12/speed'},
      mode:{type:'string',enum:Object.keys(ILLUSTRATION.modes),description:'預設 whale；各招專屬參數見回傳 params_doc'},
      ...Object.fromEntries(Object.values(ILLUSTRATION.fields).flat().map(f=>[f.key,{type:'number',description:f.label,minimum:f.min,maximum:f.max}])),
      formation:{type:'string',enum:['wave','line','orbit','v']},exit:{type:'string',enum:['pass','cover']},
      animal:{type:'string',enum:Object.keys(ILLUSTRATION.animals)}, background:{type:'string',enum:Object.keys(ILLUSTRATION.backgrounds)},
      ratio:{type:'string',enum:['9:16','16:9','1:1']}, size:{type:'number',minimum:.4,maximum:2.2}, speed:{type:'number',minimum:.6,maximum:2.5},duration:{type:'number',minimum:4.8,maximum:20},
      x:{type:'number',minimum:-.5,maximum:1.5}, y:{type:'number',minimum:0,maximum:1}, angle:{type:'number',minimum:-60,maximum:60},
      direction:{type:'string',enum:['left','right']},path:{type:'string',enum:['pass','hover']},color:{type:'string',description:'#RRGGBB，提供 color 時預設開啟換色；tint=0 恢復原色'},
      tint:{type:'number',minimum:0,maximum:1},motion:{type:'number',minimum:0,maximum:1.6},particles:{type:'number',minimum:0,maximum:1.5},current:{type:'number',minimum:0,maximum:2},camera:{type:'number',minimum:0,maximum:1.5},opacity:{type:'number',minimum:0,maximum:1},brightness:{type:'number',minimum:.3,maximum:1.5},seed:{type:'number',minimum:0,maximum:999999},title:{type:'string'}
    }},
    annotations:{readOnlyHint:true},
    run:async(a,ctx)=>{
      const raw={...(a.scene&&typeof a.scene==='object'?a.scene:{}),...Object.fromEntries(Object.entries(a).filter(([k])=>k!=='scene'&&k!=='duration'&&k!=='title'))} as Partial<IScene>;
      if(a.duration!==undefined){delete raw.speed;raw.loop=Number(a.duration);if(a.speed!==undefined)raw.speed=Number(a.speed);}
      if(raw.color&&raw.tint===undefined)raw.tint=1;
      return illustrationResult(raw,ctx,String(a.title??'海洋世界・精修插畫'));
    },
  },
  {
    name: 'build_transport_scene', title: '組交通精修插畫',
    description:'精修交通插畫：plane 客機、rocket 太空船、ship 輪船、balloon 熱氣球。獨立動作控制、配色、五種背景與透明輸出。',
    inputSchema: {type:'object',properties:{
      scene:{type:'object',description:'完整設定；也可直接提供下列欄位。speed 優先於 duration，片長為 12/speed'},
      mode:{type:'string',enum:Object.keys(TRANSPORT.modes).filter(m=>!['car','carriage','train'].includes(m)),description:'預設 plane；各招專屬參數見回傳 params_doc'},
      ...Object.fromEntries(Object.values(TRANSPORT.fields).flat().map(f=>[f.key,{type:'number',description:f.label,minimum:Math.min(...Object.values(TRANSPORT.fields).flat().filter(g=>g.key===f.key).map(g=>g.min)),maximum:Math.max(...Object.values(TRANSPORT.fields).flat().filter(g=>g.key===f.key).map(g=>g.max))}])),
      ratio:{type:'string',enum:['9:16','16:9','1:1']}, size:{type:'number',minimum:.4,maximum:2.2}, speed:{type:'number',minimum:.6,maximum:2.5},duration:{type:'number',minimum:4.8,maximum:20},
      x:{type:'number',minimum:-.5,maximum:1.5}, y:{type:'number',minimum:0,maximum:1}, angle:{type:'number',minimum:-60,maximum:60},
      direction:{type:'string',enum:['left','right']},path:{type:'string',enum:['pass','cruise']},color:{type:'string',description:'#RRGGBB，提供 color 時預設開啟換色；tint=0 恢復原色'},
      background:{type:'string',enum:Object.keys(TRANSPORT.backgrounds)},
      tint:{type:'number',minimum:0,maximum:1},camera:{type:'number',minimum:0,maximum:1.5},opacity:{type:'number',minimum:0,maximum:1},brightness:{type:'number',minimum:.3,maximum:1.5},seed:{type:'number',minimum:0,maximum:999999},title:{type:'string'}
    }},
    annotations:{readOnlyHint:true},
    run:async(a,ctx)=>{
      const raw={...(a.scene&&typeof a.scene==='object'?a.scene:{}),...Object.fromEntries(Object.entries(a).filter(([k])=>k!=='scene'&&k!=='duration'&&k!=='title'))} as Partial<TScene>;
      if(a.duration!==undefined){delete raw.speed;raw.loop=Number(a.duration);if(a.speed!==undefined)raw.speed=Number(a.speed);}
      if(raw.color&&raw.tint===undefined)raw.tint=1;
      if(!raw.mode)raw.mode='plane';
      return transportResult(raw,ctx,String(a.title??'交通工具・精修插畫'));
    },
  },
  {
    name: 'build_nature_scene', title: '組隕石與俯瞰精修插畫',
    description:'精修隕石只有一招，style 切換 rock 岩石、ice 冰晶、lava 熔岩、gold 金屬。另有 city 城市、river 河流、mountain 山川、grass 牛馬草原、farm 農田、coast 海岸、forest 森林、highway 交流道八種俯瞰。各招有專屬參數與五種背景／環境；地景為虛構插畫。',
    inputSchema: {type:'object',properties:{
      scene:{type:'object',description:'完整設定；也可直接提供下列欄位。speed 優先於 duration，片長為 12/speed'},
      mode:{type:'string',enum:Object.keys(NATURE.modes),description:'預設 meteor；各招專屬參數見回傳 params_doc'},
      ...Object.fromEntries(Object.values(NATURE.fields).flat().map(f=>[f.key,{type:'number',description:f.label,minimum:Math.min(...Object.values(NATURE.fields).flat().filter(g=>g.key===f.key).map(g=>g.min)),maximum:Math.max(...Object.values(NATURE.fields).flat().filter(g=>g.key===f.key).map(g=>g.max))}])),
      ratio:{type:'string',enum:['9:16','16:9','1:1']}, size:{type:'number',minimum:.4,maximum:2.2}, speed:{type:'number',minimum:.6,maximum:2.5},duration:{type:'number',minimum:4.8,maximum:20},
      x:{type:'number',minimum:-.5,maximum:1.5}, y:{type:'number',minimum:0,maximum:1}, angle:{type:'number',minimum:-180,maximum:180},
      direction:{type:'string',enum:['left','right']},path:{type:'string',enum:['pass','hover']},color:{type:'string',description:'#RRGGBB，提供 color 時預設開啟換色；tint=0 恢復原色'},
      style:{type:'string',enum:Object.keys(NATURE.styles)},frame:{type:'string',enum:['full','card','circle']},zoom:{type:'number',minimum:1,maximum:2.6},pan:{type:'number',minimum:0,maximum:1.5},heading:{type:'number',minimum:-180,maximum:180},heat:{type:'number',minimum:0,maximum:1.5},shine:{type:'number',minimum:0,maximum:1},
      background:{type:'string',enum:Object.keys(NATURE.backgrounds)},
      tint:{type:'number',minimum:0,maximum:1},opacity:{type:'number',minimum:0,maximum:1},brightness:{type:'number',minimum:.3,maximum:1.5},seed:{type:'number',minimum:0,maximum:999999},title:{type:'string'}
    }},
    annotations:{readOnlyHint:true},
    run:async(a,ctx)=>{
      const raw={...(a.scene&&typeof a.scene==='object'?a.scene:{}),...Object.fromEntries(Object.entries(a).filter(([k])=>k!=='scene'&&k!=='duration'&&k!=='title'))} as Partial<NScene>;
      if(a.duration!==undefined){delete raw.speed;raw.loop=Number(a.duration);if(a.speed!==undefined)raw.speed=Number(a.speed);}
      if(raw.color&&raw.tint===undefined)raw.tint=1;
      return natureResult(raw,ctx,String(a.title??'隕石與俯瞰・精修插畫'));
    },
  },
  {
    name:'build_cosmos_scene',title:'組星空宇宙精修插畫',
    description:'三個專屬編輯器：orbit 天體（gas 行星光環、sun 太陽、moon 月球、earth 地球）；flyover 低空飛越（earth、moon、mars 火星、sun）；earthzoom 推近地球。球面自轉、環帶遮擋、衛星繞行、透視地表與獨立運鏡。地表為示意插畫。',
    inputSchema:{type:'object',properties:{scene:{type:'object',description:'完整設定；頂層欄位優先'},mode:{type:'string',enum:Object.keys(COSMOS.modes)},body:{type:'string',enum:Object.keys(COSMOS.bodies)},
      ...Object.fromEntries(Object.values(COSMOS.fields).flat().map(f=>[f.key,{type:'number',description:f.label,minimum:f.min,maximum:f.max}])),
      ratio:{type:'string',enum:['9:16','16:9','1:1']},size:{type:'number',minimum:.35,maximum:2},speed:{type:'number',minimum:.6,maximum:2.5},duration:{type:'number',minimum:4.8,maximum:20},x:{type:'number',minimum:-.5,maximum:1.5},y:{type:'number',minimum:0,maximum:1},angle:{type:'number',minimum:-180,maximum:180},color:{type:'string',description:'#RRGGBB'},tint:{type:'number',minimum:0,maximum:1},opacity:{type:'number',minimum:0,maximum:1},brightness:{type:'number',minimum:.3,maximum:1.5},seed:{type:'number',minimum:0,maximum:999999},stars:{type:'number',minimum:0,maximum:2},background:{type:'string',enum:Object.keys(COSMOS.backgrounds)},zoomDirection:{type:'string',enum:['in','out']},title:{type:'string'}
    }},annotations:{readOnlyHint:true},run:async(a,ctx)=>{
      const raw={...(a.scene&&typeof a.scene==='object'?a.scene:{}),...Object.fromEntries(Object.entries(a).filter(([k])=>!['scene','duration','title'].includes(k)))} as Partial<CosmicScene>;
      if(a.duration!==undefined){delete raw.speed;raw.loop=Number(a.duration);if(a.speed!==undefined)raw.speed=Number(a.speed);}if(raw.color&&raw.tint===undefined)raw.tint=1;
      return cosmicResult(raw,ctx,String(a.title??'星空宇宙・精修插畫'));
    },
  },
  {
    name: 'list_presets',
    title: '列出預設',
    description: '列出使用者在網站工作室調好並存起來的預設（地圖場景、銳利水滴、圖片運鏡、物件特效、精修插畫）。使用者說「用 p7k2x」或「用外觀慢推那個」時，用這個查代碼。',
    inputSchema: { type: 'object', properties: { kind: { type: 'string', enum: ['map', 'drop', 'photo', 'object', 'illustration', 'plan', 'transport', 'nature', 'cosmos'] }, query: { type: 'string', description: '名稱關鍵字或代碼' }, limit: { type: 'number' } } },
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
        kind: { type: 'string', enum: ['map', 'drop', 'photo', 'object', 'illustration', 'plan', 'transport', 'nature', 'cosmos'] },
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
        if (!pd) return { ok: false, error: `combo_scene 的 effect「${cs.effect}」不支援存成預設（目前支援 map-overlay、crisp-drop、photo-*、obj-*、whale-illustrated）` };
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

export const INSTRUCTIONS = `Motion Atlas（motion.leichthub.com）是短影音動態素材庫，共 ${EFFECTS.length} 招，分十個工作區：文字特效、轉場（cut-*：色塊推擠、形狀擦除、開門、翻頁、閃白閃黑、甩鏡、故障；整段就是一次換場，放在兩段之間）、元件（ui-* 社群介面、hook-* 開場收尾、estate-* 房產資訊；數字、評分、工程進度只用使用者提供或可查證的資料，資料來源用 estate-source 標註）、圖片運鏡（${EFFECTS.filter((f) => secOf(f) === 'photo').length} 個照片模組）、地圖區位（含捷運／鐵路路網 transit-*）、物件特效（水滴、魔術方塊、星空宇宙）、插畫（星空物件系列：天體／飛越／推近地球用 build_cosmos_scene，隕石與俯瞰用 build_nature_scene、交通工具用 build_transport_scene、海底世界用 build_illustration_scene）、格局（plan-*：戶別定位、逐間高亮、看屋動線、單房聚焦、公設導覽、戶型比較、平面立體傾斜，用 build_plan_scene）、圖表特效（chart-* 共 20 種，words 一行一筆「標籤 數值」，格式見 get_effect 的 word_hint）、圖解動畫（工法剖面等客製示意圖，文字可換、構圖需改寫原始碼）。所有特效都是原生 HTML/CSS/JS。
你可以：查特效（search_effects / get_effect）、把多個特效組成 Combo 動畫（compose_combo），並存進 Combo 庫（save_combo）當作日後參考（list_combos / get_combo）。

組 Combo 的建議流程：
1. 先釐清用途、比例（YouTube 16:9、Shorts 9:16）、總長度與要出現的文字。
2. 文字段落先決定用途（開場標題 open、字幕標註 caption、資訊字卡 info、轉場切換 trans、強調情緒 emph、風格氛圍 mood），再用 search_effects 的 use 參數挑特效，留意 word_hint 的文字格式。同一個 Combo 盡量不要重複同一招；建案片可先參考 list_categories 回傳的 kits（套組）。
3. 用 compose_combo 預覽，把 play_url 給使用者看。
4. 依回饋調整後，用 save_combo 儲存，並附上 tags 與 brief 方便日後搜尋。
地圖片段請用 build_map_scene（「從太空降落到基地、畫出 A/B 棟」用 site 範本或 descend 參數；「從這裡到 A、B、C 都方便」用 routes 參數或 routes 範本）、水滴請用 build_drop_scene、照片運鏡請用 build_photo_scene、魔術方塊／星空背景請用 build_object_scene；天體、低空飛越及推近地球精修插畫用 build_cosmos_scene（mode=orbit｜flyover｜earthzoom，body=gas｜sun｜moon｜earth｜mars，依 mode 選擇）；隕石及俯瞰精修插畫請用 build_nature_scene（隕石 mode=meteor，style=rock｜ice｜lava｜gold；俯瞰 mode=city｜river｜mountain｜grass｜farm｜coast｜forest｜highway）；交通工具七招精修插畫請用 build_transport_scene（mode=car｜carriage｜plane｜rocket｜train｜ship｜balloon）；海底世界七招精修插畫請用 build_illustration_scene（mode=fish｜dolphins｜whale｜shark｜coral｜deep｜submarine；每招有專屬參數） 產生段落，再把回傳的 combo_scene 放進 compose_combo / save_combo。\n圖片在使用者電腦上時，用 build_photo_scene 回傳的 local_render 方法在本機逐格渲染（引擎 /r/photo.js，地圖 /r/map.js、水滴 /r/drop.js 同理），不要自己重寫動畫。\n銳利水滴（crisp-drop）也可直接在 words 加入設定行，例如 "@shape=circle;color=#a6d4f2;color2=#5b9bd5;pos=beside;sats=6"：shape＝circle｜cloud｜flower｜pebble｜random，pos＝inside｜beside｜above｜below，seed 改變隨機形狀，x/y、tx/ty 為 0–1 的水滴與文字位置；~ 開頭的行是英文小字。此特效完全不用模糊，適合疊進影片。
字型：Combo 的 font（整支）與 scenes[].font（單段）可選字型組合，依段落情緒挑：數據、資訊、標題用 sharp（預設）；開箱、生活、通勤用 round；質感建案、片頭大標用 serif；旁白金句、心得用 hand；俏皮吐槽用 cute。一支影片以 2–3 組為限，同類段落維持同一組，避免每段都換。\n手動微調的來回流程：build_* 或 get_combo 會回傳 edit_url，使用者在網站工作室調整後「存回」得到預設代碼（例如 p7k2x）；之後用 get_preset 讀取，或在 scenes 直接寫 { \"preset\": \"p7k2x\" }。使用者提到代碼時，一律以預設內容為準，不要自行重做。\n寫入工具需要金鑰；文字內容若涉及價格或數據，請使用使用者提供、可查證的資料，不要自行編造。`;

export const isWriteTool = (name: string) => TOOLS.find((t) => t.name === name)?.write === true;
