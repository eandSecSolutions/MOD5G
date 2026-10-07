const assert=require('node:assert/strict');
const {runtime}=require('./usecases-runtime.cjs');
let checks=0;
const ok=(value,message)=>{assert(value,message);checks++};
function key(w,el,name,code=name){el.dispatchEvent(new w.KeyboardEvent('keydown',{key:name,code,bubbles:true,cancelable:true}));}
const validErrors=r=>r.errors.filter(x=>!x.includes('deprecated with r150'));
for(const lang of ['en','ar'])for(const theme of ['light','dark'])for(const motion of [true,false]){
 const r=runtime(),w=r.w,d=w.document,state={index:3,lang,theme,motion};
 try{
  w.MOD_USECASES.sync(state);ok(w.MOD_USECASES.diagnostics().model.stations===6,'six overview models');
  ok(d.querySelector('#usecasesSlide').dir===(lang==='ar'?'rtl':'ltr'),'overview language');
  for(let i=0;i<6;i++){d.querySelector(`[data-capability="${i}"]`).click();ok(w.MOD_USECASES.diagnostics().selected===i,'overview selection');d.querySelector('.ov25-open').click();ok(w.lastNavigation===['push-to-talk','caller-verification','dispatch','drones','ai-camera','body-camera'][i],'overview navigation')}
  key(w,d.querySelector('[data-capability="0"]'),'ArrowRight');ok(w.MOD_USECASES.diagnostics().selected===(lang==='ar'?5:1),'overview RTL arrow');
  d.querySelector('.ov25-home').click();ok(w.MOD_USECASES.diagnostics().selected===-1,'overview home');
  d.querySelector('.ov25-tour').click();r.advance(3200);ok(w.MOD_USECASES.diagnostics().guide===motion,'overview guided motion');
  if(motion){ok(w.MOD_USECASES.diagnostics().selected===0,'overview tour first station');d.querySelector('.ov25-tour').click();ok(!w.MOD_USECASES.diagnostics().guide,'overview stop tour')}
  r.visibility(true);ok(!w.MOD_USECASES.diagnostics().running,'overview hidden stop');r.visibility(false);
  w.MOD_USECASES.sync({...state,index:0});ok(!w.MOD_USECASES.diagnostics().running,'overview slide exit stop');
  w.MOD_PTT.sync({...state,index:4});ok(!w.MOD_PTT.diagnostics().failure,'PTT real model builds');
  d.querySelector('.ptt-reset').click();const talk=d.querySelector('.ptt-hold');
  key(w,talk,' ','Space');ok(w.MOD_PTT.diagnostics().held&&w.MOD_PTT.diagnostics().mode==='transmit','PTT hold');
  talk.dispatchEvent(new w.KeyboardEvent('keyup',{key:' ',code:'Space',bubbles:true,cancelable:true}));ok(w.MOD_PTT.diagnostics().mode==='reply','PTT release reply');
  r.advance(1900);ok(w.MOD_PTT.diagnostics().mode==='ready','PTT reply settles');
  key(w,talk,'Enter');w.dispatchEvent(new w.Event('blur'));ok(!w.MOD_PTT.diagnostics().held,'PTT blur releases');
  d.querySelector('.ptt-video').click();ok(w.MOD_PTT.diagnostics().mode===(motion?'connecting':'video'),'PTT video invitation');r.advance(1600);ok(w.MOD_PTT.diagnostics().mode==='video','PTT video connects');ok(d.querySelector('.ptt-hold').disabled,'PTT prevents talk during video');
  d.querySelector('.ptt-video').click();ok(w.MOD_PTT.diagnostics().mode==='ready','PTT end video');
  for(const view of ['radio','field','command','mission']){d.querySelector(`[data-ptt-view="${view}"]`).click();ok(w.MOD_PTT.diagnostics().view===view,'PTT view '+view)}
  key(w,d.querySelector('[data-ptt-view="mission"]'),'ArrowRight');ok(w.MOD_PTT.diagnostics().view===(lang==='ar'?'command':'radio'),'PTT RTL arrow');
  for(const i of [0,1]){const image=d.querySelector(`[data-ptt-photo="${i}"]`);image.click();ok(!d.querySelector('.ptt-gallery').hidden,'PTT gallery opens');key(w,d.querySelector('.ptt-gallery-close'),'Escape');ok(d.querySelector('.ptt-gallery').hidden&&d.activeElement===image,'PTT gallery closes and restores focus')}
  if(motion){d.querySelector('.ptt-pause').click();r.advance(2000);ok(!w.MOD_PTT.diagnostics().running,'PTT local pause stops after camera settles');d.querySelector('.ptt-pause').click();ok(w.MOD_PTT.diagnostics().running,'PTT resume')}
  key(w,talk,'Enter');r.visibility(true);ok(w.MOD_PTT.diagnostics().mode==='ready'&&!w.MOD_PTT.diagnostics().running,'PTT hidden stops transmission');r.visibility(false);
  w.MOD_PTT.sync({...state,index:0});ok(!w.MOD_PTT.diagnostics().running&&!w.MOD_PTT.diagnostics().model&&r.timers.size===0,'PTT exit disposes and cancels timers');
  for(const index of [5,6]){
   w.MOD_CAPABILITY.sync({...state,index});let host=d.querySelector('#'+(index===5?'caller':'dispatch')+'Slide');
   ok(!w.MOD_CAPABILITY.diagnostics().contextLost,'capability real model builds');
   for(let i=0;i<6;i++){host.querySelector(`[data-cap-step="${i}"]`).click();ok(+host.dataset.storyStep===i,'capability seek '+i)}
   key(w,host.querySelector('[data-cap-step="0"]'),'ArrowRight');ok(+host.dataset.storyStep===(lang==='ar'?5:1),'capability RTL arrow');
   host.querySelector('.cap-next').click();ok(+host.dataset.storyStep===(lang==='ar'?5:2),'capability next');host.querySelector('.cap-prev').click();ok(+host.dataset.storyStep===(lang==='ar'?4:1),'capability previous');
   const scrub=host.querySelector('.cap-scrub');scrub.value=22.5;scrub.dispatchEvent(new w.Event('input'));ok(w.MOD_CAPABILITY.diagnostics().elapsed===22.5,'capability scrub');
   host.querySelector('.cap-replay').click();r.advance(300);ok(motion?w.MOD_CAPABILITY.diagnostics().elapsed>0:w.MOD_CAPABILITY.diagnostics().elapsed===0,'capability replay honors motion');
   r.visibility(true);ok(!w.MOD_CAPABILITY.diagnostics().running,'capability hidden stops');r.visibility(false);
   w.MOD_CAPABILITY.sync({...state,index:0});ok(!w.MOD_CAPABILITY.diagnostics().model&&!w.MOD_CAPABILITY.diagnostics().running,'capability exit disposal');
  }
  ok(validErrors(r).length===0,'no unexpected runtime errors: '+validErrors(r).join('\n'));
  console.log(`PASS overview/PTT/caller/dispatch ${lang}/${theme}/motion=${motion}`);
 }finally{r.close()}
}
for(const [api,index,id]of [['MOD_USECASES',3,'usecases'],['MOD_PTT',4,'ptt'],['MOD_CAPABILITY',5,'caller']]){
 const r=runtime(),w=r.w,state={index,lang:'en',theme:'light',motion:true};try{w[api].sync(state);let canvas=w.document.querySelector('#'+id+'Slide canvas');canvas.dispatchEvent(new w.Event('webglcontextlost',{cancelable:true}));ok(!w[api].diagnostics().running,'context loss stops '+api);canvas.dispatchEvent(new w.Event('webglcontextrestored'));ok(w[api].diagnostics().model,'context restoration model '+api);ok(!w[api].diagnostics().contextLost&&!w[api].diagnostics().failure,'context restored '+api);w[api].sync({...state,index:0});ok(r.ticks.size===0,'no ticker after exit '+api)}finally{r.close()}
}
for(const [api,index,id]of [['MOD_USECASES',3,'usecases'],['MOD_PTT',4,'ptt'],['MOD_CAPABILITY',5,'caller']]){
 const r=runtime({failRenderer:true}),w=r.w;try{w[api].sync({index,lang:'ar',theme:'dark',motion:true});ok(!w[api].diagnostics().running,'WebGL fallback stops '+api);ok(w.document.querySelector('#'+id+'Slide').textContent.length>100,'WebGL fallback content '+api)}finally{r.close()}
}
console.log(`PASS ${checks} source-controller assertions; WebGL rendering itself is substituted.`);
