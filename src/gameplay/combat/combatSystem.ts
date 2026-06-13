import * as THREE from "three";

import { createRamaStandInCharacter } from "../../assets/characters/ramaStandIn";
import { AYODHYA_PALETTE, createFlatMaterial } from "../../render/palette";

export type EnemyType = "guard" | "rakshasa";
export type EnemyAiState = "patrol" | "detect" | "chase" | "attack" | "return" | "dead";

export interface CombatInput {
  attack: boolean;
  aim: boolean;
  dodge: boolean;
  lockOn: boolean;
}

export interface CombatEnemy {
  id: string;
  type: EnemyType;
  object: THREE.Object3D;
  hp: number;
  maxHp: number;
  hitboxRadius: number;
  state: EnemyAiState;
  home: THREE.Vector3Tuple;
  patrolPhase: number;
  attackCooldown: number;
  staggerTimer: number;
}

export interface CombatProjectile {
  object: THREE.Object3D;
  direction: THREE.Vector3Tuple;
  speed: number;
  ttl: number;
  active: boolean;
}

export interface CombatState {
  comboStep: 0 | 1 | 2 | 3;
  comboTimer: number;
  crosshair: boolean;
  dodgeCooldown: number;
  invincibleTimer: number;
  lockedEnemyId: string | null;
  playerDamage: number;
  statusText: string;
}

export interface CombatEncounter {
  readonly root: THREE.Group;
  readonly enemies: CombatEnemy[];
  readonly projectiles: CombatProjectile[];
  readonly state: CombatState;
  update(deltaSeconds: number, player: THREE.Object3D, input: CombatInput): CombatState;
  getLockedTarget(): THREE.Object3D | null;
}

const DETECT_RADIUS = 7.2;
const LOCK_RADIUS = 9.5;
const SWORD_REACH = 1.75;
const PROJECTILE_HIT_RADIUS = 0.42;

export function createCombatEncounter(root = new THREE.Group()): CombatEncounter {
  root.name = "milestone-6-combat-encounter";
  const enemies = [createEnemy("guard-01", "guard", [-3.2, 0, 8.2]), createEnemy("rakshasa-01", "rakshasa", [4.2, 0, 8.8])];
  const projectiles: CombatProjectile[] = [];
  const slash = createSlashObject();
  const state: CombatState = {
    comboStep: 0,
    comboTimer: 0,
    crosshair: false,
    dodgeCooldown: 0,
    invincibleTimer: 0,
    lockedEnemyId: null,
    playerDamage: 0,
    statusText: "Combat ready",
  };
  let previousAttack = false;
  let previousDodge = false;
  let previousLockOn = false;

  for (const enemy of enemies) {
    root.add(enemy.object);
  }

  root.add(slash);
  slash.scale.set(0.001, 0.001, 0.001);

  return {
    root,
    enemies,
    projectiles,
    state,
    update(deltaSeconds, player, input) {
      state.playerDamage = 0;
      state.crosshair = input.aim;
      state.comboTimer = Math.max(0, state.comboTimer - deltaSeconds);
      state.dodgeCooldown = Math.max(0, state.dodgeCooldown - deltaSeconds);
      state.invincibleTimer = Math.max(0, state.invincibleTimer - deltaSeconds);

      if (state.comboTimer === 0) {
        state.comboStep = 0;
        slash.scale.set(0.001, 0.001, 0.001);
      }

      if (input.dodge && !previousDodge && state.dodgeCooldown === 0) {
        state.invincibleTimer = 0.32;
        state.dodgeCooldown = 0.85;
        state.statusText = "Dodge iFrames";
      }

      if (input.lockOn && !previousLockOn) {
        state.lockedEnemyId = cycleLockTarget(enemies, player, state.lockedEnemyId);
      }

      if (input.attack && !previousAttack) {
        if (input.aim) {
          fireArrow(root, projectiles, player);
          state.statusText = "Arrow fired";
        } else {
          swingSword(player, enemies, slash, state);
        }
      }

      updateProjectiles(projectiles, enemies, deltaSeconds);
      updateEnemies(enemies, player, deltaSeconds, state);
      if (state.lockedEnemyId && !enemies.some((enemy) => enemy.id === state.lockedEnemyId && enemy.state !== "dead")) {
        state.lockedEnemyId = null;
      }
      updateLockIndicators(enemies, state.lockedEnemyId);

      previousAttack = input.attack;
      previousDodge = input.dodge;
      previousLockOn = input.lockOn;
      return state;
    },
    getLockedTarget() {
      return enemies.find((enemy) => enemy.id === state.lockedEnemyId && enemy.state !== "dead")?.object ?? null;
    },
  };
}

