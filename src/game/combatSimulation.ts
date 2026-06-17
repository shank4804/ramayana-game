export interface Vec2 {
  x: number;
  z: number;
}

export interface EnemyState {
  id: number;
  position: Vec2;
  hp: number;
  maxHp: number;
  alive: boolean;
  flashTimer: number;
  deathTimer: number;
  knockback: Vec2;
  contactCooldown: number;
}

export interface DamageEvent {
  id: number;
  damage: number;
  position: Vec2;
}

export interface HeroDamageEvent {
  damage: number;
}

export interface CombatStepEvents {
  heroDamage: HeroDamageEvent[];
}

export interface CombatState {
  enemies: EnemyState[];
  nextEnemyId: number;
  heroHp: number;
  nextBasicAttackAt: number;
}

const ENEMY_MAX_HP = 100;
const BASIC_ATTACK_DAMAGE = 35;
const BASIC_ATTACK_COOLDOWN = 0.38;
const BASIC_ATTACK_RANGE = 2.45;
const BASIC_ATTACK_ARC_COS = Math.cos((62 * Math.PI) / 180);
const ENEMY_SPEED = 2.35;
const ENEMY_MELEE_RANGE = 0.82;
const ENEMY_MELEE_DAMAGE = 8;
const ENEMY_MELEE_COOLDOWN = 0.85;
const HIT_FLASH_SECONDS = 0.2;
const DEATH_SECONDS = 0.5;
const KNOCKBACK_SPEED = 5.5;
const KNOCKBACK_DECAY = 9;

export function createCombatState(spawns: Vec2[]): CombatState {
  return {
    enemies: spawns.map((position, index) => createEnemy(index + 1, position)),
    nextEnemyId: spawns.length + 1,
    heroHp: 100,
    nextBasicAttackAt: 0,
  };
}

export function resolveBasicAttack(
  state: CombatState,
  heroPosition: Vec2,
  aimDirection: Vec2,
  nowSeconds: number,
): DamageEvent[] {
  if (nowSeconds < state.nextBasicAttackAt) {
    return [];
  }

  state.nextBasicAttackAt = nowSeconds + BASIC_ATTACK_COOLDOWN;
  const forward = normalizedOrFallback(aimDirection, { x: 0, z: -1 });
  const hits: DamageEvent[] = [];

  for (const enemy of state.enemies) {
    if (!enemy.alive) {
      continue;
    }

    const toEnemy = subtract(enemy.position, heroPosition);
    const distance = length(toEnemy);

    if (distance > BASIC_ATTACK_RANGE) {
      continue;
    }

    const direction = normalizedOrFallback(toEnemy, forward);
    const dot = direction.x * forward.x + direction.z * forward.z;

    if (dot < BASIC_ATTACK_ARC_COS) {
      continue;
    }

    enemy.hp = Math.max(0, enemy.hp - BASIC_ATTACK_DAMAGE);
    enemy.flashTimer = HIT_FLASH_SECONDS;
    enemy.knockback.x += forward.x * KNOCKBACK_SPEED;
    enemy.knockback.z += forward.z * KNOCKBACK_SPEED;
    hits.push({
      id: enemy.id,
      damage: BASIC_ATTACK_DAMAGE,
      position: { ...enemy.position },
    });

    if (enemy.hp === 0) {
      enemy.alive = false;
      enemy.deathTimer = DEATH_SECONDS;
    }
  }

  return hits;
}

export function stepCombatSimulation(
  state: CombatState,
  heroPosition: Vec2,
  deltaSeconds: number,
): CombatStepEvents {
  const heroDamage: HeroDamageEvent[] = [];

  for (const enemy of state.enemies) {
    enemy.flashTimer = Math.max(0, enemy.flashTimer - deltaSeconds);
    enemy.contactCooldown = Math.max(0, enemy.contactCooldown - deltaSeconds);

    if (!enemy.alive) {
      enemy.deathTimer = Math.max(0, enemy.deathTimer - deltaSeconds);
      continue;
    }

    const toHero = subtract(heroPosition, enemy.position);
    const distance = length(toHero);
    const seek = normalizedOrFallback(toHero, { x: 0, z: 0 });

    enemy.position.x += (seek.x * ENEMY_SPEED + enemy.knockback.x) * deltaSeconds;
    enemy.position.z += (seek.z * ENEMY_SPEED + enemy.knockback.z) * deltaSeconds;

    const decay = Math.max(0, 1 - KNOCKBACK_DECAY * deltaSeconds);
    enemy.knockback.x *= decay;
    enemy.knockback.z *= decay;

    if (distance <= ENEMY_MELEE_RANGE && enemy.contactCooldown === 0) {
      state.heroHp = Math.max(0, state.heroHp - ENEMY_MELEE_DAMAGE);
      enemy.contactCooldown = ENEMY_MELEE_COOLDOWN;
      heroDamage.push({ damage: ENEMY_MELEE_DAMAGE });
    }
  }

  state.enemies = state.enemies.filter((enemy) => enemy.alive || enemy.deathTimer > 0);

  return { heroDamage };
}

function createEnemy(id: number, position: Vec2): EnemyState {
  return {
    id,
    position: { ...position },
    hp: ENEMY_MAX_HP,
    maxHp: ENEMY_MAX_HP,
    alive: true,
    flashTimer: 0,
    deathTimer: 0,
    knockback: { x: 0, z: 0 },
    contactCooldown: 0,
  };
}

function subtract(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x - b.x,
    z: a.z - b.z,
  };
}

function length(vector: Vec2): number {
  return Math.hypot(vector.x, vector.z);
}

function normalizedOrFallback(vector: Vec2, fallback: Vec2): Vec2 {
  const magnitude = length(vector);

  if (magnitude < 0.0001) {
    return { ...fallback };
  }

  return {
    x: vector.x / magnitude,
    z: vector.z / magnitude,
  };
}
