/* Photographic intro: one registered camera and ACWL, with restrained local ambience. */
(()=>{
 'use strict';
 const app=document.getElementById('app'),art=document.getElementById('art');
 if(!app||!art)return;
 const approach=window.MOD_CINEMATIC;
 const stage=document.createElement('div');stage.id='introStage';stage.className='intro-stage';stage.hidden=true;stage.setAttribute('aria-hidden','true');
 stage.innerHTML='<div class="intro-camera"><div class="intro-haze"></div><div class="intro-haze intro-haze-depth"></div><div class="intro-day"></div><div class="intro-night"><div class="intro-practicals"></div></div><div class="intro-acwl"><i class="intro-acwl-wash"></i><i class="intro-acwl-mount"></i><i class="intro-acwl-glow"></i><i class="intro-acwl-lens"></i></div></div>';
 app.append(stage);
 const cameraLayer=stage.querySelector('.intro-camera'),beacon=stage.querySelector('.intro-acwl'),practicalLayer=stage.querySelector('.intro-practicals'),dayLayer=stage.querySelector('.intro-day'),nightLayer=stage.querySelector('.intro-night');
 // The language photographs were generated separately: never assume mirrored fixture anchors.
 const photoAnchors={en:{beacon:[.858,.245],lights:[[.623,.54],[.819,.509],[.920,.704],[.352,.697]],reflections:[[.646,.790],[.919,.833],[.352,.739]]},ar:{beacon:[.132,.255],lights:[[.366,.541],[.176,.504],[.079,.703],[.648,.696]],reflections:[[.355,.791],[.079,.833],[.648,.739]]}};
 // Measured on the separate day / clean-v30 night photographs (1672 x 941).
 // Glints sit on cabinet top edges and the stair rail; status lamps stay on cabinet faces.
 // Heat is limited to the distant open apron, below the skyline and away from the mast.
 const ambienceAnchors={
  en:{glints:[[1381/1672,554/941,14,-3],[1494/1672,556/941,11,2],[1137/1672,607/941,9,-35]],status:[[1434/1672,566/941],[1525/1672,566/941]],heat:[[.14,.69,.27,.023],[.32,.692,.11,.017]]},
  ar:{glints:[[276/1672,553/941,14,3],[159/1672,556/941,11,-2],[532/1672,607/941,9,35]],status:[[227/1672,566/941],[141/1672,566/941]],heat:[[.86,.691,.27,.023],[.73,.692,.10,.017]]}
 };
 let state={index:-1,lang:'en',theme:'light',motion:true},time=0,night=0,frames=0,registered=false,disposed=false,pageSuspended=false;
 let width=1,height=1,frame={x:0,y:0,w:1672,h:941},transform={zoom:1.024,x:0,y:0},lastTick=0;
 const practicals=[],reflections=[],glints=[],statusLights=[],heatPatches=[];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function project(p){return{x:frame.x+p[0]*frame.w,y:frame.y+p[1]*frame.h}}
 function screenPoint(p){const q=project(p);return{x:width*.5+(q.x-width*.5)*transform.zoom+transform.x,y:height*.5+(q.y-height*.5)*transform.zoom+transform.y}}
 function currentImage(){return document.getElementById('scene'+(state.lang==='ar'?'Ar':'En')+(state.theme==='dark'?'Night':'Day'))}
 function makeNodes(parent,className,count,target){for(let i=0;i<count;i++){const n=document.createElement('i');n.className=className;parent.append(n);target.push(n)}}
 function makePracticalNodes(){makeNodes(practicalLayer,'intro-practical',4,practicals);makeNodes(practicalLayer,'intro-reflection',3,reflections);makeNodes(dayLayer,'intro-glint',3,glints);makeNodes(dayLayer,'intro-heat',2,heatPatches);makeNodes(nightLayer,'intro-status',2,statusLights)}
 function placeAmbience(){
  const anchors=ambienceAnchors[state.lang]||ambienceAnchors.en,unit=frame.w/1672;
  const place=(el,a)=>{const p=project(a);el.style.left=p.x+'px';el.style.top=p.y+'px'};
  glints.forEach((el,i)=>{const a=anchors.glints[i];place(el,a);el.style.width=a[2]*unit+'px';el.style.height=1.5*unit+'px';el.style.rotate=a[3]+'deg'});
  statusLights.forEach((el,i)=>{place(el,anchors.status[i]);el.style.scale=String(unit)});
  heatPatches.forEach((el,i)=>{const a=anchors.heat[i];place(el,a);el.style.width=a[2]*frame.w+'px';el.style.height=a[3]*frame.h+'px'});
 }
 function placeFixtures(){const anchors=photoAnchors[state.lang]||photoAnchors.en,p=project(anchors.beacon),unit=clamp(frame.w/1672,.82,1.55);beacon.style.left=p.x+'px';beacon.style.top=p.y+'px';beacon.style.scale=String(unit);const sp=screenPoint(anchors.beacon);beacon.hidden=sp.x<8||sp.x>width-8||sp.y<8||sp.y>height-8;practicals.forEach((el,i)=>{const q=project(anchors.lights[i]);el.style.left=q.x+'px';el.style.top=q.y+'px';el.style.scale=String(unit)});reflections.forEach((el,i)=>{const q=project(anchors.reflections[i]);el.style.left=q.x+'px';el.style.top=q.y+'px';el.style.scale=String(unit)});}
 function resize(){if(disposed)return;width=app.clientWidth||innerWidth||1366;height=app.clientHeight||innerHeight||768;const img=currentImage(),iw=img?.naturalWidth||1672,ih=img?.naturalHeight||941,s=Math.max(width/iw,height/ih),focus=width<=700?(state.lang==='ar'?.10:.90):.5;frame={x:(width-iw*s)*focus,y:(height-ih*s)*.5,w:iw*s,h:ih*s};art.style.setProperty('--intro-focus',focus*100+'%');placeFixtures();placeAmbience();draw()}
 function draw(){
  if(disposed||state.index!==0)return;
  const phase=time*Math.PI*2/52,mirror=state.lang==='ar'?-1:1;
  transform={zoom:1.026+.017*(1-Math.cos(phase))*.5,x:Math.sin(phase)*width*.004*mirror,y:Math.sin(phase*.5)*height*.002};
  const tx='translate3d('+transform.x.toFixed(3)+'px,'+transform.y.toFixed(3)+'px,0) scale('+transform.zoom.toFixed(6)+')';
  art.style.setProperty('--intro-camera',tx);cameraLayer.style.setProperty('--intro-camera',tx);
  // A single 2.4 s obstruction-light pulse. Housing remains visible between pulses.
  const beat=(time%2.4)/2.4,flash=Math.exp(-Math.pow((beat-.25)/.10,2)),power=.21+flash*.79;
  stage.style.setProperty('--intro-beacon',power.toFixed(4));stage.style.setProperty('--intro-haze',String(.43+Math.sin(time*.16)*.1));stage.style.setProperty('--intro-air-x',Math.sin(time*.07)*width*.012+'px');app.style.setProperty('--intro-type-shine',((Math.sin(time*.11)+1)*50).toFixed(2)+'%');
  // Stable positions, slow independent luminance changes: no travelling highlights or particles.
  glints.forEach((el,i)=>{el.style.opacity=(.025+.21*Math.pow(.5+.5*Math.sin(time*(.29+i*.035)+i*2.1),6)).toFixed(4)});
  practicals.forEach((el,i)=>{el.style.opacity=(.28+Math.sin(time*.21+i*1.7)*.012).toFixed(4)});
  reflections.forEach((el,i)=>{el.style.opacity=(.33+Math.sin(time*.21+i*1.7)*.016).toFixed(4)});
  statusLights.forEach((el,i)=>{el.style.opacity=(.22+.14*Math.pow(.5+.5*Math.sin(time*.49+i*2.6),4)).toFixed(4)});
  heatPatches.forEach((el,i)=>{el.style.opacity=(.13+Math.sin(time*.33+i*2)*.025).toFixed(4);el.style.setProperty('--intro-heat-y',(Math.sin(time*.47+i*1.8)*.65*frame.h/941).toFixed(3)+'px')});
  placeFixtures();
  frames++;
 }
 function running(){return!disposed&&!pageSuspended&&state.index===0&&state.motion&&!document.hidden}
 function tick(_elapsed,delta){if(!running())return;const now=performance.now(),dt=delta>0?Math.min(delta/1000,.06):lastTick?Math.min((now-lastTick)/1000,.06):1/60;lastTick=now;time+=dt;const target=state.theme==='dark'?1:0;night+= (target-night)*Math.min(1,dt*4.5);draw()}
 function lifecycle(){if(disposed)return;const live=running();stage.hidden=state.index!==0;document.body.classList.toggle('intro-view',state.index===0);document.body.classList.toggle('intro-paused',!live);dayLayer.style.opacity=state.theme==='dark'?'0':'1';nightLayer.style.opacity=state.theme==='dark'?'1':'0';if(live&&!registered&&window.gsap){gsap.ticker.add(tick);registered=true;lastTick=0}else if(!live&&registered){gsap.ticker.remove(tick);registered=false;lastTick=0}if(!live)night=state.theme==='dark'?1:0;draw()}
 function sync(s){if(disposed)return;const entering=s.index===0&&state.index!==0,layout=s.lang!==state.lang||entering||s.theme!==state.theme;state={...s};if(entering){time=0;night=state.theme==='dark'?1:0}if(layout)resize();lifecycle()}
 function replay(){if(disposed)return;time=0;draw();lifecycle()}
 function diagnostics(){const a=(photoAnchors[state.lang]||photoAnchors.en).beacon;return{available:true,webgl:false,running:running(),registered,frames,time,scene:'Photographic apron with single mast ACWL',beaconCount:stage.querySelectorAll('.intro-acwl').length,beaconAnchor:[...a],beaconNatural:project(a),beaconScreen:screenPoint(a),beaconVisible:!beacon.hidden,beaconDiameter:(width<=700?9:10)*clamp(frame.w/1672,.82,1.55)*transform.zoom,imageFrame:{...frame},camera:{...transform},meshCount:0,triangles:0,night}}
 window.MOD_INTRO={sync,replay,refresh:resize,diagnostics,projectPhotoPoint:screenPoint};
 // Existing shell integration remains stable; approach owns its own renderer/ticker.
 window.MOD_CINEMATIC={sync(s){approach?.sync(s);sync(s)},replay(){if(state.index===0)replay();else approach?.replay()},selectStage:(...args)=>approach?.selectStage(...args),diagnostics:()=>state.index===0?diagnostics():(approach?.diagnostics()||{available:false})};
 makePracticalNodes();
 const observer=new ResizeObserver(resize);observer.observe(app);
 const sceneImages=[...document.querySelectorAll('.scene-layer')];sceneImages.forEach(img=>img.addEventListener('load',resize));
 document.addEventListener('visibilitychange',lifecycle);
 function pagehide(e){pageSuspended=true;lifecycle();if(e.persisted)return;disposed=true;stage.hidden=true;observer.disconnect();sceneImages.forEach(img=>img.removeEventListener('load',resize));document.removeEventListener('visibilitychange',lifecycle);window.removeEventListener('pagehide',pagehide);window.removeEventListener('pageshow',pageshow)}
 function pageshow(e){if(e.persisted&&!disposed){pageSuspended=false;resize();lifecycle()}}
 window.addEventListener('pagehide',pagehide);
 window.addEventListener('pageshow',pageshow);
 resize();
})();
