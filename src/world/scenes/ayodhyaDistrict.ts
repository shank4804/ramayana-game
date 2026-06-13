import * as THREE from "three";

import { createRamaStandInCharacter } from "../../assets/characters/ramaStandIn";
import { AYODHYA_PALETTE, createFlatMaterial } from "../../render/palette";
import {
  createColumnModule,
  createFloorModule,
  createGateModule,
  createPalaceFacadeModule,
  createPropModule,
  createRampModule,
  createStairsModule,
  createTreeModule,
  createWallModule,
  type CollisionProxy,
  type KitModule,
} from "../kits/proceduralKit";

export type AyodhyaInteractionKind = "mainQuest" | "sideQuest" | "storyGate";

export interface AyodhyaInteraction {
  id: "dasharathaBlessing" | "marketLamps" | "eastGate" | "westGate";
  kind: AyodhyaInteractionKind;
  label: string;
  prompt: string;
  position: THREE.Vector3Tuple;
  radius: number;
}

export interface AyodhyaDistrictScene {
  object: THREE.Group;
  collision: CollisionProxy[];
  player: THREE.Object3D;
  interactions: AyodhyaInteraction[];
  npcs: THREE.Object3D[];
}

export function createAyodhyaDistrict(): AyodhyaDistrictScene {
  const district = new THREE.Group();
  district.name = "ayodhya-vertical-slice-district";
  const collision: CollisionProxy[] = [];

  addModule(district, collision, createFloorModule({ width: 34, depth: 28, material: createFlatMaterial("sandstone.light") }));
  addPalaceQuarter(district, collision);
  addCityWallsAndGates(district, collision);
  addContainmentCollision(collision);
  addStreetGrid(district, collision);
  addMarket(district, collision);
  addFoliageAndAmbientLife(district, collision);

  const npcs = addNpcs(district);
  const player = addPlayer(district);

  return {
    object: district,
    collision,
    player,
    interactions: createInteractions(),
    npcs,
  };
}

function addPalaceQuarter(district: THREE.Group, collision: CollisionProxy[]): void {
  const palace = createPalaceFacadeModule({ width: 9.5, height: 3.1, depth: 2.0, material: createFlatMaterial("sandstone.base") });
  palace.object.position.set(0, 0, -11.1);
  addModule(district, collision, palace);

  const stairs = createStairsModule({ width: 4.4, height: 0.5, depth: 2.2, steps: 4 });
  stairs.object.position.set(0, 0, -8.95);
  addModule(district, collision, stairs);

  const courtArch = createGateModule({ width: 3.2, height: 2.8, depth: 0.46, material: createFlatMaterial("cream.base") });
  courtArch.object.position.set(0, 0, -7.4);
  addModule(district, collision, courtArch);

  for (let index = 0; index < 6; index += 1) {
    const x = -6.2 + index * 2.48;
    const column = createColumnModule({ height: 2.2, radius: 0.18, material: createFlatMaterial("cream.base") });
    column.object.position.set(x, 0, -8.1);
    addModule(district, collision, column);
  }
}

function addCityWallsAndGates(district: THREE.Group, collision: CollisionProxy[]): void {
  const wallMaterial = createFlatMaterial("sandstone.base");
  const wallPlacements: Array<[number, number, number, number, number, number]> = [
    [13.7, 1.25, 0, 0.65, 2.5, 20],
    [-13.7, 1.25, 0, 0.65, 2.5, 20],
    [0, 1.25, 12.8, 24, 2.5, 0.65],
    [0, 1.25, -13.0, 24, 2.5, 0.65],
  ];

  for (const [x, y, z, width, height, depth] of wallPlacements) {
    const wall = createWallModule({ width, height, depth, material: wallMaterial });
    wall.object.position.set(x, y - height * 0.5, z);
    addModule(district, collision, wall);
  }

  const eastGate = createGateModule({ width: 2.6, height: 2.8, depth: 0.62, material: wallMaterial });
  eastGate.object.position.set(13.2, 0, 4.6);
  eastGate.object.rotation.y = Math.PI * 0.5;
  addModule(district, collision, eastGate);
  collision.push({
    id: "story-gate-east-solid-blocker",
    shape: "box",
    position: [13.55, 1.1, 4.6],
    size: [0.86, 2.2, 3.2],
  });

  const westGate = createGateModule({ width: 2.6, height: 2.8, depth: 0.62, material: wallMaterial });
  westGate.object.position.set(-13.2, 0, -1.6);
  westGate.object.rotation.y = Math.PI * 0.5;
  addModule(district, collision, westGate);
  collision.push({
    id: "story-gate-west-solid-blocker",
    shape: "box",
    position: [-13.55, 1.1, -1.6],
    size: [0.86, 2.2, 3.2],
  });
}

