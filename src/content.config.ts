import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Kevin schreibt in Obsidian: jede .md-Datei im Ordner "Texte" ist ein Text.
// Dateien, deren Name mit "_" beginnt (z. B. _Vorlage.md), werden nicht veröffentlicht.
const tests = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './Texte' }),
  schema: ({ image }) => z.object({
    titel: z.string(),
    medium: z.enum(['spiel', 'film', 'serie']),
    textform: z.enum(['test', 'kurzkritik', 'ersteindruck', 'rueckblick']),
    plattform: z.string().optional(),
    gespielt_geschaut: z.string(), // Zeitraum, frei formuliert, z. B. "Sept.–Okt. 2026"
    spielzeit: z.string().optional(),
    stand: z.enum(['abspann', '100%', 'abgebrochen', 'laufend']),
    wertung: z.number().int().min(1).max(10),
    fazit: z.string(),
    fuer_wen: z.string(),
    datum: z.coerce.date(),
    // Alte Wertungen werden nie geändert, nur datierte Nachträge angehängt.
    nachtraege: z.array(z.object({ datum: z.coerce.date(), text: z.string() })).optional(),
    // Optional: Cover, Poster oder Screenshot, Pfad relativ zur .md-Datei (z. B. ./bilder/mafia.jpg)
    bild: image().optional(),
    bild_quelle: z.string().optional(),
    entwurf: z.boolean().default(false),
  }),
});

export const collections = { tests };
