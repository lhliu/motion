import type { Fx } from '../types';
import { esc } from '../util';
import { fnSource } from '../engine';
import { illustrationEngine, illustrationFromWords, type ILLUSTRATION } from '../illustration';

export const ILLUSTRATION_GLOBALS = `globalThis.MA_ILLUSTRATION=${fnSource(illustrationEngine)}();`;

/** #200 keeps its original id; vector ocean effects remain independent. */
export const illustratedWhale: Fx = {
  id: 'whale-illustrated', no: 200, cat: 'illustration',
  zh: '海洋巨物・精修插畫', en: 'Illustrated Ocean Giants',
  desc: '座頭鯨、抹香鯨、大白鯊、巨大烏賊與原創海怪，搭配五種海景；可編輯大小、動作與配色',
  tags: ['精修插畫','海底','可疊影片','療癒'], tone: 'ink', sample: [], duration: 12, preferredRatio: '9:16', added: '2026-10-23',
  hint: '按「編輯精修插畫」更換主角、五種背景、大小、速度與配色；可透明輸出。預設 12 秒，慢速會連動延長片長。',
  motion: '精修插畫以 2.5D 紋理形變呈現主角由遠而近、放大掠過鏡頭，或停留巡游。五種主角各有尾鰭、胸鰭、觸腕或蛇行擺動；五種海景搭配視差與可調懸浮顆粒。可改大小、速度、位置、方向、角度、顏色、透明度與透明背景。換色保留紋理、明暗與淺色腹部；原創海怪為幻想插畫。無文字入場，不加陰影、模糊或光暈。',
  motionEn: 'Detailed 2.5D illustrated ocean giants pass the camera or hover, with species-specific tail, fin, tentacle or serpentine deformation. Five subjects, five seascapes, adjustable scale, speed, position, direction, angle, texture-preserving tint, opacity, parallax and marine snow. Transparent backgrounds supported. The sea monster is fictional. No text entrance, shadows, blur or glow.',
  css: `.S{background:transparent}.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block}.S .iw-snow{pointer-events:none}.S .iw-status{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:10%;font:500 clamp(14px,3cqw,30px)/1.6 var(--sans);color:#efe6ce;background:#05283f}.S .iw-status:empty{display:none}`,
  html: (words) => {
    const origin=typeof location!=='undefined'&&/^https?:$/.test(location.protocol)?location.origin:'https://motion.leichthub.com';
    return `<canvas class="iw-ocean" data-origin="${esc(origin)}" data-scene="${esc(JSON.stringify(illustrationFromWords(words)))}"></canvas><canvas class="iw-snow"></canvas><div class="iw-status" role="status">載入精修插畫…</div>`;
  },
  globals: ILLUSTRATION_GLOBALS,
  // Serialized into standalone HTML and Combo. All dependencies are in globals.
  run: (root) => {
    const R=(globalThis as unknown as {MA_ILLUSTRATION: typeof ILLUSTRATION}).MA_ILLUSTRATION;
    const canvas=root.querySelector<HTMLCanvasElement>('.iw-ocean')!;
    const snow=root.querySelector<HTMLCanvasElement>('.iw-snow')!;
    const status=root.querySelector<HTMLElement>('.iw-status')!;
    let renderer: ReturnType<typeof R.createRenderer>;
    try{renderer=R.createRenderer(canvas,snow,JSON.parse(canvas.dataset.scene||'{}'),canvas.dataset.origin||'https://motion.leichthub.com');}
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
};
