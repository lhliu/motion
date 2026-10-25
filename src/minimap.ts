// 小地圖公版：把「道路中心線＋區塊＋地標」的 JSON 規格畫成透明背景的向量小地圖（SVG）。
// 用途：疊在影片上的區位小地圖。AI 依使用者給的地圖截圖描出座標（以設計畫布像素為單位，預設 1410×1128），
// 道路、區塊、文字分層輸出，可直接下載 SVG 編輯，也可轉透明 PNG 或放進 Combo 疊加。
// 伺服器與網站共用，不可碰 DOM。

export type Pt = [number, number];
export interface MiniRoad {
  name?: string;
  pts: Pt[];
  /** main＝主要道路、minor＝次要道路，或直接給線寬 */
  w?: 'main' | 'minor' | number;
  /** 路名放在第幾段（0 起算）；省略＝最長的一段 */
  seg?: number;
  /** 路名在該段的位置 0–1，預設 0.5 */
  at?: number;
  /** 道路顏色，預設深灰 #34464C */
  color?: string;
  /** 虛線（巷道、步道）：方點虛線，不畫路名 */
  dash?: boolean;
}
export interface MiniArea {
  /** park 公園、social 社宅、housing 一般住宅、civic 公共設施、water 水域、custom 自訂顏色 */
  kind: 'park' | 'social' | 'housing' | 'civic' | 'water' | 'custom';
  pts: Pt[];
  color?: string;
  /** 區塊名稱（膠囊標籤） */
  label?: string;
  label_at?: Pt;
  /** 圓形代號（A、B、C…） */
  tag?: string;
  tag_at?: Pt;
  /** 名稱與區塊之間畫短引線 */
  leader?: boolean;
}
export interface MiniPlace {
  name: string;
  /** 地點位置（畫小圓點） */
  at: Pt;
  /** 標籤中心；省略＝放在地點上方 */
  label_at?: Pt;
  color?: string;
}
export type MiniPlace16 = 'tr' | 'duo' | 'full' | { x: number; y: number; w: number };
export interface MiniMap {
  title?: string;
  /** 設計畫布尺寸，座標都以此為準 */
  w?: number;
  h?: number;
  roads: MiniRoad[];
  areas?: MiniArea[];
  places?: MiniPlace[];
  /** 來源標示，例如「© OSM contributors」 */
  source?: string;
  /** 疊在 16:9 影片上的位置：tr＝右上角版、duo＝雙人鏡頭避臉版、full＝滿版置中，或 1920×1080 座標 {x,y,w} */
  place?: MiniPlace16;
  /** 道路、文字縮放（小尺寸疊加時可調大），預設 1 */
  scale?: number;
  /** outline＝白色外緣＋陰影、圓頭道路（預設）；flat＝平面示意圖：無外緣陰影、色塊無框、道路平頭 */
  style?: 'outline' | 'flat';
  /** 指北針：north 為北方角度（0＝正上、順時針為正），north_at 為圓心座標 */
  north?: number;
  north_at?: Pt;
}

export const MINI_COLORS = { road: '#34464C', park: '#72B98D', social: '#F0B849', housing: '#82BFDB', civic: '#5795C0', water: '#8CC8E8' };
const EDGE: Record<string, string> = { park: '#3f8a5c', social: '#b07a1c', housing: '#4f8fae', civic: '#2f6690', water: '#4f9cc4' };
/** 名稱膠囊：淺底、深色字與框 */
const PILL: Record<string, [string, string]> = { park: ['#e8f5ec', '#2f6b45'], social: ['#fff4dc', '#7a5410'], housing: ['#e6f3fa', '#2f6b8a'], civic: ['#eef4fa', '#1f3f5c'], water: ['#e6f3fa', '#2f6b8a'], place: ['#f3eefa', '#6d4c9f'] };
export const MINI_PLACES: Record<'tr' | 'duo', { x: number; y: number; w: number }> = { tr: { x: 1400, y: 55, w: 470 }, duo: { x: 600, y: 40, w: 460 } };

