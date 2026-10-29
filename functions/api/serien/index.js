import { json, erlaubt } from '../../../server/merk.js';
import { ladeSerien, speichereSerien, mitNeu, pruefeSerie } from '../../../server/serien.js';

// GET: alle verfolgten Serien mit Hinweisen. POST {id}: von Hand folgen (Glocke). PATCH {id, aus}: nicht mehr folgen / wieder folgen.
// POST {gesehen:true}: alle Hinweise als gesehen markieren.
export async function onRequest({ request, env }) {
  if (!erlaubt(request, env)) return json({ fehler: 'Kein Zugang' }, 401);
  const d = await ladeSerien(env);
  if (request.method === 'GET') return json({ stand: d.stand, gesehen: d.gesehen, serien: mitNeu(d) });
  const body = await request.json().catch(() => ({}));
  if (request.method === 'POST' && body.gesehen) { d.gesehen = Date.now(); await speichereSerien(env, d); return json({ ok: true }); }
  if (!/^tmdb-(tv|movie):\d+$/.test(body.id || '')) return json({ fehler: 'Ungültige ID' }, 400);
  let s = d.serien.find((x) => x.id === body.id);
  if (request.method === 'POST') {
    if (!s) { s = { id: body.id, medium: body.id.startsWith('tmdb-movie:') ? 'film' : 'serie', titel: body.titel || '', quelle: 'hand', seit: Date.now(), bekannt: {}, punkte: [] }; d.serien.push(s); }
    s.aus = false; s.behalten = true; s.ausGrund = null;
    if (!s.geprueft) {
      let archiv = [];
      try { const r = await env.ASSETS.fetch(new URL('/news-archiv.json', request.url)); if (r.ok) archiv = await r.json(); } catch {}
      try { await pruefeSerie(env, s, archiv); } catch { /* beim nächsten täglichen Lauf */ }
    }
  } else if (request.method === 'PATCH') {
    if (!s) return json({ fehler: 'Nicht gefunden' }, 404);
    s.aus = !!body.aus; // Trakt-Serien bleiben gespeichert (sonst kämen sie beim nächsten Abgleich wieder)
    // Von Hand wieder aufgenommen: nicht erneut automatisch aussortieren (z. B. beendete Serie mit Spin-off-Gerüchten)
    if (!s.aus) { s.behalten = true; s.ausGrund = null; }
  } else return json({ fehler: 'Methode nicht erlaubt' }, 405);
  await speichereSerien(env, d);
  return json({ stand: d.stand, gesehen: d.gesehen, serien: mitNeu(d) });
}
