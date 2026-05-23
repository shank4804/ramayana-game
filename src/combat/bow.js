import * as THREE from '../../node_modules/three/build/three.module.js';

export function fireArrow(player, camera, scene, projectiles) {
  if (player.inVehicle || player.bowCooldown > 0) return false;

  player.bowCooldown = 0.72;
  player.bowPose = 1;

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.y = Math.max(0.02, direction.y);
  direction.normalize();

  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1.45, 8),
    new THREE.MeshStandardMaterial({ color: 0xe6c670, roughness: 0.4, metalness: 0.2 }),
  );
  mesh.rotation.z = Math.PI / 2;
  mesh.castShadow = true;
  mesh.position.copy(player.group.position).add(new THREE.Vector3(0, 2.25, 0));
  scene.add(mesh);

  projectiles.push({
    mesh,
    velocity: direction.multiplyScalar(46),
    ttl: 2.8,
    damage: 24,
  });
  return true;
}

export function spawnEnemyOrb(enemy, targetPos, scene, enemyProjectiles) {
  const direction = targetPos.clone().add(new THREE.Vector3(0, 1.4, 0)).sub(enemy.group.position);
  direction.y = 0.06;
  direction.normalize();

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xff7a59, emissive: 0xaa2e1e, emissiveIntensity: 1.2 }),
  );
  mesh.castShadow = true;
  mesh.position.copy(enemy.group.position).add(new THREE.Vector3(0, 2.1, 0));
  scene.add(mesh);

  enemyProjectiles.push({
    mesh,
    velocity: direction.multiplyScalar(26),
    ttl: 3.2,
    damage: 14,
  });
}

export function updateProjectiles(projectiles, dt, ctx) {
  return projectiles.filter(projectile => {
    projectile.ttl -= dt;
    if (projectile.ttl <= 0) {
      ctx.scene.remove(projectile.mesh);
      return false;
    }

    projectile.mesh.position.addScaledVector(projectile.velocity, dt);
    projectile.mesh.lookAt(projectile.mesh.position.clone().add(projectile.velocity));

    if (ctx.colliders.pointHitsCollider(projectile.mesh.position, 0.3)) {
      ctx.scene.remove(projectile.mesh);
      return false;
    }

    const hitEnemy = ctx.enemies.find(enemy => {
      if (!enemy.alive) return false;
      return enemy.group.position.distanceTo(projectile.mesh.position) <= enemy.radius + 0.85;
    });

    if (hitEnemy) {
      hitEnemy.hp -= projectile.damage;
      hitEnemy.flash = 0.34;
      if (hitEnemy.hp <= 0) {
        hitEnemy.alive = false;
        hitEnemy.group.visible = false;
      }
      ctx.scene.remove(projectile.mesh);
      return false;
    }

    return true;
  });
}

export function updateEnemyProjectiles(enemyProjectiles, dt, ctx) {
  const targetPos = ctx.targetPos.clone().add(new THREE.Vector3(0, 1.4, 0));
  return enemyProjectiles.filter(projectile => {
    projectile.ttl -= dt;
    if (projectile.ttl <= 0) {
      ctx.scene.remove(projectile.mesh);
      return false;
    }

    projectile.mesh.position.addScaledVector(projectile.velocity, dt);
    if (ctx.colliders.pointHitsCollider(projectile.mesh.position, 0.45)) {
      ctx.scene.remove(projectile.mesh);
      return false;
    }

    if (projectile.mesh.position.distanceTo(targetPos) <= (ctx.playerInVehicle ? 2.6 : 1.2)) {
      ctx.damagePlayer(projectile.damage);
      ctx.scene.remove(projectile.mesh);
      return false;
    }

    return true;
  });
}
