// 小地圖簡化流程：把照截圖描的「原始座標」整理成示意圖。
// 1. 自動轉正：用道路方向找出棋盤主軸，整張圖轉到橫平豎直，指北針跟著轉。
// 2. 拉直對齊：接近水平／垂直的路段拉直，位置相近的平行路對齊同一條線，路端接到最近的路。
// 3. 街廓生成：拉直後的道路中心線把基地切成格子，用途點（uses）落在哪格，那格就上該用途。
// 伺服器與網站共用，不可碰 DOM。
import { MINI_KINDS, normalizeMini, roadCls, type MiniArea, type MiniKind, type MiniMap, type MiniRoad, type Pt } from './minimap';

export interface MiniUse {
  kind: MiniKind;
  at: Pt;
}
export interface SimplifyOpts {
  /** 旋轉角度（度，順時針為正）；省略＝自動轉正 */
  rotate?: number;
  /** 輸出畫布寬（高度依比例），預設 1400 */
  width?: number;
  /** 測試用：回傳牆與區域格子 */
  debug?: boolean;
}

const D = 180 / Math.PI;
const rot = (p: Pt, c: Pt, a: number): Pt => {
  const s = Math.sin(a), k = Math.cos(a), x = p[0] - c[0], y = p[1] - c[1];
  return [c[0] + x * k - y * s, c[1] + x * s + y * k];
};

/** 道路主軸角度（弧度，-45°～45°）：每段方向乘 4 後依長度平均，水平與垂直會疊在一起 */
export const gridAngle = (roads: MiniRoad[]) => {
  let sx = 0, sy = 0;
  for (const r of roads)
    for (let i = 0; i < r.pts.length - 1; i++) {
      const [a, b] = [r.pts[i], r.pts[i + 1]], l = Math.hypot(b[0] - a[0], b[1] - a[1]), t = Math.atan2(b[1] - a[1], b[0] - a[0]) * 4;
      sx += Math.cos(t) * l;
      sy += Math.sin(t) * l;
    }
  return Math.atan2(sy, sx) / 4;
};

type Seg = { o: 'h' | 'v' | 'd'; c: number; l: number };
const SNAP = 15 / D;

/** 一條路的各段：分類成水平、垂直或斜線，連續同方向合併 */
const segsOf = (p: Pt[]) => {
  const out: { o: Seg['o']; a: number; b: number }[] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const t = Math.abs(Math.atan2(p[i + 1][1] - p[i][1], p[i + 1][0] - p[i][0]));
    const o = t < SNAP || t > Math.PI - SNAP ? 'h' : Math.abs(t - Math.PI / 2) < SNAP ? 'v' : 'd';
    const last = out[out.length - 1];
    if (last && last.o === o && o !== 'd') last.b = i + 1;
    else out.push({ o, a: i, b: i + 1 });
  }
  return out;
};

/** 拉直：水平段 y 取平均、垂直段 x 取平均，交接點取兩段的交點 */
const straighten = (p: Pt[]) => {
  const ss = segsOf(p);
  const segs = ss.map((s) => {
    const q = p.slice(s.a, s.b + 1), i = s.o === 'h' ? 1 : 0;
    return { ...s, c: s.o === 'd' ? 0 : q.reduce((t, x) => t + x[i], 0) / q.length, l: Math.hypot(p[s.b][0] - p[s.a][0], p[s.b][1] - p[s.a][1]) };
  });
  const pts: Pt[] = [p[segs[0].a].slice() as Pt, ...segs.map((s) => p[s.b].slice() as Pt)];
  segs.forEach((s, i) => {
    if (s.o === 'd') return;
    for (const q of [pts[i], pts[i + 1]]) q[s.o === 'h' ? 1 : 0] = s.c;
  });
  return { pts, segs };
};

/** 相近的常數合併成一條線（依長度加權平均） */
const cluster = (vals: { c: number; l: number; set: (v: number) => void }[], tol: number) => {
  vals.sort((a, b) => a.c - b.c);
  let g: typeof vals = [];
  const flush = () => {
    const L = g.reduce((t, x) => t + x.l, 0) || 1, m = g.reduce((t, x) => t + x.c * x.l, 0) / L;
    g.forEach((x) => x.set(m));
    g = [];
  };
  for (const v of vals) {
    if (g.length && v.c - g[g.length - 1].c > tol) flush();
    g.push(v);
  }
  if (g.length) flush();
};

