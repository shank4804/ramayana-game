import * as THREE from "three";

import { createAyodhyaAudioPass, type AyodhyaAudioPass } from "../../audio/ayodhyaAudio";
import type { DebugFlags } from "../../diagnostics/debugFlags";
import { createThirdPersonCameraRig, type ThirdPersonCameraRig } from "../../gameplay/camera/thirdPersonCamera";
import { createRamaController, type RamaController } from "../../gameplay/controller/ramaController";
import { createInputMapper, type InputMapper, type PlayerInputSnapshot } from "../../gameplay/input/inputMapper";
import { createCollisionWorld } from "../../physics/world";
import { createAyodhyaSliceDirector, type AyodhyaSliceDirector } from "../../simulation/ayodhyaSlice";
import { createGameplayHud, type GameplayHud } from "../../ui/gameplayHud";
import { clampPixelSize, createPostPipeline, getDefaultPixelSize, type PixelatedEffectComposer } from "../post/postPipeline";
import { createCamera } from "./createCamera";
import { createRenderer } from "./createRenderer";
import { createScene } from "./createScene";
import { resizeRenderer } from "./resizeRenderer";

interface RendererAppOptions {
  host: HTMLElement;
  debugFlags: DebugFlags;
}

export class RendererApp {
  private readonly audio: AyodhyaAudioPass;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly cameraRig: ThirdPersonCameraRig;
  private readonly composer: PixelatedEffectComposer;
  private readonly controller: RamaController;
  private readonly graphicsSettings: HTMLElement;
  private readonly hud: GameplayHud;
  private readonly inputMapper: InputMapper;
  private readonly player: THREE.Object3D;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly sliceDirector: AyodhyaSliceDirector;
  private readonly validationMesh: THREE.Object3D | null;
  private disposed = false;
  private lastFrameTime = 0;

  public constructor({ host, debugFlags }: RendererAppOptions) {
    this.renderer = createRenderer();
    this.camera = createCamera();
    const sceneSetup = createScene(debugFlags);
    this.scene = sceneSetup.scene;
    this.validationMesh = sceneSetup.validationMesh;
    this.player = sceneSetup.player;
    this.cameraRig = createThirdPersonCameraRig(this.camera);
    this.inputMapper = createInputMapper(window);
    this.controller = createRamaController({
      actor: sceneSetup.player,
      collisionWorld: createCollisionWorld(sceneSetup.collision),
      cameraRig: this.cameraRig,
    });
    this.sliceDirector = createAyodhyaSliceDirector(sceneSetup.interactions);
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
    this.renderer.domElement.removeEventListener("webglcontextlost", this.handleContextLost);
    this.inputMapper.dispose();
    this.audio.dispose();
    this.renderer.setAnimationLoop(null);
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
    const sliceView = this.sliceDirector.update(deltaSeconds, input, this.player.position);
    const gameplayInput = sliceView.allowPlayerControl ? input : createControlLockedInput(input);

    this.controller.update(deltaSeconds, gameplayInput);
    this.audio.update(deltaSeconds, {
      cue: sliceView.audioCue,
      moving: this.controller.state.speed > 0.15,
      speed: this.controller.state.speed,
    });
    this.hud.update({
      health: this.controller.state.health,
      mode: this.controller.state.mode,
      notification: sliceView.notification,
      objective: sliceView.objective,
      prompt: sliceView.prompt,
      speed: this.controller.state.speed,
    });

    if (this.validationMesh) {
      this.validationMesh.rotation.y += 0.01;
    }

    this.composer.render();
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