const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const pt = (v: unknown): Pt | null => (Array.isArray(v) && v.length >= 2 && Number.isFinite(+v[0]) && Number.isFinite(+v[1]) ? [+v[0], +v[1]] : null);
const pts = (v: unknown): Pt[] => (Array.isArray(v) ? v.map(pt).filter((p): p is Pt => !!p) : []);
const str = (v: unknown, max = 40) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const hex = (v: unknown) => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : undefined);

/** 整理輸入，回傳規格與錯誤 */
export const normalizeMini = (raw: unknown): { map: MiniMap; errors: string[] } => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const errors: string[] = [];
  const W = Math.round(Math.min(4000, Math.max(200, num(r.w, 1410)))), H = Math.round(Math.min(4000, Math.max(200, num(r.h, 1128))));
  const roads = (Array.isArray(r.roads) ? r.roads : []).slice(0, 60).flatMap((x, i) => {
    const o = (x ?? {}) as Record<string, unknown>, p = pts(o.pts);
    if (p.length < 2) {
      errors.push(`roads[${i}] 至少要 2 個點`);
      return [];
    }
    const w = o.w === 'main' || o.w === 'minor' ? o.w : typeof o.w === 'number' ? Math.min(160, Math.max(4, o.w)) : 'main';
    const dash = o.dash === true;
    return [{ name: dash ? undefined : str(o.name, 16) || undefined, pts: p, w, seg: typeof o.seg === 'number' ? Math.round(o.seg) : undefined, at: typeof o.at === 'number' ? Math.min(0.95, Math.max(0.05, o.at)) : undefined, color: hex(o.color), dash: dash || undefined } as MiniRoad];
  });
  if (!roads.length) errors.push('roads 至少要一條道路（pts 為道路中心線座標）');
  const KINDS = ['park', 'social', 'housing', 'civic', 'water', 'custom'];
  const areas = (Array.isArray(r.areas) ? r.areas : []).slice(0, 40).flatMap((x, i) => {
    const o = (x ?? {}) as Record<string, unknown>, p = pts(o.pts);
    if (p.length < 3) {
      errors.push(`areas[${i}] 至少要 3 個點`);
      return [];
    }
    const kind = (KINDS.includes(String(o.kind)) ? o.kind : 'custom') as MiniArea['kind'];
    return [{ kind, pts: p, color: hex(o.color), label: str(o.label, 16) || undefined, label_at: pt(o.label_at) ?? undefined, tag: str(o.tag, 3) || undefined, tag_at: pt(o.tag_at) ?? undefined, leader: o.leader === true } as MiniArea];
  });
  const places = (Array.isArray(r.places) ? r.places : []).slice(0, 12).flatMap((x, i) => {
    const o = (x ?? {}) as Record<string, unknown>, at = pt(o.at);
    if (!at || !str(o.name)) {
      errors.push(`places[${i}] 需要 name 與 at`);
      return [];
    }
    return [{ name: str(o.name, 16), at, label_at: pt(o.label_at) ?? undefined, color: hex(o.color) } as MiniPlace];
  });
  const pl = r.place;
  const place: MiniPlace16 =
    pl === 'tr' || pl === 'duo' || pl === 'full' ? pl : pl && typeof pl === 'object' ? { x: num((pl as Record<string, unknown>).x, 1400), y: num((pl as Record<string, unknown>).y, 55), w: Math.max(120, num((pl as Record<string, unknown>).w, 470)) } : 'tr';
  return { map: { title: str(r.title, 40) || undefined, w: W, h: H, roads, areas, places, source: str(r.source, 60) || undefined, place, scale: Math.min(2, Math.max(0.6, num(r.scale, 1))), style: r.style === 'flat' ? 'flat' : undefined, north: typeof r.north === 'number' && Number.isFinite(r.north) ? ((r.north % 360) + 360) % 360 : undefined, north_at: pt(r.north_at) ?? undefined }, errors };
};

/* ───────── 版面計算 ───────── */
export const len = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const roadW = (r: MiniRoad, k: number) => (typeof r.w === 'number' ? r.w : r.w === 'minor' ? 56 : 70) * k;
/** 粗估文字寬度：中文全形 1em、英數 0.6em */
export const textW = (s: string, px: number) => [...s].reduce((a, c) => a + (/[\u0000-ÿ]/.test(c) ? 0.6 : 1), 0) * px;

