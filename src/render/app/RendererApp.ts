import * as THREE from "three";

import { createAyodhyaAudioPass, type AyodhyaAudioPass } from "../../audio/ayodhyaAudio";
import { createCutscenePlayer, DASHARATHA_COURT_CUTSCENE, type CutscenePlayer } from "../../cinematics/timeline";
import type { DebugFlags } from "../../diagnostics/debugFlags";
import { createThirdPersonCameraRig, type ThirdPersonCameraRig } from "../../gameplay/camera/thirdPersonCamera";
import { createCombatEncounter, type CombatEncounter } from "../../gameplay/combat/combatSystem";
import { createRamaController, type RamaController } from "../../gameplay/controller/ramaController";
import { createInputMapper, type InputMapper, type PlayerInputSnapshot } from "../../gameplay/input/inputMapper";
import { createCollisionWorld } from "../../physics/world";
import { createAyodhyaSliceDirector, type AyodhyaSliceDirector } from "../../simulation/ayodhyaSlice";
import { createGameplayHud, type GameplayHud } from "../../ui/gameplayHud";
import { clampPixelSize, createPostPipeline, getDefaultPixelSize, type PixelatedEffectComposer } from "../post/postPipeline";
import { createCamera } from "./createCamera";
import { createRenderer } from "./createRenderer";
import { createScene } from "./createScene";
import type { LoadedWorldHub, WorldHubId, WorldHubManager } from "./hubManager";
import { resizeRenderer } from "./resizeRenderer";

interface RendererAppOptions {
  host: HTMLElement;
  debugFlags: DebugFlags;
}

export class RendererApp {
  private readonly audio: AyodhyaAudioPass;
  private readonly camera: THREE.PerspectiveCamera;
  private cameraRig: ThirdPersonCameraRig;
  private combat: CombatEncounter;
  private readonly composer: PixelatedEffectComposer;
  private controller: RamaController;
  private readonly cutscene: CutscenePlayer;
  private readonly debugFlags: DebugFlags;
  private readonly graphicsSettings: HTMLElement;
  private readonly hud: GameplayHud;
  private readonly inputMapper: InputMapper;
  private player: THREE.Object3D;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private activeHub: LoadedWorldHub;
  private readonly sliceDirector: AyodhyaSliceDirector;
  private readonly hubManager: WorldHubManager;
  private courtCutsceneStarted = false;
  private defeatTimer = 0;
  private disposed = false;
  private lastForestInteract = false;
  private lastFrameTime = 0;
  private readonly spawnPosition = new THREE.Vector3();

  public constructor({ host, debugFlags }: RendererAppOptions) {
    this.debugFlags = debugFlags;
    this.renderer = createRenderer();
    this.camera = createCamera();
    const sceneSetup = createScene(debugFlags);
    this.scene = sceneSetup.scene;
    this.hubManager = sceneSetup.hubManager;
    this.activeHub = sceneSetup.hub;
    this.player = this.activeHub.player;
    this.spawnPosition.copy(this.player.position);
    this.cameraRig = createThirdPersonCameraRig(this.camera, this.activeHub.collision);
    this.inputMapper = createInputMapper(window);
    this.combat = this.createCombatForActiveHub();
    this.controller = createRamaController({
      actor: this.player,
      collisionWorld: createCollisionWorld(this.activeHub.collision),
      cameraRig: this.cameraRig,
    });
    this.sliceDirector = createAyodhyaSliceDirector(this.activeHub.ayodhyaInteractions);
    this.cutscene = createCutscenePlayer(this.camera);
    this.audio = createAyodhyaAudioPass(window);
    this.hud = createGameplayHud();
    this.composer = createPostPipeline(this.renderer, this.scene, this.camera, {
      pixelSize: readSavedPixelSize(),
    });
    this.graphicsSettings = createPixelSizeControl(this.composer);

    host.appendChild(this.renderer.domElement);
    host.appendChild(this.graphicsSettings);
    host.appendChild(this.hud.element);
    resizeRenderer(this.renderer, this.composer, this.camera);

    window.addEventListener("resize", this.handleResize);
    window.addEventListener("keydown", this.handleDebugKeyDown);
    this.renderer.domElement.addEventListener("webglcontextlost", this.handleContextLost);
  }

  public start(): void {
    this.renderer.setAnimationLoop(this.render);
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("keydown", this.handleDebugKeyDown);
    this.renderer.domElement.removeEventListener("webglcontextlost", this.handleContextLost);
    this.inputMapper.dispose();
    this.audio.dispose();
    this.renderer.setAnimationLoop(null);
    this.hubManager.dispose();
    this.composer.dispose();
    this.renderer.dispose();
    this.graphicsSettings.remove();
    this.hud.element.remove();
    this.renderer.domElement.remove();
  }

