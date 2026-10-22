import type { Fx } from '../types';
import { esc, pick, rep } from '../util';

export const switching: Fx[] = [
  {
    id: 'split-flap',
    no: 52,
    cat: 'switch',
    zh: '翻牌',
    en: 'Split Flap',
    desc: '像車站時刻表一樣翻到定位',
    tags: ['復古', '車站'],
    tone: 'ink',
    sample: ['往板橋', '往淡水', '往南港'],
    hint: '多個等長的詞',
    motion: '仿機場／車站翻牌看板：每格一個字，上下兩半，切換時每格快速亂翻 6–10 次隨機字後停在目標字，格與格之間有 0.05 秒錯開；停留 1.5 秒後翻到下一個詞。',
    motionEn: 'A split-flap departure board: one glyph per tile split into upper and lower halves; on change, each tile rapidly flips through 6–10 random glyphs before landing on the target, staggered 0.05s per tile; hold 1.5s, then flip to the next word.',
    css: `
.S .board{display:flex;gap:1cqw}
.S .tile{position:relative;width:13cqw;height:17cqw;background:#1c1c1c;border-radius:1cqw;display:grid;place-items:center;font-size:11cqw;color:#f4f1e8;box-shadow:inset 0 -.4cqw 0 #0006,0 .6cqw 1.2cqw #0008;overflow:hidden}
.S .tile::after{content:'';position:absolute;left:0;right:0;top:50%;height:.25cqw;background:#000}
.S .tile.flip{animation:K_fl .08s linear}
@keyframes K_fl{50%{transform:scaleY(.82);filter:brightness(.7)}}`,
    html: (w) => `<div class="board">${rep(Math.max(...w.map((t) => Array.from(t).length)), () => '<div class="tile"></div>')}</div>`,
    run: (root, w) => {
      const tiles = Array.from(root.querySelectorAll<HTMLElement>('.tile'));
      const pool = '的一是在不了有和人這中大為上個國我以要他時來用們生到作地於出就分對成會可主發年動同工也能下過子說產種面而方後多定行學法所民得經十三之進著等部度家電力裡如水化高自二理起小物現實加量都兩體制機當使點從業本去把性好應開它合還因由其些然前外天政四日那社義事平形相全表間樣與關各重新線內數正心反你明看原又麼利比或但質氣第向道命此變條只沒結解問意建月公無系軍很情者最立代想已通並提直題黨程展五果料象員革位入常文總次品式活設及管特件長求老頭基資邊流路級少圖山統接知較將組見計別她手角期根論運農指幾九區強放決西被幹做必戰先回則任取據處府研';
      let k = 0;
      let alive = true;
      const timers: number[] = [];
      const show = () => {
        if (!alive) return;
        const target = Array.from(w[k % w.length]);
        tiles.forEach((tile, i) => {
          const final = target[i] ?? '';
          let n = 6 + Math.floor(Math.random() * 5);
          const step = () => {
            if (!alive) return;
            tile.classList.remove('flip');
            void tile.offsetWidth;
            tile.classList.add('flip');
            tile.textContent = n-- > 0 ? pool[Math.floor(Math.random() * pool.length)] : final;
            if (n >= 0) timers.push(window.setTimeout(step, 70));
          };
          timers.push(window.setTimeout(step, i * 50));
        });
        k++;
        timers.push(window.setTimeout(show, 2600));
      };
      show();
      return () => {
        alive = false;
        timers.forEach(clearTimeout);
      };
    },
  },
  {
    id: 'flip-cards',
    no: 56,
    cat: 'switch',
    zh: '翻卡',
    en: 'Flip Cards',
    desc: '一張張翻面換字',
    tags: ['切換', '公告'],
    tone: 'accent',
    sample: ['月光下', '星空裡'],
    hint: '2 個等長的詞',
    motion: '每個字是一張深色圓角卡片，卡片依序繞 X 軸 3D 翻轉 180 度，正面是第一個詞、背面是第二個詞，間隔 0.12 秒；停留後再翻回來，循環。',
    motionEn: 'Each glyph sits on a dark rounded card; cards flip 180 degrees around the X axis in 3D one after another, front showing the first word and back the second, 0.12s apart; hold, then flip back, looping.',
    css: `
.S .row{display:flex;gap:2cqw;perspective:80cqw}
.S .card{position:relative;width:16cqw;height:19cqw;transform-style:preserve-3d;animation:K_f 4s cubic-bezier(.6,-0.2,.3,1.3) infinite;animation-delay:calc(var(--i)*.12s)}
.S .card b{position:absolute;inset:0;display:grid;place-items:center;background:#1d1d1d;color:#fff;border-radius:2cqw;font-size:12cqw;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.S .card b+b{transform:rotateX(180deg);background:#fff;color:#111}
@keyframes K_f{0%,30%{transform:rotateX(0)}45%,80%{transform:rotateX(180deg)}95%,100%{transform:rotateX(360deg)}}`,
    html: (w) => {
      const [a, b] = pick(w, 2, ['月光下', '星空裡']).map((t) => Array.from(t));
      const n = Math.max(a.length, b.length);
      return `<div class="row">${rep(n, (i) => `<div class="card" style="--i:${i}"><b>${esc(a[i] ?? '')}</b><b>${esc(b[i] ?? '')}</b></div>`)}</div>`;
    },
  },
  {
    id: 'typewriter',
    no: 37,
    cat: 'switch',
    zh: '打字機',
    en: 'Typewriter',
    desc: '一個字一個字打出來再換掉',
    tags: ['故事', '字幕'],
    tone: 'paper',
    sample: ['今天要帶大家', '去看一間房子', '先說結論'],
    hint: '多句短句',
    motion: '文字以每字 0.09 秒的速度逐字打出，後方有閃爍的直線游標；整句打完停留 1.2 秒，再以較快速度逐字刪除，換下一句，循環。',
    motionEn: 'Text types out one character every 0.09s with a blinking bar caret; after the full line holds for 1.2s, it deletes character by character at a faster pace, then types the next line, looping.',
    css: `
.S .t{font-size:7cqw;font-weight:700;display:flex;align-items:center;white-space:pre}
.S .cur{display:inline-block;width:.6cqw;height:8cqw;background:var(--ac);margin-left:.6cqw;animation:K_b .9s steps(1) infinite}
@keyframes K_b{50%{opacity:0}}`,
    html: () => `<div class="t"><span class="tx"></span><span class="cur"></span></div>`,
    run: (root, w) => {
      const el = root.querySelector('.tx')!;
      let alive = true;
      let t = 0;
      let line = 0;
      let i = 0;
      let dir = 1;
      const tick = () => {
        if (!alive) return;
        const s = Array.from(w[line % w.length]);
        if (dir > 0) {
          i++;
          el.textContent = s.slice(0, i).join('');
          if (i >= s.length) {
            dir = -1;
            t = window.setTimeout(tick, 1200);
            return;
          }
          t = window.setTimeout(tick, 90);
        } else {
          i--;
          el.textContent = s.slice(0, i).join('');
          if (i <= 0) {
            dir = 1;
            line++;
            t = window.setTimeout(tick, 350);
            return;
          }
          t = window.setTimeout(tick, 40);
        }
      };
      tick();
      return () => {
        alive = false;
        clearTimeout(t);
      };
    },
  },
  {
    id: 'slot-reel',
    no: 85,
    cat: 'switch',
    zh: '拉霸',
    en: 'Slot Text',
    desc: '滾輪轉一轉停下來',
    tags: ['結果揭曉', '抽獎'],
    tone: 'paper',
    sample: ['大吉', '吉', '凶', '中獎', '再來'],
    hint: '第一個詞是最終結果（會逐字停在這裡）',
    motion: '像拉霸機：每個字位於一個深色圓角視窗中，字串在視窗內垂直高速滾動（帶動態模糊），由左到右依序減速停下，最後拼出結果詞；停下時有輕微回彈，循環。',
    motionEn: 'Like a slot machine: each glyph sits in a dark rounded window; reels spin vertically at high speed with motion blur, then decelerate and stop left to right to spell the result word, with a slight bounce on landing, looping.',
    css: `
.S .row{display:flex;gap:2cqw}
.S .win{width:15cqw;height:18cqw;background:#1d1d1d;border-radius:2cqw;overflow:hidden;box-shadow:inset 0 2cqw 2cqw -1cqw #000a,inset 0 -2cqw 2cqw -1cqw #000a}
.S .reel{display:flex;flex-direction:column;animation:K_s 3.6s cubic-bezier(.3,0,.25,1.06) infinite;animation-delay:calc(var(--i)*.25s)}
.S .reel span{height:18cqw;display:grid;place-items:center;font-size:12cqw;color:#fff;flex:none}
.S .reel span:last-child{color:var(--ac)}
@keyframes K_s{0%{transform:translateY(0);filter:blur(0)}15%{filter:blur(.4cqw)}50%,90%{transform:translateY(calc(-18cqw * 15));filter:blur(0)}100%{transform:translateY(calc(-18cqw * 15));opacity:0}}`,
    html: (w) => {
      const target = Array.from(w[0] || '大吉');
      const pool = Array.from(w.slice(1).join('') + '吉凶福祿壽喜財運');
      return `<div class="row">${target
        .map(
          (ch, i) =>
            `<div class="win"><div class="reel" style="--i:${i}">${rep(15, (k) => `<span>${esc(pool[(k * 7 + i * 3) % pool.length])}</span>`)}<span>${esc(ch)}</span></div></div>`,
        )
        .join('')}</div>`;
    },
  },
  {
    id: 'odometer',
    no: 50,
    cat: 'switch',
    zh: '計數器',
    en: 'Odometer',
    desc: '數字滾動往上加',
    tags: ['成績', '數字'],
    tone: 'paper',
    sample: ['累計', '52,800', '人'],
    hint: '前綴 / 數字 / 單位',
    motion: '左側小字前綴、中間每一位數是一個深色圓角格子、右側單位；數字從 0 開始每一位以垂直滾輪方式向上滾動到目標值，高位數滾得慢、低位數滾得快，停住後停留 1.5 秒重來。',
    motionEn: 'A small prefix on the left, each digit in its own dark rounded tile, a unit on the right; digits roll upward like an odometer from 0 to the target value, higher digits slower and lower digits faster; hold 1.5s, then restart.',
    css: `
.S .row{display:flex;align-items:center;gap:1.2cqw;font-size:5cqw}
.S .d{width:9cqw;height:12cqw;background:#1d1d1d;border-radius:1.4cqw;overflow:hidden;color:#fff;font-size:9cqw;font-family:var(--mono);font-weight:700}
.S .d.sep{background:none;color:var(--fg);width:3cqw}
.S .reel{display:flex;flex-direction:column;animation:K_r 3.5s cubic-bezier(.2,.7,.2,1) infinite both;animation-delay:calc(var(--i)*.05s)}
.S .reel span{height:12cqw;display:grid;place-items:center;flex:none}
@keyframes K_r{0%{transform:translateY(0)}55%,92%{transform:translateY(calc(var(--to)*-12cqw))}100%{transform:translateY(calc(var(--to)*-12cqw));opacity:0}}`,
    html: (w) => {
      const [pre, num, unit] = pick(w, 3, ['累計', '52,800', '人']);
      const digits = Array.from(num);
      let di = 0;
      const cells = digits
        .map((ch) => {
          if (!/\d/.test(ch)) return `<div class="d sep"><div class="reel" style="--to:0"><span>${esc(ch)}</span></div></div>`;
          const v = +ch;
          const loops = digits.length - di++;
          const seq = rep(loops * 10 + v + 1, (k) => `<span>${k % 10}</span>`);
          return `<div class="d"><div class="reel" style="--to:${loops * 10 + v};--i:${di}">${seq}</div></div>`;
        })
        .join('');
      return `<div class="row"><span>${esc(pre)}</span>${cells}<span>${esc(unit)}</span></div>`;
    },
  },
  {
    id: 'headline-swap',
    no: 51,
    cat: 'switch',
    zh: '標題切換',
    en: 'Headline Swap',
    desc: '新聞標題一個換一個',
    tags: ['快訊', '解說'],
    tone: 'accent',
    sample: ['快訊', '捷運新站正式動工', '週末賞屋人潮回流', '重劃區交屋潮來了'],
    hint: '標籤 + 2–4 則標題',
    motion: '左側固定的白底黑字標籤（如「快訊」），右側深色長條中的標題每 1.6 秒從下往上推入替換，舊標題往上推出；長條開場時從左向右展開。',
    motionEn: 'A fixed white label on the left (e.g. "BREAKING"); in the dark bar on the right, headlines push up from below every 1.6s, shoving the previous one out the top; at the start the bar wipes open from left to right.',
    css: `
.S .bar{display:flex;align-items:stretch;width:84cqw;height:14cqw}
.S .lb{background:#fff;color:#111;font-size:6cqw;display:grid;place-items:center;padding:0 3cqw;z-index:1}
.S .hl{flex:1;background:#1d1d1d;color:#fff;position:relative;overflow:hidden;animation:K_open 6.4s cubic-bezier(.7,0,.2,1) infinite;transform-origin:0 50%}
.S .h{position:absolute;inset:0;display:flex;align-items:center;padding:0 3cqw;font-size:4.6cqw;white-space:nowrap;animation:K_h 6.4s cubic-bezier(.7,0,.2,1) infinite both;animation-delay:calc(var(--i)*1.6s)}
@keyframes K_open{0%{transform:scaleX(0)}8%,94%{transform:scaleX(1)}100%{transform:scaleX(0)}}
@keyframes K_h{0%{transform:translateY(100%)}6%,25%{transform:none}31%,100%{transform:translateY(-100%)}}`,
    html: (w) => {
      const [lb, ...hs] = w;
      const list = pick(hs, 4, ['捷運新站正式動工', '週末賞屋人潮回流', '重劃區交屋潮來了', '下集預告']);
      return `<div class="bar"><div class="lb">${esc(lb)}</div><div class="hl">${list.map((h, i) => `<div class="h" style="--i:${i}">${esc(h)}</div>`).join('')}</div></div>`;
    },
  },
  {
    id: 'led-board',
    no: 53,
    cat: 'switch',
    zh: 'LED 看板',
    en: 'LED Text',
    desc: '點點組成的電子字',
    tags: ['復古', '科技'],
    tone: 'ink',
    sample: ['最新消息'],
    hint: '2–8 字',
    motion: '仿 LED 點陣看板：文字由圓形發光點組成（亮點為主色帶光暈，暗點為極暗灰），整排文字由右往左逐格捲動，點陣背景保持網格。',
    motionEn: 'A dot-matrix LED sign: text is built from round glowing dots (lit dots in the accent color with glow, unlit dots very dark grey); the message scrolls right-to-left one column at a time over the fixed dot grid.',
    css: `.S canvas{width:100%;height:100%;display:block}`,
    html: () => `<canvas></canvas>`,
    run: (root, w) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const ac = getComputedStyle(root).getPropertyValue('--ac').trim() || '#d4ff3a';
      const rows = 22;
      const text = w.join('　') + '　　';
      const off = document.createElement('canvas');
      const oc = off.getContext('2d', { willReadFrequently: true })!;
      off.height = rows;
      oc.font = `900 ${rows - 2}px ${getComputedStyle(root).getPropertyValue('--sans').trim() || 'sans-serif'}`;
      off.width = Math.ceil(oc.measureText(text).width) + 2;
      oc.font = `900 ${rows - 2}px ${getComputedStyle(root).getPropertyValue('--sans').trim() || 'sans-serif'}`;
      oc.fillStyle = '#fff';
      oc.textBaseline = 'middle';
      oc.fillText(text, 0, rows / 2 + 1);
      const data = oc.getImageData(0, 0, off.width, rows).data;
      let x0 = 0;
      let raf = 0;
      let last = 0;
      const draw = (ts: number) => {
        raf = requestAnimationFrame(draw);
        if (ts - last < 45) return;
        last = ts;
        const W = (cv.width = cv.clientWidth * devicePixelRatio);
        const H = (cv.height = cv.clientHeight * devicePixelRatio);
        const cell = H / (rows + 4);
        const cols = Math.ceil(W / cell);
        ctx.fillStyle = '#0b0b0b';
        ctx.fillRect(0, 0, W, H);
        for (let c = 0; c < cols; c++) {
          const sx = (c + x0) % off.width;
          for (let r = 0; r < rows; r++) {
            const on = data[(r * off.width + sx) * 4 + 3] > 110;
            ctx.beginPath();
            ctx.arc(c * cell + cell / 2, (r + 2) * cell + cell / 2, cell * 0.38, 0, 7);
            ctx.fillStyle = on ? ac : '#1e1e1e';
            ctx.shadowBlur = on ? cell : 0;
            ctx.shadowColor = ac;
            ctx.fill();
          }
        }
        x0++;
      };
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    id: 'split-halves',
    no: 57,
    cat: 'switch',
    zh: '上下裂開',
    en: 'Split Halves',
    desc: '字裂開，露出另一個詞',
    tags: ['轉場', '反差'],
    tone: 'ink',
    sample: ['分裂', '重生'],
    hint: '2 個詞',
    motion: '第一個詞沿水平中線切成上下兩半，上半往上、下半往下滑開，中間露出主色的第二個詞從細線展開；停留後兩半合回，循環。',
    motionEn: 'The first word is sliced along its horizontal midline; the top half slides up and the bottom half slides down, revealing the second word in the accent color unfolding from a thin line between them; hold, then the halves close again, looping.',
    css: `
.S .a,.S .b{position:absolute;font-size:17cqw}
.S .top{clip-path:inset(0 0 50% 0);animation:K_t 3.6s cubic-bezier(.7,0,.2,1) infinite}
.S .bot{clip-path:inset(50% 0 0 0);animation:K_d 3.6s cubic-bezier(.7,0,.2,1) infinite}
.S .b{color:var(--ac);animation:K_b 3.6s cubic-bezier(.7,0,.2,1) infinite}
@keyframes K_t{0%,20%,90%,100%{transform:none}35%,75%{transform:translateY(-82%)}}
@keyframes K_d{0%,20%,90%,100%{transform:none}35%,75%{transform:translateY(82%)}}
@keyframes K_b{0%,22%,88%,100%{transform:scaleY(0)}36%,74%{transform:none}}`,
    html: (w) => {
      const [a, b] = pick(w, 2, ['分裂', '重生']);
      return `<div class="b">${esc(b)}</div><div class="a top">${esc(a)}</div><div class="a bot">${esc(a)}</div>`;
    },
  },
  {
    id: 'scramble',
    no: 59,
    cat: 'switch',
    zh: '亂碼解碼',
    en: 'Text Scramble',
    desc: '亂碼跳動後解碼成正確文字',
    tags: ['科技', '駭客'],
    tone: 'ink',
    sample: ['資料解密中', '真相大白'],
    hint: '多個詞輪流',
    motion: '文字先以隨機符號（英數與幾何符號）高速跳動，由左到右逐字「解碼」定格成正確的字，未解碼的字用主色、已解碼用白色；停留後亂碼化換下一個詞。',
    motionEn: 'Characters flicker rapidly through random glyphs (alphanumerics and geometric symbols), then decode left to right into the correct text; undecoded glyphs in the accent color, decoded ones in white; hold, then scramble into the next word.',
    css: `
.S .t{font-size:9cqw;font-family:var(--mono),var(--sans);letter-spacing:.05em;white-space:pre}
.S .t i{font-style:normal;color:var(--ac);opacity:.85}`,
    html: () => `<div class="t"></div>`,
    run: (root, w) => {
      const el = root.querySelector('.t')!;
      const sym = '!<>-_\\/[]{}—=+*^?#░▒▓█◆◇○●□■△▽01ABCDEFXYZ';
      let alive = true;
      let k = 0;
      let raf = 0;
      let t = 0;
      const go = () => {
        if (!alive) return;
        const target = Array.from(w[k++ % w.length]);
        const start = performance.now();
        const frame = (now: number) => {
          if (!alive) return;
          const p = (now - start) / 1400;
          let html = '';
          target.forEach((ch, i) => {
            const at = 0.25 + (i / target.length) * 0.6;
            html += p >= at ? ch : `<i>${sym[Math.floor(Math.random() * sym.length)]}</i>`;
          });
          el.innerHTML = html;
          if (p < 1) raf = requestAnimationFrame(frame);
          else t = window.setTimeout(go, 1600);
        };
        raf = requestAnimationFrame(frame);
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
    id: 'blinds',
    no: 58,
    cat: 'switch',
    zh: '百葉窗',
    en: 'Venetian Blinds',
    desc: '字被切成條狀，一條條翻成新詞',
    tags: ['轉場', '設計感'],
    tone: 'paper',
    sample: ['過去', '現在'],
    hint: '2 個詞',
    motion: '文字被切成 8 條水平細條，每一條像百葉窗葉片一樣依序繞 X 軸翻轉，翻過去後露出第二個詞的對應片段，由上而下間隔 0.06 秒；停留後再翻回來。',
    motionEn: 'The text is cut into 8 horizontal strips; each strip flips around the X axis like a venetian blind slat in sequence, top to bottom 0.06s apart, revealing the matching slice of the second word; hold, then flip back.',
    css: `
.S .box{position:relative;width:90cqw;height:20cqw;perspective:100cqw}
.S .sl{position:absolute;left:0;right:0;top:calc(var(--i)*2.5cqw);height:2.5cqw;transform-style:preserve-3d;animation:K_b 4s cubic-bezier(.6,0,.3,1) infinite;animation-delay:calc(var(--i)*.06s)}
.S .sl b{position:absolute;inset:0;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.S .sl b span{position:absolute;left:0;right:0;top:calc(var(--i)*-2.5cqw);height:20cqw;display:grid;place-items:center;font-size:16cqw;line-height:1}
.S .sl b+b{transform:rotateX(180deg)}
.S .sl b+b span{color:var(--ac)}
@keyframes K_b{0%,25%{transform:rotateX(0)}45%,75%{transform:rotateX(180deg)}95%,100%{transform:rotateX(360deg)}}`,
    html: (w) => {
      const [a, b] = pick(w, 2, ['過去', '現在']);
      return `<div class="box">${rep(8, (i) => `<div class="sl" style="--i:${i}"><b><span style="--i:${i}">${esc(a)}</span></b><b><span style="--i:${i}">${esc(b)}</span></b></div>`)}</div>`;
    },
  },
];
