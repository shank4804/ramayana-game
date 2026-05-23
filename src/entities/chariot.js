import * as THREE from '../../node_modules/three/build/three.module.js';

const VEHICLE_RADIUS = 2.55;
const TMP_A = new THREE.Vector3();
const TMP_B = new THREE.Vector3();

function damp(value, target, lambda, dt) {
  return THREE.MathUtils.lerp(value, target, 1 - Math.exp(-lambda * dt));
}

export function createChariot(spawn, yaw) {
  const group = new THREE.Group();

  const red = new THREE.MeshStandardMaterial({ color: 0x8d2e28, roughness: 0.72, metalness: 0.08 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x76502f, roughness: 0.84 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd8ad4f, roughness: 0.4, metalness: 0.42 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: 0.88 });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.68, 4.8), red);
  chassis.position.y = 1.72;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  const floor = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 3.3), wood);
  floor.position.set(0, 1.45, -0.1);
  floor.castShadow = true;
  floor.receiveShadow = true;
  group.add(floor);

  const frontBar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 5.2), wood);
  frontBar.position.set(0, 1.52, 4.1);
  frontBar.castShadow = true;
  group.add(frontBar);

  const frontYoke = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 1.6), gold);
  frontYoke.position.set(0, 1.58, 6.3);
  frontYoke.castShadow = true;
  group.add(frontYoke);

  const wheelPositions = [
    [-1.9, 0.95, -1.6],
    [1.9, 0.95, -1.6],
    [-1.9, 0.95, 1.6],
    [1.9, 0.95, 1.6],
  ];

  const wheels = wheelPositions.map(([x, y, z]) => {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.18, 12, 24), dark);
    wheel.castShadow = true;
    wheel.position.set(x, y, z);
    wheel.rotation.y = Math.PI / 2;
    group.add(wheel);
    return wheel;
  });

  const rails = [
    [-1.52, 2.24, -0.18, 0.18, 1.5, 3.2],
    [1.52, 2.24, -0.18, 0.18, 1.5, 3.2],
    [0, 2.24, -1.66, 2.86, 1.5, 0.18],
  ];

  rails.forEach(([x, y, z, sx, sy, sz]) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), gold);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(x, y, z);
    group.add(mesh);
  });

  const canopyPoles = [
    [-1.2, 3.45, -1.14],
    [1.2, 3.45, -1.14],
    [-1.2, 3.45, 1.06],
    [1.2, 3.45, 1.06],
  ];

  canopyPoles.forEach(([x, y, z]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 8), gold);
    pole.castShadow = true;
    pole.position.set(x, y, z);
    group.add(pole);
  });

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 3.0), red);
  canopy.castShadow = true;
  canopy.receiveShadow = true;
  canopy.position.set(0, 4.48, -0.04);
  group.add(canopy);

  const seat = new THREE.Group();
  seat.position.set(0, 1.52, -0.1);
  group.add(seat);

  group.position.copy(spawn);
  group.rotation.y = yaw;

  return {
    group,
    seat,
    wheels,
    speed: 0,
    steering: 0,
    occupied: false,
    radius: VEHICLE_RADIUS,
  };
}

export function updateChariot(vehicle, dt, ctx) {
  if (ctx.isPressed('KeyQ')) ctx.state.cameraYaw += dt * 1.35;
  if (ctx.isPressed('KeyE')) ctx.state.cameraYaw -= dt * 1.35;

  const throttle = (ctx.isPressed('KeyW', 'ArrowUp') ? 1 : 0) - (ctx.isPressed('KeyS', 'ArrowDown') ? 1 : 0);
  const steer = (ctx.isPressed('KeyD', 'ArrowRight') ? 1 : 0) - (ctx.isPressed('KeyA', 'ArrowLeft') ? 1 : 0);
  const brakeFactor = ctx.isPressed('Space') ? 8.5 : 2.8;

  vehicle.speed += throttle * 28 * dt;
  vehicle.speed = damp(vehicle.speed, 0, brakeFactor, dt);
  vehicle.speed = THREE.MathUtils.clamp(vehicle.speed, -10, 18);

  const steerAuthority = THREE.MathUtils.clamp(Math.abs(vehicle.speed) / 10, 0, 1);
  vehicle.steering = damp(vehicle.steering, steer * 0.5, 10, dt);
  vehicle.group.rotation.y -= vehicle.steering * steerAuthority * dt * 2.2 * Math.sign(vehicle.speed || 1);

  const forward = new THREE.Vector3(Math.sin(vehicle.group.rotation.y), 0, Math.cos(vehicle.group.rotation.y));
  TMP_A.copy(vehicle.group.position);
  TMP_B.copy(forward).multiplyScalar(vehicle.speed * dt);
  const collided = ctx.colliders.moveBody(TMP_A, TMP_B, vehicle.radius);
  vehicle.group.position.copy(TMP_A);
  if (collided) vehicle.speed *= -0.08;

  const wheelSpin = vehicle.speed * dt * 1.8;
  vehicle.wheels.forEach((wheel, index) => {
    wheel.rotation.x -= wheelSpin;
    if (index >= 2) wheel.rotation.z = vehicle.steering * 0.7;
  });
}

export function enterChariot(vehicle, player, state) {
  if (player.inVehicle) return;
  player.inVehicle = true;
  vehicle.occupied = true;
  vehicle.seat.add(player.group);
  player.group.position.set(0, 0, -0.2);
  player.group.rotation.set(0, 0, 0);
  player.velocity.set(0, 0, 0);
  state.cameraDistance = state.vehicleCameraDistance;
}

export function exitChariot(vehicle, player, scene, state) {
  if (!player.inVehicle) return;
  player.inVehicle = false;
  vehicle.occupied = false;
  scene.attach(player.group);

  const side = new THREE.Vector3(Math.cos(vehicle.group.rotation.y), 0, -Math.sin(vehicle.group.rotation.y));
  player.group.position.copy(vehicle.group.position).addScaledVector(side, 4.2);
  player.group.position.y = 0;
  player.group.rotation.set(0, vehicle.group.rotation.y, 0);
  state.cameraDistance = THREE.MathUtils.clamp(state.cameraDistance, 6.4, 10.4);
}
