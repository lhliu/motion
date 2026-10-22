import type { Fx } from '../types';
import { esc, pick, rand, rep } from '../util';

export const caption: Fx[] = [
  {
    id: 'lower-third',
    no: 28,
    cat: 'caption',
    zh: '名牌條',
    en: 'Lower Third',
    desc: '左下角滑出人名與職稱',
    tags: ['訪談', '人名'],
    tone: 'ink',
    sample: ['持家男子 KC', '房地產 YouTuber'],
    hint: '名字 / 職稱',
    motion: '畫面左下角：先有一條主色垂直短條彈出，接著白底名字條從短條後方向右展開、名字由下滑入，下方較細的深色職稱條延遲 0.15 秒展開；停留 2 秒後依反序收回。',
    motionEn: 'Bottom-left: an accent vertical tab pops in, then a white name bar expands rightward from behind it with the name sliding up, and a slimmer dark title bar below expands 0.15s later; after a 2s hold everything retracts in reverse order.',
    css: `
.S{place-items:end start;padding:0 0 10cqh 6cqw;background:linear-gradient(135deg,#3a3f47,#1b1d21)}
.S .lt{display:grid;grid-template-columns:auto 1fr;gap:0}
.S .tab{grid-row:1/3;width:1.2cqw;background:var(--ac);animation:K_tab 4.4s cubic-bezier(.7,0,.2,1) infinite;transform-origin:50% 100%}
.S .nm,.S .ti{overflow:hidden;transform-origin:0 50%;animation:K_bar 4.4s cubic-bezier(.7,0,.2,1) infinite both}
.S .nm{background:#fff;color:#111;font-size:4.6cqw;padding:1cqw 3cqw;animation-delay:.1s}
.S .ti{background:#111;color:#fff;font-size:2.6cqw;font-weight:500;padding:.8cqw 3cqw;justify-self:start;animation-delay:.25s}
.S .nm span,.S .ti span{display:block;animation:K_txt 4.4s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:inherit}
@keyframes K_tab{0%{transform:scaleY(0)}8%,88%{transform:none}96%,100%{transform:scaleY(0)}}
@keyframes K_bar{0%,6%{transform:scaleX(0)}18%,82%{transform:none}92%,100%{transform:scaleX(0)}}
@keyframes K_txt{0%,14%{transform:translateY(110%)}26%,80%{transform:none}88%,100%{transform:translateY(-110%)}}`,
    html: (w) => {
      const [n, t] = pick(w, 2, ['持家男子 KC', '房地產 YouTuber']);
      return `<div class="lt"><div class="tab"></div><div class="nm"><span>${esc(n)}</span></div><div class="ti"><span>${esc(t)}</span></div></div>`;
    },
  },
  {
    id: 'news-ticker',
    no: 32,
    cat: 'caption',
    zh: '新聞跑馬',
    en: 'News Ticker',
    desc: '底部紅色標籤加上捲動訊息',
    tags: ['新聞', '即時'],
    tone: 'ink',
    sample: ['LIVE', '本週新案開箱｜通勤實測｜讀者 QA 募集中'],
    hint: '標籤 / 訊息（可用｜分隔）',
    motion: '畫面底部一條深色資訊條，左側有主色「LIVE」標籤與閃爍紅點，右側訊息文字由右向左等速捲動，訊息之間用小菱形分隔；資訊條開場由下往上推入。',
    motionEn: 'A dark ticker bar at the bottom: an accent "LIVE" tag with a blinking red dot on the left, messages scrolling right-to-left at constant speed on the right separated by small diamonds; the bar pushes up from below at the start.',
    css: `
.S{place-items:end stretch;background:linear-gradient(160deg,#2c3440,#14181d)}
.S .bar{display:flex;height:9cqw;background:#0d0d0d;align-items:stretch;animation:K_in 8s cubic-bezier(.2,.8,.2,1) infinite}
.S .tag{background:var(--ac);color:#111;font-size:3.6cqw;display:flex;align-items:center;gap:1cqw;padding:0 2.4cqw;z-index:1}
.S .tag i{width:1.4cqw;height:1.4cqw;border-radius:50%;background:#e11;animation:K_b 1s steps(1) infinite}
.S .msg{flex:1;overflow:hidden;display:flex;align-items:center;color:#fff;font-size:3.6cqw;font-weight:500}
.S .r{display:flex;white-space:nowrap;width:max-content;animation:K_m 12s linear infinite}
.S .r em{font-style:normal;color:var(--ac);padding:0 2cqw}
@keyframes K_m{to{transform:translateX(-50%)}}
@keyframes K_b{50%{opacity:0}}
@keyframes K_in{0%{transform:translateY(100%)}6%,100%{transform:none}}`,
    html: (w) => {
      const [tag, msg] = pick(w, 2, ['LIVE', '本週新案開箱｜通勤實測｜讀者 QA 募集中']);
      const items = msg.split('｜').map((m) => `${esc(m)}<em>◆</em>`).join('');
      return `<div class="bar"><div class="tag"><i></i>${esc(tag)}</div><div class="msg"><div class="r">${rep(6, () => items)}</div></div></div>`;
    },
  },
  {
    id: 'chat-bubbles',
    no: 33,
    cat: 'caption',
    zh: '對話泡泡',
    en: 'Chat Bubbles',
    desc: '訊息一則則彈出來，像聊天室',
    tags: ['對話', '故事'],
    tone: 'paper',
    sample: ['這間多少？', '你猜猜看', '不要賣關子啦😂', '影片最後公布'],
    hint: '2–5 則，左右交替',
    motion: '聊天介面：訊息泡泡左右交替出現，每則先顯示「輸入中…」三點跳動 0.4 秒，再以彈性放大（從 0.6 到 1）彈出；右側泡泡為主色、左側為白色，舊訊息往上推。',
    motionEn: 'A chat interface: bubbles alternate left and right; each first shows a bouncing three-dot typing indicator for 0.4s, then pops in with a springy scale from 0.6 to 1; right bubbles in the accent color, left ones white, older messages pushing up.',
    css: `
.S{place-items:center}
.S .chat{display:flex;flex-direction:column;gap:min(1.6cqw,2.8cqh);width:min(62cqw,100cqh)}
.S .bb{max-width:75%;padding:min(1.4cqw,2.5cqh) min(2.6cqw,4.6cqh);border-radius:min(3cqw,5cqh);font-size:min(3.6cqw,6.4cqh);font-weight:500;background:#fff;color:#111;box-shadow:0 .5cqmin 1.5cqmin #0001;transform-origin:0 100%;animation:K_p 6s cubic-bezier(.3,1.6,.5,1) infinite both;animation-delay:calc(var(--i)*.9s)}
.S .bb:nth-child(2n){align-self:flex-end;background:var(--ac);color:#111;transform-origin:100% 100%}
@keyframes K_p{0%{transform:scale(.6);opacity:0}6%,90%{transform:none;opacity:1}98%,100%{opacity:0}}`,
    html: (w) => `<div class="chat">${w.slice(0, 5).map((t, i) => `<div class="bb" style="--i:${i}">${esc(t)}</div>`).join('')}</div>`,
  },
  {
    id: 'karaoke',
    no: 34,
    cat: 'caption',
    zh: '卡拉 OK 字幕',
    en: 'Karaoke Fill',
    desc: '顏色跟著節奏從左到右填滿',
    tags: ['歌詞', '朗讀'],
    tone: 'ink',
    sample: ['我們一起走過的路'],
    hint: '一句歌詞',
    motion: '白色描邊的字幕，主色以水平擦除方式從左到右依序填滿每個字（像 KTV 字幕跟唱），填滿處字體輕微放大；整句唱完停留後換行重來。',
    motionEn: 'White outlined subtitles; the accent color wipes left to right through each character in turn (like KTV sing-along lyrics), with filled characters slightly enlarged; after the full line it holds, then restarts.',
    css: `
.S{place-items:end center;padding-bottom:12cqh;background:linear-gradient(#1a1a2e,#16213e)}
.S .t{position:relative;font-size:6.4cqw;-webkit-text-stroke:.5cqw #000;paint-order:stroke fill}
.S .b{color:#fff}
.S .f{position:absolute;inset:0;color:var(--ac);clip-path:inset(0 calc(100% - var(--kp)) 0 0);animation:K_k 5s linear infinite}
@property --kp{syntax:'<percentage>';inherits:false;initial-value:0%}
@keyframes K_k{0%,5%{--kp:0%}75%,95%{--kp:100%}100%{--kp:0%}}`,
    html: (w) => `<div class="t"><div class="b">${esc(w[0])}</div><div class="f">${esc(w[0])}</div></div>`,
  },
  {
    id: 'danmaku',
    no: 35,
    cat: 'caption',
    zh: '彈幕',
    en: 'Danmaku Comments',
    desc: '滿滿留言從右飛到左',
    tags: ['熱鬧', '互動'],
    tone: 'ink',
    sample: ['太神啦', '前排', '+1', '笑死', '求地址', '這價格合理嗎', '已訂閱', '666'],
    hint: '多則短留言',
    motion: '多則留言以不同大小、不同速度、不同列位，從畫面右側飛到左側（像 B 站彈幕），部分留言用主色或帶黑色描邊，畫面中央有被彈幕覆蓋的主畫面感。',
    motionEn: 'Many short comments fly from right to left across different rows at varied sizes and speeds (like Bilibili danmaku), some in the accent color or with black outlines, overlaying the main scene.',
    css: `
.S{background:linear-gradient(135deg,#334,#112)}
.S .d{position:absolute;left:100%;white-space:nowrap;font-weight:700;color:#fff;-webkit-text-stroke:.25cqw #000;paint-order:stroke fill;animation:K_d linear infinite}
.S .d.h{color:var(--ac)}
@keyframes K_d{to{transform:translateX(calc(-100cqw - 100%))}}`,
    html: (w) =>
      rep(18, (i) => {
        const t = w[i % w.length];
        return `<span class="d${rand(i) > 0.7 ? ' h' : ''}" style="top:${5 + (i % 9) * 10.5}%;font-size:${3 + rand(i + 3) * 2.5}cqw;animation-duration:${5 + rand(i + 7) * 5}s;animation-delay:${-rand(i + 11) * 10}s">${esc(t)}</span>`;
      }),
  },
  {
    id: 'callout',
    no: 29,
    cat: 'caption',
    zh: '重點圈選',
    en: 'Callout Circle',
    desc: '手繪圓圈圈住重點，箭頭拉出說明',
    tags: ['解說', '重點'],
    tone: 'paper',
    sample: ['這個數字很重要', '關鍵在這裡'],
    hint: '主句 / 註解',
    motion: '句子中的重點字被一圈手繪感的主色橢圓圈起來（SVG 描邊動畫 0.6 秒），接著一支彎曲箭頭從圓圈畫出，箭頭末端彈出註解文字；停留後全部淡出。',
    motionEn: 'A hand-drawn accent ellipse is traced around the key phrase (0.6s SVG stroke animation), then a curved arrow draws out from the circle and a note pops in at its tip; after a hold everything fades out.',
    css: `
.S .box{position:relative}
.S .t{font-size:7cqw;color:#111;position:relative;z-index:1}
.S svg{position:absolute;left:-6%;top:-35%;width:112%;height:170%;overflow:visible}
.S path{fill:none;stroke:var(--ac);stroke-width:5;stroke-linecap:round;stroke-dasharray:1200;stroke-dashoffset:1200;animation:K_d 4.5s ease-out infinite}
.S path.ar{stroke-dasharray:300;stroke-dashoffset:300;animation-name:K_a}
.S .note{position:absolute;right:-4%;top:-58%;font-size:3.8cqw;color:var(--ac);font-weight:700;animation:K_n 4.5s cubic-bezier(.3,1.6,.5,1) infinite both;transform-origin:0 100%}
@keyframes K_d{0%,5%{stroke-dashoffset:1200;opacity:1}22%,85%{stroke-dashoffset:0;opacity:1}100%{opacity:0;stroke-dashoffset:0}}
@keyframes K_a{0%,22%{stroke-dashoffset:300;opacity:1}34%,85%{stroke-dashoffset:0;opacity:1}100%{opacity:0;stroke-dashoffset:0}}
@keyframes K_n{0%,32%{transform:scale(0);opacity:0}40%,85%{transform:none;opacity:1}100%{opacity:0}}`,
    html: (w) => {
      const [t, n] = pick(w, 2, ['這個數字很重要', '關鍵在這裡']);
      return `<div class="box"><div class="t">${esc(t)}</div><svg viewBox="0 0 400 170" preserveAspectRatio="none"><path d="M60 40 C 140 5, 330 10, 380 60 S 330 160, 180 150 S 10 120, 30 70 S 120 25, 200 28"/><path class="ar" d="M330 40 Q 370 0, 395 -20"/></svg><div class="note">${esc(n)}</div></div>`;
    },
  },
  {
    id: 'hashtag-pop',
    no: 36,
    cat: 'caption',
    zh: '標籤彈出',
    en: 'Tag Pop',
    desc: '一顆顆膠囊標籤彈出來',
    tags: ['關鍵字', '社群'],
    tone: 'accent',
    sample: ['#重劃區', '#捷運宅', '#首購', '#開箱', '#通勤'],
    hint: '3–6 個標籤',
    motion: '多個膠囊形標籤依序以彈性放大從 0 彈出（帶輕微旋轉），黑底白字與白底黑字交錯，排成自然換行的標籤雲；停留後依序縮小消失。',
    motionEn: 'Pill-shaped tags pop in one by one with a springy scale from 0 and a slight rotation, alternating black-on-white and white-on-black, flowing into a wrapped tag cloud; after a hold they shrink away in order.',
    css: `
.S .cloud{display:flex;flex-wrap:wrap;justify-content:center;gap:1.6cqw;width:76cqw}
.S .tg{font-size:4.6cqw;padding:1.2cqw 3cqw;border-radius:99px;background:#111;color:#fff;animation:K_p 4.4s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:calc(var(--i)*.12s);rotate:var(--r)}
.S .tg:nth-child(2n){background:#fff;color:#111}
@keyframes K_p{0%{transform:scale(0)}12%,80%{transform:none}92%,100%{transform:scale(0)}}`,
    html: (w) => `<div class="cloud">${w.slice(0, 7).map((t, i) => `<span class="tg" style="--i:${i};--r:${[-4, 3, -2, 5, -3, 2, -5][i]}deg">${esc(t)}</span>`).join('')}</div>`,
  },
  {
    id: 'shorts-caption',
    no: 26,
    cat: 'caption',
    zh: '短影音大字幕',
    en: 'Shorts Caption',
    desc: '一次一兩個詞，關鍵字變色跳動',
    tags: ['Shorts', 'Reels'],
    tone: 'ink',
    sample: ['這間', '房子', '最大的', '問題', '是'],
    hint: '把一句話拆成 3–6 段',
    motion: '直式短影音字幕：畫面中下方一次只出現一段 1–3 字的大字（粗黑體、黑色粗描邊、白字），每段以 110% 彈入；指定的關鍵段落改成主色並放大 120%，每段約 0.4 秒快速切換。',
    motionEn: 'Vertical short-form captions: one chunk of 1–3 words at a time in the lower middle (heavy sans, thick black outline, white fill), each popping in at 110%; key chunks switch to the accent color at 120%; about 0.4s per chunk.',
    css: `
.S{background:linear-gradient(#556,#223)}
.S .w{position:absolute;top:58%;font-size:9cqmin;color:#fff;-webkit-text-stroke:1.4cqmin #000;paint-order:stroke fill;visibility:hidden}
.S .w.on{visibility:visible;animation:K_b .3s cubic-bezier(.3,1.8,.5,1) both}
.S .w.k{color:var(--ac);font-size:11cqmin}
@keyframes K_b{0%{transform:scale(.6)}100%{transform:none}}`,
    html: (w) =>
      w
        .slice(0, 8)
        .map((t, i) => `<div class="w${i === Math.min(3, w.length - 1) ? ' k' : ''}">${esc(t)}</div>`)
        .join(''),
    run: (root) => {
      const els = Array.from(root.querySelectorAll('.w'));
      let i = 0;
      const tick = () => {
        els.forEach((e) => e.classList.remove('on'));
        if (i < els.length) els[i].classList.add('on');
        i = (i + 1) % (els.length + 2);
      };
      tick();
      const t = window.setInterval(tick, 450);
      return () => clearInterval(t);
    },
  },
  {
    id: 'location-pin',
    no: 27,
    cat: 'caption',
    zh: '地點標記',
    en: 'Location Pin',
    desc: '定位針掉下來，彈出地點名稱',
    tags: ['地點', '外景'],
    tone: 'paper',
    sample: ['捷運站出口', '步行 3 分鐘'],
    hint: '地點 / 補充說明',
    motion: '地圖網格背景上，一支主色定位針從上方落下、彈跳一次並在地面擴散一圈漣漪，接著右側展開白色資訊卡：大字地點名稱 + 小字補充說明；停留後收回。',
    motionEn: 'Over a faint map grid, an accent location pin drops from above, bounces once and sends out a ripple on the ground; a white info card then expands to its right with the place name in large type and a small note beneath; after a hold it retracts.',
    css: `
.S{background:linear-gradient(90deg,#0000000d 1px,transparent 1px) 0 0/6cqw 6cqw,linear-gradient(#0000000d 1px,transparent 1px) 0 0/6cqw 6cqw,var(--bg)}
.S .g{display:flex;align-items:center;gap:2cqw}
.S .pin{position:relative;width:8cqw;height:8cqw;animation:K_drop 4.6s cubic-bezier(.5,0,.5,1.4) infinite both}
.S .pin::before{content:'';position:absolute;inset:0;background:var(--ac);border-radius:50% 50% 50% 0;transform:rotate(-45deg)}
.S .pin::after{content:'';position:absolute;inset:2.6cqw;background:#fff;border-radius:50%}
.S .rip{position:absolute;left:50%;bottom:-2cqw;width:8cqw;height:2.4cqw;margin-left:-4cqw;border:.4cqw solid var(--ac);border-radius:50%;animation:K_rip 4.6s ease-out infinite}
.S .card{background:#fff;border-radius:1.4cqw;padding:2cqw 3cqw;box-shadow:0 1cqw 3cqw #0002;transform-origin:0 50%;animation:K_card 4.6s cubic-bezier(.2,.9,.2,1) infinite both}
.S .card b{display:block;font-size:5cqw;color:#111}.S .card small{font-size:2.8cqw;color:#666;font-weight:500}
@keyframes K_drop{0%{transform:translateY(-60cqh);opacity:0}5%{opacity:1}18%,85%{transform:none;opacity:1}95%,100%{transform:translateY(-4cqw);opacity:0}}
@keyframes K_rip{0%,17%{transform:scale(.2);opacity:0}20%{opacity:1}40%,100%{transform:scale(2.4);opacity:0}}
@keyframes K_card{0%,22%{transform:scaleX(0);opacity:0}34%,82%{transform:none;opacity:1}92%,100%{transform:scaleX(0);opacity:0}}`,
    html: (w) => {
      const [a, b] = pick(w, 2, ['捷運站出口', '步行 3 分鐘']);
      return `<div class="g"><div class="pin"><i class="rip"></i></div><div class="card"><b>${esc(a)}</b><small>${esc(b)}</small></div></div>`;
    },
  },
  {
    id: 'subscribe-cta',
    no: 31,
    cat: 'caption',
    zh: '訂閱提示',
    en: 'Subscribe CTA',
    desc: '訂閱按鈕被點下、小鈴鐺搖動',
    tags: ['YouTube', '片尾'],
    tone: 'ink',
    sample: ['訂閱', '開啟小鈴鐺'],
    hint: '按鈕文字 / 提示',
    motion: '畫面下方彈出白色膠囊按鈕「訂閱」，一個游標箭頭從右下滑入點擊，按鈕被按下後變成灰色「已訂閱」，旁邊的鈴鐺圖示左右搖晃並出現提示文字；停留後收回。',
    motionEn: 'A white pill "Subscribe" button pops up at the bottom; a cursor slides in from the bottom right and clicks it; the button turns grey "Subscribed" while a bell icon beside it swings and a hint label appears; after a hold it retracts.',
    css: `
.S .g{display:flex;align-items:center;gap:2cqw;animation:K_in 5s cubic-bezier(.3,1.5,.5,1) infinite both}
.S .btn{position:relative;font-size:6cqw;padding:1.8cqw 5cqw;border-radius:99px;background:var(--ac);color:#111}
.S .btn span{display:block;animation:K_txt 5s steps(1) infinite}
.S .btn::after{content:'已訂閱';position:absolute;inset:0;display:grid;place-items:center;border-radius:99px;background:#3a3a3a;color:#ccc;opacity:0;animation:K_on 5s steps(1) infinite}
.S .bell{font-size:7cqw;transform-origin:50% 10%;animation:K_bell 5s ease-in-out infinite}
.S .hint{font-size:4cqw;font-weight:500;opacity:0;animation:K_h 5s ease infinite}
.S .cur{position:absolute;left:50%;top:50%;width:5cqw;height:5cqw;animation:K_cur 5s cubic-bezier(.4,0,.2,1) infinite;filter:drop-shadow(0 .3cqw .3cqw #0008)}
@keyframes K_in{0%{transform:translateY(30cqh) scale(.6)}10%,88%{transform:none}100%{transform:translateY(30cqh)}}
@keyframes K_cur{0%,12%{transform:translate(30cqw,25cqh)}30%{transform:translate(-14cqw,0)}33%{transform:translate(-14cqw,0) scale(.8)}36%,60%{transform:translate(-14cqw,0)}75%,100%{transform:translate(30cqw,25cqh)}}
@keyframes K_on{0%,33%{opacity:0}34%,100%{opacity:1}}
@keyframes K_txt{0%,33%{opacity:1}34%,100%{opacity:0}}
@keyframes K_bell{0%,40%,70%,100%{transform:none}45%{transform:rotate(20deg)}50%{transform:rotate(-18deg)}55%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}}
@keyframes K_h{0%,42%{opacity:0;transform:translateX(-1cqw)}50%,85%{opacity:1;transform:none}95%,100%{opacity:0}}`,
    html: (w) => {
      const [b, h] = pick(w, 2, ['訂閱', '開啟小鈴鐺']);
      return `<div class="g"><div class="btn"><span>${esc(b)}</span></div><div class="bell">🔔</div><div class="hint">${esc(h)}</div></div><svg class="cur" viewBox="0 0 24 24"><path d="M4 2l16 10-7 1.5L9.5 21z" fill="#fff" stroke="#000" stroke-width="1.2"/></svg>`;
    },
  },
];

