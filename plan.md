# Ramayana Three.js Rebuild Plan

## Summary

Rebuild the project from scratch as a high-quality Three.js third-person action-adventure. The target is a story-gated open world, closer to a scoped Assassin's Creed or GTA-style campaign than a linear prototype: explorable hubs, side quests, cinematic cutscenes, character switching, and strong visual presentation.

The art direction is an "A Short Hike"-style low-poly diorama: flat-shaded geometry, a warm region palette, and a signature pixelation filter that unifies everything into an intentional, charming look. This direction was chosen deliberately so that v1 requires no asset generation pipeline — almost everything is built procedurally in code, with a small set of CC0 rigged character models as the only external files.

The guiding production rule is simple: the first playable version must look like an intentional, cohesive low-poly game — a warm diorama, not unstyled programmer primitives. The style is cheap to produce but must never look careless.

## Core Direction

- Build the game with Vite, TypeScript, and Three.js.
- Use `WebGLRenderer` for v1. Treat `WebGPURenderer`/TSL as a possible future migration, not a v1 target.
- Pin Three.js and Rapier versions in `package.json` and upgrade deliberately, not automatically.
- Use Rapier for physics, traversal collision, grounded third-person movement, triggers, and combat hit volumes.
- Use `@dimforge/rapier3d-compat` (WASM inlined) to avoid bundler WASM-loading friction.
- Keep the existing `EffectComposer` post pipeline; the pixelation pass is its centerpiece, with ACES tone mapping retained.
- Target desktop-first input: keyboard/mouse and gamepad. Mobile/touch is explicitly out of scope for v1.
- Build environments, props, weapons, and VFX procedurally in code: primitive assemblies, lathe/extrude geometry, vertex colors, and instancing. No downloaded environment assets.
- Use a small set of CC0 rigged character GLBs (Quaternius) as the only external asset files, committed to the repo, given Ramayana identity in code via material recoloring and bone-attached accessories.
- Make the first production milestone a polished Ayodhya look-dev courtyard built from procedural kits, with one recolored animated character standing in for Rama.

## Art Direction

The game must look intentional and charming from the first playable slice.

- Low-poly, flat-shaded geometry (`flatShading: true` or faceted normals) with vertex colors or single flat-color materials. No PBR texture maps.
- Signature pixelation pass: render the scene into a low-resolution render target with nearest-neighbor filtering and upscale to the canvas, integrated into the existing `EffectComposer`. No anti-aliasing inside the low-res target.
- Default to a fine pixel size ("tiny and sharp") so combat and bow aiming stay readable; expose pixel size as a player-facing setting, from fine to "big and crunchy".
- Warm color palette sampled from reference photographs of Indian temple and palace architecture: sandstone, gold, saffron, teal, cream. One palette module per region so Ayodhya, Forest Exile, Kishkindha, and Lanka feel visually distinct.
- Gradient sky shader instead of HDRI files. Directional sun plus ambient light, soft shadows, atmospheric fog.
- Keep ACES tone mapping. Bloom and other effects are optional and must never reduce combat readability.
- Stylized primitive-built construction is the art style, not a placeholder. There is no "no primitives" rule; the quality bar is "intentional diorama charm", judged by screenshot review against region reference photos.
- Soft object outlines are a possible later enhancement for readability at low resolution; not required for v1.

### Performance And Payload Budgets

- Frame rate: 60 FPS on a mid-tier laptop (M1 MacBook Air / GTX 1650 class) at 1080p. The pixelation pass renders the scene at reduced resolution, which makes this budget easy to hold.
- Initial payload: under 10 MB before the title screen is interactive (code + a few character GLBs).
- Loading time: Ayodhya hub playable in under 5 seconds on a 50 Mbps connection.
- Scene budgets: lean on instancing for repeated kit pieces; treat draw-call spikes as optimization tasks.

## Asset Strategy

Everything is procedural in code except characters.

### Procedural in code (no external files)

