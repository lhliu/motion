import type { Fx, Palette, Tone } from './types';
import { FONT_FAMILIES_QS, fontStack, NUM_FONT_CSS } from './fonts';

export const FONT_LINK =
  `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&${FONT_FAMILIES_QS}&display=swap`;

/** 每個特效根節點共用的基礎樣式 */
export const BASE_FX_CSS = `${NUM_FONT_CSS}
.fx{position:absolute;inset:0;overflow:hidden;display:grid;place-items:center;background:var(--bg);color:var(--fg);font-family:var(--sans);font-weight:900;line-height:1;--u:min(1cqw,1.7778cqh);-webkit-font-smoothing:antialiased}
.fx .c{display:inline-block;white-space:pre}
.fx *{box-sizing:border-box}`;

export const scopeCss = (fx: Fx): string =>
  fx.css.replace(/\.S\b/g, `.fx-${fx.id}`).replace(/\bK_/g, `k_${fx.id.replace(/-/g, '_')}_`);

export interface Vars {
  bg: string;
  fg: string;
  ac: string;
  ac2: string;
  /** 字型組合代碼，省略＝俐落黑體 */
  font?: string;
}

export const toneVars = (p: Palette, tone: Tone, font?: string): Vars => {
  if (tone === 'ink') return { bg: p.ink, fg: p.paper, ac: p.accent, ac2: p.accent2, font };
  if (tone === 'paper') return { bg: p.paper, fg: p.ink, ac: p.accent, ac2: p.accent2, font };
  return { bg: p.accent, fg: p.ink, ac: p.paper, ac2: p.accent2, font };
};

export const varsCss = (v: Vars): string =>
  `--bg:${v.bg};--fg:${v.fg};--ac:${v.ac};--ac2:${v.ac2};--hl:${v.ac2};--mu:color-mix(in srgb,${v.fg} 30%,transparent);--sans:${fontStack(v.font)};--serif:"Noto Serif TC",serif;--mono:"JetBrains Mono",ui-monospace,monospace`;

const injected = new Set<string>();

const ensureCss = (fx: Fx) => {
  if (!injected.size) {
    const base = document.createElement('style');
    base.dataset.fx = 'base';
    base.textContent = BASE_FX_CSS;
    document.head.appendChild(base);
  }
  if (injected.has(fx.id)) return;
  injected.add(fx.id);
  const el = document.createElement('style');
  el.dataset.fx = fx.id;
  el.textContent = scopeCss(fx);
  document.head.appendChild(el);
};

export interface Mounted {
  root: HTMLElement;
  stop: () => void;
}

/** 把特效掛到容器上；回傳停止函式 */
export const mount = (host: HTMLElement, fx: Fx, words: string[], vars: Vars, speed = 1): Mounted => {
  ensureCss(fx);
  host.replaceChildren();
  const root = document.createElement('div');
  root.className = `fx fx-${fx.id}`;
  root.setAttribute('style', varsCss(vars));
  root.innerHTML = fx.html(words);
  host.appendChild(root);
  let cleanup: (() => void) | void;
  // 等一個 frame 讓尺寸就緒（canvas 特效需要）
  const raf = requestAnimationFrame(() => {
    if (!root.isConnected) return;
    try {
      cleanup = fx.run?.(root, words);
    } catch (e) {
      console.error(fx.id, e);
    }
    setSpeed(root, speed);
  });
  setSpeed(root, speed);
  return {
    root,
    stop: () => {
      cancelAnimationFrame(raf);
      if (typeof cleanup === 'function') cleanup();
      root.remove();
    },
  };
};

export const setSpeed = (root: HTMLElement, speed: number) => {
  root.dataset.motionSpeed = String(speed);
  root.getAnimations({ subtree: true }).forEach((a) => (a.playbackRate = speed));
  root.querySelectorAll('svg').forEach((s) => {
    try {
      if (speed === 0) s.pauseAnimations();
      else s.unpauseAnimations();
    } catch {
      /* 非 SVG 根節點 */
    }
  });
};

/** Canvas 可明訂循環長度；其餘從 CSS 抓出主要循環秒數。 */
export const loopSeconds = (fx: Fx): number => {
  if (typeof fx.duration === 'number' && Number.isFinite(fx.duration) && fx.duration > 0) return fx.duration;
  const m = fx.css.match(/animation:[^;]*?(\d+(?:\.\d+)?)s/);
  return m ? parseFloat(m[1]) : fx.run ? 4 : 4;
};

/** 把 run 函式轉成可內嵌的原始碼；補上打包工具可能插入的 __name 輔助函式 */
export const fnSource = (f: (...a: never[]) => unknown): string => {
  const s = f.toString();
  const names = [...new Set(s.match(/\b__name\d*\b/g) ?? [])];
  return names.length ? `(()=>{const ${names.map((n) => `${n}=(f)=>f`).join(',')};return (${s})})()` : `(${s})`;
};
