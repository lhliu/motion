# HANDOFF：物件擴充批次 O2，有趣道具 384–390＋售屋吊牌 391（feat/objects-o2）

## 狀態
- 已於 2026-10-27 squash merge（92f634e，PR #10）並部署；正式站 384–391 正常、「房屋看屋」出現 1 招、無 console 錯誤。程式碼由 Grok Bot 自行撰寫（未用 Codex／Claude Code／agy）。
- O1（376–383）已於 2026-10-27 squash merge 為 b3535ff 並上線；物件區自動隱藏 0 個特效的子分類。
- 整體計畫：物件 47 → 100，分 O1–O6（/workspace/zikaji/objects-100/PLAN.md）。這是第二批。

## 內容
- `src/effects/fun-objects-2.ts`：384–391 八個特效（有趣 9–15＋計畫第 36 項售屋吊牌）。
- `src/data.ts`：匯入 `funObjects2`；`src/uses.ts`：八個都歸「強調」emph。
- 售屋吊牌歸在 `homecheck`，所以「房屋看屋」子分類會開始顯示（1 個）。

## 怎麼測
1. `npm ci && npm run build && npm run preview`，進「物件」→「有趣道具」／「房屋看屋」，或開 `?fx=obj-fun-gum`。
2. 截圖重產：`npx tsx out/objects-o2/gen.ts && cd out/objects-o2 && python3 shoot.py && python3 sheet.py N`（out/ 不進 git）。

## 已知限制
- 骰子只畫正面，點數 1–6；第二幀才顯示總和。
- 遙控器最多 4 台；轉台為瞬切加雜訊。
- 磁鐵吸字標題建議 ≤12 字；爆米花最多 5 個關鍵字，9:16 時左右散開幅度減半。
- 售屋吊牌的資訊列版面固定；「已成交」章蓋在吊牌下半部，會壓到資訊列文字。
- 泡泡糖破掉那一瞬間（約 3.2 秒）畫面是空的，暫停截圖可能拍到空白。

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
