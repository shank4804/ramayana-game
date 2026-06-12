import * as THREE from "three";

import type { DebugFlags } from "../../diagnostics/debugFlags";

export interface SceneSetup {
  scene: THREE.Scene;
  validationMesh: THREE.Mesh | null;
}

export function createScene(debugFlags: DebugFlags): SceneSetup {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#111512");
  scene.fog = new THREE.Fog("#111512", 18, 58);

  const ambient = new THREE.HemisphereLight("#ffe3b0", "#23372e", 1.2);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight("#fff2cf", 2.4);
  sun.position.set(5, 8, 4);
  sun.castShadow = true;
  scene.add(sun);

  const validationMesh = debugFlags.showPrimitiveValidationScene ? createDevValidationMesh() : null;

  if (validationMesh) {
    scene.add(validationMesh);
  }

  return {
    scene,
    validationMesh,
  };
}

function createDevValidationMesh(): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
      color: "#d9a44c",
      roughness: 0.6,
      metalness: 0.05,
    }),
  );

  mesh.position.set(0, 1, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}
