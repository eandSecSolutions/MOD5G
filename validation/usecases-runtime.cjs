const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path');
const {createCanvas}=require('@napi-rs/canvas');
function runtime({rootName='MOD_Pulse_v0.36.0',failRenderer=false,width=1000,height=600,reduced=false}={}){
 const root=(process.env.BUILD?path.resolve(process.env.BUILD):path.resolve(__dirname,'..')),dom=new JSDOM('<html><body><main id="app">'+['usecases','ptt','caller','dispatch','drone','ai','body'].map(id=>`<section id="${id}Slide"></section>`).join('')+'</main></body></html>',{runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;let clock=0,last=null,hidden=false,nextTimer=1;const ticks=new Set(),timers=new Map(),renders=[],renderers=[],errors=[];
 w.console.error=(...v)=>errors.push(v.map(String).join(' '));w.console.warn=(...v)=>errors.push(v.map(String).join(' '));
 w.performance.now=()=>clock;w.requestAnimationFrame=f=>{f();return 1};w.cancelAnimationFrame=()=>{};w.ResizeObserver=class{observe(){}disconnect(){}};w.matchMedia=q=>({matches:q.includes('reduced')?reduced:width<=700,addEventListener(){},removeEventListener(){}});
 w.setTimeout=(f,ms=0)=>{const id=nextTimer++;timers.set(id,{f,at:clock+ms});return id};w.clearTimeout=id=>timers.delete(id);
 Object.defineProperty(w.document,'hidden',{get:()=>hidden});
 Object.defineProperties(w.HTMLElement.prototype,{clientWidth:{get:()=>width},clientHeight:{get:()=>height},offsetWidth:{get:()=>width},offsetHeight:{get:()=>height}});
 w.HTMLElement.prototype.getBoundingClientRect=function(){return{x:0,y:0,left:0,top:0,width,height,right:width,bottom:height}};
 w.Element.prototype.animate=function(){return{cancel(){},finish(){this.onfinish?.()}}};w.HTMLElement.prototype.setPointerCapture=function(){};w.HTMLElement.prototype.releasePointerCapture=function(){};
 w.HTMLCanvasElement.prototype.getContext=function(type){if(type!=='2d')return {};if(!this._canvas)this._canvas=createCanvas(this.width||512,this.height||512);return this._canvas.getContext('2d')};
 w.gsap={to(o,v){for(const[k,n]of Object.entries(v))if(typeof n==='number'&&!['duration','delay'].includes(k))o[k]=n;v.onUpdate?.();v.onComplete?.();return{kill(){}}},killTweensOf(){},ticker:{add:f=>ticks.add(f),remove:f=>ticks.delete(f)}};
 w.lucide={createIcons(){}};w.MOD_CINEMA_ASSETS={};w.MOD_NIGHT_MAP={};w.MOD_SHELL={goTo(id){w.lastNavigation=id}};
 const load=p=>w.eval(fs.readFileSync(path.join(root,p),'utf8'));
 ['vendor/three.min.js','vendor/three-helpers.js','content/en.js','content/ar.js','content/drone.js','content/ai-camera.js','content/cinema.js','scripts/premium-kit.js','scripts/night-theme.js','scripts/pulse-link.js','scripts/scene-backdrops.js'].forEach(load);
 w.MOD_THREE_ADDONS.RoomEnvironment=null;
 w.THREE.WebGLRenderer=class{constructor(){if(failRenderer)throw new Error('QA forced unavailable WebGL');this.domElement=w.document.createElement('canvas');this.shadowMap={};this.target=null;renderers.push(this)}setPixelRatio(){}setClearColor(){}setSize(){}setScissorTest(){}setScissor(){}setViewport(){}clearDepth(){}clear(){}getRenderTarget(){return this.target}setRenderTarget(t){this.target=t}render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);last={scene,camera};renders.push({scene,camera,position:camera.position.toArray(),target:this.target});if(renders.length>50)renders.shift()}dispose(){this.disposed=true}forceContextLoss(){}};
 ['scripts/capability-models.js','scripts/overview-model.js','scripts/ptt-model.js','scripts/drone-model.js','scripts/ai-model.js','scripts/body-model.js','scripts/usecases.js','scripts/ptt.js','scripts/capability-film.js','scripts/cinema.js'].forEach(load);
 return{w,load,ticks,timers,renders,renderers,errors,get last(){return last},advance(ms){for(let t=0;t<ms;t+=16){clock+=16;for(const [id,timer]of [...timers])if(timer.at<=clock){timers.delete(id);timer.f()}for(const f of [...ticks])f(clock/1000,16)}},visibility(value){hidden=value;w.document.dispatchEvent(new w.Event('visibilitychange'))},resize(wi,he){width=wi;height=he;w.dispatchEvent(new w.Event('resize'))},close:()=>w.close()};
}
module.exports={runtime};
