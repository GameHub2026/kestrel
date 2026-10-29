// Meine Serien & Filme: Serien und Filme(-reihen), die Kevin verfolgt, getrennt von der Merkliste.
// Quellen: automatisch aus dem Trakt-Verlauf (alles, was Plex dort gemeldet hat) und von Hand (Glocke).
// Einmal täglich (GitHub-Aktion → POST /api/serien/pruefen) wird jede Serie bei TMDB geprüft:
// neue Staffel angekündigt, Starttermin bekannt oder verschoben, abgesetzt/beendet, neue Trailer, News.
// Gespeichert als ein KV-Eintrag "serien": { stand, gesehen, serien: [...] }.
import { tmdb, tmdbBild } from './merk.js';
import { passt } from './news-match.js';

const TAG = 864e5;
export const ladeSerien = async (env) => (await env.MERK.get('serien', 'json')) || { stand: 0, gesehen: Date.now() - 7 * TAG, serien: [] };
export const speichereSerien = (env, d) => env.MERK.put('serien', JSON.stringify(d));

// Neu ist, was nach dem letzten "Alles gesehen" aufgetaucht ist (beim allerersten Mal: die letzte Woche).
export function mitNeu(d) {
  const g = d.gesehen || 0;
  return d.serien.map((s) => ({ ...s, punkte: (s.punkte || []).map((p) => ({ ...p, neu: Date.parse(p.datum) > g })) }));
}
export const neuAnzahl = (d) => mitNeu(d).filter((s) => !s.aus).reduce((n, s) => n + s.punkte.filter((p) => p.neu).length, 0);

// ---------- Trakt: gesehene Serien ----------
async function traktSerien(env) {
  if (!env.TRAKT_CLIENT_ID || !env.TRAKT_USER) return [];
  const holen = () => fetch(`https://api.trakt.tv/users/${encodeURIComponent(env.TRAKT_USER.replace(/^@/, ''))}/watched/shows?extended=noseasons`, {
    headers: { 'trakt-api-version': '2', 'trakt-api-key': env.TRAKT_CLIENT_ID, 'content-type': 'application/json', 'user-agent': 'Kestrel/1.0 (+https://kestrel-2tf.pages.dev)' },
  });
  let r = await holen();
  // Trakt bremst bei zu vielen Anfragen (429): kurz warten, einmal neu versuchen
  if (r.status === 429) {
    await new Promise((ok) => setTimeout(ok, Math.min(8, Number(r.headers.get('retry-after')) || 3) * 1000));
    r = await holen();
  }
  if (!r.ok) throw new Error(`Trakt ${r.status}`);
  return (await r.json()).filter((x) => x.show?.ids?.tmdb && x.plays >= 2) // eine einzelne angeklickte Folge zählt nicht
    .map((x) => ({ id: `tmdb-tv:${x.show.ids.tmdb}`, titel: x.show.title, zuletzt: x.last_watched_at }));
}

export async function traktAbgleich(env, d) {
  const neu = await traktSerien(env);
  let dazu = 0;
  for (const t of neu) {
    const s = d.serien.find((x) => x.id === t.id);
    if (s) { s.zuletzt = t.zuletzt; continue; }
    d.serien.push({ id: t.id, titel: t.titel, quelle: 'trakt', seit: Date.now(), zuletzt: t.zuletzt, bekannt: {}, punkte: [] });
    dazu++;
  }
  return dazu;
}

// ---------- Prüfung einer Serie ----------
const datumDe = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const STATUS = { 'Ended': 'Beendet', 'Canceled': 'Abgesetzt', 'Returning Series': 'Läuft weiter', 'In Production': 'In Produktion', 'Planned': 'Geplant' };

