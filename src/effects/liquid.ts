import type { Fx } from '../types';
import { blobPath, esc, lobes, pick, rand, rep } from '../util';
import { DROP_GLOBALS } from '../drop';

/** 水的基準色：以藍為主，混入少量主色，換配色時會帶一點色偏 */
const AQ = `.S{--aq:color-mix(in srgb,#6fb3e4 90%,var(--ac));--aq2:color-mix(in srgb,#3f7fbf 92%,var(--ac))}`;

/** HTML 玻璃泡泡 */
const GLASS = `.S .gb{border-radius:50%;background:radial-gradient(circle at 32% 28%,#fffe 0 5%,#fff6 11%,transparent 34%),radial-gradient(circle at 68% 80%,#fff8,transparent 30%),radial-gradient(circle,transparent 58%,#ffffff55 74%,#ffffffcc 99%),color-mix(in srgb,var(--aq) 22%,transparent);box-shadow:inset 0 -.6cqw 1.4cqw #ffffff55,0 1cqw 2.4cqw #0a3a6a26}`;

export const liquid: Fx[] = [
  {
    id: 'crisp-drop',
    no: 20,
    cat: 'liquid',
    zh: '銳利水滴',
    en: 'Crisp Drop',
    desc: '邊緣零模糊的水滴標題，可調形狀、顏色、光澤與文字位置',
    tags: ['品牌', 'Shorts', '可疊影片'],
    tone: 'paper',
    sample: ['好好', '~just savor', '生活', '@sats=3'],
    hint: '一行一句；~ 開頭為英文小字；@ 開頭為設定，例如 @shape=circle;color=#bfe3f7;pos=beside',
    motion: '一顆半透明水滴以彈性放大登場並緩慢呼吸變形，水滴由上淺下深的兩色填色、右下硬邊暗面、左上硬邊月牙高光與小圓點高光、白色實線外框組成，全程不使用任何模糊、陰影或光暈，邊緣保持銳利；文字逐行由下淡入，可放在水滴內、上下方，或在文字周圍點綴小水滴。',
    motionEn: 'A translucent droplet springs in and slowly breathes, built from a two-tone light-to-deep fill, a hard-edged darker lower-right shade, a hard-edged crescent highlight and small dot highlights at top left, and a solid white outline — with no blur, shadow or glow anywhere so every edge stays crisp; text fades up line by line and can sit inside the drop, above or below it, or be decorated with small droplets around it.',
    css: `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    html: () => `<canvas></canvas>`,
    globals: DROP_GLOBALS,
    run: (root, w) => {
      const D = (globalThis as unknown as { MA_DROP: { draw: (...a: unknown[]) => void; parse: (w: string[]) => { o: Record<string, unknown>; lines: string[] } } }).MA_DROP;
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const { o, lines } = D.parse(w);
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const t0 = performance.now();
      let raf = 0;
      const f = (now: number) => {
        raf = requestAnimationFrame(f);
        D.draw(ctx, W, H, o, lines, (now - t0) / 1000);
      };
      raf = requestAnimationFrame(f);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    id: 'glass-blob-title',
    no: 21,
    cat: 'liquid',
    zh: '果凍泡泡標題',
    en: 'Glass Blob Title',
    desc: '半透明果凍水滴緩慢呼吸，白字一行行浮現',
    tags: ['品牌', '片頭'],
    tone: 'paper',
    sample: ['好好', 'just savor', '生活'],
    hint: '主標 / 英文小字 / 主標（三行）',
    motion: '淺藍色上淺下深的漸層背景中央，一顆四瓣雲朵狀的半透明果凍水滴緩慢呼吸變形（外形持續柔和蠕動、整體微微放大縮小），水滴有左上方白色高光、內緣柔光、邊緣細白光、下方淡藍投影與細微顆粒質感；水滴先淡入，白色文字再依序由模糊浮現：第一行主標、第二行字距很寬的英文小字、第三行主標，之後持續停留呼吸。',
    motionEn: 'Centered on a light-blue vertical gradient, a four-lobed cloud-shaped translucent jelly blob slowly breathes, its outline morphing softly while gently scaling; it has a white specular highlight at top left, a soft inner rim glow, a thin white edge, a pale blue drop shadow below, and fine grain; the blob fades in first, then white text resolves from blur line by line: a main title, a widely tracked small English line, and a second main title, then it holds and keeps breathing.',
    css: `
.S{--sky1:#b9ddf1;--sky2:#97c8e6;--sky3:#5f96cc;background:linear-gradient(var(--sky1),var(--sky2) 52%,var(--sky3))}
.S svg{position:absolute;inset:0;width:100%;height:100%}
.S .blob{animation:K_in 9s ease infinite both;transform-box:view-box;transform-origin:800px 450px}
.S .sh{fill:var(--sky3);opacity:.28}
.S .body{fill:url(#gbBody)}
.S .rim{fill:none;stroke:#fff;stroke-width:2.5;opacity:.38}
.S .ig{fill:none;stroke:#fff;stroke-width:80;opacity:.26}
.S .hi{fill:#fff;opacity:.75}
.S .ca{fill:#fff;opacity:.35}
.S .gr{opacity:.16;mix-blend-mode:overlay}
.S .tx{position:relative;display:flex;flex-direction:column;align-items:center;color:#fff;text-shadow:0 .2cqw .8cqw #0a3a6a33;font-weight:500}
.S .tx span{opacity:0;animation:K_t 9s ease infinite both;animation-delay:calc(1s + var(--i)*.55s)}
.S .t1{font-size:min(11cqw,19cqh);line-height:1.05;letter-spacing:.08em}
.S .t2{font-size:min(2.2cqw,3.8cqh);letter-spacing:.6em;margin:.4em 0 .5em .6em;font-weight:400}
@keyframes K_in{0%{opacity:0;transform:scale(.9)}10%{opacity:1}50%{transform:scale(1.03)}90%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.96)}}
@keyframes K_t{0%{opacity:0;filter:blur(1.2cqw);transform:translateY(25%)}14%,88%{opacity:1;filter:none;transform:none}97%,100%{opacity:0}}`,
    html: (w) => {
      const [a, b, c] = pick(w, 3, ['好好', 'just savor', '生活']);
      const shapes = [0, 0.5, 1.1, 1.6, 0.3].map((ph, i) => blobPath(800, 450, lobes(16, 330, 4, 0.11 + (i % 2) * 0.03, 0.4 + ph * 0.25, 0.08, i + 2), -0.2 + i * 0.05));
      const vals = [...shapes, shapes[0]].join(';');
      return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
<defs>
<path id="gbP" d="${shapes[0]}"><animate attributeName="d" dur="8s" repeatCount="indefinite" values="${vals}" calcMode="spline" keySplines="${rep(5, () => '.45 0 .55 1;').slice(0, -1)}"/></path>
<radialGradient id="gbBody" cx="30%" cy="70%" r="90%"><stop offset="0" stop-color="#f4fbff" stop-opacity=".4"/><stop offset=".5" stop-color="#dff1ff" stop-opacity=".2"/><stop offset="1" stop-color="#cfe8fb" stop-opacity=".14"/></radialGradient>
<clipPath id="gbClip"><use href="#gbP"/></clipPath>
<filter id="gbB30" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="gbB14" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="gbB2"><feGaussianBlur stdDeviation="1.6"/></filter>
<filter id="gbN"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0"/></filter>
</defs>
<g class="blob"><g transform="translate(800 450) scale(1.3 .92) translate(-800 -450)">
<use class="sh" href="#gbP" transform="translate(0 46)" filter="url(#gbB30)"/>
<use class="body" href="#gbP"/>
<g clip-path="url(#gbClip)"><use class="ig" href="#gbP" filter="url(#gbB14)"/><ellipse class="hi" cx="640" cy="250" rx="170" ry="70" transform="rotate(-18 640 250)" filter="url(#gbB30)"/><ellipse class="ca" cx="960" cy="690" rx="200" ry="60" filter="url(#gbB30)"/><rect class="gr" width="1600" height="900" filter="url(#gbN)"/></g>
<use class="rim" href="#gbP" filter="url(#gbB2)"/>
</g></g></svg>
<div class="tx"><span class="t1" style="--i:0">${esc(a)}</span><span class="t2" style="--i:1">${esc(b)}</span><span class="t1" style="--i:2">${esc(c)}</span></div>`;
    },
  },
  {
    id: 'drop-splash',
    no: 22,
    cat: 'liquid',
    zh: '水滴落下',
    en: 'Drop Splash',
    desc: '一滴水落入水面，漣漪擴散後浮出文字',
    tags: ['開場', '清爽'],
    tone: 'paper',
    sample: ['一滴入魂'],
    hint: '2–6 字',
    motion: '畫面下方是淡藍水面、上方是淺色天空；一顆淚滴形水滴從上方加速落下，觸水瞬間濺起幾顆小水珠呈拋物線彈起落回，水面同時擴散三圈橢圓漣漪；接著文字從水面下浮上來（帶輕微晃動與模糊轉清晰），停留後沉回水面。',
    motionEn: 'A pale blue water surface fills the lower frame under a light sky; a teardrop accelerates down from above, and on impact a few small droplets arc up and fall back while three elliptical ripples spread across the surface; the text then rises out of the water with a slight wobble, going from blurred to sharp, holds, and sinks back.',
    css: `${AQ}
.S{background:linear-gradient(color-mix(in srgb,var(--aq) 18%,#fff) 0 62%,color-mix(in srgb,var(--aq) 60%,#fff) 62%,var(--aq) 100%)}
.S .surf{position:absolute;left:0;right:0;top:62%;height:.25cqw;background:#fff9}
.S .drop{position:absolute;left:50%;top:62%;width:3.2cqw;height:4.5cqw;margin:-4.5cqw 0 0 -1.6cqw;animation:K_f 5s cubic-bezier(.55,0,1,.45) infinite both}
.S .drop svg{width:100%;height:100%;display:block;overflow:visible}.S .drop path{fill:var(--aq2)}.S .drop ellipse{fill:#fff;opacity:.8}
.S .rp{position:absolute;left:50%;top:62%;width:16cqw;height:3.4cqw;margin:-1.7cqw 0 0 -8cqw;border:.35cqw solid #fff;border-radius:50%;opacity:0;animation:K_r 5s ease-out infinite;animation-delay:calc(var(--i)*.22s)}
.S .sp{position:absolute;left:50%;top:62%;width:1cqw;height:1cqw;margin:-.5cqw;border-radius:50%;background:var(--aq2);opacity:0;animation:K_sx 5s linear infinite}
.S .sp i{position:absolute;inset:0;border-radius:50%;background:inherit;animation:K_sy 5s infinite}
.S .t{position:absolute;top:28%;font-size:min(10cqw,18cqh);color:var(--aq2);animation:K_t 5s cubic-bezier(.2,.8,.2,1) infinite both;text-shadow:0 .3cqw 0 #fff}
@keyframes K_f{0%{transform:translateY(-62cqh);opacity:1}24%{transform:none;opacity:1}25%,100%{transform:none;opacity:0}}
@keyframes K_r{0%,24%{transform:scale(.1);opacity:0}26%{opacity:1}60%,100%{transform:scale(1.8);opacity:0}}
@keyframes K_sx{0%,24%{transform:none;opacity:0}25%{opacity:1}42%{transform:translateX(var(--x));opacity:1}43%,100%{opacity:0;transform:translateX(var(--x))}}
@keyframes K_sy{0%,24%{transform:none}33%{transform:translateY(var(--y));animation-timing-function:ease-in}42%,100%{transform:none}}
@keyframes K_t{0%,30%{transform:translateY(60%);opacity:0;filter:blur(1cqw)}44%{transform:translateY(-6%);opacity:1;filter:none}50%,82%{transform:none;opacity:1}94%,100%{transform:translateY(60%);opacity:0}}`,
    html: (w) =>
      `<div class="surf"></div><div class="t">${esc(w[0])}</div>${rep(3, (i) => `<i class="rp" style="--i:${i}"></i>`)}${rep(7, (i) => `<i class="sp" style="--x:${((i - 3) * 2.6 + (rand(i) - 0.5) * 2).toFixed(1)}cqw"><i style="--y:${(-6 - rand(i + 4) * 8).toFixed(1)}cqh"></i></i>`)}<div class="drop"><svg viewBox="0 0 40 56"><path d="M20 0C20 0 40 27 40 37A20 19 0 0 1 0 37C0 27 20 0 20 0Z"/><ellipse cx="13" cy="38" rx="4" ry="7"/></svg></div>`,
  },
  {
    id: 'bubbles-rise',
    no: 114,
    cat: 'liquid',
    zh: '泡泡上升',
    en: 'Rising Bubbles',
    desc: '大大小小的泡泡往上飄，中央大泡泡裝著標題',
    tags: ['療癒', '品牌'],
    tone: 'paper',
    sample: ['泡泡時光'],
    hint: '2–6 字',
    motion: '藍色漸層背景中，大小不一的透明玻璃泡泡從下方以不同速度往上飄，並左右輕微擺動；畫面中央一顆大泡泡包著標題，緩慢呼吸並上下浮動，泡泡表面有白色高光與彩虹邊緣反光。',
    motionEn: 'Against a blue gradient, transparent glass bubbles of various sizes drift up from below at different speeds with a gentle side-to-side sway; a large central bubble holds the title, slowly breathing and bobbing, its surface showing white highlights and an iridescent rim.',
    css: `${AQ}${GLASS}
.S{background:linear-gradient(color-mix(in srgb,var(--aq) 40%,#fff),var(--aq2))}
.S .b{position:absolute;bottom:-12%;left:var(--x);width:var(--s);aspect-ratio:1;animation:K_up var(--d) linear infinite;animation-delay:var(--dl)}
.S .b i{display:block;width:100%;height:100%;animation:K_sw calc(var(--d)/3) ease-in-out infinite alternate}
.S .big{position:relative;width:min(44cqw,78cqh);aspect-ratio:1;display:grid;place-items:center;animation:K_br 4s ease-in-out infinite;box-shadow:inset 0 0 0 .3cqw #ffffff66,inset .6cqw -.6cqw 2cqw #ff9ecf44,inset -.6cqw .6cqw 2cqw #8ef0ff55,0 1cqw 3cqw #0a3a6a33}
.S .big b{font-size:min(7cqw,12cqh);color:#fff;text-shadow:0 .2cqw .8cqw #0a3a6a55;font-weight:700}
@keyframes K_up{from{transform:translateY(0)}to{transform:translateY(-130cqh)}}
@keyframes K_sw{from{transform:translateX(-1.4cqw)}to{transform:translateX(1.4cqw)}}
@keyframes K_br{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3%) scale(1.04,.98)}}`,
    html: (w) =>
      `${rep(22, (i) => `<span class="b" style="--x:${(rand(i) * 96).toFixed(1)}%;--s:${(1.2 + rand(i + 2) * 6).toFixed(1)}cqw;--d:${(5 + rand(i + 5) * 7).toFixed(1)}s;--dl:${(-rand(i + 9) * 12).toFixed(1)}s"><i class="gb"></i></span>`)}<div class="big gb"><b>${esc(w[0])}</b></div>`,
  },
  {
    id: 'gooey-merge',
    no: 67,
    cat: 'liquid',
    zh: '液態融合',
    en: 'Gooey Merge',
    desc: '幾顆液滴互相吸引、黏在一起變成標題底',
    tags: ['轉場', '有機'],
    tone: 'ink',
    sample: ['合而為一'],
    hint: '2–6 字',
    motion: '暗色背景中，五顆大小不同的主色液滴從畫面各處漂浮靠近，彼此接觸時像液體一樣黏連融合（SVG 黏液濾鏡），最後聚成一個帶有機邊緣的大色塊，文字在色塊上浮現；停留後液滴再分離散開。',
    motionEn: 'On a dark background, five accent-colored droplets of different sizes drift in from around the frame; where they touch they stick and merge like liquid (SVG goo filter), finally pooling into one large organic-edged blob on which the text appears; after a hold the droplets separate and drift apart.',
    css: `.S svg{position:absolute;inset:0;width:100%;height:100%}
.S .goo{filter:url(#gmF)}
.S .dp{fill:var(--ac);transform-box:fill-box;transform-origin:center;animation:K_m 6s cubic-bezier(.6,0,.3,1) infinite}
.S .t{position:relative;font-size:min(8cqw,14cqh);color:#111;animation:K_t 6s ease infinite both}
@keyframes K_m{0%,8%{transform:translate(var(--x),var(--y)) scale(.8)}45%,72%{transform:none}92%,100%{transform:translate(var(--x),var(--y)) scale(.8)}}
@keyframes K_t{0%,42%{opacity:0;transform:scale(.8)}52%,72%{opacity:1;transform:none}80%,100%{opacity:0;transform:scale(1.1)}}`,
    html: (w) => {
      const drops = [
        [800, 450, 170, -520, -260],
        [700, 430, 110, -760, 300],
        [910, 470, 120, 640, -300],
        [760, 520, 90, 300, 380],
        [880, 400, 80, 720, 260],
      ];
      return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><filter id="gmF"><feGaussianBlur stdDeviation="22"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"/></filter></defs><g class="goo">${drops.map(([x, y, r, dx, dy]) => `<circle class="dp" style="--x:${dx}px;--y:${dy}px" cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g></svg><div class="t">${esc(w[0])}</div>`;
    },
  },
  {
    id: 'water-ripple',
    no: 115,
    cat: 'liquid',
    zh: '水波漣漪',
    en: 'Water Ripple',
    desc: '文字浮在水面，一圈圈漣漪從中心擴散',
    tags: ['療癒', '氛圍'],
    tone: 'paper',
    sample: ['靜心'],
    hint: '1–4 字',
    motion: '俯視的藍色水面，水底有緩慢流動的光紋；文字位於中央，被水波輕微扭曲；每隔 0.8 秒從中心擴散出一圈白色細漣漪，漣漪越往外越淡。',
    motionEn: 'A top-down blue water surface with slowly drifting caustic light below; the text sits at the center, gently warped by the water; every 0.8s a thin white ripple expands from the center, fading as it travels outward.',
    css: `${AQ}
.S{background:radial-gradient(circle at 50% 50%,color-mix(in srgb,var(--aq) 55%,#fff),var(--aq2))}
.S .ca{position:absolute;inset:-20%;background:repeating-radial-gradient(circle at 30% 40%,#ffffff1a 0 1.2cqw,transparent 1.2cqw 4cqw),repeating-radial-gradient(circle at 70% 60%,#ffffff14 0 1cqw,transparent 1cqw 3.4cqw);filter:url(#wrF) blur(.3cqw);animation:K_c 12s linear infinite}
.S .rg{position:absolute;width:20cqmin;aspect-ratio:1;border-radius:50%;border:.3cqmin solid #fff;animation:K_r 4s ease-out infinite;animation-delay:calc(var(--i)*-.8s)}
.S .t{position:relative;font-size:min(14cqw,24cqh);color:#fff;filter:url(#wrT);text-shadow:0 .4cqw 1.4cqw #0a3a6a44;font-family:var(--serif)}
@keyframes K_c{to{transform:translate(6%,4%) rotate(8deg)}}
@keyframes K_r{0%{transform:scale(.4);opacity:.9}100%{transform:scale(6);opacity:0}}`,
    html: (w) =>
      `<svg width="0" height="0" style="position:absolute"><filter id="wrF"><feTurbulence type="turbulence" baseFrequency=".008 .012" numOctaves="2" seed="4"><animate attributeName="baseFrequency" dur="9s" values=".008 .012;.012 .008;.008 .012" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="60"/></filter><filter id="wrT"><feTurbulence type="turbulence" baseFrequency=".02 .05" numOctaves="1" seed="2"><animate attributeName="baseFrequency" dur="5s" values=".02 .05;.03 .03;.02 .05" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="8"/></filter></svg><div class="ca"></div>${rep(5, (i) => `<i class="rg" style="--i:${i}"></i>`)}<div class="t">${esc(w[0])}</div>`,
  },
  {
    id: 'bubble-pop',
    no: 68,
    cat: 'liquid',
    zh: '泡泡破掉換字',
    en: 'Bubble Pop Swap',
    desc: '泡泡吹大後啪一聲破掉，水珠四散、換成下一個詞',
    tags: ['切換', '俏皮'],
    tone: 'paper',
    sample: ['吹泡泡', '啪！'],
    hint: '2 個詞',
    motion: '玻璃泡泡包著第一個詞從小吹大並輕微晃動，到最大時「啪」地破掉：泡泡瞬間放大消失、十顆小水珠向四周噴散，第二個詞在原位彈出；接著新的泡泡吹起包住第二個詞，兩個詞交替循環。',
    motionEn: 'A glass bubble wrapping the first word inflates from small to large with a slight wobble; at full size it pops — the bubble flashes larger and vanishes while ten small droplets spray outward — and the second word springs up in place; a new bubble then inflates around it, and the two words alternate in a loop.',
    css: `${AQ}${GLASS}
.S{background:linear-gradient(color-mix(in srgb,var(--aq) 22%,#fff),color-mix(in srgb,var(--aq) 50%,#fff))}
.S .u{position:absolute;display:grid;place-items:center;width:min(40cqw,70cqh);aspect-ratio:1;animation-delay:calc(var(--i)*-3s)}
.S .u .gb{position:absolute;inset:0;animation:K_b 6s cubic-bezier(.3,1.3,.5,1) infinite;animation-delay:inherit}
.S .u b{position:relative;font-size:min(7cqw,12cqh);color:var(--aq2);animation:K_w 6s cubic-bezier(.3,1.7,.5,1) infinite;animation-delay:inherit}
.S .u .dr{position:absolute;width:1.6cqmin;height:1.6cqmin;border-radius:50%;background:var(--aq);opacity:0;animation:K_d 6s ease-out infinite;animation-delay:inherit}
@keyframes K_b{0%{transform:scale(.2);opacity:0}6%{opacity:1}36%{transform:scale(1)}40%{transform:scale(1.04,.96)}44%{transform:scale(1)}47%{transform:scale(1.18);opacity:.6}48%,100%{transform:scale(1.2);opacity:0}}
@keyframes K_w{0%,2%{transform:scale(0);opacity:0}10%,46%{transform:none;opacity:1}48%,100%{transform:scale(1.3);opacity:0}}
@keyframes K_d{0%,46%{transform:none;opacity:0}47%{opacity:1}60%,100%{transform:translate(var(--x),var(--y));opacity:0}}`,
    html: (w) =>
      pick(w, 2, ['吹泡泡', '啪！'])
        .map(
          (t, i) =>
            `<div class="u" style="--i:${i}"><i class="gb"></i><b>${esc(t)}</b>${rep(10, (k) => {
              const a = (k / 10) * Math.PI * 2;
              return `<i class="dr" style="--x:${(Math.cos(a) * 28).toFixed(1)}cqmin;--y:${(Math.sin(a) * 28).toFixed(1)}cqmin"></i>`;
            })}</div>`,
        )
        .join(''),
  },
];
