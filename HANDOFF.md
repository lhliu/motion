# HANDOFF：新特效 346–351（feat/effects-346-351）

## 狀態
- 已於 2026-10-27 squash merge（c9ceffc，PR #3），Cloudflare Pages 部署成功，正式站 6 個特效 Playwright 驗證無 console error。程式碼由 Grok Bot 自行撰寫（未用 Codex／Claude Code／agy）。

## 內容
- `src/effects/estate-explain.ts`：route-drive、party-links、yes-no-sign、price-split、good-bad-light、door-pick（no 346–351，cat estate，tone ink）。
- `src/data.ts`、`src/uses.ts`：註冊，用途歸到 `info`。

## 怎麼測
1. `npm ci && npm run build && npm run preview`，搜尋「路線」「關係人」「岔路」「總價」「紅綠燈」「開門」。
2. 切 16:9／9:16 與不同配色；加入 Combo 播放看定格。
3. 截圖重產：`npx tsx out/effects-346-351/gen.ts && python3 out/effects-346-351/shoot.py`（out/ 不進 git）。

## 已知限制
- 紅綠燈用固定紅／綠（#ef4444／#22c55e），不跟配色變。
- 剪刀是一路劃過，不會在每個切點停一下。
- 路線圖站點點亮時間按站序平均分配，不是依實際弧長。
- 每個站點各輸出一段 inline `<style>` keyframes。
- 開門在 3D 透視下，門板會稍微蓋到左邊那扇門。
