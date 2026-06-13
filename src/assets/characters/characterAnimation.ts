import * as THREE from "three";

interface CharacterAnimationEntry {
  object: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  idle: THREE.AnimationAction | null;
  walk: THREE.AnimationAction | null;
  lastPosition: THREE.Vector3;
  moving: boolean;
  detachedFrames: number;
}

const entries = new Set<CharacterAnimationEntry>();
const clock = new THREE.Clock();
let tickerStarted = false;
const scratch = new THREE.Vector3();

/**
 * Drives idle/walk locomotion for a character from its own world-space speed,
 * so no game-loop wiring is needed. A single shared requestAnimationFrame loop
 * updates every registered character and prunes ones removed from the scene.
 */
export function registerCharacterAnimation(
  object: THREE.Object3D,
  clips: readonly THREE.AnimationClip[],
): void {
  const mixer = new THREE.AnimationMixer(object);
  const idleClip = clips.find((clip) => /idle/i.test(clip.name)) ?? null;
  const walkClip = clips.find((clip) => /walk/i.test(clip.name)) ?? null;

  const idle = idleClip ? mixer.clipAction(idleClip) : null;
  const walk = walkClip ? mixer.clipAction(walkClip) : null;

  idle?.play();
  if (walk) {
    walk.play();
    walk.setEffectiveWeight(0);
  }

  entries.add({
    object,
    mixer,
    idle,
    walk,
    lastPosition: object.getWorldPosition(new THREE.Vector3()),
    moving: false,
    detachedFrames: 0,
  });

  startTicker();
}

function startTicker(): void {
  if (tickerStarted) {
    return;
  }

  tickerStarted = true;
  clock.start();

  const tick = (): void => {
    const delta = Math.min(clock.getDelta(), 0.1);

    for (const entry of entries) {
      if (!entry.object.parent) {
        entry.detachedFrames += 1;

        if (entry.detachedFrames > 30) {
          entry.mixer.stopAllAction();
          entries.delete(entry);
        }

        continue;
      }

      entry.detachedFrames = 0;
      entry.object.getWorldPosition(scratch);
      const speed = scratch.distanceTo(entry.lastPosition) / Math.max(delta, 0.001);
      entry.lastPosition.copy(scratch);

      const shouldMove = speed > 0.35;
      if (shouldMove !== entry.moving) {
        entry.moving = shouldMove;
        crossfade(entry, shouldMove);
      }

      entry.mixer.update(delta);
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function crossfade(entry: CharacterAnimationEntry, moving: boolean): void {
  if (!entry.idle || !entry.walk) {
    return;
  }

  entry.idle.enabled = true;
  entry.walk.enabled = true;
  entry.idle.setEffectiveWeight(moving ? 0 : 1);
  entry.walk.setEffectiveWeight(moving ? 1 : 0);
}