const inPoly = (x: number, y: number, P: Pt[]) => {
  let r = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) if (P[i][1] > y !== P[j][1] > y && x < ((P[j][0] - P[i][0]) * (y - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) r = !r;
  return r;
};

/** Ramer–Douglas–Peucker（封閉多邊形）：把格子階梯的斜邊拉成直線，直角轉角保留 */
const rdp = (P: Pt[], eps: number): Pt[] => {
  if (P.length < 4) return P;
  const Q = [...P, P[0]];
  const go = (a: number, b: number, out: Pt[]) => {
    let mi = -1, md = eps;
    const [x1, y1] = Q[a], [x2, y2] = Q[b], L = Math.hypot(x2 - x1, y2 - y1) || 1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((x2 - x1) * (y1 - Q[i][1]) - (x1 - Q[i][0]) * (y2 - y1)) / L;
      if (d > md) (md = d), (mi = i);
    }
    if (mi < 0) out.push(Q[a]);
    else go(a, mi, out), go(mi, b, out);
  };
  // 從最遠的兩點切成兩半再各自簡化
  let far = 0, fd = 0;
  for (let i = 1; i < P.length; i++) {
    const d = Math.hypot(P[i][0] - P[0][0], P[i][1] - P[0][1]);
    if (d > fd) (fd = d), (far = i);
  }
  const out: Pt[] = [];
  go(0, far, out);
  go(far, Q.length - 1, out);
  return out;
};

/** 封閉多邊形拉直：接近水平／垂直的邊拉正，起點同時受第一段與最後一段約束 */
const orthoPoly = (P: Pt[]): Pt[] => {
  if (P.length < 3) return P;
  const b = straighten([...P, P[0]]), f = b.pts[0], l = b.pts[b.pts.length - 1], s0 = b.segs[0].o, sL = b.segs[b.segs.length - 1].o;
  if (sL === 'v') f[0] = l[0];
  if (sL === 'h') f[1] = l[1];
  if (s0 === 'v') f[0] = b.pts[1][0];
  if (s0 === 'h') f[1] = b.pts[1][1];
  const out = b.pts.slice(0, -1);
  return out.filter((p, i) => {
    const a = out[(i - 1 + out.length) % out.length], c = out[(i + 1) % out.length];
    return Math.abs((a[0] - p[0]) * (c[1] - p[1]) - (a[1] - p[1]) * (c[0] - p[0])) > 1e-6;
  });
};

/** 一個格子區域的外框（格子單位）：收集邊界邊、串成迴圈，取面積最大的一圈 */
const outline = (cells: Set<number>, gw: number): Pt[] => {
  const next = new Map<string, Pt>();
  const add = (a: Pt, b: Pt) => next.set(a.join(','), b);
  for (const id of cells) {
    const x = id % gw, y = (id - x) / gw;
    // 區域在前進方向右側（畫面 y 向下時為順時針）
    if (!cells.has(id - gw) || y === 0) add([x, y], [x + 1, y]);
    if (!cells.has(id + 1) || x === gw - 1) add([x + 1, y], [x + 1, y + 1]);
    if (!cells.has(id + gw)) add([x + 1, y + 1], [x, y + 1]);
    if (!cells.has(id - 1) || x === 0) add([x, y + 1], [x, y]);
  }
  let best: Pt[] = [], bestA = 0;
  const seen = new Set<string>();
  for (const k0 of next.keys()) {
    if (seen.has(k0)) continue;
    const loop: Pt[] = [];
    let k = k0;
    while (!seen.has(k) && next.has(k)) {
      seen.add(k);
      const p = k.split(',').map(Number) as Pt;
      loop.push(p);
      k = next.get(k)!.join(',');
    }
    const area = Math.abs(loop.reduce((t, p, i) => t + p[0] * loop[(i + 1) % loop.length][1] - loop[(i + 1) % loop.length][0] * p[1], 0)) / 2;
    if (area > bestA) (bestA = area), (best = loop);
  }
  // 去掉同一直線上的中間點
  return best.filter((p, i) => {
    const a = best[(i - 1 + best.length) % best.length], b = best[(i + 1) % best.length];
    return (a[0] - p[0]) * (b[1] - p[1]) - (a[1] - p[1]) * (b[0] - p[0]) !== 0;
  });
};

