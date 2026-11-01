---
name: Kestrel
description: Spiele, Filme und Serien von Kevin. Ehrlich bewertet, eine Skala von 1 bis 10 für alle drei Medien. Gestaltet im Stil von apple.com.
colors:
  film: "#ff3b30"
  spiel: "#34c759"
  serie: "#00c7be"
  ground: "#ffffff"
  ground-2: "#f5f5f7"
  tile: "#f5f5f7"
  ink: "#1d1d1f"
  ink-2: "#6e6e73"
  ink-3: "#86868b"
  link: "#0066cc"
  blue: "#0071e3"
  fill: "#e8e8ed"
  line: "#d2d2d7"
  neu: "#bf4800"
  film-dark: "#ff453a"
  spiel-dark: "#30d158"
  serie-dark: "#63e6e2"
  ground-dark: "#000000"
  ground-2-dark: "#161617"
  tile-dark: "#161617"
  paper-dark: "#1d1d1f"
  ink-dark: "#f5f5f7"
  ink-2-dark: "#a1a1a6"
  link-dark: "#2997ff"
  fill-dark: "#2c2c2e"
  line-dark: "#424245"
  neu-dark: "#ff9f0a"
  fuss-blau: "#1d3d9c"
  fuss-creme: "#efe6cf"
typography:
  hero:
    fontFamily: "-apple-system, SF Pro Display, Inter Variable, Helvetica Neue, sans-serif"
    fontSize: "clamp(48px, 8vw, 96px)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "-apple-system, SF Pro Display, Inter Variable, sans-serif"
    fontSize: "clamp(36px, 5.4vw, 56px)"
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: "-0.005em"
  subhead:
    fontFamily: "-apple-system, SF Pro Display, Inter Variable, sans-serif"
    fontSize: "clamp(21px, 2.6vw, 28px)"
    fontWeight: 400
    lineHeight: 1.14
  body:
    fontFamily: "-apple-system, SF Pro Text, Inter Variable, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: "-0.022em"
  prose:
    fontFamily: "-apple-system, SF Pro Text, Inter Variable, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.58
    letterSpacing: "0.012em"
  fuss:
    fontFamily: "Source Serif 4 Variable, Georgia, serif"
    fontSize: "0.92–2rem"
    fontWeight: 400
rounded:
  pill: "980px"
  card: "18px"
  card-lg: "28px"
  reel: "clamp(28px, 3.4vw, 48px)"
  archiv-zeile: "14px"
spacing:
  gutter: "max(22px, 4vw)"
  container: "980px (ab 1069px), sonst max. 1024px mit Rand"
  measure: "692px"
  kante: "96px + safe-area unten"
components:
  logo: "Falke.astro, currentColor, Master ab 48px, Kleinfassung darunter"
  ring: "Ring.astro, Medienfarbe, gefüllt bis zur Wertung"
  ticket: "Ticket.astro, Kachel auf --tile, Radius 18px"
  button: "Pille, --blue, weiße Schrift 17px, min. 44px hoch"
  nav: "Glasleiste links bzw. Tab-Leiste unten, --nav mit Unschärfe"
---

# Design System: Kestrel

## Überblick

Kestrel sieht aus wie eine Produktseite von apple.com: viel Weiß bzw. Schwarz, große Systemschrift, ruhige Flächen, wenige Farben. Inhalt steht im Vordergrund, die Gestaltung tritt zurück. Drei Dinge geben der Seite ein eigenes Gesicht:

- **Der Wertungsring.** Jede Wertung ist ein Ring wie bei den Aktivitätsringen der Apple Watch, gefüllt bis zur Zahl. Er zeigt die eine Skala von 1 bis 10 auf einen Blick.
- **Das Logo „Ring“.** Derselbe Ring läuft oben rechts in einen Hakenschnabel aus, der Punkt ist das Auge. Ring und Turmfalke (englisch *kestrel*) in einem Zeichen.
- **Der blaue Footer.** Als einziger Bruch mit dem Apple-Stil: eine Illustration in Kobaltblau und Creme mit Serifenschrift und einem Reiter im Holzschnitt-Stil.

Hell und dunkel folgen dem System, bis man in der Navigation umschaltet. Die Wahl steht dann als `data-theme` am `<html>` und in localStorage (`kestrel-theme`).

