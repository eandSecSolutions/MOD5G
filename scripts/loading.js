/* Opening asset gate. Uses Image rather than fetch so extracted offline files work. */
(()=>{'use strict';
 const screen=document.getElementById('presentationLoader'),bar=document.getElementById('loadingProgress');
 if(!screen)return;
 const started=Date.now(),seen=new Set(),failures=[];
 let done=0,total=0,shown=0,assetsDone=false,revealed=false,resolveReady;
 const ready=new Promise(resolve=>{resolveReady=resolve});
 function progress(){shown=Math.max(shown,Math.min(.98,total?done/total*.98:0));bar.style.transform='scaleX('+shown+')'}
 function imageReady(src){return new Promise(resolve=>{
  // Let the browser reclaim decoded surfaces after warming its image cache.
  const img=new Image();let settled=false;
  const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);img.onload=img.onerror=null;if(!ok)failures.push(src.startsWith('data:')?'embedded image':src);done++;progress();resolve()};
  const timer=setTimeout(()=>finish(false),20000);
  img.onload=()=>{if(img.decode)img.decode().then(()=>finish(true),()=>finish(img.naturalWidth>0));else finish(true)};
  img.onerror=()=>finish(false);img.decoding='async';img.src=src;
  if(img.complete&&img.naturalWidth)img.onload();
 })}
 function collect(value,output,visited=new Set()){
  if(typeof value==='string'){if(/^(?:data:image\/|assets\/.*\.(?:png|jpe?g|webp|svg)(?:[?#].*)?$)/i.test(value)&&!seen.has(value)){seen.add(value);output.push(value)}return}
  if(!value||typeof value!=='object'||visited.has(value))return;visited.add(value);
  if(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype)Object.values(value).forEach(v=>collect(v,output,visited));
 }
 async function pool(items){let cursor=0;total+=items.length;progress();await Promise.all(Array.from({length:Math.min(4,items.length)},async()=>{while(cursor<items.length)await imageReady(items[cursor++])}))}
 const initial=[];collect(window.MOD_LOADING_ASSETS||[],initial);
 const first=pool(initial);
 try{if(localStorage.getItem('mod-shell-theme')==='dark'){screen.classList.add('is-dark');screen.querySelector('.loading-etisalat').src='assets/brand/etisalat-white.png'}}catch{}
 const blockKeys=e=>{if(!revealed){e.preventDefault();e.stopImmediatePropagation()}};
 document.addEventListener('keydown',blockKeys,true);
 const pauseInput=()=>{const app=document.getElementById('app');if(app)app.inert=true};
 async function prepare(){pauseInput();const embedded=[];
  Object.keys(window).filter(k=>/^MOD_.*ASSETS$/.test(k)&&k!=='MOD_LOADING_ASSETS').forEach(k=>collect(window[k],embedded));
  collect(window.MOD_CONFIG?.backgrounds,embedded);document.querySelectorAll('img[src]').forEach(img=>collect(img.getAttribute('src'),embedded));
  await first;await pool(embedded);
  if(document.fonts){await Promise.race([Promise.allSettled([document.fonts.load('16px Arabic'),document.fonts.ready]),new Promise(r=>setTimeout(r,5000))])}
  assetsDone=true;bar.style.transform='scaleX(1)';resolveReady();
 }
 function releaseInput(){revealed=true;clearTimeout(watchdog);document.removeEventListener('keydown',blockKeys,true);const app=document.getElementById('app');if(app)app.inert=false}
 async function reveal(){if(revealed)return;await ready;
  await Promise.allSettled([...document.querySelectorAll('#app img[src]')].filter(i=>i.complete&&i.naturalWidth&&i.decode).map(i=>i.decode()));
  const delay=Math.max(0,900-(Date.now()-started));if(delay)await new Promise(r=>setTimeout(r,delay));
  requestAnimationFrame(()=>requestAnimationFrame(()=>{releaseInput();screen.classList.add('is-ready');setTimeout(()=>screen.remove(),900)}));
 }
 window.MOD_BOOT={ready,reveal,diagnostics:()=>({completed:done,total,assetsDone,failures:[...failures]})};
 // A missing image must never leave the client trapped behind a loader.
 const watchdog=setTimeout(()=>{resolveReady();if(!window.MOD_SHELL){releaseInput();screen.remove()}else reveal()},90000);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>prepare().catch(()=>resolveReady()),{once:true});else prepare().catch(()=>resolveReady());
})();
