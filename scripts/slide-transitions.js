/* Interruptible navigation choreography. Native animation; no screenshots or clones. */
(() => {
  'use strict';
  const panels = ['copyZone','approachSlide','securitySlide','usecasesSlide','pttSlide','callerSlide','dispatchSlide','droneSlide','aiSlide','bodySlide','missionsSlide','coastalSlide','sitesSlide','implementationSlide','closingSlide'];
  const animations = new Set();
  const sceneAnimations = new Set();
  const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let phase = 'idle', pending = null, epoch = 0, appearance = null, requests = 0, commits = 0, lastError = '';
  const panel = index => document.getElementById(panels[index] || 'copyZone');
  const veil = () => document.getElementById('slideTransition');
  const enabled = state => !!state?.motion && !document.hidden;
  // These layers live outside the panel. Fade them in place so the beacon,
  // photograph and projected 3D labels keep their exact coordinate alignment.
  function fadeScene(entering) {
    for (const element of document.querySelectorAll('#cinematicCanvas,#worldLabels,#introStage,.intro-atmosphere,.ambient,.material-caption')) {
      const natural = Number.parseFloat(window.getComputedStyle(element).opacity);
      const opacity = Number.isFinite(natural) ? natural : 1;
      const animation = play(element, entering ? [{opacity:0},{opacity}] : [{opacity},{opacity:0}],
        {duration:entering ? 820 : 230,easing:entering ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.4,0,.8,.3)',fill:'both'});
      if (animation) sceneAnimations.add(animation);
    }
  }
  function clearSceneAnimations() {
    for (const animation of sceneAnimations) {
      animations.delete(animation);
      animation.onfinish = animation.oncancel = null;
      try { animation.cancel(); } catch (_) {}
    }
    sceneAnimations.clear();
  }

  function clearAnimations() {
    for (const animation of animations) {
      animation.onfinish = animation.oncancel = null;
      try { animation.cancel(); } catch (_) {}
    }
    animations.clear();
    sceneAnimations.clear();
    document.body.classList.remove('deck-transitioning');
  }
  function play(element, frames, options, complete) {
    if (!element?.animate) { complete?.(); return null; }
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.onfinish = () => {
      animations.delete(animation);
      sceneAnimations.delete(animation);
      animation.onfinish = animation.oncancel = null;
      // Natural styles are always the readable, final state.
      animation.cancel();
      complete?.();
    };
    animation.oncancel = () => { animations.delete(animation); sceneAnimations.delete(animation); };
    return animation;
  }
  function finish(token) {
    if (token !== epoch) return;
    phase = 'idle';
    clearAnimations();
  }
  function apply(request, animated, token) {
    if (!request || token !== epoch) return;
    pending = null;
    phase = animated ? 'enter' : 'idle';
    try {
      clearSceneAnimations();
      const committedState = request.commit();
      commits++;
      appearance = {...(committedState || request.state)};
      document.body.classList.toggle('deck-intro', appearance.index === 0);
      if (!animated) { request.onEnter?.({animate:false}); return; }
      const sign = (request.direction || 1) * (appearance.lang === 'ar' ? -1 : 1);
      fadeScene(true);
      play(panel(request.to), [
        {opacity:0, translate:`${sign * 34}px 12px`, scale:'1.025'},
        {opacity:.94, translate:`${sign * 3}px 1px`, scale:'1.003',offset:.62},
        {opacity:1, translate:'0px 0px', scale:'1'}
      ], {duration:820, easing:'cubic-bezier(.16,1,.3,1)', fill:'both'}, () => finish(token));
      // Slide controllers register their resize callbacks during commit.
      requestAnimationFrame(() => {
        if (token === epoch && phase === 'enter') request.onEnter?.({animate:true});
      });
    } catch (error) {
      lastError = String(error.message || error);
      finish(token);
      window.MOD_TYPE?.settle();
      console.warn('Slide transition settled:', error);
    }
  }
  function settle(commitPending = true) {
    const request = pending;
    const token = ++epoch;
    pending = null;
    phase = 'idle';
    clearAnimations();
    window.MOD_TYPE?.settle();
    if (commitPending && request) apply(request, false, token);
  }
  function navigate(request) {
    requests++;
    if (!enabled(request.state) || !panel(request.from)?.animate) {
      settle(false);
      apply(request, false, epoch);
      return;
    }
    // Rapid arrow presses accumulate in the shell; one outgoing scene owns the exit.
    if (phase === 'out') { pending = request; return; }
    settle(false);
    const token = ++epoch;
    pending = request;
    phase = 'out';
    const sign = (request.direction || 1) * (request.state.lang === 'ar' ? -1 : 1);
    const curtain = veil(), stage = document.getElementById('stage');
    if (curtain) {
      curtain.dataset.direction = request.direction < 0 ? 'back' : 'forward';
      const bounds = stage?.getBoundingClientRect();
      if (bounds?.height > 0) {
        curtain.style.setProperty('--deck-stage-top', bounds.top + 'px');
        curtain.style.setProperty('--deck-stage-bottom', Math.max(0, window.innerHeight - bounds.bottom) + 'px');
      }
    }
    document.body.classList.add('deck-transitioning');
    play(curtain, [{opacity:0},{opacity:1,offset:.28},{opacity:0}],
      {duration:1050,easing:'ease-in-out',fill:'both'});
    fadeScene(false);
    play(panel(request.from), [
      {opacity:1,translate:'0px 0px',scale:'1'},
      {opacity:0,translate:`${-sign * 20}px -5px`,scale:'.976'}
    ], {duration:230,easing:'cubic-bezier(.4,0,.8,.3)',fill:'both'}, () => {
      if (token !== epoch) return;
      apply(pending, true, token);
    });
  }
  function sync(state) {
    appearance = {...state};
    document.body.classList.toggle('deck-intro', state.index === 0);
    if (!enabled(state)) settle(true);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(true); });
  const preferenceChanged = () => { if (appearance && !enabled(appearance)) settle(true); };
  if (preference?.addEventListener) preference.addEventListener('change', preferenceChanged);
  else preference?.addListener?.(preferenceChanged);
  window.addEventListener('pagehide', () => settle(true));
  window.MOD_TRANSITIONS = {
    navigate, settle, sync,
    diagnostics: () => ({phase, pending:pending?.to ?? null, epoch, animations:animations.size, requests, commits, error:lastError, reduced:!!preference?.matches})
  };
})();
