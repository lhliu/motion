// 第 4 階段：把 check:visual 的截圖（visual-report/img/cur-<id>-{45,90,99}.png）縮成 WebP 上傳到後台縮圖庫。
//   ADMIN_URL=http://localhost:8788 node scripts/thumbs-upload.mjs [id 前綴…]
// 正式環境經 Cloudflare Access：請用 Access 服務權杖（ACCESS_CLIENT_ID／ACCESS_CLIENT_SECRET）。
import { readdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const BASE = (process.env.ADMIN_URL ?? 'http://localhost:8788').replace(/\/$/, '');
const only = process.argv.slice(2);
const dir = 'visual-report/img';
const files = readdirSync(dir).filter((f) => /^cur-.+-(45|90|99)\.png$/.test(f));
const ids = [...new Set(files.map((f) => f.replace(/^cur-|-(45|90|99)\.png$/g, '')))].filter((id) => !only.length || only.some((p) => id.startsWith(p)));
const headers = { 'content-type': 'application/json', ...(process.env.ACCESS_CLIENT_ID ? { 'CF-Access-Client-Id': process.env.ACCESS_CLIENT_ID, 'CF-Access-Client-Secret': process.env.ACCESS_CLIENT_SECRET } : {}) };
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const page = await browser.newPage();
const shrink = (png) => page.evaluate(async (src) => {
  const img = new Image(); img.src = src; await img.decode();
  const w = 180, h = Math.round((img.height / img.width) * w), c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  return c.toDataURL('image/webp', 0.72).split(',')[1];
}, `data:image/png;base64,${png.toString('base64')}`);
let ok = 0, fail = 0;
for (const id of ids) {
  for (const [frame, pct] of [[0, 45], [1, 90], [2, 99]]) {
    let png; try { png = readFileSync(`${dir}/cur-${id}-${pct}.png`); } catch { continue; }
    const r = await fetch(`${BASE}/api/admin/thumbs`, { method: 'POST', headers, body: JSON.stringify({ id, frame, mime: 'image/webp', data: await shrink(png) }) });
    r.ok ? ok++ : (fail++, console.warn(id, frame, r.status, await r.text()));
  }
}
await browser.close();
console.log(`上傳 ${ok} 張，失敗 ${fail} 張（${ids.length} 招）`);
