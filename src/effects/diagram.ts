import type { Fx } from '../types';
import { esc } from '../util';

// 圖解動畫：工法、剖面這類一支一支客製的示意圖。版面固定為 9:16（橫式畫面會置中），
// 文字可以換；要改圖形本身，請 AI 依 get_effect 的原始碼改寫。全部硬邊，不用陰影或模糊。

const CSS = `.S{background:linear-gradient(180deg,#232730,#16181d)}
.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;

const canvasHtml = (w: string[]) => `<canvas data-w="${esc(JSON.stringify(w))}"></canvas>`;

export const diagram: Fx[] = [
  {
    id: 'layer-section',
    no: 149,
    cat: 'diagram',
    zh: '樓板剖面層疊',
    en: 'Layered Cross-section',
    desc: '立體剖面一層層落下疊起來，左側標出每層名稱與厚度',
    tags: ['工法', '剖面', '建材'],
    tone: 'ink',
    sample: ['制音樓板', '某某建設獨創工法', '裝修材（地板面飾材）|5 公分|wood', '抗裂纖維混凝土壓層|5.5 公分|screed', '防水塑膠布＋抗裂纖維網||membrane', '制震橡膠墊|等距配置|rubber', '制音 EPS 板|2.5 公分|eps', '混凝土樓板|15–20 公分|concrete'],
    hint: '第 1 行標題、第 2 行副標；之後每行一層（由上到下）：名稱|厚度|材質。材質：wood 木地板、screed 纖維混凝土、membrane 防水膜、rubber 橡膠墊、eps 白色隔音板、concrete 混凝土、tile 磁磚、gravel 碎石',
    motion: '深色背景，上方大標題與副標淡入，右上角小字「示意圖」；畫面中央偏右的立體剖面塊（正面、右側面、上面三個面，硬邊實色）由最底層開始，一層層從上方落下並回彈疊起：混凝土（灰色斑點）、白色隔音板、深色橡膠墊顆粒、藍色防水膜、米色纖維混凝土、木紋地板；每層落定後，左側出現白色層名與主色厚度文字，並畫出一條細引線連到該層。',
    motionEn: 'On a dark background a title and subtitle fade in with a small "diagram" tag at top right; an isometric cross-section block (front, right and top faces in flat hard colors) builds from the bottom as each layer drops in from above with a slight bounce — speckled concrete, white insulation board, dark rubber pads, a blue membrane, beige fibre screed and wood flooring; as each layer lands, its name in white and thickness in the accent color appear at the left with a thin leader line to the layer.',
    css: CSS,
    html: canvasHtml,
    run: (root) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      let w: string[] = [];
      try {
        w = JSON.parse(cv.dataset.w || '[]');
      } catch {
        /* 用預設 */
      }
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const AC = getComputedStyle(root).getPropertyValue('--ac').trim() || '#e8833a';
      const FONT = getComputedStyle(root).getPropertyValue('--sans').trim() || 'sans-serif';
      const clamp = (p: number) => Math.max(0, Math.min(1, p));
      const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
      const back = (p: number) => {
        const q = clamp(p) - 1;
        return 1 + 2.2 * q * q * q + 1.2 * q * q;
      };
      // 9:16 版面框，橫式畫面置中
      const bw = Math.min(W, H * 0.5625);
      const bh = bw / 0.5625;
      const ox = (W - bw) / 2;
      const oy = (H - bh) / 2;
      const u = bw / 540;
      const X = (x: number) => ox + x * bw;
      const Y = (y: number) => oy + y * bh;
      const [title = '', sub = '', ...rows] = w;
      const layers = rows.slice(0, 8).map((r) => {
        const [name = '', thick = '', mat = 'concrete'] = r.split('|').map((x) => x.trim());
        return { name, thick, mat: mat || 'concrete' };
      });
      const WT: Record<string, number> = { wood: 1.1, screed: 1.0, membrane: 0.14, rubber: 0.34, eps: 0.42, concrete: 3.2, tile: 0.55, gravel: 1.2 };
      const COL: Record<string, string[]> = {
        wood: ['#a8703c', '#7d5129', '#c48a52'],
        screed: ['#c9c1b0', '#9d9686', '#ddd6c6'],
        membrane: ['#6db3e8', '#4a8cc0', '#a8d6f5'],
        rubber: ['#e6e9ed', '#b4bac2', '#f2f4f6'],
        eps: ['#eef1f4', '#c3c8cf', '#fafbfc'],
        concrete: ['#8e9197', '#686b71', '#a6a9ae'],
        tile: ['#d8d2c4', '#a9a395', '#e8e3d8'],
        gravel: ['#9a8f7f', '#73695b', '#b3a999'],
      };
      const rnd = (k: number) => {
        const x = Math.sin(k * 12.9898) * 43758.5453;
        return x - Math.floor(x);
      };
      // 剖面塊：正面寬、深度位移、總高度
      const fx0 = X(0.33);
      const fw = 0.44 * bw;
      const dx = 0.17 * bw;
      const dy = 0.055 * bh;
      const base = Y(0.8);
      const total = 0.38 * bh;
      const sum = layers.reduce((s, l) => s + (WT[l.mat] ?? 1), 0) || 1;
      const hs = layers.map((l) => (total * (WT[l.mat] ?? 1)) / sum);
      const n = layers.length;
      const L = 0.6 + n * 0.45 + 3.6;
      const t0 = performance.now();
      let raf = 0;
      const face = (pts: number[][], fill: string) => {
        ctx.beginPath();
        pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)));
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1 * u;
        ctx.stroke();
      };
      const texture = (mat: string, x: number, y: number, wd: number, h: number, seed: number) => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, wd, h);
        ctx.clip();
        if (mat === 'wood') {
          ctx.fillStyle = '#7d5129';
          for (let k = 1; k < 4; k++) ctx.fillRect(x, y + (h * k) / 4, wd, 1.2 * u);
        } else if (mat === 'concrete' || mat === 'screed' || mat === 'gravel' || mat === 'eps') {
          const dots = Math.round((wd * h) / (mat === 'eps' ? 900 : 260) / (u * u));
          ctx.fillStyle = mat === 'eps' ? '#c9ced5' : mat === 'screed' ? '#8f8878' : '#6b6e74';
          for (let k = 0; k < dots; k++) ctx.fillRect(x + rnd(seed + k) * wd, y + rnd(seed + k + 0.5) * h, 1.6 * u, 1.6 * u);
          if (mat === 'screed') {
            ctx.strokeStyle = '#f4f0e6';
            ctx.lineWidth = 1 * u;
            for (let k = 0; k < dots / 4; k++) {
              const a = x + rnd(seed + k + 7) * wd;
              const b = y + rnd(seed + k + 9) * h;
              ctx.beginPath();
              ctx.moveTo(a, b);
              ctx.lineTo(a + 8 * u, b + (rnd(k) - 0.5) * 4 * u);
              ctx.stroke();
            }
          }
        } else if (mat === 'rubber') {
          ctx.fillStyle = '#1f2b3d';
          for (let k = 0; k < 5; k++) {
            ctx.beginPath();
            ctx.ellipse(x + wd * (0.1 + k * 0.2), y + h * 0.5, 10 * u, h * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (mat === 'tile') {
          ctx.fillStyle = '#a9a395';
          for (let k = 1; k < 6; k++) ctx.fillRect(x + (wd * k) / 6, y, 1.2 * u, h);
        }
        ctx.restore();
      };
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const t = ((now - t0) / 1000) % L;
        ctx.clearRect(0, 0, W, H);
        ctx.save();
        ctx.globalAlpha = 1 - clamp((t - (L - 0.4)) / 0.4);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const te = ease(t / 0.5);
        ctx.globalAlpha *= te;
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${36 * u}px ${FONT}`;
        ctx.fillText(title, X(0.5), Y(0.12) + (1 - te) * 14 * u);
        ctx.fillStyle = '#c3c7cf';
        ctx.font = `500 ${18 * u}px ${FONT}`;
        ctx.fillText(sub, X(0.5), Y(0.165));
        ctx.font = `500 ${12 * u}px ${FONT}`;
        ctx.textAlign = 'right';
        ctx.fillText('示意圖', X(0.94), Y(0.19));
        ctx.restore();
        // 由下往上疊
        let y = base;
        const tops: number[] = [];
        for (let k = n - 1; k >= 0; k--) {
          const l = layers[k];
          const h = hs[k];
          const bi = n - 1 - k;
          const st = t - 0.6 - bi * 0.45;
          y -= h;
          tops[k] = y;
          if (st <= 0) continue;
          const off = (1 - back(st / 0.5)) * -0.12 * bh;
          const yy = y + off;
          const c = COL[l.mat] ?? COL.concrete;
          ctx.save();
          ctx.globalAlpha = clamp(st / 0.12) * (1 - clamp((t - (L - 0.4)) / 0.4));
          face([[fx0 + fw, yy], [fx0 + fw + dx, yy - dy], [fx0 + fw + dx, yy + h - dy], [fx0 + fw, yy + h]], c[1]);
          face([[fx0, yy], [fx0 + dx, yy - dy], [fx0 + fw + dx, yy - dy], [fx0 + fw, yy]], c[2]);
          face([[fx0, yy], [fx0 + fw, yy], [fx0 + fw, yy + h], [fx0, yy + h]], c[0]);
          texture(l.mat, fx0, yy, fw, h, k * 97 + 3);
          if (l.mat === 'membrane') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(fx0, yy, fw, 1.2 * u);
          }
          ctx.restore();
        }
        // 標籤：左側均分，細引線連到各層正面
        const ly0 = Y(0.3);
        const ly1 = Y(0.64);
        layers.forEach((l, k) => {
          const bi = n - 1 - k;
          const st = t - 0.6 - bi * 0.45 - 0.35;
          if (st <= 0) return;
          const e = ease(st / 0.35);
          const ly = n > 1 ? ly0 + ((ly1 - ly0) * k) / (n - 1) : (ly0 + ly1) / 2;
          ctx.save();
          ctx.globalAlpha = e * (1 - clamp((t - (L - 0.4)) / 0.4));
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          ctx.font = `800 ${13 * u}px ${FONT}`;
          ctx.fillText(l.name, X(0.07), ly);
          if (l.thick) {
            ctx.fillStyle = AC;
            ctx.font = `800 ${13 * u}px ${FONT}`;
            ctx.fillText(l.thick, X(0.07), ly + 19 * u);
          }
          const sx = X(0.3);
          const sy = ly + 6 * u;
          const tx = fx0 + 6 * u;
          const ty = tops[k] + hs[k] / 2;
          ctx.strokeStyle = 'rgba(255,255,255,0.55)';
          ctx.lineWidth = 1.2 * u;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + (tx - sx) * e, sy + (ty - sy) * e);
          ctx.stroke();
          ctx.restore();
        });
      };
      raf = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    id: 'drain-section',
    no: 150,
    cat: 'diagram',
    zh: '同層排水剖面',
    en: 'Same-floor Drainage Section',
    desc: '上下兩層的剖面圖，示意浴室管線留在自家樓板裡、水流往管道間',
    tags: ['工法', '剖面', '浴室'],
    tone: 'ink',
    sample: ['同層排水＋一體式衛浴', '管線留在自家樓板裡', '一體式衛浴', '自家浴室', '臥室', '樓下浴室', '樓下臥室', '管道間', '結構樓板', '樓下浴室天花板較低', '地板・牆面・天花板'],
    hint: '依序：標題、副標、橘色標籤、自家浴室、臥室、樓下浴室、樓下臥室、管道間、結構樓板、下方註記、浴室框內文字。圖形固定，要改構圖請 AI 改寫原始碼',
    motion: '深色背景的上下兩層剖面圖：標題與副標淡入，接著各房間的深灰色塊、牆與右側管道間出現，斜線填色的結構樓板從側邊滑入（浴室下方樓板降低）；橘色外框的一體式衛浴框沿邊畫出，白色馬桶彈出；橘色排水管從馬桶下方畫到管道間，管內藍色虛線持續往管道間流動；最後各房間名稱與下方「↑ 樓下浴室天花板較低」註記依序出現。全部硬邊。',
    motionEn: 'A two-storey cross-section on a dark background: the title and subtitle fade in, then dark grey room blocks, walls and a service shaft on the right appear and the hatched structural slab slides in (dropped under the bathroom); an orange-outlined prefab bathroom unit draws itself and a white toilet pops in; an orange drain pipe draws from under the toilet to the shaft with blue dashes flowing inside towards the shaft; finally room names and a note about the lower ceiling below appear in turn. All hard-edged.',
    css: CSS,
    html: canvasHtml,
    run: (root) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      let w: string[] = [];
      try {
        w = JSON.parse(cv.dataset.w || '[]');
      } catch {
        /* 用預設 */
      }
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const AC = getComputedStyle(root).getPropertyValue('--ac').trim() || '#e8833a';
      const FONT = getComputedStyle(root).getPropertyValue('--sans').trim() || 'sans-serif';
      const clamp = (p: number) => Math.max(0, Math.min(1, p));
      const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
      const back = (p: number) => {
        const q = clamp(p) - 1;
        return 1 + 2.4 * q * q * q + 1.4 * q * q;
      };
      const bw = Math.min(W, H * 0.5625);
      const bh = bw / 0.5625;
      const ox = (W - bw) / 2;
      const oy = (H - bh) / 2;
      const u = bw / 540;
      const X = (x: number) => ox + x * bw;
      const Y = (y: number) => oy + y * bh;
      const d = ['同層排水＋一體式衛浴', '管線留在自家樓板裡', '一體式衛浴', '自家浴室', '臥室', '樓下浴室', '樓下臥室', '管道間', '結構樓板', '樓下浴室天花板較低', '地板・牆面・天花板'];
      const T = d.map((x, i) => (w[i] !== undefined ? w[i] : x));
      const L = 8;
      const t0 = performance.now();
      let raf = 0;
      const rect = (x0: number, y0: number, x1: number, y1: number, fill: string) => {
        ctx.fillStyle = fill;
        ctx.fillRect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0));
      };
      const hatch = (x0: number, y0: number, x1: number, y1: number) => {
        rect(x0, y0, x1, y1, '#5a5e66');
        ctx.save();
        ctx.beginPath();
        ctx.rect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0));
        ctx.clip();
        ctx.strokeStyle = '#757a83';
        ctx.lineWidth = 2 * u;
        for (let x = X(x0) - 60 * u; x < X(x1) + 60 * u; x += 9 * u) {
          ctx.beginPath();
          ctx.moveTo(x, Y(y1));
          ctx.lineTo(x + (Y(y1) - Y(y0)), Y(y0));
          ctx.stroke();
        }
        ctx.restore();
      };
      const label = (text: string, x: number, y: number, size: number, color = '#ffffff', align: CanvasTextAlign = 'left', a = 1) => {
        if (!text || a <= 0) return;
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.fillStyle = color;
        ctx.font = `800 ${size * u}px ${FONT}`;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, X(x), Y(y));
        ctx.restore();
      };
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const t = ((now - t0) / 1000) % L;
        ctx.clearRect(0, 0, W, H);
        ctx.save();
        ctx.globalAlpha = 1 - clamp((t - (L - 0.4)) / 0.4);
        // 標題
        const te = ease(t / 0.5);
        ctx.save();
        ctx.globalAlpha *= te;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${36 * u}px ${FONT}`;
        ctx.fillText(T[0], X(0.5), Y(0.12) + (1 - te) * 14 * u);
        ctx.fillStyle = '#c3c7cf';
        ctx.font = `500 ${18 * u}px ${FONT}`;
        ctx.fillText(T[1], X(0.5), Y(0.163));
        ctx.font = `500 ${12 * u}px ${FONT}`;
        ctx.textAlign = 'right';
        ctx.fillText('示意圖', X(0.94), Y(0.185));
        ctx.restore();
        // 房間、牆、管道間
        const re = ease((t - 0.4) / 0.5);
        ctx.save();
        ctx.globalAlpha *= re;
        rect(0.1, 0.25, 0.8, 0.8, '#2b2f37');
        rect(0.355, 0.33, 0.37, 0.55, '#6b7079');
        rect(0.355, 0.64, 0.37, 0.8, '#6b7079');
        rect(0.81, 0.25, 0.88, 0.8, '#5b5f68');
        ctx.restore();
        // 樓板：左側一般樓板、浴室下方降板，中間是排管的填充層
        const se = ease((t - 0.8) / 0.6);
        ctx.save();
        ctx.globalAlpha *= se;
        ctx.translate((1 - se) * -60 * u, 0);
        hatch(0.065, 0.545, 0.36, 0.585);
        rect(0.36, 0.545, 0.81, 0.6, '#454a53');
        hatch(0.36, 0.6, 0.81, 0.64);
        ctx.restore();
        // 樓下浴室的天花板（較低）
        if (t > 1.3) rect(0.37, 0.648, 0.8, 0.654, `rgba(220,224,230,${ease((t - 1.3) / 0.4)})`);
        // 一體式衛浴框：沿邊畫出
        const be = clamp((t - 1.3) / 0.8);
        if (be > 0) {
          const x0 = X(0.385);
          const y0 = Y(0.335);
          const x1 = X(0.785);
          const y1 = Y(0.545);
          ctx.save();
          ctx.globalAlpha *= ease(be / 0.3);
          ctx.fillStyle = '#3a3330';
          ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
          ctx.restore();
          const per = 2 * (x1 - x0 + (y1 - y0));
          ctx.strokeStyle = AC;
          ctx.lineWidth = 5 * u;
          ctx.setLineDash([per * ease(be), per + 1]);
          ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
          ctx.setLineDash([]);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2 * u;
          ctx.globalAlpha *= ease((be - 0.6) / 0.4);
          ctx.strokeRect(x0 + 5 * u, y0 + 5 * u, x1 - x0 - 10 * u, y1 - y0 - 10 * u);
          ctx.globalAlpha = 1 - clamp((t - (L - 0.4)) / 0.4);
          label(T[10], 0.585, 0.375, 13, '#ffffff', 'center', ease((t - 2) / 0.4));
        }
        // 馬桶
        const ts = back((t - 1.9) / 0.5);
        if (t > 1.9) {
          ctx.save();
          ctx.translate(X(0.55), Y(0.545));
          ctx.scale(ts, ts);
          ctx.fillStyle = '#e9ecf0';
          ctx.beginPath();
          ctx.roundRect(-75 * u, -122 * u, 32 * u, 70 * u, 8 * u);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-50 * u, -60 * u);
          ctx.lineTo(40 * u, -60 * u);
          ctx.quadraticCurveTo(40 * u, -10 * u, -5 * u, -5 * u);
          ctx.lineTo(-10 * u, 0);
          ctx.lineTo(-40 * u, 0);
          ctx.lineTo(-35 * u, -30 * u);
          ctx.quadraticCurveTo(-50 * u, -40 * u, -50 * u, -60 * u);
          ctx.fill();
          ctx.fillStyle = '#b7bcc4';
          ctx.fillRect(-48 * u, -66 * u, 88 * u, 7 * u);
          ctx.restore();
        }
        // 排水管：馬桶下方 → 填充層 → 管道間；管內藍色虛線往管道間流
        const pe = clamp((t - 2.4) / 0.8);
        if (pe > 0) {
          const pts = [
            [X(0.55), Y(0.545)],
            [X(0.55), Y(0.575)],
            [X(0.83), Y(0.575)],
          ];
          const pts2 = [
            [X(0.7), Y(0.545)],
            [X(0.7), Y(0.575)],
          ];
          const draw = (p: number[][], k: number, wd: number, col: string, dash?: number[]) => {
            const seg = p.slice(1).map((q, i) => Math.hypot(q[0] - p[i][0], q[1] - p[i][1]));
            const tot = seg.reduce((a, b) => a + b, 0);
            ctx.save();
            ctx.strokeStyle = col;
            ctx.lineWidth = wd;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.setLineDash(dash ?? [tot * k, tot + 1]);
            if (dash) ctx.lineDashOffset = -t * 40 * u;
            ctx.beginPath();
            p.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)));
            ctx.stroke();
            ctx.restore();
          };
          draw(pts, ease(pe), 11 * u, AC);
          draw(pts2, ease(pe), 11 * u, AC);
          if (pe >= 1) {
            draw(pts, 1, 4 * u, '#8fd0ff', [10 * u, 8 * u]);
            draw(pts2, 1, 4 * u, '#8fd0ff', [10 * u, 8 * u]);
          }
        }
        // 文字標籤
        const la = (k: number) => ease((t - 2.8 - k * 0.15) / 0.35);
        if (T[2]) {
          const a = back((t - 2.6) / 0.4);
          if (t > 2.6) {
            ctx.save();
            ctx.translate(X(0.385), Y(0.215));
            ctx.scale(a, a);
            ctx.font = `900 ${16 * u}px ${FONT}`;
            const tw = ctx.measureText(T[2]).width + 30 * u;
            ctx.fillStyle = AC;
            ctx.beginPath();
            ctx.roundRect(0, -16 * u, tw, 32 * u, 16 * u);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'middle';
            ctx.fillText(T[2], 15 * u, 1 * u);
            ctx.restore();
          }
        }
        label(T[4], 0.13, 0.28, 15, '#cfd3da', 'left', la(0));
        label(T[3], 0.4, 0.28, 15, '#ffffff', 'left', la(1));
        label(T[6], 0.13, 0.725, 15, '#cfd3da', 'left', la(2));
        label(T[5], 0.4, 0.725, 15, '#ffffff', 'left', la(3));
        label(T[8], 0.075, 0.566, 12, '#d6d9de', 'left', la(4));
        if (T[7]) {
          const a = la(5);
          ctx.save();
          ctx.globalAlpha *= a;
          ctx.translate(X(0.92), Y(0.52));
          ctx.rotate(Math.PI / 2);
          ctx.fillStyle = '#cfd3da';
          ctx.font = `800 ${14 * u}px ${FONT}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(T[7], 0, 0);
          ctx.restore();
        }
        if (T[9]) label(`↑ ${T[9]}`, 0.4, 0.675, 13, '#cfd3da', 'left', la(6));
        ctx.restore();
      };
      raf = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    id: 'precast-process',
    no: 157,
    cat: 'diagram',
    zh: '預鑄工法流程',
    en: 'Precast Construction Process',
    desc: '依參考圖重繪：工廠預鑄柱、梁與樓板，現場吊裝組合，再澆築結合',
    tags: ['工法', '流程', '預鑄', '結構'],
    tone: 'paper',
    duration: 12,
    added: '2026-10-22',
    sample: ['預鑄工法示意圖', '從工廠製作到現場結合', '工廠預鑄', '現場組裝', '澆築結合', '預鑄柱', '預鑄梁', '預鑄樓板', '澆築混凝土', '柱、梁與樓板在工廠製作', '吊裝構件，依序組合', '澆築混凝土，結合構件', '依使用者提供參考圖重繪', '流程與構件比例為示意', '工法流程'],
    hint: '依序：標題、副標、工廠階段名、組裝階段名、澆築階段名、柱名稱、梁名稱、樓板名稱、澆築材料名稱、工廠說明、組裝說明、澆築說明、來源註記、示意註記、頁首小標。可留空隱藏；不預設尺寸、強度或施工規格。完整循環 12 秒。',
    motion: '以使用者提供的預鑄工法參考圖重繪為 9:16 直式流程圖，淺色平底、藍色標題、三個上下排列的硬邊框。上框先依序呈現帶外露鋼筋的預鑄柱、梁、網格樓板；中框的柱立起、梁由上方吊入，外牆板與樓板依序落定，吊索在構件就位後消失；下框顯示已組裝構架，淺藍色混凝土沿樓板逐步鋪展、填入接合縫，最後停留完整構造。構件採三面實色等角繪圖，不用陰影、模糊或光暈；文字由 words 讀取，不顯示未提供的尺寸或規格。',
    motionEn: 'Redraw the supplied precast-process reference as a portrait 9:16 diagram: a pale flat background, blue title and three vertically stacked hard-edged panels. First show a precast column, beam and gridded slab with exposed reinforcement. Next erect columns, lower beams on temporary lifting lines, then seat wall and slab panels. Finally reveal a pale-blue concrete topping across the assembled slab and its joints, holding the completed structure. Isometric faces use flat colors, with no shadows, blur or glow. All labels come from words; no inferred engineering dimensions or specifications.',
    css: `${CSS}\n.S{background:#f2f7fa}`,
    html: canvasHtml,
    run: (root) => {
      // 必須自給自足：HTML 匯出與 Combo 會直接內嵌這支函式。
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const defaults = ['預鑄工法示意圖', '從工廠製作到現場結合', '工廠預鑄', '現場組裝', '澆築結合', '預鑄柱', '預鑄梁', '預鑄樓板', '澆築混凝土', '柱、梁與樓板在工廠製作', '吊裝構件，依序組合', '澆築混凝土，結合構件', '依使用者提供參考圖重繪', '流程與構件比例為示意', '工法流程'];
      let words: unknown[] = [];
      try {
        const parsed: unknown = JSON.parse(cv.dataset.w || '[]');
        if (Array.isArray(parsed)) words = parsed;
      } catch { /* 不完整的設定使用預設文字 */ }
      const T = defaults.map((text, i) => typeof words[i] === 'string' ? String(words[i]).slice(0, 180) : text);
      const FONT = getComputedStyle(root).getPropertyValue('--sans').trim() || 'sans-serif';
      const BLUE = '#009bd5';
      const NAVY = '#123f64';
      const INK = '#294353';
      const clamp = (p: number) => Math.max(0, Math.min(1, p));
      const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      const L = 12;
      let W = 1, H = 1, raf = 0, elapsed = 0, last = performance.now(), stopped = false;
      type Point = [number, number];
      // 以下尺寸僅為繪圖座標，不代表工程尺寸或構件比例。
      let origin: Point = [0, 0];
      let scale = 1;
      const project = (x: number, y: number, z: number): Point => [origin[0] + (x - y) * scale, origin[1] + (x + y) * 0.32 * scale - z * scale];
      const polygon = (points: Point[], fill: string, stroke = '#466172', width = 1) => {
        ctx.beginPath();
        points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        if (width > 0) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
      };
      const line = (points: Point[], color = INK, width = 1) => {
        ctx.beginPath();
        points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
      };
      const block = (x: number, y: number, z: number, a: number, b: number, h: number, colors = ['#e6ecf0', '#aabac5', '#c3cfd7']) => {
        polygon([project(x + a, y, z), project(x + a, y + b, z), project(x + a, y + b, z + h), project(x + a, y, z + h)], colors[1]);
        polygon([project(x, y + b, z), project(x + a, y + b, z), project(x + a, y + b, z + h), project(x, y + b, z + h)], colors[2]);
        polygon([project(x, y, z + h), project(x + a, y, z + h), project(x + a, y + b, z + h), project(x, y + b, z + h)], colors[0]);
      };
      const mesh = (x: number, y: number, z: number, a: number, b: number, spacing = 10) => {
        for (let u = 5; u < a; u += spacing) line([project(x + u, y, z), project(x + u, y + b, z)], '#688192', 0.7);
        for (let v = 5; v < b; v += spacing) line([project(x, y + v, z), project(x + a, y + v, z)], '#688192', 0.7);
      };
      const rebar = (x: number, y: number, z: number, a: number, b: number) => {
        for (const [u, v] of [[4, 4], [a - 4, 4], [4, b - 4], [a - 4, b - 4]]) line([project(x + u, y + v, z), project(x + u, y + v, z + 15)], INK, 1.6);
      };
      const label = (text: string, x: number, y: number, size: number, width: number, color = INK, align: CanvasTextAlign = 'left', weight = 700) => {
        if (!text) return;
        ctx.save(); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
        let fs = size;
        ctx.font = `${weight} ${fs}px ${FONT}`;
        while (ctx.measureText(text).width > width && fs > size * 0.65) { fs -= 0.5; ctx.font = `${weight} ${fs}px ${FONT}`; }
        ctx.fillText(text, x, y, width);
        ctx.restore();
      };
      const panel = (y: number, index: number, progress: number) => {
        ctx.fillStyle = '#ffffff'; ctx.fillRect(27, y, 486, 218);
        ctx.strokeStyle = progress > 0 ? '#83c8e1' : '#d4e1e9'; ctx.lineWidth = 1.5; ctx.strokeRect(27, y, 486, 218);
        ctx.fillStyle = progress > 0 ? BLUE : '#c3d6e2'; ctx.fillRect(43, y + 18, 4, 23);
        label(T[2 + index], 58, y + 30, 22, 425, NAVY, 'left', 900);
        label(T[9 + index], 45, y + 55, 12, 450, '#637d8e', 'left', 500);
      };
      const arrow = (y: number, ready: boolean) => polygon([[265, y], [275, y], [275, y + 4], [280, y + 4], [270, y + 12], [260, y + 4], [265, y + 4]], ready ? BLUE : '#bdceda', '', 0);
      const factory = (t: number) => {
        const starts = [0.25, 0.6, 0.95];
        for (let i = 0; i < 3; i++) {
          const p = ease((t - starts[i]) / 0.6);
          if (p <= 0) continue;
          ctx.save();
          ctx.beginPath(); ctx.rect(42, 195, 456, 122); ctx.clip();
          if (i === 0) {
            origin = [94, 277 - 24 * (1 - p)]; scale = 0.95;
            block(0, 0, 0, 26, 26, 64); rebar(0, 0, 64, 26, 26);
          } else if (i === 1) {
            origin = [214, 270 - 24 * (1 - p)]; scale = 0.95;
            block(0, 0, 0, 96, 20, 19); mesh(0, 0, 20, 96, 20, 10);
            for (let j = 8; j < 96; j += 15) line([project(j, 4, 19), project(j, 4, 27), project(j, 16, 27), project(j, 16, 19)], INK, 1.2);
          } else {
            origin = [367, 263 - 24 * (1 - p)]; scale = 0.82;
            block(0, 0, 0, 115, 70, 7); mesh(0, 0, 8, 115, 70, 11);
          }
          ctx.restore();
        }
        label(T[5], 94, 329, 14, 120, INK, 'center');
        label(T[6], 250, 329, 14, 130, INK, 'center');
        label(T[7], 386, 329, 14, 150, INK, 'center');
      };
      const building = (y: number, t: number, casting: boolean) => {
        if (t <= 0) return;
        ctx.save(); ctx.beginPath(); ctx.rect(43, y + 63, 454, 148); ctx.clip();
        origin = [240, y + 128]; scale = 0.75;
        const incoming = (start: number, duration = 0.65) => casting ? 1 : ease((t - start) / duration);
        const posts: Point[] = [[0, 0], [192, 0], [0, 92], [192, 92]];
        posts.forEach(([x, z], i) => {
          const p = incoming(i * 0.12, 0.45);
          if (p > 0) block(x, z, 0, 18, 18, 66 * p);
        });
        const beams = [[0, 0, 210, 18], [0, 92, 210, 18], [0, 18, 18, 74], [192, 18, 18, 74]];
        beams.forEach(([x, z, a, b], i) => {
          const p = incoming(0.65 + i * 0.12);
          if (p <= 0) return;
          const off = (1 - p) * 52;
          block(x, z, 66 + off, a, b, 10, ['#dbe5eb', '#8ba2b3', '#b0c2ce']);
          if (p < 1) {
            const left = project(x + a * 0.2, z + b * 0.5, 76 + off);
            const right = project(x + a * 0.8, z + b * 0.5, 76 + off);
            const top: Point = [(left[0] + right[0]) / 2, Math.min(left[1], right[1]) - 32];
            line([left, top, right], '#ca9f41', 1.2);
          }
        });
        // 外圍牆板只畫示意開口，不表示門窗或結構的實際尺寸。
        const walls = incoming(1.25);
        if (walls > 0) {
          const h = 43 * walls;
          block(18, 103, 0, 174, 7, h, ['#e6ecf0', '#a7b9c5', '#c5d1da']);
          for (let x = 30; x < 180; x += 39) polygon([project(x, 110.3, 17), project(x + 17, 110.3, 17), project(x + 17, 110.3, 33), project(x, 110.3, 33)], '#f5fbfd', '#7992a2', 0.8);
          block(203, 18, 0, 7, 74, h, ['#e6ecf0', '#a7b9c5', '#c5d1da']);
          for (let z = 30; z < 85; z += 28) polygon([project(210.3, z, 17), project(210.3, z + 13, 17), project(210.3, z + 13, 33), project(210.3, z, 33)], '#f5fbfd', '#7992a2', 0.8);
        }
        for (let i = 0; i < 4; i++) {
          const p = incoming(1.6 + i * 0.28);
          if (p <= 0) continue;
          const z = 76 + (1 - p) * 58;
          block(18 + i * 43.5, 18, z, 42, 74, 6, ['#d9e3e9', '#9aafbd', '#b7c9d4']);
          mesh(18 + i * 43.5, 18, z + 6.2, 42, 74, 9);
        }
        if (casting) {
          const p = ease((t - 0.55) / 2.1);
          if (p > 0) {
            const a = 210 * p;
            block(0, 0, 82, a, 110, 5, ['#bde7f4', '#79b5cb', '#91c6d8']);
            line([project(a, 0, 87.2), project(a, 110, 87.2)], BLUE, 2);
          }
        }
        ctx.restore();
      };
      const draw = (t: number) => {
        const bw = Math.min(W, H * 9 / 16);
        const s = bw / 540;
        ctx.clearRect(0, 0, W, H);
        ctx.save(); ctx.translate((W - bw) / 2, (H - s * 960) / 2); ctx.scale(s, s);
        ctx.fillStyle = '#f2f7fa'; ctx.fillRect(0, 0, 540, 960);
        label(T[14], 270, 25, 12, 470, BLUE, 'center', 800);
        label(T[0], 270, 66, 35, 480, BLUE, 'center', 900);
        label(T[1], 270, 104, 15, 470, '#637d8e', 'center', 500);
        panel(130, 0, t > 0.2 ? 1 : 0);
        panel(366, 1, t > 2.3 ? 1 : 0);
        panel(602, 2, t > 6.2 ? 1 : 0);
        factory(t);
        arrow(351, t >= 2.3); arrow(587, t >= 6.2);
        building(366, t - 2.3, false);
        building(602, t - 6.2, true);
        if (t > 6.75) {
          label(T[8], 470, 793, 11, 175, NAVY, 'right');
        }
        const progress = [clamp(t / 2.3), clamp((t - 2.3) / 3.9), clamp((t - 6.2) / 2.65)];
        for (let i = 0; i < 3; i++) {
          const x = 35 + i * 170;
          ctx.fillStyle = '#d6e3eb'; ctx.fillRect(x, 847, 130, 3);
          ctx.fillStyle = BLUE; ctx.fillRect(x, 847, 130 * progress[i], 3);
          label(T[2 + i], x + 65, 866, 12, 145, NAVY, 'center');
        }
        label(T[13], 270, 903, 12, 480, '#637d8e', 'center', 500);
        label(T[12], 270, 925, 11, 480, '#637d8e', 'center', 500);
        ctx.restore();
      };
      const resize = () => {
        const dpr = Math.min(2, devicePixelRatio || 1);
        W = cv.width = Math.max(1, Math.round(cv.clientWidth * dpr));
        H = cv.height = Math.max(1, Math.round(cv.clientHeight * dpr));
        draw(reduced.matches ? 10.5 : elapsed % L);
      };
      const frame = (now: number) => {
        if (stopped) return;
        const speed = Number(root.dataset.motionSpeed ?? 1);
        elapsed += Math.max(0, now - last) / 1000 * (Number.isFinite(speed) && speed >= 0 ? speed : 1); last = now;
        draw(elapsed % L);
        raf = requestAnimationFrame(frame);
      };
      const onMotion = () => {
        cancelAnimationFrame(raf);
        last = performance.now();
        if (reduced.matches) draw(10.5);
        else raf = requestAnimationFrame(frame);
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(cv);
      reduced.addEventListener('change', onMotion);
      if (!reduced.matches) raf = requestAnimationFrame(frame);
      return () => {
        stopped = true; cancelAnimationFrame(raf); observer.disconnect(); reduced.removeEventListener('change', onMotion);
      };
    },
  },
];
