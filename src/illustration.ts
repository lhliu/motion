/** Shared, serializable illustration engine. Safe to import in Pages Functions. */
export interface IScene {
  version: 1; ratio: '9:16'|'16:9'|'1:1'; animal: 'humpback'|'sperm'|'shark'|'squid'|'monster';
  background: 'reef'|'blue'|'trench'|'wreck'|'cave'|'transparent';
  size: number; speed: number; loop: number; x: number; y: number; angle: number;
  direction: 'right'|'left'; path: 'pass'|'hover'; color: string; tint: number;
  motion: number; particles: number; current: number; camera: number; opacity: number; brightness: number; seed: number;
}

export function illustrationEngine() {
  const animals = {
    humpback: { zh: '座頭鯨', file: 'whale-v1.png', mode: 0 },
    sperm: { zh: '抹香鯨', file: 'sperm-v1.png', mode: 1 },
    shark: { zh: '大白鯊', file: 'shark-v1.png', mode: 2 },
    squid: { zh: '巨大烏賊', file: 'squid-v1.png', mode: 3 },
    monster: { zh: '原創海怪', file: 'monster-v1.png', mode: 4 },
  };
  const backgrounds = {
    reef: { zh: '珊瑚礁', file: 'ocean-v1.png' }, blue: { zh: '開闊藍海', file: 'blue-v1.png' },
    trench: { zh: '深海海溝', file: 'trench-v1.png' }, wreck: { zh: '沉船遺址', file: 'wreck-v1.png' },
    cave: { zh: '海底洞穴', file: 'cave-v1.png' }, transparent: { zh: '透明背景', file: '' },
  };
  const defaults: IScene = { version: 1, ratio: '9:16', animal: 'humpback', background: 'reef', size: 1, speed: 1, loop: 12, x: .5, y: .5, angle: 0, direction: 'right', path: 'pass', color: '#248caa', tint: 0, motion: 1, particles: 1, current: 1, camera: 1, opacity: 1, brightness: 1, seed: 194190 };
  const clamp = (v: number, lo=0, hi=1) => Math.min(hi, Math.max(lo, v));
  function normalize(raw: unknown = {}): IScene {
    const o = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
    const num = (key: keyof IScene, lo: number, hi: number) => typeof o[key] === 'number' && Number.isFinite(o[key]) ? clamp(o[key] as number,lo,hi) : defaults[key] as number;
    const speed = typeof o.speed === 'number' && Number.isFinite(o.speed) ? clamp(o.speed,.6,2.5) : typeof o.loop === 'number' && Number.isFinite(o.loop) && o.loop > 0 ? clamp(12/o.loop,.6,2.5) : 1;
    return { version: 1, ratio: ['9:16','16:9','1:1'].includes(String(o.ratio)) ? o.ratio as IScene['ratio'] : '9:16',
      animal: Object.hasOwn(animals,String(o.animal)) ? o.animal as IScene['animal'] : 'humpback',
      background: Object.hasOwn(backgrounds,String(o.background)) ? o.background as IScene['background'] : 'reef',
      size: num('size',.4,2.2), speed, loop: 12/speed, x: num('x',-.5,1.5), y: num('y',0,1), angle: num('angle',-60,60),
      direction: o.direction === 'left' ? 'left' : 'right', path: o.path === 'hover' ? 'hover' : 'pass',
      color: typeof o.color === 'string' && /^#[0-9a-f]{6}$/i.test(o.color) ? o.color.toLowerCase() : defaults.color,
      tint: num('tint',0,1), motion: num('motion',0,1.6), particles: num('particles',0,1.5), current: num('current',0,2),
      camera: num('camera',0,1.5), opacity: num('opacity',0,1), brightness: num('brightness',.3,1.5), seed: Math.round(num('seed',0,999999)),
    };
  }
  function fromWords(words: string[] = []): IScene {
    try { return normalize(JSON.parse(words.find(w=>w.trim().startsWith('{')) || '{}')); } catch { return normalize(); }
  }
  const poses = [[0,-.55,.485,.58,-.12,.82],[2,-.08,.462,.83,-.14,.88],[4,.24,.432,1.08,-.16,.96],[6,.43,.422,1.34,-.18,1],[8,.88,.405,1.69,-.20,1],[10,1.62,.378,1.92,-.18,1],[12,2.55,.36,2.02,-.13,1]];
  function poseAt(t: number) {
    let i=0; while(i<poses.length-2 && t>poses[i+1][0])i++;
    const a=poses[i],b=poses[i+1],before=poses[Math.max(0,i-1)],after=poses[Math.min(poses.length-1,i+2)];
    const dt=b[0]-a[0],p=(t-a[0])/dt,p2=p*p,p3=p2*p;
    return a.slice(1).map((v,k)=>{const c=k+1,m0=(b[c]-before[c])/(b[0]-before[0]),m1=(after[c]-a[c])/(after[0]-a[0]);return (2*p3-3*p2+1)*v+(p3-2*p2+p)*dt*m0+(-2*p3+3*p2)*b[c]+(p3-p2)*dt*m1;});
  }
  function createRenderer(canvas: HTMLCanvasElement, particles: HTMLCanvasElement, initial: unknown, origin: string) {
    let scene=normalize(initial), disposed=false, loaded=false, request=0, assetKey='', aspect=2/3;
    const context=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,preserveDrawingBuffer:true});
    if(!context)throw new Error('瀏覽器無法啟動 WebGL，請改用 Chrome 或支援 WebGL 的瀏覽器。');
    const gl: WebGLRenderingContext=context;
    const ctx=particles.getContext('2d')!;
    const shaders: WebGLShader[]=[];
    const compile=(type:number,source:string)=>{const s=gl.createShader(type)!;shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'無法建立動畫著色器');return s;};
    const vertex=`attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=a_position;gl_Position=vec4(a_position.x*2.-1.,1.-a_position.y*2.,0.,1.);}`;
    const fragment=`precision highp float;
      varying vec2 v_uv;uniform sampler2D u_ocean;uniform sampler2D u_whale;
      uniform float u_time,u_opacity,u_motion,u_aspect,u_flip,u_mode,u_camera,u_transparent,u_brightness,u_tint,u_fade;
      uniform vec3 u_color;uniform vec4 u_pose;uniform vec2 u_span;
      vec3 rgb2hsv(vec3 c){vec4 K=vec4(0.,-1./3.,2./3.,-1.);vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));float d=q.x-min(q.w,q.y);return vec3(abs(q.z+(q.w-q.y)/(6.*d+.000001)),d/(q.x+.000001),q.x);}
      vec3 hsv2rgb(vec3 c){vec3 p=abs(fract(c.xxx+vec3(0.,2./3.,1./3.))*6.-3.);return c.z*mix(vec3(1.),clamp(p-1.,0.,1.),c.y);}
      void main(){
        vec2 screen=(v_uv-.5)*u_span+.5;
        float pan=(1.-cos(3.14159265*clamp((u_time-.5)/11.5,0.,1.)))/2.;
        screen=(screen-.5)/(1.+.025*pan*u_camera)+.5;screen.x+=.0065*pan*u_camera;
        float nearLayer=smoothstep(.56,1.,screen.y);
        vec2 camera=vec2(sin(u_time*.14)*.008,-u_time*.0015)*u_camera;
        vec2 waterUV=(screen-.5)/1.055+.5+camera*(.6+nearLayer*1.1);
        waterUV.x+=sin(screen.y*7.+u_time*.48)*.0009*(1.-nearLayer)*u_camera;
        vec3 ocean=texture2D(u_ocean,clamp(waterUV,0.,1.)).rgb*u_brightness;
        vec2 delta=vec2((screen.x-u_pose.x)*1080.,(screen.y-u_pose.y)*1920.);
        float co=cos(-u_pose.w),si=sin(-u_pose.w);vec2 local=mat2(co,si,-si,co)*delta;
        local.x*=u_flip;
        float bodyWidth=u_pose.z*1080.;vec2 uv=local/vec2(bodyWidth,bodyWidth*u_aspect)+.5;
        float tail=pow(clamp((.57-uv.x)/.57,0.,1.),1.75);
        float wave=sin(u_time*2.1+uv.x*4.5);
        if(u_mode<1.5){
          float flipper=smoothstep(.53,.83,uv.y)*exp(-pow((uv.x-.58)*6.,2.));
          float longFin=u_mode<.5?1.:.4;
          uv.y-=u_motion*(wave*.064*tail+wave*.005*(1.-smoothstep(.55,.88,uv.x))+sin(u_time*1.5+.5)*.016*flipper*longFin);
          uv.x-=u_motion*sin(u_time*1.5+.3)*.034*flipper*longFin;
        }else if(u_mode<2.5){
          uv.y-=u_motion*wave*.025*tail;uv.x-=u_motion*sin(u_time*2.8+uv.x*3.)*.023*tail;
        }else if(u_mode<3.5){
          float arms=smoothstep(.38,.94,uv.x);float row=floor(uv.y*12.);
          uv.y-=u_motion*sin(u_time*1.6+uv.x*8.+row*.64)*.028*arms;
          uv.x-=u_motion*(sin(u_time*1.5+uv.y*9.)*.018*arms+sin(u_time*1.5)*.006*(1.-arms));
        }else{
          uv.y-=u_motion*sin(u_time*1.8+uv.x*9.)*.027*(1.-smoothstep(.7,1.,uv.x));
          uv.x-=u_motion*sin(u_time*1.3+uv.y*7.)*.01;
        }
        float inside=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
        vec4 animal=texture2D(u_whale,clamp(uv,0.,1.));float alpha=smoothstep(.12,.82,animal.a)*inside*u_opacity;
        vec3 body=animal.rgb*vec3(.88,.96,1.);
        vec3 original=rgb2hsv(body),target=rgb2hsv(u_color);
        // Hue replacement retains the luminance texture, pale belly and dark eyes.
        float protect=1.-smoothstep(.65,.93,original.z)*(1.-smoothstep(.08,.3,original.y));
        vec3 tinted=hsv2rgb(vec3(target.x,target.y,original.z*(.45+.75*target.z)));
        body=mix(body,tinted,u_tint*protect);
        body=mix(body,vec3(.035,.24,.31),max(0.,1.-u_opacity)*.65);
        if(u_transparent>.5)gl_FragColor=vec4(body*alpha,alpha)*u_fade;
        else gl_FragColor=vec4(mix(ocean,body,alpha)*u_fade,1.);
      }`;
    const program=gl.createProgram()!;
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'無法建立動畫程式');
    gl.useProgram(program);
    const buffer=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const names=['time','pose','opacity','motion','aspect','flip','mode','camera','transparent','brightness','tint','color','fade','span'];
    const u=Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(program,'u_'+n)]));
    const textures=[0,1].map(i=>{const tx=gl.createTexture()!;gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tx);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));gl.uniform1i(gl.getUniformLocation(program,i?'u_whale':'u_ocean'),i);return tx;});
    let snow: {x:number;y:number;phase:number;layer:number;size:number}[]=[], lastSeed=-1;
    function render(time:number,width=canvas.width,height=canvas.height) {
      if(disposed||!loaded)return;
      if(canvas.width!==width||canvas.height!==height){canvas.width=particles.width=width;canvas.height=particles.height=height;}
      const sc=scene,t=clamp(Number(time)||0,0,sc.loop)*sc.speed;
      const design=1080/1920,ratio=width/height,spanX=ratio<design?ratio/design:1,spanY=ratio>design?design/ratio:1;
      const pose=sc.path==='hover'?[.5,.44,1.25,Math.sin(t*.35)*.014,1]:poseAt(t);
      const flip=sc.direction==='left'?-1:1;
      pose[0]=.5+(pose[0]-.5)*flip+(sc.x-.5);pose[1]+=sc.y-.5;pose[2]*=sc.size;pose[3]=pose[3]*flip+sc.angle*Math.PI/180;
      const fade=sc.path==='hover'?1:(.9+.1*Math.sin(clamp((t-.15)/.9)*Math.PI/2))*(1-Math.pow(clamp((t-11.2)/.8),2));
      gl.viewport(0,0,width,height);gl.useProgram(program);
      textures.forEach((tx,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tx);});
      gl.uniform2f(u.span,spanX,spanY);gl.uniform1f(u.time,t);gl.uniform4f(u.pose,pose[0],pose[1],pose[2],pose[3]);
      gl.uniform1f(u.opacity,pose[4]*sc.opacity);gl.uniform1f(u.motion,sc.motion);gl.uniform1f(u.aspect,aspect);gl.uniform1f(u.flip,flip);gl.uniform1f(u.mode,animals[sc.animal].mode);gl.uniform1f(u.camera,sc.camera);gl.uniform1f(u.transparent,sc.background==='transparent'?1:0);gl.uniform1f(u.brightness,sc.brightness);gl.uniform1f(u.tint,sc.tint);gl.uniform1f(u.fade,fade);
      gl.uniform3f(u.color,parseInt(sc.color.slice(1,3),16)/255,parseInt(sc.color.slice(3,5),16)/255,parseInt(sc.color.slice(5,7),16)/255);gl.drawArrays(gl.TRIANGLES,0,6);
      ctx.clearRect(0,0,width,height);
      if(sc.seed!==lastSeed){let seed=sc.seed;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};snow=Array.from({length:135},(_,i)=>({x:rand(),y:rand(),phase:rand()*6.283,layer:i%3,size:.5+rand()*1.3}));lastSeed=sc.seed;}
      ctx.globalAlpha=sc.path==='hover'?1:(1-Math.pow(1-clamp((t-.3)/1.3),3))*Math.cos(clamp((t-11.35)/.65)*Math.PI/2);
      for(const p of snow.slice(0,Math.round(90*sc.particles))){const drift=t*sc.current,x=p.x*1080+Math.sin(drift*.19+p.phase)*(4+p.layer*3)-drift*(p.layer+1)*1.5,y=((p.y*2020-drift*(4+p.layer*8))%2020+2020)%2020-50,r=p.size*(.5+p.layer*.75)*width/(1080*spanX);ctx.fillStyle=`rgba(208,233,226,${.13+p.layer*.12})`;ctx.beginPath();ctx.ellipse(((x/1080-.5)/spanX+.5)*width,((y/1920-.5)/spanY+.5)*height,r,r*.8,0,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    }
    const imageCache=new Map<string,Promise<HTMLImageElement>>();
    const image=(file:string)=>{if(imageCache.has(file))return imageCache.get(file)!;const promise=new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('插畫素材暫時無法載入，請確認網路後重試。'));im.src=origin.replace(/\/$/,'')+'/media/whale-illustrated/'+file;});imageCache.set(file,promise);promise.catch(()=>imageCache.delete(file));return promise;};
    function update(raw:unknown) {
      scene=normalize(raw);
      const key=scene.animal+'/'+scene.background;
      if(key===assetKey&&loaded)return Promise.resolve(true);
      const token=++request,chosen=scene;loaded=false;
      return Promise.all([chosen.background==='transparent'?null:image(backgrounds[chosen.background].file),image(animals[chosen.animal].file)]).then(images=>{
        if(disposed||token!==request)return false;
        gl.useProgram(program);
        images.forEach((im,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,textures[i]);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);if(im)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));});
        aspect=images[1]!.naturalHeight/images[1]!.naturalWidth;assetKey=key;loaded=true;return true;
      });
    }
    function dispose(){if(disposed)return;disposed=true;request++;textures.forEach(tx=>gl.deleteTexture(tx));gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));gl.getExtension('WEBGL_lose_context')?.loseContext();}
    const ready=update(scene);
    return { ready, update, render, dispose, get scene(){return scene;}, get loaded(){return loaded;} };
  }
  return { animals, backgrounds, defaults, normalize, fromWords, createRenderer };
}
export const ILLUSTRATION = illustrationEngine();
export const normalizeIllustration = ILLUSTRATION.normalize;
export const illustrationFromWords = ILLUSTRATION.fromWords;
export const isIllustrationFx = (id: string) => id === 'whale-illustrated';
// The exported HTML defines this same engine before running the effect.
(globalThis as unknown as {MA_ILLUSTRATION: typeof ILLUSTRATION}).MA_ILLUSTRATION=ILLUSTRATION;
