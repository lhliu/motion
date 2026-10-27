import type { Fx } from '../types';
import { esc } from '../util';

// 2026-10-27 圖解動畫批次 B4（364–367）：cstat 2 個、cpie 1 個、cbar 1 個；參考「一瞬で伝わる図解アニメ48選」題型重新設計
const base = { added: '2026-10-27', tone: 'ink' as const, preferredRatio: '16:9' as const };
const given = (w: string[], fb: string[]) => {
  const g = w.map((s) => String(s ?? '').trim()).filter(Boolean);
  return g.length ? g : fb;
};
/** 「捷運 90」→ { k, v }（v 為數字，沒有就 NaN） */
const kv = (s: string) => {
  const m = s.match(/^(.*?)[\s:：]*([-+]?[\d.,]+)\s*([^\d\s]*)$/);
  return m && m[1].trim() ? { k: m[1].trim(), v: parseFloat(m[2].replace(/,/g, '')), u: m[3] } : { k: s, v: NaN, u: '' };
};
const OUT = `@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}`;
const G = `.S .g{position:absolute;inset:0;animation:K_o 7s ease infinite both}`;

export const statExplain: Fx[] = [
  {
    ...base,
    id: 'sticky-matrix',
    no: 364,
    cat: 'cstat',
    zh: '便利貼四象限',
    en: 'Sticky Note Matrix',
    desc: '便利貼一張張被丟進重要×急迫的四個象限',
    tags: ['分類', '矩陣', '待辦'],
    sample: ['重要×急迫', '1 確認貸款成數', '1 簽約前驗屋', '2 比較學區', '2 存裝潢預算', '3 回覆仲介來電', '4 滑裝潢 IG'],
    hint: '第 1 行寫「軸A×軸B」；之後每行「象限編號 內容」（1 左上：A 且 B、2 右上：A 不 B、3 左下：B 不 A、4 右下：都不是），共 4–10 張',
    motion: '畫面是十字切開的四個象限，左側直寫軸 A、上方橫寫軸 B，各象限角落標著名稱，左上「兩者皆是」那格底色最深。便利貼（主色、副色交替，上緣一條膠帶）從畫面下方旋轉著被丟進各自的象限，落定時微微晃一下並保持一點歪斜。全部丟完後左上象限框線亮起脈動，停留後淡出循環。',
    motionEn: 'Four quadrants split by a cross, axis A written on the left and axis B across the top, each quadrant named in its corner with the top-left “both” cell shaded darkest. Sticky notes (alternating accent and accent-2, a strip of tape on top) are tossed in from the bottom, spinning into their quadrants, wobbling as they land and staying slightly askew. Once all are in, the top-left quadrant outline pulses. Holds, fades, loops.',
    css: `${G}
.S{--u:calc(min(1cqw,1.7778cqh)*0.62)}
.S .g{display:grid;place-items:center}
.S .mx{position:relative;display:grid;grid-template-columns:calc(var(--u)*5) 1fr 1fr;grid-template-rows:calc(var(--u)*5) 1fr 1fr;width:calc(var(--u)*128);height:calc(var(--u)*76);gap:calc(var(--u)*1)}
.S .ax{display:grid;place-items:center;font-size:calc(var(--u)*3);color:var(--mu);font-weight:900;letter-spacing:.2em}
.S .ax.y{grid-row:2/4;writing-mode:vertical-rl}
.S .ax.x{grid-column:2/4}
.S .q{position:relative;border:calc(var(--u)*.45) solid var(--fg);border-radius:calc(var(--u)*1.4);background:color-mix(in srgb,var(--fg) 5%,var(--bg));display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:calc(var(--u)*1.6);padding:calc(var(--u)*5) calc(var(--u)*2) calc(var(--u)*2)}
.S .q.q1{background:color-mix(in srgb,var(--ac) 18%,var(--bg));animation:K_pl 7s ease infinite both}
.S .q>em{position:absolute;left:calc(var(--u)*1.6);top:calc(var(--u)*1);font:normal 900 calc(var(--u)*2.6) var(--sans);color:var(--fg);opacity:.75}
.S .n{position:relative;width:calc(var(--u)*22);min-height:calc(var(--u)*13);padding:calc(var(--u)*1.8);background:var(--ac);color:var(--bg);font-size:calc(var(--u)*3.6);font-weight:900;line-height:1.25;display:grid;place-items:center;text-align:center;text-wrap:balance;box-shadow:calc(var(--u)*.6) calc(var(--u)*.8) 0 color-mix(in srgb,var(--fg) 25%,transparent);rotate:var(--r);animation:K_th 7s cubic-bezier(.25,.9,.3,1.15) infinite both;animation-delay:calc(var(--i)*.32s)}
.S .n:nth-child(odd){background:var(--ac2);color:var(--fg)}
.S .n::before{content:'';position:absolute;top:calc(var(--u)*-1.2);left:50%;width:calc(var(--u)*7);height:calc(var(--u)*2.4);margin-left:calc(var(--u)*-3.5);background:color-mix(in srgb,var(--bg) 60%,transparent);rotate:-4deg}
@keyframes K_th{0%{opacity:0;transform:translateY(70cqh) rotate(-140deg) scale(1.5)}2%{opacity:1}10%{transform:translateY(-2%) rotate(8deg)}13%{transform:rotate(-4deg)}16%,100%{opacity:1;transform:none}}
@keyframes K_pl{0%,52%{box-shadow:none}58%,68%,78%{box-shadow:0 0 0 calc(var(--u)*1) var(--ac)}63%,73%,100%{box-shadow:0 0 0 0 var(--ac)}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.5)}.S .mx{width:calc(var(--u)*62);height:calc(var(--u)*100)}.S .n{width:calc(var(--u)*24);min-height:calc(var(--u)*11);font-size:calc(var(--u)*3)}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['重要×急迫', '1 確認貸款成數', '1 簽約前驗屋', '2 比較學區', '2 存裝潢預算', '3 回覆仲介來電', '4 滑裝潢 IG']);
      const hasAx = /[×xX*＊]/.test(g[0]) && !/^[1-4]\s/.test(g[0]);
      const [A, B] = hasAx ? g[0].split(/\s*[×xX*＊]\s*/) : ['重要', '急迫'];
      const notes = (hasAx ? g.slice(1) : g).slice(0, 10).map((s) => {
        const m = s.match(/^([1-4])[\s.、:：]+/);
        return { q: m ? +m[1] : 1, t: m ? s.slice(m[0].length) : s };
      });
      const nm = [`${A}・${B}`, `${A}・不${B}`, `不${A}・${B}`, `不${A}・不${B}`];
      const rot = [-4, 3, -2, 5, -5, 2, 4, -3, 1, -1];
      let k = 0;
      const q = [1, 2, 3, 4].map((n) => `<div class="q q${n}"><em>${esc(nm[n - 1])}</em>${notes.map((d, i) => (d.q === n ? `<div class="n" style="--i:${i};--r:${rot[k++ % 10]}deg">${esc(d.t)}</div>` : '')).join('')}</div>`);
      return `<div class="g"><div class="mx"><div></div><div class="ax x">${esc(B)} ←→ 不${esc(B)}</div><div class="ax y">${esc(A)} ←→ 不${esc(A)}</div>${q[0]}${q[1]}${q[2]}${q[3]}</div></div>`;
    },
  },
  {
    ...base,
    id: 'relation-web',
    no: 365,
    cat: 'cstat',
    zh: '關聯強弱網',
    en: 'Relation Strength Web',
    desc: '連線一條條長粗，粗細代表關係強弱，脈衝沿線跑向中心',
    tags: ['關聯', '因素', '房價'],
    sample: ['房價', '捷運 90', '學區 75', '商圈 60', '公園 35', '醫院 45'],
    hint: '第 1 行是中心；之後每行「因素 強度」（0–100），3–6 個',
    motion: '畫面中央是主色大圓（中心主題），周圍環繞深框白底的因素圓。連線從中心一條條往外伸出，接著依強度變粗（越強越粗、最強的一條用副色），線旁跳出強度數字；之後每條線上有亮點脈衝從因素跑向中心，越強跑得越快。中心圓隨脈衝抵達輕微跳動，停留後淡出循環。',
    motionEn: 'A large accent circle (the topic) sits in the centre, ringed by white, dark-outlined factor circles. Links extend from the centre one by one, then thicken by strength (strongest in accent-2) with the value popping beside each; bright pulses then run along every link from factor to centre, faster for stronger links, and the centre throbs as they arrive. Holds, fades, loops.',
    css: `${G}
.S{--u:calc(min(1cqw,1.7778cqh)*0.55)}
.S .g{display:grid;place-items:center}
.S .st{position:relative;width:calc(var(--u)*140);aspect-ratio:16/10}
.S svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.S .l{stroke:var(--fg);stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:100;animation:K_ln 7s ease infinite both;animation-delay:calc(var(--i)*.25s)}
.S .l.top{stroke:var(--ac2)}
.S .p{stroke:var(--bg);stroke-width:1.6;stroke-linecap:round;stroke-dasharray:4 96;stroke-dashoffset:4;animation:K_p var(--sp) linear infinite,K_pv 7s linear infinite both}
.S .c,.S .f{position:absolute;translate:-50% -50%;border-radius:50%;display:grid;place-items:center;text-align:center;font-weight:900}
.S .c{left:50%;top:50%;width:calc(var(--u)*26);aspect-ratio:1;background:var(--ac);color:var(--bg);font-size:calc(var(--u)*5);border:calc(var(--u)*.7) solid var(--fg);animation:K_c 7s ease infinite both,K_bt .9s ease-in-out 2.6s infinite}
.S .f{width:calc(var(--u)*17);aspect-ratio:1;background:var(--bg);color:var(--fg);border:calc(var(--u)*.55) solid var(--fg);font-size:calc(var(--u)*3.2);line-height:1.15;animation:K_f 7s cubic-bezier(.3,1.7,.5,1) infinite both;animation-delay:calc(var(--i)*.25s)}
.S .v{position:absolute;translate:-50% -50%;padding:calc(var(--u)*.3) calc(var(--u)*1.2);background:var(--fg);color:var(--bg);border-radius:99px;font:normal 900 calc(var(--u)*2.6) var(--mono);animation:K_v 7s ease infinite both;animation-delay:calc(var(--i)*.25s)}
@keyframes K_ln{0%,8%{stroke-dashoffset:100;stroke-width:.5}16%{stroke-dashoffset:0;stroke-width:.5}24%,100%{stroke-dashoffset:0;stroke-width:var(--sw)}}
@keyframes K_pv{0%,30%{opacity:0}33%,90%{opacity:1}100%{opacity:0}}
@keyframes K_p{to{stroke-dashoffset:-96}}
@keyframes K_c{0%{transform:scale(0)}8%,100%{transform:none}}
@keyframes K_bt{50%{scale:1.06}}
@keyframes K_f{0%,4%{opacity:0;transform:scale(0)}10%,100%{opacity:1;transform:none}}
@keyframes K_v{0%,20%{opacity:0;transform:scale(.4)}26%,100%{opacity:1;transform:none}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.35)}.S .st{width:92cqw;aspect-ratio:10/16}.S .c{width:calc(var(--u)*20);font-size:calc(var(--u)*4.4)}.S .f{width:calc(var(--u)*14)}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['房價', '捷運 90', '學區 75', '商圈 60', '公園 35', '醫院 45']);
      const ctr = Number.isFinite(kv(g[0]).v) ? '主題' : g[0];
      const fs = (Number.isFinite(kv(g[0]).v) ? g : g.slice(1)).slice(0, 6).map(kv);
      const n = fs.length || 1;
      const top = fs.reduce((b, d, i) => ((d.v || 0) > (fs[b].v || 0) ? i : b), 0);
      const geo = (vw: number, vh: number, rx: number, ry: number) =>
        fs.map((_, i) => {
          const a = -Math.PI / 2 + (Math.PI * 2 * i) / n + (n % 2 ? 0 : Math.PI / n);
          return [vw / 2 + Math.cos(a) * rx, vh / 2 + Math.sin(a) * ry];
        });
      const one = (cls: string, vw: number, vh: number, rx: number, ry: number) => {
        const pt = geo(vw, vh, rx, ry);
        const ln = fs.map((d, i) => {
          const v = Math.max(0, Math.min(100, Number.isFinite(d.v) ? d.v : 50));
          const [x, y] = pt[i];
          const path = `M${x.toFixed(1)} ${y.toFixed(1)}L${vw / 2} ${vh / 2}`;
          return `<path pathLength="100" class="l${i === top ? ' top' : ''}" style="--i:${i};--sw:${(0.6 + v * 0.042).toFixed(2)}" d="${path}"/><path pathLength="100" class="p" style="--sp:${(2.6 - v * 0.018).toFixed(2)}s" d="${path}"/>`;
        });
        const nodes = fs.map((d, i) => {
          const [x, y] = pt[i];
          const lx = (x + vw / 2) / 2, ly = (y + vh / 2) / 2;
          return `<div class="f" style="--i:${i};left:${((x / vw) * 100).toFixed(1)}%;top:${((y / vh) * 100).toFixed(1)}%">${esc(d.k)}</div>${Number.isFinite(d.v) ? `<div class="v" style="--i:${i};left:${((lx / vw) * 100).toFixed(1)}%;top:${((ly / vh) * 100).toFixed(1)}%">${d.v}</div>` : ''}`;
        });
        return `<div class="st ${cls}"><svg viewBox="0 0 ${vw} ${vh}">${ln.join('')}</svg>${nodes.join('')}<div class="c">${esc(ctr)}</div></div>`;
      };
      return `<div class="g"><style>.fx-relation-web .st.pt{display:none}@container (aspect-ratio < 1){.fx-relation-web .st.ls{display:none}.fx-relation-web .st.pt{display:block}}</style>${one('ls', 160, 100, 60, 38)}${one('pt', 100, 160, 40, 62)}</div>`;
    },
  },
  {
    ...base,
    id: 'area-grid',
    no: 366,
    cat: 'cpie',
    zh: '面積格子比',
    en: 'Area Grid Ratio',
    desc: '方塊格子一格一格填滿，用面積看出差幾倍',
    tags: ['比例', '倍數', '比較'],
    sample: ['頭期款差多少', '自備 100 萬', '目標 400 萬'],
    hint: '第 1 行標題；之後兩行「名稱 數值」（小的在前），自動換算成 100 格',
    motion: '左邊大標題，右邊一個 10×10 的空方格陣。先以主色一格一格（由左上往右下的波浪）填出第一個數值的面積，旁邊標籤跳出；接著以副色繼續填滿到第二個數值，數字由小跳到大，最後一個深色倍數章「×4」蓋在格陣上並回彈。停留後淡出循環。',
    motionEn: 'A big title on the left and an empty 10×10 grid on the right. Accent cells fill one by one in a diagonal wave for the first value and its label pops in; accent-2 cells then keep filling up to the second value while its number counts up, and finally a dark “×4” ratio stamp lands on the grid with a bounce. Holds, fades, loops.',
    css: `${G}
.S{--u:calc(min(1cqw,1.7778cqh)*0.72)}
.S .g{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*8)}
.S .tx{display:flex;flex-direction:column;gap:calc(var(--u)*3);max-width:calc(var(--u)*50)}
.S h3{margin:0;font-size:calc(var(--u)*6.4);line-height:1.15;text-wrap:balance;animation:K_tl 7s ease infinite both}
.S .lg{display:flex;align-items:center;gap:calc(var(--u)*1.6);font-size:calc(var(--u)*3.6);font-weight:900;animation:K_lg 7s ease infinite both;animation-delay:var(--d)}
.S .lg i{width:calc(var(--u)*4);height:calc(var(--u)*4);border-radius:calc(var(--u)*.6);background:var(--ac);border:calc(var(--u)*.4) solid var(--fg)}
.S .lg.b i{background:var(--ac2)}
.S .lg b{font-family:var(--mono)}
.S .gd{position:relative;display:grid;grid-template-columns:repeat(10,1fr);gap:calc(var(--u)*.7);width:calc(var(--u)*58);aspect-ratio:1;padding:calc(var(--u)*1.2);border:calc(var(--u)*.5) solid var(--fg);border-radius:calc(var(--u)*1.2)}
.S .gd s{border-radius:calc(var(--u)*.5);background:color-mix(in srgb,var(--fg) 10%,var(--bg))}
.S .gd s.a,.S .gd s.b{animation:K_cl 7s cubic-bezier(.3,1.6,.5,1) infinite both;animation-delay:calc(.6s + var(--i)*var(--st))}
.S .gd s.a{--c:var(--ac)}.S .gd s.b{--c:var(--ac2)}
.S .sp{position:absolute;right:calc(var(--u)*-5);bottom:calc(var(--u)*-4);padding:calc(var(--u)*1) calc(var(--u)*3);background:var(--fg);color:var(--bg);border-radius:calc(var(--u)*1.2);font:normal 900 calc(var(--u)*8) var(--mono);rotate:-8deg;animation:K_sp 7s cubic-bezier(.3,1.8,.5,1) infinite both;animation-delay:var(--d)}
@keyframes K_tl{0%{opacity:0;transform:translateX(-10%)}6%,100%{opacity:1;transform:none}}
@keyframes K_lg{0%{opacity:0;transform:translateY(40%)}5%,100%{opacity:1;transform:none}}
@keyframes K_cl{0%{background:color-mix(in srgb,var(--fg) 10%,var(--bg));transform:scale(.3)}2%,100%{background:var(--c);transform:none}}
@keyframes K_sp{0%{opacity:0;transform:scale(2.4)}5%,100%{opacity:1;transform:none}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.55)}.S .g{flex-direction:column;gap:calc(var(--u)*6)}.S .tx{align-items:center;text-align:center;max-width:none}.S .sp{right:calc(var(--u)*-1.5);bottom:calc(var(--u)*-3)}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['頭期款差多少', '自備 100 萬', '目標 400 萬']);
      const vals = g.map(kv).filter((d) => Number.isFinite(d.v));
      const title = Number.isFinite(kv(g[0]).v) ? '' : g[0];
      const [a, b] = vals.length >= 2 ? [vals[0], vals[1]] : [{ k: 'A', v: 1, u: '' }, { k: 'B', v: 4, u: '' }];
      const big = Math.max(a.v, b.v) || 1;
      const na = Math.max(1, Math.round((Math.min(a.v, b.v) / big) * 100));
      const st = 3.2 / 100;
      const cells = Array.from({ length: 100 }, (_, i) => {
        const r = Math.floor(i / 10), c = i % 10;
        const ord = r * 10 + c;
        return `<s class="${ord < na ? 'a' : 'b'}" style="--i:${ord < na ? ord : ord + 8}"></s>`;
      }).join('');
      const ratio = big / (Math.min(a.v, b.v) || 1);
      const rs = `×${Number.isInteger(ratio) ? ratio : ratio.toFixed(1)}`;
      const dA = (0.6 + na * st).toFixed(2), dB = (0.6 + (108 * st)).toFixed(2);
      const val = (d: typeof a) => `${d.v}${d.u ? ' ' + esc(d.u) : ''}`;
      return `<div class="g" style="--st:${st}s"><div class="tx">${title ? `<h3>${esc(title)}</h3>` : ''}<div class="lg" style="--d:${dA}s"><i></i>${esc(a.k)} <b>${val(a)}</b></div><div class="lg b" style="--d:${dB}s"><i></i>${esc(b.k)} <b>${val(b)}</b></div></div><div class="gd">${cells}<div class="sp" style="--d:${(Number(dB) + 0.2).toFixed(2)}s">${rs}</div></div></div>`;
    },
  },
  {
    ...base,
    id: 'spotlight-bar',
    no: 367,
    cat: 'cbar',
    zh: '異常柱聚光',
    en: 'Spotlight Bar',
    desc: '聚光燈掃過直條，停在異常的那一根，其他柱子變暗',
    tags: ['數據', '異常', '重點'],
    sample: ['月成交量（件）', '1月 120', '2月 132', '3月 128', '>4月 210', '5月 125', '6月 130'],
    hint: '第 1 行標題；之後每行「標籤 數值」，在要聚焦的那根前加「>」，沒加就自動挑離平均最遠的；4–10 根',
    motion: '標題下方一排主色直條由下往上長出。接著舞台變暗，一道由上往下的錐形聚光燈從左掃到右、再折回停在異常的那一根；被照到的柱子轉成副色並亮起，其他柱子變暗，旁邊彈出「比平均 +64%」的深色標籤。停留後淡出循環。',
    motionEn: 'Under the title a row of accent columns grows upward. The stage then dims and a cone-shaped spotlight sweeps from left to right and back, stopping on the outlier; that column turns accent-2 and glows while the rest dim, and a dark “+64% vs avg” tag pops beside it. Holds, fades, loops.',
    css: `${G}
.S{--u:calc(min(1cqw,1.7778cqh)*0.72)}
.S .g{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*3)}
.S h3{margin:0;font-size:calc(var(--u)*5);text-align:center}
.S .ch{position:relative;display:flex;align-items:flex-end;gap:calc(var(--u)*2.4);height:calc(var(--u)*52);padding:0 calc(var(--u)*2);border-bottom:calc(var(--u)*.6) solid var(--fg)}
.S .b{position:relative;width:calc(var(--u)*10);height:var(--h);display:flex;flex-direction:column;justify-content:flex-end;align-items:center}
.S .b i{display:block;width:100%;height:100%;background:var(--ac);border:calc(var(--u)*.45) solid var(--fg);border-bottom:0;border-radius:calc(var(--u)*1) calc(var(--u)*1) 0 0;transform-origin:bottom;animation:K_gr 7s cubic-bezier(.3,1.3,.5,1) infinite both,K_dm 7s ease infinite both;animation-delay:calc(var(--i)*.08s),0s}
.S .b.t i{animation:K_gr 7s cubic-bezier(.3,1.3,.5,1) infinite both,K_hi 7s ease infinite both;animation-delay:calc(var(--i)*.08s),0s}
.S .b em{position:absolute;bottom:calc(var(--u)*-4.6);font:normal 800 calc(var(--u)*2.6) var(--sans);color:var(--fg);white-space:nowrap}
.S .b b{position:absolute;top:calc(var(--u)*-4);font:normal 900 calc(var(--u)*2.6) var(--mono);animation:K_vl 7s ease infinite both}
.S .lt{position:absolute;top:calc(var(--u)*-14);bottom:0;width:calc(var(--u)*22);margin-left:calc(var(--u)*-11);left:0;background:linear-gradient(to bottom,color-mix(in srgb,var(--ac2) 55%,transparent),color-mix(in srgb,var(--ac2) 10%,transparent));clip-path:polygon(42% 0,58% 0,100% 100%,0 100%);mix-blend-mode:screen;pointer-events:none;animation:K_lt 7s cubic-bezier(.5,0,.3,1) infinite both}
.S .tg{position:absolute;bottom:calc(var(--h)*.35);z-index:2;left:calc(var(--x) + var(--u)*6.5);padding:calc(var(--u)*.8) calc(var(--u)*2);background:var(--fg);color:var(--bg);border-radius:calc(var(--u)*1);font-size:calc(var(--u)*3.2);font-weight:900;white-space:nowrap;animation:K_tg 7s cubic-bezier(.3,1.8,.5,1) infinite both}
@keyframes K_gr{0%{transform:scaleY(0)}12%,100%{transform:none}}
@keyframes K_vl{0%,12%{opacity:0}16%,100%{opacity:1}}
@keyframes K_lt{0%,24%{opacity:0;left:0}28%{opacity:1;left:0}46%{left:100%}62%,100%{opacity:1;left:var(--x)}}
@keyframes K_dm{0%,58%{filter:none;opacity:1}64%,100%{filter:grayscale(.8);opacity:.35}}
@keyframes K_hi{0%,58%{background:var(--ac)}62%,100%{background:var(--ac2);box-shadow:0 0 calc(var(--u)*4) var(--ac2)}}
@keyframes K_tg{0%,64%{opacity:0;transform:scale(.3)}69%,100%{opacity:1;transform:none}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.35)}.S .ch{gap:calc(var(--u)*1.4)}.S .b{width:calc(var(--u)*8)}.S .tg{left:var(--x);translate:-50% 0;bottom:calc(var(--h) + var(--u)*5)}.S h3{margin-bottom:calc(var(--u)*12)}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['月成交量（件）', '1月 120', '2月 132', '3月 128', '>4月 210', '5月 125', '6月 130']);
      const title = Number.isFinite(kv(g[0].replace(/^[>＞]/, '')).v) ? '' : g[0];
      const rows = (title ? g.slice(1) : g).slice(0, 10).map((s) => ({ m: /^[>＞]/.test(s), ...kv(s.replace(/^[>＞]\s*/, '')) })).filter((d) => Number.isFinite(d.v));
      if (!rows.length) return `<div class="g"><h3>${esc(title)}</h3></div>`;
      const n = rows.length;
      const avg = rows.reduce((a, d) => a + d.v, 0) / n;
      let t = rows.findIndex((d) => d.m);
      if (t < 0) t = rows.reduce((b, d, i) => (Math.abs(d.v - avg) > Math.abs(rows[b].v - avg) ? i : b), 0);
      const others = rows.filter((_, i) => i !== t);
      const oa = others.length ? others.reduce((a, d) => a + d.v, 0) / others.length : avg;
      const pct = Math.round(((rows[t].v - oa) / (oa || 1)) * 100);
      const max = Math.max(...rows.map((d) => d.v), 1);
      const x = `calc(var(--u)*2 + var(--u)*${t}*12.4 + var(--u)*5)`;
      const tx = `@container (aspect-ratio < 1){.fx-spotlight-bar .ch{--x:calc(var(--u)*2 + var(--u)*${t}*9.4 + var(--u)*4) !important}}`;
      return `<div class="g"><style>${tx}</style>${title ? `<h3>${esc(title)}</h3>` : ''}<div class="ch" style="--x:${x};--h:${((rows[t].v / max) * 100).toFixed(1)}%">${rows.map((d, i) => `<div class="b${i === t ? ' t' : ''}" style="--i:${i};--h:${((d.v / max) * 100).toFixed(1)}%"><b>${d.v}</b><i></i><em>${esc(d.k)}</em></div>`).join('')}<div class="lt"></div><div class="tg">比平均 ${pct >= 0 ? '+' : ''}${pct}%</div></div></div>`;
    },
  },
];
