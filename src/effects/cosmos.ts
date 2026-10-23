import type { Fx } from '../types';
import { esc } from '../util';
import { fnSource } from '../engine';
import { cosmicEngine, cosmicFromWords, COSMOS, type CosmicMode } from '../cosmos';
export const COSMOS_GLOBALS=`globalThis.MA_COSMOS=${fnSource(cosmicEngine)}();`;
export const illustratedCosmos:Fx[]=(Object.entries(COSMOS.modes) as [CosmicMode,typeof COSMOS.modes[CosmicMode]][]).map(([mode,info])=>({
 id:info.id,no:({orbit:253,flyover:254,earthzoom:255})[mode],catalogNo:info.no,cat:'meteor',zh:info.zh+'・精修插畫',en:info.en,desc:info.desc,
 tags:['精修插畫','可疊影片','3D'],tone:'ink',sample:[],duration:12,preferredRatio:'9:16',added:'2026-10-23',
 hint:'按「編輯精修插畫」調整天體或飛越地表樣式、自轉、運鏡、大小、速度與配色；支援透明輸出。',
 motion:info.desc+'。分層精修插畫，各招有獨立編輯參數。可調整大小、速度、位置、方向、角度、配色、透明度與五種背景／環境。無文字入場，不加陰影、模糊或光暈。',
 motionEn:info.en+'. Layered refined illustrations with individually editable motion, scale, speed, position, direction, tint and five backgrounds. Transparent output supported. No typography, shadows, blur or glow.',
  css: `.S{background:transparent}.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}.S .nv-overlay{pointer-events:none}.S .nv-status{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:10%;font:500 clamp(14px,3cqw,30px)/1.6 var(--sans);color:#efe6ce;background:#05283f}.S .nv-status:empty{display:none}`,
  html: (words) => {
    const origin=typeof location!=='undefined'&&/^https?:$/.test(location.protocol)?location.origin:'https://motion.leichthub.com';
    return `<canvas class="nv-main" data-origin="${esc(origin)}" data-scene="${esc(JSON.stringify(cosmicFromWords(words,info.id)))}"></canvas><canvas class="nv-overlay"></canvas><div class="nv-status" role="status">載入精修插畫…</div>`;
  },
  globals: COSMOS_GLOBALS,
  // Serialized into standalone HTML and Combo. All dependencies are in globals.
  run: (root) => {
    const R=(globalThis as unknown as {MA_COSMOS: typeof COSMOS}).MA_COSMOS;
    const canvas=root.querySelector<HTMLCanvasElement>('.nv-main')!;
    const snow=root.querySelector<HTMLCanvasElement>('.nv-overlay')!;
    const status=root.querySelector<HTMLElement>('.nv-status')!;
    let renderer: ReturnType<typeof R.createRenderer>;
    try{renderer=R.createRenderer(canvas,snow,JSON.parse(canvas.dataset.scene||'{}'),canvas.dataset.origin||'https://motion.leichthub.com',{lite:canvas.clientWidth*canvas.clientHeight*Math.min(4,(devicePixelRatio||1)**2)<=1e6});}
    catch(e){status.textContent=e instanceof Error?e.message:'無法載入動畫';return;}
    const host=root as HTMLElement & {motionReady?: Promise<boolean>;motionSeek?:(t:number)=>void};
    let disposed=false,ready=false,elapsed=0,previous=performance.now(),raf=0,seek:number|undefined,last=-1;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const draw=()=>{
      const time=seek??(reduced.matches||Number(root.dataset.motionSpeed??1)===0&&elapsed===0?5/renderer.scene.speed:elapsed%renderer.scene.loop);
      if(time!==last&&ready){renderer.render(time);last=time;}
    };
    const resize=()=>{const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),dpr=Math.min(2,devicePixelRatio||1,Math.sqrt(1080*1920/(w*h)));canvas.width=snow.width=Math.round(w*dpr);canvas.height=snow.height=Math.round(h*dpr);last=-1;draw();};
    const observer=new ResizeObserver(resize);observer.observe(canvas);
    host.motionSeek=(time)=>{seek=Math.max(0,Math.min(renderer.scene.loop,Number(time)||0));draw();};
    host.motionReady=renderer.ready.then(ok=>{if(disposed)return false;ready=ok;status.textContent='';previous=performance.now();resize();return ok;}).catch(e=>{if(!disposed)status.textContent=e instanceof Error?e.message:'插畫素材載入失敗';return false;});
    const tick=(now:number)=>{if(disposed)return;const speed=Number(root.dataset.motionSpeed??1);if(ready&&!reduced.matches&&Number.isFinite(speed))elapsed+=Math.max(0,now-previous)/1000*Math.max(0,speed);previous=now;draw();raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
    return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();renderer.dispose();delete host.motionSeek;delete host.motionReady;};
  },
}));
