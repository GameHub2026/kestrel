// Echtzeit-3D (three.js): Vulkanebene im Stil von Herr der Ringe. Eigene Modelle aus Code, keine Film-Assets.
// Lavaadern im Gelände, ein Vulkan mit Lavaströmen und Rauchsäule, ein dunkler Turm mit zwei Hörnern und einem
// flammenden Auge. Das Auge folgt der Maus: Blickkegel und Lichtkegel wandern über die Ebene.
// Dazu Wolkenhimmel, Glut, Asche, kreisende Flugwesen und Bloom. Hell = aschiger Tag, Dunkel = Nacht.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// ---------- Rauschen ----------
const hash = (x: number, y: number) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function rausch(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x: number, y: number, o = 5) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * rausch(x * f, y * f); f *= 2.03; a *= 0.5; } return s; };
const grat = (x: number, y: number, o = 5) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { const n = 1 - Math.abs(rausch(x * f, y * f) * 2 - 1); s += a * n * n; f *= 2.1; a *= 0.5; } return s; };
const glatt = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ---------- Landschaft ----------
const VULKAN = { x: 2, z: -205, r: 85, h: 66 };
const TURM = { x: 96, z: -132 };
function hoehe(x: number, z: number) {
  let y = (fbm(x * 0.011 + 3, z * 0.011) - 0.45) * 13 + grat(x * 0.028 + 50, z * 0.028) ** 2 * 7;
  // Bergkette im Hintergrund
  y += glatt(-150, -235, z) * grat(x * 0.016 + 9, z * 0.02) * 70;
  // Vulkan mit Krater
  const dv = Math.hypot(x - VULKAN.x, z - VULKAN.z);
  const kegel = Math.max(0, 1 - dv / VULKAN.r);
  y += VULKAN.h * Math.pow(kegel, 1.35) * (0.9 + 0.2 * fbm(Math.atan2(z - VULKAN.z, x - VULKAN.x) * 3, dv * 0.05));
  if (dv < 9) y -= (9 - dv) * 1.4;
  // Felssporn unter dem Turm
  const dt = Math.hypot(x - TURM.x, z - TURM.z);
  y += Math.max(0, 1 - dt / 34) ** 1.5 * 16;
  return y;
}
// Glut 0..1: Lavaadern (Höhenlinien eines Rauschfelds), Ströme am Vulkan, Krater
function glut(x: number, z: number) {
  const f = fbm(x * 0.017 + 11, z * 0.017 + 4, 4);
  let g = glatt(0.034, 0.004, Math.abs(f - 0.5)) * glatt(-150, -60, z);
  const dv = Math.hypot(x - VULKAN.x, z - VULKAN.z);
  if (dv < VULKAN.r * 0.85) { const w = Math.atan2(z - VULKAN.z, x - VULKAN.x); g = Math.max(g, glatt(0.93, 0.995, Math.sin(w * 5 + fbm(dv * 0.04, w) * 5)) * glatt(VULKAN.r * 0.85, 12, dv)); }
  if (dv < 11) g = 1;
  return g;
}

type Pal = Record<string, number>;
const PAL: Record<'hell' | 'dunkel', Pal> = {
  dunkel: { horizont: 0xa8341a, mitte: 0x2c0c08, zenit: 0x040203, wolke: 0xff5a1f, nebel: 0x1c0907, dichte: 0.0058, fels: 0x221a17, hemiO: 0x6a2412, hemiU: 0x050302, hemi: 0.9, rand: 0x7d8fb8, randI: 0.6, bloom: 0.85, schwelle: 0.6, belicht: 1.0, rauch: 0x1e1816, asche: 0x8a807a, lava: 6.0 },
  hell: { horizont: 0xe2a27a, mitte: 0xb09080, zenit: 0x77706c, wolke: 0xffa868, nebel: 0xb9998a, dichte: 0.0031, fels: 0x4a3c34, hemiO: 0xe6d2c4, hemiU: 0x3a2c26, hemi: 2.4, rand: 0xfff2e2, randI: 1.6, bloom: 0.55, schwelle: 0.85, belicht: 1.05, rauch: 0x5e5550, asche: 0x5a524e, lava: 3.5 },
};

const GLSL_RAUSCHEN = `
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
float fbm2(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 6; i++){ s += a*n2(p); p *= 2.03; a *= .5; } return s; }`;

