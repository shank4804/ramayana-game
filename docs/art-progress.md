# Art Pivot Progress

## Milestone 2: Visual Style Foundation

- [x] Pixelation shader wired into the existing Three.js renderer.
- [x] Pixelation pass uses a Three.js render target and pixel-snap shader.
- [x] Pixel-size setting is player-facing and changes crunchiness at runtime.
- [x] Restricted Ayodhya color palette exported as a shared TypeScript constant.
- [x] Shared palette is used by the pixelation shader.
- [x] Shared palette is used by recolor materials.
- [x] Procedural environment kit exports a wall geometry factory.
- [x] Procedural environment kit exports a floor geometry factory.
- [x] Procedural environment kit exports a prop geometry factory.
- [x] Gradient sky shader, Ayodhya lighting, shadows, and fog are palette-tuned.

## Milestone 3: Procedural Kits And Look-Dev Courtyard

- [x] Look-dev Ayodhya courtyard scene is built from the procedural kit.
- [x] Look-dev courtyard is loaded by the default Three.js scene.
- [x] Look-dev courtyard renders a warm low-poly diorama arrangement.
- [x] Nature kit pieces are available for trees, rocks, and shrubs.
- [x] Ayodhya architecture pieces are available for walls, columns, arches, and gates.
- [x] CC0 character asset stand-in is integrated into the courtyard.
- [x] Character recolor system supports a primary palette-swap uniform.
- [x] Character recolor system supports a secondary palette-swap uniform.
- [x] Character exposes a back accessory socket.
- [x] Code-built bow and quiver accessories attach to the back socket.
- [x] Root `CREDITS.md` lists the CC0 source used.
- [x] `docs/art-progress.md` tracks art-pivot deliverables separately from existing progress files.

## Milestone 4: Third-Person Rama Slice

- [x] Rama stand-in is driven by a gameplay controller.
- [x] Keyboard movement mapping supports walk direction.
- [x] Keyboard sprint and dodge inputs are mapped.
- [x] Gamepad movement, camera, sprint, dodge, interact, and aim inputs are mapped.
- [x] Mouse drag controls third-person camera orbit.
- [x] Right mouse / left trigger controls shoulder aim camera mode.
- [x] GTA-like third-person camera follows Rama with orbit and shoulder aim distances.
- [x] Gameplay controller uses collision proxies instead of render meshes.
- [x] Walkable floor collision proxies are excluded from horizontal movement blockers.
- [x] Minimal HUD shows health, objective, prompt, controller mode, and current speed.
- [x] Vite config dedupes `three` resolution to address duplicate Three.js imports.
- [ ] Rapier collision backend is blocked until `@dimforge/rapier3d-compat` can be installed; npm registry lookup fails and the offline cache does not contain an installable package body.
- [ ] Removing local Three.js type stubs is blocked until real declarations can be installed; `three@0.182.0` in this repo does not ship `.d.ts` files and `@types/three@0.182.0` is not installable from the current npm cache.
