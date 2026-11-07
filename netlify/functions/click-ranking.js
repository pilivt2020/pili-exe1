const { getStore } = require('@netlify/blobs');
const reply=(statusCode,body)=>({statusCode,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(body)});
const validId=(v)=>typeof v==='string' && /^[a-f0-9-]{36}$/.test(v);
const cleanName=(name)=>typeof name==='string' ? name.trim().replace(/[<>\x00-\x1f]/g,'').slice(0,22) : '';
const loadRank=async (store)=>{
  const entries=await store.list({prefix:'player-'});
  // Ranking pequeño. Para un juego masivo, migrar a una base transaccional.
  const data=await Promise.all(entries.blobs.slice(0,1000).map(e=>store.get(e.key,{type:'json',consistency:'strong'})));
  return data.filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,10).map(({name,score})=>({name,score}));
};
exports.handler=async(event)=>{
  if(!['GET','POST'].includes(event.httpMethod))return reply(405,{error:'Método no permitido'});
  try {
    const store=getStore('pili-clickgame');
    if(event.httpMethod==='GET')return reply(200,{ranking:await loadRank(store)});
    let body;
    try{body=JSON.parse(event.body||'{}')}catch{return reply(400,{error:'Solicitud inválida'})}
    const id=body.id; const name=cleanName(body.name);
    if(!validId(id)||name.length<2||name.length>22)return reply(400,{error:'Escribe un apodo válido de 2 a 22 caracteres'});
    const key=`player-${id}`;
    const previous=await store.getWithMetadata(key,{type:'json',consistency:'strong'});
    const now=Date.now(); const last=previous?.data?.lastClick||0;
    if(body.action==='register'){
      if(previous)return reply(200,{score:previous.data.score,name:previous.data.name,ranking:await loadRank(store)});
      await store.setJSON(key,{name,score:0,lastClick:0},{onlyIfNew:true});
      return reply(200,{score:0,name,ranking:await loadRank(store)});
    }
    if(body.action!=='click')return reply(400,{error:'Acción inválida'});
    if(!previous)return reply(400,{error:'Primero guarda tu apodo'});
    if(now-last<750)return reply(429,{error:'Un clic a la vez, mapachito 💚'});
    const next={name:previous.data.name,score:Math.min(1000000,(previous.data.score||0)+1),lastClick:now};
    const result=await store.setJSON(key,next,{onlyIfMatch:previous.etag});
    if(!result.modified)return reply(409,{error:'Otro clic llegó al mismo tiempo. Intenta de nuevo.'});
    return reply(200,{score:next.score,name:next.name});
  }catch(err){console.error('Ranking:',err);return reply(503,{error:'El ranking no está disponible ahora mismo'})}
};
