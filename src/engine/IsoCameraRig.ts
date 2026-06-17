import * as THREE from "three";

const CAMERA_OFFSET = new THREE.Vector3(7.5, 11.8, 7.5);
const LOOK_AHEAD_LIMIT = 3.2;

export class IsoCameraRig {
  readonly camera: THREE.PerspectiveCamera;
  private readonly target = new THREE.Vector3();
  private readonly desired = new THREE.Vector3();
  private readonly lookTarget = new THREE.Vector3();

  constructor(private readonly container: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  }

  resize(width = this.container.clientWidth, height = this.container.clientHeight) {
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }

  snapTo(heroPosition: THREE.Vector3, aimPoint: THREE.Vector3) {
    this.computeTargets(heroPosition, aimPoint);
    this.camera.position.copy(this.desired);
    this.camera.lookAt(this.lookTarget);
  }

  update(heroPosition: THREE.Vector3, aimPoint: THREE.Vector3, deltaSeconds: number) {
    this.computeTargets(heroPosition, aimPoint);

    const blend = 1 - Math.exp(-deltaSeconds * 9);
    this.camera.position.lerp(this.desired, blend);
    this.camera.lookAt(this.lookTarget);
  }

  private computeTargets(heroPosition: THREE.Vector3, aimPoint: THREE.Vector3) {
    const lookAhead = aimPoint.clone().sub(heroPosition);
    lookAhead.y = 0;

    if (lookAhead.length() > LOOK_AHEAD_LIMIT) {
      lookAhead.setLength(LOOK_AHEAD_LIMIT);
    }

    this.target.copy(heroPosition).addScaledVector(lookAhead, 0.32);
    this.lookTarget.copy(this.target).setY(0.85);
    this.desired.copy(this.target).add(CAMERA_OFFSET);
  }
}
