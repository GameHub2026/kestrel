import { json, erlaubt } from '../../../server/merk.js';
import { ladeSerien, speichereSerien, traktAbgleich, pruefeTeil } from '../../../server/serien.js';

// Täglicher Lauf (GitHub-Aktion) oder Knopf "Jetzt prüfen": POST /api/serien/pruefen?ab=0, dann ?ab=<weiter> bis weiter=null.
// Beim ersten Teil (ab=0) kommen neue Serien aus dem Trakt-Verlauf dazu.
export async function onRequestPost({ request, env }) {
  if (!erlaubt(request, env)) return json({ fehler: 'Kein Zugang' }, 401);
  const ab = Number(new URL(request.url).searchParams.get('ab') || 0);
  const d = await ladeSerien(env);
  let trakt = null;
  if (ab === 0) { try { trakt = await traktAbgleich(env, d); } catch (e) { trakt = `Fehler: ${e.message}`; } }
  let archiv = [];
  try { const r = await env.ASSETS.fetch(new URL('/news-archiv.json', request.url)); if (r.ok) archiv = await r.json(); } catch {}
  const erg = await pruefeTeil(env, d, archiv, ab);
  if (erg.weiter === null) d.stand = Date.now();
  await speichereSerien(env, d);
  return json({ ...erg, trakt });
}
