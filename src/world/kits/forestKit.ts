import * as THREE from "three";

import { createForestMaterial } from "../../render/forestPalette";
import type { KitModule } from "./proceduralKit";

export interface ForestFloorOptions {
  width: number;
  depth: number;
}

export interface ForestTreeOptions {
  scale?: number;
}

export function createForestFloorModule(options: ForestFloorOptions): KitModule {
  const floor = new THREE.Mesh(new THREE.BoxGeometry(options.width, 0.16, options.depth), createForestMaterial("earth.path"));
  floor.name = "forest-floor-path";
  floor.position.y = -0.08;
  floor.receiveShadow = true;

  return {
    object: floor,
    collision: [
      {
        id: "forest-floor-path-collision",
        shape: "box",
        position: [0, -0.08, 0],
        size: [options.width, 0.16, options.depth],
        blocksMovement: false,
      },
    ],
  };
}

export function createDenseForestTreeModule(options: ForestTreeOptions = {}): KitModule {
  const scale = options.scale ?? 1;
  const tree = new THREE.Group();
  tree.name = "forest-dense-tree";

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * scale, 0.22 * scale, 1.55 * scale, 6), createForestMaterial("bark.base"));
  const lower = new THREE.Mesh(new THREE.ConeGeometry(0.82 * scale, 1.25 * scale, 7), createForestMaterial("canopy.deep"));
  const upper = new THREE.Mesh(new THREE.ConeGeometry(0.62 * scale, 1.05 * scale, 7), createForestMaterial("canopy.light"));
  trunk.position.y = 0.78 * scale;
  lower.position.y = 1.55 * scale;
  upper.position.y = 2.18 * scale;
  tree.add(trunk, lower, upper);
  markShadowed(tree);

  return {
    object: tree,
    collision: [
      {
        id: "forest-dense-tree-trunk-collision",
        shape: "cylinder",
        position: [0, 0.78 * scale, 0],
        size: [0.24 * scale, 1.55 * scale, 0.24 * scale],
      },
    ],
  };
}

export function createForestRockModule(scale = 1): KitModule {
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 * scale, 0), createForestMaterial("earth.shadow"));
  rock.name = "forest-rock-cliff";
  rock.position.y = 0.28 * scale;
  rock.scale.set(1.35, 0.72, 1);
  rock.castShadow = true;
  rock.receiveShadow = true;

  return {
    object: rock,
    collision: [
      {
        id: "forest-rock-cliff-collision",
        shape: "box",
        position: [0, 0.28 * scale, 0],
        size: [1.1 * scale, 0.56 * scale, 0.92 * scale],
      },
    ],
  };
}

export function createHermitageHutModule(): KitModule {
  const hut = new THREE.Group();
  hut.name = "forest-hermitage-hut";

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.18, 1.55), createForestMaterial("bark.base"));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.45, 0.95, 4), createForestMaterial("hut.thatch"));
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.82, 0.06), createForestMaterial("earth.shadow"));
  body.position.y = 0.59;
  roof.position.y = 1.52;
  roof.rotation.y = Math.PI * 0.25;
  door.position.set(0, 0.45, -0.81);
  hut.add(body, roof, door);
  markShadowed(hut);

  return {
    object: hut,
    collision: [
      {
        id: "forest-hermitage-hut-collision",
        shape: "box",
        position: [0, 0.58, 0],
        size: [2.05, 1.16, 1.6],
      },
    ],
  };
}

export function createCampfireModule(): KitModule {
  const campfire = new THREE.Group();
  campfire.name = "forest-campfire";

  for (let index = 0; index < 3; index += 1) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.85, 6), createForestMaterial("bark.base"));
    log.position.y = 0.09;
    log.rotation.z = Math.PI * 0.5;
    log.rotation.y = index * (Math.PI / 3);
    campfire.add(log);
  }

  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.54, 5), createForestMaterial("fire.base"));
  flame.position.y = 0.42;
  campfire.add(flame);
  markShadowed(campfire);

  return {
    object: campfire,
    collision: [
      {
        id: "forest-campfire-trigger-collision",
        shape: "cylinder",
        position: [0, 0.2, 0],
        size: [0.45, 0.4, 0.45],
      },
    ],
  };
}

export function createPathMarkerModule(): KitModule {
  const marker = new THREE.Group();
  marker.name = "forest-path-marker";
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.92, 5), createForestMaterial("bark.base"));
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.04), createForestMaterial("mist.base"));
  post.position.y = 0.46;
  cloth.position.set(0.22, 0.78, 0);
  marker.add(post, cloth);
  markShadowed(marker);

  return {
    object: marker,
    collision: [],
  };
}

function markShadowed(object: THREE.Object3D): void {
  object.traverse((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
  });
}
