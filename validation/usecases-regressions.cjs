const assert=require('node:assert/strict');
const {runtime}=require('./usecases-runtime.cjs');
const failures=[];
function test(name,fn){try{fn();console.log('PASS',name)}catch(e){failures.push(name);console.error('FAIL',name,e.message)}}
test('Caller and dispatch play controls restart a completed story',()=>{
 const r=runtime();try{for(const index of [5,6]){
  const api=r.w.MOD_CAPABILITY;api.sync({index,lang:'en',theme:'light',motion:true});api.seek(35.99);
  r.w.document.querySelector('#'+(index===5?'caller':'dispatch')+'Slide .cap-pause').click();
  assert.equal(api.diagnostics().running,true,'play must restart the completed story');
  assert.equal(api.diagnostics().elapsed,0);r.advance(200);assert(api.diagnostics().elapsed>0);
 }}finally{r.close()}
});
test('Unavailable WebGL does not offer guided playback that cannot run',()=>{
 for(const [name,index,selectors]of [['MOD_USECASES',3,['.ov25-tour']],['MOD_PTT',4,['.ptt-pause','.ptt-replay']],['MOD_CAPABILITY',5,['.cap-pause','.cap-replay']]]){
  const r=runtime({failRenderer:true});try{r.w[name].sync({index,lang:'en',theme:'light',motion:true});for(const selector of selectors)assert.equal(r.w.document.querySelector(selector).disabled,true,selector+' cannot play without its scene')}finally{r.close()}
 }
});
test('Context loss suspends guided playback controls and restoration re-enables them',()=>{
 for(const [name,index,id,selectors]of [['MOD_USECASES',3,'usecases',['.ov25-tour']],['MOD_PTT',4,'ptt',['.ptt-pause','.ptt-replay']],['MOD_CAPABILITY',5,'caller',['.cap-pause','.cap-replay']]]){
  const r=runtime();try{const state={index,lang:'ar',theme:'dark',motion:true};r.w[name].sync(state);const host=r.w.document.getElementById(id+'Slide'),canvas=host.querySelector('canvas');canvas.dispatchEvent(new r.w.Event('webglcontextlost',{cancelable:true}));for(const selector of selectors)assert.equal(host.querySelector(selector).disabled,true,selector+' during context loss');canvas.dispatchEvent(new r.w.Event('webglcontextrestored'));for(const selector of selectors)assert.equal(host.querySelector(selector).disabled,false,selector+' after context restoration')}finally{r.close()}
 }
});
process.exitCode=failures.length?1:0;
