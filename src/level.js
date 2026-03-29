// ─────────────────────────────────────────────────────────────────────────────
// Level data — 3 levels:  Dandaka Forest → Lanka Gates → Ravana's Palace
// Tile map uses T_* constants; entities stored as spawn descriptors.
// ─────────────────────────────────────────────────────────────────────────────

// Helper: build flat tile array from a string map
// Characters: '.' floor  '#' tree  '~' water  'W' wall  'B' brick
//             'P' palace 'L' pillar
function parseMap(str) {
  const lines = str.trim().split('\n').map(l => l.trimEnd());
  const rows  = lines.length;
  const cols  = Math.max(...lines.map(l => l.length));
  const data  = [];
  for (let r = 0; r < rows; r++) {
    const line = lines[r].padEnd(cols, '#');
    for (let c = 0; c < cols; c++) {
      switch (line[c]) {
        case '.': data.push(T_FLOOR);  break;
        case '~': data.push(T_WATER);  break;
        case '#': data.push(T_TREE);   break;
        case 'W': data.push(T_WALL);   break;
        case 'B': data.push(T_BRICK);  break;
        case 'P': data.push(T_PALACE); break;
        case 'L': data.push(T_PILLAR); break;
        default:  data.push(T_FLOOR);  break;
      }
    }
  }
  return { data, cols, rows };
}

// ─── Level 1: Dandaka Forest ───────────────────────────────────────────────
const MAP1_STR = `
################
#..............#
#.##.####.##...#
#..........##..#
#.####.##......#
#......##.###..#
#.###.........#.#
#.....####.##..#
#.##..#....##..#
#....##.##.....#
#.##.....####..#
#################
`.trim();

// ─── Level 2: Lanka Gates ──────────────────────────────────────────────────
const MAP2_STR = `
BBBBBBBBBBBBBBBB
B..............B
B.BBBB.BBB.BBB.B
B..............B
B.B..BBB.B.BB..B
B..............B
B.BBB.B..BBB...B
B..............B
B.BB.BBB.B.BB..B
B..............B
B.BBBB.B.BBB...B
BBBBBBBBBBBBBBBB
`.trim();

// ─── Level 3: Ravana's Palace ──────────────────────────────────────────────
const MAP3_STR = `
PPPPPPPPPPPPPPPP
P..............P
P.L..PPP.PPP.L.P
P..............P
P.PPP.L.L.PPP..P
P..............P
P.L.PPP.PPP.L..P
P..............P
P.PPP.L.L.PPP..P
P..............P
P.L.........L..P
PPPPPPPPPPPPPPPP
`.trim();

// ─── Level definitions ─────────────────────────────────────────────────────

