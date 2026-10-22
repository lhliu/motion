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

/** 取 n 個詞；不足時用預設補 */
export const pick = (w: string[], n: number, fallback: string[]): string[] => {
  const out = w.filter(Boolean).slice(0, n);
  let k = 0;
  while (out.length < n) out.push(fallback[k++ % fallback.length]);
  return out;
};

/** 可重現的偽亂數，讓每次渲染位置一致 */
export const rand = (seed: number): number => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

export const rep = (n: number, f: (i: number) => string): string => range(n).map(f).join('');
