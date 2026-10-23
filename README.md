# Motion Atlas｜字卡與文字特效圖鑑

https://motion.leichthub.com

短影音動態素材庫，分十個工作區（目前前台 244 招，另保留隱藏原版）＋套組：

- **文字特效**（114 招）：依用途分 6 類（開場標題、字幕標註、資訊字卡、轉場切換、強調情緒、風格氛圍），原本的 13 個技法分類改當「風格」篩選；首頁最上方是建案片常用 12 招（`src/uses.ts`）
- **轉場**（7 招，#256–262，`src/effects/cut.ts`）：擦除推擠（色塊推擠、形狀擦除：圓形／房子／斜切、開門轉場、翻頁堆疊）、節奏閃切（閃白閃黑、甩鏡速度線、故障轉場）。每招是一次完整換場：蓋過畫面 → 露出下一段標題，可直接放進 Combo 兩段之間，或輸出素材疊在剪接點。
- **元件**（20 招，#263–282，`src/effects/ui.ts`）：社群介面（留言回覆卡、通知橫幅、搜尋框打字、愛心飄起、手指點擊、瀏覽器框、聲波動態、子母畫面框）、開場收尾（系列編號角標、結果先講、片尾推薦卡、POV 標籤條）、房產資訊（通勤碼錶、資料來源條、優缺點對照、日照方位、電梯樓層、規格資訊卡、星等評分卡、工程進度、付款比例表 #312）。介面皆為中性示意、不放平台標誌；橫式畫面自動縮放排版。
- **圖片運鏡**（21 個模組）：單張運鏡（推拉、甩入、3D 卡片、視窗彈出、分層視差、手機框）、多張組合（前後對比、翻卡、拍立得、宮格、分割畫面）、標註轉場（放大鏡、影片定格標註、縮放穿越）、裁切與遮罩（遮罩揭露、切片錯位、拼塊組圖、撕紙揭露、剪報拼貼、形狀變換、前景遮擋換景）
- **地圖區位**（15 招）：捷運鐵路路網（單線路網、路線條、多線路網：轉乘站、焦點站、鐵路黑白線、規劃中虛線、區域圈，文字行描述 `src/transit.ts`，本機渲染 `/r/transit.js`）；基地框（可加減角點做 L 形）、路名、資訊卡、資訊條、圓形標記（A棟/B棟）、通勤路線、放射路線；場景可加「太空降落」開場
  - 地圖招式（#314–334，`src/mapfx.ts`，程式產生的簡化城市示意底圖，本機渲染 `/r/mapfx.js`）：區位與路線（台灣定位開場、兩區對照、通勤路線賽跑、地圖導航 #333、看屋行程串連、聚光燈導覽）、規劃建設（重劃區分期、重大建設預告、土地使用分區、基地地籍）、數據地圖（行政區著色圖、數字泡泡、立體長條）、生活機能與風險（生活機能地圖 #334、嫌惡設施影響圈、淹水潛勢示意、學區範圍、雷達掃描、手機導航畫面）、地圖元件（指北針與比例尺、新舊地圖對照）。官方圖資類一律標註示意。
- **物件特效**（14 招）：水滴泡泡、魔術方塊、星空宇宙；工作室 `/?view=object`，MCP `build_object_scene`，本機渲染 `/r/obj.js`。隕石與俯瞰原版已隱藏保留，精修版移入插畫工作區。
  - 生活物件（#283–311，`src/propkit.ts`，與魔術方塊共用物件編輯器與 `build_object_scene`，每個分類一個專屬編輯器）：建案工地（起重機吊樑、防塵網完工）、交屋鑰匙（鑰匙串、門牌開門）、家具進場（掉落、滑入）、等角小屋（蓋房子、夜晚亮燈）、合約文件（簽約蓋章、翻頁）、城市天際線（長高、日夜）、天氣（下雨、晴天、颱風、起霧、颱風路徑預報示意圖 #313：台灣輪廓、過去路徑、24／48／72 小時預報點與 70% 機率範圍，四種示意路徑）、交通號誌（紅綠燈倒數、行人號誌）、植物綠地（盆栽發芽、四季行道樹）、時間（沙漏、時鐘快轉、撕日曆）、慶祝（拉炮、煙火）、錢幣存錢筒（疊高、存錢筒，示意不放真實金額）、抽籤扭蛋（扭蛋機、籤筒）。
