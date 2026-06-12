import * as THREE from "three";

import type { PlayerInputSnapshot } from "../input/inputMapper";

export interface ThirdPersonCameraState {
  target: THREE.Object3D | null;
  yaw: number;
  pitch: number;
  distance: number;
  shoulderAim: boolean;
}

export interface ThirdPersonCameraRig {
  readonly state: ThirdPersonCameraState;
  update(target: THREE.Object3D, input: PlayerInputSnapshot, deltaSeconds: number): void;
}

export function createThirdPersonCameraRig(camera: THREE.PerspectiveCamera): ThirdPersonCameraRig {
  const state: ThirdPersonCameraState = {
    target: null,
    yaw: Math.PI,
    pitch: -0.24,
    distance: 5.2,
    shoulderAim: false,
  };

  return {
    state,
    update(target, input, deltaSeconds) {
      state.target = target;
      state.yaw += input.cameraYawDelta;
      state.pitch = Math.max(-0.72, Math.min(0.34, state.pitch + input.cameraPitchDelta));
      state.shoulderAim = input.aim;

      const desiredDistance = input.aim ? 3.1 : 5.2;
      state.distance += (desiredDistance - state.distance) * Math.min(1, deltaSeconds * 8);

      const shoulder = input.aim ? 0.58 : 0;
      const targetX = target.position.x;
      const targetY = target.position.y + 1.25;
      const targetZ = target.position.z;
      const horizontalDistance = Math.cos(state.pitch) * state.distance;
      const cameraX = targetX + Math.sin(state.yaw) * horizontalDistance + Math.cos(state.yaw) * shoulder;
      const cameraY = targetY + 1.0 + Math.sin(state.pitch) * state.distance;
      const cameraZ = targetZ + Math.cos(state.yaw) * horizontalDistance - Math.sin(state.yaw) * shoulder;

      camera.position.set(cameraX, cameraY, cameraZ);
      camera.lookAt(targetX, targetY, targetZ);
    },
  };
}
