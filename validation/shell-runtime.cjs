const {JSDOM, VirtualConsole}=require('jsdom');
const fs=require('fs'),path=require('path');
const {createCanvas}=require('@napi-rs/canvas');

// DOM/state harness only. No browser, server, layout engine, GPU or image network.
function runtime(options={}){
 const root=(options.build?path.resolve(options.build):path.resolve(__dirname,'..'));
 const errors=[],virtualConsole=new VirtualConsole();
 virtualConsole.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:options.url||'https://example.test/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
 const w=dom.window,d=w.document,animations=new Set(),rafs=new Map(),observers=new Set(),ticks=new Set(),syncs={};
 let clock=0,serial=0,width=options.width||1366,height=options.height||768,hidden=false,fullscreen=null;
 Object.defineProperties(w,{innerWidth:{get:()=>width},innerHeight:{get:()=>height}});
 Object.defineProperties(d,{hidden:{get:()=>hidden},visibilityState:{get:()=>hidden?'hidden':'visible'},fullscreenElement:{get:()=>fullscreen}});
 w.performance.now=()=>clock;
 w.requestAnimationFrame=f=>{const id=++serial;rafs.set(id,f);return id};w.cancelAnimationFrame=id=>rafs.delete(id);
 w.ResizeObserver=class{constructor(fn){this.fn=fn;observers.add(this)}observe(){}unobserve(){}disconnect(){observers.delete(this)}};
 const media={matches:!!options.reduced,addEventListener(){},removeEventListener(){}};w.matchMedia=()=>media;
 Object.defineProperties(w.HTMLElement.prototype,{clientWidth:{get:()=>width},clientHeight:{get:()=>height},offsetWidth:{get:()=>width},offsetHeight:{get:()=>height},scrollWidth:{get:()=>width},scrollHeight:{get:()=>height}});
 w.HTMLElement.prototype.getBoundingClientRect=function(){return this._bounds||{x:0,y:0,left:0,top:0,width,height,right:width,bottom:height}};
 w.HTMLElement.prototype.scrollBy=function(o){this.scrollLeft+=(o.left||0);this.scrollTop+=(o.top||0)};
 w.HTMLElement.prototype.scrollTo=function(o){this.scrollLeft=o.left||0;this.scrollTop=o.top||0};
 w.HTMLElement.prototype.setPointerCapture=function(){};w.HTMLElement.prototype.releasePointerCapture=function(){};
 w.Element.prototype.animate=function(frames,opts){const a={element:this,frames,opts,start:clock,onfinish:null,oncancel:null,cancel(){animations.delete(this);this.oncancel?.()},finish(){animations.delete(this);this.onfinish?.()}};animations.add(a);return a};
 w.HTMLCanvasElement.prototype.getContext=function(type){if(type!=='2d')return {};if(!this._canvas)this._canvas=createCanvas(this.width||512,this.height||512);return this._canvas.getContext('2d')};
 // Native modal/fullscreen behavior is substituted; assertions cover shell calls/state.
 w.HTMLDialogElement.prototype.showModal=function(){this._returnFocus=d.activeElement;this.open=true};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this._returnFocus?.focus();this.dispatchEvent(new w.Event('close'))};
 d.documentElement.requestFullscreen=async()=>{fullscreen=d.documentElement;d.dispatchEvent(new w.Event('fullscreenchange'))};
 d.exitFullscreen=async()=>{fullscreen=null;d.dispatchEvent(new w.Event('fullscreenchange'))};
 Object.defineProperties(w.HTMLImageElement.prototype,{naturalWidth:{get:()=>1672},naturalHeight:{get:()=>941},complete:{get:()=>true}});
 w.lucide={createIcons(){}};
 w.gsap={to(o,v){for(const[k,n]of Object.entries(v))if(typeof n==='number'&&!['duration','delay'].includes(k))o[k]=n;v.onUpdate?.();return{kill(){}}},killTweensOf(){},ticker:{add:f=>ticks.add(f),remove:f=>ticks.delete(f)}};
 for(const name of ['CINEMATIC','APPROACH','SECURITY','USECASES','PTT','CAPABILITY','CINEMA','DEPLOYMENT','IMPLEMENTATION','CLOSING','TYPE']){
  syncs[name]=[];w['MOD_'+name]={sync:s=>syncs[name].push({...s}),enter(){},settle(){},replay(){}};
 }
 w.MOD_NIGHT={ready:Promise.resolve()};
 const load=p=>w.eval(fs.readFileSync(path.join(root,p),'utf8')+'\n//# sourceURL='+p);
 function flushRAF(){const list=[...rafs];rafs.clear();for(const[,f]of list)f(clock)}
 function advance(ms=0){const end=clock+ms;do{clock=Math.min(end,clock+16);for(const f of [...ticks])f(clock/1000,16);flushRAF();for(const a of [...animations])if(clock-a.start>=(Number(a.opts.duration)||0))a.finish()}while(clock<end)}
 function boot(){for(const p of ['scripts/slide-transitions.js','scripts/navigation-accessibility.js','scripts/shell.js'])load(p);flushRAF()}
 for(const p of ['content/en.js','content/ar.js','config/presentation.js'])load(p);
 if(options.motion!==undefined)w.MOD_CONFIG.motionByDefault=options.motion;
 for(const[k,v]of Object.entries(options.storage||{}))w.localStorage.setItem('mod-shell-'+k,String(v));
 const api={w,d,root,errors,animations,rafs,ticks,syncs,load,boot,flushRAF,advance,
  click:id=>d.getElementById(id).click(),
  key:(key,target=d.body,props={})=>{const e=new w.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...props});target.dispatchEvent(e);return e},
  resize(x,y){width=x;height=y;w.dispatchEvent(new w.Event('resize'));for(const o of observers)o.fn([]);flushRAF()},
  visibility(value){hidden=value;d.dispatchEvent(new w.Event('visibilitychange'))},
  async ready(){await new Promise(resolve=>setImmediate(resolve));flushRAF()},
  close(){dom.window.close()}
 };
 if(options.boot!==false)boot();
 return api;
}
module.exports={runtime};
