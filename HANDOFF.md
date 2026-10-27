# HANDOFF：圖解批次 B6，特效 374–375（feat/effects-374-375）

## 狀態
- 已於 2026-10-27 squash merge（eacaa1d，PR #8）並部署；正式站 374–375 正常渲染、無 console 錯誤。**六批全部上線。**程式碼由 Grok Bot 自行撰寫（未用 Codex／Claude Code／agy）。
- B5（368–373＋spotlight-bar 修正）已於 2026-10-27 merge（545b802，PR #7）並上線驗證。

## 內容
- `src/effects/final-explain.ts`：updown-board（caption，374）、clause-mark（news，375），純 CSS。
- `src/data.ts`、`src/uses.ts`：註冊（updown-board 歸 caption、clause-mark 歸 info）。
- 條文框選的預設文件是自擬的「不動產買賣契約書（示意）」，畫面標「示意文件」；不是真實新聞或真實契約。

## 怎麼測
1. `npm ci && npm run build && npm run preview`，搜尋「漲跌」「條文」。
2. 漲跌牌：每行「名稱 +24%」或「名稱 −8%」。條文框選：第 1 行標題，要框的行加「>」，「!」開頭寫註記。
3. 截圖重產：`npx tsx out/effects-374-375/gen.ts && python3 out/effects-374-375/shoot.py`（out/ 不進 git）。

## 已知限制
- 漲跌牌顏色固定為漲紅 #e63946／跌綠 #2a9d8f（台灣慣例），不跟配色走；最多 4 張；牌面是深色固定底。
- 條文框選最多 10 行；目標行停點用固定行高估算，條文太長換三行以上時框和停點會偏一點；文件固定米白底。
- 條文框選的註記固定在框的右上方；目標在第 1 行時會被標題擋到一點。

## 圖解動畫 48 選：六批總結（2026-10-27）
| 批次 | 分類 | 新增 | 合併到既有 | PR | 狀態 |
|---|---|---|---|---|---|
| B1 | estate | 6 | — | 已 merge | 已上線 |
| B2 | card＋hook | 5 | 2（02、26） | 已 merge | 已上線 |
| B3 | chier＋kinetic＋impact | 7 | — | 已 merge | 已上線 |
| B4 | cstat＋cpie＋cbar＋cline | 4（364–367） | 3（23、35、38：圖表選項 @quad／@badge／@board） | #6（69b8e9a） | 已上線 |
| B5 | diagram＋pmark＋pmulti＋punit | 6（368–373） | — | #7（545b802） | 已上線 |
| B6 | caption＋news | 2（374–375） | — | #8（eacaa1d） | 已上線 |
- 合計：48 選 → **新增 30、合併 5、跳過 13**（跳過的都是跟既有特效重疊）。
- 新增特效全由 Grok Bot 自寫，未用 Codex／Claude Code／agy；照片／格局／文件類底圖都是自繪示意圖，無外部版權素材。