function addContainmentCollision(collision: CollisionProxy[]): void {
  const halfWidth = 16.7;
  const halfDepth = 13.7;
  const thickness = 0.78;
  const height = 2.8;

  collision.push(
    {
      id: "district-boundary-east",
      shape: "box",
      position: [halfWidth, height * 0.5, 0],
      size: [thickness, height, halfDepth * 2],
    },
    {
      id: "district-boundary-west",
      shape: "box",
      position: [-halfWidth, height * 0.5, 0],
      size: [thickness, height, halfDepth * 2],
    },
    {
      id: "district-boundary-north",
      shape: "box",
      position: [0, height * 0.5, halfDepth],
      size: [halfWidth * 2, height, thickness],
    },
    {
      id: "district-boundary-south",
      shape: "box",
      position: [0, height * 0.5, -halfDepth],
      size: [halfWidth * 2, height, thickness],
    },
  );
}

function addStreetGrid(district: THREE.Group, collision: CollisionProxy[]): void {
  for (const x of [-4.8, 4.8]) {
    const ramp = createRampModule({ width: 2.6, height: 0.22, depth: 3.2, material: createFlatMaterial("sandstone.shadow") });
    ramp.object.position.set(x, 0, -4.5);
    addModule(district, collision, ramp);
  }

  const dividerPlacements: Array<[number, number, number, number]> = [
    [-7.2, -2.2, 5.8, 0.28],
    [7.2, -2.2, 5.8, 0.28],
    [-3.4, 5.4, 0.28, 7.8],
    [3.4, 5.4, 0.28, 7.8],
  ];

  for (const [x, z, width, depth] of dividerPlacements) {
    const planterWall = createWallModule({ width, height: 0.52, depth, material: createFlatMaterial("sandstone.shadow") });
    planterWall.object.position.set(x, 0, z);
    addModule(district, collision, planterWall);
  }
}

function addMarket(district: THREE.Group, collision: CollisionProxy[]): void {
  const placements: Array<[number, number, number]> = [
    [-8.4, 0, 3.2],
    [-8.2, 0, 6.0],
    [8.1, 0, 3.4],
    [8.4, 0, 6.2],
  ];

  for (const [x, y, z] of placements) {
    const stall = createPropModule({ kind: "marketStall" });
    stall.object.position.set(x, y, z);
    stall.object.rotation.y = x < 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
    addModule(district, collision, stall);
  }

  const props: Array<[ReturnType<typeof createPropModule>, number, number, number, number]> = [
    [createPropModule({ kind: "lamp" }), -6.1, 0, 3.0, 0],
    [createPropModule({ kind: "lamp" }), -6.1, 0, 6.6, 0],
    [createPropModule({ kind: "lamp" }), 6.1, 0, 3.0, 0],
    [createPropModule({ kind: "lamp" }), 6.1, 0, 6.6, 0],
    [createPropModule({ kind: "bench" }), 0, 0, 5.4, 0],
    [createPropModule({ kind: "crate" }), -9.6, 0, 1.9, 0.2],
    [createPropModule({ kind: "crate" }), 9.6, 0, 7.6, -0.18],
  ];

  for (const [prop, x, y, z, rotationY] of props) {
    prop.object.position.set(x, y, z);
    prop.object.rotation.y = rotationY;
    addModule(district, collision, prop);
  }
}

function addFoliageAndAmbientLife(district: THREE.Group, collision: CollisionProxy[]): void {
  const trees: Array<[number, number, number, number]> = [
    [-10.8, 0, -8.1, 0.9],
    [10.6, 0, -8.3, 0.86],
    [-11.2, 0, 10.2, 0.72],
    [11.1, 0, 10.0, 0.76],
  ];

  for (const [x, y, z, scale] of trees) {
    const tree = createTreeModule({ scale });
    tree.object.position.set(x, y, z);
    addModule(district, collision, tree);
  }

  for (const [x, z] of [
    [-4.1, -3.0],
    [4.2, -3.0],
    [-5.4, 9.4],
    [5.2, 9.4],
  ] as const) {
    const planter = createPropModule({ kind: "planter" });
    planter.object.position.set(x, 0, z);
    addModule(district, collision, planter);
  }
}

