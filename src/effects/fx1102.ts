import type { Fx } from '../types';

// 2026-11-02 新增：#686 音ハメ節拍海報字卡（canvas，16:9／9:16 自動排版）
// 不做音訊分析：輸入 BPM＋offset，每一拍硬切大字、底色、數字塊、進度條與圖形列。
// 每一幀只由時間 t 算出（無狀態），任意 seek、60fps 與 PNG 序列輸出結果一致。

export const fx1102: Fx[] = [
  {
    id: 'beat-poster',
    no: 686,
    cat: 'kinetic',
    zh: '節拍海報字卡',
    en: 'Beat-Synced Poster Type',
    desc: '瑞士海報風大色塊，照 BPM 每拍硬切大字、底色、大數字與進度條',
    tags: ['節拍', '卡點', '海報', '數字', '倒數', '開場'],
    tone: 'ink',
    sample: ['新莊||NEW TAIPEI', '每坪||PRICE / PING', '68萬|68|NT$ 680,000', '通勤||COMMUTE', '23 分|23|MINUTES', '買嗎？||BUY OR WAIT', '@bpm=128;offset=0;div=1;pal=swiss;bg=solid;hit=1;gentle=0'],
    hint: '每行一拍：大字|數字|小字（數字留空自動用拍序 01、02…）/ @設定：bpm（60–200）、offset（第一拍起始秒數）、div（1 每拍換、2 每兩拍換）、beats（拍數，預設＝行數）、pal（swiss 黃紅｜mono 黑白紅｜night 深藍螢光｜kc 藍橘）、c1–c4（自訂主色／強調／紙色／墨色）、bg（solid｜none 透明）、hit（拍點衝擊 0–1）、gentle（1＝底色不換只換數字塊色，減少閃爍）。16:9 左字右數字，9:16 上數字下字。',
    duration: 6,
    preferredRatio: '9:16',
    added: '2026-11-02',
    motion: '瑞士海報風字卡，黃／紅／米白／黑四色大色塊。依輸入 BPM 每一拍硬切：大字換下一句、整張底色換色、色塊裡的超大數字換掉、底部方塊進度條亮一格、圓／方／三角圖形列點亮到目前拍並閃一下；拍點上整張微微放大再回彈。上緣有 BEAT MAP 標頭、BPM 與時間碼。16:9 左側大字、右側數字塊；9:16 上方數字塊、下方大字。可改透明背景疊影片，或只換數字塊顏色的溫和模式。',
    motionEn: 'A Swiss-poster title card in big yellow, red, cream and black colour blocks. On every beat of the entered BPM it hard-cuts: the big word changes, the whole background swaps colour, the huge number in the colour block changes, a block progress bar fills one more cell and a row of circles, squares and triangles lights up to the current beat with a flash; the whole card punches in slightly and springs back on each hit. A BEAT MAP header with BPM and timecode runs along the top. 16:9 puts the word left and the number block right; 9:16 stacks the number block above the word. Optional transparent background, and a gentle mode that only recolours the number block.',
    css: `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`,
    html: () => `<canvas></canvas>`,
    run: (root, w) => {
      type Beat = { w: string; n: string; s: string };
      const PAL: Record<string, string[]> = {
        // [主色, 強調色, 紙色, 墨色]
        swiss: ['#F2C200', '#E3271D', '#F1EBDD', '#111111'],
        mono: ['#111111', '#F1EBDD', '#E3271D', '#8A8A8A'],
        night: ['#0E1B3D', '#D7FF3A', '#F1EBDD', '#05070F'],
        kc: ['#1F3A5F', '#F28C28', '#F6F1E7', '#111111'],
      };
      const lum = (h: string) => { const v = parseInt(h.slice(1), 16); return ((v >> 16) * 0.3 + ((v >> 8) & 255) * 0.59 + (v & 255) * 0.11) / 255; };
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const o: Record<string, string> = {};
      const lines = w.flatMap((s) => s.split('\n')).map((s) => s.trim()).filter((s) => {
        if (!s.startsWith('@')) return !!s;
        s.slice(1).split(';').forEach((kv) => { const [k, v] = kv.split('='); if (k && v) o[k.trim()] = v.trim(); });
        return false;
      });
      const num = (k: string, d: number) => (Number.isFinite(parseFloat(o[k])) ? parseFloat(o[k]) : d);
      const src: Beat[] = (lines.length ? lines : ['新莊', '每坪', '68萬|68', '通勤', '23 分|23']).map((l) => {
        const [a = '', b = '', c = ''] = l.split('|').map((x) => x.trim());
        return { w: a, n: b, s: c };
      });
      const total = Math.max(1, Math.min(32, Math.round(num('beats', src.length))));
      const beats: Beat[] = Array.from({ length: total }, (_, i) => {
        const b = src[i % src.length];
        return { w: b.w, n: b.n || String(i + 1).padStart(2, '0'), s: b.s };
      });
      const bpm = Math.max(60, Math.min(200, num('bpm', 128)));
      const offset = Math.max(0, num('offset', 0));
      const div = Math.max(1, Math.min(8, Math.round(num('div', 1))));
      const hit = Math.max(0, Math.min(1, num('hit', 1)));
      const gentle = num('gentle', 0) > 0, clear = o.bg === 'none';
      const P = [...(PAL[o.pal] || PAL.swiss)];
      ['c1', 'c2', 'c3', 'c4'].forEach((k, i) => { if (/^#[0-9a-f]{6}$/i.test(o[k] || '')) P[i] = o[k]; });
      const step = (60 / bpm) * div; // 每次切換的秒數
      const hold = step * 2; // 最後一拍多停一下再循環
      const loop = offset + step * total + hold;
      const font = getComputedStyle(root).getPropertyValue('--sans').trim() || '"Noto Sans TC","Noto Sans CJK TC",sans-serif';
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const once = !!(globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = (cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)));
      const H = (cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)));
      const u = Math.min(W, H) / 100, v = H > W * 1.05;
      const ink = (bg: string) => (lum(bg) > 0.5 ? P[3] : P[2]);
      const fit = (s: string, wt: number, size: number, maxW: number) => {
        ctx.font = `${wt} ${size}px ${font}`;
        const mw = ctx.measureText(s).width;
        if (mw > maxW) { size *= maxW / mw; ctx.font = `${wt} ${size}px ${font}`; }
        return size;
      };
      const tc = (s: number) => { const m = Math.floor(s / 60), r = s - m * 60; return `${String(m).padStart(2, '0')}:${r.toFixed(2).padStart(5, '0')}`; };

      const draw = (time: number) => {
        let t = reduced ? offset + step * (total - 1) + 0.5 : once ? Math.min(time, loop - 0.001) : ((time % loop) + loop) % loop;
        if (t < 0) t = 0;
        const bt = t - offset;
        const i = bt < 0 ? 0 : Math.min(total - 1, Math.floor(bt / step));
        const dt = bt < 0 ? 99 : bt - i * step; // 這一拍已經過幾秒
        const started = bt >= 0;
        const b = beats[i];
        // 顏色：一般模式整張底色輪換；溫和模式底色固定，只換數字塊
        const cyc = [P[0], P[1], P[2], P[3]];
        const bg = gentle ? P[0] : cyc[i % 4];
        const others = cyc.filter((c) => c !== bg);
        const acc = gentle ? others[i % others.length] : bg === P[1] ? P[0] : P[1];
        const fg = clear ? P[2] : ink(bg);
        const nfg = ink(acc);
        // 拍點衝擊：前 2～3 幀硬切放大，之後指數回彈
        const kick = started ? Math.exp(-dt * 16) : 0;
        const z = 1 + hit * 0.06 * kick;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, W, H);
        if (!clear) { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); }
        ctx.save();
        ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
        if (clear) { ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = u * 1.2; }

        // 標頭
        ctx.fillStyle = fg; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
        ctx.font = `700 ${2.6 * u}px ${font}`;
        ctx.fillText('BEAT MAP', 4 * u, 4 * u);
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(bpm)} BPM  ·  ${tc(t)}`, W - 4 * u, 4 * u);
        ctx.textAlign = 'left';
        ctx.fillRect(4 * u, 8 * u, W - 8 * u, 0.4 * u);

        // 數字塊
        const bx = v ? 4 * u : W * 0.58, by = v ? H * 0.12 : 12 * u, bw = v ? W - 8 * u : W * 0.38, bh = v ? H * 0.3 : H - 28 * u;
        ctx.fillStyle = acc; ctx.fillRect(bx, by, bw, bh);
        ctx.save(); ctx.shadowColor = 'transparent';
        ctx.fillStyle = nfg; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'right';
        ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
        fit(b.n, 900, bh * 0.85, bw - 2 * u);
        ctx.fillText(b.n, bx + bw - 1 * u, by + bh * 0.92);
        ctx.restore();

        // 圖形列：亮到目前拍，目前拍用強調色並在拍點閃一下
        const sy = v ? H * 0.45 : H * 0.2, ss = Math.min(5 * u, (W - 8 * u) / total / 1.4), gap = ss * 1.4;
        for (let k = 0; k < total; k++) {
          const on = started && k <= i, cur = started && k === i;
          ctx.fillStyle = cur ? (clear ? acc : acc === bg ? fg : acc) : fg;
          ctx.globalAlpha = on ? 1 : 0.25;
          const s = ss * (cur ? 1 + 0.35 * kick : 1), x = 4 * u + k * gap + (ss - s) / 2, y = sy + (ss - s) / 2;
          ctx.beginPath();
          const m = k % 3;
          if (m === 0) ctx.arc(x + s / 2, y + s / 2, s / 2, 0, 7);
          else if (m === 1) ctx.rect(x, y, s, s);
          else { ctx.moveTo(x + s / 2, y); ctx.lineTo(x + s, y + s); ctx.lineTo(x, y + s); ctx.closePath(); }
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // 大字＋小字
        if (started || offset === 0) {
          ctx.fillStyle = fg; ctx.textBaseline = 'alphabetic';
          fit(b.w, 900, v ? H * 0.2 : H * 0.42, v ? W - 8 * u : W * 0.5);
          ctx.fillText(b.w, 3.5 * u, v ? H * 0.75 : H * 0.72);
          if (b.s) { fit(b.s, 700, 2.8 * u, v ? W - 8 * u : W * 0.5); ctx.textBaseline = 'top'; ctx.fillText(b.s, 4 * u, H * 0.8); }
        }

        // 進度條
        const py = H - 8 * u, gw = (W - 8 * u) / total;
        ctx.strokeStyle = fg; ctx.fillStyle = fg; ctx.lineWidth = 0.4 * u;
        for (let k = 0; k < total; k++) {
          const x = 4 * u + k * gw + 0.4 * u, cw = gw - 0.8 * u;
          ctx.strokeRect(x, py, cw, 4 * u);
          if (started && k <= i) ctx.fillRect(x, py, cw, 4 * u);
        }
        ctx.textBaseline = 'top'; ctx.font = `700 ${2 * u}px ${font}`;
        ctx.fillText(`BEAT ${String(started ? i + 1 : 0).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, 4 * u, py - 3.5 * u);
        ctx.restore();
      };
      let raf = 0;
      const t0 = performance.now();
      const f = (now: number) => { raf = requestAnimationFrame(f); draw((now - t0) / 1000); };
      draw(0);
      document.fonts?.load(`900 40px ${font}`, beats.map((b) => b.w + b.n + b.s).join('')).catch(() => 0);
      raf = requestAnimationFrame(f);
      (root as unknown as { maDraw?: (t: number) => void }).maDraw = draw;
      return () => cancelAnimationFrame(raf);
    },
  },
];
