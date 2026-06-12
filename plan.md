# Ramayana Three.js Rebuild Plan

## Summary

Rebuild the project from scratch as a high-quality Three.js third-person action-adventure. The target is a story-gated open world, closer to a scoped Assassin's Creed or GTA-style campaign than a linear prototype: explorable hubs, side quests, cinematic cutscenes, character switching, and strong visual presentation.

The current prototype, docs, lockfiles, local server, and old git history are intentionally discarded. The new repository begins with this plan as the only tracked file.

## Core Direction

- Build the game with Vite, TypeScript, and Three.js.
- Use Rapier for physics, traversal collision, and grounded third-person movement.
- Use GLB/glTF as the runtime asset format.
- Use curated high-quality GLB asset packs from day one for characters, environments, foliage, props, and weapons.
- Treat custom assets as a later upgrade path after the core game direction is proven.
- Make the first production milestone a polished Ayodhya vertical slice.

## Graphics Standard

The game must look good to great from the first playable slice. It should not look like a box-figure prototype.

- No visible box, cylinder, or capsule placeholder characters in playable builds.
- Primitive geometry is allowed only for invisible collision, debug views, temporary blocking, or internal tests.
- Use real character models, real environment kits, real props, and real animation clips.
- Target cinematic stylized realism: mythic, detailed, readable, and browser-practical, not photoreal AAA.
- Use PBR materials, HDR or environment lighting, ACES tone mapping, tuned shadows, atmospheric fog, light bloom, and grounded ambient occlusion when performance allows.
- Use region-specific lighting presets so Ayodhya, forest exile, Kishkindha, and Lanka feel visually distinct.
- Use optimized web assets: GLB/glTF, Meshopt or Draco geometry compression, KTX2 or Basis texture compression where practical, LODs, and instancing for repeated props.
- Keep combat readability higher priority than visual effects density.

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
- `render`: Three.js renderer, scene graph, camera, lighting, post-processing, asset instances.
- `physics`: Rapier world, character controller, colliders, triggers, hit detection.
- `cinematics`: timeline camera tracks, subtitles, actor blocking, skip/advance behavior.
- `world`: hub definitions, gates, spawn points, NPC placement, side quests.
- `assets`: manifest-driven loading, GLB/glTF loaders, animation clips, material setup, optimization conventions.
- `ui`: title screen, HUD, quest tracker, map, journal, pause menu, settings.
- `diagnostics`: debug overlays, performance stats, collision visualization, screenshot hooks.

The simulation owns game truth. Three.js objects are visual adapters, not the source of quest or combat state.

## Key Data Models

- `StoryChapter`: id, kanda, region, playable character, missions, intro cutscene, exit conditions.
- `WorldRegion`: id, spawn points, gates, colliders, NPCs, side quests, lighting preset.
- `PlayableCharacter`: movement profile, camera profile, combat kit, abilities, animation set.
- `Quest`: id, type, giver, objectives, rewards, required story state.
- `CutsceneTimeline`: shots, actors, camera tracks, subtitles, triggers, skip behavior.
- `SaveGame`: story progress, region state, character state, quests, settings, checkpoint.

## Build Milestones

### 1. Clean Technical Reboot

- Create a fresh Vite + TypeScript + Three.js app.
- Add a title screen, loading screen, renderer, resize handling, and WebGL fallback.
- Add a minimal scene only to validate renderer, lighting, and asset loading.

### 2. Visual Foundation First

- Add asset manifest and GLB/glTF loading pipeline.
- Import curated Rama-quality hero model, Ayodhya architecture, foliage, props, and NPC assets.
- Establish material, lighting, tone mapping, post-processing, and optimization rules before gameplay expands.
- Verify that the first screen already communicates the intended quality bar.

### 3. Third-Person Rama Slice

- Add animated Rama model with idle, walk, run, dodge, attack, bow aim, and hit reactions.
- Add GTA-like third-person camera with orbit, chase, shoulder aim, collision avoidance, and mouse/gamepad-ready input mapping.
- Add movement, sprint, dodge, interaction prompts, and Rapier collision.
- Add minimal HUD: health, objective, interaction prompt, and transient notifications.

### 4. Ayodhya Vertical Slice

- Build a polished explorable Ayodhya district with palace, streets, gates, NPCs, props, and ambient life.
- Add a Dasharatha prologue cutscene and transition to Rama gameplay.
- Add one main quest and one side quest.
- Add story gates that keep the player inside the Ayodhya section until the exile story beat.

### 5. Combat And Cinematics

- Add sword combo, bow aim/fire, dodge timing, enemy hit reactions, and simple lock-on for focused fights.
- Add one rakshasa enemy type and one human guard or sparring enemy type.
- Add data-driven cutscene timelines with camera rails, subtitles, actor placement, skip, and line advance.
- Ensure cutscenes can return cleanly to gameplay state.

### 6. Kanda Expansion

- Add Forest Exile, Kishkindha, and Lanka hubs one at a time.
- Introduce Lakshmana and Hanuman with distinct movement and combat profiles.
- Add story-gated travel between hubs.
- Add side quests and region-specific encounters after each hub's main quest path works.

### 7. Polish And Performance

- Replace weak assets, tune shaders and materials, and improve region-specific lighting.
- Add save slots, pause menu, map, quest journal, settings, and audio hooks.
- Optimize draw calls, shadows, texture memory, LODs, culling, and loading.
- Add lower-end graphics presets rather than weakening the high-quality default target.

## Testing And Acceptance

- Boot/title screen renders with no WebGL errors.
- Ayodhya loads with real assets and no visible box/capsule characters.
- Rama movement, camera, collision, and interaction prompts work.
- Main quest, side quest, cutscene, and story transition work.
- Combat works with animated hero and enemy models.
- Save/load restores chapter, hub, mission, character, quest state, and settings.
- Performance remains acceptable with shadows and post-processing enabled on a desktop browser.
- Graphics fallback preset can disable expensive effects without breaking gameplay.

## First Implementation Target

The first implementation should not attempt the full Ramayana. It should deliver a polished Ayodhya vertical slice that proves:

- the graphics bar,
- third-person movement,
- open-hub exploration,
- quest structure,
- in-engine cutscenes,
- and the Rama gameplay feel.

Once Ayodhya works at the target quality, expand to the Forest Exile hub.

## Assumptions

- "tree.js" means Three.js.
- The game should prioritize great browser-quality stylized 3D graphics over placeholder-speed prototyping.
- Curated GLB asset packs are the default visual path for the first playable version.
- Custom hero and environment art can come later.
- The current prototype is fully disposable except for the concept that cutscenes are important.
