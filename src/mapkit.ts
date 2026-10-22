// 地圖疊加元件：照「持家男子KC」地圖片段的樣式設計，全部硬邊、不使用陰影或模糊。
// 座標用 0–1 的畫面比例，尺寸以短邊 1080 為基準。

export type MType = 'tag' | 'road' | 'site' | 'label' | 'pin' | 'info' | 'stat' | 'compass' | 'text' | 'routes';

export interface MEl {
  id: string;
  /** 範本角色，讓 AI 只換文字即可 */
  role?: string;
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
  /** info：每行一句，* 開頭用強調色；stat：「標籤|數字|單位|附註」；routes：「目的地|附註|#色碼」 */
  lines?: string[];
  /** routes：路線彎曲程度（-0.5～0.5，0＝直線） */
  curve?: number;
  /** routes：虛線並往前流動 */
  dash?: boolean;
  /** routes：每條路線不同顏色（false＝全部用 color） */
  multi?: boolean;
}

export interface MScene {
  ratio: '9:16' | '16:9' | '1:1';
  els: MEl[];
  loop: number;
  bgZoom: number;
  bgX: number;
  bgY: number;
  bgDim: number;
  /** 底圖網址或 data URL（選填） */
  bgUrl?: string;
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
  routes: '放射路線',
};

const YELLOW = '#f2c14e';
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
    routes: { x: 0.5, y: 0.6, size: 1, text: '某某建案', color: '#ff5a36', multi: true, curve: 0.15, dash: false, lines: ['南港|開車約 ○ 分鐘', '內湖|開車約 ○ 分鐘', '台北車站|開車約 ○ 分鐘'] },
  };
  const el = { id: newId(), type, x: 0.5, y: 0.5, size: 1, delay: 0, ...base[type], ...at } as MEl;
  if (type === 'routes') syncRoutes(el);
  return el;
};

/** 放射路線：讓目的地座標數量跟著目的地清單（新增的目的地自動排成扇形） */
export const syncRoutes = (el: MEl) => {
  const n = (el.lines ?? []).length;
  const pts = (el.pts ?? []).slice(0, n);
  for (let i = pts.length; i < n; i++) {
    const a = -Math.PI * (0.85 - (0.7 * i) / Math.max(1, n - 1 || 1));
    pts.push([Math.max(0.12, Math.min(0.88, el.x + Math.cos(a) * 0.3)), Math.max(0.1, Math.min(0.9, el.y + Math.sin(a) * 0.22))]);
  }
  el.pts = pts;
  return el;
};


