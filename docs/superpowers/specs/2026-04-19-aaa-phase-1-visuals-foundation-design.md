# AAA Phase 1 — Visuals Foundation (Vertical Slice)

**Status:** Draft — awaiting user review
**Date:** 2026-04-19
**Phase:** 1 of N (toward AAA feel)
**Scope:** Vertical slice — Rama + Ayodhya district + one enemy archetype, with full `src/app3d.js` refactor

---

## Goal

Establish the engine foundation (asset pipeline, animation state machine, lighting/post-processing rig, modular code layout) against **one hero, one district, one enemy type**. Once this slice looks and plays like a stylized AAA prototype, the same pattern is cloned in later phases for the remaining characters, districts, and chapters.

Phase 1 is **not** full game content. It is the pipeline. Success means:

- Rama is a rigged GLTF character with skeletal animation (idle / walk / run / attack / dodge / hit / death / aim) driven by a state machine.
- Ayodhya district uses real stylized GLTF environment assets (ground, buildings, trees, props) with proper lighting and shadows.
- One melee rakshasa enemy uses the same animation state machine shape as Rama.
- Post-processing stack (ACES tonemapping, bloom, SSAO, FXAA) is wired through `EffectComposer` and gated by the existing `medium` / `high` / `epic` quality settings.
- `src/app3d.js` is split into focused modules under `src/engine/`, `src/world/`, `src/entities/`, `src/combat/`, `src/ui/`, `src/missions/`.
- First-load UX has a loading screen with progress bar covering GLTF and texture loads.
- Game flow (title → prologue → chapter intro → gameplay → mission progression → save/load) still works end-to-end after the refactor.

Success explicitly **does not** include: redesigning combat feel (Phase 2), re-skinning forest/Kishkindha/Lanka/Ravana districts (follow-up phases), authored cutscene cameras (Phase 4), NPC dialogue actors in-world (Phase 3).

---

## Non-Goals

- No new gameplay systems. No new missions. No new save fields beyond what the new modules require.
- No bundler or build step is introduced. `bootstrap.js` continues to dynamically load ES modules. Three.js remains from local `node_modules`.
- No physics engine. AABB collision stays as-is, just moved to `src/engine/collision.js`.
- No navmesh. Enemy AI stays on the same pursuit logic, just moved to `src/entities/enemy.js`.
- No new languages or frameworks. Vanilla JS + Three.js only.

---

## Architecture

### Module Structure After Refactor

```
src/
  bootstrap.js                  (unchanged — dynamic import + boot error overlay)
  app3d.js                      (shrinks to: Ramayana3DGame orchestrator + main loop)
  engine/
    renderer.js                 (Three.js renderer, EffectComposer, quality tiers)
    assets.js                   (GLTFLoader, texture cache, animation library)
    lighting.js                 (directional sun, hemisphere fill, shadow rig)
    collision.js                (AABB registry, _moveBody, _resolveCollisions)
    input.js                    (keys, mouse, pointer-lock, sprint, dodge, F-toggle)
    camera.js                   (third-person follow, pointer-lock, wheel zoom)
    save.js                     (localStorage get/set, save key v4, schema check)
    loading.js                  (loading screen, LoadingManager wiring)
  world/
    world.js                    (district registry, active-district state)
    ayodhya.js                  (Ayodhya builder — real GLTF assets, Phase 1)
    forest.js                   (primitives — unchanged, wrapped as a module)
    kishkindha.js               (primitives — unchanged, wrapped as a module)
    lanka.js                    (primitives — unchanged, wrapped as a module)
    ravana.js                   (primitives — unchanged, wrapped as a module)
    backdrop.js                 (sky, fog, distant silhouettes)
    roads.js                    (road network shared across districts)
  entities/
    player.js                   (Rama controller + animation state machine)
    chariot.js                  (vehicle controller)
    enemy.js                    (enemy archetype + pursuit AI + animation SM)
  combat/
    sword.js                    (cone hit detection, damage, stagger)
    bow.js                      (arrow projectiles, aim, enemy orbs)
  ui/
    hud.js                      (chapter card, status card, radar, prompt, toast)
    overlay.js                  (title menu, settings, cutscene scenes)
    menu.js                     (menu navigation + state)
  missions/
    missions.js                 (MISSION_ORDER, progression state)
```

`Ramayana3DGame` in `app3d.js` remains the top-level orchestrator. It owns the scene, the main loop, and delegates to modules. Target size for the new `app3d.js`: under 500 lines.

### Module Contracts

Each module exports a small, focused interface. Examples:

