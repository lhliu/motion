import type { Fx } from '../types';
import { esc, fmtLike, parseNum, unitOf } from '../util';

// 2026-10-27 圖解動畫批次 B1（346–351）：參考「一瞬で伝わる図解アニメ48選」的題型，版型與動態全部重新設計成房產情境
const base = { added: '2026-10-27' };

/** 「房價 1,500萬」「銀行=貸款」→ { k, v } */
const kv = (s: string) => {
  const m = String(s).match(/^(.*?)[\s=：:]+(\S.*)$/);
  return m ? { k: m[1].trim(), v: m[2].trim() } : { k: String(s).trim(), v: '' };
};
const given = (w: string[], fb: string[]) => {
  const g = w.map((s) => String(s ?? '').trim()).filter(Boolean);
  return g.length ? g : fb;
};
/** 6 秒循環中，第 i 站在 a→b 之間依序亮起的 keyframes（百分比不能用 CSS 變數，只好逐站產生） */
const stepKf = (name: string, at: number) => {
  const p = Math.max(1, Math.min(86, Math.round(at)));
  return `@keyframes ${name}{0%,${p - 0.5}%{--on:0}${p}%,92%{--on:1}100%{--on:1}}`;
};

const CAR = (d: string) => `<g class="car" style="offset-path:path('${d}')"><rect x="-5" y="-3" width="10" height="6" rx="1.6"/><rect class="win" x="0.6" y="-2" width="3" height="4" rx=".6"/></g>`;

