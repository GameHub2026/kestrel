// Schreibt aus Kevins Interview-Antworten einen lockeren Text (Gemini) und setzt seine Bilder dazwischen.
// Läuft beim Veröffentlichen für jede Notiz, deren Textbereich (über der INTERVIEW-Markierung) noch leer ist.
// Neu schreiben lassen: Text oberhalb der Markierung löschen oder "neu_schreiben: true" in den Steckbrief.
// Aufruf: node tools/text-schreiben.mjs [--nur "Teil des Dateinamens"] [--trocken]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TEXTE = path.join(ROOT, 'Texte');
const MODELL = 'gemini-3.6-flash';
const MARKE = /<!--\s*INTERVIEW[\s\S]*?-->/i;
const args = process.argv.slice(2);
const nur = args.includes('--nur') ? args[args.indexOf('--nur') + 1] : null;
const trocken = args.includes('--trocken');

function schluessel() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const f = path.resolve(ROOT, '../Claude - Spiele-Bibliothek/api-keys.txt');
  const m = fs.existsSync(f) && fs.readFileSync(f, 'utf8').match(/^\s*Gemini API Key\s*[:=]\s*(.+)$/im);
  return m ? m[1].trim().replace(/^[<"'`]+|[>"'`]+$/g, '') : '';
}

const alleMd = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) return e.name.startsWith('.') ? [] : alleMd(p);
  return e.name.endsWith('.md') && !e.name.startsWith('_') ? [p] : [];
});

const leer = (v) => !v || /^✎/.test(v.trim()) || v.trim() === '""';
function steckbrief(fm) {
  const d = {};
  for (const z of fm.split('\n')) {
    const m = z.match(/^([a-z_]+):\s*(.*)$/);
    if (m) d[m[1]] = m[2].replace(/^"(.*)"$/, '$1').trim();
  }
  return d;
}

// Interview zerlegen: Fragen-Kästen und die Antworten darunter; Bilder merken (mit dem Kasten, in dem sie liegen).
function interview(teil) {
  const bloecke = []; let akt = null;
  for (const z of teil.split('\n')) {
    const kopf = z.match(/^>\s*\[!frage\]\s*(.*)$/i);
    if (kopf) { akt = { titel: kopf[1].trim(), frage: '', antwort: [] }; bloecke.push(akt); continue; }
    if (!akt) continue;
    if (/^>/.test(z) && akt.antwort.length === 0) { akt.frage += z.replace(/^>\s?/, '') + ' '; continue; }
    akt.antwort.push(z.replace(/^>\s?/, ''));
  }
  const bilder = [];
  for (const b of bloecke) {
    const txt = b.antwort.join('\n');
    for (const m of txt.matchAll(/!\[[^\]]*\]\(([^)]+)\)|!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
      const datei = (m[1] || m[2]).trim();
      const zeile = b.antwort.find((z) => z.includes(datei)) || '';
      const nachher = b.antwort.slice(b.antwort.indexOf(zeile) + 1).find((z) => z.trim() && !z.includes('![')) || '';
      bilder.push({ datei, kontext: b.titel, beschreibung: nachher.trim() });
    }
    b.text = txt.replace(/!\[[^\]]*\]\([^)]+\)|!\[\[[^\]]+\]\]/g, '').trim();
  }
  return { bloecke: bloecke.filter((b) => b.titel.toLowerCase() !== 'bilder'), bilder };
}

const LAENGE = { kurzkritik: '250 bis 350 Wörter', test: '600 bis 900 Wörter', ersteindruck: '350 bis 550 Wörter', rueckblick: '450 bis 700 Wörter' };
const MEDIUM = { spiel: 'Spiel', film: 'Film', serie: 'Serie' };

