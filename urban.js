/* PILI.EXE / entrada + hologramas ambientales. No modifica las funciones de clips, donaciones o ranking. */
(() => {
  const intro=document.getElementById('boot-overlay');
  const skip=document.getElementById('boot-skip');
  const fill=document.getElementById('boot-progress');
  const counter=document.getElementById('boot-percent');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finale=document.getElementById('boot-finale');
  const subtitle=intro?.querySelector('.boot-sub');
  const signal=intro?.querySelector('.boot-signal');
  const particleStage=intro?.querySelector('#boot-particle-stage');
  if (intro) {
    let ended=false;
    if(particleStage && !reduced){
      const frag=document.createDocumentFragment();
      for(let i=0;i<(matchMedia('(max-width:760px)').matches?12:28);i++){
        const p=document.createElement('span');
        p.className='boot-particle';
        p.style.setProperty('--x',`${Math.random()*100}%`);
        p.style.setProperty('--y',`${Math.random()*100}%`);
        p.style.setProperty('--size',`${10+Math.random()*26}px`);
        p.style.setProperty('--delay',`${(Math.random()*1.6).toFixed(2)}s`);
        p.style.setProperty('--dur',`${(2.8+Math.random()*2.6).toFixed(2)}s`);
        p.style.setProperty('--drift',`${(-80+Math.random()*160).toFixed(0)}px`);
        frag.appendChild(p);
      }
      for(let i=0;i<(matchMedia('(max-width:760px)').matches?2:6);i++){
        const c=document.createElement('span');
        c.className='boot-comet';
        c.style.setProperty('--delay',`${(Math.random()*1.8).toFixed(2)}s`);
        c.style.setProperty('--start',`${10+Math.random()*78}%`);
        c.style.setProperty('--dur',`${(1.6+Math.random()*1.6).toFixed(2)}s`);
        frag.appendChild(c);
      }
      particleStage.appendChild(frag);
    }
    const previousFocus=document.activeElement;
    const finish=()=>{if(ended)return;ended=true;fill.style.width='100%';counter.textContent='100';if(finale)finale.classList.add('show');if(subtitle)subtitle.innerHTML='BIENVENIDA AL DISTRITO DE PILI <span class="boot-dots">...</span>';intro.classList.add('is-ending','intro-phase-three','intro-burst');window.setTimeout(()=>{intro.classList.add('is-gone');intro.setAttribute('aria-hidden','true');intro.removeAttribute('aria-modal');window.setTimeout(()=>{intro.remove();if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus({preventScroll:true})},900)},550)};
    skip?.addEventListener('click',finish);
    window.addEventListener('keydown',e=>{if(e.key==='Escape')finish()},{once:true});
    if(reduced){intro.remove();ended=true}else{
      const start=performance.now(); const duration=3200;
      function tick(now){if(ended)return;const t=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-t,2.2);const value=Math.round(ease*100);if(t>.28)intro.classList.add('intro-phase-two');if(t>.65)intro.classList.add('intro-phase-three');if(signal)signal.textContent=t<.20?'✳ REUNIENDO PARTÍCULAS...':t<.46?'⚡ PRENDIENDO EL NEÓN...':t<.75?'✦ PINTANDO GRAFITI DIGITAL...':'✓ PORTAL ABIERTO';fill.style.width=value+'%';counter.textContent=String(value).padStart(2,'0');if(t<1)requestAnimationFrame(tick);else window.setTimeout(finish,200)}requestAnimationFrame(tick);
    }
  }
  if (reduced) return;
  const positions=[
    ['.about', '7%', '78%'],['.about','87%','20%'],['.music-section','12%','76%'],['.world','92%','30%'],['.donation-zone','8%','58%'],['.social-section','86%','12%'],['.clickgame-section','92%','45%']
  ];
  positions.forEach(([selector,left,top],i)=>{const parent=document.querySelector(selector);if(!parent)return;const el=document.createElement('span');el.className='holo-decal';el.style.left=left;el.style.top=top;el.style.animationDelay=`-${i*.91}s`;el.setAttribute('aria-hidden','true');parent.appendChild(el)});
  const art=document.querySelector('.urban-hero .hero-art');
  if(art && window.matchMedia('(pointer:fine)').matches){
    let raf=0;
    art.addEventListener('pointermove',ev=>{if(raf)return;raf=requestAnimationFrame(()=>{const r=art.getBoundingClientRect();const x=(ev.clientX-r.left)/r.width-.5,y=(ev.clientY-r.top)/r.height-.5;art.style.setProperty('--tiltx',(y*-6).toFixed(2)+'deg');art.style.setProperty('--tilty',(x*6).toFixed(2)+'deg');raf=0})});
    art.addEventListener('pointerleave',()=>{art.style.setProperty('--tiltx','0deg');art.style.setProperty('--tilty','0deg')});
  }
})();
