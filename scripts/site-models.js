/* Original MOD PoC scene models. Built for this presentation, in metres.
   No NSUTM meshes, model files, textures or animation code are used. */
(()=>{
 const T=THREE,R=MOD_THREE_ADDONS.RoundedBoxGeometry;
 function material(color,metalness=0,roughness=.5){return new T.MeshStandardMaterial({color,metalness,roughness})}
 const palette={stone:material(0xded8c9,.06,.7),ivory:material(0xeae6d8,.12,.38),edge:material(0xb3ad9b,.45,.35),dark:material(0x292d2b,.55,.37),gold:material(0xb58b43,.72,.28),glass:new T.MeshPhysicalMaterial({color:0x243a3c,metalness:.5,roughness:.17,clearcoat:1}),rubber:material(0x20211f,.05,.86),metal:material(0xaeb5b4,.78,.27),road:material(0x7c7b71,.05,.92),white:material(0xf9f3de,.1,.5)};
 function mesh(parent,geometry,mat,x=0,y=0,z=0){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 const box=(p,w,h,d,m,x=0,y=0,z=0,r=.03)=>mesh(p,new R(w,h,d,2,Math.min(r,w/3,h/3,d/3)),m,x,y,z);
 const cyl=(p,r,h,m,x=0,y=0,z=0,n=24)=>mesh(p,new T.CylinderGeometry(r,r,h,n),m,x,y,z);
 function bar(p,a,b,r,m){const va=new T.Vector3(...a),vb=new T.Vector3(...b),v=vb.clone().sub(va),o=mesh(p,new T.CylinderGeometry(r,r,v.length(),8),m);o.position.copy(va).add(vb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o}
 const lampMaterials=new Map();
 function lamp(p,x,y,z,color=0xffd696,size=.035){if(!lampMaterials.has(color))lampMaterials.set(color,new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.8,roughness:.25,toneMapped:false}));const mat=lampMaterials.get(color);return mesh(p,new T.SphereGeometry(size,8,6),mat,x,y,z)}
 function rack(p,x,y,z,w=.42){const g=new T.Group();g.position.set(x,y,z);p.add(g);box(g,w,1.1,.36,palette.dark,0,.55,0);for(let i=0;i<8;i++){box(g,w*.86,.08,.03,palette.metal,0,.13+i*.12,.19,.01);lamp(g,-w*.32,.13+i*.12,.211,0x7bcda4,.014)}return g}
const logoCanvas=document.createElement('canvas');logoCanvas.width=512;logoCanvas.height=483;const logoCtx=logoCanvas.getContext('2d');logoCtx.scale(512/192.7,483/181.8);logoCtx.fillStyle='#e00b14';["m163.8,96.6c6.8-11.8,10.7-25.1,12.1-38.1h-20.8c-.5,8-2.1,16.1-4.9,23.4-2.7,7.1-6.2,13.5-10.7,18.7h0c-6.8,7.8-15.4,12.8-25.3,12.8-11.7,0-19.7-5-22.7-13.4h-22.2c-3.6,8.7-12.1,13-22.9,13-11.8,0-23.9-8.5-25.3-25.8h69.5c1.8-8.5,8.5-14.9,19.4-19.1,0,0,10.1-3.7,20.1-8h0c13.9-6.4,24.3-17.9,24.3-32.4,0-20.6-17.7-27.7-33.6-27.7-20.1,0-35,10.6-35,27.4,0,9.9,5.4,19.2,13.3,28.6-4.2,1.5-8.3,3.4-12,5.8-6.4-17.7-21.2-29.2-41.3-29.2C19.3,32.6,0,52.5,0,80.6s17.2,49.6,47.2,49.6c13.8,0,24.2-5,31.4-12.1,7.4,7.5,18.4,12.1,31.9,12.1,16.6,0,30.2-6.6,40.6-16.8l13.3,14.6h28.3l-28.9-31.4ZM120.9,15.7c7.6,0,13.9,4.3,13.9,12.8,0,7.8-4.7,15.4-15.3,20.1l-.2-.2c-6.2-6.6-12.1-14.2-12.1-21.5,0-7.1,6.5-11.2,13.7-11.2ZM45.8,48.7c12.1,0,23.2,8.8,23.8,23.4H21.1c1.7-17.6,15-23.4,24.7-23.4Z", "m14.3,178.1c2.3,0,4.1-.9,4.8-2.8h4.3c-.9,3.2-3.9,6.4-9,6.4-6.3,0-10-4.9-10-10.5,0-6,4.1-10.2,9.7-10.2,6.1,0,9.8,4.9,9.5,11.6h-14.7c.4,3.7,2.9,5.5,5.4,5.5Zm4.9-8.7c-.1-3.1-2.5-5-5-5-2.1,0-4.9,1.2-5.2,5h10.2Z", "m31.3,156.2v5.2h4v3.2h-4v10.8c0,2,.5,2.5,2.3,2.5h1.6v3.3h-3.2c-4.2,0-5.1-1.1-5.1-5.2v-11.4h-2.9v-3.2h2.9v-5.2h4.4Z", "m42.3,159h-4.4v-4.4h4.4v4.4Zm0,22.2h-4.4v-19.8h4.4v19.8Z", "m53.3,164.3c-1.9,0-3.7.8-3.7,2.2s1,2,2.6,2.4l2.8.6c4,.8,7,2,7,5.9,0,4.1-3.9,6.4-8.4,6.4-4.8,0-8.1-2.8-8.5-6.5h4.3c.4,2,1.9,3.2,4.4,3.2,2.3,0,4-1,4-2.6s-1.5-2.4-3.4-2.7l-3-.6c-3.3-.7-5.9-2.2-5.9-5.8s3.7-5.7,8-5.7c3.9,0,7.4,1.9,8.2,5.8h-4.1c-.5-1.9-2.1-2.6-4.3-2.6Z", "m77.1,168.9v-.4c0-3.4-1.9-4.4-4.1-4.4s-3.9,1.2-4,3.6h-4.3c.3-4,3.6-6.8,8.4-6.8s8.4,2.2,8.3,8.5c0,1-.1,3.3-.1,5.1,0,2.5.2,5.1.6,6.8h-4c-.1-.8-.3-1.3-.4-2.7-1.2,2.1-3.6,3.2-6.5,3.2-4.3,0-7.3-2.3-7.3-5.9.2-5.1,6.2-6.3,13.4-7Zm-8.6,6.8c0,1.7,1.4,2.8,3.6,2.8,3.2,0,5.1-1.7,5.1-5v-1.6c-6.2.6-8.7,1.5-8.7,3.8Z", "m85.2,181.2v-26.6h4.4v26.6h-4.4Z", "m105.7,168.9v-.4c0-3.4-1.9-4.4-4.1-4.4s-3.9,1.2-4,3.6h-4.3c.3-4,3.6-6.8,8.4-6.8s8.4,2.2,8.3,8.5c0,1-.1,3.3-.1,5.1,0,2.5.2,5.1.6,6.8h-4c-.1-.8-.3-1.3-.4-2.7-1.2,2.1-3.6,3.2-6.5,3.2-4.3,0-7.3-2.3-7.3-5.9.1-5.1,6.1-6.3,13.4-7Zm-8.7,6.8c0,1.7,1.4,2.8,3.6,2.8,3.2,0,5.1-1.7,5.1-5v-1.6c-6.2.6-8.7,1.5-8.7,3.8Z", "m118.6,156.2v5.2h4v3.2h-4v10.8c0,2,.5,2.5,2.3,2.5h1.6v3.3h-3.2c-4.2,0-5.1-1.1-5.1-5.2v-11.4h-2.9v-3.2h2.9v-5.2h4.4Z", "m145.8,168.9v-.4c0-3.4-1.9-4.4-4.1-4.4s-3.9,1.2-4,3.6h-4.3c.3-4,3.6-6.8,8.4-6.8s8.4,2.2,8.3,8.5c0,1-.1,3.3-.1,5.1,0,2.5.2,5.1.6,6.8h-4c-.1-.8-.3-1.3-.4-2.7-1.2,2.1-3.6,3.2-6.5,3.2-4.3,0-7.3-2.3-7.3-5.9.1-5.1,6.2-6.3,13.4-7Zm-8.6,6.8c0,1.7,1.4,2.8,3.6,2.8,3.2,0,5.1-1.7,5.1-5v-1.6c-6.2.6-8.7,1.5-8.7,3.8Z", "m164.2,161c4.8,0,6.7,3.1,6.7,7.8v12.4h-4.3v-11.3c0-2.7-.4-5.3-3.7-5.3s-4.6,2.6-4.6,6.1v10.5h-4.4v-19.8h4.4v2.8c1.1-2.1,3.2-3.2,5.9-3.2Z", "m192.4,154.6v26.6h-4.4v-2.6c-1.2,1.9-3.2,3.1-5.9,3.1-4.7,0-8.6-4-8.6-10.4s3.9-10.3,8.6-10.3c2.6,0,4.7,1.1,5.9,3.1v-9.5h4.4Zm-14.3,16.7c0,4.2,2.1,6.8,5,6.8s5.1-2.2,5.1-6.8-2.2-6.8-5.1-6.8c-2.9.1-5,2.7-5,6.8Z"].forEach(d=>logoCtx.fill(new Path2D(d)));const logoMap=new T.CanvasTexture(logoCanvas);logoMap.colorSpace=T.SRGBColorSpace;const logoMaterial=new T.MeshBasicMaterial({map:logoMap,transparent:true,depthWrite:false,toneMapped:false});
 function truck(){
  const g=new T.Group();g.name='Original MOD mobile datacentre';
  box(g,5.3,.18,1.5,palette.dark,0,.6,0);box(g,3.7,.18,1.65,palette.edge,-.72,.84,0);
  box(g,3.7,1.7,1.7,palette.ivory,-.72,1.75,0,.08);box(g,3.76,.09,1.76,palette.white,-.72,2.64,0,.035);
  for(const side of [-1,1]){
   for(let i=0;i<13;i++)box(g,.025,1.55,.024,palette.edge,-2.44+i*.272,1.75,side*.863,.007);
   box(g,1.3,.56,.035,palette.dark,-1.64,1.55,side*.875);
   for(let i=0;i<7;i++)box(g,1.16,.025,.04,palette.metal,-1.64,1.31+i*.075,side*.903,.006);
   box(g,.62,.48,.045,palette.gold,.65,1.78,side*.89,.025);
   box(g,.58,.44,.048,palette.ivory,.65,1.78,side*.916,.018);
   box(g,.16,.9,.045,palette.edge,1.06,1.75,side*.88);
   box(g,.45,.1,.28,palette.dark,1.72,.64,side*.93);
  }
  for(const side of [-1,1]){const decal=mesh(g,new T.PlaneGeometry(.42,.39),logoMaterial,.65,1.78,side*.945);if(side<0)decal.rotation.y=Math.PI;decal.castShadow=false;}
  // Tilted front windshield, door windows, mirrors, grille and lamps.
  box(g,1.62,1.5,1.74,palette.ivory,1.87,1.51,0,.16);
  box(g,1.69,.12,1.8,palette.white,1.83,2.28,0,.06);
  box(g,.055,.66,1.43,palette.glass,2.694,1.85,0,.02);
  for(const side of [-1,1]){
   box(g,.82,.62,.035,palette.glass,1.98,1.85,side*.875,.06);
   box(g,.04,.7,.025,palette.ivory,1.49,1.79,side*.894);
   box(g,.20,.035,.05,palette.dark,1.74,1.42,side*.901);
   bar(g,[2.37,1.92,side*.87],[2.48,1.9,side*1.08],.027,palette.dark);
   box(g,.08,.30,.15,palette.dark,2.5,1.78,side*1.10,.025);
   box(g,.05,.15,.27,palette.white,2.71,1.03,side*.57,.04);
   const head=box(g,.018,.1,.21,new T.MeshStandardMaterial({color:0xffe8b5,emissive:0xffd28b,emissiveIntensity:1}),2.742,1.05,side*.57,.02);
   box(g,.25,.30,.85,palette.dark,1.83,.82,side*.6,.045);
  }
  box(g,.11,.25,1.8,palette.edge,2.70,.77,0,.06);
  box(g,.07,.29,.82,palette.dark,2.72,1.03,0);
  for(let i=0;i<7;i++)box(g,.013,.017,.70,palette.metal,2.765,.93+i*.037,0,.004);
  box(g,.028,.10,.33,palette.white,2.78,.77,0,.01);
  const wheels=[];
  for(const x of [-2.10,-1.39,1.96])for(const side of [-1,1]){
   const wheel=new T.Group();wheel.position.set(x,.43,side*.84);g.add(wheel);
   const tyre=mesh(wheel,new T.CylinderGeometry(.39,.39,.24,32),palette.rubber);tyre.rotation.x=Math.PI/2;
   const rim=mesh(wheel,new T.CylinderGeometry(.23,.23,.26,24),palette.metal);rim.rotation.x=Math.PI/2;
   const hub=mesh(wheel,new T.CylinderGeometry(.10,.10,.285,16),palette.dark);hub.rotation.x=Math.PI/2;
   for(let i=0;i<6;i++){const a=i*Math.PI/3;const lug=mesh(wheel,new T.SphereGeometry(.025,6,4),palette.gold,Math.cos(a)*.15,Math.sin(a)*.15,side*.15);}
   wheels.push(wheel);
  }
  // Visible equipment bay and a hinged service door.
  box(g,1.0,1.28,.04,palette.dark,-.1,1.68,.891,.035);
  const bay=new T.Group();bay.position.set(-.1,1.07,.88);bay.scale.set(.75,.95,.75);g.add(bay);rack(bay,-.26,0,0,.42);rack(bay,.26,0,0,.42);
  const hinge=new T.Group();hinge.position.set(-.62,1.67,.93);g.add(hinge);box(hinge,1.05,1.35,.06,palette.ivory,.525,0,0,.03);box(hinge,.03,.21,.05,palette.dark,.93,0,.05,.008);
  const coolingFans=[];
  for(const x of [-1.8,-.6]){box(g,.82,.18,.85,palette.metal,x,2.76,0,.08);const rotor=new T.Group();rotor.position.set(x,2.87,0);rotor.userData.dynamic=true;g.add(rotor);cyl(rotor,.08,.04,palette.dark);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const blade=box(rotor,.40,.02,.09,palette.dark,Math.cos(a)*.13,0,Math.sin(a)*.13,.025);blade.rotation.y=-a}coolingFans.push(rotor);}
  // Protective side rails and lower storage compartments.
  for(const side of [-1,1]){box(g,2.1,.24,.15,palette.dark,-.15,.63,side*.80,.04);bar(g,[-2.5,.8,side*.95],[.9,.8,side*.95],.035,palette.metal);}
  const beacon=lamp(g,1.8,2.43,0,0xe8b145,.08);beacon.material=beacon.material.clone();beacon.userData.dynamic=true;hinge.userData.dynamic=true;wheels.forEach(w=>w.userData.dynamic=true);
  return{group:g,wheels,hinge,beacon,animate(t,door,night,clock=t){coolingFans.forEach((f,i)=>f.rotation.y=clock*(5+i));wheels.forEach(w=>w.rotation.z=-t*1.6);hinge.rotation.y=-door*1.3;beacon.material.emissiveIntensity=.25+(Math.sin(clock*5)>0?1.6:0)+night*.5}};
 }
 function building(kind){
  const g=new T.Group(),w=kind==='pulse'?4.6:4.4,d=3.1;
  box(g,w+.7,.18,d+.7,palette.stone,0,.09,0,.12);
  box(g,w,2.15,d,palette.ivory,0,1.25,0,.065);
  box(g,w+.12,.17,d+.12,palette.edge,0,2.38,0,.05);
  box(g,w+.18,.045,d+.18,palette.white,0,2.49,0,.02);
  // Continuous glazed facade framed with champagne fins.
  box(g,w-.55,1.5,.075,palette.glass,0,1.24,d/2+.045,.025);
  for(let i=0;i<9;i++)box(g,.055,1.85,.14,palette.gold,-(w-.3)/2+i*(w-.3)/8,1.33,d/2+.11,.007);
  box(g,w-.3,.14,.60,palette.stone,0,.24,d/2+.31,.03);
  box(g,w-.7,.1,.4,palette.stone,0,.10,d/2+.72,.025);
  for(let i=0;i<4;i++){box(g,.59,1.48,.045,palette.dark,-1.30+i*.86,1.24,d/2+.094);for(let j=0;j<8;j++){box(g,.48,.08,.03,palette.edge,-1.30+i*.86,.66+j*.16,d/2+.127,.01);lamp(g,-1.47+i*.86,.66+j*.16,d/2+.15,0x80cdb0,.013)}}
  // Side glazing, vertical cladding joints and architectural roof reveals.
  for(const side of [-1,1]){box(g,.035,1.15,1.85,palette.glass,side*(w/2+.018),1.32,-.2,.01);for(let i=0;i<5;i++)box(g,.08,1.48,.04,palette.gold,side*(w/2+.045),1.32,-1+i*.4,.006);}
  box(g,w+.06,.08,d+.06,palette.dark,0,2.28,0,.02);
  // Roof plant with rotating fan.
  box(g,1.0,.46,.85,palette.metal,-1,2.68,-.5,.055);box(g,.84,.045,.68,palette.dark,-1,2.93,-.5,.02);
  const fan=new T.Group();fan.userData.dynamic=true;fan.position.set(-1,2.96,-.5);g.add(fan);cyl(fan,.07,.05,palette.gold,0,0,0,12);for(let i=0;i<4;i++){const a=i*Math.PI/2;const blade=box(fan,.51,.012,.07,palette.metal,Math.cos(a)*.15,0,Math.sin(a)*.15,.02);blade.rotation.y=-a}
  box(g,.7,.6,.6,palette.edge,1.1,2.79,-.4);
  const lamps=[];for(const x of [-1.8,1.8]){box(g,.12,.21,.13,palette.dark,x,1.9,d/2+.17);lamps.push(lamp(g,x,1.75,d/2+.18,0xffd894,.05))}
  return{group:g,fan,lamps};
 }
 function mast(height=5.3){
  const g=new T.Group();box(g,1.0,.16,1.0,palette.stone,0,.08,0,.07);
  const r=.26;for(const a of [0,Math.PI*2/3,Math.PI*4/3]){const x=Math.cos(a)*r,z=Math.sin(a)*r;bar(g,[x,.13,z],[x*.6,height,z*.6],.033,palette.metal)}
  for(let y=.35;y<height-.4;y+=.56){for(let i=0;i<3;i++){const a=i*Math.PI*2/3,b=(i+1)*Math.PI*2/3;bar(g,[Math.cos(a)*r,y,Math.sin(a)*r],[Math.cos(b)*r,y+.5,Math.sin(b)*r],.018,palette.edge)}}
  cyl(g,.06,height+.75,palette.metal,0,(height+.75)/2,0,12);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const p=new T.Group();p.position.set(Math.cos(a)*.35,height-.57,Math.sin(a)*.35);p.rotation.y=-a+Math.PI/2;g.add(p);box(p,.30,1.28,.18,palette.ivory,0,0,0,.075);bar(p,[0,-.4,-.1],[0,-.4,-.35],.035,palette.metal)}
  const beacon=lamp(g,0,height+.43,0,0xe86748,.04);beacon.material=beacon.material.clone();beacon.userData.dynamic=true;
  const rings=[];for(let i=0;i<3;i++){const m=mesh(g,new T.TorusGeometry(1,.013,5,80),new T.MeshBasicMaterial({color:0xdcb664,transparent:true,opacity:0,depthWrite:false}),0,height-.5,0);m.rotation.x=Math.PI/2;m.userData.dynamic=true;rings.push(m)}
  return{group:g,rings,beacon,height};
 }
 function dish(){const g=new T.Group();cyl(g,.055,.60,palette.metal,0,.3,0);const swivel=new T.Group();swivel.userData.dynamic=true;swivel.position.y=.65;g.add(swivel);const points=[];for(let i=0;i<=15;i++){const r=i/15*.55;points.push(new T.Vector2(r,.6*r*r))}const bowl=mesh(swivel,new T.LatheGeometry(points,36),new T.MeshStandardMaterial({color:0xe1decf,metalness:.55,roughness:.3,side:T.DoubleSide}));bowl.rotation.x=Math.PI/2-.55;bar(swivel,[0,0,0],[0,.15,.55],.025,palette.dark);box(swivel,.1,.1,.16,palette.gold,0,.15,.56,.025);return{group:g,swivel}}
 window.MOD_MODELS={palette,mesh,box,cyl,bar,lamp,truck,building,mast,dish};
})();