- **`engine/renderer.js`** — `createRenderer(canvas, settings) -> { renderer, composer, passes, setQuality(level) }`. Owns WebGL context creation, shadow map size, post-processing pipeline. Quality tier switch rebuilds passes where necessary.
- **`engine/assets.js`** — `class AssetLibrary { loadGLTF(url), getAnimation(name), clone(key) }`. Owns one shared `GLTFLoader` + `LoadingManager`. Animation clips are cached by name. Skinned mesh cloning via `SkeletonUtils.clone`.
- **`engine/lighting.js`** — `installLighting(scene, quality) -> { sun, hemisphere, shadowCamera }`. Configures the directional sun for PCF shadows and an ambient-ish hemisphere for fill.
- **`engine/collision.js`** — `class ColliderRegistry { register(box, meta), moveBody(body, delta), pointHitsCollider(point) }`. Direct port of existing `_registerCollider` / `_moveBody` / `_resolveCollisions` / `_pointHitsCollider` logic.
- **`engine/input.js`** — `class InputState { keys, mouse, pointerLocked, consumeDodge(), consumeInteract() }`. One source of truth for input state; polled by player/chariot controllers.
- **`engine/camera.js`** — `class ThirdPersonCamera { updateOnFoot(player, dt), updateVehicle(chariot, dt), handleZoom(delta), applySettings(s) }`.
- **`engine/save.js`** — `loadSave() -> state | null`, `writeSave(state)`, `clearSave()`. Save key bumped to `ramayana-3d-openworld-v4`. Unknown schemas are discarded; old `v3` saves are ignored (not migrated).
- **`engine/loading.js`** — `class LoadingScreen { show(), setProgress(fraction, label), hide() }`. Bound to the shared `LoadingManager` in `assets.js`.
- **`world/world.js`** — `class World { build(scene, assets, settings), setActiveDistrict(id), update(dt) }`. Keeps the district registry and forwards updates.
- **`world/ayodhya.js`** — `async function buildAyodhya(scene, assets, colliders) -> { group, spawns, markers }`. Loads real GLTF assets, places them, registers colliders.
- **`world/forest.js`** / **`kishkindha.js`** / **`lanka.js`** / **`ravana.js`** — direct ports of the existing `_buildForestDistrict` / etc. with the same primitive geometry. Wrapped so later phases can re-skin them.
- **`entities/player.js`** — `class Player { spawn(assets, at), update(dt, input, world), onHit(damage), getTransform() }`. Owns the Rama character instance, animation state machine, dodge/sprint/attack/aim logic.
- **`entities/enemy.js`** — `class Enemy { spawn(assets, at, archetype), update(dt, player, world) }`. Same animation SM shape as Player. One archetype for Phase 1: melee rakshasa.
- **`entities/chariot.js`** — vehicle controller, direct port of `_createChariot` + `_updateChariot`.
- **`combat/sword.js`** / **`combat/bow.js`** — `doSwordAttack(player, enemies, world)`, `fireArrow(origin, direction, world)`, etc.
- **`ui/hud.js`** — `class HUD { setChapter(title, objective), setHealth(hp, max), setEnemies(n), setMode(s), setWeapon(s), setSpeed(v), updateRadar(player, markers), showPrompt(text), hidePrompt(), toast(text) }`.
- **`ui/overlay.js`** — `class Overlay { showTitle(), showSettings(), showScene(scene), hide() }`.
- **`ui/menu.js`** — keyboard navigation state machine for title menu.
- **`missions/missions.js`** — `const MISSION_ORDER = [...]`, `class MissionProgress { current(), advance(), reset() }`.

### Dependency Direction

```
bootstrap → app3d → (engine, world, entities, combat, ui, missions)
entities → engine (collision, input, camera, assets)
world    → engine (assets, collision, lighting)
combat   → entities (read-only hit queries)
ui       → engine (save only)
missions → (pure state, no deps)
```

No circular imports. `app3d.js` is the only module that wires everything together.

---

## Asset Pipeline

### Sources

- **Characters:** Quaternius "Ultimate Animated Character Pack" (CC0) or similar — provides a humanoid rig with idle/walk/run/jump/attack/die animations. Rama is built by recoloring/retexturing the base character + a bow/sword prop attached to a hand bone.
- **Environment:** Mix of Quaternius "Ultimate Nature / Fantasy Town / Ultimate Medieval" packs (CC0) and Poly Pizza CC0 search for India-adjacent architecture. Where a suitable asset is missing, we re-texture a generic stone/wood building with saffron / gold / terracotta palette to read as Ayodhya.
- **Enemy (rakshasa):** Same Quaternius animated humanoid base, retextured dark and given horns/claws from the "Ultimate Monster Pack" (CC0) where available.
- **Props:** banners, torches, fountains, chariot re-skin — Quaternius / Poly Pizza CC0.

### Formats

