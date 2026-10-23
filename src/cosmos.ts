/** Serializable, deterministic illustrated astronomy renderer. No DOM access at module load. */
export type CosmicMode='orbit'|'flyover'|'earthzoom';
export type CosmicBody='gas'|'sun'|'moon'|'earth'|'mars';
export interface CosmicScene{
 version:1;mode:CosmicMode;body:CosmicBody;ratio:'9:16'|'16:9'|'1:1';background:string;
 size:number;speed:number;loop:number;x:number;y:number;angle:number;color:string;tint:number;opacity:number;brightness:number;seed:number;
 spin:number;tilt:number;light:number;ambient:number;float:number;longitude:number;rings:number;ringTilt:number;moons:number;orbitSpeed:number;
 clouds:number;cloudSpeed:number;prominence:number;horizon:number;altitude:number;travel:number;bank:number;curvature:number;
 zoomStart:number;zoomEnd:number;zoomDirection:'in'|'out';focusX:number;focusY:number;stars:number;
}
export interface CosmicField{key:keyof CosmicScene;label:string;min:number;max:number;step:number}
export function cosmicEngine(){
 const modes:Record<CosmicMode,{zh:string;en:string;id:string;no:number;desc:string}>={
  orbit:{zh:'精修天體',en:'Illustrated Celestial Collection',id:'cosmos-illustrated-orbit',no:169,desc:'行星光環、太陽、月球、地球四樣式；球面紋理隨自轉移動，光環與衛星有前後遮擋'},
  flyover:{zh:'精修星球飛越',en:'Illustrated Planet Flyover',id:'cosmos-illustrated-flyover',no:195,desc:'地球、月球、火星、太陽四種地表；細緻地景依透視從地平線迎面掠過'},
  earthzoom:{zh:'精修推近地球',en:'Illustrated Earth Approach',id:'cosmos-illustrated-earthzoom',no:199,desc:'從太空推近自轉地球，可調起訖倍率、聚焦位置與拉遠方向'},
 };
 const bodies:Record<CosmicBody,{zh:string;desc:string}>={gas:{zh:'行星光環',desc:'細緻雲帶與多層環帶'},sun:{zh:'太陽',desc:'光球顆粒與細緻日珥'},moon:{zh:'月球',desc:'隕石坑與月面紋理'},earth:{zh:'地球',desc:'海陸、雲層與衛星'},mars:{zh:'火星',desc:'赤褐岩層與峽谷'}};
 const variants=(mode:CosmicMode):CosmicBody[]=>mode==='orbit'?['gas','sun','moon','earth']:mode==='flyover'?['earth','moon','mars','sun']:['earth'];
 const backgrounds={space:{zh:'深空星際'},nebula:{zh:'靛紫星雲'},dust:{zh:'赤褐塵帶'},night:{zh:'深藍星夜'},paper:{zh:'暖白圖鑑'},transparent:{zh:'透明背景'}};
 const bodyPresets:Record<CosmicBody,Partial<CosmicScene>>={gas:{color:'#c5a77b',rings:1,moons:2,clouds:0,prominence:0,tilt:18},sun:{color:'#ffa328',rings:0,moons:0,clouds:0,prominence:.3,tilt:7},moon:{color:'#aaa69b',rings:0,moons:0,clouds:0,prominence:0,tilt:9},earth:{color:'#3985a3',rings:0,moons:1,clouds:.5,prominence:0,tilt:23},mars:{color:'#bd633a',rings:0,moons:0,clouds:0,prominence:0,tilt:15}};
 const defaults:CosmicScene={version:1,mode:'orbit',body:'gas',ratio:'9:16',background:'space',size:1,speed:1,loop:12,x:.5,y:.5,angle:0,color:'#c5a77b',tint:0,opacity:1,brightness:1,seed:253,spin:4,tilt:18,light:-35,ambient:.25,float:.5,longitude:20,rings:1,ringTilt:25,moons:2,orbitSpeed:.7,clouds:0,cloudSpeed:.7,prominence:0,horizon:.36,altitude:1,travel:1,bank:0,curvature:.12,zoomStart:.65,zoomEnd:3.2,zoomDirection:'in',focusX:.5,focusY:.5,stars:.5};
 const f=(key:keyof CosmicScene,label:string,min:number,max:number,step=.05):CosmicField=>({key,label,min,max,step});
 const fields:Record<CosmicMode,CosmicField[]>={
  orbit:[f('spin','自轉速度',-15,15,.5),f('tilt','地軸傾角',-60,60,1),f('float','漂浮幅度',0,2),f('longitude','起始經度',-180,180,1),f('light','日照方向',-180,180,1),f('ambient','暗面亮度',0,1),f('rings','環帶寬度',0,1.6),f('ringTilt','環帶張角',8,65,1),f('moons','衛星數量',0,3,1),f('orbitSpeed','衛星繞行',0,2),f('clouds','雲層密度',0,1),f('cloudSpeed','雲層流速',0,2),f('prominence','日珥幅度',0,1)],
  flyover:[f('travel','前進速度',0,2),f('horizon','地平線高度',.22,.65,.01),f('altitude','飛行高度',.45,2.5),f('bank','鏡頭傾斜',-15,15,1),f('curvature','地平線弧度',0,.35,.01),f('clouds','低空雲量',0,1),f('cloudSpeed','雲層流速',0,2),f('prominence','日珥幅度',0,1)],
  earthzoom:[f('zoomStart','起始倍率',.3,2.5),f('zoomEnd','結束倍率',1,6),f('focusX','聚焦水平',.1,.9,.01),f('focusY','聚焦垂直',.1,.9,.01),f('spin','自轉速度',-15,15,.5),f('longitude','起始經度',-180,180,1),f('tilt','地軸傾角',-60,60,1),f('light','日照方向',-180,180,1),f('ambient','暗面亮度',0,1),f('clouds','雲層密度',0,1),f('cloudSpeed','雲層流速',0,2),f('moons','衛星數量',0,3,1),f('orbitSpeed','衛星繞行',0,2)],
 };
 const fieldsFor=(scene:CosmicScene)=>fields[scene.mode].filter(f=>!(['rings','ringTilt'].includes(f.key)&&scene.body!=='gas')&&!(['clouds','cloudSpeed'].includes(f.key)&&scene.body!=='earth')&&!(f.key==='prominence'&&scene.body!=='sun')&&!(['light','ambient','moons','orbitSpeed'].includes(f.key)&&scene.body==='sun'));
 const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v)),mod=(v:number,n=1)=>((v%n)+n)%n;
 function normalize(raw:unknown={},fallback:CosmicMode='orbit'):CosmicScene{
  const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
  const mode=Object.hasOwn(modes,String(o.mode))?o.mode as CosmicMode:fallback,body=variants(mode).includes(o.body as CosmicBody)?o.body as CosmicBody:variants(mode)[0];
  const base={...defaults,...bodyPresets[body],mode,body},num=(key:keyof CosmicScene,a:number,b:number)=>typeof o[key]==='number'&&Number.isFinite(o[key])?clamp(o[key] as number,a,b):base[key] as number;
  const speed=typeof o.speed==='number'&&Number.isFinite(o.speed)?clamp(o.speed,.6,2.5):typeof o.loop==='number'&&o.loop>0?clamp(12/o.loop,.6,2.5):1;
  return{version:1,mode,body,ratio:['9:16','16:9','1:1'].includes(String(o.ratio))?o.ratio as CosmicScene['ratio']:'9:16',background:Object.hasOwn(backgrounds,String(o.background))?String(o.background):'space',size:num('size',.35,2),speed,loop:12/speed,x:num('x',-.5,1.5),y:num('y',0,1),angle:num('angle',-180,180),color:typeof o.color==='string'&&/^#[0-9a-f]{6}$/i.test(o.color)?o.color.toLowerCase():base.color,tint:num('tint',0,1),opacity:num('opacity',0,1),brightness:num('brightness',.3,1.5),seed:Math.round(num('seed',0,999999)),spin:num('spin',-15,15),tilt:num('tilt',-60,60),light:num('light',-180,180),ambient:num('ambient',0,1),float:num('float',0,2),longitude:num('longitude',-180,180),rings:num('rings',0,1.6),ringTilt:num('ringTilt',8,65),moons:Math.round(num('moons',0,3)),orbitSpeed:num('orbitSpeed',0,2),clouds:num('clouds',0,1),cloudSpeed:num('cloudSpeed',0,2),prominence:num('prominence',0,1),horizon:num('horizon',.22,.65),altitude:num('altitude',.45,2.5),travel:num('travel',0,2),bank:num('bank',-15,15),curvature:num('curvature',0,.35),zoomStart:num('zoomStart',.3,2.5),zoomEnd:num('zoomEnd',1,6),zoomDirection:o.zoomDirection==='out'?'out':'in',focusX:num('focusX',.1,.9),focusY:num('focusY',.1,.9),stars:num('stars',0,2)};
 }
 function fromWords(words:string[]=[],fallback:CosmicMode='orbit'){try{return normalize(JSON.parse(words.find(w=>w.trim().startsWith('{'))||'{}'),fallback);}catch{return normalize({},fallback);}}
 const assetPath=(name:string)=>name==='earth-terrain'?'/media/cosmos-illustrated/earth-terrain-v2.png':name==='cloud'?'/media/transport-illustrated/cloud-v1.png':['nebula','dust'].includes(name)?'/media/nature-illustrated/'+name+'-v1.png':'/media/cosmos-illustrated/'+name+'-v1.png';
 function createRenderer(canvas:HTMLCanvasElement,overlay:HTMLCanvasElement,initial:unknown,origin:string){
  const ctx=canvas.getContext('2d')!,top=overlay.getContext('2d')!;let scene=normalize(initial),loaded=false,disposed=false,revision=0,key='';
  const assets=new Map<string,HTMLImageElement>(),pending=new Map<string,Promise<HTMLImageElement>>();
  const cv=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  type Material={canvas:HTMLCanvasElement;data:Uint8ClampedArray;width:number;height:number};
  type GroundMap={width:number;height:number;levels:Map<string,{canvas:HTMLCanvasElement;pattern:CanvasPattern}>};
  const terrain=cv(1,1),terrainCtx=terrain.getContext('2d')!;
  const materials=new Map<string,Material>(),floors=new Map<string,GroundMap>();let cloudData:Uint8ClampedArray|undefined;
  function load(name:string){if(assets.has(name))return Promise.resolve(assets.get(name)!);if(pending.has(name))return pending.get(name)!;const p=new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>{if(!disposed)assets.set(name,i);resolve(i);};i.onerror=()=>reject(Error('精修星球素材載入失敗，請確認網路後重試'));i.src=origin.replace(/\/$/,'')+assetPath(name);});pending.set(name,p);p.catch(()=>pending.delete(name));return p;}
  function update(raw:unknown){scene=normalize(raw);const names=[scene.body==='gas'?'gas':scene.body==='earth'?(scene.mode==='flyover'?'earth-terrain':'earth'):'surfaces',...(scene.mode!=='flyover'&&scene.moons>0?['surfaces']:[]),...(['space','nebula','dust'].includes(scene.background)?[scene.background]:[]),...(scene.body==='earth'&&scene.clouds>0?[scene.mode==='flyover'?'cloud':'cloudmap']:[])];if(scene.mode==='flyover'&&scene.body==='moon')names.push('earth');const next=[...new Set(names)].join('/');if(loaded&&key===next)return Promise.resolve(true);const token=++revision;loaded=false;return Promise.all([...new Set(names)].map(load)).then(()=>{if(disposed||token!==revision)return false;key=next;loaded=true;return true;});}
  function material(body:CosmicBody,ground=false):Material{
   const k=body+'/'+ground+'/'+scene.tint+'/'+scene.color;if(materials.has(k))return materials.get(k)!;
   const name=body==='gas'?'gas':body==='earth'?(ground?'earth-terrain':'earth'):'surfaces',i=assets.get(name)!,width=1024,height=ground?1024:512,c=cv(width,height),x=c.getContext('2d',{willReadFrequently:true})!;
   if(name==='surfaces'){const n={earth:0,moon:1,mars:2,sun:3,gas:0}[body],w=i.naturalWidth/2,h=i.naturalHeight/2;x.drawImage(i,n%2*w,Math.floor(n/2)*h,w,h,0,0,width,height);}else x.drawImage(i,0,0,width,height);
   const p=x.getImageData(0,0,width,height),d=p.data;if(scene.tint>0){const rgb=[1,3,5].map(n=>parseInt(scene.color.slice(n,n+2),16)),mx=Math.max(...rgb)||1;for(let j=0;j<d.length;j+=4){const v=Math.max(d[j],d[j+1],d[j+2]);for(let z=0;z<3;z++)d[j+z]=d[j+z]*(1-scene.tint)+v*(rgb[z]/mx)*scene.tint;}x.putImageData(p,0,0);}
   const m={canvas:c,data:d,width,height};materials.set(k,m);if(materials.size>10){const old=materials.keys().next().value!;materials.get(old)!.canvas.width=1;materials.delete(old);}return m;
  }
  function floor(body:CosmicBody):GroundMap{
   const key=body+'/'+scene.tint+'/'+scene.color;if(floors.has(key))return floors.get(key)!;
   const m=material(body,true),c=cv(m.width*2,m.height*2),x=c.getContext('2d')!;
   // Mirrored repeat joins tile edges without distorting the square ground material.
   for(let y=0;y<2;y++)for(let xx=0;xx<2;xx++){x.save();x.translate(xx?c.width:0,y?c.height:0);x.scale(xx?-1:1,y?-1:1);x.drawImage(m.canvas,0,0);x.restore();}
   const map:GroundMap={width:c.width,height:c.height,levels:new Map([['0/0',{canvas:c,pattern:terrainCtx.createPattern(c,'repeat')!}]])};
   floors.set(key,map);if(floors.size>2){const old=floors.keys().next().value!;for(const level of floors.get(old)!.levels.values())level.canvas.width=1;floors.delete(old);}return map;
  }
  function groundLevel(map:GroundMap,lx:number,ly:number):{canvas:HTMLCanvasElement;pattern:CanvasPattern}{
   const key=lx+'/'+ly,cached=map.levels.get(key);if(cached)return cached;
   const parent=groundLevel(map,lx>0?lx-1:0,lx>0?ly:ly-1),c=cv(map.width/2**lx,map.height/2**ly),x=c.getContext('2d')!;
   x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(parent.canvas,0,0,c.width,c.height);
   const level={canvas:c,pattern:terrainCtx.createPattern(c,'repeat')!};map.levels.set(key,level);return level;
  }
  function groundFrame(t:number,W:number,H:number,Q:number,hy:number,curve:number){
   const s=scene,map=floor(s.body),width=Math.ceil(W*1.7*Q),height=Math.ceil(H*1.4*Q);
   if(terrain.width!==width||terrain.height!==height){terrain.width=width;terrain.height=height;}
   terrainCtx.setTransform(1,0,0,1,0,0);terrainCtx.clearRect(0,0,width,height);
   terrainCtx.setTransform(Q,0,0,Q,W*.35*Q,0);
   const step=1/Q,k=2.25/H/s.altitude*s.size,forward=t*s.travel*150+rand(1)*800+s.y*300,matrix=new DOMMatrix();
   for(let yy=Math.floor((hy-curve)*Q)/Q;yy<height/Q;yy+=step){
    const scale0=Math.max(.0001,(yy-hy+curve*.25)*k),scale1=Math.max(.0001,(yy+step-hy+curve*.25)*k),scale=(scale0+scale1)*.5;
    const v0=forward+700/scale0,v1=forward+700/scale1,span=v1-v0;
    // The vertical texture footprint is the inverse-perspective depth difference,
    // not the horizontal scale. Filter that footprint before it reaches the horizon.
    const lodX=Math.min(Math.log2(map.width),Math.max(0,Math.log2(1/(Q*scale)))),lodY=Math.min(Math.log2(map.height),Math.max(0,Math.log2(Math.max(1,Math.abs(span)))));
    const lx=Math.floor(lodX),ly=Math.floor(lodY),mixX=lodX-lx,mixY=lodY-ly;let weightSum=0;
    const paint=(ix:number,iy:number,weight:number)=>{
     if(weight===0)return;weightSum+=weight;
     const level=groundLevel(map,ix,iy),factorX=map.width/level.canvas.width,factorY=map.height/level.canvas.height;
     matrix.a=scale*factorX;matrix.d=span?step/span*factorY:1;matrix.e=W/2-(map.width*(s.body==='earth'?.25:.5)+s.x*500)*scale;matrix.f=yy-v0/factorY*matrix.d;
     level.pattern.setTransform(matrix);terrainCtx.fillStyle=level.pattern;terrainCtx.globalAlpha=weight/weightSum;terrainCtx.fillRect(-W*.35,yy,W*1.7,step);
    };
    // Independent horizontal/vertical levels preserve coastline detail while
    // averaging compressed depth; blend transitions instead of drawing LOD bands.
    paint(lx,ly,(1-mixX)*(1-mixY));paint(lx+1,ly,mixX*(1-mixY));paint(lx,ly+1,(1-mixX)*mixY);paint(lx+1,ly+1,mixX*mixY);
   }
   terrainCtx.globalAlpha=1;return terrain;
  }
  // A bounded spherical terrain patch avoids tiled coastlines in the Earth flyover.
  // Keep the filtered Canvas path for browsers without WebGL or after context loss.
  type EarthView={canvas:HTMLCanvasElement;gl:WebGLRenderingContext;program:WebGLProgram;texture:WebGLTexture;buffer:WebGLBuffer;materialKey:string;uniforms:Record<string,WebGLUniformLocation|null>};
  let earthView:EarthView|null|undefined;
  function earthFrame(t:number,W:number,H:number,Q:number){
   if(earthView===null)return;
   if(earthView===undefined){
    const c=cv(1,1),gl=c.getContext('webgl',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true});
    if(!gl){earthView=null;return;}
    const shader=(type:number,source:string)=>{const s=gl.createShader(type)!;gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;};
    const vertex=shader(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}');
    const fragment=shader(gl.FRAGMENT_SHADER,`precision highp float;
     varying vec2 uv;uniform sampler2D surface;uniform vec2 screen,extent;uniform float left;
     uniform vec4 camera;uniform vec3 up,right,back;uniform vec2 patch;
     void main(){
      vec2 pixel=vec2(left+uv.x*extent.x,(1.-uv.y)*extent.y);
      vec2 ray=(vec2(pixel.x/screen.x-.5,.5-pixel.y/screen.y))*2.*camera.x;
      ray.x*=screen.x/screen.y;
      float cp=cos(camera.y),sp=sin(camera.y);
      vec3 d=vec3(ray.x,ray.y*cp-sp,-ray.y*sp-cp);
      float a=dot(d,d),b=camera.z*d.y,disc=b*b-a*(camera.z*camera.z-camera.w*camera.w);
      if(disc<0.){gl_FragColor=vec4(0.);return;}
      float distance=(-b-sqrt(disc))/a;
      if(distance<0.){gl_FragColor=vec4(0.);return;}
      vec3 n=normalize(vec3(0.,camera.z,0.)+distance*d);
      vec3 world=normalize(n.x*right+n.y*up+n.z*back);
      vec2 tex=vec2(.5+atan(world.x,world.z)/6.28318530718,.5-asin(clamp(world.y,-1.,1.))/3.14159265359);
      tex=(tex-patch)/vec2(.025,.05)+.5;
      gl_FragColor=vec4(texture2D(surface,tex).rgb,1.);
     }`);
    if(!vertex||!fragment){if(vertex)gl.deleteShader(vertex);if(fragment)gl.deleteShader(fragment);earthView=null;return;}
    const program=gl.createProgram()!;gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);earthView=null;return;}
    const buffer=gl.createBuffer()!,texture=gl.createTexture()!,uniforms:Record<string,WebGLUniformLocation|null>={};
    for(const name of ['surface','screen','extent','left','camera','up','right','back','patch'])uniforms[name]=gl.getUniformLocation(program,name);
    gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const anisotropy=gl.getExtension('EXT_texture_filter_anisotropic');if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    gl.uniform1i(uniforms.surface,0);earthView={canvas:c,gl,program,texture,buffer,uniforms,materialKey:''};
   }
   const s=scene,{canvas:c,gl,program,texture,uniforms}=earthView;
   if(gl.isContextLost())return;
   const pad=s.bank===0?0:W*.35,extra=s.bank===0?H:H*1.4;
   const width=Math.ceil((W+pad*2)*Q),height=Math.ceil(extra*Q);if(c.width!==width||c.height!==height){c.width=width;c.height=height;}
   gl.viewport(0,0,width,height);gl.useProgram(program);gl.bindTexture(gl.TEXTURE_2D,texture);
   const key=s.tint+'/'+s.color;if(earthView.materialKey!==key){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,material('earth',true).canvas);gl.generateMipmap(gl.TEXTURE_2D);earthView.materialKey=key;}
   const radius=.12/Math.max(.01,s.curvature),altitude=.018*s.altitude,tanFov=.65/s.size;
   const pitch=Math.acos(radius/(radius+altitude))+Math.atan((.5-s.horizon)*2*tanFov);
   const lat=.42+(s.y-.5)*.08,lon=1.9+(s.x-.5)*.08+t*s.travel*.003,cl=Math.cos(lat),sl=Math.sin(lat),co=Math.cos(lon),so=Math.sin(lon);
   gl.uniform2f(uniforms.screen,W,H);gl.uniform2f(uniforms.extent,W+pad*2,extra);gl.uniform1f(uniforms.left,-pad);gl.uniform4f(uniforms.camera,tanFov,pitch,radius+altitude,radius);
   gl.uniform2f(uniforms.patch,.5+(1.94+6*s.travel*.003)/(Math.PI*2),.5-.42/Math.PI);
   gl.uniform3f(uniforms.up,cl*so,sl,cl*co);gl.uniform3f(uniforms.right,sl*so,-cl,sl*co);gl.uniform3f(uniforms.back,-co,0,so);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return{canvas:c,left:-pad,width:W+pad*2,height:extra};
  }
  type GlobeGrid={canvas:HTMLCanvasElement;geometry:Float32Array;pixels:ImageData};
  const grids=new Map<number,GlobeGrid>();
  function globe(body:CosmicBody,diameter:number,t:number,quality:number){
   const n=Math.max(64,Math.min(720,Math.ceil(diameter*quality/32)*32));
   let grid=grids.get(n);
   if(!grid){const sphere=cv(n,n),pixels=sphere.getContext('2d')!.createImageData(n,n),geometry=new Float32Array(n*n*5);for(let yy=0;yy<n;yy++)for(let xx=0;xx<n;xx++){const nx=(xx+.5)/n*2-1,ny=(yy+.5)/n*2-1,r=nx*nx+ny*ny,j=(yy*n+xx)*5;if(r<=1){const nz=Math.sqrt(1-r);geometry[j]=nx;geometry[j+1]=ny;geometry[j+2]=nz;geometry[j+3]=Math.atan2(nx,nz)/(Math.PI*2)+.5;geometry[j+4]=Math.asin(ny)/Math.PI+.5;}}grid={canvas:sphere,geometry,pixels};grids.set(n,grid);if(grids.size>6){const old=grids.keys().next().value!;grids.get(old)!.canvas.width=1;grids.delete(old);}}
   const {canvas:sphere,geometry,pixels:spherePixels}=grid;
   if(body==='earth'&&scene.body==='earth'&&scene.clouds>0&&!cloudData){const c=cv(1024,512),x=c.getContext('2d')!;x.drawImage(assets.get('cloudmap')!,0,0,1024,512);cloudData=x.getImageData(0,0,1024,512).data;c.width=1;}
   const m=material(body),d=spherePixels.data,shift=(scene.longitude+t*scene.spin)/360,la=scene.light*Math.PI/180,lx=Math.sin(la)*.9,ly=-.3,lz=Math.cos(la)*.9;
   for(let j=0,p=0;j<geometry.length;j+=5,p+=4){const nz=geometry[j+2];if(!nz){d[p+3]=0;continue;}const u=mod(geometry[j+3]+shift),v=geometry[j+4],src=(Math.floor(v*(m.height-1))*m.width+Math.floor(u*(m.width-1)))*4;
    const illum=body==='sun'?1:scene.ambient+(1-scene.ambient)*Math.max(0,geometry[j]*lx+geometry[j+1]*ly+nz*lz);
    let cloud=0;if(body==='earth'&&scene.body==='earth'&&scene.clouds>0){const cu=mod(u+t*scene.cloudSpeed*.003),ci=(Math.floor(v*511)*1024+Math.floor(cu*1023))*4;cloud=cloudData![ci]/255*scene.clouds;}
    for(let z=0;z<3;z++)d[p+z]=(m.data[src+z]*(1-cloud)+[238,240,231][z]*cloud)*illum;d[p+3]=255*clamp(nz*n*.7);
   }sphere.getContext('2d')!.putImageData(spherePixels,0,0);return sphere;
  }
  const rand=(i:number,k=0)=>{let n=(scene.seed+Math.imul(i+1,374761393)+Math.imul(k+1,668265263))>>>0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;};
  function render(time:number,width=canvas.width,height=canvas.height){
   if(disposed||!loaded)return;if(canvas.width!==width||canvas.height!==height){canvas.width=overlay.width=width;canvas.height=overlay.height=height;}const s=scene,t=clamp(Number(time)||0,0,s.loop)*s.speed,W=1080,H=1080*height/width,Q=width/W;
   ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);top.clearRect(0,0,overlay.width,overlay.height);ctx.save();ctx.scale(Q,Q);
   if(s.background!=='transparent'){const i=assets.get(s.background);if(i){const k=Math.max(W/i.naturalWidth,H/i.naturalHeight)*1.03;ctx.save();ctx.filter=`brightness(${s.brightness})`;ctx.drawImage(i,(W-i.naturalWidth*k)/2,(H-i.naturalHeight*k)/2,i.naturalWidth*k,i.naturalHeight*k);ctx.restore();}else{ctx.fillStyle=s.background==='paper'?'#eee7d4':'#071321';ctx.fillRect(0,0,W,H);}}
   if(s.background!=='transparent')for(let j=0;j<Math.round(s.stars*140);j++){ctx.fillStyle=s.background==='paper'?'#5d615e':'#e9e9d8';ctx.globalAlpha=.3+rand(j,2)*.55;const z=1+rand(j,3)*2;ctx.fillRect(rand(j)*W,rand(j,1)*H,z,z);}ctx.globalAlpha=s.opacity;
   function disk(body:CosmicBody,x:number,y:number,d:number,phase=t){ctx.save();ctx.translate(x,y);ctx.rotate(s.tilt*Math.PI/180);ctx.drawImage(globe(body,d,phase,Q),-d/2,-d/2,d,d);ctx.restore();}
   function prominence(x:number,y:number,r:number,ground=false){if(s.prominence===0)return;ctx.save();ctx.translate(x,y);ctx.strokeStyle='#ffb640';for(let j=0;j<9;j++){const a=j/9*Math.PI*2+rand(j)*.2,amp=r*(.035+s.prominence*.13)*(.75+.25*Math.sin(t*1.5+j));ctx.save();if(!ground)ctx.rotate(a);else ctx.translate((j/8-.5)*W*.9,0);ctx.lineWidth=1.5+rand(j,4)*2;ctx.beginPath();ctx.moveTo(-r*.05,ground?0:-r*.98);ctx.bezierCurveTo(-amp,ground?-amp:-r-amp,amp,ground?-amp:-r-amp,r*.05,ground?0:-r*.98);ctx.stroke();ctx.restore();}ctx.restore();}
   if(s.mode==='flyover'){
    ctx.save();ctx.translate(W/2,H/2);ctx.rotate(s.bank*Math.PI/180);ctx.translate(-W/2,-H/2);const hy=H*s.horizon,curve=W*s.curvature;
    // A distant Earth rises above the lunar horizon. It shares the same scene timeline.
    if(s.body==='moon')disk('earth',W*.76,hy-H*.12,Math.min(W,H)*.13,t*.4);
    if(s.body==='sun')prominence(W/2,hy,W*.23,true);
    const earth=s.body==='earth'?earthFrame(t,W,H,Q):undefined;
    if(earth)ctx.drawImage(earth.canvas,earth.left,0,earth.width,earth.height);
    else{ctx.save();ctx.beginPath();ctx.moveTo(-W*.35,hy+curve*.65);ctx.quadraticCurveTo(W/2,hy-curve*.65,W*1.35,hy+curve*.65);ctx.lineTo(W*1.35,H*1.4);ctx.lineTo(-W*.35,H*1.4);ctx.closePath();ctx.clip();
     const ground=groundFrame(t,W,H,Q,hy,curve);ctx.drawImage(ground,-W*.35,0,ground.width/Q,ground.height/Q);ctx.restore();}
    if(s.body==='earth'&&s.clouds>0){const cloud=assets.get('cloud')!;for(let j=0;j<Math.round(s.clouds*10);j++){const phase=mod(rand(j)+t*.045*s.cloudSpeed),depth=.15+phase*phase,z=100+depth*430,x=W/2+(rand(j,1)-.5)*W*2.2*depth,y=hy+depth*H*.68;ctx.globalAlpha=s.opacity*(.35+.35*phase);ctx.drawImage(cloud,x-z/2,y,z,z*cloud.naturalHeight/cloud.naturalWidth);}}
    ctx.restore();
   }else{
    let progress=t/12;if(s.zoomDirection==='out')progress=1-progress;const eased=progress*progress*(3-2*progress),zoom=s.mode==='earthzoom'?s.zoomStart+(s.zoomEnd-s.zoomStart)*eased:1;
    const d=Math.min(W*(s.body==='gas'?.43:.66),H*.43)*s.size*zoom,x=s.x*W+(s.mode==='earthzoom'?(.5-s.focusX)*d:0),y=s.y*H+(s.mode==='earthzoom'?(.5-s.focusY)*d:Math.sin(t*.7)*s.float*16);
    ctx.save();ctx.translate(x,y);ctx.rotate(s.angle*Math.PI/180);
    const rings=(front:boolean)=>{if(s.body!=='gas'||s.rings===0)return;ctx.save();ctx.rotate(s.tilt*Math.PI/180);for(let j=0;j<100;j++){const r=d*(.64+j/100*.5*s.rings),ry=r*Math.sin(s.ringTilt*Math.PI/180);ctx.strokeStyle=['#c8b18d','#746e66','#d9c6a3','#a18d70','#e4d4b1'][j%5];ctx.globalAlpha=s.opacity*(.5+rand(j)*.4);ctx.lineWidth=Math.max(.7,d*.005);ctx.beginPath();ctx.ellipse(0,0,r,ry,0,front?0:Math.PI,front?Math.PI:Math.PI*2);ctx.stroke();}ctx.restore();};
    const satellites=(front:boolean)=>{for(let j=0;j<s.moons;j++){const a=t*.2*s.orbitSpeed+j*2.4+rand(j)*2,z=Math.sin(a);if((z>=0)!==front)continue;const rx=d*(.76+j*.14),mx=Math.cos(a)*rx,my=z*d*.22;disk('moon',mx,my,d*(.045+j*.012)*(1+z*.1),t*.5);}};
    satellites(false);rings(false);if(s.body==='sun')prominence(0,0,d/2);disk(s.body,0,0,d);rings(true);satellites(true);ctx.restore();
   }
   ctx.restore();ctx.globalAlpha=1;
  }
  function dispose(){if(disposed)return;disposed=true;revision++;assets.clear();pending.clear();for(const m of materials.values())m.canvas.width=1;materials.clear();for(const map of floors.values())for(const level of map.levels.values())level.canvas.width=1;floors.clear();terrain.width=terrain.height=1;if(earthView){const {gl,program,buffer,texture,canvas}=earthView;gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();canvas.width=canvas.height=1;earthView=null;}for(const grid of grids.values())grid.canvas.width=1;grids.clear();cloudData=undefined;canvas.width=canvas.height=overlay.width=overlay.height=1;}
  const ready=update(initial);return{ready,update,render,dispose,get scene(){return scene;},get loaded(){return loaded;}};
 }
 return{modes,bodies,variants,backgrounds,bodyPresets,defaults,fields,fieldsFor,normalize,fromWords,createRenderer};
}
export const COSMOS=cosmicEngine();
export const normalizeCosmos=COSMOS.normalize;
export const cosmicMode=(id:string):CosmicMode=>(Object.entries(COSMOS.modes).find(([mode,m])=>mode===id||m.id===id)?.[0] as CosmicMode|undefined)??'orbit';
export const cosmicFxId=(mode:CosmicMode)=>COSMOS.modes[mode].id;
export const isCosmicFx=(id:string)=>Object.values(COSMOS.modes).some(m=>m.id===id);
export const cosmicFromWords=(words:string[]=[],effect='cosmos-illustrated-orbit')=>COSMOS.fromWords(words,cosmicMode(effect));
(globalThis as unknown as{MA_COSMOS:typeof COSMOS}).MA_COSMOS=COSMOS;
