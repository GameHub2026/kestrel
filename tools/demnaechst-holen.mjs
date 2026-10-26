// Holt kommende Kinostarts sowie Serien- und Staffelstarts (Deutschland) von TMDB und schreibt src/data/demnaechst.json.
// Läuft täglich per GitHub-Aktion; lokal: node tools/demnaechst-holen.mjs (liest den Schlüssel aus ../Claude - Spiele-Bibliothek/api-keys.txt).
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../src/data/demnaechst.json');
let KEY = process.env.TMDB_KEY || '';
if (!KEY) {
  const f = path.resolve(import.meta.dirname, '../../Claude - Spiele-Bibliothek/api-keys.txt');
  const m = fs.existsSync(f) && fs.readFileSync(f, 'utf8').match(/^\s*TMDB API Key\s*[:=]\s*(.+)$/im);
  KEY = m ? m[1].trim().replace(/^[<"'`]+|[>"'`]+$/g, '') : '';
}
if (!KEY) { console.error('TMDB-Schlüssel fehlt (TMDB_KEY bzw. api-keys.txt).'); process.exit(1); }

const REGION = 'DE';
const TAGE_VOR = 2, TAGE_VOR_AUS = 120;
const MAX_KINO = 40, MAX_SERIEN = 60, MAX_FOLGEN_SERIEN = 45, TAGE_FOLGEN = 45;
const tag = (d) => d.toISOString().slice(0, 10);
const heute = new Date();
const von = tag(new Date(heute.getTime() - TAGE_VOR * 864e5));
const bis = tag(new Date(heute.getTime() + TAGE_VOR_AUS * 864e5));

async function tmdb(pfad, params = {}) {
  const u = new URL(`https://api.themoviedb.org/3${pfad}`);
  u.searchParams.set('language', 'de-DE');
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const headers = {};
  if (KEY.length > 60) headers.Authorization = `Bearer ${KEY}`; else u.searchParams.set('api_key', KEY);
  for (let versuch = 0; versuch < 3; versuch++) {
    const r = await fetch(u, { headers });
    if (r.status === 429) { await new Promise((s) => setTimeout(s, 1500)); continue; }
    if (!r.ok) throw new Error(`TMDB ${r.status} ${pfad}`);
    return r.json();
  }
  throw new Error(`TMDB überlastet: ${pfad}`);
}
async function parallel(liste, fn, n = 6) {
  const aus = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < liste.length) { const k = i++; aus[k] = await fn(liste[k]).catch((e) => { console.warn(e.message); return null; }); } }));
  return aus.filter(Boolean);
}
const eindeutig = (a) => [...new Set(a)];
const bild = (p) => (p ? `https://image.tmdb.org/t/p/w342${p}` : null);
// Nur bekannte Streaminganbieter zeigen; Zusatzvarianten ("with Ads", "Amazon Channel") entfallen.
const BEKANNT = /^(Netflix|Amazon Prime Video|Disney Plus|Apple TV Plus|Paramount Plus|WOW|RTL\+|Max|HBO Max|Joyn|MagentaTV|Sky Go|Crunchyroll|ARD Mediathek|ZDF|Arte|Netflix Standard with Ads)$/i;
const anbieter = (d) => eindeutig((d?.['watch/providers']?.results?.[REGION]?.flatrate || []).map((p) => p.provider_name).filter((n) => BEKANNT.test(n)).map((n) => n.replace(/ Standard with Ads$/i, '').replace(/ Plus$/i, '+')));
// Vor dem Start kennt TMDB oft noch keine Anbieter; dann hilft der Sender/Dienst, der die Serie produziert (Netflix, Apple TV+ …).
const NETZ = { 'Prime Video': 'Amazon Prime Video', 'Disney Plus': 'Disney+', 'Apple TV Plus': 'Apple TV+', 'Paramount Plus': 'Paramount+', 'HBO Max': 'HBO Max' };
const netze = (s) => eindeutig((s.networks || []).map((n) => NETZ[n.name] || n.name).filter((n) => BEKANNT.test(n) || /^(HBO|Hulu|Showtime|FX|AMC|BBC One|ITV|Sky|Starz)$/i.test(n)));
// Titel in Fremdschrift (Koreanisch, Japanisch, …) bleiben draußen, auf Deutsch lesbare Titel nicht.
const lesbar = (t) => !/[^\p{Script=Latin}\p{N}\p{P}\p{S}\p{Z}]/u.test(t || '');

