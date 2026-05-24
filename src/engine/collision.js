import * as THREE from '../../node_modules/three/build/three.module.js';

export class ColliderRegistry {
  constructor(worldLimit = Infinity) {
    this.colliders = [];
    this.worldLimit = worldLimit;
  }

  register(x, z, width, depth, padding = 0) {
    this.colliders.push({
      minX: x - width / 2 - padding,
      maxX: x + width / 2 + padding,
      minZ: z - depth / 2 - padding,
      maxZ: z + depth / 2 + padding,
    });
  }

  moveBody(position, delta, radius) {
    position.add(delta);
    const collided = this.resolveCollisions(position, radius);
    position.x = THREE.MathUtils.clamp(position.x, -this.worldLimit, this.worldLimit);
    position.z = THREE.MathUtils.clamp(position.z, -this.worldLimit, this.worldLimit);
    return collided;
  }

  resolveCollisions(position, radius) {
    let collided = false;
    for (let pass = 0; pass < 3; pass++) {
      this.colliders.forEach(collider => {
        const nearestX = THREE.MathUtils.clamp(position.x, collider.minX, collider.maxX);
        const nearestZ = THREE.MathUtils.clamp(position.z, collider.minZ, collider.maxZ);
        const dx = position.x - nearestX;
        const dz = position.z - nearestZ;
        const distSq = dx * dx + dz * dz;
        if (distSq >= radius * radius) return;

        collided = true;

        if (distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const push = radius - dist;
          position.x += (dx / dist) * push;
          position.z += (dz / dist) * push;
          return;
        }

        const left = Math.abs(position.x - collider.minX);
        const right = Math.abs(collider.maxX - position.x);
        const top = Math.abs(position.z - collider.minZ);
        const bottom = Math.abs(collider.maxZ - position.z);
        const smallest = Math.min(left, right, top, bottom);
        if (smallest === left) position.x = collider.minX - radius;
        else if (smallest === right) position.x = collider.maxX + radius;
        else if (smallest === top) position.z = collider.minZ - radius;
        else position.z = collider.maxZ + radius;
      });
    }
    return collided;
  }

  pointHitsCollider(point, padding) {
    return this.colliders.some(collider => (
      point.x >= collider.minX - padding &&
      point.x <= collider.maxX + padding &&
      point.z >= collider.minZ - padding &&
      point.z <= collider.maxZ + padding
    ));
  }
}
