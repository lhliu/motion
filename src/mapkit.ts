// 地圖疊加元件：照「持家男子KC」地圖片段的樣式設計，全部硬邊、不使用陰影或模糊。
// 座標用 0–1 的畫面比例，尺寸以短邊 1080 為基準。

export type MType = 'tag' | 'road' | 'site' | 'label' | 'pin' | 'badge' | 'info' | 'bar' | 'stat' | 'compass' | 'text' | 'routes';

export interface MEl {
  id: string;
  /** 範本角色，讓 AI 只換文字即可 */
  role?: string;
  type: MType;
  x: number;
  y: number;
  size: number;
  delay: number;
  text?: string;
  /** 主色：標籤底色、框線、卡片強調色 */
  color?: string;
  /** 文字色 */
  fg?: string;
  /** 卡片或填色的透明度 */
  alpha?: number;
  /** road：直排；text：描邊 */
  vertical?: boolean;
  /** road：light 白底黑字，dark 深底白字 */
  variant?: 'dark' | 'light';
  /** site：四個角（0–1） */
  pts?: number[][];
  /** info：每行一句，* 開頭用強調色；stat：「標籤|數字|單位|附註」；routes：「目的地|附註|#色碼」 */
  lines?: string[];
  /** routes：路線彎曲程度（-0.5～0.5，0＝直線） */
  curve?: number;
  /** routes：虛線並往前流動 */
  dash?: boolean;
  /** routes：每條路線不同顏色（false＝全部用 color） */
  multi?: boolean;
}

export interface MScene {
  ratio: '9:16' | '16:9' | '1:1';
  els: MEl[];
  loop: number;
  bgZoom: number;
  bgX: number;
  bgY: number;
  bgDim: number;
  /** 底圖網址或 data URL（選填） */
  bgUrl?: string;
  /** 太空降落開場的秒數（0 或省略＝不用）；元件會在降落結束後才開始登場 */
  descend?: number;
  /** 字型組合代碼（sharp｜round｜serif｜hand｜cute｜classic），省略＝跟著 Combo 或預設 */
  font?: string;
}

/** 場景總長度＝降落開場＋元件動畫 */
export const sceneLength = (sc: Pick<MScene, 'loop' | 'descend'>) => (sc.loop || 6) + (sc.descend || 0);

