import type { Fx } from '../types';
import { esc, pick } from '../util';

// 轉場：段落之間的換場片段。前一段字（可省略）→ 遮蓋 → 露出下一段字；也可輸出透明素材疊在剪接點上
const base = { tone: 'ink' as const, added: '2026-10-23', preferredRatio: '9:16' as const };

export const cuts: Fx[] = [
  {
    ...base,
    id: 'cut-color-push',
    no: 256,
    cat: 'twipe',
    zh: '色塊推擠',
    en: 'Color Push',
    desc: '三條色塊從右邊推進蓋滿畫面，再往左推走露出下一段',
    tags: ['轉場', '換段落', '節奏'],
    sample: ['下一站'],
    hint: '下一段標題（可留空）',
    duration: 2.4,
    motion: '畫面先是純底色；字色、輔色、主色三層全幅色塊由右往左依序推入（相隔約 0.06 秒），疊滿整個畫面；停約 0.3 秒後三條色塊同方向繼續往左推出，露出下一段標題，標題在色塊離開時從 0.9 倍放大到原尺寸。全部硬邊、沒有模糊。',
    motionEn: 'Starting on the plain background, three full-height bands in accent, secondary and text colors push in from the right one after another (about 0.06s apart) until they cover the frame; after a 0.3s hold they keep moving left and exit, revealing the next title, which scales from 0.9 to full size as the bands clear. Hard edges, no blur.',
    css: `
.S .t{font-size:11cqw;text-align:center;padding:0 6cqw;opacity:0;animation:K_t 2.4s cubic-bezier(.2,.8,.2,1) infinite}
.S .b{position:absolute;inset:0;transform:translateX(101%);animation:K_b 2.4s cubic-bezier(.75,0,.25,1) infinite}
.S .b1{background:var(--fg)}.S .b2{background:var(--ac2);animation-delay:.07s}.S .b3{background:var(--ac);animation-delay:.14s}
@keyframes K_b{0%,6%{transform:translateX(101%)}34%,50%{transform:none}80%,100%{transform:translateX(-101%)}}
@keyframes K_t{0%,52%{opacity:0;transform:scale(.9)}53%{opacity:1;transform:scale(.9)}80%,100%{opacity:1;transform:none}}`,
    html: (w) => `<div class="t">${esc(w.filter(Boolean)[0] ?? '')}</div><i class="b b1"></i><i class="b b2"></i><i class="b b3"></i>`,
  },
  {
    ...base,
    id: 'cut-shape-wipe',
    no: 257,
    cat: 'twipe',
    zh: '形狀擦除',
    en: 'Shape Wipe',
    desc: '圓形、房子或斜切形狀從中間長大蓋滿，再用同形狀露出下一段',
    tags: ['轉場', '換段落', '建案'],
    sample: ['來看格局', '房子'],
    hint: '下一段標題 / 形狀：圓形｜房子｜斜切',
    duration: 2.4,
    motion: '畫面中央一個主色形狀（圓形、房子剪影或斜切方塊）從 0 快速放大到蓋滿畫面；緊接著同形狀的底色層從中央再長一次，把主色吃掉，下一段標題跟著底色層一起出現。形狀是硬邊。',
    motionEn: 'An accent-colored shape (circle, house silhouette or slanted block) grows from zero at the center until it fills the frame; right after, a background-colored layer of the same shape grows from the center again, eating the accent and carrying the next title with it. Hard-edged shapes.',
    css: `
.S .sh{position:absolute;left:50%;top:50%;width:260cqmax;height:260cqmax;margin:-130cqmax 0 0 -130cqmax;transform:scale(0)}
.S .sh.c{border-radius:50%}
.S .sh.h{clip-path:polygon(50% 18%,86% 46%,78% 46%,78% 84%,22% 84%,22% 46%,14% 46%)}
.S .sh.d{clip-path:polygon(30% 0,100% 0,70% 100%,0 100%)}
.S .a{background:var(--ac);animation:K_a 2.4s cubic-bezier(.7,0,.3,1) infinite}
.S .z{background:var(--bg);display:grid;place-items:center;animation:K_z 2.4s cubic-bezier(.7,0,.3,1) infinite}
.S .t{font-size:11cqw;max-width:80cqw;text-align:center;line-height:1.15}
@keyframes K_a{0%,4%{transform:scale(0)}40%,100%{transform:scale(1)}}
@keyframes K_z{0%,44%{transform:scale(0)}80%,100%{transform:scale(1)}}`,
    html: (w) => {
      const [t, s] = pick(w, 2, ['來看格局', '房子']);
      const k = /房|屋|家|house/i.test(s) ? 'h' : /斜|diag/i.test(s) ? 'd' : 'c';
      return `<i class="sh a ${k}"></i><div class="sh z ${k}"><div class="t">${esc(w.length ? t : '來看格局')}</div></div>`;
    },
  },
  {
    ...base,
    id: 'cut-door-open',
    no: 258,
    cat: 'twipe',
    zh: '開門轉場',
    en: 'Door Open',
    desc: '兩扇門關著，門把一轉向兩側打開，走進下一段',
    tags: ['轉場', '開箱', '建案', '3D'],
    sample: ['歡迎回家', '開箱'],
    hint: '門後標題 / 門上小字',
    duration: 3,
    motion: '畫面是兩扇主色門板（有門框線、門把，中間貼一張寫著門上小字的門牌）；門把先往下轉一下，兩扇門以外側為軸做 3D 旋轉往外打開（約 0.8 秒），門後是底色和門後標題，標題從 0.85 倍放大推近。門與門把都是硬邊色塊。',
    motionEn: 'Two accent-colored door panels with frame lines, handles and a small plaque reading the door label fill the frame; the handle turns down once, then both doors swing outward in 3D around their outer edges (about 0.8s), revealing the background and the title behind, which pushes in from 0.85 scale. Doors and handles are flat hard-edged shapes.',
    css: `
.S{perspective:160cqw}
.S .t{font-size:11cqw;text-align:center;padding:0 6cqw;animation:K_t 3s cubic-bezier(.2,.8,.2,1) infinite}
.S .d{position:absolute;top:0;bottom:0;width:50%;background:var(--ac);border:1.2cqw solid var(--fg);animation:K_l 3s cubic-bezier(.6,0,.3,1) infinite;transform-origin:0 50%;left:0;backface-visibility:hidden}
.S .d.r{left:50%;transform-origin:100% 50%;animation-name:K_r}
.S .d::before{content:'';position:absolute;inset:8% 14%;border:.6cqw solid color-mix(in srgb,var(--fg) 45%,transparent)}
.S .k{position:absolute;top:52%;width:2.4cqw;height:9cqw;border-radius:2cqw;background:var(--fg);transform-origin:50% 10%;animation:K_k 3s ease infinite}
.S .d.l .k{right:6%}.S .d.r .k{left:6%}
.S .p{position:absolute;top:30%;left:50%;transform:translateX(-50%);background:var(--bg);color:var(--fg);font-size:4.4cqw;padding:1.4cqw 2.4cqw;white-space:nowrap}
.S .d.l .p{left:auto;right:-1.2cqw;transform:none;border-radius:0}.S .d.r .p{left:-1.2cqw;transform:none}
@keyframes K_l{0%,30%{transform:none}62%,100%{transform:rotateY(-100deg)}}
@keyframes K_r{0%,30%{transform:none}62%,100%{transform:rotateY(100deg)}}
@keyframes K_k{0%,12%,28%,100%{transform:none}18%,24%{transform:rotate(40deg)}}
@keyframes K_t{0%,34%{transform:scale(.85)}70%,100%{transform:none}}`,
    html: (w) => {
      const [t, p] = pick(w, 2, ['歡迎回家', '開箱']);
      const half = Math.ceil([...p].length / 2);
      const a = [...p].slice(0, half).join(''), b = [...p].slice(half).join('');
      return `<div class="t">${esc(t)}</div><div class="d l"><i class="k"></i>${a ? `<span class="p">${esc(a)}</span>` : ''}</div><div class="d r"><i class="k"></i>${b ? `<span class="p">${esc(b)}</span>` : ''}</div>`;
    },
  },
  {
    ...base,
    id: 'cut-page-flip',
    no: 259,
    cat: 'twipe',
    zh: '翻頁堆疊',
    en: 'Page Flip',
    desc: '上一頁像書頁一樣翻走，下面一疊卡片露出下一段',
    tags: ['轉場', '換段落', '3D'],
    sample: ['第二章', '上一段'],
    hint: '下一頁標題 / 上一頁文字',
    duration: 2.8,
    motion: '畫面中央一疊三張錯位的卡片；最上面一張主色卡寫著上一頁文字，以左邊為軸 3D 往左翻起翻走（約 0.7 秒），露出下一張底色卡上的下一頁標題；後面兩張卡跟著往前遞補一格。卡片硬邊、無陰影。',
    motionEn: 'A stack of three offset cards sits at the center; the top accent card with the previous text flips up and away to the left around its left edge in 3D (about 0.7s), revealing the next title on the card below while the cards behind step forward one slot. Hard-edged cards, no shadows.',
    css: `
.S{perspective:180cqw}
.S .st{position:relative;width:78cqw;height:min(110cqw,78cqh)}
.S .c{position:absolute;inset:0;display:grid;place-items:center;text-align:center;font-size:10cqw;padding:6cqw;border:.8cqw solid var(--fg)}
.S .c3{background:var(--ac2);transform:translate(4cqw,4cqw);animation:K_c3 2.8s cubic-bezier(.6,0,.3,1) infinite}
.S .c2{background:var(--bg);transform:translate(2cqw,2cqw);animation:K_c2 2.8s cubic-bezier(.6,0,.3,1) infinite}
.S .c1{background:var(--ac);color:var(--bg);transform-origin:0 50%;animation:K_c1 2.8s cubic-bezier(.6,0,.3,1) infinite;backface-visibility:hidden}
@keyframes K_c1{0%,30%{transform:none}60%,100%{transform:rotateY(-110deg)}}
@keyframes K_c2{0%,40%{transform:translate(2cqw,2cqw)}66%,100%{transform:none}}
@keyframes K_c3{0%,44%{transform:translate(4cqw,4cqw)}70%,100%{transform:translate(2cqw,2cqw)}}`,
    html: (w) => {
      const [t, p] = pick(w, 2, ['第二章', '上一段']);
      return `<div class="st"><div class="c c3"></div><div class="c c2">${esc(t)}</div><div class="c c1">${esc(p)}</div></div>`;
    },
  },
  {
    ...base,
    id: 'cut-flash',
    no: 260,
    cat: 'tflash',
    zh: '閃白閃黑',
    en: 'Flash Cut',
    desc: '跟著節拍閃兩下白（或黑），第二下直接硬切到下一段',
    tags: ['轉場', '節奏', '卡點'],
    sample: ['重點來了', '白'],
    hint: '下一段標題 / 白｜黑',
    duration: 1.8,
    motion: '前段只有底色；畫面全白（或全黑）閃一下約 0.08 秒，間隔 0.25 秒再閃第二下，第二下閃完直接硬切出現下一段標題，標題從 1.15 倍彈回原尺寸。閃光是整片純色，不用漸層或模糊。',
    motionEn: 'Over the plain background the whole frame flashes white (or black) for about 0.08s, then again 0.25s later; right after the second flash the next title hard-cuts in, bouncing from 1.15 to full size. Each flash is a flat solid fill with no gradient or blur.',
    css: `
.S .t{font-size:12cqw;text-align:center;padding:0 6cqw;opacity:0;animation:K_t 1.8s cubic-bezier(.3,1.6,.5,1) infinite}
.S .f{position:absolute;inset:0;background:#fff;opacity:0;animation:K_f 1.8s steps(1) infinite}
.S .f.k{background:#000}
@keyframes K_f{0%,15%{opacity:0}16%,20%{opacity:1}21%,34%{opacity:0}35%,40%{opacity:1}41%,100%{opacity:0}}
@keyframes K_t{0%,40%{opacity:0;transform:scale(1.15)}41%{opacity:1;transform:scale(1.15)}60%,100%{opacity:1;transform:none}}`,
    html: (w) => {
      const [t, c] = pick(w, 2, ['重點來了', '白']);
      return `<div class="t">${esc(t)}</div><i class="f${/黑|black/i.test(c) ? ' k' : ''}"></i>`;
    },
  },
  {
    ...base,
    id: 'cut-whip',
    no: 261,
    cat: 'tflash',
    zh: '甩鏡速度線',
    en: 'Whip Lines',
    desc: '一陣硬邊速度線橫掃，前一個詞被甩走、下一個詞甩進來',
    tags: ['轉場', '節奏', '速度'],
    sample: ['上一段', '下一段'],
    hint: '前一個詞 / 下一個詞',
    duration: 2.2,
    motion: '前一個詞停在中央，突然斜切（skew）並高速往左甩出畫面；同時十幾條長短不一的主色與字色細橫線從右往左高速掃過；下一個詞從右邊斜切甩進，衝過頭一點再回正停在中央。速度感全部靠硬邊線條與斜切，不用動態模糊。',
    motionEn: 'The previous word sits at the center, then skews and whips off to the left at high speed; a dozen thin horizontal lines of varying length in accent and text colors streak right to left; the next word whips in skewed from the right, overshoots slightly and settles at the center. Speed is conveyed only with hard-edged lines and skew, no motion blur.',
    css: `
.S .w{position:absolute;font-size:12cqw;white-space:nowrap}
.S .a{animation:K_a 2.2s cubic-bezier(.7,0,.9,.4) infinite}
.S .b{animation:K_b 2.2s cubic-bezier(.1,.6,.3,1.2) infinite}
.S .ln{position:absolute;left:0;height:var(--h);top:var(--y);width:var(--l);background:var(--c);transform:translateX(110cqw);animation:K_l 2.2s linear infinite;animation-delay:var(--d)}
@keyframes K_a{0%,30%{transform:none}46%,100%{transform:translateX(-140cqw) skewX(30deg)}}
@keyframes K_b{0%,44%{transform:translateX(140cqw) skewX(30deg)}64%,100%{transform:none}}
@keyframes K_l{0%,32%{transform:translateX(110cqw)}52%,100%{transform:translateX(-110cqw)}}`,
    html: (w) => {
      const [a, b] = pick(w, 2, ['上一段', '下一段']);
      const lines = Array.from({ length: 14 }, (_, i) => {
        const y = 8 + ((i * 37) % 84), l = 30 + ((i * 53) % 60), h = 0.4 + ((i * 7) % 4) * 0.3, d = ((i * 29) % 12) * 0.012;
        return `<i class="ln" style="--y:${y}%;--l:${l}cqw;--h:${h}cqw;--d:${d}s;--c:var(${i % 3 ? '--ac' : '--fg'})"></i>`;
      }).join('');
      return `<div class="w a">${esc(a)}</div><div class="w b">${esc(b)}</div>${lines}`;
    },
  },
  {
    ...base,
    id: 'cut-glitch',
    no: 262,
    cat: 'tflash',
    zh: '故障轉場',
    en: 'Glitch Cut',
    desc: '畫面像訊號不良一樣切片錯位，切完換成下一個詞',
    tags: ['轉場', '科技', '節奏'],
    sample: ['舊的', '新的'],
    hint: '前一個詞 / 下一個詞',
    duration: 2.2,
    motion: '前一個詞穩定停留；接著約 0.5 秒的故障：文字被切成四條水平帶，各帶以階梯方式左右錯位，並疊上主色、輔色兩層偏移的分色副本，三條色條隨機閃現；故障中途換成下一個詞，最後一格錯位歸零、文字穩定。全部用硬邊切片與階梯時間，沒有模糊。',
    motionEn: 'The previous word holds steady; then about 0.5s of glitch: the text is cut into four horizontal bands that jump left and right in stepped offsets, with accent and secondary offset copies layered on top and three color bars flashing at random; midway through the glitch it swaps to the next word, and on the last frame the offsets snap back and the text settles. Hard-edged slices and stepped timing only, no blur.',
    css: `
.S .g{position:relative;font-size:13cqw;white-space:nowrap}
.S .g>span{display:block}
.S .s>span{position:absolute;inset:0}
.S .s{position:absolute;inset:0;animation:K_s 2.2s steps(1) infinite}
.S .s1{clip-path:inset(0 0 75% 0)}.S .s2{clip-path:inset(25% 0 50% 0);animation-name:K_s2}.S .s3{clip-path:inset(50% 0 25% 0)}.S .s4{clip-path:inset(75% 0 0 0);animation-name:K_s2}
.S .base{visibility:hidden}
.S .A,.S .B{position:absolute;inset:0}
.S .A{animation:K_A 2.2s steps(1) infinite}.S .B{animation:K_B 2.2s steps(1) infinite}
.S .r1{color:var(--ac);mix-blend-mode:normal;opacity:0;animation:K_c 2.2s steps(1) infinite}
.S .r2{color:var(--ac2);opacity:0;animation:K_c2 2.2s steps(1) infinite}
.S .bar{position:absolute;left:0;right:0;height:var(--h);top:var(--y);background:var(--c);opacity:0;animation:K_bar 2.2s steps(1) infinite;animation-delay:var(--d)}
@keyframes K_s{0%,30%,62%,100%{transform:none}34%{transform:translateX(4cqw)}40%{transform:translateX(-6cqw)}46%{transform:translateX(2cqw)}52%{transform:translateX(-3cqw)}58%{transform:translateX(5cqw)}}
@keyframes K_s2{0%,30%,62%,100%{transform:none}34%{transform:translateX(-5cqw)}40%{transform:translateX(3cqw)}46%{transform:translateX(-7cqw)}52%{transform:translateX(4cqw)}58%{transform:translateX(-2cqw)}}
@keyframes K_A{0%,45%{visibility:visible}46%,100%{visibility:hidden}}
@keyframes K_B{0%,45%{visibility:hidden}46%,100%{visibility:visible}}
@keyframes K_c{0%,30%,62%,100%{opacity:0;transform:none}34%,46%{opacity:1;transform:translate(-1.6cqw,.4cqw)}40%,52%{opacity:1;transform:translate(1.4cqw,-.6cqw)}}
@keyframes K_c2{0%,30%,62%,100%{opacity:0;transform:none}34%,46%{opacity:1;transform:translate(1.6cqw,-.4cqw)}40%,52%{opacity:1;transform:translate(-1.2cqw,.8cqw)}}
@keyframes K_bar{0%,32%,60%,100%{opacity:0}36%,44%,52%{opacity:1}40%,48%,56%{opacity:0}}`,
    html: (w) => {
      const [a, b] = pick(w, 2, ['舊的', '新的']);
      const layer = (cls: string) =>
        `<span class="${cls}"><span class="A">${esc(a)}</span><span class="B">${esc(b)}</span><span style="visibility:hidden">${esc([...a].length > [...b].length ? a : b)}</span></span>`;
      const slices = [1, 2, 3, 4].map((i) => `<span class="s s${i}">${layer('r1')}${layer('r2')}${layer('')}</span>`).join('');
      const bars = [0, 1, 2].map((i) => `<i class="bar" style="--y:${[22, 51, 74][i]}%;--h:${[1.2, .6, 2][i]}cqw;--d:${i * .04}s;--c:var(${['--ac', '--fg', '--ac2'][i]})"></i>`).join('');
      return `<div class="g"><span class="base">${esc([...a].length > [...b].length ? a : b)}</span>${slices}</div>${bars}`;
    },
  },
];
