import * as decor from './decor.js';

export function buildAyodhya(scene, colliders) {
  const palace = [
    [-158, -42, 18, 16, 12, 0xd7d0c2, 0xc8a24e],
    [-136, -42, 18, 18, 15, 0xd8d2c5, 0xc49a45],
    [-114, -42, 16, 14, 11, 0xd5cebc, 0xcda14d],
    [-152, 20, 14, 12, 10, 0xd8cbb5, 0xb8893d],
    [-130, 24, 18, 16, 12, 0xd5c9b7, 0xc49d52],
    [-110, 18, 16, 12, 9, 0xd6cfbf, 0xba8a39],
  ];

  palace.forEach(([x, z, w, d, h, wall, roof]) => {
    decor.addBuilding(scene, colliders, x, z, w, d, h, wall, roof, true);
  });

  decor.addGateArch(scene, colliders, -92, -8);
  decor.addWall(scene, colliders, -176, -8, 8, 24, 10, 0xbaa171);
  decor.addWall(scene, colliders, -78, 38, 112, 6, 8, 0xc3ab7c);
  decor.addWall(scene, colliders, -78, -54, 112, 6, 8, 0xc3ab7c);
  decor.addWall(scene, colliders, -132, 26, 6, 20, 8, 0xc3ab7c);
  decor.addWall(scene, colliders, -132, -42, 6, 20, 8, 0xc3ab7c);

  [
    [-175, 36],
    [-175, -54],
    [-85, 36],
    [-85, -54],
  ].forEach(([x, z]) => decor.addTower(scene, colliders, x, z, 6.2, 13, 0xd7c49a, 0xc99d43));

  [
    [-154, -8],
    [-136, -8],
    [-118, -8],
    [-100, -8],
    [-82, -8],
  ].forEach(([x, z]) => decor.addStreetLamp(scene, colliders, x, z));
}
