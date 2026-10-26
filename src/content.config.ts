import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { PFLICHT } from './wertung';
import { slug } from 'github-slugger';

// Kevin schreibt in Obsidian: jede .md-Datei im Ordner "Texte" ist ein Text.
// Dateien, deren Name mit "_" beginnt (z. B. _Vorlage.md), werden nicht veröffentlicht.

// Obsidian schreibt leere Eigenschaften als null und tippt Werte gern groß ("Spiel", "Rückblick", "100 %").
// Hinweistexte aus der Vorlage beginnen mit ✎ und zählen als "noch nicht ausgefüllt".
const leer = (v: unknown) =>
  v === null || v === '' || (typeof v === 'string' && v.trim().startsWith('✎')) ? undefined : v;
const norm = (v: unknown) =>
  typeof v === 'string' ? v.trim().toLowerCase().replace(/ü/g, 'ue').replace(/\s+/g, '') : v;
const wahl = <T extends [string, ...string[]]>(werte: T) => z.preprocess((v) => norm(leer(v)), z.enum(werte).optional());
const optional = <T extends z.ZodType>(t: T) => z.preprocess(leer, t.optional());

// Bild: Dateiname im Ordner des Textes ("cover.jpg"), ein Pfad ("bilder/x.jpg") oder was Obsidian beim Hineinziehen einträgt ("![](x.jpg)", "[[x.jpg]]").
const bildPfad = (v: unknown) => {
  v = leer(v);
  if (typeof v !== 'string') return v;
  let p = v.match(/\]\(([^)]+)\)/)?.[1] ?? v.match(/\[\[([^\]|]+)/)?.[1] ?? v;
  p = decodeURI(p.trim());
  return p.startsWith('.') ? p : './' + p;
};

const tests = defineCollection({
  // Jeder Text darf einen eigenen Ordner haben (Serien/Titel/Titel.md, Bilder daneben).
  // Die Adresse bleibt dann /texte/serien/titel/ statt /texte/serien/titel/titel/.
  loader: glob({
    pattern: ['**/*.md', '!**/_*.md'], base: './Texte',
    generateId: ({ entry }) => {
      const teile = entry.replace(/\.md$/i, '').split('/').map((t) => slug(t));
      if (teile.length > 1 && teile.at(-1) === teile.at(-2)) teile.pop();
      return teile.join('/');
    },
  }),
  schema: ({ image }) =>
    z
      .object({
        titel: optional(z.string()),
        medium: wahl(['spiel', 'film', 'serie']),
        textform: wahl(['test', 'kurzkritik', 'ersteindruck', 'rueckblick']),
        plattform: optional(z.coerce.string()),
        gespielt_geschaut: optional(z.coerce.string()), // Zeitraum, frei formuliert, z. B. "Sept.–Okt. 2026"
        spielzeit: optional(z.coerce.string()),
        stand: wahl(['abspann', '100%', 'abgebrochen', 'laufend']),
        wertung: optional(z.coerce.number().int().min(1).max(10)),
        fazit: optional(z.string()),
        fuer_wen: optional(z.string()),
        datum: z.coerce.date(),
        // Alte Wertungen werden nie geändert, nur datierte Nachträge angehängt.
        nachtraege: optional(z.array(z.object({ datum: z.coerce.date(), text: z.string() }))),
        // Optional: Cover, Poster oder Screenshot, Pfad relativ zur .md-Datei (z. B. ./bilder/mafia.jpg)
        bild: z.preprocess(bildPfad, image().optional()),
        bild_quelle: optional(z.string()),
        entwurf: z.preprocess(leer, z.boolean().default(false)),
      })
      .superRefine((d, ctx) => {
        if (d.entwurf) return;
        for (const k of PFLICHT) {
          if (d[k] === undefined) ctx.addIssue({ code: 'custom', path: [k], message: `${k} fehlt (nötig, sobald entwurf: false)` });
        }
      }),
});

export const collections = { tests };