## Farben

Alle Farben sind Variablen in `src/styles/global.css`: hell in `:root`, dunkel per Media-Query und noch einmal unter `[data-theme='dark']`.

### Medienfarben
- **Film** rot, **Spiel** grün, **Serie** türkis, im Dunkeln jeweils etwas heller.
- Sie stehen nur im Wertungsring, als kleiner Punkt und auf den Bildkarten der Bildstrecke. Nie als Fläche hinter Text, nie für Links.

### Blau
- **Link** (`--link`) für Textlinks, **Blue** (`--blue`) als Fläche für Knöpfe. Blau ist für Bedienung reserviert und kein Medium.

### Neutral
- **Ground** Weiß bzw. Schwarz für die Seite, **Ground-2/Tile** `#f5f5f7` bzw. `#161617` für Bänder und Kacheln.
- **Ink** für Text, **Ink-2** für Nebentext (mindestens 4,5:1 auf jeder Fläche), **Ink-3** nur für Beiwerk.
- **Neu** orange für das Wort „Neu“, wie bei Apple.

### Footer
- **Fuss-Blau** `#1d3d9c` und **Fuss-Creme** `#efe6cf`, in Hell und Dunkel gleich. Der Footer ist eine Illustration in fester Druckfarbe.

### Regeln
**Eine Farbe pro Bedeutung.** Rot, Grün und Türkis bedeuten Medium, Blau bedeutet „klickbar“. Keine Farbe übernimmt eine zweite Aufgabe.

**Das Logo ist einfarbig.** Es nimmt immer die Textfarbe an (`currentColor`), nie eine Medienfarbe, keinen Verlauf.

## Typografie

**Schrift:** Systemschrift, also SF Pro auf Apple-Geräten, sonst Inter Variable. **Footer:** Source Serif 4 Variable.

### Hierarchie
- **Hero** (600, bis 96px, Zeilenhöhe 1.04): „Ehrlich bewertet.“ auf der Startseite.
- **Headline** (600, 36–56px): Titel auf der Textseite und Seitentitel.
- **Subhead** (400, 21–28px): Unterzeilen unter großen Titeln, ausgeglichen umbrochen.
- **Body** (400, 17px, 1.47): Bedienung, Listen, Seitentexte.
- **Prose** (400, 19px, 1.58, Spalte 692px): der Fließtext eines Textes.
- **Wortmarke** „Kestrel“: 600, Laufweite −2 %. Im Glasschild 17px, auf der Startseite 30–44px.

### Regeln
**Gewicht statt Größe.** Überschriften sind halbfett (600), nie fett (700+). Hierarchie entsteht über Größe und Abstand.

**Keine Versalien als Stil.** Text steht in normaler Groß- und Kleinschreibung. Ausnahme: kleine Augenbrauen-Zeilen über Titeln.

## Layout

- Ein zentrierter Container: 980px ab 1069px Breite, darunter volle Breite mit Rand `max(22px, 4vw)`. Lesespalte 692px.
- Große Abstände zwischen Abschnitten. Listen sind einspaltig mit Kacheln, die Startseite wechselt zwischen Weiß und Bändern in `--ground-2`.
- **Startseite:** Logo, Wortmarke, Hero-Satz und zwei Knöpfe, darunter die Bildstrecke über die volle Höhe, dann der neueste Text, ein schwarzes Band, in dem die Sätze beim Scrollen Wort für Wort aufleuchten, und ältere Texte.
- **Textseite** im Newsroom-Stil: Titel, Ring, Fazit, Fließtext, darunter der Steckbrief als „Technische Daten“.
- **Handy (unter 834px):** Die Navigation wird zur Tab-Leiste unten, die Bildstrecke nutzt eigene Bildausschnitte (`fokus`, `fokusHell`).

## Tiefe

- Flächen statt Schatten: Kacheln heben sich über die Farbe ab (`--tile` auf `--ground`), höchstens mit einer Haarlinie (`--hair`).
- **Glas** nur für schwebende Bedienung (Navigation, Glasschild, Suche): `--nav` mit `backdrop-filter: saturate(180%) blur(20px)`.
- **Kante:** Unten am Bildschirm verschwimmt der Inhalt in sechs Stufen (`Kante.astro`). Über dem Footer übernimmt der Verlauf dessen Farbe (`--kante-ton`).

