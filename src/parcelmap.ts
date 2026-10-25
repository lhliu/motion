// 地籍套繪圖公版：地籍分割線＋地號、道路、周邊建物、一棟主要建物，並從主要建物畫出到其他建物的距離標註。
// 座標以設計畫布像素為準（預設 1200×1200）。距離優先用提供的數字（實測或圖面）；沒給數字時依 m_per_px 從圖上換算，
// 一律標「約」並在圖面註明示意。伺服器與網站共用，不可碰 DOM。
import { corners, darken, e, FONT, hits, len, path, textW, type Box, type Pt } from './minimap';

export interface PcParcel {
  pts: Pt[];
  /** 地號，例如 123-4 */
  no?: string;
  /** 主要建物所在的基地：外框加粗 */
  site?: boolean;
  /** 地號文字位置（省略＝地塊左上角內側） */
  no_at?: Pt;
}
export interface PcRoad {
  name?: string;
  pts: Pt[];
  /** 路寬（畫布像素），預設 60 */
  w?: number;
  /** 路名位置（省略＝最長一段的中點）；角度仍順著最長一段 */
  name_at?: Pt;
}
export interface PcBuilding {
  name?: string;
  pts: Pt[];
  /** 主角建物（紅字紅框，可以不只一棟，例如同一建案的 A、B 棟） */
  main?: boolean;
  /** 第二行，例如「20F」「地上 28 層」 */
  note?: string;
}
export interface PcDistance {
  /** 起點建物名稱（省略＝第一棟主角建物） */
  from?: string;
  /** 目標建物名稱；畫兩棟之間最近的距離 */
  to?: string;
  /** 直接指定起訖點（例如退縮：建物邊到路邊），優先於 from／to */
  p?: Pt;
  q?: Pt;
  /** 距離（公尺）；省略時依 m_per_px 換算並標「約」 */
  m?: number;
  /** 自訂標註文字（優先於 m），例如「約48公尺」 */
  label?: string;
  /** major 紅色粗雙箭頭＋紅底白字（主角到鄰棟預設）｜minor 紅色細線＋白底紅字｜setback 退縮 */
  kind?: 'major' | 'minor' | 'setback';
}
export interface ParcelMap {
  title?: string;
  w?: number;
  h?: number;
  /** 每個畫布像素代表幾公尺（比例尺與自動換算距離用） */
  m_per_px?: number;
  /** paper 米白底（預設）｜transparent 透明（只輸出套繪層） */
  bg?: 'paper' | 'transparent';
  /** 底圖（第一層）：地圖截圖網址（/u/… 上傳後的網址或 https），座標就是這張圖的像素 */
  base?: string;
  /** 底圖壓暗 0–0.7，讓套繪更清楚；有底圖時預設 0 */
  dim?: number;
  /** 指北方向（度，0＝畫面上方），省略＝不畫指北針 */
  north?: number;
  parcels?: PcParcel[];
  roads?: PcRoad[];
  buildings: PcBuilding[];
  distances?: PcDistance[];
  /** 資料來源與時間，例如「底圖：Google 地圖｜距離：建照圖說」 */
  source?: string;
}

export const PC = { paper: '#f6f2e8', line: '#9b9484', lot: '#8a8373', road: '#e3ddcf', ink: '#1d1d1f', bld: '#FBE38E', bldEdge: '#3d3a33', red: '#E0262C', dim: '#1d2433' };

