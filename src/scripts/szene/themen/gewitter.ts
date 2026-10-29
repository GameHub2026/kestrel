// Rote Gewitterwelt über der Vorstadt (Serie, Stimmung wie Stranger Things): dichte Sturmwolken mit roten Blitzen,
// kahle Bäume, ein Vorstadthaus mit flackerndem Fenster und bunter Lichterkette, Strommast mit Leitungen,
// schwebende Asche. Sporen treiben zur Maus. Hell: Abenddämmerung in den Achtzigern.
import { type Thema, leinwand, verlauf, rgba, glut } from '../motor';

const thema: Thema = {
  seed: 1983,
  paletten: {
    dunkel: {
      himmel: [[0, '#070103'], [0.5, '#1f0408'], [1, '#41090e']], wolke: '#2c070a', wolke2: '#4a0d12', blitz: '#ff3b3b',
      baum: ['#1a0507', '#0c0203', '#050102'], haus: '#060102', fenster: '#ffb36b', spore: '#ead6c8', blitzRate: 1,
    },
    hell: {
      himmel: [[0, '#5a67a6'], [0.55, '#b68cb2'], [1, '#f2c4a8']], wolke: '#8a6f9f', wolke2: '#a684a8', blitz: '#ffe8f2',
      baum: ['#7b6487', '#4f3d62', '#2c2139'], haus: '#271d33', fenster: '#ffd27a', spore: '#fff2f6', blitzRate: 0.3,
    },
  },

  bauen(z) {
    const { W, h, dpr, pal, r } = z;
    const [hc, c0] = leinwand(W, h, dpr); z.himmel = hc;
    c0.fillStyle = verlauf(c0, 0, 0, 0, h, pal.himmel); c0.fillRect(0, 0, W, h);
    // Sturmwolken als viele weiche Ballen
    for (let i = 0; i < 90; i++) {
      const x = r() * W, y = h * (0.02 + r() * 0.48) * (0.6 + r() * 0.4), rad = W * (0.04 + r() * 0.08);
      const g = c0.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, rgba(r() < 0.5 ? pal.wolke : pal.wolke2, 0.7)); g.addColorStop(1, rgba(pal.wolke, 0));
      c0.fillStyle = g; c0.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }

    // Kahle Bäume (verzweigt)
    const ast = (c: CanvasRenderingContext2D, x: number, y: number, l: number, w: number, a: number, tief: number) => {
      const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
      c.lineWidth = w; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
      if (tief <= 0 || l < 3) return;
      const n = 2 + (r() < 0.3 ? 1 : 0);
      for (let k = 0; k < n; k++) ast(c, x2, y2, l * (0.62 + r() * 0.18), w * 0.65, a + (r() - 0.5) * 1.3, tief - 1);
    };
    const wald = (farbe: string, tiefe: number, anzahl: number, groesse: [number, number], boden: number) => {
      const [f, c] = leinwand(W, h, dpr); c.strokeStyle = farbe; c.fillStyle = farbe; c.lineCap = 'round';
      for (let k = 0; k < anzahl; k++) { const x = r() * W, l = h * (groesse[0] + r() * (groesse[1] - groesse[0])); ast(c, x, h * boden, l * 0.4, l * 0.05, -Math.PI / 2 + (r() - 0.5) * 0.2, 6); }
      c.fillRect(0, h * boden, W, h * (1 - boden));
      z.ebenen.push({ bild: f, tiefe });
    };
    wald(pal.baum[0], 0.16, 28, [0.3, 0.45], 0.8);
    wald(pal.baum[1], 0.42, 12, [0.45, 0.6], 0.88);

    // Vordergrund: Haus, Lichterkette, Strommast
    const [f3, c3] = leinwand(W, h, dpr); c3.fillStyle = pal.haus; c3.strokeStyle = pal.haus;
    const hx = W * 0.6, hb = W * 0.2, hy = h * 0.95, hh = h * 0.2;
    c3.fillRect(hx, hy - hh, hb, hh + 10);
    c3.beginPath(); c3.moveTo(hx - hb * 0.06, hy - hh); c3.lineTo(hx + hb * 0.5, hy - hh - hb * 0.32); c3.lineTo(hx + hb * 1.06, hy - hh); c3.fill();
    c3.fillRect(hx + hb * 0.72, hy - hh - hb * 0.34, hb * 0.07, hb * 0.2);
    c3.fillRect(hx - hb * 0.25, hy - hh * 0.45, hb * 0.3, hh * 0.45 + 10);
    const fenster = [{ x: hx + hb * 0.18, y: hy - hh * 0.7, w: hb * 0.13, h: hh * 0.3 }, { x: hx + hb * 0.62, y: hy - hh * 0.7, w: hb * 0.13, h: hh * 0.3 }];
    for (const f of fenster) { c3.fillStyle = rgba(pal.fenster, 0.85); c3.fillRect(f.x, f.y, f.w, f.h); c3.fillStyle = pal.haus; c3.fillRect(f.x + f.w / 2 - 1, f.y, 2, f.h); c3.fillRect(f.x, f.y + f.h / 2 - 1, f.w, 2); }
    // Strommast
    const mx = W * 0.3; c3.fillStyle = pal.haus; c3.fillRect(mx - 2, h * 0.45, 4, h * 0.55); c3.fillRect(mx - 22, h * 0.47, 44, 3); c3.fillRect(mx - 16, h * 0.52, 32, 3);
    c3.lineWidth = 1.2;
    for (const [y0, dy] of [[0.47, 0], [0.52, 0.02]]) { c3.beginPath(); c3.moveTo(-10, h * (y0 + 0.08)); c3.quadraticCurveTo(mx * 0.5, h * (y0 + 0.12 + dy), mx, h * y0); c3.quadraticCurveTo((mx + W) / 2, h * (y0 + 0.1 + dy), W + 10, h * (y0 + 0.02)); c3.stroke(); }
    // Boden, Zaun
    c3.fillStyle = pal.baum[2]; c3.fillRect(0, h * 0.95, W, h * 0.05);
    for (let x = 0; x < W * 0.55; x += 10) c3.fillRect(x, h * 0.92, 3, h * 0.04);
    c3.fillRect(0, h * 0.93, W * 0.55, 2);
    z.ebenen.push({ bild: f3, tiefe: 0.86, vorne: true });
    z.daten.fenster = fenster;
    z.daten.kette = Array.from({ length: 16 }, (_, k) => ({ x: hx - hb * 0.22 + (k / 15) * hb * 1.25, y: hy - hh * 0.47 + Math.sin((k / 15) * Math.PI) * 6, f: ['#ff4d4d', '#4dff88', '#4da6ff', '#ffd24d', '#ff6bd6'][k % 5] }));
    z.daten.asche = Array.from({ length: 90 }, () => ({ x: r() * W, y: r() * h, v: 4 + r() * 12, p: r() * 10, g: 0.8 + r() * 1.6 }));
    z.daten.blitz = { warte: 2, an: 0, pfad: [] as [number, number][] };
  },

  hinten(c, z, t, dt) {
    const b = z.daten.blitz;
    b.warte -= dt;
    if (b.warte <= 0) {
      b.an = 1; b.warte = (2.5 + Math.random() * 4) / z.pal.blitzRate;
      let x = z.w * (0.3 + Math.random() * 0.6), y = z.h * 0.08; b.pfad = [[x, y]];
      while (y < z.h * (0.35 + Math.random() * 0.2)) { x += (Math.random() - 0.5) * 40; y += 10 + Math.random() * 18; b.pfad.push([x, y]); }
    }
    if (b.an > 0) {
      c.fillStyle = rgba(z.pal.blitz, 0.16 * b.an); c.fillRect(0, 0, z.w, z.h);
      c.save(); c.shadowColor = z.pal.blitz; c.shadowBlur = 14; c.strokeStyle = rgba('#ffffff', 0.9 * b.an); c.lineWidth = 1.6;
      c.beginPath(); b.pfad.forEach(([x, y]: [number, number], i: number) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.restore();
      b.an -= dt * (Math.random() < 0.3 ? 2 : 5); if (b.an < 0) b.an = 0;
    }
  },

  davor(c, z, t, dt) {
    for (const a of z.daten.asche) {
      a.y -= a.v * dt; a.x += Math.sin(t * 0.5 + a.p) * 10 * dt; if (a.y < -4) { a.y = z.h; a.x = Math.random() * z.W; }
      c.fillStyle = rgba(z.pal.spore, 0.35 + 0.2 * Math.sin(t + a.p)); c.fillRect(a.x - z.rand, a.y, a.g, a.g);
    }
  },

  vorneAnim(c, z, t) {
    // Fenster flackert, Lichterkette blinkt
    for (const [i, f] of z.daten.fenster.entries()) {
      const flacker = i === 0 ? (Math.sin(t * 13) * Math.sin(t * 7.3) > 0.55 ? 0.15 : 1) : 1;
      glut(c, f.x - z.rand + f.w / 2 - z.px * z.rand * 0.77, f.y + f.h / 2 - z.py * 5, f.w * 2.2, z.pal.fenster, 0.28 * flacker);
    }
    for (const [k, l] of z.daten.kette.entries()) {
      const an = Math.sin(t * 2.5 + k * 1.7) > -0.2;
      if (an) glut(c, l.x - z.rand - z.px * z.rand * 0.77, l.y - z.py * 5, 5, l.f, 0.9);
    }
  },

  folger: {
    n: 32, tiefen: [0.35, 1], tempo: 0.35, streuung: 140,
    ruhe: (z, t, f) => ({ x: z.w * 0.62 + f.ox * 2.2 + Math.sin(t * 0.3 + f.phase) * 30, y: z.h * 0.4 + f.oy * 2 + Math.cos(t * 0.25 + f.phase) * 25 }),
    zeichne(c, f, z, t) {
      const x = f.x + Math.sin(t * 0.9 + f.phase) * 8, y = f.y + Math.cos(t * 0.7 + f.phase) * 8, g = 1 + f.tiefe * 1.6;
      glut(c, x, y, g * 3, z.pal.spore, 0.25); c.fillStyle = rgba(z.pal.spore, 0.85); c.fillRect(x - g / 2, y - g / 2, g, g);
    },
  },
};
export default thema;
