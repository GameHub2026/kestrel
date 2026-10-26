import { json, erlaubt, ladeListe, speichereListe, erneuere, holeTermine } from '../../../server/merk.js';

export async function onRequest({ request, env }) {
  if (!erlaubt(request, env)) return json({ fehler: 'Kein Zugang' }, 401);
  const liste = await ladeListe(env);

  if (request.method === 'GET') {
    const alle = new URL(request.url).searchParams.get('erneuern') === 'alle';
    if (await erneuere(env, liste, alle)) await speichereListe(env, liste);
    return json(liste);
  }

  const body = request.method === 'DELETE' ? {} : await request.json().catch(() => ({}));
  const id = body.id || new URL(request.url).searchParams.get('id');
  if (!id || !/^(igdb|tmdb-movie|tmdb-tv):\d+$/.test(id)) return json({ fehler: 'Ungültige ID' }, 400);

  if (request.method === 'POST') {
    if (!['spiel', 'film', 'serie'].includes(body.medium)) return json({ fehler: 'Ungültiges Medium' }, 400);
    if (!liste.some((e) => e.id === id)) {
      const daten = await holeTermine(env, id);
      liste.push({ id, medium: body.medium, kalender: true, hinzugefuegt: Date.now(), aktualisiert: Date.now(), ...daten });
      await speichereListe(env, liste);
    }
    return json(liste);
  }
  if (request.method === 'PATCH') {
    const e = liste.find((x) => x.id === id);
    if (e) {
      if ('kalender' in body) e.kalender = !!body.kalender;
      if ('oeffentlich' in body) e.oeffentlich = !!body.oeffentlich;
      await speichereListe(env, liste);
    }
    return json(liste);
  }
  if (request.method === 'DELETE') {
    await speichereListe(env, liste.filter((x) => x.id !== id));
    return json(await ladeListe(env));
  }
  return json({ fehler: 'Methode nicht erlaubt' }, 405);
}
