import { normalizeCosmos, cosmicFxId, cosmicFromWords, isCosmicFx, type CosmicScene } from './cosmos';
import { normalizeNature, natureFxId, natureFromWords, isNatureFx, type NScene } from './nature';
import { normalizeTransport, transportFxId, transportFromWords, isTransportFx, type TScene } from './transport';
import { normalizeIllustration, illustrationFxId, illustrationFromWords, isIllustrationFx, type IScene } from './illustration';
// 預設（preset）：工作室調好的一份設定，有短代碼，AI 與網站來回修改都用它。網站與伺服器共用，不可在載入時碰 DOM。
import { parseDrop } from './drop';
import { sceneLength, type MScene } from './mapkit';
import { isPhotoFx, normalizePhotoScene, photoFxId, type PScene } from './photokit';
import { isObjFx, normalizeObjScene, objSceneFxId, objSceneForEffect, type OScene } from './objkit';
import { normalizeMini, type MiniMap } from './minimap';
import { isPlanFx, normalizePlanScene, planFxId, planFxMode, planLength, planSceneFromWords, type PlanScene } from './plankit';

export type PresetKind = 'map' | 'drop' | 'photo' | 'object' | 'illustration' | 'plan' | 'transport' | 'nature' | 'cosmos' | 'minimap';
export const PRESET_KINDS: PresetKind[] = ['map', 'drop', 'photo', 'object', 'illustration', 'plan', 'transport', 'nature', 'cosmos', 'minimap'];
export const KIND_NAME: Record<PresetKind, string> = { map: '地圖場景', drop: '銳利水滴', photo: '圖片運鏡', object: '物件特效', illustration: '精修插畫', plan: '格局', transport:'交通精修插畫', cosmos:'星空宇宙精修插畫', nature:'隕石與俯瞰精修插畫', minimap: '小地圖' };

/** map：MScene；drop：{ words: string[] }（文字行＋@設定行）；photo：PScene（images 通常留空，渲染時再填） */
export type PresetData = MScene | { words: string[] } | PScene | OScene | IScene | PlanScene | TScene | NScene | CosmicScene | MiniMap;

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
  font?: string;
  note?: string;
}

/** 預設 → 可放進 Combo 的段落；圖片運鏡可用 images 換成這次要用的圖 */
export const presetToScene = (p: Pick<Preset, 'kind' | 'data' | 'id' | 'name'>, o: { images?: string[] } = {}): SceneLike => {
  const note = p.id ? `預設 ${p.id}${p.name ? `「${p.name}」` : ''}` : undefined;
  if (p.kind === 'minimap') return { effect: 'minimap', words: [JSON.stringify(normalizeMini(p.data).map)], seconds: 6, note };
  if(p.kind==='cosmos'){const sc=normalizeCosmos(p.data);return{effect:cosmicFxId(sc.mode),words:[JSON.stringify(sc)],seconds:sc.loop,note};}
  if(p.kind==='nature'){const sc=normalizeNature(p.data);return{effect:natureFxId(sc.mode),words:[JSON.stringify(sc)],seconds:sc.loop,note};}
  if(p.kind==='transport'){const sc=normalizeTransport(p.data);return{effect:transportFxId(sc.mode),words:[JSON.stringify(sc)],seconds:sc.loop,note};}
  if (p.kind === 'illustration') {
    const sc=normalizeIllustration(p.data);
    return {effect:illustrationFxId(sc.mode), words:[JSON.stringify(sc)], seconds:sc.loop, note};
  }
  if (p.kind === 'plan') {
    const sc = normalizePlanScene({ ...(p.data as PlanScene), ...(o.images ? { images: o.images } : {}) });
    return { effect: planFxId(sc.mode), words: [JSON.stringify(sc)], seconds: planLength(sc) + 0.5, ...(sc.font ? { font: sc.font } : {}), note };
  }
  if (p.kind === 'map') {
    const sc = p.data as MScene;
    return { effect: 'map-overlay', words: [JSON.stringify(sc)], seconds: sceneLength(sc) + 1, ...(sc.font ? { font: sc.font } : {}), note };
  }
  if (p.kind === 'photo') {
    const sc = normalizePhotoScene({ ...(p.data as PScene), ...(o.images ? { images: o.images } : {}) });
    return { effect: photoFxId(sc.module), words: [JSON.stringify(sc)], seconds: sc.loop + 1, ...(sc.font ? { font: sc.font } : {}), note };
  }
  const words = (p.data as { words: string[] }).words ?? [];
  if (p.kind === 'object') {
    const sc = normalizeObjScene(p.data as OScene);
    return { effect: objSceneFxId(sc), words: [JSON.stringify(sc)], seconds: sc.loop, ...(sc.font ? { font: sc.font } : {}), note };
  }
  const d = parseDrop(words).o;
  return { effect: 'crisp-drop', words, seconds: d.loop, ...(d.font ? { font: d.font } : {}), note };
};

