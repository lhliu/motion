import type { Fx } from './types';
import { BASE_FX_CSS, fnSource, FONT_LINK, loopSeconds, scopeCss, varsCss, type Vars } from './engine';
import { fontPack } from './fonts';
import { MODULE_INFO, photoSceneFromWords, type PModule } from './photokit';
import { objSceneFromWords } from './objkit';

export type Ratio = '16:9' | '9:16' | '1:1';
export type PromptMode = 'web' | 'en' | 'video' | 'code';

export const PROMPT_MODES: { id: PromptMode; label: string; hint: string }[] = [
  { id: 'web', label: '網頁實作', hint: '貼給 Claude / ChatGPT，產生可錄影的 HTML 字卡' },
  { id: 'en', label: 'English', hint: '英文版，給 Cursor、v0、Bolt 等英文工具' },
  { id: 'video', label: 'AI 影片', hint: '給 Veo、Kling、Runway、Sora 等影片生成模型' },
  { id: 'code', label: '原始碼', hint: '這張字卡本身的完整 HTML，可直接存檔開啟' },
];

const ratioZh: Record<Ratio, string> = { '16:9': '16:9 橫式（YouTube）', '9:16': '9:16 直式（Shorts／Reels）', '1:1': '1:1 方形（貼文）' };
const ratioEn: Record<Ratio, string> = { '16:9': '16:9 landscape', '9:16': '9:16 vertical', '1:1': '1:1 square' };

const quoteWords = (w: string[]) => w.map((t) => `「${t}」`).join('、');
const quoteWordsEn = (w: string[]) => w.map((t) => `"${t}"`).join(', ');

