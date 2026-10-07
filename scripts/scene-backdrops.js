/* Photographic atmosphere belongs beneath, never over, the live geometry. */
(()=>{'use strict';
 const kinds=['ptt','caller','dispatch'];
 for(const kind of kinds){
  const day=`assets/images/${kind}-backdrop-day-v27.webp`;
  window.MOD_NIGHT_MAP[day]=`assets/images/${kind}-backdrop-night-v27.webp`;
 }
 window.MOD_BACKDROP={picture(kind){
  if(!kinds.includes(kind))return '';
  return `<div class="scene-backdrop scene-backdrop-${kind}" aria-hidden="true">${MOD_NIGHT.picture(`assets/images/${kind}-backdrop-day-v27.webp`)}<div class="scene-backdrop-wash"></div></div>`;
 }};
})();
