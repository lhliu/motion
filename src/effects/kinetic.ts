import type { Fx } from '../types';
import { chars, esc, rand } from '../util';

const charsWithRandom = (t: string) =>
  Array.from(t)
    .map(
      (ch, i) =>
        `<span class="c" style="--i:${i};--rx:${((rand(i + 1) - 0.5) * 120).toFixed(1)}cqw;--ry:${((rand(i + 9) - 0.5) * 90).toFixed(1)}cqh;--rr:${((rand(i + 17) - 0.5) * 540).toFixed(0)}deg">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`,
    )
    .join('');

export const kinetic: Fx[] = [
  {
    id: 'wave-text',
    cat: 'kinetic',
    zh: '波浪字',
    en: 'Wave Text',
    desc: '每個字像海浪一樣上下起伏',
    tags: ['輕鬆', '夏天'],
    tone: 'accent',
    sample: ['一起去海邊'],
    hint: '3–8 字',
    motion: '每個字以正弦波節奏上下起伏（位移約字高 25%），相鄰字延遲 0.1 秒形成連續波浪，波峰的字同時微微放大並變成白色。',
    motionEn: 'Each character bobs up and down on a sine rhythm (about 25% of glyph height), neighbors 0.1s apart forming a continuous wave; characters at the crest scale up slightly and turn white.',
    css: `
.S .t{font-size:11cqw;display:flex;color:#111}
.S .c{animation:K_w 1.6s ease-in-out infinite;animation-delay:calc(var(--i)*.1s)}
@keyframes K_w{0%,100%{transform:translateY(12%)}50%{transform:translateY(-12%) scale(1.08);color:#fff}}`,
    html: (w) => `<div class="t">${chars(w[0])}</div>`,
  },
  {
    id: 'bounce-in',
    cat: 'kinetic',
    zh: '彈跳入場',
    en: 'Bounce In',
    desc: '字從天上掉下來彈三下',
    tags: ['可愛', '兒童'],
    tone: 'paper',
    sample: ['蹦蹦跳跳'],
    hint: '2–6 字',
    motion: '每個字從畫面上方掉落，落地後以物理感的彈跳（第一次彈高 30%、第二次 10%、第三次 3%）停下，字與字間隔 0.08 秒；停留後一起往上跳出畫面。',
    motionEn: 'Each character falls from above and bounces with physical decay (30%, then 10%, then 3% height) before settling, 0.08s apart; after a hold they all leap up out of frame.',
    css: `
.S .t{font-size:13cqw;display:flex}
.S .c{animation:K_b 3.6s infinite both;animation-delay:calc(var(--i)*.08s)}
.S .c:nth-child(3n+1){color:var(--ac)}
@keyframes K_b{0%{transform:translateY(-60cqh);animation-timing-function:cubic-bezier(.5,0,1,.5)}12%{transform:none;animation-timing-function:cubic-bezier(0,.5,.5,1)}18%{transform:translateY(-30%);animation-timing-function:cubic-bezier(.5,0,1,.5)}24%{transform:none;animation-timing-function:cubic-bezier(0,.5,.5,1)}27%{transform:translateY(-10%);animation-timing-function:cubic-bezier(.5,0,1,.5)}30%{transform:none}32%{transform:translateY(-3%)}34%,82%{transform:none}92%,100%{transform:translateY(-60cqh)}}`,
    html: (w) => `<div class="t">${chars(w[0])}</div>`,
  },
  {
    id: 'swing-sign',
    cat: 'kinetic',
    zh: '吊牌搖擺',
    en: 'Hanging Swing',
    desc: '每個字像掛在線上的吊牌晃動',
    tags: ['店招', '可愛'],
    tone: 'ink',
    sample: ['營業中'],
    hint: '2–5 字',
    motion: '每個字放在一塊白色方形吊牌上，用細線掛在畫面上方的橫桿，吊牌以頂端為軸心左右擺盪並逐漸停下（阻尼擺動），每塊擺動相位不同。',
    motionEn: 'Each character sits on a white square tag hanging by a thin string from a top rail; tags swing from their top pivot and gradually settle (damped pendulum), each with a different phase.',
    css: `
.S{place-items:start center}
.S .rail{position:absolute;top:10%;left:15%;right:15%;height:.6cqw;background:var(--ac);border-radius:9px}
.S .row{display:flex;gap:3cqw;margin-top:calc(10cqh + .6cqw)}
.S .tag{display:flex;flex-direction:column;align-items:center;transform-origin:50% 0;animation:K_s 4s ease-in-out infinite;animation-delay:calc(var(--i)*-.35s)}
.S .tag i{width:.25cqw;height:10cqh;background:#999}
.S .tag b{width:14cqw;height:14cqw;display:grid;place-items:center;background:#fff;color:#111;font-size:10cqw;border-radius:1.4cqw;box-shadow:0 1cqw 2cqw #0006}
@keyframes K_s{0%{transform:rotate(22deg)}12%{transform:rotate(-16deg)}24%{transform:rotate(11deg)}36%{transform:rotate(-7deg)}48%{transform:rotate(4deg)}60%{transform:rotate(-2deg)}72%,94%{transform:rotate(0)}100%{transform:rotate(22deg)}}`,
    html: (w) =>
      `<div class="rail"></div><div class="row">${Array.from(w[0])
        .map((ch, i) => `<div class="tag" style="--i:${i}"><i></i><b>${esc(ch)}</b></div>`)
        .join('')}</div>`,
  },
  {
    id: 'gravity-fall',
    cat: 'kinetic',
    zh: '重力掉落',
    en: 'Gravity Drop',
    desc: '字站不穩，一個個翻倒掉下去',
    tags: ['崩潰', '搞笑'],
    tone: 'paper',
    sample: ['心態崩了'],
    hint: '2–6 字',
    motion: '文字先端正站好，接著每個字隨機延遲後失去支撐，帶著不同角度的旋轉加速掉出畫面下方（重力加速度曲線）；全部掉光後從上方重新落下排好。',
    motionEn: 'The text first stands neatly; then each character, after a random delay, loses support and accelerates down out of frame with a different spin (gravity easing); once all have fallen, they drop back in from above and line up again.',
    css: `
.S .t{font-size:13cqw;display:flex}
.S .c{animation:K_g 4s infinite both;animation-delay:calc(var(--i)*.13s)}
@keyframes K_g{0%{transform:translateY(-70cqh);animation-timing-function:cubic-bezier(.2,.8,.3,1.2)}12%,40%{transform:none;animation-timing-function:cubic-bezier(.6,0,1,.6)}45%{transform:rotate(calc(var(--rr)*.05))}75%,100%{transform:translateY(80cqh) rotate(var(--rr))}}`,
    html: (w) => `<div class="t">${charsWithRandom(w[0])}</div>`,
  },
  {
    id: 'spin-in',
    cat: 'kinetic',
    zh: '旋轉入場',
    en: 'Spin In',
    desc: '字邊轉邊放大進場',
    tags: ['活潑', '片頭'],
    tone: 'ink',
    sample: ['精彩回顧'],
    hint: '2–6 字',
    motion: '每個字從 0 倍、旋轉 -180 度的狀態，以帶回彈的曲線轉正並放大到 100%，間隔 0.07 秒；停留後每個字反方向旋轉縮小消失。',
    motionEn: 'Each character spins in from scale 0 at -180 degrees to upright 100% with an overshooting curve, 0.07s apart; after a hold each spins the other way and shrinks away.',
    css: `
.S .t{font-size:12cqw;display:flex}
.S .c{animation:K_s 3.4s cubic-bezier(.3,1.5,.5,1) infinite both;animation-delay:calc(var(--i)*.07s)}
.S .c:nth-child(2n){color:var(--ac)}
@keyframes K_s{0%{transform:scale(0) rotate(-180deg)}18%,80%{transform:none}95%,100%{transform:scale(0) rotate(180deg)}}`,
    html: (w) => `<div class="t">${chars(w[0])}</div>`,
  },
  {
    id: 'jelly',
    cat: 'kinetic',
    zh: '果凍晃動',
    en: 'Jelly Wobble',
    desc: '整排字像果凍一樣 Q 彈晃動',
    tags: ['可愛', '甜點'],
    tone: 'accent',
    sample: ['Q彈'],
    hint: '1–4 字',
    motion: '文字像果凍被戳一下：快速地在水平與垂直方向交替伸縮（scale 1.25/0.75 → 0.85/1.15 → …）逐漸衰減停下，伴隨輕微傾斜，每 2 秒戳一次。',
    motionEn: 'The text wobbles like poked jelly: it alternately stretches horizontally and vertically (1.25/0.75 → 0.85/1.15 → …) with decaying amplitude and a slight skew, poked again every 2s.',
    css: `
.S .t{font-size:20cqw;color:#fff;-webkit-text-stroke:.5cqw #111;paint-order:stroke fill;animation:K_j 2s infinite;text-shadow:0 1cqw 0 #111}
@keyframes K_j{0%,60%,100%{transform:none}8%{transform:scale(1.25,.75)}16%{transform:scale(.85,1.15) skewX(-4deg)}24%{transform:scale(1.1,.9) skewX(3deg)}32%{transform:scale(.95,1.05)}40%{transform:scale(1.03,.97)}50%{transform:none}}`,
    html: (w) => `<div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'tracking-breathe',
    cat: 'kinetic',
    zh: '字距伸展',
    en: 'Tracking Expand',
    desc: '字距慢慢拉開，像在深呼吸',
    tags: ['極簡', '高級感'],
    tone: 'ink',
    sample: ['RESET'],
    hint: '英文效果最佳',
    motion: '細體文字的字距從緊密（-0.05em）緩緩展開到很寬（0.8em），同時透明度由 0 到 1、再收回並淡出，節奏緩慢優雅，像品牌形象片的片頭。',
    motionEn: 'Light-weight text slowly expands its tracking from tight (-0.05em) to very wide (0.8em) while fading from 0 to 1, then contracts and fades out; slow and elegant like a brand film opener.',
    css: `
.S .t{font-size:9cqw;font-weight:200;animation:K_t 5s cubic-bezier(.4,0,.2,1) infinite;white-space:nowrap}
@keyframes K_t{0%{letter-spacing:-.05em;opacity:0}45%{letter-spacing:.8em;opacity:1}75%{letter-spacing:.8em;opacity:1}100%{letter-spacing:1.2em;opacity:0}}`,
    html: (w) => `<div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'scatter-gather',
    cat: 'kinetic',
    zh: '散開聚合',
    en: 'Scatter & Gather',
    desc: '字從四面八方飛回來組好',
    tags: ['集合', '團隊'],
    tone: 'ink',
    sample: ['團結力量大'],
    hint: '3–8 字',
    motion: '每個字從畫面四周的隨機位置、隨機旋轉角度與模糊狀態，同時飛向中央排成一行（帶緩出），停留後再炸開回到隨機位置，循環。',
    motionEn: 'Each character flies from a random off-center position, random rotation and blur into a single centered line (ease-out); after a hold they explode back out to random positions, looping.',
    css: `
.S .t{font-size:10cqw;display:flex}
.S .c{animation:K_s 4s cubic-bezier(.2,.8,.2,1) infinite both}
.S .c:nth-child(odd){color:var(--ac)}
@keyframes K_s{0%,8%{transform:translate(var(--rx),var(--ry)) rotate(var(--rr));filter:blur(.6cqw);opacity:0}40%,75%{transform:none;filter:none;opacity:1}100%{transform:translate(calc(var(--rx)*-1),calc(var(--ry)*-1)) rotate(var(--rr));opacity:0}}`,
    html: (w) => `<div class="t">${charsWithRandom(w[0])}</div>`,
  },
  {
    id: 'domino',
    cat: 'kinetic',
    zh: '骨牌倒下',
    en: 'Domino Fall',
    desc: '字像骨牌一樣依序往後倒',
    tags: ['連鎖', '轉場'],
    tone: 'paper',
    sample: ['連鎖反應'],
    hint: '3–6 字',
    motion: '每個字以底部為軸往後（沿 X 軸）3D 倒下 90 度，從第一個字開始依序觸發，像骨牌連鎖；全倒後再依序站起來。',
    motionEn: 'Each character falls backward 90 degrees around its base (X axis, 3D), triggered in sequence from the first like toppling dominoes; once all are down they stand back up in order.',
    css: `
.S{perspective:60cqw}
.S .t{font-size:13cqw;display:flex;gap:.5cqw}
.S .c{transform-origin:50% 100%;animation:K_d 4s cubic-bezier(.6,0,.4,1) infinite;animation-delay:calc(var(--i)*.15s);background:var(--ac);color:#111;padding:0 1.2cqw;border-radius:.8cqw}
@keyframes K_d{0%,15%{transform:none}35%,60%{transform:rotateX(-88deg)}80%,100%{transform:none}}`,
    html: (w) => `<div class="t">${chars(w[0])}</div>`,
  },
  {
    id: 'heartbeat',
    cat: 'kinetic',
    zh: '心跳',
    en: 'Heartbeat',
    desc: '撲通撲通，跳兩下停一下',
    tags: ['心動', '告白'],
    tone: 'accent',
    sample: ['心動'],
    hint: '1–3 字',
    motion: '文字像心跳一樣「撲通、撲通」快速放大兩次（1.2 倍、1.12 倍）後休息，背後同步擴散一圈淡淡的光環，節奏約每 1.3 秒一次。',
    motionEn: 'The text beats like a heart, two quick swells (1.2x then 1.12x) followed by a rest, with a faint ring rippling out behind it in sync, about every 1.3s.',
    css: `
.S .ring{position:absolute;width:30cqw;height:30cqw;border-radius:50%;border:.6cqw solid #fff;animation:K_r 1.3s ease-out infinite}
.S .t{font-size:18cqw;color:#fff;animation:K_h 1.3s ease-in-out infinite}
@keyframes K_h{0%,40%,100%{transform:none}10%{transform:scale(1.2)}20%{transform:scale(1)}30%{transform:scale(1.12)}}
@keyframes K_r{0%{transform:scale(.6);opacity:.7}100%{transform:scale(2.2);opacity:0}}`,
    html: (w) => `<div class="ring"></div><div class="t">${esc(w[0])}</div>`,
  },
];
