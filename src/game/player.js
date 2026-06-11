import * as THREE from 'three';

const TMP_POS = new THREE.Vector3();
const TMP_DELTA = new THREE.Vector3();

function damp(value, target, lambda, dt) {
  return THREE.MathUtils.lerp(value, target, 1 - Math.exp(-lambda * dt));
}

function dampAngle(current, target, lambda, dt) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * (1 - Math.exp(-lambda * dt));
}

function buildRamaMesh() {
  const group = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color: 0x295ec0, roughness: 0.72 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xe4bb8a, roughness: 0.8 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xdca749, roughness: 0.5, metalness: 0.3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x322414, roughness: 0.85 });

  const add = (mesh, x, y, z) => {
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };

  add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.55), cloth), 0, 1.05, 0);
  const torso = add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.64), cloth), 0, 1.93, 0);
  const sash = add(new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.07, 8, 24), gold), 0, 1.62, 0);
  sash.rotation.x = Math.PI / 2;
  const head = add(new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), skin), 0, 2.98, 0);
  const hair = add(new THREE.Mesh(new THREE.SphereGeometry(0.37, 16, 16), dark), 0, 3.04, -0.05);
  hair.scale.set(1.02, 0.86, 1.02);

  const limb = (geomW, geomH, material, x, y) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(geomW, geomH, geomW), material);
    mesh.position.y = -geomH / 2 + 0.06;
    mesh.castShadow = true;
    pivot.add(mesh);
    group.add(pivot);
    return pivot;
  };

  const leftArm = limb(0.24, 1.05, skin, -0.7, 2.32);
  const rightArm = limb(0.24, 1.05, skin, 0.7, 2.32);
  const leftLeg = limb(0.28, 1.2, dark, -0.26, 0.9);
  const rightLeg = limb(0.28, 1.2, dark, 0.26, 0.9);

  const bow = add(new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 6, 20, Math.PI), gold), 0.76, 1.95, -0.12);
  bow.rotation.z = Math.PI / 2;
  const sword = add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.15, 0.12), gold), -0.56, 1.24, 0.1);
  sword.rotation.z = 0.22;

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.85, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  group.add(shadow);

  return { group, parts: { torso, head, leftArm, rightArm, leftLeg, rightLeg } };
}

export class Player {
  constructor(scene, spawn) {
    const { group, parts } = buildRamaMesh();
    this.group = group;
    this.parts = parts;
    this.group.position.copy(spawn);
    scene.add(this.group);

    this.hp = 100;
    this.maxHp = 100;
    this.radius = 1.1;
    this.walkSpeed = 7.5;
    this.sprintSpeed = 12.5;
    this.velocity = new THREE.Vector3();
    this.moveDir = new THREE.Vector3(0, 0, 1);
    this.swordCooldown = 0;
    this.bowCooldown = 0;
    this.dodgeCooldown = 0;
    this.invulnerable = 0;
    this.attackAnim = 0;
    this.bowPose = 0;
    this.dodgeTime = 0;
    this.walkPhase = 0;
    this.aiming = false;
  }

