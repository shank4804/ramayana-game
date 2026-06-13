import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";

import { createFlatMaterial, AYODHYA_PALETTE } from "./render/palette";
import { createPixelationPass, createPostPipeline } from "./render/post/postPipeline";
import { createRamaStandInCharacter } from "./assets/characters/ramaStandIn";
import { createCutscenePlayer, DASHARATHA_COURT_CUTSCENE } from "./cinematics/timeline";
import { createThirdPersonCameraRig } from "./gameplay/camera/thirdPersonCamera";
import { createCombatEncounter } from "./gameplay/combat/combatSystem";
import { createRamaController, type RamaControllerInput } from "./gameplay/controller/ramaController";
import { createInputMapper } from "./gameplay/input/inputMapper";
import { createAyodhyaCourtyard } from "./world/scenes/ayodhyaCourtyard";
import { createAyodhyaDistrict } from "./world/scenes/ayodhyaDistrict";
import { createForestExileHub } from "./world/scenes/forestExile";
import { createCollisionWorld } from "./physics/world";
import { createAyodhyaSliceDirector } from "./simulation/ayodhyaSlice";
import { createGameplayHud } from "./ui/gameplayHud";
import { FOREST_EXILE_PALETTE } from "./render/forestPalette";
import { createWorldHubManager } from "./render/app/hubManager";
import {
  createCampfireModule,
  createDenseForestTreeModule,
  createForestFloorModule,
  createForestRockModule,
  createHermitageHutModule,
} from "./world/kits/forestKit";
import { createFloorModule, createPalaceFacadeModule, createPropModule, createRampModule, createStairsModule, createWallModule } from "./world/kits/proceduralKit";

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

export function verifyMilestone4Contracts(camera: THREE.PerspectiveCamera): THREE.Object3D {
  const character = createRamaStandInCharacter({
    primarySwap: AYODHYA_PALETTE.saffron.base,
    secondarySwap: AYODHYA_PALETTE.gold.base,
  });
  const courtyard = createAyodhyaCourtyard();
  const collisionWorld = createCollisionWorld(courtyard.collision);
  const inputMapper = createInputMapper(window);
  const cameraRig = createThirdPersonCameraRig(camera);
  const controller = createRamaController({
    actor: character.object,
    collisionWorld,
    cameraRig,
  });
  const hud = createGameplayHud();
  const input: RamaControllerInput = inputMapper.getInputSnapshot();

  controller.update(1 / 60, input);
  hud.update({
    health: 100,
    mode: controller.state.mode,
    objective: "Explore Ayodhya courtyard",
    prompt: "Move Rama",
    speed: controller.state.speed,
  });

  if (!controller.state.grounded || !cameraRig.state.target || !hud.element) {
    throw new Error("Milestone 4 contracts are incomplete.");
  }

  inputMapper.dispose();
  hud.element.remove();

  return character.object;
}

export function verifyMilestone5Contracts(): THREE.Object3D {
  const district = createAyodhyaDistrict();
  const director = createAyodhyaSliceDirector(district.interactions);
  const palace = createPalaceFacadeModule({ width: 8, height: 3, depth: 2 });
  const stairs = createStairsModule({ width: 3, height: 0.5, depth: 2 });
  const ramp = createRampModule({ width: 2, height: 0.25, depth: 3 });
  const marketStall = createPropModule({ kind: "marketStall" });
  const idleInput = {
    moveX: 0,
    moveZ: 0,
    cameraYawDelta: 0,
    cameraPitchDelta: 0,
    sprint: false,
    dodge: false,
    interact: false,
    aim: false,
    attack: false,
    lockOn: false,
    cancel: false,
  };

  const prologueView = director.update(1 / 60, idleInput, district.player.position);
  director.update(6, { ...idleInput, interact: true }, district.player.position);
  const gameplayView = director.update(1 / 60, idleInput, district.player.position);
  const hasMainQuest = district.interactions.some((interaction) => interaction.id === "dasharathaBlessing");
  const hasSideQuest = district.interactions.some((interaction) => interaction.id === "marketLamps");
  const hasStoryGate = district.interactions.some((interaction) => interaction.kind === "storyGate");

  if (
    !district.object.getObjectByName("kit-palace-facade") ||
    !district.object.getObjectByName("dasharatha-stand-in") ||
    !palace.collision.length ||
    !stairs.collision.every((proxy) => proxy.blocksMovement === false) ||
    !ramp.collision.every((proxy) => proxy.blocksMovement === false) ||
    !marketStall.collision.length ||
    !hasMainQuest ||
    !hasSideQuest ||
    !hasStoryGate ||
    prologueView.allowPlayerControl ||
    !gameplayView.allowPlayerControl
  ) {
    throw new Error("Milestone 5 contracts are incomplete.");
  }

  return district.object;
}

