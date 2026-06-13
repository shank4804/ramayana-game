import * as THREE from "three";

export type AyodhyaPalettePath =
  | "sandstone.base"
  | "sandstone.shadow"
  | "sandstone.light"
  | "gold.base"
  | "saffron.base"
  | "teal.base"
  | "cream.base"
  | "earth.base"
  | "foliage.base"
  | "skin.hero";

export interface RegionPalette {
  readonly id: "ayodhya";
  readonly sky: {
    readonly top: string;
    readonly horizon: string;
    readonly ground: string;
  };
  readonly fog: string;
  readonly sandstone: {
    readonly base: string;
    readonly shadow: string;
    readonly light: string;
  };
  readonly gold: {
    readonly base: string;
  };
  readonly saffron: {
    readonly base: string;
  };
  readonly teal: {
    readonly base: string;
  };
  readonly cream: {
    readonly base: string;
  };
  readonly earth: {
    readonly base: string;
  };
  readonly foliage: {
    readonly base: string;
  };
  readonly skin: {
    readonly hero: string;
  };
  readonly shaderPalette: readonly string[];
}

export const AYODHYA_PALETTE: RegionPalette = {
  id: "ayodhya",
  sky: {
    top: "#78a8c8",
    horizon: "#f8dca4",
    ground: "#c88952",
  },
  fog: "#e8bd7a",
  sandstone: {
    base: "#c98d55",
    shadow: "#8f5f3f",
    light: "#e8bf82",
  },
  gold: {
    base: "#d8ad45",
  },
  saffron: {
    base: "#dc6f2d",
  },
  teal: {
    base: "#247f7a",
  },
  cream: {
    base: "#f3ddb6",
  },
  earth: {
    base: "#7f583e",
  },
  foliage: {
    base: "#5f7f43",
  },
  skin: {
    hero: "#b8744d",
  },
  shaderPalette: [
    "#5d3d2f",
    "#7f583e",
    "#8f5f3f",
    "#b8744d",
    "#c98d55",
    "#e8bf82",
    "#f3ddb6",
    "#d8ad45",
    "#dc6f2d",
    "#247f7a",
    "#5f7f43",
    "#78a8c8",
  ],
};

const AYODHYA_FLAT_COLORS: Record<AyodhyaPalettePath, string> = {
  "sandstone.base": AYODHYA_PALETTE.sandstone.base,
  "sandstone.shadow": AYODHYA_PALETTE.sandstone.shadow,
  "sandstone.light": AYODHYA_PALETTE.sandstone.light,
  "gold.base": AYODHYA_PALETTE.gold.base,
  "saffron.base": AYODHYA_PALETTE.saffron.base,
  "teal.base": AYODHYA_PALETTE.teal.base,
  "cream.base": AYODHYA_PALETTE.cream.base,
  "earth.base": AYODHYA_PALETTE.earth.base,
  "foliage.base": AYODHYA_PALETTE.foliage.base,
  "skin.hero": AYODHYA_PALETTE.skin.hero,
};

export function getAyodhyaColor(path: AyodhyaPalettePath): string {
  return AYODHYA_FLAT_COLORS[path];
}

export function createFlatMaterial(
  colorPath: AyodhyaPalettePath,
  options: { roughness?: number; metalness?: number } = {},
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: getAyodhyaColor(colorPath),
    flatShading: true,
    roughness: options.roughness ?? 0.82,
    metalness: options.metalness ?? 0.02,
  });
}

export interface ShaderPaletteSource {
  readonly shaderPalette: readonly string[];
}

export function createPaletteVectors(palette: ShaderPaletteSource): THREE.Vector3[] {
  return palette.shaderPalette.map((hex) => {
    const color = new THREE.Color(hex);
    return new THREE.Vector3(color.r, color.g, color.b);
  });
}
