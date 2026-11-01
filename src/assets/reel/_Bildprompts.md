# Bildprompts für die Bildstrecke auf der Startseite

Die Startseite zeigt unter der Überschrift fünf riesige Bildkarten, die beim Scrollen ineinander übergehen. Für jede Karte gibt es hier einen Hauptprompt und eine Alternative.

## So kommen die Bilder auf die Seite

1. Bild erzeugen (Midjourney, DALL·E, Firefly, Imagen …), Format **16:9, 3840 × 2160 px**.
2. Datei genau so benennen und in **diesen Ordner** (`src/assets/reel/`) legen:

| Karte | Dateiname |
| --- | --- |
| Spiele | `spiele.jpg` |
| Filme | `filme.jpg` |
| Serien | `serien.jpg` |
| Demnächst | `demnaechst.jpg` |
| Rückblick / Archiv | `archiv.jpg` |

`.png`, `.webp` und `.avif` gehen auch. Die Seite verkleinert die Bilder beim Veröffentlichen automatisch (bis 3840 px Breite, als WebP). Solange eine Datei fehlt, zeigt die Karte einen Farbverlauf.

## Worauf alle Bilder achten (steckt schon in den Prompts)

- **Unten links bleibt Ruhe:** Dort steht weiß die Überschrift. Hauptmotiv ins rechte Drittel, unten links dunkle, ruhige Fläche.
- **Funktioniert auch hochkant:** Am Handy wird das Bild als schmaler Streifen aus der Mitte geschnitten. Das Motiv soll deshalb zwischen Mitte und rechtem Drittel liegen, nicht am Rand.
- **Dunkel und edel:** Weiße Schrift muss lesbar sein. Tiefe Schatten, ein klares Lichtmotiv, wenig Farbe; die Akzentfarbe passt zur Medienfarbe der Seite (Spiele grün, Filme rot, Serien türkis).
- **Keine echten Marken, Figuren oder Schauspieler:** Die Seite ist öffentlich; erkennbare Figuren aus Spielen und Filmen wären ein Urheberrechtsproblem. Die Bilder erzählen das Thema über Gegenstände, Licht und Räume.
- **Kein Text im Bild**, keine Logos, keine Wasserzeichen.

Gemeinsamer Stil-Zusatz (an jeden Prompt anhängen, falls dein Werkzeug kein eigenes Stilfeld hat):

```
shot like an Apple product launch film, ultra-high-end commercial photography, minimal composition, deep rich shadows, single motivated light source, subtle film grain, shallow depth of field, photorealistic, 8k detail, 16:9, subject placed in the right third, calm dark negative space in the lower left for headline text, no text, no logos, no people's faces
```

Negativ-Prompt (wo es ein Feld dafür gibt):

```
text, letters, logo, watermark, brand names, recognizable characters, celebrities, faces, cluttered, oversaturated, HDR halo, cartoon, low resolution, blurry subject
```

Midjourney: am Ende `--ar 16:9 --style raw --v 7 --q 2` ergänzen.

---

## 1. Spiele: „Bis zum Abspann.“

**Hauptprompt**

```
A modern game controller resting on a dark matte stone surface in a pitch-black room, lit only by the soft green glow of an unseen screen in front of it, light rim along the controller's curves, faint particles of dust floating in the green light beam, reflections on the surface, the controller sits in the right third of the frame, the lower left fades into velvety black, cinematic, Apple keynote product shot aesthetic, 16:9, 3840x2160
```

**Alternative**

```
Wide cinematic shot of an empty gamer's room at night seen from behind a chair, a single huge screen glowing emerald green out of focus on the right, the light spilling over a desk with headphones and a controller, long soft shadows, haze in the air, the left half of the image dark and calm, photorealistic, moody, Apple product film look, 16:9, 3840x2160
```

## 2. Filme: „Licht aus. Film ab.“

**Hauptprompt**

```
Interior of an empty classic cinema seen from the last row, rows of deep red velvet seats leading toward a glowing screen, a single beam of projector light cutting through haze from the upper right, dust particles sparkling in the beam, warm red and black palette, the seats in the lower left sink into darkness, symmetrical but weighted to the right, cinematic, ultra-detailed, Apple launch film aesthetic, 16:9, 3840x2160
```

**Alternative**

```
Close-up of a vintage 35mm film projector lens in the dark, a bright red-tinted beam of light shooting out to the right through smoky air, film reel edges softly out of focus in the foreground, deep black background, macro product photography, glossy metal highlights, minimal, 16:9, 3840x2160
```

## 3. Serien: „Nur noch eine Folge.“

**Hauptprompt**

```
A cozy dark living room late at night, a large thin television on the right glowing with soft teal and cyan light, the glow falling across a sofa with a crumpled blanket and a remote control, a mug of tea on a low table, rain on the window behind, everything else in deep shadow, calm dark area in the lower left, photorealistic, cinematic, Apple product film look, 16:9, 3840x2160
```

**Alternative**

```
Overhead view of a dark sofa cushion with a remote control and a blanket, lit only by a cool teal light from a screen out of frame on the right, soft gradients of light across the fabric texture, minimal, quiet, late-night mood, ultra-detailed textile, 16:9, 3840x2160
```

## 4. Demnächst: „Bald auf der Leinwand.“

**Hauptprompt**

```
The facade of an old cinema at blue hour, a glowing marquee with warm amber light bulbs on the right side of the frame, the letters on the marquee left blank and empty, wet pavement reflecting the golden lights, a few soft bokeh lights of the street, the lower left in deep blue shadow, anticipation and evening mood, cinematic photography, Apple launch film aesthetic, 16:9, 3840x2160
```

**Alternative**

```
A single golden cinema ticket stub lying on a dark wooden surface, lit by a warm amber spotlight from the right, soft shadow, shallow depth of field, a hint of a blurred marquee glow in the background, minimal, premium product photography, no text printed on the ticket, 16:9, 3840x2160
```

## 5. Rückblick: „Alles bleibt stehen.“

**Hauptprompt**

```
A tall dark archive shelf in a quiet room, filled with neatly stacked film canisters, game cartridges and vintage videotapes, all without labels, soft cool light falling from a high window on the right, dust drifting in the light, monochrome graphite and silver tones, the lower left in deep shadow, calm and nostalgic, ultra-detailed, Apple product film aesthetic, 16:9, 3840x2160
```

**Alternative**

```
A single old film canister and a worn game cartridge resting side by side on a dark polished surface, lit by a soft silver side light from the right, long gentle shadows, subtle reflections, black background, minimal still life, timeless and calm, 16:9, 3840x2160
```

---

## Feinschliff nach dem Einfügen

Liegt das Motiv am Handy zu weit am Rand, kann ich für einzelne Karten den Bildausschnitt verschieben (`fokus`, z. B. „70% 50%“). Kurz Bescheid geben, welches Bild.
