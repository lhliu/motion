// 第 5 階段「固化」：把後台匯出（/api/admin/export 下載的 JSON）寫進 src/catalog.baked.json，讓程式預設跟 D1 同步。
// 永遠是「隱藏＋轉址」：只接受 hidden／cat／sort／tags／featured／featuredSort／redirect／variant，不刪任何招式、不改編號。
// 備註（note）與收藏（fav）是後台私有資料，不寫進 repo。
//
//   node scripts/bake-catalog.mjs export.json          只寫檔並列出變更摘要
//   node scripts/bake-catalog.mjs export.json --pr     另外開分支、commit、push、開 PR（不 merge）
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const [file, ...flags] = process.argv.slice(2);
if (!file) { console.error('用法：node scripts/bake-catalog.mjs <export.json> [--pr]'); process.exit(2); }
const src = JSON.parse(readFileSync(file, 'utf8'));
if (src.kind !== 'motion-atlas-catalog' || !Array.isArray(src.overrides)) { console.error('不是後台匯出的檔案'); process.exit(2); }
const KEEP = ['hidden', 'cat', 'sort', 'tags', 'featured', 'featuredSort', 'redirect', 'variant'];
const overrides = src.overrides
  .map((o) => Object.fromEntries([['id', String(o.id)], ...KEEP.filter((k) => o[k] !== null && o[k] !== undefined).map((k) => [k, o[k]])]))
  .filter((o) => Object.keys(o).length > 1)
  .sort((a, b) => a.id.localeCompare(b.id));
const out = { kind: 'motion-atlas-catalog', exported_at: src.exported_at ?? null, overrides };
writeFileSync('src/catalog.baked.json', JSON.stringify(out, null, 2) + '\n');
const count = (k) => overrides.filter((o) => k in o).length;
const summary = `固化後台覆寫（${src.exported_at ?? ''}）：共 ${overrides.length} 招；隱藏 ${overrides.filter((o) => o.hidden === true).length}、顯示 ${overrides.filter((o) => o.hidden === false).length}、改分類 ${count('cat')}、排序 ${count('sort')}、標籤 ${count('tags')}、精選 ${count('featured')}、轉址 ${count('redirect')}。不刪招、不改編號。`;
console.log(summary);
if (flags.includes('--pr')) {
  const br = `chore/bake-catalog-${new Date().toISOString().slice(0, 10)}`;
  const git = (...a) => execFileSync('git', a, { stdio: 'inherit' });
  git('checkout', '-b', br);
  git('add', 'src/catalog.baked.json');
  git('commit', '-m', `後台覆寫固化：${overrides.length} 招`);
  git('push', '-u', 'origin', br);
  execFileSync('gh', ['pr', 'create', '--title', `後台覆寫固化（${overrides.length} 招）`, '--body', `${summary}\n\n由後台「匯出固化」產生（scripts/bake-catalog.mjs）。固化後 D1 的覆寫可保留（重複無害）。請先跑 npm run build、npm test、npm run check:visual。`], { stdio: 'inherit' });
}