function prompt(d, bloecke, bilder) {
  const antworten = bloecke.filter((b) => b.text).map((b) => `### ${b.titel}\nFrage: ${b.frage.trim()}\nKevins Antwort: ${b.text}`).join('\n\n');
  const bildliste = bilder.map((b, i) => `[[BILD ${i + 1}]]: aus dem Abschnitt „${b.kontext}“${b.beschreibung ? `, zeigt: ${b.beschreibung}` : ''}`).join('\n') || '(keine Bilder)';
  return `Du schreibst für Kevins private Kritik-Webseite „Kestrel“ eine Rezension auf Deutsch, in seiner Stimme (Ich-Form, locker, klug, persönlich, wie ein guter Freund mit Ahnung erzählt).

Steckbrief:
- ${MEDIUM[d.medium] || d.medium}: ${d.titel}
- Textform: ${d.textform} (Länge: ${LAENGE[d.textform] || '500 bis 800 Wörter'})
- Plattform: ${leer(d.plattform) ? 'unbekannt' : d.plattform}
- Gespielt/geschaut: ${d.gespielt_geschaut}; Umfang: ${leer(d.spielzeit) ? 'unbekannt' : d.spielzeit}; Stand: ${d.stand}
- Wertung: ${d.wertung}/10 (wird separat angezeigt, im Text nicht als Zahl nennen)

Kevins Interview-Antworten:
${antworten}

Bilder, die in den Text sollen:
${bildliste}

Regeln:
- Verwende NUR, was in Kevins Antworten und im Steckbrief steht. Erfinde keine Handlung, Namen, Zahlen, Zitate oder Erlebnisse. Fehlt etwas, lass es weg.
- Keine Spoiler über das hinaus, was Kevin selbst schreibt.
- Schreib so, wie Kevin redet: direkt, trocken, mit Humor. Übernimm seine Formulierungen aus den Antworten, wo sie gut sind, und mach daraus ganze Sätze, statt sie aufzublasen.
- Konkret statt allgemein: Jeder Absatz sagt etwas, das nur auf diesen Titel zutrifft.
- Verboten: Redewendungen und Sprichwörter (z. B. „Wo Licht ist, ist auch Schatten“, „aufs Gaspedal drücken“), Werbesprache, die Wörter insgesamt, eintauchen, Reise, Streifen, Spektakel, definitiv, prächtig, unheimlich, ein Muss, lässt keine Wünsche offen. Kein „wir“ oder „uns“. Keine Gedankenstriche (– oder —). Keine Aufzählungslisten. Keine rhetorischen Fragen.
- Fang mit einem Satz an, der neugierig macht (ein Bild, eine Beobachtung, eine klare Meinung), nicht mit Datum, Plattform oder „ich habe geschaut“. Keine Füllsätze wie „Der Inhalt ist schnell erklärt“, „Wenn ich zurückdenke“, „Das ist mir positiv in Erinnerung geblieben“.
- Datum, Plattform und Stand nur erwähnen, wenn sie etwas erzählen. Nichts über Kevins Verhalten behaupten, das er nicht selbst schreibt (z. B. nicht „bis zum Abspann sitzen geblieben“).
- Struktur: ein Einstieg ohne Überschrift, danach 2 bis 4 Zwischenüberschriften mit "## " (kurz und originell, keine Fragen, kein "Fazit"). Höchstens einmal ein kurzer Satz aus Kevins eigenen Worten als Zitatzeile mit "> ".
- Setze jedes Bild genau einmal als eigene Zeile mit dem Platzhalter (z. B. [[BILD 1]]) an eine passende Stelle zwischen zwei Absätzen, ungefähr dort, wo es inhaltlich hingehört. Keine anderen Bilder.
- Kein eigenes Fazit am Ende mit Wertung; der letzte Absatz darf aber einen Gedanken abrunden.
- Außerdem: ein Fazit-Satz (höchstens 20 Wörter) und ein „Für wen?“-Satz (höchstens 25 Wörter), beide in Kevins Ton.

Antworte ausschließlich mit JSON in dieser Form, ohne Codeblock:
{"text": "<Markdown-Text>", "fazit": "<ein Satz>", "fuer_wen": "<ein Satz>"}`;
}