- **`.glb` only.** Binary GLTF is smaller and single-file. All meshes, skeletons, and animations bake into one file per asset.
- **Textures:** embedded in the GLB or shipped as sibling `.jpg`/`.ktx2`. If total download for Phase 1 exceeds ~15 MB, introduce KTX2 basis compression; otherwise ship JPG.
- **Licensing:** CC0 only. No GPL / CC-BY unless attribution is added to the credits screen.

### Loading

- Single shared `LoadingManager` in `engine/assets.js`. All loaders (GLTF, texture) go through it.
- `LoadingManager.onProgress` drives `LoadingScreen.setProgress`. `onLoad` hides it and transitions to the title menu.
- All Phase 1 assets load on first boot, before the title menu appears. No streaming or LOD system yet.
- Animation clips are extracted from the character GLB once, stored in a named map, and applied to cloned skinned meshes via `SkeletonUtils.clone`.

### Directory

```
assets/
  characters/
    rama.glb
    rakshasa.glb
  world/
    ayodhya/
      palace.glb
      house.glb
      gate.glb
      tree.glb
      fountain.glb
      banner.glb
      cobblestone.glb
  props/
    sword.glb
    bow.glb
  ATTRIBUTION.md
```

`assets/` lives at repo root. It is served statically by `dev_server.py`. No import path changes required — modules fetch via relative `./assets/...`.

---

## Animation State Machine

A single shared state machine shape used by both `Player` and `Enemy`.

**States:** `idle`, `walk`, `run`, `attack`, `dodge`, `hit`, `death`, `aim` (player only).

**Transitions (player):**
- `idle` ↔ `walk` ↔ `run` — driven by movement speed thresholds
- any of the above → `attack` — on LMB; returns to previous locomotion state at clip end
- any → `dodge` — on Space with stamina; i-frame window = 0.3s; returns to `idle` at clip end
- any → `aim` — on hold RMB; returns to `idle` on release
- any → `hit` — on damage; 0.4s stagger, returns to prior state
- any → `death` — when HP ≤ 0; terminal

**Transitions (enemy):** same minus `aim`, minus player input triggers; `walk`/`run` driven by pursuit distance, `attack` triggered when in range.

**Blending:** `AnimationMixer.crossFadeTo(newAction, 0.15, true)` between states. Attack and dodge clips play through to completion (non-interruptible) to preserve animation commitment; hit cancels them only if damage is lethal.

**Root motion:** disabled. Movement is driven by controller code; animations are cosmetic. (Root motion integration is a Phase 2 stretch goal.)

---

## Rendering & Post-Processing

### Lighting

- **Directional sun** — high-angle, warm tone, casts PCF soft shadows. Shadow map size per quality tier: medium 1024², high 2048², epic 4096².
- **Hemisphere light** — warm sky → cool ground, low intensity ambient fill.
- **Fog** — existing exponential fog retained, re-tuned to match new palette.
- **Shadow camera** — framed to the active district bounds, not the whole world (prevents wasted shadow map resolution).

### Post-Processing

`EffectComposer` pipeline, in order:
1. `RenderPass` — main scene
2. `SSAOPass` — cheap preset (high/epic only; medium skips)
3. `UnrealBloomPass` — threshold 0.9, strength 0.5, radius 0.4
4. ACES tonemapping — set via `renderer.toneMapping = ACESFilmicToneMapping`, `toneMappingExposure = 1.0`
5. `FXAAPass` — last

### Quality Tiers

Existing `medium` / `high` / `epic` setting gates:
- shadow map size (1024² / 2048² / 4096²)
- SSAO on/off (off / on / on with higher samples)
- pixel ratio cap (1.0 / 1.5 / device)
- draw distance / fog density (tight / medium / wide)

---

## Loading Screen

- Full-screen overlay shown on first boot, before title menu.
- Shows: game logo (existing "Ramayana 3D" brand), a progress bar (0–100%), and a rotating flavor line from a small pool ("Stringing Rama's bow…", "Raising Ayodhya's banners…", etc.).
- Bound to the shared `LoadingManager`. Hides when `onLoad` fires. Minimum display time = 400ms so it never flashes.
- If asset load fails: bar turns red, message "Failed to load: `<url>`", retry button. No silent fallback.

Lives in `src/engine/loading.js` + a new `<div id="loading-screen">` element in `index.html` + styles in `style.css`.

---

## Save System

- Save key bumps to **`ramayana-3d-openworld-v4`**.
- Old `v3` saves are **discarded, not migrated**. Motivation: the refactor changes the save shape substantially (module-owned state), writing migration code is not worth it for a prototype and this was confirmed with the user.
- Existing fields (mission index, mission state, player pos/HP, vehicle transform/speed, camera state, living enemies) are preserved in the new schema, just sourced from the new module-owned state objects.
- `engine/save.js` handles schema version check and rejects anything that isn't `v4`.

