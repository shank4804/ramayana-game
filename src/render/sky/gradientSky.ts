import * as THREE from "three";

import { AYODHYA_PALETTE } from "../palette";

export interface GradientSkyPalette {
  readonly sky: {
    readonly top: string;
    readonly horizon: string;
    readonly ground: string;
  };
}

export function createGradientSky(palette: GradientSkyPalette = AYODHYA_PALETTE): THREE.Mesh {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(120, 16, 8),
    new THREE.ShaderMaterial({
      depthWrite: false,
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(palette.sky.top) },
        horizonColor: { value: new THREE.Color(palette.sky.horizon) },
        groundColor: { value: new THREE.Color(palette.sky.ground) },
      },
      vertexShader: `
        varying vec3 vWorldPosition;

        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 groundColor;

        varying vec3 vWorldPosition;

        void main() {
          float heightMix = normalize(vWorldPosition).y * 0.5 + 0.5;
          vec3 lowColor = mix(groundColor, horizonColor, smoothstep(0.0, 0.55, heightMix));
          vec3 highColor = mix(horizonColor, topColor, smoothstep(0.45, 1.0, heightMix));

          gl_FragColor = vec4(mix(lowColor, highColor, smoothstep(0.45, 0.85, heightMix)), 1.0);
        }
      `,
    }),
  );

  sky.name = "gradient-sky";
  sky.renderOrder = -1000;
  return sky;
}
