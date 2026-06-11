import * as THREE from 'three';

function standard(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts });
}

function box(scene, colliders, x, z, w, h, d, material, solid = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  if (solid) colliders.add(x, z, w, d);
  return mesh;
}

function building(scene, colliders, x, z, w, d, h, wallColor, roofColor) {
  const body = box(scene, colliders, x, z, w, h, d, standard(wallColor, { roughness: 0.72 }));
  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(w * 0.2, w * 0.34, 2.2, 16),
    standard(roofColor, { roughness: 0.45, metalness: 0.3 }),
  );
  roof.position.set(x, h + 1.1, z);
  roof.scale.z = d / w;
  roof.castShadow = true;
  scene.add(roof);
  return body;
}

function tree(scene, colliders, x, z, r = 1.5, h = 7) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.18, r * 0.26, h, 8),
    standard(0x5d3517, { roughness: 0.95 }),
  );
  trunk.position.set(x, h / 2, z);
  trunk.castShadow = true;
  scene.add(trunk);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(r * 2, 12, 12), standard(0x33602f));
  crown.position.set(x, h + r, z);
  crown.castShadow = true;
  scene.add(crown);
  colliders.add(x, z, r * 2, r * 2, 0.6);
}

function rock(scene, colliders, x, z, size) {
  const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), standard(0x6f5e48, { roughness: 1 }));
  mesh.position.set(x, size * 0.4, z);
  mesh.rotation.set(x * 0.013, z * 0.011, (x + z) * 0.007);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  colliders.add(x, z, size * 1.5, size * 1.5, 0.6);
}

function torch(scene, x, z) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 2.6, 8), standard(0x4b2f1c));
  pole.position.set(x, 1.3, z);
  pole.castShadow = true;
  scene.add(pole);
  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xffaa54, emissive: 0xff7f22, emissiveIntensity: 1.5 }),
  );
  flame.position.set(x, 2.75, z);
  scene.add(flame);
  const light = new THREE.PointLight(0xff8f44, 1.2, 20, 2);
  light.position.copy(flame.position);
  scene.add(light);
}

function lamp(scene, x, z) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.2, 8), standard(0x57452f));
  pole.position.set(x, 2.6, z);
  pole.castShadow = true;
  scene.add(pole);
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xffd477, emissive: 0xffb650, emissiveIntensity: 1 }),
  );
  orb.position.set(x, 5.1, z);
  scene.add(orb);
  const light = new THREE.PointLight(0xffd36c, 0.7, 16, 2);
  light.position.copy(orb.position);
  scene.add(light);
}

