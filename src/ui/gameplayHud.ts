export interface GameplayHudState {
  health: number;
  mode: string;
  notification?: string;
  objective: string;
  prompt: string;
  speed: number;
}

export interface GameplayHud {
  readonly element: HTMLElement;
  update(state: GameplayHudState): void;
}

export function createGameplayHud(): GameplayHud {
  const element = document.createElement("section");
  element.className = "gameplay-hud";
  element.setAttribute("aria-live", "polite");

  const health = document.createElement("div");
  health.className = "hud-health";

  const objective = document.createElement("div");
  objective.className = "hud-objective";

  const prompt = document.createElement("div");
  prompt.className = "hud-prompt";

  const notification = document.createElement("div");
  notification.className = "hud-notification";
  notification.hidden = true;

  element.append(health, objective, prompt, notification);

  return {
    element,
    update(state) {
      health.textContent = `Health ${Math.round(state.health)}`;
      objective.textContent = state.objective;
      prompt.textContent = `${state.prompt} - ${state.mode} - ${state.speed.toFixed(1)} m/s`;
      notification.textContent = state.notification ?? "";
      notification.hidden = !state.notification;
    },
  };
}
