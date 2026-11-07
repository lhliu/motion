// 按圖片工作室真正的 WebM／PNG 序列按鈕，再用解碼後的靜態畫格檢查。
// 測試片前 1 秒是紅條、之後是藍條，條的位置會往下移。
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const chrome = ['/opt/google/chrome/chrome', '/usr/bin/google-chrome'].find((p) => existsSync(p));
if (!chrome) throw new Error('找不到 Chrome');
const outDir = '/opt/cursor/artifacts';
const copyDir = '/workspace/artifacts';
mkdirSync(outDir, { recursive: true });
mkdirSync(copyDir, { recursive: true });
const save = (name, buf) => {
  writeFileSync(join(outDir, name), buf);
  writeFileSync(join(copyDir, name), buf);
  return join(outDir, name);
};

const fail = (name, detail) => {
  const text = typeof detail === 'string' ? detail : JSON.stringify(detail);
  throw new Error(`${name}：${text}`);
};

const browser = await chromium.launch({
  executablePath: chrome,
  args: ['--autoplay-policy=no-user-gesture-required'],
});
const maker = await browser.newPage();
const webm = await maker.evaluate(async () => {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 360;
  const ctx = c.getContext('2d');
  const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
  if (!mime) throw new Error('沒有 WebM 錄製');
  const rec = new MediaRecorder(c.captureStream(30), { mimeType: mime });
  const chunks = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const stopped = new Promise((r) => (rec.onstop = r));
  rec.start();
  const t0 = performance.now();
  await new Promise((resolve) => {
    const tick = (now) => {
      const t = (now - t0) / 1000;
      ctx.fillStyle = '#d7c4a8';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = '#8eb6d6';
      ctx.fillRect(180, 24, 280, 140);
      ctx.fillStyle = '#c9a36a';
      ctx.fillRect(0, 250, 640, 110);
      ctx.fillStyle = t < 1 ? '#ff3030' : '#30c0ff';
      ctx.fillRect(0, 40 + (t * 50) % 120, 640, 100);
      if (t < 2.4) requestAnimationFrame(tick);
      else {
        rec.stop();
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
  await stopped;
  const blob = new Blob(chunks, { type: rec.mimeType });
  return { mime: rec.mimeType, bytes: [...new Uint8Array(await blob.arrayBuffer())] };
});
await maker.close();
const videoPath = '/tmp/textmatte-export-src.webm';
writeFileSync(videoPath, Buffer.from(webm.bytes));

const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], {
  cwd: '/workspace',
  stdio: ['ignore', 'pipe', 'pipe'],
});
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('預覽伺服器沒有起來')), 30000);
  const on = (buf) => {
    if (String(buf).includes('4175') || String(buf).includes('Local')) {
      clearTimeout(timer);
      resolve();
    }
  };
  preview.stdout.on('data', on);
  preview.stderr.on('data', on);
  preview.on('exit', (code) => reject(new Error(`預覽結束 ${code}`)));
});

const report = { source: { bytes: webm.bytes.length, mime: webm.mime }, checks: [] };
const ok = (name, detail) => report.checks.push({ name, ok: true, detail });

const probe = (path) => {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,duration,nb_frames,codec_name:format=duration', '-of', 'json', path], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || 'ffprobe 失敗');
  const parsed = JSON.parse(r.stdout);
  const stream = parsed.streams[0];
  const duration = Number(stream.duration ?? parsed.format?.duration);
  return {
    width: Number(stream.width),
    height: Number(stream.height),
    duration: Number.isFinite(duration) ? duration : null,
    frames: stream.nb_frames ? Number(stream.nb_frames) : null,
    codec: stream.codec_name,
  };
};

const rgbaOf = (path) => {
  const meta = probe(path);
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1'], { maxBuffer: meta.width * meta.height * 4 + 1024 });
  if (r.status !== 0) throw new Error(r.stderr?.toString() || 'ffmpeg 解碼失敗');
  return { ...meta, buf: r.stdout };
};

