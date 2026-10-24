// 自動畫面檢查的第一步：把每一招各輸出成一頁單段 Combo（不含 HUD、不循環），並寫出清單。
// 用法：tsx scripts/vc-render.ts <repo 根目錄> <輸出資料夾> [只檢查的 id 片段…]
// 根目錄可以是另一份 checkout（例如 main 的 worktree），用來產生比對基準。
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [root = '.', out = 'visual-report/cur', ...only] = process.argv.slice(2);
const load = (p: string) => import(pathToFileURL(resolve(root, p)).href);
// 繪製引擎改成按需載入後，命令列要先同步載入全部（舊版本沒有這個檔就略過）
await load('src/engines-all.ts').catch(() => {});
const { ALL_EFFECTS } = await load('src/data.ts');
const { comboHtml, sceneSeconds } = await load('src/combo.ts');

mkdirSync(out, { recursive: true });
const list: { id: string; no: number; zh: string; ratio: string; seconds: number; file: string }[] = [];
for (const f of ALL_EFFECTS) {
  if (only.length && !only.some((s) => f.id.includes(s))) continue;
  const ratio = f.preferredRatio ?? '9:16';
  // 用放進 Combo 時的預設秒數（舊版本沒有 sceneSeconds 就用 4 秒）
  const seconds = Math.min(12, sceneSeconds ? sceneSeconds({ effect: f.id }) : f.duration ?? 4);
  const file = `${f.id}.html`;
  writeFileSync(join(out, file), comboHtml({ title: f.id, ratio, transition: 'cut', scenes: [{ effect: f.id, seconds }] }, { hud: false, loop: false }));
  list.push({ id: f.id, no: f.no, zh: f.zh, ratio, seconds, file });
}
writeFileSync(join(out, 'manifest.json'), JSON.stringify(list));
console.log(`${list.length} 招 → ${out}`);