- **插畫**（23 招）：星空物件系列 5 招（天體 #169、星球飛越 #195、推近地球 #199、精修隕石 #244、太空船 #240；隕石在編輯器切換四種樣式）、俯瞰 8 招（`src/nature.ts`，MCP `build_nature_scene`）、天空物件 2 招（客機、熱氣球；開車上路 #237、馬車旅行 #238、火車捷運 #241 依既有設定隱藏保留，`src/transport.ts`，MCP `build_transport_scene`）、海洋世界 8 招（海底 7 招 `src/illustration.ts`，MCP `build_illustration_scene`；輪船 #242 用 `build_transport_scene`）；每招有獨立編輯設定。
- **圖表特效**（20 招）：直條、堆疊直條、橫條、排名、瀑布、折線、區域、組合（雙軸）、圓餅、環圈、儀表板、進度環、象形圖、樹狀、旭日、漏斗、盒鬚、XY 散佈、泡泡、雷達；數據一行一筆「標籤 數值」（`src/chart.ts`，本機渲染 `/r/chart.js`），全站預覽文字只換標題
- **格局**（7 招）：戶別定位、公設導覽、逐間高亮、看屋動線、單房聚焦、戶型比較、平面立體傾斜；格局工作室 `/?view=plan` 放入建商平面圖、拉框或多邊形標房間、點動線，自動抓平面圖範圍（去掉 DM 留白與 Logo），可手動調整；MCP `build_plan_scene`，本機渲染 `/r/plan.js`（`src/plankit.ts`）。網站示範為程式畫的虛構戶型，真實 DM 只存在使用者自己的預設與 Combo
- **套組**：獨立分頁 `/?ws=kits`，常見段落順序的現成 Combo（`src/uses.ts` 的 KITS）
- **圖解動畫**：工法剖面與流程等一支一支客製的示意圖（樓板剖面層疊、同層排水剖面、預鑄工法流程），文字可換、構圖交給 AI 改寫（`src/effects/diagram.ts`）

每一招都是原生 HTML／CSS／JS 即時渲染，可以：

- 站頂切換工作區（`/?ws=photo`、`/?ws=map`），再依分類、情境標籤、關鍵字搜尋與瀏覽，收藏常用的招式
- 輸入自己的文字、切換配色（7 組預設 + 自訂主色），所有卡片即時套用
- 打開單一特效：切換 16:9／9:16／1:1、底色、播放速度，全螢幕錄影
- 一鍵複製提示詞：網頁實作（中文）、English、AI 影片生成，或直接複製／下載完整 HTML 原始碼

## MCP 與 Combo 庫

省 token 設計：工具回傳精簡 JSON（不縮排、不重複附 structuredContent）；預覽與編輯網址自動壓縮成 `?cz=`／`?z=`（deflate-raw，舊的 `?combo=`／`?d=` 仍可用）；`get_effect` 支援 `ids` 一次查多招、預設不附提示詞（要時加 `format`）；`list_categories` 套組只列摘要，`kit` 參數取完整段落；`compose_combo`／`get_combo` 預設不附重做提示詞（`include_prompt`）。

網站內建 MCP（Model Context Protocol）伺服器，讓 Claude、ChatGPT、Claude Code 直接使用這個圖鑑：描述需求 → AI 查特效 → 組成 Combo（多段特效串成一段動畫）→ 給預覽連結 → 存進 Combo 庫當日後參考。

