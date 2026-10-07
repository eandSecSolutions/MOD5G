const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),assert=require('assert');
const {createCanvas,Path2D}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(root+'/index.html','utf8');
const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,$=s=>w.document.querySelector(s),ticks=new Set();let width=1366,height=768,hidden=false,clock=0;
w.Path2D=Path2D;w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.ResizeObserver=class{observe(){}disconnect(){}};
Object.defineProperties(w.HTMLElement.prototype,{clientWidth:{get:()=>width},clientHeight:{get:()=>height},offsetWidth:{get:()=>width},offsetHeight:{get:()=>height}});Object.defineProperty(w.document,'hidden',{get:()=>hidden});w.performance.now=()=>clock;
w.HTMLCanvasElement.prototype.getContext=function(type){if(type!=='2d')return {};if(!this._native)this._native=createCanvas(this.width||512,this.height||512);return this._native.getContext('2d')};
const load=p=>w.eval(fs.readFileSync(path.join(root,p),'utf8'));
load('vendor/gsap.min.js');const g=w.gsap,add=g.ticker.add,remove=g.ticker.remove;g.ticker.add=(f,...a)=>{const result=add(f,...a);ticks.add(f);return result};g.ticker.remove=f=>{ticks.delete(f);return remove(f)};
load('vendor/three.min.js');load('vendor/three-helpers.js');w.THREE.WebGLRenderer=class{constructor(o={}){this.domElement=o.canvas||w.document.createElement('canvas');this.shadowMap={};this.info={render:{calls:0,triangles:0}}}setPixelRatio(){}setClearColor(){}setSize(){}render(scene,camera){scene.updateMatrixWorld();camera.updateMatrixWorld();this.info.render.calls++}dispose(){}};
w.THREE.PMREMGenerator=class{fromScene(){return{texture:new w.THREE.Texture()}}dispose(){}};w.lucide={createIcons(){}};
for(const file of ['content/en.js','content/ar.js','config/presentation.js','scripts/site-models.js','scripts/approach.js','scripts/world.js','scripts/security.js','scripts/intro.js'])load(file);
function advance(ms){g.globalTimeline.time(g.globalTimeline.time()+ms/1000,false);clock+=ms;for(const tick of ticks)tick(clock/1000,Math.min(ms,60));g.ticker.sleep()}
function sync(state){w.document.documentElement.lang=state.lang;w.document.documentElement.dir=state.lang==='ar'?'rtl':'ltr';for(const name of ['MOD_CINEMATIC','MOD_SECURITY','MOD_APPROACH'])w[name].sync(state);g.ticker.sleep()}
let cases=0;
try{
 for(const lang of ['en','ar'])for(const theme of ['light','dark']){
  let s={index:0,lang,theme,motion:true};sync(s);advance(200);assert.equal(w.MOD_INTRO.diagnostics().beaconCount,1);assert(w.MOD_INTRO.diagnostics().time>0);assert.equal(ticks.size,1);
  for(const size of [[1366,768],[1920,1080],[390,844]]){[width,height]=size;w.MOD_INTRO.refresh();const d=w.MOD_INTRO.diagnostics(),point=w.MOD_INTRO.projectPhotoPoint(d.beaconAnchor);assert(Number.isFinite(point.x+point.y));assert.equal(d.camera.zoom>1,true);assert.equal($('#art').style.getPropertyValue('--intro-camera'),$('.intro-camera').style.getPropertyValue('--intro-camera'));cases++}
  s={...s,index:1,motion:false};sync(s);for(const i of [0,1,2,3]){$(`[data-step="${i}"]`).click();advance(10);assert.equal(w.MOD_APPROACH.diagnostics().stage,i);assert.equal(w.MOD_CINEMATIC.diagnostics().stage,i);assert.equal($('[data-step="'+i+'"]').getAttribute('aria-pressed'),'true');assert($('.approach-focus h2').textContent.length>0);cases++}assert.equal(ticks.size,0);
  s={...s,index:2};sync(s);for(let i=0;i<5;i++){w.MOD_SECURITY.select(i);advance(10);const d=w.MOD_SECURITY.diagnostics();assert.equal(d.selected,i);assert.equal(d.models.filter(m=>m.visible).length,1);assert(d.models[i].visible);assert($('.security-detail').textContent.length>150);cases++}assert.equal(ticks.size,0);
  s={...s,motion:true};sync(s);advance(200);assert.equal(ticks.size,1);hidden=true;w.document.dispatchEvent(new w.Event('visibilitychange'));assert.equal(ticks.size,0);hidden=false;w.document.dispatchEvent(new w.Event('visibilitychange'));assert.equal(ticks.size,1);sync({...s,index:13});assert.equal(ticks.size,0);assert.equal($('#introStage').hidden,true);
 }
 const s={index:0,lang:'en',theme:'dark',motion:true};sync(s);const hide=new w.Event('pagehide');Object.defineProperty(hide,'persisted',{value:true});w.dispatchEvent(hide);assert.equal(ticks.size,0);const show=new w.Event('pageshow');Object.defineProperty(show,'persisted',{value:true});w.dispatchEvent(show);assert.equal(ticks.size,1);sync({...s,motion:false});assert.equal(ticks.size,0);
 console.log(JSON.stringify({passed:true,cases,scope:'Real GSAP and Three geometry; jsdom dimensions and GPU environment/render substitutes. Intro, approach and security controls, themes/languages, motion/visibility and bfcache.'}));
}finally{g.globalTimeline.clear();g.ticker.sleep();w.close()}