export interface Box {
  kind: string;
  name: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  /** 旋轉角（度），用來算外接框 */
  a: number;
}
const aabb = (b: Box) => {
  const r = (b.a * Math.PI) / 180, c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r));
  const w = b.w * c + b.h * s, h = b.w * s + b.h * c;
  return { x0: b.cx - w / 2, y0: b.cy - h / 2, x1: b.cx + w / 2, y1: b.cy + h / 2 };
};

/** 兩個（可旋轉的）矩形是否重疊：分離軸檢查，各邊先內縮一成，擦邊不算 */
export const corners = (b: Box) => {
  const r = (b.a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r), w = b.w * 0.45, h = b.h * 0.45;
  return ([[-w, -h], [w, -h], [w, h], [-w, h]] as Pt[]).map(([x, y]) => [b.cx + x * c - y * s, b.cy + x * s + y * c] as Pt);
};
export const hits = (A: Box, B: Box) => {
  const pa = corners(A), pb = corners(B);
  for (const poly of [pa, pb])
    for (let i = 0; i < 4; i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % 4], nx = y2 - y1, ny = x1 - x2;
      const pr = (p: Pt[]) => p.map(([x, y]) => x * nx + y * ny);
      const a = pr(pa), b = pr(pb);
      if (Math.max(...a) < Math.min(...b) || Math.max(...b) < Math.min(...a)) return false;
    }
  return true;
};

/** 路名位置：指定段或最長段的中點，文字順著路段方向且不倒過來 */
const roadLabel = (r: MiniRoad, k: number) => {
  let i = r.seg ?? -1;
  if (i < 0 || i >= r.pts.length - 1) {
    i = 0;
    for (let j = 1; j < r.pts.length - 1; j++) if (len(r.pts[j], r.pts[j + 1]) > len(r.pts[i], r.pts[i + 1])) i = j;
  }
  const a = r.pts[i], b = r.pts[i + 1], f = r.at ?? 0.5;
  let ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  if (ang > 90) ang -= 180;
  if (ang < -90) ang += 180;
  // 次要道路的路名也至少 40（縮到影片尺寸才看得清楚）
  const px = Math.round(Math.max(roadW(r, k) * 0.62, 40 * k));
  return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, ang, px, segLen: len(a, b) };
};
const centroid = (p: Pt[]): Pt => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];

/** 算出所有文字的位置，並檢查互相重疊、超出畫布、路名比路段長 */
export const miniLayout = (m: MiniMap) => {
  const k = m.scale ?? 1, W = m.w ?? 1410, H = m.h ?? 1128;
  const boxes: Box[] = [];
  const warnings: string[] = [];
  const roads = m.roads.map((r) => {
    if (!r.name || r.dash) return { r, lb: null };
    const lb = roadLabel(r, k);
    const w = textW(r.name, lb.px) + lb.px * 0.6;
    boxes.push({ kind: 'road', name: r.name, cx: lb.x, cy: lb.y, w, h: lb.px * 1.1, a: lb.ang });
    if (w > lb.segLen * 0.92) warnings.push(`路名「${r.name}」比所在路段長，請把路段畫長一點或用 seg 指定較長的一段`);
    return { r, lb };
  });
  const tagR = 36 * k, pillPx = 40 * k;
  const areas = (m.areas ?? []).map((a) => {
    const c = centroid(a.pts);
    const tag = a.tag ? { at: a.tag_at ?? c } : null;
    if (tag) boxes.push({ kind: 'tag', name: a.tag!, cx: tag.at[0], cy: tag.at[1], w: tagR * 2, h: tagR * 2, a: 0 });
    const pill = a.label ? { at: a.label_at ?? c, w: textW(a.label, pillPx) + pillPx * 1.1, h: pillPx * 1.55 } : null;
    if (pill) boxes.push({ kind: 'label', name: a.label!, cx: pill.at[0], cy: pill.at[1], w: pill.w, h: pill.h, a: 0 });
    return { a, c, tag, pill };
  });
  const places = (m.places ?? []).map((p) => {
    const at = p.label_at ?? [p.at[0], p.at[1] - 70 * k];
    const pill = { at, w: textW(p.name, pillPx) + pillPx * 1.1, h: pillPx * 1.55 };
    boxes.push({ kind: 'place', name: p.name, cx: at[0], cy: at[1], w: pill.w, h: pill.h, a: 0 });
    return { p, pill };
  });
  for (let i = 0; i < boxes.length; i++) {
    const A = aabb(boxes[i]);
    if (A.x0 < 0 || A.y0 < 0 || A.x1 > W || A.y1 > H) warnings.push(`「${boxes[i].name}」超出畫布`);
    for (let j = i + 1; j < boxes.length; j++) if (hits(boxes[i], boxes[j])) warnings.push(`「${boxes[i].name}」和「${boxes[j].name}」重疊`);
  }
  return { roads, areas, places, warnings, tagR, pillPx, k };
};

