import type { Fx } from '../types';
import { esc } from '../util';

// 2026-10-27 圖解動畫批次 B5（368–373）：diagram 2 個、pmark 2 個、pmulti 1 個、punit 1 個
// 照片／格局類用程式自己畫的示意圖（SVG），不用任何外部或有版權的照片
const base = { added: '2026-10-27', tone: 'ink' as const, preferredRatio: '16:9' as const };
const given = (w: string[], fb: string[]) => {
  const g = w.map((s) => String(s ?? '').trim()).filter(Boolean);
  return g.length ? g : fb;
};
const kv = (s: string) => {
  const m = s.match(/^(.*?)[\s:：]*([-+]?[\d.,]+)\s*([^\d\s]*)$/);
  return m && m[1].trim() ? { k: m[1].trim(), v: parseFloat(m[2].replace(/,/g, '')), u: m[3] } : { k: s, v: NaN, u: '' };
};
const OUT = `@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}`;
const G = `.S .g{position:absolute;inset:0;animation:K_o 7s ease infinite both}`;

/** 齒輪 SVG path：中心 (0,0)，外徑 r，齒數 n */
const gearPath = (r: number, n: number) => {
  const ri = r * 0.82, pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n, s = Math.PI / n;
    [[ri, a - s * 0.5], [r, a - s * 0.3], [r, a + s * 0.3], [ri, a + s * 0.5]].forEach(([rr, aa]) => pts.push(`${(Math.cos(aa) * rr).toFixed(2)} ${(Math.sin(aa) * rr).toFixed(2)}`));
  }
  return `M${pts.join('L')}Z`;
};

/** 示意航照：街廓方塊（自己畫的佔位圖） */
const aerial = (hl: number) => {
  let s = '<rect width="160" height="90" fill="var(--mu)"/>';
  let k = 0;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 7; c++) {
      const x = 6 + c * 22, y = 6 + r * 21;
      const park = (r + c * 3) % 9 === 4;
      s += `<rect x="${x}" y="${y}" width="18" height="17" rx="1.5" fill="${k === hl ? 'var(--ac)' : park ? 'color-mix(in srgb,#5fbf73 70%,var(--bg))' : 'color-mix(in srgb,var(--fg) 22%,var(--bg))'}"/>`;
      if (!park && k !== hl) s += `<rect x="${x + 2}" y="${y + 2}" width="6" height="5" fill="color-mix(in srgb,var(--fg) 40%,var(--bg))"/><rect x="${x + 10}" y="${y + 9}" width="6" height="6" fill="color-mix(in srgb,var(--fg) 40%,var(--bg))"/>`;
      k++;
    }
  return s;
};

/** 示意室內：空屋（before）或有家具（after），自己畫的佔位圖 */
const room = (after: boolean) => `<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice"><rect width="160" height="90" fill="${after ? 'color-mix(in srgb,var(--ac2) 30%,var(--bg))' : 'color-mix(in srgb,var(--fg) 12%,var(--bg))'}"/><rect y="62" width="160" height="28" fill="${after ? 'color-mix(in srgb,var(--ac) 35%,var(--bg))' : 'color-mix(in srgb,var(--fg) 22%,var(--bg))'}"/><rect x="98" y="14" width="40" height="30" fill="${after ? '#bfe3ff' : 'color-mix(in srgb,var(--fg) 30%,var(--bg))'}" stroke="var(--fg)" stroke-width="1.5"/><path d="M118 14v30M98 29h40" stroke="var(--fg)" stroke-width="1.2"/>${after ? '<rect x="18" y="44" width="58" height="20" rx="4" fill="var(--ac)"/><rect x="14" y="38" width="10" height="26" rx="3" fill="var(--ac)"/><rect x="70" y="38" width="10" height="26" rx="3" fill="var(--ac)"/><rect x="88" y="56" width="26" height="4" fill="var(--fg)"/><path d="M92 60v8M110 60v8" stroke="var(--fg)" stroke-width="2"/><circle cx="148" cy="50" r="8" fill="#5fbf73"/><rect x="146" y="56" width="4" height="10" fill="var(--fg)"/><path d="M40 10h20l-4 10h-12z" fill="var(--ac2)"/><path d="M50 0v10" stroke="var(--fg)"/>' : '<path d="M20 66l14-4M60 70l20-6M120 75l18-3" stroke="var(--fg)" stroke-width=".8" opacity=".4"/><rect x="30" y="50" width="14" height="12" fill="color-mix(in srgb,var(--fg) 35%,var(--bg))"/><path d="M30 50l7-5 7 5" fill="none" stroke="var(--fg)" stroke-width=".8"/>'}</svg>`;

