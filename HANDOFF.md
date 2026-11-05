# HANDOFF：#691 拉鍊拉開轉場（feat/fx691-zipper）

- `obj-estate-zipper`（#691）：繪製在 src/render/prop.ts（`zipper`、`zipCanvas` 離屏快取、`ZIP_IMG` 照片快取，estate 的 `zipper` 畫面），註冊在 src/effects/fx1105.ts（`propFx` + 覆寫 html：片名→params.texts、mode→zmode、bg=none→next=none、next=photo 讀 localStorage `ma-photoimg` 第一張→params.img、loop=3.2、關文字層）。
- 時間軸：0–12% 拉鍊頭晃、12–78% 拉下、76–100% 布飛開（close：0–24% 布飛回、22–88% 拉上）。estate 在 BUILD 清單，跑完停最後一格。
- 驗證：build、npm test 6/6、check:visual 675 招；匯出 HTML（card／none+close+h）開檔播放無錯誤：/workspace/zikaji/zipper/real/export-*.html。
- 未做：物件工作室（PROP_PARAMS）沒有加 zipper 專用欄位，靠 @設定；照片以 data URL 內嵌，大照片會讓匯出 HTML 變大。

---

# HANDOFF：#689 小物漂浮環繞立體片名＋#690 落地彈跳＋地板倒影（feat/fx689-690）

## 狀態
- PR 待審，**未 merge、未部署**。程式碼由 Grok Bot 內建 AI 自行撰寫（未用 Codex／Claude Code／Antigravity）。分支從 main 4760c45 切出。

## 內容
- `obj-estate-float`（#689）：繪製在 src/render/prop.ts（`floatProp` 6 個小物＋`floatTitle`，estate 的 `float` 畫面），註冊在 src/effects/fx1104.ts（用 object.ts 匯出的 `propFx`，覆寫 html：片名→params.texts、sky、bg、loop=8、關文字層）。PROP_PARAMS estate 加欄位。環繞小物避開片名＋副標框（推到最近的框外）並夾在畫面內。
- `drop-reflection`（#690）：src/effects/fx1104.ts；倒影走共用 src/render/reflect.ts（`makeReflector()`，window.MA_REFLECT，離屏 canvas 重用）。匯出 `globals` 用 `fnSource(makeReflector)` 內嵌（第一次 check:visual 抓到 `__name is not defined`，改用 fnSource 修好）。常數全在 run 內。
- object 特效 run 加 `root.maDraw(t)`。

## 驗證
- build 通過、npm test 6/6、check:visual 674 招 0 問題。匯出 HTML 兩招開檔無錯誤（/workspace/zikaji/export-check/）。實機截圖 /workspace/zikaji/floating-title/real/、/workspace/zikaji/drop-reflection/real/（腳本 /workspace/zikaji/shoot_689_690.py、export_689_690.py）。

## 限制
- #689 片名厚度是 2D 疊層假立體；studio 勾「透明背景」時若 sky 仍是 space 會畫星點（用 `bg=none` 或背景選純色）。40 個小物每格重畫，低階手機匯出可能掉格。速度用 BUILD 夾 loop，跑完會停在最後一格再循環。
- #690 `ctx.filter` 在 Safari <18 無模糊；兩行以上只取前兩行。

---

# HANDOFF：#687 花紋筆畫作字＋#688 照片收進字裡（feat/fx687-688）

## 狀態
- PR 待審，**未 merge、未部署**。程式碼由 Grok Bot 內建 AI 自行撰寫（未用 Codex／Claude Code／Antigravity）。分支從 main 0ac25c2 切出。

## 內容
- `pattern-stroke`（#687）：src/effects/fx1103.ts。要換的筆畫中線經 Catmull-Rom 平滑、弧長重取樣 120 點，花紋在 1024 字格座標畫。時間純函數、maDraw、MA_ONCE、reduced-motion。
- `photo-wordcollapse`（#688）：src/photokit.ts（模組、6 個照片欄、參數 sentence／title／sub／count／embed／size／float／frame／ink／accent／speed，底色預設 #F1EBDD）、src/render/photo.ts（`wordcollapse` 區塊，不畫通用字幕）、src/effects/photo.ts（no 688）。標題拼合用上下 clip 各多 1px 避免接縫。

## 驗證
- build 通過、npm test 6/6、check:visual 672 招 0 問題。實機截圖 /workspace/zikaji/pattern-stroke/real/、/workspace/zikaji/photo-collapse/real/（腳本 /workspace/zikaji/shoot_687_688.py）。

## 限制
- #687 筆順依大陸規範、楷書字形；短筆畫（點）放花紋會很擠，建議 stroke=longest。只換一筆。
- #688 卡片／詳細頁文字欄只吃三行文字，參數微調與上傳照片要在 Photo Studio；照片固定 4:3 裁切；句子很長時 16:9 會整句縮小。

---

