# Notizen: kestrel

Regeln: Nur diese Datei ändern, maximal 40 Zeilen, Veraltetes streichen. Dateien anderer Bereiche nicht anfassen.

## Erledigt
- 01.11.2026: Komplett-Redesign im Stil von apple.com, gepusht (Commit a951d97). Neu: `Nav.astro` (Glasleiste oben, Vollbild-Menü am Handy, Suche), `Ring.astro` (Wertungsring), Apple-Footer, Textseite im Newsroom-Stil mit Steckbrief als „Technische Daten“, neues Favicon (drei Ringe).
- Entfernt: Seitenleiste `Pille.astro`, `Szene.astro` samt `src/scripts/szene/`, Uhr, eigener Mauszeiger.
- `Kante.astro`: Unschärfe-Verlauf, immer am unteren Bildschirmrand auf allen Seiten; Footer hat unten passenden Abstand (`--kante`).
- `Reel.astro`: Bildstrecke auf der Startseite nach motionin.design „Cinema Reel“ (Spiele, Filme, Serien, Demnächst, Archiv). Bilder in `src/assets/reel/` (1672 × 941 px), Prompts in `src/assets/reel/_Bildprompts.md`, Bildausschnitt fürs Handy per `fokus` in `src/pages/index.astro`.
- Hell/Dunkel-Schalter in der Navigation (Sonne/Mond), Wahl in localStorage `kestrel-theme`, sonst Systemeinstellung. Farben zentral in `global.css` (`:root`, dunkel per Media-Query und `[data-theme='dark']`). Helle Bildkarten: `spiele-hell.jpeg` usw. in `src/assets/reel/` (alle fünf eingelegt, 1376 × 768 px, eigener Handy-Ausschnitt per `fokusHell`), Prompts in `_Bildprompts.md`.
- Startseite: „Kestrel“ steht über „Ehrlich bewertet.“ und gleitet beim Scrollen an seinen Platz oben links in der Navigation (Skript in `index.astro`, Ziel `#gn-wort` in `Nav.astro`). Schalter, helle Bilder und Schriftzug gepusht (Commit 2f3ca72).
- Footer wieder blau nach Vorlage (collectui „sequel“, Pranav): Serifenschrift Source Serif 4, Spalten, Suche, gestochene Landschaft auf Canvas. Pferd und Reiter neu als eigene Vektorzeichnung `Reiter.astro` in Haltung und Holzschnitt-Stil der Vorlage (nicht deren Bild). Unschärfe-Verlauf übernimmt über dem Footer Blau bzw. Creme (`--kante-ton`). Gepusht am 01.11.2026.
- `.claude/launch.json`: Startkonfiguration `kestrel` für die Vorschau (`npm run dev`, Port 4321).
- Testen, solange ein Text lokal den Build blockiert: Projekt ohne `node_modules` in den Scratchpad kopieren, den Text dort auf `entwurf: true` setzen, `node_modules.nosync` verlinken, dort bauen. Im versteckten Browser-Fenster laufen requestAnimationFrame und CSS-Übergänge nicht; Bewegung dann per Timer-Ersatz für requestAnimationFrame messen.

## Offen
- `archiv-hell.jpeg` zeigt ein echtes Super-Mario-Modul (Nintendo-Logo) und eine Fujifilm-Dose; auf Kevins Wunsch trotzdem veröffentlicht. Bei Bedarf gleichnamig ersetzen.
- Online-Stand nach dem Push nicht im Browser geprüft (Cloudflare-Build lokal sauber nachgebaut).
- `Gears of War E Day.md` steht lokal auf `entwurf: false` mit leeren Pflichtfeldern: lokaler Build und `npm run dev` brechen ab. Online gilt der Text noch als Entwurf.
- Bildstrecke: Bilder sind kein 4K; schärfere Fassungen gleichnamig in `src/assets/reel/` ersetzen.
- `DESIGN.md` und `.impeccable/` beschreiben noch das alte Papier-/Kinokarten-Design.
- Ungenutzte Pakete in package.json: `three`, Big Shoulders, Source Serif, Red Hat Mono.

## Entscheidungen
<!-- Format: Entscheidung – kurze Begründung -->
- Hell/Dunkel-Schalter doch wieder eingebaut – Kevins Wunsch; ohne Wahl gilt die Systemeinstellung.
- Medienfarben wie Apple-Watch-Ringe: Film rot, Spiel grün, Serie türkis – Blau bleibt für Links und Knöpfe.
- Wertung als Ring, gefüllt bis zur Zahl – Erkennungszeichen, zeigt die eine Skala auf einen Blick.
- Systemschrift (SF Pro), Inter als Ersatz außerhalb von Apple-Geräten.
- Bildstrecke über natürliches Scrollen mit sanftem Einrasten statt abgefangenem Mausrad – Tastatur, Touch und reduzierte Bewegung funktionieren normal.
- Reiter selbst gezeichnet statt Vorlagenbild eingebunden – das Bild gehört dem Designer; Haltung und Stil nachgebaut.
- Footer in Hell und Dunkel gleich blau – feste Druckfarbe der Illustration.
- Bilder über `src/assets` statt `public` – Astro verkleinert sie automatisch zu WebP.
- Helle Bildkarten blenden per `--hell-an` über das dunkle Bild – weicher Wechsel beim Umschalten, ohne helles Bild bleibt die Karte dunkel.
- Helles Archivbild trotz Nintendo-/Fujifilm-Marken veröffentlicht – Kevins ausdrückliche Entscheidung.
