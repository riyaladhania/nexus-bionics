// ============================================================
// NEXUS BIONICS — Three.js Cybernetic Orb
// A floating, geometry-shifting orb with orbiting rings
// and reactive mouse interaction.
// ============================================================


// ── GUARD: only run if the canvas element exists ─────────────
const canvas = document.getElementById('threeCanvas');
if (canvas) {

// ── 1. SCENE ─────────────────────────────────────────────────
// The Scene is the container for everything.
// Think of it as the empty stage before actors arrive.
const scene = new THREE.Scene();


// ── 2. CAMERA ────────────────────────────────────────────────
// PerspectiveCamera mimics human vision — things further away
// look smaller (perspective projection).
//
// Arguments: (fieldOfView, aspectRatio, nearClip, farClip)
// nearClip/farClip = objects closer than near or further than
// far are invisible. 0.1 to 1000 covers most scenes.

const camera = new THREE.PerspectiveCamera(
  60,
  canvas.parentElement.clientWidth / canvas.parentElement.clientHeight,
  0.1,
  1000
);
// Move camera back so we can see the orb
camera.position.z = 4;


// ── 3. RENDERER ──────────────────────────────────────────────
// The Renderer takes the scene + camera and draws them
// onto our <canvas> element every frame.
// antialias: true = smooth edges (no jagged pixels)
// alpha: true = transparent background (shows our dark page bg)

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
// ^ Cap at 2x for performance. 4K screens would be too expensive.


// ── 4. GEOMETRY + MATERIALS → MESH ───────────────────────────
// A Mesh = Geometry (the shape) + Material (the surface look).
// Think: geometry = skeleton, material = skin.


// — CORE ORB —
// IcosahedronGeometry makes a sphere-like shape with flat
// triangular faces — very futuristic and geometric.
// (radius, detail-level). Detail 4 = high polygon count.
const orbGeo = new THREE.IcosahedronGeometry(1, 4);

// MeshStandardMaterial reacts to lights (physically-based).
// wireframe: false = solid surface
const orbMat = new THREE.MeshStandardMaterial({
  color: 0x1a1400,          // very dark gold-black
  metalness: 0.9,           // highly metallic
  roughness: 0.2,           // semi-polished
  emissive: 0xD4AF37,       // gold self-glow
  emissiveIntensity: 0.08,
});
const orb = new THREE.Mesh(orbGeo, orbMat);
scene.add(orb);


// — WIREFRAME LAYER —
// A second slightly larger icosahedron drawn as wireframe only.
// This creates the cage/grid effect over the solid orb.
const wireGeo = new THREE.IcosahedronGeometry(1.02, 2);
const wireMat = new THREE.MeshBasicMaterial({
  color: 0xD4AF37,    // gold
  wireframe: true,    // only draw edges, not faces
  transparent: true,
  opacity: 0.18,
});
const wireMesh = new THREE.Mesh(wireGeo, wireMat);
scene.add(wireMesh);


// — OUTER GLOW SPHERE —
// A large semi-transparent sphere around everything.
// BackSide rendering means we see it from inside — 
// creates an atmospheric halo effect.
const glowGeo = new THREE.SphereGeometry(1.4, 32, 32);
const glowMat = new THREE.MeshBasicMaterial({
  color: 0xD4AF37,
  transparent: true,
  opacity: 0.04,
  side: THREE.BackSide,
});
const glowSphere = new THREE.Mesh(glowGeo, glowMat);
scene.add(glowSphere);


// — ORBITING RINGS —
// Three rings at different tilts orbiting the orb.
// TorusGeometry(radius, tubeThickness, radialSegments, tubularSegments)
const ringData = [
  { tilt: 0.4,  speed: 0.008, opacity: 0.5  },
  { tilt: 1.1,  speed: -0.005, opacity: 0.3 },
  { tilt: 0.8,  speed: 0.012, opacity: 0.2  },
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
  ring.userData.speed = speed; // store speed on the object itself
  scene.add(ring);
  return ring;
});


// — FLOATING PARTICLES —
// 200 small points scattered around the orb.
// BufferGeometry + Float32Array is the high-performance way
// to handle large numbers of points in Three.js.

