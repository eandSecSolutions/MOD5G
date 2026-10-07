/* Hybrid cinematic world: generated albedo/horizon, articulated people,
   machined drone, suspension/wheels/doors, border infrastructure and real feeds. */
(()=>{'use strict';const T=THREE;
 function create({lang='en',dark=false,onReady=()=>{}}={}){
  const k=MOD_PREMIUM_KIT.create(dark),{scene,camera,g,box,cyl,rod,mesh,mat,ring}=k;
  const resources=[],images=[];let dead=false,night=dark?1:0,last=null;
  const gray=mat(0x777d78,.58,.48),steel=mat(0xaaa798,.38,.65),black=k.rubber,optic=mat(0x244753,.16,.65,{clearcoat:1}),sand=mat(0xc6b293,.85,.02);
  const red=mat(0xef5c47,.35,.1,{emissive:0xb72414,emissiveIntensity:.8}),green=mat(0x71ab9e,.4,.1,{emissive:0x12523f,emissiveIntensity:.8}),white=mat(0xe6e5d7,.45,.16);
  function texture(key,repeat=1){const tx=new T.Texture();tx.colorSpace=T.SRGBColorSpace;tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(repeat,repeat);tx.anisotropy=4;resources.push(tx);const img=new Image();images.push(img);img.onload=()=>{if(dead)return;tx.image=img;tx.needsUpdate=true;onReady()};img.src=window.MOD_BORDER_ASSETS?.[key]||'';return tx}
  const gravel=texture('rock',18),rock=mat(0xd0c1a8,.94,.02,{map:gravel,bumpMap:gravel,bumpScale:.12});
  // An open wadi with raised, stratified mountain shoulders. No checkpoint.
  function groundY(x,z){const flank=T.MathUtils.smoothstep(Math.abs(x-2),10,25),back=T.MathUtils.smoothstep(-z,9,31),fade=1-T.MathUtils.smoothstep(z,0,10);return .05*Math.sin(x*.9)*Math.cos(z*.6)+flank*fade*(4.1+2.1*Math.sin(z*.19+x*.1)**2)+back*(2.8+2*Math.cos(x*.17)**2)}
  const floorGeo=new T.PlaneGeometry(100,100,150,150),pos=floorGeo.attributes.position;
  for(let i=0;i<pos.count;i++){const extend=v=>Math.sign(v)*(Math.abs(v)+Math.pow(Math.max(0,Math.abs(v)-35)/15,3)*350),x=extend(pos.getX(i)),z=extend(pos.getY(i));pos.setXYZ(i,x,z,groundY(x,-z))}
  floorGeo.computeVertexNormals();const ground=mesh(scene,floorGeo,rock,0,0,0);ground.name='mountain-terrain';ground.rotation.x=-Math.PI/2;ground.castShadow=false;
  const horizon=k.landscapeBackdrop(texture('day'),texture('night'));
  scene.fog=new T.Fog(0xc1b195,42,108);
  const boulders=[];for(let i=0;i<540;i++){const x=Math.sin(i*23.71)*39,z=Math.cos(i*9.23)*36;if(x>2.5&&x<12&&z>-14&&z<13||x>-26&&x<13&&z>9&&z<18||x>-17&&x<-9&&z>5&&z<11)continue;const scale=(i%11===0?1.1:.10)+(i%7)*.06;boulders.push({p:[x,groundY(x,z)+scale*.27,z],r:[i*.31,i*.77,i*.19],s:[scale*1.3,scale*.7,scale]})}
  k.instanced(scene,new T.DodecahedronGeometry(1,1),rock,boulders);
  // Rock strata rise out of the continuous height field, not flat scenery cards.
  for(const [x,z,scale] of [[-18,-11,4.2],[20,-15,4.6],[-23,-22,5.7],[27,-27,6.7],[-9,-29,3.9],[14,-31,4.6]]){
   const ridge=g(scene,x,groundY(x,z)-.5,z);for(let j=0;j<5;j++){const slab=mesh(ridge,new T.DodecahedronGeometry(1,1),rock,(j-2)*scale*.3,j*.48,Math.sin(j)*.4);slab.scale.set(scale,scale*.43,scale*.72);slab.rotation.set(.1+j*.045,j*.27,.15)}
  }
  // Rough, curved twin tyre tracks. No tarmac, road markings or boundary posts.
  const trackMat=mat(0x8e8370,.98,0);
  for(let i=0;i<78;i++){const t=i/77,u=1-t,x=u*u*u*-23+3*u*u*t*-12+3*u*t*t*-3+t*t*t*4.8,z=u*u*u*12.7+3*u*u*t*16.5+3*u*t*t*14.5+t*t*t*11.2;
   for(const side of [-1,1]){const y=groundY(x,z+side*.72)+.018;const q=mesh(scene,new T.PlaneGeometry(.48,.13),trackMat,x,y,z+side*.72);q.rotation.x=-Math.PI/2;q.rotation.z=.12*Math.sin(t*5);q.castShadow=false}
  }
  const boundary=g(scene);boundary.name='viewer-boundary';const guideMat=new T.MeshBasicMaterial({color:0xe5c18a,transparent:true,opacity:.48,depthWrite:false});resources.push(guideMat);
  for(let x=-11;x<16;x+=1.05){const dash=mesh(boundary,new T.PlaneGeometry(.52,.10),guideMat,x,groundY(x,-1)+.045,-1);dash.rotation.x=-Math.PI/2;dash.castShadow=false}
  // Fence segments leave a clear crossing gap; there is no checkpoint complex.
  const fence=g(scene);fence.name='border-fence';const wires=[];
  const wireMat=new T.LineBasicMaterial({color:0x929d98,transparent:true,opacity:.66});resources.push(wireMat);
  for(const [lo,hi] of [[-20,3.5],[8.6,23]]){
   for(let x=lo;x<=hi+.01;x+=1.75){const y=groundY(x,-1);cyl(fence,x,y+1.03,-1,.044,2.12,steel,10);cyl(fence,x,y+2.12,-1,.059,.06,gray,10);box(fence,x,y+.07,-1,.23,.14,.23,sand,.018)}
   for(let x=lo;x<hi;x+=.18)for(const slope of [-1,1]){
    let a=x,b=Math.min(hi,x+2),ya=slope===1?.16:2.06,yb=ya+slope*(b-a)*.95;
    wires.push(a,groundY(a,-1)+ya,-1,b,groundY(b,-1)+yb,-1);
   }
   for(const y of [.15,2.06])for(let x=lo;x<hi;x+=1.75){const b=Math.min(hi,x+1.75);rod(fence,[x,groundY(x,-1)+y,-1],[b,groundY(b,-1)+y,-1],.019,steel)}
  }
  const wireGeo=new T.BufferGeometry();wireGeo.setAttribute('position',new T.Float32BufferAttribute(wires,3));resources.push(wireGeo);fence.add(new T.LineSegments(wireGeo,wireMat));
  for(const x of [3.5,8.6]){cyl(fence,x,groundY(x,-1)+1.1,-1,.055,2.2,steel,12);for(const y of [.45,1.45])cyl(fence,x,groundY(x,-1)+y,-1,.065,.025,gray,12)}
  // A fixed, engineered territoryStand stands on the UAE side, wholly clear of the fence.
  const territoryStand=g(boundary,.3,groundY(.3,1.7),1.7);territoryStand.name='territory-sign-stand';territoryStand.rotation.y=.45;
  for(const x of [-1.30,1.30]){box(territoryStand,x,.10,0,.45,.2,.48,sand,.04);cyl(territoryStand,x,1.04,0,.052,1.9,steel,14)}
  box(territoryStand,0,1.92,0,3.5,.91,.09,steel,.035);
  const signTexture=k.canvas(1024,256,c=>{c.fillStyle='#142c38';c.fillRect(0,0,1024,256);c.strokeStyle='#d7c69a';c.lineWidth=6;c.strokeRect(12,12,1000,232);c.fillStyle='#fff8e8';c.font='bold 66px Arial';c.textAlign='center';c.textBaseline='middle';c.direction=lang==='ar'?'rtl':'ltr';c.fillText(lang==='ar'?(globalThis.MOD_AR_TEXT?.["11-land-border"]?.["land_border_model_signTexture_001"] ?? 'بداية أراضي الإمارات'):'UAE TERRITORY',512,132,950)});
  const signMat=new T.MeshBasicMaterial({map:signTexture,toneMapped:false});resources.push(signMat);
  const uae=mesh(territoryStand,new T.PlaneGeometry(3.38,.83),signMat,0,1.92,.051);uae.name='uae-boundary-sign';uae.castShadow=false;
  // Mobile 5G tower: trailer chassis, wheels, stabilisers, equipment and mast.
  const mobile=g(scene,-13,groundY(-13,8),8);mobile.name='mobile-5g-tower';
  box(mobile,0,.7,0,3.2,.22,1.85,steel,.04);box(mobile,.2,1.37,0,2.65,1.1,1.56,white,.065);
  for(const z of [-.96,.96])for(const x of [-.75,.5]){const wheel=g(mobile,x,.48,z);const tire=cyl(wheel,0,0,0,.43,.22,black,28);tire.rotation.x=Math.PI/2;const rim=cyl(wheel,0,0,0,.23,.235,steel,20);rim.rotation.x=Math.PI/2;for(let a=0;a<6.3;a+=.63)box(wheel,Math.cos(a)*.28,Math.sin(a)*.28,z>0?.13:-.13,.06,.09,.02,gray,.005)}
  for(const x of [-1.3,1.3])for(const z of [-.8,.8]){rod(mobile,[x,.68,z],[x*1.45,.68,z*1.7],.065,steel);cyl(mobile,x*1.45,.35,z*1.7,.045,.7,steel,12);box(mobile,x*1.45,.04,z*1.7,.36,.07,.34,gray,.015)}
  rod(mobile,[1.5,.68,-.6],[2.8,.59,0],.07,steel);rod(mobile,[1.5,.68,.6],[2.8,.59,0],.07,steel);box(mobile,2.8,.6,0,.28,.14,.22,steel,.02);
  for(let y=1.0;y<1.7;y+=.12)box(mobile,.45,y,.794,1.65,.034,.02,gray,.004);
  box(mobile,-.8,1.4,.8,.55,.63,.025,gray,.022);box(mobile,-.8,1.45,.819,.39,.24,.01,optic,.009);for(let i=0;i<4;i++)box(mobile,-.93+i*.08,1.18,.825,.025,.025,.02,i%2?green:k.led,.004);
  const tower=g(mobile,-.72,0,0);for(let j=0;j<4;j++)cyl(tower,0,1.45+j*1.35,0,.18-j*.03,2.65,steel,20);
  for(let y=1;y<6.8;y+=.28)rod(tower,[-.12,y,.24],[.12,y,.24],.017,gray);
  for(const angle of [0,2.094,4.188]){const panel=g(tower,Math.cos(angle)*.47,6.65,Math.sin(angle)*.47);panel.rotation.y=-angle;box(panel,0,0,0,.34,1.25,.18,white,.05);rod(tower,[0,6.25,0],[Math.cos(angle)*.55,6.25,Math.sin(angle)*.55],.03,steel);rod(tower,[Math.cos(angle)*.28,1.8,Math.sin(angle)*.28],[Math.cos(angle)*.28,6.2,Math.sin(angle)*.28],.012,black)}
  k.beacon(tower,0,7.43,0,0xff453e,.075,2.8);k.label(mobile,'PULSE · MOBILE 5G',.15,1.94,.8,2.0);
  const practical=[];const lamp=new T.PointLight(0xdde9ee,0,10,2);lamp.position.set(-13,3,8);scene.add(lamp);practical.push(lamp);
  const camouflage=k.canvas(256,256,(c,w,h)=>{c.fillStyle='#998e68';c.fillRect(0,0,w,h);for(let i=0;i<190;i++){c.fillStyle=['#615f49','#c0b28a','#817b5c','#aba07b'][i%4];c.beginPath();for(let j=0;j<7;j++){let a=j*.898,r=7+(i*7+j*11)%20,x=(i*53)%w+Math.cos(a)*r,y=(i*79)%h+Math.sin(a)*r;j?c.lineTo(x,y):c.moveTo(x,y)}c.fill()}});
  const uniform=mat(0xffffff,.94,.02,{map:camouflage}),vest=mat(0x7e785b,.95,.02),fabric=mat(0x152a3a,.95,.01),boot=mat(0x333731,.9,.01);
  const flag=k.canvas(128,64,c=>{c.fillStyle='#ce2835';c.fillRect(0,0,32,64);c.fillStyle='#21804d';c.fillRect(32,0,96,21);c.fillStyle='#fafaf3';c.fillRect(32,21,96,22);c.fillStyle='#172320';c.fillRect(32,43,96,21)}),flagMat=new T.MeshBasicMaterial({map:flag,side:T.DoubleSide,toneMapped:false});resources.push(flagMat);
  const flagPole=g(boundary,-2.7,groundY(-2.7,1.7),1.7);box(flagPole,0,.12,0,.5,.24,.5,sand,.045);cyl(flagPole,0,1.98,0,.035,3.72,steel,18);
  const borderFlagGeo=new T.PlaneGeometry(1.1,.55,20,8);borderFlagGeo.translate(.55,-.275,0);
  const borderFlag=mesh(flagPole,borderFlagGeo,flagMat,0,3.74,0);borderFlag.name='uae-border-flag';const borderFlagRest=new Float32Array(borderFlagGeo.attributes.position.array);
  function person(name,responder,color){
   const q=g(scene);q.name=name;q.userData.heat=responder?.84:1;const cloth=responder?uniform:mat(color,.92,.01),body=g(q,0,1.14,0);
   const torso=mesh(body,new T.CapsuleGeometry(.24,.32,5,10),cloth);torso.scale.set(1.05,1,.69);
   box(q,0,.9,0,.46,.07,.27,boot,.035);for(const x of [-.16,.16])box(q,x,.91,.17,.1,.15,.07,responder?vest:cloth,.025);
   if(responder){box(body,0,0,.15,.43,.49,.08,vest,.045);for(const x of [-.11,.11]){box(body,x,-.08,.209,.095,.18,.075,vest,.025);box(body,x,.14,.196,.032,.23,.03,boot,.01)}box(body,-.2,.18,.22,.085,.16,.05,black,.01);rod(body,[-.2,.23,.23],[-.2,.43,.23],.009,black);box(body,.21,.17,.207,.053,.072,.027,optic,.007)}
   box(body,0,.02,-.18,.35,.42,.17,responder?vest:cloth,.065);box(body,0,.12,-.282,.27,.19,.05,responder?vest:cloth,.022);
   for(const x of [-.15,.15]){box(body,x,.02,-.29,.028,.33,.015,boot,.005);rod(body,[x,.23,-.13],[x,.12,.18],.017,responder?vest:boot)}
   if(responder){box(body,.03,.17,.249,.068,.088,.028,black,.01);box(body,.03,.18,.269,.025,.025,.014,optic,.006);cyl(body,.23,-.05,-.12,.045,.22,gray,12)}
   const head=g(q,0,1.68,0);const face=mesh(head,new T.SphereGeometry(.18,18,12),fabric);face.scale.set(1,.99,.9);
   if(responder){const helmet=mesh(head,new T.SphereGeometry(.198,18,12,0,Math.PI*2,0,Math.PI*.54),uniform,0,.07,0);box(head,0,.074,.17,.28,.038,.09,vest,.014);rod(head,[-.17,.1,0],[-.12,-.12,.08],.012,vest);rod(head,[.17,.1,0],[.12,-.12,.08],.012,vest)}else{mesh(head,new T.SphereGeometry(.186,14,8,0,Math.PI*2,0,Math.PI*.45),cloth,0,.085,0)}
   const legs=[],arms=[];
   for(const s of [-1,1]){
    const hip=g(q,s*.13,.85,0),thigh=mesh(hip,new T.CapsuleGeometry(.092,.29,4,8),cloth,0,-.21,0),knee=g(hip,0,-.42,0);mesh(knee,new T.CapsuleGeometry(.079,.28,4,8),cloth,0,-.18,0);box(knee,0,-.37,.06,.17,.12,.3,boot,.04);legs.push({hip,knee,side:s});
    const shoulder=g(q,s*.31,1.37,0);mesh(shoulder,new T.CapsuleGeometry(.08,.22,4,8),cloth,0,-.13,0);const elbow=g(shoulder,0,-.27,0);mesh(elbow,new T.CapsuleGeometry(.062,.2,4,8),cloth,0,-.13,0);mesh(elbow,new T.SphereGeometry(.065,10,8),responder?boot:fabric,0,-.28,.015);arms.push({shoulder,elbow,side:s});
    if(responder){shoulder.name='responder-shoulder';const backing=box(shoulder,s*.081,-.085,.047,.148,.083,.007,vest,.005);backing.rotation.y=s*Math.PI/3;const patch=mesh(shoulder,new T.PlaneGeometry(.14,.07),flagMat,s*.087,-.085,.052);patch.name='uae-arm-patch';patch.rotation.y=s*Math.PI/3;patch.castShadow=false}
   }
   return {q,legs,arms,body,animate(p,time){
    q.visible=p.visible!==false;q.position.set(p.x,groundY(p.x,p.z),p.z);q.rotation.y=p.yaw||0;
    const speed=Math.min(1.5,p.speed||0),amount=T.MathUtils.smoothstep(speed,0,1.15),cycle=p.stepPhase||0,gait=Math.sin(cycle)*.43*amount;
    q.position.y+=Math.sin(cycle*2)*.013*amount-(p.board||0)*.16;
    body.rotation.set(.025*amount,Math.sin(cycle)*.028*amount,Math.sin(cycle)*.018*amount);
    head.rotation.y=Math.sin(time*.85+(responder?1.4:0.3))*.035;
    legs.forEach(l=>{const swing=Math.sin(cycle+(l.side<0?Math.PI:0));l.hip.rotation.x=swing*.43*amount;l.knee.rotation.x=Math.max(0,-swing)*.72*amount});
    arms.forEach(a=>{a.shoulder.rotation.set(-gait*a.side*.56,0,a.side*.035);a.elbow.rotation.x=-.19-Math.max(0,gait*a.side)*.22;
     const blend=p.poseMix||0;
     if(p.pose==='compliant'){a.shoulder.rotation.z=T.MathUtils.lerp(a.shoulder.rotation.z,a.side*1.72,blend);a.elbow.rotation.x=T.MathUtils.lerp(a.elbow.rotation.x,-1.08,blend)}
     else if(p.pose==='escorted'){a.shoulder.rotation.x=T.MathUtils.lerp(a.shoulder.rotation.x,.24,blend);a.shoulder.rotation.z=-a.side*.08;a.elbow.rotation.x=-.42}
     else if(p.pose==='stop'&&a.side===1){a.shoulder.rotation.x=T.MathUtils.lerp(a.shoulder.rotation.x,-.95,blend);a.elbow.rotation.x=-.36}
    });
   }};

  }
  const entrants=[person('entrant-0',false,0x5a6770),person('entrant-1',false,0x7a6657)],responders=[0,1,2].map(i=>person('responder-'+i,true));
  function patrol(){
   const q=g(scene);q.name='patrol';q.userData.heat=.36;box(q,0,.74,0,1.75,.68,3.95,white,.13);box(q,0,1.36,-.24,1.58,.72,2.28,white,.12);box(q,0,1.54,-.2,1.45,.4,2.05,optic,.055);box(q,0,1.77,-.15,1.75,.15,2.7,white,.04);
   for(const x of [-.8,.8]){box(q,x,1.38,-.3,.035,.71,.1,steel,.01);box(q,x,.98,.1,.028,.09,3.02,mat(0x314750,.75,.2),.01);box(q,x,1.62,.55,.034,.41,.055,white,.01);const mirror=box(q,x*1.21,1.28,.61,.26,.14,.17,white,.035)}
   box(q,0,.62,2.05,1.9,.2,.26,gray,.04);for(const x of [-.58,.58])box(q,x,.83,2.01,.32,.17,.08,k.led,.025);box(q,0,.84,2.043,.5,.23,.06,black,.02);for(let x=-.18;x<=.18;x+=.08)box(q,x,.84,2.08,.024,.17,.015,steel,.003);
   box(q,0,.62,-2.02,1.9,.21,.22,gray,.04);for(const x of [-.68,.68])box(q,x,.98,-2,.19,.32,.08,red,.015);
   for(const x of [-.71,.71])rod(q,[x,1.89,-1.1],[x,1.89,.85],.035,steel);for(let z=-1;z<1;z+=.35)rod(q,[-.71,1.89,z],[.71,1.89,z],.025,steel);
   box(q,0,1.95,.4,1.08,.08,.3,gray,.02);const barRed=box(q,-.35,2.01,.4,.34,.065,.24,red,.018),barBlue=box(q,.35,2.01,.4,.34,.065,.24,mat(0x5988a5,.3,.2,{emissive:0x305d88,emissiveIntensity:.7}),.018);
   const wheels=[];for(const x of [-.93,.93])for(const z of [-1.33,1.2]){const wheel=g(q,x,.42,z);const tire=cyl(wheel,0,0,0,.4,.26,black,28);tire.rotation.z=Math.PI/2;const hub=cyl(wheel,0,0,0,.23,.28,steel,20);hub.rotation.z=Math.PI/2;for(let a=0;a<6.28;a+=.628)box(wheel,x>0?.15:-.15,Math.cos(a)*.28,Math.sin(a)*.28,.018,.1,.075,gray,.012);wheels.push(wheel)}
   const door=g(q,.85,1.07,.68);box(door,0,.1,-.45,.055,.7,.87,white,.035);box(door,0,.52,-.45,.035,.34,.8,optic,.025);box(door,.042,.24,-.6,.018,.045,.12,gray,.006);
   const spare=cyl(q,0,1.08,-2.16,.4,.24,black,28);spare.rotation.x=Math.PI/2;const spareHub=cyl(q,0,1.08,-2.30,.21,.025,steel,18);spareHub.rotation.x=Math.PI/2;
   for(const side of [-1,1]){rod(q,[side*.84,.45,-1.12],[side*.84,.45,1],.055,steel);for(let z=-.9;z<.9;z+=.28)box(q,side*.88,.49,z,.19,.025,.06,gray,.006);box(q,side*.85,1.16,.22,.035,.045,.18,steel,.01)}
   const leftDoor=g(q,-.85,1.07,.68);box(leftDoor,0,.1,-.45,.055,.7,.87,white,.035);box(leftDoor,0,.52,-.45,.035,.34,.8,optic,.025);box(leftDoor,-.04,.24,-.6,.02,.045,.12,steel,.008);
   rod(q,[-.64,1.8,-1.03],[-.64,2.66,-1.03],.012,black);box(q,0,.88,2.096,.33,.075,.013,white,.005);
   const hotHood=box(q,0,1.095,1.36,1.35,.015,.74,white,.035);hotHood.userData.heat=.68;
   const flagPanel=mesh(q,new T.PlaneGeometry(.27,.13),flagMat,.89,1.04,-.3);flagPanel.rotation.y=Math.PI/2;
   return {q,animate(v,t){q.visible=v.visible!==false;q.position.set(v.x,groundY(v.x,v.z)+(v.moving?Math.sin(t*8)*.025:0),v.z);q.rotation.y=v.yaw;q.rotation.z=v.moving?Math.sin(t*5)*.008:0;door.rotation.y=-v.door*.95;leftDoor.rotation.y=v.door*.95;wheels.forEach(a=>a.rotation.x=v.distance/.4);barRed.material.emissiveIntensity=v.moving?.45+Math.pow(Math.max(0,Math.sin(t*5)),10)*1.4:.35;barBlue.material.emissiveIntensity=v.moving?.45+Math.pow(Math.max(0,Math.cos(t*5)),10)*1.4:.35}};
  }
  const vehicle=patrol(),drone=g(scene);drone.name='drone';const rotors=[],motorLights=[];
  box(drone,0,0,0,.55,.16,.67,gray,.075);box(drone,0,.1,-.08,.38,.1,.4,black,.045);for(let i=0;i<6;i++)box(drone,-.2+i*.08,.15,-.08,.025,.01,.21,steel,.002);
  for(const x of [-1,1])for(const z of [-1,1]){rod(drone,[x*.17,0,z*.23],[x*.79,.045,z*.67],.045,gray);rod(drone,[x*.17,-.08,z*.19],[x*.79,-.01,z*.67],.017,black);cyl(drone,x*.79,.08,z*.67,.095,.19,steel,18);const rotor=g(drone,x*.79,.2,z*.67);for(const a of [0,Math.PI]){const blade=box(rotor,0,0,a===0?.3:-.3,.09,.018,.68,black,.018);blade.rotation.y=a}rotors.push(rotor);motorLights.push(box(drone,x*.79,.025,z*.78,.045,.045,.02,z>0?green:red,.008));}
  const gimbal=g(drone,0,-.18,.23);for(const x of [-.11,.11])box(gimbal,x,-.08,0,.025,.19,.05,steel,.007);const cameraPod=g(gimbal,0,-.14,0);box(cameraPod,0,0,0,.19,.16,.19,gray,.027);const droneLens=cyl(cameraPod,0,0,.13,.067,.09,black,20);droneLens.rotation.x=Math.PI/2;const droneGlass=cyl(cameraPod,0,0,.18,.048,.012,optic,20);droneGlass.rotation.x=Math.PI/2;
  cyl(drone,0,.23,-.17,.027,.26,steel,8);box(drone,0,.37,-.17,.15,.02,.15,white,.01);k.beacon(drone,0,.135,.21,0x78c7a9,.025,1.8);
  // Separate optical and thermal apertures, vibration mount, battery rails.
  for(const x of [-.17,.17]){box(drone,x,.10,-.10,.025,.16,.55,steel,.006);for(const z of [-.31,.19])cyl(drone,x,.20,z,.013,.012,black,8)}
  box(cameraPod,.15,.02,0,.16,.13,.19,gray,.026);const irLens=cyl(cameraPod,.15,.02,.14,.051,.07,black,24);irLens.rotation.x=Math.PI/2;const irGlass=cyl(cameraPod,.15,.02,.183,.035,.01,optic,24);irGlass.rotation.x=Math.PI/2;
  for(let j=0;j<4;j++)box(drone,-.12+j*.08,-.092,-.12,.025,.008,.3,black,.002);
  // Inspection footprint and detector brackets register to the actual subjects.
  const markerMaterial=new T.MeshBasicMaterial({color:0xf1bd71,transparent:true,opacity:.65,depthWrite:false}),marker=g(scene);resources.push(markerMaterial);
  const brackets=[0,1].map(()=>{const q=g(scene);for(const x of [-.33,.33])for(const y of [.08,1.91]){rod(q,[x,y,0],[x+(x<0?.14:-.14),y,0],.012,markerMaterial);rod(q,[x,y,0],[x,y+(y<1?.14:-.14),0],.012,markerMaterial)}return q});
  const footprint=mesh(scene,new T.RingGeometry(2.3,2.34,60),markerMaterial,6,.08,3.45);footprint.rotation.x=-Math.PI/2;
  const coneMat=new T.MeshBasicMaterial({color:0x87b9c7,transparent:true,opacity:.06,side:T.DoubleSide,depthWrite:false}),cone=mesh(scene,new T.ConeGeometry(2.6,6.8,36,1,true),coneMat);resources.push(coneMat);cone.castShadow=false;
  // Registered field-to-RAN-to-core uplink. Compact lines only accompany shots
  // in which the network role is being explained, keeping the incident legible.
  const linkMat=new T.LineBasicMaterial({color:0xd6b57b,transparent:true,opacity:.65}),linkGeo=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(),new T.Vector3()]),link=new T.Line(linkGeo,linkMat);resources.push(linkGeo,linkMat);scene.add(link);
  const packet=mesh(scene,new T.SphereGeometry(.075,10,8),k.led);
  // Small deterministic dust puffs rise behind the moving patrol.
  const dust=g(scene);dust.name='patrol-dust';const dustMat=new T.MeshBasicMaterial({color:0xc5b391,transparent:true,opacity:.12,depthWrite:false});resources.push(dustMat);const dustPuffs=[];
  for(let j=0;j<18;j++){const puff=mesh(dust,new T.IcosahedronGeometry(.17,1),dustMat);puff.castShadow=puff.receiveShadow=false;dustPuffs.push(puff)}
  const feedCamera=new T.PerspectiveCamera(46,16/9,.05,200),focus=new T.Vector3();
  const shots=[
   {p:[22,18,31],f:[-1,4.8,3]}, {p:[22,18,31],f:[-1,4.8,3]},
   {p:[21,19,33],f:[-2.5,4.5,5]}, {p:[22,17,30],f:[6,4.2,6]},
   {p:[22,15,32],f:[6,4.2,8]}, {p:[20,13,29],f:[6,4.2,9]},
   {p:[19,12,30],f:[5,4.2,10]}
  ];
  k.batchStatic(scene,[...entrants.map(a=>a.q),...responders.map(a=>a.q),vehicle.q,drone,brackets[0],brackets[1],footprint,cone,link,packet,boundary,fence,dust,horizon]);
  scene.children.filter(o=>o.isLight&&o.castShadow).forEach(l=>l.shadow.mapSize.set(1024,1024));
  // False-colour thermal rendering of the same geometry, not a tinted photograph.
  const thermalVertex='varying vec3 n; varying float h; void main(){vec4 p=vec4(position,1.0);vec3 nn=normal;\n#ifdef USE_INSTANCING\np=instanceMatrix*p;nn=mat3(instanceMatrix)*nn;\n#endif\nn=normalize(mat3(modelMatrix)*nn);h=(modelMatrix*p).y;gl_Position=projectionMatrix*modelViewMatrix*p;}';
  const thermalFragment='uniform float heat;varying vec3 n;varying float h;vec3 palette(float t){vec3 a=vec3(.025,.025,.13),b=vec3(.28,.045,.48),c=vec3(.9,.18,.13),d=vec3(1.,.76,.12),e=vec3(1.,.99,.83);if(t<.25)return mix(a,b,t*4.);if(t<.5)return mix(b,c,(t-.25)*4.);if(t<.8)return mix(c,d,(t-.5)/.3);return mix(d,e,(t-.8)*5.);}void main(){float facing=abs(dot(normalize(n),normalize(vec3(-.4,.8,.3))));float v=heat>0.?heat-.10+.1*facing+.025*sin(h*2.8):.035+.13*facing+.012*sin(h*2.);gl_FragColor=vec4(palette(clamp(v,0.,1.)),1.);}';
  const hotMaterials=new Map();function hotMaterial(heat){if(!hotMaterials.has(heat)){const m=new T.ShaderMaterial({uniforms:{heat:{value:heat}},vertexShader:thermalVertex,fragmentShader:thermalFragment,toneMapped:false});m.userData.thermal=true;m.userData.palette='ironbow';resources.push(m);hotMaterials.set(heat,m)}return hotMaterials.get(heat)}
  const terrainIR=hotMaterial(0);
  const guides=[boundary,...brackets,footprint,cone,link,packet,dust];
  function renderSensor(renderer,sensorCamera=feedCamera,thermal=false){
   const visibility=[],materials=[],oldFog=scene.fog;
   const hide=o=>{visibility.push([o,o.visible]);o.visible=false};hide(drone);guides.forEach(hide);
   try{if(thermal){hide(horizon);scene.fog=null;scene.traverse(o=>{if(o.isSprite||o.isLine){hide(o);return}if(!o.isMesh)return;let heat=0;for(let a=o;a;a=a.parent){if(a.userData.heat){heat=a.userData.heat;break}}materials.push([o,o.material]);o.material=heat?hotMaterial(heat):terrainIR})}renderer.render(scene,sensorCamera)}
   finally{materials.forEach(([o,m])=>o.material=m);visibility.forEach(([o,v])=>o.visible=v);scene.fog=oldFog}
  }
  function setNight(n){night=Math.max(0,Math.min(1,n));k.setNight(night);scene.fog.color.set(0xc1b195).lerp(new T.Color(0x26394b),night);practical.forEach(l=>l.intensity=night*2.1)}
  function update(s,aspect=16/9,ambientTime=s.time){last=s;const t=s.time;k.animate(ambientTime);entrants.forEach((a,i)=>a.animate(s.people[i],t));responders.forEach((a,i)=>a.animate(s.responders[i],t));vehicle.animate(s.vehicle,t);
   drone.position.set(s.drone.x,s.drone.y,s.drone.z);drone.rotation.set(s.drone.flying?Math.sin(ambientTime*.7)*.012:0,s.drone.yaw,s.drone.flying?Math.sin(ambientTime*.8)*.015:0);rotors.forEach((r,i)=>r.rotation.y=s.drone.flying?ambientTime*46*(i%2?1:-1):0);
   const midpoint=new T.Vector3((s.people[0].x+s.people[1].x)/2,1,(s.people[0].z+s.people[1].z)/2);midpoint.y+=groundY(midpoint.x,midpoint.z);focus.copy(midpoint);
   gimbal.lookAt(midpoint);brackets.forEach((q,i)=>{q.visible=s.detected&&!s.detained&&s.people[i].visible!==false;q.position.set(s.people[i].x,groundY(s.people[i].x,s.people[i].z),s.people[i].z+.24);q.lookAt(camera.position.x,.9,camera.position.z)});
   footprint.visible=s.detected&&!s.detained;footprint.position.set(midpoint.x,groundY(midpoint.x,midpoint.z)+.065,midpoint.z);cone.visible=false;cone.material.opacity=.045+night*.025;
   const shot=shots[s.phase],previous=shots[Math.max(0,s.phase-1)],q=T.MathUtils.smoothstep(t-MOD_BORDER_STORY.stages[s.phase].at,0,4.5);
   const wideP=new T.Vector3(...previous.p).lerp(new T.Vector3(...shot.p),q),wideF=new T.Vector3(...previous.f).lerp(new T.Vector3(...shot.f),q);
   const reveal=T.MathUtils.smoothstep(t,8,20),closeP=midpoint.clone().add(new T.Vector3(5.5,2.5,10.5)),closeF=midpoint.clone();
   camera.aspect=aspect;camera.far=1800;camera.fov=42;camera.position.copy(wideP);camera.lookAt(wideF);camera.updateProjectionMatrix();camera.updateMatrixWorld();
   // Fit the wide composition before blending from the opening; never snap on a chapter boundary.
   const points=[new T.Vector3(s.drone.x,s.drone.y+1,s.drone.z),...s.people.map(p=>new T.Vector3(p.x,groundY(p.x,p.z),p.z))];
   const towerWeight=1-T.MathUtils.smoothstep(t,29,35),patrolWeight=T.MathUtils.smoothstep(t,43,49);
   points.push(wideF.clone().lerp(new T.Vector3(-13.7,7.5,8),towerWeight),wideF.clone().lerp(new T.Vector3(-13,0,8),towerWeight));
   points.push(wideF.clone().lerp(new T.Vector3(s.vehicle.x-1,0,s.vehicle.z+2),patrolWeight));
   for(let n=0;n<12;n++){let ratio=1;for(const point of points){const v=point.clone().project(camera);ratio=Math.max(ratio,Math.abs(v.x)/.78,v.y/.67,-v.y/.53)}if(ratio<=1.002)break;camera.position.sub(wideF).multiplyScalar(Math.min(ratio,1.28)).add(wideF);camera.lookAt(wideF);camera.updateMatrixWorld()}
   camera.position.copy(closeP.lerp(camera.position.clone(),reveal));const target=closeF.lerp(wideF,reveal);
   camera.position.x+=Math.sin(ambientTime*.12)*.18;camera.lookAt(target);camera.updateMatrixWorld();
   const fp=borderFlagGeo.attributes.position;for(let i=0;i<fp.count;i++){const x=borderFlagRest[i*3],y=borderFlagRest[i*3+1],free=x/1.1;fp.setXYZ(i,x,y,free*(.065*Math.sin(x*7-ambientTime*3)+.022*Math.sin(x*15-ambientTime*4+y*3)))}fp.needsUpdate=true;borderFlagGeo.computeVertexNormals();
   feedCamera.position.set(s.drone.x,s.drone.y-.55,s.drone.z+.35);feedCamera.fov=s.detected?38:48;
   dust.visible=s.vehicle.moving;dustPuffs.forEach((p,i)=>{const age=((t*1.4+i*.13)%2.4),back=age*1.3+2;p.position.set(s.vehicle.x-Math.sin(s.vehicle.yaw)*back+Math.sin(i*4)*.25,groundY(s.vehicle.x,s.vehicle.z)+.12+age*.25,s.vehicle.z-Math.cos(s.vehicle.yaw)*back+Math.cos(i*3)*.32);p.scale.setScalar(.5+age*.9)});
   feedCamera.lookAt(midpoint);feedCamera.updateProjectionMatrix();feedCamera.updateMatrixWorld();scene.updateMatrixWorld(true);
   link.visible=s.phase>=1&&s.phase<=4;packet.visible=link.visible;
   const a=s.phase===4?vehicle.q.position.clone().add(new T.Vector3(0,1.8,0)):drone.position.clone(),b=new T.Vector3(-13.72,6.7,8),c=new T.Vector3(-13.2,1.8,8);
   const positions=linkGeo.attributes.position;[a,b,c].forEach((p,i)=>positions.setXYZ(i,p.x,p.y,p.z));positions.needsUpdate=true;linkGeo.computeBoundingSphere();const p=(ambientTime*.25)%2;packet.position.copy(p<1?a.clone().lerp(b,p):b.clone().lerp(c,p-1));
   return {focus:midpoint,phase:s.phase};
  }
  function dispose(){dead=true;images.forEach(i=>{i.onload=null;i.onerror=null});k.dispose();new Set(resources).forEach(x=>x.dispose?.())}
  setNight(night);
  return {scene,camera,feedCamera,focus,update,setNight,renderSensor,groundY,dispose,diagnostics(){let meshes=0,vertices=0;scene.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry?.attributes.position?.count||0}});return {meshes,vertices,time:last?.time,night,actors:entrants.length+responders.length,thermal:true,airframeExcluded:true,renderer:'hybrid-3d',disposed:dead}}};
 }
 window.MOD_BORDER_MODEL={create};
})();
