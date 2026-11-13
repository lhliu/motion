import type { Fx } from '../types';

// 2026-11-13 新增：#695 VIVANT風地名字幕。
// 匯出 HTML 只帶 run，常數與 helper 全部寫在 run 裡。

const CANVAS_CSS = `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;

export const fx1112: Fx[] = [
  {
    id: 'vivant-telop',
    no: 695,
    cat: 'caption',
    zh: 'VIVANT風地名字幕',
    en: 'VIVANT-style Place Caption',
    desc: '左下黃斜體雙語地名字幕，先打中文再打英文，停兩秒後淡出',
    tags: ['地名', '字幕', '看房', '通勤'],
    tone: 'ink',
    sample: ['林口　新北市林口區', 'LINKOU, NEW TAIPEI CITY', '@pal=vivant;pos=bl;bg=none'],
    hint: '第一行＝中文地名（可用全形空白隔開短名與行政區）／第二行＝英文拼音（選填，需自己輸入）／ @設定：pal（vivant 黃字黑邊，預設｜kc 頻道橘｜white 白字黑邊）、c1／stroke（自訂字色／描邊）、pos（bl 左下，預設｜br 右下｜tl 左上）、speed、size（字級倍率）、bg（none 透明，預設｜solid 深色底）。',
    duration: 4.8,
    preferredRatio: '16:9',
    added: '2026-11-13',
    motion: '畫面左下角（9:16 底邊再抬高一些，避開 Shorts 按鈕）出現電影感雙語地名字幕：黃色斜體粗黑體加上細黑描邊與一點硬陰影，沒有底條、也沒有游標。先一個字一個字打出中文地名與行政區，稍停後第二行打出英文拼音；打完停留約兩秒再淡出。中文斜體以傾斜變形做出（字型本身沒有真正的 italic）。可改成頻道橘或白字，也可放右下或左上。預設透明，方便疊在實拍上。',
    motionEn: 'A small cinematic bilingual location telop sits in the lower left (with extra bottom inset in 9:16 to clear Shorts UI): yellow italic heavy gothic with a thin hard black outline and a slight offset shadow, no bar and no caret. The Chinese line types on character by character, then the English line; after about a two-second hold it fades out. Italic for CJK is a skew, because the font has no true italic. Channel orange or white, and lower-right or top-left placement, are available. Transparent by default so it can be overlaid on live footage.',
    css: CANVAS_CSS,
    html: () => `<canvas></canvas>`,
    run: (root, w) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const o: Record<string, string> = {};
      const words = w.filter((s) => {
        if (!s.startsWith('@')) return true;
        s.slice(1).split(';').forEach((kv) => {
          const i = kv.indexOf('=');
          if (i > 0) o[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
        });
        return false;
      }).map((s) => s.trim()).filter(Boolean);
      const line1 = words[0] || '林口　新北市林口區';
      const line2 = words[1] || '';
      const PALS: Record<string, { fill: string; stroke: string; paper: string }> = {
        vivant: { fill: '#E8D424', stroke: '#0A0A0A', paper: '#121212' },
        kc: { fill: '#F28C28', stroke: '#0E1A2C', paper: '#121212' },
        white: { fill: '#F6F3EA', stroke: '#111111', paper: '#121212' },
      };
      const pal = PALS[o.pal || ''] || PALS.vivant;
      const hex = (k: string, d: string) => (/^#[0-9a-f]{6}$/i.test(o[k] || '') ? o[k] : d);
      const fill = hex('c1', pal.fill);
      const stroke = hex('stroke', pal.stroke);
      const pos = o.pos === 'br' || o.pos === 'tl' ? o.pos : 'bl';
      const clear = o.bg !== 'solid';
      const num = (k: string, d: number) => (Number.isFinite(parseFloat(o[k])) ? parseFloat(o[k]) : d);
      const speed = Math.max(0.3, Math.min(3, num('speed', 1)));
      const sizeMul = Math.max(0.5, Math.min(2.2, num('size', 1)));
      const skewDeg = -12;
      const font = getComputedStyle(root).getPropertyValue('--sans').trim() || '"Noto Sans TC","Noto Sans CJK TC",sans-serif';
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const once = !!(globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
      const cjkPer = 0.09 / speed;
      const enPer = 0.055 / speed;
      const t0 = 0.12 / speed;
      const n1 = [...line1].length;
      const n2 = [...line2].length;
      const tCjkDone = t0 + Math.max(0, n1 - 1) * cjkPer;
      const tEn0 = tCjkDone + 0.18 / speed;
      const tDone = n2 ? tEn0 + Math.max(0, n2 - 1) * enPer : tCjkDone;
      const hold = 2 / speed;
      const fadeDur = 0.8 / speed;
      // 迴圈含完整淡出。Fx.duration 為 4.8：預設文案在 99%（約 4.75s）仍處於淡出前段、字還看得清楚，避免畫面檢查「結尾變空白」；淡出在迴圈結尾走完。
      const loop = tDone + hold + fadeDur;
      const tFade0 = tDone + hold;
      const typeCount = (str: string, t: number, start: number, per: number) => {
        if (t < start) return 0;
        return Math.min([...str].length, Math.floor((t - start) / per) + 1);
      };
      const layout = () => {
        const portrait = H > W;
        let fs = Math.min(W * (portrait ? 0.046 : 0.03), H * (portrait ? 0.03 : 0.052)) * sizeMul;
        ctx.font = `900 ${fs}px ${font}`;
        const cjkW = ctx.measureText(line1).width;
        const efs0 = fs * 0.78;
        ctx.font = `900 ${efs0}px ${font}`;
        const enW0 = line2 ? ctx.measureText(line2).width : 0;
        const skewExtra = Math.abs(Math.tan(skewDeg * Math.PI / 180)) * fs * 1.1;
        const maxW = W * (portrait ? 0.86 : 0.62) - skewExtra;
        const need = Math.max(cjkW, line2 ? enW0 * (fs / efs0) * 0.78 : 0);
        if (need > maxW) fs *= maxW / need;
        const efs = fs * 0.78;
        const mx = (portrait ? W * 0.075 : W * 0.052) + (pos === 'br' ? skewExtra : 0);
        const my = portrait ? H * 0.15 : H * 0.1;
        const lh = fs * 1.12;
        const align = pos === 'br' ? 'right' as const : 'left' as const;
        const x = pos === 'br' ? W - mx : mx;
        const yEn = pos === 'tl' ? my + fs + (line2 ? lh : 0) : H - my;
        const yCjk = line2 ? yEn - lh : yEn;
        return { fs, efs, x, yCjk, yEn, align };
      };
      const L = layout();
      const drawLine = (text: string, n: number, fs: number, x: number, y: number, align: 'left' | 'right') => {
        const shown = [...text].slice(0, n).join('');
        if (!shown) return;
        ctx.save();
        ctx.translate(x, y);
        const skew = Math.tan(skewDeg * Math.PI / 180);
        ctx.transform(1, 0, skew, 1, 0, 0);
        ctx.font = `900 ${fs}px ${font}`;
        ctx.textAlign = align;
        ctx.textBaseline = 'alphabetic';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.miterLimit = 2;
        ctx.lineWidth = Math.max(2.5, fs * 0.12);
        ctx.strokeStyle = stroke;
        ctx.strokeText(shown, 0, fs * 0.035);
        ctx.fillStyle = stroke;
        ctx.fillText(shown, 0, fs * 0.035);
        ctx.strokeText(shown, 0, 0);
        ctx.fillStyle = fill;
        ctx.fillText(shown, 0, 0);
        ctx.restore();
      };
      const draw = (time: number) => {
        let t: number;
        if (reduced) t = tDone + hold * 0.5;
        else if (once) t = Math.min(Math.max(0, time), Math.max(0, loop - 0.001));
        else t = ((time % loop) + loop) % loop;
        const fade = t >= tFade0 ? 1 - clamp((t - tFade0) / fadeDur) : 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W, H);
        if (!clear) { ctx.fillStyle = pal.paper; ctx.fillRect(0, 0, W, H); }
        if (fade <= 0) { ctx.globalAlpha = 1; return; }
        ctx.globalAlpha = fade;
        const cN = typeCount(line1, t, t0, cjkPer);
        const eN = line2 ? typeCount(line2, t, tEn0, enPer) : 0;
        drawLine(line1, cN, L.fs, L.x, L.yCjk, L.align);
        if (line2) drawLine(line2, eN, L.efs, L.x, L.yEn, L.align);
        ctx.globalAlpha = 1;
      };
      let raf = 0;
      const tStart = performance.now();
      const tick = (now: number) => { raf = requestAnimationFrame(tick); draw((now - tStart) / 1000); };
      draw(0);
      raf = requestAnimationFrame(tick);
      (root as unknown as { maDraw?: (t: number) => void }).maDraw = draw;
      return () => { cancelAnimationFrame(raf); };
    },
  },
];
