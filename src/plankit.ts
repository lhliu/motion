// 格局：用平面圖（建商 DM 原圖或內建示意戶型）做動態。房間、動線都用 0–1 的圖面座標記錄。
// 網站卡片、格局工作室、匯出 HTML、本機渲染（/r/plan.js）共用同一套繪製引擎。

export type PlanMode = 'locate' | 'rooms' | 'tour' | 'focus' | 'amenity' | 'compare' | 'tilt';

export interface PRoom {
  name: string;
  sub?: string;
  /** 多邊形頂點，0–1 圖面座標（矩形就是四個點） */
  pts: number[][];
}

export interface PlanScene {
  ratio: '9:16' | '16:9' | '1:1';
  mode: PlanMode;
  /** transparent｜#hex */
  bg: string;
  /** 圖片：data URL、網址，或 sample:unitA｜unitB｜floor｜amenity（內建虛構示意圖） */
  images: string[];
  /** 第一張圖上的房間（戶別定位時是整層的各戶、公設導覽時是各區） */
  rooms: PRoom[];
  /** 第二張圖上的房間（戶型比較用） */
  rooms2: PRoom[];
  /** 看屋動線：第一個點是入口 */
  path: number[][];
  /** 戶別定位、單房聚焦的目標（rooms 的序號） */
  target: number;
  title: string;
  sub: string;
  labelA: string;
  labelB: string;
  /** 單房聚焦的尺寸文字（例如「約 3.6 m」）；留空就不畫尺寸線 */
  dimW: string;
  dimH: string;
  params: { color: string; dim: number; note: number; speed: number; walls: number };
  /** 每張圖的顯示範圍 [x0,y0,x1,y1]（0–1）；null＝自動抓平面圖範圍，去掉 DM 四周留白 */
  crops?: (number[] | null)[];
  font?: string;
}

export const PLAN_INFO: Record<PlanMode, { zh: string; en: string; desc: string; slots: string[]; group: 'punit' | 'pfloor' }> = {
  locate: { zh: '戶別定位', en: 'Unit Locator', desc: '整層配置圖其他戶變灰、目標戶亮起並推近，再切到該戶平面圖', slots: ['整層配置圖', '該戶平面圖（選填）'], group: 'pfloor' },
  amenity: { zh: '公設導覽', en: 'Amenity Tour', desc: '鏡頭在公設平面圖上逐區平移、打光、跳出名稱', slots: ['公設平面圖'], group: 'pfloor' },
  rooms: { zh: '逐間高亮', en: 'Room by Room', desc: '其他區域壓暗，房間一間一間亮起並跳出名稱', slots: ['戶型平面圖'], group: 'punit' },
  tour: { zh: '看屋動線', en: 'Walkthrough Path', desc: '從入口沿著虛線走一圈，走到哪間就亮哪間', slots: ['戶型平面圖'], group: 'punit' },
  focus: { zh: '單房聚焦', en: 'Room Focus', desc: '推近到一個房間，周圍壓暗，標出名稱與尺寸線', slots: ['戶型平面圖'], group: 'punit' },
  compare: { zh: '戶型比較', en: 'Plan Compare', desc: '兩個戶型並排，同名空間同時亮起對照', slots: ['A 戶平面圖', 'B 戶平面圖'], group: 'punit' },
  tilt: { zh: '平面立體傾斜', en: 'Tilted Plan', desc: '平面圖倒成斜躺的立體角度，牆面長高，保留原圖質感', slots: ['戶型平面圖'], group: 'punit' },
};
export const PLAN_MODES = Object.keys(PLAN_INFO) as PlanMode[];
export const planFxId = (m: PlanMode) => `plan-${m}`;
export const isPlanFx = (id: string) => id.startsWith('plan-');
export const planFxMode = (id: string): PlanMode => (PLAN_MODES.find((m) => id === `plan-${m}`) ?? 'rooms');
export const PLAN_NOTE = '本圖面僅供參考，實際依買賣合約書附圖為準';

