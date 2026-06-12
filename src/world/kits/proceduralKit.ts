import * as THREE from "three";

import { createFlatMaterial } from "../../render/palette";

export interface CollisionProxy {
  id: string;
  shape: "box" | "cylinder" | "sphere";
  position: THREE.Vector3Tuple;
  size: THREE.Vector3Tuple;
  blocksMovement?: boolean;
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
  kind: "lamp" | "planter" | "crate" | "marketStall" | "bench";
  material?: THREE.Material;
}

export interface NatureModuleOptions {
  material?: THREE.Material;
  scale?: number;
}

export interface StairsModuleOptions {
  width: number;
  height: number;
  depth: number;
  steps?: number;
  material?: THREE.Material;
}

export interface RampModuleOptions {
  width: number;
  height: number;
  depth: number;
  material?: THREE.Material;
}

export interface PalaceFacadeOptions {
  width: number;
  height: number;
  depth: number;
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
        blocksMovement: false,
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

export function createPalaceFacadeModule(options: PalaceFacadeOptions): KitModule {
  const material = options.material ?? createFlatMaterial("sandstone.base");
  const palace = new THREE.Group();
  palace.name = "kit-palace-facade";

  const mainMass = new THREE.Mesh(new THREE.BoxGeometry(options.width, options.height, options.depth), material);
  const upperMass = new THREE.Mesh(
    new THREE.BoxGeometry(options.width * 0.72, options.height * 0.45, options.depth * 0.82),
    createFlatMaterial("sandstone.light"),
  );
  const roof = new THREE.Mesh(new THREE.ConeGeometry(options.width * 0.18, options.height * 0.42, 4), createFlatMaterial("gold.base"));
  const trim = new THREE.Mesh(new THREE.BoxGeometry(options.width * 1.04, 0.18, options.depth * 1.08), createFlatMaterial("gold.base"));

  mainMass.position.y = options.height * 0.5;
  upperMass.position.y = options.height + options.height * 0.225;
  roof.position.y = options.height * 1.58;
  roof.rotation.y = Math.PI * 0.25;
  trim.position.y = options.height + 0.1;
  palace.add(mainMass, upperMass, roof, trim);

  const arch = createArchModule({
    width: options.width * 0.26,
    height: options.height * 0.72,
    depth: options.depth * 1.12,
    material: createFlatMaterial("sandstone.light"),
  }).object;
  arch.position.set(0, 0, -options.depth * 0.56);
  palace.add(arch);

  for (let index = 0; index < 4; index += 1) {
    const column = createColumnModule({ height: options.height * 0.72, radius: 0.16, material: createFlatMaterial("cream.base") }).object;
    column.position.set(-options.width * 0.35 + index * options.width * 0.23, 0, -options.depth * 0.64);
    palace.add(column);
  }

  markShadowed(palace);

  return {
    object: palace,
    collision: [
      {
        id: "kit-palace-facade-collision",
        shape: "box",
        position: [0, options.height * 0.5, 0],
        size: [options.width, options.height, options.depth],
      },
    ],
  };
}

export function createStairsModule(options: StairsModuleOptions): KitModule {
  const steps = Math.max(2, options.steps ?? 4);
  const stair = new THREE.Group();
  stair.name = "kit-stairs-sandstone";

  for (let index = 0; index < steps; index += 1) {
    const stepHeight = options.height / steps;
    const stepDepth = options.depth / steps;
    const tread = new THREE.Mesh(
      new THREE.BoxGeometry(options.width, stepHeight, stepDepth * (index + 1)),
      options.material ?? createFlatMaterial("sandstone.light"),
    );
    tread.position.set(0, stepHeight * (index + 0.5), -options.depth * 0.5 + stepDepth * (index + 1) * 0.5);
    stair.add(tread);
  }

  markShadowed(stair);

  return {
    object: stair,
    collision: [
      {
        id: "kit-stairs-sandstone-collision",
        shape: "box",
        position: [0, options.height * 0.5, 0],
        size: [options.width, options.height, options.depth],
        blocksMovement: false,
      },
    ],
  };
}

export function createRampModule(options: RampModuleOptions): KitModule {
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(options.width, options.height, options.depth), options.material ?? createFlatMaterial("sandstone.light"));
  ramp.name = "kit-ramp-sandstone";
  ramp.position.y = options.height * 0.5;
  ramp.rotation.x = -Math.atan2(options.height, options.depth);
  ramp.castShadow = true;
  ramp.receiveShadow = true;

  return {
    object: ramp,
    collision: [
      {
        id: "kit-ramp-sandstone-collision",
        shape: "box",
        position: [0, options.height * 0.5, 0],
        size: [options.width, options.height, options.depth],
        blocksMovement: false,
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

  if (options.kind === "marketStall") {
    return createMarketStallProp(options.material);
  }

  if (options.kind === "bench") {
    return createBenchProp(options.material);
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

function createMarketStallProp(material = createFlatMaterial("earth.base")): KitModule {
  const stall = new THREE.Group();
  stall.name = "kit-prop-market-stall";

  const counter = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.48, 0.52), material);
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.12, 0.72), createFlatMaterial("saffron.base"));
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 1.0), createFlatMaterial("teal.base"));
  const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.35, 5), createFlatMaterial("earth.base"));
  const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.35, 5), createFlatMaterial("earth.base"));

  counter.position.y = 0.24;
  cloth.position.y = 0.55;
  canopy.position.y = 1.42;
  canopy.rotation.z = 0.06;
  leftPost.position.set(-0.78, 0.86, -0.35);
  rightPost.position.set(0.78, 0.86, -0.35);
  stall.add(counter, cloth, canopy, leftPost, rightPost);
  markShadowed(stall);

  return {
    object: stall,
    collision: [
      {
        id: "kit-prop-market-stall-collision",
        shape: "box",
        position: [0, 0.32, 0],
        size: [1.7, 0.64, 0.74],
      },
    ],
  };
}

function createBenchProp(material = createFlatMaterial("earth.base")): KitModule {
  const bench = new THREE.Group();
  bench.name = "kit-prop-bench";

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.34), material);
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.12), material);
  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.12), material);
  seat.position.y = 0.42;
  leftLeg.position.set(-0.38, 0.18, 0);
  rightLeg.position.set(0.38, 0.18, 0);
  bench.add(seat, leftLeg, rightLeg);
  markShadowed(bench);

  return {
    object: bench,
    collision: [
      {
        id: "kit-prop-bench-collision",
        shape: "box",
        position: [0, 0.28, 0],
        size: [1.16, 0.56, 0.4],
      },
    ],
  };
}