/**
 * 原始描圖 → 示意圖規格。raw 同 build_minimap 的參數（座標是截圖像素），另加：
 * uses（用途點）、boundary（基地外框）、north（截圖的北方角度，預設 0＝上）。
 */
export const simplifyMini = (raw: Record<string, unknown>, opts: SimplifyOpts = {}) => {
  const warnings: string[] = [];
  const { map: src, errors } = normalizeMini(raw);
  if (errors.length) return { map: src, errors, warnings, info: null };
  const P = (v: unknown): Pt | null => (Array.isArray(v) && v.length >= 2 && Number.isFinite(+v[0]) && Number.isFinite(+v[1]) ? [+v[0], +v[1]] : null);
  const uses: MiniUse[] = (Array.isArray(raw.uses) ? raw.uses : []).flatMap((u, i) => {
    const o = (u ?? {}) as Record<string, unknown>, at = P(o.at);
    if (!at || !MINI_KINDS.includes(o.kind as MiniKind)) {
      warnings.push(`uses[${i}] 需要 kind（${MINI_KINDS.join('、')}）與 at`);
      return [];
    }
    return [{ kind: o.kind as MiniKind, at }];
  });
  const bnd = (Array.isArray(raw.boundary) ? raw.boundary : []).map(P).filter((p): p is Pt => !!p);
  // 分隔線：同一個街廓裡不同用途的分界（沒有路），只用來切街廓、不畫出來
  const splitsRaw = (Array.isArray(raw.splits) ? raw.splits : []).map((l) => (Array.isArray(l) ? l.map(P).filter((p): p is Pt => !!p) : [])).filter((l) => l.length >= 2);

  // 1. 轉正：以所有點的中心旋轉
  const all = src.roads.flatMap((r) => r.pts);
  const c: Pt = [all.reduce((t, p) => t + p[0], 0) / all.length, all.reduce((t, p) => t + p[1], 0) / all.length];
  const a = typeof opts.rotate === 'number' ? opts.rotate / D : -gridAngle(src.roads);
  const R = (p: Pt) => rot(p, c, a);
  let roads = src.roads.map((r) => ({ ...r, pts: r.pts.map(R) }));
  let boundary = bnd.map(R);
  let splits = splitsRaw.map((l) => l.map(R));

  // 2. 拉直、對齊
  const xs = all.map((p) => R(p)[0]), ys = all.map((p) => R(p)[1]);
  const diag = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const tol = diag * 0.012;
  // 外框當成封閉的路一起拉直、對齊
  const st = [...roads.map((r) => straighten(r.pts)), ...splits.map(straighten), ...(boundary.length >= 3 ? [straighten([...boundary, boundary[0]])] : [])];
  const H: Parameters<typeof cluster>[0] = [], V: Parameters<typeof cluster>[0] = [];
  st.forEach((s) =>
    s.segs.forEach((g, i) => {
      if (g.o === 'd') return;
      const k = g.o === 'h' ? 1 : 0;
      (g.o === 'h' ? H : V).push({ c: g.c, l: g.l, set: (v) => [s.pts[i], s.pts[i + 1]].forEach((q) => (q[k] = v)) });
    }),
  );
  cluster(H, tol);
  cluster(V, tol);
  roads = roads.map((r, i) => ({ ...r, pts: st[i].pts }));
  splits = splits.map((_, i) => st[roads.length + i].pts);
  if (boundary.length >= 3) {
    const b = st[st.length - 1], f = b.pts[0], l = b.pts[b.pts.length - 1], s0 = b.segs[0].o, sL = b.segs[b.segs.length - 1].o;
    // 起點同時受第一段與最後一段約束
    f[0] = sL === 'v' ? l[0] : f[0];
    f[1] = sL === 'h' ? l[1] : f[1];
    if (s0 === 'v') f[0] = b.pts[1][0];
    if (s0 === 'h') f[1] = b.pts[1][1];
    boundary = b.pts.slice(0, -1);
  }

  // 路端接到附近垂直的路（T 字路口、L 形轉角）
  type Line = { ri: number; o: 'h' | 'v'; c: number; lo: number; hi: number };
  const lines: Line[] = roads.flatMap((r, ri) =>
    r.pts.slice(0, -1).flatMap((p, i): Line[] => {
      const q = r.pts[i + 1];
      if (roadCls(r) === 'lane') return [];
      return p[1] === q[1] ? [{ ri, o: 'h', c: p[1], lo: Math.min(p[0], q[0]), hi: Math.max(p[0], q[0]) }] : p[0] === q[0] ? [{ ri, o: 'v', c: p[0], lo: Math.min(p[1], q[1]), hi: Math.max(p[1], q[1]) }] : [];
    }),
  );
  const joins: { ri: number; end: 0 | 1; to: number; dir: number; axis: 0 | 1 }[] = [];
  roads.forEach((r, ri) => {
    ([0, 1] as const).forEach((end) => {
      const n = r.pts.length, e = end ? r.pts[n - 1] : r.pts[0], f = end ? r.pts[n - 2] : r.pts[1];
      const o = e[1] === f[1] ? 'h' : e[0] === f[0] ? 'v' : null;
      if (!o) return;
      // 水平路端找垂直線，反之亦然
      const axis = o === 'h' ? 0 : 1, other = o === 'h' ? 1 : 0;
      let best: Line | null = null, bd = tol * 2.5;
      for (const L of lines) {
        if (L.ri === ri || L.o === o) continue;
        if (e[other] < L.lo - tol || e[other] > L.hi + tol) continue;
        const d = Math.abs(e[axis] - L.c);
        if (d < bd) (bd = d), (best = L);
      }
      if (best) {
        e[axis] = best.c;
        joins.push({ ri, end, to: best.ri, dir: Math.sign(e[axis] - f[axis]) || 1, axis });
      }
    });
  });

  // 分隔線的端點也接到附近的路或其他分隔線（不延伸）
  const splitLines: Line[] = splits.flatMap((l, si) =>
    l.slice(0, -1).flatMap((p, i): Line[] => {
      const q = l[i + 1];
      return p[1] === q[1] ? [{ ri: -1 - si, o: 'h', c: p[1], lo: Math.min(p[0], q[0]), hi: Math.max(p[0], q[0]) }] : p[0] === q[0] ? [{ ri: -1 - si, o: 'v', c: p[0], lo: Math.min(p[1], q[1]), hi: Math.max(p[1], q[1]) }] : [];
    }),
  );
  for (const [si, l] of splits.entries())
    for (const end of [0, 1] as const) {
      const e = end ? l[l.length - 1] : l[0], f = end ? l[l.length - 2] : l[1];
      const o = e[1] === f[1] ? 'h' : e[0] === f[0] ? 'v' : null;
      if (!o) continue;
      const axis = o === 'h' ? 0 : 1, other = 1 - axis;
      let bd = tol * 2.5, c: number | null = null;
      for (const L of [...lines, ...splitLines]) {
        if (L.ri === -1 - si || L.o === o || e[other] < L.lo - tol || e[other] > L.hi + tol) continue;
        const d = Math.abs(e[axis] - L.c);
        if (d < bd) (bd = d), (c = L.c);
      }
      if (c !== null) e[axis] = c;
    }

  // 縮放到輸出畫布
  const pad = 0.04;
  const bx = [...roads.flatMap((r) => r.pts), ...boundary];
  const x0 = Math.min(...bx.map((p) => p[0])), x1 = Math.max(...bx.map((p) => p[0])), y0 = Math.min(...bx.map((p) => p[1])), y1 = Math.max(...bx.map((p) => p[1]));
  const outW = Math.round(opts.width ?? 1400), inner = outW * (1 - pad * 2), s = inner / (x1 - x0 || 1);
  const outH = Math.round((y1 - y0) * s + outW * pad * 2 + 140);
  const T = (p: Pt): Pt => [+((p[0] - x0) * s + outW * pad).toFixed(1), +((p[1] - y0) * s + outW * pad + 140).toFixed(1)];
  roads = roads.map((r) => ({ ...r, pts: r.pts.map(T) }));
  boundary = boundary.map(T);
  splits = splits.map((l) => l.map(T));
  // 平頭道路：接到別條路的端點延伸到那條路的外緣，轉角才會補滿
  const flatW = { main: 35, minor: 18, lane: 12 } as const;
  for (const j of joins) {
    const r = roads[j.ri], n = r.pts.length, e = j.end ? r.pts[n - 1] : r.pts[0];
    e[j.axis] += (j.dir * flatW[roadCls(roads[j.to])]) / 2;
  }

  // 3. 街廓：在 4px 格子上畫道路中心線當牆，從用途點往外填
  const g = 4, gw = Math.ceil(outW / g), gh = Math.ceil(outH / g);
  const wall = new Uint8Array(gw * gh);
  const inside = new Uint8Array(gw * gh);
  const fence = boundary.length >= 3 ? boundary : (() => {
    const q = roads.filter((r) => roadCls(r) !== 'lane').flatMap((r) => r.pts);
    const a0 = Math.min(...q.map((p) => p[0])), a1 = Math.max(...q.map((p) => p[0])), b0 = Math.min(...q.map((p) => p[1])), b1 = Math.max(...q.map((p) => p[1]));
    return [[a0, b0], [a1, b0], [a1, b1], [a0, b1]] as Pt[];
  })();
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) inside[y * gw + x] = inPoly((x + 0.5) * g, (y + 0.5) * g, fence) ? 1 : 0;
  const stroke = (p: Pt, q: Pt) => {
    const n = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / (g / 3)) + 1;
    for (let i = 0; i <= n; i++) {
      const x = Math.floor((p[0] + ((q[0] - p[0]) * i) / n) / g), y = Math.floor((p[1] + ((q[1] - p[1]) * i) / n) / g);
      if (x >= 0 && y >= 0 && x < gw && y < gh) wall[y * gw + x] = 1;
    }
  };
  roads.filter((r) => roadCls(r) !== 'lane').forEach((r) => r.pts.slice(0, -1).forEach((p, i) => stroke(p, r.pts[i + 1])));
  fence.forEach((p, i) => stroke(p, fence[(i + 1) % fence.length]));
  // 分隔線另外記，兩側同用途時要併成一塊
  const before = wall.slice();
  splits.forEach((l) => l.slice(0, -1).forEach((p, i) => stroke(p, l[i + 1])));
  const isSplit = wall.map((v, k) => (v && !before[k] ? 1 : 0));
  const owner = new Int16Array(gw * gh).fill(-1);
  const regions: { kind: MiniKind; cells: Set<number> }[] = [];
  const Ru = uses.map((u) => T(R(u.at)));
  Ru.forEach((p, ui) => {
    let id = Math.floor(p[1] / g) * gw + Math.floor(p[0] / g);
    // 點落在牆上就找最近的空格
    if (wall[id] || !inside[id]) {
      let found = -1;
      for (let r = 1; r <= 4 && found < 0; r++)
        for (let dy = -r; dy <= r && found < 0; dy++)
          for (let dx = -r; dx <= r; dx++) {
            const k = id + dy * gw + dx;
            if (k >= 0 && k < wall.length && !wall[k] && inside[k]) {
              found = k;
              break;
            }
          }
      if (found < 0) {
        warnings.push(`uses[${ui}]（${uses[ui].kind}）落在道路上或基地外，請把點移到街廓中央`);
        return;
      }
      id = found;
    }
    if (owner[id] >= 0) {
      const r = regions[owner[id]];
      if (r.kind !== uses[ui].kind) warnings.push(`uses[${ui}]（${uses[ui].kind}）和另一個用途點（${r.kind}）落在同一個街廓，中間的路可能沒描到`);
      return;
    }
    const ri = regions.length, cells = new Set<number>(), stack = [id];
    owner[id] = ri;
    while (stack.length) {
      const k = stack.pop()!;
      cells.add(k);
      const x = k % gw;
      for (const n of [k - gw, k + gw, x > 0 ? k - 1 : -1, x < gw - 1 ? k + 1 : -1])
        if (n >= 0 && n < wall.length && !wall[n] && inside[n] && owner[n] < 0) {
          owner[n] = ri;
          stack.push(n);
        }
    }
    regions.push({ kind: uses[ui].kind, cells });
  });
  // 牆本身（分隔線、外框）分給旁邊的街廓，相鄰用途之間才不會有白縫；道路底下的牆會被路蓋住
  const parent = regions.map((_, i) => i);
  const root = (i: number): number => (parent[i] === i ? i : (parent[i] = root(parent[i])));
  for (let k = 0; k < wall.length; k++) {
    if (!wall[k] || owner[k] >= 0) continue;
    const x = k % gw;
    // 分隔線兩側（左右或上下）是同一種用途：兩塊併成一塊
    if (isSplit[k])
      for (const [p, q] of [[k - 1, k + 1], [k - gw, k + gw]]) {
        if (p < 0 || q >= wall.length || (p === k - 1 && x === 0) || (q === k + 1 && x === gw - 1)) continue;
        const op = owner[p], oq = owner[q];
        if (op >= 0 && oq >= 0 && op !== oq && regions[op].kind === regions[oq].kind) parent[root(oq)] = root(op);
      }
    for (const n of [k - gw, k + gw, x > 0 ? k - 1 : -1, x < gw - 1 ? k + 1 : -1])
      if (n >= 0 && n < wall.length && !wall[n] && owner[n] >= 0) {
        owner[k] = owner[n];
        regions[owner[n]].cells.add(k);
        break;
      }
  }
  // 沒標用途的街廓（太小的碎片不算）
  let unlabeled = 0;
  const seenFree = new Uint8Array(gw * gh);
  for (let k = 0; k < wall.length; k++) {
    if (wall[k] || !inside[k] || owner[k] >= 0 || seenFree[k]) continue;
    let n = 0;
    const stack = [k];
    seenFree[k] = 1;
    while (stack.length) {
      const q = stack.pop()!;
      n++;
      const x = q % gw;
      for (const m of [q - gw, q + gw, x > 0 ? q - 1 : -1, x < gw - 1 ? q + 1 : -1])
        if (m >= 0 && m < wall.length && !wall[m] && inside[m] && owner[m] < 0 && !seenFree[m]) {
          seenFree[m] = 1;
          stack.push(m);
        }
    }
    if (n * g * g > outW * outW * 0.002) unlabeled++;
  }
  if (unlabeled) warnings.push(`有 ${unlabeled} 個街廓沒有用途點，會留白；需要的話在 uses 補點`);
  const groups = new Map<number, Set<number>>();
  regions.forEach((r, i) => {
    const g0 = groups.get(root(i)) ?? new Set<number>();
    r.cells.forEach((c) => g0.add(c));
    groups.set(root(i), g0);
  });
  const areas: MiniArea[] = [...groups.entries()].map(([i, cells]) => ({ kind: regions[i].kind, pts: orthoPoly(rdp(outline(cells, gw).map(([x, y]) => [x * g, y * g] as Pt), g * 1.2)) }));
  // 原本就給的區塊、地標也一起轉
  const extra = (src.areas ?? []).map((ar) => ({ ...ar, pts: ar.pts.map((p) => T(R(p))), label_at: ar.label_at && T(R(ar.label_at)), tag_at: ar.tag_at && T(R(ar.tag_at)) }));
  const places = (src.places ?? []).map((p) => ({ ...p, at: T(R(p.at)), label_at: p.label_at && T(R(p.label_at)) }));
  // 巷道在最底、主要道路在最上，路口才乾淨
  const order = { lane: 0, minor: 1, main: 2 };
  roads.sort((p, q) => order[roadCls(p)] - order[roadCls(q)]);

  const north = (((typeof raw.north === 'number' ? raw.north : 0) + a * D) % 360 + 540) % 360 - 180;
  const map: MiniMap = {
    ...src,
    w: outW,
    h: outH,
    roads,
    areas: [...areas, ...extra],
    places,
    style: raw.style === 'outline' ? undefined : 'flat',
    legend: raw.legend === false ? undefined : true,
    legend_row: true,
    north: raw.show_north === false ? undefined : +north.toFixed(1),
    north_at: [outW * pad + 60, 80],
    legend_at: undefined,
  };
  return { map, errors: [] as string[], warnings, info: { rotate: +(a * D).toFixed(1), blocks: regions.length, unlabeled }, debug: opts.debug ? { wall, inside, owner, gw, gh, g, uses: Ru } : undefined };
};
