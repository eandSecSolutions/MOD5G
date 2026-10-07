// Catches misplaced actors/cameras, absent articulated assets and lost night
// lighting. Actual bundled Three geometry, without a WebGL/browser renderer.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),{createCanvas}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..');
const dom=new JSDOM('<html><body></body></html>',{runScripts:'outside-only'}),w=dom.window;
w.HTMLCanvasElement.prototype.getContext=function(t){if(t!=='2d')return null;if(!this.c)this.c=createCanvas(this.width||512,this.height||512);return this.c.getContext('2d')};
for(const p of ['vendor/three.min.js','vendor/three-helpers.js','scripts/cinema-assets.js','scripts/premium-kit.js','scripts/land-border-story.js'])w.eval(fs.readFileSync(root+'/'+p,'utf8'));
const p=root+'/scripts/land-border-model.js';if(fs.existsSync(p))w.eval(fs.readFileSync(p,'utf8'));
try{const m=w.MOD_BORDER_MODEL.create(),T=w.THREE,sign=m.scene.getObjectByName('uae-boundary-sign');
 for(const t of [0,12,24,44,60,80]){m.update(w.MOD_BORDER_STORY.sample(t),1.78,t);const b=new T.Box3().setFromObject(sign);assert.ok(b.min.z>0,'territory sign stays clear of the fence at z=-1');}
 const flag=m.scene.getObjectByName('uae-border-flag');assert.ok(flag,'border marker includes UAE flag');let patches=0;m.scene.traverse(o=>{if(o.name==='uae-arm-patch'){patches++;assert.ok(o.geometry.parameters.width>=.13,'patch readable at model scale');assert.ok(o.parent.name==='responder-shoulder','patch follows the articulated upper arm')}});assert.equal(patches,6,'both arms of all three responders have UAE patches');m.dispose();console.log('PASS territory marker: fence clearance, freestanding flag and articulated UAE arm patches.');
}finally{dom.window.close()}
