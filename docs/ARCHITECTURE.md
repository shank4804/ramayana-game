# Ramayana Game Architecture

Last updated: 2026-06-06 (Step 5a landed)

## Overview

The active game is now a browser-based Three.js prototype with a third-person controller, open mission districts, a drivable chariot, and a title/menu flow.

This is a reset from the older canvas/tile runtime. The old 2D systems still exist in the repo, but they are now legacy code and are not loaded by the browser entry point.

Active boot path:

1. [index.html](/Users/shashank/workspace/ramayana-game/index.html)
2. [style.css](/Users/shashank/workspace/ramayana-game/style.css)
3. [src/bootstrap.js](/Users/shashank/workspace/ramayana-game/src/bootstrap.js)
4. [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js)

There is no bundler or build step. [src/bootstrap.js](/Users/shashank/workspace/ramayana-game/src/bootstrap.js) dynamically loads [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js), and [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js) imports Three.js from local `node_modules`.

## Runtime Structure

The active runtime is the `Ramayana3DGame` orchestrator in [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js), which now wires together focused modules instead of owning all gameplay code directly.

The orchestrator still owns:

- the Three.js scene/camera/clock and the `requestAnimationFrame` loop
- top-level UI state (`title`, `cutscene`, `playing`) and mission progression coordination
- event binding (`_bindEvents`) — keyboard, mouse, pointer-lock, wheel, resize
- mission flow (`_startNewGame`, `_continueGame`, `_completeMission`, `_resetActorsForMission`, `_restoreActorState`, `_updateMission`)
- save payload assembly (the snapshot fields, restore wiring)

Everything else now lives in modules under `src/`.

## Module Layout

```
src/
  bootstrap.js                       boot loader, surfaces failures
  app3d.js                           orchestrator + mission flow + event wiring
  engine/
    save.js                          localStorage save/load + settings persistence (key v4)
    input.js                         InputState (keys/mouse/pointer)
    collision.js                     ColliderRegistry (AABB)
    renderer.js                      WebGLRenderer + EffectComposer pipeline (bloom/SSAO/FXAA/output)
    lighting.js                      sun + hemisphere lights
    camera.js                        third-person follow update
    assets.js                        AssetLibrary: LoadingManager + GLTFLoader + cache
    loading.js                       LoadingScreen DOM controller
    animation.js                     AnimationStateMachine + clip-name alias layer
  world/
    world.js                         district orchestrator (sky/ground/districts)
    decor.js                         shared primitive builders (tree, rock, lamp, wall, etc.)
    ayodhya.js, forest.js,
    kishkindha.js, lanka.js,
    backdrop.js, roads.js            district builders
  entities/
    player.js                        Rama controller + mesh assembly
    chariot.js                       chariot controller + mesh assembly
    enemy.js                         enemy archetypes + pursuit AI
  combat/
    sword.js                         cone hit detection
    bow.js                           arrows + enemy orbs + projectile updates
  ui/
    hud.js                           chapter/objective card, status, radar, prompt, toast, marker
    overlay.js                       cutscene/dialogue overlay
    menu.js                          title menu navigation + settings UI sync
  missions/
    missions.js                      MISSION_ORDER + INTRO_SCENE data
```

Module dependency direction: `app3d` → modules. Within modules, `world/` and `entities/` depend on `engine/` for collision; UI modules are self-contained. No circular imports.

## Boot And State Flow

When the page loads:

1. [index.html](/Users/shashank/workspace/ramayana-game/index.html) loads [src/bootstrap.js](/Users/shashank/workspace/ramayana-game/src/bootstrap.js) as a module.
2. [src/bootstrap.js](/Users/shashank/workspace/ramayana-game/src/bootstrap.js) dynamically imports [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js) and surfaces boot failures into the overlay if the runtime fails.
3. `Ramayana3DGame` boots immediately if the DOM is already ready, or waits for `DOMContentLoaded` otherwise.
4. The constructor builds the world, loads settings, binds input, shows the title menu, and starts the render loop.

Current state flow:

- `title`
- `cutscene`
- `playing`

