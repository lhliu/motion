// 自動畫面檢查：每一招截三格（Combo 段落的 45%、90%、99%），抓出執行錯誤、素材載入失敗、整格空白，
// 有基準版本時再逐像素比對，列出畫面變了的招式。結果寫到 visual-report/index.html。
//
//   npm run check:visual                    只檢查錯誤與空白
//   npm run check:visual -- --base main     同時跟 main 比對（也可給 commit 或 origin/main）
//   npm run check:visual -- mx- cut-        只檢查 id 含這些字的招式
//
// 有錯誤或空白畫面時結束碼為 1；只有畫面差異不算失敗，請人工看報告確認。
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const bi = args.indexOf('--base');
const baseRef = bi >= 0 ? args[bi + 1] : '';
const only = args.filter((a, i) => !a.startsWith('--') && (bi < 0 || i !== bi + 1));
const OUT = resolve('visual-report');
const SIZE = { '9:16': [360, 640], '16:9': [640, 360], '1:1': [480, 480] };
const AT = [0.45, 0.9, 0.99];
const DIFF = 0.015; // 超過 1.5% 的像素明顯不同才算有變（改一行字就會超過；更低會被抗鋸齒雜訊誤判）

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'img'), { recursive: true });
const tsx = (root, out) => execFileSync('npx', ['tsx', resolve('scripts/vc-render.ts'), root, out, ...only], { stdio: 'inherit' });

// 1. 產生頁面：目前的工作目錄，以及（可選）基準版本的 worktree
tsx('.', join(OUT, 'cur'));
if (baseRef) {
  const wt = join(tmpdir(), `ma-vc-${process.pid}`);
  execFileSync('git', ['worktree', 'add', '--detach', '-f', wt, baseRef], { stdio: 'ignore' });
  try {
    symlinkSync(resolve('node_modules'), join(wt, 'node_modules'));
    tsx(wt, join(OUT, 'base'));
  } finally {
    execFileSync('git', ['worktree', 'remove', '--force', wt], { stdio: 'ignore' });
  }
}

// 2. 小型靜態伺服器：/cur、/base 是產生的頁面、/img 是截圖，其他路徑（/media 等）走 public/
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = /^\/(cur|base|img)\//.test(p) ? join(OUT, p) : join(resolve('public'), p);
  if (!file.startsWith(OUT) && !file.startsWith(resolve('public'))) return res.writeHead(403).end();
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

// 3. 截圖
const launch = async () => {
  try {
    return await chromium.launch();
  } catch (e) {
    const fallback = '/opt/pw-browsers/chromium';
    if (existsSync(fallback)) return chromium.launch({ executablePath: fallback });
    throw e;
  }
};
const browser = await launch();
const cur = JSON.parse(readFileSync(join(OUT, 'cur/manifest.json'), 'utf8'));
const baseIds = baseRef ? new Set(JSON.parse(readFileSync(join(OUT, 'base/manifest.json'), 'utf8')).map((m) => m.id)) : new Set();

