// 文字特效的「用途」分類（剪片時怎麼找），原本的技法分類改當「風格」篩選。網站與 MCP 共用。
import type { Combo } from './combo';

export type UseId = 'open' | 'caption' | 'info' | 'trans' | 'emph' | 'mood';

export interface Use {
  id: UseId;
  code: string;
  zh: string;
  tagline: string;
}

export const USES: Use[] = [
  { id: 'open', code: 'OPEN', zh: '開場標題', tagline: '片頭、標題登場、品牌 Logo' },
  { id: 'caption', code: 'CAPTION', zh: '字幕標註', tagline: '名牌、地點、字幕、重點圈選' },
  { id: 'info', code: 'INFO', zh: '資訊字卡', tagline: '數字、清單、比較、時間軸' },
  { id: 'trans', code: 'TRANS', zh: '轉場切換', tagline: '換段落、換畫面、換一個詞' },
  { id: 'emph', code: 'EMPH', zh: '強調情緒', tagline: '吸睛、俏皮、警示、節奏感' },
  { id: 'mood', code: 'MOOD', zh: '風格氛圍', tagline: '霓虹、復古、粒子、質感字' },
];

const g = (use: UseId, ids: string) => ids.split(/\s+/).filter(Boolean).map((id) => [id, use] as const);
export const USE_OF: Record<string, UseId> = Object.fromEntries([
  ...g('open', 'punch-zoom slam mask-rise box-wipe curtain split-reveal line-unfold iris spin-in text-tunnel ring-tunnel text-orbit text-cylinder extrude star-crawl lens-flare particle-form spotlight shine-sweep crisp-drop glass-blob-title drop-splash countdown circle-badge crt-power'),
  ...g('caption', 'shorts-caption location-pin lower-third callout highlighter subscribe-cta news-ticker chat-bubbles karaoke danmaku hashtag-pop typewriter handwrite marquee-stack credits-roll'),
  ...g('info', 'big-number versus checklist timeline chapter-card qa-card progress-bar ranking quote-card odometer headline-swap split-flap led-board newspaper-spin'),
  ...g('trans', 'zoom-through flip-cards split-halves blinds scramble diagonal-bands domino flip-chars text-cube split-invert shatter noise-dissolve gooey-merge bubble-pop squeeze'),
  ...g('emph', 'word-burst letter-hit stamp stretch shake-alert bounce-in swing-sign gravity-fall jelly heartbeat scatter-gather wave-text kinetic-stack lightning pixelate slot-reel tape-cross'),
  ...g('mood', 'blur-focus fade-chars ink-spread tracking-breathe huge-scroll vertical-flow repeat-wave ribbon parallax-columns text-corridor text-vortex outline-fill glitch-slices pattern-mask long-shadow liquid-fill text-echo offset-stroke paper-cut neon-flicker glow-pulse laser-scan sunrise smoke-away halftone heat-distort matrix-rain bubbles-rise water-ripple vhs terminal old-film synthwave pixel-game'),
]);

/** 建案片常用（文字區最上方） */
export const PICKS = ['shorts-caption', 'location-pin', 'big-number', 'lower-third', 'callout', 'versus', 'checklist', 'timeline', 'chapter-card', 'punch-zoom', 'qa-card', 'subscribe-cta'];

/** 風格氛圍預設只顯示前幾招 */
export const MOOD_PREVIEW = 8;

