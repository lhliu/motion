import type { Fx } from '../types';

// 2026-10-29 新增：#678 三層描邊疊字、#679 散字運鏡標題（canvas，16:9／9:16 自動排版）
// 設定寫在 sample 最後一個 @ 開頭的詞，例如 @bpm=120;a=#ff5a36

export const fx1029: Fx[] = [
  {
    id: 'three-layer-text',
    no: 678,
    cat: 'kinetic',
    zh: '三層描邊疊字',
    en: 'Three Layer Text',
    desc: '同一個詞疊三層，上下描邊中間實心，跟著節拍彈',
    tags: ['地名', '開場', 'hook', '節拍'],
    tone: 'ink',
    sample: ['新店', 'SINDIAN · 2026', '@bpm=120;a=#ff5a36;b=#ffd23f;stroke=#ffffff;gap=0.78;bounce=0.08'],
    hint: '大字 / 小字 / @設定：bpm、a、b（中間層兩色）、stroke、line（描邊粗細）、gap（層距，字高倍數）、bounce（彈跳幅度）、intro（進場秒數）',
    duration: 6,
    preferredRatio: '9:16',
    motion: '同一個詞上下疊三層：上下兩層是空心描邊、中間是實心主色。上下兩層從左右反方向滑入，中間層從大縮小砸進定位，下方小字彈出；之後三層跟著節拍（BPM 可調）一起彈跳，重拍時中間層在兩個顏色間閃換。',
    motionEn: 'The same word is stacked three times: the top and bottom copies are hollow outlines, the middle copy is solid colour. The outlines slide in from opposite sides, the middle copy slams in from large, and a small subtitle pops up below; then all three bounce to the beat (adjustable BPM) and the middle layer flips between two colours on the downbeat.',
    css: `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    html: () => `<canvas></canvas>`,
    run: (root, w) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const o: Record<string, string> = {};
      const words = w.filter((s) => {
        if (!s.startsWith('@')) return true;
        s.slice(1).split(';').forEach((kv) => { const [k, v] = kv.split('='); if (k && v) o[k.trim()] = v.trim(); });
        return false;
      });
      const text = words[0] || '新店';
      const sub = words[1] ?? '';
      const num = (k: string, d: number) => (Number.isFinite(parseFloat(o[k])) ? parseFloat(o[k]) : d);
      const bpm = Math.max(40, Math.min(220, num('bpm', 120)));
      const ca = o.a || '#ff5a36', cb = o.b || '#ffd23f', cs = o.stroke || '#ffffff';
      const gap = num('gap', 0.78), bounce = num('bounce', 0.08), intro = Math.max(0.3, num('intro', 1));
      const font = getComputedStyle(root).getPropertyValue('--sans').trim() || '"Noto Sans TC","Noto Sans CJK TC",sans-serif';
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      // 字級：寬度不超過 84%，三層總高不超過 70%
      ctx.font = `900 100px ${font}`;
      const tw = Math.max(1, ctx.measureText(text).width);
      const fs = Math.min((W * 0.84 * 100) / tw, (H * 0.7) / (1 + 2 * gap), H * 0.3);
      const off2 = document.createElement('canvas');
      off2.width = W; off2.height = H;
      const oc = off2.getContext('2d')!;
      const lw = Math.max(1.5, fs * num('line', 0.025));
      const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
      const back = (x: number) => { x = Math.min(1, Math.max(0, x)); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
      const draw = (t: number) => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const cx = W / 2, cy = H / 2 - (sub ? fs * 0.25 : 0);
        const beat = 60 / bpm;
        const bt = t - intro;
        const ph = bt > 0 ? (bt % beat) / beat : 1;
        const kick = bt > 0 ? Math.exp(-ph * 6) : 0;
        const nb = bt > 0 ? Math.floor(bt / beat) : 0;
        const s = 1 + bounce * kick;
        const pSide = ease(t / (intro * 0.6));
        const slide = (1 - pSide) * W * 0.7;
        ctx.font = `900 ${fs * s}px ${font}`;
        ctx.lineJoin = 'round';
        ctx.lineWidth = lw;
        ctx.strokeStyle = cs;
        ctx.globalAlpha = pSide;
        const off = fs * gap * (1 + bounce * 0.5 * kick);
        // 描邊：先畫粗外框再挖掉字身，避免可變字型重疊輪廓在描邊裡露出交叉線
        const hollow = (x0: number, y0: number) => {
          oc.font = ctx.font; oc.textAlign = 'center'; oc.textBaseline = 'middle'; oc.lineJoin = 'round';
          oc.globalCompositeOperation = 'source-over'; oc.lineWidth = lw * 2; oc.strokeStyle = cs; oc.strokeText(text, x0, y0);
          oc.fillStyle = cs; oc.fillText(text, x0, y0);
          oc.globalCompositeOperation = 'destination-out'; oc.fillText(text, x0, y0);
          oc.globalCompositeOperation = 'source-over';
        };
        oc.clearRect(0, 0, W, H);
        hollow(cx - slide, cy - off);
        hollow(cx + slide, cy + off);
        ctx.drawImage(off2, 0, 0);
        ctx.globalAlpha = 1;
        const pm = (t - intro * 0.45) / (intro * 0.4);
        if (pm > 0) {
          const ms = pm < 1 ? 1 + (1 - ease(pm)) * 1.8 : s * (1 + bounce * 0.4 * kick);
          ctx.globalAlpha = Math.min(1, pm * 2);
          ctx.font = `900 ${fs * ms}px ${font}`;
          ctx.fillStyle = bt > 0 && nb % 4 >= 2 ? cb : ca;
          ctx.fillText(text, cx, cy - fs * bounce * 0.6 * kick);
          ctx.globalAlpha = 1;
        }
        if (sub) {
          const ps = (t - intro * 0.85) / 0.4;
          if (ps > 0) {
            ctx.font = `600 ${fs * 0.2}px ${font}`;
            ctx.fillStyle = cs;
            ctx.globalAlpha = Math.min(1, ps);
            ctx.save();
            ctx.translate(cx, cy + off + fs * 0.85);
            const k = back(ps);
            ctx.scale(k, k);
            ctx.fillText(sub, 0, 0);
            ctx.restore();
            ctx.globalAlpha = 1;
          }
        }
      };
      const t0 = performance.now();
      let raf = 0;
      const f = (now: number) => { raf = requestAnimationFrame(f); draw((now - t0) / 1000); };
      raf = requestAnimationFrame(f);
      (root as unknown as { maDraw?: (t: number) => void }).maDraw = draw;
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    id: 'camera-glide-title',
    no: 679,
    cat: 'kinetic',
    zh: '散字運鏡標題',
    en: 'Camera Glide Typography',
    desc: '詞散落畫面，鏡頭逐一推近對焦，關鍵字發光',
    tags: ['開場', '金句', 'hook', '運鏡'],
    tone: 'ink',
    sample: ['離捷運 / 5 分鐘 / 總價 / 3 字頭', '@key=4;color=#ffcf4a;glow=1;hold=1.1;zoom=1.8;blur=6;seed=3'],
    hint: '一句話用 / 或 · 分詞 / @設定：key（關鍵字第幾個詞，從 1 起）、color、glow（光暈強度）、hold（每詞停留秒數）、zoom（推近倍率上限）、blur（景深模糊）、seed（排版亂數）',
    duration: 9,
    preferredRatio: '16:9',
    motion: '一句話拆成幾個詞，大小、粗細、斜度各不同，不重疊地散落在深色畫面上；鏡頭先看全景，再依序平移推近對焦每個詞（其他詞景深模糊，對焦的詞完整留在畫面內），關鍵字換成主色並帶光暈發亮，最後拉遠看到整句。',
    motionEn: 'A sentence is split into words of different sizes, weights and slants, scattered without overlap on a dark frame; the camera starts wide, then glides and pushes in to focus on each word in turn (others fall into depth-of-field blur, the focused word always fully in frame); the keyword turns accent colour with a glow, and finally the camera pulls back to reveal the whole line.',
    css: `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    html: () => `<canvas></canvas>`,
    run: (root, w) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const o: Record<string, string> = {};
      const parts: string[] = [];
      w.forEach((s) => {
        if (s.startsWith('@')) s.slice(1).split(';').forEach((kv) => { const [k, v] = kv.split('='); if (k && v) o[k.trim()] = v.trim(); });
        else parts.push(...s.split(/\s*[\/·｜]\s*/).filter(Boolean));
      });
      if (!parts.length) parts.push('離捷運', '5 分鐘', '總價', '3 字頭');
      const words = parts.slice(0, 8);
      const num = (k: string, d: number) => (Number.isFinite(parseFloat(o[k])) ? parseFloat(o[k]) : d);
      const key = Math.min(words.length, Math.max(1, Math.round(num('key', words.length)))) - 1;
      const kc = o.color || '#ffcf4a', glow = num('glow', 1), hold = Math.max(0.4, num('hold', 1.1));
      const zmax = Math.max(1.1, num('zoom', 1.8)), blurPx = Math.max(0, num('blur', 6));
      let seed = Math.round(num('seed', 3)) || 1;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const font = getComputedStyle(root).getPropertyValue('--sans').trim() || '"Noto Sans TC","Noto Sans CJK TC",sans-serif';
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const M = Math.min(W, H);
      type Wd = { t: string; x: number; y: number; w: number; h: number; fs: number; wt: number; rot: number; sharp: HTMLCanvasElement; soft: HTMLCanvasElement; pad: number; rs: number };
      // 1. 排版：依序放詞，候選位置中挑跟已放的詞不重疊（含間距）且最分散者；放不下就整體縮小重來
      const layout = (scale: number) => {
        const out: { x: number; y: number; w: number; h: number; fs: number; wt: number; rot: number }[] = [];
        for (let i = 0; i < words.length; i++) {
          const big = i === key || /\d/.test(words[i]);
          const wt = big ? 900 : i % 2 ? 300 : 500;
          let fs = M * scale * (big ? 0.24 : 0.14 + rnd() * 0.05) * (W > H ? 1.25 : 1);
          ctx.font = `${wt} ${fs}px ${font}`;
          let tw = ctx.measureText(words[i]).width;
          if (tw > W * 0.8) { fs *= (W * 0.8) / tw; tw = W * 0.8; }
          const bw = tw, bh = fs * 1.15, rot = big ? 0 : (rnd() - 0.5) * 0.14;
          let best: { x: number; y: number; d: number } | null = null;
          for (let k = 0; k < 60; k++) {
            const x = W * 0.08 + bw / 2 + rnd() * Math.max(1, W * 0.84 - bw);
            const y = H * 0.1 + bh / 2 + rnd() * Math.max(1, H * 0.8 - bh);
            const g = M * 0.03;
            const hit = out.some((b) => Math.abs(b.x - x) < (b.w + bw) / 2 + g && Math.abs(b.y - y) < (b.h + bh) / 2 + g);
            if (hit) continue;
            // 偏好閱讀順序（由上往下），並與其他詞拉開
            const d = Math.min(1e9, ...out.map((b) => Math.hypot(b.x - x, b.y - y))) - Math.abs(y - (H * 0.15 + (i / Math.max(1, words.length - 1)) * H * 0.7)) * 0.8;
            if (!best || d > best.d) best = { x, y, d };
          }
          if (!best) return null;
          out.push({ x: best.x, y: best.y, w: bw, h: bh, fs, wt, rot });
        }
        return out;
      };
      let boxes = null as ReturnType<typeof layout>;
      for (let s = 1, n = 0; !boxes && n < 12; n++, s *= 0.9) { const s0 = seed; boxes = layout(s); if (!boxes) seed = s0 + 7; }
      if (!boxes) boxes = words.map((_, i) => ({ x: W / 2, y: H * (0.15 + (0.7 * i) / Math.max(1, words.length - 1)), w: W * 0.6, h: M * 0.08, fs: M * 0.07, wt: 500, rot: 0 }));
      // 2. 每個詞預先畫成清楚版（推近倍率解析度）與模糊版（只算一次，之後每幀只 drawImage，模糊成本固定）
      const mk = (b: NonNullable<typeof boxes>[number], i: number): Wd => {
        const isK = i === key;
        const pad = b.fs * (isK ? 0.9 : 0.3);
        const rs = Math.min(zmax * dpr, 4096 / (b.w + pad * 2));
        const paint = (c: HTMLCanvasElement, r: number, blur: number) => {
          c.width = Math.ceil((b.w + pad * 2) * r);
          c.height = Math.ceil((b.h + pad * 2) * r);
          const x = c.getContext('2d')!;
          x.scale(r, r);
          if (blur) x.filter = `blur(${blur}px)`;
          x.font = `${b.wt} ${b.fs}px ${font}`;
          x.textAlign = 'center';
          x.textBaseline = 'middle';
          const cx = pad + b.w / 2, cy = pad + b.h / 2;
          if (isK && !blur && glow > 0) {
            x.shadowColor = kc;
            x.shadowBlur = b.fs * 0.18 * glow;
            x.fillStyle = kc;
            x.fillText(words[i], cx, cy);
            x.shadowBlur = 0;
            x.fillStyle = '#fff6d6';
          } else x.fillStyle = isK ? kc : '#e8ecf4';
          x.fillText(words[i], cx, cy);
          if (isK && !blur && glow > 0) { x.globalAlpha = 0.55; x.fillStyle = kc; x.fillText(words[i], cx, cy); }
        };
        const sharp = document.createElement('canvas');
        const soft = document.createElement('canvas');
        paint(sharp, rs, 0);
        paint(soft, 0.5, blurPx * 0.5);
        return { t: words[i], ...b, sharp, soft, pad, rs };
      };
      const W2 = boxes.map(mk);
      // 3. 鏡頭：全景 → 每個詞 → 拉遠。推近倍率讓詞（含旋轉外框）完整落在畫面 78% 內
      const shots: { x: number; y: number; z: number; f: number }[] = [{ x: W / 2, y: H / 2, z: 1, f: -1 }];
      W2.forEach((d, i) => {
        const bw = Math.abs(d.w * Math.cos(d.rot)) + Math.abs(d.h * Math.sin(d.rot));
        const bh = Math.abs(d.w * Math.sin(d.rot)) + Math.abs(d.h * Math.cos(d.rot));
        const z = Math.max(1, Math.min(zmax, (W * 0.5) / bw, (H * 0.42) / bh));
        shots.push({ x: d.x, y: d.y, z, f: i });
      });
      shots.push({ x: W / 2, y: H / 2, z: 1, f: -1 });
      const T = [1.6, ...W2.map(() => hold), 1.6];
      const total = T.reduce((a, b) => a + b, 0);
      const sm = (x: number) => x * x * (3 - 2 * x);
      const draw = (tt: number) => {
        const t = tt % total;
        let i = 0, acc = 0;
        while (i < T.length - 1 && t > acc + T[i]) acc += T[i++];
        const local = t - acc;
        const mv = Math.min(0.55, T[i] * 0.5);
        const a = shots[Math.max(0, i - 1)], b = shots[i];
        const p = i === 0 ? 1 : sm(Math.min(1, local / mv));
        // 縮放用對數內插，移動時不會先衝過頭
        const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * p);
        let cx = a.x + (b.x - a.x) * p, cy = a.y + (b.y - a.y) * p;
        // 鏡頭邊界：不讓畫面外露出世界邊緣
        const hw = W / 2 / z, hh = H / 2 / z;
        cx = Math.min(W - hw, Math.max(hw, cx));
        cy = Math.min(H - hh, Math.max(hh, cy));
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#121419';
        ctx.fillRect(0, 0, W, H);
        const vg = ctx.createRadialGradient(W / 2, H / 2, M * 0.2, W / 2, H / 2, Math.hypot(W, H) * 0.6);
        vg.addColorStop(0, '#1d2230');
        vg.addColorStop(1, '#0b0c10');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);
        ctx.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
        const focusIdx = b.f, prevIdx = a.f;
        W2.forEach((d, j) => {
          // 對焦權重：全景時全部清楚；推近時只有目標清楚
          let fw = 0;
          if (focusIdx < 0 && prevIdx < 0) fw = 1;
          else if (focusIdx < 0) fw = p + (j === prevIdx ? 1 - p : 0);
          else fw = (j === focusIdx ? p : 0) + (prevIdx < 0 ? 1 - p : j === prevIdx ? 1 - p : 0);
          fw = Math.min(1, fw);
          const intro = i === 0 ? Math.min(1, Math.max(0, (local - j * 0.08) / 0.4)) : 1;
          ctx.save();
          ctx.translate(d.x, d.y + (1 - intro) * d.h * 0.4);
          ctx.rotate(d.rot);
          const ww = d.w + d.pad * 2, hh2 = d.h + d.pad * 2;
          if (fw < 1) { ctx.globalAlpha = intro * (1 - fw) * 0.75; ctx.drawImage(d.soft, -ww / 2, -hh2 / 2, ww, hh2); }
          if (fw > 0) {
            const pulse = j === key && j === focusIdx ? 0.85 + 0.15 * Math.sin(local * 6) : 1;
            ctx.globalAlpha = intro * fw * pulse;
            ctx.drawImage(d.sharp, -ww / 2, -hh2 / 2, ww, hh2);
          }
          ctx.restore();
        });
      };
      const t0 = performance.now();
      let raf = 0;
      const f = (now: number) => { raf = requestAnimationFrame(f); draw((now - t0) / 1000); };
      raf = requestAnimationFrame(f);
      (root as unknown as { maDraw?: (t: number) => void }).maDraw = draw;
      return () => cancelAnimationFrame(raf);
    },
  },
];
