// 地板倒影共用小函式（#690 起用；之後 slam／彈跳類可用 refl= 打開，這次不改舊效果）。
// 工廠必須自給自足：效果的 globals 會用 toString() 把它內嵌進匯出的 HTML（window.MA_REFLECT）。
// 離屏 canvas 只建一次、尺寸變了才重設，避免每格 new canvas 造成 GC 卡頓。

export type ReflectOpts = { alpha?: number; fade?: number; blur?: number };
export type Reflector = {
  /** 取得與畫面同尺寸、已清空的圖層（給效果畫要被倒影的內容） */
  layer: (W: number, H: number) => { cv: HTMLCanvasElement | OffscreenCanvas; ctx: CanvasRenderingContext2D };
  /** 把 src 以 floorY 為軸上下翻轉，帶模糊與由上往下的 alpha 淡出，畫到 ctx 的地板下方 */
  draw: (ctx: CanvasRenderingContext2D, src: CanvasImageSource, W: number, H: number, floorY: number, o?: ReflectOpts) => void;
};

export const makeReflector = (): Reflector => {
  const mk = (W: number, H: number) => {
    const cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
    return { cv, ctx: cv.getContext('2d') as CanvasRenderingContext2D };
  };
  let L: ReturnType<typeof mk> | null = null, R: ReturnType<typeof mk> | null = null;
  const fit = (c: ReturnType<typeof mk> | null, W: number, H: number) => {
    if (!c) return mk(W, H);
    if (c.cv.width !== W || c.cv.height !== H) { c.cv.width = W; c.cv.height = H; }
    return c;
  };
  const layer = (W: number, H: number) => {
    L = fit(L, W, H);
    L.ctx.setTransform(1, 0, 0, 1, 0, 0);
    L.ctx.clearRect(0, 0, W, H);
    return L;
  };
  const draw = (ctx: CanvasRenderingContext2D, src: CanvasImageSource, W: number, H: number, floorY: number, o: ReflectOpts = {}) => {
    const alpha = Math.max(0, Math.min(1, o.alpha ?? 0.45));
    if (alpha <= 0) return;
    const fade = Math.max(0.05, Math.min(1, o.fade ?? 0.6));
    const blur = Math.max(0, o.blur ?? 2);
    R = fit(R, W, H);
    const r = R.ctx;
    r.setTransform(1, 0, 0, 1, 0, 0);
    r.globalCompositeOperation = 'source-over';
    r.clearRect(0, 0, W, H);
    // 舊版 Safari 不支援 filter：倒影只是不模糊
    if (blur > 0) r.filter = `blur(${blur}px)`;
    r.translate(0, floorY * 2);
    r.scale(1, -1);
    r.drawImage(src, 0, 0);
    r.setTransform(1, 0, 0, 1, 0, 0);
    r.filter = 'none';
    const g = r.createLinearGradient(0, floorY, 0, floorY + (H - floorY) * fade + 1);
    g.addColorStop(0, `rgba(0,0,0,${alpha})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    r.globalCompositeOperation = 'destination-in';
    r.fillStyle = g;
    r.fillRect(0, 0, W, H);
    r.globalCompositeOperation = 'source-over';
    r.clearRect(0, 0, W, Math.ceil(floorY));
    ctx.drawImage(R.cv, 0, 0);
  };
  return { layer, draw };
};
