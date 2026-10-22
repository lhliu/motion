// 銳利水滴繪製引擎：完全不使用模糊、陰影或光暈，邊緣只有 1px 抗鋸齒，適合疊進影片。
// drawDrop 與 parseDrop 必須自給自足（不引用模組變數），因為匯出 HTML 時會用 toString() 內嵌。
import { fnSource } from './engine';

export type DropShape = 'circle' | 'cloud' | 'flower' | 'pebble' | 'random';
export type DropLayout = 'inside' | 'beside' | 'above' | 'below';
export type GlossStyle = 'crescent' | 'dot' | 'both' | 'none';

export interface DropOpts {
  ratio: '9:16' | '16:9' | '1:1';
  bg: string; // transparent｜#hex｜#hex,#hex
  shape: DropShape;
  lobes: number;
  amp: number;
  irregular: number;
  seed: number;
  size: number;
  x: number;
  y: number;
  color: string;
  color2: string;
  alpha: number;
  depth: number;
  gloss: number;
  glossStyle: GlossStyle;
  rim: string;
  rimWidth: number;
  breathe: number;
  speed: number;
  layout: DropLayout;
  tx: number;
  ty: number;
  textColor: string;
  textSize: number;
  weight: number;
  stroke: string;
  strokeWidth: number;
  sats: number;
  satSize: number;
  satSpread: number;
  entrance: 'pop' | 'fade' | 'none';
  loop: number;
}

