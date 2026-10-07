const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),{createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),dom=new JSDOM('<body></body>',{runScripts:'outside-only'}),w=dom.window;
w.HTMLCanvasElement.prototype.getContext=function(){if(!this.c)this.c=createCanvas(this.width||512,this.height||512);return this.c.getContext('2d')};
for(const p of ['vendor/three.min.js','vendor/three-helpers.js','scripts/cinema-assets.js','scripts/premium-kit.js','scripts/land-border-story.js','scripts/land-border-model.js'])w.eval(fs.readFileSync(root+'/'+p,'utf8'));
try{
 const S=w.MOD_BORDER_STORY,m=w.MOD_BORDER_MODEL.create(),T=w.THREE;
 assert.ok(m.scene.getObjectByName('border-fence'),'chainlink fence restored');
 for(const name of ['guard-house','landing-pad'])assert.equal(m.scene.getObjectByName(name),undefined);
 for(const aspect of [1,1.4,1.78,2.2])for(let t=0;t<=84;t+=.5){
  const s=S.sample(t);m.update(s,aspect,t);
  const drone=m.scene.getObjectByName('drone').position.clone().project(m.camera);
  if(t<=6)assert.ok(Math.abs(drone.x)>1||Math.abs(drone.y)>1||drone.z>1,'opening excludes drone '+t+' aspect '+aspect);
  if(t>=20)assert.ok(Math.abs(drone.x)<.90&&drone.y<.80&&drone.y>-.85,'airborne drone remains framed '+t+' aspect '+aspect);
  if(t<43)assert.equal(m.scene.getObjectByName('patrol').visible,false,'patrol absent before dispatch');
  for(const [i,p] of s.people.entries()){
   assert.ok(Number.isFinite(p.speed)&&Number.isFinite(p.distance));
   if(t>=80)assert.equal(m.scene.getObjectByName('entrant-'+i).visible,false,'no people protrude from vehicle after boarding');
   if(p.visible!==false){const v=new T.Vector3(p.x,1,p.z).project(m.camera);assert.ok(Math.abs(v.x)<.9&&Math.abs(v.y)<.9,'entrant remains framed '+t)}
  }
 }
 for(const cut of [8,12,20,22,29,32,35,43,49,55,68]){m.update(S.sample(cut-.01),1.78,cut-.01);const before=m.camera.position.clone();m.update(S.sample(cut+.01),1.78,cut+.01);assert.ok(before.distanceTo(m.camera.position)<.2,'no camera jump at '+cut)}
 const entrant=m.scene.getObjectByName('entrant-0');for(let t=68;t<71;t+=.05){m.update(S.sample(t),1.78,t);const a=entrant.rotation.y;m.update(S.sample(t+.05),1.78,t+.05);assert.ok(Math.abs(a-entrant.rotation.y)<.2,'escort turn blends naturally')}
 m.update(S.sample(84));m.update(S.sample(5));assert.equal(m.scene.getObjectByName('entrant-0').visible,true,'seeking restores people');
 m.renderSensor({render(scene){scene.traverse(o=>{if(o.isMesh)assert.equal(o.material.userData.palette,'ironbow','real false-colour thermal materials')})}},m.feedCamera,true);
 const css=fs.readFileSync(root+'/styles/land-border.css','utf8');assert.match(css,/grid-template-rows:auto minmax\(320px,1fr\) 58px/,'compact layout dedicates height to scene');
 m.dispose();console.log('PASS choreography: close opening, all-timeline framing across four aspects, delayed patrol, boarding visibility/seek, false-colour thermal, compact scene layout.');
}finally{dom.window.close()}