- MCP 端點：`https://motion.leichthub.com/mcp`（Streamable HTTP、無狀態）
- 寫入（儲存／刪除 Combo）需要金鑰：網址加 `?key=金鑰`，或 `Authorization: Bearer 金鑰`
- 工具：`list_categories`、`search_effects`、`get_effect`、`build_map_scene`、`build_drop_scene`、`build_photo_scene`、`build_object_scene`、`build_illustration_scene`、`build_transport_scene`、`build_nature_scene`、`list_presets`、`get_preset`、`save_preset`、`compose_combo`、`save_combo`、`list_combos`、`get_combo`、`delete_combo`

### 與 AI 來回修改（預設）

1. AI 用 `build_map_scene`／`build_drop_scene`／`build_photo_scene` 產生段落，回傳 `edit_url`；`get_combo` 也會回傳每段的 `scene_edit_urls`
2. 打開 `edit_url` 進入對應工作室，手動調整後按「存成預設」，得到代碼（例如 `p7k2x`）；之後按「存回」會更新同一個代碼
3. 把代碼告訴 AI（工作室有「複製給 AI」），AI 用 `get_preset` 讀取，或在 Combo 的 scenes 直接寫 `{ "preset": "p7k2x" }`
4. 網址：`/?edit=p7k2x`（已存的預設）、`/?edit=map|drop|photo&d=…`（尚未存的設定）
5. API：`GET /api/presets?kind=map|drop|photo`、`GET /api/presets/:id`；寫入 `POST /api/presets`、`PUT|DELETE /api/presets/:id`

Combo 存的是預設當下的內容（快照）；預設更新後，請 AI 重新以 `{ "preset": 代碼 }` 存一次 Combo。

### 星空物件系列・精修插畫

三招精修宇宙效果與 #244 精修隕石合為「插畫 → 星空物件」系列（分類代碼沿用 `meteor`，共四招）。「物件 → 星空宇宙」只保留三招原有星空背景：

- #169 `cosmos-illustrated-orbit`：行星光環、太陽、月球、地球在單一編輯器切換。球面材質自轉、地軸傾角與日照方向，環帶與衛星正確前後遮擋；依天體顯示環帶、雲層或日珥控制。
- #195 `cosmos-illustrated-flyover`：地球、月球、火星、太陽地表在單一編輯器切換。地球使用連續球面地表與獨立海岸材質，避免地圖重複鋪排；其餘地表以分方向取樣過濾的透視投影推進，抑制遠處橫紋與閃爍。可調前進速度、飛行高度、地平線、弧度與鏡頭傾斜；月面天邊有地球，地球可加低雲。地表為示意插畫，太陽飛越為視覺想像。
- #199 `cosmos-illustrated-earthzoom`：獨立推近地球，可調起訖倍率、聚焦位置、推近／拉遠、自轉、雲層及衛星。

三個編輯器 `/?view=cosmic-orbit|cosmic-flyover|cosmic-earthzoom` 各自記憶設定，前兩招的四種樣式也各自記憶，預設清單依編輯器分開。支援換色、五種背景、透明、比例、PNG、WebM、PNG 序列、JSON、編輯連結、預設及 Combo。透明飛越保留地面、天空透明。MCP `build_cosmos_scene` 使用 `mode=orbit|flyover|earthzoom`、`body=gas|sun|moon|earth|mars`（依 mode 限制），回傳設定、專屬參數與編輯連結。共用引擎 `/r/cosmos.js`：`MA_COSMOS.createRenderer(canvas,overlay,scene,assetOrigin)`，先 `await renderer.ready` 再逐格 `render(t,W,H)`；結束 `dispose()`。素材位於 `public/media/cosmos-illustrated/`，保留原始圖檔，材質由 Canvas 取樣，不加文字、投影、模糊或光暈。

