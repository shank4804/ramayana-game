import * as THREE from "three";

export interface HeroModel {
  root: THREE.Group;
  update(speed: number, timeSeconds: number): void;
}

export function createHeroModel(): HeroModel {
  const root = new THREE.Group();
  const saffron = new THREE.MeshStandardMaterial({
    color: 0xe8a020,
    roughness: 0.62,
    metalness: 0.08,
  });
  const blueRim = new THREE.MeshStandardMaterial({
    color: 0x477dff,
    emissive: 0x113a88,
    emissiveIntensity: 0.35,
    roughness: 0.5,
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 1.05, 8, 16), saffron);
  body.position.y = 0.72;
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), saffron);
  head.position.y = 1.48;
  head.castShadow = true;
  root.add(head);

  const aimMarker = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 4), blueRim);
  aimMarker.position.set(0, 1.1, -0.43);
  aimMarker.rotation.x = Math.PI / 2;
  aimMarker.castShadow = true;
  root.add(aimMarker);

  return {
    root,
    update(speed: number, timeSeconds: number) {
      const runWeight = THREE.MathUtils.clamp(speed / 5.8, 0, 1);
      const bob = Math.sin(timeSeconds * 12) * 0.045 * runWeight;
      body.position.y = 0.72 + bob;
      head.position.y = 1.48 + bob * 0.5;
      aimMarker.position.y = 1.1 + bob * 0.3;
      root.scale.setScalar(1 + runWeight * Math.sin(timeSeconds * 12) * 0.018);
    },
  };
}
