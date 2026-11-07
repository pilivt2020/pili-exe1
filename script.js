const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
}));


/* Obtiene los clips de la función segura de Netlify cuando se publique el sitio. */
(() => {
  const grid = document.getElementById('twitch-clips');
  const message = document.getElementById('clips-message');
  const button = document.getElementById('refresh-clips');
  if (!grid || !message || !button) return;
  const channel = 'https://www.twitch.tv/pili_owu/clips';
  const clipsFallback = (reason) => {
    grid.setAttribute('aria-busy', 'false');
    grid.innerHTML = '';
    const item = document.createElement('div');
    item.className = 'clip-placeholder';
    item.style.gridColumn = '1 / -1';
    const icon = document.createElement('span'); icon.className = 'clip-placeholder-icon'; icon.textContent = '✳';
    const title = document.createElement('h3'); title.textContent = 'CLIPS EN PREPARACIÓN';
    const desc = document.createElement('p'); desc.textContent = 'Mientras tanto, puedes ver los mejores momentos directamente en mi Twitch.';
    item.append(icon,title,desc); grid.append(item);
    message.textContent = reason;
  };
  const formatViews = (views) => `${new Intl.NumberFormat('es').format(views)} vistas`;
  const createClip = (clip) => {
    const card = document.createElement('article'); card.className = 'clip-card';
    const poster = document.createElement('a'); poster.className = 'clip-poster';
    poster.href = clip.url; poster.target = '_blank'; poster.rel = 'noopener noreferrer';
    poster.setAttribute('aria-label', `Ver clip: ${clip.title}`);
    const image = document.createElement('img'); image.src = clip.thumbnail_url;
    image.alt = `Miniatura del clip ${clip.title}`; image.loading = 'lazy';
    const play = document.createElement('span'); play.className = 'clip-play'; play.textContent = '▶'; play.setAttribute('aria-hidden','true');
    const count = document.createElement('span'); count.className = 'clip-count'; count.textContent = formatViews(clip.view_count);
    poster.append(image,play,count);
    const info = document.createElement('div'); info.className = 'clip-info';
    const title = document.createElement('h3'); title.textContent = clip.title;
    const meta = document.createElement('p'); meta.className = 'clip-meta';
    meta.textContent = clip.created_at ? new Date(clip.created_at).toLocaleDateString('es', {year:'numeric',month:'short',day:'numeric'}) : 'Uno de mis momentazos';
    const link = document.createElement('a'); link.className = 'clip-open'; link.textContent = 'VER EN TWITCH ↗';
    link.href = clip.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    info.append(title,meta,link); card.append(poster,info); return card;
  };
  const loadClips = async () => {
    button.disabled = true;
    message.textContent = 'Buscando los clips más vistos de Pili…';
    try {
      if (location.protocol === 'file:') {
        clipsFallback('Vista local: la actualización automática se activará cuando publiques la web y configures Twitch en Netlify.');
        return;
      }
      const response = await fetch('/.netlify/functions/twitch-clips', {cache:'no-store'});
      if (!response.ok) throw new Error('API no configurada');
      const data = await response.json();
      if (!Array.isArray(data.clips) || !data.clips.length) {
        clipsFallback('Todavía no hay clips disponibles para mostrar. Puedes visitar el canal directamente.');
        return;
      }
      grid.replaceChildren(...data.clips.map(createClip));
      grid.setAttribute('aria-busy', 'false');
      const updated = data.updated_at ? new Date(data.updated_at).toLocaleString('es') : 'ahora';
      message.textContent = `Ordenados por visualizaciones · Actualizado: ${updated} · Se revisan nuevamente al abrir o recargar la página.`;
    } catch (error) {
      clipsFallback('Para que aparezcan automáticamente, hay que publicar el sitio en Netlify y conectar las credenciales de la API de Twitch.');
    } finally { button.disabled = false; }
  };
  button.addEventListener('click', loadClips);
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){loadClips();io.disconnect()}},{rootMargin:'350px'});io.observe(grid)}else loadClips();
})();


// Música local: no intenta reproducirse automáticamente sin permiso.
(() => {
  const audio = document.getElementById('pili-music');
  const toggle = document.getElementById('music-toggle');
  const volume = document.getElementById('music-volume');
  const fill = document.getElementById('music-progress-fill');
  const time = document.getElementById('music-time');
  const duration = document.getElementById('music-duration');
  const status = document.getElementById('music-status');
  const player = document.querySelector('.music-player');
  if (!audio || !toggle || !player) return;
  const format = (s) => `${Math.floor((s || 0) / 60)}:${String(Math.floor((s || 0) % 60)).padStart(2, '0')}`;
  audio.volume = Number(volume.value) / 100;
  audio.loop = true;
  toggle.addEventListener('click', async () => {
    if (!audio.paused) { audio.pause(); return; }
    try { await audio.play(); status.textContent = '¡Que suene la música! ♡'; }
    catch { status.textContent = 'Tu navegador no permitió reproducir el archivo. Prueba otra vez.'; }
  });
  volume.addEventListener('input', () => { audio.volume = Number(volume.value) / 100; });
  audio.addEventListener('play', () => {
    player.classList.add('is-playing');
    toggle.textContent = 'Ⅱ PAUSAR';
    toggle.setAttribute('aria-label', 'Pausar música');
    toggle.setAttribute('aria-pressed', 'true');
  });
  audio.addEventListener('pause', () => {
    player.classList.remove('is-playing');
    toggle.textContent = '▶ REPRODUCIR';
    toggle.setAttribute('aria-label', 'Reproducir música');
    toggle.setAttribute('aria-pressed', 'false');
  });
  audio.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(audio.duration)) duration.textContent = format(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    time.textContent = format(audio.currentTime);
    if (Number.isFinite(audio.duration) && audio.duration > 0) fill.style.width = `${100 * audio.currentTime / audio.duration}%`;
  });
  audio.addEventListener('error', () => { status.textContent = 'No pude cargar la música. Verifica que la carpeta assets esté junto al HTML.'; });
})();


