import { TRANSPORT as R, normalizeTransport, type TScene, type TMode, transportFxId } from './transport';
import { canvasOf, pngSequence, recordWebm, saveBlob, stamp } from './export-kit';
import { editUrl, type Preset } from './presets';
import { presetBar } from './preset-bar';
import type { ObjectStudioDeps } from './object-studio';

const dimensions: Record<TScene['ratio'],[number,number]>={'9:16':[1080,1920],'16:9':[1920,1080],'1:1':[1080,1080]};
const poster=(scene:TScene)=>5/scene.speed;
export const initTransportStudio = (deps: Omit<ObjectStudioDeps,'openDrop'|'openIllustration'|'openTransport'>) => {
  document.body.insertAdjacentHTML('beforeend',`<dialog id="transportstudio" class="detail st ms ps" aria-labelledby="tsTitle"><div class="d-inner">
    <header class="d-head"><div class="d-title"><span class="ma-num cb-badge">237</span><div><h2 id="tsTitle" tabindex="-1" autofocus>交通工具・精修插畫</h2><p>專屬編輯面板 × 五種背景，保留插畫紋理；調整後可直接輸出或加入 Combo</p></div></div><div class="d-nav"><button class="ic" id="tsClose" aria-label="關閉">✕</button></div></header>
    <div class="st-body"><div class="st-left"><div id="tsStage" class="st-stage ms-stage" data-ratio="9:16"><canvas id="tsCanvas"></canvas><canvas id="tsSnow"></canvas><div id="tsLoading" role="status">載入精修插畫…</div></div>
      <div class="d-controls"><div class="seg" id="tsRatio" aria-label="比例"><button data-v="9:16">9:16 手機</button><button data-v="16:9">16:9</button><button data-v="1:1">1:1</button></div><button id="tsPlay" class="btn-ghost">▶ 播放</button><label class="ms-loop">時間 <input type="range" id="tsTime" min="0" max="12" step="0.02"></label><output id="tsClock"></output></div>
      <div id="tsPreset"></div><div class="st-out"><button id="tsPng" class="ma-btn" data-export>PNG</button><button id="tsWebm" class="btn-ghost" data-export>WebM 影片</button><button id="tsSeq" class="btn-ghost" data-export>PNG 序列（ZIP）</button><button id="tsCombo" class="btn-ghost">加入 Combo</button><button id="tsLink" class="btn-ghost">複製編輯連結</button><button id="tsJson" class="btn-ghost">下載設定</button><button id="tsImport" class="btn-ghost">匯入設定</button><input id="tsFile" type="file" accept="application/json,.json" hidden></div>
      <p id="tsStatus" role="status" class="st-status" hidden></p><p class="st-note">可拖曳預覽調整主角位置。速度連動片長（4.8–20 秒）；停留展示適合持續展示。透明背景可疊進影片，透明時隱藏道路與軌道；可個別關閉雲、尾焰、煙或船尾浪。WebM 透明度需由支援 alpha 的剪輯軟體讀取；PNG 序列保留透明度。</p>
    </div><div class="st-panel" id="tsControls">
      <fieldset hidden><legend>交通工具</legend><div class="ps-mod ps-mod-g" id="tsModes"></div></fieldset>
      <fieldset id="tsSpecific"><legend id="tsSpecificTitle">專屬編輯</legend><div id="tsSpecificFields"></div></fieldset>
      <fieldset><legend>構圖</legend><div id="tsComposition"></div></fieldset>
      <fieldset><legend>動作</legend><div id="tsMotion"></div><p class="ms-hint" id="tsDuration"></p></fieldset>
      <fieldset><legend>物件顏色</legend><label class="st-row"><span>主色</span><input type="color" data-k="color" id="tsColor" value="#248caa"></label><div id="tsColorFields"></div><button id="tsOriginal" class="btn-ghost">恢復插畫原色</button></fieldset>
      <fieldset><legend>背景 · 五種背景</legend><div class="ps-mod ps-mod-g" id="tsBackgrounds"></div><label class="st-row"><span>透明背景</span><input type="checkbox" id="tsTransparent"></label><div id="tsEnvironment"></div></fieldset>
      <button id="tsReset" class="btn-ghost">全部恢復預設</button>
    </div></div></div></dialog>`);
  const dlg=document.querySelector<HTMLDialogElement>('#transportstudio')!;
  const $=<T extends HTMLElement=HTMLElement>(s:string)=>dlg.querySelector<T>(s)!;
  const canvas=$<HTMLCanvasElement>('#tsCanvas'),snow=$<HTMLCanvasElement>('#tsSnow'),stage=$('#tsStage'),loading=$('#tsLoading');
  let scene=normalizeTransport(deps.store.get('transport',{})),renderer:ReturnType<typeof R.createRenderer>|undefined;
  const memo=deps.store.get<Partial<Record<TMode,TScene>>>('transport-modes',{});
  let playing=false,tView=poster(scene),raf=0,last=0,version=0,exporting=false;
  let rememberedBackground: TScene['background']=scene.background==='transparent'?'city':scene.background;
  const time=$<HTMLInputElement>('#tsTime');
  const persist=()=>{memo[scene.mode]={...scene};deps.store.set('transport',scene);deps.store.set('transport-modes',memo);};
  const status=(message:string)=>{$('#tsStatus').hidden=!message;$('#tsStatus').textContent=message;};
  const clock=()=>{time.value=String(tView);$('#tsClock').textContent=`${tView.toFixed(1)} / ${scene.loop.toFixed(1)} 秒`;};
  const redraw=()=>{if(!renderer?.loaded)return;const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),dpr=Math.min(2,devicePixelRatio||1);renderer.render(tView,Math.round(w*dpr),Math.round(h*dpr));clock();};
  const stop=()=>{playing=false;cancelAnimationFrame(raf);$('#tsPlay').textContent='▶ 播放';};
  async function update(){
    persist();stage.dataset.ratio=scene.ratio;time.max=String(scene.loop);clock();
    if(!renderer)return;
    const token=++version,active=renderer;
    const changing=active.scene.mode!==scene.mode||!active.loaded||active.scene.background!==scene.background;
    if(changing){loading.hidden=false;loading.textContent='載入精修插畫…';}
    try { const ok=await active.update(scene);if(token!==version||active!==renderer)return;if(ok){loading.hidden=true;redraw();} }
    catch(e){if(token===version){loading.hidden=false;loading.textContent=e instanceof Error?e.message:'素材載入失敗';}}
  }
  const range=(key:keyof TScene,label:string,min:number,max:number,step:number)=>`<label class="st-row"><span>${label}</span><input type="range" data-k="${key}" min="${min}" max="${max}" step="${step}"><output data-out="${key}"></output></label>`;
  const select=(key:keyof TScene,label:string,values:[string,string][])=>`<label class="st-row"><span>${label}</span><select class="st-select" data-k="${key}">${values.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>`;
  // 已從圖鑑隱藏的模式不放進選單；舊 Combo、預設載入時仍可編輯
  const HIDDEN_MODES:string[]=['car','carriage','train'];
  $('#tsModes').innerHTML=Object.entries(R.modes).filter(([id])=>!HIDDEN_MODES.includes(id)).map(([id,m])=>`<button type="button" data-mode="${id}"><b>${m.zh}</b></button>`).join('');
  let panelMode:TMode|undefined;
  function specific(){
    if(panelMode===scene.mode)return;panelMode=scene.mode;
    $('#tsSpecificTitle').textContent=R.modes[scene.mode].zh+'・專屬編輯';
    $('#tsSpecificFields').innerHTML=R.fields[scene.mode].map(f=>range(f.key,f.label,f.min,f.max,f.step)).join('');
    $('#tsTitle').textContent=R.modes[scene.mode].zh+'・精修插畫';
    dlg.querySelector('.cb-badge')!.textContent=String(R.modes[scene.mode].no);
  }
  $('#tsModes').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-mode]');if(!b)return;const mode=b.dataset.mode as TMode;persist();bar.set();scene=normalizeTransport(memo[mode]??{mode,ratio:scene.ratio});tView=poster(scene);sync();stop();void update();});
  $('#tsBackgrounds').innerHTML=Object.entries(R.backgrounds).filter(([id])=>id!=='transparent').map(([id,b])=>`<button data-background="${id}" type="button"><b>${b.zh}</b></button>`).join('');
  $('#tsComposition').innerHTML=range('size','主角大小',.4,2.2,.01)+range('x','水平位置',-.5,1.5,.01)+range('y','垂直位置',0,1,.01)+range('angle','旋轉角度',-60,60,1)+select('direction','行進方向',[['right','向右'],['left','向左']])+range('opacity','物件透明度',0,1,.01);
  $('#tsMotion').innerHTML=select('path','運動路線',[['pass','橫越畫面'],['cruise','停留展示']])+range('speed','速度倍率',.6,2.5,.05)+range('camera','鏡頭視差',0,1.5,.05);
  $('#tsColorFields').innerHTML=range('tint','換色強度',0,1,.05);
  $('#tsEnvironment').innerHTML=range('brightness','背景亮度',.3,1.5,.05)+range('seed','煙／雲／火星分布',0,999999,1);
  function sync(){
    specific();
    dlg.querySelectorAll<HTMLElement>('[data-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.mode===scene.mode)));
    dlg.querySelectorAll<HTMLInputElement|HTMLSelectElement>('[data-k]').forEach(el=>{const v=scene[el.dataset.k as keyof TScene];el.value=String(v);const out=dlg.querySelector(`[data-out="${el.dataset.k}"]`);if(out)out.textContent=typeof v==='number'?(Number.isInteger(v)?String(v):v.toFixed(2)):String(v);});
    dlg.querySelectorAll<HTMLElement>('[data-background]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.background===scene.background)));
    $('#tsRatio').querySelectorAll<HTMLElement>('button').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.v===scene.ratio)));
    $<HTMLInputElement>('#tsTransparent').checked=scene.background==='transparent';
    $('#tsDuration').textContent=`${scene.speed.toFixed(2)} 倍速 · 完整片長 ${scene.loop.toFixed(1)} 秒`;
    const bright=dlg.querySelector<HTMLInputElement>('[data-k="brightness"]')!;bright.disabled=scene.background==='transparent';
  }
  const change=(patch:Partial<TScene>)=>{stop();const phase=tView*scene.speed;scene=normalizeTransport({...scene,...patch});tView=Math.min(scene.loop,phase/scene.speed);sync();void update();};
  $('#tsControls').addEventListener('input',e=>{const el=e.target as HTMLInputElement|HTMLSelectElement,key=el.dataset.k as keyof TScene;if(!key)return;const value=el.type==='range'?Number(el.value):el.value;change({[key]:value,...(key==='color'?{tint:1}:{})});});
  $('#tsBackgrounds').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-background]');if(b){rememberedBackground=b.dataset.background as TScene['background'];change({background:rememberedBackground});}});
  $('#tsTransparent').addEventListener('change',()=>{if(scene.background!=='transparent')rememberedBackground=scene.background;change({background:$<HTMLInputElement>('#tsTransparent').checked?'transparent':rememberedBackground});});
  $('#tsOriginal').addEventListener('click',()=>change({tint:0}));
  $('#tsReset').addEventListener('click',()=>{bar.set();load(R.normalize({mode:scene.mode,ratio:scene.ratio}));});
  $('#tsRatio').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-v]');if(b)change({ratio:b.dataset.v as TScene['ratio']});});
  $('#tsPlay').addEventListener('click',()=>{
    if(playing){stop();return;}if(!renderer?.loaded)return;if(tView>=scene.loop-.02)tView=0;playing=true;last=performance.now();$('#tsPlay').textContent='Ⅱ 暫停';
    const tick=(now:number)=>{if(!playing)return;tView=Math.min(scene.loop,tView+(now-last)/1000);last=now;redraw();if(tView>=scene.loop){stop();return;}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
  });
  time.addEventListener('input',()=>{stop();tView=Number(time.value);redraw();});
  let drag:{id:number;px:number;py:number;x:number;y:number}|undefined;
  stage.addEventListener('pointerdown',e=>{if(!renderer?.loaded)return;stop();drag={id:e.pointerId,px:e.clientX,py:e.clientY,x:scene.x,y:scene.y};stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',e=>{if(!drag)return;const rect=canvas.getBoundingClientRect();change({x:drag.x+(e.clientX-drag.px)/rect.width,y:drag.y+(e.clientY-drag.py)/rect.height});});
  const endDrag=()=>{drag=undefined;};stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
  $('#tsCombo').addEventListener('click',()=>deps.addScene({effect:transportFxId(scene.mode),words:[JSON.stringify(scene)],seconds:scene.loop,ratio:scene.ratio}));
  $('#tsLink').addEventListener('click',()=>deps.copy(editUrl(location.origin,{kind:'transport',data:scene}),'已複製精修插畫編輯連結'));
  $('#tsJson').addEventListener('click',()=>saveBlob(new Blob([JSON.stringify(scene,null,2)],{type:'application/json'}),`transport-${stamp()}.json`));
  $('#tsImport').addEventListener('click',()=>$<HTMLInputElement>('#tsFile').click());
  $('#tsFile').addEventListener('change',async()=>{const input=$<HTMLInputElement>('#tsFile'),file=input.files?.[0];if(!file)return;try{if(file.size>100000)throw new Error('設定檔過大');const data=JSON.parse(await file.text());if(!data||typeof data!=='object'||!Object.hasOwn(R.modes,data.mode))throw new Error('請匯入精修插畫設定 JSON');bar.set();scene=normalizeTransport(data);tView=poster(scene);sync();void update();deps.toast('已匯入設定');}catch(e){deps.toast(e instanceof Error?e.message:'設定檔無法讀取');}finally{input.value='';}});
  async function output(kind:'png'|'webm'|'seq'){
    if(exporting)return;stop();exporting=true;dlg.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(b=>b.disabled=true);status('準備輸出…');
    const snapshot={...scene},[w,h]=dimensions[snapshot.ratio],cv=canvasOf(w,h),sn=canvasOf(w,h);let engine:ReturnType<typeof R.createRenderer>|undefined;
    try{
      engine=R.createRenderer(cv,sn,snapshot,location.origin);await engine.ready;
      const draw=(ctx:CanvasRenderingContext2D,t:number)=>{engine!.render(t,w,h);ctx.clearRect(0,0,w,h);ctx.drawImage(cv,0,0);ctx.drawImage(sn,0,0);};
      const filename=`transport-${snapshot.mode}-${stamp()}`;
      if(kind==='png'){const c=canvasOf(w,h);draw(c.getContext('2d')!,tView);const blob=await new Promise<Blob|null>(resolve=>c.toBlob(resolve));if(!blob)throw new Error('PNG 輸出失敗');saveBlob(blob,filename+'.png');}
      if(kind==='seq'){saveBlob(await pngSequence(w,h,snapshot.loop,draw,(i,n)=>status(`PNG 序列 ${i} / ${n} 格`)),filename+'.zip');}
      if(kind==='webm'){const recording=recordWebm(w,h,snapshot.loop,draw,p=>status(`錄製 ${Math.round(p*100)}%`));if(!recording)throw new Error('此瀏覽器不支援 WebM，請用 Chrome 或輸出 PNG 序列');saveBlob(await recording,filename+'.webm');}
      status('');deps.toast('已輸出精修插畫');
    }catch(e){status(e instanceof Error?e.message:'輸出失敗');}finally{engine?.dispose();exporting=false;dlg.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(b=>b.disabled=false);}
  }
  $('#tsPng').addEventListener('click',()=>void output('png'));$('#tsWebm').addEventListener('click',()=>void output('webm'));$('#tsSeq').addEventListener('click',()=>void output('seq'));
  const bar=presetBar($('#tsPreset'),{kind:'transport',getData:()=>scene,onLoad:p=>load(p.data),toast:deps.toast,copy:deps.copy,store:deps.store});
  const observer=new ResizeObserver(redraw);
  function open(){
    if(!dlg.open)dlg.showModal();document.body.style.overflow='hidden';$('.st-panel').scrollTop=0;$('.st-left').scrollTop=0;stop();sync();stage.dataset.ratio=scene.ratio;time.max=String(scene.loop);clock();
    if(!renderer){try{renderer=R.createRenderer(canvas,snow,scene,location.origin);renderer.ready.catch(()=>{});}catch(e){loading.hidden=false;loading.textContent=e instanceof Error?e.message:'無法啟動動畫';return;}}
    observer.observe(stage);void update();
  }
  function load(data:unknown){scene=normalizeTransport(data);tView=poster(scene);open();}
  dlg.addEventListener('close',()=>{stop();version++;observer.disconnect();renderer?.dispose();renderer=undefined;document.body.style.overflow='';const url=new URL(location.href);if(url.searchParams.get('view')==='transport'||url.searchParams.has('edit')){url.searchParams.delete('view');url.searchParams.delete('edit');url.searchParams.delete('d');history.replaceState({},'',url.pathname+url.search);}});
  $('#tsClose').addEventListener('click',()=>dlg.close());
  if(new URLSearchParams(location.search).get('view')==='transport')open();
  return {openMode:(mode:TMode,ratio?:TScene['ratio'])=>{bar.set();scene=normalizeTransport(memo[mode]??{mode});if(ratio)scene.ratio=ratio;tView=poster(scene);open();},open:()=>{bar.set();if(HIDDEN_MODES.includes(scene.mode)){scene=normalizeTransport(memo.plane??{mode:'plane',ratio:scene.ratio});tView=poster(scene);}open();},load:(data:unknown)=>{bar.set();load(data);},loadPreset:(p:Pick<Preset,'id'|'name'|'data'>)=>{bar.set(p);load(p.data);}};
};
