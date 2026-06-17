import * as THREE from "three";

export interface AttackArcView {
  root: THREE.Mesh;
  trigger(heroPosition: THREE.Vector3, aimDirection: THREE.Vector3): void;
  update(deltaSeconds: number): void;
}

export function createAttackArcView(): AttackArcView {
  const root = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 2.5, 32, 1, -0.58, 1.16),
    new THREE.MeshBasicMaterial({
      color: 0xf4b84a,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  root.rotation.x = -Math.PI / 2;
  root.position.y = 0.035;
  root.visible = false;

  let timer = 0;

  return {
    root,
    trigger(heroPosition: THREE.Vector3, aimDirection: THREE.Vector3) {
      root.position.set(heroPosition.x, 0.035, heroPosition.z);
      root.rotation.z = Math.atan2(aimDirection.x, aimDirection.z) - Math.PI / 2;
      root.visible = true;
      timer = 0.12;
      root.material.opacity = 0.48;
    },

    update(deltaSeconds: number) {
      if (timer === 0) {
        return;
      }

      timer = Math.max(0, timer - deltaSeconds);
      root.material.opacity = 0.48 * (timer / 0.12);
      root.visible = timer > 0;
    },
  };
}
