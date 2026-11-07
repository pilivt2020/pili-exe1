const {getStore,connectLambda}=require('@netlify/blobs');
const response=(statusCode,body)=>({statusCode,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'},body:JSON.stringify(body)});
const tidy=(v,max)=>typeof v==='string'?v.replace(/[<>\x00-\x1f]/g,'').trim().slice(0,max):'';
const validId=id=>typeof id==='string' && /^[a-f0-9-]{36}$/.test(id);
const blocked=/\b(?:https?:\/\/|www\.|discord\.gg\/|t\.me\/)/i;
exports.handler=async(event)=>{
  if(!['GET','POST'].includes(event.httpMethod))return response(405,{error:'Método no permitido'});
  try{
    connectLambda(event);
    const store=getStore('pili-public-notes');
    if(event.httpMethod==='GET'){
      const {blobs}=await store.list({prefix:'note-'});
      const entries=await Promise.all(blobs.slice(-120).map(async x=>{
        try{return await store.get(x.key,{type:'json'})}catch{return null}
      }));
      const notes=entries.filter(x=>x && typeof x.message==='string').sort((a,b)=>b.created-a.created).slice(0,36)
        .map(({name,message,created})=>({name,message,time:new Date(created).toLocaleDateString('es',{day:'2-digit',month:'short'})}));
      return response(200,{notes});
    }
    let body;
    try{body=JSON.parse(event.body||'{}')}catch{return response(400,{error:'Mensaje inválido'})}
    const name=tidy(body.name,20)||'Anónimo';
    const message=tidy(body.message,95);
    const id=body.id;
    if(!validId(id)||message.length<2)return response(400,{error:'Escribe un mensaje de al menos 2 caracteres'});
    if(blocked.test(message))return response(400,{error:'No se permiten enlaces en las notitas'});
    // Basic spam throttle; not a substitute for full moderation in public deployments.
    const rateStore=getStore('pili-public-notes-rate');
    const last=await rateStore.get('visitor-'+id,{type:'json'});
    const now=Date.now();
    if(last?.timestamp && now-last.timestamp<60000)return response(429,{error:'Una notita por minuto, porfa 💜'});
    const key=`note-${String(now).padStart(14,'0')}-${id.slice(0,8)}-${Math.random().toString(36).slice(2,8)}`;
    await store.setJSON(key,{name,message,created:now});
    await rateStore.setJSON('visitor-'+id,{timestamp:now});
    return response(201,{ok:true});
  }catch(err){console.error('PILI notas: ',err);return response(503,{error:'Las notitas no están disponibles. Revisa Functions → public-notes → Logs.'})}
};