- Terrain: heightmap-displaced plane with vertex-color banding (sand, grass, stone).
- Nature kit: trees (cones/icosahedrons on cylinder trunks), rocks, shrubs, flowers — randomized scale and jitter, instanced.
- Ayodhya architecture kit: modular walls, arches, columns, stairs, gates, balconies from boxes, cylinders, and lathe geometry. Built once as reusable code modules, instanced across the district.
- Props: pots, carts, market stalls, lamps, braziers, crates, rugs, banners (a waving plane via vertex shader).
- Weapons and VFX: bow, arrows, swords, gada, sword trails, hit sparks — primitive assemblies and particle systems.
- Each kit lives in `src/world/kits/` as a focused module with a small typed API.

### Characters: CC0 rigged GLBs

- Source: Quaternius rigged character packs and the Universal Animation Library (CC0). No license friction, no Blender step required.
- Commit the GLB files directly to the repo under `assets/runtime/characters/`.
- Give characters Ramayana identity in code at load time:
  - Material recolor system (roughly 20 lines per character): warm skin tones, saffron/gold dhoti color blocks for Rama, royal red/teal for Dasharatha, ash-grey for rakshasas.
  - Accessory attachment to bones: bow and quiver on Rama's back, crown for Dasharatha, jewelry as small gold torus/sphere primitives, sheathed sword. Accessories are code-built primitives.
- Hanuman is deferred to the Kishkindha milestone; he does not appear in the Ayodhya slice. When he arrives, start from a recolored humanoid base with a code-built tail and stylized head, or revisit then.
- Attribution: a single `CREDITS.md` at the repo root listing CC0 sources (Quaternius, any audio sources) as a courtesy, surfaced later as an in-game credits screen. No provenance metadata apparatus.

## Character Plan

### Rama

- One Quaternius humanoid base, recolored: warm skin, saffron/gold dhoti, simple ornament accents.
- Code-built bow, quiver, and sword attached to skeleton bones; arrow spawn point on the bow.
- Animation clips from the CC0 animation library: idle, walk, run, sprint, dodge, two attacks, bow aim, bow fire, hit reaction, death, interact.
- Readable heroic silhouette at third-person distance is the bar; the pixel filter and palette carry the rest.

### Lakshmana

- Same base mesh family, different palette (distinct sash/clothing colors), faster attack timing.
- Shares the locomotion clip set.

### Sita

- Cinematic/NPC only in early milestones: idle, walk, conversation, and emotional poses from the shared clip library.
- Distinct palette and jewelry accessories.

### Dasharatha

- Older royal NPC: recolored base, code-built crown, court idle/talk/sit gestures.

### Ravana

- Not attempted in the Ayodhya slice. Introduce through cinematic framing, shadow, statue, or mural first. The ten-headed silhouette is a special model/rig problem for a later milestone.

## Environment Plan

Each region is a procedural kit plus a palette module. The category lists below are kit checklists, not shopping lists.

### Ayodhya

Kit pieces: palace exterior masses, throne hall, modular sandstone walls, columns, arches, stairs, balconies, city gates, street/courtyard floors, market stalls, banners, lamps/braziers, trees and planters, carts/crates/jars, benches/rugs, background skyline silhouettes.

Visual direction: warm sandstone, gold accents, saffron/red/teal/cream fabric accents, strong sunlit courtyards, soft haze, high navigation readability.

### Forest Exile

Kit pieces: dense trees, shrubs, rocks/cliffs, hermitage huts, river/pond planes, campfire, path markers, encounter arenas.

Visual direction: greener, cooler, quieter than Ayodhya; light shafts, mist, warm camp areas against darker forest.

### Kishkindha

Kit pieces: rock formations, cave entrances, cliff paths, ruins, vanara settlement pieces, elevated platforms, banners.

Visual direction: verticality, golden rock, dusty air, high traversal readability for Hanuman.

### Lanka

Kit pieces: fortress walls, dark palace masses, volcanic/ocean terrain, bridges, battlements, demon banners, fire bowls, throne set pieces.

Visual direction: black stone, bronze, red cloth, firelight; harsher silhouettes and a more oppressive atmosphere than Ayodhya.

## Animation Strategy