const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const ptOf = (v: unknown): Pt | null => (Array.isArray(v) && v.length >= 2 && Number.isFinite(+v[0]) && Number.isFinite(+v[1]) ? [+v[0], +v[1]] : null);
const ptsOf = (v: unknown): Pt[] => (Array.isArray(v) ? v.map(ptOf).filter((p): p is Pt => !!p) : []);
const str = (v: unknown, max = 30) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const normalizeParcel = (raw: unknown): { map: ParcelMap; errors: string[] } => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const errors: string[] = [];
  const list = (k: string) => (Array.isArray(r[k]) ? (r[k] as unknown[]) : []).map((x) => (x ?? {}) as Record<string, unknown>);
  const parcels = list('parcels').slice(0, 80).flatMap((o, i) => {
    const p = ptsOf(o.pts);
    if (p.length < 3) return errors.push(`parcels[${i}] 至少要 3 個點`), [];
    return [{ pts: p, no: str(o.no, 14) || undefined, site: o.site === true, no_at: ptOf(o.no_at) ?? undefined }];
  });
  const roads = list('roads').slice(0, 20).flatMap((o, i) => {
    const p = ptsOf(o.pts);
    if (p.length < 2) return errors.push(`roads[${i}] 至少要 2 個點`), [];
    return [{ name: str(o.name, 16) || undefined, pts: p, w: Math.min(300, Math.max(10, num(o.w, 60))), name_at: ptOf(o.name_at) ?? undefined }];
  });
  const buildings = list('buildings').slice(0, 40).flatMap((o, i) => {
    const p = ptsOf(o.pts);
    if (p.length < 3) return errors.push(`buildings[${i}] 至少要 3 個點`), [];
    return [{ name: str(o.name, 16) || undefined, pts: p, main: o.main === true, note: str(o.note, 20) || undefined }];
  });
  if (!buildings.length) errors.push('buildings 至少要一棟建物');
  else if (!buildings.some((b) => b.main)) errors.push('至少要一棟主角建物（main: true）');
  const names = new Set(buildings.map((b) => b.name));
  const KINDS = ['major', 'minor', 'setback'];
  const distances = list('distances').slice(0, 16).flatMap((o, i) => {
    const p = ptOf(o.p), q = ptOf(o.q), to = str(o.to, 16), from = str(o.from, 16);
    if (!(p && q)) {
      if (!to || !names.has(to)) return errors.push(`distances[${i}]：to「${to}」找不到同名建物（或改用 p、q 直接指定起訖點）`), [];
      if (from && !names.has(from)) return errors.push(`distances[${i}]：from「${from}」找不到同名建物`), [];
    }
    return [{ from: from || undefined, to: to || undefined, p: p ?? undefined, q: q ?? undefined, m: typeof o.m === 'number' && o.m > 0 ? o.m : undefined, label: str(o.label, 20) || undefined, kind: KINDS.includes(String(o.kind)) ? (o.kind as PcDistance['kind']) : undefined }];
  });
  return {
    map: {
      title: str(r.title, 40) || undefined,
      w: Math.round(Math.min(4000, Math.max(300, num(r.w, 1200)))),
      h: Math.round(Math.min(4000, Math.max(300, num(r.h, 1200)))),
      m_per_px: typeof r.m_per_px === 'number' && r.m_per_px > 0 ? r.m_per_px : undefined,
      bg: r.bg === 'transparent' ? 'transparent' : 'paper',
      base: typeof r.base === 'string' && /^(https?:\/\/|\/u\/|data:image\/)/.test(r.base) && r.base.length < 3_000_000 ? r.base : undefined,
      dim: typeof r.dim === 'number' ? Math.min(0.7, Math.max(0, r.dim)) : undefined,
      north: typeof r.north === 'number' ? r.north : undefined,
      parcels,
      roads,
      buildings,
      distances,
      source: str(r.source, 60) || undefined,
    },
    errors,
  };
};

