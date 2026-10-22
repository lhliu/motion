// 共用輸出工具：檔案下載、PNG 序列 ZIP、透明 WebM 錄製
/* ───────── 最小 ZIP（不壓縮，PNG 本身已壓縮） ───────── */
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (d: Uint8Array) => {
  let c = 0xffffffff;
  for (let i = 0; i < d.length; i++) c = CRC[(c ^ d[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
export const zip = (files: { name: string; data: Uint8Array }[]): Blob => {
  const enc = new TextEncoder();
  const parts: BlobPart[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const crc = crc32(f.data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, f.data.length, true);
    h.setUint32(22, f.data.length, true);
    h.setUint16(26, name.length, true);
    parts.push(h.buffer, name, f.data as BlobPart);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, f.data.length, true);
    c.setUint32(24, f.data.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    const entry = new Uint8Array(46 + name.length);
    entry.set(new Uint8Array(c.buffer), 0);
    entry.set(name, 46);
    central.push(entry);
    offset += 30 + name.length + f.data.length;
  }
  const size = central.reduce((a, c) => a + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, size, true);
  end.setUint32(16, offset, true);
  return new Blob([...parts, ...(central as BlobPart[]), end.buffer], { type: 'application/zip' });
};


export const saveBlob = (blob: Blob, name: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
};

export const stamp = () => new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');

export const canvasOf = (W: number, H: number) => {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return c;
};

/** 依時間逐格繪製並打包成 PNG 序列 */
export const pngSequence = async (W: number, H: number, seconds: number, draw: (ctx: CanvasRenderingContext2D, t: number) => void, onProgress: (i: number, n: number) => void, fps = 30): Promise<Blob> => {
  const c = canvasOf(W, H);
  const ctx = c.getContext('2d')!;
  const n = Math.max(1, Math.round(seconds * fps));
  const files: { name: string; data: Uint8Array }[] = [];
  for (let i = 0; i < n; i++) {
    draw(ctx, i / fps);
    const b = await new Promise<Blob>((r) => c.toBlob((x) => r(x!), 'image/png'));
    files.push({ name: `frame_${String(i).padStart(4, '0')}.png`, data: new Uint8Array(await b.arrayBuffer()) });
    if (i % 5 === 0) onProgress(i + 1, n);
  }
  return zip(files);
};

/** 即時錄製透明 WebM（Chrome 會保留 alpha） */
export const recordWebm = (W: number, H: number, seconds: number, draw: (ctx: CanvasRenderingContext2D, t: number) => void, onProgress: (p: number) => void): Promise<Blob> | null => {
  const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
  if (!mime) return null;
  const c = canvasOf(W, H);
  const ctx = c.getContext('2d')!;
  const rec = new MediaRecorder(c.captureStream(30), { mimeType: mime, videoBitsPerSecond: 12_000_000 });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  return new Promise((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    const dur = seconds * 1000;
    const start = performance.now();
    rec.start();
    const tick = (now: number) => {
      const e = now - start;
      draw(ctx, e / 1000);
      onProgress(Math.min(1, e / dur));
      if (e < dur) requestAnimationFrame(tick);
      else rec.stop();
    };
    requestAnimationFrame(tick);
  });
};
