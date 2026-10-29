import { erlaubt, ladeListe, speichereListe, erneuere, kalender } from '../../server/merk.js';
import { ladeSerien, serienTermine } from '../../server/serien.js';

// Abo-Adresse für Apple Kalender: /kalender/<geheimer-schlüssel>.ics
export async function onRequestGet({ request, env, params }) {
  const token = String(params.datei || '').replace(/\.ics$/, '');
  if (!erlaubt(request, env, token)) return new Response('Nicht gefunden', { status: 404 });
  const liste = await ladeListe(env);
  if (await erneuere(env, liste)) await speichereListe(env, liste);
  // Dazu die Staffelstarts aus "Meine Serien" (ohne Doppelte, wenn die Serie auch auf der Merkliste steht)
  const serien = serienTermine(await ladeSerien(env)).filter((s) => !liste.some((e) => e.id === s.id));
  return new Response(kalender([...liste, ...serien]), {
    headers: { 'content-type': 'text/calendar; charset=utf-8', 'cache-control': 'no-store' },
  });
}
