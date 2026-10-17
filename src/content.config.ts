import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Kevin schreibt in Obsidian: jede .md-Datei im Ordner "Texte" ist ein Text.
// Dateien, deren Name mit "_" beginnt (z. B. _Vorlage.md), werden nicht veröffentlicht.

// Obsidian schreibt leere Eigenschaften als null und tippt Werte gern groß ("Spiel", "Rückblick", "100 %").
const leer = (v: unknown) => (v === null || v === '' ? undefined : v);
const norm = (v: unknown) =>
  typeof v === 'string' ? v.trim().toLowerCase().replace(/ü/g, 'ue').replace(/\s+/g, '') : v;
const wahl = <T extends [string, ...string[]]>(werte: T) => z.preprocess(norm, z.enum(werte));
const optional = <T extends z.ZodType>(t: T) => z.preprocess(leer, t.optional());

// Erst wenn ein Text veröffentlicht wird (entwurf: false), müssen diese Felder ausgefüllt sein.
const PFLICHT_BEIM_VEROEFFENTLICHEN = ['gespielt_geschaut', 'wertung', 'fazit', 'fuer_wen'] as const;

const tests = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './Texte' }),
  schema: ({ image }) =>
    z
      .object({
        titel: z.string(),
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
        bild: optional(image()),
        bild_quelle: optional(z.string()),
        entwurf: z.preprocess(leer, z.boolean().default(false)),
      })
      .superRefine((d, ctx) => {
        if (d.entwurf) return;
        for (const k of PFLICHT_BEIM_VEROEFFENTLICHEN) {
          if (d[k] === undefined) ctx.addIssue({ code: 'custom', path: [k], message: `${k} fehlt (nötig, sobald entwurf: false)` });
        }
      }),
});

export const collections = { tests };