前台沿用 #169、#195、#199，各自有專屬編輯器；#185–187、#196–198 併入樣式切換。九招原版程式與明確 ID 引用保留，舊預設與 Combo 相容。前一版 #253–255 數字入口仍可開啟對應精修效果，但不再作為前台編號；已分配的內部 `no` 保留，`catalogNo` 與 `NUM` 提供前台編號，新增效果仍從內部最大編號 +1 分配。`/tests/cosmos-refined.html` 驗證目錄、九樣式、動態、時間重現、比例、透明度、控制項、MCP、預設、Combo 與獨立 HTML 一致。`python tests/cosmos-ui.py` 在本機 Pages 預覽驗證三個編輯器、樣式記憶、預設分類、Combo 返回、透明 PNG 與 WebM；預設網址為 `http://127.0.0.1:8793`。

### 隕石與俯瞰・精修插畫

隕石分類只顯示一招 `meteor-illustrated`（#244），在編輯器切換岩石、冰晶、熔岩、金屬四種樣式。可調自轉、漂浮、碎石數量與散布、飛行方向，熔岩另有熱度脈動，冰晶與金屬另有切面反光。五種背景為深空、星雲、塵帶、星夜與暖白圖鑑，另可去背輸出。

俯瞰分類有八招 `aerial-illustrated-*`（#245–252）：城市車流、河流船隻、山川雲層、草原牛馬、農田農車、海岸浪線、森林樹冠、交流道主線車流。各招有獨立設定記憶與專屬參數，共用視野推近、平移幅度與方向、整體位置、大小、旋轉、速度及配色；五種環境為自然、暖色、清冷、夜色與墨色。可選滿版、圓角圖卡或圓形視窗。所有地景都是虛構插畫，不代表實際地點；透明模式輸出地景圖卡，卡片外透明，地景本身保留。

隕石工作室 `/?view=meteor` 與俯瞰工作室 `/?view=aerial` 分開，各自記住設定並只列出同類預設；舊的 `/?view=nature` 與編輯連結仍相容。各卡片「編輯精修插畫」開啟本招。支援 PNG、透明 WebM、PNG 序列、JSON、編輯連結、預設及 Combo。共用引擎 `src/nature.ts` 自給自足，素材位於 `public/media/nature-illustrated/`，只載入當前場景需要的素材，保留原始檔並提供 CORS。動態圖層採同一地景座標：車流沿車道、下穿橋面處遮擋、船隻沿河道、牛馬避開池塘與柵欄、前景樹冠避開林間小路。

MCP `build_nature_scene` 使用 `mode=meteor|city|river|mountain|grass|farm|coast|forest|highway`，隕石另用 `style=rock|ice|lava|gold`，會回傳專屬參數與編輯連結。`/r/nature.js` 提供 `MA_NATURE.createRenderer(canvas,overlayCanvas,scene,assetOrigin)`；先 `await renderer.ready` 再 `renderer.render(t,W,H)`，結束時 `renderer.dispose()`。`/tests/nature-refined.html` 驗證單一隕石、多樣式、八招俯瞰、專屬控制、三種比例、透明度、MCP、預設、Combo、獨立 HTML 與原版相容。`/tests/nature-editors.html` 驗證編輯器拆分、舊設定移轉、場景記憶、預設過濾與尾焰移除。

原有四招隕石 `obj-meteor-*`（#158–161）及八招俯瞰 `obj-aerial-*`（#170–177）只標記隱藏，完整保留代碼、編號、原動畫與舊連結／預設／Combo。原有交通工具隱藏設定保持不變。

### 交通工具・精修插畫（天空物件／星空物件／海洋世界）

交通分類保留七招精修插畫（#237–243），其中 #237／#238／#241 依既有設定隱藏，前台列出四招，依主題分到三個分類：客機、熱氣球在「天空物件」，太空船 #240 在「星空物件」，輪船 #242 在「海洋世界」。舊 `obj-vehicle-*`（#178–184）只隱藏，保留原始程式、編號、連結、object 預設及 Combo。

