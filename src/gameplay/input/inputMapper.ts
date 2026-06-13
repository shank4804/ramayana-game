export interface PlayerInputSnapshot {
  moveX: number;
  moveZ: number;
  cameraYawDelta: number;
  cameraPitchDelta: number;
  sprint: boolean;
  dodge: boolean;
  interact: boolean;
  aim: boolean;
  attack: boolean;
  lockOn: boolean;
  cancel: boolean;
}

export interface InputMapper {
  getInputSnapshot(): PlayerInputSnapshot;
  dispose(): void;
}

export function createInputMapper(targetWindow: Window): InputMapper {
  const pressedKeys = new Set<string>();
  let leftMouseDown = false;
  let rightMouseDown = false;
  let cameraYawDelta = 0;
  let cameraPitchDelta = 0;

  const handleKeyDown = (event: KeyboardEvent): void => {
    pressedKeys.add(event.code);
  };
  const handleKeyUp = (event: KeyboardEvent): void => {
    pressedKeys.delete(event.code);
  };
  const handleMouseMove = (event: MouseEvent): void => {
    if (event.buttons === 1 || event.buttons === 2) {
      cameraYawDelta += event.movementX * 0.0032;
      cameraPitchDelta += event.movementY * 0.0024;
    }
  };
  const handleMouseDown = (event: MouseEvent): void => {
    if (event.button === 0) {
      leftMouseDown = true;
    }

    if (event.button === 2) {
      rightMouseDown = true;
    }
  };
  const handleMouseUp = (event: MouseEvent): void => {
    if (event.button === 0) {
      leftMouseDown = false;
    }

    if (event.button === 2) {
      rightMouseDown = false;
    }
  };
  const handleContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
  };

  targetWindow.addEventListener("keydown", handleKeyDown);
  targetWindow.addEventListener("keyup", handleKeyUp);
  targetWindow.addEventListener("mousemove", handleMouseMove);
  targetWindow.addEventListener("mousedown", handleMouseDown);
  targetWindow.addEventListener("mouseup", handleMouseUp);
  targetWindow.addEventListener("contextmenu", handleContextMenu);

  return {
    getInputSnapshot() {
      const gamepad = targetWindow.navigator.getGamepads().find((candidate) => candidate !== null);
      const gamepadMoveX = gamepad?.axes[0] ?? 0;
      const gamepadMoveZ = gamepad?.axes[1] ?? 0;
      const gamepadYaw = gamepad?.axes[2] ?? 0;
      const gamepadPitch = gamepad?.axes[3] ?? 0;

      const keyboardMoveX = getDigitalAxis(pressedKeys, "KeyD", "KeyA");
      const keyboardMoveZ = getDigitalAxis(pressedKeys, "KeyS", "KeyW");
      const snapshot = {
        moveX: clampAxis(keyboardMoveX || gamepadMoveX),
        moveZ: clampAxis(keyboardMoveZ || gamepadMoveZ),
        cameraYawDelta: cameraYawDelta + gamepadYaw * 0.035,
        cameraPitchDelta: cameraPitchDelta + gamepadPitch * 0.024,
        sprint: pressedKeys.has("ShiftLeft") || pressedKeys.has("ShiftRight") || Boolean(gamepad?.buttons[10]?.pressed),
        dodge: pressedKeys.has("Space") || Boolean(gamepad?.buttons[1]?.pressed),
        interact: pressedKeys.has("KeyE") || Boolean(gamepad?.buttons[0]?.pressed),
        aim: rightMouseDown || Boolean(gamepad?.buttons[6]?.pressed),
        attack: leftMouseDown || pressedKeys.has("KeyJ") || Boolean(gamepad?.buttons[7]?.pressed),
        lockOn: pressedKeys.has("KeyQ") || Boolean(gamepad?.buttons[9]?.pressed),
        cancel: pressedKeys.has("Escape") || Boolean(gamepad?.buttons[8]?.pressed),
      };

      cameraYawDelta = 0;
      cameraPitchDelta = 0;
      return snapshot;
    },
    dispose() {
      targetWindow.removeEventListener("keydown", handleKeyDown);
      targetWindow.removeEventListener("keyup", handleKeyUp);
      targetWindow.removeEventListener("mousemove", handleMouseMove);
      targetWindow.removeEventListener("mousedown", handleMouseDown);
      targetWindow.removeEventListener("mouseup", handleMouseUp);
      targetWindow.removeEventListener("contextmenu", handleContextMenu);
    },
  };
}

function getDigitalAxis(pressedKeys: ReadonlySet<string>, positive: string, negative: string): number {
  return Number(pressedKeys.has(positive)) - Number(pressedKeys.has(negative));
}

function clampAxis(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
