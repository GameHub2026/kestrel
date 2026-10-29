// Nebelwald mit Turmruine (Spiel, Stimmung wie The Witcher): großer Mond, Hügel mit verfallenem Turm und einem
// erleuchteten Fenster, Tannenreihen in mehreren Tiefen, ziehender Nebel. Ein Rabenschwarm folgt der Maus.
import { type Thema, leinwand, verlauf, rgba, glut, rauschen, klemme, nebel } from '../motor';

const thema: Thema = {
  seed: 1272,
  paletten: {
    dunkel: {
      himmel: [[0, '#03060a'], [0.6, '#0e181b'], [1, '#253031']], mond: '#e4ebee', baum: ['#1a2526', '#101919', '#081011', '#030707'],
      nebel: '#9fb4b4', turm: '#0b1313', fenster: '#ffb35c', rabe: '#010303', sterne: 1,
    },
    hell: {
      himmel: [[0, '#b6c0bf'], [0.6, '#d4d9d4'], [1, '#e6e8e1']], mond: '#ffffff', baum: ['#a1aca8', '#7b8984', '#535f5b', '#2d3633'],
      nebel: '#ffffff', turm: '#4b5552', fenster: '#ffcf8a', rabe: '#151a19', sterne: 0,
    },
  },

  bauen(z) {
    const { W, h, dpr, pal, r } = z;
    const [hc, c0] = leinwand(W, h, dpr); z.himmel = hc;
    c0.fillStyle = verlauf(c0, 0, 0, 0, h, pal.himmel); c0.fillRect(0, 0, W, h);
    for (let i = 0; i < 180 * pal.sterne; i++) { c0.fillStyle = `rgba(230,240,240,${0.1 + r() * 0.4})`; c0.fillRect(r() * W, r() * h * 0.5, 1, 1); }
    const mx = W * 0.7, my = h * 0.26, mr = h * (z.modus === 'dunkel' ? 0.1 : 0.07);
    glut(c0, mx, my, mr * 4, pal.mond, z.modus === 'dunkel' ? 0.2 : 0.5);
    c0.fillStyle = z.modus === 'dunkel' ? pal.mond : 'rgba(255,255,255,0.85)'; c0.beginPath(); c0.arc(mx, my, mr, 0, Math.PI * 2); c0.fill();
    if (z.modus === 'dunkel') for (let i = 0; i < 7; i++) { c0.fillStyle = 'rgba(120,135,140,0.14)'; c0.beginPath(); c0.arc(mx + (r() - 0.5) * mr * 1.2, my + (r() - 0.5) * mr * 1.2, mr * (0.1 + r() * 0.2), 0, Math.PI * 2); c0.fill(); }

    const tanne = (c: CanvasRenderingContext2D, x: number, basis: number, hoehe: number) => {
      const b = hoehe * 0.26; c.beginPath(); c.moveTo(x, basis - hoehe);
      for (let k = 1; k <= 7; k++) { const y = basis - hoehe + (hoehe * k) / 7; const br = (b * k) / 7; c.lineTo(x + br, y); c.lineTo(x + br * 0.5, y - hoehe * 0.02); }
      for (let k = 7; k >= 1; k--) { const y = basis - hoehe + (hoehe * k) / 7; const br = (b * k) / 7; c.lineTo(x - br * 0.5, y - hoehe * 0.02); c.lineTo(x - br, y); }
      c.closePath(); c.fill();
    };

    // Ferner Hügel mit Turmruine
    const [f1, c1] = leinwand(W, h, dpr); const n1 = rauschen(r, 4);
    const hy = (x: number) => h * 0.62 - (n1(x * 0.003) + 1) * h * 0.06 - Math.exp(-(((x - W * 0.82) / (W * 0.1)) ** 2)) * h * 0.1;
    c1.fillStyle = pal.baum[0]; c1.beginPath(); c1.moveTo(0, h); for (let x = 0; x <= W; x += 3) c1.lineTo(x, hy(x)); c1.lineTo(W, h); c1.fill();
    const tx = W * 0.82, ty = hy(tx), tb = Math.max(14, W * 0.016), th = h * 0.2;
    c1.fillStyle = pal.turm; c1.beginPath(); c1.moveTo(tx - tb, ty + 4); c1.lineTo(tx - tb * 0.85, ty - th); c1.lineTo(tx - tb * 0.4, ty - th - tb * 0.6); c1.lineTo(tx, ty - th + tb * 0.3); c1.lineTo(tx + tb * 0.5, ty - th - tb * 0.2); c1.lineTo(tx + tb * 0.85, ty - th * 0.82); c1.lineTo(tx + tb, ty + 4); c1.fill();
    c1.fillStyle = rgba(pal.fenster, 0.9); c1.fillRect(tx - tb * 0.15, ty - th * 0.6, tb * 0.3, tb * 0.5);
    c1.fillStyle = pal.baum[0]; for (let x = 0; x < W; x += 5 + r() * 8) tanne(c1, x, hy(x) + 6, h * (0.03 + r() * 0.05));
    z.daten.turmfenster = { x: tx, y: ty - th * 0.6 + tb * 0.25, g: tb };
    z.ebenen.push({ bild: f1, tiefe: 0.12 });

    const reihe = (farbe: string, basis: number, hoehen: [number, number], tiefe: number, vorne = false, dichte = 10) => {
      const [f, c] = leinwand(W, h, dpr); c.fillStyle = farbe;
      for (let x = -20; x < W + 20; x += dichte * (0.6 + r() * 0.8)) { const rand = vorne && (x < W * 0.18 || x > W * 0.86) ? 2.2 : 1; tanne(c, x, h * basis + r() * h * 0.03, h * (hoehen[0] + r() * (hoehen[1] - hoehen[0])) * rand); }
      c.fillRect(0, h * basis, W, h * (1 - basis));
      z.ebenen.push({ bild: f, tiefe, vorne });
    };
    reihe(pal.baum[1], 0.74, [0.1, 0.18], 0.3, false, 12);
    reihe(pal.baum[2], 0.86, [0.12, 0.22], 0.55, false, 16);
    reihe(pal.baum[3], 0.98, [0.1, 0.2], 0.88, true, 22);
    z.daten.nebel = Array.from({ length: 8 }, (_, i) => ({ x: r() * W, y: h * (0.6 + (i % 4) * 0.08), b: W * (0.2 + r() * 0.3), v: (r() < 0.5 ? -1 : 1) * (5 + r() * 9), ebene: i % 3 }));
  },

  nachEbene(c, z, t, dt, i) {
    if (i === 1) { const f = z.daten.turmfenster; glut(c, f.x - z.rand - z.px * z.rand * 0.11, f.y, f.g * 2.2, z.pal.fenster, 0.3 + 0.12 * Math.sin(t * 3)); }
    for (const n of z.daten.nebel) {
      if (n.ebene !== i) continue;
      n.x += n.v * dt; if (n.x - n.b > z.W) n.x = -n.b; if (n.x + n.b < 0) n.x = z.W + n.b;
      nebel(c, n.x - z.rand, n.y, n.b, z.h * 0.07, z.pal.nebel, z.modus === 'dunkel' ? 0.12 : 0.4);
    }
  },

  folger: {
    n: 9, tiefen: [0.35, 1], tempo: 0.9, streuung: 110,
    ruhe: (z, t, f, i) => ({ x: z.w * 0.62 + Math.cos(t * 0.45 + i * 0.7) * z.w * 0.12 + f.ox * 0.5, y: z.h * 0.3 + Math.sin(t * 0.6 + i * 0.7) * z.h * 0.07 + f.oy * 0.5 }),
    zeichne(c, f, z, t) {
      const s = (5 + f.tiefe * 9) * f.groesse, neig = klemme(f.vy * 0.0015, -0.4, 0.4) * f.richtung;
      const flap = Math.sin(t * 10 + f.phase * 4);
      c.save(); c.translate(f.x, f.y); c.rotate(neig); c.scale(f.richtung, 1);
      c.fillStyle = z.pal.rabe; c.strokeStyle = z.pal.rabe; c.lineWidth = Math.max(1, s * 0.22); c.lineCap = 'round';
      c.beginPath(); c.ellipse(0, 0, s * 0.55, s * 0.16, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(s * 0.5, -s * 0.06); c.lineTo(s * 0.85, 0); c.lineTo(s * 0.5, s * 0.08); c.fill();
      c.beginPath(); c.moveTo(-s * 0.45, 0); c.lineTo(-s * 0.85, -s * 0.12); c.lineTo(-s * 0.85, s * 0.14); c.fill();
      // Flügel als geschwungene Schläge
      c.beginPath(); c.moveTo(s * 0.05, -s * 0.05); c.quadraticCurveTo(-s * 0.2, -s * (0.4 + flap * 0.9), -s * 0.75, -s * (0.1 + flap * 1.1)); c.stroke();
      c.globalAlpha = 0.6; c.beginPath(); c.moveTo(s * 0.12, -s * 0.03); c.quadraticCurveTo(-s * 0.05, -s * (0.3 + flap * 0.7), -s * 0.5, -s * (0.05 + flap * 0.85)); c.stroke();
      c.restore();
    },
  },
};
export default thema;
