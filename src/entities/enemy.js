import * as THREE from '../../node_modules/three/build/three.module.js';
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js';
import { AnimationStateMachine, buildClipMap } from '../engine/animation.js';

const TMP_A = new THREE.Vector3();
const TMP_B = new THREE.Vector3();

function shortestAngleDiff(current, target) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

function dampAngle(current, target, lambda, dt) {
  return current + shortestAngleDiff(current, target) * (1 - Math.exp(-lambda * dt));
}

const STATS_BY_TYPE = {
  guard: { body: 0x8b2f2f, hp: 54, speed: 4.8, damage: 8, scale: 1.02, radius: 1.15 },
  rakshasa: { body: 0x60221f, hp: 68, speed: 5.4, damage: 12, scale: 1.12, radius: 1.22 },
  brute: { body: 0x55341a, hp: 110, speed: 3.3, damage: 18, scale: 1.42, radius: 1.55 },
  boss: { body: 0x290a10, hp: 230, speed: 2.9, damage: 20, scale: 2.05, radius: 2.25 },
};

export function createEnemy(type, position, gltf = null) {
  if (gltf) return createSkinnedEnemy(type, position, gltf);
  const stats = STATS_BY_TYPE[type];

  const group = new THREE.Group();
  group.position.set(position[0], 0, position[2]);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: stats.body,
    roughness: 0.76,
    metalness: 0.12,
    emissive: 0x5b1212,
    emissiveIntensity: 0.18,
  });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xd09a6b, roughness: 0.78 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.95 * stats.scale, 1.4 * stats.scale, 0.68 * stats.scale), bodyMaterial);
  body.castShadow = true;
  body.position.y = 1.95 * stats.scale;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34 * stats.scale, 16, 16), skinMaterial);
  head.castShadow = true;
  head.position.y = 3.02 * stats.scale;
  group.add(head);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.66 * stats.scale, 2.2 * stats.scale, 0);
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22 * stats.scale, 1.02 * stats.scale, 0.22 * stats.scale), skinMaterial);
  leftArmMesh.castShadow = true;
  leftArmMesh.position.y = -0.46 * stats.scale;
  leftArm.add(leftArmMesh);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.66 * stats.scale, 2.2 * stats.scale, 0);
  const rightArmMesh = leftArmMesh.clone();
  rightArmMesh.castShadow = true;
  rightArmMesh.position.y = -0.46 * stats.scale;
  rightArm.add(rightArmMesh);
  group.add(rightArm);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.22 * stats.scale, 1.05 * stats.scale, 0);
  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26 * stats.scale, 1.16 * stats.scale, 0.26 * stats.scale), bodyMaterial);
  leftLegMesh.castShadow = true;
  leftLegMesh.position.y = -0.56 * stats.scale;
  leftLeg.add(leftLegMesh);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.22 * stats.scale, 1.05 * stats.scale, 0);
  const rightLegMesh = leftLegMesh.clone();
  rightLegMesh.castShadow = true;
  rightLegMesh.position.y = -0.56 * stats.scale;
  rightLeg.add(rightLegMesh);
  group.add(rightLeg);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.92 * stats.scale, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  group.add(shadow);

  return {
    type,
    group,
    radius: stats.radius,
    hp: stats.hp,
    maxHp: stats.hp,
    speed: stats.speed,
    damage: stats.damage,
    alive: true,
    flash: 0,
    attackCooldown: 0,
    walkPhase: 0,
    parts: {
      body,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
    },
    mixer: null,
    stateMachine: null,
    _lastFlash: 0,
  };
}

function createSkinnedEnemy(type, position, gltf) {
  const stats = STATS_BY_TYPE[type];
  const root = skeletonClone(gltf.scene);
  root.scale.setScalar(stats.scale);
  root.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  const group = new THREE.Group();
  group.position.set(position[0], 0, position[2]);
  group.add(root);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.92 * stats.scale, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  group.add(shadow);

  const mixer = new THREE.AnimationMixer(root);
  const clipMap = buildClipMap(gltf.animations);
  const stateMachine = new AnimationStateMachine(mixer, clipMap);
  stateMachine.setState('idle');

  return {
    type,
    group,
    radius: stats.radius,
    hp: stats.hp,
    maxHp: stats.hp,
    speed: stats.speed,
    damage: stats.damage,
    alive: true,
    flash: 0,
    attackCooldown: 0,
    walkPhase: 0,
    parts: null,
    mixer,
    stateMachine,
    _lastFlash: 0,
    _lastAttackCooldown: 0,
  };
}

