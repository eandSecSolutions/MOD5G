const assert=require('node:assert/strict');
const {runtime}=require('./usecases-runtime.cjs');
const r=runtime(),{w}=r,c=w.MOD_CINEMA;
const state={lang:'en',theme:'light',motion:true};
try{
 for(const [index,id]of [[7,'drone'],[8,'ai'],[9,'body']]){
  const s={...state,index};c.sync(s);
  assert.equal(c.diagnostics().active,index);
  assert.equal(c.diagnostics().running,true);

  r.visibility(true);const time=c.diagnostics().elapsed;r.advance(300);
  assert.equal(c.diagnostics().elapsed,time,'hidden slides pause their timeline');
  r.visibility(false);
  c.seek(12.8);assert.equal(c.diagnostics().running,false);
  c.toggleView();r.advance(1800);assert.equal(c.diagnostics().blend,1);
  c.toggleView();r.advance(1800);assert.equal(c.diagnostics().blend,0);
  if(index>=8){c.toggleGina();assert.equal(c.diagnostics().gina,true);c.toggleGina()}
  if(index===9){c.toggleHardware();c.selectPart(2);assert.equal(c.diagnostics().detailPart,2);c.toggleHardware()}

  const host=w.document.getElementById(id+'Slide');
  c.seek(35.98);host.querySelector('.cinema-play').click();r.advance(150);
  assert.equal(c.diagnostics().elapsed,35.99);
  assert.equal(c.diagnostics().paused,true,'timeline ends paused');
  c.replay();r.advance(100);
  assert.ok(c.diagnostics().elapsed>0);
  assert.equal(c.diagnostics().running,true);

  const canvas=host.querySelector('canvas');
  canvas.dispatchEvent(new w.Event('webglcontextlost',{cancelable:true}));
  assert.equal(c.diagnostics().running,false);
  canvas.dispatchEvent(new w.Event('webglcontextrestored'));
  assert.equal(c.diagnostics().contextLost,false);
  assert.equal(c.diagnostics().paused,true);
  c.sync({...s,lang:'ar',motion:false});
  assert.equal(host.dir,'rtl');
  assert.equal(c.diagnostics().running,false);
  c.sync({...s,index:0});
  assert.equal(c.diagnostics().active,-1);
  assert.equal(c.diagnostics().model,undefined);
  assert.ok(r.renders.every(({position})=>position.every(Number.isFinite)),'camera coordinates remain finite');
  assert.ok(r.renderers.every(renderer=>renderer.disposed),'leaving slides disposes renderers');
  console.log('PASS cinema lifecycle '+id);
 }
 assert.deepEqual(r.errors.filter(e=>!e.startsWith('Scripts "build/three.js"')),[]);
 console.log('PASS cinema lifecycle matrix: visibility, views, timeline, recovery, RTL, reduced motion, disposal');
}finally{r.close()}
