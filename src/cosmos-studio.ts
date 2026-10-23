import { COSMOS as R, normalizeCosmos, type CosmicScene, type CosmicMode, cosmicFxId } from './cosmos';
import { canvasOf, pngSequence, recordWebm, saveBlob, stamp } from './export-kit';
import { editUrl, type Preset } from './presets';
import { presetBar } from './preset-bar';
import type { ObjectStudioDeps } from './object-studio';

const dimensions: Record<CosmicScene['ratio'],[number,number]>={'9:16':[1080,1920],'16:9':[1920,1080],'1:1':[1080,1080]};
const poster=(scene:CosmicScene)=>5/scene.speed;
type CosmicDeps = Omit<ObjectStudioDeps,'openDrop'|'openIllustration'|'openTransport'>;
const createCosmicStudio = (deps: CosmicDeps, mode: CosmicMode) => {
  const prefix={orbit:'cs',flyover:'fs',earthzoom:'ez'}[mode],dialogId='cosmic-'+mode+'-studio';
  const title=R.modes[mode].zh+'・精修插畫',subtitle=R.modes[mode].desc;
  document.body.insertAdjacentHTML('beforeend',`<dialog id="${dialogId}" class="detail st ms ps cosmic-studio" aria-labelledby="nsTitle"><div class="d-inner">
    <header class="d-head"><div class="d-title"><span class="ma-num cb-badge">${R.modes[mode].no}</span><div><h2 id="nsTitle" tabindex="-1" autofocus>${title}</h2><p id="nsDesc">${subtitle}</p></div></div><div class="d-nav"><button class="ic" id="nsClose" aria-label="關閉">✕</button></div></header>
    <div class="st-body"><div class="st-left"><div id="nsStage" class="st-stage ms-stage" data-ratio="9:16"><canvas id="nsCanvas"></canvas><canvas id="nsSnow"></canvas><div id="nsLoading" role="status">載入精修插畫…</div></div>
      <div class="d-controls"><div class="seg" id="nsRatio" aria-label="比例"><button data-v="9:16">9:16 手機</button><button data-v="16:9">16:9</button><button data-v="1:1">1:1</button></div><button id="nsPlay" class="btn-ghost">▶ 播放</button><label class="ms-loop">時間 <input type="range" id="nsTime" min="0" max="12" step="0.02"></label><output id="nsClock"></output></div>
      <div id="nsPreset"></div><div class="st-out"><button id="nsPng" class="ma-btn" data-export>PNG</button><button id="nsWebm" class="btn-ghost" data-export>WebM 影片</button><button id="nsSeq" class="btn-ghost" data-export>PNG 序列（ZIP）</button><button id="nsCombo" class="btn-ghost">加入 Combo</button><button id="nsLink" class="btn-ghost">複製編輯連結</button><button id="nsJson" class="btn-ghost">下載設定</button><button id="nsImport" class="btn-ghost">匯入設定</button><input id="nsFile" type="file" accept="application/json,.json" hidden></div>
      <p id="nsStatus" role="status" class="st-status" hidden></p><p class="st-note">可拖曳預覽調整主角位置。速度連動片長（4.8–20 秒）。${mode==='flyover'?'透明模式保留地表、天空透明。地表為示意插畫；太陽飛越為視覺想像。':'透明模式可將天體完整去背，疊進影片。'}WebM 透明度需由支援 alpha 的剪輯軟體讀取；PNG 序列保留透明度。</p>
    </div><div class="st-panel" id="nsControls">
      <fieldset id="nsStylesGroup" ${mode==='earthzoom'?'hidden':''}><legend>${mode==='flyover'?'飛越地表 · 一招四種':'天體樣式 · 一招四種'}</legend><div class="ps-mod ps-mod-g" id="nsStyles"></div></fieldset>
      <fieldset id="nsSpecific"><legend id="nsSpecificTitle">專屬編輯</legend><div id="nsSpecificFields"></div></fieldset>
      <fieldset><legend>構圖</legend><div id="nsComposition"></div></fieldset>
      <fieldset><legend>動作</legend><div id="nsMotion"></div><p class="ms-hint" id="nsDuration"></p></fieldset>
      <fieldset><legend id="nsColorTitle">插畫配色</legend><label class="st-row"><span>主色</span><input type="color" data-k="color" id="nsColor" value="#248caa"></label><div id="nsColorFields"></div><button id="nsOriginal" class="btn-ghost">恢復插畫原色</button></fieldset>
      <fieldset><legend id="nsBackgroundTitle">背景 · 五種</legend><div class="ps-mod ps-mod-g" id="nsBackgrounds"></div><label class="st-row"><span>透明背景</span><input type="checkbox" id="nsTransparent"></label><div id="nsEnvironment"></div></fieldset>
      <button id="nsReset" class="btn-ghost">全部恢復預設</button>
    </div></div></div></dialog>`.replace(/\bns(?=[A-Z])/g,prefix));
  const dlg=document.getElementById(dialogId) as HTMLDialogElement;
  const $=<T extends HTMLElement=HTMLElement>(s:string)=>dlg.querySelector<T>(s.replace(/#ns(?=[A-Z])/g,'#'+prefix))!;
  const canvas=$<HTMLCanvasElement>('#nsCanvas'),snow=$<HTMLCanvasElement>('#nsSnow'),stage=$('#nsStage'),loading=$('#nsLoading');
  let scene=normalizeCosmos(deps.store.get('cosmic-'+mode,{mode})),renderer:ReturnType<typeof R.createRenderer>|undefined;
  const memo=deps.store.get<Partial<Record<CosmicScene['body'],CosmicScene>>>('cosmic-variants-'+mode,{});
  memo[scene.body]??={...scene};
  let playing=false,tView=poster(scene),raf=0,last=0,version=0,exporting=false;
  let rememberedBackground: CosmicScene['background']=scene.background==='transparent'?'space':scene.background;
  const time=$<HTMLInputElement>('#nsTime');
  const persist=()=>{memo[scene.body]={...scene};deps.store.set('cosmic-'+mode,scene);deps.store.set('cosmic-variants-'+mode,memo);};
  const status=(message:string)=>{$('#nsStatus').hidden=!message;$('#nsStatus').textContent=message;};
  const clock=()=>{time.value=String(tView);$('#nsClock').textContent=`${tView.toFixed(1)} / ${scene.loop.toFixed(1)} 秒`;};
  const redraw=()=>{if(!renderer?.loaded)return;const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),dpr=Math.min(2,devicePixelRatio||1);renderer.render(tView,Math.round(w*dpr),Math.round(h*dpr));clock();};
  const stop=()=>{playing=false;cancelAnimationFrame(raf);$('#nsPlay').textContent='▶ 播放';};
  async function update(){
    persist();stage.dataset.ratio=scene.ratio;time.max=String(scene.loop);clock();
    if(!renderer)return;
    const token=++version,active=renderer;
    const changing=active.scene.mode!==scene.mode||!active.loaded||active.scene.background!==scene.background||active.scene.body!==scene.body;
    if(changing){loading.hidden=false;loading.textContent='載入精修插畫…';}
    try { const ok=await active.update(scene);if(token!==version||active!==renderer)return;if(ok){loading.hidden=true;redraw();} }
    catch(e){if(token===version){loading.hidden=false;loading.textContent=e instanceof Error?e.message:'素材載入失敗';}}
  }
  const range=(key:keyof CosmicScene,label:string,min:number,max:number,step:number)=>`<label class="st-row"><span>${label}</span><input type="range" data-k="${key}" min="${min}" max="${max}" step="${step}"><output data-out="${key}"></output></label>`;
  const select=(key:keyof CosmicScene,label:string,values:[string,string][])=>`<label class="st-row"><span>${label}</span><select class="st-select" data-k="${key}">${values.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>`;
  let panelBody='';
  function specific(){
    if(panelBody===scene.body)return;panelBody=scene.body;
    $('#nsSpecificTitle').textContent=R.bodies[scene.body].zh+'・專屬編輯';
    $('#nsSpecificFields').innerHTML=R.fieldsFor(scene).map(f=>range(f.key,f.label,f.min,f.max,f.step)).join('');
    $('#nsTitle').textContent=title;
    $('#nsDesc').textContent=subtitle;
  }
  $('#nsStyles').innerHTML=R.variants(mode).map(id=>`<button type="button" data-body="${id}"><b>${R.bodies[id].zh}</b><span>${R.bodies[id].desc}</span></button>`).join('');
  $('#nsComposition').innerHTML=range('size',mode==='flyover'?'地表大小':'天體大小',.35,2,.01)+range('x',mode==='flyover'?'航線偏移':'水平位置',-.5,1.5,.01)+range('y',mode==='flyover'?'地表起點':'垂直位置',0,1,.01)+(mode==='flyover'?'':range('angle','構圖旋轉',-180,180,1))+range('opacity','插畫透明度',0,1,.01);
  $('#nsMotion').innerHTML=(mode==='earthzoom'?select('zoomDirection','運鏡方向',[['in','推近地球'],['out','拉遠地球']]):'')+range('speed','速度倍率',.6,2.5,.05);
  $('#nsBackgrounds').innerHTML=Object.entries(R.backgrounds).filter(([id])=>id!=='transparent').map(([id,b])=>`<button data-background="${id}" type="button"><b>${b.zh}</b></button>`).join('');
  $('#nsColorFields').innerHTML=range('tint','換色強度',0,1,.05);
  $('#nsEnvironment').innerHTML=range('brightness','背景亮度',.3,1.5,.05)+range('stars','額外星點',0,2,.05)+range('seed','細節分布種子',0,999999,1);
  function sync(){
    specific();if(scene.background!=='transparent')rememberedBackground=scene.background;dlg.querySelectorAll<HTMLElement>('[data-body]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.body===scene.body)));
    dlg.querySelectorAll<HTMLInputElement|HTMLSelectElement>('[data-k]').forEach(el=>{const v=scene[el.dataset.k as keyof CosmicScene];el.value=String(v);const out=dlg.querySelector(`[data-out="${el.dataset.k}"]`);if(out)out.textContent=typeof v==='number'?(Number.isInteger(v)?String(v):v.toFixed(2)):String(v);});
    dlg.querySelectorAll<HTMLElement>('[data-background]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.background===scene.background)));
    $('#nsRatio').querySelectorAll<HTMLElement>('button').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.v===scene.ratio)));
    $<HTMLInputElement>('#nsTransparent').checked=scene.background==='transparent';
    $('#nsDuration').textContent=`${scene.speed.toFixed(2)} 倍速 · 完整片長 ${scene.loop.toFixed(1)} 秒`;
    const bright=dlg.querySelector<HTMLInputElement>('[data-k="brightness"]')!;bright.disabled=scene.background==='transparent';
  }
  const change=(patch:Partial<CosmicScene>)=>{stop();const phase=tView*scene.speed;scene=normalizeCosmos({...scene,...patch});tView=Math.min(scene.loop,phase/scene.speed);sync();void update();};
  $('#nsControls').addEventListener('input',e=>{const el=e.target as HTMLInputElement|HTMLSelectElement,key=el.dataset.k as keyof CosmicScene;if(!key)return;const value=el.type==='range'?Number(el.value):el.value;change({[key]:value,...(key==='color'?{tint:1}:{})});});
  $('#nsBackgrounds').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-background]');if(b){rememberedBackground=b.dataset.background as CosmicScene['background'];change({background:rememberedBackground});}});
  $('#nsTransparent').addEventListener('change',()=>{if(scene.background!=='transparent')rememberedBackground=scene.background;change({background:$<HTMLInputElement>('#nsTransparent').checked?'transparent':rememberedBackground});});
  $('#nsStyles').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-body]');if(!b)return;const body=b.dataset.body as CosmicScene['body'];persist();bar.set();scene=normalizeCosmos(memo[body]??{...R.bodyPresets[body],mode,body,ratio:scene.ratio,speed:scene.speed});tView=poster(scene);sync();stop();void update();});
  $('#nsOriginal').addEventListener('click',()=>change({tint:0}));
  $('#nsReset').addEventListener('click',()=>{bar.set();load(R.normalize({mode:scene.mode,body:scene.body,ratio:scene.ratio}));});
  $('#nsRatio').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-v]');if(b)change({ratio:b.dataset.v as CosmicScene['ratio']});});
  $('#nsPlay').addEventListener('click',()=>{
    if(playing){stop();return;}if(!renderer?.loaded)return;if(tView>=scene.loop-.02)tView=0;playing=true;last=performance.now();$('#nsPlay').textContent='Ⅱ 暫停';
    const tick=(now:number)=>{if(!playing)return;tView=Math.min(scene.loop,tView+(now-last)/1000);last=now;redraw();if(tView>=scene.loop){stop();return;}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
  });
  time.addEventListener('input',()=>{stop();tView=Number(time.value);redraw();});
  let drag:{id:number;px:number;py:number;x:number;y:number}|undefined;
  stage.addEventListener('pointerdown',e=>{if(!renderer?.loaded)return;stop();drag={id:e.pointerId,px:e.clientX,py:e.clientY,x:scene.x,y:scene.y};stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',e=>{if(!drag)return;const rect=canvas.getBoundingClientRect();change({x:drag.x+(e.clientX-drag.px)/rect.width,y:drag.y+(e.clientY-drag.py)/rect.height});});
  const endDrag=()=>{drag=undefined;};stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
  $('#nsCombo').addEventListener('click',()=>deps.addScene({effect:cosmicFxId(scene.mode),words:[JSON.stringify(scene)],seconds:scene.loop,ratio:scene.ratio}));
  $('#nsLink').addEventListener('click',()=>deps.copy(editUrl(location.origin,{kind:'cosmos',data:scene}),'已複製精修插畫編輯連結'));
  $('#nsJson').addEventListener('click',()=>saveBlob(new Blob([JSON.stringify(scene,null,2)],{type:'application/json'}),`cosmos-${mode}-${stamp()}.json`));
  $('#nsImport').addEventListener('click',()=>$<HTMLInputElement>('#nsFile').click());
  $('#nsFile').addEventListener('change',async()=>{const input=$<HTMLInputElement>('#nsFile'),file=input.files?.[0];if(!file)return;try{if(file.size>100000)throw new Error('設定檔過大');const data=JSON.parse(await file.text());if(!data||typeof data!=='object'||!Object.hasOwn(R.modes,data.mode)||data.mode!==mode)throw new Error('請匯入'+R.modes[mode].zh+'的設定 JSON');bar.set();scene=normalizeCosmos(data);tView=poster(scene);sync();void update();deps.toast('已匯入設定');}catch(e){deps.toast(e instanceof Error?e.message:'設定檔無法讀取');}finally{input.value='';}});
  async function output(kind:'png'|'webm'|'seq'){
    if(exporting)return;stop();exporting=true;dlg.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(b=>b.disabled=true);status('準備輸出…');
    const snapshot={...scene},[w,h]=dimensions[snapshot.ratio],cv=canvasOf(w,h),sn=canvasOf(w,h);let engine:ReturnType<typeof R.createRenderer>|undefined;
    try{
      engine=R.createRenderer(cv,sn,snapshot,location.origin);await engine.ready;
      const draw=(ctx:CanvasRenderingContext2D,t:number)=>{engine!.render(t,w,h);ctx.clearRect(0,0,w,h);ctx.drawImage(cv,0,0);ctx.drawImage(sn,0,0);};
      const filename=`cosmos-${snapshot.mode}-${stamp()}`;
      if(kind==='png'){const c=canvasOf(w,h);draw(c.getContext('2d')!,tView);const blob=await new Promise<Blob|null>(resolve=>c.toBlob(resolve));if(!blob)throw new Error('PNG 輸出失敗');saveBlob(blob,filename+'.png');}
      if(kind==='seq'){saveBlob(await pngSequence(w,h,snapshot.loop,draw,(i,n)=>status(`PNG 序列 ${i} / ${n} 格`)),filename+'.zip');}
      if(kind==='webm'){const recording=recordWebm(w,h,snapshot.loop,draw,p=>status(`錄製 ${Math.round(p*100)}%`));if(!recording)throw new Error('此瀏覽器不支援 WebM，請用 Chrome 或輸出 PNG 序列');saveBlob(await recording,filename+'.webm');}
      status('');deps.toast('已輸出精修插畫');
    }catch(e){status(e instanceof Error?e.message:'輸出失敗');}finally{engine?.dispose();exporting=false;dlg.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(b=>b.disabled=false);}
  }
  $('#nsPng').addEventListener('click',()=>void output('png'));$('#nsWebm').addEventListener('click',()=>void output('webm'));$('#nsSeq').addEventListener('click',()=>void output('seq'));
  const bar=presetBar($('#nsPreset'),{kind:'cosmos',filter:p=>p.mode===mode,getData:()=>scene,onLoad:p=>load(p.data),toast:deps.toast,copy:deps.copy,store:deps.store});
  const observer=new ResizeObserver(redraw);
  function open(){
    if(!dlg.open)dlg.showModal();document.body.style.overflow='hidden';$('.st-panel').scrollTop=0;$('.st-left').scrollTop=0;stop();sync();stage.dataset.ratio=scene.ratio;time.max=String(scene.loop);clock();
    if(!renderer){try{renderer=R.createRenderer(canvas,snow,scene,location.origin);renderer.ready.catch(()=>{});}catch(e){loading.hidden=false;loading.textContent=e instanceof Error?e.message:'無法啟動動畫';return;}}
    observer.observe(stage);void update();
  }
  function load(data:unknown){scene=normalizeCosmos(data);tView=poster(scene);open();}
  dlg.addEventListener('close',()=>{stop();version++;observer.disconnect();renderer?.dispose();renderer=undefined;document.body.style.overflow=document.querySelector('dialog[open]')?'hidden':'';const url=new URL(location.href);if(url.searchParams.get('view')==='cosmic-'+mode||url.searchParams.has('edit')){url.searchParams.delete('view');url.searchParams.delete('edit');url.searchParams.delete('d');history.replaceState({},'',url.pathname+url.search);}});
  $('#nsClose').addEventListener('click',()=>dlg.close());
  return {close:()=>{if(dlg.open)dlg.close();},open:()=>{bar.set();open();},load:(data:unknown)=>{bar.set();load(data);},loadPreset:(p:Pick<Preset,'id'|'name'|'data'>)=>{bar.set(p);load(p.data);}};
};

export const initCosmicStudio = (deps: CosmicDeps) => {
  const editors={orbit:createCosmicStudio(deps,'orbit'),flyover:createCosmicStudio(deps,'flyover'),earthzoom:createCosmicStudio(deps,'earthzoom')};
  const select=(mode:CosmicMode)=>{for(const [id,editor] of Object.entries(editors))if(id!==mode)editor.close();return editors[mode];};
  const view=new URLSearchParams(location.search).get('view');
  for(const mode of Object.keys(editors) as CosmicMode[])if(view==='cosmic-'+mode)select(mode).open();
  return {openMode:(mode:CosmicMode)=>select(mode).open(),load:(data:unknown)=>{const sc=normalizeCosmos(data);select(sc.mode).load(sc);},loadPreset:(p:Pick<Preset,'id'|'name'|'data'>)=>select(normalizeCosmos(p.data).mode).loadPreset(p)};
};
