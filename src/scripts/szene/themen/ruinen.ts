// Überwucherte Ruinenstadt (Spiel, Stimmung wie The Last of Us): abgebrochene Hochhäuser, eines lehnt am anderen,
// Ranken und Bäume auf den Dächern, hohes Gras vorn, Lichtstrahlen. Ein Glühwürmchen-Schwarm folgt der Maus.
import { type Thema, leinwand, verlauf, rgba, glut } from '../motor';

const thema: Thema = {
  seed: 2013,
  paletten: {
    dunkel: {
      himmel: [[0, '#060d10'], [0.55, '#13211e'], [0.85, '#2e3326'], [1, '#3e3a28']], fern: '#152020', mitte: '#0e1715', ranke: '#16291b', ranke2: '#1d3522',
      nah: '#060c08', licht: '#dcff8f', loch: 'rgba(0,0,0,0.35)', strahl: 0, sterne: 0.6, rankeA: 0.55,
    },
    hell: {
      himmel: [[0, '#cfe1dd'], [0.6, '#e7ede0'], [1, '#f3eed3']], fern: '#a5b6aa', mitte: '#7b8f83', ranke: '#5d8a57', ranke2: '#79a36a',
      nah: '#2c4630', licht: '#fff8cc', loch: 'rgba(30,45,40,0.25)', strahl: 1, sterne: 0, rankeA: 0.7,
    },
  },

  bauen(z) {
    const { W, h, dpr, pal, r } = z;
    const [hc, c0] = leinwand(W, h, dpr); z.himmel = hc;
    c0.fillStyle = verlauf(c0, 0, 0, 0, h, pal.himmel); c0.fillRect(0, 0, W, h);
    for (let i = 0; i < 120 * pal.sterne; i++) { c0.fillStyle = `rgba(230,255,230,${0.1 + r() * 0.3})`; c0.fillRect(r() * W, r() * h * 0.5, 1, 1); }
    glut(c0, W * 0.75, h * 0.55, W * 0.5, z.modus === 'dunkel' ? '#c9a35a' : '#fff6d8', z.modus === 'dunkel' ? 0.18 : 0.6);

    const ranken = (c: CanvasRenderingContext2D, x: number, y: number, bw: number, laenge: number) => {
      c.globalAlpha = pal.rankeA;
      for (let k = 0; k < bw / 11; k++) {
        const vx = x + r() * bw, l = laenge * (0.2 + r() * 0.8);
        for (let yy = 0; yy < l; yy += 3) { c.fillStyle = r() < 0.5 ? pal.ranke : pal.ranke2; c.beginPath(); c.arc(vx + Math.sin(yy * 0.07 + k) * 2.5, y + yy, 0.8 + r() * 1.6 * (1 - yy / l), 0, Math.PI * 2); c.fill(); }
      }
      c.globalAlpha = 1;
      for (let k = 0; k < bw / 6; k++) { c.fillStyle = r() < 0.5 ? pal.ranke : pal.ranke2; c.beginPath(); c.arc(x + r() * bw, y - r() * 4, 1.5 + r() * 4, 0, Math.PI * 2); c.fill(); }
    };
    const ruine = (c: CanvasRenderingContext2D, x: number, bw: number, top: number, farbe: string, schief: number, gruen: number) => {
      c.save(); c.translate(x + bw / 2, h); c.rotate(schief); c.translate(-bw / 2, 0);
      const hoehe = h - top;
      c.fillStyle = farbe; c.beginPath(); c.moveTo(0, 4); c.lineTo(0, -hoehe);
      // abgebrochene Oberkante
      const zacken = 4 + ((r() * 5) | 0);
      for (let k = 1; k <= zacken; k++) c.lineTo((bw * k) / zacken, -hoehe + (r() * 0.25 + (k % 2) * 0.05) * hoehe * (r() < 0.4 ? 1 : 0.4));
      c.lineTo(bw, 4); c.closePath(); c.fill();
      // Fensterhöhlen
      const fs = Math.max(2, bw / 9);
      for (let y = -hoehe * 0.82; y < -fs * 2; y += fs * 2.2) for (let xx = fs; xx < bw - fs; xx += fs * 1.9) if (r() < 0.8) { c.fillStyle = pal.loch; c.fillRect(xx, y, fs, fs * 1.3); }
      if (gruen) ranken(c, 0, -hoehe * (0.85 + r() * 0.1), bw, hoehe * gruen);
      c.restore();
    };

    const [f1, c1] = leinwand(W, h, dpr);
    for (let x = -20; x < W; x += 30 + r() * 50) ruine(c1, x, 24 + r() * 40, h * (0.28 + r() * 0.3), pal.fern, (r() - 0.5) * 0.06, 0.18);
    c1.fillStyle = verlauf(c1, 0, h * 0.5, 0, h, [[0, rgba(pal.himmel[3]?.[1] || '#3e3a28', 0)], [1, rgba(z.modus === 'dunkel' ? '#2a3224' : '#e8ecd8', 0.45)]]); c1.fillRect(0, h * 0.5, W, h * 0.5);
    z.ebenen.push({ bild: f1, tiefe: 0.14 });

    const [f2, c2] = leinwand(W, h, dpr);
    for (let x = -10; x < W; x += 70 + r() * 90) ruine(c2, x, 50 + r() * 60, h * (0.34 + r() * 0.26), pal.mitte, (r() - 0.5) * 0.05, 0.4);
    ruine(c2, W * 0.58, W * 0.07, h * 0.2, pal.mitte, 0.2, 0.6); // lehnt am Nachbarn
    // Bäume auf Dächern und am Boden
    for (let k = 0; k < 10; k++) { const x = r() * W, y = h * (0.72 + r() * 0.2); for (let j = 0; j < 12; j++) { c2.fillStyle = j % 2 ? pal.ranke : pal.ranke2; c2.beginPath(); c2.arc(x + (r() - 0.5) * 36, y + (r() - 0.5) * 18 - j * 1.5, 5 + r() * 9, 0, Math.PI * 2); c2.fill(); } }
    z.ebenen.push({ bild: f2, tiefe: 0.45 });

    // Vordergrund: Büsche, hohes Gras, ein Autowrack
    const [f3, c3] = leinwand(W, h, dpr);
    c3.fillStyle = pal.nah;
    for (let x = 0; x < W; x += 6) { const b = 10 + Math.random() * h * 0.12 * (x < W * 0.2 || x > W * 0.8 ? 1.6 : 1); c3.beginPath(); c3.moveTo(x, h); c3.quadraticCurveTo(x + 2, h - b * 0.6, x + (r() - 0.5) * 14, h - b); c3.lineTo(x + 3, h); c3.fill(); }
    for (let k = 0; k < 18; k++) { const x = r() * W; c3.beginPath(); c3.arc(x, h * 0.97, 18 + r() * 34, 0, Math.PI * 2); c3.fill(); }
    const ax = W * 0.18, ay = h * 0.93, al = W * 0.09;
    c3.beginPath(); c3.moveTo(ax, ay); c3.lineTo(ax + al * 0.15, ay - al * 0.22); c3.lineTo(ax + al * 0.7, ay - al * 0.24); c3.lineTo(ax + al, ay - al * 0.06); c3.lineTo(ax + al, ay); c3.fill();
    c3.fillRect(0, h * 0.96, W, h * 0.04);
    z.ebenen.push({ bild: f3, tiefe: 0.88, vorne: true });
    z.daten.schweber = Array.from({ length: 50 }, () => ({ x: r() * W, y: h * (0.3 + r() * 0.65), p: r() * 10, v: 4 + r() * 10 }));
  },

  hinten(c, z, t) {
    if (!z.pal.strahl) return;
    // Lichtstrahlen fallen schräg durch
    c.save(); c.globalCompositeOperation = 'screen';
    for (let k = 0; k < 5; k++) {
      const x = z.w * (0.45 + k * 0.12) + Math.sin(t * 0.2 + k) * 10;
      c.fillStyle = verlauf(c, x, 0, x - z.w * 0.2, z.h, [[0, 'rgba(255,250,220,0.22)'], [1, 'rgba(255,250,220,0)']]);
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 26 + k * 6, 0); c.lineTo(x - z.w * 0.2 + 60, z.h); c.lineTo(x - z.w * 0.2, z.h); c.fill();
    }
    c.restore();
  },

  davor(c, z, t, dt) {
    // Schwebende Pollen / Glühpunkte überall
    for (const s of z.daten.schweber) {
      s.y -= s.v * dt; s.x += Math.sin(t * 0.7 + s.p) * 8 * dt; if (s.y < z.h * 0.2) { s.y = z.h; s.x = Math.random() * z.W; }
      const a = z.modus === 'dunkel' ? 0.35 + 0.35 * Math.sin(t * 2 + s.p) : 0.5;
      if (z.modus === 'dunkel') glut(c, s.x - z.rand, s.y, 4, z.pal.licht, a * 0.6); else { c.fillStyle = `rgba(255,255,240,${a})`; c.fillRect(s.x - z.rand, s.y, 1.6, 1.6); }
    }
  },

  folger: {
    n: 26, tiefen: [0.4, 1], tempo: 0.7, streuung: 120,
    ruhe: (z, t, f) => ({ x: z.w * 0.66 + f.ox * 2 + Math.sin(t * 0.5 + f.phase) * 40, y: z.h * 0.52 + f.oy * 1.6 + Math.cos(t * 0.6 + f.phase) * 30 }),
    zeichne(c, f, z, t) {
      const blink = 0.35 + 0.65 * Math.max(0, Math.sin(t * (1.6 + f.groesse) + f.phase * 3));
      const x = f.x + Math.sin(t * 1.7 + f.phase) * 6, y = f.y + Math.cos(t * 1.3 + f.phase) * 5;
      if (z.modus === 'dunkel') { glut(c, x, y, 10 * f.tiefe + 4, z.pal.licht, 0.45 * blink); c.fillStyle = `rgba(245,255,200,${0.6 + 0.4 * blink})`; c.fillRect(x - 1, y - 1, 2, 2); }
      else { glut(c, x, y, 7 * f.tiefe + 3, '#fff3b0', 0.55 * blink); c.fillStyle = `rgba(255,250,215,${0.7 * blink + 0.2})`; c.fillRect(x - 1, y - 1, 2, 2); }
    },
  },
};
export default thema;
