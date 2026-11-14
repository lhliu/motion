import type { Fx } from '../types';

// 2026-11-14 新增：#696 漢字變場景無限縮放。
// 匯出 HTML 只帶 run，常數與 helper 全部寫在 run 裡。

const CANVAS_CSS = `.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}`;

export const fx1114: Fx[] = [
  {
    id: 'kanji-zoom',
    no: 696,
    cat: 'kinetic',
    zh: '漢字變場景無限縮放',
    en: 'Kanji-to-Scene Infinite Zoom',
    desc: '地名寫在招牌上，鏡頭推進去，下一站藏在場景裡，最後接回第一站',
    tags: ['地名', '轉場', '循環', '片頭', 'Shorts'],
    tone: 'paper',
    sample: ['台灣→新北→林口→你家', '@pal=island;speed=1;loop=1'],
    hint: '第一行用「→」分隔站名（也可一行一站）。@設定：pal（island 綠／朱紅／米，預設｜kc 頻道藍橘）、speed、loop（1 無縫循環，預設｜0 停在最後一站）、scene（auto 依關鍵字配模板，預設｜coast 海岸｜city 站牌街景｜hill 山坡社區｜door 住家大門｜corridor 透視走廊）、bg（solid 實色滿版，預設｜none）。',
    duration: 8,
    preferredRatio: '16:9',
    added: '2026-11-14',
    motion: '鏡頭一路往前推。每個地名寫在場景裡的大招牌上：台灣是觀景吊牌與海面上的島形，新北是月台站牌，林口是社區門額，你家是大門門牌；對不到關鍵字就用透視走廊加招牌。定格看清楚之後鏡頭推進開口，下一站從裡面長大接上。預設最後一站無縫接回第一站。扁平大色塊，沒有漸層或光暈。可改成頻道藍橘色票，也可關掉循環停在最後一站。',
    motionEn: 'The camera pushes forward through a loop of place-name scenes. Each name sits on a large sign in a flat colour-block scene (coastal island, station, community gate, front door, or a fallback corridor). After a hold the camera zooms into a doorway or window where the next stop is already waiting; the last stop links back to the first. Channel navy-and-orange palette and a one-shot hold on the last stop are available.',
    css: CANVAS_CSS,
    html: () => `<canvas></canvas>`,
    run: (root, w) => {
      const cv = root.querySelector('canvas')!;
      const ctx = cv.getContext('2d')!;
      const o: Record<string, string> = {};
      const words = w.filter((s) => {
        if (!s.startsWith('@')) return true;
        s.slice(1).split(';').forEach((kv) => {
          const i = kv.indexOf('=');
          if (i > 0) o[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
        });
        return false;
      }).map((s) => s.trim()).filter(Boolean);
      const names = words
        .flatMap((s) => s.split(/[→>\n／/|,]+/))
        .map((s) => s.trim())
        .filter(Boolean);
      const stopsIn = names.length ? names : ['台灣', '新北', '林口', '你家'];
      const KINDS = ['coast', 'city', 'hill', 'door', 'corridor'] as const;
      const forced = KINDS.includes((o.scene || '') as typeof KINDS[number]) ? o.scene : '';
      const kindFor = (name: string, i: number) => {
        if (forced) return forced;
        if (/台灣|台湾/.test(name)) return 'coast';
        if (/你家|我家|家$|宅|屋/.test(name)) return 'door';
        if (/林口|山林|山丘|山$/.test(name)) return 'hill';
        if (/新北|台北|台中|高雄|市|站/.test(name)) return 'city';
        return 'corridor';
      };
      const stops = stopsIn.map((name, i) => ({ name, kind: kindFor(name, i) }));
      const PALS: Record<string, Record<string, string>> = {
        island: {
          paper: '#F3EBD4', ink: '#1d2433', cream: '#F7F1E2',
          sky: '#EFE6C8', sky2: '#E4D7B0', sun: '#F28C28',
          sea: '#2F6B66', sea2: '#245853',
          land: '#4F8A4A', land2: '#3B6C38', land3: '#2E542C',
          wood: '#C4A36A', wood2: '#8C6A3E',
          accent: '#C44B3A', accent2: '#9A3528', navy: '#2A3D48',
          wall: '#F3EFE6', wall2: '#E0D3BE', warm: '#F6D37A', stoop: '#B8A88A',
          city: '#2A4458', city2: '#1C3344', city3: '#3A5A6E', river: '#3A6B7A',
          leaf: '#4F8A4A', leaf2: '#3B6C38', leaf3: '#2E542C',
        },
        kc: {
          paper: '#F4EFE6', ink: '#12233C', cream: '#F8F3EA',
          sky: '#E8E4D6', sky2: '#D4CFBE', sun: '#F28C28',
          sea: '#1F3A5F', sea2: '#163055',
          land: '#4F8A4A', land2: '#3B6C38', land3: '#2E542C',
          wood: '#C4A06A', wood2: '#8A6A3C',
          accent: '#F28C28', accent2: '#C46E16', navy: '#1F3A5F',
          wall: '#F4EFE6', wall2: '#DDD4C4', warm: '#F6D37A', stoop: '#B8A88A',
          city: '#1F3A5F', city2: '#163055', city3: '#2A4A70', river: '#2A4A6E',
          leaf: '#4F8A4A', leaf2: '#3B6C38', leaf3: '#2E542C',
        },
      };
      const C = PALS[o.pal || ''] || PALS.island;
      const INK = C.ink;
      const num = (k: string, d: number) => (Number.isFinite(parseFloat(o[k])) ? parseFloat(o[k]) : d);
      const speed = Math.max(0.3, Math.min(3, num('speed', 1)));
      const looping = !(o.loop === '0' || o.loop === 'off' || o.loop === 'false');
      const clearBg = o.bg === 'none';
      const HOLD = 0.38;
      const SEG = 2 / speed;
      const nStops = stops.length;
      const loopSec = looping ? nStops * SEG : (nStops - 1) * SEG + SEG * HOLD + 0.8 / speed;
      const font = getComputedStyle(root).getPropertyValue('--sans').trim() || '"Noto Sans TC","Noto Sans CJK TC",sans-serif';
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const once = !!(globalThis as unknown as { MA_ONCE?: boolean }).MA_ONCE;

      const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const easeZoom = (t: number) => t * t; // 二次緩入：中段就看得出推進，又不至於太早把招牌推出畫面
      const hex = (c: string) => {
        const s = c.replace('#', '');
        return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
      };
      const shade = (c: string, k: number) => {
        if (c.startsWith('rgb')) return c;
        const [r, g, b] = hex(c);
        const f = (v: number) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
        return `rgb(${f(r)},${f(g)},${f(b)})`;
      };
      const fillRR = (x: CanvasRenderingContext2D, X: number, Y: number, w: number, h: number, r: number, c: string) => {
        x.beginPath();
        x.roundRect(X, Y, w, h, Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2)));
        x.fillStyle = c;
        x.fill();
      };
      const poly = (x: CanvasRenderingContext2D, pts: number[][], c: string) => {
        x.beginPath();
        pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
        x.closePath();
        x.fillStyle = c;
        x.fill();
      };
      const circle = (x: CanvasRenderingContext2D, X: number, Y: number, r: number, c: string) => {
        x.beginPath();
        x.arc(X, Y, Math.max(0, r), 0, Math.PI * 2);
        x.fillStyle = c;
        x.fill();
      };
      const fitText = (x: CanvasRenderingContext2D, str: string, maxW: number, maxH: number) => {
        let fs = maxH;
        x.font = `900 ${fs}px ${font}`;
        while (x.measureText(str).width > maxW && fs > 10) {
          fs *= 0.92;
          x.font = `900 ${fs}px ${font}`;
        }
        return fs;
      };
      const signText = (x: CanvasRenderingContext2D, str: string, cx: number, cy: number, maxW: number, maxH: number, color: string) => {
        const fs = fitText(x, str, maxW, maxH);
        x.fillStyle = color;
        x.font = `900 ${fs}px ${font}`;
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillText(str, cx, cy + fs * 0.03);
        return fs;
      };
      const drawPlaque = (x: CanvasRenderingContext2D, rect: { x: number; y: number; w: number; h: number }, label: string, bg: string, fg: string) => {
        const r = Math.min(rect.h, rect.w) * 0.08;
        fillRR(x, rect.x, rect.y, rect.w, rect.h, r, bg);
        fillRR(x, rect.x, rect.y, rect.w, Math.max(2, rect.h * 0.10), r, shade(bg, 0.28));
        fillRR(x, rect.x, rect.y + rect.h * 0.88, rect.w, rect.h * 0.12, r, shade(bg, -0.2));
        signText(x, label, rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w * 0.88, rect.h * 0.68, fg);
      };

      const TAIWAN = [
        [0.250, 0.000], [0.367, 0.044], [0.500, 0.085], [0.410, 0.162],
        [0.426, 0.206], [0.298, 0.388], [0.181, 0.647], [0.048, 0.750],
        [-0.085, 0.868], [-0.112, 1.000], [-0.170, 0.991], [-0.255, 0.868],
        [-0.420, 0.794], [-0.500, 0.676], [-0.484, 0.544], [-0.351, 0.368],
        [-0.282, 0.294], [-0.165, 0.200], [-0.074, 0.132], [0.021, 0.074],
        [0.181, 0.035],
      ];
      const drawTaiwanIsland = (x: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) => {
        const pts = TAIWAN.map(([u, v]) => [cx + u * w, cy + v * h]);
        const shore = TAIWAN.map(([u, v]) => [cx + u * w * 1.06, cy + v * h * 1.04 - h * 0.01]);
        poly(x, shore, shade(C.cream, -0.06));
        poly(x, pts, C.land);
        const east = [
          [0.367, 0.044], [0.500, 0.085], [0.410, 0.162], [0.426, 0.206],
          [0.298, 0.388], [0.181, 0.647], [0.048, 0.750], [-0.085, 0.868],
          [-0.112, 1.000],
          [-0.05, 0.85], [0.05, 0.65], [0.16, 0.38], [0.28, 0.18], [0.30, 0.06],
        ].map(([u, v]) => [cx + u * w, cy + v * h]);
        poly(x, east, C.land2);
        poly(x, [
          [0.10, 0.10], [0.22, 0.16], [0.20, 0.34], [0.12, 0.55],
          [0.04, 0.72], [-0.02, 0.62], [-0.04, 0.40], [0.00, 0.22],
        ].map(([u, v]) => [cx + u * w, cy + v * h]), C.land3);
        poly(x, [
          [-0.48, 0.55], [-0.35, 0.36], [-0.28, 0.30], [-0.32, 0.42], [-0.42, 0.62],
        ].map(([u, v]) => [cx + u * w, cy + v * h]), shade(C.land, 0.22));
        circle(x, cx - w * 0.62, cy + h * 0.58, w * 0.035, C.land2);
        circle(x, cx - w * 0.70, cy + h * 0.62, w * 0.022, C.land2);
      };

      type Lay = {
        plaque: { x: number; y: number; w: number; h: number };
        portal: { x: number; y: number; w: number; h: number };
        island?: { cx: number; cy: number; w: number; h: number };
        floorY?: number;
        beamY?: number;
        postW?: number;
      };
      const portalSize = (W: number, H: number, scale: number) => {
        const pW = W * scale;
        return { pW, pH: pW * (H / W) };
      };
      const plaqueSize = (W: number, H: number) => {
        const S = Math.min(W, H);
        const port = H > W;
        // 9:16 特別加大：高度約畫面 11～12%，寬約 82%；16:9 高度約 15% 畫面、寬 70%。
        const h = port ? Math.max(S * 0.20, H * 0.11) : Math.max(S * 0.155, H * 0.145);
        const w = W * (port ? 0.82 : 0.70);
        return { w, h };
      };
      const layout = (kind: string, W: number, H: number): Lay => {
        const S = Math.min(W, H);
        const port = H > W;
        const ps = plaqueSize(W, H);
        if (kind === 'coast') {
          const plaque = { x: (W - ps.w) / 2, y: H * (port ? 0.055 : 0.07), w: ps.w, h: ps.h };
          const floorY = H * (port ? 0.82 : 0.86);
          const top = plaque.y + plaque.h + S * 0.04;
          const bot = floorY - S * 0.03;
          const maxH = bot - top;
          const h = Math.min(maxH, port ? H * 0.42 : H * 0.58);
          const w = h / 1.68;
          const island = { cx: W * 0.5, cy: top + (maxH - h) * 0.28, w, h };
          const { pW, pH } = portalSize(W, H, port ? 0.22 : 0.145);
          const portal = { x: island.cx + island.w * 0.02 - pW / 2, y: island.cy + island.h * 0.04, w: pW, h: pH };
          return { plaque, portal, island, floorY };
        }
        if (kind === 'city') {
          const { pW, pH } = portalSize(W, H, port ? 0.26 : 0.18);
          const plaque = { x: (W - ps.w) / 2, y: H * (port ? 0.07 : 0.07), w: ps.w, h: ps.h };
          const portal = { x: W / 2 - pW / 2, y: Math.max(plaque.y + plaque.h + S * 0.06, H * (port ? 0.42 : 0.40) - pH / 2), w: pW, h: pH };
          return { plaque, portal };
        }
        if (kind === 'hill') {
          const { pW, pH } = portalSize(W, H, port ? 0.26 : 0.18);
          const beamY = H * (port ? 0.10 : 0.06);
          const plaque = { x: (W - ps.w) / 2, y: beamY + S * 0.02, w: ps.w, h: ps.h };
          const portal = { x: W / 2 - pW / 2, y: Math.max(plaque.y + plaque.h + S * 0.08, H * (port ? 0.48 : 0.46) - pH / 2), w: pW, h: pH };
          return { plaque, portal, beamY, postW: S * (port ? 0.10 : 0.09) };
        }
        if (kind === 'door') {
          const { pW, pH } = portalSize(W, H, port ? 0.28 : 0.18);
          const plaque = { x: (W - ps.w * 0.86) / 2, y: H * (port ? 0.07 : 0.055), w: ps.w * 0.86, h: ps.h };
          const portal = { x: W / 2 - pW / 2, y: Math.max(plaque.y + plaque.h + S * 0.08, H * (port ? 0.40 : 0.38) - pH / 2), w: pW, h: pH };
          return { plaque, portal };
        }
        // corridor
        const { pW, pH } = portalSize(W, H, port ? 0.28 : 0.18);
        const plaque = { x: (W - ps.w) / 2, y: H * (port ? 0.08 : 0.06), w: ps.w, h: ps.h };
        const portal = { x: W / 2 - pW / 2, y: Math.max(plaque.y + plaque.h + S * 0.10, H * (port ? 0.42 : 0.40) - pH / 2), w: pW, h: pH };
        return { plaque, portal };
      };

      const building = (x: CanvasRenderingContext2D, bx: number, by: number, bw: number, bh: number, col: string, lit: boolean) => {
        x.fillStyle = col;
        x.fillRect(bx, by, bw, bh);
        x.fillStyle = shade(col, -0.2);
        x.fillRect(bx + bw * 0.86, by, bw * 0.14, bh);
        x.fillStyle = shade(col, 0.18);
        x.fillRect(bx, by, bw * 0.08, bh);
        x.fillStyle = shade(col, -0.3);
        x.fillRect(bx - bw * 0.04, by - Math.max(3, bh * 0.03), bw * 1.08, Math.max(3, bh * 0.03));
        const S = Math.min(bw, bh);
        const cols = Math.max(2, Math.floor(bw / (S * 0.55)));
        const rows = Math.max(2, Math.floor(bh / (S * 0.70)));
        const mw = bw * 0.12, mh = bh * 0.10;
        const cw = (bw - mw * 2) / cols, ch = (bh - mh * 2) / rows;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const on = lit && ((r * 3 + c * 5) % 7 !== 0);
          x.fillStyle = on ? C.warm : shade(col, -0.35);
          x.fillRect(bx + mw + c * cw + cw * 0.18, by + mh + r * ch + ch * 0.22, cw * 0.64, ch * 0.56);
        }
      };
      const tree = (x: CanvasRenderingContext2D, tx: number, ty: number, s: number) => {
        x.fillStyle = C.wood2;
        x.fillRect(tx - s * 0.08, ty - s * 0.15, s * 0.16, s * 0.28);
        circle(x, tx - s * 0.12, ty - s * 0.28, s * 0.22, C.leaf3);
        circle(x, tx + s * 0.14, ty - s * 0.26, s * 0.20, C.leaf2);
        circle(x, tx, ty - s * 0.36, s * 0.24, C.leaf);
        circle(x, tx - s * 0.06, ty - s * 0.40, s * 0.08, shade(C.leaf, 0.25));
      };
      const hillMound = (x: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, col: string) => {
        x.beginPath();
        x.moveTo(cx - w, cy);
        x.bezierCurveTo(cx - w * 0.6, cy - h, cx + w * 0.6, cy - h, cx + w, cy);
        x.lineTo(cx + w, cy + h * 0.4);
        x.lineTo(cx - w, cy + h * 0.4);
        x.closePath();
        x.fillStyle = col;
        x.fill();
      };

      const sceneCoast = (x: CanvasRenderingContext2D, W: number, H: number, label: string) => {
        const S = Math.min(W, H);
        const port = H > W;
        const L = layout('coast', W, H);
        const floorY = L.floorY!;
        const island = L.island!;
        const horizon = island.cy + island.h * 0.10;
        x.fillStyle = C.sky;
        x.fillRect(-W, -H, W * 3, H * 3);
        x.fillStyle = C.sky2;
        x.fillRect(-W, horizon - H * 0.03, W * 3, H * 2);
        const sx = W * (port ? 0.82 : 0.90), sy = Math.min(horizon - S * 0.05, L.plaque.y + L.plaque.h + S * 0.08);
        circle(x, sx, sy, S * 0.07, C.sun);
        circle(x, sx - S * 0.02, sy - S * 0.016, S * 0.024, 'rgba(255,255,255,.45)');
        fillRR(x, W * 0.06, H * (port ? 0.20 : 0.16), S * 0.18, S * 0.04, S * 0.02, shade(C.cream, -0.04));
        fillRR(x, W * 0.10, H * (port ? 0.185 : 0.145), S * 0.12, S * 0.035, S * 0.018, C.cream);
        x.fillStyle = C.sea;
        x.fillRect(-W, horizon, W * 3, H * 2);
        x.fillStyle = C.sea2;
        x.fillRect(-W, horizon + H * 0.16, W * 3, H * 2);
        x.fillStyle = shade(C.sea, 0.18);
        for (let i = 0; i < 6; i++) {
          const wy = horizon + H * 0.05 + i * H * 0.05;
          fillRR(x, W * (0.04 + (i % 3) * 0.08), wy, W * 0.18, Math.max(3, S * 0.007), 2, shade(C.sea, 0.18));
          fillRR(x, W * (0.55 + (i % 2) * 0.08), wy + S * 0.01, W * 0.16, Math.max(3, S * 0.007), 2, shade(C.sea, 0.18));
        }
        drawTaiwanIsland(x, island.cx, island.cy, island.w, island.h);
        const pad = S * 0.012;
        x.fillStyle = C.wood;
        x.fillRect(L.portal.x - pad, L.portal.y - pad * 2.4, L.portal.w + pad * 2, L.portal.h + pad * 3.2);
        x.fillStyle = shade(C.wood, -0.25);
        x.fillRect(L.portal.x - pad * 0.3, L.portal.y - pad * 0.3, L.portal.w + pad * 0.6, L.portal.h + pad * 0.6);
        poly(x, [
          [L.portal.x - pad * 2, L.portal.y - pad * 2.0],
          [L.portal.x + L.portal.w / 2, L.portal.y - pad * 4.6],
          [L.portal.x + L.portal.w + pad * 2, L.portal.y - pad * 2.0],
        ], C.accent);
        x.fillStyle = C.wood2;
        x.fillRect(-W, floorY, W * 3, H * 2);
        x.fillStyle = C.wood;
        x.fillRect(-W, floorY, W * 3, S * 0.045);
        x.fillStyle = shade(C.wood, 0.28);
        x.fillRect(-W, floorY, W * 3, S * 0.012);
        x.fillStyle = shade(C.wood2, -0.12);
        for (let i = -3; i <= 3; i++) {
          if (i === 0) continue;
          x.beginPath();
          x.moveTo(W / 2 + i * W * 0.16, H * 1.4);
          x.lineTo(W / 2 + i * S * 0.02, floorY);
          x.lineTo(W / 2 + (i + 0.15) * S * 0.02, floorY);
          x.lineTo(W / 2 + i * W * 0.16 + W * 0.02, H * 1.4);
          x.fill();
        }
        const postW = S * 0.03;
        x.fillStyle = C.navy;
        x.fillRect(L.plaque.x + S * 0.03, 0, postW, L.plaque.y + L.plaque.h);
        x.fillRect(L.plaque.x + L.plaque.w - S * 0.03 - postW, 0, postW, L.plaque.y + L.plaque.h);
        drawPlaque(x, L.plaque, label, C.navy, C.cream);
        return L;
      };

      const sceneCity = (x: CanvasRenderingContext2D, W: number, H: number, label: string) => {
        const S = Math.min(W, H);
        const port = H > W;
        const L = layout('city', W, H);
        const ground = H * (port ? 0.74 : 0.80);
        x.fillStyle = shade(C.sky, -0.04);
        x.fillRect(-W, -H, W * 3, H * 3);
        x.fillStyle = C.sky;
        x.fillRect(-W, -H, W * 3, ground + H);
        x.fillStyle = shade(C.sky2, 0.05);
        x.fillRect(-W, ground - H * 0.22, W * 3, H * 0.22);
        const bases = port
          ? [[0.00, 0.42], [0.10, 0.28], [0.18, 0.50], [0.30, 0.22], [0.40, 0.38], [0.50, 0.18], [0.60, 0.34], [0.70, 0.26], [0.80, 0.44], [0.90, 0.30]]
          : [[-0.04, 0.46], [0.06, 0.32], [0.14, 0.50], [0.24, 0.24], [0.34, 0.40], [0.44, 0.20], [0.54, 0.36], [0.64, 0.28], [0.74, 0.48], [0.84, 0.30], [0.94, 0.42]];
        bases.forEach((b, i) => {
          const bw = W * (port ? 0.12 : 0.11);
          const bh = H * b[1];
          building(x, W * b[0], ground - bh, bw, bh, [C.city, C.city2, C.city3][i % 3], i % 2 === 0);
        });
        x.fillStyle = C.river;
        x.fillRect(-W, ground, W * 3, H * 0.08);
        x.fillStyle = shade(C.river, 0.2);
        x.fillRect(-W, ground + H * 0.015, W * 3, Math.max(3, S * 0.008));
        x.fillStyle = C.stoop;
        x.fillRect(-W, ground + H * 0.08, W * 3, H * 2);
        x.fillStyle = shade(C.stoop, 0.2);
        x.fillRect(-W, ground + H * 0.08, W * 3, S * 0.012);
        x.fillStyle = C.accent;
        x.fillRect(-W, ground + H * 0.08, W * 3, S * 0.012);
        const hallW = L.portal.w + S * 0.18;
        const hallX = L.portal.x - (hallW - L.portal.w) / 2;
        const hallY = L.portal.y - S * 0.08;
        const hallH = ground - hallY;
        x.fillStyle = C.city2;
        x.fillRect(hallX, hallY, hallW, hallH);
        x.fillStyle = shade(C.city2, 0.2);
        x.fillRect(hallX, hallY, S * 0.018, hallH);
        x.fillStyle = shade(C.city2, -0.2);
        x.fillRect(hallX + hallW - S * 0.02, hallY, S * 0.02, hallH);
        x.fillStyle = C.navy;
        x.fillRect(hallX - S * 0.02, L.portal.y - S * 0.045, hallW + S * 0.04, S * 0.045);
        x.fillStyle = shade(C.city2, -0.4);
        x.fillRect(L.portal.x - S * 0.01, L.portal.y - S * 0.01, L.portal.w + S * 0.02, L.portal.h + S * 0.01);
        const postW = S * 0.03;
        x.fillStyle = C.navy;
        x.fillRect(L.plaque.x + S * 0.04, 0, postW, L.plaque.y + L.plaque.h);
        x.fillRect(L.plaque.x + L.plaque.w - S * 0.04 - postW, 0, postW, L.plaque.y + L.plaque.h);
        drawPlaque(x, L.plaque, label, C.accent, C.navy);
        return L;
      };

      const sceneHill = (x: CanvasRenderingContext2D, W: number, H: number, label: string) => {
        const S = Math.min(W, H);
        const port = H > W;
        const L = layout('hill', W, H);
        const ground = H * (port ? 0.76 : 0.80);
        x.fillStyle = C.sky;
        x.fillRect(-W, -H, W * 3, H * 3);
        circle(x, W * (port ? 0.84 : 0.88), H * (port ? 0.08 : 0.10), S * 0.055, C.sun);
        circle(x, W * (port ? 0.84 : 0.88) - S * 0.016, H * (port ? 0.08 : 0.10) - S * 0.012, S * 0.018, 'rgba(255,255,255,.4)');
        hillMound(x, W * 0.25, ground - H * 0.18, W * 0.50, H * 0.28, C.leaf3);
        hillMound(x, W * 0.78, ground - H * 0.16, W * 0.48, H * 0.26, shade(C.leaf3, 0.08));
        hillMound(x, W * 0.50, ground - H * 0.08, W * 0.70, H * 0.22, C.leaf2);
        const apY = ground - H * (port ? 0.28 : 0.32);
        building(x, W * 0.06, apY + H * 0.04, W * 0.16, ground - (apY + H * 0.04), C.wall2, true);
        x.fillStyle = C.accent;
        x.fillRect(W * 0.06, apY + H * 0.04, W * 0.16, S * 0.012);
        building(x, W * 0.78, apY, W * 0.16, ground - apY, shade(C.wall, -0.05), true);
        x.fillStyle = C.accent;
        x.fillRect(W * 0.78, apY, W * 0.16, S * 0.012);
        const hx = L.portal.x - S * 0.08;
        const hw = L.portal.w + S * 0.16;
        const hy = L.portal.y - S * 0.10;
        const hh = ground - hy;
        x.fillStyle = C.wall;
        x.fillRect(hx, hy, hw, hh);
        x.fillStyle = shade(C.wall, -0.18);
        x.fillRect(hx + hw * 0.88, hy, hw * 0.12, hh);
        poly(x, [
          [hx - S * 0.04, hy + S * 0.02],
          [hx + hw / 2, hy - S * 0.10],
          [hx + hw + S * 0.04, hy + S * 0.02],
          [hx + hw, hy + S * 0.06],
          [hx, hy + S * 0.06],
        ], C.accent);
        poly(x, [
          [hx + hw / 2, hy - S * 0.10],
          [hx + hw + S * 0.04, hy + S * 0.02],
          [hx + hw / 2 + S * 0.02, hy + S * 0.02],
        ], C.accent2);
        x.fillStyle = shade(C.navy, -0.1);
        x.fillRect(L.portal.x - S * 0.01, L.portal.y - S * 0.01, L.portal.w + S * 0.02, L.portal.h + S * 0.02);
        x.fillStyle = C.leaf;
        x.fillRect(-W, ground, W * 3, H * 2);
        x.fillStyle = shade(C.leaf, 0.15);
        x.fillRect(-W, ground, W * 3, S * 0.02);
        poly(x, [
          [W * 0.20, H * 1.4], [W * 0.80, H * 1.4],
          [L.portal.x + L.portal.w * 0.85, ground],
          [L.portal.x + L.portal.w * 0.15, ground],
        ], shade(C.stoop, 0.05));
        poly(x, [
          [W * 0.22, H * 1.4], [W * 0.30, H * 1.4],
          [L.portal.x + L.portal.w * 0.28, ground],
          [L.portal.x + L.portal.w * 0.15, ground],
        ], shade(C.stoop, -0.15));
        tree(x, W * 0.14, ground, S * 0.16);
        tree(x, W * 0.22, ground + S * 0.02, S * 0.12);
        tree(x, W * 0.86, ground, S * 0.15);
        tree(x, W * 0.78, ground + S * 0.03, S * 0.11);
        if (port) {
          tree(x, W * 0.08, ground + S * 0.08, S * 0.20);
          tree(x, W * 0.92, ground + S * 0.10, S * 0.18);
        }
        const postW = L.postW!;
        const postY = L.beamY!;
        const postH = H * 1.2 - postY;
        const leftX = W * 0.05;
        const rightX = W * 0.95 - postW;
        x.fillStyle = C.wall;
        x.fillRect(leftX, postY, postW, postH);
        x.fillRect(rightX, postY, postW, postH);
        x.fillStyle = shade(C.wall, 0.3);
        x.fillRect(leftX, postY, postW * 0.22, postH);
        x.fillRect(rightX, postY, postW * 0.22, postH);
        x.fillStyle = shade(C.wall, -0.2);
        x.fillRect(leftX + postW * 0.82, postY, postW * 0.18, postH);
        x.fillRect(rightX + postW * 0.82, postY, postW * 0.18, postH);
        const beamH = Math.max(S * 0.085, L.plaque.h * 0.35);
        x.fillStyle = C.accent;
        x.fillRect(leftX - S * 0.02, postY, rightX + postW - leftX + S * 0.04, beamH);
        x.fillStyle = C.accent2;
        x.fillRect(leftX - S * 0.02, postY + beamH * 0.78, rightX + postW - leftX + S * 0.04, beamH * 0.22);
        x.fillStyle = shade(C.accent, 0.25);
        x.fillRect(leftX - S * 0.02, postY, rightX + postW - leftX + S * 0.04, beamH * 0.16);
        poly(x, [
          [leftX - S * 0.06, postY + S * 0.01],
          [W / 2, postY - S * 0.07],
          [rightX + postW + S * 0.06, postY + S * 0.01],
        ], C.accent2);
        drawPlaque(x, L.plaque, label, C.cream, INK);
        return L;
      };

      const sceneDoor = (x: CanvasRenderingContext2D, W: number, H: number, label: string) => {
        const S = Math.min(W, H);
        const port = H > W;
        const L = layout('door', W, H);
        const floorY = H * (port ? 0.80 : 0.84);
        x.fillStyle = shade(C.sky2, 0.1);
        x.fillRect(-W, -H, W * 3, H * 3);
        x.fillStyle = C.wall;
        x.fillRect(-W, -H, W * 3, H * 3);
        poly(x, [
          [-W, -H], [W * 2, -H],
          [L.portal.x + L.portal.w, L.portal.y],
          [L.portal.x, L.portal.y],
        ], shade(C.wall, -0.10));
        poly(x, [
          [-W, -H], [L.portal.x, L.portal.y],
          [L.portal.x, L.portal.y + L.portal.h],
          [-W, H * 2],
        ], shade(C.wall, -0.04));
        poly(x, [
          [W * 2, -H], [L.portal.x + L.portal.w, L.portal.y],
          [L.portal.x + L.portal.w, L.portal.y + L.portal.h],
          [W * 2, H * 2],
        ], shade(C.wall, -0.18));
        x.fillStyle = shade(C.wall, -0.08);
        x.fillRect(L.portal.x - S * 0.08, L.portal.y - S * 0.08, L.portal.w + S * 0.16, L.portal.h + S * 0.16);
        x.fillStyle = C.navy;
        x.fillRect(L.portal.x - S * 0.018, L.portal.y - S * 0.018, L.portal.w + S * 0.036, L.portal.h + S * 0.036);
        poly(x, [
          [-W, H * 2], [W * 2, H * 2],
          [L.portal.x + L.portal.w, L.portal.y + L.portal.h],
          [L.portal.x, L.portal.y + L.portal.h],
        ], C.stoop);
        for (let i = -3; i <= 4; i++) {
          x.beginPath();
          const a = (i + 3) / 7;
          x.moveTo(lerp(0, W, a), H * 1.5);
          x.lineTo(L.portal.x + L.portal.w * a, L.portal.y + L.portal.h);
          x.lineWidth = Math.max(2, S * 0.008);
          x.strokeStyle = shade(C.stoop, -0.2);
          x.stroke();
        }
        poly(x, [
          [L.portal.x, L.portal.y + L.portal.h],
          [L.portal.x + L.portal.w, L.portal.y + L.portal.h],
          [W * 0.72, H * 1.2],
          [W * 0.28, H * 1.2],
        ], 'rgba(246,211,122,.35)');
        const doorW = port ? W * 0.20 : W * 0.15;
        const doorT = H * (port ? 0.06 : 0.04);
        const doorB = floorY + S * 0.02;
        const doorH = doorB - doorT;
        poly(x, [[0, doorT], [doorW, doorT + S * 0.02], [doorW, doorB - S * 0.02], [0, doorB]], C.navy);
        poly(x, [
          [doorW * 0.12, doorT + S * 0.08], [doorW * 0.78, doorT + S * 0.10],
          [doorW * 0.78, doorT + doorH * 0.46], [doorW * 0.12, doorT + doorH * 0.46],
        ], shade(C.navy, 0.12));
        poly(x, [
          [doorW * 0.12, doorT + doorH * 0.54], [doorW * 0.78, doorT + doorH * 0.54],
          [doorW * 0.78, doorB - S * 0.10], [doorW * 0.12, doorB - S * 0.08],
        ], shade(C.navy, 0.12));
        circle(x, doorW * 0.82, doorT + doorH * 0.52, S * 0.016, C.accent);
        poly(x, [[W, doorT], [W - doorW, doorT + S * 0.02], [W - doorW, doorB - S * 0.02], [W, doorB]], shade(C.navy, -0.08));
        poly(x, [
          [W - doorW * 0.12, doorT + S * 0.08], [W - doorW * 0.78, doorT + S * 0.10],
          [W - doorW * 0.78, doorT + doorH * 0.46], [W - doorW * 0.12, doorT + doorH * 0.46],
        ], shade(C.navy, 0.08));
        poly(x, [
          [W - doorW * 0.12, doorT + doorH * 0.54], [W - doorW * 0.78, doorT + doorH * 0.54],
          [W - doorW * 0.78, doorB - S * 0.10], [W - doorW * 0.12, doorB - S * 0.08],
        ], shade(C.navy, 0.08));
        circle(x, W - doorW * 0.82, doorT + doorH * 0.52, S * 0.016, C.accent);
        x.fillStyle = C.wood2;
        x.fillRect(0, floorY, W, S * 0.035);
        x.fillStyle = shade(C.wood, 0.15);
        x.fillRect(0, floorY, W, S * 0.01);
        const px = W * 0.10, py = floorY;
        fillRR(x, px - S * 0.05, py - S * 0.05, S * 0.10, S * 0.07, S * 0.01, C.accent);
        fillRR(x, px - S * 0.04, py - S * 0.045, S * 0.08, S * 0.05, S * 0.008, shade(C.accent, 0.15));
        circle(x, px, py - S * 0.10, S * 0.055, C.leaf2);
        circle(x, px - S * 0.03, py - S * 0.13, S * 0.04, C.leaf);
        circle(x, px + S * 0.03, py - S * 0.12, S * 0.038, C.leaf3);
        x.fillStyle = C.wood;
        x.fillRect(W * 0.16, L.plaque.y - S * 0.045, W * 0.68, S * 0.04);
        x.fillStyle = shade(C.wood, 0.25);
        x.fillRect(W * 0.16, L.plaque.y - S * 0.045, W * 0.68, S * 0.012);
        drawPlaque(x, L.plaque, label, C.cream, INK);
        return L;
      };

      const sceneCorridor = (x: CanvasRenderingContext2D, W: number, H: number, label: string) => {
        const S = Math.min(W, H);
        const L = layout('corridor', W, H);
        const floorY = H * (H > W ? 0.80 : 0.84);
        // 透視走廊：天花板、左右牆、地板 converging 到 portal
        x.fillStyle = C.sky;
        x.fillRect(-W, -H, W * 3, H * 3);
        poly(x, [
          [-W, -H], [W * 2, -H],
          [L.portal.x + L.portal.w, L.portal.y],
          [L.portal.x, L.portal.y],
        ], shade(C.wall, -0.12));
        poly(x, [
          [-W, -H], [L.portal.x, L.portal.y],
          [L.portal.x, L.portal.y + L.portal.h],
          [-W, H * 2],
        ], shade(C.navy, 0.35));
        poly(x, [
          [W * 2, -H], [L.portal.x + L.portal.w, L.portal.y],
          [L.portal.x + L.portal.w, L.portal.y + L.portal.h],
          [W * 2, H * 2],
        ], shade(C.navy, 0.15));
        // 牆面分段（透視色塊，不是生硬格子）
        for (let i = 0; i < 5; i++) {
          const t0 = i / 5, t1 = (i + 1) / 5;
          const easeT = (t: number) => t * t;
          const y0 = lerp(L.portal.y, -H * 0.05, 1 - easeT(t0));
          const y1 = lerp(L.portal.y, -H * 0.05, 1 - easeT(t1));
          const xl0 = lerp(L.portal.x, -W * 0.05, 1 - easeT(t0));
          const xl1 = lerp(L.portal.x, -W * 0.05, 1 - easeT(t1));
          const xr0 = lerp(L.portal.x + L.portal.w, W * 1.05, 1 - easeT(t0));
          const xr1 = lerp(L.portal.x + L.portal.w, W * 1.05, 1 - easeT(t1));
          const yb0 = lerp(L.portal.y + L.portal.h, H * 1.2, 1 - easeT(t0));
          const yb1 = lerp(L.portal.y + L.portal.h, H * 1.2, 1 - easeT(t1));
          x.fillStyle = i % 2 ? shade(C.navy, 0.28) : shade(C.navy, 0.22);
          poly(x, [[xl0, y0], [xl1, y1], [xl1, yb1], [xl0, yb0]], x.fillStyle as string);
          x.fillStyle = i % 2 ? shade(C.navy, 0.08) : shade(C.navy, 0.02);
          poly(x, [[xr0, y0], [xr1, y1], [xr1, yb1], [xr0, yb0]], x.fillStyle as string);
        }
        poly(x, [
          [-W, H * 2], [W * 2, H * 2],
          [L.portal.x + L.portal.w, L.portal.y + L.portal.h],
          [L.portal.x, L.portal.y + L.portal.h],
        ], C.stoop);
        for (let i = 0; i <= 8; i++) {
          const a = i / 8;
          x.beginPath();
          x.moveTo(lerp(-W * 0.1, W * 1.1, a), H * 1.5);
          x.lineTo(L.portal.x + L.portal.w * a, L.portal.y + L.portal.h);
          x.lineWidth = Math.max(2, S * 0.008);
          x.strokeStyle = shade(C.stoop, -0.2);
          x.stroke();
        }
        // 盡頭門框
        x.fillStyle = C.accent;
        x.fillRect(L.portal.x - S * 0.035, L.portal.y - S * 0.06, L.portal.w + S * 0.07, S * 0.055);
        x.fillStyle = C.navy;
        x.fillRect(L.portal.x - S * 0.018, L.portal.y - S * 0.018, L.portal.w + S * 0.036, L.portal.h + S * 0.03);
        // 吊掛大招牌
        const postW = S * 0.03;
        x.fillStyle = C.navy;
        x.fillRect(L.plaque.x + S * 0.04, 0, postW, L.plaque.y + L.plaque.h);
        x.fillRect(L.plaque.x + L.plaque.w - S * 0.04 - postW, 0, postW, L.plaque.y + L.plaque.h);
        drawPlaque(x, L.plaque, label, C.accent, C.cream);
        return L;
      };

      const DRAW: Record<string, (x: CanvasRenderingContext2D, W: number, H: number, label: string) => Lay> = {
        coast: sceneCoast, city: sceneCity, hill: sceneHill, door: sceneDoor, corridor: sceneCorridor,
      };

      const drawNested = (x: CanvasRenderingContext2D, W: number, H: number, index: number, depth: number) => {
        const stop = stops[((index % nStops) + nStops) % nStops];
        const L = DRAW[stop.kind](x, W, H, stop.name);
        if (depth < 2) {
          x.save();
          x.beginPath();
          x.rect(L.portal.x, L.portal.y, L.portal.w, L.portal.h);
          x.clip();
          x.translate(L.portal.x, L.portal.y);
          x.scale(L.portal.w / W, L.portal.h / H);
          drawNested(x, W, H, index + 1, depth + 1);
          x.restore();
        }
        return L;
      };

      const size = { w: 0, h: 0, dpr: 1 };
      const syncSize = () => {
        const dpr = Math.min(2, devicePixelRatio || 1);
        const w0 = Math.max(1, Math.round(cv.clientWidth * dpr));
        const h0 = Math.max(1, Math.round(cv.clientHeight * dpr));
        if (w0 !== size.w || h0 !== size.h || dpr !== size.dpr) {
          cv.width = w0;
          cv.height = h0;
          size.w = w0;
          size.h = h0;
          size.dpr = dpr;
        }
        return { W: w0, H: h0 };
      };

      const draw = (time: number) => {
        const { W, H } = syncSize();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        if (clearBg) ctx.clearRect(0, 0, W, H);
        else { ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); }

        let t: number;
        if (reduced) t = SEG * HOLD * 0.6;
        else if (once) t = Math.min(Math.max(0, time), Math.max(0, loopSec - 0.001));
        else t = ((time % loopSec) + loopSec) % loopSec;

        let i: number;
        let u: number;
        if (!looping) {
          const lastStart = (nStops - 1) * SEG;
          if (t >= lastStart) { i = nStops - 1; u = 0; }
          else { i = Math.min(nStops - 2, Math.floor(t / SEG)); u = (t - i * SEG) / SEG; }
        } else {
          i = Math.min(nStops - 1, Math.floor(t / SEG));
          u = (t - i * SEG) / SEG;
        }
        const k = u <= HOLD ? 0 : easeZoom((u - HOLD) / (1 - HOLD));
        const Ltmp = layout(stops[i].kind, W, H);
        // 水平對準開口，垂直對準招牌與開口的中點偏招牌，推進時大招牌會留在畫面上方較久
        const pcx = Ltmp.portal.x + Ltmp.portal.w / 2;
        const pcy = Ltmp.portal.y + Ltmp.portal.h / 2;
        const scx = Ltmp.plaque.x + Ltmp.plaque.w / 2;
        const scy = Ltmp.plaque.y + Ltmp.plaque.h / 2;
        const aimX = pcx;
        const aimY = lerp(scy, pcy, 0.48);
        const Z = (W / Ltmp.portal.w) * 1.02;
        const cx = lerp(W / 2, aimX, k);
        const cy = lerp(H / 2, aimY, k);
        const sc = Math.pow(Z, k);
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.scale(sc, sc);
        ctx.translate(-cx, -cy);
        drawNested(ctx, W, H, i, 0);
        ctx.restore();
      };

      let raf = 0;
      const tStart = performance.now();
      const tick = (now: number) => { raf = requestAnimationFrame(tick); draw((now - tStart) / 1000); };
      draw(0);
      raf = requestAnimationFrame(tick);
      (root as unknown as { maDraw?: (t: number) => void }).maDraw = draw;
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => draw(((performance.now() - tStart) / 1000))) : null;
      ro?.observe(root);
      return () => { cancelAnimationFrame(raf); ro?.disconnect(); };
    },
  },
];
