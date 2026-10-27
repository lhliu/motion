# HANDOFF：圖解批次 B5，特效 368–373（feat/effects-368-373）

## 狀態
- PR 已開，待 KC 審核；**尚未 merge、未部署**。程式碼由 Grok Bot 自行撰寫（未用 Codex／Claude Code／agy）。
- B4（364–367＋圖表選項）已於 2026-10-27 merge（69b8e9a，PR #6）並上線驗證。

## 內容
- `src/effects/visual-explain.ts`：gear-formula、iso-explode（diagram），zoom-detail、lens-annotate（pmark），before-after-drag（pmulti），plan-callouts（punit），no 368–373，純 CSS＋inline SVG。
- 示意底圖（街廓俯視、空屋／佈置客廳、格局、實價登錄表）都由程式用 SVG／HTML 畫出，跟著配色變；不需要也不使用外部照片。
- `src/effects/stat-explain.ts`：spotlight-bar 9:16 標籤位置修正。
- `src/data.ts`、`src/uses.ts`：註冊（歸 info）。

## 怎麼測
1. `npm ci && npm run build && npm run preview`，搜尋「齒輪」「等角」「推進」「放大鏡」「拖曳」「引線」。
2. 放大鏡：在要停的那筆前加「>」，「!」開頭寫註解；推進：「>」標目標。
3. 截圖重產：`npx tsx out/effects-368-373/gen.ts && python3 out/effects-368-373/shoot.py`（out/ 不進 git）。

## 已知限制
- 這批沒有接現有的照片／格局 studio（canvas 引擎），而是純 CSS 示意圖版；不能換成使用者自己的照片或格局圖。
- 前後拖曳的數字用 `@property` 整數計數，只顯示整數、不加千分位；需要 Chromium 系瀏覽器（Safari 16.4+、Firefox 128+ 也支援）。
- 格局引線標註固定 6 間示意格局，輸入只改名稱與坪數；9:16 時格局圖偏小。
- 放大鏡掃表最多 6 列、4 欄；路徑固定（左上→右→左下→目標）。
- 齒輪最多 4 個因子；等角圖層最多 5 層，太小的比例最少 3u 厚。
- 放大鏡掃表會輸出一段 inline `<style>`（選擇器用 `.fx-lens-annotate`）；同一個 Combo 放兩段且目標列不同時，以後者為準。
