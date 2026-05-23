import * as decor from './decor.js';

export function buildRoadNetwork(scene, colliders) {
  const roadColor = 0x65513e;
  decor.addRoad(scene, colliders, -32, -10, 230, 16, roadColor);
  decor.addRoad(scene, colliders, -8, 16, 16, 92, roadColor);
  decor.addRoad(scene, colliders, 48, -10, 104, 16, roadColor);
  decor.addRoad(scene, colliders, 118, 18, 16, 150, roadColor);
  decor.addRoad(scene, colliders, 118, 80, 56, 16, roadColor);
  decor.addRoad(scene, colliders, 150, 98, 16, 78, roadColor);

  for (let x = -150; x <= 146; x += 16) {
    decor.addLaneMark(scene, colliders, x, -10, 6, 0.5);
  }
  for (let z = -18; z <= 138; z += 16) {
    decor.addLaneMark(scene, colliders, 118, z, 0.5, 6);
  }
}
