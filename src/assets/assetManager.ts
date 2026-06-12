import bootManifest from "../../assets/catalog/assets.manifest.json";

export type AssetKind =
  | "character"
  | "environment"
  | "prop"
  | "weapon"
  | "animation"
  | "texture"
  | "hdri";

export type AssetRegion = "ayodhya" | "forest" | "kishkindha" | "lanka";

export interface AssetManifestEntry {
  id: string;
  kind: AssetKind;
  region?: AssetRegion;
  url: string;
  licenseId: string;
  scale: number;
  castShadow: boolean;
  receiveShadow: boolean;
  collider?: string;
  lods?: string[];
  animationClips?: string[];
  preloadGroup?: "boot" | AssetRegion | "cinematic";
}

export async function loadBootManifest(): Promise<AssetManifestEntry[]> {
  const manifest = bootManifest as unknown;

  if (!Array.isArray(manifest)) {
    throw new Error("Asset manifest must be a JSON array.");
  }

  return manifest as AssetManifestEntry[];
}
