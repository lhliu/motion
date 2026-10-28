export type CatId =
  | 'impact'
  | 'flow'
  | 'depth'
  | 'switch'
  | 'style'
  | 'light'
  | 'reveal'
  | 'caption'
  | 'card'
  | 'kinetic'
  | 'texture'
  | 'retro'
  | 'map'
  | 'liquid'
  | 'photo'
  | 'pmulti'
  | 'pmark'
  | 'pcut'
  | 'diagram'
  | 'meteor'
  | 'cube'
  | 'cosmos'
  | 'aerial'
  | 'vehicle'
  | 'ocean'
  | 'illustration'
  | 'transit'
  | 'cbar'
  | 'cline'
  | 'cpie'
  | 'chier'
  | 'cstat'
  | 'punit'
  | 'pfloor'
  | 'twipe'
  | 'tflash'
  | 'social'
  | 'hook'
  | 'estate'
  | 'news'
  | 'site'
  | 'keys'
  | 'furniture'
  | 'house'
  | 'contract'
  | 'skyline'
  | 'weather'
  | 'signal'
  | 'plant'
  | 'clock'
  | 'party'
  | 'coins'
  | 'gacha'
  | 'drink'
  | 'fun'
  | 'taiwan'
  | 'dcard'
  | 'oestate'
  | 'mcompare'
  | 'mplan'
  | 'mdata'
  | 'mrisk'
  | 'mkit'
  | 'xpack'
  | 'chapter'
  | 'xprice'
  | 'xloan'
  | 'xlower'
  | 'xguide'
  | 'xbefore'
  | 'xend'
  | 'xroute'
  | 'xstat'
  | 'xinspect'
  | 'xemote'
  | 'xvlog'
  | 'xsketch'
  | 'xvariety'
  | 'xcarousel'
  | 'xglobe'
  | 'xicon';

/** 背景調性：ink 深底、paper 淺底、accent 主色底 */
export type Tone = 'ink' | 'paper' | 'accent';

export interface Fx {
  id: string;
  /** 固定編號：一旦給了就不再變動、不重複使用；新增特效用目前最大值 +1 */
  no: number;
  /** 合併升級時沿用的前台編號；no 保留已分配的內部編號，避免舊引用失效。 */
  catalogNo?: number;
  /** Hide from the public catalog while keeping saved links and Combo playback available. */
  hidden?: boolean;
  cat: CatId;
  /** 中文名稱 */
  zh: string;
  /** 英文名稱 */
  en: string;
  /** 一句話說明 */
  desc: string;
  /** 適用情境標籤 */
  tags: string[];
  tone: Tone;
  /** 預設示範文字；多個詞代表會輪播或分段 */
  sample: string[];
  /** Canvas 等非 CSS 動畫的完整循環秒數；Combo 預設播放完整一輪。 */
  duration?: number;
  /** 初次開啟詳細頁與加入空白 Combo 時的建議比例。 */
  preferredRatio?: '9:16' | '16:9' | '1:1';
  /** 給 AI 的動態描述（中文） */
  motion: string;
  /** 給 AI 的動態描述（英文） */
  motionEn: string;
  /** 範圍化 CSS：`.S` 會換成 `.fx-<id>`，`K_` 會換成唯一 keyframes 前綴 */
  css: string;
  html: (w: string[]) => string;
  /** 需要 JS 的特效；必須自給自足（不可引用外部變數），因為匯出時會用 toString() */
  run?: (root: HTMLElement, w: string[]) => (() => void) | void;
  /** 匯出時要先定義的全域程式碼（例如共用繪製引擎） */
  globals?: string;
  /** 用到的按需載入繪製引擎（見 engines.ts）；匯出時引擎原始碼會接在 globals 後面 */
  engine?: EngineId;
  /** 建議字數 */
  hint?: string;
  /** 加入時間，用於「最新」排序 */
  added?: string;
  /** 文字特效的用途分類（data.ts 依 uses.ts 指定） */
  use?: import('./uses').UseId;
  /** 原始的細標籤，只用於搜尋 */
  kw?: string[];
}

/** 網站的工作區：文字特效、圖片運鏡、地圖區位、物件特效、圖表、圖解動畫 */
export type SecId = 'text' | 'cut' | 'ui' | 'photo' | 'map' | 'object' | 'illus' | 'chart' | 'plan' | 'explain';

export interface Section {
  id: SecId;
  code: string;
  zh: string;
  en: string;
  /** 一句話說明 */
  desc: string;
  /** 對應的工作室 */
  studio?: 'photo' | 'map' | 'drop' | 'object' | 'plan';
}

export interface Category {
  id: CatId;
  sec: SecId;
  code: string;
  zh: string;
  tagline: string;
}

export interface Palette {
  id: string;
  name: string;
  ink: string;
  paper: string;
  accent: string;
  accent2: string;
}

/** 按需載入的繪製引擎代碼 */
export type EngineId = 'obj' | 'photo' | 'plan' | 'map' | 'mapfx' | 'chart' | 'transit';
