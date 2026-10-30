import { json, erlaubt } from '../../../server/merk.js';
import { ladeSerien, neuAnzahl, mitNeu, pruefbar } from '../../../server/serien.js';

// Zahl der neuen Hinweise für die Leiste (Punkt + Zahl bei "Ich folge"). Auge und Glocke sind zusammengelegt,
// alles Neue kommt jetzt aus "Ich folge". Mit ?liste=1 zusätzlich die neuesten Meldungen für die Toasts beim Seitenstart.
export async function onRequest({ request, env }) {
  if (!erlaubt(request, env)) return json({ fehler: 'Kein Zugang' }, 401);
  const d = await ladeSerien(env);
  const n = neuAnzahl(d);
  const antwort = { anzahl: n, merk: 0, serien: n };
  if (new URL(request.url).searchParams.get('liste')) {
    const doppelt = new Set();
    const termin = (p) => (['staffel', 'ableger'].includes(p.art) ? 0 : 1);
    antwort.liste = mitNeu(d).filter(pruefbar)
      .flatMap((s) => s.punkte.filter((p) => p.neu).map((p) => ({ art: p.art, titel: p.titel, link: p.link || '', quelle: p.quelle || '', datum: p.datum, serie: s.titel, medium: s.medium || 'serie' })))
      .filter((x) => { const k = x.link || x.titel; if (doppelt.has(k)) return false; doppelt.add(k); return true; })
      .sort((a, b) => termin(a) - termin(b) || String(b.datum).localeCompare(String(a.datum)))
      .slice(0, 8);
  }
  return json(antwort);
}
