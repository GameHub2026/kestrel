// Szenen-Motor: zeichnet je Seite eine eigene, animierte Landschaft auf zwei Leinwände.
// Hinten: Himmel und Ebenen (mit Mausfolgern dazwischen). Vorne: der Vordergrund, der z. B. auf der
// Startseite über dem aufsteigenden Fenster liegt. Ebenen werden einmal vorgezeichnet und nur verschoben.
// Alle Motive sind eigene Zeichnungen im Stil eines Genres, keine Nachbildungen aus Filmen oder Spielen.

export type Modus = 'hell' | 'dunkel';
export type R = () => number;
export type Pal = Record<string, any>;

export interface Ebene { bild: HTMLCanvasElement; tiefe: number; vorne?: boolean }
export interface Folger {
  x: number; y: number; vx: number; vy: number; tiefe: number; ox: number; oy: number; phase: number;
  spur: { x: number; y: number }[]; groesse: number; richtung: number;
}
export interface Welt {
  w: number; h: number; W: number; rand: number; dpr: number; modus: Modus; pal: Pal; r: R;
  ebenen: Ebene[]; himmel: HTMLCanvasElement; daten: Record<string, any>;
  maus: { x: number; y: number; da: boolean }; px: number; py: number; scroll: number;
}
export interface Thema {
  seed: number;
  paletten: Record<Modus, Pal>;
  bauen(z: Welt): void;
  // Haken während des Zeichnens (Leinwand ist in CSS-Pixeln skaliert)
  hinten?(c: CanvasRenderingContext2D, z: Welt, t: number, dt: number): void;
  nachEbene?(c: CanvasRenderingContext2D, z: Welt, t: number, dt: number, i: number): void;
  davor?(c: CanvasRenderingContext2D, z: Welt, t: number, dt: number): void;
  vorneAnim?(c: CanvasRenderingContext2D, z: Welt, t: number, dt: number): void;
  folger: {
    n: number; tiefen: [number, number]; tempo?: number; streuung?: number; spur?: number;
    ruhe?: (z: Welt, t: number, f: Folger, i: number) => { x: number; y: number };
    ziel?: (z: Welt, x: number, y: number, f: Folger, t: number) => { x: number; y: number };
    zeichne(c: CanvasRenderingContext2D, f: Folger, z: Welt, t: number): void;
  };
}

