import * as decor from './decor.js';

export function buildLanka(scene, colliders) {
  const wall = 0x6d2e22;
  decor.addWall(scene, colliders, 124, 42, 48, 4, 12, wall);
  decor.addWall(scene, colliders, 104, 62, 4, 44, 12, wall);
  decor.addWall(scene, colliders, 144, 62, 4, 44, 12, wall);
  decor.addWall(scene, colliders, 124, 82, 48, 4, 12, wall);

  [
    [104, 42],
    [144, 42],
    [104, 82],
    [144, 82],
  ].forEach(([x, z]) => decor.addTower(scene, colliders, x, z, 5.4, 15, 0x7a3424, 0x9f562a));

  decor.addBuilding(scene, colliders, 158, 114, 44, 34, 18, 0x33191b, 0x7a3726, false);
  decor.addBuilding(scene, colliders, 126, 34, 18, 16, 10, 0x58221e, 0x944b38, true);
  decor.addBuilding(scene, colliders, 150, 30, 14, 14, 9, 0x58221e, 0x944b38, true);

  [
    [114, 38],
    [136, 38],
    [114, 86],
    [136, 86],
    [154, 94],
    [154, 134],
  ].forEach(([x, z]) => decor.addTorch(scene, colliders, x, z));
}
