'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runtime}=require('./shell-runtime.cjs');
const build=path.resolve(__dirname,'..');
let checks=0;
const eq=(got,want,message)=>{assert.equal(got,want,message);checks++};
// These literal fixtures catch an inserted panel being routed to the old sites
// position, a stale end boundary, or a wrong reference page in the chapter list.
const slides=[
 ['opening','copyZone',0,1],['approach','approachSlide',0,3],
 ['security','securitySlide',0,4],['use-cases','usecasesSlide',1,5],
 ['push-to-talk','pttSlide',1,6],['caller-verification','callerSlide',1,7],
 ['dispatch','dispatchSlide',1,8],['drones','droneSlide',1,9],
 ['ai-camera','aiSlide',1,10],['body-camera','bodySlide',1,11],
 ['land-border','missionsSlide',1,1],['coastal-border','coastalSlide',1,2],['sites','sitesSlide',2,13],
 ['implementation','implementationSlide',2,14],['closing','closingSlide',3,16]
];
function checkSlide(r,index,lang){
 const {w,d}=r;
 eq(w.MOD_SHELL.getState().index,index,'committed index');
 for(const[,panel]of slides)eq(d.getElementById(panel)?.hidden,panel!==slides[index][1],panel+' visibility');
 eq(d.getElementById('currentNumber').textContent,String(index+1).padStart(2,'0'),'counter current');
 eq(d.querySelector('#counter>span:last-of-type').textContent,'15','counter total');
 eq(d.getElementById('progress').getAttribute('aria-valuemax'),'15','progress maximum');
 eq(d.getElementById('progress').getAttribute('aria-valuetext'),`${index+1} / 15`,'progress spoken count');
 eq(d.getElementById('progressFill').style.width,((index+1)/15*100)+'%','progress fraction');
 eq(d.querySelector('#slideRail [aria-current="page"]').dataset.index,String(index),'active rail slide');
 eq(d.querySelector('#chapterList [aria-current="page"]').dataset.index,String(index),'active chapter');
 eq(d.querySelector('#sectionRail [aria-pressed="true"]').dataset.group,String(slides[index][2]),'active section');
 eq(d.querySelectorAll('#sectionRail button').length,4,'four existing sections');
 eq(d.querySelectorAll('#chapterList button').length,15,'fifteen chapter entries');
 eq(d.getElementById('left').disabled,lang==='ar'?index===14:index===0,'left boundary');
 eq(d.getElementById('right').disabled,lang==='ar'?index===0:index===14,'right boundary');
 const chapter=d.querySelector(`#chapterList [data-index="${index}"]`);
 eq(chapter.querySelector('small').textContent,w.MOD_COPY[lang].sourcePage+' '+slides[index][3],'reference page');
 if(index===10){
  eq(d.querySelector('#slideRail [aria-current="page"] span:last-child').textContent,lang==='ar'?'حماية الحدود البرية':'Land border','mission rail title');
  eq(chapter.querySelector('.chapter-text>span').textContent,lang==='ar'?'حماية الحدود البرية':'Land border','mission chapter title');
  eq(d.body.classList.contains('missions-view'),true,'mission view class');
  eq(d.querySelectorAll('#slideRail button').length,9,'use cases has nine slides');
 }
}
(async()=>{
 for(const lang of ['en','ar'])for(const motion of [false,true]){
  const r=runtime({build,url:'https://example.test/?lang='+lang,motion}),{w,d}=r;
  try{
   await r.ready();
   eq(d.querySelectorAll('#chapterList button').length,15,'new slide appears in chapters');
   for(let index=0;index<15;index++){
    w.MOD_SHELL.goTo(slides[index][0]);
    if(motion&&index>0){r.advance(250);eq([...r.animations].some(a=>a.element.id===slides[index][1]),true,'transition targets the active slide panel');r.advance(850)}else r.advance(1100);
    checkSlide(r,index,lang);
    eq(w.MOD_TRANSITIONS.diagnostics().phase,'idle','transition finishes');
    eq(r.animations.size,0,'finished transition retains no WAAPI effects');
   }
   r.key('End');r.advance(1100);checkSlide(r,14,lang);
   r.key('PageUp');r.advance(1100);checkSlide(r,13,lang);
   r.key('PageUp');r.advance(1100);checkSlide(r,12,lang);
   r.key('PageUp');r.advance(1100);checkSlide(r,11,lang);
   // Preserve section memory and keyboard isolation around the new last use case.
   d.querySelector('#sectionRail [data-group="2"]').click();r.advance(1100);checkSlide(r,12,lang);
   d.querySelector('#sectionRail [data-group="1"]').click();r.advance(1100);checkSlide(r,11,lang);
   r.key(lang==='en'?'ArrowRight':'ArrowLeft');r.advance(1100);checkSlide(r,12,lang);
   r.key(lang==='en'?'ArrowLeft':'ArrowRight');r.advance(1100);checkSlide(r,11,lang);
   r.click('chapters');r.key('End',d.activeElement);checkSlide(r,11,lang);
   d.querySelector('#chapterList [data-index="14"]').click();r.advance(1100);checkSlide(r,14,lang);
   r.key('Home');r.advance(1100);checkSlide(r,0,lang);
   eq(d.querySelector('#chapterDialog .dialog-description').textContent.includes(lang==='ar'?'الخمس عشرة':'fifteen'),true,'guide count updated');
   assert.deepEqual(r.errors,[]);checks++;
  }finally{await r.ready();r.close()}
 }
 for(const[hash,index]of [['#slide=land-border',10],['#slide=coastal-border',11],['#slide=sites',12],['#slide=implementation',13],['#slide=closing',14],['#slide=12',11],['#slide=15',14],['#slide=16',0]]){
  const r=runtime({build,url:'https://example.test/'+hash,motion:false});
  try{await r.ready();checkSlide(r,index,'en')}finally{await r.ready();r.close()}
 }
 console.log(`PASS navigation-shell: ${checks} assertions across all 15 positions, EN/AR, motion on/off, chapters, groups, boundaries and deep links.`);
})().catch(error=>{console.error(error);process.exitCode=1});