/* ───────── 幾何：兩個多邊形之間最近的一對點 ───────── */
const closestOnSeg = (p: Pt, a: Pt, b: Pt): Pt => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0;
  return [a[0] + dx * t, a[1] + dy * t];
};
export const nearestPair = (A: Pt[], B: Pt[]): [Pt, Pt] => {
  const cand: { d: number; p: Pt; q: Pt }[] = [];
  const scan = (P: Pt[], Q: Pt[], flip: boolean) => {
    for (const p of P)
      for (let i = 0; i < Q.length; i++) {
        const q = closestOnSeg(p, Q[i], Q[(i + 1) % Q.length]);
        cand.push(flip ? { d: len(p, q), p: q, q: p } : { d: len(p, q), p, q });
      }
  };
  scan(A, B, false);
  scan(B, A, true);
  const best = cand.reduce((a, c) => (c.d < a.d ? c : a)), bd = best.d;
  // 兩棟平行相對時，最近的點對有一整段：取那段的中點，箭頭才不會貼在牆角。
  // 只平均方向相同、距離幾乎相同的點對（牆角斜過去的那組不算）
  const ux = (best.q[0] - best.p[0]) / (bd || 1), uy = (best.q[1] - best.p[1]) / (bd || 1);
  const near = cand.filter((c) => c.d <= bd * 1.02 + 0.5 && (c.d < 1e-6 || ((c.q[0] - c.p[0]) * ux + (c.q[1] - c.p[1]) * uy) / c.d > 0.999));
  const avg = (k: 'p' | 'q'): Pt => [near.reduce((s, c) => s + c[k][0], 0) / near.length, near.reduce((s, c) => s + c[k][1], 0) / near.length];
  return [avg('p'), avg('q')];
};
const centroid = (p: Pt[]): Pt => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
const fmtM = (m: number) => (m >= 100 ? Math.round(m).toString() : m.toFixed(1).replace(/\.0$/, ''));

/* ───────── 標註版面（渲染與重疊檢查共用） ───────── */
interface Dim {
  key: string;
  p: Pt;
  q: Pt;
  px: number;
  /** 一行或兩行（直向的線用兩行，數字框才不會太寬） */
  lines: string[];
  kind: 'major' | 'minor' | 'setback';
  est: boolean;
  /** 數字框中心與尺寸（不旋轉） */
  box: { cx: number; cy: number; w: number; h: number };
}
const DIM_PX: Record<Dim['kind'], number> = { major: 34, minor: 26, setback: 24 };

/** 數字框放在線的旁邊（不壓住箭頭）：side 1＝左側／上方、-1＝另一側，t＝沿線位置 */
const placeLabel = (p: Pt, q: Pt, lines: string[], px: number, side = 1, t = 0.5) => {
  const w = Math.max(...lines.map((l) => textW(l, px))) + px * 0.8, h = lines.length * px * 1.15 + px * 0.5;
  const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
  let nx = -dy / L, ny = dx / L;
  if (ny > 0 || (Math.abs(ny) < 1e-6 && nx > 0)) [nx, ny] = [-nx, -ny];
  nx *= side;
  ny *= side;
  // 沿法線往外推：框在法線方向的半寬＋間距
  const off = Math.abs(nx) * (w / 2) + Math.abs(ny) * (h / 2) + 12;
  return { cx: p[0] + dx * t + nx * off, cy: p[1] + dy * t + ny * off, w, h };
};
/** 建物的外接框（避讓用） */
const bboxOf = (pts: Pt[], name: string): Box => {
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  return { kind: 'bld', name, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: (x1 - x0) / 0.9, h: (y1 - y0) / 0.9, a: 0 };
};

