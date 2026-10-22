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
      const FONT = '"MA Num", "Chiron Hei HK", "Noto Sans TC", "PingFang TC", sans-serif';
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
      const FONT = '"MA Num", "Chiron Hei HK", "Noto Sans TC", "PingFang TC", sans-serif';
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
];
