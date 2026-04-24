# Ramayana Game Architecture

Last updated: 2026-04-11

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

The active runtime is centered on `Ramayana3DGame` in [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js).

That class owns:

- Three.js renderer, scene, camera, fog, and lighting
- the animation loop driven by `requestAnimationFrame`
- top-level UI state (`title`, `cutscene`, `playing`)
- overlay modes for main menu, settings, and story scenes
- world generation and collision registration
- player and vehicle controllers
- mission progression
- enemy spawning and combat updates
- HUD, radar, prompt, overlay, and toast updates
- save/load through `localStorage`

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

The game world is currently procedural and code-authored inside [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js).

Major world sections:

- Ayodhya district
- forest and exile camp
- Kishkindha rock fields
- Lanka outer city
- Ravana court approach

World building is done with helper methods such as:

- `_buildRoadNetwork()`
- `_buildAyodhyaDistrict()`
- `_buildForestDistrict()`
- `_buildKishkindhaDistrict()`
- `_buildLankaDistrict()`
- `_buildBackdrop()`

These helpers create simple geometry directly with Three.js primitives. There is no imported model pipeline yet.

## Collision System

Collisions are currently handled through manually registered 2D AABB blockers on the X/Z plane.

Relevant methods:

- `_registerCollider()`
- `_moveBody()`
- `_resolveCollisions()`
- `_pointHitsCollider()`

This is not a full physics engine. It is a lightweight gameplay collision layer used for:

- buildings
- towers
- trees
- rocks
- walls
- projectile obstruction

Important implication:

- movement feels like a 3D action prototype, but physics is still custom and lightweight rather than rigid-body simulation

## Player Controller

The player is built in `_createPlayer()` in [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js).

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

The royal chariot is built in `_createChariot()`.

Current vehicle systems:

- enter/exit with `F`
- acceleration, braking, and steering
- third-person chase camera when occupied
- player seating by reparenting the player model onto the chariot seat
- save/load of vehicle transform and speed

This is the main GTA-like system in the current prototype. It gives the build a real on-foot / vehicle split instead of only walking.

## Mission System

Campaign progression is defined by the `MISSION_ORDER` array near the top of [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js).

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

Combat is handled directly in [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js), not through separate entity modules.

Current systems:

- sword cone hit detection via `_doSwordAttack()`
- bow projectiles via `_fireArrow()`
- boss ranged projectiles via `_spawnEnemyOrb()`
- enemy pursuit and melee pressure via `_updateEnemies()`
- player damage and fail state via `_damagePlayer()`

Enemies are primitive-mesh actors created by `_createEnemy()`.

## Camera And Input

Camera systems:

- pointer-lock mouse look
- drag-to-orbit fallback
- wheel zoom
- on-foot camera follow
- vehicle camera follow
- settings-driven sensitivity and Y-axis inversion

Relevant methods:

- `_bindEvents()`
- `_updateCamera()`

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

Those elements live in [index.html](/Users/shashank/workspace/ramayana-game/index.html) and [style.css](/Users/shashank/workspace/ramayana-game/style.css), while [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js) updates them each frame or during state transitions.

## Persistence

Save/load is handled with `localStorage` in [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js).

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
- large portions of gameplay still live in one file
- runtime still depends on WebGL support in the browser

The next meaningful technical step is either:

1. split [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js) into world/controller/UI modules, or
2. replace primitive geometry with authored assets and animation clips