const colorStats = ({ buf, width }) => {
  let red = 0;
  let blue = 0;
  let clear = 0;
  let opaque = 0;
  let sig = 0;
  const step = 16;
  for (let i = 0; i < buf.length; i += step) {
    const a = buf[i + 3];
    sig = (Math.imul(sig, 33) + buf[i] + buf[i + 1] + buf[i + 2] + a) >>> 0;
    if (a === 0) clear++;
    else if (a > 200) {
      opaque++;
      if (buf[i] > 180 && buf[i + 2] < 90) red++;
      if (buf[i + 2] > 150 && buf[i] < 90) blue++;
    }
  }
  const corner = buf[3];
  const cornerR = buf[(width - 1) * 4 + 3];
  return { red, blue, clear, opaque, sig, corner, cornerR };
};

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(`page:${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/Failed to load resource|net::ERR_|fonts\.google|fonts\.gstatic/.test(text)) return;
    errors.push(`console:${text}`);
  });
  await page.goto('http://127.0.0.1:4175/?view=photo', { waitUntil: 'networkidle' });
  await page.waitForSelector('#photostudio[open] #psCanvas');
  await page.click('#psMod button[data-m="textmatte"]');
  await page.waitForSelector('#psHtml:not([hidden])');
  await page.setInputFiles('#psFile', videoPath);
  await page.waitForFunction(() => {
    const text = document.querySelector('#psSlots')?.innerText || '';
    return text.includes('×') && !text.includes('無法解碼');
  }, null, { timeout: 15000 });
  await page.click('#psRatio button[data-v="16:9"]');
  await page.locator('#psLoop').evaluate((el) => {
    el.value = '1.5';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#psParams input[data-k="in"]').evaluate((el) => {
    el.value = '0';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  if (await page.locator('#psTrans').isChecked()) await page.locator('#psTrans').uncheck();

  const webmDownload = page.waitForEvent('download', { timeout: 60000 });
  await page.click('#psWebm');
  const webmFile = await webmDownload;
  const webmPath = save('textmatte-export-sample.webm', readFileSync(await webmFile.path()));
  const webmMeta = probe(webmPath);
  if (webmMeta.width !== 1920 || webmMeta.height !== 1080) fail('WebM 尺寸', webmMeta);
  if (!(webmMeta.duration >= 1.2 && webmMeta.duration <= 2.4)) fail('WebM 長度', webmMeta);
  const earlyT = 0.15;
  const lateT = Math.max(0.4, webmMeta.duration - 0.25);
  const grab = (t, name) => {
    const dest = join(outDir, name);
    const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(t), '-i', webmPath, '-frames:v', '1', dest], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(r.stderr || '擷取 WebM 畫格失敗');
    writeFileSync(join(copyDir, name), readFileSync(dest));
    return colorStats(rgbaOf(dest));
  };
  const early = grab(earlyT, 'textmatte-webm-early.png');
  const late = grab(lateT, 'textmatte-webm-late.png');
  if (early.red < 200 || early.red <= early.blue) fail('WebM 前段應是紅條', { early, late, webmMeta });
  if (late.blue < 200 || late.blue <= late.red) fail('WebM 後段應是藍條', { early, late, webmMeta });
  if (early.sig === late.sig) fail('WebM 前後畫格相同', { early, late });
  ok('WebM 匯出', { ...webmMeta, early: { red: early.red, blue: early.blue }, late: { red: late.red, blue: late.blue }, bytes: readFileSync(webmPath).length });

  await page.locator('#psTrans').check();
  // 1.2 秒離紅藍分界約 6 格，避免 seek 落到前一格仍是紅條。
  const inField = await page.locator('#psParams input[data-k="in"]').evaluate((el) => {
    el.value = '1.2';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return { value: el.value, output: el.parentElement?.querySelector('output')?.textContent ?? '' };
  });
  if (Number(inField.value) !== 1.2) fail('起始秒控制沒有寫入', inField);
  const zipDownload = page.waitForEvent('download', { timeout: 180000 });
  await page.click('#psSeq');
  const zipFile = await zipDownload;
  const zipPath = save('textmatte-export-sample.zip', readFileSync(await zipFile.path()));
  const listed = spawnSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' });
  if (listed.status !== 0) fail('ZIP 打不開', listed.stderr);
  const names = listed.stdout.split('\n').map((s) => s.trim()).filter((s) => s.endsWith('.png'));
  if (names.length !== 45) fail('PNG 張數', { count: names.length, first: names[0], last: names.at(-1) });
  if (names[0] !== 'frame_0000.png' || names[44] !== 'frame_0044.png') fail('PNG 檔名順序', names.slice(0, 3).concat(names.slice(-2)));
  const seqDir = mkdtempSync(join(tmpdir(), 'textmatte-seq-'));
  const extracted = spawnSync('unzip', ['-o', '-q', zipPath, 'frame_0000.png', 'frame_0010.png', '-d', seqDir], { encoding: 'utf8' });
  if (extracted.status !== 0) fail('ZIP 解出畫格', extracted.stderr);
  const frame0 = colorStats(rgbaOf(join(seqDir, 'frame_0000.png')));
  const frame10 = colorStats(rgbaOf(join(seqDir, 'frame_0010.png')));
  writeFileSync(join(outDir, 'textmatte-pngseq-frame0.png'), readFileSync(join(seqDir, 'frame_0000.png')));
  writeFileSync(join(copyDir, 'textmatte-pngseq-frame0.png'), readFileSync(join(seqDir, 'frame_0000.png')));
  writeFileSync(join(outDir, 'textmatte-pngseq-frame10.png'), readFileSync(join(seqDir, 'frame_0010.png')));
  writeFileSync(join(copyDir, 'textmatte-pngseq-frame10.png'), readFileSync(join(seqDir, 'frame_0010.png')));
  const size0 = probe(join(seqDir, 'frame_0000.png'));
  if (size0.width !== 1920 || size0.height !== 1080) fail('PNG 尺寸', size0);
  if (frame0.corner !== 0 || frame0.cornerR !== 0 || frame0.clear < 1000 || frame0.opaque < 100) fail('字外透明', frame0);
  if (frame0.blue < 200 || frame0.blue <= frame0.red) fail('起始秒應從藍條開始，而不是片頭紅條', { ...frame0, inField });
  if (frame10.blue <= frame10.red) fail('後段仍應在藍條區間', frame10);
  if (frame0.sig === frame10.sig) fail('PNG 前後畫格沒有變化', { frame0, frame10 });
  ok('PNG 序列', {
    frames: names.length,
    size: { width: size0.width, height: size0.height },
    frame0: { red: frame0.red, blue: frame0.blue, clear: frame0.clear, opaque: frame0.opaque, corner: frame0.corner },
    frame10: { red: frame10.red, blue: frame10.blue, sigDiffers: true },
    bytes: readFileSync(zipPath).length,
  });
  rmSync(seqDir, { recursive: true, force: true });

  const appErrors = errors.filter((e) => !/favicon/i.test(e));
  if (appErrors.length) fail('主控台錯誤', appErrors);
  ok('沒有主控台錯誤', {});
  await page.close();
} finally {
  preview.kill('SIGTERM');
  await browser.close();
}

const text = JSON.stringify(report, null, 2);
save('textmatte-export-report.json', text);
console.log(text);
setTimeout(() => process.exit(0), 200);