// ---------- Filme ----------
async function filmIds(typen, max) {
  const ids = new Map();
  for (let seite = 1; seite <= 3 && ids.size < max * 2; seite++) {
    const d = await tmdb('/discover/movie', { region: REGION, with_release_type: typen, 'release_date.gte': von, 'release_date.lte': bis, sort_by: 'popularity.desc', include_adult: 'false', page: seite });
    for (const m of d.results || []) ids.set(m.id, m);
  }
  return [...ids.keys()];
}
async function filmEintraege(ids, typ, nachTyp) {
  const filme = await parallel(ids, (id) => tmdb(`/movie/${id}`, { append_to_response: 'release_dates,watch/providers' }));
  const out = [];
  for (const m of filme) {
    const de = (m.release_dates?.results || []).find((r) => r.iso_3166_1 === REGION)?.release_dates || [];
    const termine = de.filter((x) => nachTyp.includes(x.type)).map((x) => x.release_date.slice(0, 10)).filter((d) => d >= von && d <= bis).sort();
    if (!termine.length || !m.poster_path || !lesbar(m.title)) continue;
    if (m.release_date && m.release_date < tag(new Date(heute.getTime() - 400 * 864e5))) continue; // Wiederaufführungen alter Filme
    out.push({
      id: `movie-${m.id}-${typ}`, art: 'film', typ, titel: m.title, datum: termine[0],
      text: typ === 'kino' ? 'Kinostart' : 'Streaming/Digital', jahr: (m.release_date || '').slice(0, 4),
      bild: bild(m.poster_path), anbieter: anbieter(m), link: `https://www.themoviedb.org/movie/${m.id}`, pop: m.popularity,
    });
  }
  return out;
}