The overlay system is DOM-driven, while gameplay itself is rendered in WebGL.

The current startup flow is:

1. title menu
2. optional settings panel or load game
3. new game intro dialogue
4. chapter intro dialogue
5. active gameplay

## World Model

The game world is procedural and code-authored. The orchestrator instantiates `World` from `src/world/world.js`, which then calls each district builder in order: backdrop, roads, Ayodhya, forest, Kishkindha, Lanka.

Major world sections:

- Ayodhya district (`src/world/ayodhya.js`)
- forest and exile camp (`src/world/forest.js`)
- Kishkindha rock fields (`src/world/kishkindha.js`)
- Lanka outer city and Ravana court approach (`src/world/lanka.js`)

Each district uses shared primitive builders exported from `src/world/decor.js` — trees, walls, towers, lamps, torches, banners, bridges, ruins. There is no imported model pipeline yet.

## Collision System

Collisions are handled by the `ColliderRegistry` in `src/engine/collision.js` — manually registered 2D AABB blockers on the X/Z plane.

API:

- `register(x, z, width, depth, padding)`
- `moveBody(position, delta, radius)` — adds delta, resolves collisions, clamps to world bounds
- `resolveCollisions(position, radius)`
- `pointHitsCollider(point, padding)`

This is not a full physics engine. It is a lightweight gameplay collision layer used for:

- buildings
- towers
- trees
- rocks
- walls
- projectile obstruction

Important implication:

- movement feels like a 3D action prototype, but physics is still custom and lightweight rather than rigid-body simulation

## Animation State Machine

`src/engine/animation.js` exports `AnimationStateMachine`, `buildClipMap`, `resolveClip`, and `DEFAULT_CLIP_ALIASES`.

The state machine wraps a Three.js `AnimationMixer` and maps eight canonical states — `idle`, `walk`, `run`, `attack`, `dodge`, `hit`, `death`, `aim` — to actions built from a GLB's `AnimationClip[]`. Looping states (`idle` / `walk` / `run` / `aim`) play continuously; one-shot states (`attack` / `dodge` / `hit`) `LoopOnce` + `clampWhenFinished` + auto-return to the previous state via the mixer's `'finished'` event.

The clip-name alias layer absorbs pack-specific naming. `DEFAULT_CLIP_ALIASES` covers Quaternius (`CharacterArmature|Walk`), Mixamo (`Armature|Walk_Cycle`), and bare-name (`walk`) conventions. Per-asset overrides can be passed to `buildClipMap`.

The same state machine is reused by player (Step 4) and enemy (Step 5) — only the transition rules differ.

## Player Controller

The player lives in `src/entities/player.js` (`createPlayer`, `updatePlayer`, `updatePlayerAnimation`, `doDodge`, `damagePlayer`).

`createPlayer(spawn, gltf?)` has two branches:

- **Primitive (default):** builds the existing box/sphere mesh hierarchy. `player.parts.{torso,head,leftArm,...}` is populated; `player.stateMachine` is `null`.
- **Skinned (when `gltf` supplied):** clones the GLB via `SkeletonUtils.clone`, builds an `AnimationMixer`, builds a clip map via `buildClipMap(gltf.animations)`, instantiates an `AnimationStateMachine`. `player.parts` is `null`; `player.stateMachine` is populated.

`updatePlayerAnimation` checks `player.stateMachine` and routes accordingly: state-machine path derives the desired state from velocity, aim flag, attackTime / dodgeTime edge triggers, and HP; primitive path runs the existing procedural arm/leg sin-wave animation.

`Ramayana3DGame._bootAssets()` HEAD-checks `./assets/characters/rama.glb`; if present, queues the load; on completion `_swapInLoadedAssets()` removes the primitive player from the scene and instantiates the skinned one in place. A missing GLB is silent — no error overlay.

Current player systems:

- camera-relative movement
- sprint
- dodge
- sword attack
- over-the-shoulder bow aim
- simple procedural limb animation
- HP and invulnerability window

The player model is assembled from primitive meshes, not imported character assets.

