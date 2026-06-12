import type { AyodhyaAudioCue } from "../simulation/ayodhyaSlice";

export interface AyodhyaAudioUpdate {
  speed: number;
  moving: boolean;
  cue: AyodhyaAudioCue;
}

export interface AyodhyaAudioPass {
  update(deltaSeconds: number, state: AyodhyaAudioUpdate): void;
  dispose(): void;
}

export function createAyodhyaAudioPass(targetWindow: Window): AyodhyaAudioPass {
  const AudioContextCtor = typeof AudioContext === "undefined" ? null : AudioContext;
  const context = AudioContextCtor ? new AudioContextCtor() : null;
  let ambience: OscillatorNode | null = null;
  let music: OscillatorNode | null = null;
  let footstepTimer = 0;
  let disposed = false;

  const unlock = (): void => {
    if (!context || disposed) {
      return;
    }

    void context.resume();
    ensureBed();
  };

  targetWindow.addEventListener("keydown", unlock, { once: true });
  targetWindow.addEventListener("pointerdown", unlock, { once: true });

  return {
    update(deltaSeconds, state) {
      if (!context || disposed || context.state !== "running") {
        return;
      }

      ensureBed();

      if (state.cue) {
        playCue(context, state.cue);
      }

      if (!state.moving || state.speed < 0.15) {
        footstepTimer = 0;
        return;
      }

      footstepTimer -= deltaSeconds;
      if (footstepTimer <= 0) {
        playFootstep(context, state.speed);
        footstepTimer = state.speed > 3 ? 0.28 : 0.42;
      }
    },
    dispose() {
      disposed = true;
      targetWindow.removeEventListener("keydown", unlock);
      targetWindow.removeEventListener("pointerdown", unlock);
      ambience?.stop();
      music?.stop();
      void context?.close();
    },
  };

  function ensureBed(): void {
    if (!context || ambience || music) {
      return;
    }

    const nextMaster = context.createGain();
    nextMaster.gain.value = 0.045;
    nextMaster.connect(context.destination);
    const nextAmbience = context.createOscillator();
    nextAmbience.type = "sine";
    nextAmbience.frequency.value = 96;
    const ambienceGain = context.createGain();
    ambienceGain.gain.value = 0.35;
    nextAmbience.connect(ambienceGain).connect(nextMaster);
    nextAmbience.start();
    ambience = nextAmbience;

    const nextMusic = context.createOscillator();
    nextMusic.type = "triangle";
    nextMusic.frequency.value = 192;
    const musicGain = context.createGain();
    musicGain.gain.value = 0.18;
    nextMusic.connect(musicGain).connect(nextMaster);
    nextMusic.start();
    music = nextMusic;
  }
}

function playFootstep(context: AudioContext, speed: number): void {
  const step = context.createOscillator();
  const gain = context.createGain();
  step.type = "square";
  step.frequency.value = speed > 3 ? 86 : 72;
  gain.gain.setValueAtTime(0.04, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.055);
  step.connect(gain).connect(context.destination);
  step.start();
  step.stop(context.currentTime + 0.06);
}

function playCue(context: AudioContext, cue: Exclude<AyodhyaAudioCue, null>): void {
  const tone = context.createOscillator();
  const gain = context.createGain();
  tone.type = cue === "quest" ? "triangle" : "sine";
  tone.frequency.value = cue === "quest" ? 432 : 288;
  gain.gain.setValueAtTime(cue === "quest" ? 0.07 : 0.04, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
  tone.connect(gain).connect(context.destination);
  tone.start();
  tone.stop(context.currentTime + 0.18);
}