// ---------- Filme: der Film selbst und seine Reihe (neue Teile, Kinostarts, Trailer, News) ----------
const kinoDE = (m) => {
  const de = m.release_dates?.results?.find((x) => x.iso_3166_1 === 'DE')?.release_dates || [];
  const kino = de.find((x) => x.type === 3) || de.find((x) => x.type === 2) || de.find((x) => x.type === 4);
  return (kino?.release_date || m.release_date || '').slice(0, 10) || null;
};
const trailerVon = (m, vorsatz = '') => (m.videos?.results || []).filter((x) => x.site === 'YouTube' && /Trailer|Teaser/.test(x.type)).slice(0, 4).map((v) => ({
  art: 'trailer', titel: `${vorsatz}${v.name || v.type}`, link: `https://www.youtube.com/watch?v=${v.key}`, quelle: v.iso_639_1 === 'de' ? 'YouTube (deutsch)' : 'YouTube', datum: v.published_at,
}));
async function pruefeFilm(env, s, archiv) {
  const extra = { append_to_response: 'videos,release_dates', include_video_language: 'de,en,null' };
  const m = await tmdb(env, `/movie/${Number(s.id.split(':')[1])}`, extra);
  const jetzt = new Date().toISOString();
  const heute = jetzt.slice(0, 10);
  const b = s.bekannt || (s.bekannt = {});
  const erstmals = (key) => (b[key] ||= jetzt);
  s.medium = 'film';
  s.titel = m.title || s.titel;
  s.original = m.original_title;
  s.bild = tmdbBild(m.poster_path);
  s.reihe = m.belongs_to_collection?.name || null;
  const punkte = [...trailerVon(m)];
  const namen = [m.title, m.original_title];
  const kommend = [];
  const start = kinoDE(m);
  if (!start || start >= heute) kommend.push({ id: m.id, titel: m.title, datum: start, selbst: true });
  // Reihe: alle späteren bzw. noch nicht erschienenen Teile
  if (m.belongs_to_collection) {
    try {
      const c = await tmdb(env, `/collection/${m.belongs_to_collection.id}`);
      namen.push(c.name?.replace(/\s*[-–]?\s*(Filmreihe|Collection|Reihe)$/i, ''));
      for (const t of c.parts || []) {
        if (t.id === m.id || (t.release_date && t.release_date < heute)) continue;
        kommend.push({ id: t.id, titel: t.title, datum: t.release_date || null });
        namen.push(t.title, t.original_title);
      }
    } catch { /* Reihe gerade nicht abrufbar */ }
  }
  // Kommende Teile: DE-Termin und Trailer nachladen (höchstens zwei, wegen der Anfrage-Grenzen)
  kommend.sort((a, z) => (a.datum || '9999').localeCompare(z.datum || '9999'));
  for (const t of kommend.filter((x) => !x.selbst).slice(0, 2)) {
    try { const tm = await tmdb(env, `/movie/${t.id}`, extra); t.datum = kinoDE(tm) || t.datum; punkte.push(...trailerVon(tm, `${tm.title}: `)); } catch {}
  }
  s.naechste = null;
  for (const t of kommend.sort((a, z) => (a.datum || '9999').localeCompare(z.datum || '9999'))) {
    if (t.datum && t.datum >= heute) {
      punkte.push({ art: 'staffel', titel: `${t.selbst ? 'Kinostart' : `Neuer Teil: ${t.titel}`} am ${datumDe(t.datum)}`, datum: erstmals(`f${t.id}:${t.datum}`), termin: t.datum });
      if (!s.naechste) s.naechste = { text: t.selbst ? 'Kinostart' : t.titel, datum: t.datum };
    } else if (!t.datum && !t.selbst) {
      punkte.push({ art: 'staffel', titel: `Neuer Teil angekündigt: ${t.titel}, Termin noch offen`, datum: erstmals(`f${t.id}`) });
      if (!s.naechste) s.naechste = { text: t.titel, datum: null };
    }
  }
  s.status = s.naechste ? (s.reihe ? 'Reihe geht weiter' : 'Kommt bald') : s.reihe ? `Reihe: ${s.reihe}` : 'Erschienen';
  const nm = [...new Set(namen.filter(Boolean))];
  for (const n of archiv.filter((x) => (x.art || 'film') === 'film' && passt(nm, x.titel)).slice(0, 6)) punkte.push({ art: 'news', titel: n.titel, link: n.link, quelle: n.quelle, datum: n.datum });
  s.punkte = punkte.sort((a, z) => String(z.datum).localeCompare(String(a.datum))).slice(0, 14);
  s.geprueft = Date.now();
}