## Vehicle Controller

The royal chariot lives in `src/entities/chariot.js` (`createChariot`, `updateChariot`, `enterChariot`, `exitChariot`).

Current vehicle systems:

- enter/exit with `F`
- acceleration, braking, and steering
- third-person chase camera when occupied
- player seating by reparenting the player model onto the chariot seat
- save/load of vehicle transform and speed

This is the main GTA-like system in the current prototype. It gives the build a real on-foot / vehicle split instead of only walking.

## Mission System

Campaign progression is defined by the `MISSION_ORDER` array in `src/missions/missions.js` (also exports `INTRO_SCENE`).

Each mission contains:

- `id`
- `chapter`
- `title`
- `objective`
- `marker`
- `spawn`
- `vehicleSpawn`
- `vehicleYaw`
- `radius`
- optional `requiresVehicle`
- `intro`
- `completion`
- `enemies`

Mission flow:

1. travel to the marker
2. trigger combat if the mission has enemies
3. clear enemies
4. show transition scene
5. reset actor positions for the next chapter zone

## Combat

Combat lives in `src/combat/` and `src/entities/enemy.js`.

Current systems:

- sword cone hit detection via `doSwordAttack(player, enemies)` in `src/combat/sword.js`
- bow projectiles via `fireArrow(player, camera, scene, projectiles)` in `src/combat/bow.js`
- boss ranged projectiles via `spawnEnemyOrb(enemy, targetPos, scene, enemyProjectiles)`
- projectile updates via `updateProjectiles` / `updateEnemyProjectiles`
- enemy pursuit and melee pressure via `updateEnemies(enemies, dt, ctx)` in `src/entities/enemy.js`
- player damage and fail state via `damagePlayer(player, amount)` in `src/entities/player.js` (orchestrator handles the fail-state overlay and autosave)

Enemies are primitive-mesh actors created by `createEnemy(type, position)`.

## Camera And Input

Camera systems:

- pointer-lock mouse look
- drag-to-orbit fallback
- wheel zoom
- on-foot camera follow
- vehicle camera follow
- settings-driven sensitivity and Y-axis inversion

Relevant code:

- input/pointer state: `src/engine/input.js` (`InputState`)
- third-person camera follow: `src/engine/camera.js` (`updateThirdPersonCamera`)
- event binding still in `_bindEvents()` on the orchestrator

The control scheme is closer to a third-person action sandbox now than to the earlier top-down model, even though the simulation is still intentionally lightweight.

## UI Layer

The HUD and overlays are DOM-based:

- title menu
- settings panel
- dialogue speaker pill and progression hint
- boot-error overlay through the bootstrap loader
- chapter / objective card
- health and enemy counters
- mode / weapon / speed readouts
- radar canvas
- interaction prompt
- cutscene / title overlay
- toast banner
- aiming crosshair

Those elements live in [index.html](/Users/shashank/workspace/ramayana-game/index.html) and [style.css](/Users/shashank/workspace/ramayana-game/style.css). The DOM interactions are now split across three controllers wired by the orchestrator:

- `HUD` in `src/ui/hud.js` — chapter card, health, enemies, mode/weapon/speed, radar, interaction prompt, toast, marker
- `Overlay` in `src/ui/overlay.js` — cutscene/dialogue overlay, scene line rendering
- `TitleMenu` in `src/ui/menu.js` — main menu nav, focus management, settings UI sync

## Rendering Pipeline

`src/engine/renderer.js` exports two entry points:

- `createRenderer()` — builds the `WebGLRenderer` with shadow map, ACES tonemapping, sRGB output, fallback options.
- `createPostProcessing(renderer, scene, camera)` — builds an `EffectComposer` and returns `{ composer, setQuality(level), setSize(w, h) }`.

The composer pipeline runs:

1. `RenderPass` — the main scene
2. `SSAOPass` — toggled by `setQuality` (off on `medium`, on for `high` / `epic`)
3. `UnrealBloomPass` — threshold 0.9, radius 0.4, strength scales with tier (0.38 / 0.50 / 0.62)
4. `ShaderPass(FXAAShader)` — resolution uniform updated on `setSize`
5. `OutputPass` — converts linear render targets to sRGB for display

