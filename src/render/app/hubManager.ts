import * as THREE from "three";

import type { DebugFlags } from "../../diagnostics/debugFlags";
import { FOREST_EXILE_PALETTE } from "../forestPalette";
import { AYODHYA_PALETTE, createFlatMaterial, type ShaderPaletteSource } from "../palette";
import { createGradientSky } from "../sky/gradientSky";
import type { CollisionProxy } from "../../world/kits/proceduralKit";
import { createFloorModule, createPropModule, createWallModule } from "../../world/kits/proceduralKit";
import { createAyodhyaDistrict, type AyodhyaInteraction } from "../../world/scenes/ayodhyaDistrict";
import { createForestExileHub, type ForestStoryGate } from "../../world/scenes/forestExile";

export type WorldHubId = "ayodhya" | "forestExile";

export interface WorldHubLoadOptions {
  spawnPosition?: THREE.Vector3Tuple;
  yaw?: number;
}

export interface LoadedWorldHub {
  id: WorldHubId;
  object: THREE.Group;
  player: THREE.Object3D;
  collision: CollisionProxy[];
  ayodhyaInteractions: AyodhyaInteraction[];
  forestStoryGates: ForestStoryGate[];
  debugObjects: THREE.Object3D[];
  palette: ShaderPaletteSource;
}

export interface WorldHubManager {
  readonly active: LoadedWorldHub;
  loadHub(id: WorldHubId, options?: WorldHubLoadOptions): LoadedWorldHub;
  dispose(): void;
}

export function createWorldHubManager(scene: THREE.Scene, debugFlags: DebugFlags): WorldHubManager {
  let active: LoadedWorldHub | null = null;

  function loadHub(id: WorldHubId, options: WorldHubLoadOptions = {}): LoadedWorldHub {
    if (active) {
      scene.remove(active.object);
      disposeObjectTree(active.object);
      active = null;
    }

    const loaded = id === "forestExile" ? createForestHub(options) : createAyodhyaHub(debugFlags, options);
    scene.add(loaded.object);
    applyEnvironment(scene, loaded);
    active = loaded;
    return loaded;
  }

  return {
    get active() {
      if (!active) {
        throw new Error("World hub manager has no active hub.");
      }

      return active;
    },
    loadHub,
    dispose() {
      if (!active) {
        return;
      }

      scene.remove(active.object);
      disposeObjectTree(active.object);
      active = null;
    },
  };
}

function createAyodhyaHub(debugFlags: DebugFlags, options: WorldHubLoadOptions): LoadedWorldHub {
  const root = new THREE.Group();
  root.name = "hub-ayodhya-root";
  const district = createAyodhyaDistrict();
  const validationMesh = debugFlags.showPrimitiveValidationScene ? createDevValidationMesh() : null;

  root.add(createGradientSky(AYODHYA_PALETTE));
  root.add(createAyodhyaAmbientLight());
  root.add(createAyodhyaSunLight());
  root.add(district.object);

  if (validationMesh) {
    root.add(validationMesh);
  }

  applySpawn(district.player, options);

  return {
    id: "ayodhya",
    object: root,
    player: district.player,
    collision: district.collision,
    ayodhyaInteractions: district.interactions,
    forestStoryGates: [],
    debugObjects: validationMesh ? [validationMesh] : [],
    palette: AYODHYA_PALETTE,
  };
}

function createForestHub(options: WorldHubLoadOptions): LoadedWorldHub {
  const root = new THREE.Group();
  root.name = "hub-forest-exile-root";
  const forest = createForestExileHub();

  root.add(createGradientSky(FOREST_EXILE_PALETTE));
  root.add(createForestAmbientLight());
  root.add(createForestSunLight());
  root.add(forest.object);
  applySpawn(forest.player, {
    spawnPosition: options.spawnPosition ?? forest.spawn,
    yaw: options.yaw ?? 0,
  });

  return {
    id: "forestExile",
    object: root,
    player: forest.player,
    collision: forest.collision,
    ayodhyaInteractions: [],
    forestStoryGates: forest.storyGates,
    debugObjects: [],
    palette: FOREST_EXILE_PALETTE,
  };
}

function applyEnvironment(scene: THREE.Scene, hub: LoadedWorldHub): void {
  if (hub.id === "forestExile") {
    scene.background = new THREE.Color(FOREST_EXILE_PALETTE.sky.horizon);
    scene.fog = new THREE.Fog(FOREST_EXILE_PALETTE.fog, 14, 48);
    return;
  }

  scene.background = new THREE.Color(AYODHYA_PALETTE.sky.horizon);
  scene.fog = new THREE.Fog(AYODHYA_PALETTE.fog, 18, 58);
}

function applySpawn(player: THREE.Object3D, options: WorldHubLoadOptions): void {
  if (options.spawnPosition) {
    player.position.fromArray(options.spawnPosition);
  }

  if (typeof options.yaw === "number") {
    player.rotation.y = options.yaw;
  }
}

function createAyodhyaAmbientLight(): THREE.HemisphereLight {
  return new THREE.HemisphereLight(AYODHYA_PALETTE.cream.base, AYODHYA_PALETTE.earth.base, 1.25);
}

function createAyodhyaSunLight(): THREE.DirectionalLight {
  const sun = new THREE.DirectionalLight(AYODHYA_PALETTE.cream.base, 2.6);
  sun.position.set(6, 9, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 36;
  return sun;
}

function createForestAmbientLight(): THREE.HemisphereLight {
  return new THREE.HemisphereLight(FOREST_EXILE_PALETTE.colors["mist.base"], FOREST_EXILE_PALETTE.colors["earth.shadow"], 1.05);
}

function createForestSunLight(): THREE.DirectionalLight {
  const sun = new THREE.DirectionalLight(FOREST_EXILE_PALETTE.colors["hut.thatch"], 2.1);
  sun.position.set(-4, 8, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 34;
  return sun;
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

function disposeObjectTree(root: THREE.Object3D): void {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();

    if (Array.isArray(mesh.material)) {
      for (const material of mesh.material) {
        material.dispose();
      }
      return;
    }

    mesh.material?.dispose();
  });
}
