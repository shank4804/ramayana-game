import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

import { AYODHYA_PALETTE, createPaletteVectors, type ShaderPaletteSource } from "../palette";

export type PostPipelineMode = "boot-validation" | "gameplay";

export interface PixelationSettings {
  pixelSize: number;
  palette?: ShaderPaletteSource;
}

const DEFAULT_PIXEL_SIZE = 3;
const MIN_PIXEL_SIZE = 1;
const MAX_PIXEL_SIZE = 8;

export class PixelatedEffectComposer extends EffectComposer {
  private readonly pixelationPass: ShaderPass;
  private logicalWidth = 1;
  private logicalHeight = 1;
  private pixelSize: number;

  public constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    settings: PixelationSettings = { pixelSize: DEFAULT_PIXEL_SIZE },
  ) {
    const pixelSize = clampPixelSize(settings.pixelSize);
    const renderTarget = createLowResolutionRenderTarget(renderer, pixelSize);
    super(renderer, renderTarget);

    this.pixelSize = pixelSize;
    this.pixelationPass = createPixelationPass({
      pixelSize,
      palette: settings.palette ?? AYODHYA_PALETTE,
    });

    this.addPass(new RenderPass(scene, camera));
    this.addPass(this.pixelationPass);
  }

  public setPixelSize(pixelSize: number): void {
    this.pixelSize = clampPixelSize(pixelSize);
    updatePixelationUniforms(this.pixelationPass, this.pixelSize, this.renderTarget1.width, this.renderTarget1.height);
    this.setSize(this.logicalWidth, this.logicalHeight);
  }

  public setPalette(palette: ShaderPaletteSource): void {
    const paletteVectors = createPaletteVectors(palette);
    this.pixelationPass.uniforms.paletteColors!.value = paletteVectors;
    this.pixelationPass.uniforms.paletteSize!.value = paletteVectors.length;
  }

  public override setSize(width: number, height: number): void {
    this.logicalWidth = Math.max(1, width);
    this.logicalHeight = Math.max(1, height);

    const lowWidth = Math.max(1, Math.ceil(this.logicalWidth / this.pixelSize));
    const lowHeight = Math.max(1, Math.ceil(this.logicalHeight / this.pixelSize));

    super.setSize(lowWidth, lowHeight);
    updatePixelationUniforms(this.pixelationPass, this.pixelSize, this.renderTarget1.width, this.renderTarget1.height);
  }
}

export function createPostPipeline(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  settings: PixelationSettings = { pixelSize: DEFAULT_PIXEL_SIZE },
): PixelatedEffectComposer {
  return new PixelatedEffectComposer(renderer, scene, camera, settings);
}

export function createPixelationPass(settings: Required<PixelationSettings>): ShaderPass {
  const paletteVectors = createPaletteVectors(settings.palette);
  const pass = new ShaderPass({
    name: "AyodhyaPixelSnapShader",
    uniforms: {
      tDiffuse: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
      paletteColors: { value: paletteVectors },
      paletteSize: { value: paletteVectors.length },
      mixStrength: { value: 0.22 },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      uniform vec3 paletteColors[12];
      uniform int paletteSize;
      uniform float mixStrength;

      varying vec2 vUv;

      vec3 nearestPaletteColor(vec3 color) {
        vec3 bestColor = paletteColors[0];
        float bestDistance = distance(color, bestColor);

        for (int i = 1; i < 12; i++) {
          if (i >= paletteSize) {
            break;
          }

          float candidateDistance = distance(color, paletteColors[i]);

          if (candidateDistance < bestDistance) {
            bestDistance = candidateDistance;
            bestColor = paletteColors[i];
          }
        }

        return bestColor;
      }

      void main() {
        vec2 texel = 1.0 / resolution;
        vec2 snappedUv = (floor(vUv * resolution) + 0.5) * texel;
        vec4 color = texture2D(tDiffuse, snappedUv);
        vec3 limitedColor = nearestPaletteColor(color.rgb);

        gl_FragColor = vec4(mix(color.rgb, limitedColor, mixStrength), color.a);
      }
    `,
  });

  updatePixelationUniforms(pass, settings.pixelSize, 1, 1);
  return pass;
}

export function getDefaultPixelSize(): number {
  return DEFAULT_PIXEL_SIZE;
}

export function clampPixelSize(pixelSize: number): number {
  return THREE.MathUtils.clamp(Math.round(pixelSize), MIN_PIXEL_SIZE, MAX_PIXEL_SIZE);
}

function createLowResolutionRenderTarget(renderer: THREE.WebGLRenderer, pixelSize: number): THREE.WebGLRenderTarget {
  const size = renderer.getSize(new THREE.Vector2());
  const target = new THREE.WebGLRenderTarget(
    Math.max(1, Math.ceil(size.width / pixelSize)),
    Math.max(1, Math.ceil(size.height / pixelSize)),
    {
      depthBuffer: true,
      magFilter: THREE.NearestFilter,
      minFilter: THREE.NearestFilter,
      stencilBuffer: false,
      type: THREE.HalfFloatType,
    },
  );

  target.texture.name = "Ayodhya.lowResColor";
  target.texture.generateMipmaps = false;
  return target;
}

function updatePixelationUniforms(pass: ShaderPass, pixelSize: number, width: number, height: number): void {
  pass.uniforms.resolution!.value.set(Math.max(1, width), Math.max(1, height));
  pass.material.defines = {
    ...pass.material.defines,
    PIXEL_SIZE: pixelSize.toFixed(0),
  };
  pass.material.needsUpdate = true;
}
