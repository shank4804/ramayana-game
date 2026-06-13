import type * as THREE from "three";

import type { PlayerInputSnapshot } from "../gameplay/input/inputMapper";
import type { AyodhyaInteraction } from "../world/scenes/ayodhyaDistrict";

export type AyodhyaStoryPhase = "dasharathaPrologue" | "ramaGameplay";
export type QuestStatus = "locked" | "active" | "complete";
export type AyodhyaAudioCue = "ui" | "quest" | null;

export interface AyodhyaQuestState {
  id: "main.dasharathaBlessing" | "side.marketLamps";
  title: string;
  status: QuestStatus;
  objective: string;
}

export interface AyodhyaSliceDirectorState {
  storyPhase: AyodhyaStoryPhase;
  mainQuest: AyodhyaQuestState;
  sideQuest: AyodhyaQuestState;
}

export interface AyodhyaSliceView {
  allowPlayerControl: boolean;
  objective: string;
  prompt: string;
  notification: string;
  activeInteractionId: AyodhyaInteraction["id"] | null;
  audioCue: AyodhyaAudioCue;
  transitionTo: "forestExile" | null;
}

export interface AyodhyaSliceDirector {
  readonly state: AyodhyaSliceDirectorState;
  update(deltaSeconds: number, input: PlayerInputSnapshot, playerPosition: THREE.Vector3): AyodhyaSliceView;
}

const PROLOGUE_DURATION_SECONDS = 5.2;

export function createAyodhyaSliceDirector(interactions: readonly AyodhyaInteraction[]): AyodhyaSliceDirector {
  const state: AyodhyaSliceDirectorState = {
    storyPhase: "dasharathaPrologue",
    mainQuest: {
      id: "main.dasharathaBlessing",
      title: "A Prince's Duty",
      status: "locked",
      objective: "Attend Dasharatha's court",
    },
    sideQuest: {
      id: "side.marketLamps",
      title: "Market Lamps",
      status: "active",
      objective: "Light the lamps near the market stalls",
    },
  };
  let prologueTime = 0;
  let notification = "Dasharatha calls Rama before the court.";
  let notificationTime = 4.0;
  let wasInteracting = false;

  return {
    state,
    update(deltaSeconds, input, playerPosition) {
      const interactPressed = input.interact && !wasInteracting;
      wasInteracting = input.interact;
      let audioCue: AyodhyaAudioCue = null;

      if (state.storyPhase === "dasharathaPrologue") {
        prologueTime += deltaSeconds;

        if (interactPressed || prologueTime >= PROLOGUE_DURATION_SECONDS) {
          state.storyPhase = "ramaGameplay";
          state.mainQuest.status = "active";
          state.mainQuest.objective = "Speak with Dasharatha in the palace court";
          notification = "Rama takes control in Ayodhya.";
          notificationTime = 3.0;
          audioCue = "quest";
        }

        tickNotification(deltaSeconds);
        return {
          allowPlayerControl: false,
          objective: "Dasharatha prologue",
          prompt: "Court blessing - press E to begin Rama gameplay",
          notification,
          activeInteractionId: null,
          audioCue,
          transitionTo: null,
        };
      }

      const nearest = findNearestInteraction(interactions, playerPosition);
      let transitionTo: AyodhyaSliceView["transitionTo"] = null;
      if (nearest && interactPressed) {
        const result = handleInteraction(nearest);
        audioCue = result.audioCue;
        transitionTo = result.transitionTo;
      }

      tickNotification(deltaSeconds);

      return {
        allowPlayerControl: true,
        objective: getCurrentObjective(state),
        prompt: nearest ? getInteractionPrompt(nearest, state) : "WASD move - drag orbit - right mouse aim",
        notification,
        activeInteractionId: nearest?.id ?? null,
        audioCue,
        transitionTo,
      };
    },
  };

  function handleInteraction(interaction: AyodhyaInteraction): Pick<AyodhyaSliceView, "audioCue" | "transitionTo"> {
    if (interaction.id === "dasharathaBlessing" && state.mainQuest.status === "active") {
      state.mainQuest.status = "complete";
      state.mainQuest.objective = "Meet the guards at the city gate";
      notification = "Main quest complete: Dasharatha gives Rama his blessing.";
      notificationTime = 4.5;
      return { audioCue: "quest", transitionTo: null };
    }

    if (interaction.id === "marketLamps" && state.sideQuest.status === "active") {
      state.sideQuest.status = "complete";
      state.sideQuest.objective = "The market lamps are lit for evening prayers";
      notification = "Side quest complete: Market Lamps.";
      notificationTime = 4.0;
      return { audioCue: "quest", transitionTo: null };
    }

    if (interaction.kind === "storyGate") {
      if (state.mainQuest.status === "complete") {
        notification = "Rama accepts exile and leaves Ayodhya for the forest.";
        notificationTime = 3.8;
        return { audioCue: "quest", transitionTo: "forestExile" };
      }

      notification = "Story gate: Ayodhya remains closed until the exile story beat.";
      notificationTime = 3.4;
      return { audioCue: "ui", transitionTo: null };
    }

    return { audioCue: "ui", transitionTo: null };
  }

  function tickNotification(deltaSeconds: number): void {
    notificationTime = Math.max(0, notificationTime - deltaSeconds);
    if (notificationTime <= 0) {
      notification = "";
    }
  }
}

function getInteractionPrompt(interaction: AyodhyaInteraction, state: AyodhyaSliceDirectorState): string {
  if (interaction.kind === "storyGate" && state.mainQuest.status === "complete") {
    return "Press E to accept exile and enter Forest Exile";
  }

  return interaction.prompt;
}

function getCurrentObjective(state: AyodhyaSliceDirectorState): string {
  if (state.mainQuest.status === "active") {
    return state.mainQuest.objective;
  }

  if (state.sideQuest.status === "active") {
    return state.sideQuest.objective;
  }

  if (state.mainQuest.status === "complete") {
    return "Approach a city gate to begin exile";
  }

  return "Explore Ayodhya";
}

function findNearestInteraction(
  interactions: readonly AyodhyaInteraction[],
  playerPosition: THREE.Vector3,
): AyodhyaInteraction | null {
  let nearest: AyodhyaInteraction | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const interaction of interactions) {
    const [x, , z] = interaction.position;
    const distance = Math.hypot(playerPosition.x - x, playerPosition.z - z);

    if (distance <= interaction.radius && distance < nearestDistance) {
      nearest = interaction;
      nearestDistance = distance;
    }
  }

  return nearest;
}
