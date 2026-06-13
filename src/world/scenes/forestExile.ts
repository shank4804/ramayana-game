import * as THREE from "three";

import { createRamaStandInCharacter } from "../../assets/characters/ramaStandIn";
import { FOREST_EXILE_PALETTE } from "../../render/forestPalette";
import {
  createCampfireModule,
  createDenseForestTreeModule,
  createForestFloorModule,
  createForestRockModule,
  createHermitageHutModule,
  createPathMarkerModule,
} from "../kits/forestKit";
import type { CollisionProxy, KitModule } from "../kits/proceduralKit";

export interface ForestStoryGate {
  id: "ayodhyaReturn" | "deeperForest";
  label: string;
  requiredStoryFlag: "exileAccepted" | "sageBlessing";
  position: THREE.Vector3Tuple;
  radius: number;
}

export interface ForestExileScene {
  object: THREE.Group;
  collision: CollisionProxy[];
  spawn: THREE.Vector3Tuple;
  storyGates: ForestStoryGate[];
  sideQuests: Array<{
    id: "gatherFirewood";
    title: string;
    giver: "forestHermit";
  }>;
}

export function createForestExileHub(): ForestExileScene {
  const hub = new THREE.Group();
  hub.name = "forest-exile-hub";
  const collision: CollisionProxy[] = [];

  addModule(hub, collision, createForestFloorModule({ width: 28, depth: 24 }));
  addHermitageCamp(hub, collision);
  addForestRing(hub, collision);
  addPathMarkers(hub, collision);
  addCharacters(hub);
  addContainment(collision);

  return {
    object: hub,
    collision,
    spawn: [0, 0, -5.2],
    storyGates: [
      {
        id: "ayodhyaReturn",
        label: "Road back to Ayodhya",
        requiredStoryFlag: "exileAccepted",
        position: [0, 0, -10.8],
        radius: 2.2,
      },
      {
        id: "deeperForest",
        label: "Deeper forest path",
        requiredStoryFlag: "sageBlessing",
        position: [0, 0, 10.7],
        radius: 2.4,
      },
    ],
    sideQuests: [
      {
        id: "gatherFirewood",
        title: "Gather Firewood",
        giver: "forestHermit",
      },
    ],
  };
}

function addHermitageCamp(hub: THREE.Group, collision: CollisionProxy[]): void {
  const hut = createHermitageHutModule();
  hut.object.position.set(-4.2, 0, 2.4);
  hut.object.rotation.y = -0.24;
  addModule(hub, collision, hut);

  const campfire = createCampfireModule();
  campfire.object.position.set(-1.1, 0, 1.8);
  addModule(hub, collision, campfire);

  const water = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.04, 2.2), new THREE.MeshStandardMaterial({
    color: FOREST_EXILE_PALETTE.colors["water.base"],
    flatShading: true,
    roughness: 0.78,
    metalness: 0,
  }));
  water.name = "forest-river-plane";
  water.position.set(5.1, 0.01, -3.1);
  hub.add(water);
}

function addForestRing(hub: THREE.Group, collision: CollisionProxy[]): void {
  const trees: Array<[number, number, number]> = [
    [-10.2, -7.2, 1.05],
    [-7.6, -9.4, 0.92],
    [-11.4, 3.8, 1.18],
    [-7.8, 8.2, 0.98],
    [9.4, -7.5, 1.08],
    [11.1, -1.4, 0.96],
    [8.7, 8.2, 1.16],
    [3.4, 9.5, 0.86],
  ];

  for (const [x, z, scale] of trees) {
    const tree = createDenseForestTreeModule({ scale });
    tree.object.position.set(x, 0, z);
    addModule(hub, collision, tree);
  }

  for (const [x, z, scale] of [
    [-5.9, -5.7, 1],
    [5.9, 5.2, 1.2],
    [9.6, 2.4, 0.9],
  ] as const) {
    const rock = createForestRockModule(scale);
    rock.object.position.set(x, 0, z);
    addModule(hub, collision, rock);
  }
}

function addPathMarkers(hub: THREE.Group, collision: CollisionProxy[]): void {
  for (const [x, z, rotation] of [
    [-1.6, -8.2, 0.2],
    [1.8, -8.1, -0.12],
    [-1.5, 8.6, -0.18],
    [1.7, 8.7, 0.16],
  ] as const) {
    const marker = createPathMarkerModule();
    marker.object.position.set(x, 0, z);
    marker.object.rotation.y = rotation;
    addModule(hub, collision, marker);
  }
}

function addCharacters(hub: THREE.Group): void {
  const rama = createRamaStandInCharacter({
    primarySwap: "#c98236",
    secondarySwap: "#d6b15f",
    skinSwap: "#b8744d",
  }).object;
  rama.name = "forest-rama";
  rama.position.set(0, 0, -5.2);
  rama.rotation.y = 0;

  const lakshmana = createRamaStandInCharacter({
    primarySwap: "#4f8a72",
    secondarySwap: "#d6b15f",
    skinSwap: "#ad704d",
  }).object;
  lakshmana.name = "lakshmana-forest-companion";
  lakshmana.position.set(1.2, 0, -4.6);
  lakshmana.rotation.y = -0.16;
  lakshmana.scale.set(0.96, 0.96, 0.96);

  hub.add(rama, lakshmana);
}

function addContainment(collision: CollisionProxy[]): void {
  collision.push(
    {
      id: "forest-boundary-west",
      shape: "box",
      position: [-13.6, 1.4, 0],
      size: [0.8, 2.8, 24],
    },
    {
      id: "forest-boundary-east",
      shape: "box",
      position: [13.6, 1.4, 0],
      size: [0.8, 2.8, 24],
    },
    {
      id: "forest-boundary-north",
      shape: "box",
      position: [0, 1.4, 11.8],
      size: [28, 2.8, 0.8],
    },
    {
      id: "forest-boundary-south",
      shape: "box",
      position: [0, 1.4, -11.8],
      size: [28, 2.8, 0.8],
    },
  );
}

function addModule(hub: THREE.Group, collision: CollisionProxy[], module: KitModule): void {
  hub.add(module.object);
  collision.push(
    ...module.collision.map((proxy) => ({
      ...proxy,
      position: [
        proxy.position[0] + module.object.position.x,
        proxy.position[1] + module.object.position.y,
        proxy.position[2] + module.object.position.z,
      ] satisfies THREE.Vector3Tuple,
    })),
  );
}
