# Ramayana Game Implementation Progress

Last updated: 2026-05-23 (Step 2 landed)

This is the handoff file for the next AI agent. Read this first and update it after every meaningful implementation step.

## Handoff Snapshot (2026-05-23)

The current track is **AAA Phase 1 — Visuals Foundation Vertical Slice**, defined in [`docs/superpowers/specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md`](superpowers/specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md).

The spec breaks Phase 1 into 8 implementation steps. Each step is independently shippable and each will need its own plan written before execution.

**Step status:**

| # | Step | Status | Plan |
|---|---|---|---|
| 1 | Refactor scaffold (split `src/app3d.js` into modules) | **Done (pending browser smoke test)** — `app3d.js` shrunk from 2293 → ~880 lines, all 22 extraction commits landed; merged to `master` in PR #1 | [`docs/superpowers/plans/2026-04-19-aaa-phase-1-step-1-refactor-scaffold.md`](superpowers/plans/2026-04-19-aaa-phase-1-step-1-refactor-scaffold.md) |
| 2 | Asset pipeline (`LoadingManager`, `GLTFLoader`, loading screen) | **Done (pending browser smoke test)** — `AssetLibrary` + `LoadingScreen` wired into boot flow; save key bumped to v4 | [`docs/superpowers/plans/2026-05-23-aaa-phase-1-step-2-asset-pipeline.md`](superpowers/plans/2026-05-23-aaa-phase-1-step-2-asset-pipeline.md) |
| 3 | Rendering upgrades (`EffectComposer`, bloom, SSAO, FXAA, ACES retune) | Not started | None yet |
| 4 | Character pipeline (Rama GLTF + animation state machine) | Not started | None yet |
| 5 | Enemy pipeline | Not started | None yet |
| 6 | Ayodhya rebuild with GLTF assets | Not started | None yet |
| 7 | Polish pass (palette, attribution) | Not started | None yet |
| 8 | Final verification across quality tiers | Not started | None yet |

**Next AI's job:**

1. **Validate Steps 1 + 2 in a real browser.** Run the full Step 1 smoke checklist (from `docs/superpowers/plans/2026-04-19-aaa-phase-1-step-1-refactor-scaffold.md`). Then verify Step 2 specifically: loading screen appears on first boot, progress bar fills to 100%, screen fades out, title menu appears. With zero assets queued, the loading screen should display for ~400ms (the minimum-display-time floor) before transitioning.
2. **Write a Step 3 plan** using `superpowers:writing-plans` against the parent spec. Step 3 is rendering upgrades (`EffectComposer`, bloom, SSAO, FXAA, ACES retune).
3. **Execute Step 3.**

**Progress on Step 2 (asset pipeline):** all 7 tasks complete.