function addNpcs(district: THREE.Group): THREE.Object3D[] {
  const dasharatha = createRamaStandInCharacter({
    primarySwap: AYODHYA_PALETTE.teal.base,
    secondarySwap: AYODHYA_PALETTE.gold.base,
    skinSwap: "#a4664a",
  }).object;
  dasharatha.name = "dasharatha-stand-in";
  dasharatha.position.set(0, 0, -6.6);
  dasharatha.rotation.y = 0;
  dasharatha.scale.set(1.08, 1.08, 1.08);

  const vendorLeft = createRamaStandInCharacter({
    primarySwap: AYODHYA_PALETTE.cream.base,
    secondarySwap: AYODHYA_PALETTE.teal.base,
    skinSwap: "#9d6447",
  }).object;
  vendorLeft.name = "ayodhya-market-vendor-left";
  vendorLeft.position.set(-7.2, 0, 4.4);
  vendorLeft.rotation.y = Math.PI * 0.55;
  vendorLeft.scale.set(0.88, 0.88, 0.88);

  const vendorRight = createRamaStandInCharacter({
    primarySwap: AYODHYA_PALETTE.saffron.base,
    secondarySwap: AYODHYA_PALETTE.cream.base,
    skinSwap: "#a86f50",
  }).object;
  vendorRight.name = "ayodhya-market-vendor-right";
  vendorRight.position.set(7.3, 0, 5.0);
  vendorRight.rotation.y = -Math.PI * 0.55;
  vendorRight.scale.set(0.88, 0.88, 0.88);

  district.add(dasharatha, vendorLeft, vendorRight);
  return [dasharatha, vendorLeft, vendorRight];
}

function addPlayer(district: THREE.Group): THREE.Object3D {
  const rama = createRamaStandInCharacter({
    primarySwap: AYODHYA_PALETTE.saffron.base,
    secondarySwap: AYODHYA_PALETTE.gold.base,
    skinSwap: AYODHYA_PALETTE.skin.hero,
  });

  rama.object.position.set(0, 0, 1.6);
  rama.object.rotation.y = Math.PI;
  district.add(rama.object);
  return rama.object;
}

function createInteractions(): AyodhyaInteraction[] {
  return [
    {
      id: "dasharathaBlessing",
      kind: "mainQuest",
      label: "Dasharatha",
      prompt: "Press E to receive Dasharatha's blessing",
      position: [0, 0, -6.6],
      radius: 1.65,
    },
    {
      id: "marketLamps",
      kind: "sideQuest",
      label: "Market lamps",
      prompt: "Press E to light the market lamps",
      position: [-6.1, 0, 4.8],
      radius: 1.8,
    },
    {
      id: "eastGate",
      kind: "storyGate",
      label: "East city gate",
      prompt: "The guard keeps the east gate closed until the exile summons",
      position: [12.4, 0, 4.6],
      radius: 2.1,
    },
    {
      id: "westGate",
      kind: "storyGate",
      label: "West city gate",
      prompt: "The palace watch keeps Rama within Ayodhya for now",
      position: [-12.4, 0, -1.6],
      radius: 2.1,
    },
  ];
}

function addModule(district: THREE.Group, collision: CollisionProxy[], module: KitModule): void {
  district.add(module.object);
  collision.push(...module.collision.map((proxy) => transformCollisionProxy(proxy, module.object)));
}

function transformCollisionProxy(proxy: CollisionProxy, object: THREE.Object3D): CollisionProxy {
  const yaw = object.rotation.y;
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const [localX, localY, localZ] = proxy.position;
  const [width, height, depth] = proxy.size;
  const worldX = object.position.x + localX * cos + localZ * sin;
  const worldZ = object.position.z - localX * sin + localZ * cos;
  const worldWidth = Math.abs(width * cos) + Math.abs(depth * sin);
  const worldDepth = Math.abs(width * sin) + Math.abs(depth * cos);

  return {
    ...proxy,
    position: [worldX, object.position.y + localY, worldZ],
    size: [worldWidth, height, worldDepth],
  };
}
