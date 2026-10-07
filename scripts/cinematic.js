/* Intro scene: continuous 5G activity and a slow camera loop.
   The backplate and WebGL layer use the same cover-fit registration and transform.
   All placement and motion parameters live in config/presentation.js. */
(() => {
 'use strict';
 const canvas=document.getElementById('cinematicCanvas'),art=document.getElementById('art');
 const cfg=window.MOD_CONFIG.cinematic;
 const api={sync:()=>{},replay:()=>{},diagnostics:()=>({available:false})};
 window.MOD_CINEMATIC=api;
 if(!cfg.enabled||!window.THREE||!window.gsap)return;
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});}catch{return;}
 renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(0,1,1,0,.1,5000);
 camera.position.z=1500;
 const signals=new THREE.Group();scene.add(signals);
 let state={index:0,motion:true,lang:'en',theme:'light'},registered=false,frameCount=0,contextLost=false;
 const clock={phase:0,night:0},frame={x:0,y:0,w:1,h:1},view={width:1,height:1};
 const loops=[],routes=[],resources=[],color=new THREE.Color(),dayColor=new THREE.Color(0x9c7738),nightColor=new THREE.Color(0xe0bd76);
 const coord=(point,z=0)=>new THREE.Vector3(frame.x+(state.lang==='ar'?1-point[0]:point[0])*frame.w,view.height-frame.y-point[1]*frame.h,z);
 let beacon;
 function track(mesh){signals.add(mesh);resources.push(mesh);return mesh}
 function halo(size){return new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,uniforms:{strength:{value:0},tint:{value:color}},vertexShader:'varying vec2 p;void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 p;uniform float strength;uniform vec3 tint;void main(){float d=length(p-.5)*2.;gl_FragColor=vec4(tint,pow(max(0.,1.-d),3.)*strength);}'}))}
 function build(){
  resources.splice(0).forEach(m=>{signals.remove(m);m.geometry.dispose();m.material.dispose()});loops.length=routes.length=0;
  view.width=innerWidth;view.height=innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,cfg.maxPixelRatio));renderer.setSize(view.width,view.height,false);
  camera.left=0;camera.right=view.width;camera.top=view.height;camera.bottom=0;camera.updateProjectionMatrix();
  // CSS object-fit:cover and percentage object-position use this same equation.
  const scale=Math.max(view.width/cfg.photo.width,view.height/cfg.photo.height);
  frame.w=cfg.photo.width*scale;frame.h=cfg.photo.height*scale;
  const focus=view.width<=700?(state.lang==='ar'?cfg.photo.portraitFocusAr:cfg.photo.portraitFocusEn):cfg.photo.desktopFocus;
  frame.x=(view.width-frame.w)*focus;frame.y=(view.height-frame.h)*.5;
  document.querySelector('.ambient').style.setProperty('--photo-position',(focus*100)+'%');
  const unit=frame.w/cfg.photo.width;
  const mast=coord(cfg.anchors.mast,8),base=coord(cfg.anchors.mastBase,7);
  [0,1,2,3].forEach(i=>{const ring=track(new THREE.Mesh(new THREE.RingGeometry(1,1.014,128),new THREE.MeshBasicMaterial({color,transparent:true,side:THREE.DoubleSide,depthWrite:false,toneMapped:false})));ring.position.copy(mast);loops.push({mesh:ring,offset:i/4,ground:false})});
  [0,1].forEach(i=>{const ring=track(new THREE.Mesh(new THREE.RingGeometry(1,1.012,128),new THREE.MeshBasicMaterial({color,transparent:true,side:THREE.DoubleSide,depthWrite:false,toneMapped:false})));ring.position.copy(base);loops.push({mesh:ring,offset:i/2,ground:true})});
  [cfg.anchors.shelter,cfg.anchors.operations].forEach((a,i)=>{
   const start=coord(a,9),middle=start.clone().lerp(base,.5);middle.y+=frame.h*.06;
   const path=new THREE.QuadraticBezierCurve3(start,middle,base);
   const points=path.getPoints(72),geometry=new THREE.BufferGeometry().setFromPoints(points);
   const line=track(new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity:.30,depthWrite:false,toneMapped:false})));
   const packets=[];
   for(let j=0;j<3;j++){
    const packet=track(new THREE.Mesh(new THREE.SphereGeometry(2.2*unit,12,8),new THREE.MeshBasicMaterial({color,transparent:true,depthWrite:false,toneMapped:false})));
    const glow=track(halo(26*unit));packets.push({packet,glow,offset:j/3});
   }
   const source=track(new THREE.Mesh(new THREE.RingGeometry(5*unit,6.4*unit,48),new THREE.MeshBasicMaterial({color,transparent:true,depthWrite:false,toneMapped:false})));source.position.copy(start);
   routes.push({line,source,path,packets,offset:i*.22});
  });
  beacon=track(halo(38*unit));beacon.position.copy(mast);beacon.position.z=10;
  draw();
 }
 const loop=gsap.to(clock,{phase:1,duration:cfg.duration,repeat:-1,ease:'none',paused:true});
 function draw(){
  const time=clock.phase*cfg.duration,night=clock.night,phase=clock.phase*Math.PI*2;
  const cameraWave=(1-Math.cos(phase))*.5,mirror=state.lang==='ar'?-1:1;
  const zoom=cfg.camera.baseZoom+cfg.camera.zoomRange*cameraWave;
  const dx=Math.sin(phase)*view.width*cfg.camera.driftX*mirror,dy=Math.sin(phase)*view.height*cfg.camera.driftY;
  const transform=`translate3d(${dx.toFixed(3)}px,${dy.toFixed(3)}px,0) scale(${zoom.toFixed(6)})`;
  art.style.transform=canvas.style.transform=transform;
  color.copy(dayColor).lerp(nightColor,night);
  const unit=frame.w/cfg.photo.width,intensity=cfg.signalStrength;
  loops.forEach(({mesh,offset,ground})=>{
   const p=(clock.phase*(ground?5:7)+offset)%1,radius=(ground?26+p*144:18+p*170)*unit;
   mesh.scale.set(radius,radius*(ground?.24:.57),1);
   mesh.material.color.copy(color);mesh.material.opacity=Math.sin(p*Math.PI)*(ground?.32:.58)*intensity*(.85+night*.3);
  });
  routes.forEach(({line,source,path,packets,offset})=>{
   line.material.color.copy(color);line.material.opacity=.19+night*.13;
   source.material.color.copy(color);source.material.opacity=.6+Math.sin(phase*12+offset)*.18;
   packets.forEach(({packet,glow,offset:shift})=>{const p=(clock.phase*8+shift+offset)%1,opacity=Math.min(1,p*10,(1-p)*10);packet.position.copy(path.getPoint(p));packet.material.color.copy(color);packet.material.opacity=opacity;glow.position.copy(packet.position);glow.material.uniforms.strength.value=opacity*(.55+night*.35)});
  });
  beacon.material.uniforms.strength.value=.18+(Math.sin(phase*15)+1)*.13;
  document.querySelector('.sunlight').style.opacity=String((1-night)*(.3+cameraWave*.2));
  renderer.render(scene,camera);frameCount++;
 }
 function running(){return state.index===0&&state.motion&&!document.hidden&&!contextLost}
 function updateLifecycle(){
  document.body.classList.toggle('cinematic-inactive',state.index!==0);
  if(running()){loop.play();if(!registered){gsap.ticker.add(draw);registered=true}}
  else{loop.pause();if(registered){gsap.ticker.remove(draw);registered=false}draw()}
 }
 api.sync=s=>{
  const changed=s.lang!==state.lang,themeChanged=s.theme!==state.theme;state={...s};
  if(changed)build();
  if(themeChanged){gsap.killTweensOf(clock,'night');if(state.motion&&!document.hidden)gsap.to(clock,{night:state.theme==='dark'?1:0,duration:.9,ease:'sine.inOut',onUpdate:()=>{if(!registered)draw()}});else clock.night=state.theme==='dark'?1:0}
  updateLifecycle();
 };
 api.replay=()=>{loop.pause(0);draw();updateLifecycle()};
 api.diagnostics=()=>({available:true,library:'Three.js + GSAP',running:running(),duration:cfg.duration,frameCount,pixelRatio:renderer.getPixelRatio(),imageFrame:{...frame},camera:art.style.transform,renderCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,contextLost});
 new ResizeObserver(build).observe(document.getElementById('app'));
 document.addEventListener('visibilitychange',updateLifecycle);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;updateLifecycle()});
 canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;build();updateLifecycle()});
 window.addEventListener('pagehide',()=>{loop.pause();gsap.ticker.remove(draw);registered=false});
 build();
})();
