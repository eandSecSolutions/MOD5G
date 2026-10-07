const assert=require('node:assert/strict');
const {runtime}=require('./shell-runtime.cjs');
let checks=0;
function eq(actual,expected,message){assert.equal(actual,expected,message);checks++}
const panelIds=['copyZone','approachSlide','securitySlide','usecasesSlide','pttSlide','callerSlide','dispatchSlide','droneSlide','aiSlide','bodySlide','missionsSlide','coastalSlide','sitesSlide','implementationSlide','closingSlide'];
function checkSlide(r,index){
 const {w,d}=r,state=w.MOD_SHELL.getState();eq(state.index,index,'committed index');
 panelIds.forEach((id,i)=>eq(d.getElementById(id).hidden,i!==index,id+' visibility'));
 eq(d.getElementById('progress').getAttribute('aria-valuenow'),String(index+1),'progress');
 eq(d.querySelector('#slideRail [aria-current="page"]').dataset.index,String(index),'active slide rail');
 eq(d.querySelector('#sectionRail [aria-pressed="true"]').dataset.group,String(w.MOD_CONFIG.slides[index].group),'active section');
 eq(d.querySelector('#chapterList [aria-current="page"]').dataset.index,String(index),'active chapter');
 eq(d.getElementById('left').disabled,state.lang==='ar'?index===14:index===0,'left boundary');
 eq(d.getElementById('right').disabled,state.lang==='ar'?index===0:index===14,'right boundary');
}
(async()=>{
 for(const lang of ['en','ar'])for(const motion of [false,true]){
  const r=runtime({url:'https://example.test/?lang='+lang,motion}),{w,d}=r;
  try{
   await r.ready();checkSlide(r,0);
   for(let index=0;index<15;index++){
    w.MOD_SHELL.goTo(w.MOD_CONFIG.slides[index].id);r.advance(1100);checkSlide(r,index);
    eq(w.MOD_TRANSITIONS.diagnostics().phase,'idle','transition finished');eq(r.animations.size,0,'no retained WAAPI effects');
    if(index)eq(w.location.hash,'#slide='+w.MOD_CONFIG.slides[index].id,'deep link');
   }
   r.key('Home');r.advance(1100);checkSlide(r,0);
   r.key(lang==='en'?'ArrowRight':'ArrowLeft');r.key(lang==='en'?'ArrowRight':'ArrowLeft');r.key(lang==='en'?'ArrowRight':'ArrowLeft');r.advance(1100);checkSlide(r,3);
   r.key('End');r.advance(1100);checkSlide(r,14);
   r.key('PageUp');r.advance(1100);checkSlide(r,13);
   r.key('PageDown');r.advance(1100);checkSlide(r,14);
   r.key('Home');r.advance(1100);
   const field=d.createElement('input');d.getElementById('stage').append(field);field.focus();
   for(const key of ['ArrowRight','End','l','m','t','h','g'])r.key(key,field);
   checkSlide(r,0);eq(w.MOD_SHELL.getState().lang,lang);eq(w.MOD_SHELL.getState().motion,motion);
   for(const props of [{ctrlKey:true},{altKey:true},{metaKey:true},{repeat:true}])r.key('End',d.body,props);
   checkSlide(r,0);
   r.click('chapters');eq(d.getElementById('chapterDialog').open,true,'chapter modal opens');
   eq(d.activeElement,d.querySelector('#chapterDialog .close'),'dialog close receives focus');
   r.key('End',d.activeElement);r.advance(1100);checkSlide(r,0);
   d.querySelector('#chapterList [data-index="12"]').click();r.advance(1100);eq(d.getElementById('chapterDialog').open,false);checkSlide(r,12);
   r.click('help');eq(d.getElementById('helpDialog').open,true);d.querySelector('#helpDialog .close').click();eq(d.getElementById('helpDialog').open,false);
   r.click('focus');eq(w.MOD_SHELL.getState().focus,true);eq(d.getElementById('toolbar').inert,true);eq(d.getElementById('footer').inert,true);eq(d.getElementById('railShell').inert,true);eq(d.activeElement.id,'restore');
   r.key('Escape',d.activeElement);eq(w.MOD_SHELL.getState().focus,false);eq(d.activeElement.id,'focus');eq(d.getElementById('toolbar').inert,false);
   r.click('fullscreen');await r.ready();eq(d.fullscreenElement,d.documentElement);eq(d.getElementById('fullscreen').getAttribute('aria-label'),w.MOD_COPY[lang].exitFullscreen);
   r.click('fullscreen');await r.ready();eq(d.fullscreenElement,null);eq(d.getElementById('fullscreen').getAttribute('aria-label'),w.MOD_COPY[lang].fullscreen);
   r.click('language');r.click('theme');r.click('language');r.click('theme');r.click('theme');await r.ready();
   eq(w.MOD_SHELL.getState().lang,lang);eq(d.documentElement.lang,lang);eq(d.documentElement.dir,lang==='ar'?'rtl':'ltr');eq(w.MOD_SHELL.getState().theme,'dark');eq(d.documentElement.dataset.theme,'dark');
   eq(d.querySelectorAll('.scene-layer.active').length,1);eq(d.querySelector('.scene-layer.active').id,lang==='ar'?'sceneArNight':'sceneEnNight');
   for(const size of [[320,568],[390,844],[768,1024],[1366,768],[1920,1080]]){r.resize(...size);checkSlide(r,12)}
   w.MOD_SHELL.goTo('closing');r.visibility(true);checkSlide(r,14);eq(w.MOD_TRANSITIONS.diagnostics().phase,'idle');eq(r.animations.size,0);r.visibility(false);
   assert.deepEqual(r.errors,[]);
  }finally{await r.ready();r.close()}
 }
 const r=runtime({motion:true});try{
  await r.ready();r.key('ArrowRight');r.click('motion');checkSlide(r,1);eq(r.w.MOD_SHELL.getState().motion,false);eq(r.animations.size,0);eq(r.w.MOD_TRANSITIONS.diagnostics().phase,'idle');
  r.click('motion');r.key('End');r.w.dispatchEvent(new r.w.Event('pagehide'));checkSlide(r,14);eq(r.animations.size,0);
 }finally{await r.ready();r.close()}
 for(const[hash,index]of [['#slide=sites',12],['#slide=15',14],['#slide=bogus',0],['#slide=999',0]]){
  const r=runtime({url:'https://example.test/'+hash});try{await r.ready();checkSlide(r,index)}finally{await r.ready();r.close()}
 }
 console.log(`PASS ${checks} shell assertions; real shell/navigation/transition code, DOM only`);
})().catch(e=>{console.error(e);process.exitCode=1});
