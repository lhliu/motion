import type { Fx } from '../types';
import { esc } from '../util';

export const retro: Fx[] = [
  {
    id: 'vhs',
    cat: 'retro',
    zh: 'VHS 錄影帶',
    en: 'VHS Tape',
    desc: '色偏、掃描線和跳動的錄影帶畫面',
    tags: ['懷舊', '回憶'],
    tone: 'ink',
    sample: ['1998 夏天'],
    hint: '2–8 字',
    motion: '仿 VHS 錄影帶畫面：文字有紅藍色版分離、全畫面水平掃描線與雜訊，偶爾整個畫面上下跳動並出現一條白色干擾帶由下往上掃過；左上角顯示「PLAY ▶」，右下角有時間碼。',
    motionEn: 'A VHS tape look: text with red/blue channel separation, full-frame horizontal scanlines and noise; occasionally the picture jumps vertically and a white tracking band rolls up the screen; "PLAY ▶" at top left and a timecode at bottom right.',
    css: `
.S{background:#14121a}
.S .t{font-size:11cqw;color:#f4f1e8;text-shadow:-.5cqw 0 #ff2a6d,.5cqw 0 #05d9e8;animation:K_j 4s steps(1) infinite;letter-spacing:.04em}
.S .osd{position:absolute;font-family:var(--mono);font-size:3cqw;color:#fff;text-shadow:0 0 .4cqw #fff8;font-weight:700}
.S .p{left:5cqw;top:5cqh;animation:K_b 1.4s steps(1) infinite}.S .tc{right:5cqw;bottom:6cqh}
.S .sl{position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 2px,#0005 2px 4px);pointer-events:none}
.S .bd{position:absolute;left:0;right:0;height:6cqh;background:linear-gradient(transparent,#fff3,#fff6,#fff3,transparent);filter:blur(1px);animation:K_bd 4s linear infinite}
@keyframes K_j{0%,30%,34%,70%,73%,100%{transform:none}31%{transform:translate(-1.5%,3%) skewX(8deg)}32%{transform:translate(1%,-2%)}71%{transform:translate(2%,0) skewX(-6deg)}}
@keyframes K_b{50%{opacity:0}}
@keyframes K_bd{0%{top:110%}100%{top:-10%}}`,
    html: (w) =>
      `<div class="t">${esc(w[0])}</div><div class="osd p">PLAY ▶</div><div class="osd tc">AM 12:00<br>SEP.14 1998</div><div class="sl"></div><div class="bd"></div>`,
  },
  {
    id: 'terminal',
    cat: 'retro',
    zh: '終端機',
    en: 'Terminal Boot',
    desc: '綠色等寬字一行行輸出',
    tags: ['工程師', '科技'],
    tone: 'ink',
    sample: ['> init motion_atlas', '> loading effects... OK', '> 歡迎來到字卡圖鑑'],
    hint: '多行指令或句子',
    motion: '黑底綠色（或主色）等寬字的終端機畫面，每行以打字速度逐字輸出，行首有「>」提示符，最後一行後方有方塊游標閃爍；畫面帶有 CRT 輕微光暈與掃描線。',
    motionEn: 'A terminal screen with green (or accent) monospace text on black; each line types out character by character after a ">" prompt, a block cursor blinking after the last line; subtle CRT glow and scanlines.',
    css: `
.S{place-items:center start;padding:0 7cqw;background:#050805}
.S .scr{font-family:var(--mono);font-size:3.6cqw;color:var(--ac);text-shadow:0 0 .6cqw var(--ac);line-height:1.6;font-weight:500;white-space:pre-wrap}
.S .cur{display:inline-block;width:.6em;height:1em;background:var(--ac);vertical-align:-.15em;animation:K_b 1s steps(1) infinite}
.S::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 2px,#0004 2px 3px);pointer-events:none}
@keyframes K_b{50%{opacity:0}}`,
    html: () => `<div class="scr"><span class="out"></span><span class="cur"></span></div>`,
    run: (root, w) => {
      const out = root.querySelector('.out')!;
      let alive = true;
      let t = 0;
      let line = 0;
      let i = 0;
      let text = '';
      const tick = () => {
        if (!alive) return;
        if (line >= w.length) {
          t = window.setTimeout(() => {
            text = '';
            line = 0;
            i = 0;
            out.textContent = '';
            tick();
          }, 1800);
          return;
        }
        const s = Array.from(w[line]);
        if (i < s.length) {
          text += s[i++];
          out.textContent = text;
          t = window.setTimeout(tick, 45 + Math.random() * 50);
        } else {
          text += '\n';
          line++;
          i = 0;
          t = window.setTimeout(tick, 350);
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
    id: 'crt-power',
    cat: 'retro',
    zh: '映像管開關',
    en: 'CRT Power',
    desc: '老電視開機一條線展開、關機縮成一點',
    tags: ['懷舊', '轉場'],
    tone: 'ink',
    sample: ['頻道開播'],
    hint: '2–6 字',
    motion: '老式映像管電視開機：先在中央出現一條發亮的水平細線，再垂直展開成完整畫面（文字帶光暈與掃描線）；停留後關機，畫面壓成一條線再縮成一個亮點消失。',
    motionEn: 'An old CRT TV powering on: a bright horizontal line appears at the center, then expands vertically into the full picture (text with glow and scanlines); after a hold it powers off, collapsing to a line and then a fading dot.',
    css: `
.S{background:#000}
.S .scr{position:absolute;inset:6%;border-radius:4cqw/6cqw;background:radial-gradient(ellipse,#1b2b3a,#081018);display:grid;place-items:center;overflow:hidden;animation:K_p 5s infinite both}
.S .scr::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 2px,#0006 2px 4px)}
.S .t{font-size:11cqw;color:#e8f6ff;text-shadow:0 0 1cqw #9df,0 0 3cqw #5af}
@keyframes K_p{0%{transform:scale(0,.004);filter:brightness(4)}6%{transform:scale(1,.004);filter:brightness(4)}14%{transform:none;filter:brightness(1.6)}20%,78%{transform:none;filter:none}86%{transform:scale(1,.004);filter:brightness(4)}92%{transform:scale(.004,.004);filter:brightness(6)}100%{transform:scale(0,0)}}`,
    html: (w) => `<div class="scr"><div class="t">${esc(w[0])}</div></div>`,
  },
  {
    id: 'newspaper-spin',
    cat: 'retro',
    zh: '報紙旋轉',
    en: 'Newspaper Spin',
    desc: '老電影的報紙頭條轉著飛到眼前',
    tags: ['頭條', '搞笑'],
    tone: 'ink',
    sample: ['號外！', '本週新案開箱'],
    hint: '頭條 / 副標',
    motion: '一張舊報紙從畫面中心以快速旋轉（轉 4 圈）由極小放大到填滿畫面中央後突然停住，報紙上有粗體大標與副標、欄位線與泛黃紙質；停住瞬間畫面微震。',
    motionEn: 'An old newspaper spins rapidly (4 turns) from a tiny point at the center up to fill the middle of the frame, then stops dead; it has a bold headline, subhead, column rules and yellowed paper; the frame jolts at the stop.',
    css: `
.S{background:radial-gradient(#333,#000)}
.S .np{width:64cqw;padding:3cqw 4cqw;background:#efe6d0;color:#1a1a1a;box-shadow:0 2cqw 6cqw #000a;font-family:var(--serif);animation:K_s 4.6s cubic-bezier(.3,0,.2,1) infinite both}
.S .mh{display:flex;justify-content:space-between;border-bottom:.5cqw double #1a1a1a;font-size:2cqw;padding-bottom:.6cqw;font-family:var(--mono)}
.S h2{font-size:10cqw;margin:1.4cqw 0;line-height:1}
.S h3{font-size:3.6cqw;margin:0 0 1.4cqw;font-weight:700}
.S .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:1.4cqw}
.S .cols i{height:1cqw;background:#1a1a1a33;display:block;margin:.6cqw 0}
@keyframes K_s{0%{transform:scale(0) rotate(0)}40%{transform:scale(1) rotate(1440deg)}42%{transform:scale(1.03) rotate(1442deg)}45%,85%{transform:scale(1) rotate(1440deg)}100%{transform:scale(0) rotate(1440deg);opacity:0}}`,
    html: (w) =>
      `<div class="np"><div class="mh"><span>THE DAILY MOTION</span><span>No.40</span></div><h2>${esc(w[0])}</h2><h3>${esc(w[1] ?? '')}</h3><div class="cols">${'<div><i></i><i></i><i></i></div>'.repeat(3)}</div></div>`,
  },
  {
    id: 'old-film',
    cat: 'retro',
    zh: '老電影',
    en: 'Old Film',
    desc: '泛黃、刮痕、閃爍的默片字卡',
    tags: ['懷舊', '默片'],
    tone: 'ink',
    sample: ['第一幕', '男子踏上看屋之路'],
    hint: '標題 / 說明',
    motion: '默片字卡：深褐色背景、裝飾邊框內置中白色襯線字，整個畫面持續亮度閃爍、隨機出現垂直刮痕與顆粒，畫面偶爾輕微上下跳格。',
    motionEn: 'A silent-film title card: dark sepia background, centered white serif text inside an ornamental border; the whole frame flickers in brightness, random vertical scratches and grain appear, and the picture occasionally jitters vertically.',
    css: `
.S{background:radial-gradient(ellipse,#4a3a2a,#1a120a);animation:K_f .15s steps(2) infinite,K_j 3s steps(1) infinite;filter:sepia(.6)}
.S .fr{border:.4cqw double #e8dcc4;outline:.2cqw solid #e8dcc4;outline-offset:1.2cqw;padding:4cqw 7cqw;text-align:center;color:#f2e8d2;font-family:var(--serif)}
.S h2{font-size:8cqw;margin:0 0 1.6cqw;letter-spacing:.2em}
.S p{font-size:3.6cqw;margin:0;font-weight:500}
.S .sc{position:absolute;top:0;bottom:0;width:1px;background:#fff9;animation:K_sc .9s steps(1) infinite}
.S .gr{position:absolute;inset:-50%;background:radial-gradient(circle,#fff2 .5px,transparent 1px) 0 0/6px 6px;animation:K_g .3s steps(3) infinite;mix-blend-mode:overlay}
@keyframes K_f{50%{filter:sepia(.6) brightness(1.15)}}
@keyframes K_j{0%,48%,52%,100%{transform:none}50%{transform:translateY(1.2%)}}
@keyframes K_sc{0%{left:22%;opacity:1}30%{left:71%;opacity:.5}60%{left:40%;opacity:0}80%{left:84%;opacity:.8}}
@keyframes K_g{33%{transform:translate(3px,-5px)}66%{transform:translate(-4px,2px)}}`,
    html: (w) => `<div class="fr"><h2>${esc(w[0])}</h2><p>${esc(w[1] ?? '')}</p></div><i class="sc"></i><i class="gr"></i>`,
  },
  {
    id: 'synthwave',
    cat: 'retro',
    zh: '80 年代霓虹',
    en: 'Synthwave',
    desc: '夕陽、網格地板與鍍鉻字',
    tags: ['80s', '電子'],
    tone: 'ink',
    sample: ['NEON CITY'],
    hint: '英文效果最佳',
    motion: '80 年代合成波風格：紫色漸層天空與條紋夕陽，地面是向遠方延伸並持續往前滾動的洋紅色透視網格，文字為上藍下橘的鍍鉻漸層並帶白色高光邊，輕微上下漂浮。',
    motionEn: '80s synthwave: a purple gradient sky with a striped sunset, a magenta perspective grid floor scrolling toward the viewer, and chrome text with a blue-to-orange gradient and white highlight edge, gently floating.',
    css: `
.S{background:linear-gradient(#12002b,#3b0a5c 45%,#ff2e88 60%,#12002b 60.2%)}
.S .sun{position:absolute;width:34cqw;height:34cqw;border-radius:50%;top:calc(60% - 30cqw);background:linear-gradient(#ffe259,#ff2e88);-webkit-mask:linear-gradient(#000 55%,transparent 55% 60%,#000 60% 68%,transparent 68% 72%,#000 72% 79%,transparent 79% 84%,#000 84%);mask:linear-gradient(#000 55%,transparent 55% 60%,#000 60% 68%,transparent 68% 72%,#000 72% 79%,transparent 79% 84%,#000 84%)}
.S .floor{position:absolute;left:-50%;right:-50%;top:60%;height:80%;transform:perspective(20cqh) rotateX(60deg);transform-origin:50% 0;background:linear-gradient(90deg,#ff2e88 2px,transparent 2px) 0 0/6cqw 6cqw,linear-gradient(#ff2e88 2px,transparent 2px) 0 0/6cqw 6cqw;animation:K_f 1s linear infinite}
.S .t{position:relative;top:-6%;font-size:11cqw;font-style:italic;background:linear-gradient(#a8f0ff,#3b8dff 50%,#1a0f40 51%,#ff9a3c 75%,#fff2a8);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:.15cqw #fff;filter:drop-shadow(0 0 1.5cqw #ff2e88);animation:K_fl 3s ease-in-out infinite}
@keyframes K_f{to{background-position:0 6cqw}}
@keyframes K_fl{50%{transform:translateY(-3%)}}`,
    html: (w) => `<div class="sun"></div><div class="floor"></div><div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'pixel-game',
    cat: 'retro',
    zh: '像素遊戲',
    en: '8-bit Game',
    desc: '紅白機風格的像素字與閃爍提示',
    tags: ['遊戲', '可愛'],
    tone: 'ink',
    sample: ['GAME START', 'PRESS ANY KEY'],
    hint: '英文效果最佳',
    motion: '8-bit 遊戲標題畫面：主標題以階梯動畫（steps）從上方一格一格掉下並彈跳，字帶像素化硬陰影；下方提示文字以 0.5 秒間隔閃爍，背景有像素星星閃動。',
    motionEn: '8-bit game title screen: the main title drops from above in stepped (steps()) motion and bounces, with a hard pixel drop shadow; the prompt below blinks at 0.5s intervals, and pixel stars twinkle in the background.',
    css: `
.S{background:#10102a}
.S .g{display:flex;flex-direction:column;align-items:center;gap:6cqh}
.S .t{font-family:var(--mono);font-size:8cqw;font-weight:700;color:var(--ac);text-shadow:.6cqw .6cqw 0 #e0315b,1.2cqw 1.2cqw 0 #000;animation:K_d 3s steps(8) infinite both;letter-spacing:.06em}
.S .p{font-family:var(--mono);font-size:3cqw;color:#fff;animation:K_b 1s steps(1) infinite}
.S .st{position:absolute;width:.8cqw;height:.8cqw;background:#fff;animation:K_tw 1.2s steps(1) infinite}
@keyframes K_d{0%{transform:translateY(-60cqh)}30%{transform:none}36%{transform:translateY(-6%)}42%,100%{transform:none}}
@keyframes K_b{50%{opacity:0}}
@keyframes K_tw{50%{opacity:.2}}`,
    html: (w) =>
      `<div class="g"><div class="t">${esc(w[0])}</div><div class="p">${esc(w[1] ?? 'PRESS ANY KEY')}</div></div>${[
        [8, 12],
        [86, 18],
        [20, 80],
        [74, 72],
        [52, 8],
        [92, 88],
      ]
        .map(([x, y], i) => `<i class="st" style="left:${x}%;top:${y}%;animation-delay:${i * 0.2}s"></i>`)
        .join('')}`,
  },
];
