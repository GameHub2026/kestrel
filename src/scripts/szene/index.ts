// Meldet alle Themen an; jedes wird erst geladen, wenn eine Seite es braucht.
import { melde, starteSzenen } from './motor';
melde('stadt', () => import('./themen/stadt').then((m) => m.default));
melde('wueste', () => import('./themen/wueste').then((m) => m.default));
melde('flur', () => import('./themen/flur').then((m) => m.default));
melde('maschinen', () => import('./themen/maschinen').then((m) => m.default));
melde('ruinen', () => import('./themen/ruinen').then((m) => m.default));
melde('western', () => import('./themen/western').then((m) => m.default));
melde('gewitter', () => import('./themen/gewitter').then((m) => m.default));
melde('rabenwald', () => import('./themen/rabenwald').then((m) => m.default));
export { starteSzenen };
