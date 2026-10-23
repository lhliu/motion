# WORKLOG

## 2026-10-23（UTC+8）feat/font-picker
- 從 main（9fd5d00）開分支 `feat/font-picker`。
- 現況調查：字型由 `index.html` 的 Google Fonts 連結載入（7 個家族、依 unicode-range 分片）；特效用 CSS 變數 `--sans`／`--serif`，字重多寫死在各特效 CSS（900／700／500…）。
- 實作：
  - `src/fonts.ts`：新增 `FACES`（黑體／明體）、`WEIGHTS`（粗 900／中 500／細 300）、`preloadFace()`；Noto Serif TC 補 300。
  - `src/engine.ts`：`Vars` 加 `face`、`weight`；選了字體就把 `--sans`、`--serif` 換成同一套；選了字重就在 `.fx` 加 `data-fw` 與 `--fw`，用 `!important` 統一覆寫子元素字重。
  - `src/main.ts`、`index.html`：工作台加兩個下拉選單，全部卡片、Hero、詳細頁即時套用。
  - `src/prompts.ts`：下載 HTML 帶 `data-fw`；提示詞寫出所選字體與字重。
  - `src/effects/texture.ts`、`switch.ts`：canvas 文字改讀 `--fw`。
- 驗證：`npm run build` 通過；Playwright 截圖 7 張（原狀＋2 字體×3 字重）於 `out/font-picker/`，確認瀏覽器只下載所選字重（例：明體細只載 Noto Serif TC 300）。
- 補強（主代理）：Combo 場景加 `face`／`weight`（驗證、加入 Combo、播放與匯出 HTML 的 `data-fw`）；截圖移出 git。

## 2026-10-23 18:10（UTC+8）上線
- KC 核准「先上字型」。分支 merge 最新 main 後 build 通過，PR #1 squash merge → main `835a87d`。
- Cloudflare Pages Git 自動部署（check run：Cloudflare Pages success），約 1.5 分鐘上線。
- 正式站驗證：JS 含「跟字型組合／原字重」；黑體粗、明體細切換正常（`data-fw` 900／300，只載對應字重），無 page error。