專用編輯器 `/?view=transport`，各卡片的「編輯精修插畫」會開啟本招並記住各自設定：

- 汽車：獨立輪胎轉速、懸吊起伏、道路、車燈。
- 馬車：完整馬匹插畫綁定膝／飛節、四拍接地步態、木輪轉速、車身起伏、道路。
- 客機：爬升幅度、飛行浮動、凝結尾、前景雲。
- 太空船：推力、噴焰長度、震動、尾焰火星、爬升。
- 火車：1–5 節車廂、間距、輪速、行進起伏、軌道。
- 輪船：吃水深度、水線遮擋、波浪幅度、船身搖晃、煙囪煙量、船尾浪。
- 熱氣球：升降幅度、擺動、風力漂移、燃燒器與雲量。

共用大小、速度（連動片長 4.8–20 秒）、位置拖曳、方向、角度、保留紋理的換色、透明度、鏡頭視差；五種背景為城市、田野、高空、海岸與宇宙，另支援透明背景。可輸出 PNG、WebM、PNG 序列，儲存預設、JSON、編輯連結與加入 Combo。透明時不繪道路／軌道，可另外關閉煙、尾焰等取得乾淨物件。

`src/transport.ts` 是所有預覽、輸出與獨立 HTML 共用的自給自足 Canvas 引擎，只載入所選場景素材。素材在 `public/media/transport-illustrated/`，保留原圖並提供 CORS。MCP 使用 `build_transport_scene`（mode=car|carriage|plane|rocket|train|ship|balloon），回傳本招 `params_doc` 與編輯連結。`/r/transport.js` 提供 `MA_TRANSPORT.createRenderer(canvas, overlayCanvas, scene, assetOrigin)`；先 `await renderer.ready`，再 `renderer.render(t,W,H)`，最後 `renderer.dispose()`。馬匹使用新版完整插畫 `horse-complete-v2.png`，原本的分離身體／腿部素材保留。馬腿採連續蒙皮與固定骨長，四蹄交替接地，輪速與路面預設配合步態；船隻的船底由世界座標的水線遮住，搖晃穿過水面，透明輸出也保留正確水線。`/tests/transport-anatomy.html` 提供四個步態時間點及船隻預覽，驗證骨長、接地、吃水與透明度。可在 Vite 開啟 `/tests/transport-refined.html` 檢查動畫、專屬參數、透明度、比例、MCP、預設、Combo、獨立 HTML 與舊版相容性。

### 海洋世界・精修插畫

海底分類前台只顯示七招精修插畫，原有向量版隱藏保留：魚群穿梭（#224）、海豚同行（#225）、海洋巨物（#200）、鯊魚迎面衝刺（#226）、珊瑚花園（#227）、深海下潛（#228）、潛水艇探索（#229）。六招新精修動畫使用新的 `ocean-illustrated-*` 代碼。原有七招 `obj-ocean-*`（#188–194）只標記 `hidden: true`，保留原始動畫、編號與編輯功能，舊連結、Combo、object 預設及舊 MCP 呼叫仍播放原版，沒有轉換或刪除。`ALL_EFFECTS` 保留全部效果，`EFFECTS` 是前台可見清單；搜尋、分類、API 目錄只列可見清單，`get_effect` 和 `findEffect` 可讀取隱藏原版。

每招有獨立的編輯面板與記憶設定，專用編輯器 `/?view=illustration`，也可從各卡片按「編輯精修插畫」：

| 場景 | 專屬編輯 |
| --- | --- |
| 魚群 | 數量、波浪／平行／V 字／環繞隊形、疏密、遠近、游動弧度 |
| 海豚 | 數量、隊形、隊伍間距、起伏、遠近 |
| 海洋巨物 | 座頭鯨／抹香鯨／大白鯊／巨大烏賊／原創海怪、掠過／停留 |
| 迎面鯊魚 | 衝刺起點、力度、近身震動、擦身／遮滿收尾 |
| 珊瑚 | 群落數量、間距、前後層次、水流與枝梢擺動 |
| 深海 | 下潛速度、前景岩柱、岩壁視差、深暗程度 |
| 潛水艇 | 航行起伏、探照燈強度／角度、螺旋槳速度、氣泡拖尾 |

