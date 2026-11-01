import type { Fx } from '../types';

// 2026-11-01 新增：#684 筆尖光跡手寫字（canvas，16:9／9:16 自動排版）
// 筆順資料：hanzi-writer-data 2.0.1（Make Me a Hanzi，Arphic Public License，全文見 public/licenses/ARPHICPL.txt）。
// 不打包進主程式：執行時只抓用到的字（public/strokes/<碼位>.json，站上沒有的字改抓 jsDelivr），
// 放進 globalThis.MA_STROKES 與 localStorage 快取；匯出 HTML 時 globals 會把快取裡的字內嵌，離線也能播。

type Stroke = { s: string[]; m: number[][][] };
const G = globalThis as unknown as { MA_STROKES?: Record<string, Stroke | 0> };

export const fx1101: Fx[] = [
  {
    id: 'pen-light-trail',
    no: 684,
    cat: 'kinetic',
    zh: '筆尖光跡手寫字',
    en: 'Pen Light-Trail Writing',
    desc: '發光筆尖照真實筆順一筆一筆寫字，白熱光跡冷卻成霓虹、火燼或冰霜',
    tags: ['手寫', '筆順', '霓虹', '片頭', '簽名'],
    tone: 'ink',
    sample: ['持家男子KC', '@tex=neon;speed=1;glow=1;trail=0.25;tip=1;particles=1;bg=night'],
    hint: '要寫的字（中文照筆順寫；英數與缺字改用字型由左往右寫出）/ @設定：tex（neon 霓虹｜ember 火燼｜frost 冰霜）、speed（書寫速度倍率）、glow（外光強度 0–2）、trail（白熱段長度，佔該筆比例）、tip（0／1 筆尖）、particles（0／1 粒子）、bg（night 夜色｜none 透明）、core／body／glowc（自訂白熱色、字身色、外光色）。筆順資料：Make Me a Hanzi／hanzi-writer-data（Arphic Public License），字形為楷書、筆順依大陸規範，偶與台灣標準字體不同。',
    duration: 7,
    preferredRatio: '16:9',
    added: '2026-11-01',
    motion: '深色夜空帶淡淡散景光點；一個亮白筆尖（光點＋十字星芒＋小粒子）從畫面外飛進第一筆起點，照真實筆順沿每一筆的中線前進，把整個筆畫一段段寫出來：剛寫過的那段是白熱色，之後冷卻成主色並帶外發光；筆與筆之間筆尖抬起滑到下一筆起點。英數字用字型由左往右寫出、筆尖沿字中線走。寫完筆尖爆出一圈星芒淡出，整句外光脈動一次後停住。三種質感：霓虹（青白字＋桃紅外光）、火燼（橘黃字＋紅外光，火星往上飄）、冰霜（藍白字＋淡藍霜光、霜粒）。16:9 一行，9:16 超過 3 字拆兩行。',
    motionEn: 'A dark night sky with faint bokeh; a bright white pen tip (glow dot, cross-shaped star rays and tiny particles) flies in to the start of the first stroke and writes each character in its real stroke order, travelling along every stroke\'s centre line: the freshly written segment is white-hot and then cools into the main colour with an outer glow; between strokes the tip lifts and glides to the next start. Latin letters and digits are wiped in left to right with the tip tracking their centre line. When finished the tip bursts into a ring of star rays and fades, and the whole line pulses once before holding. Three textures: neon (cyan-white with magenta glow), ember (orange-gold with red glow and rising sparks), frost (blue-white with pale-blue frost glow and specks). One line in 16:9; more than three characters split into two lines in 9:16.',
    css: `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    html: () => `<canvas></canvas>`,
    // 匯出時把已載入的筆順內嵌（只有實際用過的字）
    get globals() {
      const cache = G.MA_STROKES || {};
      const used = Object.fromEntries(Object.entries(cache).filter(([, v]) => v));
      return Object.keys(used).length ? `window.MA_STROKES=Object.assign(window.MA_STROKES||{},${JSON.stringify(used).replace(/</g, '\\u003c')});` : '';
    },
    run: (root, w) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const o: Record<string, string> = {};
      const words = w.filter((s) => {
        if (!s.startsWith('@')) return true;
        s.slice(1).split(';').forEach((kv) => { const [k, v] = kv.split('='); if (k && v) o[k.trim()] = v.trim(); });
        return false;
      });
      const num = (k: string, d: number) => (Number.isFinite(parseFloat(o[k])) ? parseFloat(o[k]) : d);
      const text = (words.join('').replace(/\s+/g, '') || '持家男子KC').slice(0, 16);
      const TEX: Record<string, { bg: string[]; core: string; body: string; glow: string; glow2: string; tip: string }> = {
        neon: { bg: ['#0a0620', '#1a0b3a'], core: '#ffffff', body: '#7ff6ff', glow: '#ff3fd8', glow2: '#38e8ff', tip: '#ffffff' },
        ember: { bg: ['#140805', '#2a0f06'], core: '#fff3c4', body: '#ffb347', glow: '#ff4a1c', glow2: '#ff8a00', tip: '#fff7d6' },
        frost: { bg: ['#06132b', '#0d2a52'], core: '#ffffff', body: '#d7f3ff', glow: '#3fb4ff', glow2: '#9fe2ff', tip: '#ffffff' },
      };
      const texId = TEX[o.tex] ? o.tex : 'neon';
      const T = { ...TEX[texId] };
      if (o.core) T.core = o.core;
      if (o.body) T.body = o.body;
      if (o.glowc) T.glow = o.glowc;
      const speed = Math.max(0.2, Math.min(4, num('speed', 1)));
      const glowK = Math.max(0, Math.min(2, num('glow', 1)));
      const trail = Math.max(0.05, Math.min(1, num('trail', 0.25)));
      const showTip = num('tip', 1) > 0, parts = num('particles', 1) > 0, night = o.bg !== 'none';
      const font = getComputedStyle(root).getPropertyValue('--sans').trim() || '"Noto Sans TC","Noto Sans CJK TC",sans-serif';
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const once = !!(globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE;

      // ── 筆順資料：快取 → 站上 /strokes/ → jsDelivr；抓不到就退回字型寫法
      const g = globalThis as unknown as { MA_STROKES?: Record<string, { s: string[]; m: number[][][] } | 0>; MA_STROKE_INDEX?: Promise<string> };
      const cache = (g.MA_STROKES ||= {});
      const han = /\p{Script=Han}/u;
      const chars = [...text];
      const need = [...new Set(chars.filter((c) => han.test(c) && !(c in cache)))];
      const site = location.protocol.startsWith('http') ? '' : 'https://motion.leichthub.com';
      const getJson = (u: string) => fetch(u).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))));
      const load = async (c: string) => {
        try {
          const ls = localStorage.getItem('ma-stroke:' + c);
          if (ls) { cache[c] = JSON.parse(ls); return; }
        } catch { /* 無痕或停用 localStorage */ }
        const idx = await (g.MA_STROKE_INDEX ||= fetch(site + '/strokes/index.txt').then((r) => (r.ok ? r.text() : '')).catch(() => ''));
        const urls = [
          ...(idx.includes(c) ? [`${site}/strokes/${c.codePointAt(0)!.toString(16)}.json`] : []),
          `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(c)}.json`,
        ];
        for (const u of urls) {
          try {
            const d = await getJson(u);
            const v = { s: d.strokes ?? d.s, m: d.medians ?? d.m };
            if (!Array.isArray(v.s) || !Array.isArray(v.m)) continue;
            cache[c] = v;
            try { localStorage.setItem('ma-stroke:' + c, JSON.stringify(v)); } catch { /* 空間滿就算了 */ }
            return;
          } catch { /* 換下一個來源 */ }
        }
        cache[c] = 0;
      };

      let raf = 0, alive = true;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const mk = (w2: number, h2: number) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w2)); c.height = Math.max(1, Math.ceil(h2)); return c; };

      // 背景（只畫一次）
      const bgc = mk(W, H);
      if (night) {
        const b = bgc.getContext('2d')!;
        const gr = b.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, T.bg[0]); gr.addColorStop(1, T.bg[1]);
        b.fillStyle = gr; b.fillRect(0, 0, W, H);
        let sd = 7;
        const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < 40; i++) {
          const x = rnd() * W, y = rnd() * H, r = (rnd() * 0.03 + 0.005) * Math.min(W, H);
          b.fillStyle = (i % 2 ? T.glow : T.glow2) + '14';
          b.beginPath(); b.arc(x, y, r, 0, 7); b.fill();
        }
      }

      const start = () => {
        if (!alive) return;
        // 版面：16:9 一行；直式超過 3 字拆兩行（優先在中英交界）
        const vertical = W < H;
        let lines = [chars];
        if (vertical && chars.length > 3) {
          let cut = Math.ceil(chars.length / 2);
          for (let k = 1; k < chars.length; k++) if (han.test(chars[k - 1]) !== han.test(chars[k]) && Math.abs(k - chars.length / 2) <= 2) { cut = k; break; }
          lines = [chars.slice(0, cut), chars.slice(cut)];
        }
        const unit = (c: string) => (han.test(c) ? 1 : 0.62);
        const lw = lines.map((l) => l.reduce((a, c) => a + unit(c), 0));
        const cs = Math.min((W * 0.86) / Math.max(...lw), H * (vertical ? 0.2 : 0.42) * (lines.length > 1 ? 1 : 1.1));
        const u = cs / 100;
        type It = { x: number; y: number; c: string; latin?: boolean; path?: Path2D; m?: number[][]; L: number; t0: number; t1: number };
        const items: It[] = [];
        lines.forEach((ln, li) => {
          let x = W / 2 - (lw[li] * cs) / 2;
          const y = H / 2 + (li - (lines.length - 1) / 2) * cs * 1.12;
          ln.forEach((c) => {
            const wd = unit(c) * cs, cx = x + wd / 2;
            x += wd;
            const d = cache[c];
            if (d) d.s.forEach((s, k) => {
              const m = d.m[k] || [];
              let L = 0;
              for (let j = 1; j < m.length; j++) L += Math.hypot(m[j][0] - m[j - 1][0], m[j][1] - m[j - 1][1]);
              items.push({ x: cx, y, c, path: new Path2D(s), m, L: L + 60, t0: 0, t1: 0 });
            });
            else items.push({ x: cx, y, c, latin: true, L: 700, t0: 0, t1: 0 });
          });
        });
        // 時間：整句約每字 0.8 秒（2–9 秒），每筆依中線長度分配，筆與筆之間抬筆
        const intro = 0.35;
        const budget = Math.max(2, Math.min(9, chars.length * 0.8)) / speed;
        const wsum = items.reduce((a, it) => a + 0.3 + it.L / 1024 + 0.12, 0) || 1;
        let tt = intro;
        for (const it of items) { it.t0 = tt; tt += ((0.3 + it.L / 1024) / wsum) * budget; it.t1 = tt; tt += (0.12 / wsum) * budget; }
        const end = tt, hold = 1.6, fade = 0.5, loop = end + 0.6 + hold + fade;
        const s = cs / 1024;
        const toScreen = (it: It, v: number[]) => [it.x - 512 * s + v[0] * s, it.y + (900 - 512 + 60) * s - v[1] * s];
        const setT = (c: CanvasRenderingContext2D, it: It, ox = 0, oy = 0) => c.setTransform(s, 0, 0, -s, it.x - 512 * s - ox, it.y + (900 - 512 + 60) * s - oy);
        // 寫到一半的筆畫：沿中線截到 p
        const partial = (it: It, p: number) => {
          const m = it.m!, pts = [m[0]];
          let want = p * (it.L - 60), acc = 0;
          for (let j = 1; j < m.length; j++) {
            const a = m[j - 1], b = m[j], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
            if (acc + l >= want) { const f = l ? (want - acc) / l : 0; pts.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); return pts; }
            acc += l; pts.push(b);
          }
          return pts;
        };
        const drawFull = (c: CanvasRenderingContext2D, it: It, ox = 0, oy = 0) => {
          c.save();
          if (it.latin) {
            c.setTransform(1, 0, 0, 1, -ox, -oy);
            c.font = `900 ${cs * 0.82}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillStyle = '#fff'; c.fillText(it.c, it.x, it.y);
          } else {
            setT(c, it, ox, oy);
            c.fillStyle = '#fff'; c.fill(it.path!);
            c.lineWidth = 22; c.strokeStyle = '#fff'; c.lineJoin = 'round'; c.stroke(it.path!);
          }
          c.restore();
        };
        const drawPart = (c: CanvasRenderingContext2D, it: It, p: number, from = 0, ox = 0, oy = 0) => {
          c.save();
          if (it.latin) {
            c.setTransform(1, 0, 0, 1, -ox, -oy);
            const x0 = it.x - cs * 0.35, ww = cs * 0.7;
            c.beginPath(); c.rect(x0 + ww * from, it.y - cs, ww * (p - from), cs * 2); c.clip();
            c.font = `900 ${cs * 0.82}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillStyle = '#fff'; c.fillText(it.c, it.x, it.y);
          } else {
            const pts = partial(it, p);
            const q = from > 0 ? pts.slice(Math.max(0, Math.floor(pts.length * from) - 1)) : pts;
            setT(c, it, ox, oy);
            c.clip(it.path!);
            c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#fff'; c.lineWidth = 170;
            c.beginPath(); q.forEach((v, j) => (j ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]))); c.stroke();
          }
          c.restore();
        };
        const tipAt = (it: It, p: number): number[] => {
          if (it.latin) return [it.x - cs * 0.35 + cs * 0.7 * p, it.y + Math.sin(p * 9) * cs * 0.18];
          const pts = partial(it, p);
          return toScreen(it, pts[pts.length - 1]);
        };
        // 疊光：在 dst 上用 lighter 疊 tinted blur
        const tint = (src: HTMLCanvasElement, col: string) => {
          const c = mk(src.width, src.height), x = c.getContext('2d')!;
          x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
          return c;
        };
        const glowInto = (dst: CanvasRenderingContext2D, ink: HTMLCanvasElement, dx: number, dy: number, k = 1) => {
          const tg = tint(ink, T.glow), t2 = tint(ink, T.glow2), body = tint(ink, T.body), core = tint(ink, T.core);
          dst.save();
          dst.globalCompositeOperation = 'lighter';
          dst.globalAlpha = Math.min(1, glowK * k);
          dst.filter = `blur(${u * 7}px)`; dst.drawImage(tg, dx, dy);
          dst.filter = `blur(${u * 3}px)`; dst.drawImage(tg, dx, dy);
          dst.globalAlpha = Math.min(1, 0.9 * glowK * k);
          dst.filter = `blur(${u * 1.4}px)`; dst.drawImage(t2, dx, dy);
          dst.restore();
          dst.save(); dst.drawImage(body, dx, dy);
          dst.globalAlpha = 0.55; dst.filter = `blur(${u * 0.5}px)`; dst.drawImage(core, dx, dy);
          dst.restore();
        };
        // 快取：已寫完的筆畫（含光暈）只在完成數變動時重算一次
        const done = mk(W, H), dc = done.getContext('2d')!;
        const doneInk = mk(W, H), di = doneInk.getContext('2d')!;
        let doneN = -1;
        const rebuild = (n: number) => {
          if (n === doneN) return;
          if (n < doneN) { di.clearRect(0, 0, W, H); doneN = 0; }
          for (let k = Math.max(0, doneN); k < n; k++) drawFull(di, items[k]);
          doneN = n;
          dc.clearRect(0, 0, W, H);
          if (n) glowInto(dc, doneInk, 0, 0);
        };
        // 寫到一半那筆：在字格大小的小畫布上算光暈（手機才跑得動）
        const pad = cs * 0.5, cell = mk(cs + pad * 2, cs + pad * 2), cc = cell.getContext('2d')!;
        const hotc = mk(cell.width, cell.height), hc = hotc.getContext('2d')!;
        const cellLayer = mk(cell.width, cell.height), cl = cellLayer.getContext('2d')!;
        let sd = 11;
        const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
        const ease = (p: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, p)), 3);

        const draw = (time: number) => {
          let t = reduced ? end + 0.7 : once ? Math.min(time, loop - fade - 0.001) : time % loop;
          if (t < 0) t = 0;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, W, H);
          if (night) ctx.drawImage(bgc, 0, 0);
          let n = 0;
          while (n < items.length && t >= items[n].t1) n++;
          rebuild(n);
          const fadeA = t > loop - fade ? 1 - (t - (loop - fade)) / fade : 1;
          ctx.globalAlpha = fadeA;
          // 寫完後整句外光脈動一次
          const pulse = t > end ? Math.sin(Math.min(1, (t - end) / 0.8) * Math.PI) : 0;
          ctx.drawImage(done, 0, 0);
          if (pulse > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fadeA * pulse * 0.6; ctx.drawImage(done, 0, 0); ctx.restore(); }
          let tip: number[] | null = null;
          const cur = items[n];
          if (cur && t >= cur.t0) {
            const p = ease((t - cur.t0) / (cur.t1 - cur.t0)) * 0.98 + 0.02 * ((t - cur.t0) / (cur.t1 - cur.t0));
            const ox = cur.x - cs / 2 - pad, oy = cur.y - cs / 2 - pad;
            cc.clearRect(0, 0, cell.width, cell.height);
            drawPart(cc, cur, p, 0, ox, oy);
            cl.clearRect(0, 0, cell.width, cell.height);
            glowInto(cl, cell, 0, 0);
            // 白熱段：最近寫過的 trail 比例
            hc.clearRect(0, 0, cell.width, cell.height);
            drawPart(hc, cur, p, Math.max(0, p - trail) / Math.max(p, 0.001), ox, oy);
            cl.save(); cl.globalCompositeOperation = 'lighter'; cl.filter = `blur(${u * 0.8}px)`; cl.drawImage(tint(hotc, T.core), 0, 0); cl.drawImage(tint(hotc, T.core), 0, 0); cl.restore();
            ctx.drawImage(cellLayer, ox, oy);
            tip = tipAt(cur, p);
          } else if (cur && n > 0) {
            // 抬筆：從上一筆終點滑到下一筆起點
            const prev = items[n - 1], a = tipAt(prev, 1), b = tipAt(cur, 0), f = ease((t - prev.t1) / Math.max(0.001, cur.t0 - prev.t1));
            tip = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
          } else if (cur && n === 0) {
            // 開場：筆尖從右上角外飛進第一筆起點
            const b = tipAt(cur, 0), f = ease(t / intro);
            tip = [W * 1.05 + (b[0] - W * 1.05) * f, -H * 0.05 + (b[1] + H * 0.05) * f];
          }
          ctx.globalAlpha = 1;
          // 筆尖
          const fx = (x: number, y: number, R: number, a: number) => {
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * fadeA;
            const rg = ctx.createRadialGradient(x, y, 0, x, y, R);
            rg.addColorStop(0, T.tip); rg.addColorStop(0.12, T.tip); rg.addColorStop(0.22, T.glow2); rg.addColorStop(0.5, T.glow + '66'); rg.addColorStop(1, T.glow + '00');
            ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
            // 冰霜的星芒加粗，下面再補一顆帶藍光的實心白點，筆尖才看得見
            ctx.strokeStyle = T.tip; ctx.lineWidth = u * (texId === 'frost' ? 0.8 : 0.5);
            for (let k = 0; k < 4; k++) {
              const ang = (k * Math.PI) / 2 + 0.4 + t * 1.5;
              ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * u * 2, y + Math.sin(ang) * u * 2); ctx.lineTo(x + Math.cos(ang) * R * 0.38, y + Math.sin(ang) * R * 0.38); ctx.stroke();
            }
            ctx.restore();
            if (texId === 'frost') {
              ctx.save(); ctx.globalAlpha = a * fadeA; ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#3fb4ff'; ctx.shadowBlur = u * 4;
              ctx.beginPath(); ctx.arc(x, y, u * 1.6, 0, 7); ctx.fill(); ctx.restore();
            }
          };
          if (tip && showTip) {
            fx(tip[0], tip[1], u * 20, 1);
            if (parts) {
              sd = 11 + Math.floor(t * 30);
              ctx.save(); ctx.globalCompositeOperation = 'lighter';
              for (let i = 0; i < 18; i++) {
                const ang = rnd() * 6.28, r = rnd() * u * 10, yy = texId === 'ember' ? -rnd() * u * 10 : 0;
                ctx.fillStyle = i % 2 ? T.tip : T.glow2; ctx.globalAlpha = (rnd() * 0.8 + 0.2) * fadeA;
                ctx.beginPath(); ctx.arc(tip[0] + Math.cos(ang) * r, tip[1] + Math.sin(ang) * r + yy, u * (texId === 'frost' ? 0.55 : 0.35), 0, 7); ctx.fill();
              }
              ctx.restore();
            }
          }
          // 收尾：最後一筆終點爆出星芒並淡出
          if (showTip && items.length && t > end - 0.08 && t < end + 0.6) {
            const e = (t - end + 0.08) / 0.68, last = items[items.length - 1], p0 = tipAt(last, 1);
            fx(p0[0], p0[1], u * (20 + e * 26), 1 - e);
          }
        };
        const t0 = performance.now();
        const f = (now: number) => { raf = requestAnimationFrame(f); draw((now - t0) / 1000); };
        raf = requestAnimationFrame(f);
        (root as unknown as { maDraw?: (t: number) => void }).maDraw = draw;
      };
      if (night) ctx.drawImage(bgc, 0, 0);
      if (need.length) Promise.all(need.map(load)).then(start, start);
      else start();
      return () => { alive = false; cancelAnimationFrame(raf); };
    },
  },
];
