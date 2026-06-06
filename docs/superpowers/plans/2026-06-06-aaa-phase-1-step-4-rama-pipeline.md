# AAA Phase 1 — Step 4: Rama Character Pipeline Implementation Plan

**Goal:** Build the animation state machine + GLB-aware player loader so that when a Rama GLB is dropped into `assets/characters/rama.glb`, it replaces the primitive Rama mesh and drives skeletal animation. Until a GLB exists, the existing primitive Rama keeps working with the current procedural animation.

**Source spec:** [`docs/superpowers/specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md`](../specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md), section "Animation State Machine".

**Constraint:** The remote container used to author these commits has no internet access to Quaternius / Poly Pizza / Sketchfab. Step 4 is therefore split into:

- **4a (this plan, executable now):** infrastructure — animation state machine, mixer wiring, GLB-aware player loader with graceful primitive fallback, clip-name alias layer.
- **4b (later, after user drops `rama.glb` into `assets/`):** map the actual pack's clip names to canonical state names, validate idle/walk/run/attack/dodge/hit/death/aim transitions in browser, tune scale/orientation if needed.

This split is deliberate: it gets the plumbing in without flying blind on bone hierarchy / clip names that don't exist yet.

**Out of scope:** enemy GLB (Step 5), Ayodhya GLB (Step 6), polish (Step 7), final verification (Step 8).

---

## Canonical animation states

```
idle  walk  run  attack  dodge  hit  death  aim
```

Same state list will be reused by the enemy in Step 5 (minus `aim`).

## Clip name alias layer

Different GLTF packs use different clip names. The alias layer maps pack names to canonical names. Default aliases cover the most common Mixamo / Quaternius naming conventions; per-asset overrides can be passed in.

```js
const DEFAULT_ALIASES = {
  idle:   ['idle', 'Idle', 'Idle_Loop', 'CharacterArmature|Idle', 'Armature|Idle'],
  walk:   ['walk', 'Walk', 'Walk_Cycle', 'walking', 'CharacterArmature|Walk', 'Armature|Walk'],
  run:    ['run', 'Run', 'Run_Cycle', 'running', 'CharacterArmature|Run', 'Armature|Run'],
  attack: ['attack', 'Attack', 'Sword_Attack', 'Punch', 'CharacterArmature|Attack', 'Armature|Attack'],
  dodge:  ['dodge', 'Dodge', 'Roll', 'Jump'],
  hit:    ['hit', 'Hit', 'HitReact', 'Recieve_Hit'],
  death:  ['death', 'Death', 'Die', 'Dead'],
  aim:    ['aim', 'Aim', 'Aim_Idle', 'Bow_Aim'],
};
```

## Tasks

### Task 1: Create `src/engine/animation.js`

New module exporting:

- `class AnimationStateMachine` — owns an `AnimationMixer` and a map of canonical state → `AnimationAction`. Public API:
  - `constructor(mixer, clipMap)`
  - `setState(name, opts?)` — calls `crossFadeTo(action, 0.15)` to the new action; tracks current state
  - `current()` — returns current state name
  - `update(dt)` — `mixer.update(dt)`
  - `playOnce(name, returnTo)` — plays a one-shot clip, returns to `returnTo` (or previous) on finish. Used for `attack`, `dodge`, `hit`.
- `function buildClipMap(animations, aliases)` — given a `AnimationClip[]` from a loaded GLB and an aliases map, returns `{ idle: clip, walk: clip, ... }` with missing canonical states left undefined.
- `function resolveClipName(clips, candidates)` — internal helper, also exported for testing.

### Task 2: Update `src/entities/player.js`

Add optional `gltf` arg to `createPlayer(spawn, gltf?)`. When `gltf` is provided:
- Clone the scene via `SkeletonUtils.clone` (use the same helper already imported in `engine/assets.js`).
- Build `mixer = new THREE.AnimationMixer(clonedScene)` and `clipMap = buildClipMap(gltf.animations, DEFAULT_ALIASES)`.
- Attach `player.mixer` and `player.stateMachine = new AnimationStateMachine(mixer, clipMap)`.
- Start in `idle`.
- Skip the primitive mesh assembly entirely; `player.parts` is set to `null` so the existing procedural animation path knows to skip.

When `gltf` is not provided, behavior is unchanged from today.

Update `updatePlayerAnimation(player, dt, ctx)`:
- If `player.stateMachine`: derive desired state from movement speed / aim / attack / dodge flags and call `setState`. Update the mixer.
- Else: run the existing procedural arm/leg animation (unchanged).

### Task 3: Wire optional Rama GLB load in `app3d.js`

In `_bootAssets()`, attempt to fetch `./assets/characters/rama.glb`. Use a small `headExists` helper (HEAD request, ignore CORS quirks by allowing failure) to decide whether to call `assets.loadGLTF('rama', ...)`. If the file isn't present, just skip the load — no error, no retry overlay. The loading screen will still flash briefly via the no-op `startAll` path.

If loaded, pass the cached GLTF into a new player factory call (re-instantiate `this.player` after assets resolve). This is OK because the rest of the game state (mission, save) is only created at this point in the boot sequence; the order already supports a post-load player swap.

### Task 4: Verification

- `node --check` clean across all changed files
- With no `rama.glb` present: game boots, loading screen flashes, primitive Rama walks/runs/attacks as before (smoke test in browser)
- With a real `rama.glb` present (when the user supplies one): GLB Rama appears in place of the primitive; idle/walk/run animations play; transitions look smooth

### Task 5: Update docs

- `IMPLEMENTATION_PROGRESS.md` — mark Step 4a done, document Step 4b (final clip-name wiring) as a small follow-up that depends on the user dropping the file in.
- `ARCHITECTURE.md` — add the animation state machine to the engine layer description.

---

## Notes for the executing agent

- **Don't break the primitive fallback.** Today's smoke tests must still pass when no GLB exists. The whole point of Step 4a is to be additive.
- **Don't add error-retry UI for "file not present".** A missing GLB is not an error — it's the default state until the user supplies one. Only show the retry overlay for genuine network/parse failures of files that DO exist.
- **Don't commit a placeholder GLB.** Binary assets stay out of git. Step 4b lands the asset (and maybe a thin `assets/ATTRIBUTION.md`) once the user picks a pack.
- **Don't try to detect bone names yet.** The alias layer covers clip names. Bone names matter for prop attachment (sword in right hand) — that's Step 4b polish.
