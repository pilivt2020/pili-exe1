/* Netlify Function: claves privadas, nunca enviadas al navegador. */
const RESPONSE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=600',
};
const reply = (statusCode, data) => ({ statusCode, headers: RESPONSE_HEADERS, body: JSON.stringify(data) });
const reqJSON = async (url, opts = {}) => {
  const resp = await fetch(url, opts);
  if (!resp.ok) throw new Error(`Twitch devolvió el estado ${resp.status}`);
  return resp.json();
};
exports.handler = async function () {
  const client = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!client || !secret) return reply(503, { error: 'Falta configurar Twitch en Netlify' });
  try {
    const params = new URLSearchParams({ client_id: client, client_secret: secret, grant_type: 'client_credentials' });
    const access = await reqJSON('https://id.twitch.tv/oauth2/token', {method: 'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:params.toString()});
    const headers = { 'Client-Id': client, 'Authorization': `Bearer ${access.access_token}` };
    const users = await reqJSON('https://api.twitch.tv/helix/users?login=pili_owu', {headers});
    const user = users.data?.[0];
    if (!user) return reply(404, {error:'No se encontró el canal pili_owu'});
    const clips = await reqJSON(`https://api.twitch.tv/helix/clips?broadcaster_id=${encodeURIComponent(user.id)}&first=6`, {headers});
    return reply(200, {
      clips: (clips.data || []).map(({id,title,url,thumbnail_url,view_count,created_at})=>({id,title,url,thumbnail_url,view_count,created_at})),
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error consultando los clips de Twitch:',err);
    return reply(502,{error:'No se pudieron cargar los clips en este momento'});
  }
};
