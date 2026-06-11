# Ramayana — Three.js Rewrite: Status & Next Steps

Last updated: 2026-06-06
Branch: `claude/threejs-rewrite`

This is the handoff doc for the **ground-up Three.js rewrite**. It supersedes the
previous AAA-track progress log (the old track lives on `master`; its docs remain
under `docs/superpowers/` for reference but are **paused** — do not work from them
on this branch).

## What This Build Is

A single continuous 3D world telling the Ramayana in six playable chapters, with
cinematic cutscenes between them. No bundler, no build step: ES modules + an
importmap, Three.js from `node_modules`, served by `dev_server.py`.

```
index.html / style.css      title screen, letterbox, subtitles, HUD, splash, end screens
src/main.js                 boot + boot-error surface
src/core/renderer.js        WebGL renderer (ACES, shadows, fallback attempts)
src/core/input.js           keyboard + pointer-lock mouse + drag fallback + wheel
src/core/collision.js       AABB slide-along-walls collision
src/core/save.js            localStorage (key: ramayana-rewrite-v1, saves chapter index)
src/game/game.js            orchestrator: title → cutscene → play → end states
src/game/world.js           Ayodhya / forest / Kishkindha / Lanka in one map
src/game/cutscene.js        cinematic player: camera tracks, letterbox, timed subtitles
src/game/story.js           6 chapters + ending (cutscene shots, missions, dialogue)
src/game/player.js          third-person Rama + follow camera
src/game/enemy.js           rakshasa / guard / brute / ravana archetypes
src/game/combat.js          sword cone, bow + arrows, ravana orbs
src/game/hud.js             chapter card, health bar, toasts, chapter splash
```

## Done So Far

- [x] World: one continuous map — Ayodhya sandstone city (west, with eastern gate),
      Dandaka forest + exile camp (center), Kishkindha rock fields (east),
      Lanka fortress + Ravana's palace (far east), backdrop hills + sea
- [x] Cinematic cutscene system: authored camera shots flown through the live world,
      letterbox bars, timed speaker/subtitle lines, Enter = next line / Esc = skip
- [x] Story: 6 chapters, each with intro cutscene + mission + completion line
      (Exile Road → Forest of Demons → The Abduction → Kishkindha → Gates of Lanka
      → The Last Court), plus a 2-shot Diwali ending sequence
- [x] Third-person player: WASD/arrows, sprint, dodge (with i-frames), pointer-lock
      mouse look with drag fallback, wheel zoom, over-shoulder zoom while aiming
- [x] Combat: sword cone attack (LMB), bow aim (hold RMB) + arrows (LMB while aiming),
      enemy melee, Ravana ranged orbs
- [x] Enemies: 4 archetypes with pursuit AI, hit-flash, horns on demons
- [x] Mission loop: travel to marker → combat wave → chapter complete → next cutscene
- [x] HUD: chapter/objective card, health bar, enemy counter, toasts, chapter splash
      titles, crosshair in aim mode
- [x] Title screen with keyboard navigation, How To Play panel, Continue (saved
      chapter index), death/retry and victory/end screens
- [x] All files pass `node --check`

## NOT Yet Verified

**No browser smoke test has been run** — this was authored in a remote container
without WebGL. First local run should check:

1. Boot → title screen renders over a drifting view of Ayodhya
2. New Journey → prologue cutscene plays (camera pans over the palace, letterbox
   on, lines advance on Enter, Esc skips)
3. Chapter splash appears, player can walk/sprint/dodge, camera follows
4. Walking into the gate marker completes chapter 1 → chapter 2 cutscene plays
5. Forest chapter: enemies spawn at the clearing, sword/bow kill them, chapter advances
6. Death → retry screen; full run → ending cutscene → victory screen
7. Reload mid-game → Continue resumes at the saved chapter

## Next Steps (in order)

1. **Browser smoke test** the full chapter flow (list above); fix whatever breaks.
2. **Pause menu** (Esc during play): resume / restart chapter / quit to title.
3. **Audio**: ambient track per district, sword/bow/hit effects, cutscene sting.
   (Web Audio, no assets in repo yet — source CC0.)
4. **The chariot**: drivable royal chariot for the Exile Road chapter (port the
   old vehicle controller concept: enter/exit with F, throttle/steer physics).
5. **Cutscene polish**: fade-in/out between shots, slow dolly ease per shot type,
   skippable per-line typewriter effect.
6. **Sita/Lakshmana companion actors**: static NPCs at the camp + in cutscenes so
   the abduction beat lands visually (a hut that empties).
7. **Boss fight beats**: Ravana phases (orb volleys, summon adds at HP thresholds).
8. **GLTF upgrade path**: swap primitive Rama/enemies for rigged CC0 GLBs
   (the old AAA-track docs under `docs/superpowers/` cover asset sourcing).
9. **Performance pass**: merge static world geometry, cap shadow casters.

## How To Run

```bash
npm install        # one-time: pulls three into node_modules
npm start          # python3 dev_server.py → http://localhost:8000
```