const shoot = async (side, m, tag = side) => {
  const [width, height] = SIZE[m.ratio] ?? SIZE['9:16'];
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`執行錯誤：${e.message}`));
  page.on('console', (msg) => msg.type() === 'error' && !/Failed to load resource|net::ERR_FAILED/.test(msg.text()) && errors.push(`console：${msg.text()}`));
  // 外部字型一律擋掉（結果才會穩定），本機素材 404 才算錯
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  page.on('response', (r) => r.status() >= 400 && errors.push(`素材 ${r.status()}：${new URL(r.url()).pathname}`));
  // install 之後時鐘仍照真實時間走，要先暫停，畫面才只由 runFor 推進
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  // 固定亂數種子，兩次渲染的粒子、星點位置才會一樣
  await page.addInitScript(() => {
    let a = 20260101;
    Math.random = () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  });
  const shots = [];
  try {
    await page.goto(`${ORIGIN}/${side}/${m.file}`, { waitUntil: 'load', timeout: 20000 });
    // 播放器等字型就緒才開始第一段（字型被擋，就緒時間是真實時間），先等它，段落才會在假時鐘 0 秒開始
    await page.evaluate(() => document.fonts.ready);
    // 先推一小段讓段落開始，等圖片素材真的載完、解碼完，再往後跑時鐘
    await page.clock.runFor(50);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => {}))));
    await page.waitForTimeout(100);
    let t = 50;
    for (const at of AT) {
      const target = Math.round(m.seconds * 1000 * at);
      await page.clock.runFor(target - t);
      t = target;
      // CSS 動畫不吃假時鐘，手動停在同一個時間點（播放器已定格的動畫不超過定格點）
      await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = a.__maEnd != null ? Math.min(ms, a.__maEnd) : ms; }), target);
      // 給圖片解碼與 canvas 繪製一點真實時間
      await page.waitForTimeout(60);
      const name = `${tag}-${m.id}-${Math.round(at * 100)}.png`;
      await page.screenshot({ path: join(OUT, 'img', name) });
      shots.push(name);
      await page.evaluate(() => document.getAnimations().forEach((a) => a.__maEnd == null && a.play()));
    }
  } catch (e) {
    errors.push(`載入失敗：${e.message.split('\n')[0]}`);
  }
  await ctx.close();
  return { errors, shots };
};

const results = [];
let next = 0;
const worker = async () => {
  while (next < cur.length) {
    const m = cur[next++];
    const a = await shoot('cur', m);
    const b = baseIds.has(m.id) ? await shoot('base', m) : null;
    results.push({ ...m, errors: a.errors, shots: a.shots, baseShots: b?.shots ?? [], isNew: !!baseRef && !baseIds.has(m.id) });
    process.stdout.write(`\r截圖 ${results.length}/${cur.length}`);
  }
};
await Promise.all(Array.from({ length: 4 }, worker));
console.log('');

// 4. 在瀏覽器裡算空白與差異（不需額外套件）
const judge = await browser.newPage();
await judge.goto(`${ORIGIN}/cur/manifest.json`);
const stats = (paths) =>
  judge.evaluate(async ([ps, diffTh]) => {
    const img = async (src) => {
      const im = new Image();
      im.src = src;
      await im.decode();
      const c = new OffscreenCanvas(im.width, im.height);
      const g = c.getContext('2d');
      g.drawImage(im, 0, 0);
      return g.getImageData(0, 0, im.width, im.height).data;
    };
    const [a, b] = await Promise.all(ps.map((p) => (p ? img(p) : null)));
    let sum = 0, sq = 0, changed = 0;
    const n = a.length / 4;
    for (let i = 0; i < a.length; i += 4) {
      const y = 0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2];
      sum += y;
      sq += y * y;
      if (b && Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 24) changed++;
    }
    const sd = Math.sqrt(Math.max(0, sq / n - (sum / n) ** 2));
    return { sd, diff: b ? (b.length === a.length ? changed / n : 1) : 0, diffTh };
  }, [paths, DIFF]);

for (const r of results) {
  r.blank = r.shots.length > 0;
  r.diff = 0;
  for (let k = 0; k < r.shots.length; k++) {
    const s = await stats([`${ORIGIN}/img/${r.shots[k]}`, r.baseShots[k] ? `${ORIGIN}/img/${r.baseShots[k]}` : null]);
    if (s.sd > 2) r.blank = false;
    (r.sds ??= []).push(s.sd);
    r.diff = Math.max(r.diff, s.diff);
  }
  // 有差異時兩邊各再拍一次：同一版本拍兩次就對不上，代表這招的畫格會飄（例如以畫格計數），列為不穩定而不算改動
  if (r.diff > DIFF && !r.errors.length && r.baseShots.length) {
    const again = await shoot('cur', r, 'again');
    const baseAgain = await shoot('base', r, 'base2');
    const d = async (x, y) => (x && y ? (await stats([`${ORIGIN}/img/${x}`, `${ORIGIN}/img/${y}`])).diff : 0);
    for (let k = 0; k < r.shots.length && !r.flaky; k++) {
      if ((await d(r.shots[k], again.shots[k])) > DIFF || (await d(r.baseShots[k], baseAgain.shots[k])) > DIFF) r.flaky = true;
    }
  }
}
await browser.close();
server.close();

