/* Ninho — passarinho em 3D (three.js), estilo animação: contorno de nanquim e sombra em tons.
   Carregado só quando o passarinho vai voar. Segue a posição do passarinho do app na tela. */
import * as THREE from './three.module.min.js';

let R, scene, cam, cv, aves = new Set(), raf = 0, escuro = false;

function grad() {
  const d = new Uint8Array([70, 70, 70, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
}
let G;
function mat(c) { return new THREE.MeshToonMaterial({ color: c, gradientMap: G }); }
function tinta(c) { return new THREE.MeshBasicMaterial({ color: c, side: THREE.BackSide }); }

// cada parte ganha um "contorno" (casca preta um pouco maior, virada do avesso)
function parte(geo, cor, contorno, borda = 1.07) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, mat(cor)));
  const o = new THREE.Mesh(geo, tinta(contorno)); o.scale.setScalar(borda); g.add(o);
  return g;
}

function asaGeo() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.28); s.bezierCurveTo(0.5, -0.32, 1.4, -0.2, 2.1, 0.1);
  s.lineTo(1.75, 0.18); s.lineTo(1.95, 0.36); s.lineTo(1.5, 0.34); s.lineTo(1.6, 0.55);
  s.lineTo(1.1, 0.46); s.bezierCurveTo(0.7, 0.5, 0.3, 0.42, 0, 0.3); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1, curveSegments: 10 });
  g.translate(0, 0, -0.035); g.rotateX(Math.PI / 2); return g;
}
function caudaGeo() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.12); s.lineTo(-1.25, -0.42); s.lineTo(-1.35, -0.18); s.lineTo(-1.42, 0.06); s.lineTo(-1.3, 0.3); s.lineTo(0, 0.14); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false });
  g.translate(0, 0, -0.03); return g;
}

function novaAve() {
  const C = escuro ? 0x2a2a2a : 0xf7f5ef, K = escuro ? 0xf2f2f2 : 0x161616;
  const ave = new THREE.Group(), corpo = new THREE.Group(); ave.add(corpo);
  const b = parte(new THREE.SphereGeometry(1, 28, 20), C, K, 1.06); b.scale.set(1.3, 0.98, 0.92); corpo.add(b);
  const h = parte(new THREE.SphereGeometry(0.66, 24, 18), C, K, 1.08); h.position.set(1.02, 0.62, 0); corpo.add(h);
  const bico = parte(new THREE.ConeGeometry(0.15, 0.48, 14), K, K, 1.0); bico.rotation.z = -Math.PI / 2; bico.position.set(1.84, 0.56, 0); corpo.add(bico);
  for (const z of [0.4, -0.4]) {
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), new THREE.MeshBasicMaterial({ color: K })); o.position.set(1.42, 0.78, z); corpo.add(o);
    const br = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: C })); br.position.set(1.5, 0.83, z * 1.08); corpo.add(br);
  }
  const cau = parte(caudaGeo(), C, K, 1.0); cau.position.set(-1.05, 0.08, 0); cau.rotation.z = 0.18; corpo.add(cau);
  const lin = new THREE.LineBasicMaterial({ color: K });
  for (const zz of [-0.012, 0.012]) {
    const pts = []; [[-0.1, 0], [-1.3, -0.3], [-0.1, 0.03], [-1.38, 0], [-0.1, 0.07], [-1.32, 0.22]].forEach(([x, y]) => pts.push(new THREE.Vector3(x, y, zz)));
    cau.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lin));
  }
  const asas = [];
  for (const lado of [1, -1]) {
    const piv = new THREE.Group(); piv.position.set(0.15, 0.42, 0.62 * lado);
    const a = parte(asaGeo(), C, K, 1.0); a.rotation.y = -Math.PI / 2 * lado; if (lado < 0) a.scale.z = -1;
    // penas: linhas de nanquim na asa
    const p = []; for (let i = 0; i < 4; i++) { p.push(new THREE.Vector3(0.25 + i * 0.32, 0.05 + i * 0.07, 0.06), new THREE.Vector3(0.55 + i * 0.38, 0.3 + i * 0.05, 0.06)); }
    a.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(p), lin));
    piv.add(a); corpo.add(piv); asas.push({ piv, lado });
  }
  const pernas = new THREE.Group();
  for (const z of [0.22, -0.22]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 6), new THREE.MeshBasicMaterial({ color: K })); l.position.set(0.1, -1.0, z); pernas.add(l); }
  corpo.add(pernas);
  return { ave, corpo, asas, pernas };
}

