const canvas = document.getElementById('threeCanvas');
if (canvas) {

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  canvas.parentElement.clientWidth / canvas.parentElement.clientHeight,
  0.1,
  1000
);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(
  canvas.parentElement.clientWidth,
  canvas.parentElement.clientHeight
);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const orbGeo = new THREE.IcosahedronGeometry(1, 4);
const orbMat = new THREE.MeshStandardMaterial({
  color: 0x1a1400,
  metalness: 0.9,
  roughness: 0.2,
  emissive: 0xD4AF37,
  emissiveIntensity: 0.08,
});
const orb = new THREE.Mesh(orbGeo, orbMat);
scene.add(orb);

const wireGeo = new THREE.IcosahedronGeometry(1.02, 2);
const wireMat = new THREE.MeshBasicMaterial({
  color: 0xD4AF37,
  wireframe: true,
  transparent: true,
  opacity: 0.18,
});
const wireMesh = new THREE.Mesh(wireGeo, wireMat);
scene.add(wireMesh);

const glowGeo = new THREE.SphereGeometry(1.4, 32, 32);
const glowMat = new THREE.MeshBasicMaterial({
  color: 0xD4AF37,
  transparent: true,
  opacity: 0.04,
  side: THREE.BackSide,
});
const glowSphere = new THREE.Mesh(glowGeo, glowMat);
scene.add(glowSphere);

const ringData = [
  { tilt: 0.4,  speed: 0.008,  opacity: 0.5 },
  { tilt: 1.1,  speed: -0.005, opacity: 0.3 },
  { tilt: 0.8,  speed: 0.012,  opacity: 0.2 },
];

const rings = ringData.map(({ tilt, speed, opacity }) => {
  const geo = new THREE.TorusGeometry(1.6, 0.004, 2, 120);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xD4AF37,
    transparent: true,
    opacity,
  });
  const ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = tilt;
  ring.userData.speed = speed;
  scene.add(ring);
  return ring;
});

const particleCount = 200;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  const radius = 1.8 + Math.random() * 1.2;
  const theta  = Math.random() * Math.PI * 2;
  const phi    = Math.acos(2 * Math.random() - 1);
  positions[i3]     = radius * Math.sin(phi) * Math.cos(theta);
  positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i3 + 2] = radius * Math.cos(phi);
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMat = new THREE.PointsMaterial({
  color: 0xD4AF37,
  size: 0.025,
  transparent: true,
  opacity: 0.6,
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

const ambientLight = new THREE.AmbientLight(0x2a1f00, 2);
scene.add(ambientLight);

const keyLight = new THREE.PointLight(0xD4AF37, 3, 10);
keyLight.position.set(3, 3, 3);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0xFFD700, 1.5, 8);
rimLight.position.set(-3, -2, -2);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0xfff0cc, 1, 6);
fillLight.position.set(0, 0, 4);
scene.add(fillLight);

const mouse = new THREE.Vector2(0, 0);
const targetRotation = new THREE.Vector2(0, 0);

document.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  targetRotation.x += (mouse.y * 0.4 - targetRotation.x) * 0.03;
  targetRotation.y += (mouse.x * 0.4 - targetRotation.y) * 0.03;

  orb.rotation.x = targetRotation.x + elapsed * 0.08;
  orb.rotation.y = targetRotation.y + elapsed * 0.12;

  wireMesh.rotation.x = -targetRotation.x + elapsed * 0.05;
  wireMesh.rotation.y = -targetRotation.y + elapsed * 0.09;

  rings.forEach(ring => {
    ring.rotation.z += ring.userData.speed;
  });

  particles.rotation.y = elapsed * 0.04;
  particles.rotation.x = elapsed * 0.02;

  const breathe = 1 + Math.sin(elapsed * 1.2) * 0.025;
  orb.scale.setScalar(breathe);
  glowSphere.scale.setScalar(breathe * 1.05);

  keyLight.position.x = Math.sin(elapsed * 0.5) * 4;
  keyLight.position.z = Math.cos(elapsed * 0.5) * 4;

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

}