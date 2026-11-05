import type { Fx } from '../types';
import { esc } from '../util';
import { objSceneFromWords } from '../objkit';
import { propFx, FLAT, FLAT_EN } from './object';

// 2026-11-05 新增：#691 拉鍊拉開轉場（物件類，畫在 render/prop.ts 的 estate.zipper）。
// 字畫在開口裡的下一段畫面（不用物件下方的文字層）；next=photo 會把圖片工作室目前的第一張照片帶進場景（匯出 HTML 一併內嵌）。
const ZIP_PRESET: Record<string, number | string> = {
  texts: '打開這間3房', sub: '新店・實拍', dir: 'v', zmode: 'open', next: 'card', fabric: 'kc', pull: 'silver', teeth: '#d9dee6', angle: 14, card: '#f5f0e6', size: 1, speed: 1, bg: 'transparent', layout: 'none', x: 0.5, y: 0.5,
};
const base = propFx('estate', 'zipper', 691, ZIP_PRESET, {
  zh: '拉鍊拉開轉場', en: 'Zipper Reveal',
  desc: '外套布面中間一條拉鍊，拉鍊頭往下拉開成 V 字露出下一段字卡或照片，拉到底兩片布往左右飛走',
  tags: ['轉場', '開箱', '片頭', '揭曉', '拉鍊'],
  sample: ['打開這間3房', '@dir=v;fabric=kc;pull=silver;mode=open;next=card;sub=新店・實拍'],
  motion: `畫面是一件外套的布面（深藍斜紋、胸口一條橘色配色橫條、白色虛線縫線），中間一條拉鍊：左右交錯咬合的銀色齒、淺一階的布帶，拉鍊頭的拉片上印「KC」。拉鍊頭先輕晃一下，接著往下拉；被拉過的地方布面從中線裂成 V 字往兩側打開，布帶和齒跟著分開，開口邊緣露出深一階的布料反摺，開口裡是下一段畫面（字卡上的大標與小字、照片或透明）；拉到底後兩片布往左右飛出畫面，整片換場。可改成橫向由左往右拉，或 mode=close 反過來把布合回、拉鍊往上拉上當結尾。${FLAT}`,
  motionEn: `The frame is a jacket's fabric (navy twill, an orange chest stripe, white dashed stitching) with a zipper down the middle: interlocking silver teeth, lighter tape and a slider whose pull tab reads “KC”. The pull wobbles, then slides down; behind it the fabric splits into a V, tape and teeth parting, a darker folded-back edge showing along the opening, revealing the next shot inside (a title card with headline and subtitle, a photo, or transparency); at the bottom both halves fly off left and right, completing the transition. It can also run horizontally left to right, or with mode=close in reverse, the halves closing back in and the zipper pulled up as an outro. ${FLAT_EN}`,
});
export const fx1105: Fx[] = [
  {
    ...base,
    added: '2026-11-05',
    preferredRatio: '16:9',
    hint: '第一行＝開口裡的大標（建議 2–8 字）/ @設定：dir（v 由上往下｜h 由左往右）、mode（open 拉開｜close 拉上當結尾）、next（card 字卡｜photo 照片：用圖片工作室目前的第一張，或 img=網址｜none 透明）、fabric（kc 頻道色｜navy｜denim｜olive｜red｜cream｜lilac 或 #色碼）、acc／tape（橫條／布帶色）、pull（silver｜gold｜black 或 #色碼）、teeth（齒色）、angle（V 字角度 6–30）、card（字卡底色）、sub（小字）、size（拉鍊粗細）、speed、bg=none（等同 next=none）。',
    html: (w) => {
      const o: Record<string, string> = {};
      const lines = w.filter((s) => {
        if (!s.startsWith('@')) return true;
        s.slice(1).split(';').forEach((kv) => { const i = kv.indexOf('='); if (i > 0) o[kv.slice(0, i).trim()] = kv.slice(i + 1).trim(); });
        return false;
      });
      const json = lines.find((s) => s.trim().startsWith('{'));
      const texts = lines.filter((s) => s.trim() && !s.trim().startsWith('{') && !s.startsWith('~'));
      const extra: Record<string, number | string> = { ...ZIP_PRESET, ...o, mode: 'zipper', bg: 'transparent' };
      if (o.mode) extra.zmode = o.mode === 'close' ? 'close' : 'open';
      if (o.bg === 'none') extra.next = 'none';
      if (texts.length) extra.texts = texts[0].trim().slice(0, 12);
      for (const k of ['angle', 'speed', 'size']) if (k in o && Number.isFinite(parseFloat(o[k]))) extra[k] = parseFloat(o[k]);
      if (extra.next === 'photo' && !o.img) {
        try {
          const first = (JSON.parse(globalThis.localStorage?.getItem('ma-photoimg') || '[]') as unknown[]).find((s) => typeof s === 'string' && s);
          if (first) extra.img = String(first);
        } catch { /* 沒有圖片工作室的照片就用示意圖 */ }
      }
      const scene = json ? objSceneFromWords([json], 'estate', extra) : objSceneFromWords([], 'estate', extra);
      scene.loop = 3.2;
      scene.text.lines = [];
      return `<canvas data-scene="${esc(JSON.stringify(scene))}"></canvas>`;
    },
  },
];
