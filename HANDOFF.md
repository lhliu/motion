# HANDOFF：圖解字卡 411–424（feat/diagram-cards）

## 狀態
- PR 待審，**未 merge、未部署**。程式碼由 Grok Bot 內建 AI 自行撰寫（未用 Codex／Claude Code／agy）。分支從最新 main 切出。

## 內容
- `src/render/dcard.ts`：自包含渲染器（序列化進 OBJ_GLOBALS 成 `MA_DCARD`），14 張卡 + 道具 + 4 風格。
- `src/render/prop.ts` 新增 `dcard` MOD；`src/propkit.ts` 參數（mode/style/title/sub/items/values/speed）；`src/effects/object.ts` 註冊 411–424（`obj-dcard-<key>`）；`src/data.ts` 子分類 dcard。
- 版面：W/H ≤ 0.75 用直式（1080×1920 基準等比縮放），否則橫式：左側標題、右側圖等比縮放。
- 時間：建構約 0–3.4 秒，之後 idle（k）。

## 驗證
- `npm run build` 通過；`npm run check:visual -- obj-dcard-` 有問題 0。
- 截圖：/workspace/zikaji/diagram-cards/anim/（contact-9x16.png、contact-16x9.png、contact-*-mid.png、presets.png，以及每張 ×4 風格 ×2 比例 ×1.4s/5.5s）。

## 限制
- 橫式圖解區縮放約 0.7，小字較小。
- 「values」只覆寫有數字的卡（長條、甜甜圈、金字塔、大數字、漏斗、啞鈴等）；items 依各卡順序對應。
- 「角落編號」解讀為流程步驟的編號徽章，已移除。
