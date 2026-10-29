// Gemeinsame Zuordnung von Schlagzeilen zu Titeln (Demnächst-Holer und beobachtete Merkliste-Einträge).
// Der Titel (deutsch oder Original) muss als ganzes Wort in der Überschrift stehen.
// Kurze Ein-Wort-Titel ("Buddy", "From") müssen zitiert sein oder vor Staffel/Season/Trailer stehen, plus Kontextwort.
export const KONTEXT = {
  film: /\b(film|serie|staffel|trailer|kino|movie|series|season|episode|teaser|part|teil|netflix|disney|prime|hbo|apple tv|paramount)/i,
  spiel: /\b(spiel|game|games|gameplay|trailer|teaser|patch|update|dlc|release|demo|ps5|playstation|xbox|switch|steam|pc|remake|remaster)/i,
};
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function passt(namen, schlagzeile, kontext = KONTEXT.film) {
  return namen.some((name) => {
    if (!name || name.length < 3) return false;
    if (!new RegExp(`(^|[^\\p{L}\\p{N}])${esc(name)}($|[^\\p{L}\\p{N}])`, 'iu').test(schlagzeile)) return false;
    const kern = name.replace(/^(the|a|an|der|die|das|ein|eine)\s+/i, '');
    if (kern.includes(' ') || kern.length >= 9) return true;
    // Kurze Ein-Wort-Titel ("From", "Dune"): nur in Anführungszeichen oder direkt vor Staffel/Season/Trailer/Teil
    const n = esc(name);
    const zitiert = new RegExp(`["'‘’“”„«»]${n}["'‘’“”„«»]`, 'iu').test(schlagzeile);
    const davor = new RegExp(`(^|[^\\p{L}])${n}:?\\s+(staffel|season|trailer|teaser|teil|part|folge|episode|film|movie|series|serie)\\b`, 'iu').test(schlagzeile);
    return (zitiert || davor) && kontext.test(schlagzeile);
  });
}

// ---------- Doppelte bündeln ----------
// Mehrere Meldungen über dasselbe Ereignis (z. B. derselbe Trailer bei Variety, Deadline und Moviepilot) werden zu einem
// Eintrag zusammengefasst: gleiche Ereignis-Art (Trailer, Termin, Besetzung, Staffel, Status) innerhalb von 3 Tagen,
// oder fast gleiche Überschrift. Ein Trailer von YouTube schluckt die Trailer-News derselben Tage.
const EREIGNIS = [
  ['trailer', /\b(trailer|teaser|first look|erster blick|vorschau)\b/i],
  ['termin', /\b(starttermin|startdatum|release date|premiere date|kinostart|startet am|erscheint am|launch date|sets? (a )?date|dated)\b/i],
  ['staffel', /\b(staffel|season)\s*\d+|\b(verlängert|renewed|abgesetzt|cancell?ed|eingestellt)\b/i],
  ['besetzung', /\b(cast|casts|casting|joins|besetzt|besetzung|stars?)\b/i],
];
const FUELL = new Set('the a an of and or to in on for with at by from is are be as its it this that der die das ein eine und oder zu im in am an auf für mit von bei ist sind wird werden den dem des new neu neue neuer neues first erste erster'.split(' '));
const woerter = (t) => new Set(t.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w.length > 2 && !FUELL.has(w)));
const aehnlich = (a, b) => { const x = woerter(a), y = woerter(b); let n = 0; for (const w of x) if (y.has(w)) n++; return n / Math.max(1, Math.min(x.size, y.size)); };
const ereignis = (t) => EREIGNIS.find(([, re]) => re.test(t))?.[0] || null;
const DREI_TAGE = 3 * 864e5;
const deutsch = (q) => /moviepilot|serienjunkies|dwdl|spiegel|gamestar|gamepro|pc games|eurogamer\.de|play3/i.test(q || '');

export function buendeln(punkte) {
  const raus = [];
  for (const p of [...punkte].sort((a, z) => String(z.datum).localeCompare(String(a.datum)))) {
    if (p.art !== 'news' && p.art !== 'trailer') { raus.push(p); continue; }
    const e = p.art === 'trailer' ? 'trailer' : ereignis(p.titel);
    const t = Date.parse(p.datum);
    const ziel = raus.find((q) => (q.art === 'news' || q.art === 'trailer') && Math.abs(Date.parse(q.datum) - t) <= DREI_TAGE &&
      ((e && e === (q.art === 'trailer' ? 'trailer' : ereignis(q.titel)) && !(p.art === 'trailer' && q.art === 'trailer')) || aehnlich(p.titel, q.titel) >= 0.6));
    if (!ziel) { raus.push({ ...p }); continue; }
    // Kopf des Bündels: YouTube-Trailer vor deutscher Meldung vor allem anderen
    const rang = (x) => (x.art === 'trailer' ? 0 : deutsch(x.quelle) ? 1 : 2);
    const [kopf, dazu] = rang(p) < rang(ziel) ? [{ ...p }, ziel] : [ziel, p];
    const auch = [...new Set([...(kopf.auch || []), ...(dazu.auch || []), dazu.quelle].filter((q) => q && q !== kopf.quelle))];
    Object.assign(ziel, kopf, { auch, datum: [ziel.datum, p.datum].sort().pop() });
  }
  return raus;
}
