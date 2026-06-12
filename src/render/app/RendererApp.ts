import * as THREE from "three";

import type { DebugFlags } from "../../diagnostics/debugFlags";
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
  private readonly camera: THREE.PerspectiveCamera;
  private readonly composer: PixelatedEffectComposer;
  private readonly graphicsSettings: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly validationMesh: THREE.Object3D | null;
  private disposed = false;

  public constructor({ host, debugFlags }: RendererAppOptions) {
    this.renderer = createRenderer();
    this.camera = createCamera();
    const sceneSetup = createScene(debugFlags);
    this.scene = sceneSetup.scene;
    this.validationMesh = sceneSetup.validationMesh;
    this.composer = createPostPipeline(this.renderer, this.scene, this.camera, {
      pixelSize: readSavedPixelSize(),
    });
    this.graphicsSettings = createPixelSizeControl(this.composer);

    host.appendChild(this.renderer.domElement);
    host.appendChild(this.graphicsSettings);
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
    this.renderer.setAnimationLoop(null);
    this.composer.dispose();
    this.renderer.dispose();
    this.graphicsSettings.remove();
    this.renderer.domElement.remove();
  }

  private readonly handleResize = (): void => {
    resizeRenderer(this.renderer, this.composer, this.camera);
  };

  private readonly handleContextLost = (event: Event): void => {
    event.preventDefault();
  };

  private readonly render = (_time: number): void => {
    if (this.validationMesh) {
      this.validationMesh.rotation.y += 0.01;
    }

    this.composer.render();
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