# HANDOFF：#686 節拍海報字卡 Beat-Synced Poster Type（feat/fx686-beat-poster）

## 狀態
- PR 待審，**未 merge、未部署**。程式碼由 Grok Bot 內建 AI 自行撰寫（未用 Codex／Claude Code／Antigravity）。分支從 main a9d5f4a 切出。

## 內容
- `beat-poster`（#686，kinetic）：src/effects/fx1102.ts，data.ts 註冊。每行一拍「大字|數字|小字」，`@bpm;offset;div;beats;pal;c1–c4;bg;hit;gentle`。
- 時間純函數：beat = floor((t−offset)/(60/bpm·div))；循環長度 offset＋拍數×每拍＋2 拍停留；支援 MA_ONCE、prefers-reduced-motion（停在最後一拍）。
- 調色盤／helper 必須放在 run 內（匯出 HTML 只序列化 run）。

## 驗證
- build 通過、npm test 6/6、check:visual 670 招 0 問題。實機截圖 /workspace/zikaji/beat-poster/real/。

## 限制
- 不做音訊分析；變速歌曲會漂移。kc 調色盤（藍 #1F3A5F／橘 #F28C28）是暫定色，待 KC 給品牌色。
- 每拍建議 ≤4 字，長字會自動縮小。拍數上限 32。

---

# HANDOFF：#684 筆尖光跡手寫字＋#685 掛軸展開直書標題（feat/fx-684-685）

## 狀態
- PR 待審，**未 merge、未部署**。程式碼由 Grok Bot 內建 AI 自行撰寫（未用 Codex／Claude Code／Antigravity）。分支從 main 3dba726 切出。

## 內容
- #684 `pen-light-trail`：src/effects/fx1101.ts（data.ts 註冊）。筆順資料 public/strokes/<碼位hex>.json＋index.txt（1,756 字），沒有的字抓 jsDelivr `hanzi-writer-data@2.0.1`，都抓不到就用字型寫法。快取在 `globalThis.MA_STROKES`＋localStorage（`ma-stroke:<字>`）；Fx 的 `globals` 是 getter，匯出時內嵌快取裡的字。
- #685 `obj-taiwan-scroll`：src/render/prop.ts `scroll()`（taiwan 模組 mode=scroll），src/propkit.ts 參數，src/effects/object.ts 註冊（覆寫 html 把每行轉成 params.texts）。
- 授權：public/licenses/ARPHICPL.txt、public/strokes/README.txt、index.html 頁尾出處。

## 驗證
- build 通過、npm test 6/6、check:visual 669 招 0 問題。
- 實機截圖：/workspace/zikaji/fx-684-685/real/（16:9、9:16，三質感、單幅／四幅）。

## 限制
- 字形為楷書、筆順依大陸規範；站上沒收的字第一次播放要等 jsDelivr，離線且未快取的字會退回字型寫法。
- 匯出 HTML 只內嵌「已在本頁載入過」的字；若在字還沒抓完時就匯出，匯出檔會在播放時再去 motion.leichthub.com／jsDelivr 抓。
- 掛軸的掛軸文字欄位在物件工作室台灣生活的其他畫面也會出現（PField 沒有條件顯示）。

---

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

## 擴充包刪減（remove/taiwan-life-595-604）
- P21 整包刪除（xpack.ts 列、p21.ts、packs.ts）；P22 刪 vl-coffee、vl-steps。
- XPack 新增 `merge` 欄位：整包只註冊第一招（保留其 id 與編號），工作室顯示 `mode` 選單（propkit `XP_EMOTES`；object-studio 只在 mode 以 em- 開頭時顯示）。目前只用在 P20 情緒貼圖。
- 被刪的舊 id（obj-xpack-tw-*、em-cry 等 9 招、vl-coffee、vl-steps）若存在舊 Combo/預設會找不到。
- 編號改為保留空號：object.ts `RESERVED`（586–604、605、609），其餘招式維持原編號；之後再刪招請把號碼加進這個清單。

## 後台（feat/admin-backend）
- 設計與端點見 docs/ADMIN.md。方案 B：D1 覆寫即時生效；編號鎖定；移除＝隱藏＋轉址。
- 上線前要 KC 同意：① `wrangler d1 migrations apply <DB 名稱> --remote`（migrations/0001_admin.sql）② Cloudflare Access 應用程式保護 /admin* 與 /api/admin/*，政策只允許 lhliu.tw@gmail.com（One-time PIN）③ Pages 環境變數 ACCESS_TEAM_DOMAIN、ACCESS_AUD、ADMIN_EMAIL=lhliu.tw@gmail.com ④ merge。沒有 wrangler.toml（避免蓋掉 dashboard 綁定）。
- 沒套 migration 前：/api/catalog 回空覆寫，網站照程式預設，不受影響。
- 測試：npm test（6 項）、本機 wrangler pages dev --d1 DB=… --binding ADMIN_DEV=1。
