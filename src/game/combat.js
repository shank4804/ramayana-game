import * as THREE from 'three';

export class Combat {
  constructor(scene, colliders) {
    this.scene = scene;
    this.colliders = colliders;
    this.arrows = [];
    this.orbs = [];
  }

  swordAttack(player, enemies) {
    if (player.swordCooldown > 0) return 0;
    player.swordCooldown = 0.48;
    player.attackAnim = 1;

    const origin = player.group.position;
    const facing = new THREE.Vector3(
      Math.sin(player.group.rotation.y), 0, Math.cos(player.group.rotation.y),
    );

    let hits = 0;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const toEnemy = enemy.group.position.clone().sub(origin);
      const distance = toEnemy.length();
      if (distance > enemy.radius + 4.4) continue;
      toEnemy.normalize();
      if (facing.dot(toEnemy) < 0.18) continue;
      enemy.hit(30);
      hits++;
    }
    return hits;
  }

  fireArrow(player, camera) {
    if (player.bowCooldown > 0) return false;
    player.bowCooldown = 0.72;
    player.bowPose = 1;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = Math.max(0.02, direction.y);
    direction.normalize();

    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: 0xe6c670, roughness: 0.4, metalness: 0.2 }),
    );
    mesh.castShadow = true;
    mesh.position.copy(player.group.position).add(new THREE.Vector3(0, 2.25, 0));
    this.scene.add(mesh);
    this.arrows.push({ mesh, velocity: direction.multiplyScalar(46), ttl: 2.8, damage: 24 });
    return true;
  }

  spawnOrb(enemy, targetPos) {
    const direction = targetPos.clone().add(new THREE.Vector3(0, 1.4, 0)).sub(enemy.group.position);
    direction.y = 0.06;
    direction.normalize();

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xff7a59, emissive: 0xaa2e1e, emissiveIntensity: 1.2 }),
    );
    mesh.position.copy(enemy.group.position).add(new THREE.Vector3(0, 2.1, 0));
    this.scene.add(mesh);
    this.orbs.push({ mesh, velocity: direction.multiplyScalar(26), ttl: 3.2, damage: 14 });
  }

  update(dt, enemies, player, onPlayerHit) {
    this.arrows = this.arrows.filter((arrow) => {
      arrow.ttl -= dt;
      if (arrow.ttl <= 0) { this.scene.remove(arrow.mesh); return false; }
      arrow.mesh.position.addScaledVector(arrow.velocity, dt);
      arrow.mesh.lookAt(arrow.mesh.position.clone().add(arrow.velocity));
      if (this.colliders.hitsPoint(arrow.mesh.position, 0.3)) {
        this.scene.remove(arrow.mesh);
        return false;
      }
      const hit = enemies.find((e) =>
        e.alive && e.group.position.distanceTo(arrow.mesh.position) <= e.radius + 0.85);
      if (hit) {
        hit.hit(arrow.damage);
        this.scene.remove(arrow.mesh);
        return false;
      }
      return true;
    });

    const playerPos = player.group.position.clone().add(new THREE.Vector3(0, 1.4, 0));
    this.orbs = this.orbs.filter((orb) => {
      orb.ttl -= dt;
      if (orb.ttl <= 0) { this.scene.remove(orb.mesh); return false; }
      orb.mesh.position.addScaledVector(orb.velocity, dt);
      if (this.colliders.hitsPoint(orb.mesh.position, 0.45)) {
        this.scene.remove(orb.mesh);
        return false;
      }
      if (orb.mesh.position.distanceTo(playerPos) <= 1.2) {
        onPlayerHit(orb.damage);
        this.scene.remove(orb.mesh);
        return false;
      }
      return true;
    });
  }

  clear() {
    for (const a of this.arrows) this.scene.remove(a.mesh);
    for (const o of this.orbs) this.scene.remove(o.mesh);
    this.arrows = [];
    this.orbs = [];
  }
}
