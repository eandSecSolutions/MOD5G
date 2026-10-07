// Real story, Three geometry, GSAP and shell. Substitute only layout/GPU APIs.
const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {runtime}=require(root+'/validation/shell-runtime.cjs');
const env=runtime({build:root,boot:false,reduced:true,motion:true}),{w,d}=env;
for(const p of ['vendor/three.min.js','vendor/three-helpers.js','scripts/cinema-assets.js','scripts/premium-kit.js','scripts/land-border-story.js','scripts/land-border-model.js'])env.load(p);
let renders=0,disposals=0;
w.THREE.WebGLRenderer=class{constructor(){this.domElement=d.createElement('canvas');this.shadowMap={}}setPixelRatio(){}setClearColor(){}setSize(){}setViewport(){}setScissor(){}setScissorTest(){}clearDepth(){}render(s,c){s.updateMatrixWorld();c.updateMatrixWorld();renders++}dispose(){disposals++}forceContextLoss(){}};
env.load('scripts/land-border.js');env.boot();
const api=w.MOD_MISSIONS,$=s=>d.querySelector(s);
(async()=>{try{
 await env.ready();w.MOD_SHELL.goTo('land-border');env.advance(1300);
 assert.equal(api.diagnostics().renderer,'hybrid-3d');assert.equal(api.diagnostics().running,true);
 for(const lang of ['en','ar'])for(const theme of ['light','dark'])for(const motion of [true,false]){
  api.sync({index:10,lang,theme,motion});env.flushRAF();
  assert.equal($('#missionsSlide').dir,lang==='ar'?'rtl':'ltr');
  assert.equal(d.querySelectorAll('[data-border-stage]').length,7);
  for(let i=0;i<7;i++){$(`[data-border-stage="${i}"]`).click();assert.equal(api.diagnostics().phase,i);assert.equal($('.border-action').textContent,w.MOD_BORDER_STORY.stages[i].title[lang]);assert.match($('.border-network').textContent,/5G/);assert.equal(d.querySelectorAll('[data-border-stage][aria-current="step"]').length,1)}
  assert.equal(api.diagnostics().running,motion);assert.ok(renders>0);
 }
 api.sync({index:10,lang:'en',theme:'light',motion:true});api.replay();
 const n=api.diagnostics().time;env.advance(1000);assert.ok(api.diagnostics().time>n);
 $('.border-play').click();const hold=api.diagnostics().time;env.advance(500);assert.equal(api.diagnostics().time,hold);
 $('.border-view').click();assert.equal(api.diagnostics().view,'drone');assert.equal(api.diagnostics().time,hold,'entering the airborne feed must not jump the story');assert.equal($('.border-ir-frame').hidden,false,'IR remains visible in expanded EO view');$('.border-view').click();assert.equal(api.diagnostics().view,'director');
 api.select(0);env.key('End',$('[data-border-stage="0"]'));assert.equal(api.diagnostics().phase,6);assert.equal(w.MOD_SHELL.getState().index,10);
 api.sync({index:10,lang:'ar',theme:'dark',motion:false});api.select(0);env.key('ArrowLeft',$('[data-border-stage="0"]'));assert.equal(api.diagnostics().phase,1);
 const range=$('.border-seek');env.key('End',range);assert.equal(api.diagnostics().time,84);assert.equal(w.MOD_SHELL.getState().index,10);
 api.sync({index:10,lang:'en',theme:'light',motion:true});api.replay();env.visibility(true);const hidden=api.diagnostics().time;env.advance(500);assert.equal(api.diagnostics().time,hidden);assert.equal(api.diagnostics().running,false);env.visibility(false);assert.equal(api.diagnostics().running,true);
 api.seek(83.95);env.advance(500);assert.equal(api.diagnostics().time,84);assert.equal(api.diagnostics().playing,false);assert.equal(api.diagnostics().running,false);
 const canvas=$('.border-canvas');canvas.dispatchEvent(new w.Event('webglcontextlost',{cancelable:true}));assert.equal(api.diagnostics().failed,true);assert.equal($('.border-fallback-message').hidden,false);$('.border-retry').click();assert.equal(api.diagnostics().failed,false);assert.equal(api.diagnostics().time,84);
 const prev=disposals;w.MOD_SHELL.goTo('sites');env.advance(1300);assert.equal(api.diagnostics().running,false);assert.equal($('#missionsSlide').childElementCount,0);assert.ok(disposals>prev);assert.equal(env.ticks.size,0);
 assert.deepEqual(env.errors,[]);
 console.log('PASS land-border runtime: 8 EN/AR/theme/motion combinations; seven chapters; same-world drone view; replay/pause/seek; keyboard containment; end hold; context recovery; disposal. GPU/layout substituted.');
 }finally{api?.dispose();env.close()}})().catch(e=>{console.error(e);process.exitCode=1});
