import type { Fx } from '../types';
import { esc } from '../util';

// 2026-10-27 圖解動畫批次 B3（357–363）：chier 5 個、kinetic 1 個、impact 1 個；參考「一瞬で伝わる図解アニメ48選」題型重新設計
const base = { added: '2026-10-27', tone: 'ink' as const, preferredRatio: '16:9' as const };
const given = (w: string[], fb: string[]) => {
  const g = w.map((s) => String(s ?? '').trim()).filter(Boolean);
  return g.length ? g : fb;
};
/** 「>估價」標目前步驟；沒標就回傳 fb */
const marked = (w: string[], fb: number) => {
  const i = w.findIndex((x) => /^[>＞]/.test(x));
  return { items: w.map((x) => x.replace(/^[>＞]\s*/, '')), cur: i >= 0 ? i : fb };
};
/** 「地段 90」→ { k, v } */
const kn = (s: string) => {
  const m = s.match(/^(.*?)\s*([\d.]+%?)$/);
  return m && m[1] ? { k: m[1].trim(), v: m[2] } : { k: s, v: '' };
};
const OUT = `@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}`;
const G = `.S .g{position:absolute;inset:0;animation:K_o 6s ease infinite both}`;

export const flowExplain: Fx[] = [
  {
    ...base,
    id: 'conveyor',
    no: 357,
    cat: 'chier',
    zh: '流程輸送帶',
    en: 'Process Conveyor',
    desc: '輸送帶轉動，把每個步驟的箱子一格一格往前送到定位',
    tags: ['流程', '步驟', '建案'],
    sample: ['企劃', '施工', '預售', '交屋'],
    hint: '3–5 個步驟；9:16 自動改成直向輸送',
    motion: '畫面中央一條深色輸送帶，表面斜紋往前流動、兩端滾輪旋轉。每個步驟是一個主色紙箱（白框、上方貼著步驟名），從畫面外沿著輸送帶依序被送進來，停在自己的格位時輕彈一下並亮出編號；最後一箱用副色。全部到位後停留、淡出循環。',
    motionEn: 'A dark conveyor belt runs across the middle, its stripes flowing forward and rollers spinning at both ends. Each step is an accent box (white outline, label on top) carried in from off-screen one after another, settling into its slot with a small bounce and revealing its number; the last box is accent-2. Holds, fades, loops.',
    css: `${G}
.S .g{display:grid;place-items:center}
.S .ln{position:relative;display:flex;gap:calc(var(--u)*4);padding:0 calc(var(--u)*6) calc(var(--u)*5)}
.S .bt{position:absolute;left:0;right:0;bottom:0;height:calc(var(--u)*5);border-radius:99px;border:calc(var(--u)*.5) solid var(--fg);background:repeating-linear-gradient(90deg,var(--mu) 0 calc(var(--u)*2),color-mix(in srgb,var(--mu) 50%,var(--bg)) 0 calc(var(--u)*4));animation:K_bt .6s linear infinite}
.S .bt::before,.S .bt::after{content:'';position:absolute;top:50%;width:calc(var(--u)*3);height:calc(var(--u)*3);margin-top:calc(var(--u)*-1.5);border-radius:50%;border:calc(var(--u)*.5) dashed var(--fg);animation:K_rl 1s linear infinite}
.S .bt::before{left:calc(var(--u)*.6)}.S .bt::after{right:calc(var(--u)*.6)}
.S .bx{position:relative;width:calc(var(--u)*17);height:calc(var(--u)*14);background:var(--ac);border:calc(var(--u)*.5) solid var(--fg);color:var(--bg);display:grid;place-items:center;font-size:calc(var(--u)*3.6);margin-bottom:calc(var(--u)*.4);animation:K_in 6s cubic-bezier(.3,0,.3,1.25) infinite both;animation-delay:calc(var(--i)*.55s)}
.S .bx:last-child{background:var(--ac2)}
.S .bx::before{content:'';position:absolute;left:50%;top:0;bottom:0;width:calc(var(--u)*2.4);margin-left:calc(var(--u)*-1.2);background:color-mix(in srgb,var(--bg) 18%,transparent)}
.S .bx b{position:relative;white-space:nowrap}
.S .bx i{position:absolute;left:calc(var(--u)*-1.6);top:calc(var(--u)*-1.6);width:calc(var(--u)*5);height:calc(var(--u)*5);border-radius:50%;background:var(--fg);color:var(--bg);display:grid;place-items:center;font:normal calc(var(--u)*3) var(--mono);animation:K_n 6s cubic-bezier(.3,1.8,.5,1) infinite both;animation-delay:calc(var(--i)*.55s)}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.5)}.S .ln{flex-direction:column;padding:calc(var(--u)*5) 0 calc(var(--u)*5) calc(var(--u)*7)}.S .bt{left:0;right:auto;top:0;bottom:0;width:calc(var(--u)*5);height:auto;background:repeating-linear-gradient(0deg,var(--mu) 0 calc(var(--u)*2),color-mix(in srgb,var(--mu) 50%,var(--bg)) 0 calc(var(--u)*4))}.S .bt::before,.S .bt::after{left:50%;margin:0 0 0 calc(var(--u)*-1.5)}.S .bt::before{top:calc(var(--u)*.6)}.S .bt::after{top:auto;bottom:calc(var(--u)*.6)}.S .bx{width:calc(var(--u)*26);height:calc(var(--u)*11);margin:0 0 0 calc(var(--u)*.4);animation-name:K_inv}}
@keyframes K_in{0%{transform:translateX(-110cqw)}12%,100%{transform:none}}
@keyframes K_inv{0%{transform:translateY(-110cqh)}12%,100%{transform:none}}
@keyframes K_n{0%,11%{transform:scale(0)}16%,100%{transform:none}}
@keyframes K_bt{to{background-position:calc(var(--u)*4) 0}}
@keyframes K_rl{to{transform:rotate(360deg)}}
${OUT}`,
    html: (w) => {
      const st = given(w, ['企劃', '施工', '預售', '交屋']).slice(0, 5);
      return `<div class="g"><div class="ln"><div class="bt"></div>${st.map((t, i) => `<div class="bx" style="--i:${st.length - 1 - i}"><b>${esc(t)}</b><i>${i + 1}</i></div>`).join('')}</div></div>`;
    },
  },
  {
    ...base,
    id: 'cycle-wheel',
    no: 358,
    cat: 'chier',
    zh: '循環轉盤',
    en: 'Cycle Wheel',
    desc: '分格轉盤轉兩圈後停下，頂端指針指著目前這一步',
    tags: ['循環', '流程', '投資'],
    sample: ['租金收入', '累積收益', '>再投資', '擴大資產'],
    hint: '3–6 個步驟；在要停的那一步前加「>」，沒加就停在第一步',
    motion: '中央一個分格圓盤（主色與深色交錯的扇形、白色分隔線），每格寫著步驟名，圓心是深色轉軸。圓盤快速轉兩圈多後減速停下，頂端副色三角指針正好指著目前步驟；停下時那一格被白框圈起並脈動，指針輕彈一下。停留後淡出循環。',
    motionEn: 'A segmented wheel sits in the centre (alternating accent and dark sectors with white dividers), each sector labelled with a step, around a dark hub. It spins a little over two turns and eases to a stop with the accent-2 pointer at the top on the current step; that sector gets a pulsing white outline and the pointer bounces. Holds, fades, loops.',
    css: `${G}
.S .g{display:grid;place-items:center}
.S .wr{position:relative;width:calc(var(--u)*46);aspect-ratio:1}
.S .wh{position:absolute;inset:0;border-radius:50%;border:calc(var(--u)*.7) solid var(--fg);background:repeating-conic-gradient(from calc(var(--a)/-2),var(--ac) 0 var(--a),color-mix(in srgb,var(--fg) 14%,var(--bg)) 0 calc(var(--a)*2));animation:K_sp 6s cubic-bezier(.15,.6,.2,1) infinite both}
.S .wh.odd{background:conic-gradient(from calc(var(--a)/-2),var(--sects))}
.S .sl,.S .ar{position:absolute;left:50%;top:50%;width:0;height:0;rotate:calc(var(--i)*var(--a))}
.S .sl{rotate:calc(var(--i)*var(--a) + var(--a)/2)}
.S .sl::before{content:'';position:absolute;left:calc(var(--u)*-.25);bottom:0;width:calc(var(--u)*.5);height:calc(var(--u)*23);background:var(--fg)}
.S .lb{position:absolute;left:0;top:calc(var(--u)*-15.5);translate:-50% -50%;font-size:calc(var(--u)*3.2);white-space:nowrap;color:var(--fg);padding:.1em .3em}
.S .lb.ev{color:var(--bg)}
.S .lb.cur{outline:calc(var(--u)*.6) solid var(--fg);animation:K_cu 6s ease infinite both}
.S .hb{position:absolute;inset:36%;border-radius:50%;background:var(--bg);border:calc(var(--u)*.7) solid var(--fg);display:grid;place-items:center;text-align:center;font-size:calc(var(--u)*2.8);line-height:1.2}
.S .pt{position:absolute;left:50%;top:calc(var(--u)*-5);width:calc(var(--u)*6);height:calc(var(--u)*6);margin-left:calc(var(--u)*-3);background:var(--ac2);clip-path:polygon(0 0,100% 0,50% 100%);animation:K_pt 6s cubic-bezier(.3,1.8,.5,1) infinite both}
@keyframes K_sp{0%,6%{transform:rotate(0)}62%,100%{transform:rotate(var(--end))}}
@keyframes K_pt{0%,60%{transform:none}64%{transform:translateY(calc(var(--u)*1.2))}70%,100%{transform:none}}
@keyframes K_cu{0%,60%{outline-color:transparent}64%,72%,80%,100%{outline-color:var(--fg)}68%,76%{outline-color:transparent}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.7)}}
${OUT}`,
    html: (w) => {
      const { items, cur } = marked(given(w, ['租金收入', '累積收益', '>再投資', '擴大資產']).slice(0, 6), 0);
      const n = Math.max(3, items.length);
      while (items.length < 3) items.push('…');
      const a = 360 / n;
      // 奇數格時交錯色會首尾相撞，改成逐格指定顏色
      const sects = items.map((_, i) => `${i % 2 ? 'color-mix(in srgb,var(--fg) 14%,var(--bg))' : 'var(--ac)'} ${i * a}deg ${(i + 1) * a}deg`).join(',') + (n % 2 ? '' : '');
      const odd = n % 2 ? ' odd' : '';
      const sl = items.map((_, i) => `<div class="sl" style="--i:${i}"></div>`).join('');
      const lb = items.map((t, i) => `<div class="ar" style="--i:${i}"><div class="lb${i % 2 ? '' : ' ev'}${i === cur ? ' cur' : ''}">${esc(t)}</div></div>`).join('');
      const sectsFix = n % 2 ? items.map((_, i) => `${i === n - 1 ? 'color-mix(in srgb,var(--ac2) 70%,var(--bg))' : i % 2 ? 'color-mix(in srgb,var(--fg) 14%,var(--bg))' : 'var(--ac)'} ${i * a}deg ${(i + 1) * a}deg`).join(',') : sects;
      return `<div class="g"><div class="wr" style="--a:${a}deg;--end:${-(cur * a) - 720}deg"><div class="wh${odd}" style="--sects:${sectsFix}">${sl}${lb}</div><div class="hb">循環</div><div class="pt"></div></div></div>`;
    },
  },
  {
    ...base,
    id: 'chevron-steps',
    no: 359,
    cat: 'chier',
    zh: 'V 形箭頭流程',
    en: 'Chevron Steps',
    desc: '箭頭塊一個個拼上去，現在這一步升高並換成主色',
    tags: ['流程', '步驟', '交屋'],
    sample: ['點交鑰匙', '>水電檢查', '牆面磁磚', '門窗五金', '簽驗收單'],
    hint: '3–6 個步驟；在目前步驟前加「>」，沒加就是第一步',
    motion: '一排深灰 V 形箭頭塊從左邊依序滑進來、互相卡上，像拼圖一樣拼成一條流程；全部拼好後，目前這一步的箭頭往上浮起、換成主色並加上副色底線，其他步驟稍微變暗。直式改成由上往下的箭頭。停留後淡出循環。',
    motionEn: 'A row of dark grey chevron blocks slides in from the left one by one and locks together like puzzle pieces into a flow. Once assembled, the current step lifts up, turns accent and gets an accent-2 underline while the others dim slightly. In portrait the chevrons point downward. Holds, fades, loops.',
    css: `${G}
.S .g{display:grid;place-items:center}
.S .rw{display:flex}
.S .c{--h:calc(var(--u)*14);position:relative;width:calc(var(--u)*20);height:var(--h);margin-left:calc(var(--h)*-.22);display:grid;place-items:center;padding:0 calc(var(--h)*.34);text-align:center;font-size:calc(var(--u)*2.7);text-wrap:balance;line-height:1.2;background:color-mix(in srgb,var(--fg) 16%,var(--bg));color:var(--fg);clip-path:polygon(0 0,calc(100% - var(--h)*.3) 0,100% 50%,calc(100% - var(--h)*.3) 100%,0 100%,calc(var(--h)*.3) 50%);animation:K_in 6s cubic-bezier(.2,.9,.3,1.2) infinite both,K_dm 6s ease infinite both;animation-delay:calc(var(--i)*.3s),0s}
.S .c:first-child{margin-left:0;clip-path:polygon(0 0,calc(100% - var(--h)*.3) 0,100% 50%,calc(100% - var(--h)*.3) 100%,0 100%)}
.S .c.cur{animation:K_in 6s cubic-bezier(.2,.9,.3,1.2) infinite both,K_up 6s cubic-bezier(.3,1.6,.5,1) infinite both;animation-delay:calc(var(--i)*.3s),0s}
.S .c b{font-family:var(--mono);font-size:calc(var(--u)*2.4);display:block;opacity:.7}
.S .ul{height:calc(var(--u)*1.2);background:var(--ac2);margin-top:calc(var(--u)*2);transform-origin:0 50%;animation:K_ul 6s ease infinite both}
@keyframes K_in{0%{opacity:0;transform:translateX(-60cqw)}10%,100%{opacity:1;transform:none}}
@keyframes K_dm{0%,40%{filter:none}48%,100%{filter:brightness(.7)}}
@keyframes K_up{0%,40%{translate:0;background:color-mix(in srgb,var(--fg) 16%,var(--bg));color:var(--fg)}48%,100%{translate:0 calc(var(--u)*-3);background:var(--ac);color:var(--bg)}}
@keyframes K_ul{0%,46%{transform:scaleX(0)}54%,100%{transform:none}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.6)}.S .rw{flex-direction:column}.S .c{--h:calc(var(--u)*30);width:var(--h);height:calc(var(--u)*11);margin:calc(var(--u)*-2.6) 0 0;padding:calc(var(--u)*2.4) 0;font-size:calc(var(--u)*3.6);clip-path:polygon(0 0,50% calc(var(--u)*2.6),100% 0,100% calc(100% - var(--u)*2.6),50% 100%,0 calc(100% - var(--u)*2.6))}.S .c:first-child{margin:0;clip-path:polygon(0 0,100% 0,100% calc(100% - var(--u)*2.6),50% 100%,0 calc(100% - var(--u)*2.6))}@keyframes K_in{0%{opacity:0;transform:translateY(-60cqh)}10%,100%{opacity:1;transform:none}}@keyframes K_up{0%,40%{translate:0;background:color-mix(in srgb,var(--fg) 16%,var(--bg));color:var(--fg)}48%,100%{translate:calc(var(--u)*4) 0;background:var(--ac);color:var(--bg)}}.S .ul{display:none}}
${OUT}`,
    html: (w) => {
      const { items, cur } = marked(given(w, ['點交鑰匙', '>水電檢查', '牆面磁磚', '門窗五金', '簽驗收單']).slice(0, 6), 0);
      return `<div class="g"><div><div class="rw">${items.map((t, i) => `<div class="c${i === cur ? ' cur' : ''}" style="--i:${i}"><span><b>0${i + 1}</b>${esc(t)}</span></div>`).join('')}</div><div class="ul" style="margin-left:calc(${cur} * (var(--u)*20 - var(--u)*14*.22));width:calc(var(--u)*20)"></div></div></div>`;
    },
  },
  {
    ...base,
    id: 'brick-pyramid',
    no: 360,
    cat: 'chier',
    zh: '金字塔疊磚',
    en: 'Brick Pyramid',
    desc: '磚塊由下往上一層層砌起來，最上層落下時發光',
    tags: ['階層', '資產配置', '優先順序'],
    sample: ['資產配置金字塔', '緊急預備金', '自住房', '出租投資'],
    hint: '標題（可省略）＋ 由下到上 2–5 層',
    motion: '底部一條地面線，磚塊層由下往上依序從上方落下堆疊，每層落地時輕彈並揚起細小粉塵（短線往兩側飛）；磚面有白色灰縫紋路，越上層越窄。最上層用主色，落下後外圍發光脈動兩下。標題在左上。停留後淡出循環。',
    motionEn: 'Over a ground line, brick layers drop in from above and stack from bottom to top, each landing with a small bounce and a puff of dust (short lines flying sideways); bricks show white mortar lines and each layer is narrower. The top layer is accent-coloured and glows twice after landing. Title top-left. Holds, fades, loops.',
    css: `${G}
.S .g{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:12cqh}
.S h3{position:absolute;left:6cqw;top:7cqh;margin:0;font-size:calc(var(--u)*4.4);border-left:calc(var(--u)*1) solid var(--ac);padding-left:.4em}
.S .ly{position:relative;width:calc(var(--u)*(76 - var(--i)*14));height:calc(var(--u)*9);display:grid;place-items:center;color:var(--fg);font-size:calc(var(--u)*3.6);background:color-mix(in srgb,var(--fg) 18%,var(--bg));border:calc(var(--u)*.5) solid var(--fg);animation:K_dr 6s cubic-bezier(.5,0,.5,1.3) infinite both;animation-delay:calc(var(--d)*.55s)}
.S .ly::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 calc(var(--u)*7.6),color-mix(in srgb,var(--fg) 40%,transparent) 0 calc(var(--u)*8)) calc(var(--i)*var(--u)*4) 0}
.S .ly span{position:relative;background:inherit;padding:0 .4em}
.S .ly.top{background:var(--ac);color:var(--bg);animation:K_dr 6s cubic-bezier(.5,0,.5,1.3) infinite both,K_gl 6s ease infinite both;animation-delay:calc(var(--d)*.55s),0s}
.S .ly i{position:absolute;bottom:0;width:calc(var(--u)*3);height:calc(var(--u)*.5);background:var(--fg);opacity:0;animation:K_du 6s ease-out infinite both;animation-delay:calc(var(--d)*.55s)}
.S .ly i:first-of-type{left:0;--s:-1}.S .ly i:last-of-type{right:0;--s:1}
.S .gd{width:calc(var(--u)*90);height:calc(var(--u)*.7);background:var(--fg)}
@keyframes K_dr{0%{opacity:0;transform:translateY(-90cqh)}9%{opacity:1;transform:none}11%{transform:scaleY(.9) translateY(4%)}14%,100%{opacity:1;transform:none}}
@keyframes K_du{0%,9%{opacity:0;translate:0}10%{opacity:1}16%,100%{opacity:0;translate:calc(var(--s)*var(--u)*5) calc(var(--u)*-1.5)}}
@keyframes K_gl{0%,48%,62%,76%,100%{box-shadow:0 0 0 0 transparent}55%,69%{box-shadow:0 0 0 calc(var(--u)*1.6) color-mix(in srgb,var(--ac) 45%,transparent)}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.15)}.S .g{padding-bottom:22cqh}.S .ly{height:calc(var(--u)*12)}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['資產配置金字塔', '緊急預備金', '自住房', '出租投資']);
      const title = g.length >= 3 ? g[0] : '';
      const ly = (g.length >= 3 ? g.slice(1) : g).slice(0, 5);
      const n = ly.length;
      return `<div class="g">${title ? `<h3>${esc(title)}</h3>` : ''}${ly
        .map((t, i) => ({ t, i }))
        .reverse()
        .map(({ t, i }) => `<div class="ly${i === n - 1 ? ' top' : ''}" style="--i:${i};--d:${i}"><span>${esc(t)}</span><i></i><i></i></div>`)
        .join('')}<div class="gd"></div></div>`;
    },
  },
  {
    ...base,
    id: 'mind-bubbles',
    no: 361,
    cat: 'chier',
    zh: '心智圖氣泡',
    en: 'Mind-Map Bubbles',
    desc: '中心主題向外長出氣泡節點，每個節點帶一個分數',
    tags: ['心智圖', '因素', '分析'],
    sample: ['影響房價的因素', '地段 95', '交通 88', '學區 72', '屋齡 64', '公設 41'],
    hint: '中心主題 ＋ 3–6 個「名稱 分數」（分數可省略）',
    motion: '中心是主色大圓寫著主題。連線一條條從中心往外畫出，線尾冒出深灰氣泡節點（先膨脹到稍大再縮回），氣泡大小依分數變化，右上角掛一枚副色分數圓牌。全部長好後，所有氣泡輕輕上下漂浮。停留後淡出循環。',
    motionEn: 'A large accent circle holds the topic in the centre. Lines draw outward one by one and a dark grey bubble node pops at each end (overshooting slightly), sized by its score, with an accent-2 score badge on its top-right. Once grown, all bubbles bob gently. Holds, fades, loops.',
    css: `${G}
.S svg{position:absolute;inset:0;width:100%;height:100%}
.S line{stroke:var(--fg);stroke-width:2;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1;animation:K_ln 6s ease-out infinite both;animation-delay:calc(.4s + var(--i)*.4s)}
.S .ct{position:absolute;left:50%;top:50%;translate:-50% -50%;width:calc(var(--u)*21);aspect-ratio:1;border-radius:50%;background:var(--ac);color:var(--bg);display:grid;place-items:center;text-align:center;padding:calc(var(--u)*2);font-size:calc(var(--u)*3.6);line-height:1.25;border:calc(var(--u)*.6) solid var(--fg);animation:K_ct 6s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .nd{position:absolute;left:var(--x);top:var(--y);translate:-50% -50%;animation:K_fl 2.4s ease-in-out infinite alternate;animation-delay:calc(var(--i)*-.5s)}
.S .bb{width:calc(var(--u)*var(--sz));aspect-ratio:1;border-radius:50%;background:color-mix(in srgb,var(--fg) 16%,var(--bg));border:calc(var(--u)*.5) solid var(--fg);display:grid;place-items:center;font-size:calc(var(--u)*3.2);position:relative;animation:K_bb 6s cubic-bezier(.3,1.8,.5,1) infinite both;animation-delay:calc(.7s + var(--i)*.4s)}
.S .bb i{position:absolute;right:calc(var(--u)*-2);top:calc(var(--u)*-1.6);min-width:calc(var(--u)*6);padding:0 .3em;height:calc(var(--u)*4.6);border-radius:99px;background:var(--ac2);color:var(--bg);display:grid;place-items:center;font:normal calc(var(--u)*2.8) var(--mono)}
@keyframes K_ln{0%{stroke-dashoffset:1}6%,100%{stroke-dashoffset:0}}
@keyframes K_ct{0%{transform:scale(0)}8%,100%{transform:none}}
@keyframes K_bb{0%{transform:scale(0)}7%,100%{transform:none}}
@keyframes K_fl{from{margin-top:calc(var(--u)*-.8)}to{margin-top:calc(var(--u)*.8)}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.35)}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['影響房價的因素', '地段 95', '交通 88', '學區 72', '屋齡 64', '公設 41']);
      const topic = g[0];
      const nd = g.slice(1, 7).map(kn);
      const nums = nd.map((d) => parseFloat(d.v)).filter((x) => !isNaN(x));
      const mx = Math.max(...nums, 1), mn = Math.min(...nums, mx);
      const n = nd.length;
      // 橫式用寬橢圓，直式用 CSS 變數另算（container query 換 --x/--y）
      const pos = (i: number, rx: number, ry: number) => {
        const t = -Math.PI / 2 + (i / n) * Math.PI * 2 + (n % 2 ? 0 : Math.PI / n);
        return { x: 50 + Math.cos(t) * rx, y: 50 + Math.sin(t) * ry };
      };
      const L = nd.map((_, i) => pos(i, 31, 29)), P = nd.map((_, i) => pos(i, 30, 26));
      const css = `<style>.fx-mind-bubbles .pt{display:none}${nd.map((_, i) => `.fx-mind-bubbles .nd[data-i="${i}"]{--x:${L[i].x.toFixed(1)}%;--y:${L[i].y.toFixed(1)}%}`).join('')}@container (aspect-ratio < 1){${nd.map((_, i) => `.fx-mind-bubbles .nd[data-i="${i}"]{--x:${P[i].x.toFixed(1)}%;--y:${P[i].y.toFixed(1)}%}`).join('')}.fx-mind-bubbles .ls{display:none}.fx-mind-bubbles .pt{display:block}}</style>`;
      const lines = (Q: { x: number; y: number }[]) => Q.map((p, i) => `<line pathLength="1" x1="50" y1="50" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" style="--i:${i}"/>`).join('');
      return `${css}<div class="g"><svg class="ls" viewBox="0 0 100 100" preserveAspectRatio="none">${lines(L)}</svg><svg class="pt" viewBox="0 0 100 100" preserveAspectRatio="none">${lines(P)}</svg><div class="ct">${esc(topic)}</div>${nd
        .map((d, i) => {
          const v = parseFloat(d.v);
          const sz = isNaN(v) ? 15 : 12 + ((v - mn) / Math.max(mx - mn, 1)) * 6;
          return `<div class="nd" data-i="${i}" style="--i:${i}"><div class="bb" style="--sz:${sz.toFixed(1)};--i:${i}">${esc(d.k)}${d.v ? `<i>${esc(d.v)}</i>` : ''}</div></div>`;
        })
        .join('')}</div>`;
    },
  },
  {
    ...base,
    id: 'domino-cause',
    no: 362,
    cat: 'kinetic',
    zh: '骨牌因果',
    en: 'Domino Cause & Effect',
    desc: '原因骨牌倒下，一路連鎖推倒到最後的結果牌',
    tags: ['因果', '連鎖反應', '利率'],
    sample: ['升息', '房貸利率上升', '月付金增加', '買氣降溫'],
    hint: '2–5 個，依因果順序；最後一個是結果',
    motion: '地面上立著一排骨牌，每張骨牌下方的地面寫著它代表的事件。第一張骨牌被推倒，往右傾倒撞上下一張，依序連鎖倒下；最後一張是主色結果牌，倒下時畫面輕震，上方彈出結果大字並加上副色底線。停留後淡出循環。',
    motionEn: 'A row of dominoes stands on the ground, each with its event written on the floor below. The first is pushed and topples right into the next in a chain; the last is the accent "result" domino, and as it falls the frame jolts and the result pops up above in large type with an accent-2 underline. Holds, fades, loops.',
    css: `${G}
.S .g{display:grid;place-items:center}
.S .rw{display:flex;align-items:flex-end;gap:calc(var(--u)*15);border-bottom:calc(var(--u)*.7) solid var(--fg);padding:0 calc(var(--u)*4)}
.S .d{position:relative;width:calc(var(--u)*4.4);height:calc(var(--u)*22)}
.S .d i{position:absolute;inset:0;background:color-mix(in srgb,var(--fg) 85%,var(--bg));border:calc(var(--u)*.4) solid var(--fg);border-radius:calc(var(--u)*.6);transform-origin:100% 100%;animation:K_fa 6s cubic-bezier(.55,0,.8,.6) infinite both;animation-delay:calc(.6s + var(--i)*.38s)}
.S .d i::before,.S .d i::after{content:'';position:absolute;left:50%;width:calc(var(--u)*1.2);height:calc(var(--u)*1.2);margin-left:calc(var(--u)*-.6);border-radius:50%;background:var(--bg);top:25%}
.S .d i::after{top:65%}
.S .d.last i{background:var(--ac)}
.S .d.last{--ang:80deg}
.S .d b{position:absolute;top:100%;left:50%;translate:-50% 0;margin-top:calc(var(--u)*1.6);font-size:calc(var(--u)*2.8);white-space:nowrap;font-weight:inherit;opacity:.85}
.S .d.last b{color:var(--ac)}
.S .rs{position:absolute;left:0;right:0;top:12cqh;text-align:center;font-size:calc(var(--u)*7);animation:K_rs 6s cubic-bezier(.3,1.8,.5,1) infinite both;animation-delay:calc(.6s + var(--n)*.38s)}
.S .rs span{border-bottom:calc(var(--u)*1) solid var(--ac2)}
@keyframes K_fa{0%{transform:none}6%,100%{transform:rotate(var(--ang,62deg))}}
@keyframes K_rs{0%,2%{opacity:0;transform:scale(.3)}8%,100%{opacity:1;transform:none}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*.95)}.S .rw{gap:calc(var(--u)*13)}.S .d b{writing-mode:vertical-rl;translate:-50% 0;font-size:calc(var(--u)*4.4)}.S .rs{top:20cqh;font-size:calc(var(--u)*9)}}
${OUT}`,
    html: (w) => {
      const st = given(w, ['升息', '房貸利率上升', '月付金增加', '買氣降溫']).slice(0, 5);
      const n = st.length;
      const hit = Math.round(((0.6 + (n - 1) * 0.38 + 0.3) / 6) * 100);
      const shake = `<style>@keyframes ma-dom-sh{0%,${hit}%,${hit + 4}%,100%{translate:0}${hit + 1}%{translate:.6% .5%}${hit + 2}%{translate:-.5% -.3%}${hit + 3}%{translate:.3% 0}}</style>`;
      return `${shake}<div class="g" style="animation:ma-dom-sh 6s linear infinite"><div class="rs" style="--n:${n}"><span>${esc(st[n - 1])}</span></div><div class="rw">${st.map((t, i) => `<div class="d${i === n - 1 ? ' last' : ''}"><i style="--i:${i}"></i><b>${esc(t)}</b></div>`).join('')}</div></div>`;
    },
  },
  {
    ...base,
    id: 'ng-ok-sign',
    no: 363,
    cat: 'impact',
    zh: 'NG/OK 警示',
    en: 'NG / OK Warning',
    desc: '警示牌震動落下，NG 做法蓋上 ✕ 章、OK 做法蓋上 ○ 章',
    tags: ['注意事項', '對錯', '簽約'],
    sample: ['簽約前先確認', 'NG 口頭答應的贈品', 'OK 寫進合約附件'],
    hint: '標題 ＋ 以「NG」或「OK」開頭的 2–4 項',
    motion: '副色三角警示牌（粗黑框、驚嘆號）從畫面上方重重落下並左右搖晃，旁邊彈出標題。下方一排做法卡依序滑入；NG 卡接著被一枚紅色 ✕ 印章蓋下並變暗，OK 卡被綠色 ○ 印章蓋下並微微放大。停留後淡出循環。',
    motionEn: 'An accent-2 warning triangle (thick black outline, exclamation mark) drops heavily from the top and sways, and the title pops in beside it. Below, practice cards slide in one by one; each NG card is stamped with a red ✕ and dims, each OK card gets a green ○ stamp and grows slightly. Holds, fades, loops.',
    css: `${G}
.S .g{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*5);--red:#ef4444;--grn:#22c55e}
.S .hd{display:flex;align-items:center;gap:calc(var(--u)*3)}
.S .tri{width:calc(var(--u)*14);height:calc(var(--u)*12.4);background:var(--fg);clip-path:polygon(50% 0,100% 100%,0 100%);display:grid;place-items:center;transform-origin:50% 0;animation:K_tr 6s cubic-bezier(.5,0,.5,1) infinite both}
.S .tri::before{content:'';width:84%;height:84%;margin-top:12%;background:var(--ac2);clip-path:polygon(50% 0,100% 100%,0 100%);grid-area:1/1}
.S .tri b{grid-area:1/1;z-index:1;color:#111;font-size:calc(var(--u)*7);margin-top:20%}
.S h3{margin:0;font-size:calc(var(--u)*6);animation:K_h 6s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .cs{display:flex;gap:calc(var(--u)*4)}
.S .c{position:relative;width:calc(var(--u)*34);min-height:calc(var(--u)*15);padding:calc(var(--u)*2.4) calc(var(--u)*3);background:color-mix(in srgb,var(--fg) 12%,var(--bg));border:calc(var(--u)*.5) solid var(--fg);font-size:calc(var(--u)*3.6);line-height:1.3;animation:K_c 6s cubic-bezier(.2,.9,.3,1) infinite both;animation-delay:calc(.9s + var(--i)*.6s)}
.S .c em{display:block;font:normal calc(var(--u)*2.8) var(--mono);margin-bottom:calc(var(--u)*1);color:var(--k)}
.S .c.ng{--k:var(--red)}.S .c.ok{--k:var(--grn)}
.S .c.ng{animation-name:K_c,K_dm;animation-duration:6s,6s;animation-delay:calc(.9s + var(--i)*.6s),calc(1.5s + var(--i)*.6s)}
.S .c.ok{animation-name:K_c,K_gr;animation-duration:6s,6s;animation-delay:calc(.9s + var(--i)*.6s),calc(1.5s + var(--i)*.6s)}
.S .st{position:absolute;right:calc(var(--u)*-3);top:calc(var(--u)*-4);width:calc(var(--u)*13);height:calc(var(--u)*13);display:grid;place-items:center;animation:K_st 6s cubic-bezier(.5,0,.4,1.4) infinite both;animation-delay:calc(1.5s + var(--i)*.6s)}
.S .st svg{width:100%;height:100%;fill:none;stroke:var(--k);stroke-width:5;stroke-linecap:round}
@keyframes K_tr{0%{transform:translateY(-80cqh)}8%{transform:none}11%{transform:rotate(9deg)}14%{transform:rotate(-6deg)}17%{transform:rotate(3deg)}20%,100%{transform:none}}
@keyframes K_h{0%,8%{opacity:0;transform:translateX(-12%)}14%,100%{opacity:1;transform:none}}
@keyframes K_c{0%{opacity:0;transform:translateY(30%)}7%,100%{opacity:1;transform:none}}
@keyframes K_st{0%{opacity:0;transform:scale(2.6) rotate(-20deg)}6%,100%{opacity:1;transform:rotate(-8deg)}}
@keyframes K_dm{0%,5%{filter:none}9%,100%{filter:brightness(.6)}}
@keyframes K_gr{0%,5%{scale:1}9%,100%{scale:1.05}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.3)}.S .cs{flex-direction:column;gap:calc(var(--u)*5)}.S .c{width:calc(var(--u)*50)}.S .hd{flex-direction:column}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['簽約前先確認', 'NG 口頭答應的贈品', 'OK 寫進合約附件']);
      const title = /^(NG|OK)/i.test(g[0]) ? '注意！' : g[0];
      const it = (/^(NG|OK)/i.test(g[0]) ? g : g.slice(1)).slice(0, 4).map((s) => {
        const m = s.match(/^(NG|OK)[\s:：]*/i);
        return { ok: m ? m[1].toUpperCase() === 'OK' : true, t: m ? s.slice(m[0].length) : s };
      });
      const X = '<svg viewBox="0 0 40 40"><path d="M10 10l20 20M30 10L10 30"/></svg>', O = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="13"/></svg>';
      return `<div class="g"><div class="hd"><div class="tri"><b>!</b></div><h3>${esc(title)}</h3></div><div class="cs">${it.map((d, i) => `<div class="c ${d.ok ? 'ok' : 'ng'}" style="--i:${i}"><em>${d.ok ? 'OK' : 'NG'}</em>${esc(d.t)}<div class="st" style="--i:${i}">${d.ok ? O : X}</div></div>`).join('')}</div></div>`;
    },
  },
];
