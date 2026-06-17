import RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";

const HERO_START = new THREE.Vector3(0, 0.92, 0);

export async function createPhysicsWorld() {
  await RAPIER.init();

  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
      HERO_START.x,
      HERO_START.y,
      HERO_START.z,
    ),
  );
  const collider = world.createCollider(RAPIER.ColliderDesc.capsule(0.54, 0.32), body);
  const controller = world.createCharacterController(0.02);
  controller.setSlideEnabled(true);
  controller.enableAutostep(0.22, 0.2, false);
  controller.setApplyImpulsesToDynamicBodies(true);

  const current = new THREE.Vector3();

  return {
    heroPosition() {
      const position = body.translation();
      return current.set(position.x, position.y, position.z).clone();
    },

    moveHero(velocity: THREE.Vector3, deltaSeconds: number) {
      const desired = {
        x: velocity.x * deltaSeconds,
        y: 0,
        z: velocity.z * deltaSeconds,
      };

      controller.computeColliderMovement(collider, desired);
      const movement = controller.computedMovement();
      const position = body.translation();
      body.setNextKinematicTranslation({
        x: position.x + movement.x,
        y: HERO_START.y,
        z: position.z + movement.z,
      });

      world.timestep = deltaSeconds;
      world.step();

      const next = body.translation();
      return current.set(next.x, next.y, next.z).clone();
    },
  };
}
