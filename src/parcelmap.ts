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
}
export interface PcRoad {
  name?: string;
  pts: Pt[];
  /** 路寬（畫布像素），預設 60 */
  w?: number;
}
export interface PcBuilding {
  name?: string;
  pts: Pt[];
  /** 主要建物（只能一棟） */
  main?: boolean;
  /** 補充說明，例如「地上 28 層」 */
  note?: string;
}
export interface PcDistance {
  /** 目標建物名稱 */
  to: string;
  /** 距離（公尺）；省略時依 m_per_px 換算並標「約」 */
  m?: number;
  /** 自訂標註文字（優先於 m） */
  label?: string;
}
export interface ParcelMap {
  title?: string;
  w?: number;
  h?: number;
  /** 每個畫布像素代表幾公尺（比例尺與自動換算距離用） */
  m_per_px?: number;
  /** paper 米白底（預設）｜transparent 透明 */
  bg?: 'paper' | 'transparent';
  /** 指北方向（度，0＝畫面上方），省略＝不畫指北針 */
  north?: number;
  parcels?: PcParcel[];
  roads?: PcRoad[];
  buildings: PcBuilding[];
  distances?: PcDistance[];
  /** 資料來源與時間，例如「地籍圖資：國土測繪圖資服務雲（2026-10 查詢）」 */
  source?: string;
}

