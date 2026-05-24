import * as THREE from '../../node_modules/three/build/three.module.js';

export function addGroundPatch(scene, colliders, x, z, width, depth, color) {
  const patch = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 1 }),
  );
  patch.rotation.x = -Math.PI / 2;
  patch.position.set(x, 0.03, z);
  patch.receiveShadow = true;
  scene.add(patch);
}

export function addRoad(scene, colliders, x, z, width, depth, color) {
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.12, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 0.96 }),
  );
  road.position.set(x, 0.09, z);
  road.receiveShadow = true;
  scene.add(road);
}

export function addLaneMark(scene, colliders, x, z, width, depth) {
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ color: 0xf8d38a }),
  );
  line.rotation.x = -Math.PI / 2;
  line.position.set(x, 0.16, z);
  scene.add(line);
}

export function addBuilding(scene, colliders, x, z, width, depth, height, wallColor, roofColor, solid) {
  const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.75 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.46, metalness: 0.28 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMaterial);
  body.position.set(x, height / 2, z);
  body.castShadow = true;
  body.receiveShadow = true;
  scene.add(body);

  const roof = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.22, width * 0.32, 2, 18), roofMaterial);
  roof.position.set(x, height + 1, z);
  roof.scale.z = depth / width;
  roof.castShadow = true;
  roof.receiveShadow = true;
  scene.add(roof);

  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x1b1e2a, emissive: 0x4d3a14, emissiveIntensity: 0.16 });
  const windowRows = Math.max(1, Math.floor(height / 4));
  const windowCols = Math.max(2, Math.floor(width / 5));
  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < windowCols; col++) {
      const wx = x - width / 2 + 2 + col * ((width - 4) / Math.max(1, windowCols - 1));
      const wy = 2 + row * 3;
      const front = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), windowMaterial);
      front.position.set(wx, wy, z + depth / 2 + 0.04);
      scene.add(front);
    }
  }

  if (solid) colliders.register(x, z, width, depth, 0.8);
}

export function addWall(scene, colliders, x, z, width, depth, height, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 0.82 }),
  );
  mesh.position.set(x, height / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  colliders.register(x, z, width, depth, 0.5);
}

export function addGateArch(scene, colliders, x, z) {
  const material = new THREE.MeshStandardMaterial({ color: 0x9f7c47, roughness: 0.76 });
  const leftPost = new THREE.Mesh(new THREE.BoxGeometry(2.2, 11, 3.2), material);
  leftPost.position.set(x - 4.4, 5.5, z);
  leftPost.castShadow = true;
  leftPost.receiveShadow = true;
  scene.add(leftPost);
  colliders.register(x - 4.4, z, 2.2, 3.2, 0.4);

  const rightPost = leftPost.clone();
  rightPost.position.x = x + 4.4;
  scene.add(rightPost);
  colliders.register(x + 4.4, z, 2.2, 3.2, 0.4);

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(11.2, 2.2, 3.6), material);
  lintel.position.set(x, 10.4, z);
  lintel.castShadow = true;
  lintel.receiveShadow = true;
  scene.add(lintel);
}

export function addTower(scene, colliders, x, z, radius, height, wallColor, roofColor) {
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius + 0.5, height, 12),
    new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.78 }),
  );
  base.position.set(x, height / 2, z);
  base.castShadow = true;
  base.receiveShadow = true;
  scene.add(base);

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.82, 16, 16),
    new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.5, metalness: 0.22 }),
  );
  cap.position.set(x, height + radius * 0.2, z);
  cap.scale.y = 0.66;
  cap.castShadow = true;
  scene.add(cap);

  colliders.register(x, z, radius * 2.2, radius * 2.2, 0.6);
}

export function addStreetLamp(scene, colliders, x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 5.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x5b4630, roughness: 0.86 }),
  );
  pole.position.set(x, 2.8, z);
  pole.castShadow = true;
  scene.add(pole);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xffd477, emissive: 0xffb650, emissiveIntensity: 1, roughness: 0.35 }),
  );
  lamp.position.set(x, 5.4, z);
  scene.add(lamp);

  const light = new THREE.PointLight(0xffd36c, 0.75, 18, 2);
  light.position.copy(lamp.position);
  scene.add(light);
}

export function addTorch(scene, colliders, x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 2.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x573822, roughness: 0.9 }),
  );
  pole.position.set(x, 1.3, z);
  pole.castShadow = true;
  scene.add(pole);

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xffaa54, emissive: 0xff7f22, emissiveIntensity: 1.4, roughness: 0.2 }),
  );
  flame.position.set(x, 2.75, z);
  scene.add(flame);

  const light = new THREE.PointLight(0xff8f44, 1.4, 24, 2);
  light.position.copy(flame.position);
  scene.add(light);
}

export function addTree(scene, colliders, x, z, radius, height) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.18, radius * 0.26, height, 10),
    new THREE.MeshStandardMaterial({ color: 0x603718, roughness: 0.98 }),
  );
  trunk.position.set(x, height / 2, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 2.1, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0x355f31, roughness: 0.96 }),
  );
  crown.position.set(x, height + radius * 1.2, z);
  crown.castShadow = true;
  scene.add(crown);

  colliders.register(x, z, radius * 2.2, radius * 2.2, 0.7);
}

export function addRock(scene, colliders, x, z, size, color) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(size, 0),
    new THREE.MeshStandardMaterial({ color, roughness: 1 }),
  );
  rock.position.set(x, size * 0.42, z);
  rock.rotation.set((x + z) * 0.02, x * 0.01, z * 0.01);
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
  colliders.register(x, z, size * 1.6, size * 1.6, 0.7);
}

export function addRuin(scene, colliders, x, z, width, depth, height) {
  const material = new THREE.MeshStandardMaterial({ color: 0x8d7a62, roughness: 0.94 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  base.position.set(x, height / 2, z);
  base.castShadow = true;
  base.receiveShadow = true;
  scene.add(base);
  colliders.register(x, z, width, depth, 0.5);
}

export function addBridge(scene, colliders, x, z, width, depth) {
  const wood = new THREE.MeshStandardMaterial({ color: 0x8b6743, roughness: 0.9 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 0.8, depth), wood);
  deck.position.set(x, 1.2, z);
  deck.castShadow = true;
  deck.receiveShadow = true;
  scene.add(deck);

  const rail1 = new THREE.Mesh(new THREE.BoxGeometry(width, 0.3, 0.2), wood);
  rail1.position.set(x, 2.3, z - depth / 2);
  rail1.castShadow = true;
  scene.add(rail1);

  const rail2 = rail1.clone();
  rail2.position.z = z + depth / 2;
  scene.add(rail2);
}

export function addBanner(scene, colliders, x, z, color) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 7, 8),
    new THREE.MeshStandardMaterial({ color: 0x5f4631, roughness: 0.86 }),
  );
  pole.position.set(x, 3.5, z);
  pole.castShadow = true;
  scene.add(pole);

  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 2.8),
    new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.7 }),
  );
  cloth.position.set(x + 1.2, 5.2, z);
  scene.add(cloth);
}
