import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

export function createRenderer() {
  const attempts = [
    { antialias: true, powerPreference: 'high-performance' },
    { antialias: false, powerPreference: 'default' },
  ];

  let lastError = null;
  let renderer = null;
  for (const options of attempts) {
    try {
      renderer = new THREE.WebGLRenderer(options);
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!renderer) {
    throw lastError || new Error('Unable to create a WebGL renderer');
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.domElement.id = 'viewport';
  return renderer;
}

export function createPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  const size = renderer.getSize(new THREE.Vector2());

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const ssaoPass = new SSAOPass(scene, camera, size.x, size.y);
  ssaoPass.kernelRadius = 6;
  ssaoPass.minDistance = 0.0008;
  ssaoPass.maxDistance = 0.06;
  ssaoPass.enabled = false; // toggled by setQuality
  composer.addPass(ssaoPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(size.x, size.y),
    0.5, // strength
    0.4, // radius
    0.9, // threshold
  );
  composer.addPass(bloomPass);

  const fxaaPass = new ShaderPass(FXAAShader);
  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms.resolution.value.set(
    1 / (size.x * pixelRatio),
    1 / (size.y * pixelRatio),
  );
  composer.addPass(fxaaPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  function setQuality(level) {
    ssaoPass.enabled = level !== 'medium';
    bloomPass.strength = level === 'epic' ? 0.62 : level === 'medium' ? 0.38 : 0.5;
  }

  function setSize(width, height) {
    composer.setSize(width, height);
    ssaoPass.setSize(width, height);
    bloomPass.setSize(width, height);
    const ratio = renderer.getPixelRatio();
    fxaaPass.material.uniforms.resolution.value.set(
      1 / (width * ratio),
      1 / (height * ratio),
    );
  }

  return { composer, setQuality, setSize };
}
