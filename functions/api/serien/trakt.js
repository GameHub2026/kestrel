import { json, erlaubt } from '../../../server/merk.js';
import { ladeSerien, speichereSerien, traktEinpflegen } from '../../../server/serien.js';

// Der tägliche GitHub-Lauf schickt hier die rohe Trakt-Liste (users/<name>/watched/shows) her.
export async function onRequestPost({ request, env }) {
  if (!erlaubt(request, env)) return json({ fehler: 'Kein Zugang' }, 401);
  const roh = await request.json().catch(() => null);
  if (!Array.isArray(roh)) return json({ fehler: 'Erwartet eine Liste' }, 400);
  const d = await ladeSerien(env);
  const dazu = traktEinpflegen(d, roh);
  await speichereSerien(env, d);
  return json({ dazu, gesamt: d.serien.length });
}
