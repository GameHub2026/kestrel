---
name: Kestrel
description: Spiele, Filme und Serien von Kevin. Jeder Text ist eine Eintrittskarte, die behalten wurde.
colors:
  film: "#c8342b"
  serie: "#1f5fa8"
  spiel: "#e8b21d"
  film-ink: "#ffffff"
  serie-ink: "#ffffff"
  spiel-ink: "#17140c"
  stamp: "#7a1f8f"
  focus: "#1f5fa8"
  ground: "#dcdfe3"
  ground-2: "#cdd1d6"
  paper: "#f7f8f9"
  ink: "#121417"
  ink-2: "#3f454d"
  rule: "#121417"
  ground-dark: "#141619"
  ground-2-dark: "#1d2024"
  paper-dark: "#1b1e22"
  ink-dark: "#eceef0"
  ink-2-dark: "#a9b0b8"
  stamp-dark: "#c98ad8"
  focus-dark: "#8fb8ee"
typography:
  display:
    fontFamily: "Big Shoulders Display Variable, Arial Narrow, sans-serif"
    fontSize: "clamp(3rem, 10vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Big Shoulders Display Variable, Arial Narrow, sans-serif"
    fontSize: "clamp(2.6rem, 6.5vw, 5.5rem)"
    fontWeight: 900
    lineHeight: 0.92
  title:
    fontFamily: "Big Shoulders Display Variable, Arial Narrow, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 900
    lineHeight: 0.92
  section:
    fontFamily: "Big Shoulders Display Variable, Arial Narrow, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 800
    letterSpacing: "0.06em"
  body:
    fontFamily: "Source Serif 4 Variable, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  prose:
    fontFamily: "Source Serif 4 Variable, Georgia, serif"
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1.68
  fazit:
    fontFamily: "Source Serif 4 Variable, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Red Hat Mono Variable, ui-monospace, monospace"
    fontSize: "0.72rem"
    fontWeight: 600
    letterSpacing: "0.1em"
  score:
    fontFamily: "Big Shoulders Display Variable, Arial Narrow, sans-serif"
    fontSize: "clamp(6rem, 12vw, 9.5rem)"
    fontWeight: 900
    lineHeight: 0.8
rounded:
  stub: "4px"
  ticket: "6px"
  hole: "50%"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  stack-gap: "14px"
  measure: "68ch"
  container: "1180px"
components:
  ticket-film:
    backgroundColor: "{colors.film}"
    textColor: "{colors.film-ink}"
    rounded: "{rounded.ticket}"
  ticket-serie:
    backgroundColor: "{colors.serie}"
    textColor: "{colors.serie-ink}"
    rounded: "{rounded.ticket}"
  ticket-spiel:
    backgroundColor: "{colors.spiel}"
    textColor: "{colors.spiel-ink}"
    rounded: "{rounded.ticket}"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.section}"
    rounded: "{rounded.stub}"
    padding: "7px 14px 6px 10px"
  chip-checked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.stub}"
  stub-row:
    rounded: "{rounded.stub}"
    padding: "8px 12px 8px 0"
  steckbrief:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.ticket}"
    padding: "30px 22px 22px"
  stamp:
    textColor: "{colors.stamp}"
    typography: "{typography.label}"
    rounded: "{rounded.stub}"
    padding: "6px 10px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.stub}"
    padding: "6px 12px"
---

# Design System: Kestrel

## Overview

**Creative North Star: "Die Abrisskarte"**

Jeder Text ist eine Eintrittskarte, die Kevin behalten hat. Die Seite ist ein Kassentresen in kühlem Grau, auf dem Rollen-Kartenkarton in drei Medienfarben liegt: Film rot, Serie blau, Spiel gelb. Jede Karte hat einen Abriss mit Seriennummer, eine Perforation mit halbrunden Kerben, eine Lochung als Stand-Marke und, wenn das Urteil später ergänzt wurde, einen Entwertungsstempel. Die Wertungsziffer steht groß im Karteninnern, nicht in einem Abzeichen.

Die Dichte ist die eines Kartenalbums: oben eine große, leicht schräg gelegte Karte, darunter ein Stapel kleinerer, minimal versetzter Karten. Typografie trägt den Ton: eine schmale, schwere Plakat-Grotesk in Versalien für alles, was auf der Karte gedruckt steht, eine ruhige Serifenschrift zum Lesen, eine Mono für Nummern, Daten und Meta-Angaben. Abgelehnt sind Poster-Raster mit Wertungsabzeichen im Letterboxd-Stil und Gaming-Score-Kästen.

