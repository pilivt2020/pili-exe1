/* Intro synth: initiated only through visitor touch/click, never autoplays without permission. */
(() => {
 const btn=document.getElementById('intro-sound');
 const intro=document.getElementById('boot-overlay');
 if(!btn||!intro)return;
 let ctx=null,enabled=false;
 const play=(long=false)=>{
   if(!ctx || ctx.state!=='running')return;
   const t=ctx.currentTime;
   try{
    const mix=ctx.createGain();mix.gain.value=.44;mix.connect(ctx.destination);
    const tones=long?[[440,880,.26],[660,1320,.31],[990,1760,.37]]:[[280,860,.14],[550,1200,.18],[910,1500,.2]];
    tones.forEach(([f0,f1,d],i)=>{
      const o=ctx.createOscillator();const g=ctx.createGain();
      o.type=i===1?'triangle':'sine';
      o.frequency.setValueAtTime(f0,t+i*.047);o.frequency.exponentialRampToValueAtTime(f1,t+i*.047+d);
      g.gain.setValueAtTime(.0001,t+i*.047);g.gain.exponentialRampToValueAtTime(.065,t+i*.047+.018);g.gain.exponentialRampToValueAtTime(.0001,t+i*.047+d);
      o.connect(g);g.connect(mix);o.start(t+i*.047);o.stop(t+i*.047+d+.01);
      o.onended=()=>{o.disconnect();g.disconnect()};
    });
    setTimeout(()=>mix.disconnect(),650);
   }catch(_){}
 };
 btn.addEventListener('click',async()=>{
   if(!enabled){
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('not supported');ctx=new Audio();await ctx.resume();enabled=ctx.state==='running'}catch{enabled=false}
   }
   if(enabled){play(true);btn.textContent='♫ SONIDO ACTIVADO';btn.setAttribute('aria-pressed','true')}
   else btn.textContent='SONIDO NO DISPONIBLE';
 });
 intro.addEventListener('transitionstart',event=>{if(enabled&&event.target===intro&&event.propertyName==='opacity')play()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&ctx)ctx.suspend().catch(()=>{})});
})();
