/* The final image is a real, independently lit 3D composition. Equipment and
   architectural setting are illustrative, not an assertion of built topology. */
(()=>{'use strict';const T=THREE;
function create(dark=false){
 const k=MOD_PREMIUM_KIT.create(dark),{scene,camera,g,box,cyl,rod,ring,mesh,mat,stone,ivory,navy,gold,glass,rubber,led}=k;
 const stage=g(scene),installation=g(stage),metal=mat(0xb4c1bf,.34,.76),cool=mat(0x4f8391,.38,.50),warm=mat(0xd7c393,.42,.66),light=mat(0xf1d5a0,.24,.20,{emissive:0xf3d49c,emissiveIntensity:1.4});
 const lights=[],signals=[],moving=[];let dead=false,night=dark?1:0,elapsed=10,shadowDirty=true,time=0;
 // A stepped architectural island with inset brass joints and a quiet waterline.
 const pedestal=cyl(installation,0,-.18,0,3.85,.46,navy,96);pedestal.scale.z=.77;
 const top=cyl(installation,0,.08,0,3.75,.10,stone,96);top.scale.z=.77;
 const rim=ring(installation,0,.131,0,3.65,.021,gold);rim.scale.y=.77;
 for(let x=-2.9;x<=3;x+=.75){const d=2.75*Math.sqrt(Math.max(0,1-x*x/(3.75*3.75)));box(installation,x,.143,0,.009,.004,d*2,gold,0)}
 for(let z=-2;z<=2;z+=.67){const w=3.7*Math.sqrt(Math.max(0,1-z*z/(2.78*2.78)));box(installation,0,.144,z,w*2,.004,.009,gold,0)}
 for(const [x,z]of[[-3.25,-.8],[-2.8,1.55],[2.9,1.50],[3.05,-1.25]]){cyl(installation,x,.36,z,.047,.40,navy,12);cyl(installation,x,.575,z,.074,.055,light,16)}
 const water=mat(0x719b9f,.22,.57,{transparent:true,opacity:.32,clearcoat:1,depthWrite:false,normalMap:k.normal,normalScale:new T.Vector2(.12,.12)});
 const waterDisc=mesh(stage,new T.CircleGeometry(4.4,96),water,0,-.43,0);waterDisc.rotation.x=-Math.PI/2;waterDisc.scale.y=.79;waterDisc.castShadow=false;
 k.normal.repeat.set(5,5);
 // Three-sector radio mast: braced legs, platforms, cable ladders and mount arms.
 const tower=g(installation,1.10,.15,-.36),legRadius=.40;
 box(tower,0,.075,0,1.4,.15,1.34,stone,.10);
 for(const x of[-.45,.45])for(const z of[-.4,.4]){box(tower,x,.20,z,.24,.12,.24,metal,.02);cyl(tower,x,.28,z,.036,.09,gold,10)}
 for(const x of[-legRadius,legRadius])for(const z of[-legRadius,legRadius]){rod(tower,[x,.24,z],[x*.38,6.05,z*.38],.044,metal);for(let i=0;i<8;i++){const y=.37+i*.64,a=1-y/10,b=1-(y+.64)/10;rod(tower,[x*a,y,z*a],[-x*b,y+.64,z*b],.019,gold)}}
 for(let y=.56;y<5.95;y+=.65){const w=.82-y*.075;for(const z of[-1,1])rod(tower,[-w/2,y,z*w/2],[w/2,y,z*w/2],.023,metal)}
 for(const x of[-.13,.13])rod(tower,[x,.4,.46],[x,5.45,.26],.02,navy);
 for(let y=.5;y<5.5;y+=.21)rod(tower,[-.13,y,.46-y*.038],[.13,y,.46-y*.038],.017,metal);
 for(const x of[-.067,0,.067])rod(tower,[x,.24,-.39],[x,5.72,-.15],.026,navy);
 for(let a=0;a<Math.PI*2;a+=Math.PI*2/3){
  const sector=g(tower,0,5.05,0);sector.rotation.y=a;
  rod(sector,[0,-.18,0],[0,-.18,.78],.042,metal);rod(sector,[0,1.0,0],[0,1.0,.78],.042,metal);
  box(sector,0,.42,.77,.39,1.86,.23,ivory,.09);box(sector,0,.42,.642,.26,1.56,.08,metal,.04);
  for(let j=0;j<12;j++)box(sector,0,-.28+j*.12,.591,.22,.018,.018,gold,.003);
  for(const y of[-.32,1.17])box(sector,0,y,.627,.52,.065,.115,metal,.016);
  const rru=g(sector,.35,-.59,.24);box(rru,0,0,0,.39,.72,.22,navy,.04);for(let j=0;j<8;j++)box(rru,-.15+j*.043,0,.13,.018,.61,.054,metal,.004);
  for(const x of[-.09,.09])rod(sector,[x,-.53,.73],[x,-.85,.18],.018,rubber);
 }
 const platform=cyl(tower,0,4.05,0,.65,.08,metal,40);for(let a=0;a<6.2;a+=Math.PI/6){rod(tower,[Math.sin(a)*.61,4.09,Math.cos(a)*.61],[Math.sin(a)*.61,4.65,Math.cos(a)*.61],.017,gold)}ring(tower,0,4.65,0,.61,.018,gold);
 cyl(tower,0,6.31,0,.028,.42,metal,12);cyl(tower,0,6.53,0,.078,.09,navy,16);lights.push(k.beacon(tower,0,6.60,0,0xff574a,.048,3.8));
 // A small glazed Pulse core pavilion, visible cable trays and individual rack units.
 const core=g(installation,-1.62,.15,.28);core.rotation.y=.06;
 box(core,0,.12,0,2.18,.24,1.78,navy,.12);box(core,0,1.28,-.70,2.04,2.11,.14,ivory,.055);
 for(const x of[-1.0,1.0]){box(core,x,1.3,0,.10,2.26,1.65,metal,.03);box(core,x,1.32,.02,.035,1.98,1.49,glass,.01)}
 box(core,0,2.48,0,2.36,.13,1.95,ivory,.08);box(core,0,2.39,.81,2.07,.027,.031,light,.008);
 for(let x=-.90;x<1;x+=.19)box(core,x,2.565,0,.095,.04,1.64,gold,.015);
 const rackPositions=[-.56,.56];for(const x of rackPositions){
  box(core,x,1.27,-.02,.88,1.98,1.0,navy,.045);for(const bx of[-.42,.42])box(core,x+bx,1.27,.516,.04,1.89,.025,metal,.005);
  for(let j=0;j<8;j++){let y=.48+j*.225;box(core,x,y,.523,.77,.184,.055,metal,.012);box(core,x-.065,y,.558,.50,.116,.025,navy,.01);for(let u=0;u<5;u++)box(core,x-.26+u*.09,y,.577,.027,.043,.012,rubber,.003);box(core,x+.267,y,.56,.078,.10,.021,gold,.007);lights.push(k.beacon(core,x+.23,y+.04,.579,j%3?0x8ad9bf:0xdac28c,.0095,2.7+j*.13))}
  box(core,x,2.19,.54,.76,.092,.025,navy,.01);
 }
 // PULSE remains physical geometry; the closing title is accessible live text.
 k.label(core,'PULSE',0,.167,.917,1.23);k.label(tower,'5G',0,.39,.70,.49);
 for(const z of[-.17,.17])rod(installation,[-.52,.21,z],[1.05,.21,z],.036,metal);
 for(let x=-.51;x<1.15;x+=.12)rod(installation,[x,.205,-.19],[x,.205,.19],.022,gold);
 for(let z=-.075;z<=.08;z+=.065)rod(installation,[-.55,.25,z],[1.09,.25,z],.018,cool);
 // A sculptural perimeter quietly conveys one connected system, without coverage graphics.
 const path=new T.CatmullRomCurve3([new T.Vector3(-2.82,.17,1.2),new T.Vector3(-1.68,.17,2.05),new T.Vector3(.60,.17,2.08),new T.Vector3(2.43,.17,.72),new T.Vector3(1.84,.17,-1.57),new T.Vector3(-.52,.17,-1.9),new T.Vector3(-2.82,.17,1.2)]);
 const track=mesh(installation,new T.TubeGeometry(path,112,.018,6,false),gold);track.castShadow=false;
 for(let i=0;i<3;i++){const signal=mesh(installation,new T.SphereGeometry(.052,12,8),light);signal.castShadow=false;signals.push({signal,offset:i/3})}
 const arcMaterial=mat(0xc2a567,.4,.42,{transparent:true,opacity:.25,emissive:0xa99768,emissiveIntensity:.26,depthWrite:false});
 const orbit=g(stage,0,-.22,0);const arc=mesh(orbit,new T.TorusGeometry(4.13,.011,6,110,Math.PI*1.33),arcMaterial);arc.rotation.x=Math.PI/2;arc.scale.y=.79;arc.castShadow=false;moving.push(orbit);
 const coreLamp=new T.PointLight(0xd1ecea,.30,5,2);coreLamp.position.set(0,1.5,1.42);core.add(coreLamp);const mastLamp=new T.PointLight(0xffdca3,.3,8,2);mastLamp.position.set(1,1.4,1.5);tower.add(mastLamp);
 k.batchStatic(core,[...lights,coreLamp]);k.batchStatic(tower,[...lights,mastLamp]);k.batchStatic(installation,[core,tower,...signals.map(s=>s.signal)]);k.batchStatic(stage,[installation,waterDisc,...moving]);
 const focus=new T.Vector3(0,2.78,0),start=new T.Vector3(11.9,7.5,13.9),end=new T.Vector3(10.9,6.55,14.5),control=new T.Vector3(13.0,7.1,13.3),currentLook=focus.clone();camera.near=.08;camera.far=100;camera.fov=36;
 function update(t,aspect,dt=0,motion=true){if(dead)return;time=t;elapsed=motion?Math.min(10,elapsed+Math.max(0,dt)):10;const p=Math.min(1,elapsed/10),q=1-Math.pow(1-p,3),iq=1-q;camera.position.copy(start).multiplyScalar(iq*iq).addScaledVector(control,2*iq*q).addScaledVector(end,q*q);currentLook.copy(focus);currentLook.y+=.20*(1-q);
  if(motion){const drift=Math.min(1,Math.max(0,elapsed-7)/3);camera.position.x+=Math.sin(t*.13)*.40*drift;camera.position.y+=Math.sin(t*.16)*.085*drift;camera.position.z+=Math.cos(t*.13)*.19*drift;k.normal.offset.set(t*.002,t*.0013);orbit.rotation.y=t*.036;k.animate(t)}else{k.animate(0)}
  signals.forEach(({signal,offset})=>signal.position.copy(path.getPointAt(((motion?t*.045:0)+offset)%1)));camera.aspect=Math.max(.1,aspect);camera.zoom=1/Math.max(1,.88/camera.aspect);camera.fov=T.MathUtils.lerp(38,36,q);camera.lookAt(currentLook);camera.updateProjectionMatrix();scene.updateMatrixWorld(true);camera.updateMatrixWorld();
  coreLamp.intensity=.28+night*.88;mastLamp.intensity=.28+night*.86;light.emissiveIntensity=1.15+night*.95;water.color.set(0x719b9f).lerp(new T.Color(0x223e50),night);water.opacity=.28+night*.1;
 }
 function replay(animated=true){elapsed=animated?0:10;update(time,camera.aspect,0,animated)}
 update(0,1,0,false);
 return{scene,camera,update,replay,setNight(n){night=n;k.setNight(n)},consumeShadowDirty(){const value=shadowDirty;shadowDirty=false;return value},dispose(){dead=true;k.dispose()},diagnostics(){let meshes=0,triangles=0;scene.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1)}});return{dead,elapsed,settled:elapsed>=10,night,meshes,triangles,camera:camera.position.toArray(),illustrative:true}},bounds:()=>new T.Box3().setFromObject(installation)};
}
window.MOD_CLOSING_MODEL={create};})();
