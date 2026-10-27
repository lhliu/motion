import type { Fx } from '../types';
import { esc } from '../util';

// 2026-10-27 圖解動畫批次 B2（352–356）：card 3 個、hook 2 個，參考「一瞬で伝わる図解アニメ48選」題型，版型與動態重新設計
const base = { added: '2026-10-27', tone: 'ink' as const, preferredRatio: '16:9' as const };
const given = (w: string[], fb: string[]) => {
  const g = w.map((s) => String(s ?? '').trim()).filter(Boolean);
  return g.length ? g : fb;
};
const BIG = `@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.45)}}`;

/** 賣點關鍵字 → 線條圖示（24×24）；沒對到就用第一個字 */
const ICONS: [RegExp, string][] = [
  [/捷運|車站|交通|通勤/, '<rect x="6" y="3" width="12" height="14" rx="3"/><path d="M6 11h12M9 21l1.5-4M15 21l-1.5-4"/><circle cx="9.5" cy="14" r=".6"/><circle cx="14.5" cy="14" r=".6"/>'],
  [/安全|保全|治安|管理/, '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>'],
  [/採光|日照|陽光|明亮/, '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'],
  [/學區|學校|教育/, '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>'],
  [/公園|綠地|景觀/, '<path d="M12 3c4 0 6 3 6 6s-3 5-6 5-6-2-6-5 2-6 6-6z"/><path d="M12 14v7M8 21h8"/>'],
  [/車位|停車/, '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 17V7h3a3 3 0 010 6h-3"/>'],
  [/商圈|生活|購物|市場/, '<path d="M5 8h14l-1 13H6z"/><path d="M9 8a3 3 0 016 0"/>'],
];
const icon = (t: string) => {
  const hit = ICONS.find(([r]) => r.test(t));
  return hit ? `<svg viewBox="0 0 24 24">${hit[1]}</svg>` : `<b>${esc([...t][0] ?? '?')}</b>`;
};

