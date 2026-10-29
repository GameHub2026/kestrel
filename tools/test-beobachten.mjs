// Selbsttest fürs Beobachten (Auge): echter TMDB-/News-Abgleich mit einem Speicher im Arbeitsspeicher statt KV.
// Aufruf: node tools/test-beobachten.mjs   (TMDB-Schlüssel aus ../Claude - Spiele-Bibliothek/api-keys.txt)
import fs from 'node:fs';
import path from 'node:path';
import { neues } from '../server/merk.js';

const f = path.resolve(import.meta.dirname, '../../Claude - Spiele-Bibliothek/api-keys.txt');
const m = fs.existsSync(f) && fs.readFileSync(f, 'utf8').match(/^\s*TMDB API Key\s*[:=]\s*(.+)$/im);
const kv = new Map();
const env = {
  TMDB_KEY: process.env.TMDB_KEY || (m ? m[1].trim().replace(/^[<"'`]+|[>"'`]+$/g, '') : ''),
  MERK: { get: async (k, t) => (kv.has(k) ? (t === 'json' ? JSON.parse(kv.get(k)) : kv.get(k)) : null), put: async (k, v) => void kv.set(k, v) },
};
const archiv = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../src/data/news-archiv.json'), 'utf8'));
const demn = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../src/data/demnaechst.json'), 'utf8'));
// Titel aus Demnächst nehmen, die gerade News haben, und so tun, als würden sie seit 3 Tagen beobachtet
const mitNews = Object.entries(demn.infos).filter(([, i]) => i.news?.length).slice(0, 3);
const liste = mitNews.map(([k, i]) => ({ id: k.replace(/^movie-/, 'tmdb-movie:').replace(/^tv-/, 'tmdb-tv:'), medium: k.startsWith('movie') ? 'film' : 'serie', titel: i.titel, beobachten: true, gesehen: Date.now() - 3 * 864e5 }));
const d = await neues(env, liste, archiv);
for (const e of d) console.log(`${e.titel}: ${e.punkte.length} Punkte, ${e.punkte.filter((p) => p.neu).length} neu`, e.punkte.slice(0, 3).map((p) => `${p.art} | ${p.quelle} | ${p.titel.slice(0, 50)}`));
if (!d.every((e) => e.punkte.length)) { console.error('FEHLER: ein Titel ohne Punkte'); process.exit(1); }
console.log('ok');
