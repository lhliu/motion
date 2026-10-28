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
];
export const XP_EXAMPLE = EX;
