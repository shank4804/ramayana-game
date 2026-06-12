import * as THREE from "three";

import { createFlatMaterial } from "../../render/palette";

export interface CollisionProxy {
  id: string;
  shape: "box" | "cylinder" | "sphere";
  position: THREE.Vector3Tuple;
  size: THREE.Vector3Tuple;
}

export interface KitModule {
  object: THREE.Object3D;
  collision: CollisionProxy[];
}

export interface FloorModuleOptions {
  width: number;
  depth: number;
  material?: THREE.Material;
}

export interface WallModuleOptions {
  width: number;
  height: number;
  depth: number;
  material?: THREE.Material;
}

export interface PropModuleOptions {
  kind: "lamp" | "planter" | "crate";
  material?: THREE.Material;
}

export function createFloorModule(options: FloorModuleOptions): KitModule {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(options.width, 0.18, options.depth),
    options.material ?? createFlatMaterial("sandstone.light"),
  );

  floor.name = "kit-floor-sandstone";
  floor.receiveShadow = true;
  floor.position.y = -0.09;

  return {
    object: floor,
    collision: [
      {
        id: `${floor.name}-collision`,
        shape: "box",
        position: [0, -0.09, 0],
        size: [options.width, 0.18, options.depth],
      },
    ],
  };
}

export function createWallModule(options: WallModuleOptions): KitModule {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(options.width, options.height, options.depth),
    options.material ?? createFlatMaterial("sandstone.base"),
  );

  wall.name = "kit-wall-sandstone";
  wall.castShadow = true;
  wall.receiveShadow = true;
  wall.position.y = options.height * 0.5;

  return {
    object: wall,
    collision: [
      {
        id: `${wall.name}-collision`,
        shape: "box",
        position: [0, options.height * 0.5, 0],
        size: [options.width, options.height, options.depth],
      },
    ],
  };
}

export function createPropModule(options: PropModuleOptions): KitModule {
  if (options.kind === "lamp") {
    return createLampProp(options.material);
  }

  if (options.kind === "planter") {
    return createPlanterProp(options.material);
  }

  return createCrateProp(options.material);
}

function createLampProp(material = createFlatMaterial("gold.base", { metalness: 0.08 })): KitModule {
  const lamp = new THREE.Group();
  lamp.name = "kit-prop-lamp";

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.12, 6), material);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.65, 6), material);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.12, 0.16, 6), material);
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.24, 5),
    createFlatMaterial("saffron.base", { roughness: 0.5 }),
  );

  base.position.y = 0.06;
  stem.position.y = 0.43;
  bowl.position.y = 0.82;
  flame.position.y = 1.02;

  lamp.add(base, stem, bowl, flame);
  lamp.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return {
    object: lamp,
    collision: [
      {
        id: "kit-prop-lamp-collision",
        shape: "cylinder",
        position: [0, 0.46, 0],
        size: [0.24, 0.92, 0.24],
      },
    ],
  };
}

function createPlanterProp(material = createFlatMaterial("earth.base")): KitModule {
  const planter = new THREE.Group();
  planter.name = "kit-prop-planter";

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.28, 0.44, 7), material);
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), createFlatMaterial("foliage.base"));
  pot.position.y = 0.22;
  leaves.position.y = 0.64;
  leaves.scale.set(1.2, 0.7, 1);
  planter.add(pot, leaves);

  planter.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return {
    object: planter,
    collision: [
      {
        id: "kit-prop-planter-collision",
        shape: "cylinder",
        position: [0, 0.32, 0],
        size: [0.42, 0.64, 0.42],
      },
    ],
  };
}

function createCrateProp(material = createFlatMaterial("earth.base")): KitModule {
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.5, 0.72), material);
  crate.name = "kit-prop-crate";
  crate.position.y = 0.25;
  crate.castShadow = true;
  crate.receiveShadow = true;

  return {
    object: crate,
    collision: [
      {
        id: "kit-prop-crate-collision",
        shape: "box",
        position: [0, 0.25, 0],
        size: [0.72, 0.5, 0.72],
      },
    ],
  };
}
