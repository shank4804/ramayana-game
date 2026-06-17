import * as THREE from "three";

const RUN_SPEED = 5.8;
const DASH_SPEED = 15.5;
const DASH_DURATION = 0.14;
const DASH_COOLDOWN = 0.52;

export interface PlayerIntent {
  move: THREE.Vector3;
  aimPoint: THREE.Vector3;
  dashPressed: boolean;
  attackPressed: boolean;
  attackHeld: boolean;
}

export interface HeroMotion {
  velocity: THREE.Vector3;
  speed: number;
}

export class HeroMotor {
  private dashCooldown = 0;
  private dashTimer = 0;
  private readonly dashDirection = new THREE.Vector3(0, 0, -1);

  update(intent: PlayerIntent, heroPosition: THREE.Vector3, deltaSeconds: number): HeroMotion {
    this.dashCooldown = Math.max(0, this.dashCooldown - deltaSeconds);
    this.dashTimer = Math.max(0, this.dashTimer - deltaSeconds);

    if (intent.dashPressed && this.dashCooldown === 0) {
      const aimDirection = intent.aimPoint.clone().sub(heroPosition);
      aimDirection.y = 0;

      if (aimDirection.lengthSq() > 0.0001) {
        this.dashDirection.copy(aimDirection).normalize();
      } else if (intent.move.lengthSq() > 0.0001) {
        this.dashDirection.copy(intent.move).normalize();
      }

      this.dashTimer = DASH_DURATION;
      this.dashCooldown = DASH_COOLDOWN;
    }

    if (this.dashTimer > 0) {
      return {
        velocity: this.dashDirection.clone().multiplyScalar(DASH_SPEED),
        speed: DASH_SPEED,
      };
    }

    const velocity = intent.move.clone().multiplyScalar(RUN_SPEED);
    return {
      velocity,
      speed: velocity.length(),
    };
  }
}