const particleCount = 200;
const positions = new Float32Array(particleCount * 3);
// Each particle needs x, y, z → 3 values per particle

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  // Random point on a sphere surface using spherical coordinates
  const radius = 1.8 + Math.random() * 1.2;
  const theta  = Math.random() * Math.PI * 2;
  const phi    = Math.acos(2 * Math.random() - 1);
  positions[i3]     = radius * Math.sin(phi) * Math.cos(theta); // x
  positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta); // y
  positions[i3 + 2] = radius * Math.cos(phi);                   // z
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);

const particleMat = new THREE.PointsMaterial({
  color: 0xD4AF37,
  size: 0.025,
  transparent: true,
  opacity: 0.6,
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);


// ── 5. LIGHTS ────────────────────────────────────────────────
// Without lights, MeshStandardMaterial renders pure black.
// AmbientLight = flat light from everywhere (no shadows)
// PointLight = light from a single point (like a bulb)

// Soft warm ambient — just enough to see the base shape
const ambientLight = new THREE.AmbientLight(0x2a1f00, 2);
scene.add(ambientLight);

// Main gold key light — top right
const keyLight = new THREE.PointLight(0xD4AF37, 3, 10);
keyLight.position.set(3, 3, 3);
scene.add(keyLight);

// Rim light — bottom left, cooler tone for contrast
const rimLight = new THREE.PointLight(0xFFD700, 1.5, 8);
rimLight.position.set(-3, -2, -2);
scene.add(rimLight);

// Subtle fill from front
const fillLight = new THREE.PointLight(0xfff0cc, 1, 6);
fillLight.position.set(0, 0, 4);
scene.add(fillLight);


// ── 6. MOUSE INTERACTION ─────────────────────────────────────
// We track the mouse position and use it to tilt the orb.
// THREE.Vector2 stores an x and y value.

const mouse = new THREE.Vector2(0, 0);
const targetRotation = new THREE.Vector2(0, 0);

document.addEventListener('mousemove', (e) => {
  // Convert pixel coords to -1 to +1 range
  // (0,0) = centre of screen, (-1,-1) = top-left, (1,1) = bottom-right
  mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});


// ── 7. ANIMATION LOOP ─────────────────────────────────────────
// This is the heartbeat of Three.js.
// animate() is called ~60 times per second by requestAnimationFrame.
// Each call: update positions → render the scene → repeat.

const clock = new THREE.Clock();
// Clock tracks elapsed time so animations run at consistent
// speed regardless of device frame rate.

function animate() {
  requestAnimationFrame(animate); // schedule the next frame

  const elapsed = clock.getElapsedTime();

  // Smoothly interpolate orb rotation toward mouse position
  // lerp = Linear intERPolation: moves a value toward a target
  // by a fraction each frame. 0.03 = 3% closer per frame = smooth lag.
  targetRotation.x += (mouse.y * 0.4 - targetRotation.x) * 0.03;
  targetRotation.y += (mouse.x * 0.4 - targetRotation.y) * 0.03;

  // Apply to orb group
  orb.rotation.x = targetRotation.x + elapsed * 0.08;
  orb.rotation.y = targetRotation.y + elapsed * 0.12;

  // Wireframe rotates slightly differently for layered motion
  wireMesh.rotation.x = -targetRotation.x + elapsed * 0.05;
  wireMesh.rotation.y = -targetRotation.y + elapsed * 0.09;

  // Rings spin independently
  rings.forEach(ring => {
    ring.rotation.z += ring.userData.speed;
  });

  // Particles drift slowly
  particles.rotation.y = elapsed * 0.04;
  particles.rotation.x = elapsed * 0.02;

  // Orb breathes — subtle scale pulse using sine wave
  // Math.sin produces a smooth -1 to +1 wave
  const breathe = 1 + Math.sin(elapsed * 1.2) * 0.025;
  orb.scale.setScalar(breathe);
  glowSphere.scale.setScalar(breathe * 1.05);

  // Key light slowly orbits
  keyLight.position.x = Math.sin(elapsed * 0.5) * 4;
  keyLight.position.z = Math.cos(elapsed * 0.5) * 4;

  // Render the frame
  renderer.render(scene, camera);
}

animate(); // kick off the loop


// ── 8. RESIZE HANDLER ────────────────────────────────────────
// When the window is resized, update the camera aspect ratio
// and renderer size so the scene doesn't stretch or squish.

window.addEventListener('resize', () => {
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

} // end of canvas guard