// Wüste mit Tafelbergen (Spiel, Stimmung wie Red Dead Redemption): Abendsonne hinter den Mesas (dunkel) bzw.
// klarer Mittag (hell), Kakteen, Zaunpfähle und Telegrafenleitung vorn, Staub, ab und zu rollt ein Steppenläufer. Adler folgen der Maus.
import { type Thema, leinwand, verlauf, rgba, glut, rauschen, klemme } from '../motor';

const thema: Thema = {
  seed: 1899,
  paletten: {
    dunkel: {
      himmel: [[0, '#181331'], [0.42, '#47244a'], [0.74, '#c4553f'], [1, '#f2a25a']], sonne: '#ffcf7a', sonneY: 0.62, sonneR: 0.13,
      fels: ['#5b2e3d', '#3c1e2d', '#1d1018'], staub: '#f2b07a', vogel: '#170c11', wolke: 'rgba(255,170,130,0.22)',
    },
    hell: {
      himmel: [[0, '#79afd8'], [0.6, '#bad6e6'], [1, '#f2dcb4']], sonne: '#fffbe8', sonneY: 0.17, sonneR: 0.05,
      fels: ['#cc9064', '#a6623b', '#683a22'], staub: '#ecd0a6', vogel: '#33241c', wolke: 'rgba(255,255,255,0.5)',
    },
  },

  bauen(z) {
    const { W, h, dpr, pal, r } = z;
    const [hc, c0] = leinwand(W, h, dpr); z.himmel = hc;
    c0.fillStyle = verlauf(c0, 0, 0, 0, h, pal.himmel); c0.fillRect(0, 0, W, h);
    const sx = W * 0.68, sy = h * pal.sonneY, sr = h * pal.sonneR;
    glut(c0, sx, sy, sr * 5, pal.sonne, 0.35); c0.fillStyle = pal.sonne; c0.beginPath(); c0.arc(sx, sy, sr, 0, Math.PI * 2); c0.fill();
    c0.fillStyle = pal.wolke;
    for (let i = 0; i < 9; i++) { const y = h * (0.12 + r() * 0.4), x = r() * W; c0.beginPath(); c0.ellipse(x, y, W * (0.06 + r() * 0.14), 2 + r() * 4, 0, 0, Math.PI * 2); c0.fill(); }

    // Tafelberge: flache Kuppen, steile Flanken, Schichtstreifen
    const mesas = (basis: number, hoehen: [number, number], farbe: string, tiefe: number, anzahl: number) => {
      const [f, c] = leinwand(W, h, dpr); const n = rauschen(r, 4);
      c.fillStyle = farbe; c.fillRect(0, basis, W, h - basis);
      for (let k = 0; k < anzahl; k++) {
        const x = r() * W, bw = W * (0.06 + r() * 0.16), mh = h * (hoehen[0] + r() * (hoehen[1] - hoehen[0])), top = basis - mh, fl = bw * 0.12;
        c.beginPath(); c.moveTo(x - fl * 2, basis); c.lineTo(x, top + mh * 0.1); c.lineTo(x + fl * 0.3, top);
        for (let xx = x + fl * 0.3; xx < x + bw - fl * 0.3; xx += 6) c.lineTo(xx, top + n(xx * 0.05) * 2);
        c.lineTo(x + bw, top + mh * 0.12); c.lineTo(x + bw + fl * 2, basis); c.closePath(); c.fill();
        c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = top + mh * 0.25; y < basis; y += mh * 0.18) c.fillRect(x - fl * 2, y, bw + fl * 4, mh * 0.04);
        c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(x + bw * 0.55, top, bw, mh); c.restore();
      }
      z.ebenen.push({ bild: f, tiefe });
    };
    mesas(h * 0.74, [0.12, 0.26], pal.fels[0], 0.14, 6);
    mesas(h * 0.84, [0.1, 0.22], pal.fels[1], 0.4, 4);

    // Vordergrund: Boden, Kakteen, Zaun, Telegrafenmasten mit Leitung
    const [f3, c3] = leinwand(W, h, dpr); const nb = rauschen(r, 3);
    const boden = (x: number) => h * 0.9 + nb(x * 0.004) * h * 0.02;
    c3.fillStyle = pal.fels[2]; c3.beginPath(); c3.moveTo(0, h); for (let x = 0; x <= W; x += 4) c3.lineTo(x, boden(x)); c3.lineTo(W, h); c3.fill();
    const kaktus = (x: number, hoehe: number) => {
      const b = hoehe * 0.14, y = boden(x); c3.lineCap = 'round'; c3.strokeStyle = pal.fels[2]; c3.lineWidth = b;
      c3.beginPath(); c3.moveTo(x, y); c3.lineTo(x, y - hoehe); c3.stroke();
      c3.lineWidth = b * 0.75;
      c3.beginPath(); c3.moveTo(x, y - hoehe * 0.45); c3.lineTo(x - hoehe * 0.28, y - hoehe * 0.45); c3.lineTo(x - hoehe * 0.28, y - hoehe * 0.78); c3.stroke();
      c3.beginPath(); c3.moveTo(x, y - hoehe * 0.6); c3.lineTo(x + hoehe * 0.24, y - hoehe * 0.6); c3.lineTo(x + hoehe * 0.24, y - hoehe * 0.88); c3.stroke();
    };
    kaktus(W * 0.08, h * 0.2); kaktus(W * 0.9, h * 0.26); kaktus(W * 0.62, h * 0.09); kaktus(W * 0.3, h * 0.06);
    c3.fillStyle = pal.fels[2];
    const masten = [W * 0.2, W * 0.5, W * 0.8, W * 1.1];
    for (const x of masten) { const y = boden(x); c3.fillRect(x - 1.5, y - h * 0.24, 3, h * 0.24); c3.fillRect(x - 12, y - h * 0.23, 24, 2.5); }
    c3.strokeStyle = pal.fels[2]; c3.lineWidth = 1;
    for (let k = 0; k < masten.length - 1; k++) for (const dx of [-10, 10]) {
      const a = masten[k] + dx, b = masten[k + 1] + dx, ya = boden(masten[k]) - h * 0.23, yb = boden(masten[k + 1]) - h * 0.23;
      c3.beginPath(); c3.moveTo(a, ya); c3.quadraticCurveTo((a + b) / 2, (ya + yb) / 2 + h * 0.05, b, yb); c3.stroke();
    }
    for (let x = W * 0.36; x < W * 0.56; x += 16) { c3.fillRect(x, boden(x) - 14, 2, 14); }
    c3.fillRect(W * 0.36, boden(W * 0.4) - 11, W * 0.2, 1.5);
    z.ebenen.push({ bild: f3, tiefe: 0.86, vorne: true });
    z.daten.boden = boden;
    z.daten.staub = Array.from({ length: 70 }, () => ({ x: r() * W, y: h * (0.5 + r() * 0.45), v: 10 + r() * 30, p: r() * 10 }));
    z.daten.roller = { x: -60, warte: 6, d: 0 };
  },

  davor(c, z, t, dt) {
    for (const s of z.daten.staub) {
      s.x += s.v * dt; if (s.x > z.W) s.x = 0;
      c.fillStyle = rgba(z.pal.staub, 0.25 + 0.2 * Math.sin(t + s.p)); c.fillRect(s.x - z.rand, s.y + Math.sin(t * 0.8 + s.p) * 4, 1.5, 1.5);
    }
  },

  vorneAnim(c, z, t, dt) {
    // Steppenläufer rollt über den Boden
    const ro = z.daten.roller;
    if (ro.warte > 0) { ro.warte -= dt; return; }
    ro.x += 90 * dt; ro.d += 90 * dt / 14;
    if (ro.x > z.W + 60) { ro.x = -60; ro.warte = 10 + Math.random() * 10; return; }
    const x = ro.x - z.rand, y = z.daten.boden(ro.x) - 14 - Math.abs(Math.sin(ro.d * 0.8)) * 10;
    c.save(); c.translate(x, y); c.rotate(ro.d); c.strokeStyle = rgba(z.pal.fels[2], 0.9); c.lineWidth = 1;
    for (let k = 0; k < 12; k++) { c.beginPath(); c.arc(Math.sin(k * 2.3) * 3, Math.cos(k * 1.7) * 3, 9 + (k % 3) * 2, k, k + 2.2); c.stroke(); }
    c.restore();
  },

  folger: {
    n: 3, tiefen: [0.4, 1], tempo: 0.55, streuung: 150,
    ruhe: (z, t, f, i) => ({ x: z.w * 0.6 + Math.cos(t * 0.3 + i * 2.1) * z.w * 0.15, y: z.h * 0.3 + Math.sin(t * 0.3 + i * 2.1) * z.h * 0.08 + f.oy * 0.3 }),
    zeichne(c, f, z, t) {
      // Silhouette von unten: gespreizte Flügel mit Schwungfedern, Fächerschwanz; neigt sich in die Kurve
      const s = (16 + f.tiefe * 22) * f.groesse, neig = klemme(f.vx * 0.0011, -0.35, 0.35);
      const flap = Math.sin(t * 4.2 + f.phase) * (0.35 + 0.65 * Math.max(0, Math.sin(t * 0.5 + f.phase))) * 0.5;
      c.save(); c.translate(f.x, f.y); c.rotate(neig); c.fillStyle = z.pal.vogel;
      for (const sd of [-1, 1]) {
        c.beginPath(); c.moveTo(sd * s * 0.06, -s * 0.05);
        c.quadraticCurveTo(sd * s * 0.45, -s * (0.2 + flap * 0.5), sd * s * 0.95, -s * (0.12 + flap));
        for (let k = 0; k < 5; k++) { c.lineTo(sd * s * (1.22 - k * 0.035), -s * (0.1 + flap) + s * k * 0.055); c.lineTo(sd * s * (1.05 - k * 0.035), -s * (0.06 + flap * 0.9) + s * k * 0.06); }
        c.quadraticCurveTo(sd * s * 0.5, s * (0.16 - flap * 0.3), sd * s * 0.06, s * 0.1); c.closePath(); c.fill();
      }
      c.beginPath(); c.ellipse(0, 0, s * 0.08, s * 0.2, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(0, -s * 0.2, s * 0.07, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(-s * 0.06, s * 0.16); c.lineTo(-s * 0.15, s * 0.38); c.lineTo(s * 0.15, s * 0.38); c.lineTo(s * 0.06, s * 0.16); c.fill();
      c.restore();
    },
  },
};
export default thema;