export const parcelDims = (m: ParcelMap) => {
  const warnings: string[] = [];
  const mains = m.buildings.filter((b) => b.main);
  const byName = (n?: string) => m.buildings.find((b) => b.name === n);
  const dims: Dim[] = (m.distances ?? []).flatMap((d) => {
    let p = d.p, q = d.q;
    const src = d.from ? byName(d.from) : mains[0], dst = byName(d.to);
    if (!(p && q)) {
      if (!src || !dst) return [];
      [p, q] = nearestPair(src.pts, dst.pts);
      // 幾乎垂直或水平的線拉直（平均點對可能差幾個像素）
      const dx = q[0] - p[0], dy = q[1] - p[1];
      if (Math.abs(dx) < Math.abs(dy) * 0.06) p = [(p[0] + q[0]) / 2, p[1]], q = [p[0], q[1]];
      else if (Math.abs(dy) < Math.abs(dx) * 0.06) p = [p[0], (p[1] + q[1]) / 2], q = [q[0], p[1]];
    }
    const px = len(p!, q!), key = d.label ?? d.to ?? '標註';
    const kind = d.kind ?? (d.p && d.q ? 'minor' : src?.main && !dst?.main ? 'major' : 'minor');
    const est = !d.label && d.m === undefined && !!m.m_per_px;
    if (!d.label && d.m === undefined && !m.m_per_px) warnings.push(`「${key}」沒有距離數字也沒有 m_per_px，只畫線不標數字`);
    if (px < 24) warnings.push(`「${key}」的標註線太短（${Math.round(px)} 像素）`);
    const val = d.label ?? (d.m !== undefined ? `${fmtM(d.m)}公尺` : est ? `約${fmtM(px * m.m_per_px!)}公尺` : '');
    const text = kind === 'setback' && val && !val.startsWith('退縮') ? `退縮 ${val}` : val;
    const vertical = Math.abs(q![1] - p![1]) > Math.abs(q![0] - p![0]);
    // 直向的線、或主要距離：數字與「公尺」分兩行（跟常見的棟距圖一樣）
    const sp = text.match(/^(.*?)(\d[\d.]*\s*)(公尺|m)$/);
    const lines = text && (vertical || kind !== 'minor') && sp ? [`${sp[1]}${sp[2].trim()}`, sp[3]] : text ? [text] : [];
    return [{ key, p: p!, q: q!, px, lines, kind, est, box: { cx: 0, cy: 0, w: 0, h: 0 } }];
  });
  // 逐一找數字框位置：兩側 × 沿線幾個位置，挑第一個不蓋到建物、路名與已放好的數字框的位置
  const W = m.w ?? 1200, H = m.h ?? 1200;
  const obstacles: Box[] = m.buildings.map((b) => bboxOf(b.pts, b.name ?? ''));
  for (const r of m.roads ?? []) if (r.name) obstacles.push(roadBox(r));
  for (const d of dims) {
    if (!d.lines.length) continue;
    let best = placeLabel(d.p, d.q, d.lines, DIM_PX[d.kind]), bestHits = Infinity;
    for (const [side, t] of [[1, 0.5], [-1, 0.5], [1, 0.3], [1, 0.7], [-1, 0.3], [-1, 0.7]] as const) {
      const b = placeLabel(d.p, d.q, d.lines, DIM_PX[d.kind], side, t);
      const box: Box = { kind: 'dim', name: '', cx: b.cx, cy: b.cy, w: b.w, h: b.h, a: 0 };
      const out = b.cx - b.w / 2 < 0 || b.cy - b.h / 2 < 0 || b.cx + b.w / 2 > W || b.cy + b.h / 2 > H ? 1 : 0;
      const n = obstacles.filter((o) => hits(box, o)).length + out;
      if (n < bestHits) [best, bestHits] = [b, n];
      if (!n) break;
    }
    d.box = best;
    obstacles.push({ kind: 'dim', name: '', cx: best.cx, cy: best.cy, w: best.w, h: best.h, a: 0 });
  }
  return { dims, warnings };
};

/** 路名：南北向（接近直立）的路字直排、每個字正立；其他順著路段方向並拉開字距 */
const roadNameAt = (r: PcRoad) => {
  let k = 0;
  for (let j = 1; j < r.pts.length - 1; j++) if (len(r.pts[j], r.pts[j + 1]) > len(r.pts[k], r.pts[k + 1])) k = j;
  const a = r.pts[k], b = r.pts[k + 1];
  let ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  if (ang > 90) ang -= 180;
  if (ang < -90) ang += 180;
  const px = Math.round(Math.min(46, Math.max(30, (r.w ?? 60) * 0.6)));
  return { x: r.name_at?.[0] ?? (a[0] + b[0]) / 2, y: r.name_at?.[1] ?? (a[1] + b[1]) / 2, ang, px, vertical: Math.abs(ang) > 60 };
};
/** 路名佔的範圍 */
const roadBox = (r: PcRoad): Box => {
  const n = roadNameAt(r), cnt = [...(r.name ?? '')].length;
  return n.vertical ? { kind: 'road', name: r.name ?? '', cx: n.x, cy: n.y, w: n.px, h: cnt * n.px * 1.3, a: 0 } : { kind: 'road', name: r.name ?? '', cx: n.x, cy: n.y, w: textW(r.name ?? '', n.px) + cnt * n.px * 0.5, h: n.px * 1.2, a: n.ang };
};
/** 地號位置：指定位置或地塊左上角內側（文字左上對齊） */
const lotAt = (p: PcParcel): Pt => p.no_at ?? [Math.min(...p.pts.map((q) => q[0])) + 14, Math.min(...p.pts.map((q) => q[1])) + 30];
/** 建物名稱兩行：名稱、樓層 */
const bldLines = (b: PcBuilding) => [b.name ?? '', b.note ?? ''].filter(Boolean);
const BLD_PX = 30;

