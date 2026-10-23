// Selbsttest für den Kalender-Export: node tools/test-kalender.mjs
import assert from 'node:assert';
import { kalender } from '../server/merk.js';

const ics = kalender([
  { id: 'tmdb-tv:1', medium: 'serie', titel: 'Severance, die Serie; mit sehr langem Titel der umgebrochen werden muss', kalender: true,
    termine: [{ datum: '2026-11-14', text: 'S2E3 · Ein Titel' }, { datum: 'TBD', text: 'x' }] },
  { id: 'igdb:5', medium: 'spiel', titel: 'Aus', kalender: false, termine: [{ datum: '2026-12-01', text: 'Release' }] },
]);
assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.endsWith('END:VCALENDAR\r\n'));
assert.strictEqual((ics.match(/BEGIN:VEVENT/g) || []).length, 1, 'nur Einträge mit Kalender-Haken und gültigem Datum');
assert.ok(ics.includes('DTSTART;VALUE=DATE:20261114') && ics.includes('DTEND;VALUE=DATE:20261115'));
assert.ok(ics.includes('Severance\\, die Serie\;'), 'Sonderzeichen maskiert');
for (const z of ics.split('\r\n')) assert.ok(new TextEncoder().encode(z).length <= 75, `Zeile zu lang: ${z}`);
console.log('Kalender-Test ok');
