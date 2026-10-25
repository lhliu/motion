// 新聞讀報：報紙頭版、剪報螢光筆、網路新聞卡、逐句讀報。
// words 共用格式：媒體 / 日期 / 標題 / 內文（一行一句）。用【】框住的字會被螢光筆標出。
// 內容必須是真實新聞並保留媒體與日期；範例一律用「某某日報（示意）」，不冒用真實媒體版面。
import type { Fx } from '../types';
import { esc } from '../util';

const base = { added: '2026-10-25', preferredRatio: '9:16' as const, cat: 'news' as const };

const SAMPLE = ['某某日報（示意）', '2026-10-25', '央行再出手【第二戶貸款成數降至五成】', '央行理監事會今日決議調整選擇性信用管制。', '【第二戶購屋貸款成數上限降為五成】，自下月起實施。', '業者預估短期交易量將持續降溫。'];
const HINT = '媒體 / 日期 / 標題 / 內文一行一句；用【】框住要螢光筆標出的字。請用真實新聞並保留媒體與日期';

/** 依共用格式拆出媒體、日期、標題、內文 */
const news = (w: string[]) => {
  const v = w.length >= 3 ? w : SAMPLE;
  return { media: v[0] ?? '', date: v[1] ?? '', title: v[2] ?? '', body: v.slice(3, 9) };
};
/** 跳脫後把【】換成標記（第 k 個標記帶 --k，方便依序畫螢光筆） */
let markN = 0;
const mark = (s: string) => esc(s).replace(/【(.+?)】/g, (_, x) => `<mark style="--k:${markN++}">${x}</mark>`);
const marked = (s: string) => {
  markN = 0;
  return mark(s);
};

/** 螢光筆：背景漸層由左往右刷過（不用 clip-path，換行也連貫） */
const HL = `.S mark{color:inherit;background:linear-gradient(transparent 55%,color-mix(in srgb,var(--ac) 70%,#ffe14d) 55%,color-mix(in srgb,var(--ac) 70%,#ffe14d) 92%,transparent 92%) no-repeat 0 0/0% 100%;-webkit-box-decoration-break:clone;box-decoration-break:clone}`;