/** 套組：常見段落順序，帶進 Combo 草稿後換字即可（文字皆為示意，請換成可查證的內容） */
export const KITS: { id: string; zh: string; desc: string; combo: Combo }[] = [
  {
    id: 'kit-unbox',
    zh: '建案開箱 Shorts',
    desc: '開場 → 地點 → 重點數字 → 大字幕 → 訂閱',
    combo: {
      title: '建案開箱 Shorts',
      ratio: '9:16',
      transition: 'cut',
      tags: ['套組', '建案', 'Shorts'],
      scenes: [
        { effect: 'punch-zoom', words: ['開箱'], seconds: 1.6, note: '開場：一個詞' },
        { effect: 'location-pin', words: ['某某建案', '某某站 · 步行 ○ 分鐘'], seconds: 3, note: '地點與交通，數字請換成實測' },
        { effect: 'big-number', words: ['○', '分鐘', '步行到捷運站'], seconds: 3, note: '最想強調的一個數字' },
        { effect: 'shorts-caption', words: ['這間', '最大的', '優點', '是'], seconds: 3, note: '口播大字幕' },
        { effect: 'subscribe-cta', seconds: 2.4, note: '片尾' },
      ],
    },
  },
  {
    id: 'kit-zone',
    zh: '重劃區介紹',
    desc: '章節 → 地點 → 時間軸 → 重點清單 → 金句',
    combo: {
      title: '重劃區介紹',
      ratio: '16:9',
      transition: 'fade',
      tags: ['套組', '重劃區', '長片'],
      scenes: [
        { effect: 'chapter-card', words: ['01', '區域介紹'], seconds: 2.4 },
        { effect: 'location-pin', words: ['某某重劃區', '某某路 × 某某路'], seconds: 3 },
        { effect: 'timeline', words: ['○○｜公告', '○○｜工程', '○○｜完成', '○○｜交屋'], seconds: 4, note: '年份與進度請換成公告資料' },
        { effect: 'checklist', words: ['看這區要注意', '交通', '生活機能', '嫌惡設施'], seconds: 4 },
        { effect: 'quote-card', words: ['先看生活', '再看房子', '— 持家男子 KC'], seconds: 3 },
      ],
    },
  },
  {
    id: 'kit-commute',
    zh: '通勤實測',
    desc: '標題 → 地點 → 時間比較 → 結論',
    combo: {
      title: '通勤實測',
      ratio: '9:16',
      transition: 'cut',
      tags: ['套組', '通勤', 'Shorts'],
      scenes: [
        { effect: 'slam', words: ['通勤實測'], seconds: 1.8 },
        { effect: 'location-pin', words: ['出發：某某社區', '目的地：某某站'], seconds: 3 },
        { effect: 'versus', words: ['尖峰', '離峰'], seconds: 2.6, note: '兩種時段的實測' },
        { effect: 'big-number', words: ['○○', '分鐘', '門到門實測'], seconds: 3, note: '請換成實測數字' },
        { effect: 'shorts-caption', words: ['結論', '是'], seconds: 2.4 },
      ],
    },
  },
];

/** 情境標籤收斂成固定詞彙；沒對到的原始標籤只留在搜尋，不出現在篩選列 */
const TAG_GROUPS: Record<string, string> = {
  片頭: '開場 片頭 開幕 預告',
  片尾: '片尾 感謝',
  標題: '標題 公告 頭條',
  轉場: '轉場 切換',
  字幕: '字幕 歌詞 朗讀 訪談 人名 對話 新聞 即時 快訊 地點 外景',
  數據: '數據 數字 成績 進度',
  比較: '比較 二選一 TOP 3 反差',
  重點: '強調 重點 亮點 注意 警告 解說 重點整理 懶人包 關鍵字 金句',
  揭曉: '揭曉 結果揭曉 抽獎 揭露',
  專業: '簡報 極簡',
  質感: '質感 高級感 設計感 時尚 手作 簽名 東方 書法 扁平風 靜與動',
  活潑: '俏皮 可愛 搞笑 活潑 輕鬆 兒童 彈性 甜點 熱鬧 互動 遊戲 夏天 心動 告白 集合 團隊 裝飾',
  科技: '科技 駭客 科幻 工程師 電子',
  復古: '復古 懷舊 80s 默片 回憶 普普風 印刷',
  療癒: '療癒 氛圍 清爽 溫暖 感性 早晨 希望 優雅',
  電影感: '電影感 沉浸 景深 遠景 MV 夢境 奇幻 背景 夜景 酒吧 配樂感',
  品牌: '品牌 Logo 徽章 店招',
  Shorts: 'Shorts Reels 社群',
  長片: '長片 YouTube 章節',
  可疊影片: '可疊影片',
};
const TAG_CANON = new Map<string, string>();
for (const [canon, raw] of Object.entries(TAG_GROUPS)) raw.split(' ').forEach((t) => TAG_CANON.set(t.replace(' ', ' '), canon));
export const TEXT_TAGS = Object.keys(TAG_GROUPS);
export const canonTags = (tags: string[]): string[] => [...new Set(tags.map((t) => TAG_CANON.get(t)).filter((t): t is string => !!t))];
