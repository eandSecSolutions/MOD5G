/* Full PIP contract: real controllers, shell, GSAP and Three geometry.
   jsdom substitutes native modal, dimensions and GPU; no browser is used. */
const assert=require('node:assert/strict'),path=require('node:path');
const {runtime}=require('./shell-runtime.cjs');
const env=runtime({build:process.env.BUILD||path.resolve(__dirname,'..'),boot:false,motion:true}),{w,d}=env;
const $=s=>d.querySelector(s),all=s=>[...d.querySelectorAll(s)];
env.load('vendor/gsap.min.js');
const gsap=w.gsap,add=gsap.ticker.add,remove=gsap.ticker.remove;
gsap.ticker.add=(fn,...args)=>{const result=add(fn,...args);env.ticks.add(fn);return result};
gsap.ticker.remove=fn=>{env.ticks.delete(fn);return remove(fn)};
for(const file of ['vendor/three.min.js','vendor/three-helpers.js','scripts/premium-kit.js'])env.load(file);
w.THREE.WebGLRenderer=class{constructor(){this.domElement=d.createElement('canvas');this.shadowMap={}}setPixelRatio(){}setClearColor(){}setSize(){}render(scene,camera){scene.updateMatrixWorld();camera.updateMatrixWorld()}dispose(){}forceContextLoss(){}};
w.MOD_NIGHT_MAP={};w.MOD_CINEMA_ASSETS={};
for(const file of ['scripts/night-theme.js','content/implementation.js','scripts/implementation-model.js','scripts/implementation.js'])env.load(file);
env.boot();
const impl=w.MOD_IMPLEMENTATION,checks=[];
// English labels and geometry use a direct PDF transcription, not production data.
// Arabic has a separate reviewed translation regression fixture.
const source=require('./pip-source-reference.json'),arabic=require('./pip-arabic-reference.json');
let maximumEdgeErrorPx=0;
function sourceBars(row,task){
 const bars=[...row.querySelectorAll('.impl-pip-bars i')],{leftPx,rightPx,edgeTolerancePx}=source.timeline,width=rightPx-leftPx;
 assert.equal(bars.length,task.barsPx.length,task.id+' source bar count');
 bars.forEach((bar,i)=>{
  const start=bar.style.getPropertyValue('--bar-start'),length=bar.style.getPropertyValue('--bar-length');
  assert.match(start,/^[0-9]+(?:[.][0-9]+)?%$/);assert.match(length,/^[0-9]+(?:[.][0-9]+)?%$/);
  const edges=[leftPx+parseFloat(start)/100*width,leftPx+(parseFloat(start)+parseFloat(length))/100*width];
  edges.forEach((edge,j)=>{const error=Math.abs(edge-task.barsPx[i][j]);maximumEdgeErrorPx=Math.max(maximumEdgeErrorPx,error);assert.ok(error<=edgeTolerancePx,`${task.id} bar ${i+1} ${j?'end':'start'} differs ${error.toFixed(3)} px from PDF source`)});
 });
}
function check(name,fn){try{fn();checks.push({name,pass:true});console.log('PASS:',name)}catch(e){checks.push({name,pass:false});console.error('FAIL:',name,'—',e.stack)}}
function sync(s){d.documentElement.lang=s.lang;d.documentElement.dir=s.lang==='ar'?'rtl':'ltr';d.documentElement.dataset.theme=s.theme;impl.sync(s);env.flushRAF();gsap.ticker.sleep()}
function opener(){return $(impl.diagnostics().immersive?'.impl-expand-pip-immersive':'.impl-panel-heading .impl-expand-pip')}
function open(){const button=opener();assert(button,'Full PIP expand button must be available');button.focus();button.click();const dialog=$('.impl-pip-dialog');assert(dialog?.open,'Full PIP dialog must open');return{dialog,button}}
function modelState(){const x=impl.diagnostics();return{selected:x.selected,taskIndex:x.taskIndex,exploded:x.exploded,immersive:x.immersive}}
(async()=>{await env.ready();try{
 for(const lang of ['en','ar'])for(const theme of ['light','dark'])for(const motion of [false,true]){
  check(`${lang}/${theme}/motion=${motion}: all stages retain full historical schedule and close state`,()=>{
   sync({index:13,lang,theme,motion});assert.equal(impl.diagnostics().failed,false,'Three geometry must initialize for lifecycle checks');
   for(let stage=0;stage<4;stage++){
    impl.select(stage);$('[data-impl-task="0"]').click();impl.setImmersive(stage%2===1);
    const before=modelState(),{dialog,button}=open();
    assert.equal(dialog.dir,lang==='ar'?'rtl':'ltr');assert.equal(dialog.getAttribute('aria-modal'),'true');
    assert.equal(d.getElementById(dialog.getAttribute('aria-labelledby')).textContent,lang==='ar'?'خطة تنفيذ المشروع كاملة':'Full project implementation plan');
    assert.equal(all('.impl-pip-table tbody').length,4);assert.equal(all('[data-pip-task]').length,20);assert.equal(all('.impl-pip-bars i').length,21);
    assert.deepEqual(all('[data-pip-task]').map(row=>row.dataset.pipTask),source.workstreams.flatMap(s=>s.tasks.map(t=>t.id)));
    for(const [i,group]of all('.impl-pip-table tbody').entries()){
     const expected=lang==='ar'?arabic.workstreams[i]:source.workstreams[i];
     assert.equal(group.querySelector('.impl-pip-group-name').textContent,expected.name);
     if(expected.subtitle!==null)assert.equal(group.querySelector('.impl-pip-group small').textContent,expected.subtitle);
     assert.deepEqual([...group.querySelectorAll('.impl-pip-task-name')].map(el=>el.textContent),expected.tasks.map(t=>t.label));
     for(const [j,row]of [...group.querySelectorAll('[data-pip-task]')].entries())sourceBars(row,source.workstreams[i].tasks[j]);
    }
    assert.deepEqual(all('.impl-pip-date-grid b').map(el=>el.textContent),source.ticks.map(t=>t[0]));
    assert.deepEqual(all('.impl-pip-date-grid small').map(el=>el.textContent),lang==='ar'?arabic.months:source.ticks.map(t=>t[1]));
    assert.equal($('.impl-pip-table').dir,'ltr');assert.equal($('.impl-pip-task-name').parentElement.dir,lang==='ar'?'rtl':'ltr');
    assert.equal(dialog.querySelectorAll('.kt-char,.kt-word').length,0,'Arabic remains joined text');
    assert.match($('.impl-pip-period').textContent,/2025/);assert.match($('.impl-pip-note').textContent,lang==='ar'?/غير مؤكدة/:/unconfirmed/);
    assert.match($('#implementationFullPipReference').textContent,lang==='ar'?/علامة المرجع: 30 سبتمبر 2025/:/Source marker: 30 Sep 2025/);
    assert.doesNotMatch(dialog.textContent,/TODAY|[(]Wed[)]/);
    assert.equal(d.activeElement,$('.impl-pip-close'));assert.equal(impl.diagnostics().running,false);assert.deepEqual(modelState(),before);
    $('.impl-pip-close').click();assert.equal(dialog.open,false);assert.equal(d.activeElement,button);assert.deepEqual(modelState(),before);assert.equal(impl.diagnostics().running,motion,JSON.stringify({stage,hidden:d.hidden,diagnostics:impl.diagnostics()}));
   }
   impl.setImmersive(false);sync({index:0,lang,theme,motion});assert.equal($('.impl-pip-dialog'),null);
  });
 }
 check('focus boundaries, Escape, native cancel and backdrop close without changing immersive state',()=>{
  sync({index:13,lang:'en',theme:'light',motion:true});impl.select(2);impl.setImmersive(true);
  let {dialog,button}=open();const close=$('.impl-pip-close'),scroll=$('.impl-pip-scroll');
  env.key('Tab',close,{shiftKey:true});assert.equal(d.activeElement,scroll);env.key('Tab',scroll);assert.equal(d.activeElement,close);
  env.key('Escape',close);assert.equal(dialog.open,false);assert.equal(d.activeElement,button);assert.equal(impl.diagnostics().immersive,true);
  ({dialog}=open());const cancel=new w.Event('cancel',{cancelable:true});dialog.dispatchEvent(cancel);assert.equal(dialog.open,false);assert.equal(cancel.defaultPrevented,true);
  ({dialog}=open());dialog._bounds={left:20,right:1300,top:20,bottom:740};dialog.dispatchEvent(new w.MouseEvent('click',{bubbles:true,clientX:30,clientY:30}));assert.equal(dialog.open,true,'Interior click must not close');dialog.dispatchEvent(new w.MouseEvent('click',{bubbles:true,clientX:5,clientY:5}));assert.equal(dialog.open,false);
 });
 check('delivery guide pauses on open; no stage changes or rendered frames while open',()=>{
  sync({index:13,lang:'en',theme:'light',motion:true});impl.setImmersive(false);impl.replay();env.advance(8600);gsap.ticker.sleep();assert.equal(impl.diagnostics().selected,1);
  const {dialog}=open(),before=modelState(),frames=impl.diagnostics().frames;assert.equal(impl.diagnostics().playing,false);
  impl.replay();env.advance(20000);gsap.ticker.sleep();assert.deepEqual(modelState(),before);assert.equal(impl.diagnostics().frames,frames);assert.equal(impl.diagnostics().playing,false);
  dialog.close();assert.deepEqual(modelState(),before);assert.equal(impl.diagnostics().playing,false);
 });
 check('shell navigation and shortcuts remain contained during full PIP',()=>{
  w.MOD_SHELL.goTo('implementation');env.advance(1800);gsap.ticker.sleep();assert.equal(w.MOD_SHELL.getState().index,13);open();const before=w.MOD_SHELL.getState();
  for(const key of ['ArrowLeft','ArrowRight','PageUp','PageDown','Home','End',' ','g','l','h','m','t','f'])env.key(key,$('.impl-pip-scroll'));
  assert.deepEqual(w.MOD_SHELL.getState(),before);assert.equal($('.impl-pip-dialog').open,true);
  const scroll=$('.impl-pip-scroll');for(const [type,x]of [['pointerdown',250],['pointerup',50]]){const e=new w.Event(type,{bubbles:true});Object.assign(e,{pointerType:'touch',clientX:x,clientY:100});scroll.dispatchEvent(e)}
  assert.deepEqual(w.MOD_SHELL.getState(),before);$('.impl-pip-close').click();
 });
 check('leave and language/context rebuild dispose dialog, do not steal focus or retain stale modal callbacks',()=>{
  sync({index:13,lang:'en',theme:'light',motion:false});let {dialog}=open();const next=$('#help');next.focus();sync({index:0,lang:'en',theme:'light',motion:false});assert.equal(dialog.open,false);assert.equal(dialog.isConnected,false);assert.equal(d.activeElement,next);
  sync({index:13,lang:'en',theme:'light',motion:false});({dialog}=open());sync({index:13,lang:'ar',theme:'dark',motion:false});assert.equal(dialog.isConnected,false);assert.equal(dialog.open,false);assert.equal(d.querySelector('dialog[open]'),null);open();assert.equal($('.impl-pip-dialog').dir,'rtl');$('.impl-pip-close').click();
  const canvas=$('.impl-webgl canvas');({dialog}=open());canvas.dispatchEvent(new w.Event('webglcontextlost',{cancelable:true}));canvas.dispatchEvent(new w.Event('webglcontextrestored'));assert.equal(dialog.isConnected,false);assert.equal(dialog.open,false);assert.equal(d.querySelector('dialog[open]'),null);
  sync({index:0,lang:'ar',theme:'dark',motion:false});dialog.dispatchEvent(new w.Event('close'));assert.equal(env.ticks.size,0);assert.equal($('.impl-pip-dialog'),null);
 });
 check('full schedule remains available after WebGL context loss',()=>{
  sync({index:13,lang:'en',theme:'light',motion:false});$('.impl-webgl canvas').dispatchEvent(new w.Event('webglcontextlost',{cancelable:true}));assert.equal(impl.diagnostics().failed,true);open();assert.equal(all('[data-pip-task]').length,20);$('.impl-pip-close').click();
 });
}finally{impl.sync({index:0,lang:'en',theme:'light',motion:false});gsap.globalTimeline.clear();gsap.ticker.sleep();env.close()}
const failed=checks.filter(c=>!c.pass);console.log(JSON.stringify({checks:checks.length,passed:checks.length-failed.length,failed:failed.map(c=>c.name),maximumEdgeErrorPx:Number(maximumEdgeErrorPx.toFixed(3)),limitations:['Native browser layout, modal top-layer/inert behavior, GPU rendering and pixel fidelity require an authorized browser/device run.']}));if(failed.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
