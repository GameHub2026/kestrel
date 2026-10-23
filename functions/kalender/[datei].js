import { erlaubt, ladeListe, speichereListe, erneuere, kalender } from '../../server/merk.js';

// Abo-Adresse für Apple Kalender: /kalender/<geheimer-schlüssel>.ics
export async function onRequestGet({ request, env, params }) {
  const token = String(params.datei || '').replace(/\.ics$/, '');
  if (!erlaubt(request, env, token)) return new Response('Nicht gefunden', { status: 404 });
  const liste = await ladeListe(env);
  if (await erneuere(env, liste)) await speichereListe(env, liste);
  return new Response(kalender(liste), {
    headers: { 'content-type': 'text/calendar; charset=utf-8', 'cache-control': 'no-store' },
  });
}