async function gemini(key, text) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ model: MODELL, input: [{ type: 'text', text }] }),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const d = await r.json();
  for (const s of d.steps || []) { const t = (s.content || []).find((c) => c.type === 'text'); if (t?.text) return t.text.trim(); }
  throw new Error('Gemini hat keinen Text geliefert.');
}

function setzeFeld(fm, feld, wert) {
  const zeile = `${feld}: ${JSON.stringify(wert)}`;
  return new RegExp(`^${feld}:.*$`, 'm').test(fm) ? fm.replace(new RegExp(`^${feld}:.*$`, 'm'), zeile) : fm.replace(/\n---$/, `\n${zeile}\n---`);
}

const key = schluessel();
let anzahl = 0;
for (const datei of alleMd(TEXTE)) {
  if (nur && !datei.includes(nur)) continue;
  const roh = fs.readFileSync(datei, 'utf8');
  const fmEnde = roh.indexOf('\n---', 4);
  if (!roh.startsWith('---') || fmEnde < 0) continue;
  let fm = roh.slice(0, fmEnde + 4);
  const rest = roh.slice(fmEnde + 4);
  const marke = rest.match(MARKE);
  if (!marke) continue;
  const oben = rest.slice(0, marke.index);
  const unten = rest.slice(marke.index);
  const d = steckbrief(fm);
  const neu = /^(true|ja)$/i.test(d.neu_schreiben || '');
  if (oben.trim() && !neu) continue; // Text steht schon da (von Kevin oder der KI)

  const { bloecke, bilder } = interview(unten.slice(marke[0].length));
  const beantwortet = bloecke.filter((b) => b.text).length;
  if (beantwortet < 3) { if (beantwortet) console.log(`  ${d.titel}: erst ${beantwortet} Antworten, mindestens 3 nötig. Übersprungen.`); continue; }
  if (leer(d.titel) || leer(d.medium) || leer(d.wertung)) { console.log(`  ${path.basename(datei)}: Titel, Medium oder Wertung fehlt noch. Übersprungen.`); continue; }
  if (!key) { console.log('  Gemini-Schlüssel fehlt (api-keys.txt: "Gemini API Key").'); process.exit(1); }

  console.log(`  Schreibe Text für „${d.titel}“ (${beantwortet} Antworten, ${bilder.length} Bilder) …`);
  if (trocken) { console.log(prompt(d, bloecke, bilder)); continue; }
  let antwort = await gemini(key, prompt(d, bloecke, bilder));
  antwort = antwort.replace(/^```(?:json)?\s*|\s*```$/g, '');
  const j = JSON.parse(antwort);
  let text = String(j.text || '').trim();
  bilder.forEach((b, i) => { text = text.replace(new RegExp(`\\[\\[\\s*BILD ${i + 1}\\s*\\]\\]`, 'i'), `![${b.beschreibung.replace(/[\[\]]/g, '')}](${encodeURI(decodeURI(b.datei))})`); });
  text = text.replace(/\[\[\s*BILD \d+\s*\]\]/gi, '').trim(); // falls die KI eine Nummer erfindet

  if (leer(d.fazit) && j.fazit) fm = setzeFeld(fm, 'fazit', j.fazit);
  if (leer(d.fuer_wen) && j.fuer_wen) fm = setzeFeld(fm, 'fuer_wen', j.fuer_wen);
  if (neu) fm = fm.replace(/^neu_schreiben:.*\n/m, '');
  fs.writeFileSync(datei, `${fm}\n\n${text}\n\n${unten.replace(/^\n+/, '')}`);
  anzahl++;
}
console.log(anzahl ? `  ${anzahl} Text(e) geschrieben.` : '  Keine neuen Texte zu schreiben.');
