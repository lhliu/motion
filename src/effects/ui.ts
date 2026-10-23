import type { Fx } from '../types';
import { esc, pick } from '../util';

// 元件：短影音常見的疊加介面——社群介面、開場收尾、房產資訊。介面皆為中性示意，不放真實品牌圖示
const base = { added: '2026-10-23', preferredRatio: '9:16' as const };

/** 打字迴圈：data-type 的字逐字出現，停一下後清空重來 */
const typeLoop: Fx['run'] = (root) => {
  const els = [...root.querySelectorAll<HTMLElement>('[data-type]')];
  const cyc = Number(root.querySelector<HTMLElement>('[data-cycle]')?.dataset.cycle || 5000);
  let alive = true;
  const timers: number[] = [];
  const go = () => {
    if (!alive) return;
    root.classList.remove('done');
    void root.offsetWidth;
    root.classList.add('play');
    els.forEach((el) => {
      const full = [...(el.dataset.type || '')];
      const at = Number(el.dataset.at || 400);
      const step = Number(el.dataset.step || 110);
      el.textContent = '';
      full.forEach((_, i) => timers.push(window.setTimeout(() => alive && (el.textContent = full.slice(0, i + 1).join('')), at + i * step)));
      timers.push(window.setTimeout(() => alive && root.classList.add('done'), at + full.length * step + 150));
    });
    timers.push(window.setTimeout(() => { root.classList.remove('play'); go(); }, cyc));
  };
  go();
  return () => { alive = false; timers.forEach(clearTimeout); };
};

