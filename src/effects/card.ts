import type { Fx } from '../types';
import { esc, pick } from '../util';

export const card: Fx[] = [
  {
    id: 'chapter-card',
    no: 45,
    cat: 'card',
    zh: '章節卡',
    en: 'Chapter Card',
    desc: '大號章節編號加標題，段落分隔用',
    tags: ['章節', '長片'],
    tone: 'ink',
    sample: ['02', '通勤實測'],
    hint: '編號 / 章節名',
    motion: '左側超大描邊數字由下滑入，右側先畫出一條主色短橫線，再由下而上露出小字「CHAPTER」與大字章節名；停留後整組往左滑出。',
    motionEn: 'A huge outlined number slides up on the left; on the right an accent dash draws in, then a small "CHAPTER" label and the large chapter title rise into view; after a hold the group slides out to the left.',
    css: `
.S .g{display:flex;align-items:center;gap:4cqw;animation:K_out 4.4s cubic-bezier(.7,0,.2,1) infinite}
.S .num{font-size:28cqw;color:transparent;-webkit-text-stroke:.3cqw var(--ac);line-height:.8;font-family:var(--mono);overflow:hidden}
.S .num span{display:block;animation:K_up 4.4s cubic-bezier(.2,.8,.1,1) infinite both}
.S .r{display:flex;flex-direction:column;gap:1.4cqw}
.S .dash{width:8cqw;height:.6cqw;background:var(--ac);transform-origin:0 50%;animation:K_dash 4.4s cubic-bezier(.7,0,.2,1) infinite both}
.S .m{overflow:hidden}
.S .lb{font-size:2.6cqw;letter-spacing:.4em;opacity:.6;font-weight:500}
.S .ti{font-size:9cqw}
.S .m span{display:block;animation:K_up 4.4s cubic-bezier(.2,.8,.1,1) infinite both;animation-delay:calc(.2s + var(--i)*.1s)}
@keyframes K_up{0%{transform:translateY(110%)}20%,100%{transform:none}}
@keyframes K_dash{0%,8%{transform:scaleX(0)}22%,100%{transform:none}}
@keyframes K_out{0%,82%{transform:none;opacity:1}96%,100%{transform:translateX(-20cqw);opacity:0}}`,
    html: (w) => {
      const [n, t] = pick(w, 2, ['02', '通勤實測']);
      return `<div class="g"><div class="num"><span>${esc(n)}</span></div><div class="r"><div class="dash"></div><div class="m lb"><span style="--i:0">CHAPTER</span></div><div class="m ti"><span style="--i:1">${esc(t)}</span></div></div></div>`;
    },
  },
  {
    id: 'big-number',
    no: 41,
    cat: 'card',
    zh: '數字大字報',
    en: 'Big Number',
    desc: '超大數字快速跳到目標值',
    tags: ['數據', '重點'],
    tone: 'accent',
    sample: ['3', '分鐘', '步行到捷運站'],
    hint: '數字 / 單位 / 說明（數字請用可查證的資料）',
    motion: '畫面中央一個超大數字從 0 快速計數到目標值（緩出，約 1.2 秒），右下角接單位小字，下方一行說明文字在數字停下後淡入；數字停下瞬間輕微放大回彈。',
    motionEn: 'A huge number counts up from 0 to its target at the center (ease-out, about 1.2s), the unit tucked at its lower right and a caption line fading in below once it settles; the number bumps slightly in scale as it lands.',
    css: `
.S .g{display:flex;flex-direction:column;align-items:center;color:#111}
.S .row{display:flex;align-items:baseline;gap:1cqw}
.S .n{font-size:30cqw;line-height:.85;font-family:var(--mono);font-weight:700;letter-spacing:-.04em}
.S .n.land{animation:K_l .4s cubic-bezier(.3,1.8,.5,1)}
.S .u{font-size:6cqw}
.S .cap{font-size:3.6cqw;font-weight:500;margin-top:2cqw;opacity:0;transition:opacity .5s}
.S .cap.on{opacity:1}
@keyframes K_l{0%{transform:scale(1.12)}}`,
    html: (w) => {
      const [n, u, c] = pick(w, 3, ['3', '分鐘', '步行到捷運站']);
      return `<div class="g"><div class="row"><div class="n" data-to="${esc(n)}">0</div><div class="u">${esc(u)}</div></div><div class="cap">${esc(c)}</div></div>`;
    },
    run: (root) => {
      const el = root.querySelector<HTMLElement>('.n')!;
      const cap = root.querySelector('.cap')!;
      const raw = el.dataset.to || '0';
      const to = parseFloat(raw.replace(/,/g, '')) || 0;
      const dec = (raw.split('.')[1] || '').length;
      const comma = raw.includes(',');
      let raf = 0;
      let t = 0;
      let alive = true;
      const fmt = (v: number) => {
        const s = v.toFixed(dec);
        return comma ? Number(s).toLocaleString('en-US', { minimumFractionDigits: dec }) : s;
      };
      const go = () => {
        if (!alive) return;
        cap.classList.remove('on');
        el.classList.remove('land');
        const start = performance.now();
        const f = (now: number) => {
          if (!alive) return;
          const p = Math.min(1, (now - start) / 1200);
          // 不是數字（例如還沒填的 ○）就直接顯示原字，不跑計數
          el.textContent = /^[\d,.]+$/.test(raw.trim()) ? fmt(to * (1 - Math.pow(1 - p, 3))) : raw;
          if (p < 1) raf = requestAnimationFrame(f);
          else {
            el.textContent = raw;
            el.classList.add('land');
            cap.classList.add('on');
            t = window.setTimeout(go, 2600);
          }
        };
        raf = requestAnimationFrame(f);
      };
      go();
      return () => {
        alive = false;
        cancelAnimationFrame(raf);
        clearTimeout(t);
      };
    },
  },
  {
    id: 'quote-card',
    no: 49,
    cat: 'card',
    zh: '金句卡',
    en: 'Quote Card',
    desc: '大引號加上一行行浮現的金句',
    tags: ['金句', '分享'],
    tone: 'paper',
    sample: ['買房不是終點', '是生活的起點', '— 持家男子 KC'],
    hint: '2–3 行，最後一行為出處',
    motion: '左上角巨大的主色引號先旋轉彈入，接著金句以明體逐行由下淡入（每行間隔 0.3 秒），最後出處以小字從右側滑入；停留後整張卡淡出。',
    motionEn: 'A giant accent quotation mark spins and pops in at the top left; the quote then fades up line by line in a serif face (0.3s apart), and the attribution slides in small from the right; after a hold the whole card fades out.',
    css: `
.S .g{position:relative;padding:4cqw 6cqw;color:#111;animation:K_o 5s ease infinite}
.S .q{position:absolute;left:-1cqw;top:-8cqw;font-size:22cqw;color:var(--ac);font-family:var(--serif);line-height:1;animation:K_q 5s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .l{font-family:var(--serif);font-size:6.4cqw;line-height:1.35;animation:K_l 5s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(.3s + var(--i)*.3s)}
.S .by{font-size:2.8cqw;font-weight:500;opacity:.6;margin-top:2cqw;text-align:right;animation:K_b 5s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:1.1s}
@keyframes K_q{0%{transform:scale(0) rotate(-40deg)}10%,100%{transform:none}}
@keyframes K_l{0%{opacity:0;transform:translateY(40%)}14%,100%{opacity:1;transform:none}}
@keyframes K_b{0%{opacity:0;transform:translateX(10%)}14%,100%{opacity:.6;transform:none}}
@keyframes K_o{0%,85%{opacity:1}97%,100%{opacity:0}}`,
    html: (w) => {
      const by = w.length > 1 && /^[—-]/.test(w[w.length - 1]) ? w[w.length - 1] : '';
      const lines = by ? w.slice(0, -1) : w;
      return `<div class="g"><div class="q">“</div>${lines.slice(0, 3).map((t, i) => `<div class="l" style="--i:${i}">${esc(t)}</div>`).join('')}${by ? `<div class="by">${esc(by)}</div>` : ''}</div>`;
    },
  },
  {
    id: 'versus',
    no: 42,
    cat: 'card',
    zh: '對決 VS',
    en: 'Versus Split',
    desc: '左右對比，中間 VS 砸下來',
    tags: ['比較', '二選一'],
    tone: 'ink',
    sample: ['新成屋', '預售屋'],
    hint: '2 個選項',
    motion: '畫面以斜線切成左右兩半，左半主色、右半白色，兩個選項分別從左右兩側衝入；中間圓形「VS」徽章從 3 倍大砸下並讓畫面震動，斜切線閃一道白光。',
    motionEn: 'The frame splits diagonally: accent on the left, white on the right; the two options charge in from each side, then a round "VS" badge slams down from 3x scale with a screen shake while a white flash runs along the diagonal seam.',
    css: `
.S{animation:K_sh 4.4s infinite}
.S .L,.S .R{position:absolute;inset:0;display:grid;align-items:center;font-size:8cqw}
.S .L{background:var(--ac);color:#111;clip-path:polygon(0 0,56% 0,44% 100%,0 100%);padding-left:8cqw;justify-items:start}
.S .R{background:#f4f1e8;color:#111;clip-path:polygon(56% 0,100% 0,100% 100%,44% 100%);padding-right:8cqw;justify-items:end}
.S .L span{animation:K_l 4.4s cubic-bezier(.2,.9,.2,1) infinite both}
.S .R span{animation:K_r 4.4s cubic-bezier(.2,.9,.2,1) infinite both}
.S .vs{position:relative;z-index:2;width:16cqw;height:16cqw;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-size:6cqw;font-style:italic;border:.8cqw solid #fff;animation:K_vs 4.4s cubic-bezier(.5,0,.5,1.5) infinite both}
@keyframes K_l{0%{transform:translateX(-100cqw)}14%,88%{transform:none}100%{transform:translateX(-100cqw)}}
@keyframes K_r{0%{transform:translateX(100cqw)}14%,88%{transform:none}100%{transform:translateX(100cqw)}}
@keyframes K_vs{0%,16%{transform:scale(3);opacity:0}26%,86%{transform:none;opacity:1}96%,100%{transform:scale(0);opacity:0}}
@keyframes K_sh{0%,25%,33%,100%{transform:none}27%{transform:translate(1%,1%)}29%{transform:translate(-1%,-.6%)}31%{transform:translate(.5%,.3%)}}`,
    html: (w) => {
      const [a, b] = pick(w, 2, ['新成屋', '預售屋']);
      return `<div class="L"><span>${esc(a)}</span></div><div class="R"><span>${esc(b)}</span></div><div class="vs">VS</div>`;
    },
  },
  {
    id: 'checklist',
    no: 43,
    cat: 'card',
    zh: '清單打勾',
    en: 'Checklist',
    desc: '項目一條條出現並打勾',
    tags: ['重點整理', '懶人包'],
    tone: 'paper',
    sample: ['看屋前必查', '建商過往評價', '周邊嫌惡設施', '通勤實際時間'],
    hint: '標題 + 3–5 項',
    motion: '白色清單卡：標題先出現，每一項依序從左滑入，項目前的方框接著被主色勾勾「畫」上（SVG 描邊動畫），打勾後文字微微變淡；全部完成後停留再重來。',
    motionEn: 'A white checklist card: the title appears, then each item slides in from the left and its checkbox gets an accent tick drawn in (SVG stroke animation), after which the item text dims slightly; once all are done it holds and restarts.',
    css: `
.S .cd{background:#fff;color:#111;border-radius:2cqw;padding:3.4cqw 4.6cqw;box-shadow:0 1.5cqw 4cqw #0002;min-width:50cqw}
.S h3{margin:0 0 2cqw;font-size:5cqw}
.S .it{display:flex;align-items:center;gap:1.8cqw;font-size:3.8cqw;font-weight:500;padding:.9cqw 0;animation:K_in 6s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(var(--i)*.6s)}
.S .bx{width:3.6cqw;height:3.6cqw;border:.35cqw solid #111;border-radius:.6cqw;flex:none;position:relative}
.S .bx svg{position:absolute;inset:-30%;width:160%;height:160%;overflow:visible}
.S .bx path{fill:none;stroke:var(--ac);stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:40;stroke-dashoffset:40;animation:K_ck 6s ease-out infinite;animation-delay:calc(var(--i)*.6s + .3s)}
.S .it span{animation:K_dim 6s infinite;animation-delay:calc(var(--i)*.6s + .3s)}
@keyframes K_in{0%{opacity:0;transform:translateX(-6%)}6%,92%{opacity:1;transform:none}100%{opacity:0}}
@keyframes K_ck{0%,2%{stroke-dashoffset:40}8%,100%{stroke-dashoffset:0}}
@keyframes K_dim{0%,6%{opacity:1}10%,100%{opacity:.55}}`,
    html: (w) => {
      const [title, ...items] = w;
      return `<div class="cd"><h3>${esc(title)}</h3>${items
        .slice(0, 5)
        .map(
          (t, i) =>
            `<div class="it" style="--i:${i}"><div class="bx"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div><span>${esc(t)}</span></div>`,
        )
        .join('')}</div>`;
    },
  },
  {
    id: 'countdown',
    no: 23,
    cat: 'card',
    zh: '倒數',
    en: 'Countdown',
    desc: '3、2、1 搭配圓環倒數',
    tags: ['開場', '揭曉'],
    tone: 'ink',
    sample: ['3', 'GO!'],
    hint: '起始數字 / 結尾字',
    motion: '大數字在主色圓環中央，圓環每秒順時針消耗一圈，數字每秒以縮放彈入替換（3→2→1），最後換成結尾字並爆開放大淡出。',
    motionEn: 'A large number sits inside an accent ring; the ring depletes clockwise once per second while the number pops in fresh each second (3→2→1), finally replaced by the closing word, which bursts larger and fades out.',
    css: `
.S .ring{position:absolute;width:44cqmin;height:44cqmin}
.S .ring circle{fill:none;stroke-width:3}
.S .ring .bg{stroke:color-mix(in srgb,var(--fg) 15%,transparent)}
.S .ring .fg{stroke:var(--ac);stroke-dasharray:283;stroke-linecap:round;transform:rotate(-90deg);transform-origin:50% 50%}
.S .ring .fg.go{animation:K_r 1s linear}
.S .n{font-size:26cqmin;font-family:var(--mono);font-weight:700}
.S .n.pop{animation:K_p .5s cubic-bezier(.3,1.7,.5,1)}
.S .n.end{color:var(--ac);font-family:var(--sans);font-size:18cqmin;animation:K_e 1.2s ease-out forwards}
@keyframes K_r{from{stroke-dashoffset:0}to{stroke-dashoffset:283}}
@keyframes K_p{from{transform:scale(1.6);opacity:0}}
@keyframes K_e{0%{transform:scale(.5)}30%{transform:scale(1.1)}70%{transform:scale(1.1);opacity:1}100%{transform:scale(2.4);opacity:0}}`,
    html: () =>
      `<svg class="ring" viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="45"/><circle class="fg" cx="50" cy="50" r="45"/></svg><div class="n"></div>`,
    run: (root, w) => {
      const n = root.querySelector<HTMLElement>('.n')!;
      const fg = root.querySelector('.fg')!;
      const from = Math.max(1, Math.min(9, parseInt(w[0], 10) || 3));
      const end = w[1] || 'GO!';
      let k = from;
      let t = 0;
      const tick = () => {
        n.className = 'n';
        fg.classList.remove('go');
        void n.offsetWidth;
        if (k > 0) {
          n.textContent = String(k);
          n.classList.add('pop');
          fg.classList.add('go');
          k--;
          t = window.setTimeout(tick, 1000);
        } else {
          n.textContent = end;
          n.classList.add('end');
          k = from;
          t = window.setTimeout(tick, 1600);
        }
      };
      tick();
      return () => clearTimeout(t);
    },
  },
  {
    id: 'timeline',
    no: 44,
    cat: 'card',
    zh: '時間軸',
    en: 'Timeline',
    desc: '線條延伸，節點與事件依序出現',
    tags: ['進度', '歷程'],
    tone: 'paper',
    sample: ['2019｜土地取得', '2021｜開工', '2023｜結構完成', '2025｜交屋'],
    hint: '「年份｜事件」3–5 個',
    motion: '一條水平線由左往右延伸，每到一個節點，圓點以彈性放大出現，年份在上、事件在下淡入；最後一個節點用主色並帶脈動光圈。',
    motionEn: 'A horizontal line extends left to right; at each node a dot pops in with a spring, the year fading in above and the event below; the final node uses the accent color with a pulsing halo.',
    css: `
.S .tl{position:relative;width:80cqw;display:flex;justify-content:space-between;color:#111}
.S .ln{position:absolute;left:0;right:0;top:50%;height:.4cqw;background:#111;transform-origin:0 50%;animation:K_ln 6s cubic-bezier(.6,0,.4,1) infinite both}
.S .nd{position:relative;display:flex;flex-direction:column;align-items:center;gap:1.4cqw;width:0;animation:K_nd 6s infinite both;animation-delay:calc(var(--i)*var(--step))}
.S .yr{font-size:3.6cqw;font-family:var(--mono);font-weight:700;white-space:nowrap}
.S .dot{width:3cqw;height:3cqw;border-radius:50%;background:#111;border:.6cqw solid var(--bg);box-sizing:content-box}
.S .nd:last-child .dot{background:var(--ac);box-shadow:0 0 0 0 var(--ac);animation:K_pl 1.2s infinite}
.S .ev{font-size:3cqw;font-weight:500;white-space:nowrap}
@keyframes K_ln{0%{transform:scaleX(0)}55%,100%{transform:none}}
@keyframes K_nd{0%{opacity:0;transform:scale(.4)}6%,90%{opacity:1;transform:none}100%{opacity:0}}
@keyframes K_pl{70%{box-shadow:0 0 0 2cqw transparent}}`,
    html: (w) => {
      const items = w.slice(0, 5);
      const step = (3.3 / Math.max(1, items.length - 1)).toFixed(2);
      return `<div class="tl"><div class="ln"></div>${items
        .map((t, i) => {
          const [y, e] = t.includes('｜') ? t.split('｜') : [t, ''];
          return `<div class="nd" style="--i:${i};--step:${step}s"><div class="yr">${esc(y)}</div><div class="dot"></div><div class="ev">${esc(e ?? '')}</div></div>`;
        })
        .join('')}</div>`;
    },
  },
  {
    id: 'progress-bar',
    no: 47,
    cat: 'card',
    zh: '進度條',
    en: 'Progress Bar',
    desc: '進度條填滿，百分比同步跳動',
    tags: ['數據', '進度'],
    tone: 'ink',
    sample: ['工程進度', '68%'],
    hint: '標題 / 百分比',
    motion: '標題在左上、百分比數字在右上，下方粗圓角進度條由 0 填到目標百分比（主色、帶斜紋流動），百分比數字同步計數；到位後進度條末端閃一下光。',
    motionEn: 'Title at top left, percentage at top right; below, a thick rounded progress bar fills from 0 to the target (accent color with moving diagonal stripes) while the number counts in sync; when it lands, the bar tip flashes.',
    css: `
.S .g{width:70cqw;display:flex;flex-direction:column;gap:2cqw}
.S .hd{display:flex;justify-content:space-between;align-items:baseline}
.S .ti{font-size:4.6cqw}.S .pc{font-size:8cqw;font-family:var(--mono);color:var(--ac);counter-reset:p var(--pv);--pv:0}
.S .pc::after{content:counter(p) '%'}
.S .pc{animation:K_c 4.5s cubic-bezier(.3,0,.2,1) infinite}
.S .tr{height:4cqw;border-radius:99px;background:color-mix(in srgb,var(--fg) 12%,transparent);overflow:hidden}
.S .fl{height:100%;width:var(--to);border-radius:99px;background:repeating-linear-gradient(-45deg,var(--ac) 0 1.5cqw,color-mix(in srgb,var(--ac) 75%,#fff) 1.5cqw 3cqw);background-size:4.24cqw 100%;transform-origin:0 50%;animation:K_f 4.5s cubic-bezier(.3,0,.2,1) infinite,K_s .6s linear infinite}
@property --pv{syntax:'<integer>';inherits:false;initial-value:0}
@keyframes K_c{0%{--pv:0}55%,90%{--pv:var(--target)}100%{--pv:0}}
@keyframes K_f{0%{transform:scaleX(0)}55%,90%{transform:none}100%{transform:scaleX(0)}}
@keyframes K_s{to{background-position:4.24cqw 0}}`,
    html: (w) => {
      const [t, p] = pick(w, 2, ['工程進度', '68%']);
      const v = Math.max(0, Math.min(100, parseInt(p, 10) || 0));
      return `<div class="g" style="--to:${v}%"><div class="hd"><div class="ti">${esc(t)}</div><div class="pc" style="--target:${v}"></div></div><div class="tr"><div class="fl"></div></div></div>`;
    },
  },
  {
    id: 'ranking',
    no: 48,
    cat: 'card',
    zh: '排行榜',
    en: 'Ranking Bars',
    desc: '長條依序長出來，第一名最後揭曉',
    tags: ['比較', 'TOP 3'],
    tone: 'paper',
    sample: ['通勤時間比較', 'A 社區｜35', 'B 社區｜28', 'C 社區｜18'],
    hint: '標題 + 「名稱｜數值」3–5 個',
    motion: '標題在上，每列左側名稱、右側水平長條由 0 長到對應比例並在末端顯示數值，由最後一名往第一名依序揭曉，第一名長條用主色並帶皇冠圖示彈出。',
    motionEn: 'Title on top; each row has a name on the left and a horizontal bar growing from 0 to its proportional length with the value at its tip, revealed from last place up to first; the winner\'s bar is in the accent color and a crown icon pops in.',
    css: `
.S .g{width:76cqw;color:#111}
.S h3{margin:0 0 2.4cqw;font-size:4.6cqw}
.S .rw{display:grid;grid-template-columns:16cqw 1fr;align-items:center;gap:2cqw;margin:1.4cqw 0;font-size:3.4cqw;font-weight:700}
.S .br{height:5cqw;background:#111;border-radius:.8cqw;width:var(--w);transform-origin:0 50%;display:flex;align-items:center;justify-content:flex-end;padding-right:1.4cqw;color:#fff;font-family:var(--mono);animation:K_g 6s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(var(--d)*.5s)}
.S .rw.top .br{background:var(--ac);color:#111}
.S .cr{margin-left:1cqw;animation:K_cr 6s cubic-bezier(.3,1.8,.5,1) infinite both;animation-delay:calc(var(--d)*.5s + .5s)}
@keyframes K_g{0%{transform:scaleX(0)}12%,90%{transform:none}100%{transform:scaleX(0)}}
@keyframes K_cr{0%{transform:scale(0) rotate(-30deg)}8%,88%{transform:none}96%,100%{transform:scale(0)}}`,
    html: (w) => {
      const [title, ...rows] = w;
      const data = rows.slice(0, 5).map((r) => {
        const [n, v] = r.includes('｜') ? r.split('｜') : [r, '0'];
        return { n, v: parseFloat(v) || 0, raw: v };
      });
      const max = Math.max(...data.map((d) => d.v), 1);
      const order = [...data].sort((a, b) => a.v - b.v);
      return `<div class="g"><h3>${esc(title)}</h3>${data
        .map((d) => {
          const isTop = d === order[order.length - 1];
          return `<div class="rw${isTop ? ' top' : ''}"><div>${esc(d.n)}</div><div style="display:flex;align-items:center"><div class="br" style="--w:${((d.v / max) * 85).toFixed(1)}%;--d:${order.indexOf(d)}">${esc(String(d.raw))}</div>${isTop ? `<span class="cr" style="--d:${order.indexOf(d)}">👑</span>` : ''}</div></div>`;
        })
        .join('')}</div>`;
    },
  },
  {
    id: 'qa-card',
    no: 46,
    cat: 'card',
    zh: '問答卡',
    en: 'Q&A Card',
    desc: 'Q 先丟出問題，翻面揭曉 A',
    tags: ['QA', '互動'],
    tone: 'accent',
    sample: ['預售屋可以殺價嗎？', '可以，但要看時機'],
    hint: '問題 / 答案',
    motion: '一張大卡片正面是黑色大寫「Q」與問題，停留 1.5 秒後卡片繞 Y 軸 3D 翻面，背面是白底的「A」與答案；停留後再翻回來。',
    motionEn: 'A large card shows a big black "Q" with the question on its front; after 1.5s it flips around the Y axis in 3D to reveal a white back with "A" and the answer; after a hold it flips back.',
    css: `
.S{perspective:120cqw}
.S .cd{position:relative;width:70cqw;height:34cqw;transform-style:preserve-3d;animation:K_f 6s cubic-bezier(.6,-0.2,.3,1.2) infinite}
.S .fc{position:absolute;inset:0;display:flex;align-items:center;gap:4cqw;padding:0 5cqw;border-radius:2.4cqw;background:#111;color:#fff;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 2cqw 5cqw #0004}
.S .fc+.fc{background:#fff;color:#111;transform:rotateY(180deg)}
.S .fc b{font-size:16cqw;font-family:var(--mono);color:var(--ac)}
.S .fc+.fc b{color:#111}
.S .fc span{font-size:5cqw;line-height:1.3}
@keyframes K_f{0%,30%{transform:rotateY(0)}42%,85%{transform:rotateY(180deg)}97%,100%{transform:rotateY(360deg)}}`,
    html: (w) => {
      const [q, a] = pick(w, 2, ['預售屋可以殺價嗎？', '可以，但要看時機']);
      return `<div class="cd"><div class="fc"><b>Q</b><span>${esc(q)}</span></div><div class="fc"><b>A</b><span>${esc(a)}</span></div></div>`;
    },
  },
];
