import { CATEGORIES, EFFECTS, NUM, PALETTES } from '../../src/data';
import { loopSeconds } from '../../src/engine';
import { json, preflight } from '../_lib/env';

// 特效目錄（公開、唯讀）
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
        needs_js: !!f.run,
        motion_zh: f.motion,
        motion_en: f.motionEn,
      })),
    },
    200,
    { 'cache-control': 'public, max-age=300' },
  );
export const onRequestOptions = preflight;
