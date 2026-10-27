// 生活物件：建案工地、交屋鑰匙、家具進場、等角小屋、合約文件、城市天際線、天氣、交通號誌、植物、時間、慶祝、錢幣、抽籤扭蛋。
// 跟魔術方塊同一套物件系統（objkit 的場景、文字層與物件編輯器），繪製在這裡。全部硬邊、不用陰影或模糊。
// propRenderer 內部必須自給自足，匯出 HTML 時以 toString() 內嵌。
import type { PField } from './photokit';

export type PropModule = 'site' | 'keys' | 'furniture' | 'house' | 'contract' | 'skyline' | 'weather' | 'signal' | 'plant' | 'clock' | 'party' | 'coins' | 'gacha' | 'drink';

export const PROP_INFO: Record<PropModule, { zh: string; en: string; desc: string }> = {
  site: { zh: '建案工地', en: 'Construction Site', desc: '樓層一層層蓋高，起重機吊鋼樑或鷹架防塵網慢慢降下，地面有施工圍籬' },
  keys: { zh: '交屋鑰匙', en: 'Handover Keys', desc: '鑰匙串掉下來晃動，或門牌翻出、大門打開透出光' },
  furniture: { zh: '家具進場', en: 'Furniture Move-in', desc: '沙發、立燈、邊桌、盆栽、掛畫一件件掉進或滑進空房間' },
  house: { zh: '等角小屋', en: 'Isometric House', desc: '立體小房子從地基、牆面、屋頂依序蓋好，或夜晚窗戶輪流亮燈' },
  contract: { zh: '合約文件', en: 'Contract', desc: '合約滑入、簽名一筆一筆寫出、印章蓋下，或文件一頁頁翻過' },
  skyline: { zh: '城市天際線', en: 'City Skyline', desc: '大樓剪影由左到右長高，或天空由日轉夜、窗戶陸續亮燈' },
  weather: { zh: '天氣', en: 'Weather', desc: '下雨、晴天、颱風、起霧四種天氣，以及颱風路徑預報示意圖，配通勤、日照、漏水、防颱話題' },
  signal: { zh: '交通號誌', en: 'Traffic Signal', desc: '紅綠燈依序切換並倒數，或行人號誌小綠人走路配斑馬線' },
  plant: { zh: '植物綠地', en: 'Plants', desc: '盆栽發芽長葉，或行道樹春夏秋冬四季變色、落花落葉下雪' },
  clock: { zh: '時間', en: 'Time', desc: '沙漏流沙翻轉、時鐘快轉、日曆一頁頁撕掉' },
  party: { zh: '慶祝', en: 'Celebration', desc: '拉炮噴出彩帶紙片，或煙火升空綻放' },
  coins: { zh: '錢幣存錢筒', en: 'Coins & Piggy Bank', desc: '硬幣一枚枚疊高成長條，或掉進存錢筒；只做示意，不放真實金額' },
  gacha: { zh: '抽籤扭蛋', en: 'Gacha & Lots', desc: '扭蛋機轉動掉出扭蛋打開，或籤筒搖一搖跳出一支籤' },
  drink: { zh: '手搖飲', en: 'Bubble Tea', desc: '透明杯珍珠奶茶落下，珍珠沉底、吸管戳破封膜' },
};
export const PROP_MODULES = Object.keys(PROP_INFO) as PropModule[];

const XY = { x: 0.5, y: 0.45, size: 0.95, speed: 1 };
export const PROP_DEFAULTS: Record<PropModule, Record<string, number | string>> = {
  site: { mode: 'crane', floors: 12, color: '#d9d2c3', color2: '#f2b705', ...XY, y: 0.4, size: 0.85 },
  keys: { mode: 'ring', count: 3, color: '#d9b45a', color2: '#ff5a36', ...XY, y: 0.42 },
  furniture: { mode: 'drop', color: '#ff5a36', color2: '#2f6db5', room: 1, ...XY, y: 0.42, size: 0.68 },
  house: { mode: 'build', floors: 2, color: '#f3efe6', color2: '#d64541', ...XY, y: 0.42 },
  contract: { mode: 'sign', color: '#ffffff', color2: '#d64541', ...XY, y: 0.42 },
  skyline: { mode: 'grow', count: 12, seed: 5, color: '#2b3a55', color2: '#ffd23f', ...XY, y: 0.42, size: 0.95 },
  weather: { mode: 'rain', amount: 1, track: 'cross', color: '#e9eef3', color2: '#5b9bd5', ...XY, y: 0.38 },
  signal: { mode: 'light', count: 10, color: '#1d2433', color2: '#ffffff', ...XY, y: 0.42 },
  plant: { mode: 'grow', color: '#3aa04a', color2: '#c46a3a', ...XY, y: 0.42 },
  clock: { mode: 'hourglass', start: 1, color: '#f3efe6', color2: '#ff5a36', ...XY, y: 0.42 },
  party: { mode: 'popper', amount: 1, color: '#ff5a36', color2: '#ffd23f', ...XY },
  coins: { mode: 'stack', count: 4, color: '#f2b705', color2: '#f6a5c0', ...XY, y: 0.42 },
  gacha: { mode: 'capsule', color: '#ff5a36', color2: '#2f6db5', ...XY, y: 0.42 },
  drink: { mode: 'boba', color: '#c8925f', color2: '#ff5a36', ...XY, y: 0.42 },
};

