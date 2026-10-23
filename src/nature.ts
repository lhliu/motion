/** Self-contained refined meteors and overhead landscapes. */
export type NMode='meteor'|'city'|'river'|'mountain'|'grass'|'farm'|'coast'|'forest'|'highway';
export type NStyle='rock'|'ice'|'lava'|'gold';
export interface NScene{
 version:1;mode:NMode;style:NStyle;ratio:'9:16'|'16:9'|'1:1';background:string;frame:'full'|'card'|'circle';
 size:number;speed:number;loop:number;x:number;y:number;angle:number;color:string;tint:number;opacity:number;brightness:number;seed:number;
 path:'hover'|'pass';direction:'right'|'left';spin:number;float:number;debris:number;orbit:number;heat:number;shine:number;
 zoom:number;pan:number;heading:number;traffic:number;flow:number;boats:number;waves:number;clouds:number;wind:number;herd:number;horseRatio:number;grazing:number;harvest:number;trees:number;
}
export interface NField{key:keyof NScene;label:string;min:number;max:number;step:number}
export function natureEngine(){
 const modes:Record<NMode,{zh:string;en:string;id:string;no:number;cat:'meteor'|'aerial';desc:string}>={
  meteor:{zh:'精修隕石',en:'Illustrated Meteor Collection',id:'meteor-illustrated',no:244,cat:'meteor',desc:'一招切換岩石、冰晶、熔岩、金屬；可調自轉、漂浮、碎石散布'},
  city:{zh:'俯瞰城市',en:'Illustrated City Overhead',id:'aerial-illustrated-city',no:245,cat:'aerial',desc:'精細屋頂、街廓與植栽，車流沿十字道路行駛'},
  river:{zh:'俯瞰河流',en:'Illustrated River Overhead',id:'aerial-illustrated-river',no:246,cat:'aerial',desc:'蜿蜒河道與河岸綠地，船隻順流移動並留下細微尾波'},
  mountain:{zh:'俯瞰山川',en:'Illustrated Mountains Overhead',id:'aerial-illustrated-mountain',no:247,cat:'aerial',desc:'精細稜線、山谷與溪流，鏡頭巡航，分層雲朵緩慢掠過'},
  grass:{zh:'草原牛馬',en:'Illustrated Grazing Meadow',id:'aerial-illustrated-grass',no:248,cat:'aerial',desc:'正上方的完整牛馬在草地漫步，調整數量、比例與吃草停留'},
  farm:{zh:'俯瞰農田',en:'Illustrated Farm Overhead',id:'aerial-illustrated-farm',no:249,cat:'aerial',desc:'稻田、作物條紋與農路，農車與拖拉機在各自路徑行進'},
  coast:{zh:'俯瞰海岸',en:'Illustrated Coast Overhead',id:'aerial-illustrated-coast',no:250,cat:'aerial',desc:'細緻沙灘與海岸紋理，浪線推向岸邊，船隻沿近海巡航'},
  forest:{zh:'俯瞰森林',en:'Illustrated Forest Overhead',id:'aerial-illustrated-forest',no:251,cat:'aerial',desc:'細密林冠與林間小路，獨立前景樹冠輕擺，可調數量與風力'},
  highway:{zh:'俯瞰交流道',en:'Illustrated Interchange Overhead',id:'aerial-illustrated-highway',no:252,cat:'aerial',desc:'精細交流道與道路標線，車流沿主線行駛，可調密度與速度'},
 };
 const styles:Record<NStyle,{zh:string;desc:string}>={rock:{zh:'岩石',desc:'坑洞與礦物紋理'},ice:{zh:'冰晶',desc:'六向晶簇與刻紋切面'},lava:{zh:'熔岩',desc:'玄武岩裂隙與熔岩紋理'},gold:{zh:'金屬',desc:'金色錘紋與硬邊反光'}};
 const meteorBackgrounds:Record<string,{zh:string}>={space:{zh:'深空星際'},nebula:{zh:'靛紫星雲'},dust:{zh:'赤褐塵帶'},night:{zh:'深藍星夜'},paper:{zh:'暖白圖鑑'},transparent:{zh:'透明背景'}};
 const aerialBackgrounds:Record<string,{zh:string}>={natural:{zh:'自然日光'},warm:{zh:'暖色夕照'},cool:{zh:'清冷晨色'},night:{zh:'靜謐夜色'},ink:{zh:'墨色圖鑑'},transparent:{zh:'透明地景卡'}};
 const backgrounds={...meteorBackgrounds,...aerialBackgrounds};
 const stylePresets:Record<NStyle,Partial<NScene>>={rock:{color:'#8a7660',heat:0,shine:0,path:'hover',angle:0},ice:{color:'#80c3d1',heat:0,shine:.7,path:'hover',angle:0},lava:{color:'#b75230',heat:1,shine:0,path:'pass',angle:-28},gold:{color:'#c49a49',heat:0,shine:.7,path:'hover',angle:0}};
 const defaults:NScene={version:1,mode:'meteor',style:'rock',ratio:'9:16',background:'space',frame:'full',size:1,speed:1,loop:12,x:.5,y:.5,angle:0,color:'#8a7660',tint:0,opacity:1,brightness:1,seed:244,path:'hover',direction:'right',spin:6,float:.7,debris:5,orbit:1,heat:0,shine:0,zoom:1.15,pan:.6,heading:25,traffic:1,flow:.7,boats:2,waves:.7,clouds:.35,wind:.6,herd:10,horseRatio:.35,grazing:.6,harvest:.7,trees:16};
 const field=(key:keyof NScene,label:string,min:number,max:number,step=.05):NField=>({key,label,min,max,step});
 const fields:Record<NMode,NField[]>={
  meteor:[field('spin','自轉速度',-25,25,1),field('float','漂浮幅度',0,2),field('debris','伴飛碎石',0,16,1),field('orbit','碎石散布',.5,1.7)],
  city:[field('traffic','街道車流量',0,2),field('flow','車流速度',0,2)],
  river:[field('boats','河面船隻',0,6,1),field('flow','順流速度',0,2),field('waves','船尾波紋',0,2)],
  mountain:[field('clouds','山腰雲量',0,1),field('wind','雲層風速',0,2)],
  grass:[field('herd','牛馬數量',0,24,1),field('horseRatio','馬匹比例',0,1),field('flow','漫步速度',0,2),field('grazing','吃草停留',0,1)],
  farm:[field('traffic','農路車流',0,2),field('flow','農車速度',0,2),field('harvest','田間拖拉機',0,1)],
  coast:[field('boats','近海船隻',0,6,1),field('flow','巡航速度',0,2),field('waves','近岸浪線',0,2)],
  forest:[field('trees','前景樹冠',0,30,1),field('wind','樹冠風力',0,2),field('clouds','林上雲量',0,1)],
  highway:[field('traffic','主線車流量',0,2),field('flow','行車速度',0,2)],
 };
 const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v)),mod=(v:number,n=1)=>((v%n)+n)%n;
 const environments=(mode:NMode)=>mode==='meteor'?meteorBackgrounds:aerialBackgrounds;
 function normalize(raw:unknown={},fallback:NMode='meteor'):NScene{
  const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
  const mode=Object.hasOwn(modes,String(o.mode))?o.mode as NMode:fallback,style=Object.hasOwn(styles,String(o.style))?o.style as NStyle:'rock';
  const base={...defaults,...stylePresets[style],mode,style,...(mode!=='meteor'?{background:'natural',size:1}:{})};
  const num=(k:keyof NScene,a:number,b:number)=>typeof o[k]==='number'&&Number.isFinite(o[k])?clamp(o[k] as number,a,b):base[k] as number;
  const speed=typeof o.speed==='number'&&Number.isFinite(o.speed)?clamp(o.speed,.6,2.5):typeof o.loop==='number'&&o.loop>0?clamp(12/o.loop,.6,2.5):1;
  return{version:1,mode,style,ratio:['9:16','16:9','1:1'].includes(String(o.ratio))?o.ratio as NScene['ratio']:'9:16',background:Object.hasOwn(environments(mode),String(o.background))?String(o.background):base.background,frame:['full','card','circle'].includes(String(o.frame))?o.frame as NScene['frame']:'full',
   size:num('size',.4,2.2),speed,loop:12/speed,x:num('x',-.5,1.5),y:num('y',0,1),angle:num('angle',-180,180),color:typeof o.color==='string'&&/^#[0-9a-f]{6}$/i.test(o.color)?o.color.toLowerCase():base.color,tint:num('tint',0,1),opacity:num('opacity',0,1),brightness:num('brightness',.3,1.5),seed:Math.round(num('seed',0,999999)),path:o.path==='pass'?'pass':o.path==='hover'?'hover':base.path,direction:o.direction==='left'?'left':'right',
   spin:num('spin',-25,25),float:num('float',0,2),debris:Math.round(num('debris',0,16)),orbit:num('orbit',.5,1.7),heat:num('heat',0,1.5),shine:num('shine',0,1),zoom:num('zoom',1,2.6),pan:num('pan',0,1.5),heading:num('heading',-180,180),traffic:num('traffic',0,2),flow:num('flow',0,2),boats:Math.round(num('boats',0,6)),waves:num('waves',0,2),clouds:num('clouds',0,1),wind:num('wind',0,2),herd:Math.round(num('herd',0,24)),horseRatio:num('horseRatio',0,1),grazing:num('grazing',0,1),harvest:num('harvest',0,1),trees:Math.round(num('trees',0,30))};
 }
 function fromWords(words:string[]=[],fallback:NMode='meteor'){try{return normalize(JSON.parse(words.find(w=>w.trim().startsWith('{'))||'{}'),fallback);}catch{return normalize({},fallback);}}
 const assetPath=(name:string)=>name==='space'?'/media/transport-illustrated/space-v1.png':name==='cloud'?'/media/transport-illustrated/cloud-v1.png':'/media/nature-illustrated/'+name+'-v1.png';
 type Asset={image:HTMLImageElement;box:[number,number,number,number];ratio:number};
 function createRenderer(canvas:HTMLCanvasElement,overlay:HTMLCanvasElement,initial:unknown,origin:string,opts:{lite?:boolean}={}){
  const ctx=canvas.getContext('2d')!,top=overlay.getContext('2d')!;let scene=normalize(initial),disposed=false,loaded=false,revision=0,key='';
  const assets=new Map<string,Asset>(),pending=new Map<string,Promise<Asset>>(),tints=new Map<string,HTMLCanvasElement>();
  const cv=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  function load(name:string):Promise<Asset>{
   if(assets.has(name))return Promise.resolve(assets.get(name)!);if(pending.has(name))return pending.get(name)!;
   const p=new Promise<Asset>((resolve,reject)=>{const image=new Image();image.crossOrigin='anonymous';image.onload=()=>{try{
    const w=image.naturalWidth,h=image.naturalHeight;let box:[number,number,number,number]=[0,0,w,h];
    if(!['city','river','mountain','grass','farm','coast','forest','highway','space','nebula','dust'].includes(name)){
     const c=cv(w,h),x=c.getContext('2d',{willReadFrequently:true})!;x.drawImage(image,0,0);const d=x.getImageData(0,0,w,h).data;let l=w,r=0,t=h,b=0;
     for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++)if(d[(y*w+xx)*4+3]>30){l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,y);b=Math.max(b,y);}
     if(r>l&&b>t)box=[l,t,r-l+1,b-t+1];c.width=c.height=1;
    }
    const a={image,box,ratio:box[3]/box[2]};if(!disposed)assets.set(name,a);resolve(a);
   }catch(e){reject(e);}};image.onerror=()=>reject(new Error('精修素材暫時無法載入，請確認網路後重試'));image.src=origin.replace(/\/$/,'')+assetPath(name).replace(/\.png$/,opts.lite?'-s.webp':'.webp');});pending.set(name,p);p.catch(()=>pending.delete(name));return p;
  }
  function required(s:NScene){
   if(s.mode==='meteor')return[s.style,...(['space','nebula','dust'].includes(s.background)?[s.background]:[])];
   return[s.mode,...(['city','farm','highway'].includes(s.mode)&&s.traffic>0?['car-top']:[]),...(['river','coast'].includes(s.mode)&&s.boats>0?['boat-top']:[]),...(s.mode==='grass'&&s.herd>0?['cow-top','horse-top']:[]),...(s.mode==='farm'&&s.harvest>0?['tractor-top']:[]),...(s.mode==='forest'&&s.trees>0?['tree-top']:[]),...(['mountain','forest'].includes(s.mode)&&s.clouds>0?['cloud']:[])];
  }
  function update(raw:unknown){scene=normalize(raw);const names=required(scene),next=names.join('/');if(loaded&&key===next)return Promise.resolve(true);const token=++revision;loaded=false;return Promise.all(names.map(load)).then(()=>{if(disposed||token!==revision)return false;key=next;loaded=true;for(const name of assets.keys())if(assets.size>16&&!names.includes(name)){assets.delete(name);pending.delete(name);}return true;});}
  function tinted(name:string,a:Asset):CanvasImageSource{
   if(scene.tint===0)return a.image;const k=name+'/'+scene.color+'/'+scene.tint;if(tints.has(k))return tints.get(k)!;
   const c=cv(a.image.naturalWidth,a.image.naturalHeight),x=c.getContext('2d',{willReadFrequently:true})!;x.drawImage(a.image,0,0);const p=x.getImageData(0,0,c.width,c.height),d=p.data;
   const rgb=[1,3,5].map(i=>parseInt(scene.color.slice(i,i+2),16)/255),mx=Math.max(...rgb),mn=Math.min(...rgb),delta=mx-mn,sat=mx?delta/mx:0;
   const h=mod(delta?(mx===rgb[0]?(rgb[1]-rgb[2])/delta:mx===rgb[1]?(rgb[2]-rgb[0])/delta+2:(rgb[0]-rgb[1])/delta+4):0,6),unit=[0,4,2].map(v=>clamp(Math.abs(mod(h+v,6)-3)-1));
   for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const value=Math.max(d[i],d[i+1],d[i+2])/255,s=value?(value-Math.min(d[i],d[i+1],d[i+2])/255)/value:0,protect=value>.82&&s<.18?.15:1,strength=scene.tint*protect,v=clamp(value*(.5+mx*.7));for(let k=0;k<3;k++)d[i+k]=Math.round(d[i+k]*(1-strength)+255*v*((1-sat)+sat*unit[k])*strength);}
   x.putImageData(p,0,0);tints.set(k,c);if(tints.size>6){const old=tints.keys().next().value!;tints.get(old)!.width=1;tints.delete(old);}return c;
  }
  const rand=(i:number,k=0)=>{let n=(scene.seed+Math.imul(i+1,374761393)+Math.imul(k+1,668265263))>>>0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;};
  function render(time:number,width=canvas.width,height=canvas.height){
   if(disposed||!loaded)return;if(canvas.width!==width||canvas.height!==height){canvas.width=overlay.width=width;canvas.height=overlay.height=height;}
   const s=scene,t=clamp(Number(time)||0,0,s.loop)*s.speed,W=1080,H=1080*height/width,scale=width/W;
   ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);top.clearRect(0,0,overlay.width,overlay.height);ctx.save();ctx.scale(scale,scale);
   function image(name:string,x:number,y:number,w:number,rotation=0,alpha=1,tint=true){const a=assets.get(name);if(!a)return;ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.globalAlpha*=alpha;const [sx,sy,sw,sh]=a.box;ctx.drawImage(tint?tinted(name,a):a.image,sx,sy,sw,sh,-w/2,-w*a.ratio/2,w,w*a.ratio);ctx.restore();}
   if(s.mode==='meteor'){
    if(s.background!=='transparent'){
     const bg=assets.get(s.background);if(bg){const z=Math.max(W/bg.image.naturalWidth,H/bg.image.naturalHeight)*1.08,bw=bg.image.naturalWidth*z,bh=bg.image.naturalHeight*z;ctx.save();ctx.filter=`brightness(${s.brightness})`;ctx.drawImage(bg.image,(W-bw)/2+Math.sin(t*.1)*12,(H-bh)/2,bw,bh);ctx.restore();}
     else{ctx.save();ctx.filter=`brightness(${s.brightness})`;ctx.fillStyle=s.background==='paper'?'#eee7d4':'#081522';ctx.fillRect(0,0,W,H);for(let i=0;i<120;i++){ctx.fillStyle=s.background==='paper'?'#746a4520':'#e7dfbd';ctx.globalAlpha=s.background==='paper'?1:.15+.6*rand(i,3);ctx.fillRect(rand(i)*W,rand(i,1)*H,1+rand(i,2)*2,1+rand(i,2)*2);}ctx.globalAlpha=1;ctx.restore();}
    }
    const d=Math.min(W*.72,H*.48)*s.size,flip=s.direction==='left'?-1:1,a=s.angle*Math.PI/180,travel=s.path==='pass'?(t/12-.5)*(W+d*2):0;
    const x=s.x*W+Math.cos(a)*travel*flip,y=s.y*H+Math.sin(a)*travel+Math.sin(t*.8)*s.float*18*s.size;
    ctx.save();ctx.globalAlpha=s.opacity;ctx.translate(x,y);ctx.rotate(a);ctx.scale(flip,1);
    for(let i=0;i<s.debris;i++){const theta=rand(i)*Math.PI*2+t*(.12+rand(i,1)*.12),r=d*(.7+rand(i,2)*.35)*s.orbit,z=.045+rand(i,3)*.075;image(s.style,Math.cos(theta)*r,Math.sin(theta)*r*.65,d*z,theta+t*.25,.65+rand(i,4)*.35);}
    ctx.save();ctx.rotate(t*s.spin*Math.PI/180);ctx.scale(.94+.06*Math.cos(t*.22),1);
    if(s.style==='lava')ctx.filter=`brightness(${1+s.heat*(.10+.08*Math.sin(t*2.5))})`;image(s.style,0,0,d);ctx.filter='none';
    if(['ice','gold'].includes(s.style)&&s.shine>0){const pos=(mod(t*.13)-.5)*d*2;ctx.save();ctx.beginPath();ctx.moveTo(pos-d*.3,-d);ctx.lineTo(pos-d*.1,-d);ctx.lineTo(pos+d*.45,d);ctx.lineTo(pos+d*.25,d);ctx.closePath();ctx.clip();ctx.filter=`brightness(${1+s.shine*.6})`;image(s.style,0,0,d);ctx.restore();}
    ctx.restore();ctx.restore();
   }else{
    const a=assets.get(s.mode)!,transparent=s.background==='transparent',inset=transparent?.88:1,fw=W*s.size*inset,fh=H*s.size*inset;
    if(!transparent){ctx.fillStyle=({natural:'#e7e4d3',warm:'#e9d6b2',cool:'#c6d7d9',night:'#10232b',ink:'#d5d2c4'} as Record<string,string>)[s.background]||'#e7e4d3';ctx.fillRect(0,0,W,H);}
    ctx.save();ctx.globalAlpha=s.opacity;ctx.translate(s.x*W,s.y*H);ctx.rotate(s.angle*Math.PI/180);ctx.beginPath();
    if(s.frame==='circle')ctx.ellipse(0,0,Math.min(fw,fh)*.5,Math.min(fw,fh)*.5,0,0,Math.PI*2);else if(s.frame==='card'||transparent)ctx.roundRect(-fw/2,-fh/2,fw,fh,Math.min(fw,fh)*.035);else ctx.rect(-fw/2,-fh/2,fw,fh);ctx.clip();
    const cover=Math.max(fw/1000,fh/1778)*s.zoom*1.12,mw=1000*cover,mh=1778*cover,heading=s.heading*Math.PI/180;
    const px=Math.sin(t*.11)*Math.min((mw-fw)*.43,120)*s.pan/1.5*Math.cos(heading),py=Math.sin(t*.11)*Math.min((mh-fh)*.43,180)*s.pan/1.5*Math.sin(heading);
    ctx.translate(-mw/2+px,-mh/2+py);ctx.scale(cover,cover);
    ctx.save();ctx.filter=`brightness(${s.brightness}) `+({natural:'',warm:'sepia(.24) saturate(1.1)',cool:'hue-rotate(12deg) saturate(.85)',night:'brightness(.48) saturate(.65) hue-rotate(10deg)',ink:'grayscale(1) sepia(.22) contrast(1.1)',transparent:''} as Record<string,string>)[s.background];ctx.drawImage(tinted(s.mode,a),0,0,1000,1778);ctx.restore();
    const car=(x:number,y:number,heading:number,w=18)=>{image('car-top',x,y,w,heading);if(s.background==='night'){ctx.save();ctx.translate(x,y);ctx.rotate(heading);ctx.strokeStyle='#eedfb6';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-w*.24,-w*.9);ctx.lineTo(-w*.24,-w*1.35);ctx.moveTo(w*.24,-w*.9);ctx.lineTo(w*.24,-w*1.35);ctx.stroke();ctx.restore();}};
    if(['city','farm','highway'].includes(s.mode)){
     const n=Math.round(s.traffic*(s.mode==='highway'?24:12));
     for(let i=0;i<n;i++){const vert=i%2===0,lanes=s.mode==='highway'?(vert?[.432,.459,.54,.566]:[.466,.478,.521,.533]):s.mode==='farm'&&!vert?[.491,.509]:[.48,.52],lane=lanes[(i>>1)%lanes.length],positive=lane<.5,u=mod(rand(i)+t*s.flow*(positive?1:-1)*.025),x=vert?lane*1000:u*1000,y=vert?u*1778:lane*1778;
      if((s.mode==='city'&&Math.abs((vert?y/1778:x/1000)-.5)<.065)||(s.mode==='highway'&&vert&&Math.abs(y/1778-.5)<.055))continue;
      car(x,y,vert?(positive?Math.PI:0):(positive?Math.PI/2:-Math.PI/2),s.mode==='farm'?18:16);
     }
    }
    const riverX=(u:number)=>500+100*Math.sin(u*Math.PI*2);
    if(['river','coast'].includes(s.mode)){
     for(let i=0;i<s.boats;i++){const u=mod(.1+i/Math.max(1,s.boats)+rand(i,3)*.07+t*s.flow*.018),y=u*1778,x=s.mode==='river'?riverX(u):180+rand(i)*150,dx=s.mode==='river'?100*Math.PI*2*Math.cos(u*Math.PI*2):0,heading=Math.PI-Math.atan2(dx,1778);
      if(s.waves>0)for(let j=0;j<3;j++){const age=mod(t*.35+i*.3+j/3),wy=y-age*65,ww=age*14*s.waves;ctx.strokeStyle='#e4eee0';ctx.globalAlpha=s.opacity*(1-age)*.45;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-ww,wy);ctx.lineTo(x,wy-3);ctx.lineTo(x+ww,wy);ctx.stroke();}ctx.globalAlpha=s.opacity;image('boat-top',x,y,23,heading);
     }
     if(s.mode==='coast'&&s.waves>0)for(let k=0;k<4;k++){const phase=mod(t*.13+k/4),shore=565+phase*26*s.waves;ctx.globalAlpha=s.opacity*Math.sin(phase*Math.PI)*.4;ctx.strokeStyle='#f4f0d7';ctx.lineWidth=1.8;ctx.beginPath();for(let y=0;y<=1800;y+=12){const x=shore+Math.sin(y*.005)*15+Math.sin(y*.055+t)*2;y?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}ctx.globalAlpha=s.opacity;
    }
    if(s.mode==='grass')for(let i=0;i<s.herd;i++){
     const cycle=t*s.flow*.10+rand(i),phase=mod(cycle),active=1-s.grazing*.65,progress=Math.floor(cycle)+Math.min(1,phase/active),u=progress*.65+rand(i)*Math.PI*2;
     const x=310+rand(i,1)*420+Math.cos(u)*40,y=490+rand(i,2)*750+Math.sin(u*.7)*45,dx=-Math.sin(u)*40,dy=Math.cos(u*.7)*31.5,rotation=s.flow===0?rand(i,3)*6.28:Math.atan2(dy,dx)+Math.PI/2;
     const animal=i<Math.round(s.herd*s.horseRatio)?'horse-top':'cow-top',w=23+rand(i,4)*10,graze=phase>active?1-Math.max(0,Math.sin(t*1.2+i))*s.grazing*.035:1;image(animal,x,y,w*graze,rotation);
    }
    if(s.mode==='farm'&&s.harvest>0){const u=mod(t*.035*s.harvest),row=Math.floor(t*.035*s.harvest)%4,x=690+row*45,y=1220+u*360;image('tractor-top',x,y,27,Math.PI);}
    if(s.mode==='forest')for(let i=0;i<s.trees;i++){const x=i%2?660+rand(i)*230:80+rand(i)*230,y=80+rand(i,1)*1600,w=65+rand(i,2)*65;image('tree-top',x,y,w,Math.sin(t*.8+i)*s.wind*.025,1,false);}
    if(['mountain','forest'].includes(s.mode))for(let i=0;i<Math.round(s.clouds*7);i++){const x=mod(rand(i)*1600+t*s.wind*12,1600)-300,y=rand(i,1)*1700;image('cloud',x,y,180+rand(i,2)*180,.1,.32,false);}
    ctx.restore();
   }
   ctx.restore();ctx.globalAlpha=1;ctx.filter='none';
  }
  function dispose(){if(disposed)return;disposed=true;revision++;assets.clear();pending.clear();for(const c of tints.values())c.width=c.height=1;tints.clear();canvas.width=overlay.width=1;canvas.height=overlay.height=1;}
  const ready=update(initial);return{ready,update,render,dispose,get scene(){return scene;},get loaded(){return loaded;}};
 }
 return{modes,styles,stylePresets,meteorBackgrounds,aerialBackgrounds,backgrounds,environments,defaults,fields,normalize,fromWords,createRenderer};
}
export const NATURE=natureEngine();
export const normalizeNature=NATURE.normalize;
export const natureMode=(id:string):NMode=>(Object.entries(NATURE.modes).find(([mode,m])=>mode===id||m.id===id)?.[0] as NMode|undefined)??'meteor';
export const natureFxId=(mode:NMode)=>NATURE.modes[mode].id;
export const isNatureFx=(id:string)=>Object.values(NATURE.modes).some(m=>m.id===id);
export const natureFromWords=(words:string[]=[],effect='meteor-illustrated')=>NATURE.fromWords(words,natureMode(effect));
(globalThis as unknown as{MA_NATURE:typeof NATURE}).MA_NATURE=NATURE;