const LEVELS = [
  // ── Level 1 ──────────────────────────────────────────────────────────────
  {
    name: 'Dandaka Forest',
    subtitle: 'The Forest Exile',
    mapStr: MAP1_STR,
    bgColor: '#0a1205',
    ambientText: 'The demon Rakshasas haunt these woods...',
    playerStart: { col: 1, row: 1 },
    enemies: [
      { type: 'rakshasa', col: 7,  row: 3  },
      { type: 'rakshasa', col: 12, row: 6  },
      { type: 'rakshasa', col: 4,  row: 8  },
      { type: 'rakshasa', col: 10, row: 9  },
      { type: 'rakshasa', col: 14, row: 2  },
    ],
    lotus: [
      { col: 6, row: 1 },
      { col: 13, row: 10 },
    ],
    exitCol: 14, exitRow: 10,
  },

  // ── Level 2 ──────────────────────────────────────────────────────────────
  {
    name: 'Lanka Gates',
    subtitle: 'The Demon City',
    mapStr: MAP2_STR,
    bgColor: '#0a0500',
    ambientText: 'Ravana\'s guards stand at every gate...',
    playerStart: { col: 1, row: 1 },
    enemies: [
      { type: 'guard', col: 5,  row: 2  },
      { type: 'guard', col: 10, row: 2  },
      { type: 'guard', col: 3,  row: 5  },
      { type: 'guard', col: 8,  row: 5  },
      { type: 'guard', col: 13, row: 5  },
      { type: 'guard', col: 5,  row: 8  },
      { type: 'guard', col: 11, row: 8  },
      { type: 'guard', col: 14, row: 10 },
    ],
    lotus: [
      { col: 7,  row: 3  },
      { col: 13, row: 7  },
    ],
    exitCol: 14, exitRow: 10,
  },

  // ── Level 3 ──────────────────────────────────────────────────────────────
  {
    name: "Ravana's Palace",
    subtitle: 'The Final Battle',
    mapStr: MAP3_STR,
    bgColor: '#05050f',
    ambientText: 'Ravana — the ten-headed king of Lanka!',
    playerStart: { col: 1, row: 1 },
    enemies: [
      { type: 'rakshasa', col: 6,  row: 2  },
      { type: 'rakshasa', col: 10, row: 2  },
      { type: 'rakshasa', col: 3,  row: 9  },
      { type: 'rakshasa', col: 13, row: 9  },
      { type: 'ravana',   col: 8,  row: 6  },
    ],
    lotus: [
      { col: 7,  row: 1  },
      { col: 8,  row: 10 },
    ],
    exitCol: -1, exitRow: -1, // no exit — defeat Ravana to win
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Level instance — active game state for one level
// ─────────────────────────────────────────────────────────────────────────────

class Level {
  constructor(index) {
    const def = LEVELS[index];
    this.index    = index;
    this.def      = def;
    this.isLast   = index === LEVELS.length - 1;

    const { data, cols, rows } = parseMap(def.mapStr);
    this.tilemap  = new TileMap(cols, rows, data);

    // Spawn player
    const ps = tilemap_centerOf(this.tilemap, def.playerStart.col, def.playerStart.row);
    this.player = new Player(ps.x, ps.y);

    // Spawn enemies
    this.enemies = def.enemies.map(e => {
      const ep = tilemap_centerOf(this.tilemap, e.col, e.row);
      return new Enemy(ep.x, ep.y, e.type);
    });

    // Lotus pickups
    this.lotuses = def.lotus.map(l => ({
      col: l.col, row: l.row,
      ...tilemap_centerOf(this.tilemap, l.col, l.row),
      picked: false,
    }));

    // Ambient message timer
    this.ambientTimer = 3.0;
    this.showAmbient  = true;

    // Exit portal (animated)
    this.exitCol = def.exitCol;
    this.exitRow = def.exitRow;
    this.exitOpen = false;  // opens once all enemies dead
    this.exitAnim = 0;

    this.complete = false;
    this.frame    = 0;  // global animation frame counter (ticks every update)
  }

  update(dt) {
    this.frame++;
    this.ambientTimer = Math.max(0, this.ambientTimer - dt);
    if (this.ambientTimer <= 0) this.showAmbient = false;
    this.exitAnim += dt;

    // Update player
    this.player.update(dt, this.tilemap);

    // Update enemies
    this.enemies.forEach(e => e.update(dt, this.tilemap, this.player));
    this.enemies = this.enemies.filter(e => !e.dead);

    // Arrow → enemy collision
    this.player.arrows.forEach(arrow => {
      this.enemies.forEach(enemy => {
        if (arrow.dead || enemy.dead) return;
        const dx = arrow.x - enemy.x;
        const dy = arrow.y - enemy.y;
        const r  = (enemy.type === 'ravana' ? 20 : 12) * SCALE;
        if (dx * dx + dy * dy < r * r) {
          enemy.takeDamage(arrow.damage);
          arrow.dead = true;
        }
      });
    });

    // Ravana fireball → player collision
    this.enemies.forEach(e => {
      if (e.type !== 'ravana') return;
      e.fireballs.forEach(fb => {
        if (fb.dead) return;
        const dx = fb.x - this.player.x;
        const dy = fb.y - this.player.y;
        const r  = 10 * SCALE;
        if (dx * dx + dy * dy < r * r) {
          this.player.takeDamage(fb.damage);
          fb.dead = true;
        }
      });
    });

    // Lotus pickup
    this.lotuses.forEach(l => {
      if (l.picked) return;
      const dx = this.player.x - l.x;
      const dy = this.player.y - l.y;
      if (dx * dx + dy * dy < (12 * SCALE) ** 2) {
        l.picked = true;
        this.player.heal(1);
      }
    });

    // Exit logic
    const allDead = this.enemies.length === 0;
    this.exitOpen = allDead;

    if (allDead) {
      if (this.isLast) {
        // Win on Ravana death
        this.complete = true;
      } else if (this.exitCol >= 0) {
        // Walk to exit portal
        const ex = this.tilemap.tileCenterPx(this.exitCol, this.exitRow);
        const dx = this.player.x - ex.x;
        const dy = this.player.y - ex.y;
        if (dx * dx + dy * dy < (TILE * 0.7) ** 2) {
          this.complete = true;
        }
      }
    }
  }

  draw(ctx) {
    // Tilemap
    this.tilemap.draw(ctx, this.frame);

    // Exit portal
    if (this.exitCol >= 0) this._drawExit(ctx);

    // Lotuses
    this.lotuses.forEach(l => {
      if (l.picked) return;
      ctx.save();
      ctx.translate(l.x, l.y);
      drawLotus(ctx, this.frame);
      ctx.restore();
    });

    // Enemies (sorted by Y so lower = in front, like pixel-agents)
    const drawables = [this.player, ...this.enemies].sort((a, b) => a.y - b.y);
    drawables.forEach(e => e.draw(ctx));

    // Ambient message
    if (this.showAmbient) this._drawAmbient(ctx);
  }

  _drawExit(ctx) {
    const { x, y } = this.tilemap.tileCenterPx(this.exitCol, this.exitRow);
    const pulse = 0.6 + Math.sin(this.exitAnim * 3) * 0.4;
    const r     = TILE * 0.45;

    if (this.exitOpen) {
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.shadowColor = C.GOLD_B;
      ctx.shadowBlur  = 20;
      // Glow ring
      ctx.strokeStyle = C.GOLD_B;
      ctx.lineWidth   = 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = C.GOLD;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      // Arrow indicator
      ctx.fillStyle = C.GOLD_B;
      ctx.font = `bold ${TILE * 0.5}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▶', x, y);
      ctx.restore();
    } else {
      // Locked
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawAmbient(ctx) {
    const alpha = Math.min(1, this.ambientTimer / 0.5);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, CANVAS_H * 0.7, CANVAS_W, 44);
    ctx.fillStyle   = C.GOLD;
    ctx.font        = `italic bold 14px serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.def.ambientText, CANVAS_W / 2, CANVAS_H * 0.7 + 22);
    ctx.restore();
  }
}

// Helper: tile center in canvas pixels
function tilemap_centerOf(tilemap, col, row) {
  return tilemap.tileCenterPx(col, row);
}

function getLevelCount() { return LEVELS.length; }
