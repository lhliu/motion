# HANDOFF：字體選擇器（feat/font-picker）

## 狀態
- Draft PR，**未合併、未部署**。預設值（跟字型組合／原字重）不會改變現有畫面。

## 怎麼測
1. `npm ci && npm run build && npm run preview` → http://127.0.0.1:4174/
2. 工作台「字體」選黑體或明體，「字重」選粗／中／細，看卡片與 Hero 是否即時切換。
3. 開任一特效詳細頁 → 下載 HTML，確認 HTML 內字體與字重一致。

## 已知限制
- 選了字重會把整個特效的字統一成同一字重（原本標題 900＋副標 500 的層次會變平）。這是「全部套用」的刻意取捨；若要保留層次，可改成相對字重表。
- 選了字體時，數字不再用 Anton（MA Num 只有粗體，跟細字重不搭），改跟中文同一字體。
- Canvas 繪字的特效只改了 texture、switch 兩檔讀 `--fw`；其他 canvas／SVG 地圖、圖解類（map、diagram、object 等）會吃到字體但字重仍寫死。
- Combo（套組）與各工作室（地圖、圖片、物件…）尚未帶入字體／字重。
- 截圖：`out/font-picker/*.png`。