function iniciar() {
  if (R) return true;
  try {
    cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:66';
    R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
  } catch (e) { R = null; return false; }
  R.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  G = grad(); scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const l = new THREE.DirectionalLight(0xffffff, 1.6); l.position.set(-2, 4, 5); scene.add(l);
  cam = new THREE.PerspectiveCamera(30, 1, 10, 5000);
  return true;
}
function tamanho() {
  const w = innerWidth, h = innerHeight; R.setSize(w, h, false);
  cam.aspect = w / h; cam.position.set(0, 0, (h / 2) / Math.tan(THREE.MathUtils.degToRad(15))); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
}

/* Faz um passarinho 3D seguir o elemento `el` (o passarinho do app) por `dur` ms. */
export function voar(el, dur, modo) {
  escuro = matchMedia('(prefers-color-scheme: dark)').matches;
  if (!iniciar()) return false;
  if (!cv.isConnected) document.body.appendChild(cv);
  tamanho();
  const v = novaAve(); scene.add(v.ave); v.pernas.visible = false;
  const a = { v, el, t0: performance.now(), dur, modo, px: null, py: null, yaw: 0, roll: 0, pitch: 0, fl: 0 };
  aves.add(a); if (!raf) raf = requestAnimationFrame(loop);
  return true;
}

function loop(now) {
  raf = 0;
  for (const a of aves) {
    const f = (now - a.t0) / a.dur, r = a.el.isConnected ? a.el.getBoundingClientRect() : null;
    if (!r || f >= 1.02) { scene.remove(a.v.ave); aves.delete(a); a.el.classList && a.el.classList.remove('ghost'); continue; }
    const x = r.left + r.width / 2, y = r.top + r.height * 0.55;
    const dx = a.px == null ? 0 : x - a.px, dy = a.py == null ? 0 : y - a.py; a.px = x; a.py = y;
    const s = Math.max(10, r.width * 0.42);
    a.v.ave.position.set(x - innerWidth / 2, innerHeight / 2 - y, 0);
    a.v.ave.scale.setScalar(s);
    // direção: vira para onde está indo; inclina nas curvas; nariz sobe/desce com a subida
    const alvoYaw = Math.abs(dx) > 0.3 ? (dx > 0 ? -0.35 : Math.PI + 0.35) : a.yaw;
    a.yaw += (alvoYaw - a.yaw) * 0.12;
    a.roll += ((-dy * 0.06 + (dx > 0 ? -0.25 : 0.25)) - a.roll) * 0.1;
    let alvoPitch = Math.max(-0.5, Math.min(0.5, -dy * 0.05));
    const w = a.el.dataset ? a.el.dataset.w : '';
    if (a.modo == 'land' && f > 0.82) alvoPitch = 0.55; // freada: corpo para trás
    a.pitch += (alvoPitch - a.pitch) * 0.15;
    a.v.ave.rotation.set(0.32, a.yaw, 0); a.v.corpo.rotation.set(a.roll, 0, a.pitch);
    // asas: batem quando o app está batendo; abertas na planada; para cima na freada
    let ang;
    if (w == 'm') ang = 0.12 + Math.sin(now / 160) * 0.05;
    else if (w == 'u' && a.modo == 'land' && f > 0.82) ang = 1.15;
    else { a.fl += 0.62; ang = Math.sin(a.fl) * 0.95 + 0.2; }
    for (const s2 of a.v.asas) s2.piv.rotation.x = -ang * s2.lado;
    a.v.pernas.visible = a.modo == 'land' && f > 0.8;
  }
  R.render(scene, cam);
  if (aves.size) raf = requestAnimationFrame(loop);
  else if (cv.isConnected) cv.remove();
}
