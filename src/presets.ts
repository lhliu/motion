// 預設（preset）：工作室調好的一份設定，有短代碼，AI 與網站來回修改都用它。網站與伺服器共用，不可在載入時碰 DOM。
import { parseDrop } from './drop';
import type { MScene } from './mapkit';

export type PresetKind = 'map' | 'drop';
export const PRESET_KINDS: PresetKind[] = ['map', 'drop'];
export const KIND_NAME: Record<PresetKind, string> = { map: '地圖場景', drop: '銳利水滴' };

/** map：MScene；drop：{ words: string[] }（文字行＋@設定行） */
export type PresetData = MScene | { words: string[] };

export interface Preset {
  id?: string;
  kind: PresetKind;
  name: string;
  data: PresetData;
  note?: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SceneLike {
  effect: string;
  words: string[];
  seconds?: number;
  note?: string;
}

/** 預設 → 可放進 Combo 的段落 */
export const presetToScene = (p: Pick<Preset, 'kind' | 'data' | 'id' | 'name'>): SceneLike => {
  if (p.kind === 'map') {
    const sc = p.data as MScene;
    return { effect: 'map-overlay', words: [JSON.stringify(sc)], seconds: (sc.loop || 6) + 1, note: p.id ? `預設 ${p.id}${p.name ? `「${p.name}」` : ''}` : undefined };
  }
  const words = (p.data as { words: string[] }).words ?? [];
  return { effect: 'crisp-drop', words, seconds: parseDrop(words).o.loop, note: p.id ? `預設 ${p.id}${p.name ? `「${p.name}」` : ''}` : undefined };
};

/** Combo 段落 → 預設資料（反向，用於從 Combo 打開工作室） */
export const sceneToPresetData = (effect: string, words: string[]): { kind: PresetKind; data: PresetData } | null => {
  if (effect === 'map-overlay') {
    const j = words.find((w) => w.trim().startsWith('{'));
    try {
      return j ? { kind: 'map', data: JSON.parse(j) as MScene } : null;
    } catch {
      return null;
    }
  }
  if (effect === 'crisp-drop') return { kind: 'drop', data: { words } };
  return null;
};

/** 驗證預設資料，回傳錯誤訊息（空字串代表沒問題） */
export const checkPresetData = (kind: unknown, data: unknown): string => {
  if (!PRESET_KINDS.includes(kind as PresetKind)) return `kind 必須是 ${PRESET_KINDS.join('｜')}`;
  if (!data || typeof data !== 'object') return 'data 必須是物件';
  if (kind === 'map') {
    const d = data as Partial<MScene>;
    if (!Array.isArray(d.els)) return '地圖場景缺少 els（元件清單）';
    if (!d.ratio) return '地圖場景缺少 ratio';
  }
  if (kind === 'drop' && !Array.isArray((data as { words?: unknown }).words)) return '水滴設定缺少 words（文字行與 @設定行）';
  const size = JSON.stringify(data).length;
  if (size > 900_000) return `資料太大（${Math.round(size / 1024)}KB），底圖請縮小後再存`;
  return '';
};

/* ───────── 網址安全的 Base64 JSON ───────── */
export const encodeJson = (v: unknown): string => {
  const bytes = new TextEncoder().encode(JSON.stringify(v));
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
export const decodeJson = <T = unknown>(s: string): T => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '==='.slice((b64.length + 3) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))) as T;
};

/** 編輯連結：已存的預設用代碼；尚未存的設定直接編進網址 */
export const editUrl = (origin: string, p: { id?: string; kind: PresetKind; data: PresetData }): string => {
  if (p.id) return `${origin}/?edit=${p.id}`;
  // 底圖的 data URL 太長，不放進網址
  const data = p.kind === 'map' ? { ...(p.data as MScene), bgUrl: (p.data as MScene).bgUrl?.startsWith('data:') ? undefined : (p.data as MScene).bgUrl } : p.data;
  return `${origin}/?edit=${p.kind}&d=${encodeJson(data)}`;
};