`Ramayana3DGame._animate` calls `this.postFx.composer.render()` instead of `renderer.render`. `_handleResize` forwards to `postFx.setSize`. `_applySettings` calls `postFx.setQuality(quality)` whenever the settings tier changes, and also adjusts `scene.fog.far` (240 / 320 / 420) and the directional sun's shadow map size (1024² / 2048² / 4096²).

## Asset Pipeline

GLTF and texture loading goes through a shared `LoadingManager` owned by `AssetLibrary` in `src/engine/assets.js`:

- `loadGLTF(key, url)` — queues a GLB load, caches the result by key, returns a promise.
- `get(key)` / `getAnimations(key)` — read cached GLB scene root + animation clips.
- `clone(key)` — `SkeletonUtils.clone` of the cached scene for instancing skinned meshes.
- `startAll()` — signals "no more queues coming" so `onLoad` fires even when zero loads were registered.

`LoadingScreen` in `src/engine/loading.js` wraps the `#loading-screen` DOM card and exposes `show()`, `setProgress(fraction, label)`, `hide()`, `showError(url, retry)`. It has a 400ms minimum display floor so the screen never flashes.

`Ramayana3DGame._bootAssets()` wires them: show the loading screen, hook `onProgress` into `setProgress`, hook `onLoad` into `hide() + _showTitle()`, hook `onError` into `showError()`. Today no `loadGLTF` calls are queued — Step 4 (Rama) and Step 6 (Ayodhya) will add them.

`index.html` includes an importmap (`"three"` → `./node_modules/three/build/three.module.js`, `"three/addons/"` → `./node_modules/three/examples/jsm/`) so `GLTFLoader`'s internal bare imports resolve in the browser without a bundler.

## Persistence

Save/load is handled with `localStorage` in `src/engine/save.js` (`hasSave`, `readSave`, `writeSave`, `clearSave`, `loadSettings`, `saveSettings`). The orchestrator builds the save payload before calling `writeSave`. Save key is `ramayana-3d-openworld-v4`; legacy `v3` blobs are silently discarded on module load.

Current save key:

- `ramayana-3d-openworld-v3`

Settings are also persisted in `localStorage` under:

- `ramayana-3d-settings-v1`

Recommended local server:

- [dev_server.py](/Users/shashank/workspace/ramayana-game/dev_server.py)

That server disables HTTP caching so the browser always loads the current JS and CSS while iterating quickly.

Saved fields include:

- current mission index
- mission state
- player position / HP / vehicle occupancy
- vehicle transform / speed
- camera state
- living enemy states for the active mission

## Legacy Code

The older canvas/tile architecture remains in the repo, including:

- [src/game.js](/Users/shashank/workspace/ramayana-game/src/game.js)
- [src/room.js](/Users/shashank/workspace/ramayana-game/src/room.js)
- [src/chapters.js](/Users/shashank/workspace/ramayana-game/src/chapters.js)
- [src/renderer3d.js](/Users/shashank/workspace/ramayana-game/src/renderer3d.js)

Those files are no longer the active runtime. They can be deleted later after migration confidence is high, or mined for story data if needed.

## Current Constraints

The new 3D runtime is materially closer to a GTA-like prototype than the earlier pseudo-3D layer, but it still has clear limitations:

- no imported art assets or skeletal animations
- no navmesh or real physics engine
- no authored cutscene cameras
- no NPC dialogue actors in the world
- runtime still depends on WebGL support in the browser

The next meaningful technical step is AAA Phase 1 Step 6: the Ayodhya district GLB rebuild. Step 4a + 5a landed the character pipeline infrastructure; Step 4b + 5b drop in actual GLBs (blocked on user sourcing CC0 packs). Step 6 is structurally different — it swaps `src/world/ayodhya.js`'s primitive decor builders for GLB placements with their own bounding-box collision registration. See `docs/superpowers/specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md`.
