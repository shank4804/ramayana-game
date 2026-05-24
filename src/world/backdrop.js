import * as THREE from '../../node_modules/three/build/three.module.js';

export function buildBackdrop(scene, colliders) {
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(260, 120),
    new THREE.MeshStandardMaterial({ color: 0x3b6b8e, roughness: 0.35, metalness: 0.08 }),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(174, 0.02, -52);
  scene.add(sea);

  for (let i = 0; i < 10; i++) {
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(18 + i * 2, 24 + i * 1.8, 6),
      new THREE.MeshStandardMaterial({ color: 0x4b5d75, roughness: 1 }),
    );
    hill.castShadow = true;
    hill.position.set(-188 + i * 42, 12 + i * 0.4, -172 + (i % 2) * 18);
    scene.add(hill);
  }

  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(52, 1.1, 12),
    new THREE.MeshStandardMaterial({ color: 0xb48f63, roughness: 0.85 }),
  );
  bridge.position.set(104, 0.7, -22);
  bridge.castShadow = true;
  bridge.receiveShadow = true;
  scene.add(bridge);
}