Die Medienfarbe kommt über `data-medium` als lokales Paar `--card` / `--card-ink` in jede Komponente. Kein Bauteil kennt die drei Farben direkt; es liest nur Karte und Karten-Tinte.

**Key Characteristics:**
- Kartenkarton in drei vollgesättigten Medienfarben auf kühlem, entsättigtem Grund.
- Gestrichelte Linien (2px dashed) als durchgehende Perforations-Sprache: Abriss, Trenner, Fußzeile, aktive Navigation.
- Versal-Display für Titel, Ziffern und Überschriften; Serif nur zum Lesen.
- Leichte Drehungen (−1,2° Hero, ±0,35° Stapel) statt gerader Kachelraster.
- Ein einziger inszenierter Moment: Der Abriss reißt beim Öffnen eines Textes einmal ab.

## Colors

Drei laute Kartenfarben, ein stiller Grauton als Tresen und eine einzige Stempelfarbe für Nachträge.

### Primary
- **Kinokarten-Rot** (film): Karton aller Film-Texte, außerdem die Wortmarke im Kopf. Darauf weiße Tinte (film-ink).
- **Serienkarten-Blau** (serie): Karton aller Serien-Texte, darauf weiße Tinte (serie-ink). Derselbe Blauton dient im Hellmodus als Fokusfarbe (focus).
- **Spielkarten-Gelb** (spiel): Karton aller Spiel-Texte, darauf fast schwarze Tinte (spiel-ink). Auch die Textauswahl (`::selection`) ist gelb.

### Secondary
- **Entwertungsstempel-Violett** (stamp; dunkel: stamp-dark): ausschließlich für Nachtrag-Stempel im Text, auf Papier oder Grund.

### Neutral
- **Tresengrau** (ground; dunkel: ground-dark): Seitenhintergrund, auch die Farbe ausgestanzter Löcher.
- **Tresengrau tief** (ground-2): zweite Grundstufe.
- **Kartenrückseite** (paper; dunkel: paper-dark): Lesefläche für Steckbrief, Filter-Abrisse und die Skala-Rolle.
- **Druckschwarz** (ink; dunkel: ink-dark): Fließtext, Überschriften, gewählte neutrale Abrisse.
- **Graphit** (ink-2; dunkel: ink-2-dark): Nebentexte, Legenden, Meta-Angaben auf Papier.
- **Perforationslinie** (rule): gestrichelte Trenner, gleich der Tinte.

Die Medienfarben bleiben im Dunkelmodus unverändert; nur Grund, Papier, Tinte, Stempel und Fokus wechseln.

### Named Rules
**The Karton-Tinte Rule.** Auf Kartenkarton steht nur `--card-ink`, nie eine andere Farbe. Deshalb druckt der „Nachtrag"-Aufdruck auf der Hero-Karte in Karten-Tinte (`currentColor`), nicht in Stempel-Violett: Violett fällt auf dem roten Film- und dem blauen Serienkarton durch den Kontrast. Violett bleibt den Nachtrag-Stempeln im Text auf Papier oder Grund vorbehalten.

**The Drei-Kartons Rule.** Die Medienfarben sind Material, keine Akzente. Sie füllen ganze Karten, Abrisse und den „Für wen?"-Streifen, nie einzelne Wörter oder Icons. Neutrale Bedienelemente (Skala, Filter ohne Medium) bleiben auf Papier.

## Typography

**Display Font:** Big Shoulders Display Variable (mit Arial Narrow)
**Body Font:** Source Serif 4 Variable (mit Georgia), optische Größen automatisch
**Label/Mono Font:** Red Hat Mono Variable (mit ui-monospace), tabellarische Ziffern

**Character:** Die Display-Schrift ist der Kartendruck: schmal, schwer, immer in Versalien, eng gesetzt. Die Serif ist die Stimme des Schreibers. Die Mono ist der Nummerator der Kasse.