function createEnemy(id: string, type: EnemyType, home: THREE.Vector3Tuple): CombatEnemy {
  const character = createRamaStandInCharacter({
    primarySwap: type === "rakshasa" ? "#5b4a63" : AYODHYA_PALETTE.teal.base,
    secondarySwap: type === "rakshasa" ? AYODHYA_PALETTE.saffron.base : AYODHYA_PALETTE.cream.base,
    skinSwap: type === "rakshasa" ? "#6d5752" : "#9d6447",
  }).object;
  character.name = id;
  character.position.set(home[0], home[1], home[2]);

  if (type === "rakshasa") {
    character.scale.set(1.22, 1.22, 1.22);
    const leftHorn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 5), createFlatMaterial("cream.base"));
    const rightHorn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 5), createFlatMaterial("cream.base"));
    leftHorn.position.set(-0.12, 2.14, 0);
    rightHorn.position.set(0.12, 2.14, 0);
    character.add(leftHorn, rightHorn);
  }

  const indicator = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 5, 18), createFlatMaterial("gold.base"));
  indicator.name = `${id}-lock-indicator`;
  indicator.position.set(0, type === "rakshasa" ? 2.55 : 2.3, 0);
  indicator.rotation.x = Math.PI * 0.5;
  indicator.scale.set(0.001, 0.001, 0.001);
  character.add(indicator);

  return {
    id,
    type,
    object: character,
    hp: type === "rakshasa" ? 90 : 48,
    maxHp: type === "rakshasa" ? 90 : 48,
    hitboxRadius: type === "rakshasa" ? 0.72 : 0.55,
    state: "patrol",
    home,
    patrolPhase: type === "rakshasa" ? Math.PI : 0,
    attackCooldown: 0,
    staggerTimer: 0,
  };
}

function createSlashObject(): THREE.Object3D {
  const slash = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.28), createFlatMaterial("saffron.base"));
  slash.name = "rama-sword-slash";
  return slash;
}

function swingSword(player: THREE.Object3D, enemies: CombatEnemy[], slash: THREE.Object3D, state: CombatState): void {
  const step = state.comboStep === 0 ? 1 : ((state.comboStep % 3) + 1) as 1 | 2 | 3;
  const damage = step === 3 ? 28 : step === 2 ? 20 : 16;
  const pause = step === 3 ? 0.62 : 0.34;
  state.comboStep = step;
  state.comboTimer = pause;
  state.statusText = `Sword combo ${step}`;

  const forwardX = Math.sin(player.rotation.y);
  const forwardZ = Math.cos(player.rotation.y);
  slash.position.set(player.position.x + forwardX * 0.82, 1.05, player.position.z + forwardZ * 0.82);
  slash.rotation.y = player.rotation.y + (step - 2) * 0.28;
  slash.scale.set(1, 1, 1);

  for (const enemy of enemies) {
    if (enemy.state === "dead") {
      continue;
    }

    const dx = enemy.object.position.x - player.position.x;
    const dz = enemy.object.position.z - player.position.z;
    const distance = Math.hypot(dx, dz);
    const facing = distance === 0 ? 1 : (dx * forwardX + dz * forwardZ) / distance;

    if (distance <= SWORD_REACH + enemy.hitboxRadius && facing > -0.2) {
      damageEnemy(enemy, damage, forwardX, forwardZ);
    }
  }
}

function fireArrow(root: THREE.Group, projectiles: CombatProjectile[], player: THREE.Object3D): void {
  const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.72, 5), createFlatMaterial("cream.base"));
  arrow.name = "rama-arrow-projectile";
  arrow.rotation.x = Math.PI * 0.5;
  const forwardX = Math.sin(player.rotation.y);
  const forwardZ = Math.cos(player.rotation.y);
  arrow.position.set(player.position.x + forwardX * 0.7, 1.25, player.position.z + forwardZ * 0.7);
  arrow.rotation.y = player.rotation.y;
  root.add(arrow);
  projectiles.push({
    object: arrow,
    direction: [forwardX, 0, forwardZ],
    speed: 12.5,
    ttl: 1.35,
    active: true,
  });
}

function updateProjectiles(projectiles: CombatProjectile[], enemies: CombatEnemy[], deltaSeconds: number): void {
  for (const projectile of projectiles) {
    if (!projectile.active) {
      continue;
    }

    projectile.ttl -= deltaSeconds;
    projectile.object.position.set(
      projectile.object.position.x + projectile.direction[0] * projectile.speed * deltaSeconds,
      projectile.object.position.y,
      projectile.object.position.z + projectile.direction[2] * projectile.speed * deltaSeconds,
    );

    for (const enemy of enemies) {
      if (enemy.state === "dead") {
        continue;
      }

      if (distance2D(projectile.object, enemy.object) <= enemy.hitboxRadius + PROJECTILE_HIT_RADIUS) {
        damageEnemy(enemy, 34, projectile.direction[0], projectile.direction[2]);
        projectile.active = false;
        projectile.object.scale.set(0.001, 0.001, 0.001);
        break;
      }
    }

    if (projectile.ttl <= 0) {
      projectile.active = false;
      projectile.object.scale.set(0.001, 0.001, 0.001);
    }
  }
}

