import * as decor from './decor.js';

export function buildKishkindha(scene, colliders) {
  const rockMaterial = 0x77644d;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const x = 56 + col * 14 + (row % 2 ? 5 : -2);
      const z = -86 + row * 14 + ((row * 9 + col * 3) % 4);
      const size = 4.8 + ((row + col) % 3) * 1.2;
      decor.addRock(scene, colliders, x, z, size, rockMaterial);
    }
  }

  decor.addBridge(scene, colliders, 56, -10, 28, 6);
  decor.addBridge(scene, colliders, 82, -28, 32, 6);
  decor.addBanner(scene, colliders, 70, -42, 0xcf8134);
  decor.addBanner(scene, colliders, 90, -62, 0xcf8134);
}
