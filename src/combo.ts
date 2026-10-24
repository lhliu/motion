import { isCosmicFx, cosmicFromWords, COSMOS } from './cosmos';
import { ensureEngines, fxGlobals } from './engines';
import { isNatureFx, natureFromWords, NATURE } from './nature';
import { isTransportFx, transportFromWords, TRANSPORT } from './transport';
import { isIllustrationFx, illustrationFromWords, ILLUSTRATION } from './illustration';
// Combo：把多個特效依序串成一段動畫。網站、MCP、分享頁共用這支檔案，不可在載入時碰 DOM。
import { ALL_EFFECTS, EFFECTS, NUM, PALETTES } from './data';
import { BASE_FX_CSS, fnSource, loopSeconds, scopeCss, toneVars, varsCss } from './engine';
import type { Ratio } from './prompts';
import type { Fx, Palette, Tone } from './types';
import { esc } from './util';
import { FACE_IDS, FONT_IDS, familiesFor, fontLink, fontPack, WEIGHT_IDS } from './fonts';
import { isPhotoFx, MODULE_INFO, type PScene } from './photokit';
import { isObjFx, OBJ_INFO, type OScene } from './objkit';

export type Transition = 'cut' | 'fade' | 'slide' | 'zoom' | 'push' | 'iris' | 'door' | 'page' | 'flash' | 'whip' | 'glitch';
/** 段落轉場：zh 給介面，desc 給提示詞與 MCP */
export const TRANSITION_INFO: Record<Transition, { zh: string; desc: string }> = {
  cut: { zh: '硬切', desc: '直接硬切' },
  fade: { zh: '淡入', desc: '0.45 秒交叉淡入淡出' },
  slide: { zh: '推移', desc: '0.55 秒由右往左推移' },
  zoom: { zh: '放大', desc: '0.5 秒放大穿越' },
  push: { zh: '色塊推擠', desc: '0.9 秒：字色、輔色、主色三層全幅色塊由右推入蓋滿，再往左推走露出下一段' },
  iris: { zh: '圓形擦除', desc: '0.9 秒：主色圓形從中央長大蓋滿，下一段再以圓形從中央展開' },
  door: { zh: '開門', desc: '1.2 秒：兩扇主色門板關上再往外 3D 打開，露出下一段' },
  page: { zh: '翻頁', desc: '0.8 秒：上一段像書頁以左邊為軸 3D 翻走，露出下面的下一段' },
  flash: { zh: '閃白', desc: '0.5 秒：全白閃兩下，第二下硬切到下一段' },
  whip: { zh: '甩鏡', desc: '0.6 秒：上一段斜切甩出、硬邊速度線掃過，下一段從右甩進回正' },
  glitch: { zh: '故障', desc: '0.55 秒：畫面階梯錯位加色條閃爍，錯位中換段後歸零' },
};
export const TRANSITIONS = Object.keys(TRANSITION_INFO) as Transition[];
export const RATIOS: Ratio[] = ['16:9', '9:16', '1:1'];
const TONES: Tone[] = ['ink', 'paper', 'accent'];

export interface ComboScene {
  effect: string;
  words?: string[];
  seconds?: number;
  tone?: Tone;
  /** 字型組合代碼，省略＝跟著 Combo 的 font */
  font?: string;
  /** 字體選擇器：hei｜ming，省略＝跟字型組合 */
  face?: string;
  /** 字重：bold｜medium｜light，省略＝特效原字重 */
  weight?: string;
  /** 進入這段的轉場，省略＝跟著整支的 transition */
  transition?: Transition;
  note?: string;
}

/** 疊加圖層：常駐在段落上方的元件（系列角標、資料來源條、子母畫面框⋯），背景透明 */
export interface ComboOverlay {
  effect: string;
  words?: string[];
  /** 從第幾段開始（1 起算），省略＝第 1 段 */
  from?: number;
  /** 到第幾段結束（含），省略＝最後一段 */
  to?: number;
  tone?: Tone;
}

export interface Combo {
  id?: string;
  title: string;
  brief?: string;
  notes?: string;
  tags?: string[];
  palette?: string;
  accent?: string;
  ratio?: Ratio;
  transition?: Transition;
  /** 整支的字型組合，省略＝俐落黑體 */
  font?: string;
  scenes: ComboScene[];
  overlays?: ComboOverlay[];
  source?: string;
  created_at?: string;
  updated_at?: string;
}

