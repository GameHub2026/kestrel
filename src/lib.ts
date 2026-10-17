import { getCollection, type CollectionEntry } from 'astro:content';
import { vollstaendig } from './wertung';

export type Text = CollectionEntry<'tests'> & { nr: number };

// Alle veröffentlichten Texte, neueste zuerst. Entwürfe sieht man nur lokal (npm run dev), und nur wenn alle Pflichtfelder drinstehen.
// nr = laufende Kartennummer nach Datum (ältester Text = 1).
export async function alleTexte(): Promise<Text[]> {
  const alle = (await getCollection('tests'))
    .filter((t) => !(t.data.entwurf && (import.meta.env.PROD || !vollstaendig(t.data))))
    .sort((a, b) => a.data.datum.getTime() - b.data.datum.getTime());
  return alle.map((t, i) => ({ ...t, nr: i + 1 })).reverse();
}

const fmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const fmtLang = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const fmtMonat = new Intl.DateTimeFormat('de-DE', { month: 'long', timeZone: 'UTC' });
export const datum = (d: Date) => fmt.format(d);
export const datumLang = (d: Date) => fmtLang.format(d);
export const monat = (d: Date) => fmtMonat.format(d);
export const jahr = (d: Date) => d.getUTCFullYear();
export const nummer = (n: number) => 'Nº ' + String(n).padStart(4, '0');
export const url = (t: Text) => `/texte/${t.id}/`;
