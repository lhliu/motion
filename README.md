# Motion Atlas｜字卡與文字特效圖鑑

https://motion.leichthub.com

短影音動態素材庫，分六個工作區（目前 223 招）＋套組：

- **文字特效**（121 招）：依用途分 6 類（開場標題、字幕標註、資訊字卡、轉場切換、強調情緒、風格氛圍），原本的 13 個技法分類改當「風格」篩選；首頁最上方是建案片常用 12 招（`src/uses.ts`）
- **圖片運鏡**（21 個模組）：單張運鏡（推拉、甩入、3D 卡片、視窗彈出、分層視差、手機框）、多張組合（前後對比、翻卡、拍立得、宮格、分割畫面）、標註轉場（放大鏡、影片定格標註、縮放穿越）、裁切與遮罩（遮罩揭露、切片錯位、拼塊組圖、撕紙揭露、剪報拼貼、形狀變換、前景遮擋換景）
- **地圖區位**（15 招）：捷運鐵路路網（單線路網、路線條、多線路網：轉乘站、焦點站、鐵路黑白線、規劃中虛線、區域圈，文字行描述 `src/transit.ts`，本機渲染 `/r/transit.js`）；基地框（可加減角點做 L 形）、路名、資訊卡、資訊條、圓形標記（A棟/B棟）、通勤路線、放射路線；場景可加「太空降落」開場
- **物件特效**（50 招）：水滴泡泡、隕石（隨機／對稱／圓潤／碎片 × 岩石／冰晶／熔岩／金屬）、魔術方塊（2–4 階 × 塑膠／金屬／花色／單色）、星空宇宙（星空／光速／星系／行星／太陽／月球／地球／低空飛越地球・月球・火星・太陽，可推近拉遠）、俯瞰空拍（城市／河流／山川／草原牛馬／農田／海岸／森林／交流道，含建築陰影、頂樓水塔、斑馬線、河濱、三合院、消波塊等細節）、交通工具（汽車／馬車／飛機／太空船／火車／輪船／熱氣球）、海底世界（魚群／海豚／巨鯨／迎面鯊魚／珊瑚／深海／潛水艇）；物件工作室 `/?view=object`，MCP `build_object_scene`，本機渲染 `/r/obj.js`
- **圖表特效**（20 招）：直條、堆疊直條、橫條、排名、瀑布、折線、區域、組合（雙軸）、圓餅、環圈、儀表板、進度環、象形圖、樹狀、旭日、漏斗、盒鬚、XY 散佈、泡泡、雷達；數據一行一筆「標籤 數值」（`src/chart.ts`，本機渲染 `/r/chart.js`），全站預覽文字只換標題
- **套組**：獨立分頁 `/?ws=kits`，常見段落順序的現成 Combo（`src/uses.ts` 的 KITS）
- **圖解動畫**：工法剖面與流程等一支一支客製的示意圖（樓板剖面層疊、同層排水剖面、預鑄工法流程），文字可換、構圖交給 AI 改寫（`src/effects/diagram.ts`）

每一招都是原生 HTML／CSS／JS 即時渲染，可以：

- 站頂切換工作區（`/?ws=photo`、`/?ws=map`），再依分類、情境標籤、關鍵字搜尋與瀏覽，收藏常用的招式
- 輸入自己的文字、切換配色（7 組預設 + 自訂主色），所有卡片即時套用
- 打開單一特效：切換 16:9／9:16／1:1、底色、播放速度，全螢幕錄影
- 一鍵複製提示詞：網頁實作（中文）、English、AI 影片生成，或直接複製／下載完整 HTML 原始碼

## MCP 與 Combo 庫

網站內建 MCP（Model Context Protocol）伺服器，讓 Claude、ChatGPT、Claude Code 直接使用這個圖鑑：描述需求 → AI 查特效 → 組成 Combo（多段特效串成一段動畫）→ 給預覽連結 → 存進 Combo 庫當日後參考。

- MCP 端點：`https://motion.leichthub.com/mcp`（Streamable HTTP、無狀態）
- 寫入（儲存／刪除 Combo）需要金鑰：網址加 `?key=金鑰`，或 `Authorization: Bearer 金鑰`
- 工具：`list_categories`、`search_effects`、`get_effect`、`build_map_scene`、`build_drop_scene`、`build_photo_scene`、`list_presets`、`get_preset`、`save_preset`、`compose_combo`、`save_combo`、`list_combos`、`get_combo`、`delete_combo`

### 與 AI 來回修改（預設）

