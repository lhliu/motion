import type { Fx } from '../types';
import { chars, esc, rep } from '../util';

export const light: Fx[] = [
  {
    id: 'neon-flicker',
    no: 106,
    cat: 'light',
    zh: '霓虹燈',
    en: 'Neon Flicker',
    desc: '霓虹燈管通電閃爍後點亮',
    tags: ['夜景', '酒吧'],
    tone: 'ink',
    sample: ['深夜營業'],
    hint: '2–6 字',
    motion: '文字是發光霓虹燈管（細描邊 + 多層同色外光暈），開場不規則閃爍 3–4 次後穩定點亮，其中一個字持續接觸不良偶爾熄滅；牆面有淡淡的反光。',
    motionEn: 'Text rendered as glowing neon tubes (thin stroke plus layered same-color glow); it flickers irregularly 3–4 times on power-up before staying lit, while one character keeps shorting out occasionally; a faint glow reflects on the wall.',
    css: `
.S{background:radial-gradient(ellipse at 50% 55%,color-mix(in srgb,var(--ac) 14%,var(--bg)),var(--bg) 60%)}
.S .t{font-size:11cqw;font-weight:400;color:#fff;font-family:var(--sans);letter-spacing:.05em;text-shadow:0 0 .5cqw #fff,0 0 1.5cqw var(--ac),0 0 3cqw var(--ac),0 0 6cqw var(--ac);animation:K_on 4s infinite}
.S .c:nth-child(2){animation:K_bad 3s steps(1) infinite}
@keyframes K_on{0%{opacity:.1}3%{opacity:1}5%{opacity:.2}8%{opacity:1}9%{opacity:.3}12%,100%{opacity:1}}
@keyframes K_bad{0%,40%,44%,48%,100%{opacity:1}42%,46%{opacity:.15}}`,
    html: (w) => `<div class="t">${chars(w[0])}</div>`,
  },
  {
    id: 'glow-pulse',
    no: 107,
    cat: 'light',
    zh: '光暈呼吸',
    en: 'Glow Pulse',
    desc: '文字像呼吸一樣發光',
    tags: ['療癒', '氛圍'],
    tone: 'ink',
    sample: ['慢慢來'],
    hint: '2–5 字',
    motion: '文字外圍的柔和光暈以 3 秒週期緩慢增強與減弱，像呼吸；同時字距輕微擴張收縮，背景有一個同步脈動的模糊光球。',
    motionEn: 'A soft glow around the text swells and fades on a slow 3s cycle like breathing; letter-spacing gently expands and contracts in sync, with a blurred orb of light pulsing behind.',
    css: `
.S .orb{position:absolute;width:50cqw;height:50cqw;border-radius:50%;background:var(--ac);filter:blur(10cqw);opacity:.25;animation:K_o 3s ease-in-out infinite}
.S .t{position:relative;font-size:12cqw;font-weight:700;animation:K_g 3s ease-in-out infinite}
@keyframes K_g{0%,100%{text-shadow:0 0 0 transparent;letter-spacing:0}50%{text-shadow:0 0 2cqw var(--ac),0 0 5cqw var(--ac);letter-spacing:.12em}}
@keyframes K_o{50%{transform:scale(1.3);opacity:.45}}`,
    html: (w) => `<div class="orb"></div><div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'shine-sweep',
    no: 19,
    cat: 'light',
    zh: '金屬掃光',
    en: 'Metal Shine',
    desc: '金屬字表面有一道光掃過',
    tags: ['質感', '頒獎'],
    tone: 'ink',
    sample: ['年度精選'],
    hint: '2–6 字',
    motion: '文字是拉絲金屬質感（上亮下暗的漸層），一道斜 20 度的白色亮光由左到右掃過字面（約 0.8 秒），每 2.5 秒一次；文字下方有細小倒影。',
    motionEn: 'Brushed-metal text (light-to-dark vertical gradient); a white highlight band tilted 20 degrees sweeps across the letters left to right (about 0.8s) every 2.5s; a small reflection sits below.',
    css: `
.S .t{font-size:13cqw;background:linear-gradient(105deg,transparent 40%,#fff 50%,transparent 60%) -200% 0/200% 100% no-repeat,linear-gradient(#fafafa,#a8a8a8 48%,#5a5a5a 52%,#d8d8d8);-webkit-background-clip:text;background-clip:text;color:transparent;animation:K_s 2.5s ease-in-out infinite;-webkit-box-reflect:below -2cqw linear-gradient(transparent 60%,#0004)}
@keyframes K_s{0%{background-position:-200% 0,0 0}35%,100%{background-position:200% 0,0 0}}`,
    html: (w) => `<div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'spotlight',
    no: 18,
    cat: 'light',
    zh: '聚光燈',
    en: 'Spotlight',
    desc: '黑暗中一束光照出文字',
    tags: ['揭曉', '舞台'],
    tone: 'ink',
    sample: ['今晚主角'],
    hint: '2–6 字',
    motion: '全黑畫面中，一個圓形聚光燈光圈在文字上方左右游移搜尋，只照亮光圈內的文字；最後光圈停在正中並放大，照亮全部文字。',
    motionEn: 'In a pitch-black frame, a circular spotlight wanders left and right searching across the text, illuminating only what is inside the beam; finally it settles in the center and widens to reveal the whole word.',
    css: `
.S .t{font-size:14cqw;color:#fff;-webkit-mask:radial-gradient(circle var(--spr) at var(--spx) 50%,#000 60%,transparent 100%);mask:radial-gradient(circle var(--spr) at var(--spx) 50%,#000 60%,transparent 100%);animation:K_l 5s ease-in-out infinite;padding:0 10cqw}
.S .halo{position:absolute;inset:0;background:radial-gradient(circle var(--spr) at var(--spx) 50%,color-mix(in srgb,var(--ac) 18%,transparent),transparent 100%);animation:K_l 5s ease-in-out infinite}
@property --spx{syntax:'<percentage>';inherits:false;initial-value:20%}
@property --spr{syntax:'<length>';inherits:false;initial-value:0px}
@keyframes K_l{0%{--spx:10%;--spr:12cqw}25%{--spx:80%;--spr:12cqw}45%{--spx:30%;--spr:12cqw}60%,90%{--spx:50%;--spr:60cqw}100%{--spx:10%;--spr:12cqw}}`,
    html: (w) => `<div class="halo"></div><div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'lightning',
    no: 83,
    cat: 'light',
    zh: '閃電',
    en: 'Lightning Flash',
    desc: '雷光一閃，照亮文字',
    tags: ['震撼', '預告'],
    tone: 'ink',
    sample: ['驚天'],
    hint: '2–4 字',
    motion: '暗色畫面中文字幾乎看不見，突然兩次白色閃光讓畫面曝白、文字以主色強烈發光並抖動，閃光後文字留下逐漸消退的餘光，間隔 2 秒再閃。',
    motionEn: 'The text is nearly invisible in the dark frame until two sudden white flashes blow out the screen; the text glows intensely in the accent color and jolts, leaving an afterglow that slowly fades; repeats every 2s.',
    css: `
.S{animation:K_bg 3s infinite}
.S .t{font-size:18cqw;color:var(--ac);animation:K_t 3s infinite}
@keyframes K_bg{0%,8%,12%,100%{background:var(--bg)}9%,11%{background:#fff}}
@keyframes K_t{0%,7%{opacity:.08;text-shadow:none;transform:none}9%{opacity:1;color:#111;transform:translate(-1%,1%)}11%{color:#111}13%{opacity:1;color:var(--ac);text-shadow:0 0 3cqw var(--ac),0 0 8cqw var(--ac);transform:translate(1%,-.5%)}16%{transform:none}70%,100%{opacity:.08;text-shadow:0 0 0 transparent}}`,
    html: (w) => `<div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'laser-scan',
    no: 108,
    cat: 'light',
    zh: '雷射掃描',
    en: 'Laser Scan',
    desc: '一道雷射光由上而下掃出文字',
    tags: ['科技', '揭露'],
    tone: 'ink',
    sample: ['掃描完成'],
    hint: '2–6 字',
    motion: '一條發光的主色水平雷射線由上往下掃過，掃過的區域出現文字（上方線框描邊、下方實心），雷射線經過處有光暈與細小火花；掃完停留後由下往上抹除。',
    motionEn: 'A glowing horizontal laser line in the accent color scans from top to bottom; the text appears wherever it has passed (wireframe outline first, then solid), with glow and tiny sparks at the line; after a hold it wipes back up.',
    css: `
.S .box{position:relative;font-size:13cqw}
.S .t{clip-path:inset(0 0 calc(100% - var(--lsy)) 0);animation:K_y 3.6s cubic-bezier(.5,0,.5,1) infinite}
.S .o{position:absolute;inset:0;color:transparent;-webkit-text-stroke:.15cqw var(--ac);clip-path:inset(0 0 calc(100% - var(--lsy) - 8%) 0);animation:K_y 3.6s cubic-bezier(.5,0,.5,1) infinite;opacity:.8}
.S .ln{position:absolute;left:-8%;right:-8%;height:.4cqw;top:var(--lsy);background:var(--ac);box-shadow:0 0 1cqw var(--ac),0 0 3cqw var(--ac),0 0 6cqw #fff;animation:K_y 3.6s cubic-bezier(.5,0,.5,1) infinite}
@property --lsy{syntax:'<percentage>';inherits:false;initial-value:0%}
@keyframes K_y{0%{--lsy:-5%}40%,70%{--lsy:105%}100%{--lsy:-5%}}`,
    html: (w) => `<div class="box"><div class="t">${esc(w[0])}</div><div class="o">${esc(w[0])}</div><div class="ln"></div></div>`,
  },
  {
    id: 'lens-flare',
    no: 16,
    cat: 'light',
    zh: '鏡頭光斑',
    en: 'Lens Flare',
    desc: '光斑橫越畫面，文字發亮',
    tags: ['電影感', '片頭'],
    tone: 'ink',
    sample: ['ORIGINAL'],
    hint: '英文或 2–6 字',
    motion: '電影片頭感：一道水平拉長的藍白色變形鏡頭光斑（anamorphic flare）從左到右橫掃，經過時文字由暗轉亮並短暫過曝，背後有幾顆半透明圓形光斑跟著移動。',
    motionEn: 'Cinematic title: a horizontally stretched blue-white anamorphic lens flare sweeps left to right; as it passes, the text brightens from dark and briefly overexposes, with a few translucent circular bokeh orbs trailing behind.',
    css: `
.S .t{font-size:11cqw;letter-spacing:.2em;color:#fff;animation:K_t 4s ease-in-out infinite;font-weight:300}
.S .fl{position:absolute;top:50%;left:0;width:60cqw;height:.5cqw;margin-top:-.25cqw;background:radial-gradient(closest-side,#fff,#8ad 30%,transparent);filter:blur(.2cqw);box-shadow:0 0 4cqw 1cqw #6af6;animation:K_f 4s ease-in-out infinite;mix-blend-mode:screen}
.S .bk{position:absolute;border-radius:50%;width:var(--s);height:var(--s);background:radial-gradient(circle,transparent 50%,color-mix(in srgb,var(--ac) 40%,transparent));top:var(--y);animation:K_b 4s ease-in-out infinite;mix-blend-mode:screen}
@keyframes K_f{0%{transform:translateX(-70cqw) scaleX(.5);opacity:0}20%{opacity:1}55%{transform:translateX(110cqw) scaleX(1.4);opacity:1}60%,100%{opacity:0;transform:translateX(110cqw)}}
@keyframes K_t{0%,15%{opacity:.15;text-shadow:none}35%{opacity:1;text-shadow:0 0 2cqw #fff,0 0 6cqw #8cf}55%,85%{opacity:1;text-shadow:0 0 1cqw #fff4}100%{opacity:.15}}
@keyframes K_b{0%{transform:translateX(90cqw);opacity:0}25%{opacity:.8}60%{transform:translateX(-30cqw);opacity:0}100%{opacity:0}}`,
    html: (w) =>
      `<div class="t">${esc(w[0])}</div><div class="fl"></div>${rep(3, (i) => `<i class="bk" style="--s:${[6, 10, 4][i]}cqw;--y:${[30, 55, 64][i]}%"></i>`)}`,
  },
  {
    id: 'sunrise',
    no: 109,
    cat: 'light',
    zh: '日出漸層',
    en: 'Sunrise Gradient',
    desc: '文字顏色像日出一樣慢慢變亮',
    tags: ['早晨', '希望'],
    tone: 'ink',
    sample: ['早安'],
    hint: '2–4 字',
    motion: '背景由深藍漸層慢慢轉為橘粉色天空，文字內部填色同步由暗紫→橘→金黃流動，地平線下方有一顆太陽緩緩升起並帶光暈，循環。',
    motionEn: 'The background slowly shifts from a deep-blue gradient to an orange-pink sky while the text fill flows from dark purple to orange to gold in sync; a sun rises from below the horizon with a soft halo, looping.',
    css: `
.S{background:linear-gradient(#0c1030,#2a1f5c 50%,#ff8a5b 80%,#ffd27a);background-size:100% 300%;animation:K_sky 6s ease-in-out infinite}
.S .sun{position:absolute;width:30cqw;height:30cqw;border-radius:50%;background:radial-gradient(#fff6c8,#ffb347 60%,transparent 70%);bottom:-34cqw;animation:K_sun 6s ease-in-out infinite;filter:blur(.3cqw)}
.S .t{position:relative;top:-8%;font-size:18cqw;filter:drop-shadow(0 .5cqw 1.5cqw #2a1f5c88);background:linear-gradient(#fff6e0,#ffd36b,#ff7a59);background-size:100% 300%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:K_sky 6s ease-in-out infinite reverse}
@keyframes K_sky{0%,100%{background-position:0 0}50%{background-position:0 100%}}
@keyframes K_sun{0%,100%{transform:translateY(0)}50%{transform:translateY(-22cqw)}}`,
    html: (w) => `<div class="sun"></div><div class="t">${esc(w[0])}</div>`,
  },
];
