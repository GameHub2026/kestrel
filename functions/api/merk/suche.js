import { json, erlaubt, suche } from '../../../server/merk.js';

export async function onRequestGet({ request, env }) {
  if (!erlaubt(request, env)) return json({ fehler: 'Kein Zugang' }, 401);
  const u = new URL(request.url);
  const medium = u.searchParams.get('medium');
  const q = (u.searchParams.get('q') || '').trim().slice(0, 100);
  if (!['spiel', 'film', 'serie'].includes(medium) || q.length < 2) return json([]);
  try {
    return json(await suche(env, medium, q));
  } catch (err) {
    return json({ fehler: String(err.message || err) }, 502);
  }
}
