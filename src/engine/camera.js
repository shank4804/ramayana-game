import * as THREE from '../../node_modules/three/build/three.module.js';

function damp(value, target, lambda, dt) {
  return THREE.MathUtils.lerp(value, target, 1 - Math.exp(-lambda * dt));
}

export function updateThirdPersonCamera(camera, state, target, mode, dt) {
  const focus = mode === 'vehicle'
    ? target.group.position.clone().add(new THREE.Vector3(0, 2.8, 0))
    : target.group.position.clone().add(new THREE.Vector3(0.65, 2.1, 0));

  const desiredDistance = mode === 'vehicle'
    ? THREE.MathUtils.clamp(state.cameraDistance, 8, 13.5)
    : THREE.MathUtils.clamp(state.cameraDistance, 5.6, 11.2);

  state.currentCameraDistance = damp(state.currentCameraDistance, desiredDistance, 7.5, dt);
  const sideOffset = mode === 'vehicle' ? 1.4 : 1.2;

  const backward = new THREE.Vector3(
    Math.sin(state.cameraYaw) * Math.cos(state.cameraPitch),
    Math.sin(state.cameraPitch),
    Math.cos(state.cameraYaw) * Math.cos(state.cameraPitch),
  );
  const right = new THREE.Vector3(Math.cos(state.cameraYaw), 0, -Math.sin(state.cameraYaw));
  const desired = focus.clone()
    .addScaledVector(backward, state.currentCameraDistance)
    .addScaledVector(right, sideOffset);

  camera.position.lerp(desired, 1 - Math.exp(-dt * 9));
  camera.lookAt(focus);
}
