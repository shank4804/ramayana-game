import * as THREE from "three";

import { AYODHYA_PALETTE, createFlatMaterial } from "../../render/palette";

export interface CharacterPaletteSwaps {
  primarySwap: string;
  secondarySwap: string;
  skinSwap?: string;
}

export interface RamaStandInCharacter {
  object: THREE.Group;
  recolorMaterial: THREE.ShaderMaterial;
  accessorySockets: {
    back: THREE.Group;
  };
}

export function createRamaStandInCharacter(swaps: CharacterPaletteSwaps): RamaStandInCharacter {
  const character = new THREE.Group();
  character.name = "rama-stand-in";

  const recolorMaterial = createCharacterRecolorMaterial(swaps);
  const skinMaterial = createFlatMaterial("skin.hero");
  const goldMaterial = createFlatMaterial("gold.base", { metalness: 0.12 });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.82, 6), recolorMaterial);
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.08), goldMaterial);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), skinMaterial);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.12, 6), skinMaterial);
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.72, 6), skinMaterial);
  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.72, 6), skinMaterial);
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.14), recolorMaterial);
  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.14), recolorMaterial);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 7), goldMaterial);

  torso.position.y = 1.02;
  sash.position.set(0, 0.88, 0.29);
  neck.position.y = 1.48;
  head.position.y = 1.66;
  crown.position.y = 1.94;
  leftArm.position.set(-0.36, 1.04, 0);
  rightArm.position.set(0.36, 1.04, 0);
  leftArm.rotation.z = 0.22;
  rightArm.rotation.z = -0.22;
  leftLeg.position.set(-0.11, 0.36, 0);
  rightLeg.position.set(0.11, 0.36, 0);

  const backSocket = new THREE.Group();
  backSocket.name = "accessory-socket-back";
  backSocket.position.set(0, 1.16, -0.28);
  backSocket.rotation.z = -0.18;
  backSocket.add(createBowAccessory(), createQuiverAccessory());

  character.add(torso, sash, neck, head, crown, leftArm, rightArm, leftLeg, rightLeg, backSocket);
  character.traverse((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
  });

  return {
    object: character,
    recolorMaterial,
    accessorySockets: {
      back: backSocket,
    },
  };
}

export function createCharacterRecolorMaterial(swaps: CharacterPaletteSwaps): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      primarySwap: { value: new THREE.Color(swaps.primarySwap) },
      secondarySwap: { value: new THREE.Color(swaps.secondarySwap) },
      skinSwap: { value: new THREE.Color(swaps.skinSwap ?? AYODHYA_PALETTE.skin.hero) },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 primarySwap;
      uniform vec3 secondarySwap;
      uniform vec3 skinSwap;

      varying vec2 vUv;

      void main() {
        float border = smoothstep(0.42, 0.48, vUv.y);
        vec3 cloth = mix(primarySwap, secondarySwap, border);
        vec3 warmShadow = mix(cloth, skinSwap, 0.08);

        gl_FragColor = vec4(warmShadow, 1.0);
      }
    `,
  });
}

function createBowAccessory(): THREE.Object3D {
  const bow = new THREE.Group();
  bow.name = "rama-bow-accessory";

  const woodMaterial = createFlatMaterial("earth.base");
  const goldMaterial = createFlatMaterial("gold.base", { metalness: 0.1 });
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.018, 6, 18, Math.PI * 1.28), woodMaterial);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.24, 6), goldMaterial);
  const string = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.72, 0.018), createFlatMaterial("cream.base"));

  arc.rotation.z = Math.PI * 0.86;
  grip.position.set(0.1, 0, 0.02);
  string.position.set(-0.18, 0, 0);
  bow.position.set(-0.2, 0.02, -0.06);
  bow.add(arc, grip, string);
  return bow;
}

function createQuiverAccessory(): THREE.Object3D {
  const quiver = new THREE.Group();
  quiver.name = "rama-quiver-accessory";

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.56, 7), createFlatMaterial("teal.base"));
  body.rotation.x = Math.PI * 0.08;
  body.position.set(0.18, -0.04, -0.02);
  quiver.add(body);

  for (let index = 0; index < 3; index += 1) {
    const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.46, 5), createFlatMaterial("cream.base"));
    arrow.position.set(0.13 + index * 0.035, 0.24, -0.02);
    arrow.rotation.z = -0.08 + index * 0.06;
    quiver.add(arrow);
  }

  return quiver;
}