// ---------- Werkzeuge ----------
export function rng(seed: number): R {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function rauschen(r: R, oktaven = 4) {
  const ph = Array.from({ length: oktaven }, () => [r() * 1000, 0.6 + r() * 0.8]);
  return (x: number) => { let s = 0, a = 1, f = 1, n = 0; for (const [p, m] of ph) { s += Math.sin(x * f * m + p) * a; n += a; a *= 0.5; f *= 2.07; } return s / n; };
}
export function leinwand(w: number, h: number, dpr: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
  const c = cv.getContext('2d')!; c.scale(dpr, dpr); return [cv, c];
}
export function verlauf(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) {
  const g = c.createLinearGradient(x0, y0, x1, y1); for (const [o, f] of stops) g.addColorStop(o, f); return g;
}
export function rgba(hex: string, a: number) {
  const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
export function glut(c: CanvasRenderingContext2D, x: number, y: number, rad: number, farbe: string, a = 1) {
  const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, rgba(farbe, a)); g.addColorStop(1, rgba(farbe, 0));
  c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
}
// Silhouette entlang einer Funktion bis zum unteren Rand füllen
export function kamm(c: CanvasRenderingContext2D, W: number, H: number, f: (x: number) => number, farbe: string | CanvasGradient, schritt = 3) {
  c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W + schritt; x += schritt) c.lineTo(x, f(x)); c.lineTo(W, H); c.closePath(); c.fillStyle = farbe; c.fill();
}
export function dunstband(c: CanvasRenderingContext2D, W: number, y: number, hoehe: number, farbe: string, a: number) {
  c.fillStyle = verlauf(c, 0, y - hoehe, 0, y + hoehe, [[0, rgba(farbe, 0)], [0.5, rgba(farbe, a)], [1, rgba(farbe, 0)]]);
  c.fillRect(0, y - hoehe, W, hoehe * 2);
}
export const klemme = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// ---------- Motor ----------
const istDunkel = () => {
  const t = document.documentElement.getAttribute('data-theme');
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
};
const wenigBewegung = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Szene {
  el: HTMLElement; hinten: HTMLCanvasElement; vorne: HTMLCanvasElement; thema: Thema;
  ch!: CanvasRenderingContext2D; cv!: CanvasRenderingContext2D; z!: Welt; folger: Folger[] = [];
  laeuft = false; sichtbar = true; letzte = 0; t0 = performance.now(); raf = 0; zuletztMaus = 0;
  scrollVersatz: (tiefe: number) => number = () => 0;

  constructor(el: HTMLElement, thema: Thema) {
    this.el = el; this.thema = thema;
    this.hinten = el.querySelector('.sz-hinten')!; this.vorne = el.querySelector('.sz-vorne')!;
    this.bauen();
    new ResizeObserver(() => { clearTimeout((this as any).rz); (this as any).rz = setTimeout(() => this.bauen(), 160); }).observe(this.hinten);
    new MutationObserver(() => this.bauen()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.bauen());
    new IntersectionObserver(([e]) => { this.sichtbar = e.isIntersecting; this.weiter(); }, { rootMargin: '80px' }).observe(this.hinten);
    document.addEventListener('visibilitychange', () => this.weiter());
    addEventListener('pointermove', (e) => {
      const r = this.hinten.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const drin = x >= -r.width * 0.6 && x <= r.width && y >= -40 && y <= r.height;
      if (!this.z) return;
      this.z.maus = { x, y, da: drin }; if (drin) this.zuletztMaus = performance.now();
    }, { passive: true });
    document.addEventListener('pointerleave', () => { if (this.z) this.z.maus.da = false; });
  }

  bauen() {
    const r = this.hinten.getBoundingClientRect();
    const w = Math.max(320, Math.round(r.width)), h = Math.max(200, Math.round(r.height));
    const dpr = Math.min(devicePixelRatio || 1, w > 1400 ? 1.25 : 1.5);
    const modus: Modus = istDunkel() ? 'dunkel' : 'hell';
    const rand = Math.round(w * 0.05);
    const alt = this.z;
    this.z = {
      w, h, W: w + rand * 2, rand, dpr, modus, pal: this.thema.paletten[modus], r: rng(this.thema.seed),
      ebenen: [], himmel: document.createElement('canvas'), daten: {}, maus: alt?.maus || { x: w * 0.6, y: h * 0.3, da: false }, px: alt?.px || 0, py: alt?.py || 0, scroll: alt?.scroll || 0,
    };
    for (const [cv, name] of [[this.hinten, 'ch'], [this.vorne, 'cv']] as const) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      const c = cv.getContext('2d')!; c.setTransform(dpr, 0, 0, dpr, 0, 0); (this as any)[name] = c;
    }
    this.thema.bauen(this.z);
    this.z.ebenen.sort((a, b) => a.tiefe - b.tiefe);
    // Folger behalten ihre Position beim Neuaufbau (Hell/Dunkel, Größe)
    const F = this.thema.folger; const fr = rng(this.thema.seed + 7);
    if (this.folger.length !== F.n) {
      this.folger = Array.from({ length: F.n }, (_, i) => {
        const tiefe = F.tiefen[0] + (F.tiefen[1] - F.tiefen[0]) * (F.n === 1 ? 1 : i / (F.n - 1));
        const ang = fr() * Math.PI * 2, rad = (0.3 + fr() * 0.7) * (F.streuung ?? 60);
        return { x: w * (0.5 + fr() * 0.4), y: h * (0.2 + fr() * 0.3), vx: 0, vy: 0, tiefe, ox: Math.cos(ang) * rad, oy: Math.sin(ang) * rad * 0.6, phase: fr() * 10, spur: [], groesse: 0.8 + fr() * 0.4, richtung: 1 };
      });
      // gleich an der Ruheposition starten, nicht erst hinfliegen
      if (F.ruhe) this.folger.forEach((f, i) => { const p = F.ruhe!(this.z, 0, f, i); f.x = p.x; f.y = p.y; });
    }
    this.zeichne(performance.now());
    this.weiter();
  }

  weiter() {
    const soll = this.sichtbar && !document.hidden && !wenigBewegung();
    if (soll && !this.laeuft) { this.laeuft = true; this.letzte = performance.now(); this.raf = requestAnimationFrame((n) => this.schleife(n)); }
    if (!soll) { this.laeuft = false; cancelAnimationFrame(this.raf); }
  }
  schleife(n: number) { if (!this.laeuft) return; this.zeichne(n); this.raf = requestAnimationFrame((m) => this.schleife(m)); }

  zeichne(n: number) {
    const z = this.z, th = this.thema; if (!z) return;
    const dt = Math.min(0.05, (n - this.letzte) / 1000 || 0.016); this.letzte = n;
    const t = (n - this.t0) / 1000;
    // Maus-Parallaxe weich nachziehen
    const zx = z.maus.da ? klemme(z.maus.x / z.w - 0.5, -0.5, 0.5) : 0, zy = z.maus.da ? klemme(z.maus.y / z.h - 0.5, -0.5, 0.5) : 0;
    z.px += (zx - z.px) * Math.min(1, dt * 2.5); z.py += (zy - z.py) * Math.min(1, dt * 2.5);
    this.bewege(t, dt);

    const c = this.ch, { w, h } = z;
    c.clearRect(0, 0, w, h);
    c.drawImage(z.himmel, -z.rand - z.px * z.rand * 0.15, this.scrollVersatz(0.02), z.W, h);
    th.hinten?.(c, z, t, dt);
    const hintere = z.ebenen.filter((e) => !e.vorne);
    const fs = [...this.folger].sort((a, b) => a.tiefe - b.tiefe);
    let fi = 0;
    hintere.forEach((e, i) => {
      // Folger, die weiter hinten fliegen als diese Ebene, vorher zeichnen
      while (fi < fs.length && fs[fi].tiefe < e.tiefe) th.folger.zeichne(c, fs[fi++], z, t);
      c.drawImage(e.bild, -z.rand - z.px * z.rand * e.tiefe * 0.9, this.scrollVersatz(e.tiefe) - z.py * 6 * e.tiefe, z.W, h);
      th.nachEbene?.(c, z, t, dt, i);
    });
    while (fi < fs.length) th.folger.zeichne(c, fs[fi++], z, t);
    th.davor?.(c, z, t, dt);

    const v = this.cv; v.clearRect(0, 0, w, h);
    for (const e of z.ebenen.filter((e) => e.vorne)) v.drawImage(e.bild, -z.rand - z.px * z.rand * e.tiefe * 0.9, this.scrollVersatz(e.tiefe) - z.py * 6 * e.tiefe, z.W, h);
    th.vorneAnim?.(v, z, t, dt);
  }

  bewege(t: number, dt: number) {
    const z = this.z, F = this.thema.folger, tempo = F.tempo ?? 1;
    const aktiv = z.maus.da && performance.now() - this.zuletztMaus < 4000;
    this.folger.forEach((f, i) => {
      let tx: number, ty: number;
      if (aktiv) {
        const s = 0.6 + f.tiefe * 0.6;
        tx = klemme(z.maus.x + f.ox * s, z.w * 0.08, z.w * 0.98); ty = klemme(z.maus.y + f.oy * s, z.h * 0.06, z.h * 0.82);
      } else {
        const p = F.ruhe ? F.ruhe(z, t, f, i) : { x: z.w * (0.66 + 0.2 * Math.sin(t * 0.13 + f.phase)) + f.ox, y: z.h * (0.3 + 0.1 * Math.sin(t * 0.21 + f.phase * 1.7)) + f.oy };
        tx = p.x; ty = p.y;
      }
      if (F.ziel) { const p = F.ziel(z, tx, ty, f, t); tx = p.x; ty = p.y; }
      const k = 2.4 * tempo * (0.55 + f.tiefe * 0.6);
      f.vx = (f.vx + (tx - f.x) * k * dt) * Math.pow(0.16, dt);
      f.vy = (f.vy + (ty - f.y) * k * dt) * Math.pow(0.16, dt);
      const v = Math.hypot(f.vx, f.vy), max = 520 * tempo * (0.5 + f.tiefe * 0.6);
      if (v > max) { f.vx *= max / v; f.vy *= max / v; }
      f.x += f.vx * dt; f.y += f.vy * dt;
      if (Math.abs(f.vx) > 30) f.richtung = Math.sign(f.vx);
      if (F.spur) { f.spur.push({ x: f.x, y: f.y }); if (f.spur.length > F.spur) f.spur.shift(); }
    });
  }
}

