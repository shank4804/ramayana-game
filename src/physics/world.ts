import type { CollisionProxy } from "../world/kits/proceduralKit";

export interface PhysicsWorldState {
  readonly enabled: boolean;
  readonly provider: "proxy-aabb" | "rapier-unavailable";
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

export const initialPhysicsWorldState: PhysicsWorldState = {
  enabled: true,
  provider: "proxy-aabb",
};

export function createCollisionWorld(collision: readonly CollisionProxy[]): CollisionWorld {
  return {
    state: initialPhysicsWorldState,
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
    if (proxy.shape === "sphere") {
      return false;
    }

    const [x, , z] = proxy.position;
    const [width, , depth] = proxy.size;
    const halfWidth = width * 0.5 + probe.radius;
    const halfDepth = depth * 0.5 + probe.radius;

    return Math.abs(probe.x - x) < halfWidth && Math.abs(probe.z - z) < halfDepth;
  });
}
