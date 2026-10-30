// Ein Icon-Satz für alle Knöpfe und Meldungen: 24er-Raster, 1,75er Linie, runde Enden, keine Füllung.
// Gezeichnet wird über die Klasse .ic (global.css), damit Strichstärke und Größe überall gleich sind.
const P: Record<string, string> = {
  alle: '<path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>',
  spiel: '<rect x="2.5" y="6.5" width="19" height="11" rx="5.5"/><path d="M7 10.5v3M5.5 12h3"/><path d="M15.5 11h.01M17.5 13h.01"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7.5 4v16M16.5 4v16M3 9h4.5M16.5 9H21M3 15h4.5M16.5 15H21"/>',
  serie: '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="m16 3-4 4-4-4"/>',
  kino: '<path d="M3 8.5V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.5a3.5 3.5 0 0 0 0 7V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2.5a3.5 3.5 0 0 0 0-7Z"/><path d="M14 5v2.5M14 11v2M14 16.5V19"/>',
  test: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.5h6V4"/><path d="m9 13 2 2 4-4"/>',
  kurzkritik: '<path d="M4 20h4L19 9a2.83 2.83 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  ersteindruck: '<path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"/><circle cx="12" cy="12" r="3"/>',
  rueckblick: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/><path d="M12 7.5V12l3 2"/>',
  kalender: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  kalenderPlus: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M12 13v5M9.5 15.5h5"/>',
  pfeil: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  hoch: '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>',
  text: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  schluessel: '<circle cx="7.5" cy="15.5" r="4"/><path d="m10.4 12.6 9.1-9.1M16.5 6.5l3 3M13.5 9.5l2 2"/>',
  gesehen: '<path d="M17.5 6.5 7 17l-4.5-4.5"/><path d="m21.5 10-7 7-1.5-1.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  zu: '<path d="M18 6 6 18M6 6l12 12"/>',
  extern: '<path d="M14 4h6v6M10 14 20 4"/><path d="M19 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5.5"/>',
  kopieren: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h3.5"/>',
  zurueck: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/>',
  news: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h10A1.5 1.5 0 0 1 17 5.5V18a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V5.5Z"/><path d="M17 9h2.5a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2"/><path d="M8 8.5h5M8 12h5M8 15.5h3"/>',
  trailer: '<circle cx="12" cy="12" r="9"/><path d="M10 8.8v6.4l5-3.2-5-3.2Z"/>',
  ableger: '<circle cx="6.5" cy="5.5" r="2.5"/><circle cx="6.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="7.5" r="2.5"/><path d="M6.5 8v8M17.5 10c0 4-4.5 4.5-9 6.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.75h.01"/>',
  glocke: '<path d="M6 9a6 6 0 0 1 12 0c0 6.5 2.5 8 2.5 8h-17S6 15.5 6 9Z"/><path d="M10.2 20.5a2 2 0 0 0 3.6 0"/>',
  ok: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-4.9"/>',
  suche: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/>',
  ort: '<path d="M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  stern: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"/>',
  waage: '<path d="M12 4v16M8 20h8M5 7h14"/><path d="m5 7-3 6a3 3 0 0 0 6 0L5 7ZM19 7l-3 6a3 3 0 0 0 6 0l-3-6Z"/>',
  merken: '<path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-3.8L6 21V4.5a1 1 0 0 1 1-1Z"/>',
};

export type IconName = keyof typeof P;
export const ic = (name: string, klasse = 'ic') => `<svg class="${klasse}" viewBox="0 0 24 24" aria-hidden="true">${P[name] || ''}</svg>`;

// Knopf mit Icon vorne: innerHTML aus Icon + Beschriftung (für Knöpfe, die im Skript entstehen)
export function mitIcon<T extends HTMLElement>(el: T, name: string, text: string): T {
  el.innerHTML = ic(name);
  const s = document.createElement('span'); s.textContent = text; el.append(s);
  return el;
}

// Medium und Textform → Icon
export const ICON_MEDIUM: Record<string, string> = { spiel: 'spiel', film: 'film', serie: 'serie', kino: 'kino' };
export const ICON_TEXTFORM: Record<string, string> = { test: 'test', kurzkritik: 'kurzkritik', ersteindruck: 'ersteindruck', rueckblick: 'rueckblick' };
export const ICON_MELDUNG: Record<string, string> = { staffel: 'kalender', ableger: 'ableger', trailer: 'trailer', news: 'news', status: 'info' };
