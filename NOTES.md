# Notizen: kestrel

Regeln: Nur diese Datei ändern, maximal 40 Zeilen, Veraltetes streichen. Dateien anderer Bereiche nicht anfassen.

## Erledigt
- 01.11.2026: Komplett-Redesign im Stil von apple.com, gepusht (Commit a951d97). Neu: `Nav.astro` (Glasleiste oben, Vollbild-Menü am Handy, Suche), `Ring.astro` (Wertungsring), Apple-Footer, Textseite im Newsroom-Stil mit Steckbrief als „Technische Daten“, neues Favicon (drei Ringe).
- Entfernt: Seitenleiste `Pille.astro`, `Szene.astro` samt `src/scripts/szene/`, Hell/Dunkel-Schalter, Uhr, eigener Mauszeiger, Kupferstich-Footer.
- `Kante.astro`: Unschärfe-Verlauf, immer am unteren Bildschirmrand auf allen Seiten; Footer hat unten passenden Abstand (`--kante`).
- `Reel.astro`: Bildstrecke auf der Startseite nach motionin.design „Cinema Reel“ (Spiele, Filme, Serien, Demnächst, Archiv). Bilder in `src/assets/reel/` (1672 × 941 px), Prompts in `src/assets/reel/_Bildprompts.md`, Bildausschnitt fürs Handy per `fokus` in `src/pages/index.astro`.
- `.claude/launch.json`: Startkonfiguration `kestrel` für die Vorschau (`npm run dev`, Port 4321).

## Offen
- Online-Stand nach dem Push nicht im Browser geprüft (Cloudflare-Build lokal sauber nachgebaut).
- `Gears of War E Day.md` steht lokal auf `entwurf: false` mit leeren Pflichtfeldern: lokaler Build und `npm run dev` brechen ab. Online gilt der Text noch als Entwurf.
- Bildstrecke: Bilder sind kein 4K; schärfere Fassungen gleichnamig in `src/assets/reel/` ersetzen.
- `DESIGN.md` und `.impeccable/` beschreiben noch das alte Papier-/Kinokarten-Design.
- Ungenutzte Pakete in package.json: `three`, Big Shoulders, Source Serif, Red Hat Mono.

## Entscheidungen
<!-- Format: Entscheidung – kurze Begründung -->
- Kein Hell/Dunkel-Schalter, nur Systemeinstellung – Apple-Richtlinie, keine eigene Darstellungswahl; alte Wahl wird aus localStorage gelöscht.
- Medienfarben wie Apple-Watch-Ringe: Film rot, Spiel grün, Serie türkis – Blau bleibt für Links und Knöpfe.
- Wertung als Ring, gefüllt bis zur Zahl – Erkennungszeichen, zeigt die eine Skala auf einen Blick.
- Systemschrift (SF Pro), Inter als Ersatz außerhalb von Apple-Geräten.
- Bildstrecke über natürliches Scrollen mit sanftem Einrasten statt abgefangenem Mausrad – Tastatur, Touch und reduzierte Bewegung funktionieren normal.
- Bilder über `src/assets` statt `public` – Astro verkleinert sie automatisch zu WebP.
