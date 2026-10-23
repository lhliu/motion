// 腳本轉 Combo：把一段口播腳本（一行一句或一段一段）依內容套上合適的特效，產生可以直接預覽的草稿。
// 只做初稿：數字、地名照腳本原文，不補資料；AI 或使用者再逐段調整。網站與 MCP 共用，不可碰 DOM。
import type { Combo, ComboScene } from './combo';
import type { Ratio } from './prompts';

/** 一句話拆成短影音大字幕的詞組（依標點切，每段最多 8 字） */
const chunks = (s: string) => {
  const parts = s.split(/[\s，。、！？!?,；;：:]+/).filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    // 太長就平均切成幾段，避免最後只剩一兩個字
    const c = [...p], n = Math.ceil(c.length / 8), len = Math.ceil(c.length / n);
    for (let i = 0; i < c.length; i += len) out.push(c.slice(i, i + len).join(''));
  }
  return out.slice(0, 6);
};
/** 口播大約一秒 5 個字，夾在 1.6–6 秒 */
const secs = (s: string, min = 1.6, max = 6) => Math.min(max, Math.max(min, Math.round(([...s.replace(/\s/g, '')].length / 5) * 10) / 10));

const NUM = /(\d+(?:[.,]\d+)?)\s*(分鐘|秒|公尺|公里|坪|萬|億|元|%|％|年|個月|戶|層|樓|站)/;

/** 判斷一行該用哪個特效 */
const CN = '一二三四五六七八九十';
const pick = (line: string, i: number, total: number, chapter: { n: number }): ComboScene => {
  const t = line.trim();
  // 章節：「#」或「第一章」開頭的短句
  const h = t.replace(/^#+\s*/, '');
  if ((/^#/.test(t) || /^第[一二三四五六七八九十\d]+[章段部]/.test(t)) && h.length <= 20) {
    const m = /^第([一二三四五六七八九十\d]+)[章段部][：:、\s]*(.*)$/.exec(h);
    chapter.n = m ? (/\d/.test(m[1]) ? Number(m[1]) : CN.indexOf(m[1]) + 1) : chapter.n + 1;
    return { effect: 'chapter-card', words: [String(chapter.n).padStart(2, '0'), (m?.[2] || h).slice(0, 12)], seconds: 2.4, note: '章節' };
  }
  // POV 開場
  if (/^pov[：:\s]/i.test(t)) return { effect: 'hook-pov', words: [t.replace(/^pov[：:\s]*/i, '')], seconds: 4, note: 'POV 開場' };
  // 回覆留言
  const cm = /^(?:回覆|留言)\s*@?([^\s：:]+)[：:]\s*(.+)$/.exec(t);
  if (cm) return { effect: 'ui-comment-reply', words: [cm[1], cm[2]], seconds: 4, note: '留言回覆' };
  // 比較
  const vs = /(.{1,8}?)\s*(?:vs\.?|VS|ＶＳ|還是|跟|和)\s*(.{1,8}?)(?:[，。？?!！]|$)/.exec(t);
  if (vs && /vs|還是|比較|差在/i.test(t)) return { effect: 'versus', words: [vs[1], vs[2]], seconds: 2.6, note: '比較' };
  // 數字
  const n = NUM.exec(t);
  if (n) {
    const rest = t.replace(n[0], '').replace(/^[，。、\s]+|[，。、\s]+$/g, '').slice(0, 16);
    return { effect: 'big-number', words: [n[1], n[2], rest || ' '], seconds: 3, note: '數字照腳本原文，請確認有來源' };
  }
  // 地點
  const loc = /(?:位於|就在|地點[在是：:]?|在)([^，。！？\s]{2,14}(?:路|街|站|區|里|段|公園|商圈|重劃區))/.exec(t);
  if (loc) return { effect: 'location-pin', words: [loc[1], t.replace(loc[0], '').replace(/^[，。\s]+/, '').slice(0, 16) || ' '], seconds: 3, note: '地點' };
  // 結尾
  if (i === total - 1 && /訂閱|追蹤|按讚|下一[支集部]|下次見|留言/.test(t)) return { effect: 'hook-endscreen', words: ['下一支：（填入影片名稱）', '你可能也想看：（填入影片名稱）', '追蹤'], seconds: 5, note: '片尾' };
  // 開場：第一句是問句就用衝擊放大的短句
  if (i === 0 && t.length <= 12) return { effect: 'punch-zoom', words: [t.replace(/[，。！？!?]/g, '')], seconds: 1.8, note: '開場' };
  return { effect: 'shorts-caption', words: chunks(t), seconds: secs(t), note: '口播字幕' };
};

/** 腳本 → Combo 草稿（最多 20 段）。清單（- 或 ・ 開頭的連續行）合成一段清單字卡；優缺點（+／- 開頭）合成優缺點對照 */
export const scriptToCombo = (script: string, opts: { title?: string; ratio?: Ratio } = {}): { combo: Combo; skipped: number } => {
  const raw = script
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const scenes: ComboScene[] = [];
  const chapter = { n: 0 };
  for (let i = 0; i < raw.length; i++) {
    const l = raw[i];
    // 優缺點：以 + 開頭的連續行（前面緊接的 - 行歸清單）
    if (/^[+＋]\s*\S/.test(l)) {
      const items: string[] = [];
      while (i < raw.length && /^[+＋\-－]\s*\S/.test(raw[i])) items.push(raw[i++].replace(/^＋/, '+').replace(/^－/, '-'));
      i--;
      scenes.push({ effect: 'estate-proscons', words: items.slice(0, 8), seconds: Math.min(8, 2 + items.length * 0.8), note: '優缺點' });
      continue;
    }
    // 清單：上一行當標題，接連續的 - ・ • * 項目
    if (/^[-・•*]\s*\S/.test(l)) {
      const items: string[] = [];
      while (i < raw.length && /^[-・•*]\s*\S/.test(raw[i])) items.push(raw[i++].replace(/^[-・•*]\s*/, '').slice(0, 16));
      i--;
      const prev = scenes[scenes.length - 1];
      const title = prev?.effect === 'shorts-caption' ? (scenes.pop()!.words ?? []).join('') : '重點整理';
      scenes.push({ effect: 'checklist', words: [title.slice(0, 16), ...items.slice(0, 5)], seconds: Math.min(7, 2 + items.length * 0.9), note: '清單' });
      continue;
    }
    scenes.push(pick(l, i, raw.length, chapter));
  }
  // 章節換段用色塊推擠，其他沿用整支的硬切
  scenes.forEach((s, k) => {
    if (k && s.effect === 'chapter-card') s.transition = 'push';
  });
  const kept = scenes.slice(0, 20);
  return {
    combo: { title: opts.title || '腳本草稿', ratio: opts.ratio ?? '9:16', transition: 'cut', tags: ['腳本'], scenes: kept },
    skipped: scenes.length - kept.length,
  };
};