  private readonly handleResize = (): void => {
    resizeRenderer(this.renderer, this.composer, this.camera);
  };

  private readonly handleContextLost = (event: Event): void => {
    event.preventDefault();
  };

  private readonly render = (time: number): void => {
    const deltaSeconds = this.lastFrameTime === 0 ? 1 / 60 : Math.min(0.05, (time - this.lastFrameTime) / 1000);
    this.lastFrameTime = time;
    const input = this.inputMapper.getInputSnapshot();
    const hubView = this.updateActiveHubView(deltaSeconds, input);

    if (hubView.transitionTo) {
      this.loadHub(hubView.transitionTo);
      this.hud.update({
        health: this.controller.state.health,
        mode: "idle",
        combatStatus: this.combat.state.statusText,
        crosshair: false,
        notification: hubView.notification,
        objective: this.getHubObjective(),
        prompt: this.getHubPrompt(),
        speed: 0,
        subtitle: "",
      });
      this.composer.render();
      return;
    }

    if (this.activeHub.id === "ayodhya" && hubView.allowPlayerControl && !this.courtCutsceneStarted && !input.interact) {
      this.cutscene.start(DASHARATHA_COURT_CUTSCENE);
      this.courtCutsceneStarted = true;
    }

    const cutsceneView = this.cutscene.update(deltaSeconds, {
      skip: input.cancel || input.interact,
    });
    const defeated = this.defeatTimer > 0 || this.controller.state.health <= 0;
    const controlLocked = !hubView.allowPlayerControl || cutsceneView.active || defeated;
    const combatState = controlLocked
      ? this.combat.state
      : this.combat.update(deltaSeconds, this.player, {
          aim: input.aim,
          attack: input.attack,
          dodge: input.dodge,
          lockOn: input.lockOn,
        });
    const gameplayInput = controlLocked ? createControlLockedInput(input) : { ...input, dodge: input.dodge && combatState.invincibleTimer > 0 };

    if (!cutsceneView.active) {
      this.cameraRig.setFocusTarget(this.combat.getLockedTarget());
      this.controller.update(deltaSeconds, gameplayInput);
    }

    this.controller.state.health = Math.max(0, this.controller.state.health - combatState.playerDamage);
    if (this.controller.state.health <= 0 && this.defeatTimer === 0) {
      this.defeatTimer = 2.1;
    }

    let defeatMessage = "";
    if (this.defeatTimer > 0) {
      this.defeatTimer = Math.max(0, this.defeatTimer - deltaSeconds);
      defeatMessage = "Rama falls - returning to the palace street";
      if (this.defeatTimer === 0) {
        this.player.position.copy(this.spawnPosition);
        this.player.rotation.y = this.activeHub.id === "forestExile" ? 0 : Math.PI;
        this.controller.state.health = 100;
        defeatMessage = this.activeHub.id === "forestExile" ? "Rama recovers at the forest camp" : "Rama recovers at the palace street";
      }
    }
    this.audio.update(deltaSeconds, {
      cue: hubView.audioCue,
      moving: this.controller.state.speed > 0.15,
      speed: this.controller.state.speed,
    });
    const hudMode = this.getHudMode(combatState);
    this.hud.update({
      health: this.controller.state.health,
      mode: hudMode,
      combatStatus: combatState.statusText,
      crosshair: combatState.crosshair,
      notification: defeatMessage || hubView.notification,
      objective: hubView.objective,
      prompt: hubView.prompt,
      speed: this.controller.state.speed,
      subtitle: cutsceneView.subtitle,
    });

    for (const debugObject of this.activeHub.debugObjects) {
      debugObject.rotation.y += 0.01;
    }

    this.composer.render();
  };

  private readonly handleDebugKeyDown = (event: KeyboardEvent): void => {
    if (!this.debugFlags.enableHubDebugHotkeys || event.code !== "KeyH" || event.repeat) {
      return;
    }

    this.loadHub(this.activeHub.id === "ayodhya" ? "forestExile" : "ayodhya");
  };

  private updateActiveHubView(deltaSeconds: number, input: PlayerInputSnapshot): HubView {
    if (this.activeHub.id === "ayodhya") {
      const view = this.sliceDirector.update(deltaSeconds, input, this.player.position);
      return {
        allowPlayerControl: view.allowPlayerControl,
        audioCue: view.audioCue,
        notification: view.notification,
        objective: view.objective,
        prompt: view.prompt,
        transitionTo: view.transitionTo,
      };
    }

    return this.updateForestHubView(input);
  }

