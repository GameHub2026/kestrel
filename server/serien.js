// "Ich folge": Serien, Filme und Spiele, denen Kevin folgt (Glocke), getrennt von der Merkliste.
// Quellen: automatisch aus dem Trakt-Verlauf (alles, was Plex dort gemeldet hat) und von Hand (Folgen-Knopf).
// Einmal täglich (GitHub-Aktion → POST /api/serien/pruefen) und beim Öffnen der Seite, wenn der Stand alt ist:
// neue Staffel/neuer Teil, Starttermin bekannt oder verschoben, Ableger aus demselben Universum (Wikidata),
// neue Trailer, News. Doppelte Meldungen zum selben Ereignis werden gebündelt.
// Beendete/abgesetzte Serien fliegen aus der Liste, werden aber weiter auf Ableger geprüft (z. B. Vorgeschichte).
// Gespeichert als ein KV-Eintrag "serien": { stand, gesehen, serien: [...] }.
import { tmdb, tmdbBild, igdb, igdbBild } from './merk.js';
import { passt, buendeln, KONTEXT } from './news-match.js';

const TAG = 864e5;
export const ladeSerien = async (env) => (await env.MERK.get('serien', 'json')) || { stand: 0, gesehen: Date.now() - 7 * TAG, serien: [] };
export const speichereSerien = (env, d) => env.MERK.put('serien', JSON.stringify(d));

// Neu ist, was nach dem letzten "Alles gesehen" aufgetaucht ist (beim allerersten Mal: die letzte Woche).
export function mitNeu(d) {
  const g = d.gesehen || 0;
  return d.serien.map((s) => ({ ...s, punkte: (s.punkte || []).map((p) => ({ ...p, neu: Date.parse(p.datum) > g })) }));
}
export const pruefbar = (s) => !s.aus || !!s.ausGrund; // von Hand entfolgt = gar nicht mehr
export const neuAnzahl = (d) => mitNeu(d).filter(pruefbar).reduce((n, s) => n + s.punkte.filter((p) => p.neu).length, 0);

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
  // Ableger aus demselben Universum (Serien, Spin-off-Filme), ohne die Teile, die die Reihe oben schon liefert
  punkte.push(...ablegerPunkte(s, erstmals, heute, new Set(kommend.map((t) => `tmdb-movie:${t.id}`))));
  const nm = [...new Set(namen.filter(Boolean))];
  for (const n of archiv.filter((x) => (x.art || 'film') === 'film' && passt(nm, x.titel)).slice(0, 8)) punkte.push({ art: 'news', titel: n.titel, link: n.link, quelle: n.quelle, datum: n.datum });
  s.punkte = buendeln(punkte).sort((a, z) => String(z.datum).localeCompare(String(a.datum))).slice(0, 14);
  s.geprueft = Date.now();
}

