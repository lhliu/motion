// 地圖疊加元件：照「持家男子KC」地圖片段的樣式設計，全部硬邊、不使用陰影或模糊。
// 座標用 0–1 的畫面比例，尺寸以短邊 1080 為基準。

export type MType = 'tag' | 'road' | 'site' | 'label' | 'pin' | 'info' | 'stat' | 'compass' | 'text';

export interface MEl {
  id: string;
  type: MType;
  x: number;
  y: number;
  size: number;
  delay: number;
  text?: string;
  /** 主色：標籤底色、框線、卡片強調色 */
  color?: string;
  /** 文字色 */
  fg?: string;
  /** 卡片或填色的透明度 */
  alpha?: number;
  /** road：直排；text：描邊 */
  vertical?: boolean;
  /** road：light 白底黑字，dark 深底白字 */
  variant?: 'dark' | 'light';
  /** site：四個角（0–1） */
  pts?: number[][];
  /** info：每行一句，* 開頭用強調色；stat：「標籤|數字|單位|附註」 */
  lines?: string[];
}

export interface MScene {
  ratio: '9:16' | '16:9' | '1:1';
  els: MEl[];
  loop: number;
  bgZoom: number;
  bgX: number;
  bgY: number;
  bgDim: number;
}

export const RATIO_PX: Record<MScene['ratio'], [number, number]> = { '9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080] };

export const TYPE_NAME: Record<MType, string> = {
  tag: '標題籤',
  road: '道路標籤',
  site: '基地框',
  label: '基地標籤',
  pin: '定位針',
  info: '資訊卡',
  stat: '數據卡',
  compass: '指北針',
  text: '文字',
};

const FONT = '"Noto Sans TC", "PingFang TC", sans-serif';
const YELLOW = '#f2c14e';
const clamp = (p: number) => Math.max(0, Math.min(1, p));
const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
const back = (p: number) => {
  const q = clamp(p) - 1;
  return 1 + 2.6 * q * q * q + 1.6 * q * q;
};

let uid = 0;
export const newId = () => `e${Date.now().toString(36)}${(uid++).toString(36)}`;

/** 新元素的預設值 */
export const makeEl = (type: MType, at: Partial<MEl> = {}): MEl => {
  const base: Record<MType, Partial<MEl>> = {
    tag: { x: 0.06, y: 0.07, size: 1, text: '區域｜案名', color: '#1c1c1c', fg: '#ffffff', alpha: 0.88 },
    road: { x: 0.5, y: 0.3, size: 1, text: '某某路', variant: 'dark' },
    site: { x: 0.5, y: 0.42, size: 1, color: YELLOW, alpha: 0.28, pts: [[0.3, 0.37], [0.7, 0.37], [0.7, 0.49], [0.3, 0.49]] },
    label: { x: 0.5, y: 0.43, size: 1, text: '某某 基地', color: YELLOW, fg: '#1c1c1c' },
    pin: { x: 0.58, y: 0.45, size: 1, color: '#f07a3f' },
    info: { x: 0.5, y: 0.66, size: 1, color: YELLOW, alpha: 0.8, lines: ['*地上 30 層', 'A、B 兩棟 雙塔', '*SRC 鋼骨結構'] },
    stat: { x: 0.5, y: 0.67, size: 1, color: YELLOW, alpha: 0.95, text: '案名', fg: '路名 × 路名', lines: ['地上|27|層|', '全案|283|戶|', '每層|11–12|戶|4 部電梯'] },
    compass: { x: 0.9, y: 0.12, size: 1 },
    text: { x: 0.5, y: 0.84, size: 1, text: '字幕文字', color: '#ffffff', fg: '#111111', vertical: true },
  };
  return { id: newId(), type, x: 0.5, y: 0.5, size: 1, delay: 0, ...base[type], ...at } as MEl;
};

/* ───────── 繪製工具 ───────── */
const pill = (ctx: CanvasRenderingContext2D, cx: number, cy: number, text: string, fs: number, bg: string, fg: string, bgAlpha = 1, padX = 0.6, dot?: string) => {
  ctx.font = `900 ${fs}px ${FONT}`;
  const tw = ctx.measureText(text).width;
  const dotW = dot ? fs * 0.95 : 0;
  const w = tw + fs * padX * 2 + dotW;
  const h = fs * 1.62;
  ctx.save();
  ctx.globalAlpha *= bgAlpha;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.restore();
  if (dot) {
    ctx.fillStyle = dot;
    ctx.beginPath();
    ctx.arc(cx - w / 2 + fs * padX + fs * 0.3, cy, fs * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx + dotW / 2, cy + fs * 0.04);
  return [w, h];
};

const countText = (target: string, p: number) => {
  const m = target.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m || p >= 1) return target;
  const n = parseFloat(m[2]);
  const dec = (m[2].split('.')[1] || '').length;
  return m[1] + (n * ease(p)).toFixed(dec) + m[3];
};

/** 畫一個元素；回傳完成狀態下的外框（用於拖曳） */
const drawEl = (ctx: CanvasRenderingContext2D, W: number, H: number, el: MEl, t: number): number[] => {
  const u = (Math.min(W, H) / 1080) * el.size;
  const lt = t - el.delay;
  const X = el.x * W;
  const Y = el.y * H;
  const p = clamp(lt / 0.5);
  let box = [X - 10, Y - 10, X + 10, Y + 10];
  if (lt < 0) {
    // 尚未登場：只計算外框
    ctx.save();
    ctx.globalAlpha = 0;
  } else ctx.save();

  switch (el.type) {
    case 'tag': {
      ctx.globalAlpha *= ease(p);
      ctx.translate((1 - ease(p)) * -40 * u, 0);
      const fs = 46 * u;
      ctx.font = `900 ${fs}px ${FONT}`;
      const w = ctx.measureText(el.text ?? '').width + fs * 2.15;
      const [, h] = pill(ctx, X + w / 2, Y, el.text ?? '', fs, el.color ?? '#1c1c1c', el.fg ?? '#fff', el.alpha ?? 0.88, 0.6, YELLOW);
      box = [X, Y - h / 2, X + w, Y + h / 2];
      break;
    }
    case 'road': {
      const s = back(p);
      ctx.globalAlpha *= clamp(lt / 0.15);
      ctx.translate(X, Y);
      if (el.vertical) ctx.rotate(Math.PI / 2);
      ctx.scale(s, s);
      const dark = el.variant !== 'light';
      const [w, h] = pill(ctx, 0, 0, el.text ?? '', 40 * u, dark ? '#1c1c1c' : '#ffffff', dark ? '#ffffff' : '#1c1c1c', dark ? 0.86 : 0.95, 0.55);
      box = el.vertical ? [X - h / 2, Y - w / 2, X + h / 2, Y + w / 2] : [X - w / 2, Y - h / 2, X + w / 2, Y + h / 2];
      break;
    }
    case 'site': {
      const pts = (el.pts ?? []).map(([a, b]) => [a * W, b * H]);
      if (pts.length < 3) break;
      const path = new Path2D();
      pts.forEach(([a, b], i) => (i ? path.lineTo(a, b) : path.moveTo(a, b)));
      path.closePath();
      let len = 0;
      pts.forEach((q, i) => {
        const r = pts[(i + 1) % pts.length];
        len += Math.hypot(r[0] - q[0], r[1] - q[1]);
      });
      const draw = clamp(lt / 0.9);
      ctx.save();
      ctx.globalAlpha *= (el.alpha ?? 0.28) * ease((lt - 0.7) / 0.4);
      ctx.fillStyle = el.color ?? YELLOW;
      ctx.fill(path);
      ctx.restore();
      ctx.strokeStyle = el.color ?? YELLOW;
      ctx.lineWidth = 9 * u;
      ctx.lineJoin = 'round';
      ctx.setLineDash([len * ease(draw), len + 1]);
      ctx.stroke(path);
      ctx.setLineDash([]);
      const xs = pts.map((q) => q[0]);
      const ys = pts.map((q) => q[1]);
      box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
      break;
    }
    case 'label': {
      const s = back(p);
      ctx.globalAlpha *= clamp(lt / 0.15);
      ctx.translate(X, Y);
      ctx.scale(s, s);
      const [w, h] = pill(ctx, 0, 0, el.text ?? '', 50 * u, el.color ?? YELLOW, el.fg ?? '#1c1c1c', 1, 0.75);
      box = [X - w / 2, Y - h / 2, X + w / 2, Y + h / 2];
      break;
    }
    case 'pin': {
      const fall = clamp(lt / 0.55);
      const dy = (1 - back(fall)) * -260 * u;
      ctx.globalAlpha *= clamp(lt / 0.12);
      const r = 34 * u;
      ctx.fillStyle = '#00000040';
      ctx.beginPath();
      ctx.ellipse(X, Y, r * 0.55 * ease(fall), r * 0.18 * ease(fall), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(X, Y + dy);
      ctx.fillStyle = el.color ?? '#f07a3f';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-r * 0.35, -r * 0.6, -r, -r * 1.05, -r, -r * 1.75);
      ctx.arc(0, -r * 1.75, r, Math.PI, 0);
      ctx.bezierCurveTo(r, -r * 1.05, r * 0.35, -r * 0.6, 0, 0);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -r * 1.75, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      box = [X - r, Y - r * 2.8, X + r, Y + 6];
      break;
    }
    case 'info': {
      const lines = el.lines ?? [];
      const fs = 64 * u;
      ctx.font = `900 ${fs}px ${FONT}`;
      const tw = Math.max(...lines.map((l) => ctx.measureText(l.replace(/^\*/, '')).width), 100);
      const w = tw + fs * 1.6;
      const h = lines.length * fs * 1.32 + fs * 0.9;
      const e = ease(p);
      ctx.globalAlpha *= e;
      ctx.translate(0, (1 - e) * 50 * u);
      ctx.save();
      ctx.globalAlpha *= el.alpha ?? 0.8;
      ctx.fillStyle = '#1b1c20';
      ctx.beginPath();
      ctx.roundRect(X - w / 2, Y - h / 2, w, h, 22 * u);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = el.color ?? YELLOW;
      ctx.fillRect(X - w / 2 + fs * 0.32, Y - h / 2 + fs * 0.4, 9 * u, h - fs * 0.8);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      lines.forEach((l, i) => {
        const le = ease((lt - 0.2 - i * 0.15) / 0.4);
        ctx.save();
        ctx.globalAlpha *= le;
        ctx.fillStyle = l.startsWith('*') ? (el.color ?? YELLOW) : '#ffffff';
        ctx.fillText(l.replace(/^\*/, ''), X + fs * 0.1, Y - h / 2 + fs * 0.45 + fs * 1.32 * (i + 0.5) + (1 - le) * 12 * u);
        ctx.restore();
      });
      box = [X - w / 2, Y - h / 2, X + w / 2, Y + h / 2];
      break;
    }
    case 'stat': {
      const items = (el.lines ?? []).map((l) => l.split('|'));
      const n = Math.max(1, items.length);
      const w = Math.min(W * 0.94, 980 * u);
      const h = 380 * u;
      const e = ease(p);
      ctx.globalAlpha *= e;
      ctx.translate(0, (1 - e) * 60 * u);
      ctx.save();
      ctx.globalAlpha *= el.alpha ?? 0.95;
      ctx.fillStyle = '#16263d';
      ctx.beginPath();
      ctx.roundRect(X - w / 2, Y - h / 2, w, h, 30 * u);
      ctx.fill();
      ctx.restore();
      const left = X - w / 2 + 48 * u;
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      ctx.font = `900 ${76 * u}px ${FONT}`;
      ctx.fillStyle = '#ffffff';
      const title = el.text ?? '';
      ctx.fillText(title, left, Y - h / 2 + 108 * u);
      const ttw = ctx.measureText(title).width;
      ctx.fillStyle = el.color ?? YELLOW;
      ctx.fillRect(left, Y - h / 2 + 122 * u, ttw * ease((lt - 0.3) / 0.5), 7 * u);
      ctx.font = `700 ${40 * u}px ${FONT}`;
      ctx.fillStyle = '#8fa7c4';
      ctx.fillText(el.fg ?? '', left + ttw + 36 * u, Y - h / 2 + 104 * u);
      const colW = (w - 96 * u) / n;
      items.forEach(([label, value, unit, note], i) => {
        const cx = left + colW * i;
        const ip = clamp((lt - 0.35 - i * 0.12) / 1);
        ctx.font = `700 ${38 * u}px ${FONT}`;
        ctx.fillStyle = '#8fa7c4';
        ctx.fillText(label ?? '', cx, Y - h / 2 + 205 * u);
        ctx.font = `900 ${100 * u}px ${FONT}`;
        ctx.fillStyle = el.color ?? YELLOW;
        const v = countText(value ?? '', ip);
        ctx.fillText(v, cx, Y - h / 2 + 310 * u);
        const vw = ctx.measureText(v).width;
        ctx.font = `700 ${40 * u}px ${FONT}`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(unit ?? '', cx + vw + 8 * u, Y - h / 2 + 310 * u);
        if (note) {
          ctx.font = `700 ${34 * u}px ${FONT}`;
          ctx.fillStyle = '#8fa7c4';
          ctx.fillText(note, cx, Y - h / 2 + 352 * u);
        }
      });
      box = [X - w / 2, Y - h / 2, X + w / 2, Y + h / 2];
      break;
    }
    case 'compass': {
      const r = 44 * u;
      ctx.globalAlpha *= ease(p);
      ctx.translate(X, Y);
      ctx.rotate((1 - ease(p)) * -1.2);
      ctx.fillStyle = '#1c1c1cdd';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate(0.6);
      ctx.fillStyle = '#e5484d';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.78);
      ctx.lineTo(r * 0.24, 0);
      ctx.lineTo(-r * 0.24, 0);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, r * 0.78);
      ctx.lineTo(r * 0.24, 0);
      ctx.lineTo(-r * 0.24, 0);
      ctx.fill();
      ctx.rotate(-0.6);
      ctx.font = `900 ${30 * u}px ${FONT}`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', r * 0.95, -r * 0.95);
      box = [X - r, Y - r * 1.4, X + r * 1.4, Y + r];
      break;
    }
    case 'text': {
      const fs = 56 * u;
      ctx.globalAlpha *= ease(p);
      ctx.font = `900 ${fs}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = (el.text ?? '').split('\n');
      const lh = fs * 1.25;
      let tw = 0;
      lines.forEach((l, i) => {
        const yy = Y + (i - (lines.length - 1) / 2) * lh;
        if (el.vertical) {
          ctx.lineJoin = 'round';
          ctx.lineWidth = fs * 0.22;
          ctx.strokeStyle = el.fg ?? '#111';
          ctx.strokeText(l, X, yy);
        }
        ctx.fillStyle = el.color ?? '#fff';
        ctx.fillText(l, X, yy);
        tw = Math.max(tw, ctx.measureText(l).width);
      });
      box = [X - tw / 2, Y - (lines.length * lh) / 2, X + tw / 2, Y + (lines.length * lh) / 2];
      break;
    }
  }
  ctx.restore();
  return box;
};

/** 畫整個場景；bg 為底圖（可省略＝透明）；回傳每個元素的外框 */
export const drawScene = (ctx: CanvasRenderingContext2D, W: number, H: number, sc: MScene, t: number, bg?: CanvasImageSource & { width: number; height: number }): Map<string, number[]> => {
  ctx.clearRect(0, 0, W, H);
  if (bg) {
    const s = Math.max(W / bg.width, H / bg.height) * sc.bgZoom;
    const dw = bg.width * s;
    const dh = bg.height * s;
    ctx.drawImage(bg, (W - dw) * sc.bgX, (H - dh) * sc.bgY, dw, dh);
    if (sc.bgDim > 0) {
      ctx.fillStyle = `rgba(0,0,0,${sc.bgDim})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
  const boxes = new Map<string, number[]>();
  for (const el of sc.els) boxes.set(el.id, drawEl(ctx, W, H, el, t));
  return boxes;
};

/** 範本：照兩種常用畫面配置 */
export const TEMPLATES: { name: string; scene: () => MScene }[] = [
  {
    name: '鳥瞰基地',
    scene: () => ({
      ratio: '9:16',
      loop: 6,
      bgZoom: 1,
      bgX: 0.5,
      bgY: 0.5,
      bgDim: 0.1,
      els: [
        makeEl('tag', { x: 0.04, y: 0.075, text: '區域｜案名', delay: 0 }),
        makeEl('text', { x: 0.27, y: 0.135, text: '紅線：地籍界線', vertical: true, delay: 0.2, size: 0.62 }),
        makeEl('compass', { x: 0.9, y: 0.12, delay: 0.2 }),
        makeEl('site', { pts: [[0.29, 0.38], [0.71, 0.39], [0.69, 0.5], [0.29, 0.49]], delay: 0.4 }),
        makeEl('label', { x: 0.5, y: 0.44, text: '某某 基地', delay: 1.2 }),
        makeEl('road', { x: 0.5, y: 0.375, text: '某某街', delay: 1.4 }),
        makeEl('road', { x: 0.5, y: 0.51, text: '某某路', delay: 1.5 }),
        makeEl('road', { x: 0.2, y: 0.44, text: '某某一路', vertical: true, delay: 1.6 }),
        makeEl('road', { x: 0.75, y: 0.45, text: '某某二路', vertical: true, delay: 1.7 }),
        makeEl('info', { y: 0.67, delay: 2 }),
        makeEl('text', { x: 0.5, y: 0.82, text: '字幕放這裡', vertical: true, delay: 2.4 }),
        makeEl('text', { x: 0.5, y: 0.88, text: '底圖：內政部國土測繪中心 正射影像', color: '#ffffffcc', vertical: false, size: 0.42, delay: 0 }),
        makeEl('text', { x: 0.5, y: 0.92, text: '持家男子KC / @kch0263', vertical: true, size: 0.62, delay: 0 }),
      ],
    }),
  },
  {
    name: '街道圖基地',
    scene: () => ({
      ratio: '9:16',
      loop: 6,
      bgZoom: 1,
      bgX: 0.5,
      bgY: 0.5,
      bgDim: 0,
      els: [
        makeEl('tag', { x: 0.03, y: 0.08, text: '案名｜區域 路名', delay: 0 }),
        makeEl('road', { x: 0.2, y: 0.26, text: '某某東路', variant: 'light', delay: 0.3 }),
        makeEl('road', { x: 0.73, y: 0.44, text: '某某路', variant: 'light', delay: 0.4 }),
        makeEl('site', { pts: [[0.5, 0.38], [0.69, 0.37], [0.63, 0.42], [0.5, 0.42]], color: '#f07a3f', alpha: 0.25, delay: 0.6 }),
        makeEl('pin', { x: 0.58, y: 0.4, delay: 1.2 }),
        makeEl('label', { x: 0.35, y: 0.395, text: '基地範圍示意', color: '#f07a3f', fg: '#ffffff', size: 0.8, delay: 1.5 }),
        makeEl('stat', { y: 0.6, delay: 1.9 }),
        makeEl('text', { x: 0.5, y: 0.74, text: '字幕放這裡', vertical: true, delay: 2.4 }),
        makeEl('text', { x: 0.5, y: 0.8, text: '底圖：內政部國土測繪中心 電子地圖', color: '#333333', vertical: false, size: 0.42, delay: 0 }),
      ],
    }),
  },
  { name: '空白', scene: () => ({ ratio: '9:16', loop: 6, bgZoom: 1, bgX: 0.5, bgY: 0.5, bgDim: 0, els: [] }) },
];
