import type { Fx } from '../types';
import { chars, esc, rand } from '../util';

export const texture: Fx[] = [
  {
    id: 'particle-form',
    cat: 'texture',
    zh: '粒子聚合',
    en: 'Particle Assemble',
    desc: '上千顆粒子飛來組成文字',
    tags: ['科技', '片頭'],
    tone: 'ink',
    sample: ['光寓'],
    hint: '1–4 字',
    motion: '畫面中散落上千顆主色與白色小粒子，它們從隨機位置以緩出曲線飛向文字輪廓的取樣點，聚合成文字；停留 1 秒後粒子受到爆炸力向外散開，再重新聚合，循環。',
    motionEn: 'Thousands of small accent and white particles are scattered around the frame; they fly with ease-out from random positions to points sampled from the text shape, assembling the word; after a 1s hold an explosive force scatters them outward, then they reassemble, looping.',
    css: `.S canvas{width:100%;height:100%;display:block}`,
    html: () => `<canvas></canvas>`,
    run: (root, w) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const ac = getComputedStyle(root).getPropertyValue('--ac').trim() || '#ff5a36';
      const dpr = Math.min(2, devicePixelRatio);
      const W = (cv.width = Math.max(1, cv.clientWidth * dpr));
      const H = (cv.height = Math.max(1, cv.clientHeight * dpr));
      const off = document.createElement('canvas');
      off.width = W;
      off.height = H;
      const oc = off.getContext('2d', { willReadFrequently: true })!;
      const len = Array.from(w[0]).length || 1;
      oc.font = `900 ${Math.min(H * 0.55, (W * 0.8) / len)}px "Noto Sans TC", sans-serif`;
      oc.textAlign = 'center';
      oc.textBaseline = 'middle';
      oc.fillStyle = '#fff';
      oc.fillText(w[0], W / 2, H / 2);
      const d = oc.getImageData(0, 0, W, H).data;
      const gap = Math.max(3, Math.round(W / 260));
      const pts: { x: number; y: number; sx: number; sy: number; c: string }[] = [];
      for (let y = 0; y < H; y += gap)
        for (let x = 0; x < W; x += gap)
          if (d[(y * W + x) * 4 + 3] > 128)
            pts.push({ x, y, sx: Math.random() * W, sy: Math.random() * H, c: Math.random() > 0.35 ? ac : '#fff' });
      const r = gap * 0.42;
      let raf = 0;
      const t0 = performance.now();
      const ease = (p: number) => 1 - Math.pow(1 - p, 4);
      const draw = (now: number) => {
        raf = requestAnimationFrame(draw);
        const t = ((now - t0) / 1000) % 5;
        let p: number;
        if (t < 2) p = ease(t / 2);
        else if (t < 3.6) p = 1;
        else p = 1 - ease((t - 3.6) / 1.4);
        ctx.clearRect(0, 0, W, H);
        for (const q of pts) {
          const x = q.sx + (q.x - q.sx) * p;
          const y = q.sy + (q.y - q.sy) * p;
          ctx.fillStyle = q.c;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
      };
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    id: 'pixelate',
    cat: 'texture',
    zh: '像素化',
    en: 'Pixelate Resolve',
    desc: '從大馬賽克慢慢變清晰',
    tags: ['遊戲', '揭曉'],
    tone: 'accent',
    sample: ['LEVEL UP'],
    hint: '英文或 2–6 字',
    motion: '文字一開始是非常粗的馬賽克方塊，解析度以階梯方式（32→16→8→4→2→1 像素）逐步提高到完全清晰，每一階約 0.25 秒；停留後再逐步馬賽克化。',
    motionEn: 'The text starts as very coarse mosaic blocks and its resolution steps up (32→16→8→4→2→1 px) until fully sharp, about 0.25s per step; after a hold it steps back down into mosaic.',
    css: `.S canvas{width:100%;height:100%;display:block;image-rendering:pixelated}`,
    html: () => `<canvas></canvas>`,
    run: (root, w) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const cs = getComputedStyle(root);
      const bg = cs.getPropertyValue('--bg').trim() || '#ff5a36';
      const W = (cv.width = Math.max(1, cv.clientWidth));
      const H = (cv.height = Math.max(1, cv.clientHeight));
      const src = document.createElement('canvas');
      src.width = W;
      src.height = H;
      const sc = src.getContext('2d')!;
      const len = Array.from(w[0]).length || 1;
      sc.fillStyle = bg;
      sc.fillRect(0, 0, W, H);
      sc.font = `900 ${Math.min(H * 0.4, (W * 1.5) / len)}px "Noto Sans TC", sans-serif`;
      sc.textAlign = 'center';
      sc.textBaseline = 'middle';
      sc.fillStyle = '#111';
      sc.fillText(w[0], W / 2, H / 2);
      const steps = [48, 32, 20, 12, 8, 4, 2, 1, 1, 1, 1, 1, 2, 4, 8, 12, 20, 32, 48, 48];
      let k = 0;
      const small = document.createElement('canvas');
      const smc = small.getContext('2d')!;
      const tick = () => {
        const s = Math.max(1, Math.round((steps[k % steps.length] * W) / 800));
        small.width = Math.max(1, Math.ceil(W / s));
        small.height = Math.max(1, Math.ceil(H / s));
        smc.drawImage(src, 0, 0, small.width, small.height);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(small, 0, 0, W, H);
        k++;
      };
      tick();
      const t = window.setInterval(tick, 220);
      return () => clearInterval(t);
    },
  },
  {
    id: 'shatter',
    cat: 'texture',
    zh: '碎裂',
    en: 'Shatter',
    desc: '文字像玻璃碎成好幾片飛散',
    tags: ['破壞', '轉場'],
    tone: 'ink',
    sample: ['打破框架'],
    hint: '2–6 字',
    motion: '完整的文字停留後瞬間碎成 12 塊不規則多邊形碎片，每片朝不同方向飛散並旋轉、縮小淡出（像玻璃被擊碎）；接著碎片倒轉飛回拼合成原字。',
    motionEn: 'After holding, the text instantly shatters into 12 irregular polygonal shards that fly off in different directions, spinning, shrinking and fading like broken glass; then the shards rewind back together into the word.',
    css: `
.S .box{position:relative;font-size:13cqw}
.S .base{visibility:hidden}
.S .sh{position:absolute;inset:0;clip-path:var(--cp);animation:K_s 4s cubic-bezier(.2,.7,.3,1) infinite}
.S .sh:nth-child(3n){color:var(--ac)}
@keyframes K_s{0%,30%{transform:none;opacity:1;color:var(--fg)}31%{color:inherit}60%{transform:translate(var(--dx),var(--dy)) rotate(var(--dr)) scale(.7);opacity:0}70%{transform:translate(var(--dx),var(--dy)) rotate(var(--dr)) scale(.7);opacity:0;animation-timing-function:cubic-bezier(.6,0,.3,1)}95%,100%{transform:none;opacity:1}}`,
    html: (w) => {
      // 3x4 格網，每格頂點加入擾動，切成不規則多邊形
      const cols = 4;
      const rows = 3;
      const P = (c: number, r: number) => {
        const edge = c === 0 || c === cols || r === 0 || r === rows;
        const jx = edge ? 0 : (rand(c * 7 + r * 13) - 0.5) * 14;
        const jy = edge ? 0 : (rand(c * 11 + r * 5) - 0.5) * 20;
        return [(c / cols) * 100 + jx, (r / rows) * 100 + jy];
      };
      let i = 0;
      const shards: string[] = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const pts = [P(c, r), P(c + 1, r), P(c + 1, r + 1), P(c, r + 1)].map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(',');
          const cx = (c + 0.5) / cols - 0.5;
          const cy = (r + 0.5) / rows - 0.5;
          shards.push(
            `<div class="sh" style="--cp:polygon(${pts});--dx:${(cx * 90 + (rand(i) - 0.5) * 20).toFixed(1)}cqw;--dy:${(cy * 90 + (rand(i + 5) - 0.5) * 20).toFixed(1)}cqh;--dr:${((rand(i + 9) - 0.5) * 300).toFixed(0)}deg">${esc(w[0])}</div>`,
          );
          i++;
        }
      return `<div class="box"><div class="base">${esc(w[0])}</div>${shards.join('')}</div>`;
    },
  },
  {
    id: 'smoke-away',
    cat: 'texture',
    zh: '煙霧消散',
    en: 'Smoke Dissolve',
    desc: '文字像煙一樣一個字一個字飄散',
    tags: ['回憶', '感性'],
    tone: 'ink',
    sample: ['隨風而去'],
    hint: '2–6 字',
    motion: '文字清楚停留後，從第一個字開始依序化成煙霧：往右上方飄移、放大、強烈模糊並淡出，像被風吹散；全部消散後再從模糊中凝聚回來。',
    motionEn: 'After a clear hold, characters turn to smoke one by one from the first: drifting up and to the right, enlarging, blurring heavily and fading as if blown away; once gone, they condense back out of the blur.',
    css: `
.S .t{font-size:11cqw;display:flex;font-family:var(--serif)}
.S .c{animation:K_s 5s ease-in-out infinite;animation-delay:calc(var(--i)*.15s)}
@keyframes K_s{0%{filter:blur(2cqw);opacity:0;transform:scale(1.4)}20%,45%{filter:none;opacity:1;transform:none}75%,100%{filter:blur(2.5cqw);opacity:0;transform:translate(8cqw,-10cqh) scale(1.8) rotate(12deg)}}`,
    html: (w) => `<div class="t">${chars(w[0])}</div>`,
  },
  {
    id: 'halftone',
    cat: 'texture',
    zh: '網點',
    en: 'Halftone Dots',
    desc: '文字由大小變化的印刷網點組成',
    tags: ['普普風', '印刷'],
    tone: 'paper',
    sample: ['POP!'],
    hint: '英文或 1–4 字',
    motion: '文字內部由主色印刷網點填滿（background-clip: text + radial-gradient 網點），網點大小像呼吸一樣放大縮小並斜向流動，文字後方有偏移的黑色硬陰影，普普藝術風格。',
    motionEn: 'The text is filled with accent-colored print halftone dots (background-clip text + radial-gradient dots); the dots breathe in size and drift diagonally, with an offset hard black shadow behind, in a pop-art style.',
    css: `
.S .w{position:relative;font-size:24cqw;isolation:isolate}
.S .w::before{content:attr(data-t);position:absolute;inset:0;color:#111;transform:translate(1.4cqw,1.4cqw);z-index:-1}
.S .w span{background:radial-gradient(circle,var(--ac) var(--hd),transparent calc(var(--hd) + .5px)) 0 0/1.6cqw 1.6cqw,#fff;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:.3cqw #111;animation:K_h 2.4s ease-in-out infinite}
@property --hd{syntax:'<percentage>';inherits:false;initial-value:30%}
@keyframes K_h{0%,100%{--hd:22%;background-position:0 0}50%{--hd:48%;background-position:1.6cqw 1.6cqw}}`,
    html: (w) => `<div class="w" data-t="${esc(w[0])}"><span>${esc(w[0])}</span></div>`,
  },
  {
    id: 'heat-distort',
    cat: 'texture',
    zh: '水波扭曲',
    en: 'Ripple Distortion',
    desc: '文字像在水面或熱氣後面扭動',
    tags: ['夏天', '夢境'],
    tone: 'accent',
    sample: ['熱浪來襲'],
    hint: '2–6 字',
    motion: '文字被 SVG 位移濾鏡（feTurbulence + feDisplacementMap）扭曲，噪聲頻率持續緩慢變化，讓字像隔著熱氣或水面般流動；扭曲強度週期性增強再趨於平靜。',
    motionEn: 'The text is warped by an SVG displacement filter (feTurbulence + feDisplacementMap) whose noise frequency drifts continuously, making the letters ripple as if seen through heat haze or water; distortion strength periodically swells and calms.',
    css: `
.S .t{font-size:13cqw;color:#111;filter:url(#hdf)}`,
    html: (w) =>
      `<svg width="0" height="0" style="position:absolute"><filter id="hdf"><feTurbulence type="turbulence" baseFrequency="0.012 0.04" numOctaves="2" seed="3"><animate attributeName="baseFrequency" dur="6s" values="0.012 0.04;0.02 0.08;0.012 0.04" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="18"><animate attributeName="scale" dur="4s" values="4;28;4" repeatCount="indefinite"/></feDisplacementMap></filter></svg><div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'noise-dissolve',
    cat: 'texture',
    zh: '顆粒溶解',
    en: 'Grain Dissolve',
    desc: '文字被噪點侵蝕成沙粒消失',
    tags: ['轉場', '質感'],
    tone: 'ink',
    sample: ['消失'],
    hint: '1–4 字',
    motion: '文字以噪點遮罩逐步被侵蝕：細小的顆粒從邊緣開始隨機消失，像沙子被吹散，直到完全溶解；接著反向，顆粒重新聚合回完整文字。',
    motionEn: 'The text is eroded by a noise mask: fine grains vanish randomly starting at the edges like sand blowing away until fully dissolved; then it reverses and the grains reassemble into the full text.',
    css: `
.S .t{font-size:22cqw;color:var(--ac);filter:url(#ndf)}`,
    html: (w) =>
      `<svg width="0" height="0" style="position:absolute"><filter id="ndf" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1 1" result="a"/><feComponentTransfer in="a" result="m"><feFuncA type="linear" slope="8" intercept="-4"><animate attributeName="intercept" dur="4s" values="2;2;-8;-8;2" keyTimes="0;0.2;0.55;0.75;1" repeatCount="indefinite"/></feFuncA></feComponentTransfer><feComposite in="SourceGraphic" in2="m" operator="in"/></filter></svg><div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'matrix-rain',
    cat: 'texture',
    zh: '數位雨',
    en: 'Digital Rain',
    desc: '字元如雨落下，中間浮現關鍵字',
    tags: ['駭客', '科技'],
    tone: 'ink',
    sample: ['系統啟動'],
    hint: '2–6 字',
    motion: '整個畫面有多欄隨機字元（片假名、數字、中文）以不同速度往下落，每欄最前端最亮、尾巴漸暗；畫面中央的關鍵字以主色發光大字浮現並保持。',
    motionEn: 'Columns of random glyphs (katakana, digits, CJK) rain down the frame at different speeds, each column brightest at its head and fading along its tail; the keyword glows large in the accent color at the center and stays.',
    css: `
.S canvas{position:absolute;inset:0;width:100%;height:100%}
.S .t{position:relative;font-size:11cqw;color:var(--ac);text-shadow:0 0 1.5cqw var(--ac),0 0 4cqw var(--ac);background:#000a;padding:1cqw 3cqw;animation:K_g 3s ease-in-out infinite}
@keyframes K_g{50%{text-shadow:0 0 .6cqw var(--ac),0 0 2cqw var(--ac)}}`,
    html: (w) => `<canvas></canvas><div class="t">${esc(w[0])}</div>`,
    run: (root) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const ac = getComputedStyle(root).getPropertyValue('--ac').trim() || '#3f6';
      const W = (cv.width = Math.max(1, cv.clientWidth));
      const H = (cv.height = Math.max(1, cv.clientHeight));
      const fs = Math.max(8, Math.round(W / 40));
      const cols = Math.ceil(W / fs);
      const ys = Array.from({ length: cols }, () => Math.random() * -H);
      const sp = Array.from({ length: cols }, () => 0.4 + Math.random() * 0.8);
      const glyphs = 'アイウエオカキクケコサシスセソ0123456789光寓科技動態字卡';
      let raf = 0;
      let last = 0;
      const draw = (ts: number) => {
        raf = requestAnimationFrame(draw);
        if (ts - last < 50) return;
        last = ts;
        ctx.fillStyle = 'rgba(0,0,0,.12)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = `${fs}px monospace`;
        for (let i = 0; i < cols; i++) {
          const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
          ctx.fillStyle = '#fff';
          ctx.fillText(ch, i * fs, ys[i]);
          ctx.fillStyle = ac;
          ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fs, ys[i] - fs);
          ys[i] += fs * sp[i];
          if (ys[i] > H + fs * 4 && Math.random() > 0.95) ys[i] = 0;
        }
      };
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    },
  },
];

