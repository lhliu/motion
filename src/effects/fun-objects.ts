import type { Fx } from '../types';
import { esc } from '../util';

// 2026-10-27 物件擴充批次 O1（376–383）：有趣道具 8 個。純 CSS＋HTML，house style：調色盤變數、粗框、硬陰影
const base = { added: '2026-10-27', tone: 'ink' as const, preferredRatio: '16:9' as const, cat: 'fun' as const };
const given = (w: string[], fb: string[]) => {
  const g = w.map((s) => String(s ?? '').trim()).filter(Boolean);
  return g.length ? g : fb;
};
// 共用：單位、粗框、硬陰影、整段淡入淡出
const H = `.S{--u:calc(min(1cqw,1.7778cqh)*1.1);--bw:calc(var(--u)*.7);--sh:calc(var(--u)*1.2) calc(var(--u)*1.2) 0 var(--fg)}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.55)}}
.S .g{position:absolute;inset:0;display:grid;place-items:center;animation:K_o 7s ease infinite both}
.S .bx{border:var(--bw) solid var(--fg);box-shadow:var(--sh)}
.S .tt{font-weight:900;color:var(--fg)}
.S .tt.lt{color:var(--bg)}
@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}`;

export const funObjects: Fx[] = [
  {
    ...base, id: 'obj-fun-toaster', no: 376, zh: '烤吐司機', en: 'Toaster Pop',
    desc: '壓桿、機身一縮，兩片吐司彈出寫標題',
    tags: ['片頭', '早安', '有趣'], sample: ['早安', '開工'],
    hint: '兩行：左片、右片吐司上的字（各 2–4 字最好）',
    motion: '主色烤吐司機（粗黑框、硬陰影）在畫面中央，側邊壓桿往上彈，機身被壓扁一下，兩片副色吐司從槽裡彈高、微微歪斜後落回半截，吐司上寫標題。',
    motionEn: 'An accent-coloured toaster (thick outline, hard shadow) sits centre; the side lever snaps up, the body squashes, and two accent-2 slices pop high, tilt, then settle half out with the title on them.',
    css: `${H}
.S .t{position:relative;width:calc(var(--u)*44);height:calc(var(--u)*28);margin-top:calc(var(--u)*16);scale:.72}
.S .bd{position:absolute;inset:0;z-index:2;background:var(--ac);border-radius:calc(var(--u)*6) calc(var(--u)*6) calc(var(--u)*2) calc(var(--u)*2);animation:K_sq 7s infinite both}
.S .bd i{position:absolute;top:calc(var(--u)*2.4);width:calc(var(--u)*13);height:calc(var(--u)*2.2);background:var(--fg);border-radius:var(--u)}
.S .lv{position:absolute;right:calc(var(--u)*-4);top:calc(var(--u)*8);width:calc(var(--u)*4);height:calc(var(--u)*9);background:var(--fg);border-radius:var(--u);animation:K_lv 7s infinite both}
.S .ts{position:absolute;top:calc(var(--u)*-2);width:calc(var(--u)*17);height:calc(var(--u)*19);background:var(--ac2);border-radius:calc(var(--u)*5) calc(var(--u)*5) var(--u) var(--u);display:grid;place-items:center;font-size:calc(var(--u)*4.2);animation:K_up 7s infinite both}
@keyframes K_lv{0%,16%{transform:translateY(calc(var(--u)*7))}22%,100%{transform:none}}
@keyframes K_sq{0%,15%,28%,100%{transform:none}19%{transform:scale(1.05,.92)}}
@keyframes K_up{0%,17%{transform:translateY(calc(var(--u)*14))}27%{transform:translateY(calc(var(--u)*-26)) rotate(var(--r))}36%,100%{transform:translateY(calc(var(--u)*-19)) rotate(var(--r))}}`,
    html: (w) => {
      const [a, b] = given(w, ['早安', '開工']);
      return `<div class="g"><div class="t"><div class="ts bx tt lt" style="left:calc(var(--u)*4);--r:-10deg">${esc(a)}</div><div class="ts bx tt lt" style="right:calc(var(--u)*4);--r:9deg;animation-delay:.08s">${esc(b ?? '')}</div><div class="bd bx"><i style="left:calc(var(--u)*5)"></i><i style="right:calc(var(--u)*5)"></i></div><div class="lv"></div></div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-microwave', no: 377, zh: '微波爐倒數', en: 'Microwave Countdown',
    desc: '轉盤轉、數字倒數，叮一聲門彈開露出答案',
    tags: ['揭曉', '倒數', '有趣'], sample: ['答案是', '房價會漲'],
    hint: '第 1 行是倒數時面板上的字，第 2 行是門打開後的答案',
    motion: '主色微波爐（粗黑框）裡轉盤一直轉、內部亮暖光，右側面板數字 3→2→1→0 倒數，歸零時冒出「叮！」，門往左翻開露出寫著答案的副色卡片。',
    motionEn: 'Inside an accent microwave (thick outline) the plate spins under warm light while the side panel counts 3→2→1→0; at zero a “DING!” pops and the door swings open to reveal an accent-2 card with the answer.',
    css: `${H}
.S .m{position:relative;width:calc(var(--u)*62);height:calc(var(--u)*36);background:var(--ac);border-radius:calc(var(--u)*2.4);display:flex;gap:calc(var(--u)*2);padding:calc(var(--u)*3);perspective:calc(var(--u)*150)}
.S .in{position:relative;flex:1;background:color-mix(in srgb,var(--ac2) 55%,var(--bg));border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*1.2);display:grid;place-items:center;overflow:visible}
.S .ans{font-size:calc(var(--u)*5.4);padding:calc(var(--u)*1.6) calc(var(--u)*3);background:var(--bg);border-radius:calc(var(--u)*1.2);animation:K_an 7s infinite both}
.S .pl{position:absolute;bottom:calc(var(--u)*2);width:calc(var(--u)*24);height:calc(var(--u)*3);border-radius:50%;background:var(--bg);border:var(--bw) solid var(--fg);animation:K_pl 1.2s linear infinite}
.S .dr{position:absolute;inset:calc(var(--bw)*-1);background:color-mix(in srgb,var(--fg) 82%,var(--ac));border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*1.2);transform-origin:left;display:grid;place-items:center;color:var(--bg);font-size:calc(var(--u)*4);animation:K_dr 7s infinite both}
.S .pn{width:calc(var(--u)*14);display:flex;flex-direction:column;gap:calc(var(--u)*1.6);align-items:center}
.S .lcd{position:relative;width:100%;height:calc(var(--u)*8);background:var(--fg);border-radius:var(--u);color:var(--ac2);font:normal 900 calc(var(--u)*5.4) var(--mono);overflow:hidden}
.S .lcd span{position:absolute;inset:0;display:grid;place-items:center;opacity:0;animation:K_n 7s infinite both}
.S .pn i{width:calc(var(--u)*5);aspect-ratio:1;border-radius:50%;background:var(--bg);border:var(--bw) solid var(--fg)}
.S .dg{position:absolute;top:calc(var(--u)*-8);right:calc(var(--u)*2);font-size:calc(var(--u)*6);color:var(--fg);rotate:8deg;animation:K_dg 7s cubic-bezier(.3,1.8,.5,1) infinite both}
@keyframes K_pl{0%{transform:scaleX(1)}50%{transform:scaleX(.7)}100%{transform:scaleX(1)}}
@keyframes K_n{0%{opacity:0}1%,13%{opacity:var(--on)}14%,100%{opacity:0}}
@keyframes K_z{0%,44%{opacity:0}45%,100%{opacity:1}}
.S .lcd span.z{animation-name:K_z}
@keyframes K_dr{0%,56%{transform:none}66%,100%{transform:rotateY(-105deg)}}
@keyframes K_an{0%,60%{transform:scale(.6);opacity:0}68%,100%{transform:none;opacity:1}}
@keyframes K_dg{0%,52%{opacity:0;transform:scale(.3)}56%,100%{opacity:1;transform:none}}`,
    html: (w) => {
      const [a, b] = given(w, ['答案是', '房價會漲']);
      // 3、2、1 各顯示約 0.9 秒（用 delay 錯開），0 一直留到門打開
      const nums = ['3', '2', '1'].map((n, i) => `<span style="--on:1;animation-delay:${(0.4 + i * 0.9).toFixed(1)}s">${n}</span>`).join('') + '<span class="z">0</span>';
      return `<div class="g"><div class="m bx"><div class="in"><div class="ans bx tt">${esc(b ?? a)}</div><i class="pl"></i><div class="dr tt">${esc(a)}</div></div><div class="pn"><div class="lcd">${nums}</div><i></i><i></i></div><b class="dg tt">叮！</b></div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-claw', no: 378, zh: '抓娃娃機', en: 'Claw Machine',
    desc: '爪子下降夾起關鍵字膠囊，晃一下差點掉，最後送進出口',
    tags: ['挑選', '運氣', '有趣'], sample: ['精選物件', '低總價', '近捷運', '有車位'],
    hint: '第 1 行是機台招牌；之後 2–4 行是膠囊（第 1 顆會被夾起）',
    motion: '主色娃娃機（粗黑框、透明玻璃）上方掛招牌，爪子沿軌道移到第一顆膠囊上方、下降、合爪夾起，往上時晃一下差點掉，再移到左邊出口放下；膠囊上的字放大。',
    motionEn: 'An accent claw machine (thick outline, glass front) with a top sign; the claw slides over the first capsule, drops, grabs it, wobbles on the way up as if slipping, then carries it to the chute on the left; the capsule label enlarges.',
    css: `${H}
.S .m{position:relative;width:calc(var(--u)*60);height:calc(var(--u)*44);background:var(--ac);border-radius:calc(var(--u)*2);padding:calc(var(--u)*7) calc(var(--u)*2.4) calc(var(--u)*2.4)}
.S .sg{position:absolute;top:calc(var(--u)*1.2);left:0;right:0;text-align:center;font-size:calc(var(--u)*3.6);color:var(--bg)}
.S .gl{position:relative;height:100%;background:color-mix(in srgb,var(--bg) 82%,transparent);border:var(--bw) solid var(--fg);border-radius:var(--u);overflow:hidden}
.S .ch{position:absolute;left:0;bottom:0;width:calc(var(--u)*14);height:calc(var(--u)*12);background:var(--fg)}
.S .cp{position:absolute;bottom:calc(var(--u)*1.4);width:calc(var(--u)*12);height:calc(var(--u)*9);border-radius:calc(var(--u)*4.5);display:grid;place-items:center;font-size:calc(var(--u)*2.2);background:var(--c);white-space:nowrap}
.S .ar{position:absolute;top:0;left:0;width:calc(var(--u)*8);height:100%;animation:K_x 7s cubic-bezier(.5,0,.3,1) infinite both}
.S .rp{position:absolute;left:50%;top:0;width:calc(var(--u)*.6);margin-left:calc(var(--u)*-.3);background:var(--fg);animation:K_y 7s cubic-bezier(.5,0,.3,1) infinite both}
.S .cl{position:absolute;left:50%;bottom:calc(var(--u)*-3.4);width:calc(var(--u)*8);height:calc(var(--u)*4);margin-left:calc(var(--u)*-4)}
.S .gl .cp.lt:not(.pk){color:var(--bg)}
.S .cl::before,.S .cl::after{content:'';position:absolute;top:0;width:calc(var(--u)*1);height:calc(var(--u)*5);background:var(--fg);border-radius:var(--u);animation:K_g 7s infinite both}
.S .cl::before{left:0;transform-origin:top right;--a:28deg}.S .cl::after{right:0;transform-origin:top left;--a:-28deg}
.S .hd{position:absolute;left:50%;bottom:calc(var(--u)*-11);margin-left:calc(var(--u)*-6);opacity:0;animation:K_h 7s infinite both}
.S .hd .cp{position:static;animation:K_w 7s infinite both}
@keyframes K_x{0%,8%{transform:translateX(calc(var(--u)*30))}20%,56%{transform:translateX(calc(var(--u)*var(--tx)))}72%,100%{transform:translateX(calc(var(--u)*3))}}
@keyframes K_y{0%,20%{height:calc(var(--u)*4)}30%,34%{height:calc(var(--u)*17)}48%,72%{height:calc(var(--u)*4)}80%,100%{height:calc(var(--u)*12)}}
@keyframes K_g{0%,30%{transform:rotate(var(--a))}34%,78%{transform:none}82%,100%{transform:rotate(var(--a))}}
@keyframes K_h{0%,33%{opacity:0}34%,80%{opacity:1}81%,100%{opacity:0}}
@keyframes K_w{0%,46%{transform:none}50%{transform:rotate(14deg) translateY(calc(var(--u)*1))}54%{transform:rotate(-8deg)}58%,100%{transform:none}}
.S .won{position:absolute;bottom:calc(var(--u)*-8);left:calc(var(--u)*1);font-size:calc(var(--u)*5);padding:calc(var(--u)*1) calc(var(--u)*2.4);background:var(--ac2);border-radius:var(--u);animation:K_wn 7s cubic-bezier(.3,1.6,.5,1) infinite both}
@keyframes K_wn{0%,80%{opacity:0;transform:scale(.4)}86%,100%{opacity:1;transform:none}}
.S .pk{animation:K_pk 7s infinite both}
@keyframes K_pk{0%,33%{opacity:1}34%,100%{opacity:0}}`,
    html: (w) => {
      const all = given(w, ['精選物件', '低總價', '近捷運', '有車位']);
      const sign = all.length > 1 ? all[0] : '夾夾看';
      const caps = (all.length > 1 ? all.slice(1) : all).slice(0, 4);
      const col = ['var(--ac2)', 'var(--ac)', 'var(--fg)', 'color-mix(in srgb,var(--ac2) 55%,var(--fg))'];
      // 膠囊從 x=17u 起每 10u 一顆；第 1 顆被夾
      const xs = caps.map((_, i) => 17 + i * 10);
      const tx = xs[0] + 6 - 4;
      return `<div class="g"><div class="m bx"><b class="sg tt">${esc(sign)}</b><div class="gl"><i class="ch"></i>${caps.map((c, i) => `<b class="cp bx tt lt${i === 0 ? ' pk' : ''}" style="left:calc(var(--u)*${xs[i]});--c:${col[i]};box-shadow:none">${esc(c)}</b>`).join('')}<div class="ar" style="--tx:${tx}"><div class="rp"><div class="cl"></div><div class="hd"><b class="cp bx tt lt" style="--c:${col[0]};box-shadow:none">${esc(caps[0])}</b></div></div></div></div><b class="won bx tt lt">${esc(caps[0])}！</b></div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-punch', no: 379, zh: '彈簧拳擊手套', en: 'Spring Punch',
    desc: '驚喜盒打開，拳擊手套彈出把舊觀念揍飛，換上新說法',
    tags: ['破解迷思', '反轉', '有趣'], sample: ['買房一定要等', '先看自己的需求'],
    hint: '第 1 行是被揍飛的舊觀念，第 2 行是新說法',
    motion: '左邊副色驚喜盒（粗黑框、硬陰影），右邊一張寫舊觀念的卡片；盒蓋彈開，主色拳擊手套掛在彈簧上猛力打出，卡片轉著飛出畫面，原位彈入寫新說法的卡片，手套收回微微晃。',
    motionEn: 'A jack-in-the-box (accent-2, thick outline) on the left and a card with the old belief on the right; the lid flips, an accent boxing glove on a zigzag spring punches out, the card spins off-screen, a new card pops in with the new take, and the glove retracts with a wobble.',
    css: `${H}
.S .w{position:relative;width:calc(var(--u)*76);height:calc(var(--u)*30)}
.S .box{position:absolute;left:0;bottom:0;width:calc(var(--u)*18);height:calc(var(--u)*18);background:var(--ac2);z-index:3}
.S .lid{position:absolute;left:calc(var(--bw)*-1);right:calc(var(--bw)*-1);top:calc(var(--u)*-3.4);height:calc(var(--u)*3);background:var(--ac2);border:var(--bw) solid var(--fg);transform-origin:left bottom;animation:K_lid 7s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .arm{position:absolute;left:calc(var(--u)*9);bottom:calc(var(--u)*9);height:calc(var(--u)*6);width:calc(var(--u)*40);transform-origin:left center;animation:K_arm 7s cubic-bezier(.2,1.4,.4,1) infinite both;z-index:2}
.S .arm svg{position:absolute;left:0;top:0;width:calc(100% - var(--u)*9);height:100%;overflow:visible}
.S .arm path{fill:none;stroke:var(--fg);stroke-width:calc(var(--u)*.7);stroke-linejoin:round}
.S .gv{position:absolute;right:calc(var(--u)*-4);top:50%;width:calc(var(--u)*14);height:calc(var(--u)*12);margin-top:calc(var(--u)*-6);background:var(--ac);border-radius:calc(var(--u)*6) calc(var(--u)*4) calc(var(--u)*4) calc(var(--u)*6)}
.S .cd{position:absolute;right:0;top:50%;translate:0 -50%;padding:calc(var(--u)*2.4) calc(var(--u)*3);background:var(--bg);font-size:calc(var(--u)*4);white-space:nowrap;border-radius:calc(var(--u)*1.2)}
.S .old{animation:K_old 7s cubic-bezier(.4,0,.6,1) infinite both}
.S .nw{background:var(--ac2);animation:K_nw 7s cubic-bezier(.3,1.6,.5,1) infinite both}
@container (aspect-ratio < 1){.S .w{width:calc(var(--u)*58);height:calc(var(--u)*60)}.S .cd{top:15%;font-size:calc(var(--u)*3.4)}.S .arm{bottom:calc(var(--u)*12);rotate:-38deg;width:calc(var(--u)*44)}}
@keyframes K_lid{0%,18%{transform:none}24%,100%{transform:rotate(-120deg)}}
@keyframes K_arm{0%,20%{transform:scaleX(.05)}30%,40%{transform:none}52%,100%{transform:scaleX(.55)}}
@keyframes K_old{0%,28%{transform:none;opacity:1}40%{transform:translate(80cqw,-40cqh) rotate(200deg);opacity:1}41%,100%{opacity:0}}
@keyframes K_nw{0%,46%{transform:scale(0)}56%,100%{transform:none}}`,
    html: (w) => {
      const [a, b] = given(w, ['買房一定要等', '先看自己的需求']);
      let z = 'M0 30';
      for (let i = 1; i <= 8; i++) z += ` L${i * 12.5 - 6.25} ${i % 2 ? 0 : 60} L${i * 12.5} 30`;
      return `<div class="g"><div class="w"><div class="cd bx tt old">${esc(a)}</div><div class="cd bx tt lt nw">${esc(b ?? a)}</div><div class="arm"><svg viewBox="0 0 100 60" preserveAspectRatio="none"><path d="${z}" vector-effect="non-scaling-stroke"/></svg><i class="gv bx"></i></div><div class="box bx"><i class="lid"></i></div></div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-plane', no: 380, zh: '紙飛機', en: 'Paper Plane',
    desc: '紙飛機繞一圈拉出虛線航跡，最後展開成字卡',
    tags: ['轉場', '寄送', '有趣'], sample: ['寄給未來的自己', '~ 存第一桶金'],
    hint: '第 1 行是展開後的字卡標題；「~」開頭是小字',
    motion: '副色紙飛機（粗黑框）從左下飛入，往右上爬升再迴轉繞回中央，後面的虛線航跡跟著畫出；到中央時「啪」地展開成一張有摺痕的副色字卡，卡上寫標題與小字。',
    motionEn: 'An accent-2 paper plane (thick outline) flies in from the bottom left, climbs to the top right and loops back to the centre while a dashed trail draws behind it, then snaps open into a creased accent-2 card with the title and a small line.',
    css: `${H}
.S .sv{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.S .tr{fill:none;stroke:var(--fg);stroke-width:3;stroke-dasharray:.012 .018;stroke-linecap:round;opacity:.45}
.S .tw{fill:none;stroke:var(--bg);stroke-width:14;stroke-dasharray:1 1;stroke-dashoffset:0;animation:K_tr 7s linear infinite both}
.S .pp{position:absolute;left:0;top:0;width:0;height:0;animation:K_fly 7s linear infinite both}
.S .pp svg{position:absolute;width:calc(var(--u)*14);height:calc(var(--u)*8.4);left:calc(var(--u)*-7);top:calc(var(--u)*-4.2);overflow:visible;animation:K_rot 7s linear infinite both}
.S .pp path{fill:var(--ac2);stroke:var(--fg);stroke-width:3.5;stroke-linejoin:round}
.S .cd{position:relative;padding:calc(var(--u)*3) calc(var(--u)*5);background:var(--ac2);text-align:center;border-radius:calc(var(--u)*.6);background-image:linear-gradient(115deg,transparent 49.6%,color-mix(in srgb,var(--fg) 25%,transparent) 50%,transparent 50.4%),linear-gradient(65deg,transparent 49.6%,color-mix(in srgb,var(--fg) 25%,transparent) 50%,transparent 50.4%);animation:K_cd 7s cubic-bezier(.3,1.5,.5,1) infinite both}
.S .cd b{display:block;font-size:calc(var(--u)*5.2)}
.S .cd small{display:block;margin-top:calc(var(--u)*1);font-size:calc(var(--u)*2.6);opacity:.75}
@keyframes K_fly{0%{transform:translate(4cqw,94cqh)}12%{transform:translate(40cqw,60cqh)}24%{transform:translate(78cqw,18cqh)}32%{transform:translate(64cqw,8cqh)}40%{transform:translate(40cqw,28cqh)}48%,100%{transform:translate(50cqw,50cqh)}}
@keyframes K_rot{0%,12%{rotate:-40deg;opacity:1}24%{rotate:-50deg}32%{rotate:-170deg}40%{rotate:140deg}47%{rotate:60deg;opacity:1;scale:1}50%,100%{rotate:60deg;opacity:0;scale:.3}}
@keyframes K_tr{0%{stroke-dashoffset:0}48%,100%{stroke-dashoffset:-1}}
@keyframes K_cd{0%,48%{transform:scale(.15) rotate(-30deg);opacity:0}58%,100%{transform:none;opacity:1}}`,
    html: (w) => {
      const all = given(w, ['寄給未來的自己', '~ 存第一桶金']);
      const t = all.find((s) => !s.startsWith('~')) ?? '';
      const sm = (all.find((s) => s.startsWith('~')) ?? '').replace(/^~\s*/, '');
      // 航跡座標 0–1000（拉伸到整個畫面），跟飛機的關鍵影格同一組點
      const d = 'M40 940 L400 600 L780 180 L640 80 L400 280 L500 500';
      return `<div class="g"><svg class="sv" viewBox="0 0 1000 1000" preserveAspectRatio="none"><path class="tr" d="${d}" pathLength="1" vector-effect="non-scaling-stroke"/><path class="tw" d="${d}" pathLength="1" vector-effect="non-scaling-stroke"/></svg><div class="pp"><svg viewBox="-50 -30 100 60"><path d="M48 0 L-48 -26 L14 4 Z"/><path d="M14 4 L-48 -26 L6 26 Z"/></svg></div><div class="cd bx tt lt"><b>${esc(t)}</b>${sm ? `<small>${esc(sm)}</small>` : ''}</div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-boomerang', no: 381, zh: '迴力鏢', en: 'Boomerang',
    desc: '迴力鏢丟出去繞一大圈，回來剛好砸在重點上',
    tags: ['回到重點', '強調', '有趣'], sample: ['回到重點', '總價'],
    hint: '第 1 行是上方的引言，第 2 行是被砸中的重點字',
    motion: '畫面上方是引言，正中央是一個大字重點；主色迴力鏢（粗黑框）從右側旋轉飛出、往左上繞一大圈消失再從左邊轉回來，「砰」地砸在重點字上，字被壓扁再彈回，四周噴出短線。',
    motionEn: 'A lead line at the top and a big key word in the centre; an accent boomerang (thick outline) spins out from the right, loops wide to the top left and back, then smacks the key word, which squashes and springs back with burst lines.',
    css: `${H}
.S .q{position:absolute;top:24%;left:0;right:0;text-align:center;font-size:calc(var(--u)*3.6);opacity:.75}
.S .k{position:relative;padding:calc(var(--u)*1.6) calc(var(--u)*4);background:var(--ac2);font-size:calc(var(--u)*10);line-height:1;border-radius:calc(var(--u)*1.4);animation:K_hit 7s infinite both}
.S .br{position:absolute;left:0;top:0;width:0;height:0;animation:K_fly 7s cubic-bezier(.4,0,.6,1) infinite both}
.S .br svg{position:absolute;width:calc(var(--u)*14);height:calc(var(--u)*14);left:calc(var(--u)*-7);top:calc(var(--u)*-7);overflow:visible;animation:K_sp .5s linear infinite}
.S .br path{fill:var(--ac);stroke:var(--fg);stroke-width:5;stroke-linejoin:round}
.S .bs{position:absolute;inset:calc(var(--u)*-6);pointer-events:none;animation:K_bs 7s infinite both}
.S .bs i{position:absolute;left:50%;top:50%;width:calc(var(--u)*5);height:calc(var(--u)*.8);background:var(--fg);border-radius:var(--u);transform:rotate(var(--a)) translateX(calc(var(--u)*18))}
@keyframes K_fly{0%,6%{transform:translate(110cqw,60cqh);opacity:1}22%{transform:translate(55cqw,12cqh)}36%{transform:translate(-10cqw,30cqh)}48%{transform:translate(20cqw,70cqh)}58%{transform:translate(50cqw,52cqh);opacity:1}60%,100%{transform:translate(50cqw,52cqh);opacity:0}}
@keyframes K_sp{to{rotate:-360deg}}
@keyframes K_hit{0%,57%{transform:none}60%{transform:scale(1.18,.72)}66%{transform:scale(.94,1.08)}72%,100%{transform:none}}
@keyframes K_bs{0%,58%{opacity:0;scale:.7}62%{opacity:1;scale:1}76%,100%{opacity:0;scale:1.25}}`,
    html: (w) => {
      const [a, b] = given(w, ['回到重點', '總價']);
      const rays = Array.from({ length: 8 }, (_, i) => `<i style="--a:${i * 45}deg"></i>`).join('');
      return `<div class="g"><div class="q tt">${esc(b ? a : '')}</div><div class="k bx tt lt">${esc(b ?? a)}<div class="bs">${rays}</div></div><div class="br"><svg viewBox="-50 -50 100 100"><path d="M-44 34 L0 -40 L44 34 L28 40 L0 -6 L-28 40 Z"/></svg></div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-slinky', no: 382, zh: '彈簧下樓梯', en: 'Slinky Stairs',
    desc: '彩虹彈簧一階一階翻下樓梯，每階寫一個步驟',
    tags: ['步驟', '流程', '有趣'], sample: ['看屋', '議價', '簽約', '交屋'],
    hint: '每行一階（3–5 階），彈簧從第一階翻到最後一階',
    motion: '畫面由左上到右下是一排副色階梯（粗黑框、硬陰影），每階側面寫一個步驟；主色＋副色相間的彈簧在第一階上，前端拱起翻到下一階、尾端跟著落下，一階一階往下，經過的步驟亮起。',
    motionEn: 'Accent-2 stairs (thick outline, hard shadow) step down from top left to bottom right with a step label on each riser; an accent/accent-2 striped slinky arcs from step to step, its tail following, lighting up each step it passes.',
    css: `${H}
.S .st{position:relative;width:calc(var(--u)*var(--W));height:calc(var(--u)*var(--Hh))}
.S .sp{position:absolute;left:calc(var(--u)*var(--x));top:calc(var(--u)*var(--y));width:calc(var(--u)*14);height:calc(var(--u)*var(--h));background:var(--bg);display:flex;align-items:flex-start;justify-content:center;padding-top:calc(var(--u)*2.2);font-size:calc(var(--u)*3.4);animation:K_lt 7s infinite both;animation-delay:calc(var(--i)*1.1s - .2s)}
.S .sl{position:absolute;left:0;top:0;width:0;height:0;animation:K_mv 7s infinite both}
.S .sl b{position:absolute;left:calc(var(--u)*-5);bottom:0;width:calc(var(--u)*10);height:calc(var(--u)*6);border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*6) calc(var(--u)*6) 0 0;background:repeating-linear-gradient(90deg,var(--ac) 0 calc(var(--u)*1.2),var(--ac2) 0 calc(var(--u)*2.4));transform-origin:50% 100%;animation:K_ar 1.1s cubic-bezier(.4,0,.6,1) infinite both}
@keyframes K_ar{0%{transform:scaleY(.5) scaleX(1)}50%{transform:scaleY(1.6) scaleX(1.4)}100%{transform:scaleY(.5) scaleX(1)}}
@keyframes K_lt{0%{background:var(--bg);color:var(--fg)}6%,100%{background:var(--ac2);color:var(--bg)}}`,
    html: (w) => {
      const st = given(w, ['看屋', '議價', '簽約', '交屋']).slice(0, 5);
      const n = st.length, dx = 14, dy = 8;
      const W = n * dx, Hh = n * dy + 10;
      // 彈簧每 1.1 秒往下一階；最後一階之後停住
      const tot = 7, seg = 1.1;
      const kf = st.map((_, i) => `${((i * seg) / tot * 100).toFixed(1)}%{transform:translate(calc(var(--u)*${i * dx + 7}),calc(var(--u)*${i * dy}))}`).join('') + `100%{transform:translate(calc(var(--u)*${(n - 1) * dx + 7}),calc(var(--u)*${(n - 1) * dy}))}`;
      return `<style>@keyframes ma-slinky-mv{${kf}}.fx-obj-fun-slinky .sl{animation-name:ma-slinky-mv}.fx-obj-fun-slinky .sl b{animation-iteration-count:${n - 1};animation-delay:0s}</style><div class="g"><div class="st" style="--W:${W};--Hh:${Hh}">${st.map((s, i) => `<div class="sp bx tt" style="--i:${i};--x:${i * dx};--y:${i * dy};--h:${(n - i) * dy + 10}">${esc(s)}</div>`).join('')}<div class="sl" style="top:calc(var(--u)*0)"><b></b></div></div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-bento', no: 383, zh: '便當盒開蓋', en: 'Bento Reveal',
    desc: '便當蓋掀開，格子裡一格一格亮出菜色＝重點清單',
    tags: ['懶人包', '清單', '有趣'], sample: ['今日便當', '主菜：房價', '配菜：利率', '配菜：政策', '白飯：自備款'],
    hint: '第 1 行是便當名；之後 3–4 行是格子（「主菜：房價」會拆成小字與大字）',
    motion: '主色便當盒（粗黑框、硬陰影）蓋著蓋子、綁一條副色橡皮筋；橡皮筋彈開、蓋子往上掀起飛走，盒內大格＋小格依序彈出菜色卡，每格上面小字是類別、大字是內容。',
    motionEn: 'An accent bento box (thick outline, hard shadow) with an accent-2 rubber band; the band snaps off, the lid lifts and flies away, and the big and small compartments pop their cards one by one, small label on top, big text below.',
    css: `${H}
.S .bo{position:relative;width:calc(var(--u)*64);height:calc(var(--u)*38);background:var(--ac);border-radius:calc(var(--u)*2.4);padding:calc(var(--u)*2);display:grid;grid-template-columns:1.4fr 1fr;grid-template-rows:1fr 1fr;gap:calc(var(--u)*1.6)}
.S .bo.n4{grid-template-rows:1fr 1fr 1fr}
.S .c{background:var(--bg);border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*1.2);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:var(--u);animation:K_c 7s cubic-bezier(.3,1.6,.5,1) infinite both;animation-delay:calc(1.6s + var(--i)*.35s)}
.S .c:first-child{grid-row:1/-1;background:var(--ac2);color:var(--bg)}
.S .c small{font-size:calc(var(--u)*2.2);opacity:.7}
.S .c b{font-size:calc(var(--u)*4.4)}
.S .c:first-child b{font-size:calc(var(--u)*6.4)}
.S .lid{position:absolute;inset:calc(var(--bw)*-1);z-index:3;background:color-mix(in srgb,var(--ac) 80%,var(--fg));border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*2.4);display:grid;place-items:center;color:var(--bg);font-size:calc(var(--u)*5.4);animation:K_lid 7s cubic-bezier(.5,0,.3,1) infinite both}
.S .rb{position:absolute;top:0;bottom:0;left:58%;width:calc(var(--u)*2);background:var(--ac2);border-left:var(--bw) solid var(--fg);border-right:var(--bw) solid var(--fg);animation:K_rb 7s ease infinite both}
@container (aspect-ratio < 1){.S .bo{width:calc(var(--u)*56);height:calc(var(--u)*60);grid-template-columns:1fr 1fr;grid-template-rows:1.3fr 1fr 1fr}.S .bo.n4{grid-template-columns:1fr 1fr 1fr;grid-template-rows:1.3fr 1fr}.S .c:first-child{grid-row:auto;grid-column:1/-1}}
@keyframes K_rb{0%,12%{transform:none;opacity:1}18%{transform:translateY(-60cqh) rotate(20deg);opacity:1}19%,100%{opacity:0}}
@keyframes K_lid{0%,16%{transform:none}22%{transform:translateY(calc(var(--u)*-6)) rotate(-4deg)}32%,100%{transform:translate(30cqw,-90cqh) rotate(-25deg)}}
@keyframes K_c{0%{transform:scale(0)}10%,100%{transform:none}}`,
    html: (w) => {
      const all = given(w, ['今日便當', '主菜：房價', '配菜：利率', '配菜：政策', '白飯：自備款']);
      const name = all.length > 3 ? all[0] : '今日便當';
      const items = (all.length > 3 ? all.slice(1) : all).slice(0, 4);
      const cells = items.map((s, i) => {
        const m = s.split(/[：:]/);
        const k = m.length > 1 ? m[0] : '', v = m.length > 1 ? m.slice(1).join('：') : s;
        return `<div class="c tt" style="--i:${i}">${k ? `<small>${esc(k)}</small>` : ''}<b>${esc(v)}</b></div>`;
      }).join('');
      return `<div class="g"><div class="bo bx${items.length > 3 ? ' n4' : ''}">${cells}<div class="lid tt">${esc(name)}<i class="rb"></i></div></div></div>`;
    },
  },
];