export const ui: Fx[] = [
  /* ───────── 社群介面 ───────── */
  {
    ...base,
    id: 'ui-comment-reply',
    no: 263,
    cat: 'social',
    zh: '留言回覆卡',
    en: 'Comment Reply',
    desc: '「回覆 @某某 的留言」卡片彈出，用觀眾的問題當開場',
    tags: ['社群', '開場', '留言'],
    tone: 'ink',
    sample: ['小資族阿明', '這區通勤到台北真的方便嗎？'],
    hint: '留言者名稱 / 留言內容',
    motion: '畫面上方偏中央彈出一張白色圓角卡片（回彈），卡片頂端是一個主色圓形頭像與小字「回覆 @名稱 的留言」，下方是黑色粗體留言內容；卡片輕微傾斜 -2 度，左下角有一個小三角形像對話框尾巴；停留後縮小淡出。介面為中性示意，不使用任何平台的標誌。',
    motionEn: 'A white rounded card bounces in near the top center: an accent circle avatar with a small "Replying to @name" line on top and the comment in bold black below; the card tilts -2 degrees with a small tail at the bottom left like a speech bubble; after a hold it shrinks and fades out. Neutral mock interface, no platform logos.',
    css: `
.S .k{position:relative;width:min(84cqw,120cqh);background:#fff;color:#111;border-radius:3cqw;padding:3.6cqw 4.4cqw 4.4cqw;transform-origin:20% 100%;animation:K_in 5s cubic-bezier(.3,1.5,.5,1) infinite both}
.S .k::after{content:'';position:absolute;left:8cqw;bottom:-3cqw;border:1.6cqw solid transparent;border-top:1.8cqw solid #fff;border-left:1.6cqw solid #fff}
.S .h{display:flex;align-items:center;gap:2cqw;font-size:3.4cqw;font-weight:500;color:#555;margin-bottom:2.2cqw}
.S .av{width:6.4cqw;height:6.4cqw;border-radius:50%;background:var(--ac);display:grid;place-items:center;color:#fff;font-size:3.2cqw;font-weight:900;flex:none}
.S .h b{color:#111;font-weight:900}
.S .m{font-size:6.4cqw;line-height:1.3}
@keyframes K_in{0%{transform:scale(.4) rotate(-8deg);opacity:0}10%,86%{transform:rotate(-2deg);opacity:1}96%,100%{transform:scale(.8) rotate(-2deg);opacity:0}}`,
    html: (w) => {
      const [n, m] = pick(w, 2, ['小資族阿明', '這區通勤到台北真的方便嗎？']);
      return `<div class="k"><div class="h"><span class="av">${esc([...n][0] ?? '')}</span><span>回覆 <b>@${esc(n)}</b> 的留言</span></div><div class="m">${esc(m)}</div></div>`;
    },
  },
  {
    ...base,
    id: 'ui-notify',
    no: 264,
    cat: 'social',
    zh: '通知橫幅',
    en: 'Notification Banner',
    desc: '手機通知從上方滑下來、震一下，第二則疊在下面',
    tags: ['社群', '手機', '訊息'],
    tone: 'ink',
    sample: ['房仲小王', '有新物件，週末要不要來看？', '訊息'],
    hint: '寄件人 / 訊息內容 / App 名稱',
    motion: '畫面上方一張半透明白底圓角通知卡從上方滑下（回彈），左邊是主色圓角方形 App 圖示（App 名稱首字），右上「現在」小字；卡片到位後左右震動兩下；1 秒後第二張較小的通知（「還有 1 則訊息」）從後面疊出；停留後兩張一起往上收回。中性示意，不使用任何品牌圖示。',
    motionEn: 'A translucent white rounded notification card slides down from the top with a bounce: an accent rounded-square app icon with the app initial on the left, "now" in the top right; once in place it buzzes left and right twice; a second, smaller notification ("1 more message") peeks out from behind; after a hold both slide back up. Neutral mock, no brand icons.',
    css: `
.S{place-items:start center}
.S .wrap{position:relative;margin-top:8cqh;width:min(90cqw,130cqh)}
.S .n{position:relative;z-index:2;display:flex;gap:3cqw;align-items:center;background:color-mix(in srgb,#fff 92%,transparent);color:#111;border-radius:4cqw;padding:3cqw 3.6cqw;animation:K_in 5s cubic-bezier(.3,1.4,.5,1) infinite both}
.S .ic{width:11cqw;height:11cqw;border-radius:2.8cqw;background:var(--ac);color:#fff;display:grid;place-items:center;font-size:5.6cqw;flex:none}
.S .tx{flex:1;min-width:0}
.S .top{display:flex;justify-content:space-between;font-size:3cqw;color:#666;font-weight:500}
.S .who{font-size:5.2cqw;margin:.8cqw 0 .6cqw}
.S .msg{font-size:4.6cqw;font-weight:500;line-height:1.3;color:#222}
.S .n2{position:absolute;left:4%;right:4%;bottom:-3.4cqw;height:8cqw;border-radius:0 0 3.4cqw 3.4cqw;background:color-mix(in srgb,#fff 70%,transparent);color:#333;font-size:2.8cqw;font-weight:500;display:grid;place-items:end center;padding-bottom:1cqw;animation:K_n2 5s ease infinite both}
@keyframes K_in{0%{transform:translateY(-40cqh)}9%{transform:none}12%{transform:translateX(-1.4cqw)}14%{transform:translateX(1.4cqw)}16%{transform:translateX(-1cqw)}18%,86%{transform:none}96%,100%{transform:translateY(-40cqh)}}
@keyframes K_n2{0%,30%{transform:translateY(-6cqw);opacity:0}38%,86%{transform:none;opacity:1}96%,100%{transform:translateY(-40cqh);opacity:0}}`,
    html: (w) => {
      const [who, msg, app] = pick(w, 3, ['房仲小王', '有新物件，週末要不要來看？', '訊息']);
      return `<div class="wrap"><div class="n"><div class="ic">${esc([...app][0] ?? '')}</div><div class="tx"><div class="top"><span>${esc(app)}</span><span>現在</span></div><div class="who">${esc(who)}</div><div class="msg">${esc(msg)}</div></div></div><div class="n2">還有 1 則訊息</div></div>`;
    },
  },
  {
    ...base,
    id: 'ui-search',
    no: 265,
    cat: 'social',
    zh: '搜尋框打字',
    en: 'Search Typing',
    desc: '搜尋列逐字打出關鍵字，下面跳出建議清單',
    tags: ['社群', '開場', '問題'],
    tone: 'paper',
    sample: ['林口 重劃區 值得買嗎', '林口 重劃區 通勤', '林口 重劃區 房價', '林口 重劃區 生活機能'],
    hint: '關鍵字 / 建議 1 / 建議 2 / 建議 3',
    motion: '畫面中央一條白色膠囊搜尋列放大彈入，左邊放大鏡圖示，游標閃爍後關鍵字一個字一個字打出來；打完後下方展開白色建議清單，三列建議依序由上往下滑入，每列左邊小放大鏡、關鍵字部分加粗；最後第一列被點一下變成灰底。中性示意，不使用任何搜尋引擎標誌。',
    motionEn: 'A white pill search bar pops in at the center with a magnifier icon; after a blinking caret the keyword types out one character at a time; then a white suggestion list unfolds below with three rows sliding in top to bottom, each with a small magnifier and the matching part in bold; finally the first row is tapped and turns grey. Neutral mock, no search-engine logos.',
    css: `
.S .g{width:min(86cqw,130cqh);animation:K_in 5.6s cubic-bezier(.3,1.4,.5,1) infinite both}
.S .bar{display:flex;align-items:center;gap:2.6cqw;background:#fff;color:#111;border:.5cqw solid #111;border-radius:99px;padding:3cqw 4cqw;font-size:5cqw}
.S .bar svg{width:5.4cqw;height:5.4cqw;flex:none}
.S .q{white-space:nowrap;overflow:hidden}
.S .cur{width:.5cqw;height:5.6cqw;background:var(--ac);animation:K_b .8s steps(1) infinite}
.S .ls{margin-top:1.6cqw;background:#fff;color:#111;border:.5cqw solid #111;border-radius:3cqw;overflow:hidden;opacity:0}
.S.done .ls{opacity:1}
.S .ls div{display:flex;align-items:center;gap:2.4cqw;padding:2.4cqw 4cqw;font-size:4cqw;font-weight:500;color:#444;opacity:0;transform:translateY(-2cqw)}
.S .ls div b{color:#111}
.S .ls div svg{width:3.8cqw;height:3.8cqw;flex:none;opacity:.5}
.S.done .ls div{opacity:1;transform:none;transition:.3s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--i)*.15s)}
.S.done .ls div:first-child{animation:K_tap 5.6s steps(1) infinite}
@keyframes K_b{50%{opacity:0}}
@keyframes K_in{0%{transform:scale(.6);opacity:0}6%,92%{transform:none;opacity:1}100%{opacity:0}}
@keyframes K_tap{0%,40%{background:#fff}41%,100%{background:#e6e6e6}}`,
    html: (w) => {
      const [q, ...s] = pick(w, 4, ['林口 重劃區 值得買嗎', '林口 重劃區 通勤', '林口 重劃區 房價', '林口 重劃區 生活機能']);
      const mag = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></svg>';
      const stem = q.split(/\s+/).slice(0, -1).join(' ');
      const row = (t: string, i: number) => {
        const k = stem && t.startsWith(stem) ? `${esc(stem)}<b>${esc(t.slice(stem.length))}</b>` : `<b>${esc(t)}</b>`;
        return `<div style="--i:${i}">${mag}<span>${k}</span></div>`;
      };
      const n = [...q].length;
      return `<div class="g" data-cycle="5600"><div class="bar">${mag}<span class="q" data-type="${esc(q)}" data-at="500" data-step="${Math.round(Math.min(130, 1800 / Math.max(1, n)))}"></span><i class="cur"></i></div><div class="ls">${s.map(row).join('')}</div></div>`;
    },
    run: typeLoop,
  },
  {
    ...base,
    id: 'ui-hearts',
    no: 266,
    cat: 'social',
    zh: '愛心飄起',
    en: 'Floating Hearts',
    desc: '愛心按鈕被點一下，一串大小不一的愛心往上飄',
    tags: ['社群', '按讚', '情緒'],
    tone: 'ink',
    sample: ['喜歡就按個愛心'],
    hint: '提示文字',
    motion: '右下角一個主色圓形愛心按鈕，被點擊時縮小再彈大；接著十幾顆大小不一的主色與輔色愛心從按鈕往上飄，邊飄邊左右擺動並逐漸縮小消失；左下方一行提示文字滑入。愛心是硬邊向量形狀，不加光暈。',
    motionEn: 'An accent round heart button sits at the bottom right; it shrinks and bounces back as it is tapped; then a dozen hearts of different sizes in accent and secondary colors float up from it, swaying side to side and shrinking away; a hint line slides in at the bottom left. Hearts are hard-edged vector shapes with no glow.',
    css: `
.S .btn{position:absolute;right:8cqw;bottom:10cqh;width:15cqw;height:15cqw;border-radius:50%;background:var(--ac);display:grid;place-items:center;animation:K_p 4s cubic-bezier(.3,1.8,.5,1) infinite}
.S .btn svg{width:8cqw;height:8cqw}
.S .h{position:absolute;right:calc(8cqw + 7.5cqw - var(--s)/2);bottom:calc(10cqh + 7cqw);width:var(--s);height:var(--s);opacity:0;animation:K_f 4s cubic-bezier(.3,0,.6,1) infinite;animation-delay:var(--d)}
.S .h svg{width:100%;height:100%;display:block;animation:K_sw 1.2s ease-in-out infinite alternate;animation-delay:var(--d)}
.S .tip{position:absolute;left:7cqw;bottom:11cqh;font-size:5.4cqw;max-width:58cqw;line-height:1.25;animation:K_t 4s cubic-bezier(.2,.8,.2,1) infinite both}
@keyframes K_p{0%,10%,100%{transform:none}14%{transform:scale(.8)}22%{transform:scale(1.12)}30%{transform:none}}
@keyframes K_f{0%,18%{opacity:0;transform:none}22%{opacity:1}90%{opacity:0;transform:translate(var(--x),-60cqh) scale(.5)}100%{opacity:0}}
@keyframes K_sw{from{transform:translateX(-3cqw) rotate(-10deg)}to{transform:translateX(3cqw) rotate(10deg)}}
@keyframes K_t{0%,20%{transform:translateX(-80cqw)}30%,90%{transform:none}100%{transform:translateX(-80cqw)}}`,
    html: (w) => {
      const [t] = pick(w, 1, ['喜歡就按個愛心']);
      const heart = (c: string) => `<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" fill="${c}"/></svg>`;
      const hs = Array.from({ length: 14 }, (_, i) => {
        const s = 5 + ((i * 7) % 6), d = (i * 0.11).toFixed(2), x = ((i * 37) % 30) - 22;
        return `<i class="h" style="--s:${s}cqw;--d:${d}s;--x:${x}cqw">${heart(i % 3 ? 'var(--ac)' : 'var(--ac2)')}</i>`;
      }).join('');
      return `${hs}<div class="btn">${heart('#fff')}</div><div class="tip">${esc(t)}</div>`;
    },
  },
  {
    ...base,
    id: 'ui-tap',
    no: 267,
    cat: 'social',
    zh: '手指點擊',
    en: 'Tap Pointer',
    desc: '手指移到重點位置點一下，波紋擴散、標籤跳出',
    tags: ['社群', '指示', '重點'],
    tone: 'ink',
    sample: ['點這裡看格局', '50,46'],
    hint: '標籤文字 / 點擊位置 x,y（0–100，可省略）',
    motion: '一隻白色手指（硬邊向量，黑色描邊）從右下角滑到指定位置，按下時手指縮小一點，點擊處擴散兩圈主色圓環；同時上方彈出主色膠囊標籤；停留後手指往右下離開、標籤收回。',
    motionEn: 'A white pointing hand (hard-edged vector with a black outline) slides in from the bottom right to the target point; it shrinks slightly as it presses, two accent rings ripple out from the tap point, and an accent pill label pops up above; after a hold the hand leaves to the bottom right and the label retracts.',
    css: `
.S .pt{position:absolute;left:var(--x);top:var(--y);width:0;height:0}
.S .rg{position:absolute;left:-6cqw;top:-6cqw;width:12cqw;height:12cqw;border-radius:50%;border:.8cqw solid var(--ac);opacity:0;animation:K_r 4.4s ease-out infinite}
.S .rg.b{animation-delay:.18s}
.S .hand{position:absolute;left:-4.5cqw;top:-1.75cqw;width:16cqw;height:16cqw;animation:K_h 4.4s cubic-bezier(.4,0,.2,1) infinite}
.S .lb{position:absolute;left:0;bottom:9cqw;transform:translateX(-50%);white-space:nowrap;background:var(--ac);color:var(--bg);font-size:5cqw;padding:1.8cqw 4cqw;border-radius:99px;animation:K_l 4.4s cubic-bezier(.3,1.6,.5,1) infinite both}
@keyframes K_h{0%,6%{transform:translate(50cqw,60cqh)}26%{transform:none}30%{transform:scale(.85)}34%,74%{transform:none}92%,100%{transform:translate(50cqw,60cqh)}}
@keyframes K_r{0%,29%{transform:scale(.2);opacity:0}30%{opacity:1}52%,100%{transform:scale(1.6);opacity:0}}
@keyframes K_l{0%,30%{transform:translateX(-50%) scale(0)}38%,84%{transform:translateX(-50%)}92%,100%{transform:translateX(-50%) scale(0)}}`,
    html: (w) => {
      const [t, pos] = pick(w, 2, ['點這裡看格局', '50,46']);
      const m = /(-?\d+(?:\.\d+)?)\s*[,，]\s*(-?\d+(?:\.\d+)?)/.exec(pos ?? '');
      const x = m ? Math.max(5, Math.min(95, +m[1])) : 50, y = m ? Math.max(12, Math.min(92, +m[2])) : 46;
      return `<div class="pt" style="--x:${x}%;--y:${y}%"><i class="rg"></i><i class="rg b"></i><div class="lb">${esc(t)}</div><svg class="hand" viewBox="0 0 32 32"><path d="M9 3.5c1.4 0 2.5 1.1 2.5 2.5v9l1-.3V12c0-1.3 1-2.3 2.3-2.3s2.2 1 2.2 2.3v2l.8-.1c0-1.3 1-2.2 2.2-2.2s2.2 1 2.2 2.2v1.3l.6-.1c1.2 0 2.2 1 2.2 2.2V23c0 3.6-2.8 6.5-6.4 6.5H15c-2 0-3.8-1-4.9-2.7L5 19.4c-.7-1-.4-2.4.6-3.1 1-.6 2.2-.4 2.9.4l.1.1V6c0-1.4 1-2.5 2.4-2.5z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg></div>`;
    },
  },
  {
    ...base,
    id: 'ui-browser',
    no: 268,
    cat: 'social',
    zh: '瀏覽器框',
    en: 'Browser Frame',
    desc: '瀏覽器視窗彈出，網址逐字打出，頁面區塊依序載入',
    tags: ['社群', '網站', '資料'],
    tone: 'paper',
    sample: ['example.com/report', '本週重點整理'],
    hint: '網址 / 頁面標題',
    motion: '畫面中央彈出一個白色瀏覽器視窗（硬邊黑框），頂列三個圓點與網址列，網址一個字一個字打出；打完後頁面內容依序載入：主色橫幅、頁面大標題、三條灰色文字骨架與兩個並排的圖片框依序淡入上移。中性示意，不使用任何品牌瀏覽器外觀。',
    motionEn: 'A white browser window with a hard black frame pops in at the center: three dots and an address bar on top, with the URL typing out character by character; then the page loads in order: an accent banner, the big page title, three grey text skeleton lines and two side-by-side image boxes fade and rise in. Neutral mock, no branded browser chrome.',
    css: `
.S .win{width:min(88cqw,150cqh);background:#fff;color:#111;border:.6cqw solid #111;border-radius:2.4cqw;overflow:hidden;animation:K_in 6s cubic-bezier(.3,1.4,.5,1) infinite both}
.S .top{display:flex;align-items:center;gap:1.4cqw;padding:2cqw 2.6cqw;border-bottom:.6cqw solid #111;background:#f2f2f2}
.S .top i{width:2cqw;height:2cqw;border-radius:50%;border:.4cqw solid #111;flex:none}
.S .url{flex:1;margin-left:1.6cqw;background:#fff;border:.4cqw solid #111;border-radius:99px;padding:1cqw 2.4cqw;font:500 3.2cqw/1.2 var(--mono);white-space:nowrap;overflow:hidden;min-height:5.6cqw}
.S .pg{padding:3.6cqw;display:grid;gap:2.4cqw}
.S .pg>*{opacity:0;transform:translateY(2cqw)}
.S.done .pg>*{opacity:1;transform:none;transition:.4s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--i)*.14s)}
.S .ban{height:9cqw;background:var(--ac)}
.S .ti{font-size:6.4cqw;line-height:1.2}
.S .ln{height:2.2cqw;background:#ddd;border-radius:1cqw;width:var(--w)}
.S .im{display:grid;grid-template-columns:1fr 1fr;gap:2.4cqw}
.S .im i{aspect-ratio:4/3;background:#e9e9e9;border:.4cqw solid #111}
@keyframes K_in{0%{transform:scale(.6);opacity:0}6%,92%{transform:none;opacity:1}100%{opacity:0}}
@container (min-aspect-ratio:1/1){.S .win{zoom:.55}}`,
    html: (w) => {
      const [u, t] = pick(w, 2, ['example.com/report', '本週重點整理']);
      return `<div class="win" data-cycle="6000"><div class="top"><i></i><i></i><i></i><div class="url" data-type="${esc(u)}" data-at="500" data-step="${Math.round(Math.min(90, 1500 / Math.max(1, u.length)))}"></div></div><div class="pg"><div class="ban" style="--i:0"></div><div class="ti" style="--i:1">${esc(t)}</div><div class="ln" style="--i:2;--w:100%"></div><div class="ln" style="--i:3;--w:86%"></div><div class="ln" style="--i:4;--w:62%"></div><div class="im" style="--i:5"><i></i><i></i></div></div></div>`;
    },
    run: typeLoop,
  },
  {
    ...base,
    id: 'ui-audiogram',
    no: 269,
    cat: 'social',
    zh: '聲波動態',
    en: 'Audiogram',
    desc: 'Podcast、訪談剪段用：節目名稱加跳動聲波與進度條',
    tags: ['社群', 'Podcast', '訪談'],
    tone: 'ink',
    sample: ['房事聊聊', 'EP.12 首購族怎麼挑區域'],
    hint: '節目名稱 / 本集標題',
    duration: 6,
    motion: '畫面中央一個主色方形封面（節目名稱首字大字），下方是節目名稱與本集標題；再下面一排三十多根圓角直條聲波，以不同節奏上下跳動（中間較高、兩側較低）；最底下一條進度條由左往右持續前進，左右兩端顯示時間。全部硬邊、無光暈。',
    motionEn: 'An accent square cover with the show initial sits at the center, the show name and episode title below; under them a row of thirty-plus rounded bars bounce at different rhythms (taller in the middle, shorter at the edges); at the bottom a progress bar keeps advancing left to right with times at both ends. Hard edges, no glow.',
    css: `
.S .g{display:flex;flex-direction:column;align-items:center;gap:3cqw;width:min(84cqw,140cqh)}
.S .cv{width:34cqw;height:34cqw;background:var(--ac);color:var(--bg);display:grid;place-items:center;font-size:18cqw;border-radius:2cqw}
.S .nm{font-size:7cqw;text-align:center}
.S .ep{font-size:4cqw;font-weight:500;opacity:.75;text-align:center;line-height:1.3}
.S .wv{display:flex;align-items:center;gap:.9cqw;height:16cqw}
.S .wv i{width:1.4cqw;height:var(--h);border-radius:1cqw;background:var(--fg);transform-origin:50% 50%;animation:K_w var(--t) ease-in-out infinite alternate;animation-delay:var(--d)}
.S .pr{width:100%}
.S .tr{height:1cqw;background:var(--mu);border-radius:1cqw;overflow:hidden}
.S .tr b{display:block;height:100%;background:var(--ac);transform-origin:0 50%;animation:K_p 8s linear infinite}
.S .tm{display:flex;justify-content:space-between;font:500 3cqw var(--mono);opacity:.7;margin-top:1.4cqw}
@keyframes K_w{from{transform:scaleY(.25)}to{transform:scaleY(1)}}
@keyframes K_p{from{transform:scaleX(.08)}to{transform:scaleX(.62)}}
@container (min-aspect-ratio:1/1){.S .g{zoom:.5}}`,
    html: (w) => {
      const [n, e] = pick(w, 2, ['房事聊聊', 'EP.12 首購族怎麼挑區域']);
      const bars = Array.from({ length: 34 }, (_, i) => {
        const c = 1 - Math.abs(i - 16.5) / 17;
        const h = Math.round(25 + c * 70 + ((i * 37) % 17));
        return `<i style="--h:${Math.min(100, h)}%;--t:${(0.32 + ((i * 13) % 7) * 0.06).toFixed(2)}s;--d:-${((i * 7) % 10) / 10}s"></i>`;
      }).join('');
      return `<div class="g"><div class="cv">${esc([...n][0] ?? '')}</div><div><div class="nm">${esc(n)}</div><div class="ep">${esc(e)}</div></div><div class="wv">${bars}</div><div class="pr"><div class="tr"><b></b></div><div class="tm"><span>03:12</span><span>28:40</span></div></div></div>`;
    },
  },
  {
    ...base,
    id: 'ui-pip',
    no: 270,
    cat: 'social',
    zh: '子母畫面框',
    en: 'Picture-in-Picture Frame',
    desc: '角落彈出小視窗外框和名牌，疊在影片上放反應或講者畫面',
    tags: ['社群', '疊加', '訪談'],
    tone: 'ink',
    sample: ['KC', '現場反應', '右下'],
    hint: '名字 / 小標 / 位置：右下｜左下｜右上｜左上',
    motion: '畫面角落彈出一個 3:4 圓角小視窗外框（主色粗框，框內透明，可疊上自己的人像影片），左上角一個紅色方形錄影點閃爍；框下緣貼一條白底名牌，名字粗體、小標細字從左滑入；停留後外框縮回角落。輸出透明背景時，只留下外框與名牌。',
    motionEn: 'A 3:4 rounded window frame pops in at a corner (thick accent border, transparent inside so your own talking-head footage can sit underneath) with a blinking red square record dot in its top left; a white name tag clings to the bottom edge with the bold name and a smaller subtitle sliding in from the left; after a hold the frame shrinks back into the corner. With a transparent background only the frame and tag remain.',
    css: `
.S .f{position:absolute;width:34cqw;aspect-ratio:3/4;border:1.2cqw solid var(--ac);border-radius:3cqw;animation:K_in 5s cubic-bezier(.3,1.5,.5,1) infinite both}
.S .f.br{right:6cqw;bottom:12cqh;transform-origin:100% 100%}.S .f.bl{left:6cqw;bottom:12cqh;transform-origin:0 100%}
.S .f.tr{right:6cqw;top:10cqh;transform-origin:100% 0}.S .f.tl{left:6cqw;top:10cqh;transform-origin:0 0}
.S .rec{position:absolute;left:2.4cqw;top:2.4cqw;width:2.6cqw;height:2.6cqw;background:#e53935;animation:K_b 1s steps(1) infinite}
.S .tag{position:absolute;left:-1.2cqw;bottom:-6cqw;background:#fff;color:#111;padding:1.6cqw 3cqw;white-space:nowrap;animation:K_t 5s cubic-bezier(.2,.8,.2,1) infinite both}
.S .tag b{font-size:4.6cqw;display:block}
.S .tag span{font-size:3cqw;font-weight:500;color:#555}
@keyframes K_in{0%{transform:scale(0)}10%,88%{transform:none}98%,100%{transform:scale(0)}}
@keyframes K_b{50%{opacity:0}}
@keyframes K_t{0%,14%{clip-path:inset(0 100% 0 0)}24%,86%{clip-path:inset(0 0 0 0)}92%,100%{clip-path:inset(0 100% 0 0)}}`,
    html: (w) => {
      const [n, s, p] = pick(w, 3, ['KC', '現場反應', '右下']);
      const k = /左上/.test(p) ? 'tl' : /右上/.test(p) ? 'tr' : /左下/.test(p) ? 'bl' : 'br';
      return `<div class="f ${k}"><i class="rec"></i><div class="tag"><b>${esc(n)}</b><span>${esc(s)}</span></div></div>`;
    },
  },

  /* ───────── 開場收尾 ───────── */
  {
    ...base,
    id: 'hook-series',
    no: 271,
    cat: 'hook',
    zh: '系列編號角標',
    en: 'Series Badge',
    desc: '左上角滑入「第幾集」角標和系列名，下方小點標出進度',
    tags: ['系列', '開場', '常駐'],
    tone: 'ink',
    sample: ['重劃區通勤實測', '3', '5'],
    hint: '系列名 / 第幾集 / 總集數',
    motion: '左上角先由左滑入一個主色方塊，裡面是「EP」小字和大號集數（等寬數字）；方塊右邊接著拉出白底系列名條；下方一排小方點代表總集數，已播的實心、本集方點放大閃一下；之後整組常駐在角落，片尾前收回。適合整支影片都疊著。',
    motionEn: 'An accent block slides in at the top left with a small "EP" label and a large monospaced episode number; a white series-name strip extends to its right; below, a row of small squares represents the total episodes — watched ones solid, the current one popping once; the group then stays parked in the corner and retracts near the end. Built to sit over a whole video.',
    css: `
.S{place-items:start start}
.S .g{margin:9cqh 0 0 6cqw;display:grid;grid-template-columns:auto auto;align-items:stretch;row-gap:1.6cqw}
.S .ep{background:var(--ac);color:var(--bg);padding:1.4cqw 2.6cqw;display:flex;flex-direction:column;justify-content:center;animation:K_a 6s cubic-bezier(.2,.8,.2,1) infinite both}
.S .ep small{font:700 2.6cqw var(--mono);letter-spacing:.2em}
.S .ep b{font:700 9cqw/1 var(--mono)}
.S .nm{background:#fff;color:#111;font-size:5cqw;padding:0 3.6cqw;display:flex;align-items:center;white-space:nowrap;animation:K_n 6s cubic-bezier(.2,.8,.2,1) infinite both}
.S .dots{grid-column:1/3;display:flex;gap:1.2cqw}
.S .dots i{width:2.4cqw;height:2.4cqw;border:.4cqw solid var(--fg);opacity:0;animation:K_d 6s ease infinite both;animation-delay:calc(var(--i)*.06s)}
.S .dots i.on{background:var(--fg)}
.S .dots i.now{background:var(--ac);border-color:var(--ac);animation-name:K_now}
@keyframes K_a{0%{transform:translateX(-60cqw)}10%,90%{transform:none}100%{transform:translateX(-60cqw)}}
@keyframes K_n{0%,8%{clip-path:inset(0 100% 0 0)}20%,88%{clip-path:inset(0 0 0 0)}96%,100%{clip-path:inset(0 100% 0 0)}}
@keyframes K_d{0%,18%{opacity:0}24%,88%{opacity:1}94%,100%{opacity:0}}
@keyframes K_now{0%,18%{opacity:0}24%{opacity:1}30%{transform:scale(1.8)}36%,88%{opacity:1;transform:none}94%,100%{opacity:0}}`,
    html: (w) => {
      const [n, e, t] = pick(w, 3, ['重劃區通勤實測', '3', '5']);
      const cur = Math.max(1, parseInt(e) || 1), tot = Math.max(cur, Math.min(20, parseInt(t) || cur));
      const dots = Array.from({ length: tot }, (_, i) => `<i class="${i + 1 < cur ? 'on' : i + 1 === cur ? 'now' : ''}" style="--i:${i}"></i>`).join('');
      return `<div class="g"><div class="ep"><small>EP</small><b>${esc(String(cur).padStart(2, '0'))}</b></div><div class="nm">${esc(n)}</div><div class="dots">${dots}</div></div>`;
    },
  },
  {
    ...base,
    id: 'hook-teaser',
    no: 272,
    cat: 'hook',
    zh: '結果先講',
    en: 'Result First',
    desc: '先閃出結果，再像錄影帶倒轉一樣倒回故事開頭',
    tags: ['開場', '鉤子', '懸念'],
    tone: 'ink',
    sample: ['最後我買了這裡', '倒回 3 個月前'],
    hint: '結果 / 倒回說明',
    motion: '開頭直接彈出大字結果，左上角一張主色「先看結果」標籤；1.6 秒後進入倒轉：畫面出現數條白色水平掃描帶由下往上快速捲動，結果文字以階梯方式上下抖動並縮小，左上角換成閃爍的「◀◀」；最後硬切到乾淨底色，中央浮現倒回說明。全部硬邊、無模糊。',
    motionEn: 'The result pops in as big text right away with an accent "result first" tag in the top left; after 1.6s it rewinds: several white horizontal scan bands race upward, the result text jitters up and down in steps and shrinks, and the tag switches to a blinking "◀◀"; finally a hard cut to a clean background with the rewind caption at the center. Hard edges, no blur.',
    css: `
.S .r{font-size:11cqw;text-align:center;padding:0 6cqw;line-height:1.2;animation:K_r 5s steps(1) infinite}
.S .r span{display:block;animation:K_rs 5s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .tg{position:absolute;left:6cqw;top:9cqh;background:var(--ac);color:var(--bg);font-size:4cqw;padding:1.4cqw 2.6cqw;animation:K_tg 5s steps(1) infinite}
.S .rw{position:absolute;left:6cqw;top:9cqh;font:700 6cqw var(--mono);color:var(--fg);opacity:0;animation:K_rw 5s steps(1) infinite}
.S .sc{position:absolute;left:0;right:0;height:var(--h);background:#fff;opacity:0;animation:K_sc 5s linear infinite;animation-delay:var(--d)}
.S .cap{position:absolute;font-size:8cqw;text-align:center;padding:0 8cqw;opacity:0;animation:K_c 5s steps(1) infinite}
@keyframes K_rs{0%{transform:scale(.5)}8%,100%{transform:none}}
@keyframes K_r{0%,34%{transform:none;opacity:1}36%{transform:translateY(-2cqw) scale(.95)}40%{transform:translateY(3cqw) scale(.9)}44%{transform:translateY(-3cqw) scale(.84)}48%{transform:translateY(2cqw) scale(.78)}52%{transform:translateY(-1cqw) scale(.7)}56%,100%{opacity:0}}
@keyframes K_tg{0%,34%{opacity:1}35%,100%{opacity:0}}
@keyframes K_rw{0%,34%{opacity:0}35%,39%,43%,47%,51%{opacity:1}37%,41%,45%,49%,53%,100%{opacity:0}}
@keyframes K_sc{0%,34%{opacity:0;top:110%}35%{opacity:1;top:100%}56%{opacity:1;top:-10%}57%,100%{opacity:0}}
@keyframes K_c{0%,57%{opacity:0}58%,100%{opacity:1}}`,
    html: (w) => {
      const [r, c] = pick(w, 2, ['最後我買了這裡', '倒回 3 個月前']);
      const sc = [0, 1, 2, 3].map((i) => `<i class="sc" style="--h:${[1.4, .6, 2.2, .9][i]}cqh;--d:${-i * 0.27}s"></i>`).join('');
      return `<div class="r"><span>${esc(r)}</span></div><div class="tg">先看結果</div><div class="rw">◀◀</div>${sc}<div class="cap">${esc(c)}</div>`;
    },
  },
  {
    ...base,
    id: 'hook-endscreen',
    no: 273,
    cat: 'hook',
    zh: '片尾推薦卡',
    en: 'End Screen',
    desc: '片尾兩張下一支影片框依序滑入，加上追蹤按鈕',
    tags: ['片尾', 'YouTube', '導流'],
    tone: 'ink',
    sample: ['下一支：林口通勤實測', '你可能也想看：首購怎麼挑', '追蹤'],
    hint: '推薦 1 / 推薦 2 / 按鈕文字',
    motion: '標題「看完這支，接著看」由上淡入；兩張 16:9 影片框（白色粗框，框內透明可疊入影片截圖，左上角主色「▶」小方塊）從左、右兩側依序滑入，每張框下方一行推薦標題；最下面一個主色膠囊「追蹤」按鈕彈出，被一個小游標點擊後變成「已追蹤」。框內透明，可在剪輯軟體擺上實際的影片畫面。',
    motionEn: 'A heading "Watch next" fades in at the top; two 16:9 video frames (thick white borders, transparent inside for thumbnails, a small accent play square in the top left) slide in from left and right in turn, each with a recommendation title below; at the bottom an accent pill "Follow" button pops up and is clicked by a small cursor, turning into "Following". Frames are transparent so real thumbnails can be placed underneath in an editor.',
    css: `
.S .g{display:flex;flex-direction:column;align-items:center;gap:4cqw;width:min(84cqw,150cqh)}
.S .hd{font-size:6cqw;animation:K_hd 7s ease infinite both}
.S .vs{display:grid;gap:4cqw;width:100%}
.S .v{animation:K_v 7s cubic-bezier(.2,.8,.2,1) infinite both}
.S .v:nth-child(2){animation-name:K_v2}
.S .fr{position:relative;aspect-ratio:16/9;border:1cqw solid #fff;border-radius:2cqw}
.S .fr i{position:absolute;left:2cqw;top:2cqw;width:7cqw;height:7cqw;background:var(--ac);color:var(--bg);display:grid;place-items:center;font-size:3.6cqw;font-style:normal}
.S .v p{margin:1.6cqw 0 0;font-size:4.4cqw;line-height:1.3}
.S .bt{position:relative;background:var(--ac);color:var(--bg);font-size:5.4cqw;padding:2cqw 7cqw;border-radius:99px;animation:K_b 7s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .bt span{animation:K_t1 7s steps(1) infinite}
.S .bt::after{content:'已追蹤';position:absolute;inset:0;display:grid;place-items:center;border-radius:99px;background:#3a3a3a;color:#ccc;opacity:0;animation:K_t2 7s steps(1) infinite}
.S .cur{position:absolute;right:-6cqw;bottom:-6cqw;width:5cqw;height:5cqw;animation:K_c 7s cubic-bezier(.4,0,.2,1) infinite}
@keyframes K_hd{0%{opacity:0}6%,92%{opacity:1}100%{opacity:0}}
@keyframes K_v{0%,6%{transform:translateX(-110cqw)}18%,92%{transform:none}100%{transform:translateX(-110cqw)}}
@keyframes K_v2{0%,14%{transform:translateX(110cqw)}26%,92%{transform:none}100%{transform:translateX(110cqw)}}
@keyframes K_b{0%,30%{transform:scale(0)}36%,92%{transform:none}100%{transform:scale(0)}}
@keyframes K_c{0%,40%{transform:translate(20cqw,20cqh);opacity:0}52%{transform:translate(-8cqw,-7cqw);opacity:1}55%{transform:translate(-8cqw,-7cqw) scale(.8)}58%,80%{transform:translate(-8cqw,-7cqw);opacity:1}92%,100%{transform:translate(20cqw,20cqh);opacity:0}}
@keyframes K_t1{0%,55%{opacity:1}56%,100%{opacity:0}}
@keyframes K_t2{0%,55%{opacity:0}56%,100%{opacity:1}}
@container (min-aspect-ratio:1/1){.S .g{zoom:.62}.S .vs{grid-template-columns:1fr 1fr}}`,
    html: (w) => {
      const [a, b, c] = pick(w, 3, ['下一支：林口通勤實測', '你可能也想看：首購怎麼挑', '追蹤']);
      const v = (t: string) => `<div class="v"><div class="fr"><i>▶</i></div><p>${esc(t)}</p></div>`;
      return `<div class="g"><div class="hd">看完這支，接著看</div><div class="vs">${v(a)}${v(b)}</div><div class="bt"><span>${esc(c)}</span><svg class="cur" viewBox="0 0 24 24"><path d="M4 2l16 10-7 1.5L9.5 21z" fill="#fff" stroke="#000" stroke-width="1.2"/></svg></div></div>`;
    },
  },
  {
    ...base,
    id: 'hook-pov',
    no: 274,
    cat: 'hook',
    zh: 'POV 標籤條',
    en: 'POV Tag',
    desc: '上方「POV：」標籤加情境句逐字打出，第一秒交代情境',
    tags: ['開場', '鉤子', '情境'],
    tone: 'ink',
    sample: ['你第一次自己去看房', 'POV'],
    hint: '情境句 / 標籤（預設 POV）',
    motion: '畫面上方先彈出主色方塊標籤「POV：」，右邊白底條往右拉開，情境句一個字一個字打出，游標閃爍；打完後白底條下緣畫出一條主色底線；停留後整組往上收回。',
    motionEn: 'An accent block tag "POV:" pops in at the top, a white strip extends to its right and the situation line types out character by character with a blinking caret; once typed, an accent underline draws along the strip; after a hold the group retracts upward.',
    css: `
.S{place-items:start center}
.S .g{margin-top:12cqh;display:flex;align-items:stretch;max-width:90cqw;animation:K_g 5s cubic-bezier(.3,1.4,.5,1) infinite both}
.S .tg{background:var(--ac);color:var(--bg);font:700 6cqw/1 var(--mono);padding:2.4cqw 3cqw;display:flex;align-items:center;flex:none}
.S .tx{position:relative;background:#fff;color:#111;font-size:5.6cqw;line-height:1.25;padding:2.2cqw 3.6cqw;min-width:6cqw;display:flex;align-items:center}
.S .tx::after{content:'';position:absolute;left:0;right:0;bottom:-1.2cqw;height:1.2cqw;background:var(--ac);transform:scaleX(0);transform-origin:0 50%;transition:none}
.S.done .tx::after{transform:none;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.S .cur{display:inline-block;width:.5cqw;height:5.6cqw;margin-left:.6cqw;background:#111;animation:K_b .8s steps(1) infinite}
@keyframes K_b{50%{opacity:0}}
@keyframes K_g{0%{transform:translateY(-30cqh)}8%,90%{transform:none}100%{transform:translateY(-30cqh)}}`,
    html: (w) => {
      const [t, l] = pick(w, 2, ['你第一次自己去看房', 'POV']);
      return `<div class="g" data-cycle="5000"><div class="tg">${esc(w.length > 1 ? l : 'POV')}：</div><div class="tx"><span data-type="${esc(t)}" data-at="500" data-step="${Math.round(Math.min(120, 1600 / Math.max(1, [...t].length)))}"></span><i class="cur"></i></div></div>`;
    },
    run: typeLoop,
  },

  /* ───────── 房產資訊 ───────── */
  {
    ...base,
    id: 'estate-commute',
    no: 275,
    cat: 'estate',
    zh: '通勤碼錶',
    en: 'Commute Timer',
    desc: '碼錶從 0 跑到實測時間，下方路線點從 A 移到 B',
    tags: ['房產', '通勤', '數據'],
    tone: 'ink',
    sample: ['林口', '台北車站', '35:00', '捷運＋步行（示意）'],
    hint: '起點 / 終點 / 實測時間（分:秒，或「35 分」）/ 交通方式；時間請用自己實測的數字',
    duration: 6,
    motion: '畫面中央一個圓形碼錶（粗字色外框，頂端按鈕），指針轉動、外圈主色進度弧一路畫滿，中間等寬數字從 00:00 跑到實測時間（緩出）；碼錶下方一條水平路線，起點與終點兩個圓點各有地名，主色小圓點沿線從起點移到終點；最下方小字交通方式。數字停下時碼錶放大回彈一下。',
    motionEn: 'A round stopwatch (thick outline, button on top) sits at the center: its hand sweeps and an accent progress arc fills the rim while monospaced digits count from 00:00 to the measured time (ease-out); below, a horizontal route with labeled start and end dots has an accent dot travel from start to end; the travel mode sits in small text at the bottom. The stopwatch bumps once when the count lands.',
    css: `
.S .g{display:flex;flex-direction:column;align-items:center;gap:5cqw;width:min(84cqw,140cqh)}
.S .sw{position:relative;width:56cqw;height:56cqw}
.S .sw svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.S .arc{stroke-dasharray:100;stroke-dashoffset:100}
.S .hand{transform-origin:50px 54px}
.S .tm{position:absolute;inset:0;display:grid;place-items:center;padding-top:6cqw;font:700 11cqw var(--mono);letter-spacing:-.04em}
.S .sw.land{animation:K_l .45s cubic-bezier(.3,1.8,.5,1)}
.S .rt{position:relative;width:100%;height:16cqw}
.S .ln{position:absolute;left:5%;right:5%;top:3cqw;height:1cqw;background:var(--mu)}
.S .ln b{display:block;height:100%;background:var(--ac);transform-origin:0 50%;transform:scaleX(var(--p,0))}
.S .pt{position:absolute;top:1.5cqw;width:4cqw;height:4cqw;margin-left:-2cqw;border-radius:50%;background:var(--bg);border:1cqw solid var(--fg)}
.S .pt.a{left:5%}.S .pt.b{left:95%}
.S .dot{position:absolute;top:1cqw;left:calc(5% + 90% * var(--p,0));width:5cqw;height:5cqw;margin-left:-2.5cqw;border-radius:50%;background:var(--ac)}
.S .nm{position:absolute;top:8cqw;font-size:4.4cqw;white-space:nowrap;transform:translateX(-50%)}
.S .nm.a{left:5%;transform:none}.S .nm.b{left:95%;transform:translateX(-100%)}
.S .md{font-size:3.6cqw;font-weight:500;opacity:.7}
@keyframes K_l{0%{transform:scale(1.08)}}
@container (min-aspect-ratio:1/1){.S .g{zoom:.45}}`,
    html: (w) => {
      const [a, b, t, m] = pick(w, 4, ['林口', '台北車站', '35:00', '捷運＋步行（示意）']);
      const mm = /(\d+)\s*[:：]\s*(\d{1,2})/.exec(t), mn = /(\d+(?:\.\d+)?)\s*分/.exec(t);
      const sec = mm ? +mm[1] * 60 + +mm[2] : mn ? Math.round(+mn[1] * 60) : Math.round((parseFloat(t) || 0) * 60);
      return `<div class="g"><div class="sw" data-sec="${sec}"><svg viewBox="0 0 100 108"><rect x="44" y="0" width="12" height="8" fill="currentColor"/><circle cx="50" cy="54" r="44" fill="none" stroke="currentColor" stroke-width="5"/><circle class="arc" cx="50" cy="54" r="36" fill="none" stroke="var(--ac)" stroke-width="6" pathLength="100" transform="rotate(-90 50 54)"/><line class="hand" x1="50" y1="20" x2="50" y2="28" stroke="var(--ac)" stroke-width="4" stroke-linecap="round"/></svg><div class="tm">00:00</div></div><div class="rt"><div class="ln"><b></b></div><i class="pt a"></i><i class="pt b"></i><i class="dot"></i><span class="nm a">${esc(a)}</span><span class="nm b">${esc(b)}</span></div><div class="md">${esc(m)}</div></div>`;
    },
    run: (root) => {
      const sw = root.querySelector<HTMLElement>('.sw')!;
      const tm = root.querySelector<HTMLElement>('.tm')!;
      const arc = root.querySelector<SVGElement>('.arc')!;
      const hand = root.querySelector<SVGElement>('.hand')!;
      const rt = root.querySelector<HTMLElement>('.rt')!;
      const total = Number(sw.dataset.sec || 0);
      const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
      const RUN = 2600, CYC = 6000;
      let raf = 0, t0 = performance.now(), landed = false;
      const f = (now: number) => {
        raf = requestAnimationFrame(f);
        const e = (now - t0) % CYC;
        const k = Math.min(1, Math.max(0, (e - 300) / RUN));
        const p = 1 - Math.pow(1 - k, 3);
        tm.textContent = fmt(total * p);
        arc.style.strokeDashoffset = String(100 - p * 100);
        hand.style.transform = `rotate(${p * 360 * 3}deg)`;
        rt.style.setProperty('--p', String(p));
        if (k >= 1 && !landed) { landed = true; sw.classList.remove('land'); void sw.offsetWidth; sw.classList.add('land'); }
        if (k < 1) landed = false;
      };
      raf = requestAnimationFrame(f);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    ...base,
    id: 'estate-source',
    no: 276,
    cat: 'estate',
    zh: '資料來源條',
    en: 'Source Tag',
    desc: '左下角滑入「資料來源」小條，標出出處與查詢時間',
    tags: ['房產', '數據', '來源'],
    tone: 'ink',
    sample: ['內政部不動產交易實價查詢服務網', '2026 年 9 月查詢'],
    hint: '來源名稱 / 時間點',
    motion: '畫面左下角先彈出主色小方塊標籤「資料來源」，右邊白底條往右拉開顯示來源名稱，下面一行小字時間點淡入；整條常駐不動，片段結尾往左收回。字級小、不搶畫面，適合疊在數據畫面下方。',
    motionEn: 'At the bottom left an accent tag "Source" pops in, a white strip extends to its right with the source name, and a small date line fades in beneath; the bar stays put and retracts left at the end of the clip. Small type that stays out of the way, made to sit under data shots.',
    css: `
.S{place-items:end start}
.S .g{margin:0 0 10cqh 5cqw;max-width:88cqw;animation:K_g 6s cubic-bezier(.2,.8,.2,1) infinite both}
.S .row{display:flex;align-items:stretch}
.S .tg{background:var(--ac);color:var(--bg);font-size:3.6cqw;padding:1.2cqw 2cqw;display:flex;align-items:center;flex:none}
.S .src{background:#fff;color:#111;font-size:4.2cqw;font-weight:700;padding:1.2cqw 2.4cqw;line-height:1.3;animation:K_s 6s cubic-bezier(.2,.8,.2,1) infinite both}
.S .dt{font-size:3.2cqw;font-weight:500;margin-top:1cqw;opacity:0;animation:K_d 6s ease infinite both}
@keyframes K_g{0%{transform:translateX(-100cqw)}8%,90%{transform:none}100%{transform:translateX(-100cqw)}}
@keyframes K_s{0%,8%{clip-path:inset(0 100% 0 0)}18%,100%{clip-path:inset(0 0 0 0)}}
@keyframes K_d{0%,18%{opacity:0}26%,88%{opacity:.8}96%,100%{opacity:0}}`,
    html: (w) => {
      const [s, d] = pick(w, 2, ['內政部不動產交易實價查詢服務網', '2026 年 9 月查詢']);
      return `<div class="g"><div class="row"><div class="tg">資料來源</div><div class="src">${esc(s)}</div></div><div class="dt">${esc(d)}</div></div>`;
    },
  },
  {
    ...base,
    id: 'estate-proscons',
    no: 277,
    cat: 'estate',
    zh: '優缺點對照',
    en: 'Pros and Cons',
    desc: '左右兩欄，優點打勾、缺點打叉，一條一條交錯出現',
    tags: ['房產', '比較', '清單'],
    tone: 'paper',
    sample: ['+ 步行可到捷運站', '+ 生活機能完整', '+ 社區公設多', '- 臨大馬路較吵', '- 公設比偏高'],
    hint: '一行一點：+ 開頭是優點、- 開頭是缺點（沒寫就輪流放）',
    motion: '畫面上下（直式）或左右（橫式）兩欄，標頭「優點」綠色、「缺點」紅色方塊先彈出；接著優點、缺點一條一條交錯滑入，每條左邊的方框先出現，再畫出綠色勾或紅色叉（筆畫描繪）；全部出現後停留。硬邊、無陰影。',
    motionEn: 'Two columns — stacked in portrait, side by side in landscape — with a green "Pros" and red "Cons" header block popping in first; then items slide in alternating between the columns, each with a box that appears before a green check or red cross draws in stroke by stroke; everything holds once shown. Hard edges, no shadows.',
    css: `
.S .g{display:grid;gap:7cqw;width:min(86cqw,170cqh);color:#111}
@container (min-aspect-ratio:1/1){.S .g{grid-template-columns:1fr 1fr}}
.S .col{display:grid;gap:3cqw;align-content:start}
.S .hd{justify-self:start;color:#fff;font-size:6.4cqw;padding:1.4cqw 3.6cqw;animation:K_in 6s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .p .hd{background:#2e9e5b}.S .c .hd{background:#d64541}
.S .it{display:flex;align-items:center;gap:3cqw;font-size:6cqw;line-height:1.25;animation:K_it 6s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(.35s + var(--i)*.32s)}
.S .it svg{width:7.4cqw;height:7.4cqw;flex:none}
.S .it path{stroke-dasharray:30;stroke-dashoffset:30;animation:K_dr 6s ease infinite both;animation-delay:calc(.55s + var(--i)*.32s)}
@keyframes K_in{0%{transform:scale(0)}6%,94%{transform:none}100%{transform:scale(0)}}
@keyframes K_it{0%{opacity:0;transform:translateX(-4cqw)}6%,90%{opacity:1;transform:none}96%,100%{opacity:0}}
@keyframes K_dr{0%{stroke-dashoffset:30}6%,100%{stroke-dashoffset:0}}`,
    html: (w) => {
      const src = w.filter(Boolean).length ? w.filter(Boolean) : ['+ 步行可到捷運站', '+ 生活機能完整', '+ 社區公設多', '- 臨大馬路較吵', '- 公設比偏高'];
      const pros: string[] = [], cons: string[] = [];
      src.forEach((l, i) => {
        const m = /^\s*([+＋\-－])\s*(.*)$/.exec(l);
        if (m) (/[+＋]/.test(m[1]) ? pros : cons).push(m[2]);
        else (i % 2 ? cons : pros).push(l);
      });
      let k = 0;
      const order: Record<string, number> = {};
      for (let i = 0; i < Math.max(pros.length, cons.length); i++) {
        if (i < pros.length) order['p' + i] = k++;
        if (i < cons.length) order['c' + i] = k++;
      }
      const ok = '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" stroke="#2e9e5b" stroke-width="2.4"/><path d="M6.5 12.5l3.5 3.5 7.5-8" stroke="#2e9e5b" stroke-width="3" pathLength="30"/></svg>';
      const no = '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" stroke="#d64541" stroke-width="2.4"/><path d="M7 7l10 10M17 7 7 17" stroke="#d64541" stroke-width="3" pathLength="30"/></svg>';
      const col = (cls: string, hd: string, items: string[], ic: string) =>
        `<div class="col ${cls}"><div class="hd">${hd}</div>${items.map((t, i) => `<div class="it" style="--i:${order[cls + i]}">${ic}<span>${esc(t)}</span></div>`).join('')}</div>`;
      return `<div class="g">${col('p', '優點', pros, ok)}${col('c', '缺點', cons, no)}</div>`;
    },
  },
  {
    ...base,
    id: 'estate-sun',
    no: 278,
    cat: 'estate',
    zh: '日照方位',
    en: 'Sun Path Compass',
    desc: '俯視房子加指北針，太陽從東繞到西，說明採光面',
    tags: ['房產', '座向', '採光'],
    tone: 'ink',
    sample: ['坐北朝南', '早上到下午都有南向光（示意）'],
    hint: '座向（例如坐北朝南、朝東南）/ 說明',
    motion: '畫面中央一個俯視的方形房子（白框），主色粗邊標出面前方向（陽台面）並寫上座向；外圈是指北針圓環，北東南西四個字；一顆主色太陽沿著南側半圓弧從東慢慢繞到西，太陽與房子之間連一條虛線光線，經過面前方向時面前的粗邊閃亮一下；下方說明文字淡入，時段字（上午、中午、下午）跟著切換。北方朝上；台灣太陽大致在南側。示意圖，不代表實際日照時數。',
    motionEn: 'A top-down square house with a white outline sits at the center, a thick accent edge marking its facing side labeled with the orientation; around it a compass ring shows N, E, S, W; an accent sun travels slowly along the southern semicircle from east to west with a dashed ray to the house, and the facing edge flashes as the sun passes in front; a caption fades in below while the time-of-day word switches between morning, noon and afternoon. North is up; in Taiwan the sun stays roughly to the south. Illustrative only, not actual sunlight hours.',
    duration: 6,
    css: `
.S .g{display:flex;flex-direction:column;align-items:center;gap:4cqw}
.S .cp{position:relative;width:72cqw;height:72cqw}
.S .ring{position:absolute;inset:6cqw;border:.6cqw solid var(--mu);border-radius:50%}
.S .dir{position:absolute;font:700 4.4cqw var(--mono)}
.S .dir.n{left:50%;top:0;transform:translateX(-50%);color:var(--ac)}.S .dir.s{left:50%;bottom:0;transform:translateX(-50%)}
.S .dir.e{right:0;top:50%;transform:translateY(-50%)}.S .dir.w{left:0;top:50%;transform:translateY(-50%)}
.S .hs{position:absolute;left:50%;top:50%;width:24cqw;height:24cqw;margin:-12cqw;transform:rotate(var(--r))}
.S .hs .b{position:absolute;inset:0;border:.8cqw solid var(--fg)}
.S .hs .fr{position:absolute;left:-.8cqw;right:-.8cqw;bottom:-2.4cqw;height:2.4cqw;background:var(--ac);animation:K_fr 6s steps(1) infinite}
.S .hs .lb{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(calc(var(--r) * -1));font-size:3.6cqw;white-space:nowrap}
.S .orb{position:absolute;inset:6cqw;animation:K_o 6s linear infinite}
.S .sun{position:absolute;left:50%;bottom:-4cqw;width:8cqw;height:8cqw;margin-left:-4cqw;border-radius:50%;background:var(--ac2);border:.6cqw solid var(--fg)}
.S .ray{position:absolute;left:50%;top:50%;bottom:0;border-left:.5cqw dashed var(--ac2);transform:translateX(-50%)}
.S .cap{font-size:4.4cqw;text-align:center;line-height:1.35;max-width:84cqw}
.S .tod{display:inline-grid;margin-right:1.6cqw;background:var(--ac);color:var(--bg);padding:.6cqw 1.6cqw}
.S .tod span{grid-area:1/1;opacity:0;animation:K_t 6s steps(1) infinite;animation-delay:var(--d)}
@keyframes K_o{0%{transform:rotate(-90deg)}100%{transform:rotate(90deg)}}
@keyframes K_t{0%,33.3%{opacity:1}33.4%,100%{opacity:0}}
@keyframes K_fr{0%{opacity:1}}
@container (min-aspect-ratio:1/1){.S .g{zoom:.5}}`,
    html: (w) => {
      const [o, c] = pick(w, 2, ['坐北朝南', '早上到下午都有南向光（示意）']);
      const face = (o.match(/朝\s*([東西南北]{1,2})/) ?? o.match(/([東西南北]{1,2})\s*向/) ?? ['', '南'])[1];
      const ang: Record<string, number> = { 北: 180, 東北: 225, 東: 270, 東南: 315, 南: 0, 西南: 45, 西: 90, 西北: 135, 南東: 315, 南西: 45, 北東: 225, 北西: 135 };
      const r = ang[face] ?? 0;
      return `<div class="g"><div class="cp"><i class="ring"></i><b class="dir n">N</b><b class="dir e">E</b><b class="dir s">S</b><b class="dir w">W</b><div class="hs" style="--r:${r}deg"><i class="b"></i><i class="fr"></i><span class="lb">${esc(o)}</span></div><div class="orb"><i class="ray"></i><i class="sun"></i></div></div><div class="cap"><span class="tod"><span style="--d:0s">上午</span><span style="--d:-4s">中午</span><span style="--d:-2s">下午</span></span>${esc(c)}</div></div>`;
    },
  },
  {
    ...base,
    id: 'estate-elevator',
    no: 279,
    cat: 'estate',
    zh: '電梯樓層',
    en: 'Elevator Floor',
    desc: '電梯面板樓層數字一路往上跳，到樓層後門打開露出說明',
    tags: ['房產', '樓層', '景觀'],
    tone: 'ink',
    sample: ['18', '高樓層視野'],
    hint: '樓層數字 / 開門後的說明',
    duration: 5,
    motion: '畫面上方是電梯樓層顯示面板（深色底、主色等寬數字與向上箭頭▲），數字從 1 一路往上跳到目標樓層（越接近越慢），箭頭閃爍；到樓層後「叮」的鈴鐺圖示晃一下，下方兩扇金屬灰電梯門往左右滑開，門後露出說明大字；停留後門關上。',
    motionEn: 'An elevator floor display (dark panel, accent monospaced digits and an up arrow) sits at the top; the number climbs from 1 to the target floor, slowing near the end, while the arrow blinks; on arrival a bell icon wiggles, then two metallic grey elevator doors below slide apart to reveal the caption in large type; after a hold the doors close.',
    css: `
.S .g{display:flex;flex-direction:column;align-items:center;gap:4cqw;width:min(80cqw,120cqh)}
.S .pn{display:flex;align-items:center;gap:3cqw;background:#111;color:var(--ac);border:.8cqw solid var(--fg);padding:2cqw 5cqw}
.S .ar{font-size:6cqw;animation:K_a .5s steps(1) infinite}
.S.arr .ar{animation:none}
.S .fl{font:700 13cqw/1 var(--mono);min-width:2ch;text-align:right}
.S .bell{font-size:5cqw;color:var(--fg);transform-origin:50% 10%}
.S.arr .bell{animation:K_bell .8s ease}
.S .dr{position:relative;width:100%;aspect-ratio:4/5;border:1cqw solid var(--fg);background:var(--bg);display:grid;place-items:center;overflow:hidden}
.S .cap{font-size:9cqw;text-align:center;padding:0 5cqw;line-height:1.2}
.S .d{position:absolute;top:0;bottom:0;width:50%;background:#9aa3ab;border:.4cqw solid #5d666e;transition:transform .9s cubic-bezier(.6,0,.3,1)}
.S .d.l{left:0}.S .d.r{right:0}
.S.open .d.l{transform:translateX(-100%)}.S.open .d.r{transform:translateX(100%)}
@keyframes K_a{50%{opacity:.2}}
@keyframes K_bell{20%{transform:rotate(22deg)}40%{transform:rotate(-18deg)}60%{transform:rotate(10deg)}80%{transform:rotate(-6deg)}}
@container (min-aspect-ratio:1/1){.S .g{zoom:.42}}`,
    html: (w) => {
      const [f, c] = pick(w, 2, ['18', '高樓層視野']);
      return `<div class="g" data-to="${Math.max(1, parseInt(f) || 1)}" data-label="${esc(f)}"><div class="pn"><span class="ar">▲</span><span class="fl">1</span><span class="bell">🔔</span></div><div class="dr"><div class="cap">${esc(c)}</div><i class="d l"></i><i class="d r"></i></div></div>`;
    },
    run: (root) => {
      const g = root.querySelector<HTMLElement>('.g')!;
      const fl = root.querySelector<HTMLElement>('.fl')!;
      const to = Number(g.dataset.to || 1), label = g.dataset.label || String(to);
      const CLIMB = 2000, CYC = 5000;
      let raf = 0, t0 = performance.now(), phase = -1;
      const f = (now: number) => {
        raf = requestAnimationFrame(f);
        const e = (now - t0) % CYC;
        const k = Math.min(1, Math.max(0, (e - 200) / CLIMB));
        const p = 1 - Math.pow(1 - k, 2.4);
        fl.textContent = k >= 1 ? label : String(Math.max(1, Math.round(1 + (to - 1) * p)));
        const ph = e < 200 + CLIMB ? 0 : e < CYC - 900 ? 1 : 2;
        if (ph !== phase) {
          phase = ph;
          root.classList.toggle('arr', ph >= 1);
          root.classList.toggle('open', ph === 1);
        }
      };
      raf = requestAnimationFrame(f);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    ...base,
    id: 'estate-spec',
    no: 280,
    cat: 'estate',
    zh: '規格資訊卡',
    en: 'Spec Card',
    desc: '戶型規格一行一行列出：格局、樓層、車位、座向',
    tags: ['房產', '資訊', '建案'],
    tone: 'paper',
    sample: ['A3 戶型（示意）', '格局：3 房 2 廳 2 衛', '樓層：8 樓', '車位：坡道平面', '座向：坐北朝南'],
    hint: '標題 / 一行一項「項目：內容」；坪數、價格請用建商或權狀資料',
    motion: '白色硬邊卡片從下方滑入，卡片頂端主色色條上是標題；接著每一列由上往下依序出現：左邊灰色小字項目名稱、右邊黑色粗體內容，列與列之間一條細分隔線從左往右畫出；全部出現後停留，最後卡片往下滑出。',
    motionEn: 'A white hard-edged card slides up from below with the title on an accent header strip; rows then appear top to bottom — grey label on the left, bold black value on the right — with a thin divider drawing left to right between rows; it holds once complete and finally slides back down.',
    css: `
.S .k{width:min(84cqw,120cqh);background:#fff;color:#111;border:.8cqw solid #111;animation:K_k 6.5s cubic-bezier(.2,.8,.2,1) infinite both}
.S .hd{background:var(--ac);color:var(--bg);font-size:6cqw;padding:3cqw 4cqw;line-height:1.2}
.S .rw{position:relative;display:flex;justify-content:space-between;gap:4cqw;padding:3cqw 4cqw;font-size:4.8cqw;opacity:0;animation:K_r 6.5s ease infinite both;animation-delay:calc(.45s + var(--i)*.28s)}
.S .rw span{color:#777;font-weight:500;flex:none}
.S .rw b{text-align:right}
.S .rw::before{content:'';position:absolute;left:4cqw;right:4cqw;top:0;height:.3cqw;background:#ddd;transform-origin:0 50%;animation:K_l 6.5s ease infinite both;animation-delay:inherit}
.S .rw:first-of-type::before{display:none}
@keyframes K_k{0%{transform:translateY(80cqh)}8%,92%{transform:none}100%{transform:translateY(80cqh)}}
@keyframes K_r{0%{opacity:0;transform:translateY(2cqw)}5%,100%{opacity:1;transform:none}}
@keyframes K_l{0%{transform:scaleX(0)}6%,100%{transform:none}}
@container (min-aspect-ratio:1/1){.S .k{zoom:.6}}`,
    html: (w) => {
      const ws = w.filter(Boolean).length ? w.filter(Boolean) : ['A3 戶型（示意）', '格局：3 房 2 廳 2 衛', '樓層：8 樓', '車位：坡道平面', '座向：坐北朝南'];
      const [t, ...rows] = ws;
      return `<div class="k"><div class="hd">${esc(t)}</div>${rows
        .slice(0, 7)
        .map((r, i) => {
          const m = /^(.*?)[:：]\s*(.*)$/.exec(r);
          return `<div class="rw" style="--i:${i}"><span>${esc(m ? m[1] : '')}</span><b>${esc(m ? m[2] : r)}</b></div>`;
        })
        .join('')}</div>`;
    },
  },
  {
    ...base,
    id: 'estate-rating',
    no: 281,
    cat: 'estate',
    zh: '星等評分卡',
    en: 'Star Rating',
    desc: '交通、生活機能、學區……逐項打星，最後算出綜合分數',
    tags: ['房產', '評分', '比較'],
    tone: 'ink',
    sample: ['交通 4.5', '生活機能 4', '學區 3.5', '綠地公園 5', '價格 3'],
    hint: '一行一項「項目 分數」（0–5，可半顆）；綜合分數自動平均。分數是你的主觀評分，請在影片中說明',
    motion: '每一列左邊是項目名稱，右邊五顆星：先是空心星框，再由左到右一顆一顆填入主色（半顆就填一半），每顆填滿時輕微彈一下，列尾等寬數字跳出分數；所有列完成後，最上方「綜合」大字分數從 0 跳到平均值。星星是硬邊向量。',
    motionEn: 'Each row has the item name on the left and five stars on the right: empty outlines first, then filled with accent color one by one from left to right (half stars fill halfway), each bumping as it fills, with the monospaced score popping in at the row end; once all rows are done, a large "Overall" score at the top counts up from 0 to the average. Hard-edged vector stars.',
    css: `
.S .g{width:min(90cqw,140cqh);display:grid;gap:4cqw}
.S .tot{display:flex;align-items:baseline;justify-content:center;gap:2.4cqw;margin-bottom:2cqw;opacity:0;animation:K_tot 7s ease infinite both;animation-delay:var(--td)}
.S .tot span{font-size:5cqw}
.S .tot b{font:700 16cqw/1 var(--mono);color:var(--ac)}
.S .rw{display:grid;grid-template-columns:1fr auto 9cqw;align-items:center;gap:2.4cqw;font-size:5.6cqw}
.S .st{display:flex;gap:.8cqw}
.S .s{position:relative;width:7.4cqw;height:7.4cqw}
.S .s svg{position:absolute;inset:0;width:100%;height:100%}
.S .s .fi{clip-path:inset(0 calc(100% - var(--f)) 0 0);opacity:0;animation:K_s 7s cubic-bezier(.3,1.8,.5,1) infinite both;animation-delay:var(--d)}
.S .sc{font:700 5cqw var(--mono);text-align:right;opacity:0;animation:K_sc 7s ease infinite both;animation-delay:var(--d)}
@keyframes K_s{0%{opacity:0;transform:scale(.4)}4%,94%{opacity:1;transform:none}100%{opacity:0}}
@keyframes K_sc{0%{opacity:0}4%,94%{opacity:1}100%{opacity:0}}
@keyframes K_tot{0%{opacity:0;transform:scale(.6)}5%,92%{opacity:1;transform:none}100%{opacity:0}}
@container (min-aspect-ratio:1/1){.S .g{zoom:.6}}`,
    html: (w) => {
      const ws = w.filter(Boolean).length ? w.filter(Boolean) : ['交通 4.5', '生活機能 4', '學區 3.5', '綠地公園 5', '價格 3'];
      const rows = ws.slice(0, 7).map((l) => {
        const m = /^(.*?)\s*([0-5](?:\.\d+)?)\s*$/.exec(l.trim());
        return { n: m ? m[1] : l, v: m ? Math.max(0, Math.min(5, +m[2])) : 0 };
      });
      const avg = rows.length ? rows.reduce((a, r) => a + r.v, 0) / rows.length : 0;
      const star = (fill: string) => `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2l-5.9 3.3 1.4-6.6-5-4.5 6.6-.7z" fill="${fill}" stroke="var(--fg)" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
      let d = 0.3;
      const html = rows
        .map((r) => {
          const stars = [0, 1, 2, 3, 4]
            .map((i) => {
              const f = Math.max(0, Math.min(1, r.v - i));
              const s = `<i class="s">${star('none')}${f > 0 ? `<span class="fi" style="--f:${f * 100}%;--d:${d.toFixed(2)}s;position:absolute;inset:0">${star('var(--ac)')}</span>` : ''}</i>`;
              if (f > 0) d += 0.09;
              return s;
            })
            .join('');
          const row = `<div class="rw"><span>${esc(r.n)}</span><span class="st">${stars}</span><span class="sc" style="--d:${d.toFixed(2)}s">${r.v.toFixed(1)}</span></div>`;
          d += 0.12;
          return row;
        })
        .join('');
      return `<div class="g"><div class="tot" style="--td:${d.toFixed(2)}s"><span>綜合</span><b>${avg.toFixed(1)}</b></div>${html}</div>`;
    },
  },
  {
    ...base,
    id: 'estate-progress',
    no: 282,
    cat: 'estate',
    zh: '工程進度',
    en: 'Construction Progress',
    desc: '建案里程碑時間軸，進度條走到「目前」那一格並閃動',
    tags: ['房產', '建案', '時間軸'],
    tone: 'ink',
    sample: ['開工', '結構封頂', '*外牆完成', '取得使照', '交屋'],
    hint: '一行一個里程碑，目前階段前面加 *；進度請以建照、使照或建商公告為準',
    motion: '直式畫面是由上往下、橫式是由左往右的里程碑時間軸：灰色軌道上依序彈出圓點與里程碑名稱，主色進度條從第一格往前長到標了 * 的「目前」階段；已完成的圓點變成實心主色並畫上勾，目前階段的圓點外圈持續擴散脈衝、旁邊貼一張「目前」小標籤；之後的階段維持空心。',
    motionEn: 'A milestone timeline runs top to bottom in portrait and left to right in landscape: dots and milestone names pop in along a grey track, then an accent progress bar grows from the first milestone to the one marked with * as current; completed dots turn solid accent with a check, the current dot pulses with expanding rings and gets a small "Now" tag; later milestones stay hollow.',
    css: `
.S .g{display:flex;flex-direction:column;gap:7cqh;padding-left:10cqw;width:min(80cqw,160cqh)}
.S .m{position:relative;display:flex;align-items:center;gap:3cqw;font-size:5.4cqw;opacity:0;animation:K_m 6s cubic-bezier(.3,1.6,.5,1) infinite both;animation-delay:calc(var(--i)*.12s)}
.S .sg{position:absolute;left:calc(-10cqw + 2.9cqw);top:50%;width:1.2cqw;height:calc(100% + 7cqh);background:var(--mu)}
.S .sg b{display:block;width:100%;height:100%;background:var(--ac);transform-origin:50% 0;transform:scaleY(0);animation:K_sg 6s cubic-bezier(.6,0,.3,1) infinite both;animation-delay:calc(.8s + var(--i)*.35s)}
.S .m:last-child .sg{display:none}
.S .dt{position:absolute;left:-10cqw;top:50%;width:7cqw;height:7cqw;margin-top:-3.5cqw;border-radius:50%;border:1cqw solid var(--fg);background:var(--bg);display:grid;place-items:center;z-index:1}
.S .m.done .dt{background:var(--ac);border-color:var(--ac)}
.S .m.done .dt svg{width:4cqw;height:4cqw}
.S .m.now .dt{border-color:var(--ac)}
.S .m.now .dt::after{content:'';position:absolute;inset:-1cqw;border-radius:50%;border:.6cqw solid var(--ac);animation:K_pu 1.4s ease-out infinite}
.S .m.now b{color:var(--ac)}
.S .nw{background:var(--ac);color:var(--bg);font-size:3.2cqw;padding:.8cqw 1.8cqw;white-space:nowrap}
.S .m.todo{--o:.55}
@container (min-aspect-ratio:1/1){
.S .g{flex-direction:row;padding:0;gap:0;width:88cqw}
.S .m{flex:1;flex-direction:column;align-items:flex-start;padding-top:10cqw;gap:1.4cqw;font-size:3.4cqw;padding-right:2cqw}
.S .dt{left:0;top:0;margin-top:0}
.S .sg{left:3.5cqw;top:2.9cqw;width:100%;height:1.2cqw}
.S .sg b{transform-origin:0 50%;transform:scaleX(0);animation-name:K_sgx}
.S .nw{font-size:2.4cqw}}
@keyframes K_m{0%{opacity:0;transform:scale(.6)}6%,94%{opacity:var(--o,1);transform:none}100%{opacity:0}}
@keyframes K_sg{0%{transform:scaleY(0)}6%,94%{transform:none}100%{transform:scaleY(0)}}
@keyframes K_sgx{0%{transform:scaleX(0)}6%,94%{transform:none}100%{transform:scaleX(0)}}
@keyframes K_pu{0%{transform:scale(1);opacity:1}100%{transform:scale(1.9);opacity:0}}`,
    html: (w) => {
      const ws = (w.filter(Boolean).length ? w.filter(Boolean) : ['開工', '結構封頂', '*外牆完成', '取得使照', '交屋']).slice(0, 7);
      let cur = ws.findIndex((x) => /^\s*[*＊]/.test(x));
      if (cur < 0) cur = 0;
      const check = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="var(--bg)" stroke-width="3.4"/></svg>';
      const ms = ws
        .map((x, i) => {
          const t = x.replace(/^\s*[*＊]\s*/, '');
          const cls = i < cur ? 'done' : i === cur ? 'now' : 'todo';
          return `<div class="m ${cls}" style="--i:${i}"><i class="sg">${i < cur ? '<b></b>' : ''}</i><i class="dt">${i < cur ? check : ''}</i><b>${esc(t)}</b>${i === cur ? '<span class="nw">目前</span>' : ''}</div>`;
        })
        .join('');
      return `<div class="g">${ms}</div>`;
    },
  },
];