- [x] Task 1: `src/engine/assets.js` — `AssetLibrary` wrapping `LoadingManager` + `GLTFLoader`, with `loadGLTF`, `get`, `clone`, `getAnimations`, `startAll`.
- [x] Task 2: `src/engine/loading.js` — `LoadingScreen` controller (show/setProgress/hide/showError) with min-display-time gate and flavor-line rotation.
- [x] Task 3: `<div id="loading-screen">` in `index.html` + matching styles in `style.css`. Importmap added so bare `'three'` / `'three/addons/'` specifiers resolve in the browser (required by GLTFLoader's internal imports).
- [x] Task 4: save key bumped `v3` → `v4` in `src/engine/save.js`; v3 saves silently discarded on module load.
- [x] Task 5: `app3d.js` boot flow now goes `loading screen show → assets.startAll → onLoad → loading screen hide + title menu`. Zero assets queued today; Steps 4/6 will add real `loadGLTF` calls.
- [x] Task 6: `node --check` clean across all changed files. **Browser smoke test still pending** (remote container has no WebGL).
- [x] Task 7: this doc + architecture doc.

**Progress on Step 1 (refactor scaffold):** all 23 tasks complete.

- [x] Task 1: extract `engine/save.js`
- [x] Task 2: extract settings persistence into `engine/save.js`
- [x] Task 3: extract `engine/input.js`
- [x] Task 4: extract `engine/collision.js`
- [x] Task 5: extract `engine/renderer.js`
- [x] Task 6: extract `engine/lighting.js`
- [x] Task 7: extract `engine/camera.js`
- [x] Task 8: extract `world/decor.js` (shared primitive builders)
- [x] Task 9: extract `world/ayodhya.js`
- [x] Task 10: extract forest/kishkindha/lanka districts (no Ravana district existed in current code; Ravana boss area is part of `lanka.js`)
- [x] Task 11: extract `world/backdrop.js`, `world/roads.js`
- [x] Task 12: extract `world/world.js` orchestrator
- [x] Task 13: extract `entities/enemy.js`
- [x] Task 14: extract `entities/chariot.js`
- [x] Task 15: extract `entities/player.js`
- [x] Task 16: extract `combat/sword.js`
- [x] Task 17: extract `combat/bow.js`
- [x] Task 18: extract `ui/hud.js`
- [x] Task 19: extract `ui/overlay.js`
- [x] Task 20: extract `ui/menu.js`
- [x] Task 21: extract `missions/missions.js`
- [x] Task 22: final cleanup of `app3d.js` (~880 lines, above the 500-line aspirational target but the residual is orchestrator wiring — event binding and mission flow coordination — that doesn't extract cleanly without dragging state into modules)
- [x] Task 23: update architecture + handoff docs

**Residual contents of `src/app3d.js`** (per Task 22 documentation requirement):

- Constructor (DOM lookups, state init, module wiring, world build, event binding)
- `_bindEvents` — keyboard / mouse / pointer-lock / wheel / resize listeners (~110 lines, tightly coupled to UI mode state)
- Mission flow (`_startNewGame`, `_continueGame`, `_resetActorsForMission`, `_restoreActorState`, `_updateMission`, `_completeMission`, `_spawnMissionEnemies` shim) — these coordinate player, vehicle, enemies, HUD, overlay, save in one place
- Save snapshot assembly (`_saveGame` reads from player/vehicle/enemies and writes via `engine/save.js`)
- Thin shims for module functions still called from many places (`_updateHUD`, `_updateRadar`, `_toast`, `_setMarker`, etc.)

These can be extracted further in a future cleanup pass, but the visual-foundation roadmap doesn't require it.

**Important verification note:** the headless container used for these refactor commits cannot create a WebGL context (per the original session), so browser smoke tests were not run as part of these commits. Each task used `node --check` syntax validation plus careful verbatim code moves. Run the smoke checklist in a real browser before declaring Step 1 fully done.

**The legacy 2D plan in [`docs/P0-design.md`](P0-design.md) is no longer the active track.** That document describes the older canvas runtime; the active runtime is the 3D Three.js build in `src/app3d.js`. Do not work from `P0-design.md` for new features.

**Uncommitted modified files (carry-over from prior sessions):**
- `README.md`, `index.html`, `package.json`, `style.css`
- `src/constants.js`, `src/game.js`, `src/hud.js`, `src/level.js`

**Uncommitted new files:**
- `src/bootstrap.js`, `src/app3d.js` (active runtime — treat as primary)
- `src/chapters.js`, `src/cutscene.js`, `src/renderer3d.js`, `src/room.js` (legacy 2D chapter runtime, inactive — will be deleted after Phase 1 ships)
- `dev_server.py` (no-cache local server)
- `package-lock.json`
- `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PROGRESS.md`, `docs/P0-design.md`
- `RAMAYANA_GAME_ROADMAP.md`
- `docs/superpowers/plans/2026-04-19-aaa-phase-1-step-1-refactor-scaffold.md` (this session's output)

**Last committed state:** `5ec2e79 Add Phase 1 AAA design spec: visuals foundation vertical slice`.

## Current State

The active browser build is the Three.js third-person runtime, not the older canvas chapter runtime.

Active entry path:

- [index.html](/Users/shashank/workspace/ramayana-game/index.html)
- [style.css](/Users/shashank/workspace/ramayana-game/style.css)
- [src/bootstrap.js](/Users/shashank/workspace/ramayana-game/src/bootstrap.js)
- [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js)

Recommended local server:

- [dev_server.py](/Users/shashank/workspace/ramayana-game/dev_server.py)

The older 2D/canvas files are still present, but they are legacy and inactive unless someone rewires the entry point manually.

## Completed In This Phase

### 1. Title Menu And Startup Flow

Implemented in:

- [index.html](/Users/shashank/workspace/ramayana-game/index.html)
- [style.css](/Users/shashank/workspace/ramayana-game/style.css)
- [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js)

What works:

- title screen menu with `New Game`, `Load Game`, `Settings`, and `Exit`
- keyboard menu navigation with `ArrowUp`, `ArrowDown`, `W`, `S`, and `Enter`
- intro dialogue sequence before gameplay begins
- chapter intro dialogue still plays after the prologue

### 2. Input Fixes

Implemented in:

- [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js)

What changed:

- on-foot movement now supports arrow keys as well as `WASD`
- chariot driving now supports arrow keys as well as `WASD`
- right shift also works for sprint
- mouse look now uses persisted sensitivity and invert-Y settings

### 3. Settings Layer

Implemented in:

- [index.html](/Users/shashank/workspace/ramayana-game/index.html)
- [style.css](/Users/shashank/workspace/ramayana-game/style.css)
- [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js)

What works:

- look sensitivity slider
- graphics quality selector
- invert-look-Y toggle
- settings persistence via `localStorage`

Settings key:

- `ramayana-3d-settings-v1`

### 4. Local Boot Reliability Fix

Implemented in:

- [src/bootstrap.js](/Users/shashank/workspace/ramayana-game/src/bootstrap.js)
- [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js)
- [dev_server.py](/Users/shashank/workspace/ramayana-game/dev_server.py)
- [package.json](/Users/shashank/workspace/ramayana-game/package.json)

What changed:

- installed local `three` dependency instead of importing from `unpkg`
- added a bootstrap loader so runtime boot failures surface on screen
- fixed the boot path so the game still starts even when the module loads after `DOMContentLoaded`
- made renderer creation retry with a simpler WebGL configuration before failing
- added a no-cache local dev server so the browser stops serving stale JS/CSS
- made `npm start` and `npm run dev` use the no-cache server

Current save key:

- `ramayana-3d-openworld-v3`

## Verification Done

Syntax check passed:

- [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js)

Live verification done in a headless browser:

- the new server serves [index.html](/Users/shashank/workspace/ramayana-game/index.html), [src/bootstrap.js](/Users/shashank/workspace/ramayana-game/src/bootstrap.js), [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js), and local Three.js from `node_modules`
- boot failures now surface visibly in the overlay instead of silently failing

Observed in headless:

- the environment available to headless Chrome could not create a WebGL context
- the on-screen boot error correctly reported `Error creating WebGL context`

Important interpretation:

- the boot path is now diagnosable
- whether the actual 3D game runs still depends on the user’s browser having working WebGL

## Manual QA Still Needed In A Normal Browser

- confirm the title menu appears in the user’s real browser
- confirm `New Game` starts the prologue, then the first playable chapter
- confirm `Load Game` works from the title menu
- confirm arrow-key movement works on foot and in the chariot
- confirm settings changes affect camera feel and render quality
- confirm pointer lock still behaves correctly after overlays
- confirm the user’s browser can create a WebGL context

## Known Constraints

- The active 3D game is still built from primitive geometry, not real character/environment assets.
- There is no skeletal animation system yet.
- Collision is custom AABB logic, not a physics engine.
- Enemy movement has no navmesh.
- The runtime is now split across focused modules under `src/engine/`, `src/world/`, `src/entities/`, `src/combat/`, `src/ui/`, `src/missions/`. `src/app3d.js` is now ~880 lines of orchestrator wiring instead of the original 2293-line monolith.
- The 3D runtime still requires working WebGL support in the browser.

## Best Next Step

1. **Run the smoke checklist for Steps 1 + 2 in a real browser.**
2. **Write a plan for AAA Phase 1 Step 3** (rendering upgrades — `EffectComposer`, bloom, SSAO, FXAA, ACES retune) using `superpowers:writing-plans` against the parent spec at `docs/superpowers/specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md`.
3. **Execute Step 3** using `superpowers:subagent-driven-development` or `superpowers:executing-plans`.

Steps 4 (Rama GLTF) and 6 (Ayodhya GLTF) will be the first to actually exercise the asset pipeline. Both depend on real `.glb` files being sourced (see the spec's "Asset Pipeline → Sources" section for the recommended CC0 pack list).

## Files Touched In This Phase

- [index.html](/Users/shashank/workspace/ramayana-game/index.html)
- [style.css](/Users/shashank/workspace/ramayana-game/style.css)
- [src/bootstrap.js](/Users/shashank/workspace/ramayana-game/src/bootstrap.js)
- [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js)
- [dev_server.py](/Users/shashank/workspace/ramayana-game/dev_server.py)
- [package.json](/Users/shashank/workspace/ramayana-game/package.json)
- [README.md](/Users/shashank/workspace/ramayana-game/README.md)
- [docs/ARCHITECTURE.md](/Users/shashank/workspace/ramayana-game/docs/ARCHITECTURE.md)
- [docs/IMPLEMENTATION_PROGRESS.md](/Users/shashank/workspace/ramayana-game/docs/IMPLEMENTATION_PROGRESS.md)

## Reminder For The Next Agent

- Treat [src/bootstrap.js](/Users/shashank/workspace/ramayana-game/src/bootstrap.js) plus [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js) as the active runtime.
- Use [dev_server.py](/Users/shashank/workspace/ramayana-game/dev_server.py) when testing locally so cache does not hide frontend changes.
- The old canvas files remain in the repo but are not loaded by [index.html](/Users/shashank/workspace/ramayana-game/index.html).
- Update this file again before stopping after the next feature phase.
