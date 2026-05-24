import * as THREE from '../../node_modules/three/build/three.module.js';
import * as decor from './decor.js';

export function buildForest(scene, colliders, decorGroup) {
  const safeSpots = [
    { x: -26, z: 54, r: 20 },
    { x: 34, z: 18, r: 18 },
    { x: -58, z: 18, r: 14 },
  ];

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      const x = -66 + col * 14 + (row % 2 ? 4 : -2);
      const z = 18 + row * 16 + ((row * 7 + col * 5) % 4);
      const blocked = safeSpots.some(spot => Math.hypot(x - spot.x, z - spot.z) < spot.r);
      if (blocked) continue;
      decor.addTree(scene, colliders, x, z, 1.5 + (col % 3) * 0.2, 7 + (row % 3));
    }
  }

  const camp = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 5.2, 4.2, 4),
    new THREE.MeshStandardMaterial({ color: 0x9d6d3d, roughness: 0.86 }),
  );
  camp.rotation.y = Math.PI / 4;
  camp.position.set(34, 2.1, 18);
  camp.castShadow = true;
  decorGroup.add(camp);

  const fire = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffa548 }),
  );
  fire.position.set(34, 0.7, 18);
  decorGroup.add(fire);

  const fireLight = new THREE.PointLight(0xffa04a, 1.5, 22, 2);
  fireLight.position.copy(fire.position);
  scene.add(fireLight);

  decor.addRuin(scene, colliders, 10, 22, 9, 9, 5);
  decor.addRuin(scene, colliders, 48, 12, 8, 8, 4.5);
}
