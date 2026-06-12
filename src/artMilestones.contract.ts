import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";

import { createFlatMaterial, AYODHYA_PALETTE } from "./render/palette";
import { createPixelationPass, createPostPipeline } from "./render/post/postPipeline";
import { createRamaStandInCharacter } from "./assets/characters/ramaStandIn";
import { createAyodhyaCourtyard } from "./world/scenes/ayodhyaCourtyard";
import { createFloorModule, createPropModule, createWallModule } from "./world/kits/proceduralKit";

export function verifyMilestone2Contracts(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
): EffectComposer {
  const color = AYODHYA_PALETTE.sandstone.base;
  const material = createFlatMaterial("sandstone.base");
  const pixelationPass = createPixelationPass({ pixelSize: 3, palette: AYODHYA_PALETTE });
  const composer = createPostPipeline(renderer, scene, camera, { pixelSize: 3 });
  const floor = createFloorModule({ width: 8, depth: 8, material });
  const wall = createWallModule({ width: 4, height: 2, depth: 0.4, material });
  const prop = createPropModule({ kind: "lamp", material });

  if (!color || !pixelationPass || !floor.object || !wall.object || !prop.object) {
    throw new Error("Milestone 2 contracts are incomplete.");
  }

  return composer;
}

export function verifyMilestone3Contracts(): THREE.Object3D {
  const character = createRamaStandInCharacter({
    primarySwap: AYODHYA_PALETTE.saffron.base,
    secondarySwap: AYODHYA_PALETTE.gold.base,
  });
  const courtyard = createAyodhyaCourtyard();

  if (!character.recolorMaterial.uniforms.primarySwap || !character.recolorMaterial.uniforms.secondarySwap) {
    throw new Error("Character recolor material must expose two palette-swap uniforms.");
  }

  if (!character.accessorySockets.back) {
    throw new Error("Character must expose a back accessory socket.");
  }

  if (!courtyard.object.getObjectByName("rama-stand-in")) {
    throw new Error("Courtyard must include the Rama look-dev stand-in.");
  }

  return courtyard.object;
}
