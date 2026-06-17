# Ramayana ARPG — Diablo 4-style Rebuild Plan

## Context

The previous build was a third-person/low-poly exploration prototype whose first-minute UX was poor (stacked cutscenes that locked control, no onboarding, enemies ambushing at spawn, unresponsive camera-relative movement). The decision is to **discard it entirely and rebuild from scratch** as a **Diablo 4-style isometric action RPG** set in the Ramayana: play as Rama fighting hordes of rakshasas with divine abilities, in a dark-mythic tone.

The old game code, assets, and design docs are intentionally thrown away. Git history preserves the old work (commit `74cc29a`); nothing needs to be migrated. This plan is the only design artifact going forward.

Locked decisions:
- **Genre/feel:** isometric ARPG, dark-mythic Ramayana.
- **Controls:** WASD movement + mouse-aim. Left-click basic attack toward the cursor; skills on `1`–`4` and right-click; immediate, twin-stick-like feel (no click-to-move pathfinding).
- **v1 scope:** one polished arena combat slice — single zone, Rama as the only hero, 3–4 abilities, waves of rakshasas plus one boss, health/XP, floating damage numbers, death/respawn. No loot tables, skill trees, or multiple zones in v1.
- **Theme:** Ramayana (Rama vs rakshasas, divine weapons), Diablo's genre and gritty presentation.

The guiding rule: **the first 30 seconds must be fun.** You click Play and within seconds you are moving and fighting. No forced cutscenes, no control locks, no onboarding wall.

## Tech Stack (reused toolchain, new game)

- Vite + TypeScript + Three.js (`WebGLRenderer`), Rapier (`@dimforge/rapier3d-compat`) for movement, hit volumes, and AoE queries. These deps and the build config are already present and stay.
- Drop the pixelation post pipeline. The ARPG look is **dark-mythic**: ACES tone mapping, bloom, vignette, atmospheric fog, dramatic key/rim lighting, ember particles — not pixelated, not warm-cozy.
- Reuse the CC0 GLB character approach (load + recolor + clone per entity) for the hero and enemies; isometric distance hides detail, so low-poly reads well.

## Camera & Controls

- **Camera:** fixed isometric framing — high pitch (~50°), follows the hero from above with a small look-ahead toward the cursor. Optional slight rotate later; v1 is fixed angle. No collision-orbit complexity.
- **Movement:** WASD in screen/world space (not camera-relative-confusing), Rapier kinematic character controller, snappy acceleration. The hero **faces the mouse cursor** at all times (aim).
- **Combat input:** left-click = basic attack toward cursor; `1`–`4` and right-click = abilities with cooldowns; `Space` = dash/dodge (i-frames). Holding left-click auto-repeats the basic attack.
- Everything is responsive from frame one. No state that silently disables input.

## Core Loop (v1 arena slice)

1. Title screen → **Play** → you spawn in the arena, immediately in control.
2. Move with WASD, aim with the mouse, kill rakshasas that spawn in waves.
3. Basic attack + 3–4 cooldown abilities (e.g. arrow volley, fire-arrow AoE, divine dash, ground slam). Kills grant XP; level-ups bump stats.
4. Enemies drop small health orbs (the only "loot" in v1).
5. After N waves, a **boss** (a rakshasa lord) spawns. Defeat it → victory screen.
6. Death → death screen → restart the arena. Fast retry loop.

## Architecture (simulation owns truth; Three.js objects are views)

- `engine`: renderer, isometric camera rig, lighting, post (bloom/vignette/fog), resize, fixed-timestep update + render loop.
- `physics`: Rapier world, hero kinematic controller, enemy bodies, melee/AoE/projectile hit queries.
- `input`: pointer + keyboard → an intent struct (moveDir, aimPoint, attack, skill1–4, dash).
- `game` (simulation, the tested core): hero state & stats, ability definitions + cooldowns, enemy AI (seek/attack), wave spawner, damage resolution, XP/leveling, health-orb pickups, run state machine (playing / dead / victory).
- `entities`: hero, rakshasa types, boss, projectiles, pickups — data + a thin view adapter binding to a Three.js object.
- `vfx`: hit sparks, ability effects, floating damage numbers, enemy death dissolve, screen shake.
- `ui`: HUD (health orb, skill bar with cooldown sweeps, XP bar, wave counter), title, death, victory screens.
- `assets`: GLB load + recolor + clone; audio (CC0).

Keep files small and single-purpose. Unit-test the `game` simulation (damage, cooldowns, wave/XP/level transitions, run-state). Renderer/feel stay under manual runtime review.

## Art Direction

- Dark-mythic: black/charcoal stone arena, warm ember and torch light, cool moonlit ambient, fog rolling at the edges, bloom on divine VFX and fire.
- Hero (Rama): recolored CC0 humanoid — saffron/gold with a divine-blue rim light, bow/sword. Reads as heroic against the dark ground.
- Rakshasas: recolored humanoids — ash-grey/black skin, red accents, horns (code-built), glowing eyes. Boss is larger with a distinct silhouette.
- VFX carry the game feel: readable telegraphs, punchy hit flashes, satisfying ability effects. Combat readability beats effect density.

## Build Milestones (Codex implements; each is runtime-verified before the next)

1. **Nuke + scaffold.** Delete all old game code, assets, and design docs (`src/**`, `assets/**` game content, `docs/art-progress.md`, `CREDITS.md`; keep `plan.md`, `package.json`/lockfile, `tsconfig.json`, `vite.config.ts`, `index.html` shell, `.git`). Fresh app: isometric camera, dark-lit ground plane, one placeholder hero, render loop, title→Play→arena flow. Acceptance: boots to a dark arena with the hero visible, no console errors.
2. **Hero control & feel.** WASD movement via Rapier kinematic controller, mouse-aim facing, camera follow, recolored GLB hero with idle/run animation, dash on Space. Acceptance: movement feels immediate and responsive; hero faces the cursor; camera tracks cleanly.
3. **Basic combat.** Left-click attack toward cursor, one chasing rakshasa, Rapier hit detection, floating damage numbers, enemy hit reaction + death. Acceptance: you can move and kill an enemy; hits feel responsive and readable.
4. **ARPG systems.** Health orb HUD + XP bar + level-ups, 3–4 abilities with cooldowns and a skill bar (icons + cooldown sweep), dash i-frames, death→death-screen→restart. Acceptance: full moment-to-moment ARPG HUD works; abilities fire on cooldown.
5. **Waves + boss + orbs.** Wave spawner with rising counts, health-orb drops, a boss fight after the final wave, victory screen. Acceptance: a full run is playable start→waves→boss→victory, and death→restart works.
6. **Feel & art pass.** Dark-mythic lighting, bloom/vignette/fog, ability + hit VFX, screen shake + knockback, enemy telegraphs, CC0 audio (music bed, hits, abilities, UI). Acceptance: looks and feels like a real ARPG slice; the first 30 seconds are fun.

## Verification

Per milestone, drive the running app (Playwright via the webapp-testing skill against `npm run dev` on a spare port): confirm input→movement→combat behavior, read HUD state, capture screenshots, confirm no console errors. The simulation gets Vitest unit tests (damage, cooldowns, waves, XP). The bar for "done" is runtime behavior, not just typecheck/build.

## Assumptions

- Ramayana theme is retained; only the genre/feel changes to Diablo-style ARPG.
- CC0 assets only (characters, audio); attribution in a regenerated `CREDITS.md`.
- Desktop browser, keyboard + mouse; mobile/touch out of scope for v1.
- Loot tables, skill trees, multiple zones, and additional heroes are explicitly post-v1.
