# Motion Atlas 後台設計（feat/admin-backend）

設計規劃見 /workspace/zikaji/admin/PLAN.md（KC 已核准，方案 B）。這份是實作後的對照。

## 原則
- **方案 B：D1 覆寫、即時生效。** 程式碼（src/effects/*）是預設；後台只存「差異」在 D1 `fx_overrides`。網站、/api/effects、MCP 都在執行期套用同一份覆寫（src/catalog.ts 的 `createCatalog().apply()`）。
- **編號永遠鎖定。** 後台沒有改編號的操作；只能改顯示順序（sort）與分類（cat）。
- **移除＝隱藏＋轉址，不刪招。** PR #17 移除的 21 招已改回「隱藏」保留在程式裡（P21 整包 hidden、P22 `hide: [vl-coffee, vl-steps]`、P20 `merge`：em-* 9 招轉址到 585 並帶變體），舊 Combo、舊連結、MCP 都能解析。不再需要 RESERVED 空號清單。
- **失敗就回程式預設。** /api/catalog 1.5 秒逾時或錯誤 → 前端不套用；Functions 端讀 D1 失敗 → `CATALOG.reset()`。

## 資料
- migrations/0001_admin.sql：`fx_overrides`（id 主鍵；hidden、cat、sort、tags、featured、featured_sort、redirect、variant、note、fav）、`fx_audit`（每次操作前後快照，可復原）、`fx_thumbs`（id＋frame 三格 WebP，base64）。
- 備註（note）與收藏（fav）是後台私有，/api/catalog 不輸出，固化也不寫進 repo。

## 端點
| 路徑 | 權限 | 說明 |
|---|---|---|
| GET /api/catalog | 公開 | 公開覆寫（30 秒快取） |
| GET /api/thumb/:id?f=0..2 | 公開 | 後台縮圖 |
| /api/admin/* | Cloudflare Access | catalog、ops、undo、audit、combos、combos/fix、thumbs、export |
| /admin.html | Cloudflare Access | 後台介面（src/admin/admin.ts） |

驗證：functions/_lib/access.ts 驗 `Cf-Access-Jwt-Assertion`（RS256，`https://<ACCESS_TEAM_DOMAIN>/cdn-cgi/access/certs`，檢查 aud＝ACCESS_AUD、過期、email ∈ ADMIN_EMAIL）。本機開發 `ADMIN_DEV=1` 只在 localhost 生效。

## 五個階段
1. **基礎**：覆寫資料模型、套用器、/api/catalog、/api/effects 與 MCP 一致（redirect_to、variant；get_effect 會跟著轉址）、Access 驗證、清單／搜尋／篩選、公開開關、備註。
2. **批次**：勾選、Shift 連選、全選目前篩選；批次隱藏／顯示／改分類／標籤／精選／收藏／回到預設；**匯出清單**（一鍵複製 Markdown、下載 .md／.json，表頭有台北時間、數量、篩選條件）。
3. **分類與排序、合併、轉址**：子分類內拖曳排序、合併（隱藏＋轉址＋變體）、轉址／退場頁、Combo 健檢與修正、操作紀錄與逐筆復原。
4. **縮圖**：scripts/thumbs-upload.mjs 把 check:visual 的 45/90/99% 截圖縮成 180px WebP 上傳；清單滑過輪播 3 格。
5. **固化**：後台「固化到程式碼」下載匯出檔 → `node scripts/bake-catalog.mjs 檔案.json --pr` 寫入 src/catalog.baked.json 並開 PR（不 merge）。build 時先套固化、執行期覆寫再疊上去。仍是隱藏＋轉址。

## 本機測試
```
npm run build
npx wrangler pages dev dist --d1 DB=local-admin --binding ADMIN_DEV=1 --persist-to /tmp/wstate
# 對本機 D1 sqlite 套 migrations/0001_admin.sql（不要 --remote）
open http://localhost:8788/admin.html
npm test
```

## 已知限制
- 轉址的 ?fx 連結會打開主招的預設變體（不是原本那個變體）；Combo 裡的變體招式保留原 id 播放，不受影響。
- 縮圖存在 D1（每張約 3–8 KB），600+ 招 × 3 格約 10 MB；之後量大可改 R2。
- 前端每次載入多一個 /api/catalog 請求（≤1.5 秒逾時，有 30 秒 CDN 快取）。
