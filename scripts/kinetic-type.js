/* Cinematic typography, independent of scene playback and slide navigation.
 * Headlines are temporarily split with GSAP SplitText. Arabic words remain
 * intact; all live captions and interactive controls retain their DOM.
 */
(()=>{'use strict';
if(window.gsap&&window.SplitText)gsap.registerPlugin(SplitText);
const ROOTS=['copyZone','approachSlide','securitySlide','usecasesSlide','pttSlide','callerSlide','dispatchSlide','droneSlide','aiSlide','bodySlide','missionsSlide','coastalSlide','sitesSlide','implementationSlide','closingSlide'];
const SELECTORS={
 eyebrow:'.closing-eyebrow,#eyebrow,.approach-heading .eyebrow,.security-heading .eyebrow,.ov25-eyebrow,.ptt-heading .eyebrow,.cap-heading .eyebrow,.cinema-heading>div>p,.missions-heading .eyebrow,.sites-heading .eyebrow,.impl-heading .eyebrow',
 title:'.closing-title,#slideTitle,.approach-heading h1,.security-heading h1,.ov25-heading h1,.ptt-heading h1,.cap-heading h1,.cinema-heading h1,.missions-heading h1,.sites-heading h1,.impl-heading h1',
 subtitle:'.closing-subtitle,#slideSubtitle,.approach-subtitle,.security-subtitle,.ov25-subtitle,.ptt-heading>p,.cap-heading>div>p:not(.eyebrow),.cinema-heading>span,.missions-subtitle,.sites-heading .sites-subtitle,.impl-subtitle',
 contextTitle:'.missions-detail-title,.impl-focus-title,.impl-panel-title,.sites-detail-title,.approach-focus h2,.security-detail h2,.ov25-detail-title,.ptt-session-copy h2,.cap-visual-caption h2,.cinema-opening h2,.cinema-callout h2',
 contextBody:'.missions-detail-description,.impl-focus-description,.sites-detail-text,.approach-focus p,.security-detail-top p,.ov25-detail-text,.ptt-session-copy p,.cap-visual-caption p,.cinema-opening p,.cinema-callout p',
 selectedCopy:'.ov25-card.active strong,.cap-story button.active strong,.cinema-chapters button.active strong',
 sceneCaption:'.cap-scene-heading strong,.cinema-shot strong'
};
const ALL_SELECTORS=Object.values(SELECTORS).join(','),DYNAMIC_KINDS=['title','subtitle','contextTitle','contextBody','selectedCopy','sceneCaption'];
const activeAnimations=new Set(),elementAnimations=new Map(),splitRecords=new Set(),timers=new Set();
let state={index:-1,lang:'en',theme:'light',motion:true},currentRoot=null,observer=null,observing=false,mutationTimer=null,snapshot=new Map(),generation=0,destroyed=false;
let entries=0,reveals=0,mutations=0,wordCount=0,peakAnimations=0,lastReason='idle';
const media=typeof window.matchMedia==='function'?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
const rootFor=s=>document.getElementById(ROOTS[s.index]||'copyZone');
const readableText=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const eligible=el=>!!el&&el.isConnected!==false&&!el.hidden&&!el.closest('[hidden]')&&readableText(el).length>0;
// The presentation's explicit Motion control is authoritative. Corporate
// Windows policies often report reduced motion even when this is requested.
const enabled=()=>!destroyed&&state.motion!==false&&!document.hidden;
const canAnimate=el=>enabled()&&eligible(el)&&typeof el.animate==='function';
function later(callback,ms){const ownGeneration=generation,id=setTimeout(()=>{timers.delete(id);if(ownGeneration===generation&&!destroyed)callback()},ms);timers.add(id);return id}
function clearLater(id){if(id!==null&&id!==undefined){clearTimeout(id);timers.delete(id)}}
function stopObserver(){observer?.disconnect();observer?.takeRecords?.();observing=false;clearLater(mutationTimer);mutationTimer=null}
function withoutObserver(callback){const reconnect=observing,root=currentRoot;observer?.disconnect();observing=false;try{return callback()}finally{observer?.takeRecords?.();if(reconnect&&root===currentRoot&&enabled())observe(root)}}
function release(animation){if(!activeAnimations.has(animation))return;activeAnimations.delete(animation);const el=animation.__modTypeElement;animation.onfinish=null;animation.oncancel=null;try{animation.cancel()}catch{}const group=elementAnimations.get(el);group?.delete(animation);if(!group?.size){elementAnimations.delete(el);el?.classList.remove('kt-active')}}
function cancelElement(el){const group=elementAnimations.get(el);if(group)[...group].forEach(release)}
function play(el,keyframes,options={}){if(!canAnimate(el))return null;cancelElement(el);while(activeAnimations.size>=32)release(activeAnimations.values().next().value);try{const animation=el.animate(keyframes,{duration:720,easing:'cubic-bezier(.16,1,.3,1)',fill:'both',...options});if(!animation)return null;animation.__modTypeElement=el;activeAnimations.add(animation);if(!elementAnimations.has(el))elementAnimations.set(el,new Set());elementAnimations.get(el).add(animation);el.classList.add('kt-active');animation.onfinish=()=>release(animation);animation.oncancel=()=>release(animation);peakAnimations=Math.max(peakAnimations,activeAnimations.size);reveals++;return animation}catch{return null}}
function whole(el,kind='body',delay=0,dynamic=false,direction=1){if(!canAnimate(el))return;const headline=kind==='title'||kind==='contextTitle',distance=dynamic?(headline?9:5):(headline?18:9),duration=dynamic?(headline?560:460):(headline?920:740);play(el,[{opacity:dynamic?.3:.02,translate:`${headline&&!dynamic?direction*3:0}px ${distance}px`,filter:headline&&!dynamic?'blur(1.4px)':'blur(0)'},{opacity:1,translate:'0px 0px',filter:'blur(0)'}],{duration,delay})}
function attrState(el,name){return {had:el.hasAttribute(name),value:el.getAttribute(name)}}
function restoreAttr(el,name,saved,ownedValue){if(el.getAttribute(name)!==ownedValue)return;if(saved.had)el.setAttribute(name,saved.value);else el.removeAttribute(name)}
function unwrap(record){if(!splitRecords.has(record))return;splitRecords.delete(record);const {el,masks,aria,heading,headingAria,headingLabel}=record;withoutObserver(()=>{if(record.native){const currentText=el.textContent;record.native.revert();if(currentText!==record.source)el.textContent=currentText;}else{const nodes=[...el.childNodes],ownOnly=nodes.every(node=>node.nodeType===3||masks.includes(node));if(ownOnly&&nodes.some(node=>masks.includes(node))){const currentText=el.textContent;el.replaceChildren(document.createTextNode(currentText))}}el.classList.remove('kt-line','kt-light-sweep');el.removeAttribute('data-kt-sweep');restoreAttr(el,'aria-hidden',aria,'true');if(heading&&![...splitRecords].some(r=>r.heading===heading))restoreAttr(heading,'aria-label',headingAria,headingLabel)});}
function wrapLine(el,budget,heading,headingLabel,headingAria){if(!canAnimate(el)||el.closest('button,a,input,textarea,select')||[...el.childNodes].some(n=>n.nodeType!==3))return null;const source=el.textContent,parts=source.split(/(\s+)/),count=parts.filter(t=>t&&!/^\s+$/.test(t)).length;if(!count||count>budget)return null;const fragment=document.createDocumentFragment(),words=[],masks=[],aria=attrState(el,'aria-hidden');for(const part of parts){if(!part)continue;if(/^\s+$/.test(part)){fragment.appendChild(document.createTextNode(part));continue}const mask=document.createElement('span'),word=document.createElement('span');mask.className='kt-word-mask';mask.setAttribute('data-kt-token','');word.className='kt-word';word.textContent=part;mask.appendChild(word);fragment.appendChild(mask);masks.push(mask);words.push(word)}withoutObserver(()=>{el.replaceChildren(fragment);el.classList.add('kt-line');el.setAttribute('aria-hidden','true');heading.setAttribute('aria-label',headingLabel)});const record={el,source,words,masks,aria,heading,headingAria,headingLabel};splitRecords.add(record);return record}
function premiumLine(el,delay=100,hero=false,heading=null,headingLabel='',headingAria=null,contextual=false){
 if(!canAnimate(el))return 0;
 if(!window.SplitText||!window.gsap){whole(el,'title',delay,false,1);return 1100+delay}
 const source=el.textContent,aria=attrState(el,'aria-hidden'),characters=hero&&state.lang!=='ar';
 let split;withoutObserver(()=>{split=SplitText.create(el,{type:characters?'words,chars':'words',tag:'span',wordsClass:'kt-word',charsClass:'kt-char',mask:'words',aria:'none',autoSplit:false});el.classList.add('kt-line');(split.masks||[]).forEach(mask=>mask.classList.add('kt-word-mask'));if(heading){el.setAttribute('aria-hidden','true');heading.setAttribute('aria-label',headingLabel)}});
 const record={el,source,native:split,masks:split.masks||[],aria,heading,headingLabel,headingAria};
 splitRecords.add(record);wordCount+=split.words.length;
 const tokens=characters?split.chars:split.words,stagger=characters?.062:contextual?.075:.10,duration=hero?1.65:contextual?.86:1.2;
 let context,timeline;const handle={__modTypeElement:el,cancel(){timeline?.kill();context?.revert()}};
 activeAnimations.add(handle);elementAnimations.set(el,new Set([handle]));el.classList.add('kt-active');peakAnimations=Math.max(peakAnimations,activeAnimations.size);reveals++;
 context=gsap.context(()=>{timeline=gsap.timeline({onComplete:()=>release(handle)});timeline.fromTo(tokens,{
  opacity:0,yPercent:hero?125:118,rotationX:hero?-82:-62,rotationZ:characters?(i)=>(i-tokens.length/2)*2.5:0,
  x:characters?(i)=>(i-tokens.length/2)*13:state.lang==='ar'?-24:24,scale:hero?.78:.94,filter:hero?'blur(7px)':'blur(3px)',
  transformOrigin:'50% 100%',transformPerspective:850
 },{opacity:1,yPercent:0,rotationX:0,rotationZ:0,x:0,scale:1,filter:'blur(0px)',duration,stagger,ease:'expo.out',force3D:true},delay/1000)});
 const end=delay+(duration+Math.max(0,tokens.length-1)*stagger)*1000;
 later(()=>unwrap(record),Math.max(end+70,el.classList.contains('network')?2800:0));return end;
}
function intro(root,direction){
 const heading=root.querySelector('#slideTitle');if(!heading)return;
 const lines=[...heading.querySelectorAll('.hero-line')].slice(0,2);
 if(!lines.length){premiumLine(heading,100,true);return}
 const headingAria=attrState(heading,'aria-label'),headingLabel=lines.map(line=>line.textContent.trim()).join(' ');
 premiumLine(lines[0],100,true,heading,headingLabel,headingAria);
 premiumLine(lines[1],660,false,heading,headingLabel,headingAria);
 if(enabled()&&lines[1].classList.contains('kt-line')){lines[1].setAttribute('data-kt-sweep',lines[1].textContent);lines[1].classList.add('kt-light-sweep')}
 whole(root.querySelector('#eyebrow'),'eyebrow',50);
 whole(root.querySelector('#slideSubtitle'),'body',1400);
 whole(root.querySelector('.stage-actions'),'actions',1640);
}
function collect(root=currentRoot){if(!root)return[];const items=[],seen=new Set();for(const [kind,selector]of Object.entries(SELECTORS)){let ordinal=0;for(const el of root.querySelectorAll(selector)){const key=kind+':'+ordinal++;if(seen.has(el)||!eligible(el))continue;seen.add(el);items.push({el,kind,key,text:readableText(el)})}}return items.slice(0,32)}
function seed(){snapshot=new Map(collect().map(item=>[item.key,item.text]))}
function scanChanges(){mutationTimer=null;if(!enabled()||!currentRoot||currentRoot!==rootFor(state)||currentRoot.hidden)return;const items=collect(),next=new Map();let count=0;for(const item of items){next.set(item.key,item.text);const changed=snapshot.has(item.key)?snapshot.get(item.key)!==item.text:!!item.text;if(changed&&DYNAMIC_KINDS.includes(item.kind)&&count<8){if(state.index===0&&item.kind==='title'){[...splitRecords].forEach(unwrap)}if(state.index===13&&item.el.matches('.impl-focus-title')){cancelElement(item.el);[...splitRecords].filter(record=>record.el===item.el).forEach(unwrap);premiumLine(item.el,count*38,false,null,'',null,true)}else whole(item.el,item.kind,count*38,true);count++}}snapshot=next;if(count)lastReason='context-change';}
function relevant(records){return records.some(record=>{const target=record.target?.nodeType===1?record.target:record.target?.parentElement;if(!target)return false;return !!(target.matches?.(ALL_SELECTORS)||target.closest?.(ALL_SELECTORS)||target.querySelector?.(ALL_SELECTORS))})}
function observe(root){if(!root||!enabled()||root.hidden)return;if(typeof MutationObserver!=='function')return;if(!observer)observer=new MutationObserver(records=>{if(!observing||!enabled()||!relevant(records))return;mutations++;clearLater(mutationTimer);mutationTimer=later(scanChanges,72)});currentRoot=root;observer.observe(root,{subtree:true,childList:true,characterData:true});observing=true}
function settle(){generation++;stopObserver();[...timers].forEach(clearLater);timers.clear();[...activeAnimations].forEach(release);[...splitRecords].forEach(unwrap);elementAnimations.clear();snapshot.clear();currentRoot=null;lastReason='settled';}
function enter(next,options={}){settle();state={...state,...next};entries++;wordCount=0;const root=rootFor(state);if(!enabled()||!root||root.hidden){lastReason=!enabled()?'motion-disabled':'unavailable';return diagnostics()}currentRoot=root;const direction=options.direction<0?-1:1,isIntro=options.intro??state.index===0;if(isIntro){intro(root,direction)}else{let contextCount=0;for(const item of collect(root)){if(item.kind==='eyebrow')whole(item.el,item.kind,40);else if(item.kind==='title')premiumLine(item.el,80,state.index===14);else if(item.kind==='subtitle')whole(item.el,item.kind,270);else if(item.kind==='contextTitle'&&contextCount<3){whole(item.el,item.kind,360+contextCount*60,false,direction);contextCount++}else if(item.kind==='contextBody')whole(item.el,item.kind,460);else if(item.kind==='selectedCopy')whole(item.el,item.kind,510)}}seed();observe(root);lastReason=options.replay?'replay':'enter';return diagnostics()}
function sync(next){const changed=next&&(next.index!==state.index||next.lang!==state.lang);if(changed)settle();state={...state,...next};if(!enabled()){settle();lastReason='motion-disabled';return}const root=rootFor(state);if(!root||root.hidden)return;if(currentRoot!==root||!observing){stopObserver();currentRoot=root;seed();observe(root)}}
function visibility(){if(document.hidden){settle();lastReason='hidden'}else sync(state)}
function preference(){sync(state)}
function diagnostics(){return {index:state.index,language:state.lang,motion:state.motion,reducedMotion:!!media?.matches,enabled:enabled(),observing,activeAnimations:activeAnimations.size,splitLines:splitRecords.size,words:wordCount,peakAnimations,entries,reveals,mutations,pendingTimers:timers.size,reason:lastReason}}
function dispose(){settle();destroyed=true;document.removeEventListener('visibilitychange',visibility);if(media?.removeEventListener)media.removeEventListener('change',preference);else media?.removeListener?.(preference);window.removeEventListener('pagehide',settle);observer=null;}
document.addEventListener('visibilitychange',visibility);if(media?.addEventListener)media.addEventListener('change',preference);else media?.addListener?.(preference);window.addEventListener('pagehide',settle);
window.MOD_TYPE={enter,settle,sync,dispose,diagnostics};
})();
