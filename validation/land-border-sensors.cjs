const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),{createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..');
const dom=new JSDOM('<html><body></body></html>',{runScripts:'outside-only'}),w=dom.window;
w.HTMLCanvasElement.prototype.getContext=function(){if(!this.c)this.c=createCanvas(this.width||512,this.height||512);return this.c.getContext('2d')};
for(const p of ['vendor/three.min.js','vendor/three-helpers.js','scripts/cinema-assets.js','scripts/premium-kit.js','scripts/land-border-story.js','scripts/land-border-model.js'])w.eval(fs.readFileSync(root+'/'+p,'utf8'));
try{
 const S=w.MOD_BORDER_STORY;
 for(let t=0;t<=84;t+=.5){const s=S.sample(t);assert.ok(s.drone.flying&&s.drone.y>=8,'surveillance drone is already airborne at '+t);assert.equal(s.feed,'drone');}
 const m=w.MOD_BORDER_MODEL.create();
 for(const n of ['guard-house','boundary-camera','landing-pad'])assert.equal(m.scene.getObjectByName(n),undefined,'no physical border installation: '+n);
 assert.ok(m.scene.getObjectByName('viewer-boundary'),'dotted viewer line');assert.ok(m.scene.getObjectByName('mobile-5g-tower'),'mobile connectivity');
 assert.ok(m.scene.getObjectByName('mountain-terrain'),'real mountain relief');
 assert.equal(m.scene.getObjectByName('drone-landing-legs'),undefined);
 for(const t of [0,14,25,36,49,62,78]){
  const s=S.sample(t);m.update(s,16/9,t);const f=m.focus.clone().project(m.feedCamera);assert.ok(Math.abs(f.x)<.5&&Math.abs(f.y)<.5,'sensor tracks subjects');
  const drone=m.scene.getObjectByName('drone');const visible=drone.visible;let seen=false;
  m.renderSensor({render(scene,camera){seen=true;assert.equal(drone.visible,false,'airframe is excluded from onboard camera');assert.equal(camera,m.feedCamera)}},m.feedCamera,false);assert.ok(seen);assert.equal(drone.visible,visible);
  const person=m.scene.getObjectByName('entrant-0'),materials=[];person.traverse(o=>{if(o.isMesh)materials.push([o,o.material])});
  m.renderSensor({render(){assert.equal(drone.visible,false);assert.ok(materials.some(([o,mat])=>o.material!==mat),'IR has a real distinct material pass');assert.ok(materials.every(([o])=>o.material.userData.thermal),'IR represents the same people')}},m.feedCamera,true);
  assert.ok(materials.every(([o,mat])=>o.material===mat),'EO materials restored after IR');
 }
 m.dispose();console.log('PASS v39: airborne surveillance, open mountains/mobile tower, no airframe obstruction, synchronized false-colour thermal pass and material restoration.');
}finally{dom.window.close()}
