/// <reference types="vite/client" />

declare module "three" {
  export class Color {
    public constructor(color: string | number);
  }

  export class Fog {
    public constructor(color: string | number, near: number, far: number);
  }

  export class Vector3 {
    public x: number;
    public y: number;
    public z: number;
    public set(x: number, y: number, z: number): this;
  }

  export class PerspectiveCamera {
    public aspect: number;
    public readonly position: Vector3;
    public constructor(fov: number, aspect: number, near: number, far: number);
    public lookAt(x: number, y: number, z: number): void;
    public updateProjectionMatrix(): void;
  }

  export class Scene {
    public background: Color | null;
    public fog: Fog | null;
    public add(...objects: unknown[]): void;
  }

  export class HemisphereLight {
    public constructor(skyColor: string | number, groundColor: string | number, intensity: number);
  }

  export class DirectionalLight {
    public castShadow: boolean;
    public readonly position: Vector3;
    public constructor(color: string | number, intensity: number);
  }

  export class BoxGeometry {
    public constructor(width: number, height: number, depth: number);
  }

  export interface MeshStandardMaterialParameters {
    color?: string | number;
    roughness?: number;
    metalness?: number;
  }

  export class MeshStandardMaterial {
    public constructor(parameters?: MeshStandardMaterialParameters);
  }

  export class Mesh {
    public castShadow: boolean;
    public receiveShadow: boolean;
    public readonly position: Vector3;
    public readonly rotation: {
      y: number;
    };
    public constructor(geometry: BoxGeometry, material: MeshStandardMaterial);
  }

  export interface WebGLRendererParameters {
    antialias?: boolean;
    powerPreference?: WebGLPowerPreference;
  }

  export class WebGLRenderer {
    public readonly domElement: HTMLCanvasElement;
    public outputColorSpace: unknown;
    public shadowMap: {
      enabled: boolean;
      type: unknown;
    };
    public toneMapping: unknown;
    public toneMappingExposure: number;
    public constructor(parameters?: WebGLRendererParameters);
    public dispose(): void;
    public render(scene: Scene, camera: PerspectiveCamera): void;
    public setAnimationLoop(callback: ((time: number) => void) | null): void;
    public setClearColor(color: number, alpha: number): void;
    public setPixelRatio(pixelRatio: number): void;
    public setSize(width: number, height: number, updateStyle?: boolean): void;
  }

  export const ACESFilmicToneMapping: unknown;
  export const PCFSoftShadowMap: unknown;
  export const SRGBColorSpace: unknown;
}

declare module "three/addons/postprocessing/EffectComposer.js" {
  import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";

  export class EffectComposer {
    public constructor(renderer: WebGLRenderer);
    public addPass(pass: unknown): void;
    public dispose(): void;
    public render(): void;
    public setSize(width: number, height: number): void;
  }
}

declare module "three/addons/postprocessing/RenderPass.js" {
  import type { PerspectiveCamera, Scene } from "three";

  export class RenderPass {
    public constructor(scene: Scene, camera: PerspectiveCamera);
  }
}

declare module "three/addons/loaders/GLTFLoader.js" {
  export class GLTFLoader {
    public constructor();
  }
}
