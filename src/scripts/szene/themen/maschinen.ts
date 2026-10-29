// Maschinenkrieg (Film, Stimmung wie Terminator): zerstörte Stadt unter Rauch, Feuerschein am Horizont,
// Laserfeuer quer durchs Bild, ein Roboterskelett mit roten Augen stapft durch die Trümmer.
// Jägerdrohnen mit Suchscheinwerfern folgen der Maus.
import { type Thema, leinwand, verlauf, rgba, glut, rauschen, klemme, nebel } from '../motor';

const thema: Thema = {
  seed: 2029,
  paletten: {
    dunkel: {
      himmel: [[0, '#03050a'], [0.5, '#0a1224'], [0.82, '#2a1a26'], [1, '#5a2414']], feuer: '#ff6a1f', rauch: '#2a2c34',
      ruine: ['#0e1420', '#080c14', '#030508'], laser: ['#3fa9ff', '#ff3b2f'], metall: '#7d8794', drohne: '#0a0d12', kegel: 0.18, sterne: 0.5,
    },
    hell: {
      himmel: [[0, '#8f949c'], [0.55, '#b4aea6'], [1, '#d9a678']], feuer: '#ff7a2a', rauch: '#6b6a6c',
      ruine: ['#6c6f75', '#4a4d54', '#2a2c31'], laser: ['#1f7fe0', '#e0261c'], metall: '#9aa3ad', drohne: '#2a2d33', kegel: 0.12, sterne: 0,
    },
  },

  bauen(z) {
    const { W, h, dpr, pal, r } = z;
    const [hc, c0] = leinwand(W, h, dpr); z.himmel = hc;
    c0.fillStyle = verlauf(c0, 0, 0, 0, h, pal.himmel); c0.fillRect(0, 0, W, h);
    for (let i = 0; i < 100 * pal.sterne; i++) { c0.fillStyle = `rgba(200,215,255,${0.1 + r() * 0.3})`; c0.fillRect(r() * W, r() * h * 0.4, 1, 1); }
    glut(c0, W * 0.3, h * 0.95, W * 0.4, pal.feuer, 0.35); glut(c0, W * 0.78, h * 0.92, W * 0.3, pal.feuer, 0.3);
    for (let i = 0; i < 26; i++) nebel(c0, r() * W, h * (0.15 + r() * 0.5), W * (0.1 + r() * 0.2), h * 0.06, pal.rauch, 0.45);

    // Ruinen: zerbrochene Hochhäuser mit Stahlträgern
    const ruinen = (farbe: string, tiefe: number, anzahl: number, hoehe: [number, number], fenster: boolean) => {
      const [f, c] = leinwand(W, h, dpr); c.fillStyle = farbe; c.strokeStyle = farbe;
      for (let k = 0; k < anzahl; k++) {
        const x = r() * W, bw = W * (0.03 + r() * 0.06), top = h * (1 - hoehe[0] - r() * (hoehe[1] - hoehe[0]));
        c.beginPath(); c.moveTo(x, h); c.lineTo(x, top + r() * 20);
        for (let j = 1; j <= 5; j++) c.lineTo(x + (bw * j) / 5, top + r() * h * 0.08 * (j % 2 ? 1 : 0.3));
        c.lineTo(x + bw, h); c.fill();
        c.lineWidth = 1.5;
        for (let j = 0; j < 3; j++) { const sx = x + r() * bw; c.beginPath(); c.moveTo(sx, top + 10); c.lineTo(sx + (r() - 0.5) * 30, top - 20 - r() * 30); c.stroke(); }
        if (fenster) for (let y = top + 20; y < h; y += 14) for (let xx = x + 5; xx < x + bw - 5; xx += 10) if (r() < 0.12) { c.fillStyle = rgba(pal.feuer, 0.4 + r() * 0.4); c.fillRect(xx, y, 3, 4); c.fillStyle = farbe; }
      }
      c.fillRect(0, h * 0.94, W, h * 0.06);
      z.ebenen.push({ bild: f, tiefe });
    };
    ruinen(pal.ruine[0], 0.15, 16, [0.3, 0.6], true);
    ruinen(pal.ruine[1], 0.4, 9, [0.2, 0.42], true);

    // Vordergrund: Trümmerfeld mit Schädeln und verbogenem Metall
    const [f3, c3] = leinwand(W, h, dpr); const n = rauschen(r, 4);
    const boden = (x: number) => h * 0.9 + n(x * 0.006) * h * 0.03;
    c3.fillStyle = pal.ruine[2]; c3.beginPath(); c3.moveTo(0, h); for (let x = 0; x <= W; x += 4) c3.lineTo(x, boden(x) - Math.abs(n(x * 0.05)) * 10); c3.lineTo(W, h); c3.fill();
    for (let k = 0; k < 26; k++) {
      const x = r() * W, y = boden(x) - 2, g = 5 + r() * 6;
      c3.fillStyle = pal.ruine[2]; c3.beginPath(); c3.arc(x, y - g, g, Math.PI, 0); c3.lineTo(x + g * 0.7, y); c3.lineTo(x - g * 0.7, y); c3.fill();
      c3.fillStyle = rgba(pal.metall, 0.18); c3.beginPath(); c3.arc(x - g * 0.35, y - g * 0.9, g * 0.22, 0, Math.PI * 2); c3.arc(x + g * 0.35, y - g * 0.9, g * 0.22, 0, Math.PI * 2); c3.fill();
    }
    c3.strokeStyle = pal.ruine[2]; c3.lineWidth = 3;
    for (let k = 0; k < 8; k++) { const x = r() * W, y = boden(x); c3.beginPath(); c3.moveTo(x, y); c3.quadraticCurveTo(x + 20, y - 40 - r() * 30, x + 50 + r() * 40, y - 10 - r() * 50); c3.stroke(); }
    z.ebenen.push({ bild: f3, tiefe: 0.88, vorne: true });

    z.daten.boden = boden;
    z.daten.laser = [] as any[];
    z.daten.robo = { x: W * 0.55, v: 18 };
    z.daten.glut = Array.from({ length: 50 }, () => ({ x: r() * W, y: r() * h, v: 15 + r() * 30, p: r() * 10 }));
  },

  nachEbene(c, z, t, dt, i) {
    if (i !== 1) return;
    // Roboterskelett stapft über die Trümmer (mittlere Ebene)
    const ro = z.daten.robo; ro.x += ro.v * dt; if (ro.x > z.W + 60) ro.x = z.W * 0.42;
    const s = z.h * 0.3, x = ro.x - z.rand - z.px * z.rand * 0.36, y = z.h * 0.9 - z.py * 2.4;
    const schritt = Math.sin(ro.x / (s * 0.18));
    c.save(); c.translate(x, y); c.strokeStyle = z.pal.metall; c.fillStyle = z.pal.metall; c.lineCap = 'round';
    const glied = (ax: number, ay: number, bx: number, by: number, w: number) => { c.lineWidth = w; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); };
    // Beine
    for (const p of [schritt, -schritt]) {
      const kx = p * s * 0.12, fx = p * s * 0.2;
      glied(0, -s * 0.48, kx + s * 0.03, -s * 0.24, s * 0.05); glied(kx + s * 0.03, -s * 0.24, fx, 0, s * 0.045);
      glied(fx - s * 0.04, 0, fx + s * 0.08, 0, s * 0.03);
    }
    // Becken, Wirbelsäule, Rippen
    glied(-s * 0.08, -s * 0.5, s * 0.08, -s * 0.5, s * 0.05);
    glied(0, -s * 0.5, 0, -s * 0.85, s * 0.035);
    c.lineWidth = s * 0.022; for (let k = 0; k < 4; k++) { const ry = -s * (0.66 + k * 0.05); c.beginPath(); c.ellipse(0, ry, s * 0.1, s * 0.02, 0, 0, Math.PI * 2); c.stroke(); }
    // Arme, schwingen gegen die Beine, eine Waffe
    glied(0, -s * 0.84, -schritt * s * 0.08, -s * 0.66, s * 0.035); glied(-schritt * s * 0.08, -s * 0.66, -schritt * s * 0.04 + s * 0.08, -s * 0.52, s * 0.03);
    glied(0, -s * 0.84, s * 0.1, -s * 0.7, s * 0.035); glied(s * 0.1, -s * 0.7, s * 0.28, -s * 0.66, s * 0.03);
    c.fillRect(s * 0.12, -s * 0.71, s * 0.3, s * 0.05);
    // Schädel mit roten Augen
    c.beginPath(); c.ellipse(0, -s * 0.94, s * 0.07, s * 0.085, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(-s * 0.05, -s * 0.89, s * 0.1, s * 0.05);
    glut(c, -s * 0.025, -s * 0.95, s * 0.06, '#ff1a1a', 0.95); glut(c, s * 0.03, -s * 0.95, s * 0.06, '#ff1a1a', 0.95);
    c.restore();
  },

  davor(c, z, t, dt) {
    // Laserfeuer: kurze, helle Bolzen quer durchs Bild
    const L = z.daten.laser;
    if (Math.random() < dt * 1.6) {
      const vonLinks = Math.random() < 0.5, y = z.h * (0.35 + Math.random() * 0.45);
      L.push({ x: vonLinks ? -40 : z.w + 40, y, vx: (vonLinks ? 1 : -1) * (900 + Math.random() * 500), vy: (Math.random() - 0.5) * 120, f: z.pal.laser[(Math.random() * 2) | 0] });
    }
    c.save(); c.globalCompositeOperation = z.modus === 'dunkel' ? 'lighter' : 'source-over'; c.lineCap = 'round';
    for (let k = L.length - 1; k >= 0; k--) {
      const b = L[k]; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < -80 || b.x > z.w + 80) { L.splice(k, 1); continue; }
      const len = 0.045;
      c.strokeStyle = rgba(b.f, 0.35); c.lineWidth = 6; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x - b.vx * len, b.y - b.vy * len); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x - b.vx * len, b.y - b.vy * len); c.stroke();
    }
    c.restore();
    // Glutfunken steigen auf
    for (const g of z.daten.glut) {
      g.y -= g.v * dt; g.x += Math.sin(t + g.p) * 10 * dt; if (g.y < 0) { g.y = z.h; g.x = Math.random() * z.W; }
      c.fillStyle = rgba(z.pal.feuer, 0.4 + 0.4 * Math.sin(t * 3 + g.p)); c.fillRect(g.x - z.rand, g.y, 1.6, 1.6);
    }
  },

  folger: {
    n: 2, tiefen: [0.55, 1], tempo: 0.6, streuung: 160,
    ruhe: (z, t, f, i) => ({ x: z.w * (0.62 + 0.25 * Math.sin(t * 0.16 + i * 2.5)), y: z.h * (0.2 + 0.06 * Math.sin(t * 0.3 + i)) }),
    ziel: (z, x, y) => ({ x, y: Math.min(y, z.h * 0.45) }),
    zeichne(c, f, z, t) {
      const s = (22 + f.tiefe * 26) * f.groesse, neig = klemme(f.vx * 0.0009, -0.25, 0.25);
      // Suchscheinwerfer nach unten, schwenkt leicht
      const a = Math.PI / 2 + Math.sin(t * 0.8 + f.phase) * 0.35 - neig;
      c.save(); c.globalCompositeOperation = z.modus === 'dunkel' ? 'lighter' : 'screen';
      const l = z.h * 0.9;
      c.fillStyle = verlauf(c, f.x, f.y, f.x + Math.cos(a) * l, f.y + Math.sin(a) * l, [[0, `rgba(220,235,255,${z.pal.kegel})`], [1, 'rgba(220,235,255,0)']]);
      c.beginPath(); c.moveTo(f.x, f.y + s * 0.1); c.lineTo(f.x + Math.cos(a - 0.16) * l, f.y + Math.sin(a - 0.16) * l); c.lineTo(f.x + Math.cos(a + 0.16) * l, f.y + Math.sin(a + 0.16) * l); c.fill();
      c.restore();
      // Rumpf mit zwei Triebwerksgondeln
      c.save(); c.translate(f.x, f.y); c.rotate(neig); c.fillStyle = z.pal.drohne;
      c.beginPath(); c.moveTo(-s * 0.9, -s * 0.05); c.lineTo(-s * 0.3, -s * 0.22); c.lineTo(s * 0.3, -s * 0.22); c.lineTo(s * 0.9, -s * 0.05); c.lineTo(s * 0.5, s * 0.14); c.lineTo(-s * 0.5, s * 0.14); c.closePath(); c.fill();
      for (const sd of [-1, 1]) {
        c.beginPath(); c.ellipse(sd * s * 0.95, -s * 0.12, s * 0.2, s * 0.13, 0, 0, Math.PI * 2); c.fill();
        glut(c, sd * s * 0.95, -s * 0.02, s * 0.3, '#ffb070', z.modus === 'dunkel' ? 0.5 : 0.3);
      }
      glut(c, 0, s * 0.1, s * 0.22, '#ff2a2a', 0.9);
      c.restore();
    },
  },
};
export default thema;