export const newsFx: Fx[] = [
  {
    ...base,
    id: 'news-paper',
    no: 335,
    zh: '報紙頭版',
    en: 'Newspaper Front Page',
    desc: '一份報紙轉著落到畫面上，鏡頭推近頭條，螢光筆劃出重點',
    tags: ['新聞', '讀報', '政策', '開場'],
    tone: 'paper',
    sample: SAMPLE,
    hint: HINT,
    motion: '一張米白報紙從畫面下方旋轉著落進來（帶輕微傾斜），報頭是媒體名稱的大字明體，下方日期列與分欄細線；頭條大標逐字浮現，副標（內文第一句）與灰色文字欄位隨後出現；接著鏡頭往頭條推近、報紙擺正，【】框住的字被主色螢光筆由左往右刷過，停留。版面為通用報紙樣式，不仿任何真實媒體。',
    motionEn: 'An off-white newspaper spins up from the bottom and lands slightly tilted: masthead in a large serif with the outlet name, a dateline and thin column rules; the headline fades in word by word, then a deck line (first body sentence) and grey text columns appear; the camera pushes in on the headline while the paper straightens, and the bracketed words get an accent highlighter swipe left to right, then hold. Generic layout, imitating no real outlet.',
    css: `
.S{background:color-mix(in srgb,var(--fg) 82%,var(--bg))}
.S .pp{position:absolute;left:50%;top:50%;width:86cqw;height:118cqw;margin:-59cqw 0 0 -43cqw;background:#f4efe3;color:#1b1b1b;padding:5cqw 5cqw 0;box-shadow:0 2cqw 6cqw #0004;transform-origin:50% 22%;animation:K_in 7s cubic-bezier(.2,.8,.2,1) infinite both}
/* 橫式：維持直式比例整體縮小 */
@container (min-aspect-ratio:1/1){.S .pp{zoom:.42;top:auto;left:auto;margin:0;position:relative}}
.S .mh{font-family:var(--serif);font-weight:900;font-size:min(10cqw,calc(70cqw / var(--n)));white-space:nowrap;text-align:center;letter-spacing:.06em;line-height:1.1;border-bottom:.8cqw double #1b1b1b;padding-bottom:1.2cqw}
.S .dl{display:flex;justify-content:space-between;font-size:2.8cqw;font-weight:600;padding:1cqw 0;border-bottom:.3cqw solid #1b1b1b;margin-bottom:3cqw}
.S h2{font-family:var(--serif);font-weight:900;font-size:8.4cqw;line-height:1.22;margin:0 0 2.4cqw}
.S h2 .w{display:inline;opacity:0;animation:K_w 7s ease infinite both;animation-delay:calc(.5s + var(--i)*.06s)}
.S .dk{font-size:4cqw;font-weight:700;line-height:1.45;color:#333;margin-bottom:3cqw;opacity:0;animation:K_dk 7s ease infinite both}
.S .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:3cqw;opacity:0;animation:K_dk 7s ease infinite both}
.S .cols i{display:block;height:1.3cqw;background:#c9c2b2;margin-bottom:1.6cqw;border-radius:.3cqw}
.S .cols i:nth-child(4n){width:70%}
${HL}
.S mark{animation:K_hl 7s cubic-bezier(.6,0,.2,1) infinite both;animation-delay:calc(var(--k)*.35s)}
@keyframes K_in{0%{transform:translateY(90cqh) rotate(-14deg) scale(.9);opacity:1}16%{transform:translateY(0) rotate(-3deg) scale(1);opacity:1}34%{transform:rotate(-3deg) scale(1);opacity:1}50%,92%{transform:rotate(0) scale(1.28);opacity:1}100%{transform:rotate(0) scale(1.28);opacity:0}}
@keyframes K_w{0%,8%{opacity:0}14%,94%{opacity:1}100%{opacity:0}}
@keyframes K_dk{0%,20%{opacity:0}28%,94%{opacity:1}100%{opacity:0}}
@keyframes K_hl{0%,54%{background-size:0% 100%}64%,94%{background-size:100% 100%}100%{background-size:100% 100%}}`,
    html: (w) => {
      const n = news(w);
      markN = 0;
      // 標題拆成詞逐一浮現；【】內整段當一個詞，螢光筆才不會斷掉
      const parts = n.title.split(/(【.+?】)/).flatMap((p) => (p.startsWith('【') ? [p] : [...p]));
      const words = parts.map((p, i) => `<span class="w" style="--i:${i}">${mark(p)}</span>`).join('');
      const deck = n.body[0] ? `<div class="dk">${mark(n.body[0])}</div>` : '';
      return `<div class="pp"><div class="mh" style="--n:${Math.max(4, [...n.media].length)}">${esc(n.media)}</div><div class="dl"><span>${esc(n.date)}</span><span>第 A1 版</span></div><h2>${words}</h2>${deck}<div class="cols">${'<div>' + '<i></i>'.repeat(9) + '</div>'}${'<div>' + '<i></i>'.repeat(9) + '</div>'}${'<div>' + '<i></i>'.repeat(9) + '</div>'}</div></div>`;
    },
  },
  {
    ...base,
    id: 'news-clip',
    no: 336,
    zh: '剪報螢光筆',
    en: 'Clipping Highlighter',
    desc: '一段剪下來的報導逐行出現，螢光筆劃過重點句，其他字變淡',
    tags: ['新聞', '讀報', '重點', '數據'],
    tone: 'ink',
    sample: SAMPLE,
    hint: HINT,
    motion: '深色底上一張撕邊的米白剪報（上下緣鋸齒）微微傾斜滑入，頂端小字是媒體與日期，粗體標題下接內文逐行淡入；接著【】框住的字由左往右刷上主色螢光筆，同時沒有標記的文字降到四成透明度，讓重點跳出來；最後剪報左下角貼上主色「資料來源」小標籤，停留。',
    motionEn: 'A torn-edged off-white clipping (zigzag top and bottom) slides in slightly tilted over a dark backdrop; a small media/date line at the top, a bold headline, then body lines fade in one by one; the bracketed words get an accent highlighter swipe while unmarked text drops to 40% opacity so the key point pops; finally a small accent "Source" tag sticks to the lower left, and it holds.',
    css: `
.S .cl{position:relative;width:84cqw;background:#f6f1e4;color:#1b1b1b;padding:6cqw 6cqw 7cqw;transform:rotate(-1.5deg);animation:K_in 7s cubic-bezier(.2,.8,.2,1) infinite both;
  -webkit-mask:conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/3cqw 51% repeat-x,conic-gradient(from 135deg at top,#0000,#000 1deg 89deg,#0000 90deg) top/3cqw 51% repeat-x}
@container (min-aspect-ratio:1/1){.S .cl{zoom:.42}}
.S .md{font-size:3cqw;font-weight:700;color:#6b6b6b;letter-spacing:.04em}
.S h3{font-family:var(--serif);font-weight:900;font-size:6.6cqw;line-height:1.3;margin:1.6cqw 0 3cqw}
.S p{font-size:4.6cqw;font-weight:600;line-height:1.75;margin:0 0 1.2cqw;opacity:0;animation:K_p 7s ease infinite both;animation-delay:calc(.6s + var(--i)*.28s)}
.S .dim{animation:K_p 7s ease infinite both,K_dim 7s ease infinite both;animation-delay:calc(.6s + var(--i)*.28s),0s}
${HL}
.S mark{animation:K_hl 7s cubic-bezier(.6,0,.2,1) infinite both;animation-delay:calc(var(--k)*.35s)}
.S .tg{position:absolute;left:-2cqw;bottom:1.5cqw;background:var(--ac);color:var(--bg);font-size:3cqw;font-weight:800;padding:1cqw 2.4cqw;transform:rotate(-4deg);animation:K_tg 7s cubic-bezier(.3,1.5,.5,1) infinite both}
@keyframes K_in{0%{transform:translateY(40cqh) rotate(6deg);opacity:0}14%,94%{transform:rotate(-1.5deg);opacity:1}100%{transform:rotate(-1.5deg);opacity:0}}
@keyframes K_p{0%,6%{opacity:0;transform:translateY(1.5cqw)}12%,94%{opacity:1;transform:none}100%{opacity:0}}
@keyframes K_dim{0%,52%{color:#1b1b1b}60%,100%{color:#1b1b1b66}}
@keyframes K_hl{0%,50%{background-size:0% 100%}60%,100%{background-size:100% 100%}}
@keyframes K_tg{0%,66%{transform:rotate(-4deg) scale(0)}74%,94%{transform:rotate(-4deg) scale(1)}100%{transform:rotate(-4deg) scale(1);opacity:0}}`,
    html: (w) => {
      const n = news(w);
      markN = 0;
      const ps = n.body.map((s, i) => `<p class="${/【.+?】/.test(s) ? '' : 'dim'}" style="--i:${i}">${mark(s)}</p>`).join('');
      return `<div class="cl"><div class="md">${esc(n.media)}・${esc(n.date)}</div><h3>${mark(n.title)}</h3>${ps}<div class="tg">資料來源：${esc(n.media)}</div></div>`;
    },
  },
  {
    ...base,
    id: 'news-web',
    no: 337,
    zh: '網路新聞卡',
    en: 'Web News Card',
    desc: '仿網路新聞頁的白卡彈上來，重點句畫底線並被主色框起來',
    tags: ['新聞', '讀報', '網路', '截圖'],
    tone: 'ink',
    sample: SAMPLE,
    hint: HINT,
    motion: '一張白色網頁卡片從下方彈上來：頂端是媒體名稱與分類小標籤，接著粗體標題、日期列、灰色示意圖片區塊與內文；【】框住的字畫上主色底線並被主色細框圈起，其餘文字不變；停留。介面為通用新聞頁樣式，不仿任何真實網站。',
    motionEn: 'A white web-article card springs up from below: outlet name and a small category tag on top, then a bold headline, dateline, a grey placeholder image block and body text; bracketed words get an accent underline and a thin accent box drawn around them; then it holds. Generic news-page styling, imitating no real site.',
    css: `
.S .cd{width:86cqw;max-height:128cqw;background:#fff;color:#1d1d1f;border-radius:3cqw;overflow:hidden;display:flex;flex-direction:column;animation:K_in 7s cubic-bezier(.2,1.2,.3,1) infinite both}
@container (min-aspect-ratio:1/1){.S .cd{zoom:.42}}
.S .sc{padding:0 5cqw 4cqw}
.S .bar{position:relative;z-index:1;flex:none;background:#fff;display:flex;align-items:center;gap:2cqw;padding:3.4cqw 5cqw;border-bottom:.3cqw solid #e5e5e5}
.S .bar b{font-size:4cqw;font-weight:900}
.S .bar i{font-style:normal;font-size:2.8cqw;font-weight:700;background:var(--ac);color:var(--bg);padding:.4cqw 1.6cqw;border-radius:1cqw}
.S h3{font-size:6.6cqw;font-weight:900;line-height:1.32;margin:4cqw 0 2cqw}
.S .dt{font-size:3cqw;color:#8a8a8a;font-weight:600;margin-bottom:3cqw}
.S .im{height:24cqw;background:linear-gradient(135deg,#eceae4,#d9d6cd);border-radius:1.6cqw;margin-bottom:3.4cqw;display:grid;place-items:center;color:#9a968c;font-size:3cqw;font-weight:700}
.S p{font-size:4.4cqw;font-weight:500;line-height:1.75;margin:0 0 2cqw;color:#333}
.S mark{color:inherit;background:none;font-weight:800;box-shadow:inset 0 -.9cqw 0 color-mix(in srgb,var(--ac) 0%,transparent);outline:.45cqw solid transparent;outline-offset:.4cqw;border-radius:.6cqw;animation:K_mk 7s ease infinite both;animation-delay:calc(var(--k)*.3s)}
@keyframes K_in{0%{transform:translateY(80cqh);opacity:1}14%,94%{transform:none;opacity:1}100%{transform:none;opacity:0}}
@keyframes K_mk{0%,56%{box-shadow:inset 0 -.9cqw 0 transparent;outline-color:transparent}66%,100%{box-shadow:inset 0 -.9cqw 0 var(--ac);outline-color:var(--ac)}}`,
    html: (w) => {
      const n = news(w);
      markN = 0;
      return `<div class="cd"><div class="bar"><b>${esc(n.media)}</b><i>新聞</i></div><div class="sc"><h3>${mark(n.title)}</h3><div class="dt">${esc(n.date)}</div><div class="im">新聞圖片</div>${n.body.map((s) => `<p>${mark(s)}</p>`).join('')}</div></div>`;
    },
  },
  {
    ...base,
    id: 'news-read',
    no: 338,
    zh: '逐句讀報',
    en: 'Sentence-by-Sentence Read',
    desc: '新聞內文一句一句亮起，像主持人在讀；讀過的變淡，重點字上螢光筆',
    tags: ['新聞', '讀報', '字幕', '口播'],
    tone: 'paper',
    sample: SAMPLE,
    hint: HINT,
    motion: '米白底，上方小字是媒體與日期、粗體標題；內文句子全部先以淡灰色排好，接著一句一句依序亮成深色並在句首出現主色小三角指示（像主持人讀到哪），讀過的句子退回半透明；【】框住的字在讀到時刷上主色螢光筆並保留；最後一句讀完停留，指示停在最後一句。',
    motionEn: 'On an off-white background: a small media/date line and a bold headline; body sentences are laid out in pale grey, then light up dark one at a time with a small accent triangle marking the current sentence (like a presenter reading), already-read sentences fading back to half opacity; bracketed words get a lasting accent highlighter as they are read; after the last sentence it holds with the marker on it.',
    css: `
.S{place-items:center start}
.S .g{width:84cqw;margin-left:8cqw}
@container (min-aspect-ratio:1/1){.S{place-items:center}.S .g{margin-left:0;zoom:.46}}
.S .md{font-size:3.2cqw;font-weight:700;color:var(--mu);letter-spacing:.04em}
.S h3{font-family:var(--serif);font-weight:900;font-size:7.2cqw;line-height:1.3;margin:1.6cqw 0 5cqw}
.S p{position:relative;font-size:5.2cqw;font-weight:700;line-height:1.6;margin:0 0 3cqw;color:color-mix(in srgb,var(--fg) 22%,transparent);animation:K_rd 8s ease infinite both;animation-delay:calc(var(--i)*var(--per))}
.S p::before{content:'';position:absolute;left:-4.4cqw;top:2.4cqw;border:1.4cqw solid transparent;border-left:2cqw solid var(--ac);opacity:0;animation:K_ar 8s ease infinite both;animation-delay:inherit}
.S p.last{animation-name:K_rdl}
${HL}
.S mark{animation:K_hl 8s cubic-bezier(.6,0,.2,1) infinite both;animation-delay:calc(var(--i)*var(--per) + .35s)}
@keyframes K_rd{0%,6%{color:color-mix(in srgb,var(--fg) 22%,transparent)}10%,22%{color:var(--fg)}28%,94%{color:color-mix(in srgb,var(--fg) 55%,transparent)}100%{color:color-mix(in srgb,var(--fg) 22%,transparent)}}
@keyframes K_rdl{0%,6%{color:color-mix(in srgb,var(--fg) 22%,transparent)}10%,94%{color:var(--fg)}100%{color:color-mix(in srgb,var(--fg) 22%,transparent)}}
@keyframes K_ar{0%,6%{opacity:0}10%,22%{opacity:1}28%,100%{opacity:0}}

@keyframes K_hl{0%,6%{background-size:0% 100%}14%,94%{background-size:100% 100%}100%{background-size:0% 100%}}`,
    html: (w) => {
      const n = news(w);
      markN = 0;
      const body = n.body.length ? n.body : [n.title];
      // 每句間隔依句數平均分配在 8 秒循環的前 70%
      const per = Math.min(1.6, 5.6 / body.length);
      return `<div class="g" style="--per:${per.toFixed(2)}s"><div class="md">${esc(n.media)}・${esc(n.date)}</div><h3>${marked(n.title).replace(/<mark[^>]*>|<\/mark>/g, '')}</h3>${body.map((s, i) => `<p class="${i === body.length - 1 ? 'last' : ''}" style="--i:${i}">${mark(s).replace(/<mark style="/g, `<mark style="--i:${i};`)}</p>`).join('')}</div>`;
    },
  },
];
