import { json, ladeListe, speichereListe, erneuere } from '../../server/merk.js';

// Nur lesen, ohne Zugangsschlüssel: zeigt nur Einträge, die Kevin ausdrücklich auf „Öffentlich“ gestellt hat und nur Titel, Bild, Medium, Termine.
export async function onRequestGet({ env }) {
  const liste = await ladeListe(env);
  if (await erneuere(env, liste)) await speichereListe(env, liste);
  const heute = new Date().toISOString().slice(0, 10);
  const aus = liste
    .filter((e) => e.oeffentlich === true)
    .map((e) => ({
      id: e.id, medium: e.medium, titel: e.titel, bild: e.bild || null, status: e.status || null,
      termine: (e.termine || []).filter((t) => t.datum >= heute).sort((a, b) => a.datum.localeCompare(b.datum)),
    }));
  const r = json(aus);
  r.headers.set('cache-control', 'public, max-age=300');
  return r;
}