- Use the CC0 Universal Animation Library clips as the base set for all humanoids.
- Keep gameplay movement code-driven; clips are visual, the controller is truth.
- Keep clip names stable (`idle_loop`, `walk_loop`, `run_loop`, `attack_01`, `bow_aim_loop`, `bow_fire`, `hit_front`, `death_01`).
- Use animation events or timeline markers for attack hit frames, footstep sounds, arrow release, and cinematic cues.
- Accessories attached to bones must follow animation without detaching; verify per character in the dev scene.

## Audio Strategy

Audio is part of the presentation bar, not a polish afterthought.

- Categories: music, ambience, SFX, UI sounds, and (deferred) voice-over. Dialogue is subtitles-only for the first slice.
- Sourcing: CC0 sources (Freesound CC0, Kenney audio, Sonniss GDC packs); record each source in `CREDITS.md`.
- Tech: decide once between `THREE.AudioListener`/`PositionalAudio` and Howler, and document the decision.
- First audio pass ships with the Ayodhya vertical slice: region ambience, footsteps, UI feedback, and one music bed.
- Drive footsteps, attack impacts, and arrow release from the same animation events used for gameplay timing.
- Respect browser autoplay policies: audio starts after first user interaction.

## Asset Manifest And Loading

The manifest now covers only the handful of character GLBs (and later audio files).

```ts
export interface AssetManifestEntry {
  id: string;
  kind: "character" | "animation" | "audio";
  url: string;
  scale: number;
  animationClips?: string[];
  preloadGroup?: "boot" | "ayodhya" | "forest" | "kishkindha" | "lanka";
}
```

Runtime loader requirements:

- Central `AssetManager` with manifest-driven loading, progress reporting, and a cache.
- Three.js `GLTFLoader` only; no KTX2/Draco/Meshopt decoders.
- Missing playable-character model blocks gameplay boot with a clear error; missing optional asset logs a warning and continues.

## Deployment

- Host the game build on a static host (Cloudflare Pages, Vercel, or itch.io HTML5).
- Total asset weight is a few megabytes, so no CDN/object-store split is needed for v1.
- Verify the host serves correct MIME types for `.glb` and `.wasm`.

## World And Story Structure

The game is not one enormous unrestricted map. It is a sequence of restricted open-world hubs unlocked by the Ramayana story.

- Each major kanda or story phase becomes an explorable hub.
- Hubs contain main quests, side quests, NPCs, collectibles, lore, combat encounters, and cinematic story transitions.
- Story progress controls region access, playable character, and available side content.
- Cutscenes remain central and should be in-engine whenever possible.

Primary hubs:

- Ayodhya: palace, court, city streets, royal family, early Rama story, exile setup.
- Forest Exile: wilderness, sages, camp scenes, rakshasa threats, Sita/Rama/Lakshmana story.
- Kishkindha: rocky kingdom, Sugriva and Hanuman alliance, traversal-heavy quests.
- Lanka: infiltration, warfront, palace assault, Ravana finale.

## Playable Characters

- Rama: main hero, balanced movement, sword, bow, dodge, and dharma-based special ability.
- Lakshmana: faster and more aggressive, used for selected combat-focused sections.
- Hanuman: traversal-focused, with leaps, climbing or vertical movement, heavy strikes, and Lanka infiltration gameplay.
- Dasharatha: short prologue or social/story control only, used to establish Ayodhya and the emotional stakes.

## Technical Architecture

Use clean subsystem boundaries from the start.

- `simulation`: story state, quests, combat rules, entities, progression, save data.
- `render`: Three.js renderer, scene graph, camera, lighting, post-processing (including the pixelation pass), palettes, flat-material helpers.
- `physics`: Rapier world, character controller, colliders, triggers, hit detection.
- `cinematics`: timeline camera tracks, subtitles, actor blocking, skip/advance behavior.
- `world`: hub definitions, gates, spawn points, NPC placement, side quests, procedural kits (`world/kits/`).
- `assets`: manifest-driven loading of character GLBs, animation clip mapping, recolor and accessory-attachment helpers.
- `ui`: title screen, HUD, quest tracker, map, journal, pause menu, settings (including pixel size).
- `diagnostics`: debug overlays, performance stats, collision visualization, screenshot hooks.

The simulation owns game truth. Three.js objects are visual adapters, not the source of quest or combat state.

## Key Data Models