  private updateForestHubView(input: PlayerInputSnapshot): HubView {
    const interactPressed = input.interact && !this.lastForestInteract;
    this.lastForestInteract = input.interact;
    const gate = findNearestForestGate(this.activeHub, this.player.position);
    const baseView: HubView = {
      allowPlayerControl: true,
      audioCue: null,
      notification: "",
      objective: "Forest Exile: regroup at the hermitage",
      prompt: gate ? `Press E: ${gate.label}` : "WASD move - Q lock - E at forest gates",
      transitionTo: null,
    };

    if (!gate || !interactPressed) {
      return baseView;
    }

    if (gate.id === "ayodhyaReturn") {
      return {
        ...baseView,
        audioCue: "quest",
        notification: "Rama returns to Ayodhya's gate road.",
        transitionTo: "ayodhya",
      };
    }

    return {
      ...baseView,
      audioCue: "ui",
      notification: "The deeper forest path awaits a sage's blessing.",
    };
  }

  private loadHub(id: WorldHubId): void {
    const previousHealth = Math.max(1, this.controller.state.health);
    const hub = this.hubManager.loadHub(id, getTransitionSpawn(id));
    this.activeHub = hub;
    this.player = hub.player;
    this.spawnPosition.copy(this.player.position);
    this.cameraRig = createThirdPersonCameraRig(this.camera, hub.collision);
    this.combat = this.createCombatForActiveHub();
    this.controller = createRamaController({
      actor: this.player,
      collisionWorld: createCollisionWorld(hub.collision),
      cameraRig: this.cameraRig,
    });
    this.controller.state.health = previousHealth;
    this.defeatTimer = 0;
    this.lastForestInteract = false;
    this.composer.setPalette(hub.palette);
  }

  private createCombatForActiveHub(): CombatEncounter {
    const combat = createCombatEncounter();
    this.activeHub.object.add(combat.root);
    return combat;
  }

  private getHudMode(combatState: CombatEncounter["state"]): string {
    if (this.controller.state.health <= 0 || this.defeatTimer > 0) {
      return "dead";
    }

    if (combatState.actionMode === "attack" || combatState.actionMode === "aim") {
      return combatState.actionMode;
    }

    return this.controller.state.mode;
  }

  private getHubObjective(): string {
    return this.activeHub.id === "forestExile" ? "Forest Exile: regroup at the hermitage" : "Approach a city gate to begin exile";
  }

  private getHubPrompt(): string {
    return this.activeHub.id === "forestExile" ? "WASD move - Q lock - E at forest gates" : "WASD move - drag orbit - right mouse aim";
  }
}

interface HubView {
  allowPlayerControl: boolean;
  objective: string;
  prompt: string;
  notification: string;
  audioCue: "ui" | "quest" | null;
  transitionTo: WorldHubId | null;
}

function findNearestForestGate(hub: LoadedWorldHub, playerPosition: THREE.Vector3): LoadedWorldHub["forestStoryGates"][number] | null {
  let nearest: LoadedWorldHub["forestStoryGates"][number] | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const gate of hub.forestStoryGates) {
    const [x, , z] = gate.position;
    const distance = Math.hypot(playerPosition.x - x, playerPosition.z - z);

    if (distance <= gate.radius && distance < nearestDistance) {
      nearest = gate;
      nearestDistance = distance;
    }
  }

  return nearest;
}

function getTransitionSpawn(id: WorldHubId): { spawnPosition: THREE.Vector3Tuple; yaw: number } {
  if (id === "forestExile") {
    return {
      spawnPosition: [0, 0, -5.2],
      yaw: 0,
    };
  }

  return {
    spawnPosition: [11.2, 0, 4.6],
    yaw: -Math.PI * 0.5,
  };
}

function createControlLockedInput(input: PlayerInputSnapshot): PlayerInputSnapshot {
  return {
    ...input,
    moveX: 0,
    moveZ: 0,
    sprint: false,
    dodge: false,
    aim: false,
    attack: false,
    lockOn: false,
  };
}

const PIXEL_SIZE_STORAGE_KEY = "ramayana.pixelSize";

function readSavedPixelSize(): number {
  const savedValue = Number.parseInt(window.localStorage.getItem(PIXEL_SIZE_STORAGE_KEY) ?? "", 10);
  return Number.isFinite(savedValue) ? clampPixelSize(savedValue) : getDefaultPixelSize();
}

function createPixelSizeControl(composer: PixelatedEffectComposer): HTMLElement {
  const shell = document.createElement("label");
  shell.className = "graphics-settings";

  const label = document.createElement("span");
  label.textContent = "Pixel";

  const input = document.createElement("input");
  input.type = "range";
  input.min = "1";
  input.max = "8";
  input.step = "1";
  input.value = String(readSavedPixelSize());
  input.setAttribute("aria-label", "Pixel size");
  input.addEventListener("input", () => {
    const pixelSize = clampPixelSize(input.valueAsNumber);
    composer.setPixelSize(pixelSize);
    window.localStorage.setItem(PIXEL_SIZE_STORAGE_KEY, String(pixelSize));
  });

  shell.append(label, input);
  return shell;
}
