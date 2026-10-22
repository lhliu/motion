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
  | 'pmark';

/** 背景調性：ink 深底、paper 淺底、accent 主色底 */
export type Tone = 'ink' | 'paper' | 'accent';

export interface Fx {
  id: string;
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
  /** 建議字數 */
  hint?: string;
  /** 加入時間，用於「最新」排序 */
  added?: string;
}

/** 網站的三個工作區：文字特效、圖片運鏡、地圖區位 */
export type SecId = 'text' | 'photo' | 'map';

export interface Section {
  id: SecId;
  code: string;
  zh: string;
  en: string;
  /** 一句話說明 */
  desc: string;
  /** 對應的工作室 */
  studio?: 'photo' | 'map' | 'drop';
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
