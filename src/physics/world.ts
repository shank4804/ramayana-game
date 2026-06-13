import RAPIER from "@dimforge/rapier3d-compat";

import type { CollisionProxy } from "../world/kits/proceduralKit";

export interface PhysicsWorldState {
  readonly enabled: boolean;
  readonly provider: "rapier" | "proxy-aabb";
}

export interface MovementProbe {
  x: number;
  y: number;
  z: number;
  radius: number;
}

export interface CollisionWorld {
  readonly state: PhysicsWorldState;
  resolveMovement(current: MovementProbe, desired: MovementProbe): MovementProbe;
}

const PLAYER_HALF_HEIGHT = 0.6;
const PLAYER_RADIUS = 0.34;

let rapierReady = false;

/**
 * Loads the Rapier WASM runtime. Must be awaited before the first
 * createCollisionWorld call so collision worlds use Rapier rather than the
 * AABB fallback. Safe to call more than once.
 */
export async function initPhysics(): Promise<void> {
  if (rapierReady) {
    return;
  }

  await RAPIER.init();
  rapierReady = true;
}

export function isPhysicsReady(): boolean {
  return rapierReady;
}

export function createCollisionWorld(collision: readonly CollisionProxy[]): CollisionWorld {
  return rapierReady ? createRapierCollisionWorld(collision) : createAabbCollisionWorld(collision);
}

function createRapierCollisionWorld(collision: readonly CollisionProxy[]): CollisionWorld {
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });

  for (const proxy of collision) {
    const desc = describeStaticCollider(proxy);

    if (!desc) {
      continue;
    }

    const [x, y, z] = proxy.position;
    desc.setTranslation(x, y, z);
    world.createCollider(desc);
  }

  const body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased());
  const playerCollider = world.createCollider(
    RAPIER.ColliderDesc.capsule(PLAYER_HALF_HEIGHT, PLAYER_RADIUS),
    body,
  );

  const controller = world.createCharacterController(0.02);
  controller.enableAutostep(0.3, 0.2, true);
  controller.setSlideEnabled(true);

  const centerOffset = PLAYER_RADIUS + PLAYER_HALF_HEIGHT;

  // Place the kinematic body at the world origin's collider positions before
  // the first resolve so the query structures are populated.
  world.step();

  return {
    state: { enabled: true, provider: "rapier" },
    resolveMovement(current, desired) {
      // Re-sync the body if an external system (respawn, hub transition) moved
      // the player out from under the physics body.
      const bodyPos = body.translation();
      const drift = Math.hypot(bodyPos.x - current.x, bodyPos.z - current.z);

      if (drift > 0.25) {
        body.setNextKinematicTranslation({ x: current.x, y: current.y + centerOffset, z: current.z });
        world.step();
      }

      controller.computeColliderMovement(playerCollider, {
        x: desired.x - current.x,
        y: 0,
        z: desired.z - current.z,
      });

      const corrected = controller.computedMovement();
      const nextX = current.x + corrected.x;
      const nextZ = current.z + corrected.z;

      body.setNextKinematicTranslation({ x: nextX, y: current.y + centerOffset, z: nextZ });
      world.step();

      return {
        x: nextX,
        y: current.y,
        z: nextZ,
        radius: current.radius,
      };
    },
  };
}

function describeStaticCollider(proxy: CollisionProxy): RAPIER.ColliderDesc | null {
  if (proxy.blocksMovement === false || proxy.shape === "sphere") {
    return null;
  }

  const [width, height, depth] = proxy.size;
  const halfHeight = Math.max(height * 0.5, 0.5);

  if (proxy.shape === "cylinder") {
    return RAPIER.ColliderDesc.cylinder(halfHeight, Math.max(width, depth) * 0.5);
  }

  return RAPIER.ColliderDesc.cuboid(width * 0.5, halfHeight, depth * 0.5);
}

/**
 * Pure-JS axis-aligned fallback used only if Rapier has not finished loading.
 * Resolves horizontal movement by sliding along blocked axes.
 */
function createAabbCollisionWorld(collision: readonly CollisionProxy[]): CollisionWorld {
  return {
    state: { enabled: true, provider: "proxy-aabb" },
    resolveMovement(current, desired) {
      if (isBlocked(desired, collision)) {
        const xOnly = { ...desired, z: current.z };

        if (!isBlocked(xOnly, collision)) {
          return xOnly;
        }

        const zOnly = { ...desired, x: current.x };

        if (!isBlocked(zOnly, collision)) {
          return zOnly;
        }

        return current;
      }

      return desired;
    },
  };
}

function isBlocked(probe: MovementProbe, collision: readonly CollisionProxy[]): boolean {
  return collision.some((proxy) => {
    if (proxy.blocksMovement === false || proxy.shape === "sphere") {
      return false;
    }

    const [x, , z] = proxy.position;
    const [width, , depth] = proxy.size;
    const halfWidth = width * 0.5 + probe.radius;
    const halfDepth = depth * 0.5 + probe.radius;

    return Math.abs(probe.x - x) < halfWidth && Math.abs(probe.z - z) < halfDepth;
  });
}