1. AI 用 `build_map_scene`／`build_drop_scene`／`build_photo_scene` 產生段落，回傳 `edit_url`；`get_combo` 也會回傳每段的 `scene_edit_urls`
2. 打開 `edit_url` 進入對應工作室，手動調整後按「存成預設」，得到代碼（例如 `p7k2x`）；之後按「存回」會更新同一個代碼
3. 把代碼告訴 AI（工作室有「複製給 AI」），AI 用 `get_preset` 讀取，或在 Combo 的 scenes 直接寫 `{ "preset": "p7k2x" }`
4. 網址：`/?edit=p7k2x`（已存的預設）、`/?edit=map|drop|photo&d=…`（尚未存的設定）
5. API：`GET /api/presets?kind=map|drop|photo`、`GET /api/presets/:id`；寫入 `POST /api/presets`、`PUT|DELETE /api/presets/:id`

Combo 存的是預設當下的內容（快照）；預設更新後，請 AI 重新以 `{ "preset": 代碼 }` 存一次 Combo。

### 海底世界

物件工作區新增「海底世界」（`ocean`，#188–194）：魚群穿梭、海豚同行、巨鯨經過、鯊魚迎面衝刺、珊瑚花園、深海下潛、潛水艇探索。預設為 9:16、8 秒、無文字；也支援 16:9 與 1:1。套組頁有「珊瑚生態」「巨物相遇」「深海探險」。

在物件工作室選海底世界，切換主角後可調配色、大小、數量、速度、路線、水流與深海明暗。鯊魚可調衝刺起點（片長比例）、張嘴、震動與擦身／遮滿結尾；潛水艇可開關探照燈。勾透明背景、將海底場景切成「只有主角」，可輸出去背 PNG、PNG 序列或 WebM。深海下潛本身是全景動畫，透明輸出保留岩壁與顆粒。

MCP 使用 `build_object_scene`，`module: "ocean"`，`params.mode` 為 `fish | dolphins | whale | shark | coral | deep | submarine`。卡片、工作室、預設、Combo 與 `/r/obj.js` 共用自給自足的 Canvas 引擎；種子與時間相同即輸出相同畫面。所有物件均為硬邊向量，不使用陰影、模糊或光暈。鯊魚衝刺與巨鯨經過是有起訖的片段，循環播放會重新開始；需要完整動作時請保留場景設定的片長。

啟動 Vite 後開啟 `/tests/ocean.html`，可預覽七種動畫並檢查三種比例、透明度、時間變化、匯出一致性、MCP、預設及套組。結果為 `window.oceanResults`。

「巨鯨經過・精修插畫」（`whale-illustrated`，#200）是獨立的一招，與向量版 `obj-ocean-whale`（#190）並列，既有海底動畫、工作室參數與套組都保留。它使用 Demo 的座頭鯨去背插畫及海景，以 WebGL 紋理局部形變呈現尾部、身體與胸鰭的不同相位；固定 12 秒、預設 9:16、無文字，也支援其他比例的等比裁切。素材位於 `public/media/whale-illustrated/`，提供 CORS 以支援下載的 HTML 與 sandbox Combo，播放時需要載入網站素材。

本招可直接加入 Combo：`{ "effect": "whale-illustrated", "seconds": 12 }`，完整原始碼透過 MCP `get_effect` 取得；不走 `build_object_scene` 的向量海底模組。逐格輸出時，掛載後等待 `root.motionReady`，再呼叫 `root.motionSeek(tSeconds)`。使用 `prefers-reduced-motion` 或初始暫停卡片時顯示 5 秒主視覺，卸載會釋放 WebGL 資源。瀏覽器回歸測試為 `/tests/illustrated-whale.html`（`window.illustratedWhaleResults`）。


### 圖片運鏡與本機渲染

圖片工作室（`/?view=photo`）有 21 個固定模組（見上方清單），每個模組的圖片插槽、參數與拖曳把手定義在 `src/photokit.ts`。預設只存「動畫怎麼動」，不含圖片；AI 在 scenes 寫 `{ "preset": "代碼", "images": ["..."] }` 就能換圖沿用同一套運鏡。

裁切與遮罩新增模組（固定編號 #151–156）：

| module | 效果 | 圖片順序 |
| --- | --- | --- |
| `slices` | 切片錯位 | 一張照片，橫／直條交錯滑入 |
| `tiles` | 拼塊組圖 | 一張照片，不等大矩形依序拼合；seed 固定構圖與隨機順序 |
| `tear` | 撕紙揭露 | 撕開前、撕開後；四方向、可調紙邊 |
| `collage` | 剪報拼貼 | 選填背景、剪報 1–3；請先準備去背 PNG／WebP，不會自動去背 |
| `morph` | 形狀變換 | 照片、選填底圖；圓形 → 膠囊 → 全螢幕 |
| `occlude` | 前景遮擋換景 | 第一場景、第二場景、選填透明前景；不透明底板遮住換景接縫 |