// ---------- Serien ----------
async function serieIds() {
  const ids = new Map();
  for (const filter of [{ 'first_air_date.gte': von, 'first_air_date.lte': bis }, { 'air_date.gte': von, 'air_date.lte': bis }]) {
    for (let seite = 1; seite <= 3; seite++) {
      const d = await tmdb('/discover/tv', { ...filter, sort_by: 'popularity.desc', include_adult: 'false', page: seite });
      for (const s of d.results || []) ids.set(s.id, s);
    }
  }
  return [...ids.keys()];
}
async function serienEintraege(ids) {
  const serien = await parallel(ids, (id) => tmdb(`/tv/${id}`, { append_to_response: 'watch/providers' }));
  const starts = [];
  const kandidaten = [];
  const folgenBis = tag(new Date(heute.getTime() + TAGE_FOLGEN * 864e5));
  for (const s of serien) {
    if (!s.poster_path || !lesbar(s.name)) continue;
    const wo = anbieter(s).length ? anbieter(s) : netze(s);
    if (!wo.length && !(['en', 'de'].includes(s.original_language) && s.popularity >= 12)) continue;
    const startTage = new Set();
    for (const st of s.seasons || []) {
      if (!st.season_number || !st.air_date || st.air_date < von || st.air_date > bis) continue;
      const neu = st.season_number === 1 && !(s.first_air_date && s.first_air_date < st.air_date);
      startTage.add(st.air_date);
      starts.push({
        id: `tv-${s.id}-s${st.season_number}`, art: 'serie', typ: neu ? 'serienstart' : 'staffelstart', titel: s.name, datum: st.air_date,
        text: neu ? 'Neue Serie' : `Staffel ${st.season_number}`, jahr: (s.first_air_date || '').slice(0, 4),
        bild: bild(st.poster_path || s.poster_path), anbieter: wo, link: `https://www.themoviedb.org/tv/${s.id}`, pop: s.popularity,
      });
    }
    // Staffeln, aus denen in den nächsten Wochen Folgen laufen
    const staffeln = new Set([s.next_episode_to_air?.season_number, s.last_episode_to_air?.season_number].filter((n) => n));
    // Wöchentliche Folgen nur für Spiel- und Miniserien (keine Talkshows, Soaps, Nachrichten, Reality, Wrestling) mit Anbieter in Deutschland.
    const spielserie = ['Scripted', 'Miniseries'].includes(s.type) && !(s.genres || []).some((g) => [10767, 10763, 10766, 10764].includes(g.id));
    const laeuft = (s.next_episode_to_air?.air_date || '9999') <= folgenBis || (s.last_episode_to_air?.air_date || '') >= von;
    if (spielserie && anbieter(s).length && staffeln.size && laeuft) kandidaten.push({ s, wo, staffeln: [...staffeln], startTage });
  }
  const top = kandidaten.sort((a, b) => b.s.popularity - a.s.popularity).slice(0, MAX_FOLGEN_SERIEN);
  const folgen = [];
  await parallel(top, async ({ s, wo, staffeln, startTage }) => {
    for (const n of staffeln) {
      const st = await tmdb(`/tv/${s.id}/season/${n}`);
      const proTag = new Map();
      for (const e of st.episodes || []) {
        if (!e.air_date || e.air_date < von || e.air_date > folgenBis) continue;
        if (!proTag.has(e.air_date)) proTag.set(e.air_date, []);
        proTag.get(e.air_date).push(e);
      }
      for (const [datum, eps] of proTag) {
        if (startTage.has(datum)) continue; // Staffelstart steht schon als eigener Eintrag da
        const text = eps.length > 1 ? `Staffel ${n} · Folgen ${eps[0].episode_number}–${eps.at(-1).episode_number}` : `S${n}E${eps[0].episode_number}${eps[0].name && !/^(Folge|Episode) \d+$/i.test(eps[0].name) ? ` · ${eps[0].name}` : ''}`;
        folgen.push({
          id: `tv-${s.id}-s${n}-${datum}`, art: 'serie', typ: 'folge', titel: s.name, datum, text, jahr: (s.first_air_date || '').slice(0, 4),
          bild: bild(s.poster_path), anbieter: wo, link: `https://www.themoviedb.org/tv/${s.id}`, pop: s.popularity,
        });
      }
    }
  }, 4);
  return { starts: starts.sort((a, b) => b.pop - a.pop).slice(0, MAX_SERIEN), folgen };
}

const [kinoIds, tvIds] = await Promise.all([filmIds('2|3', MAX_KINO), serieIds()]);
const [kino, serienAlles] = await Promise.all([filmEintraege(kinoIds.slice(0, MAX_KINO * 2), 'kino', [2, 3]), serienEintraege(tvIds)]);
const { starts: serien, folgen } = serienAlles;

const sortiere = (a) => a.sort((x, y) => y.pop - x.pop);
const eintraege = [...sortiere(kino).slice(0, MAX_KINO), ...serien, ...folgen]
  .map(({ pop, ...rest }) => ({ ...rest, anbieter: eindeutig(rest.anbieter) }))
  .sort((a, b) => a.datum.localeCompare(b.datum) || a.titel.localeCompare(b.titel, 'de'));

const neu = JSON.stringify({ von, bis, eintraege }, null, 1);
// Nur schreiben, wenn sich etwas geändert hat (sonst ein Commit pro Tag nur wegen des Datums).
const alt = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null;
if (!alt || JSON.stringify(alt.eintraege) !== JSON.stringify(eintraege)) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, neu + '\n');
  console.log(`geschrieben: ${eintraege.length} Einträge (Kino ${kino.length}, Serien- und Staffelstarts ${serien.length}, Folgen ${folgen.length})`);
} else console.log('keine Änderung');
