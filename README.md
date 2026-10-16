# Kestrel

Kevins öffentliche Seite für Tests und Kritiken zu Spielen, Filmen und Serien.
Technik: Astro (statische Seite aus Markdown), Hosting: Cloudflare Pages (`kestrel.pages.dev`).

## Schreiben (in Obsidian)

1. In Obsidian **„Ordner als Vault öffnen"** → den Ordner `Texte` in diesem Projekt wählen.
2. `_Vorlage.md` kopieren, umbenennen (z. B. `alan-wake-2.md`). Der Dateiname wird die Adresse: `kestrel.pages.dev/texte/alan-wake-2/`.
3. Steckbrief oben ausfüllen, darunter den Text schreiben. Überschriften mit `##`, Zitat-Zeile mit `>`.
4. Solange `entwurf: true` dasteht, erscheint der Text nur lokal, nicht online. Zum Veröffentlichen auf `entwurf: false` setzen.

**Felder:** `medium` = spiel | film | serie · `textform` = test | kurzkritik | ersteindruck | rueckblick · `stand` = abspann | 100% | abgebrochen | laufend · `wertung` = ganze Zahl 1–10.

**Alte Wertung nie ändern.** Wenn du etwas später anders siehst, unter `nachtraege:` einen Eintrag mit Datum anhängen.

**Bild (optional):** Bild neben die `.md`-Datei legen (z. B. `Texte/bilder/alan-wake-2.jpg`) und im Steckbrief `bild: ./bilder/alan-wake-2.jpg` sowie `bild_quelle: Remedy Entertainment` eintragen.

Dateien, die mit `_` beginnen, werden nie veröffentlicht.

**Vor dem Start löschen:** `Texte/mafia-the-old-country.md` (Beispieltext) und `Texte/beispiel-*.md` (Test-Entwürfe).

## Lokal ansehen

```bash
npm run dev
```

Dann <http://localhost:4321> öffnen. (`node_modules` liegt als `node_modules.nosync` außerhalb der iCloud-Synchronisierung.)

## Veröffentlichen

Jeder `git push` auf `main` baut die Seite bei Cloudflare Pages neu (Build-Befehl `npm run build`, Ausgabe `dist`). Öffentlich, ohne Cloudflare Access.
