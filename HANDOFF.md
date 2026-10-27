# HANDOFF：圖解批次 B2，特效 352–356＋兩個變體（feat/effects-352-356）

## 狀態
- PR 已開，待 KC 審核；**尚未 merge、未部署**。程式碼由 Grok Bot 自行撰寫（未用 Codex／Claude Code／agy）。
- 上一批 B1（346–351）已於 2026-10-27 merge（c9ceffc，PR #3）並上線驗證。

## 內容
- `src/effects/card-explain.ts`：flip-solve、comic-4、step-prints（card），pack-box、perk-stamps（hook），no 352–356。
- `src/effects/card.ts`：`versus` 加逐項打勾變體、`progress-bar` 加分段刻度尺變體。都只在新的輸入格式才啟用，舊輸入走原本程式碼，已存的預設畫面不變。
- `src/data.ts`、`src/uses.ts`：註冊；四個歸 info、perk-stamps 歸 emph。

## 怎麼測
1. `npm ci && npm run build && npm run preview`，搜尋「翻面」「四格」「腳印」「收納」「蓋章」。
2. 對決 VS 輸入：`A 案 / B 案 / 總價｜A / 坪數｜B / 車位｜=`；進度條輸入：`貸款審核進度 / 申請 / 徵信 / >估價 / 對保 / 撥款`。
3. 舊輸入（`新成屋 / 預售屋`、`工程進度 / 68%`）畫面應與 main 相同。
4. 截圖重產：`npx tsx out/effects-352-356/gen.ts && python3 out/effects-352-356/shoot.py`（out/ 不進 git）。

## 已知限制
- 賣點蓋章在 9:16 會換行成兩列，改成原地蓋章，不做「從中央滑進去」。
- 重點收納盒的箱蓋是 2D 旋轉模擬，16:9 開蓋時箱蓋會短暫擋到上方卡片邊角；超過 4 張卡會只取前 4 張。
- 翻面卡的問題／解法文字太長（超過約 20 字）會變三行，字級不會自動縮。
- 進度條刻度尺最多 8 格；對決打勾最多 6 項，「=」算雙方各一分。
