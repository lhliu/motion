import type { Fx } from '../types';
import { esc } from '../util';

// 2026-10-27 物件擴充批次 O2（384–391）：有趣道具 7 個＋房屋看屋 1 個（售屋吊牌）。純 CSS，house style
const base = { added: '2026-10-27', tone: 'ink' as const, preferredRatio: '16:9' as const, cat: 'fun' as const };
const given = (w: string[], fb: string[]) => {
  const g = w.map((s) => String(s ?? '').trim()).filter(Boolean);
  return g.length ? g : fb;
};
const H = `.S{--u:calc(min(1cqw,1.7778cqh)*1.1);--bw:calc(var(--u)*.7);--sh:calc(var(--u)*1.2) calc(var(--u)*1.2) 0 var(--fg)}
@container (aspect-ratio < 1){.S{--u:calc(min(1cqw,1.7778cqh)*1.55)}}
.S .g{position:absolute;inset:0;display:grid;place-items:center;animation:K_o 7s ease infinite both}
.S .bx{border:var(--bw) solid var(--fg);box-shadow:var(--sh)}
.S .tt{font-weight:900;color:var(--fg)}
.S .tt.lt{color:var(--bg)}
@keyframes K_o{0%{opacity:0}4%,92%{opacity:1}100%{opacity:0}}`;
const rnd = (i: number) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;

