// 地圖招式（區位比較、規劃建設、數據地圖、生活風險、地圖元件）：程式產生的簡化城市底圖＋各招動態。
// 底圖是示意，不是真實地圖；數字、官方圖資類（淹水、分區、學區、地籍）一律標註示意。
// mapfxRenderer 內部必須自給自足，匯出 HTML 時以 toString() 內嵌。

export const MAPFX_HELP: Record<string, string> = {
  taiwan: '縣市 / 地點標籤（縣市用全名，例如「新北市」）',
  split: '每一側一行：「名稱｜重點｜重點」，共兩行',
  race: '起點 / 終點 / 「路線一 分鐘」 / 「路線二 分鐘」（分鐘請用實測）',
  tour: '一行一個地點，依序串連（2–6 個）',
  spot: '一行一個重點，聚光燈依序移過去（2–6 個）',
  phase: '一行一期：「一期 2016」，可加（規劃）',
  future: '一行一項：「捷運｜道路｜公園 名稱 年份」，例如「捷運 環狀線北環段 2030」',
  zoning: '一行一種分區名稱（2–6 種）',
  parcel: '基地名稱 / 面積或說明',
  choro: '「區名 數值」一行一筆；可加 @title 標題、@unit 單位；數字請附來源',
  bubble: '「區名 數值」一行一筆；可加 @title 標題、@unit 單位；數字請附來源',
  bars: '「區名 數值」一行一筆；可加 @title 標題、@unit 單位；數字請附來源',
  nuisance: '設施名稱 / 影響半徑（公尺） / 基地名稱 / 基地距離（公尺）',
  flood: '標題 / 降雨情境說明',
  school: '學校名稱 / 基地名稱 / 結論（例如「學區內」）',
  radar: '一行一個周邊設施（2–7 個）',
  nav: '目的地 / 剩餘時間 / 剩餘距離 / 指示一 / 指示二',
  compass: '比例尺文字（例如 500 m）',
  oldnew: '舊年份 / 新年份',
  drive: '目的地 / 一行一個轉彎指示（2–3 個，例如「右轉 忠孝路」） / 剩餘時間（例如 9 分） / 總距離（例如 2.4 公里）',
  amenity: '一行一個設施：「類別 名稱 步行分鐘」，例如「超市 某某超市 4」；類別用超市、學校、公園、醫院、捷運、餐飲、銀行等，分鐘請用實測',
};

export const MAPFX_LOOP: Record<string, number> = { drive: 9, amenity: 7, taiwan: 6, split: 6, race: 7, tour: 7, spot: 8, phase: 6, future: 7, zoning: 6, parcel: 5, choro: 6, bubble: 6, bars: 6, nuisance: 6, flood: 7, school: 6, radar: 6, nav: 8, compass: 4, oldnew: 6 };
