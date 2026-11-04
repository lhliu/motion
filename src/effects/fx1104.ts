import type { Fx } from '../types';
import { esc } from '../util';
import { objSceneFromWords } from '../objkit';
import { propFx, OBJ_CSS, FLAT, FLAT_EN } from './object';
import { makeReflector } from '../render/reflect';
import { fnSource } from '../engine';

// 2026-11-04 新增：#689 小物漂浮環繞立體片名（物件類，畫在 render/prop.ts 的 estate.float）、#690 落地彈跳＋地板倒影（canvas）。
// #690 的倒影用共用小函式 render/reflect.ts（window.MA_REFLECT，匯出時由 globals 內嵌）；run 內只讀 globalThis.MA_REFLECT，常數都放 run 內。
const G = globalThis as unknown as { MA_REFLECT?: unknown };
G.MA_REFLECT ||= makeReflector();

/* #689：字畫在道具裡（不用物件下方的文字層）；第一行是片名，@設定 例如 @props=key,tape;sub=新店看屋日;bg=space */
const FLOAT_PRESET: Record<string, number | string> = {
  color: '#ffb703', color2: '#2f6fd6', texts: '持家男子KC', sub: '新店看屋日', props: 'key,tape,hat,brick,level,piggy',
  count: 40, depth: 1, sky: 'space', glow: '#8b5cf6', c1: '#f5f0e6', c2: '#24408a', bg: '#0f1530', size: 1, speed: 1, layout: 'none', x: 0.5, y: 0.5,
};
const floatBase = propFx('estate', 'float', 689, FLOAT_PRESET, {
  zh: '小物漂浮環繞立體片名', en: 'Floating Props Title',
  desc: '鏡頭飛過鑰匙、捲尺、安全帽、磚塊、水平儀、存錢筒，立體片名從深處浮出，小物繞著片名漂浮',
  tags: ['片頭', '標題', '看屋', '太空', '立體字'],
  sample: ['持家男子KC', '@props=key,tape,hat,brick,level,piggy;sub=新店看屋日;bg=space;glow=#8b5cf6;depth=1;count=40;speed=1'],
  motion: `深藍太空（星點＋扁平行星）裡鏡頭往前飛：鑰匙、捲尺、安全帽、磚塊、水平儀、存錢筒從遠方小點變大擦過鏡頭，各自慢慢自轉，遠的稍淡；接著立體片名從深處回彈放大浮出，往右下的深藍厚度層同時長出，後方一道紫色橫向光帶（三層半透明硬邊條）；之後 6 個小物環繞片名慢慢漂、轉，會自動避開片名與副標的文字框；副標淡入後定格持續漂浮。9:16 超過 4 字拆兩行。${FLAT}`,
  motionEn: `In a deep-blue space (dots of stars, a flat ringed planet) the camera flies forward past a key, tape measure, hard hat, brick, spirit level and piggy bank that grow from distant dots and brush past the lens, each slowly spinning, the far ones paler; then an extruded title springs up from the depth with a dark-blue side layer growing toward the lower right, a purple horizontal light band (three translucent hard-edged bars) behind it; six props then drift and spin around the title, steering clear of the title and subtitle box, the subtitle fades in and the scene holds, still floating. Titles over four characters split into two lines in 9:16. ${FLAT_EN}`,
});
const floatFx: Fx = {
  ...floatBase,
  added: '2026-11-04',
  preferredRatio: '16:9',
  hint: '第一行＝片名（建議 2–8 字）/ @設定：props（小物，逗號分隔：key 鑰匙｜tape 捲尺｜hat 安全帽｜brick 磚塊｜level 水平儀｜piggy 存錢筒）、count（飛行途中小物數，預設 40）、sub（副標）、bg（space 太空｜solid 米色純色｜none 透明）、glow（光帶色）、c1／c2（片名正面／厚度色）、depth（厚度倍率，0＝平面字）、speed、color／color2（安全帽／水平儀主色）。也可在物件工作室調整。',
  html: (w) => {
    const o: Record<string, string> = {};
    const lines = w.filter((s) => {
      if (!s.startsWith('@')) return true;
      s.slice(1).split(';').forEach((kv) => { const i = kv.indexOf('='); if (i > 0) o[kv.slice(0, i).trim()] = kv.slice(i + 1).trim(); });
      return false;
    });
    const json = lines.find((s) => s.trim().startsWith('{'));
    const texts = lines.filter((s) => s.trim() && !s.trim().startsWith('{') && !s.startsWith('~'));
    const extra: Record<string, number | string> = { ...FLOAT_PRESET, ...o, mode: 'float' };
    if (texts.length) extra.texts = texts[0].trim().slice(0, 12);
    const bg = o.bg ?? 'space';
    extra.sky = bg === 'space' ? 'space' : 'none';
    extra.bg = bg === 'none' ? 'transparent' : bg === 'solid' ? '#f3ead8' : /^#[0-9a-f]{6}$/i.test(bg) ? bg : '#0f1530';
    for (const k of ['count', 'depth', 'speed', 'size']) if (k in o && Number.isFinite(parseFloat(o[k]))) extra[k] = parseFloat(o[k]);
    const scene = json ? objSceneFromWords([json], 'estate', extra) : objSceneFromWords([], 'estate', extra);
    scene.loop = 8;
    scene.text.lines = [];
    return `<canvas data-scene="${esc(JSON.stringify(scene))}"></canvas>`;
  },
};