共用大小、速度、位置（拖曳）、角度、方向、紋理換色、透明度、鏡頭視差、懸浮顆粒／種子、背景亮度與五種背景（珊瑚礁、開闊藍海、深海海溝、沉船遺址、海底洞穴），另可選透明背景。深海的海溝選項使用無海面的深淵底圖。速度 0.6–2.5 倍連動片長 `12 / speed`（4.8–20 秒），預設 9:16，支援 16:9、1:1。無文字入場；不加陰影、模糊或光暈。原創海怪為幻想插畫。支援 PNG、WebM、PNG 序列、JSON 匯入／匯出、編輯連結、預設與 Combo；透明 WebM 需由支援 alpha 的剪輯軟體讀取，PNG 序列保留透明度。

`src/illustration.ts` 是卡片、編輯器、輸出、MCP、獨立 HTML 共用的自給自足 WebGL／Canvas 引擎。MCP 使用 `build_illustration_scene`，`mode=fish|dolphins|whale|shark|coral|deep|submarine`，會回傳本招的 `params_doc` 與編輯連結。引擎端點 `/r/illustration.js`：`MA_ILLUSTRATION.createRenderer(glCanvas, particleCanvas, scene, assetOrigin)` 後先 `await renderer.ready`，再 `renderer.render(t,W,H)`，依序合成兩張 canvas，最後 `renderer.dispose()`。Fx 掛載後也可等待 `root.motionReady`，用 `root.motionSeek(tSeconds)` 逐格渲染。群體使用逐物件範圍繪製，避免每條魚都重繪整張海景；種子與時間相同即可重現畫面。

只載入所選場景需要的素材。素材位於 `public/media/whale-illustrated/`，提供 CORS，下載 HTML 與 sandbox Combo 播放時需要連線載入。既有素材檔不覆寫。三個套組「珊瑚生態」「巨物相遇」「深海探險」也已改用精修版。

啟動 Vite 後開啟 `/tests/ocean.html`，可預覽原版，`/tests/ocean-refined.html` 可預覽七種精修動畫並檢查獨立參數、三種比例、透明度、時間變化、匯出、MCP、預設、套組及隱藏原版的保留，結果為 `window.oceanResults`。另有 `/tests/illustrated-whale.html` 與 `/tests/illustration-editor.html`，驗證巨物造型、換色與共用編輯器。

### 圖片運鏡與本機渲染

圖片工作室（`/?view=photo`）有 21 個固定模組（見上方清單），每個模組的圖片插槽、參數與拖曳把手定義在 `src/photokit.ts`。預設只存「動畫怎麼動」，不含圖片；AI 在 scenes 寫 `{ "preset": "代碼", "images": ["..."] }` 就能換圖沿用同一套運鏡。

裁切與遮罩新增模組（固定編號 #151–156）：

| module | 效果 | 圖片順序 |
| --- | --- | --- |
| `slices` | 切片錯位 | 一張照片，橫／直條交錯滑入 |
| `tiles` | 拼塊組圖 | 一張照片，不等大矩形依序拼合；seed 固定構圖與隨機順序 |
| `tear` | 撕紙揭露 | 撕開前、撕開後；四方向、可調紙邊 |
| `collage` | 剪報拼貼 | 選填背景、剪報 1–3；請先準備去背 PNG／WebP，不會自動去背 |
| `morph` | 形狀變換 | 照片、選填底圖；圓形 → 膠囊 → 全螢幕 |
| `occlude` | 前景遮擋換景 | 第一場景、第二場景、選填透明前景；不透明底板遮住換景接縫 |

