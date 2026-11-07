// 字內實拍實機檢查：產生一支會變色的測試片，在圖片工作室看 16:9、9:16、透明，
// 確認時間軸前後像素不同、HTML 是靜態預覽且沒有影片。
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const chrome = ['/opt/google/chrome/chrome', '/usr/bin/google-chrome'].find((p) => existsSync(p));
if (!chrome) throw new Error('找不到 Chrome');
const out = '/opt/cursor/artifacts';
const copy = '/workspace/artifacts';
mkdirSync(out, { recursive: true });
mkdirSync(copy, { recursive: true });
const save = (name, buf) => {
  writeFileSync(`${out}/${name}`, buf);
  writeFileSync(`${copy}/${name}`, buf);
};

const browser = await chromium.launch({ executablePath: chrome, args: ['--autoplay-policy=no-user-gesture-required'] });
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
      ctx.fillStyle = '#8d6b45';
      ctx.fillRect(48, 210, 220, 80);
      ctx.fillStyle = t < 1 ? '#ff3030' : '#30c0ff';
      ctx.fillRect(0, 70 + (t * 40) % 80, 640, 90);
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
const videoPath = '/tmp/textmatte-living.webm';
writeFileSync(videoPath, Buffer.from(webm.bytes));
save('textmatte-source.webm', Buffer.from(webm.bytes));

const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], {
  cwd: '/workspace',
  stdio: ['ignore', 'pipe', 'pipe'],
});
const portReady = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('預覽伺服器沒有起來')), 30000);
  const on = (buf) => {
    const s = String(buf);
    if (s.includes('4175') || s.includes('Local')) {
      clearTimeout(timer);
      resolve();
    }
  };
  preview.stdout.on('data', on);
  preview.stderr.on('data', on);
  preview.on('exit', (code) => reject(new Error(`預覽結束 ${code}`)));
});
await portReady;

