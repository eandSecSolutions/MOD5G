const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path');
const {createCanvas}=require('@napi-rs/canvas');
function runtime(rootName=process.env.BUILD||'MOD_Pulse_v0.36.0'){
 const root=(process.env.BUILD?path.resolve(process.env.BUILD):path.resolve(__dirname,'..')),dom=new JSDOM('<html><body><main id="app"><section id="sitesSlide"></section></main></body></html>',{runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;let clock=0,last=null;const ticks=new Set();
 w.performance.now=()=>clock;w.requestAnimationFrame=f=>{f();return 1};w.cancelAnimationFrame=()=>{};w.ResizeObserver=class{observe(){}disconnect(){}};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 Object.defineProperties(w.HTMLElement.prototype,{clientWidth:{get:()=>1000},clientHeight:{get:()=>600},offsetWidth:{get:()=>1000},offsetHeight:{get:()=>600}});
 w.HTMLElement.prototype.getBoundingClientRect=function(){return{x:0,y:0,left:0,top:0,width:1000,height:600,right:1000,bottom:600}};
 w.Element.prototype.animate=function(){return{cancel(){},finish(){this.onfinish?.()}}};w.HTMLElement.prototype.setPointerCapture=function(){};w.HTMLElement.prototype.releasePointerCapture=function(){};
 w.HTMLCanvasElement.prototype.getContext=function(type){if(type!=='2d')return {};if(!this._canvas)this._canvas=createCanvas(this.width||512,this.height||512);return this._canvas.getContext('2d')};
 w.gsap={to(o,v){for(const[k,n]of Object.entries(v))if(typeof n==='number'&&!['duration','delay'].includes(k))o[k]=n;v.onUpdate?.();return{kill(){}}},killTweensOf(){},ticker:{add:f=>ticks.add(f),remove:f=>ticks.delete(f)}};
 w.lucide={createIcons(){}};w.MOD_CINEMA_ASSETS={};w.MOD_NIGHT_MAP={};
 const load=p=>w.eval(fs.readFileSync(path.join(root,p),'utf8'));
 for(const p of ['vendor/three.min.js','vendor/three-helpers.js','scripts/premium-kit.js','scripts/night-theme.js'])load(p);
 w.THREE.WebGLRenderer=class{constructor(){this.domElement=w.document.createElement('canvas');this.shadowMap={}}setPixelRatio(){}setClearColor(){}setSize(){}render(scene,camera){last={scene,camera}}dispose(){}forceContextLoss(){}};
 load('vendor/leaflet/leaflet.js');
 const maps=[],tiles=[];const makeMap=w.L.map,makeTiles=w.L.tileLayer;
 w.L.map=(...args)=>{const m=makeMap(...args);maps.push(m);return m};
 w.L.tileLayer=(...args)=>{const l=makeTiles(...args);tiles.push(l);return l};
 for(const p of ['config/maps.js','scripts/deployment-geodata.js','scripts/deployment-assets.js','scripts/deployment-model.js','scripts/deployment.js'])load(p);
 return{w,load,ticks,maps,tiles,get last(){return last},advance(ms){for(let t=0;t<ms;t+=16){clock+=16;for(const f of ticks)f(clock/1000,16)}},close:()=>w.close()};
}
module.exports={runtime};