/** 繪製引擎工廠：內部完全自給自足，匯出 HTML 時以 toString() 內嵌 */
export const mapRenderer = () => {
  const FONT = '"Noto Sans TC", "PingFang TC", sans-serif';
  const YELLOW = '#f2c14e';
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
  const back = (p: number) => {
    const q = clamp(p) - 1;
    return 1 + 2.6 * q * q * q + 1.6 * q * q;
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
      case 'routes': {
        const PAL = ['#ff5a36', '#f2c14e', '#3fa9f5', '#34c38f', '#a78bfa', '#f472b6'];
        const isLight = (hex: string) => {
          const h = hex.replace('#', '');
          if (h.length < 6) return true;
          const [r, g, b] = [0, 2, 4].map((k) => parseInt(h.slice(k, k + 2), 16));
          return r * 0.299 + g * 0.587 + b * 0.114 > 165;
        };
        const items = (el.lines ?? []).map((l) => l.split('|').map((x) => x.trim()));
        const pts = el.pts ?? [];
        const base = el.color ?? '#ff5a36';
        const r0 = 22 * u;
        const lw = 11 * u;
        const xs = [X];
        const ys = [Y];
        items.forEach((it, i) => {
          const d = pts[i];
          if (!d) return;
          const DX = d[0] * W;
          const DY = d[1] * H;
          xs.push(DX);
          ys.push(DY);
          const st = lt - 0.35 - i * 0.35;
          if (st <= 0) return;
          const col = it[2] || (el.multi === false ? base : PAL[i % PAL.length]);
          // 二次貝茲曲線：控制點往垂直方向偏移
          const vx = DX - X;
          const vy = DY - Y;
          const k = el.curve ?? 0.15;
          const cx = (X + DX) / 2 - vy * k;
          const cy = (Y + DY) / 2 + vx * k;
          const pt: number[][] = [];
          for (let j = 0; j <= 60; j++) {
            const q = j / 60;
            const a = (1 - q) * (1 - q);
            const b = 2 * (1 - q) * q;
            const c = q * q;
            const px = a * X + b * cx + c * DX;
            const py = a * Y + b * cy + c * DY;
            if (Math.hypot(px - X, py - Y) > r0 * 1.6) pt.push([px, py]);
          }
          if (pt.length < 2) return;
          const seg = pt.slice(1).map((q, j) => Math.hypot(q[0] - pt[j][0], q[1] - pt[j][1]));
          const total = seg.reduce((s2, v) => s2 + v, 0);
          const pr = ease(st / 0.8);
          let left = total * pr;
          const path = [pt[0]];
          for (let j = 0; j < seg.length && left > 0; j++) {
            const f = Math.min(1, left / Math.max(0.001, seg[j]));
            path.push([pt[j][0] + (pt[j + 1][0] - pt[j][0]) * f, pt[j][1] + (pt[j + 1][1] - pt[j][1]) * f]);
            left -= seg[j];
          }
          const tip = path[path.length - 1];
          const prev = path.length > 1 ? path[path.length - 2] : pt[0];
          const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
          // 線：白色外框＋路線色（虛線會往前流動）
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          if (el.dash) {
            ctx.setLineDash([lw * 1.8, lw * 1.5]);
            ctx.lineDashOffset = -lt * 60 * u;
          }
          const stroke = (w: number, c: string) => {
            ctx.strokeStyle = c;
            ctx.lineWidth = w;
            ctx.beginPath();
            path.forEach(([a, b], j) => (j ? ctx.lineTo(a, b) : ctx.moveTo(a, b)));
            ctx.stroke();
          };
          stroke(lw + 8 * u, '#ffffff');
          stroke(lw, col);
          ctx.restore();
          // 箭頭
          const ah = lw * 2.7;
          const head = (s2: number, c: string) => {
            ctx.save();
            ctx.translate(tip[0], tip[1]);
            ctx.rotate(ang);
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.moveTo(ah * 0.35 * s2, 0);
            ctx.lineTo(-ah * 0.75 * s2, -ah * 0.55 * s2);
            ctx.lineTo(-ah * 0.75 * s2, ah * 0.55 * s2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          };
          head(1.28, '#ffffff');
          head(1, col);
          // 目的地標籤：箭頭到達後彈出，放在箭頭前方
          const lp = st - 0.75;
          if (lp > 0 && it[0]) {
            const sc2 = back(lp / 0.4);
            const fs = 46 * u;
            ctx.font = `900 ${fs}px ${FONT}`;
            const w = ctx.measureText(it[0]).width + fs * 1.2;
            const h = fs * 1.62;
            const ux = Math.cos(ang);
            const uy = Math.sin(ang);
            const edge = Math.min(Math.abs(ux) > 0.01 ? w / 2 / Math.abs(ux) : 1e9, Math.abs(uy) > 0.01 ? h / 2 / Math.abs(uy) : 1e9);
            const gap = ah * 0.6 + edge;
            const LX = DX + ux * gap;
            const LY = DY + uy * gap;
            ctx.save();
            ctx.translate(LX, LY);
            ctx.scale(sc2, sc2);
            pill(ctx, 0, 0, it[0], fs, col, isLight(col) ? '#1c1c1c' : '#ffffff');
            if (it[1]) pill(ctx, 0, h * 0.95, it[1], fs * 0.62, '#1c1c1c', '#ffffff', 0.88, 0.6);
            ctx.restore();
            xs.push(LX - w / 2, LX + w / 2);
            ys.push(LY - h / 2, LY + h * 1.5);
          }
        });
        // 起點：放在線的上面
        const e0 = back(clamp(lt / 0.4));
        ctx.save();
        ctx.globalAlpha *= clamp(lt / 0.12);
        if (lt > 0.4) {
          const pr = (lt % 1.6) / 1.6;
          ctx.save();
          ctx.globalAlpha *= (1 - pr) * 0.85;
          ctx.strokeStyle = base;
          ctx.lineWidth = 5 * u;
          ctx.beginPath();
          ctx.arc(X, Y, r0 * (1.3 + pr * 1.8), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(X, Y, r0 * 1.4 * e0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = base;
        ctx.beginPath();
        ctx.arc(X, Y, r0 * e0, 0, Math.PI * 2);
        ctx.fill();
        if (el.text) {
          const fs = 44 * u;
          ctx.translate(X, Y - r0 * 1.4 - fs * 1.15);
          ctx.scale(e0, e0);
          pill(ctx, 0, 0, el.text, fs, '#1c1c1c', '#ffffff', 0.9, 0.6);
          ys.push(Y - r0 * 1.4 - fs * 2);
        }
        ctx.restore();
        box = [Math.min(...xs) - r0, Math.min(...ys) - r0, Math.max(...xs) + r0, Math.max(...ys) + r0];
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
  const drawScene = (ctx: CanvasRenderingContext2D, W: number, H: number, sc: MScene, t: number, bg?: CanvasImageSource & { width: number; height: number }): Map<string, number[]> => {
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
  return { drawScene };
};

export const { drawScene } = mapRenderer();

// 讓特效的 run 透過全域取得繪製引擎（run 本身必須自給自足）
(globalThis as unknown as { MA_MAP: unknown }).MA_MAP = { drawScene };

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
        makeEl('tag', { role: 'tag', x: 0.04, y: 0.075, text: '區域｜案名', delay: 0 }),
        makeEl('text', { role: 'legend', x: 0.27, y: 0.135, text: '紅線：地籍界線', vertical: true, delay: 0.2, size: 0.62 }),
        makeEl('compass', { role: 'compass', x: 0.9, y: 0.12, delay: 0.2 }),
        makeEl('site', { role: 'site', pts: [[0.29, 0.38], [0.71, 0.39], [0.69, 0.5], [0.29, 0.49]], delay: 0.4 }),
        makeEl('label', { role: 'siteLabel', x: 0.5, y: 0.44, text: '某某 基地', delay: 1.2 }),
        makeEl('road', { role: 'road', x: 0.5, y: 0.375, text: '某某街', delay: 1.4 }),
        makeEl('road', { role: 'road', x: 0.5, y: 0.51, text: '某某路', delay: 1.5 }),
        makeEl('road', { role: 'road', x: 0.2, y: 0.44, text: '某某一路', vertical: true, delay: 1.6 }),
        makeEl('road', { role: 'road', x: 0.75, y: 0.45, text: '某某二路', vertical: true, delay: 1.7 }),
        makeEl('info', { role: 'info', y: 0.67, delay: 2 }),
        makeEl('text', { role: 'subtitle', x: 0.5, y: 0.82, text: '字幕放這裡', vertical: true, delay: 2.4 }),
        makeEl('text', { role: 'credit', x: 0.5, y: 0.88, text: '底圖：內政部國土測繪中心 正射影像', color: '#ffffffcc', vertical: false, size: 0.42, delay: 0 }),
        makeEl('text', { role: 'handle', x: 0.5, y: 0.92, text: '持家男子KC / @kch0263', vertical: true, size: 0.62, delay: 0 }),
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
        makeEl('tag', { role: 'tag', x: 0.03, y: 0.08, text: '案名｜區域 路名', delay: 0 }),
        makeEl('road', { role: 'road', x: 0.2, y: 0.26, text: '某某東路', variant: 'light', delay: 0.3 }),
        makeEl('road', { role: 'road', x: 0.73, y: 0.44, text: '某某路', variant: 'light', delay: 0.4 }),
        makeEl('site', { role: 'site', pts: [[0.5, 0.38], [0.69, 0.37], [0.63, 0.42], [0.5, 0.42]], color: '#f07a3f', alpha: 0.25, delay: 0.6 }),
        makeEl('pin', { role: 'pin', x: 0.58, y: 0.4, delay: 1.2 }),
        makeEl('label', { role: 'siteLabel', x: 0.35, y: 0.395, text: '基地範圍示意', color: '#f07a3f', fg: '#ffffff', size: 0.8, delay: 1.5 }),
        makeEl('stat', { role: 'stat', y: 0.6, delay: 1.9 }),
        makeEl('text', { role: 'subtitle', x: 0.5, y: 0.74, text: '字幕放這裡', vertical: true, delay: 2.4 }),
        makeEl('text', { role: 'credit', x: 0.5, y: 0.8, text: '底圖：內政部國土測繪中心 電子地圖', color: '#333333', vertical: false, size: 0.42, delay: 0 }),
      ],
    }),
  },
  {
    name: '放射路線',
    scene: () => ({
      ratio: '9:16',
      loop: 6,
      bgZoom: 1,
      bgX: 0.5,
      bgY: 0.5,
      bgDim: 0.1,
      els: [
        makeEl('tag', { role: 'tag', x: 0.04, y: 0.075, text: '交通｜開車到哪都方便', delay: 0 }),
        makeEl('compass', { role: 'compass', x: 0.9, y: 0.12, delay: 0.2 }),
        makeEl('routes', {
          role: 'routes',
          x: 0.42,
          y: 0.6,
          delay: 0.3,
          pts: [[0.8, 0.36], [0.62, 0.24], [0.2, 0.33]],
        }),
        makeEl('text', { role: 'subtitle', x: 0.5, y: 0.82, text: '字幕放這裡', vertical: true, delay: 2.4 }),
        makeEl('text', { role: 'credit', x: 0.5, y: 0.88, text: '底圖：請標示出處', color: '#ffffffcc', vertical: false, size: 0.42, delay: 0 }),
      ],
    }),
  },
  { name: '空白', scene: () => ({ ratio: '9:16', loop: 6, bgZoom: 1, bgX: 0.5, bgY: 0.5, bgDim: 0, els: [] }) },
];

export interface MapSceneInput {
  template?: 'aerial' | 'street' | 'routes' | 'blank';
  ratio?: MScene['ratio'];
  duration?: number;
  tag?: string;
  legend?: string;
  site_label?: string;
  site_color?: string;
  roads?: { text: string; x?: number; y?: number; vertical?: boolean; light?: boolean }[];
  info_lines?: string[];
  stat?: { title?: string; subtitle?: string; items?: string[] };
  subtitle?: string;
  credit?: string;
  handle?: string;
  bg_url?: string;
  bg_dim?: number;
  elements?: Partial<MEl>[];
  /** 放射路線：一個起點到多個目的地 */
  routes?: {
    origin?: string;
    x?: number;
    y?: number;
    destinations: { name: string; note?: string; color?: string; x?: number; y?: number }[];
    curve?: number;
    dash?: boolean;
    single_color?: string;
  };
}

/** 從範本與文字組出地圖場景（給 MCP 與 API 使用） */
export const buildMapScene = (a: MapSceneInput): MScene => {
  const tpl = TEMPLATES[{ aerial: 0, street: 1, routes: 2, blank: 3 }[a.template ?? 'aerial'] ?? 0];
  const sc = tpl.scene();
  if (a.ratio && a.ratio in RATIO_PX) sc.ratio = a.ratio;
  if (a.duration) sc.loop = Math.max(2, Math.min(20, a.duration));
  if (a.bg_url) sc.bgUrl = String(a.bg_url).slice(0, 2000);
  if (typeof a.bg_dim === 'number') sc.bgDim = Math.max(0, Math.min(0.7, a.bg_dim));
  const byRole = (r: string) => sc.els.filter((e) => e.role === r);
  const setText = (r: string, v: string | undefined) => {
    if (v === undefined) return;
    if (!v) sc.els = sc.els.filter((e) => e.role !== r);
    else byRole(r).forEach((e) => (e.text = v));
  };
  setText('tag', a.tag);
  setText('legend', a.legend);
  setText('siteLabel', a.site_label);
  setText('subtitle', a.subtitle);
  setText('credit', a.credit);
  setText('handle', a.handle);
  if (a.site_color) byRole('site').concat(byRole('siteLabel')).forEach((e) => (e.color = a.site_color));
  if (a.info_lines) {
    const info = byRole('info')[0] ?? (sc.els.push(makeEl('info', { role: 'info', delay: 2 })), byRole('info')[0]);
    info.lines = a.info_lines.slice(0, 6);
  }
  if (a.stat) {
    const st = byRole('stat')[0] ?? (sc.els.push(makeEl('stat', { role: 'stat', delay: 2 })), byRole('stat')[0]);
    if (a.stat.title !== undefined) st.text = a.stat.title;
    if (a.stat.subtitle !== undefined) st.fg = a.stat.subtitle;
    if (a.stat.items) st.lines = a.stat.items.slice(0, 4);
  }
  if (a.roads) {
    const old = byRole('road');
    const firstIdx = sc.els.findIndex((e) => e.role === 'road');
    sc.els = sc.els.filter((e) => e.role !== 'road');
    // 沒給位置時，依序放在基地的上、下、左、右
    const site = byRole('site')[0]?.pts ?? [[0.3, 0.38], [0.7, 0.38], [0.7, 0.5], [0.3, 0.5]];
    const xs = site.map((p) => p[0]);
    const ys = site.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const auto = [
      { x: (x0 + x1) / 2, y: y0 - 0.012, vertical: false },
      { x: (x0 + x1) / 2, y: y1 + 0.012, vertical: false },
      { x: x0 - 0.07, y: (y0 + y1) / 2, vertical: true },
      { x: x1 + 0.07, y: (y0 + y1) / 2, vertical: true },
    ];
    const made = a.roads.slice(0, 8).map((r, i) => {
      const pos = auto[i % 4];
      return makeEl('road', {
        role: 'road',
        text: r.text,
        x: r.x ?? pos.x,
        y: r.y ?? pos.y,
        vertical: r.vertical ?? pos.vertical,
        variant: r.light ?? old[0]?.variant === 'light' ? 'light' : 'dark',
        delay: 1.4 + i * 0.1,
      });
    });
    sc.els.splice(firstIdx >= 0 ? firstIdx : sc.els.length, 0, ...made);
  }
  if (a.routes?.destinations?.length) {
    let rt = byRole('routes')[0];
    if (!rt) {
      rt = makeEl('routes', { role: 'routes', delay: 0.3 });
      sc.els.push(rt);
    }
    const r = a.routes;
    if (r.origin !== undefined) rt.text = r.origin;
    if (typeof r.x === 'number') rt.x = r.x;
    if (typeof r.y === 'number') rt.y = r.y;
    if (typeof r.curve === 'number') rt.curve = Math.max(-0.5, Math.min(0.5, r.curve));
    if (typeof r.dash === 'boolean') rt.dash = r.dash;
    if (r.single_color) {
      rt.multi = false;
      rt.color = r.single_color;
    }
    const ds = r.destinations.slice(0, 6);
    rt.lines = ds.map((d) => [d.name, d.note ?? '', d.color ?? ''].join('|').replace(/\|+$/, ''));
    const keep = rt.pts ?? [];
    rt.pts = [];
    syncRoutes(rt);
    rt.pts = rt.pts!.map((p, i) => [ds[i].x ?? keep[i]?.[0] ?? p[0], ds[i].y ?? keep[i]?.[1] ?? p[1]]);
  }
  for (const e of a.elements ?? []) {
    if (!e.type || !(e.type in TYPE_NAME)) continue;
    sc.els.push(makeEl(e.type as MType, { ...e, id: undefined } as Partial<MEl>));
    sc.els[sc.els.length - 1].id = newId();
  }
  return sc;
};
