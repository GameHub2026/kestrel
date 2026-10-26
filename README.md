# Kestrel

Kevins öffentliche Seite für Tests und Kritiken zu Spielen, Filmen und Serien.
Technik: Astro (statische Seite aus Markdown), Hosting: Cloudflare Pages (`kestrel-2tf.pages.dev`).

## Schreiben (in Obsidian)

1. Doppelklick auf **`Neuer Text.command`**: Medium wählen, Titel eingeben. Es entsteht ein eigener Ordner `Texte/<Spiele|Filme|Serien>/<Titel>/` mit der Notiz, die sich in Obsidian öffnet.
2. Steckbrief oben ausfüllen (✎-Hinweise ersetzen). Wertung immer selbst eintragen.
3. Das **Interview** beantworten: Stichworte direkt unter den Kästen reichen. Mindestens 3 Antworten.
4. Bilder in den Kasten **„Bilder“** ziehen und darunter kurz schreiben, was sie zeigen. Sie landen automatisch im Ordner des Textes. Titelbild: Dateiname ins Feld `bild` (z. B. `cover.jpg`).
5. Doppelklick auf **`Veröffentlichen.command`**: Bilder werden verkleinert, Gemini schreibt aus dem Interview den Text (oberhalb der INTERVIEW-Zeile) und ergänzt leere Felder Fazit/Für wen. Mit `entwurf: false` geht er dann online, sonst nur lokal sichtbar.

Alles unterhalb der Zeile `<!-- INTERVIEW … -->` bleibt privat. Text neu schreiben lassen: Text oberhalb der Zeile löschen oder `neu_schreiben: true` in den Steckbrief. Eigene Änderungen am fertigen Text werden nie überschrieben.

**Alte Wertung nie ändern.** Wenn du etwas später anders siehst, unter `nachtraege:` einen Eintrag mit Datum anhängen.

Dateien, die mit `_` beginnen, werden nie veröffentlicht.

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
4. Projektname: `kestrel` (ergibt `kestrel-2tf.pages.dev`, weil `kestrel` vergeben ist). Produktionszweig: `main`.
5. Framework-Voreinstellung: **Astro**. Build-Befehl: `npm run build`. Ausgabeverzeichnis: `dist`. (Die Node-Version kommt aus `.node-version`.)
6. **Speichern und bereitstellen.** Kein Access/Zero-Trust einrichten.

Bekommt das Projekt eine andere Adresse als `kestrel-2tf.pages.dev` (Name vergeben), in `astro.config.mjs` den Wert `site` anpassen.

## Merkliste (privat)

`kestrel-2tf.pages.dev/merkliste/` ist privat (nicht verlinkt, nicht in Suchmaschinen, nur mit Zugangsschlüssel). Suchen, merken, Termine verfolgen; Termine kommen von IGDB (Spiele) und TMDB (Filme, Serien) und werden alle 12 Stunden beim Abruf erneuert. Der Kalender lässt sich in Apple Kalender abonnieren.

- Daten: Cloudflare-KV `MERK` (siehe `wrangler.toml`), Server-Code in `server/merk.js` und `functions/`.
- Schlüssel: stehen in `api-keys.txt` der Spiele-Bibliothek und werden mit `tools/secrets-setzen.sh` ins Pages-Projekt übertragen (danach einmal neu deployen).
- Kalender-Selbsttest: `node tools/test-kalender.mjs`.

## Obsidian-Listen

In jedem Ordner liegen `_Ideen.md`, `_Topliste 2026.md` und eine Schreibhilfe `_So schreibe ich über …`. Ideen und Toplisten sind per `.gitignore` aus dem öffentlichen Repo herausgehalten und liegen nur in iCloud.
