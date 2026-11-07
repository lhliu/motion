// #692 字內實拍：純函式（時間、靜態 HTML、匯出判斷）。
// 畫面上的字形遮罩在 render/photo.ts 的 photoRenderer 裡，匯出時不能引用本檔。
import { photoSceneFromWords, RATIO_PX, type PScene } from './photokit';

export type StillKind = 'video-frame' | 'photo' | 'placeholder';

/** 產品說明用：.mp4 只代表容器，不能當成已經能解碼。 */
export const mp4ExtensionProvesCodec = false;

export type MediaKind = 'video' | 'image' | 'unknown';

export const mimeOf = (name: string, type: string): { kind: MediaKind; mime: string; extensionIsProof: false } => {
  const t = (type || '').toLowerCase();
  const n = (name || '').toLowerCase();
  const ext = n.endsWith('.webm') ? 'video/webm' : n.endsWith('.mov') ? 'video/quicktime' : n.endsWith('.mp4') ? 'video/mp4' : '';
  if (t.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/.test(n)) {
    return { kind: 'image', mime: t.startsWith('image/') ? t : 'image/png', extensionIsProof: false };
  }
  if (t.startsWith('video/')) return { kind: 'video', mime: t, extensionIsProof: false };
  if (ext) return { kind: 'video', mime: ext, extensionIsProof: false };
  return { kind: 'unknown', mime: t || 'application/octet-stream', extensionIsProof: false };
};

export const codecMessage = (mime: string, name = ''): string => {
  const label = [mime, name].filter(Boolean).join('，');
  return `此瀏覽器無法解碼這支影片（格式：${label || '未知'}）。副檔名不能保證編碼。請改用 Chrome，或先轉成 H.264 mp4／VP9 webm。`;
};

/** 字型還沒載入完就不要匯出。載入完但沒有指定家族時，由呼叫端明講改用系統字。 */
export const fontExportGate = (fontsReady: boolean): 'wait' | 'go' => (fontsReady ? 'go' : 'wait');

export const stillNotice = (kind: StillKind): string => {
  if (kind === 'video-frame') return '這是目前畫面的靜態預覽，檔案裡沒有影片。要看字內實拍的動態，請用 PNG 序列或 WebM。';
  if (kind === 'photo') return '這是你選擇的照片靜態版，不是影片。動態請用 PNG 序列或 WebM。';
  return '這是示意靜圖，不是實拍影片。請到圖片工作室放入影片，再用 PNG 序列或 WebM 輸出動態。';
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

/** 單一 HTML：一張靜態圖＋醒目說明。不放影片、不放 base64 影片、不放外部網址。 */
export const buildStillPreviewHtml = (opts: { kind: StillKind; pngDataUrl: string; width: number; height: number }): string => {
  const url = opts.pngDataUrl.trim();
  if (!/^data:image\/(png|webp|jpeg);base64,[a-z0-9+/=\s]+$/i.test(url)) throw new Error('靜態預覽只接受圖片 data URL');
  if (/data:video|octet-stream|<video|blob:/i.test(url)) throw new Error('不可把影片放進 HTML');
  const notice = stillNotice(opts.kind);
  const title = opts.kind === 'photo' ? '字內實拍 — 照片靜態版（不是影片）' : '字內實拍 — 靜態預覽（沒有影片）';
  return `<!doctype html>
<html lang="zh-Hant-TW" data-export="still" data-video="absent" data-kind="${opts.kind}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
html,body{margin:0;background:#12161e;color:#fff}
body{font:16px/1.55 "PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif}
.note{margin:0;padding:14px 18px;background:#8f1d1d;font-weight:700}
img{display:block;width:min(100%,${Math.max(1, Math.round(opts.width))}px);height:auto;margin:16px auto 32px;background:transparent}
</style>
</head>
<body>
<p class="note" role="status">${esc(notice)}</p>
<img alt="${esc(notice)}" width="${Math.max(1, Math.round(opts.width))}" height="${Math.max(1, Math.round(opts.height))}" src="${url}">
</body>
</html>
`;
};

export type HtmlExportInput = { hasVideo: boolean; videoReady: boolean; videoError: boolean; hasPhoto: boolean };

/** 有影片但解不開時停止。不會悄悄改成示意圖或照片。 */
export const htmlExportDecision = (input: HtmlExportInput): { ok: boolean; kind: StillKind | null; reason: string } => {
  if (input.hasVideo) {
    if (input.videoError || !input.videoReady) {
      return { ok: false, kind: null, reason: '影片無法解碼或還沒準備好，已停止匯出，不會改放示意圖或照片。' };
    }
    return { ok: true, kind: 'video-frame', reason: '' };
  }
  if (input.hasPhoto) return { ok: true, kind: 'photo', reason: '' };
  return { ok: true, kind: 'placeholder', reason: '' };
};

/** 畫格時間：起始秒 + 時間軸。有片長就循環，並避開剛好停在結尾。 */
export const matteMediaTime = (inSec: number, t: number, duration?: number): number => {
  const raw = Math.max(0, Number(inSec) || 0) + Math.max(0, Number(t) || 0);
  if (!duration || !Number.isFinite(duration) || duration <= 0) return raw;
  let x = raw % duration;
  if (x < 0) x += duration;
  if (duration > 0.05 && x > duration - 0.04) return 0;
  return x;
};

export const framePlan = (seconds: number, fps: number, inSec: number, duration?: number): { i: number; t: number; mediaT: number }[] => {
  const n = Math.max(1, Math.round(Math.max(0, seconds) * fps));
  return Array.from({ length: n }, (_, i) => {
    const t = i / fps;
    return { i, t, mediaT: matteMediaTime(inSec, t, duration) };
  });
};

/** 16:9 一行；9:16 依字數對半拆成兩行。與 render/photo.ts 的拆行相同。 */
export const titleLines = (text: string, ratio: PScene['ratio']): string[] => {
  const raw = text.replace(/\r/g, '').trim() || '這間3房';
  if (raw.includes('\n')) return raw.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 3);
  const chars = [...raw];
  if (ratio === '9:16' && chars.length >= 2) {
    const mid = Math.ceil(chars.length / 2);
    return [chars.slice(0, mid).join(''), chars.slice(mid).join('')];
  }
  return [raw];
};

type DrawPhoto = (ctx: CanvasRenderingContext2D, W: number, H: number, sc: PScene, t: number, imgs: unknown[]) => unknown;

/** 圖鑑／原始碼用的靜態 HTML。用已載入的照片引擎畫一格；沒有畫布時只留下說明，不假裝有影片。 */
export const renderTextMatteStillHtml = (words: string[], ratio: PScene['ratio']): string => {
  const scene = photoSceneFromWords(words, 'textmatte');
  scene.ratio = ratio;
  const [w0, h0] = RATIO_PX[ratio];
  const long = 960;
  const s = long / Math.max(w0, h0);
  const W = Math.max(2, Math.round(w0 * s));
  const H = Math.max(2, Math.round(h0 * s));
  const draw = (globalThis as unknown as { MA_PHOTO?: { drawPhoto?: DrawPhoto } }).MA_PHOTO?.drawPhoto;
  let png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  if (typeof document !== 'undefined' && draw) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    if (ctx) {
      try {
        draw(ctx, W, H, scene, Math.min(1.2, scene.loop), []);
        const url = c.toDataURL('image/png');
        if (url.startsWith('data:image/png')) png = url;
      } catch {
        /* 沒有真正的畫布時只留說明，不假裝有影片 */
      }
    }
  }
  return buildStillPreviewHtml({ kind: 'placeholder', pngDataUrl: png, width: W, height: H });
};
