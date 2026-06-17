import * as THREE from "three";
import type { EnemyState } from "../game/combatSimulation";

export interface RakshasaView {
  root: THREE.Group;
  sync(enemy: EnemyState): void;
}

export function createRakshasaView(): RakshasaView {
  const root = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b1c20,
    roughness: 0.82,
    metalness: 0.02,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x7d0f16,
    emissive: 0x4d0508,
    emissiveIntensity: 0.6,
    roughness: 0.55,
  });
  const flashMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff2222,
    emissiveIntensity: 0.9,
    roughness: 0.35,
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.9, 8, 14), bodyMaterial);
  body.position.y = 0.68;
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.62, 0.08), accentMaterial);
  crest.position.set(0, 0.86, -0.34);
  crest.castShadow = true;
  root.add(crest);

  return {
    root,
    sync(enemy: EnemyState) {
      root.position.set(enemy.position.x, 0, enemy.position.z);
      const scale = enemy.alive
        ? 1
        : 1 + Math.sin((1 - enemy.deathTimer / 0.5) * Math.PI) * 0.22;
      root.scale.setScalar(scale);
      root.visible = enemy.alive || enemy.deathTimer > 0;
      body.material = enemy.flashTimer > 0 ? flashMaterial : bodyMaterial;
      accentMaterial.emissiveIntensity = enemy.flashTimer > 0 ? 1.5 : 0.6;
      root.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.material.opacity = enemy.alive ? 1 : Math.max(0, enemy.deathTimer / 0.5);
          object.material.transparent = !enemy.alive;
        }
      });
    },
  };
}