export const RATIO_PX: Record<MScene['ratio'], [number, number]> = { '9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080] };

export const TYPE_NAME: Record<MType, string> = {
  tag: '標題籤',
  road: '道路標籤',
  site: '基地框',
  label: '基地標籤',
  pin: '定位針',
  badge: '圓形標記',
  info: '資訊卡',
  bar: '資訊條',
  stat: '數據卡',
  compass: '指北針',
  text: '文字',
  routes: '放射路線',
};

const YELLOW = '#f2c14e';
let uid = 0;
export const newId = () => `e${Date.now().toString(36)}${(uid++).toString(36)}`;

/** 新元素的預設值 */
export const makeEl = (type: MType, at: Partial<MEl> = {}): MEl => {
  const base: Record<MType, Partial<MEl>> = {
    tag: { x: 0.06, y: 0.07, size: 1, text: '區域｜案名', color: '#1c1c1c', fg: '#ffffff', alpha: 0.88 },
    road: { x: 0.5, y: 0.3, size: 1, text: '某某路', variant: 'dark' },
    site: { x: 0.5, y: 0.42, size: 1, color: YELLOW, alpha: 0.28, pts: [[0.3, 0.37], [0.7, 0.37], [0.7, 0.49], [0.3, 0.49]] },
    label: { x: 0.5, y: 0.43, size: 1, text: '某某 基地', color: YELLOW, fg: '#1c1c1c' },
    pin: { x: 0.58, y: 0.45, size: 1, color: '#f07a3f' },
    badge: { x: 0.5, y: 0.45, size: 1, text: 'A棟', color: '#f07a3f', fg: '#ffffff' },
    bar: { x: 0.5, y: 0.62, size: 1, text: '*地上 ○ 樓|地下 ○ 樓', color: '#f07a3f', alpha: 0.82 },
    info: { x: 0.5, y: 0.66, size: 1, color: YELLOW, alpha: 0.8, lines: ['*地上 30 層', 'A、B 兩棟 雙塔', '*SRC 鋼骨結構'] },
    stat: { x: 0.5, y: 0.67, size: 1, color: YELLOW, alpha: 0.95, text: '案名', fg: '路名 × 路名', lines: ['地上|27|層|', '全案|283|戶|', '每層|11–12|戶|4 部電梯'] },
    compass: { x: 0.9, y: 0.12, size: 1 },
    text: { x: 0.5, y: 0.84, size: 1, text: '字幕文字', color: '#ffffff', fg: '#111111', vertical: true },
    routes: { x: 0.5, y: 0.6, size: 1, text: '某某建案', color: '#ff5a36', multi: true, curve: 0.15, dash: false, lines: ['南港|開車約 ○ 分鐘', '內湖|開車約 ○ 分鐘', '台北車站|開車約 ○ 分鐘'] },
  };
  const el = { id: newId(), type, x: 0.5, y: 0.5, size: 1, delay: 0, ...base[type], ...at } as MEl;
  if (type === 'routes') syncRoutes(el);
  return el;
};

/** 放射路線：讓目的地座標數量跟著目的地清單（新增的目的地自動排成扇形） */
export const syncRoutes = (el: MEl) => {
  const n = (el.lines ?? []).length;
  const pts = (el.pts ?? []).slice(0, n);
  for (let i = pts.length; i < n; i++) {
    const a = -Math.PI * (0.85 - (0.7 * i) / Math.max(1, n - 1 || 1));
    pts.push([Math.max(0.12, Math.min(0.88, el.x + Math.cos(a) * 0.3)), Math.max(0.1, Math.min(0.9, el.y + Math.sin(a) * 0.22))]);
  }
  el.pts = pts;
  return el;
};

export const TEMPLATES: { name: string; scene: () => MScene }[] = [
  {
    name: '鳥瞰基地',
    scene: () => ({
      ratio: '9:16',
      loop: 6,
      bgZoom: 1,
      bgX: 0.5,
      bgY: 0.5,
      bgDim: 0.1,
      els: [
        makeEl('tag', { role: 'tag', x: 0.04, y: 0.075, text: '區域｜案名', delay: 0 }),
        makeEl('text', { role: 'legend', x: 0.27, y: 0.135, text: '紅線：地籍界線', vertical: true, delay: 0.2, size: 0.62 }),
        makeEl('compass', { role: 'compass', x: 0.9, y: 0.12, delay: 0.2 }),
        makeEl('site', { role: 'site', pts: [[0.29, 0.38], [0.71, 0.39], [0.69, 0.5], [0.29, 0.49]], delay: 0.4 }),
        makeEl('label', { role: 'siteLabel', x: 0.5, y: 0.44, text: '某某 基地', delay: 1.2 }),
        makeEl('road', { role: 'road', x: 0.5, y: 0.375, text: '某某街', delay: 1.4 }),
        makeEl('road', { role: 'road', x: 0.5, y: 0.51, text: '某某路', delay: 1.5 }),
        makeEl('road', { role: 'road', x: 0.2, y: 0.44, text: '某某一路', vertical: true, delay: 1.6 }),
        makeEl('road', { role: 'road', x: 0.75, y: 0.45, text: '某某二路', vertical: true, delay: 1.7 }),
        makeEl('info', { role: 'info', y: 0.67, delay: 2 }),
        makeEl('text', { role: 'subtitle', x: 0.5, y: 0.82, text: '字幕放這裡', vertical: true, delay: 2.4 }),
        makeEl('text', { role: 'credit', x: 0.5, y: 0.88, text: '底圖：內政部國土測繪中心 正射影像', color: '#ffffffcc', vertical: false, size: 0.42, delay: 0 }),
        makeEl('text', { role: 'handle', x: 0.5, y: 0.92, text: '持家男子KC / @kch0263', vertical: true, size: 0.62, delay: 0 }),
      ],
    }),
  },
  {
    name: '街道圖基地',
    scene: () => ({
      ratio: '9:16',
      loop: 6,
      bgZoom: 1,
      bgX: 0.5,
      bgY: 0.5,
      bgDim: 0,
      els: [
        makeEl('tag', { role: 'tag', x: 0.03, y: 0.08, text: '案名｜區域 路名', delay: 0 }),
        makeEl('road', { role: 'road', x: 0.2, y: 0.26, text: '某某東路', variant: 'light', delay: 0.3 }),
        makeEl('road', { role: 'road', x: 0.73, y: 0.44, text: '某某路', variant: 'light', delay: 0.4 }),
        makeEl('site', { role: 'site', pts: [[0.5, 0.38], [0.69, 0.37], [0.63, 0.42], [0.5, 0.42]], color: '#f07a3f', alpha: 0.25, delay: 0.6 }),
        makeEl('pin', { role: 'pin', x: 0.58, y: 0.4, delay: 1.2 }),
        makeEl('label', { role: 'siteLabel', x: 0.35, y: 0.395, text: '基地範圍示意', color: '#f07a3f', fg: '#ffffff', size: 0.8, delay: 1.5 }),
        makeEl('stat', { role: 'stat', y: 0.6, delay: 1.9 }),
        makeEl('text', { role: 'subtitle', x: 0.5, y: 0.74, text: '字幕放這裡', vertical: true, delay: 2.4 }),
        makeEl('text', { role: 'credit', x: 0.5, y: 0.8, text: '底圖：內政部國土測繪中心 電子地圖', color: '#333333', vertical: false, size: 0.42, delay: 0 }),
      ],
    }),
  },
  {
    name: '降落基地',
    scene: () => ({
      ratio: '9:16',
      loop: 6,
      bgZoom: 1,
      bgX: 0.5,
      bgY: 0.5,
      bgDim: 0.12,
      descend: 2.6,
      els: [
        makeEl('text', { role: 'title', x: 0.5, y: 0.1, text: '基地位置', vertical: true, size: 1.35, delay: 0 }),
        makeEl('text', { role: 'legend', x: 0.5, y: 0.14, text: '依建照圖套繪，僅供示意', vertical: true, size: 0.5, delay: 0.2 }),
        makeEl('site', { role: 'site', color: '#f07a3f', alpha: 0.35, pts: [[0.29, 0.39], [0.5, 0.28], [0.58, 0.39], [0.47, 0.46], [0.56, 0.45], [0.43, 0.52]], delay: 0.3 }),
        makeEl('badge', { role: 'badge', x: 0.44, y: 0.34, text: 'B棟', delay: 1.2 }),
        makeEl('badge', { role: 'badge', x: 0.42, y: 0.44, text: 'A棟', delay: 1.4 }),
        makeEl('road', { role: 'road', x: 0.27, y: 0.43, text: '某某路一段', variant: 'light', delay: 1.6 }),
        makeEl('bar', { role: 'bar', x: 0.5, y: 0.61, text: 'A、B 兩棟', delay: 2 }),
        makeEl('bar', { role: 'bar', x: 0.5, y: 0.68, text: '*地上 ○ 樓|地下 ○ 樓', delay: 2.3 }),
        makeEl('text', { role: 'credit', x: 0.75, y: 0.8, text: '底圖：內政部國土測繪中心 正射影像', color: '#ffffffcc', vertical: false, size: 0.4, delay: 0 }),
        makeEl('text', { role: 'subtitle', x: 0.5, y: 0.845, text: '字幕放這裡', vertical: true, delay: 2.6 }),
        makeEl('text', { role: 'handle', x: 0.5, y: 0.93, text: '持家男子KC  @kch0263', vertical: true, size: 0.55, delay: 0 }),
      ],
    }),
  },
  {
    name: '放射路線',
    scene: () => ({
      ratio: '9:16',
      loop: 6,
      bgZoom: 1,
      bgX: 0.5,
      bgY: 0.5,
      bgDim: 0.1,
      els: [
        makeEl('tag', { role: 'tag', x: 0.04, y: 0.075, text: '交通｜開車到哪都方便', delay: 0 }),
        makeEl('compass', { role: 'compass', x: 0.9, y: 0.12, delay: 0.2 }),
        makeEl('routes', {
          role: 'routes',
          x: 0.42,
          y: 0.6,
          delay: 0.3,
          pts: [[0.8, 0.36], [0.62, 0.24], [0.2, 0.33]],
        }),
        makeEl('text', { role: 'subtitle', x: 0.5, y: 0.82, text: '字幕放這裡', vertical: true, delay: 2.4 }),
        makeEl('text', { role: 'credit', x: 0.5, y: 0.88, text: '底圖：請標示出處', color: '#ffffffcc', vertical: false, size: 0.42, delay: 0 }),
      ],
    }),
  },
  { name: '空白', scene: () => ({ ratio: '9:16', loop: 6, bgZoom: 1, bgX: 0.5, bgY: 0.5, bgDim: 0, els: [] }) },
];

export interface MapSceneInput {
  template?: 'aerial' | 'street' | 'site' | 'routes' | 'blank';
  /** 太空降落開場秒數，0＝關閉 */
  descend?: number;
  /** 大標題（site 範本的「基地位置」） */
  heading?: string;
  /** 圓形標記，例如 A棟、B棟 */
  badges?: { text: string; x?: number; y?: number; color?: string }[];
  /** 資訊條，| 分欄、* 開頭用強調色 */
  bars?: string[];
  /** 基地框角點（0–1），可多於 4 點 */
  site_points?: number[][];
  ratio?: MScene['ratio'];
  duration?: number;
  tag?: string;
  legend?: string;
  site_label?: string;
  site_color?: string;
  roads?: { text: string; x?: number; y?: number; vertical?: boolean; light?: boolean }[];
  info_lines?: string[];
  stat?: { title?: string; subtitle?: string; items?: string[] };
  subtitle?: string;
  credit?: string;
  handle?: string;
  bg_url?: string;
  bg_dim?: number;
  elements?: Partial<MEl>[];
  /** 放射路線：一個起點到多個目的地 */
  routes?: {
    origin?: string;
    x?: number;
    y?: number;
    destinations: { name: string; note?: string; color?: string; x?: number; y?: number }[];
    curve?: number;
    dash?: boolean;
    single_color?: string;
  };
}

/** 從範本與文字組出地圖場景（給 MCP 與 API 使用） */
export const buildMapScene = (a: MapSceneInput): MScene => {
  const tpl = TEMPLATES[{ aerial: 0, street: 1, site: 2, routes: 3, blank: 4 }[a.template ?? 'aerial'] ?? 0];
  const sc = tpl.scene();
  if (a.ratio && a.ratio in RATIO_PX) sc.ratio = a.ratio;
  if (a.duration) sc.loop = Math.max(2, Math.min(20, a.duration));
  if (a.bg_url) sc.bgUrl = String(a.bg_url).slice(0, 2000);
  if (typeof a.bg_dim === 'number') sc.bgDim = Math.max(0, Math.min(0.7, a.bg_dim));
  const byRole = (r: string) => sc.els.filter((e) => e.role === r);
  const setText = (r: string, v: string | undefined) => {
    if (v === undefined) return;
    if (!v) sc.els = sc.els.filter((e) => e.role !== r);
    else byRole(r).forEach((e) => (e.text = v));
  };
  if (typeof a.descend === 'number') sc.descend = Math.max(0, Math.min(6, a.descend));
  setText('title', a.heading);
  setText('tag', a.tag);
  setText('legend', a.legend);
  setText('siteLabel', a.site_label);
  setText('subtitle', a.subtitle);
  setText('credit', a.credit);
  setText('handle', a.handle);
  if (a.site_points && a.site_points.length >= 3) byRole('site').forEach((e) => (e.pts = a.site_points!.slice(0, 12).map((p) => [Number(p[0]), Number(p[1])])));
  if (a.badges) {
    const old = byRole('badge');
    sc.els = sc.els.filter((e) => e.role !== 'badge');
    a.badges.slice(0, 8).forEach((b, i) => sc.els.push(makeEl('badge', { role: 'badge', text: b.text, x: b.x ?? old[i]?.x ?? 0.4 + i * 0.1, y: b.y ?? old[i]?.y ?? 0.4, color: b.color ?? old[i]?.color, delay: 1.2 + i * 0.2 })));
  }
  if (a.bars) {
    const old = byRole('bar');
    const at = sc.els.findIndex((e) => e.role === 'bar');
    sc.els = sc.els.filter((e) => e.role !== 'bar');
    const made = a.bars.slice(0, 4).map((t, i) => makeEl('bar', { role: 'bar', text: t, x: 0.5, y: old[i]?.y ?? (old[0]?.y ?? 0.61) + i * 0.07, delay: 2 + i * 0.3 }));
    sc.els.splice(at >= 0 ? at : sc.els.length, 0, ...made);
  }
  if (a.site_color) byRole('site').concat(byRole('siteLabel')).forEach((e) => (e.color = a.site_color));
  if (a.info_lines) {
    const info = byRole('info')[0] ?? (sc.els.push(makeEl('info', { role: 'info', delay: 2 })), byRole('info')[0]);
    info.lines = a.info_lines.slice(0, 6);
  }
  if (a.stat) {
    const st = byRole('stat')[0] ?? (sc.els.push(makeEl('stat', { role: 'stat', delay: 2 })), byRole('stat')[0]);
    if (a.stat.title !== undefined) st.text = a.stat.title;
    if (a.stat.subtitle !== undefined) st.fg = a.stat.subtitle;
    if (a.stat.items) st.lines = a.stat.items.slice(0, 4);
  }
  if (a.roads) {
    const old = byRole('road');
    const firstIdx = sc.els.findIndex((e) => e.role === 'road');
    sc.els = sc.els.filter((e) => e.role !== 'road');
    // 沒給位置時，依序放在基地的上、下、左、右
    const site = byRole('site')[0]?.pts ?? [[0.3, 0.38], [0.7, 0.38], [0.7, 0.5], [0.3, 0.5]];
    const xs = site.map((p) => p[0]);
    const ys = site.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const auto = [
      { x: (x0 + x1) / 2, y: y0 - 0.012, vertical: false },
      { x: (x0 + x1) / 2, y: y1 + 0.012, vertical: false },
      { x: x0 - 0.07, y: (y0 + y1) / 2, vertical: true },
      { x: x1 + 0.07, y: (y0 + y1) / 2, vertical: true },
    ];
    const made = a.roads.slice(0, 8).map((r, i) => {
      const pos = auto[i % 4];
      return makeEl('road', {
        role: 'road',
        text: r.text,
        x: r.x ?? pos.x,
        y: r.y ?? pos.y,
        vertical: r.vertical ?? pos.vertical,
        variant: r.light ?? old[0]?.variant === 'light' ? 'light' : 'dark',
        delay: 1.4 + i * 0.1,
      });
    });
    sc.els.splice(firstIdx >= 0 ? firstIdx : sc.els.length, 0, ...made);
  }
  if (a.routes?.destinations?.length) {
    let rt = byRole('routes')[0];
    if (!rt) {
      rt = makeEl('routes', { role: 'routes', delay: 0.3 });
      sc.els.push(rt);
    }
    const r = a.routes;
    if (r.origin !== undefined) rt.text = r.origin;
    if (typeof r.x === 'number') rt.x = r.x;
    if (typeof r.y === 'number') rt.y = r.y;
    if (typeof r.curve === 'number') rt.curve = Math.max(-0.5, Math.min(0.5, r.curve));
    if (typeof r.dash === 'boolean') rt.dash = r.dash;
    if (r.single_color) {
      rt.multi = false;
      rt.color = r.single_color;
    }
    const ds = r.destinations.slice(0, 6);
    rt.lines = ds.map((d) => [d.name, d.note ?? '', d.color ?? ''].join('|').replace(/\|+$/, ''));
    const keep = rt.pts ?? [];
    rt.pts = [];
    syncRoutes(rt);
    rt.pts = rt.pts!.map((p, i) => [ds[i].x ?? keep[i]?.[0] ?? p[0], ds[i].y ?? keep[i]?.[1] ?? p[1]]);
  }
  for (const e of a.elements ?? []) {
    if (!e.type || !(e.type in TYPE_NAME)) continue;
    sc.els.push(makeEl(e.type as MType, { ...e, id: undefined } as Partial<MEl>));
    sc.els[sc.els.length - 1].id = newId();
  }
  return sc;
};
