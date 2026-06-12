# Ramayana Three.js Rebuild Plan

## Summary

Rebuild the project from scratch as a high-quality Three.js third-person action-adventure. The target is a story-gated open world, closer to a scoped Assassin's Creed or GTA-style campaign than a linear prototype: explorable hubs, side quests, cinematic cutscenes, character switching, and strong visual presentation.

The previous prototype, docs, lockfiles, local server, and old git history were intentionally discarded. This fresh repository begins with this plan as the only project file.

The guiding production rule is simple: the first playable version must already look like a real 3D game, not a programmer-art prototype. The game may start small, but it should not start ugly.

## Core Direction

- Build the game with Vite, TypeScript, and Three.js.
- Use `WebGLRenderer` for v1. Treat `WebGPURenderer`/TSL as a possible future migration, not a v1 target.
- Pin Three.js and Rapier versions in `package.json` and upgrade deliberately, not automatically.
- Use Rapier for physics, traversal collision, grounded third-person movement, triggers, and combat hit volumes.
- Use `@dimforge/rapier3d-compat` (WASM inlined) to avoid bundler WASM-loading friction.
- Use one post-processing path from the start (Three's `EffectComposer` or pmndrs/postprocessing) since bloom, AO, and ACES tone mapping are required by the graphics standard. Decide once and document it.
- Target desktop-first input: keyboard/mouse and gamepad. Mobile/touch is explicitly out of scope for v1; camera, UI, and performance decisions assume desktop browsers.
- Use GLB/glTF as the runtime asset format.
- Use curated high-quality online GLB/glTF asset packs from day one for environments, props, foliage, weapons, animals, NPCs, and baseline humanoids.
- Use Blender to customize, kitbash, clean, rig, retarget, export, and validate assets before they enter the game.
- Create fully custom assets only where they matter most: Rama, Sita, Lakshmana, Hanuman, Ravana, divine weapons, palace hero props, and iconic cinematic objects.
- Make the first production milestone a polished Ayodhya vertical slice with a real character, real environment assets, real lighting, and real animation.

## Graphics Standard

The game must look good to great from the first playable slice. It should not look like a box-figure prototype.

- No visible box, cylinder, capsule, or mannequin placeholder characters in playable builds.
- Primitive geometry is allowed only for invisible collision, debug views, temporary graybox blocking, or internal physics tests.
- Any graybox geometry must be hidden behind a development/debug flag and must never appear in the default playable experience.
- Use real character models, real environment kits, real props, and real animation clips.
- Target cinematic stylized realism: mythic, detailed, readable, and browser-practical, not photoreal AAA.
- Prefer strong silhouettes, warm materials, readable combat effects, and culturally specific art direction over generic fantasy clutter.
- Use PBR materials, HDR/environment lighting, ACES tone mapping, tuned shadows, atmospheric fog, light bloom, and grounded ambient occlusion when performance allows.
- Use region-specific lighting presets so Ayodhya, Forest Exile, Kishkindha, and Lanka feel visually distinct.
- Use optimized web assets: GLB/glTF, Meshopt or Draco geometry compression, KTX2 or Basis texture compression where practical, LODs, batching, culling, and instancing for repeated props.
- Keep combat readability higher priority than visual effects density.
- Every playable milestone needs a screenshot review at desktop and laptop resolutions before it is accepted.

### Performance And Payload Budgets

"Acceptable performance" is not measurable. Use these concrete targets and revise them deliberately if they prove wrong:

- Frame rate: 60 FPS on a mid-tier laptop (M1 MacBook Air / GTX 1650 class) at 1080p with the high-quality preset.
- Initial payload: under 25–50 MB downloaded before the title screen is interactive.
- Region preload budget: under ~150 MB per hub preload group.
- Loading time: Ayodhya hub playable in under 10 seconds on a 50 Mbps connection.
- Scene budgets: roughly under 500 draw calls and under 1.5M visible triangles per frame; treat overruns as optimization tasks, not acceptable drift.

## Asset Strategy

Use a hybrid asset strategy.

Before sourcing assets for any region, build a cultural reference board for it (Ayodhya, Forest Exile, Kishkindha, Lanka): architectural references, costume and ornament references, color palettes, and named sources. Asset selection, recoloring, and the screenshot review's "cultural specificity" check are all judged against the region's reference board, not against memory or generic fantasy taste.

1. **Curated online assets first**
   - Use existing online GLB/glTF, FBX, or Blender asset packs to reach a high visual bar quickly.
   - Prefer assets that already include PBR materials, clean topology, reasonable texture sizes, animation clips, and documented license terms.
   - Convert non-GLB assets to GLB through Blender and optimize them before runtime use.

2. **Custom hero assets second**
   - Rama, Lakshmana, Sita, Hanuman, Dasharatha, and Ravana should not remain generic marketplace characters.
   - Start from a high-quality base humanoid or creature mesh, then customize silhouette, clothing, ornaments, colors, weapons, and animation set.
   - Over time, replace kitbashed heroes with purpose-built custom models.

3. **Full custom creation only for signature content**
   - Create from scratch only when online assets are unavailable, culturally wrong, legally risky, or too generic.
   - Priority custom assets: Rama's bow, divine arrows, Hanuman's final hero model, Ravana's ten-headed silhouette, Ayodhya throne room hero props, Lanka palace set pieces, and major cutscene artifacts.

This approach avoids spending months making basic crates, trees, stones, and buildings from scratch while still making the important Ramayana visuals feel original.

## Online Asset Sources

Use source libraries deliberately. Do not download random assets and hope they fit.

### Primary Sources

- **Fab**
  - Best for higher-quality paid and free game-ready environment kits, characters, animations, props, and VFX.
  - Use for premium-looking city kits, palace interiors, modular architecture, foliage, character bases, weapons, and cinematic props.
  - Hard rule: verify the license is engine-agnostic before purchase or download. Many Fab assets — notably Quixel Megascans free content — are licensed for Unreal Engine use only and are excluded from this project.
  - Prefer assets that include source formats or GLB/FBX exports.
  - Track whether each asset is under the Fab Standard License, CC-BY, or another license.
  - Avoid assets that cannot legally be redistributed as part of a web game build.

- **Sketchfab**
  - Useful for downloadable cultural, architectural, character, creature, and prop models.
  - Use only downloadable assets with clear license terms.
  - Avoid Editorial-only assets for the game.
  - Prefer Creative Commons assets only when attribution requirements are acceptable and documented.
  - Avoid direct copies of identifiable protected designs, living people, trademarks, or museum artifacts with unclear rights.

- **Poly Haven**
  - Best for CC0 HDRIs, textures, environment lighting, and some models.
  - Use for sky lighting, natural materials, stone, wood, sand, clay, metals, fabric references, and PBR texture sets.
  - Strong default source for HDR environment maps used in look development.

- **Quaternius**
  - Good for CC0 stylized game assets, modular packs, nature props, fantasy props, buildings, animation libraries, and humanoid bases.
  - Useful for early high-quality stylized production if the art direction leans slightly stylized rather than realistic.
  - May need visual upgrading or material work to match the desired mythic-cinematic look.

- **Kenney**
  - Good for CC0 fallback props, simple environment pieces, icons, and early gameplay objects.
  - Use carefully because many assets are simpler than the target visual bar.
  - Avoid relying on Kenney-style assets for hero-facing visuals unless they are heavily reworked.

### Secondary Sources

- **Mixamo**
  - Use mainly for humanoid rigging and animation prototyping.
  - Good for locomotion, idle, attack, dodge, hit, death, and traversal animation coverage.
  - Export animations, retarget in Blender when needed, and convert final animated characters to GLB.
  - Requires an Adobe account; terms permit use in games but not redistribution of raw animation files. Record Mixamo clips in the provenance metadata like any other external asset.
  - Do not rely on Mixamo visual character defaults for final hero quality.

- **CGTrader, TurboSquid, ArtStation, and similar marketplaces**
  - Use only when license terms are compatible with a web game.
  - Prefer game-ready, low/mid-poly, PBR, rigged, animated assets.
  - Avoid assets made for offline rendering only: huge polygon counts, 8K textures everywhere, hair systems, cloth sims, procedural Blender-only materials, and unoptimized scene files.

## License And Provenance Rules

Every asset must have provenance metadata before entering the game repository.

For each external asset, record:

- asset name
- source URL
- author/publisher
- license type
- purchase date or download date
- allowed use
- attribution requirement
- modification permission
- redistribution restrictions
- original file format
- imported runtime format
- local asset id
- notes about cultural/art-direction changes

Recommended metadata file:

```json
{
  "id": "ayodhya_palace_column_set_01",
  "displayName": "Ayodhya Palace Column Set 01",
  "source": {
    "name": "Example Marketplace Pack",
    "url": "https://example.com/asset",
    "author": "Example Artist",
    "license": "Fab Standard License",
    "downloadedAt": "2026-06-12"
  },
  "usage": {
    "commercialUseAllowed": true,
    "modificationAllowed": true,
    "attributionRequired": false,
    "standaloneRedistributionAllowed": false
  },
  "pipeline": {
    "sourceFormat": "fbx",
    "workingFile": "assets/source/ayodhya/palace_column_set_01.blend",
    "runtimeFile": "assets/runtime/environment/ayodhya/palace_column_set_01.glb",
    "optimizedFile": "assets/runtime/environment/ayodhya/palace_column_set_01.opt.glb"
  },
  "notes": "Recolored sandstone material, normalized scale, added collision proxy."
}
```

Hard license rules:

- Do not use Editorial-only assets.
- Do not use assets with unclear commercial rights.
- Do not use assets that forbid modification if the game needs cultural adaptation.
- Do not include marketplace source files in public releases if the license forbids redistributing source assets.
- Do not expose raw purchased assets as easy standalone downloads if the license forbids redistribution.
- Prefer CC0 for generic props, textures, HDRIs, foliage, rocks, and architecture pieces when quality is sufficient.
- Use paid standard licenses for higher-quality hero-facing assets when needed.
- Generate `assets/catalog/licenses/attribution.md` from `third-party-assets.json`, and surface it as an in-game credits screen so CC-BY attribution requirements are met in the shipped game, not just in the repo.

## Asset Directory Layout

Use separate source, working, runtime, and metadata folders.

```text
assets/
  catalog/
    assets.manifest.json
    licenses/
      third-party-assets.json
      attribution.md
  source/
    characters/
    environment/
    props/
    weapons/
    animation/
    textures/
    hdri/
  working/
    blender/
      characters/
      environment/
      props/
      weapons/
  runtime/
    characters/
      rama/
      lakshmana/
      hanuman/
      ravana/
      npcs/
    environment/
      ayodhya/
      forest/
      kishkindha/
      lanka/
    props/
    weapons/
    animation/
    textures/
    hdri/
  collision/
    ayodhya/
    forest/
    kishkindha/
    lanka/
```

Repository policy:

- Runtime `.glb`, `.ktx2`, and small metadata files can live in the repo when sizes are reasonable.
- Large source assets live in external storage (object storage or a documented download location). Use Git LFS only for medium-sized files — GitHub LFS free-tier bandwidth quotas are easy to exhaust with multi-GB asset packs.
- Never commit raw purchased asset packs if the license forbids sharing source files.
- Keep `assets/catalog/third-party-assets.json` as the single audit source for all external content.

## Deployment And Asset Hosting

Decide hosting before assets grow large.

- Host the game build on a static host (Cloudflare Pages, Vercel, or itch.io HTML5).
- Serve runtime assets from a CDN-backed object store (e.g., Cloudflare R2) once total runtime asset size exceeds what the static host serves comfortably; the asset manifest's `url` field already abstracts the origin.
- Keep source/working assets out of the deploy path entirely.
- Verify the host serves correct MIME types and compression for `.glb`, `.ktx2`, and `.wasm` files.
- Measure the initial payload and per-hub preload budgets against the deployed origin, not just the local dev server.

## GLB Production Pipeline

Every shipped 3D asset follows the same pipeline.

### 1. Source

- Pick the asset from an approved source.
- Confirm license compatibility.
- Download the best available format in this order:
  - GLB/glTF if already clean and game-ready.
  - FBX if rigged or animated.
  - Blender `.blend` if materials and source hierarchy are useful.
  - OBJ only for static props with simple materials.
- Save the untouched original into `assets/source/...` if license permits.
- Create or update provenance metadata.

### 2. Import To Blender

- Import the source file.
- Set unit scale to meters.
- Normalize world orientation:
  - Y-up or Z-up issues must be corrected.
  - Character forward direction must be consistent across all playable characters.
  - Use one game convention and document it in the asset manifest.
- Apply transforms when appropriate:
  - scale = 1
  - rotation = 0
  - origin/pivot placed intentionally
- Remove unused cameras, lights, hidden junk nodes, duplicate meshes, test objects, and vendor demo scenes.

### 3. Clean Geometry

- Remove non-game geometry such as render-only subdivision stacks, construction curves, hidden duplicates, and excessive bevels.
- Reduce polygon count if needed.
- Preserve silhouette quality for hero-facing assets.
- Create LODs for large environment pieces and repeated props:
  - LOD0: close camera
  - LOD1: medium distance
  - LOD2: far distance or impostor
- Use instancing for repeated architecture, columns, trees, rocks, lamps, and market props.
- Avoid large single-scene GLBs that contain an entire city unless specifically used as a streamed district chunk.

### 4. Clean Materials

- Convert materials to PBR metal/roughness where possible.
- Remove unsupported procedural shader nodes.
- Bake procedural materials to textures if they must ship.
- Use consistent material naming:
  - `mat_sandstone_warm_01`
  - `mat_gold_ornament_01`
  - `mat_cloth_saffron_01`
  - `mat_skin_hero_01`
- Limit unique materials per asset.
- Reuse shared materials across modular kits.
- Prefer texture atlases for repeated small props.

### 5. Texture Budget

Default texture budgets:

- Hero character: 2K body, 2K clothing/armor, 1K accessories unless close-up cutscenes demand more.
- Major boss: 2K to 4K only where justified by close camera shots.
- NPC: 1K to 2K.
- Small props: 512 to 1K.
- Large architecture modules: 1K to 2K tiling textures.
- Foliage: 1K to 2K atlases.
- UI icons and flat art: separate UI pipeline, not embedded in GLB.

Texture rules:

- Use base color, normal, roughness, metalness, ambient occlusion, and emissive only when needed.
- Do not ship 4K textures on minor props.
- Do not ship uncompressed PNGs everywhere.
- Use KTX2/Basis for GPU-friendly runtime textures when the loader path supports it.
- Keep texture color space correct:
  - base color and emissive are sRGB
  - normal, roughness, metalness, and AO are linear/non-color data

### 6. Rigging And Animation

For characters:

- Use a consistent humanoid skeleton convention where possible.
- Keep bone names stable after retargeting.
- Ensure root motion policy is explicit:
  - gameplay locomotion should usually be code-driven
  - attack/dodge/cutscene animations may use authored movement if the controller supports it
- Required Rama first-slice animations:
  - idle
  - walk
  - run
  - sprint
  - dodge
  - sword attack 1
  - sword attack 2
  - bow aim
  - bow fire
  - hit reaction
  - death
  - interact
  - cutscene idle
- Required enemy first-slice animations:
  - idle
  - walk/run
  - attack
  - hit reaction
  - death
- Export animation clips with clear names:
  - `idle_loop`
  - `walk_loop`
  - `run_loop`
  - `dodge_forward`
  - `attack_sword_01`
  - `attack_sword_02`
  - `bow_aim_loop`
  - `bow_fire`
  - `hit_front`
  - `death_01`

### 7. Collision Proxies

Do not use detailed render meshes for physics.

- Create simple collision proxies in Blender or generate them during import.
- Use naming convention:
  - `COL_box_palace_wall_01`
  - `COL_convex_stair_01`
  - `TRG_quest_palace_gate_01`
  - `NAV_blocker_market_stall_01`
- Collision should be separate from render meshes.
- Buildings use box or convex colliders.
- Stairs and ramps need gameplay-tested slope behavior.
- Trees use trunk colliders, not full branch meshes.
- Props that do not affect gameplay should have no physics body.

### 8. Export GLB

Export from Blender as GLB/glTF 2.0.

Export rules:

- Apply transforms.
- Include selected objects only.
- Include animation clips only when needed.
- Do not export Blender cameras/lights unless the asset is a cinematic set that intentionally includes authored cameras.
- Keep node names stable.
- Use consistent units and orientation.
- Ensure skinned meshes export with skeleton and animation clips intact.

### 9. Optimize

Use glTF Transform after export.

Typical commands:

```bash
gltf-transform inspect input.glb
gltf-transform validate input.glb
gltf-transform optimize input.glb output.opt.glb --compress meshopt --texture-compress ktx2
```

Use Meshopt as the default geometry/animation compression path unless a specific asset proves Draco is better.

Texture compression policy: KTX2 is the default runtime texture path (UASTC for normal maps, ETC1S for color/AO/roughness), matching the KTX2 strategy in the texture budget and runtime loading sections. Use WebP only as an explicit fallback for builds that do not include `KTX2Loader` — WebP is not GPU-compressed and saves download size but not GPU memory.

Use `inspect` to catch:

- too many draw calls
- huge textures
- unneeded animation clips
- excessive nodes
- duplicate materials
- missing tangents
- geometry-heavy props
- invalid glTF data

### 10. Runtime Validation

Every asset must pass a runtime preview before it is accepted.

Preview checklist:

- loads with Three.js `GLTFLoader`
- appears at correct scale
- faces correct forward direction
- has correct pivot/origin
- casts and receives shadows as expected
- material color and roughness look correct under the game lighting preset
- animation clips play without skeleton distortion
- collision proxy aligns with visible geometry
- no obvious texture compression artifacts
- no console errors
- acceptable memory and load time

## Character Asset Plan

### Rama

Rama is the most important first-slice asset.

Minimum standard:

- Real humanoid model, not a blockout.
- Distinct silhouette: heroic posture, dhoti or warrior clothing, sash, ornaments, quiver, bow, sword.
- Warm skin material, cloth materials, gold/metal ornament materials.
- Animation-ready skeleton.
- Third-person readable shape from behind.
- Bow and sword attachment points.
- Hands and weapon positions that work in gameplay camera.

Production path:

1. Find a high-quality stylized or semi-realistic male hero base model.
2. Customize clothing and colors in Blender.
3. Add bow, quiver, sword, ornaments, and hair treatment.
4. Retarget locomotion/combat animations.
5. Export `rama_player_v001.glb`.
6. Test movement and bow aim in the Three.js preview scene.

### Lakshmana

Use Rama's pipeline but make him visually distinct.

- Leaner/faster silhouette.
- Different sash/clothing palette.
- Distinct weapon posture.
- Reuse Rama-compatible skeleton when possible.
- Share some locomotion animations, but give faster attack timing.

### Sita

Sita is primarily cinematic/NPC in early milestones.

- Needs high visual quality for cutscenes.
- Requires idle, walk, seated/standing conversation, and emotional cutscene poses.
- Combat animations are not required for the first slice.
- Use careful clothing and jewelry customization.

### Hanuman

Hanuman likely needs the most custom work.

- Marketplace monkey/creature bases may not fit the Ramayana hero silhouette.
- Start with a stylized creature/humanoid base only if it can be heavily customized.
- Important visual requirements:
  - powerful upper-body silhouette
  - expressive face
  - tail
  - mace/gada support
  - leap/landing animations
  - readable heroic form at third-person distance
- Expect custom modeling or significant kitbashing.

### Ravana

Ravana should not be attempted casually in the first Ayodhya slice.

- Needs strong boss silhouette.
- Ten-headed representation must be visually readable and performant.
- Likely requires custom modeling or a special rig setup.
- Can appear first through cinematic framing, shadow, statue, mural, or distant vision before full boss implementation.

### Dasharatha

Dasharatha can be made from a high-quality older royal NPC base.

- Needs court/prologue presence.
- Required animations: idle, walk, sit, talk gesture, emotional reaction.
- Does not need full combat system.

## Environment Asset Plan

### Ayodhya

Ayodhya must prove the graphics bar.

Required asset categories:

- palace exterior
- palace interior or throne hall
- modular sandstone walls
- columns
- arches
- stairs
- balconies
- city gates
- streets and courtyards
- market stalls
- banners and cloth hangings
- lamps, braziers, torches
- trees, planters, flowers
- carts, crates, jars, vessels
- benches, rugs, cushions
- background skyline modules

Visual direction:

- warm sandstone
- gold accents
- saffron, red, teal, and cream fabric accents
- clean palace geometry
- strong sunlit courtyards
- soft atmospheric haze
- high readability for third-person navigation

Asset approach:

- Use modular architecture kits from Fab, Sketchfab, or similar sources.
- Recolor and re-material them into an Ayodhya-specific palette.
- Avoid generic European medieval castle assets unless heavily adapted.
- Use Poly Haven HDRIs/textures for material grounding.
- Use custom hero props for throne, royal banners, and story-significant items.

### Forest Exile

Required asset categories:

- dense trees
- shrubs and undergrowth
- rocks and cliffs
- hermitage/camp structures
- simple huts
- river or pond elements
- sage props
- campfire
- path markers
- demon encounter arenas

Visual direction:

- greener, cooler, quieter than Ayodhya
- shafts of light
- mist and depth
- warm camp areas against darker forest

### Kishkindha

Required asset categories:

- rock formations
- cave entrances
- cliff paths
- ruined structures
- vanara settlement pieces
- traversal landmarks
- elevated platforms
- banners and alliance symbols

Visual direction:

- verticality
- golden rock, dusty air
- high traversal readability for Hanuman

### Lanka

Required asset categories:

- fortress walls
- dark palace architecture
- volcanic or ocean-adjacent terrain
- bridges
- battlements
- demon banners
- torches and fire bowls
- throne room set pieces
- warfront props

Visual direction:

- dramatic contrast
- black stone, bronze, red cloth, firelight
- stronger shadows and harsher silhouettes
- more oppressive atmosphere than Ayodhya

## Prop And Weapon Asset Plan

### Rama Weapons

- Bow must be a signature asset, not a generic bow.
- Quiver must attach cleanly to Rama's back.
- Arrows need simple but readable projectile models.
- Sword should be visible during melee and sheathed when not active.

### Hanuman Weapon

- Gada/mace should be custom or heavily customized.
- Needs collision/hit proxy separate from render mesh.
- Needs VFX attachment points for heavy attacks.

### Divine And Story Props

Create or heavily customize:

- royal throne
- exile garments or transition props
- Sita abduction cinematic props
- bridge-building symbols
- Ravana throne and banners
- final return/Diwali lamps

## Animation Strategy

Use online animation sources to start, then refine.

Animation priorities:

1. Rama locomotion and combat.
2. Rama bow aim and fire.
3. NPC idle/talk loops.
4. Enemy locomotion, attack, hit, death.
5. Cutscene gestures.
6. Hanuman traversal animations.
7. Boss-specific animations.

Rules:

- Use one skeleton convention for reusable humanoid animations where possible.
- Retarget animations in Blender before exporting.
- Keep animation clip names stable.
- Keep gameplay movement mostly code-driven for controller reliability.
- Use animation events or timeline markers for attack hit frames, footstep sounds, arrow release, and cinematic cues.

## Audio Strategy

Audio is part of the cinematic bar, not a polish afterthought.

- Categories: music, ambience, SFX, UI sounds, and (deferred) voice-over. Dialogue is subtitles-only for the first slice; VO is a later decision.
- Sourcing: same provenance and licensing rules as 3D assets. Prefer CC0 sources (Freesound CC0, Kenney audio, Sonniss GDC packs) and record every clip in `third-party-assets.json`.
- Tech: decide once between `THREE.AudioListener`/`PositionalAudio` and Howler, and document the decision. Positional audio matters for ambience and combat readability.
- First audio pass ships with the Ayodhya vertical slice, not the polish milestone: region ambience, footsteps, UI feedback, and one music bed.
- Drive footsteps, attack impacts, and arrow release from the same animation events used for gameplay timing.
- Respect browser autoplay policies: audio starts after first user interaction (the title screen handles this naturally).

## Asset Manifest Design

The runtime should never load assets by random filenames scattered through code.

Use a manifest like:

```ts
export type AssetKind =
  | "character"
  | "environment"
  | "prop"
  | "weapon"
  | "animation"
  | "texture"
  | "hdri";

export interface AssetManifestEntry {
  id: string;
  kind: AssetKind;
  region?: "ayodhya" | "forest" | "kishkindha" | "lanka";
  url: string;
  licenseId: string;
  scale: number;
  castShadow: boolean;
  receiveShadow: boolean;
  collider?: string;
  lods?: string[];
  animationClips?: string[];
  preloadGroup?: "boot" | "ayodhya" | "forest" | "kishkindha" | "lanka" | "cinematic";
}
```

Example:

```ts
export const ASSETS: AssetManifestEntry[] = [
  {
    id: "character.rama.player.v001",
    kind: "character",
    url: "/assets/runtime/characters/rama/rama_player_v001.opt.glb",
    licenseId: "custom-kitbash-rama-v001",
    scale: 1,
    castShadow: true,
    receiveShadow: true,
    animationClips: [
      "idle_loop",
      "walk_loop",
      "run_loop",
      "dodge_forward",
      "attack_sword_01",
      "bow_aim_loop",
      "bow_fire"
    ],
    preloadGroup: "boot"
  },
  {
    id: "environment.ayodhya.palace.columns.v001",
    kind: "environment",
    region: "ayodhya",
    url: "/assets/runtime/environment/ayodhya/palace_columns_v001.opt.glb",
    licenseId: "fab-palace-kit-001",
    scale: 1,
    castShadow: true,
    receiveShadow: true,
    collider: "/assets/collision/ayodhya/palace_columns_v001.colliders.json",
    preloadGroup: "ayodhya"
  }
];
```

## Runtime Loading Requirements

Use Three.js `GLTFLoader` for GLB/glTF assets.

Runtime loader requirements:

- Central `AssetManager`.
- Manifest-driven loading.
- Progress reporting for loading screens.
- Separate preload groups by story region.
- Asset cache to avoid duplicate loads.
- Optional `KTX2Loader` for compressed textures.
- Optional Meshopt decoder support for optimized GLBs.
- Optional DRACO decoder only if assets are exported with Draco compression.
- Clear error surface when a required asset fails to load.
- Fallback only for non-critical props, never for main playable character.

Failure policy:

- Missing Rama model blocks gameplay boot and shows a clear error.
- Missing optional market prop logs a warning and continues.
- Missing license metadata fails development validation.
- Invalid GLB fails asset validation before runtime.

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
- `DialogueTree`: id, speaker, lines, choices, conditions, triggers; quest givers, NPC barks, and cutscene subtitles all reference dialogue entries rather than embedding raw strings.
- `SaveGame`: story progress, region state, character state, quests, settings, checkpoint. Persist to IndexedDB (localStorage is too small for world state) with a versioned schema and an explicit migration policy for older saves.
- `AssetManifestEntry`: asset id, kind, region, runtime URL, license id, scale, shadow flags, collider path, LOD paths, animation clips, preload group.
- `AssetLicenseEntry`: source URL, author, license, attribution, redistribution restriction, modification permission, commercial-use permission.
- `CollisionProxy`: id, shape type, transform, size, physics layer, gameplay tags.
- `AnimationClipMap`: canonical gameplay state to asset-specific animation clip names.

## Build Milestones

Scope honesty: four hubs, four playable characters, and full cinematics is multi-year scope for a small team. Success for this plan is defined as Milestones 1–6 — the Ayodhya vertical slice plus combat and cinematics. Milestone 7 (Kanda Expansion) is re-planned only after the slice ships at quality; nothing in this document is a commitment to the full campaign on any timeline.

### 1. Clean Technical Reboot

- Create a fresh Vite + TypeScript + Three.js app.
- Add a title screen, loading screen, renderer, resize handling, and a WebGL fallback — meaning a readable "WebGL2 required" error page for unsupported browsers, not a degraded renderer mode.
- Add a minimal scene only to validate renderer, lighting, asset loading, and post-processing.
- Add the initial `assets/` directory structure and metadata conventions before importing real content.

### 2. Asset Pipeline Foundation

- Add `AssetManager`, `GLTFLoader`, optional `KTX2Loader`, optional Meshopt decoder, and optional DRACO decoder.
- Add `assets/catalog/assets.manifest.ts` or JSON equivalent.
- Add `assets/catalog/licenses/third-party-assets.json`.
- Add an asset preview route or dev scene.
- Add development validation that checks every manifest asset has license metadata.
- Add a documented Blender export preset.
- Add glTF Transform scripts for inspect, validate, and optimize.

Acceptance:

- A sample GLB loads through the manifest.
- A missing required asset shows a readable error.
- License metadata is present for the sample asset.
- Optimized GLB is used by runtime, not the raw source file.

### 3. Visual Foundation First

- Select curated online assets for Rama base, Ayodhya architecture, foliage, props, NPCs, and HDRI/material references.
- Import assets into Blender and normalize scale, orientation, pivots, materials, and naming.
- Export and optimize first runtime GLBs.
- Establish material, lighting, tone mapping, shadow, fog, bloom, and ambient occlusion rules before gameplay expands.
- Build a small Ayodhya look-development courtyard using real assets.
- Verify that the first screen already communicates the intended quality bar.
- Parallel track: controller, camera, and physics work (Milestone 4) may proceed at the same time on graybox geometry behind the existing debug flag. The no-placeholder rule applies to playable builds, not development branches — asset sourcing must not stall engine validation.

Acceptance:

- No visible primitive placeholders in the default preview.
- Rama or Rama-base model is visible as a real animated character.
- Ayodhya courtyard has real architecture, props, lighting, and shadows.
- Screenshot review confirms the game is not reading as programmer art.

### 4. Third-Person Rama Slice

- Add animated Rama model with idle, walk, run, dodge, attack, bow aim, bow fire, hit reaction, death, and interact clips.
- Add weapon attachment points for bow, quiver, sword, and arrow spawn.
- Add GTA-like third-person camera with orbit, chase, shoulder aim, collision avoidance, and mouse/gamepad-ready input mapping.
- Add movement, sprint, dodge, interaction prompts, and Rapier collision.
- Add minimal HUD: health, objective, interaction prompt, and transient notifications.
- Ensure gameplay controller uses collision proxies, not render meshes.

Acceptance:

- Rama is always represented by a real skinned model in playable mode.
- Movement and camera feel good enough to explore a hub.
- Weapon props stay attached correctly through locomotion and aim.

### 5. Ayodhya Vertical Slice

- Build a polished explorable Ayodhya district with palace, streets, gates, NPCs, props, foliage, and ambient life.
- Use modular city/palace assets adapted into a consistent Ayodhya visual palette.
- Add collision proxies for buildings, gates, walls, trees, stairs, ramps, and market stalls.
- Add a Dasharatha prologue cutscene and transition to Rama gameplay.
- Add one main quest and one side quest.
- Add story gates that keep the player inside the Ayodhya section until the exile story beat.
- Add the first audio pass: region ambience, footsteps, UI feedback, and one music bed.
- Add streaming or preload boundaries if the district becomes too heavy for one load.

Acceptance:

- Ayodhya looks like an intentional place, not a random kitbash.
- The player can navigate without snagging on asset geometry.
- Story gates are visually motivated, not invisible walls whenever possible.

### 6. Combat And Cinematics

- Add sword combo, bow aim/fire, dodge timing, enemy hit reactions, and simple lock-on for focused fights.
- Add one rakshasa enemy type and one human guard or sparring enemy type.
- Add data-driven cutscene timelines with camera rails, subtitles, actor placement, skip, and line advance.
- Ensure cutscenes can return cleanly to gameplay state.
- Add asset requirements for cutscene close-ups: higher-quality faces, hands, ornaments, and hero props where camera distance demands them.

Acceptance:

- Combat uses animated hero and enemy models.
- Attack hit frames align with animation timing.
- Cutscenes do not expose unfinished model backsides, missing facial detail, or poor clipping.

### 7. Kanda Expansion

- Add Forest Exile, Kishkindha, and Lanka hubs one at a time.
- Introduce Lakshmana and Hanuman with distinct movement and combat profiles.
- Add story-gated travel between hubs.
- Add side quests and region-specific encounters after each hub's main quest path works.
- For each hub, repeat the asset process: source, license, Blender cleanup, GLB export, glTF Transform optimization, runtime validation, screenshot review.

Acceptance:

- Each region has a distinct material, lighting, silhouette, and asset palette.
- New hubs do not regress asset quality below Ayodhya.

### 8. Polish And Performance

- Replace weak assets, tune shaders and materials, and improve region-specific lighting.
- Add save slots, pause menu, map, quest journal, settings, and audio hooks.
- Optimize draw calls, shadows, texture memory, LODs, culling, asset preloading, and loading screens.
- Add lower-end graphics presets rather than weakening the high-quality default target.
- Add visual QA passes for clipping, animation foot sliding, weapon attachment, NPC scale, shadow acne, texture blur, texture overuse, draw-call spikes, and loading hitches.

Acceptance:

- Desktop browser performance remains acceptable with the high-quality preset.
- Lower graphics preset keeps gameplay intact.
- Visual quality remains strong after optimization.

## Testing And Acceptance

### Code Tests And CI

The simulation owns game truth, so it is the tested core.

- Unit tests (Vitest) for `simulation`: quest state transitions, story gates, combat rules, progression, and save/load round-trips.
- CI on every push: typecheck, lint, unit tests, and the asset manifest/license validation script.
- Playwright smoke test: the game boots to the title screen with no console errors.
- Renderer, physics feel, and animation quality stay under manual/visual review; do not attempt to unit test them.

### Asset Tests

- Every manifest asset has license metadata.
- Every runtime GLB validates with glTF validation tooling.
- Every optimized GLB loads through Three.js `GLTFLoader`.
- Every character asset has required animation clips or an explicit documented exception.
- Every physics-relevant environment asset has collision proxy data.
- No playable build contains visible primitive placeholder characters.

### Runtime Tests

- Boot/title screen renders with no WebGL errors.
- Ayodhya loads with real assets and no visible box/capsule characters.
- Rama movement, camera, collision, and interaction prompts work.
- Main quest, side quest, cutscene, and story transition work.
- Combat works with animated hero and enemy models.
- Save/load restores chapter, hub, mission, character, quest state, and settings.
- Performance remains acceptable with shadows and post-processing enabled on a desktop browser.
- Graphics fallback preset can disable expensive effects without breaking gameplay.

### Visual Review Tests

- Capture screenshots at:
  - title/menu
  - Rama idle in Ayodhya
  - Rama walking through a street
  - palace courtyard
  - market or side quest area
  - combat encounter
  - cutscene close-up
- Review for:
  - asset quality
  - silhouette readability
  - lighting quality
  - scale consistency
  - cultural specificity, judged against the region's reference board
  - visible placeholders
  - material mismatch
  - animation issues
  - UI obstruction

## First Implementation Target

The first implementation should not attempt the full Ramayana. It should deliver a polished Ayodhya vertical slice that proves:

- the graphics bar,
- third-person movement,
- real GLB asset loading,
- asset licensing/provenance workflow,
- Blender cleanup/export workflow,
- optimized runtime GLB pipeline,
- open-hub exploration,
- quest structure,
- in-engine cutscenes,
- and the Rama gameplay feel.

Once Ayodhya works at the target quality, expand to the Forest Exile hub.

## Initial Asset Shopping List

Before coding deep gameplay systems, source enough assets to make the Ayodhya vertical slice visually credible.

Minimum first-slice asset list:

- Rama hero base model
- Rama bow
- Rama quiver
- Rama sword
- Dasharatha royal NPC base
- Sita NPC base
- 2 to 4 Ayodhya civilian NPC bases
- palace exterior kit
- palace interior or throne-room kit
- modular sandstone wall/arch/column kit
- city gate
- street/courtyard floor pieces
- market stall kit
- clay pots, baskets, rugs, lamps, banners, carts
- trees and flowering plants
- warm daylight HDRI or environment map
- sandstone, cloth, gold, wood, and ground PBR materials
- one basic enemy or sparring character
- locomotion animation pack
- basic sword/bow animation pack
- NPC idle/talk animation pack

Do not start the playable Ayodhya milestone with only geometry primitives. If the right assets are not sourced yet, the first task is asset sourcing, not gameplay code.

## Assumptions

- "tree.js" means Three.js.
- The game should prioritize great browser-quality stylized 3D graphics over placeholder-speed prototyping.
- Curated GLB asset packs are the default visual path for the first playable version.
- Custom hero and environment art can come later, but Rama/Hanuman/Ravana should eventually become custom or heavily customized.
- The current prototype is fully disposable except for the concept that cutscenes are important.
- The project can use free, CC0, Creative Commons, and paid marketplace assets only when their license terms support the intended game use.
