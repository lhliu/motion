# HANDOFF：物件擴充批次 O1，有趣道具 376–383（feat/objects-o1）

## 狀態
- 已於 2026-10-27 squash merge（b3535ff，PR #9）並部署；正式站 376–383 正常、物件分類列不再出現 0 個的子分類、無 console 錯誤。程式碼由 Grok Bot 自行撰寫（未用 Codex／Claude Code／agy）。
- 整體計畫：物件分類由 47 個擴充到 100 個，分 O1–O6 共 53 個（計畫書：/workspace/zikaji/objects-100/PLAN.md）。這是第一批。

## 內容
- `src/types.ts`、`src/data.ts`：新增子分類 `fun` 有趣道具、`twlife` 台灣生活、`homecheck` 房屋看屋（sec: object）。
- `src/effects/fun-objects.ts`：376–383 八個有趣道具，純 CSS＋HTML，id 前綴 `obj-fun-`。
- `src/uses.ts`：八個都歸到「強調」emph 用途。

## 怎麼測
1. `npm ci && npm run build && npm run preview`，進「物件」→「有趣道具」，或開 `?fx=obj-fun-toaster`。
2. 截圖重產：`npx tsx out/objects-o1/gen.ts && python3 out/objects-o1/shoot.py`（out/ 不進 git）。

## 已知限制
- 這批是 CSS 特效，不是 propkit 的 canvas 物件，所以在「有趣道具」分頁按上方的「物件工作室」不會有專屬編輯器（會開預設的物件工作室）。
- 台灣生活、房屋看屋目前是 0 個；物件區會自動隱藏 0 個特效的子分類，等 O3–O6 補上就會出現。
- 抓娃娃機在 9:16 時機台偏小；夾子的位置是固定的，永遠夾第 1 顆膠囊。
- 彈簧拳擊手套：9:16 時盒蓋翻開會稍微超出左邊；出拳只有約 0.7 秒，暫停截圖不一定拍得到。
- 紙飛機的航線是固定的，在 9:16 時會被拉成直長形。
- 彈簧下樓梯：3–5 階；每階 1.1 秒，5 階時最後一階大約在 4.4 秒才走到。
- 便當盒最多 4 格。

## 圖解動畫 48 選：六批總結（2026-10-27）
| 批次 | 分類 | 新增 | 合併到既有 | PR | 狀態 |
|---|---|---|---|---|---|
| B1 | estate | 6 | — | 已 merge | 已上線 |
| B2 | card＋hook | 5 | 2（02、26） | 已 merge | 已上線 |
| B3 | chier＋kinetic＋impact | 7 | — | 已 merge | 已上線 |
| B4 | cstat＋cpie＋cbar＋cline | 4（364–367） | 3（23、35、38：圖表選項 @quad／@badge／@board） | #6（69b8e9a） | 已上線 |
| B5 | diagram＋pmark＋pmulti＋punit | 6（368–373） | — | #7（545b802） | 已上線 |
| B6 | caption＋news | 2（374–375） | — | #8（eacaa1d） | 已上線 |
- 合計：48 選 → **新增 30、合併 5、跳過 13**（跳過的都是跟既有特效重疊）。
- 新增特效全由 Grok Bot 自寫，未用 Codex／Claude Code／agy；照片／格局／文件類底圖都是自繪示意圖，無外部版權素材。
