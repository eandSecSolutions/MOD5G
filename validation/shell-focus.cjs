const assert=require('node:assert/strict');
const {runtime}=require('./shell-runtime.cjs');
(async()=>{
for(const lang of ['en','ar'])for(const motion of [false,true]){
 const r=runtime({url:'https://example.test/?lang='+lang,motion}),{w,d}=r;
 try{
  const first=d.querySelector('#sectionRail [data-group="0"]');first.focus();
  r.key(lang==='en'?'ArrowRight':'ArrowLeft',first);r.advance(1100);
  assert.equal(w.MOD_SHELL.getState().index,3);
  assert.equal(d.activeElement.dataset.group,'1',`${lang} motion=${motion}: section selection must preserve keyboard focus`);
  r.key(lang==='en'?'ArrowRight':'ArrowLeft',d.activeElement);r.advance(1100);
  assert.equal(w.MOD_SHELL.getState().index,12,`${lang} motion=${motion}: the second arrow must move to next section, not next slide`);
  assert.equal(d.activeElement.dataset.group,'2');
  assert.deepEqual(r.errors,[]);
 }finally{await r.ready();r.close()}
}
console.log('PASS section keyboard focus survives section rebuilds (EN/AR, motion on/off)');
})().catch(e=>{console.error(e);process.exitCode=1});