/** 檢查文字重疊與超出畫布 */
export const parcelLayout = (m: ParcelMap) => {
  const { dims, warnings } = parcelDims(m);
  const W = m.w ?? 1200, H = m.h ?? 1200, boxes: Box[] = [];
  for (const d of dims) if (d.lines.length) boxes.push({ kind: 'dim', name: d.lines.join(''), cx: d.box.cx, cy: d.box.cy, w: d.box.w, h: d.box.h, a: 0 });
  for (const b of m.buildings) {
    const ls = bldLines(b);
    if (!ls.length) continue;
    const c = centroid(b.pts);
    boxes.push({ kind: 'name', name: ls.join(' '), cx: c[0], cy: c[1], w: Math.max(...ls.map((l) => textW(l, BLD_PX))), h: ls.length * BLD_PX * 1.25, a: 0 });
  }
  for (const r of m.roads ?? []) if (r.name) boxes.push(roadBox(r));
  for (const p of m.parcels ?? []) if (p.no) {
    const [x, y] = lotAt(p), w = textW(p.no, 22);
    boxes.push({ kind: 'lot', name: `地號 ${p.no}`, cx: x + w / 2, cy: y - 8, w, h: 24, a: 0 });
  }
  // 距離數字框蓋到建物（用建物外接框判斷）
  for (const d of dims) {
    if (!d.lines.length) continue;
    const lb: Box = { kind: 'dim', name: d.lines.join(''), cx: d.box.cx, cy: d.box.cy, w: d.box.w, h: d.box.h, a: 0 };
    for (const b of m.buildings) {
      if (hits(lb, bboxOf(b.pts, b.name ?? ''))) warnings.push(`「${lb.name}」蓋到建物「${b.name ?? '未命名'}」，可改 kind 或把標註線移到空處（p、q）`);
    }
  }
  for (let i = 0; i < boxes.length; i++) {
    const c = corners(boxes[i]);
    if (c.some(([x, y]) => x < 0 || y < 0 || x > W || y > H)) warnings.push(`「${boxes[i].name}」超出畫布`);
    for (let j = i + 1; j < boxes.length; j++) if (hits(boxes[i], boxes[j])) warnings.push(`「${boxes[i].name}」和「${boxes[j].name}」重疊`);
  }
  return { dims, warnings };
};

/** 比例尺長度：取 1、2、5×10ⁿ 公尺，畫出來約 160–260 像素 */
const scaleBar = (mpp: number) => {
  const target = 200 * mpp, p = Math.pow(10, Math.floor(Math.log10(target)));
  const m = [1, 2, 5, 10].map((k) => k * p).reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));
  return { m, px: m / mpp };
};

const f1 = (v: number) => v.toFixed(1);
/** 雙箭頭（主要距離）：線＋兩端三角形 */
const arrow = (p: Pt, q: Pt, w: number) => {
  const ang = Math.atan2(q[1] - p[1], q[0] - p[0]), c = Math.cos(ang), s = Math.sin(ang), hl = w * 2.6, hw = w * 1.6;
  const head = (t: Pt, dir: number) => {
    const bx = t[0] - c * hl * dir, by = t[1] - s * hl * dir;
    return `M${f1(t[0])} ${f1(t[1])}L${f1(bx - s * hw)} ${f1(by + c * hw)}L${f1(bx + s * hw)} ${f1(by - c * hw)}Z`;
  };
  // 線段縮到箭頭底部，避免線頭從三角形尖端露出
  const a: Pt = [p[0] + c * hl * 0.9, p[1] + s * hl * 0.9], b: Pt = [q[0] - c * hl * 0.9, q[1] - s * hl * 0.9];
  return { line: `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`, heads: head(q, 1) + head(p, -1) };
};

