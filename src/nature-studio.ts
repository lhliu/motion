import { NATURE as R, normalizeNature, type NScene, type NMode, natureFxId } from './nature';
import { canvasOf, pngSequence, recordWebm, saveBlob, stamp } from './export-kit';
import { editUrl, type Preset } from './presets';
import { presetBar } from './preset-bar';
import type { ObjectStudioDeps } from './object-studio';

const dimensions: Record<NScene['ratio'],[number,number]>={'9:16':[1080,1920],'16:9':[1920,1080],'1:1':[1080,1080]};
const poster=(scene:NScene)=>5/scene.speed;
type NatureDeps = Omit<ObjectStudioDeps,'openDrop'|'openIllustration'|'openTransport'>;
type NatureGroup = 'meteor'|'aerial';
const createNatureStudio = (deps: NatureDeps, group: NatureGroup) => {
  const meteor=group==='meteor',prefix=meteor?'ns':'as',dialogId=group+'studio';
  const belongs=(mode:NMode)=>meteor?mode==='meteor':mode!=='meteor';
  const initialMode:NMode=meteor?'meteor':'city';
  const title=meteor?'隕石・精修插畫':'俯瞰・精修插畫';
  const subtitle=meteor?'岩石、冰晶、熔岩、金屬四種樣式，調整自轉、漂浮與伴飛碎石':'八種俯瞰場景各有專屬編輯，調整動態物件、地景與鏡頭';
  document.body.insertAdjacentHTML('beforeend',`<dialog id="${dialogId}" class="detail st ms ps nature-studio" aria-labelledby="nsTitle"><div class="d-inner">
    <header class="d-head"><div class="d-title"><span class="ma-num cb-badge">244</span><div><h2 id="nsTitle" tabindex="-1" autofocus>${title}</h2><p id="nsDesc">${subtitle}</p></div></div><div class="d-nav"><button class="ic" id="nsClose" aria-label="關閉">✕</button></div></header>
    <div class="st-body"><div class="st-left"><div id="nsStage" class="st-stage ms-stage" data-ratio="9:16"><canvas id="nsCanvas"></canvas><canvas id="nsSnow"></canvas><div id="nsLoading" role="status">載入精修插畫…</div></div>
      <div class="d-controls"><div class="seg" id="nsRatio" aria-label="比例"><button data-v="9:16">9:16 手機</button><button data-v="16:9">16:9</button><button data-v="1:1">1:1</button></div><button id="nsPlay" class="btn-ghost">▶ 播放</button><label class="ms-loop">時間 <input type="range" id="nsTime" min="0" max="12" step="0.02"></label><output id="nsClock"></output></div>
      <div id="nsPreset"></div><div class="st-out"><button id="nsPng" class="ma-btn" data-export>PNG</button><button id="nsWebm" class="btn-ghost" data-export>WebM 影片</button><button id="nsSeq" class="btn-ghost" data-export>PNG 序列（ZIP）</button><button id="nsCombo" class="btn-ghost">加入 Combo</button><button id="nsLink" class="btn-ghost">複製編輯連結</button><button id="nsJson" class="btn-ghost">下載設定</button><button id="nsImport" class="btn-ghost">匯入設定</button><input id="nsFile" type="file" accept="application/json,.json" hidden></div>
      <p id="nsStatus" role="status" class="st-status" hidden></p><p class="st-note">可拖曳預覽調整主角位置。速度連動片長（4.8–20 秒）。${meteor?'隕石可完整去背，疊進影片。':'透明模式保留地景圖卡、卡片外透明。俯瞰均為虛構示意插畫。'}WebM 透明度需由支援 alpha 的剪輯軟體讀取；PNG 序列保留透明度。</p>
    </div><div class="st-panel" id="nsControls">
      <fieldset id="nsModesGroup" ${meteor?'hidden':''}><legend>八種俯瞰場景</legend><div class="ps-mod ps-mod-g" id="nsModes"></div></fieldset>
      <fieldset id="nsStylesGroup"><legend>隕石樣式 · 一招四種</legend><div class="ps-mod ps-mod-g" id="nsStyles"></div></fieldset>
      <fieldset id="nsSpecific"><legend id="nsSpecificTitle">專屬編輯</legend><div id="nsSpecificFields"></div></fieldset>
      <fieldset id="nsCameraGroup"><legend>俯瞰運鏡</legend><div id="nsCamera"></div></fieldset>
      <fieldset><legend>構圖</legend><div id="nsComposition"></div></fieldset>
      <fieldset><legend>動作</legend><div id="nsMotion"></div><p class="ms-hint" id="nsDuration"></p></fieldset>
      <fieldset><legend id="nsColorTitle">插畫配色</legend><label class="st-row"><span>主色</span><input type="color" data-k="color" id="nsColor" value="#248caa"></label><div id="nsColorFields"></div><button id="nsOriginal" class="btn-ghost">恢復插畫原色</button></fieldset>
      <fieldset><legend id="nsBackgroundTitle">背景 · 五種</legend><div class="ps-mod ps-mod-g" id="nsBackgrounds"></div><label class="st-row"><span>透明背景</span><input type="checkbox" id="nsTransparent"></label><div id="nsEnvironment"></div></fieldset>
      <button id="nsReset" class="btn-ghost">全部恢復預設</button>
    </div></div></div></dialog>`.replace(/\bns(?=[A-Z])/g,prefix));
  const dlg=document.getElementById(dialogId) as HTMLDialogElement;
  const $=<T extends HTMLElement=HTMLElement>(s:string)=>dlg.querySelector<T>(s.replace(/#ns(?=[A-Z])/g,'#'+prefix))!;
  const canvas=$<HTMLCanvasElement>('#nsCanvas'),snow=$<HTMLCanvasElement>('#nsSnow'),stage=$('#nsStage'),loading=$('#nsLoading');
  const legacy=normalizeNature(deps.store.get('nature',{}));
  let scene=normalizeNature(deps.store.get('nature-'+group,belongs(legacy.mode)?legacy:{mode:initialMode})),renderer:ReturnType<typeof R.createRenderer>|undefined;
  const memo=deps.store.get<Partial<Record<NMode,NScene>>>('nature-modes-'+group,Object.fromEntries(Object.entries(deps.store.get<Partial<Record<NMode,NScene>>>('nature-modes',{})).filter(([mode])=>belongs(mode as NMode))));
  memo[scene.mode]??={...scene};
  let playing=false,tView=poster(scene),raf=0,last=0,version=0,exporting=false;
  let rememberedBackground: NScene['background']=scene.background==='transparent'?(meteor?'space':'natural'):scene.background;
  const time=$<HTMLInputElement>('#nsTime');
  const persist=()=>{memo[scene.mode]={...scene};deps.store.set('nature-'+group,scene);deps.store.set('nature-modes-'+group,memo);};
  const status=(message:string)=>{$('#nsStatus').hidden=!message;$('#nsStatus').textContent=message;};
  const clock=()=>{time.value=String(tView);$('#nsClock').textContent=`${tView.toFixed(1)} / ${scene.loop.toFixed(1)} 秒`;};
  const redraw=()=>{if(!renderer?.loaded)return;const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),dpr=Math.min(2,devicePixelRatio||1);renderer.render(tView,Math.round(w*dpr),Math.round(h*dpr));clock();};
  const stop=()=>{playing=false;cancelAnimationFrame(raf);$('#nsPlay').textContent='▶ 播放';};
  async function update(){
    persist();stage.dataset.ratio=scene.ratio;time.max=String(scene.loop);clock();
    if(!renderer)return;
    const token=++version,active=renderer;
    const changing=active.scene.mode!==scene.mode||!active.loaded||active.scene.background!==scene.background||active.scene.style!==scene.style;
    if(changing){loading.hidden=false;loading.textContent='載入精修插畫…';}
    try { const ok=await active.update(scene);if(token!==version||active!==renderer)return;if(ok){loading.hidden=true;redraw();} }
    catch(e){if(token===version){loading.hidden=false;loading.textContent=e instanceof Error?e.message:'素材載入失敗';}}
  }
  const range=(key:keyof NScene,label:string,min:number,max:number,step:number)=>`<label class="st-row"><span>${label}</span><input type="range" data-k="${key}" min="${min}" max="${max}" step="${step}"><output data-out="${key}"></output></label>`;
  const select=(key:keyof NScene,label:string,values:[string,string][])=>`<label class="st-row"><span>${label}</span><select class="st-select" data-k="${key}">${values.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>`;
  $('#nsModes').innerHTML=Object.entries(R.modes).filter(([mode])=>belongs(mode as NMode)).map(([id,m])=>`<button type="button" data-mode="${id}"><b>${m.zh}</b></button>`).join('');
  let panelMode='';
  function specific(){
    const key=scene.mode+'/'+scene.style;if(panelMode===key)return;panelMode=key;const meteor=scene.mode==='meteor';
    $('#nsStylesGroup').hidden=!meteor;$('#nsCameraGroup').hidden=meteor;
    $('#nsColorTitle').textContent=meteor?'隕石配色':'地景與動態物件配色';$('#nsBackgroundTitle').textContent=meteor?'背景 · 五種':'環境光線 · 五種';
    $('#nsMotion [data-k="path"]')!.closest('label')!.hidden=!meteor;$('#nsMotion [data-k="direction"]')!.closest('label')!.hidden=!meteor;$('#nsComposition [data-k="frame"]')!.closest('label')!.hidden=meteor;
    $('#nsBackgrounds').innerHTML=Object.entries(R.environments(scene.mode)).filter(([id])=>id!=='transparent').map(([id,b])=>`<button data-background="${id}" type="button"><b>${b.zh}</b></button>`).join('');
    $('#nsSpecificTitle').textContent=R.modes[scene.mode].zh+'・專屬編輯';
    $('#nsSpecificFields').innerHTML=R.fields[scene.mode].map(f=>range(f.key,f.label,f.min,f.max,f.step)).join('')+(scene.mode==='meteor'?(scene.style==='lava'?range('heat','熱度脈動',0,1.5,.05):['ice','gold'].includes(scene.style)?range('shine','切面反光',0,1,.05):''):'');
    $('#nsTitle').textContent=R.modes[scene.mode].zh+'・精修插畫';
    $('#nsDesc').textContent=meteor?subtitle:R.modes[scene.mode].desc+'；可調運鏡與環境光線';
    dlg.querySelector('.cb-badge')!.textContent=String(R.modes[scene.mode].no);
  }
  $('#nsModes').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-mode]');if(!b)return;const mode=b.dataset.mode as NMode;persist();bar.set();scene=normalizeNature(memo[mode]??{mode,ratio:scene.ratio});tView=poster(scene);sync();stop();void update();});
  $('#nsStyles').innerHTML=Object.entries(R.styles).map(([id,m])=>`<button type="button" data-style="${id}"><b>${m.zh}</b><span>${m.desc}</span></button>`).join('');
  $('#nsComposition').innerHTML=range('size',meteor?'隕石大小':'地景大小',.4,2.2,.01)+range('x','水平位置',-.5,1.5,.01)+range('y','垂直位置',0,1,.01)+range('angle','旋轉角度',-180,180,1)+select('frame','地景構圖',[['full','滿版地景'],['card','圓角圖卡'],['circle','圓形視窗']])+range('opacity','插畫透明度',0,1,.01);
  $('#nsMotion').innerHTML=select('path','運動路線',[['pass','穿越畫面'],['hover','停留漂浮']])+select('direction','飛行方向',[['right','向右'],['left','向左']])+range('speed','速度倍率',.6,2.5,.05);
  $('#nsCamera').innerHTML=range('zoom','視野推近',1,2.6,.05)+range('pan','鏡頭平移',0,1.5,.05)+range('heading','平移方向',-180,180,1);
  $('#nsColorFields').innerHTML=range('tint','換色強度',0,1,.05);
  $('#nsEnvironment').innerHTML=range('brightness','背景亮度',.3,1.5,.05)+range('seed','細節分布種子',0,999999,1);
  function sync(){
    specific();if(scene.background!=='transparent')rememberedBackground=scene.background;dlg.querySelectorAll<HTMLElement>('[data-style]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.style===scene.style)));
    dlg.querySelectorAll<HTMLElement>('[data-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.mode===scene.mode)));
    dlg.querySelectorAll<HTMLInputElement|HTMLSelectElement>('[data-k]').forEach(el=>{const v=scene[el.dataset.k as keyof NScene];el.value=String(v);const out=dlg.querySelector(`[data-out="${el.dataset.k}"]`);if(out)out.textContent=typeof v==='number'?(Number.isInteger(v)?String(v):v.toFixed(2)):String(v);});
    dlg.querySelectorAll<HTMLElement>('[data-background]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.background===scene.background)));
    $('#nsRatio').querySelectorAll<HTMLElement>('button').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.v===scene.ratio)));
    $<HTMLInputElement>('#nsTransparent').checked=scene.background==='transparent';
    $('#nsDuration').textContent=`${scene.speed.toFixed(2)} 倍速 · 完整片長 ${scene.loop.toFixed(1)} 秒`;
    const bright=dlg.querySelector<HTMLInputElement>('[data-k="brightness"]')!;bright.disabled=scene.background==='transparent';
  }
  const change=(patch:Partial<NScene>)=>{stop();const phase=tView*scene.speed;scene=normalizeNature({...scene,...patch});tView=Math.min(scene.loop,phase/scene.speed);sync();void update();};
  $('#nsControls').addEventListener('input',e=>{const el=e.target as HTMLInputElement|HTMLSelectElement,key=el.dataset.k as keyof NScene;if(!key)return;const value=el.type==='range'?Number(el.value):el.value;change({[key]:value,...(key==='color'?{tint:1}:{})});});
  $('#nsBackgrounds').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-background]');if(b){rememberedBackground=b.dataset.background as NScene['background'];change({background:rememberedBackground});}});
  $('#nsTransparent').addEventListener('change',()=>{if(scene.background!=='transparent')rememberedBackground=scene.background;change({background:$<HTMLInputElement>('#nsTransparent').checked?'transparent':rememberedBackground});});
  $('#nsStyles').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-style]');if(b){const style=b.dataset.style as NScene['style'];change({...R.stylePresets[style],style,tint:0});}});
  $('#nsOriginal').addEventListener('click',()=>change({tint:0}));
  $('#nsReset').addEventListener('click',()=>{bar.set();load(R.normalize({mode:scene.mode,style:scene.style,ratio:scene.ratio}));});
  $('#nsRatio').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-v]');if(b)change({ratio:b.dataset.v as NScene['ratio']});});
  $('#nsPlay').addEventListener('click',()=>{
    if(playing){stop();return;}if(!renderer?.loaded)return;if(tView>=scene.loop-.02)tView=0;playing=true;last=performance.now();$('#nsPlay').textContent='Ⅱ 暫停';
    const tick=(now:number)=>{if(!playing)return;tView=Math.min(scene.loop,tView+(now-last)/1000);last=now;redraw();if(tView>=scene.loop){stop();return;}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
  });
  time.addEventListener('input',()=>{stop();tView=Number(time.value);redraw();});
  let drag:{id:number;px:number;py:number;x:number;y:number}|undefined;
  stage.addEventListener('pointerdown',e=>{if(!renderer?.loaded)return;stop();drag={id:e.pointerId,px:e.clientX,py:e.clientY,x:scene.x,y:scene.y};stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',e=>{if(!drag)return;const rect=canvas.getBoundingClientRect();change({x:drag.x+(e.clientX-drag.px)/rect.width,y:drag.y+(e.clientY-drag.py)/rect.height});});
  const endDrag=()=>{drag=undefined;};stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
  $('#nsCombo').addEventListener('click',()=>deps.addScene({effect:natureFxId(scene.mode),words:[JSON.stringify(scene)],seconds:scene.loop,ratio:scene.ratio}));
  $('#nsLink').addEventListener('click',()=>deps.copy(editUrl(location.origin,{kind:'nature',data:scene}),'已複製精修插畫編輯連結'));
  $('#nsJson').addEventListener('click',()=>saveBlob(new Blob([JSON.stringify(scene,null,2)],{type:'application/json'}),`nature-${stamp()}.json`));
  $('#nsImport').addEventListener('click',()=>$<HTMLInputElement>('#nsFile').click());
  $('#nsFile').addEventListener('change',async()=>{const input=$<HTMLInputElement>('#nsFile'),file=input.files?.[0];if(!file)return;try{if(file.size>100000)throw new Error('設定檔過大');const data=JSON.parse(await file.text());if(!data||typeof data!=='object'||!Object.hasOwn(R.modes,data.mode)||!belongs(data.mode))throw new Error(meteor?'請匯入隕石設定 JSON':'請匯入俯瞰設定 JSON');bar.set();scene=normalizeNature(data);tView=poster(scene);sync();void update();deps.toast('已匯入設定');}catch(e){deps.toast(e instanceof Error?e.message:'設定檔無法讀取');}finally{input.value='';}});
  async function output(kind:'png'|'webm'|'seq'){
    if(exporting)return;stop();exporting=true;dlg.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(b=>b.disabled=true);status('準備輸出…');
    const snapshot={...scene},[w,h]=dimensions[snapshot.ratio],cv=canvasOf(w,h),sn=canvasOf(w,h);let engine:ReturnType<typeof R.createRenderer>|undefined;
    try{
      engine=R.createRenderer(cv,sn,snapshot,location.origin);await engine.ready;
      const draw=(ctx:CanvasRenderingContext2D,t:number)=>{engine!.render(t,w,h);ctx.clearRect(0,0,w,h);ctx.drawImage(cv,0,0);ctx.drawImage(sn,0,0);};
      const filename=`nature-${snapshot.mode}-${stamp()}`;
      if(kind==='png'){const c=canvasOf(w,h);draw(c.getContext('2d')!,tView);const blob=await new Promise<Blob|null>(resolve=>c.toBlob(resolve));if(!blob)throw new Error('PNG 輸出失敗');saveBlob(blob,filename+'.png');}
      if(kind==='seq'){saveBlob(await pngSequence(w,h,snapshot.loop,draw,(i,n)=>status(`PNG 序列 ${i} / ${n} 格`)),filename+'.zip');}
      if(kind==='webm'){const recording=recordWebm(w,h,snapshot.loop,draw,p=>status(`錄製 ${Math.round(p*100)}%`));if(!recording)throw new Error('此瀏覽器不支援 WebM，請用 Chrome 或輸出 PNG 序列');saveBlob(await recording,filename+'.webm');}
      status('');deps.toast('已輸出精修插畫');
    }catch(e){status(e instanceof Error?e.message:'輸出失敗');}finally{engine?.dispose();exporting=false;dlg.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(b=>b.disabled=false);}
  }
  $('#nsPng').addEventListener('click',()=>void output('png'));$('#nsWebm').addEventListener('click',()=>void output('webm'));$('#nsSeq').addEventListener('click',()=>void output('seq'));
  const bar=presetBar($('#nsPreset'),{kind:'nature',filter:p=>typeof p.mode==='string'&&belongs(p.mode as NMode),getData:()=>scene,onLoad:p=>load(p.data),toast:deps.toast,copy:deps.copy,store:deps.store});
  const observer=new ResizeObserver(redraw);
  function open(){
    if(!dlg.open)dlg.showModal();document.body.style.overflow='hidden';$('.st-panel').scrollTop=0;$('.st-left').scrollTop=0;stop();sync();stage.dataset.ratio=scene.ratio;time.max=String(scene.loop);clock();
    if(!renderer){try{renderer=R.createRenderer(canvas,snow,scene,location.origin);renderer.ready.catch(()=>{});}catch(e){loading.hidden=false;loading.textContent=e instanceof Error?e.message:'無法啟動動畫';return;}}
    observer.observe(stage);void update();
  }
  function load(data:unknown){scene=normalizeNature(data);tView=poster(scene);open();}
  dlg.addEventListener('close',()=>{stop();version++;observer.disconnect();renderer?.dispose();renderer=undefined;document.body.style.overflow=document.querySelector('dialog[open]')?'hidden':'';const url=new URL(location.href);if(['nature',group].includes(url.searchParams.get('view')||'')||url.searchParams.has('edit')){url.searchParams.delete('view');url.searchParams.delete('edit');url.searchParams.delete('d');history.replaceState({},'',url.pathname+url.search);}});
  $('#nsClose').addEventListener('click',()=>dlg.close());
  return {close:()=>{if(dlg.open)dlg.close();},openMode:(mode:NMode,ratio?:NScene['ratio'])=>{bar.set();scene=normalizeNature(memo[mode]??{mode});if(ratio)scene.ratio=ratio;tView=poster(scene);open();},open:()=>{bar.set();open();},load:(data:unknown)=>{bar.set();load(data);},loadPreset:(p:Pick<Preset,'id'|'name'|'data'>)=>{bar.set(p);load(p.data);}};
};

/** Separate dialogs, settings and preset lists; legacy nature links route by scene mode. */
export const initNatureStudio = (deps: NatureDeps) => {
  const meteor=createNatureStudio(deps,'meteor'),aerial=createNatureStudio(deps,'aerial');
  const editor=(mode:NMode)=>{const selected=mode==='meteor'?meteor:aerial;(mode==='meteor'?aerial:meteor).close();return selected;};
  const load=(data:unknown)=>{const scene=normalizeNature(data);editor(scene.mode).load(scene);};
  const view=new URLSearchParams(location.search).get('view');
  if(view==='meteor')meteor.open();
  else if(view==='aerial')aerial.open();
  else if(view==='nature'){const scene=normalizeNature(deps.store.get('nature',{}));editor(scene.mode).open();}
  return {
    openMode:(mode:NMode,ratio?:NScene['ratio'])=>editor(mode).openMode(mode,ratio),
    open:()=>{aerial.close();meteor.open();},load,
    loadPreset:(p:Pick<Preset,'id'|'name'|'data'>)=>editor(normalizeNature(p.data).mode).loadPreset(p),
  };
};
