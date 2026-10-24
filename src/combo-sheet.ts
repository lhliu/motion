// Combo 分格預覽：每一段在指定時間點（例如段落的 45%、90%）各拍一格，排成一張圖給 AI 檢查。
// 每格是一個只含那一段的 Combo 播放頁（hold 模式）；外層等全部載入後統一發號令，
// 讓每格的延遲 = 最晚的時間點 − 自己的時間點，同一瞬間全部停在各自的目標時間，再標記 #ready 讓截圖服務拍照。
// 伺服器與網站共用，不可碰 DOM。
import { findEffect, sceneSeconds, type Combo } from './combo';

export interface SheetCell {
  /** 第幾段（從 1 起算） */
  scene: number;
  effect: string;
  /** 段落內的比例 0–1 */
  at: number;
  /** 段落內的秒數 */
  t: number;
  /** 只含這一段的 Combo */
  combo: Combo;
}

export const SHEET_CELL: Record<string, [number, number]> = { '9:16': [216, 384], '16:9': [384, 216], '1:1': [270, 270] };
/** 一列放幾段 */
const PER_ROW: Record<string, number> = { '9:16': 3, '16:9': 2, '1:1': 3 };

export const sheetCells = (c: Combo, at: number[], range?: { from?: number; to?: number }): SheetCell[] => {
  const from = Math.max(1, range?.from ?? 1), to = Math.min(c.scenes.length, range?.to ?? c.scenes.length);
  const out: SheetCell[] = [];
  for (let i = from - 1; i < to; i++) {
    const s = c.scenes[i];
    // 疊加圖層：有涵蓋這一段的才帶進來，改成只作用在第 1 段
    const overlays = (c.overlays ?? []).filter((o) => (o.from ?? 1) <= i + 1 && i + 1 <= (o.to ?? c.scenes.length)).map((o) => ({ ...o, from: 1, to: 1 }));
    const one: Combo = { ...c, id: undefined, scenes: [{ ...s, transition: undefined }], overlays, transition: 'cut' };
    const sec = sceneSeconds(s);
    for (const f of at) out.push({ scene: i + 1, effect: s.effect, at: f, t: Math.round(sec * f * 100) / 100, combo: one });
  }
  return out;
};

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[ch]};`);

/** 分格預覽頁；srcs 與 cells 一一對應（每格的播放網址） */
export const sheetHtml = (c: Combo, cells: SheetCell[], srcs: string[]): string => {
  const ratio = c.ratio ?? '16:9', [w, h] = SHEET_CELL[ratio] ?? SHEET_CELL['16:9'], per = PER_ROW[ratio] ?? 2;
  const byScene = new Map<number, number[]>();
  cells.forEach((cell, k) => byScene.set(cell.scene, [...(byScene.get(cell.scene) ?? []), k]));
  const maxT = Math.max(0, ...cells.map((x) => x.t));
  const blocks = [...byScene.entries()]
    .map(([n, ks]) => {
      const fx = findEffect(cells[ks[0]].effect);
      return `<section><h3><b>${n}</b>${esc(fx?.zh ?? cells[ks[0]].effect)} <small>${esc(cells[ks[0]].effect)}</small></h3><div class="row">${ks
        .map((k) => `<figure><iframe data-k="${k}" data-t="${cells[k].t}" src="${esc(srcs[k])}" width="${w}" height="${h}" scrolling="no"></iframe><figcaption>${Math.round(cells[k].at * 100)}%・${cells[k].t}s</figcaption></figure>`)
        .join('')}</div></section>`;
    })
    .join('');
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>${esc(c.title)}・分格預覽</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:16px;background:#e9e6df;font:13px system-ui,"Noto Sans TC",sans-serif;color:#1d2433}
h1{font-size:15px;margin:0 0 12px}.grid{display:grid;grid-template-columns:repeat(${per},max-content);gap:14px 18px}
section{background:#fff;border-radius:8px;padding:8px 10px 6px}h3{margin:0 0 6px;font-size:13px;display:flex;gap:6px;align-items:baseline}
h3 b{background:#1d2433;color:#fff;border-radius:4px;padding:0 6px}small{color:#7a7f8a;font-weight:400}
.row{display:flex;gap:8px}figure{margin:0}iframe{display:block;border:0;background:#000;border-radius:4px}figcaption{color:#7a7f8a;font-size:11px;margin-top:2px}
#errs{margin-top:12px;color:#c0392b;white-space:pre-wrap;font:12px ui-monospace,monospace}
</style></head><body>
<h1>${esc(c.title)}｜${ratio}｜${cells.length} 格</h1>
<div class="grid">${blocks}</div><pre id="errs"></pre>
<script>
const frames=[...document.querySelectorAll('iframe')],maxT=${maxT};let loaded=0,started=false;const errs=[];
const start=()=>{if(started)return;started=true;
  frames.forEach((f)=>f.contentWindow.postMessage({type:'ma-go',delay:Math.round((maxT-Number(f.dataset.t))*1000)},'*'));
  // 最晚的格子到達目標時間後再等一下讓畫面繪製完成
  setTimeout(()=>{document.getElementById('errs').textContent=errs.join('\\n');const r=document.createElement('i');r.id='ready';document.body.appendChild(r);},maxT*1000+350);};
addEventListener('message',(e)=>{const f=frames.find((x)=>x.contentWindow===e.source);if(!f)return;
  if(e.data&&e.data.type==='ma-loaded'&&++loaded>=frames.length)start();
  if(e.data&&e.data.type==='ma-err')errs.push('第 '+f.closest('section').querySelector('b').textContent+' 段：'+e.data.msg);});
// 有格子載入失敗也不要卡住：最多等 12 秒就開始
setTimeout(start,12000);
</script></body></html>`;
};
