(() => {
 const wall=document.getElementById('tagwall-canvas'),clear=document.getElementById('tagwall-clear'),empty=document.getElementById('tagwall-start');if(!wall||!clear)return;
 const key='pili.stickerwall.v1',palette=['#39ff14','#00ffff','#ff00b8','#db99ff','#fff149'],marks=['✷','★','PILI!','♡','⚡','404','Y2K','✳','POP!','☆'];
 let tags=[];try{const parsed=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(parsed))tags=parsed.slice(-40).filter(t=>Number.isFinite(t.x)&&Number.isFinite(t.y)&&Number.isInteger(t.i))}catch{}
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(tags.slice(-40)))}catch{}};
 const add=t=>{const el=document.createElement('span');el.className='wall-tag';el.textContent=marks[t.i%marks.length];el.style.left=Math.max(3,Math.min(97,t.x))+'%';el.style.top=Math.max(8,Math.min(92,t.y))+'%';el.style.color=palette[t.i%palette.length];el.style.setProperty('--rot',((t.i*47)%54-27)+'deg');wall.appendChild(el)};
 tags.forEach(add);if(tags.length)empty?.remove();
 wall.addEventListener('click',e=>{const r=wall.getBoundingClientRect();const t={x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100,i:Math.floor(Math.random()*marks.length)};tags.push(t);if(tags.length>40){tags.shift();wall.querySelector('.wall-tag')?.remove()}add(t);empty?.remove();save()});
 clear.addEventListener('click',()=>{tags=[];save();wall.querySelectorAll('.wall-tag').forEach(el=>el.remove());if(!document.getElementById('tagwall-start')){const hint=document.createElement('div');hint.className='tagwall-start';hint.id='tagwall-start';hint.textContent='✷ TOCA PARA PINTAR ✷';wall.appendChild(hint)}});
})();