// 5. 報告
// 段落結尾變空白：放進影片會在換段前閃一下空白（播放器應該讓動畫停在完成畫面）
for (const r of results) if (!r.blank && r.sds?.length === 3 && r.sds[2] < 3 && Math.max(r.sds[0], r.sds[1]) > 8) r.endBlank = true;
const bad = results.filter((r) => r.errors.length || r.blank || r.endBlank);
const changed = results.filter((r) => !bad.includes(r) && !r.flaky && r.diff > DIFF);
const flaky = results.filter((r) => !bad.includes(r) && r.flaky);
const fresh = results.filter((r) => !bad.includes(r) && r.isNew);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[c]};`);
const row = (r) => `<section><h3>#${r.no} ${esc(r.zh)} <code>${r.id}</code> <small>${r.ratio}・${r.seconds}s${r.diff ? `・差異 ${(r.diff * 100).toFixed(1)}%` : ''}</small></h3>
${r.errors.map((e) => `<p class=err>${esc(e)}</p>`).join('')}${r.blank ? '<p class=err>每一格都是單一顏色（空白畫面）</p>' : ''}${r.endBlank ? '<p class=err>段落結尾變成空白</p>' : ''}
<div class=shots>${r.shots.map((s, k) => `<figure>${r.baseShots[k] ? `<img src="img/${r.baseShots[k]}" title="基準">` : ''}<img src="img/${s}" title="目前"><figcaption>${Math.round(AT[k] * 100)}%${r.baseShots[k] ? '（左基準、右目前）' : ''}</figcaption></figure>`).join('')}</div></section>`;
const block = (title, list) => (list.length ? `<h2>${title}（${list.length}）</h2>${list.map(row).join('')}` : '');
writeFileSync(
  join(OUT, 'index.html'),
  `<!doctype html><meta charset=utf-8><title>畫面檢查</title><style>body{font:14px system-ui;margin:24px;background:#111;color:#eee}h3{font-size:15px;margin:18px 0 6px}small{color:#999;font-weight:400}.err{color:#ff7a7a;margin:2px 0}.shots{display:flex;gap:12px;flex-wrap:wrap}figure{margin:0}figure img{height:220px;border:1px solid #333;margin-right:4px}figcaption{color:#999;font-size:12px}code{color:#9cf}</style>
<h1>畫面檢查 <small>${results.length} 招${baseRef ? `・基準 ${esc(baseRef)}` : ''}・${new Date().toLocaleString('zh-TW')}</small></h1>
<p>有問題 ${bad.length}・畫面有變 ${changed.length}・新招 ${fresh.length}・不穩定 ${flaky.length}</p>
${block('有問題', bad)}${block('畫面有變（請確認是否預期）', changed)}${block('新招', fresh)}${block('不穩定（同一版本拍兩次也不同，差異僅供參考）', flaky)}${bad.length + changed.length + fresh.length + flaky.length ? '' : '<p>全部通過，畫面與基準一致。</p>'}`,
);
console.log(`有問題 ${bad.length}・畫面有變 ${changed.length}・新招 ${fresh.length}・不穩定 ${flaky.length} → ${join(OUT, 'index.html')}`);
for (const r of bad) console.log(`  ✗ ${r.id}：${[...r.errors, ...(r.blank ? ['空白畫面'] : []), ...(r.endBlank ? ['段落結尾變空白'] : [])].join('；')}`);
process.exit(bad.length ? 1 : 0);
