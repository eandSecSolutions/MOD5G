const test=require('node:test'),assert=require('node:assert/strict');
const {runtime}=require('./usecases-runtime.cjs');
const state={index:9,lang:'en',theme:'light',motion:true};

test('body GINA removes the inset feed labels while displaying the full feed',()=>{
 const r=runtime();try{
  const c=r.w.MOD_CINEMA;c.sync(state);c.seek(26.8);
  const feed=r.w.document.querySelector('#bodySlide .cinema-feed');
  assert.equal(feed.hidden,false,'late scene has a feed inset');
  c.toggleGina();
  assert.equal(feed.hidden,true,'full GINA feed must not retain the inset labels');
  c.toggleGina();
  assert.equal(feed.hidden,false,'returning to the scene restores its inset');
 }finally{r.close()}
});

test('context loss removes the old live feed inset from the fallback',()=>{
 const r=runtime();try{
  const c=r.w.MOD_CINEMA;c.sync(state);c.seek(26.8);
  const host=r.w.document.getElementById('bodySlide');
  assert.equal(host.querySelector('.cinema-feed').hidden,false);
  host.querySelector('canvas').dispatchEvent(new r.w.Event('webglcontextlost',{cancelable:true}));
  assert.equal(c.diagnostics().contextLost,true);
  assert.equal(host.querySelector('.cinema-feed').hidden,true,'fallback image must not claim to contain a live inset');
  assert.equal(host.querySelector('.cinema-play').disabled,true);
  host.querySelector('canvas').dispatchEvent(new r.w.Event('webglcontextrestored'));
  assert.equal(c.diagnostics().contextLost,false);
  assert.equal(host.querySelector('.cinema-play').disabled,false,'restored WebGL enables playback again');
 }finally{r.close()}
});

test('photo dialog contains deck navigation keys until it closes',()=>{
 const r=runtime();try{
  const {w}=r,c=w.MOD_CINEMA;c.sync({...state,index:7});
  const host=w.document.getElementById('droneSlide');
  let escaped=0;w.document.addEventListener('keydown',()=>escaped++);
  host.querySelector('[data-cinema-image="1"]').click();
  const close=host.querySelector('.cinema-close');
  for(const key of ['ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'])close.dispatchEvent(new w.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));
  assert.equal(escaped,0,'keys from the modal must not reach deck navigation');
  close.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  assert.equal(host.querySelector('.cinema-gallery').hidden,true);
  assert.equal(w.document.activeElement,host.querySelector('[data-cinema-image="1"]'));
 }finally{r.close()}
});

test('unavailable WebGL exposes static fallback controls without a false playback state',()=>{
 const r=runtime({failRenderer:true});try{
  const {w}=r,c=w.MOD_CINEMA;c.sync(state);
  const host=w.document.getElementById('bodySlide');
  assert.equal(c.diagnostics().running,false);
  for(const selector of ['.cinema-play','.cinema-gina-play']){
   const button=host.querySelector(selector);
   assert.equal(button.disabled,true,'playback cannot work without a renderer');
   assert.equal(button.getAttribute('aria-label'),w.MOD_CINEMA_COPY.en.play,'fallback must not report active playback');
  }
  host.querySelector('[data-cinema-step="2"]').click();
  assert.equal(c.diagnostics().elapsed,14.8,'static story navigation remains available');
  host.querySelector('[data-cinema-image="0"]').click();
  assert.equal(host.querySelector('.cinema-gallery').hidden,false,'photo viewing remains available');
 }finally{r.close()}
});
