// Burg im Schneegebirge (Serie, Stimmung wie Game of Thrones): spitze Gipfel mit Schneekappen, eine Burg auf
// einem Felssporn mit flackernden Fenstern, Nadelwald davor, Schnee und Nebel. Ein Drache folgt der Maus.
import { type Thema, leinwand, verlauf, rgba, glut, rauschen, klemme, nebel } from '../motor';

const thema: Thema = {
  seed: 298,
  paletten: {
    dunkel: {
      himmel: [[0, '#03060c'], [0.6, '#0d1727'], [1, '#22304a']], schnee: '#c7d4e6', berg: ['#1b2538', '#121b2a', '#0b111b'], burg: '#080c13',
      fenster: '#ffb25a', wald: '#04070b', nebel: '#7088aa', mond: '#dde6f2', sterne: 1, drache: '#05080d', auge: '#ffcf5a',
    },
    hell: {
      himmel: [[0, '#a9b6c4'], [0.6, '#ccd4dc'], [1, '#e2e5e8']], schnee: '#ffffff', berg: ['#8f9bab', '#707d8e', '#566273'], burg: '#3c4552',
      fenster: '#ffd08a', wald: '#2a3433', nebel: '#ffffff', mond: null, sterne: 0, drache: '#262b33', auge: '#ffb84a',
    },
  },

  bauen(z) {
    const { W, h, dpr, pal, r } = z;
    const [hc, c0] = leinwand(W, h, dpr); z.himmel = hc;
    c0.fillStyle = verlauf(c0, 0, 0, 0, h, pal.himmel); c0.fillRect(0, 0, W, h);
    for (let i = 0; i < 200 * pal.sterne; i++) { c0.fillStyle = `rgba(220,230,255,${0.15 + r() * 0.5})`; c0.fillRect(r() * W, r() * h * 0.55, 1, 1); }
    if (pal.mond) { glut(c0, W * 0.78, h * 0.2, h * 0.32, pal.mond, 0.18); c0.fillStyle = pal.mond; c0.beginPath(); c0.arc(W * 0.78, h * 0.2, h * 0.05, 0, Math.PI * 2); c0.fill(); }
    else for (let i = 0; i < 6; i++) { c0.fillStyle = 'rgba(255,255,255,0.25)'; c0.beginPath(); c0.ellipse(r() * W, h * (0.1 + r() * 0.3), W * (0.12 + r() * 0.2), h * 0.03, 0, 0, Math.PI * 2); c0.fill(); }

    // Gebirge mit Schneekappen
    const gebirge = (basis: number, amp: number, freq: number, farbe: string, schnee: number, tiefe: number) => {
      const [f, c] = leinwand(W, h, dpr); const n = rauschen(r, 5);
      const fy = (x: number) => basis - amp * (1 - Math.abs(n(x * freq))) ** 1.6 - amp * 0.2 * n(x * freq * 3);
      c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= W; x += 2) c.lineTo(x, fy(x)); c.lineTo(W, h); c.closePath();
      c.fillStyle = farbe; c.fill();
      c.save(); c.clip();
      c.fillStyle = verlauf(c, 0, basis - amp, 0, basis - amp * (1 - schnee), [[0, rgba(pal.schnee, 0.9)], [1, rgba(pal.schnee, 0)]]);
      c.fillRect(0, basis - amp * 1.3, W, amp * 1.3 * schnee + amp * 0.2);
      // Schattenflanken
      c.fillStyle = verlauf(c, 0, basis - amp, W * 0.15, basis, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.18)']]); c.fillRect(0, basis - amp * 1.3, W, h);
      c.restore();
      z.ebenen.push({ bild: f, tiefe });
    };
    gebirge(h * 0.72, h * 0.42, 0.0035, pal.berg[0], 0.55, 0.1);
    gebirge(h * 0.82, h * 0.32, 0.005, pal.berg[1], 0.35, 0.28);

    // Felssporn mit Burg (rechte Hälfte)
    const [fb, cb] = leinwand(W, h, dpr); const nb = rauschen(r, 4);
    const sx0 = W * 0.6, sx1 = W * 0.96, top = h * 0.5;
    cb.fillStyle = pal.berg[2]; cb.beginPath(); cb.moveTo(sx0 - W * 0.06, h);
    for (let x = sx0 - W * 0.06; x <= sx1 + W * 0.04; x += 3) { const u = (x - sx0) / (sx1 - sx0); const dach = top + Math.max(0, Math.abs(u - 0.5) * 2 - 0.55) * h * 0.9 + nb(x * 0.05) * 6; cb.lineTo(x, Math.min(h, dach)); }
    cb.lineTo(sx1 + W * 0.04, h); cb.fill();
    const fenster: { x: number; y: number; g: number }[] = [];
    const turm = (x: number, bw: number, th: number, spitz: boolean) => {
      cb.fillStyle = pal.burg; cb.fillRect(x, top - th, bw, th + 8);
      if (spitz) { cb.beginPath(); cb.moveTo(x - bw * 0.12, top - th); cb.lineTo(x + bw / 2, top - th - bw * 1.4); cb.lineTo(x + bw * 1.12, top - th); cb.fill(); }
      else for (let k = 0; k < bw; k += bw / 4) cb.fillRect(x + k, top - th - bw * 0.25, bw / 8, bw * 0.25);
      for (let y = top - th + bw * 0.5; y < top - 4; y += bw * 0.9) if (r() < 0.65) fenster.push({ x: x + bw * (0.3 + r() * 0.3), y, g: Math.max(2, bw * 0.12) });
    };
    const bw = Math.max(16, W * 0.018);
    cb.fillStyle = pal.burg; cb.fillRect(W * 0.64, top - h * 0.06, W * 0.28, h * 0.08);
    for (let k = W * 0.64; k < W * 0.92; k += bw * 0.5) cb.fillRect(k, top - h * 0.06 - bw * 0.2, bw * 0.25, bw * 0.2);
    turm(W * 0.65, bw, h * 0.14, true); turm(W * 0.71, bw * 0.8, h * 0.1, false); turm(W * 0.765, bw * 1.3, h * 0.26, true);
    turm(W * 0.81, bw * 0.9, h * 0.16, false); turm(W * 0.86, bw, h * 0.2, true); turm(W * 0.9, bw * 0.7, h * 0.11, false);
    for (const f of fenster) { cb.fillStyle = rgba(pal.fenster, 0.85); cb.fillRect(f.x, f.y, f.g, f.g * 1.6); }
    z.daten.fenster = fenster;
    z.ebenen.push({ bild: fb, tiefe: 0.48 });

    // Nadelwald im Vordergrund
    const [fw, cw] = leinwand(W, h, dpr);
    const tanne = (c: CanvasRenderingContext2D, x: number, basis: number, hoehe: number) => {
      const b = hoehe * 0.32; c.beginPath(); c.moveTo(x, basis - hoehe);
      for (let k = 1; k <= 5; k++) { const y = basis - hoehe + (hoehe * k) / 5; const br = (b * k) / 5; c.lineTo(x + br, y); c.lineTo(x + br * 0.45, y); }
      for (let k = 5; k >= 1; k--) { const y = basis - hoehe + (hoehe * k) / 5; const br = (b * k) / 5; c.lineTo(x - br * 0.45, y); c.lineTo(x - br, y); }
      c.closePath(); c.fill(); c.fillRect(x - 1.5, basis - 4, 3, 6);
    };
    cw.fillStyle = pal.wald;
    for (let x = -20; x < W + 20; x += 8 + r() * 14) { const randNah = x < W * 0.15 || x > W * 0.85 ? 1.7 : 1; tanne(cw, x, h * (0.93 + r() * 0.05), h * (0.08 + r() * 0.12) * randNah); }
    cw.fillRect(0, h * 0.95, W, h * 0.05);
    z.ebenen.push({ bild: fw, tiefe: 0.88, vorne: true });

    z.daten.schnee = Array.from({ length: 140 }, () => ({ x: r() * W, y: r() * h, v: 18 + r() * 40, g: 0.8 + r() * 1.8, p: r() * 10 }));
    z.daten.nebel = Array.from({ length: 5 }, () => ({ x: r() * W, y: h * (0.55 + r() * 0.3), b: W * (0.25 + r() * 0.3), v: 6 + r() * 10 }));
  },

  nachEbene(c, z, t, dt, i) {
    if (i === 1) for (const n of z.daten.nebel) {
      n.x += n.v * dt; if (n.x - n.b > z.W) n.x = -n.b;
      nebel(c, n.x - z.rand, n.y, n.b, z.h * 0.08, z.pal.nebel, z.modus === 'dunkel' ? 0.14 : 0.45);
    }
    if (i === 2) for (const f of z.daten.fenster) {
      // Fackelschein flackert
      const a = 0.25 + 0.25 * Math.sin(t * 9 + f.x) * Math.sin(t * 5.3 + f.y);
      glut(c, f.x - z.rand - z.px * z.rand * 0.43 + f.g / 2, f.y - z.py * 6 * 0.48 + f.g, f.g * 4, z.pal.fenster, Math.max(0, a));
    }
  },

  davor(c, z, t, dt) {
    c.fillStyle = z.modus === 'dunkel' ? 'rgba(230,240,255,0.75)' : 'rgba(255,255,255,0.9)';
    for (const s of z.daten.schnee) {
      s.y += s.v * dt; s.x += Math.sin(t + s.p) * 12 * dt; if (s.y > z.h) { s.y = -4; s.x = Math.random() * z.W; }
      c.fillRect(s.x - z.rand, s.y, s.g, s.g);
    }
  },

  folger: {
    n: 2, tiefen: [0.45, 1], tempo: 0.6, streuung: 160,
    ruhe: (z, t, f) => ({ x: z.w * (0.55 + 0.25 * Math.sin(t * 0.11 + f.phase)), y: z.h * (0.22 + 0.1 * Math.sin(t * 0.17 + f.phase)) + f.oy }),
    zeichne(c, f, z, t) {
      const s = (18 + f.tiefe * 26) * f.groesse, richtung = f.richtung, neig = klemme(f.vy * 0.001, -0.3, 0.3) * richtung;
      const schlag = Math.sin(t * 3.4 + f.phase);
      c.save(); c.translate(f.x, f.y); c.rotate(neig); c.scale(richtung, 1);
      c.fillStyle = z.pal.drache;
      // ferner Flügel
      const fluegel = (dx: number, hoch: number, a: number) => {
        c.globalAlpha = a; c.beginPath(); c.moveTo(dx, -s * 0.1);
        c.quadraticCurveTo(dx - s * 0.3, -s * 0.9 * hoch, dx - s * 0.9, -s * 1.35 * hoch);
        c.lineTo(dx - s * 1.05, -s * 0.95 * hoch); c.quadraticCurveTo(dx - s * 1.2, -s * 0.5 * hoch, dx - s * 1.7, -s * 0.55 * hoch);
        c.quadraticCurveTo(dx - s * 1.2, -s * 0.15, dx - s * 0.9, s * 0.05 * hoch); c.quadraticCurveTo(dx - s * 0.5, -s * 0.05, dx - s * 0.2, s * 0.1);
        c.closePath(); c.fill(); c.globalAlpha = 1;
      };
      fluegel(s * 0.15, schlag * 0.8 + 0.15, 0.6);
      // Körper, Hals, Kopf, Schwanz
      c.beginPath(); c.ellipse(0, 0, s * 0.55, s * 0.16, -0.05, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(s * 0.4, -s * 0.08); c.quadraticCurveTo(s * 0.75, -s * 0.3, s * 0.95, -s * 0.28); c.lineTo(s * 1.18, -s * 0.24); c.lineTo(s * 0.98, -s * 0.15); c.quadraticCurveTo(s * 0.75, -s * 0.1, s * 0.45, s * 0.08); c.fill();
      c.beginPath(); c.moveTo(-s * 0.45, -s * 0.04); c.quadraticCurveTo(-s * 1.0, s * 0.05 + Math.sin(t * 2 + f.phase) * s * 0.12, -s * 1.5, -s * 0.06 + Math.sin(t * 2.4 + f.phase) * s * 0.2);
      c.lineTo(-s * 1.62, -s * 0.12); c.lineTo(-s * 1.52, s * 0.02); c.quadraticCurveTo(-s * 1.0, s * 0.16, -s * 0.45, s * 0.08); c.fill();
      fluegel(-s * 0.05, schlag * 0.95 + 0.1, 1);
      glut(c, s * 1.02, -s * 0.25, s * 0.12, z.pal.auge, 0.9);
      c.restore();
    },
  },
};
export default thema;
