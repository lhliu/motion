// chart.ts 的繪製引擎（自給自足，會被序列化進匯出的 HTML）。第一次用到才載入，主程式不打包。
import { fnSource } from '../engine';
import { registerEngine } from '../engines';


export const chartRenderer = () => {
  type Row = { label: string; v: number[]; raw: string };
  type Data = { title: string; sub: string; series: string[]; unit: string; max: number; colors: string[]; rows: Row[]; quad: string[]; badge: string; board: boolean; lines: string[]; opt: Record<string, string> };
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
  const back = (p: number) => {
    const q = clamp(p) - 1;
    return 1 + 2.2 * q * q * q + 1.2 * q * q;
  };
  const FONT = '"MA Num", "Chiron Hei HK", "Noto Sans TC", "PingFang TC", sans-serif';
  const hex = (c: string) => {
    const h = c.replace('#', '');
    const f = h.length === 3 ? h.split('').map((x) => x + x).join('') : h.slice(0, 6);
    const n = parseInt(f, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const mix = (a: string, b: string, k: number) => {
    if (!/^#/.test(a) || !/^#/.test(b)) return a;
    const A = hex(a);
    const B = hex(b);
    return `rgb(${A.map((x, i) => Math.round(x + (B[i] - x) * k)).join(',')})`;
  };
  const lum = (c: string) => {
    if (!/^#/.test(c)) return 128;
    const [r, g, b] = hex(c);
    return r * 0.299 + g * 0.587 + b * 0.114;
  };

  const parse = (w: string[]): Data => {
    const d: Data = { title: '', sub: '', series: [], unit: '', max: NaN, colors: [], rows: [], quad: [], badge: '', board: false, lines: [], opt: {} };
    let gotTitle = false;
    for (const raw of w) {
      const s = String(raw || '').trim();
      if (!s) continue;
      if (s.startsWith('@')) {
        const [k, ...v] = s.slice(1).split(/\s+/);
        const val = v.join(' ');
        d.opt[k] = val.trim();
        if (k === 'series') d.series = val.split(/[,，、]/).map((x) => x.trim()).filter(Boolean);
        else if (k === 'unit') d.unit = val;
        else if (k === 'max') d.max = parseFloat(val);
        else if (k === 'quad') d.quad = val.split(/[,，、]/).map((x) => x.trim());
        else if (k === 'badge') d.badge = val.trim();
        else if (k === 'board') d.board = true;
        else if (k === 'colors') d.colors = val.split(/[,\s]+/).filter((x) => /^#[0-9a-f]{3,8}$/i.test(x));
        continue;
      }
      if (s.startsWith('~')) {
        d.sub = s.slice(1).trim();
        continue;
      }
      if (gotTitle) d.lines.push(s);
      const m = s.match(/^(.*?)[\s:：]+([-+=]?[\d.,，/+\-\s]*\d[\d.]*%?|=)$/);
      if (m && m[1].trim()) {
        const vals = m[2].trim() === '=' ? [NaN] : m[2].replace(/，/g, ',').split(/[,/]/).map((x) => parseFloat(x.replace(/[+\s%]/g, '')));
        d.rows.push({ label: m[1].trim(), v: vals, raw: m[2].trim() });
        continue;
      }
      if (!gotTitle) {
        d.title = s;
        gotTitle = true;
      }
    }
    return d;
  };

  const fmt = (v: number, unit = '') => {
    if (!Number.isFinite(v)) return '';
    const a = Math.abs(v);
    const s = a >= 1000 ? Math.round(v).toLocaleString('en-US') : a >= 100 || Number.isInteger(v) ? String(Math.round(v)) : v.toFixed(a < 10 ? 1 : 1).replace(/\.0$/, '');
    return unit === '%' ? `${s}%` : s;
  };
  const niceMax = (v: number) => {
    if (!(v > 0)) return 1;
    const step = nice(v / 4.5);
    return Math.ceil(v / step) * step;
  };
  /** 數字跳動時：整數就跳整數，小數保留一位 */
  const cnt = (v: number, k: number) => (Number.isInteger(v) ? Math.round(v * k) : Math.round(v * k * 10) / 10);
  const nice = (v: number) => {
    if (!(v > 0)) return 1;
    const e = Math.pow(10, Math.floor(Math.log10(v)));
    const f = v / e;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
  };

  /** 畫一格；回傳動畫長度（秒） */
  const draw = (ctx: CanvasRenderingContext2D, W: number, H: number, kind: string, d: Data, t: number, opt: { fg?: string; bg?: string; ac?: string; ac2?: string; font?: string } = {}) => {
    const F = opt.font || FONT;
    const fg = opt.fg || '#f4f1ea';
    const bg = opt.bg || '#16181d';
    const S = Math.min(W, H);
    const pal = d.colors.length ? d.colors : [opt.ac || '#ff6b35', opt.ac2 || '#ffd23f', '#4cc9f0', '#7bd389', '#c084fc', '#ff8fab', '#f4a261', '#90a4ff'];
    const col = (i: number) => pal[((i % pal.length) + pal.length) % pal.length];
    const mu = mix(fg, bg, 0.82);
    const mu2 = mix(fg, bg, 0.55);
    ctx.clearRect(0, 0, W, H);
    ctx.lineJoin = 'round';
    // 標題
    const tIn = ease(t / 0.5);
    let top = H * 0.06;
    const fsT = S * 0.068;
    if (d.title) {
      ctx.globalAlpha = tIn;
      ctx.fillStyle = fg;
      ctx.font = `900 ${fsT}px ${F}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(d.title, W * 0.07, top + (1 - tIn) * fsT * 0.4, W * 0.86);
      top += fsT * 1.3;
    }
    if (d.sub) {
      const fs2 = S * 0.032;
      ctx.globalAlpha = tIn * 0.7;
      ctx.fillStyle = fg;
      ctx.font = `700 ${fs2}px ${F}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(d.sub, W * 0.07, top, W * 0.86);
      top += fs2 * 1.8;
    }
    ctx.globalAlpha = 1;
    const rows = d.rows.slice(0, 24);
    const n = rows.length;
    const m = Math.max(1, ...rows.map((r) => r.v.filter(Number.isFinite).length), d.series.length);
    const fsL = S * 0.03;
    const fsV = S * 0.034;
    const unit = d.unit;
    const txt = (s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', base: CanvasTextBaseline = 'middle', weight = 700, maxW?: number) => {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size}px ${F}`;
      ctx.textAlign = align;
      ctx.textBaseline = base;
      ctx.fillText(s, x, y, maxW);
    };
    // 圖例
    let legendH = 0;
    if (d.series.length > 1 && !['pie', 'donut', 'rings', 'treemap', 'sunburst', 'funnel', 'picto', 'gauge', 'waterfall', 'scatter', 'bubble', 'box'].includes(kind)) {
      const fs = S * 0.028;
      ctx.font = `700 ${fs}px ${F}`;
      let x = W * 0.07;
      d.series.forEach((s, i) => {
        ctx.globalAlpha = tIn;
        ctx.fillStyle = col(i);
        ctx.fillRect(x, top + fs * 0.15, fs * 0.9, fs * 0.9);
        txt(s, x + fs * 1.3, top + fs * 0.6, fs, fg, 'left');
        x += ctx.measureText(s).width + fs * 2.6;
      });
      ctx.globalAlpha = 1;
      legendH = fs * 1.9;
    }
    top += legendH;
    // 繪圖區
    const px0 = W * 0.12;
    const px1 = W * 0.94;
    const py0 = top + H * 0.04;
    const py1 = H * 0.86;
    const pw = px1 - px0;
    const ph = py1 - py0;
    const G = 0.6; // 開始長圖的時間
    const allV = rows.flatMap((r) => r.v.filter(Number.isFinite));
    const grid = (max: number, min = 0, right = false, n0 = 0) => {
      const steps = n0 || Math.max(2, Math.round((max - min) / nice((max - min) / 4.5)));
      for (let i = 0; i <= steps; i++) {
        const v = min + ((max - min) * i) / steps;
        const y = py1 - (ph * i) / steps;
        ctx.globalAlpha = tIn;
        ctx.fillStyle = i === 0 && min === 0 ? mu2 : mu;
        ctx.fillRect(px0, y - S * 0.0012, pw, S * 0.0024);
        if (!right) txt(fmt(v, unit), px0 - S * 0.015, y, fsL * 0.9, mu2, 'right');
      }
      ctx.globalAlpha = 1;
    };
    const yOf = (v: number, max: number, min = 0) => py1 - ((v - min) / (max - min || 1)) * ph;
    let L = 6;

    if (kind === 'column' || kind === 'stack' || kind === 'combo') {
      const stack = kind === 'stack';
      const sums = rows.map((r) => r.v.reduce((a, b) => a + (Number.isFinite(b) ? Math.max(0, b) : 0), 0));
      const barVals = kind === 'combo' ? rows.map((r) => r.v[0] || 0) : allV;
      const max = Number.isFinite(d.max) ? d.max : niceMax(Math.max(...(stack ? sums : barVals), 1) * 1.08);
      grid(max);
      const gw = pw / Math.max(1, n);
      const series = kind === 'combo' ? 1 : stack ? 1 : m;
      const bw = (gw * 0.66) / series;
      rows.forEach((r, i) => {
        const gx = px0 + gw * i + gw * 0.17;
        let acc = 0;
        const vals = kind === 'combo' ? [r.v[0]] : r.v;
        vals.forEach((v, j) => {
          if (!Number.isFinite(v)) return;
          const k = back((t - G - i * 0.1 - j * 0.06) / 0.55);
          if (k <= 0) return;
          const h = (v / max) * ph * k;
          const x = stack ? gx : gx + bw * j;
          const y0 = yOf(acc, max);
          ctx.fillStyle = col(j);
          ctx.fillRect(x, y0 - h, bw * (stack ? 1 : 0.92), h);
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.fillRect(x, y0 - h, bw * (stack ? 1 : 0.92) * 0.28, h);
          if (stack) acc += v;
          const vk = ease((t - G - i * 0.1 - j * 0.06 - 0.35) / 0.4);
          if (vk > 0 && (!stack || h > fsV * 1.4)) {
            ctx.globalAlpha = vk;
            if (stack) txt(fmt(cnt(v, vk), unit), x + bw / 2, y0 - h / 2, fsL, lum(col(j)) > 150 ? '#1d2433' : '#ffffff', 'center', 'middle', 900);
            else txt(fmt(cnt(v, vk), unit), x + (bw * 0.92) / 2, y0 - h - fsV * 0.7, series > 2 ? fsL * 0.8 : fsV, fg, 'center', 'middle', 900);
            ctx.globalAlpha = 1;
          }
        });
        if (stack) {
          const vk = ease((t - G - i * 0.1 - 0.6) / 0.4);
          if (vk > 0) {
            ctx.globalAlpha = vk;
            txt(fmt(cnt(sums[i], vk), unit), gx + bw / 2, yOf(sums[i], max) - fsV * 0.8, fsV, fg, 'center', 'middle', 900);
            ctx.globalAlpha = 1;
          }
        }
        ctx.globalAlpha = tIn;
        txt(r.label, px0 + gw * (i + 0.5), py1 + fsL * 1.1, fsL, mu2, 'center', 'middle', 700, gw * 0.98);
        ctx.globalAlpha = 1;
      });
      if (kind === 'combo') {
        // 第二個系列畫成折線，用右側刻度
        const v2 = rows.map((r) => r.v[1]);
        const max2 = niceMax(Math.max(...v2.filter(Number.isFinite), 1) * 1.1);
        const pts = rows.map((r, i) => [px0 + gw * (i + 0.5), yOf(r.v[1], max2)]);
        const p = ease((t - G - 0.6) / 1.4);
        ctx.strokeStyle = col(1);
        ctx.lineWidth = S * 0.008;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, px0 + pw * p, H);
        ctx.clip();
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        ctx.restore();
        pts.forEach(([x, y], i) => {
          const k = back((t - G - 0.6 - 1.4 * ((x - px0) / pw)) / 0.3);
          if (k <= 0) return;
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.arc(x, y, S * 0.011 * k, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = col(1);
          ctx.lineWidth = S * 0.006;
          ctx.stroke();
          ctx.globalAlpha = ease((t - G - 0.9 - 1.4 * ((x - px0) / pw)) / 0.3);
          txt(fmt(rows[i].v[1]), x, y - fsV * 0.9, fsL, col(1), 'center', 'middle', 900);
          ctx.globalAlpha = 1;
        });
        for (let i = 0; i <= 4; i++) {
          ctx.globalAlpha = tIn;
          txt(fmt((max2 * i) / 4), px1 + S * 0.012, py1 - (ph * i) / 4, fsL * 0.85, col(1), 'left');
        }
        ctx.globalAlpha = 1;
      }
      L = G + n * 0.1 + 2.8;
    } else if (kind === 'bar' || kind === 'rank') {
      const list = kind === 'rank' ? [...rows].sort((a, b) => (b.v[0] || 0) - (a.v[0] || 0)) : rows;
      const max = Number.isFinite(d.max) ? d.max : Math.max(...list.map((r) => r.v[0] || 0), 1);
      const lx = kind === 'rank' ? W * 0.07 + S * 0.07 : W * 0.07;
      ctx.font = `700 ${fsL}px ${F}`;
      const labW = Math.min(W * 0.32, Math.max(...list.map((r) => ctx.measureText(r.label).width)) + fsL);
      const bx = lx + labW;
      const bwMax = W * 0.93 - bx - fsV * 3.2;
      const rh = Math.min((py1 - py0) / Math.max(1, list.length), S * 0.13);
      const oy = Math.max(0, (py1 - py0 - rh * list.length) * 0.4);
      list.forEach((r, i) => {
        const y = py0 + oy + rh * i;
        const k = back((t - G - i * 0.12) / 0.6);
        const v = r.v[0] || 0;
        const c = kind === 'rank' ? (i === 0 ? col(0) : i < 3 ? col(1) : mu2) : col(0);
        ctx.globalAlpha = ease((t - G - i * 0.12) / 0.3);
        if (kind === 'rank') {
          ctx.fillStyle = i < 3 ? col(i === 0 ? 0 : 1) : mu;
          ctx.beginPath();
          ctx.arc(W * 0.07 + rh * 0.3, y + rh * 0.42, rh * 0.3, 0, Math.PI * 2);
          ctx.fill();
          txt(String(i + 1), W * 0.07 + rh * 0.3, y + rh * 0.44, rh * 0.34, i < 3 && lum(col(i === 0 ? 0 : 1)) > 150 ? '#1d2433' : fg, 'center', 'middle', 900);
        }
        txt(r.label, bx - fsL * 0.6, y + rh * 0.42, fsL, fg, 'right', 'middle', 700, labW);
        ctx.globalAlpha = 1;
        if (k <= 0) return;
        const bw = (v / max) * bwMax * k;
        ctx.fillStyle = c;
        ctx.fillRect(bx, y + rh * 0.16, bw, rh * 0.52);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(bx, y + rh * 0.16, bw, rh * 0.14);
        txt(fmt(cnt(v, ease((t - G - i * 0.12) / 0.6)), unit), bx + bw + fsV * 0.4, y + rh * 0.42, fsV, fg, 'left', 'middle', 900);
      });
      L = G + list.length * 0.12 + 2.8;
    } else if (kind === 'waterfall') {
      let run = 0;
      const steps = rows.map((r) => {
        const total = r.raw === '=' || !Number.isFinite(r.v[0]);
        const start = total ? 0 : run;
        if (!total) run += r.v[0];
        return { label: r.label, start, end: total ? run : run, total, v: total ? run : r.v[0] };
      });
      const lo = Math.min(0, ...steps.map((s) => Math.min(s.start, s.end)));
      const hi = niceMax(Math.max(...steps.map((s) => Math.max(s.start, s.end)), 1) * 1.08);
      grid(hi, lo < 0 ? -nice(-lo) : 0);
      const min = lo < 0 ? -nice(-lo) : 0;
      const gw = pw / Math.max(1, n);
      steps.forEach((s, i) => {
        const k = ease((t - G - i * 0.28) / 0.45);
        const x = px0 + gw * i + gw * 0.16;
        const bw = gw * 0.68;
        const y0 = yOf(s.start, hi, min);
        const y1 = yOf(s.end, hi, min);
        const c = s.total ? mu2 : s.v >= 0 ? col(0) : '#e5484d';
        if (k > 0) {
          const yy = y0 + (y1 - y0) * k;
          ctx.fillStyle = c;
          ctx.fillRect(x, Math.min(y0, yy), bw, Math.max(S * 0.003, Math.abs(yy - y0)));
          ctx.globalAlpha = ease((t - G - i * 0.28 - 0.3) / 0.3);
          txt((s.total ? '' : s.v >= 0 ? '+' : '') + fmt(s.v, unit), x + bw / 2, Math.min(y0, y1) - fsV * 0.75, fsV, s.total ? fg : c, 'center', 'middle', 900);
          ctx.globalAlpha = 1;
          // 連接線
          if (i < steps.length - 1 && k >= 1) {
            ctx.fillStyle = mu2;
            ctx.fillRect(x + bw, y1 - S * 0.001, gw * 0.32, S * 0.002);
          }
        }
        ctx.globalAlpha = tIn;
        txt(s.label, x + bw / 2, py1 + fsL * 1.1, fsL, mu2, 'center', 'middle', 700, gw);
        ctx.globalAlpha = 1;
      });
      L = G + n * 0.28 + 2.6;
    } else if (kind === 'line' || kind === 'area') {
      const max = Number.isFinite(d.max) ? d.max : niceMax(Math.max(...allV, 1) * 1.06);
      const min0 = Math.min(...allV);
      const stp = nice(max / 4.5);
      const min = min0 < 0 ? -niceMax(-min0) : min0 > max * 0.45 ? Math.floor((min0 * 0.92) / stp) * stp : 0;
      grid(max, min, false, Math.max(2, Math.round((max - min) / stp)));
      const gx = (i: number) => px0 + (n === 1 ? pw / 2 : (pw * i) / (n - 1));
      const dur = 1.6;
      const p = ease((t - G) / dur);
      const step = Math.max(1, Math.ceil(n / 8));
      rows.forEach((r, i) => {
        if (i % step && i !== n - 1) return;
        ctx.globalAlpha = tIn;
        txt(r.label, gx(i), py1 + fsL * 1.1, fsL, mu2);
        ctx.globalAlpha = 1;
      });
      for (let j = 0; j < m; j++) {
        const pts = rows.map((r, i) => [gx(i), yOf(r.v[j], max, min)]).filter(([, y]) => Number.isFinite(y));
        if (!pts.length) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, px0 + pw * ease((t - G - j * 0.3) / dur) + S * 0.01, H);
        ctx.clip();
        if (kind === 'area') {
          ctx.globalAlpha = 0.32;
          ctx.fillStyle = col(j);
          ctx.beginPath();
          ctx.moveTo(pts[0][0], py1);
          pts.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.lineTo(pts[pts.length - 1][0], py1);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.strokeStyle = col(j);
        ctx.lineWidth = S * 0.008;
        ctx.lineCap = 'round';
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        ctx.restore();
        pts.forEach(([x, y], i) => {
          const tr = G + j * 0.3 + dur * ((x - px0) / pw);
          const k = back((t - tr) / 0.3);
          if (k <= 0) return;
          const last = i === pts.length - 1;
          ctx.fillStyle = last ? col(j) : bg;
          ctx.strokeStyle = col(j);
          ctx.lineWidth = S * 0.006;
          ctx.beginPath();
          ctx.arc(x, y, S * (last ? 0.016 : 0.009) * k, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (last || n <= 8) {
            ctx.globalAlpha = ease((t - tr - 0.2) / 0.3);
            txt(fmt(rows[i].v[j], unit), x, y - fsV * (last ? 1.2 : 0.95), last ? fsV * 1.25 : fsL, last ? col(j) : fg, 'center', 'middle', 900);
            ctx.globalAlpha = 1;
          }
        });
      }
      if (d.badge && n) {
        const j = 0;
        const lx = gx(n - 1);
        const ly = yOf(rows[n - 1].v[j], max, min);
        const kb = back((t - G - dur - 0.35) / 0.45);
        if (kb > 0) {
          const fs = fsV * 1.15;
          ctx.font = `900 ${fs}px ${F}`;
          const bw = ctx.measureText(d.badge).width + fs * 1.1;
          const bh = fs * 1.7;
          const bx = Math.min(lx - bw * 0.5, px1 + W * 0.05 - bw);
          const by = Math.max(py0 - bh * 0.3, ly - fsV * 2.4 - bh * 1.3);
          ctx.save();
          ctx.translate(bx + bw / 2, by + bh / 2);
          ctx.scale(kb, kb);
          ctx.rotate(-0.05);
          ctx.fillStyle = col(1);
          ctx.beginPath();
          (ctx.roundRect ? ctx.roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2) : ctx.rect(-bw / 2, -bh / 2, bw, bh));
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-fs * 0.3, bh / 2 - 1);
          ctx.lineTo(fs * 0.3, bh / 2 - 1);
          ctx.lineTo(0, bh / 2 + fs * 0.45);
          ctx.closePath();
          ctx.fill();
          txt(d.badge, 0, 0, fs, lum(col(1)) > 150 ? '#1d2433' : '#ffffff', 'center', 'middle', 900);
          ctx.restore();
        }
      }
      L = G + dur + m * 0.3 + 3;
    } else if (kind === 'pie' || kind === 'donut') {
      const vals = rows.map((r) => Math.max(0, r.v[0] || 0));
      const sum = vals.reduce((a, b) => a + b, 0) || 1;
      const cx = W / 2;
      const cy = py0 + ph * 0.42;
      const R = Math.min(pw * 0.36, ph * 0.36);
      const p = ease((t - G) / 1.3);
      let a0 = -Math.PI / 2;
      const big = vals.indexOf(Math.max(...vals));
      vals.forEach((v, i) => {
        const a = (v / sum) * Math.PI * 2;
        const end = Math.min(a0 + a, -Math.PI / 2 + Math.PI * 2 * p);
        if (end > a0) {
          const mid = a0 + a / 2;
          const off = i === big ? R * 0.05 * ease((t - G - 1.3) / 0.4) : 0;
          ctx.fillStyle = col(i);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(mid) * off, cy + Math.sin(mid) * off);
          ctx.arc(cx + Math.cos(mid) * off, cy + Math.sin(mid) * off, R, a0, end);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = bg;
          ctx.lineWidth = S * 0.006;
          ctx.stroke();
          // 標籤：百分比在扇形上，名稱在外側
          const lk = ease((t - G - 1.2 - i * 0.08) / 0.4);
          if (lk > 0) {
            ctx.globalAlpha = lk;
            const pr = kind === 'donut' ? R * 0.8 : R * 0.64;
            if (a > 0.25) txt(`${Math.round((v / sum) * 100)}%`, cx + Math.cos(mid) * (pr + off), cy + Math.sin(mid) * (pr + off), fsV, lum(col(i)) > 150 ? '#1d2433' : '#ffffff', 'center', 'middle', 900);
            const ox = cx + Math.cos(mid) * R * 1.18;
            const oy = cy + Math.sin(mid) * R * 1.18;
            txt(rows[i].label, ox, oy, fsL, fg, Math.cos(mid) > 0.2 ? 'left' : Math.cos(mid) < -0.2 ? 'right' : 'center');
            ctx.globalAlpha = 1;
          }
        }
        a0 += a;
      });
      if (kind === 'donut') {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.58, 0, Math.PI * 2);
        ctx.fill();
        const k = ease((t - G) / 1.3);
        txt(fmt(cnt(sum, k), unit), cx, cy - fsV * 0.3, S * 0.07, fg, 'center', 'middle', 900);
        txt(d.series[0] || '合計', cx, cy + S * 0.045, fsL, mu2);
      }
      // 圖例列在下方
      const lg = py0 + ph * 0.42 + R * 1.45;
      const cols = Math.min(3, n);
      rows.forEach((r, i) => {
        const k = ease((t - G - 1.4 - i * 0.06) / 0.4);
        if (k <= 0) return;
        ctx.globalAlpha = k;
        const cxi = W * 0.1 + ((W * 0.8) / cols) * (i % cols);
        const cyi = lg + Math.floor(i / cols) * fsL * 1.8;
        ctx.fillStyle = col(i);
        ctx.fillRect(cxi, cyi - fsL * 0.45, fsL * 0.9, fsL * 0.9);
        txt(`${r.label} ${fmt(vals[i], unit)}`, cxi + fsL * 1.3, cyi, fsL, fg, 'left', 'middle', 700, (W * 0.8) / cols - fsL * 1.6);
        ctx.globalAlpha = 1;
      });
      L = G + 1.3 + n * 0.08 + 2.6;
    } else if (kind === 'gauge' && d.board && n > 1) {
      const list = rows.slice(0, 4);
      const cols = list.length === 3 && pw > ph * 1.6 ? 3 : 2;
      const rws = Math.ceil(list.length / cols);
      const gap = S * 0.025;
      const cw = (W * 0.86 - gap * (cols - 1)) / cols;
      const ch = (py1 + H * 0.06 - py0 - gap * (rws - 1)) / rws;
      list.forEach((r, i) => {
        const x0 = W * 0.07 + (i % cols) * (cw + gap);
        const y0 = py0 + Math.floor(i / cols) * (ch + gap);
        const k = back((t - G - i * 0.18) / 0.5);
        if (k <= 0) return;
        ctx.save();
        ctx.translate(x0 + cw / 2, y0 + ch / 2);
        ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
        ctx.globalAlpha = clamp(k);
        ctx.fillStyle = mu;
        ctx.beginPath();
        (ctx.roundRect ? ctx.roundRect(-cw / 2, -ch / 2, cw, ch, S * 0.02) : ctx.rect(-cw / 2, -ch / 2, cw, ch));
        ctx.fill();
        const mx = Number.isFinite(d.max) ? d.max : unit === '%' ? 100 : nice((r.v[0] || 1) * 1.2);
        const p = clamp(((r.v[0] || 0) / mx) * clamp(ease((t - G - i * 0.18 - 0.2) / 1.2)));
        const R = Math.min(cw * 0.3, ch * 0.36);
        const gcx = -cw / 2 + cw * 0.3;
        const gcy = R * 0.35;
        ctx.lineWidth = R * 0.22;
        ctx.lineCap = 'round';
        ctx.strokeStyle = bg;
        ctx.beginPath();
        ctx.arc(gcx, gcy, R, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = col(i);
        if (p > 0.001) {
          ctx.beginPath();
          ctx.arc(gcx, gcy, R, Math.PI, Math.PI + Math.PI * p);
          ctx.stroke();
        }
        const tw = cw * 0.42;
        const tx = cw / 2 - cw * 0.05;
        txt(r.label, tx, -ch * 0.16, fsL * 1.35, mu2, 'right', 'middle', 700, tw);
        txt(fmt(cnt(r.v[0] || 0, clamp(ease((t - G - i * 0.18 - 0.2) / 1.2))), unit), tx, ch * 0.12, Math.min(S * 0.075, ch * 0.3), fg, 'right', 'middle', 900, tw);
        ctx.restore();
      });
      L = G + list.length * 0.18 + 1.4 + 3;
    } else if (kind === 'gauge') {
      const r = rows[0] || { label: '', v: [0], raw: '' };
      const max = Number.isFinite(d.max) ? d.max : unit === '%' ? 100 : nice((r.v[0] || 1) * 1.2);
      const cx = W / 2;
      const cy = py0 + ph * 0.62;
      const R = Math.min(pw * 0.42, ph * 0.55);
      const k = back((t - G) / 1.6);
      const frac = clamp(((r.v[0] || 0) / max) * k);
      ctx.lineCap = 'butt';
      ctx.lineWidth = R * 0.2;
      ctx.strokeStyle = mu;
      ctx.beginPath();
      ctx.arc(cx, cy, R, Math.PI, Math.PI * 2);
      ctx.stroke();
      // 分段色帶
      [col(3), col(1), col(0)].forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.arc(cx, cy, R + R * 0.17, Math.PI + (Math.PI * i) / 3, Math.PI + (Math.PI * (i + 1)) / 3);
        ctx.lineWidth = R * 0.05;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.lineWidth = R * 0.2;
      ctx.strokeStyle = col(0);
      ctx.beginPath();
      ctx.arc(cx, cy, R, Math.PI, Math.PI + Math.PI * frac);
      ctx.stroke();
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI + (Math.PI * i) / 10;
        ctx.fillStyle = mu2;
        ctx.save();
        ctx.translate(cx + Math.cos(a) * R * 0.78, cy + Math.sin(a) * R * 0.78);
        ctx.rotate(a);
        ctx.fillRect(-R * 0.03, -R * 0.006, R * (i % 5 ? 0.04 : 0.07), R * 0.012);
        ctx.restore();
      }
      const a = Math.PI + Math.PI * frac;
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86);
      ctx.lineTo(cx + Math.cos(a + Math.PI / 2) * R * 0.05, cy + Math.sin(a + Math.PI / 2) * R * 0.05);
      ctx.lineTo(cx + Math.cos(a - Math.PI / 2) * R * 0.05, cy + Math.sin(a - Math.PI / 2) * R * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.08, 0, Math.PI * 2);
      ctx.fill();
      txt(fmt(cnt(r.v[0] || 0, clamp(ease((t - G) / 1.6))), unit), cx, cy + R * 0.32, S * 0.11, fg, 'center', 'middle', 900);
      txt(r.label, cx, cy + R * 0.6, fsV, mu2);
      txt(fmt(0, unit), cx - R, cy + R * 0.2, fsL, mu2);
      txt(fmt(max, unit), cx + R, cy + R * 0.2, fsL, mu2);
      L = G + 1.6 + 3;
    } else if (kind === 'rings') {
      const list = rows.slice(0, 5);
      const cx = W / 2;
      const cy = py0 + ph * 0.4;
      const R = Math.min(pw * 0.42, ph * 0.4);
      const lw = (R * 0.7) / Math.max(1, list.length) * 0.78;
      list.forEach((r, i) => {
        const rr = R - i * lw * 1.28;
        const max = Number.isFinite(d.max) ? d.max : 100;
        const k = ease((t - G - i * 0.18) / 1.2);
        ctx.lineCap = 'round';
        ctx.lineWidth = lw;
        ctx.strokeStyle = mu;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = col(i);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(((r.v[0] || 0) / max) * k));
        if (k > 0) ctx.stroke();
        ctx.globalAlpha = ease((t - G - i * 0.18) / 0.4);
        txt(r.label, cx - S * 0.02, cy - rr, Math.min(fsL, lw * 0.62), fg, 'right', 'middle', 700);
        ctx.globalAlpha = 1;
        // 下方數字列
        const lk = ease((t - G - 0.8 - i * 0.12) / 0.4);
        if (lk > 0) {
          ctx.globalAlpha = lk;
          const yy = cy + R * 1.22 + i * fsV * 1.6;
          ctx.fillStyle = col(i);
          ctx.fillRect(W * 0.2, yy - fsV * 0.4, fsV * 0.8, fsV * 0.8);
          txt(r.label, W * 0.2 + fsV * 1.3, yy, fsV, fg, 'left', 'middle', 700);
          txt(fmt(cnt(r.v[0] || 0, k), unit === '' ? '%' : unit), W * 0.8, yy, fsV * 1.1, col(i), 'right', 'middle', 900);
          ctx.globalAlpha = 1;
        }
      });
      L = G + list.length * 0.18 + 1.2 + 2.6;
    } else if (kind === 'picto') {
      const list = rows.slice(0, 3);
      const band = ph / Math.max(1, list.length);
      list.forEach((r, ri) => {
        const a = Math.round(r.v[0] || 0);
        const b = Math.max(a, Math.round(r.v[1] || 10));
        const cols = Math.min(10, b);
        const cell = Math.min((pw * 0.98) / cols, (band * 0.55) / Math.ceil(b / cols));
        const y0 = py0 + band * ri + fsV * 2.2;
        ctx.globalAlpha = tIn;
        txt(r.label, W * 0.07, py0 + band * ri + fsV * 0.6, fsV, fg, 'left', 'middle', 700);
        ctx.globalAlpha = 1;
        for (let k = 0; k < b; k++) {
          const x = W * 0.07 + (k % cols) * cell + cell / 2;
          const y = y0 + Math.floor(k / cols) * cell + cell / 2;
          const on = k < a;
          const kk = on ? back((t - G - ri * 0.4 - k * 0.07) / 0.3) : ease((t - G - ri * 0.4) / 0.3);
          if (kk <= 0) continue;
          const s = cell * 0.36 * kk;
          ctx.fillStyle = on ? col(ri) : mu;
          ctx.beginPath();
          ctx.moveTo(x, y - s);
          ctx.lineTo(x + s, y - s * 0.1);
          ctx.lineTo(x + s * 0.72, y - s * 0.1);
          ctx.lineTo(x + s * 0.72, y + s * 0.85);
          ctx.lineTo(x - s * 0.72, y + s * 0.85);
          ctx.lineTo(x - s * 0.72, y - s * 0.1);
          ctx.lineTo(x - s, y - s * 0.1);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = bg;
          ctx.fillRect(x - s * 0.18, y + s * 0.3, s * 0.36, s * 0.55);
        }
        const nk = ease((t - G - ri * 0.4 - a * 0.07) / 0.4);
        ctx.globalAlpha = nk;
        txt(`${a}/${b}`, W * 0.93, py0 + band * ri + fsV * 0.6, fsV * 1.4, col(ri), 'right', 'middle', 900);
        ctx.globalAlpha = 1;
      });
      L = G + list.length * 0.4 + 10 * 0.07 + 2.6;
    } else if (kind === 'treemap' || kind === 'sunburst') {
      // 父/子 階層
      const groups: { name: string; items: { name: string; v: number }[]; sum: number }[] = [];
      rows.forEach((r) => {
        const [p, c] = r.label.includes('/') ? r.label.split('/') : [r.label, ''];
        let gp = groups.find((x) => x.name === p.trim());
        if (!gp) groups.push((gp = { name: p.trim(), items: [], sum: 0 }));
        gp.items.push({ name: (c || p).trim(), v: Math.max(0, r.v[0] || 0) });
        gp.sum += Math.max(0, r.v[0] || 0);
      });
      const total = groups.reduce((a, g) => a + g.sum, 0) || 1;
      if (kind === 'treemap') {
        // 依面積切割：先切大類，再切小類（長邊切）
        const rects: { x: number; y: number; w: number; h: number; c: string; name: string; v: number; gi: number; k: number }[] = [];
        const slice = (items: { v: number }[], x: number, y: number, w: number, h: number, out: (i: number, x: number, y: number, w: number, h: number) => void) => {
          const sum = items.reduce((a, b) => a + b.v, 0) || 1;
          let off = 0;
          items.forEach((it, i) => {
            const f = it.v / sum;
            if (w >= h) out(i, x + off * w, y, w * f, h);
            else out(i, x, y + off * h, w, h * f);
            off += f;
          });
        };
        const gs = [...groups].sort((a, b) => b.sum - a.sum);
        let idx = 0;
        // 大類採兩欄交替切，比單向切更接近方形
        const half = Math.ceil(gs.length / 2);
        const colA = gs.slice(0, half);
        const colB = gs.slice(half);
        const sA = colA.reduce((a, g) => a + g.sum, 0);
        const fa = sA / total;
        const regions: [typeof gs, number, number, number, number][] = pw >= ph ? [[colA, px0, py0, pw * fa, ph], [colB, px0 + pw * fa, py0, pw * (1 - fa), ph]] : [[colA, px0, py0, pw, ph * fa], [colB, px0, py0 + ph * fa, pw, ph * (1 - fa)]];
        regions.forEach(([list, x, y, w, h]) => {
          if (!list.length) return;
          slice(
            list.map((g) => ({ v: g.sum })),
            x, y, w, h,
            (i, gx, gy, gw, gh) => {
              const g = list[i];
              const gi = groups.indexOf(g);
              slice(
                [...g.items].sort((a, b) => b.v - a.v),
                gx, gy, gw, gh,
                (j, cx, cy, cw, chh) => {
                  const it = [...g.items].sort((a, b) => b.v - a.v)[j];
                  rects.push({ x: cx, y: cy, w: cw, h: chh, c: mix(col(gi), bg, j * 0.12), name: g.items.length > 1 ? it.name : g.name, v: it.v, gi, k: idx++ });
                },
              );
            },
          );
        });
        rects.forEach((r) => {
          const k = back((t - G - r.k * 0.08) / 0.45);
          if (k <= 0) return;
          const gap = S * 0.004;
          const w = (r.w - gap * 2) * k;
          const h = (r.h - gap * 2) * k;
          ctx.fillStyle = r.c;
          ctx.fillRect(r.x + r.w / 2 - w / 2, r.y + r.h / 2 - h / 2, w, h);
          const lk = ease((t - G - r.k * 0.08 - 0.3) / 0.3);
          if (lk > 0 && r.w > S * 0.12 && r.h > S * 0.08) {
            ctx.globalAlpha = lk;
            const tc = lum(col(r.gi)) > 150 ? '#1d2433' : '#ffffff';
            const fs = Math.min(fsV, r.h * 0.22, r.w * 0.16);
            txt(r.name, r.x + gap * 3, r.y + gap * 3, fs, tc, 'left', 'top', 900, r.w - gap * 6);
            txt(`${fmt(r.v, unit)}`, r.x + gap * 3, r.y + gap * 3 + fs * 1.3, fs * 0.85, tc, 'left', 'top', 700);
            ctx.globalAlpha = 1;
          }
        });
        L = G + rects.length * 0.08 + 2.8;
      } else {
        const cx = W / 2;
        const cy = py0 + ph * 0.46;
        const R = Math.min(pw * 0.46, ph * 0.44);
        const p = ease((t - G) / 1.5);
        const lim = -Math.PI / 2 + Math.PI * 2 * p;
        let a0 = -Math.PI / 2;
        blobC(cx, cy, R * 0.26, mu);
        txt(fmt(cnt(total, p), unit), cx, cy, S * 0.05, fg, 'center', 'middle', 900);
        groups.forEach((g, gi) => {
          const ga = (g.sum / total) * Math.PI * 2;
          const end = Math.min(a0 + ga, lim);
          if (end > a0) {
            ring(cx, cy, R * 0.3, R * 0.62, a0, end, col(gi));
            let b0 = a0;
            g.items.forEach((it, j) => {
              const ia = (it.v / (g.sum || 1)) * ga;
              const e2 = Math.min(b0 + ia, lim - 0.12);
              if (e2 > b0) ring(cx, cy, R * 0.65, R * 0.98, b0, e2, mix(col(gi), bg, 0.15 + j * 0.12));
              b0 += ia;
            });
            const lk = ease((t - G - 1.5 - gi * 0.1) / 0.4);
            if (lk > 0 && ga > 0.3) {
              ctx.globalAlpha = lk;
              const mid = a0 + ga / 2;
              txt(g.name, cx + Math.cos(mid) * R * 0.46, cy + Math.sin(mid) * R * 0.46, Math.min(fsV, R * 0.12), lum(col(gi)) > 150 ? '#1d2433' : '#ffffff', 'center', 'middle', 900);
              ctx.globalAlpha = 1;
            }
          }
          a0 += ga;
        });
        L = G + 1.5 + groups.length * 0.1 + 2.6;
      }
    } else if (kind === 'funnel') {
      const list = rows.slice(0, 7);
      const max = Math.max(...list.map((r) => r.v[0] || 0), 1);
      const lh = Math.min(ph / Math.max(1, list.length), S * 0.14);
      const cx = W * 0.42;
      const fw = W * 0.6;
      list.forEach((r, i) => {
        const k = ease((t - G - i * 0.22) / 0.5);
        if (k <= 0) return;
        const w0 = fw * ((r.v[0] || 0) / max);
        const w1 = i < list.length - 1 ? fw * ((list[i + 1].v[0] || 0) / max) : w0 * 0.8;
        const y = py0 + lh * i;
        const dx = (1 - k) * (i % 2 ? 1 : -1) * W * 0.3;
        ctx.globalAlpha = k;
        ctx.fillStyle = col(i);
        ctx.beginPath();
        ctx.moveTo(cx - w0 / 2 + dx, y);
        ctx.lineTo(cx + w0 / 2 + dx, y);
        ctx.lineTo(cx + w1 / 2 + dx, y + lh * 0.9);
        ctx.lineTo(cx - w1 / 2 + dx, y + lh * 0.9);
        ctx.closePath();
        ctx.fill();
        if (Math.min(w0, w1) > fsV * 3) txt(fmt(r.v[0] || 0, unit), cx + dx, y + lh * 0.45, Math.min(fsV * 1.1, lh * 0.36), lum(col(i)) > 150 ? '#1d2433' : '#ffffff', 'center', 'middle', 900);
        else txt(fmt(r.v[0] || 0, unit), cx + dx - Math.max(w0, w1) / 2 - fsV * 0.4, y + lh * 0.45, Math.min(fsV * 1.1, lh * 0.36), col(i), 'right', 'middle', 900);
        txt(r.label, W * 0.76, y + lh * 0.32, fsL, fg, 'left', 'middle', 700, W * 0.22);
        if (i > 0) txt(`${Math.round(((r.v[0] || 0) / (list[i - 1].v[0] || 1)) * 100)}%`, W * 0.76, y + lh * 0.66, fsL * 0.85, col(i), 'left', 'middle', 900);
        ctx.globalAlpha = 1;
      });
      L = G + list.length * 0.22 + 2.8;
    } else if (kind === 'radar') {
      const axes = rows.slice(0, 10);
      const na = Math.max(3, axes.length);
      const max = Number.isFinite(d.max) ? d.max : nice(Math.max(...allV, 1));
      const cx = W / 2;
      const cy = py0 + ph * 0.48;
      const R = Math.min(pw * 0.38, ph * 0.4);
      const ang = (i: number) => -Math.PI / 2 + (Math.PI * 2 * i) / na;
      ctx.globalAlpha = tIn;
      for (let lv = 1; lv <= 4; lv++) {
        ctx.strokeStyle = mu;
        ctx.lineWidth = S * 0.002;
        ctx.beginPath();
        for (let i = 0; i <= na; i++) {
          const a = ang(i % na);
          const r = (R * lv) / 4;
          if (i) ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          else ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        ctx.stroke();
      }
      axes.forEach((r, i) => {
        const a = ang(i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.stroke();
        txt(r.label, cx + Math.cos(a) * R * 1.16, cy + Math.sin(a) * R * 1.16, fsL, fg, Math.cos(a) > 0.3 ? 'left' : Math.cos(a) < -0.3 ? 'right' : 'center');
      });
      ctx.globalAlpha = 1;
      for (let j = 0; j < m; j++) {
        const k = back((t - G - j * 0.4) / 0.8);
        if (k <= 0) continue;
        const pts = axes.map((r, i) => {
          const v = clamp((r.v[j] || 0) / max) * R * k;
          return [cx + Math.cos(ang(i)) * v, cy + Math.sin(ang(i)) * v];
        });
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = col(j);
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = col(j);
        ctx.lineWidth = S * 0.006;
        ctx.stroke();
        pts.forEach(([x, y]) => {
          ctx.fillStyle = col(j);
          ctx.beginPath();
          ctx.arc(x, y, S * 0.009, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      L = G + m * 0.4 + 0.8 + 2.6;
    } else if (kind === 'scatter' || kind === 'bubble' || kind === 'box') {
      if (kind === 'box') {
        const max = Number.isFinite(d.max) ? d.max : niceMax(Math.max(...allV, 1) * 1.05);
        const mn = Math.min(...allV);
        const min = mn > max * 0.3 ? Math.floor(mn / nice(max / 5)) * nice(max / 5) : 0;
        grid(max, min);
        const gw = pw / Math.max(1, n);
        rows.forEach((r, i) => {
          const [lo, q1, md, q3, hi] = [...r.v].sort((a, b) => a - b);
          const x = px0 + gw * (i + 0.5);
          const bw = gw * 0.45;
          const k = ease((t - G - i * 0.15) / 0.7);
          const ym = yOf(md, max, min);
          const ext = (y: number) => ym + (y - ym) * k;
          ctx.fillStyle = mu2;
          ctx.fillRect(x - S * 0.002, ext(yOf(hi, max, min)), S * 0.004, ext(yOf(lo, max, min)) - ext(yOf(hi, max, min)));
          ctx.fillRect(x - bw * 0.3, ext(yOf(hi, max, min)) - S * 0.002, bw * 0.6, S * 0.004);
          ctx.fillRect(x - bw * 0.3, ext(yOf(lo, max, min)) - S * 0.002, bw * 0.6, S * 0.004);
          ctx.fillStyle = col(i % 2 ? 1 : 0);
          ctx.fillRect(x - bw / 2, ext(yOf(q3, max, min)), bw, ext(yOf(q1, max, min)) - ext(yOf(q3, max, min)));
          ctx.fillStyle = bg;
          ctx.fillRect(x - bw / 2, ym - S * 0.003, bw, S * 0.006);
          const lk = ease((t - G - i * 0.15 - 0.6) / 0.3);
          ctx.globalAlpha = lk;
          txt(fmt(md, unit), x + bw * 0.62, ym, fsL, fg, 'left', 'middle', 900);
          ctx.globalAlpha = tIn;
          txt(r.label, x, py1 + fsL * 1.1, fsL, mu2, 'center', 'middle', 700, gw);
          ctx.globalAlpha = 1;
        });
        L = G + n * 0.15 + 0.7 + 2.6;
      } else {
        const xs = rows.map((r) => r.v[0]);
        const ys = rows.map((r) => r.v[1]);
        const xmax = niceMax(Math.max(...xs.filter(Number.isFinite), 1) * 1.05);
        const ymax = Number.isFinite(d.max) ? d.max : niceMax(Math.max(...ys.filter(Number.isFinite), 1) * 1.08);
        grid(ymax);
        for (let i = 0; i <= 4; i++) {
          ctx.globalAlpha = tIn;
          txt(fmt((xmax * i) / 4), px0 + (pw * i) / 4, py1 + fsL * 1.1, fsL * 0.9, mu2);
        }
        if (d.series.length >= 2) {
          txt(d.series[0], px1, py1 + fsL * 2.4, fsL, mu2, 'right');
          txt(d.series[1], px0, py0 - fsL * 1.1, fsL, mu2, 'left');
        }
        ctx.globalAlpha = 1;
        if (d.quad.length >= 2) {
          const qx = parseFloat(d.quad[0]);
          const qy = parseFloat(d.quad[1]);
          if (Number.isFinite(qx) && Number.isFinite(qy)) {
            const X = px0 + (qx / xmax) * pw;
            const Y = yOf(qy, ymax);
            const qk = ease((t - G + 0.3) / 0.6);
            const lab = d.quad.slice(2, 6);
            const tint = [col(0), col(1), col(2), col(3)];
            [[X, py0, px1 - X, Y - py0], [px0, py0, X - px0, Y - py0], [px0, Y, X - px0, py1 - Y], [X, Y, px1 - X, py1 - Y]].forEach(([x, y, w, h], q) => {
              ctx.globalAlpha = 0.09 * qk;
              ctx.fillStyle = tint[q];
              ctx.fillRect(x, y, w, h);
              if (lab[q]) {
                ctx.globalAlpha = 0.85 * qk;
                const right = q === 0 || q === 3;
                const topq = q < 2;
                txt(lab[q], right ? x + w - S * 0.015 : x + S * 0.015, topq ? y + fsL * 1.1 : y + h - fsL * 1.1, fsL, tint[q], right ? 'right' : 'left', 'middle', 900, w * 0.9);
              }
            });
            ctx.globalAlpha = qk;
            ctx.fillStyle = fg;
            ctx.fillRect(X - S * 0.002, py1 - ph * qk, S * 0.004, ph * qk);
            ctx.fillRect(px0, Y - S * 0.002, pw * qk, S * 0.004);
            ctx.globalAlpha = 1;
          }
        }
        const sizes = rows.map((r) => r.v[2] || 1);
        const smax = Math.max(...sizes, 1);
        rows.forEach((r, i) => {
          if (!Number.isFinite(r.v[0]) || !Number.isFinite(r.v[1])) return;
          const x = px0 + (r.v[0] / xmax) * pw;
          const y = yOf(r.v[1], ymax);
          const k = back((t - G - i * 0.07) / 0.4);
          if (k <= 0) return;
          const rad = kind === 'bubble' ? S * (0.025 + 0.085 * Math.sqrt(sizes[i] / smax)) * k : S * 0.014 * k;
          ctx.globalAlpha = kind === 'bubble' ? 0.78 : 1;
          ctx.fillStyle = col(kind === 'bubble' ? i : 0);
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          if (kind === 'bubble' && rad > S * 0.04) txt(r.label, x, y, Math.min(fsL, rad * 0.4), lum(col(i)) > 150 ? '#1d2433' : '#ffffff', 'center', 'middle', 900, rad * 1.8);
          else if (kind === 'bubble' || n <= 12) {
            ctx.globalAlpha = ease((t - G - i * 0.07 - 0.2) / 0.3);
            txt(r.label, x + rad + S * 0.008, y - rad * 0.4, fsL * 0.85, fg, 'left', 'middle', 700);
            ctx.globalAlpha = 1;
          }
        });
        // 散佈：趨勢線（最小平方法）
        if (kind === 'scatter' && n >= 3) {
          const pts = rows.filter((r) => Number.isFinite(r.v[0]) && Number.isFinite(r.v[1]));
          const mx = pts.reduce((a, r) => a + r.v[0], 0) / pts.length;
          const my = pts.reduce((a, r) => a + r.v[1], 0) / pts.length;
          const sxy = pts.reduce((a, r) => a + (r.v[0] - mx) * (r.v[1] - my), 0);
          const sxx = pts.reduce((a, r) => a + (r.v[0] - mx) ** 2, 0) || 1;
          const b = sxy / sxx;
          const p = ease((t - G - n * 0.07 - 0.2) / 0.8);
          if (p > 0) {
            const x0 = 0;
            const x1 = xmax * p;
            ctx.strokeStyle = col(1);
            ctx.lineWidth = S * 0.005;
            ctx.setLineDash([S * 0.02, S * 0.012]);
            ctx.beginPath();
            ctx.moveTo(px0 + (x0 / xmax) * pw, yOf(my + b * (x0 - mx), ymax));
            ctx.lineTo(px0 + (x1 / xmax) * pw, yOf(my + b * (x1 - mx), ymax));
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        L = G + n * 0.07 + 1.2 + 2.4;
      }
    }
    // ===== #680–#683：同心圓靶、甘特圖、泳道流程、蜿蜒路徑（文字逐行，不需數值） =====
    if (kind === 'target' || kind === 'gantt' || kind === 'swimlane' || kind === 'path') {
      const u = S / 1080;
      const tall = H > W * 1.2;
      const ink = '#151515';
      const card = mix(fg, bg, 0.88);
      const lane0 = mix(fg, bg, 0.93);
      const lane1 = mix(fg, bg, 0.95);
      const X0 = W * 0.07;
      const X1 = W * 0.93;
      const Y0 = top + H * 0.03;
      const Y1 = H * (tall ? 0.95 : 0.94);
      const setF = (w: number, s: number) => (ctx.font = `${w} ${s}px ${F}`);
      const tw = (s: string, w: number, size: number) => (setF(w, size), ctx.measureText(s).width);
      const rrect = (x: number, y: number, w: number, h: number, r: number) => {
        r = Math.max(0, Math.min(r, w / 2, h / 2));
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };
      /** 依寬度斷行：優先在空白、・、，後斷，中文可逐字斷；超過 maxL 行最後加… */
      const wrap = (s: string, w: number, size: number, maxW: number, maxL = 2) => {
        setF(w, size);
        const out: string[] = [];
        let cur = '';
        const chars = Array.from(s);
        for (let i = 0; i < chars.length; i++) {
          const c = chars[i];
          const nx = cur + c;
          if (ctx.measureText(nx).width <= maxW || !cur) {
            cur = nx;
            continue;
          }
          const bi = Math.max(cur.lastIndexOf(' '), cur.lastIndexOf('・'), cur.lastIndexOf('，'), cur.lastIndexOf('、'));
          if (bi > 0 && bi < cur.length - 1) {
            out.push(cur.slice(0, bi + 1).trim());
            cur = cur.slice(bi + 1) + c;
          } else {
            out.push(cur);
            cur = c;
          }
        }
        if (cur.trim()) out.push(cur.trim());
        if (out.length > maxL) {
          const keep = out.slice(0, maxL);
          let last = keep[maxL - 1];
          while (last.length > 1 && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1);
          keep[maxL - 1] = last + '…';
          return keep;
        }
        return out;
      };
      /** 找能放進 maxW、最多 maxL 行的最大字級 */
      const fit = (s: string, w: number, size: number, maxW: number, maxL = 2, minS = size * 0.6) => {
        let z = size;
        while (z > minS && wrap(s, w, z, maxW, 99).length > maxL) z *= 0.92;
        return { size: z, lines: wrap(s, w, z, maxW, maxL) };
      };
      const pill = (s: string, x: number, y: number, c: string, size: number, k = 1) => {
        if (k <= 0) return 0;
        setF(800, size);
        const w = ctx.measureText(s).width + size * 1.2;
        const h = size * 1.6;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(k, k);
        rrect(-w / 2, -h / 2, w, h, h / 2);
        ctx.fillStyle = c;
        ctx.fill();
        txt(s, 0, size * 0.04, size, lum(c) > 150 ? ink : '#ffffff', 'center', 'middle', 800);
        ctx.restore();
        return w;
      };
      const split2 = (s: string) => {
        const m = s.match(/^(.*?)\s*[｜|:：]\s*(.*)$/);
        return m ? [m[1].trim(), m[2].trim()] : [s.trim(), ''];
      };
      const lines = d.lines.slice(0, 12);

      if (kind === 'target') {
        // 每行：5 分鐘 捷運站・超商（前面數字＋單位為圈名，後面為說明）
        const items = lines
          .map((s) => {
            const m = s.match(/^([\d.]+\s*[^\s\d｜|:：]*)\s*[｜|:：]?\s*(.*)$/);
            const a = m ? m[1].trim() : split2(s)[0];
            const b = m ? m[2].trim() : split2(s)[1];
            return { a, b, v: parseFloat(a) };
          })
          .slice(0, 5);
        if (items.every((x) => Number.isFinite(x.v))) items.sort((p, q) => p.v - q.v);
        const n2 = Math.max(1, items.length);
        const center = d.opt.center || '';
        let cx: number;
        let cy: number;
        let R: number;
        if (tall) {
          R = Math.min(W * 0.4, (Y1 - Y0) * 0.27);
          cx = W / 2;
          cy = Y0 + R * 1.1;
        } else {
          R = Math.min((Y1 - Y0) * 0.47, W * 0.25);
          cx = W * 0.07 + R * 1.15 + W * 0.04;
          cy = (Y0 + Y1) / 2;
        }
        const radius = (i: number) => (n2 === 1 ? R : R * (0.38 + (0.62 * i) / (n2 - 1)));
        const T0 = 0.9;
        const step = 0.5;
        // 外擴漣漪
        const done = T0 + n2 * step + 0.4;
        if (t > done) {
          const q = ((t - done) % 2) / 2;
          ctx.globalAlpha = (1 - q) * 0.7;
          ctx.setLineDash([14 * u, 14 * u]);
          ctx.lineWidth = 3 * u;
          ctx.strokeStyle = col(n2 - 1);
          ctx.beginPath();
          ctx.arc(cx, cy, R * (1 + 0.12 * q), 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
        for (let i = n2 - 1; i >= 0; i--) {
          const k = back((t - T0 - i * step) / 0.7);
          if (k <= 0) continue;
          const r = radius(i) * k;
          ctx.globalAlpha = 0.2 + 0.1 * (n2 - 1 - i) / Math.max(1, n2 - 1) + (i === 0 ? 0.08 : 0);
          blobC(cx, cy, r, col(i));
          ctx.globalAlpha = 1;
          ctx.lineWidth = 5 * u;
          ctx.strokeStyle = col(i);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        const ps = 30 * u;
        items.forEach((it, i) => {
          const k = back((t - T0 - i * step - 0.35) / 0.45);
          const r = radius(i);
          const gap = i === 0 ? r : r - radius(i - 1);
          const py = cy - r + Math.min(ps * 1.25, gap * 0.5);
          pill(it.a, cx, py, col(i), Math.min(ps, gap * 0.55), k);
        });
        // 圖釘
        const pk = back((t - 0.4) / 0.6);
        if (pk > 0) {
          const pr = Math.min(34 * u, radius(0) * 0.28);
          const dy = (1 - clamp((t - 0.4) / 0.4)) * -R * 0.6;
          ctx.globalAlpha = clamp((t - 0.4) / 0.2);
          const py = cy - pr * 0.6 + dy;
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(cx, py - pr * 0.4, pr, Math.PI * 0.8, Math.PI * 2.2);
          ctx.lineTo(cx, py + pr * 1.3);
          ctx.closePath();
          ctx.fill();
          blobC(cx, py - pr * 0.4, pr * 0.42, col(0));
          if (center) txt(center, cx, py + pr * 2.3, Math.min(28 * u, radius(0) * 0.22), fg, 'center', 'middle', 800, radius(0) * 1.6);
          ctx.globalAlpha = 1;
        }
        // 圖例
        const lx = tall ? W * 0.12 : cx + R * 1.25 + W * 0.02;
        const lw = (tall ? W * 0.88 : X1) - lx - 40 * u;
        const blocks = items.map((it) => fit(it.b, 800, 36 * u, lw, 2));
        const bh = blocks.map((b) => 52 * u + b.lines.length * b.size * 1.3 + 30 * u);
        const tot = bh.reduce((a, b) => a + b, 0);
        let yy = tall ? cy + R * 1.18 + 20 * u : cy - tot / 2;
        if (tall) yy = Math.min(yy, Y1 - tot);
        items.forEach((it, i) => {
          const k = ease((t - T0 - i * step - 0.4) / 0.5);
          if (k > 0) {
            ctx.globalAlpha = k;
            const ox = (1 - k) * 40 * u;
            blobC(lx + 18 * u + ox, yy + 26 * u, 18 * u, col(i));
            const m = it.a.match(/^([\d.]+)\s*(.*)$/);
            const big = m ? m[1] : it.a;
            txt(big, lx + 50 * u + ox, yy + 26 * u, 52 * u, fg, 'left', 'middle', 900);
            if (m && m[2]) txt(m[2], lx + 62 * u + tw(big, 900, 52 * u) + ox, yy + 32 * u, 30 * u, mu2, 'left', 'middle', 800);
            blocks[i].lines.forEach((ln, j) => txt(ln, lx + 50 * u + ox, yy + 52 * u + blocks[i].size * (0.75 + j * 1.3), blocks[i].size, fg, 'left', 'middle', 800));
            ctx.globalAlpha = 1;
          }
          yy += bh[i];
        });
        L = done + 3;
      } else if (kind === 'gantt') {
        // 日期：2026、2026Q2、2026/3、2026.3、2026-03、2026年3月、115年3月（民國）
        const DRE = '(\\d{2,4}\\s*(?:年\\s*)?(?:[Qq]\\s*[1-4]|H\\s*[12]|[上下]半年?|\\d{1,2}\\s*月|[./]\\s*\\d{1,2}|-\\d{1,2}(?!\\d))?)';
        const toYear = (y: number) => (y < 1000 ? y + 1911 : y);
        const date = (s: string, end: boolean): number => {
          const z = s.replace(/\s/g, '');
          let m = z.match(/^(\d{2,4})年?[Qq]([1-4])$/);
          if (m) return toYear(+m[1]) + (+m[2] - (end ? 0 : 1)) / 4;
          m = z.match(/^(\d{2,4})年?H([12])$/) || z.match(/^(\d{2,4})年?([上下])半年?$/);
          if (m) {
            const h = m[2] === '上' ? 1 : m[2] === '下' ? 2 : +m[2];
            return toYear(+m[1]) + (h - (end ? 0 : 1)) / 2;
          }
          m = z.match(/^(\d{2,4})(?:年|[./-])(\d{1,2})月?$/);
          if (m) {
            const mo = Math.max(1, Math.min(12, +m[2]));
            return toYear(+m[1]) + (mo - (end ? 0 : 1)) / 12;
          }
          m = z.match(/^(\d{2,4})年?$/);
          if (m) return toYear(+m[1]) + (end ? 1 : 0);
          return NaN;
        };
        const rowRe = new RegExp(`^(.+?)\\s+${DRE}(?:\\s*(?:-|–|—|~|～|到|至)\\s*${DRE})?(?:\\s+(.+))?$`);
        type GR = { name: string; a: number; b: number; tag: string; ms: boolean };
        const gr: GR[] = [];
        for (const s of lines) {
          const m = s.match(rowRe);
          if (!m) continue;
          const a = date(m[2], false);
          const b = m[3] ? date(m[3], true) : NaN;
          if (!Number.isFinite(a)) continue;
          gr.push({ name: m[1].trim(), a, b: Number.isFinite(b) ? b : a, tag: (m[4] || '').trim(), ms: !Number.isFinite(b) });
        }
        const rowsG = gr.slice(0, 9);
        const pays = (d.opt.pay || '').split(/[,，、]/).map((x) => date(x.trim(), false)).filter(Number.isFinite);
        const today = d.opt.today ? date(d.opt.today, false) : NaN;
        let lo = Math.min(...rowsG.map((r) => r.a), ...pays);
        let hi = Math.max(...rowsG.map((r) => r.b), ...pays);
        const ax = (d.opt.axis || '').match(new RegExp(`^${DRE}\\s*(?:-|–|—|~|～|到|至)\\s*${DRE}$`));
        if (ax) {
          lo = date(ax[1], false);
          hi = date(ax[2], true);
        } else {
          lo = Math.floor(lo);
          hi = Math.ceil(hi + 1e-6);
        }
        if (!Number.isFinite(lo) || !(hi > lo)) {
          lo = 2026;
          hi = 2027;
        }
        const span = hi - lo;
        const cells: { a: number; b: number; s: string }[] = [];
        if (span <= 2.01) for (let q = Math.floor(lo * 4); q < Math.ceil(hi * 4 - 1e-6); q++) cells.push({ a: q / 4, b: (q + 1) / 4, s: q % 4 === 0 || q === Math.floor(lo * 4) ? `${Math.floor(q / 4)} Q${(q % 4) + 1}` : `Q${(q % 4) + 1}` });
        else for (let y = Math.floor(lo); y < Math.ceil(hi - 1e-6); y++) cells.push({ a: Math.max(lo, y), b: Math.min(hi, y + 1), s: String(y) });
        const nR = rowsG.length + (pays.length ? 1 : 0);
        const nameS = 40 * u;
        const nameW = tall ? 0 : Math.min(W * 0.22, Math.max(...rowsG.map((r) => tw(r.name, 900, nameS)), pays.length ? tw('繳款點', 800, 30 * u) : 0) + 40 * u);
        const gL = X0 + nameW;
        const gR = X1;
        const gT = Y0 + 70 * u;
        const gB = Y1;
        const rh = (gB - gT) / Math.max(1, nR);
        const bh = Math.min(60 * u, rh * (tall ? 0.38 : 0.55));
        const xOf = (v: number) => gL + ((v - lo) / span) * (gR - gL);
        const ck = ease((t - 0.3) / 0.5);
        ctx.globalAlpha = ck;
        cells.forEach((c, i) => {
          ctx.fillStyle = i % 2 ? lane1 : lane0;
          ctx.fillRect(xOf(c.a), gT, xOf(c.b) - xOf(c.a), gB - gT);
          txt(c.s, (xOf(c.a) + xOf(c.b)) / 2, gT - 34 * u, 30 * u, mu2, 'center', 'middle', 800, xOf(c.b) - xOf(c.a) - 8 * u);
        });
        ctx.globalAlpha = 1;
        const T0 = 0.8;
        const st = 0.35;
        const sweepT = T0 + rowsG.length * st + 0.2;
        const hasT = Number.isFinite(today);
        const tk = hasT ? ease((t - sweepT) / 1) : 0;
        const tNow = hasT ? lo + (today - lo) * tk : -Infinity;
        rowsG.forEach((r, i) => {
          const cyR = gT + rh * (i + 0.5) + (tall ? nameS * 0.55 : 0);
          const nk = ease((t - T0 - i * st) / 0.4);
          ctx.globalAlpha = nk;
          if (tall) txt(r.name, gL, cyR - bh / 2 - nameS * 0.65, nameS * 0.9, fg, 'left', 'middle', 900, gR - gL);
          else txt(r.name, gL - 40 * u, cyR, nameS, fg, 'right', 'middle', 900, nameW - 50 * u);
          ctx.globalAlpha = 1;
          const c = col(i);
          const x0 = xOf(r.a);
          if (r.ms) {
            const k = back((t - T0 - i * st) / 0.5);
            if (k > 0) {
              ctx.save();
              ctx.translate(x0, cyR);
              ctx.rotate(Math.PI / 4);
              ctx.scale(k, k);
              ctx.fillStyle = c;
              ctx.fillRect(-bh * 0.38, -bh * 0.38, bh * 0.76, bh * 0.76);
              ctx.restore();
              if (r.tag) txt(r.tag, x0 + bh * 0.8, cyR, 28 * u, fg, 'left', 'middle', 800);
            }
            return;
          }
          const k = ease((t - T0 - i * st) / 0.6);
          if (k <= 0) return;
          const fullW = Math.max(bh, xOf(r.b) - x0);
          const w = fullW * k;
          // 今天之後半透明
          ctx.globalAlpha = hasT ? 0.35 : 1;
          rrect(x0, cyR - bh / 2, w, bh, bh / 2);
          ctx.fillStyle = c;
          ctx.fill();
          ctx.globalAlpha = 1;
          if (hasT) {
            const cut = Math.max(x0, Math.min(x0 + w, xOf(tNow)));
            if (cut > x0) {
              ctx.save();
              ctx.beginPath();
              ctx.rect(x0, cyR - bh, cut - x0, bh * 2);
              ctx.clip();
              rrect(x0, cyR - bh / 2, w, bh, bh / 2);
              ctx.fillStyle = c;
              ctx.fill();
              ctx.restore();
            }
          }
          const doneR = hasT && r.b <= today + 1e-6 && tNow >= r.b - 1e-6;
          const chkW = doneR ? 40 * u : 0;
          const ts = 28 * u;
          const tagW = r.tag ? tw(r.tag, 800, ts) : 0;
          const inside = r.tag && tagW + 48 * u + chkW <= fullW;
          ctx.globalAlpha = clamp((k - 0.6) / 0.4);
          if (r.tag) {
            if (inside) txt(r.tag, x0 + 24 * u, cyR + 2 * u, ts, lum(c) > 150 || !hasT || tNow > r.a ? ink : fg, 'left', 'middle', 800);
            else txt(r.tag, x0 + fullW + 16 * u, cyR + 2 * u, ts, fg, 'left', 'middle', 800, gR - x0 - fullW - 16 * u);
          }
          ctx.globalAlpha = 1;
          if (doneR && fullW > bh * 1.6) {
            const kk = back((t - sweepT - 0.2 - ((r.b - lo) / Math.max(1e-6, today - lo)) * 1) / 0.35);
            if (kk > 0) {
              ctx.save();
              ctx.translate(x0 + fullW - 26 * u, cyR + 2 * u);
              ctx.scale(kk, kk);
              txt('✓', 0, 0, 32 * u, ink, 'center', 'middle', 900);
              ctx.restore();
            }
          }
        });
        if (pays.length) {
          const cyP = gT + rh * (rowsG.length + 0.5) + (tall ? nameS * 0.3 : 0);
          ctx.globalAlpha = ck;
          if (tall) txt('繳款點', gL, cyP - 44 * u, 28 * u, mu2, 'left', 'middle', 800);
          else txt('繳款點', gL - 40 * u, cyP, 30 * u, mu2, 'right', 'middle', 800);
          ctx.globalAlpha = 1;
          pays.forEach((p, i) => {
            const k = back((t - sweepT - 0.6 - i * 0.18) / 0.4);
            if (k <= 0) return;
            ctx.save();
            ctx.translate(xOf(p), cyP);
            ctx.rotate(Math.PI / 4);
            ctx.scale(k, k);
            ctx.fillStyle = col(1);
            ctx.fillRect(-14 * u, -14 * u, 28 * u, 28 * u);
            ctx.restore();
          });
        }
        if (hasT && tk > 0) {
          const xn = xOf(tNow);
          ctx.strokeStyle = col(0);
          ctx.lineWidth = 5 * u;
          ctx.beginPath();
          ctx.moveTo(xn, gT - 6 * u);
          ctx.lineTo(xn, gB + 6 * u);
          ctx.stroke();
          const lab = d.opt.todaylabel || '今天';
          setF(800, 28 * u);
          const pw2 = ctx.measureText(lab).width + 34 * u;
          pill(lab, Math.max(gL + pw2 / 2, Math.min(gR - pw2 / 2, xn)), gT - 8 * u, col(0), 28 * u);
        }
        L = sweepT + 1 + 0.6 + pays.length * 0.18 + 2.4;
      } else if (kind === 'swimlane') {
        let lanes = (d.opt.lanes || '').split(/[,，、]/).map((x) => x.trim()).filter(Boolean);
        const steps = lines.map(split2).filter((x) => x[1]).slice(0, 10);
        steps.forEach(([l]) => {
          if (!lanes.includes(l)) lanes.push(l);
        });
        lanes = lanes.slice(0, 6);
        const nl = Math.max(1, lanes.length);
        const ns = Math.max(1, steps.length);
        const ek = ease((t - 0.3) / 0.6);
        const pos: { x: number; y: number; w: number; h: number }[] = [];
        if (!tall) {
          const nameS = 46 * u;
          const hw = Math.min(W * 0.18, Math.max(...lanes.map((l) => tw(l, 900, nameS))) + 50 * u);
          const lx = X0 + hw;
          const lh = (Y1 - Y0) / nl;
          lanes.forEach((l, i) => {
            const y = Y0 + i * lh;
            ctx.globalAlpha = ek;
            ctx.fillStyle = i % 2 ? lane1 : lane0;
            ctx.fillRect(lx, y, (X1 - lx) * ek, lh - 12 * u);
            ctx.fillStyle = col(i);
            ctx.fillRect(lx, y, 10 * u, lh - 12 * u);
            txt(l, lx - 36 * u, y + lh / 2 - 6 * u, nameS, fg, 'right', 'middle', 900, hw - 46 * u);
            ctx.globalAlpha = 1;
          });
          const cw = (X1 - lx - 40 * u) / ns;
          steps.forEach(([l], i) => {
            const li = lanes.indexOf(l);
            const w = Math.min(cw * 0.9, 300 * u);
            const h = Math.min(lh * 0.62, 110 * u);
            pos.push({ x: lx + 40 * u + cw * (i + 0.5), y: Y0 + li * lh + lh / 2 - 6 * u, w, h });
          });
        } else {
          const nameS = 40 * u;
          const hh = 90 * u;
          const lw = (X1 - X0) / nl;
          const ly = Y0 + hh;
          lanes.forEach((l, i) => {
            const x = X0 + i * lw;
            ctx.globalAlpha = ek;
            ctx.fillStyle = i % 2 ? lane1 : lane0;
            ctx.fillRect(x, ly, lw - 10 * u, (Y1 - ly) * ek);
            ctx.fillStyle = col(i);
            ctx.fillRect(x, ly, lw - 10 * u, 10 * u);
            txt(l, x + (lw - 10 * u) / 2, Y0 + hh / 2, nameS, fg, 'center', 'middle', 900, lw - 20 * u);
            ctx.globalAlpha = 1;
          });
          const sh = (Y1 - ly - 30 * u) / ns;
          steps.forEach(([l], i) => {
            const li = lanes.indexOf(l);
            pos.push({ x: X0 + li * lw + (lw - 10 * u) / 2, y: ly + 30 * u + sh * (i + 0.5), w: lw * 0.86, h: Math.min(sh * 0.78, 130 * u) });
          });
        }
        const T0 = 1.0;
        const st = 0.45;
        // 虛線連線：逐段畫到下一張卡
        ctx.strokeStyle = mix(fg, bg, 0.55);
        ctx.lineWidth = 4 * u;
        ctx.setLineDash([10 * u, 10 * u]);
        ctx.lineDashOffset = -t * 30 * u;
        for (let i = 1; i < pos.length; i++) {
          const k = ease((t - T0 - i * st + 0.25) / 0.35);
          if (k <= 0) continue;
          const a = pos[i - 1];
          const b = pos[i];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
        steps.forEach(([l, s], i) => {
          const k = back((t - T0 - i * st) / 0.45);
          if (k <= 0) return;
          const p = pos[i];
          const c = col(lanes.indexOf(l));
          const last = i === steps.length - 1;
          const f = fit(s, 800, 30 * u, p.w - 36 * u, 2, 20 * u);
          const h = Math.max(p.h, f.lines.length * f.size * 1.25 + 30 * u);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.scale(k, k);
          rrect(-p.w / 2, -h / 2, p.w, h, 16 * u);
          ctx.fillStyle = last ? col(0) : mix(fg, bg, 0.84);
          ctx.fill();
          ctx.lineWidth = 4 * u;
          ctx.strokeStyle = c;
          ctx.stroke();
          f.lines.forEach((ln, j) => txt(ln, 0, (j - (f.lines.length - 1) / 2) * f.size * 1.25 + 2 * u, f.size, last ? ink : fg, 'center', 'middle', 800, p.w - 24 * u));
          blobC(-p.w / 2 + 4 * u, -h / 2, 20 * u, c);
          txt(String(i + 1), -p.w / 2 + 4 * u, -h / 2 + 1 * u, 24 * u, ink, 'center', 'middle', 900);
          ctx.restore();
        });
        L = T0 + ns * st + 3;
      } else {
        // 蜿蜒路徑：每行 步驟｜說明
        const steps = lines.map(split2).slice(0, 8);
        const ns = Math.max(2, steps.length);
        const shape = (d.opt.shape || 's').toLowerCase();
        const pts: [number, number][] = [];
        for (let i = 0; i < steps.length; i++) {
          const q = steps.length === 1 ? 0.5 : i / (steps.length - 1);
          const alt = i % 2 ? -1 : 1;
          if (!tall) {
            const x = W * 0.12 + q * W * 0.76;
            const mid = (Y0 + Y1) / 2;
            const amp = (Y1 - Y0) * 0.14;
            let y = mid + alt * amp;
            if (shape === 's') y = mid + (Y1 - Y0) * 0.13 * (1 - 2 * q) + alt * amp * 0.75;
            if (shape === 'u') y = mid - (Y1 - Y0) * 0.18 + (Y1 - Y0) * 0.36 * Math.sin(q * Math.PI) * 1 - alt * amp * 0.3;
            pts.push([x, y]);
          } else {
            const y = Y0 + 110 * u + q * (Y1 - Y0 - 220 * u);
            pts.push([alt > 0 ? W * 0.24 : W * 0.76, y]);
          }
        }
        // 取樣路徑
        const samp: [number, number][] = [];
        const seg: number[] = [0];
        for (let i = 1; i < pts.length; i++) {
          const [a, b] = pts[i - 1];
          const [c, e] = pts[i];
          for (let j = i === 1 ? 0 : 1; j <= 40; j++) {
            const s = j / 40;
            const mt = 1 - s;
            const p1 = tall ? [a, (b + e) / 2] : [(a + c) / 2, b];
            const p2 = tall ? [c, (b + e) / 2] : [(a + c) / 2, e];
            samp.push([mt * mt * mt * a + 3 * mt * mt * s * p1[0] + 3 * mt * s * s * p2[0] + s * s * s * c, mt * mt * mt * b + 3 * mt * mt * s * p1[1] + 3 * mt * s * s * p2[1] + s * s * s * e]);
          }
          seg.push(samp.length - 1);
        }
        const roadK = ease((t - 0.4) / 1);
        const roadW = 70 * u;
        const strokeTo = (upto: number) => {
          ctx.beginPath();
          samp.slice(0, Math.max(1, upto)).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.stroke();
        };
        ctx.lineCap = 'round';
        if (samp.length > 1) {
          ctx.lineWidth = roadW;
          ctx.strokeStyle = mix(fg, bg, 0.86);
          strokeTo(Math.round(samp.length * roadK));
          ctx.lineWidth = 6 * u;
          ctx.setLineDash([26 * u, 22 * u]);
          ctx.lineDashOffset = -t * 40 * u;
          ctx.strokeStyle = mix(fg, bg, 0.6);
          strokeTo(Math.round(samp.length * roadK));
          ctx.setLineDash([]);
          ctx.lineDashOffset = 0;
        }
        ctx.lineCap = 'butt';
        const W0 = 1.5;
        const st = 0.7;
        const walk = clamp((t - W0) / (st * (steps.length - 1 || 1)));
        const wi = walk * (samp.length - 1);
        const reached = (i: number) => (steps.length === 1 ? t > W0 : wi >= seg[i] - 0.5);
        const nr = Math.min(44 * u, (tall ? (Y1 - Y0) / ns : W * 0.76 / ns) * 0.22);
        steps.forEach(([a, b], i) => {
          const [x, y] = pts[i];
          const on = reached(i);
          const k = back((t - 0.6 - i * 0.12) / 0.4);
          if (k <= 0) return;
          const c = col(i);
          ctx.save();
          ctx.translate(x, y);
          const pop = on ? 1 + 0.15 * Math.max(0, 1 - Math.abs(wi - seg[i]) / 20) : 1;
          ctx.scale(k * pop, k * pop);
          blobC(0, 0, nr, on ? c : mix(fg, bg, 0.7));
          ctx.lineWidth = 8 * u;
          ctx.strokeStyle = bg;
          ctx.beginPath();
          ctx.arc(0, 0, nr, 0, Math.PI * 2);
          ctx.stroke();
          txt(String(i + 1), 0, 3 * u, nr, ink, 'center', 'middle', 900);
          ctx.restore();
          // 說明牌
          const ck = back((t - W0 - (steps.length > 1 ? (seg[i] / (samp.length - 1)) * st * (steps.length - 1) : 0) - 0.1) / 0.45);
          if (ck <= 0) return;
          const cw = tall ? W * 0.44 : Math.min(W * 0.76 / ns * 1.05, 340 * u);
          const hs = 44 * u;
          const ds = 28 * u;
          const fa = fit(a, 900, hs, cw - 40 * u, 1, 28 * u);
          const fb = b ? fit(b, 700, ds, cw - 40 * u, 2, 20 * u) : { size: ds, lines: [] as string[] };
          const ch = 34 * u + fa.size * 1.1 + fb.lines.length * fb.size * 1.3 + 10 * u;
          let bx: number;
          let by: number;
          if (tall) {
            bx = x < W / 2 ? x + nr + 30 * u + cw / 2 : x - nr - 30 * u - cw / 2;
            by = y;
          } else {
            const nb = [pts[i - 1], pts[i + 1]].filter(Boolean).map((p) => p[1]);
            const avg = nb.length ? nb.reduce((p, q) => p + q, 0) / nb.length : y + 1;
            const up = y < avg;
            bx = Math.max(X0 + cw / 2, Math.min(X1 - cw / 2, x));
            const place = (u2: boolean) => Math.max(Y0 + ch / 2, Math.min(Y1 - ch / 2, u2 ? y - nr - 30 * u - ch / 2 : y + nr + 30 * u + ch / 2));
            const hit = (yy: number) => Math.abs(yy - y) < ch / 2 + nr + 10 * u;
            by = place(up);
            if (hit(by) && !hit(place(!up))) by = place(!up);
          }
          ctx.save();
          ctx.translate(bx, by);
          ctx.scale(ck, ck);
          rrect(-cw / 2, -ch / 2, cw, ch, 20 * u);
          ctx.fillStyle = mix(fg, bg, 0.87);
          ctx.fill();
          ctx.lineWidth = 4 * u;
          ctx.strokeStyle = c;
          ctx.stroke();
          let ty = -ch / 2 + 17 * u + fa.size * 0.55;
          txt(fa.lines[0] || a, 0, ty, fa.size, fg, 'center', 'middle', 900, cw - 30 * u);
          ty += fa.size * 0.55 + fb.size * 0.85;
          fb.lines.forEach((ln) => {
            txt(ln, 0, ty, fb.size, mu2, 'center', 'middle', 700, cw - 30 * u);
            ty += fb.size * 1.3;
          });
          ctx.restore();
        });
        // 行人
        if (t > W0 - 0.2 && samp.length > 1) {
          const p = samp[Math.min(samp.length - 1, Math.round(wi))];
          ctx.globalAlpha = clamp((t - W0 + 0.2) / 0.2) * (1 - clamp((t - W0 - st * (steps.length - 1) - 0.3) / 0.4));
          blobC(p[0], p[1], 22 * u, fg);
          blobC(p[0], p[1], 9 * u, col(0));
          ctx.globalAlpha = 1;
        }
        L = W0 + st * (steps.length - 1) + 0.6 + 2.6;
      }
    }
    function blobC(x: number, y: number, r: number, c: string) {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    function ring(x: number, y: number, r0: number, r1: number, a0: number, a1: number, c: string) {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, r1, a0, a1);
      ctx.arc(x, y, r0, a1, a0, true);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = bg;
      ctx.lineWidth = S * 0.004;
      ctx.stroke();
    }
    return Math.max(5, L);
  };
  return { parse, draw };
};

(globalThis as unknown as { MA_CHART: unknown }).MA_CHART = chartRenderer();

export const CHART_GLOBALS = `window.MA_CHART=${fnSource(chartRenderer)}();`;
registerEngine('chart', CHART_GLOBALS);