// Ko-fi: solo eventos confirmados por el servidor suman monedas.
(() => {
  const money=document.getElementById('jar-money'), progress=document.getElementById('jar-progress-fill');
  const status=document.getElementById('donation-status'), counter=document.getElementById('donation-counter');
  const pctLabel=document.getElementById('donation-fill-text'), burst=document.getElementById('kofi-burst');
  if(!money||!progress||!status||!counter||!pctLabel)return;
  let previous=null;
  const celebrate=()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    for(let i=0;i<16;i++){
      const p=document.createElement('span');p.className='kofi-particle';p.textContent=i%2?'✦':'●';
      p.style.setProperty('--dx',`${Math.random()*270-135}px`);p.style.setProperty('--dy',`${Math.random()*-220-25}px`);
      burst.appendChild(p);p.addEventListener('animationend',()=>p.remove(),{once:true});
    }
  };
  async function sync(){
    try{
      const response=await fetch('/.netlify/functions/kofi-status',{cache:'no-store'});
      if(!response.ok)throw new Error('No disponible');
      const data=await response.json();
      const count=Math.max(0,Number(data.count)||0), capacity=20;
      const pct=Math.min(100,Math.round(count/capacity*100));
      money.style.height=`${pct}%`; progress.style.width=`${pct}%`;
      counter.textContent=`${count} ${count===1?'aporte confirmado':'aportes confirmados'}`;
      pctLabel.textContent=`${Math.min(count,capacity)} / ${capacity}`;
      if(previous!==null && count>previous){celebrate();status.textContent='¡Entró un nuevo apoyo! Gracias por ayudar a Pili ♡';}
      else status.textContent=count?'¡Gracias por apoyar a esta mapachita! 💚':'Esperando el primer apoyo confirmado por Ko-fi ♡';
      previous=count;
    } catch {
      status.textContent='El tarro se activará al configurar el webhook y el almacenamiento de Netlify.';
      counter.textContent='Conexión pendiente';pctLabel.textContent='—';
    }
  }
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){sync();io.disconnect()}},{rootMargin:'350px'});io.observe(status)}else sync();
  setInterval(()=>{if(!document.hidden && Math.abs(document.getElementById('apoyame')?.getBoundingClientRect().top||99999)<innerHeight*2)sync()},60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
})();

// Ranking de clics compartido: no persiste solo en el navegador.
(() => {
  const nameInput=document.getElementById('player-name'), save=document.getElementById('save-player');
  const target=document.getElementById('click-target'),score=document.getElementById('my-clicks');
  const message=document.getElementById('clickgame-message'),ranking=document.getElementById('ranking-list');
  const refresh=document.getElementById('refresh-ranking');
  if(!nameInput||!save||!target||!ranking)return;
  const api='/.netlify/functions/click-ranking';
  let id=localStorage.getItem('pili_click_id');
  if(!id){id=crypto.randomUUID();localStorage.setItem('pili_click_id',id)}
  const cached=localStorage.getItem('pili_click_name')||'';
  nameInput.value=cached;
  const send=async (action)=>{
    const r=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,id,name:nameInput.value.trim()})});
    const data=await r.json();if(!r.ok)throw Error(data.error||'No se pudo guardar');return data;
  };
  const load=async()=>{
    try{
      const r=await fetch(api,{cache:'no-store'}),data=await r.json();
      if(!r.ok)throw Error();
      ranking.replaceChildren();
      if(!data.ranking?.length){const li=document.createElement('li');li.textContent='¡Todavía no hay jugadores!';ranking.appendChild(li);return}
      data.ranking.forEach(({name,score:points},i)=>{
        const li=document.createElement('li');li.append(document.createTextNode(`${i+1}. ${name}`));
        const strong=document.createElement('strong');strong.textContent=`${points} clics`;li.appendChild(strong);ranking.appendChild(li);
      });
    }catch{ranking.replaceChildren();const li=document.createElement('li');li.textContent='Ranking pendiente de conexión.';ranking.appendChild(li)}
  };
  save.addEventListener('click',async()=>{
    save.disabled=true;message.textContent='Conectando con el ranking mundial…';
    try{const d=await send('register');score.textContent=d.score;nameInput.value=d.name;
      localStorage.setItem('pili_click_name',d.name);target.disabled=false;nameInput.disabled=true;
      message.textContent=`¡Listo, ${d.name}! Ya puedes empezar a picarle. 💚`;load();
    }catch(e){target.disabled=true;message.textContent=e.message+' — si sigue, revisa Functions → click-ranking → Logs.'}finally{save.disabled=false}
  });
  let busy=false;
  target.addEventListener('click',async()=>{
    if(busy)return;busy=true;target.disabled=true;
    try{const d=await send('click');score.textContent=d.score;message.textContent='¡Uno más para el top! ♡';load()}
    catch(e){message.textContent=e.message}
    finally{setTimeout(()=>{busy=false;target.disabled=false},780)}
  });
  refresh.addEventListener('click',load);
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){load();io.disconnect()}},{rootMargin:'350px'});io.observe(ranking)}else load();
  if(cached)save.click();
})();