---

## Implementation Order

The plan is handed off to the `writing-plans` skill next, but here's the intended sequencing so the plan is coherent:

1. **Refactor scaffold** — create the new module directories; move code verbatim out of `app3d.js` in dependency order (save → input → camera → collision → renderer → lighting → world districts → entities → combat → ui → missions). Verify game still runs identically after each extraction.
2. **Asset pipeline** — add `LoadingManager`, `GLTFLoader`, `assets.js`, `loading.js`, loading screen UI. Verify a test `.glb` loads and the loading screen wires up.
3. **Rendering upgrades** — wire `EffectComposer`, bloom, SSAO, FXAA, ACES. Retune fog and lights. Verify quality tiers switch cleanly.
4. **Character pipeline** — import Rama GLTF, build animation state machine in `entities/player.js`, replace primitive player mesh. Verify idle/walk/run/attack/dodge/aim/hit/death all play correctly.
5. **Enemy pipeline** — same pattern as player, for the melee rakshasa.
6. **Ayodhya rebuild** — replace primitive Ayodhya geometry in `world/ayodhya.js` with GLTF assets. Re-register colliders to new bounding boxes.
7. **Polish pass** — palette tuning, shadow camera framing, loading screen flavor, attribution file.
8. **Verification** — full playthrough of the existing mission flow end-to-end, save/load across refactor boundary, all quality tiers, WebGL context resilience.

Each step is independently shippable (the game runs after each step). This is intentional — it protects against a mid-phase stall and matches the repo's "always playable" principle from `docs/P0-design.md`.

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CC0 assets don't look cohesive | Medium | High | Single palette pass + consistent tonemapping/lighting hide a lot of style delta. If still bad, budget a half-day to retexture outliers in Blender or use image-to-texture tools. |
| GLTF rig animations don't match expected state names | Medium | Medium | `assets.js` has an alias layer — map pack's clip names (e.g., `Armature|Walk_Cycle`) to our canonical names (`walk`). Code reads canonical names only. |
| Total asset download is too large for first boot | Medium | Medium | Loading screen already covers UX. If >15 MB, add KTX2 basis compression. If >40 MB, split into "boot pack" (Rama + Ayodhya core) and "on-demand" (enemy + props). |
| Refactor introduces regressions the existing manual QA path misses | High | High | Refactor happens in small commits; each commit must keep the game running. Playthrough checkpoint after every extraction step. |
| Post-processing tanks performance on low-end devices | Medium | Medium | Quality-tier gating on SSAO and shadow resolution; `medium` defaults to `SSAO off`. |
| Shadow acne / peter-panning from new sun angle | Low | Low | PCF soft shadows + tuned `shadow.bias` and `shadow.normalBias`. Budgeted as part of step 3. |
| WebGL context creation still fails on some browsers | Low | High | Existing bootstrap retry path stays in place; loading screen surfaces any fatal error. Non-WebGL fallback remains a separate future spec. |
| Save migration bites someone with an in-progress playthrough | Low | Low | Save key bumped to `v4`; old saves ignored. User was asked and approved. |

---

## Open Questions

None remaining. The following were confirmed during brainstorming:

- Scope: vertical slice (Ayodhya + Rama + one enemy) — confirmed
- Bundle refactor: yes — confirmed
- Loading screen: include — confirmed
- Save invalidation: bump to `v4`, discard old — confirmed

---

## Out of Scope (Later Phases)

- **Phase 2 (Gameplay feel):** hitstop, screen shake, input buffering, dodge i-frame tuning, lock-on, combo system
- **Phase 3 (World scale & density):** NPC actors with dialogue, ambient-life systems, side missions, interior environments
- **Phase 4 (Narrative & cinematics):** authored cutscene camera DSL, speaker portraits, cinematic set pieces
- **Re-skin of forest / Kishkindha / Lanka / Ravana districts** — each is a follow-up spec cloning the Ayodhya pattern
- **Navmesh / physics engine** — AABB stays
- **WebGL fallback / 2D mode** — separate spec
- **Animation root motion** — Phase 2 stretch

---

## References

- Active runtime: [`src/app3d.js`](/Users/shashank/workspace/ramayana-game/src/app3d.js)
- Current architecture: [`docs/ARCHITECTURE.md`](/Users/shashank/workspace/ramayana-game/docs/ARCHITECTURE.md)
- Prior progress log: [`docs/IMPLEMENTATION_PROGRESS.md`](/Users/shashank/workspace/ramayana-game/docs/IMPLEMENTATION_PROGRESS.md)
- Legacy 2D plan (superseded): [`docs/P0-design.md`](/Users/shashank/workspace/ramayana-game/docs/P0-design.md)
