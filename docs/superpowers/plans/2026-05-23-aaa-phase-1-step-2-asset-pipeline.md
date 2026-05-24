# AAA Phase 1 — Step 2: Asset Pipeline Implementation Plan

**Goal:** Wire the asset loading infrastructure (`LoadingManager`, `GLTFLoader`, `AssetLibrary`, `LoadingScreen`) into the runtime so that Step 4 (Rama GLTF) and Step 6 (Ayodhya GLTF) can drop in real assets without re-plumbing.

**Source spec:** [`docs/superpowers/specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md`](../specs/2026-04-19-aaa-phase-1-visuals-foundation-design.md), section "Asset Pipeline" and "Loading Screen".

**Scope:** Infrastructure only. No actual `.glb` files are added yet — those land in Steps 4 and 6. The plumbing must work with **zero** registered assets (loading screen flashes briefly, then transitions to title menu) so that Step 1 verification doesn't regress before any asset is authored.

**Out of scope (later steps):**
- Step 3 — post-processing (`EffectComposer`, bloom, SSAO, FXAA, ACES retune)
- Step 4 — Rama GLTF + animation state machine
- Step 5 — rakshasa GLTF + animation state machine
- Step 6 — Ayodhya rebuild with GLTF assets
- Step 7 — palette tuning, attribution file
- Step 8 — final verification across quality tiers

---

## Tasks

### Task 1: Create `src/engine/assets.js`

New module exporting `AssetLibrary` class wrapping a shared `LoadingManager` and `GLTFLoader`.

API:

```js
class AssetLibrary {
  constructor(onProgress, onLoad, onError)
  loadGLTF(key, url)                  // returns a promise; caches GLB result by key
  get(key)                            // returns cached GLB (gltf scene root + animations)
  clone(key)                          // returns a SkeletonUtils.clone of the cached GLB scene
  getAnimations(key)                  // returns the AnimationClip[] from the cached GLB
  startAll()                          // closes the manager so onLoad fires even if zero loads queued
}
```

The shared manager owns:
- progress callback (fraction, currentURL)
- final load callback
- error callback
- a tiny minimum-display-time gate so the loading screen never flashes too briefly

### Task 2: Create `src/engine/loading.js`

New module exporting `LoadingScreen` class. Owns the DOM element and exposes:

```js
class LoadingScreen {
  constructor(rootElement)
  show()
  setProgress(fraction, label)
  hide()
  showError(url, retry)
}
```

Lives on the `<div id="loading-screen">` we add to `index.html` in the next task. Hides via CSS class toggle.

### Task 3: Add loading screen DOM + CSS

- `index.html`: add `<div id="loading-screen">` with title, progress bar, flavor line, retry button (hidden until error).
- `style.css`: full-viewport overlay, semi-opaque background, centered card matching the existing brand color palette.

The element is visible by default (so first paint shows it before JS boots) and is hidden by the JS once the manager fires `onLoad`.

### Task 4: Bump save key to `ramayana-3d-openworld-v4`

Per spec: discard v3 saves rather than migrate. Update `src/engine/save.js` so:

- Active key is `v4`
- `hasSave` / `readSave` / `writeSave` / `clearSave` all use `v4`
- A one-time cleanup deletes any leftover `v3` blob from `localStorage` (silently)

This is grouped with Step 2 because Step 4/6 will start adding fields to the snapshot that v3 doesn't understand, and bumping the version now avoids needing a "save migration" branch later.

### Task 5: Wire `AssetLibrary` + `LoadingScreen` into `app3d.js`

- Instantiate the loading screen in the constructor; bind it to the asset library's progress callback.
- Currently no assets to load → call `assets.startAll()` immediately and let `onLoad` hide the screen and let the title flow proceed.
- The existing `_showTitle()` call moves behind the `onLoad` handler so Step 4 can add `await assets.loadGLTF('rama', './assets/characters/rama.glb')` without touching boot wiring.

### Task 6: Verify

- `node --check` clean across all changed files
- Loading screen shows briefly on first boot, then hides and reveals the title menu (browser smoke test — requires real browser).
- After title → new game → play → reload, save still restores (now at v4).

### Task 7: Update docs

- `docs/IMPLEMENTATION_PROGRESS.md` — mark Step 2 done, point to Step 3 as next.
- `docs/ARCHITECTURE.md` — add `engine/assets.js` and `engine/loading.js` to the module layout.

---

## Notes for the executing agent

- **No `.glb` files in this step.** Don't commit binary assets. Steps 4 and 6 land assets; Step 2 lands the pipe.
- **Don't break Step 1 verification.** The loading screen must not block the title menu when zero assets are queued.
- **`assets.startAll()` is the explicit "no more loads coming" signal.** Without it, `LoadingManager` waits forever because its `onLoad` only fires when load count drops from >0 to 0. We work around the zero-load case by deferring `onLoad` via `setTimeout` if no loads were started.