const report = { webm: { bytes: webm.bytes.length, mime: webm.mime }, checks: [] };
const fail = (name, detail) => {
  report.checks.push({ name, ok: false, detail });
  throw new Error(`${name}：${detail}`);
};
const ok = (name, detail) => report.checks.push({ name, ok: true, detail });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const logs = [];
  page.on('pageerror', (e) => logs.push(String(e)));
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
  const scrub = async (t) => {
    await page.locator('#psTime').evaluate((el, time) => {
      el.value = String(time);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, t);
    await page.waitForTimeout(450);
  };
  const stats = () => page.evaluate(() => {
    const c = document.querySelector('#psCanvas');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let red = 0;
    let blue = 0;
    let sig = 0;
    for (let i = 0; i < d.length; i += 16) {
      sig = (Math.imul(sig, 33) + d[i] + d[i + 1] + d[i + 2]) >>> 0;
      if (d[i] > 180 && d[i + 2] < 90) red++;
      if (d[i + 2] > 150 && d[i] < 90) blue++;
    }
    return { w: c.width, h: c.height, sig, red, blue };
  });
  await scrub(0.1);
  const early = await stats();
  const earlyUrl = await page.evaluate(() => document.querySelector('#psCanvas').toDataURL('image/png'));
  save('textmatte-16x9-early.png', Buffer.from(earlyUrl.split(',')[1], 'base64'));
  await scrub(1.6);
  const late = await stats();
  const lateUrl = await page.evaluate(() => document.querySelector('#psCanvas').toDataURL('image/png'));
  save('textmatte-16x9-late.png', Buffer.from(lateUrl.split(',')[1], 'base64'));
  if (early.sig === late.sig) fail('畫格有變', `簽名相同 red ${early.red}/${late.red} blue ${early.blue}/${late.blue}`);
  ok('畫格有變', { early, late });

  await page.click('#psRatio button[data-v="9:16"]');
  await page.waitForTimeout(400);
  const bands = await page.evaluate(() => {
    const c = document.querySelector('#psCanvas');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    const bg = (i) => Math.abs(d[i] - 0x12) < 18 && Math.abs(d[i + 1] - 0x16) < 18 && Math.abs(d[i + 2] - 0x1e) < 18;
    let top = 0;
    let bot = 0;
    const row = c.width * 4;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x += 4) {
        const i = y * row + x * 4;
        if (bg(i)) continue;
        if (y < c.height * 0.42) top++;
        else if (y > c.height * 0.48) bot++;
      }
    }
    return { top, bot, w: c.width, h: c.height, png: c.toDataURL('image/png') };
  });
  save('textmatte-9x16.png', Buffer.from(bands.png.split(',')[1], 'base64'));
  if (bands.top < 20 || bands.bot < 20) fail('直式兩行', JSON.stringify(bands));
  ok('直式兩行', { top: bands.top, bot: bands.bot, w: bands.w, h: bands.h });

  await page.locator('#psTrans').check();
  await page.waitForTimeout(300);
  const alpha = await page.evaluate(() => {
    const c = document.querySelector('#psCanvas');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let opaque = 0;
    const corner = [d[3], d[(c.width - 1) * 4 + 3]];
    for (let i = 3; i < d.length; i += 16) {
      if (d[i] === 0) clear++;
      else if (d[i] > 200) opaque++;
    }
    return { clear, opaque, corner, png: c.toDataURL('image/png') };
  });
  save('textmatte-alpha.png', Buffer.from(alpha.png.split(',')[1], 'base64'));
  if (alpha.corner.some((a) => a !== 0) || alpha.clear < 50 || alpha.opaque < 20) fail('字外透明', JSON.stringify({ clear: alpha.clear, opaque: alpha.opaque, corner: alpha.corner }));
  ok('字外透明', { clear: alpha.clear, opaque: alpha.opaque, corner: alpha.corner });

  await page.locator('#psTrans').uncheck();
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#psHtml')]);
  const htmlPath = `${out}/textmatte-still.html`;
  await download.saveAs(htmlPath);
  writeFileSync(`${copy}/textmatte-still.html`, readFileSync(htmlPath));
  const html = readFileSync(htmlPath, 'utf8');
  if (/<video|data:video|octet-stream|blob:/i.test(html)) fail('HTML 不含影片', '檔案裡出現影片標記');
  if (!html.includes('沒有影片') || !html.includes('data-video="absent"')) fail('HTML 說明', '沒有看到靜態說明');
  ok('HTML 靜態預覽', { bytes: html.length });

  const offline = await browser.newPage();
  const requests = [];
  offline.on('request', (r) => {
    if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) requests.push(r.url());
  });
  await offline.goto(`file://${htmlPath}`, { waitUntil: 'load' });
  const note = await offline.locator('.note').innerText();
  const videos = await offline.locator('video').count();
  await offline.screenshot({ path: `${out}/textmatte-html-still.png` });
  await offline.screenshot({ path: `${copy}/textmatte-html-still.png` });
  if (videos !== 0 || !note.includes('沒有影片')) fail('離線開啟', note);
  ok('離線開啟', { note, outsideRequests: requests });
  await offline.close();

  writeFileSync('/tmp/textmatte-bad.mp4', 'this is not a video');
  await page.setInputFiles('#psFile', '/tmp/textmatte-bad.mp4');
  await page.waitForFunction(() => (document.querySelector('#toast')?.textContent || '').includes('無法解碼') || (document.querySelector('#psSlots')?.innerText || '').includes('無法解碼'), null, { timeout: 8000 });
  let downloaded = false;
  const gate = page.waitForEvent('download', { timeout: 1500 }).then(() => {
    downloaded = true;
  }).catch(() => {});
  await page.click('#psHtml');
  await gate;
  const toast = await page.locator('#toast').innerText();
  if (downloaded) fail('壞檔不匯出', '仍然下載了 HTML');
  if (!toast.includes('不會改') && !toast.includes('無法解碼') && !toast.includes('停止')) fail('壞檔說明', toast);
  ok('壞檔停止', { toast, downloaded });

  if (logs.length) fail('頁面錯誤', logs.join('\n'));
  ok('頁面沒有錯誤', {});
  await page.close();
} finally {
  preview.kill('SIGTERM');
  await browser.close();
}

const text = JSON.stringify(report, null, 2);
save('textmatte-report.json', text);
console.log(text);
preview.kill('SIGTERM');
setTimeout(() => process.exit(0), 300);
