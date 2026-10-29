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

// ---------- Infos für die Info-Box (je Titel einmal, Einträge verweisen per "info") ----------
const INFOS = {};
const trailer = (v) => {
  const l = (v?.results || []).filter((x) => x.site === 'YouTube' && /Trailer|Teaser/.test(x.type));
  const b = l.find((x) => x.iso_639_1 === 'de' && x.type === 'Trailer') || l.find((x) => x.type === 'Trailer') || l[0];
  return b ? `https://www.youtube.com/watch?v=${b.key}` : null;
};
function merkeInfo(key, d, film) {
  if (INFOS[key]) return key;
  const fakten = [];
  if (film && d.runtime) fakten.push(['Laufzeit', `${Math.floor(d.runtime / 60)} Std ${d.runtime % 60} Min`]);
  if (!film && d.number_of_seasons) fakten.push(['Umfang', `${d.number_of_seasons} Staffel${d.number_of_seasons > 1 ? 'n' : ''}${d.number_of_episodes ? `, ${d.number_of_episodes} Folgen` : ''}`]);
  const macher = film ? (d.credits?.crew || []).filter((c) => c.job === 'Director').map((c) => c.name) : (d.created_by || []).map((c) => c.name);
  if (macher.length) fakten.push([film ? 'Regie' : 'Von', macher.slice(0, 2).join(', ')]);
  const cast = (d.credits?.cast || []).slice(0, 4).map((c) => c.name);
  if (cast.length) fakten.push(['Mit', cast.join(', ')]);
  if (!film && d.networks?.length) fakten.push(['Sender/Dienst', d.networks.map((n) => n.name).slice(0, 2).join(', ')]);
  if (d.vote_count > 20) fakten.push(['TMDB-Wertung', `${d.vote_average.toFixed(1)} / 10`]);
  INFOS[key] = {
    titel: film ? d.title : d.name, original: film ? d.original_title : d.original_name,
    leitsatz: d.tagline || null, handlung: d.overview || null, genres: (d.genres || []).map((g) => g.name),
    fakten, trailer: trailer(d.videos), link: `https://www.themoviedb.org/${film ? 'movie' : 'tv'}/${d.id}`,
    bild: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null, news: [],
  };
  return key;
}

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
  const filme = await parallel(ids, (id) => tmdb(`/movie/${id}`, { append_to_response: 'release_dates,watch/providers,videos,credits', include_video_language: 'de,en,null' }));
  const out = [];
  for (const m of filme) {
    const de = (m.release_dates?.results || []).find((r) => r.iso_3166_1 === REGION)?.release_dates || [];
    const termine = de.filter((x) => nachTyp.includes(x.type)).map((x) => x.release_date.slice(0, 10)).filter((d) => d >= von && d <= bis).sort();
    if (!termine.length || !m.poster_path || !lesbar(m.title)) continue;
    if (m.release_date && m.release_date < tag(new Date(heute.getTime() - 400 * 864e5))) continue; // Wiederaufführungen alter Filme
    out.push({
      id: `movie-${m.id}-${typ}`, art: 'film', typ, titel: m.title, datum: termine[0],
      text: typ === 'kino' ? 'Kinostart' : 'Streaming/Digital', jahr: (m.release_date || '').slice(0, 4),
      bild: bild(m.poster_path), anbieter: anbieter(m), link: `https://www.themoviedb.org/movie/${m.id}`, pop: m.popularity, info: merkeInfo(`movie-${m.id}`, m, true),
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
  const serien = await parallel(ids, (id) => tmdb(`/tv/${id}`, { append_to_response: 'watch/providers,videos,credits', include_video_language: 'de,en,null' }));
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
        bild: bild(st.poster_path || s.poster_path), anbieter: wo, link: `https://www.themoviedb.org/tv/${s.id}`, pop: s.popularity, info: merkeInfo(`tv-${s.id}`, s, false),
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
          bild: bild(s.poster_path), anbieter: wo, link: `https://www.themoviedb.org/tv/${s.id}`, pop: s.popularity, info: merkeInfo(`tv-${s.id}`, s, false),
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

// Fehlt die deutsche Handlung, die englische holen (gekennzeichnet)
await parallel(Object.entries(INFOS).filter(([, i]) => !i.handlung), async ([key, i]) => {
  const [art, id] = key.split('-');
  const u = new URL(`https://api.themoviedb.org/3/${art}/${id}`); u.searchParams.set('language', 'en-US');
  const headers = {}; if (KEY.length > 60) headers.Authorization = `Bearer ${KEY}`; else u.searchParams.set('api_key', KEY);
  const d = await (await fetch(u, { headers })).json();
  if (d.overview) { i.handlung = d.overview; i.sprache = 'en'; }
  return true;
});

// ---------- News: offizielle Feeds seriöser Film-/Serien-Redaktionen, 30 Tage gesammelt ----------
const FEEDS = [
  ['Moviepilot', 'https://www.moviepilot.de/rss/news'], ['Serienjunkies', 'https://www.serienjunkies.de/rss/news.xml'],
  ['DWDL', 'https://www.dwdl.de/rss/allethemen.xml'], ['Spiegel Kultur', 'https://www.spiegel.de/kultur/kino/index.rss'],
  ['Variety', 'https://variety.com/feed/'], ['Deadline', 'https://deadline.com/feed/'], ['The Hollywood Reporter', 'https://www.hollywoodreporter.com/feed/'],
  ['IndieWire', 'https://www.indiewire.com/feed/'], ['Collider', 'https://collider.com/feed/'],
];
const ARCHIV = path.resolve(import.meta.dirname, '../src/data/news-archiv.json');
const ent = (t) => t.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&#8217;/g, '’').replace(/&#8216;/g, '‘').replace(/&#8220;|&#8221;/g, '"').replace(/&#8211;/g, '–').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '').trim();
async function feed([quelle, url]) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Kestrel; +https://kestrel-2tf.pages.dev)' } });
  if (!r.ok) throw new Error(`${quelle} ${r.status}`);
  const x = await r.text();
  return [...x.matchAll(/<item[\s>][\s\S]*?<\/item>/g)].map(([it]) => {
    const g = (t) => it.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\/${t}>`))?.[1] || '';
    const datum = new Date(g('pubDate') || g('dc:date') || Date.now());
    return { quelle, titel: ent(g('title')), link: ent(g('link')), datum: isNaN(datum) ? new Date().toISOString() : datum.toISOString() };
  }).filter((n) => n.titel && /^https?:/.test(n.link));
}
const altArchiv = fs.existsSync(ARCHIV) ? JSON.parse(fs.readFileSync(ARCHIV, 'utf8')) : [];
const frisch = (await Promise.all(FEEDS.map((f) => feed(f).catch((e) => { console.warn('Feed:', e.message); return []; })))).flat();
const grenze = new Date(Date.now() - 30 * 864e5).toISOString();
const archiv = [...new Map([...altArchiv, ...frisch].map((n) => [n.link, n])).values()].filter((n) => n.datum >= grenze).sort((a, b) => b.datum.localeCompare(a.datum));
fs.writeFileSync(ARCHIV, JSON.stringify(archiv, null, 1) + '\n');

// Zuordnung: Titel (deutsch oder Original) muss als ganzes Wort in der Überschrift stehen.
// Kurze Ein-Wort-Titel ("Buddy", "Wicker") brauchen zusätzlich ein Film-/Serien-Wort, sonst zu viele Fehltreffer.
const KONTEXT = /\b(film|serie|staffel|trailer|kino|movie|series|season|episode|teaser|netflix|disney|prime|hbo|apple tv|paramount)/i;
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const info of Object.values(INFOS)) {
  const namen = [...new Set([info.titel, info.original].filter((n) => n && n.length >= 3))];
  info.news = archiv.filter((n) => namen.some((name) => {
    if (!new RegExp(`(^|[^\\p{L}\\p{N}])${esc(name)}($|[^\\p{L}\\p{N}])`, 'iu').test(n.titel)) return false;
    const kern = name.replace(/^(the|a|an|der|die|das|ein|eine)\s+/i, '');
    return (kern.includes(' ') || kern.length >= 9) || KONTEXT.test(n.titel);
  })).slice(0, 5);
}

const neu = JSON.stringify({ von, bis, eintraege, infos: INFOS }, null, 1);
// Nur schreiben, wenn sich etwas geändert hat (sonst ein Commit pro Tag nur wegen des Datums).
const alt = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : null;
if (!alt || JSON.stringify([alt.eintraege, alt.infos]) !== JSON.stringify([eintraege, INFOS])) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, neu + '\n');
  console.log(`geschrieben: ${eintraege.length} Einträge (Kino ${kino.length}, Serien- und Staffelstarts ${serien.length}, Folgen ${folgen.length})`);
} else console.log('keine Änderung');
