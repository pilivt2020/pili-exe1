const { getStore, connectLambda } = require('@netlify/blobs');
const json=(statusCode,body)=>({statusCode,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(body)});
const validId=v=>typeof v==='string' && /^[a-f0-9-]{36}$/.test(v);
const nameClean=v=>typeof v==='string'?v.trim().replace(/[<>\x00-\x1f]/g,'').slice(0,22):'';
const storeName='pili-clickgame';
async function loadRanking(store){
  const {blobs}=await store.list({prefix:'player-'});
  const results=await Promise.all(blobs.slice(0,1000).map(async entry=>{
    try{return await store.get(entry.key,{type:'json'});}catch{return null;}
  }));
  return results.filter(x=>x && typeof x.score==='number' && typeof x.name==='string')
    .sort((a,b)=>b.score-a.score).slice(0,10).map(({name,score})=>({name,score}));
}
exports.handler=async(event)=>{
  if(!['GET','POST'].includes(event.httpMethod))return json(405,{error:'Método no permitido'});
  let phase='conexión';
  try{
    connectLambda(event);
    const store=getStore(storeName);
    if(event.httpMethod==='GET'){
      phase='lectura del ranking';
      return json(200,{ranking:await loadRanking(store)});
    }
    phase='validación';
    let body;
    try{body=JSON.parse(event.body||'{}')}catch{return json(400,{error:'Solicitud inválida'})}
    const id=body.id,name=nameClean(body.name);
    if(!validId(id)||name.length<2)return json(400,{error:'Escribe un apodo válido de 2 a 22 caracteres'});
    const key=`player-${id}`;
    phase='leer jugador';
    const previous=await store.getWithMetadata(key,{type:'json'});
    if(body.action==='register'){
      if(previous?.data){return json(200,{score:previous.data.score,name:previous.data.name,ranking:await loadRanking(store)})}
      phase='registrar jugador';
      const created=await store.setJSON(key,{name,score:0,lastClick:0},{onlyIfNew:true});
      if(!created.modified){
        const latest=await store.get(key,{type:'json'});
        if(latest)return json(200,{score:latest.score,name:latest.name,ranking:await loadRanking(store)});
        return json(409,{error:'Intenta guardar tu apodo otra vez'});
      }
      return json(200,{score:0,name,ranking:await loadRanking(store)});
    }
    if(body.action!=='click')return json(400,{error:'Acción inválida'});
    if(!previous?.data)return json(400,{error:'Primero guarda tu apodo'});
    const now=Date.now();
    if(now-(previous.data.lastClick||0)<750)return json(429,{error:'Espera un poquito entre clics 💚'});
    const next={name:previous.data.name,score:Math.min(1000000,(previous.data.score||0)+1),lastClick:now};
    phase='guardar clic';
    const result=await store.setJSON(key,next,{onlyIfMatch:previous.etag});
    if(!result.modified)return json(409,{error:'Hubo otro clic al mismo tiempo. Intenta de nuevo.'});
    return json(200,{name:next.name,score:next.score});
  }catch(err){console.error('PILI ranking: falló '+phase,err);return json(503,{error:'Error al '+phase+'. Revisa Functions → click-ranking → Logs.'});}
};