- `StoryChapter`: id, kanda, region, playable character, missions, intro cutscene, exit conditions.
- `WorldRegion`: id, spawn points, gates, colliders, NPCs, side quests, palette/lighting preset.
- `PlayableCharacter`: movement profile, camera profile, combat kit, abilities, animation set.
- `Quest`: id, type, giver, objectives, rewards, required story state.
- `CutsceneTimeline`: shots, actors, camera tracks, subtitles, triggers, skip behavior.
- `DialogueTree`: id, speaker, lines, choices, conditions, triggers; quest givers, NPC barks, and cutscene subtitles all reference dialogue entries rather than embedding raw strings.
- `SaveGame`: story progress, region state, character state, quests, settings, checkpoint. Persist to IndexedDB with a versioned schema and an explicit migration policy for older saves.
- `AssetManifestEntry`: asset id, kind, runtime URL, scale, animation clips, preload group.
- `CollisionProxy`: id, shape type, transform, size, physics layer, gameplay tags. Kit modules emit collision proxies alongside render meshes.
- `AnimationClipMap`: canonical gameplay state to clip names.

## Build Milestones

Scope honesty: four hubs, four playable characters, and full cinematics is multi-year scope for a small team. Success for this plan is defined as Milestones 1–6 — the Ayodhya vertical slice plus combat and cinematics. Milestone 7 is re-planned only after the slice ships at quality.

### 1. Clean Technical Reboot — done

- Fresh Vite + TypeScript + Three.js app with title screen, loading screen, renderer, resize handling, and a WebGL2-required error page.
- Minimal scene validating renderer, lighting, asset loading, and post-processing.
- Initial `assets/` and `src/` subsystem structure.

### 2. Visual Style Foundation

- Add the pixelation pass to the existing `EffectComposer`: low-res render target, nearest-neighbor upscale, fine default, player-facing pixel-size setting.
- Add `src/render/palette.ts` with the Ayodhya palette and flat-shaded material helpers.
- Add the gradient sky shader; tune sun, ambient, shadows, and fog against the palette.

Acceptance:

- Boot scene renders through the pixelation pass with no console errors.
- Pixel-size setting visibly changes crunchiness without breaking UI rendering.
- A test arrangement of flat-shaded primitives under the palette reads as a deliberate style.

### 3. Procedural Kits And Look-Dev Courtyard

- Build `src/world/kits/`: nature kit (trees, rocks, shrubs) and first Ayodhya architecture pieces (wall, column, arch, gate) with instancing helpers.
- Build a small Ayodhya look-dev courtyard from the kits.
- Download one Quaternius rigged character plus the animation library, commit the GLBs, load via `AssetManager`, recolor as a Rama stand-in, attach a code-built bow and quiver to bones.
- Add `CREDITS.md`.
- Parallel track: controller, camera, and physics work (Milestone 4) may proceed at the same time.

Acceptance:

- Courtyard screenshot review reads as an intentional warm low-poly diorama (sandstone/gold/saffron), not unstyled primitives.
- The recolored character idles in the courtyard with accessories following the animation.
- `npm run build` and `npx tsc --noEmit` pass.

### 4. Third-Person Rama Slice

- Animated Rama with idle, walk, run, dodge, attack, bow aim, bow fire, hit reaction, death, and interact clips.
- Weapon attachment points for bow, quiver, sword, and arrow spawn.
- GTA-like third-person camera with orbit, chase, shoulder aim, collision avoidance, and mouse/gamepad input mapping.
- Movement, sprint, dodge, interaction prompts, and Rapier collision.
- Minimal HUD: health, objective, interaction prompt, transient notifications.
- Gameplay controller uses collision proxies, not render meshes.

Acceptance:

- Movement and camera feel good enough to explore a hub.
- Weapon props stay attached correctly through locomotion and aim.
- Bow aiming stays readable through the pixelation pass at the default setting.

### 5. Ayodhya Vertical Slice

- Build the explorable Ayodhya district from the architecture kit: palace, streets, gates, NPCs, props, foliage, ambient life.
- Collision proxies for buildings, gates, walls, trees, stairs, ramps, and market stalls (emitted by kit modules).
- Dasharatha prologue cutscene and transition to Rama gameplay.
- One main quest and one side quest.
- Story gates that keep the player inside Ayodhya until the exile story beat; visually motivated, not invisible walls, whenever possible.
- First audio pass: region ambience, footsteps, UI feedback, one music bed.

