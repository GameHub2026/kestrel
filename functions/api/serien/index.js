import { json, erlaubt, ladeListe, speichereListe } from '../../../server/merk.js';
import { ladeSerien, speichereSerien, mitNeu, pruefeSerie, wikidataVerwandte } from '../../../server/serien.js';

// "Ich folge": GET alle mit Hinweisen. POST {id, titel}: folgen (Serie, Film oder Spiel). PATCH {id, aus}: nicht mehr / wieder folgen.
// POST {gesehen:true}: alle Hinweise als gesehen markieren.
const ID = /^(tmdb-tv|tmdb-movie|igdb):\d+$/;
const mediumVon = (id) => (id.startsWith('igdb:') ? 'spiel' : id.startsWith('tmdb-movie:') ? 'film' : 'serie');

export async function onRequest({ request, env }) {
  if (!erlaubt(request, env)) return json({ fehler: 'Kein Zugang' }, 401);
  const d = await ladeSerien(env);
  // Einmalig: früher mit dem Auge beobachtete Merkliste-Einträge übernehmen (Auge und Glocke sind jetzt eins)
  const liste = await ladeListe(env);
  const alteAugen = liste.filter((e) => e.beobachten);
  if (alteAugen.length) {
    for (const e of alteAugen) {
      if (!d.serien.some((x) => x.id === e.id)) d.serien.push({ id: e.id, medium: e.medium, titel: e.titel, bild: e.bild, quelle: 'hand', behalten: true, seit: Date.now(), bekannt: {}, punkte: [] });
      delete e.beobachten; delete e.gesehen;
    }
    await speichereListe(env, liste); await speichereSerien(env, d);
  }
  if (request.method === 'GET') return json({ stand: d.stand, gesehen: d.gesehen, serien: mitNeu(d) });

  const body = await request.json().catch(() => ({}));
  if (request.method === 'POST' && body.gesehen) { d.gesehen = Date.now(); await speichereSerien(env, d); return json({ ok: true }); }
  if (!ID.test(body.id || '')) return json({ fehler: 'Ungültige ID' }, 400);
  let s = d.serien.find((x) => x.id === body.id);
  if (request.method === 'POST') {
    if (!s) { s = { id: body.id, medium: mediumVon(body.id), titel: body.titel || '', quelle: 'hand', seit: Date.now(), bekannt: {}, punkte: [] }; d.serien.push(s); }
    s.aus = false; s.behalten = true; s.ausGrund = null;
    let archiv = [];
    try { const r = await env.ASSETS.fetch(new URL('/news-archiv.json', request.url)); if (r.ok) archiv = await r.json(); } catch {}
    if (!s.id.startsWith('igdb:') && !s.verwandt) { try { await wikidataVerwandte([s]); } catch {} }
    try { await pruefeSerie(env, s, archiv); } catch { /* beim nächsten Lauf */ }
  } else if (request.method === 'PATCH') {
    if (!s) return json({ fehler: 'Nicht gefunden' }, 404);
    s.aus = !!body.aus;
    if (s.aus) s.ausGrund = null; // von Hand entfolgt: auch keine Ableger mehr
    else { s.behalten = true; s.ausGrund = null; }
  } else return json({ fehler: 'Methode nicht erlaubt' }, 405);
  await speichereSerien(env, d);
  return json({ stand: d.stand, gesehen: d.gesehen, serien: mitNeu(d) });
}
