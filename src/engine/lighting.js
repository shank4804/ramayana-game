import * as THREE from '../../node_modules/three/build/three.module.js';

export function installLighting(scene) {
  const hemi = new THREE.HemisphereLight(0xd9e6ff, 0x4b311b, 1.18);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff0cf, 2.35);
  sun.position.set(-75, 110, 60);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -240;
  sun.shadow.camera.right = 240;
  sun.shadow.camera.top = 240;
  sun.shadow.camera.bottom = -240;
  scene.add(sun);

  return { sun, hemi };
}
