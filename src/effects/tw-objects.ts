import type { Fx } from '../types';
import { esc } from '../util';

// 2026-10-27 物件擴充批次 O3（392–401）：台灣民情 10 個。純 CSS，house style；宗教題材只做風格化示意
const base = { added: '2026-10-27', tone: 'ink' as const, preferredRatio: '16:9' as const, cat: 'twlife' as const };
const given = (w: string[], fb: string[]) => {
  const g = w.map((s) => String(s ?? '').trim()).filter(Boolean);
  return g.length ? g : fb;
};
const H = `.S{--u:calc(min(1cqw,1.7778cqh)*.8);--bw:calc(var(--u)*.7);--sh:calc(var(--u)*1.2) calc(var(--u)*1.2) 0 var(--fg)}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.55)}}
.S .g{position:absolute;inset:0;display:grid;place-items:center;animation:K_o 7s ease infinite both}
.S .bx{border:var(--bw) solid var(--fg);box-shadow:var(--sh)}
.S .tt{font-weight:900;color:var(--fg)}
.S .tt.lt{color:var(--bg)}
.S .cap{position:absolute;left:50%;bottom:12%;translate:-50% 0;padding:calc(var(--u)*1.6) calc(var(--u)*3.4);background:var(--ac2);font-size:calc(var(--u)*4.6);border-radius:calc(var(--u)*1.4);white-space:nowrap}
@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}`;
const rnd = (i: number) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
// 底部標語：在 at（0–1）時彈出
const cap = (t: string, at: number) => `<b class="cap bx tt lt" style="animation:K_c${Math.round(at * 100)} 7s cubic-bezier(.3,1.6,.5,1) infinite both">${esc(t)}</b>`;
const CAP = [52, 55, 60].map((p) => `@keyframes K_c${p}{0%,${p}%{opacity:0;transform:translateY(calc(var(--u)*4)) scale(.6)}${p + 8}%,100%{opacity:1;transform:none}}`).join('\n');