const byId = new Map(ALL_EFFECTS.map((f) => [f.id, f]));
export const findEffect = (id: string): Fx | undefined => {
  const exact=byId.get(id);if(exact)return exact;
  const number=String(id).replace(/^#/, '').replace(/^0+/, '');
  // A retained public number opens the merged editor; explicit legacy IDs still play the original.
  return EFFECTS.find(f=>String(NUM.get(f.id))===number)
    ?? ALL_EFFECTS.find(f=>String(NUM.get(f.id))===number)
    ?? ALL_EFFECTS.find(f=>String(f.no)===number); // Previously published #253–255 remain valid aliases.
};

const isHex = (s: unknown): s is string => typeof s === 'string' && /^#[0-9a-f]{6}$/i.test(s);
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** 驗證並整理 Combo；回傳錯誤清單，讓 AI 知道哪裡要改 */
export const normalizeCombo = (input: unknown): { combo: Combo; errors: string[] } => {
  const errors: string[] = [];
  const o = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const title = str(o.title, 80);
  if (!title) errors.push('title 必填（Combo 名稱）');
  const rawScenes = Array.isArray(o.scenes) ? o.scenes : [];
  if (!rawScenes.length) errors.push('scenes 至少要有一個段落');
  if (rawScenes.length > 20) errors.push('scenes 最多 20 段');
  const scenes: ComboScene[] = rawScenes.slice(0, 20).map((s, i) => {
    const r = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
    const fx = findEffect(str(r.effect, 40));
    if (!fx) errors.push(`scenes[${i}].effect「${String(r.effect)}」不存在，請先用 search_effects 查 id`);
    const long = isCosmicFx(fx?.id??'') || isNatureFx(fx?.id??'') || isTransportFx(fx?.id??'') || isIllustrationFx(fx?.id ?? '') || fx?.id === 'map-overlay' || fx?.id === 'crisp-drop' || isPhotoFx(fx?.id ?? '') || isObjFx(fx?.id ?? '');
    const diagram = fx?.cat === 'diagram';
    const max = long ? 900_000 : diagram ? 180 : 60;
    const rows = Array.isArray(r.words) ? r.words.map((w) => str(w, max)) : typeof r.words === 'string' ? (long ? [str(r.words, max)] : diagram ? str(r.words, 4320).split('\n').map((w) => str(w, max)) : str(r.words, 200).split(/\s*\/\s*|\n/)) : undefined;
    // 圖解的文字按位置對應部位；空白也必須保留，否則後面的名稱會錯位。
    const words = rows ? (diagram ? rows : rows.filter(Boolean)).slice(0, diagram ? 24 : 12) : undefined;
    const sec = Number(r.seconds);
    const tone = TONES.includes(r.tone as Tone) ? (r.tone as Tone) : undefined;
    if (r.font !== undefined && r.font !== '' && !FONT_IDS.includes(r.font as never)) errors.push(`scenes[${i}].font「${String(r.font)}」不存在，可用：${FONT_IDS.join('｜')}`);
    const font = FONT_IDS.includes(r.font as never) ? (r.font as string) : undefined;
    return {
      effect: fx?.id ?? str(r.effect, 40),
      ...(words?.length ? { words } : {}),
      ...(Number.isFinite(sec) && sec > 0 ? { seconds: Math.min(20, Math.max(0.8, Math.round(sec * 100) / 100)) } : {}),
      ...(tone ? { tone } : {}),
      ...(font ? { font } : {}),
      ...(FACE_IDS.includes(r.face as never) ? { face: r.face as string } : {}),
      ...(WEIGHT_IDS.includes(r.weight as never) ? { weight: r.weight as string } : {}),
      ...(TRANSITIONS.includes(r.transition as Transition) ? { transition: r.transition as Transition } : {}),
      ...(str(r.note, 200) ? { note: str(r.note, 200) } : {}),
    };
  });
  const rawOv = Array.isArray(o.overlays) ? o.overlays : [];
  if (rawOv.length > 6) errors.push('overlays 最多 6 層');
  const overlays: ComboOverlay[] = rawOv.slice(0, 6).flatMap((v, i) => {
    const r = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
    const fx = findEffect(str(r.effect, 40));
    if (!fx) {
      errors.push(`overlays[${i}].effect「${String(r.effect)}」不存在`);
      return [];
    }
    if (fx.cat === 'diagram' || isPhotoFx(fx.id) || isObjFx(fx.id) || fx.id === 'map-overlay') errors.push(`overlays[${i}]：${fx.zh}不適合當疊加圖層，建議用元件（ui-*、hook-*、estate-source）或字幕條`);
    const words = Array.isArray(r.words) ? r.words.map((w) => str(w, 60)).filter(Boolean).slice(0, 12) : typeof r.words === 'string' ? str(r.words, 200).split(/\s*\/\s*|\n/).filter(Boolean) : [];
    const n = rawScenes.length || 1;
    const from = Math.min(n, Math.max(1, Math.round(Number(r.from) || 1)));
    const to = Math.min(n, Math.max(from, Math.round(Number(r.to) || n)));
    return [{ effect: fx.id, ...(words.length ? { words } : {}), ...(from > 1 ? { from } : {}), ...(to < n ? { to } : {}), ...(TONES.includes(r.tone as Tone) ? { tone: r.tone as Tone } : {}) }];
  });
  const palette = PALETTES.some((p) => p.id === o.palette) ? (o.palette as string) : 'leicht';
  const combo: Combo = {
    title,
    scenes,
    palette,
    ratio: RATIOS.includes(o.ratio as Ratio) ? (o.ratio as Ratio) : '16:9',
    transition: TRANSITIONS.includes(o.transition as Transition) ? (o.transition as Transition) : 'fade',
  };
  if (overlays.length) combo.overlays = overlays;
  if (o.font !== undefined && o.font !== '' && !FONT_IDS.includes(o.font as never)) errors.push(`font「${String(o.font)}」不存在，可用：${FONT_IDS.join('｜')}`);
  if (FONT_IDS.includes(o.font as never) && o.font !== 'sharp') combo.font = o.font as string;
  if (str(o.brief, 1000)) combo.brief = str(o.brief, 1000);
  if (str(o.notes, 2000)) combo.notes = str(o.notes, 2000);
  if (isHex(o.accent)) combo.accent = o.accent.toLowerCase();
  if (Array.isArray(o.tags)) combo.tags = o.tags.map((t) => str(t, 20).replace(/^#/, '')).filter(Boolean).slice(0, 10);
  if (str(o.source, 40)) combo.source = str(o.source, 40);
  return { combo, errors };
};

export const comboPalette = (c: Combo): Palette => {
  const base = PALETTES.find((p) => p.id === c.palette) ?? PALETTES[0];
  return c.accent ? { ...base, accent: c.accent } : base;
};

/** 段落文字摘要：地圖場景與水滴設定不直接印出 JSON */
export const sceneSummary = (effect: string, words: string[], quote = false): string => {
  if(isCosmicFx(effect)){const sc=cosmicFromWords(words,effect);return `精修插畫「${COSMOS.modes[sc.mode].zh}・${COSMOS.bodies[sc.body].zh}」 · ${sc.speed} 倍速`;}
  if(isNatureFx(effect)){const sc=natureFromWords(words,effect);return `精修插畫「${NATURE.modes[sc.mode].zh}${sc.mode==='meteor'?'・'+NATURE.styles[sc.style].zh:''}」 · ${NATURE.environments(sc.mode)[sc.background].zh} · ${sc.speed} 倍速`;}
  if(isTransportFx(effect)){const sc=transportFromWords(words,effect);return `精修插畫「${TRANSPORT.modes[sc.mode].zh}」 · ${TRANSPORT.backgrounds[sc.background].zh} · ${sc.speed} 倍速`;}
  if (isIllustrationFx(effect)) { const sc=illustrationFromWords(words,effect);return `精修插畫「${sc.mode==='whale'?ILLUSTRATION.animals[sc.animal].zh:ILLUSTRATION.modes[sc.mode].zh}」 · ${ILLUSTRATION.backgrounds[sc.background].zh} · ${sc.speed} 倍速`; }
  const q = (x: string) => (quote ? `「${x}」` : x);
  if (effect === 'map-overlay') {
    const j = words.find((x) => x.trim().startsWith('{'));
    try {
      const sc = JSON.parse(j ?? '') as { els?: { type: string; text?: string; lines?: string[]; fg?: string }[]; bgUrl?: string };
      const name: Record<string, string> = { tag: '標題', label: '基地標籤', road: '道路', info: '資訊卡', stat: '數據卡', text: '文字', routes: '路線', badge: '標記', bar: '資訊條' };
      const parts = (sc.els ?? [])
        .filter((e) => name[e.type])
        .map((e) => `${name[e.type]}${q(e.type === 'routes' ? [e.text, (e.lines ?? []).map((l) => l.split('|')[0]).join('、')].filter(Boolean).join(' → ') : e.type === 'info' || e.type === 'stat' || e.type === 'bar' ? [e.text, ...(e.lines ?? [])].filter(Boolean).join(' ').replace(/[*|]/g, ' ').replace(/\s+/g, ' ').trim() : (e.text ?? ''))}`);
      return `地圖場景（${sc.els?.length ?? 0} 個元件${sc.bgUrl ? '、含底圖' : '、無底圖'}）：${parts.join('、')}`;
    } catch {
      return '地圖場景（預設範本）';
    }
  }
  if (isObjFx(effect)) {
    const j = words.find((x) => x.trim().startsWith('{'));
    if (!j) return words.map(q).join(quote ? '、' : ' / ');
    try {
      const sc = JSON.parse(j) as OScene;
      return `物件特效「${OBJ_INFO[sc.module]?.zh ?? sc.module}」${sc.text?.lines?.length ? `：${sc.text.lines.map((l) => q(l.replace(/^~/, ''))).join(quote ? '、' : ' / ')}` : ''}`;
    } catch {
      return '物件特效';
    }
  }
  if (isPhotoFx(effect)) {
    const j = words.find((x) => x.trim().startsWith('{'));
    try {
      const sc = JSON.parse(j ?? '') as PScene;
      const n = (sc.images ?? []).filter(Boolean).length;
      return `圖片運鏡「${MODULE_INFO[sc.module]?.zh ?? sc.module}」（${n ? `${n} 張圖` : '未放圖'}）${sc.caption?.text ? `：字幕${q(sc.caption.text)}` : ''}`;
    } catch {
      const m = effect.slice(6) as PScene['module'];
      return `圖片運鏡「${MODULE_INFO[m]?.zh ?? m}」（示意圖）${words.length ? `：字幕${q(words.join(' '))}` : ''}`;
    }
  }
  if (effect === 'crisp-drop') {
    const lines = words.filter((x) => !x.startsWith('@')).map((x) => x.replace(/^~/, ''));
    const opts = words.filter((x) => x.startsWith('@')).join(' ');
    return `${lines.map(q).join(quote ? '、' : ' / ')}${opts ? `（水滴設定 ${opts}）` : ''}`;
  }
  if (effect.startsWith('mx-')) {
    // 地圖招式的「@set」行是拖曳位置與底圖（可能是很長的圖片資料），摘要只說明有沒有調過
    const set = words.find(isMxSet) ?? '', text = words.filter((x) => !isMxSet(x));
    const tags = [/"pos"/.test(set) ? '已調整位置' : '', /"bg"/.test(set) ? '自訂底圖' : ''].filter(Boolean).join('・');
    return `${quote ? text.map(q).join('、') : text.join(' / ')}${tags ? `（${tags}）` : ''}`;
  }
  return quote ? words.map(q).join('、') : words.join(' / ');
};

/** 地圖招式編輯器寫入的設定行 */
export const isMxSet = (l: string) => /^@set\s*\{/.test(String(l).trim());

export const sceneSeconds = (s: ComboScene): number => {
  if (s.seconds) return s.seconds;
  if(isCosmicFx(s.effect))return cosmicFromWords(s.words,s.effect).loop;
  if(isNatureFx(s.effect))return natureFromWords(s.words,s.effect).loop;
  if(isTransportFx(s.effect))return transportFromWords(s.words,s.effect).loop;
  if (isIllustrationFx(s.effect)) return illustrationFromWords(s.words,s.effect).loop;
  // 圖片運鏡預設 6 秒動畫＋1 秒停留
  if (isPhotoFx(s.effect)) return 7;
  if (isObjFx(s.effect)) return 6;
  const fx = findEffect(s.effect);
  if (fx && typeof fx.duration === 'number' && Number.isFinite(fx.duration) && fx.duration > 0) return fx.duration;
  return fx ? Math.min(6, Math.max(2.4, loopSeconds(fx))) : 3;
};

export const totalSeconds = (c: Combo) => Math.round(c.scenes.reduce((a, s) => a + sceneSeconds(s), 0) * 10) / 10;

/** 給人看的段落摘要 */
export const comboOutline = (c: Combo): string =>
  c.scenes
    .map((s, i) => {
      const fx = findEffect(s.effect);
      const w = sceneSummary(s.effect, s.words ?? fx?.sample ?? []);
      return `${i + 1}. ${fx ? `#${String(NUM.get(fx.id)).padStart(2, '0')} ${fx.zh}（${fx.id}）` : s.effect}｜${sceneSeconds(s)} 秒${s.font ? `｜字型：${fontPack(s.font).zh}` : ''}｜${w}${s.note ? `｜${s.note}` : ''}`;
    })
    .join('\n') +
  (c.overlays?.length
    ? '\n' +
      c.overlays
        .map((o) => {
          const fx = findEffect(o.effect);
          return `疊加：${fx ? `#${String(NUM.get(fx.id)).padStart(2, '0')} ${fx.zh}（${fx.id}）` : o.effect}｜第 ${o.from ?? 1}–${o.to ?? c.scenes.length} 段｜${(o.words ?? fx?.sample ?? []).join(' / ')}`;
        })
        .join('\n')
    : '');

/** 平台介面會擋住的區域（Shorts／Reels 標題列、說明文字、右側按鈕；橫式播放器控制列），預覽時標出來 */
const SAFE_ZONES: Record<Ratio, string> = {
  '9:16': '<div class="safe"><i style="left:0;right:0;top:0;height:11%">頂部：帳號、搜尋列</i><i style="left:0;right:0;bottom:0;height:21%">底部：說明文字、音樂、帳號名稱</i><i style="right:0;top:42%;bottom:21%;width:15%">按讚 留言 分享</i></div>',
  '16:9': '<div class="safe"><i style="left:0;right:0;bottom:0;height:13%">播放器控制列、字幕</i><i style="right:0;top:0;width:22%;height:12%">資訊卡、浮水印</i></div>',
  '1:1': '<div class="safe"><i style="left:0;right:0;bottom:0;height:14%">底部：說明文字、控制列</i></div>',
};

/** 這段畫面的底色是不是淺色：依底色調；物件特效用場景自己的背景色 */
const sceneLight = (fx: Fx, words: string[], tone: Tone, pal: Palette): boolean => {
  let bg = tone === 'ink' ? pal.ink : tone === 'paper' ? pal.paper : pal.accent;
  if (isObjFx(fx.id)) {
    const m = /data-scene="([^"]+)"/.exec(fx.html(words));
    try {
      const sc = m && (JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')) as { bg?: string });
      if (sc && typeof sc.bg === 'string' && sc.bg !== 'transparent') bg = sc.bg.split(',')[0].trim();
    } catch {
      /* 解析不了就用底色調 */
    }
  }
  const h = /#([0-9a-f]{6})/i.exec(bg);
  if (!h) return false;
  const n = parseInt(h[1], 16);
  return (((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255 > 0.6;
};

const ratioCss: Record<Ratio, string> = {
  '16:9': 'width:min(100vw,177.78vh);aspect-ratio:16/9',
  '9:16': 'height:min(100vh,177.78vw);aspect-ratio:9/16',
  '1:1': 'width:min(100vw,100vh);aspect-ratio:1',
};

/** 網站前端用：先載入用到的繪製引擎再產生 HTML */
export const comboHtmlReady = async (c: Combo, opts: Parameters<typeof comboHtml>[1] = {}): Promise<string> => {
  await ensureEngines([...c.scenes.map((s) => findEffect(s.effect)), ...(c.overlays ?? []).map((o) => findEffect(o.effect))]);
  return comboHtml(c, opts);
};

/** 產生可獨立播放的 Combo HTML（依序播放、可循環）。用到的繪製引擎必須已載入（前端請用 comboHtmlReady） */
export const comboHtml = (c: Combo, opts: { hud?: boolean; loop?: boolean; safe?: boolean; hold?: boolean } = {}): string => {
  const pal = comboPalette(c);
  const ovs = (c.overlays ?? []).map((o) => ({ o, fx: findEffect(o.effect) })).filter((x): x is { o: ComboOverlay; fx: Fx } => !!x.fx);
  const used = [...new Set([...c.scenes.map((s) => s.effect), ...ovs.map((x) => x.fx.id)])].map((id) => findEffect(id)).filter((f): f is Fx => !!f);
  const css = used.map((f) => scopeCss(f).trim()).join('\n');
  const runs = used
    .filter((f) => f.run)
    .map((f) => `${JSON.stringify(f.id)}:${fnSource(f.run!)}`)
    .join(',\n');
  const scenes = c.scenes
    .map((s) => {
      const fx = findEffect(s.effect);
      if (!fx) return null;
      const words = s.words?.length ? s.words : fx.sample;
      return { fx, words, ms: Math.round(sceneSeconds(s) * 1000), tr: s.transition, lt: sceneLight(fx, words, s.tone ?? fx.tone, pal), vars: varsCss(toneVars(pal, s.tone ?? fx.tone, s.font ?? c.font, { face: s.face, weight: s.weight })) };
    })
    .filter((s): s is NonNullable<typeof s> => !!s);
  const templates = scenes.map((s, i) => `<template id="t${i}">${s.fx.html(s.words)}</template>`).join('\n') + ovs.map((x, i) => `<template id="o${i}">${x.fx.html(x.o.words?.length ? x.o.words : x.fx.sample)}</template>`).join('');
  const ovData = JSON.stringify(
    ovs.map(({ o, fx }) => ({
      id: fx.id,
      words: o.words?.length ? o.words : fx.sample,
      from: (o.from ?? 1) - 1,
      to: (o.to ?? scenes.length) - 1,
      // 疊加元件播到進場完成就定格，不重複進出
      hold: Math.round(Math.min(3, loopSeconds(fx) * 0.5) * 1000),
      // 沒指定配色＝自動：深底段落用深色系、淺底段落用淺色系，換段時跟著換
      ...(o.tone ? { vars: varsCss(toneVars(pal, o.tone, c.font)) } : { varsD: varsCss(toneVars(pal, 'ink', c.font)), varsL: varsCss(toneVars(pal, 'paper', c.font)) }),
    })),
  );
  const data = JSON.stringify(scenes.map((s) => ({ id: s.fx.id, words: s.words, ms: s.ms, vars: s.vars, name: s.fx.zh, lt: s.lt ? 1 : 0, ...(s.tr ? { tr: s.tr } : {}) })));
  const t = c.transition ?? 'fade';
  return `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.title)} — Motion Atlas Combo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontLink([...c.scenes.flatMap((s) => familiesFor({ font: s.font ?? c.font, face: s.face, css: findEffect(s.effect)?.css })), ...ovs.flatMap((x) => familiesFor({ font: c.font, css: x.fx.css }))])}" rel="stylesheet">
<style>
/* Motion Atlas Combo：${esc(c.title)}｜${scenes.length} 段｜約 ${totalSeconds(c)} 秒 */
html,body{margin:0;height:100%;background:#0b0b0b;display:grid;place-items:center;overflow:hidden;font-family:"Chiron Hei HK","Noto Sans TC",system-ui,sans-serif}
.stage{position:relative;${ratioCss[c.ratio ?? '16:9']};container-type:size;overflow:hidden;background:${pal.ink};--c1:${pal.paper};--c2:${pal.accent2};--c3:${pal.accent};--ci:${pal.ink}}
.stage>.fx{will-change:opacity,transform}
.in-fade{animation:cIn .45s ease both}.out-fade{animation:cOut .45s ease both}
.in-slide{animation:cSlideIn .55s cubic-bezier(.7,0,.2,1) both}.out-slide{animation:cSlideOut .55s cubic-bezier(.7,0,.2,1) both}
.in-zoom{animation:cZoomIn .5s cubic-bezier(.2,.8,.2,1) both}.out-zoom{animation:cZoomOut .5s ease-in both}
@keyframes cIn{from{opacity:0}}@keyframes cOut{to{opacity:0}}
@keyframes cSlideIn{from{transform:translateX(100%)}}@keyframes cSlideOut{to{transform:translateX(-100%)}}
@keyframes cZoomIn{from{transform:scale(.6);opacity:0}}@keyframes cZoomOut{to{transform:scale(1.6);opacity:0}}
.tc{position:absolute;inset:0;z-index:50;pointer-events:none;overflow:hidden}
.tc-push i{position:absolute;inset:0;transform:translateX(101%);animation:tPush .9s cubic-bezier(.75,0,.25,1) both}
.tc-push i:nth-child(1){background:var(--c1)}.tc-push i:nth-child(2){background:var(--c2);animation-delay:.05s}.tc-push i:nth-child(3){background:var(--c3);animation-delay:.1s}
@keyframes tPush{0%{transform:translateX(101%)}40%,50%{transform:none}100%{transform:translateX(-101%)}}
.tc-iris i{position:absolute;left:50%;top:50%;width:300cqmax;height:300cqmax;margin:-150cqmax 0 0 -150cqmax;border-radius:50%;background:var(--c3);transform:scale(0);animation:tIris .9s cubic-bezier(.7,0,.3,1) both}
@keyframes tIris{0%{transform:scale(0)}46%,100%{transform:scale(1)}}
.in-iris{z-index:60;animation:cIris .48s cubic-bezier(.7,0,.3,1) both}@keyframes cIris{from{clip-path:circle(0 at 50% 50%)}to{clip-path:circle(75% at 50% 50%)}}
.tc-door i{position:absolute;top:0;bottom:0;width:50%;background:var(--c3);border:1.2cqmin solid var(--c1);backface-visibility:hidden}
.tc-door i:nth-child(1){left:0;transform-origin:0 50%;animation:tDoorL 1.2s cubic-bezier(.6,0,.3,1) both}
.tc-door i:nth-child(2){right:0;transform-origin:100% 50%;animation:tDoorR 1.2s cubic-bezier(.6,0,.3,1) both}
.tc-door i::after{content:'';position:absolute;top:50%;width:1.6cqmin;height:7cqmin;border-radius:1cqmin;background:var(--c1)}
.tc-door i:nth-child(1)::after{right:6%}.tc-door i:nth-child(2)::after{left:6%}
@keyframes tDoorL{0%{transform:perspective(1600px) rotateY(-100deg)}38%,56%{transform:none}100%{transform:perspective(1600px) rotateY(-100deg)}}
@keyframes tDoorR{0%{transform:perspective(1600px) rotateY(100deg)}38%,56%{transform:none}100%{transform:perspective(1600px) rotateY(100deg)}}
.out-page{z-index:5;transform-origin:0 50%;backface-visibility:hidden;animation:cPage .8s cubic-bezier(.6,0,.3,1) both}@keyframes cPage{to{transform:perspective(2400px) rotateY(-110deg)}}
.tc-flash{background:#fff;opacity:0;animation:tFlash .52s steps(1) both}
@keyframes tFlash{0%,14%{opacity:0}15%,28%{opacity:1}29%,40%{opacity:0}41%,62%{opacity:1}63%,100%{opacity:0}}
.out-whip{animation:cWhipOut .18s cubic-bezier(.7,0,.9,.4) both}@keyframes cWhipOut{to{transform:translateX(-130%) skewX(25deg)}}
.in-whip{animation:cWhipIn .42s cubic-bezier(.1,.6,.3,1.15) both}@keyframes cWhipIn{from{transform:translateX(130%) skewX(25deg)}}
.tc-whip i{position:absolute;left:0;height:var(--h);top:var(--y);width:var(--l);background:var(--c);transform:translateX(110cqw);animation:tWhip .5s linear both;animation-delay:var(--d)}
@keyframes tWhip{to{transform:translateX(-110cqw)}}
.out-glitch{animation:cGlitch .26s steps(1) both}.in-glitch{animation:cGlitch .3s steps(1) reverse both}
@keyframes cGlitch{0%{transform:none}20%{transform:translateX(3%) skewX(-6deg)}40%{transform:translateX(-4%)}60%{transform:translate(2%,1%) skewX(8deg)}80%{transform:translateX(-2%)}100%{transform:none}}
.tc-glitch i{position:absolute;left:0;right:0;opacity:0;animation:tGlitch .56s steps(1) both}
.tc-glitch i:nth-child(1){top:22%;height:2cqh;background:var(--c3)}.tc-glitch i:nth-child(2){top:51%;height:1cqh;background:var(--c1);animation-delay:.04s}.tc-glitch i:nth-child(3){top:74%;height:3cqh;background:var(--c2);animation-delay:.08s}
@keyframes tGlitch{0%,100%{opacity:0}10%,30%,55%,75%{opacity:1}20%,45%,65%{opacity:0}}
.safe{position:absolute;inset:0;z-index:98;pointer-events:none;font:700 max(9px,1.6cqmin)/1.2 system-ui,sans-serif;color:#fff}
.safe i{position:absolute;display:flex;align-items:flex-start;padding:.6cqmin 1cqmin;background:repeating-linear-gradient(45deg,#ff3b3055 0 6px,#ff3b3022 6px 12px);outline:1px dashed #ff3b30;font-style:normal}
.ov{position:absolute;inset:0;z-index:70;pointer-events:none}.ov>.fx{background:transparent}.ov>.fx.bye{animation:cOut .3s ease both}
.hud{position:absolute;left:0;right:0;bottom:0;z-index:99;display:flex;gap:4px;padding:8px;pointer-events:none}
.hud i{flex:1;height:3px;border-radius:3px;background:#fff4;overflow:hidden}.hud i b{display:block;height:100%;width:0;background:#fff}
.hud i.done b{width:100%}
@media (prefers-reduced-motion:reduce){.fx *{animation-play-state:paused!important}}
${BASE_FX_CSS}
${css}
</style>
</head>
<body>
<div class="stage"${opts.hud === false ? '' : ' data-hud'}><div class="ov"></div>${opts.safe ? SAFE_ZONES[c.ratio ?? '16:9'] : ''}</div>
${templates}
<script>
const SCENES=${data.replace(/</g, '\\u003c')};
${[...new Set(used.map(fxGlobals).filter(Boolean))].join('\n')}
const RUNS={${runs}};
const OVERLAYS=${ovData.replace(/</g, '\\u003c')};
const TRANSITION=${JSON.stringify(t)};
const LOOP=${opts.loop === false ? 'false' : 'true'};
// 影片模式：網站卡片的動畫會無限循環（進場→停住→退場），放進影片要播一次就停在完成畫面。
// 找出每個無限動畫最長的「停住」區段，播到那裡就定格；同名動畫若是輪流出現（各自停住的時間互不重疊）就只留最後一個。
window.MA_ONCE=true;
const kfSig=(k)=>JSON.stringify(Object.keys(k).filter((p)=>!['offset','computedOffset','easing','composite'].includes(p)).sort().map((p)=>[p,k[p]]));
const hidden=(k)=>String(k.opacity).trim()==='0'||/scale[XY]?[(]0[,)]/.test(String(k.transform||''));
function freeze(root){
  // 轉場招式（cut-*）本身就是一次完整的換場：播到第一輪結尾
  if(/(^| )fx-cut-/.test(root.className)){root.getAnimations({subtree:true}).forEach((a)=>{try{if(a.effect.getTiming().iterations===Infinity)a.effect.updateTiming({iterations:1,fill:'both'});}catch(e){}});return;}
  const groups={};
  root.getAnimations({subtree:true}).forEach((a)=>{
    if(a.__ma)return;a.__ma=1;
    const ef=a.effect;if(!ef||!ef.getTiming||!ef.getKeyframes)return;
    const tm=ef.getTiming();if(tm.iterations!==Infinity||typeof tm.duration!=='number'||!tm.duration)return;
    const ks=ef.getKeyframes();let vis=null,any=null;
    for(let j=0;j+1<ks.length;j++){const o1=ks[j].computedOffset,o2=ks[j+1].computedOffset;
      // steps(1)／step-end 的區段雖然前後值不同，中間其實停在前一格
      if(o2-o1<0.1||(kfSig(ks[j])!==kfSig(ks[j+1])&&!/^steps[(]1[,)]|^step-end/.test(ks[j].easing||'')))continue;
      if(!any||o2-o1>any.e-any.s)any={s:o1,e:o2};
      if(!hidden(ks[j])&&(!vis||o2-o1>vis.e-vis.s))vis={s:o1,e:o2};}
    // 優先停在看得見的停住區段；只有隱藏區段的（例如擦除色塊）停在隱藏狀態；都沒有的是持續動態，保持循環
    let best=vis||any;
    // 來回動畫（0%=100%，中間一格，例如日出、上下漂浮）：停在中間那一格；中間比較淡（閃爍）就停在頭尾
    if(!best&&ks.length===3&&kfSig(ks[0])===kfSig(ks[2])){const m=ks[1].computedOffset;
      best=Number(ks[1].opacity)<Number(ks[0].opacity??1)?{s:1,e:1}:{s:m,e:m};}
    if(!best)return;
    const name=a.animationName||'';const d=tm.delay||0;
    (groups[name]=groups[name]||[]).push({a,tm,vis:!!vis,from:d+best.s*tm.duration,to:d+best.e*tm.duration});
  });
  Object.values(groups).forEach((g)=>{
    // 輪流出現：彼此看得見的停住時間沒有共同交集，只留最後一個
    const rot=g.length>1&&g.every((x)=>x.vis)&&Math.max(...g.map((x)=>x.from))>=Math.min(...g.map((x)=>x.to));
    const last=g.reduce((m,x)=>(x.from>m.from?x:m),g[0]);
    g.forEach((x)=>{
      const a=x.a,dur=x.tm.duration;
      // 停在第一次（或已經錯過就下一次）停住區段的尾端，同時退後一點點避開邊界
      let at=(rot&&x!==last?x.tm.delay+dur:x.to)-1;
      const ct=Number(a.currentTime)||0;
      if(ct>at)at+=Math.ceil((ct-at)/dur)*dur;
      a.__maEnd=at;
      setTimeout(()=>{try{a.pause();a.currentTime=at;}catch(e){}},Math.max(0,(at-ct)/(a.playbackRate||1)));
    });
  });
}
const stage=document.querySelector('.stage');
let i=0,cur=null,curClean=null,timer=0;
let hud=null;
if(stage.hasAttribute('data-hud')){hud=document.createElement('div');hud.className='hud';hud.innerHTML=SCENES.map(()=>'<i><b></b></i>').join('');stage.appendChild(hud);}
// 遮幕型轉場：先蓋住畫面，到 MID 毫秒才換段；END 後移除遮幕
const MID={push:400,iris:420,door:560,flash:230,whip:170,glitch:260};
const END={push:950,iris:950,door:1250,flash:560,whip:650,glitch:600,page:850,fade:600,slide:600,zoom:600};
const CURTAIN={push:'<i></i><i></i><i></i>',iris:'<i></i>',door:'<i></i><i></i>',flash:'',glitch:'<i></i><i></i><i></i>',whip:Array.from({length:14},(_,k)=>'<i style="--y:'+(8+(k*37)%84)+'%;--l:'+(30+(k*53)%60)+'cqw;--h:'+(.4+((k*7)%4)*.3)+'cqmin;--d:'+((k*29)%12)*.012+'s;--c:var('+(k%3?'--c3':'--c1')+')"></i>').join('')};
function show(){
  const sc=SCENES[i],idx=i;
  const t=cur?(sc.tr||TRANSITION):'cut';
  const prev=cur,prevClean=curClean;
  const drop=(ms)=>{if(!prev)return;const f=()=>{prevClean&&prevClean();prev.remove();};ms?setTimeout(f,ms):f();};
  const mount=(cls,below)=>{
    const el=document.createElement('div');
    el.className='fx fx-'+sc.id+(cls?' '+cls:'');
    el.setAttribute('style',sc.vars);var fw=/--fw:(\\d+)/.exec(sc.vars);if(fw)el.dataset.fw=fw[1];
    el.innerHTML=document.getElementById('t'+idx).innerHTML;
    stage.insertBefore(el,below&&prev&&prev.isConnected?prev:(stage.querySelector('.ov')||hud));
    cur=el;curClean=null;curLt=sc.lt;paintOv();
    // JS 動態可能稍後才產生元素，前 3 秒持續檢查新出現的動畫
    freeze(el);[120,400,900,1600,2500].forEach((ms)=>setTimeout(()=>el.isConnected&&freeze(el),ms));
    requestAnimationFrame(()=>{const r=RUNS[sc.id];if(r&&el.isConnected){try{curClean=r(el,sc.words)||null}catch(e){console.error(e)}}});
    return el;
  };
  if(!prev||t==='cut'){mount();drop(0);}
  else if(MID[t]!==undefined){
    const c=document.createElement('div');c.className='tc tc-'+t;c.innerHTML=CURTAIN[t];stage.insertBefore(c,stage.querySelector('.ov')||hud);setTimeout(()=>c.remove(),END[t]);
    if(t==='whip'||t==='glitch')prev.classList.add('out-'+t);
    setTimeout(()=>{mount(t==='iris'||t==='whip'||t==='glitch'?'in-'+t:'');drop(0);},MID[t]);
  }
  else if(t==='page'){prev.classList.add('out-page');mount('',true);drop(END.page);}
  else{mount('in-'+t);prev.classList.add('out-'+t);drop(600);}
  syncOverlays(idx);
  if(hud){[...hud.children].forEach((b,k)=>{b.className=k<i?'done':'';const bar=b.firstChild;bar.getAnimations().forEach(a=>a.cancel());if(k===i)bar.animate([{width:'0%'},{width:'100%'}],{duration:sc.ms,easing:'linear',fill:'forwards'});});}
  timer=setTimeout(()=>{i++;if(i>=SCENES.length){if(!LOOP)return;i=0;}show();},sc.ms);
}
const ovEl=stage.querySelector('.ov'),ovOn=[];let curLt=0;
const ovVars=(o)=>o.vars||(curLt?o.varsL:o.varsD);
function paintOv(){ovOn.forEach((m,n)=>{if(m&&!OVERLAYS[n].vars)m.el.setAttribute('style',ovVars(OVERLAYS[n]));});}
function syncOverlays(k){OVERLAYS.forEach((o,n)=>{const want=k>=o.from&&k<=o.to;const m=ovOn[n];
  if(want&&!m){const el=document.createElement('div');el.className='fx fx-'+o.id;el.setAttribute('style',ovVars(o));el.innerHTML=document.getElementById('o'+n).innerHTML;ovEl.appendChild(el);
    const rec={el,clean:null,t:setTimeout(()=>el.getAnimations({subtree:true}).forEach(a=>{try{a.pause()}catch(e){}}),o.hold)};ovOn[n]=rec;
    requestAnimationFrame(()=>{const r=RUNS[o.id];if(r&&el.isConnected){try{rec.clean=r(el,o.words)||null}catch(e){console.error(e)}}});}
  else if(!want&&m){ovOn[n]=null;clearTimeout(m.t);m.el.classList.add('bye');setTimeout(()=>{m.clean&&m.clean();m.el.remove();},320);}
});}
const go=()=>show();
const ready=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
${opts.hold ? `// 預覽截圖用：等外層頁面統一發號令再開始，讓每一格停在指定時間
addEventListener('error',(e)=>parent.postMessage({type:'ma-err',msg:String(e.message||e)},'*'));
const ce=console.error;console.error=(...a)=>{parent.postMessage({type:'ma-err',msg:a.map((x)=>x&&x.message||String(x)).join(' ')},'*');ce(...a);};
addEventListener('message',(e)=>{if(e.data&&e.data.type==='ma-go')setTimeout(go,Math.max(0,e.data.delay|0));});
ready.then(()=>parent.postMessage({type:'ma-loaded'},'*'));` : 'ready.then(go);'}
</script>
</body>
</html>
`;
};

/** 把 Combo 交給任何 AI 重做成單一網頁的提示詞 */
export const comboPrompt = (c: Combo): string => {
  const pal = comboPalette(c);
  const parts = c.scenes.map((s, i) => {
    const fx = findEffect(s.effect);
    if (!fx) return '';
    const w = sceneSummary(fx.id, s.words?.length ? s.words : fx.sample, true);
    return `${i + 1}.【${fx.zh} ${fx.en}】約 ${sceneSeconds(s)} 秒${i && s.transition ? `｜進場轉場：${TRANSITION_INFO[s.transition].desc}` : ''}｜文字：${w}${s.font && s.font !== (c.font ?? 'sharp') ? `\n   字體：${fontPack(s.font).promptZh}` : ''}\n   動態：${fx.motion}${s.note ? `\n   備註：${s.note}` : ''}`;
  });
  return `請用 HTML + CSS（必要時加少量原生 JavaScript）做一段連續播放的文字動態影片「${c.title}」，比例 ${c.ratio ?? '16:9'}，總長約 ${totalSeconds(c)} 秒，播完後循環。
${c.brief ? `\n【需求】${c.brief}\n` : ''}
【配色】深色 ${pal.ink}、淺色 ${pal.paper}、主色 ${pal.accent}、輔色 ${pal.accent2}；字體：${fontPack(c.font).promptZh}
【段落轉場】${TRANSITION_INFO[c.transition ?? 'fade'].desc}${c.scenes.some((s) => s.transition) ? '；個別段落另有指定，見分鏡' : ''}

【分鏡】
${parts.join('\n')}${
    c.overlays?.length
      ? `\n\n【疊加圖層】背景透明、疊在段落上方，進場完成後定格不重複：\n${c.overlays
          .map((o) => {
            const fx = findEffect(o.effect);
            return fx ? `- 【${fx.zh}】第 ${o.from ?? 1}–${o.to ?? c.scenes.length} 段｜文字：${(o.words?.length ? o.words : fx.sample).join(' / ')}\n  動態：${fx.motion}` : '';
          })
          .join('\n')}`
      : ''
  }

【規格】單一 HTML 檔、無外部函式庫（字體除外）；動畫以 transform／opacity 為主確保 60fps；字級用 vw/vh 或 container query 單位；頂部用 CSS 變數集中管理文字、顏色與每段秒數。`;
};

/** 網址安全的 Base64，用於未儲存的 Combo 預覽連結 */
export const encodeCombo = (c: Combo): string => {
  const json = JSON.stringify({ ...c, id: undefined, created_at: undefined, updated_at: undefined });
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
export const decodeCombo = (s: string): unknown => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '==='.slice((b64.length + 3) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0))));
};