export function verifyMilestone6Contracts(camera: THREE.PerspectiveCamera): THREE.Object3D {
  const root = new THREE.Group();
  const player = createRamaStandInCharacter({
    primarySwap: AYODHYA_PALETTE.saffron.base,
    secondarySwap: AYODHYA_PALETTE.gold.base,
  }).object;
  const combat = createCombatEncounter(root);
  const cutscene = createCutscenePlayer(camera);
  const firstEnemy = combat.enemies[0];

  if (!firstEnemy) {
    throw new Error("Milestone 6 contracts are incomplete.");
  }

  firstEnemy.object.position.set(0, 0, 1.15);
  combat.update(1 / 60, player, { attack: true, aim: false, dodge: false, lockOn: false });
  combat.update(1 / 60, player, { attack: false, aim: false, dodge: true, lockOn: true });
  firstEnemy.object.position.set(1.25, 0, 0);
  combat.update(1 / 60, player, { attack: false, aim: false, dodge: false, lockOn: false });
  const lockFacingDelta = Math.abs(normalizedAngle(player.rotation.y - Math.PI * 0.5));
  combat.update(1 / 60, player, { attack: false, aim: true, dodge: false, lockOn: false });
  cutscene.start(DASHARATHA_COURT_CUTSCENE);
  const cutsceneView = cutscene.update(1, { skip: false });
  cutscene.update(0.1, { skip: true });

  if (
    !root.getObjectByName("guard-01") ||
    !root.getObjectByName("rakshasa-01") ||
    firstEnemy.hp >= firstEnemy.maxHp ||
    combat.state.invincibleTimer <= 0 ||
    !combat.state.lockedEnemyId ||
    lockFacingDelta > 0.18 ||
    combat.state.actionMode !== "aim" ||
    !cutsceneView.subtitle ||
    cutscene.state.active
  ) {
    throw new Error("Milestone 6 contracts are incomplete.");
  }

  return root;
}

function normalizedAngle(angle: number): number {
  let normalized = angle;

  while (normalized > Math.PI) {
    normalized -= Math.PI * 2;
  }

  while (normalized < -Math.PI) {
    normalized += Math.PI * 2;
  }

  return normalized;
}

export function verifyMilestone7Contracts(): THREE.Object3D {
  const forest = createForestExileHub();
  const scene = new THREE.Scene();
  const hubManager = createWorldHubManager(scene, {
    enableHubDebugHotkeys: true,
    showPrimitiveValidationScene: false,
  });
  const ayodhyaHub = hubManager.loadHub("ayodhya");
  const forestHub = hubManager.loadHub("forestExile");
  const returnedHub = hubManager.loadHub("ayodhya", {
    spawnPosition: [11.2, 0, 4.6],
    yaw: -Math.PI * 0.5,
  });
  const floor = createForestFloorModule({ width: 8, depth: 8 });
  const tree = createDenseForestTreeModule({ scale: 1 });
  const rock = createForestRockModule();
  const hut = createHermitageHutModule();
  const campfire = createCampfireModule();
  const hasExilePalette = FOREST_EXILE_PALETTE.id === "forest-exile" && FOREST_EXILE_PALETTE.shaderPalette.length >= 8;

  if (
    !hasExilePalette ||
    !floor.collision.every((proxy) => proxy.blocksMovement === false) ||
    !tree.collision.length ||
    !rock.collision.length ||
    !hut.collision.length ||
    !campfire.collision.length ||
    !forest.object.getObjectByName("forest-hermitage-hut") ||
    !forest.object.getObjectByName("lakshmana-forest-companion") ||
    forest.storyGates.length < 2 ||
    forest.sideQuests.length < 1 ||
    forest.collision.length < 16 ||
    ayodhyaHub.id !== "ayodhya" ||
    forestHub.id !== "forestExile" ||
    returnedHub.id !== "ayodhya" ||
    scene.children.length !== 1 ||
    hubManager.active.player !== returnedHub.player
  ) {
    throw new Error("Milestone 7 contracts are incomplete.");
  }

  hubManager.dispose();
  return forest.object;
}
