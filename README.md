# Motion Atlas｜字卡與文字特效圖鑑

https://motion.leichthub.com

收集影片用得到的字卡與文字動態特效（目前 113 招、12 類）。每一招都是原生 HTML／CSS／JS 即時渲染，可以：

- 依分類、情境標籤、關鍵字搜尋與瀏覽，收藏常用的招式
- 輸入自己的文字、切換配色（7 組預設 + 自訂主色），所有卡片即時套用
- 打開單一特效：切換 16:9／9:16／1:1、底色、播放速度，全螢幕錄影
- 一鍵複製提示詞：網頁實作（中文）、English、AI 影片生成，或直接複製／下載完整 HTML 原始碼

## MCP 與 Combo 庫

網站內建 MCP（Model Context Protocol）伺服器，讓 Claude、ChatGPT、Claude Code 直接使用這個圖鑑：描述需求 → AI 查特效 → 組成 Combo（多段特效串成一段動畫）→ 給預覽連結 → 存進 Combo 庫當日後參考。

- MCP 端點：`https://motion.leichthub.com/mcp`（Streamable HTTP、無狀態）
- 寫入（儲存／刪除 Combo）需要金鑰：網址加 `?key=金鑰`，或 `Authorization: Bearer 金鑰`
- 工具：`list_categories`、`search_effects`、`get_effect`、`compose_combo`、`save_combo`、`list_combos`、`get_combo`、`delete_combo`
- 公開 API：`GET /api/effects`、`GET /api/combos`、`GET /api/combos/:id`；寫入：`POST /api/combos`、`PUT|DELETE /api/combos/:id`
- 播放頁：`/c/<id>`（加 `?hud=0` 隱藏進度條，適合錄影）
- 未儲存的預覽：`/?combo=<編碼>`；網站分頁：`/?view=combos`、`/?view=draft`、`/?view=mcp`

連線方式（網站「Combo → MCP 連線」也有說明）：

```sh
# Claude Code
claude mcp add --transport http motion-atlas https://motion.leichthub.com/mcp --header "Authorization: Bearer 你的金鑰"
```

Claude 網頁版／App 與 ChatGPT（開發者模式）：新增自訂連接器，網址填 `https://motion.leichthub.com/mcp?key=你的金鑰`。

## 開發

```sh
npm ci
npm run dev      # http://127.0.0.1:4174
npm run build    # tsc 型別檢查 + vite build → dist/
npm run preview

# 含 MCP 與資料庫的本機測試（需要 wrangler）
npx wrangler pages dev dist --d1 DB=motion-local --binding MOTION_KEY=test
```

## 結構

| 路徑 | 用途 |
| --- | --- |
| `index.html` | 頁面骨架、詳細頁 dialog |
| `src/main.ts` | 篩選、搜尋、收藏、預覽管理、詳細頁、鍵盤操作 |
| `src/engine.ts` | 特效掛載引擎：CSS 範圍化、配色變數、速度控制 |
| `src/prompts.ts` | 四種提示詞產生器與單檔 HTML 匯出 |
| `src/data.ts` | 分類、配色、特效總表 |
| `src/effects/*.ts` | 12 個分類的特效定義 |
| `src/combo.ts` | Combo 驗證、HTML 播放器、提示詞（網站與伺服器共用） |
| `src/combo-ui.ts` | 網站的 Combo 庫、草稿編輯、MCP 說明 |
| `functions/mcp.ts` | MCP 伺服器（JSON-RPC） |
| `functions/_lib/tools.ts` | MCP 工具定義 |
| `functions/_lib/store.ts` | D1 資料庫存取（第一次使用自動建表） |
| `functions/api/`、`functions/c/` | REST API 與 Combo 播放頁 |
| `src/styles.css` | 網站樣式（站內 class 一律以 `ma-` 或具體前綴命名，避免滲入特效） |

## 新增一個特效

在對應分類檔加一筆 `Fx`：

- `css`：用 `.S` 代表特效根節點、`K_` 當 keyframes 前綴，會自動範圍化成 `.fx-<id>`
- 可用變數：`--bg` `--fg` `--ac` `--ac2` `--mu`、字體 `--sans` `--serif` `--mono`；尺寸用 `cqw`／`cqh`／`cqmin`
- `html(words)`：回傳特效 DOM；`run(root, words)`（選填）處理 JS 動畫並回傳清除函式。`run` 必須自給自足、不可引用模組變數，因為匯出時會用 `toString()` 內嵌
- `motion`／`motionEn`：給 AI 的動態描述，會組進提示詞
- 用 `@property` 註冊的自訂屬性是全域的，名稱請加特效專屬前綴

## 部署

Cloudflare Pages 連接本 repo（Git 整合），push 到 `main` 自動部署。

- Build command：`npm run build`
- Output directory：`dist`
- 環境變數：`NODE_VERSION=22`
- 自訂網域：`motion.leichthub.com`

MCP 與 Combo 庫另外需要（Pages 專案 → 設定）：

1. 建立 D1 資料庫（例如 `motion-combos`），在「繫結」新增 D1，變數名稱 `DB`。資料表會在第一次使用時自動建立。
2. 在「變數與機密」新增加密變數 `MOTION_KEY`（自己產生一組長隨機字串），這就是寫入金鑰。
3. 重新部署一次讓設定生效。

沒有設定時，網站與特效仍正常運作；MCP 可讀取特效，Combo 相關功能會回傳設定提示。
