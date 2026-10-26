import type { Fx } from '../types';
import { chars, esc, fmtLike, parseNum, pctDrop, pick, unitOf } from '../util';

// 2026-10-26 週報新增五招（341–345）：收據列印、開價劃掉換成交價、字重呼吸波浪、貼紙標題、路標指示牌
const base = { added: '2026-10-26' };

/** 收據品項：「頭期款 400萬」「仲介費=40萬」都可以 */
const receiptItem = (s: string) => {
  const m = String(s).match(/^(.*?)[\s=：:]+(-?[\d,.]+\s*\S*)$/);
  return m ? { k: m[1].trim(), v: m[2].trim() } : { k: String(s).trim(), v: '' };
};

/** 貼紙分塊：連續的英數字（1288、5、km）合成一張貼紙，避免數字之間空隙不一；中文一字一張 */
const stickerChunks = (t: string): string[] => Array.from(String(t).matchAll(/[A-Za-z0-9.,%+\-]+|\S/gu), (m) => m[0]);

const ARROW_DEG: Record<string, number> = { '→': 0, '↘': 45, '↓': 90, '↙': 135, '←': 180, '↖': -135, '↑': -90, '↗': -45 };

export const estateExtra: Fx[] = [
  {
    ...base,
    id: 'receipt-print',
    no: 341,
    cat: 'card',
    zh: '收據列印',
    en: 'Receipt Print',
    desc: '熱感應收據一行一行印出來，最後印出自動加總的 TOTAL',
    tags: ['數據', '清單', '房價', '計算'],
    tone: 'ink',
    preferredRatio: '9:16',
    sample: ['買房要準備多少錢（範例）', '頭期款 400萬', '仲介費 40萬', '代書費 2萬', '契稅 6萬', '裝潢 180萬'],
    hint: '第一行是標題，其餘每行「品項 金額」（例：頭期款 400萬），TOTAL 自動加總；數字請用可查證的資料',
    motion: '畫面上方一台黑色收據機，白色熱感應紙一格一格往下吐出：標題、各品項（品項名＋點點引導線＋金額，等寬字），接著虛線分隔，TOTAL 自動加總後以主色大字重重印下，最後在 TOTAL 下方另起一行蓋上斜斜的「範例」章；紙尾是鋸齒撕紙邊。停留後整張紙被撕下往下掉。',
    motionEn: 'A black receipt printer at the top feeds a white thermal slip down in steps: a title, then line items (name, dotted leader, monospace amount), a dashed rule, and an auto-summed TOTAL slammed in large accent type; a tilted "sample" stamp lands on its own line below the total. The slip has a zigzag torn edge; after a hold it is torn off and drops away.',
    css: `
.S{--r:min(8cqw,4.4cqh)}
.S .g{display:flex;flex-direction:column;align-items:center;--lh:calc(var(--r)*min(1,9/var(--n)))}
.S .prn{width:calc(var(--r)*11.4);height:calc(var(--r)*.7);background:#15171c;border-radius:calc(var(--r)*.2);box-shadow:0 calc(var(--r)*.12) 0 #000,inset 0 calc(var(--r)*-.12) 0 #2c3038;position:relative;z-index:2}
.S .clip{width:calc(var(--r)*10);overflow:hidden;margin-top:calc(var(--r)*-.1);padding-bottom:calc(var(--r)*.6)}
.S .paper{background:#fbfaf6;color:#222;padding:calc(var(--r)*.8) calc(var(--r)*.8) calc(var(--r)*1);font-size:calc(var(--lh)*.5);line-height:1;transform-origin:50% 0;
 -webkit-mask:linear-gradient(#000,#000) top/100% calc(100% - var(--r)*.3 + 2px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/calc(var(--r)*.4) calc(var(--r)*.3) repeat-x;
 filter:drop-shadow(0 calc(var(--r)*.3) calc(var(--r)*.4) #0006);animation:K_feed 7s infinite both}
.S .h{text-align:center;font-size:calc(var(--r)*.62);letter-spacing:.2em;font-family:var(--mono);font-weight:700}
.S .sub{text-align:center;font-size:calc(var(--r)*.34);opacity:.6;margin:calc(var(--r)*.18) 0 calc(var(--r)*.4);font-weight:500}
.S .r{display:flex;align-items:baseline;gap:calc(var(--r)*.2);height:var(--lh);font-weight:500}
.S .r .d{flex:1;border-bottom:calc(var(--r)*.06) dotted #999}
.S .r .v{font-family:var(--mono);font-weight:700}
.S .hr{border-top:calc(var(--r)*.07) dashed #444;margin:calc(var(--r)*.3) 0 calc(var(--r)*.4)}
.S .tot{display:flex;justify-content:space-between;align-items:baseline;font-size:calc(var(--r)*.8);animation:K_tot 7s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .tot .v{color:var(--ac);font-variant-numeric:tabular-nums}
.S .foot{display:flex;justify-content:flex-end;margin-top:calc(var(--r)*.45);height:calc(var(--r)*.9)}
.S .st{border:calc(var(--r)*.09) solid var(--ac);color:var(--ac);font-size:calc(var(--r)*.42);padding:calc(var(--r)*.12) calc(var(--r)*.3);border-radius:calc(var(--r)*.1);animation:K_st 7s cubic-bezier(.3,1.8,.5,1) infinite both}
@keyframes K_feed{0%{transform:translateY(-100%);animation-timing-function:steps(var(--steps),end)}50%{transform:none}90%{transform:none;opacity:1}100%{transform:translateY(40%) rotate(4deg);opacity:0}}
@keyframes K_tot{0%,50%{opacity:0;transform:scale(1.5)}56%,100%{opacity:1;transform:none}}
@keyframes K_st{0%,58%{opacity:0;transform:rotate(-10deg) scale(1.8)}63%,100%{opacity:1;transform:rotate(-10deg)}}`,
    html: (w) => {
      const given = w.filter(Boolean);
      const src = given.length ? given : ['買房要準備多少錢（範例）', '頭期款 400萬', '仲介費 40萬', '代書費 2萬', '契稅 6萬', '裝潢 180萬'];
      const [title, ...rest] = src;
      const items = rest.slice(0, 12).map(receiptItem);
      const nums = items.map((x) => parseNum(x.v)).filter((v) => Number.isFinite(v));
      const unit = unitOf(items.find((x) => x.v)?.v ?? '');
      const like = items.find((x) => /,/.test(x.v))?.v ?? items.find((x) => /\./.test(x.v))?.v ?? '0';
      const total = nums.length ? fmtLike(nums.reduce((a, b) => a + b, 0), like) + unit : '—';
      const n = Math.max(1, items.length);
      const rows = items.map((x) => `<div class="r"><span>${esc(x.k)}</span><span class="d"></span><span class="v">${esc(x.v)}</span></div>`).join('');
      return `<div class="g" style="--n:${n}"><div class="prn"></div><div class="clip"><div class="paper" style="--steps:${n + 4}"><div class="h">RECEIPT</div><div class="sub">${esc(title)}</div>${rows}<div class="hr"></div><div class="tot"><span>TOTAL</span><span class="v">${esc(total)}</span></div><div class="foot"><span class="st">範例</span></div></div></div></div>`;
    },
  },
  {
    ...base,
    id: 'price-strike',
    no: 342,
    cat: 'card',
    zh: '開價劃掉換成交價',
    en: 'Price Strike Drop',
    desc: '舊價格被劃掉變淡，新價格往下數到成交價，自動算出折扣百分比',
    tags: ['數據', '房價', '對比', '重點'],
    tone: 'ink',
    preferredRatio: '9:16',
    sample: ['開價', '1,580萬', '成交', '1,288萬'],
    hint: '上標籤 / 舊價 / 下標籤 / 新價（例：開價 / 1,580萬 / 成交 / 1,288萬）；% 自動計算，數字請附來源與日期',
    motion: '上方小字「開價」與舊價格，一條主色斜線由左往右劃過舊價、舊價變淡；下方小字「成交」，大號新價格從舊價數值往下數到成交價（緩出約 1.2 秒），落地時輕微放大回彈，右上角彈出主色折扣標（例如 -18%，由兩個數字自動計算）。',
    motionEn: 'A small "asking" label and the old price sit on top; an accent slash draws across the old price from left to right and it dims. Below, a "sold" label and a large new price count down from the old value to the final price (ease-out, about 1.2s), bumping slightly as it lands, and an accent discount tag (e.g. -18%, computed from the two numbers) pops in at its upper right.',
    css: `
.S .g{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*1.2);animation:K_o 5s ease infinite}
.S .lb{font-size:calc(var(--u)*2.8);font-weight:500;opacity:.7;letter-spacing:.2em}
.S .old{position:relative;font-size:calc(var(--u)*7.5);font-variant-numeric:tabular-nums;animation:K_dim 5s ease infinite both}
.S .u{font-size:.55em;margin-left:.08em}
.S .sl{position:absolute;left:-5%;right:-5%;top:50%;height:.09em;background:var(--ac);border-radius:.05em;transform-origin:0 50%;animation:K_sl 5s cubic-bezier(.7,0,.3,1) infinite both}
.S .nw{position:relative;font-size:calc(var(--u)*17);line-height:.95;color:var(--ac2);font-variant-numeric:tabular-nums;animation:K_land 5s ease infinite both}
.S .pct{position:absolute;left:100%;top:-.1em;margin-left:calc(var(--u)*1);white-space:nowrap;background:var(--ac);color:#fff;font-size:calc(var(--u)*4);padding:.1em .35em;border-radius:.25em;animation:K_p 5s cubic-bezier(.3,1.8,.5,1) infinite both}
@keyframes K_sl{0%,6%{transform:rotate(-8deg) scaleX(0)}16%,100%{transform:rotate(-8deg) scaleX(1)}}
@keyframes K_dim{0%,12%{opacity:1}22%,100%{opacity:.45}}
@keyframes K_land{0%,42%{transform:none}46%{transform:scale(1.07)}52%,100%{transform:none}}
@keyframes K_p{0%,46%{transform:rotate(8deg) scale(0)}54%,100%{transform:rotate(8deg) scale(1)}}
@keyframes K_o{0%,90%{opacity:1}98%,100%{opacity:0}}`,
    html: (w) => {
      const [l1, a, l2, b] = pick(w, 4, ['開價', '1,580萬', '成交', '1,288萬']);
      const from = parseNum(a);
      const to = parseNum(b);
      const p = pctDrop(from, to);
      const num = (s: string) => String(s).replace(unitOf(s), '').trim();
      const tag = p === null || p === 0 ? '' : `<span class="pct">${p > 0 ? '-' : '+'}${Math.abs(p)}%</span>`;
      return `<div class="g"><div class="lb">${esc(l1)}</div><div class="old">${esc(num(a))}<span class="u">${esc(unitOf(a))}</span><i class="sl"></i></div><div class="lb">${esc(l2)}</div><div class="nw"><span class="n" data-from="${Number.isFinite(from) ? from : ''}" data-to="${esc(num(b))}">${esc(Number.isFinite(from) && Number.isFinite(to) ? num(a) : num(b))}</span><span class="u">${esc(unitOf(b))}</span>${tag}</div></div>`;
    },
    run: (root) => {
      const el = root.querySelector<HTMLElement>('.n');
      if (!el) return;
      const raw = el.dataset.to || '';
      const from = parseFloat(el.dataset.from || '');
      const to = parseFloat(raw.replace(/,/g, ''));
      if (!Number.isFinite(from) || !Number.isFinite(to)) return;
      const dec = (raw.split('.')[1] || '').length;
      const comma = raw.includes(',') || Math.abs(to) >= 10000;
      const fmt = (v: number) => {
        const s = v.toFixed(dec);
        return comma ? Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : s;
      };
      // 跟 CSS 同一個 5 秒循環：0.9 秒開始往下數、1.2 秒數完（緩出）；影片模式數完就停
      const once = !!(globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE;
      const t0 = performance.now();
      let raf = 0;
      const f = (now: number) => {
        let t = (now - t0) / 1000;
        if (!once) t %= 5;
        const p = Math.min(1, Math.max(0, (t - 0.9) / 1.2));
        el.textContent = p >= 1 ? raw : fmt(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (!(once && p >= 1)) raf = requestAnimationFrame(f);
      };
      raf = requestAnimationFrame(f);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    ...base,
    id: 'weight-wave',
    no: 343,
    cat: 'style',
    zh: '字重呼吸波浪',
    en: 'Variable Weight Wave',
    desc: '字不移動，粗細像波浪一樣從左到右一個字一個字變粗再變細',
    tags: ['標題', '地名', '質感', '可變字型'],
    tone: 'ink',
    preferredRatio: '16:9',
    sample: ['淡海新市鎮'],
    hint: '一行 2–8 字的地名或標題；黑體用思源黑體可變字型（平滑），明體沒有可變版，會在幾個字重之間跳動',
    motion: '畫面中央一行大字，位置完全不動，只有字重在變：每個字依序從很細（約 200）平滑變到很粗（900，選了字重就以所選字重為波峰）再變回來，相鄰字相差約 0.2 秒，形成由左往右的呼吸波浪，持續循環。',
    motionEn: 'A single line of large text stays perfectly still while only its weight moves: each character smoothly goes from very thin (about 200) to very bold (900, or the selected weight as the peak) and back, neighbours offset by about 0.2s, so a breathing wave runs left to right in a continuous loop.',
    css: `
.S .w{display:flex;font-family:var(--vf);font-size:calc(var(--u)*14*min(1,6/var(--n)));letter-spacing:.02em;white-space:nowrap}
.S .w .c{--hi:var(--fw,900);--lo:max(100,calc(var(--hi) - 700));--mid:calc((var(--hi) + var(--lo))/2);font-weight:var(--lo);animation:K_w 2.6s linear infinite;animation-delay:calc(var(--i)*-.2s - 2.6s)}
@keyframes K_w{0%{font-weight:var(--lo)}25%{font-weight:var(--mid)}50%{font-weight:var(--hi)}75%{font-weight:var(--mid)}100%{font-weight:var(--lo)}}`,
    html: (w) => {
      const [t] = pick(w, 1, ['淡海新市鎮']);
      const n = Array.from(t).length;
      // data-vw：讓字重選擇器的 !important 不蓋掉逐字字重（見 engine.ts BASE_FX_CSS）
      return `<div class="w" style="--n:${n}">${chars(t).replace(/<span class="c"/g, '<span data-vw class="c"')}</div>`;
    },
  },
  {
    ...base,
    id: 'sticker-title',
    no: 344,
    cat: 'style',
    zh: '貼紙標題',
    en: 'Sticker Title',
    desc: '每個字是一張白色粗外框貼紙，拍上去、翹起晃一下再貼回去',
    tags: ['標題', '生活', '可愛', '優缺點'],
    tone: 'paper',
    preferredRatio: '9:16',
    sample: ['採光好！', '離捷運 5 分鐘'],
    hint: '主標 2–8 字 / 副標（選填）；連續的數字或英文會合成一張貼紙',
    motion: '主標每個字（連續數字或英文合成一張）是一張彩色字＋白色粗外框＋偏移陰影的貼紙，依序從上方斜斜拍到畫面上並輕微回彈，接著每張依序往上翹起、晃一下再貼回去；副標是一條白色圓角貼紙，最後斜斜彈出。停留後整組縮小消失。',
    motionEn: 'Each character of the title (consecutive digits or Latin letters grouped into one) is a sticker: coloured glyphs with a thick white outline and an offset shadow. They slap down from above one by one at slight angles with a small bounce, then each lifts, wobbles and sticks back; a white rounded subtitle sticker pops in at a tilt last. After a hold the group shrinks away.',
    css: `
.S{--u:calc(min(1cqw,1.7778cqh)*1.2)}
.S .g{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*3)}
.S .row{display:flex;align-items:center;flex-wrap:wrap;justify-content:center;max-width:94cqw}
.S .s{display:inline-block;font-weight:max(700,var(--fw,900));font-size:calc(var(--u)*12*min(1,6/var(--n)));color:var(--c);paint-order:stroke fill;-webkit-text-stroke:.2em #fff;letter-spacing:.02em;padding:0 .08em;margin:0 -.04em;filter:drop-shadow(.06em .07em 0 #0003);transform-origin:50% 100%;animation:K_s 4.4s ease infinite both;animation-delay:calc(var(--i)*.08s)}
.S .s:nth-child(3n+1){--c:var(--ac)}.S .s:nth-child(3n+2){--c:var(--ac2)}.S .s:nth-child(3n){--c:var(--fg)}
.S .s:nth-child(odd){--r:-4deg}.S .s:nth-child(even){--r:4deg}
.S .sub{background:#fff;color:#222;font-size:calc(var(--u)*3.6);padding:.3em 1em;border-radius:2em;filter:drop-shadow(.12em .15em 0 #0003);animation:K_b 4.4s cubic-bezier(.3,1.8,.5,1) infinite both}
@keyframes K_s{0%{opacity:0;transform:translateY(-120%) rotate(calc(var(--r)*5)) scale(1.3)}10%{opacity:1;transform:rotate(var(--r)) scale(1)}13%{transform:rotate(var(--r)) scale(1.08)}17%{transform:rotate(var(--r)) scale(1)}28%{transform:rotate(var(--r)) translateY(-8%) rotate(-9deg) scale(1.05)}33%,88%{opacity:1;transform:rotate(var(--r))}100%{opacity:0;transform:rotate(var(--r)) scale(0)}}
@keyframes K_b{0%,22%{opacity:0;transform:rotate(-3deg) scale(0)}30%,88%{opacity:1;transform:rotate(-3deg)}100%{opacity:0;transform:rotate(-3deg) scale(0)}}`,
    html: (w) => {
      const [t, sub] = [w[0] || (w.length ? '' : '採光好！'), w.length ? w[1] : '離捷運 5 分鐘'];
      const cs = stickerChunks(t);
      const n = cs.reduce((a, c) => a + Math.max(1, c.length * 0.6), 0);
      // data-vw＋最低 700：選了細字重（尤其明體細）時貼紙字仍夠粗，白框不會吃掉筆畫
      return `<div class="g"><div class="row" style="--n:${n.toFixed(1)}">${cs.map((c, i) => `<span data-vw class="s" style="--i:${i}">${esc(c)}</span>`).join('')}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>`;
    },
  },
  {
    ...base,
    id: 'road-sign',
    no: 345,
    cat: 'card',
    zh: '路標指示牌',
    en: 'Road Sign Title',
    desc: '國道綠底白字指示牌從地面立起，寫上地名與方向',
    tags: ['地名', '通勤', '開場', '交通'],
    tone: 'paper',
    preferredRatio: '16:9',
    sample: ['往', '林口', 'Linkou', '→'],
    hint: '小字（往／下一站）/ 地名 / 英文（選填）/ 箭頭 ← → ↑ ↖ ↗；只仿國道指示牌配色版型，不放路線編號或里程',
    motion: '一面台灣國道風格的綠底白字、白色內框圓角指示牌，連同灰色立柱從地面向後倒下的狀態往上立起（約 0.7 秒，帶一點回彈）；牌面左側小字「往」，中間大字地名、下方英文，右側白色粗箭頭立起後往箭頭方向輕推兩下。停留後整面牌往下倒回去。',
    motionEn: 'A Taiwan-freeway-style guide sign — green panel, white text, white inset border, rounded corners — swings up from lying flat on the ground together with its grey post (about 0.7s with a slight overshoot). A small "to" label sits on the left, the large place name with English below in the middle, and a bold white arrow on the right nudges twice in its direction once upright. After a hold the sign falls back down.',
    css: `
.S{--u:calc(min(1cqw,1.7778cqh)*1.4)}
.S .wrap{display:flex;flex-direction:column;align-items:center;transform-origin:50% 100%;animation:K_up 4.4s cubic-bezier(.3,1.35,.5,1) infinite both;margin-top:calc(var(--u)*10)}
.S .sign{--g:#006b3f;background:var(--g);color:#fff;border-radius:calc(var(--u)*1.4);padding:calc(var(--u)*.5);box-shadow:0 calc(var(--u)*.6) calc(var(--u)*1.4) #0004}
.S .in{border:calc(var(--u)*.45) solid #fff;border-radius:calc(var(--u)*1);display:flex;align-items:center;gap:calc(var(--u)*3);padding:calc(var(--u)*2) calc(var(--u)*4)}
.S .to{font-size:calc(var(--u)*3.6);font-weight:700}
.S .pl{font-size:calc(var(--u)*9*min(1,4/var(--n)));letter-spacing:.12em;line-height:1.05;white-space:nowrap}
.S .en{font-size:calc(var(--u)*2.8);font-weight:700;letter-spacing:.04em;margin-top:calc(var(--u)*.6);font-family:Arial,Helvetica,var(--sans)}
.S .ar{width:calc(var(--u)*8);height:calc(var(--u)*8);display:grid;place-items:center;transform:rotate(var(--deg))}
.S .ar svg{width:100%;height:100%;animation:K_ar 4.4s ease infinite both}
.S .post{width:calc(var(--u)*1.8);height:calc(var(--u)*16);background:linear-gradient(90deg,#7d8590,#e4e7eb,#7d8590)}
@keyframes K_up{0%{transform:perspective(160cqw) rotateX(-88deg);opacity:0}2%{opacity:1}18%,88%{transform:perspective(160cqw) rotateX(0);opacity:1}100%{transform:perspective(160cqw) rotateX(-88deg);opacity:0}}
@keyframes K_ar{0%,20%{transform:none}25%{transform:translateX(12%)}30%{transform:none}35%{transform:translateX(12%)}40%,100%{transform:none}}`,
    html: (w) => {
      const given = w.filter(Boolean);
      const [to, pl, en, ar] = given.length ? [w[0] ?? '', w[1] ?? '', w[2] ?? '', w[3] ?? '→'] : ['往', '林口', 'Linkou', '→'];
      const deg = ARROW_DEG[String(ar).trim()] ?? 0;
      const n = Math.max(2, Array.from(pl).length);
      const arrow = `<svg viewBox="0 0 100 100"><path d="M10 42h52V22l30 28-30 28V58H10z" fill="#fff"/></svg>`;
      return `<div class="wrap"><div class="sign"><div class="in">${to ? `<div class="to">${esc(to)}</div>` : ''}<div><div class="pl" style="--n:${n}">${esc(pl)}</div>${en ? `<div class="en">${esc(en)}</div>` : ''}</div><div class="ar" style="--deg:${deg}deg">${arrow}</div></div></div><div class="post"></div></div>`;
    },
  },
];
