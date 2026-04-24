# AAA Phase 1 — Step 1: Refactor Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 2293-line monolithic `src/app3d.js` into focused ES modules under `src/engine/`, `src/world/`, `src/entities/`, `src/combat/`, `src/ui/`, `src/missions/` without changing any runtime behavior.

**Architecture:** Each extraction task moves one cohesive chunk of `app3d.js` into a new module file, re-imports it from `app3d.js`, and verifies the game still boots and plays identically. The orchestrator class `Ramayana3DGame` stays in `app3d.js` but shrinks below 500 lines once all extractions land. No bundler — vanilla ES modules loaded by `bootstrap.js` via dynamic import. Three.js continues to import from local `node_modules`.

**Tech Stack:** Vanilla JavaScript (ES modules), Three.js (local `node_modules`), Python `dev_server.py` for no-cache local serving.

**Source spec:** [`docs/superpowers/specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md`](../specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md), section "Implementation Order" item 1.

**Out of scope for this plan (covered by later plans):**
- Step 2 — Asset pipeline (`GLTFLoader`, `LoadingManager`, loading screen)
- Step 3 — Post-processing (`EffectComposer`, bloom, SSAO, FXAA, ACES retune)
- Step 4 — Rama character pipeline (GLTF + animation state machine)
- Step 5 — Enemy character pipeline
- Step 6 — Ayodhya district rebuild with GLTF assets
- Step 7 — Polish pass (palette, attribution)
- Step 8 — Final verification across quality tiers

This plan only does the verbatim code move. Behavior must be identical to commit `5ec2e79` after the plan completes.

---

## File Structure

After this plan completes, `src/` looks like:

```
src/
  bootstrap.js                  (unchanged)
  app3d.js                      (orchestrator only, <500 lines)
  engine/
    save.js                     (localStorage save/load + settings persistence)
    input.js                    (keyboard + mouse + pointer-lock state)
    camera.js                   (third-person follow logic)
    collision.js                (AABB registry + movement resolution)
    renderer.js                 (Three.js renderer creation + resize)
    lighting.js                 (sun + hemisphere + fog setup)
  world/
    world.js                    (district orchestrator)
    ayodhya.js                  (Ayodhya primitives — Phase 1 keeps as-is)
    forest.js                   (forest primitives)
    kishkindha.js               (Kishkindha primitives)
    lanka.js                    (Lanka primitives)
    ravana.js                   (Ravana court primitives)
    backdrop.js                 (sky + distant silhouettes)
    roads.js                    (road network)
    decor.js                    (shared primitive builders: tree, rock, lamp, etc.)
  entities/
    player.js                   (Rama controller + mesh assembly)
    chariot.js                  (vehicle controller + mesh assembly)
    enemy.js                    (enemy archetype + pursuit AI)
  combat/
    sword.js                    (cone hit detection)
    bow.js                      (arrow + enemy orb projectiles)
  ui/
    hud.js                      (chapter/objective card, status, radar, prompt, toast)
    overlay.js                  (cutscene/dialogue overlay)
    menu.js                     (title menu navigation + settings panel UI)
  missions/
    missions.js                 (MISSION_ORDER + mission progression state)
```

Legacy 2D files (`game.js`, `room.js`, `chapters.js`, `cutscene.js`, `renderer3d.js`, `level.js`, `hud.js`, `constants.js`) are **untouched** in this plan. They remain on disk but are not loaded by `index.html`. They will be deleted in a separate cleanup commit after Phase 1 ships, not here.

### Module dependency direction

```
bootstrap → app3d → (engine, world, entities, combat, ui, missions)
entities → engine (collision, input, camera)
world    → engine (collision)
combat   → entities (read-only access)
ui       → engine (save only)
missions → (pure data + state, no deps)
```

No circular imports. `app3d.js` is the only module that wires everything together.

---

## Conventions Used Throughout This Plan

**Verification after every task** uses two checks:

1. **Syntax check** — `node --check src/<modified file>.js` for each modified JS file. Expected: silent success (no output, exit 0).
2. **Smoke test** — start the dev server, load the page, run the smoke checklist below. Expected: identical behavior to the pre-extraction commit.