在圖片工作室選「裁切與遮罩」，放圖後按播放或拖動時間軸；剪報位置與形狀中心可拖曳。上傳、加入 Combo 及帶圖儲存預設均使用保留 alpha 的 WebP（瀏覽器不支援時退回 PNG）。動作總時間超過片段長度時，這六個模組會等比例壓縮時間，確保最後一格完成。MCP 的 `build_photo_scene` 使用同一組 module／params，並回傳參數說明、編輯連結與 Combo 場景。

照片在本機時，用繪製引擎逐格渲染，畫面與網站一致：

- `GET /r/photo.js` → `MA_PHOTO.drawPhoto(ctx, W, H, scene, t, [img1, img2])`
- `GET /r/map.js` → `MA_MAP.drawScene(ctx, W, H, scene, t, bgImage)`
- `GET /r/drop.js` → `MA_DROP.draw(ctx, W, H, o, lines, t)`（`const { o, lines } = MA_DROP.parse(words)`）

t 從 0 開始每格加 1/fps，用 Playwright 存 PNG 序列再交給 ffmpeg 合成。

裁切與遮罩的瀏覽器回歸測試：啟動 `npm run dev` 後開啟 `/tests/photo-masks.html`。測試使用 Canvas 像素比較，涵蓋三種比例、切片對齊、轉場遮擋、透明剪報、短片段的 PNG 尾格，以及匯出引擎的一致性；結果也可由 `window.photoMaskResults` 讀取。

預鑄工法流程（`precast-process`，#157）依使用者提供的參考圖重繪，以 9:16 呈現「工廠預鑄 → 現場組裝 → 澆築結合」，沒有預設工程尺寸或強度。`words` 各欄位順序見特效的 `hint`，空行代表隱藏該位置的文字；Combo 保留完整文字與 12 秒循環。`Fx.duration` 可宣告 Canvas 動畫的完整長度，沒有設定的舊特效維持原本播放長度。啟動 Vite 後可開啟 `/tests/precast-process.html`，查看階段畫面、文字定位、匯出一致性與減少動態測試；結果為 `window.precastResults`。

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
| `src/effects/*.ts` | 各分類的特效定義 |
| `src/combo.ts` | Combo 驗證、HTML 播放器、提示詞（網站與伺服器共用） |
| `src/combo-ui.ts` | 網站的 Combo 庫、草稿編輯、MCP 說明 |
| `src/photokit.ts`、`src/photo-studio.ts` | 圖片運鏡引擎（21 模組、參數規格）與圖片工作室 |
| `functions/r/` | 繪製引擎 JS（本機逐格渲染用） |
| `functions/mcp.ts` | MCP 伺服器（JSON-RPC） |
| `functions/_lib/tools.ts` | MCP 工具定義 |
| `functions/_lib/store.ts` | D1 資料庫存取（第一次使用自動建表） |
| `functions/api/`、`functions/c/` | REST API 與 Combo 播放頁 |
| `src/styles.css` | 網站樣式（站內 class 一律以 `ma-` 或具體前綴命名，避免滲入特效） |

## 字型

標題與內文用昭源黑體（Chiron Hei HK，Google Fonts），數字用 Anton。Anton 只取數字與 `% + , - . :`，以 data URL 內嵌在 `src/fonts.ts`（字型名 `MA Num`），排在字型順序最前面，其他字元自動落回昭源黑體。特效 CSS 用 `var(--sans)`、畫布用 `"MA Num", "Chiron Hei HK", "Noto Sans TC"`；本機渲染載入 `/r/fonts.css`。兩者皆為 SIL Open Font License，可商用。

### 字型組合

`src/fonts.ts` 定義 6 組：sharp 俐落黑體（預設，昭源黑體＋Anton 數字）、round 親切圓體（昭源圓體）、serif 質感宋體（思源宋體）、hand 手寫楷書（霞鶩文楷）、cute 可愛粉圓（jf 粉圓）、classic 標準思源。網站「字型」選單即時套用；Combo 可設整支的 `font` 與每段的 `scenes[].font`；地圖、圖片、水滴場景的 JSON 也可帶 `font`。畫布特效透過內嵌的 `MA_FONTS` 查字型。MCP 說明會請 AI 依段落情緒挑選、一支影片以 2–3 組為限。

## 新增一個特效

在對應分類檔加一筆 `Fx`：

- `no`：**固定編號**，用目前最大編號 +1（`grep -rhoE "no: [0-9]+" src/effects | sort -k2 -n | tail -1` 可查）。編號一旦公開就不再變動、刪除特效也不回收，AI 與 Combo 會用「#編號」引用；重複時瀏覽器 console 會報錯
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
