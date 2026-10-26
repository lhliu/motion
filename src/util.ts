export const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** 把字串拆成逐字 span，帶 --i 索引與 --n 總數 */
export const chars = (t: string, cls = 'c', offset = 0): string => {
  const list = Array.from(t);
  return list
    .map(
      (ch, i) =>
        `<span class="${cls}" style="--i:${i + offset};--n:${list.length}">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`,
    )
    .join('');
};

/** 取 n 個詞；沒給文字時用範例，給了但不足時重複使用者的詞 */
export const pick = (w: string[], n: number, fallback: string[]): string[] => {
  const given = w.filter(Boolean).slice(0, n);
  // 有給文字時，不足的位置重複使用者自己的詞，不混入範例文字
  const src = given.length ? given : fallback;
  const out = [...given];
  let k = 0;
  while (out.length < n) out.push(src[k++ % src.length]);
  return out;
};

/** 可重現的偽亂數，讓每次渲染位置一致 */
export const rand = (seed: number): number => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

export const rep = (n: number, f: (i: number) => string): string => range(n).map(f).join('');

/** 以極座標半徑陣列產生平滑封閉曲線（Catmull-Rom 轉三次貝茲），點數固定，可用於 SVG 形變動畫 */
export const blobPath = (cx: number, cy: number, radii: number[], rot = 0): string => {
  const n = radii.length;
  const p = radii.map((r, i) => {
    const a = rot + (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
};

/** 有機形狀的半徑：lobes 瓣數、amp 起伏、phase 相位、wobble 細節 */
export const lobes = (n: number, base: number, k: number, amp: number, phase = 0, wobble = 0, seed = 1): number[] =>
  range(n).map((i) => {
    const t = (i / n) * Math.PI * 2;
    return base * (1 + amp * Math.cos(k * t + phase) + wobble * (rand(seed * 31 + i) - 0.5));
  });

/** 數字小工具（收據、開價成交價共用）：從「1,580萬」「68.5」取出數值，沒有數字回傳 NaN */
export const parseNum = (s: string): number => {
  const m = String(s).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
};
/** 照範本的小數位與千分位格式化（範本有逗號才加千分位） */
export const fmtLike = (v: number, like: string): string => {
  const m = String(like).replace(/,/g, '').match(/\.(\d+)/);
  const dec = m ? m[1].length : 0;
  const s = v.toFixed(dec);
  return /,/.test(like) || Math.abs(v) >= 10000 ? Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : s;
};
/** 降幅百分比（四捨五入到整數）：1580 → 1288 回傳 18；算不出來回傳 null */
export const pctDrop = (from: number, to: number): number | null =>
  Number.isFinite(from) && Number.isFinite(to) && from > 0 ? Math.round((1 - to / from) * 100) : null;
/** 數字後面的單位（「400萬」→「萬」） */
export const unitOf = (s: string): string => String(s).replace(/^[^\d]*-?[\d,.]+/, '').trim();
