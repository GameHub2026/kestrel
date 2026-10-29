// Hotelflur (Film, Stimmung wie The Shining): langer Flur in Zentralperspektive, Teppich mit verschachteltem
// Sechseckmuster, Türen und Wandleuchten links und rechts. Ein Junge auf dem Dreirad fährt der Maus nach.
import { type Thema, leinwand, verlauf, rgba, glut, klemme } from '../motor';

const thema: Thema = {
  seed: 1980,
  paletten: {
    dunkel: {
      wand: '#3b2a1c', wand2: '#22180f', decke: '#1c140d', tuer: '#2a160c', rahmen: '#5a3a22', licht: '#ffbf6e',
      teppich: '#5e1f12', muster: '#c4581f', muster2: '#2b0f08', ende: '#0c0806', pulli: '#3d5ea8', haut: '#e8b894', haar: '#3a2414', rad: '#a11d1d', dunkel: 0.55,
    },
    hell: {
      wand: '#d8c49c', wand2: '#bfa77a', decke: '#e9dcc0', tuer: '#7a4a2a', rahmen: '#a87a4e', licht: '#fff1c8',
      teppich: '#7d2a16', muster: '#e0782e', muster2: '#3e170c', ende: '#4a3524', pulli: '#4568b8', haut: '#f0c4a0', haar: '#4a2e18', rad: '#c22a22', dunkel: 0.12,
    },
  },

  bauen(z) {
    const { W, h, dpr, pal } = z;
    // Fluchtpunkt etwas rechts der Mitte, Flur sichtbar in der rechten Bildhälfte
    const vx = W * 0.64, vy = h * 0.46, halbB = W * 0.42, bodenH = h - vy, deckeH = vy + h * 0.08;
    const sFern = 0.1;
    const P = (wx: number, wy: number, s: number) => [vx + wx * s, vy + wy * s];

    // Teppich-Muster (Sechsecke, ineinander) als Kachel
    const tw = 240, th = 208;
    const [tex, tc] = leinwand(tw, th, 1);
    tc.fillStyle = pal.teppich; tc.fillRect(0, 0, tw, th);
    const sechseck = (x: number, y: number, r: number) => { tc.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k + Math.PI / 6; tc.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } tc.closePath(); };
    const R = 30, dx = R * Math.sqrt(3), dy = R * 1.5;
    for (let row = -1; row < th / dy + 2; row++) for (let col = -1; col < tw / dx + 2; col++) {
      const x = col * dx + (row % 2 ? dx / 2 : 0), y = row * dy;
      tc.lineWidth = 6; tc.strokeStyle = pal.muster; sechseck(x, y, R - 3); tc.stroke();
      tc.fillStyle = pal.muster2; sechseck(x, y, R * 0.45); tc.fill();
      tc.lineWidth = 3; tc.strokeStyle = pal.muster; sechseck(x, y, R * 0.45); tc.stroke();
    }

    const [f, c] = leinwand(W, h, dpr);
    // Decke, Wände
    const [fl, fy] = P(-halbB, -deckeH, sFern), [fr] = P(halbB, -deckeH, sFern), [, fb] = P(0, bodenH, sFern);
    c.fillStyle = verlauf(c, 0, 0, 0, vy, [[0, pal.decke], [1, pal.wand2]]);
    c.beginPath(); c.moveTo(vx - halbB, vy - deckeH); c.lineTo(vx + halbB, vy - deckeH); c.lineTo(fr, fy); c.lineTo(fl, fy); c.fill();
    for (const seite of [-1, 1]) {
      const nx = vx + seite * halbB, fx = vx + seite * halbB * sFern;
      c.fillStyle = verlauf(c, nx, 0, fx, 0, [[0, pal.wand], [1, pal.wand2]]);
      c.beginPath(); c.moveTo(nx, vy - deckeH); c.lineTo(fx, fy); c.lineTo(fx, fb); c.lineTo(nx, h); c.fill();
      // Türen und Wandleuchten in festen Abständen (Tiefe z, s = 1/z)
      for (let zt = 1.6; zt < 1 / sFern; zt *= 1.55) {
        const s1 = 1 / zt, s2 = 1 / (zt * 1.16);
        const x1 = vx + seite * halbB * s1, x2 = vx + seite * halbB * s2;
        const top1 = vy + (bodenH - h * 0.5) * s1 - h * 0.26 * s1, top2 = vy + (bodenH - h * 0.5) * s2 - h * 0.26 * s2;
        c.fillStyle = pal.rahmen; c.beginPath(); c.moveTo(x1, top1 - 4 * s1); c.lineTo(x2, top2 - 4 * s2); c.lineTo(x2, vy + bodenH * s2); c.lineTo(x1, vy + bodenH * s1); c.fill();
        const in1 = 0.05, xi1 = x1 + (x2 - x1) * in1, xi2 = x2 - (x2 - x1) * in1;
        c.fillStyle = pal.tuer; c.beginPath(); c.moveTo(xi1, top1 + 2 * s1); c.lineTo(xi2, top2 + 2 * s2); c.lineTo(xi2, vy + bodenH * s2); c.lineTo(xi1, vy + bodenH * s1); c.fill();
        // Leuchte zwischen den Türen
        const sl = 1 / (zt * 1.3), lx = vx + seite * halbB * sl, ly = vy - h * 0.12 * sl;
        glut(c, lx, ly, h * 0.22 * sl, pal.licht, 0.55); c.fillStyle = pal.licht; c.fillRect(lx - 3 * sl, ly - 6 * sl, 6 * sl + 1, 10 * sl + 1);
        (z.daten.leuchten ||= []).push({ x: lx, y: ly, r: h * 0.22 * sl });
      }
    }
    // Ende des Flurs: Wand mit dunkler Öffnung
    c.fillStyle = pal.wand2; c.fillRect(fl, fy, fr - fl, fb - fy);
    c.fillStyle = pal.ende; const ew = (fr - fl) * 0.36; c.fillRect(vx - ew / 2, fy + (fb - fy) * 0.25, ew, (fb - fy) * 0.75);

    // Boden: Teppich zeilenweise perspektivisch verzerrt
    for (let y = Math.ceil(fb); y < h; y += 1) {
      const s = (y - vy) / bodenH; const tiefe = 1 / s;
      const xl = vx - halbB * s, xr = vx + halbB * s;
      const v = ((tiefe * 120) % th + th) % th;
      c.drawImage(tex, 0, Math.floor(v), tw, 1, xl, y, xr - xl, 1.5);
    }
    // Abdunkeln in der Tiefe und von den Rändern
    c.fillStyle = verlauf(c, 0, fy, 0, h, [[0, `rgba(0,0,0,${0.55 * pal.dunkel + 0.25})`], [0.35, `rgba(0,0,0,${0.25 * pal.dunkel})`], [1, 'rgba(0,0,0,0)']]);
    c.fillRect(0, 0, W, h);
    z.himmel = leinwand(W, h, dpr)[0];
    z.ebenen.push({ bild: f, tiefe: 0.18 });

    // Vordergrund: Türrahmen am rechten Bildrand
    const [f2, c2] = leinwand(W, h, dpr);
    c2.fillStyle = pal.rahmen; c2.fillRect(W * 0.965, 0, W * 0.05, h);
    c2.fillStyle = 'rgba(0,0,0,0.35)'; c2.fillRect(W * 0.965, 0, 3, h);
    z.ebenen.push({ bild: f2, tiefe: 0.9, vorne: true });
    z.daten.flur = { vx, vy, halbB, bodenH };
  },

  davor(c, z, t) {
    // Leuchten flackern ganz leicht
    for (const [i, l] of (z.daten.leuchten || []).entries()) {
      const a = 0.06 + 0.06 * Math.sin(t * 7 + i * 2.1) * Math.sin(t * 3.1 + i);
      if (a > 0.02) glut(c, l.x - z.rand - z.px * z.rand * 0.16, l.y, l.r * 1.3, z.pal.licht, a);
    }
  },

  folger: {
    n: 1, tiefen: [1, 1], tempo: 0.45, streuung: 0,
    // fährt auf dem Teppich; die Maus bestimmt Seite und Tiefe (höher im Bild = weiter hinten im Flur)
    ruhe: (z, t) => { const F = z.daten.flur, s = 0.32 + 0.14 * Math.sin(t * 0.15); return { x: F.vx - z.rand + F.halbB * s * 0.55 * Math.sin(t * 0.23), y: F.vy + F.bodenH * s }; },
    ziel: (z, x, y) => {
      const F = z.daten.flur, s = klemme((y - F.vy) / F.bodenH, 0.22, 0.48), mx = F.vx - z.rand;
      return { x: klemme(x, mx - F.halbB * s * 0.75, mx + F.halbB * s * 0.75), y: F.vy + F.bodenH * s };
    },
    zeichne(c, f, z, t) {
      const F = z.daten.flur, tiefe = klemme((f.y - F.vy) / F.bodenH, 0.15, 0.6), s = z.h * 0.42 * tiefe, r = f.richtung, p = z.pal;
      const weg = f.x / (s * 0.22); // Radumdrehung aus der gefahrenen Strecke
      c.save(); c.translate(f.x, f.y);
      c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(0, 2, s * 0.55, s * 0.05, 0, 0, Math.PI * 2); c.fill();
      c.scale(r, 1);
      const vorn = { x: s * 0.34, y: -s * 0.2, r: s * 0.2 }, hinten = { x: -s * 0.34, y: -s * 0.1, r: s * 0.1 };
      // Räder mit Speichen
      for (const rad of [hinten, vorn]) {
        c.fillStyle = '#141414'; c.beginPath(); c.arc(rad.x, rad.y, rad.r, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#d8d8d8'; c.beginPath(); c.arc(rad.x, rad.y, rad.r * 0.72, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#8a8a8a'; c.lineWidth = 1;
        for (let k = 0; k < 4; k++) { const a = weg * (s * 0.2 / rad.r) + (k * Math.PI) / 4; c.beginPath(); c.moveTo(rad.x - Math.cos(a) * rad.r * 0.7, rad.y - Math.sin(a) * rad.r * 0.7); c.lineTo(rad.x + Math.cos(a) * rad.r * 0.7, rad.y + Math.sin(a) * rad.r * 0.7); c.stroke(); }
      }
      // Rahmen
      c.strokeStyle = p.rad; c.lineWidth = s * 0.045; c.lineCap = 'round';
      c.beginPath(); c.moveTo(hinten.x, hinten.y); c.lineTo(-s * 0.1, -s * 0.3); c.lineTo(vorn.x - s * 0.04, -s * 0.5); c.lineTo(vorn.x, vorn.y); c.stroke();
      c.beginPath(); c.moveTo(vorn.x - s * 0.04, -s * 0.5); c.lineTo(vorn.x - s * 0.12, -s * 0.56); c.stroke();
      // Pedal dreht mit dem Vorderrad
      const a = weg, pdx = Math.cos(a) * vorn.r * 0.55, pdy = Math.sin(a) * vorn.r * 0.55;
      // Junge: Beine, Rumpf, Arm, Kopf
      const huefte = { x: -s * 0.12, y: -s * 0.36 };
      const bein = (px: number, py: number, farbe: string) => {
        const kx = (huefte.x + px) / 2 + s * 0.1, ky = (huefte.y + py) / 2 - s * 0.06;
        c.strokeStyle = farbe; c.lineWidth = s * 0.07; c.beginPath(); c.moveTo(huefte.x, huefte.y); c.lineTo(kx, ky); c.lineTo(px, py); c.stroke();
      };
      bein(vorn.x - pdx, vorn.y - pdy, '#2a2a33');
      c.fillStyle = '#1a1a1a'; c.fillRect(-s * 0.2, -s * 0.36, s * 0.16, s * 0.04);
      c.fillStyle = p.pulli; c.beginPath(); c.moveTo(huefte.x - s * 0.08, huefte.y); c.lineTo(huefte.x - s * 0.06, -s * 0.72); c.quadraticCurveTo(huefte.x + s * 0.04, -s * 0.78, huefte.x + s * 0.12, -s * 0.7); c.lineTo(huefte.x + s * 0.1, huefte.y); c.fill();
      c.strokeStyle = p.pulli; c.lineWidth = s * 0.06; c.beginPath(); c.moveTo(huefte.x + s * 0.06, -s * 0.66); c.lineTo(vorn.x - s * 0.13, -s * 0.56); c.stroke();
      bein(vorn.x + pdx, vorn.y + pdy, '#33333e');
      c.fillStyle = p.haut; c.beginPath(); c.arc(huefte.x + s * 0.03, -s * 0.86, s * 0.1, 0, Math.PI * 2); c.fill();
      c.fillStyle = p.haar; c.beginPath(); c.arc(huefte.x + s * 0.01, -s * 0.9, s * 0.1, Math.PI * 0.9, Math.PI * 2.05); c.fill();
      c.restore();
    },
  },
};
export default thema;
