import * as THREE from "three";

export function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 1.7, 5);
  camera.lookAt(0, 1, 0);
  return camera;
}