export const PROP_BG: Record<PropModule, string> = {
  site: '#cfe3ee',
  keys: '#1d2433',
  furniture: '#efe6d8',
  house: '#bfe3f7',
  contract: '#2b3a55',
  skyline: '#1b2638,#e9905f',
  weather: '#5c6f82',
  signal: '#2a3442',
  plant: '#f3efe6',
  clock: '#1d2433',
  party: '#1d2433',
  coins: '#1d2433',
  gacha: '#fff3e2',
  drink: '#fff3e2',
};

const common = (zh = '主色', zh2 = '輔色'): PField[] => [
  { k: 'color', label: zh, type: 'color' },
  { k: 'color2', label: zh2, type: 'color' },
  { k: 'size', label: '大小', type: 'range', min: 0.25, max: 1.8, step: 0.01 },
  { k: 'speed', label: '動作速度', type: 'range', min: 0.3, max: 2.5, step: 0.05 },
];
export const PROP_PARAMS: Record<PropModule, PField[]> = {
  site: [{ k: 'mode', label: '畫面', type: 'seg', opts: [['crane', '起重機吊樑'], ['rise', '鷹架防塵網']] }, { k: 'floors', label: '樓層數', type: 'range', min: 4, max: 24, step: 1 }, ...common('大樓外牆', '起重機／網子')],
  keys: [{ k: 'mode', label: '畫面', type: 'seg', opts: [['ring', '鑰匙串'], ['door', '門牌開門']] }, { k: 'count', label: '鑰匙數', type: 'range', min: 1, max: 5, step: 1 }, ...common('鑰匙', '吊牌／大門')],
  furniture: [{ k: 'mode', label: '進場方式', type: 'seg', opts: [['drop', '從上掉落'], ['slide', '從兩側滑入']] }, { k: 'room', label: '房間背景', type: 'seg', opts: [['1', '有'], ['0', '只有家具']] }, ...common('沙發', '立燈與邊桌')],
  house: [{ k: 'mode', label: '畫面', type: 'seg', opts: [['build', '蓋房子'], ['night', '夜晚亮燈']] }, { k: 'floors', label: '樓層', type: 'range', min: 1, max: 3, step: 1 }, ...common('牆面', '屋頂')],
  contract: [{ k: 'mode', label: '畫面', type: 'seg', opts: [['sign', '簽名蓋章'], ['flip', '翻頁']] }, ...common('紙張', '印章')],
  skyline: [{ k: 'mode', label: '畫面', type: 'seg', opts: [['grow', '大樓長高'], ['daynight', '日夜切換']] }, { k: 'count', label: '大樓數', type: 'range', min: 5, max: 20, step: 1 }, { k: 'seed', label: '天際線變化', type: 'range', min: 1, max: 99, step: 1 }, ...common('大樓', '窗戶燈光')],
  weather: [{ k: 'mode', label: '天氣', type: 'seg', opts: [['rain', '下雨'], ['sun', '晴天'], ['typhoon', '颱風'], ['fog', '起霧'], ['forecast', '颱風路徑預報']] }, { k: 'track', label: '預報路徑（示意）', type: 'seg', opts: [['cross', '穿過台灣'], ['north', '北轉經東北'], ['south', '巴士海峽'], ['east', '東側北上']] }, { k: 'amount', label: '強度', type: 'range', min: 0.3, max: 2, step: 0.05 }, ...common('雲／霧', '雨／陽光')],
  signal: [{ k: 'mode', label: '號誌', type: 'seg', opts: [['light', '紅綠燈'], ['walk', '行人號誌']] }, { k: 'count', label: '倒數秒數', type: 'range', min: 3, max: 99, step: 1 }, ...common('燈箱', '倒數數字')],
  plant: [{ k: 'mode', label: '畫面', type: 'seg', opts: [['grow', '盆栽發芽'], ['seasons', '四季行道樹']] }, ...common('葉子', '花盆／樹幹')],
  clock: [{ k: 'mode', label: '畫面', type: 'seg', opts: [['hourglass', '沙漏'], ['clock', '時鐘快轉'], ['calendar', '撕日曆']] }, { k: 'start', label: '日曆起始日', type: 'range', min: 1, max: 31, step: 1 }, ...common('本體', '強調色')],
  party: [{ k: 'mode', label: '畫面', type: 'seg', opts: [['popper', '拉炮彩帶'], ['fireworks', '煙火']] }, { k: 'amount', label: '數量', type: 'range', min: 0.3, max: 2, step: 0.05 }, ...common('主色', '輔色')],
  coins: [{ k: 'mode', label: '畫面', type: 'seg', opts: [['stack', '硬幣疊高'], ['piggy', '存錢筒']] }, { k: 'count', label: '疊幾排', type: 'range', min: 2, max: 6, step: 1 }, ...common('硬幣', '存錢筒')],
  drink: [{ k: 'mode', label: '畫面', type: 'seg', opts: [['boba', '珍珠奶茶']] }, ...common('奶茶', '吸管／封膜')],
  gacha: [{ k: 'mode', label: '畫面', type: 'seg', opts: [['capsule', '扭蛋機'], ['lots', '籤筒']] }, ...common('機台／籤筒', '扭蛋／籤頭')],
};