export const parcelSvg = (m: ParcelMap, opts: { anim?: boolean; id?: string } = {}): string => {
  const W = m.w ?? 1200, H = m.h ?? 1200, id = opts.id ?? 'pc';
  const { dims } = parcelLayout(m);
  const an = (cls: string, i: number) => (opts.anim ? ` class="${cls}" style="--i:${i}"` : '');
  // 套繪模式：有底圖或透明底時不畫路面（底圖已經有路），線條與文字加白框
  const ov = !!m.base || m.bg === 'transparent';
  const dimBase = m.dim ?? 0;
  const HALO = '#ffffff';
  const bg = m.base
    ? `<g id="base"><image href="${e(m.base)}" width="${W}" height="${H}" preserveAspectRatio="none"/>${dimBase ? `<rect width="${W}" height="${H}" fill="#000" opacity="${dimBase}"/>` : ''}</g>`
    : m.bg === 'transparent'
      ? ''
      : `<rect width="${W}" height="${H}" fill="${PC.paper}"/>`;
  const roads = ov ? '' : (m.roads ?? []).map((r, i) => `<path${an('pc-f', i)} d="${path(r.pts)}" fill="none" stroke="${PC.road}" stroke-width="${r.w}" stroke-linejoin="round"/>`).join('');
  const roadNames = (m.roads ?? [])
    .filter((r) => r.name)
    .map((r, i) => {
      const n = roadNameAt(r), chars = [...r.name!];
      const style = `font-size="${n.px}" font-weight="900" fill="${PC.ink}" stroke="${HALO}" stroke-width="${Math.round(n.px * 0.22)}" paint-order="stroke" stroke-linejoin="round" text-anchor="middle" dominant-baseline="central"`;
      if (n.vertical) {
        const step = n.px * 1.3, y0 = n.y - ((chars.length - 1) * step) / 2;
        return `<g${an('pc-t', i)}>${chars.map((ch, k) => `<text x="${f1(n.x)}" y="${f1(y0 + k * step)}" ${style}>${e(ch)}</text>`).join('')}</g>`;
      }
      return `<text${an('pc-t', i)} transform="translate(${f1(n.x)} ${f1(n.y)}) rotate(${f1(n.ang)})" ${style} letter-spacing="${Math.round(n.px * 0.5)}">${e(r.name!)}</text>`;
    })
    .join('');
  const parcels = (m.parcels ?? [])
    .map((p, i) =>
      ov
        ? `<g${an('pc-f', i)}><path d="${path(p.pts)}Z" fill="none" stroke="${HALO}" stroke-width="${p.site ? 11 : 7}" stroke-linejoin="round" opacity=".9"/><path d="${path(p.pts)}Z" fill="none" stroke="${PC.dim}" stroke-width="${p.site ? 5 : 2.5}" stroke-linejoin="round"${p.site ? '' : ' stroke-dasharray="14 8"'}/></g>`
        : `<path${an('pc-l', i)} d="${path(p.pts)}Z" pathLength="1" fill="none" stroke="${p.site ? PC.dim : PC.line}" stroke-width="${p.site ? 4 : 2}" stroke-linejoin="round"/>`,
    )
    .join('');
  const lots = (m.parcels ?? [])
    .filter((p) => p.no)
    .map((p, i) => {
      const [x, y] = lotAt(p);
      return `<text${an('pc-t', i)} x="${f1(x)}" y="${f1(y)}" font-size="22" font-weight="800" fill="${PC.dim}" stroke="${HALO}" stroke-width="5" paint-order="stroke">${e(p.no!)}</text>`;
    })
    .join('');
  // 建物：黃色色塊＋深色框，名稱與樓層兩行；主角建物紅框紅字
  const blds = m.buildings
    .map((b, i) => {
      const c = centroid(b.pts), ls = bldLines(b), lh = BLD_PX * 1.2, y0 = c[1] - ((ls.length - 1) * lh) / 2;
      const col = b.main ? PC.red : PC.ink;
      return `<g${an(b.main ? 'pc-m' : 'pc-b', i)}>${ov ? `<path d="${path(b.pts)}Z" fill="none" stroke="${HALO}" stroke-width="9" stroke-linejoin="round"/>` : ''}<path d="${path(b.pts)}Z" fill="${PC.bld}" fill-opacity=".96" stroke="${b.main ? PC.red : PC.bldEdge}" stroke-width="${b.main ? 5 : 3}" stroke-linejoin="round"/>${ls.map((l, k) => `<text x="${f1(c[0])}" y="${f1(y0 + k * lh)}" font-size="${BLD_PX}" font-weight="900" fill="${col}" text-anchor="middle" dominant-baseline="central">${e(l)}</text>`).join('')}</g>`;
    })
    .join('');
  // 距離：主要＝紅色粗雙箭頭＋紅底白字；次要／退縮＝紅色細線兩端短線＋白底紅字（退縮紅底）
  const dimSvg = dims
    .map((d, i) => {
      const major = d.kind === 'major', px = DIM_PX[d.kind];
      let body: string;
      if (major) {
        const a = arrow(d.p, d.q, 9);
        body = `<path d="${a.line}" stroke="${HALO}" stroke-width="17" stroke-linecap="round"/><path d="${a.heads}" fill="${HALO}" stroke="${HALO}" stroke-width="8" stroke-linejoin="round"/><path d="${a.line}" stroke="${PC.red}" stroke-width="9"/><path d="${a.heads}" fill="${PC.red}"/>`;
      } else {
        const ang = Math.atan2(d.q[1] - d.p[1], d.q[0] - d.p[0]), nx = -Math.sin(ang) * 11, ny = Math.cos(ang) * 11;
        const tick = (p: Pt) => `M${f1(p[0] + nx)} ${f1(p[1] + ny)}L${f1(p[0] - nx)} ${f1(p[1] - ny)}`;
        const ln = `M${f1(d.p[0])} ${f1(d.p[1])}L${f1(d.q[0])} ${f1(d.q[1])}${tick(d.p)}${tick(d.q)}`;
        body = `<path d="${ln}" stroke="${HALO}" stroke-width="8" stroke-linecap="round"/><path d="${ln}" stroke="${PC.red}" stroke-width="3.5"${d.est ? ' stroke-dasharray="10 6"' : ''}/>`;
      }
      const filled = major || d.kind === 'setback', b = d.box;
      const label = d.lines.length
        ? `<g transform="translate(${f1(b.cx)} ${f1(b.cy)})"><rect x="${f1(-b.w / 2)}" y="${f1(-b.h / 2)}" width="${f1(b.w)}" height="${f1(b.h)}" rx="4" fill="${filled ? PC.red : '#ffffff'}" fill-opacity="${filled ? 1 : 0.92}"${filled ? '' : ` stroke="${PC.red}" stroke-width="2"`}/>${d.lines.map((l, k) => `<text y="${f1((k - (d.lines.length - 1) / 2) * px * 1.15)}" font-size="${px}" font-weight="900" fill="${filled ? '#ffffff' : PC.red}" text-anchor="middle" dominant-baseline="central">${e(l)}</text>`).join('')}</g>`
        : '';
      return `<g${an('pc-d', i)}>${body}${label}</g>`;
    })
    .join('');
  const sb = m.m_per_px ? scaleBar(m.m_per_px) : null;
  const scale = sb
    ? `<g transform="translate(${f1(W - 40 - sb.px)} ${H - 70})"><rect x="-10" y="-40" width="${f1(sb.px + 20)}" height="62" rx="6" fill="#fff" fill-opacity=".85"/><rect width="${f1(sb.px / 2)}" height="12" fill="${PC.dim}"/><rect x="${f1(sb.px / 2)}" width="${f1(sb.px / 2)}" height="12" fill="#fff" stroke="${PC.dim}" stroke-width="2"/><text y="-12" font-size="22" font-weight="700" fill="${PC.dim}">0</text><text x="${f1(sb.px)}" y="-12" font-size="22" font-weight="700" fill="${PC.dim}" text-anchor="end">${fmtM(sb.m)} 公尺</text></g>`
    : '';
  const north = m.north !== undefined ? `<g transform="translate(${W - 70} 80) rotate(${m.north})"><circle r="40" fill="#fff" stroke="${PC.dim}" stroke-width="3"/><path d="M0 -30L14 14L0 6L-14 14Z" fill="${PC.dim}"/><text y="-48" font-size="26" font-weight="900" fill="${PC.dim}" text-anchor="middle">N</text></g>` : '';
  const anyEst = dims.some((d) => d.est);
  const note = [`位置為示意${m.parcels?.length ? '，地籍以地政機關地籍圖為準' : ''}${anyEst ? '；標「約」的距離由圖面比例換算' : ''}`, m.source].filter(Boolean).join('｜');
  const css = opts.anim
    ? `<style>.pc-f,.pc-b{opacity:0;animation:${id}F 7s ease infinite both;animation-delay:calc(var(--i)*.06s)}.pc-l{stroke-dasharray:1 1;stroke-dashoffset:1;animation:${id}L 7s cubic-bezier(.5,0,.2,1) infinite both;animation-delay:calc(var(--i)*.04s)}.pc-t{opacity:0;animation:${id}T 7s ease infinite both}.pc-m{opacity:0;transform-box:fill-box;transform-origin:center;animation:${id}M 7s cubic-bezier(.3,1.4,.5,1) infinite both}.pc-d{opacity:0;animation:${id}D 7s ease infinite both;animation-delay:calc(var(--i)*.3s)}@keyframes ${id}F{0%{opacity:0}12%,94%{opacity:1}100%{opacity:0}}@keyframes ${id}L{0%{stroke-dashoffset:1;opacity:1}22%,94%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}@keyframes ${id}T{0%,18%{opacity:0}26%,94%{opacity:1}100%{opacity:0}}@keyframes ${id}M{0%,26%{opacity:0;transform:scale(.85)}36%,94%{opacity:1;transform:none}100%{opacity:0}}@keyframes ${id}D{0%,40%{opacity:0}48%,94%{opacity:1}100%{opacity:0}}</style>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family='${FONT}'>${m.title ? `<title>${e(m.title)}</title>` : ''}${css}${bg}<g id="roads">${roads}</g><g id="parcels">${parcels}</g><g id="buildings">${blds}</g><g id="road-names">${roadNames}</g><g id="lot-numbers">${lots}</g><g id="distances">${dimSvg}</g><g id="furniture">${north}${scale}<text x="36" y="${H - 34}" font-size="20" font-weight="700" fill="${PC.dim}" stroke="${HALO}" stroke-width="5" paint-order="stroke">${e(note)}</text></g></svg>`;
};

