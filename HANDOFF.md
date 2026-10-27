# HANDOFF：物件 410 骰子（feat/object-dice）

## 狀態
- PR 待審，**未 merge、未部署**。程式碼由 Grok Bot 內建 AI 自行撰寫（未用 Codex／Claude Code／agy）。分支從最新 main 切出。

## 內容
- `src/render/prop.ts`：`fun` 模組新增 `dice` 模式。每顆骰子是 ±h 立方體，旋轉矩陣（最終四分之一轉朝向 × 翻滾角 × 等角視角）後只畫朝向鏡頭的面（凸多面體不用排序）；點數用 `ctx.transform` 把面內單位座標映到投影平行四邊形，所以點數一定跟著面走，對面相加 = 7。翻滾角是 2π 的整數倍遞減到 0，落地時剛好回到最終朝向。
- `src/propkit.ts`：fun 加「骰子」畫面與 `dice`（1–6）滑桿、預設 2。
- `src/effects/object.ts`：410 註冊（added 2026-10-28）；`src/data.ts`：fun 子分類 tagline 加骰子。`src/types.ts` 已有 `fun`，不用改。

## 怎麼測
1. `npm run build && npm run preview`，物件 → 有趣道具 → 骰子，切骰子數 1–6、9:16／16:9。
2. 截圖：`/workspace/zikaji/objects-style/gen-dice.mts`＋`shoot-dice.mjs`（1s 翻滾／2.2s 落地／5s 輕擺），輸出 `objects-style/dice-anim/`。

## 已知限制
- 16:9 下物件系統原本不顯示下方文字（跟其他物件相同）。
- 6 顆在 16:9 時落地放射短線靠近畫面上緣。
- 點數是固定的最終朝向（每顆不同），不是隨機擲骰結果。
