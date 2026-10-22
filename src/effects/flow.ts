import type { Fx } from '../types';
import { esc, pick, rep } from '../util';

const loop = (t: string, n: number, sep = ' • ') => rep(n, () => `${esc(t)}${sep}`);

export const flow: Fx[] = [
  {
    id: 'huge-scroll',
    cat: 'flow',
    zh: '巨字滑過',
    en: 'Huge Text Scroll',
    desc: '超大字一快一慢橫越畫面',
    tags: ['背景', '遠景'],
    tone: 'ink',
    sample: ['台北夜行'],
    hint: '2–6 字',
    motion: '畫面中央一行超大字（高度約佔畫面 60%）由右往左慢速無縫滾動，下方一行小字以 3 倍速度同方向滾動，用「•」分隔重複；兩行速度差製造景深。',
    motionEn: 'A single line of oversized text (about 60% of frame height) scrolls slowly right-to-left in a seamless loop, while a small repeating line below, separated by bullets, scrolls 3x faster in the same direction, creating depth from the speed difference.',
    css: `
.S{place-items:stretch;align-content:center;gap:calc(var(--u)*2)}
.S .r{display:flex;white-space:nowrap;width:max-content;animation:K_m 14s linear infinite}
.S .r span{padding-right:.3em}
.S .big{font-size:calc(var(--u)*24)}
.S .sm{font-size:calc(var(--u)*4.4);color:var(--ac);animation-duration:5s}
@keyframes K_m{to{transform:translateX(-50%)}}`,
    html: (w) =>
      `<div class="r big"><span>${esc(w[0])}</span><span>${esc(w[0])}</span><span>${esc(w[0])}</span><span>${esc(w[0])}</span></div><div class="r sm">${loop(w[0], 16)}</div>`,
  },
  {
    id: 'vertical-flow',
    cat: 'flow',
    zh: '直書逆走',
    en: 'Vertical Typography',
    desc: '直排文字往反方向流',
    tags: ['東方', '靜與動'],
    tone: 'accent',
    sample: ['靜寂', '疾走'],
    hint: '2 個詞，各 2–4 字',
    motion: '五欄直排文字（writing-mode: vertical-rl）並排，奇數欄向上、偶數欄向下無縫滾動，大字欄用粗明體、窄欄用小字黑體，形成東方報紙版面的節奏。',
    motionEn: 'Five columns of vertical CJK text (writing-mode vertical-rl) side by side; odd columns scroll up and even columns scroll down seamlessly; wide columns use a heavy serif, narrow ones a small sans, evoking an East Asian newspaper rhythm.',
    css: `
.S{display:flex;justify-content:center;gap:calc(var(--u)*3);align-items:flex-start}
.S .col{writing-mode:vertical-rl;white-space:nowrap;animation:K_up 8s linear infinite;font-family:var(--serif)}
.S .col:nth-child(2n){animation-name:K_dn;font-family:var(--sans);font-size:calc(var(--u)*4.5)!important;opacity:.85}
.S .col span{padding-bottom:.5em}
@keyframes K_up{from{transform:translateY(0)}to{transform:translateY(-50%)}}
@keyframes K_dn{from{transform:translateY(-50%)}to{transform:translateY(0)}}`,
    html: (w) => {
      const [a, b] = pick(w, 2, ['靜寂', '疾走']);
      return rep(5, (i) => {
        const t = i % 2 ? b : a;
        return `<div class="col" style="font-size:calc(var(--u)*${[11, 0, 9, 0, 11][i] || 5})">${rep(8, () => `<span>${esc(t)}</span>`)}</div>`;
      });
    },
  },
  {
    id: 'repeat-wave',
    cat: 'flow',
    zh: '重複波浪',
    en: 'Repeating Text',
    desc: '同一個詞排滿，波浪式變色',
    tags: ['背景', '圖騰'],
    tone: 'paper',
    sample: ['流行'],
    hint: '2–3 字',
    motion: '同一個詞以網格排滿整個畫面，顏色從淡灰到主色再回淡灰，延遲依「列 + 欄」計算，形成一道斜向的色彩波浪掃過畫面，循環。',
    motionEn: 'The same word tiles the whole frame in a grid; each tile cycles from pale grey to the accent color and back, delayed by row + column, so a diagonal color wave sweeps across the frame, looping.',
    css: `
.S{grid-template-columns:repeat(7,auto);place-content:center;gap:calc(var(--u)*.6) calc(var(--u)*1.6)}
.S span{font-size:calc(var(--u)*5.6);color:var(--mu);animation:K_w 2.4s ease-in-out infinite;animation-delay:calc((var(--r) + var(--c))*.12s)}
@keyframes K_w{0%,60%,100%{color:color-mix(in srgb,var(--fg) 14%,transparent);transform:none}25%{color:var(--ac);transform:translateY(-12%)}}`,
    html: (w) => rep(42, (i) => `<span style="--r:${Math.floor(i / 7)};--c:${i % 7}">${esc(w[0])}</span>`),
  },
  {
    id: 'diagonal-bands',
    cat: 'flow',
    zh: '斜線帶',
    en: 'Diagonal Text Bands',
    desc: '斜斜的帶子，文字反向跑',
    tags: ['轉場', '俏皮'],
    tone: 'ink',
    sample: ['天亮以前'],
    hint: '2–6 字',
    motion: '兩條寬色帶以 ±8 度斜角交叉橫越畫面，一條主色底黑字向左跑、一條白底黑字向右跑，文字用「•」分隔無縫重複。',
    motionEn: 'Two wide bands cross the frame at ±8 degrees; one accent-colored band scrolls left, one white band scrolls right, each filled with bullet-separated repeating text in a seamless loop.',
    css: `
.S .band{position:absolute;left:-10%;width:120%;padding:calc(var(--u)*1.2) 0;overflow:hidden;font-size:calc(var(--u)*6.4);color:#111}
.S .a{background:var(--ac);transform:rotate(-8deg);top:28%}
.S .b{background:#fff;transform:rotate(7deg);top:52%}
.S .r{display:flex;white-space:nowrap;width:max-content;animation:K_l 9s linear infinite}
.S .b .r{animation-direction:reverse}
@keyframes K_l{to{transform:translateX(-50%)}}`,
    html: (w) => `<div class="band a"><div class="r">${loop(w[0], 14)}</div></div><div class="band b"><div class="r">${loop(w[0], 14)}</div></div>`,
  },
  {
    id: 'ribbon',
    cat: 'flow',
    zh: '緞帶',
    en: 'Text Ribbon',
    desc: '文字沿著波浪線流動',
    tags: ['裝飾', '配樂感'],
    tone: 'ink',
    sample: ['跟著節奏走'],
    hint: '3–8 字',
    motion: '一條 S 形波浪曲線橫越畫面，文字沿曲線排列（SVG textPath）並持續往前流動，曲線本身是半透明主色粗帶，文字為白色。',
    motionEn: 'An S-shaped wave curve crosses the frame; text follows the curve via SVG textPath and continuously flows along it; the curve is a thick semi-transparent accent ribbon with white text on top.',
    css: `
.S svg{width:100%;height:100%}
.S .rb{fill:none;stroke:var(--ac);stroke-width:96;opacity:.9;stroke-linecap:round}
.S text{font-size:58px;font-weight:900;fill:#111;dominant-baseline:central}`,
    html: (w) =>
      `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><path id="rbp" class="rb" d="M-200 620 C 200 300, 500 300, 800 450 S 1400 650, 1800 280"/><text><textPath href="#rbp" startOffset="0">${loop(w[0], 12, '　•　')}<animate attributeName="startOffset" from="0" to="-900" dur="8s" repeatCount="indefinite"/></textPath></text></svg>`,
  },
  {
    id: 'marquee-stack',
    cat: 'flow',
    zh: '跑馬燈',
    en: 'Marquee',
    desc: '字體、速度都不同的帶子疊在一起',
    tags: ['公告', '街頭'],
    tone: 'accent',
    sample: ['限時開賣', '新品上市', '預購中', '最後一天'],
    hint: '2–4 個短詞',
    motion: '四條橫向跑馬燈上下堆疊佈滿畫面，每條使用不同字重（細、粗、明體、等寬）、不同速度與方向，交錯黑底與主色底，像街頭海報的節奏感。',
    motionEn: 'Four horizontal marquees stacked to fill the frame, each with a different typeface weight (light, black, serif, mono), different speed and direction, alternating dark and accent backgrounds, like a street poster.',
    css: `
.S{grid-template-rows:repeat(4,1fr);place-items:stretch}
.S .row{display:flex;align-items:center;overflow:hidden;font-size:calc(var(--u)*7.4)}
.S .row:nth-child(2n){background:#111;color:var(--bg)}
.S .row:nth-child(2){font-family:var(--serif)}.S .row:nth-child(3){font-weight:300}.S .row:nth-child(4){font-family:var(--mono);font-size:calc(var(--u)*6)}
.S .r{display:flex;white-space:nowrap;width:max-content;animation:K_l var(--d) linear infinite var(--dir)}
@keyframes K_l{to{transform:translateX(-50%)}}`,
    html: (w) =>
      pick(w, 4, ['限時開賣', '新品上市', '預購中', '最後一天'])
        .map(
          (t, i) =>
            `<div class="row"><div class="r" style="--d:${[10, 7, 13, 8][i]}s;--dir:${i % 2 ? 'reverse' : 'normal'}">${loop(t, 12)}</div></div>`,
        )
        .join(''),
  },
  {
    id: 'parallax-columns',
    cat: 'flow',
    zh: '直書三層',
    en: 'Parallax Columns',
    desc: '三層直排文字一起流動',
    tags: ['景深', '東方'],
    tone: 'paper',
    sample: ['夜雨街燈'],
    hint: '3–5 字',
    motion: '三層直排文字欄：最遠層字小、淡、慢；中間層中等；最前層字最大、最黑、最快，全部往上流動，形成視差景深。',
    motionEn: 'Three layers of vertical text columns: the far layer is small, faint and slow; the middle layer medium; the front layer largest, darkest and fastest; all flow upward, creating parallax depth.',
    css: `
.S .layer{position:absolute;inset:0;display:flex;justify-content:space-around;align-items:flex-start}
.S .col{writing-mode:vertical-rl;white-space:nowrap;font-family:var(--serif);animation:K_up var(--d) linear infinite}
.S .l1 .col{font-size:calc(var(--u)*3.2);opacity:.18;--d:16s}
.S .l2 .col{font-size:calc(var(--u)*5.5);opacity:.4;--d:10s}
.S .l3 .col{font-size:calc(var(--u)*10);--d:6s}
.S .l3{justify-content:center;gap:calc(var(--u)*12)}
@keyframes K_up{to{transform:translateY(-50%)}}`,
    html: (w) => {
      const col = (n: number) => `<div class="col">${rep(n, () => esc(w[0]) + '　')}</div>`;
      return `<div class="layer l1">${rep(12, () => col(10))}</div><div class="layer l2">${rep(6, () => col(8))}</div><div class="layer l3">${rep(2, () => col(6))}</div>`;
    },
  },
  {
    id: 'tape-cross',
    cat: 'flow',
    zh: '封鎖膠帶',
    en: 'Tape Cross',
    desc: '寫著字的膠帶交叉成 X',
    tags: ['警告', '街頭'],
    tone: 'ink',
    sample: ['禁止進入'],
    hint: '2–6 字',
    motion: '兩條黃黑斜紋邊的警示膠帶以 X 形交叉貼滿畫面（約 ±20 度），膠帶中央的黑字持續反向滾動，開場時膠帶從畫面外「啪」一聲拉進來。',
    motionEn: 'Two caution tapes with black-and-yellow striped edges cross in an X (about ±20 degrees); the black text on each scrolls in opposite directions; at the start each tape snaps in from off-screen.',
    css: `
.S .tape{position:absolute;left:-20%;width:140%;top:44%;background:var(--ac);color:#111;font-size:calc(var(--u)*5.4);padding:calc(var(--u)*1.4) 0;overflow:hidden;border-block:calc(var(--u)*.9) solid transparent;border-image:repeating-linear-gradient(45deg,#111 0 12px,var(--ac) 12px 24px) 10;box-shadow:0 10px 30px #0006}
.S .t1{transform:rotate(-18deg);animation:K_in1 6s cubic-bezier(.2,.9,.2,1) infinite both}
.S .t2{transform:rotate(16deg);animation:K_in2 6s cubic-bezier(.2,.9,.2,1) .25s infinite both}
.S .r{display:flex;white-space:nowrap;width:max-content;animation:K_l 8s linear infinite}
.S .t2 .r{animation-direction:reverse}
@keyframes K_l{to{transform:translateX(-50%)}}
@keyframes K_in1{0%{transform:rotate(-18deg) translateX(-110%)}12%,100%{transform:rotate(-18deg)}}
@keyframes K_in2{0%{transform:rotate(16deg) translateX(110%)}12%,100%{transform:rotate(16deg)}}`,
    html: (w) => `<div class="tape t1"><div class="r">${loop(w[0], 14)}</div></div><div class="tape t2"><div class="r">${loop(w[0], 14)}</div></div>`,
  },
  {
    id: 'credits-roll',
    cat: 'flow',
    zh: '片尾名單',
    en: 'Credits Roll',
    desc: '名單由下往上緩緩捲動',
    tags: ['片尾', '感謝'],
    tone: 'ink',
    sample: ['企劃｜KC', '攝影｜小明', '剪輯｜阿華', '音樂｜Lofi Lab', '特別感謝｜每一位觀眾'],
    hint: '用「職稱｜名字」分多行',
    motion: '置中的兩欄名單（左欄職稱靠右、右欄名字靠左，中間以細線分隔）由畫面下方緩慢往上捲動，上下邊緣有漸層淡出遮罩。',
    motionEn: 'A centered two-column credit list (role right-aligned on the left, name left-aligned on the right, thin divider) scrolls slowly upward from the bottom, with gradient fade masks at the top and bottom edges.',
    css: `
.S{-webkit-mask:linear-gradient(transparent,#000 20%,#000 80%,transparent);mask:linear-gradient(transparent,#000 20%,#000 80%,transparent)}
.S .list{display:grid;grid-template-columns:1fr auto 1fr;gap:calc(var(--u)*1.8) calc(var(--u)*2);font-size:calc(var(--u)*3.6);animation:K_up 9s linear infinite;align-self:start}
.S .k{text-align:right;font-weight:400;opacity:.6}.S .bar{width:1px;background:var(--ac)}
@keyframes K_up{from{transform:translateY(60cqh)}to{transform:translateY(-100%)}}`,
    html: (w) =>
      `<div class="list">${w
        .map((l) => {
          const [k, v] = l.includes('｜') ? l.split('｜') : ['', l];
          return `<div class="k">${esc(k)}</div><div class="bar"></div><div>${esc(v ?? '')}</div>`;
        })
        .join('')}</div>`,
  },
  {
    id: 'circle-badge',
    cat: 'flow',
    zh: '環形旋轉',
    en: 'Rotating Badge',
    desc: '文字繞成圓圈慢慢轉，中間放主題',
    tags: ['Logo', '徽章'],
    tone: 'paper',
    sample: ['光寓科技 • LEICHTHUB • ', '光'],
    hint: '外圈一句、中心一字',
    motion: '一句文字沿圓周排列成徽章外圈並持續順時針旋轉（10 秒一圈），中心放一個大字或符號，外圈與中心之間有一條主色細圓線。',
    motionEn: 'A phrase wraps around a circle as a badge rim and rotates clockwise continuously (10s per turn); a large glyph sits in the center, with a thin accent circle between rim and center.',
    css: `
.S svg{width:min(80cqw,80cqh);height:min(80cqw,80cqh);animation:K_r 10s linear infinite}
.S text{font-size:44px;font-weight:900;fill:var(--fg);letter-spacing:6px}
.S .ring{fill:none;stroke:var(--ac);stroke-width:4}
.S .mid{position:absolute;font-size:min(22cqw,22cqh);color:var(--ac)}
@keyframes K_r{to{transform:rotate(1turn)}}`,
    html: (w) =>
      `<svg viewBox="0 0 500 500"><path id="cbp" d="M250 250 m-190 0 a190 190 0 1 1 380 0 a190 190 0 1 1 -380 0" fill="none"/><circle class="ring" cx="250" cy="250" r="140"/><text><textPath href="#cbp" textLength="1180">${esc(w[0])}${esc(w[0])}</textPath></text></svg><div class="mid">${esc(w[1] ?? '光')}</div>`,
  },
];