在圖片工作室選「裁切與遮罩」，放圖後按播放或拖動時間軸；剪報位置與形狀中心可拖曳。上傳、加入 Combo 及帶圖儲存預設均使用保留 alpha 的 WebP（瀏覽器不支援時退回 PNG）。動作總時間超過片段長度時，這六個模組會等比例壓縮時間，確保最後一格完成。MCP 的 `build_photo_scene` 使用同一組 module／params，並回傳參數說明、編輯連結與 Combo 場景。

照片在本機時，用繪製引擎逐格渲染，畫面與網站一致：

- `GET /r/photo.js` → `MA_PHOTO.drawPhoto(ctx, W, H, scene, t, [img1, img2])`
- `GET /r/map.js` → `MA_MAP.drawScene(ctx, W, H, scene, t, bgImage)`
- `GET /r/drop.js` → `MA_DROP.draw(ctx, W, H, o, lines, t)`（`const { o, lines } = MA_DROP.parse(words)`）

t 從 0 開始每格加 1/fps，用 Playwright 存 PNG 序列再交給 ffmpeg 合成。

裁切與遮罩的瀏覽器回歸測試：啟動 `npm run dev` 後開啟 `/tests/photo-masks.html`。測試使用 Canvas 像素比較，涵蓋三種比例、切片對齊、轉場遮擋、透明剪報、短片段的 PNG 尾格，以及匯出引擎的一致性；結果也可由 `window.photoMaskResults` 讀取。

預鑄工法流程（`precast-process`，#157）依使用者提供的參考圖重繪，以 9:16 呈現「工廠預鑄 → 現場組裝 → 澆築結合」，沒有預設工程尺寸或強度。`words` 各欄位順序見特效的 `hint`，空行代表隱藏該位置的文字；Combo 保留完整文字與 12 秒循環。`Fx.duration` 可宣告 Canvas 動畫的完整長度，沒有設定的舊特效維持原本播放長度。啟動 Vite 後可開啟 `/tests/precast-process.html`，查看階段畫面、文字定位、匯出一致性與減少動態測試；結果為 `window.precastResults`。

- 公開 API：`GET /api/effects`、`GET /api/combos`、`GET /api/combos/:id`；寫入：`POST /api/combos`、`PUT|DELETE /api/combos/:id`
- 播放頁：`/c/<id>`（加 `?hud=0` 隱藏進度條，適合錄影）
- 未儲存的預覽：`/?combo=<編碼>`；網站分頁：`/?view=combos`、`/?view=draft`、`/?view=mcp`

連線方式（網站「Combo → MCP 連線」也有說明）：

```sh
# Claude Code
claude mcp add --transport http motion-atlas https://motion.leichthub.com/mcp --header "Authorization: Bearer 你的金鑰"
```

Claude 網頁版／App 與 ChatGPT（開發者模式）：新增自訂連接器，網址填 `https://motion.leichthub.com/mcp?key=你的金鑰`。

## 開發

```sh
npm ci
npm run dev      # http://127.0.0.1:4174
npm run build    # tsc 型別檢查 + vite build → dist/
npm run preview

# 含 MCP 與資料庫的本機測試（需要 wrangler）
npx wrangler pages dev dist --d1 DB=motion-local --binding MOTION_KEY=test
```

## 結構

