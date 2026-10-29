// Neonstadt im Regen (Film, Stimmung wie Blade Runner): Wolkenkratzer in drei Tiefen, Neonschilder,
// Suchscheinwerfer, ein Werbeluftschiff, Verkehrsbahnen. Gleiter folgen der Maus.
import { type Thema, type Welt, leinwand, verlauf, rgba, glut, klemme } from '../motor';

const thema: Thema = {
  seed: 2049,
  paletten: {
    dunkel: {
      himmel: [[0, '#03040b'], [0.42, '#0c0a20'], [0.74, '#2a0e3a'], [1, '#5a1a4a']], dunst: '#ff3d9a', dunst2: '#2fd6ff',
      fern: '#150f2b', mitte: '#0b0918', nah: '#040308', fenster: ['#ffcf7a', '#8fe9ff', '#ff9ad5', '#ffe9b8'],
      neon: ['#ff2bd6', '#00e5ff', '#ff9a1f', '#9dff5a', '#ff3355', '#b16bff'], regen: true, glanz: 1, koerper: '#0b0c14', glas: 'rgba(140,200,255,0.45)', stern: 0.5,
    },
    hell: {
      himmel: [[0, '#f5dfba'], [0.5, '#ebbb84'], [1, '#d08a50']], dunst: '#ffae66', dunst2: '#ffd9a8',
      fern: '#d29a6c', mitte: '#a96b45', nah: '#5a3523', fenster: ['#fff0c8', '#ffe0a0'],
      neon: ['#ff4f9e', '#1fc8d8', '#ff7a12', '#e14b3b'], regen: false, glanz: 0.5, koerper: '#3b2519', glas: 'rgba(255,240,210,0.5)', stern: 0,
    },
  },

  bauen(z) {
    const { W, h, dpr, pal, r } = z;
    // Himmel mit Horizontglühen
    const [hc, c0] = leinwand(W, h, dpr); z.himmel = hc;
    c0.fillStyle = verlauf(c0, 0, 0, 0, h, pal.himmel); c0.fillRect(0, 0, W, h);
    for (let i = 0; i < 120 * pal.stern; i++) { c0.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.35})`; c0.fillRect(r() * W, r() * h * 0.45, 1, 1); }
    glut(c0, W * 0.55, h * 0.95, W * 0.6, pal.dunst, 0.32); glut(c0, W * 0.2, h * 0.9, W * 0.3, pal.dunst2, 0.12);

    const schilder: any[] = [];
    const turm = (c: CanvasRenderingContext2D, x: number, bw: number, top: number, farbe: string, fensterDichte: number, fs: number, ebene: number, neon: number) => {
      c.fillStyle = farbe; c.fillRect(x, top, bw, h - top + 4);
      // Dachformen: Stufe, Antenne, Spitze
      const art = r();
      if (art < 0.3) { c.fillRect(x + bw * 0.2, top - bw * 0.25, bw * 0.6, bw * 0.25); c.fillRect(x + bw * 0.45, top - bw * 0.25 - h * 0.05, 1.2, h * 0.05); }
      else if (art < 0.5) { c.beginPath(); c.moveTo(x, top); c.lineTo(x + bw / 2, top - bw * 0.7); c.lineTo(x + bw, top); c.fill(); }
      else if (art < 0.7) c.fillRect(x + bw * 0.7, top - h * 0.04, 1.5, h * 0.04);
      // Fenster
      for (let y = top + fs * 2; y < h; y += fs * 2.2) for (let xx = x + fs; xx < x + bw - fs; xx += fs * 1.8) {
        if (r() < fensterDichte) { c.fillStyle = rgba(pal.fenster[(r() * pal.fenster.length) | 0], 0.25 + r() * 0.55); c.fillRect(xx, y, fs * 0.8, fs); }
      }
      // Neonschild
      if (r() < neon) {
        const sw = Math.max(5, bw * (0.18 + r() * 0.2)), sh = sw * (3 + r() * 4), sx = x + (r() < 0.5 ? -sw * 0.3 : bw - sw * 0.7), sy = top + h * 0.05 + r() * h * 0.2;
        const farbe2 = pal.neon[(r() * pal.neon.length) | 0];
        c.save(); c.shadowColor = farbe2; c.shadowBlur = 18 * pal.glanz; c.fillStyle = rgba(farbe2, 0.85); c.fillRect(sx, sy, sw, sh); c.restore();
        // abstrakte Zeichen als dunkle Balken
        c.fillStyle = rgba('#000000', 0.45);
        for (let k = sy + sw * 0.4; k < sy + sh - sw * 0.4; k += sw * 0.9) c.fillRect(sx + sw * 0.25, k, sw * 0.5, sw * 0.45);
        schilder.push({ ebene, x: sx, y: sy, w: sw, h: sh, farbe: farbe2, an: 1 });
      }
    };

    // Ferne Türme
    const [f1, c1] = leinwand(W, h, dpr);
    for (let x = -10; x < W; x += 6 + r() * 16) { const bw = 8 + r() * 22; turm(c1, x, bw, h * (0.32 + r() * 0.36), pal.fern, 0.12, 1.2, 0, 0.03); }
    c1.fillStyle = verlauf(c1, 0, h * 0.5, 0, h, [[0, rgba(pal.dunst, 0)], [1, rgba(pal.dunst, 0.3)]]); c1.fillRect(0, h * 0.5, W, h * 0.5);
    z.ebenen.push({ bild: f1, tiefe: 0.15 });

    // Mittlere Türme mit Schildern
    const [f2, c2] = leinwand(W, h, dpr);
    for (let x = -20; x < W; x += 30 + r() * 70) { const bw = 28 + r() * 60; turm(c2, x, bw, h * (0.42 + r() * 0.3), pal.mitte, 0.22, 2, 1, 0.45); }
    c2.fillStyle = verlauf(c2, 0, h * 0.7, 0, h, [[0, rgba(pal.dunst, 0)], [1, rgba(pal.dunst, 0.18)]]); c2.fillRect(0, h * 0.7, W, h * 0.3);
    z.ebenen.push({ bild: f2, tiefe: 0.42 });

    // Vordergrund: Dachkante mit Geländer, Kästen, Antennen; große Blöcke an den Rändern
    const [f3, c3] = leinwand(W, h, dpr);
    turm(c3, W * 0.88, W * 0.14, h * 0.5, pal.nah, 0.08, 3, 2, 1);
    turm(c3, -W * 0.02, W * 0.08, h * 0.62, pal.nah, 0.06, 3, 2, 1);
    const dach = h * 0.86;
    c3.fillStyle = pal.nah; c3.fillRect(0, dach, W, h - dach);
    for (let x = 0; x < W; x += 14) c3.fillRect(x, dach - 12, 1.5, 12);
    c3.fillRect(0, dach - 13, W, 1.5);
    for (let i = 0; i < 9; i++) { const x = r() * W, bw = 20 + r() * 50, bh = 10 + r() * 26; c3.fillRect(x, dach - bh, bw, bh); if (r() < 0.5) c3.fillRect(x + bw * 0.3, dach - bh - h * 0.08, 1.5, h * 0.08); }
    z.ebenen.push({ bild: f3, tiefe: 0.85, vorne: true });

    z.daten.schilder = schilder;
    z.daten.verkehr = Array.from({ length: 26 }, () => ({ x: r() * W, bahn: (r() * 3) | 0, v: (r() < 0.5 ? -1 : 1) * (30 + r() * 70) }));
    z.daten.regen = Array.from({ length: 170 }, () => ({ x: r() * W, y: r() * h, v: 600 + r() * 500, l: 8 + r() * 14 }));
    z.daten.schiff = { x: W * 0.2 };
  },

  hinten(c, z, t) {
    const { w, h, pal } = z;
    // Suchscheinwerfer
    c.save(); c.globalCompositeOperation = z.modus === 'dunkel' ? 'lighter' : 'screen';
    for (const [bx, ph] of [[0.32, 0], [0.74, 2.1]]) {
      const a = -Math.PI / 2 + Math.sin(t * 0.25 + ph) * 0.45, l = h * 1.2, x = w * bx, y = h;
      c.fillStyle = verlauf(c, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, [[0, rgba('#ffffff', 0.1 * pal.glanz)], [1, rgba('#ffffff', 0)]]);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a - 0.05) * l, y + Math.sin(a - 0.05) * l); c.lineTo(x + Math.cos(a + 0.05) * l, y + Math.sin(a + 0.05) * l); c.fill();
    }
    c.restore();
    // Werbeluftschiff zieht langsam durch
    const s = z.daten.schiff; s.x += 0.25; if (s.x > z.W + 200) s.x = -260;
    const sx = s.x - z.rand, sy = h * 0.11 + Math.sin(t * 0.4) * 4, sl = Math.max(110, w * 0.12);
    c.fillStyle = z.modus === 'dunkel' ? '#0d0b18' : '#7a4a30';
    c.beginPath(); c.ellipse(sx, sy, sl / 2, sl * 0.13, 0, 0, Math.PI * 2); c.fill();
    const farbe = pal.neon[Math.floor(t / 3) % pal.neon.length];
    c.save(); c.shadowColor = farbe; c.shadowBlur = 16 * pal.glanz; c.fillStyle = rgba(farbe, 0.75); c.fillRect(sx - sl * 0.28, sy - sl * 0.06, sl * 0.56, sl * 0.12); c.restore();
    for (let i = 0; i < 6; i++) { c.fillStyle = (Math.floor(t * 2) + i) % 2 ? '#ff4040' : '#ffffff'; c.fillRect(sx - sl * 0.4 + i * sl * 0.16, sy + sl * 0.1, 1.5, 1.5); }
  },

  nachEbene(c, z, t, dt, i) {
    const { h, pal } = z;
    if (i === 0) {
      // Verkehrsbahnen: kleine Lichterpaare
      for (const v of z.daten.verkehr) {
        v.x += v.v * dt; if (v.x > z.W) v.x = 0; if (v.x < 0) v.x = z.W;
        const y = h * (0.3 + v.bahn * 0.11), x = v.x - z.rand - z.px * z.rand * 0.3;
        c.fillStyle = v.v > 0 ? rgba('#ff5050', 0.9) : rgba('#fff4d6', 0.95); c.fillRect(x, y, 2, 1.2); c.fillRect(x + 4, y, 2, 1.2);
      }
    }
    if (i === 1) {
      // Neon flackert ab und zu aus
      for (const s of z.daten.schilder) {
        if (s.ebene !== 1) continue;
        if (Math.random() < 0.002) s.an = 0; else if (s.an === 0 && Math.random() < 0.08) s.an = 1;
        if (!s.an) { c.fillStyle = rgba(pal.mitte, 0.75); c.fillRect(s.x - z.rand - z.px * z.rand * 0.38, s.y - z.py * 6 * 0.42, s.w, s.h); }
      }
    }
  },

  davor(c, z, t, dt) {
    if (!z.pal.regen) return;
    c.strokeStyle = 'rgba(170,200,255,0.22)'; c.lineWidth = 1; c.beginPath();
    for (const d of z.daten.regen) {
      d.y += d.v * dt; d.x -= d.v * dt * 0.12; if (d.y > z.h) { d.y = -20; d.x = Math.random() * z.W; }
      c.moveTo(d.x - z.rand, d.y); c.lineTo(d.x - z.rand - d.l * 0.12, d.y + d.l);
    }
    c.stroke();
  },

  folger: {
    n: 5, tiefen: [0.3, 1], tempo: 1, streuung: 90, spur: 14,
    zeichne(c, f, z, t) {
      const s = (9 + f.tiefe * 13) * f.groesse, richtung = f.richtung, neig = klemme(f.vy * 0.0016, -0.35, 0.35) * richtung;
      const dunkel = z.modus === 'dunkel';
      // Schubspur
      if (f.spur.length > 2) {
        c.save(); c.globalCompositeOperation = dunkel ? 'lighter' : 'source-over';
        for (let k = 1; k < f.spur.length; k++) { const a = k / f.spur.length; c.strokeStyle = rgba(dunkel ? '#59d8ff' : '#ffffff', a * 0.25 * f.tiefe); c.lineWidth = s * 0.18 * a; c.beginPath(); c.moveTo(f.spur[k - 1].x - richtung * s, f.spur[k - 1].y); c.lineTo(f.spur[k].x - richtung * s, f.spur[k].y); c.stroke(); }
        c.restore();
      }
      c.save(); c.translate(f.x, f.y); c.rotate(neig); c.scale(richtung, 1);
      // Scheinwerferkegel
      if (dunkel) {
        c.save(); c.globalCompositeOperation = 'lighter';
        c.fillStyle = verlauf(c, s, 0, s * 7, 0, [[0, 'rgba(255,240,210,0.28)'], [1, 'rgba(255,240,210,0)']]);
        c.beginPath(); c.moveTo(s * 1.05, s * 0.05); c.lineTo(s * 7, -s * 0.6); c.lineTo(s * 7, s * 1.6); c.closePath(); c.fill(); c.restore();
      }
      // Rumpf: flacher Keil
      c.fillStyle = z.pal.koerper;
      c.beginPath(); c.moveTo(-s, s * 0.12); c.lineTo(-s * 0.75, -s * 0.3); c.lineTo(-s * 0.1, -s * 0.42); c.lineTo(s * 0.55, -s * 0.32); c.lineTo(s * 1.12, s * 0.02); c.lineTo(s * 1.0, s * 0.26); c.lineTo(-s * 0.9, s * 0.32); c.closePath(); c.fill();
      c.fillStyle = z.pal.glas; c.beginPath(); c.moveTo(-s * 0.05, -s * 0.38); c.lineTo(s * 0.5, -s * 0.28); c.lineTo(s * 0.75, -s * 0.08); c.lineTo(-s * 0.05, -s * 0.12); c.closePath(); c.fill();
      // Lichter: Heck rot, Dach blinkt blau/rot, Unterseite schimmert
      const takt = Math.floor((t + f.phase) * 3) % 2;
      glut(c, -s, s * 0.05, s * 0.5, '#ff2a2a', 0.9);
      glut(c, -s * 0.25, -s * 0.48, s * 0.6, takt ? '#3a8bff' : '#ff3b3b', dunkel ? 0.95 : 0.7);
      if (dunkel) glut(c, 0, s * 0.45, s * 1.1, '#2fd6ff', 0.18);
      c.restore();
    },
  },
};
export default thema;
