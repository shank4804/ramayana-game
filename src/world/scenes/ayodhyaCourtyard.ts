import * as THREE from "three";

import { createRamaStandInCharacter } from "../../assets/characters/ramaStandIn";
import { AYODHYA_PALETTE, createFlatMaterial } from "../../render/palette";
import {
  createColumnModule,
  createFloorModule,
  createGateModule,
  createPropModule,
  createRockModule,
  createShrubModule,
  createTreeModule,
  createWallModule,
  type CollisionProxy,
} from "../kits/proceduralKit";

export interface AyodhyaCourtyardScene {
  object: THREE.Group;
  collision: CollisionProxy[];
}

export function createAyodhyaCourtyard(): AyodhyaCourtyardScene {
  const courtyard = new THREE.Group();
  courtyard.name = "ayodhya-lookdev-courtyard";
  const collision: CollisionProxy[] = [];

  addModule(courtyard, collision, createFloorModule({ width: 13, depth: 11, material: createFlatMaterial("sandstone.light") }));
  addBackWall(courtyard, collision);
  addColumnRows(courtyard, collision);
  addGate(courtyard, collision);
  addProps(courtyard, collision);
  addNature(courtyard, collision);
  addCharacter(courtyard);

  return {
    object: courtyard,
    collision,
  };
}

function addBackWall(courtyard: THREE.Group, collision: CollisionProxy[]): void {
  const wallMaterial = createFlatMaterial("sandstone.base");
  const backWall = createWallModule({ width: 12.5, height: 2.2, depth: 0.38, material: wallMaterial });
  backWall.object.position.set(0, 1.1, -5.3);
  addModule(courtyard, collision, backWall);

  const leftWall = createWallModule({ width: 5.2, height: 1.45, depth: 0.34, material: wallMaterial });
  leftWall.object.position.set(-6.3, 0.72, -0.5);
  leftWall.object.rotation.y = Math.PI * 0.5;
  addModule(courtyard, collision, leftWall);

  const rightWall = createWallModule({ width: 5.2, height: 1.45, depth: 0.34, material: wallMaterial });
  rightWall.object.position.set(6.3, 0.72, -0.5);
  rightWall.object.rotation.y = Math.PI * 0.5;
  addModule(courtyard, collision, rightWall);
}

function addColumnRows(courtyard: THREE.Group, collision: CollisionProxy[]): void {
  for (let index = 0; index < 4; index += 1) {
    const x = -4.2 + index * 2.8;
    const frontColumn = createColumnModule({ height: 1.75, radius: 0.18 });
    frontColumn.object.position.set(x, 0, -2.65);
    addModule(courtyard, collision, frontColumn);

    const rearColumn = createColumnModule({ height: 1.45, radius: 0.16 });
    rearColumn.object.position.set(x, 0, -4.45);
    addModule(courtyard, collision, rearColumn);
  }
}

function addGate(courtyard: THREE.Group, collision: CollisionProxy[]): void {
  const gate = createGateModule({ width: 2.4, height: 2.5, depth: 0.48, material: createFlatMaterial("sandstone.base") });
  gate.object.position.set(0, 0, -5.02);
  addModule(courtyard, collision, gate);
}

function addProps(courtyard: THREE.Group, collision: CollisionProxy[]): void {
  const propPlacements: Array<[ReturnType<typeof createPropModule>, number, number, number]> = [
    [createPropModule({ kind: "lamp" }), -4.9, 0, -3.7],
    [createPropModule({ kind: "lamp" }), 4.9, 0, -3.7],
    [createPropModule({ kind: "planter" }), -5.1, 0, 2.8],
    [createPropModule({ kind: "planter" }), 5.1, 0, 2.8],
    [createPropModule({ kind: "crate" }), -2.8, 0, 3.8],
  ];

  for (const [module, x, y, z] of propPlacements) {
    module.object.position.set(x, y, z);
    addModule(courtyard, collision, module);
  }
}

function addNature(courtyard: THREE.Group, collision: CollisionProxy[]): void {
  const treeLeft = createTreeModule({ scale: 0.82 });
  treeLeft.object.position.set(-5.3, 0, 0.8);
  addModule(courtyard, collision, treeLeft);

  const treeRight = createTreeModule({ scale: 0.72 });
  treeRight.object.position.set(5.2, 0, 0.9);
  addModule(courtyard, collision, treeRight);

  const shrubLeft = createShrubModule();
  shrubLeft.object.position.set(-4.4, 0, 1.65);
  addModule(courtyard, collision, shrubLeft);

  const shrubRight = createShrubModule();
  shrubRight.object.position.set(4.35, 0, 1.55);
  addModule(courtyard, collision, shrubRight);

  const rock = createRockModule({ scale: 0.82, material: createFlatMaterial("sandstone.shadow") });
  rock.object.position.set(3.3, 0, 3.35);
  addModule(courtyard, collision, rock);
}

function addCharacter(courtyard: THREE.Group): void {
  const rama = createRamaStandInCharacter({
    primarySwap: AYODHYA_PALETTE.saffron.base,
    secondarySwap: AYODHYA_PALETTE.gold.base,
    skinSwap: AYODHYA_PALETTE.skin.hero,
  });

  rama.object.position.set(0, 0, 0.9);
  rama.object.rotation.y = Math.PI;
  courtyard.add(rama.object);
}

function addModule(courtyard: THREE.Group, collision: CollisionProxy[], module: { object: THREE.Object3D; collision: CollisionProxy[] }): void {
  courtyard.add(module.object);
  collision.push(...module.collision);
}
