/* Keyboard movement follows the visual language direction inside control groups. */
(()=>{'use strict';
 const groups=[['#sectionRail','.section-button'],['#slideRail','.rail-slide'],['.approach-steps','.approach-step'],['.security-tabs','.security-tab'],['.sites-mode','[data-site-mode]'],['.sites-areas','[data-site-area]']];
 document.getElementById('app').addEventListener('keydown',e=>{
  if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  for(const [selector,buttonSelector] of groups){
   const group=e.target.closest?.(selector);if(!group)continue;
   const buttons=[...group.querySelectorAll(buttonSelector)].filter(b=>!b.disabled&&!b.hidden);
   const current=buttons.indexOf(e.target.closest(buttonSelector));if(current<0||!buttons.length)return;
   const forward=e.key===(document.documentElement.dir==='rtl'?'ArrowLeft':'ArrowRight');
   const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(current+(forward?1:buttons.length-1))%buttons.length;
   e.preventDefault();e.stopPropagation();buttons[next].focus({preventScroll:true});buttons[next].click();return;
  }
 },true);
})();
