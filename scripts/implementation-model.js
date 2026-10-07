/* An architectural assembly theatre, not a simulation of deployment status.
   Detailed equipment is illustrative. No vendor configuration is asserted. */
(()=>{'use strict';const T=THREE;
function create(dark=false){
 const k=MOD_PREMIUM_KIT.create(dark),{scene,camera,g,box,cyl,rod,ring,mesh,mat,ivory,navy,gold,rubber,stone,glass,led}=k;
 const metal=mat(0x86969a,.37,.8),silver=mat(0xc6cdca,.45,.7),blue=mat(0x4d8891,.32,.5),wire=mat(0x3d6973,.53,.3),hazard=mat(0xdec286,.61,.16);
 const stage=g(scene),shelter=g(stage,-2.25,.12,-.85),tower=g(stage,4.6,.12,-.8),demo=g(stage,-.10,.12,3.3),device=g(stage,-5.1,.12,3.10);
 const moving=[],lights=[],fans=[],streams=[],roof=g(shelter,0,3.0,0),rackFronts=[],rackGroups=[];
 let selected=0,exploded=false,immersive=false,dead=false,time=0,blend=1,roofBlend=0,roofTarget=0,spin=.0,shadowDirty=true,night=dark?1:0,settledTime=0;
 box(stage,0,-.14,.0,15.6,.35,10.25,navy,.20);box(stage,0,.041,.0,15.48,.05,10.12,ivory,.13);
 for(let x=-7.3;x<7.5;x+=1.15)box(stage,x,.073,0,.013,.006,9.7,gold,0);
 for(let z=-4.7;z<4.9;z+=1.15)box(stage,0,.074,z,15.1,.005,.013,gold,0);
 for(const z of [-4.95,4.95])box(stage,0,.025,z,14.95,.023,.024,gold,.005);
 // Mobile shelter: chassis, outriggers, wheel axles and service steps.
 box(shelter,0,.38,0,6.28,.24,3.30,navy,.045);box(shelter,0,.54,0,6.15,.11,3.16,stone,.025);
 for(const x of [-2.28,2.28])for(const z of [-1.64,1.64]){const wheel=cyl(shelter,x,.23,z,.23,.16,rubber,24);wheel.rotation.x=Math.PI/2;const hub=cyl(shelter,x,.23,z+(z>0?.085:-.085),.11,.03,metal,24);hub.rotation.x=Math.PI/2;box(shelter,x,.51,z,.68,.10,.25,ivory,.04)}
 for(const x of [-2.75,2.75])for(const z of [-1.3,1.3]){cyl(shelter,x,.18,z,.048,.36,metal,12);box(shelter,x,.027,z,.34,.06,.29,navy,.03)}
 for(let j=0;j<3;j++)box(shelter,-.5,.15+j*.14,1.98-j*.19,1.45,.12,.27,metal,.025);
 // Rear and side surfaces stay open towards the audience: a deliberate cutaway.
 box(shelter,0,1.72,-1.49,6.08,2.30,.13,ivory,.028);box(shelter,-3.02,1.72,0,.13,2.30,3.07,ivory,.028);
 for(let x=-2.87;x<3;x+=.18)box(shelter,x,1.71,-1.565,.043,2.12,.014,metal,.004);
 for(let z=-1.34;z<1.49;z+=.18)box(shelter,-3.097,1.71,z,.016,2.1,.043,metal,.004);
 for(const x of [-3.00,3.00])for(const z of [-1.47,1.47])box(shelter,x,1.75,z,.095,2.37,.095,gold,.012);
 for(const z of [-1.46,1.46])box(shelter,0,2.94,z,6.12,.09,.095,metal,.015);
 box(roof,0,.02,0,6.34,.15,3.38,ivory,.035);box(roof,0,-.08,0,6.09,.045,3.12,navy,.006);
 for(let x=-2.85;x<3.1;x+=.29)box(roof,x,.105,0,.028,.035,3.13,metal,.003);
 for(const z of[-1.23,1.23])box(roof,0,-.107,z,5.65,.016,.045,led,.002);
 for(const x of [-2.5,2.5])for(const z of [-1.43,1.43]){const lift=ring(roof,x,.17,z,.068,.016,gold);lift.rotation.x=0}
 const vent=mat(0x344e57,.55,.50);
 function serverFace(parent,y,width=.85){
  box(parent,0,y,.385,width,.148,.075,metal,.011);box(parent,-.21,y,.43,.38,.103,.012,navy,.004);
  for(let j=0;j<7;j++)box(parent,-.38+j*.052,y,.444,.021,.056,.009,rubber,.002);
  for(let j=0;j<3;j++)box(parent,.1+j*.064,y,.441,.037,.033,.012,wire,.004);
  for(const xx of[-.46,.46])box(parent,xx,y,.43,.024,.061,.015,gold,.003);
  for(let i=0;i<2;i++)lights.push(k.beacon(parent,.29+i*.06,y,.444,0x80d7bc,.008,2.3+i*.35+y));
 }
 function rack(x,label){const r=g(shelter,x,.58,-.40);rackGroups.push(r);box(r,0,1.07,0,1.09,2.12,.83,navy,.025);box(r,0,1.11,.405,.98,1.93,.025,rubber,.005);
  for(const xx of[-.49,.49])box(r,xx,1.1,.442,.035,1.94,.024,metal,.003);
  for(let j=0;j<10;j++)serverFace(r,.28+j*.174);
  for(let j=0;j<21;j++)for(const xx of[-.49,.49])box(r,xx,.2+j*.087,.456,.012,.015,.009,gold,.001);
  k.label(r,label,0,2.003,.456,.81);box(r,0,.095,0,1.01,.065,.76,metal,.008);
  const front=g(r,0,0,.49);rackFronts.push(front);box(front,0,1.05,0,.975,1.88,.028,glass,.01);for(const x of[-.50,.50])box(front,x,1.05,0,.045,1.97,.035,metal,.006);box(front,.35,1.12,.038,.025,.25,.038,gold,.008);
  for(let q=0;q<4;q++){const points=[new T.Vector3(.42,.42+q*.30,-.35),new T.Vector3(.56,.60+q*.30,-.52),new T.Vector3(.51,2.24,-.55),new T.Vector3(.12,2.32,-.65)];mesh(r,new T.TubeGeometry(new T.CatmullRomCurve3(points),18,.017,5,false),q%2?gold:wire)}
  return r;
 }
 rack(-1.72,'PULSE CORE');rack(-.48,'NETWORK');rack(.76,'SERVICES');
 // Power distribution at the right. Individual breakers and cable conduits.
 box(shelter,2.20,1.45,-.55,.92,1.78,.74,ivory,.035);box(shelter,2.2,1.45,-.166,.79,1.57,.025,navy,.012);
 for(let y=.92;y<2;y+=.18)for(let x=1.97;x<2.5;x+=.16){box(shelter,x,y,-.143,.10,.11,.022,silver,.008);box(shelter,x,y,-.123,.024,.061,.014,gold,.003)}
 k.label(shelter,'POWER',2.2,2.13,-.122,.65);rod(shelter,[2.2,.59,-.75],[2.2,.39,-.75],.035,rubber);
 // External cooling, deeply modelled fan blades and louvres.
 const cooler=g(shelter,-3.42,1.36,-.10);box(cooler,0,0,0,.56,1.46,1.16,ivory,.055);
 for(const z of[-.31,.31]){const f=g(cooler,-.307,.18,z);f.rotation.z=Math.PI/2;cyl(f,0,0,0,.21,.034,rubber,36);const rotor=g(f,0,.027,0);fans.push(rotor);for(let i=0;i<5;i++){let b=box(rotor,Math.sin(i*1.256)*.095,0,Math.cos(i*1.256)*.095,.1,.012,.24,metal,.015);b.rotation.y=i*1.256+.4}cyl(f,0,.045,0,.05,.024,gold,20);for(let r=.09;r<.22;r+=.034)ring(f,0,.06,0,r,.006,metal)}
 for(let y=-.60;y<-.12;y+=.08)box(cooler,-.292,y,0,.018,.032,1.03,metal,.006);
 rod(shelter,[-3.13,1.15,-.35],[-3.14,.45,-.35],.037,metal);rod(shelter,[-3.14,.45,-.35],[-2.73,.45,-.35],.037,metal);
 // A removable cable tray and engineering labels on the front apron.
 box(shelter,0,2.79,-1.03,5.7,.042,.21,metal,.012);for(let x=-2.7;x<2.9;x+=.18)box(shelter,x,2.83,-1.03,.025,.10,.23,gold,.003);
 k.label(shelter,'MOBILE DATA CENTRE',0,.39,1.665,2.55);
 // Six-metre illustrative lattice mast with service ladder and bracing.
 box(tower,0,.06,0,2.55,.18,2.40,stone,.11);box(tower,0,.17,0,2.32,.045,2.19,ivory,.03);
 const height=6.0,legs=[[-.42,-.42],[.42,-.42],[.42,.42],[-.42,.42]];
 legs.forEach(([x,z])=>{rod(tower,[x,.2,z],[x*.3,height,z*.3],.045,metal);box(tower,x,.22,z,.25,.16,.25,navy,.02);for(const sx of[-.07,.07])for(const sz of[-.07,.07])cyl(tower,x+sx,.312,z+sz,.018,.037,gold,6)});
 for(let j=0;j<12;j++){let y=.45+j*.44,s=.42*(1-y/height)+.13,n=.42*(1-(y+.44)/height)+.13;for(const sign of[-1,1]){rod(tower,[-s,y,sign*s],[s,y,sign*s],.019,gold);rod(tower,[-s,y,sign*s],[n,y+.44,sign*n],.019,metal);rod(tower,[sign*s,y,-s],[sign*n,y+.44,n],.019,metal)}}
 for(const x of[-.105,.105])rod(tower,[x,.3,.52],[x,5.5,.27],.017,metal);
 for(let y=.4;y<5.6;y+=.18){const z=.52-(y-.3)/5.2*.25;rod(tower,[-.105,y,z],[.105,y,z],.015,metal)}
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3,arm=g(tower,Math.sin(a)*.50,5.30,Math.cos(a)*.50);arm.rotation.y=a;box(arm,0,0,0,.29,1.20,.19,ivory,.055);box(arm,0,0,.102,.22,1.07,.012,silver,.011);box(arm,0,-.47,-.21,.29,.37,.13,metal,.016);for(let j=0;j<7;j++)box(arm,-.115+j*.038,-.47,-.286,.02,.31,.032,navy,.003);for(const y of[-.42,.42])rod(arm,[0,y,-.08],[0,y,-.43],.025,gold);rod(arm,[.075,-.65,-.19],[.075,-1.3,-.19],.019,rubber)}
 const dish=g(tower,.33,4.2,.3);dish.rotation.y=.55;const disc=cyl(dish,0,0,0,.28,.10,ivory,40);disc.rotation.x=Math.PI/2;const face=cyl(dish,0,0,.059,.24,.025,metal,40);face.rotation.x=Math.PI/2;rod(dish,[0,0,-.05],[-.33,-.14,-.18],.042,metal);
 cyl(tower,0,6.17,0,.021,.37,gold,12);lights.push(k.beacon(tower,0,6.40,0,0xf65b4a,.044,2.7));
 for(const[x,z]of[[.80,-.78],[-.79,-.78]]){box(tower,x,.63,z,.58,.92,.52,ivory,.04);box(tower,x,.63,z+.269,.48,.76,.02,navy,.012);for(let j=0;j<10;j++)box(tower,x,.35+j*.053,z+.284,.34,.016,.012,metal,.002);box(tower,x+.17,.66,z+.294,.023,.11,.024,gold,.005);lights.push(k.beacon(tower,x-.17,.91,z+.294,0x89debf,.013,2.5))}
 k.label(tower,'5G RAN',0,.22,1.23,1.25);
 // A legible GINA command console with crisp local vector screen textures.
 function screenTexture(kind){return k.canvas(768,432,c=>{c.fillStyle='#102632';c.fillRect(0,0,768,432);c.fillStyle='#203c47';for(let x=32;x<740;x+=54){c.fillRect(x,68,1,322)}for(let y=68;y<420;y+=42)c.fillRect(30,y,710,1);c.fillStyle='#e3d5b3';c.font='600 32px Arial';c.fillText(kind==='gina'?'GINA · COMMAND VIEW':'PULSE · 5G CORE',30,44);
  if(kind==='gina'){c.strokeStyle='#bcaa7d';c.lineWidth=7;c.beginPath();c.moveTo(38,315);c.lineTo(187,155);c.lineTo(328,220);c.lineTo(461,112);c.lineTo(636,180);c.lineTo(723,97);c.stroke();for(const[x,y]of[[187,155],[328,220],[461,112],[636,180]]){c.fillStyle='#91cbbb';c.beginPath();c.arc(x,y,12,0,7);c.fill();c.strokeStyle='#d7e7de';c.lineWidth=2;c.beginPath();c.arc(x,y,20,0,7);c.stroke()}c.fillStyle='#8faeaf';c.font='22px Arial';c.fillText('DEVICES',43,388);c.fillText('RADIO',264,388);c.fillText('COMMAND',521,388)}else{for(let row=0;row<3;row++){c.fillStyle='#28434d';c.fillRect(40,94+row*96,680,65);c.fillStyle='#c7b487';c.font='24px Arial';c.fillText(['ACCESS','NETWORK','SERVICES'][row],63,133+row*96);for(let q=0;q<7;q++){c.fillStyle=q%3?'#77aa9d':'#d6c295';c.fillRect(357+q*45,115+row*96,24,22)}}}
 })}
 const ginaTx=screenTexture('gina'),coreTx=screenTexture('core'),sm=mat(0xffffff,.45,.12,{map:ginaTx,emissive:0xffffff,emissiveMap:ginaTx,emissiveIntensity:.7}),cm=mat(0xffffff,.45,.12,{map:coreTx,emissive:0xffffff,emissiveMap:coreTx,emissiveIntensity:.7});
 box(demo,0,.31,0,3.50,.54,1.04,navy,.10);box(demo,0,.63,0,3.72,.12,1.15,ivory,.08);box(demo,0,1.42,-.30,3.6,1.64,.15,navy,.065);
 mesh(demo,new T.PlaneGeometry(3.40,1.91),sm,0,1.63,-.21).scale.y=.77;
 for(const x of[-1.53,1.53])rod(demo,[x,.66,-.3],[x,1.05,-.3],.05,metal);
 box(demo,0,.715,.26,1.3,.04,.35,metal,.018);for(let x=-.56;x<.63;x+=.105)for(let z=.12;z<.4;z+=.085)box(demo,x,.739,z,.078,.008,.056,navy,.004);
 box(demo,1.06,.75,.25,.21,.07,.30,navy,.07);k.label(demo,'GINA',0,.35,.539,1.10);lights.push(k.beacon(demo,1.43,.35,.552,0x9bddbe,.019,3.5));
 // Handheld PoC devices: the silhouettes belong to the story, not generic cubes.
 box(device,0,.12,0,2.18,.20,1.52,stone,.10);box(device,0,.255,0,2.06,.07,1.40,ivory,.03);
 const radio=g(device,-.49,.31,0);radio.rotation.x=-.11;box(radio,0,.46,0,.44,.84,.24,navy,.055);box(radio,0,.60,.131,.31,.30,.012,blue,.02);box(radio,-.14,.94,0,.065,.35,.07,rubber,.03);cyl(radio,.11,.92,0,.066,.09,gold,16);for(let j=0;j<4;j++)box(radio,0,.31+j*.043,.129,.29,.016,.015,metal,.004);for(const x of[-.09,.09])box(radio,x,.41,.147,.057,.037,.016,gold,.005);lights.push(k.beacon(radio,.155,.81,.13,0x8adbbb,.011,2.9));
 const phone=g(device,.44,.33,0);phone.rotation.x=-.15;box(phone,0,.53,0,.54,1.05,.095,navy,.06);box(phone,0,.54,.052,.46,.90,.014,blue,.039);mesh(phone,new T.PlaneGeometry(.43,.75),cm,0,.56,.063);box(phone,0,.987,.063,.12,.018,.008,rubber,.008);k.label(device,'5G DEVICES',0,.18,.785,1.25);
 // Discrete floor-level conceptual service route, never presented as built links.
 for(const points of[[[-1,.12,1],[-1,.12,2],[-.1,.12,2.35]],[[1,.12,-.85],[2.5,.12,-.85],[3.8,.12,-.85]],[[-4.3,.12,3.1],[-4.3,.12,2],[-2.2,.12,1]]]){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),line=mesh(stage,new T.TubeGeometry(path,40,.02,5,false),gold);const signal=mesh(stage,new T.SphereGeometry(.044,10,8),led);signal.castShadow=false;streams.push({path,signal,line})}
 // Modest working lamps along the plinth give the night state real depth.
 for(const[x,z]of[[-7.15,-4.4],[7.15,-4.4],[-7.15,4.45],[7.15,4.45]]){cyl(stage,x,.22,z,.045,.28,navy,12);cyl(stage,x,.38,z,.061,.06,led,16)}
 lights.push(k.beacon(shelter,2.92,2.75,1.50,0xe9bd72,.021,3.9));
 // Towing and service interfaces make this a transportable shelter, not a box.
 rod(shelter,[-2.55,.39,-1.15],[-4.06,.39,0],.058,metal);rod(shelter,[-2.55,.39,1.15],[-4.06,.39,0],.058,metal);
 box(shelter,-4.04,.39,0,.50,.15,.20,metal,.035);cyl(shelter,-3.76,.21,0,.03,.38,gold,12);cyl(shelter,-3.76,.04,0,.10,.04,rubber,20);
 for(const z of[-1.3,1.3]){box(shelter,3.14,.53,z,.065,.13,.24,navy,.012);lights.push(k.beacon(shelter,3.182,.53,z,0xe34c3d,.023,4.5))}
 // Fine cable ladder and its individual rungs across the service apron.
 for(const z of[-1.31,-1.09])rod(shelter,[-2.78,.60,z],[2.74,.60,z],.015,metal);
 for(let x=-2.72;x<2.8;x+=.16)rod(shelter,[x,.60,-1.32],[x,.60,-1.08],.012,gold);
 // Recessed work lights illuminate the rack faces and equipment at night.
 const rackLamp=new T.PointLight(0xd7ecff,0,7,2);rackLamp.position.set(-1,2.78,1.10);shelter.add(rackLamp);
 const consoleLamp=new T.PointLight(0x88c1ce,0,5,2);consoleLamp.position.set(0,1.4,.6);demo.add(consoleLamp);
 const mastLamp=new T.PointLight(0xf0d3a0,0,6,2);mastLamp.position.set(0,1.2,1.5);tower.add(mastLamp);
 const focusMat=mat(0xd8bd83,.4,.25,{emissive:0xc1a269,emissiveIntensity:.48,transparent:true,opacity:.48,depthWrite:false});
 const focusPads=[];for(const [x,z,w,d]of[[-2.25,-.85,6.7,3.75],[-2.25,-.85,5.0,2.5],[4.6,-.8,2.9,2.75],[-1.85,3.05,7.9,2.1]]){const p=g(stage,x,.11,z),m=focusMat.clone();k.resources.push(m);for(const sz of[-d/2,d/2])box(p,0,0,sz,w,.015,.025,m,.005);for(const sx of[-w/2,w/2])box(p,sx,0,0,.025,.015,d,m,.005);focusPads.push({group:p,material:m})}
 // Preserve animated components; merge the many repeated fixed details.
 k.batchStatic(roof);rackGroups.forEach((r,i)=>k.batchStatic(r,[rackFronts[i],...lights]));rackFronts.forEach(r=>k.batchStatic(r));k.batchStatic(shelter,[roof,...rackGroups,...fans,...lights,rackLamp]);k.batchStatic(tower,[...lights,mastLamp]);k.batchStatic(demo,[...lights,consoleLamp]);k.batchStatic(device,lights);k.batchStatic(stage,[shelter,tower,demo,device,...focusPads.map(p=>p.group),...streams.flatMap(s=>[s.signal,s.line])]);
 const looks=[new T.Vector3(-1.7,1.65,-.55),new T.Vector3(-1.95,1.70,-.75),new T.Vector3(4.55,3.05,-.7),new T.Vector3(-1.50,1.00,2.95)];
 const cameras=[new T.Vector3(9.7,8.1,13.8),new T.Vector3(2.0,5.0,8.4),new T.Vector3(11.5,7.35,10.3),new T.Vector3(3.9,5.2,10.9)];
 const currentLook=looks[0].clone(),fromLook=currentLook.clone(),fromCamera=cameras[0].clone(),toCamera=cameras[0].clone(),toLook=looks[0].clone(),arcControl=fromCamera.clone();
 const lenses=[39,35,37,38];let fromFov=42,toFov=lenses[0],duration=2.1;
 camera.fov=42;camera.position.copy(fromCamera);camera.lookAt(currentLook);
 const anchorGroups=[shelter,shelter,tower,demo],anchorPositions=[new T.Vector3(-1.65,3.15,.30),new T.Vector3(-.05,2.55,.85),new T.Vector3(.05,6.50,0),new T.Vector3(0,2.55,.10)];
 function select(index,animated=true){shadowDirty=true;const previous=selected;selected=Math.max(0,Math.min(3,Number(index)||0));fromCamera.copy(camera.position);fromLook.copy(currentLook);fromFov=camera.fov;toCamera.copy(cameras[selected]);toLook.copy(looks[selected]);toFov=lenses[selected]-(immersive?2:0);blend=animated?0:1;settledTime=0;duration=previous===selected?1.65:2.1;
  // A short lateral arc keeps the selected equipment in view during a dolly.
  const delta=toCamera.clone().sub(fromCamera),side=new T.Vector3(delta.z,0,-delta.x).normalize(),travel=Math.min(1.35,delta.length()*.12);
  arcControl.copy(fromCamera).add(toCamera).multiplyScalar(.5).addScaledVector(side,(selected>=previous?1:-1)*travel);arcControl.y+=Math.min(.85,delta.length()*.06);
  roofTarget=exploded||selected===1?1:selected===0?.38:0;if(!animated){roofBlend=roofTarget;camera.position.copy(toCamera);currentLook.copy(toLook);camera.fov=toFov;}
 }
 function arrive(animated=true){select(selected,false);if(!animated)return;const away=toCamera.clone().sub(toLook).multiplyScalar(1.13);camera.position.copy(toLook).add(away);camera.position.y+=.55;camera.fov=toFov+3;select(selected,true);duration=2.4}
 function update(t,aspect,dt=0,motion=true){if(dead)return;const previousRoof=roofBlend,previousContextScale=demo.scale.x;time=t;k.animate(motion?t:0);blend=Math.min(1,blend+dt/duration);if(!motion){blend=1;roofBlend=roofTarget}const q=blend*blend*(3-2*blend),iq=1-q;
  camera.position.copy(fromCamera).multiplyScalar(iq*iq).addScaledVector(arcControl,2*iq*q).addScaledVector(toCamera,q*q);currentLook.copy(fromLook).lerp(toLook,q);camera.fov=T.MathUtils.lerp(fromFov,toFov,q);
  if(motion&&blend===1){settledTime+=dt;const drift=Math.min(1,settledTime/.8);camera.position.x+=Math.sin(settledTime*.22)*.10*drift;camera.position.y+=Math.sin(settledTime*.18)*.045*drift}camera.aspect=aspect;camera.zoom=1/Math.max(1,1.28/Math.max(.55,aspect));camera.lookAt(currentLook);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  roofBlend=motion?T.MathUtils.lerp(roofBlend,roofTarget,Math.min(1,dt*4.8)):roofTarget;roof.position.y=3+roofBlend*1.6;roof.position.z=-roofBlend*.7;roof.rotation.x=-roofBlend*.13;
  rackFronts.forEach((f,i)=>{f.position.z=.49+roofBlend*.28;f.position.x=roofBlend*(i-1)*.16;f.rotation.y=roofBlend*(i===2?-.3:.3);f.visible=!(selected===1&&roofBlend>.92)});
  if(motion){spin+=dt*2.2;fans.forEach(f=>f.rotation.y=spin)}streams.forEach((s,i)=>{s.signal.visible=selected>=2;s.signal.position.copy(s.path.getPointAt(((motion?t:0)*.13+i*.31)%1));s.line.visible=selected>=2});
  const contextScale=selected===1?.10:1;demo.scale.setScalar(motion?T.MathUtils.lerp(demo.scale.x,contextScale,Math.min(1,dt*5)):contextScale);device.scale.setScalar(motion?T.MathUtils.lerp(device.scale.x,contextScale,Math.min(1,dt*5)):contextScale);
  focusPads.forEach((p,i)=>{const target=i===selected?.65:.02;p.material.opacity=motion?T.MathUtils.lerp(p.material.opacity,target,Math.min(1,dt*4)):target;p.material.emissiveIntensity=.38+night*.66});rackLamp.intensity=(.20+night*1.25)*(selected===1?1:.55);consoleLamp.intensity=(.12+night*.8)*(selected===3?1:.4);mastLamp.intensity=(.10+night*.9)*(selected===2?1:.3);
  if(Math.abs(roofBlend-previousRoof)>.0001||Math.abs(demo.scale.x-previousContextScale)>.0001)shadowDirty=true;
  scene.updateMatrixWorld(true);
 }
 function anchors(){return anchorPositions.map((p,i)=>{const v=anchorGroups[i].localToWorld(p.clone()).project(camera);return{i,x:(v.x+1)/2,y:(1-v.y)/2,visible:blend>.85&&v.z>-1&&v.z<1&&v.x>-.93&&v.x<.93&&v.y>-.88&&v.y<.80&&i!==selected}})}
 select(0,false);update(0,1.3,0,false);
 return{scene,camera,setNight(n){night=n;k.setNight(n)},consumeShadowDirty(){const dirty=shadowDirty;shadowDirty=false;return dirty},select,arrive,update,anchors,setImmersive(v,animated=true){immersive=!!v;select(selected,animated)},transitionProgress:()=>blend,setExploded(v,animated=true){exploded=!!v;select(selected,animated)},dispose(){dead=true;k.dispose()},diagnostics:()=>({selected,exploded,immersive,transition:blend,settled:blend===1,fov:camera.fov,roof:roofBlend,dead,camera:camera.position.toArray(),meshes:(()=>{let n=0;scene.traverse(o=>{if(o.isMesh)n++});return n})(),referenceOnly:true})};
}
window.MOD_IMPLEMENTATION_MODEL={create};})();
