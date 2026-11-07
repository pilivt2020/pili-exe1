
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Notitas compartidas por Netlify Blobs. */
  const noteForm=document.getElementById('note-form');
  const noteName=document.getElementById('note-name');
  const noteMessage=document.getElementById('note-message');
  const noteBoard=document.getElementById('note-board');
  const noteEmpty=document.getElementById('note-empty');
  const refreshNotes=document.getElementById('clear-notes');
  if(noteForm && noteBoard && noteName && noteMessage){
    const api='/.netlify/functions/public-notes';
    const colors=['note-a','note-b','note-c','note-d'];
    const status=document.createElement('p');
    status.className='notes-mini';
    status.setAttribute('role','status');
    noteForm.appendChild(status);
    let visitorId;
    try{
      visitorId=localStorage.getItem('pili_notes_visitor');
      if(!visitorId){visitorId=crypto.randomUUID();localStorage.setItem('pili_notes_visitor',visitorId)}
    }catch{visitorId=crypto.randomUUID()}
    function draw(notes){
      noteBoard.querySelectorAll('.sticky-note').forEach(el=>el.remove());
      noteEmpty.hidden=notes.length>0;
      noteEmpty.textContent='Todavía no hay notitas públicas. ¡Deja la primera! ♡';
      notes.forEach((note,i)=>{
        const el=document.createElement('article');
        el.className=`sticky-note ${colors[i%colors.length]}`;
        el.style.setProperty('--rot',`${(i%2?-1:1)*(2+i%3)}deg`);
        const b=document.createElement('b');b.textContent=note.name||'Anónimo';
        const p=document.createElement('p');p.textContent=note.message;
        const t=document.createElement('span');t.textContent=note.time||'';
        el.append(b,p,t);noteBoard.appendChild(el);
      });
    }
    async function loadNotes(){
      try{
        const resp=await fetch(api,{cache:'no-store'});
        const data=await resp.json();
        if(!resp.ok)throw Error(data.error||'No se pudieron cargar las notitas');
        draw(Array.isArray(data.notes)?data.notes:[]);
        status.textContent='Mensajitos compartidos con todas las visitas ♡';
      }catch(err){status.textContent=err.message;}
    }
    noteForm.addEventListener('submit',async ev=>{
      ev.preventDefault();
      const name=noteName.value.trim().slice(0,20);
      const message=noteMessage.value.trim().slice(0,95);
      if(message.length<2){status.textContent='Escribe un mensajito más largo 💜';return}
      const submit=noteForm.querySelector('button[type="submit"]');
      submit.disabled=true;status.textContent='Publicando tu notita…';
      try{
        const resp=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:visitorId,name,message})});
        const data=await resp.json();if(!resp.ok)throw Error(data.error||'No se pudo publicar');
        noteMessage.value='';
        await loadNotes();
        status.textContent='¡Tu notita ya está visible para todos! 💚';
      }catch(err){status.textContent=err.message}finally{submit.disabled=false}
    });
    if(refreshNotes){refreshNotes.textContent='↻ ACTUALIZAR NOTITAS';refreshNotes.addEventListener('click',loadNotes)}
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting)){loadNotes();io.disconnect()}},{rootMargin:'250px'});io.observe(noteBoard);
    }else loadNotes();
  }

  /* tiny mascot */
  const mascot = document.getElementById('pili-mascot');
  const mascotButton = document.getElementById('mascot-button');
  const mascotBubble = document.getElementById('mascot-bubble');
  const mascotImage = document.getElementById('mascot-image');
  if (mascot && mascotButton && mascotBubble && mascotImage) {
    const moods = [
      { text: 'holi, vine a acompañarte ♡', img: 'assets/pili-cute-face.webp' },
      { text: 'si me picas, me emociono JAJA', img: 'assets/pili-glasses.webp' },
      { text: '¿ya viste mis secretitos? ✦', img: 'assets/pili-chaos.webp' },
      { text: 'tengo sueño… pero te quiero', img: 'assets/pili-cry.webp' },
      { text: 'mapachita de guardia, lista ♡', img: 'assets/pili-heart.webp' }
    ];
    let moodIndex = 0;
    let sleepTimer = 0;
    let moveTimer = 0;
    const wakeUp = () => {
      mascot.classList.remove('is-sleeping');
      resetSleep();
    };
    const say = (text) => { mascotBubble.textContent = text; };
    const moveMascot = () => {
      if (window.matchMedia('(max-width: 760px), (prefers-reduced-motion: reduce)').matches) return;
      const maxX = Math.max(0, window.innerWidth - 180);
      const maxY = Math.max(0, window.innerHeight - 180);
      const x = Math.max(0, Math.min(maxX, Math.random() * maxX * 0.82));
      const y = Math.max(0, Math.min(maxY, Math.random() * maxY * 0.7));
      mascot.style.setProperty('--mx', `${x}px`);
      mascot.style.setProperty('--my', `${-y}px`);
    };
    const resetSleep = () => {
      clearTimeout(sleepTimer);
      sleepTimer = window.setTimeout(() => {
        mascot.classList.add('is-sleeping');
        say('zzz... si me tocas me despierto');
      }, 15000);
    };
    const loopMove = () => {
      clearInterval(moveTimer);
      if (!window.matchMedia('(max-width:760px), (prefers-reduced-motion:reduce)').matches)
        moveTimer = window.setInterval(() => {
          if (!document.hidden && !mascot.classList.contains('is-sleeping')) moveMascot();
        }, 12000);
    };
    mascotButton.addEventListener('click', () => {
      wakeUp();
      moodIndex = (moodIndex + 1) % moods.length;
      mascotImage.src = moods[moodIndex].img;
      say(moods[moodIndex].text);
      moveMascot();
    });
    ['pointerdown','keydown'].forEach((ev) => window.addEventListener(ev, wakeUp, {passive:true}));
    moveMascot();
    resetSleep();
    loopMove();
  }

  /* hidden secrets */
  const main = document.querySelector('main');
  const tracker = document.getElementById('secret-count');
  const modal = document.getElementById('secret-modal');
  const modalClose = document.getElementById('secret-close');
  if (main && tracker && modal && modalClose) {
    const key = 'pili.hidden.secrets.v1';
    const secretDefs = [
      { id:'s1', parent:'#inicio', left:'88%', top:'16%', icon:'✦' },
      { id:'s2', parent:'#sobre-mi', left:'18%', top:'72%', icon:'★' },
      { id:'s3', parent:'#musica', left:'83%', top:'22%', icon:'✳' },
      { id:'s4', parent:'#mi-mundo', left:'8%', top:'56%', icon:'?' },
      { id:'s5', parent:'#apoyame', left:'90%', top:'64%', icon:'♡' },
      { id:'s6', parent:'#juego', left:'12%', top:'18%', icon:'⚡' }
    ];
    let found = [];
    try { found = JSON.parse(localStorage.getItem(key) || '[]'); if (!Array.isArray(found)) found = []; } catch { found = []; }
    const updateCount = () => tracker.textContent = String(found.length);
    const maybeOpenModal = () => { if (found.length >= secretDefs.length) modal.hidden = false; };
    secretDefs.forEach((def) => {
      const parent = document.querySelector(def.parent);
      if (!parent) return;
      parent.style.position = parent.style.position || 'relative';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'secret-chip';
      btn.setAttribute('aria-label', 'Secretito escondido de Pili');
      btn.textContent = def.icon;
      btn.style.left = def.left;
      btn.style.top = def.top;
      if (found.includes(def.id)) btn.classList.add('is-found');
      btn.addEventListener('click', () => {
        if (found.includes(def.id)) return;
        found.push(def.id);
        try { localStorage.setItem(key, JSON.stringify(found)); } catch {}
        btn.classList.add('is-found');
        updateCount();
        if (found.length === secretDefs.length) maybeOpenModal();
      });
      parent.appendChild(btn);
    });
    modalClose.addEventListener('click', () => { modal.hidden = true; });
    modal.addEventListener('click', (ev) => { if (ev.target === modal) modal.hidden = true; });
    window.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !modal.hidden) modal.hidden = true; });
    updateCount();
  }
})();
