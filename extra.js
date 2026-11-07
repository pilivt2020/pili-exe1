
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* note wall */
  const noteForm = document.getElementById('note-form');
  const noteName = document.getElementById('note-name');
  const noteMessage = document.getElementById('note-message');
  const noteBoard = document.getElementById('note-board');
  const noteEmpty = document.getElementById('note-empty');
  const clearNotes = document.getElementById('clear-notes');
  if (noteForm && noteBoard && noteName && noteMessage && clearNotes) {
    const KEY = 'pili.note.wall.v2';
    const nowStamp = () => new Date().toLocaleDateString('es', {day:'2-digit', month:'short'});
    const noteClasses = ['note-a','note-b','note-c','note-d'];
    let notes = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(parsed)) notes = parsed.slice(0, 12);
    } catch {}
    const saveNotes = () => { try { localStorage.setItem(KEY, JSON.stringify(notes.slice(0,12))); } catch {} };
    const renderNotes = () => {
      noteBoard.querySelectorAll('.sticky-note').forEach((n) => n.remove());
      if (!notes.length) {
        if (noteEmpty) noteEmpty.hidden = false;
        return;
      }
      if (noteEmpty) noteEmpty.hidden = true;
      notes.forEach((note, i) => {
        const article = document.createElement('article');
        article.className = `sticky-note ${noteClasses[i % noteClasses.length]}`;
        article.style.setProperty('--rot', `${(i % 2 ? -1 : 1) * (2 + (i % 3))}deg`);
        const author=document.createElement('b');author.textContent=note.name||'Anónimo';const body=document.createElement('p');body.textContent=note.message;const date=document.createElement('span');date.textContent=note.time;article.append(author,body,date);
        noteBoard.appendChild(article);
      });
    };
    noteForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = noteName.value.trim().slice(0,20);
      const message = noteMessage.value.trim().slice(0,95);
      if (!message) return;
      notes.unshift({name: name || 'Anónimo', message, time: nowStamp()});
      notes = notes.slice(0, 12);
      saveNotes();
      renderNotes();
      noteMessage.value = '';
      if (!name) noteName.value = '';
    });
    clearNotes.addEventListener('click', () => {
      notes = [];
      saveNotes();
      renderNotes();
    });
    renderNotes();
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