// ---------- Ableger aus demselben Universum (Wikidata) ----------
// Verknüpfungen: Medien-Franchise, fiktives Universum, Teil der Reihe, Spin-off, Vorgänger/Nachfolger,
// und Werke nach Büchern derselben Buchreihe (z. B. The Handmaid's Tale → The Testaments).
const WIE = { spinoff: 'Ableger', folge: 'Neuer Teil', vorlage: 'Aus derselben Buchreihe', universum: 'Aus demselben Universum', franchise: 'Aus demselben Universum', reihe: 'Aus derselben Reihe' };
const WOCHE = 7 * TAG;
export async function wikidataVerwandte(liste) {
  const werte = liste.map((s) => { const [q, n] = s.id.split(':'); return `("${s.id}" wdt:${q === 'tmdb-tv' ? 'P4983' : 'P4947'} "${n}")`; }).join(' ');
  const q = `SELECT ?quelle ?wie ?rTv ?rFilm ?rLabel ?datum WHERE {
    VALUES (?quelle ?p ?id) { ${werte} }
    ?item ?p ?id .
    { ?item wdt:P8345 ?x . ?r wdt:P8345 ?x . BIND("franchise" AS ?wie) }
    UNION { ?item wdt:P1434 ?x . ?r wdt:P1434 ?x . BIND("universum" AS ?wie) }
    UNION { ?item wdt:P179 ?x . ?r wdt:P179 ?x . BIND("reihe" AS ?wie) }
    UNION { { ?item wdt:P2512 ?r } UNION { ?r wdt:P2512 ?item } BIND("spinoff" AS ?wie) }
    UNION { { ?item wdt:P155|wdt:P156 ?r } UNION { ?r wdt:P155|wdt:P156 ?item } BIND("folge" AS ?wie) }
    UNION { ?item wdt:P144 ?x . ?x wdt:P155|wdt:P156|^wdt:P155|^wdt:P156 ?y . ?r wdt:P144 ?y . BIND("vorlage" AS ?wie) }
    FILTER(?r != ?item)
    OPTIONAL { ?r wdt:P4983 ?rTv } OPTIONAL { ?r wdt:P4947 ?rFilm }
    FILTER(BOUND(?rTv) || BOUND(?rFilm))
    OPTIONAL { ?r wdt:P580|wdt:P577 ?datum }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
  } LIMIT 1500`;
  const r = await fetch(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`, { headers: { accept: 'application/sparql-results+json', 'user-agent': 'Kestrel/1.0 (https://kestrel-2tf.pages.dev)' } });
  if (!r.ok) throw new Error(`Wikidata ${r.status}`);
  const proQuelle = new Map();
  const RANG = ['spinoff', 'folge', 'vorlage', 'universum', 'franchise', 'reihe'];
  for (const b of (await r.json()).results.bindings) {
    const id = b.rTv ? `tmdb-tv:${b.rTv.value}` : `tmdb-movie:${b.rFilm.value}`;
    const m = proQuelle.get(b.quelle.value) || new Map(); proQuelle.set(b.quelle.value, m);
    const alt = m.get(id);
    const datum = b.datum?.value?.slice(0, 10) || null;
    if (!alt) m.set(id, { id, titel: b.rLabel.value.replace(/\s*\((Film|Fernsehserie|Serie|TV-Serie|Miniserie|film|TV series)( \d{4})?\)$/, ''), wie: b.wie.value, datum });
    else {
      if (datum && (!alt.datum || datum < alt.datum)) alt.datum = datum; // frühestes Datum (Erstausstrahlung)
      if (RANG.indexOf(b.wie.value) < RANG.indexOf(alt.wie)) alt.wie = b.wie.value;
    }
  }
  for (const s of liste) s.verwandt = { stand: Date.now(), liste: [...(proQuelle.get(s.id)?.values() || [])] };
}
function ablegerPunkte(s, erstmals, heute, schonDa = new Set()) {
  const grenze = new Date(Date.parse(heute) - 365 * TAG).toISOString().slice(0, 10);
  return (s.verwandt?.liste || [])
    .filter((v) => v.id !== s.id && !schonDa.has(v.id) && (v.datum ? v.datum >= grenze : ['spinoff', 'folge', 'vorlage'].includes(v.wie)))
    .sort((a, z) => (a.datum || '9999').localeCompare(z.datum || '9999'))
    .slice(0, 6)
    .map((v) => {
      const art = v.id.startsWith('tmdb-tv:') ? 'Serie' : 'Film';
      const wann = !v.datum ? ', Termin noch offen' : v.datum >= heute ? ` · ab ${datumDe(v.datum)}` : ` · erschienen am ${datumDe(v.datum)}`;
      return { art: 'ableger', titel: `${WIE[v.wie] || 'Verwandt'}: ${v.titel} (${art})${wann}`, datum: erstmals(`w${v.id}:${v.datum || ''}`), termin: v.datum && v.datum >= heute ? v.datum : undefined, ref: v.id };
    });
}

// ---------- Spiele (IGDB): Release, neue Teile der Reihe, Trailer, Spiele-News ----------
async function pruefeSpiel(env, s, archiv) {
  const [g] = await igdb(env, `fields name,cover.image_id,first_release_date,release_dates.date,release_dates.region,status,videos.video_id,videos.name,collections.name,collections.games.name,collections.games.first_release_date,franchises.games.name,franchises.games.first_release_date; where id = ${Number(s.id.split(':')[1])};`);
  if (!g) throw new Error('Spiel nicht gefunden');
  const jetzt = new Date().toISOString();
  const heute = jetzt.slice(0, 10);
  const b = s.bekannt || (s.bekannt = {});
  const erstmals = (key) => (b[key] ||= jetzt);
  const tag = (sek) => new Date(sek * 1000).toISOString().slice(0, 10);
  s.medium = 'spiel';
  s.titel = g.name || s.titel;
  s.bild = igdbBild(g);
  s.reihe = g.collections?.[0]?.name || null;
  const punkte = [];
  // Eigener Release (Europa oder weltweit), frühester kommender Termin
  const termine = (g.release_dates || []).filter((r) => r.date && [1, 8].includes(r.region)).map((r) => tag(r.date)).sort();
  const start = termine.find((d) => d >= heute) || (!termine.length && g.first_release_date ? tag(g.first_release_date) : null);
  s.naechste = null;
  if (start && start >= heute) { punkte.push({ art: 'staffel', titel: `Release am ${datumDe(start)}`, datum: erstmals(`r:${start}`), termin: start }); s.naechste = { text: 'Release', datum: start }; }
  // Neue Teile der Reihe/des Franchise (nur mit Termin ab heute, damit alte Einträge ohne Datum nicht stören)
  const teile = new Map();
  for (const x of [...(g.collections || []), ...(g.franchises || [])]) for (const t of x.games || []) if (t.id !== g.id && t.first_release_date && tag(t.first_release_date) >= heute) teile.set(t.id, t);
  for (const t of [...teile.values()].sort((a, z) => a.first_release_date - z.first_release_date).slice(0, 4)) {
    const d = tag(t.first_release_date);
    punkte.push({ art: 'ableger', titel: `Neuer Teil der Reihe: ${t.name} · ab ${datumDe(d)}`, datum: erstmals(`g${t.id}:${d}`), termin: d, ref: `igdb:${t.id}` });
    if (!s.naechste) s.naechste = { text: t.name, datum: d };
  }
  // Trailer: IGDB nennt kein Datum, also der Zeitpunkt, an dem ein Video zum ersten Mal auftaucht
  const ersterLauf = !b.gesehenVideos; b.gesehenVideos = true;
  for (const v of (g.videos || []).slice(-6)) {
    const k = `v${v.video_id}`;
    if (!b[k]) b[k] = ersterLauf ? '2000-01-01T00:00:00.000Z' : jetzt;
    punkte.push({ art: 'trailer', titel: v.name || 'Video', link: `https://www.youtube.com/watch?v=${v.video_id}`, quelle: 'YouTube', datum: b[k] });
  }
  for (const n of archiv.filter((x) => x.art === 'spiel' && passt([g.name], x.titel, KONTEXT.spiel)).slice(0, 8)) punkte.push({ art: 'news', titel: n.titel, link: n.link, quelle: n.quelle, datum: n.datum });
  s.status = s.naechste ? 'Kommt bald' : s.reihe ? `Reihe: ${s.reihe}` : 'Erschienen';
  s.punkte = buendeln(punkte).sort((a, z) => String(z.datum).localeCompare(String(a.datum))).slice(0, 14);
  s.geprueft = Date.now();
}

