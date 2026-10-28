# HANDOFF：圖解字卡 411–424（feat/diagram-cards）

## 狀態
- PR 待審，**未 merge、未部署**。程式碼由 Grok Bot 內建 AI 自行撰寫（未用 Codex／Claude Code／agy）。分支從最新 main 切出。

## 內容
- `src/render/dcard.ts`：自包含渲染器（序列化進 OBJ_GLOBALS 成 `MA_DCARD`），14 張卡 + 道具 + 4 風格。
- `src/render/prop.ts` 新增 `dcard` MOD；`src/propkit.ts` 參數（mode/style/title/sub/items/values/speed）；`src/effects/object.ts` 註冊 411–424（`obj-dcard-<key>`）；`src/data.ts` 子分類 dcard（2026-10-28 改 `sec: 'chart'`，顯示在圖表工作區；id 仍為 `obj-dcard-*`，繪製仍走物件引擎，所屬工作區只由 CATEGORIES 的 sec 決定）。
- 版面：W/H ≤ 0.75 用直式（1080×1920 基準等比縮放），否則橫式：左側標題、右側圖等比縮放。
- 時間：建構約 0–3.4 秒，之後 idle（k）。

## 驗證
- `npm run build` 通過；`npm run check:visual -- obj-dcard-` 有問題 0。
- 截圖：/workspace/zikaji/diagram-cards/anim/（contact-9x16.png、contact-16x9.png、contact-*-mid.png、presets.png，以及每張 ×4 風格 ×2 比例 ×1.4s/5.5s）。

## 限制
- 橫式圖解區縮放約 0.7，小字較小。
- 「values」只覆寫有數字的卡（長條、甜甜圈、金字塔、大數字、漏斗、啞鈴等）；items 依各卡順序對應。
- 「角落編號」解讀為流程步驟的編號徽章，已移除。

## 看屋物件分類修正（fix/dcard-to-chart）
- 物件「看屋物件」的 CatId 改為 `oestate`（`src/types.ts`、`src/data.ts`）；404–409 在 `src/effects/object.ts` 以 `cat: 'oestate'` 覆寫，繪製模組仍為 `estate`、id 仍為 `obj-estate-*`。`src/main.ts` 物件工作室按鈕把 `oestate` 對應回 `estate` 模組。
- 元件「房產資訊」維持 `estate`（15 招）。

## 擴充包（feat/ma-expansion）
- 253 招 425–677，程式在 src/render/xp/pNN.ts、清單 src/effects/xpack.ts。截圖 /workspace/zikaji/expansion/sheets/（INDEX.md）。
- build 通過、check:visual 0 問題。PR 待審，未 merge、未部署。
- 待 KC 決定：d58a466、588f723、a3f60a7 新增的「圖解字卡・圖表一致」風格（另一個 session 做的）；目前預設已改回 v1 米白經典。
- 第 29 包（Lottie 匯入）跳過：需要 lottie-web 等重型依賴與檔案上傳流程，留待另案。
- 已知限制：P15、P22 疊字與 P18 直式進度條標籤偏小；P17 樓板橫式偏扁；P21 紅包封口較粗略；P27 陸塊、P28 台灣輪廓與潛勢分區皆為示意，非官方圖資；nw-law 重點詞換行時螢光筆會失準；P31 屋主圖示頭頂略貼圓邊。
- 一律為 Canvas 自繪動畫，數字皆為示意。
