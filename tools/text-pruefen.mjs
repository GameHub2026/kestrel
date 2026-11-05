// Prüft vor dem Veröffentlichen: Hat jeder Text, der online soll (entwurf: false), schon einen Text über der INTERVIEW-Markierung?
// Die Texte schreibt Claude in einer Session, nicht dieses Skript. Fehlt einer, bricht das Veröffentlichen ab.
import fs from 'node:fs';
import path from 'node:path';

const TEXTE = path.resolve(import.meta.dirname, '..', 'Texte');
const MARKE = /<!--\s*INTERVIEW/i;

const alleMd = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) return e.name.startsWith('.') ? [] : alleMd(p);
  return e.name.endsWith('.md') && !e.name.startsWith('_') ? [p] : [];
});

const fehlt = [];
for (const datei of alleMd(TEXTE)) {
  const roh = fs.readFileSync(datei, 'utf8');
  const fmEnde = roh.indexOf('\n---', 4);
  if (!roh.startsWith('---') || fmEnde < 0) continue;
  const fm = roh.slice(0, fmEnde);
  if (/^entwurf:\s*(true|ja)\s*$/im.test(fm)) continue;
  const rest = roh.slice(fmEnde + 4);
  const m = rest.match(MARKE);
  if (!m) continue;
  const oben = rest.slice(0, m.index);
  // Nur Steckbrief ohne Interview-Antworten (z. B. Our Flag Means Death) darf so online bleiben.
  const antworten = rest.slice(m.index).split('\n').filter((z) => z.trim() && !/^\s*>/.test(z) && !/^<!--/.test(z) && !/^!\[/.test(z));
  if (!oben.trim() && antworten.length) fehlt.push(path.relative(TEXTE, datei));
}

if (fehlt.length) {
  console.log('  Für diese Texte fehlt noch der Text über dem Interview:');
  for (const f of fehlt) console.log(`   · ${f}`);
  console.log('  Sag Claude Bescheid, dann wird er geschrieben. Oder setz „entwurf: true“, solange er nicht fertig ist.');
  process.exit(1);
}
console.log('  Alle Texte haben Inhalt.');
