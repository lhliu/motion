# Motion Atlas｜字卡與文字特效圖鑑

https://motion.leichthub.com

收集影片用得到的字卡與文字動態特效（目前 113 招、12 類）。每一招都是原生 HTML／CSS／JS 即時渲染，可以：

- 依分類、情境標籤、關鍵字搜尋與瀏覽，收藏常用的招式
- 輸入自己的文字、切換配色（7 組預設 + 自訂主色），所有卡片即時套用
- 打開單一特效：切換 16:9／9:16／1:1、底色、播放速度，全螢幕錄影
- 一鍵複製提示詞：網頁實作（中文）、English、AI 影片生成，或直接複製／下載完整 HTML 原始碼

## 開發

```sh
npm ci
npm run dev      # http://127.0.0.1:4174
npm run build    # tsc 型別檢查 + vite build → dist/
npm run preview
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