export const buildPrompt = (fx: Fx, mode: PromptMode, words: string[], v: Vars, ratio: Ratio): string => {
  if (fx.cat === 'ocean' && mode !== 'code') {
    const sc = objSceneFromWords(words, 'ocean', { mode: fx.id.replace('obj-ocean-', '') });
    sc.ratio = ratio;
    const settings = JSON.stringify(sc, null, 2);
    if (mode === 'en' || mode === 'video') return `Create a ${ratioEn[ratio]} underwater animation: ${fx.en}.\n${fx.motionEn}\nUse crisp vector shapes without blur, shadows or glow. Preserve transparent alpha when requested. Add no typography unless supplied in scene.text.\nDuration: ${sc.loop} seconds.\nSETTINGS\n${settings}\nUse Motion Atlas build_object_scene with module "ocean", or /r/obj.js and MA_OBJ.drawObj(ctx, W, H, scene, t) for exact local frame rendering; preview and export must use the same timeline.`;
    return `請製作「${fx.zh}」海底物件動畫，${ratioZh[ratio]}，${sc.loop} 秒。\n${fx.motion}\n硬邊向量風格；不要增加文字入場。只有 scene.text 提供文字時才顯示字幕。透明背景必須保留 alpha。\n場景設定：\n${settings}\n使用 build_object_scene，module="ocean"，沿用 params；本機逐格渲染載入 /r/obj.js，呼叫 MA_OBJ.drawObj(ctx, W, H, scene, t)。請沿用同一套引擎預覽與匯出，並回傳物件工作室編輯連結。`;
  }
  if (fx.id.startsWith('photo-') && mode !== 'code') {
    const module = fx.id.slice(6) as PModule;
    const info = MODULE_INFO[module];
    const scene = photoSceneFromWords(words, module);
    const settings = JSON.stringify({ ...scene, images: scene.images.map((_, i) => info.names[i]) }, null, 2);
    if (mode === 'en') return `Create a ${ratioEn[ratio]} image animation: ${info.en}.
Use the supplied images in this slot order: ${info.names.join(' / ')}. Preserve transparent PNG/WebP alpha. Use placeholders when images are not supplied; do not invent or regenerate the user's images. No added title or text entrance animation.

MOTION
${fx.motionEn}

SETTINGS
${settings}

Use Motion Atlas build_photo_scene with module "${module}" and these parameters, or its shared /r/photo.js renderer for local frame export. Use the same deterministic timeline for preview and export. Return a preview and an editable scene. Respect reduced motion by showing the resolved final frame.`;
    if (mode === 'video') return `${ratioEn[ratio]} image animation, ${info.en}. Animate the supplied reference images: ${fx.motionEn} Preserve the source content and composition. Do not add titles, captions, or typography unless explicitly supplied. Duration ${scene.loop} seconds.\n\n精準裁切、透明輪廓與換景請優先使用圖片工作室或 build_photo_scene；影片生成模型不保證能忠實保留原圖與遮罩。`;
    return `請製作「${info.zh}（${info.en}）」圖片動畫，比例 ${ratioZh[ratio]}。
圖片插槽依序為：${info.names.join('、')}。請使用我提供的照片，保留 PNG／WebP 的透明輪廓；沒有圖片時先顯示示意圖，不要自行重繪照片，也不要另加文字入場。

【動態】
${fx.motion}

【場景設定】
${settings}

請優先使用 Motion Atlas 的 build_photo_scene，module 填 "${module}"，沿用上述參數；本機逐格渲染使用同一套 /r/photo.js 引擎，不要另外重寫動畫。提供預覽與圖片工作室的編輯連結，之後可存成預設或加入 Combo。減少動態模式直接顯示完成畫面。`;
  }
  const dur = loopSeconds(fx);
  if (mode === 'web')
    return `請幫我用 HTML + CSS（必要時加少量原生 JavaScript）做一張「${fx.zh}（${fx.en}）」文字動態字卡。

【畫面】
- 比例：${ratioZh[ratio]}，畫面置中、滿版，可以直接螢幕錄影使用
- 文字內容：${quoteWords(words)}
- 字體：${fontPack(v.font).promptZh}
- 配色：背景 ${v.bg}、文字 ${v.fg}、強調色 ${v.ac}

【動態】
${fx.motion}

【規格】
- 動畫無縫循環，一個循環約 ${dur} 秒
- 盡量只動 transform、opacity、filter，確保 60fps 不掉格
- 字級用 vw/vh 或 container query 單位，換比例也不會跑版
- 做成單一 HTML 檔，不依賴外部函式庫（字體除外）
- 支援 prefers-reduced-motion：使用者開啟減少動態時，直接顯示完成畫面
- 在檔案最上方用 CSS 變數集中管理文字、顏色、秒數，方便我之後改`;

  if (mode === 'en')
    return `Build a "${fx.en}" kinetic typography title card using HTML + CSS (plus a little vanilla JavaScript only if needed).

SCENE
- Aspect ratio: ${ratioEn[ratio]}, full-bleed and centered, ready for screen recording
- Text: ${quoteWordsEn(words)}
- Typeface: ${fontPack(v.font).promptEn} — the text may be Traditional Chinese
- Colors: background ${v.bg}, text ${v.fg}, accent ${v.ac}

MOTION
${fx.motionEn}

REQUIREMENTS
- Seamless loop, roughly ${dur}s per cycle
- Animate only transform / opacity / filter where possible for a smooth 60fps
- Size type with vw/vh or container query units so it survives ratio changes
- Single self-contained HTML file, no libraries (fonts excepted)
- Respect prefers-reduced-motion by showing the final resolved frame
- Expose text, colors and timing as CSS custom properties at the top of the file`;

  if (mode === 'video')
    return `${ratioEn[ratio]} motion graphics title card, kinetic typography. ${fx.motionEn} The on-screen text reads ${quoteWordsEn(words)} in a heavy geometric sans-serif, perfectly legible and correctly spelled. Flat solid ${v.bg} background, ${v.fg} lettering with ${v.ac} accents. Clean vector design, no people, no extra objects, no camera shake unless described, crisp edges, smooth 60fps, seamless ${dur}-second loop.

---
提醒：目前 AI 影片模型常把中文字寫錯或變形。中文字卡建議用「網頁實作」版本產生後螢幕錄影，或先用英文／數字生成動態，再到剪輯軟體疊上正確的中文字。`;

  return exportHtml(fx, words, v, ratio);
};

const ratioCss: Record<Ratio, string> = {
  '16:9': 'width:min(100vw,177.78vh);aspect-ratio:16/9',
  '9:16': 'height:min(100vh,177.78vw);aspect-ratio:9/16',
  '1:1': 'width:min(100vw,100vh);aspect-ratio:1',
};

/** 產生單一 HTML 檔，內容與網站上看到的完全一致 */
export const exportHtml = (fx: Fx, words: string[], v: Vars, ratio: Ratio): string => {
  const css = scopeCss(fx).trim();
  const script = fx.run
    ? `\n<script>\n${fx.globals ?? ''}\n${fnSource(fx.run)}(document.querySelector('.fx'), ${JSON.stringify(words)});\n</script>`
    : '';
  return `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${fx.zh} ${fx.en} — Motion Atlas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_LINK}" rel="stylesheet">
<style>
/* 從 motion.leichthub.com 匯出：${fx.zh}（${fx.en}） */
:root{${varsCss(v)}}
html,body{margin:0;height:100%;background:var(--bg);display:grid;place-items:center;overflow:hidden}
.stage{position:relative;${ratioCss[ratio]};container-type:size;overflow:hidden}
@media (prefers-reduced-motion:reduce){.fx *{animation-play-state:paused!important}}
${BASE_FX_CSS}
${css}
</style>
</head>
<body>
<div class="stage"><div class="fx fx-${fx.id}">${fx.html(words)}</div></div>${script}
</body>
</html>
`;
};