export const funObjects2: Fx[] = [
  {
    ...base, id: 'obj-fun-gum', no: 384, zh: '泡泡糖吹破', en: 'Bubble Gum Pop',
    desc: '泡泡糖越吹越大，啪一聲破掉黏出新字',
    tags: ['泡沫', '炒作', '有趣'], sample: ['房市泡沫？', '其實是剛需'],
    hint: '第 1 行寫在泡泡上，第 2 行是破掉後黏出來的字',
    motion: '畫面中央一顆主色泡泡糖（粗框、左上一道高光）從小慢慢吹大，表面寫第一行字並跟著撐大，膨脹到極限抖兩下「啪」地破掉，碎片往四周噴開，原位黏出寫第二行字的副色卡片。',
    motionEn: 'An accent bubble-gum bubble (thick outline, top-left highlight) slowly inflates with the first line stretched on it, trembles at full size, then pops; shreds fly out and an accent-2 card with the second line sticks in its place.',
    css: `${H}
.S .bb{position:absolute;width:calc(var(--u)*44);aspect-ratio:1;border-radius:50%;background:var(--ac);border:var(--bw) solid var(--fg);display:grid;place-items:center;font-size:calc(var(--u)*6);animation:K_bb 7s cubic-bezier(.4,0,.6,1) infinite both}
.S .bb::before{content:'';position:absolute;left:18%;top:16%;width:22%;height:12%;border-radius:50%;background:var(--bg);opacity:.5;rotate:-30deg}
.S .sh{position:absolute;width:calc(var(--u)*6);height:calc(var(--u)*3);background:var(--ac);border:var(--bw) solid var(--fg);border-radius:var(--u);opacity:0;animation:K_sh 7s cubic-bezier(.2,.8,.4,1) infinite both}
.S .nw{position:relative;padding:calc(var(--u)*2.4) calc(var(--u)*4);background:var(--ac2);font-size:calc(var(--u)*6);border-radius:calc(var(--u)*2);animation:K_nw 7s cubic-bezier(.3,1.7,.5,1) infinite both}
@keyframes K_bb{0%{transform:scale(.12)}40%{transform:scale(1)}42%{transform:scale(1.04,.97)}44%{transform:scale(.98,1.03)}46%{transform:scale(1.05);opacity:1}47%,100%{transform:scale(1.25);opacity:0}}
@keyframes K_sh{0%,46%{opacity:0;transform:none}47%{opacity:1;transform:none}62%{opacity:1;transform:translate(var(--dx),var(--dy)) rotate(var(--r))}70%,100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--r))}}
@keyframes K_nw{0%,47%{transform:scale(0)}56%,100%{transform:none}}`,
    html: (w) => {
      const [a, b] = given(w, ['房市泡沫？', '其實是剛需']);
      const sh = Array.from({ length: 10 }, (_, i) => { const t = (i / 10) * Math.PI * 2; return `<i class="sh" style="--dx:calc(var(--u)*${(Math.cos(t) * 34).toFixed(1)});--dy:calc(var(--u)*${(Math.sin(t) * 26).toFixed(1)});--r:${Math.round(rnd(i) * 360)}deg"></i>`; }).join('');
      return `<div class="g"><div class="nw bx tt lt">${esc(b ?? a)}</div>${sh}<div class="bb tt lt">${esc(a)}</div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-popcorn', no: 385, zh: '爆米花機', en: 'Popcorn Machine',
    desc: '爆米花機一顆顆爆出，帶出熱門關鍵字',
    tags: ['熱門', '話題', '有趣'], sample: ['本週熱搜', '升息', '新青安', '房地合一', '囤房稅'],
    hint: '第 1 行是機台招牌；之後 2–5 行是爆出來的關鍵字',
    motion: '主色爆米花機（粗黑框、玻璃窗、頂上招牌）裡的鍋子一直搖，白色爆米花不停跳起；接著寫著關鍵字的爆米花膠囊一顆一顆從頂端爆出，畫弧線落在機台兩側排好。',
    motionEn: 'An accent popcorn machine (thick outline, glass window, top sign) shakes its kettle as white kernels hop; then popcorn tags with keywords burst out of the top one by one, arcing down to line up on both sides.',
    css: `${H}
.S .w{position:relative;width:calc(var(--u)*90);height:calc(var(--u)*46)}
.S .m{position:absolute;left:50%;bottom:0;width:calc(var(--u)*30);height:calc(var(--u)*40);margin-left:calc(var(--u)*-15);background:var(--ac);border-radius:calc(var(--u)*1.6);padding:calc(var(--u)*6) calc(var(--u)*2) calc(var(--u)*6)}
.S .sg{position:absolute;top:calc(var(--u)*1);left:0;right:0;text-align:center;font-size:calc(var(--u)*3)}
.S .gl{position:relative;height:100%;background:color-mix(in srgb,var(--ac2) 30%,var(--bg));border:var(--bw) solid var(--fg);border-radius:var(--u);overflow:hidden}
.S .gl i{position:absolute;bottom:calc(var(--u)*1);width:calc(var(--u)*2.6);aspect-ratio:1;border-radius:45%;background:#fffaf0;border:calc(var(--u)*.35) solid var(--fg);animation:K_hop .6s ease-out infinite;animation-delay:var(--d)}
.S .kt{position:absolute;top:calc(var(--u)*4);left:50%;width:calc(var(--u)*10);height:calc(var(--u)*5);margin-left:calc(var(--u)*-5);background:var(--fg);border-radius:0 0 calc(var(--u)*3) calc(var(--u)*3);animation:K_kt .3s ease-in-out infinite alternate}
@container (aspect-ratio < 1){.S{--k:.5}}
.S .pc{position:absolute;left:50%;top:calc(var(--u)*8);padding:calc(var(--u)*1) calc(var(--u)*2);background:#fffaf0;color:#1a1a1a;border-radius:calc(var(--u)*3);font-size:calc(var(--u)*3);white-space:nowrap;translate:-50% 0;animation:K_pc 7s cubic-bezier(.3,.6,.4,1) infinite both;animation-delay:calc(var(--i)*.55s)}
@container (aspect-ratio < 1){.S .w{width:calc(var(--u)*60);height:calc(var(--u)*80)}}
@keyframes K_hop{0%,100%{transform:none}50%{transform:translateY(calc(var(--u)*-8))}}
@keyframes K_kt{from{rotate:-6deg}to{rotate:6deg}}
@keyframes K_pc{0%,10%{transform:translate(0,calc(var(--u)*10)) scale(.2);opacity:0}12%{opacity:1}22%{transform:translate(calc(var(--tx)*var(--k,1)*.6),calc(var(--u)*-6)) scale(1.1)}32%,100%{transform:translate(calc(var(--tx)*var(--k,1)),var(--ty)) scale(1);opacity:1}}`,
    html: (w) => {
      const all = given(w, ['本週熱搜', '升息', '新青安', '房地合一', '囤房稅']);
      const sign = all.length > 1 ? all[0] : 'POPCORN';
      const ks = (all.length > 1 ? all.slice(1) : all).slice(0, 5);
      const kern = Array.from({ length: 8 }, (_, i) => `<i style="left:${8 + i * 11}%;--d:${(rnd(i + 3) * 0.6).toFixed(2)}s"></i>`).join('');
      // 左右交錯落點：左 -30u、右 +30u，往下排
      const pcs = ks.map((k, i) => { const side = i % 2 ? 1 : -1, row = Math.floor(i / 2); return `<b class="pc bx tt" style="--i:${i};--tx:calc(var(--u)*${side * 30});--ty:calc(var(--u)*${10 + row * 10})">${esc(k)}</b>`; }).join('');
      return `<div class="g"><div class="w"><div class="m bx"><b class="sg tt lt">${esc(sign)}</b><div class="gl">${kern}<i class="kt" style="animation:none"></i></div></div>${pcs}</div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-magnet', no: 386, zh: '磁鐵吸字', en: 'Magnet Pull',
    desc: 'U 型磁鐵把散落的字一個個吸過來，排成一句話',
    tags: ['吸睛', '標題', '有趣'], sample: ['這區為什麼搶手'],
    hint: '一行標題（最多 12 字），字會散開再被吸成一句',
    motion: '一句標題的字先散落在畫面各處、各自歪斜；左側一個主色 U 型磁鐵（兩端銀色、粗黑框）滑入並抖動，磁力線閃一下，所有字依序被吸往中央排成一整句，最後磁鐵往後一彈。',
    motionEn: 'The letters of a headline lie scattered and tilted around the frame; an accent U-magnet (silver tips, thick outline) slides in from the left and buzzes, magnetic lines flash, and the letters fly in one by one to line up as a full sentence; the magnet recoils at the end.',
    css: `${H}
.S .row{display:flex;gap:calc(var(--u)*.6);margin-left:calc(var(--u)*14)}
.S .ch{display:grid;place-items:center;width:calc(var(--u)*7);height:calc(var(--u)*8.6);background:var(--ac2);font-size:calc(var(--u)*5.4);border-radius:calc(var(--u)*1);animation:K_ch 7s cubic-bezier(.5,0,.3,1.3) infinite both;animation-delay:calc(var(--i)*.09s)}
.S .mg{position:absolute;left:calc(50% - var(--W)/2 - var(--u)*16);top:50%;width:calc(var(--u)*14);height:calc(var(--u)*16);margin-top:calc(var(--u)*-8);animation:K_mg 7s cubic-bezier(.3,1.4,.5,1) infinite both}
.S .mg svg{width:100%;height:100%;overflow:visible}
.S .mg .b{fill:none;stroke:var(--fg);stroke-width:30;stroke-linecap:butt}
.S .mg .f{fill:none;stroke:var(--ac);stroke-width:20}
.S .mg rect{fill:#cfd6de;stroke:var(--fg);stroke-width:4}
.S .ml{position:absolute;left:100%;top:50%;width:calc(var(--u)*6);height:calc(var(--u)*12);margin-top:calc(var(--u)*-6);border:calc(var(--u)*.5) dashed var(--fg);border-left:0;border-radius:0 50% 50% 0;opacity:0;animation:K_ml 7s infinite both}
@container (aspect-ratio < 1){.S .row{flex-wrap:wrap;max-width:calc(var(--u)*46);justify-content:center}}
@keyframes K_mg{0%{transform:translateX(-40cqw)}14%,70%{transform:none}22%,26%,30%{transform:translateX(calc(var(--u)*-.6))}24%,28%{transform:translateX(calc(var(--u)*.6))}78%,100%{transform:translateX(calc(var(--u)*-5))}}
@keyframes K_ml{0%,18%{opacity:0}22%,30%{opacity:1}36%,100%{opacity:0}}
@keyframes K_ch{0%,26%{transform:translate(var(--dx),var(--dy)) rotate(var(--r))}44%,100%{transform:none}}`,
    html: (w) => {
      const t = Array.from(given(w, ['這區為什麼搶手'])[0]).slice(0, 12);
      const W = t.length * 7.6;
      return `<div class="g" style="--W:calc(var(--u)*${W})"><div class="mg"><svg viewBox="0 0 140 160"><path class="b" d="M120 20 H60 A50 50 0 0 0 60 140 H120"/><path class="f" d="M120 20 H60 A50 50 0 0 0 60 140 H120"/><rect x="100" y="5" width="30" height="30"/><rect x="100" y="125" width="30" height="30"/></svg><i class="ml"></i></div><div class="row">${t.map((c, i) => `<b class="ch bx tt lt" style="--i:${i};--dx:calc(var(--u)*${((rnd(i) - .3) * 60).toFixed(1)});--dy:calc(var(--u)*${((rnd(i + 7) - .5) * 40).toFixed(1)});--r:${Math.round((rnd(i + 2) - .5) * 90)}deg">${esc(c)}</b>`).join('')}</div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-dice', no: 387, zh: '骰子滾動', en: 'Rolling Dice',
    desc: '兩顆骰子滾過桌面，停下來的點數就是數字',
    tags: ['機率', '數字', '有趣'], sample: ['賭一把？', '5', '3'],
    hint: '第 1 行是標題；第 2、3 行是兩顆骰子最後的點數（1–6）',
    motion: '兩顆立體骰子（白面、粗黑框、硬陰影）從右側丟進來，一路翻滾彈跳經過桌面，最後停在指定點數；標題卡從上方掉下，下方跳出「＝點數合計」。',
    motionEn: 'Two 3D dice (white faces, thick outline, hard shadow) are thrown in from the right, tumbling and bouncing across the table, landing on the given pips; a title card drops from the top and “= total” pops below.',
    css: `${H}
.S .w{position:relative;display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*4)}
.S .hd{padding:calc(var(--u)*1.6) calc(var(--u)*4);background:var(--ac2);font-size:calc(var(--u)*4.4);border-radius:calc(var(--u)*1.2);animation:K_hd 7s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .ds{display:flex;gap:calc(var(--u)*8);perspective:calc(var(--u)*200)}
.S .dw{animation:K_roll 7s cubic-bezier(.3,.7,.4,1) infinite both;animation-delay:calc(var(--i)*.12s)}
.S .dc{position:relative;width:calc(var(--u)*16);height:calc(var(--u)*16);transform-style:preserve-3d;animation:K_tum 7s cubic-bezier(.25,.7,.35,1) infinite both;animation-delay:calc(var(--i)*.12s)}
.S .fc{position:absolute;inset:0;background:#fbfaf6;border:var(--bw) solid #151515;border-radius:calc(var(--u)*2.4);display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);padding:calc(var(--u)*1.6);backface-visibility:hidden}
.S .fc i{width:calc(var(--u)*2.8);aspect-ratio:1;border-radius:50%;background:#151515;place-self:center}
.S .fc i.r{background:#d62828}
.S .sum{font-size:calc(var(--u)*7);animation:K_hd 7s cubic-bezier(.3,1.6,.5,1) infinite both;animation-delay:.3s}
.S .sum span{color:var(--ac)}
@keyframes K_roll{0%{transform:translateX(70cqw) translateY(calc(var(--u)*-10))}14%{transform:translateX(40cqw) translateY(0)}20%{transform:translateX(26cqw) translateY(calc(var(--u)*-6))}28%{transform:translateX(10cqw)}34%{transform:translateX(3cqw) translateY(calc(var(--u)*-2))}40%,100%{transform:none}}
@keyframes K_tum{0%{transform:var(--end) rotateX(-720deg) rotateY(540deg)}40%,100%{transform:var(--end)}}
@keyframes K_hd{0%,42%{transform:scale(0);opacity:0}50%,100%{transform:none;opacity:1}}`,
    html: (w) => {
      const all = given(w, ['賭一把？', '5', '3']);
      const t = all.length > 1 && !/^\d$/.test(all[0]) ? all[0] : '';
      const nums = all.filter((s) => /^[1-6]$/.test(s)).map(Number);
      const v = [nums[0] ?? 5, nums[1] ?? 3];
      const P: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
      // 正面就是指定點數（只畫正面；翻滾時看到的是同一面旋轉，簡化成立體感）
      const face = (n: number) => `<div class="fc bx">${Array.from({ length: 9 }, (_, k) => (P[n].includes(k) ? `<i class="${n === 1 ? 'r' : ''}"></i>` : '<span></span>')).join('')}</div>`;
      return `<div class="g"><div class="w">${t ? `<div class="hd bx tt lt">${esc(t)}</div>` : ''}<div class="ds">${v.map((n, i) => `<div class="dw" style="--i:${i}"><div class="dc" style="--i:${i};--end:rotate(${i ? 8 : -6}deg)">${face(n)}</div></div>`).join('')}</div><div class="sum tt">＝ <span>${v[0] + v[1]}</span></div></div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-bulb', no: 388, zh: '電燈泡想到了', en: 'Light Bulb Idea',
    desc: '燈泡閃兩下亮起，光暈裡出現點子',
    tags: ['小知識', '靈感', '有趣'], sample: ['小知識', '公設比越低，實際使用越大'],
    hint: '第 1 行是燈泡下的小標，第 2 行是亮起後的點子',
    motion: '畫面上方垂下一顆燈泡（粗黑框、燈座有螺紋），先暗著，閃兩下後「啪」地亮起副色，四周放射出光線並輕輕搖晃；下方滑出小標，再彈出寫著點子的卡片。',
    motionEn: 'A light bulb (thick outline, threaded base) hangs from the top, dark at first; it flickers twice then snaps on in accent-2, rays burst out and it sways gently; a small label slides in below, then a card with the idea pops up.',
    css: `${H}
.S .w{display:flex;flex-direction:column;align-items:center}
.S .bl{position:relative;width:calc(var(--u)*20);transform-origin:50% -40cqh;animation:K_sw 3.5s ease-in-out infinite}
.S .cd0{position:absolute;left:50%;bottom:100%;width:calc(var(--u)*.6);height:50cqh;background:var(--fg);translate:-50% 0}
.S .gl{width:calc(var(--u)*20);aspect-ratio:1;border-radius:50% 50% 44% 44%;background:color-mix(in srgb,var(--fg) 18%,var(--bg));border:var(--bw) solid var(--fg);animation:K_on 7s steps(1) infinite both}
.S .bs{width:calc(var(--u)*10);height:calc(var(--u)*7);margin:calc(var(--u)*-1) auto 0;background:repeating-linear-gradient(180deg,#9aa3ad 0 calc(var(--u)*1.2),#6b737c 0 calc(var(--u)*2));border:var(--bw) solid var(--fg);border-radius:0 0 calc(var(--u)*2) calc(var(--u)*2)}
.S .bs{order:2}
.S .ry{position:absolute;left:50%;top:calc(var(--u)*10);width:0;height:0;animation:K_ry 7s infinite both}
.S .ry i{position:absolute;width:calc(var(--u)*5);height:calc(var(--u)*1);margin:calc(var(--u)*-.5) 0 0 calc(var(--u)*14);background:var(--ac2);border:calc(var(--u)*.3) solid var(--fg);border-radius:var(--u);transform-origin:calc(var(--u)*-14) 50%;rotate:var(--a)}
.S .lb{margin-top:calc(var(--u)*3);font-size:calc(var(--u)*3);opacity:.75;animation:K_cd 7s ease infinite both;animation-delay:.2s}
.S .cd{margin-top:calc(var(--u)*1.6);padding:calc(var(--u)*2) calc(var(--u)*3.6);background:var(--ac2);font-size:calc(var(--u)*4.4);border-radius:calc(var(--u)*1.4);max-width:calc(var(--u)*80);text-align:center;animation:K_cd 7s cubic-bezier(.3,1.6,.5,1) infinite both;animation-delay:.5s}
@container (aspect-ratio < 1){.S .cd{max-width:calc(var(--u)*54)}}
@keyframes K_sw{0%,100%{rotate:-2deg}50%{rotate:2deg}}
@keyframes K_on{0%{background:color-mix(in srgb,var(--fg) 18%,var(--bg))}14%{background:var(--ac2)}16%{background:color-mix(in srgb,var(--fg) 18%,var(--bg))}20%{background:var(--ac2)}22%{background:color-mix(in srgb,var(--fg) 18%,var(--bg))}27%,100%{background:var(--ac2);box-shadow:0 0 0 calc(var(--u)*3) color-mix(in srgb,var(--ac2) 30%,transparent)}}
@keyframes K_ry{0%,26%{opacity:0;scale:.6}30%,100%{opacity:1;scale:1}}
@keyframes K_cd{0%,32%{transform:translateY(calc(var(--u)*4)) scale(.6);opacity:0}40%,100%{transform:none;opacity:1}}`,
    html: (w) => {
      const [a, b] = given(w, ['小知識', '公設比越低，實際使用越大']);
      const ry = [-150, -120, -90, -60, -30, 0, 180].map((d) => `<i style="--a:${d}deg"></i>`).join('');
      return `<div class="g"><div class="w"><div class="bl"><i class="cd0"></i><div class="ry">${ry}</div><div class="gl"></div><div class="bs"></div></div>${b ? `<div class="lb tt">${esc(a)}</div>` : ''}<div class="cd bx tt lt">${esc(b ?? a)}</div></div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-remote', no: 389, zh: '遙控器轉台', en: 'Remote Channel Flip',
    desc: '遙控器一按，電視雜訊切到下一台，換話題',
    tags: ['轉場', '換話題', '有趣'], sample: ['CH 1 房價', 'CH 2 利率', 'CH 3 政策'],
    hint: '每行一台（2–4 台），「CH 2 利率」會拆成頻道號與節目名',
    motion: '主色復古電視（粗黑框、兩根天線、旁邊有轉鈕）播著第一台；前景一隻手拿遙控器按下按鈕（紅點閃），電視畫面閃雜訊條紋切到下一台，左上角頻道號跳動；一共切兩次。',
    motionEn: 'A retro accent TV (thick outline, two antennas, side knobs) shows channel 1; in the foreground a remote’s button is pressed (red dot flashes), the screen flickers with static bars and cuts to the next channel with the corner number jumping; it switches twice.',
    css: `${H}
.S .w{position:relative;margin-top:calc(var(--u)*10)}
.S .tv{position:relative;width:calc(var(--u)*60);height:calc(var(--u)*40);background:var(--ac);border-radius:calc(var(--u)*3);padding:calc(var(--u)*3) calc(var(--u)*14) calc(var(--u)*3) calc(var(--u)*3)}
.S .an{position:absolute;bottom:100%;left:50%;width:calc(var(--u)*.7);height:calc(var(--u)*12);background:var(--fg);transform-origin:bottom;rotate:var(--r)}
.S .kn{position:absolute;right:calc(var(--u)*4);width:calc(var(--u)*6);aspect-ratio:1;border-radius:50%;background:var(--bg);border:var(--bw) solid var(--fg)}
.S .sc{position:relative;height:100%;background:#151515;border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*2);overflow:hidden}
.S .ch{position:absolute;inset:0;display:grid;place-items:center;font-size:calc(var(--u)*7);color:#fbfaf6;background:var(--c);opacity:0;animation:K_ch 7s steps(1) infinite both}
.S .ch small{position:absolute;left:calc(var(--u)*2);top:calc(var(--u)*1.4);font:normal 900 calc(var(--u)*3) var(--mono);color:#7CFC8A}
.S .nz{position:absolute;inset:0;background:repeating-linear-gradient(0deg,#fff 0 calc(var(--u)*.5),#777 0 calc(var(--u)*1.2),#222 0 calc(var(--u)*1.8));opacity:0;animation:K_nz 7s steps(1) infinite both}
.S .rm{position:absolute;right:calc(var(--u)*-10);bottom:calc(var(--u)*-12);width:calc(var(--u)*10);height:calc(var(--u)*24);background:#2b2f36;border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*3);rotate:18deg;box-shadow:var(--sh)}
.S .rm i{position:absolute;left:50%;top:calc(var(--u)*3);width:calc(var(--u)*3.6);aspect-ratio:1;margin-left:calc(var(--u)*-1.8);border-radius:50%;background:#d62828;animation:K_bt 7s steps(1) infinite both}
.S .rm b{position:absolute;left:calc(var(--u)*2);right:calc(var(--u)*2);height:calc(var(--u)*1.6);background:#5a606b;border-radius:var(--u)}
@keyframes K_nz{0%{opacity:0}33%{opacity:1}36%{opacity:0}66%{opacity:1}69%,100%{opacity:0}}
@keyframes K_bt{0%{filter:none}31%{filter:brightness(2)}35%{filter:none}64%{filter:brightness(2)}68%,100%{filter:none}}`,
    html: (w) => {
      const chs = given(w, ['CH 1 房價', 'CH 2 利率', 'CH 3 政策']).slice(0, 4);
      const n = chs.length;
      const cols = ['#2f6db5', '#7b3fa0', '#2a9d8f', '#c0392b'];
      // 每台平均分配時間，雜訊在切換點
      const seg = 100 / n;
      const kf = chs.map((_, i) => `@keyframes ma-remote-${i}{0%{opacity:0}${(i * seg).toFixed(1)}%{opacity:1}${((i + 1) * seg).toFixed(1)}%{opacity:${i === n - 1 ? 1 : 0}}100%{opacity:${i === n - 1 ? 1 : 0}}}`).join('');
      const nz = Array.from({ length: n - 1 }, (_, i) => `${((i + 1) * seg - 1).toFixed(1)}%{opacity:1}${((i + 1) * seg + 2).toFixed(1)}%{opacity:0}`).join('');
      const bt = Array.from({ length: n - 1 }, (_, i) => `${((i + 1) * seg - 3).toFixed(1)}%{filter:brightness(2.2)}${((i + 1) * seg + 1).toFixed(1)}%{filter:none}`).join('');
      const items = chs.map((s, i) => { const m = s.match(/^(CH\s*\d+)\s*(.*)$/i); return `<div class="ch tt" style="--c:${cols[i]};animation-name:ma-remote-${i}"><small>${esc(m ? m[1] : `CH ${i + 1}`)}</small>${esc(m ? m[2] || m[1] : s)}</div>`; }).join('');
      return `<style>${kf}@keyframes ma-remote-nz{0%{opacity:0}${nz}100%{opacity:0}}@keyframes ma-remote-bt{0%{filter:none}${bt}100%{filter:none}}.fx-obj-fun-remote .nz{animation-name:ma-remote-nz}.fx-obj-fun-remote .rm i{animation-name:ma-remote-bt}</style><div class="g"><div class="w"><div class="tv bx"><i class="an" style="--r:-28deg"></i><i class="an" style="--r:24deg"></i><i class="kn" style="top:calc(var(--u)*6)"></i><i class="kn" style="top:calc(var(--u)*16)"></i><div class="sc">${items}<i class="nz"></i></div></div><div class="rm"><i></i><b style="top:calc(var(--u)*10)"></b><b style="top:calc(var(--u)*14)"></b><b style="top:calc(var(--u)*18)"></b></div></div></div>`;
    },
  },
  {
    ...base, id: 'obj-fun-whack', no: 390, zh: '打地鼠', en: 'Whack-a-Mole',
    desc: '地鼠洞冒出迷思，鐵鎚敲下去換成正解',
    tags: ['破解迷思', 'Q&A', '有趣'], sample: ['頂樓加蓋很划算', '違建隨時會被拆'],
    hint: '第 1 行是地鼠舉的迷思牌，第 2 行是敲下去後冒出的正解',
    motion: '綠色草地上三個地洞（粗黑框），中間的主色地鼠舉著「迷思」牌探出頭；副色大鐵鎚從右上揮下「咚」地敲中，地鼠縮回洞裡、冒出星星，接著同一個洞彈出寫正解的牌子。',
    motionEn: 'Three holes on green grass (thick outlines); an accent mole pops up from the middle one holding a “myth” sign; a big accent-2 mallet swings down from the top right and bonks it, the mole ducks back with stars, and a sign with the truth springs up from the same hole.',
    css: `${H}
.S .w{position:relative;width:calc(var(--u)*80);height:calc(var(--u)*44)}
.S .gr{position:absolute;left:0;right:0;bottom:0;height:calc(var(--u)*14);background:#5fbf73;border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*2);box-shadow:var(--sh)}
.S .ho{position:absolute;bottom:calc(var(--u)*5);width:calc(var(--u)*18);height:calc(var(--u)*5);border-radius:50%;background:#2b1d12;border:var(--bw) solid var(--fg);translate:-50% 0}
.S .pit{position:absolute;left:50%;bottom:calc(var(--u)*7.5);width:calc(var(--u)*36);height:calc(var(--u)*36);translate:-50% 0;overflow:hidden}
.S .ml{position:absolute;left:50%;bottom:0;translate:-50% 0;display:flex;flex-direction:column;align-items:center;animation:K_ml 7s cubic-bezier(.3,1.4,.5,1) infinite both}
.S .ml .sg{padding:calc(var(--u)*1.2) calc(var(--u)*2.4);background:var(--bg);font-size:calc(var(--u)*3);white-space:nowrap;border-radius:var(--u);margin-bottom:calc(var(--u)*1)}
.S .ml .hd{width:calc(var(--u)*14);height:calc(var(--u)*13);background:var(--ac);border:var(--bw) solid var(--fg);border-radius:50% 50% 20% 20%;position:relative}
.S .ml .hd::before,.S .ml .hd::after{content:'';position:absolute;top:35%;width:calc(var(--u)*1.6);aspect-ratio:1;border-radius:50%;background:var(--fg)}
.S .ml .hd::before{left:28%}.S .ml .hd::after{right:28%}
.S .tr{position:absolute;left:50%;bottom:0;translate:-50% 0;padding:calc(var(--u)*1.6) calc(var(--u)*3);background:var(--ac2);font-size:calc(var(--u)*3.6);white-space:nowrap;border-radius:var(--u);margin-bottom:calc(var(--u)*2);animation:K_tr 7s cubic-bezier(.3,1.6,.5,1) infinite both}
.S .hm{position:absolute;right:calc(var(--u)*-4);top:calc(var(--u)*-10);width:calc(var(--u)*34);height:calc(var(--u)*10);transform-origin:100% 50%;animation:K_hm 7s cubic-bezier(.6,0,.4,1) infinite both}
.S .hm::before{content:'';position:absolute;right:0;top:50%;width:80%;height:calc(var(--u)*2.4);margin-top:calc(var(--u)*-1.2);background:#a0703c;border:var(--bw) solid var(--fg);border-radius:var(--u)}
.S .hm::after{content:'';position:absolute;left:0;top:0;width:calc(var(--u)*10);height:100%;background:var(--ac2);border:var(--bw) solid var(--fg);border-radius:calc(var(--u)*1.6)}
.S .st{position:absolute;left:50%;top:calc(var(--u)*6);font-size:calc(var(--u)*6);color:var(--ac2);translate:-50% 0;opacity:0;animation:K_st 7s ease infinite both}
@container (aspect-ratio < 1){.S .w{width:calc(var(--u)*60)}.S .hm{right:calc(var(--u)*-2)}}
@keyframes K_ml{0%,6%{transform:translateY(110%)}14%,38%{transform:none}44%,100%{transform:translateY(110%)}}
@keyframes K_hm{0%,24%{transform:rotate(-55deg)}36%{transform:rotate(-55deg)}40%{transform:rotate(18deg)}48%,100%{transform:rotate(-60deg);opacity:1}}
@keyframes K_st{0%,40%{opacity:0;scale:.4}44%,56%{opacity:1;scale:1}62%,100%{opacity:0}}
@keyframes K_tr{0%,52%{transform:translateY(120%)}60%,100%{transform:none}}`,
    html: (w) => {
      const [a, b] = given(w, ['頂樓加蓋很划算', '違建隨時會被拆']);
      return `<div class="g"><div class="w"><div class="gr"></div><i class="ho" style="left:16%"></i><i class="ho" style="left:84%"></i><i class="ho" style="left:50%"></i><div class="pit"><div class="ml"><b class="sg bx tt">迷思：${esc(a)}</b><i class="hd"></i></div><b class="tr bx tt lt">✓ ${esc(b ?? a)}</b></div><b class="st tt">✦ ✦</b><div class="hm"></div></div></div>`;
    },
  },
  {
    ...base, cat: 'homecheck', id: 'obj-home-sold', no: 391, zh: '售屋吊牌', en: 'For-Sale Sign',
    desc: '「售」字吊牌掛在橫桿上搖晃停下，蓋上「已成交」章',
    tags: ['成交', '案例', '房地產'], sample: ['售', '3 房 2 廳・1,680 萬', '已成交'],
    hint: '第 1 行是吊牌大字，第 2 行是物件資訊，第 3 行是印章字（留空就不蓋章）',
    motion: '畫面上方一根黑色橫桿，副色吊牌（粗黑框、硬陰影）用兩條鍊子掛著，從斜擺盪進來來回搖晃、幅度越來越小停下；牌上大字「售」、下面一行物件資訊；最後主色「已成交」印章從大縮小蓋下去，微微歪斜。',
    motionEn: 'A black bar across the top holds an accent-2 sign (thick outline, hard shadow) on two chains; it swings in and sways with shrinking amplitude until still, showing a big “售” and a line of listing info; finally an accent “SOLD” stamp slams down from large to small at a slight tilt.',
    css: `${H}
.S{--t:18%}
@container (aspect-ratio < 1){.S{--t:32%}}
.S .bar{position:absolute;top:var(--t);left:8%;right:8%;height:var(--bw);background:var(--fg)}
.S .sg{position:absolute;top:var(--t);left:50%;width:calc(var(--u)*50);margin-left:calc(var(--u)*-25);transform-origin:50% 0;animation:K_sw 7s ease-out infinite both}
.S .sg::before,.S .sg::after{content:'';position:absolute;top:0;width:var(--bw);height:calc(var(--u)*6);background:var(--fg)}
.S .sg::before{left:calc(var(--u)*8)}.S .sg::after{right:calc(var(--u)*8)}
.S .bd{margin-top:calc(var(--u)*6);background:var(--ac2);border-radius:calc(var(--u)*2);padding:calc(var(--u)*2.6);text-align:center}
.S .bd b{display:block;font-size:calc(var(--u)*13);line-height:1.05}
.S .bd span{font-size:calc(var(--u)*3.4)}
.S .so{position:absolute;left:50%;top:calc(var(--t) + var(--u)*22);translate:-50% -50%;padding:calc(var(--u)*1) calc(var(--u)*3.6);border:calc(var(--u)*1.1) solid var(--ac);color:var(--ac);font-size:calc(var(--u)*7.4);white-space:nowrap;border-radius:calc(var(--u)*1.6);rotate:-12deg;background:color-mix(in srgb,var(--bg) 55%,transparent);animation:K_st 7s infinite both}
@keyframes K_sw{0%{transform:rotate(22deg)}12%{transform:rotate(-14deg)}22%{transform:rotate(8deg)}30%{transform:rotate(-4deg)}36%{transform:rotate(2deg)}40%,100%{transform:none}}
@keyframes K_st{0%,46%{opacity:0;transform:scale(2.4)}52%{opacity:1;transform:scale(.92)}56%,100%{opacity:1;transform:none}}`,
    html: (w) => {
      const [a, b, c] = given(w, ['售', '3 房 2 廳・1,680 萬', '已成交']);
      return `<div class="g"><i class="bar"></i><div class="sg"><div class="bd bx tt lt"><b>${esc(a)}</b>${b ? `<span>${esc(b)}</span>` : ''}</div></div>${c ? `<div class="so tt">${esc(c)}</div>` : ''}</div>`;
    },
  },
];
