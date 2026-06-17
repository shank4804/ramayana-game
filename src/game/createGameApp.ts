import * as THREE from "three";
import { createAttackArcView } from "../entities/attackArcView";
import { createRakshasaView, type RakshasaView } from "../entities/rakshasaView";
import { createHeroModel } from "../assets/heroModel";
import { IsoCameraRig } from "../engine/IsoCameraRig";
import { createArenaScene } from "../engine/createArenaScene";
import { createRenderer } from "../engine/createRenderer";
import { InputController } from "../input/InputController";
import { createPhysicsWorld } from "../physics/createPhysicsWorld";
import { DamageNumbers } from "../ui/damageNumbers";
import { createTitleScreen } from "../ui/titleScreen";
import { createEmberField } from "../vfx/embers";
import {
  createCombatState,
  resolveBasicAttack,
  stepCombatSimulation,
  type EnemyState,
} from "./combatSimulation";
import { HeroMotor } from "./heroMotor";

const MAX_FRAME_DELTA = 0.05;

export async function createGameApp(root: HTMLElement) {
  root.textContent = "";

  const renderer = createRenderer();
  root.append(renderer.domElement);

  const arena = createArenaScene();
  const cameraRig = new IsoCameraRig(root);
  const input = new InputController(renderer.domElement);
  const physics = await createPhysicsWorld();
  const heroMotor = new HeroMotor();
  const combat = createCombatState([
    { x: 3.8, z: -2.2 },
    { x: -4.1, z: -1.4 },
    { x: 0.8, z: 4.5 },
  ]);
  const hero = createHeroModel();
  const attackArc = createAttackArcView();
  const damageNumbers = new DamageNumbers(root);
  const enemyViews = new Map<number, RakshasaView>();
  const embers = createEmberField();
  const clock = new THREE.Clock();
  let mode: "title" | "playing" = "title";
  let animationTime = 0;

  arena.scene.add(hero.root);
  arena.scene.add(attackArc.root);
  arena.scene.add(embers);
  cameraRig.snapTo(physics.heroPosition(), input.aimPoint);

  const title = createTitleScreen(root, () => {
    mode = "playing";
    title.remove();
    input.focus();
  });

  function resize() {
    const width = root.clientWidth;
    const height = root.clientHeight;
    renderer.setSize(width, height, false);
    cameraRig.resize(width, height);
  }

  function updateHero(deltaSeconds: number) {
    input.updateAim(cameraRig.camera);

    const intent = input.consumeIntent();
    const currentPosition = physics.heroPosition();
    const motion = heroMotor.update(intent, currentPosition, deltaSeconds);
    const position = physics.moveHero(motion.velocity, deltaSeconds);
    const aimOffset = input.aimPoint.clone().sub(position);

    if (aimOffset.lengthSq() > 0.0001) {
      hero.root.rotation.y = Math.atan2(aimOffset.x, aimOffset.z);
    }

    hero.root.position.copy(position);
    hero.update(motion.speed, animationTime);
    updateCombat(position, aimOffset, intent.attackHeld || intent.attackPressed, deltaSeconds);
    cameraRig.update(position, input.aimPoint, deltaSeconds);
  }

  function updateCombat(
    heroPosition: THREE.Vector3,
    aimOffset: THREE.Vector3,
    attackRequested: boolean,
    deltaSeconds: number,
  ) {
    if (attackRequested) {
      const attackReady = animationTime >= combat.nextBasicAttackAt;
      const hitEvents = resolveBasicAttack(
        combat,
        { x: heroPosition.x, z: heroPosition.z },
        { x: aimOffset.x, z: aimOffset.z },
        animationTime,
      );

      if (attackReady) {
        const direction =
          aimOffset.lengthSq() > 0.0001
            ? aimOffset.clone().normalize()
            : hero.root.getWorldDirection(new THREE.Vector3());
        attackArc.trigger(heroPosition, direction);
      }

      for (const event of hitEvents) {
        damageNumbers.spawn(
          event.damage,
          new THREE.Vector3(event.position.x, 1.35, event.position.z),
        );
      }
    }

    stepCombatSimulation(combat, { x: heroPosition.x, z: heroPosition.z }, deltaSeconds);
    syncEnemyViews(combat.enemies);
  }

  function syncEnemyViews(enemies: EnemyState[]) {
    const liveIds = new Set<number>();

    for (const enemy of enemies) {
      liveIds.add(enemy.id);
      let view = enemyViews.get(enemy.id);

      if (!view) {
        view = createRakshasaView();
        enemyViews.set(enemy.id, view);
        arena.scene.add(view.root);
      }

      view.sync(enemy);
    }

    for (const [id, view] of enemyViews) {
      if (!liveIds.has(id)) {
        arena.scene.remove(view.root);
        enemyViews.delete(id);
      }
    }
  }

  function tick() {
    const deltaSeconds = Math.min(clock.getDelta(), MAX_FRAME_DELTA);
    animationTime += deltaSeconds;

    if (mode === "playing") {
      updateHero(deltaSeconds);
    } else {
      input.updateAim(cameraRig.camera);
      cameraRig.update(physics.heroPosition(), input.aimPoint, deltaSeconds);
      hero.update(0, animationTime);
    }

    attackArc.update(deltaSeconds);
    damageNumbers.update(deltaSeconds, cameraRig.camera);
    embers.rotation.y += deltaSeconds * 0.025;
    renderer.render(arena.scene, cameraRig.camera);
  }

  resize();
  syncEnemyViews(combat.enemies);
  window.addEventListener("resize", resize);

  return {
    start() {
      renderer.setAnimationLoop(tick);
    },
  };
}
