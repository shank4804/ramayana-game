import * as THREE from "three";

import type { DebugFlags } from "../../diagnostics/debugFlags";
import { AYODHYA_PALETTE, createFlatMaterial } from "../palette";
import { createGradientSky } from "../sky/gradientSky";
import { createFloorModule, createPropModule, createWallModule, type CollisionProxy } from "../../world/kits/proceduralKit";
import { createAyodhyaCourtyard } from "../../world/scenes/ayodhyaCourtyard";

export interface SceneSetup {
  scene: THREE.Scene;
  validationMesh: THREE.Object3D | null;
  player: THREE.Object3D;
  collision: CollisionProxy[];
}

export function createScene(debugFlags: DebugFlags): SceneSetup {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(AYODHYA_PALETTE.sky.horizon);
  scene.fog = new THREE.Fog(AYODHYA_PALETTE.fog, 18, 58);
  scene.add(createGradientSky(AYODHYA_PALETTE));

  const ambient = new THREE.HemisphereLight(AYODHYA_PALETTE.cream.base, AYODHYA_PALETTE.earth.base, 1.25);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(AYODHYA_PALETTE.cream.base, 2.6);
  sun.position.set(6, 9, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 36;
  scene.add(sun);

  const validationMesh = debugFlags.showPrimitiveValidationScene ? createDevValidationMesh() : null;
  const courtyard = createAyodhyaCourtyard();
  scene.add(courtyard.object);

  if (validationMesh) {
    scene.add(validationMesh);
  }

  return {
    scene,
    validationMesh,
    player: courtyard.player,
    collision: courtyard.collision,
  };
}

function createDevValidationMesh(): THREE.Object3D {
  const group = new THREE.Group();
  group.name = "ayodhya-style-validation-arrangement";

  const floor = createFloorModule({
    width: 8,
    depth: 8,
    material: createFlatMaterial("sandstone.light"),
  }).object;
  const wall = createWallModule({
    width: 5,
    height: 1.8,
    depth: 0.35,
    material: createFlatMaterial("sandstone.base"),
  }).object;
  const lamp = createPropModule({ kind: "lamp" }).object;
  const planter = createPropModule({ kind: "planter" }).object;
  const marker = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), createFlatMaterial("saffron.base"));

  wall.position.set(0, 0.9, -2.75);
  lamp.position.set(-1.6, 0, -1.1);
  planter.position.set(1.55, 0, -1.05);
  marker.position.set(0, 0.6, 0.35);
  marker.castShadow = true;
  marker.receiveShadow = true;
  group.add(floor, wall, lamp, planter, marker);

  return group;
}
