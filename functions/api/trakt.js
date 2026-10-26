import { json } from '../../server/merk.js';
import { gerade } from '../../server/trakt.js';

// Öffentlich, nur lesen: was Kevin gerade schaut und zuletzt gesehen hat.
export async function onRequestGet({ env }) {
  try {
    const r = json(await gerade(env));
    r.headers.set('cache-control', 'public, max-age=120');
    return r;
  } catch (err) {
    return json({ laeuft: null, zuletzt: [], fehler: String(err.message || err) }, 502);
  }
}
