import * as THREE from 'three';

const TMP_POS = new THREE.Vector3();
const TMP_DELTA = new THREE.Vector3();

const ARCHETYPES = {
  rakshasa: { color: 0x60221f, hp: 68, speed: 5.4, damage: 12, scale: 1.12, radius: 1.2 },
  guard: { color: 0x8b2f2f, hp: 54, speed: 4.8, damage: 8, scale: 1.0, radius: 1.15 },
  brute: { color: 0x55341a, hp: 110, speed: 3.3, damage: 18, scale: 1.45, radius: 1.55 },
  ravana: { color: 0x290a10, hp: 240, speed: 2.9, damage: 20, scale: 2.1, radius: 2.25 },
};

function dampAngle(current, target, lambda, dt) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * (1 - Math.exp(-lambda * dt));
}

export class Enemy {
  constructor(scene, type, position) {
    const stats = ARCHETYPES[type];
    const s = stats.scale;
    this.type = type;
    this.scene = scene;
    this.radius = stats.radius;
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.alive = true;
    this.flash = 0;
    this.attackCooldown = 0;
    this.walkPhase = Math.random() * Math.PI * 2;

    const group = new THREE.Group();
    group.position.set(position[0], 0, position[1]);
    this.group = group;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: stats.color, roughness: 0.76, emissive: 0x5b1212, emissiveIntensity: 0.18,
    });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd09a6b, roughness: 0.78 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.95 * s, 1.4 * s, 0.68 * s), bodyMat);
    body.position.y = 1.95 * s;
    body.castShadow = true;
    group.add(body);
    this.bodyMat = bodyMat;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34 * s, 14, 14), skinMat);
    head.position.y = 3.0 * s;
    head.castShadow = true;
    group.add(head);

    // Horns for rakshasa/ravana
    if (type === 'rakshasa' || type === 'ravana') {
      for (const side of [-1, 1]) {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09 * s, 0.45 * s, 8), bodyMat);
        horn.position.set(side * 0.22 * s, 3.32 * s, 0);
        horn.rotation.z = -side * 0.4;
        group.add(horn);
      }
    }

    const limb = (w, h, mat, x, y) => {
      const pivot = new THREE.Group();
      pivot.position.set(x, y, 0);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat);
      mesh.position.y = -h / 2 + 0.05;
      mesh.castShadow = true;
      pivot.add(mesh);
      group.add(pivot);
      return pivot;
    };
    this.leftArm = limb(0.22 * s, 1.0 * s, skinMat, -0.66 * s, 2.2 * s);
    this.rightArm = limb(0.22 * s, 1.0 * s, skinMat, 0.66 * s, 2.2 * s);
    this.leftLeg = limb(0.26 * s, 1.12 * s, bodyMat, -0.22 * s, 1.05 * s);
    this.rightLeg = limb(0.26 * s, 1.12 * s, bodyMat, 0.22 * s, 1.05 * s);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.9 * s, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    scene.add(group);
  }

  /**
   * ctx: { targetPos, colliders, inCombat, damagePlayer(amount), spawnOrb(enemy) }
   */
  update(dt, ctx) {
    if (!this.alive) return;

    this.flash = Math.max(0, this.flash - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.walkPhase += dt * this.speed * 0.6;
    this.bodyMat.emissiveIntensity = this.flash > 0 ? 0.95 : 0.18;

    const swing = Math.sin(this.walkPhase) * 0.3;
    this.leftLeg.rotation.x = swing;
    this.rightLeg.rotation.x = -swing;
    this.leftArm.rotation.x = -swing * 0.8;
    this.rightArm.rotation.x = swing * 0.8;

    const delta = ctx.targetPos.clone().sub(this.group.position);
    const distance = delta.length();
    const aggro = ctx.inCombat ? 64 : 22;
    if (distance > aggro) return;

    delta.normalize();
    TMP_POS.copy(this.group.position);
    TMP_DELTA.copy(delta).multiplyScalar(this.speed * dt);
    ctx.colliders.move(TMP_POS, TMP_DELTA, this.radius);
    this.group.position.copy(TMP_POS);
    this.group.rotation.y = dampAngle(this.group.rotation.y, Math.atan2(delta.x, delta.z), 14, dt);

    if (this.type === 'ravana' && distance < 30 && this.attackCooldown <= 0) {
      ctx.spawnOrb(this);
      this.attackCooldown = 1.3;
    } else if (distance <= this.radius + 1.5 && this.attackCooldown <= 0) {
      ctx.damagePlayer(this.damage);
      this.attackCooldown = this.type === 'ravana' ? 0.85 : 1.05;
    }
  }

  hit(damage) {
    if (!this.alive) return false;
    this.hp -= damage;
    this.flash = 0.3;
    if (this.hp <= 0) {
      this.alive = false;
      this.group.visible = false;
      return true; // killed
    }
    return false;
  }

  dispose() {
    this.scene.remove(this.group);
  }
}