/* ───────── 內建虛構示意戶型（網站示範用，不是任何真實建案） ───────── */
const R = (name: string, x0: number, y0: number, x1: number, y1: number, sub = ''): PRoom => ({
  name,
  ...(sub ? { sub } : {}),
  pts: [
    [x0 / 100, y0 / 100],
    [x1 / 100, y0 / 100],
    [x1 / 100, y1 / 100],
    [x0 / 100, y1 / 100],
  ],
});
const UNIT_A = [R('主臥', 5, 5, 40, 40), R('次臥', 40, 5, 70, 32), R('書房', 70, 5, 95, 32), R('客廳', 40, 32, 95, 62), R('主浴', 5, 40, 22, 62), R('客浴', 22, 40, 40, 62), R('廚房', 5, 62, 40, 90), R('玄關', 40, 62, 55, 90), R('餐廳', 55, 62, 95, 90)];
const UNIT_B = [R('主臥', 10, 5, 52, 38), R('次臥', 52, 5, 90, 38), R('客廳', 10, 38, 58, 72), R('廚房', 58, 38, 90, 72), R('衛浴', 10, 72, 42, 95), R('玄關', 42, 72, 90, 95)];
const FLOOR = [R('A1', 10, 10, 38, 38), R('A2', 38, 10, 62, 38), R('A3', 62, 10, 90, 38), R('A4', 62, 38, 90, 62), R('A5', 62, 62, 90, 90), R('A6', 38, 62, 62, 90), R('A7', 10, 62, 38, 90), R('A8', 10, 38, 38, 62)];
const AMENITY = [R('景觀庭園', 3, 3, 97, 18), R('交誼廳', 5, 20, 45, 55), R('健身房', 55, 20, 95, 45), R('閱覽室', 55, 45, 95, 70), R('梯廳', 45, 20, 55, 70), R('迎賓大廳', 5, 55, 45, 88)];
const pick = (list: PRoom[], names: string[]) => names.map((n) => list.find((r) => r.name === n)!).filter(Boolean);

export const PLAN_DEFAULTS: Record<PlanMode, Partial<PlanScene>> = {
  locate: { images: ['sample:floor', 'sample:unitA'], rooms: FLOOR, target: 2, title: 'A3 戶', sub: '三房示意（虛構戶型）' },
  amenity: { images: ['sample:amenity'], rooms: AMENITY, title: '公設一次看', sub: '虛構示意' },
  rooms: { images: ['sample:unitA'], rooms: pick(UNIT_A, ['玄關', '客廳', '餐廳', '廚房', '主臥', '次臥', '書房']), title: '格局一次看懂', sub: '虛構示意戶型' },
  tour: {
    images: ['sample:unitA'],
    rooms: pick(UNIT_A, ['玄關', '客廳', '次臥', '主臥', '餐廳']),
    path: [[0.475, 0.86], [0.475, 0.66], [0.6, 0.5], [0.55, 0.34], [0.55, 0.18], [0.55, 0.34], [0.38, 0.36], [0.24, 0.24], [0.38, 0.36], [0.62, 0.52], [0.76, 0.76]],
    title: '跟著動線看一圈',
    sub: '虛構示意戶型',
  },
  focus: { images: ['sample:unitA'], rooms: UNIT_A, target: 0, dimW: '約 3.5 m', dimH: '約 3.5 m', title: '主臥', sub: '虛構示意戶型' },
  compare: { images: ['sample:unitA', 'sample:unitB'], rooms: pick(UNIT_A, ['客廳', '主臥', '廚房']), rooms2: pick(UNIT_B, ['客廳', '主臥', '廚房']), labelA: 'A 戶｜三房', labelB: 'B 戶｜兩房', title: '兩種戶型比一比', sub: '虛構示意' },
  tilt: { images: ['sample:unitA'], rooms: UNIT_A, title: '立體格局', sub: '虛構示意戶型' },
};

export const defaultPlanScene = (mode: PlanMode = 'rooms'): PlanScene => ({
  ratio: '9:16',
  mode,
  bg: '#f4f1ea',
  images: [],
  rooms: [],
  rooms2: [],
  path: [],
  target: 0,
  title: '',
  sub: '',
  labelA: '',
  labelB: '',
  dimW: '',
  dimH: '',
  params: { color: '#ff5a36', dim: 0.55, note: 1, speed: 1, walls: 1 },
  ...structuredClone(PLAN_DEFAULTS[mode]),
});

const clampN = (v: unknown, a: number, b: number, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(a, Math.min(b, n)) : d;
};
const cleanPts = (p: unknown): number[][] =>
  Array.isArray(p)
    ? p
        .filter((q) => Array.isArray(q) && q.length >= 2)
        .slice(0, 40)
        .map((q) => [clampN((q as number[])[0], -0.2, 1.2, 0), clampN((q as number[])[1], -0.2, 1.2, 0)])
    : [];
/** 房間可以用 pts，也可以用 rect: [x0, y0, x1, y1] */
const cleanRooms = (list: unknown): PRoom[] =>
  Array.isArray(list)
    ? list
        .slice(0, 40)
        .map((r) => {
          const o = (r ?? {}) as { name?: unknown; sub?: unknown; pts?: unknown; rect?: unknown };
          const rect = Array.isArray(o.rect) && o.rect.length === 4 ? (o.rect as number[]).map(Number) : null;
          const pts = rect ? R('', rect[0] * 100, rect[1] * 100, rect[2] * 100, rect[3] * 100).pts : cleanPts(o.pts);
          return { name: String(o.name ?? '').slice(0, 30), ...(o.sub ? { sub: String(o.sub).slice(0, 40) } : {}), pts };
        })
        .filter((r) => r.pts.length >= 3)
    : [];

