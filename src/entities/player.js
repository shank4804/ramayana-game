import * as THREE from '../../node_modules/three/build/three.module.js';

const PLAYER_RADIUS = 1.1;
const TMP_A = new THREE.Vector3();
const TMP_B = new THREE.Vector3();

function damp(value, target, lambda, dt) {
  return THREE.MathUtils.lerp(value, target, 1 - Math.exp(-lambda * dt));
}

function shortestAngleDiff(current, target) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

function dampAngle(current, target, lambda, dt) {
  return current + shortestAngleDiff(current, target) * (1 - Math.exp(-lambda * dt));
}

export function createPlayer(spawn) {
  const group = new THREE.Group();
  group.position.copy(spawn);

  const clothMaterial = new THREE.MeshStandardMaterial({ color: 0x295ec0, roughness: 0.72, metalness: 0.06 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xe4bb8a, roughness: 0.8 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: 0xdca749, roughness: 0.5, metalness: 0.32 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x322414, roughness: 0.85 });

  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.55), clothMaterial);
  hips.castShadow = true;
  hips.position.y = 1.05;
  group.add(hips);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.3, 0.66), clothMaterial);
  torso.castShadow = true;
  torso.position.y = 1.93;
  group.add(torso);

  const sash = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.07, 8, 28), accentMaterial);
  sash.rotation.x = Math.PI / 2;
  sash.position.y = 1.62;
  group.add(sash);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 18), skinMaterial);
  head.castShadow = true;
  head.position.y = 2.98;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.37, 18, 18), darkMaterial);
  hair.castShadow = true;
  hair.position.y = 3.04;
  hair.scale.set(1.02, 0.86, 1.02);
  hair.position.z = -0.05;
  group.add(hair);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.72, 2.32, 0);
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.05, 0.24), skinMaterial);
  leftArmMesh.castShadow = true;
  leftArmMesh.position.y = -0.48;
  leftArm.add(leftArmMesh);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.72, 2.32, 0);
  const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.05, 0.24), skinMaterial);
  rightArmMesh.castShadow = true;
  rightArmMesh.position.y = -0.48;
  rightArm.add(rightArmMesh);
  group.add(rightArm);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.26, 0.9, 0);
  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.2, 0.3), darkMaterial);
  leftLegMesh.castShadow = true;
  leftLegMesh.position.y = -0.58;
  leftLeg.add(leftLegMesh);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.26, 0.9, 0);
  const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.2, 0.3), darkMaterial);
  rightLegMesh.castShadow = true;
  rightLegMesh.position.y = -0.58;
  rightLeg.add(rightLegMesh);
  group.add(rightLeg);

  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.04, 6, 24, Math.PI), accentMaterial);
  bow.rotation.z = Math.PI / 2;
  bow.position.set(0.78, 1.95, -0.12);
  group.add(bow);

  const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.8, 10), darkMaterial);
  quiver.castShadow = true;
  quiver.rotation.z = 0.34;
  quiver.position.set(-0.44, 1.9, -0.34);
  group.add(quiver);

  const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.12), accentMaterial);
  sword.castShadow = true;
  sword.position.set(-0.58, 1.24, 0.1);
  sword.rotation.z = 0.22;
  group.add(sword);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.85, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  group.add(shadow);

  return {
    group,
    hp: 100,
    maxHp: 100,
    radius: PLAYER_RADIUS,
    walkSpeed: 7.5,
    sprintSpeed: 12.5,
    velocity: new THREE.Vector3(),
    moveDir: new THREE.Vector3(0, 0, 1),
    swordCooldown: 0,
    bowCooldown: 0,
    dodgeCooldown: 0,
    invulnerable: 0,
    attackTime: 0,
    bowPose: 0,
    dodgeTime: 0,
    walkPhase: 0,
    inVehicle: false,
    parts: {
      torso,
      hips,
      head,
      hair,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      sword,
      bow,
    },
  };
}