export const drawDrop = (ctx: CanvasRenderingContext2D, W: number, H: number, o: DropOpts, lines: string[], t: number) => {
  const S = Math.min(W, H);
  const u = S / 1080;
  const rnd = (n: number) => {
    const x = Math.sin(n * 9301 + o.seed * 49297.31) * 233280;
    return x - Math.floor(x);
  };
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
  const back = (p: number) => {
    const q = clamp(p) - 1;
    return 1 + 2.4 * q * q * q + 1.4 * q * q;
  };
  const T = o.loop > 0 ? t % o.loop : t;
  let out = 1;
  if (o.loop > 0 && o.loop - T < 0.45) out = clamp((o.loop - T) / 0.45);
  const appear = (delay: number) => (o.entrance === 'none' ? 1 : o.entrance === 'fade' ? ease((T - delay) / 0.6) : back((T - delay) / 0.55));
  const appearA = (delay: number) => (o.entrance === 'none' ? 1 : clamp((T - delay) / 0.22));

  ctx.clearRect(0, 0, W, H);
  if (o.bg && o.bg !== 'transparent') {
    const c = o.bg.split(',');
    if (c.length > 1) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, c[0].trim());
      g.addColorStop(1, c[1].trim());
      ctx.fillStyle = g;
    } else ctx.fillStyle = c[0];
    ctx.fillRect(0, 0, W, H);
  }

  // 形狀：依類型決定瓣數與起伏
  const shapeOf = (shape: string, seed: number) => {
    if (shape === 'circle') return { k: 0, amp: 0, irr: 0 };
    if (shape === 'flower') return { k: Math.max(3, o.lobes), amp: Math.max(0.16, o.amp), irr: o.irregular * 0.5 };
    if (shape === 'pebble') return { k: 2, amp: 0.08, irr: 0.6 + o.irregular * 0.4 };
    if (shape === 'random') return { k: 2 + Math.floor(rnd(seed + 1) * 5), amp: 0.05 + rnd(seed + 2) * 0.17, irr: 0.3 + rnd(seed + 3) * 0.7 };
    return { k: Math.max(2, o.lobes), amp: o.amp, irr: o.irregular };
  };

  const blob = (cx: number, cy: number, R: number, shape: string, seed: number, phase: number) => {
    const sh = shapeOf(shape, seed);
    const n = 32;
    const br = o.breathe * Math.sin((T / Math.max(0.5, o.speed)) * Math.PI * 2 + phase);
    const pts: number[][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const wob = sh.k ? o.breathe * 0.06 * Math.sin((T / Math.max(0.5, o.speed)) * Math.PI * 2 + i * 0.9 + phase) : 0;
      const noise = sh.irr * 0.3 * (Math.sin(a * 2 + rnd(seed + 7) * 6) * 0.5 + Math.sin(a * 3 + rnd(seed + 8) * 6) * 0.35);
      const r = R * (1 + br * 0.035 + sh.amp * Math.cos(sh.k * a + rnd(seed + 5) * 6.28) + noise + wob);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    const p = new Path2D();
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    p.closePath();
    return p;
  };

  const paintDrop = (cx: number, cy: number, R: number, shape: string, seed: number, phase: number, small: boolean) => {
    if (R <= 0.5) return;
    const path = blob(cx, cy, R, shape, seed, phase);
    // 本體：上下兩色漸層（內部漸層不影響邊緣銳利度）
    const g = ctx.createLinearGradient(cx, cy - R, cx, cy + R);
    g.addColorStop(0, o.color);
    g.addColorStop(1, o.color2);
    ctx.save();
    ctx.globalAlpha = o.alpha * out;
    ctx.fillStyle = g;
    ctx.fill(path);
    ctx.restore();
    ctx.save();
    ctx.clip(path);
    // 立體感：右下方一塊較深的硬邊色塊
    if (o.depth > 0) {
      ctx.globalAlpha = o.depth * 0.45 * out;
      ctx.fillStyle = o.color2;
      ctx.beginPath();
      ctx.ellipse(cx + R * 0.35, cy + R * 0.42, R * 0.95, R * 0.7, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // 光澤：硬邊月牙與圓點
    if (o.gloss > 0 && o.glossStyle !== 'none') {
      ctx.fillStyle = '#ffffff';
      if (o.glossStyle === 'crescent' || o.glossStyle === 'both') {
        ctx.globalAlpha = o.gloss * 0.85 * out;
        const m = new Path2D();
        m.ellipse(cx - R * 0.12, cy - R * 0.08, R * 0.72, R * 0.72, 0, Math.PI * 1.05, Math.PI * 1.62);
        m.ellipse(cx - R * 0.02, cy + R * 0.02, R * 0.66, R * 0.66, 0, Math.PI * 1.62, Math.PI * 1.05, true);
        m.closePath();
        ctx.fill(m);
        if (!small) {
          ctx.globalAlpha = o.gloss * 0.35 * out;
          const b = new Path2D();
          b.ellipse(cx + R * 0.05, cy + R * 0.05, R * 0.74, R * 0.74, 0, Math.PI * 0.12, Math.PI * 0.58);
          b.ellipse(cx - R * 0.02, cy - R * 0.02, R * 0.7, R * 0.7, 0, Math.PI * 0.58, Math.PI * 0.12, true);
          b.closePath();
          ctx.fill(b);
        }
      }
      if (o.glossStyle === 'dot' || o.glossStyle === 'both') {
        ctx.globalAlpha = o.gloss * out;
        ctx.beginPath();
        ctx.ellipse(cx - R * 0.42, cy - R * 0.44, R * 0.11, R * 0.075, -0.7, 0, Math.PI * 2);
        ctx.fill();
        if (!small) {
          ctx.beginPath();
          ctx.arc(cx - R * 0.24, cy - R * 0.56, R * 0.04, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
    if (o.rimWidth > 0) {
      ctx.save();
      ctx.globalAlpha = out;
      ctx.strokeStyle = o.rim;
      ctx.lineWidth = o.rimWidth * u * (small ? 0.6 : 1);
      ctx.stroke(path);
      ctx.restore();
    }
  };

  // 文字量測（用於決定小水滴環繞範圍）
  const fs = o.textSize * u;
  const lineInfo = lines.map((l) => {
    const sub = l.startsWith('~');
    return { text: sub ? l.slice(1).trim() : l, size: sub ? fs * 0.3 : fs, sub };
  });
  ctx.save();
  let tw = 0;
  let th = 0;
  for (const li of lineInfo) {
    ctx.font = `${o.weight} ${li.size}px "MA Num", "Chiron Hei HK", "Noto Sans TC", "PingFang TC", sans-serif`;
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = li.sub ? `${li.size * 0.5}px` : `${li.size * 0.06}px`;
    tw = Math.max(tw, ctx.measureText(li.text).width);
    th += li.size * (li.sub ? 1.9 : 1.12);
  }
  ctx.restore();

  const tx = o.tx * W;
  const ty = o.ty * H;
  const R = (o.size * S) / 2;

  // 主水滴
  if (o.size > 0) {
    const s = appear(0);
    ctx.save();
    ctx.globalAlpha = appearA(0);
    paintDrop(o.x * W, o.y * H, R * s, o.shape, 0, 0, false);
    ctx.restore();
  }

  // 點綴小水滴：beside 環繞文字，其他環繞主水滴
  const ax = o.layout === 'beside' ? tx : o.x * W;
  const ay = o.layout === 'beside' ? ty : o.y * H;
  const rx = o.layout === 'beside' ? tw / 2 + fs * 0.35 : R;
  const ry = o.layout === 'beside' ? th / 2 + fs * 0.3 : R;
  for (let i = 0; i < o.sats; i++) {
    const a = rnd(i * 5 + 11) * Math.PI * 2;
    const d = 1.08 + rnd(i * 5 + 12) * o.satSpread;
    const sx = ax + Math.cos(a) * rx * d;
    const sy = ay + Math.sin(a) * ry * d + Math.sin(T * 1.6 + i) * o.breathe * 6 * u;
    const sr = o.satSize * S * 0.5 * (0.45 + rnd(i * 5 + 13) * 0.55);
    const s = appear(0.35 + i * 0.07);
    ctx.save();
    ctx.globalAlpha = appearA(0.35 + i * 0.07);
    paintDrop(sx, sy, sr * s, o.shape === 'random' ? 'random' : 'circle', i + 20, i, true);
    ctx.restore();
  }

  // 文字：硬邊，可加描邊，不加陰影
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let y = ty - th / 2;
  lineInfo.forEach((li, i) => {
    const h = li.size * (li.sub ? 1.9 : 1.12);
    const p = ease((T - 0.45 - i * 0.28) / 0.5);
    const e = o.entrance === 'none' ? 1 : p;
    ctx.font = `${li.sub ? Math.min(o.weight, 500) : o.weight} ${li.size}px "MA Num", "Chiron Hei HK", "Noto Sans TC", "PingFang TC", sans-serif`;
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = li.sub ? `${li.size * 0.5}px` : `${li.size * 0.06}px`;
    ctx.globalAlpha = e * out;
    const yy = y + h / 2 + (1 - e) * li.size * 0.25;
    if (o.strokeWidth > 0) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = o.strokeWidth * u * (li.sub ? 0.5 : 1);
      ctx.strokeStyle = o.stroke;
      ctx.strokeText(li.text, tx, yy);
    }
    ctx.fillStyle = o.textColor;
    ctx.fillText(li.text, tx, yy);
    y += h;
  });
  ctx.restore();
};

/** 把文字行與 @選項 解析成設定；用於 MCP、Combo 與圖鑑卡片 */
export const parseDrop = (words: string[]): { o: DropOpts; lines: string[] } => {
  const o: DropOpts = {
    ratio: '9:16',
    bg: 'transparent',
    shape: 'cloud',
    lobes: 4,
    amp: 0.11,
    irregular: 0.2,
    seed: 7,
    size: 0.62,
    x: 0.5,
    y: 0.5,
    color: '#a6d4f2',
    color2: '#5b9bd5',
    alpha: 0.8,
    depth: 0.35,
    gloss: 0.85,
    glossStyle: 'both',
    rim: '#ffffff',
    rimWidth: 4,
    breathe: 0.6,
    speed: 4,
    layout: 'inside',
    tx: 0.5,
    ty: 0.5,
    textColor: '#ffffff',
    textSize: 150,
    weight: 700,
    stroke: '#3f7fbf',
    strokeWidth: 0,
    sats: 0,
    satSize: 0.07,
    satSpread: 0.6,
    entrance: 'pop',
    loop: 6,
  };
  const presets: Record<string, Partial<DropOpts>> = {
    inside: { layout: 'inside', size: 0.62, sats: 3, satSize: 0.06, satSpread: 0.25 },
    beside: { layout: 'beside', size: 0, sats: 7, satSize: 0.09, satSpread: 0.45, textColor: '#3f7fbf', strokeWidth: 0 },
    above: { layout: 'above', size: 0.32, y: 0.36, ty: 0.6, textColor: '#3f7fbf', sats: 2 },
    below: { layout: 'below', size: 0.32, y: 0.64, ty: 0.4, textColor: '#3f7fbf', sats: 2 },
  };
  const lines: string[] = [];
  const num = (v: string) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : undefined);
  const rec = o as unknown as Record<string, unknown>;
  for (const raw of words) {
    const w = String(raw).trim();
    if (!w.startsWith('@')) {
      if (w) lines.push(w);
      continue;
    }
    for (const part of w.slice(1).split(/[;\s]+/)) {
      const [k, ...rest] = part.split('=');
      const v = rest.join('=').trim();
      if (!k) continue;
      if (k === 'pos' || k === 'layout') Object.assign(o, presets[v] ?? {});
      else if (k === 'rim' && v.includes('/')) {
        const [c, wd] = v.split('/');
        o.rim = c;
        o.rimWidth = num(wd) ?? o.rimWidth;
      } else if (k in o) {
        const cur = rec[k];
        if (typeof cur === 'number') {
          const n = num(v);
          if (n !== undefined) rec[k] = n;
        } else rec[k] = v;
      }
    }
  }
  return { o, lines: lines.length ? lines : ['水滴'] };
};

/** 把設定轉回 @選項 字串（只輸出與預設不同的值） */
export const dropToWords = (o: DropOpts, lines: string[]): string[] => {
  const d = parseDrop([]).o as unknown as Record<string, unknown>;
  const cur = o as unknown as Record<string, unknown>;
  const diff = Object.keys(d)
    .filter((k) => cur[k] !== d[k])
    .map((k) => `${k}=${cur[k]}`);
  return [...lines, ...(diff.length ? ['@' + diff.join(';')] : [])];
};

/** 匯出 HTML 時要先定義的全域函式 */
export const DROP_GLOBALS = `window.MA_DROP={draw:${fnSource(drawDrop)},parse:${fnSource(parseDrop)}};`;

// 讓特效的 run 透過全域取得（run 本身必須自給自足）
(globalThis as unknown as { MA_DROP: unknown }).MA_DROP = { draw: drawDrop, parse: parseDrop };
