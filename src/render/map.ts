// mapkit.ts 的繪製引擎（自給自足，會被序列化進匯出的 HTML）。第一次用到才載入，主程式不打包。
import { fnSource } from '../engine';
import { registerEngine } from '../engines';
import { FONTS_GLOBALS } from '../fonts';
import type { MEl, MScene } from '../mapkit';

/** 繪製引擎工廠：內部完全自給自足，匯出 HTML 時以 toString() 內嵌 */
export const mapRenderer = () => {
  const FONT = '"MA Num", "Chiron Hei HK", "Noto Sans TC", "PingFang TC", sans-serif';
  /** 目前使用的字型；drawScene 每次依場景或呼叫端設定 */
  let F = FONT;
  const YELLOW = '#f2c14e';
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
  const back = (p: number) => {
    const q = clamp(p) - 1;
    return 1 + 2.6 * q * q * q + 1.6 * q * q;
  };

  /* ───────── 繪製工具 ───────── */
  const pill = (ctx: CanvasRenderingContext2D, cx: number, cy: number, text: string, fs: number, bg: string, fg: string, bgAlpha = 1, padX = 0.6, dot?: string) => {
    ctx.font = `900 ${fs}px ${F}`;
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
        ctx.font = `900 ${fs}px ${F}`;
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
        ctx.font = `900 ${fs}px ${F}`;
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
        ctx.font = `900 ${76 * u}px ${F}`;
        ctx.fillStyle = '#ffffff';
        const title = el.text ?? '';
        ctx.fillText(title, left, Y - h / 2 + 108 * u);
        const ttw = ctx.measureText(title).width;
        ctx.fillStyle = el.color ?? YELLOW;
        ctx.fillRect(left, Y - h / 2 + 122 * u, ttw * ease((lt - 0.3) / 0.5), 7 * u);
        ctx.font = `700 ${40 * u}px ${F}`;
        ctx.fillStyle = '#8fa7c4';
        ctx.fillText(el.fg ?? '', left + ttw + 36 * u, Y - h / 2 + 104 * u);
        const colW = (w - 96 * u) / n;
        items.forEach(([label, value, unit, note], i) => {
          const cx = left + colW * i;
          const ip = clamp((lt - 0.35 - i * 0.12) / 1);
          ctx.font = `700 ${38 * u}px ${F}`;
          ctx.fillStyle = '#8fa7c4';
          ctx.fillText(label ?? '', cx, Y - h / 2 + 205 * u);
          ctx.font = `900 ${100 * u}px ${F}`;
          ctx.fillStyle = el.color ?? YELLOW;
          const v = countText(value ?? '', ip);
          ctx.fillText(v, cx, Y - h / 2 + 310 * u);
          const vw = ctx.measureText(v).width;
          ctx.font = `700 ${40 * u}px ${F}`;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(unit ?? '', cx + vw + 8 * u, Y - h / 2 + 310 * u);
          if (note) {
            ctx.font = `700 ${34 * u}px ${F}`;
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
        ctx.font = `900 ${30 * u}px ${F}`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N', r * 0.95, -r * 0.95);
        box = [X - r, Y - r * 1.4, X + r * 1.4, Y + r];
        break;
      }
      case 'badge': {
        const s = back(p);
        const r = 52 * u;
        ctx.globalAlpha *= clamp(lt / 0.12);
        ctx.translate(X, Y);
        ctx.scale(s, s);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r + 6 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = el.color ?? '#f07a3f';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        const txt = el.text ?? '';
        let fs = 40 * u;
        ctx.font = `900 ${fs}px ${F}`;
        const tw = ctx.measureText(txt).width;
        if (tw > r * 1.6) fs *= (r * 1.6) / tw;
        ctx.font = `900 ${fs}px ${F}`;
        ctx.fillStyle = el.fg ?? '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(txt, 0, fs * 0.04);
        box = [X - r - 6 * u, Y - r - 6 * u, X + r + 6 * u, Y + r + 6 * u];
        break;
      }
      case 'bar': {
        // 資訊條：| 分欄，* 開頭用強調色
        const cells = (el.text ?? '').split('|').map((c) => c.trim());
        const w = Math.min(W * 0.9, 900 * u);
        const h = 104 * u;
        const e = ease(p);
        ctx.globalAlpha *= e;
        ctx.translate(0, (1 - e) * 40 * u);
        ctx.save();
        ctx.globalAlpha *= el.alpha ?? 0.82;
        ctx.fillStyle = '#1c1c1c';
        ctx.beginPath();
        ctx.roundRect(X - w / 2, Y - h / 2, w, h, 22 * u);
        ctx.fill();
        ctx.restore();
        const cw = w / Math.max(1, cells.length);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        cells.forEach((c, i) => {
          const ce = ease((lt - 0.15 - i * 0.15) / 0.4);
          const cx = X - w / 2 + cw * (i + 0.5);
          if (i > 0) {
            ctx.fillStyle = '#ffffff80';
            ctx.fillRect(X - w / 2 + cw * i - 1.5 * u, Y - h * 0.24, 3 * u, h * 0.48);
          }
          ctx.save();
          ctx.globalAlpha *= ce;
          const txt = c.replace(/^\*/, '');
          let fs = 54 * u;
          ctx.font = `900 ${fs}px ${F}`;
          const tw = ctx.measureText(txt).width;
          if (tw > cw * 0.86) fs *= (cw * 0.86) / tw;
          ctx.font = `900 ${fs}px ${F}`;
          ctx.fillStyle = c.startsWith('*') ? (el.color ?? '#f07a3f') : '#ffffff';
          ctx.fillText(txt, cx, Y + (1 - ce) * 10 * u + fs * 0.04);
          ctx.restore();
        });
        box = [X - w / 2, Y - h / 2, X + w / 2, Y + h / 2];
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
            ctx.font = `900 ${fs}px ${F}`;
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
        ctx.font = `900 ${fs}px ${F}`;
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
  /* ───────── 太空降落開場 ───────── */
  // 地球上的陸地（以圓盤座標 -1～1 表示，示意用）；台灣放在 TW，鏡頭對準它降落
  // 經緯度轉成圓盤座標（台灣附近放大比例，示意用）
  const geo = (lon: number, lat: number) => [0.16 + (lon - 121) * 0.03, -0.02 - (lat - 23.6) * 0.03];
  // 鏡頭降落點：北台灣
  const TW = geo(121.35, 24.95);
  const LAND: number[][][] = [
    [[-1, -0.55], [-0.55, -0.75], [-0.1, -0.7], [0.05, -0.45], [0.02, -0.25], [0.08, -0.12], [-0.02, 0.05], [-0.12, 0.2], [-0.32, 0.32], [-0.55, 0.38], [-0.7, 0.62], [-1, 0.7]],
    [[0.32, -0.58], [0.42, -0.62], [0.48, -0.45], [0.38, -0.32], [0.3, -0.38]],
    [[0.5, -0.4], [0.6, -0.5], [0.66, -0.36], [0.55, -0.24], [0.46, -0.28]],
    [[0.16, 0.22], [0.24, 0.2], [0.27, 0.36], [0.22, 0.5], [0.15, 0.42], [0.13, 0.3]],
    [[-0.35, 0.55], [-0.15, 0.5], [0.05, 0.62], [-0.05, 0.75], [-0.3, 0.72]],
  ];
  const TAIWAN = [
    [121.52, 25.3], [121.75, 25.15], [122.0, 25.0], [121.85, 24.65], [121.78, 24.3], [121.6, 23.9], [121.48, 23.35], [121.3, 22.9], [120.95, 22.35], [120.85, 21.9],
    [120.72, 22.1], [120.6, 22.35], [120.3, 22.55], [120.15, 22.95], [120.1, 23.4], [120.18, 23.8], [120.45, 24.3], [120.75, 24.7], [121.05, 25.05],
  ].map(([lon, lat]) => geo(lon, lat));
  const stars = Array.from({ length: 140 }, (_, i) => {
    const r = (k: number) => {
      const x = Math.sin((i * 7 + k) * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    return [r(1), r(2), 0.6 + r(3) * 1.6, 0.35 + r(4) * 0.65];
  });
  const drawDescend = (ctx: CanvasRenderingContext2D, W: number, H: number, sc: MScene, p: number, bg?: CanvasImageSource & { width: number; height: number }) => {
    const S = Math.min(W, H);
    const u = S / 1080;
    ctx.fillStyle = '#05070d';
    ctx.fillRect(0, 0, W, H);
    stars.forEach(([x, y, r, a]) => {
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(x * W, y * H, r * u * 2, r * u * 2);
    });
    // 0–0.2：從遠處接近地球；0.2–1：鏡頭對準台灣往下降（對數縮放，速度先快後慢）
    const s0 = 0.012;
    const q = clamp((p - 0.2) / 0.8);
    const k = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
    const s = Math.exp(Math.log(s0) * (1 - k));
    const approach = ease(p / 0.2);
    const Rg = q > 0 ? S * 0.32 * (s / s0) : S * (0.12 + 0.2 * approach);
    const cx = W / 2 - TW[0] * Rg;
    const cy = H / 2 - TW[1] * Rg;
    const gAlpha = 1 - clamp((s - 0.35) / 0.4);
    if (gAlpha > 0) {
      ctx.save();
      ctx.globalAlpha *= gAlpha;
      ctx.beginPath();
      ctx.arc(cx, cy, Rg, 0, Math.PI * 2);
      ctx.fillStyle = '#1f4f7a';
      ctx.fill();
      ctx.clip();
      const poly = (pts: number[][], fill: string) => {
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x * Rg, cy + y * Rg) : ctx.moveTo(cx + x * Rg, cy + y * Rg)));
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
      };
      LAND.forEach((l) => poly(l, '#5f8a52'));
      poly(TAIWAN, '#7fae5e');
      // 晨昏線：右下半邊較暗（實色，不用漸層模糊）
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.arc(cx + Rg * 0.35, cy + Rg * 0.35, Rg * 1.05, 0, Math.PI * 2);
      ctx.arc(cx - Rg * 0.2, cy - Rg * 0.2, Rg * 1.1, 0, Math.PI * 2, true);
      ctx.fill('evenodd');
      ctx.restore();
      // 目標圈
      if (p < 0.45) {
        const a = 1 - clamp((p - 0.3) / 0.15);
        ctx.save();
        ctx.globalAlpha *= a * ease(p / 0.15);
        ctx.strokeStyle = '#ff7a3d';
        ctx.lineWidth = 4 * u;
        const pr = (p * 3) % 1;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 18 * u + pr * 40 * u, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    // 底圖從台灣的位置長出來，到 s＝1 時與正常畫面完全重合
    const a2 = clamp((s - 0.03) / 0.08);
    if (a2 > 0) {
      ctx.save();
      ctx.globalAlpha *= a2;
      ctx.translate(W / 2, H / 2);
      ctx.scale(s, s);
      ctx.translate(-W / 2, -H / 2);
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.clip();
      if (bg) drawBg(ctx, W, H, sc, bg);
      else {
        // 沒有底圖時挖空，露出下層的示意地圖
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
      if (s < 0.98) {
        ctx.save();
        ctx.globalAlpha *= a2 * (1 - clamp((s - 0.6) / 0.38));
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3 * u;
        ctx.strokeRect(W / 2 - (W * s) / 2, H / 2 - (H * s) / 2, W * s, H * s);
        ctx.restore();
      }
    }
  };
  const drawBg = (ctx: CanvasRenderingContext2D, W: number, H: number, sc: MScene, bg: CanvasImageSource & { width: number; height: number }) => {
    const s = Math.max(W / bg.width, H / bg.height) * sc.bgZoom;
    const dw = bg.width * s;
    const dh = bg.height * s;
    ctx.drawImage(bg, (W - dw) * sc.bgX, (H - dh) * sc.bgY, dw, dh);
    if (sc.bgDim > 0) {
      ctx.fillStyle = `rgba(0,0,0,${sc.bgDim})`;
      ctx.fillRect(0, 0, W, H);
    }
  };

  const drawScene = (ctx: CanvasRenderingContext2D, W: number, H: number, sc: MScene, t: number, bg?: CanvasImageSource & { width: number; height: number }, font?: string): Map<string, number[]> => {
    // 場景指定的字型組合優先，其次是呼叫端（特效根節點的 --sans）
    F = ((globalThis as unknown as { MA_FONTS?: Record<string, string> }).MA_FONTS ?? {})[sc.font ?? ''] || font || FONT;
    ctx.clearRect(0, 0, W, H);
    const D = sc.descend || 0;
    if (D > 0 && t < D) drawDescend(ctx, W, H, sc, t / D, bg);
    else if (bg) drawBg(ctx, W, H, sc, bg);
    const boxes = new Map<string, number[]>();
    for (const el of sc.els) boxes.set(el.id, drawEl(ctx, W, H, el, t - D));
    return boxes;
  };

  /** 範本：照兩種常用畫面配置 */
  return { drawScene };
};

export const { drawScene } = mapRenderer();
(globalThis as unknown as { MA_MAP: unknown }).MA_MAP = { drawScene };

export const MAP_GLOBALS = `${FONTS_GLOBALS}window.MA_MAP=${fnSource(mapRenderer)}();`;
registerEngine('map', MAP_GLOBALS);
