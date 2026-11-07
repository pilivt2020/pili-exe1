const { getStore } = require('@netlify/blobs');
const crypto = require('node:crypto');
const reply = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control':'no-store' }, body: JSON.stringify(body) });
const safeEqual = (a,b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa,bb);
};
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return reply(405,{error:'Solo POST'});
  const token = process.env.KOFI_VERIFICATION_TOKEN;
  if (!token) return reply(503,{error:'Falta KOFI_VERIFICATION_TOKEN en Netlify'});
  try {
    // Ko-fi envía formulario application/x-www-form-urlencoded con campo `data` (JSON).
    const form = new URLSearchParams(event.isBase64Encoded ? Buffer.from(event.body,'base64').toString('utf8') : (event.body || ''));
    const payload = JSON.parse(form.get('data') || '{}');
    if (!safeEqual(payload.verification_token,token)) return reply(401,{error:'Webhook no autorizado'});
    // Solo aportes puntuales: nunca contar pedidos de tienda ni pruebas en el tarro real.
    if (payload.type !== 'Donation') return reply(200,{ok:true,ignored:'No es una donación puntual'});
    if (payload.is_test === true) return reply(200,{ok:true,ignored:'Evento de prueba'});
    const id = String(payload.message_id || '');
    if (!/^[a-zA-Z0-9_-]{8,140}$/.test(id)) return reply(400,{error:'Falta identificador válido'});
    const store = getStore('pili-donations');
    // Una clave por evento evita sumar dos veces reintentos de Ko-fi.
    const result = await store.setJSON(`donation-${id}`,{received_at: new Date().toISOString()}, {onlyIfNew: true});
    return reply(200,{ok:true,counted:Boolean(result.modified)});
  } catch (err) {
    console.error('Webhook Ko-fi:', err);
    return reply(500,{error:'No se pudo registrar el evento'});
  }
};
