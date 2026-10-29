import { json, erlaubt } from '../../../server/merk.js';
import { ladeSerien, neuAnzahl } from '../../../server/serien.js';

// Zahl der neuen Hinweise für die Leiste (Punkt + Zahl bei "Ich folge"). Auge und Glocke sind zusammengelegt,
// alles Neue kommt jetzt aus "Ich folge".
export async function onRequest({ request, env }) {
  if (!erlaubt(request, env)) return json({ fehler: 'Kein Zugang' }, 401);
  const n = neuAnzahl(await ladeSerien(env));
  return json({ anzahl: n, merk: 0, serien: n });
}
