/* Runtime contract: registered environment details, theme gating, motion and cleanup. */
const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const dom=new JSDOM('<!doctype html><html><head></head><body><div id="app"><div id="art"><img id="sceneEnDay" class="scene-layer"><img id="sceneEnNight" class="scene-layer"><img id="sceneArDay" class="scene-layer"><img id="sceneArNight" class="scene-layer"></div></div></body></html>',{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,$=s=>w.document.querySelector(s),all=s=>Array.from(w.document.querySelectorAll(s)),ticks=new Set();let width=1672,height=941,hidden=false,clock=0,disconnected=0;
w.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}}); // Explicit Motion must win over OS preference.
w.ResizeObserver=class{observe(){}disconnect(){disconnected++}};
Object.defineProperties(w.HTMLElement.prototype,{clientWidth:{get:()=>width},clientHeight:{get:()=>height}});
Object.defineProperty(w.document,'hidden',{get:()=>hidden});w.performance.now=()=>clock;
for(const img of all('.scene-layer'))Object.defineProperties(img,{naturalWidth:{value:1672},naturalHeight:{value:941}});
w.eval(fs.readFileSync(root+'/vendor/gsap.min.js','utf8'));const g=w.gsap,add=g.ticker.add,remove=g.ticker.remove;
g.ticker.add=(f,...a)=>{const result=add(f,...a);ticks.add(f);return result};g.ticker.remove=f=>{ticks.delete(f);return remove(f)};
w.eval(fs.readFileSync(root+'/scripts/intro.js','utf8'));
function sync(s){w.document.documentElement.lang=s.lang;w.document.documentElement.dataset.theme=s.theme;w.MOD_INTRO.sync(s);g.ticker.sleep()}
function advance(seconds){for(let t=0;t<seconds;t+=.04){clock+=40;for(const tick of [...ticks])tick(clock/1000,40);g.ticker.sleep()}}
function event(name,persisted){const e=new w.Event(name);Object.defineProperty(e,'persisted',{value:persisted});w.dispatchEvent(e)}
function near(actual,expected,label){assert(Math.abs(actual-expected)<.03,`${label}: ${actual} != ${expected}`)}
function styles(){return all('#introStage, #introStage *').map(el=>el.style.cssText).join('|')}
let checks=0,s={index:0,lang:'en',theme:'light',motion:true};
try{
 sync(s);
 assert.equal(all('.intro-glint').length,3,'day metal-edge glints are present');
 assert.equal(all('.intro-heat').length,2,'heat stays in two distant apron patches');
 assert.equal(all('.intro-status').length,2,'only two cabinet status details');
 assert.equal(all('.intro-acwl').length,1,'one mast obstruction light');
 assert.equal(ticks.size,1,'all ambience shares one ticker');checks++;
 const fixtures={
  en:{'.intro-glint':[[1381,554],[1494,556],[1137,607]],'.intro-status':[[1434,566],[1525,566]],'.intro-heat':[[234.08,649.29],[535.04,651.172]]},
  ar:{'.intro-glint':[[276,553],[159,556],[532,607]],'.intro-status':[[227,566],[141,566]],'.intro-heat':[[1437.92,650.231],[1220.56,651.172]]}
 };
 for(const lang of ['en','ar']){
  sync(s={...s,lang});
  for(const [selector,positions] of Object.entries(fixtures[lang]))all(selector).forEach((el,i)=>{near(parseFloat(el.style.left),positions[i][0],`${lang} ${selector} x`);near(parseFloat(el.style.top),positions[i][1],`${lang} ${selector} y`);assert.equal(el.parentElement.classList.contains(selector==='.intro-status'?'intro-night':'intro-day'),true,'detail has correct lighting group')});checks++;
  for(const size of [[1920,1080],[390,844],[844,390]]){
   [width,height]=size;w.MOD_INTRO.refresh();
   const d=w.MOD_INTRO.diagnostics(),scale=Math.max(width/1672,height/941),focus=width<=700?(lang==='ar'?.1:.9):.5;
   const natural=fixtures[lang]['.intro-status'][0],el=$('.intro-status');
   near(parseFloat(el.style.left),(width-1672*scale)*focus+natural[0]*scale,'status follows object-cover crop');
   near(parseFloat(el.style.top),(height-941*scale)*.5+natural[1]*scale,'status follows photo height');
   assert.equal($('#art').style.getPropertyValue('--intro-camera'),$('.intro-camera').style.getPropertyValue('--intro-camera'),'details and photograph share the camera');
   assert.equal(d.beaconCount,1);checks++;
  }
  width=1672;height=941;w.MOD_INTRO.refresh();
 }
 sync(s={...s,lang:'en',theme:'light'});
 assert.equal($('.intro-day').style.opacity,'1');assert.equal($('.intro-night').style.opacity,'0');
 const dayBefore=all('.intro-glint').map(el=>el.style.opacity);advance(2);assert.notDeepEqual(all('.intro-glint').map(el=>el.style.opacity),dayBefore,'sunlight gently changes on fixed edges');
 all('.intro-glint').forEach(el=>assert(+el.style.opacity<=.27,'glints remain restrained'));
 sync(s={...s,theme:'dark'});assert.equal($('.intro-day').style.opacity,'0');assert.equal($('.intro-night').style.opacity,'1');
 const statusBefore=all('.intro-status').map(el=>el.style.opacity);advance(3);assert.notDeepEqual(all('.intro-status').map(el=>el.style.opacity),statusBefore,'night cabinet activity changes slowly');
 all('.intro-status').forEach(el=>assert(+el.style.opacity>=.15&&+el.style.opacity<=.51,'status lamps never strobe or turn into beacons'));
 assert(w.MOD_INTRO.diagnostics().time>0,'OS reduced-motion does not override explicit Motion');checks++;
 sync(s={...s,motion:false});assert.equal(ticks.size,0);const frozen=styles(),stopped=w.MOD_INTRO.diagnostics().time;advance(2);assert.equal(styles(),frozen,'paused scene remains exactly static');assert.equal(w.MOD_INTRO.diagnostics().time,stopped);
 sync(s={...s,theme:'light'});assert.equal($('.intro-day').style.opacity,'1');assert.equal($('.intro-night').style.opacity,'0');assert.equal(ticks.size,0,'theme still works while paused');checks++;
 sync(s={...s,motion:true});hidden=true;w.document.dispatchEvent(new w.Event('visibilitychange'));const hiddenTime=w.MOD_INTRO.diagnostics().time;advance(1);assert.equal(ticks.size,0);assert.equal(w.MOD_INTRO.diagnostics().time,hiddenTime);
 hidden=false;w.document.dispatchEvent(new w.Event('visibilitychange'));assert.equal(ticks.size,1);
 sync({...s,index:1});advance(1);assert.equal(ticks.size,0);assert.equal($('#introStage').hidden,true);sync(s);checks++;
 event('pagehide',true);assert.equal(ticks.size,0);event('pageshow',true);assert.equal(ticks.size,1,'bfcache restore resumes one ticker');
 event('pagehide',false);assert.equal(ticks.size,0);assert.equal(disconnected,1);assert.equal($('#introStage').hidden,true,'terminal pagehide disposes the visible stage');
 const disposedStyles=styles();event('pageshow',true);w.document.dispatchEvent(new w.Event('visibilitychange'));$('.scene-layer').dispatchEvent(new w.Event('load'));w.MOD_INTRO.sync(s);advance(1);
 assert.equal(ticks.size,0);assert.equal(styles(),disposedStyles,'disposed intro cannot be resurrected by old callbacks');assert.equal($('#introStage').hidden,true);checks++;
 console.log(JSON.stringify({passed:true,checks,scope:'Real GSAP; jsdom photo registration, theme grouping, explicit Motion, hidden/slide pause, bfcache and terminal cleanup. No browser or compositor validation.'}));
}finally{g.globalTimeline.clear();g.ticker.sleep();w.close()}
