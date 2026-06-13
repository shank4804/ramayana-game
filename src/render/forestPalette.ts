import * as THREE from "three";

export type ForestPalettePath =
  | "canopy.deep"
  | "canopy.light"
  | "earth.path"
  | "earth.shadow"
  | "bark.base"
  | "hut.thatch"
  | "water.base"
  | "fire.base"
  | "mist.base";

export interface ForestExilePalette {
  readonly id: "forest-exile";
  readonly sky: {
    readonly top: string;
    readonly horizon: string;
    readonly ground: string;
  };
  readonly fog: string;
  readonly colors: Record<ForestPalettePath, string>;
  readonly shaderPalette: readonly string[];
}

export const FOREST_EXILE_PALETTE: ForestExilePalette = {
  id: "forest-exile",
  sky: {
    top: "#496f82",
    horizon: "#c9d5b2",
    ground: "#4b6840",
  },
  fog: "#9fb792",
  colors: {
    "canopy.deep": "#31573a",
    "canopy.light": "#6f8f4e",
    "earth.path": "#8b6a42",
    "earth.shadow": "#4a3d31",
    "bark.base": "#5a422e",
    "hut.thatch": "#b49a59",
    "water.base": "#4b8b8a",
    "fire.base": "#dc7b2f",
    "mist.base": "#d7dfc8",
  },
  shaderPalette: [
    "#273426",
    "#31573a",
    "#4b6840",
    "#6f8f4e",
    "#4a3d31",
    "#5a422e",
    "#8b6a42",
    "#b49a59",
    "#d7dfc8",
    "#4b8b8a",
    "#dc7b2f",
    "#496f82",
  ],
};

export function createForestMaterial(
  colorPath: ForestPalettePath,
  options: { roughness?: number; metalness?: number } = {},
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: FOREST_EXILE_PALETTE.colors[colorPath],
    flatShading: true,
    roughness: options.roughness ?? 0.9,
    metalness: options.metalness ?? 0,
  });
}
