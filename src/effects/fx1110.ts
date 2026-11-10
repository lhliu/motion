import type { Fx } from '../types';

// 2026-11-10 新增：#693 交疊鏤空字、#694 膠囊色條掃場＋斜紋字卡。
// 匯出 HTML 只帶 run，常數與 helper 全部寫在 run 裡。

const CANVAS_CSS = `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;

export const fx1110: Fx[] = [
  {
    id: 'overlap-knockout',
    no: 693,
    cat: 'kinetic',
    zh: '交疊鏤空字',
    en: 'Overlapping Knockout Letters',
    desc: '粗體字距縮緊互相壓住，交疊處留一道細縫，像貼紙疊在一起',
    tags: ['標題', '片頭', '地名'],
    tone: 'paper',
    sample: ['新莊副都心', 'XINZHUANG', '@pal=orange;stack=alt;bg=solid'],
    hint: '第一行＝大字（建議 2–8 字）／第二行＝小字（選填）／ @設定：pal（orange 橘字米底｜kc 藍字米底｜magenta 洋紅｜night 深底橘字）、c1／c2（自訂字色／縫與底色）、stack（alt 左右交錯，預設｜ltr 右壓左｜rtl 左壓右）、overlap（交疊比例，佔相鄰兩字實際筆畫寬；不填依字數自動，約 15–24%）、gap（縫寬，字高倍數，預設 0.055）、speed、bg（solid｜none 透明：字外全透明，縫與外框留米色貼紙邊）。',
    duration: 3.6,
    preferredRatio: '16:9',
    added: '2026-11-10',
    motion: '粗黑體大字把字距縮緊，字一個個從右邊滑進來壓在前一個字上面，交疊處留下一道背景色（或米色貼紙邊）細縫，像貼紙疊在一起；到位時輕壓一下。預設左右交錯疊放（奇數字在上、偶數字在下）。2 字交疊較深（約兩字筆畫寬的 24%），字數多會略減但仍明顯交疊，避免只碰到邊或筆畫糊在一起。可改成右邊壓左邊或左邊壓右邊，也可換成透明背景（縫留貼紙邊，不挖穿）。16:9 與 9:16 都是單行置中。',
    motionEn: 'Heavy type with tight tracking slides in from the right, one glyph at a time, each pressing onto the previous with a paper-coloured (or cream sticker) gap at the overlaps, like stacked stickers, and a slight squash on landing. Default stacking alternates front and back. Two-character titles overlap more deeply (about 24% of ink width); longer titles ease off moderately but every pair still clearly overlaps. Left-to-right or right-to-left stacking and a transparent background (sticker-edge gap, not punched through) are available. One centered line in both 16:9 and 9:16.',
    css: CANVAS_CSS,
    html: () => `<canvas></canvas>`,
    run: (root, w) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const o: Record<string, string> = {};
      const words = w.filter((s) => {
        if (!s.startsWith('@')) return true;
        s.slice(1).split(';').forEach((kv) => { const i = kv.indexOf('='); if (i > 0) o[kv.slice(0, i).trim()] = kv.slice(i + 1).trim(); });
        return false;
      }).map((s) => s.trim()).filter(Boolean);
      const text = (words[0] || '新莊副都心').replace(/\s/g, '');
      const sub = words[1] || '';
      const PALS: Record<string, { paper: string; ink: string; gap: string; sub: string }> = {
        orange: { paper: '#F5F1E8', ink: '#E23A1F', gap: '#F5F1E8', sub: '#1F3A5F' },
        kc: { paper: '#F4EFE6', ink: '#1F3A5F', gap: '#F4EFE6', sub: '#F28C28' },
        magenta: { paper: '#FFF7FA', ink: '#E0186A', gap: '#FFF7FA', sub: '#241016' },
        night: { paper: '#12161E', ink: '#FF5A36', gap: '#12161E', sub: '#F5F1E8' },
      };
      const pal = PALS[o.pal || ''] || PALS.orange;
      const ink = /^#[0-9a-f]{6}$/i.test(o.c1 || '') ? o.c1 : pal.ink;
      const gapCol = /^#[0-9a-f]{6}$/i.test(o.c2 || '') ? o.c2 : pal.gap;
      const stack = o.stack === 'ltr' || o.stack === 'rtl' ? o.stack : 'alt';
      const clear = o.bg === 'none';
      const sticker = '#F5F0E6';
      const num = (k: string, d: number) => (Number.isFinite(parseFloat(o[k])) ? parseFloat(o[k]) : d);
      const userOverlap = o.overlap !== undefined && o.overlap !== '' ? num('overlap', 0.18) : null;
      const gapEm = Math.max(0.02, Math.min(0.14, num('gap', 0.055)));
      const speed = Math.max(0.3, Math.min(3, num('speed', 1)));
      const intro = 0.28, stagger = 0.2;
      const font = getComputedStyle(root).getPropertyValue('--sans').trim() || '"Noto Sans TC","Noto Sans CJK TC",sans-serif';
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const once = !!(globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const chars = [...text];
      const n = chars.length || 1;
      // 交疊以實際筆畫（ink）寬度計，不用 advance：中文字左右各有約 8–10% 留白，用 advance 算會只剛好碰到。
      // 預設交疊約為相鄰兩字「實際筆畫寬」的 15–24%（2 字較深，長詞略減但仍明顯交疊）。
      const autoOverlap = (k: number) => (k <= 2 ? 0.24 : k === 3 ? 0.22 : k <= 5 ? 0.2 : k <= 7 ? 0.18 : 0.15);
      const overlap = Math.max(0, Math.min(0.4, userOverlap != null ? userOverlap : autoOverlap(n)));
      const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const layout = (size: number) => {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 ${size}px ${font}`;
        const ink = chars.map((ch) => {
          const m = ctx.measureText(ch);
          const l = Number.isFinite(m.actualBoundingBoxLeft) ? m.actualBoundingBoxLeft : m.width / 2;
          const r = Number.isFinite(m.actualBoundingBoxRight) ? m.actualBoundingBoxRight : m.width / 2;
          const w = Math.max(1, l + r);
          // 極端字型若沒給 ink box，退回 advance，避免排版崩潰
          return w < m.width * 0.35 ? { l: m.width / 2, r: m.width / 2, w: Math.max(1, m.width) } : { l, r, w };
        });
        const cx: number[] = [];
        let edge = 0;
        for (let i = 0; i < n; i++) {
          if (i === 0) cx.push(ink[0].l);
          else {
            const ov = overlap * Math.min(ink[i - 1].w, ink[i].w);
            cx.push(edge - ov + ink[i].l);
          }
          edge = cx[i] + ink[i].r;
        }
        return { cx, span: edge, ink };
      };
      const probe = layout(100);
      const gapPad = 2 * gapEm; // 外框貼紙邊
      let fs = Math.min((W * 0.86) / (probe.span / 100 + gapPad), H * (sub ? 0.52 : 0.6));
      if (n <= 2) fs = Math.min(fs, H * 0.58);
      const L = layout(fs);
      const shift = (W - L.span) / 2;
      const xs = L.cx.map((c) => c + shift);
      const y0 = H * (sub ? 0.48 : 0.5);
      const order = (() => {
        const idx = [...Array(n).keys()];
        if (stack === 'rtl') return idx.slice().reverse();
        if (stack === 'ltr') return idx;
        return idx.filter((i) => i % 2 === 0).concat(idx.filter((i) => i % 2 === 1));
      })();
      const arrive = (n - 1) * stagger + intro;
      const loop = Math.max(3.6, arrive + 1.6) / speed;
      const strokeCol = clear ? sticker : gapCol;
      const draw = (time: number) => {
        let t = reduced ? loop - 0.4 : once ? Math.min(time, loop - 0.001) : time % loop;
        if (t < 0) t = 0;
        const fade = 1; // 結尾停在完成畫面，不淡出（Combo 換段不會閃空白）
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W, H);
        if (!clear) { ctx.fillStyle = pal.paper; ctx.fillRect(0, 0, W, H); }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 ${fs}px ${font}`;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.miterLimit = 2;
        const gap = fs * gapEm;
        const slide = fs * 0.85;
        ctx.globalAlpha = fade;
        for (const i of order) {
          const p = clamp(((t * speed) - i * stagger) / intro);
          if (p <= 0) continue;
          const e = easeOutCubic(p);
          const x = xs[i] + (1 - e) * slide;
          let scaleX = 1, scaleY = 1;
          if (p >= 0.72) {
            const k = clamp((p - 0.72) / 0.28);
            const bump = Math.sin(k * Math.PI) * 0.1 * (1 - k * 0.25);
            scaleX = 1 + bump;
            scaleY = 1 - bump * 0.5;
          }
          ctx.save();
          ctx.translate(x, y0);
          ctx.rotate((1 - e) * -0.05);
          ctx.scale(scaleX, scaleY);
          ctx.globalAlpha = fade * clamp(p / 0.12);
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = gap * 2;
          ctx.strokeText(chars[i], 0, 0);
          ctx.fillStyle = ink;
          ctx.fillText(chars[i], 0, 0);
          ctx.restore();
        }
        if (sub) {
          const appear = clamp((t * speed - (n * stagger + intro * 0.6)) / 0.35);
          if (appear > 0) {
            const sfs = Math.min(fs * 0.18, H * 0.045);
            ctx.save();
            ctx.globalAlpha = fade * easeOutCubic(appear);
            ctx.font = `700 ${sfs}px ${font}`;
            ctx.fillStyle = pal.sub;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(sub, W / 2, y0 + fs * 0.58);
            ctx.restore();
          }
        }
        ctx.globalAlpha = 1;
      };
      let raf = 0;
      const t0 = performance.now();
      const f = (now: number) => { raf = requestAnimationFrame(f); draw((now - t0) / 1000); };
      draw(0);
      raf = requestAnimationFrame(f);
      (root as unknown as { maDraw?: (t: number) => void }).maDraw = draw;
      return () => { cancelAnimationFrame(raf); };
    },
  },
  {
    id: 'capsule-wipe',
    no: 694,
    cat: 'twipe',
    zh: '膠囊色條掃場＋斜紋字卡',
    en: 'Capsule Bar Sweep + Stripe Title Card',
    desc: '圓頭色條左右交錯掃過畫面，掀開斜紋背景、大圓與立體標題的綜藝字卡',
    tags: ['轉場', '換段落', '字卡'],
    tone: 'ink',
    sample: ['第二站', '交通', '@pal=kc;bars=5;angle=28;card=1;bg=solid'],
    hint: '第一行＝小標（如「第二站」）／第二行＝大標題（如「交通」；若只寫一行就當大標題）／ @設定：pal（kc 頻道藍橘，預設｜show 綜藝黃紫橘）、c1–c5（自訂色條／斜紋色）、bars（3–8，預設 5）、angle（斜紋角度，預設 28）、card（1 收尾出字卡，預設｜0 只做掃場）、speed、bg（solid｜none 透明：色條與弧線以外全透明，適合疊在剪接點；card=1 時字卡本身不透明）。',
    duration: 3.2,
    preferredRatio: '16:9',
    added: '2026-11-10',
    motion: '深藍底上，五條不同粗細、兩頭圓的色條（深藍／橘／米／金）左右交錯掃入，伴隨幾道弧線，蓋滿畫面；停一下後色條同方向掃走，底下露出斜紋背景，中間大圓放大彈出，立體標題壓上，上方膠囊小標。預設用頻道藍橘，可換成綜藝黃紫橘，也可只做掃場或改成透明轉場。16:9 與 9:16 都用橫向色條。',
    motionEn: 'Rounded capsule colour bars in navy, orange, cream and gold sweep in from alternating sides with a few arc strokes until they cover the frame; after a short hold they exit the same way, revealing a diagonal-stripe field, a circle that springs up, an extruded title and a small pill kicker. Default palette is the channel navy and orange; a brighter variety-show palette, a bars-only wipe, and a transparent overlay are available. Horizontal capsules in both 16:9 and 9:16.',
    css: CANVAS_CSS,
    html: () => `<canvas></canvas>`,
    run: (root, w) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const o: Record<string, string> = {};
      const words = w.filter((s) => {
        if (!s.startsWith('@')) return true;
        s.slice(1).split(';').forEach((kv) => { const i = kv.indexOf('='); if (i > 0) o[kv.slice(0, i).trim()] = kv.slice(i + 1).trim(); });
        return false;
      }).map((s) => s.trim()).filter(Boolean);
      const kicker = words.length >= 2 ? words[0] : '';
      const title = (words.length >= 2 ? words[1] : (words[0] || '交通'));
      const num = (k: string, d: number) => (Number.isFinite(parseFloat(o[k])) ? parseFloat(o[k]) : d);
      const hex = (k: string, d: string) => (/^#[0-9a-f]{6}$/i.test(o[k] || '') ? o[k] : d);
      type Pal = { paper: string; colors: string[]; stripeA: string; stripeB: string; circle: string; circleEdge: string; face: string; extrude: string; banner: string; bannerInk: string; under: string };
      const PALS: Record<string, Pal> = {
        kc: {
          paper: '#F4EFE6', colors: ['#1F3A5F', '#F28C28', '#F4EFE6', '#163055', '#E8A03C'],
          stripeA: '#F28C28', stripeB: '#1F3A5F', circle: '#F6D37A', circleEdge: '#E8A03C',
          face: '#F8F3EA', extrude: '#163055', banner: '#1F3A5F', bannerInk: '#F8F3EA', under: '#0E1A2C',
        },
        show: {
          paper: '#FFF8E8', colors: ['#FF6B2C', '#FFE14A', '#2EC4B6', '#1B1B1B', '#FF3B5C'],
          stripeA: '#FF6B2C', stripeB: '#3B1F8A', circle: '#FFE14A', circleEdge: '#F0C020',
          face: '#FFFDF5', extrude: '#2A1060', banner: '#3B1F8A', bannerInk: '#FFF8E8', under: '#160E28',
        },
      };
      const C = PALS[o.pal || ''] || PALS.kc;
      C.colors = [hex('c1', C.colors[0]), hex('c2', C.colors[1]), hex('c3', C.colors[2]), hex('c4', C.colors[3]), hex('c5', C.colors[4])];
      C.stripeA = hex('c2', C.stripeA);
      C.stripeB = hex('c1', C.stripeB);
      const nBars = Math.max(3, Math.min(8, Math.round(num('bars', 5))));
      const angleDeg = num('angle', 28);
      const showCard = o.card !== '0';
      const clear = o.bg === 'none';
      const speed = Math.max(0.3, Math.min(3, num('speed', 1)));
      const font = getComputedStyle(root).getPropertyValue('--sans').trim() || '"Noto Sans TC","Noto Sans CJK TC",sans-serif';
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const once = !!(globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeOutBack = (t: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
      const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
        r = Math.max(0, Math.min(r, w / 2, h / 2));
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
      };
      const capsule = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number) => {
        c.save();
        c.translate(x, y);
        c.rotate(rot);
        rr(c, -w / 2, -h / 2, w, h, h / 2);
        c.fill();
        c.restore();
      };
      const stripes = (c: CanvasRenderingContext2D, w: number, h: number, a: string, b: string, ang: number, pitch: number) => {
        c.save();
        c.beginPath(); c.rect(0, 0, w, h); c.clip();
        c.translate(w / 2, h / 2);
        c.rotate(ang);
        const diag = Math.hypot(w, h) * 1.2;
        const n = Math.ceil(diag / pitch) + 2;
        for (let i = -n; i <= n; i++) {
          c.fillStyle = i % 2 === 0 ? a : b;
          c.fillRect(-diag, i * pitch - pitch * n / 2, diag * 2, pitch + 0.6);
        }
        c.restore();
      };
      const cover = H * 1.12;
      const base = cover / (nBars * 0.72);
      const startY = -H * 0.06;
      const bars = Array.from({ length: nBars }, (_, i) => ({
        y: startY + (i + 0.5) * (cover / nBars),
        h: base * (i % 3 === 1 ? 1.12 : i % 3 === 2 ? 0.9 : 1),
        fromLeft: i % 2 === 0,
        rot: (i % 2 === 0 ? -1 : 1) * (0.6 + i * 0.12) * Math.PI / 180,
        color: C.colors[i % C.colors.length],
        delay: i * 0.06,
        len: Math.hypot(W, H) * 1.4,
      }));
      const minS = Math.min(W, H);
      const arcs = [
        { cx: W * 0.12, cy: H * 0.18, r: minS * 0.42, lw: minS * 0.045, a0: -0.4, a1: 1.1, color: C.colors[1], delay: 0.12 },
        { cx: W * 0.88, cy: H * 0.82, r: minS * 0.38, lw: minS * 0.032, a0: 2.3, a1: 4.0, color: C.colors[4], delay: 0.22 },
        { cx: W * 0.7, cy: H * 0.12, r: minS * 0.28, lw: minS * 0.02, a0: 0.2, a1: 1.8, color: C.paper, delay: 0.3 },
      ];
      const barX = (bar: typeof bars[0], t: number) => {
        const local = t - bar.delay;
        const inDur = 0.7, hold = 0.33, outDur = 0.7, tIn = 0.1;
        let u: number;
        if (local < tIn) u = 0;
        else if (local < tIn + inDur) u = easeInOut((local - tIn) / inDur) * 0.52;
        else if (local < tIn + inDur + hold) u = 0.52;
        else if (local < tIn + inDur + hold + outDur) u = 0.52 + easeInOut((local - tIn - inDur - hold) / outDur) * 0.48;
        else u = 1;
        const start = bar.fromLeft ? -bar.len * 0.5 - W * 0.1 : W + bar.len * 0.5 + W * 0.1;
        const end = bar.fromLeft ? W + bar.len * 0.5 + W * 0.1 : -bar.len * 0.5 - W * 0.1;
        return lerp(start, end, u);
      };
      const loop = 3.2 / speed;
      const draw = (time: number) => {
        let t = reduced ? loop - 0.35 : once ? Math.min(time, loop - 0.001) : time % loop;
        if (t < 0) t = 0;
        const ts = t * speed;
        const fade = 1; // 結尾停在字卡完成畫面
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W, H);
        if (!clear) { ctx.fillStyle = C.under; ctx.fillRect(0, 0, W, H); }
        const cardVis = showCard ? clamp((ts - 1.02) / 0.18) : 0;
        if (showCard && cardVis > 0 && !(clear && cardVis <= 0)) {
          ctx.save();
          ctx.globalAlpha = clear ? cardVis : 1;
          stripes(ctx, W, H, C.stripeA, C.stripeB, angleDeg * Math.PI / 180, minS * 0.055);
          ctx.restore();
        }
        const circleT = showCard ? clamp((ts - 1.2) / 0.4) : 0;
        const titleT = showCard ? clamp((ts - 1.85) / 0.38) : 0;
        const rMax = minS * (H > W ? 0.36 : 0.42);
        if (circleT > 0) {
          const e = easeOutBack(Math.min(circleT, 1));
          const r = rMax * Math.min(e, 1.04);
          ctx.save();
          ctx.globalAlpha = fade;
          ctx.translate(W / 2, H / 2 + (H > W ? -H * 0.02 : 0));
          ctx.beginPath(); ctx.arc(0, 0, r * 1.012, 0, Math.PI * 2); ctx.fillStyle = C.circleEdge; ctx.fill();
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = C.circle; ctx.fill();
          ctx.save();
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
          ctx.beginPath(); ctx.arc(-r * 0.22, -r * 0.28, r * 0.85, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fill();
          ctx.restore();
          ctx.restore();
        }
        if (titleT > 0) {
          const e = easeOutBack(Math.min(titleT, 1));
          let tfs = Math.min(minS * (title.length <= 3 ? 0.28 : title.length <= 4 ? 0.22 : 0.18), W * 0.2);
          ctx.font = `900 ${tfs}px ${font}`;
          const extra = Math.max(8, tfs * 0.08) * 2 + Math.max(4, tfs * 0.035) * 2;
          const rawW = ctx.measureText(title).width + extra;
          const maxW = W * 0.86;
          if (rawW > maxW) tfs *= maxW / rawW;
          const kfs = Math.min(minS * 0.055, tfs * 0.28);
          ctx.save();
          ctx.translate(W / 2, H / 2 + (H > W ? -H * 0.02 : 0));
          ctx.scale(Math.min(e, 1), Math.min(e, 1));
          ctx.globalAlpha = fade * clamp(titleT / 0.35);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (kicker) {
            ctx.font = `700 ${kfs}px ${font}`;
            const tw = ctx.measureText(kicker).width;
            const bw = tw + kfs * 1.4, bh = kfs * 1.55, by = -tfs * 0.72;
            ctx.fillStyle = C.banner;
            rr(ctx, -bw / 2, by - bh / 2, bw, bh, bh / 2); ctx.fill();
            ctx.fillStyle = C.bannerInk; ctx.fillText(kicker, 0, by);
          }
          ctx.font = `900 ${tfs}px ${font}`;
          ctx.lineJoin = 'round';
          const depth = Math.max(8, tfs * 0.08);
          const layers = Math.max(8, Math.round(depth));
          for (let i = layers; i >= 1; i--) {
            const off = (i / layers) * depth;
            ctx.fillStyle = C.extrude;
            ctx.fillText(title, off * 0.85, off);
          }
          ctx.strokeStyle = C.extrude;
          ctx.lineWidth = Math.max(4, tfs * 0.035);
          ctx.strokeText(title, 0, 0);
          ctx.fillStyle = C.face;
          ctx.fillText(title, 0, 0);
          ctx.restore();
        }
        ctx.globalAlpha = fade;
        for (const bar of bars) {
          ctx.fillStyle = bar.color;
          capsule(ctx, barX(bar, ts), bar.y, bar.len, bar.h, bar.rot);
        }
        for (const a of arcs) {
          const local = ts - a.delay;
          const p = clamp((local - 0.08) / 0.5);
          const afade = local > 1.15 ? 1 - clamp((local - 1.15) / 0.55) : 1;
          if (p <= 0 || afade <= 0) continue;
          const vis = easeOutCubic(p);
          ctx.save();
          ctx.strokeStyle = a.color;
          ctx.lineWidth = a.lw;
          ctx.lineCap = 'round';
          ctx.globalAlpha = fade * afade;
          ctx.beginPath();
          const mid = (a.a0 + a.a1) / 2, span = (a.a1 - a.a0) / 2;
          ctx.arc(a.cx, a.cy, a.r, mid - span * vis, mid + span * vis);
          ctx.stroke();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      };
      let raf = 0;
      const t0 = performance.now();
      const f = (now: number) => { raf = requestAnimationFrame(f); draw((now - t0) / 1000); };
      draw(0);
      raf = requestAnimationFrame(f);
      (root as unknown as { maDraw?: (t: number) => void }).maDraw = draw;
      return () => { cancelAnimationFrame(raf); };
    },
  },
];
