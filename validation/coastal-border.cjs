const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom'),{createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),dom=new JSDOM('<body></body>',{runScripts:'outside-only'}),w=dom.window;
w.HTMLCanvasElement.prototype.getContext=function(){if(!this.c)this.c=createCanvas(this.width||512,this.height||512);return this.c.getContext('2d')};
for(const p of ['config/presentation.js','vendor/three.min.js','vendor/three-helpers.js','scripts/cinema-assets.js','scripts/premium-kit.js','scripts/coastal-story.js','scripts/coastal-model.js'])if(fs.existsSync(root+'/'+p))w.eval(fs.readFileSync(root+'/'+p,'utf8'));
try{
 assert.equal(w.MOD_CONFIG.slides[11].id,'coastal-border');assert.equal(w.MOD_CONFIG.slides[11].group,1);assert.equal(w.MOD_CONFIG.slides.length,15);
 assert.ok(w.MOD_COASTAL_STORY&&w.MOD_COASTAL_MODEL,'coastal story and real scene are required');
 const S=w.MOD_COASTAL_STORY,m=w.MOD_COASTAL_MODEL.create(),T=w.THREE;
 for(const n of ['sea-surface','coastal-tower','coastal-camera','suspect-vessel','marine-patrol','drone','target-wake','patrol-wake'])assert.ok(m.scene.getObjectByName(n),n);
 assert.ok(m.scene.getObjectByName('suspect-vessel-hull').geometry.attributes.normal.getX(0)<0,'hull faces point outward for real GPU rendering');
 for(const aspect of [1,1.4,1.78,2.2])for(let t=0;t<=96;t+=1){const s=S.sample(t);m.update(s,aspect,t);
  const target=new T.Vector3(s.target.x,1,s.target.z).project(m.camera);assert.ok(Math.abs(target.x)<.88&&Math.abs(target.y)<.85,'target camera frame '+t);
  const feed=m.focus.clone().project(m.feedCamera);assert.ok(Math.abs(feed.x)<.1&&Math.abs(feed.y)<.1,'sensors share target');
  if(t<44)assert.equal(m.scene.getObjectByName('marine-patrol').visible,false,'patrol enters only after dispatch');
  if(t>=22){const drone=m.scene.getObjectByName('drone').position.clone().project(m.camera);assert.ok(Math.abs(drone.x)<.92&&Math.abs(drone.y)<.86,'drone framing '+t)}
  assert.ok(Math.hypot(s.target.x-s.vehicle.x,s.target.z-s.vehicle.z)>3,'vessels never collide');
  for(const p of [...s.people,...s.responders])assert.ok([p.x,p.y,p.z].every(Number.isFinite));
 }
 assert.equal(S.sample(12).detected,true);assert.equal(S.sample(24).alerted,true);assert.equal(S.sample(44).dispatched,true);assert.equal(S.sample(80).detained,true);assert.equal(S.sample(96).complete,true);
 assert.ok(S.sample(80).responders.some(p=>p.boarded),'officer boards target vessel');
 const before=m.scene.getObjectByName('sea-surface').material;m.update(S.sample(36),1.78,36);
 m.renderSensor({render(scene){assert.equal(m.scene.getObjectByName('drone').visible,false);assert.equal(scene.getObjectByName('sea-surface').material.userData.palette,'ironbow')}},m.feedCamera,true);
 assert.equal(m.scene.getObjectByName('sea-surface').material,before,'thermal restores optical materials');
 const d=JSON.stringify(S.sample(72));S.sample(5);assert.equal(JSON.stringify(S.sample(72)),d,'deterministic seeking');
 assert.ok(m.diagnostics().meshes>120,'detailed coastal models');m.setNight(1);assert.equal(m.diagnostics().night,1);m.dispose();
 for(const src of w.MOD_CONFIG.stageImages)assert.ok(fs.existsSync(root+'/'+src),'approach image '+src);
 console.log('PASS coastal border: source routing, vessel separation, boarding, 4-aspect framing, water/thermal scene, deterministic timeline and approach asset paths.');
}finally{dom.window.close()}
