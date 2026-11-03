import type { Fx } from '../types';

// 2026-11-03 新增：#687 花紋筆畫作字（canvas，16:9／9:16 自動排版）
// 筆順資料沿用 #684：public/strokes/<碼位>.json（hanzi-writer-data，Arphic Public License），站上沒有的字抓 jsDelivr，
// 快取在 globalThis.MA_STROKES＋localStorage，匯出 HTML 由 globals 內嵌。指定的一筆不畫，改成花紋沿中線一顆顆長出。
// 所有常數都放在 run 內：匯出 HTML 只序列化 run。

type Stroke = { s: string[]; m: number[][][] };
const G = globalThis as unknown as { MA_STROKES?: Record<string, Stroke | 0> };

export const fx1103: Fx[] = [
  {
    id: 'pattern-stroke',
    no: 687,
    cat: 'kinetic',
    zh: '花紋筆畫作字',
    en: 'Pattern-Stroke Kanji',
    desc: '字的其中一筆換成花紋，捷運站點、屋瓦、鱗片沿筆畫一顆顆長出',
    tags: ['作字', '筆畫', '地名', '標題', '捷運'],
    tone: 'ink',
    sample: ['林口', '@stroke=last;char=0;motif=mrt;pal=yellow;sub=LINKOU · 機捷 A7'],
    hint: '1–4 個字 / @設定：stroke（要換的筆畫：last 最後一筆｜longest 最長一筆｜數字＝第幾筆，0 起算）、char（第幾個字，0 起算）、motif（mrt 捷運｜tile 屋瓦｜scale 鱗片｜brick 磚塊｜dot 圓點）、count（花紋數量，0＝自動）、speed（生長速度倍率）、pal（yellow 黃｜mint 薄荷｜night 深藍｜paper 米白）、c1／c2（花紋兩色）、sub（下方小字）、bg（solid｜none 透明）。筆畫資料：Make Me a Hanzi／hanzi-writer-data（Arphic Public License），字形為楷書、筆順依大陸規範；缺字改用字型，花紋沿字下方的弧線長出。',
    duration: 6,
    preferredRatio: '16:9',
    added: '2026-11-03',
    motion: '平塗色底上一到四個楷書大字：其他筆畫依筆順一筆筆淡入成實心墨色，被指定的那一筆先留淡淡的影子，接著花紋沿著這一筆的中線一顆一顆彈出長成：捷運是紅色粗線跟著小列車頭往前延伸、白色站點一站站彈出；屋瓦是兩色半圓瓦片一片片疊上；鱗片是交錯的半圓鱗；磚塊是錯縫磚；圓點是大小交替的圓。長完後下方小字淡入，停住後循環。16:9 字橫排，9:16 兩字以上上下疊。',
    motionEn: 'One to four large regular-script characters on a flat colour field: the other strokes fade in as solid ink in stroke order, while the chosen stroke shows only a faint ghost, then a pattern grows along that stroke\'s centre line one motif at a time: for the metro a thick red line extends behind a small train head as white stations pop in; roof tiles stack as two-tone half-discs; scales as offset half-circles; bricks in running bond; dots alternating in size. A small subtitle fades in below, holds and loops. Characters sit in a row in 16:9 and stack vertically in 9:16.',
    css: `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    html: () => `<canvas></canvas>`,
    get globals() {
      const cache = G.MA_STROKES || {};
      const used = Object.fromEntries(Object.entries(cache).filter(([, v]) => v));
      return Object.keys(used).length ? `window.MA_STROKES=Object.assign(window.MA_STROKES||{},${JSON.stringify(used).replace(/</g, '\\u003c')});` : '';
    },
    run: (root, w) => {
      type Pt = { x: number; y: number; a: number };
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const o: Record<string, string> = {};
      const words = w.filter((s) => {
        if (!s.startsWith('@')) return true;
        s.slice(1).split(';').forEach((kv) => { const i = kv.indexOf('='); if (i > 0) o[kv.slice(0, i).trim()] = kv.slice(i + 1).trim(); });
        return false;
      });
      const num = (k: string, d: number) => (Number.isFinite(parseFloat(o[k])) ? parseFloat(o[k]) : d);
      const chars = [...(words.join('').replace(/\s+/g, '') || '林口')].slice(0, 4);
      const PAL: Record<string, { bg: string; ink: string; a: string; b: string }> = {
        yellow: { bg: '#F2C200', ink: '#111111', a: '#E3271D', b: '#1E5BD8' },
        mint: { bg: '#9ED4C8', ink: '#111111', a: '#E3271D', b: '#F1EBDD' },
        night: { bg: '#0E1B3D', ink: '#F1EBDD', a: '#F2C200', b: '#E3271D' },
        paper: { bg: '#F1EBDD', ink: '#111111', a: '#E3271D', b: '#1E5BD8' },
      };
      const C = { ...(PAL[o.pal] || PAL.yellow) };
      if (/^#[0-9a-f]{6}$/i.test(o.c1 || '')) C.a = o.c1;
      if (/^#[0-9a-f]{6}$/i.test(o.c2 || '')) C.b = o.c2;
      const MOTIFS = ['mrt', 'tile', 'scale', 'brick', 'dot'];
      const motif = MOTIFS.includes(o.motif) ? o.motif : 'mrt';
      const clear = o.bg === 'none';
      const speed = Math.max(0.3, Math.min(3, num('speed', 1)));
      const charIdx = Math.max(0, Math.min(chars.length - 1, Math.round(num('char', 0))));
      const sub = o.sub ?? '';
      const font = getComputedStyle(root).getPropertyValue('--sans').trim() || '"Noto Sans TC","Noto Sans CJK TC",sans-serif';
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const once = !!(globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE;

      // ── 筆順資料（同 #684）：快取 → 站上 /strokes/ → jsDelivr；抓不到就用字型
      const g = globalThis as unknown as { MA_STROKES?: Record<string, { s: string[]; m: number[][][] } | 0>; MA_STROKE_INDEX?: Promise<string> };
      const cache = (g.MA_STROKES ||= {});
      const han = /\p{Script=Han}/u;
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

      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const vertical = H > W * 1.05 && chars.length > 1;
      const clamp = (p: number) => Math.max(0, Math.min(1, p));
      const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
      const back = (p: number) => { const q = clamp(p) - 1; return 1 + 3.2 * q * q * q + 2.2 * q * q; };

      // 中線：Catmull-Rom 平滑後依弧長重取樣（hanzi 座標 1024，y 向上 → y' = 900 − y）
      const resample = (m: number[][], n: number) => {
        const P = m.map((p) => [p[0], 900 - p[1]]);
        const pts: number[][] = [];
        for (let i = 0; i < P.length - 1; i++) {
          const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || P[i + 1];
          for (let k = 0; k < 16; k++) {
            const t = k / 16, t2 = t * t, t3 = t2 * t;
            pts.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
          }
        }
        pts.push(P[P.length - 1]);
        const L = [0];
        for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        const T = L[L.length - 1] || 1;
        const out: Pt[] = [];
        let j = 0;
        for (let k = 0; k <= n; k++) {
          const d = (T * k) / n;
          while (j < L.length - 2 && L[j + 1] < d) j++;
          const a = pts[j], b = pts[Math.min(j + 1, pts.length - 1)], f = (d - L[j]) / (L[j + 1] - L[j] || 1);
          out.push({ x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, a: Math.atan2(b[1] - a[1], b[0] - a[0]) });
        }
        return { pts: out, len: T };
      };
      const strokeLen = (m: number[][]) => m.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - m[i - 1][0], p[1] - m[i - 1][1]) : 0), 0);

      // 花紋：p＝生長進度 0–1，座標在 1024 字格內
      const drawMotif = (path: { pts: Pt[]; len: number }, p: number) => {
        const n = path.pts.length - 1;
        const auto: Record<string, number> = { mrt: Math.round(path.len / 170) + 2, tile: Math.round(path.len / 75) + 1, scale: Math.round(path.len / 48) + 1, brick: Math.round(path.len / 82) + 1, dot: Math.round(path.len / 62) + 1 };
        const cnt = Math.max(2, Math.min(40, Math.round(num('count', 0)) || auto[motif]));
        const head = p * n;
        const each = (fn: (q: Pt, k: number, s: number) => void) => {
          for (let k = 0; k < cnt; k++) {
            const idx = Math.round((k * n) / (cnt - 1));
            const lp = (head - idx) / (n / cnt) + 1;
            if (lp <= 0) continue;
            fn(path.pts[idx], k, back(Math.min(1, lp)));
          }
        };
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        if (motif === 'mrt') {
          ctx.strokeStyle = C.a; ctx.lineWidth = 96;
          ctx.beginPath();
          for (let i = 0; i <= Math.floor(head); i++) { const q = path.pts[i]; if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
          ctx.stroke();
          each((q, _k, s) => { ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#111111'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(q.x, q.y, 40 * s, 0, 7); ctx.fill(); ctx.stroke(); });
          if (p > 0.02 && p < 1) {
            const q = path.pts[Math.floor(head)];
            ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.a);
            ctx.fillStyle = '#111111'; ctx.beginPath(); ctx.roundRect(-64, -46, 128, 92, 24); ctx.fill();
            ctx.fillStyle = C.b; ctx.fillRect(-44, -28, 34, 26); ctx.fillRect(10, -28, 34, 26);
            ctx.restore();
          }
        } else if (motif === 'tile' || motif === 'scale') {
          const r = motif === 'tile' ? 46 : 34;
          each((q, k, s) => {
            ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.a); ctx.scale(s, s);
            for (const row of [-1, 1]) {
              ctx.fillStyle = (row < 0) === (k % 2 === 0) ? C.a : C.b;
              ctx.strokeStyle = C.ink === '#111111' ? '#111111' : '#05070F'; ctx.lineWidth = 9;
              ctx.beginPath();
              if (motif === 'tile') ctx.arc(0, row * 30, r, 0, Math.PI, false);
              else ctx.arc(row * r * 0.5, row * 22, r, Math.PI * 0.05, Math.PI * 0.95, false);
              ctx.closePath(); ctx.fill(); ctx.stroke();
            }
            ctx.restore();
          });
        } else if (motif === 'brick') {
          each((q, k, s) => {
            ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.a); ctx.scale(s, s);
            ctx.strokeStyle = '#111111'; ctx.lineWidth = 8;
            for (const row of [-1, 1]) { ctx.fillStyle = (k + (row > 0 ? 1 : 0)) % 2 ? C.a : C.b; const ox = row > 0 ? 20 : -20; ctx.beginPath(); ctx.rect(ox - 38, row > 0 ? 0 : -50, 76, 50); ctx.fill(); ctx.stroke(); }
            ctx.restore();
          });
        } else {
          each((q, k, s) => { ctx.fillStyle = k % 2 ? C.b : C.a; ctx.strokeStyle = '#111111'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(q.x, q.y, (k % 2 ? 32 : 48) * s, 0, 7); ctx.fill(); ctx.stroke(); });
        }
      };

      let raf = 0, alive = true;
      const start = () => {
        if (!alive) return;
        // 版面
        const n = chars.length;
        const cs = vertical ? Math.min(W * 0.78, (H * 0.8) / n) : Math.min((W * 0.88) / n, H * 0.66);
        const pos = chars.map((_, i) => vertical
          ? { x: W / 2 - cs / 2, y: H * 0.46 - (n * cs * 0.95) / 2 + i * cs * 0.95 }
          : { x: W / 2 - (n * cs) / 2 + i * cs, y: H * 0.44 - cs / 2 });
        // 每個字的筆畫與要換的那一筆
        const glyphs = chars.map((c, ci) => {
          const d = cache[c];
          if (!d) return { c, d: null as null | { s: string[]; m: number[][][] }, paths: [] as Path2D[], rep: -1, med: null as null | { pts: Pt[]; len: number } };
          let rep = -1;
          if (ci === charIdx) {
            const L = d.m.map(strokeLen);
            rep = o.stroke === 'longest' ? L.indexOf(Math.max(...L)) : /^\d+$/.test(o.stroke || '') ? Math.min(d.s.length - 1, parseInt(o.stroke)) : d.s.length - 1;
          }
          return { c, d, paths: d.s.map((s) => new Path2D(s)), rep, med: rep >= 0 ? resample(d.m[rep], 120) : null };
        });
        const total = glyphs.reduce((a, gl) => a + (gl.d ? gl.d.s.length : 1), 0);
        const inkDur = 1.2, growAt = 1.2, growDur = 2.8 / speed, subAt = growAt + growDur + 0.1;
        const loop = subAt + 1.9;
        const draw = (time: number) => {
          let t = reduced ? loop - 0.5 : once ? Math.min(time, loop - 0.001) : time % loop;
          if (t < 0) t = 0;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, W, H);
          if (!clear) { ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); }
          const fade = t > loop - 0.4 ? clamp((loop - t) / 0.4) : 1;
          ctx.globalAlpha = fade;
          let order = 0;
          const pg = clamp((t - growAt) / growDur);
          glyphs.forEach((gl, gi) => {
            const p0 = pos[gi], sc = cs / 1024;
            ctx.save(); ctx.translate(p0.x, p0.y); ctx.scale(sc, sc);
            if (!gl.d) {
              // 缺字：字型畫，花紋改沿字下方弧線
              const a = clamp((t - (order++ / total) * inkDur) / 0.3);
              ctx.globalAlpha = fade * a; ctx.fillStyle = C.ink; ctx.font = `900 860px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              ctx.fillText(gl.c, 512, 470); ctx.globalAlpha = fade;
              if (gi === charIdx) drawMotif(resample([[120, 20], [512, -40], [904, 20]], 120), ease(pg));
            } else {
              gl.paths.forEach((p, i) => {
                const a = clamp((t - (order++ / total) * inkDur) / 0.3);
                ctx.save(); ctx.translate(0, 900); ctx.scale(1, -1);
                if (i === gl.rep) {
                  if (pg < 1) { ctx.globalAlpha = fade * a * 0.16 * (1 - pg); ctx.fillStyle = C.ink; ctx.fill(p); }
                } else if (a > 0) { ctx.globalAlpha = fade * a; ctx.fillStyle = C.ink; ctx.fill(p); }
                ctx.restore();
              });
              ctx.globalAlpha = fade;
              if (gl.med) drawMotif(gl.med, ease(pg));
            }
            ctx.restore();
          });
          if (sub) {
            ctx.globalAlpha = fade * clamp((t - subAt) / 0.4);
            ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = `900 ${Math.min(W, H) * 0.045}px ${font}`;
            ctx.fillText(sub, W / 2, H * (vertical ? 0.93 : 0.9));
          }
          ctx.globalAlpha = 1;
        };
        const t0 = performance.now();
        const f = (now: number) => { raf = requestAnimationFrame(f); draw((now - t0) / 1000); };
        draw(0);
        raf = requestAnimationFrame(f);
        (root as unknown as { maDraw?: (t: number) => void }).maDraw = draw;
      };
      if (!clear) { ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); }
      if (need.length) Promise.all(need.map(load)).then(start, start);
      else start();
      return () => { alive = false; cancelAnimationFrame(raf); };
    },
  },
];
