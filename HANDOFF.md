# HANDOFF：圖解批次 B4，特效 364–367＋3 個圖表選項（feat/effects-364-367）

## 狀態
- 已於 2026-10-27 squash merge（69b8e9a，PR #6），Cloudflare Pages 部署成功；正式站 364–367、三個圖表變體與其舊預設皆正常渲染、無 console 錯誤。程式碼由 Grok Bot 自行撰寫（未用 Codex／Claude Code／agy）。
- B3（357–363）已於 2026-10-27 merge（9e57541，PR #5）並上線驗證。

## 內容
- `src/effects/stat-explain.ts`：sticky-matrix、relation-web（cstat），area-grid（cpie），spotlight-bar（cbar），no 364–367，純 CSS。
- `src/render/chart.ts`：新指令 `@quad`（泡泡／散佈）、`@badge`（折線／區域）、`@board`（儀表板）；沒寫這些指令時走原本路徑，舊預設畫面不變。`src/chart.ts` 說明文字補上。
- `src/effects/chart.ts`：三個圖表的動態說明補上新選項。`src/data.ts`、`src/uses.ts`：註冊（歸 info）。

## 怎麼測
1. `npm ci && npm run build && npm run preview`，搜尋「便利貼」「關聯」「格子」「聚光」。
2. 泡泡圖加 `@quad 50,55,高價成熟,高價待發展,平價待發展,平價高機能`；折線圖加 `@badge +38%`；儀表板加 `@board` 並寫 2–4 行指標。
3. 截圖重產：`npx tsx out/effects-364-367/gen.ts && python3 out/effects-364-367/shoot.py`；網站實測 `python3 out/effects-364-367/site/v.py`（out/ 不進 git）。

## 已知限制
- PLAN 寫「4 新＋3 合併」：合併的 3 個是既有圖表的選項，不另佔編號，所以新編號只到 367。
- 圖表（canvas）在匯出的 Combo HTML 用 Playwright 暫停截圖時會停在中途，所以圖表變體改用網站詳情頁實測截圖。
- `@board` 卡片沒寫 `@max` 時，每張卡的滿刻度各自取「數值×1.2」的整數，弧長只表示大概比例。
- 關聯網最多 6 個因素、四象限最多 10 張便利貼、聚光直條最多 10 根；面積格子固定 100 格，比例小於 1% 也至少填 1 格。
- 聚光標籤在 9:16 會稍微壓到右邊相鄰柱的數字。
