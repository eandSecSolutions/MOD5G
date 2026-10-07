// Regression: equipment click previously did nothing; focus hid all other scene selectors.
const assert=require('assert'),{runtime}=require('./deployment-runtime.cjs');const env=runtime(),{w}=env,api=w.MOD_DEPLOYMENT,$=s=>w.document.querySelector(s);
let s={index:12,lang:'en',theme:'light',motion:false};api.sync(s);
function point(i){const site=w.MOD_MAP_CONFIG.locations[api.diagnostics().area==='island'?0:1].sites[i],station=env.last.scene.getObjectByName(site.id);const p=new w.THREE.Vector3();station.getWorldPosition(p);p.y+=.2;p.project(env.last.camera);return{x:(p.x+1)*500,y:(1-p.y)*300}}
function clickAt(p){const el=$('.sites-webgl canvas');for(const type of ['pointerdown','pointerup']){const e=new w.MouseEvent(type,{bubbles:true,clientX:p.x,clientY:p.y,button:0});Object.defineProperty(e,'pointerId',{value:1});el.dispatchEvent(e)}}
clickAt(point(0));assert.equal(api.diagnostics().selected,0,'Clicking the visible site equipment must select site 1');
for(const lang of ['en','ar'])for(const theme of ['light','dark'])for(const area of [0,1]){
 s={...s,lang,theme};api.sync(s);api.setArea(area);api.fit();
 for(const i of [0,1,2]){api.fit();clickAt(point(i));assert.equal(api.diagnostics().selected,i);assert($('.sites-detail-title').textContent.includes(w.MOD_MAP_CONFIG.locations[area].sites[i].id));
 api.setInspect(true);const b=$(`[data-scene-site="${(i+1)%3}"]`);assert(b&&!b.closest('[hidden]'),'All three sites remain selectable inside the focused scene');b.click();assert.equal(api.diagnostics().selected,(i+1)%3);assert.equal(api.diagnostics().inspect,false,'Changing sites exits previous equipment inspection');}
 api.fit();clickAt({x:1,y:1});assert.equal(api.diagnostics().selected,-1,'Background clicks do not choose a site');
}
s={...s,motion:true};api.sync(s);api.fit();env.advance(1500);const p=point(1);clickAt(p);env.advance(1500);assert.equal(api.diagnostics().selected,1);
api.fit();env.advance(1500);const target=point(0),canvas=$('.sites-webgl canvas');function pointer(type,x,y,id=8){const e=new w.MouseEvent(type,{bubbles:true,clientX:x,clientY:y,button:0});Object.defineProperty(e,'pointerId',{value:id});canvas.dispatchEvent(e)}
pointer('pointerdown',target.x,target.y);env.advance(200);pointer('pointerup',target.x+30,target.y);assert.equal(api.diagnostics().selected,-1,'Dragging does not select');
pointer('pointerdown',target.x,target.y);pointer('pointercancel',target.x,target.y);pointer('pointerup',target.x,target.y);assert.equal(api.diagnostics().selected,-1,'Cancelled touch does not select');
const b=$('[data-scene-site="0"]');b.focus();b.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true}));assert.equal(api.diagnostics().selected,1,'Arabic picker advances with left arrow');assert.equal(w.document.activeElement.dataset.sceneSite,'1');
api.setView('satellite');assert.equal($('.sites-scene-picker').hidden,true);assert.equal(w.document.querySelectorAll('.sites-leaflet-pin').length,3);api.setView('3d');assert.equal($('.sites-scene-picker').hidden,false);
api.sync({...s,index:0});assert.equal(env.ticks.size,0);env.close();console.log('PASS: equipment selection, 24 site/language/theme cases, persistent picker, background miss, drag/cancel, RTL keyboard, satellite switching, motion and disposal');
