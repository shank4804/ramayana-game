# Ramayana Game Implementation Progress

Last updated: 2026-05-23

This is the handoff file for the next AI agent. Read this first and update it after every meaningful implementation step.

## Handoff Snapshot (2026-05-23)

The current track is **AAA Phase 1 — Visuals Foundation Vertical Slice**, defined in [`docs/superpowers/specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md`](superpowers/specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md).

The spec breaks Phase 1 into 8 implementation steps. Each step is independently shippable and each will need its own plan written before execution.

**Step status:**

| # | Step | Status | Plan |
|---|---|---|---|
| 1 | Refactor scaffold (split `src/app3d.js` into modules) | **In progress** — engine layer extracted (tasks 1-7 of 23 done) | [`docs/superpowers/plans/2026-04-19-aaa-phase-1-step-1-refactor-scaffold.md`](superpowers/plans/2026-04-19-aaa-phase-1-step-1-refactor-scaffold.md) |
| 2 | Asset pipeline (`LoadingManager`, `GLTFLoader`, loading screen) | Not started | None yet |
| 3 | Rendering upgrades (`EffectComposer`, bloom, SSAO, FXAA, ACES retune) | Not started | None yet |
| 4 | Character pipeline (Rama GLTF + animation state machine) | Not started | None yet |
| 5 | Enemy pipeline | Not started | None yet |
| 6 | Ayodhya rebuild with GLTF assets | Not started | None yet |
| 7 | Polish pass (palette, attribution) | Not started | None yet |
| 8 | Final verification across quality tiers | Not started | None yet |

**Next AI's job:** finish Step 1. The engine layer is extracted (`src/engine/save.js`, `input.js`, `collision.js`, `renderer.js`, `lighting.js`, `camera.js`). Remaining work: world/decor extractions (tasks 8-12), entities (13-15), combat (16-17), UI (18-20), missions (21), cleanup (22), docs (23). After Step 1 lands, write a new plan for Step 2 (Asset pipeline) and continue.

**Progress on Step 1 (refactor scaffold):**

- [x] Task 1: extract `engine/save.js`
- [x] Task 2: extract settings persistence into `engine/save.js`
- [x] Task 3: extract `engine/input.js`
- [x] Task 4: extract `engine/collision.js`
- [x] Task 5: extract `engine/renderer.js`
- [x] Task 6: extract `engine/lighting.js`
- [x] Task 7: extract `engine/camera.js`
- [ ] Task 8: extract `world/decor.js` (shared primitive builders)
- [ ] Task 9: extract `world/ayodhya.js`
- [ ] Task 10: extract forest/kishkindha/lanka/ravana districts
- [ ] Task 11: extract `world/backdrop.js`, `world/roads.js`
- [ ] Task 12: extract `world/world.js` orchestrator
- [ ] Task 13: extract `entities/enemy.js`
- [ ] Task 14: extract `entities/chariot.js`
- [ ] Task 15: extract `entities/player.js`
- [ ] Task 16: extract `combat/sword.js`
- [ ] Task 17: extract `combat/bow.js`
- [ ] Task 18: extract `ui/hud.js`
- [ ] Task 19: extract `ui/overlay.js`
- [ ] Task 20: extract `ui/menu.js`
- [ ] Task 21: extract `missions/missions.js`
- [ ] Task 22: final cleanup of `app3d.js`
- [ ] Task 23: update architecture + handoff docs

**Important verification note:** the headless container used for these refactor commits cannot create a WebGL context (per the original session), so browser smoke tests cannot be run remotely. Each task here uses `node --check` syntax validation plus careful verbatim code moves. Whoever picks this up should run the full smoke checklist from the plan's "Conventions Used Throughout This Plan" section in a real browser before declaring Step 1 done.

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
- Most of the new runtime still lives in one large file: [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js).
- The 3D runtime still requires working WebGL support in the browser.

## Best Next Step

Execute the Step 1 plan: [`docs/superpowers/plans/2026-04-19-aaa-phase-1-step-1-refactor-scaffold.md`](superpowers/plans/2026-04-19-aaa-phase-1-step-1-refactor-scaffold.md).

The plan has 23 bite-sized tasks. Each task extracts one cohesive chunk of `src/app3d.js` into a focused ES module, verifies the game still boots/plays identically, and commits. Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to drive it.

After Step 1 lands, write a new plan for Step 2 (Asset Pipeline) using `superpowers:writing-plans` against the parent spec.

The earlier WebGL-fallback branch is no longer the next priority — the user's browser is serving the 3D runtime fine and the AAA Phase 1 track now drives the schedule. If WebGL breaks again on a specific browser, treat it as a separate bug, not a track shift.

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
