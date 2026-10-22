import type { Fx } from '../types';
import { chars, esc } from '../util';

export const reveal: Fx[] = [
  {
    id: 'mask-rise',
    cat: 'reveal',
    zh: '遮罩上升',
    en: 'Mask Rise',
    desc: '每一行從隱形的線後方滑上來',
    tags: ['標題', '簡報'],
    tone: 'paper',
    sample: ['好的設計', '是看不見的'],
    hint: '1–3 行',
    motion: '每一行文字被裝在 overflow hidden 的容器裡，從容器下方滑上來到定位（緩出曲線 0.8 秒），行與行間隔 0.15 秒；停留後往上滑出消失。',
    motionEn: 'Each line sits in an overflow-hidden container and slides up from below into place (0.8s ease-out), lines staggered by 0.15s; after a hold they slide up and out.',
    css: `
.S .b{display:flex;flex-direction:column;align-items:flex-start}
.S .m{overflow:hidden;padding-bottom:.08em}
.S .l{font-size:9cqw;animation:K_r 3.6s cubic-bezier(.2,.8,.1,1) infinite both;animation-delay:calc(var(--i)*.15s)}
.S .m:last-child .l{color:var(--ac)}
@keyframes K_r{0%{transform:translateY(110%)}22%,78%{transform:none}96%,100%{transform:translateY(-110%)}}`,
    html: (w) => `<div class="b">${w.slice(0, 3).map((t, i) => `<div class="m"><div class="l" style="--i:${i}">${esc(t)}</div></div>`).join('')}</div>`,
  },
  {
    id: 'blur-focus',
    cat: 'reveal',
    zh: '模糊聚焦',
    en: 'Blur to Focus',
    desc: '從朦朧失焦慢慢對焦清楚',
    tags: ['回憶', '電影感'],
    tone: 'ink',
    sample: ['那年夏天'],
    hint: '2–6 字',
    motion: '文字從強烈模糊（blur 20px）、字距拉寬、略微放大且半透明的狀態，在 1.5 秒內慢慢對焦清楚、字距收回；停留後再慢慢失焦淡出。',
    motionEn: 'Text starts heavily blurred (20px), widely tracked, slightly enlarged and translucent, then slowly racks into sharp focus over 1.5s as the tracking tightens; after a hold it defocuses and fades out.',
    css: `
.S .t{font-size:12cqw;font-weight:500;animation:K_b 4.2s cubic-bezier(.3,0,.2,1) infinite}
@keyframes K_b{0%{filter:blur(2cqw);letter-spacing:.6em;opacity:0;transform:scale(1.15)}38%,75%{filter:blur(0);letter-spacing:.08em;opacity:1;transform:none}100%{filter:blur(1.5cqw);opacity:0;letter-spacing:.2em}}`,
    html: (w) => `<div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'fade-chars',
    cat: 'reveal',
    zh: '逐字浮現',
    en: 'Staggered Fade',
    desc: '一個字一個字優雅地浮上來',
    tags: ['優雅', '金句'],
    tone: 'paper',
    sample: ['慢一點也沒關係'],
    hint: '一句話',
    motion: '每個字由下方 30% 處、帶輕微模糊與透明度 0，依序上浮淡入到定位，每字間隔 0.06 秒，使用明體細字；停留後整句一起淡出。',
    motionEn: 'Each character rises from 30% below with a slight blur and zero opacity, fading into place in sequence 0.06s apart, set in a light serif; after a hold the whole line fades out together.',
    css: `
.S .t{font-size:7cqw;font-family:var(--serif);font-weight:500;display:flex}
.S .c{animation:K_f 4s cubic-bezier(.2,.7,.2,1) infinite both;animation-delay:calc(var(--i)*.06s)}
@keyframes K_f{0%{opacity:0;transform:translateY(30%);filter:blur(.5cqw)}20%,80%{opacity:1;transform:none;filter:none}95%,100%{opacity:0}}`,
    html: (w) => `<div class="t">${chars(w[0])}</div>`,
  },
  {
    id: 'box-wipe',
    cat: 'reveal',
    zh: '色塊擦除',
    en: 'Box Reveal',
    desc: '色塊刷過去，文字留在原地',
    tags: ['簡報', '標題'],
    tone: 'ink',
    sample: ['第一章', '從零開始'],
    hint: '1–2 行',
    motion: '每一行先有一塊主色長方形從左側伸展覆蓋整行，再從右側收走，色塊收走的同時文字出現在原位；兩行間隔 0.2 秒，停留後反向擦除。',
    motionEn: 'For each line, an accent-colored block extends from the left to cover the line, then retracts to the right, leaving the text revealed in place; two lines 0.2s apart; after a hold the wipe reverses.',
    css: `
.S .b{display:flex;flex-direction:column;align-items:flex-start;gap:1cqw}
.S .l{position:relative;font-size:8cqw}
.S .l span{animation:K_t 4s steps(1) infinite;animation-delay:calc(var(--i)*.2s)}
.S .l::after{content:'';position:absolute;inset:-.05em -.1em;background:var(--ac);animation:K_w 4s cubic-bezier(.7,0,.2,1) infinite both;animation-delay:calc(var(--i)*.2s)}
.S .l:nth-child(2){font-size:5cqw;font-weight:500}
@keyframes K_w{0%{transform:scaleX(0);transform-origin:0 50%}12%{transform:scaleX(1);transform-origin:0 50%}12.1%{transform-origin:100% 50%}24%{transform:scaleX(0);transform-origin:100% 50%}70%{transform:scaleX(0);transform-origin:100% 50%}80%{transform:scaleX(1);transform-origin:100% 50%}80.1%{transform-origin:0 50%}92%,100%{transform:scaleX(0);transform-origin:0 50%}}
@keyframes K_t{0%{opacity:0}12%{opacity:1}80%,100%{opacity:0}}`,
    html: (w) => `<div class="b">${w.slice(0, 2).map((t, i) => `<div class="l" style="--i:${i}"><span>${esc(t)}</span></div>`).join('')}</div>`,
  },
  {
    id: 'ink-spread',
    cat: 'reveal',
    zh: '墨水暈開',
    en: 'Ink Spread',
    desc: '像墨滴落在紙上暈出文字',
    tags: ['東方', '書法'],
    tone: 'paper',
    sample: ['墨'],
    hint: '1–3 字，書法感最佳',
    motion: '米白宣紙背景，一滴墨從中心落下，以不規則邊緣的圓形向外暈開，暈開的範圍內顯現黑色明體大字，邊緣帶模糊與水漬感；停留後墨色淡去。',
    motionEn: 'On off-white rice paper, an ink drop lands at the center and spreads outward in an irregular circle; the bold black serif glyph appears within the spread with soft, watery edges; after a hold the ink fades.',
    css: `
.S{background:radial-gradient(circle at 30% 30%,#0000000a,transparent 50%),var(--bg)}
.S .t{font-size:30cqw;font-family:var(--serif);color:#111;filter:url(#inkf);-webkit-mask:radial-gradient(circle var(--ir) at 50% 50%,#000 70%,transparent);mask:radial-gradient(circle var(--ir) at 50% 50%,#000 70%,transparent);animation:K_i 4.5s cubic-bezier(.2,.6,.3,1) infinite}
@property --ir{syntax:'<length>';inherits:false;initial-value:0px}
@keyframes K_i{0%{--ir:0px;opacity:1}45%,80%{--ir:40cqw;opacity:1}100%{--ir:40cqw;opacity:0}}`,
    html: (w) =>
      `<svg width="0" height="0" style="position:absolute"><filter id="inkf"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3"/><feDisplacementMap in="SourceGraphic" scale="12"/></filter></svg><div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'curtain',
    cat: 'reveal',
    zh: '拉幕',
    en: 'Curtain Open',
    desc: '兩片布幕從中間拉開',
    tags: ['揭曉', '開幕'],
    tone: 'ink',
    sample: ['隆重登場'],
    hint: '2–6 字',
    motion: '左右兩片主色布幕（帶垂直褶皺陰影）遮住畫面，從中間往兩側拉開，後方文字從 90% 放大到 100% 出現；停留後布幕合起。',
    motionEn: 'Two accent-colored curtains with vertical fold shading cover the frame and draw open from the center to the sides; the text behind scales from 90% to 100% as it is revealed; after a hold the curtains close.',
    css: `
.S .t{font-size:12cqw;animation:K_t 4.4s cubic-bezier(.6,0,.2,1) infinite}
.S .cl,.S .cr{position:absolute;top:0;bottom:0;width:51%;background:repeating-linear-gradient(90deg,color-mix(in srgb,var(--ac) 80%,#000) 0 1cqw,var(--ac) 2.5cqw,color-mix(in srgb,var(--ac) 80%,#000) 4cqw);animation:K_l 4.4s cubic-bezier(.6,0,.2,1) infinite;box-shadow:0 0 3cqw #000a}
.S .cl{left:0}.S .cr{right:0;animation-name:K_r}
@keyframes K_l{0%,10%,92%,100%{transform:none}35%,70%{transform:translateX(-100%)}}
@keyframes K_r{0%,10%,92%,100%{transform:none}35%,70%{transform:translateX(100%)}}
@keyframes K_t{0%,15%{transform:scale(.9)}40%,100%{transform:none}}`,
    html: (w) => `<div class="t">${esc(w[0])}</div><div class="cl"></div><div class="cr"></div>`,
  },
  {
    id: 'handwrite',
    cat: 'reveal',
    zh: '手寫描邊',
    en: 'Stroke Draw',
    desc: '筆畫被一筆一筆描出來再填色',
    tags: ['手作', '簽名'],
    tone: 'paper',
    sample: ['謝謝你'],
    hint: '2–5 字',
    motion: '文字以 SVG 呈現，先用主色細線沿著輪廓描邊畫出（stroke-dashoffset 動畫約 2 秒），描完後內部以黑色淡入填滿、描邊淡出；停留後重來。',
    motionEn: 'Text rendered as SVG: a thin accent-colored stroke traces the outlines (stroke-dashoffset animation, about 2s); once drawn, the fill fades in black while the stroke fades away; hold, then repeat.',
    css: `
.S svg{width:92%;height:60%;overflow:visible}
.S text{font-size:120px;font-weight:900;fill:#111;fill-opacity:0;stroke:var(--ac);stroke-width:2.5;stroke-dasharray:900;stroke-dashoffset:900;animation:K_d 4.5s ease-in-out infinite}
@keyframes K_d{0%{stroke-dashoffset:900;fill-opacity:0;stroke-opacity:1}50%{stroke-dashoffset:0;fill-opacity:0}65%,88%{fill-opacity:1;stroke-opacity:0;stroke-dashoffset:0}100%{fill-opacity:0;stroke-opacity:0}}`,
    html: (w) =>
      `<svg viewBox="0 0 ${Math.max(2, Array.from(w[0]).length) * 125 + 20} 160"><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle">${esc(w[0])}</text></svg>`,
  },
  {
    id: 'iris',
    cat: 'reveal',
    zh: '圓形開場',
    en: 'Iris Reveal',
    desc: '一個圓從中心打開，露出文字',
    tags: ['復古', '轉場'],
    tone: 'accent',
    sample: ['ACTION'],
    hint: '英文或 2–6 字',
    motion: '老電影的光圈轉場：黑色畫面中一個圓形從中心擴大打開，露出主色背景與文字，文字同時從 120% 縮到 100%；停留後圓形縮回中心關閉。',
    motionEn: 'An old-film iris transition: from black, a circle opens from the center to reveal the accent background and the text, which shrinks from 120% to 100%; after a hold the iris closes back to a point.',
    css: `
.S{background:#000}
.S .in{position:absolute;inset:0;display:grid;place-items:center;background:var(--bg);clip-path:circle(var(--irr) at 50% 50%);animation:K_c 4s cubic-bezier(.7,0,.3,1) infinite}
.S .t{font-size:14cqw;color:#111;letter-spacing:.1em;animation:K_t 4s cubic-bezier(.3,0,.2,1) infinite}
@property --irr{syntax:'<percentage>';inherits:false;initial-value:0%}
@keyframes K_c{0%,5%{--irr:0%}35%,75%{--irr:75%}95%,100%{--irr:0%}}
@keyframes K_t{0%,10%{transform:scale(1.2)}40%,100%{transform:none}}`,
    html: (w) => `<div class="in"><div class="t">${esc(w[0])}</div></div>`,
  },
  {
    id: 'line-unfold',
    cat: 'reveal',
    zh: '線條展開',
    en: 'Line Unfold',
    desc: '一條線延伸開來，文字從線上展開',
    tags: ['極簡', '簡報'],
    tone: 'ink',
    sample: ['少即是多'],
    hint: '2–6 字',
    motion: '畫面中央先畫出一條從中心向兩側延伸的主色細線，接著文字從線的位置垂直展開（scaleY 0→1），線條同時往上移到文字下方當作底線；停留後反向收回。',
    motionEn: 'A thin accent line first extends from the center outward; then the text unfolds vertically from the line (scaleY 0→1) while the line slides down to sit beneath the text as an underline; after a hold it reverses.',
    css: `
.S .box{position:relative;display:grid;place-items:center}
.S .t{font-size:11cqw;animation:K_t 4s cubic-bezier(.7,0,.2,1) infinite}
.S .ln{position:absolute;left:-6%;right:-6%;top:50%;height:.35cqw;background:var(--ac);animation:K_l 4s cubic-bezier(.7,0,.2,1) infinite}
@keyframes K_l{0%{transform:scaleX(0)}15%,25%{transform:scaleX(1)}40%,80%{transform:translateY(7.5cqw) scaleX(1)}92%{transform:scaleX(1)}100%{transform:scaleX(0)}}
@keyframes K_t{0%,18%{transform:scaleY(0)}40%,80%{transform:none}92%,100%{transform:scaleY(0)}}`,
    html: (w) => `<div class="box"><div class="t">${esc(w[0])}</div><div class="ln"></div></div>`,
  },
  {
    id: 'split-reveal',
    cat: 'reveal',
    zh: '左右對開',
    en: 'Center Split',
    desc: '文字從中縫左右滑開出現',
    tags: ['標題', '時尚'],
    tone: 'paper',
    sample: ['NEW', 'ARRIVAL'],
    hint: '2 個詞',
    motion: '兩個詞分別從畫面中線向左、向右滑出（被中線遮擋），中線是一條垂直主色細線；字到位後中線淡出，停留後兩詞滑回中線。',
    motionEn: 'Two words slide out from the vertical center line, one to the left and one to the right (masked at the seam), the seam drawn as a thin accent line that fades once the words land; after a hold the words slide back into the seam.',
    css: `
.S .row{display:flex;font-size:10cqw;letter-spacing:.05em}
.S .h{overflow:hidden;display:flex}
.S .h:first-child{justify-content:flex-end;padding-right:2cqw}
.S .h:last-child{padding-left:2cqw}
.S .h span{animation:K_l 4s cubic-bezier(.7,0,.2,1) infinite}
.S .h:last-child span{animation-name:K_r;color:var(--ac)}
.S .seam{position:absolute;width:.3cqw;height:16cqw;background:var(--ac);animation:K_s 4s ease infinite}
@keyframes K_l{0%,8%{transform:translateX(105%)}35%,75%{transform:none}95%,100%{transform:translateX(105%)}}
@keyframes K_r{0%,8%{transform:translateX(-105%)}35%,75%{transform:none}95%,100%{transform:translateX(-105%)}}
@keyframes K_s{0%,30%,80%,100%{opacity:1;transform:scaleY(1)}45%,70%{opacity:0;transform:scaleY(.3)}}`,
    html: (w) => `<div class="row"><div class="h"><span>${esc(w[0])}</span></div><div class="h"><span>${esc(w[1] ?? '')}</span></div></div><div class="seam"></div>`,
  },
];

