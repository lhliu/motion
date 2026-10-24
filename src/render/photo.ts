// photokit.ts 的繪製引擎（自給自足，會被序列化進匯出的 HTML）。第一次用到才載入，主程式不打包。
import { fnSource } from '../engine';
import { registerEngine } from '../engines';
import { FONTS_GLOBALS } from '../fonts';
import type { PCaption, PScene } from '../photokit';

/** 繪製引擎工廠；imgs 為已載入的圖片（缺圖時畫佔位） */
export const photoRenderer = () => {
  type Img = (HTMLImageElement | HTMLCanvasElement | ImageBitmap) & { width: number; height: number };
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
  const inout = (p: number) => {
    const q = clamp(p);
    return q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
  };
  const back = (p: number) => {
    const q = clamp(p) - 1;
    return 1 + 2.4 * q * q * q + 1.4 * q * q;
  };
  const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
  const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : Number.isFinite(parseFloat(String(v))) ? parseFloat(String(v)) : d);
  const FONT = '"MA Num", "Chiron Hei HK", "Noto Sans TC", "PingFang TC", sans-serif';
  /** 目前使用的字型；drawPhoto 每次依場景或呼叫端設定 */
  let F = FONT;

  /** 佔位圖：0＝完工街景、1＝施工前空地；角落標示插槽編號，讓沒放圖時也看得出構圖 */
  const holders = new Map<string, HTMLCanvasElement>();
  const placeholder = (i: number, after = true): Img => {
    const key = `${i}|${after}`;
    let c = holders.get(key);
    if (!c) {
      c = document.createElement('canvas');
      c.width = 1600;
      c.height = 1200;
      const x = c.getContext('2d')!;
      // 每個插槽換一組天色與樓群，多張模組才看得出差別
      const tones = [['#7fb8e6', '#f3d9b0'], ['#f2a679', '#fbe3c2'], ['#8fc9e0', '#e8f1e4'], ['#5a6fa8', '#f0b88a']][i % 4];
      const sky = x.createLinearGradient(0, 0, 0, 760);
      sky.addColorStop(0, after ? tones[0] : '#b9c3cc');
      sky.addColorStop(1, after ? tones[1] : '#e2ddd3');
      x.fillStyle = sky;
      x.fillRect(0, 0, 1600, 1200);
      x.fillStyle = after ? '#ffe7a8' : '#f4f1ea';
      x.beginPath();
      x.arc(1250 - (i % 3) * 420, 230 + (i % 2) * 60, 90, 0, Math.PI * 2);
      x.fill();
      // 遠山
      x.fillStyle = after ? '#8fb3a0' : '#a9b2ad';
      x.beginPath();
      x.moveTo(0, 700);
      for (let k = 0; k <= 16; k++) x.lineTo(k * 100, 610 + Math.sin(k * 1.3) * 50 + Math.cos(k * 0.7) * 30);
      x.lineTo(1600, 760);
      x.lineTo(0, 760);
      x.fill();
      if (after) {
        const towers = [[120, 300, 190], [360, 200, 230], [640, 120, 260], [950, 230, 210], [1210, 330, 240]];
        towers.forEach(([tx0, ty0, tw], n) => {
          const tx = tx0 + (((i * 237) % 300) - 150);
          const ty = ty0 + (((i * 53 + n * 71) % 160) - 80);
          x.fillStyle = ['#e9e4da', '#d8d2c6', '#f2eee6', '#ded8cc', '#ece7dd'][(n + i) % 5];
          x.fillRect(tx, ty, tw, 860 - ty);
          x.fillStyle = '#5d7f9e';
          for (let r = ty + 40; r < 800; r += 56) for (let q = tx + 24; q < tx + tw - 30; q += 46) x.fillRect(q, r, 28, 30);
        });
        x.fillStyle = '#6aa36f';
        for (let k = 0; k < 14; k++) {
          x.beginPath();
          x.arc(60 + k * 115, 860, 46 + (k % 3) * 10, 0, Math.PI * 2);
          x.fill();
        }
      } else {
        // 施工前：圍籬與吊車
        x.strokeStyle = '#6b6258';
        x.lineWidth = 14;
        x.beginPath();
        x.moveTo(980, 840);
        x.lineTo(980, 220);
        x.lineTo(700, 220);
        x.moveTo(980, 220);
        x.lineTo(1380, 220);
        x.moveTo(1240, 220);
        x.lineTo(1240, 420);
        x.stroke();
        x.fillStyle = '#e8c04a';
        x.fillRect(1205, 420, 70, 50);
      }
      x.fillStyle = after ? '#9a9187' : '#b49a78';
      x.fillRect(0, 860, 1600, 340);
      x.fillStyle = after ? '#5b5650' : '#9b7f5c';
      x.fillRect(0, 960, 1600, 120);
      x.fillStyle = after ? '#f4f1ea' : '#c9b48f';
      for (let k = 0; k < 16; k++) x.fillRect(k * 110 + 20, 1012, 60, 14);
      if (!after) {
        x.fillStyle = '#4f7d5a';
        x.fillRect(0, 800, 1600, 70);
        x.fillStyle = '#f4f1ea';
        x.font = `900 44px ${FONT}`;
        x.fillText('施工中 · 圍籬', 640, 845);
      }
      // 插槽標示
      x.fillStyle = '#111111cc';
      x.beginPath();
      x.roundRect(36, 36, 300, 96, 48);
      x.fill();
      x.fillStyle = '#ffffff';
      x.font = `900 52px ${FONT}`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(`圖片 ${i + 1}`, 186, 86);
      holders.set(key, c);
    }
    return c as Img;
  };

  /** 視差示意前景：透明底的樹叢與欄杆，尺寸與示意背景相同 */
  const placeholderFg = (): Img => {
    let c = holders.get('fg');
    if (!c) {
      c = document.createElement('canvas');
      c.width = 1600;
      c.height = 1200;
      const x = c.getContext('2d')!;
      x.fillStyle = '#3f7a4a';
      for (let k = 0; k < 9; k++) {
        const cx = k < 4 ? 40 + k * 110 : 1180 + (k - 4) * 100;
        x.beginPath();
        x.arc(cx, 900 - (k % 3) * 40, 110 + (k % 2) * 30, 0, Math.PI * 2);
        x.fill();
      }
      x.fillStyle = '#2f5e39';
      x.fillRect(0, 960, 1600, 240);
      x.fillStyle = '#e9e4da';
      x.fillRect(0, 1000, 1600, 16);
      for (let k = 0; k < 33; k++) x.fillRect(k * 50, 1000, 10, 120);
      x.fillRect(0, 1100, 1600, 14);
      x.fillStyle = '#26282b';
      x.fillRect(470, 420, 16, 600);
      x.fillRect(470, 420, 120, 14);
      x.fillStyle = '#ffd23f';
      x.fillRect(560, 432, 40, 20);
      holders.set('fg', c);
    }
    return c as Img;
  };

  /** 透明剪報示意：不依賴外部圖片，圖鑑與匯出也能預覽裁出的輪廓。 */
  const placeholderCutout = (i: number): Img => {
    const key = `cutout-${i}`;
    let c = holders.get(key);
    if (!c) {
      c = document.createElement('canvas');
      c.width = 600;
      c.height = 700;
      const x = c.getContext('2d')!;
      x.fillStyle = ['#eb6b43', '#68a591', '#e4b94f'][i % 3];
      x.beginPath();
      x.moveTo(70, 660);
      x.lineTo(70, 240);
      x.lineTo(200, 240);
      x.lineTo(200, 80 + i * 35);
      x.lineTo(450, 80 + i * 35);
      x.lineTo(450, 360);
      x.lineTo(530, 360);
      x.lineTo(530, 660);
      x.closePath();
      x.fill();
      x.fillStyle = '#243c4b';
      for (let row = 0; row < 7; row++) for (let col = 0; col < 3; col++) x.fillRect(230 + col * 65, 145 + i * 35 + row * 65, 32, 36);
      x.fillStyle = '#f5f1e8';
      x.fillRect(100, 330, 60, 180);
      x.fillRect(260, 570, 105, 90);
      holders.set(key, c);
    }
    return c as Img;
  };

  /** 手機示意長截圖：物件頁（灰條代表文字，不放假數字） */
  const placeholderTall = (): Img => {
    let c = holders.get('tall');
    if (!c) {
      c = document.createElement('canvas');
      c.width = 900;
      c.height = 2600;
      const x = c.getContext('2d')!;
      x.fillStyle = '#f4f1ea';
      x.fillRect(0, 0, 900, 2600);
      x.fillStyle = '#151515';
      x.fillRect(0, 0, 900, 150);
      x.fillStyle = '#ffffff';
      x.font = `900 46px ${FONT}`;
      x.textBaseline = 'middle';
      x.fillText('物件介紹', 50, 95);
      x.drawImage(placeholder(0), 0, 150, 900, 675);
      const bars = (y: number, n: number, w = 800) => {
        x.fillStyle = '#d6d0c4';
        for (let k = 0; k < n; k++) x.fillRect(50, y + k * 52, k === n - 1 ? w * 0.55 : w, 24);
      };
      x.fillStyle = '#151515';
      x.font = `900 58px ${FONT}`;
      x.fillText('社區名稱', 50, 900);
      bars(960, 3);
      for (let r = 0; r < 3; r++) {
        const y = 1160 + r * 440;
        x.fillStyle = '#ffffff';
        x.beginPath();
        x.roundRect(40, y, 820, 400, 28);
        x.fill();
        x.drawImage(placeholder(r + 1), 60, y + 20, 340, 255);
        x.fillStyle = '#ff5a36';
        x.fillRect(430, y + 30, 160, 26);
        x.fillStyle = '#d6d0c4';
        for (let k = 0; k < 4; k++) x.fillRect(430, y + 90 + k * 48, k === 3 ? 220 : 390, 22);
        x.fillRect(60, y + 300, 760, 22);
        x.fillRect(60, y + 345, 480, 22);
      }
      x.fillStyle = '#111111cc';
      x.beginPath();
      x.roundRect(560, 180, 300, 96, 48);
      x.fill();
      x.fillStyle = '#ffffff';
      x.font = `900 52px ${FONT}`;
      x.textAlign = 'center';
      x.fillText('圖片 1', 710, 230);
      holders.set('tall', c);
    }
    return c as Img;
  };

  /** 以 cover 方式取景：z 為縮放，cx/cy 為取景中心（0–1，圖片座標） */
  const coverParams = (img: Img, W: number, H: number, z: number, cx: number, cy: number) => {
    const k = Math.max(W / img.width, H / img.height) * Math.max(1, z);
    const vw = W / k;
    const vh = H / k;
    const sx = Math.max(0, Math.min(img.width - vw, cx * img.width - vw / 2));
    const sy = Math.max(0, Math.min(img.height - vh, cy * img.height - vh / 2));
    return { k, sx, sy, vw, vh };
  };
  const drawCover = (ctx: CanvasRenderingContext2D, img: Img, W: number, H: number, z: number, cx: number, cy: number) => {
    const p = coverParams(img, W, H, z, cx, cy);
    ctx.drawImage(img, p.sx, p.sy, p.vw, p.vh, 0, 0, W, H);
    return p;
  };

  /** 每個圖片物件一個流水號，當快取的 key */
  const ids = new WeakMap<object, number>();
  let nid = 0;
  const idOf = (o: object) => {
    let v = ids.get(o);
    if (!v) ids.set(o, (v = ++nid));
    return v;
  };

  /** 帶邊框、圓角的照片貼圖（快取） */
  const framed = new Map<string, HTMLCanvasElement>();
  const frameTex = (img: Img, w: number, h: number, border: number, radius: number, color: string) => {
    const key = `${idOf(img)}|${Math.round(w)}x${Math.round(h)}|${border}|${radius}|${color}`;
    let c = framed.get(key);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = Math.max(2, Math.round(w));
    c.height = Math.max(2, Math.round(h));
    const x = c.getContext('2d')!;
    x.beginPath();
    x.roundRect(0, 0, c.width, c.height, radius);
    x.clip();
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    const iw = c.width - border * 2;
    const ih = c.height - border * 2;
    if (iw > 2 && ih > 2) {
      const k = Math.max(iw / img.width, ih / img.height);
      const vw = iw / k;
      const vh = ih / k;
      x.save();
      x.beginPath();
      x.roundRect(border, border, iw, ih, Math.max(0, radius - border));
      x.clip();
      x.drawImage(img, (img.width - vw) / 2, (img.height - vh) / 2, vw, vh, border, border, iw, ih);
      x.restore();
    }
    if (framed.size > 40) framed.clear();
    framed.set(key, c);
    return c;
  };

  /** 沿圖片 alpha 輪廓描邊，不把透明剪報變成矩形相框。 */
  const cutoutTex = (im: Img, w: number, h: number, border: number, color: string) => {
    const iw = Math.max(1, Math.round(w));
    const ih = Math.max(1, Math.round(h));
    const bd = Math.max(0, Math.round(border));
    const key = `cut|${idOf(im)}|${iw}x${ih}|${bd}|${color}`;
    const cached = framed.get(key);
    if (cached) return cached;
    const silhouette = document.createElement('canvas');
    silhouette.width = iw + 2 * bd;
    silhouette.height = ih + 2 * bd;
    const sx = silhouette.getContext('2d')!;
    sx.drawImage(im, bd, bd, iw, ih);
    sx.globalCompositeOperation = 'source-in';
    sx.fillStyle = color;
    sx.fillRect(0, 0, silhouette.width, silhouette.height);
    const c = document.createElement('canvas');
    c.width = silhouette.width;
    c.height = silhouette.height;
    const x = c.getContext('2d')!;
    if (bd) {
      for (let k = 0; k < 24; k++) {
        const angle = (k / 24) * Math.PI * 2;
        x.drawImage(silhouette, Math.cos(angle) * bd, Math.sin(angle) * bd);
      }
    }
    x.drawImage(im, bd, bd, iw, ih);
    if (framed.size > 40) framed.clear();
    framed.set(key, c);
    return c;
  };

  /** 拍立得：下方留白較寬，可寫標籤 */
  const polaroid = (img: Img, w: number, h: number, bd: number, bt: number, color: string, label: string, ink: string) => {
    const key = `pol|${idOf(img)}|${Math.round(w)}x${Math.round(h)}|${bd}|${bt}|${color}|${label}|${ink}`;
    let c = framed.get(key);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = Math.max(2, Math.round(w));
    c.height = Math.max(2, Math.round(h));
    const x = c.getContext('2d')!;
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    const iw = c.width - bd * 2;
    const ih = c.height - bd - bt;
    if (iw > 2 && ih > 2) {
      const k = Math.max(iw / img.width, ih / img.height);
      x.drawImage(img, (img.width - iw / k) / 2, (img.height - ih / k) / 2, iw / k, ih / k, bd, bd, iw, ih);
    }
    // 細實線外框：疊在一起時分得出邊界（不用陰影）
    x.strokeStyle = '#00000030';
    x.lineWidth = 2;
    x.strokeRect(1, 1, c.width - 2, c.height - 2);
    if (label) {
      const fs = Math.min(bt * 0.42, (c.width / Math.max(4, label.length)) * 0.9);
      x.fillStyle = ink;
      x.font = `700 ${fs}px ${FONT}`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(label, c.width / 2, c.height - bt / 2);
    }
    if (framed.size > 40) framed.clear();
    framed.set(key, c);
    return c;
  };

  /* ───────── WebGL：3D 傾斜卡片 ───────── */
  let gl: WebGLRenderingContext | null = null;
  let glc: HTMLCanvasElement | null = null;
  let prog: WebGLProgram | null = null;
  let tex: WebGLTexture | null = null;
  let texKey = '';
  const glInit = () => {
    glc = document.createElement('canvas');
    gl = glc.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true }) as WebGLRenderingContext | null;
    if (!gl) return;
    const vs = `attribute vec3 p;attribute vec2 uv;attribute float sh;uniform mat4 m;varying vec2 v;varying float s;void main(){v=uv;s=sh;gl_Position=m*vec4(p,1.0);}`;
    const fs = `precision mediump float;varying vec2 v;varying float s;uniform sampler2D t;uniform vec3 c;void main(){if(s<0.0){vec4 col=texture2D(t,v);gl_FragColor=vec4(col.rgb*col.a,col.a);}else{gl_FragColor=vec4(c*s,1.0);}}`;
    const sh = (type: number, src: string) => {
      const o = gl!.createShader(type)!;
      gl!.shaderSource(o, src);
      gl!.compileShader(o);
      return o;
    };
    prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    tex = gl.createTexture();
  };
  const mul = (a: number[], b: number[]) => {
    const o = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
    return o;
  };
  const drawCard3D = (ctx: CanvasRenderingContext2D, W: number, H: number, img: HTMLCanvasElement, cx: number, cy: number, cw: number, ch: number, depth: number, rx: number, ry: number, edge: string, alpha: number) => {
    if (!gl) glInit();
    if (!gl || !glc || !prog) {
      ctx.drawImage(img, cx - cw / 2, cy - ch / 2, cw, ch);
      return;
    }
    if (glc.width !== W || glc.height !== H) {
      glc.width = W;
      glc.height = H;
    }
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(prog);
    // 以像素為單位的 3D 空間，鏡頭距離約 2.2 倍畫面高
    const f = H * 2.2;
    const a = W / H;
    const near = 10;
    const far = f * 4;
    const fy = 1 / Math.tan(Math.atan(H / 2 / f));
    const P = [fy / a, 0, 0, 0, 0, fy, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0];
    const T = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, cx - W / 2, -(cy - H / 2), -f, 1];
    const sx = Math.sin(rx);
    const cxr = Math.cos(rx);
    const sy = Math.sin(ry);
    const cyr = Math.cos(ry);
    const RX = [1, 0, 0, 0, 0, cxr, sx, 0, 0, -sx, cxr, 0, 0, 0, 0, 1];
    const RY = [cyr, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cyr, 0, 0, 0, 0, 1];
    const M = mul(P, mul(T, mul(RX, RY)));
    const w = cw / 2;
    const h = ch / 2;
    const d = depth / 2;
    // 每個頂點：x y z u v shade（shade<0 代表貼圖）
    const q = (pts: number[][], s: number) => [pts[0], pts[1], pts[2], pts[0], pts[2], pts[3]].flatMap((v) => [...v, s]);
    const data = new Float32Array([
      ...q([[-w, h, d, 0, 0], [w, h, d, 1, 0], [w, -h, d, 1, 1], [-w, -h, d, 0, 1]], -1),
      ...q([[w, h, d, 0, 0], [w, h, -d, 0, 0], [w, -h, -d, 0, 0], [w, -h, d, 0, 0]], 0.82),
      ...q([[-w, h, -d, 0, 0], [-w, h, d, 0, 0], [-w, -h, d, 0, 0], [-w, -h, -d, 0, 0]], 0.82),
      ...q([[-w, h, -d, 0, 0], [w, h, -d, 0, 0], [w, h, d, 0, 0], [-w, h, d, 0, 0]], 0.95),
      ...q([[-w, -h, d, 0, 0], [w, -h, d, 0, 0], [w, -h, -d, 0, 0], [-w, -h, -d, 0, 0]], 0.7),
      ...q([[w, h, -d, 0, 0], [-w, h, -d, 0, 0], [-w, -h, -d, 0, 0], [w, -h, -d, 0, 0]], 0.6),
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
    const loc = (n: string) => gl!.getAttribLocation(prog!, n);
    gl.enableVertexAttribArray(loc('p'));
    gl.vertexAttribPointer(loc('p'), 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(loc('uv'));
    gl.vertexAttribPointer(loc('uv'), 2, gl.FLOAT, false, 24, 12);
    gl.enableVertexAttribArray(loc('sh'));
    gl.vertexAttribPointer(loc('sh'), 1, gl.FLOAT, false, 24, 20);
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'm'), false, new Float32Array(M));
    const e = edge.replace('#', '');
    gl.uniform3f(gl.getUniformLocation(prog, 'c'), parseInt(e.slice(0, 2), 16) / 255, parseInt(e.slice(2, 4), 16) / 255, parseInt(e.slice(4, 6), 16) / 255);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const key = String(idOf(img));
    if (key !== texKey) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      texKey = key;
    }
    gl.uniform1i(gl.getUniformLocation(prog, 't'), 0);
    gl.drawArrays(gl.TRIANGLES, 0, data.length / 6);
    gl.deleteBuffer(buf);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.drawImage(glc, 0, 0);
    ctx.restore();
  };

  /* ───────── 字幕 ───────── */
  const drawCaption = (ctx: CanvasRenderingContext2D, W: number, H: number, c: PCaption | undefined, t: number, u: number) => {
    if (!c || !c.text) return;
    const p = clamp((t - c.delay) / 0.45);
    if (p <= 0) return;
    const fs = 54 * u * (c.size || 1);
    const x = c.x * W;
    const y = c.y * H + (1 - ease(p)) * 30 * u;
    ctx.save();
    ctx.globalAlpha *= ease(p);
    ctx.font = `900 ${fs}px ${F}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = c.text.split('\n');
    const tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const lh = fs * 1.25;
    const th = lh * lines.length;
    if (c.style === 'pill' || c.style === 'bar') {
      ctx.fillStyle = '#1c1c1cdd';
      ctx.beginPath();
      const pw = tw + fs * 1.4;
      const ph = th + fs * 0.6;
      ctx.roundRect(x - pw / 2, y - ph / 2, pw, ph, c.style === 'pill' ? Math.min(ph / 2, fs) : 12 * u);
      ctx.fill();
      if (c.style === 'bar') {
        ctx.fillStyle = c.color;
        ctx.fillRect(x - pw / 2 + fs * 0.3, y - ph / 2 + fs * 0.25, 8 * u, ph - fs * 0.5);
      }
      ctx.fillStyle = c.color;
    } else {
      ctx.lineJoin = 'round';
      ctx.lineWidth = fs * 0.22;
      ctx.strokeStyle = '#111111';
      lines.forEach((l, i) => ctx.strokeText(l, x, y - th / 2 + lh * (i + 0.5)));
      ctx.fillStyle = c.color;
    }
    lines.forEach((l, i) => ctx.fillText(l, x, y - th / 2 + lh * (i + 0.5)));
    ctx.restore();
  };

  /** 畫一格；回傳可拖曳的把手位置（畫面像素） */
  const drawPhoto = (ctx: CanvasRenderingContext2D, W: number, H: number, sc: PScene, t: number, imgs: (Img | undefined)[], font?: string): Record<string, number[]> => {
    F = ((globalThis as unknown as { MA_FONTS?: Record<string, string> }).MA_FONTS ?? {})[sc.font ?? ''] || font || FONT;
    const S = Math.min(W, H);
    const u = S / 1080;
    const P = sc.params || {};
    const g = (k: string, d: number) => num(P[k], d);
    const img = (i: number) => imgs[i] ?? placeholder(i);
    // 有給圖時循環使用給的圖；完全沒給才用示意圖
    const given = imgs.filter(Boolean) as Img[];
    const cyc = (i: number) => imgs[i] ?? (given.length ? given[i % given.length] : placeholder(i));
    const ci = (v: number, a: number, b: number) => Math.max(a, Math.min(b, Math.round(v)));
    const labelsOf = (k: string) => String(P[k] ?? '').split('|').map((x) => x.trim());
    const isLight = (hex: string) => {
      const h = hex.replace('#', '');
      if (h.length < 6) return true;
      const [r, gg, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
      return r * 0.299 + gg * 0.587 + b * 0.114 > 160;
    };
    /** 把圖片以 cover 方式畫進矩形 */
    const coverIn = (im: Img, x: number, y: number, w: number, h: number, z = 1, cx = 0.5, cy = 0.5) => {
      const p = coverParams(im, w, h, z, cx, cy);
      ctx.drawImage(im, p.sx, p.sy, p.vw, p.vh, x, y, w, h);
    };
    /** 膠囊標籤；y 為中心線 */
    const pill = (text: string, x: number, y: number, fs: number, align: 'left' | 'center' | 'right' = 'center', fill = '#1c1c1cdd', ink = '#ffffff') => {
      if (!text) return;
      ctx.save();
      ctx.font = `900 ${fs}px ${F}`;
      const w = ctx.measureText(text).width + fs * 1.2;
      const h = fs * 1.6;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x0, y - h / 2, w, h, h / 2);
      ctx.fill();
      ctx.fillStyle = ink;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x0 + w / 2, y);
      ctx.restore();
    };
    const fitCard = (im: Img, size: number, aspectP: number, maxH: number) => {
      const aspect = aspectP || im.width / im.height;
      let cw = W * size;
      let ch = cw / aspect;
      if (ch > H * maxH) {
        ch = H * maxH;
        cw = ch * aspect;
      }
      return [cw, ch];
    };
    const handles: Record<string, number[]> = {};
    ctx.clearRect(0, 0, W, H);
    if (sc.bg && sc.bg !== 'transparent') {
      const c = sc.bg.split(',');
      if (c.length > 1) {
        const gr = ctx.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, c[0].trim());
        gr.addColorStop(1, c[1].trim());
        ctx.fillStyle = gr;
      } else ctx.fillStyle = c[0];
      ctx.fillRect(0, 0, W, H);
    }
    const L = Math.max(1, sc.loop || 6);

    if (sc.module === 'kenburns') {
      const p = P.ease === 'linear' ? clamp(t / L) : inout(t / L);
      drawCover(ctx, img(0), W, H, lerp(g('fz', 1), g('tz', 1.35), p), lerp(g('fx', 0.5), g('tx', 0.6), p), lerp(g('fy', 0.5), g('ty', 0.45), p));
    }

    if (sc.module === 'swing') {
      const im = img(0);
      const aspect = g('aspect', 0) || im.width / im.height;
      let cw = W * g('size', 0.78);
      let ch = cw / aspect;
      if (ch > H * 0.8) {
        ch = H * 0.8;
        cw = ch * aspect;
      }
      const e = back(t / 0.8);
      const from = String(P.from ?? 'left');
      const dist = Math.max(W, H) * 0.9;
      const ox = from === 'left' ? -dist : from === 'right' ? dist : 0;
      const oy = from === 'top' ? -dist : from === 'bottom' ? dist : 0;
      const float = g('float', 1) ? Math.sin(t * 1.4) * 6 * u : 0;
      const cx = g('px', 0.5) * W + ox * (1 - e);
      const cy = g('py', 0.46) * H + oy * (1 - e) + float;
      const tx = frameTex(im, cw, ch, g('border', 18) * u, g('radius', 10) * u, String(P.frame ?? '#ffffff'));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((lerp(g('angle', -28), g('rest', -4), e) * Math.PI) / 180);
      const s = lerp(g('scale', 1.6), 1, clamp(e));
      ctx.scale(s, s);
      ctx.globalAlpha *= clamp(t / 0.15);
      ctx.drawImage(tx, -cw / 2, -ch / 2, cw, ch);
      ctx.restore();
      handles.card = [g('px', 0.5) * W, g('py', 0.46) * H];
    }

    if (sc.module === 'tilt') {
      const im = img(0);
      const aspect = g('aspect', 0) || im.width / im.height;
      let cw = W * g('size', 0.78);
      let ch = cw / aspect;
      if (ch > H * 0.75) {
        ch = H * 0.75;
        cw = ch * aspect;
      }
      const tx = frameTex(im, cw, ch, g('border', 0) * u, g('radius', 18) * u, String(P.frame ?? '#ffffff'));
      const e = ease(t / 1.1);
      const sway = Math.sin((t / Math.max(0.5, g('period', 4))) * Math.PI * 2) * g('sway', 6) * clamp((t - 0.9) / 0.6);
      const ry = ((lerp(g('ry0', -55), g('ry', -14), e) + sway) * Math.PI) / 180;
      const rx = ((g('rx', 8) + sway * 0.3) * Math.PI) / 180;
      drawCard3D(ctx, W, H, tx, g('px', 0.5) * W, g('py', 0.47) * H, cw, ch, g('depth', 18) * u, rx, ry, String(P.edge ?? '#e8e2d6'), clamp(t / 0.2));
      handles.card = [g('px', 0.5) * W, g('py', 0.47) * H];
    }

    if (sc.module === 'compare') {
      // 前後對比的示意圖：圖片 1 為施工前、圖片 2 為完工
      const A = imgs[0] ?? placeholder(0, false);
      const B = imgs[1] ?? placeholder(1, true);
      const vert = P.dir === 'v';
      const hold = g('hold', 0.8);
      const sweep = Math.max(0.3, g('sweep', 1.6));
      const pos = lerp(g('from', 0.85), g('to', 0.15), inout((t - hold) / sweep));
      drawCover(ctx, B, W, H, 1, 0.5, 0.5);
      ctx.save();
      ctx.beginPath();
      if (vert) ctx.rect(0, 0, W, H * pos);
      else ctx.rect(0, 0, W * pos, H);
      ctx.clip();
      drawCover(ctx, A, W, H, 1, 0.5, 0.5);
      ctx.restore();
      const lw = 6 * u;
      ctx.fillStyle = String(P.line ?? '#ffffff');
      if (vert) ctx.fillRect(0, H * pos - lw / 2, W, lw);
      else ctx.fillRect(W * pos - lw / 2, 0, lw, H);
      const kx = vert ? W / 2 : W * pos;
      const ky = vert ? H * pos : H / 2;
      const kr = 44 * u;
      ctx.fillStyle = String(P.knob ?? '#ff5a36');
      ctx.beginPath();
      ctx.arc(kx, ky, kr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        if (vert) {
          ctx.moveTo(kx - kr * 0.32, ky + sgn * kr * 0.2);
          ctx.lineTo(kx + kr * 0.32, ky + sgn * kr * 0.2);
          ctx.lineTo(kx, ky + sgn * kr * 0.55);
        } else {
          ctx.moveTo(kx + sgn * kr * 0.2, ky - kr * 0.32);
          ctx.lineTo(kx + sgn * kr * 0.2, ky + kr * 0.32);
          ctx.lineTo(kx + sgn * kr * 0.55, ky);
        }
        ctx.fill();
      }
      const tag = (text: string, x: number, y: number, align: 'left' | 'right') => {
        if (!text) return;
        const fs = 36 * u;
        ctx.font = `900 ${fs}px ${F}`;
        const w = ctx.measureText(text).width + fs * 1.2;
        const h = fs * 1.6;
        const x0 = align === 'left' ? x : x - w;
        ctx.fillStyle = '#1c1c1cdd';
        ctx.beginPath();
        ctx.roundRect(x0, y, w, h, h / 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x0 + w / 2, y + h / 2);
      };
      const m = 36 * u;
      tag(String(P.labelA ?? ''), m, vert ? m : H * 0.08, 'left');
      tag(String(P.labelB ?? ''), vert ? m : W - m, vert ? H - m - 58 * u : H * 0.08, vert ? 'left' : 'right');
      handles.divider = [kx, ky];
    }

    if (sc.module === 'magnify') {
      const im = img(0);
      const z = lerp(1, g('push', 1.06), clamp(t / L));
      const cp = drawCover(ctx, im, W, H, z, 0.5, 0.5);
      const ax = g('ax', 0.38) * W;
      const ay = g('ay', 0.58) * H;
      const ar = g('ar', 0.07) * S;
      const lx = g('lx', 0.66) * W;
      const ly = g('ly', 0.3) * H;
      const lr = g('lr', 0.2) * S;
      const ring = String(P.ring ?? '#ffd23f');
      const lw = 7 * u;
      const p1 = ease((t - 0.3) / 0.5);
      if (p1 > 0) {
        ctx.strokeStyle = ring;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.arc(ax, ay, ar, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p1);
        ctx.stroke();
      }
      const p2 = ease((t - 0.75) / 0.4);
      if (p2 > 0) {
        const ang = Math.atan2(ly - ay, lx - ax);
        const x1 = ax + Math.cos(ang) * ar;
        const y1 = ay + Math.sin(ang) * ar;
        const x2 = lx - Math.cos(ang) * lr;
        const y2 = ly - Math.sin(ang) * lr;
        ctx.strokeStyle = ring;
        ctx.lineWidth = lw * 0.7;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(lerp(x1, x2, p2), lerp(y1, y2, p2));
        ctx.stroke();
      }
      const p3 = back((t - 1.05) / 0.5);
      if (t > 1.05) {
        const r = lr * Math.max(0.01, p3);
        const mag = lr / ar;
        ctx.save();
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#111';
        ctx.fillRect(lx - r, ly - r, r * 2, r * 2);
        // 鏡頭內：把目標點對齊鏡頭中心並放大
        ctx.translate(lx, ly);
        ctx.scale(mag, mag);
        ctx.translate(-ax, -ay);
        ctx.drawImage(im, cp.sx, cp.sy, cp.vw, cp.vh, 0, 0, W, H);
        ctx.restore();
        ctx.strokeStyle = ring;
        ctx.lineWidth = lw * 1.2;
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      handles.target = [ax, ay];
      handles.lens = [lx, ly];
    }

    if (sc.module === 'window') {
      const im = img(0);
      const bar = g('bar', 1) ? 64 * u : 0;
      const [cw, ih] = fitCard(im, g('size', 0.84), g('aspect', 0.8), 0.72);
      const ch = ih + bar;
      const tx = g('px', 0.5) * W;
      const ty = g('py', 0.45) * H;
      const from = String(P.from ?? 'bottom');
      const ox = from === 'point' ? g('ox', 0.5) * W : tx;
      const oy = from === 'point' ? g('oy', 0.92) * H : from === 'center' ? ty : H + ch * 0.1;
      const d = Math.max(0.2, g('dur', 0.6));
      const e = back((t - 0.1) / d);
      const m = ease((t - 0.1) / d);
      if (t > 0.1) {
        const r = g('radius', 28) * u;
        const barColor = String(P.barColor ?? '#f4f1ea');
        ctx.save();
        ctx.translate(lerp(ox, tx, m), lerp(oy, ty, m));
        const s = Math.max(0.02, lerp(0.06, 1, e));
        ctx.scale(s, s);
        ctx.beginPath();
        ctx.roundRect(-cw / 2, -ch / 2, cw, ch, r);
        ctx.clip();
        if (bar) {
          ctx.fillStyle = barColor;
          ctx.fillRect(-cw / 2, -ch / 2, cw, bar);
          ['#ff5f57', '#febc2e', '#28c840'].forEach((c, k) => {
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(-cw / 2 + 36 * u + k * 30 * u, -ch / 2 + bar / 2, 9 * u, 0, Math.PI * 2);
            ctx.fill();
          });
          if (P.title) {
            ctx.fillStyle = isLight(barColor) ? '#2b2b2b' : '#ffffff';
            ctx.font = `800 ${26 * u}px ${F}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(P.title), 0, -ch / 2 + bar / 2);
          }
        }
        coverIn(im, -cw / 2, -ch / 2 + bar, cw, ih, lerp(1, g('push', 1.06), clamp((t - 0.1) / L)));
        ctx.restore();
      }
      handles.card = [tx, ty];
      if (from === 'point') handles.origin = [ox, oy];
    }

    if (sc.module === 'parallax') {
      const bg = img(0);
      const fg = imgs[1] ?? (imgs[0] ? undefined : placeholderFg());
      const p = inout(t / L) - 0.5;
      const dir = String(P.dir ?? 'left');
      const z = g('zoom', 1.15);
      const k0 = Math.max(W / bg.width, H / bg.height);
      // 前景與背景用同一個幾何（前景通常是同一張照片去背）
      const layer = (im: Img, amt: number) => {
        const zz = dir === 'in' ? z * (1 + amt * 2 * (p + 0.5)) : z;
        const w = bg.width * k0 * zz;
        const h = bg.height * k0 * zz;
        let dx = 0;
        let dy = 0;
        const sh = amt * 2 * p;
        if (dir === 'left') dx = -sh * W;
        if (dir === 'right') dx = sh * W;
        if (dir === 'up') dy = -sh * H;
        if (dir === 'down') dy = sh * H;
        if (im === bg) {
          dx = Math.max(-(w - W) / 2, Math.min((w - W) / 2, dx));
          dy = Math.max(-(h - H) / 2, Math.min((h - H) / 2, dy));
        }
        ctx.drawImage(im, (W - w) / 2 + dx, (H - h) / 2 + dy, w, h);
        return [dx, dy];
      };
      const [bx, by] = layer(bg, g('amount', 0.05));
      const title = String(P.title ?? '');
      if (title) {
        const q = ease((t - 0.3) / 0.6);
        const fs = 150 * u * g('titleSize', 1);
        ctx.save();
        ctx.globalAlpha *= q;
        ctx.fillStyle = String(P.titleColor ?? '#ffffff');
        ctx.font = `900 ${fs}px ${F}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = title.split('\n');
        lines.forEach((l, i) => ctx.fillText(l, g('titleX', 0.5) * W + bx * 1.6, g('titleY', 0.36) * H + by * 1.6 + (1 - q) * 40 * u + (i - (lines.length - 1) / 2) * fs * 1.1));
        ctx.restore();
        handles.title = [g('titleX', 0.5) * W, g('titleY', 0.36) * H];
      }
      if (fg) layer(fg, g('fgAmount', 0.14));
    }

    if (sc.module === 'phone') {
      const shot = imgs[0] ?? placeholderTall();
      let pw = W * g('size', 0.5);
      let ph = pw * 2.05;
      if (ph > H * 0.88) {
        ph = H * 0.88;
        pw = ph / 2.05;
      }
      const tx = g('px', 0.5) * W;
      const ty = g('py', 0.5) * H;
      const from = String(P.from ?? 'bottom');
      const e = back(t / 0.8);
      const m = ease(t / 0.8);
      const dist = Math.max(W, H);
      const ox = from === 'left' ? -dist : from === 'right' ? dist : 0;
      const oy = from === 'bottom' ? dist : 0;
      const bezel = String(P.bezel ?? '#151515');
      ctx.save();
      ctx.translate(tx + ox * (1 - m), ty + oy * (1 - m) + Math.sin(t * 1.3) * 5 * u * clamp(t - 0.8));
      ctx.rotate((lerp(g('angle', 8), 0, e) * Math.PI) / 180);
      if (from === 'none') ctx.scale(lerp(0.86, 1, e), lerp(0.86, 1, e));
      ctx.globalAlpha *= clamp(t / 0.12);
      const R = pw * 0.15;
      const b = pw * 0.04;
      ctx.fillStyle = bezel;
      ctx.fillRect(pw / 2 - b * 0.3, -ph * 0.22, b * 0.9, ph * 0.1);
      ctx.fillRect(-pw / 2 - b * 0.6, -ph * 0.28, b * 0.9, ph * 0.05);
      ctx.fillRect(-pw / 2 - b * 0.6, -ph * 0.2, b * 0.9, ph * 0.09);
      ctx.beginPath();
      ctx.roundRect(-pw / 2, -ph / 2, pw, ph, R);
      ctx.fill();
      const sx = -pw / 2 + b;
      const sy = -ph / 2 + b;
      const sw = pw - 2 * b;
      const sh = ph - 2 * b;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, R - b);
      ctx.clip();
      ctx.fillStyle = '#000';
      ctx.fillRect(sx, sy, sw, sh);
      const dh = shot.height * (sw / shot.width);
      if (dh <= sh) coverIn(shot, sx, sy, sw, sh);
      else {
        const off = (dh - sh) * g('scroll', 0.7) * inout((t - g('sdelay', 1.1)) / Math.max(0.5, g('sdur', 3)));
        ctx.drawImage(shot, sx, sy - off, sw, dh);
      }
      ctx.restore();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-sw * 0.15, sy + b * 0.7, sw * 0.3, b * 1.7, b);
      ctx.fill();
      ctx.restore();
      handles.card = [tx, ty];
    }

    if (sc.module === 'flip') {
      const A = imgs[0] ?? placeholder(0, false);
      const B = imgs[1] ?? placeholder(1, true);
      const [cw, ch] = fitCard(A, g('size', 0.74), g('aspect', 0.75), 0.68);
      const r = g('radius', 18) * u;
      const a = 180 * inout((t - g('hold', 1.2)) / Math.max(0.3, g('dur', 0.9)));
      const showB = a > 90;
      const ang = (((showB ? a - 180 : a) * Math.PI) / 180) * -1;
      const idle = (Math.sin(t * 1.2) * 3 * Math.PI) / 180;
      const x = g('px', 0.5) * W;
      const y = g('py', 0.46) * H;
      const tex = frameTex(showB ? B : A, cw, ch, 0, r, '#ffffff');
      const ax = P.axis === 'x';
      drawCard3D(ctx, W, H, tex, x, y, cw, ch, g('depth', 14) * u, ax ? ang : idle * 0.5, ax ? idle : ang + idle, String(P.edge ?? '#e8e2d6'), clamp(t / 0.2));
      pill(String((showB ? P.labelB : P.labelA) ?? ''), x, y + ch / 2 + 64 * u, 40 * u);
      handles.card = [x, y];
    }

    if (sc.module === 'stack') {
      const n = ci(g('count', 4), 1, 4);
      const labels = labelsOf('labels');
      const seed = g('seed', 3);
      const rnd = (k: number) => {
        const x = Math.sin((seed * 97 + k) * 12.9898) * 43758.5453;
        return x - Math.floor(x);
      };
      const bd = g('border', 18) * u;
      const bt = g('bottom', 80) * u;
      let cw = W * g('size', 0.6);
      let ch = (cw - 2 * bd) / g('aspect', 1) + bd + bt;
      if (ch > H * 0.62) {
        cw *= (H * 0.62) / ch;
        ch = H * 0.62;
      }
      const spread = g('spread', 0.5);
      const dist = Math.max(W, H) * 0.9;
      for (let i = 0; i < n; i++) {
        const t0 = 0.15 + i * g('interval', 0.55);
        if (t < t0) continue;
        const e = back((t - t0) / 0.6);
        const m = ease((t - t0) / 0.6);
        const fx = g('px', 0.5) * W + (rnd(i * 3) - 0.5) * W * 0.32 * spread;
        const fy = g('py', 0.46) * H + (rnd(i * 3 + 1) - 0.5) * H * 0.16 * spread;
        const rot = (rnd(i * 3 + 2) - 0.5) * 26 * spread;
        const from = P.from === 'mix' ? ['top', 'left', 'right', 'bottom'][i % 4] : String(P.from ?? 'top');
        const ox = from === 'left' ? -dist : from === 'right' ? dist : 0;
        const oy = from === 'top' ? -dist : from === 'bottom' ? dist : 0;
        const tex = polaroid(cyc(i), cw, ch, bd, bt, String(P.frame ?? '#ffffff'), labels[i] ?? '', String(P.ink ?? '#2b2b2b'));
        ctx.save();
        ctx.translate(fx + ox * (1 - m), fy + oy * (1 - m));
        ctx.rotate(((rot + (1 - e) * (i % 2 ? 28 : -28)) * Math.PI) / 180);
        const s = lerp(1.2, 1, clamp(e));
        ctx.scale(s, s);
        ctx.drawImage(tex, -cw / 2, -ch / 2, cw, ch);
        ctx.restore();
      }
      handles.card = [g('px', 0.5) * W, g('py', 0.46) * H];
    }

    if (sc.module === 'grid') {
      const cols = ci(g('cols', 2), 1, 3);
      const rows = ci(g('rows', 2), 1, 3);
      const gap = g('gap', 14) * u;
      const pad = g('pad', 60) * u;
      const cw = (W - 2 * pad - (cols - 1) * gap) / cols;
      const ch = (H - 2 * pad - (rows - 1) * gap) / rows;
      const n = cols * rows;
      const labels = labelsOf('labels');
      const order = String(P.order ?? 'row');
      const rank = Array.from({ length: n }, (_, k) => k);
      if (order === 'diag') rank.forEach((_, k) => (rank[k] = (k % cols) + Math.floor(k / cols)));
      if (order === 'random') {
        const perm = rank.map((k) => k).sort((a, b) => Math.sin(a * 78.233 + 1) - Math.sin(b * 78.233 + 1));
        perm.forEach((k, r) => (rank[k] = r));
      }
      const style = String(P.style ?? 'pop');
      const rr = g('radius', 16) * u;
      for (let k = 0; k < n; k++) {
        const t0 = 0.15 + rank[k] * g('interval', 0.3);
        if (t < t0) continue;
        const p = clamp((t - t0) / 0.5);
        const x = pad + (k % cols) * (cw + gap);
        const y = pad + Math.floor(k / cols) * (ch + gap);
        ctx.save();
        const cx = x + cw / 2;
        const cy = y + ch / 2;
        if (style === 'pop') {
          const s = lerp(0.55, 1, back(p));
          ctx.translate(cx, cy);
          ctx.scale(s, s);
          ctx.translate(-cx, -cy);
          ctx.globalAlpha *= ease(p / 0.6);
        } else if (style === 'flip') {
          ctx.translate(cx, cy);
          ctx.scale(Math.max(0.01, Math.sin((ease(p) * Math.PI) / 2)), 1);
          ctx.translate(-cx, -cy);
        } else if (style === 'slide') {
          ctx.translate(0, (1 - ease(p)) * ch * 0.35);
          ctx.globalAlpha *= ease(p / 0.6);
        }
        ctx.beginPath();
        if (style === 'wipe') ctx.roundRect(x, y, Math.max(1, cw * ease(p)), ch, rr);
        else ctx.roundRect(x, y, cw, ch, rr);
        ctx.clip();
        coverIn(cyc(k), x, y, cw, ch, lerp(1, g('push', 1.06), clamp((t - t0) / L)));
        ctx.restore();
        if (labels[k] && p > 0.5) pill(labels[k], x + 18 * u, y + ch - 42 * u, 30 * u, 'left');
      }
    }

    if (sc.module === 'split') {
      const n = ci(g('count', 2), 2, 3);
      const side = P.dir !== 'h';
      const gap = g('gap', 10) * u;
      const labels = labelsOf('labels');
      const pw = side ? (W - gap * (n - 1)) / n : W;
      const ph = side ? H : (H - gap * (n - 1)) / n;
      const from = String(P.from ?? 'alt');
      for (let k = 0; k < n; k++) {
        const t0 = 0.1 + k * g('stagger', 0.3);
        if (t < t0) continue;
        const p = ease((t - t0) / 0.7);
        const x0 = side ? k * (pw + gap) : 0;
        const y0 = side ? 0 : k * (ph + gap);
        ctx.save();
        ctx.beginPath();
        if (from === 'grow') {
          if (side) ctx.rect(x0, y0 + (ph * (1 - p)) / 2, pw, ph * p);
          else ctx.rect(x0 + (pw * (1 - p)) / 2, y0, pw * p, ph);
        } else ctx.rect(x0, y0, pw, ph);
        ctx.clip();
        if (from !== 'grow') {
          const sign = from === 'alt' && k % 2 ? -1 : 1;
          if (side) ctx.translate(0, (1 - p) * ph * sign);
          else ctx.translate((1 - p) * pw * sign, 0);
        }
        coverIn(cyc(k), x0, y0, pw, ph, lerp(1, g('push', 1.06), clamp((t - t0) / L)));
        ctx.restore();
        if (labels[k] && p > 0.6) pill(labels[k], x0 + 28 * u, y0 + 56 * u, 34 * u, 'left');
      }
      if (gap > 0 && t > 0.1) {
        const p = ease((t - 0.1) / 0.6);
        ctx.fillStyle = String(P.line ?? '#ffffff');
        for (let k = 1; k < n; k++) {
          if (side) ctx.fillRect(k * (pw + gap) - gap, 0, gap, H * p);
          else ctx.fillRect(0, k * (ph + gap) - gap, W * p, gap);
        }
      }
    }

    if (sc.module === 'freeze') {
      const im = img(0);
      const hold = g('hold', 1.2);
      const e = ease((t - hold) / 0.5);
      const s = lerp(1, g('shrink', 0.84), e);
      const b = (g('border', 16) * u * e) / s;
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate((lerp(0, g('tilt', -3), e) * Math.PI) / 180);
      ctx.scale(s, s);
      if (b > 0) {
        ctx.fillStyle = String(P.frame ?? '#ffffff');
        ctx.fillRect(-W / 2 - b, -H / 2 - b, W + 2 * b, H + 2 * b);
      }
      ctx.translate(-W / 2, -H / 2);
      drawCover(ctx, im, W, H, 1, 0.5, 0.5);
      ctx.restore();
      if (t >= hold) {
        if (g('flash', 1)) {
          ctx.save();
          ctx.globalAlpha *= 1 - clamp((t - hold) / 0.3);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, W, H);
          ctx.restore();
        }
        if (t > hold + 0.2 && P.stamp) pill(String(P.stamp), 48 * u, 80 * u, 34 * u, 'left', '#e5322d', '#ffffff');
        const ring = String(P.ring ?? '#ff5a36');
        const ax = g('ax', 0.56) * W;
        const ay = g('ay', 0.55) * H;
        const ar = g('ar', 0.09) * S;
        const lx = g('lx', 0.32) * W;
        const ly = g('ly', 0.24) * H;
        const p1 = ease((t - hold - 0.55) / 0.45);
        if (p1 > 0) {
          ctx.strokeStyle = ring;
          ctx.lineWidth = 9 * u;
          ctx.beginPath();
          ctx.arc(ax, ay, ar, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p1);
          ctx.stroke();
        }
        const p2 = ease((t - hold - 0.9) / 0.35);
        if (p2 > 0) {
          const ang = Math.atan2(ly - ay, lx - ax);
          const x1 = ax + Math.cos(ang) * ar;
          const y1 = ay + Math.sin(ang) * ar;
          ctx.strokeStyle = ring;
          ctx.lineWidth = 7 * u;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(lerp(x1, lx, p2), lerp(y1, ly, p2));
          ctx.stroke();
        }
        const p3 = back((t - hold - 1.15) / 0.4);
        if (t > hold + 1.15 && P.label) {
          ctx.save();
          ctx.translate(lx, ly);
          ctx.scale(Math.max(0.01, p3), Math.max(0.01, p3));
          pill(String(P.label), 0, 0, 44 * u, 'center', ring, isLight(ring) ? '#151515' : '#ffffff');
          ctx.restore();
        }
      }
      handles.target = [g('ax', 0.56) * W, g('ay', 0.55) * H];
      handles.label = [g('lx', 0.32) * W, g('ly', 0.24) * H];
    }

    if (sc.module === 'mask') {
      const A = img(0);
      const B = imgs[1];
      const p = inout((t - g('delay', 0.3)) / Math.max(0.2, g('dur', 1.2)));
      const z = lerp(1, g('push', 1.06), clamp(t / L));
      if (B) drawCover(ctx, B, W, H, z, 0.5, 0.5);
      const cx = g('cx', 0.5) * W;
      const cy = g('cy', 0.5) * H;
      const shape = String(P.shape ?? 'circle');
      const D = Math.hypot(W, H);
      const far = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
      const path = () => {
        ctx.beginPath();
        if (shape === 'circle') ctx.arc(cx, cy, Math.max(0.01, far * p), 0, Math.PI * 2);
        else if (shape === 'diamond') {
          const R = Math.max(0.01, (Math.max(cx, W - cx) + Math.max(cy, H - cy)) * p);
          ctx.moveTo(cx, cy - R);
          ctx.lineTo(cx + R, cy);
          ctx.lineTo(cx, cy + R);
          ctx.lineTo(cx - R, cy);
          ctx.closePath();
        } else if (shape === 'rect') {
          const w = Math.max(1, 2 * Math.max(cx, W - cx) * p);
          const h = Math.max(1, 2 * Math.max(cy, H - cy) * p);
          ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 24 * u);
        } else {
          const T = ctx.getTransform();
          ctx.translate(W / 2, H / 2);
          ctx.rotate((g('angle', 20) * Math.PI) / 180);
          if (shape === 'wipe') ctx.rect(-D / 2, -D / 2, D * p, D);
          else if (shape === 'split') ctx.rect((-D / 2) * p, -D / 2, D * p, D);
          else {
            const nb = ci(g('bands', 6), 2, 16);
            const bw = D / nb;
            for (let k = 0; k < nb; k++) ctx.rect(-D / 2 + k * bw, -D / 2, bw * clamp(p * 1.5 - (k / nb) * 0.5), D);
          }
          ctx.setTransform(T);
        }
      };
      if (p > 0) {
        ctx.save();
        path();
        ctx.clip();
        drawCover(ctx, A, W, H, z, 0.5, 0.5);
        ctx.restore();
        if (g('edgeW', 10) > 0 && p < 1) {
          ctx.save();
          path();
          ctx.strokeStyle = String(P.edge ?? '#ffd23f');
          ctx.lineWidth = g('edgeW', 10) * u;
          ctx.stroke();
          ctx.restore();
        }
      }
      if (shape === 'circle' || shape === 'diamond' || shape === 'rect') handles.center = [cx, cy];
    }

    // 預留尾端定格，PNG 序列的最後一格（L - 1/fps）也必須完成。
    const motionTime = (end: number) => t * Math.max(1, end / Math.max(0.1, L - 0.15));
    const noise = (n: number) => {
      const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return v - Math.floor(v);
    };

    if (sc.module === 'slices') {
      const count = ci(g('count', 7), 2, 16);
      const horizontal = P.axis !== 'v';
      const delay = g('delay', 0.2);
      const dur = Math.max(0.2, g('dur', 0.9));
      const stagger = g('stagger', 0.09);
      const end = delay + dur + (count - 1) * stagger;
      const clock = motionTime(end);
      if (clock >= end) drawCover(ctx, img(0), W, H, 1, 0.5, 0.5);
      else for (let i = 0; i < count; i++) {
        const rank = P.order === 'reverse' ? count - 1 - i : P.order === 'center' ? Math.abs(i - (count - 1) / 2) : i;
        const p = ease((clock - delay - rank * stagger) / dur);
        if (!p) continue;
        const x = horizontal ? 0 : (i / count) * W;
        const y = horizontal ? (i / count) * H : 0;
        const w = horizontal ? W : W / count;
        const h = horizontal ? H / count : H;
        const offset = (i % 2 ? 1 : -1) * (1 - p);
        ctx.save();
        ctx.translate(horizontal ? offset * W : 0, horizontal ? 0 : offset * H);
        ctx.beginPath();
        ctx.rect(x, y, w + 0.5, h + 0.5);
        ctx.clip();
        drawCover(ctx, img(0), W, H, 1, 0.5, 0.5);
        ctx.restore();
      }
    }

    if (sc.module === 'tiles') {
      const cols = ci(g('cols', 4), 2, 8);
      const rows = ci(g('rows', 5), 2, 8);
      const seed = g('seed', 3);
      const delay = g('delay', 0.2);
      const dur = Math.max(0.2, g('dur', 0.8));
      const span = g('stagger', 1.1);
      const end = delay + dur + span;
      const clock = motionTime(end);
      if (clock >= end) drawCover(ctx, img(0), W, H, 1, 0.5, 0.5);
      else {
        const heights = Array.from({ length: rows }, (_, r) => 0.65 + noise(seed + r * 9));
        const sumH = heights.reduce((a, b) => a + b, 0);
        let y = 0;
        for (let row = 0; row < rows; row++) {
          const h = (heights[row] / sumH) * H;
          const widths = Array.from({ length: cols }, (_, c) => 0.65 + noise(seed + row * 47 + c * 13));
          const sumW = widths.reduce((a, b) => a + b, 0);
          let x = 0;
          for (let col = 0; col < cols; col++) {
            const w = (widths[col] / sumW) * W;
            const rank = P.order === 'random' ? noise(seed + row * cols + col + 300) : P.order === 'row' ? (row * cols + col) / (rows * cols - 1) : (row + col) / (rows + cols - 2);
            const p = ease((clock - delay - rank * span) / dur);
            if (p) {
              const cx = x + w / 2;
              const cy = y + h / 2;
              ctx.save();
              ctx.translate(cx, cy + (1 - p) * h * 0.3);
              ctx.scale(p, p);
              ctx.translate(-cx, -cy);
              ctx.beginPath();
              ctx.rect(x, y, w + 0.5, h + 0.5);
              ctx.clip();
              drawCover(ctx, img(0), W, H, 1, 0.5, 0.5);
              ctx.restore();
            }
            x += w;
          }
          y += h;
        }
      }
    }

    if (sc.module === 'tear') {
      const delay = g('delay', 0.7);
      const dur = Math.max(0.2, g('dur', 1.8));
      const p = inout((motionTime(delay + dur) - delay) / dur);
      drawCover(ctx, img(p >= 1 ? 1 : 0), W, H, 1, 0.5, 0.5);
      if (p > 0 && p < 1) {
        const dir = String(P.dir ?? 'right');
        const horizontal = dir === 'left' || dir === 'right';
        const major = horizontal ? W : H;
        const cross = horizontal ? H : W;
        const rough = g('rough', 35) * u;
        const paper = g('paper', 22) * u;
        const pad = rough + paper + 2;
        const at = lerp(-pad, major + pad, p);
        const map = (a: number, b: number): [number, number] => dir === 'left' ? [W - a, b] : dir === 'down' ? [b, a] : dir === 'up' ? [b, H - a] : [a, b];
        const path = (offset: number) => {
          ctx.beginPath();
          ctx.moveTo(...map(-pad, -pad));
          for (let i = 0; i <= 48; i++) ctx.lineTo(...map(at + (noise(i + g('seed', 4) * 17) * 2 - 1) * rough + offset, -pad + ((cross + pad * 2) * i) / 48));
          ctx.lineTo(...map(-pad, cross + pad));
          ctx.closePath();
        };
        path(paper);
        ctx.fillStyle = String(P.color ?? '#f5f1e8');
        ctx.fill();
        ctx.save();
        path(0);
        ctx.clip();
        drawCover(ctx, img(1), W, H, 1, 0.5, 0.5);
        ctx.restore();
      }
    }

    if (sc.module === 'collage') {
      if (imgs[0]) drawCover(ctx, imgs[0], W, H, 1, 0.5, 0.5);
      const count = ci(g('count', 3), 1, 3);
      const delay = g('delay', 0.2);
      const dur = Math.max(0.2, g('dur', 0.7));
      const stagger = g('stagger', 0.35);
      const clock = motionTime(delay + dur + (count - 1) * stagger);
      const positions = [[0.35, 0.34], [0.65, 0.5], [0.42, 0.7]];
      for (let i = 0; i < count; i++) {
        const cx = g(`x${i + 1}`, positions[i][0]) * W;
        const cy = g(`y${i + 1}`, positions[i][1]) * H;
        handles[`cut${i + 1}`] = [cx, cy];
        const progress = clamp((clock - delay - i * stagger) / dur);
        if (!progress) continue;
        const im = imgs[i + 1] ?? placeholderCutout(i);
        const [cw, ch] = fitCard(im, g('size', 0.6), 0, 0.6);
        const bd = g('border', 16) * u;
        const tex = cutoutTex(im, cw, ch, bd, String(P.color ?? '#ffffff'));
        const q = back(progress);
        ctx.save();
        ctx.translate(cx + (i % 2 ? 1 : -1) * W * (1 - q), cy + H * 0.12 * (1 - q));
        ctx.rotate(((i % 2 ? 1 : -1) * g('angle', 12) + 18 * (1 - q)) * Math.PI / 180);
        const scale = lerp(0.7, 1, q);
        ctx.scale(scale, scale);
        ctx.drawImage(tex, -tex.width / 2, -tex.height / 2);
        ctx.restore();
      }
    }

    if (sc.module === 'morph') {
      const delay = g('delay', 0.5);
      const dur = Math.max(0.4, g('dur', 2.2));
      const progress = clamp((motionTime(delay + dur) - delay) / dur);
      if (imgs[1]) drawCover(ctx, imgs[1], W, H, 1, 0.5, 0.5);
      if (progress >= 1) drawCover(ctx, img(0), W, H, 1, 0.5, 0.5);
      else {
        const d = g('radius', 0.18) * S * 2;
        const first = inout(progress * 2);
        const second = inout((progress - 0.5) * 2);
        const pw = Math.max(d, W * 0.88);
        const ph = d * 0.8;
        const w = progress < 0.5 ? lerp(d, pw, first) : lerp(pw, W, second);
        const h = progress < 0.5 ? lerp(d, ph, first) : lerp(ph, H, second);
        const cx = lerp(g('cx', 0.5) * W, W / 2, second);
        const cy = lerp(g('cy', 0.5) * H, H / 2, second);
        const radius = (Math.min(w, h) / 2) * (1 - second);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cx - w / 2, cy - h / 2, w, h, radius);
        ctx.clip();
        drawCover(ctx, img(0), W, H, 1, 0.5, 0.5);
        ctx.restore();
        if (g('border', 6)) {
          ctx.beginPath();
          ctx.roundRect(cx - w / 2, cy - h / 2, w, h, radius);
          ctx.strokeStyle = String(P.color ?? '#ffffff');
          ctx.lineWidth = g('border', 6) * u * (1 - second);
          ctx.stroke();
        }
      }
      handles.center = [g('cx', 0.5) * W, g('cy', 0.5) * H];
    }

    if (sc.module === 'occlude') {
      const delay = g('delay', 0.8);
      const dur = Math.max(0.4, g('dur', 1.8));
      const p = inout((motionTime(delay + dur) - delay) / dur);
      drawCover(ctx, img(p < 0.5 ? 0 : 1), W, H, 1, 0.5, 0.5);
      if (p > 0 && p < 1) {
        const horizontal = P.dir !== 'up' && P.dir !== 'down';
        const major = horizontal ? W : H;
        const cross = horizontal ? H : W;
        const angle = P.shape === 'door' ? 0 : Math.tan(g('angle', 12) * Math.PI / 180);
        // 在中點底板必須完全覆蓋畫面；加上斜邊位移，透明前景也不會露出換景接縫。
        const width = major * Math.max(1.05, g('width', 1.3)) + Math.abs(angle) * cross;
        let center = lerp(-width / 2 - Math.abs(angle) * cross, major + width / 2 + Math.abs(angle) * cross, p);
        if (P.dir === 'left' || P.dir === 'up') center = major - center;
        const point = (a: number, b: number): [number, number] => horizontal ? [a, b] : [b, a];
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(...point(center - width / 2 - angle * cross / 2, 0));
        ctx.lineTo(...point(center + width / 2 - angle * cross / 2, 0));
        ctx.lineTo(...point(center + width / 2 + angle * cross / 2, cross));
        ctx.lineTo(...point(center - width / 2 + angle * cross / 2, cross));
        ctx.closePath();
        ctx.fillStyle = String(P.color ?? '#ff5a36');
        ctx.fill();
        ctx.clip();
        if (imgs[2]) {
          const im = imgs[2];
          const k = Math.min((horizontal ? width : W) / im.width, (horizontal ? H : width) / im.height);
          const [cx, cy] = point(center, cross / 2);
          ctx.drawImage(im, cx - im.width * k / 2, cy - im.height * k / 2, im.width * k, im.height * k);
        } else if (P.shape === 'door') {
          const [cx, cy] = point(center + major * 0.25, cross / 2);
          ctx.fillStyle = '#f5f1e8';
          ctx.beginPath();
          ctx.roundRect(cx - 12 * u, cy - 48 * u, 24 * u, 96 * u, 12 * u);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    if (sc.module === 'zoomthru') {
      const A = img(0);
      const B = img(1);
      const at = g('at', 2.6);
      const d = Math.max(0.3, g('dur', 1.1));
      const depth = Math.max(1.5, g('depth', 5));
      const cx = g('cx', 0.5) * W;
      const cy = g('cy', 0.42) * H;
      const circle = P.mode !== 'cut';
      const zoomAt = (im: Img, z: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(z, z);
        ctx.translate(-cx, -cy);
        drawCover(ctx, im, W, H, 1, 0.5, 0.5);
        ctx.restore();
      };
      const q = clamp((t - (at - d)) / d);
      if (t < at) {
        zoomAt(A, Math.exp(Math.log(depth) * q * q) * lerp(1, 1.04, clamp(t / at)));
        if (circle && q > 0.55) {
          const k = (q - 0.55) / 0.45;
          const R = Math.hypot(W, H) * k * k;
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(0.01, R), 0, Math.PI * 2);
          ctx.clip();
          zoomAt(B, lerp(2.2, 1.6, k));
          ctx.restore();
          ctx.strokeStyle = String(P.ring ?? '#ffffff');
          ctx.lineWidth = 8 * u;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(0.01, R), 0, Math.PI * 2);
          ctx.stroke();
        }
      } else zoomAt(B, lerp(circle ? 1.6 : 2.2, 1, ease((t - at) / 0.9)));
      handles.center = [cx, cy];
    }

    drawCaption(ctx, W, H, sc.caption, t, u);
    if (sc.caption?.text) handles.caption = [sc.caption.x * W, sc.caption.y * H];
    return handles;
  };

  return { drawPhoto, coverParams, placeholder };
};

export const { drawPhoto, coverParams, placeholder } = photoRenderer();
(globalThis as unknown as { MA_PHOTO: unknown }).MA_PHOTO = { drawPhoto };

export const PHOTO_GLOBALS = `${FONTS_GLOBALS}window.MA_PHOTO=${fnSource(photoRenderer)}();`;
registerEngine('photo', PHOTO_GLOBALS);