type Drei = { drei: true; starte(el: HTMLElement): boolean; ersatz?: string };
const THEMEN: Record<string, () => Promise<Thema | Drei>> = {};
export function melde(name: string, lade: () => Promise<Thema | Drei>) { THEMEN[name] = lade; }

export async function starteSzenen() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-szene]:not([data-an])')) {
    el.dataset.an = '1';
    const lade = THEMEN[el.dataset.szene || '']; if (!lade) continue;
    let th = await lade();
    // 3D-Szenen bringen ihren eigenen Renderer mit; ohne WebGL springt ein 2D-Ersatz ein
    if ('drei' in th) { if (th.starte(el)) continue; if (!th.ersatz || !THEMEN[th.ersatz]) continue; th = (await THEMEN[th.ersatz]()) as Thema; }
    const s = new Szene(el, th as Thema);
    (el as any).szene = s;
    el.dispatchEvent(new CustomEvent('szene-bereit', { detail: s }));
  }
}

// Weiche Nebelbank als vorgezeichnetes Bild (einmal je Farbe), wird nur gestreckt gezeichnet
const NEBEL = new Map<string, HTMLCanvasElement>();
export function nebel(c: CanvasRenderingContext2D, x: number, y: number, bw: number, bh: number, farbe: string, a: number) {
  let bild = NEBEL.get(farbe);
  if (!bild) {
    bild = document.createElement('canvas'); bild.width = 256; bild.height = 64; const k = bild.getContext('2d')!;
    k.translate(128, 32); k.scale(4, 1); const g = k.createRadialGradient(0, 0, 0, 0, 0, 32);
    g.addColorStop(0, rgba(farbe, 1)); g.addColorStop(0.55, rgba(farbe, 0.45)); g.addColorStop(1, rgba(farbe, 0)); k.fillStyle = g; k.fillRect(-32, -32, 64, 64);
    NEBEL.set(farbe, bild);
  }
  c.globalAlpha = a; c.drawImage(bild, x - bw, y - bh, bw * 2, bh * 2); c.globalAlpha = 1;
}