export const cardExplain: Fx[] = [
  {
    ...base,
    id: 'flip-solve',
    no: 352,
    cat: 'card',
    zh: '問題翻面變解法',
    en: 'Problem Flip to Solution',
    desc: '一張問題卡翻到背面變成解法，最後蓋上「解決」章',
    tags: ['問題解法', 'Before/After', '翻牌'],
    sample: ['頭期款不夠', '新青安貸款＋寬限期', '解決'],
    hint: '問題 / 解法 / 章字（可省略，預設「解決」）',
    motion: '畫面中央一張深灰問題卡，左上角小標「問題」、中間大字寫問題，邊緣微微抖動。卡片繞垂直軸翻轉 180 度，背面是主色解法卡，小標「解法」、大字寫解法；翻好後一個副色圓形印章從大縮小蓋在右下角並略為旋轉。停留後淡出循環。',
    motionEn: 'A dark grey problem card sits in the centre, labelled "問題" top-left with the problem in large type, trembling slightly. It flips 180° around the vertical axis to reveal an accent solution card labelled "解法"; once flipped, a round accent-2 stamp shrinks down onto the bottom-right corner with a slight tilt. Holds, fades, loops.',
    css: `
.S .g{position:absolute;inset:0;display:grid;place-items:center;perspective:calc(var(--u)*160);animation:K_o 6s ease infinite both}
.S .cd{position:relative;width:calc(var(--u)*68);height:calc(var(--u)*34);transform-style:preserve-3d;animation:K_f 6s cubic-bezier(.6,0,.3,1.3) infinite both}
.S .fc{position:absolute;inset:0;backface-visibility:hidden;display:flex;flex-direction:column;justify-content:center;padding:0 calc(var(--u)*5);border:calc(var(--u)*.6) solid var(--fg);box-shadow:calc(var(--u)*1.2) calc(var(--u)*1.2) 0 var(--fg)}
.S .fr{background:color-mix(in srgb,var(--fg) 10%,var(--bg));color:var(--fg);animation:K_t 6s linear infinite}
.S .bk{background:var(--ac);color:var(--bg);transform:rotateY(180deg)}
.S .tg{align-self:flex-start;font-size:calc(var(--u)*3);padding:.15em .5em;background:var(--fg);color:var(--bg);margin-bottom:calc(var(--u)*2)}
.S .fr .tg{background:var(--mu);color:var(--fg)}
.S .tx{font-size:calc(var(--u)*6);line-height:1.25;text-wrap:balance}
.S .st{position:absolute;left:calc(var(--u)*-4);bottom:calc(var(--u)*-5);width:calc(var(--u)*17);height:calc(var(--u)*17);border-radius:50%;border:calc(var(--u)*.8) solid var(--ac2);color:var(--ac2);background:var(--bg);display:grid;place-items:center;font-size:calc(var(--u)*4.4);transform:translateZ(1px);animation:K_s 6s cubic-bezier(.5,0,.4,1.4) infinite both}
.S .st::after{content:'';position:absolute;inset:calc(var(--u)*1);border-radius:50%;border:calc(var(--u)*.3) solid var(--ac2)}
@container (aspect-ratio < 1){.S .cd{width:calc(var(--u)*56);height:calc(var(--u)*44)}.S .st{left:calc(var(--u)*-2);bottom:calc(var(--u)*-7)}}
@keyframes K_f{0%,28%{transform:none}42%,100%{transform:rotateY(180deg)}}
@keyframes K_t{0%,6%,10%,14%,18%,100%{translate:0}8%,16%{translate:calc(var(--u)*-.6) 0}12%{translate:calc(var(--u)*.6) 0}}
@keyframes K_s{0%,48%{opacity:0;transform:rotateY(180deg) scale(2.6) rotate(0)}56%,100%{opacity:1;transform:rotateY(180deg) scale(1) rotate(-14deg)}}
@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}
${BIG}`,
    html: (w) => {
      const [q, a, s] = [w[0] || '頭期款不夠', w[1] || '新青安貸款＋寬限期', w[2] || '解決'];
      return `<div class="g"><div class="cd"><div class="fc fr"><span class="tg">問題</span><div class="tx">${esc(q)}</div></div><div class="fc bk"><span class="tg">解法</span><div class="tx">${esc(a)}</div></div><div class="st">${esc(s)}</div></div></div>`;
    },
  },
  {
    ...base,
    id: 'comic-4',
    no: 353,
    cat: 'card',
    zh: '四格漫畫拆解',
    en: 'Four-Panel Story',
    desc: '起承轉合四格依序彈出，把一段故事拆成四步',
    tags: ['故事', '起承轉合', '懶人包'],
    sample: ['首購族的買房故事', '存了五年頭期款', '看了二十間房', '房價又漲了', '改買重劃區上車'],
    hint: '標題（可省略）＋ 4 格內容；16:9 一列四格、9:16 兩列兩格',
    motion: '上方標題，下方四個粗黑框漫畫格，每格左上角有「起」「承」「轉」「合」角標。四格依序從小彈出並帶一點歪斜再擺正；第三格「轉」出現時格子用副色並震動一下，表示劇情轉折；第四格用主色收尾。停留後淡出循環。',
    motionEn: 'A title on top and four thick-framed comic panels below, each with a corner tag 起/承/轉/合. The panels pop in one by one with a slight tilt that straightens; panel 3 (the twist) is accent-2 and shakes on entry, and panel 4 lands in the accent colour. Holds, fades, loops.',
    css: `
.S .g{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:calc(var(--u)*4);animation:K_o 6s ease infinite both}
.S h3{margin:0;font-size:calc(var(--u)*5);padding:0 .3em;border-bottom:calc(var(--u)*.6) solid var(--ac)}
.S .pn{display:grid;grid-template-columns:repeat(4,calc(var(--u)*21));gap:calc(var(--u)*2.4)}
@container (aspect-ratio < 1){.S .pn{grid-template-columns:repeat(2,calc(var(--u)*30))}}
.S .p{position:relative;aspect-ratio:1/1.05;border:calc(var(--u)*.7) solid var(--fg);background:color-mix(in srgb,var(--fg) 8%,var(--bg));display:grid;place-items:center;padding:calc(var(--u)*2.4);text-align:center;font-size:calc(var(--u)*3.8);line-height:1.3;text-wrap:balance;animation:K_p 6s cubic-bezier(.3,1.6,.5,1) infinite both;animation-delay:calc(var(--i)*.7s)}
.S .p:nth-child(3){background:var(--ac2);color:var(--bg);animation-name:K_p,K_sh;animation-duration:6s,6s;animation-delay:1.4s,1.4s}
.S .p:nth-child(4){background:var(--ac);color:var(--bg)}
.S .p i{position:absolute;left:calc(var(--u)*-.7);top:calc(var(--u)*-.7);font-style:normal;background:var(--fg);color:var(--bg);font-size:calc(var(--u)*2.8);width:1.6em;height:1.6em;display:grid;place-items:center}
@keyframes K_p{0%,2%{opacity:0;transform:scale(.4) rotate(-8deg)}10%,100%{opacity:1;transform:none}}
@keyframes K_sh{0%,10%,18%,100%{translate:0}12%,16%{translate:calc(var(--u)*-.8) 0}14%{translate:calc(var(--u)*.8) 0}}
@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}
${BIG}`,
    html: (w) => {
      const g = given(w, ['首購族的買房故事', '存了五年頭期款', '看了二十間房', '房價又漲了', '改買重劃區上車']);
      const title = g.length >= 5 ? g[0] : '';
      const p = (g.length >= 5 ? g.slice(1) : g).slice(0, 4);
      while (p.length < 4) p.push('…');
      return `<div class="g">${title ? `<h3>${esc(title)}</h3>` : ''}<div class="pn">${p.map((t, i) => `<div class="p" style="--i:${i}"><i>${'起承轉合'[i]}</i>${esc(t)}</div>`).join('')}</div></div>`;
    },
  },
  {
    ...base,
    id: 'step-prints',
    no: 354,
    cat: 'card',
    zh: '三步驟腳印',
    en: 'Footprint Steps',
    desc: '腳印一左一右踩出來，每一步落下就跳出編號與說明',
    tags: ['步驟', '流程', '教學'],
    sample: ['算出你能買多少', '月收入 × 0.3', '換算可貸金額', '加上頭期款'],
    hint: '標題（可省略）＋ 2–4 個步驟',
    motion: '上方標題，下方一排腳印由左往右一左一右踩出：每個腳印從稍大壓下成實心主色並留下淡淡的影子，落地同時上方彈出副色編號圓牌，下方步驟說明淡入。最後一步落地後停留，淡出循環。直式時改由上往下踩。',
    motionEn: 'A title on top and footprints stepping left-to-right, alternating left and right feet: each print presses down from slightly larger into a solid accent shape with a faint shadow, an accent-2 number badge pops above it and the step text fades in below. Holds after the last step, fades, loops. In portrait the steps go top to bottom.',
    css: `
.S .g{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:calc(var(--u)*5);animation:K_o 6s ease infinite both}
.S h3{margin:0;font-size:calc(var(--u)*5)}
.S .rw{display:flex;gap:calc(var(--u)*4)}
.S .s{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*1.6);width:calc(var(--u)*24)}
@container (aspect-ratio < 1){.S .rw{flex-direction:column;gap:calc(var(--u)*3)}.S .s{flex-direction:row;width:calc(var(--u)*56);gap:calc(var(--u)*3)}.S .s:nth-child(even){translate:calc(var(--u)*6) 0}}
.S .n{width:calc(var(--u)*6);height:calc(var(--u)*6);border-radius:50%;background:var(--ac2);color:var(--bg);display:grid;place-items:center;font-family:var(--mono);font-size:calc(var(--u)*3.6);flex:none;animation:K_n 6s cubic-bezier(.3,1.8,.5,1) infinite both;animation-delay:calc(.4s + var(--i)*.9s)}
.S svg{width:calc(var(--u)*9);height:calc(var(--u)*13);flex:none;overflow:visible;animation:K_f 6s cubic-bezier(.5,0,.4,1.3) infinite both;animation-delay:calc(.2s + var(--i)*.9s)}
.S .s:nth-child(even) svg{transform:scaleX(-1) rotate(8deg);margin-top:calc(var(--u)*3)}
.S .s:nth-child(odd) svg{rotate:-8deg}
.S svg path,.S svg ellipse{fill:var(--ac)}
.S svg .sh{fill:var(--fg);opacity:.12;translate:1.2px 1.6px}
.S .t{font-size:calc(var(--u)*3.6);text-align:center;line-height:1.3;animation:K_t 6s ease infinite both;animation-delay:calc(.5s + var(--i)*.9s)}
@container (aspect-ratio < 1){.S .t{text-align:left}}
@keyframes K_f{0%,1%{opacity:0;scale:1.6}6%,100%{opacity:1;scale:1}}
@keyframes K_n{0%,3%{opacity:0;transform:scale(0)}9%,100%{opacity:1;transform:none}}
@keyframes K_t{0%,3%{opacity:0;transform:translateY(30%)}10%,100%{opacity:1;transform:none}}
@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}
${BIG}`,
    html: (w) => {
      const g = given(w, ['算出你能買多少', '月收入 × 0.3', '換算可貸金額', '加上頭期款']);
      const title = g.length >= 3 ? g[0] : '';
      const st = (g.length >= 3 ? g.slice(1) : g).slice(0, 4);
      const foot = (c: string) => `<path${c} d="M10 30c-5 0-7-5-6-11 1-5 3-8 7-8s6 3 6 8c0 6-2 11-7 11z"/><ellipse${c} cx="4" cy="5" rx="2" ry="2.6"/><ellipse${c} cx="9" cy="3" rx="2.2" ry="2.8"/><ellipse${c} cx="14" cy="4.4" rx="1.8" ry="2.3"/>`;
      return `<div class="g">${title ? `<h3>${esc(title)}</h3>` : ''}<div class="rw">${st.map((t, i) => `<div class="s" style="--i:${i}"><div class="n">${i + 1}</div><svg viewBox="0 0 18 31">${foot(' class="sh"')}${foot('')}</svg><div class="t">${esc(t)}</div></div>`).join('')}</div></div>`;
    },
  },
  {
    ...base,
    id: 'pack-box',
    no: 355,
    cat: 'hook',
    zh: '重點收納盒',
    en: 'Pack the Takeaways',
    desc: '三張重點卡依序飛進紙箱，封箱貼膠帶，適合片尾收束',
    tags: ['片尾', '重點整理', '收束'],
    sample: ['今天三大重點', '先算預算', '再看地段', '最後比貸款'],
    hint: '箱子標籤 ＋ 2–4 個重點',
    motion: '重點卡先在畫面上方排成一列展示，接著一張張往下飛進下方打開的紙箱（主色箱身、深色箱口）。全部收進去後兩片箱蓋從左右闔上，一條副色膠帶由左往右拉過封箱，箱身印出標籤文字並輕輕彈跳一下。停留後淡出循環。',
    motionEn: 'Takeaway cards first line up across the top, then drop one by one into an open box below (accent body, dark opening). Once all are inside, two flaps close from left and right, an accent-2 tape strip pulls across to seal it, and the label printed on the box bounces once. Holds, fades, loops.',
    css: `
.S .g{position:absolute;inset:0;animation:K_o 6s ease infinite both}
.S .cs{position:absolute;left:0;right:0;top:5cqh;display:flex;justify-content:center;gap:calc(var(--u)*2.4);z-index:1}
.S .c{background:var(--fg);color:var(--bg);font-size:calc(var(--u)*3.6);padding:calc(var(--u)*2) calc(var(--u)*2.6);white-space:nowrap;box-shadow:calc(var(--u)*.8) calc(var(--u)*.8) 0 var(--ac2);animation:K_c 6s cubic-bezier(.5,0,.6,1) infinite both;animation-delay:calc(var(--i)*.35s)}
.S .bx{position:absolute;left:calc(50% - var(--u)*23);bottom:7cqh;width:calc(var(--u)*46);height:calc(var(--u)*24)}
.S .bd{position:absolute;inset:0;z-index:3;animation:K_b 6s cubic-bezier(.3,1.8,.5,1) infinite both;background:var(--ac);border:calc(var(--u)*.6) solid var(--fg);display:grid;place-items:center;color:var(--bg);font-size:calc(var(--u)*4.6)}
.S .bd span{animation:K_l 6s ease infinite both}
.S .mo{position:absolute;z-index:3;left:0;right:0;top:calc(var(--u)*-1.6);height:calc(var(--u)*3);background:color-mix(in srgb,var(--fg) 85%,var(--bg));border:calc(var(--u)*.6) solid var(--fg)}
.S .fl{position:absolute;top:calc(var(--u)*-1.6);width:50%;height:calc(var(--u)*7);z-index:2;background:color-mix(in srgb,var(--ac) 70%,var(--bg));border:calc(var(--u)*.6) solid var(--fg)}
.S .fl.a{left:0;transform-origin:0 0;animation:K_fa 6s cubic-bezier(.5,0,.4,1.3) infinite both}
.S .fl.b{right:0;transform-origin:100% 0;animation:K_fb 6s cubic-bezier(.5,0,.4,1.3) infinite both}
.S .tp{position:absolute;z-index:4;left:-4%;top:calc(var(--u)*-1);height:calc(var(--u)*4);background:var(--ac2);width:108%;transform-origin:0 50%;animation:K_tp 6s cubic-bezier(.3,0,.2,1) infinite both}
@keyframes K_c{0%{opacity:0;transform:translateY(-40%)}6%,30%{opacity:1;transform:none}46%,100%{opacity:0;transform:translateY(48cqh) scale(.6)}}
@keyframes K_fa{0%,56%{transform:rotate(-145deg)}64%,100%{transform:scaleY(.32)}}
@keyframes K_fb{0%,58%{transform:rotate(145deg)}66%,100%{transform:scaleY(.32)}}
@keyframes K_tp{0%,68%{transform:scaleX(0)}76%,100%{transform:none}}
@keyframes K_l{0%,74%{opacity:.25}80%,100%{opacity:1}}
@keyframes K_b{0%,76%{transform:none}80%{transform:translateY(-6%) scale(1.03)}84%,100%{transform:none}}
@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.5)}.S .cs{flex-direction:column;align-items:center;top:16cqh}.S .bx{bottom:18cqh}}`,
    html: (w) => {
      const g = given(w, ['今天三大重點', '先算預算', '再看地段', '最後比貸款']);
      const label = g.length >= 2 ? g[0] : '重點收好';
      const it = (g.length >= 2 ? g.slice(1) : g).slice(0, 4);
      return `<div class="g"><div class="cs">${it.map((t, i) => `<div class="c" style="--i:${i}">${esc(t)}</div>`).join('')}</div><div class="bx"><div class="bd"><span>${esc(label)}</span></div><div class="mo"></div><div class="fl a"></div><div class="fl b"></div><div class="tp"></div></div></div>`;
    },
  },
  {
    ...base,
    id: 'perk-stamps',
    no: 356,
    cat: 'hook',
    zh: '賣點圖示蓋章',
    en: 'Perk Stamps',
    desc: '賣點圖示一個個在中央大大蓋章，再滑到下方收成一列',
    tags: ['賣點', '物件特色', '圖示'],
    sample: ['近捷運', '安全', '採光好', '學區'],
    hint: '2–5 個賣點；含「捷運／安全／採光／學區／公園／車位／商圈」會自動配圖示，其他用第一個字',
    motion: '每個賣點是一枚圓形印章（主色外框、線條圖示、下方小字）。它先在畫面中央以兩倍大從上方壓下、蓋章時略為旋轉並震一下，接著縮小滑到自己在下方那一列的位置；下一枚接著在中央蓋下。全部蓋完排成整齊一列，停留後淡出循環。',
    motionEn: 'Each perk is a round stamp (accent ring, line icon, small label below). It slams down at twice the size in the centre with a slight rotation and a jolt, then shrinks and slides into its slot in the row; the next stamp follows. Once all are stamped they sit in a neat row, hold, fade and loop.',
    css: `
.S .g{position:absolute;inset:0;display:grid;place-items:end center;padding-bottom:12cqh;animation:K_o 6s ease infinite both}
.S .rw{display:flex;gap:calc(var(--u)*3);--sz:calc(var(--u)*12);--dy:-36cqh}
.S .p{width:var(--sz);display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*1.6);animation:K_p 6s cubic-bezier(.5,0,.3,1) infinite both;animation-delay:calc(var(--i)*.85s)}
.S .r{width:var(--sz);height:var(--sz);border-radius:50%;border:calc(var(--u)*.8) solid var(--ac);color:var(--ac);display:grid;place-items:center;background:var(--bg);box-shadow:0 0 0 calc(var(--u)*.6) var(--bg),0 0 0 calc(var(--u)*1) color-mix(in srgb,var(--ac) 40%,transparent)}
.S .r svg{width:55%;height:55%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.S .r b{font-size:calc(var(--u)*6.6)}
.S .t{font-size:calc(var(--u)*3.4);white-space:nowrap}
@keyframes K_p{0%{opacity:0;transform:translate(var(--dx),-70cqh) scale(2) rotate(-18deg)}5%{opacity:1;transform:translate(var(--dx),var(--dy)) scale(1.6) rotate(-6deg)}6.5%{transform:translate(var(--dx),calc(var(--dy) + var(--u)*.6)) scale(1.55) rotate(-6deg)}11%{transform:translate(var(--dx),var(--dy)) scale(1.6) rotate(-6deg)}16%,100%{opacity:1;transform:none}}
@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}
@container (aspect-ratio < 1){.S .rw{flex-wrap:wrap;justify-content:center;width:calc(var(--u)*72);gap:calc(var(--u)*6) calc(var(--u)*8);--sz:calc(var(--u)*28)!important}.S .t{font-size:calc(var(--u)*6)}.S .p{--dx:0px!important}.S .g{place-items:center;padding:0}.S .rw{--dy:0px}}`,
    html: (w) => {
      const it = given(w, ['近捷運', '安全', '採光好', '學區']).slice(0, 5);
      const n = it.length, c = (n - 1) / 2;
      return `<div class="g"><div class="rw">${it.map((t, i) => `<div class="p" style="--i:${i};--dx:calc((${c} - ${i}) * (var(--sz) + var(--u) * 3))"><div class="r">${icon(t)}</div><div class="t">${esc(t)}</div></div>`).join('')}</div></div>`;
    },
  },
];
