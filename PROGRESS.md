# Progress

## Done

- [x] Created a fresh Vite, TypeScript, and Three.js scaffold with strict TypeScript settings.
- [x] Added title, loading, renderer boot, resize handling, and WebGL2 required error UI.
- [x] Added ACES tone mapping and initial EffectComposer wiring.
- [x] Added a manifest-loading boot path and dev-only primitive validation flag.
- [x] Created the initial `assets/` layout and catalog/license placeholder files.
- [x] Created initial `src/` subsystem boundaries for simulation, render, physics, cinematics, world, assets, ui, and diagnostics.
- [x] Verified `npm run build` and `npx tsc --noEmit` pass.

## Next Steps

- [ ] Milestone 2: Add manifest-driven `AssetManager`, GLTF loading, asset preview, license validation, Blender export preset, and glTF Transform scripts.
- [ ] Milestone 3: Source and validate real Rama/Ayodhya assets, lighting presets, shadows, fog, bloom, and visual review workflow.
- [ ] Milestone 4: Add Rama character controller, third-person camera, input mapping, Rapier collision, weapon attachment points, and minimal HUD.
- [ ] Milestone 5: Build the polished Ayodhya vertical slice with quests, story gates, NPCs, collision proxies, ambience, and first audio pass.
- [ ] Milestone 6: Add combat, enemy reactions, bow/sword timing, lock-on, and data-driven cinematics.
