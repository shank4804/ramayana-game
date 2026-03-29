# Ramayana

A pixel-art top-down action game where you play as **Rama**, the legendary hero of the Indian epic.

## Play

Open `index.html` in any modern browser. No build step required.

Or serve locally:
```bash
npx serve . -p 3000
```

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move Rama |
| Space / Left Click | Shoot arrow (aim with mouse) |
| P | Pause |
| Enter / Space | Start / Continue |

## Levels

1. **Dandaka Forest** — Navigate the forest and defeat the Rakshasas
2. **Lanka Gates** — Fight through Ravana's guards at the demon city walls
3. **Ravana's Palace** — Boss fight against the ten-headed king of Lanka

## Features

- Pixel-art sprites rendered via Canvas 2D
- Tile-based world with BFS pathfinding
- Character state machines (idle / walk / shoot / patrol / chase)
- 3 enemy types: Rakshasa, Guard, Ravana (boss with fireballs)
- Health pickups, speech bubbles, score tracking
- Fade transitions between levels and screens

## License

MIT
