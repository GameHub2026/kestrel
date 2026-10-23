// Merkliste: Suche und Termine aus IGDB (Spiele) und TMDB (Filme, Serien), gespeichert im KV-Speicher MERK.
// Termine werden beim Abruf erneuert, wenn sie älter als 12 Stunden sind. So wandern Verschiebungen
// automatisch in die Liste und in den Kalender, ohne Zeitplan-Job.

const FRISCH_MS = 12 * 3600 * 1000;
const MAX_ERNEUERN = 6; // pro Abruf, damit eine lange Liste nicht in Zeitlimits läuft

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export function erlaubt(request, env, token = request.headers.get('x-merk-token')) {
  const soll = env.MERK_TOKEN || '';
  if (!soll || !token || token.length !== soll.length) return false;
  let diff = 0;
  for (let i = 0; i < soll.length; i++) diff |= soll.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

export const ladeListe = async (env) => (await env.MERK.get('liste', 'json')) || [];
export const speichereListe = (env, liste) => env.MERK.put('liste', JSON.stringify(liste));

// ---------- IGDB (Spiele) ----------
async function igdbToken(env) {
  const gecacht = await env.MERK.get('igdb-token');
  if (gecacht) return gecacht;
  const r = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${env.IGDB_CLIENT_ID}&client_secret=${env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`, { method: 'POST' });
  if (!r.ok) throw new Error('IGDB-Anmeldung fehlgeschlagen');
  const { access_token, expires_in } = await r.json();
  await env.MERK.put('igdb-token', access_token, { expirationTtl: Math.max(60, expires_in - 3600) });
  return access_token;
}
async function igdb(env, body) {
  const r = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: { 'Client-ID': env.IGDB_CLIENT_ID, Authorization: `Bearer ${await igdbToken(env)}` },
    body,
  });
  if (!r.ok) throw new Error(`IGDB ${r.status}`);
  return r.json();
}
const igdbBild = (g) => (g.cover?.image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${g.cover.image_id}.jpg` : null);
const tag = (sek) => new Date(sek * 1000).toISOString().slice(0, 10);

async function sucheSpiel(env, q) {
  const s = q.replace(/["\\]/g, '');
  const rows = await igdb(env, `search "${s}"; fields name,first_release_date,cover.image_id,platforms.abbreviation; limit 8;`);
  return rows.map((g) => ({
    id: `igdb:${g.id}`, medium: 'spiel', titel: g.name,
    jahr: g.first_release_date ? new Date(g.first_release_date * 1000).getUTCFullYear() : null,
    info: (g.platforms || []).map((p) => p.abbreviation).filter(Boolean).slice(0, 5).join(', '),
    bild: igdbBild(g),
  }));
}
async function termineSpiel(env, id) {
  const [g] = await igdb(env, `fields name,cover.image_id,first_release_date,release_dates.date,release_dates.platform.abbreviation,release_dates.region; where id = ${Number(id)};`);
  if (!g) return null;
  // IGDB-Regionen: 1 = Europa, 8 = weltweit. Pro Datum die Plattformen sammeln.
  const proTag = new Map();
  for (const rd of g.release_dates || []) {
    if (!rd.date || ![1, 8].includes(rd.region)) continue;
    const d = tag(rd.date);
    if (!proTag.has(d)) proTag.set(d, new Set());
    if (rd.platform?.abbreviation) proTag.get(d).add(rd.platform.abbreviation);
  }
  let termine = [...proTag].map(([datum, p]) => ({ datum, text: `Release${p.size ? ` (${[...p].join(', ')})` : ''}` }));
  if (!termine.length && g.first_release_date) termine = [{ datum: tag(g.first_release_date), text: 'Release' }];
  return { titel: g.name, bild: igdbBild(g), termine, status: termine.length ? null : 'Kein Termin bekannt' };
}

// ---------- TMDB (Filme, Serien) ----------
async function tmdb(env, pfad, params = {}) {
  const key = env.TMDB_KEY || '';
  const u = new URL(`https://api.themoviedb.org/3${pfad}`);
  u.searchParams.set('language', 'de-DE');
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const headers = {};
  if (key.length > 60) headers.Authorization = `Bearer ${key}`; // Lese-Token (v4)
  else u.searchParams.set('api_key', key); // API-Schlüssel (v3)
  const r = await fetch(u, { headers });
  if (!r.ok) throw new Error(`TMDB ${r.status}`);
  return r.json();
}
const tmdbBild = (p) => (p ? `https://image.tmdb.org/t/p/w154${p}` : null);

async function sucheFilmSerie(env, medium, q) {
  const film = medium === 'film';
  const { results = [] } = await tmdb(env, film ? '/search/movie' : '/search/tv', { query: q, include_adult: 'false' });
  return results.slice(0, 8).map((r) => {
    const d = film ? r.release_date : r.first_air_date;
    return {
      id: `tmdb-${film ? 'movie' : 'tv'}:${r.id}`, medium, titel: film ? r.title : r.name,
      jahr: d ? Number(d.slice(0, 4)) : null,
      info: (film ? r.original_title : r.original_name) !== (film ? r.title : r.name) ? (film ? r.original_title : r.original_name) : '',
      bild: tmdbBild(r.poster_path),
    };
  });
}
async function termineFilm(env, id) {
  const m = await tmdb(env, `/movie/${Number(id)}`, { append_to_response: 'release_dates' });
  const de = m.release_dates?.results?.find((x) => x.iso_3166_1 === 'DE')?.release_dates || [];
  const art = { 3: 'Kinostart (DE)', 4: 'Digital (DE)', 5: 'Blu-ray/DVD (DE)' };
  let termine = de.filter((x) => art[x.type]).map((x) => ({ datum: x.release_date.slice(0, 10), text: art[x.type] }));
  if (!termine.length && m.release_date) termine = [{ datum: m.release_date, text: 'Release' }];
  return { titel: m.title, bild: tmdbBild(m.poster_path), termine, status: termine.length ? null : 'Kein Termin bekannt' };
}
async function termineSerie(env, id) {
  const s = await tmdb(env, `/tv/${Number(id)}`);
  const heute = new Date().toISOString().slice(0, 10);
  const staffel = s.next_episode_to_air?.season_number ?? s.last_episode_to_air?.season_number;
  const termine = [];
  if (staffel != null) {
    const st = await tmdb(env, `/tv/${Number(id)}/season/${staffel}`);
    for (const e of st.episodes || []) {
      if (e.air_date) termine.push({ datum: e.air_date, text: `S${staffel}E${e.episode_number}${e.name ? ` · ${e.name}` : ''}` });
    }
  }
  // Angekündigte spätere Staffeln mit Startdatum
  for (const st of s.seasons || []) {
    if (st.season_number > (staffel ?? 0) && st.air_date && st.air_date >= heute) termine.push({ datum: st.air_date, text: `Staffel ${st.season_number} startet` });
  }
  const status = { 'Ended': 'Beendet', 'Canceled': 'Abgesetzt', 'Returning Series': 'Läuft weiter', 'In Production': 'In Produktion', 'Planned': 'Geplant' }[s.status] || s.status;
  return { titel: s.name, bild: tmdbBild(s.poster_path), termine, status };
}

// ---------- gemeinsam ----------
export async function suche(env, medium, q) {
  if (medium === 'spiel') return sucheSpiel(env, q);
  return sucheFilmSerie(env, medium, q);
}

export async function holeTermine(env, id) {
  const [quelle, nr] = id.split(':');
  if (quelle === 'igdb') return termineSpiel(env, nr);
  if (quelle === 'tmdb-movie') return termineFilm(env, nr);
  if (quelle === 'tmdb-tv') return termineSerie(env, nr);
  throw new Error('Unbekannte Quelle');
}

// Veraltete Einträge erneuern (höchstens MAX_ERNEUERN pro Aufruf). Gibt true zurück, wenn etwas geändert wurde.
export async function erneuere(env, liste, alle = false) {
  const jetzt = Date.now();
  const alt = liste.filter((e) => alle || !e.aktualisiert || jetzt - e.aktualisiert > FRISCH_MS)
    .sort((a, b) => (a.aktualisiert || 0) - (b.aktualisiert || 0)).slice(0, MAX_ERNEUERN);
  let geaendert = false;
  for (const e of alt) {
    try {
      const neu = await holeTermine(env, e.id);
      if (neu) Object.assign(e, neu, { aktualisiert: jetzt, fehler: null });
    } catch (err) {
      e.fehler = String(err.message || err);
      e.aktualisiert = jetzt - FRISCH_MS + 3600 * 1000; // in einer Stunde nochmal versuchen
    }
    geaendert = true;
  }
  return geaendert;
}

// ---------- Kalender (iCalendar) ----------
const icsText = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
function falte(zeile) {
  const out = [];
  const bytes = new TextEncoder();
  let rest = zeile;
  while (bytes.encode(rest).length > 74) {
    let n = 74;
    while (bytes.encode(rest.slice(0, n)).length > 74) n--;
    out.push(rest.slice(0, n));
    rest = ' ' + rest.slice(n);
  }
  out.push(rest);
  return out.join('\r\n');
}
const plusTag = (d) => new Date(Date.parse(d + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10).replace(/-/g, '');
const zeichen = { spiel: '🎮', film: '🎬', serie: '📺' };

export function kalender(liste) {
  const stempel = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const z = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kestrel//Merkliste//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:Kestrel Merkliste', 'X-PUBLISHED-TTL:PT6H', 'REFRESH-INTERVAL;VALUE=DURATION:PT6H'];
  for (const e of liste.filter((x) => x.kalender)) {
    for (const t of e.termine || []) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(t.datum)) continue;
      z.push('BEGIN:VEVENT',
        falte(`UID:${e.id.replace(/[^a-z0-9]/gi, '-')}-${t.text.replace(/[^a-z0-9]/gi, '').slice(0, 40)}@kestrel`),
        `DTSTAMP:${stempel}`,
        `DTSTART;VALUE=DATE:${t.datum.replace(/-/g, '')}`,
        `DTEND;VALUE=DATE:${plusTag(t.datum)}`,
        falte(`SUMMARY:${icsText(`${zeichen[e.medium] || ''} ${e.titel}: ${t.text}`.trim())}`),
        'TRANSP:TRANSPARENT',
        'END:VEVENT');
    }
  }
  z.push('END:VCALENDAR');
  return z.join('\r\n') + '\r\n';
}
