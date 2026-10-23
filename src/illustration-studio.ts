import { ILLUSTRATION as R, normalizeIllustration, type IScene, type IMode, illustrationFxId } from './illustration';
import { canvasOf, pngSequence, recordWebm, saveBlob, stamp } from './export-kit';
import { editUrl, type Preset } from './presets';
import { presetBar } from './preset-bar';
import type { ObjectStudioDeps } from './object-studio';

const dimensions: Record<IScene['ratio'],[number,number]>={'9:16':[1080,1920],'16:9':[1920,1080],'1:1':[1080,1080]};
const poster=(scene:IScene)=>(scene.mode==='shark'?9.3:5)/scene.speed;
export const initIllustrationStudio = (deps: Omit<ObjectStudioDeps,'openDrop'|'openIllustration'>) => {
  document.body.insertAdjacentHTML('beforeend',`<dialog id="illstudio" class="detail st ms ps" aria-labelledby="isTitle"><div class="d-inner">
    <header class="d-head"><div class="d-title"><span class="ma-num cb-badge">200</span><div><h2 id="isTitle" tabindex="-1" autofocus>海底世界・精修插畫</h2><p>七種海底場景 × 個別編輯面板 × 五種海景，保留插畫紋理；調整後可直接輸出或加入 Combo</p></div></div><div class="d-nav"><button class="ic" id="isClose" aria-label="關閉">✕</button></div></header>
    <div class="st-body"><div class="st-left"><div id="isStage" class="st-stage ms-stage" data-ratio="9:16"><canvas id="isCanvas"></canvas><canvas id="isSnow"></canvas><div id="isLoading" role="status">載入精修插畫…</div></div>
      <div class="d-controls"><div class="seg" id="isRatio" aria-label="比例"><button data-v="9:16">9:16 手機</button><button data-v="16:9">16:9</button><button data-v="1:1">1:1</button></div><button id="isPlay" class="btn-ghost">▶ 播放</button><label class="ms-loop">時間 <input type="range" id="isTime" min="0" max="12" step="0.02"></label><output id="isClock"></output></div>
      <div id="isPreset"></div><div class="st-out"><button id="isPng" class="ma-btn" data-export>PNG</button><button id="isWebm" class="btn-ghost" data-export>WebM 影片</button><button id="isSeq" class="btn-ghost" data-export>PNG 序列（ZIP）</button><button id="isCombo" class="btn-ghost">加入 Combo</button><button id="isLink" class="btn-ghost">複製編輯連結</button><button id="isJson" class="btn-ghost">下載設定</button><button id="isImport" class="btn-ghost">匯入設定</button><input id="isFile" type="file" accept="application/json,.json" hidden></div>
      <p id="isStatus" role="status" class="st-status" hidden></p><p class="st-note">可拖曳預覽調整主角位置。速度連動片長（4.8–20 秒）；停留巡游適合持續展示。透明背景可疊進影片，建議關閉顆粒以取得乾淨素材。WebM 透明度需由支援 alpha 的剪輯軟體讀取；PNG 序列保留透明度。</p>
    </div><div class="st-panel" id="isControls">
      <fieldset><legend>七種海底場景</legend><div class="ps-mod ps-mod-g" id="isModes"></div></fieldset>
      <fieldset id="isSpecific"><legend id="isSpecificTitle">專屬編輯</legend><div id="isSpecificFields"></div></fieldset>
      <fieldset id="isAnimalGroup"><legend>巨物造型 · 精修插畫</legend><div class="ps-mod ps-mod-g" id="isAnimals"></div><p class="ms-hint">原創海怪為幻想造型。各主角有獨立的鰭、尾或觸腕擺動。</p></fieldset>
      <fieldset><legend>構圖</legend><div id="isComposition"></div></fieldset>
      <fieldset><legend>動作</legend><div id="isMotion"></div><p class="ms-hint" id="isDuration"></p></fieldset>
      <fieldset><legend>物件顏色</legend><label class="st-row"><span>主色</span><input type="color" data-k="color" id="isColor" value="#248caa"></label><div id="isColorFields"></div><button id="isOriginal" class="btn-ghost">恢復插畫原色</button></fieldset>
      <fieldset><legend>背景 · 五種海景</legend><div class="ps-mod ps-mod-g" id="isBackgrounds"></div><label class="st-row"><span>透明背景</span><input type="checkbox" id="isTransparent"></label><div id="isEnvironment"></div></fieldset>
      <button id="isReset" class="btn-ghost">全部恢復預設</button>
    </div></div></div></dialog>`);
  const dlg=document.querySelector<HTMLDialogElement>('#illstudio')!;
  const $=<T extends HTMLElement=HTMLElement>(s:string)=>dlg.querySelector<T>(s)!;
  const canvas=$<HTMLCanvasElement>('#isCanvas'),snow=$<HTMLCanvasElement>('#isSnow'),stage=$('#isStage'),loading=$('#isLoading');
  let scene=normalizeIllustration(deps.store.get('illustration',{})),renderer:ReturnType<typeof R.createRenderer>|undefined;
  const memo=deps.store.get<Partial<Record<IMode,IScene>>>('illustration-modes',{});
  let playing=false,tView=poster(scene),raf=0,last=0,version=0,exporting=false;
  let rememberedBackground: IScene['background']=scene.background==='transparent'?'reef':scene.background;
  const time=$<HTMLInputElement>('#isTime');
  const persist=()=>{memo[scene.mode]={...scene};deps.store.set('illustration',scene);deps.store.set('illustration-modes',memo);};
  const status=(message:string)=>{$('#isStatus').hidden=!message;$('#isStatus').textContent=message;};
  const clock=()=>{time.value=String(tView);$('#isClock').textContent=`${tView.toFixed(1)} / ${scene.loop.toFixed(1)} 秒`;};
  const redraw=()=>{if(!renderer?.loaded)return;const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),dpr=Math.min(2,devicePixelRatio||1);renderer.render(tView,Math.round(w*dpr),Math.round(h*dpr));clock();};
  const stop=()=>{playing=false;cancelAnimationFrame(raf);$('#isPlay').textContent='▶ 播放';};
  async function update(){
    persist();stage.dataset.ratio=scene.ratio;time.max=String(scene.loop);clock();
    if(!renderer)return;
    const token=++version,active=renderer;
    const changing=active.scene.mode!==scene.mode||!active.loaded||active.scene.animal!==scene.animal||active.scene.background!==scene.background;
    if(changing){loading.hidden=false;loading.textContent='載入精修插畫…';}
    try { const ok=await active.update(scene);if(token!==version||active!==renderer)return;if(ok){loading.hidden=true;redraw();} }
    catch(e){if(token===version){loading.hidden=false;loading.textContent=e instanceof Error?e.message:'素材載入失敗';}}
  }
  const range=(key:keyof IScene,label:string,min:number,max:number,step:number)=>`<label class="st-row"><span>${label}</span><input type="range" data-k="${key}" min="${min}" max="${max}" step="${step}"><output data-out="${key}"></output></label>`;
  const select=(key:keyof IScene,label:string,values:[string,string][])=>`<label class="st-row"><span>${label}</span><select class="st-select" data-k="${key}">${values.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>`;
  $('#isModes').innerHTML=Object.entries(R.modes).map(([id,m])=>`<button type="button" data-mode="${id}"><b>${m.zh}</b></button>`).join('');
  let panelMode:IMode|undefined;
  function specific(){
    if(panelMode===scene.mode)return;panelMode=scene.mode;
    $('#isSpecificTitle').textContent=R.modes[scene.mode].zh+'・專屬編輯';
    $('#isSpecific').hidden=scene.mode==='whale';$('#isAnimalGroup').hidden=scene.mode!=='whale';
    $('#isSpecificFields').innerHTML=R.fields[scene.mode].map(f=>range(f.key,f.label,f.min,f.max,f.step)).join('')+(['fish','dolphins'].includes(scene.mode)?select('formation','隊形',[['wave','交錯波浪'],['line','平行隊伍'],['v','V 字隊形'],['orbit','環繞巡游']]):'')+(scene.mode==='shark'?select('exit','衝刺收尾',[['pass','擦身而過'],['cover','遮滿畫面']]):'');
    $('#isMotion [data-k="path"]')!.closest('label')!.hidden=['coral','deep','shark'].includes(scene.mode);
    $('#isMotion [data-k="motion"]')!.closest('label')!.hidden=['deep','submarine'].includes(scene.mode);
    $('#isTitle').textContent=R.modes[scene.mode].zh+'・精修插畫';
    dlg.querySelector('.cb-badge')!.textContent=String(R.modes[scene.mode].no);
  }
  $('#isModes').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-mode]');if(!b)return;const mode=b.dataset.mode as IMode;persist();bar.set();scene=normalizeIllustration(memo[mode]??{mode,ratio:scene.ratio});tView=poster(scene);sync();stop();void update();});
  $('#isAnimals').innerHTML=Object.entries(R.animals).map(([id,a])=>`<button data-animal="${id}" type="button"><b>${a.zh}</b></button>`).join('');
  $('#isBackgrounds').innerHTML=Object.entries(R.backgrounds).filter(([id])=>id!=='transparent').map(([id,b])=>`<button data-background="${id}" type="button"><b>${b.zh}</b></button>`).join('');
  $('#isComposition').innerHTML=range('size','主角大小',.4,2.2,.01)+range('x','水平位置',-.5,1.5,.01)+range('y','垂直位置',0,1,.01)+range('angle','旋轉角度',-60,60,1)+select('direction','游動方向',[['right','向右'],['left','向左']])+range('opacity','物件透明度',0,1,.01);
  $('#isMotion').innerHTML=select('path','運動路線',[['pass','由遠而近・掠過鏡頭'],['hover','停留巡游']])+range('speed','速度倍率',.6,2.5,.05)+range('motion','擺動幅度',0,1.6,.05)+range('camera','鏡頭視差',0,1.5,.05);
  $('#isColorFields').innerHTML=range('tint','換色強度',0,1,.05);
  $('#isEnvironment').innerHTML=range('brightness','背景亮度',.3,1.5,.05)+range('particles','懸浮顆粒量',0,1.5,.05)+range('current','水流速度',0,2,.05)+range('seed','顆粒排列',0,999999,1);
  function sync(){
    specific();
    dlg.querySelectorAll<HTMLElement>('[data-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.mode===scene.mode)));
    dlg.querySelectorAll<HTMLInputElement|HTMLSelectElement>('[data-k]').forEach(el=>{const v=scene[el.dataset.k as keyof IScene];el.value=String(v);const out=dlg.querySelector(`[data-out="${el.dataset.k}"]`);if(out)out.textContent=typeof v==='number'?(Number.isInteger(v)?String(v):v.toFixed(2)):String(v);});
    dlg.querySelectorAll<HTMLElement>('[data-animal]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.animal===scene.animal)));
    dlg.querySelectorAll<HTMLElement>('[data-background]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.background===scene.background)));
    $('#isRatio').querySelectorAll<HTMLElement>('button').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.v===scene.ratio)));
    $<HTMLInputElement>('#isTransparent').checked=scene.background==='transparent';
    $('#isDuration').textContent=`${scene.speed.toFixed(2)} 倍速 · 完整片長 ${scene.loop.toFixed(1)} 秒`;
    const bright=dlg.querySelector<HTMLInputElement>('[data-k="brightness"]')!;bright.disabled=scene.background==='transparent';
  }
  const change=(patch:Partial<IScene>)=>{stop();const phase=tView*scene.speed;scene=normalizeIllustration({...scene,...patch});tView=Math.min(scene.loop,phase/scene.speed);sync();void update();};
  $('#isControls').addEventListener('input',e=>{const el=e.target as HTMLInputElement|HTMLSelectElement,key=el.dataset.k as keyof IScene;if(!key)return;const value=el.type==='range'?Number(el.value):el.value;change({[key]:value,...(key==='color'?{tint:1}:{})});});
  $('#isAnimals').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-animal]');if(b)change({animal:b.dataset.animal as IScene['animal']});});
  $('#isBackgrounds').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-background]');if(b){rememberedBackground=b.dataset.background as IScene['background'];change({background:rememberedBackground});}});
  $('#isTransparent').addEventListener('change',()=>{if(scene.background!=='transparent')rememberedBackground=scene.background;change({background:$<HTMLInputElement>('#isTransparent').checked?'transparent':rememberedBackground});});
  $('#isOriginal').addEventListener('click',()=>change({tint:0}));
  $('#isReset').addEventListener('click',()=>{bar.set();load(R.normalize({mode:scene.mode,ratio:scene.ratio}));});
  $('#isRatio').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-v]');if(b)change({ratio:b.dataset.v as IScene['ratio']});});
  $('#isPlay').addEventListener('click',()=>{
    if(playing){stop();return;}if(!renderer?.loaded)return;if(tView>=scene.loop-.02)tView=0;playing=true;last=performance.now();$('#isPlay').textContent='Ⅱ 暫停';
    const tick=(now:number)=>{if(!playing)return;tView=Math.min(scene.loop,tView+(now-last)/1000);last=now;redraw();if(tView>=scene.loop){stop();return;}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
  });
  time.addEventListener('input',()=>{stop();tView=Number(time.value);redraw();});
  let drag:{id:number;px:number;py:number;x:number;y:number}|undefined;
  stage.addEventListener('pointerdown',e=>{if(!renderer?.loaded)return;stop();drag={id:e.pointerId,px:e.clientX,py:e.clientY,x:scene.x,y:scene.y};stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',e=>{if(!drag)return;const rect=canvas.getBoundingClientRect(),ratio=rect.width/rect.height,design=1080/1920,sx=ratio<design?ratio/design:1,sy=ratio>design?design/ratio:1;change({x:drag.x+(e.clientX-drag.px)/rect.width*sx,y:drag.y+(e.clientY-drag.py)/rect.height*sy});});
  const endDrag=()=>{drag=undefined;};stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
  $('#isCombo').addEventListener('click',()=>deps.addScene({effect:illustrationFxId(scene.mode),words:[JSON.stringify(scene)],seconds:scene.loop,ratio:scene.ratio}));
  $('#isLink').addEventListener('click',()=>deps.copy(editUrl(location.origin,{kind:'illustration',data:scene}),'已複製精修插畫編輯連結'));
  $('#isJson').addEventListener('click',()=>saveBlob(new Blob([JSON.stringify(scene,null,2)],{type:'application/json'}),`illustration-${stamp()}.json`));
  $('#isImport').addEventListener('click',()=>$<HTMLInputElement>('#isFile').click());
  $('#isFile').addEventListener('change',async()=>{const input=$<HTMLInputElement>('#isFile'),file=input.files?.[0];if(!file)return;try{if(file.size>100000)throw new Error('設定檔過大');const data=JSON.parse(await file.text());if(!data||typeof data!=='object'||!(Object.hasOwn(R.modes,data.mode)||Object.hasOwn(R.animals,data.animal)))throw new Error('請匯入精修插畫設定 JSON');bar.set();scene=normalizeIllustration(data);tView=poster(scene);sync();void update();deps.toast('已匯入設定');}catch(e){deps.toast(e instanceof Error?e.message:'設定檔無法讀取');}finally{input.value='';}});
  async function output(kind:'png'|'webm'|'seq'){
    if(exporting)return;stop();exporting=true;dlg.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(b=>b.disabled=true);status('準備輸出…');
    const snapshot={...scene},[w,h]=dimensions[snapshot.ratio],cv=canvasOf(w,h),sn=canvasOf(w,h);let engine:ReturnType<typeof R.createRenderer>|undefined;
    try{
      engine=R.createRenderer(cv,sn,snapshot,location.origin);await engine.ready;
      const draw=(ctx:CanvasRenderingContext2D,t:number)=>{engine!.render(t,w,h);ctx.clearRect(0,0,w,h);ctx.drawImage(cv,0,0);ctx.drawImage(sn,0,0);};
      const filename=`illustration-${snapshot.mode}-${stamp()}`;
      if(kind==='png'){const c=canvasOf(w,h);draw(c.getContext('2d')!,tView);const blob=await new Promise<Blob|null>(resolve=>c.toBlob(resolve));if(!blob)throw new Error('PNG 輸出失敗');saveBlob(blob,filename+'.png');}
      if(kind==='seq'){saveBlob(await pngSequence(w,h,snapshot.loop,draw,(i,n)=>status(`PNG 序列 ${i} / ${n} 格`)),filename+'.zip');}
      if(kind==='webm'){const recording=recordWebm(w,h,snapshot.loop,draw,p=>status(`錄製 ${Math.round(p*100)}%`));if(!recording)throw new Error('此瀏覽器不支援 WebM，請用 Chrome 或輸出 PNG 序列');saveBlob(await recording,filename+'.webm');}
      status('');deps.toast('已輸出精修插畫');
    }catch(e){status(e instanceof Error?e.message:'輸出失敗');}finally{engine?.dispose();exporting=false;dlg.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(b=>b.disabled=false);}
  }
  $('#isPng').addEventListener('click',()=>void output('png'));$('#isWebm').addEventListener('click',()=>void output('webm'));$('#isSeq').addEventListener('click',()=>void output('seq'));
  const bar=presetBar($('#isPreset'),{kind:'illustration',getData:()=>scene,onLoad:p=>load(p.data),toast:deps.toast,copy:deps.copy,store:deps.store});
  const observer=new ResizeObserver(redraw);
  function open(){
    if(!dlg.open)dlg.showModal();document.body.style.overflow='hidden';$('.st-panel').scrollTop=0;$('.st-left').scrollTop=0;stop();sync();stage.dataset.ratio=scene.ratio;time.max=String(scene.loop);clock();
    if(!renderer){try{renderer=R.createRenderer(canvas,snow,scene,location.origin);renderer.ready.catch(()=>{});}catch(e){loading.hidden=false;loading.textContent=e instanceof Error?e.message:'無法啟動動畫';return;}}
    observer.observe(stage);void update();
  }
  function load(data:unknown){scene=normalizeIllustration(data);tView=poster(scene);open();}
  dlg.addEventListener('close',()=>{stop();version++;observer.disconnect();renderer?.dispose();renderer=undefined;document.body.style.overflow='';const url=new URL(location.href);if(url.searchParams.get('view')==='illustration'||url.searchParams.has('edit')){url.searchParams.delete('view');url.searchParams.delete('edit');url.searchParams.delete('d');history.replaceState({},'',url.pathname+url.search);}});
  $('#isClose').addEventListener('click',()=>dlg.close());
  if(new URLSearchParams(location.search).get('view')==='illustration')open();
  return {openMode:(mode:IMode,ratio?:IScene['ratio'])=>{bar.set();scene=normalizeIllustration(memo[mode]??{mode});if(ratio)scene.ratio=ratio;tView=poster(scene);open();},open:()=>{bar.set();open();},load:(data:unknown)=>{bar.set();load(data);},loadPreset:(p:Pick<Preset,'id'|'name'|'data'>)=>{bar.set(p);load(p.data);}};
};
