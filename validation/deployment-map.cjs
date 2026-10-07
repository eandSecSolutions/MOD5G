const assert = require('assert');
const {runtime} = require('./deployment-runtime.cjs');
const env = runtime(), {w} = env, api = w.MOD_DEPLOYMENT;
const $ = s => w.document.querySelector(s);
let state = {index:12, lang:'en', theme:'light', motion:false};
const failures = [];
function check(name, test) { try { test(); console.log('PASS:', name); } catch (e) { failures.push(name+': '+e.message); console.error('FAIL:', name, e.message); } }
function geo(map) { let layer; map.eachLayer(l => {if(l instanceof w.L.GeoJSON) layer=l}); return layer; }
api.sync(state);
api.setView('map');
let map=env.maps.at(-1), geographic=geo(map), tile=env.tiles.at(-1);
const road=geographic.getLayers().find(l=>l.feature.properties.kind==='road');
check('geographic map theme updates existing vectors',()=>{
  const before=road.options.color;
  state={...state,theme:'dark'};api.sync(state);
  assert.notEqual(road.options.color,before,'Daytime road colors remain after selecting dark theme');
  assert.equal(road.options.color,/primary|secondary|tertiary|motorway/.test(road.feature.properties.road)?'#d7b77c':'#94aaad');
});
api.setView('satellite');
tile.fire('tileload');tile.fire('load');
check('loaded satellite imagery hides vector fallback',()=>assert.equal(map.hasLayer(geographic),false));
tile.fire('loading');tile.fire('tileerror');tile.fire('load');
check('failed satellite navigation restores geographic context',()=>{
 assert.equal(api.diagnostics().satellite.error,true);
 assert.equal(map.hasLayer(geographic),true,'Vectors stay hidden after all new satellite tiles fail');
 assert.equal($('.sites-satellite-loading').hidden,false);
});
tile.fire('loading');tile.fire('tileload');tile.fire('load');
check('satellite imagery recovery removes fallback',()=>{
 assert.equal(api.diagnostics().satellite.error,false);
 assert.equal(map.hasLayer(geographic),false);
});
check('map zoom limits and unbounded panning',()=>{
 map.setView([40,-74],99,{animate:false});assert.equal(map.getZoom(),28);
 map.setView([-30,130],-9,{animate:false});assert.equal(map.getZoom(),0);
 map.setView([12,-76],8,{animate:false});assert(Math.abs(map.getCenter().lat-12)<1e-6);assert(Math.abs(map.getCenter().lng+76)<1e-6);
 assert.equal(map.options.maxBounds,undefined);
 assert.equal(tile.options.maxNativeZoom,19);
});
check('area navigation retains each map camera and fit resets it',()=>{
 map.setView([20,40],10,{animate:false});
 api.setArea(1);map.setView([30,60],12,{animate:false});
 api.setArea(0);assert.equal(map.getZoom(),10);assert(Math.abs(map.getCenter().lat-20)<1e-6);assert(Math.abs(map.getCenter().lng-40)<1e-6);
 api.setArea(1);assert.equal(map.getZoom(),12);assert(Math.abs(map.getCenter().lat-30)<1e-6);
 api.fit();for(const s of w.MOD_MAP_CONFIG.locations[1].sites)assert(map.getBounds().contains([s.lat,s.lon]));
});
check('six reference coordinates and markers match in EN/AR and light/dark',()=>{
 for(const lang of ['en','ar'])for(const theme of ['light','dark']){
  state={...state,lang,theme};api.sync(state);api.setView('map');map=env.maps.at(-1);
  for(let area=0;area<2;area++){
   api.setArea(area);
   const sites=w.MOD_MAP_CONFIG.locations[area].sites;
   for(let i=0;i<3;i++){
    $(`[data-register-site="${i}"]`).click();
    assert.equal($('.sites-detail-title').textContent,sites[i].id);
    assert.equal($('.sites-lat').textContent,sites[i].lat.toFixed(6)+'° N');
    assert.equal($('.sites-lon').textContent,sites[i].lon.toFixed(6)+'° E');
    const markers=[];map.eachLayer(l=>{if(l instanceof w.L.Marker)markers.push(l)});
    assert.equal(markers.length,3);
    for(let j=0;j<3;j++){assert.equal(markers[j].getLatLng().lat,sites[j].lat);assert.equal(markers[j].getLatLng().lng,sites[j].lon)}
   }
  }
 }
});
check('motion, guided tour, visibility and leaving lifecycle',()=>{
 state={...state,motion:true};api.sync(state);api.setView('3d');api.setArea(0);api.fit();
 $('.sites-tour').click();env.advance(2600);assert.equal(api.diagnostics().inspect,true);
 env.advance(4700);assert.equal(api.diagnostics().selected,1);
 state={...state,motion:false};api.sync(state);assert.equal(api.diagnostics().touring,false);assert.equal(env.ticks.size,0);
 state={...state,motion:true};api.sync(state);assert.equal(env.ticks.size,1);
 Object.defineProperty(w.document,'hidden',{configurable:true,value:true});w.document.dispatchEvent(new w.Event('visibilitychange'));assert.equal(env.ticks.size,0);
 Object.defineProperty(w.document,'hidden',{configurable:true,value:false});w.document.dispatchEvent(new w.Event('visibilitychange'));assert.equal(env.ticks.size,1);
 api.sync({...state,index:0});assert.equal(env.ticks.size,0);assert.equal($('#sitesSlide').children.length,0);
});
check('WebGL context loss preserves map access and rebuilds safely',()=>{
 state={...state,index:12,motion:true};api.sync(state);api.setView('3d');
 const canvas=$('.sites-webgl canvas');
 canvas.dispatchEvent(new w.Event('webglcontextlost',{cancelable:true}));
 assert.equal(api.diagnostics().failed,true);assert.equal(api.diagnostics().view,'map');
 assert.equal($('.sites-fallback').hidden,false);assert.equal(env.ticks.size,0);
 assert.equal(w.document.querySelectorAll('.sites-leaflet-pin').length,3);
 canvas.dispatchEvent(new w.Event('webglcontextrestored'));
 assert.equal(api.diagnostics().failed,false);
 api.setView('3d');assert.equal(env.ticks.size,1);
 api.sync({...state,index:0});assert.equal(env.ticks.size,0);
 // An obsolete canvas must not recreate a scene after its slide has left.
 canvas.dispatchEvent(new w.Event('webglcontextrestored'));
 assert.equal($('#sitesSlide').children.length,0);
});
env.close();
if(failures.length){console.error(failures.join('\n'));process.exitCode=1}
else console.log('PASS: deployment geographic/satellite regressions and navigation matrix');
