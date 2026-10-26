// "Gerade dabei": liest Kevins öffentliches Trakt-Profil (nur lesen, nur mit Client-ID) und holt
// deutsche Titel und Poster von TMDB. Ergebnis 5 Minuten im KV-Speicher, damit die APIs geschont werden.
import { tmdb, tmdbBild } from './merk.js';

const TTL = 300;

async function trakt(env, pfad) {
  const r = await fetch(`https://api.trakt.tv/users/${env.TRAKT_USER}${pfad}`, {
    headers: { 'trakt-api-key': env.TRAKT_CLIENT_ID, 'trakt-api-version': '2', 'user-agent': 'Kestrel/1.0 (kestrel-2tf.pages.dev)', accept: 'application/json' },
  });
  if (r.status === 204) return null;
  if (!r.ok) throw new Error(`Trakt ${r.status}`);
  return r.json();
}

// Deutscher Titel und Poster, 30 Tage gemerkt.
async function info(env, art, id) {
  if (!id) return {};
  const key = `tmdbinfo:${art}:${id}`;
  const hit = await env.MERK.get(key, 'json');
  if (hit) return hit;
  try {
    const d = await tmdb(env, `/${art}/${Number(id)}`);
    const v = { titel: art === 'tv' ? d.name : d.title, bild: tmdbBild(d.poster_path) };
    await env.MERK.put(key, JSON.stringify(v), { expirationTtl: 30 * 86400 });
    return v;
  } catch { return {}; }
}

export async function gerade(env) {
  if (!env.TRAKT_CLIENT_ID || !env.TRAKT_USER) return { laeuft: null, zuletzt: [] };
  const gecacht = await env.MERK.get('trakt-gerade', 'json');
  if (gecacht) return gecacht;

  const [jetzt, verlauf] = await Promise.all([trakt(env, '/watching'), trakt(env, '/history?limit=40')]);

  const eintrag = async (typ, x, ep, wann) => {
    const basis = typ === 'episode' ? x : x; // x = show bzw. movie
    const i = await info(env, typ === 'episode' ? 'tv' : 'movie', basis.ids?.tmdb);
    return {
      medium: typ === 'episode' ? 'serie' : 'film',
      titel: i.titel || basis.title, bild: i.bild || null,
      folge: ep ? { staffel: ep.season, nr: ep.number } : null,
      wann,
    };
  };

  let laeuft = null;
  if (jetzt && (jetzt.type === 'episode' || jetzt.type === 'movie')) {
    laeuft = await eintrag(jetzt.type, jetzt.type === 'episode' ? jetzt.show : jetzt.movie, jetzt.episode, jetzt.started_at);
  }

  // Zuletzt gesehen: pro Serie nur die jüngste Folge, Filme einzeln, höchstens 8.
  const gesehen = new Set();
  const zuletzt = [];
  for (const e of verlauf || []) {
    const x = e.type === 'episode' ? e.show : e.type === 'movie' ? e.movie : null;
    if (!x) continue;
    const k = `${e.type}:${x.ids?.trakt}`;
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    zuletzt.push(eintrag(e.type, x, e.episode, e.watched_at));
    if (zuletzt.length >= 8) break;
  }
  const ergebnis = { laeuft, zuletzt: await Promise.all(zuletzt), stand: new Date().toISOString() };
  await env.MERK.put('trakt-gerade', JSON.stringify(ergebnis), { expirationTtl: TTL });
  return ergebnis;
}
