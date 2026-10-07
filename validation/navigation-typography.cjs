'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const roots=['copyZone','approachSlide','securitySlide','usecasesSlide','pttSlide','callerSlide','dispatchSlide','droneSlide','aiSlide','bodySlide','missionsSlide','coastalSlide','sitesSlide','implementationSlide','closingSlide'];
const classes=['','approach-heading','security-heading','ov25-heading','ptt-heading','cap-heading','cap-heading','cinema-heading','cinema-heading','cinema-heading','missions-heading','missions-heading','sites-heading','impl-heading',''];
const dom=new JSDOM('<html><body>'+roots.map((id,i)=>`<section id="${id}"><header class="${classes[i]}"><h1${i===0?' id="slideTitle"':i===14?' class="closing-title"':''}>Network mission</h1></header></section>`).join('')+'</body></html>',{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.ResizeObserver=class{observe(){}disconnect(){}};w.Element.prototype.animate=function(){return{cancel(){}}};
for(const file of ['vendor/gsap.min.js','vendor/SplitText.min.js','scripts/kinetic-type.js'])w.eval(fs.readFileSync(root+'/'+file,'utf8'));
let cases=0;
try{
 for(const lang of ['en','ar'])for(const theme of ['light','dark'])for(let index=0;index<15;index++){
  w.document.documentElement.lang=lang;w.document.documentElement.dir=lang==='ar'?'rtl':'ltr';w.document.documentElement.dataset.theme=theme;
  roots.forEach((id,i)=>w.document.getElementById(id).hidden=i!==index);
  const heading=w.document.getElementById(roots[index]).querySelector('h1'),copy=lang==='ar'?'شبكة الجيل الخامس للمهمة':'Mission over the Pulse network';heading.textContent=copy;
  const state={index,lang,theme,motion:true};w.MOD_TYPE.enter(state);
  assert.equal(heading.textContent,copy,'heading text survives entrance');
  assert.ok(heading.querySelector('.kt-word'),'active panel title receives restored typography');
  if(lang==='ar')assert.equal(heading.querySelectorAll('.kt-char').length,0,'Arabic remains whole words');
  const reveal=w.gsap.globalTimeline.getChildren(true,true,false).find(t=>t.vars.yPercent===0&&t.targets().some(el=>heading.contains(el)));
  assert.ok(reveal,'headline reveal exists');
  assert.equal(reveal.vars.duration,index===0||index===14?1.65:1.2,'hero timing belongs only to opening and closing');
  w.MOD_TYPE.sync({...state,motion:false});
  assert.equal(heading.textContent,copy);assert.equal(heading.querySelectorAll('.kt-word,.kt-char').length,0);
  assert.equal(w.MOD_TYPE.diagnostics().activeAnimations,0);assert.equal(w.MOD_TYPE.diagnostics().pendingTimers,0);
  w.MOD_TYPE.enter(state,{replay:true});w.MOD_TYPE.settle();assert.equal(heading.textContent,copy);assert.equal(w.MOD_TYPE.diagnostics().splitLines,0);cases++;
 }
 // Normalize only the approved integration edits, then compare with the restored
 // v32 baseline carried in v35. This guards all animation algorithms/timings.
 const current=fs.readFileSync(root+'/scripts/kinetic-type.js','utf8');
 const normalized=current.replace("'bodySlide','missionsSlide','coastalSlide','sitesSlide'","'bodySlide','sitesSlide'")
  .replace('.missions-heading .eyebrow,','').replace('.missions-heading h1,','').replace('.missions-subtitle,','')
  .replace('.missions-detail-title,','').replace('.missions-detail-description,','')
  .replace('if(state.index===13&&item.el.matches','if(state.index===11&&item.el.matches')
  .replace('premiumLine(item.el,80,state.index===14)','premiumLine(item.el,80,state.index===12)');
 assert.equal(normalized,fs.readFileSync(path.resolve(__dirname,'baseline-v35/scripts/kinetic-type.js'),'utf8'),'typography changes are limited to routing and new selectors');
 assert.equal(fs.readFileSync(root+'/styles/kinetic-type.css','utf8'),fs.readFileSync(path.resolve(__dirname,'baseline-v35/styles/kinetic-type.css'),'utf8'),'typography CSS stays byte-identical');
 console.log(`PASS navigation-typography: ${cases} roots/language/theme cases, actual GSAP/SplitText, preserved opening/closing hero timing and normalized v32 baseline.`);
}finally{w.MOD_TYPE.dispose();w.gsap.globalTimeline.clear();w.gsap.ticker.sleep();w.close()}