export const estateExplain: Fx[] = [
  {
    ...base,
    id: 'route-drive',
    no: 346,
    cat: 'estate',
    zh: '買房路線圖',
    en: 'Home-Buying Road Trip',
    desc: '小車沿著彎曲道路開過每一站，到站就插旗亮起，適合講流程步驟',
    tags: ['流程', '步驟', '買房', '時間軸'],
    tone: 'ink',
    preferredRatio: '16:9',
    sample: ['看屋', '議價', '簽約', '貸款', '交屋'],
    hint: '3–6 個步驟，每個 2–4 字；16:9 橫向蛇行、9:16 自動改成直向蛇行',
    motion: '一條彎曲的灰色道路橫越畫面（直式時改成由上往下蛇行），道路上依序排著圓形站點與站名。一台副色小車從起點出發沿路開過，車後的路面被主色鋪滿；每到一站，站點填滿主色、旁邊彈出一支副色小旗、站名變主色。抵達終點後停留，再整組淡出循環。',
    motionEn: 'A curvy grey road crosses the frame (a top-to-bottom zigzag in portrait), with round stops and labels along it. A small accent-2 car drives from the start along the road, painting the road behind it in the accent colour; at each stop the dot fills with the accent, a small flag pops up beside it and the label turns accent. After arriving at the end it holds, then fades and loops.',
    css: `
.S .g{position:absolute;inset:0;display:grid;place-items:center;animation:K_o 6s ease infinite both}
.S svg{width:92cqw;height:auto;max-height:86cqh;overflow:visible}
.S .pt{display:none}
@container (aspect-ratio < 1){.S .ls{display:none}.S .pt{display:block;width:auto;height:86cqh;max-width:92cqw}}
.S .road{fill:none;stroke:var(--mu);stroke-width:3.2;stroke-linecap:round}
.S .done{fill:none;stroke:var(--ac);stroke-width:3.2;stroke-linecap:round;stroke-dasharray:100 100;animation:K_d 6s cubic-bezier(.45,0,.55,1) infinite both}
.S .car{offset-rotate:auto;animation:K_car 6s cubic-bezier(.45,0,.55,1) infinite both}
.S .car rect{fill:var(--ac2);stroke:var(--fg);stroke-width:.9}
.S .car .win{fill:var(--bg);stroke:none}
.S .st{animation:6s linear infinite both}
.S .st circle{fill:color-mix(in srgb,var(--bg) calc((1 - var(--on,0))*100%),var(--ac));stroke:color-mix(in srgb,var(--mu) calc((1 - var(--on,0))*100%),var(--fg));stroke-width:1.1}
.S .st text{font-family:var(--sans);font-weight:900;font-size:7px;fill:color-mix(in srgb,var(--fg) calc((1 - var(--on,0))*100%),var(--ac))}
.S .st .fl{transform-box:fill-box;transform-origin:0 100%;transform:scale(var(--on,0))}
.S .st .fl path{fill:var(--ac2)}.S .st .fl line{stroke:var(--fg);stroke-width:.7}
.S .ttl{position:absolute;left:6cqw;top:7cqh;font-size:calc(var(--u)*4.2);color:var(--fg)}
.S .ttl b{background:var(--ac);color:var(--bg);padding:0 .25em;margin:0 .1em}
@property --on{syntax:"<number>";inherits:true;initial-value:0}
@keyframes K_d{0%,8%{stroke-dashoffset:100}72%,100%{stroke-dashoffset:0}}
@keyframes K_car{0%,8%{offset-distance:0%}72%,100%{offset-distance:100%}}
@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}`,
    html: (w) => {
      const st = given(w, ['看屋', '議價', '簽約', '貸款', '交屋']).slice(0, 6);
      const n = Math.max(2, st.length);
      if (st.length < 2) st.push('完成');
      const build = (portrait: boolean) => {
        const W = portrait ? 90 : 160, H = portrait ? 160 : 90;
        const pts = st.map((_, i) => {
          const t = i / (n - 1);
          return portrait ? { x: i % 2 ? 66 : 24, y: 16 + t * 128 } : { x: 14 + t * 132, y: i % 2 ? 30 : 62 };
        });
        let d = `M${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < n; i++) {
          const a = pts[i - 1], b = pts[i];
          d += portrait ? ` C${a.x} ${(a.y + b.y) / 2} ${b.x} ${(a.y + b.y) / 2} ${b.x} ${b.y}` : ` C${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`;
        }
        const tag = portrait ? 'p' : 'l';
        const stops = pts.map((p, i) => {
          const name = `ma-rd-${tag}${n}-${i}`;
          const at = 8 + (64 * i) / (n - 1);
          const up = portrait ? false : i % 2 === 1;
          const left = portrait && i % 2 === 0;
          const tx = portrait ? (left ? p.x - 8 : p.x + 8) : p.x;
          const ty = portrait ? p.y + 2.5 : up ? p.y - 8 : p.y + 13;
          const anchor = portrait ? (left ? 'end' : 'start') : 'middle';
          const fy = portrait ? p.y - 3 : up ? p.y + 3 : p.y - 3;
          return `<style>${stepKf(name, at)}</style><g class="st" style="animation-name:${name}"><circle cx="${p.x}" cy="${p.y}" r="3.6"/><g class="fl"><line x1="${p.x + 2}" y1="${fy}" x2="${p.x + 2}" y2="${fy - 9}"/><path d="M${p.x + 2} ${fy - 9}h6l-1.6 2 1.6 2h-6z"/></g><text x="${tx}" y="${ty}" text-anchor="${anchor}">${esc(st[i])}</text></g>`;
        }).join('');
        return `<svg class="${portrait ? 'pt' : 'ls'}" viewBox="0 0 ${W} ${H}"><path class="road" d="${d}"/><path class="done" d="${d}" pathLength="100"/>${stops}${CAR(d)}</svg>`;
      };
      return `<div class="g">${build(false)}${build(true)}</div>`;
    },
  },
  {
    ...base,
    id: 'party-links',
    no: 347,
    cat: 'estate',
    zh: '關係人連連看',
    en: 'Who Does What',
    desc: '買方在中間，建商、代銷、銀行、地政士一張張連上線，線上跑著彼此之間的「錢、約、件」',
    tags: ['關係', '流程', '說明', '買房'],
    tone: 'ink',
    preferredRatio: '16:9',
    sample: ['你（買方）', '建商=買賣契約', '代銷=帶看議價', '銀行=房貸', '地政士=過戶'],
    hint: '第一行是中心角色；其餘 2–6 行寫「角色=你跟他之間的事」（例：銀行=房貸）',
    motion: '中央一張主色名牌卡（中心角色）先彈出；接著周圍的角色卡依序從遠處滑進定位，每張卡出現時都有一條線從中心畫向它，線的中段貼著一個小標籤寫出雙方的關係。全部連好後，每條線上有一顆副色小圓點從中心往外來回跑動，代表往來。停留後淡出循環。',
    motionEn: 'A central accent name card (the main role) pops in first; then surrounding role cards slide into place one by one, each with a line drawing from the centre to it and a small label on the line naming the relationship. Once all are connected, a small accent-2 dot shuttles out and back along every line to show the exchange. After a hold everything fades and loops.',
    css: `
.S .g{position:absolute;inset:6cqh 5cqw;animation:K_o 6s ease infinite both}
.S svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.S line{vector-effect:non-scaling-stroke;stroke:var(--fg);stroke-width:calc(var(--u)*.45);stroke-dasharray:100 100;stroke-dashoffset:100;animation:K_ln 6s ease infinite both;animation-delay:calc(.35s + var(--i)*.28s)}
.S .cd{position:absolute;left:var(--x);top:var(--y);transform:translate(-50%,-50%);background:var(--bg);border:calc(var(--u)*.5) solid var(--fg);box-shadow:calc(var(--u)*.8) calc(var(--u)*.8) 0 var(--fg);padding:calc(var(--u)*1.3) calc(var(--u)*2.2);font-size:calc(var(--u)*3.6);white-space:nowrap;animation:K_in 6s cubic-bezier(.3,1.5,.5,1) infinite both;animation-delay:calc(.35s + var(--i)*.28s)}
.S .me{background:var(--ac);color:var(--bg);font-size:calc(var(--u)*4.6);padding:calc(var(--u)*1.8) calc(var(--u)*3);animation-delay:0s;z-index:2}
.S .rl{position:absolute;left:calc((50% + var(--x))/2);top:calc((50% + var(--y))/2);transform:translate(-50%,-50%);background:var(--fg);color:var(--bg);font-size:calc(var(--u)*2.5);padding:.3em .6em;white-space:nowrap;animation:K_in 6s cubic-bezier(.3,1.5,.5,1) infinite both;animation-delay:calc(.7s + var(--i)*.28s);z-index:1}
.S .dot{position:absolute;width:calc(var(--u)*3.2);height:calc(var(--u)*3.2);z-index:1;border-radius:50%;background:var(--ac2);border:calc(var(--u)*.4) solid var(--fg);transform:translate(-50%,-50%);animation:K_dot 6s ease-in-out infinite both;animation-delay:calc(var(--i)*.12s)}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.35)}.S .g{inset:18cqh 4cqw}}
@keyframes K_ln{0%{stroke-dashoffset:100}10%,100%{stroke-dashoffset:0}}
@keyframes K_in{0%{opacity:0;scale:.4}7%,100%{opacity:1;scale:1}}
@keyframes K_dot{0%,40%{left:50%;top:50%;opacity:0}43%{opacity:1}58%{left:var(--x);top:var(--y)}73%{left:50%;top:50%}88%{left:var(--x);top:var(--y);opacity:1}92%,100%{opacity:0}}
@keyframes K_o{0%,92%{opacity:1}100%{opacity:0}}`,
    html: (w) => {
      const [me, ...rest] = given(w, ['你（買方）', '建商=買賣契約', '代銷=帶看議價', '銀行=房貸', '地政士=過戶']);
      const ps = (rest.length ? rest : ['對方=往來']).slice(0, 6).map(kv);
      const n = ps.length;
      const pos = ps.map((_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n + (n === 2 ? Math.PI / 2 : n === 4 ? Math.PI / 4 : 0);
        return { x: 50 + Math.cos(a) * 38, y: 50 + Math.sin(a) * 38 };
      });
      const lines = pos.map((p, i) => `<line style="--i:${i}" x1="50" y1="50" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" pathLength="100"/>`).join('');
      const v = (p: { x: number; y: number }, i: number) => `--i:${i};--x:${p.x.toFixed(1)}%;--y:${p.y.toFixed(1)}%`;
      const cards = ps.map((p, i) => `${p.v ? `<div class="rl" style="${v(pos[i], i)}">${esc(p.v)}</div>` : ''}<div class="dot" style="${v(pos[i], i)}"></div><div class="cd" style="${v(pos[i], i)}">${esc(p.k)}</div>`).join('');
      return `<div class="g"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>${cards}<div class="cd me" style="--i:0;--x:50%;--y:50%">${esc(me)}</div></div>`;
    },
  },
  {
    ...base,
    id: 'yes-no-sign',
    no: 348,
    cat: 'estate',
    zh: 'Yes/No 岔路牌',
    en: 'Yes / No Signpost',
    desc: '問題牌掛上立柱，左右兩塊箭頭路牌一個先亮、一個後亮，講「如果是…就…」',
    tags: ['判斷', '流程', '問答', '買房'],
    tone: 'ink',
    preferredRatio: '16:9',
    sample: ['自備款有 3 成嗎？', '有', '可以開始看屋', '沒有', '先存錢或評估新青安'],
    hint: '問題 / 是的標籤 / 是的結果 / 否的標籤 / 否的結果（例：自備款有 3 成嗎？ / 有 / 可以開始看屋 / 沒有 / 先存錢）',
    motion: '畫面中央一根立柱從下往上長出，頂端掛上一塊主色問題牌（輕晃一下）。接著柱子兩側各彈出一塊箭頭形路牌：左邊寫「是」的答案、右邊寫「否」的答案，一開始都是暗的。先是左牌亮起（填滿主色、往箭頭方向推一下），然後暗下、換右牌亮起（填滿副色）。停留後整組淡出循環。直式時兩塊牌改成上下排列。',
    motionEn: 'A post grows up from the bottom centre and an accent question sign hangs from its top with a small swing. Two arrow-shaped signs pop out on either side — the "yes" answer on the left, the "no" answer on the right — both dim at first. The left one lights up (fills with the accent and nudges in its direction), then dims as the right one lights up in accent-2. After a hold everything fades and loops. In portrait the two signs stack vertically.',
    css: `
.S .g{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*3);animation:K_o 6s ease infinite both}
.S .q{background:var(--ac);color:var(--bg);font-size:calc(var(--u)*5.4);padding:calc(var(--u)*2) calc(var(--u)*3.4);border:calc(var(--u)*.6) solid var(--fg);box-shadow:calc(var(--u)*1) calc(var(--u)*1) 0 var(--fg);transform-origin:50% 0;animation:K_q 6s ease infinite both;white-space:nowrap}
.S .row{position:relative;display:flex;gap:calc(var(--u)*10);align-items:center}
.S .post{position:absolute;left:50%;top:calc(var(--u)*-6);bottom:calc(var(--u)*-8);width:calc(var(--u)*1.4);margin-left:calc(var(--u)*-.7);background:var(--fg);transform-origin:50% 100%;animation:K_p 6s ease infinite both}
.S{--dim:color-mix(in srgb,var(--fg) 12%,var(--bg))}
.S .sg{position:relative;display:flex;flex-direction:column;gap:calc(var(--u)*1);padding:calc(var(--u)*1.8) calc(var(--u)*5);min-width:calc(var(--u)*30);color:var(--fg);background:var(--dim);animation:K_in 6s cubic-bezier(.3,1.5,.5,1) infinite both}
.S .y{clip-path:polygon(12% 0,100% 0,100% 100%,12% 100%,0 50%);padding-left:calc(var(--u)*7);animation-name:K_in,K_y}
.S .n{clip-path:polygon(0 0,88% 0,100% 50%,88% 100%,0 100%);padding-right:calc(var(--u)*7);animation-name:K_in,K_n}
.S .sg b{font-size:calc(var(--u)*3);opacity:.75}
.S .sg span{font-size:calc(var(--u)*4.2);white-space:nowrap}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.3)}.S .row{flex-direction:column;gap:calc(var(--u)*5)}.S .q{font-size:calc(var(--u)*6.4)}.S .sg{min-width:calc(var(--u)*56)}.S .sg span{font-size:calc(var(--u)*5)}}
@keyframes K_p{0%{transform:scaleY(0)}8%,100%{transform:none}}
@keyframes K_q{0%,6%{opacity:0;transform:translateY(-30%) rotate(-6deg)}12%{opacity:1;transform:rotate(3deg)}16%,100%{opacity:1;transform:none}}
@keyframes K_in{0%,16%{opacity:0;scale:.5}24%,100%{opacity:1;scale:1}}
@keyframes K_y{0%,30%{background:var(--dim);color:var(--fg);translate:0}36%{background:var(--ac);color:var(--bg);translate:-4% 0}40%,54%{background:var(--ac);color:var(--bg);translate:0}60%,100%{background:var(--dim);color:var(--mu);translate:0}}
@keyframes K_n{0%,56%{background:var(--dim);color:var(--fg);translate:0}62%{background:var(--ac2);color:var(--bg);translate:4% 0}66%,100%{background:var(--ac2);color:var(--bg);translate:0}}
@keyframes K_o{0%,92%{opacity:1}100%{opacity:0}}`,
    html: (w) => {
      const g = w.map((s) => String(s ?? '').trim());
      const [q, yl, yr, nl, nr] = g.some(Boolean) ? [g[0] || '？', g[1] || '是', g[2] || '', g[3] || '否', g[4] || ''] : ['自備款有 3 成嗎？', '有', '可以開始看屋', '沒有', '先存錢或評估新青安'];
      const sign = (c: string, l: string, r: string) => `<div class="sg ${c}"><b>${esc(l)}</b>${r ? `<span>${esc(r)}</span>` : ''}</div>`;
      return `<div class="g"><div class="q">${esc(q)}</div><div class="row"><i class="post"></i>${sign('y', yl, yr)}${sign('n', nl, nr)}</div></div>`;
    },
  },
  {
    ...base,
    id: 'price-split',
    no: 349,
    cat: 'estate',
    zh: '總價剪三段',
    en: 'Price Cut Apart',
    desc: '一條總價長條被剪刀剪開，依比例分成房價、車位、裝潢等幾段，每段標上金額',
    tags: ['數據', '房價', '拆解', '計算'],
    tone: 'ink',
    preferredRatio: '16:9',
    sample: ['總價', '房價 1,500萬', '車位 220萬', '裝潢 160萬'],
    hint: '第一行是總名稱；其餘 2–5 行「項目 金額」（同單位），總額自動加總、長度依比例；數字請用可查證資料',
    motion: '一條粗框長條從左到右拉出，上面寫「總價 1,880萬」（自動加總）。一把剪刀從左邊沿著長條滑過，經過每個分段點時「喀」一下，長條就在那裡斷開；全部剪完後各段往下錯開、彼此拉開距離，每段依序換成不同顏色並在下方彈出項目與金額。停留後淡出循環。',
    motionEn: 'A thick outlined bar draws out left to right, labelled with the auto-summed total. A pair of scissors slides along it from the left, snipping at each split point so the bar breaks there; once cut, the pieces drop and spread apart, each taking a different colour, with its item name and amount popping in below. After a hold everything fades and loops.',
    css: `
.S .g{width:86cqw;display:flex;flex-direction:column;gap:calc(var(--u)*3);animation:K_o 6s ease infinite both}
.S .tt{font-size:calc(var(--u)*4.4);display:flex;gap:.5em;align-items:baseline;animation:K_tt 6s ease infinite both}
.S .tt b{font-size:1.9em;color:var(--ac)}
.S .bar{position:relative;display:flex;height:calc(var(--u)*9)}
.S .sc{position:absolute;top:50%;left:0;width:calc(var(--u)*7);height:calc(var(--u)*7);translate:-50% -50%;animation:K_sc 6s cubic-bezier(.5,0,.5,1) infinite both;z-index:3}
.S .sc svg{width:100%;height:100%;overflow:visible}
.S .sc .bl{fill:var(--fg);transform-origin:50% 50%;animation:K_snip .5s ease-in-out infinite alternate}
.S .sc .bl2{animation-direction:alternate-reverse}
.S .pc{position:relative;flex:var(--w) 1 0;height:100%;border:calc(var(--u)*.6) solid var(--fg);margin-left:calc(var(--u)*-.6);background:var(--bg);clip-path:inset(-20% calc(100% - var(--rv)) -60% -20%);animation:K_draw 6s ease infinite both,K_drop 6s cubic-bezier(.3,1.4,.5,1) infinite both}
.S .pc:first-of-type{margin-left:0}
.S .pc i{position:absolute;inset:0;background:var(--c);opacity:var(--fill,0)}
.S .lg{display:flex;flex-wrap:wrap;gap:calc(var(--u)*2) calc(var(--u)*4);margin-top:calc(var(--u)*3)}
.S .li{display:flex;align-items:center;gap:calc(var(--u)*1.2);white-space:nowrap;animation:K_li 6s cubic-bezier(.3,1.6,.5,1) infinite both;animation-delay:calc(var(--i)*.12s)}
.S .li i{width:calc(var(--u)*3);height:calc(var(--u)*3);background:var(--c);border:calc(var(--u)*.4) solid var(--fg)}
.S .li b{font-size:calc(var(--u)*3.2);opacity:.75}.S .li span{font-size:calc(var(--u)*4.6)}
.S [data-k='0']{--c:var(--ac)}.S [data-k='1']{--c:var(--ac2)}.S [data-k='2']{--c:var(--fg)}.S [data-k='3']{--c:var(--mu)}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.3)}.S .g{width:84cqw}}
@property --rv{syntax:"<percentage>";inherits:false;initial-value:0%}
@property --fill{syntax:"<number>";inherits:true;initial-value:0}
@keyframes K_tt{0%{opacity:0;translate:0 30%}6%,100%{opacity:1;translate:0}}
@keyframes K_draw{0%,4%{--rv:0%}14%,100%{--rv:100%}}
@keyframes K_sc{0%,16%{left:-4%;opacity:0}20%{opacity:1}52%{left:104%;opacity:1}56%,100%{left:108%;opacity:0}}
@keyframes K_li{0%,58%{opacity:0;translate:0 40%}64%,92%{opacity:1;translate:0}100%{opacity:1}}
@keyframes K_snip{from{rotate:-14deg}to{rotate:6deg}}
@keyframes K_drop{0%,54%{translate:0 0;--fill:0;margin-right:0}62%{--fill:1}64%,100%{translate:0 calc(var(--d)*var(--u)*2.2);--fill:1;margin-right:calc(var(--u)*2.2)}}
@keyframes K_o{0%,92%{opacity:1}100%{opacity:0}}`,
    html: (w) => {
      const [title, ...rest] = given(w, ['總價', '房價 1,500萬', '車位 220萬', '裝潢 160萬']);
      const items = (rest.length ? rest : ['項目 1']).slice(0, 5).map(kv);
      const nums = items.map((x) => parseNum(x.v));
      const ok = nums.filter((v) => Number.isFinite(v) && v > 0);
      const unit = unitOf(items.find((x) => x.v)?.v ?? '');
      const like = items.find((x) => /,/.test(x.v))?.v ?? '0';
      const total = ok.length ? fmtLike(ok.reduce((a, b) => a + b, 0), like) + unit : '';
      const avg = ok.length ? ok.reduce((a, b) => a + b, 0) / ok.length : 1;
      const pcs = items.map((x, i) => {
        // 太小的段至少留 9% 寬，字才放得下
        const v = Number.isFinite(nums[i]) && nums[i] > 0 ? nums[i] : avg;
        return `<div class="pc" data-k="${i % 4}" style="--w:${Math.max(v, avg * 0.35).toFixed(2)};--d:${i % 2 ? 1.6 : 0.6}"><i></i></div>`;
      }).join('');
      const legend = items.map((x, i) => `<div class="li" data-k="${i % 4}" style="--i:${i}"><i></i><b>${esc(x.k)}</b>${x.v ? `<span>${esc(x.v)}</span>` : ''}</div>`).join('');
      const sc = `<svg viewBox="-50 -50 100 100"><g class="bl"><path d="M-6 -4 L46 -10 L46 -2 L-6 4 Z"/><circle cx="-24" cy="-14" r="13" fill="none" stroke="var(--fg)" stroke-width="7"/><path d="M-6 -4 -16 -8" stroke="var(--fg)" stroke-width="7"/></g><g class="bl bl2"><path d="M-6 4 L46 10 L46 2 L-6 -4 Z"/><circle cx="-24" cy="14" r="13" fill="none" stroke="var(--fg)" stroke-width="7"/><path d="M-6 4 -16 8" stroke="var(--fg)" stroke-width="7"/></g></svg>`;
      return `<div class="g"><div class="tt">${esc(title)}${total ? `<b>${esc(total)}</b>` : ''}</div><div class="bar">${pcs}<div class="sc">${sc}</div></div><div class="lg">${legend}</div></div>`;
    },
  },
  {
    ...base,
    id: 'good-bad-light',
    no: 350,
    cat: 'estate',
    zh: '好壞範例紅綠燈',
    en: 'Do / Don’t Traffic Light',
    desc: '紅綠燈先亮紅燈照在錯誤做法上（打叉、震一下），再亮綠燈照在正確做法上（畫圈）',
    tags: ['對比', '警示', '看屋', '重點'],
    tone: 'ink',
    preferredRatio: '16:9',
    sample: ['看屋只看裝潢', '先看結構、漏水與採光'],
    hint: '錯誤做法 / 正確做法；可再加標籤：錯誤 / 正確 / 錯誤標籤 / 正確標籤（預設「NG」「OK」）',
    motion: '左側一座直立紅綠燈（深色燈箱，三顆燈都暗），右側上下兩張卡片：上卡寫錯誤做法、下卡寫正確做法。先亮紅燈，一道紅光照向上卡，上卡框線變紅、左右震一下，蓋上紅色「✕ NG」章；接著紅燈熄滅、亮綠燈，綠光照向下卡，下卡框線變綠、微微浮起，蓋上綠色「○ OK」章。停留後淡出循環。直式時紅綠燈改成橫放在上方。',
    motionEn: 'On the left stands a vertical traffic light (dark housing, all three lamps off); on the right are two cards, the wrong way on top and the right way below. The red lamp lights first and a red beam hits the top card: its border turns red, it shakes, and a red "✕ NG" stamp lands. Then red goes off and green lights: a green beam hits the bottom card, its border turns green, it lifts slightly, and a green "○ OK" stamp lands. After a hold everything fades and loops. In portrait the light lies horizontally on top.',
    css: `
.S{--red:#ef4444;--grn:#22c55e}
.S .g{display:flex;align-items:center;gap:calc(var(--u)*6);animation:K_o 6s ease infinite both}
.S .tl{display:flex;flex-direction:column;gap:calc(var(--u)*1.6);padding:calc(var(--u)*1.8);background:#1b1d22;border:calc(var(--u)*.6) solid var(--fg);border-radius:calc(var(--u)*2.4);box-shadow:calc(var(--u)*1) calc(var(--u)*1) 0 var(--fg)}
.S .lp{width:calc(var(--u)*7);height:calc(var(--u)*7);border-radius:50%;background:#3a3d44}
.S .lr{animation:K_lr 6s steps(1) infinite both}.S .lg{animation:K_lg 6s steps(1) infinite both}
.S .cs{display:flex;flex-direction:column;gap:calc(var(--u)*4)}
.S .cd{position:relative;min-width:calc(var(--u)*52);padding:calc(var(--u)*3) calc(var(--u)*4);background:var(--bg);border:calc(var(--u)*.6) solid var(--mu);font-size:calc(var(--u)*4.6);white-space:nowrap}
.S .cd small{display:block;font-size:.6em;opacity:.7;margin-bottom:.5em}
.S .bad{animation:K_bad 6s ease infinite both}.S .good{animation:K_good 6s ease infinite both}
.S .stp{position:absolute;right:calc(var(--u)*-3);top:calc(var(--u)*-3);font-size:calc(var(--u)*3.4);padding:.25em .5em;border:calc(var(--u)*.5) solid;background:var(--bg);rotate:-12deg;animation:K_st 6s cubic-bezier(.3,1.8,.5,1) infinite both}
.S .bad .stp{color:var(--red)}.S .good .stp{color:var(--grn);animation-delay:2s}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.4)}.S .g{flex-direction:column}.S .tl{flex-direction:row}.S .cd{min-width:calc(var(--u)*60);font-size:calc(var(--u)*5)}}
@keyframes K_lr{0%{background:#3a3d44;box-shadow:none}14%{background:var(--red);box-shadow:0 0 calc(var(--u)*4) var(--red)}46%,100%{background:#3a3d44;box-shadow:none}}
@keyframes K_lg{0%{background:#3a3d44;box-shadow:none}46%,92%{background:var(--grn);box-shadow:0 0 calc(var(--u)*4) var(--grn)}100%{background:#3a3d44;box-shadow:none}}
@keyframes K_bad{0%,14%{border-color:var(--mu);translate:0}16%{border-color:var(--red);translate:-2% 0}18%{translate:2% 0}20%{translate:-1.5% 0}22%{translate:1% 0}24%,46%{translate:0;border-color:var(--red);opacity:1}50%,100%{border-color:var(--red);opacity:.55}}
@keyframes K_good{0%,46%{border-color:var(--mu);translate:0;box-shadow:none}52%,100%{border-color:var(--grn);translate:0 -6%;box-shadow:calc(var(--u)*1) calc(var(--u)*1) 0 var(--grn)}}
@keyframes K_st{0%,20%{opacity:0;scale:1.8}26%,100%{opacity:1;scale:1}}
@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}`,
    html: (w) => {
      const g = w.map((s) => String(s ?? '').trim());
      const has = g.some(Boolean);
      const [bad, good, bl, gl, bs, gs] = has ? [g[0] || '', g[1] || '', g[2] || '錯誤', g[3] || '正確', g[4] || 'NG', g[5] || 'OK'] : ['看屋只看裝潢', '先看結構、漏水與採光', '錯誤', '正確', 'NG', 'OK'];
      return `<div class="g"><div class="tl"><i class="lp lr"></i><i class="lp"></i><i class="lp lg"></i></div><div class="cs"><div class="cd bad"><small>${esc(bl)}</small>${esc(bad)}<span class="stp">✕ ${esc(bs)}</span></div><div class="cd good"><small>${esc(gl)}</small>${esc(good)}<span class="stp">○ ${esc(gs)}</span></div></div></div>`;
    },
  },
  {
    ...base,
    id: 'door-pick',
    no: 351,
    cat: 'estate',
    zh: '方案三選一・開門',
    en: 'Pick-a-Door Plans',
    desc: '三扇掛著門牌的門排排站，推薦的那扇門打開，裡面亮出「推薦」與重點',
    tags: ['比較', '選擇', '貸款', '方案'],
    tone: 'ink',
    preferredRatio: '16:9',
    sample: ['20 年 月付約 7.2萬', '*30 年 月付約 5.3萬', '40 年 月付約 4.4萬'],
    hint: '2–4 個方案，每行「門牌 說明」；推薦的那個在最前面加 *（沒有加就推薦中間那個）；數字請標示為示意或附來源',
    motion: '三扇粗框的門依序從下往上彈出排成一列，每扇門上掛著寫方案名稱的門牌，門把是副色小圓點。其他門輕輕晃一下表示「挑一個」，接著推薦的那扇門以左側門軸往內打開，門後是主色的亮面，浮出「推薦」小章與方案說明，其他門變暗。停留後門關上、淡出循環。直式時門的高度縮短、說明字變大。',
    motionEn: 'Three thick-outlined doors pop up one by one into a row, each with a house-number plate naming the plan and a small accent-2 knob. The doors wiggle slightly as if to say "pick one", then the recommended door swings open on its left hinge to reveal an accent-lit interior with a "pick" stamp and the plan details, while the other doors dim. After a hold the door closes and everything fades and loops.',
    css: `
.S .g{display:flex;gap:calc(var(--u)*4);align-items:flex-end;animation:K_o 6s ease infinite both}
.S .dr{position:relative;width:calc(var(--u)*27);height:calc(var(--u)*40);perspective:calc(var(--u)*80);animation:K_in 6s cubic-bezier(.3,1.5,.5,1) infinite both;animation-delay:calc(var(--i)*.15s)}
.S .in{position:absolute;inset:0;background:var(--ac);color:var(--bg);border:calc(var(--u)*.6) solid var(--fg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*2);padding:calc(var(--u)*2);text-align:center}
.S .in b{font-size:calc(var(--u)*3);border:calc(var(--u)*.45) solid var(--bg);padding:.2em .5em;rotate:-8deg}
.S .in span{font-size:calc(var(--u)*3.3);line-height:1.25;white-space:nowrap}
.S .lf{position:absolute;inset:0;background:var(--bg);border:calc(var(--u)*.6) solid var(--fg);box-shadow:calc(var(--u)*1) calc(var(--u)*1) 0 var(--fg);transform-origin:0 50%;display:flex;flex-direction:column;align-items:center;padding-top:calc(var(--u)*5);animation:K_wig 6s ease infinite both}
.S .lf::after{content:"";position:absolute;right:calc(var(--u)*2.6);top:55%;width:calc(var(--u)*2.4);height:calc(var(--u)*2.4);border-radius:50%;background:var(--ac2);border:calc(var(--u)*.4) solid var(--fg)}
.S .lf{transform-style:preserve-3d}.S .pl{backface-visibility:hidden;background:var(--fg);color:var(--bg);font-size:calc(var(--u)*4);padding:.35em .6em;white-space:nowrap}
.S .pk .lf{animation:K_wig 6s ease infinite both,K_open 6s cubic-bezier(.5,0,.3,1) infinite both}
.S .dr:not(.pk){animation-name:K_in,K_dim;animation-timing-function:cubic-bezier(.3,1.5,.5,1),ease}
@container (aspect-ratio < 1){.S .g{gap:calc(var(--u)*2.4)}.S .dr{width:calc(var(--u)*29);height:calc(var(--u)*46)}.S .in span{font-size:calc(var(--u)*4.2)}}
@keyframes K_in{0%{opacity:0;translate:0 40%}8%,100%{opacity:1;translate:0}}
@keyframes K_wig{0%,22%{rotate:0deg}25%{rotate:-2deg}28%{rotate:2deg}31%,100%{rotate:0deg}}
@keyframes K_open{0%,38%{transform:none}52%,84%{transform:rotateY(-112deg)}92%,100%{transform:none}}
@keyframes K_dim{0%,40%{opacity:1;filter:none}50%,84%{opacity:.45;filter:saturate(.3)}92%,100%{opacity:1;filter:none}}
@keyframes K_o{0%,92%{opacity:1}100%{opacity:0}}`,
    html: (w) => {
      const list = given(w, ['20 年 月付約 7.2萬', '*30 年 月付約 5.3萬', '40 年 月付約 4.4萬']).slice(0, 4);
      let pk = list.findIndex((s) => s.startsWith('*'));
      if (pk < 0) pk = Math.floor((list.length - 1) / 2);
      const doors = list.map((s, i) => {
        const t = s.replace(/^\*\s*/, '');
        // 門牌：開頭的數字＋單位（20 年）或第一個詞
        const m = t.match(/^([\d.,]+\s*\S+?|\S+)\s+(.*)$/);
        const [plate, info] = m ? [m[1], m[2]] : [t, ''];
        return `<div class="dr${i === pk ? ' pk' : ''}" style="--i:${i}"><div class="in"><b>推薦</b><span>${esc(plate)}</span>${info ? `<span>${esc(info)}</span>` : ''}</div><div class="lf"><span class="pl">${esc(plate)}</span></div></div>`;
      }).join('');
      return `<div class="g">${doors}</div>`;
    },
  },
];
