// Wüstenplanet (Film, Stimmung wie Dune): Dünenmeer in mehreren Tiefen, zwei Monde (nachts) bzw. weiße Sonne (tags),
// wehender Sand, ab und zu wandert eine Sandfahne durch die Dünen. Libellenflieger folgen der Maus.
import { type Thema, leinwand, verlauf, rgba, glut, rauschen, klemme } from '../motor';

const thema: Thema = {
  seed: 10191,
  paletten: {
    dunkel: {
      himmel: [[0, '#04050d'], [0.55, '#121736'], [0.85, '#33294a'], [1, '#4a3550']], mond: '#ece6d6', mond2: '#c9b9a6',
      fels: '#241c30', duene: ['#2f2439', '#3a2b3c', '#251b2b', '#140e19'], kante: '#9b88b4', sand: '#c4add4', sterne: 1, koerper: '#16121c', fluegel: 'rgba(220,210,255,0.28)',
    },
    hell: {
      himmel: [[0, '#f7ecd6'], [0.6, '#f2d6a6'], [1, '#e9b97c']], mond: '#fffaf0', mond2: null,
      fels: '#d2a57a', duene: ['#e0ae74', '#d19a5d', '#bc8048', '#9c6434'], kante: '#f8e0b4', sand: '#f0cf9c', sterne: 0, koerper: '#5a3a24', fluegel: 'rgba(90,60,35,0.22)',
    },
  },

  bauen(z) {
    const { W, h, dpr, pal, r } = z;
    const [hc, c0] = leinwand(W, h, dpr); z.himmel = hc;
    c0.fillStyle = verlauf(c0, 0, 0, 0, h, pal.himmel); c0.fillRect(0, 0, W, h);
    for (let i = 0; i < 260 * pal.sterne; i++) { c0.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.6})`; const s = r() < 0.08 ? 1.6 : 1; c0.fillRect(r() * W, r() * h * 0.6, s, s); }
    if (z.modus === 'dunkel') {
      const mx = W * 0.72, my = h * 0.24, mr = h * 0.085;
      glut(c0, mx, my, mr * 4, pal.mond, 0.16);
      c0.fillStyle = pal.mond; c0.beginPath(); c0.arc(mx, my, mr, 0, Math.PI * 2); c0.fill();
      for (let i = 0; i < 9; i++) { c0.fillStyle = 'rgba(80,70,90,0.12)'; c0.beginPath(); c0.arc(mx + (r() - 0.5) * mr * 1.3, my + (r() - 0.5) * mr * 1.3, mr * (0.08 + r() * 0.18), 0, Math.PI * 2); c0.fill(); }
      c0.fillStyle = pal.mond2; c0.beginPath(); c0.arc(W * 0.58, h * 0.14, h * 0.024, 0, Math.PI * 2); c0.fill();
    } else {
      glut(c0, W * 0.7, h * 0.28, h * 0.7, '#ffffff', 0.55); glut(c0, W * 0.7, h * 0.28, h * 0.12, '#ffffff', 0.95);
    }

    // Ferne Felskette, flach und gezackt
    const [f0, c1] = leinwand(W, h, dpr); const n0 = rauschen(r, 5);
    const f0y = (x: number) => h * 0.6 - Math.abs(n0(x * 0.012)) * h * 0.09 - (n0(x * 0.003) + 1) * h * 0.02;
    c1.beginPath(); c1.moveTo(0, h); for (let x = 0; x <= W; x += 3) c1.lineTo(x, f0y(x)); c1.lineTo(W, h);
    c1.fillStyle = verlauf(c1, 0, h * 0.45, 0, h, [[0, pal.fels], [1, pal.duene[0]]]); c1.fill();
    z.ebenen.push({ bild: f0, tiefe: 0.1 });

    // Dünen: weiche Rücken mit scharfem Kamm, oben vom Licht gestreift
    const dune = (basis: number, amp: number, freq: number, farbe: string, tiefe: number, vorne = false) => {
      const [f, c] = leinwand(W, h, dpr); const n = rauschen(r, 3); const n2 = rauschen(r, 2);
      const fy = (x: number) => basis - amp * Math.pow(Math.abs(n(x * freq)), 0.7) - amp * 0.35 * n2(x * freq * 0.3);
      c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= W; x += 3) c.lineTo(x, fy(x)); c.lineTo(W, h);
      c.fillStyle = verlauf(c, 0, basis - amp * 1.2, 0, h, [[0, pal.kante], [0.18, farbe], [1, farbe]]); c.fill();
      c.strokeStyle = rgba(pal.kante, 0.55); c.lineWidth = 1.2; c.beginPath(); for (let x = 0; x <= W; x += 3) { if (x) c.lineTo(x, fy(x)); else c.moveTo(x, fy(x)); } c.stroke();
      // Windrippel
      c.strokeStyle = rgba('#000000', 0.06); c.lineWidth = 1;
      for (let i = 0; i < 40; i++) { const x = r() * W, y = fy(x) + 8 + r() * (h - fy(x)) * 0.6; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 20, y - 3, x + 44, y); c.stroke(); }
      z.ebenen.push({ bild: f, tiefe, vorne });
      return fy;
    };
    dune(h * 0.7, h * 0.08, 0.004, pal.duene[0], 0.25);
    z.daten.kamm = dune(h * 0.8, h * 0.1, 0.0032, pal.duene[1], 0.5);
    dune(h * 0.9, h * 0.08, 0.0026, pal.duene[2], 0.72);
    dune(h * 1.0, h * 0.1, 0.0022, pal.duene[3], 0.92, true);
    z.daten.sand = Array.from({ length: 110 }, () => ({ x: r() * W, y: h * (0.55 + r() * 0.42), v: 90 + r() * 160, l: 4 + r() * 10, p: r() * 10 }));
    z.daten.fahne = { x: -200, warte: 4 };
  },

  nachEbene(c, z, t, dt, i) {
    if (i !== 2) return;
    // Sandfahne wandert über die mittlere Düne
    const f = z.daten.fahne;
    if (f.warte > 0) { f.warte -= dt; return; }
    f.x += 70 * dt;
    if (f.x > z.W + 200) { f.x = -200; f.warte = 9 + Math.random() * 8; return; }
    for (let k = 0; k < 9; k++) {
      const x = f.x - k * 22, y = z.daten.kamm(x) - 4;
      const rad = 10 + k * 2.2 + Math.sin(t * 3 + k) * 2;
      glut(c, x - z.rand - z.px * z.rand * 0.45, y - z.py * 3, rad, z.pal.sand, 0.18 * (1 - k / 10));
    }
  },

  davor(c, z, t, dt) {
    c.strokeStyle = rgba(z.pal.sand, 0.32); c.lineWidth = 1; c.beginPath();
    for (const s of z.daten.sand) {
      s.x += s.v * dt; if (s.x > z.W) { s.x = 0; s.y = z.h * (0.55 + Math.random() * 0.42); }
      const y = s.y + Math.sin(t * 2 + s.p) * 3; c.moveTo(s.x - z.rand, y); c.lineTo(s.x - z.rand - s.l, y + 0.6);
    }
    c.stroke();
  },

  folger: {
    n: 3, tiefen: [0.4, 1], tempo: 0.8, streuung: 110,
    zeichne(c, f, z, t) {
      const s = (10 + f.tiefe * 14) * f.groesse, richtung = f.richtung, neig = klemme(f.vy * 0.0012, -0.25, 0.25) * richtung;
      c.save(); c.translate(f.x, f.y + Math.sin(t * 2 + f.phase) * 2); c.rotate(neig); c.scale(richtung, 1);
      // Flügel: zwei Paare, schnell schlagend, durchscheinend
      c.fillStyle = z.pal.fluegel;
      for (const [wx, ph] of [[-0.35, 0], [0.3, 1.3]]) {
        const schlag = 0.25 + 0.75 * Math.abs(Math.sin(t * 26 + f.phase + ph));
        c.beginPath(); c.ellipse(s * wx, -s * 0.25 - s * 0.55 * schlag, s * 0.95, s * 0.18 * schlag + 1, -0.12, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(s * wx, -s * 0.2 + s * 0.35 * schlag, s * 0.8, s * 0.12 * schlag + 1, 0.1, 0, Math.PI * 2); c.fill();
      }
      // Rumpf: langgezogen, Kanzel vorn, schmales Heck
      c.fillStyle = z.pal.koerper;
      c.beginPath(); c.ellipse(s * 0.15, 0, s * 0.9, s * 0.22, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(-s * 0.6, -s * 0.06); c.lineTo(-s * 1.6, -s * 0.02); c.lineTo(-s * 1.6, s * 0.06); c.lineTo(-s * 0.6, s * 0.12); c.fill();
      c.fillStyle = z.modus === 'dunkel' ? 'rgba(255,200,120,0.7)' : 'rgba(255,255,255,0.55)';
      c.beginPath(); c.ellipse(s * 0.85, -s * 0.04, s * 0.2, s * 0.12, 0, 0, Math.PI * 2); c.fill();
      if (z.modus === 'dunkel') glut(c, -s * 1.55, 0, s * 0.4, '#ff6a3a', 0.8);
      c.restore();
    },
  },
};
export default thema;
