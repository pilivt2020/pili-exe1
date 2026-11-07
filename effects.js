/* PILI.EXE: particles/laser bolts — capped FPS and pixel ratio for mobile performance. */
(() => {
 const canvas=document.getElementById('fx-canvas'); if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const mobile=matchMedia('(max-width:760px), (pointer:coarse)').matches;
 const saving=!!navigator.connection?.saveData || (navigator.deviceMemory&&navigator.deviceMemory<=2);
 const staticMode=reduced||saving;
 const targetFPS=mobile?24:30, interval=1000/targetFPS;
 let w=0,h=0,dpr=1,particles=[],raf=0,lastFrame=0,trail=[],bolts=[];
 let pointer={x:-100,y:-100},lastTrail=0;
 const colors=['#39ff14','#bf40fa','#ff0080','#00ffff','#cbb5ff'];
 const rnd=(a,b)=>Math.random()*(b-a)+a;
 let resizeTimer=0;
 const resize=()=>{
  w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,mobile?1:1.25);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
  const amount=staticMode?12:Math.min(mobile?24:55,Math.max(15,Math.round(w*h/(mobile?33000:26000))));
  particles=Array.from({length:amount},()=>({x:rnd(0,w),y:rnd(0,h),r:rnd(.5,1.7),speed:rnd(.1,.45),drift:rnd(-.15,.15),c:colors[Math.floor(rnd(0,colors.length))]}));
 };
 resize(); addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,180)},{passive:true});
 if(!mobile&&!staticMode) addEventListener('pointermove',e=>{
  pointer.x=e.clientX;pointer.y=e.clientY;
  if(performance.now()-lastTrail>55){trail.push({x:e.clientX,y:e.clientY,life:1,r:rnd(2,4),c:colors[Math.floor(rnd(0,colors.length))]});lastTrail=performance.now();if(trail.length>20)trail.shift();}
 },{passive:true});
 addEventListener('pointerleave',()=>{pointer.x=-100;pointer.y=-100},{passive:true});
 const startFrame=()=>{if(!raf&&!document.hidden&&!staticMode)raf=requestAnimationFrame(frame)};
 addEventListener('click',e=>{
  if(reduced||saving)return;
  const n=mobile?6:10, extras=mobile?8:12;
  for(let i=0;i<n;i++){const a=i*Math.PI*2/n+rnd(-.16,.16);bolts.push({x:e.clientX,y:e.clientY,a,length:rnd(32,mobile?65:95),life:1,c:colors[i%colors.length],kink:rnd(.25,.8)})}
  for(let i=0;i<extras;i++){const a=rnd(0,Math.PI*2);trail.push({x:e.clientX,y:e.clientY,life:1.1,r:rnd(2,4),vx:Math.cos(a)*rnd(2,6),vy:Math.sin(a)*rnd(2,6),c:colors[i%colors.length]})}
  if(bolts.length>65)bolts=bolts.slice(-65);
  if(trail.length>60)trail=trail.slice(-60);
  startFrame();
 },{passive:true});
 function frame(t){
  raf=0;if(document.hidden)return;
  if(t-lastFrame<interval){raf=requestAnimationFrame(frame);return}lastFrame=t;
  ctx.clearRect(0,0,w,h);
  for(const p of particles){p.y-=p.speed;p.x+=p.drift;if(p.y < -10)p.y=h+10;if(p.x>w+10)p.x=-10;if(p.x < -10)p.x=w+10;
    const near=Math.abs(pointer.x-p.x)<100&&Math.abs(pointer.y-p.y)<100;
    ctx.globalAlpha=near?.75:.40;ctx.shadowBlur=near?6:0;ctx.shadowColor=p.c;ctx.fillStyle=p.c;
    ctx.fillRect(p.x,p.y,p.r*2,p.r*2);
  }
  ctx.shadowBlur=0;ctx.globalAlpha=1;
  trail=trail.filter(p=>p.life>0);
  for(const p of trail){p.life-=.065;if(p.vx){p.x+=p.vx;p.y+=p.vy}ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.r,p.r)}
  for(const b of bolts){b.life-=.08;if(b.life<=0)continue;const q=b.life;
    const ax=b.x+Math.cos(b.a)*b.length*.31,ay=b.y+Math.sin(b.a)*b.length*.31;
    const bx=b.x+Math.cos(b.a)*b.length*.63+Math.sin(b.a)*b.length*.13*b.kink;
    const by=b.y+Math.sin(b.a)*b.length*.63-Math.cos(b.a)*b.length*.13*b.kink;
    ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(b.x+Math.cos(b.a)*b.length,b.y+Math.sin(b.a)*b.length);
    ctx.globalAlpha=q;ctx.lineWidth=2.5*q+1;ctx.strokeStyle=b.c;ctx.stroke();
  }
  bolts=bolts.filter(b=>b.life>0);ctx.globalAlpha=1;
  raf=requestAnimationFrame(frame);
 }
 if(!staticMode)startFrame();else {
  ctx.clearRect(0,0,w,h);for(const p of particles){ctx.fillStyle=p.c;ctx.globalAlpha=.45;ctx.fillRect(p.x,p.y,p.r*2,p.r*2)}ctx.globalAlpha=1;
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else{lastFrame=0;startFrame()}},{passive:true});
 // Scroll reveal remains functional without animating canvases.
 if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.section-heading,.about-copy>p,.music-player,.donation-jar-panel,.clickgame-grid,.social-row,.clip-card').forEach(el=>{el.classList.add('reveal');io.observe(el)})}
})();
