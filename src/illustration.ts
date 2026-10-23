/** Shared, serializable refined ocean engine; safe to import in Pages Functions. */
export type IMode = 'fish'|'dolphins'|'whale'|'shark'|'coral'|'deep'|'submarine';
export interface IScene {
  version: 1; mode: IMode; ratio: '9:16'|'16:9'|'1:1'; animal: 'humpback'|'sperm'|'shark'|'squid'|'monster';
  background: 'reef'|'blue'|'trench'|'wreck'|'cave'|'transparent';
  size: number; speed: number; loop: number; x: number; y: number; angle: number;
  direction: 'right'|'left'; path: 'pass'|'hover'; color: string; tint: number;
  motion: number; particles: number; current: number; camera: number; opacity: number; brightness: number; seed: number;
  count: number; spread: number; formation: 'wave'|'line'|'orbit'|'v'; depth: number; arc: number;
  strike: number; rush: number; exit: 'pass'|'cover'; shake: number;
  descent: number; darkness: number; beam: number; beamWidth: number; propeller: number; bubbles: number;
}
export interface IField { key: keyof IScene; label: string; min: number; max: number; step: number }

export function illustrationEngine() {
  const modes: Record<IMode,{zh:string;id:string;no:number;desc:string}> = {
    fish:{zh:'魚群穿梭',id:'ocean-illustrated-fish',no:224,desc:'精細魚鱗與鰭條，兩種魚交錯成群；調數量、隊形、疏密與遠近'},
    dolphins:{zh:'海豚同行',id:'ocean-illustrated-dolphins',no:225,desc:'細緻海豚成隊前進，各自擺尾、起伏；調隊伍與游動弧度'},
    whale:{zh:'海洋巨物',id:'whale-illustrated',no:200,desc:'座頭鯨、抹香鯨、大白鯊、巨大烏賊與原創海怪；調巨物與掠過方式'},
    shark:{zh:'鯊魚迎面衝刺',id:'ocean-illustrated-shark',no:226,desc:'正面巨鯊巡游後加速衝近；調衝刺時機、力度與擦身／遮滿收尾'},
    coral:{zh:'珊瑚花園',id:'ocean-illustrated-coral',no:227,desc:'枝狀珊瑚、海扇與海綿形成精細前景；調群落疏密與水流擺動'},
    deep:{zh:'深海下潛',id:'ocean-illustrated-deep',no:228,desc:'深海岩壁分層向上掠過；調下潛速度、岩柱、遠近與深暗程度'},
    submarine:{zh:'潛水艇探索',id:'ocean-illustrated-submarine',no:229,desc:'精細艇身、旋轉螺旋槳與氣泡拖尾；調探照燈、航行與起伏'},
  };
  const animals = {
    humpback: { zh: '座頭鯨', file: 'whale-v1.png', mode: 0 },
    sperm: { zh: '抹香鯨', file: 'sperm-v1.png', mode: 1 },
    shark: { zh: '大白鯊', file: 'shark-v1.png', mode: 2 },
    squid: { zh: '巨大烏賊', file: 'squid-v1.png', mode: 3 },
    monster: { zh: '原創海怪', file: 'monster-v1.png', mode: 4 },
  };
  const sprites = {
    fish:{file:'fish-v1.png',mode:5},fish2:{file:'fish2-v1.png',mode:5},dolphins:{file:'dolphin-v1.png',mode:6},
    shark:{file:'shark-front-v1.png',mode:7},coral:{file:'coral-v1.png',mode:8},submarine:{file:'submarine-v1.png',mode:9},deep:{file:'rock-v1.png',mode:10},
  };
  const backgrounds = {
    reef: { zh: '珊瑚礁', file: 'ocean-v1.png' }, blue: { zh: '開闊藍海', file: 'blue-v1.png' },
    trench: { zh: '深海海溝', file: 'trench-v1.png' }, wreck: { zh: '沉船遺址', file: 'wreck-v1.png' },
    cave: { zh: '海底洞穴', file: 'cave-v1.png' }, transparent: { zh: '透明背景', file: '' },
  };
  const defaults: IScene = { version:1,mode:'whale',ratio:'9:16',animal:'humpback',background:'reef',size:1,speed:1,loop:12,x:.5,y:.5,angle:0,direction:'right',path:'pass',color:'#248caa',tint:0,motion:1,particles:1,current:1,camera:1,opacity:1,brightness:1,seed:194190,count:24,spread:1,formation:'wave',depth:.6,arc:1,strike:.45,rush:1,exit:'pass',shake:.25,descent:1,darkness:.4,beam:1,beamWidth:28,propeller:1,bubbles:1 };
  const presets: Record<IMode,Partial<IScene>>={
    whale:{},fish:{size:.8,count:24,path:'pass',background:'reef',camera:.5},
    dolphins:{size:.85,count:5,spread:1,formation:'v',path:'pass',background:'blue',camera:.5},
    shark:{background:'blue',size:1,path:'pass',camera:.4},
    coral:{count:8,size:1,spread:1,path:'hover',current:.7,camera:.6},
    deep:{count:6,background:'trench',path:'hover',camera:1,particles:1.2},
    submarine:{size:1,path:'hover',background:'wreck',camera:.7,particles:.6},
  };
  const field=(key:keyof IScene,label:string,min:number,max:number,step=.05):IField=>({key,label,min,max,step});
  const fields: Record<IMode,IField[]>={
    whale:[],fish:[field('count','魚群數量',2,48,1),field('spread','隊形疏密',.3,1.8),field('depth','遠近層次',0,1),field('arc','游動弧度',0,2)],
    dolphins:[field('count','海豚數量',2,12,1),field('spread','隊伍間距',.3,1.8),field('arc','起伏幅度',0,2),field('depth','遠近層次',0,1)],
    shark:[field('strike','衝刺起點',.15,.85),field('rush','衝刺力度',.5,2),field('shake','近身震動',0,1)],
    coral:[field('count','珊瑚群落',3,14,1),field('spread','群落間距',.3,1.8),field('depth','前後層次',0,1)],
    deep:[field('descent','下潛速度',0,2),field('count','前景岩柱',3,10,1),field('depth','岩壁視差',0,1),field('darkness','深暗程度',0,1)],
    submarine:[field('arc','航行起伏',0,2),field('beam','探照燈強度',0,1),field('beamWidth','光束角度',8,50,1),field('propeller','螺旋槳速度',0,2),field('bubbles','氣泡拖尾',0,1)],
  };
  const clamp=(v:number,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));
  const modeOf=(v:unknown,fallback:IMode='whale'):IMode=>Object.hasOwn(modes,String(v))?v as IMode:fallback;
  function normalize(raw: unknown={}, fallback:IMode='whale'): IScene {
    const incoming=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
    // Migrate old object-studio scenes while retaining their chosen settings.
    const old=incoming.module==='ocean',p=old&&incoming.params&&typeof incoming.params==='object'?incoming.params as Record<string,unknown>:{};
    const mode=modeOf(incoming.mode??p.mode,fallback),base={...defaults,...presets[mode],mode};
    const o:Record<string,unknown>=old?{...incoming,...p,background:incoming.bg==='transparent'||p.scene===0?'transparent':base.background,tint:p.color? .7:0,path:p.route==='orbit'?'hover':base.path,formation:p.route==='straight'?'line':p.route==='orbit'?'orbit':'wave',particles:p.bubbles??1}:incoming;
    const num=(key:keyof IScene,lo:number,hi:number)=>typeof o[key]==='number'&&Number.isFinite(o[key])?clamp(o[key] as number,lo,hi):base[key] as number;
    const speed=!old&&typeof o.speed==='number'&&Number.isFinite(o.speed)?clamp(o.speed,.6,2.5):typeof o.loop==='number'&&Number.isFinite(o.loop)&&o.loop>0?clamp(12/o.loop,.6,2.5):old&&typeof p.speed==='number'?clamp(p.speed,.6,2.5):1;
    const maxCount=mode==='dolphins'?12:mode==='coral'?14:mode==='deep'?10:48;
    return {version:1,mode,ratio:['9:16','16:9','1:1'].includes(String(o.ratio))?o.ratio as IScene['ratio']:'9:16',
      animal:Object.hasOwn(animals,String(o.animal))?o.animal as IScene['animal']:'humpback',
      background:Object.hasOwn(backgrounds,String(o.background))?o.background as IScene['background']:base.background,
      size:num('size',.4,2.2),speed,loop:12/speed,x:num('x',-.5,1.5),y:num('y',0,1),angle:num('angle',-60,60),
      direction:o.direction==='left'?'left':'right',path:o.path==='hover'?'hover':o.path==='pass'?'pass':base.path,
      color:typeof o.color==='string'&&/^#[0-9a-f]{6}$/i.test(o.color)?o.color.toLowerCase():base.color,tint:num('tint',0,1),
      motion:num('motion',0,1.6),particles:num('particles',0,1.5),current:num('current',0,2),camera:num('camera',0,1.5),opacity:num('opacity',0,1),brightness:num('brightness',.3,1.5),seed:Math.round(num('seed',0,999999)),
      count:Math.round(num('count',2,maxCount)),spread:num('spread',.3,1.8),formation:['wave','line','orbit','v'].includes(String(o.formation))?o.formation as IScene['formation']:base.formation,depth:num('depth',0,1),arc:num('arc',0,2),
      strike:num('strike',.15,.85),rush:num('rush',.5,2),exit:o.exit==='cover'?'cover':'pass',shake:num('shake',0,1),descent:num('descent',0,2),darkness:num('darkness',0,1),beam:num('beam',0,1),beamWidth:num('beamWidth',8,50),propeller:num('propeller',0,2),bubbles:num('bubbles',0,1),
    };
  }
  function fromWords(words:string[]=[],fallback:IMode='whale'):IScene {
    try{return normalize(JSON.parse(words.find(w=>w.trim().startsWith('{'))||'{}'),fallback);}catch{return normalize({},fallback);}
  }
  const poses=[[0,-.55,.485,.58,-.12,.82],[2,-.08,.462,.83,-.14,.88],[4,.24,.432,1.08,-.16,.96],[6,.43,.422,1.34,-.18,1],[8,.88,.405,1.69,-.20,1],[10,1.62,.378,1.92,-.18,1],[12,2.55,.36,2.02,-.13,1]];
  function poseAt(t:number){
    let i=0;while(i<poses.length-2&&t>poses[i+1][0])i++;
    const a=poses[i],b=poses[i+1],before=poses[Math.max(0,i-1)],after=poses[Math.min(poses.length-1,i+2)],dt=b[0]-a[0],p=(t-a[0])/dt,p2=p*p,p3=p2*p;
    return a.slice(1).map((v,k)=>{const c=k+1,m0=(b[c]-before[c])/(b[0]-before[0]),m1=(after[c]-a[c])/(after[0]-a[0]);return(2*p3-3*p2+1)*v+(p3-2*p2+p)*dt*m0+(-2*p3+3*p2)*b[c]+(p3-p2)*dt*m1;});
  }
  function createRenderer(canvas:HTMLCanvasElement,particles:HTMLCanvasElement,initial:unknown,origin:string){
    let scene=normalize(initial),disposed=false,loaded=false,request=0,assetKey='';
    const context=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,preserveDrawingBuffer:true});
    if(!context)throw new Error('瀏覽器無法啟動 WebGL，請改用支援 WebGL 的瀏覽器。');
    const gl:WebGLRenderingContext=context,ctx=particles.getContext('2d')!;
    const shaders:WebGLShader[]=[];
    const compile=(type:number,source:string)=>{const s=gl.createShader(type)!;shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'無法建立動畫著色器');return s;};
    const vertex=`attribute vec2 a_position;uniform vec4 u_rect;varying vec2 v_uv;void main(){v_uv=u_rect.xy+a_position*u_rect.zw;gl_Position=vec4(v_uv.x*2.-1.,1.-v_uv.y*2.,0.,1.);}`;
    const fragment=`precision highp float;
      varying vec2 v_uv;uniform sampler2D u_ocean,u_whale;
      uniform float u_time,u_opacity,u_motion,u_aspect,u_flip,u_mode,u_camera,u_transparent,u_brightness,u_tint,u_fade,u_layer,u_current,u_bgzoom;
      uniform vec3 u_color;uniform vec4 u_pose;uniform vec2 u_span,u_bgshift,u_jitter;
      vec3 rgb2hsv(vec3 c){vec4 K=vec4(0.,-1./3.,2./3.,-1.);vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));float d=q.x-min(q.w,q.y);return vec3(abs(q.z+(q.w-q.y)/(6.*d+.000001)),d/(q.x+.000001),q.x);}
      vec3 hsv2rgb(vec3 c){vec3 p=abs(fract(c.xxx+vec3(0.,2./3.,1./3.))*6.-3.);return c.z*mix(vec3(1.),clamp(p-1.,0.,1.),c.y);}
      void main(){
        vec2 screen=(v_uv-.5)*u_span+.5;
        float pan=(1.-cos(3.14159265*clamp((u_time-.5)/11.5,0.,1.)))/2.;
        screen=(screen-.5)/(1.+.025*pan*u_camera)+.5;screen.x+=.0065*pan*u_camera;screen+=u_jitter;
        if(u_layer<.5){
          if(u_transparent>.5){gl_FragColor=vec4(0.);return;}
          float nearLayer=smoothstep(.56,1.,screen.y);vec2 camera=vec2(sin(u_time*.14)*.008,-u_time*.0015)*u_camera;
          vec2 uv=(screen-.5)/u_bgzoom+.5+camera*(.6+nearLayer*1.1)+u_bgshift;
          uv.x+=sin(screen.y*7.+u_time*.48)*.0009*(1.-nearLayer)*u_camera;
          gl_FragColor=vec4(texture2D(u_ocean,clamp(uv,0.,1.)).rgb*u_brightness*u_fade,1.);return;
        }
        vec2 delta=vec2((screen.x-u_pose.x)*1080.,(screen.y-u_pose.y)*1920.);
        float co=cos(-u_pose.w),si=sin(-u_pose.w);vec2 local=mat2(co,si,-si,co)*delta;local.x*=u_flip;
        float bodyWidth=u_pose.z*1080.;vec2 uv=local/vec2(bodyWidth,bodyWidth*u_aspect)+.5;
        float tail=pow(clamp((.57-uv.x)/.57,0.,1.),1.75),wave=sin(u_time*2.1+uv.x*4.5);
        if(u_mode<1.5||abs(u_mode-6.)<.1){
          float flipper=smoothstep(.53,.83,uv.y)*exp(-pow((uv.x-.58)*6.,2.)),longFin=u_mode<.5?1.:.4;
          uv.y-=u_motion*(wave*.064*tail+wave*.005*(1.-smoothstep(.55,.88,uv.x))+sin(u_time*1.5+.5)*.016*flipper*longFin);uv.x-=u_motion*sin(u_time*1.5+.3)*.034*flipper*longFin;
        }else if(u_mode<2.5){uv.y-=u_motion*wave*.025*tail;uv.x-=u_motion*sin(u_time*2.8+uv.x*3.)*.023*tail;
        }else if(u_mode<3.5){float arms=smoothstep(.38,.94,uv.x),row=floor(uv.y*12.);uv.y-=u_motion*sin(u_time*1.6+uv.x*8.+row*.64)*.028*arms;uv.x-=u_motion*(sin(u_time*1.5+uv.y*9.)*.018*arms+sin(u_time*1.5)*.006*(1.-arms));
        }else if(u_mode<4.5){uv.y-=u_motion*sin(u_time*1.8+uv.x*9.)*.027*(1.-smoothstep(.7,1.,uv.x));uv.x-=u_motion*sin(u_time*1.3+uv.y*7.)*.01;
        }else if(u_mode<5.5){uv.y-=u_motion*sin(u_time*4.+uv.x*6.)*.04*tail;uv.x-=u_motion*sin(u_time*4.+uv.x*5.)*.015*tail;
        }else if(u_mode<7.5){float fins=pow(abs(uv.x-.5)*2.,2.);uv.y-=u_motion*sin(u_time*2.+uv.x*3.)*.016*fins;uv.x-=u_motion*sin(u_time*1.8)*.004;
        }else if(u_mode<8.5){uv.x-=u_motion*u_current*sin(u_time*.65+uv.y*2.)*.022*pow(clamp(.92-uv.y,0.,1.),2.);
        }
        float inside=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
        vec4 tex=texture2D(u_whale,clamp(uv,0.,1.));float alpha=smoothstep(.12,.82,tex.a)*inside*u_opacity*u_fade;
        vec3 body=tex.rgb*vec3(.88,.96,1.),original=rgb2hsv(body),target=rgb2hsv(u_color);
        float protect=1.-smoothstep(.65,.93,original.z)*(1.-smoothstep(.08,.3,original.y));
        vec3 tinted=hsv2rgb(vec3(target.x,target.y,original.z*(.45+.75*target.z)));body=mix(body,tinted,u_tint*protect);
        body=mix(body,vec3(.035,.24,.31),max(0.,1.-u_opacity)*.65);gl_FragColor=vec4(body*alpha,alpha);
      }`;
    const program=gl.createProgram()!;gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'無法建立動畫程式');
    gl.useProgram(program);const buffer=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const u=Object.fromEntries(['rect','time','pose','opacity','motion','aspect','flip','mode','camera','transparent','brightness','tint','color','fade','span','layer','current','bgshift','jitter','bgzoom'].map(n=>[n,gl.getUniformLocation(program,'u_'+n)]));
    gl.uniform1i(gl.getUniformLocation(program,'u_ocean'),0);gl.uniform1i(gl.getUniformLocation(program,'u_whale'),1);
    const textures=new Map<string,{texture:WebGLTexture;aspect:number}>();
    const blank=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,blank);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
    let files:string[]=[],lastSeed=-1,snow:{x:number;y:number;phase:number;layer:number;size:number}[]=[];
    const backgroundFile=(sc:IScene)=>sc.background==='transparent'?'':sc.mode==='deep'&&sc.background==='trench'?'abyss-v1.png':backgrounds[sc.background].file;
    const requiredFiles=(sc:IScene)=>[backgroundFile(sc),...(sc.mode==='whale'?[animals[sc.animal].file]:sc.mode==='fish'?[sprites.fish.file,sprites.fish2.file]:[sprites[sc.mode].file])];
    const random=(index:number,channel=0)=>{let v=(scene.seed+Math.imul(index+1,374761393)+Math.imul(channel+1,668265263))>>>0;v=Math.imul(v^(v>>>13),1274126177);return((v^(v>>>16))>>>0)/4294967296;};
    const mod=(v:number,n:number)=>((v%n)+n)%n;
    function render(time:number,width=canvas.width,height=canvas.height){
      if(disposed||!loaded)return;
      if(canvas.width!==width||canvas.height!==height){canvas.width=particles.width=width;canvas.height=particles.height=height;}
      const sc=scene,t=clamp(Number(time)||0,0,sc.loop)*sc.speed,design=1080/1920,ratio=width/height,spanX=ratio<design?ratio/design:1,spanY=ratio>design?design/ratio:1;
      const flip=sc.direction==='left'?-1:1,pan=(1-Math.cos(Math.PI*clamp((t-.5)/11.5)))/2,zoom=1+.025*pan*sc.camera;
      const rush=sc.mode==='shark'?clamp((t/12-sc.strike)/(1-sc.strike)*sc.rush):0;
      const jitter=sc.mode==='shark'?Math.sin(rush*Math.PI)*sc.shake*.008:0,jx=Math.sin(t*35)*jitter,jy=Math.cos(t*29)*jitter*.6;
      const fade=sc.path==='hover'||sc.mode==='coral'||sc.mode==='deep'?1:(.9+.1*Math.sin(clamp((t-.15)/.9)*Math.PI/2))*(1-Math.pow(clamp((t-11.2)/.8),2));
      gl.viewport(0,0,width,height);gl.useProgram(program);gl.disable(gl.BLEND);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.span,spanX,spanY);gl.uniform1f(u.time,t);gl.uniform1f(u.camera,sc.camera);gl.uniform2f(u.jitter,jx,jy);gl.uniform2f(u.bgshift,0,sc.mode==='deep'?(t-6)*.012*sc.descent:0);gl.uniform1f(u.bgzoom,sc.mode==='deep'?1.65:1.055);
      gl.uniform1f(u.transparent,sc.background==='transparent'?1:0);gl.uniform1f(u.brightness,sc.brightness*(sc.mode==='deep'?1-sc.darkness*(.25+.35*t/12):1));gl.uniform1f(u.tint,sc.tint);gl.uniform1f(u.fade,fade);gl.uniform1f(u.motion,sc.motion);gl.uniform1f(u.current,sc.current);
      gl.uniform3f(u.color,parseInt(sc.color.slice(1,3),16)/255,parseInt(sc.color.slice(3,5),16)/255,parseInt(sc.color.slice(5,7),16)/255);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures.get(files[0])?.texture??blank);gl.uniform1f(u.layer,0);gl.uniform4f(u.rect,0,0,1,1);gl.drawArrays(gl.TRIANGLES,0,6);
      gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(u.layer,1);
      // Render only each sprite's bounding quad, so schools do not shade the whole canvas per fish.
      const sprite=(file:string,mode:number,pose:number[],phase=0,individualFlip=1)=>{
        const tex=textures.get(file);if(!tex)return;
        const x=.5+(pose[0]-.5)*flip+(sc.x-.5),y=pose[1]+sc.y-.5,bw=pose[2]*sc.size*1080,bh=bw*tex.aspect,angle=pose[3]*flip+sc.angle*Math.PI/180;
        const cx=.5+(x-.5-.0065*pan*sc.camera-jx)*zoom/spanX,cy=.5+(y-.5-jy)*zoom/spanY;
        const hw=(Math.abs(Math.cos(angle))*bw+Math.abs(Math.sin(angle))*bh)*.64*zoom/(1080*spanX)+.015,hh=(Math.abs(Math.sin(angle))*bw+Math.abs(Math.cos(angle))*bh)*.64*zoom/(1920*spanY)+.015;
        if(cx+hw<0||cx-hw>1||cy+hh<0||cy-hh>1)return;
        gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,tex.texture);gl.uniform4f(u.rect,cx-hw,cy-hh,hw*2,hh*2);gl.uniform4f(u.pose,x,y,pose[2]*sc.size,angle);gl.uniform1f(u.opacity,pose[4]*sc.opacity);gl.uniform1f(u.aspect,tex.aspect);gl.uniform1f(u.flip,flip*individualFlip);gl.uniform1f(u.mode,mode);gl.uniform1f(u.time,t+phase);gl.drawArrays(gl.TRIANGLES,0,6);
      };
      let subPose:number[]|undefined;
      if(sc.mode==='whale')sprite(animals[sc.animal].file,animals[sc.animal].mode,sc.path==='hover'?[.5,.44,1.25,Math.sin(t*.35)*.014,1]:poseAt(t));
      else if(sc.mode==='fish'||sc.mode==='dolphins'){
        const dolphin=sc.mode==='dolphins',members=Array.from({length:sc.count},(_,i)=>({i,z:random(i,2)})).sort((a,b)=>a.z-b.z);
        for(const {i,z} of members){
          const rx=random(i),ry=random(i,1),phase=i/sc.count*Math.PI*2,layer=1-sc.depth*(1-z)*.55;
          let x=.5+(rx-.5)*sc.spread*(dolphin?.9:1.1),y=.44+(ry-.5)*sc.spread*(dolphin?.28:.48),angle=Math.sin(t*.7+phase)*.06,face=1;
          if(sc.formation==='line')y=.44+(ry-.5)*.08*sc.spread;
          if(sc.formation==='v'){x=.32+Math.abs(i-(sc.count-1)/2)/sc.count*.75*sc.spread;y=.44+(i-(sc.count-1)/2)/sc.count*.45*sc.spread;}
          if(sc.formation==='orbit'){const a=t*.4+phase;x=.5+Math.cos(a)*.42*sc.spread;y=.44+Math.sin(a)*.19*sc.spread;face=Math.sin(a)>0?-1:1;angle=Math.cos(a)*.22;}
          if(sc.path==='pass')x+=-.65+t/12*1.3;
          y+=Math.sin(t*(dolphin?.8:.55)+phase)*sc.arc*(dolphin?.045:.022);angle+=Math.cos(t*.8+phase)*sc.arc*(dolphin?.08:.025);
          sprite(dolphin?sprites.dolphins.file:i%3===0?sprites.fish2.file:sprites.fish.file,dolphin?6:5,[x,y,(dolphin?.57:.23)*layer*(.85+rx*.3),angle,.45+layer*.55],phase,face);
        }
      }else if(sc.mode==='shark'){
        const p=rush*pulse(rush),cover=sc.exit==='cover',x=.5+Math.sin(t*.7)*.045*(1-rush)+(cover?0:Math.pow(clamp((rush-.6)/.4),2)*1.9);
        sprite(sprites.shark.file,7,[x,.43,.25+(cover?5.5:3.3)*p,Math.sin(t*.7)*.025*(1-rush),1]);
      }else if(sc.mode==='coral'){
        for(let i=0;i<sc.count;i++){const z=i/Math.max(1,sc.count-1),x=.5+(random(i)-.5)*1.5*sc.spread,y=.79+z*.25;
          sprite(sprites.coral.file,8,[x,y,(.48+z*.45)*(1-sc.depth*(1-z)*.4),0,.65+z*.35],i*1.7,i%2?-1:1);}
      }else if(sc.mode==='deep'){
        for(let i=0;i<sc.count;i++){const z=.3+.7*random(i,2),y=mod(random(i,1)*3-t/12*sc.descent*(.5+z*sc.depth),3)-.8;
          sprite(sprites.deep.file,10,[(i%2?1.06:-.06)+(random(i)-.5)*.2,y,.42+z*.5,0,.4+z*.55],0,i%2?-1:1);}
      }else{
        subPose=[sc.path==='hover'?.5:-.4+t/12*1.8,.46+Math.sin(t*.7)*sc.arc*.024,.96,Math.cos(t*.7)*sc.arc*.018,1];sprite(sprites.submarine.file,9,subPose);
      }
      gl.disable(gl.BLEND);
      ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);ctx.globalAlpha=fade;
      const world=()=>{const sx=width/(1080*spanX)*zoom,sy=height/(1920*spanY)*zoom;ctx.setTransform(sx,0,0,sy,width/2-(540+1080*(.0065*pan*sc.camera+jx))*sx,height/2-(960+1920*jy)*sy);};
      if(subPose){
        world();const bw=subPose[2]*sc.size*1080;ctx.save();ctx.translate((.5+(subPose[0]-.5)*flip+sc.x-.5)*1080,(subPose[1]+sc.y-.5)*1920);ctx.rotate(subPose[3]*flip+sc.angle*Math.PI/180);ctx.scale(flip,1);ctx.globalAlpha=fade*sc.opacity;
        if(sc.beam>0){const start=bw*.44,len=bw*1.15,half=Math.tan(sc.beamWidth*Math.PI/360)*len;for(let k=3;k>=1;k--){ctx.fillStyle=`rgba(238,224,160,${sc.beam*.05})`;ctx.beginPath();ctx.moveTo(start,-bw*.11);ctx.lineTo(start+len,-bw*.11-half*k/3);ctx.lineTo(start+len,-bw*.11+half*k/3);ctx.closePath();ctx.fill();}}
        if(sc.propeller>0){ctx.save();ctx.translate(-bw*.44,bw*.01);for(let j=0;j<3;j++){const a=t*12*sc.propeller+j*Math.PI*2/3;ctx.fillStyle='#a5bab6';ctx.beginPath();ctx.ellipse(Math.cos(a)*bw*.008,Math.sin(a)*bw*.025,bw*.007,bw*.018,Math.cos(a)*.4,0,Math.PI*2);ctx.fill();}ctx.restore();}
        for(let i=0;i<Math.round(22*sc.bubbles);i++){const age=mod(t*.18+i/22,1),px=-bw*(.32+age*.65),py=-age*age*bw*.28+Math.sin(i*7)*bw*.016,r=bw*(.002+age*.004);ctx.strokeStyle=`rgba(214,239,226,${(1-age)*.45})`;ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.stroke();}
        ctx.restore();
      }
      if(sc.seed!==lastSeed){let seed=sc.seed;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};snow=Array.from({length:135},(_,i)=>({x:rand(),y:rand(),phase:rand()*6.283,layer:i%3,size:.5+rand()*1.3}));lastSeed=sc.seed;}
      ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=sc.path==='hover'?1:(1-Math.pow(1-clamp((t-.3)/1.3),3))*Math.cos(clamp((t-11.35)/.65)*Math.PI/2);
      for(const p of snow.slice(0,Math.round(90*sc.particles))){const drift=t*sc.current,x=p.x*1080+Math.sin(drift*.19+p.phase)*(4+p.layer*3)-drift*(p.layer+1)*1.5,y=mod(p.y*2020-drift*(4+p.layer*8),2020)-50,r=p.size*(.5+p.layer*.75)*width/(1080*spanX);ctx.fillStyle=`rgba(208,233,226,${.13+p.layer*.12})`;ctx.beginPath();ctx.ellipse(((x/1080-.5)/spanX+.5)*width,((y/1920-.5)/spanY+.5)*height,r,r*.8,0,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    }
    function pulse(v:number){return v*v;}
    const imageCache=new Map<string,Promise<HTMLImageElement>>();
    function image(file:string){
      if(imageCache.has(file))return imageCache.get(file)!;
      const promise=new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('插畫素材暫時無法載入，請確認網路後重試。'));im.src=origin.replace(/\/$/,'')+'/media/whale-illustrated/'+file;});imageCache.set(file,promise);promise.catch(()=>imageCache.delete(file));return promise;
    }
    function update(raw:unknown){
      scene=normalize(raw);const chosenFiles=requiredFiles(scene),key=chosenFiles.join('/');if(key===assetKey&&loaded)return Promise.resolve(true);
      const token=++request;loaded=false;
      return Promise.all(chosenFiles.map(file=>!file||textures.has(file)?null:image(file))).then(images=>{
        if(disposed||token!==request)return false;gl.useProgram(program);
        images.forEach((im,i)=>{if(!im)return;const texture=gl.createTexture()!;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);textures.set(chosenFiles[i],{texture,aspect:im.naturalHeight/im.naturalWidth});});files=chosenFiles;assetKey=key;loaded=true;return true;
      });
    }
    function dispose(){if(disposed)return;disposed=true;request++;textures.forEach(({texture})=>gl.deleteTexture(texture));gl.deleteTexture(blank);gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));gl.getExtension('WEBGL_lose_context')?.loseContext();}
    const ready=update(scene);return {ready,update,render,dispose,get scene(){return scene;},get loaded(){return loaded;}};
  }
  return {modes,animals,backgrounds,defaults,fields,normalize,fromWords,createRenderer};
}
export const ILLUSTRATION=illustrationEngine();
export const normalizeIllustration=ILLUSTRATION.normalize;
export const illustrationMode=(id:string):IMode=>(Object.entries(ILLUSTRATION.modes).find(([mode,info])=>mode===id||info.id===id)?.[0] as IMode|undefined)??'whale';
export const illustrationFxId=(mode:IMode)=>ILLUSTRATION.modes[mode].id;
export const isIllustrationFx=(id:string)=>Object.values(ILLUSTRATION.modes).some(info=>info.id===id);
export const illustrationFromWords=(words:string[]=[],effect='whale-illustrated')=>ILLUSTRATION.fromWords(words,illustrationMode(effect));
(globalThis as unknown as {MA_ILLUSTRATION:typeof ILLUSTRATION}).MA_ILLUSTRATION=ILLUSTRATION;
