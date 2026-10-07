/* Geographic coordinates drive both the atlas texture and the model positions.
   Tower proportions are deliberately illustrative; no coverage is simulated. */
(()=>{'use strict';const T=THREE,R=6378137,rad=Math.PI/180;
const project=(lon,lat)=>[R*lon*rad,R*Math.log(Math.tan(Math.PI/4+lat*rad/2))];
function normalizeCoast(data){
 const features=data.features.slice(),open=features.filter(f=>f.properties.kind==='coast'&&f.geometry.type==='LineString');
 const chains=open.map(f=>({members:[f],points:f.geometry.coordinates.slice()}));
 const same=(a,b)=>Math.abs(a[0]-b[0])<1e-7&&Math.abs(a[1]-b[1])<1e-7;
 for(let changed=true;changed;){changed=false;outer:for(let i=0;i<chains.length;i++)for(let j=0;j<chains.length;j++){
  if(i===j)continue;const a=chains[i],b=chains[j];if(same(a.points.at(-1),b.points[0])){a.points.push(...b.points.slice(1));a.members.push(...b.members);chains.splice(j,1);changed=true;break outer}
 }}
 for(const c of chains)if(same(c.points[0],c.points.at(-1))){c.members.forEach(f=>features.splice(features.indexOf(f),1));features.push({type:'Feature',properties:{kind:'coast',road:''},geometry:{type:'Polygon',coordinates:[c.points]}})}
 return {type:'FeatureCollection',features};
}
MOD_SITE_GEODATA.island=normalizeCoast(MOD_SITE_GEODATA.island);
function create(areaIndex=0,dark=false){
 const area=MOD_MAP_CONFIG.locations[areaIndex],data=MOD_SITE_GEODATA[area.id],k=MOD_PREMIUM_KIT.create(dark);
 const {scene,camera,g,box,cyl,rod,ring,mesh,mat,ivory,gold,navy,rubber,stone,led}=k;
 const coords=area.sites.map(s=>project(s.lon,s.lat)),xs=coords.map(p=>p[0]),ys=coords.map(p=>p[1]);
 const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
 const unit=Math.max((Math.max(...xs)-Math.min(...xs))/13,(Math.max(...ys)-Math.min(...ys))/8.4,1);
 const local=(lon,lat)=>{const p=project(lon,lat);return[(p[0]-cx)/unit,(cy-p[1])/unit]};
 const positions=area.sites.map(s=>local(s.lon,s.lat));
 const groundWidth=25,groundDepth=18,terrain=g(scene),stations=[],assemblies=[],pulses=[],targets=[];
 const metal=mat(0x819196,.34,.76),sand=mat(0xc4b48f,.86,.04),leaf=mat(0x477768,.86,.02);
 const pointInFrame=(x,z,pad=0)=>Math.abs(x)<groundWidth/2-pad&&Math.abs(z)<groundDepth/2-pad;
 function mapTexture(night){return k.canvas(2048,1475,c=>{
  const W=2048,H=1475,sx=W/groundWidth,sy=H/groundDepth;
  c.fillStyle=areaIndex===0?(night?'#153b49':'#80b8b6'):(night?'#243941':'#d8ceba');c.fillRect(0,0,W,H);
  function path(points){c.beginPath();points.forEach(([lon,lat],i)=>{const[x,z]=local(lon,lat),px=(x+groundWidth/2)*sx,py=(z+groundDepth/2)*sy;i?c.lineTo(px,py):c.moveTo(px,py)})}
  for(const f of data.features){if(f.properties.kind!=='coast')continue;const poly=f.geometry.type==='Polygon',points=poly?f.geometry.coordinates[0]:f.geometry.coordinates;path(points);if(poly){c.closePath();c.fillStyle=night?'#2d4147':'#d8cfb7';c.fill()}c.strokeStyle=night?'#618e8b':'#e3e2ca';c.lineWidth=2.2;c.stroke()}
  for(const f of data.features){const kind=f.properties.kind;if(kind==='coast')continue;const poly=f.geometry.type==='Polygon',points=poly?f.geometry.coordinates[0]:f.geometry.coordinates;path(points);
   if(kind==='building'){c.closePath();c.fillStyle=night?'#36505a':'#eae3d4';c.fill();c.strokeStyle=night?'#48616a':'#b9b29f';c.lineWidth=1;c.stroke()}
   else{const major=/motorway|primary|secondary|tertiary/.test(f.properties.road);c.strokeStyle=night?(major?'#b0986f':'#567174'):(major?'#f3eee1':'#eee8d7');c.lineWidth=major?4:1.7;c.lineJoin='round';c.stroke()}
  }
  c.strokeStyle=night?'#c8d9d00a':'#ffffff1f';c.lineWidth=1;for(let x=0;x<W;x+=W/20){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(let y=0;y<H;y+=H/16){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
 })}
 const dayMap=mapTexture(false),nightMap=mapTexture(true);
 const dayMaterial=new T.MeshBasicMaterial({map:dayMap,toneMapped:false}),nightMaterial=new T.MeshBasicMaterial({map:nightMap,toneMapped:false,transparent:true,opacity:dark?1:0,depthWrite:false});k.resources.push(dayMaterial,nightMaterial);
 box(terrain,0,-.32,0,groundWidth,.55,groundDepth,navy,.16);box(terrain,0,-.055,0,groundWidth+.05,.025,groundDepth+.05,gold,.009);
 for(const[m,y]of[[dayMaterial,-.03],[nightMaterial,-.027]]){const p=mesh(terrain,new T.PlaneGeometry(groundWidth,groundDepth),m,0,y,0);p.rotation.x=-Math.PI/2;p.castShadow=false}
 k.themeUpdates.push(n=>nightMaterial.opacity=n);
 const walls=mat(0xd7cfbc,.88,.02);k.themeUpdates.push(n=>walls.color.set(0xd7cfbc).lerp(new T.Color(0x3c5963),n));
 if(areaIndex===1){const footprints=[];for(const f of data.features){if(f.properties.kind!=='building')continue;const pts=f.geometry.coordinates[0].map(p=>local(...p));const centre=pts.reduce((a,p)=>[a[0]+p[0]/pts.length,a[1]+p[1]/pts.length],[0,0]);if(!pointInFrame(...centre,.2)||pts.some(p=>!pointInFrame(...p)))continue;
   const shape=new T.Shape();pts.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const h=Math.min(.22,Math.max(.08,3.5/unit));const b=mesh(terrain,new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false}),walls,0,0,0);b.rotation.x=-Math.PI/2;footprints.push(b);
  }k.batchStatic(terrain,[...terrain.children.filter(o=>!footprints.includes(o))]);}
 // Compass is geographic: north is negative local Z.
 const compass=g(scene,-10.5,.035,-7.25);rod(compass,[0,0,.7],[0,0,-.7],.022,gold);rod(compass,[-.5,0,0],[.5,0,0],.017,gold);const arrow=mesh(compass,new T.ConeGeometry(.15,.42,3),gold,0,.025,-.6);arrow.rotation.x=-Math.PI/2;
 k.label(compass,'N',0,.09,-1.03,.5).rotation.x=-Math.PI/2;
 const modelBeacons=[];
 const brushedSteel=k.canvas(128,128,c=>{c.fillStyle='#a4adb0';c.fillRect(0,0,128,128);for(let i=0;i<128;i++){c.strokeStyle=i%3?'#b3b9b95c':'#747f8059';c.beginPath();c.moveTo(0,i);c.lineTo(128,i);c.stroke()}});metal.roughnessMap=brushedSteel;
 const footing=mat(0xb7b4a7,.92,.02),copper=mat(0x9f7c4b,.5,.64);
 const practicalMat=new T.MeshBasicMaterial({color:0xffd79c,toneMapped:false,transparent:true,opacity:dark?.85:.08});k.resources.push(practicalMat);k.themeUpdates.push(n=>practicalMat.opacity=.08+n*.77);
 function bolt(p,x,y,z,size=.021){cyl(p,x,y,z,size,.025,metal,6);cyl(p,x,y-.016,z,size*1.38,.009,gold,12)}
 function cable(p,points,r=.01,m=rubber){return mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),12,r,5,false),m)}
 function antenna(parent,x,y,z,rotation=0){const a=g(parent,x,y,z);a.rotation.y=rotation;box(a,0,0,0,.23,.72,.15,ivory,.035);box(a,0,0,.083,.18,.60,.015,sand,.006);box(a,0,-.28,.095,.065,.025,.009,gold,.002);for(const yy of[-.24,.24]){rod(a,[0,yy,-.075],[0,yy,-.25],.018,metal);box(a,0,yy,-.23,.15,.065,.055,metal,.007)}
  box(a,0,-.04,-.26,.21,.33,.08,metal,.012);for(let j=0;j<6;j++)box(a,-.078+j*.031,-.04,-.308,.012,.26,.027,navy,.002);
  for(const x of[-.055,.055]){cyl(a,x,-.41,-.018,.016,.07,copper,10);cable(a,[[x,-.39,-.03],[x,-.55,-.09],[0,-.64,-.21]],.009)}return a}
 function cabinet(p,x,z,wide=false){const w=wide?.49:.43;box(p,x,.17,z,w+.10,.22,.43,footing,.028);box(p,x,.48,z,w,.60,.36,ivory,.025);box(p,x,.49,z+.187,w-.055,.53,.012,navy,.008);box(p,x,.805,z,w+.045,.045,.405,ivory,.01);
  for(let j=0;j<8;j++)box(p,x,.32+j*.037,z+.202,w-.14,.016,.018,metal,.002);box(p,x+w*.30,.61,z+.212,.025,.12,.025,gold,.004);
  for(const yy of[.30,.66])box(p,x-w*.41,yy,z+.197,.025,.048,.03,metal,.003);for(const xx of[-1,1])for(const zz of[-1,1])bolt(p,x+xx*(w*.40),.275,z+zz*.14,.018);
  const fan=mesh(p,new T.TorusGeometry(.083,.008,5,20),metal,x+w/2+.012,.56,z);fan.rotation.y=Math.PI/2;for(let j=-2;j<=2;j++)rod(p,[x+w/2+.014,.50+j*.03,z-.075],[x+w/2+.014,.50+j*.03,z+.075],.006,metal);
  box(p,x-.085,.68,z+.209,.077,.027,.008,practicalMat,.002);modelBeacons.push(k.beacon(p,x-.14,.74,z+.207,0x83dfbf,.012,3.7));
 }
 function foot(p,x,z){box(p,x,.16,z,.23,.20,.23,footing,.015);box(p,x,.28,z,.20,.035,.20,metal,.005);for(const dx of[-.063,.063])for(const dz of[-.063,.063])bolt(p,x+dx,.31,z+dz,.014)}
 function lattice(p){const h=3.14;for(const[x,z]of[[-.36,-.3],[.36,-.3],[.36,.3],[-.36,.3]]){rod(p,[x,.30,z],[x*.23,h,z*.23],.032,metal);foot(p,x,z)}
  for(let j=0;j<7;j++){const y=.32+j*.36,s=.36*(1-y/h)+.06,t=.36*(1-(y+.36)/h)+.06;for(const side of[-1,1]){rod(p,[-s,y,side*s],[s,y,side*s],.017,gold);rod(p,[-s,y,side*s],[t,y+.36,side*t],.016,metal);rod(p,[s,y,side*s],[-t,y+.36,side*t],.012,metal);rod(p,[side*s,y,-s],[side*t,y+.36,t],.016,metal)}}
  for(let y=.3;y<2.96;y+=.145)rod(p,[-.075,y,.36],[.075,y,.36],.011,metal);for(const x of[-.083,.083])rod(p,[x,.25,.36],[x,2.99,.36],.014,metal);
  // Cable tray, safely inside the access ladder; no geographical connections are drawn.
  for(const x of[-.045,.045])rod(p,[x,.28,-.20],[x,2.96,-.12],.012,gold);for(let y=.36;y<2.9;y+=.16)rod(p,[-.045,y,-.20+y*.027],[.045,y,-.20+y*.027],.008,metal);
  for(const x of[-.022,.008,.032])rod(p,[x,.30,-.195],[x,2.94,-.115],.009,rubber);
  for(const yy of[1.55,1.80,2.05,2.30,2.55]){const r=mesh(p,new T.TorusGeometry(.13,.009,4,18,Math.PI),metal,0,yy,.37);r.rotation.x=Math.PI/2}
  box(p,0,2.27,0,.55,.025,.49,metal,.01);cyl(p,0,3.20,0,.017,.25,gold,10);modelBeacons.push(k.beacon(p,0,3.36,0,0xf95744,.031,2.4));
 }
 function monopole(p,palm=false){cyl(p,0,1.60,0,palm?.085:.09,2.94,palm?sand:metal,24);cyl(p,0,.20,0,.25,.20,footing,24);cyl(p,0,.32,0,.21,.035,metal,24);for(let j=0;j<8;j++){const a=j*Math.PI/4;bolt(p,Math.sin(a)*.17,.36,Math.cos(a)*.17,.018)}
  for(let y=.65;y<2.85;y+=.18)rod(p,[-.13,y,.09],[.13,y,.09],.012,gold);for(const y of[.85,1.55,2.3])ring(p,0,y,0,.095,.012,metal);
  box(p,0,.56,.105,.12,.30,.025,navy,.016);for(const x of[-.045,.045])rod(p,[x,.72,-.085],[x,2.86,-.085],.009,rubber);
  if(palm){for(let y=.4;y<2.96;y+=.10)ring(p,0,y,0,.089,.007,gold);for(let i=0;i<12;i++){const a=i*Math.PI/6,points=[];for(let j=0;j<8;j++){const q=j/7;points.push(new T.Vector3(Math.cos(a)*q*.94,3.03+Math.sin(q*Math.PI)*.26-q*.35,Math.sin(a)*q*.94))}mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(points),10,.025,4,false),leaf);for(let j=2;j<7;j++){const v=points[j];for(const sign of[-1,1])rod(p,v.toArray(),[v.x+Math.cos(a+sign*.9)*.25,v.y-.09,v.z+Math.sin(a+sign*.9)*.25],.014,leaf)}}}
  modelBeacons.push(k.beacon(p,0,palm?3.26:3.17,0,0xf95744,.03,2.4));
 }
 for(let i=0;i<3;i++){const[x,z]=positions[i],p=g(scene,x,.05,z),s=area.sites[i];stations.push(p);p.name=s.id;const base=g(p),mast=g(p),radio=g(p),service=g(p);assemblies.push({base,mast,radio,service});
  box(base,0,.015,0,2.10,.12,1.80,stone,.06);box(base,0,.095,0,1.98,.035,1.68,ivory,.025);box(base,0,.13,.79,1.54,.02,.042,gold,.007);
  for(const sign of[-1,1]){for(const y of[.22,.51])rod(base,[sign*.95,y,-.80],[sign*.95,y,.64],.011,metal);for(let zz=-.8;zz<.70;zz+=.24)cyl(base,sign*.95,.33,zz,.012,.46,metal,8)}
  for(let xx=-.95;xx<=.96;xx+=.24)cyl(base,xx,.33,-.81,.012,.46,metal,8);for(const y of[.22,.51])rod(base,[-.95,y,-.81],[.95,y,-.81],.011,metal);
  // Visible conduit, earthing and service-pad details remain illustrative.
  for(const xx of[-.72,.72]){box(base,xx,.22,.57,.065,.22,.065,navy,.008);box(base,xx,.33,.57,.060,.033,.068,practicalMat,.004)}
  for(let n=0;n<4;n++)box(base,-.75+n*.5,.119,.64,.25,.008,.08,metal,.004);
  s.type==='tower'?lattice(mast):monopole(mast,s.type==='palm');
  for(let j=0;j<3;j++){const a=j*Math.PI*2/3;antenna(radio,Math.sin(a)*.31,2.76,Math.cos(a)*.31,a);rod(radio,[0,2.56,0],[Math.sin(a)*.31,2.56,Math.cos(a)*.31],.018,metal)}ring(radio,0,2.51,0,.13,.02,gold);
  cabinet(service,.67,-.45,true);cabinet(service,-.67,-.45);box(service,0,.17,-.69,.88,.06,.12,metal,.01);for(let x=-.39;x<.42;x+=.10)box(service,x,.212,-.69,.021,.025,.16,gold,.002);
  for(const sign of[-1,1])cable(service,[[sign*.67,.27,-.50],[sign*.63,.18,-.66],[sign*.12,.18,-.66],[sign*.055,.28,-.16]],.012);
  cable(base,[[-.80,.13,.55],[-.80,.13,-.63],[.70,.13,-.63],[.75,.13,.48]],.008,copper);
  const haloMat=new T.MeshBasicMaterial({color:0xd3b46e,transparent:true,opacity:.20,depthWrite:false,toneMapped:false});k.resources.push(haloMat);const halo=ring(scene,x,.025,z,1.20,.022,haloMat);halo.castShadow=halo.receiveShadow=false;pulses.push(halo);targets.push(new T.Vector3(x,3.52,z));
  // Retain independent moving assemblies while batching their static meshes by material.
  for(const part of[base,mast,radio,service])k.batchStatic(part,modelBeacons);
 }
 // Physical selection guide, not an RF-coverage ring.
 const inspectMat=new T.LineDashedMaterial({color:0xc5b17d,transparent:true,opacity:.50,dashSize:.045,gapSize:.04});k.resources.push(inspectMat);
 const guideGeo=new T.BufferGeometry().setFromPoints([new T.Vector3(0,.15,0),new T.Vector3(0,4.5,0)]);k.resources.push(guideGeo);const guide=new T.Line(guideGeo,inspectMat);guide.computeLineDistances();scene.add(guide);guide.visible=false;
 const accentMat=new T.MeshBasicMaterial({color:0xe8ca89,toneMapped:false,transparent:true,opacity:.75,depthWrite:false});k.resources.push(accentMat);const componentAccent=ring(scene,0,0,0,.48,.009,accentMat);componentAccent.castShadow=componentAccent.receiveShadow=false;componentAccent.visible=false;
 let selected=-1,plan=false,orbit=false,inspect=false,component=0,explosion=0,time=0,dead=false,shadowDirty=true,zoom=1,fromP=new T.Vector3(19,16,9),fromT=new T.Vector3(),targetP=fromP.clone(),targetT=new T.Vector3(),look=new T.Vector3(),blend=1,fromScales=[1,1,1];
 camera.position.copy(fromP);camera.fov=42;camera.lookAt(look);
 function aim(animated=true){fromP.copy(camera.position);fromT.copy(look);fromScales=stations.map(s=>s.scale.x);const p=selected>=0?positions[selected]:[0,0];targetT.set(p[0]+(inspect?.30:0),selected>=0?(inspect?1.95:1.45):0,p[1]);if(plan)targetP.set(p[0],selected>=0?11:29,p[1]+.01);else targetP.set(p[0]+(selected>=0?(inspect?6.8:4.8):19),selected>=0?(inspect?5.6:4.4):16,p[1]+(selected>=0?(inspect?9.6:7.0):9));blend=animated?0:1;if(!animated)explosion=inspect?1:0}
 function update(t,aspect,dt=0,motion=true){if(dead)return;time=t;k.animate(motion?t:0);blend=Math.min(1,blend+dt/1.35);const q=blend*blend*(3-2*blend);camera.position.copy(fromP).lerp(targetP,q);look.copy(fromT).lerp(targetT,q);
  if(orbit&&motion&&blend===1&&!plan){const d=camera.position.clone().sub(look),angle=Math.sin(t*.20)*.18;camera.position.set(look.x+d.x*Math.cos(angle)-d.z*Math.sin(angle),camera.position.y,look.z+d.x*Math.sin(angle)+d.z*Math.cos(angle))}
  camera.aspect=aspect;camera.zoom=zoom/Math.max(1,1.52/Math.max(.6,aspect));camera.lookAt(look);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  explosion=motion?T.MathUtils.damp(explosion,inspect?1:0,4.0,dt):inspect?1:0;
  stations.forEach((s,i)=>{const scale=T.MathUtils.lerp(fromScales[i],selected<0||selected===i?1:.06,q),a=assemblies[i],e=i===selected?explosion:0;if(Math.abs(s.scale.x-scale)>1e-5||Math.abs(a.radio.position.y-e*1.29)>1e-5)shadowDirty=true;s.scale.setScalar(scale);a.mast.position.y=e*.43;a.radio.position.set(-e*.35,e*1.29,0);a.service.position.set(e*1.45,e*.35,e*.25)});
  guide.visible=selected>=0&&explosion>.02;guide.position.set(selected>=0?positions[selected][0]:0,.06,selected>=0?positions[selected][1]:0);inspectMat.opacity=explosion*.48;
  componentAccent.visible=guide.visible;if(selected>=0){const p=positions[selected],a=component===0?[-explosion*.35,2.49+explosion*1.29,0]:component===1?[0,1.4+explosion*.43,0]:[.66+explosion*1.45,.92+explosion*.35,-.45+explosion*.25];componentAccent.position.set(p[0]+a[0],a[1]+.05,p[1]+a[2]);componentAccent.scale.setScalar(component===2?.66:component===0?1.08:.68);accentMat.opacity=explosion*(motion?.58+Math.sin(t*1.8)*.16:.7)}
  pulses.forEach((p,i)=>{p.material.opacity=i===selected?.75:selected>=0?0:.17;p.scale.setScalar(i===selected?1+(motion?Math.sin(t*2.3)*.045:0):1)});
  scene.updateMatrixWorld(true);
 }
 function projected(p,i){const v=p.clone().project(camera);return{i,x:(v.x+1)/2,y:(1-v.y)/2,visible:v.z>-1&&v.z<1&&v.x>-.94&&v.x<.94&&v.y>-.94&&v.y<.94}}
 function anchors(){return targets.map((p,i)=>{const a=projected(p,i);a.visible=a.visible&&!inspect&&(selected<0||selected===i);return a})}
 function componentAnchors(){if(selected<0||!inspect)return[];const p=positions[selected],e=explosion;return[[-e*.35,3.20+e*1.29,0],[0,1.58+e*.43,.25],[.65+e*1.45,.90+e*.35,-.15+e*.25]].map((v,i)=>({...projected(new T.Vector3(p[0]+v[0],v[1]+.05,p[1]+v[2]),i),active:i===component}))}
 const pickRay=new T.Raycaster(),pickBox=new T.Box3(),pickPoint=new T.Vector3();
 function pick(x,y){
  if(dead||!Number.isFinite(x+y)||x<0||x>1||y<0||y>1)return -1;
  scene.updateMatrixWorld(true);camera.updateMatrixWorld();pickRay.setFromCamera(new T.Vector2(x*2-1,1-y*2),camera);
  const visibleStations=stations.filter(station=>station.scale.x>=.25);
  const exact=pickRay.intersectObjects(visibleStations,true)[0];if(exact){for(let object=exact.object;object;object=object.parent){const i=stations.indexOf(object);if(i>=0)return i}}
  let nearest=Infinity,index=-1;
  stations.forEach((station,i)=>{if(station.scale.x<.25)return;pickBox.setFromObject(station).expandByScalar(.10);const hit=pickRay.ray.intersectBox(pickBox,pickPoint);if(!hit)return;const distance=hit.distanceTo(pickRay.ray.origin);if(distance<nearest){nearest=distance;index=i}});
  return index;
 }
 update(0,1.6,0,false);
 return {scene,camera,area,positions,unit,local,anchors,componentAnchors,pick,update,setNight:k.setNight,consumeShadowDirty(){const dirty=shadowDirty;shadowDirty=false;return dirty},
  select(i,animated=true){selected=i>=0&&i<3?i:-1;if(selected<0)inspect=false;aim(animated)},setPlan(v,animated=true){plan=!!v;if(plan)inspect=false;aim(animated)},setOrbit(v){orbit=!!v},zoom(v){zoom=T.MathUtils.clamp(zoom*v,.65,1.8)},
  setInspect(v,animated=true){inspect=!!v&&selected>=0;if(inspect)plan=false;component=0;aim(animated)},setComponent(i){component=Math.max(0,Math.min(2,i|0))},
  arrive(animated=true){if(animated){camera.position.set(24,23,14);look.set(0,-1.5,0);aim(true)}else aim(false)},
  fit(animated=true){selected=-1;inspect=plan=orbit=false;zoom=1;aim(animated)},
  dispose(){dead=true;k.dispose()},diagnostics:()=>({area:area.id,selected,plan,orbit,inspect,component,explosion,unit,positions,zoom,camera:camera.position.toArray(),assemblies:assemblies.map(a=>({radio:a.radio.position.toArray(),mast:a.mast.position.toArray(),service:a.service.position.toArray()})),meshes:(()=>{let n=0;scene.traverse(o=>{if(o.isMesh)n++});return n})()})};
}
window.MOD_DEPLOYMENT_MODEL={create,project};
})();
