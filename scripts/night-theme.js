/* Aligned dual-image layers and interruptible lighting transitions. */
(()=>{'use strict';const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function picture(src,classes='',alt=''){const night=MOD_NIGHT_MAP[src]||src;return `<span class="theme-picture ${classes}"><img class="theme-day" src="${src}" alt="${esc(alt)}"><img class="theme-night" src="${night}" alt="" aria-hidden="true"></span>`}
function setPicture(el,src,alt=''){if(!el)return;el.querySelector('.theme-day').src=src;el.querySelector('.theme-day').alt=alt;el.querySelector('.theme-night').src=MOD_NIGHT_MAP[src]||src}
const ready=Promise.all(Object.values(MOD_NIGHT_MAP).map(src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(true);i.onerror=()=>resolve(false);i.src=src})));
function lighting(model,render){let value={n:0},tween=null,lights=[];model.scene.traverse(o=>{if(o.isLight)lights.push({o,intensity:o.intensity,color:o.color.clone()})});function apply(){if(model.setNight)model.setNight(value.n);else lights.forEach(({o,intensity,color})=>{o.intensity=intensity*(o.isHemisphereLight?1-value.n*.46:1-value.n*.69);o.color.copy(color).lerp(new THREE.Color(o.isHemisphereLight?0x9bbbd8:0x89a6d0),value.n*.65)});render?.()}
return {set(dark,animate=true){tween?.kill();if(!animate){value.n=dark?1:0;apply();return}tween=gsap.to(value,{n:dark?1:0,duration:1.1,ease:'power2.inOut',onUpdate:apply,onComplete:()=>tween=null})},dispose(){tween?.kill()},get value(){return value.n}}}
window.MOD_NIGHT={picture,setPicture,ready,lighting};})();
