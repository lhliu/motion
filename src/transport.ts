/** Refined transport scenes. This factory is serialized into standalone HTML. */
export type TMode = 'car'|'carriage'|'plane'|'rocket'|'train'|'ship'|'balloon';
export interface TScene {
  version:1; mode:TMode; ratio:'9:16'|'16:9'|'1:1'; background:'city'|'country'|'sky'|'sea'|'space'|'transparent';
  size:number; speed:number; loop:number; x:number; y:number; angle:number; direction:'right'|'left'; path:'pass'|'cruise';
  color:string; tint:number; opacity:number; brightness:number; camera:number; seed:number;
  wheel:number; suspension:number; terrain:number; headlights:number; gait:number; sway:number; climb:number; contrail:number; clouds:number;
  thrust:number; flame:number; shake:number; sparks:number; coaches:number; gap:number; draft:number; waves:number; rocking:number; smoke:number; wake:number; rise:number; wind:number; burner:number;
}
export interface TField {key:keyof TScene;label:string;min:number;max:number;step:number}
export function transportEngine(){
  const modes:Record<TMode,{zh:string;en:string;id:string;no:number;desc:string}>={
    car:{zh:'開車上路',en:'Illustrated Driving Car',id:'vehicle-illustrated-car',no:237,desc:'精細車身與獨立轉動的輪胎，調整輪速、懸吊、道路與車燈'},
    carriage:{zh:'馬車旅行',en:'Illustrated Horse Carriage',id:'vehicle-illustrated-carriage',no:238,desc:'精細馬車、木輪與分層馬匹，調整步態、輪速與車身起伏'},
    plane:{zh:'穿雲飛行',en:'Illustrated Passenger Jet',id:'vehicle-illustrated-plane',no:239,desc:'精細客機穿越分層雲朵，調整爬升、浮動、凝結尾與前景雲'},
    rocket:{zh:'太空船啟航',en:'Illustrated Spacecraft',id:'vehicle-illustrated-rocket',no:240,desc:'精細太空船與多層噴焰，調整推力、火焰長度、震動與火星'},
    train:{zh:'火車捷運',en:'Illustrated Metro Train',id:'vehicle-illustrated-train',no:241,desc:'精細車頭與獨立中間車廂，調整車廂數、間距、輪速與軌道'},
    ship:{zh:'輪船巡航',en:'Illustrated Coastal Ship',id:'vehicle-illustrated-ship',no:242,desc:'精細輪船隨波起伏，調整波浪、搖晃、煙囪與船尾浪'},
    balloon:{zh:'熱氣球升空',en:'Illustrated Hot Air Balloon',id:'vehicle-illustrated-balloon',no:243,desc:'精細布面、繩索與藤編吊籃，調整升降、風向擺動、火焰與雲量'},
  };
  const backgrounds={city:{zh:'城市街景',file:'city-v1.png'},country:{zh:'田野山景',file:'country-v1.png'},sky:{zh:'高空雲海',file:'sky-v1.png'},sea:{zh:'海岸航線',file:'sea-v1.png'},space:{zh:'星際宇宙',file:'space-v1.png'},transparent:{zh:'透明背景',file:''}};
  const defaults:TScene={version:1,mode:'car',ratio:'9:16',background:'city',size:1,speed:1,loop:12,x:.5,y:.71,angle:0,direction:'right',path:'cruise',color:'#bb4b3e',tint:0,opacity:1,brightness:1,camera:.7,seed:237,
    wheel:1,suspension:.7,terrain:1,headlights:0,gait:1,sway:.7,climb:.12,contrail:.7,clouds:.6,thrust:1,flame:1,shake:.35,sparks:.7,coaches:3,gap:.08,draft:.25,waves:1,rocking:.8,smoke:.6,wake:1,rise:1,wind:.7,burner:.7};
  const presets:Record<TMode,Partial<TScene>>={car:{},carriage:{background:'country',size:.9,y:.70},plane:{background:'sky',y:.43},rocket:{background:'space',size:.8,y:.5,path:'pass',climb:.8},train:{background:'city',y:.76,size:1},ship:{background:'sea',y:.69,size:1},balloon:{background:'sky',y:.43,size:.65}};
  const field=(key:keyof TScene,label:string,min:number,max:number,step=.05):TField=>({key,label,min,max,step});
  const fields:Record<TMode,TField[]>={
    car:[field('wheel','車輪轉速',0,3),field('suspension','懸吊起伏',0,2),field('terrain','道路顯示',0,1),field('headlights','車燈光束',0,1)],
    carriage:[field('gait','馬匹步態',0,2),field('wheel','木輪轉速',0,3),field('suspension','車身起伏',0,2),field('terrain','道路顯示',0,1)],
    plane:[field('climb','爬升幅度',-.4,.5),field('sway','飛行浮動',0,2),field('contrail','凝結尾長度',0,1),field('clouds','前景雲量',0,1)],
    rocket:[field('thrust','引擎推力',0,2),field('flame','噴焰長度',.3,1.8),field('shake','飛行震動',0,1),field('sparks','尾焰火星',0,1),field('climb','爬升幅度',0,1.5)],
    train:[field('coaches','車廂數',1,5,1),field('gap','車廂間距',.02,.2,.01),field('wheel','車輪轉速',0,3),field('suspension','行進起伏',0,1),field('terrain','軌道顯示',0,1)],
    ship:[field('draft','吃水深度',0,1),field('waves','波浪幅度',0,2),field('rocking','船身搖晃',0,2),field('smoke','煙囪煙量',0,1),field('wake','船尾浪',0,1)],
    balloon:[field('rise','升降幅度',0,2),field('sway','吊籃擺動',0,2),field('wind','風力漂移',0,2),field('burner','燃燒器火焰',0,1),field('clouds','前景雲量',0,1)],
  };
  const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
  function normalize(raw:unknown={},fallback:TMode='car'):TScene{
    const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
    const mode=Object.hasOwn(modes,String(o.mode))?o.mode as TMode:fallback,base={...defaults,...presets[mode],mode};
    const num=(key:keyof TScene,min:number,max:number)=>typeof o[key]==='number'&&Number.isFinite(o[key])?clamp(o[key] as number,min,max):base[key] as number;
    const speed=typeof o.speed==='number'&&Number.isFinite(o.speed)?clamp(o.speed,.6,2.5):typeof o.loop==='number'&&Number.isFinite(o.loop)&&o.loop>0?clamp(12/o.loop,.6,2.5):1;
    return {version:1,mode,ratio:['9:16','16:9','1:1'].includes(String(o.ratio))?o.ratio as TScene['ratio']:'9:16',background:Object.hasOwn(backgrounds,String(o.background))?o.background as TScene['background']:base.background,
      size:num('size',.4,2.2),speed,loop:12/speed,x:num('x',-.5,1.5),y:num('y',0,1),angle:num('angle',-60,60),direction:o.direction==='left'?'left':'right',path:o.path==='pass'?'pass':o.path==='cruise'?'cruise':base.path,
      color:typeof o.color==='string'&&/^#[0-9a-f]{6}$/i.test(o.color)?o.color.toLowerCase():base.color,tint:num('tint',0,1),opacity:num('opacity',0,1),brightness:num('brightness',.3,1.5),camera:num('camera',0,1.5),seed:Math.round(num('seed',0,999999)),
      wheel:num('wheel',0,3),suspension:num('suspension',0,2),terrain:num('terrain',0,1),headlights:num('headlights',0,1),gait:num('gait',0,2),sway:num('sway',0,2),climb:num('climb',-.4,1.5),contrail:num('contrail',0,1),clouds:num('clouds',0,1),
      thrust:num('thrust',0,2),flame:num('flame',.3,1.8),shake:num('shake',0,1),sparks:num('sparks',0,1),coaches:Math.round(num('coaches',1,5)),gap:num('gap',.02,.2),draft:num('draft',0,1),waves:num('waves',0,2),rocking:num('rocking',0,2),smoke:num('smoke',0,1),wake:num('wake',0,1),rise:num('rise',0,2),wind:num('wind',0,2),burner:num('burner',0,1)};
  }
  function fromWords(words:string[]=[],fallback:TMode='car'){try{return normalize(JSON.parse(words.find(w=>w.trim().startsWith('{'))||'{}'),fallback);}catch{return normalize({},fallback);}}
  /** A four-beat walk. Stance feet stay on the road; swing feet lift, with fixed bone lengths. */
  function horsePose(time:number,gait:number){
    const mod=(v:number)=>((v%1)+1)%1,cycle=time*gait*.78,bodyY=14+(gait?Math.cos(cycle*Math.PI*4)*3:0);
    const legs=[{front:false,far:true,offset:.5},{front:true,far:true,offset:.75},{front:false,far:false,offset:0},{front:true,far:false,offset:.25}].map(leg=>{
      const root=leg.front?[1082,590]:[505,570],joint=leg.front?[1070,775]:[445,745],foot=leg.front?[1092,992]:[474,992];
      const phase=mod(cycle+leg.offset),stance=phase<.64,stride=136*Math.min(1,gait),swing=(phase-.64)/.36;
      const dx=gait?(stance?stride*(.5-phase/.64):stride*(-.5+(1-Math.cos(Math.PI*swing))*.5)):0;
      const lift=gait&&!stance?Math.sin(Math.PI*swing)*(leg.front?72:58):0,side=leg.far?-15:0;
      const a=[root[0]+side,root[1]+bodyY],c=[foot[0]+side+dx,foot[1]-lift];
      const l1=Math.hypot(joint[0]-root[0],joint[1]-root[1]),l2=Math.hypot(foot[0]-joint[0],foot[1]-joint[1]);
      const vx=c[0]-a[0],vy=c[1]-a[1],distance=Math.hypot(vx,vy),d=Math.min(l1+l2-.001,distance),ux=vx/distance,uy=vy/distance;
      const along=(l1*l1-l2*l2+d*d)/(2*d),bend=Math.sqrt(Math.max(0,l1*l1-along*along))*(leg.front?-1:1);
      const b=[a[0]+ux*along-uy*bend,a[1]+uy*along+ux*bend];
      return {...leg,phase,stance,root,joint,foot,a,b,c,l1,l2};
    });return{bodyY,legs};
  }
  type Asset={image:HTMLImageElement;box:[number,number,number,number];ratio:number};
  function createRenderer(canvas:HTMLCanvasElement,overlay:HTMLCanvasElement,initial:unknown,origin:string,opts:{lite?:boolean}={}){
    const ctx=canvas.getContext('2d')!,top=overlay.getContext('2d')!;
    let scene=normalize(initial),disposed=false,loaded=false,revision=0,assetKey='';
    const images=new Map<string,Asset>(),pending=new Map<string,Promise<Asset>>(),tints=new Map<string,HTMLCanvasElement>();
    const createCanvas=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
    const mod=(x:number,n:number)=>((x%n)+n)%n;
    const random=(i:number,k=0)=>{let s=(scene.seed+Math.imul(i+1,374761393)+Math.imul(k+1,668265263))>>>0;s=Math.imul(s^(s>>>13),1274126177);return((s^(s>>>16))>>>0)/4294967296;};
    function load(file:string):Promise<Asset>{
      if(images.has(file))return Promise.resolve(images.get(file)!);if(pending.has(file))return pending.get(file)!;
      const promise=new Promise<Asset>((resolve,reject)=>{const image=new Image();image.crossOrigin='anonymous';image.onload=()=>{try{
        const w=image.naturalWidth,h=image.naturalHeight;let box:[number,number,number,number]=[0,0,w,h];
        if(!Object.values(backgrounds).some(b=>b.file===file)){
          const c=createCanvas(w,h),x=c.getContext('2d',{willReadFrequently:true})!;x.drawImage(image,0,0);const d=x.getImageData(0,0,w,h).data;let l=w,r=0,t=h,b=0;
          for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++)if(d[(y*w+xx)*4+3]>30){l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,y);b=Math.max(b,y);}
          if(r>l&&b>t)box=[Math.max(0,l-1),Math.max(0,t-1),Math.min(w-l,r-l+3),Math.min(h-t,b-t+3)];c.width=c.height=1;
        }
        const asset={image,box,ratio:box[3]/box[2]};if(!disposed)images.set(file,asset);resolve(asset);
      }catch(error){reject(error);}};image.onerror=()=>reject(new Error('精修插畫素材暫時無法載入，請確認網路後重試。'));image.src=origin.replace(/\/$/,'')+'/media/transport-illustrated/'+file.replace(/\.png$/,opts.lite&&!file.startsWith('horse-complete')?'-s.webp':'.webp');});pending.set(file,promise);promise.catch(()=>pending.delete(file));return promise;
    }
    function required(sc:TScene){
      const base=sc.mode==='carriage'?['carriage','carriage-wheel','horse-complete']:sc.mode==='car'?['car','car-wheel']:sc.mode==='train'?['train','coach']:[sc.mode];
      if((['plane','balloon'].includes(sc.mode)&&sc.clouds>0)||(sc.mode==='ship'&&sc.smoke>0))base.push('cloud');
      return [...(sc.background==='transparent'?[]:[backgrounds[sc.background].file]),...base.map(s=>s==='horse-complete'?'horse-complete-v2.png':s+'-v1.png')];
    }
    function update(raw:unknown){
      scene=normalize(raw);const files=required(scene),key=files.join('/');if(key===assetKey&&loaded)return Promise.resolve(true);
      const token=++revision;loaded=false;return Promise.all(files.map(load)).then(()=>{if(disposed||token!==revision)return false;assetKey=key;loaded=true;
        for(const file of images.keys())if(images.size>12&&!files.includes(file)){images.delete(file);pending.delete(file);}
        return true;
      });
    }
    // Cache texture-preserving recoloring, rather than filtering every animation frame.
    function tinted(file:string,asset:Asset):CanvasImageSource{
      if(scene.tint===0)return asset.image;
      const key=file+'/'+scene.color+'/'+scene.tint;if(tints.has(key))return tints.get(key)!;
      const c=createCanvas(asset.image.naturalWidth,asset.image.naturalHeight),x=c.getContext('2d',{willReadFrequently:true})!;x.drawImage(asset.image,0,0);const p=x.getImageData(0,0,c.width,c.height),d=p.data;
      const rgb=[1,3,5].map(i=>parseInt(scene.color.slice(i,i+2),16)/255),max=Math.max(...rgb),min=Math.min(...rgb),delta=max-min,sat=max?delta/max:0;
      let hue=0;if(delta)hue=(max===rgb[0]?(rgb[1]-rgb[2])/delta: max===rgb[1]?(rgb[2]-rgb[0])/delta+2:(rgb[0]-rgb[1])/delta+4);hue=mod(hue,6);
      const unit=[0,1,2].map(k=>clamp(Math.abs(mod(hue+[0,4,2][k],6)-3)-1));
      const smooth=(a:number,b:number,v:number)=>{const q=clamp((v-a)/(b-a));return q*q*(3-2*q);};
      for(let i=0;i<d.length;i+=4){if(d[i+3]===0)continue;const v=Math.max(d[i],d[i+1],d[i+2])/255,low=Math.min(d[i],d[i+1],d[i+2])/255,s=v?(v-low)/v:0;
        const protect=1-smooth(.65,.93,v)*(1-smooth(.08,.3,s)),strength=scene.tint*protect,value=clamp(v*(.45+.75*max));
        for(let k=0;k<3;k++){const target=value*((1-sat)+sat*unit[k])*255;d[i+k]=Math.round(d[i+k]*(1-strength)+target*strength);}
      }x.putImageData(p,0,0);tints.set(key,c);if(tints.size>8){const oldest=tints.keys().next().value!;tints.get(oldest)!.width=1;tints.delete(oldest);}return c;
    }
    // One complete illustration is skinned continuously; limbs never detach from the torso.
    const horseLayer=createCanvas(1536,1080),horseCtx=horseLayer.getContext('2d')!;
    let horsePartsKey='',horseParts:HTMLCanvasElement[]=[],horseFar:HTMLCanvasElement[]=[],horseBody:HTMLCanvasElement|undefined;
    const horseYs=[535,590,620,650,700,745,775,850,930,974,1024];
    function horseTexture(time:number){
      const file='horse-complete-v2.png',asset=images.get(file)!,texture=tinted(file,asset),key=scene.color+'/'+scene.tint;
      if(key!==horsePartsKey){
        for(const c of [...horseParts,...horseFar])c.width=c.height=1;horseBody&&(horseBody.width=horseBody.height=1);horseParts=[];
        const polygons=[[[435,535],[625,535],[568,654],[501,748],[497,889],[535,1024],[397,1024],[395,880],[395,710],[425,600]],[[1008,535],[1156,535],[1132,775],[1119,891],[1150,1024],[1012,1024],[1010,877],[1026,754]]];
        for(const poly of polygons){const c=createCanvas(1536,1024),x=c.getContext('2d')!;x.beginPath();poly.forEach(([px,py],i)=>i?x.lineTo(px,py):x.moveTo(px,py));x.closePath();x.clip();x.drawImage(texture,0,0);horseParts.push(c);}
        horseFar=horseParts.map(part=>{const c=createCanvas(1536,1024),x=c.getContext('2d')!;x.drawImage(part,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='#14232435';x.fillRect(0,0,c.width,c.height);return c;});
        horseBody=createCanvas(1536,1024);const body=horseBody.getContext('2d')!;body.drawImage(texture,0,0);body.globalCompositeOperation='destination-out';body.fillStyle='#000';body.fillRect(1000,630,190,394);body.beginPath();for(const [i,p]of [[423,620],[595,620],[520,748],[540,1024],[410,1024],[410,720]].entries())i?body.lineTo(p[0],p[1]):body.moveTo(p[0],p[1]);body.closePath();body.fill();horsePartsKey=key;
      }
      const pose=horsePose(time,scene.gait);horseCtx.clearRect(0,0,horseLayer.width,horseLayer.height);
      const smooth=(a:number,b:number,v:number)=>{const q=clamp((v-a)/(b-a));return q*q*(3-2*q);};
      const rotate=(px:number,py:number,from:number[],to:number[],angle:number)=>{const dx=px-from[0],dy=py-from[1];return[to[0]+dx*Math.cos(angle)-dy*Math.sin(angle),to[1]+dx*Math.sin(angle)+dy*Math.cos(angle)];};
      function warp(px:number,py:number,leg:typeof pose.legs[number]|undefined):number[]{
        if(!leg)return[px,py+pose.bodyY];
        const {root,joint,foot,a,b,c}=leg;
        const upper=Math.atan2(b[1]-a[1],b[0]-a[0])-Math.atan2(joint[1]-root[1],joint[0]-root[0]);
        const lower=Math.atan2(c[1]-b[1],c[0]-b[0])-Math.atan2(foot[1]-joint[1],foot[0]-joint[0]);
        const u=rotate(px,py,root,a,upper),l=rotate(px,py,joint,b,lower),blend=smooth(joint[1]-30,joint[1]+30,py),anchor=smooth(610,700,py);
        const flat=smooth(930,974,py),lowerPoint=[l[0]*(1-flat)+(c[0]+px-foot[0])*flat,l[1]*(1-flat)+(c[1]+py-foot[1])*flat];
        const q=[u[0]*(1-blend)+lowerPoint[0]*blend,u[1]*(1-blend)+lowerPoint[1]*blend];
        return[px+(q[0]-px)*anchor,py+pose.bodyY+(q[1]-py-pose.bodyY)*anchor];
      }
      function mesh(source:CanvasImageSource,only:typeof pose.legs[number]){
        const horseXs=only.front?[990,1190]:[380,630];
        const vertices=horseYs.map(py=>horseXs.map(px=>{
          const leg=only;
          return{s:[px,py],d:warp(px,py,leg)};
        }));
        function triangle(v:typeof vertices[number]){
          const [a,b,c]=v,den=(b.s[0]-a.s[0])*(c.s[1]-a.s[1])-(c.s[0]-a.s[0])*(b.s[1]-a.s[1]);
          const A=((b.d[0]-a.d[0])*(c.s[1]-a.s[1])-(c.d[0]-a.d[0])*(b.s[1]-a.s[1]))/den;
          const B=((b.d[1]-a.d[1])*(c.s[1]-a.s[1])-(c.d[1]-a.d[1])*(b.s[1]-a.s[1]))/den;
          const C=((c.d[0]-a.d[0])*(b.s[0]-a.s[0])-(b.d[0]-a.d[0])*(c.s[0]-a.s[0]))/den;
          const D=((c.d[1]-a.d[1])*(b.s[0]-a.s[0])-(b.d[1]-a.d[1])*(c.s[0]-a.s[0]))/den;
          horseCtx.save();horseCtx.beginPath();const cx=(a.d[0]+b.d[0]+c.d[0])/3,cy=(a.d[1]+b.d[1]+c.d[1])/3;
          for(const [i,p] of v.entries()){const dx=p.d[0]-cx,dy=p.d[1]-cy,len=Math.hypot(dx,dy),x=p.d[0]+dx/len*.55,y=p.d[1]+dy/len*.55;i?horseCtx.lineTo(x,y):horseCtx.moveTo(x,y);}horseCtx.closePath();horseCtx.clip();
          horseCtx.transform(A,B,C,D,a.d[0]-A*a.s[0]-C*a.s[1],a.d[1]-B*a.s[0]-D*a.s[1]);horseCtx.drawImage(source,0,0);horseCtx.restore();
        }
        for(let y=0;y<horseYs.length-1;y++)for(let x=0;x<horseXs.length-1;x++){
          const a=vertices[y][x],b=vertices[y][x+1],c=vertices[y+1][x],d=vertices[y+1][x+1];triangle([a,b,c]);triangle([b,d,c]);
        }
      }
      mesh(horseFar[0],pose.legs[0]);mesh(horseFar[1],pose.legs[1]);mesh(horseParts[0],pose.legs[2]);mesh(horseParts[1],pose.legs[3]);horseCtx.drawImage(horseBody!,0,pose.bodyY);return horseLayer;
    }
    function render(time:number,width=canvas.width,height=canvas.height){
      if(disposed||!loaded)return;if(canvas.width!==width||canvas.height!==height){canvas.width=overlay.width=width;canvas.height=overlay.height=height;}
      const sc=scene,t=clamp(Number(time)||0,0,sc.loop)*sc.speed,p=t/12,flip=sc.direction==='left'?-1:1,W=1080,H=1080*height/width;
      ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);top.setTransform(1,0,0,1,0,0);top.clearRect(0,0,width,height);
      const scale=Math.max(width/W,height/H),camera=1+.02*sc.camera*Math.sin(p*Math.PI);
      ctx.save();ctx.translate(width/2,height/2);ctx.scale(scale*camera,scale*camera);ctx.translate(-W/2,-H/2);
      if(sc.background!=='transparent'){
        const bg=images.get(backgrounds[sc.background].file)!;const zoom=1.08+sc.camera*.06,pan=Math.sin(t*.15)*sc.camera*20,cover=Math.max(W/bg.image.naturalWidth,H/bg.image.naturalHeight)*zoom,bw=bg.image.naturalWidth*cover,bh=bg.image.naturalHeight*cover;
        ctx.save();ctx.filter=`brightness(${sc.brightness})`;ctx.drawImage(bg.image,(W-bw)/2+pan,(H-bh)/2,bw,bh);ctx.restore();
      }
      const image=(name:string,x:number,y:number,w:number,rotation=0,tint=true,alpha=1)=>{
        const file=name+'-v1.png',asset=images.get(file);if(!asset)return;
        ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.globalAlpha*=alpha;const [sx,sy,sw,sh]=asset.box;ctx.drawImage(tint?tinted(file,asset):asset.image,sx,sy,sw,sh,-w/2,-w*asset.ratio/2,w,w*asset.ratio);ctx.restore();
      };
      const clouds=()=>{for(let i=0;i<Math.round(sc.clouds*5);i++){const w=350+random(i)*450,x=mod(random(i,1)*2100-t*(14+i*9)*sc.wind,2100)-500,y=H*(.18+random(i,2)*.7);image('cloud',x,y,w,0,false,.25+(i%2)*.16);}};
      if(['plane','balloon'].includes(sc.mode))clouds();
      const travel=sc.path==='pass'?(p-.5)*W*1.8:0;
      let x=sc.x*W+travel*flip,y=sc.y*H,angle=sc.angle*Math.PI/180;
      if(['plane','rocket'].includes(sc.mode)){y-=sc.climb*(p-.5)*H;if(sc.path==='pass')angle+=Math.atan2(-sc.climb*H,W*1.8)*flip;else if(sc.mode==='rocket')angle-=.45*flip;}
      if(sc.mode==='plane')y+=Math.sin(t*.8)*sc.sway*12;
      if(sc.mode==='rocket'){x+=Math.sin(t*31)*sc.shake*sc.thrust*3;y+=Math.cos(t*27)*sc.shake*sc.thrust*3;}
      if(sc.mode==='ship'){y+=Math.sin(t*.85)*sc.waves*4;angle+=Math.sin(t*.85)*sc.rocking*.016*flip;}
      if(sc.mode==='balloon'){y-=Math.sin(p*Math.PI)*sc.rise*Math.min(140,H*.075);x+=Math.sin(t*.25)*sc.wind*55;angle+=Math.sin(t*.65)*sc.sway*.025;}
      const size=sc.size*Math.min(1,H/(sc.mode==='balloon'?1400:900)),bw=W*.84*size;
      const road=(ground:number,rail=false)=>{
        if(sc.background==='transparent'||sc.terrain===0)return;
        ctx.save();ctx.globalAlpha=sc.terrain;const roadSpeed=sc.mode==='carriage'?136/.64*.78*sc.gait*(W*.43*size/1298):90*sc.wheel,phase=mod(t*roadSpeed*flip,180);
        if(rail){ctx.fillStyle='#4f5657';ctx.fillRect(-300,ground-1,1680,38);for(let k=-3;k<12;k++){ctx.fillStyle='#8b7057';ctx.fillRect(k*180-phase,ground+3,75,32);}ctx.fillStyle='#b7c2bc';ctx.fillRect(-300,ground-2,1680,5);ctx.fillRect(-300,ground+24,1680,4);}
        else{ctx.fillStyle=sc.mode==='carriage'?'#9c8a6d':'#374c56';ctx.fillRect(-300,ground,1680,H-ground+300);ctx.fillStyle='#d7d5bd';ctx.fillRect(-300,ground+4,1680,3);for(let k=-3;k<12;k++)ctx.fillRect(k*180-phase,ground+80,95,5);for(let i=0;i<55;i++){ctx.fillStyle=i%2?'#ffffff12':'#06162118';ctx.fillRect(mod(random(i)*1600-t*roadSpeed*flip,1600)-250,ground+20+random(i,1)*230,3+random(i,2)*5,1);}}
        ctx.restore();
      };
      if(sc.mode==='car')road(y+bw*.23);
      if(sc.mode==='carriage')road(y+W*.17*size);
      if(sc.mode==='train'){const cw=W*.92*size/(sc.coaches+(sc.coaches-1)*sc.gap);road(y+cw*(images.get('train-v1.png')!.ratio*.49+.048),true);}
      const waterline=sc.mode==='ship'?sc.y*H+bw*(.19-.06*sc.draft):0;
      ctx.save();
      if(sc.mode==='ship'){
        ctx.beginPath();ctx.moveTo(-W*3,-H*3);ctx.lineTo(W*4,-H*3);
        for(let wx=W*4;wx>=-W*3;wx-=18)ctx.lineTo(wx,waterline+Math.sin(wx*.025-t*1.8)*sc.waves*2);
        ctx.closePath();ctx.clip();
      }
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(flip,1);ctx.globalAlpha=sc.opacity;
      if(sc.mode==='car'){
        const bounce=Math.sin(t*8)*sc.suspension*2.5;
        const cy=bw*.137,r=bw*.093;
        if(sc.headlights){ctx.fillStyle=`rgba(248,229,171,${sc.headlights*.2})`;ctx.beginPath();ctx.moveTo(bw*.44,0);ctx.lineTo(bw*.9,-30);ctx.lineTo(bw*.9,60);ctx.closePath();ctx.fill();}
        image('car',0,bounce,bw);
        for(const wx of [-.294,.322])image('car-wheel',wx*bw,cy,r*2,t*sc.wheel*5,false);
      }else if(sc.mode==='carriage'){
        const cw=W*.49*size,ground=W*.17*size,r=cw*.16,cartX=-W*.25*size,bodyY=ground-r-cw*.215,bounce=Math.sin(t*7*sc.gait)*sc.suspension*2;
        const horseW=W*.43*size,horseX=W*.22*size,hs=horseW/1298,ox=horseX-799*hs,oy=ground-992*hs;
        // Shafts reach the breastcollar, rather than stopping behind the horse.
        for(const offset of [-4,4]){ctx.strokeStyle='#654327';ctx.lineWidth=4*size;ctx.beginPath();ctx.moveTo(cartX+cw*.25,bodyY+cw*.13+offset+bounce);ctx.lineTo(ox+1175*hs,oy+610*hs+offset);ctx.stroke();ctx.strokeStyle='#bba472';ctx.lineWidth=1.2*size;ctx.stroke();}
        for(const wx of [-.32,.075])image('carriage-wheel',cartX+wx*cw,ground-r,r*2,t*(136/.64*.78*sc.gait*(W*.43*size/1298))/r*sc.wheel,false);
        image('carriage',cartX,bodyY+bounce,cw);
        const horse=horseTexture(t);ctx.drawImage(horse,ox,oy,horse.width*hs,horse.height*hs);
        ctx.strokeStyle='#47362a';ctx.lineWidth=1.5*size;ctx.beginPath();ctx.moveTo(cartX+cw*.08,bodyY-cw*.07+bounce);ctx.quadraticCurveTo(horseX-horseW*.28,oy+240*hs,ox+1380*hs,oy+340*hs);ctx.stroke();
      }else if(sc.mode==='plane'){
        for(const off of [.02,.075]){ctx.fillStyle=`rgba(238,240,224,${sc.contrail*.26})`;ctx.beginPath();ctx.moveTo(-bw*.28,bw*off);ctx.lineTo(-bw*(.4+sc.contrail*.9),bw*off-5);ctx.lineTo(-bw*(.4+sc.contrail*.9),bw*off+8);ctx.closePath();ctx.fill();}
        image('plane',0,0,bw);
      }else if(sc.mode==='rocket'){
        const flicker=1+.12*Math.sin(t*17)+.06*Math.sin(t*29),len=bw*.55*sc.flame*sc.thrust*flicker;
        if(len>0)for(let k=0;k<3;k++){const f=1-k*.25;ctx.fillStyle=['#ad4934','#f0a84f','#fff0bd'][k];ctx.beginPath();ctx.moveTo(-bw*.42,-bw*.075*f);ctx.lineTo(-bw*.42-len*f,-bw*.018*Math.sin(t*19));ctx.lineTo(-bw*.42,bw*.075*f);ctx.closePath();ctx.fill();}
        for(let i=0;i<Math.round(45*sc.sparks*sc.thrust);i++){const age=mod(t*.7+i/45,1),px=-bw*(.4+age*1.3),py=(random(i)-.5)*bw*.3*age;ctx.globalAlpha=sc.opacity*(1-age);ctx.fillStyle=i%2?'#f3c67c':'#ed8250';ctx.fillRect(px,py,2+random(i,1)*3,1.5);}ctx.globalAlpha=sc.opacity;
        image('rocket',0,0,bw);
      }else if(sc.mode==='train'){
        const n=sc.coaches,total=W*.92*size,cw=total/(n+(n-1)*sc.gap),gap=cw*sc.gap,r=cw*.048;
        for(let i=0;i<n;i++){
          const px=(i-(n-1)/2)*(cw+gap),bob=Math.sin(t*7+i)*sc.suspension*1.4;
          if(i<n-1){ctx.fillStyle='#34464b';ctx.fillRect(px+cw*.41,-10,gap+cw*.18,22);}
          const body=images.get((i===n-1?'train':'coach')+'-v1.png')!,wheelY=cw*body.ratio*.49;
          for(const pair of [-.31,.31])for(const off of [-.06,.06]){
            const wx=px+(pair+off)*cw;ctx.save();ctx.translate(wx,wheelY);ctx.rotate(t*sc.wheel*6);ctx.fillStyle='#24343b';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b9c3ba';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r*.76,0,Math.PI*2);ctx.moveTo(-r*.6,0);ctx.lineTo(r*.6,0);ctx.moveTo(0,-r*.6);ctx.lineTo(0,r*.6);ctx.stroke();ctx.restore();}
          image(i===n-1?'train':'coach',px,bob,cw);
        }
      }else if(sc.mode==='ship'){
        const puffs=Math.ceil(14*sc.smoke);
        for(let i=0;i<puffs;i++){const age=mod(t*.14+i/puffs,1),px=-bw*(.04+age*.38),py=-bw*(.20+age*.36),w=bw*(.045+age*.12);image('cloud',px,py,w,-.65+Math.sin(i*2.4)*.15,false,sc.smoke*(1-age)*.72);}
        image('ship',0,0,bw);
      }else{
        const asset=images.get('balloon-v1.png')!,h=bw*.75*asset.ratio;image('balloon',0,0,bw*.75);
        if(sc.burner){const pulse=.8+.2*Math.sin(t*9);ctx.fillStyle='#f4bb57';ctx.beginPath();ctx.moveTo(-6,h*.31);ctx.lineTo(0,h*.31-20*sc.burner*pulse);ctx.lineTo(6,h*.31);ctx.closePath();ctx.fill();ctx.fillStyle='#fff2bd';ctx.fillRect(-2,h*.31-9*sc.burner,4,9*sc.burner);}
      }
      ctx.restore();ctx.restore();
      if(sc.mode==='ship'&&sc.wake>0){
        ctx.save();ctx.globalAlpha=sc.opacity*sc.wake;ctx.translate(x,waterline);ctx.scale(flip,1);
        // Fine foam hugs the waterline; a tapered wake trails the stern.
        for(let k=0;k<3;k++){
          ctx.strokeStyle=['#dbe8d7','#7cbdc1','#eff0d6'][k];ctx.lineWidth=[2.3,1.4,1.1][k]*size;ctx.beginPath();
          for(let i=0;i<=70;i++){const px=-bw*.69+i*bw*.016,py=k*3*size+Math.sin((x+flip*px)*.025-t*1.8+k*.4)*sc.waves*2; i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
        }
        for(let k=0;k<5;k++){const age=mod(t*.23+k/5,1),px=-bw*(.43+age*.48),py=5+age*18*size;ctx.globalAlpha=sc.opacity*sc.wake*(1-age)*.6;ctx.strokeStyle='#dbe8d7';ctx.lineWidth=1.5*size;ctx.beginPath();ctx.moveTo(px-bw*.055*age,py);ctx.quadraticCurveTo(px,py-3,px+bw*.07*age,py+1);ctx.stroke();}
        ctx.restore();
      }
      ctx.restore();ctx.globalAlpha=1;ctx.filter='none';

    }
    function dispose(){if(disposed)return;disposed=true;revision++;horseLayer.width=horseLayer.height=1;for(const c of [...horseParts,...horseFar])c.width=c.height=1;horseBody&&(horseBody.width=horseBody.height=1);horseParts=[];horseFar=[];images.clear();pending.clear();for(const c of tints.values())c.width=c.height=1;tints.clear();canvas.width=overlay.width=1;canvas.height=overlay.height=1;}
    const ready=update(scene);return{ready,update,render,dispose,get scene(){return scene;},get loaded(){return loaded;}};
  }
  return {modes,backgrounds,fields,defaults,normalize,fromWords,horsePose,createRenderer};
}
export const TRANSPORT=transportEngine();
export const normalizeTransport=TRANSPORT.normalize;
export const transportMode=(id:string):TMode=>(Object.entries(TRANSPORT.modes).find(([mode,m])=>mode===id||m.id===id)?.[0] as TMode|undefined)??'car';
export const transportFxId=(mode:TMode)=>TRANSPORT.modes[mode].id;
export const isTransportFx=(id:string)=>Object.values(TRANSPORT.modes).some(m=>m.id===id);
export const transportFromWords=(words:string[]=[],effect='vehicle-illustrated-car')=>TRANSPORT.fromWords(words,transportMode(effect));
(globalThis as unknown as {MA_TRANSPORT:typeof TRANSPORT}).MA_TRANSPORT=TRANSPORT;
