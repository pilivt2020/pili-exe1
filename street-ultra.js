/* PILI.EXE STREET ULTRA — decoration only; no network, no API data, no listeners on gameplay controls. */
(() => {
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=window.matchMedia('(max-width: 760px)').matches;
  if(reduced || mobile) return;
  const signs=[...document.querySelectorAll('.street-billboard')];
  if(!signs.length) return;
  // Low-frequency light shimmer; no extra animation loop / timers.
  const hero=document.querySelector('.urban-hero');
  const watcher=new IntersectionObserver((entries)=>{
    for(const entry of entries){
      for(const sign of signs)sign.style.animationPlayState=entry.isIntersecting?'running':'paused';
    }
  },{threshold:0});
  if(hero) watcher.observe(hero);
})();
