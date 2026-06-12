import * as THREE from "three";

import type { ThirdPersonCameraRig } from "../camera/thirdPersonCamera";
import type { PlayerInputSnapshot } from "../input/inputMapper";
import type { CollisionWorld, MovementProbe } from "../../physics/world";

export type RamaControllerInput = PlayerInputSnapshot;

export interface RamaControllerState {
  health: number;
  grounded: boolean;
  speed: number;
  mode: "idle" | "walk" | "run" | "dodge" | "aim";
}

export interface RamaController {
  readonly state: RamaControllerState;
  update(deltaSeconds: number, input: RamaControllerInput): void;
}

export interface RamaControllerOptions {
  actor: THREE.Object3D;
  collisionWorld: CollisionWorld;
  cameraRig: ThirdPersonCameraRig;
}

const WALK_SPEED = 2.2;
const RUN_SPEED = 4.2;
const DODGE_SPEED = 6.6;
const PLAYER_RADIUS = 0.34;

export function createRamaController({ actor, collisionWorld, cameraRig }: RamaControllerOptions): RamaController {
  const state: RamaControllerState = {
    health: 100,
    grounded: true,
    speed: 0,
    mode: "idle",
  };

  return {
    state,
    update(deltaSeconds, input) {
      const moveLength = Math.hypot(input.moveX, input.moveZ);
      const hasMovement = moveLength > 0.05;
      const normalX = hasMovement ? input.moveX / moveLength : 0;
      const normalZ = hasMovement ? input.moveZ / moveLength : 0;
      const cameraYaw = cameraRig.state.yaw;
      const forwardX = Math.sin(cameraYaw);
      const forwardZ = Math.cos(cameraYaw);
      const rightX = Math.cos(cameraYaw);
      const rightZ = -Math.sin(cameraYaw);
      const worldX = rightX * normalX + forwardX * normalZ;
      const worldZ = rightZ * normalX + forwardZ * normalZ;
      const targetSpeed = input.dodge && hasMovement ? DODGE_SPEED : input.sprint ? RUN_SPEED : WALK_SPEED;
      const velocityX = hasMovement ? worldX * targetSpeed : 0;
      const velocityZ = hasMovement ? worldZ * targetSpeed : 0;
      const current: MovementProbe = {
        x: actor.position.x,
        y: actor.position.y,
        z: actor.position.z,
        radius: PLAYER_RADIUS,
      };
      const desired = {
        x: actor.position.x + velocityX * deltaSeconds,
        y: actor.position.y,
        z: actor.position.z + velocityZ * deltaSeconds,
        radius: PLAYER_RADIUS,
      };
      const resolved = collisionWorld.resolveMovement(current, desired);

      actor.position.set(resolved.x, resolved.y, resolved.z);

      if (hasMovement) {
        actor.rotation.y = Math.atan2(worldX, worldZ);
      }

      state.speed = Math.hypot(resolved.x - current.x, resolved.z - current.z) / Math.max(deltaSeconds, 0.001);
      state.mode = input.aim ? "aim" : input.dodge && hasMovement ? "dodge" : input.sprint && hasMovement ? "run" : hasMovement ? "walk" : "idle";
      state.grounded = true;

      cameraRig.update(actor, input, deltaSeconds);
    },
  };
}