/** Combo 段落 → 預設資料（反向，用於從 Combo 打開工作室） */
export const sceneToPresetData = (effect: string, words: string[]): { kind: PresetKind; data: PresetData } | null => {
  if(isCosmicFx(effect))return{kind:'cosmos',data:cosmicFromWords(words,effect)};
  if(isNatureFx(effect))return{kind:'nature',data:natureFromWords(words,effect)};
  if(isTransportFx(effect))return{kind:'transport',data:transportFromWords(words,effect)};
  if (isIllustrationFx(effect)) return {kind:'illustration',data:illustrationFromWords(words,effect)};
  if (effect === 'map-overlay') {
    const j = words.find((w) => w.trim().startsWith('{'));
    try {
      return j ? { kind: 'map', data: JSON.parse(j) as MScene } : null;
    } catch {
      return null;
    }
  }
  if (effect === 'crisp-drop') return { kind: 'drop', data: { words } };
  if (effect === 'minimap') {
    const j = words.find((w) => w.trim().startsWith('{'));
    try {
      return j ? { kind: 'minimap', data: normalizeMini(JSON.parse(j)).map } : null;
    } catch {
      return null;
    }
  }
  if (isPlanFx(effect)) return { kind: 'plan', data: planSceneFromWords(words, planFxMode(effect)) };
  if (isObjFx(effect)) {
    try {
      return { kind: 'object', data: objSceneForEffect(words, effect) };
    } catch {
      return null;
    }
  }
  if (isPhotoFx(effect)) {
    const j = words.find((w) => w.trim().startsWith('{'));
    try {
      return j ? { kind: 'photo', data: normalizePhotoScene(JSON.parse(j) as PScene) } : null;
    } catch {
      return null;
    }
  }
  return null;
};

/** 驗證預設資料，回傳錯誤訊息（空字串代表沒問題） */
export const checkPresetData = (kind: unknown, data: unknown): string => {
  if (!PRESET_KINDS.includes(kind as PresetKind)) return `kind 必須是 ${PRESET_KINDS.join('｜')}`;
  if (!data || typeof data !== 'object') return 'data 必須是物件';
  if(kind==='cosmos'&&!('mode' in data))return '星空宇宙精修設定缺少 mode';
  if(kind==='nature'&&!('mode' in data))return '隕石與俯瞰設定缺少 mode';
  if(kind==='transport'&&!('mode' in data))return '交通精修插畫缺少 mode';
  if (kind === 'illustration' && !('animal' in data)&&!('mode' in data)) return '精修插畫缺少 animal';
  if (kind === 'map') {
    const d = data as Partial<MScene>;
    if (!Array.isArray(d.els)) return '地圖場景缺少 els（元件清單）';
    if (!d.ratio) return '地圖場景缺少 ratio';
  }
  if (kind === 'photo' && !(data as Partial<PScene>).module) return '圖片運鏡缺少 module';
  if (kind === 'minimap' && !Array.isArray((data as Partial<MiniMap>).roads)) return '小地圖缺少 roads';
  if (kind === 'plan' && !(data as Partial<PlanScene>).mode) return '格局缺少 mode';
  if (kind === 'object' && !(data as Partial<OScene>).module) return '物件特效缺少 module';
  if (kind === 'drop' && !Array.isArray((data as { words?: unknown }).words)) return '水滴設定缺少 words（文字行與 @設定行）';
  const size = JSON.stringify(data).length;
  if (size > 900_000) return `資料太大（${Math.round(size / 1024)}KB），底圖或圖片請縮小後再存`;
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

const b64url = (bytes: Uint8Array) => {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const unb64url = (s: string) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64 + '==='.slice((b64.length + 3) % 4)), (c) => c.charCodeAt(0));
};
/** 壓縮版網址參數（deflate-raw + base64url），比直接 base64 短 3–5 倍；網站與 MCP 共用 */
export const packJson = async (v: unknown): Promise<string> =>
  b64url(new Uint8Array(await new Response(new Blob([JSON.stringify(v)]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()));
export const unpackJson = async <T = unknown>(s: string): Promise<T> =>
  JSON.parse(await new Response(new Blob([unb64url(s)]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text()) as T;

/** 編輯連結：已存的預設用代碼；尚未存的設定直接編進網址 */
export const editUrl = (origin: string, p: { id?: string; kind: PresetKind; data: PresetData }): string => {
  if (p.id) return `${origin}/?edit=${p.id}`;
  // 底圖與圖片的 data URL 太長，不放進網址
  const data =
    p.kind === 'map'
      ? { ...(p.data as MScene), bgUrl: (p.data as MScene).bgUrl?.startsWith('data:') ? undefined : (p.data as MScene).bgUrl }
      : p.kind === 'photo'
        ? { ...(p.data as PScene), images: (p.data as PScene).images.map((u) => (u.startsWith('data:') ? '' : u)) }
        : p.kind === 'plan'
          ? { ...(p.data as PlanScene), images: (p.data as PlanScene).images.map((u) => (u.startsWith('data:') ? '' : u)) }
          : p.data;
  return `${origin}/?edit=${p.kind}&d=${encodeJson(data)}`;
};
