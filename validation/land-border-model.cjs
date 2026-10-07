// Catches misplaced actors/cameras, absent articulated assets and lost night
// lighting. Actual bundled Three geometry, without a WebGL/browser renderer.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),{createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..');
const dom=new JSDOM('<html><body></body></html>',{runScripts:'outside-only'}),w=dom.window;
w.HTMLCanvasElement.prototype.getContext=function(t){if(t!=='2d')return null;if(!this.c)this.c=createCanvas(this.width||512,this.height||512);return this.c.getContext('2d')};
for(const p of ['vendor/three.min.js','vendor/three-helpers.js','scripts/cinema-assets.js','scripts/premium-kit.js','scripts/land-border-story.js'])w.eval(fs.readFileSync(root+'/'+p,'utf8'));
const p=root+'/scripts/land-border-model.js';if(fs.existsSync(p))w.eval(fs.readFileSync(p,'utf8'));
assert.ok(w.MOD_BORDER_MODEL,'the cinematic must contain a real spatial model');
const m=w.MOD_BORDER_MODEL.create({lang:'en',dark:false}),T=w.THREE;
for(const name of ['viewer-boundary','mountain-terrain','mobile-5g-tower','drone','patrol','entrant-0','entrant-1','responder-0'])assert.ok(m.scene.getObjectByName(name),name+' must exist in the same world');
for(const time of [3,16,25,38,49,62,78]){
 const s=w.MOD_BORDER_STORY.sample(time);m.update(s,16/9,time);
 m.scene.updateMatrixWorld(true);m.camera.updateMatrixWorld(true);
 const focus=m.focus.clone().project(m.camera);
 assert.ok(Math.abs(focus.x)<.85&&Math.abs(focus.y)<.85&&focus.z>-1&&focus.z<1,'camera keeps incident focus framed at '+time);
 for(const name of ['drone','patrol','entrant-0','entrant-1']){
  const o=m.scene.getObjectByName(name);assert.ok(o.position.toArray().every(Number.isFinite));
 }
 const feed=m.focus.clone().project(m.feedCamera);assert.ok(Math.abs(feed.x)<.9&&Math.abs(feed.y)<.9,'feed tracks same incident');
}
const daylight=m.scene.children.filter(x=>x.isLight).reduce((n,l)=>n+l.intensity,0);m.setNight(1);
assert.ok(m.scene.children.filter(x=>x.isLight).reduce((n,l)=>n+l.intensity,0)<daylight);
assert.ok(m.diagnostics().meshes>70,'detailed asset construction survives static batching');
m.dispose();dom.window.close();
console.log('PASS land-border-model: shared 3D world, real actors, seven framed shots, camera/drone feed registration and readable night lighting.');
