const { getStore } = require('@netlify/blobs');
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return {statusCode:405,body:'Método no permitido'};
  try {
    const store=getStore('pili-donations');
    const {blobs}=await store.list({prefix:'donation-'});
    return {statusCode:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify({count:blobs.length,capacity:20,updated_at:new Date().toISOString()})};
  } catch(err) {
    console.error('Estado Ko-fi:',err);
    return {statusCode:503,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:'Estado de Ko-fi no disponible'})};
  }
};