export const PC = { paper: '#f6f2e8', line: '#9b9484', lot: '#8a8373', road: '#e3ddcf', roadText: '#6b6455', bld: '#cfc9bb', bldEdge: '#77705f', main: '#E8553A', dim: '#1d2433' };

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
    return [{ pts: p, no: str(o.no, 14) || undefined, site: o.site === true }];
  });
  const roads = list('roads').slice(0, 20).flatMap((o, i) => {
    const p = ptsOf(o.pts);
    if (p.length < 2) return errors.push(`roads[${i}] 至少要 2 個點`), [];
    return [{ name: str(o.name, 16) || undefined, pts: p, w: Math.min(300, Math.max(10, num(o.w, 60))) }];
  });
  const buildings = list('buildings').slice(0, 40).flatMap((o, i) => {
    const p = ptsOf(o.pts);
    if (p.length < 3) return errors.push(`buildings[${i}] 至少要 3 個點`), [];
    return [{ name: str(o.name, 16) || undefined, pts: p, main: o.main === true, note: str(o.note, 20) || undefined }];
  });
  const mains = buildings.filter((b) => b.main);
  if (!buildings.length) errors.push('buildings 至少要一棟建物');
  else if (mains.length !== 1) errors.push(`主要建物（main: true）要剛好一棟，目前 ${mains.length} 棟`);
  const names = new Set(buildings.map((b) => b.name));
  const distances = list('distances').slice(0, 12).flatMap((o, i) => {
    const to = str(o.to, 16);
    if (!to || !names.has(to)) return errors.push(`distances[${i}].to「${to}」找不到同名建物`), [];
    return [{ to, m: typeof o.m === 'number' && o.m > 0 ? o.m : undefined, label: str(o.label, 20) || undefined }];
  });
  return {
    map: {
      title: str(r.title, 40) || undefined,
      w: Math.round(Math.min(4000, Math.max(300, num(r.w, 1200)))),
      h: Math.round(Math.min(4000, Math.max(300, num(r.h, 1200)))),
      m_per_px: typeof r.m_per_px === 'number' && r.m_per_px > 0 ? r.m_per_px : undefined,
      bg: r.bg === 'transparent' ? 'transparent' : 'paper',
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
  let best: [Pt, Pt] = [A[0], B[0]], bd = Infinity;
  const scan = (P: Pt[], Q: Pt[], flip: boolean) => {
    for (const p of P)
      for (let i = 0; i < Q.length; i++) {
        const q = closestOnSeg(p, Q[i], Q[(i + 1) % Q.length]), d = len(p, q);
        if (d < bd) [bd, best] = [d, flip ? [q, p] : [p, q]];
      }
  };
  scan(A, B, false);
  scan(B, A, true);
  return best;
};
const centroid = (p: Pt[]): Pt => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
const fmtM = (m: number) => (m >= 100 ? Math.round(m).toString() : m.toFixed(1).replace(/\.0$/, ''));

/** 距離標註：起訖點、文字、是否為換算值 */
export const parcelDims = (m: ParcelMap) => {
  const main = m.buildings.find((b) => b.main);
  const warnings: string[] = [];
  if (!main) return { dims: [], warnings };
  const dims = (m.distances ?? []).flatMap((d) => {
    const t = m.buildings.find((b) => b.name === d.to);
    if (!t) return [];
    const [p, q] = nearestPair(main.pts, t.pts), px = len(p, q);
    const est = !d.label && d.m === undefined;
    if (est && !m.m_per_px) warnings.push(`到「${d.to}」沒有距離數字也沒有 m_per_px，只畫標註線不標數字`);
    if (px < 30) warnings.push(`到「${d.to}」的標註線太短（${Math.round(px)} 像素），數字會擠不下`);
    const text = d.label ?? (d.m !== undefined ? `${fmtM(d.m)} m` : m.m_per_px ? `約 ${fmtM(px * m.m_per_px)} m` : '');
    return [{ to: d.to, p, q, px, text, est: est && !!m.m_per_px }];
  });
  return { dims, warnings };
};

/** 距離數字放在標註線靠目標那一側：多條線從主建物同一個角出發時才不會擠在一起；
 *  線比數字框短（框會蓋住兩端的短線）就把數字移到線的旁邊 */
const DIM_AT = 0.6;
const dimLabelAt = (p: Pt, q: Pt, text: string): Pt => {
  const L = len(p, q), w = textW(text, 30) + 22, ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
  const x = p[0] + (q[0] - p[0]) * (L > w * 1.5 ? DIM_AT : 0.5), y = p[1] + (q[1] - p[1]) * (L > w * 1.5 ? DIM_AT : 0.5);
  if (L > w * 1.25) return [x, y];
  // 往法線方向（畫面上偏上或偏左）移開
  let nx = -Math.sin(ang), ny = Math.cos(ang);
  if (ny > 0 || (ny === 0 && nx > 0)) [nx, ny] = [-nx, -ny];
  return [x + nx * 38, y + ny * 38];
};

/** 檢查文字重疊與超出畫布 */
export const parcelLayout = (m: ParcelMap) => {
  const { dims, warnings } = parcelDims(m);
  const W = m.w ?? 1200, H = m.h ?? 1200, boxes: Box[] = [];
  const dimPx = 30, namePx = 30;
  for (const d of dims) {
    if (!d.text) continue;
    const ang = (Math.atan2(d.q[1] - d.p[1], d.q[0] - d.p[0]) * 180) / Math.PI;
    const a = ang > 90 ? ang - 180 : ang < -90 ? ang + 180 : ang;
    const c = dimLabelAt(d.p, d.q, d.text);
    boxes.push({ kind: 'dim', name: d.text, cx: c[0], cy: c[1], w: textW(d.text, dimPx) + 20, h: dimPx * 1.4, a });
  }
  for (const b of m.buildings) if (b.name) {
    const c = centroid(b.pts), px = b.main ? 36 : namePx;
    boxes.push({ kind: 'name', name: b.name, cx: c[0], cy: c[1], w: textW(b.name, px) + (b.main ? 36 : 8), h: px * 1.5, a: 0 });
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

export const parcelSvg = (m: ParcelMap, opts: { anim?: boolean; id?: string } = {}): string => {
  const W = m.w ?? 1200, H = m.h ?? 1200, id = opts.id ?? 'pc';
  const { dims } = parcelLayout(m);
  const an = (cls: string, i: number) => (opts.anim ? ` class="${cls}" style="--i:${i}"` : '');
  const bg = m.bg === 'transparent' ? '' : `<rect width="${W}" height="${H}" fill="${PC.paper}"/>`;
  const roads = (m.roads ?? []).map((r, i) => `<path${an('pc-f', i)} d="${path(r.pts)}" fill="none" stroke="${PC.road}" stroke-width="${r.w}" stroke-linecap="butt" stroke-linejoin="round"/>`).join('');
  const roadNames = (m.roads ?? [])
    .filter((r) => r.name)
    .map((r, i) => {
      let k = 0;
      for (let j = 1; j < r.pts.length - 1; j++) if (len(r.pts[j], r.pts[j + 1]) > len(r.pts[k], r.pts[k + 1])) k = j;
      const a = r.pts[k], b = r.pts[k + 1];
      let ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
      if (ang > 90) ang -= 180;
      if (ang < -90) ang += 180;
      return `<text${an('pc-t', i)} transform="translate(${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}) rotate(${ang.toFixed(1)})" font-size="${Math.round(Math.min(34, r.w! * 0.5))}" font-weight="700" fill="${PC.roadText}" text-anchor="middle" dominant-baseline="central" letter-spacing="4">${e(r.name!)}</text>`;
    })
    .join('');
  const parcels = (m.parcels ?? []).map((p, i) => `<path${an('pc-l', i)} d="${path(p.pts)}Z" pathLength="1" fill="none" stroke="${p.site ? PC.dim : PC.line}" stroke-width="${p.site ? 4 : 2}" stroke-dasharray="${p.site ? '' : ''}" stroke-linejoin="round"/>`).join('');
  const lots = (m.parcels ?? [])
    .filter((p) => p.no)
    .map((p, i) => {
      // 地號放在地塊左上角內側，避免被建物蓋住
      const x0 = Math.min(...p.pts.map((q) => q[0])), y0 = Math.min(...p.pts.map((q) => q[1]));
      return `<text${an('pc-t', i)} x="${(x0 + 14).toFixed(1)}" y="${(y0 + 30).toFixed(1)}" font-size="22" font-weight="500" fill="${PC.lot}">${e(p.no!)}</text>`;
    })
    .join('');
  const others = m.buildings.filter((b) => !b.main);
  const main = m.buildings.find((b) => b.main);
  const bld = others.map((b, i) => `<path${an('pc-b', i)} d="${path(b.pts)}Z" fill="url(#${id}-h)" stroke="${PC.bldEdge}" stroke-width="2.5" stroke-linejoin="round"/>`).join('');
  const bldNames = others
    .filter((b) => b.name)
    .map((b, i) => {
      const c = centroid(b.pts);
      return `<text${an('pc-t', i)} x="${c[0].toFixed(1)}" y="${c[1].toFixed(1)}" font-size="30" font-weight="900" fill="#3d3a33" stroke="${PC.paper}" stroke-width="6" paint-order="stroke" text-anchor="middle" dominant-baseline="central">${e(b.name!)}</text>`;
    })
    .join('');
  let mainSvg = '';
  if (main) {
    const c = centroid(main.pts), name = main.name ?? '本案', w = textW(name, 36) + 36;
    mainSvg = `<g${an('pc-m', 0)}><path d="${path(main.pts)}Z" fill="${PC.main}" stroke="${darken(PC.main)}" stroke-width="4" stroke-linejoin="round"/><g transform="translate(${c[0].toFixed(1)} ${c[1].toFixed(1)})"><rect x="${(-w / 2).toFixed(1)}" y="-27" width="${w.toFixed(1)}" height="54" rx="10" fill="#fff" stroke="${darken(PC.main)}" stroke-width="3"/><text font-size="36" font-weight="900" fill="${darken(PC.main)}" text-anchor="middle" dominant-baseline="central">${e(name)}</text>${main.note ? `<text y="52" font-size="24" font-weight="700" fill="#fff" stroke="${darken(PC.main)}" stroke-width="5" paint-order="stroke" text-anchor="middle" dominant-baseline="central">${e(main.note)}</text>` : ''}</g></g>`;
  }
  // 距離標註：兩端垂直短線＋中間白底數字，數字順著標註線方向
  const dimSvg = dims
    .map((d, i) => {
      const ang = Math.atan2(d.q[1] - d.p[1], d.q[0] - d.p[0]), nx = -Math.sin(ang) * 14, ny = Math.cos(ang) * 14;
      let deg = (ang * 180) / Math.PI;
      if (deg > 90) deg -= 180;
      if (deg < -90) deg += 180;
      const [mx, my] = dimLabelAt(d.p, d.q, d.text), tw = textW(d.text, 30) + 22;
      const tick = (p: Pt) => `M${(p[0] + nx).toFixed(1)} ${(p[1] + ny).toFixed(1)}L${(p[0] - nx).toFixed(1)} ${(p[1] - ny).toFixed(1)}`;
      return `<g${an('pc-d', i)}><path d="M${d.p[0].toFixed(1)} ${d.p[1].toFixed(1)}L${d.q[0].toFixed(1)} ${d.q[1].toFixed(1)}" pathLength="1" stroke="${PC.dim}" stroke-width="3.5"${d.est ? ' stroke-dasharray="0.04 0.025"' : ''}/><path d="${tick(d.p)}${tick(d.q)}" stroke="${PC.dim}" stroke-width="3.5"/>${d.text ? `<g transform="translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(${deg.toFixed(1)})"><rect x="${(-tw / 2).toFixed(1)}" y="-21" width="${tw.toFixed(1)}" height="42" rx="8" fill="#fff" stroke="${PC.dim}" stroke-width="2.5"/><text font-size="30" font-weight="900" fill="${PC.dim}" text-anchor="middle" dominant-baseline="central">${e(d.text)}</text></g>` : ''}</g>`;
    })
    .join('');
  const sb = m.m_per_px ? scaleBar(m.m_per_px) : null;
  const scale = sb
    ? `<g transform="translate(${W - 40 - sb.px} ${H - 70})"><rect width="${(sb.px / 2).toFixed(1)}" height="12" fill="${PC.dim}"/><rect x="${(sb.px / 2).toFixed(1)}" width="${(sb.px / 2).toFixed(1)}" height="12" fill="#fff" stroke="${PC.dim}" stroke-width="2"/><text y="-12" font-size="22" font-weight="700" fill="${PC.dim}">0</text><text x="${sb.px.toFixed(1)}" y="-12" font-size="22" font-weight="700" fill="${PC.dim}" text-anchor="end">${fmtM(sb.m)} m</text></g>`
    : '';
  const north = m.north !== undefined ? `<g transform="translate(${W - 70} 80) rotate(${m.north})"><circle r="40" fill="#fff" stroke="${PC.dim}" stroke-width="3"/><path d="M0 -30L14 14L0 6L-14 14Z" fill="${PC.dim}"/><text y="-48" font-size="26" font-weight="900" fill="${PC.dim}" text-anchor="middle">N</text></g>` : '';
  const anyEst = dims.some((d) => d.est);
  const note = [`地籍與建物位置為示意，以地政機關地籍圖為準${anyEst ? '；標「約」的距離由圖面比例換算' : ''}`, m.source].filter(Boolean).join('｜');
  const css = opts.anim
    ? `<style>.pc-f,.pc-b{opacity:0;animation:${id}F 7s ease infinite both;animation-delay:calc(var(--i)*.06s)}.pc-l{stroke-dasharray:1 1;stroke-dashoffset:1;animation:${id}L 7s cubic-bezier(.5,0,.2,1) infinite both;animation-delay:calc(var(--i)*.04s)}.pc-t{opacity:0;animation:${id}T 7s ease infinite both}.pc-m{opacity:0;transform-box:fill-box;transform-origin:center;animation:${id}M 7s cubic-bezier(.3,1.4,.5,1) infinite both}.pc-d{opacity:0;animation:${id}D 7s ease infinite both;animation-delay:calc(var(--i)*.35s)}@keyframes ${id}F{0%{opacity:0}12%,94%{opacity:1}100%{opacity:0}}@keyframes ${id}L{0%{stroke-dashoffset:1;opacity:1}22%,94%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}@keyframes ${id}T{0%,18%{opacity:0}26%,94%{opacity:1}100%{opacity:0}}@keyframes ${id}M{0%,26%{opacity:0;transform:scale(.8)}36%,94%{opacity:1;transform:none}100%{opacity:0}}@keyframes ${id}D{0%,40%{opacity:0}48%,94%{opacity:1}100%{opacity:0}}</style>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family='${FONT}'>${m.title ? `<title>${e(m.title)}</title>` : ''}${css}<defs><pattern id="${id}-h" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="${PC.bld}"/><path d="M0 0V14" stroke="#b3ad9e" stroke-width="3"/></pattern></defs>${bg}<g id="roads">${roads}${roadNames}</g><g id="parcels">${parcels}${lots}</g><g id="buildings">${bld}${bldNames}</g><g id="main">${mainSvg}</g><g id="distances">${dimSvg}</g><g id="furniture">${north}${scale}<text x="36" y="${H - 34}" font-size="20" font-weight="700" fill="${PC.lot}">${e(note)}</text></g></svg>`;
};

/** 範例（虛構，示意）：街角基地上的本案與三棟鄰棟 */
export const PARCEL_SAMPLE: ParcelMap = {
  title: '本案棟距示意',
  w: 1200,
  h: 1200,
  m_per_px: 0.1,
  north: 0,
  bg: 'paper',
  roads: [
    { name: '某某路（示意）', w: 110, pts: [[0, 150], [1200, 150]] },
    { name: '某某街（示意）', w: 80, pts: [[150, 0], [150, 1200]] },
  ],
  parcels: [
    { no: '101', site: true, pts: [[210, 210], [640, 210], [640, 640], [210, 640]] },
    { no: '102', pts: [[640, 210], [1000, 210], [1000, 520], [640, 520]] },
    { no: '103', pts: [[1000, 210], [1200, 210], [1200, 520], [1000, 520]] },
    { no: '104', pts: [[640, 520], [1200, 520], [1200, 860], [640, 860]] },
    { no: '105', pts: [[210, 640], [640, 640], [640, 1000], [210, 1000]] },
    { no: '106', pts: [[210, 1000], [700, 1000], [700, 1200], [210, 1200]] },
    { no: '107', pts: [[700, 860], [1200, 860], [1200, 1200], [700, 1200]] },
  ],
  buildings: [
    { name: '本案', main: true, note: '地上 24 層（示意）', pts: [[290, 280], [560, 280], [560, 560], [290, 560]] },
    { name: 'A 棟', pts: [[740, 270], [940, 270], [940, 460], [740, 460]] },
    { name: 'B 棟', pts: [[760, 620], [1100, 620], [1100, 790], [760, 790]] },
    { name: 'C 棟', pts: [[270, 760], [560, 760], [560, 940], [270, 940]] },
  ],
  distances: [{ to: 'A 棟' }, { to: 'B 棟' }, { to: 'C 棟' }],
};