function updateEnemies(enemies: CombatEnemy[], player: THREE.Object3D, deltaSeconds: number, state: CombatState): void {
  for (const enemy of enemies) {
    if (enemy.state === "dead") {
      enemy.object.scale.set(0.001, 0.001, 0.001);
      continue;
    }

    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - deltaSeconds);
    enemy.staggerTimer = Math.max(0, enemy.staggerTimer - deltaSeconds);

    if (enemy.staggerTimer > 0) {
      enemy.state = "detect";
      continue;
    }

    const playerDistance = distance2D(enemy.object, player);

    if (playerDistance <= 1.15 + enemy.hitboxRadius) {
      enemy.state = "attack";
      if (enemy.attackCooldown === 0 && state.invincibleTimer === 0) {
        state.playerDamage += enemy.type === "rakshasa" ? 16 : 9;
        state.statusText = `${enemy.type} hit Rama`;
        enemy.attackCooldown = enemy.type === "rakshasa" ? 1.25 : 0.82;
      }
      continue;
    }

    if (playerDistance <= DETECT_RADIUS) {
      enemy.state = playerDistance > 2.0 ? "chase" : "detect";
      moveToward(enemy.object, player.position.x, player.position.z, enemy.type === "rakshasa" ? 1.25 : 1.65, deltaSeconds);
      continue;
    }

    const homeDistance = Math.hypot(enemy.object.position.x - enemy.home[0], enemy.object.position.z - enemy.home[2]);
    if (homeDistance > 0.35) {
      enemy.state = "return";
      moveToward(enemy.object, enemy.home[0], enemy.home[2], 1.1, deltaSeconds);
    } else {
      enemy.state = "patrol";
      enemy.patrolPhase += deltaSeconds * 0.9;
      enemy.object.position.set(enemy.home[0] + Math.sin(enemy.patrolPhase) * 0.72, enemy.home[1], enemy.home[2]);
    }
  }
}

function damageEnemy(enemy: CombatEnemy, damage: number, impulseX: number, impulseZ: number): void {
  enemy.hp = Math.max(0, enemy.hp - damage);
  enemy.staggerTimer = enemy.hp === 0 ? 0 : 0.22;
  enemy.object.position.set(enemy.object.position.x + impulseX * 0.22, enemy.object.position.y, enemy.object.position.z + impulseZ * 0.22);

  if (enemy.hp === 0) {
    enemy.state = "dead";
  }
}

function cycleLockTarget(enemies: CombatEnemy[], player: THREE.Object3D, currentId: string | null): string | null {
  const candidates = enemies.filter((enemy) => enemy.state !== "dead" && distance2D(enemy.object, player) <= LOCK_RADIUS);
  if (!candidates.length) {
    return null;
  }

  const currentIndex = candidates.findIndex((enemy) => enemy.id === currentId);
  return candidates[(currentIndex + 1) % candidates.length]?.id ?? null;
}

function updateLockIndicators(enemies: CombatEnemy[], lockedId: string | null): void {
  for (const enemy of enemies) {
    const indicator = enemy.object.getObjectByName(`${enemy.id}-lock-indicator`);
    indicator?.scale.set(enemy.id === lockedId && enemy.state !== "dead" ? 1 : 0.001, enemy.id === lockedId ? 1 : 0.001, enemy.id === lockedId ? 1 : 0.001);
  }
}

function moveToward(object: THREE.Object3D, targetX: number, targetZ: number, speed: number, deltaSeconds: number): void {
  const dx = targetX - object.position.x;
  const dz = targetZ - object.position.z;
  const distance = Math.hypot(dx, dz);

  if (distance < 0.001) {
    return;
  }

  const step = Math.min(distance, speed * deltaSeconds);
  const directionX = dx / distance;
  const directionZ = dz / distance;
  object.position.set(object.position.x + directionX * step, object.position.y, object.position.z + directionZ * step);
  object.rotation.y = Math.atan2(directionX, directionZ);
}

function distance2D(a: THREE.Object3D, b: THREE.Object3D): number {
  return Math.hypot(a.position.x - b.position.x, a.position.z - b.position.z);
}
