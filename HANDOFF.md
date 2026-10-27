# HANDOFF：物件擴充 v2，特效 392–409（feat/objects-v2）

## 狀態
- PR 待審，**未 merge、未部署**。程式碼由 Grok Bot 自行撰寫（未用 Codex／Claude Code／agy）。
- 分支從最新 origin/main（6849039，已撤掉 O1/O2）切出，帶上珍珠奶茶三個 commit。舊的 wip 草稿（烤吐司機、售屋吊牌）沒有帶過來。

## 內容
- `src/render/prop.ts`：共用 `dropIn`／`cheer`／`stage`（單位座標舞台：原點在物件底部中央、1 = S）；新模組 `fun`、`taiwan`、`estate`，`drink` 加 `soda` 模式。
- `src/propkit.ts`：三個新模組的 PROP_INFO／DEFAULTS／BG／PARAMS（工作室可切畫面、改主色輔色、大小、速度）。
- `src/effects/object.ts`：392–409 註冊（新特效 added 2026-10-27）；`src/data.ts`、`src/types.ts`：三個新子分類。

## 怎麼測
1. `npm ci && npm run build && npm run preview`，物件分類下看「手搖飲／有趣道具／台灣生活／看屋物件」。
2. 截圖：`/workspace/zikaji/objects-style/gen2.mts`＋`shoot2.mjs`（0.8s／2.7s／5.6s，9:16 與 16:9），輸出在 out/objects-v2/（不進 git）。
3. `npm run check:visual`：393 招，有問題 0、畫面有變 0。

## 已知限制
- 16:9 下物件系統原本就不顯示下方文字、較高的物件（抓娃娃機、書櫃、紅包抽卡、珍奶吸管）上緣會被裁到一點，跟既有扭蛋機相同，未在這次處理。
- 換畫面（mode）時主色輔色沿用目前值，跟既有模組一樣；建議從各特效預設進入。
- 房貸計算機、電表的數字只做示意；電子票證感應不放任何真實品牌。
- 骰子：3D 靜態稿在 zikaji/objects-style/statics/dice-3d-sheet.png，比照魔術方塊的透視投影＋依 z 排序；KC 確認後再做動畫與「1–6 顆」工作室選項。