export function updatePlayer(player, dt, ctx) {
  if (ctx.isPressed('KeyQ')) ctx.state.cameraYaw += dt * 1.65;
  if (ctx.isPressed('KeyE')) ctx.state.cameraYaw -= dt * 1.65;

  const inputX = (ctx.isPressed('KeyD', 'ArrowRight') ? 1 : 0) - (ctx.isPressed('KeyA', 'ArrowLeft') ? 1 : 0);
  const inputY = (ctx.isPressed('KeyW', 'ArrowUp') ? 1 : 0) - (ctx.isPressed('KeyS', 'ArrowDown') ? 1 : 0);
  const input = new THREE.Vector2(inputX, inputY);

  const forward = new THREE.Vector3(-Math.sin(ctx.state.cameraYaw), 0, -Math.cos(ctx.state.cameraYaw));
  const right = new THREE.Vector3(Math.cos(ctx.state.cameraYaw), 0, -Math.sin(ctx.state.cameraYaw));
  const move = new THREE.Vector3();

  if (input.lengthSq() > 0) {
    input.normalize();
    move.addScaledVector(right, input.x).addScaledVector(forward, input.y).normalize();
    player.moveDir.copy(move);
  }

  const targetSpeed = input.lengthSq() > 0
    ? (ctx.isPressed('ShiftLeft', 'ShiftRight') ? player.sprintSpeed : player.walkSpeed)
    : 0;

  const desiredVelocity = move.multiplyScalar(targetSpeed);
  player.velocity.x = damp(player.velocity.x, desiredVelocity.x, input.lengthSq() > 0 ? 12 : 9, dt);
  player.velocity.z = damp(player.velocity.z, desiredVelocity.z, input.lengthSq() > 0 ? 12 : 9, dt);

  if (player.dodgeTime > 0) {
    player.velocity.addScaledVector(player.moveDir, dt * 4.6);
  }

  TMP_A.copy(player.group.position);
  TMP_B.copy(player.velocity).multiplyScalar(dt);
  ctx.colliders.moveBody(TMP_A, TMP_B, player.radius);
  player.group.position.copy(TMP_A);

  const horizontalSpeed = Math.hypot(player.velocity.x, player.velocity.z);
  if (horizontalSpeed > 0.2) {
    player.walkPhase += dt * horizontalSpeed * 0.95;
  }

  const aimYaw = Math.atan2(forward.x, forward.z);
  if (ctx.isAiming) {
    player.group.rotation.y = dampAngle(player.group.rotation.y, aimYaw, 18, dt);
  } else if (horizontalSpeed > 0.25) {
    const moveYaw = Math.atan2(player.velocity.x, player.velocity.z);
    player.group.rotation.y = dampAngle(player.group.rotation.y, moveYaw, 15, dt);
  }
}

export function updatePlayerAnimation(player, dt, ctx) {
  const speed = player.inVehicle
    ? Math.abs(ctx.vehicleSpeed)
    : Math.hypot(player.velocity.x, player.velocity.z);

  if (!player.inVehicle) {
    player.walkPhase += dt * speed * 0.42;
  }

  const stride = player.inVehicle ? 0 : Math.min(0.75, speed * 0.08);
  const armSwing = Math.sin(player.walkPhase) * stride;
  const legSwing = Math.sin(player.walkPhase) * stride * 1.2;

  player.parts.leftLeg.rotation.x = legSwing;
  player.parts.rightLeg.rotation.x = -legSwing;

  const attackSwing = player.attackTime > 0 ? -1.2 * player.attackTime : 0;
  const bowPose = ctx.isAiming || player.bowPose > 0 ? 0.7 + player.bowPose * 0.3 : 0;

  player.parts.leftArm.rotation.x = -armSwing * 0.6 + bowPose * 0.3;
  player.parts.rightArm.rotation.x = armSwing * 0.6 + attackSwing - bowPose;
  player.parts.torso.position.y = 1.93 + Math.sin(player.walkPhase * 2) * Math.min(0.08, speed * 0.01);
  player.parts.head.rotation.y = ctx.isAiming ? Math.sin(ctx.elapsedTime * 0.7) * 0.08 : 0;
}

export function doDodge(player) {
  if (player.inVehicle || player.dodgeCooldown > 0) return;
  player.dodgeCooldown = 0.85;
  player.dodgeTime = 1;
  player.invulnerable = Math.max(player.invulnerable, 0.28);
  player.velocity.addScaledVector(player.moveDir, 8.8);
}

export function damagePlayer(player, amount) {
  if (player.invulnerable > 0) return false;
  player.hp = Math.max(0, player.hp - amount);
  player.invulnerable = 0.6;
  return true;
}
