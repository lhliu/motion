import type { Fx } from '../types';

/** Fixed illustration scene, intentionally separate from obj-ocean-whale (#190). */
export const illustratedWhale: Fx = {
  id: 'whale-illustrated',
  no: 200,
  cat: 'ocean',
  zh: '巨鯨經過・精修插畫',
  en: 'Illustrated Whale Encounter',
  desc: '精細座頭鯨插畫由遠而近，尾部與胸鰭分別擺動，近身掠過珊瑚海景',
  tags: ['海底', '精修插畫', '療癒', '全景'],
  tone: 'ink',
  sample: [],
  duration: 12,
  preferredRatio: '9:16',
  added: '2026-10-23',
  hint: '固定全景插畫，不使用文字；建議 9:16、保留完整 12 秒。可加入 Combo、下載 HTML；插畫素材隨網站載入。',
  motion: '獨立的精修插畫動畫：座頭鯨由遠而近、逐漸放大，保留腹部褶線、藤壺與胸鰭細節；尾部、身體與胸鰭以不同相位局部形變，海底珊瑚背景與三層懸浮顆粒呈現視差，巨鯨近身掠過後收尾。12 秒、無文字入場，不使用陰影、模糊或光暈。使用 2.5D 插畫紋理形變。',
  motionEn: 'A separate 12-second illustrated whale encounter: a detailed humpback whale approaches and grows in scale, with ventral pleats, barnacles and long pectoral fins. The tail, body and flipper deform at different phases above a parallax coral seascape and three layers of marine snow, then the whale passes the camera. No text entrance, shadows, blur or glow. This uses 2.5D illustration texture deformation.',
  css: `.S{background:#05283f}.S canvas{position:absolute;inset:0;width:100%;height:100%;display:block;transform-origin:50% 50%}.S .iw-snow{pointer-events:none}.S .iw-status{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:10%;font:500 clamp(14px,3cqw,30px)/1.6 var(--sans);color:#efe6ce}.S .iw-status:empty{display:none}`,
  html: () => {
    // Absolute image URLs also work in downloaded HTML and sandboxed Combo frames.
    const origin=typeof location!=='undefined'&&/^https?:$/.test(location.protocol)?location.origin:'https://motion.leichthub.com';
    return `<canvas class="iw-ocean"></canvas><canvas class="iw-snow"></canvas><img class="iw-asset" crossorigin="anonymous" hidden src="${origin}/media/whale-illustrated/ocean-v1.png" alt=""><img class="iw-asset" crossorigin="anonymous" hidden src="${origin}/media/whale-illustrated/whale-v1.png" alt=""><div class="iw-status" role="status"></div>`;
  },
  // Self-contained: exportHtml serializes this function, without GSAP or imports.
  run: (root) => {
    const W=1080,H=1920,DURATION=12;
    const canvas=root.querySelector<HTMLCanvasElement>('.iw-ocean')!;
    const particles=root.querySelector<HTMLCanvasElement>('.iw-snow')!;
    const ctx=particles.getContext('2d')!;
    const context=canvas.getContext('webgl',{alpha:false,antialias:true,preserveDrawingBuffer:true});
    const status=root.querySelector<HTMLElement>('.iw-status')!;
    if(!context){status.textContent='這個瀏覽器無法播放此動畫，請改用支援 WebGL 的瀏覽器。';return;}
    const gl: WebGLRenderingContext=context;
    let ready=false,disposed=false,program: WebGLProgram|null=null;
    let uniforms: Record<string,WebGLUniformLocation|null>;
    let lastDraw=-1;
    let spanX=1,spanY=1;
    const textures: WebGLTexture[]=[];
    let buffer: WebGLBuffer|null=null;
    const shaders: WebGLShader[]=[];
    const images=Array.from(root.querySelectorAll<HTMLImageElement>('.iw-asset'));
    const host=root as HTMLElement & {motionReady?:Promise<boolean>;motionSeek?:(time:number)=>void};
    const poses=[
      // time, center x / W, center y / H, width / W, pitch radians, visibility
      [0,-.55,.485,.58,-.12,.82],
      [2,-.08,.462,.83,-.14,.88],
      [4,.24,.432,1.08,-.16,.96],
      [6,.43,.422,1.34,-.18,1],
      [8,.88,.405,1.69,-.20,1],
      [10,1.62,.378,1.92,-.18,1],
      [12,2.55,.36,2.02,-.13,1],
    ];
    // Time-aware Hermite interpolation keeps velocity continuous across poses.
    const poseAt=(time:number)=>{
      const t=Math.max(0,Math.min(DURATION,time));
      let i=0;while(i<poses.length-2&&t>poses[i+1][0])i++;
      const a=poses[i],b=poses[i+1],before=poses[Math.max(0,i-1)],after=poses[Math.min(poses.length-1,i+2)];
      const dt=b[0]-a[0],p=(t-a[0])/dt,p2=p*p,p3=p2*p;
      return a.slice(1).map((v,k)=>{
        const c=k+1,m0=(b[c]-before[c])/(b[0]-before[0]),m1=(after[c]-a[c])/(after[0]-a[0]);
        return (2*p3-3*p2+1)*v+(p3-2*p2+p)*dt*m0+(-2*p3+3*p2)*b[c]+(p3-p2)*dt*m1;
      });
    };
    const vertex=`attribute vec2 a_position;
      varying vec2 v_uv;
      void main(){v_uv=a_position;gl_Position=vec4(a_position.x*2.0-1.0,1.0-a_position.y*2.0,0.0,1.0);}`;
    const fragment=`precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_ocean;
      uniform sampler2D u_whale;
      uniform float u_time;
      uniform vec4 u_pose;
      uniform float u_opacity;
      uniform float u_articulation;
      uniform vec2 u_span;
      void main(){
        vec2 screen=(v_uv-.5)*u_span+.5;
        float nearLayer=smoothstep(.56,1.0,screen.y);
        vec2 camera=vec2(sin(u_time*.14)*.008,-u_time*.0015);
        vec2 waterUV=(screen-.5)/1.055+.5+camera*(.6+nearLayer*1.1);
        // Small coherent surface ripples, no blur or glow.
        waterUV.x+=sin(screen.y*7.0+u_time*.48)*.0009*(1.0-nearLayer);
        vec3 ocean=texture2D(u_ocean,clamp(waterUV,0.0,1.0)).rgb;
        vec2 delta=vec2((screen.x-u_pose.x)*1080.0,(screen.y-u_pose.y)*1920.0);
        float co=cos(-u_pose.w),si=sin(-u_pose.w);
        vec2 local=mat2(co,si,-si,co)*delta;
        float bodyWidth=u_pose.z*1080.0;
        vec2 uv=local/vec2(bodyWidth,bodyWidth*(1024.0/1536.0))+.5;
        // Traveling deformation is strongest at the tail, weakest at the head.
        float tail=pow(clamp((.57-uv.x)/.57,0.0,1.0),1.75);
        float tailBeat=sin(u_time*2.1+uv.x*4.5)*.064*tail;
        float bodyBeat=sin(u_time*2.1+uv.x*4.5)*.005*(1.0-smoothstep(.55,.88,uv.x));
        float flipper=smoothstep(.53,.83,uv.y)*exp(-pow((uv.x-.58)*6.0,2.0));
        uv.y-=u_articulation*(tailBeat+bodyBeat+sin(u_time*1.5+.5)*.016*flipper);
        uv.x-=u_articulation*sin(u_time*1.5+.3)*.034*flipper;
        float inside=step(0.0,uv.x)*step(uv.x,1.0)*step(0.0,uv.y)*step(uv.y,1.0);
        vec4 whale=texture2D(u_whale,clamp(uv,0.0,1.0));
        float alpha=smoothstep(.12,.82,whale.a)*inside*u_opacity;
        // A restrained underwater cast keeps the isolated asset in the same world.
        vec3 body=whale.rgb*vec3(.88,.96,1.0);
        body=mix(body,vec3(.035,.24,.31),max(0.0,1.0-u_opacity)*.65);
        vec3 result=mix(ocean,body,alpha);
        gl_FragColor=vec4(result,1.0);
      }`;
    function compile(type:number,source:string){
      const shader=gl.createShader(type)!;shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'無法建立動畫著色器');
      return shader;
    }
    function initGL(){
      if(!gl)throw new Error('這個瀏覽器無法啟動 WebGL，請用 Chrome 開啟 Demo。');
      program=gl.createProgram()!;gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'無法建立動畫程式');
      gl.useProgram(program);
      buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),gl.STATIC_DRAW);
      const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
      uniforms=Object.fromEntries(['u_time','u_pose','u_opacity','u_articulation','u_span'].map(n=>[n,gl.getUniformLocation(program!,n)]));
      images.forEach((image,i)=>{
        const texture=gl.createTexture()!;textures.push(texture);gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
        gl.uniform1i(gl.getUniformLocation(program!,i===0?'u_ocean':'u_whale'),i);
      });
      gl.viewport(0,0,W,H);
    }
    const seeded=(seed:number)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const random=seeded(194190);
    const snow=Array.from({length:90},(_,i)=>({x:random(),y:random(),phase:random()*6.283,layer:i%3,size:.5+random()*1.3}));
    function render(time:number,articulation=1){
      if(!ready||disposed)return;
      const t=Math.max(0,Math.min(DURATION,Number(time)||0)),pose=poseAt(t);
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.useProgram(program);gl.uniform2f(uniforms.u_span,spanX,spanY);gl.uniform1f(uniforms.u_time,t);gl.uniform4f(uniforms.u_pose,pose[0],pose[1],pose[2],pose[3]);gl.uniform1f(uniforms.u_opacity,pose[4]);gl.uniform1f(uniforms.u_articulation,articulation);
      gl.drawArrays(gl.TRIANGLES,0,6);
      ctx.clearRect(0,0,particles.width,particles.height);
      for(const p of snow){
        const speed=4+p.layer*8,range=H+100;
        const x=p.x*W+Math.sin(t*.19+p.phase)*(4+p.layer*3)-t*(p.layer+1)*1.5;
        const y=((p.y*range-t*speed)%range+range)%range-50;
        const radius=p.size*(.5+p.layer*.75);
        const px=((x/W-.5)/spanX+.5)*particles.width,py=((y/H-.5)/spanY+.5)*particles.height;
        const r=radius*particles.width/(W*spanX);
        ctx.fillStyle=`rgba(208,233,226,${.13+p.layer*.12})`;ctx.beginPath();ctx.ellipse(px,py,r,r*.8,0,0,Math.PI*2);ctx.fill();
      }
      const clamp=(p:number)=>Math.max(0,Math.min(1,p));
      const pan=(1-Math.cos(Math.PI*clamp((t-.5)/11.5)))/2;
      const fade=1-Math.pow(clamp((t-11.2)/.8),2);
      canvas.style.opacity=String((.9+.1*Math.sin(clamp((t-.15)/.9)*Math.PI/2))*fade);
      canvas.style.transform=`translateX(${-7*pan*canvas.clientWidth/W}px) scale(${1+.025*pan})`;
      particles.style.opacity=String((1-Math.pow(1-clamp((t-.3)/1.3),3))*Math.cos(clamp((t-11.35)/.65)*Math.PI/2));
      lastDraw=t;
    }

    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let elapsed=0,previous=performance.now(),raf=0,seekTime:number|undefined;
    const time=()=>seekTime??(reduced.matches?5:(Number(root.dataset.motionSpeed??1)===0&&elapsed===0?5:elapsed%DURATION));
    const redraw=()=>{const t=time();if(t!==lastDraw)render(t);};
    const resize=()=>{
      const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
      const dpr=Math.min(2,devicePixelRatio||1,Math.sqrt((W*H)/(w*h)));
      canvas.width=particles.width=Math.max(1,Math.round(w*dpr));
      canvas.height=particles.height=Math.max(1,Math.round(h*dpr));
      const ratio=w/h,design=W/H;
      spanX=ratio<design?ratio/design:1;spanY=ratio>design?design/ratio:1;
      lastDraw=-1;redraw();
    };
    const observer=new ResizeObserver(resize);observer.observe(canvas);
    host.motionSeek=(t:number)=>{seekTime=Math.max(0,Math.min(DURATION,Number(t)||0));redraw();};
    host.motionReady=Promise.all(images.map(image=>image.decode())).then(()=>{
      if(disposed)return false;
      initGL();ready=true;previous=performance.now();resize();return true;
    }).catch(()=>{
      if(!disposed)status.textContent='插畫素材暫時無法載入，請確認網路後重新開啟。';
      return false;
    });
    const tick=(now:number)=>{
      if(disposed)return;
      const speed=Number(root.dataset.motionSpeed??1);
      if(ready&&!reduced.matches&&Number.isFinite(speed))elapsed+=Math.max(0,now-previous)/1000*Math.max(0,speed);
      previous=now;redraw();raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return ()=>{
      disposed=true;cancelAnimationFrame(raf);observer.disconnect();
      delete host.motionSeek;delete host.motionReady;
      for(const texture of textures)gl.deleteTexture(texture);
      if(buffer)gl.deleteBuffer(buffer);
      if(program)gl.deleteProgram(program);
      for(const shader of shaders)gl.deleteShader(shader);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  },
};
