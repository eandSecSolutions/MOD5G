/* Shell configuration. Language strings belong in content/en.js and content/ar.js. */
window.MOD_CONFIG = {
 version:'0.42.0', defaultLanguage:'en', defaultTheme:'light', motionByDefault:true,
 transitionMs:650, maxPixelRatio:1.5,
 // Preserve brand aspect ratios. The current MOD mark is the supplied NSUTM source asset.
 logos:{etisalatLight:'assets/brand/etisalat-red.png',etisalatDark:'assets/brand/etisalat-white.png',mod:'assets/brand/mod.png'},
 backgrounds:{en:{light:'assets/images/site-en-day.webp',dark:'assets/images/site-en-night-clean-v30.webp'},ar:{light:'assets/images/site-ar-day.webp',dark:'assets/images/site-ar-night-clean-v30.webp'}},
 stageImages:['arrival','connect','ran','demo'].map(n=>'assets/images/stage-'+n+'.webp'),
 scene:{maxPixelRatio:1.5,desktopExtent:13.7,introExtent:17,arrivalSeconds:4.8},
 approach:{stageSeconds:9},
 security:{layerSeconds:11,maxPixelRatio:1.5},
 usecases:{seconds:9},
 caller:{stageSeconds:4.5},
 ptt:{storySeconds:26,replySeconds:3.5,connectSeconds:2.4,maxPixelRatio:1.5},
 slides:[
  {id:'opening',page:1,group:0}, {id:'approach',page:3,group:0},
  {id:'security',page:4,group:0}, {id:'use-cases',page:5,group:1},
  {id:'push-to-talk',page:6,group:1}, {id:'caller-verification',page:7,group:1},
  {id:'dispatch',page:8,group:1}, {id:'drones',page:9,group:1},
  {id:'ai-camera',page:10,group:1}, {id:'body-camera',page:11,group:1},
  {id:'land-border',page:1,group:1}, // Advanced 5G Mission Coastal & Desert.pdf
  {id:'coastal-border',page:2,group:1}, // Advanced 5G Mission Coastal & Desert.pdf
  {id:'sites',page:13,group:2}, {id:'implementation',page:14,group:2},
  {id:'closing',page:16,group:3}
 ]
};
