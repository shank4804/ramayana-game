import * as THREE from '../../node_modules/three/build/three.module.js';
import { buildAyodhya } from './ayodhya.js';
import { buildForest } from './forest.js';
import { buildKishkindha } from './kishkindha.js';
import { buildLanka } from './lanka.js';
import { buildBackdrop } from './backdrop.js';
import { buildRoadNetwork } from './roads.js';
import * as decor from './decor.js';

export class World {
  constructor() {
    this.districts = {};
  }

  build(scene, colliders, decorGroup) {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(520, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xaec8f6, side: THREE.BackSide }),
    );
    scene.add(sky);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(480, 480),
      new THREE.MeshStandardMaterial({ color: 0x6b865a, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    decor.addGroundPatch(scene, colliders, -120, -18, 120, 80, 0xc8b082);
    decor.addGroundPatch(scene, colliders, -6, 52, 124, 98, 0x58754a);
    decor.addGroundPatch(scene, colliders, 74, -58, 90, 82, 0x7a6a4f);
    decor.addGroundPatch(scene, colliders, 142, 80, 108, 136, 0x5a2422);
    decor.addGroundPatch(scene, colliders, 146, 4, 80, 62, 0x49646f);

    buildRoadNetwork(scene, colliders);
    buildAyodhya(scene, colliders);
    buildForest(scene, colliders, decorGroup);
    buildKishkindha(scene, colliders);
    buildLanka(scene, colliders);
    buildBackdrop(scene, colliders);
  }
}
