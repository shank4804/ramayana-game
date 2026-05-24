# AAA Phase 1 — Step 3: Rendering Upgrades Implementation Plan

**Goal:** Wire `EffectComposer` with the post-processing stack from the parent spec, retune fog/lights to match the new tonemapping, and gate everything through the existing `medium` / `high` / `epic` quality settings.

**Source spec:** [`docs/superpowers/specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md`](../specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md), section "Rendering & Post-Processing".

**Out of scope (later steps):** character/enemy/Ayodhya GLTF (Steps 4–6), palette pass + attribution (Step 7), full quality-tier playthrough verification (Step 8).

---

## Pipeline target

`EffectComposer` passes, in order:

1. `RenderPass` — main scene
2. `SSAOPass` — high / epic only; medium skips
3. `UnrealBloomPass` — threshold 0.9, strength 0.5, radius 0.4
4. ACES tonemapping — already on via `renderer.toneMapping = ACESFilmicToneMapping`
5. `FXAAPass` (via `ShaderPass(FXAAShader)`) — last
6. `OutputPass` — converts linear → sRGB for display (required when using composer with newer Three)

## Quality tiers

| Setting        | medium | high  | epic        |
|----------------|--------|-------|-------------|
| shadow map     | 1024²  | 2048² | 4096²       |
| SSAO           | off    | on    | on          |
| bloom          | on     | on    | on          |
| pixel ratio    | ≤1.2   | ≤1.6  | ≤2.1        |
| fog far        | 240    | 320   | 420         |

## Tasks

### Task 1: Promote renderer to a composer-aware module

Rewrite `src/engine/renderer.js` to export both `createRenderer` (existing) and a new `createPostProcessing(renderer, scene, camera, settings)` that builds an `EffectComposer` and the gated passes. Returns `{ composer, setQuality(level) }`.

`setQuality(level)` should:
- toggle the SSAO pass `enabled` flag (no re-creation, just toggle)
- update bloom strength if needed (Phase 1: leave as-is)
- update shadow map size on the sun directional light (handle on the lighting side, not here — the orchestrator owns the sun reference)

### Task 2: Wire the composer into `app3d.js`

- Instantiate via `createPostProcessing(this.renderer, this.scene, this.camera, this.settings)` after the scene + camera are built.
- Replace the render call in `_animate` from `this.renderer.render(this.scene, this.camera)` to `this.composer.render()`.
- Add `_handleResize` to also resize the composer (`composer.setSize(width, height)` + FXAA resolution uniform update).

### Task 3: Update `_applySettings`

- Keep existing shadow size + pixel ratio + exposure logic.
- New: call `this.postFx.setQuality(quality)` so SSAO toggles with the quality tier.
- New: adjust `this.scene.fog.far` per tier (240 / 320 / 420). `fog.near` stays at 90.

### Task 4: Retune lighting only if obviously needed

Per parent spec, lighting re-tune is Step 3's job. For Phase 1, the only known issue is that the existing tonemapping exposure of 1.05 may now look hot under bloom + SSAO. Drop exposure to 1.0 at `high` and keep `medium=0.98`, `epic=1.14` (epic stays hot intentionally — it's the "show off" mode).

### Task 5: Verify

- `node --check` clean across changed files
- Browser smoke: scene renders; quality switch between medium/high/epic visibly affects bloom/SSAO; window resize works without warping.

### Task 6: Docs

Update `IMPLEMENTATION_PROGRESS.md` (mark Step 3 done, point to Step 4 next) and `ARCHITECTURE.md` (add the post-processing pipeline description).

---

## Notes

- `OutputPass` is essential when using a composer — without it, the final output is in linear color space and looks washed out. Three.js docs and r160+ examples all include it as the last pass.
- `FXAAShader` requires a uniform update on resize (`resolution.x = 1/width`, `resolution.y = 1/height`). Don't forget this in `_handleResize`.
- `SSAOPass` is comparatively expensive. Toggling its `.enabled` flag (vs. re-creating the composer) is the cheap path. Same for `UnrealBloomPass`.
- The save/settings format does not change in this step — quality is already a saved field. No save key bump needed.
- Browser smoke test is the only way to know whether the visual values land. The remote container can't run WebGL; flag this in the progress doc.
