/* Only the user's supplied wow sound plays on a deliberate click of Pili. */
(() => {
 const targets = [...document.querySelectorAll('.pili-wow')];
 const audio = new Audio('assets/pili-wow.mp3'); audio.preload = 'auto'; audio.volume = .78;
 const play = (event) => {
   event.stopPropagation();
   try {audio.pause();audio.currentTime=0;const p=audio.play();if(p&&p.catch)p.catch(()=>{});}catch(_){}
   const target = event.currentTarget;target.classList.remove('wow-pulse');void target.offsetWidth;target.classList.add('wow-pulse');
 };
 targets.forEach(t=>{t.addEventListener('click', play);t.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();play(event)}});});
})();