export const visualExplain: Fx[] = [
  {
    ...base,
    id: 'gear-formula',
    no: 368,
    cat: 'diagram',
    zh: '齒輪公式',
    en: 'Gear Formula',
    desc: '齒輪一顆顆咬合轉動，每顆標一個因子，最後帶出結果',
    tags: ['原理', '公式', '房貸'],
    sample: ['房貸利率', '指標利率', '加碼'],
    hint: '第 1 行是結果；之後 2–4 行是因子（可寫「指標利率 1.7%」）',
    motion: '一排齒輪依序從下方彈入並互相咬合（主色、副色交替，深色輪轂上寫因子名），齒輪之間有大大的「＋」；全部到位後一起轉動，相鄰的反向轉。最右邊一顆大齒輪接著轉起來，旁邊的結果卡「＝ 房貸利率」由右滑入並輕彈。停留後淡出循環。',
    motionEn: 'A row of gears pops up from below one by one and meshes (alternating accent and accent-2, factor names on dark hubs) with big “+” signs between them; once all are in they turn together, neighbours in opposite directions. A large gear at the end starts turning as the result card “= mortgage rate” slides in from the right with a bounce. Holds, fades, loops.',
    css: `${G}
.S{--u:calc(min(1cqw,1.7778cqh)*1.25)}
.S .g{display:grid;place-items:center}
.S .row{display:flex;align-items:center}
.S .gw{position:relative;width:calc(var(--u)*var(--sz));aspect-ratio:1;margin:0 calc(var(--u)*-1.6);animation:K_in 7s cubic-bezier(.3,1.6,.5,1) infinite both;animation-delay:calc(var(--i)*.35s)}
.S .gw svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;animation:K_rt var(--sp) linear infinite;animation-direction:var(--dir);animation-delay:2s}
.S .gw path{fill:var(--c);stroke:var(--fg);stroke-width:1.6}
.S .gw circle{fill:var(--fg)}
.S .gw b{position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:var(--bg);font-size:calc(var(--u)*2.9);line-height:1.15;padding:0 16%}
.S .gw b small{display:block;font:normal 900 calc(var(--u)*2) var(--mono);color:var(--ac2)}
.S .pl{position:relative;z-index:2;width:calc(var(--u)*6);aspect-ratio:1;border-radius:50%;background:var(--bg);border:calc(var(--u)*.5) solid var(--fg);display:grid;place-items:center;font-size:calc(var(--u)*4);font-weight:900;animation:K_pl 7s cubic-bezier(.3,1.8,.5,1) infinite both;animation-delay:calc(var(--i)*.35s + .2s)}
.S .rs{margin-left:calc(var(--u)*4);padding:calc(var(--u)*2.4) calc(var(--u)*3.6);background:var(--fg);color:var(--bg);border-radius:calc(var(--u)*1.6);font-size:calc(var(--u)*4.6);font-weight:900;white-space:nowrap;animation:K_rs 7s cubic-bezier(.3,1.5,.5,1) infinite both}
.S .rs em{font-style:normal;color:var(--ac2);margin-right:calc(var(--u)*1.2)}
@keyframes K_in{0%{opacity:0;transform:translateY(60cqh) rotate(-90deg)}2%{opacity:1}10%,100%{opacity:1;transform:none}}
@keyframes K_rt{to{transform:rotate(360deg)}}
@keyframes K_pl{0%,8%{transform:scale(0)}13%,100%{transform:none}}
@keyframes K_rs{0%,38%{opacity:0;transform:translateX(40%)}46%,100%{opacity:1;transform:none}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*2)}.S .row{flex-direction:column}.S .gw{margin:calc(var(--u)*-1.6) 0}.S .rs{margin:calc(var(--u)*4) 0 0}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['房貸利率', '指標利率', '加碼']);
      const res = g[0];
      const fs = g.slice(1, 5).map(kv);
      if (!fs.length) fs.push({ k: '因子', v: NaN, u: '' });
      const T = 12, path = gearPath(50, T);
      const gear = (d: { k: string; v: number; u: string }, i: number) =>
        `<div class="gw" style="--i:${i};--sz:24;--sp:6s;--dir:${i % 2 ? 'reverse' : 'normal'};--c:${i % 2 ? 'var(--ac2)' : 'var(--ac)'}"><svg viewBox="-50 -50 100 100"><g transform="rotate(${i % 2 ? 180 / T : 0})"><path d="${path}"/></g><circle r="28"/></svg><b>${esc(d.k)}${Number.isFinite(d.v) ? `<small>${d.v}${esc(d.u)}</small>` : ''}</b></div>`;
      return `<div class="g"><div class="row">${fs.map((d, i) => (i ? `<div class="pl" style="--i:${i}">＋</div>` : '') + gear(d, i)).join('')}<div class="rs"><em>＝</em>${esc(res)}</div></div></div>`;
    },
  },
  {
    ...base,
    id: 'iso-explode',
    no: 369,
    cat: 'diagram',
    zh: '等角圖層拆解',
    en: 'Isometric Layer Explode',
    desc: '等角視角的圖層往上拆開，標出每層，再合回一整塊',
    tags: ['組成', '結構', '房價'],
    sample: ['房價怎麼組成', '土地 45%', '營造 30%', '管銷 15%', '利潤 10%'],
    hint: '第 1 行標題；之後 2–5 行「名稱 數值」，由下往上疊（第一行在最底）',
    motion: '畫面左側標題，右側一塊等角視角的立體方塊（主色系分層、深色描邊）。方塊先整塊落下，接著每層依序往上拆開拉出間距，右側各自拉出一條引線與「名稱＋數值」標籤；停留後各層再往下合回一整塊，標籤收回。循環播放。',
    motionEn: 'A title on the left and an isometric block on the right (layered in accent tones with dark outlines). The block drops in whole, then each layer lifts apart in turn, each pulling out a leader line and a “name + value” label on the right; after a hold the layers slide back together and the labels retract. Loops.',
    css: `${G}
.S{--u:calc(min(1cqw,1.7778cqh)*.85)}
.S .g{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*6)}
.S h3{margin:0;max-width:calc(var(--u)*28);font-size:calc(var(--u)*6);line-height:1.15;text-wrap:balance;animation:K_t 7s ease infinite both}
.S .stk{position:relative;width:calc(var(--u)*56);height:calc(var(--u)*56);margin-top:calc(var(--u)*4)}
.S .ly{position:absolute;left:0;width:calc(var(--u)*30);bottom:calc(var(--u)*(var(--b)));animation:K_up 7s cubic-bezier(.4,0,.2,1) infinite both}
.S .ly svg{display:block;width:100%;overflow:visible}
.S .ly .tp{fill:var(--c)}.S .ly .lf{fill:color-mix(in srgb,var(--c) 70%,#000)}.S .ly .rt{fill:color-mix(in srgb,var(--c) 50%,#000)}
.S .ly path{stroke:var(--fg);stroke-width:1;stroke-linejoin:round}
.S .lb{position:absolute;left:calc(100% + var(--u)*1);top:30%;display:flex;align-items:center;gap:calc(var(--u)*1);white-space:nowrap;font-size:calc(var(--u)*3);font-weight:900;animation:K_lb 7s ease infinite both}
.S .lb::before{content:'';width:calc(var(--u)*8);height:calc(var(--u)*.4);background:var(--fg)}
.S .lb b{font-family:var(--mono);color:var(--ac2)}
@keyframes K_t{0%{opacity:0;transform:translateX(-10%)}6%,100%{opacity:1;transform:none}}
@keyframes K_up{0%{opacity:0;transform:translateY(-40cqh)}8%{opacity:1;transform:none}calc(0%){}14%{transform:none}24%,66%{transform:translateY(calc(var(--u)*var(--i)*-5))}78%,100%{transform:none}}
@keyframes K_lb{0%,22%{opacity:0;clip-path:inset(0 100% 0 0)}30%,64%{opacity:1;clip-path:inset(0 0 0 0)}72%,100%{opacity:0;clip-path:inset(0 100% 0 0)}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.35)}.S .g{flex-direction:column;gap:calc(var(--u)*4)}.S h3{max-width:none;text-align:center}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['房價怎麼組成', '土地 45%', '營造 30%', '管銷 15%', '利潤 10%']);
      const title = Number.isFinite(kv(g[0]).v) ? '' : g[0];
      const ls = (title ? g.slice(1) : g).slice(0, 5).map(kv);
      const n = ls.length || 1;
      const tot = ls.reduce((a, d) => a + (Number.isFinite(d.v) ? d.v : 1), 0) || 1;
      const cols = ['var(--ac)', 'var(--ac2)', '#4cc9f0', '#7bd389', '#c084fc'];
      let b = 0;
      const H = 22; // 總厚度（u）
      const out = ls.map((d, i) => {
        const h = Math.max(3, (H * (Number.isFinite(d.v) ? d.v : 1)) / tot);
        // 等角方塊：寬 100、頂面高 50、厚 h*100/36
        const th = (h * 100) / 30;
        const svg = `<svg viewBox="0 0 100 ${50 + th}"><path class="lf" d="M0 25L50 50V${50 + th}L0 ${25 + th}Z"/><path class="rt" d="M100 25L50 50V${50 + th}L100 ${25 + th}Z"/><path class="tp" d="M50 0L100 25L50 50L0 25Z"/></svg>`;
        const el = `<div class="ly" style="--i:${i};--b:${b.toFixed(2)};--c:${cols[i % 5]};z-index:${i + 1}">${svg}<div class="lb">${esc(d.k)}${Number.isFinite(d.v) ? ` <b>${d.v}${esc(d.u)}</b>` : ''}</div></div>`;
        b += h;
        return el;
      });
      void n;
      return `<div class="g">${title ? `<h3>${esc(title)}</h3>` : ''}<div class="stk">${out.join('')}</div></div>`;
    },
  },
  {
    ...base,
    id: 'zoom-detail',
    no: 370,
    cat: 'pmark',
    zh: '全貌推進細節卡',
    en: 'Zoom to Detail Card',
    desc: '從整區全貌推鏡到一個街廓，框起來後切出細節卡',
    tags: ['推鏡', '重劃區', '建案'],
    sample: ['整個重劃區', '>A3 建案', '2027 完工', '總戶數 320', '距捷運 6 分'],
    hint: '第 1 行是全貌名稱；「>名稱」是要推進的目標；其餘 1–4 行寫在細節卡上。底圖是程式畫的示意街廓圖（不是真實照片）',
    motion: '畫面是一張俯視的示意街廓圖（灰色街道、深淺方塊、綠地），左上角標著全貌名稱。鏡頭平穩推進到其中一個主色街廓，副色虛線框隨之畫出並閃兩下；接著一張深色細節卡從右側滑入，標題是目標名稱，下面逐行跳出資訊。停留後拉回全貌、淡出循環。',
    motionEn: 'A top-down illustrated block map (grey streets, light and dark blocks, green parks) with the overview name in the corner. The camera pushes smoothly into one accent block while an accent-2 dashed frame draws around it and blinks twice; a dark detail card then slides in from the right with the target name and info lines popping in. Holds, pulls back, fades, loops.',
    css: `${G}
.S .g{overflow:hidden}
.S .mp{--zx:-20cqw;--zy:0px;--zs:2.8;position:absolute;inset:0;transform-origin:var(--ox) var(--oy);animation:K_z 7s cubic-bezier(.6,0,.2,1) infinite both}
.S .mp svg{width:100%;height:100%}
.S .fr{position:absolute;left:var(--fx);top:var(--fy);width:var(--fw);height:var(--fh);border:calc(var(--u)*.25) dashed var(--ac2);border-radius:calc(var(--u)*.5);animation:K_fr 7s ease infinite both}
.S .tl{position:absolute;left:calc(var(--u)*4);top:calc(var(--u)*3);padding:calc(var(--u)*1) calc(var(--u)*2.4);background:var(--fg);color:var(--bg);border-radius:99px;font-size:calc(var(--u)*3);font-weight:900;animation:K_tl 7s ease infinite both}
.S .cd{position:absolute;right:calc(var(--u)*5);top:50%;translate:0 -50%;width:calc(var(--u)*36);padding:calc(var(--u)*3);background:var(--fg);color:var(--bg);border-radius:calc(var(--u)*2);border-left:calc(var(--u)*1.2) solid var(--ac2);animation:K_cd 7s cubic-bezier(.3,1.4,.5,1) infinite both}
.S .cd h3{margin:0 0 calc(var(--u)*1.6);font-size:calc(var(--u)*5)}
.S .cd p{margin:calc(var(--u)*.8) 0 0;font-size:calc(var(--u)*3);font-weight:800;animation:K_ln 7s ease infinite both;animation-delay:calc(var(--i)*.18s)}
.S .cd p::before{content:'●';color:var(--ac2);margin-right:calc(var(--u)*1)}
.S .ft{position:absolute;inset:0;pointer-events:none}
.S .ft::after{content:'示意圖';position:absolute;right:calc(var(--u)*2);bottom:calc(var(--u)*1.6);font-size:calc(var(--u)*1.8);color:var(--fg);opacity:.6}
@keyframes K_z{0%,12%{transform:none}38%,84%{transform:translate(var(--zx),var(--zy)) scale(var(--zs))}96%,100%{transform:none}}
@keyframes K_fr{0%,10%{opacity:0;clip-path:inset(0 100% 100% 0)}20%{opacity:1;clip-path:inset(0)}40%,44%{opacity:0}42%,46%,84%{opacity:1}90%,100%{opacity:0}}
@keyframes K_tl{0%,4%{opacity:0}8%,30%{opacity:1}36%,100%{opacity:0}}
@keyframes K_cd{0%,40%{opacity:0;transform:translateX(60%)}48%,84%{opacity:1;transform:none}90%,100%{opacity:0;transform:translateX(60%)}}
@keyframes K_ln{0%,46%{opacity:0;transform:translateX(10%)}52%,100%{opacity:1;transform:none}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.6)}.S .cd{right:auto;left:50%;top:auto;bottom:calc(var(--u)*6);translate:-50% 0;width:calc(var(--u)*48)}.S .mp{--zx:0px;--zy:-8cqh;--zs:1.7;inset:auto;left:50%;top:50%;height:100%;aspect-ratio:160/90;margin-left:calc(-88.89cqh);margin-top:-50cqh}.S .mp svg{position:absolute;inset:0}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['整個重劃區', '>A3 建案', '2027 完工', '總戶數 320', '距捷運 6 分']);
      const ti = g.findIndex((s) => /^[>＞]/.test(s));
      const target = ti >= 0 ? g[ti].replace(/^[>＞]\s*/, '') : g[1] || '目標';
      const overview = ti === 0 ? '' : g[0];
      const info = g.filter((_, i) => i !== ti && !(overview && i === 0)).slice(0, 4);
      const hl = 10; // 第 2 列第 4 個街廓
      const x = 6 + 3 * 22, y = 6 + 1 * 21;
      const pct = (v: number, t: number) => `${((v / t) * 100).toFixed(2)}%`;
      const st = `--ox:${pct(x + 9, 160)};--oy:${pct(y + 8.5, 90)};--fx:${pct(x - 1, 160)};--fy:${pct(y - 1, 90)};--fw:${pct(20, 160)};--fh:${pct(19, 90)}`;
      return `<div class="g"><div class="mp" style="${st}"><svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice">${aerial(hl)}</svg><div class="fr"></div></div>${overview ? `<div class="tl">${esc(overview)}</div>` : ''}<div class="cd"><h3>${esc(target)}</h3>${info.map((s, i) => `<p style="--i:${i}">${esc(s)}</p>`).join('')}</div><div class="ft"></div></div>`;
    },
  },
  {
    ...base,
    id: 'lens-annotate',
    no: 371,
    cat: 'pmark',
    zh: '放大鏡掃表',
    en: 'Magnifier Over Table',
    desc: '放大鏡在表格上移動，鏡片裡放大內容，停在要講的那一筆',
    tags: ['放大鏡', '實價登錄', '重點'],
    sample: ['實價登錄（示意）', '2025/03 12F 32 坪 1,580 萬', '2025/04 5F 28 坪 1,260 萬', '>2025/05 8F 30 坪 1,980 萬', '2025/06 3F 26 坪 1,150 萬', '2025/07 10F 31 坪 1,520 萬', '!這筆偏高'],
    hint: '第 1 行表名；之後每行一筆（空格分欄，最多 4 欄），「>」標要停的那筆；「!」開頭是停下後跳出的註解',
    motion: '畫面是一張淺色示意表格（表頭深色、斑馬紋列）。一個深框圓形放大鏡從左上進場，沿著表格左右上下掃過，鏡片內顯示 2 倍放大的同一段內容；最後停在「>」那一筆，該列底下亮起副色，鏡框旁跳出深色註解氣泡。停留後淡出循環。',
    motionEn: 'A light illustrated table (dark header, zebra rows). A dark-rimmed round magnifier enters from the top left and sweeps across the table, its lens showing the same content at 2× zoom; it finally stops on the “>” row, which lights up in accent-2 beneath, and a dark note bubble pops beside the lens. Holds, fades, loops.',
    css: `${G}
.S{--u:calc(min(1cqw,1.7778cqh)*.9)}
.S .g{display:grid;place-items:center}
.S .wr{position:relative}
.S .tb{width:calc(var(--u)*86);background:#f7f4ec;color:#1d2433;border-radius:calc(var(--u)*1.4);overflow:hidden;border:calc(var(--u)*.4) solid var(--fg)}
.S .tb h4{margin:0;padding:calc(var(--u)*1.6) calc(var(--u)*2.4);background:#1d2433;color:#f7f4ec;font-size:calc(var(--u)*3)}
.S .tb .r{display:grid;grid-template-columns:repeat(var(--c),1fr);height:calc(var(--u)*7);align-items:center;padding:0 calc(var(--u)*2.4);font:normal 700 calc(var(--u)*2.6) var(--mono)}
.S .tb .r:nth-child(odd){background:#ebe6da}
.S .tb .r.t{animation:K_hl 7s ease infinite both}
.S .ln{position:absolute;left:0;top:0;width:calc(var(--u)*30);height:calc(var(--u)*30);border-radius:50%;border:calc(var(--u)*1.2) solid var(--fg);overflow:hidden;background:#f7f4ec;box-shadow:0 0 0 calc(var(--u)*.4) var(--ac2);animation:K_mv 7s cubic-bezier(.5,0,.3,1) infinite both}
.S .ln .tb{position:absolute;left:0;top:0;transform-origin:0 0;border:0;animation:K_in 7s cubic-bezier(.5,0,.3,1) infinite both}
.S .hd{position:absolute;left:0;top:0;width:calc(var(--u)*3);height:calc(var(--u)*14);background:var(--fg);border-radius:99px;transform-origin:top center;animation:K_hd 7s cubic-bezier(.5,0,.3,1) infinite both}
.S .nt{position:absolute;left:var(--nx);top:var(--ny);padding:calc(var(--u)*1.2) calc(var(--u)*2.4);background:var(--fg);color:var(--bg);border-radius:calc(var(--u)*1.2);font-size:calc(var(--u)*3.2);font-weight:900;white-space:nowrap;animation:K_nt 7s cubic-bezier(.3,1.8,.5,1) infinite both}
@keyframes K_hl{0%,62%{background:inherit}66%,100%{background:color-mix(in srgb,var(--ac2) 70%,#f7f4ec)}}
@keyframes K_nt{0%,66%{opacity:0;transform:scale(.3)}71%,100%{opacity:1;transform:none}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.05)}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['實價登錄（示意）', '2025/03 12F 32 坪 1,580 萬', '2025/04 5F 28 坪 1,260 萬', '>2025/05 8F 30 坪 1,980 萬', '2025/06 3F 26 坪 1,150 萬', '2025/07 10F 31 坪 1,520 萬', '!這筆偏高']);
      const note = (g.find((s) => /^[!！]/.test(s)) || '').replace(/^[!！]\s*/, '');
      const rest = g.filter((s) => !/^[!！]/.test(s));
      const title = rest[0] && !/\d/.test(rest[0].replace(/[（(].*?[)）]/g, '')) ? rest[0] : '';
      const rowsRaw = (title ? rest.slice(1) : rest).slice(0, 6);
      let t = rowsRaw.findIndex((s) => /^[>＞]/.test(s));
      if (t < 0) t = Math.min(2, rowsRaw.length - 1);
      const rows = rowsRaw.map((s) => {
        const p = s.replace(/^[>＞]\s*/, '').split(/\s+/);
        // 合併「32 坪」「1,580 萬」這類數字＋單位
        const c: string[] = [];
        p.forEach((x) => (c.length && /^[坪萬元%樓]$/.test(x) ? (c[c.length - 1] += ' ' + x) : c.push(x)));
        return c.slice(0, 4);
      });
      const nc = Math.max(1, ...rows.map((r) => r.length));
      const tb = `<div class="tb" style="--c:${nc}">${title ? `<h4>${esc(title)}</h4>` : ''}${rows.map((r, i) => `<div class="r${i === t ? ' t' : ''}">${r.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`).join('')}</div>`;
      // 鏡片路徑（表格座標，u）：表頭高約 6.2u，每列 7u
      const hh = title ? 6.2 : 0;
      const cy = (i: number) => hh + 0.4 + i * 7 + 3.5;
      const last = rows.length - 1;
      const path: [number, number, number][] = [[0, 8, -10], [14, 14, cy(0)], [30, 70, cy(Math.min(1, last))], [44, 20, cy(Math.min(last, 4))], [58, 68, cy(t)], [100, 68, cy(t)]];
      const R = 15, Z = 2;
      const mv = path.map(([p, x, y]) => `${p}%{transform:translate(calc(var(--u)*${(x - R).toFixed(1)}),calc(var(--u)*${(y - R).toFixed(1)}))}`).join('');
      const inn = path.map(([p, x, y]) => `${p}%{transform:translate(calc(var(--u)*${(R - 1.2 - x * Z).toFixed(1)}),calc(var(--u)*${(R - 1.2 - y * Z).toFixed(1)})) scale(${Z})}`).join('');
      const hd = path.map(([p, x, y]) => `${p}%{transform:translate(calc(var(--u)*${(x + R * 0.62).toFixed(1)}),calc(var(--u)*${(y + R * 0.62).toFixed(1)})) rotate(-45deg)}`).join('');
      const css = `<style>@keyframes ma-lens-mv{${mv}}@keyframes ma-lens-in{${inn}}@keyframes ma-lens-hd{${hd}}.fx-lens-annotate .ln{animation-name:ma-lens-mv}.fx-lens-annotate .ln .tb{animation-name:ma-lens-in}.fx-lens-annotate .hd{animation-name:ma-lens-hd}</style>`;
      return `<div class="g">${css}<div class="wr">${tb}<div class="hd"></div><div class="ln">${tb}</div>${note ? `<div class="nt" style="--nx:calc(var(--u)*${68 + R + 1});--ny:calc(var(--u)*${(cy(t) - 4).toFixed(1)})">${esc(note)}</div>` : ''}</div></div>`;
    },
  },
  {
    ...base,
    id: 'before-after-drag',
    no: 372,
    cat: 'pmulti',
    zh: '前後拖曳估值',
    en: 'Before / After Drag Value',
    desc: '分隔線來回拖曳，左右兩邊的數字跟著跳動',
    tags: ['前後對比', '裝潢', '估值'],
    sample: ['裝潢前 980 萬', '裝潢後 1150 萬', '估值多 17%'],
    hint: '第 1、2 行「名稱 數值 單位」（前、後）；第 3 行是結論（可省略）。畫面是程式畫的示意空屋／佈置後客廳（不是真實照片）',
    motion: '整個畫面是一間示意客廳：左半是空屋版本（灰色、空牆），右半是佈置後版本（主色沙發、植物、吊燈）。中央白色分隔線帶著圓形把手先往左拖、再往右拖、最後回到中間，左右上方的深色數字卡跟著拖曳由 0 跳到估值；最後底部跳出副色結論條。停留後淡出循環。',
    motionEn: 'The frame is an illustrated living room: the left half is the bare version (grey, empty walls), the right half is furnished (accent sofa, plant, pendant light). A white divider with a round handle drags left, then right, then back to centre while dark value cards in the top corners count up; finally an accent-2 conclusion bar pops up at the bottom. Holds, fades, loops.',
    css: `${G}
@property --bad-p{syntax:'<percentage>';inherits:true;initial-value:50%}
@property --bad-a{syntax:'<integer>';inherits:true;initial-value:0}
@property --bad-b{syntax:'<integer>';inherits:true;initial-value:0}
.S .g{overflow:hidden;animation:K_o 7s ease infinite both,K_p 7s cubic-bezier(.6,0,.3,1) infinite both,K_n 7s ease-out infinite both}
.S .im{position:absolute;inset:0}
.S .im svg{width:100%;height:100%;display:block}
.S .af{clip-path:inset(0 0 0 var(--bad-p))}
.S .dv{position:absolute;top:0;bottom:0;left:var(--bad-p);width:calc(var(--u)*.7);margin-left:calc(var(--u)*-.35);background:#fff}
.S .dv i{position:absolute;top:50%;left:50%;width:calc(var(--u)*7);aspect-ratio:1;translate:-50% -50%;border-radius:50%;background:#fff;border:calc(var(--u)*.5) solid var(--fg);display:grid;place-items:center;font:normal 900 calc(var(--u)*2.6) var(--mono);color:#1d2433}
.S .vc{position:absolute;top:calc(var(--u)*3);padding:calc(var(--u)*1.4) calc(var(--u)*2.6);background:var(--fg);color:var(--bg);border-radius:calc(var(--u)*1.4);font-size:calc(var(--u)*2.6);font-weight:800;line-height:1.2}
.S .vc.a{left:calc(var(--u)*3)}.S .vc.b{right:calc(var(--u)*3);text-align:right}
.S .vc b{display:block;font:normal 900 calc(var(--u)*5.2) var(--mono)}
.S .vc.a b::before{counter-reset:a var(--bad-a);content:counter(a)}
.S .vc.b b::before{counter-reset:b var(--bad-b);content:counter(b)}
.S .vc.b b{color:var(--ac2)}
.S .cc{position:absolute;left:50%;bottom:calc(var(--u)*4);translate:-50% 0;padding:calc(var(--u)*1.4) calc(var(--u)*3.4);background:var(--ac2);color:#1d2433;border-radius:99px;font-size:calc(var(--u)*3.6);font-weight:900;white-space:nowrap;animation:K_cc 7s cubic-bezier(.3,1.8,.5,1) infinite both}
.S .tg{position:absolute;bottom:calc(var(--u)*3);font-size:calc(var(--u)*1.8);opacity:.6;right:calc(var(--u)*2);color:var(--fg)}
@keyframes K_p{0%,10%{--bad-p:50%}26%{--bad-p:18%}46%{--bad-p:82%}60%,100%{--bad-p:50%}}
@keyframes K_n{0%,8%{--bad-a:0;--bad-b:0}50%,100%{--bad-a:var(--va);--bad-b:var(--vb)}}
@keyframes K_cc{0%,62%{opacity:0;transform:scale(.3)}68%,100%{opacity:1;transform:none}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.5)}.S .vc{top:calc(var(--u)*8)}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['裝潢前 980 萬', '裝潢後 1150 萬', '估值多 17%']);
      const a = kv(g[0] || '前 0'), b = kv(g[1] || '後 0');
      const va = Number.isFinite(a.v) ? Math.round(a.v) : 0, vb = Number.isFinite(b.v) ? Math.round(b.v) : 0;
      const cc = g[2] || '';
      return `<div class="g" style="--va:${va};--vb:${vb}"><div class="im">${room(false)}</div><div class="im af">${room(true)}</div><div class="dv"><i>‹ ›</i></div><div class="vc a">${esc(a.k)}<b>${a.u ? `<small> ${esc(a.u)}</small>` : ''}</b></div><div class="vc b">${esc(b.k)}<b>${b.u ? `<small> ${esc(b.u)}</small>` : ''}</b></div>${cc ? `<div class="cc">${esc(cc)}</div>` : ''}<div class="tg">示意圖</div></div>`;
    },
  },
  {
    ...base,
    id: 'plan-callouts',
    no: 373,
    cat: 'punit',
    zh: '格局引線標註',
    en: 'Floor Plan Callouts',
    desc: '格局圖上逐條拉出引線標籤，房間同步亮起',
    tags: ['格局', '標註', '看屋'],
    sample: ['主臥 4.5 坪', '陽台 1.2 坪', '管道間', '客廳 8 坪', '廚房 2 坪'],
    hint: '依序對應示意格局的 主臥、陽台、管道間、客廳、廚房、次臥 6 格（2–6 行，可改名或加坪數）。格局是程式畫的示意圖',
    motion: '畫面中央一張示意格局圖（深色牆線、淺色地板、門的弧線）。標註一條一條出現：先是對應房間填上主色亮起，接著一條引線從房間中心往外拉出，末端彈出深色名稱標籤（坪數用副色）；下一條出現時上一間房間的亮色退成淡色。全部標完後所有房間一起淡淡亮著，停留後淡出循環。',
    motionEn: 'An illustrated floor plan in the centre (dark wall lines, light floors, door arcs). Callouts appear one at a time: the matching room fills with the accent, a leader line pulls out from its centre and a dark name tag pops at the end (area in accent-2); as the next one appears the previous room fades to a light tint. Once all are labelled the rooms stay softly lit. Holds, fades, loops.',
    css: `${G}
.S{--u:calc(min(1cqw,1.7778cqh)*.95)}
.S .g{display:grid;place-items:center}
.S .pl{position:relative;width:calc(var(--u)*78);aspect-ratio:160/90}
.S .pl svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.S .rm{fill:#f3efe6}
.S .rm.on{animation:K_rm 7s ease infinite both;animation-delay:calc(var(--i)*.75s)}
.S .wl{fill:none;stroke:#1d2433;stroke-width:2.2;stroke-linejoin:round}
.S .dr{fill:none;stroke:#1d2433;stroke-width:.7}
.S .ld{stroke:var(--fg);stroke-width:.8;stroke-dasharray:100;stroke-dashoffset:100;animation:K_ld 7s ease infinite both;animation-delay:calc(var(--i)*.75s)}
.S .dt{fill:var(--fg);animation:K_dt 7s ease infinite both;animation-delay:calc(var(--i)*.75s)}
.S .tg{position:absolute;translate:var(--tx) -50%;padding:calc(var(--u)*.9) calc(var(--u)*1.8);background:var(--fg);color:var(--bg);border-radius:calc(var(--u)*1);font-size:calc(var(--u)*2.8);font-weight:900;white-space:nowrap;animation:K_tg 7s cubic-bezier(.3,1.8,.5,1) infinite both;animation-delay:calc(var(--i)*.75s)}
.S .tg b{color:var(--ac2);font-family:var(--mono);margin-left:calc(var(--u)*.8)}
.S .cap{position:absolute;right:0;bottom:calc(var(--u)*-3.6);font-size:calc(var(--u)*1.8);opacity:.6}
@keyframes K_rm{0%,6%{fill:#f3efe6}9%,16%{fill:var(--ac)}22%,100%{fill:color-mix(in srgb,var(--ac) 30%,#f3efe6)}}
@keyframes K_ld{0%,8%{stroke-dashoffset:100}14%,100%{stroke-dashoffset:0}}
@keyframes K_dt{0%,7%{opacity:0}9%,100%{opacity:1}}
@keyframes K_tg{0%,12%{opacity:0;transform:scale(.3)}16%,100%{opacity:1;transform:none}}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.1)}.S .pl{width:calc(var(--u)*64)}.S .tg{font-size:calc(var(--u)*2.4)}}
${OUT}`,
    html: (w) => {
      const g = given(w, ['主臥 4.5 坪', '陽台 1.2 坪', '管道間', '客廳 8 坪', '廚房 2 坪']).slice(0, 6);
      // 示意格局（viewBox 160×90，平面範圍 x 30–130）
      const R = [
        { x: 30, y: 10, w: 34, h: 32, lx: 22, ly: 14 }, // 主臥
        { x: 30, y: 42, w: 34, h: 10, lx: 22, ly: 47 }, // 陽台（左下外側示意）
        { x: 64, y: 10, w: 10, h: 12, lx: 70, ly: 2 }, // 管道間
        { x: 64, y: 22, w: 66, h: 40, lx: 138, ly: 46 }, // 客廳
        { x: 74, y: 10, w: 26, h: 12, lx: 112, ly: 3 }, // 廚房
        { x: 30, y: 52, w: 34, h: 28, lx: 22, ly: 72 }, // 次臥
      ];
      const n = g.length;
      const rooms = R.map((r, i) => `<rect class="rm${i < n ? ' on' : ''}" style="--i:${i}" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}"/>`).join('');
      const extra = '<rect class="rm" x="100" y="10" width="30" height="12"/><rect class="rm" x="64" y="62" width="66" height="18"/>';
      const walls = '<path class="wl" d="M30 10H130V80H30Z M64 10V80 M30 42H64 M30 52H64 M64 22H130 M74 10V22 M100 10V22 M64 62H130"/><path class="dr" d="M64 30a8 8 0 0 1 8 8 M64 70a7 7 0 0 0 -7 -7 M100 22a7 7 0 0 1 -7 -7"/>';
      const leads = R.slice(0, n).map((r, i) => { const cx = r.x + r.w / 2, cy = r.y + r.h / 2; return `<path class="ld" pathLength="100" style="--i:${i}" d="M${cx} ${cy}L${r.lx} ${r.ly}"/><circle class="dt" style="--i:${i}" cx="${cx}" cy="${cy}" r="1.4"/>`; }).join('');
      const tags = g.map((s, i) => {
        const r = R[i], m = s.match(/^(.*?)\s*([\d.]+\s*坪)$/);
        const tx = r.lx < 28 ? '-100%' : r.lx > 132 ? '0%' : '-50%';
        return `<div class="tg" style="--i:${i};--tx:${tx};left:${((r.lx / 160) * 100).toFixed(1)}%;top:${((r.ly / 90) * 100).toFixed(1)}%">${esc(m ? m[1] : s)}${m ? `<b>${esc(m[2])}</b>` : ''}</div>`;
      }).join('');
      return `<div class="g"><div class="pl"><svg viewBox="0 0 160 90">${rooms}${extra}${walls}${leads}</svg>${tags}<div class="cap">示意格局</div></div></div>`;
    },
  },
];