export function starte(el: HTMLElement): boolean {
  const canvas = el.querySelector<HTMLCanvasElement>('.sz-hinten')!;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); }
  catch { return false; }
  const istDunkel = () => { const t = document.documentElement.getAttribute('data-theme'); return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
  let pal = PAL[istDunkel() ? 'dunkel' : 'hell'];
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = pal.belicht;

  const szene = new THREE.Scene();
  szene.fog = new THREE.FogExp2(pal.nebel, pal.dichte);
  const kamera = new THREE.PerspectiveCamera(38, 2.5, 0.5, 1500);
  const blickZiel = new THREE.Vector3(30, 44, -120);

  // ---------- Himmel ----------
  const himmelU = { uHorizont: { value: new THREE.Color(pal.horizont) }, uMitte: { value: new THREE.Color(pal.mitte) }, uZenit: { value: new THREE.Color(pal.zenit) }, uWolke: { value: new THREE.Color(pal.wolke) }, uZeit: { value: 0 } };
  const himmel = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: himmelU,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.); gl_Position = p.xyww; }`,
    fragmentShader: `uniform vec3 uHorizont, uMitte, uZenit, uWolke; uniform float uZeit; varying vec3 vDir; ${GLSL_RAUSCHEN}
      void main(){
        vec3 d = normalize(vDir); float h = d.y;
        vec3 col = mix(uHorizont, uMitte, smoothstep(0., .16, h)); col = mix(col, uZenit, smoothstep(.14, .55, h));
        vec2 uv = d.xz / max(h + .06, .05) * .4;
        float c = fbm2(uv * 1.4 + vec2(uZeit * .010, uZeit * .004)) * .75 + fbm2(uv * 3.1 - vec2(uZeit * .018, 0.)) * .45;
        float w = smoothstep(.5, .95, c) * smoothstep(-.03, .1, h);
        vec3 wf = mix(uZenit * 1.6, uWolke, smoothstep(.45, .0, h) * .9 + .08);
        col = mix(col, wf, w * .9);
        col += uWolke * .35 * smoothstep(.2, -.02, h) * smoothstep(-.1, .02, h);
        gl_FragColor = vec4(col, 1.);
      }`,
  }));
  himmel.renderOrder = -1; szene.add(himmel);

  // ---------- Gelände ----------
  const N = 280, GROESSE = 520;
  const gGeo = new THREE.PlaneGeometry(GROESSE, GROESSE, N, N); gGeo.rotateX(-Math.PI / 2);
  const gp = gGeo.attributes.position as THREE.BufferAttribute;
  const farben = new Float32Array(gp.count * 3), glutA = new Float32Array(gp.count);
  const basis = new THREE.Color();
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i) - 120; gp.setZ(i, z);
    const g = glut(x, z); glutA[i] = g;
    const y = hoehe(x, z) - g * 1.6; gp.setY(i, y);
    const n = 0.65 + fbm(x * 0.08, z * 0.08, 3) * 0.7;
    basis.setRGB(n, n * 0.92, n * 0.86);
    basis.lerp(new THREE.Color(0.9, 0.35, 0.18), Math.min(1, g * 1.4) * 0.7);
    farben[i * 3] = basis.r; farben[i * 3 + 1] = basis.g; farben[i * 3 + 2] = basis.b;
  }
  gGeo.setAttribute('color', new THREE.BufferAttribute(farben, 3));
  gGeo.setAttribute('aGlut', new THREE.BufferAttribute(glutA, 1));
  gGeo.computeVertexNormals();
  const glutU = { uGlutFarbe: { value: new THREE.Color(1, 0.32, 0.06).multiplyScalar(pal.lava) }, uZeit: { value: 0 } };
  const gMat = new THREE.MeshStandardMaterial({ color: pal.fels, roughness: 0.94, metalness: 0.05, vertexColors: true });
  gMat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, glutU);
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute float aGlut; varying float vGlut; varying vec3 vWelt;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlut = aGlut; vWelt = (modelMatrix * vec4(position, 1.)).xyz;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>\nvarying float vGlut; varying vec3 vWelt; uniform vec3 uGlutFarbe; uniform float uZeit; ${GLSL_RAUSCHEN}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float fluss = .65 + .35 * fbm2(vWelt.xz * .25 + vec2(uZeit * .35, uZeit * .2));
        totalEmissiveRadiance += uGlutFarbe * vGlut * vGlut * fluss;`);
  };
  const gelaende = new THREE.Mesh(gGeo, gMat); szene.add(gelaende);

  // ---------- Turm ----------
  const turm = new THREE.Group();
  const ty = hoehe(TURM.x, TURM.z) - 2; turm.position.set(TURM.x, ty, TURM.z); turm.scale.set(1.5, 1, 1.5); szene.add(turm);
  const tMat = new THREE.MeshStandardMaterial({ color: 0x0d0b0b, roughness: 0.55, metalness: 0.45, flatShading: true });
  const stab = (a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, seiten = 6) => {
    const l = a.distanceTo(b); const g = new THREE.CylinderGeometry(rb, ra, l, seiten); g.translate(0, l / 2, 0);
    const m = new THREE.Mesh(g, tMat); m.position.copy(a); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); turm.add(m); return m;
  };
  const H = 56, rUnten = 8.5, rOben = 3, rBei = (y: number) => rUnten + (rOben - rUnten) * (y / H);
  const schaft = new THREE.Mesh(new THREE.CylinderGeometry(rOben, rUnten, H, 8), tMat); schaft.position.y = H / 2; turm.add(schaft);
  for (const y of [8, 18, 28, 38, 47]) {
    const r = rBei(y);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(r + 1.6, r + 2.4, 2, 8), tMat); ring.position.y = y; turm.add(ring);
    for (let k = 0; k < 8; k++) { const w = (k / 8) * Math.PI * 2 + Math.PI / 8; const a = new THREE.Vector3(Math.cos(w) * (r + 1.8), y + 0.5, Math.sin(w) * (r + 1.8)); stab(a, a.clone().add(new THREE.Vector3(Math.cos(w) * 2.4, 4.5, Math.sin(w) * 2.4)), 0.7, 0.02, 4); }
  }
  for (let k = 0; k < 8; k++) {
    const w = (k / 8) * Math.PI * 2, hb = 16 + (k % 3) * 7;
    const a = new THREE.Vector3(Math.cos(w) * 13, -2, Math.sin(w) * 13), b = new THREE.Vector3(Math.cos(w) * (rBei(hb) + 1), hb, Math.sin(w) * (rBei(hb) + 1));
    stab(a, b, 2.4, 1.2, 4); stab(b, b.clone().add(new THREE.Vector3(Math.cos(w) * 1.5, 7, Math.sin(w) * 1.5)), 1.2, 0.02, 4);
  }
  const krone = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 3.2, 3.4, 8), tMat); krone.position.y = H + 1; turm.add(krone);
  // zwei Hörner: geschwungen, verjüngt
  for (const sd of [-1, 1]) {
    const p0 = new THREE.Vector3(sd * 2.4, H + 2, 0), p1 = new THREE.Vector3(sd * 7.2, H + 10, 0.5), p2 = new THREE.Vector3(sd * 3.4, H + 21, 0);
    const kurve = new THREE.QuadraticBezierCurve3(p0, p1, p2); const pts = kurve.getPoints(10);
    for (let i = 0; i < pts.length - 1; i++) stab(pts[i], pts[i + 1], 1.4 * (1 - i / 10) + 0.12, 1.4 * (1 - (i + 1) / 10) + 0.08, 5);
  }
  // glühende Schießscharten
  const fensterMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.4, 0.1).multiplyScalar(3) });
  for (let k = 0; k < 14; k++) { const y = 6 + Math.random() * 44, w = Math.random() * Math.PI * 2, r = rBei(y) + 0.05; const f = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.2), fensterMat); f.position.set(Math.cos(w) * r, y, Math.sin(w) * r); f.lookAt(0, y, 0); turm.add(f); }

  // ---------- Das Auge ----------
  const augePos = new THREE.Vector3(TURM.x, ty + H + 11, TURM.z);
  const augeU = { uZeit: { value: 0 }, uPupille: { value: new THREE.Vector2() } };
  const auge = new THREE.Mesh(new THREE.PlaneGeometry(15, 8), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, uniforms: augeU,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float uZeit; uniform vec2 uPupille; varying vec2 vUv; ${GLSL_RAUSCHEN}
      void main(){
        vec2 p = vUv * 2. - 1.;
        float rand = pow(max(0., 1. - p.x * p.x), .7) * .66;
        float d = abs(p.y) / max(rand, 1e-3);
        float n = fbm2(vec2(atan(p.y, p.x) * 2.2, length(p) * 3. - uZeit * 2.2));
        float form = smoothstep(1.25 + n * .5, .45, d) * smoothstep(1.02, .82, abs(p.x));
        vec3 col = mix(vec3(.75, .06, .0), vec3(1., .36, .03), smoothstep(.1, .8, form));
        col = mix(col, vec3(1., .62, .16), smoothstep(.8, 1., form) * .6);
        // Iris: feine Flammenstreifen zur Mitte hin
        col *= .8 + .35 * fbm2(vec2(atan(p.y, p.x) * 6., length(p) * 8. - uZeit * 3.));
        vec2 q = p - uPupille * vec2(.3, .14);
        float spalt = .13 * max(0., 1. - pow(q.y / .56, 2.));
        float pup = smoothstep(spalt + .03, spalt * .35, abs(q.x)) * smoothstep(.62, .5, abs(q.y));
        col = mix(col, vec3(0.), pup * .96);
        gl_FragColor = vec4(col * .9, max(form, pup * form));
      }`,
  }));
  auge.position.copy(augePos); szene.add(auge);
  const korona = new THREE.Mesh(new THREE.PlaneGeometry(34, 24), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, uniforms: augeU,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float uZeit; varying vec2 vUv; ${GLSL_RAUSCHEN}
      void main(){ vec2 p = (vUv * 2. - 1.) * vec2(1., 1.3); float r = length(p);
        float n = fbm2(vec2(atan(p.y, p.x) * 3., r * 4. - uZeit * 1.6));
        float a = smoothstep(.95, .05, r + (n - .5) * .5) * .4;
        gl_FragColor = vec4(vec3(1., .3, .05) * a * 1.1, a); }`,
  }));
  korona.position.copy(augePos); szene.add(korona);
  const augeLicht = new THREE.PointLight(0xff6a1a, 1800, 70, 2); augeLicht.position.copy(augePos); szene.add(augeLicht);

  // Blickkegel (sichtbarer Strahl) und Lichtkegel auf dem Boden
  const strahlGeo = new THREE.CylinderGeometry(0.06, 1, 1, 32, 1, true); strahlGeo.translate(0, -0.5, 0);
  const strahl = new THREE.Mesh(strahlGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, uniforms: { uStaerke: { value: 1 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uStaerke; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ float rim = pow(abs(dot(normalize(vN), normalize(vV))), 2.2); float t = 1. - vUv.y;
        float a = rim * mix(.55, .16, t) * smoothstep(.02, .12, t) * uStaerke;
        gl_FragColor = vec4(vec3(1., .5, .16) * a * 1.6, a); }`,
  }));
  szene.add(strahl);
  const fleck = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `varying vec2 vUv; void main(){ float r = length(vUv * 2. - 1.); float a = smoothstep(1., .1, r) * .85; gl_FragColor = vec4(vec3(1., .58, .22) * a * 2.4, a); }`,
  }));
  fleck.rotation.x = -Math.PI / 2; szene.add(fleck);
  const spot = new THREE.SpotLight(0xffa050, 400000, 0, 0.07, 0.6, 2); spot.position.copy(augePos); szene.add(spot, spot.target);

  // ---------- Licht ----------
  const hemi = new THREE.HemisphereLight(pal.hemiO, pal.hemiU, pal.hemi); szene.add(hemi);
  const rand = new THREE.DirectionalLight(pal.rand, pal.randI); rand.position.set(-80, 60, -300); szene.add(rand);
  const kraterPos = new THREE.Vector3(VULKAN.x, hoehe(VULKAN.x + 10, VULKAN.z) + 4, VULKAN.z);
  const krater = new THREE.PointLight(0xff4a10, 30000, 260, 2); krater.position.copy(kraterPos).add(new THREE.Vector3(0, 8, 0)); szene.add(krater);
  const lavaLichter = [new THREE.Vector3(-30, 4, -70), new THREE.Vector3(30, 4, -45), new THREE.Vector3(-5, 4, -20)].map((p) => { const l = new THREE.PointLight(0xff5a1a, 1200, 70, 2); l.position.copy(p); szene.add(l); return l; });

  // ---------- Rauchsäule ----------
  const rauchTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const k = c.getContext('2d')!; const g = k.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); k.fillStyle = g; k.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const rauch = Array.from({ length: 36 }, (_, i) => {
    const m = new THREE.SpriteMaterial({ map: rauchTex, color: pal.rauch, transparent: true, depthWrite: false, opacity: 0.6 });
    const s = new THREE.Sprite(m); s.userData = { leben: i / 36, dreh: Math.random() * 6 }; szene.add(s); return s;
  });

  // ---------- Glut und Asche (im Shader bewegt) ----------
  const punkte = (anzahl: number, steigen: boolean) => {
    const g = new THREE.BufferGeometry(); const start = new Float32Array(anzahl * 3), tempo = new Float32Array(anzahl), phase = new Float32Array(anzahl);
    for (let i = 0; i < anzahl; i++) {
      const x = steigen ? (Math.random() < 0.35 ? VULKAN.x + (Math.random() - 0.5) * 40 : -140 + Math.random() * 280) : -120 + Math.random() * 240;
      const z = steigen ? (Math.random() < 0.35 ? VULKAN.z + (Math.random() - 0.5) * 40 : -180 + Math.random() * 190) : -160 + Math.random() * 200;
      start[i * 3] = x; start[i * 3 + 1] = steigen ? hoehe(x, z) : 0; start[i * 3 + 2] = z; tempo[i] = 0.02 + Math.random() * 0.05; phase[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(start, 3)); g.setAttribute('aTempo', new THREE.BufferAttribute(tempo, 1)); g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    const u = { uZeit: { value: 0 }, uDpr: { value: 1 }, uFarbe: { value: steigen ? new THREE.Color(1, 0.42, 0.1) : new THREE.Color(pal.asche) } };
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: steigen ? THREE.AdditiveBlending : THREE.NormalBlending, uniforms: u,
      vertexShader: `uniform float uZeit, uDpr; attribute float aTempo, aPhase; varying float vA;
        void main(){ float t = fract(uZeit * aTempo + aPhase); vec3 p = position;
          ${steigen ? 'p += vec3(sin(uZeit*.6+aPhase*9.)*3., t*55., cos(uZeit*.5+aPhase*7.)*3.); vA = (1.-t)*smoothstep(0.,.06,t);' : 'p += vec3(sin(uZeit*.3+aPhase*9.)*6. - t*20., 70. - t*75., cos(uZeit*.2+aPhase*5.)*6.); vA = smoothstep(0.,.1,t)*smoothstep(1.,.85,t)*.8;'}
          vec4 mv = modelViewMatrix * vec4(p, 1.); gl_PointSize = (${steigen ? '1.6 + 2.6' : '1.0 + 1.6'} * aPhase) * uDpr * (120. / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uFarbe; varying float vA; void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d) * vA; gl_FragColor = vec4(uFarbe * ${steigen ? 'a * 3.5' : '1.'}, a); }`,
    });
    const p = new THREE.Points(g, m); p.frustumCulled = false; szene.add(p); return u;
  };
  const glutU2 = punkte(innerWidth < 760 ? 500 : 1400, true);
  const ascheU = punkte(innerWidth < 760 ? 500 : 1300, false);

  // ---------- Flugwesen ----------
  const wesenMat = new THREE.MeshStandardMaterial({ color: 0x060505, roughness: 1, side: THREE.DoubleSide });
  const fluegelForm = new THREE.Shape(); [[0, 0], [1.6, 0.7], [4.4, 1.5], [7, 0.4], [5.6, -0.3], [4.8, 0.2], [3.9, -0.9], [3.1, -0.2], [2.1, -1.1], [1.2, -0.5], [0, -0.7]].forEach(([x, y], i) => (i ? fluegelForm.lineTo(x, y) : fluegelForm.moveTo(x, y)));
  const fluegelGeo = new THREE.ShapeGeometry(fluegelForm); fluegelGeo.rotateX(-Math.PI / 2);
  const wesen = Array.from({ length: 3 }, (_, i) => {
    const g = new THREE.Group();
    const koerper = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), wesenMat); koerper.scale.set(0.55, 0.5, 2.2); g.add(koerper);
    const hals = new THREE.Mesh(new THREE.ConeGeometry(0.35, 3.2, 6), wesenMat); hals.rotation.x = Math.PI / 2 - 0.3; hals.position.set(0, 0.5, 3.1); g.add(hals);
    const schwanz = new THREE.Mesh(new THREE.ConeGeometry(0.4, 5, 6), wesenMat); schwanz.rotation.x = -Math.PI / 2; schwanz.position.set(0, 0, -4.2); g.add(schwanz);
    const fl = [1, -1].map((sd) => { const p = new THREE.Group(); const m = new THREE.Mesh(fluegelGeo, wesenMat); m.scale.x = sd; p.add(m); p.position.set(sd * 0.4, 0.3, 0.4); g.add(p); return p; });
    g.scale.setScalar(1.3 - i * 0.2); szene.add(g);
    return { g, fl, r: 30 + i * 12, h: 62 + i * 9, tempo: 0.16 + i * 0.05, ph: i * 2.1 };
  });

  // ---------- Nachbearbeitung ----------
  const komp = new EffectComposer(renderer);
  komp.addPass(new RenderPass(szene, kamera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 256), pal.bloom, 0.62, pal.schwelle); komp.addPass(bloom);
  komp.addPass(new OutputPass());

  // ---------- Größe, Thema ----------
  const groesse = () => {
    const r = canvas.getBoundingClientRect(); const w = Math.max(320, r.width), h = Math.max(200, r.height);
    const dpr = Math.min(devicePixelRatio || 1, w > 1400 ? 1.25 : 1.5);
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false); komp.setPixelRatio(dpr); komp.setSize(w, h);
    bloom.resolution.set(w * 0.5, h * 0.5);
    kamera.aspect = w / h; kamera.fov = w / h > 2 ? 34 : 46; kamera.updateProjectionMatrix();
    glutU2.uDpr.value = ascheU.uDpr.value = dpr;
  };
  const thema = () => {
    pal = PAL[istDunkel() ? 'dunkel' : 'hell'];
    renderer.toneMappingExposure = pal.belicht;
    (szene.fog as THREE.FogExp2).color.set(pal.nebel); (szene.fog as THREE.FogExp2).density = pal.dichte;
    himmelU.uHorizont.value.set(pal.horizont); himmelU.uMitte.value.set(pal.mitte); himmelU.uZenit.value.set(pal.zenit); himmelU.uWolke.value.set(pal.wolke);
    hemi.color.set(pal.hemiO); hemi.groundColor.set(pal.hemiU); hemi.intensity = pal.hemi; rand.color.set(pal.rand); rand.intensity = pal.randI;
    gMat.color.set(pal.fels); bloom.strength = pal.bloom; bloom.threshold = pal.schwelle;
    rauch.forEach((s) => (s.material as THREE.SpriteMaterial).color.set(pal.rauch)); ascheU.uFarbe.value.set(pal.asche);
    zeichne(performance.now());
  };

  // ---------- Maus: das Auge folgt ----------
  const maus = new THREE.Vector2(), ray = new THREE.Raycaster(), ebene = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2);
  let mausDa = false, zuletzt = 0; const ziel = new THREE.Vector3(20, 0, -85), soll = new THREE.Vector3(), treffer = new THREE.Vector3();
  let mx = 0, my = 0;
  addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    mausDa = x >= 0 && x <= 1 && y >= 0 && y <= 1; if (mausDa) zuletzt = performance.now();
    maus.set(x * 2 - 1, -(y * 2 - 1)); mx = x - 0.5; my = y - 0.5;
  }, { passive: true });

  // ---------- Schleife ----------
  const t0 = performance.now(); let letzte = t0; let laeuft = false, sichtbar = true, raf = 0;
  const kpos = new THREE.Vector3(), achse = new THREE.Vector3(0, -1, 0);
  function zeichne(n: number) {
    const t = (n - t0) / 1000, dt = Math.min(0.05, (n - letzte) / 1000 || 0.016); letzte = n;
    himmelU.uZeit.value = t; glutU.uZeit.value = t; augeU.uZeit.value = t; glutU2.uZeit.value = t; ascheU.uZeit.value = t;
    glutU.uGlutFarbe.value.setRGB(1, 0.32, 0.06).multiplyScalar(pal.lava * (0.88 + 0.12 * Math.sin(t * 1.3)));
    krater.intensity = 30000 * (0.8 + 0.2 * Math.sin(t * 2.1) * Math.sin(t * 0.7));
    lavaLichter.forEach((l, i) => (l.intensity = 1200 * (0.8 + 0.2 * Math.sin(t * 1.7 + i))));

    // Kamera: leichte Parallaxe mit Maus und Scrollen, langsames Atmen
    const sc = Math.min(scrollY, 600) / 600;
    kpos.set(mx * 7 + Math.sin(t * 0.07) * 2, 16 - my * 3 - sc * 4, 80 - sc * 8);
    kamera.position.lerp(kpos, Math.min(1, dt * 2)); kamera.lookAt(blickZiel);

    // Blickziel: Maus auf der Ebene, sonst langsames Absuchen
    if (mausDa && n - zuletzt < 5000) {
      ray.setFromCamera(maus, kamera);
      if (ray.ray.intersectPlane(ebene, treffer)) soll.set(THREE.MathUtils.clamp(treffer.x, -110, 150), 0, THREE.MathUtils.clamp(treffer.z, -150, -25));
      else soll.set(THREE.MathUtils.clamp(maus.x * 140, -110, 150), 0, -150);
    } else soll.set(20 + Math.sin(t * 0.13) * 75, 0, -85 + Math.sin(t * 0.09) * 30);
    ziel.lerp(soll, Math.min(1, dt * 1.6)); ziel.y = hoehe(ziel.x, ziel.z) + 0.4;
    const richt = ziel.clone().sub(augePos), len = richt.length(); richt.normalize();
    strahl.position.copy(augePos); strahl.quaternion.setFromUnitVectors(achse, richt); strahl.scale.set(len * 0.055, len, len * 0.055);
    fleck.position.copy(ziel); fleck.scale.setScalar(len * 0.07);
    spot.target.position.copy(ziel); spot.target.updateMatrixWorld();
    // Pupille: Richtung zum Ziel auf dem Bildschirm
    const a = augePos.clone().project(kamera), b = ziel.clone().project(kamera);
    augeU.uPupille.value.set(THREE.MathUtils.clamp((b.x - a.x) * 2, -1, 1), THREE.MathUtils.clamp((b.y - a.y) * 2, -1, 1));
    auge.quaternion.copy(kamera.quaternion); korona.quaternion.copy(kamera.quaternion);

    // Rauch steigt aus dem Krater
    rauch.forEach((s) => {
      const u = s.userData; u.leben += dt * 0.025; if (u.leben > 1) u.leben -= 1;
      const l = u.leben; s.position.set(kraterPos.x + l * 70 + Math.sin(l * 6 + u.dreh) * 6, kraterPos.y + 6 + l * 95, kraterPos.z + l * 10);
      s.scale.setScalar(14 + l * 70); (s.material as THREE.SpriteMaterial).opacity = Math.sin(l * Math.PI) * 0.55; (s.material as THREE.SpriteMaterial).rotation = u.dreh + l;
    });
    // Flugwesen kreisen um den Turm
    wesen.forEach((w) => {
      const ang = t * w.tempo + w.ph, x = TURM.x + Math.cos(ang) * w.r, z = TURM.z + Math.sin(ang) * w.r, y = ty + w.h + Math.sin(t * 0.6 + w.ph) * 4;
      w.g.position.set(x, y, z); w.g.lookAt(TURM.x + Math.cos(ang + 0.1) * w.r, y, TURM.z + Math.sin(ang + 0.1) * w.r); w.g.rotateZ(-0.35);
      const flap = Math.sin(t * 3.2 + w.ph) * 0.55; w.fl[0].rotation.z = flap; w.fl[1].rotation.z = -flap;
    });
    komp.render(dt);
  }
  function schleife(n: number) { if (!laeuft) return; zeichne(n); raf = requestAnimationFrame(schleife); }
  const weiter = () => {
    const soll2 = sichtbar && !document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (soll2 && !laeuft) { laeuft = true; letzte = performance.now(); raf = requestAnimationFrame(schleife); }
    if (!soll2) { laeuft = false; cancelAnimationFrame(raf); }
  };
  new ResizeObserver(() => { groesse(); zeichne(performance.now()); }).observe(canvas);
  new MutationObserver(thema).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', thema);
  new IntersectionObserver(([e]) => { sichtbar = e.isIntersecting; weiter(); }, { rootMargin: '80px' }).observe(canvas);
  document.addEventListener('visibilitychange', weiter);
  groesse(); kamera.position.set(0, 16, 80); zeichne(performance.now()); weiter();
  (el as any).drei = { zeichne, kamera, renderer };
  return true;
}

export default { drei: true, starte, ersatz: 'gewitter' };
