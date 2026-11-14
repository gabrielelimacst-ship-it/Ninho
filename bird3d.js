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
  // asa longa e pontuda, como a asa dobrada do desenho, com a ponta em degraus de penas
  const s = new THREE.Shape();
  s.moveTo(0, -0.3); s.bezierCurveTo(0.6, -0.36, 1.6, -0.22, 2.5, 0.05);
  s.lineTo(2.1, 0.16); s.lineTo(2.3, 0.3); s.lineTo(1.85, 0.32); s.lineTo(2.0, 0.48); s.lineTo(1.5, 0.46); s.lineTo(1.55, 0.6);
  s.bezierCurveTo(1.0, 0.62, 0.4, 0.5, 0, 0.32); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 1, curveSegments: 10 });
  g.translate(0, 0, -0.03); g.rotateX(Math.PI / 2); return g;
}
function caudaGeo() {
  // cauda comprida e fina, como no desenho
  const s = new THREE.Shape();
  s.moveTo(0.1, -0.3); s.bezierCurveTo(-0.6, -0.3, -1.4, -0.2, -2.0, -0.05); s.lineTo(-1.85, 0.06); s.bezierCurveTo(-1.3, 0.12, -0.6, 0.2, 0.1, 0.25); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 });
  g.translate(0, 0, -0.15); return g;
}
function contorno(mesh, K) { // traço preto nas bordas das peças finas
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 35), new THREE.LineBasicMaterial({ color: K }));
  mesh.add(e);
}

function novaAve() {
  const C = escuro ? 0x2a2a2a : 0xfbfaf6, K = escuro ? 0xf2f2f2 : 0x161616;
  const ave = new THREE.Group(), corpo = new THREE.Group(); ave.add(corpo);
  // corpo em gota: peito cheio na frente, afinando para trás
  const bg = new THREE.SphereGeometry(1, 32, 24); const P = bg.attributes.position;
  for (let k = 0; k < P.count; k++) { const x = P.getX(k), f = x < 0 ? 1 + x * 0.32 : 1; P.setY(k, P.getY(k) * f); P.setZ(k, P.getZ(k) * f); }
  bg.computeVertexNormals();
  const b = parte(bg, C, K, 1.05); b.scale.set(1.35, 1.0, 0.9); corpo.add(b);
  // cabeça grande, colada no corpo (sem pescoço), como no desenho
  const h = parte(new THREE.SphereGeometry(0.74, 28, 20), C, K, 1.06); h.position.set(0.95, 0.5, 0); corpo.add(h);
  const bico = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 12), mat(K)); bico.rotation.z = -Math.PI / 2; bico.position.set(1.86, 0.52, 0); corpo.add(bico);
  for (const z of [0.46, -0.46]) {
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), new THREE.MeshBasicMaterial({ color: K })); o.position.set(1.4, 0.68, z); corpo.add(o);
    const br = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: escuro ? K : 0xffffff })); br.position.set(1.48, 0.73, z * 1.1); corpo.add(br);
  }
  const cm = new THREE.Mesh(caudaGeo(), mat(C)); contorno(cm, K);
  const cau = new THREE.Group(); cau.add(cm); cau.position.set(-1.05, 0.05, 0); cau.rotation.z = 0.28; corpo.add(cau);
  const lin = new THREE.LineBasicMaterial({ color: K });
  const asas = [];
  for (const lado of [1, -1]) {
    const piv = new THREE.Group(); piv.position.set(0.25, 0.45, 0.6 * lado);
    const am = new THREE.Mesh(asaGeo(), mat(C)); contorno(am, K);
    // fileiras de penas desenhadas na asa
    const p = []; for (let i = 0; i < 5; i++) { const x0 = 0.3 + i * 0.36; p.push(new THREE.Vector3(x0, 0.045, -0.2 + i * 0.03), new THREE.Vector3(x0 + 0.5, 0.045, 0.35 + i * 0.03)); }
    am.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(p), lin));
    const a = new THREE.Group(); a.add(am); a.rotation.y = -Math.PI / 2 * lado; if (lado < 0) a.scale.z = -1;
    piv.add(a); corpo.add(piv); asas.push({ piv, lado });
  }
  const pernas = new THREE.Group();
  for (const z of [0.25, -0.25]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 6), new THREE.MeshBasicMaterial({ color: K })); l.position.set(0.2, -1.05, z); pernas.add(l); }
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
    a.v.ave.rotation.set(0.45, a.yaw, 0); a.v.corpo.rotation.set(a.roll, 0, a.pitch);
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