/** 範例（虛構，示意）：本案 A、B 兩棟與周邊三棟 */
export const PARCEL_SAMPLE: ParcelMap = {
  title: '本案棟距示意',
  w: 1200,
  h: 1200,
  m_per_px: 0.1,
  bg: 'paper',
  roads: [
    { name: '某某路', w: 110, pts: [[0, 1010], [1200, 1010]], name_at: [420, 1010] },
    { name: '某某街', w: 90, pts: [[110, 0], [110, 1200]] },
  ],
  buildings: [
    { name: '本案 A 棟', note: '20F', main: true, pts: [[300, 700], [520, 700], [520, 880], [300, 880]] },
    { name: '本案 B 棟', note: '20F', main: true, pts: [[640, 700], [880, 700], [880, 880], [640, 880]] },
    { name: '某某大樓', note: '14F', pts: [[300, 160], [520, 160], [520, 360], [300, 360]] },
    { name: '某某華廈', note: '13F', pts: [[680, 80], [880, 80], [880, 280], [680, 280]] },
    { name: '某某社區', note: '15F', pts: [[620, 1090], [880, 1090], [880, 1200], [620, 1200]] },
  ],
  distances: [
    { from: '本案 A 棟', to: '某某大樓' },
    { from: '本案 B 棟', to: '某某華廈' },
    { from: '本案 A 棟', to: '本案 B 棟', kind: 'minor' },
    { from: '本案 B 棟', to: '某某社區' },
    { p: [880, 790], q: [960, 790], kind: 'setback', m: 8 },
  ],
};
