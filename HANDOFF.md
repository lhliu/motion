# HANDOFF：圖解批次 B3，特效 357–363（feat/effects-357-363）

## 狀態
- PR 已開，待 KC 審核；**尚未 merge、未部署**。程式碼由 Grok Bot 自行撰寫（未用 Codex／Claude Code／agy）。
- B2（352–356＋變體）已於 2026-10-27 merge（b172102，PR #4）並上線驗證。

## 內容
- `src/effects/flow-explain.ts`：conveyor、cycle-wheel、chevron-steps、brick-pyramid、mind-bubbles（chier），domino-cause（kinetic），ng-ok-sign（impact），no 357–363。全部純 CSS。
- `src/data.ts`、`src/uses.ts`：註冊；chier 五個歸 info，domino-cause、ng-ok-sign 歸 emph。

## 怎麼測
1. `npm ci && npm run build && npm run preview`，搜尋「輸送帶」「轉盤」「箭頭」「金字塔」「心智圖」「骨牌」「NG」。
2. 轉盤／箭頭：在步驟前加「>」看停點／升高位置；心智圖輸入「名稱 分數」。
3. 截圖重產：`npx tsx out/effects-357-363/gen.ts && python3 out/effects-357-363/shoot.py`（out/ 不進 git）。

## 已知限制
- NG/OK 用固定紅（#ef4444）綠（#22c55e），跟 B1 紅綠燈一樣不隨配色變。
- 轉盤下半部的步驟名會跟著扇形倒過來（停下後目前步驟一定是正的）。
- 骨牌因果的震動用 inline 動畫，取代了整組的淡入淡出（循環時直接跳回開頭）。
- 心智圖、骨牌各輸出一段 inline `<style>`（選擇器用 `.fx-<id>`）；同一個 Combo 放兩段心智圖且節點數不同時，位置會以後者為準。
- 輸送帶最多 5 箱、轉盤／箭頭最多 6 步、金字塔最多 5 層、心智圖最多 6 個節點。