/** 自訂顏色的邊框：同色系調暗 */
export const darken = (c: string) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(c.slice(i, i + 2), 16) * 0.7).toString(16).padStart(2, '0')).join('');
export const e = (s: string) => s.replace(/[&<>"]/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[c]};`);
export const path = (p: Pt[]) => p.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('');
export const FONT = `"Chiron Hei HK","Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif`;

/**
 * 產生 SVG。anim=true 時加上進場動畫的 class（給影片用：區塊淡入、道路畫出、文字彈出）；
 * 圖層分組 id：halo（白色外緣與陰影）、areas、roads、road-labels、labels，方便在向量軟體裡分別調整。
 */
export const miniSvg = (m: MiniMap, opts: { anim?: boolean; id?: string } = {}): string => {
  const L = miniLayout(m), W = m.w ?? 1410, H = m.h ?? 1128, k = L.k;
  const id = opts.id ?? 'mm';
  const fillOf = (a: MiniArea) => a.color ?? (a.kind === 'custom' ? '#cccccc' : MINI_COLORS[a.kind]);
  const edgeOf = (a: MiniArea) => (a.color ? darken(a.color) : EDGE[a.kind] ?? '#888');
  const an = (cls: string, i: number) => (opts.anim ? ` class="${cls}" style="--i:${i}"` : '');
  const flat = m.style === 'flat';
  const halo = flat ? '' : [
    ...(m.areas ?? []).map((a) => `<path d="${path(a.pts)}Z" fill="#fff" stroke="#fff" stroke-width="${12 * k}" stroke-linejoin="round"/>`),
    ...m.roads.map((r) => `<path d="${path(r.pts)}" fill="none" stroke="#fff" stroke-width="${roadW(r, k) + 14 * k}" stroke-linecap="round" stroke-linejoin="round"/>`),
  ].join('');
  const areas = (m.areas ?? []).map((a, i) => `<path${an('mm-a', i)} d="${path(a.pts)}Z" fill="${fillOf(a)}"${flat ? '' : ` stroke="${edgeOf(a)}" stroke-width="${3 * k}" stroke-linejoin="round"`}/>`).join('');
  // 實線道路用 pathLength 畫出；虛線（方點）不能用同一招，改成淡入
  const roads = m.roads
    .map((r, i) => {
      const w = roadW(r, k), col = r.color ?? MINI_COLORS.road;
      if (r.dash) return `<path${an('mm-t', i)} d="${path(r.pts)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-dasharray="${w} ${w}" stroke-linecap="butt"/>`;
      return `<path${an('mm-r', i)} d="${path(r.pts)}" pathLength="1" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="${flat ? 'butt' : 'round'}" stroke-linejoin="${flat ? 'miter' : 'round'}"/>`;
    })
    .join('');
  // 指北針：藍色圓底＋淺色導航箭頭，N 字在箭頭尖端外側，整組依 north 旋轉
  const nr = 48 * k, nAt = m.north_at ?? [90 * k, 90 * k];
  const compass =
    m.north === undefined
      ? ''
      : `<g${an('mm-l', 0)} transform="translate(${nAt[0].toFixed(1)} ${nAt[1].toFixed(1)}) rotate(${m.north.toFixed(1)})"><circle r="${nr}" fill="#8FA5C3"/><path d="M0 ${(-nr * 0.72).toFixed(1)}L${(nr * 0.46).toFixed(1)} ${(nr * 0.5).toFixed(1)}L0 ${(nr * 0.28).toFixed(1)}L${(-nr * 0.46).toFixed(1)} ${(nr * 0.5).toFixed(1)}Z" fill="#CBD5E3" stroke="#CBD5E3" stroke-width="${4 * k}" stroke-linejoin="round"/><path d="M${(-nr * 0.24).toFixed(1)} ${(-nr * 1.14).toFixed(1)}V${(-nr * 1.6).toFixed(1)}L${(nr * 0.24).toFixed(1)} ${(-nr * 1.14).toFixed(1)}V${(-nr * 1.6).toFixed(1)}" fill="none" stroke="#7A7A7A" stroke-width="${6 * k}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const roadLabels = L.roads
    .filter((x) => x.lb)
    .map(({ r, lb }, i) => `<text${an('mm-t', i)} transform="translate(${lb!.x.toFixed(1)} ${lb!.y.toFixed(1)}) rotate(${lb!.ang.toFixed(1)})" font-size="${lb!.px}" font-weight="900" fill="#fff" text-anchor="middle" dominant-baseline="central" letter-spacing="${(lb!.px * 0.04).toFixed(1)}">${e(r.name!)}</text>`)
    .join('');
  const pillSvg = (cx: number, cy: number, w: number, h: number, text: string, [bg, fg]: [string, string], i: number) =>
    `<g${an('mm-l', i)} transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)})"><rect x="${(-w / 2).toFixed(1)}" y="${(-h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${(h * 0.32).toFixed(1)}" fill="${bg}" stroke="${fg}" stroke-width="${2.5 * k}"/><text font-size="${L.pillPx}" font-weight="900" fill="${fg}" text-anchor="middle" dominant-baseline="central">${e(text)}</text></g>`;
  let li = 0;
  const labels = [
    ...L.areas.flatMap(({ a, c, tag, pill }) => [
      ...(pill && a.leader ? [`<path d="M${pill.at[0].toFixed(1)} ${(pill.at[1] - (pill.at[1] > c[1] ? pill.h / 2 : -pill.h / 2)).toFixed(1)}L${c[0].toFixed(1)} ${c[1].toFixed(1)}" stroke="${PILL[a.kind]?.[1] ?? '#333'}" stroke-width="${3 * k}"/>`] : []),
      ...(pill ? [pillSvg(pill.at[0], pill.at[1], pill.w, pill.h, a.label!, PILL[a.kind] ?? ['#fff', '#333'], li++)] : []),
      ...(tag
        ? [`<g${an('mm-l', li++)} transform="translate(${tag.at[0].toFixed(1)} ${tag.at[1].toFixed(1)})"><circle r="${L.tagR}" fill="#fff8ea" stroke="#8a5a14" stroke-width="${3 * k}"/><text font-size="${(L.tagR * 1.25).toFixed(1)}" font-weight="700" fill="#7a4e10" text-anchor="middle" dominant-baseline="central">${e(a.tag!)}</text></g>`]
        : []),
    ]),
    ...L.places.map(({ p, pill }) => {
      const col = p.color ?? PILL.place[1];
      const edgeY = pill.at[1] + (pill.at[1] < p.at[1] ? pill.h / 2 : -pill.h / 2);
      return `<g${an('mm-l', li++)}><path d="M${p.at[0].toFixed(1)} ${p.at[1].toFixed(1)}L${(pill.at[0] - pill.w * 0.3).toFixed(1)} ${edgeY.toFixed(1)}" stroke="${col}" stroke-width="${3.5 * k}"/><circle cx="${p.at[0]}" cy="${p.at[1]}" r="${11 * k}" fill="${col}" stroke="#fff" stroke-width="${3 * k}"/></g>${pillSvg(pill.at[0], pill.at[1], pill.w, pill.h, p.name, [PILL.place[0], col], li++)}`;
    }),
  ].join('');
  const src = m.source ? `<text x="${W - 30}" y="${H - 30}" font-size="${22 * k}" font-weight="700" fill="#34464C" stroke="#fff" stroke-width="${5 * k}" paint-order="stroke" text-anchor="end">${e(m.source)}</text>` : '';
  const css = opts.anim
    ? `<style>.mm-a{opacity:0;transform-box:fill-box;transform-origin:center;animation:${id}A 6s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:calc(var(--i)*.08s)}.mm-r{stroke-dasharray:1 1;stroke-dashoffset:1;animation:${id}R 6s cubic-bezier(.5,0,.2,1) infinite both;animation-delay:calc(var(--i)*.07s)}.mm-t,.mm-l{opacity:0;animation:${id}T 6s ease infinite both;animation-delay:calc(var(--i)*.06s)}@keyframes ${id}A{0%,4%{opacity:0;transform:scale(.92)}16%,94%{opacity:1;transform:none}100%{opacity:0}}@keyframes ${id}R{0%,6%{stroke-dashoffset:1;opacity:1}30%,94%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}@keyframes ${id}T{0%,30%{opacity:0}40%,94%{opacity:1}100%{opacity:0}}</style>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family='${FONT}'>${m.title ? `<title>${e(m.title)}</title>` : ''}${css}<defs><filter id="${id}-sh" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="${4 * k}" stdDeviation="${6 * k}" flood-color="#000" flood-opacity=".28"/></filter></defs><g id="halo" ${flat ? '' : ` filter="url(#${id}-sh)"`}>${halo}</g><g id="areas">${areas}</g><g id="roads">${roads}</g><g id="road-labels">${roadLabels}</g><g id="labels">${labels}${compass}</g>${src}</svg>`;
};

/** 範例：重劃區街廓示意圖（平面風格：灰色道路、方點巷道、色塊街廓、指北針；1920×1080 滿版） */
const G = '#A6A6A6';
const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
export const MINI_SAMPLE: MiniMap = {
  title: '街廓示意小地圖',
  w: 1920,
  h: 1080,
  place: 'full',
  style: 'flat',
  north: -45,
  north_at: [404, 122],
  areas: [
    { kind: 'custom', color: '#CCF3F5', pts: [[327, 222], [1705, 222], [1705, 811], [573, 811], [573, 661], [404, 661], [404, 285], [327, 285]] },
    { kind: 'custom', color: '#D97236', pts: rect(502, 222, 643, 503) },
    { kind: 'custom', color: '#E8DCA0', pts: rect(588, 222, 1070, 285) },
    { kind: 'custom', color: '#65943F', pts: rect(792, 368, 1070, 576) },
    { kind: 'custom', color: '#65943F', pts: rect(1105, 611, 1367, 811) },
  ],
  roads: [
    // 方點巷道
    ...([
      [[502, 291], [643, 291]],
      [[502, 376], [643, 376]],
      [[1105, 358], [1225, 358]],
      [[1598, 222], [1598, 340]],
      [[1244, 431], [1300, 431], [1300, 481]],
      [[768, 729], [768, 811]],
      [[972, 729], [972, 811]],
      [[1540, 729], [1540, 811]],
      [[1660, 729], [1660, 811]],
    ] as Pt[][]).map((pts) => ({ pts, w: 12, color: G, dash: true })),
    // 次要道路
    ...([
      [[660, 358], [1070, 358]],
      [[1377, 611], [1377, 811]],
      [[678, 719], [1070, 719]],
      [[1478, 719], [1705, 719]],
      [[1225, 356], [1605, 356]],
      [[1234, 346], [1234, 576]],
      [[1225, 488], [1443, 488]],
      [[1595, 346], [1595, 576]],
    ] as Pt[][]).map((pts) => ({ pts, w: 18, color: G })),
    { pts: [[784.5, 368], [784.5, 576]], w: 15, color: G },
    // 主要道路
    ...([
      [[327, 204.5], [1740, 204.5]],
      [[1722, 186], [1722, 884]],
      [[643, 828.5], [1740, 828.5]],
      [[660.5, 285], [660.5, 884]],
      [[484.5, 204], [484.5, 611]],
      [[467, 593.5], [1740, 593.5]],
      [[1087.5, 204], [1087.5, 828]],
      [[1460.5, 204], [1460.5, 828]],
    ] as Pt[][]).map((pts) => ({ pts, w: 35, color: G })),
  ],
};
