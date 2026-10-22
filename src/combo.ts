// Combo：把多個特效依序串成一段動畫。網站、MCP、分享頁共用這支檔案，不可在載入時碰 DOM。
import { EFFECTS, NUM, PALETTES } from './data';
import { BASE_FX_CSS, fnSource, FONT_LINK, loopSeconds, scopeCss, toneVars, varsCss } from './engine';
import type { Ratio } from './prompts';
import type { Fx, Palette, Tone } from './types';
import { esc } from './util';
import { isPhotoFx, MODULE_INFO, type PScene } from './photokit';

export type Transition = 'cut' | 'fade' | 'slide' | 'zoom';
export const TRANSITIONS: Transition[] = ['cut', 'fade', 'slide', 'zoom'];
export const RATIOS: Ratio[] = ['16:9', '9:16', '1:1'];
const TONES: Tone[] = ['ink', 'paper', 'accent'];

export interface ComboScene {
  effect: string;
  words?: string[];
  seconds?: number;
  tone?: Tone;
  note?: string;
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
  scenes: ComboScene[];
  source?: string;
  created_at?: string;
  updated_at?: string;
}

const byId = new Map(EFFECTS.map((f) => [f.id, f]));
export const findEffect = (id: string): Fx | undefined => byId.get(id) ?? EFFECTS.find((f) => String(NUM.get(f.id)) === String(id).replace(/^#/, '').replace(/^0+/, ''));

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
    const long = fx?.id === 'map-overlay' || fx?.id === 'crisp-drop' || isPhotoFx(fx?.id ?? '');
    const max = long ? 900_000 : 60;
    const words = Array.isArray(r.words) ? r.words.map((w) => str(w, max)).filter(Boolean).slice(0, 12) : typeof r.words === 'string' ? (long ? [str(r.words, max)] : str(r.words, 200).split(/\s*\/\s*|\n/).filter(Boolean)) : undefined;
    const sec = Number(r.seconds);
    const tone = TONES.includes(r.tone as Tone) ? (r.tone as Tone) : undefined;
    return {
      effect: fx?.id ?? str(r.effect, 40),
      ...(words?.length ? { words } : {}),
      ...(Number.isFinite(sec) && sec > 0 ? { seconds: Math.min(20, Math.max(0.8, Math.round(sec * 10) / 10)) } : {}),
      ...(tone ? { tone } : {}),
      ...(str(r.note, 200) ? { note: str(r.note, 200) } : {}),
    };
  });
  const palette = PALETTES.some((p) => p.id === o.palette) ? (o.palette as string) : 'leicht';
  const combo: Combo = {
    title,
    scenes,
    palette,
    ratio: RATIOS.includes(o.ratio as Ratio) ? (o.ratio as Ratio) : '16:9',
    transition: TRANSITIONS.includes(o.transition as Transition) ? (o.transition as Transition) : 'fade',
  };
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
  const q = (x: string) => (quote ? `「${x}」` : x);
  if (effect === 'map-overlay') {
    const j = words.find((x) => x.trim().startsWith('{'));
    try {
      const sc = JSON.parse(j ?? '') as { els?: { type: string; text?: string; lines?: string[]; fg?: string }[]; bgUrl?: string };
      const name: Record<string, string> = { tag: '標題', label: '基地標籤', road: '道路', info: '資訊卡', stat: '數據卡', text: '文字' };
      const parts = (sc.els ?? [])
        .filter((e) => name[e.type])
        .map((e) => `${name[e.type]}${q(e.type === 'info' || e.type === 'stat' ? [e.text, ...(e.lines ?? [])].filter(Boolean).join(' ').replace(/[*|]/g, ' ').replace(/\s+/g, ' ').trim() : (e.text ?? ''))}`);
      return `地圖場景（${sc.els?.length ?? 0} 個元件${sc.bgUrl ? '、含底圖' : '、無底圖'}）：${parts.join('、')}`;
    } catch {
      return '地圖場景（預設範本）';
    }
  }
  if (isPhotoFx(effect)) {
    const j = words.find((x) => x.trim().startsWith('{'));
    try {
      const sc = JSON.parse(j ?? '') as PScene;
      const n = (sc.images ?? []).filter(Boolean).length;
      return `圖片運鏡「${MODULE_INFO[sc.module]?.zh ?? sc.module}」（${n ? `${n} 張圖` : '未放圖'}）${sc.caption?.text ? `：字幕${q(sc.caption.text)}` : ''}`;
    } catch {
      return '圖片運鏡（預設）';
    }
  }
  if (effect === 'crisp-drop') {
    const lines = words.filter((x) => !x.startsWith('@')).map((x) => x.replace(/^~/, ''));
    const opts = words.filter((x) => x.startsWith('@')).join(' ');
    return `${lines.map(q).join(quote ? '、' : ' / ')}${opts ? `（水滴設定 ${opts}）` : ''}`;
  }
  return quote ? words.map(q).join('、') : words.join(' / ');
};

