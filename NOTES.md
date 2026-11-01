# Notizen: kestrel

Regeln: Nur diese Datei ändern, maximal 40 Zeilen, Veraltetes streichen. Dateien anderer Bereiche nicht anfassen.

## Erledigt
- 01.11.2026: Komplett-Redesign im Stil von apple.com, committet und gepusht. Neu: `Nav.astro` (Glasleiste oben, Vollbild-Menü am Handy, Suche), `Ring.astro` (Wertungsring), Apple-Footer, Textseite im Newsroom-Stil mit Steckbrief als „Technische Daten“. Entfernt: Seitenleiste `Pille.astro`, `Szene.astro` samt `src/scripts/szene/`, Hell/Dunkel-Schalter, Uhr, eigener Mauszeiger, Kupferstich-Footer.
- 01.11.2026: `Kante.astro` (Unschärfe-Verlauf, immer unten am Bildschirm, alle Seiten) und `Reel.astro` (Bildstrecke nach motionin.design „Cinema Reel“ auf der Startseite: Spiele, Filme, Serien, Demnächst, Archiv). Bilder liegen in `src/assets/reel/` (spiele, filme, serien, demnaechst, archiv; 1672 × 941 px), Prompts in `_Bildprompts.md` daneben.

## Offen
- Bildstrecke: Bilder sind 1672 × 941 px; echte 4K-Fassungen würden auf großen Bildschirmen schärfer wirken.
- `Gears of War E Day.md` hat `entwurf: false`, aber leere Pflichtfelder: Build und `npm run dev` brechen ab, bis der Text fertig ist oder wieder `entwurf: true` hat.
- `DESIGN.md` und `.impeccable/` beschreiben noch das alte Papier-/Kinokarten-Design.
- Ungenutzte Pakete: `three`, Big Shoulders, Source Serif, Red Hat Mono (in package.json, können raus).
- Testkopie für Vorschau: Startkonfiguration `kestrel-testkopie` in `.claude/launch.json` (Scratchpad, nur für diese Sitzung).

## Entscheidungen
<!-- Format: Entscheidung – kurze Begründung -->
- Kein Hell/Dunkel-Schalter mehr, nur Systemeinstellung – Apple-Richtlinie, keine eigene Darstellungswahl.
- Medienfarben wie Apple-Watch-Ringe: Film rot, Spiel grün, Serie türkis – Blau bleibt für Links und Knöpfe reserviert.
- Wertung als Ring, gefüllt bis zur Zahl – Erkennungszeichen, zeigt die eine Skala auf einen Blick.
- Systemschrift (SF Pro), Inter als Ersatz außerhalb von Apple-Geräten.
