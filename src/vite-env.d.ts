/// <reference types="vite/client" />

declare module "three" {
  export class Color {
    public r: number;
    public g: number;
    public b: number;
    public constructor(color: string | number);
  }

  export class Vector2 {
    public height: number;
    public width: number;
    public x: number;
    public y: number;
    public constructor(x?: number, y?: number);
    public set(x: number, y: number): this;
  }

  export class Fog {
    public constructor(color: string | number, near: number, far: number);
  }

  export class Vector3 {
    public x: number;
    public y: number;
    public z: number;
    public constructor(x?: number, y?: number, z?: number);
    public set(x: number, y: number, z: number): this;
  }

  export type Vector3Tuple = [number, number, number];

  export class Object3D {
    public castShadow: boolean;
    public name: string;
    public receiveShadow: boolean;
    public renderOrder: number;
    public readonly position: Vector3;
    public readonly rotation: {
      y: number;
    };
    public readonly scale: Vector3;
    public add(...objects: Object3D[]): void;
    public traverse(callback: (child: Object3D) => void): void;
  }

  export class Group extends Object3D {
    public constructor();
  }

  export class Camera extends Object3D {}

  export class PerspectiveCamera extends Camera {
    public aspect: number;
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
    public shadow: {
      mapSize: {
        set(width: number, height: number): void;
      };
      camera: {
        near: number;
        far: number;
      };
    };
    public constructor(color: string | number, intensity: number);
  }

  export class Material {
    public dispose(): void;
  }

  export class BoxGeometry {
    public constructor(width: number, height: number, depth: number);
  }

  export class SphereGeometry {
    public constructor(radius: number, widthSegments?: number, heightSegments?: number);
  }

  export class CylinderGeometry {
    public constructor(radiusTop: number, radiusBottom: number, height: number, radialSegments?: number);
  }

  export class ConeGeometry {
    public constructor(radius: number, height: number, radialSegments?: number);
  }

  export class IcosahedronGeometry {
    public constructor(radius: number, detail?: number);
  }

  export interface MeshStandardMaterialParameters {
    color?: string | number;
    roughness?: number;
    metalness?: number;
    flatShading?: boolean;
  }

  export class MeshStandardMaterial extends Material {
    public constructor(parameters?: MeshStandardMaterialParameters);
  }

  export interface ShaderMaterialParameters {
    depthWrite?: boolean;
    side?: unknown;
    uniforms?: Record<string, { value: unknown }>;
    vertexShader?: string;
    fragmentShader?: string;
  }

  export class ShaderMaterial extends Material {
    public defines: Record<string, unknown>;
    public needsUpdate: boolean;
    public uniforms: Record<string, { value: unknown }>;
    public constructor(parameters?: ShaderMaterialParameters);
  }

  export class Mesh extends Object3D {
    public constructor(geometry: unknown, material: Material);
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
    public getSize(target: Vector2): Vector2;
    public render(scene: Scene, camera: PerspectiveCamera): void;
    public setAnimationLoop(callback: ((time: number) => void) | null): void;
    public setClearColor(color: number, alpha: number): void;
    public setPixelRatio(pixelRatio: number): void;
    public setSize(width: number, height: number, updateStyle?: boolean): void;
  }

  export interface WebGLRenderTargetOptions {
    depthBuffer?: boolean;
    magFilter?: unknown;
    minFilter?: unknown;
    stencilBuffer?: boolean;
    type?: unknown;
  }

  export class WebGLRenderTarget {
    public height: number;
    public width: number;
    public texture: {
      generateMipmaps: boolean;
      name: string;
    };
    public constructor(width: number, height: number, options?: WebGLRenderTargetOptions);
    public clone(): WebGLRenderTarget;
    public dispose(): void;
    public setSize(width: number, height: number): void;
  }

  export const BackSide: unknown;
  export const ACESFilmicToneMapping: unknown;
  export const HalfFloatType: unknown;
  export const NearestFilter: unknown;
  export const PCFSoftShadowMap: unknown;
  export const SRGBColorSpace: unknown;
  export const MathUtils: {
    clamp(value: number, min: number, max: number): number;
  };
}

declare module "three/addons/postprocessing/EffectComposer.js" {
  import type { WebGLRenderer, WebGLRenderTarget } from "three";

  export class EffectComposer {
    public renderTarget1: WebGLRenderTarget;
    public renderTarget2: WebGLRenderTarget;
    public constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
    public addPass(pass: unknown): void;
    public dispose(): void;
    public render(): void;
    public setSize(width: number, height: number): void;
  }
}

declare module "three/addons/postprocessing/RenderPass.js" {
  import type { Camera, Scene } from "three";

  export class RenderPass {
    public constructor(scene: Scene, camera: Camera);
  }
}

declare module "three/addons/postprocessing/ShaderPass.js" {
  import type { ShaderMaterial } from "three";

  export class ShaderPass {
    public material: ShaderMaterial;
    public uniforms: Record<string, { value: any }>;
    public constructor(shader: unknown, textureID?: string);
  }
}

declare module "three/addons/loaders/GLTFLoader.js" {
  export class GLTFLoader {
    public constructor();
  }
}
