import { CATEGORIES, EFFECTS, NUM, PALETTES } from '../../src/data';
import { loopSeconds } from '../../src/engine';
import { json, preflight } from '../_lib/env';

// 特效目錄（公開、唯讀）；已套用後台覆寫（functions/_middleware.ts）
export const onRequestGet = async () =>
  json(
    {
      total: EFFECTS.length,
      categories: CATEGORIES,
      palettes: PALETTES,
      effects: EFFECTS.map((f) => ({
        id: f.id,
        number: NUM.get(f.id),
        zh: f.zh,
        en: f.en,
        category: f.cat,
        description: f.desc,
        tags: f.tags,
        sample_words: f.sample,
        word_hint: f.hint ?? null,
        tone: f.tone,
        loop_seconds: loopSeconds(f),
        ...(f.preferredRatio ? { preferred_ratio: f.preferredRatio } : {}),
        needs_js: !!f.run,
        motion_zh: f.motion,
        motion_en: f.motionEn,
        ...(f.redirectTo ? { redirect_to: f.redirectTo, variant: f.variant ?? null } : {}),
      })),
    },
    200,
    { 'cache-control': 'public, max-age=300' },
  );
export const onRequestOptions = preflight;
