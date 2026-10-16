// Feste Wertungsskala. Gilt für Spiele, Filme und Serien gleich.
export const SKALA: Record<number, string> = {
  10: 'Meisterwerk',
  9: 'Herausragend, knapp am Meisterwerk',
  8: 'Sehr gut, klare Empfehlung',
  7: 'Gut, lohnt sich trotz kleiner Schwächen',
  6: 'Ordentlich, mit Abstrichen',
  5: 'Durchwachsen, Licht und Schatten halten sich die Waage',
  4: 'Enttäuschend',
  3: 'Schwach, kaum etwas trägt',
  2: 'Zeitverschwendung',
  1: 'Ärgerlich, ich bereue jede Minute',
};

export const MEDIUM = { spiel: 'Spiel', film: 'Film', serie: 'Serie' } as const;
export const TEXTFORM = {
  test: 'Test',
  kurzkritik: 'Kurzkritik',
  ersteindruck: 'Ersteindruck',
  rueckblick: 'Rückblick',
} as const;
export const STAND = {
  abspann: 'Abspann gesehen',
  '100%': '100 % abgeschlossen',
  abgebrochen: 'Abgebrochen',
  laufend: 'Läuft noch',
} as const;