/** 補齊缺漏欄位並夾住範圍，AI 給的資料也能安全使用 */
export const normalizePlanScene = (raw: Partial<PlanScene>, fallback: PlanMode = 'rooms'): PlanScene => {
  const mode = PLAN_MODES.includes(raw.mode as PlanMode) ? (raw.mode as PlanMode) : fallback;
  const base = defaultPlanScene(mode);
  const s = (v: unknown, d: string, n = 60) => (typeof v === 'string' ? v.slice(0, n) : d);
  const P = (raw.params ?? {}) as Partial<PlanScene['params']>;
  const hasImages = Array.isArray(raw.images) && raw.images.some((x) => typeof x === 'string' && x);
  const rooms = raw.rooms !== undefined ? cleanRooms(raw.rooms) : base.rooms;
  return {
    ratio: (['9:16', '16:9', '1:1'] as const).includes(raw.ratio as PlanScene['ratio']) ? (raw.ratio as PlanScene['ratio']) : base.ratio,
    mode,
    bg: typeof raw.bg === 'string' && /^(transparent|#[0-9a-f]{3,8})$/i.test(raw.bg.trim()) ? raw.bg.trim() : base.bg,
    images: hasImages ? (raw.images as unknown[]).slice(0, 2).map((x) => (typeof x === 'string' ? x : '')) : base.images,
    rooms,
    rooms2: raw.rooms2 !== undefined ? cleanRooms(raw.rooms2) : base.rooms2,
    path: raw.path !== undefined ? cleanPts(raw.path) : base.path,
    target: Math.round(clampN(raw.target, 0, Math.max(0, rooms.length - 1), base.target)),
    title: s(raw.title, base.title),
    sub: s(raw.sub, base.sub),
    labelA: s(raw.labelA, base.labelA),
    labelB: s(raw.labelB, base.labelB),
    dimW: s(raw.dimW, base.dimW, 20),
    dimH: s(raw.dimH, base.dimH, 20),
    params: {
      color: /^#[0-9a-f]{6}$/i.test(String(P.color)) ? String(P.color) : base.params.color,
      dim: clampN(P.dim, 0, 0.9, base.params.dim),
      note: P.note === 0 || (P.note as unknown) === '0' ? 0 : 1,
      speed: clampN(P.speed, 0.4, 2.5, base.params.speed),
      walls: clampN(P.walls, 0, 2, base.params.walls),
    },
    ...(Array.isArray(raw.crops) && raw.crops.some((c) => Array.isArray(c))
      ? {
          crops: raw.crops.slice(0, 2).map((c) => {
            if (!Array.isArray(c) || c.length !== 4) return null;
            const [a, b, x, y] = c.map((v) => clampN(v, 0, 1, 0));
            return x - a > 0.02 && y - b > 0.02 ? [a, b, x, y] : null;
          }),
        }
      : {}),
    ...(typeof raw.font === 'string' && /^[a-z]{2,12}$/.test(raw.font) ? { font: raw.font } : {}),
  };
};

/** words 裡以 { 開頭的字串視為場景 JSON；否則第 1 行換標題、第 2 行換副標 */
export const planSceneFromWords = (w: string[], mode: PlanMode): PlanScene => {
  const j = w.find((x) => String(x).trim().startsWith('{'));
  if (j) {
    try {
      return normalizePlanScene(JSON.parse(j) as Partial<PlanScene>, mode);
    } catch {
      /* 格式錯誤時退回預設 */
    }
  }
  const sc = defaultPlanScene(mode);
  const lines = w.filter((x) => x && !x.startsWith('{'));
  if (lines[0]) sc.title = lines[0];
  if (lines[1] !== undefined) sc.sub = lines[1];
  return sc;
};

/** 動畫長度（秒）：依房間數、動線長度自動計算 */
export const planLength = (sc: Pick<PlanScene, 'mode' | 'rooms' | 'rooms2' | 'path' | 'params'>): number => {
  const sp = sc.params?.speed || 1;
  const n = sc.rooms.length;
  const common = sc.rooms.filter((r) => sc.rooms2.some((q) => q.name === r.name)).length;
  const raw = { locate: 7, amenity: 1.2 + n * 1.8 + 2.4, rooms: 1 + n * 1 + 2.4, tour: 1.2 + Math.max(4, sc.path.length * 0.7) + 2.4, focus: 6.5, compare: 2.4 + common * 1.1 + 2, tilt: 7.5 }[sc.mode];
  return Math.round((raw / sp) * 10) / 10;
};

export const PLAN_RATIO_PX: Record<PlanScene['ratio'], [number, number]> = { '9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080] };