export async function pruefeSerie(env, s, archiv) {
  if (s.id.startsWith('igdb:')) return pruefeSpiel(env, s, archiv);
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

  // Beendet oder abgesetzt: raus aus der Liste (außer Kevin hat sie ausdrücklich wieder aufgenommen),
  // aber weiter auf Ableger prüfen: Vorgeschichte, Fortsetzung, Spin-off aus demselben Universum
  const beendet = ['Ended', 'Canceled'].includes(d.status) && !s.behalten && !s.naechste;
  if (beendet) { s.aus = true; s.ausGrund = STATUS[d.status]; }
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
  for (const n of archiv.filter((x) => (x.art || 'film') === 'film' && passt(namen, x.titel)).slice(0, 8)) {
    punkte.push({ art: 'news', titel: n.titel, link: n.link, quelle: n.quelle, datum: n.datum });
  }
  const ableger = ablegerPunkte(s, erstmals, heute);
  s.punkte = beendet ? ableger : buendeln([...punkte, ...ableger]).sort((a, z) => String(z.datum).localeCompare(String(a.datum))).slice(0, 14);
  s.geprueft = Date.now();
}

// Einen Teil der Serien prüfen (je Aufruf höchstens `anzahl`, wegen der Anfrage-Grenzen von Cloudflare).
export async function pruefeTeil(env, d, archiv, ab, anzahl = 10) {
  const aktiv = d.serien.filter(pruefbar);
  const teil = aktiv.slice(ab, ab + anzahl);
  const fehler = [];
  // Wikidata-Verwandte einmal pro Woche, für den ganzen Teil in einer Abfrage
  const alt = teil.filter((s) => !s.id.startsWith('igdb:') && (!s.verwandt || Date.now() - s.verwandt.stand > WOCHE));
  if (alt.length) { try { await wikidataVerwandte(alt); } catch (e) { fehler.push(e.message); } }
  for (const s of teil) { try { await pruefeSerie(env, s, archiv); } catch (e) { fehler.push(`${s.titel}: ${e.message}`); } }
  return { weiter: ab + anzahl < aktiv.length ? ab + anzahl : null, geprueft: teil.length, gesamt: aktiv.length, fehler };
}

// Für den Kalender: Staffelstarts aller verfolgten Serien
export const serienTermine = (d) => d.serien.filter((s) => !s.aus && s.naechste?.datum)
  .map((s) => ({ id: s.id, medium: s.medium || 'serie', titel: s.titel, kalender: true,
    termine: [{ datum: s.naechste.datum, text: s.medium === 'film' ? (s.naechste.text === 'Kinostart' ? 'Kinostart (DE)' : `Neuer Teil: ${s.naechste.text}`)
      : s.medium === 'spiel' ? (s.naechste.text === 'Release' ? 'Release' : `Neuer Teil: ${s.naechste.text}`) : `${s.naechste.text || `Staffel ${s.naechste.staffel}`} startet` }] }));
