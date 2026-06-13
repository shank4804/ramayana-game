import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import characterModelUrl from "../../../assets/runtime/characters/base_humanoid.glb?url";

export interface CharacterModel {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

let cached: CharacterModel | null = null;

/**
 * Loads the shared CC0 low-poly humanoid (Kenney, CC0) once during boot so
 * createRamaStandInCharacter can clone it synchronously for every humanoid in
 * a scene. Safe to call more than once.
 */
export async function preloadCharacterModel(): Promise<void> {
  if (cached) {
    return;
  }

  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(characterModelUrl);
  cached = { scene: gltf.scene, animations: gltf.animations };
}

export function getCharacterModel(): CharacterModel | null {
  return cached;
}
