/* Original live scene: mobile DC arrival, dual-core facilities and RAN activation. */
(()=>{
 'use strict';
 const T=THREE,M=MOD_MODELS,canvas=document.getElementById('cinematicCanvas');
 let renderer;try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'})}catch{return}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,MOD_CONFIG.scene.maxPixelRatio));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-16,16,9,-9,.1,180);camera.position.set(17,13,22);camera.lookAt(0,.9,0);
 const ambient=new T.HemisphereLight(0xfff6e4,0x827565,2.2);scene.add(ambient);
 const sun=new T.DirectionalLight(0xffe0a3,3.3);sun.position.set(-12,21,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-17;sun.shadow.camera.right=17;sun.shadow.camera.top=14;sun.shadow.camera.bottom=-14;sun.shadow.camera.far=65;sun.shadow.radius=3;sun.shadow.normalBias=.025;sun.shadow.bias=-.00005;scene.add(sun);
 const fill=new T.DirectionalLight(0xbad6ee,.8);fill.position.set(10,7,-12);scene.add(fill);
 const studio=new MOD_THREE_ADDONS.RoomEnvironment(renderer),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(studio,.06);scene.environment=env.texture;studio.dispose();pmrem.dispose();
 const campus=new T.Group();scene.add(campus);
 M.box(campus,22,.24,13,M.palette.stone,0,-.16,0,.22);
 M.box(campus,21.65,.03,12.65,M.palette.ivory,0,-.023,0,.12);
 M.box(campus,21.5,.018,3.1,M.palette.road,0,.01,3.65,.015);
 for(let x=-10;x<10;x+=1.35)M.box(campus,.65,.012,.045,M.palette.white,x,.026,3.65,.005);
 // Construction joints and site lighting, aligned to the ground plane.
 for(let x=-9;x<=9;x+=3)M.box(campus,.012,.006,8.8,M.palette.edge,x,.005,-1.3,.002);
 for(let z=-5;z<=2;z+=2.3)M.box(campus,21,.006,.012,M.palette.edge,0,.005,z,.002);
 for(const x of [-9,-5,0,5,9])for(const z of [-5.8,5.7]){M.cyl(campus,.055,.65,M.palette.dark,x,.32,z,12);M.lamp(campus,x,.69,z,0xffd29a,.057)}
 const pulse=M.building('pulse');pulse.group.position.set(-5.5,0,-1.4);campus.add(pulse.group);
 const customer=M.building('customer');customer.group.position.set(5.1,0,-1.1);campus.add(customer.group);
 const dish=M.dish();dish.group.position.set(5.9,2.52,-1.0);campus.add(dish.group);
 const towers=[[-5.9,-5.1,4.8],[0,-5.2,6.0],[5.8,-5.2,4.8]].map(([x,z,h])=>{const m=M.mast(h);m.group.position.set(x,0,z);campus.add(m.group);return m});
 // Site access barrier, edge cabinet and a scanning security camera.
 const checkpoint=new T.Group();checkpoint.position.set(-8.3,0,1.95);campus.add(checkpoint);
 M.box(checkpoint,.42,1.05,.48,M.palette.dark,0,.525,0,.07);
 M.box(checkpoint,.45,.11,.51,M.palette.gold,0,1.09,0,.04);
 const gateArm=new T.Group();gateArm.userData.dynamic=true;gateArm.position.set(0,.95,0);checkpoint.add(gateArm);
 M.box(gateArm,.13,.12,3.2,M.palette.ivory,0,0,1.52,.02);
 for(let i=0;i<7;i++)M.box(gateArm,.14,.13,.15,M.palette.gold,0,0,.2+i*.43,.008);
 const gateLamp=M.lamp(checkpoint,0,1.22,0,0x80cdb0,.07);
 const cameraPole=new T.Group();cameraPole.position.set(8.4,0,-2.1);campus.add(cameraPole);
 M.box(cameraPole,.65,.12,.65,M.palette.stone,0,.06,0,.06);M.cyl(cameraPole,.065,3.6,M.palette.metal,0,1.85,0);
 M.bar(cameraPole,[0,3.45,0],[0,3.45,.5],.06,M.palette.metal);
 const cameraHead=new T.Group();cameraHead.userData.dynamic=true;cameraHead.position.set(0,3.32,.55);cameraPole.add(cameraHead);
 M.box(cameraHead,.45,.32,.65,M.palette.ivory,0,0,.15,.1);
 const lens=M.cyl(cameraHead,.115,.06,M.palette.glass,0,0,.50);lens.rotation.x=Math.PI/2;
 M.box(cameraHead,.51,.07,.76,M.palette.white,0,.2,.20,.04);
 const cabinet=new T.Group();cabinet.position.set(-8.7,0,-.1);campus.add(cabinet);
 M.box(cabinet,1.15,1.9,.95,M.palette.ivory,0,.99,0,.07);M.box(cabinet,1.02,1.73,.045,M.palette.dark,0,.98,.5,.03);
 for(let i=0;i<11;i++){M.box(cabinet,.83,.07,.035,M.palette.metal,0,.27+i*.12,.53,.01);M.lamp(cabinet,-.34,.27+i*.12,.556,0x80cdb0,.017)}
 M.box(cabinet,1.21,.1,1.02,M.palette.gold,0,1.99,0,.04);
 const pedestal=M.cyl(campus,.90,.23,M.palette.dark,0,.115,.4,48);
 const globe=new T.Group();globe.position.set(0,1.27,.4);globe.userData.dynamic=true;campus.add(globe);
 const globeMaterial=new T.MeshStandardMaterial({color:0xcba353,metalness:.82,roughness:.3,transparent:true,opacity:.83});
 const globeShell=new T.Mesh(new T.IcosahedronGeometry(.85,1),new T.MeshBasicMaterial({color:0xd5b76c,wireframe:true,transparent:true,opacity:.55}));globe.add(globeShell);
 for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(.86,.012,5,80),globeMaterial);ring.rotation.set(i*Math.PI/3,i*Math.PI/3,0);globe.add(ring)}
 const globeInner=new T.Mesh(new T.IcosahedronGeometry(.56,1),new T.MeshPhysicalMaterial({color:0xbe9448,metalness:.65,roughness:.3,transparent:true,opacity:.16}));globe.add(globeInner);
 const truck=M.truck();scene.add(truck.group);truck.group.userData.dynamic=true;
 const groundShadow=new T.Mesh(new T.PlaneGeometry(50,35),new T.ShadowMaterial({color:0x32291c,opacity:.24}));groundShadow.rotation.x=-Math.PI/2;groundShadow.position.y=-.02;groundShadow.receiveShadow=true;scene.add(groundShadow);
 const routes=[];
 function route(points,stage){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const tube=new T.Mesh(new T.TubeGeometry(curve,48,.028,6,false),new T.MeshStandardMaterial({color:0xb4873b,emissive:0x9d6c25,emissiveIntensity:.12,metalness:.5,roughness:.35,transparent:true,opacity:.35}));campus.add(tube);tube.userData.dynamic=true;const packets=[];for(let i=0;i<4;i++){const m=new T.Mesh(new T.SphereGeometry(.068,10,8),new T.MeshBasicMaterial({color:0xffdb87}));campus.add(m);m.userData.dynamic=true;packets.push(m)}routes.push({curve,tube,packets,stage})}
 route([[-5.5,.14,.5],[-4,.15,1.9],[0,.15,2.05],[4.6,.15,2.1],[4.8,.15,3.4]],1);
 route([[-5.5,.17,.5],[-3,.2,-.4],[0,.2,.4],[3,.2,.0],[5.1,.2,.4]],3);
 towers.forEach(t=>{const p=t.group.position;route([[p.x,.16,p.z],[p.x*.7,.16,-3.5],[0,.16,-1.6],[0,.16,.4]],2)});
 // Physical demonstration screens, with independently animated live graphics.
 const desk=new T.Group();desk.userData.dynamic=true;desk.position.set(-.8,0,5.2);campus.add(desk);
 const screenCanvas=document.createElement('canvas');screenCanvas.width=768;screenCanvas.height=384;const ctx=screenCanvas.getContext('2d');const screenTexture=new T.CanvasTexture(screenCanvas);screenTexture.colorSpace=T.SRGBColorSpace;
 for(let i=0;i<2;i++){const x=(i-.5)*2.85;M.box(desk,2.78,1.58,.13,M.palette.dark,x,1.35,0,.06);M.box(desk,.10,.65,.13,M.palette.metal,x,.4,0);M.box(desk,1.1,.07,.65,M.palette.dark,x,.08,.1);const panel=new T.Mesh(new T.PlaneGeometry(2.56,1.36),new T.MeshBasicMaterial({map:screenTexture,toneMapped:false}));panel.position.set(x,1.35,.072);desk.add(panel)}
 // Batch static meshes by material. Moving wheels, doors and equipment stay independent.
 function compact(root){root.updateMatrixWorld(true);const inv=root.matrixWorld.clone().invert(),buckets=new Map(),remove=[];function walk(o){if(o!==root&&o.userData.dynamic)return;if(o.isMesh&&!Array.isArray(o.material)&&!o.material.transparent){const mat=o.material;let b=buckets.get(mat);if(!b){b={position:[],normal:[],uv:[]};buckets.set(mat,b)}const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(inv.clone().multiply(o.matrixWorld));for(const attr of ['position','normal','uv']){const a=geo.attributes[attr];if(a)for(let i=0;i<a.array.length;i++)b[attr].push(a.array[i]);}geo.dispose();remove.push(o)}else o.children.slice().forEach(walk)}walk(root);remove.forEach(o=>{o.parent.remove(o);o.geometry.dispose()});for(const [mat,b]of buckets){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(b.position,3));geo.setAttribute('normal',new T.Float32BufferAttribute(b.normal,3));if(b.uv.length)geo.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;root.add(m)}}
 [pulse.group,customer.group,...towers.map(m=>m.group),cabinet,cameraPole,checkpoint].forEach(g=>{g.userData.dynamic=true;compact(g)});
 truck.wheels.forEach(compact);compact(truck.hinge);compact(truck.group);compact(campus);
 // Intro has a separate transparent renderer and registered photographic stage.
 // This scene now owns approach only; it never runs a hidden intro ticker.
 let state={index:-1,lang:'en',theme:'light',motion:true},activeStage=0,registered=false,frames=0,last=0;
 const timing={time:0,arrival:0,night:0,door:0,demonstrate:0};
 const shot={x:20,y:8,z:22,tx:1,ty:.8,tz:3,zoom:1.04,cores:.05,ran:.05};
 const shots=[{x:20,y:8,z:22,tx:1,ty:.8,tz:3,zoom:1.10,cores:.05,ran:.05},{x:7,y:8,z:24,tx:-1,ty:1.1,tz:1.5,zoom:1.18,cores:1,ran:.05},{x:-17,y:16,z:22,tx:0,ty:2,tz:-1.8,zoom:.94,cores:1,ran:1},{x:12,y:7,z:26,tx:.6,ty:1,tz:3,zoom:1.20,cores:1,ran:.65}];
 let shotTween=null;
 const live=gsap.to(timing,{time:3600,duration:3600,ease:'none',repeat:-1,paused:true});
 let arrivalTween=null,doorTween=null,demoTween=null,introStart=0;
 const labels=document.getElementById('worldLabels'),anchors={pulse:new T.Vector3(-5.5,3.9,-1.4),customer:new T.Vector3(5.1,3.9,-1.1),ran:new T.Vector3(0,7.2,-5.2),mobile:new T.Vector3(4.8,.1,5.4),network:new T.Vector3(0,2.5,.4)};
 function buildLabels(){const c=MOD_COPY[state.lang].approach;labels.innerHTML=`<div class="world-label" data-anchor="pulse"><small>${c.core1}</small><strong>${c.pulseCore}</strong><span>${c.voice}</span><b class="core-location">${c.pulseLocation}</b></div><div class="world-label" data-anchor="customer"><small>${c.core2}</small><strong>${c.customerCore}</strong><span>${c.other}</span><b class="core-location">${c.customerLocation}</b></div><div class="world-label label-ran" data-anchor="ran"><strong>${c.ran}</strong></div><div class="world-label label-mobile" data-anchor="mobile"><strong>${c.mahawi}</strong><span>${c.mobileDC}</span></div><div class="world-label label-network" data-anchor="network"><strong>${c.network}</strong></div>`}
 function resize(){const W=innerWidth,H=innerHeight,portrait=W<=700,approach=state.index===1;renderer.setSize(W,H,false);const extent=approach?(portrait?22/(W/H):MOD_CONFIG.scene.desktopExtent*Math.max(1,1366/W)):(portrait?19:MOD_CONFIG.scene.introExtent);camera.left=-extent*W/H;camera.right=extent*W/H;camera.top=extent;camera.bottom=-extent;camera.clearViewOffset();const centerX=approach?(portrait?(state.lang==='ar'?.25:.75):state.lang==='ar'?.30:.70):(portrait?(state.lang==='ar'?.365:.635):(state.lang==='ar'?.23:.77));const centerY=approach?(portrait?.47:.49):.83;camera.setViewOffset(W,H,(.5-centerX)*W,(.5-centerY)*H,W,H);camera.position.set(17,approach?13:7,22);camera.lookAt(0,approach?.9:.8,0);camera.updateProjectionMatrix();draw(true)}
 function graphics(t){ctx.fillStyle='#102123';ctx.fillRect(0,0,768,384);ctx.strokeStyle='#34514e';ctx.lineWidth=1;for(let x=0;x<768;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,384);ctx.stroke()}for(let y=0;y<384;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(768,y);ctx.stroke()};const points=[[90,200],[220,110],[375,205],[525,110],[655,240]];ctx.strokeStyle='#cba557';ctx.lineWidth=3;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();points.forEach(([x,y],i)=>{ctx.fillStyle='#ecc37a';ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#be995966';ctx.beginPath();ctx.arc(x,y,12+(t*12+i*8)%27,0,Math.PI*2);ctx.stroke()});ctx.fillStyle='#e5c386';for(let i=0;i<55;i++)ctx.fillRect(30+i*13,350-((Math.sin(t*1.3+i*.3)+1)*14+6),6,3);screenTexture.needsUpdate=true}
 function draw(force=false){if(state.index!==1){labels.hidden=true;truck.group.visible=false;return}if(!force&&performance.now()-last<1000/40)return;last=performance.now();const t=timing.time,n=timing.night,approach=state.index===1;campus.visible=approach;labels.hidden=!approach;groundShadow.visible=false;truck.group.visible=approach;
  if(approach){truck.group.position.set(-7.8+timing.arrival*12.6,.055,3.45);truck.group.rotation.y=0;truck.group.scale.setScalar(1);}
  else{const progress=Math.min(1,(t-introStart)/6);truck.group.position.set(-3+progress*3,.0,0);truck.group.rotation.y=state.lang==='ar'?Math.PI:.0;truck.group.scale.setScalar(innerWidth<=700?1.65:2.25)}
  truck.animate(approach?timing.arrival*25:Math.min(6,t-introStart)*.8,approach?timing.door:Math.min(1,Math.max(0,(t-introStart-6)/2)),n,t);if(approach){camera.position.set(shot.x+Math.sin(t*.16)*.3,shot.y,shot.z);camera.lookAt(shot.tx,shot.ty,shot.tz);camera.zoom=shot.zoom;camera.updateProjectionMatrix();pulse.group.scale.y=shot.cores;customer.group.scale.y=shot.cores;pulse.group.visible=shot.cores>.1;customer.group.visible=shot.cores>.1;dish.group.scale.setScalar(shot.cores);dish.group.position.y=2.52*shot.cores;globe.visible=activeStage>0;towers.forEach(m=>m.group.scale.y=shot.ran)}
  gateArm.rotation.x=-(activeStage===0?Math.sin(Math.min(1,timing.arrival*4)*Math.PI/2):1)*Math.PI*.46;cameraHead.rotation.y=Math.sin(t*.35)*.65;
  pulse.fan.rotation.y=t*2.7;customer.fan.rotation.y=-t*2.4;dish.swivel.rotation.y=Math.sin(t*.23)*.28;
  globe.rotation.y=t*.10;globeShell.material.opacity=.35+.13*Math.sin(t*.9);
  towers.forEach((tower,i)=>{tower.beacon.material.emissiveIntensity=((t+i*.2)%1.7<.14?3:.15)+n*.1;tower.rings.forEach((ring,j)=>{const q=(t*.24+j/3+i*.1)%1;ring.scale.setScalar(.3+q*1.85);ring.material.opacity=activeStage>=2?Math.sin(q*Math.PI)*(.3+n*.15):0})});
  routes.forEach((r,i)=>{const active=activeStage>=r.stage;r.tube.material.opacity=active?.85:.13;r.tube.material.emissiveIntensity=active?.25+n*.8:.02;r.packets.forEach((p,j)=>{p.visible=active;p.position.copy(r.curve.getPoint((t*.14+j/4+i*.09)%1))})});
  desk.scale.setScalar(Math.max(.001,timing.demonstrate));desk.position.y=(1-timing.demonstrate)*-.8;desk.visible=timing.demonstrate>.01;if(desk.visible&&(force||frames%3===0))graphics(t);
  sun.position.x=state.lang==='ar'?12:-12;for(const mat of Object.values(M.palette))mat.envMapIntensity=.5-n*.3;ambient.intensity=1.45-n*1.12;sun.intensity=2.35-n*1.98;fill.intensity=.55+n*.10;renderer.toneMappingExposure=.95-n*.06;
  renderer.render(scene,camera);frames++;
  if(approach){for(const el of labels.children){const v=anchors[el.dataset.anchor].clone().project(camera);el.style.left=((v.x+1)*innerWidth/2)+'px';el.style.top=((-v.y+1)*innerHeight/2)+'px'}labels.dataset.phase=activeStage;}
 }
 const tick=()=>draw(false);
 function running(){return state.index===1&&state.motion&&!document.hidden}
 function lifecycle(){if(running()){live.resume();shotTween?.resume();arrivalTween?.resume();doorTween?.resume();demoTween?.resume();if(!registered){gsap.ticker.add(tick);registered=true}}else{live.pause();shotTween?.pause();arrivalTween?.pause();doorTween?.pause();demoTween?.pause();if(registered){gsap.ticker.remove(tick);registered=false}draw(true)}}
 function selectStage(s,animate=true){activeStage=s;shotTween?.kill();shotTween=gsap.to(shot,{...shots[s],duration:animate&&state.motion?2.2:0,ease:'power2.inOut',onUpdate:()=>{if(!registered)draw(true)}});arrivalTween?.kill();doorTween?.kill();demoTween?.kill();if(s===0){timing.arrival=0;arrivalTween=gsap.to(timing,{arrival:1,duration:MOD_CONFIG.scene.arrivalSeconds,ease:'power1.inOut'})}else timing.arrival=1;doorTween=gsap.to(timing,{door:s>=1?1:0,duration:animate?1.3:0,ease:'power2.inOut'});demoTween=gsap.to(timing,{demonstrate:s===3?1:0,duration:animate?1.2:0,ease:'power2.inOut'});if(!animate||!state.motion){arrivalTween?.progress(1);doorTween?.progress(1);demoTween?.progress(1)}lifecycle();}
 window.MOD_CINEMATIC={sync(s){const layout=s.index!==state.index||s.lang!==state.lang,theme=s.theme!==state.theme;state={...s};canvas.style.opacity=state.index===1?'1':'0';if(layout){buildLabels();resize()}if(theme){gsap.to(timing,{night:s.theme==='dark'?1:0,duration:state.motion&&state.index===1?1:0,onUpdate:()=>{if(!registered)draw(true)}})}lifecycle()},replay(){timing.time=0;introStart=0;if(state.index===1)selectStage(0,true);draw(true)},selectStage,diagnostics:()=>({available:true,scene:'Four cinematic deployment sequences',camera:{x:shot.x,y:shot.y,z:shot.z,zoom:shot.zoom,cores:shot.cores,ran:shot.ran},introTruckVisible:truck.group.visible,running:running(),frames,renderCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,stage:activeStage,arrival:timing.arrival,door:timing.door,screen:timing.demonstrate,truckX:truck.group.position.x})};
 new ResizeObserver(resize).observe(document.getElementById('app'));document.addEventListener('visibilitychange',lifecycle);buildLabels();resize();
})();