**Smoke checklist** (run after each task's verification step):
- Page loads without console errors
- Title menu appears with `New Game`, `Load Game`, `Settings`, `Exit`
- Arrow keys / WASD navigate menu, `Enter` selects
- `New Game` → prologue dialogue → chapter intro → playable scene
- Player walks with WASD/arrows, sprints with Shift, dodges with Space
- Mouse look + wheel zoom work
- Sword swing on LMB, bow aim on RMB hold, fire arrow on LMB while aiming
- `F` enters chariot, `F` exits chariot
- Enemies pursue and damage the player; killing all in a mission advances it
- Saving (autosave on mission complete) and `Load Game` from title both work
- Settings panel sliders persist across page reload

**Commit style** matches existing repo history (see `git log --oneline`): conventional `prefix: short summary` then optional body. Use `refactor:` for these extractions since behavior is unchanged.

**Imports use relative paths with `.js` extension** (required for browser-native ES modules):

```js
import { ColliderRegistry } from './engine/collision.js';
```

**No new dependencies** are introduced in this plan. Three.js is imported with the existing pattern:

```js
import * as THREE from 'three';
```

**If a step fails verification**, revert that task's changes (`git restore .`), re-read the task carefully, and try again. Never advance to the next task on a broken build.

---

## Task 0: Create directory scaffold and verify clean baseline

**Files:**
- Create: `src/engine/`, `src/world/`, `src/entities/`, `src/combat/`, `src/ui/`, `src/missions/` (empty directories — Git tracks them via the first file added in each)

- [ ] **Step 1: Verify clean baseline by booting the game**

```bash
python3 dev_server.py
```

In a browser, open `http://localhost:8000`. Run the full smoke checklist from "Conventions Used Throughout This Plan" above. Expected: all checks pass.

If anything fails on the baseline, **stop the plan** and report the regression. The refactor cannot proceed against an already-broken build.

- [ ] **Step 2: Create directory placeholders**

Run from repo root:

```bash
mkdir -p src/engine src/world src/entities src/combat src/ui src/missions
```

Git does not track empty directories, so no commit yet. The first file dropped into each directory in subsequent tasks will pick them up.

- [ ] **Step 3: Snapshot current line count**

Run:

```bash
wc -l src/app3d.js
```

Expected output: `2293 src/app3d.js`. If the count differs, the baseline drifted from the spec and the task counts in this plan may need adjustment — note the actual number and proceed.

---

## Task 1: Extract save module

**Files:**
- Create: `src/engine/save.js`
- Modify: `src/app3d.js` (remove `_saveGame`, `_loadSave`, `_hasSave`, `SAVE_KEY` constant; add import; replace internal calls)

**Source lines in `app3d.js` to move:** `SAVE_KEY` constant near top (~line 3), methods `_hasSave` (~line 2237), `_saveGame` (~line 2241), `_loadSave` (~line 2271). Verify exact line numbers with the editor before moving.

- [ ] **Step 1: Create `src/engine/save.js`**

Write the file with this content (copy `_saveGame` / `_loadSave` / `_hasSave` bodies verbatim from `app3d.js`, but expose them as plain functions that take a snapshot/state object instead of `this`):

```js
const SAVE_KEY = 'ramayana-3d-openworld-v3';

export function hasSave() {
  try {
    return Boolean(localStorage.getItem(SAVE_KEY));
  } catch (err) {
    return false;
  }
}

export function writeSave(snapshot) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    return true;
  } catch (err) {
    console.warn('save write failed', err);
    return false;
  }
}

export function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('save read failed', err);
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    /* ignore */
  }
}
```

**If the existing `_saveGame` / `_loadSave` body is more complex than this template** (e.g. it builds the snapshot inline from `this.player`, `this.vehicle`, etc.), keep the snapshot-building logic inside `app3d.js` and only move the localStorage read/write/serialization calls into `save.js`. Save module must not reference `this` or any class state.

- [ ] **Step 2: Update `src/app3d.js` to use the module**

At the top of `app3d.js`, after the existing `import * as THREE from 'three';` line, add:

```js
import { hasSave, writeSave, readSave, clearSave } from './engine/save.js';
```

Delete the `const SAVE_KEY = '...';` line (now lives in `save.js`).

Replace each call site:
- `_hasSave()` body → `return hasSave();`
- `_saveGame()` body → build the snapshot object as before, then `writeSave(snapshot);`
- `_loadSave()` body → `const save = readSave(); if (!save) return; ...rest of restore logic unchanged...`

Keep the wrapper methods on the class so the rest of `app3d.js` doesn't need to be touched. The class methods become thin shims around the module functions.

- [ ] **Step 3: Syntax check**

```bash
node --check src/engine/save.js && node --check src/app3d.js
```

Expected: silent success.

- [ ] **Step 4: Smoke test**

Start `python3 dev_server.py`, run the full smoke checklist. Pay special attention to:
- After `New Game` and one mission completion, reload the page and confirm `Load Game` is enabled and restores correctly.

- [ ] **Step 5: Commit**

```bash
git add src/engine/save.js src/app3d.js
git commit -m "refactor: extract save/load to engine/save.js"
```

---

## Task 2: Extract settings persistence

**Files:**
- Modify: `src/engine/save.js` (add settings helpers)
- Modify: `src/app3d.js` (remove `SETTINGS_KEY`, refactor `_loadSettings`/`_saveSettings`)

**Source lines in `app3d.js`:** `SETTINGS_KEY` constant near line 4, `_loadSettings` (~line 297), `_saveSettings` (~line 315).

- [ ] **Step 1: Append settings helpers to `src/engine/save.js`**

Add at the bottom of `src/engine/save.js`:

```js
const SETTINGS_KEY = 'ramayana-3d-settings-v1';
const SETTINGS_DEFAULTS = {
  sensitivity: 1.0,
  quality: 'high',
  invertY: false,
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...SETTINGS_DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...SETTINGS_DEFAULTS, ...parsed };
  } catch (err) {
    return { ...SETTINGS_DEFAULTS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('settings write failed', err);
  }
}
```

**Verify the `SETTINGS_DEFAULTS` shape matches the existing `_loadSettings` defaults in `app3d.js`** before saving — the keys and default values must match exactly. If `_loadSettings` defaults differ (e.g. uses `medium` quality, or has additional keys like `volume`), update `SETTINGS_DEFAULTS` here to match before continuing.

- [ ] **Step 2: Update `src/app3d.js` imports**

Change the existing import line to:

```js
import { hasSave, writeSave, readSave, clearSave, loadSettings, saveSettings } from './engine/save.js';
```

Delete the `const SETTINGS_KEY = '...';` line.

Replace `_loadSettings()` body with:

```js
return loadSettings();
```

Replace `_saveSettings()` body with:

```js
saveSettings(this.settings);
```

- [ ] **Step 3: Syntax check**

```bash
node --check src/engine/save.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Smoke checklist + specific check: open Settings, change sensitivity, close, reload page, reopen Settings — value persisted.

- [ ] **Step 5: Commit**

```bash
git add src/engine/save.js src/app3d.js
git commit -m "refactor: extract settings persistence to engine/save.js"
```

---

## Task 3: Extract input state

**Files:**
- Create: `src/engine/input.js`
- Modify: `src/app3d.js` (replace `this.keys`, `this.mouseButtons`, `this.pointer` with module-owned `InputState`; rewire `_bindEvents` and `_isPressed`)

**Source lines in `app3d.js`:** `this.keys`, `this.mouseButtons`, `this.pointer` initialization (~line 235-237); event binding in `_bindEvents` (~line 1054); `_isPressed` (~line 1497).

- [ ] **Step 1: Create `src/engine/input.js`**

```js
export class InputState {
  constructor() {
    this.keys = new Set();
    this.mouseButtons = new Set();
    this.pointer = { dragging: false, lastX: 0, lastY: 0, dx: 0, dy: 0 };
    this.pointerLocked = false;
    this.wheelDelta = 0;
    this._dodgeQueued = false;
    this._interactQueued = false;
  }

  isPressed(...codes) {
    for (const code of codes) {
      if (this.keys.has(code)) return true;
    }
    return false;
  }

  consumeDodge() {
    const v = this._dodgeQueued;
    this._dodgeQueued = false;
    return v;
  }

  queueDodge() {
    this._dodgeQueued = true;
  }

  consumeInteract() {
    const v = this._interactQueued;
    this._interactQueued = false;
    return v;
  }

  queueInteract() {
    this._interactQueued = true;
  }

  consumePointerDelta() {
    const dx = this.pointer.dx;
    const dy = this.pointer.dy;
    this.pointer.dx = 0;
    this.pointer.dy = 0;
    return { dx, dy };
  }

  consumeWheel() {
    const v = this.wheelDelta;
    this.wheelDelta = 0;
    return v;
  }
}
```

- [ ] **Step 2: Update `src/app3d.js` to use `InputState`**

Add import near the top:

```js
import { InputState } from './engine/input.js';
```

In the constructor, replace:

```js
this.keys = new Set();
this.mouseButtons = new Set();
this.pointer = { dragging: false, lastX: 0, lastY: 0 };
```

with:

```js
this.input = new InputState();
this.keys = this.input.keys;
this.mouseButtons = this.input.mouseButtons;
this.pointer = this.input.pointer;
```

The aliases (`this.keys`, `this.mouseButtons`, `this.pointer`) preserve every other reference in the file unchanged. They share the same underlying `Set` / object so existing reads still work.

Replace `_isPressed(...codes)` body with:

```js
return this.input.isPressed(...codes);
```

Inside `_bindEvents`, anywhere mouse-move accumulates pointer delta, also write to `this.input.pointer.dx`/`dy`. Anywhere wheel is captured, also write to `this.input.wheelDelta`. (These are added now so future tasks can switch to the consume API; the existing direct reads keep working.)

- [ ] **Step 3: Syntax check**

```bash
node --check src/engine/input.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Smoke checklist with extra focus on:
- WASD and arrow keys both move the player
- Shift sprints, Space dodges, F enters/exits chariot
- Mouse drag and pointer-lock both rotate the camera
- Wheel zoom works in both modes

- [ ] **Step 5: Commit**

```bash
git add src/engine/input.js src/app3d.js
git commit -m "refactor: extract input state to engine/input.js"
```

---

## Task 4: Extract collision registry

**Files:**
- Create: `src/engine/collision.js`
- Modify: `src/app3d.js` (move `_registerCollider`, `_moveBody`, `_resolveCollisions`, `_pointHitsCollider`)

**Source lines in `app3d.js`:** `this.colliders = []` (~line 249); `_registerCollider` (~line 1045); `_moveBody` (~line 1580); `_resolveCollisions` (~line 1588); `_pointHitsCollider` (~line 1777).

- [ ] **Step 1: Create `src/engine/collision.js`**

Copy the four method bodies verbatim, converting them to take an explicit `colliders` array as the first argument instead of using `this.colliders`:

```js
export class ColliderRegistry {
  constructor() {
    this.colliders = [];
  }

  register(x, z, width, depth, padding = 0) {
    // exact body of _registerCollider, replacing `this.colliders.push(...)` with `this.colliders.push(...)`
    // (the body is identical; only the receiver changes)
  }

  moveBody(position, delta, radius) {
    // exact body of _moveBody — internally calls this.resolveCollisions
  }

  resolveCollisions(position, radius) {
    // exact body of _resolveCollisions — iterate this.colliders
  }

  pointHitsCollider(point, padding) {
    // exact body of _pointHitsCollider — iterate this.colliders
  }
}
```

**Critical:** Read the exact existing bodies from `src/app3d.js` and paste them in. Do not paraphrase. Replace every `this.colliders` with `this.colliders` (same access pattern — the receiver is now the registry instance instead of the game). Replace every internal `this._resolveCollisions(...)` call with `this.resolveCollisions(...)` (drop the leading underscore for the public API).

- [ ] **Step 2: Update `src/app3d.js`**

Add import:

```js
import { ColliderRegistry } from './engine/collision.js';
```

In the constructor, replace `this.colliders = [];` with:

```js
this.colliderRegistry = new ColliderRegistry();
this.colliders = this.colliderRegistry.colliders;
```

The alias keeps any direct reads of `this.colliders.length` etc. working.

Replace each method body:

```js
_registerCollider(x, z, width, depth, padding = 0) {
  return this.colliderRegistry.register(x, z, width, depth, padding);
}

_moveBody(position, delta, radius) {
  return this.colliderRegistry.moveBody(position, delta, radius);
}

_resolveCollisions(position, radius) {
  return this.colliderRegistry.resolveCollisions(position, radius);
}

_pointHitsCollider(point, padding) {
  return this.colliderRegistry.pointHitsCollider(point, padding);
}
```

- [ ] **Step 3: Syntax check**

```bash
node --check src/engine/collision.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Full smoke checklist + extra focus on:
- Player cannot walk through buildings, walls, towers, trees in any district
- Chariot collides with same obstacles as on-foot
- Arrows are blocked by buildings (test by firing into a wall)

- [ ] **Step 5: Commit**

```bash
git add src/engine/collision.js src/app3d.js
git commit -m "refactor: extract collision registry to engine/collision.js"
```

---

## Task 5: Extract renderer creation

**Files:**
- Create: `src/engine/renderer.js`
- Modify: `src/app3d.js` (move `_createRenderer` + the renderer config block from constructor)

**Source lines in `app3d.js`:** `_createRenderer()` (~line 279); renderer setup in constructor (~lines 218-227).

- [ ] **Step 1: Create `src/engine/renderer.js`**

```js
import * as THREE from 'three';

export function createRenderer() {
  const attempts = [
    { antialias: true, powerPreference: 'high-performance' },
    { antialias: false, powerPreference: 'default' },
    { antialias: false, powerPreference: 'low-power' },
  ];

  // ... copy the rest of the existing _createRenderer body verbatim,
  // including the try/catch retry loop and the final throw if all attempts fail.

  // After the renderer is created, apply the standard config that the
  // constructor used to do inline:
  //   renderer.setPixelRatio(...)
  //   renderer.setSize(window.innerWidth, window.innerHeight)
  //   renderer.shadowMap.enabled = true
  //   renderer.shadowMap.type = THREE.PCFSoftShadowMap
  //   renderer.outputColorSpace = THREE.SRGBColorSpace
  //   renderer.toneMapping = THREE.ACESFilmicToneMapping
  //   renderer.toneMappingExposure = 1.05
  //   renderer.domElement.id = 'viewport'
  //
  // Return the configured renderer.
}
```

**Verify the `attempts` array exactly matches the existing one in `_createRenderer`** before saving — it may have different option combinations or a different fallback order. Copy literally; do not improve.

- [ ] **Step 2: Update `src/app3d.js`**

Add import:

```js
import { createRenderer } from './engine/renderer.js';
```

In the constructor, replace the renderer creation + config block (the lines from `this.renderer = this._createRenderer();` through `renderer.domElement.id = 'viewport';`) with:

```js
this.renderer = createRenderer();
this.root.prepend(this.renderer.domElement);
```

Delete the `_createRenderer` method from the class.

- [ ] **Step 3: Syntax check**

```bash
node --check src/engine/renderer.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Smoke checklist. Pay special attention to:
- Page loads with the WebGL canvas visible (no boot error overlay)
- Shadows render under buildings and trees
- Window resize triggers `_handleResize` and the canvas resizes correctly

- [ ] **Step 5: Commit**

```bash
git add src/engine/renderer.js src/app3d.js
git commit -m "refactor: extract renderer creation to engine/renderer.js"
```

---

## Task 6: Extract lighting

**Files:**
- Create: `src/engine/lighting.js`
- Modify: `src/app3d.js` (move sun + hemisphere light setup out of `_buildWorld` or wherever it lives)

**Source lines in `app3d.js`:** Search for `DirectionalLight` and `HemisphereLight` instantiations. They are likely in `_buildWorld` (~line 594) or `_buildBackdrop` (~line 777). Also move the scene fog assignment if it lives next to them.

- [ ] **Step 1: Identify the lighting code**

Run:

```bash
grep -n -E 'DirectionalLight|HemisphereLight|AmbientLight|scene\.fog' src/app3d.js
```

Note the line ranges. If lighting code is intermixed with primitive geometry, lift only the light/fog setup, leaving the geometry calls in `_buildWorld`.

- [ ] **Step 2: Create `src/engine/lighting.js`**

```js
import * as THREE from 'three';

export function installLighting(scene) {
  // Paste the existing DirectionalLight setup verbatim:
  //   const sun = new THREE.DirectionalLight(...)
  //   sun.position.set(...)
  //   sun.castShadow = true
  //   sun.shadow.mapSize.set(...)
  //   sun.shadow.camera.* = ...
  //   scene.add(sun)
  //
  // Paste the existing HemisphereLight setup verbatim:
  //   const hemi = new THREE.HemisphereLight(...)
  //   scene.add(hemi)
  //
  // Paste any existing AmbientLight verbatim if present.
  //
  // Paste the existing fog assignment verbatim if it lives with lights:
  //   scene.fog = new THREE.Fog(...)
  //
  // Return references for later phases:
  return { sun, hemi /* , ambient if present */ };
}
```

**Critical:** colors, intensities, positions, shadow map sizes, and shadow camera frustum bounds must match the existing values exactly. This is Step 1 — Step 3 of the parent spec is the lighting *re-tune*, not this task.

- [ ] **Step 3: Update `src/app3d.js`**

Add import:

```js
import { installLighting } from './engine/lighting.js';
```

Replace the lighting block in `_buildWorld` (or wherever it lives) with:

```js
this.lighting = installLighting(this.scene);
```

Delete the original light/fog instantiation lines from `app3d.js`.

If the scene background and fog were both set in the constructor (~line 230-231), keep them in the constructor — those are scene-level state, not lighting. Only move what was previously inside `_buildWorld`.

- [ ] **Step 4: Syntax check**

```bash
node --check src/engine/lighting.js && node --check src/app3d.js
```

- [ ] **Step 5: Smoke test**

Smoke checklist with visual focus:
- Scene brightness and color cast match the pre-extraction commit (compare side-by-side if unsure)
- Shadows render at correct softness
- Distant geometry fades to fog at the same distance as before

- [ ] **Step 6: Commit**

```bash
git add src/engine/lighting.js src/app3d.js
git commit -m "refactor: extract lighting setup to engine/lighting.js"
```

---

## Task 7: Extract camera controller

**Files:**
- Create: `src/engine/camera.js`
- Modify: `src/app3d.js` (move `_updateCamera`)

**Source lines in `app3d.js`:** `_updateCamera` (~line 2098); camera-related state in constructor (`cameraYaw`, `cameraPitch`, `cameraDistance`, `currentCameraDistance`, `vehicleCameraDistance` ~lines 243-247).

- [ ] **Step 1: Create `src/engine/camera.js`**

```js
import * as THREE from 'three';

export class ThirdPersonCamera {
  constructor(camera) {
    this.camera = camera;
    this.yaw = Math.PI * 1.08;
    this.pitch = 0.38;
    this.distance = 7.4;
    this.currentDistance = this.distance;
    this.vehicleDistance = 10.2;
    this.sensitivity = 1.0;
    this.invertY = false;
  }

  applySettings(settings) {
    this.sensitivity = settings.sensitivity ?? 1.0;
    this.invertY = settings.invertY ?? false;
  }

  update(dt, target, mode /* 'foot' | 'vehicle' */) {
    // Paste the body of the existing _updateCamera here.
    // Replace `this.camera*` with `this.*` (the local fields above).
    // Replace `this.camera` (the THREE.Camera) with `this.camera` (still works — same name).
    // Take the player/vehicle target position from the `target` argument instead of reaching into `this.player` / `this.vehicle`.
  }
}
```

**Critical:** the math (yaw clamping, pitch clamping, distance damping, look-at offset) must be a literal copy. Camera feel is fragile.

- [ ] **Step 2: Update `src/app3d.js`**

Add import:

```js
import { ThirdPersonCamera } from './engine/camera.js';
```

In the constructor, replace the five camera-state initializers with:

```js
this.cameraRig = new ThirdPersonCamera(this.camera);
// Aliases for backward-compat reads elsewhere in the file:
this.cameraYaw = this.cameraRig.yaw;        // NOTE: these are snapshots, not live refs
this.cameraPitch = this.cameraRig.pitch;
this.cameraDistance = this.cameraRig.distance;
this.currentCameraDistance = this.cameraRig.currentDistance;
this.vehicleCameraDistance = this.cameraRig.vehicleDistance;
```

**Important:** `cameraYaw`/`cameraPitch` are mutated every frame. The aliases above are stale by frame 2. So **before extracting**, grep for every read of these fields outside `_updateCamera`:

```bash
grep -n -E 'this\.(cameraYaw|cameraPitch|cameraDistance|currentCameraDistance|vehicleCameraDistance)' src/app3d.js
```

Every site that *reads* these fields outside `_updateCamera` must be rewritten to read from `this.cameraRig.yaw` etc. Every site that *writes* these fields (e.g. mouse-move handler updating yaw) must be rewritten to write to `this.cameraRig`. Do this rewrite as part of this task before deleting `_updateCamera`.

Replace `_updateCamera(dt)` body with:

```js
const target = this.vehicle.occupied ? this.vehicle : this.player;
const mode = this.vehicle.occupied ? 'vehicle' : 'foot';
this.cameraRig.update(dt, target, mode);
```

- [ ] **Step 3: Apply settings to camera rig**

In `_applySettings()`, after the existing body, append:

```js
this.cameraRig.applySettings(this.settings);
```

- [ ] **Step 4: Syntax check**

```bash
node --check src/engine/camera.js && node --check src/app3d.js
```

- [ ] **Step 5: Smoke test**

Smoke checklist with extra focus on camera feel:
- Mouse drag rotates camera at the same speed as before
- Pointer-lock mouse rotates camera correctly
- Wheel zoom in/out works at the same rate
- Settings → sensitivity slider has the expected effect
- Settings → invert-Y toggle has the expected effect
- Camera transitions smoothly between on-foot and vehicle modes

- [ ] **Step 6: Commit**

```bash
git add src/engine/camera.js src/app3d.js
git commit -m "refactor: extract third-person camera to engine/camera.js"
```

---

## Task 8: Extract decor primitive builders

**Files:**
- Create: `src/world/decor.js`
- Modify: `src/app3d.js` (move shared `_addX` builders)

**Source methods in `app3d.js` to move:** `_addGroundPatch` (~806), `_addRoad` (~817), `_addLaneMark` (~827), `_addBuilding` (~837), `_addWall` (~870), `_addGateArch` (~882), `_addTower` (~903), `_addStreetLamp` (~925), `_addTorch` (~946), `_addTree` (~967), `_addRock` (~987), `_addRuin` (~1000), `_addBridge` (~1010), `_addBanner` (~1028).

These are pure mesh builders that take a position and return / add a mesh to the scene. They are shared across districts.

- [ ] **Step 1: Create `src/world/decor.js`**

For each `_addX(x, z, ...)` method in `app3d.js`, export an equivalent function:

```js
import * as THREE from 'three';

export function addGroundPatch(parent, colliders, x, z, width, depth, color) {
  // body of _addGroundPatch — replace `this.decor.add(mesh)` with `parent.add(mesh)`,
  // and replace any `this._registerCollider(...)` with `colliders.register(...)`.
}

// ... export each builder the same way.
```

**Signature convention:** every builder takes `(parent, colliders, ...originalArgs)`. `parent` is the THREE.Group/Scene to add into. `colliders` is the `ColliderRegistry` instance (pass `null` if the builder doesn't register colliders). Other args are whatever the original `_addX` took.

**Critical:** copy bodies verbatim. Material colors, geometry sizes, mesh names, shadow flags must be identical. This is the largest extraction by line count — do it carefully.

- [ ] **Step 2: Update `src/app3d.js`**

Add import:

```js
import * as decor from './world/decor.js';
```

For every `this._addX(...)` call site inside the district builders (`_buildAyodhyaDistrict` etc., not yet extracted), rewrite to:

```js
decor.addX(this.decor, this.colliderRegistry, ...);
```

Then delete the `_addX` methods from the class.

- [ ] **Step 3: Syntax check**

```bash
node --check src/world/decor.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Full smoke checklist with extra visual diff:
- Each district's ground, roads, buildings, walls, towers, lamps, torches, trees, rocks, ruins, bridges, banners look identical to before
- Collisions on towers/buildings/trees still block movement
- Street lamps still emit light (if they did before)

- [ ] **Step 5: Commit**

```bash
git add src/world/decor.js src/app3d.js
git commit -m "refactor: extract decor primitive builders to world/decor.js"
```

---

## Task 9: Extract Ayodhya district

**Files:**
- Create: `src/world/ayodhya.js`
- Modify: `src/app3d.js` (move `_buildAyodhyaDistrict`)

- [ ] **Step 1: Create `src/world/ayodhya.js`**

```js
import * as decor from './decor.js';

export function buildAyodhya(parent, colliders) {
  // Paste the full body of _buildAyodhyaDistrict here.
  // Replace every `this._addX(...)` call with `decor.addX(parent, colliders, ...)`.
  // Replace `this.decor` references with `parent`.
  // Replace `this._registerCollider(...)` with `colliders.register(...)`.
  //
  // If the original method returns anything (spawn points, marker positions),
  // return them here too.
}
```

- [ ] **Step 2: Update `src/app3d.js`**

Add import:

```js
import { buildAyodhya } from './world/ayodhya.js';
```

In `_buildWorld`, replace the call `this._buildAyodhyaDistrict()` with:

```js
buildAyodhya(this.decor, this.colliderRegistry);
```

Delete `_buildAyodhyaDistrict` from the class.

- [ ] **Step 3: Syntax check**

```bash
node --check src/world/ayodhya.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Smoke checklist + spawn into the Ayodhya mission and walk the entire district. Confirm every building, wall, gate, tree is present and in the same place.

- [ ] **Step 5: Commit**

```bash
git add src/world/ayodhya.js src/app3d.js
git commit -m "refactor: extract Ayodhya district to world/ayodhya.js"
```

---

## Task 10: Extract Forest, Kishkindha, Lanka, Ravana districts

**Files:**
- Create: `src/world/forest.js`, `src/world/kishkindha.js`, `src/world/lanka.js`, `src/world/ravana.js`
- Modify: `src/app3d.js`

Apply the **exact same pattern** as Task 9, once per district. For each:

- [ ] **Step 1: Create `src/world/forest.js`** with `export function buildForest(parent, colliders) { ... }` containing the body of `_buildForestDistrict` (~line 691).
- [ ] **Step 2: Create `src/world/kishkindha.js`** with `export function buildKishkindha(parent, colliders)` from `_buildKishkindhaDistrict` (~line 732).
- [ ] **Step 3: Create `src/world/lanka.js`** with `export function buildLanka(parent, colliders)` from `_buildLankaDistrict` (~line 749).
- [ ] **Step 4: Create `src/world/ravana.js`** with `export function buildRavana(parent, colliders)` from whichever method builds the Ravana court approach (search for `Ravana` in the file).
- [ ] **Step 5: Update `src/app3d.js`** — import all four and replace the call sites in `_buildWorld`. Delete the four `_buildXDistrict` methods.
- [ ] **Step 6: Syntax check**

```bash
for f in forest kishkindha lanka ravana; do node --check src/world/$f.js; done && node --check src/app3d.js
```

- [ ] **Step 7: Smoke test**

Play through the full mission sequence to visit every district. Confirm visuals and collisions are unchanged in each.

- [ ] **Step 8: Commit**

```bash
git add src/world/forest.js src/world/kishkindha.js src/world/lanka.js src/world/ravana.js src/app3d.js
git commit -m "refactor: extract remaining districts to world/*.js"
```

---

## Task 11: Extract backdrop and roads

**Files:**
- Create: `src/world/backdrop.js`, `src/world/roads.js`
- Modify: `src/app3d.js`

**Source methods:** `_buildBackdrop` (~777), `_buildRoadNetwork` (~637).

- [ ] **Step 1: Create `src/world/backdrop.js`**

```js
import * as THREE from 'three';
import * as decor from './decor.js';

export function buildBackdrop(parent, colliders) {
  // body of _buildBackdrop, same parent/colliders convention
}
```

- [ ] **Step 2: Create `src/world/roads.js`**

```js
import * as decor from './decor.js';

export function buildRoadNetwork(parent, colliders) {
  // body of _buildRoadNetwork
}
```

- [ ] **Step 3: Update `src/app3d.js`**

Import both, call them in `_buildWorld`, delete the two methods.

- [ ] **Step 4: Syntax check**

```bash
node --check src/world/backdrop.js && node --check src/world/roads.js && node --check src/app3d.js
```

- [ ] **Step 5: Smoke test**

Smoke checklist with focus on:
- Sky color and distant silhouettes look identical
- Road network visually unchanged across districts

- [ ] **Step 6: Commit**

```bash
git add src/world/backdrop.js src/world/roads.js src/app3d.js
git commit -m "refactor: extract backdrop and roads to world/*.js"
```

---

## Task 12: Extract world orchestrator

**Files:**
- Create: `src/world/world.js`
- Modify: `src/app3d.js` (`_buildWorld` becomes a single `world.build(...)` call)

- [ ] **Step 1: Create `src/world/world.js`**

```js
import { buildAyodhya } from './ayodhya.js';
import { buildForest } from './forest.js';
import { buildKishkindha } from './kishkindha.js';
import { buildLanka } from './lanka.js';
import { buildRavana } from './ravana.js';
import { buildBackdrop } from './backdrop.js';
import { buildRoadNetwork } from './roads.js';

export class World {
  constructor() {
    this.districts = {};
  }

  build(parent, colliders) {
    buildBackdrop(parent, colliders);
    buildRoadNetwork(parent, colliders);
    this.districts.ayodhya = buildAyodhya(parent, colliders);
    this.districts.forest = buildForest(parent, colliders);
    this.districts.kishkindha = buildKishkindha(parent, colliders);
    this.districts.lanka = buildLanka(parent, colliders);
    this.districts.ravana = buildRavana(parent, colliders);
  }
}
```

**Verify the call order matches the existing `_buildWorld`** — backdrop / roads / districts may be ordered differently in the original. Match the existing order exactly.

- [ ] **Step 2: Update `src/app3d.js`**

Add import:

```js
import { World } from './world/world.js';
```

In the constructor, before `this._buildWorld()`, add:

```js
this.world = new World();
```

Replace the `_buildWorld` body with:

```js
this.world.build(this.decor, this.colliderRegistry);
```

(Keep the lighting call inside `_buildWorld` if it lives there, or move it to the constructor where lights are conceptually scene-level.)

- [ ] **Step 3: Syntax check**

```bash
node --check src/world/world.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Full smoke checklist + visual sweep of all districts.

- [ ] **Step 5: Commit**

```bash
git add src/world/world.js src/app3d.js
git commit -m "refactor: extract world orchestrator to world/world.js"
```

---

## Task 13: Extract enemy entity

**Files:**
- Create: `src/entities/enemy.js`
- Modify: `src/app3d.js` (move `_createEnemy`, `_updateEnemies`, `_clearEnemies`, `_spawnMissionEnemies`)

**Source methods:** `_createEnemy` (~1927), `_updateEnemies` (~1786), `_clearEnemies` (~2019), `_spawnMissionEnemies` (~1911).

- [ ] **Step 1: Create `src/entities/enemy.js`**

```js
import * as THREE from 'three';

export function createEnemy(type, position) {
  // body of _createEnemy, no `this` references — pure factory returning the enemy object
}

export function updateEnemies(enemies, dt, ctx) {
  // body of _updateEnemies. `ctx` provides:
  //   ctx.player                — player object with .group.position
  //   ctx.colliders             — ColliderRegistry
  //   ctx.spawnEnemyOrb(enemy)  — callback for ranged enemies (will be wired to combat/bow.js later)
  //   ctx.damagePlayer(amount)  — callback
  //   ctx.scene                 — THREE.Scene (for removing dead meshes)
}

export function clearEnemies(enemies, scene) {
  // body of _clearEnemies — for each enemy, scene.remove(enemy.group); enemies.length = 0
}

export function spawnMissionEnemies(mission, savedEnemies, scene) {
  // body of _spawnMissionEnemies, returns an array of enemy objects
}
```

- [ ] **Step 2: Update `src/app3d.js`**

Add import:

```js
import { createEnemy, updateEnemies, clearEnemies, spawnMissionEnemies } from './entities/enemy.js';
```

Replace each method body with a thin shim that forwards to the module function with the appropriate context object:

```js
_updateEnemies(dt) {
  updateEnemies(this.enemies, dt, {
    player: this.player,
    colliders: this.colliderRegistry,
    spawnEnemyOrb: (enemy) => this._spawnEnemyOrb(enemy),
    damagePlayer: (amount) => this._damagePlayer(amount),
    scene: this.scene,
  });
}

_createEnemy(type, position) {
  return createEnemy(type, position);
}

_clearEnemies() {
  clearEnemies(this.enemies, this.scene);
}

_spawnMissionEnemies(savedEnemies = null) {
  this.enemies = spawnMissionEnemies(this.activeMission, savedEnemies, this.scene);
}
```

- [ ] **Step 3: Syntax check**

```bash
node --check src/entities/enemy.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Smoke checklist with extra focus on:
- Enemies spawn at mission start
- Enemies pursue the player and deal damage
- Killing all enemies in a mission advances to the next
- Enemy mesh is removed from the scene after death (no visual leftovers)
- Save/load mid-mission restores enemy positions and HP correctly

- [ ] **Step 5: Commit**

```bash
git add src/entities/enemy.js src/app3d.js
git commit -m "refactor: extract enemy entity to entities/enemy.js"
```

---

## Task 14: Extract chariot entity

**Files:**
- Create: `src/entities/chariot.js`
- Modify: `src/app3d.js` (move `_createChariot`, `_updateVehicle`, `_toggleVehicle`, `_enterVehicle`, `_exitVehicle`)

**Source methods:** `_createChariot` (~468), `_updateVehicle` (~1550), `_toggleVehicle` (~2028), `_enterVehicle` (~2039), `_exitVehicle` (~2052).

- [ ] **Step 1: Create `src/entities/chariot.js`**

```js
import * as THREE from 'three';

export function createChariot() {
  // body of _createChariot — pure factory, returns { group, ...state }
}

export function updateChariot(chariot, dt, ctx) {
  // body of _updateVehicle. ctx provides:
  //   ctx.input          — InputState
  //   ctx.colliders      — ColliderRegistry
  //   ctx.player         — player object (for seat reparenting)
}

export function enterChariot(chariot, player, scene) {
  // body of _enterVehicle
}

export function exitChariot(chariot, player, scene, silent) {
  // body of _exitVehicle
}
```

- [ ] **Step 2: Update `src/app3d.js`**

Add import, replace constructor `this.vehicle = this._createChariot();` with `this.vehicle = createChariot();`. Replace each `_updateVehicle` / `_toggleVehicle` / `_enterVehicle` / `_exitVehicle` body with a forwarding shim.

- [ ] **Step 3: Syntax check**

```bash
node --check src/entities/chariot.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Smoke checklist with extra focus on:
- F enters and exits the chariot
- Acceleration, braking, steering all behave the same
- Chase camera follows the chariot
- Save/load restores chariot transform and occupancy

- [ ] **Step 5: Commit**

```bash
git add src/entities/chariot.js src/app3d.js
git commit -m "refactor: extract chariot entity to entities/chariot.js"
```

---

## Task 15: Extract player entity

**Files:**
- Create: `src/entities/player.js`
- Modify: `src/app3d.js` (move `_createPlayer`, `_updatePlayer`, `_updatePlayerAnimation`, `_doDodge`, `_damagePlayer`)

**Source methods:** `_createPlayer` (~342), `_updatePlayer` (~1501), `_updatePlayerAnimation` (~2073), `_doDodge` (~1623), `_damagePlayer` (~1823).

- [ ] **Step 1: Create `src/entities/player.js`**

```js
import * as THREE from 'three';

export function createPlayer() {
  // body of _createPlayer — pure factory, returns { group, ...state }
}

export function updatePlayer(player, dt, ctx) {
  // body of _updatePlayer
  // ctx provides: input, colliders, cameraRig (for movement direction relative to camera yaw)
}

export function updatePlayerAnimation(player, dt) {
  // body of _updatePlayerAnimation
}

export function doDodge(player, ctx) {
  // body of _doDodge
}

export function damagePlayer(player, amount, ctx) {
  // body of _damagePlayer
  // ctx provides: onFail (callback for game over)
}
```

- [ ] **Step 2: Update `src/app3d.js`**

Add import, replace constructor `this.player = this._createPlayer();` with `this.player = createPlayer();`. Replace each method body with a forwarding shim.

- [ ] **Step 3: Syntax check**

```bash
node --check src/entities/player.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Full smoke checklist with extra focus on:
- Player walks, sprints, dodges identically
- Sword swing, bow aim, arrow fire still work
- Taking damage flashes / staggers as before
- Death triggers fail state

- [ ] **Step 5: Commit**

```bash
git add src/entities/player.js src/app3d.js
git commit -m "refactor: extract player entity to entities/player.js"
```

---

## Task 16: Extract sword combat

**Files:**
- Create: `src/combat/sword.js`
- Modify: `src/app3d.js` (move `_doSwordAttack`)

- [ ] **Step 1: Create `src/combat/sword.js`**

```js
import * as THREE from 'three';

export function doSwordAttack(player, enemies, ctx) {
  // body of _doSwordAttack
  // ctx provides: scene, toast(message)
}
```

- [ ] **Step 2: Update `src/app3d.js`**

Add import. Replace `_doSwordAttack()` body with a forwarding call.

- [ ] **Step 3: Syntax check**

```bash
node --check src/combat/sword.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Smoke checklist with focus on:
- LMB triggers sword swing
- Enemies in front cone within range take damage
- Enemy death count updates correctly

- [ ] **Step 5: Commit**

```bash
git add src/combat/sword.js src/app3d.js
git commit -m "refactor: extract sword combat to combat/sword.js"
```

---

## Task 17: Extract bow + projectile combat

**Files:**
- Create: `src/combat/bow.js`
- Modify: `src/app3d.js` (move `_fireArrow`, `_spawnEnemyOrb`, `_updateProjectiles`, `_updateEnemyProjectiles`)

**Source methods:** `_fireArrow` (~1666), `_spawnEnemyOrb` (~1695), `_updateProjectiles` (~1716), `_updateEnemyProjectiles` (~1752).

- [ ] **Step 1: Create `src/combat/bow.js`**

```js
import * as THREE from 'three';

export function fireArrow(player, projectiles, ctx) {
  // body of _fireArrow — ctx: scene, camera (for aim direction)
}

export function spawnEnemyOrb(enemy, enemyProjectiles, ctx) {
  // body of _spawnEnemyOrb
}

export function updateProjectiles(projectiles, dt, ctx) {
  // body of _updateProjectiles — ctx: scene, enemies, colliders, onEnemyHit(enemy, dmg)
}

export function updateEnemyProjectiles(enemyProjectiles, dt, ctx) {
  // body of _updateEnemyProjectiles — ctx: scene, player, colliders, damagePlayer(amount)
}
```

- [ ] **Step 2: Update `src/app3d.js`**

Add import. Replace each method body with a forwarding shim. Wire up the enemy `spawnEnemyOrb` callback in Task 13's `_spawnEnemyOrb` shim if not already done.

- [ ] **Step 3: Syntax check**

```bash
node --check src/combat/bow.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Smoke checklist with focus on:
- RMB enters aim mode (over-the-shoulder camera offset, crosshair visible)
- LMB while aiming fires an arrow along the camera direction
- Arrow hits enemies and damages them
- Arrow is destroyed on building/wall hit
- Ranged enemies fire orbs that damage the player on hit

- [ ] **Step 5: Commit**

```bash
git add src/combat/bow.js src/app3d.js
git commit -m "refactor: extract bow and projectiles to combat/bow.js"
```

---

## Task 18: Extract HUD

**Files:**
- Create: `src/ui/hud.js`
- Modify: `src/app3d.js` (move `_updateHUD`, `_updateRadar`, `_updateInteractionPrompt`, `_toast`, `_setMarker`)

**Source methods:** `_updateHUD` (~2145), `_updateRadar` (~2160), `_updateInteractionPrompt` (~2124), `_toast` (~2231), `_setMarker` (~1447).

- [ ] **Step 1: Create `src/ui/hud.js`**

```js
export class HUD {
  constructor(elements) {
    // store DOM element refs from `elements` object:
    //   chapterTitle, objectiveText, healthFill, healthValue, enemyValue,
    //   modeValue, weaponValue, speedValue, prompt, radarCanvas, radarCtx,
    //   crosshair, toast, marker
    Object.assign(this, elements);
    this.toastTimer = 0;
  }

  setChapter(title, objective) { this.chapterTitle.textContent = title; this.objectiveText.textContent = objective; }
  setHealth(hp, max) { /* body */ }
  setEnemies(n) { /* body */ }
  setMode(s) { /* body */ }
  setWeapon(s) { /* body */ }
  setSpeed(v) { /* body */ }
  showPrompt(text) { /* body */ }
  hidePrompt() { /* body */ }
  toast(message) { /* body of _toast */ }
  updateRadar(player, mission, enemies) { /* body of _updateRadar */ }
  updateInteractionPrompt(player, vehicle) { /* body of _updateInteractionPrompt */ }
  setMarker(position, visible) { /* body of _setMarker */ }
  tick(dt) { /* update toastTimer, hide toast when expired */ }
}
```

- [ ] **Step 2: Update `src/app3d.js`**

Add import:

```js
import { HUD } from './ui/hud.js';
```

In the constructor, after the DOM element lookups, replace the bare assignments with:

```js
this.hud = new HUD({
  chapterTitle: this.chapterTitle,
  objectiveText: this.objectiveText,
  healthFill: this.healthFill,
  healthValue: this.healthValue,
  enemyValue: this.enemyValue,
  modeValue: this.modeValue,
  weaponValue: this.weaponValue,
  speedValue: this.speedValue,
  prompt: this.prompt,
  radarCanvas: this.radarCanvas,
  radarCtx: this.radarCtx,
  crosshair: this.crosshair,
  toast: this.toast,
  marker: this.marker,
});
```

(Keep the per-element fields on `this` for backward-compat; they alias the same DOM nodes.)

Replace each method body with a forwarding shim:

```js
_updateHUD() { this.hud.setHealth(...); this.hud.setEnemies(this.enemies.length); /* etc. */ }
_updateRadar() { this.hud.updateRadar(this.player, this.activeMission, this.enemies); }
_updateInteractionPrompt() { this.hud.updateInteractionPrompt(this.player, this.vehicle); }
_toast(message) { this.hud.toast(message); }
_setMarker(position, visible) { this.hud.setMarker(position, visible); }
```

In `_update`, after the existing per-frame work, add `this.hud.tick(dt);` so the toast timer advances.

- [ ] **Step 3: Syntax check**

```bash
node --check src/ui/hud.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Smoke checklist with focus on every HUD element:
- Chapter title and objective text render correctly
- Health bar fills/empties on damage
- Enemy counter updates as enemies die
- Mode/weapon/speed readouts update
- Radar dots match enemy and marker positions
- Interaction prompt appears near the chariot, hides when away
- Toasts appear and fade out after the same duration as before
- Crosshair appears in aim mode

- [ ] **Step 5: Commit**

```bash
git add src/ui/hud.js src/app3d.js
git commit -m "refactor: extract HUD to ui/hud.js"
```

---

## Task 19: Extract overlay (cutscene/dialogue)

**Files:**
- Create: `src/ui/overlay.js`
- Modify: `src/app3d.js` (move `_showOverlay`, `_closeOverlay`, `_advanceOverlay`, `_secondaryOverlayAction`, `_normalizeSceneLine`, `_renderSceneLine`, `_playScene`, `_advanceSceneLine`)

**Source methods:** lines ~1270 through ~1362.

- [ ] **Step 1: Create `src/ui/overlay.js`**

```js
export class Overlay {
  constructor(elements) {
    Object.assign(this, elements);
    this.scene = null;
    this.sceneIndex = 0;
    this.onSceneDone = null;
  }

  show({ eyebrow, title, speaker, body, hint, primary, secondary }) { /* body of _showOverlay */ }
  close() { /* body of _closeOverlay */ }
  advance() { /* body of _advanceOverlay */ }
  secondaryAction() { /* body of _secondaryOverlayAction */ }
  playScene(eyebrow, title, lines, onDone) { /* body of _playScene */ }
  _advanceSceneLine() { /* body of _advanceSceneLine */ }
  _normalizeSceneLine(line) { /* body of _normalizeSceneLine */ }
  _renderSceneLine(line) { /* body of _renderSceneLine */ }
}
```

- [ ] **Step 2: Update `src/app3d.js`**

Add import, instantiate `this.overlayCtl = new Overlay({ ...DOM refs... })` in the constructor, replace each method body with a forwarding shim.

**Naming note:** `this.overlay` is already taken by the DOM element. Use `this.overlayCtl` (or `this.overlayUI`) for the controller instance.

- [ ] **Step 3: Syntax check**

```bash
node --check src/ui/overlay.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Smoke checklist with focus on:
- Title menu overlay appears and dismisses correctly
- New Game prologue dialogue plays line-by-line on Enter / click
- Chapter intro overlay appears at mission start
- Mission completion transition scenes play and dismiss

- [ ] **Step 5: Commit**

```bash
git add src/ui/overlay.js src/app3d.js
git commit -m "refactor: extract overlay/dialogue UI to ui/overlay.js"
```

---

## Task 20: Extract title menu + settings panel

**Files:**
- Create: `src/ui/menu.js`
- Modify: `src/app3d.js` (move `_handleTitleKey`, `_menuButtons`, `_focusMenuButton`, `_showTitle`, `_showTitleMenu`, `_showSettingsMenu`, `_attemptExitGame`, `_syncSettingsUI`, `_applySettings`)

**Source methods:** lines ~1175 through ~1270, plus settings sync ~319-340.

- [ ] **Step 1: Create `src/ui/menu.js`**

```js
export class TitleMenu {
  constructor(elements, callbacks) {
    Object.assign(this, elements);
    this.callbacks = callbacks; // { onNewGame, onLoadGame, onSettings, onExit, onSettingsChange }
    this.menuIndex = 0;
  }

  show() { /* body of _showTitle / _showTitleMenu */ }
  showSettings() { /* body of _showSettingsMenu */ }
  handleKey(event) { /* body of _handleTitleKey */ }
  buttons() { /* body of _menuButtons */ }
  focusButton() { /* body of _focusMenuButton */ }
  attemptExit() { /* body of _attemptExitGame */ }
  syncSettingsUI(settings) { /* body of _syncSettingsUI */ }
}
```

- [ ] **Step 2: Update `src/app3d.js`**

Add import, instantiate `this.menu = new TitleMenu({ ...DOM refs... }, { onNewGame: () => this._startNewGame(), ... })` in the constructor. Replace each method body with a forwarding shim. Wire the keyboard handler in `_bindEvents` to delegate title-state keys to `this.menu.handleKey(event)`.

`_applySettings` stays on the class because it touches the renderer/camera/lighting, not just the menu UI. Inside it, after the existing body, ensure it calls `this.menu.syncSettingsUI(this.settings)` instead of `this._syncSettingsUI()`.

- [ ] **Step 3: Syntax check**

```bash
node --check src/ui/menu.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Smoke checklist with focus on:
- Title menu appears on boot
- Arrow/WASD navigates menu items
- Enter selects
- New Game / Load Game / Settings / Exit all behave correctly
- Settings panel opens, sliders work, Back returns to title

- [ ] **Step 5: Commit**

```bash
git add src/ui/menu.js src/app3d.js
git commit -m "refactor: extract title menu to ui/menu.js"
```

---

## Task 21: Extract missions

**Files:**
- Create: `src/missions/missions.js`
- Modify: `src/app3d.js` (move `MISSION_ORDER`, `INTRO_SCENE`, `_updateMission`, `_completeMission`, `_resetActorsForMission`, `_restoreActorState`, `_startNewGame`, `_continueGame`, `_getCombatTargetPosition`)

This is the largest task. Mission progression is intertwined with overlay scenes and actor state, so extract carefully.

- [ ] **Step 1: Create `src/missions/missions.js`**

```js
export const MISSION_ORDER = [
  // copy verbatim from app3d.js
];

export const INTRO_SCENE = [
  // copy verbatim from app3d.js
];

export class MissionProgress {
  constructor() {
    this.index = 0;
    this.state = 'travel';
  }

  current() { return MISSION_ORDER[this.index]; }
  advance() { this.index = Math.min(this.index + 1, MISSION_ORDER.length - 1); this.state = 'travel'; }
  reset() { this.index = 0; this.state = 'travel'; }
  setState(s) { this.state = s; }
  toJSON() { return { index: this.index, state: this.state }; }
  fromJSON(data) { this.index = data?.index ?? 0; this.state = data?.state ?? 'travel'; }
}
```

- [ ] **Step 2: Update `src/app3d.js`**

Add import:

```js
import { MISSION_ORDER, INTRO_SCENE, MissionProgress } from './missions/missions.js';
```

Delete the local `MISSION_ORDER` and `INTRO_SCENE` constants.

In the constructor, replace:

```js
this.missionIndex = 0;
this.activeMission = MISSION_ORDER[0];
this.missionState = 'travel';
```

with:

```js
this.missionProgress = new MissionProgress();
```

Add accessor properties so the rest of the file keeps working without per-line edits:

```js
get missionIndex() { return this.missionProgress.index; }
set missionIndex(v) { this.missionProgress.index = v; }
get activeMission() { return this.missionProgress.current(); }
get missionState() { return this.missionProgress.state; }
set missionState(v) { this.missionProgress.state = v; }
```

Update `_saveGame` to persist `this.missionProgress.toJSON()` and `_loadSave` to restore via `this.missionProgress.fromJSON(...)`.

`_updateMission`, `_completeMission`, `_resetActorsForMission`, `_restoreActorState`, `_startNewGame`, `_continueGame`, `_getCombatTargetPosition` stay as methods on `Ramayana3DGame` because they touch the orchestrator's wiring (player, enemies, overlay, save). Only the data and the index/state container move out.

- [ ] **Step 3: Syntax check**

```bash
node --check src/missions/missions.js && node --check src/app3d.js
```

- [ ] **Step 4: Smoke test**

Full smoke checklist with end-to-end campaign progression:
- New Game starts mission 0 with the correct intro
- Reaching the marker and clearing enemies advances to mission 1
- Save mid-campaign, reload, Load Game restores at the correct mission with correct state
- Each mission's intro/completion overlay still fires

- [ ] **Step 5: Commit**

```bash
git add src/missions/missions.js src/app3d.js
git commit -m "refactor: extract mission data + progress to missions/missions.js"
```

---

## Task 22: Final cleanup of app3d.js

**Files:**
- Modify: `src/app3d.js`

After Tasks 1–21, `app3d.js` should be much smaller. This task removes leftover dead code, redundant aliases, and stale comments.

- [ ] **Step 1: Measure current size**

```bash
wc -l src/app3d.js
```

Note the current line count.

- [ ] **Step 2: Audit and remove dead code**

Search for:
- Methods that now only forward to a module function — if the wrapper is called from exactly one place, inline the module call at the call site and delete the wrapper.
- Aliases like `this.keys = this.input.keys;` — if every call site has been updated to use `this.input.keys` directly during earlier tasks, delete the alias. (If aliases are still used, leave them.)
- Commented-out code from the migration. Delete it.
- Constants that were moved to modules but the original line is still present.

- [ ] **Step 3: Verify size target**

```bash
wc -l src/app3d.js
```

Target: under 500 lines (per the parent spec). If it's still over 500, identify the largest remaining method and add a follow-up extraction task. If it's under 500, proceed.

If between 500 and 700 lines and no obvious next extraction is left, document the residual contents and stop — the spec target is a guideline, not a hard wall, and the refactor goal (modular boundaries established) has already been met.

- [ ] **Step 4: Syntax check**

```bash
node --check src/app3d.js
```

- [ ] **Step 5: Full regression smoke test**

Run the complete smoke checklist one final time, end to end. Pay attention to anything that "feels different" — even subtle changes are regressions.

- [ ] **Step 6: Commit**

```bash
git add src/app3d.js
git commit -m "refactor: final cleanup of app3d.js orchestrator"
```

---

## Task 23: Update progress doc and architecture doc

**Files:**
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Modify: `docs/ARCHITECTURE.md`

The architecture doc still describes a monolithic `app3d.js`. After the refactor it lies. Update it.

- [ ] **Step 1: Update `docs/ARCHITECTURE.md`**

Replace the "Runtime Structure" section (~line 22) so it lists the new module layout instead of saying everything lives in `Ramayana3DGame`. Keep the wording concise and factual; don't editorialize.

Add a "Module Layout" subsection that mirrors the file-structure tree from the AAA Phase 1 spec (`src/engine/`, `src/world/`, `src/entities/`, `src/combat/`, `src/ui/`, `src/missions/`).

Update the "Last updated" line at the top to today's date.

- [ ] **Step 2: Update `docs/IMPLEMENTATION_PROGRESS.md`**

Replace the "Handoff Snapshot" section with a new entry dated today that records:
- AAA Phase 1 Step 1 (Refactor scaffold) is **done**
- The next AI should pick up AAA Phase 1 Step 2 (Asset pipeline — `LoadingManager`, `GLTFLoader`, loading screen)
- Reference the parent spec at `docs/superpowers/specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md`
- Note that this plan (`docs/superpowers/plans/2026-04-19-aaa-phase-1-step-1-refactor-scaffold.md`) is now complete — write a new plan for Step 2 before starting it

Update the "Best Next Step" section so it points at Step 2 of the AAA Phase 1 spec, not the older "either fallback or visuals" branching guidance.

- [ ] **Step 3: Commit**

```bash
git add docs/ARCHITECTURE.md docs/IMPLEMENTATION_PROGRESS.md
git commit -m "docs: update architecture + handoff after Phase 1 Step 1 refactor"
```

---

## Verification After Plan Completes

Run all of the following:

- [ ] `wc -l src/app3d.js` — under 500 lines (or documented exception)
- [ ] `for f in src/**/*.js; do node --check "$f"; done` — every file syntax-checks
- [ ] `python3 dev_server.py` then full smoke checklist in a browser — every smoke item passes
- [ ] `git log --oneline` shows ~22 small refactor commits in dependency order
- [ ] `grep -r "this\._add\|this\._build\|this\._create" src/app3d.js` returns very few hits — most should now go through module functions

If any of these fail, find the failing task, revert from there, and redo.

---

## Notes for the Executing Agent

- **Do not improve code while extracting.** Every extraction is a verbatim move. Improvements (better names, simpler control flow, removing dead branches) are out of scope here. If you spot a real bug, leave a `// TODO(refactor):` comment and continue. Fixing bugs and refactoring at the same time makes regressions impossible to bisect.
- **One extraction per commit.** Do not batch multiple modules in one commit. The whole point of the structure is that any task can be reverted independently.
- **If a task is bigger than estimated, split it.** Don't carry a half-extraction across the test boundary.
- **The smoke checklist is your test suite.** This codebase has no automated tests. Treat each smoke step as a required check, not a suggestion.
- **If the dev server fails to start (port in use), kill prior instances first** with `lsof -ti:8000 | xargs kill -9` (or change the port in `dev_server.py`).
- **All forward-referenced types in this plan are defined in their respective tasks**: `InputState` (Task 3), `ColliderRegistry` (Task 4), `ThirdPersonCamera` (Task 7), `World` (Task 12), `HUD` (Task 18), `Overlay` (Task 19), `TitleMenu` (Task 20), `MissionProgress` (Task 21).
