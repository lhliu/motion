// 繪製引擎按需載入：物件、照片、格局、地圖、地圖招式、圖表、路網的引擎很大，主程式不打包，
// 第一次掛載或匯出用到的特效時才 import。引擎模組載入時會把自己裝到 globalThis（給特效的 run 用），
// 並登記匯出 HTML 要用的原始碼字串。伺服器端（Pages Functions）用 engines-all.ts 一次全部同步載入。
import type { EngineId, Fx } from './types';

const LOADERS: Record<EngineId, () => Promise<unknown>> = {
  obj: () => import('./render/obj'),
  photo: () => import('./render/photo'),
  plan: () => import('./render/plan'),
  map: () => import('./render/map'),
  mapfx: () => import('./render/mapfx'),
  chart: () => import('./render/chart'),
  transit: () => import('./render/transit'),
};

const GLOBALS: Partial<Record<EngineId, string>> = {};
const pending: Partial<Record<EngineId, Promise<unknown>>> = {};

/** 引擎模組載入時呼叫 */
export const registerEngine = (id: EngineId, globals: string) => {
  GLOBALS[id] = globals;
};

export const engineReady = (fx: Pick<Fx, 'engine'>) => !fx.engine || GLOBALS[fx.engine] !== undefined;

export const loadEngine = (id: EngineId): Promise<unknown> => {
  if (GLOBALS[id] !== undefined) return Promise.resolve();
  const p = (pending[id] ??= LOADERS[id]().catch((e) => {
    delete pending[id];
    throw e;
  }));
  return p;
};

/** 確保這些特效的引擎都已載入（匯出 HTML、播放 Combo 前呼叫） */
export const ensureEngines = async (fxs: (Pick<Fx, 'engine'> | undefined)[]) => {
  const ids = [...new Set(fxs.map((f) => f?.engine).filter((x): x is EngineId => !!x))];
  await Promise.all(ids.map(loadEngine));
};

/** 匯出 HTML 時要先定義的全域程式碼；引擎還沒載入會丟錯，避免匯出壞掉的檔案 */
export const fxGlobals = (fx: Fx): string => {
  if (!fx.engine) return fx.globals ?? '';
  const g = GLOBALS[fx.engine];
  if (g === undefined) throw new Error(`繪製引擎 ${fx.engine} 尚未載入，請先呼叫 ensureEngines`);
  return (fx.globals ?? '') + g;
};