### Hierarchy
- **Display** (900, clamp(3rem, 10vw, 6rem), 0.86): Seitentitel; die Startseiten-Überschrift läuft mit clamp(2.6rem, 7.5vw, 5.75rem) und max. 16ch. Jahreszahlen im Archiv bis 9rem.
- **Headline** (900, clamp(2.6rem, 6.5vw, 5.5rem), 0.92): Titel auf der Hero-Karte.
- **Title** (900, 1.9rem, 0.92; mobil 1.6rem): Titel auf Stapel- und Listenkarten.
- **Section** (800, 1.1–1.25rem, Sperrung 0.06em): Abschnittsköpfe wie „Davor", Steckbrief, Nachträge; oft mit gestrichelter Linie bis zum Rand.
- **Body** (400, 1.0625rem, 1.6): Seitentexte. **Prose** (1.15rem, 1.68, max. 68ch) im Einzeltext.
- **Fazit** (kursiv, 1rem, 1.4, max. 60ch; Hero bis 1.3rem): der Fazit-Satz auf jeder Karte.
- **Label** (Mono 600, 0.68–0.8rem, Versalien, Sperrung 0.08–0.14em): Meta-Zeile, Seriennummer, Datum, Legenden, „von 10".
- **Score** (Display 900, Hero clamp(6rem, 12vw, 9.5rem), Liste 4.5rem, Archiv 2rem, Zeilenhöhe 0.8): die Wertungsziffer.

### Named Rules
**The Versal-Druck Rule.** Alles in Display-Schrift steht in Versalien. Die Serif erscheint nie in Versalien, die Display-Schrift nie als Fließtext.

**The Ziffer-im-Karton Rule.** Die Wertung ist eine riesige Display-Ziffer im Karteninneren mit „von 10" in Mono und dem festen Skalensatz daneben, nie in einem Kreis, Kasten oder Abzeichen.

## Layout

Ein zentrierter Container (max. 1180px) mit fließendem Rand (gutter, clamp(16px, 4vw, 48px)). Listen sind einspaltige Kartenstapel mit 14px Abstand, keine Raster. Der Einzeltext hat Lesespalte plus Steckbrief-Rückseite (320px, sticky) rechts; unter 900px fällt der Steckbrief über den Text, Wertung und „Für wen?" stehen dann direkt unter der Karte. Unter 720px stapelt die Karte Hauptteil und Wertung, der Abriss schrumpft (64px → 48px, Hero 88px → 56px). Große vertikale Abstände zwischen Abschnitten (clamp(56px, 8vw, 96px)). Die Hero-Karte liegt um −1,2° gedreht (mobil −0,8°), Stapelkarten abwechselnd ±0,35°, gerade Karten zusätzlich 6px versetzt.

## Elevation & Depth

Die Karten liegen auf dem Tresen: weiche, nach unten fallende Schatten, keine harten Versätze. Weil Abriss und Karte per Maske ausgestanzt sind, tragen Karten `filter: drop-shadow`, damit der Schatten der Kerbenform folgt. Ausgestanzte Löcher zeigen den Grund mit innerem Schatten.

### Shadow Vocabulary
- **Aufliegen** (`--shadow`: `0 1px 1px rgb(18 20 23 / 0.10), 0 10px 24px -10px rgb(18 20 23 / 0.35)`): Papierflächen, Filter-Abrisse, Archivzeilen, Skala.
- **Angehoben** (`--shadow-lift`: `0 2px 2px rgb(18 20 23 / 0.10), 0 22px 40px -14px rgb(18 20 23 / 0.45)`): Hover auf Archivzeilen.
- **Karte** (`drop-shadow(0 1px 1px …/0.12) drop-shadow(0 10px 14px …/0.22)`, Hover `…0 20px 22px …/0.3`): maskierte Tickets.
- **Lochung** (`inset 0 2px 2px rgb(0 0 0 / 0.35)`): ausgestanzte Löcher in Abriss und gewähltem Filter.

### Named Rules
**The Abheben Rule.** Hover hebt die Karte an (−3px, −0,4° Drehung, tieferer Schatten) bzw. schiebt Archivzeilen 4px nach rechts. Übergänge 240–280ms mit `cubic-bezier(0.16, 1, 0.3, 1)`.

## Shapes

Leicht gerundete Kartenecken (6px Ticket, 4px Abriss und kleine Teile). Die Perforation ist eine 2px gestrichelte Linie in Karten-Tinte mit 55 % Deckung; daneben sitzen halbrunde Kerben oben und unten (9px, Hero 14px, mobil 7px), ausgestanzt per radial-gradient-Maske auf Abriss und Kartenrest. Kreisrunde Löcher (14px, Hero 20px) markieren den Stand: ein Loch = Abspann, zwei = 100 %. Ein abgebrochener Text bekommt einen eingerissenen Abriss (clip-path-Zacke an der unteren Kante).

## Components

