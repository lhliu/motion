import type { Fx } from '../types';
import { esc, rep } from '../util';

export const style: Fx[] = [
  {
    id: 'outline-fill',
    no: 98,
    cat: 'style',
    zh: '空心字',
    en: 'Outline Text',
    desc: '空心字一行一行填上顏色',
    tags: ['質感', 'MV'],
    tone: 'ink',
    sample: ['疾風怒濤'],
    hint: '2–6 字',
    motion: '畫面排滿 5 行只有白色描邊的空心字（交錯縮排），每次有一行依序被實心填滿再退回空心，由上而下逐行進行，形成掃描般的節奏。',
    motionEn: 'Five rows of white outline-only text fill the frame with staggered indents; one row at a time fills solid and then returns to outline, moving top to bottom like a scanning rhythm.',
    css: `
.S{align-content:center;place-items:start center;gap:.5cqw}
.S .l{font-size:10cqw;white-space:nowrap;color:transparent;-webkit-text-stroke:.22cqw var(--fg);animation:K_f 3s steps(1) infinite;animation-delay:calc(var(--i)*.6s)}
.S .l:nth-child(2n){transform:translateX(-12cqw)}
@keyframes K_f{0%{color:var(--fg)}20%,100%{color:transparent}}`,
    html: (w) => rep(5, (i) => `<div class="l" style="--i:${i}">${esc(w[0])}　${esc(w[0])}　${esc(w[0])}</div>`),
  },
  {
    id: 'glitch-slices',
    no: 99,
    cat: 'style',
    zh: '故障切片',
    en: 'Glitch Slices',
    desc: '大字被切成好幾條錯開',
    tags: ['衝擊', 'MV'],
    tone: 'accent',
    sample: ['故障'],
    hint: '2–4 字',
    motion: '粗體大字被水平切成 6 條，每條在隨機時間點左右錯位 3–8%，並伴隨紅藍色版分離（RGB split）殘影，持續 0.2 秒的劇烈故障後回正、停 1 秒再發作。',
    motionEn: 'Big bold text is sliced horizontally into 6 strips; strips jump sideways 3–8% at random moments with a red/cyan RGB-split ghost; after 0.2s of violent glitching it snaps back, rests 1s, and glitches again.',
    css: `
.S .box{position:relative;font-size:20cqw;color:#fff}
.S .base{visibility:hidden}
.S .sl{position:absolute;inset:0;clip-path:inset(calc(var(--i)*16.66%) 0 calc(100% - (var(--i) + 1)*16.66%) 0);animation:K_g 1.6s steps(1) infinite;animation-delay:calc(var(--i)*-.13s)}
.S .sl::before,.S .sl::after{content:attr(data-t);position:absolute;inset:0;mix-blend-mode:multiply;opacity:0;animation:K_c 1.6s steps(1) infinite}
.S .sl::before{color:#ff2a55;transform:translateX(-2%)}.S .sl::after{color:#00d0ff;transform:translateX(2%)}
@keyframes K_g{0%,12%,100%{transform:none}2%{transform:translateX(calc(var(--d)*1%))}5%{transform:translateX(calc(var(--d)*-.6%))}8%{transform:translateX(calc(var(--d)*.4%))}}
@keyframes K_c{0%,12%,100%{opacity:0}2%,8%{opacity:.9}}`,
    html: (w) =>
      `<div class="box"><div class="base">${esc(w[0])}</div>${rep(6, (i) => `<div class="sl" data-t="${esc(w[0])}" style="--i:${i};--d:${[6, -8, 3, -5, 7, -3][i]}">${esc(w[0])}</div>`)}</div>`,
  },
  {
    id: 'pattern-mask',
    no: 100,
    cat: 'style',
    zh: '圖案遮罩',
    en: 'Text Mask Pattern',
    desc: '文字變成窗，條紋從裡面流過',
    tags: ['俏皮', '祭典'],
    tone: 'paper',
    sample: ['祭典'],
    hint: '2–3 字，越粗越好',
    motion: '超粗體文字當作遮罩（background-clip: text），文字內部填滿 45 度的主色與黑色斜條紋並持續流動；文字後方有一層偏移的黑色硬陰影增加份量。',
    motionEn: 'Ultra-bold text acts as a mask (background-clip: text) filled with flowing 45-degree stripes in the accent color and black; an offset hard black shadow sits behind the letters for weight.',
    css: `
.S .w{position:relative;font-size:22cqw}
.S .w::before{content:attr(data-t);position:absolute;inset:0;color:#111;transform:translate(1.2cqw,1.2cqw);z-index:-1}
.S .w span{background:repeating-linear-gradient(45deg,var(--ac) 0 1.6cqw,#111 1.6cqw 3.2cqw);background-size:4.525cqw 4.525cqw;-webkit-background-clip:text;background-clip:text;color:transparent;animation:K_m 1s linear infinite}
.S .w{isolation:isolate}
@keyframes K_m{to{background-position:4.525cqw 0}}`,
    html: (w) => `<div class="w" data-t="${esc(w[0])}"><span>${esc(w[0])}</span></div>`,
  },
  {
    id: 'long-shadow',
    no: 101,
    cat: 'style',
    zh: '長陰影',
    en: 'Long Shadow',
    desc: '長長的影子轉一圈',
    tags: ['扁平風'],
    tone: 'ink',
    sample: ['光與影'],
    hint: '2–4 字',
    motion: '白色粗體字後方拖著一條主色、長度約字高 60% 的扁平長陰影（40 層 text-shadow 疊出），陰影方向像日晷一樣繞著文字緩慢轉一圈。',
    motionEn: 'Bold white text casts a flat long shadow in the accent color, about 60% of the glyph height (40 stacked text-shadows); the shadow direction sweeps slowly around the text like a sundial.',
    css: '',
    html: (w) => `<div class="w">${esc(w[0])}</div>`,
  },
  {
    id: 'liquid-fill',
    no: 102,
    cat: 'style',
    zh: '液體填滿',
    en: 'Liquid Fill',
    desc: '空心字被液體慢慢裝滿',
    tags: ['清爽', 'MV'],
    tone: 'ink',
    sample: ['滿'],
    hint: '1–3 字',
    motion: '主色描邊的空心字，內部有帶波浪頂邊的主色液體由下而上慢慢灌滿，液面波浪持續左右流動；裝滿後停留，再瞬間排空重來。',
    motionEn: 'Outline text in the accent color slowly fills from bottom to top with liquid whose surface has a moving wave; once full it holds, then drains instantly and repeats.',
    css: `
.S .w{position:relative;font-size:26cqw}
.S .o{color:transparent;-webkit-text-stroke:.3cqw var(--ac)}
.S .f{position:absolute;inset:0;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 400' preserveAspectRatio='none'%3E%3Cpath d='M0 20 Q25 0 50 20 T100 20 T150 20 T200 20 V400 H0Z'/%3E%3C/svg%3E") 0 0/50% 100% repeat-x;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 400' preserveAspectRatio='none'%3E%3Cpath d='M0 20 Q25 0 50 20 T100 20 T150 20 T200 20 V400 H0Z'/%3E%3C/svg%3E") 0 0/50% 100% repeat-x;animation:K_w 1.2s linear infinite,K_l 5s ease-in-out infinite}
.S .f div{color:var(--ac);animation:K_li 5s ease-in-out infinite}
@keyframes K_w{to{-webkit-mask-position:100% 0;mask-position:100% 0}}
@keyframes K_l{0%{transform:translateY(100%)}80%,95%{transform:translateY(-6%)}100%{transform:translateY(100%)}}
@keyframes K_li{0%{transform:translateY(-100%)}80%,95%{transform:translateY(6%)}100%{transform:translateY(-100%)}}`,
    html: (w) => `<div class="w"><div class="o">${esc(w[0])}</div><div class="f"><div>${esc(w[0])}</div></div></div>`,
  },
  {
    id: 'highlighter',
    no: 30,
    cat: 'style',
    zh: '螢光筆',
    en: 'Highlight Text',
    desc: '螢光筆從字後面劃過',
    tags: ['強調', '解說'],
    tone: 'accent',
    sample: ['一句話的力量'],
    hint: '一句短句',
    motion: '白色卡片上的黑字，一道略為傾斜、邊緣不規則的半透明主色螢光筆筆劃從左到右劃過文字下半部（約 0.6 秒，緩出），停留後筆劃從右側收回。',
    motionEn: 'Black text on a white card; a slightly tilted, rough-edged, semi-transparent highlighter stroke in the accent color swipes left to right across the lower half of the text (about 0.6s, ease-out); after a hold it retracts to the right.',
    css: `
.S .card{background:#fff;padding:3cqw 5cqw;border-radius:1cqw;box-shadow:0 1cqw 3cqw #0002}
.S .t{position:relative;font-size:7.4cqw;color:#111;font-family:var(--serif)}
.S .t::before{content:'';position:absolute;left:-2%;right:-2%;bottom:2%;height:55%;background:var(--hl,#ffe14d);border-radius:.4cqw 1.2cqw .6cqw 1.4cqw;transform-origin:0 50%;transform:scaleX(0) skewX(-12deg) rotate(-1deg);animation:K_h 3.2s cubic-bezier(.3,.8,.3,1) infinite;z-index:0;opacity:.85}
.S .t span{position:relative;z-index:1}
@keyframes K_h{0%,10%{transform:scaleX(0) skewX(-12deg) rotate(-1deg);transform-origin:0 50%}30%,80%{transform:scaleX(1) skewX(-12deg) rotate(-1deg);transform-origin:0 50%}80.1%{transform-origin:100% 50%}95%,100%{transform:scaleX(0) skewX(-12deg) rotate(-1deg);transform-origin:100% 50%}}`,
    html: (w) => `<div class="card"><div class="t"><span>${esc(w[0])}</span></div></div>`,
  },
  {
    id: 'split-invert',
    no: 64,
    cat: 'style',
    zh: '雙色反轉',
    en: 'Split Invert',
    desc: '斜線分界，兩色互換',
    tags: ['切換', '標題'],
    tone: 'ink',
    sample: ['反轉'],
    hint: '2–4 字',
    motion: '畫面被一條斜線分成黑白兩半，文字在黑區是白色、在白區是黑色（完全反相）；分界斜線從左往右掃過整個畫面，讓文字顏色跟著翻轉，再掃回來。',
    motionEn: 'A diagonal line splits the frame into black and white halves; the text is white over black and black over white (perfect inversion); the diagonal sweeps across the frame flipping the text color as it passes, then sweeps back.',
    css: `
.S .lay{position:absolute;inset:0;display:grid;place-items:center;font-size:20cqw}
.S .b{background:#f4f1e8;color:#111;clip-path:polygon(var(--sip) 0,100% 0,100% 100%,calc(var(--sip) - 30%) 100%);animation:K_s 4s cubic-bezier(.7,0,.3,1) infinite alternate}
@property --sip{syntax:'<percentage>';inherits:false;initial-value:20%}
@keyframes K_s{0%,15%{--sip:15%}85%,100%{--sip:115%}}`,
    html: (w) => `<div class="lay">${esc(w[0])}</div><div class="lay b">${esc(w[0])}</div>`,
  },
  {
    id: 'text-echo',
    no: 103,
    cat: 'style',
    zh: '殘影',
    en: 'Text Echo',
    desc: '字後面拖著一串殘影',
    tags: ['漂浮', 'MV'],
    tone: 'ink',
    sample: ['殘影'],
    hint: '2–4 字',
    motion: '主字左右來回漂移，後方跟著 8 層主色殘影，越後面的殘影越淡、越模糊、延遲越久，像長時間曝光的拖尾；主字保持白色清晰。',
    motionEn: 'The main word drifts side to side trailed by 8 accent-colored echoes, each further one fainter, blurrier and more delayed, like a long-exposure trail; the main word stays crisp white.',
    css: `
.S .e{position:absolute;font-size:14cqw;color:var(--ac);opacity:calc(.8 - var(--k)*.09);filter:blur(calc(var(--k)*.12cqw));animation:K_d 3s ease-in-out infinite;animation-delay:calc(var(--k)*-.06s)}
.S .e.m{color:#fff;opacity:1;filter:none;z-index:9}
@keyframes K_d{0%,100%{transform:translateX(-18cqw)}50%{transform:translateX(18cqw)}}`,
    html: (w) => rep(9, (k) => `<div class="e${k === 0 ? ' m' : ''}" style="--k:${k}">${esc(w[0])}</div>`),
  },
  {
    id: 'offset-stroke',
    no: 104,
    cat: 'style',
    zh: '錯位描邊',
    en: 'Offset Outline',
    desc: '實心字和描邊字錯開又對齊',
    tags: ['潮流', '標題'],
    tone: 'paper',
    sample: ['街頭'],
    hint: '2–4 字',
    motion: '一層主色實心字、一層黑色描邊空心字疊在一起，兩層以相反方向畫小圓移動，時而錯開 2% 時而完全重合，像印刷套色不準的潮流海報。',
    motionEn: 'A solid accent-colored layer and a black outline-only layer are stacked; they move in small circles in opposite directions, drifting 2% apart and then aligning perfectly, like a misregistered streetwear print.',
    css: `
.S .w{position:absolute;font-size:22cqw}
.S .s{color:var(--ac);animation:K_a 2.4s linear infinite}
.S .o{color:transparent;-webkit-text-stroke:.3cqw #111;animation:K_a 2.4s linear infinite reverse}
@keyframes K_a{0%{transform:translate(1.2cqw,0)}25%{transform:translate(0,1.2cqw)}50%{transform:translate(-1.2cqw,0)}75%{transform:translate(0,-1.2cqw)}100%{transform:translate(1.2cqw,0)}}`,
    html: (w) => `<div class="w s">${esc(w[0])}</div><div class="w o">${esc(w[0])}</div>`,
  },
  {
    id: 'paper-cut',
    no: 105,
    cat: 'style',
    zh: '剪紙疊層',
    en: 'Paper Cut Layers',
    desc: '多層色紙疊出立體剪紙感',
    tags: ['溫暖', '手作'],
    tone: 'paper',
    sample: ['手作'],
    hint: '2–3 字',
    motion: '5 層不同深淺的主色文字疊成剪紙立體感，每層都有柔和投影，層層依序從下往上「啪」地升起（像紙片立起來），最上層為白色；停留後層層倒下。',
    motionEn: 'Five layers of the text in graded shades of the accent color stack into a papercraft effect, each with a soft drop shadow; layers pop up one after another like paper standing up, topped by white; after a hold they fold back down.',
    css: `
.S .w{position:absolute;font-size:22cqw;color:color-mix(in srgb,var(--ac) calc(100% - var(--k)*16%),#fff);filter:drop-shadow(0 .4cqw .5cqw #0003);transform:translate(calc(var(--k)*-.6cqw),calc(var(--k)*-.6cqw));animation:K_up 3.6s cubic-bezier(.3,1.5,.5,1) infinite both;animation-delay:calc(var(--k)*.12s);transform-origin:50% 100%}
.S .w:last-child{color:#fff}
@keyframes K_up{0%{transform:translate(0,0) scaleY(0);opacity:0}12%,80%{transform:translate(calc(var(--k)*-.6cqw),calc(var(--k)*-.6cqw));opacity:1}95%,100%{transform:translate(0,0) scaleY(0);opacity:0}}`,
    html: (w) => rep(5, (k) => `<div class="w" style="--k:${k}">${esc(w[0])}</div>`),
  },
];

// 長陰影：40 層 text-shadow，在 8 個方向之間補間
const ls = (deg: number) => {
  const r = (deg * Math.PI) / 180;
  return Array.from({ length: 40 }, (_, i) => `${(Math.cos(r) * (i + 1) * 0.015).toFixed(3)}em ${(Math.sin(r) * (i + 1) * 0.015).toFixed(3)}em 0 var(--ac)`).join(',');
};
const longShadow = style.find((f) => f.id === 'long-shadow')!;
longShadow.css = `
.S .w{font-size:16cqw;color:#fff;animation:K_s 8s linear infinite;position:relative}
@keyframes K_s{${[45, 90, 135, 180, 225, 270, 315, 360, 405].map((d, i) => `${(i * 12.5).toFixed(1)}%{text-shadow:${ls(d)}}`).join('')}}`;
