# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (statische Seite aus Markdown-Dateien), gehostet auf Cloudflare Pages unter `kestrel-2tf.pages.dev` (eigene Domain später möglich). Jeder Push auf `main` deployt automatisch. Öffentlich, kein Cloudflare Access. Getrennt vom privaten GameHub/Wrenfell.

## Users

- **Primär: Fremde, die suchen.** Leute landen über Google auf einem einzelnen Text zu einem Spiel, Film oder einer Serie. Sie kennen Kevin nicht und müssen in Sekunden verstehen: was wurde bewertet, wie gut, für wen lohnt es sich.
- **Kevin selbst.** Schreibt als Hobby über Jahre und will zurückblicken können: was habe ich wann gespielt/geschaut, wie fand ich es damals.

## Product Purpose

Eine persönliche Sammlung von Tests und Kritiken zu Spielen, Filmen und Serien, öffentlich lesbar. Erfolg heißt: ein Suchender findet schnell Wertung, Fazit und „Für wen?" und liest dann gern weiter; Kevin hat nach Jahren ein Archiv, das sich wie ein Rückblick anfühlt.

## Positioning

Eine Stimme, eine feste Skala über alle Medien hinweg, und eine Chronik: alte Wertungen werden nie geändert, nur durch datierte Nachträge ergänzt. Dadurch sieht man ehrlich, wie sich ein Urteil über die Zeit entwickelt. Kein Redaktionsbetrieb, keine Werbung, kein Score-Rennen.

## Operating Context

- Kevin schreibt in Obsidian. Texte liegen als Markdown im Ordner `Texte/` (eine Datei pro Text, Frontmatter-Steckbrief). `_Vorlage.md` ist die Schreibvorlage; Dateien mit `_` am Anfang und `entwurf: true` werden nicht veröffentlicht.
- Kevin ist kein Programmierer. Claude baut und pflegt die Technik, Kevin schreibt nur.
- Leser kommen überwiegend direkt auf einen Einzeltext, oft am Handy.

## Capabilities and Constraints

- Medien: Spiel, Film, Serie. Alle auf einer gemeinsamen Seite.
- Textformen: Test, Kurzkritik, Ersteindruck, Rückblick.
- Steckbrief je Text: Titel, Medium, Textform, Plattform (optional), Zeitraum gespielt/geschaut, Spielzeit (optional), Stand (Abspann / 100 % / abgebrochen / läuft noch), Wertung, Fazit-Satz, „Für wen?", Datum, Nachträge.
- Wertung: ganze Zahlen 1–10, keine Teilnoten, keine Kommastellen, gleiche Skala für alle Medien. Jede Zahl hat einen festen Satz (Seite „Wie ich werte"): 10 Meisterwerk · 9 Herausragend, knapp am Meisterwerk · 8 Sehr gut, klare Empfehlung · 7 Gut, lohnt sich trotz kleiner Schwächen · 6 Ordentlich, mit Abstrichen · 5 Durchwachsen, Licht und Schatten halten sich die Waage · 4 Enttäuschend · 3 Schwach, kaum etwas trägt · 2 Zeitverschwendung · 1 Ärgerlich, ich bereue jede Minute.
- Alte Wertungen werden nie geändert; nur datierte Nachträge.
- Seiten: Startseite (neueste Texte), Einzeltext, Übersicht mit Filter (Medium/Textform/Jahr), Archiv nach Jahr, Wie ich werte.
- Bilder: optional pro Text ein Cover/Poster oder Screenshot. Die Seite muss ohne Bild genauso fertig aussehen.
- Später möglich, nicht jetzt: Spielzeit/Erfolgsstand aus GameHub in den Steckbrief holen.

## Brand Commitments

- Name: **Kestrel** (Turmfalke). Gewählt als kurzer, einprägsamer Name im Stil von Kevins privater Seite „Wrenfell".
- Absender: Kevin tritt mit Vornamen auf.
- Sprache: ausschließlich Deutsch.

## Evidence on Hand

- Ein Beispieltext (`Texte/mafia-the-old-country.md`) als Platzhalter, vor dem Start ersetzen.
- Noch keine echten Texte, keine Leserzahlen, keine Zitate. Nichts davon erfinden.

## Product Principles

1. **Urteil zuerst.** Wertung, Fazit und „Für wen?" sind auf jedem Text sofort sichtbar, bevor der Fließtext beginnt.
2. **Ehrlich über die Zeit.** Nachträge statt Korrekturen; das Datum ist Teil jeder Aussage.
3. **Eine Skala für alles.** Eine 7 bei einem Film bedeutet dasselbe wie eine 7 bei einem Spiel.
4. **Schreiben ohne Technik.** Alles, was Kevin pflegt, ist eine Markdown-Datei.
5. **Rückblick ist ein Feature.** Archiv und Jahre sind gleichwertige Wege durch die Sammlung, nicht nur ein Anhang.
