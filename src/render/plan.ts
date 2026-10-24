// plankit.ts 的繪製引擎（自給自足，會被序列化進匯出的 HTML）。第一次用到才載入，主程式不打包。
import { fnSource } from '../engine';
import { registerEngine } from '../engines';
import { FONTS_GLOBALS } from '../fonts';


/** 繪製引擎工廠（自給自足，匯出時用 toString） */
export const planRenderer = () => {
  type Img = (HTMLImageElement | HTMLCanvasElement | ImageBitmap) & { width: number; height: number };
  type Room = { name: string; sub?: string; pts: number[][] };
  type Scene = {
    ratio: string; mode: string; bg: string; images: string[]; rooms: Room[]; rooms2: Room[]; path: number[][]; target: number;
    title: string; sub: string; labelA: string; labelB: string; dimW: string; dimH: string;
    params: { color: string; dim: number; note: number; speed: number; walls: number }; crops?: (number[] | null)[]; font?: string;
  };
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
  const inout = (p: number) => {
    const q = clamp(p);
    return q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
  };
  const back = (p: number) => {
    const q = clamp(p) - 1;
    return 1 + 2.4 * q * q * q + 1.4 * q * q;
  };
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const FONT = '"MA Num", "Chiron Hei HK", "Noto Sans TC", "PingFang TC", sans-serif';
  const NOTE = '本圖面僅供參考，實際依買賣合約書附圖為準';
  const hex = (c: string) => {
    const h = c.replace('#', '');
    const f = h.length === 3 ? h.split('').map((x) => x + x).join('') : h.slice(0, 6);
    const n = parseInt(f, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgba = (c: string, a: number) => (/^#/.test(c) ? `rgba(${hex(c).join(',')},${a})` : c);
  const lum = (c: string) => {
    if (!/^#/.test(c)) return 255;
    const [r, g, b] = hex(c);
    return r * 0.299 + g * 0.587 + b * 0.114;
  };

  /* 內建虛構示意圖：程式畫出來，網站示範與沒放圖時使用 */
  const sampleCache = new Map<string, HTMLCanvasElement>();
  const sample = (name: string): HTMLCanvasElement | null => {
    if (typeof document === 'undefined') return null;
    const hit = sampleCache.get(name);
    if (hit) return hit;
    const W = name === 'unitB' ? 800 : 1000;
    const H = 1000;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d')!;
    const X = (v: number) => (v / 100) * W;
    const Y = (v: number) => (v / 100) * H;
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, W, H);
    const wood = (x0: number, y0: number, x1: number, y1: number, vert = true) => {
      g.fillStyle = '#d9c7ad';
      g.fillRect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0));
      g.fillStyle = 'rgba(120,90,60,0.12)';
      if (vert) for (let x = X(x0); x < X(x1); x += 14) g.fillRect(x, Y(y0), 1.5, Y(y1) - Y(y0));
      else for (let y = Y(y0); y < Y(y1); y += 14) g.fillRect(X(x0), y, X(x1) - X(x0), 1.5);
    };
    const tile = (x0: number, y0: number, x1: number, y1: number, col = '#dcd9d2') => {
      g.fillStyle = col;
      g.fillRect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0));
      g.fillStyle = 'rgba(0,0,0,0.07)';
      for (let x = X(x0); x < X(x1); x += 34) g.fillRect(x, Y(y0), 1.5, Y(y1) - Y(y0));
      for (let y = Y(y0); y < Y(y1); y += 34) g.fillRect(X(x0), y, X(x1) - X(x0), 1.5);
    };
    const box = (x0: number, y0: number, x1: number, y1: number, fill = '#ffffff', line = '#8a8478') => {
      g.fillStyle = fill;
      g.fillRect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0));
      g.strokeStyle = line;
      g.lineWidth = 2;
      g.strokeRect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0));
    };
    const circ = (x: number, y: number, r: number, fill = '#ffffff', line = '#8a8478') => {
      g.fillStyle = fill;
      g.strokeStyle = line;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(X(x), Y(y), (r / 100) * W, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    };
    const bed = (x0: number, y0: number, x1: number, y1: number) => {
      box(x0, y0, x1, y1);
      const pw = (x1 - x0) / 2 - 1.5;
      box(x0 + 1, y0 + 1, x0 + 1 + pw, y0 + 5, '#f2f0eb');
      box(x1 - 1 - pw, y0 + 1, x1 - 1, y0 + 5, '#f2f0eb');
      g.strokeStyle = '#b8b2a6';
      g.beginPath();
      g.moveTo(X(x0), Y(y0 + 8));
      g.lineTo(X(x1), Y(y0 + 8));
      g.stroke();
    };
    const walls = (rects: number[][], outer: number[]) => {
      g.strokeStyle = '#2b2b2b';
      g.lineWidth = 9;
      g.lineJoin = 'miter';
      rects.forEach(([x0, y0, x1, y1]) => g.strokeRect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0)));
      g.lineWidth = 18;
      g.strokeRect(X(outer[0]), Y(outer[1]), X(outer[2]) - X(outer[0]), Y(outer[3]) - Y(outer[1]));
      // 結構柱
      g.fillStyle = '#2b2b2b';
      [[outer[0], outer[1]], [outer[2], outer[1]], [outer[0], outer[3]], [outer[2], outer[3]]].forEach(([x, y]) => g.fillRect(X(x) - 22, Y(y) - 22, 44, 44));
    };
    const door = (x: number, y: number, r: number, a0: number) => {
      g.fillStyle = '#ffffff';
      g.strokeStyle = '#8a8478';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(X(x), Y(y));
      g.arc(X(x), Y(y), (r / 100) * W, a0, a0 + Math.PI / 2);
      g.closePath();
      g.stroke();
    };
    if (name === 'unitA') {
      const rooms = [[5, 5, 40, 40], [40, 5, 70, 32], [70, 5, 95, 32], [40, 32, 95, 62], [5, 40, 22, 62], [22, 40, 40, 62], [5, 62, 40, 90], [40, 62, 55, 90], [55, 62, 95, 90]];
      wood(5, 5, 40, 40);
      wood(40, 5, 70, 32);
      wood(70, 5, 95, 32);
      wood(40, 32, 95, 62, false);
      wood(55, 62, 95, 90, false);
      tile(5, 40, 22, 62);
      tile(22, 40, 40, 62);
      tile(5, 62, 40, 90, '#e4e1da');
      tile(40, 62, 55, 90, '#cfcbc2');
      bed(11, 10, 33, 30);
      bed(46, 8, 62, 22);
      box(73, 8, 92, 13);
      circ(82, 18, 2.5);
      box(70, 50, 92, 58, '#f6f4ef');
      box(70, 44, 74, 50, '#f6f4ef');
      circ(80, 43, 3.2);
      box(41, 36, 42.5, 54, '#ffffff', '#2b2b2b');
      box(64, 70, 86, 81);
      [66, 72, 78, 84].forEach((x) => (circ(x, 68, 1.6), circ(x, 83, 1.6)));
      box(7, 80, 38, 88, '#f2f0eb');
      circ(14, 84, 2);
      circ(20, 84, 2);
      box(28, 81, 35, 87, '#ffffff');
      box(7, 42, 20, 49, '#ffffff');
      circ(14, 57, 2.2);
      circ(31, 57, 2.2);
      box(24, 42, 38, 46, '#ffffff');
      walls(rooms, [5, 5, 95, 90]);
      door(40, 30, 6, Math.PI);
      door(70, 30, 6, -Math.PI / 2);
      door(40, 52, 5, Math.PI / 2);
      // 入口箭頭
      g.fillStyle = '#2b2b2b';
      g.beginPath();
      g.moveTo(X(47.5), Y(91));
      g.lineTo(X(45), Y(95));
      g.lineTo(X(50), Y(95));
      g.closePath();
      g.fill();
    } else if (name === 'unitB') {
      const rooms = [[10, 5, 52, 38], [52, 5, 90, 38], [10, 38, 58, 72], [58, 38, 90, 72], [10, 72, 42, 95], [42, 72, 90, 95]];
      wood(10, 5, 52, 38);
      wood(52, 5, 90, 38);
      wood(10, 38, 58, 72, false);
      tile(58, 38, 90, 72, '#e4e1da');
      tile(10, 72, 42, 95);
      tile(42, 72, 90, 95, '#cfcbc2');
      bed(15, 9, 45, 26);
      bed(60, 9, 82, 24);
      box(14, 58, 40, 66, '#f6f4ef');
      circ(27, 50, 4);
      box(80, 42, 88, 70, '#f2f0eb');
      circ(84, 50, 2.4);
      box(13, 76, 25, 92, '#ffffff');
      circ(35, 88, 3);
      walls(rooms, [10, 5, 90, 95]);
      g.fillStyle = '#2b2b2b';
      g.beginPath();
      g.moveTo(X(66), Y(96));
      g.lineTo(X(63), Y(99.5));
      g.lineTo(X(69), Y(99.5));
      g.closePath();
      g.fill();
    } else if (name === 'floor') {
      const units = [[10, 10, 38, 38], [38, 10, 62, 38], [62, 10, 90, 38], [62, 38, 90, 62], [62, 62, 90, 90], [38, 62, 62, 90], [10, 62, 38, 90], [10, 38, 38, 62]];
      units.forEach(([x0, y0, x1, y1], i) => {
        g.fillStyle = i % 2 ? '#e3dccf' : '#cfdbe6';
        g.fillRect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0));
        // 戶內隔間細線
        g.strokeStyle = 'rgba(40,40,40,0.35)';
        g.lineWidth = 2;
        g.strokeRect(X(x0 + 3), Y(y0 + 3), (X(x1) - X(x0)) * 0.42, (Y(y1) - Y(y0)) * 0.4);
        g.strokeRect(X(x1 - 3) - (X(x1) - X(x0)) * 0.3, Y(y0 + 3), (X(x1) - X(x0)) * 0.3, (Y(y1) - Y(y0)) * 0.3);
        g.fillStyle = '#3a3a3a';
        g.font = `700 ${W * 0.032}px sans-serif`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(`A${i + 1}`, X((x0 + x1) / 2), Y((y0 + y1) / 2 + 4));
      });
      g.fillStyle = '#ffffff';
      g.fillRect(X(38), Y(38), X(62) - X(38), Y(62) - Y(38));
      box(42, 42, 49, 49, '#f2f0eb');
      box(51, 42, 58, 49, '#f2f0eb');
      g.fillStyle = '#6b665c';
      g.font = `700 ${W * 0.022}px sans-serif`;
      g.fillText('梯廳', X(50), Y(56));
      walls(units, [10, 10, 90, 90]);
      g.strokeStyle = '#2b2b2b';
      g.lineWidth = 6;
      g.strokeRect(X(38), Y(38), X(62) - X(38), Y(62) - Y(38));
    } else {
      // 公設：庭園、交誼廳、健身房、閱覽室、梯廳、大廳
      g.fillStyle = '#9cc27a';
      g.fillRect(X(3), Y(3), X(97) - X(3), Y(18) - Y(3));
      for (let k = 0; k < 9; k++) circ(8 + k * 10.5, 10.5, 3.6, k % 2 ? '#6aa04a' : '#5f9c4b', '#3f6f3a');
      tile(5, 20, 45, 55, '#ece6da');
      tile(55, 20, 95, 45, '#d7dde2');
      wood(55, 45, 95, 70);
      tile(45, 20, 55, 70, '#ffffff');
      tile(5, 55, 45, 88, '#efe9dd');
      [[15, 30], [32, 30], [15, 45], [32, 45]].forEach(([x, y]) => (circ(x, y, 4, '#ffffff'), circ(x - 4, y + 4, 1.6), circ(x + 4, y - 4, 1.6)));
      [[60, 25], [70, 25], [80, 25], [90, 25]].forEach(([x, y]) => box(x - 3, y, x + 3, y + 12, '#8d949c', '#5a5f67'));
      box(60, 50, 90, 56, '#ffffff');
      box(60, 60, 90, 66, '#ffffff');
      box(12, 62, 38, 70, '#ffffff');
      circ(25, 78, 4.5, '#ffffff');
      box(47, 30, 53, 38, '#f2f0eb');
      box(47, 42, 53, 50, '#f2f0eb');
      walls([[5, 20, 45, 55], [55, 20, 95, 45], [55, 45, 95, 70], [45, 20, 55, 70], [5, 55, 45, 88]], [5, 20, 95, 88]);
    }
    sampleCache.set(name, c);
    return c;
  };
  const imgOf = (sc: Scene, imgs: (Img | undefined)[], i: number): Img | null => {
    const src = sc.images[i] || '';
    if (imgs[i]) return imgs[i]!;
    if (src.startsWith('sample:')) return sample(src.slice(7));
    return null;
  };

  /* 幾何 */
  const bbox = (pts: number[][]) => {
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  };
  const centroid = (pts: number[][]) => {
    const b = bbox(pts);
    return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
  };
  const inside = (pts: number[][], x: number, y: number) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i];
      const [xj, yj] = pts[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-9) + xi) c = !c;
    }
    return c;
  };

  /** 鏡頭：圖面座標 (cx, cy) 對準區塊中心，z 為相對「完整放進區塊」的倍數 */
  type Cam = { ax: number; ay: number; aw: number; ah: number; iw: number; ih: number; cx: number; cy: number; s: number; cr: number[] };
  const camera = (area: number[], im: Img, cx: number, cy: number, z: number, cr: number[] = [0, 0, 1, 1]): Cam => {
    const [ax, ay, aw, ah] = area;
    const fit = Math.min(aw / ((cr[2] - cr[0]) * im.width), ah / ((cr[3] - cr[1]) * im.height));
    return { ax, ay, aw, ah, iw: im.width, ih: im.height, cx, cy, s: fit * z, cr };
  };
  const mid = (cr: number[]) => [(cr[0] + cr[2]) / 2, (cr[1] + cr[3]) / 2];
  /** 自動抓平面圖範圍：找出墨色最密的連續欄、列，避開 DM 的 Logo、圖例與留白 */
  const autoCache = new WeakMap<object, number[]>();
  const autoCrop = (im: Img): number[] => {
    const hit = autoCache.get(im);
    if (hit) return hit;
    let out = [0, 0, 1, 1];
    try {
      const k = Math.min(1, 260 / Math.max(im.width, im.height));
      const w = Math.max(8, Math.round(im.width * k));
      const h = Math.max(8, Math.round(im.height * k));
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true })!;
      g.drawImage(im, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data;
      const col = new Array(w).fill(0);
      const row = new Array(h).fill(0);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          if (d[i + 3] > 20 && (d[i] + d[i + 1] + d[i + 2]) / 3 < 232) {
            col[x]++;
            row[y]++;
          }
        }
      const run = (arr: number[], n: number) => {
        const f = arr.map((v) => v / n);
        const th = Math.max(...f) * 0.3;
        let best = [0, arr.length - 1];
        let bl = -1;
        let st = -1;
        // 允許中間有很短的空隙（走道、門口）
        let gap = 0;
        for (let i = 0; i <= f.length; i++) {
          const on = i < f.length && f[i] > th;
          if (on) {
            if (st < 0) st = i;
            gap = 0;
          } else if (st >= 0) {
            gap++;
            if (gap > Math.max(2, f.length * 0.02) || i === f.length) {
              const e = i - gap;
              if (e - st > bl) {
                bl = e - st;
                best = [st, e];
              }
              st = -1;
              gap = 0;
            }
          }
        }
        return best;
      };
      const [x0, x1] = run(col, h);
      const [y0, y1] = run(row, w);
      const pad = 0.025;
      const r = [Math.max(0, x0 / w - pad), Math.max(0, y0 / h - pad), Math.min(1, (x1 + 1) / w + pad), Math.min(1, (y1 + 1) / h + pad)];
      if (r[2] - r[0] > 0.15 && r[3] - r[1] > 0.15) out = r;
    } catch {
      /* 跨站圖片無法讀取像素時，就用整張圖 */
    }
    autoCache.set(im, out);
    return out;
  };
  const scr = (c: Cam, u: number, v: number) => [c.ax + c.aw / 2 + (u - c.cx) * c.iw * c.s, c.ay + c.ah / 2 + (v - c.cy) * c.ih * c.s];
  /** 讓某個框剛好填滿區塊 frac 的鏡頭倍數 */
  const zoomFor = (area: number[], im: Img, b: number[], frac: number, cr: number[] = [0, 0, 1, 1]) => {
    const fit = Math.min(area[2] / ((cr[2] - cr[0]) * im.width), area[3] / ((cr[3] - cr[1]) * im.height));
    const bw = Math.max(0.02, b[2] - b[0]) * im.width;
    const bh = Math.max(0.02, b[3] - b[1]) * im.height;
    return Math.min((area[2] * frac) / (bw * fit), (area[3] * frac) / (bh * fit));
  };

  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number, sc: Scene, t: number, imgs: (Img | undefined)[] = [], font?: string) => {
    const F = ((globalThis as unknown as { MA_FONTS?: Record<string, string> }).MA_FONTS ?? {})[sc.font ?? ''] || font || FONT;
    const S = Math.min(W, H);
    const P = sc.params;
    const AC = P.color || '#ff5a36';
    const sp = P.speed || 1;
    const T = t * sp;
    const light = sc.bg === 'transparent' || lum(sc.bg) > 140;
    const FG = light ? '#1d2433' : '#f4f1ea';
    const DIM = light ? '#f4f1ea' : '#111318';
    ctx.clearRect(0, 0, W, H);
    if (sc.bg && sc.bg !== 'transparent') {
      ctx.fillStyle = sc.bg;
      ctx.fillRect(0, 0, W, H);
    }
    // 版面：上方標題、下方註記
    const hasTitle = !!(sc.title || sc.sub);
    const top = hasTitle ? H * (W > H ? 0.17 : 0.14) : H * 0.04;
    const bot = P.note ? H * 0.05 : H * 0.03;
    const area = [W * 0.05, top, W * 0.9, H - top - bot];
    const path = (c: Cam, pts: number[][]) => {
      pts.forEach(([u, v], i) => {
        const [x, y] = scr(c, u, v);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.closePath();
    };
    const drawImg = (c: Cam, im: Img, alpha = 1) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(c.ax, c.ay, c.aw, c.ah);
      ctx.clip();
      const [q0, q1] = scr(c, c.cr[0], c.cr[1]);
      const [q2, q3] = scr(c, c.cr[2], c.cr[3]);
      ctx.beginPath();
      ctx.rect(q0, q1, q2 - q0, q3 - q1);
      ctx.clip();
      ctx.globalAlpha *= alpha;
      const [x, y] = scr(c, 0, 0);
      ctx.drawImage(im, x, y, c.iw * c.s, c.ih * c.s);
      ctx.restore();
    };
    /** 壓暗：整塊區域蓋一層，留下 holes 這些房間 */
    const dimOut = (c: Cam, holes: Room[], a: number) => {
      if (a <= 0) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(c.ax, c.ay, c.aw, c.ah);
      ctx.clip();
      ctx.beginPath();
      ctx.rect(c.ax - 4, c.ay - 4, c.aw + 8, c.ah + 8);
      holes.forEach((r) => path(c, r.pts));
      ctx.fillStyle = rgba(DIM, a);
      ctx.fill('evenodd');
      ctx.restore();
    };
    const outline = (c: Cam, r: Room, k: number, fill = 0.16) => {
      if (k <= 0) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(c.ax, c.ay, c.aw, c.ah);
      ctx.clip();
      ctx.beginPath();
      path(c, r.pts);
      ctx.fillStyle = rgba(AC, fill * k);
      ctx.fill();
      ctx.strokeStyle = AC;
      ctx.globalAlpha = k;
      ctx.lineWidth = S * 0.007;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    };
    const tag = (x: number, y: number, name: string, sub: string, k: number, big = 1) => {
      if (k <= 0 || !name) return;
      const fs = S * 0.042 * big;
      const fs2 = fs * 0.56;
      ctx.font = `900 ${fs}px ${F}`;
      const w1 = ctx.measureText(name).width;
      ctx.font = `700 ${fs2}px ${F}`;
      const w2 = sub ? ctx.measureText(sub).width : 0;
      const pad = fs * 0.5;
      const bw = Math.max(w1, w2) + pad * 2;
      const bh = fs * 1.35 + (sub ? fs2 * 1.3 : 0);
      const bx = Math.max(W * 0.02, Math.min(W * 0.98 - bw, x - bw / 2));
      const by = Math.max(H * 0.01, Math.min(H * 0.99 - bh, y - bh / 2));
      const kk = back(k);
      ctx.save();
      ctx.translate(bx + bw / 2, by + bh / 2);
      ctx.scale(kk, kk);
      ctx.translate(-(bx + bw / 2), -(by + bh / 2));
      ctx.globalAlpha = clamp(k * 2);
      ctx.fillStyle = AC;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, fs * 0.3);
      ctx.fill();
      const tc = lum(AC) > 160 ? '#1d2433' : '#ffffff';
      ctx.fillStyle = tc;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 ${fs}px ${F}`;
      ctx.fillText(name, bx + bw / 2, by + fs * 0.72);
      if (sub) {
        ctx.font = `700 ${fs2}px ${F}`;
        ctx.globalAlpha *= 0.88;
        ctx.fillText(sub, bx + bw / 2, by + fs * 1.35 + fs2 * 0.55);
      }
      ctx.restore();
    };
    const roomTag = (c: Cam, r: Room, k: number, big = 1, lift = 0) => {
      const [u, v] = centroid(r.pts);
      const [x, y] = scr(c, u, v);
      tag(x, y - lift, r.name, r.sub ?? '', k, big);
    };
    const head = () => {
      const k = ease(T / 0.6);
      if (hasTitle) {
        ctx.globalAlpha = k;
        ctx.fillStyle = FG;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const fs = S * 0.07;
        ctx.font = `900 ${fs}px ${F}`;
        ctx.fillText(sc.title, W * 0.06, H * 0.035 + (1 - k) * fs * 0.4, W * 0.88);
        if (sc.sub) {
          ctx.font = `700 ${fs * 0.46}px ${F}`;
          ctx.globalAlpha = k * 0.72;
          ctx.fillText(sc.sub, W * 0.06, H * 0.035 + fs * 1.22, W * 0.88);
        }
        ctx.globalAlpha = 1;
      }
      if (P.note) {
        ctx.globalAlpha = 0.6 * k;
        ctx.fillStyle = FG;
        ctx.font = `500 ${S * 0.021}px ${F}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(NOTE, W * 0.95, H - H * 0.012);
        ctx.globalAlpha = 1;
      }
    };
    const missing = (a: number[], label: string) => {
      ctx.fillStyle = rgba(FG, 0.08);
      ctx.fillRect(a[0], a[1], a[2], a[3]);
      ctx.fillStyle = rgba(FG, 0.5);
      ctx.font = `700 ${S * 0.035}px ${F}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`放入${label}`, a[0] + a[2] / 2, a[1] + a[3] / 2);
    };
    const im0 = imgOf(sc, imgs, 0);
    const cropOf = (i: number, im: Img | null) => {
      const m = sc.crops?.[i];
      if (m && m.length === 4) return m;
      if (!im || (sc.images[i] || '').startsWith('sample:')) return [0, 0, 1, 1];
      return autoCrop(im);
    };
    const cr0 = cropOf(0, im0);
    const [h0x, h0y] = mid(cr0);
    const mode = sc.mode;
    const rooms = sc.rooms;
    const handles: Record<string, number[]> = {};

    if (mode === 'compare') {
      const im1 = imgOf(sc, imgs, 1);
      const horiz = W >= H;
      const gap = S * 0.03;
      const labH = S * 0.1;
      const A = horiz ? [area[0], area[1], (area[2] - gap) / 2, area[3] - labH] : [area[0], area[1], area[2], (area[3] - gap) / 2 - labH];
      const B = horiz ? [area[0] + A[2] + gap, area[1], A[2], A[3]] : [area[0], area[1] + A[3] + labH + gap, area[2], A[3]];
      const halves: [number[], Img | null, Room[], string, number][] = [[A, im0, rooms, sc.labelA, -1], [B, im1, sc.rooms2, sc.labelB, 1]];
      halves.forEach(([a, im, rs, lab, dir], i) => {
        const k = ease((T - 0.3 - i * 0.3) / 0.7);
        const off = (1 - k) * (horiz ? W * 0.5 * dir : H * 0.5 * dir);
        const aa = horiz ? [a[0] + off, a[1], a[2], a[3]] : [a[0], a[1] + off, a[2], a[3]];
        if (!im) return missing(aa, PLAN_SLOTS[i]);
        const cri = cropOf(i, im);
        const c = camera(aa, im, mid(cri)[0], mid(cri)[1], 1, cri);
        drawImg(c, im, k);
        // 同名空間依序同時亮起
        const common = rooms.filter((r) => sc.rooms2.some((q) => q.name === r.name)).map((r) => r.name);
        common.forEach((nm, j) => {
          const t0 = 2.2 + j * 1.1;
          const kk = ease((T - t0) / 0.3) * (1 - ease((T - t0 - 1.0) / 0.25));
          const last = j === common.length - 1 ? ease((T - t0) / 0.3) : kk;
          const r = rs.find((q) => q.name === nm);
          if (r) {
            outline(c, r, last);
            roomTag(c, r, last, 0.8);
          }
        });
        const lk = ease((T - 1.2 - i * 0.2) / 0.5);
        if (lab) tag(aa[0] + aa[2] / 2, horiz ? aa[1] + aa[3] + labH * 0.55 : aa[1] + aa[3] + labH * 0.5, lab, '', lk, 1.05);
      });
      // VS
      const vk = back((T - 1.0) / 0.5);
      if (vk > 0) {
        const vx = horiz ? A[0] + A[2] + gap / 2 : W / 2;
        const vy = horiz ? A[1] + A[3] / 2 : A[1] + A[3] + labH + gap / 2;
        ctx.save();
        ctx.translate(vx, vy);
        ctx.scale(vk, vk);
        ctx.fillStyle = FG;
        ctx.beginPath();
        ctx.arc(0, 0, S * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = light ? '#ffffff' : '#111318';
        ctx.font = `900 ${S * 0.042}px ${F}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VS', 0, S * 0.003);
        ctx.restore();
      }
      head();
      return handles;
    }
    if (!im0) {
      missing(area, PLAN_SLOTS[0]);
      head();
      return handles;
    }

    if (mode === 'tilt') {
      const k = inout((T - 0.6) / 1.8);
      const sway = Math.sin(Math.max(0, T - 2.4) * 0.6) * 0.07 * ease((T - 2.4) / 1);
      const th = k * -0.62 + sway;
      const sy = 1 - k * 0.46;
      const fit = Math.min(area[2] / ((cr0[2] - cr0[0]) * im0.width), area[3] / ((cr0[3] - cr0[1]) * im0.height)) * lerp(1, 0.9, k);
      const cx = area[0] + area[2] / 2;
      const cy = area[1] + area[3] / 2 - k * S * 0.02;
      const cos = Math.cos(th);
      const sin = Math.sin(th);
      // 圖面座標 → 螢幕
      const M = (u: number, v: number) => {
        const x = (u - h0x) * im0.width * fit;
        const y = (v - h0y) * im0.height * fit;
        return [cx + x * cos - y * sin, cy + sy * (x * sin + y * cos)];
      };
      const corners = [M(cr0[0], cr0[1]), M(cr0[2], cr0[1]), M(cr0[2], cr0[3]), M(cr0[0], cr0[3])];
      const thick = S * 0.03 * k;
      // 落地陰影與板厚
      if (thick > 0.5) {
        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        ctx.beginPath();
        corners.forEach(([x, y], i) => (i ? ctx.lineTo(x + thick * 1.4, y + thick * 2.4) : ctx.moveTo(x + thick * 1.4, y + thick * 2.4)));
        ctx.closePath();
        ctx.fill();
        for (let i = 0; i < 4; i++) {
          const a = corners[i];
          const b = corners[(i + 1) % 4];
          // 只畫朝向鏡頭的側面（邊的外法線往下）
          const nx = b[1] - a[1];
          const ny = -(b[0] - a[0]);
          if (ny <= 0 && !(nx === 0)) continue;
          ctx.fillStyle = i % 2 ? '#cfc8ba' : '#bdb5a5';
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.lineTo(b[0], b[1] + thick);
          ctx.lineTo(a[0], a[1] + thick);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.save();
      ctx.beginPath();
      corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.clip();
      const m0 = M(0, 0);
      const mx = M(1, 0);
      const my = M(0, 1);
      ctx.transform((mx[0] - m0[0]) / im0.width, (mx[1] - m0[1]) / im0.width, (my[0] - m0[0]) / im0.height, (my[1] - m0[1]) / im0.height, m0[0], m0[1]);
      ctx.drawImage(im0, 0, 0);
      ctx.restore();
      // 牆面長高：依房間外框立起實色牆片，由後往前畫
      const wk = ease((T - 2.4) / 1.2) * (P.walls || 0);
      if (wk > 0 && rooms.length) {
        const h = S * 0.07 * wk;
        const segs: { a: number[]; b: number[]; d: number }[] = [];
        const seen = new Set<string>();
        rooms.forEach((r) =>
          r.pts.forEach((p, i) => {
            const q = r.pts[(i + 1) % r.pts.length];
            const key = [p, q].map((z) => z.map((v) => v.toFixed(3)).join(',')).sort().join('|');
            if (seen.has(key)) return;
            seen.add(key);
            const a = M(p[0], p[1]);
            const b = M(q[0], q[1]);
            segs.push({ a, b, d: (a[1] + b[1]) / 2 });
          }),
        );
        segs.sort((x, y) => x.d - y.d);
        segs.forEach(({ a, b }) => {
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
          const shade = 0.5 + 0.5 * Math.cos(ang * 2);
          ctx.fillStyle = shade > 0.5 ? '#f4f1ea' : '#ddd6c8';
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.lineTo(b[0], b[1] - h);
          ctx.lineTo(a[0], a[1] - h);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#2b2b2b';
          ctx.lineWidth = S * 0.004;
          ctx.beginPath();
          ctx.moveTo(a[0], a[1] - h);
          ctx.lineTo(b[0], b[1] - h);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(43,43,43,0.35)';
          ctx.lineWidth = S * 0.0015;
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(a[0], a[1] - h);
          ctx.moveTo(b[0], b[1]);
          ctx.lineTo(b[0], b[1] - h);
          ctx.stroke();
        });
        rooms.forEach((r, i) => {
          const [u, v] = centroid(r.pts);
          const [x, y] = M(u, v);
          tag(x, y - h - S * 0.03, r.name, r.sub ?? '', ease((T - 3.6 - i * 0.12) / 0.4), 0.72);
        });
      }
      head();
      return handles;
    }

    // 其餘模式都在同一個鏡頭下畫：預設看全圖
    let cam = camera(area, im0, h0x, h0y, 1, cr0);
    const target = rooms[Math.min(rooms.length - 1, Math.max(0, sc.target))];

    if (mode === 'locate' || mode === 'focus') {
      const zIn = mode === 'locate' ? ease((T - 2.2) / 1.4) * 1 : inout((T - 1.4) / 1.4);
      if (target) {
        const b = bbox(target.pts);
        const z = zoomFor(area, im0, b, mode === 'locate' ? 0.82 : 0.58, cr0);
        const [tx, ty] = centroid(target.pts);
        const k = mode === 'locate' ? inout((T - 2.2) / 1.4) : zIn;
        cam = camera(area, im0, lerp(h0x, tx, k), lerp(h0y, ty, k), lerp(1, Math.max(1, z), k), cr0);
      }
      // 戶別定位：放大後切換成該戶平面圖（圓形展開）
      const im1 = mode === 'locate' ? imgOf(sc, imgs, 1) : null;
      const sw = im1 ? inout((T - 3.8) / 0.9) : 0;
      drawImg(cam, im0, ease(T / 0.5));
      const dk = ease((T - 1.0) / 0.5) * (1 - sw);
      if (target) {
        dimOut(cam, [target], (P.dim ?? 0.55) * dk);
        const pulse = 0.75 + 0.25 * Math.sin(T * 5);
        outline(cam, target, ease((T - 1.0) / 0.4) * (mode === 'locate' ? pulse : 1) * (1 - sw));
        if (mode === 'locate') roomTag(cam, target, ease((T - 1.3) / 0.4) * (1 - sw), 1.1);
      }
      if (im1 && sw > 0) {
        const cr1 = cropOf(1, im1);
        const c1 = camera(area, im1, mid(cr1)[0], mid(cr1)[1], 1, cr1);
        const [ox, oy] = target ? scr(cam, ...(centroid(target.pts) as [number, number])) : [W / 2, H / 2];
        ctx.save();
        ctx.beginPath();
        ctx.arc(ox, oy, Math.hypot(W, H) * sw, 0, Math.PI * 2);
        ctx.clip();
        if (sc.bg && sc.bg !== 'transparent') {
          ctx.fillStyle = sc.bg;
          ctx.fillRect(0, 0, W, H);
        }
        drawImg(c1, im1);
        ctx.restore();
        ctx.strokeStyle = AC;
        ctx.lineWidth = S * 0.008;
        ctx.globalAlpha = 1 - sw;
        ctx.beginPath();
        ctx.arc(ox, oy, Math.hypot(W, H) * sw, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (mode === 'focus' && target) {
        const [x0, y0] = scr(cam, bbox(target.pts)[0], bbox(target.pts)[1]);
        const [x1, y1] = scr(cam, bbox(target.pts)[2], bbox(target.pts)[3]);
        const lk = ease((T - 2.9) / 0.6);
        const dimLine = (ax: number, ay: number, bx: number, by: number, text: string, vert: boolean) => {
          if (!text || lk <= 0) return;
          const L = lk;
          const ex = lerp(ax, bx, L);
          const ey = lerp(ay, by, L);
          ctx.strokeStyle = AC;
          ctx.fillStyle = AC;
          ctx.lineWidth = S * 0.005;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          const tick = S * 0.018;
          ctx.beginPath();
          if (vert) {
            ctx.moveTo(ax - tick, ay);
            ctx.lineTo(ax + tick, ay);
            ctx.moveTo(ex - tick, ey);
            ctx.lineTo(ex + tick, ey);
          } else {
            ctx.moveTo(ax, ay - tick);
            ctx.lineTo(ax, ay + tick);
            ctx.moveTo(ex, ey - tick);
            ctx.lineTo(ex, ey + tick);
          }
          ctx.stroke();
          const fs = S * 0.038;
          ctx.font = `900 ${fs}px ${F}`;
          const tw = ctx.measureText(text).width + fs;
          const mx = (ax + bx) / 2;
          const my = (ay + by) / 2;
          ctx.globalAlpha = ease((T - 3.3) / 0.4);
          ctx.fillStyle = AC;
          ctx.beginPath();
          const vx = Math.min(mx + tick * 1.2, W * 0.98 - tw);
          if (vert) ctx.roundRect(vx, my - fs * 0.7, tw, fs * 1.4, fs * 0.25);
          else ctx.roundRect(mx - tw / 2, my - tick * 1.2 - fs * 1.4, tw, fs * 1.4, fs * 0.25);
          ctx.fill();
          ctx.fillStyle = lum(AC) > 160 ? '#1d2433' : '#ffffff';
          ctx.textAlign = vert ? 'left' : 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, vert ? vx + fs * 0.5 : mx, vert ? my : my - tick * 1.2 - fs * 0.7);
          ctx.globalAlpha = 1;
        };
        const off = S * 0.03;
        dimLine(x0, y0 - off, x1, y0 - off, sc.dimW, false);
        dimLine(x1 + off, y0, x1 + off, y1, sc.dimH, true);
        tag((x0 + x1) / 2, (y0 + y1) / 2, target.name, target.sub ?? '', ease((T - 2.6) / 0.4), 1.15);
      }
      head();
      return handles;
    }

    if (mode === 'amenity') {
      const step = 1.8;
      const t0 = 1.2;
      const n = rooms.length;
      const i = Math.floor((T - t0) / step);
      const end = t0 + n * step;
      let cx = h0x;
      let cy = h0y;
      let z = 1;
      const cur = i >= 0 && i < n ? rooms[i] : null;
      if (T >= t0 && T < end + 1) {
        // 從上一區移到這一區
        const idx = Math.min(n - 1, Math.max(0, i));
        const from = idx > 0 ? rooms[idx - 1] : null;
        const to = rooms[idx];
        const k = inout((T - t0 - idx * step) / 0.8);
        const fz = from ? Math.min(2.4, zoomFor(area, im0, bbox(from.pts), 0.7, cr0)) : 1;
        const tz = Math.min(2.4, zoomFor(area, im0, bbox(to.pts), 0.7, cr0));
        const [fx, fy] = from ? centroid(from.pts) : [h0x, h0y];
        const [tx, ty] = centroid(to.pts);
        cx = lerp(fx, tx, k);
        cy = lerp(fy, ty, k);
        z = lerp(fz, Math.max(1, tz), k);
        if (T >= end) {
          const kk = inout((T - end) / 1);
          cx = lerp(tx, h0x, kk);
          cy = lerp(ty, h0y, kk);
          z = lerp(Math.max(1, tz), 1, kk);
        }
      }
      cam = camera(area, im0, cx, cy, z, cr0);
      drawImg(cam, im0, ease(T / 0.5));
      if (cur) {
        const lt = T - t0 - i * step;
        dimOut(cam, [cur], (P.dim ?? 0.55) * ease((lt - 0.5) / 0.3) * (1 - ease((lt - step + 0.2) / 0.2)));
        outline(cam, cur, ease((lt - 0.55) / 0.3) * (1 - ease((lt - step + 0.2) / 0.2)));
        roomTag(cam, cur, ease((lt - 0.7) / 0.35) * (1 - ease((lt - step + 0.15) / 0.15)), 1.15);
      }
      if (T >= end + 0.6) rooms.forEach((r, j) => roomTag(cam, r, ease((T - end - 0.6 - j * 0.08) / 0.35), 0.7));
      head();
      return handles;
    }

    if (mode === 'rooms') {
      drawImg(cam, im0, ease(T / 0.5));
      const t0 = 1;
      const step = 1;
      const n = rooms.length;
      const i = Math.floor((T - t0) / step);
      if (i >= 0 && i < n) {
        const r = rooms[i];
        const lt = T - t0 - i * step;
        dimOut(cam, [r], (P.dim ?? 0.55) * (i === 0 ? ease(lt / 0.3) : 1));
        outline(cam, r, ease(lt / 0.25));
        roomTag(cam, r, ease((lt - 0.1) / 0.3), 1.1);
      } else if (i >= n && n) {
        const lt = T - t0 - n * step;
        dimOut(cam, rooms, (P.dim ?? 0.55) * 0.5 * (1 - ease(lt / 0.5)));
        rooms.forEach((r, j) => {
          outline(cam, r, ease((lt - j * 0.06) / 0.3), 0.08);
          roomTag(cam, r, ease((lt - 0.1 - j * 0.06) / 0.3), 0.72);
        });
      }
      head();
      return handles;
    }

    if (mode === 'tour') {
      drawImg(cam, im0, ease(T / 0.5));
      const pts = sc.path.length >= 2 ? sc.path : [];
      if (!pts.length) {
        head();
        return handles;
      }
      const seg: number[] = [0];
      for (let j = 1; j < pts.length; j++) seg.push(seg[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
      const tot = seg[seg.length - 1] || 1;
      const t0 = 1.2;
      const dur = Math.max(4, pts.length * 0.7);
      const p = clamp((T - t0) / dur);
      const at = (d: number) => {
        let j = 1;
        while (j < seg.length - 1 && seg[j] < d) j++;
        const f = (d - seg[j - 1]) / (seg[j] - seg[j - 1] || 1);
        return [lerp(pts[j - 1][0], pts[j][0], clamp(f)), lerp(pts[j - 1][1], pts[j][1], clamp(f)), j];
      };
      const d = tot * inout(p);
      // 走過的房間保持亮起
      const visited: Room[] = [];
      let current: Room | null = null;
      for (let s = 0; s <= 60; s++) {
        const q = at((d * s) / 60);
        const r = rooms.find((rr) => inside(rr.pts, q[0], q[1]));
        if (r && !visited.includes(r)) visited.push(r);
        if (s === 60) current = r ?? null;
      }
      const dk = ease((T - 0.8) / 0.4);
      dimOut(cam, visited, (P.dim ?? 0.55) * 0.75 * dk * (1 - ease((T - t0 - dur - 0.6) / 0.6)));
      if (current) outline(cam, current, 1);
      // 已走過的虛線
      const [hx, hy, hj] = at(d);
      ctx.save();
      ctx.strokeStyle = AC;
      ctx.lineWidth = S * 0.008;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([S * 0.018, S * 0.016]);
      ctx.beginPath();
      for (let j = 0; j < hj; j++) {
        const [x, y] = scr(cam, pts[j][0], pts[j][1]);
        if (j) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      const [hx2, hy2] = scr(cam, hx, hy);
      ctx.lineTo(hx2, hy2);
      if (p > 0) ctx.stroke();
      ctx.restore();
      // 入口
      const [ex, ey] = scr(cam, pts[0][0], pts[0][1]);
      const ek = back((T - 0.6) / 0.4);
      if (ek > 0) {
        ctx.save();
        ctx.translate(ex, ey);
        ctx.scale(ek, ek);
        ctx.fillStyle = AC;
        ctx.beginPath();
        ctx.arc(0, 0, S * 0.022, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = lum(AC) > 160 ? '#1d2433' : '#ffffff';
        ctx.font = `900 ${S * 0.022}px ${F}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('入', 0, S * 0.001);
        ctx.restore();
      }
      // 走動的人：實心圓＋白框
      if (p > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(hx2, hy2, S * 0.022, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = AC;
        ctx.beginPath();
        ctx.arc(hx2, hy2, S * 0.015, 0, Math.PI * 2);
        ctx.fill();
      }
      if (current) roomTag(cam, current, ease((T - t0) / 0.3), 1.05, S * 0.05);
      if (p >= 1) visited.forEach((r, j) => roomTag(cam, r, ease((T - t0 - dur - 0.4 - j * 0.08) / 0.35), 0.7));
      head();
      return handles;
    }
    drawImg(cam, im0);
    head();
    return handles;
  };
  const PLAN_SLOTS = ['平面圖', '第二張平面圖'];
  return { draw, sample, autoCrop };
};

export const { draw: drawPlan, sample: planSample, autoCrop: planAutoCrop } = planRenderer();
(globalThis as unknown as { MA_PLAN: unknown }).MA_PLAN = { drawPlan };

export const PLAN_GLOBALS = `${FONTS_GLOBALS}window.MA_PLAN=(()=>{const r=${fnSource(planRenderer)}();return {drawPlan:r.draw};})();`;
registerEngine('plan', PLAN_GLOBALS);
