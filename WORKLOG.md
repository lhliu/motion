# WORKLOG

## 2026-11-04（UTC+8）feat/fx689-690
- 從 main（4760c45）開分支；程式碼全部由 Grok Bot 內建 AI 撰寫（未使用 Codex、Claude Code、Antigravity）。依 /workspace/zikaji/floating-title/PLAN.md、/workspace/zikaji/drop-reflection/PLAN.md 實作 #689、#690；確認 689／690 未被使用。
- #689：6 個小物照 KC 核准的 props-sheet 移進 prop.ts（estate.float，工廠內自給自足，只用工廠 helper）；註冊照 #685 模式覆寫 html（片名進 params.texts、關掉下方文字層、loop 8 秒）。實拍後修：環繞小物被畫框切掉 → 一律夾在畫面內；鏡頭停下後近景飛行小物（大安全帽）擋畫面 → 3.6–4.6 秒淡出。
- #690：倒影做成共用 render/reflect.ts，run 只讀 globalThis.MA_REFLECT，其餘常數全在 run 內。實拍後修：「萬」下緣穿過地板線 → 改用 measureText 實際下緣貼地。
- 驗證與實機截圖見 HANDOFF。

## 2026-11-03（UTC+8）feat/fx687-688
- 從 main（0ac25c2）開分支；程式碼全部由 Grok Bot 內建 AI 撰寫（未使用 Codex、Claude Code、Antigravity）。依 /workspace/zikaji/pattern-stroke/PLAN.md、/workspace/zikaji/photo-collapse/PLAN.md 實作 #687、#688；確認 687／688 編號未被使用。
- #687：src/effects/fx1103.ts，筆順載入沿用 #684（常數、helper 全在 run 內）。實拍後 mrt 站點太密，自動數量改為每 170 單位一站。
- #688：照片特效慣例是 photo 引擎模組（Photo Studio 上傳→scene.images dataURL→匯出內嵌），所以做成 photokit `wordcollapse` 模組＋render/photo.ts 畫法＋effects/photo.ts 註冊；照片大小依 KC「照片要更大」：漂浮 0.36H、嵌入 1.8×字級。
- 驗證與實機截圖見 HANDOFF。

## 2026-11-02（UTC+8）feat/fx686-beat-poster
- 從 main（a9d5f4a）開分支；程式碼全部由 Grok Bot 內建 AI 撰寫（未使用 Codex、Claude Code、Antigravity）。依 /workspace/zikaji/beat-poster/PLAN.md 實作 #686。
- 依日期命名慣例新增 src/effects/fx1102.ts（fx1101＝11/01）；data.ts 註冊；tests/catalog.test.ts 總數 669→670、公開 613→614。
- 第一次 check:visual 抓到匯出 HTML「PAL is not defined」：匯出只序列化 run，模組層常數帶不過去 → 調色盤與 lum 移進 run 內，重跑 0 問題。
- 驗證：`npm run build` 通過、`npm test` 6/6、`npm run check:visual` 670 招有問題 0。實機截圖（vite preview＋Playwright，停掉 rAF 後用 maDraw(t) 指定時間）於 /workspace/zikaji/beat-poster/real/（腳本 shoot_real.py）。

## 2026-11-01（UTC+8）feat/fx-684-685
- 從 main（3dba726）開分支；程式碼全部由 Grok Bot 內建 AI 撰寫（未使用 Codex、Claude Code、Antigravity）。依 /workspace/zikaji/pen-trail/PLAN.md 與 /workspace/zikaji/scroll-title/PLAN.md 實作 #684、#685。
- #684：移植 proto 的 clip＋中線粗線畫法；時間改成整句每字約 0.8 秒依筆畫長度分配（第一版每筆 0.5 秒太慢，5 字要 20 秒，已修）。筆順資料切成每字一檔放 public/strokes/（站上用到的字），其餘走 jsDelivr。
- #685：prop.ts `scroll` 自包含畫法，用 taiwan 模組的 mode；object.ts 覆寫 html，把每行文字放進 params.texts、關掉物件下方文字層。
- 驗證：`npm run build` 通過、`npm test` 6/6、`npm run check:visual` 669 招有問題 0。實際網站（vite preview＋Playwright，`?fx=` 詳細頁、切 16:9／9:16）截圖於 /workspace/zikaji/fx-684-685/real/（腳本 shoot_real.py）。

## 2026-10-26（UTC+8）feat/effects-341-345
- 從 main（afb1509）開分支；程式碼全部由 Motion Coder 內建模型撰寫（未使用 Codex、Claude Code、agy）。
- 依 `/workspace/zikaji/new-effects-2026-10-26/PLAN.md` 三階段：共用準備（可變 Noto Sans TC、`--vf`、`data-vw`、數字小工具）→ `src/effects/estate-extra.ts` 五招（341–345）→ 驗證。
- 驗證：`npm run build` 通過；以 comboHtml／exportHtml 產生 68 頁、Playwright 截 100+ 張（3 比例、黑體／明體 × 粗中細、ink／paper 色調、逐幀 0.2–3.5 秒、下載 HTML），無 console／page error。截圖在 `out/effects-341-345/`（不進 git）。
- 10:51 修收據撕紙邊接縫、貼紙標題最低字重 700；PR #2 squash merge（eafaecf），Cloudflare Pages 部署成功；正式站 JS 含五個 id、`data-vw`、`wght@100..900`，/api/effects 310 招含五招，Playwright 開 `?fx=` 五招皆掛載、無 page error，截圖 `out/prod-341-345/`。程式碼皆由 Motion Coder 內建模型撰寫。

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

