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

Repo: <https://github.com/GameHub2026/kestrel> (öffentlich: auch Entwürfe in `Texte/` sind dort lesbar).
Jeder `git push` auf `main` baut die Seite bei Cloudflare Pages neu. Öffentlich, **ohne** Cloudflare Access.

### Einmalig: Cloudflare Pages verbinden

1. <https://dash.cloudflare.com> → **Workers & Pages** → **Erstellen** → Reiter **Pages** → **Vorhandenes Git-Repository importieren**.
2. GitHub wählen. Falls `kestrel` nicht in der Liste steht: **GitHub-Berechtigungen konfigurieren** und dem Cloudflare-App-Zugriff das Repo `GameHub2026/kestrel` hinzufügen.
3. Repo `kestrel` auswählen → **Einrichtung beginnen**.
4. Projektname: `kestrel` (ergibt `kestrel.pages.dev`). Produktionszweig: `main`.
5. Framework-Voreinstellung: **Astro**. Build-Befehl: `npm run build`. Ausgabeverzeichnis: `dist`. (Die Node-Version kommt aus `.node-version`.)
6. **Speichern und bereitstellen.** Kein Access/Zero-Trust einrichten.

Bekommt das Projekt eine andere Adresse als `kestrel.pages.dev` (Name vergeben), in `astro.config.mjs` den Wert `site` anpassen.
