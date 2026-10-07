/* DOM/state regression checks with real Three.js geometry; GPU and layout use the shared test adapter. */
const assert=require('node:assert/strict');
const {runtime}=require('./deployment-runtime.cjs');
const env=runtime(process.env.BUILD||'MOD_Pulse_v0.36.0'),{w}=env;
const $=s=>w.document.querySelector(s),all=s=>[...w.document.querySelectorAll(s)];
for(const id of ['implementationSlide','closingSlide']){const host=w.document.createElement('section');host.id=id;w.document.querySelector('main').append(host)}
for(const file of ['content/implementation.js','scripts/implementation-model.js','scripts/implementation.js','scripts/closing-model.js','scripts/closing.js'])env.load(file);
let hidden=false;Object.defineProperty(w.document,'hidden',{get:()=>hidden,configurable:true});
function visibility(value){hidden=value;w.document.dispatchEvent(new w.Event('visibilitychange'))}
const impl=w.MOD_IMPLEMENTATION,closing=w.MOD_CLOSING;
const checks=[];
function check(name,run){try{run();checks.push({name,pass:true});console.log('PASS:',name)}catch(error){checks.push({name,pass:false});console.error('FAIL:',name,'—',error.message)}}
function geometry(){assert(env.last);const {scene,camera}=env.last;assert(camera.projectionMatrix.elements.every(Number.isFinite));let meshes=0;scene.traverse(o=>{assert(o.matrixWorld.elements.every(Number.isFinite));if(o.isMesh){meshes++;assert(o.geometry.getAttribute('position'));}});assert(meshes>0)}
const taskCodes=[['01.01','01.02','01.03','01.04','01.05','01.06'],['02.01','02.02','02.03'],['03.01','03.02','03.03','03.04','03.05','03.06','03.07','03.08','03.09'],['04.01','04.02']];
const totalBars=[6,3,10,2];
for(const lang of ['en','ar'])for(const theme of ['light','dark'])for(const motion of [false,true]){
 const s={index:13,lang,theme,motion};
 check(`implementation ${lang}/${theme}/motion=${motion}: four filters, 20 tasks, 21 bars`,()=>{
  impl.sync(s);assert.equal(impl.diagnostics().failed,false);assert.equal(impl.diagnostics().taskCount,20);assert.equal(impl.diagnostics().running,motion);
  for(let i=0;i<4;i++){
   $(`[data-impl-stream="${i}"]`).click();assert.equal(impl.diagnostics().selected,i);assert.deepEqual(all('[data-impl-task]').map(el=>el.dataset.taskCode),taskCodes[i]);assert.equal(all('.impl-task-bars i').length,totalBars[i]);
   for(const bar of all('.impl-task-bars i')){const start=parseFloat(bar.style.getPropertyValue('--bar-start')),length=parseFloat(bar.style.getPropertyValue('--bar-length'));assert(start>=0&&length>0&&start+length<=100)}
   assert.equal(all('[data-impl-stream][aria-pressed="true"]').length,1);assert.equal($('.impl-step-previous').disabled,i===0);assert.equal($('.impl-step-next').disabled,i===3);
   all('[data-impl-task]').at(-1).click();assert.equal(all('[data-impl-task][aria-pressed="true"]').length,1);assert.equal(impl.diagnostics().taskIndex,taskCodes[i].length-1);
   if(motion)env.advance(2200);else assert.equal(impl.diagnostics().model.settled,true);geometry();
  }
  impl.select(0);$('.impl-explode').click();assert.equal(impl.diagnostics().exploded,true);$('.impl-explode').click();assert.equal(impl.diagnostics().exploded,false);
  $('.impl-immersive').click();assert.equal(impl.diagnostics().immersive,true);assert.equal($('.impl-timeline').inert,true);assert.equal($('.impl-timeline').getAttribute('aria-hidden'),'true');
  $('#implementationSlide').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert.equal(impl.diagnostics().immersive,false);assert.equal($('.impl-timeline').inert,false);assert.equal(w.document.activeElement,$('.impl-immersive'));
  impl.select(0);$('[data-impl-stream="0"]').dispatchEvent(new w.KeyboardEvent('keydown',{key:lang==='ar'?'ArrowLeft':'ArrowRight',bubbles:true,cancelable:true}));assert.equal(impl.diagnostics().selected,1);assert.equal(w.document.activeElement.dataset.implStream,'1');
  assert.equal($('.impl-replay').disabled,!motion);
  impl.sync({...s,index:0});assert.equal(env.ticks.size,0);assert.equal($('#implementationSlide').children.length,0);
 });
}
let si={index:13,lang:'en',theme:'light',motion:true};
check('implementation sequence timing, pause, visibility, reduced motion and leave',()=>{
 impl.sync(si);impl.replay();assert.equal(impl.diagnostics().playing,true);assert.equal(impl.diagnostics().selected,0);env.advance(8500);assert.equal(impl.diagnostics().selected,1);
 visibility(true);const before=impl.diagnostics().frames;assert.equal(env.ticks.size,0);env.advance(9000);assert.equal(impl.diagnostics().selected,1);assert.equal(impl.diagnostics().frames,before);
 visibility(false);assert.equal(env.ticks.size,1);$('.impl-replay').click();assert.equal(impl.diagnostics().playing,false);
 impl.replay();env.advance(33800);assert.equal(impl.diagnostics().selected,3);assert.equal(impl.diagnostics().playing,false);
 impl.replay();impl.sync({...si,motion:false});assert.equal(impl.diagnostics().running,false);assert.equal(impl.diagnostics().playing,false);assert.equal(impl.diagnostics().model.settled,true);
 impl.sync({...si,index:0});assert.equal(env.ticks.size,0);
});
check('implementation context loss exposes usable task list, restoration and stale canvas isolation',()=>{
 impl.sync(si);impl.setImmersive(true);const canvas=$('.impl-webgl canvas');const event=new w.Event('webglcontextlost',{cancelable:true});canvas.dispatchEvent(event);assert.equal(event.defaultPrevented,true);assert.equal(impl.diagnostics().failed,true);assert.equal(impl.diagnostics().immersive,false);assert.equal($('.impl-fallback').hidden,false);assert.equal($('.impl-timeline').inert,false);assert.equal(env.ticks.size,0);
 for(let i=0;i<4;i++){$(`[data-impl-stream="${i}"]`).click();assert.equal(all('[data-impl-task]').length,taskCodes[i].length)}
 canvas.dispatchEvent(new w.Event('webglcontextrestored'));assert.equal(impl.diagnostics().failed,false);assert.notEqual($('.impl-webgl canvas'),canvas);assert.equal(env.ticks.size,1);
 canvas.dispatchEvent(new w.Event('webglcontextlost',{cancelable:true}));assert.equal(impl.diagnostics().failed,false);
 impl.sync({...si,index:0});canvas.dispatchEvent(new w.Event('webglcontextrestored'));assert.equal($('#implementationSlide').children.length,0);assert.equal(env.ticks.size,0);
});
const navigations=[];w.MOD_SHELL={goTo:id=>navigations.push(id)};
for(const lang of ['en','ar'])for(const theme of ['light','dark'])for(const motion of [false,true]){
 const s={index:14,lang,theme,motion};
 check(`closing ${lang}/${theme}/motion=${motion}: actions, replay and leave`,()=>{
  closing.sync(s);const d=closing.diagnostics();assert.equal(d.failed,false);assert.equal(d.running,motion);assert.equal(d.model.night,theme==='dark'?1:0);assert($('.closing-title').textContent.length>0);assert.equal($('.closing-replay').disabled,!motion);geometry();
  $('.closing-overview').click();$('.closing-restart').click();assert.deepEqual(navigations.slice(-2),['use-cases','opening']);
  if(motion){env.advance(11000);assert.equal(closing.diagnostics().model.settled,true);$('.closing-replay').click();assert.equal(closing.diagnostics().model.elapsed,0)}else{closing.replay();assert.equal(closing.diagnostics().model.settled,true)}
  closing.sync({...s,index:0});assert.equal(env.ticks.size,0);assert.equal($('#closingSlide').children.length,0);
 });
}
let sc={index:14,lang:'en',theme:'light',motion:true};
check('closing visibility, reduced motion and context restoration',()=>{
 closing.sync(sc);closing.replay();env.advance(1000);visibility(true);assert.equal(env.ticks.size,0);const elapsed=closing.diagnostics().model.elapsed;env.advance(1000);assert.equal(closing.diagnostics().model.elapsed,elapsed);visibility(false);assert.equal(env.ticks.size,1);
 closing.sync({...sc,motion:false});assert.equal(closing.diagnostics().model.settled,true);assert.equal(env.ticks.size,0);closing.sync(sc);
 const canvas=$('.closing-webgl canvas'),event=new w.Event('webglcontextlost',{cancelable:true});canvas.dispatchEvent(event);assert.equal(event.defaultPrevented,true);assert.equal(closing.diagnostics().failed,true);assert.equal($('.closing-fallback').hidden,false);assert.equal(env.ticks.size,0);
 $('.closing-overview').click();assert.equal(navigations.at(-1),'use-cases');canvas.dispatchEvent(new w.Event('webglcontextrestored'));assert.equal(closing.diagnostics().failed,false);assert.equal(env.ticks.size,1);canvas.dispatchEvent(new w.Event('webglcontextlost'));assert.equal(closing.diagnostics().failed,false);
 closing.sync({...sc,index:0});canvas.dispatchEvent(new w.Event('webglcontextrestored'));assert.equal($('#closingSlide').children.length,0);assert.equal(env.ticks.size,0);
});
// A retained theme transition must not render in the background or survive motion pause.
// Defer only GSAP's clock; model updates, lighting and renderer dispatch remain real.
if(process.env.VERIFY_HIDDEN_TWEEN)for(const [name,api,index] of [['implementation',impl,13],['closing',closing,14]])for(const stop of ['hidden','motion']){
 check(`${name}: in-flight theme lighting stops on ${stop}`,()=>{
  const originalTo=w.gsap.to;let pending;
  w.gsap.to=(target,options)=>{let killed=false;pending={get killed(){return killed},flush(){if(!killed){target.n=options.n;options.onUpdate?.();options.onComplete?.()}}};return{kill(){killed=true}}};
  const s={index,lang:'en',theme:'light',motion:true};
  try{
   api.sync(s);env.advance(400);api.sync({...s,theme:'dark'});assert(pending);
   if(stop==='hidden')visibility(true);else api.sync({...s,theme:'dark',motion:false});
   const frames=api.diagnostics().frames;pending.flush();assert.equal(api.diagnostics().frames,frames,'Theme tween must not render after the lifecycle stop');assert.equal(pending.killed,true,'Stopped lighting transition must be cancelled');assert.equal(api.diagnostics().running,false);
  }finally{visibility(false);api.sync({...s,index:0});w.gsap.to=originalTo}
 });
}
env.close();const failures=checks.filter(x=>!x.pass);console.log(JSON.stringify({checks:checks.length,passed:checks.length-failures.length,failed:failures.map(x=>x.name),limitations:['WebGL rendering, CSS layout and pointer hit areas need an authorized browser or device run.']}));if(failures.length)process.exitCode=1;