export const sceneSeconds = (s: ComboScene): number => {
  if (s.seconds) return s.seconds;
  const fx = findEffect(s.effect);
  return fx ? Math.min(6, Math.max(2.4, loopSeconds(fx))) : 3;
};

export const totalSeconds = (c: Combo) => Math.round(c.scenes.reduce((a, s) => a + sceneSeconds(s), 0) * 10) / 10;

/** 給人看的段落摘要 */
export const comboOutline = (c: Combo): string =>
  c.scenes
    .map((s, i) => {
      const fx = findEffect(s.effect);
      const w = sceneSummary(s.effect, s.words ?? fx?.sample ?? []);
      return `${i + 1}. ${fx ? `#${String(NUM.get(fx.id)).padStart(2, '0')} ${fx.zh}（${fx.id}）` : s.effect}｜${sceneSeconds(s)} 秒｜${w}${s.note ? `｜${s.note}` : ''}`;
    })
    .join('\n');

const ratioCss: Record<Ratio, string> = {
  '16:9': 'width:min(100vw,177.78vh);aspect-ratio:16/9',
  '9:16': 'height:min(100vh,177.78vw);aspect-ratio:9/16',
  '1:1': 'width:min(100vw,100vh);aspect-ratio:1',
};

/** 產生可獨立播放的 Combo HTML（依序播放、可循環） */
export const comboHtml = (c: Combo, opts: { hud?: boolean; loop?: boolean } = {}): string => {
  const pal = comboPalette(c);
  const used = [...new Set(c.scenes.map((s) => s.effect))].map((id) => findEffect(id)).filter((f): f is Fx => !!f);
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
      return { fx, words, ms: Math.round(sceneSeconds(s) * 1000), vars: varsCss(toneVars(pal, s.tone ?? fx.tone)) };
    })
    .filter((s): s is NonNullable<typeof s> => !!s);
  const templates = scenes.map((s, i) => `<template id="t${i}">${s.fx.html(s.words)}</template>`).join('\n');
  const data = JSON.stringify(scenes.map((s) => ({ id: s.fx.id, words: s.words, ms: s.ms, vars: s.vars, name: s.fx.zh })));
  const t = c.transition ?? 'fade';
  return `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.title)} — Motion Atlas Combo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_LINK}" rel="stylesheet">
<style>
/* Motion Atlas Combo：${esc(c.title)}｜${scenes.length} 段｜約 ${totalSeconds(c)} 秒 */
html,body{margin:0;height:100%;background:#0b0b0b;display:grid;place-items:center;overflow:hidden;font-family:"Noto Sans TC",system-ui,sans-serif}
.stage{position:relative;${ratioCss[c.ratio ?? '16:9']};container-type:size;overflow:hidden;background:${pal.ink}}
.stage>.fx{will-change:opacity,transform}
.in-fade{animation:cIn .45s ease both}.out-fade{animation:cOut .45s ease both}
.in-slide{animation:cSlideIn .55s cubic-bezier(.7,0,.2,1) both}.out-slide{animation:cSlideOut .55s cubic-bezier(.7,0,.2,1) both}
.in-zoom{animation:cZoomIn .5s cubic-bezier(.2,.8,.2,1) both}.out-zoom{animation:cZoomOut .5s ease-in both}
@keyframes cIn{from{opacity:0}}@keyframes cOut{to{opacity:0}}
@keyframes cSlideIn{from{transform:translateX(100%)}}@keyframes cSlideOut{to{transform:translateX(-100%)}}
@keyframes cZoomIn{from{transform:scale(.6);opacity:0}}@keyframes cZoomOut{to{transform:scale(1.6);opacity:0}}
.hud{position:absolute;left:0;right:0;bottom:0;z-index:99;display:flex;gap:4px;padding:8px;pointer-events:none}
.hud i{flex:1;height:3px;border-radius:3px;background:#fff4;overflow:hidden}.hud i b{display:block;height:100%;width:0;background:#fff}
.hud i.done b{width:100%}
@media (prefers-reduced-motion:reduce){.fx *{animation-play-state:paused!important}}
${BASE_FX_CSS}
${css}
</style>
</head>
<body>
<div class="stage"${opts.hud === false ? '' : ' data-hud'}></div>
${templates}
<script>
const SCENES=${data.replace(/</g, '\\u003c')};
${[...new Set(used.map((f) => f.globals).filter(Boolean))].join('\n')}
const RUNS={${runs}};
const TRANSITION=${JSON.stringify(t)};
const LOOP=${opts.loop === false ? 'false' : 'true'};
const stage=document.querySelector('.stage');
let i=0,cur=null,curClean=null,timer=0;
let hud=null;
if(stage.hasAttribute('data-hud')){hud=document.createElement('div');hud.className='hud';hud.innerHTML=SCENES.map(()=>'<i><b></b></i>').join('');stage.appendChild(hud);}
function show(){
  const sc=SCENES[i];
  const el=document.createElement('div');
  el.className='fx fx-'+sc.id;
  el.setAttribute('style',sc.vars);
  el.innerHTML=document.getElementById('t'+i).innerHTML;
  if(cur&&TRANSITION!=='cut')el.classList.add('in-'+TRANSITION);
  const prev=cur,prevClean=curClean;
  stage.insertBefore(el,hud);
  cur=el;curClean=null;
  requestAnimationFrame(()=>{const r=RUNS[sc.id];if(r&&el.isConnected){try{curClean=r(el,sc.words)||null}catch(e){console.error(e)}}});
  if(prev){
    if(TRANSITION==='cut'){prevClean&&prevClean();prev.remove();}
    else{prev.classList.add('out-'+TRANSITION);setTimeout(()=>{prevClean&&prevClean();prev.remove();},600);}
  }
  if(hud){[...hud.children].forEach((b,k)=>{b.className=k<i?'done':'';const bar=b.firstChild;bar.getAnimations().forEach(a=>a.cancel());if(k===i)bar.animate([{width:'0%'},{width:'100%'}],{duration:sc.ms,easing:'linear',fill:'forwards'});});}
  timer=setTimeout(()=>{i++;if(i>=SCENES.length){if(!LOOP)return;i=0;}show();},sc.ms);
}
const go=()=>show();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);else go();
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
    return `${i + 1}.【${fx.zh} ${fx.en}】約 ${sceneSeconds(s)} 秒｜文字：${w}\n   動態：${fx.motion}${s.note ? `\n   備註：${s.note}` : ''}`;
  });
  return `請用 HTML + CSS（必要時加少量原生 JavaScript）做一段連續播放的文字動態影片「${c.title}」，比例 ${c.ratio ?? '16:9'}，總長約 ${totalSeconds(c)} 秒，播完後循環。
${c.brief ? `\n【需求】${c.brief}\n` : ''}
【配色】深色 ${pal.ink}、淺色 ${pal.paper}、主色 ${pal.accent}、輔色 ${pal.accent2}；字體 Noto Sans TC 900
【段落轉場】${{ cut: '直接硬切', fade: '0.45 秒交叉淡入淡出', slide: '0.55 秒由右往左推移', zoom: '0.5 秒放大穿越' }[c.transition ?? 'fade']}

【分鏡】
${parts.join('\n')}

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
