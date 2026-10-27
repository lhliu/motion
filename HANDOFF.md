# HANDOFF：物件擴充批次 O3，台灣民情 392–401（feat/objects-o3）

## 狀態
- PR 待審，未 merge。程式碼由 Grok Bot 自行撰寫（未用 Codex／Claude Code／agy）。
- 整體計畫：物件 47 → 100，分 O1–O6（/workspace/zikaji/objects-100/PLAN.md）。

## 內容
- `src/effects/tw-objects.ts`：392–401，共 10 個；`src/data.ts` 匯入，`src/uses.ts` 歸「強調」emph。
- 歸在 `twlife` 台灣生活，所以「台灣生活」子分類開始顯示（10 個）。宗教題材（擲筊、燒金紙、廟宇）只做風格化色塊；垃圾車只有音符圖示，沒有音樂。

## 怎麼測
1. `npm ci && npm run build && npm run preview`，或開 `?fx=obj-tw-redenv`。
2. 截圖重產：`npx tsx out/objects-o3/gen.ts && cd out/objects-o3 && python3 shoot.py && python3 sheet.py N`（out/ 不進 git）。

## 已知限制
- 這批 16:9 的縮放係數是 0.8（O1/O2 是 1.1），畫面較小但不會出框。
- 發票號碼固定 8 位，非數字會被濾掉、不足補 0。
- 燒金紙的火焰在 16:9 只露出一小截。
- 紅包抽出的內容卡在 16:9 會貼近上緣。
- 便利商店最多 4 個選項；機車與垃圾車路線固定。
- 擲筊結果固定一正一反（聖筊），不會隨機。

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
