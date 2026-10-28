// 擴充包（2026-10-28）的招式清單：每一包放進最適合的子分類，編號從 425 起依序排。
// 繪製在 src/render/xp/，全部走物件引擎（id obj-xpack-<mode>），畫面自帶文字（layout none）。
export type XRow = [mode: string, zh: string, en: string, desc: string, motion: string];
export type XPack = { pack: number; name: string; cat: string; tags: string[]; ratio?: '9:16' | '16:9'; motionEn: string; rows: XRow[] };
const EX = '數字皆為示意。';
export const XPACKS: XPack[] = [
  { pack: 1, name: '轉場擴充包', cat: 'twipe', tags: ['轉場', '段落'], ratio: '16:9', motionEn: 'A full-frame flat-colour transition from an orange A segment to a dark chapter B segment between 0.8 s and 2.2 s; hard edges, no blur.', rows: [
    ['tr-diag', '色塊對角推擠', 'Diagonal Push', '四條色帶斜斜推過畫面，換成下一段', '黃、白、藍、深色四條斜色帶依序從左下往右上推過去，最後一條帶走上一段，章節字往上浮出。'],
    ['tr-circle', '圓形擴散', 'Circle Burst', '三圈色塊從中心擴散，最後一圈露出下一段', '黃、白、淺藍三個圓從中心依序放大蓋滿畫面，第四圈裡面就是下一段。'],
    ['tr-blinds', '百葉窗', 'Venetian Blinds', '九片百葉由上往下關起再打開', '九條黃色百葉依序由中線張開蓋住畫面，再依序收起露出下一段，每片底下有暗邊。'],
    ['tr-slide', '日式拉門', 'Sliding Doors', '兩扇木格拉門關上再拉開', '兩扇木框白紙格拉門從兩側滑進來關上，停一下再往兩邊拉開，門後是下一段。'],
    ['tr-shutter', '鐵捲門', 'Rolling Shutter', '鐵捲門拉下再捲上去，店面換成下一段', '灰色鐵捲門一片片拉下來蓋住畫面，底部黃色把手，接著捲上去露出下一段。'],
    ['tr-ink', '墨水暈開', 'Ink Spread', '深色墨點在畫面各處暈開，連成一片', '六團邊緣起伏的墨水在不同位置依序暈開、連成一片，伴隨小濺點，墨裡面浮出下一段。'],
    ['tr-mapzoom', '地圖縮放轉場', 'Map Zoom', '上一段縮成地圖上一個點，再從另一點放大', '上一段畫面縮小成街區地圖上的大頭針，鏡頭沿著街道移到另一點，再放大成下一段。'],
    ['tr-housemask', '房子遮罩', 'House Mask', '房子形狀的洞從中心放大露出下一段', '黃色房子輪廓先在中心彈出，裡面是下一段，接著房子形狀放大到蓋滿整個畫面。'],
    ['tr-pixel', '像素溶解', 'Pixel Dissolve', '畫面切成方格，一格一格翻成下一段', '畫面切成 12×12 方格，依亂數順序先閃白、黃小方塊，再換成下一段的畫面。'],
    ['tr-curl', '頁面捲起', 'Page Curl', '右下角捲起來，整頁翻走露出下一段', '上一段像紙一樣從右下角往左上掀起，背面米白色、摺線有暗邊，越掀越大直到整頁翻走。'],
    ['tr-beat', '節拍縮放', 'Beat Zoom', '跟著三下節拍放大衝擊，最後閃白切下一段', '上一段跟著三下節拍一次次放大彈回、外框白黃光圈往外擴，第四拍閃白後切到下一段並縮回原位。'],
    ['tr-tape', '膠帶撕開', 'Tape Rip', '黃色膠帶貼上，撕開時把上一段扯走', '印著字的黃色膠帶斜斜貼上，接著被往右上撕走，上一段沿撕邊被扯開，露出下一段。'],
  ] },
  { pack: 2, name: '章節卡與開場', cat: 'chapter', tags: ['章節', '開場', '長片'], motionEn: 'Chapter and opener cards in the site palette that build once with springy pops, wipes and count-ups, then idle gently.', rows: [
    ['ch-number', '章節編號卡', 'Chapter Number', '大數字 02 / 05 推上來，標題與進度點跟著出現', '主色大數字從遮罩下方推上來，「/ 05」淡入，黃色底線拉出，章節標題與英文小標依序浮出，下方進度點逐顆彈出。'],
    ['ch-toc', '目錄進度條', 'Table of Contents', '五個章節逐行出現，進度條走到目前這章', '目錄標題下五個章節逐行滑入，左側進度軌長出；已完成的章節打勾變淡，目前章節亮底並標 NOW。'],
    ['ch-three', '本集重點三點', 'Three Key Points', '三張彩色編號卡依序彈出', '標題與副標淡入，三張編號卡（主色、黃、藍）依序回彈放大，卡上有大編號、重點與說明。直式上下排、橫式左右排。'],
    ['ch-count', '倒數 3-2-1', 'Countdown 3-2-1', '大數字跟著圓環倒數，最後彈出「開始！」', '放射底紋慢轉，3、2、1 依序回彈出現，外圈色環每秒掃滿一圈；最後主色膠囊「開始！」彈出並冒出放射短線。'],
    ['ch-cover', '系列封面', 'Series Cover', '主色斜紋底，大樓長高，系列名稱卡彈出', '主色斜紋底上，一排深色大樓由地面長高、窗戶亮燈；深色標題卡回彈出現，集數膠囊、系列名與副標，最後小房子彈出跳動。'],
    ['ch-hook', '問題鉤子', 'Question Hook', '大問號彈出，問題一字一字打出來', '主色圓形大問號回彈出現、周圍小問號浮動；下方問題一字一字打出並自動換行，游標閃爍，最後黃色膠囊提示出現。'],
    ['ch-tldr', '結論先講', 'TL;DR First', '「結論先講」印章蓋下，重點逐條打勾', '「結論先講」印章從大縮小蓋下，結論兩行依序浮出，第二行底下黃色螢光筆劃過，三個打勾重點依序彈出。'],
    ['ch-marks', '章節時間碼', 'Chapter Timestamps', '進度條走過，章節時間碼一個個冒出', '標題下進度條由左往右走，播放頭經過時每個章節刻度彈出時間碼與名稱，走過的章節亮起。'],
    ['ch-split', '章節左右分割', 'Split Chapter', '主色半邊推進來放大編號，另一邊章節名滑入', '主色色塊從左（直式從上）推進佔畫面約四成，大編號與 CHAPTER 在裡面；另一側章節名稱與副標滑入，斜切角跟著色塊。'],
    ['ch-recap', '上集回顧', 'Previously On', '米白卡片轉正落下，上集重點逐條出現', '米白相片卡從斜角轉正、回彈落下，膠帶貼在上緣；卡內插圖（大樓、房子）、「上集回顧」標籤、標題與三個重點逐條淡入。'],
  ] },
  { pack: 3, name: '實價登錄與價格 UI', cat: 'xprice', tags: ['實價登錄', '房價', '數據'], motionEn: 'Price and transaction-record UI in the site palette: rows slide in, digits roll and count up, bars split and flip; all numbers are illustrative.', rows: [
    ['pr-list', '實價登錄列表', 'Transaction List', '成交紀錄一筆筆滑入，數字跳動，最高價亮起', '表頭淡入後五筆成交紀錄依序由右滑入，總價與單價 count-up，最後最高那筆亮底並彈出「最高」標籤。地址只到路段、門牌打星號。'],
    ['pr-unit', '單價滾輪', 'Rolling Unit Price', '單價每一位數字像滾輪一樣滾到定位', '每一位數字在深色格子裡依序往上滾好幾圈後停在定位，「萬/坪」淡入，下方彈出比去年漲幅膠囊。'],
    ['pr-split', '總價拆解', 'Price Breakdown', '總價長條拆成土地、建物、車位三塊', '總價 count-up，長條由左依序長出土地、建物、車位三段並標百分比，下方標註與金額逐項淡入。'],
    ['pr-flip', '價格翻牌', 'Split-flap Price', '機場翻牌一位一位從開價翻到成交價', '深色翻牌每一位上半片往下翻，從開價依序翻成成交價，「萬」淡入，最後彈出差額膠囊。'],
    ['pr-change', '漲跌幅箭頭', 'Change Arrow', '紅色上箭頭彈出，漲幅 count-up，走勢線畫出', '圓形色塊中的箭頭回彈出現並上下輕晃，漲幅百分比 count-up，旁邊小走勢線一路畫到終點。台灣習慣：漲紅跌綠。'],
    ['pr-bargain', '議價空間條', 'Bargain Range', '最低成交、合理出價、開價三個標記落在區間條上', '區間條長出，綠色行情區由最低成交延伸到開價，三個標記（開價、最低成交、合理出價）依序彈出並標金額，最後顯示議價空間百分比。'],
    ['pr-askdeal', '開價 vs 成交', 'Asking vs Sold', '兩根柱子長高，括號標出差距百分比', '開價與成交兩根圓角柱依序由底長高並 count-up，黃色括號從開價頂端畫到成交頂端，最後彈出差距百分比。'],
    ['pr-tag', '價格吊牌', 'Hanging Price Tag', '主色吊牌掉下來晃動，寫著特價與總價', '吊牌從上方掉下回彈、掛在木桿上像鐘擺晃動慢慢停下，牌上有房子圖示與總價，周圍放射短線與星星。'],
    ['pr-formula', '總價算式', 'Price Formula', '坪數 × 單價 = 總價，三個色塊依序彈出', '坪數、乘號、單價、等號、總價依序回彈出現（直式上下、橫式左右排），總價 count-up 後冒出放射短線。'],
    ['pr-rank', '單價排行', 'Unit Price Ranking', '五區單價橫條排行，前三名彈出獎牌', '五個行政區名稱淡入、橫條依序長出並 count-up，第一名用主色，前三名左側彈出金銀銅獎牌。'],
  ] },
];
export const XP_EXAMPLE = EX;