export function buildWorld(scene, colliders) {
  // Sky + lighting
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(520, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xaec8f6, side: THREE.BackSide }),
  );
  scene.add(sky);

  const hemi = new THREE.HemisphereLight(0xd9e6ff, 0x4b311b, 1.15);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff0cf, 2.3);
  sun.position.set(-70, 110, 55);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -220;
  sun.shadow.camera.right = 220;
  sun.shadow.camera.top = 220;
  sun.shadow.camera.bottom = -220;
  scene.add(sun);

  // Ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(460, 460), standard(0x6b865a, { roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const patch = (x, z, w, d, color) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), standard(color, { roughness: 1 }));
    p.rotation.x = -Math.PI / 2;
    p.position.set(x, 0.03, z);
    p.receiveShadow = true;
    scene.add(p);
  };
  patch(-110, -10, 130, 90, 0xc8b082);   // Ayodhya sandstone
  patch(0, 60, 130, 100, 0x58754a);      // forest floor
  patch(95, -45, 90, 80, 0x7a6a4f);      // Kishkindha rock
  patch(140, 70, 110, 130, 0x5a2422);    // Lanka dark stone

  // Roads
  const road = (x, z, w, d) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), standard(0x65513e, { roughness: 0.95 }));
    r.position.set(x, 0.06, z);
    r.receiveShadow = true;
    scene.add(r);
  };
  road(-30, -6, 220, 13);
  road(55, 28, 13, 90);
  road(100, -10, 110, 13);
  road(130, 40, 13, 110);

  // --- Ayodhya (west): sandstone palace city ---
  building(scene, colliders, -150, -40, 18, 16, 13, 0xd7d0c2, 0xc8a24e);
  building(scene, colliders, -128, -42, 18, 18, 16, 0xd8d2c5, 0xc49a45);
  building(scene, colliders, -106, -40, 15, 14, 11, 0xd5cebc, 0xcda14d);
  building(scene, colliders, -146, 22, 14, 12, 10, 0xd8cbb5, 0xb8893d);
  building(scene, colliders, -122, 26, 17, 15, 12, 0xd5c9b7, 0xc49d52);
  box(scene, colliders, -78, 32, 100, 8, 5, standard(0xc3ab7c)); // city wall N
  box(scene, colliders, -78, -48, 100, 8, 5, standard(0xc3ab7c)); // city wall S
  // Eastern gate: two posts + lintel
  box(scene, colliders, -88, -13, 2.4, 11, 3.4, standard(0x9f7c47));
  box(scene, colliders, -88, 1, 2.4, 11, 3.4, standard(0x9f7c47));
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 17.4), standard(0x9f7c47));
  lintel.position.set(-88, 10.6, -6);
  lintel.castShadow = true;
  scene.add(lintel);
  [[-150, -8], [-130, -8], [-110, -8], [-95, -8]].forEach(([x, z]) => lamp(scene, x, z));

  // --- Forest (center-south) ---
  const safe = [{ x: -20, z: 56, r: 18 }, { x: 36, z: 22, r: 16 }];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      const x = -58 + col * 14 + (row % 2 ? 4 : -3);
      const z = 22 + row * 15 + ((row * 7 + col * 5) % 4);
      if (safe.some((s) => Math.hypot(x - s.x, z - s.z) < s.r)) continue;
      tree(scene, colliders, x, z, 1.4 + (col % 3) * 0.2, 6.5 + (row % 3));
    }
  }
  // Exile camp: hut + fire
  const hut = new THREE.Mesh(new THREE.CylinderGeometry(0, 5, 4.2, 4), standard(0x9d6d3d));
  hut.rotation.y = Math.PI / 4;
  hut.position.set(36, 2.1, 22);
  hut.castShadow = true;
  scene.add(hut);
  const fire = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffa548 }));
  fire.position.set(31, 0.6, 24);
  scene.add(fire);
  const fireLight = new THREE.PointLight(0xffa04a, 1.5, 20, 2);
  fireLight.position.copy(fire.position);
  scene.add(fireLight);

  // --- Kishkindha (east): rock fields + banners ---
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const x = 68 + col * 13 + (row % 2 ? 5 : -2);
      const z = -78 + row * 14 + ((row * 9 + col * 3) % 4);
      rock(scene, colliders, x, z, 4.4 + ((row + col) % 3) * 1.1);
    }
  }

  // --- Lanka (far east): red fortress ---
  const lankaWall = standard(0x6d2e22, { roughness: 0.8 });
  box(scene, colliders, 122, 38, 44, 12, 4, lankaWall);
  box(scene, colliders, 102, 60, 4, 12, 42, lankaWall);
  box(scene, colliders, 142, 60, 4, 12, 42, lankaWall);
  building(scene, colliders, 150, 105, 42, 32, 18, 0x33191b, 0x7a3726); // Ravana's palace
  building(scene, colliders, 118, 32, 16, 14, 9, 0x58221e, 0x944b38);
  [[112, 40], [132, 40], [112, 80], [132, 80], [150, 88], [150, 124]].forEach(([x, z]) => torch(scene, x, z));

  // Distant hills (backdrop)
  for (let i = 0; i < 9; i++) {
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(20 + i * 2, 26 + i * 1.6, 6),
      standard(0x4b5d75, { roughness: 1 }),
    );
    hill.position.set(-180 + i * 44, 12, -170 + (i % 2) * 16);
    scene.add(hill);
  }

  // Sea east of Lanka
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 130),
    standard(0x3b6b8e, { roughness: 0.35, metalness: 0.1 }),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(180, 0.02, -60);
  scene.add(sea);

  return { sun, hemi };
}