export function updateEnemies(enemies, dt, ctx) {
  const targetPos = ctx.getCombatTargetPosition();
  enemies.forEach(enemy => {
    if (!enemy.alive) {
      if (enemy.stateMachine && enemy.stateMachine.current() !== 'death') {
        enemy.stateMachine.setState('death');
        enemy.mixer.update(dt);
      }
      return;
    }

    enemy.flash = Math.max(0, enemy.flash - dt);
    const wasCooldown = enemy.attackCooldown;
    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
    enemy.walkPhase += dt * enemy.speed * 0.6;

    if (enemy.stateMachine) {
      enemy.mixer.update(dt);
    } else {
      enemy.parts.body.material.emissiveIntensity = enemy.flash > 0 ? 0.95 : 0.18;
      enemy.parts.leftLeg.rotation.x = Math.sin(enemy.walkPhase) * 0.3;
      enemy.parts.rightLeg.rotation.x = -Math.sin(enemy.walkPhase) * 0.3;
      enemy.parts.leftArm.rotation.x = -Math.sin(enemy.walkPhase) * 0.25;
      enemy.parts.rightArm.rotation.x = Math.sin(enemy.walkPhase) * 0.25;
    }

    const delta = targetPos.clone().sub(enemy.group.position);
    const distance = delta.length();
    const aggroRange = ctx.missionState === 'combat' ? 64 : 22;
    if (distance > aggroRange) {
      if (enemy.stateMachine) {
        const current = enemy.stateMachine.current();
        if (current !== 'attack' && current !== 'hit') enemy.stateMachine.setState('idle');
      }
      return;
    }

    delta.normalize();
    TMP_A.copy(enemy.group.position);
    TMP_B.copy(delta).multiplyScalar(enemy.speed * dt);
    ctx.colliders.moveBody(TMP_A, TMP_B, enemy.radius);
    enemy.group.position.copy(TMP_A);
    enemy.group.rotation.y = dampAngle(enemy.group.rotation.y, Math.atan2(delta.x, delta.z), 14, dt);

    let attacked = false;
    if (enemy.type === 'boss' && distance < 30 && enemy.attackCooldown <= 0) {
      ctx.spawnEnemyOrb(enemy);
      enemy.attackCooldown = 1.3;
      attacked = true;
    } else if (distance <= enemy.radius + (ctx.playerInVehicle ? 2.6 : 1.5) && enemy.attackCooldown <= 0) {
      ctx.damagePlayer(enemy.damage);
      enemy.attackCooldown = enemy.type === 'boss' ? 0.85 : 1.05;
      attacked = true;
    }

    if (enemy.stateMachine) {
      if (attacked) {
        enemy.stateMachine.playOnce('attack', 'walk');
      } else if (enemy.flash > 0 && enemy._lastFlash <= 0) {
        enemy.stateMachine.playOnce('hit', enemy.stateMachine.current() || 'walk');
      } else {
        const current = enemy.stateMachine.current();
        const oneShot = current === 'attack' || current === 'hit';
        if (!oneShot) {
          enemy.stateMachine.setState(enemy.speed > 4.5 ? 'run' : 'walk');
        }
      }
      enemy._lastFlash = enemy.flash;
    }
  });
}

export function clearEnemies(enemies, scene) {
  enemies.forEach(enemy => scene.remove(enemy.group));
}

export function spawnMissionEnemies(mission, savedEnemies, scene, gltfByType = {}) {
  const result = [];
  const source = savedEnemies || mission.enemies;
  source.forEach(def => {
    if (savedEnemies && def.alive === false) return;
    const enemy = createEnemy(def.type, def.position, gltfByType[def.type] || null);
    if (savedEnemies) {
      enemy.hp = def.hp;
      enemy.alive = def.alive !== false;
      enemy.group.visible = enemy.alive;
    }
    result.push(enemy);
    scene.add(enemy.group);
  });
  return result;
}