### Ticket (Signatur)
Das Kernstück aller Seiten. Zwei Teile: Abriss links (senkrechte Schrift „Kestrel", Nº-Nummer, Lochung, Datum) und Kartenrest mit Titel, Meta-Zeile (Mono, durch „/" getrennt), Fazit und Wertung. Die ganze Karte ist über den Titel-Link klickbar; Fokus zeichnet einen 3px-Rahmen um die ganze Karte.
- **Row:** kompakter Abriss nur mit Nummer und Lochung, Score 4.5rem.
- **Hero:** breiterer Abriss, Score bis 9.5rem durch eine 25-%-Linie in Karten-Tinte abgetrennt. Hat der Text Nachträge, sitzt unten rechts ein um −9° gedrehter Aufdruck „Nachtrag + Datum" in Karten-Tinte (2.5px Rahmen, 80 % Deckung).
- **Tear:** im Einzeltext reißt der Abriss nach 300ms einmal ab (1100ms, um −4° gedreht und 10px versetzt). Respektiert reduzierte Bewegung.

### Chips (Filter-Abrisse)
- **Style:** kleine Papier-Abrisse (paper, Druckschwarz, Display 800 in Versalien, 4px Ecken, Aufliegen-Schatten) mit einem gestrichelten Lochkreis (10px, 60 % Deckung) vor dem Wort.
- **State:** gewählt wird das Loch gestanzt (gefüllt in Grundfarbe mit innerem Schatten); der Abriss wird druckschwarz, Medien-Filter nehmen ihren Karton (`--card` / `--card-ink`). Hover hebt um 2px. Fokus 3px in focus.
- **Offen:** Eine Perforationskante bzw. Kerbe am Chip fehlt noch; bisher trägt nur das Loch die Abriss-Anmutung.

### Steckbrief (Kartenrückseite)
Papierfläche mit einem 8px-Streifen in Kartenfarbe oben (inset-Schatten), Zeilen als Definitionsliste mit gestrichelten Trennern, Mono-Labels in Graphit. Unten der „Für wen?"-Block vollflächig in Kartenkarton.

### Nachtrag-Stempel
Mono-Text in Stempel-Violett, 2.5px Rahmen, 4px Ecken, −4° gedreht, 92 % Deckung: „Nachtrag" + datiertes Datum. Nur auf Papier oder Grund.

### Archiv-Zeile
Flacher Karten-Abriss pro Text im Kartenkarton: Nummer hinter gestrichelter Perforation, Titel in Display, Textform, Skalensatz, Ziffer rechts. Hover 4px nach rechts mit Angehoben-Schatten.

### Skala-Rolle
Papierstreifen von 10 bis 1, Ziffer links hinter einer gestrichelten Linie; das Schriftgewicht der Ziffer sinkt mit jeder Stufe (`900 − i × 45`). Ohne Medienfarbe, weil die Skala für alle gilt.

### Navigation
Wortmarke als kleiner roter Abriss (Nº-Stummel, gestrichelte Kante, „Kestrel" in Display 900) links, Nav rechts: Display 700 in Versalien, Hover mit durchgezogener, aktive Seite mit gestrichelter 2px-Unterlinie.

### Buttons
Selten. Der einzige Button (Filter zurücksetzen) ist druckschwarz mit Grund-Text, Display 800 in Versalien, 4px Ecken.

## Do's and Don'ts

### Do:
- **Do** Medienfarbe nur über `data-medium` → `--card` / `--card-ink` an Bauteile geben.
- **Do** auf Kartenkarton ausschließlich Karten-Tinte verwenden, auch für Aufdrucke wie „Nachtrag".
- **Do** Trenner, aktive Zustände und Abriss-Kanten als 2px gestrichelte Linie zeichnen.
- **Do** Wertungen als große Display-Ziffer mit „von 10" und dem festen Skalensatz zeigen.
- **Do** maskierte Karten mit `filter: drop-shadow` statt `box-shadow` beschatten.
- **Do** Bewegung bei `prefers-reduced-motion` abschalten; der Abriss-Moment bleibt der einzige inszenierte Effekt.

### Don't:
- **Don't** Stempel-Violett auf roten oder blauen Kartenkarton setzen; es fällt dort durch den Kontrast.
- **Don't** Wertungen in Kreise, Kästen oder Score-Abzeichen packen.
- **Don't** Texte als Poster-Raster mit Wertungs-Badges anlegen; Listen bleiben Kartenstapel.
- **Don't** Medienfarben als Textakzent oder Icon-Farbe verwenden.
- **Don't** harte Versatzschatten verwenden; Karten liegen weich auf dem Tresen.
