import type { Fx } from '../types';
import { esc } from '../util';

// 2026-10-27 圖解動畫批次 B6（374–375）：caption 1 個、news 1 個（最後一批）
const base = { added: '2026-10-27', tone: 'ink' as const, preferredRatio: '16:9' as const };
const given = (w: string[], fb: string[]) => {
  const g = w.map((s) => String(s ?? '').trim()).filter(Boolean);
  return g.length ? g : fb;
};
const OUT = `@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}`;
// 台灣股市慣例：漲紅跌綠
const UP = '#e63946', DN = '#2a9d8f';

export const finalExplain: Fx[] = [
  {
    ...base,
    id: 'updown-board',
    no: 374,
    cat: 'caption',
    zh: '漲跌箭頭牌',
    en: 'Up/Down Board',
    desc: '股價看板式翻牌，數字翻出來後漲跌箭頭彈跳（漲紅跌綠）',
    tags: ['漲跌', '房價', '看板'],
    sample: ['房價 +24%', '交易量 −8%'],
    hint: '每行一張牌：「名稱 +24%」或「名稱 −8%」；正數為漲（紅▲）、負數為跌（綠▼），最多 4 張',
    motion: '深色看板上一排翻牌依序上下翻開（像機場／股價看板），翻出漲跌數字；接著每張牌的箭頭彈跳三下，漲的紅色往上跳、跌的綠色往下跳，牌底亮起同色光條。',
    motionEn: 'A row of split-flap cards on a dark board flips open one by one to reveal the change; then each arrow bounces three times — red up for gains, green down for drops — and a matching light bar glows under each card.',
    css: `.S{--u:calc(min(1cqw,1.7778cqh)*1.2)}
.S .g{position:absolute;inset:0;display:grid;place-items:center;animation:K_o 7s ease infinite both}
.S .row{display:flex;gap:calc(var(--u)*3);perspective:calc(var(--u)*120)}
.S .cd{position:relative;width:calc(var(--u)*26);padding:calc(var(--u)*2.2) 0 calc(var(--u)*2.6);background:#15171c;border-radius:calc(var(--u)*1.6);box-shadow:0 calc(var(--u)*1) calc(var(--u)*3) #0007;text-align:center;color:#f4f1ea;overflow:hidden}
.S .cd::after{content:'';position:absolute;left:0;right:0;top:50%;height:calc(var(--u)*.3);background:#000a}
.S .k{font-size:calc(var(--u)*3.2);font-weight:900;opacity:.8}
.S .fl{display:block;font:normal 900 calc(var(--u)*7.4) var(--mono);letter-spacing:-.02em;color:var(--c);transform-origin:50% 50%;animation:K_fl 7s cubic-bezier(.3,1.4,.5,1) infinite both;animation-delay:calc(var(--i)*.4s)}
.S .ar{display:inline-block;font-size:calc(var(--u)*5.6);color:var(--c);animation:K_ar 7s ease infinite both;animation-delay:calc(var(--i)*.4s)}
.S .bar{position:absolute;left:0;right:0;bottom:0;height:calc(var(--u)*1);background:var(--c);box-shadow:0 0 calc(var(--u)*3) var(--c);transform-origin:left;animation:K_bar 7s ease infinite both;animation-delay:calc(var(--i)*.4s)}
.S .cd.dn .ar{animation-name:K_ad}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.6)}.S .row{flex-direction:column}.S .cd{width:calc(var(--u)*34)}}
@keyframes K_fl{0%,6%{transform:rotateX(90deg);opacity:0}16%,100%{transform:none;opacity:1}}
@keyframes K_ar{0%,24%{opacity:0;transform:translateY(40%)}28%,38%,48%{opacity:1;transform:translateY(-35%)}33%,43%,53%,100%{opacity:1;transform:none}}
@keyframes K_ad{0%,24%{opacity:0;transform:translateY(-40%)}28%,38%,48%{opacity:1;transform:translateY(35%)}33%,43%,53%,100%{opacity:1;transform:none}}
@keyframes K_bar{0%,24%{transform:scaleX(0)}34%,100%{transform:none}}
${OUT}`,
    html: (w) => {
      const it = given(w, ['房價 +24%', '交易量 −8%']).slice(0, 4).map((s) => {
        const m = s.match(/^(.*?)\s*([+\-−－]?\s*[\d.,]+\s*%?)\s*$/);
        const k = m ? m[1] : s, v = m ? m[2].replace(/\s/g, '') : '';
        const dn = /^[-−－]/.test(v);
        return { k, v: v.replace(/^[-－]/, '−'), dn };
      });
      return `<div class="g"><div class="row">${it.map((o, i) => `<div class="cd${o.dn ? ' dn' : ''}" style="--i:${i};--c:${o.dn ? DN : UP}"><div class="k">${esc(o.k)}</div><b class="fl">${esc(o.v)} <span class="ar">${o.dn ? '▼' : '▲'}</span></b><i class="bar"></i></div>`).join('')}</div></div>`;
    },
  },
  {
    ...base,
    id: 'clause-mark',
    no: 375,
    cat: 'news',
    zh: '條文框選',
    en: 'Clause Mark',
    desc: '文件往上捲動停住，紅筆把關鍵條文框起來並寫上註記',
    tags: ['契約', '條文', '重點'],
    sample: ['不動產買賣契約書（示意）', '第一條 買賣標的', '第二條 價款與付款方式', '第三條 產權移轉', '第四條 稅費負擔', '>第五條 違約時，買方已付價款之 15% 作為違約金', '第六條 點交', '第七條 其他約定', '!違約金上限要看清楚'],
    hint: '第 1 行是文件標題；之後每行一條；要框的那行前面加「>」；「!」開頭寫紅筆註記',
    motion: '一張米白文件從下往上捲動，停在關鍵條文；紅筆沿著那一行畫出手繪框（筆畫一圈畫完），其他行變淡，旁邊斜斜跳出紅色手寫註記和箭頭。',
    motionEn: 'An off-white document scrolls up and stops on the key clause; a red pen draws a hand-drawn box around that line in one stroke, the other lines fade, and a slanted red handwritten note with an arrow pops in beside it.',
    css: `.S{--u:calc(min(1cqw,1.7778cqh)*1.15)}
.S .g{position:absolute;inset:0;overflow:hidden;animation:K_o 7s ease infinite both}
.S .doc{position:absolute;left:50%;top:0;width:calc(var(--u)*82);margin-left:calc(var(--u)*-41);padding:calc(var(--u)*6) calc(var(--u)*6) calc(var(--u)*30);background:#f6f2e8;color:#22252b;box-shadow:0 0 calc(var(--u)*4) #0006;animation:K_sc 7s cubic-bezier(.4,0,.2,1) infinite both}
.S .doc h4{margin:0 0 calc(var(--u)*3);font-size:calc(var(--u)*4.2);text-align:center;font-weight:900}
.S .ln{position:relative;min-height:calc(var(--u)*7);display:flex;align-items:center;font-size:calc(var(--u)*3);border-bottom:1px solid #0001;animation:K_dim 7s ease infinite both}
.S .ln.t{animation:none;font-weight:900}
.S .bx{position:absolute;inset:calc(var(--u)*.4) calc(var(--u)*-2);border:calc(var(--u)*.55) solid #d62828;border-radius:calc(var(--u)*1.6) calc(var(--u)*.8) calc(var(--u)*2) calc(var(--u)*1);rotate:-.6deg;animation:K_dr 7s ease infinite both}
.S .nt{position:absolute;right:calc(var(--u)*-4);bottom:calc(100% + var(--u)*1);rotate:-6deg;color:#d62828;font-size:calc(var(--u)*3.6);font-weight:900;white-space:nowrap;animation:K_nt 7s cubic-bezier(.3,1.8,.5,1) infinite both}
.S .nt::after{content:'↙';margin-left:calc(var(--u)*1)}
.S .tag{position:absolute;right:calc(var(--u)*2);bottom:calc(var(--u)*2);font-size:calc(var(--u)*1.8);color:var(--fg);opacity:.6}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.1)}.S .doc{width:calc(var(--u)*86);margin-left:calc(var(--u)*-43)}.S .ln{font-size:calc(var(--u)*3.4)}.S .nt{right:0}}
@keyframes K_sc{0%{transform:translateY(100cqh)}30%,100%{transform:translateY(calc(50cqh - var(--y)))}}
@keyframes K_dim{0%,34%{opacity:1}42%,100%{opacity:.35}}
@keyframes K_dr{0%,34%{clip-path:inset(0 100% 0 0)}50%,100%{clip-path:inset(0 0 0 0)}}
@keyframes K_nt{0%,52%{opacity:0;transform:scale(.4)}60%,100%{opacity:1;transform:none}}
${OUT}`,
    html: (w) => {
      const all = given(w, ['不動產買賣契約書（示意）', '第一條 買賣標的', '第二條 價款與付款方式', '>第三條 違約金為總價 15%', '第四條 點交', '!看清楚']);
      const note = (all.find((s) => s.startsWith('!')) || '').slice(1).trim();
      const rows = all.filter((s) => !s.startsWith('!'));
      const title = rows.length > 1 ? rows.shift()! : '文件（示意）';
      const L = rows.slice(0, 10);
      let t = L.findIndex((s) => s.startsWith('>'));
      if (t < 0) t = Math.floor(L.length / 2);
      // 目標行中心距文件頂端：上 padding 6u ＋ 標題約 9u ＋ 行高 7u
      const y = `calc(var(--u)*${(6 + 9 + t * 7 + 3.5).toFixed(1)})`;
      return `<div class="g"><div class="doc" style="--y:${y}"><h4>${esc(title)}</h4>${L.map((s, i) => {
        const tx = s.replace(/^>\s*/, '');
        return i === t ? `<div class="ln t"><i class="bx"></i>${esc(tx)}${note ? `<span class="nt">${esc(note)}</span>` : ''}</div>` : `<div class="ln">${esc(tx)}</div>`;
      }).join('')}</div><span class="tag">示意文件</span></div>`;
    },
  },
];
