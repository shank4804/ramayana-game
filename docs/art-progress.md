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
- [x] Vite aliases `three` and `three/addons` to one runtime path to prevent duplicate Three.js instances.
- [x] Local hand-written `three` module declarations were removed in favor of official Three typings.
- [x] Rapier collision backend installed (`@dimforge/rapier3d-compat`) and wired (see Local Integration Pass).

## Milestone 5: Ayodhya Vertical Slice

- [x] Explorable Ayodhya district layout is built from procedural architecture kit modules.
- [x] Palace, streets, city gates, market props, foliage, and ambient NPCs are placed in the district.
- [x] Collision proxies are emitted for buildings, gates, walls, trees, stairs, ramps, and market stalls.
- [x] Walkable stairs and ramps are excluded from horizontal movement blockers.
- [x] Dasharatha prologue cutscene state transitions into Rama gameplay.
- [x] One main quest is implemented for Dasharatha's blessing.
- [x] One side quest is implemented for lighting the market lamps.
- [x] Story gates keep the player inside Ayodhya with visible city gate/guard framing.
- [x] Story gates have solid collision blockers while still surfacing E-interaction prompts.
- [x] District perimeter has containment collision to prevent edge leaks into the void.
- [x] Post-prologue spawn and initial camera framing show Rama from a clean readable street view.
- [x] Third-person camera resolves against collision proxies before settling behind Rama.
- [x] Minimal quest/interact prompts are surfaced through the HUD.
- [x] First audio pass includes procedural ambience, footstep ticks, UI feedback, and a music bed after first user interaction.

## Milestone 6: Combat And Cinematics

- [x] Three-hit sword combo is mapped to left click / `J`.
- [x] Each sword hit uses a distinct procedural swing slice and combo timing.
- [x] Sword hit detection damages enemies through overlap checks, including point-blank adjacent targets.
- [x] Bow aim shows a crosshair and uses the existing aim camera zoom.
- [x] Bow fire launches fast arrow projectiles that damage enemies on hit.
- [x] Dodge creates a timed iFrame window and cooldown-gated roll movement.
- [x] Enemies stagger on hit, have HP, and are removed from play at 0 HP.
- [x] Enemy hit feedback reports Rama hits, enemy HP, and defeat.
- [x] Lock-on cycles nearby enemies with `Q` and renders a visible indicator above the target.
- [x] Combat HUD reports locked target name and HP.
- [x] Lock-on subtly focuses the third-person camera toward the target.
- [x] Lock-on rotates Rama toward the locked target before attacks resolve.
- [x] HUD mode reflects attack and dead states.
- [x] HUD mode explicitly reflects attack and aim combat states.
- [x] Player defeat at 0 health locks control, shows a defeat message, and respawns Rama with restored health.
- [x] Rakshasa and guard enemy types are placed with patrol, detect, chase, attack, and return states.
- [x] Data-driven cutscene timelines define camera keyframes, subtitles, and trigger metadata.
- [x] Cutscene camera rails interpolate smoothly between keyframes.
- [x] Subtitles render through the DOM HUD overlay.
- [x] `E` or `Escape` skips an active cutscene.
- [x] Cutscenes cleanly restore normal player control, HUD, and camera updates.

## Milestone 7: Kanda Expansion

- [x] Forest Exile has a distinct cooler green palette module.
- [x] Forest Exile procedural kit exports floor, dense tree, rock/cliff, hermitage hut, campfire, and path marker modules.
- [x] Forest Exile hub scene places hermitage camp, river plane, forest ring, path markers, Rama, and Lakshmana.
- [x] Forest Exile hub emits collision for floor, trees, rocks, hut, campfire, and containment boundaries.
- [x] Forest Exile defines story-gated paths for Ayodhya return and deeper forest progression.
- [x] Forest Exile defines a first side quest hook for gathering firewood.
- [x] Runtime hub manager can unload and load Ayodhya and Forest Exile hubs.
- [x] Ayodhya story gates transition to Forest Exile after the main quest is complete.
- [x] Forest Exile return gate transitions back to Ayodhya.
- [x] Controller, camera collision, combat, spawn, HUD, and pixel palette are rebound after hub transitions.
- [x] Previous hub object trees are removed and disposed during transitions.
- [x] Debug hub toggle hotkey is available behind the `debugHubs=1` flag.
- [ ] Kishkindha hub kit and palette are not started.
- [ ] Lanka hub kit and palette are not started.
- [ ] Hanuman playable traversal profile is deferred until Kishkindha.

## Local Integration Pass (network-dependent items, done outside the Codex sandbox)

These two items required network access (npm install / asset download) that the
Codex sandbox lacked, so they were implemented and verified locally.

- [x] Real Rapier physics replaces the AABB collision fallback. `initPhysics()`
      loads the WASM during boot; `createCollisionWorld` builds a Rapier static
      world per hub with a kinematic character controller (collide-and-slide),
      keeping the existing `CollisionWorld` interface. A pure-JS AABB fallback
      remains if Rapier has not initialised. Regenerated `package-lock.json`
      (the prior lockfile had empty esbuild optional-dep versions).
- [x] Real CC0 GLB humanoid replaces the procedural box figure. Kenney
      "Starter Kit: 3D Platformer" character (CC0), committed at
      `assets/runtime/characters/base_humanoid.glb` with texture references
      stripped, preloaded at boot and cloned per character. Recoloured per
      palette swap (torso/legs/arms), antenna hidden, code-built bow, quiver,
      and crown attached to the torso node, and idle/walk locomotion driven by
      a self-contained mixer ticker. The primitive figure stays as a fallback.
- [x] Verified in-app: movement/collision/slide/containment under Rapier; the
      recoloured GLB character renders and animates with accessories and no
      console errors.
