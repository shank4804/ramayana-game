import * as THREE from "three";

export function createEmberField() {
  const count = 120;
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const radius = 6 + Math.random() * 17;
    const angle = Math.random() * Math.PI * 2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = 0.35 + Math.random() * 3.8;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xff8a2a,
      size: 0.055,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    }),
  );
}
