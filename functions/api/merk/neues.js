import { json, erlaubt, ladeListe, speichereListe, neues } from '../../../server/merk.js';

// GET: Neues zu beobachteten Einträgen (?anzahl=1 liefert nur die Zahl). POST: alles als gesehen markieren.
export async function onRequest({ request, env }) {
  if (!erlaubt(request, env)) return json({ fehler: 'Kein Zugang' }, 401);
  const liste = await ladeListe(env);
  if (request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const jetzt = Date.now();
    for (const e of liste) if (e.beobachten && (!body.id || e.id === body.id)) e.gesehen = jetzt;
    await speichereListe(env, liste);
    return json({ ok: true });
  }
  let archiv = [];
  try {
    const r = await env.ASSETS.fetch(new URL('/news-archiv.json', request.url));
    if (r.ok) archiv = await r.json();
  } catch { /* ohne News, nur Trailer */ }
  const daten = await neues(env, liste, archiv);
  if (new URL(request.url).searchParams.get('anzahl')) return json({ anzahl: daten.reduce((s, e) => s + e.punkte.filter((p) => p.neu).length, 0) });
  return json(daten);
}
