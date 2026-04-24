# Ramayana: Third-Person Prototype

This repo now boots into a new Three.js-based third-person action prototype instead of the older 2D canvas campaign runtime.

The active build is a stylized 3D Ramayana game shell with:

- a title screen with `New Game`, `Load Game`, `Settings`, and `Exit`
- an intro dialogue sequence before gameplay begins
- over-the-shoulder third-person camera
- on-foot sword and bow combat
- a drivable royal chariot
- open district traversal across Ayodhya, the forest, Kishkindha, and Lanka
- mission markers, enemy encounters, radar, settings, and autosave

## Run

Serve the repo root locally:

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

Important:

- The active entry point is [index.html](/Users/shashank/workspace/ramayana-game/index.html).
- Use the no-cache dev server in [dev_server.py](/Users/shashank/workspace/ramayana-game/dev_server.py), not `python3 -m http.server`, so stale frontend assets do not get served back to the browser.
- The runtime now loads Three.js from local `node_modules`, not from `unpkg`.

## Controls

| Input | Action |
|------|--------|
| Click in viewport | Capture the camera |
| `WASD` or arrow keys | Move |
| `Shift` | Sprint |
| `Space` | Dodge |
| `F` | Enter / exit royal chariot |
| `LMB` | Sword attack |
| Hold `RMB` | Aim |
| `LMB` while aiming / `K` | Fire bow |
| `Q` / `E` | Orbit camera fallback |
| Mouse wheel | Zoom |
| `Enter` / `Space` | Advance dialogue / menu confirm |

## Active Files

- App shell: [index.html](/Users/shashank/workspace/ramayana-game/index.html)
- HUD / layout: [style.css](/Users/shashank/workspace/ramayana-game/style.css)
- Bootstrap loader: [src/bootstrap.js](/Users/shashank/workspace/ramayana-game/src/bootstrap.js)
- 3D runtime: [src/app3d.js](/Users/shashank/workspace/ramayana-game/src/app3d.js)

## Legacy Runtime

The older canvas-based files still exist in `src/`, including [src/game.js](/Users/shashank/workspace/ramayana-game/src/game.js), [src/room.js](/Users/shashank/workspace/ramayana-game/src/room.js), and [src/chapters.js](/Users/shashank/workspace/ramayana-game/src/chapters.js), but they are no longer the active browser entry path.

## Technical Docs

- Architecture: [docs/ARCHITECTURE.md](/Users/shashank/workspace/ramayana-game/docs/ARCHITECTURE.md)
- Progress handoff: [docs/IMPLEMENTATION_PROGRESS.md](/Users/shashank/workspace/ramayana-game/docs/IMPLEMENTATION_PROGRESS.md)
- Product roadmap: [RAMAYANA_GAME_ROADMAP.md](/Users/shashank/workspace/ramayana-game/RAMAYANA_GAME_ROADMAP.md)

## License

MIT
