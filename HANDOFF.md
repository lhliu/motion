# HANDOFF：新特效 341–345（feat/effects-341-345）

## 狀態
- 已於 2026-10-26 squash merge（eafaecf，PR #2），Cloudflare Pages 部署成功並於正式站驗證。程式碼由 Motion Coder 內建模型撰寫（未用 Codex／Claude Code／agy）。

## 內容
- `src/effects/estate-extra.ts`：收據列印、開價劃掉換成交價、字重呼吸波浪、貼紙標題、路標指示牌（no 341–345）。
- `src/fonts.ts`：Noto Sans TC 改 `wght@100..900`；`familiesFor` 偵測 `var(--vf)`。
- `src/engine.ts`：`[data-fw] *:not([data-vw])`；新增 `--vf`。
- `src/util.ts`：`parseNum`／`fmtLike`／`pctDrop`／`unitOf`。
- `src/data.ts`、`src/uses.ts`：註冊與用途分類。

## 怎麼測
1. `npm ci && npm run build && npm run preview` → 搜尋「收據」「成交價」「字重」「貼紙」「路標」。
2. 切換字體（黑體／明體）與字重（粗中細），看字重波浪是否仍在動（黑體平滑、明體分段）。
3. 下載 HTML、加入 Combo 播放，確認定格畫面正確。
4. 截圖重產：`npx tsx out/effects-341-345/gen.ts && cd out/effects-341-345 && python3 shoot.py`（腳本不進 git）。

## 已知限制
- 字重波浪在明體與預設昭源黑體下只能分段跳動（無可變版）；在 Combo 影片模式維持循環（不定格）。
- 開價成交價的往下數由 JS 依實際時間跑，跟 big-number 相同；逐幀離線算圖若用虛擬時鐘需另外處理。
- 選了字重時，路標、收據也會整體變細（字重選擇器「全部套用」的既有取捨）。
