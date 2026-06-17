import * as THREE from "three";
import { createHeroModel } from "../assets/heroModel";
import { IsoCameraRig } from "../engine/IsoCameraRig";
import { createArenaScene } from "../engine/createArenaScene";
import { createRenderer } from "../engine/createRenderer";
import { InputController } from "../input/InputController";
import { createPhysicsWorld } from "../physics/createPhysicsWorld";
import { createTitleScreen } from "../ui/titleScreen";
import { createEmberField } from "../vfx/embers";
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
  const hero = createHeroModel();
  const embers = createEmberField();
  const clock = new THREE.Clock();
  let mode: "title" | "playing" = "title";
  let animationTime = 0;

  arena.scene.add(hero.root);
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

    const currentPosition = physics.heroPosition();
    const motion = heroMotor.update(input.consumeIntent(), currentPosition, deltaSeconds);
    const position = physics.moveHero(motion.velocity, deltaSeconds);
    const aimOffset = input.aimPoint.clone().sub(position);

    if (aimOffset.lengthSq() > 0.0001) {
      hero.root.rotation.y = Math.atan2(aimOffset.x, aimOffset.z);
    }

    hero.root.position.copy(position);
    hero.update(motion.speed, animationTime);
    cameraRig.update(position, input.aimPoint, deltaSeconds);
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

    embers.rotation.y += deltaSeconds * 0.025;
    renderer.render(arena.scene, cameraRig.camera);
  }

  resize();
  window.addEventListener("resize", resize);

  return {
    start() {
      renderer.setAnimationLoop(tick);
    },
  };
}
