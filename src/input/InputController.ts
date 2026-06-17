import * as THREE from "three";
import type { PlayerIntent } from "../game/heroMotor";

const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export class InputController {
  readonly aimPoint = new THREE.Vector3(0, 0, -4);
  private readonly keys = new Set<string>();
  private readonly pointerNdc = new THREE.Vector2(0, 0);
  private readonly raycaster = new THREE.Raycaster();
  private dashQueued = false;
  private attackQueued = false;
  private attackHeld = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerdown", this.onPointerMove);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  focus() {
    this.canvas.focus();
  }

  updateAim(camera: THREE.Camera) {
    this.raycaster.setFromCamera(this.pointerNdc, camera);
    this.raycaster.ray.intersectPlane(GROUND_PLANE, this.aimPoint);
  }

  consumeIntent(): PlayerIntent {
    const move = new THREE.Vector3(
      this.axis("KeyD", "KeyA"),
      0,
      this.axis("KeyS", "KeyW"),
    );

    if (move.lengthSq() > 1) {
      move.normalize();
    }

    const intent: PlayerIntent = {
      move,
      aimPoint: this.aimPoint.clone(),
      dashPressed: this.dashQueued,
      attackPressed: this.attackQueued,
      attackHeld: this.attackHeld,
    };

    this.dashQueued = false;
    this.attackQueued = false;
    return intent;
  }

  private axis(positive: string, negative: string) {
    return Number(this.keys.has(positive)) - Number(this.keys.has(negative));
  }

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      event.preventDefault();
      if (!event.repeat) {
        this.dashQueued = true;
      }
    }

    this.keys.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
    const y = (event.clientY - rect.top) / Math.max(rect.height, 1);

    this.pointerNdc.set(x * 2 - 1, -(y * 2 - 1));
  };

  private readonly onPointerDown = (event: PointerEvent) => {
    if (event.button === 0) {
      this.attackQueued = true;
      this.attackHeld = true;
      this.canvas.setPointerCapture(event.pointerId);
    }
  };

  private readonly onPointerUp = (event: PointerEvent) => {
    if (event.button === 0) {
      this.attackHeld = false;
    }
  };
}