## Formen

- Knöpfe, Glasschild und Segmente sind Pillen (980px Radius).
- Kacheln 18px, große Kacheln 28px, Bildkarten der Bildstrecke 28–48px, Archivzeilen 14px.
- Der Ring ist die einzige Kreisform mit Bedeutung. Andere Kreise (Avatare, Punkte) bleiben klein.

## Komponenten

### Logo „Ring“ (`Falke.astro`)
Offener Ring mit Hakenschnabel und Auge, einfarbig in `currentColor`. Master ab 48px, darunter die Kleinfassung (`klein`) mit dickerem Ring und größerem Auge. Steht auf der Startseite über der Wortmarke (84–112px) und im Glasschild oben links (20px, Kleinfassung). Dateien, Varianten und Regeln liegen in `marke/`.

### Wertungsring (`Ring.astro`)
Ring in der Medienfarbe, gefüllt bis zur Wertung (7 von 10 = 70 %), die Zahl steht in der Mitte. Screenreader hören „Wertung 7 von 10“ mit dem Satz der Skala.

### Navigation (`Nav.astro`)
Schwebende Glasleiste links: Start, Sammlung, Demnächst, Archiv, dann Suchen, Hell/Dunkel und „Kevin“ (Wie ich werte). Ein dunkles Schild mit Name und Kürzel (⌥1–⌥6) gleitet zum Symbol unter der Maus. Oben links das Glasschild mit Logo und „Kestrel“. Auf der Startseite fliegt die Wortmarke beim Scrollen aus dem Seitenkopf in dieses Schild. Suche wie Spotlight (Taste `/`).

### Bildstrecke (`Reel.astro`)
Bildkarten über die volle Bildschirmhöhe (Spiele, Filme, Serien, Demnächst, Archiv). Die aktive Karte ist scharf, die Nachbarn lugen kleiner und abgedunkelt hervor. Jede Karte hat ein dunkles und optional ein helles Bild, das per `--hell-an` darüber blendet. Natürliches Scrollen mit sanftem Einrasten.

### Textkachel (`Ticket.astro`)
Kachel auf `--tile`. In Listen Ring links, Titel und Fazit daneben. Auf der Startseite als große, zentrierte Kachel.

### Knöpfe
Primär: blaue Pille, weiße Schrift 17px, mindestens 44px hoch. Sekundär: Textlink in `--link` mit Pfeil (›).

### Footer (`Fuss.astro`, `Reiter.astro`)
Kobaltblaue Fläche mit Papierkorn, cremefarbene Serifenschrift, Spalten mit kurzem Strich unter der Überschrift, Suchfeld. Darunter eine Landschaft im Kupferstich-Stil auf Canvas mit einem selbst gezeichneten Reiter.

### Meldungen (`Meldungen.astro`)
Gestapelte Toasts unten in der Mitte, die sich beim Überfahren zur Liste auffächern. Nur auf Kevins Geräten.

## Bewegung

- Weiche Kurven (`--ease`), kurze Übergänge. Beim Umschalten von Hell und Dunkel blenden die Farben 450ms über.
- Bewegung hat einen Grund: Die Wortmarke fliegt ins Schild, das Logo blendet beim Laden ein, Wörter leuchten beim Lesen auf.
- `prefers-reduced-motion` schaltet alles davon ab, die Inhalte stehen dann sofort an ihrem Platz.

## Do's and Don'ts

### Do
- Viel Fläche lassen, eine Aussage pro Abschnitt.
- Medienfarben nur im Ring, am Punkt und auf den Bildkarten.
- Kontrast prüfen: Fließtext mindestens 4,5:1 in Hell und Dunkel.
- Neue Farben als Variable in `global.css` anlegen, hell und dunkel.

### Don't
- Keine Sterne, Daumen oder Prozentbalken für Wertungen. Die Wertung ist immer der Ring.
- Keine Schatten-Stapel, Verläufe oder Neon-Effekte auf Kacheln.
- Das Logo nicht einfärben, drehen, schließen oder ohne Auge zeigen.
- Keine Serifenschrift außerhalb des Footers.
