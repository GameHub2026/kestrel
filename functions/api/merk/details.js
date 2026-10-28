import { json, erlaubt, details } from '../../../server/merk.js';

export async function onRequestGet({ request, env }) {
  if (!erlaubt(request, env)) return json({ fehler: 'Kein Zugang' }, 401);
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^(igdb|tmdb-movie|tmdb-tv):\d+$/.test(id)) return json({ fehler: 'Ungültige ID' }, 400);
  try { return json(await details(env, id)); } catch (err) { return json({ fehler: String(err.message || err) }, 502); }
}