export const twObjects: Fx[] = [
  {
    ...base, id: 'obj-tw-redenv', no: 392, zh: '紅包抽卡', en: 'Red Envelope',
    desc: '紅包彈入、福字蹦出，封口掀開抽出內容卡',
    tags: ['紅包', '年終', '台灣'], sample: ['年終獎金', '頭期款補助 50 萬'],
    hint: '第 1 行寫在紅包上，第 2 行是抽出來的內容卡',
    motion: '一個紅色紅包（粗黑框、金色封口）從下方彈入，中央金色「福」字圓章蹦出轉一下；接著封口往上掀開，一張寫著內容的白卡從紅包裡往上抽出並放大。',
    motionEn: 'A red envelope (thick outline, gold flap) bounces in, a gold 福 seal pops and spins; the flap lifts and a white card with the content slides up out of it and scales up.',
    css: `${H}
.S .w{position:relative;width:calc(var(--u)*30);height:calc(var(--u)*42);margin-top:calc(var(--u)*18);animation:K_in 7s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .cd{position:absolute;left:8%;right:8%;top:6%;height:70%;background:#fffaf0;border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*1.2);display:grid;place-items:center;text-align:center;padding:calc(var(--u)*2);font-size:calc(var(--u)*4.4);color:#1a1a1a;font-weight:900;animation:K_cd 7s cubic-bezier(.3,1.3,.5,1) infinite both}
.S .env{position:absolute;inset:0;background:#d92b2b;border-radius:calc(var(--u)*1.6);overflow:visible}
.S .fl{position:absolute;left:-1px;right:-1px;top:0;height:28%;background:#e8b730;border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*1.6) calc(var(--u)*1.6) 50% 50%;transform-origin:50% 0;animation:K_fl 7s ease infinite both}
.S .fu{position:absolute;left:50%;top:48%;width:calc(var(--u)*13);aspect-ratio:1;margin:calc(var(--u)*-6.5) 0 0 calc(var(--u)*-6.5);border-radius:50%;background:#e8b730;border:var(--bw) solid var(--fg);display:grid;place-items:center;font-size:calc(var(--u)*7);color:#d92b2b;font-weight:900;animation:K_fu 7s cubic-bezier(.3,1.8,.5,1) infinite both}
.S .lb{position:absolute;left:0;right:0;bottom:10%;text-align:center;font-size:calc(var(--u)*3.4);color:#ffe9a8;font-weight:900}
@keyframes K_in{0%{transform:translateY(calc(var(--u)*60))}10%,100%{transform:none}}
@keyframes K_fu{0%,10%{transform:scale(0) rotate(-180deg)}20%,100%{transform:none}}
@keyframes K_fl{0%,30%{transform:none}38%,100%{transform:rotateX(180deg)}}
@keyframes K_cd{0%,38%{transform:none;z-index:0}52%,100%{transform:translateY(calc(var(--u)*-20)) scale(1.1)}}`,
    html: (w) => {
      const [a, b] = given(w, ['年終獎金', '頭期款補助 50 萬']);
      return `<div class="g"><div class="w"><div class="cd">${esc(b ?? a)}</div><div class="env bx"><i class="fl"></i><b class="fu">福</b><b class="lb">${esc(a)}</b></div></div></div>`;
    },
  },
  {
    ...base, id: 'obj-tw-invoice', no: 393, zh: '統一發票對獎', en: 'Receipt Lottery',
    desc: '發票號碼逐位亮起比對，中獎號碼放大',
    tags: ['對獎', '機率', '台灣'], sample: ['12345678', '中了 200 元！'],
    hint: '第 1 行是 8 位號碼，第 2 行是對中後的結果',
    motion: '一張白色統一發票（粗黑框、上方「電子發票證明聯」字樣）滑入，號碼由右往左一位一位亮起副色底，像在對獎；最後三位對中時整排號碼放大跳動，下方彈出結果標語。',
    motionEn: 'A white Taiwan e-receipt slides in; its number lights up digit by digit from right to left like checking the lottery; when the last digits match the number jumps big and a result tag pops below.',
    css: `${H}${CAP}
.S .rc{position:relative;width:calc(var(--u)*58);padding:calc(var(--u)*3) calc(var(--u)*3) calc(var(--u)*4);background:#fffaf0;color:#1a1a1a;border-radius:calc(var(--u)*1);text-align:center;margin-bottom:calc(var(--u)*10);animation:K_rc 7s cubic-bezier(.3,1.4,.5,1) infinite both}
.S .rc h4{margin:0;font-size:calc(var(--u)*3.2);font-weight:900}
.S .rc small{display:block;font-size:calc(var(--u)*2.4);opacity:.6;margin-top:calc(var(--u)*.6)}
.S .no{display:flex;justify-content:center;gap:calc(var(--u)*.6);margin-top:calc(var(--u)*2.4);animation:K_no 7s ease infinite both}
.S .no b{width:calc(var(--u)*5.6);padding:calc(var(--u)*.8) 0;font-size:calc(var(--u)*5);font-family:ui-monospace,monospace;border-radius:calc(var(--u)*.8);animation:K_dg 7s steps(1) infinite both;animation-delay:var(--d)}
.S .bc{height:calc(var(--u)*4);margin-top:calc(var(--u)*2.4);background:repeating-linear-gradient(90deg,#1a1a1a 0 2px,transparent 0 5px,#1a1a1a 0 6px,transparent 0 9px)}
@keyframes K_rc{0%{transform:translateY(calc(var(--u)*-40)) rotate(-8deg)}10%,100%{transform:none}}
@keyframes K_dg{0%,14%{background:transparent;color:#1a1a1a}15%,100%{background:var(--ac2);color:#1a1a1a}}
@keyframes K_no{0%,58%{transform:none}62%{transform:scale(1.2)}66%{transform:scale(1.08)}70%,100%{transform:scale(1.12)}}`,
    html: (w) => {
      const [a, b] = given(w, ['12345678', '中了 200 元！']);
      const d = (a.replace(/\D/g, '') + '00000000').slice(0, 8).split('');
      const ds = d.map((c, i) => `<b style="--d:${((7 - i) * 0.42).toFixed(2)}s">${c}</b>`).join('');
      return `<div class="g"><div class="rc bx"><h4>電子發票證明聯</h4><small>115年 09-10月</small><div class="no">${ds}</div><div class="bc"></div></div>${cap(b ?? '中獎！', 0.6)}</div>`;
    },
  },
  {
    ...base, id: 'obj-tw-cvs', no: 394, zh: '便利商店自動門', en: 'Convenience Store Door',
    desc: '自動門滑開＋叮咚示意，貨架上排出商品＝選項',
    tags: ['生活圈', '機能', '台灣'], sample: ['生活機能', '超商', '捷運', '公園', '學區'],
    hint: '第 1 行是招牌，之後 2–4 行是貨架上的選項',
    motion: '一間便利商店門面（白底、上方三色條紋招牌）上的玻璃自動門往兩側滑開，門上方跳出「叮咚♪」對話框；門後貨架上一格一格彈出商品盒，每個盒子寫著一個選項。',
    motionEn: 'A convenience-store front with a tri-stripe sign; the glass doors slide apart, a "ding-dong ♪" bubble pops above, and product boxes pop onto the shelf behind, each carrying an option.',
    css: `${H}
.S .st{position:relative;margin-top:calc(var(--u)*8);width:calc(var(--u)*64);height:calc(var(--u)*44);background:#fffaf0;border-radius:calc(var(--u)*1)}
.S .sg{height:calc(var(--u)*8);background:linear-gradient(#f08a24 0 33%,#fffaf0 0 50%,#1f9d55 0 75%,#d92b2b 0);border-bottom:var(--bw) solid var(--fg);display:grid;place-items:center}
.S .sg b{background:#fffaf0;padding:0 calc(var(--u)*2);border-radius:calc(var(--u)*.6);font-size:calc(var(--u)*3.4);color:#1a1a1a}
.S .in{position:absolute;left:8%;right:8%;top:calc(var(--u)*12);bottom:0;border:var(--bw) solid var(--fg);border-bottom:0;background:color-mix(in srgb,var(--ac) 25%,#fffaf0);overflow:hidden}
.S .sh{position:absolute;left:6%;right:6%;top:24%;display:grid;grid-template-columns:repeat(2,1fr);gap:calc(var(--u)*1.6)}
.S .sh b{padding:calc(var(--u)*1.6) 0;text-align:center;background:var(--ac);border:calc(var(--u)*.5) solid var(--fg);border-radius:calc(var(--u)*.6);font-size:calc(var(--u)*3.4);animation:K_bx 7s cubic-bezier(.3,1.8,.5,1) infinite both;animation-delay:calc(1.6s + var(--i)*.35s)}
.S .dr{position:absolute;top:0;bottom:0;width:50%;background:color-mix(in srgb,#9fd8ff 55%,transparent);border:calc(var(--u)*.5) solid var(--fg);animation:K_dr 7s ease-in-out infinite both}
.S .dr.l{left:0;--x:-100%}.S .dr.r{right:0;--x:100%}
.S .dg{position:absolute;right:-6%;top:calc(var(--u)*-6);padding:calc(var(--u)*1) calc(var(--u)*2);background:var(--ac2);border-radius:calc(var(--u)*2);font-size:calc(var(--u)*3.2);animation:K_dg 7s cubic-bezier(.3,1.8,.5,1) infinite both}
@keyframes K_dr{0%,12%{transform:none}24%,100%{transform:translateX(var(--x))}}
@keyframes K_dg{0%,12%{transform:scale(0)}18%,34%{transform:rotate(6deg)}40%,100%{transform:scale(0)}}
@keyframes K_bx{0%{transform:scale(0)}8%,100%{transform:none}}`,
    html: (w) => {
      const all = given(w, ['生活機能', '超商', '捷運', '公園', '學區']);
      const sign = all.length > 1 ? all[0] : '便利商店';
      const it = (all.length > 1 ? all.slice(1) : all).slice(0, 4);
      return `<div class="g"><div class="st bx"><div class="sg"><b class="tt">${esc(sign)}</b></div><div class="in"><div class="sh">${it.map((t, i) => `<b class="tt lt" style="--i:${i}">${esc(t)}</b>`).join('')}</div><i class="dr l"></i><i class="dr r"></i></div><b class="dg bx tt lt">叮咚♪</b></div></div>`;
    },
  },
  {
    ...base, id: 'obj-tw-boba', no: 395, zh: '手搖飲封膜', en: 'Bubble Tea Seal',
    desc: '封口機壓下印字，粗吸管「啪」一聲插下',
    tags: ['選擇', '客製', '台灣'], sample: ['自備款', '微糖 去冰'],
    hint: '第 1 行印在封膜上，第 2 行是杯身貼紙（甜度冰塊＝選項）',
    motion: '一杯手搖飲（透明杯身、底部黑色珍珠、副色奶茶）站在畫面中央，上方封口機壓頭往下一壓再彈起，封膜上印出第一行字；接著一根粗吸管從上方「啪」地插下，杯身彈一下並貼上選項貼紙。',
    motionEn: 'A bubble-tea cup (clear cup, black pearls, milk-tea fill) stands centre; a sealing press slams down and lifts, printing the first line on the film; a fat straw stabs in with a bounce and an options sticker slaps onto the cup.',
    css: `${H}
.S .w{position:relative;width:calc(var(--u)*26);height:calc(var(--u)*56);margin-top:calc(var(--u)*18)}
.S .pr{position:absolute;left:-10%;right:-10%;top:calc(var(--u)*-6);height:calc(var(--u)*7);background:var(--ac);border-radius:calc(var(--u)*1);animation:K_pr 7s cubic-bezier(.6,0,.4,1) infinite both}
.S .cup{position:absolute;left:0;right:0;top:calc(var(--u)*16);bottom:0;clip-path:polygon(0 0,100% 0,88% 100%,12% 100%);background:var(--fg)}
.S .cup i{position:absolute;inset:calc(var(--u)*.7) calc(var(--u)*.7) calc(var(--u)*.7);clip-path:polygon(0 0,100% 0,88% 100%,12% 100%);background:linear-gradient(transparent 0 8%,#c99a6b 0)}
.S .pe{position:absolute;bottom:calc(var(--u)*1.6);width:calc(var(--u)*3.4);aspect-ratio:1;border-radius:50%;background:#1a1a1a;box-shadow:0 0 0 calc(var(--u)*.3) #fffaf0 inset}
.S .film{position:absolute;left:-4%;right:-4%;top:calc(var(--u)*14);height:calc(var(--u)*3.6);background:#fffaf0;border:calc(var(--u)*.5) solid var(--fg);border-radius:calc(var(--u)*.6);display:grid;place-items:center;font-size:calc(var(--u)*2.6);color:#d92b2b;font-weight:900;white-space:nowrap}
.S .film span{animation:K_pt 7s steps(1) infinite both}
.S .straw{position:absolute;left:56%;top:calc(var(--u)*-14);width:calc(var(--u)*4.4);height:calc(var(--u)*44);background:var(--ac2);border:calc(var(--u)*.5) solid var(--fg);rotate:8deg;transform-origin:50% 100%;animation:K_sw 7s cubic-bezier(.7,0,.3,1.4) infinite both}
.S .tag{position:absolute;left:50%;top:58%;translate:-50% 0;padding:calc(var(--u)*1.2) calc(var(--u)*2);background:var(--ac2);font-size:calc(var(--u)*3.4);border-radius:calc(var(--u)*1);white-space:nowrap;rotate:-6deg;animation:K_tg 7s cubic-bezier(.3,1.8,.5,1) infinite both}
.S .cw{position:absolute;inset:0;animation:K_cb 7s ease infinite both}
@keyframes K_pr{0%,10%{transform:translateY(calc(var(--u)*-20))}20%{transform:translateY(calc(var(--u)*13))}26%{transform:translateY(calc(var(--u)*13))}34%,100%{transform:translateY(calc(var(--u)*-40))}}
@keyframes K_pt{0%,21%{opacity:0}22%,100%{opacity:1}}
@keyframes K_sw{0%,38%{transform:translateY(calc(var(--u)*-60))}46%,100%{transform:none}}
@keyframes K_cb{0%,45%{transform:none}48%{transform:scale(1.05,.94)}52%,100%{transform:none}}
@keyframes K_tg{0%,52%{transform:scale(0)}60%,100%{transform:none}}`,
    html: (w) => {
      const [a, b] = given(w, ['自備款', '微糖 去冰']);
      const pe = Array.from({ length: 6 }, (_, i) => `<i class="pe" style="left:${18 + i * 11}%;bottom:calc(var(--u)*${(1.4 + (i % 2) * 2.6).toFixed(1)})"></i>`).join('');
      return `<div class="g"><div class="w"><i class="straw"></i><div class="cw"><div class="cup"><i></i>${pe}</div><div class="film"><span>${esc(a)}</span></div>${b ? `<b class="tag bx tt lt">${esc(b)}</b>` : ''}</div><i class="pr bx"></i></div></div>`;
    },
  },
  {
    ...base, id: 'obj-tw-scooter', no: 396, zh: '機車待轉格', en: 'Scooter Hook Turn',
    desc: '機車騎進待轉格停好，燈號轉綠出發',
    tags: ['交通', '通勤', '台灣'], sample: ['通勤 20 分鐘'],
    hint: '一行文字，會寫在待轉格旁邊的路牌上',
    motion: '俯視的路口一角：白色待轉格框線畫好，一台主色機車（側面剪影、粗黑框）從左邊騎進格子裡停下輕晃；右上紅燈亮著，倒數後轉成綠燈，機車往右衝出畫面，路牌彈出文字。',
    motionEn: 'A corner of an intersection: a white hook-turn box; an accent scooter rides in from the left, stops and sways; the red light turns green and the scooter zooms off right as a road sign pops with the text.',
    css: `${H}
.S .rd{position:absolute;left:0;right:0;top:50%;height:calc(var(--u)*24);margin-top:calc(var(--u)*-6);background:#3a3a3a;border-block:var(--bw) solid var(--fg)}
.S .bxg{position:absolute;left:50%;top:50%;width:calc(var(--u)*26);height:calc(var(--u)*16);margin:calc(var(--u)*-2) 0 0 calc(var(--u)*-13);border:calc(var(--u)*.8) solid #fffaf0}
.S .bxg::after{content:'機車待轉';position:absolute;left:0;right:0;bottom:calc(var(--u)*.6);text-align:center;color:#fffaf0;font-size:calc(var(--u)*2.6);font-weight:900}
.S .sc{position:absolute;left:50%;top:50%;width:calc(var(--u)*20);margin:calc(var(--u)*-8) 0 0 calc(var(--u)*-10);animation:K_sc 7s cubic-bezier(.4,0,.3,1) infinite both}
.S .sc svg{width:100%;overflow:visible}
.S .sc .b{fill:var(--ac);stroke:var(--fg);stroke-width:5;stroke-linejoin:round}
.S .sc .wh{fill:#1a1a1a;stroke:var(--fg);stroke-width:5}
.S .lt2{position:absolute;right:12%;top:10%;display:flex;gap:calc(var(--u)*1);padding:calc(var(--u)*1.2);background:#1a1a1a;border-radius:calc(var(--u)*1.4)}
.S .lt2 i{width:calc(var(--u)*6);aspect-ratio:1;border-radius:50%;background:#444}
.S .lt2 .r{animation:K_r 7s steps(1) infinite both}.S .lt2 .gr{animation:K_gr 7s steps(1) infinite both}
.S .sn{position:absolute;left:10%;top:10%;padding:calc(var(--u)*1.6) calc(var(--u)*3);background:#1f7a4d;color:#fffaf0;font-size:calc(var(--u)*4.4);border-radius:calc(var(--u)*1);animation:K_sn 7s cubic-bezier(.3,1.6,.5,1) infinite both}
@keyframes K_sc{0%{transform:translateX(calc(var(--u)*-90))}22%{transform:none}25%{transform:rotate(-3deg)}28%,48%{transform:none}62%,100%{transform:translateX(calc(var(--u)*110))}}
@keyframes K_r{0%,46%{background:#e53935}47%,100%{background:#444}}
@keyframes K_gr{0%,46%{background:#444}47%,100%{background:#2ecc71}}
@keyframes K_sn{0%,52%{transform:scale(0)}60%,100%{transform:none}}`,
    html: (w) => {
      const [a] = given(w, ['通勤 20 分鐘']);
      return `<div class="g"><div class="rd"></div><i class="bxg"></i><div class="sc"><svg viewBox="0 0 120 80"><path class="b" d="M20 50 Q22 30 46 30 L70 30 L78 12 L92 12 L88 30 Q108 34 104 52 Z"/><rect class="b" x="40" y="20" width="26" height="8" rx="3"/><circle class="wh" cx="28" cy="58" r="12"/><circle class="wh" cx="94" cy="58" r="12"/></svg></div><div class="lt2 bx"><i class="r"></i><i class="gr"></i></div><b class="sn bx tt">${esc(a)}</b></div>`;
    },
  },
  {
    ...base, id: 'obj-tw-garbage', no: 397, zh: '垃圾車來了', en: 'Garbage Truck Tune',
    desc: '黃色垃圾車開進來，音符飄出，住戶拎袋跑（只有音符圖示，無音樂）',
    tags: ['社區', '時段', '台灣'], sample: ['晚上 7 點半', '倒垃圾時間'],
    hint: '第 1 行寫在車身上，第 2 行是底部標語',
    motion: '一台黃色垃圾車（粗黑框、側面剪影）從右邊開進畫面停下，車頂喇叭一顆顆飄出音符圖示往上浮；左邊兩個簡化小人拎著垃圾袋跑過來，最後底部彈出標語。純視覺示意，不附音樂。',
    motionEn: 'A yellow garbage truck drives in from the right and stops; note icons float up from its roof speaker; two simple figures run in from the left carrying bags; a tag pops at the bottom. Visual only, no music.',
    css: `${H}${CAP}
.S .gd{position:absolute;left:0;right:0;top:66%;border-top:var(--bw) solid var(--fg)}
.S .tr{position:absolute;left:48%;top:66%;width:calc(var(--u)*46);height:calc(var(--u)*24);margin-top:calc(var(--u)*-28);animation:K_tr 7s cubic-bezier(.2,.7,.3,1) infinite both}
.S .bd{position:absolute;left:0;top:0;width:68%;height:80%;background:#f5c518;border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*1.4);display:grid;place-items:center;font-size:calc(var(--u)*3.6);color:#1a1a1a;font-weight:900;text-align:center}
.S .cb{position:absolute;right:0;top:20%;width:30%;height:60%;background:#f5c518;border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*1) calc(var(--u)*3) calc(var(--u)*1) calc(var(--u)*1)}
.S .cb::before{content:'';position:absolute;left:18%;top:14%;width:50%;height:36%;background:#9fd8ff;border:calc(var(--u)*.4) solid var(--fg)}
.S .wl{position:absolute;bottom:calc(var(--u)*-3);width:calc(var(--u)*8);aspect-ratio:1;border-radius:50%;background:#1a1a1a;border:calc(var(--u)*.6) solid var(--fg)}
.S .sp{position:absolute;left:20%;top:calc(var(--u)*-4);width:calc(var(--u)*6);height:calc(var(--u)*4);background:#e0e0e0;border:calc(var(--u)*.5) solid var(--fg);clip-path:polygon(0 30%,40% 30%,100% 0,100% 100%,40% 70%,0 70%)}
.S .nt{position:absolute;left:24%;top:calc(var(--u)*-6);font-size:calc(var(--u)*6);color:var(--ac2);font-weight:900;opacity:0;animation:K_nt 2s ease-out infinite;animation-delay:calc(1.6s + var(--i)*.5s)}
.S .pp{position:absolute;top:66%;width:calc(var(--u)*7);height:calc(var(--u)*14);margin-top:calc(var(--u)*-14);animation:K_pp 7s ease-out infinite both;animation-delay:var(--d)}
.S .pp svg{width:100%;height:100%;overflow:visible}
.S .pp .p{fill:var(--fg)}.S .pp .bg{fill:var(--ac);stroke:var(--fg);stroke-width:3}
@keyframes K_tr{0%{transform:translateX(calc(var(--u)*90))}20%,100%{transform:none}}
@keyframes K_nt{0%{opacity:0;transform:none}15%{opacity:1}100%{opacity:0;transform:translate(calc(var(--u)*var(--x)),calc(var(--u)*-18)) rotate(20deg)}}
@keyframes K_pp{0%,30%{transform:translateX(calc(var(--u)*-60))}55%,100%{transform:none}}`,
    html: (w) => {
      const [a, b] = given(w, ['晚上 7 點半', '倒垃圾時間']);
      const nts = ['♪', '♫', '♪', '♬'].map((n, i) => `<b class="nt" style="--i:${i};--x:${((rnd(i) - .5) * 16).toFixed(1)}">${n}</b>`).join('');
      const person = `<svg viewBox="0 0 30 60"><circle class="p" cx="12" cy="7" r="6"/><path class="p" d="M6 16 h12 l2 22 h-4 l-2 20 h-4 l-1 -20 h-4 z"/><rect class="bg" x="18" y="30" width="11" height="13" rx="3"/></svg>`;
      return `<div class="g"><i class="gd"></i><div class="tr"><div class="bd">${esc(a)}</div><div class="cb"></div><i class="wl" style="left:10%"></i><i class="wl" style="right:6%"></i><i class="sp"></i>${nts}</div><div class="pp" style="left:22%;--d:.1s">${person}</div><div class="pp" style="left:32%;--d:.4s">${person}</div>${b ? cap(b, 0.55) : ''}</div>`;
    },
  },
  {
    ...base, id: 'obj-tw-temple', no: 398, zh: '廟宇屋頂剪黏', en: 'Temple Roof Ridge',
    desc: '燕尾屋脊一段段長出，龍形剪黏亮起（風格化）',
    tags: ['在地文化', '地標', '台灣'], sample: ['在地信仰中心', '老街商圈'],
    hint: '第 1 行寫在匾額上，第 2 行是底部標語',
    motion: '風格化的廟宇屋頂：紅色屋身與匾額先立起，上方屋脊從中間往兩側一段段長出，兩端燕尾往上翹；屋脊上兩條用簡單色塊拼成的龍形剪黏依序亮起閃一下，中央寶珠發光。',
    motionEn: 'A stylized temple roof: the red hall and plaque rise, the ridge grows outward segment by segment with swallowtail ends curling up; two simple block-built dragon mosaics light up in turn and the central pearl glows.',
    css: `${H}${CAP}
.S .w{position:relative;width:calc(var(--u)*80);height:calc(var(--u)*44);margin-bottom:calc(var(--u)*10)}
.S .hall{position:absolute;left:18%;right:18%;bottom:0;height:46%;background:#c0392b;border:var(--bw) solid var(--fg);animation:K_up 7s cubic-bezier(.3,1.4,.5,1) infinite both}
.S .pl{position:absolute;left:50%;top:18%;translate:-50% 0;padding:calc(var(--u)*1) calc(var(--u)*2.4);background:#1a1a1a;color:#e8b730;font-size:calc(var(--u)*3.6);font-weight:900;border:calc(var(--u)*.5) solid #e8b730;white-space:nowrap}
.S .roof{position:absolute;left:6%;right:6%;bottom:44%;height:22%;background:#2e7d5b;border:var(--bw) solid var(--fg);clip-path:polygon(0 100%,8% 0,92% 0,100% 100%);animation:K_up 7s cubic-bezier(.3,1.4,.5,1) infinite both;animation-delay:.3s}
.S .rg{position:absolute;left:50%;bottom:64%;height:calc(var(--u)*3.4);width:84%;translate:-50% 0;display:flex}
.S .rg i{flex:1;background:#e8b730;border-block:calc(var(--u)*.5) solid var(--fg);transform:scaleX(0);animation:K_seg 7s ease-out infinite both;animation-delay:calc(.7s + var(--k)*.12s)}
.S .tail{position:absolute;bottom:64%;width:calc(var(--u)*8);height:calc(var(--u)*8);border:calc(var(--u)*1.4) solid #e8b730;border-bottom:0;border-radius:50% 50% 0 0;opacity:0;animation:K_tl 7s cubic-bezier(.3,1.8,.5,1) infinite both}
.S .tail.l{left:3%;border-right:0;border-radius:100% 0 0 0}.S .tail.r{right:3%;border-left:0;border-radius:0 100% 0 0}
.S .dg{position:absolute;bottom:72%;display:flex;gap:calc(var(--u)*.4);animation:K_dg 7s steps(1) infinite both;animation-delay:var(--d)}
.S .dg b{width:calc(var(--u)*3);height:calc(var(--u)*3);border:calc(var(--u)*.4) solid var(--fg);border-radius:calc(var(--u)*.6);background:#888}
.S .dg b:nth-child(odd){translate:0 calc(var(--u)*-1.4)}
.S .pearl{position:absolute;left:50%;bottom:72%;width:calc(var(--u)*5);aspect-ratio:1;margin-left:calc(var(--u)*-2.5);border-radius:50%;background:#e53935;border:calc(var(--u)*.5) solid var(--fg);animation:K_pl 7s ease infinite both}
@keyframes K_up{0%{transform:translateY(calc(var(--u)*30));opacity:0}10%,100%{transform:none;opacity:1}}
@keyframes K_seg{0%{transform:scaleX(0)}6%,100%{transform:none}}
@keyframes K_tl{0%,26%{opacity:0;transform:scale(0)}32%,100%{opacity:1;transform:none}}
@keyframes K_dg{0%,38%{filter:grayscale(1) brightness(.6)}39%,100%{filter:none}}
@keyframes K_pl{0%,50%{box-shadow:none}56%,100%{box-shadow:0 0 0 calc(var(--u)*1.4) color-mix(in srgb,#e8b730 70%,transparent)}}`,
    html: (w) => {
      const [a, b] = given(w, ['在地信仰中心', '老街商圈']);
      const n = 12, seg = Array.from({ length: n }, (_, i) => `<i style="--k:${Math.abs(i - (n - 1) / 2).toFixed(1)}"></i>`).join('');
      const col = ['#e53935', '#1e88e5', '#43a047', '#e8b730', '#8e24aa'];
      const dragon = (side: 'left' | 'right', d: string) => `<div class="dg" style="${side}:18%;--d:${d}">${col.map((c) => `<b style="background:${c}"></b>`).join('')}</div>`;
      return `<div class="g"><div class="w"><div class="hall"><b class="pl">${esc(a)}</b></div><div class="roof"></div><div class="rg">${seg}</div><i class="tail l"></i><i class="tail r"></i>${dragon('left', '0s')}${dragon('right', '.35s')}<i class="pearl"></i></div>${b ? cap(b, 0.6) : ''}</div>`;
    },
  },
  {
    ...base, id: 'obj-tw-jiaobei', no: 399, zh: '擲筊', en: 'Moon Blocks',
    desc: '兩個筊杯拋起落地＝聖筊／笑筊，二選一（風格化）',
    tags: ['抉擇', '二選一', '台灣'], sample: ['買還是租？', '聖筊：先買'],
    hint: '第 1 行是問題，第 2 行是落地後的結果',
    motion: '上方寫著問題的卡片；兩個紅色月牙形筊杯（風格化色塊、粗黑框）往上拋起翻轉，落地彈兩下停住，一正一反；下方彈出結果卡片。',
    motionEn: 'A question card at top; two red crescent moon blocks (stylized, thick outline) toss up spinning, land with two bounces one face-up one face-down, and a result card pops below.',
    css: `${H}${CAP}
.S .q{position:absolute;left:50%;top:12%;translate:-50% 0;padding:calc(var(--u)*1.6) calc(var(--u)*3.4);background:var(--ac);font-size:calc(var(--u)*4.6);border-radius:calc(var(--u)*1.4);white-space:nowrap}
.S .fl{position:absolute;left:0;right:0;top:66%;border-top:var(--bw) solid var(--fg)}
.S .jb{position:absolute;top:66%;width:calc(var(--u)*16);height:calc(var(--u)*7);margin-top:calc(var(--u)*-7);animation:K_jb 7s cubic-bezier(.3,0,.5,1) infinite both}
.S .jb i{position:absolute;inset:0;background:#d92b2b;border:var(--bw) solid var(--fg);border-radius:100% 100% 0 0/200% 200% 0 0;animation:K_sp 7s cubic-bezier(.3,0,.5,1) infinite both}
.S .jb.dn i{border-radius:0 0 100% 100%/0 0 200% 200%;background:#a51f1f}
@keyframes K_jb{0%,8%{transform:translateY(calc(var(--u)*0))}22%{transform:translateY(calc(var(--u)*-34))}36%{transform:none}40%{transform:translateY(calc(var(--u)*-6))}44%{transform:none}46%{transform:translateY(calc(var(--u)*-2))}48%,100%{transform:none}}
@keyframes K_sp{0%,8%{transform:none}36%,100%{transform:rotate(var(--r))}}`,
    html: (w) => {
      const [a, b] = given(w, ['買還是租？', '聖筊：先買']);
      return `<div class="g"><b class="q bx tt lt">${esc(a)}</b><i class="fl"></i><div class="jb" style="left:calc(50% - var(--u)*20)"><i style="--r:720deg"></i></div><div class="jb dn" style="left:calc(50% + var(--u)*4)"><i style="--r:-540deg;animation-name:K_sp"></i></div>${b ? cap(b, 0.52) : ''}</div>`;
    },
  },
  {
    ...base, id: 'obj-tw-joss', no: 400, zh: '燒金紙', en: 'Burning Joss Paper',
    desc: '金爐冒火，紙錢一疊疊送進去（風格化示意，不寫實）',
    tags: ['中元', '習俗', '台灣'], sample: ['農曆七月', '看屋淡季？'],
    hint: '第 1 行寫在金爐上，第 2 行是底部標語',
    motion: '畫面中央一座簡化金爐（主色圓柱、粗黑框、上方小屋頂），爐口冒出三層色塊火焰上下跳動；一疊疊黃色方紙（只有色塊和一個方框，不畫真實紋樣）從左邊依序飛進爐口消失，最後底部彈出標語。',
    motionEn: 'A simple burner (accent cylinder, thick outline, little roof) with three layered flat flames flickering; stacks of plain yellow squares fly in from the left one by one and vanish into it; a tag pops at the bottom.',
    css: `${H}${CAP}
.S .w{position:relative;width:calc(var(--u)*80);height:calc(var(--u)*44);margin-bottom:calc(var(--u)*10)}
.S .ov{position:absolute;left:50%;bottom:0;width:calc(var(--u)*24);height:calc(var(--u)*24);margin-left:calc(var(--u)*-12);background:var(--ac);border-radius:calc(var(--u)*2) calc(var(--u)*2) calc(var(--u)*1) calc(var(--u)*1);display:grid;place-items:center;text-align:center;font-size:calc(var(--u)*3.6);padding:calc(var(--u)*1)}
.S .mo{position:absolute;left:50%;bottom:calc(var(--u)*18);width:calc(var(--u)*12);height:calc(var(--u)*5);margin-left:calc(var(--u)*-6);background:#1a1a1a;border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*1)}
.S .rf{position:absolute;left:50%;bottom:calc(var(--u)*25.4);width:calc(var(--u)*30);height:calc(var(--u)*5);margin-left:calc(var(--u)*-15);background:#2e7d5b;border:var(--bw) solid var(--fg);clip-path:polygon(0 100%,14% 0,86% 0,100% 100%)}
.S .fi{position:absolute;left:50%;bottom:calc(var(--u)*31);width:calc(var(--u)*var(--s));aspect-ratio:3/4;margin-left:calc(var(--u)*var(--s)*-.5);background:var(--c);border:calc(var(--u)*.5) solid var(--fg);border-radius:50% 50% 50% 50%/70% 70% 30% 30%;transform-origin:50% 100%;animation:K_fi .5s ease-in-out infinite alternate;animation-delay:var(--d)}
.S .pp{position:absolute;left:4%;bottom:calc(var(--u)*30);width:calc(var(--u)*9);height:calc(var(--u)*7);background:#f5c518;border:calc(var(--u)*.5) solid var(--fg);box-shadow:calc(var(--u)*.6) calc(var(--u)*.6) 0 #c99a12,calc(var(--u)*1.2) calc(var(--u)*1.2) 0 var(--fg);opacity:0;animation:K_pp 7s cubic-bezier(.4,0,.6,1) infinite both;animation-delay:calc(.8s + var(--i)*.7s)}
.S .pp::after{content:'';position:absolute;inset:22%;border:calc(var(--u)*.4) solid #c0392b}
@keyframes K_fi{from{transform:scale(1,.88) rotate(-4deg)}to{transform:scale(.94,1.1) rotate(4deg)}}
@keyframes K_pp{0%{opacity:1;transform:none}12%{opacity:1;transform:translate(calc(var(--u)*32),calc(var(--u)*6)) rotate(30deg) scale(.7)}14%,100%{opacity:0;transform:translate(calc(var(--u)*32),calc(var(--u)*10)) scale(.2)}}`,
    html: (w) => {
      const [a, b] = given(w, ['農曆七月', '看屋淡季？']);
      const fl = [[14, '#e53935', '0s'], [10, '#f08a24', '.15s'], [6, '#f5c518', '.3s']].map(([s, c, d]) => `<i class="fi" style="--s:${s};--c:${c};--d:${d}"></i>`).join('');
      const pp = Array.from({ length: 4 }, (_, i) => `<i class="pp" style="--i:${i}"></i>`).join('');
      return `<div class="g"><div class="w">${fl}<div class="rf"></div><div class="ov bx"><b class="tt lt">${esc(a)}</b></div><i class="mo" style="display:none"></i>${pp}</div>${b ? cap(b, 0.55) : ''}</div>`;
    },
  },
  {
    ...base, id: 'obj-tw-fried', no: 401, zh: '鹹酥雞炸鍋', en: 'Fried Chicken Fryer',
    desc: '竹籃下鍋冒泡，撈起撒胡椒粉出字',
    tags: ['宵夜', '輕鬆', '台灣'], sample: ['宵夜聊房市'],
    hint: '一行標題，撒胡椒粉後出現',
    motion: '一口黑色油鍋（粗黑框），金黃色油面不停冒泡；一個竹編炸籃從上方降下浸入油中，泡泡變多，接著籃子撈起抖一抖；上方灑下一陣胡椒粉粒，粉粒落定處浮出標題字卡。',
    motionEn: 'A black fryer with bubbling golden oil; a bamboo basket lowers in, bubbles intensify, then it lifts and shakes; pepper specks rain down and a title card appears where they settle.',
    css: `${H}
.S .w{position:relative;width:calc(var(--u)*70);height:calc(var(--u)*50)}
.S .pot{position:absolute;left:10%;right:10%;bottom:0;height:46%;background:#2a2a2a;border:var(--bw) solid var(--fg);border-radius:0 0 calc(var(--u)*6) calc(var(--u)*6);overflow:hidden}
.S .oil{position:absolute;left:0;right:0;top:12%;bottom:0;background:#e0a526}
.S .bu{position:absolute;top:14%;width:calc(var(--u)*2.4);aspect-ratio:1;border-radius:50%;border:calc(var(--u)*.4) solid #fffaf0;animation:K_bu .7s ease-out infinite;animation-delay:var(--d)}
.S .bk{position:absolute;left:30%;width:40%;top:0;height:calc(var(--u)*14);animation:K_bk 7s cubic-bezier(.5,0,.4,1) infinite both}
.S .bk i{position:absolute;left:0;right:0;bottom:0;height:calc(var(--u)*9);background:repeating-linear-gradient(45deg,#c99a6b 0 calc(var(--u)*1),#8d6238 0 calc(var(--u)*2));border:var(--bw) solid var(--fg);border-radius:0 0 calc(var(--u)*4) calc(var(--u)*4)}
.S .bk b{position:absolute;left:46%;width:8%;top:calc(var(--u)*-18);height:calc(var(--u)*14);background:#8d6238;border:calc(var(--u)*.4) solid var(--fg)}
.S .pe{position:absolute;top:0;width:calc(var(--u)*1);aspect-ratio:1;border-radius:50%;background:var(--fg);opacity:0;animation:K_pe 7s ease-in infinite both;animation-delay:var(--d)}
.S .tl{position:absolute;left:50%;top:calc(var(--u)*-4);translate:-50% 0;padding:calc(var(--u)*1.8) calc(var(--u)*3.6);background:var(--ac2);font-size:calc(var(--u)*5.4);border-radius:calc(var(--u)*1.4);white-space:nowrap;animation:K_tl 7s cubic-bezier(.3,1.7,.5,1) infinite both}
@keyframes K_bu{0%{transform:scale(.3);opacity:1}100%{transform:translateY(calc(var(--u)*-2)) scale(1.3);opacity:0}}
@keyframes K_bk{0%,6%{transform:translateY(calc(var(--u)*-20))}18%,36%{transform:translateY(calc(var(--u)*22))}44%{transform:translateY(calc(var(--u)*6))}46%{transform:translate(calc(var(--u)*-1.5),calc(var(--u)*6))}48%{transform:translate(calc(var(--u)*1.5),calc(var(--u)*6))}50%,100%{transform:translateY(calc(var(--u)*6))}}
@keyframes K_pe{0%,50%{opacity:0;transform:none}52%{opacity:1}64%,100%{opacity:.9;transform:translate(var(--x),calc(var(--u)*var(--y)))}}
@keyframes K_tl{0%,62%{transform:scale(0)}70%,100%{transform:none}}`,
    html: (w) => {
      const [a] = given(w, ['宵夜聊房市']);
      const bu = Array.from({ length: 10 }, (_, i) => `<i class="bu" style="left:${6 + i * 9}%;--d:${(rnd(i) * .7).toFixed(2)}s"></i>`).join('');
      const pe = Array.from({ length: 22 }, (_, i) => `<i class="pe" style="left:${30 + rnd(i + 4) * 40}%;--x:calc(var(--u)*${((rnd(i + 9) - .5) * 8).toFixed(1)});--y:${(4 + rnd(i + 1) * 10).toFixed(1)};--d:${(rnd(i + 2) * .5).toFixed(2)}s"></i>`).join('');
      return `<div class="g"><div class="w"><div class="pot"><i class="oil"></i>${bu}</div><div class="bk"><b></b><i></i></div>${pe}<b class="tl bx tt lt">${esc(a)}</b></div></div>`;
    },
  },
];