Acceptance:

- Ayodhya looks like an intentional place with district-scale layout.
- The player can navigate without snagging on kit geometry.

### 6. Combat And Cinematics

- Sword combo, bow aim/fire, dodge timing, enemy hit reactions, and simple lock-on for focused fights.
- One rakshasa enemy type and one human guard or sparring enemy type (recolored bases).
- Data-driven cutscene timelines with camera rails, subtitles, actor placement, skip, and line advance.
- Cutscenes return cleanly to gameplay state; frame shots to flatter the low-poly style (pulled-back, silhouette-driven compositions rather than close-ups).

Acceptance:

- Combat uses animated hero and enemy models.
- Attack hit frames align with animation timing.
- Cutscenes read clearly through the pixelation pass.

### 7. Kanda Expansion

- Add Forest Exile, Kishkindha, and Lanka hubs one at a time: each is a new procedural kit plus palette module.
- Introduce Lakshmana and Hanuman with distinct movement and combat profiles.
- Story-gated travel between hubs; side quests after each hub's main quest path works.

Acceptance:

- Each region has a distinct palette, silhouette language, and kit identity.
- New hubs do not regress visual quality below Ayodhya.

### 8. Polish And Performance

- Tune palettes, lighting, and fog per region; refine weak kit pieces.
- Save slots, pause menu, map, quest journal, settings, audio hooks.
- Optimize draw calls (instancing), shadows, culling, and loading.
- Visual QA passes for clipping, foot sliding, accessory attachment, NPC scale, and draw-call spikes.

Acceptance:

- Desktop browser performance holds 60 FPS.
- Visual quality remains strong after optimization.

## Testing And Acceptance

### Code Tests And CI

The simulation owns game truth, so it is the tested core.

- Unit tests (Vitest) for `simulation`: quest state transitions, story gates, combat rules, progression, and save/load round-trips.
- Unit tests for kit modules where practical: deterministic geometry counts, collision proxy emission.
- CI on every push: typecheck, lint, unit tests.
- Playwright smoke test: the game boots to the title screen with no console errors.
- Renderer, physics feel, and animation quality stay under manual/visual review.

### Asset Tests

- Every committed character GLB loads through `GLTFLoader` and exposes its expected animation clips.
- Recolor and accessory-attachment helpers are unit-testable against a loaded character.
- `CREDITS.md` lists every external source in the repo.

### Runtime Tests

- Boot/title screen renders with no WebGL errors.
- Ayodhya loads; Rama movement, camera, collision, and interaction prompts work.
- Main quest, side quest, cutscene, and story transition work.
- Combat works with animated hero and enemy models.
- Save/load restores chapter, hub, mission, character, quest state, and settings.
- Pixel-size setting persists and applies across sessions.

### Visual Review Tests

- Capture screenshots at: title/menu, Rama idle in Ayodhya, a street, palace courtyard, market, combat encounter, cutscene shot.
- Review for: diorama charm, silhouette readability, palette cohesion, scale consistency, cultural specificity judged against region reference photos, accessory attachment, UI obstruction.

## First Implementation Target

The first implementation should not attempt the full Ramayana. It should deliver:

- the pixelation pass and palette (the visual identity),
- procedural nature and architecture kits,
- an Ayodhya look-dev courtyard,
- one recolored CC0 character with code-built accessories,
- then the third-person Rama slice and the Ayodhya vertical slice on top.

Once Ayodhya works at the target quality, expand to the Forest Exile hub.

## Assumptions

- The game prioritizes an intentional low-poly diorama aesthetic over realism; the pixelation filter is the unifying visual device.
- Procedural code-built geometry is the default visual path; CC0 rigged characters are the only external 3D files in v1.
- Custom or higher-fidelity character art (especially Hanuman and Ravana) is a post-v1 decision.
- Combat scope is unchanged from the original action-adventure vision.
- The project uses CC0 assets only, so license tracking reduces to a courtesy `CREDITS.md`.
