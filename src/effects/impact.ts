import type { Fx } from '../types';
import { chars, esc, pick, rep } from '../util';

export const impact: Fx[] = [
  {
    id: 'word-burst',
    cat: 'impact',
    zh: '文字爆開',
    en: 'Word Burst',
    desc: '單字咚一聲彈出來，四周放射線炸開',
    tags: ['強調', '亮點'],
    tone: 'ink',
    sample: ['爆款'],
    hint: '2–4 字',
    motion: '文字從 0 倍彈性放大到 115% 再回到 100%（cubic-bezier 回彈），同時 12 條放射線從中心向外射出後消失；停留後整體放大淡出，循環。',
    motionEn: 'The word pops from scale 0 to 115% then settles at 100% with a springy overshoot, while 12 radial lines shoot outward from the center and vanish; after a hold, it scales up and fades out, looping.',
    css: `
.S .w{font-size:calc(var(--u)*17);animation:K_pop 2.8s cubic-bezier(.2,1.6,.4,1) infinite both;position:relative;z-index:1}
.S i{position:absolute;left:50%;top:50%;width:calc(var(--u)*.7);height:calc(var(--u)*9);margin-left:calc(var(--u)*-.35);background:var(--ac);border-radius:9px;transform-origin:50% 0;transform:rotate(var(--r)) translateY(calc(var(--u)*10)) scaleY(0);animation:K_ray 2.8s ease-out infinite}
@keyframes K_pop{0%{transform:scale(0)}18%{transform:scale(1.15)}28%,82%{transform:scale(1);opacity:1}94%,100%{transform:scale(1.25);opacity:0}}
@keyframes K_ray{0%,6%{transform:rotate(var(--r)) translateY(calc(var(--u)*8)) scaleY(0)}16%{transform:rotate(var(--r)) translateY(calc(var(--u)*13)) scaleY(1)}30%,100%{transform:rotate(var(--r)) translateY(calc(var(--u)*24)) scaleY(0)}}`,
    html: (w) => `<div class="w">${esc(w[0])}</div>${rep(12, (i) => `<i style="--r:${i * 30}deg"></i>`)}`,
  },
  {
    id: 'letter-hit',
    cat: 'impact',
    zh: '逐字敲擊',
    en: 'Letter Sequence',
    desc: '一個字一個字砸上來，帶擠壓回彈',
    tags: ['節奏', '歌詞'],
    tone: 'accent',
    sample: ['一字一拍'],
    hint: '3–6 字',
    motion: '每個字依序從上方快速落下，落地瞬間壓扁（scaleY 0.7、scaleX 1.2）再回彈，字與字間隔 0.12 秒；全部到位停留後一起淡出，循環。',
    motionEn: 'Each character drops in from above one by one, squashing on impact (scaleY 0.7, scaleX 1.2) before springing back, 0.12s apart; after all land and hold, they fade out together, looping.',
    css: `
.S .t{font-size:calc(var(--u)*15);display:flex}
.S .c{animation:K_hit 3s infinite both;animation-delay:calc(var(--i)*.12s);transform-origin:50% 100%}
@keyframes K_hit{0%{transform:translateY(-150%);opacity:0}8%{transform:translateY(0) scale(1.2,.7);opacity:1}13%{transform:translateY(-8%) scale(.95,1.08)}17%,82%{transform:none;opacity:1}92%,100%{opacity:0;transform:translateY(10%)}}`,
    html: (w) => `<div class="t">${chars(w[0])}</div>`,
  },
  {
    id: 'stamp',
    cat: 'impact',
    zh: '印章',
    en: 'Text Stamp',
    desc: '像蓋章一樣，一個個蓋上去',
    tags: ['公告', '決定'],
    tone: 'paper',
    sample: ['核准', '通過', '定案'],
    hint: '每個詞 2–3 字，最多 3 個',
    motion: '三個印章依序從 2.6 倍大、半透明快速壓下到 1 倍，落下瞬間畫面輕微震動；印章為紅色粗框、略為旋轉、帶油墨顆粒質感，全部蓋完停留後淡出。',
    motionEn: 'Three rubber stamps slam down in sequence from 2.6x scale to 1x with a tiny screen shake on impact; red thick-bordered, slightly rotated, with ink grain texture; hold, then fade out.',
    css: `
.S{animation:K_shake 3.6s infinite}
.S .s.one{font-size:min(11cqw,8cqh);translate:-50% -50%}
.S .s{white-space:nowrap}
.S .s{position:absolute;font-size:calc(var(--u)*7.5);color:var(--ac);border:calc(var(--u)*.9) solid var(--ac);padding:calc(var(--u)*1.2) calc(var(--u)*2.4);border-radius:calc(var(--u)*1.4);transform:rotate(var(--r));opacity:0;animation:K_st 3.6s cubic-bezier(.3,1.4,.5,1) infinite both;animation-delay:calc(var(--i)*.5s);-webkit-mask:radial-gradient(circle at 30% 40%,#000 60%,#000a 61%,#000 75%)}
@keyframes K_st{0%{transform:rotate(var(--r)) scale(2.6);opacity:0}10%{transform:rotate(var(--r)) scale(.94);opacity:1}14%,80%{transform:rotate(var(--r)) scale(1);opacity:1}92%,100%{opacity:0;transform:rotate(var(--r)) scale(1)}}
@keyframes K_shake{0%,9%,13%,23%,27%,37%,41%,100%{transform:none}10%,24%,38%{transform:translate(1%,1%)}11%,25%,39%{transform:translate(-1%,-.5%)}}`,
    html: (w) => {
      const list = w.filter(Boolean).length ? w.filter(Boolean).slice(0, 3) : ['核准', '通過', '定案'];
      // 依數量決定落點：一個置中、兩個斜對角、三個散開
      const pos = [[[50, 50]], [[12, 22], [46, 50]], [[8, 18], [38, 46], [64, 20]]][list.length - 1];
      return list.map((t, i) => `<div class="s${list.length === 1 ? ' one' : ''}" style="--i:${i};--r:${[-10, 6, -4][i]}deg;left:${pos[i][0]}%;top:${pos[i][1]}%">${esc(t)}</div>`).join('');
    },
  },
  {
    id: 'punch-zoom',
    cat: 'impact',
    zh: '衝擊放大',
    en: 'Punch Zoom',
    desc: '從深處飛出、後面拖著殘影',
    tags: ['開場', '強調'],
    tone: 'ink',
    sample: ['開箱'],
    hint: '2–4 字',
    motion: '文字從畫面深處（scale 0.05）高速衝到 100%，後方跟著 3 層透明度遞減的殘影各延遲 0.05 秒；到位後微微震動，最後放大到 3 倍淡出，循環。',
    motionEn: 'The word rockets from deep in the frame (scale 0.05) to 100% at high speed, trailed by 3 fading ghost copies each 0.05s behind; it jolts slightly on arrival, then blows up to 3x and fades, looping.',
    css: `
.S .w{position:absolute;font-size:calc(var(--u)*18);animation:K_pz 2.6s cubic-bezier(.15,.9,.3,1.2) infinite both;animation-delay:calc(var(--k)*.08s);color:color-mix(in srgb,var(--ac) calc(100% - var(--k)*26%),transparent)}
.S .w:last-child{color:var(--fg)}
@keyframes K_pz{0%{transform:scale(.05);opacity:0}18%{transform:scale(1.06);opacity:1}22%{transform:scale(.98) translateX(1%)}26%,78%{transform:scale(1);opacity:1}100%{transform:scale(3);opacity:0}}`,
    html: (w) => rep(4, (k) => `<div class="w" style="--k:${3 - k};z-index:${k + 1}">${esc(w[0])}</div>`),
  },
  {
    id: 'kinetic-stack',
    cat: 'impact',
    zh: '動態堆疊',
    en: 'Kinetic Stack',
    desc: '詞一個個飛進來疊起來',
    tags: ['MV', '歌詞'],
    tone: 'ink',
    sample: ['今天', '也要', '好好', '生活'],
    hint: '3–5 個短詞',
    motion: '每個詞從左右交錯方向橫向飛入並堆疊成一個方塊排版，每行大小不同、其中一行用主色；每行間隔 0.25 秒，全部疊好停留，再一起往上滑出，循環。',
    motionEn: 'Words fly in horizontally from alternating left and right, stacking into a tight block layout with varying line sizes and one line in the accent color, 0.25s apart; hold, then slide up and out together, looping.',
    css: `
.S .b{display:flex;flex-direction:column;align-items:flex-start;animation:K_out 3.6s infinite}
.S .l{font-size:calc(var(--u)*var(--s));line-height:.95;animation:K_in 3.6s cubic-bezier(.2,.9,.2,1) infinite both;animation-delay:calc(var(--i)*.22s)}
.S .l:nth-child(2n){--d:1}.S .l:nth-child(3){color:var(--ac)}
@keyframes K_in{0%{transform:translateX(calc((var(--d,0)*2 - 1)*-120%));opacity:0}14%,100%{transform:none;opacity:1}}
@keyframes K_out{0%,82%{transform:none;opacity:1}100%{transform:translateY(-30%);opacity:0}}`,
    html: (w) =>
      `<div class="b">${w
        .slice(0, 5)
        .map((t, i) => `<div class="l" style="--i:${i};--s:${[13, 9, 15, 11, 9][i]}">${esc(t)}</div>`)
        .join('')}</div>`,
  },
  {
    id: 'stretch',
    cat: 'impact',
    zh: '伸縮字',
    en: 'Stretch Text',
    desc: '文字上下拉長再縮回',
    tags: ['俏皮', '衝擊'],
    tone: 'accent',
    sample: ['拉長了'],
    hint: '2–4 字',
    motion: '文字以底部為基準點，垂直方向被拉長到 2.2 倍、再壓扁到 0.6 倍、最後彈回 1 倍，像橡皮筋；每個字有 0.06 秒的波浪延遲，循環。',
    motionEn: 'Anchored at the baseline, the text stretches vertically to 2.2x, squashes to 0.6x, then springs back to 1x like a rubber band, with a 0.06s wave delay per character, looping.',
    css: `
.S .t{font-size:calc(var(--u)*14);display:flex}
.S .c{transform-origin:50% 85%;animation:K_st 2.4s cubic-bezier(.4,0,.2,1) infinite;animation-delay:calc(var(--i)*.06s)}
@keyframes K_st{0%,100%{transform:none}25%{transform:scaleY(2.2) scaleX(.85)}45%{transform:scaleY(.6) scaleX(1.2)}60%{transform:scaleY(1.15)}72%{transform:none}}`,
    html: (w) => `<div class="t">${chars(w[0])}</div>`,
  },
  {
    id: 'zoom-through',
    cat: 'impact',
    zh: '穿越放大',
    en: 'Text Zoom Through',
    desc: '衝進字裡，接到下一個詞',
    tags: ['轉場', '速度感'],
    tone: 'paper',
    sample: ['準備', '出發', '到站'],
    hint: '3 個詞',
    motion: '第一個詞出現後鏡頭急速衝進字的筆畫裡（放大到 30 倍），穿過去後下一個詞從遠處出現，三個詞連續穿越，每個詞約 1.2 秒，循環。',
    motionEn: 'Each word appears, then the camera rushes into its strokes (scaling to 30x); passing through reveals the next word from the distance; three words chain together, about 1.2s each, looping.',
    css: `
.S .w{position:absolute;font-size:calc(var(--u)*16);opacity:0;animation:K_zt 3.6s cubic-bezier(.7,0,.9,.4) infinite both;animation-delay:calc(var(--i)*1.2s)}
.S .w:nth-child(2){color:var(--ac)}
@keyframes K_zt{0%{transform:scale(.2);opacity:0;animation-timing-function:cubic-bezier(.2,.9,.3,1)}7%{transform:scale(1);opacity:1;animation-timing-function:linear}24%{transform:scale(1.15);opacity:1;animation-timing-function:cubic-bezier(.7,0,1,.5)}33.3%{transform:scale(30);opacity:0}100%{opacity:0}}`,
    html: (w) => pick(w, 3, ['準備', '出發', '到站']).map((t, i) => `<div class="w" style="--i:${i}">${esc(t)}</div>`).join(''),
  },
  {
    id: 'squeeze',
    cat: 'impact',
    zh: '擠壓彈跳',
    en: 'Text Squeeze',
    desc: '像橡皮一樣壓扁再換字',
    tags: ['彈性', '切換'],
    tone: 'ink',
    sample: ['彈力', '韌性'],
    hint: '2 個詞',
    motion: '文字被往下壓扁成一條線（scaleY 0.05、scaleX 1.4），在最扁的瞬間換成第二個詞，再像彈簧一樣彈回並晃動兩下，兩個詞交替循環。',
    motionEn: 'The text gets squashed flat into a line (scaleY 0.05, scaleX 1.4); at its flattest it swaps to the second word, then springs back with two wobbles; the two words alternate in a loop.',
    css: `
.S .w{position:absolute;font-size:calc(var(--u)*17);color:var(--ac);transform-origin:50% 80%;animation:K_sq 3.2s infinite both;animation-delay:calc(var(--i)*-1.6s)}
@keyframes K_sq{0%{transform:scale(1.4,.05);opacity:1}8%{transform:scale(.9,1.2)}14%{transform:scale(1.06,.92)}20%{transform:scale(.98,1.03)}25%,40%{transform:none;opacity:1}50%{transform:scale(1.4,.05);opacity:1}50.1%,100%{opacity:0}}`,
    html: (w) => pick(w, 2, ['彈力', '韌性']).map((t, i) => `<div class="w" style="--i:${i}">${esc(t)}</div>`).join(''),
  },
  {
    id: 'shake-alert',
    cat: 'impact',
    zh: '震動警示',
    en: 'Shake Alert',
    desc: '文字劇烈抖動，紅光閃爍',
    tags: ['警告', '注意'],
    tone: 'ink',
    sample: ['注意！'],
    hint: '2–4 字',
    motion: '文字快速左右抖動並帶輕微旋轉（每 0.05 秒一次），同時背景以主色閃爍兩下，文字外框出現同色描邊；抖完停頓 1 秒再重來。',
    motionEn: 'The text jitters rapidly side to side with slight rotation every 0.05s while the background flashes the accent color twice and the text gains a matching outline; pause 1s, then repeat.',
    css: `
.S{animation:K_bg 2s steps(1) infinite}
.S .w{font-size:calc(var(--u)*16);animation:K_sh 2s infinite;-webkit-text-stroke:calc(var(--u)*.3) var(--ac);paint-order:stroke fill}
@keyframes K_sh{0%,50%,100%{transform:none}5%{transform:translate(-3%,1%) rotate(-3deg)}10%{transform:translate(3%,-1%) rotate(2deg)}15%{transform:translate(-2%,-1%) rotate(-1deg)}20%{transform:translate(2%,1%) rotate(2deg)}25%{transform:translate(-1%,0) rotate(-1deg)}30%{transform:translate(1%,0)}}
@keyframes K_bg{0%,8%,16%,100%{background:var(--bg)}4%,12%{background:var(--ac)}}`,
    html: (w) => `<div class="w">${esc(w[0])}</div>`,
  },
  {
    id: 'slam',
    cat: 'impact',
    zh: '重摔落地',
    en: 'Heavy Slam',
    desc: '巨字從天而降，落地揚起煙塵',
    tags: ['開場', '標題'],
    tone: 'paper',
    sample: ['重磅'],
    hint: '2–3 字',
    motion: '巨大文字從畫面上方加速墜落，砸到地面時整個畫面上下震動、文字底部噴出左右兩團灰色煙塵粒子並擴散消失；停留後文字向下沉出畫面，循環。',
    motionEn: 'Giant text accelerates down from above and slams onto the ground; the whole frame shakes vertically and two puffs of grey dust burst sideways from its base and dissipate; after a hold it sinks out of frame, looping.',
    css: `
.S{animation:K_q 3s infinite}
.S .w{font-size:calc(var(--u)*20);animation:K_drop 3s cubic-bezier(.55,0,1,.45) infinite both;position:relative;z-index:1}
.S .d{position:absolute;top:66%;left:50%;width:calc(var(--u)*6);height:calc(var(--u)*6);border-radius:50%;background:var(--mu);filter:blur(calc(var(--u)*1));opacity:0;animation:K_dust 3s ease-out infinite}
@keyframes K_drop{0%{transform:translateY(-140%)}18%{transform:translateY(0)}20%{transform:translateY(0) scaleY(.9)}24%,80%{transform:none}100%{transform:translateY(180%)}}
@keyframes K_q{0%,17%,30%,100%{transform:none}19%{transform:translateY(2%)}22%{transform:translateY(-1%)}25%{transform:translateY(.5%)}}
@keyframes K_dust{0%,17%{opacity:0;transform:translate(-50%,0) scale(.3)}22%{opacity:.8}50%,100%{opacity:0;transform:translate(calc(-50% + var(--x)),-60%) scale(3)}}`,
    html: (w) =>
      `<div class="w">${esc(w[0])}</div>${rep(6, (i) => `<i class="d" style="--x:${(i < 3 ? -1 : 1) * (12 + (i % 3) * 9)}cqw"></i>`)}`,
  },
];