export const fx1104: Fx[] = [
  floatFx,
  {
    id: 'drop-reflection',
    no: 690,
    cat: 'kinetic',
    zh: '落地彈跳＋地板倒影',
    en: 'Bounce Drop + Floor Reflection',
    desc: '兩行字先後從上方掉下、落地壓扁彈兩下停住，亮面地板映出跟著移動的倒影',
    tags: ['價格', '建案', '標題', '倒影', '彈跳'],
    tone: 'ink',
    sample: ['璞真建設｜光河', '1,288 萬', '@floor=marble;refl=0.45;fade=0.6;blur=2;bounce=2;bg=solid'],
    hint: '第一行＝上行（建案名），第二行＝下行（價格，金色）/ @設定：floor（marble 大理石｜dark 黑亮面｜plain 純色）、refl（倒影起始透明度 0–1，0＝關）、fade（倒影淡出長度，地板高度比例）、blur（倒影模糊 px）、bounce（彈跳次數 0–3）、stagger（兩行間隔秒數，預設 0.35）、speed、c1／c2（上行／下行字色）、bg（solid｜none 透明：不畫地板與陰影，只留字＋倒影）。',
    duration: 4,
    preferredRatio: '16:9',
    added: '2026-11-04',
    motion: '下行（價格，金色）先從畫面上方掉下，落地時壓扁一下、彈兩次停住，地上有接觸陰影；0.35 秒後上行（建案名）掉下疊在下行上方，同樣彈兩下。地板線下方是整層文字上下翻轉的倒影：輕微模糊、由上往下淡出，像大理石亮面地板；字在空中時倒影也跟著移動。可換黑亮面地板或透明背景。',
    motionEn: 'The lower line (a gold price) drops in from the top, squashes on landing, bounces twice and settles over a soft contact shadow; 0.35 s later the upper line (project name) drops onto it with the same bounces. Below the floor line the whole text layer is mirrored as a slightly blurred reflection that fades out downward like polished marble, and it moves with the text while it is in the air. Dark gloss floor and transparent background available.',
    css: `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    html: () => `<canvas></canvas>`,
    get globals() {
      return `window.MA_REFLECT=window.MA_REFLECT||${fnSource(makeReflector)}();`;
    },
    run: (root, w) => {
      type Refl = {
        layer: (W: number, H: number) => { cv: CanvasImageSource; ctx: CanvasRenderingContext2D };
        draw: (ctx: CanvasRenderingContext2D, src: CanvasImageSource, W: number, H: number, floorY: number, o?: { alpha?: number; fade?: number; blur?: number }) => void;
      };
      const RF = (globalThis as unknown as { MA_REFLECT?: Refl }).MA_REFLECT;
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const o: Record<string, string> = {};
      const words = w.filter((s) => {
        if (!s.startsWith('@')) return true;
        s.slice(1).split(';').forEach((kv) => { const i = kv.indexOf('='); if (i > 0) o[kv.slice(0, i).trim()] = kv.slice(i + 1).trim(); });
        return false;
      }).map((s) => s.trim()).filter(Boolean).slice(0, 2);
      const lines = words.length ? words : ['璞真建設｜光河', '1,288 萬'];
      const num = (k: string, d: number) => (Number.isFinite(parseFloat(o[k])) ? parseFloat(o[k]) : d);
      const clamp = (p: number) => Math.max(0, Math.min(1, p));
      const FLOORS: Record<string, { top: string; floor: string; ink: string; acc: string; vein: string; shadow: string }> = {
        marble: { top: '#efeae2', floor: '#e2dbcf', ink: '#1d2433', acc: '#b8862f', vein: 'rgba(160,150,135,.35)', shadow: '0,0,0' },
        dark: { top: '#14161c', floor: '#0c0d11', ink: '#f3e7c9', acc: '#d9a441', vein: '', shadow: '0,0,0' },
        plain: { top: '#f3efe6', floor: '#e6e0d4', ink: '#1d2433', acc: '#b8862f', vein: '', shadow: '0,0,0' },
      };
      const FL = FLOORS[o.floor] || FLOORS.marble;
      const C1 = /^#[0-9a-f]{6}$/i.test(o.c1 || '') ? o.c1 : FL.ink;
      const C2 = /^#[0-9a-f]{6}$/i.test(o.c2 || '') ? o.c2 : FL.acc;
      const clear = o.bg === 'none';
      const refl = clamp(num('refl', 0.45)), fadeK = clamp(num('fade', 0.6)), blurPx = Math.max(0, Math.min(12, num('blur', 2)));
      const bounces = Math.max(0, Math.min(3, Math.round(num('bounce', 2))));
      const stagger = Math.max(0, Math.min(2, num('stagger', 0.35)));
      const speed = Math.max(0.3, Math.min(3, num('speed', 1)));
      const font = getComputedStyle(root).getPropertyValue('--sans').trim() || '"Noto Sans TC","Noto Sans CJK TC",sans-serif';
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const once = !!(globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const port = H > W, S = Math.min(W, H);
      const fy = H * (port ? 0.56 : 0.6);
      // 落下＋彈跳：回傳離地高度比例（1＝在畫面上方）與壓扁量
      const HOPS = [0.22, 0.06, 0.02].slice(0, bounces);
      const K = [0.5, ...HOPS.map((_, i) => 0.5 + (0.5 * (i + 1)) / Math.max(1, HOPS.length))];
      const drop = (p: number) => {
        const q = clamp(p);
        if (q < K[0]) { const u = q / K[0]; return { h: 1 - u * u, sq: 0 }; }
        for (let i = 1; i < K.length; i++) if (q < K[i]) { const u = (q - K[i - 1]) / (K[i] - K[i - 1]); return { h: HOPS[i - 1] * 4 * u * (1 - u), sq: 0 }; }
        return { h: 0, sq: 0 };
      };
      const impactAt = K.slice(0, 1 + HOPS.length);
      const DUR = 1.3;
      const n = lines.length;
      // 字級：16:9 較大；9:16 依畫面寬縮放；太長自動縮到 90% 寬
      const fsBase = n > 1 ? [port ? W * 0.13 : S * 0.17, port ? W * 0.18 : S * 0.25] : [port ? W * 0.18 : S * 0.25];
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      const fs = lines.map((s, i) => { ctx.font = `900 ${fsBase[i]}px ${font}`; const tw = ctx.measureText(s).width; return tw > W * 0.9 ? fsBase[i] * (W * 0.9) / tw : fsBase[i]; });
      // 字底貼齊地板：量字的實際下緣（逗號、句點不算）
      const desc = lines.map((s, i) => { ctx.font = `900 ${fs[i]}px ${font}`; const m = ctx.measureText(s.replace(/[,.，。、]/g, '') || s); return Number.isFinite(m.actualBoundingBoxDescent) ? m.actualBoundingBoxDescent : fs[i] * 0.12; });
      const baseY: number[] = [];
      let b = fy;
      for (let i = n - 1; i >= 0; i--) { baseY[i] = b; b -= fs[i] * 1.12; }
      const start = lines.map((_, i) => (n - 1 - i) * stagger);
      const loop = ((n - 1) * stagger + DUR) / speed + 1.9;
      // 沒有共用函式（理論上不會）時退回：倒影直接不畫
      const fallbackLayer = (() => { let c: HTMLCanvasElement | null = null; return (Wd: number, Hd: number) => { c ||= document.createElement('canvas'); if (c.width !== Wd || c.height !== Hd) { c.width = Wd; c.height = Hd; } const x = c.getContext('2d')!; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, Wd, Hd); return { cv: c as CanvasImageSource, ctx: x }; }; })();
      const draw = (time: number) => {
        let t = reduced ? loop - 0.5 : once ? Math.min(time, loop - 0.001) : time % loop;
        if (t < 0) t = 0;
        const fade = t > loop - 0.35 ? clamp((loop - t) / 0.35) : 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W, H);
        if (!clear) {
          ctx.fillStyle = FL.top; ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = FL.floor; ctx.fillRect(0, fy, W, H - fy);
          if (FL.vein) {
            ctx.strokeStyle = FL.vein; ctx.lineWidth = Math.max(1, S / 480);
            for (let i = 0; i < 5; i++) { const u = (H - fy) / 7; ctx.beginPath(); ctx.moveTo(-50, fy + u * (0.4 + i)); ctx.bezierCurveTo(W * 0.3, fy + u * i * 1.3, W * 0.6, fy + u * (1.5 + i * 0.8), W + 50, fy + u * (0.2 + i * 1.2)); ctx.stroke(); }
          }
        }
        const L = RF ? RF.layer(W, H) : fallbackLayer(W, H);
        const l = L.ctx;
        l.textAlign = 'center'; l.textBaseline = 'alphabetic';
        lines.forEach((s, i) => {
          const p = ((t - start[i]) * speed) / DUR;
          if (p < 0) return;
          const { h } = drop(p);
          let imp = 0;
          impactAt.forEach((k, j) => { imp += Math.exp(-Math.abs(p - k) * 30) * 0.12 * Math.pow(0.45, j); });
          const yOff = -h * H * 0.9;
          l.save(); l.translate(W / 2, baseY[i] + yOff); l.scale(1 + imp, 1 - imp);
          l.font = `900 ${fs[i]}px ${font}`; l.fillStyle = i === n - 1 ? C2 : C1;
          l.fillText(s, 0, -desc[i]); l.restore();
          if (!clear && i === n - 1) {
            ctx.fillStyle = `rgba(${FL.shadow},${(0.18 * (1 - h)).toFixed(3)})`;
            ctx.beginPath(); ctx.ellipse(W / 2, fy, W * 0.25 * (1 - h * 0.6), Math.max(3, S * 0.008), 0, 0, Math.PI * 2); ctx.fill();
          }
        });
        ctx.globalAlpha = fade;
        if (RF && refl > 0) RF.draw(ctx, L.cv, W, H, fy, { alpha: refl, fade: fadeK, blur: blurPx * dpr });
        ctx.drawImage(L.cv, 0, 0);
        ctx.globalAlpha = 1;
      };
      let raf = 0;
      const t0 = performance.now();
      const f = (now: number) => { raf = requestAnimationFrame(f); draw((now - t0) / 1000); };
      draw(0);
      raf = requestAnimationFrame(f);
      (root as unknown as { maDraw?: (t: number) => void }).maDraw = draw;
      return () => { cancelAnimationFrame(raf); };
    },
  },
];
