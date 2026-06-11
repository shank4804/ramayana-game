import * as THREE from 'three';

export class Colliders {
  constructor(worldLimit = 200) {
    this.boxes = [];
    this.limit = worldLimit;
  }

  add(x, z, width, depth, padding = 0.5) {
    this.boxes.push({
      minX: x - width / 2 - padding,
      maxX: x + width / 2 + padding,
      minZ: z - depth / 2 - padding,
      maxZ: z + depth / 2 + padding,
    });
  }

  /** Move `position` by `delta`, sliding along AABBs. Returns true if blocked. */
  move(position, delta, radius) {
    position.add(delta);
    let collided = false;
    for (let pass = 0; pass < 3; pass++) {
      for (const box of this.boxes) {
        const nx = THREE.MathUtils.clamp(position.x, box.minX, box.maxX);
        const nz = THREE.MathUtils.clamp(position.z, box.minZ, box.maxZ);
        const dx = position.x - nx;
        const dz = position.z - nz;
        const distSq = dx * dx + dz * dz;
        if (distSq >= radius * radius) continue;
        collided = true;
        if (distSq > 1e-4) {
          const dist = Math.sqrt(distSq);
          const push = radius - dist;
          position.x += (dx / dist) * push;
          position.z += (dz / dist) * push;
        } else {
          position.z = box.maxZ + radius;
        }
      }
    }
    position.x = THREE.MathUtils.clamp(position.x, -this.limit, this.limit);
    position.z = THREE.MathUtils.clamp(position.z, -this.limit, this.limit);
    return collided;
  }

  hitsPoint(point, padding = 0.3) {
    return this.boxes.some((b) =>
      point.x >= b.minX - padding && point.x <= b.maxX + padding &&
      point.z >= b.minZ - padding && point.z <= b.maxZ + padding);
  }
}
