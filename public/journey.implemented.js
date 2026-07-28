(() => {
  'use strict';

  const journey = document.querySelector('[data-scroll-journey]');
  const sticky = journey?.querySelector('.journey-sticky');
  const track = journey?.querySelector('.journey-track');
  const panels = [...(journey?.querySelectorAll('.journey-panel') ?? [])];
  const bike = document.getElementById('scroll-bike-container');
  const road = document.querySelector('.journey-road span');
  const city = document.querySelector('.city-layer');
  const hillBack = document.querySelector('.hill-back');
  const hillFront = document.querySelector('.hill-front');
  const speedLines = document.querySelector('.speed-lines');
  const education = document.getElementById('education');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 768px)');
  const sufficientHeight = matchMedia('(min-height: 780px)');

  if (!journey || !sticky || !track || !panels.length) return;

  const supportsJourney = 'ResizeObserver' in window && CSS.supports('position', 'sticky') && CSS.supports('transform', 'translate3d(0,0,0)');
  const MOTION = Object.freeze({smoothing:.08,road:.65,city:.16,hillBack:.09,hillFront:.28,educationArt:.035,entryEnd:.08,exitStart:.9});
  let target=0,current=0,previous=0,distance=0,journeyTop=0,journeyRange=1,frame=0;
  const clamp=(value,min=0,max=1)=>Math.min(Math.max(value,min),max);
  const ease=value=>value<.5?4*value*value*value:1-Math.pow(-2*value+2,3)/2;

  function isEnabled(){return supportsJourney&&desktop.matches&&sufficientHeight.matches&&!reduceMotion.matches}
  function panelProgress(panel){return distance>0?clamp(panel.offsetLeft/distance):0}
  function updateTarget(){if(!isEnabled())return;target=clamp((scrollY-journeyTop)/journeyRange);if(!frame)frame=requestAnimationFrame(render)}
  function measure(){if(!isEnabled())return;distance=Math.max(track.scrollWidth-innerWidth,0);journey.style.setProperty('--journey-distance',`${distance}px`);journey.style.setProperty('--journey-height',`${distance+innerHeight}px`);journeyTop=journey.getBoundingClientRect().top+scrollY;journeyRange=Math.max(journey.offsetHeight-innerHeight,1);updateTarget()}

  function nearestPanelIndex(travelled){const viewportCenter=travelled+innerWidth/2;return panels.reduce((nearest,panel,index)=>{const center=panel.offsetLeft+panel.offsetWidth/2;const nearestPanel=panels[nearest];const nearestCenter=nearestPanel.offsetLeft+nearestPanel.offsetWidth/2;return Math.abs(center-viewportCenter)<Math.abs(nearestCenter-viewportCenter)?index:nearest},0)}
  function updateActiveState(travelled){const activeIndex=nearestPanelIndex(travelled);panels.forEach((panel,index)=>panel.classList.toggle('is-active',index===activeIndex));document.querySelectorAll('.links a[href^="#"]').forEach(link=>{const linkedPanel=document.querySelector(link.hash);if(linkedPanel===panels[activeIndex])link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}

  function render(){frame=0;if(!isEnabled())return;current+=(target-current)*MOTION.smoothing;const delta=current-previous;previous=current;const travelled=current*distance;track.style.transform=`translate3d(${-travelled}px,0,0)`;if(road)road.style.transform=`translate3d(${-(travelled*MOTION.road)%64}px,0,0)`;if(city)city.style.transform=`translate3d(${-(travelled*MOTION.city)%innerWidth}px,0,0)`;if(hillBack)hillBack.style.transform=`translate3d(${-(travelled*MOTION.hillBack)%innerWidth}px,0,0)`;if(hillFront)hillFront.style.transform=`translate3d(${-(travelled*MOTION.hillFront)%innerWidth}px,0,0)`;if(speedLines)speedLines.style.opacity=String(clamp(Math.abs(delta)*70,0,.38));if(education){const shift=clamp(-travelled*MOTION.educationArt,-32,0);education.style.setProperty('--polyu-art-shift',`${shift}px`)}if(bike){let bikeX;if(current<MOTION.entryEnd)bikeX=-420+ease(current/MOTION.entryEnd)*(innerWidth*.5+420);else if(current<MOTION.exitStart)bikeX=innerWidth*.5;else bikeX=innerWidth*.5+ease((current-MOTION.exitStart)/(1-MOTION.exitStart))*(innerWidth*.72);const rotation=travelled*.72;bike.style.transform=`translate3d(${bikeX}px,${Math.sin(rotation*Math.PI/110)*3}px,0) translateX(-50%) rotate(${clamp(delta*400,-1.5,1.5)}deg)`}updateActiveState(travelled);if(Math.abs(target-current)>.0001)frame=requestAnimationFrame(render)}

  function navigateTo(panel,behavior='smooth',updateHistory=false){if(!panels.includes(panel))return;const progress=panelProgress(panel);if(updateHistory&&panel.id)history.pushState(null,'',`#${panel.id}`);if(behavior==='auto'){target=progress;current=progress;previous=progress;track.style.transform=`translate3d(${-progress*distance}px,0,0)`;updateActiveState(progress*distance)}scrollTo({top:journeyTop+progress*journeyRange,behavior:reduceMotion.matches?'auto':behavior})}
  function routeHash(behavior='auto'){if(!isEnabled()||!location.hash)return;const panel=document.querySelector(location.hash);if(!panels.includes(panel))return;requestAnimationFrame(()=>{measure();navigateTo(panel,behavior,false)})}
  function resetVerticalMode(){cancelAnimationFrame(frame);frame=0;target=current=previous=0;journey.style.removeProperty('--journey-height');journey.style.removeProperty('--journey-distance');track.style.removeProperty('transform');bike?.style.removeProperty('transform');[road,city,hillBack,hillFront].forEach(layer=>layer?.style.removeProperty('transform'));speedLines?.style.removeProperty('opacity');education?.style.removeProperty('--polyu-art-shift');panels.forEach(panel=>panel.classList.add('is-active'));document.querySelectorAll('.links a[aria-current]').forEach(link=>link.removeAttribute('aria-current'))}
  function setMode(){const enabled=isEnabled();document.documentElement.classList.toggle('has-scroll-journey',enabled);if(!enabled){resetVerticalMode();return}panels.forEach((panel,index)=>panel.classList.toggle('is-active',index===0));requestAnimationFrame(()=>{measure();routeHash('auto')})}

  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{if(!isEnabled())return;const panel=document.querySelector(link.hash);if(!panels.includes(panel))return;event.preventDefault();navigateTo(panel,'smooth',true)}));
  track.addEventListener('focusin',event=>{if(!isEnabled())return;const panel=event.target.closest('.journey-panel');if(panels.includes(panel)&&Math.abs(panelProgress(panel)-target)>.01)navigateTo(panel,'auto',false)});
  addEventListener('scroll',updateTarget,{passive:true});
  addEventListener('resize',measure,{passive:true});
  addEventListener('hashchange',()=>routeHash('auto'));
  addEventListener('popstate',()=>routeHash('auto'));
  desktop.addEventListener('change',setMode);
  sufficientHeight.addEventListener('change',setMode);
  reduceMotion.addEventListener('change',setMode);
  new ResizeObserver(measure).observe(track);
  setMode();
})();