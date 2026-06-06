import * as THREE from 'three';

export const CANONICAL_STATES = ['idle', 'walk', 'run', 'attack', 'dodge', 'hit', 'death', 'aim'];

export const DEFAULT_CLIP_ALIASES = {
  idle: ['idle', 'Idle', 'Idle_Loop', 'CharacterArmature|Idle', 'Armature|Idle', 'Anim_Idle'],
  walk: ['walk', 'Walk', 'Walk_Cycle', 'walking', 'CharacterArmature|Walk', 'Armature|Walk'],
  run: ['run', 'Run', 'Run_Cycle', 'running', 'CharacterArmature|Run', 'Armature|Run'],
  attack: ['attack', 'Attack', 'Sword_Attack', 'Punch', 'Sword_Slash', 'CharacterArmature|Attack', 'Armature|Attack'],
  dodge: ['dodge', 'Dodge', 'Roll', 'Jump', 'CharacterArmature|Jump', 'Armature|Jump'],
  hit: ['hit', 'Hit', 'HitReact', 'Recieve_Hit', 'Receive_Hit', 'CharacterArmature|HitReact'],
  death: ['death', 'Death', 'Die', 'Dead', 'CharacterArmature|Death'],
  aim: ['aim', 'Aim', 'Aim_Idle', 'Bow_Aim', 'Shoot'],
};

/**
 * Find the first clip whose name matches any of the candidate names
 * (case-insensitive, exact match on trimmed name).
 */
export function resolveClip(clips, candidates) {
  if (!clips || clips.length === 0) return null;
  const byName = new Map();
  for (const clip of clips) {
    byName.set(clip.name.toLowerCase(), clip);
  }
  for (const candidate of candidates) {
    const hit = byName.get(candidate.toLowerCase());
    if (hit) return hit;
  }
  return null;
}

/**
 * Build a canonical-name → AnimationClip map from a GLB's clips and an
 * aliases table. Missing canonical states are left undefined; the state
 * machine treats that as "skip this transition".
 */
export function buildClipMap(animations, aliases = DEFAULT_CLIP_ALIASES) {
  const out = {};
  for (const state of CANONICAL_STATES) {
    const candidates = aliases[state] || [state];
    const clip = resolveClip(animations, candidates);
    if (clip) out[state] = clip;
  }
  return out;
}

const ONE_SHOT_STATES = new Set(['attack', 'dodge', 'hit']);

export class AnimationStateMachine {
  constructor(mixer, clipMap) {
    this.mixer = mixer;
    this.actions = {};
    for (const [name, clip] of Object.entries(clipMap)) {
      const action = mixer.clipAction(clip);
      if (ONE_SHOT_STATES.has(name)) {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      this.actions[name] = action;
    }
    this.currentState = null;
    this.returnState = null;

    this._onFinished = (event) => {
      const finishedName = Object.entries(this.actions)
        .find(([, action]) => action === event.action)?.[0];
      if (!finishedName || !ONE_SHOT_STATES.has(finishedName)) return;
      const next = this.returnState || 'idle';
      this.returnState = null;
      this.setState(next);
    };
    mixer.addEventListener('finished', this._onFinished);
  }

  current() {
    return this.currentState;
  }

  setState(name, { fade = 0.15 } = {}) {
    if (!this.actions[name]) return false;
    if (name === this.currentState) return false;
    const prev = this.currentState ? this.actions[this.currentState] : null;
    const next = this.actions[name];
    next.reset();
    next.enabled = true;
    next.setEffectiveWeight(1);
    next.play();
    if (prev) prev.crossFadeTo(next, fade, false);
    this.currentState = name;
    return true;
  }

  playOnce(name, returnTo) {
    if (!this.actions[name]) return false;
    this.returnState = returnTo || this.currentState || 'idle';
    return this.setState(name, { fade: 0.08 });
  }

  update(dt) {
    this.mixer.update(dt);
  }

  dispose() {
    this.mixer.removeEventListener('finished', this._onFinished);
    for (const action of Object.values(this.actions)) {
      action.stop();
    }
  }
}
