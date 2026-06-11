import * as THREE from 'three';

export function createRenderer() {
  const attempts = [
    { antialias: true, powerPreference: 'high-performance' },
    { antialias: false, powerPreference: 'default' },
  ];

  let renderer = null;
  let lastError = null;
  for (const options of attempts) {
    try {
      renderer = new THREE.WebGLRenderer(options);
      break;
    } catch (err) {
      lastError = err;
    }
  }
  if (!renderer) throw lastError || new Error('Unable to create a WebGL renderer');

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.id = 'viewport';
  return renderer;
}
