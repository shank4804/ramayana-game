import * as THREE from "three";

import type { PlayerInputSnapshot } from "../input/inputMapper";
import type { CollisionProxy } from "../../world/kits/proceduralKit";

export interface ThirdPersonCameraState {
  target: THREE.Object3D | null;
  yaw: number;
  pitch: number;
  distance: number;
  shoulderAim: boolean;
}

export interface ThirdPersonCameraRig {
  readonly state: ThirdPersonCameraState;
  setFocusTarget(target: THREE.Object3D | null): void;
  update(target: THREE.Object3D, input: PlayerInputSnapshot, deltaSeconds: number): void;
}

export function createThirdPersonCameraRig(
  camera: THREE.PerspectiveCamera,
  collision: readonly CollisionProxy[] = [],
): ThirdPersonCameraRig {
  const state: ThirdPersonCameraState = {
    target: null,
    yaw: Math.PI,
    pitch: -0.18,
    distance: 4.8,
    shoulderAim: false,
  };
  let focusTarget: THREE.Object3D | null = null;

  return {
    state,
    setFocusTarget(target) {
      focusTarget = target;
    },
    update(target, input, deltaSeconds) {
      state.target = target;
      state.yaw += input.cameraYawDelta;
      if (focusTarget) {
        const dx = focusTarget.position.x - target.position.x;
        const dz = focusTarget.position.z - target.position.z;
        const desiredYaw = Math.atan2(dx, dz);
        state.yaw += angleDelta(state.yaw, desiredYaw) * Math.min(1, deltaSeconds * 3.6);
      }
      state.pitch = Math.max(-0.72, Math.min(0.34, state.pitch + input.cameraPitchDelta));
      state.shoulderAim = input.aim;

      const desiredDistance = input.aim ? 3.1 : 4.8;
      state.distance += (desiredDistance - state.distance) * Math.min(1, deltaSeconds * 8);

      const shoulder = input.aim ? 0.58 : 0;
      const targetX = target.position.x;
      const targetY = target.position.y + 1.25;
      const targetZ = target.position.z;
      const horizontalDistance = Math.cos(state.pitch) * state.distance;
      const cameraX = targetX + Math.sin(state.yaw) * horizontalDistance + Math.cos(state.yaw) * shoulder;
      const cameraY = targetY + 1.0 + Math.sin(state.pitch) * state.distance;
      const cameraZ = targetZ + Math.cos(state.yaw) * horizontalDistance - Math.sin(state.yaw) * shoulder;

      const resolved = resolveCameraCollision(
        { x: targetX, y: targetY, z: targetZ },
        { x: cameraX, y: cameraY, z: cameraZ },
        collision,
      );

      camera.position.set(resolved.x, resolved.y, resolved.z);
      camera.lookAt(targetX, targetY, targetZ);
    },
  };
}

function angleDelta(current: number, target: number): number {
  let delta = target - current;

  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }

  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }

  return delta;
}

interface CameraPoint {
  x: number;
  y: number;
  z: number;
}

const CAMERA_COLLISION_PADDING = 0.18;
const CAMERA_BLOCKER_BUFFER = 0.42;
const MIN_CAMERA_DISTANCE = 1.05;

function resolveCameraCollision(
  target: CameraPoint,
  desired: CameraPoint,
  collision: readonly CollisionProxy[],
): CameraPoint {
  const rayX = desired.x - target.x;
  const rayY = desired.y - target.y;
  const rayZ = desired.z - target.z;
  const rayLength = Math.hypot(rayX, rayY, rayZ);

  if (rayLength <= MIN_CAMERA_DISTANCE) {
    return desired;
  }

  let nearestHit = 1;

  for (const proxy of collision) {
    if (proxy.blocksMovement === false || proxy.shape === "sphere") {
      continue;
    }

    const hit = intersectSegmentAabb(target, desired, proxy);
    if (hit !== null && hit > 0.02) {
      nearestHit = Math.min(nearestHit, hit);
    }
  }

  if (nearestHit >= 1) {
    return desired;
  }

  const safeDistance = Math.max(MIN_CAMERA_DISTANCE, nearestHit * rayLength - CAMERA_BLOCKER_BUFFER);
  const scale = safeDistance / rayLength;

  return {
    x: target.x + rayX * scale,
    y: target.y + rayY * scale,
    z: target.z + rayZ * scale,
  };
}

function intersectSegmentAabb(start: CameraPoint, end: CameraPoint, proxy: CollisionProxy): number | null {
  const [centerX, centerY, centerZ] = proxy.position;
  const [width, height, depth] = proxy.size;
  const min = {
    x: centerX - width * 0.5 - CAMERA_COLLISION_PADDING,
    y: centerY - height * 0.5 - CAMERA_COLLISION_PADDING,
    z: centerZ - depth * 0.5 - CAMERA_COLLISION_PADDING,
  };
  const max = {
    x: centerX + width * 0.5 + CAMERA_COLLISION_PADDING,
    y: centerY + height * 0.5 + CAMERA_COLLISION_PADDING,
    z: centerZ + depth * 0.5 + CAMERA_COLLISION_PADDING,
  };
  const direction = {
    x: end.x - start.x,
    y: end.y - start.y,
    z: end.z - start.z,
  };
  let tMin = 0;
  let tMax = 1;

  const xResult = clipSegmentAxis(start.x, direction.x, min.x, max.x, tMin, tMax);
  if (!xResult) {
    return null;
  }

  tMin = xResult.tMin;
  tMax = xResult.tMax;

  const yResult = clipSegmentAxis(start.y, direction.y, min.y, max.y, tMin, tMax);
  if (!yResult) {
    return null;
  }

  tMin = yResult.tMin;
  tMax = yResult.tMax;

  const zResult = clipSegmentAxis(start.z, direction.z, min.z, max.z, tMin, tMax);
  if (!zResult) {
    return null;
  }

  return zResult.tMin;
}

function clipSegmentAxis(
  origin: number,
  direction: number,
  min: number,
  max: number,
  tMin: number,
  tMax: number,
): { tMin: number; tMax: number } | null {
  if (Math.abs(direction) < 0.0001) {
    return origin >= min && origin <= max ? { tMin, tMax } : null;
  }

  const inverse = 1 / direction;
  let near = (min - origin) * inverse;
  let far = (max - origin) * inverse;

  if (near > far) {
    const previousNear = near;
    near = far;
    far = previousNear;
  }

  const nextMin = Math.max(tMin, near);
  const nextMax = Math.min(tMax, far);

  return nextMin <= nextMax ? { tMin: nextMin, tMax: nextMax } : null;
}
