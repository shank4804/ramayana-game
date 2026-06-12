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

export interface ColumnModuleOptions {
  height: number;
  radius?: number;
  material?: THREE.Material;
}

export interface ArchModuleOptions {
  width: number;
  height: number;
  depth: number;
  material?: THREE.Material;
}

export interface PropModuleOptions {
  kind: "lamp" | "planter" | "crate";
  material?: THREE.Material;
}

export interface NatureModuleOptions {
  material?: THREE.Material;
  scale?: number;
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

export function createColumnModule(options: ColumnModuleOptions): KitModule {
  const radius = options.radius ?? 0.22;
  const material = options.material ?? createFlatMaterial("sandstone.light");
  const column = new THREE.Group();
  column.name = "kit-column-sandstone";

  const base = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.35, radius * 1.45, 0.22, 8), material);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.08, options.height, 8), material);
  const capital = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.5, radius * 1.25, 0.28, 8), material);
  base.position.y = 0.11;
  shaft.position.y = 0.22 + options.height * 0.5;
  capital.position.y = 0.22 + options.height + 0.14;
  column.add(base, shaft, capital);

  markShadowed(column);

  return {
    object: column,
    collision: [
      {
        id: "kit-column-sandstone-collision",
        shape: "cylinder",
        position: [0, options.height * 0.5, 0],
        size: [radius * 1.45, options.height + 0.5, radius * 1.45],
      },
    ],
  };
}

export function createArchModule(options: ArchModuleOptions): KitModule {
  const material = options.material ?? createFlatMaterial("sandstone.base");
  const arch = new THREE.Group();
  arch.name = "kit-arch-sandstone";

  const pillarWidth = Math.max(0.25, options.width * 0.16);
  const lintelHeight = Math.max(0.24, options.height * 0.18);
  const left = new THREE.Mesh(new THREE.BoxGeometry(pillarWidth, options.height, options.depth), material);
  const right = new THREE.Mesh(new THREE.BoxGeometry(pillarWidth, options.height, options.depth), material);
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(options.width, lintelHeight, options.depth), material);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(options.width * 0.52, options.width * 0.52, options.depth, 12), material);

  left.position.set(-options.width * 0.5 + pillarWidth * 0.5, options.height * 0.5, 0);
  right.position.set(options.width * 0.5 - pillarWidth * 0.5, options.height * 0.5, 0);
  lintel.position.set(0, options.height - lintelHeight * 0.5, 0);
  crown.position.set(0, options.height - lintelHeight, 0);
  crown.rotation.z = Math.PI * 0.5;
  crown.scale.y = 0.16;
  arch.add(left, right, crown, lintel);

  markShadowed(arch);

  return {
    object: arch,
    collision: [
      {
        id: "kit-arch-left-collision",
        shape: "box",
        position: [left.position.x, options.height * 0.5, 0],
        size: [pillarWidth, options.height, options.depth],
      },
      {
        id: "kit-arch-right-collision",
        shape: "box",
        position: [right.position.x, options.height * 0.5, 0],
        size: [pillarWidth, options.height, options.depth],
      },
    ],
  };
}

export function createGateModule(options: ArchModuleOptions): KitModule {
  const gate = createArchModule(options);
  gate.object.name = "kit-gate-sandstone";

  const bannerMaterial = createFlatMaterial("teal.base");
  const banner = new THREE.Mesh(new THREE.BoxGeometry(options.width * 0.38, options.height * 0.34, 0.04), bannerMaterial);
  banner.position.set(0, options.height * 0.52, -options.depth * 0.54);
  banner.castShadow = true;
  gate.object.add(banner);

  return gate;
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

export function createTreeModule(options: NatureModuleOptions = {}): KitModule {
  const scale = options.scale ?? 1;
  const tree = new THREE.Group();
  tree.name = "kit-nature-tree";

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.16 * scale, 1.0 * scale, 6), createFlatMaterial("earth.base"));
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.62 * scale, 1.15 * scale, 7), options.material ?? createFlatMaterial("foliage.base"));
  trunk.position.y = 0.5 * scale;
  canopy.position.y = 1.25 * scale;
  tree.add(trunk, canopy);
  markShadowed(tree);

  return {
    object: tree,
    collision: [
      {
        id: "kit-nature-tree-trunk-collision",
        shape: "cylinder",
        position: [0, 0.5 * scale, 0],
        size: [0.18 * scale, 1.0 * scale, 0.18 * scale],
      },
    ],
  };
}

export function createRockModule(options: NatureModuleOptions = {}): KitModule {
  const scale = options.scale ?? 1;
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34 * scale, 0), options.material ?? createFlatMaterial("sandstone.shadow"));
  rock.name = "kit-nature-rock";
  rock.position.y = 0.18 * scale;
  rock.scale.set(1.25, 0.62, 0.9);
  rock.castShadow = true;
  rock.receiveShadow = true;

  return {
    object: rock,
    collision: [
      {
        id: "kit-nature-rock-collision",
        shape: "sphere",
        position: [0, 0.18 * scale, 0],
        size: [0.42 * scale, 0.28 * scale, 0.34 * scale],
      },
    ],
  };
}

export function createShrubModule(options: NatureModuleOptions = {}): KitModule {
  const scale = options.scale ?? 1;
  const shrub = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28 * scale, 0), options.material ?? createFlatMaterial("foliage.base"));
  shrub.name = "kit-nature-shrub";
  shrub.position.y = 0.22 * scale;
  shrub.scale.set(1.35, 0.78, 1);
  shrub.castShadow = true;
  shrub.receiveShadow = true;

  return {
    object: shrub,
    collision: [],
  };
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
  markShadowed(lamp);

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

  markShadowed(planter);

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

function markShadowed(object: THREE.Object3D): void {
  object.traverse((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
  });
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
