// Gemeinsame Zuordnung von Schlagzeilen zu Titeln (Demnächst-Holer und beobachtete Merkliste-Einträge).
// Der Titel (deutsch oder Original) muss als ganzes Wort in der Überschrift stehen.
// Kurze Ein-Wort-Titel ("Buddy", "Wicker") brauchen zusätzlich ein passendes Kontextwort, sonst zu viele Fehltreffer.
export const KONTEXT = {
  film: /\b(film|serie|staffel|trailer|kino|movie|series|season|episode|teaser|netflix|disney|prime|hbo|apple tv|paramount)/i,
  spiel: /\b(spiel|game|games|gameplay|trailer|teaser|patch|update|dlc|release|demo|ps5|playstation|xbox|switch|steam|pc|remake|remaster)/i,
};
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function passt(namen, schlagzeile, kontext = KONTEXT.film) {
  return namen.some((name) => {
    if (!name || name.length < 3) return false;
    if (!new RegExp(`(^|[^\\p{L}\\p{N}])${esc(name)}($|[^\\p{L}\\p{N}])`, 'iu').test(schlagzeile)) return false;
    const kern = name.replace(/^(the|a|an|der|die|das|ein|eine)\s+/i, '');
    return kern.includes(' ') || kern.length >= 9 || kontext.test(schlagzeile);
  });
}
