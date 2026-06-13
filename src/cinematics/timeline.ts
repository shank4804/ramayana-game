import * as THREE from "three";

export interface CameraKeyframe {
  time: number;
  position: THREE.Vector3Tuple;
  lookAt: THREE.Vector3Tuple;
}

export interface SubtitleCue {
  text: string;
  in: number;
  out: number;
}

export interface CutsceneTimeline {
  id: string;
  duration: number;
  trigger?: string;
  camera: CameraKeyframe[];
  subtitles: SubtitleCue[];
}

export interface CutsceneInput {
  skip: boolean;
}

export interface CutscenePlayerState {
  active: boolean;
  elapsed: number;
  timelineId: string | null;
}

export interface CutsceneView {
  active: boolean;
  subtitle: string;
}

export interface CutscenePlayer {
  readonly state: CutscenePlayerState;
  start(timeline: CutsceneTimeline): void;
  update(deltaSeconds: number, input: CutsceneInput): CutsceneView;
}

export const DASHARATHA_COURT_CUTSCENE: CutsceneTimeline = {
  id: "dasharatha-court-rail",
  duration: 7.2,
  trigger: "ramaGameplay",
  camera: [
    { time: 0, position: [-4.8, 3.1, 5.5], lookAt: [0, 1.25, 1.6] },
    { time: 2.4, position: [-2.8, 2.6, -1.2], lookAt: [0, 1.35, -4.2] },
    { time: 5.1, position: [2.8, 2.4, -4.8], lookAt: [0, 1.45, -6.6] },
    { time: 7.2, position: [0, 2.2, -2.8], lookAt: [0, 1.25, 1.6] },
  ],
  subtitles: [
    { in: 0.35, out: 2.4, text: "Dasharatha: Ayodhya looks to you, Rama." },
    { in: 2.75, out: 4.8, text: "Rama: I will walk the city and hear its people." },
    { in: 5.0, out: 7.0, text: "The palace court opens into the playable district." },
  ],
};

export function createCutscenePlayer(camera: THREE.PerspectiveCamera): CutscenePlayer {
  const state: CutscenePlayerState = {
    active: false,
    elapsed: 0,
    timelineId: null,
  };
  let activeTimeline: CutsceneTimeline | null = null;

  return {
    state,
    start(timeline) {
      activeTimeline = timeline;
      state.active = true;
      state.elapsed = 0;
      state.timelineId = timeline.id;
      applyCameraAtTime(camera, timeline, 0);
    },
    update(deltaSeconds, input) {
      if (!activeTimeline || !state.active) {
        return { active: false, subtitle: "" };
      }

      if (input.skip) {
        finish();
        return { active: false, subtitle: "" };
      }

      state.elapsed += deltaSeconds;
      applyCameraAtTime(camera, activeTimeline, state.elapsed);

      const subtitle = getSubtitle(activeTimeline, state.elapsed);

      if (state.elapsed >= activeTimeline.duration) {
        finish();
        return { active: false, subtitle: "" };
      }

      return {
        active: true,
        subtitle,
      };
    },
  };

  function finish(): void {
    state.active = false;
    state.elapsed = 0;
    state.timelineId = null;
    activeTimeline = null;
  }
}

function applyCameraAtTime(camera: THREE.PerspectiveCamera, timeline: CutsceneTimeline, time: number): void {
  const keyframes = timeline.camera;
  const first = keyframes[0];
  if (!first) {
    return;
  }

  const nextIndex = keyframes.findIndex((keyframe) => keyframe.time >= time);

  if (nextIndex <= 0) {
    setCamera(camera, first.position, first.lookAt);
    return;
  }

  if (nextIndex === -1) {
    const last = keyframes[keyframes.length - 1] ?? first;
    setCamera(camera, last.position, last.lookAt);
    return;
  }

  const previous = keyframes[nextIndex - 1] ?? first;
  const next = keyframes[nextIndex] ?? previous;
  const span = Math.max(0.001, next.time - previous.time);
  const t = smoothStep((time - previous.time) / span);
  const position = lerpTuple(previous.position, next.position, t);
  const lookAt = lerpTuple(previous.lookAt, next.lookAt, t);
  setCamera(camera, position, lookAt);
}

function setCamera(camera: THREE.PerspectiveCamera, position: THREE.Vector3Tuple, lookAt: THREE.Vector3Tuple): void {
  camera.position.set(position[0], position[1], position[2]);
  camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
}

function getSubtitle(timeline: CutsceneTimeline, time: number): string {
  return timeline.subtitles.find((subtitle) => time >= subtitle.in && time <= subtitle.out)?.text ?? "";
}

function lerpTuple(a: THREE.Vector3Tuple, b: THREE.Vector3Tuple, t: number): THREE.Vector3Tuple {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothStep(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}
