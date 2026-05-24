import * as THREE from '../../node_modules/three/build/three.module.js';

export function doSwordAttack(player, enemies) {
  if (player.inVehicle || player.swordCooldown > 0) return { hits: 0, fired: false };

  player.swordCooldown = 0.48;
  player.attackTime = 1;

  const origin = player.group.position.clone();
  const facing = new THREE.Vector3(
    Math.sin(player.group.rotation.y),
    0,
    Math.cos(player.group.rotation.y),
  );

  let hits = 0;
  enemies.forEach(enemy => {
    if (!enemy.alive) return;
    const toEnemy = enemy.group.position.clone().sub(origin);
    const distance = toEnemy.length();
    if (distance > enemy.radius + 4.4) return;
    toEnemy.normalize();
    if (facing.dot(toEnemy) < 0.18) return;
    enemy.hp -= 30;
    enemy.flash = 0.28;
    hits++;
    if (enemy.hp <= 0) {
      enemy.alive = false;
      enemy.group.visible = false;
    }
  });

  return { hits, fired: true };
}