## 2026-10-27 20:34（UTC+8）特效 346–351（批次 B1）
- 新增 estate-explain.ts 六個特效，build 通過；Playwright 截圖 72 張於 out/effects-346-351/（不進 git）。
- 修正：車子不動（offset-path 移到 .car）、總價標籤溢出（改成圖例）、開門鏡像（backface 隱藏、開到 -112°）、直式字級放大。
- 已開 PR，未 merge、未部署。

## 2026-10-27 20:56（UTC+8）B1 上線
- PR #3 squash merge → c9ceffc；Cloudflare Pages success；正式站 ?fx= 6 個特效皆正常、無 console error，截圖 out/prod-346-351/。

## 2026-10-27 21:04（UTC+8）圖解批次 B2（352–356＋versus／progress-bar 變體）
- 新增 card-explain.ts 五個特效，card.ts 兩個變體（舊預設不變）；build 通過；Playwright 截圖 108 張於 out/effects-352-356/。
- 修正：翻面章位置鏡像、直式卡片過寬、收納盒箱蓋過長、蓋章被裁、對決表格過高。
- 已開 PR，未 merge。

## 2026-10-27 21:10（UTC+8）B2 上線
- PR #4 squash merge → b172102；Cloudflare Pages success；正式站 5 個新特效＋versus／progress-bar 新舊輸入皆正常、無 console error，截圖 out/prod-352-356/。

## 2026-10-27 21:16（UTC+8）圖解批次 B3（357–363）
- 新增 flow-explain.ts 七個特效；build 通過；Playwright 截圖 84 張於 out/effects-357-363/。
- 修正：轉盤文字定位、箭頭文字溢出、心智圖上方節點被裁／直式連線不見（inline style 順序）、骨牌標籤重疊、inline style 改用 .fx-<id> 選擇器。
- 已開 PR，未 merge。

## 2026-10-27 21:50（UTC+8）
- PR #5 squash merge 為 9e57541，Cloudflare Pages success；正式站驗證 357–363 全部渲染、無 console 錯誤（截圖 out/prod-357-363/）。

## 2026-10-27 22:10（UTC+8）
- B4：新增 364–367（sticky-matrix、relation-web、area-grid、spotlight-bar）；泡泡圖 @quad、折線圖 @badge、儀表板 @board 三個合併選項。截圖 out/effects-364-367/。PR 待審，未 merge。

## 2026-10-27 21:50（UTC+8）
- PR #6 squash merge 為 69b8e9a，Cloudflare Pages success；正式站驗證 364–367＋泡泡圖 @quad／折線圖 @badge／儀表板 @board 與舊預設，無 console 錯誤（截圖 out/prod-364-367/）。

## 2026-10-27 22:30（UTC+8）
- B5：新增 368–373（gear-formula、iso-explode、zoom-detail、lens-annotate、before-after-drag、plan-callouts），示意底圖皆自繪 SVG；修正 spotlight-bar 9:16 標籤重疊。截圖 out/effects-368-373/。PR 待審，未 merge。

## 2026-10-27 22:05（UTC+8）
- PR #7 squash merge 為 545b802 並上線；正式站驗證 368–373＋spotlight-bar，無 console 錯誤（截圖 out/prod-368-373/）。

## 2026-10-27 22:40（UTC+8）
- B6（最後一批）：新增 374 updown-board、375 clause-mark；HANDOFF／PLAN 補六批總結（新增 30、合併 5、跳過 13）。截圖 out/effects-374-375/。PR 待審，未 merge。

## 2026-10-27 22:10（UTC+8）
- PR #8 squash merge 為 eacaa1d 並上線；正式站驗證 374–375，無 console 錯誤（截圖 out/prod-374-375/）。圖解動畫六批全部上線（新增 30、合併 5、跳過 13）。

## 2026-10-27 23:31（UTC+8）
- 物件擴充 v2：feat/objects-v2 從 origin/main 切出並帶上珍奶；新增 393–409 共 17 個物件動畫（drink 汽水罐、fun 6、taiwan 4、estate 6），三個新子分類。build 通過、check:visual 0 問題；截圖 out/objects-v2/。PR 待審，未 merge。

## 2026-10-28 11:30（UTC+8）
- 擴充包完成：P01–P28、P30、P31 共 253 招（425–677），P29 Lottie 跳過。每包一個 commit；build 通過、check:visual 661 招 0 問題；圖解字卡預設改回 v1。PR 待審，未 merge。