  update(dt, input, cameraYaw, colliders) {
    this.swordCooldown = Math.max(0, this.swordCooldown - dt);
    this.bowCooldown = Math.max(0, this.bowCooldown - dt);
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.attackAnim = Math.max(0, this.attackAnim - dt * 2.8);
    this.bowPose = Math.max(0, this.bowPose - dt * 2.4);
    this.dodgeTime = Math.max(0, this.dodgeTime - dt * 2.2);

    const ix = (input.pressed('KeyD', 'ArrowRight') ? 1 : 0) - (input.pressed('KeyA', 'ArrowLeft') ? 1 : 0);
    const iy = (input.pressed('KeyW', 'ArrowUp') ? 1 : 0) - (input.pressed('KeyS', 'ArrowDown') ? 1 : 0);

    const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
    const move = new THREE.Vector3();
    const hasInput = ix !== 0 || iy !== 0;

    if (hasInput) {
      move.addScaledVector(right, ix).addScaledVector(forward, iy).normalize();
      this.moveDir.copy(move);
    }

    const targetSpeed = hasInput
      ? (input.pressed('ShiftLeft', 'ShiftRight') ? this.sprintSpeed : this.walkSpeed)
      : 0;
    const desired = move.multiplyScalar(targetSpeed);
    this.velocity.x = damp(this.velocity.x, desired.x, hasInput ? 12 : 9, dt);
    this.velocity.z = damp(this.velocity.z, desired.z, hasInput ? 12 : 9, dt);

    if (this.dodgeTime > 0) {
      this.velocity.addScaledVector(this.moveDir, dt * 4.5);
    }

    TMP_POS.copy(this.group.position);
    TMP_DELTA.copy(this.velocity).multiplyScalar(dt);
    colliders.move(TMP_POS, TMP_DELTA, this.radius);
    this.group.position.copy(TMP_POS);

    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > 0.2) this.walkPhase += dt * speed * 0.95;

    if (this.aiming) {
      const aimYaw = Math.atan2(forward.x, forward.z);
      this.group.rotation.y = dampAngle(this.group.rotation.y, aimYaw, 18, dt);
    } else if (speed > 0.25) {
      const moveYaw = Math.atan2(this.velocity.x, this.velocity.z);
      this.group.rotation.y = dampAngle(this.group.rotation.y, moveYaw, 15, dt);
    }

    this._animate(speed, dt);
  }

  _animate(speed) {
    const stride = Math.min(0.75, speed * 0.08);
    const swing = Math.sin(this.walkPhase) * stride;
    this.parts.leftLeg.rotation.x = swing * 1.2;
    this.parts.rightLeg.rotation.x = -swing * 1.2;
    const attackSwing = this.attackAnim > 0 ? -1.2 * this.attackAnim : 0;
    const bowPose = this.aiming || this.bowPose > 0 ? 0.7 + this.bowPose * 0.3 : 0;
    this.parts.leftArm.rotation.x = -swing * 0.6 + bowPose * 0.3;
    this.parts.rightArm.rotation.x = swing * 0.6 + attackSwing - bowPose;
    this.parts.torso.position.y = 1.93 + Math.sin(this.walkPhase * 2) * Math.min(0.08, speed * 0.01);
  }

  dodge() {
    if (this.dodgeCooldown > 0) return false;
    this.dodgeCooldown = 0.85;
    this.dodgeTime = 1;
    this.invulnerable = Math.max(this.invulnerable, 0.3);
    this.velocity.addScaledVector(this.moveDir, 8.8);
    return true;
  }

  takeDamage(amount) {
    if (this.invulnerable > 0) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invulnerable = 0.6;
    return true;
  }
}

export class FollowCamera {
  constructor(camera) {
    this.camera = camera;
    this.yaw = Math.PI * 1.08;
    this.pitch = 0.36;
    this.distance = 7.6;
    this.currentDistance = this.distance;
    this.enabled = true;
  }

  applyInput(input, dt) {
    const { dx, dy } = input.consumeLook();
    const sens = input.locked ? 0.0028 : 0.006;
    this.yaw -= dx * sens;
    this.pitch = THREE.MathUtils.clamp(this.pitch + dy * sens * 0.78, 0.14, 0.78);
    const wheel = input.consumeWheel();
    this.distance = THREE.MathUtils.clamp(this.distance + wheel * 0.01, 5.4, 11.5);
    void dt;
  }

  update(dt, target, aiming) {
    const focus = target.clone().add(new THREE.Vector3(0.6, 2.1, 0));
    const desiredDist = aiming ? Math.min(this.distance, 5.6) : this.distance;
    this.currentDistance = damp(this.currentDistance, desiredDist, 7.5, dt);

    const back = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch),
    );
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const desired = focus.clone()
      .addScaledVector(back, this.currentDistance)
      .addScaledVector(right, 1.2);

    this.camera.position.lerp(desired, 1 - Math.exp(-dt * 9));
    this.camera.lookAt(focus);
  }
}
