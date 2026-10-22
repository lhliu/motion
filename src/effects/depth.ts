import type { Fx } from '../types';
import { chars, esc, pick, rep } from '../util';

export const depth: Fx[] = [
  {
    id: 'text-tunnel',
    cat: 'depth',
    zh: '文字隧道',
    en: 'Text Tunnel',
    desc: '從文字中間穿過去',
    tags: ['開場', '科幻'],
    tone: 'ink',
    sample: ['穿越'],
    hint: '2–3 字',
    motion: '多層同心方框，每層四邊都寫著同一個詞，從畫面中心的極小尺寸不斷放大朝鏡頭衝來並淡出，層與層等距錯開，形成無止盡的文字隧道。',
    motionEn: 'Concentric square frames, each with the same word on all four sides, endlessly scale up from a tiny point at the center toward the camera and fade out, evenly staggered, forming an infinite text tunnel.',
    css: `
.S .f{position:absolute;width:40cqmin;height:40cqmin;border:2px solid color-mix(in srgb,var(--ac) 60%,transparent);animation:K_t 4s linear infinite both;animation-delay:calc(var(--i)*-.5s);display:grid}
.S .f b{position:absolute;font-size:5cqmin;white-space:nowrap;left:50%;top:50%}
.S .f b:nth-child(1){transform:translate(-50%,-50%) translateY(-23cqmin)}
.S .f b:nth-child(2){transform:translate(-50%,-50%) translateY(23cqmin) rotate(180deg)}
.S .f b:nth-child(3){transform:translate(-50%,-50%) translateX(-23cqmin) rotate(-90deg)}
.S .f b:nth-child(4){transform:translate(-50%,-50%) translateX(23cqmin) rotate(90deg)}
@keyframes K_t{0%{transform:scale(.02);opacity:0}15%{opacity:1}100%{transform:scale(4);opacity:0}}`,
    html: (w) => rep(8, (i) => `<div class="f" style="--i:${i}">${rep(4, () => `<b>${esc(w[0])}</b>`)}</div>`),
  },
  {
    id: 'text-corridor',
    cat: 'depth',
    zh: '文字走廊',
    en: 'Text Corridor',
    desc: '地板牆壁都是字，一路往前',
    tags: ['沉浸', 'MV'],
    tone: 'accent',
    sample: ['前進'],
    hint: '2–3 字',
    motion: '3D 透視走廊，地板、天花板、左右牆四個面都鋪滿重複的同一個詞，文字持續往鏡頭方向移動，像在字做成的走廊裡一路前進；中央消失點保持留白。',
    motionEn: 'A 3D perspective corridor whose floor, ceiling and both walls are tiled with the same repeated word; the text keeps moving toward the camera as if travelling down a hallway made of words, with the vanishing point left empty.',
    css: `
.S{perspective:28cqw;perspective-origin:50% 50%}
.S .p{position:absolute;width:120cqw;height:300cqw;left:50%;top:50%;overflow:hidden;font-size:7cqw;line-height:1.1;color:#111;display:flex;flex-wrap:wrap;align-content:flex-start;gap:0 2cqw;justify-content:center}
.S .p>div{animation:K_go 3s linear infinite;display:flex;flex-wrap:wrap;justify-content:center;gap:0 2cqw}
.S .fl{transform:translate(-50%,-50%) translateY(28cqh) rotateX(90deg)}
.S .ce{transform:translate(-50%,-50%) translateY(-28cqh) rotateX(-90deg)}
.S .le{transform:translate(-50%,-50%) translateX(-50cqw) rotateY(90deg) rotate(90deg)}
.S .ri{transform:translate(-50%,-50%) translateX(50cqw) rotateY(-90deg) rotate(-90deg)}
.S .fog{position:absolute;inset:0;background:radial-gradient(closest-side,var(--bg) 18%,transparent 70%)}
@keyframes K_go{to{transform:translateY(8.8cqw)}}`,
    html: (w) => {
      const plane = (c: string) => `<div class="p ${c}"><div>${rep(150, () => `<span>${esc(w[0])}</span>`)}</div></div>`;
      return plane('fl') + plane('ce') + plane('le') + plane('ri') + '<div class="fog"></div>';
    },
  },
  {
    id: 'text-cylinder',
    cat: 'depth',
    zh: '圓柱',
    en: 'Text Cylinder',
    desc: '文字圓柱反向旋轉',
    tags: ['立體', 'Logo'],
    tone: 'paper',
    sample: ['轉圈圈'],
    hint: '2–4 字，會重複排滿一圈',
    motion: '文字逐字排列在三個上下堆疊的 3D 圓柱表面上，每一圈 12 個字；上下兩圈順時針、中間圈逆時針繞 Y 軸旋轉，背面的字變淡，中間圈用主色。',
    motionEn: 'Characters wrap around three stacked 3D cylinders, 12 glyphs per ring; the top and bottom rings rotate clockwise around the Y axis while the middle ring rotates counter-clockwise; back-facing glyphs dim and the middle ring uses the accent color.',
    css: `
.S{perspective:120cqw}
.S .ring{position:relative;width:1px;height:12cqmin;transform-style:preserve-3d;animation:K_r 9s linear infinite}
.S .ring:nth-child(2){animation-direction:reverse;color:var(--ac)}
.S .ring:nth-child(1){top:-14cqmin}.S .ring:nth-child(3){top:14cqmin}
.S .wrap{position:absolute;display:grid}
.S .g{position:absolute;left:0;top:0;font-size:10cqmin;width:12cqmin;margin-left:-6cqmin;text-align:center;transform:rotateY(calc(var(--i)*30deg)) translateZ(24cqmin);backface-visibility:visible}
@keyframes K_r{from{transform:rotateX(-12deg) rotateY(0)}to{transform:rotateX(-12deg) rotateY(-360deg)}}`,
    html: (w) => {
      const glyphs = Array.from(w[0] || '轉');
      const ring = rep(12, (i) => `<span class="g" style="--i:${i}">${esc(glyphs[i % glyphs.length])}</span>`);
      return `<div class="wrap"><div class="ring">${ring}</div><div class="ring">${ring}</div><div class="ring">${ring}</div></div>`;
    },
  },
  {
    id: 'text-vortex',
    cat: 'depth',
    zh: '漩渦',
    en: 'Text Vortex',
    desc: '文字扭轉捲成漩渦',
    tags: ['奇幻', '亮點'],
    tone: 'ink',
    sample: ['漩渦'],
    hint: '2–3 字',
    motion: '文字的每個字沿著對數螺旋排列，由外而內字越來越小、越來越淡，整個螺旋持續旋轉並緩慢縮放，像被吸入漩渦；中央放大的主詞維持不動。',
    motionEn: 'Glyphs are arranged along a logarithmic spiral, shrinking and fading toward the center; the whole spiral spins and gently pulses in scale as if being sucked into a vortex, while the main word stays large and still in the middle.',
    css: `
.S .sp{position:absolute;width:0;height:0;animation:K_v 8s linear infinite}
.S .g{position:absolute;font-size:calc(var(--s)*1cqmin);opacity:var(--o);transform:rotate(var(--a)) translateX(calc(var(--d)*1cqmin)) rotate(90deg);translate:-50% -50%;color:var(--ac)}
.S .mid{font-size:16cqmin;position:relative;animation:K_p 4s ease-in-out infinite}
@keyframes K_v{to{transform:rotate(1turn)}}
@keyframes K_p{50%{transform:scale(1.08) rotate(-4deg)}}`,
    html: (w) => {
      const g = Array.from(w[0] || '漩');
      return `<div class="sp">${rep(48, (i) => {
        const d = 6 + i * 1.15;
        return `<span class="g" style="--a:${i * 28}deg;--d:${d};--s:${2 + i * 0.12};--o:${0.15 + i / 60}">${esc(g[i % g.length])}</span>`;
      })}</div><div class="mid">${esc(w[0])}</div>`;
    },
  },
  {
    id: 'ring-tunnel',
    cat: 'depth',
    zh: '圓環隧道',
    en: 'Ring Text Tunnel',
    desc: '一圈圈文字撲面而來',
    tags: ['開場', '科幻'],
    tone: 'ink',
    sample: ['未來已來'],
    hint: '2–5 字',
    motion: '多個由文字排成的圓環，從中心點不斷放大朝鏡頭撲來，每個圓環同時緩慢旋轉，奇數環用主色，越靠近鏡頭越透明，形成環狀時光隧道。',
    motionEn: 'Multiple rings made of text continuously expand from the center toward the camera while slowly rotating; alternate rings use the accent color and fade as they near the lens, forming a circular time tunnel.',
    css: `
.S .rg{position:absolute;width:60cqmin;height:60cqmin;animation:K_z 4.8s linear infinite both;animation-delay:calc(var(--i)*-.8s)}
.S .rg:nth-child(2n){color:var(--ac)}
.S .rg svg{width:100%;height:100%;animation:K_r 12s linear infinite;overflow:visible}
.S text{font-size:30px;font-weight:900;fill:currentColor;letter-spacing:4px}
@keyframes K_z{0%{transform:scale(.02);opacity:0}20%{opacity:1}100%{transform:scale(3.2);opacity:0}}
@keyframes K_r{to{transform:rotate(1turn)}}`,
    html: (w) =>
      `<svg width="0" height="0" style="position:absolute"><defs><path id="rtp" d="M150 150 m-120 0 a120 120 0 1 1 240 0 a120 120 0 1 1 -240 0"/></defs></svg>${rep(
        6,
        (i) =>
          `<div class="rg" style="--i:${i}"><svg viewBox="0 0 300 300"><text><textPath href="#rtp" textLength="740">${esc(w[0])}　${esc(w[0])}　${esc(w[0])}　</textPath></text></svg></div>`,
      )}`,
  },
  {
    id: 'text-orbit',
    cat: 'depth',
    zh: '軌道',
    en: 'Text Orbit',
    desc: '單字帶著景深繞圈',
    tags: ['Logo', '標題'],
    tone: 'accent',
    sample: ['軌道', '★'],
    hint: '主詞 2–4 字',
    motion: '主詞在中央，一顆小符號沿著傾斜的橢圓虛線軌道繞行，經過主詞後方時被遮住、經過前方時放大，產生 3D 景深；主詞本身輕微上下浮動。',
    motionEn: 'The main word sits in the center while a small symbol travels around a tilted dashed elliptical orbit, hidden when passing behind the word and enlarged when passing in front, creating 3D depth; the word gently floats up and down.',
    css: `
.S .orb{position:absolute;width:70cqw;height:22cqw;border:2px dashed color-mix(in srgb,#111 55%,transparent);border-radius:50%}
.S .w{font-size:15cqw;color:#111;position:relative;z-index:2;animation:K_f 3s ease-in-out infinite}
.S .dy{position:absolute;left:50%;top:50%;animation:K_y 4s ease-in-out infinite alternate;animation-delay:-2s}
.S .dot{display:block;font-size:6cqw;color:#fff;translate:-50% -50%;animation:K_x 4s ease-in-out infinite alternate;animation-delay:-1s;animation-duration:2s}
.S .dy{animation-duration:2s;animation-delay:0s}
@keyframes K_x{from{transform:translateX(-35cqw)}to{transform:translateX(35cqw)}}
@keyframes K_y{from{transform:translateY(-11cqw) scale(.7);z-index:1}49%{z-index:1}51%{z-index:3}to{transform:translateY(11cqw) scale(1.3);z-index:3}}
@keyframes K_f{50%{transform:translateY(-4%)}}`,
    html: (w) =>
      `<div class="orb"></div><div class="w">${esc(w[0])}</div><div class="dy"><span class="dot">${esc(w[1] ?? '★')}</span></div>`,
  },
  {
    id: 'text-cube',
    cat: 'depth',
    zh: '方塊',
    en: 'Text Cube',
    desc: '四面寫字的方塊直向翻轉',
    tags: ['切換', '立體'],
    tone: 'paper',
    sample: ['春', '夏', '秋', '冬'],
    hint: '4 個字或短詞',
    motion: '一個 3D 立方體，前上後下四個面各寫一個字（主色底白字），每隔 1 秒繞 X 軸翻轉 90 度並帶回彈，依序露出下一面，四面輪完循環。',
    motionEn: 'A 3D cube with one word on each of four faces (white on accent); every second it flips 90 degrees around the X axis with a slight overshoot, revealing the next face, cycling through all four.',
    css: `
.S{perspective:120cqmin}
.S .cube{width:36cqmin;height:36cqmin;position:relative;transform-style:preserve-3d;animation:K_c 5.2s cubic-bezier(.5,-0.3,.4,1.4) infinite}
.S .fc{position:absolute;inset:0;display:grid;place-items:center;background:var(--ac);color:#fff;font-size:calc(36cqmin / var(--len,1) * .62);border:2px solid color-mix(in srgb,#000 15%,var(--ac))}
.S .fc:nth-child(1){transform:translateZ(18cqmin)}
.S .fc:nth-child(2){transform:rotateX(-90deg) translateZ(18cqmin)}
.S .fc:nth-child(3){transform:rotateX(-180deg) translateZ(18cqmin)}
.S .fc:nth-child(4){transform:rotateX(-270deg) translateZ(18cqmin)}
@keyframes K_c{0%,20%{transform:rotateX(0)}25%,45%{transform:rotateX(90deg)}50%,70%{transform:rotateX(180deg)}75%,95%{transform:rotateX(270deg)}100%{transform:rotateX(360deg)}}`,
    html: (w) =>
      `<div class="cube">${pick(w, 4, ['春', '夏', '秋', '冬'])
        .map((t) => `<div class="fc" style="--len:${Math.max(1, Array.from(t).length)}">${esc(t)}</div>`)
        .join('')}</div>`,
  },
  {
    id: 'extrude',
    cat: 'depth',
    zh: '立體字',
    en: 'Extrude Text',
    desc: '立體字的厚度方向轉一圈',
    tags: ['標題', '復古'],
    tone: 'ink',
    sample: ['立體'],
    hint: '2–4 字',
    motion: '粗體文字帶有 20 層堆疊的厚度（每層位移 1px、顏色漸深），厚度的方向繞著文字轉一圈（右下→左下→左上→右上），像立體字在擺頭，正面用主色。',
    motionEn: 'Bold text with a 20-layer stacked extrusion (1px per layer, progressively darker); the extrusion direction rotates around the letters (down-right → down-left → up-left → up-right) as if the 3D type is swaying; the face uses the accent color.',
    css: '',
    html: (w) => `<div class="w">${esc(w[0])}</div>`,
  },
  {
    id: 'flip-chars',
    cat: 'depth',
    zh: '逐字翻轉',
    en: '3D Letter Flip',
    desc: '每個字依序繞 Y 軸翻一圈',
    tags: ['轉場', '標題'],
    tone: 'accent',
    sample: ['翻轉人生'],
    hint: '3–6 字',
    motion: '每個字依序繞 Y 軸 3D 翻轉 360 度（帶透視），翻轉時字的背面顯示為深色，字與字間隔 0.1 秒形成骨牌般的波浪，間隔 1.5 秒再重來。',
    motionEn: 'Each character flips 360 degrees around the Y axis in 3D perspective in sequence, showing a dark back face mid-flip, 0.1s apart like a domino wave; repeats after a 1.5s pause.',
    css: `
.S{perspective:60cqw}
.S .t{display:flex;font-size:14cqw;color:#111}
.S .c{animation:K_f 3s cubic-bezier(.5,0,.3,1) infinite;animation-delay:calc(var(--i)*.1s);transform-style:preserve-3d}
@keyframes K_f{0%{transform:rotateY(0)}40%,100%{transform:rotateY(360deg)}}`,
    html: (w) => `<div class="t">${chars(w[0])}</div>`,
  },
  {
    id: 'star-crawl',
    cat: 'depth',
    zh: '星際開場',
    en: 'Perspective Crawl',
    desc: '文字往遠方地平線捲去',
    tags: ['開場', '電影感'],
    tone: 'ink',
    sample: ['很久很久以前', '在一個遙遠的重劃區', '有一位持家男子', '決定開始拍影片'],
    hint: '多行短句',
    motion: '電影開場式的透視捲動：一段置中的段落文字傾倒成 3D 平面（rotateX 約 25 度），由畫面下方往遠方地平線慢慢捲去並縮小淡出，文字使用主色，背景點綴小星點。',
    motionEn: 'A cinematic opening crawl: a centered paragraph tilted back into a 3D plane (about 25 degrees rotateX) scrolls from the bottom toward the distant horizon, shrinking and fading; text in the accent color over a starfield.',
    css: `
.S{perspective:40cqh;background:radial-gradient(1px 1px at 20% 30%,#fff 50%,transparent),radial-gradient(1px 1px at 70% 20%,#fff 50%,transparent),radial-gradient(1.5px 1.5px at 40% 80%,#fff 50%,transparent),radial-gradient(1px 1px at 85% 65%,#fff 50%,transparent),var(--bg)}
.S .plane{position:absolute;bottom:0;width:70cqw;height:200cqh;transform-origin:50% 100%;transform:rotateX(28deg);-webkit-mask:linear-gradient(transparent 5%,#000 45%);mask:linear-gradient(transparent 5%,#000 45%)}
.S .txt{position:absolute;top:100%;width:100%;text-align:center;color:var(--ac);font-size:6cqw;line-height:1.4;animation:K_cr 12s linear infinite}
@keyframes K_cr{to{transform:translateY(-180cqh)}}`,
    html: (w) => `<div class="plane"><div class="txt">${w.map(esc).join('<br>')}</div></div>`,
  },
];

// 立體字：用多層 text-shadow 做厚度，並在四個方向之間補間
const ext = (dx: number, dy: number) =>
  Array.from({ length: 20 }, (_, i) => `${dx * (i + 1)}px ${dy * (i + 1)}px 0 color-mix(in srgb,var(--ac) ${70 - i * 3}%,#000)`).join(',');
const extrude = depth.find((f) => f.id === 'extrude')!;
extrude.css = `
.S .w{font-size:17cqw;color:var(--ac);filter:brightness(1.15);animation:K_e 4s ease-in-out infinite}
@keyframes K_e{0%,100%{text-shadow:${ext(1, 1)}}25%{text-shadow:${ext(-1, 1)}}50%{text-shadow:${ext(-1, -1)}}75%{text-shadow:${ext(1, -1)}}}`;
