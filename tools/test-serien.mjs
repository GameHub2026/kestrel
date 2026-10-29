// Selbsttest für "Meine Serien": prüft echte Serien bei TMDB (und Trakt, falls Schlüssel da) mit Speicher im Arbeitsspeicher.
// Aufruf: node tools/test-serien.mjs   (Schlüssel aus ../Claude - Spiele-Bibliothek/api-keys.txt)
import fs from 'node:fs';
import path from 'node:path';
import { ladeSerien, traktAbgleich, pruefeTeil, mitNeu, neuAnzahl, serienTermine } from '../server/serien.js';

const f = path.resolve(import.meta.dirname, '../../Claude - Spiele-Bibliothek/api-keys.txt');
const txt = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
const wert = (name) => (txt.match(new RegExp(`^\\s*${name}\\s*[:=]\\s*(.+)$`, 'im'))?.[1] || '').trim().replace(/^[<"'`]+|[>"'`]+$/g, '');
const kv = new Map();
const env = {
  TMDB_KEY: wert('TMDB API Key'), TRAKT_CLIENT_ID: wert('Trakt Client ID'), TRAKT_USER: wert('Trakt (?:Benutzername|User(?:name)?)'),
  MERK: { get: async (k, t) => (kv.has(k) ? (t === 'json' ? JSON.parse(kv.get(k)) : kv.get(k)) : null), put: async (k, v) => void kv.set(k, v) },
};
const archiv = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../src/data/news-archiv.json'), 'utf8'));
const d = await ladeSerien(env);
try { console.log('Trakt: neu dazu', await traktAbgleich(env, d)); } catch (e) { console.log('Trakt übersprungen:', e.message); }
// Feste Testserien (Severance, The Last of Us, Our Flag Means Death)
for (const id of [95396, 100088, 113988]) if (!d.serien.some((s) => s.id === `tmdb-tv:${id}`)) d.serien.push({ id: `tmdb-tv:${id}`, titel: '', quelle: 'hand', bekannt: {}, punkte: [] });
let ab = 0;
while (ab !== null) { const r = await pruefeTeil(env, d, archiv, ab); if (r.fehler.length) console.log('Fehler', r.fehler); ab = r.weiter; }
const m = mitNeu(d);
console.log(`${m.length} Serien, ${neuAnzahl(d)} Hinweise neu, ${serienTermine(d).length} Staffelstarts im Kalender`);
for (const s of m.filter((x) => x.punkte.some((p) => p.neu)).slice(0, 8)) console.log(`- ${s.titel} (${s.quelle}, ${s.status}):`, s.punkte.filter((p) => p.neu).slice(0, 3).map((p) => `${p.art}: ${p.titel.slice(0, 60)}`));
if (!m.find((s) => s.id === 'tmdb-tv:95396')?.titel) { console.error('FEHLER: Testserie ohne Titel'); process.exit(1); }

// Film mit Reihe: Avatar: The Way of Water (76600) → weitere Avatar-Teile
const film = { id: 'tmdb-movie:76600', medium: 'film', titel: '', quelle: 'hand', bekannt: {}, punkte: [] };
const { pruefeSerie } = await import('../server/serien.js');
await pruefeSerie(env, film, archiv);
console.log('Film:', film.titel, '|', film.reihe, '|', film.status, '|', JSON.stringify(film.naechste), film.punkte.filter((p) => p.art === 'staffel').map((p) => p.titel));
if (!film.titel) { console.error('FEHLER: Film ohne Titel'); process.exit(1); }
console.log('ok');