| 路徑 | 用途 |
| --- | --- |
| `index.html` | 頁面骨架、詳細頁 dialog |
| `src/main.ts` | 篩選、搜尋、收藏、預覽管理、詳細頁、鍵盤操作 |
| `src/engine.ts` | 特效掛載引擎：CSS 範圍化、配色變數、速度控制 |
| `src/prompts.ts` | 四種提示詞產生器與單檔 HTML 匯出 |
| `src/data.ts` | 分類、配色、特效總表 |
| `src/effects/*.ts` | 各分類的特效定義 |
| `src/combo.ts` | Combo 驗證、HTML 播放器、提示詞（網站與伺服器共用） |
| `src/combo-ui.ts` | 網站的 Combo 庫、草稿編輯、MCP 說明 |
| `src/photokit.ts`、`src/photo-studio.ts` | 圖片運鏡引擎（21 模組、參數規格）與圖片工作室 |
| `functions/r/` | 繪製引擎 JS（本機逐格渲染用） |
| `functions/mcp.ts` | MCP 伺服器（JSON-RPC） |
| `functions/_lib/tools.ts` | MCP 工具定義 |
| `functions/_lib/store.ts` | D1 資料庫存取（第一次使用自動建表） |
| `functions/api/`、`functions/c/` | REST API 與 Combo 播放頁 |
| `src/styles.css` | 網站樣式（站內 class 一律以 `ma-` 或具體前綴命名，避免滲入特效） |

## 字型

標題與內文用昭源黑體（Chiron Hei HK，Google Fonts），數字用 Anton。Anton 只取數字與 `% + , - . :`，以 data URL 內嵌在 `src/fonts.ts`（字型名 `MA Num`），排在字型順序最前面，其他字元自動落回昭源黑體。特效 CSS 用 `var(--sans)`、畫布用 `"MA Num", "Chiron Hei HK", "Noto Sans TC"`；本機渲染載入 `/r/fonts.css`。兩者皆為 SIL Open Font License，可商用。

### 字型組合

`src/fonts.ts` 定義 6 組：sharp 俐落黑體（預設，昭源黑體＋Anton 數字）、round 親切圓體（昭源圓體）、serif 質感宋體（思源宋體）、hand 手寫楷書（霞鶩文楷）、cute 可愛粉圓（jf 粉圓）、classic 標準思源。網站「字型」選單即時套用；Combo 可設整支的 `font` 與每段的 `scenes[].font`；地圖、圖片、水滴場景的 JSON 也可帶 `font`。畫布特效透過內嵌的 `MA_FONTS` 查字型。MCP 說明會請 AI 依段落情緒挑選、一支影片以 2–3 組為限。

## 新增一個特效

在對應分類檔加一筆 `Fx`：

- `no`：**固定編號**，用目前最大編號 +1（`rg -o --no-filename 'no:\s*[0-9]+' src | rg -o '[0-9]+' | sort -n | tail -1` 可查）。編號一旦公開就不再變動、刪除特效也不回收，AI 與 Combo 會用「#編號」引用；重複時瀏覽器 console 會報錯
- `css`：用 `.S` 代表特效根節點、`K_` 當 keyframes 前綴，會自動範圍化成 `.fx-<id>`
- 可用變數：`--bg` `--fg` `--ac` `--ac2` `--mu`、字體 `--sans` `--serif` `--mono`；尺寸用 `cqw`／`cqh`／`cqmin`
- `html(words)`：回傳特效 DOM；`run(root, words)`（選填）處理 JS 動畫並回傳清除函式。`run` 必須自給自足、不可引用模組變數，因為匯出時會用 `toString()` 內嵌
- `motion`／`motionEn`：給 AI 的動態描述，會組進提示詞
- 用 `@property` 註冊的自訂屬性是全域的，名稱請加特效專屬前綴

## 部署

Cloudflare Pages 連接本 repo（Git 整合），push 到 `main` 自動部署。

- Build command：`npm run build`
- Output directory：`dist`
- 環境變數：`NODE_VERSION=22`
- 自訂網域：`motion.leichthub.com`

MCP 與 Combo 庫另外需要（Pages 專案 → 設定）：

1. 建立 D1 資料庫（例如 `motion-combos`），在「繫結」新增 D1，變數名稱 `DB`。資料表會在第一次使用時自動建立。
2. 在「變數與機密」新增加密變數 `MOTION_KEY`（自己產生一組長隨機字串），這就是寫入金鑰。
3. 重新部署一次讓設定生效。

沒有設定時，網站與特效仍正常運作；MCP 可讀取特效，Combo 相關功能會回傳設定提示。
