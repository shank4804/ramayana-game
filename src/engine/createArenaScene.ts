import * as THREE from "three";

export function createArenaScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090b10);
  scene.fog = new THREE.FogExp2(0x080a0e, 0.045);

  const ambient = new THREE.HemisphereLight(0x8ea7c9, 0x140d09, 0.55);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffb25f, 2.4);
  key.position.set(-6, 11, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -18;
  key.shadow.camera.right = 18;
  key.shadow.camera.top = 18;
  key.shadow.camera.bottom = -18;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x6e96ff, 1.35);
  rim.position.set(7, 7, -8);
  scene.add(rim);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 46, 46, 46),
    new THREE.MeshStandardMaterial({
      color: 0x17191d,
      roughness: 0.88,
      metalness: 0.04,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(42, 42, 0x3d332c, 0x25282e);
  grid.position.y = 0.012;
  scene.add(grid);

  const arenaRing = new THREE.Mesh(
    new THREE.RingGeometry(10.5, 10.75, 96),
    new THREE.MeshBasicMaterial({
      color: 0x5a3720,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide,
    }),
  );
  arenaRing.rotation.x = -Math.PI / 2;
  arenaRing.position.y = 0.018;
  scene.add(arenaRing);

  return { scene };
}