export async function pruefeSerie(env, s, archiv) {
  if (s.id.startsWith('tmdb-movie:')) return pruefeFilm(env, s, archiv);
  const d = await tmdb(env, `/tv/${Number(s.id.split(':')[1])}`, { append_to_response: 'videos', include_video_language: 'de,en,null' });
  const jetzt = new Date().toISOString();
  const heute = jetzt.slice(0, 10);
  const b = s.bekannt || (s.bekannt = {});
  const erstmals = (key) => (b[key] ||= jetzt); // Zeitpunkt, an dem wir etwas zum ersten Mal gesehen haben
  s.titel = d.name || s.titel;
  s.original = d.original_name;
  s.bild = tmdbBild(d.poster_path);
  s.status = STATUS[d.status] || d.status;
  s.anbieter = (d.networks || []).map((n) => n.name).slice(0, 2);
  const punkte = [];

  // Kommende Staffeln: angekündigt (ohne Termin) oder mit Starttermin; ein verschobener Termin ist wieder neu
  const gelaufen = Math.max(0, ...(d.seasons || []).filter((x) => x.season_number > 0 && x.air_date && x.air_date < heute).map((x) => x.season_number));
  s.naechste = null;
  for (const st of (d.seasons || []).filter((x) => x.season_number > gelaufen)) {
    const n = st.season_number;
    if (st.air_date && st.air_date >= heute) {
      punkte.push({ art: 'staffel', titel: `Staffel ${n} startet am ${datumDe(st.air_date)}`, datum: erstmals(`s${n}:${st.air_date}`), termin: st.air_date });
      if (!s.naechste) s.naechste = { staffel: n, text: `Staffel ${n}`, datum: st.air_date };
    } else if (!st.air_date) {
      punkte.push({ art: 'staffel', titel: `Staffel ${n} angekündigt, Termin noch offen`, datum: erstmals(`s${n}`) });
      if (!s.naechste) s.naechste = { staffel: n, text: `Staffel ${n}`, datum: null };
    }
  }
  // Läuft gerade eine Staffel, steht die nächste Folge als Info dabei (nicht als Hinweis, sonst jede Woche)
  s.naechsteFolge = d.next_episode_to_air?.air_date ? { datum: d.next_episode_to_air.air_date, text: `S${d.next_episode_to_air.season_number}E${d.next_episode_to_air.episode_number}` } : null;

  // Status gewechselt (z. B. abgesetzt)
  if (b.status && b.status !== d.status && ['Ended', 'Canceled'].includes(d.status)) b[`status:${d.status}`] = jetzt;
  b.status = d.status;
  for (const k of Object.keys(b).filter((k) => k.startsWith('status:'))) punkte.push({ art: 'status', titel: k.endsWith('Canceled') ? 'Die Serie wurde abgesetzt' : 'Die Serie ist beendet', datum: b[k] });

  // Trailer und Teaser
  for (const v of (d.videos?.results || []).filter((x) => x.site === 'YouTube' && /Trailer|Teaser/.test(x.type)).slice(0, 6)) {
    punkte.push({ art: 'trailer', titel: v.name || v.type, link: `https://www.youtube.com/watch?v=${v.key}`, quelle: v.iso_639_1 === 'de' ? 'YouTube (deutsch)' : 'YouTube', datum: v.published_at });
  }
  // News der Film-/Serien-Redaktionen
  const namen = [...new Set([d.name, d.original_name].filter(Boolean))];
  for (const n of archiv.filter((x) => (x.art || 'film') === 'film' && passt(namen, x.titel)).slice(0, 6)) {
    punkte.push({ art: 'news', titel: n.titel, link: n.link, quelle: n.quelle, datum: n.datum });
  }
  s.punkte = punkte.sort((a, z) => String(z.datum).localeCompare(String(a.datum))).slice(0, 14);
  s.geprueft = Date.now();
}

// Einen Teil der Serien prüfen (je Aufruf höchstens `anzahl`, wegen der Anfrage-Grenzen von Cloudflare).
export async function pruefeTeil(env, d, archiv, ab, anzahl = 25) {
  const aktiv = d.serien.filter((s) => !s.aus);
  const teil = aktiv.slice(ab, ab + anzahl);
  const fehler = [];
  for (const s of teil) { try { await pruefeSerie(env, s, archiv); } catch (e) { fehler.push(`${s.titel}: ${e.message}`); } }
  return { weiter: ab + anzahl < aktiv.length ? ab + anzahl : null, geprueft: teil.length, gesamt: aktiv.length, fehler };
}

// Für den Kalender: Staffelstarts aller verfolgten Serien
export const serienTermine = (d) => d.serien.filter((s) => !s.aus && s.naechste?.datum)
  .map((s) => ({ id: s.id, medium: s.medium || 'serie', titel: s.titel, kalender: true,
    termine: [{ datum: s.naechste.datum, text: s.medium === 'film' ? (s.naechste.text === 'Kinostart' ? 'Kinostart (DE)' : `Neuer Teil: ${s.naechste.text}`) : `${s.naechste.text || `Staffel ${s.naechste.staffel}`} startet` }] }));
