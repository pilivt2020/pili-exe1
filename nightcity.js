/* PILI // Night city atmosphere — lightweight and independent of API functionality. */
(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
 const coarse = matchMedia('(pointer: coarse)').matches;
 const rain=document.getElementById('night-rain');
 const saveData=!!navigator.connection?.saveData;
 const lowPower=(navigator.deviceMemory&&navigator.deviceMemory<=2)||saveData;
 if(rain && !reduced && !lowPower){
  const ctx=rain.getContext('2d',{alpha:true});
  if(ctx){
   let width=0,height=0,ratio=1,raf=0,drop=[],last=0;
   const palette=['#00f6ff','#ff00b8','#9d63ff','#39ff14'];
   const resize=()=>{
    width=innerWidth;height=innerHeight;ratio=Math.min(devicePixelRatio||1,mobile?1:1.2);
    rain.width=Math.round(width*ratio);rain.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    let n=Math.min(mobile?14:40,Math.max(mobile?7:15,Math.round(width*height/(mobile?60000:35000))));
    drop=Array.from({length:n},()=>({x:Math.random()*width,y:Math.random()*height,s:1.5+Math.random()*3.5,len:10+Math.random()*24,col:palette[Math.floor(Math.random()*palette.length)],opacity:.08+Math.random()*.18}));
   };
   resize();addEventListener('resize',resize,{passive:true});
   const tick=t=>{
     if(t-last>(mobile?100:65)){last=t;ctx.clearRect(0,0,width,height);
      for(const d of drop){ctx.beginPath();ctx.strokeStyle=d.col;ctx.globalAlpha=d.opacity;ctx.lineWidth=.6;ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-3,d.y+d.len);ctx.stroke();d.x-=d.s*.25;d.y+=d.s*2.1;if(d.y>height+30){d.y=-30;d.x=Math.random()*width}if(d.x<0)d.x=width+5;}
      ctx.globalAlpha=1;
     }raf=requestAnimationFrame(tick);
   };
   raf=requestAnimationFrame(tick);
   document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(!raf){last=0;raf=requestAnimationFrame(tick)}},{passive:true});
  }
 }
 const cursor=document.getElementById('cyber-cursor');
 if(cursor&&!coarse&&!reduced&&!lowPower){
   let x=0,y=0,pending=false;
   document.addEventListener('pointermove',ev=>{
    x=ev.clientX;y=ev.clientY;cursor.style.opacity='.82';
    if(!pending){pending=true;requestAnimationFrame(()=>{cursor.style.transform=`translate3d(${x-16}px,${y-16}px,0)`;pending=false})}
    cursor.classList.toggle('over-link',!!ev.target.closest('a,button,[role="button"]'));
   },{passive:true});
   document.addEventListener('pointerleave',()=>cursor.style.opacity='0',{passive:true});
 }
 // subtle parallax, bounded and only on the hero, never moving actual content
 const city=document.querySelector('.city-horizon');
 if(city && !mobile && !reduced&&!lowPower){
  let scheduled=false,px=0,py=0;
  document.addEventListener('pointermove',event=>{
   const rect=document.querySelector('.urban-hero')?.getBoundingClientRect();
   if(!rect || rect.bottom<0 || rect.top>innerHeight) return;
   px=(event.clientX/innerWidth-.5)*12;py=(event.clientY/innerHeight-.5)*7;
   if(!scheduled){scheduled=true;requestAnimationFrame(()=>{city.style.transform=`translate3d(${px.toFixed(2)}px,${py.toFixed(2)}px,0)`;scheduled=false;});}
  },{passive:true});
 }
})();
